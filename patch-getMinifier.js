const fs = require('fs');
const path = require('path');

try {
  const pkgPath = require.resolve('metro-transform-worker/package.json');
  const dir = path.dirname(pkgPath);
  const key = './src/utils/getMinifier';
  const candidates = [
    'src/utils/getMinifier.js',
    'src/utils/getMinifier.cjs',
    'src/utils/getMinifier.mjs',
    'src/utils/getMinifier.ts',
    'src/utils/getMinifier.tsx',
  ];
  let target = null;
  for (const rel of candidates) {
    const p = path.join(dir, rel);
    if (fs.existsSync(p)) { target = './' + rel.replace(/\\/g,'/'); break; }
  }
  if (!target) {
    console.error('❌ Could not find getMinifier file under', dir);
    process.exit(2);
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.exports = pkg.exports || {};
  if (pkg.exports[key] !== target) {
    fs.copyFileSync(pkgPath, pkgPath + '.bak');
    pkg.exports[key] = target;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    console.log('✔ Patched', pkgPath, '\n   ', key, '=>', target);
  } else {
    console.log('• Export already present:', key, '=>', target);
  }
} catch (e) {
  console.error('❌ Patch failed:', e && e.message || e);
  process.exit(3);
}
