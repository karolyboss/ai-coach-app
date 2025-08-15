const fs = require('fs');
const path = require('path');

// Locate the compiled worker that imports metro-cache-key
const target = require.resolve('@expo/metro-config/build/transform-worker/metro-transform-worker.js');
const src = fs.readFileSync(target, 'utf8');

if (src.includes('__mkFn')) {
  console.log('• Already patched:', target);
  process.exit(0);
}

// Build a robust resolver that works with different export shapes
const prologue = `\nconst __mk = require('metro-cache-key');\nconst __mkFn = (typeof __mk === 'function')\n  ? __mk\n  : (typeof __mk?.default === 'function')\n    ? __mk.default\n    : (__mk.stableHash || __mk.getCacheKey || (__mk.default && __mk.default.stableHash));\nif (!__mkFn) { throw new Error('metro-cache-key export not a function'); }\n`;

let out = src;

// Insert our prologue after "use strict" so it's early in the file
out = out.replace(/("use strict";)/, `$1${prologue}`);

// Replace all usages of metro_cache_key_1.default with our resilient function
out = out.replace(/metro_cache_key_1\.default/g, '__mkFn');

fs.writeFileSync(target, out);
console.log('✔ Patched', target);
