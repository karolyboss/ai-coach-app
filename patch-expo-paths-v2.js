// Save this file as: patch-expo-paths-v2.js (project root)
// Then run: node .\\patch-expo-paths-v2.js
// Purpose: Replace any `require('metro/src/...')` or `from 'metro/src/...'` with
// absolute file paths from your installed Metro — WITHOUT breaking quotes.

const fs = require('fs');
const path = require('path');

function log(msg) { console.log('[patch-expo-paths]', msg); }
function exists(p) { try { return fs.existsSync(p); } catch { return false; } }
function read(p) { return fs.readFileSync(p, 'utf8'); }
function write(p, s) { fs.writeFileSync(p, s); }
function backup(p) { if (!exists(p + '.bak')) fs.copyFileSync(p, p + '.bak'); }
function escapeForJs(str) { return str.replace(/\\/g, '/').replace(/'/g, "\\'"); }

// Resolve metro dir
const metroPkg = require.resolve('metro/package.json');
const METRO_DIR = path.dirname(metroPkg);
log('metroDir = ' + METRO_DIR);

// Files to patch where Expo reaches into metro/src/*
const TARGETS = [
  // Expo CLI runtime
  '@expo/cli/build/src/start/server/metro/TerminalReporter.js',
  '@expo/cli/build/src/start/server/metro/MetroTerminalReporter.js',
  '@expo/cli/build/src/start/server/metro/instantiateMetro.js',

  // Expo metro-config runtime
  '@expo/metro-config/build/ExpoMetroConfig.js',
  '@expo/metro-config/build/serializer/withExpoSerializers.js',
  '@expo/metro-config/build/serializer/reconcileTransformSerializerPlugin.js',
  '@expo/metro-config/build/transform-worker/metro-transform-worker.js',
];

function resolveMetroSrc(rel) {
  // rel like: 'lib/TerminalReporter' or 'DeltaBundler/Serializers/sourceMapString'
  const candidates = [rel + '.js', rel + '.cjs', rel + '.mjs', rel];
  for (const c of candidates) {
    const abs = path.join(METRO_DIR, 'src', c);
    if (exists(abs)) return abs;
  }
  return null;
}

function patchFileRequireStrings(fileAbs) {
  let src = read(fileAbs);
  let changed = false;

  // 1) require('metro/src/...') → require('C:/abs')
  src = src.replace(/require\((['"])metro\/src\/([^'"\)]+)\1\)/g, (m, q, rel) => {
    const clean = rel.replace(/\.(js|cjs|mjs)$/i, '');
    const abs = resolveMetroSrc(clean);
    if (!abs) return m; // leave untouched if not found
    changed = true;
    return `require('${escapeForJs(abs)}')`;
  });

  // 2) from 'metro/src/...' → from 'C:/abs'
  src = src.replace(/from\s+(['"])metro\/src\/([^'";]+)\1/g, (m, q, rel) => {
    const clean = rel.replace(/\.(js|cjs|mjs)$/i, '');
    const abs = resolveMetroSrc(clean);
    if (!abs) return m;
    changed = true;
    return `from '${escapeForJs(abs)}'`;
  });

  if (changed) {
    backup(fileAbs);
    write(fileAbs, src);
    log('Patched: ' + fileAbs);
  } else {
    log('No metro/src references found in: ' + fileAbs);
  }
}

function tryPatch(rel) {
  const abs = path.join(process.cwd(), 'node_modules', rel);
  if (exists(abs)) {
    patchFileRequireStrings(abs);
  } else {
    log('Skip (missing): ' + rel);
  }
}

for (const t of TARGETS) tryPatch(t);

log('Done. Now run:');
log('  node .\\node_modules\\@expo\\cli\\build\\bin\\cli start --clear');
