const fs = require('fs');
const path = require('path');

function toPosix(p){ return p.replace(/\\/g,'/'); }
function patchFile(file, replacements){
  if (!fs.existsSync(file)) { console.log('skip (missing):', file); return; }
  const src = fs.readFileSync(file,'utf8');
  let out = src; let changed = false;
  for (const [from,to] of replacements){
    const re = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g');
    const next = out.replace(re, to);
    if (next !== out) { changed = true; out = next; console.log('  •', from, '=>', to); }
  }
  if (changed){ fs.copyFileSync(file, file + '.bak'); fs.writeFileSync(file, out); console.log('✔ Patched', file); }
  else { console.log('• No changes needed in', file); }
}

try {
  const metroPkg = require.resolve('metro/package.json');
  const metroDir = path.dirname(metroPkg);
  const paths = {
    term:                path.join(metroDir, 'src','lib','TerminalReporter.js'),
    importLocations:     path.join(metroDir, 'src','ModuleGraph','worker','importLocationsPlugin.js'),
    bundleToString:      path.join(metroDir, 'src','lib','bundleToString.js'),
    countingSet:         path.join(metroDir, 'src','lib','CountingSet.js'),
    sourceMapString:     path.join(metroDir, 'src','DeltaBundler','Serializers','sourceMapString.js'),
  };
  console.log('metroDir =', metroDir);
  for (const [k,p] of Object.entries(paths)) console.log('  -', k, fs.existsSync(p)?'OK':'MISSING', toPosix(p));

  // A) @expo/cli TerminalReporter import
  const expoTR = require.resolve('@expo/cli/build/src/start/server/metro/TerminalReporter.js');
  patchFile(expoTR, [[
    'metro/src/lib/TerminalReporter', JSON.stringify(toPosix(paths.term))
  ]]);

  // B) @expo/metro-config reconcile serializer (importLocationsPlugin)
  const recon = require.resolve('@expo/metro-config/build/serializer/reconcileTransformSerializerPlugin.js');
  patchFile(recon, [[
    'metro/src/ModuleGraph/worker/importLocationsPlugin', JSON.stringify(toPosix(paths.importLocations))
  ]]);

  // C) @expo/metro-config withExpoSerializers (bundleToString, CountingSet, sourceMapString)
  const withSer = require.resolve('@expo/metro-config/build/serializer/withExpoSerializers.js');
  patchFile(withSer, [
    ['metro/src/lib/bundleToString', JSON.stringify(toPosix(paths.bundleToString))],
    ['metro/src/lib/CountingSet',    JSON.stringify(toPosix(paths.countingSet))],
    ['metro/src/DeltaBundler/Serializers/sourceMapString', JSON.stringify(toPosix(paths.sourceMapString))],
  ]);

  console.log('All patches applied.');
} catch (e) {
  console.error('❌ Patch failed:', e && e.message || e);
  process.exit(1);
}
