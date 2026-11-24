// Renders tools/site_static/logo.png (512x512) and og.png (1200x630) from the brand shapes that live in the app (bwLogo, bwWord, bwWordLat in the brand piece).
// usage: node tools/mkbrand.js   (after ./build.sh)
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const ROOT = path.dirname(__dirname), three = fs.readFileSync(ROOT + '/node_modules/three/build/three.min.js');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage();
  await pg.route('**/three.min.js', r => r.fulfill({ status: 200, contentType: 'application/javascript', body: three }));
  await pg.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await pg.goto('file://' + ROOT + '/dist/aircraft-atlas.html'); await pg.waitForFunction('typeof bwLogo==="function"');
  const s = await pg.evaluate(() => ({ logo: bwLogo(), ar: typeof bwWord === 'function' ? bwWord() : '', lat: typeof bwWordLat === 'function' ? bwWordLat() : '' }));
  const css = '<style>html,body{margin:0}svg{width:100%;height:100%;display:block}</style>';
  await pg.setViewportSize({ width: 512, height: 512 });
  await pg.setContent(css + `<div style="width:512px;height:512px">${s.logo}</div>`); await pg.screenshot({ path: ROOT + '/tools/site_static/logo.png' });
  await pg.setViewportSize({ width: 1200, height: 630 });
  await pg.setContent(css + `<div style="width:1200px;height:630px;background:#0E1B2B;display:flex;align-items:center;justify-content:center;gap:64px;direction:ltr">
    <div style="width:290px;height:290px;flex:none">${s.logo}</div>
    <div style="display:grid;gap:28px;justify-items:start;color:#F5F2ED"><div style="height:150px;width:420px">${s.ar}</div><div style="height:40px;width:300px;color:#E7541E">${s.lat}</div>
      <div style="font:500 30px system-ui,sans-serif;color:#b9c4d0;letter-spacing:.02em">Interactive 3D aircraft · A380 · 747 · 737</div></div></div>`);
  await pg.screenshot({ path: ROOT + '/tools/site_static/og.png' }); await b.close(); console.log('logo.png og.png written');
})().catch(e => { console.error(e); process.exit(1); });
