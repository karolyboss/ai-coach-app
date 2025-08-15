const fs = require('fs');
const path = require('path');
const Jimp = require('jimp-compact');

(async () => {
  const out = p => path.join(process.cwd(), 'assets', p);
  const mk = async (name, size, hex) => {
    const img = await new Jimp({ width: size, height: size, color: Jimp.cssColorToHex(hex) });
    await img.writeAsync(out(name));
    console.log('wrote', name, size+'x'+size);
  };

  await mk('icon.png', 1024, '#111111');
  await mk('adaptive-icon.png', 1024, '#111111');
  await mk('splash.png', 2000, '#000000');
  await mk('favicon.png', 48, '#111111');
})().catch(e => { console.error(e); process.exit(1); });
