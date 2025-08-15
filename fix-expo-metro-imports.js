// Fixes broken/quoted Metro deep imports inside @expo/* build output
// - Rewrites any require("metro/src/...") to an absolute file path
// - Also cleans accidental doubled quotes like require("")
// Run with: `node fix-expo-metro-imports.js`

const fs = require('fs');
const path = require('path');

function log(msg, ...rest) {
  console.log(`[fix] ${msg}`, ...rest);
}

function toPosix(p) {
  return p.replace(/\\/g, '/');
}

// Compute absolute Metro source file paths that Expo tries to import
const metroDir = path.dirname(require.resolve('metro/package.json'));
const targets = {
  terminalReporter: toPosix(path.join(metroDir, 'src', 'lib', 'TerminalReporter.js')),
  sourceMapString: toPosix(path.join(metroDir, 'src', 'DeltaBundler', 'Serializers', 'sourceMapString.js')),
  bundleToString: toPosix(path.join(metroDir, 'src', 'lib', 'bundleToString.js')),
  importLocationsPlugin: toPosix(path.join(metroDir, 'src', 'ModuleGraph', 'worker', 'importLocationsPlugin.js')),
};

// Files we know can reference those deep imports inside @expo/*
const files = [
  // Expo CLI reporters
  {
    file: require.resolve('@expo/cli/build/src/start/server/metro/TerminalReporter.js'),
    replaces: [
      {
        name: 'TerminalReporter',
        needle: /require\(["']metro\/src\/lib\/TerminalReporter["']\)/g,
        value: `require("${targets.terminalReporter}")`,
      },
    ],
  },
  // Expo Metro config serializers
  {
    file: require.resolve('@expo/metro-config/build/serializer/withExpoSerializers.js'),
    replaces: [
      {
        name: 'sourceMapString',
        needle:
          /require\((?:""|"|')?[^\)\n]*DeltaBundler\/Serializers\/sourceMapString(?:\.js)?(?:""|"|')?\)/g,
        value: `require("${targets.sourceMapString}")`,
      },
      {
        name: 'bundleToString',
        needle: /require\((?:""|"|')?[^\)\n]*lib\/bundleToString(?:\.js)?(?:""|"|')?\)/g,
        value: `require("${targets.bundleToString}")`,
      },
    ],
  },
  {
    file: require.resolve('@expo/metro-config/build/serializer/reconcileTransformSerializerPlugin.js'),
    replaces: [
      {
        name: 'importLocationsPlugin',
        needle:
          /require\((?:""|"|')?[^\)\n]*ModuleGraph\/worker\/importLocationsPlugin(?:\.js)?(?:""|"|')?\)/g,
        value: `require("${targets.importLocationsPlugin}")`,
      },
    ],
  },
];

function patchFile(p) {
  let before = fs.readFileSync(p.file, 'utf8');
  let after = before;

  // Generic cleanup of doubled quotes inside require(""C:/...") → require("C:/...")
  after = after.replace(/require\(\"\"/g, 'require("');
  after = after.replace(/\"\"\)/g, '" )'); // safe-ish fallback
  after = after.replace(/\"\"\)/g, '" )');
  after = after.replace(/\"\"\)/g, '")'); // tighten

  for (const r of p.replaces) {
    const countBefore = (after.match(r.needle) || []).length;
    after = after.replace(r.needle, r.value);
    const countAfter = (after.match(r.needle) || []).length;
    log(`${path.basename(p.file)} :: ${r.name}  replaced: ${countBefore > 0 ? countBefore : 0}`);
  }

  if (after !== before) {
    fs.copyFileSync(p.file, p.file + '.bak');
    fs.writeFileSync(p.file, after, 'utf8');
    log(`patched ${p.file}`);
  } else {
    log(`no changes needed for ${p.file}`);
  }
}

try {
  log('metroDir =', metroDir);
  for (const f of files) patchFile(f);
  log('Done. Try starting Expo again.');
} catch (e) {
  console.error('[fix] failed:', e && e.message || e);
  process.exit(1);
}
