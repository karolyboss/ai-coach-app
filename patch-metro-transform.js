const fs = require('fs');
const path = require('path');
const metroPkg = require.resolve('metro/package.json');
const metroPkgAbs = metroPkg.replace(/\\\\/g,'/');

const roots = [
  path.dirname(require.resolve('@expo/cli/package.json')),
  path.dirname(require.resolve('@expo/metro-config/package.json')),
  path.dirname(require.resolve('@expo/dev-server/package.json')),
  path.dirname(require.resolve('@expo/metro-runtime/package.json')),
];

function collect(root){
  const out=[]; const stack=[root];
  while (stack.length){
    const dir=stack.pop();
    let ents; try { ents = fs.readdirSync(dir, { withFileTypes:true }); } catch { continue; }
    for (const e of ents){
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { if (e.name !== 'node_modules') stack.push(p); }
      else if (/\.(mjs|cjs|js)$/.test(p)) out.push(p);
    }
  }
  return out;
}

let touched=0; for (const r of roots){
  for (const f of collect(r)){
    const src = fs.readFileSync(f,'utf8');
    const out = src.replace(/['\"]metro-transform\/package['\"]/g, JSON.stringify(metroPkgAbs));
    if (out !== src){ fs.copyFileSync(f,f+'.bak'); fs.writeFileSync(f,out); console.log('Patched', f); touched++; }
  }
}
console.log('Rewrote metro-transform/package ->', metroPkgAbs, 'in', touched, 'files');
