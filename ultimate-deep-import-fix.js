const fs = require('fs');
const path = require('path');

const PKGS = [
  '@expo/cli',
  '@expo/metro-config',
  '@expo/dev-server',
  '@expo/metro-runtime'
];

function pkgRoot(name){ return path.dirname(require.resolve(name + '/package.json')); }
function walk(root){
  const out = []; const st=[root];
  while(st.length){
    const d = st.pop();
    let es; try{ es = fs.readdirSync(d,{withFileTypes:true}); }catch{ continue; }
    for(const e of es){
      const p = path.join(d,e.name);
      if(e.isDirectory()){
        if(e.name !== 'node_modules' && !/\\dist\\types$/.test(p)) st.push(p);
      }else if(/\.(mjs|cjs|js|ts|tsx)$/.test(p)){
        out.push(p);
      }
    }
  }
  return out;
}

function resolveDeep(pkg, sub){
  // Try to resolve a *source* file inside metro/metro-cache src tree
  try{
    const root = path.dirname(require.resolve(pkg + '/package.json'));
    const base = path.join(root,'src',sub);
    const tries = [base, base+'.js', base+'.cjs', base+'.mjs', base+'.ts', base+'.tsx', path.join(base,'index.js'), path.join(base,'index.ts')];
    for(const t of tries){ if(fs.existsSync(t)) return t; }
  }catch{}
  return null;
}

const filesByPkg = new Map();
for(const name of PKGS){ filesByPkg.set(name, walk(pkgRoot(name))); }

let patched = 0;
const foundSubpaths = new Set();

for(const [name, files] of filesByPkg){
  for(const f of files){
    let src = fs.readFileSync(f,'utf8');
    let out = src;

    // capture and rewrite metro deep imports
    out = out.replace(/(['\"])metro\/src\/([^'\"]+)\1/g, (m,q,sub)=>{
      const abs = resolveDeep('metro', sub);
      if(abs){ foundSubpaths.add(['metro',sub].join(':')); return JSON.stringify(abs.replace(/\\/g,'/')); }
      return m;
    });

    // capture and rewrite metro-cache deep imports
    out = out.replace(/(['\"])metro-cache\/src\/([^'\"]+)\1/g, (m,q,sub)=>{
      const abs = resolveDeep('metro-cache', sub);
      if(abs){ foundSubpaths.add(['metro-cache',sub].join(':')); return JSON.stringify(abs.replace(/\\/g,'/')); }
      return m;
    });

    // quick alias: metro-transform/package -> metro/package.json
    out = out.replace(/(['\"])metro-transform\/package\1/g, ()=> JSON.stringify(require.resolve('metro/package.json').replace(/\\/g,'/')));

    if(out !== src){ fs.copyFileSync(f,f+'.bak'); fs.writeFileSync(f,out); patched++; }
  }
}

console.log('✔ Rewrote deep imports in', patched, 'file(s).');
console.log('Deep paths found:', [...foundSubpaths].slice(0,50));

// 2) also add exports to metro + metro-cache so require('metro/src/...') still works somewhere else
function addExports(pkgName){
  const pkgJson = require.resolve(pkgName + '/package.json');
  const root = path.dirname(pkgJson);
  const pkg = JSON.parse(fs.readFileSync(pkgJson,'utf8'));
  pkg.exports = pkg.exports || {};
  let touched = 0;
  for(const key of foundSubpaths){
    const [p, sub] = key.split(':');
    if (p !== pkgName) continue;
    const abs = resolveDeep(pkgName, sub); if(!abs) continue;
    // build export key like ./src/.....
    const exportKey = './src/' + sub;
    // compute relative path from package root
    const rel = './' + path.posix.relative(root.replace(/\\/g,'/'), abs.replace(/\\/g,'/'));
    if(!pkg.exports[exportKey]){ pkg.exports[exportKey] = rel; touched++; }
  }
  if(touched){ fs.copyFileSync(pkgJson,pkgJson+'.bak'); fs.writeFileSync(pkgJson, JSON.stringify(pkg,null,2)); }
  console.log('Patched', pkgName, 'exports +', touched);
}

addExports('metro');
addExports('metro-cache');
