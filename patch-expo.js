// patch-expo-paths.js
// Fix double-quoted require paths and map Expo -> Metro internal file paths safely.

const fs = require('fs');
const path = require('path');

function escReg(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function unix(p){return p.replace(/\\/g,'/')}
function backup(p){ try{ fs.copyFileSync(p, p + '.bak'); }catch{} }
function read(p){ return fs.readFileSync(p,'utf8'); }
function write(p,s){ fs.writeFileSync(p,s); }
function exists(p){ return fs.existsSync(p); }

function replaceImportLiteral(content, metroFrom, absoluteTo){
  // Replace '"metro/src/..."' (either ' or ") with absolute path, preserving the outer quotes.
  const re = new RegExp(`([\"\'])${escReg(metroFrom)}(?:\\.js)?\\1`, 'g');
  content = content.replace(re, (m, q) => `${q}${unix(absoluteTo)}${q}`);
  // Clean up any accidental doubled quotes like require(""C:...) or require(''C:...)
  content = content.replace(/require\(\"\"/g, 'require(\"').replace(/require\(\'\'/g, "require(\'");
  return content;
}

function patchFile(filePath, tasks){
  if (!exists(filePath)) return false;
  let s = read(filePath);
  const original = s;
  for (const t of tasks){ s = replaceImportLiteral(s, t.from, t.to); }
  if (s !== original){ backup(filePath); write(filePath, s); console.log('? Patched', filePath); return true; }
  console.log('• No changes needed for', filePath); return false;
}

(function main(){
  const metroDir = path.dirname(require.resolve('metro/package.json'));
  const paths = {
    TerminalReporter: path.join(metroDir, 'src', 'lib', 'TerminalReporter.js'),
    importLocationsPlugin: path.join(metroDir, 'src', 'ModuleGraph', 'worker', 'importLocationsPlugin.js'),
    sourceMapString: path.join(metroDir, 'src', 'DeltaBundler', 'Serializers', 'sourceMapString.js'),
    bundleToString: path.join(metroDir, 'src', 'lib', 'bundleToString.js'),
    CountingSet: path.join(metroDir, 'src', 'lib', 'CountingSet.js'),
  };

  console.log('metroDir =', metroDir);

  // Files to patch
  const files = {
    expoTerminalReporter: (()=>{ try { return require.resolve('@expo/cli/build/src/start/server/metro/TerminalReporter.js'); } catch { return null; } })(),
    expoReconcile:        (()=>{ try { return require.resolve('@expo/metro-config/build/serializer/reconcileTransformSerializerPlugin.js'); } catch { return null; } })(),
    expoWithSerializers:  (()=>{ try { return require.resolve('@expo/metro-config/build/serializer/withExpoSerializers.js'); } catch { return null; } })(),
    expoEnvSerializer:    (()=>{ try { return require.resolve('@expo/metro-config/build/serializer/environmentVariableSerializerPlugin.js'); } catch { return null; } })(),
  };

  // Apply patches
  if (files.expoTerminalReporter){
    patchFile(files.expoTerminalReporter, [
      { from: 'metro/src/lib/TerminalReporter', to: paths.TerminalReporter },
    ]);
  }

  if (files.expoReconcile){
    patchFile(files.expoReconcile, [
      { from: 'metro/src/ModuleGraph/worker/importLocationsPlugin', to: paths.importLocationsPlugin },
    ]);
  }

  if (files.expoWithSerializers){
    patchFile(files.expoWithSerializers, [
      { from: 'metro/src/DeltaBundler/Serializers/sourceMapString', to: paths.sourceMapString },
      { from: 'metro/src/lib/bundleToString', to: paths.bundleToString },
    ]);
  }

  if (files.expoEnvSerializer){
    patchFile(files.expoEnvSerializer, [
      { from: 'metro/src/lib/CountingSet', to: paths.CountingSet },
    ]);
  }

  console.log('Done. If you still see a subpath error, paste it here and we\'ll add one more mapping.');
})();