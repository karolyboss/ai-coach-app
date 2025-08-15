const fs = require('fs');
const path = require('path');

function exists(p){ try { return fs.existsSync(p); } catch { return false; } }
function resolveDeep(pkg, sub) {
  try {
    const root = path.dirname(require.resolve(pkg + '/package.json'));
    const base = path.join(root, 'src', sub);
    const cand = [
      base,
      base + '.js', base + '.cjs', base + '.mjs', base + '.ts', base + '.tsx',
      path.join(base, 'index.js'), path.join(base, 'index.cjs'), path.join(base, 'index.mjs'), path.join(base, 'index.ts'), path.join(base, 'index.tsx')
    ];
    const hit = cand.find(exists);
    return hit || null;
  } catch (e) { return null; }
}

function collectFiles(root){
  const out = [];
  const stack = [root];
  while (stack.length){
    const dir = stack.pop();
    let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of ents){
      const p = path.join(dir, e.name);
      if (e.isDirectory()){
        if (e.name !== 'node_modules' && !/\\dist\\types$/.test(p)) stack.push(p);
      } else if (/\.(mjs|cjs|js)$/.test(p)) {
        out.push(p);
      }
    }
  }
  return out;
}

function patchFile(file){
  let src = fs.readFileSync(file, 'utf8');
  let changed = false;

  // metro deep imports
  src = src.replace(/(["'])metro\/src\/([^"']+)\1/g, (m, q, sub) => {
    const abs = resolveDeep('metro', sub);
    if (abs) { changed = true; return JSON.stringify(abs.replace(/\\\\/g,'/')); }
    return m;
  });

  // metro-cache deep imports
  src = src.replace(/(["'])metro-cache\/src\/([^"']+)\1/g, (m, q, sub) => {
    const abs = resolveDeep('metro-cache', sub);
    if (abs) { changed = true; return JSON.stringify(abs.replace(/\\\\/g,'/')); }
    return m;
  });

  if (changed){ fs.copyFileSync(file, file + '.bak'); fs.writeFileSync(file, src); return true; }
  return false;
}

const roots = [
  path.dirname(require.resolve('@expo/cli/package.json')),
  path.dirname(require.resolve('@expo/metro-config/package.json')),
  path.dirname(require.resolve('@expo/dev-server/package.json')),
  path.dirname(require.resolve('@expo/metro-runtime/package.json')),
].filter(Boolean);

let total = 0, touched = 0;
for (const r of roots){
  const files = collectFiles(r);
  for (const f of files){ total++; if (patchFile(f)) touched++; }
}
console.log('Scanned', total, 'files; patched', touched);
