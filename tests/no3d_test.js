// When the 3D view cannot start, the page says why in plain words and offers a retry; every section still works.
// Three cases: three.js does not load (network), no WebGL on the device, and the English wording. No other host is contacted.
// usage: node tests/no3d_test.js        (after ./build.sh && python3 tools/mksite.py)
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.dirname(__dirname), SITE = path.resolve(path.join(ROOT, 'dist', 'site'));
const TYPES = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.js': 'application/javascript', '.woff2': 'font/woff2' };
const fails = []; let n = 0; const ok = (c, what) => { n++; if (!c) { fails.push(what); console.log('FAIL', what); } };
(async () => {
  const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html'; const f = path.join(SITE, p);
    if (!path.resolve(f).startsWith(SITE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('not found'); }
    r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
  await new Promise(ok => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  async function run(tag, setup, check) {
    const ctx = await b.newContext({ viewport: { width: 400, height: 820 } }), pg = await ctx.newPage(), errs = [];
    pg.on('pageerror', e => errs.push('page error: ' + String(e).slice(0, 200)));
    pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
    await setup(pg);
    await pg.goto(URL, { waitUntil: 'load' }); await pg.waitForFunction('typeof setTab==="function"&&typeof S!=="undefined"', null, { timeout: 30000 }); await pg.waitForTimeout(1200);
    await pg.evaluate('setTab("parts")'); await pg.waitForTimeout(400);   // the 3D stage (or its 2D drawing) lives in the aircraft section
    await check(pg);
    // every section still opens without a script error (the flight needs 3D and is not started)
    const tabs = await pg.evaluate('[...new Set([...document.querySelectorAll("[data-tab]")].map(e=>e.dataset.tab))]');
    for (const t of tabs) { try { await pg.evaluate(`setTab(${JSON.stringify(t)})`); } catch (e) { errs.push(`section ${t} threw ${String(e).slice(0, 120)}`); } await pg.waitForTimeout(250);
      if (await pg.evaluate('S.tab') !== t) errs.push(`section ${t} did not open`); }
    await pg.evaluate('setTab("parts"); select(Object.keys(PARTS).filter(id=>partVisible(id))[3])'); await pg.waitForTimeout(400);
    ok(await pg.evaluate('!document.getElementById("card").hidden'), tag + ': the part card opens on the 2D drawing');
    errs.forEach(e => ok(false, `${tag}: ${e}`)); await ctx.close();
  }
  const card = pg => pg.evaluate('({vis:document.getElementById("glFail").getBoundingClientRect().height>40, shown:!document.getElementById("glFail").hidden, text:document.getElementById("glFailT").textContent, flat:!document.getElementById("flat").hidden, gl:GLOK, role:document.getElementById("glFail").getAttribute("role")})');
  await run('three.js blocked', pg => pg.route('**/vendor/three-r128.min.js', r => r.abort('failed')), async pg => {
    const c = await card(pg); ok(c.shown && c.vis && /three\.js/.test(c.text) && /الشبكة/.test(c.text) && c.flat && !c.gl && c.role === 'alert', 'three.js blocked: card + 2D drawing ' + JSON.stringify(c));
    await pg.click('#glFailOk'); ok(await pg.evaluate('document.getElementById("glFail").hidden'), 'the second button closes the card');
    await pg.evaluate('document.getElementById("glFail").hidden=false');
    await pg.context().setOffline(true); await pg.click('#glFailRetry'); await pg.waitForTimeout(200);
    ok(/غير متصل/.test(await pg.evaluate('document.getElementById("glFailT").textContent')), 'retry while offline says so instead of reloading');
    await pg.context().setOffline(false);
    const nav = pg.waitForNavigation({ timeout: 10000 }).then(() => true, () => false); await pg.click('#glFailRetry'); ok(await nav, 'retry reloads the page');
    await pg.waitForFunction('typeof setTab==="function"', null, { timeout: 30000 }); await pg.waitForTimeout(800); await pg.evaluate('setTab("parts")');
  });
  await run('no WebGL', pg => pg.addInitScript(() => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (k, o) { return /webgl/i.test(k) ? null : g.call(this, k, o); }; }), async pg => {
    const c = await card(pg); ok(c.shown && /WebGL/.test(c.text) && c.flat && !c.gl, 'no WebGL: card + 2D drawing ' + JSON.stringify(c));
  });
  await run('English', pg => pg.route('**/vendor/three-r128.min.js', r => r.abort('failed')), async pg => {
    await pg.evaluate('ilSetLang("en")'); await pg.waitForTimeout(700);
    const t = await pg.evaluate('document.getElementById("glFail").innerText'); ok(/3D view is not available/.test(t) && /three\.js/.test(t) && /Try again/.test(t) && !/[ء-ي]/.test(t), 'English card: ' + t.replace(/\s+/g, ' '));
  });
  await run('3D works', () => {}, async pg => { const c = await card(pg); ok(!c.shown && c.gl, 'with 3D the card stays hidden ' + JSON.stringify(c)); });
  await b.close(); srv.close();
  console.log(fails.length ? `NO-3D FAILED: ${fails.length} of ${n}` : `NO-3D OK: ${n} checks`); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
