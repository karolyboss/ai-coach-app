// Run with:  node fix-expo-metro-deep-imports.js
// Purpose: Rewrite Expo's deep imports that point into "metro/src/..." to absolute files
//          (bypasses Metro's package.exports) and add a couple of missing exports used by Expo.

const fs = require('fs');
const path = require('path');

function esc(p) { return p.replace(/\\/g, '\\\\'); }

function mustResolve(id) {
  try { return require.resolve(id); }
  catch (e) {
    console.error('❌ Cannot resolve', id, '\n   Make sure you ran `npm install` first.');
    process.exit(1);
  }
}

const metroPkg = mustResolve('metro/package.json');
const metroDir = path.dirname(metroPkg);
const expoCliDir = path.dirname(mustResolve('@expo/cli/package.json'));
const expoMetroConfigDir = path.dirname(mustResolve('@expo/metro-config/package.json'));

// Resolve a Metro deep subpath like "lib/TerminalReporter" or "DeltaBundler/Serializers/sourceMapString"
function resolveMetroSub(sub) {
  const candidates = [
    path.join(metroDir, 'src', sub + '.js'),
    path.join(metroDir, 'src', sub),
    path.join(metroDir, sub + '.js'),
    path.join(metroDir, sub),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

// Replace any string literal 'metro/src/<sub>' or "metro/src/<sub>" with an absolute on-disk path (escaped)
function patchFile(file) {
  let s = fs.readFileSync(file, 'utf8');
  let changed = 0;
  s = s.replace(/(["'])metro\/src\/([^"']+)\1/g, (m, quote, sub) => {
    const abs = resolveMetroSub(sub);
    if (!abs) {
      // console.warn('• Skip (not found):', sub, 'in', file);
      return m;
    }
    changed++;
    return quote + esc(abs) + quote;
  });
  if (changed) fs.writeFileSync(file, s);
  return changed;
}

function filesUnder(dir) {
  const out = [];
  (function walk(d) {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      if (ent.name === 'node_modules') continue;
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (ent.isFile() && p.endsWith('.js')) out.push(p);
    }
  })(dir);
  return out;
}

let total = 0;

// Patch @expo/cli Metro integration files
const cliMetroDir = path.join(expoCliDir, 'build', 'src', 'start', 'server', 'metro');
if (fs.existsSync(cliMetroDir)) {
  for (const f of filesUnder(cliMetroDir)) total += patchFile(f);
}

// Patch @expo/metro-config compiled files
const emcBuild = path.join(expoMetroConfigDir, 'build');
if (fs.existsSync(emcBuild)) {
  for (const f of filesUnder(emcBuild)) total += patchFile(f);
}

// Also patch any stray uses in @expo/metro-config/src (rare)
const emcSrc = path.join(expoMetroConfigDir, 'src');
if (fs.existsSync(emcSrc)) {
  for (const f of filesUnder(emcSrc)) total += patchFile(f);
}

// Add missing metro-cache exports used by Expo
(function patchMetroCache() {
  const pkgPath = mustResolve('metro-cache/package.json');
  const dir = path.dirname(pkgPath);
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.exports = pkg.exports || {};
  const extras = [
    './src/stores/FileStore',
    './src/stores/HttpGetStore',
  ];
  let wrote = false;
  for (const key of extras) {
    const rel = key.replace(/^\.\//, '');
    if (fs.existsSync(path.join(dir, rel)) || fs.existsSync(path.join(dir, rel + '.js'))) {
      if (pkg.exports[key] !== key) { pkg.exports[key] = key; wrote = true; }
    }
  }
  if (wrote) fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
})();

// Add missing metro-transform-worker export used by Expo
(function patchMetroTransformWorker() {
  const pkgPath = mustResolve('metro-transform-worker/package.json');
  const dir = path.dirname(pkgPath);
  const key = './src/utils/getMinifier';
  const tgt = './src/utils/getMinifier.js';
  if (fs.existsSync(path.join(dir, tgt))) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    pkg.exports = pkg.exports || {};
    if (pkg.exports[key] !== tgt) {
      pkg.exports[key] = tgt;
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    }
  }
})();

console.log('✔ Metro dir:', metroDir);
console.log('✔ Patched deep imports:', total);
console.log('Now run:  node .\\node_modules\\@expo\\cli\\build\\bin\\cli start --clear');
