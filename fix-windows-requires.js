'use strict';
/**
 * Fix deep-import patches that left Windows backslashes in require() paths.
 * This scans Expo CLI + @expo/metro-config built JS files and:
 *   1) Collapses accidental doubled quotes in require calls.
 *   2) Rewrites require("C:\\...\\metro\\src\\...") to forward slashes.
 *   3) Rewrites require('metro/src/...') to an absolute path into your local
 *      metro package using forward slashes, which avoids package exports issues.
 *
 * Safe to re-run. Creates a .bak of any file it modifies (only once).
 */
const fs = require('fs');
const path = require('path');

function ensureForwardSlash(p) {
  return p.replace(/\\/g, '/');
}

function normalizeRequireWindowsPaths(file) {
  if (!fs.existsSync(file)) return false;
  let src = fs.readFileSync(file, 'utf8');
  const before = src;

  // 1) Collapse accidental doubled quotes introduced by earlier manual edits.
  src = src.replace(/require\(\"\"/g, 'require("');
  src = src.replace(/require\('\'/g, "require('\'");

  // 2) Replace require("C:\\...") or require('C:\\...') with forward slashes.
  src = src.replace(/require\((["'])([A-Za-z]:\\[^"'()]+)\1\)/g, (m, q, winPath) => {
    const fixed = ensureForwardSlash(winPath);
    return `require(${q}${fixed}${q})`;
  });

  // 3) Replace any deep import require('metro/src/...') with absolute path.
  const metroDir = ensureForwardSlash(path.dirname(require.resolve('metro/package.json')));
  src = src.replace(/require\((["'])metro\/src\/([^"'()]+)\1\)/g, (m, q, sub) => {
    const abs = `${metroDir}/src/${sub}`;
    return `require(${q}${abs}${q})`;
  });

  if (src !== before) {
    const bak = file + '.bak';
    try { if (!fs.existsSync(bak)) fs.copyFileSync(file, bak); } catch (_) {}
    fs.writeFileSync(file, src, 'utf8');
    return true;
  }
  return false;
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p, out); else if (p.endsWith('.js')) out.push(p);
  }
  return out;
}

(function main() {
  const expoCliDir = path.dirname(require.resolve('@expo/cli/package.json'));
  const expoMetroConfigDir = path.dirname(require.resolve('@expo/metro-config/package.json'));

  const targets = [
    path.join(expoCliDir, 'build', 'src', 'start', 'server', 'metro'),
    path.join(expoMetroConfigDir, 'build', 'serializer'),
  ];

  let scanned = 0, patched = 0;
  for (const root of targets) {
    if (!fs.existsSync(root)) continue;
    for (const file of walk(root)) {
      scanned++;
      if (normalizeRequireWindowsPaths(file)) patched++;
    }
  }

  console.log('✔ Metro dir:', path.dirname(require.resolve('metro/package.json')));
  console.log('Scanned JS files:', scanned);
  console.log('Patched files:', patched);
})();
