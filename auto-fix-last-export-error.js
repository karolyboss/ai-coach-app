const fs = require('fs');
const path = require('path');

function latestLog(dir){
  const files = fs.readdirSync(dir).filter(f=>/^expo-start-\d{8}_\d{6}\.txt$/.test(f));
  if(!files.length) return null;
  files.sort();
  return path.join(dir, files[files.length-1]);
}

const proj = process.cwd();
const logDir = path.join(proj, 'logs');
const logPath = process.argv[2] || latestLog(logDir);
if(!logPath || !fs.existsSync(logPath)){
  console.error('No log file found. Start Expo first to generate one.');
  process.exit(1);
}

const txt = fs.readFileSync(logPath,'utf8');
const lines = txt.split(/\r?\n/).reverse();
const errLine = lines.find(l=>/Package subpath '.*' is not defined by \"exports\"/.test(l));
if(!errLine){
  console.log('No ERR_PACKAGE_PATH_NOT_EXPORTED line found in log:', logPath);
  process.exit(0);
}
console.log('▶', errLine);

// Parse: Package subpath './src/...something...' ... in C:\\...\\node_modules\\<pkg>\\package.json
const m = errLine.match(/Package subpath '([^']+)' is not defined by \"exports\" in (.*node_modules[\\\/]([^\\\/]+)[\\\/]package\.json)/);
if(!m){
  console.error('Could not parse error line.');
  process.exit(2);
}
const subpath = m[1];
const pkgJson = m[2];
const pkgName = m[3];
const pkgDir = path.dirname(pkgJson);

function tryResolve(relNoDot){
  const rel = relNoDot.replace(/^\.\//,'');
  const bases = [rel, rel.replace(/\\/g,'/')];
  const exts = ['', '.js', '.cjs', '.mjs', '.ts', '.tsx'];
  for(const b of bases){
    for(const e of exts){
      const p = path.join(pkgDir, b + e);
      if (fs.existsSync(p)){
        return './' + path.posix.relative(pkgDir.replace(/\\/g,'/'), p.replace(/\\/g,'/'));
      }
    }
  }
  return null;
}

const target = tryResolve(subpath);
if(!target){
  console.error('Could not find a file for', subpath, 'under', pkgDir);
  console.error('Try opening the folder and check which extension exists.');
  process.exit(3);
}

const pkg = JSON.parse(fs.readFileSync(pkgJson,'utf8'));
pkg.exports = pkg.exports || {};
if(!pkg.exports[subpath]){
  pkg.exports[subpath] = target;
  fs.copyFileSync(pkgJson, pkgJson+'.bak');
  fs.writeFileSync(pkgJson, JSON.stringify(pkg, null, 2));
  console.log('✔ Patched', pkgName, 'exports:', subpath, '=>', target);
} else {
  console.log('Export already present:', subpath, '=>', pkg.exports[subpath]);
}
