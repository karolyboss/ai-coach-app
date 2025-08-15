const fs = require('fs');
const path = require('path');

const pkgPath = require.resolve('metro/package.json');
const root = path.dirname(pkgPath);

function firstExisting(rel){
  const exts = ['.js','.cjs','.mjs','.ts'];
  for (const ext of exts){
    const p = path.join(root, rel + ext);
    if (fs.existsSync(p)) return './' + rel.replace(/\\/g,'/') + ext;
  }
  return null;
}

// Add the currently-missing export + a few other common ones so you can re-run safely
const additions = {
  './src/lib/CountingSet': 'src/lib/CountingSet',               // <- your error
  './src/lib/TerminalReporter': 'src/lib/TerminalReporter',
  './src/ModuleGraph/worker/importLocationsPlugin': 'src/ModuleGraph/worker/importLocationsPlugin',
  './src/lib/bundleToString': 'src/lib/bundleToString',
  './src/DeltaBundler/Serializers/sourceMapString': 'src/DeltaBundler/Serializers/sourceMapString',
  './src/DeltaBundler/Serializers/getExplodedSourceMap': 'src/DeltaBundler/Serializers/getExplodedSourceMap'
};

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.exports = pkg.exports || {};
let touched = 0;
for (const [key, rel] of Object.entries(additions)){
  if (!pkg.exports[key]){
    const target = firstExisting(rel);
    if (target){ pkg.exports[key] = target; touched++; }
  }
}
if (touched){
  fs.copyFileSync(pkgPath, pkgPath + '.bak');
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log('Patched', pkgPath, '— added', touched, 'export(s).');
} else {
  console.log('No changes needed — entries already present.');
}
