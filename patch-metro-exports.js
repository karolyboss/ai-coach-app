const fs = require('fs');
const path = require('path');

const pkgPath = require.resolve('metro/package.json');
const root = path.dirname(pkgPath);

function firstExisting(rel){
  const tryExt = ['.js','.cjs','.mjs','.ts'];
  for (const ext of tryExt){
    const p = path.join(root, rel + ext);
    if (fs.existsSync(p)) return './' + path.posix.join(rel.replace(/\\/g,'/')) + ext;
  }
  return null;
}

const additions = {
  './src/lib/TerminalReporter':                      'src/lib/TerminalReporter',
  './src/ModuleGraph/worker/importLocationsPlugin':  'src/ModuleGraph/worker/importLocationsPlugin',
  './src/lib/bundleToString':                        'src/lib/bundleToString',
  './src/DeltaBundler/Serializers/sourceMapString':  'src/DeltaBundler/Serializers/sourceMapString',
  './src/DeltaBundler/Serializers/getExplodedSourceMap': 'src/DeltaBundler/Serializers/getExplodedSourceMap'
};

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.exports = pkg.exports || {};
let touched = 0;
for (const [key, relNoExt] of Object.entries(additions)){
  if (!pkg.exports[key]){
    const target = firstExisting(relNoExt);
    if (target){ pkg.exports[key] = target; touched++; }
  }
}
if (touched){
  fs.copyFileSync(pkgPath, pkgPath + '.bak');
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log('Patched', pkgPath, '— added', touched, 'export(s).');
} else {
  console.log('No changes needed — exports already present.');
}
