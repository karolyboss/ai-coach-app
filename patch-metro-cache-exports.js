const fs = require('fs');
const path = require('path');

function ensureExport(pkgPath, key, relCandidates) {
  const dir = path.dirname(pkgPath);
  for (const rel of relCandidates) {
    const full = path.join(dir, rel);
    if (fs.existsSync(full)) {
      return './' + rel.replace(/\\/g, '/');
    }
  }
  return null;
}

try {
  const pkgPath = require.resolve('metro-cache/package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if (!pkg.exports) pkg.exports = {};

  const changes = [];
  // Add FileStore and HttpGetStore (Expo/Metro sometimes import these internals)
  const fileStoreTarget = ensureExport(pkgPath, './src/stores/FileStore', [
    'src/stores/FileStore.js',
    'src/stores/FileStore.cjs',
    'src/stores/FileStore.mjs',
    'src/stores/FileStore.ts'
  ]);
  const httpStoreTarget = ensureExport(pkgPath, './src/stores/HttpGetStore', [
    'src/stores/HttpGetStore.js',
    'src/stores/HttpGetStore.cjs',
    'src/stores/HttpGetStore.mjs',
    'src/stores/HttpGetStore.ts'
  ]);

  if (fileStoreTarget && pkg.exports['./src/stores/FileStore'] !== fileStoreTarget) {
    pkg.exports['./src/stores/FileStore'] = fileStoreTarget;
    changes.push(['./src/stores/FileStore', fileStoreTarget]);
  }
  if (httpStoreTarget && pkg.exports['./src/stores/HttpGetStore'] !== httpStoreTarget) {
    pkg.exports['./src/stores/HttpGetStore'] = httpStoreTarget;
    changes.push(['./src/stores/HttpGetStore', httpStoreTarget]);
  }

  if (changes.length) {
    // Backup once
    try { fs.copyFileSync(pkgPath, pkgPath + '.bak'); } catch {}
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    console.log('✔ Patched', pkgPath);
    for (const [k,v] of changes) console.log('   -', k, '=>', v);
  } else {
    console.log('• No changes needed. Exports already present.');
  }
} catch (e) {
  console.error('❌ Failed to patch metro-cache exports:', e && e.message || e);
  process.exit(1);
}
