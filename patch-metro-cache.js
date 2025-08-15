const fs = require('fs');
const path = require('path');

function findFile(root, base) {
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let list; try { list = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of list) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { if (e.name !== 'node_modules') stack.push(p); }
      else if (e.isFile() && e.name.toLowerCase() === base.toLowerCase()) return p;
    }
  }
  return null;
}

// locate actual files inside installed metro-cache
const cacheDir = path.dirname(require.resolve('metro-cache/package.json'));
const fileStore = findFile(cacheDir, 'FileStore.js') || findFile(cacheDir, 'FileStore.ts');
const httpStore = findFile(cacheDir, 'HttpGetStore.js') || findFile(cacheDir, 'HttpGetStore.ts');
if (!fileStore) { console.error('❌ Cannot find FileStore under', cacheDir); process.exit(1); }
console.log('✔ FileStore:', fileStore);
if (httpStore) console.log('✔ HttpGetStore:', httpStore);

// scan Expo tooling for those deep imports and rewrite them
const roots = [
  path.dirname(require.resolve('@expo/cli/package.json')),
  path.dirname(require.resolve('@expo/metro-config/package.json')),
  path.dirname(require.resolve('@expo/dev-server/package.json')),
].filter(Boolean);

const targets = [];
function collect(root) {
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let list; try { list = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of list) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { if (e.name !== 'node_modules') stack.push(p); }
      else if (e.isFile() && /\.(mjs|cjs|js)$/.test(p)) {
        const txt = fs.readFileSync(p, 'utf8');
        if (/metro-cache\/src\/stores\/FileStore/.test(txt) || /metro-cache\/src\/stores\/HttpGetStore/.test(txt)) {
          targets.push(p);
        }
      }
    }
  }
}
for (const r of roots) collect(r);
console.log('Found', targets.length, 'files to patch');

function norm(p){ return p.replace(/\\/g,'/'); }
for (const f of targets) {
  const src = fs.readFileSync(f, 'utf8');
  let out = src.replace(/['\"]metro-cache\/src\/stores\/FileStore['\"]/g, JSON.stringify(norm(fileStore)));
  if (httpStore) out = out.replace(/['\"]metro-cache\/src\/stores\/HttpGetStore['\"]/g, JSON.stringify(norm(httpStore)));
  if (out !== src) { fs.copyFileSync(f, f + '.bak'); fs.writeFileSync(f, out); console.log('Patched', f); }
}
console.log('✅ Done patching metro-cache deep imports.');
