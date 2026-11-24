// Smoke test of the deploy package (dist/site): every section is opened in Arabic and English at 360 px and 1280 px.
// It FAILS on any console error or uncaught page error, on a section that does not open or stays empty, and when the 3D view does not start.
// It only WARNS (listed at the end) about horizontal overflow: fixing those is the mobile step of the plan.
// usage: node tests/smoke.js [--quick]     (after ./build.sh && python3 tools/mksite.py; three.js and the fonts are served locally, no network)
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.dirname(__dirname), SITE = process.env.SMOKE_SITE || ROOT + '/dist/site',   // SMOKE_SITE: another folder to test (used to prove the test fails on a broken page)
   three = fs.readFileSync(ROOT + '/node_modules/three/build/three.min.js');
const TYPES = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.js': 'application/javascript', '.woff2': 'font/woff2' };
const quick = process.argv.includes('--quick');
const SELFHOSTED = fs.existsSync(SITE + '/vendor/three-r128.min.js');   // step 3: three.js and the fonts are files of the site
(async () => {
  const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html'; const f = path.join(SITE, p);
    if (!f.startsWith(SITE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('not found'); }
    r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
  await new Promise(ok => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const fails = [], warns = []; let opened = 0;
  for (const lang of ['ar', 'en']) for (const [w, h] of [[360, 740], [1280, 800]]) {
    const tag = `${lang} ${w}px`, ctx = await b.newContext({ viewport: { width: w, height: h } }), pg = await ctx.newPage(), errs = [];
    pg.on('pageerror', e => errs.push('page error: ' + String(e).slice(0, 200))); pg.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
    if (!SELFHOSTED) await pg.route('**/three.min.js', r => r.fulfill({ status: 200, contentType: 'application/javascript', body: three }));   // an older package (SMOKE_SITE) still loads it from cdnjs
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const ext = []; pg.on('request', q => { const u = q.url(); if (!u.startsWith(URL) && !u.startsWith('data:') && !u.startsWith('blob:')) ext.push(u); });
    const flush = where => { errs.splice(0).forEach(e => fails.push(`${tag} [${where}] ${e}`)); };
    try {
      await pg.goto(URL, { waitUntil: 'load' }); await pg.waitForFunction('typeof setTab==="function"&&typeof S!=="undefined"', null, { timeout: 30000 }); await pg.waitForTimeout(1500);
      if (lang === 'en') { await pg.evaluate('ilSetLang("en")'); await pg.waitForTimeout(900); }
      const st = await pg.evaluate('({lang:document.documentElement.lang,three:!!window.THREE,gl:typeof GLOK!=="undefined"&&GLOK})');
      if (SELFHOSTED && await pg.evaluate('document.fonts.ready.then(()=>[...document.fonts].some(f=>f.family.includes("IBM Plex Sans Arabic")&&f.status==="loaded"))') !== true) fails.push(`${tag}: the self-hosted Arabic font did not load`);
      if (st.lang !== lang) fails.push(`${tag}: <html lang> is "${st.lang}"`); if (!st.three || !st.gl) fails.push(`${tag}: the 3D view did not start (three ${st.three}, WebGL ${st.gl})`);
      flush('load');
      const tabs = await pg.evaluate('[...new Set([...document.querySelectorAll("[data-tab]")].map(e=>e.dataset.tab))]');
      for (const t of tabs) {
        try { await pg.evaluate(`setTab(${JSON.stringify(t)})`); } catch (e) { fails.push(`${tag}: section "${t}" threw: ${String(e).slice(0, 160)}`); continue; }   // go on with the other sections
        await pg.waitForTimeout(quick ? 350 : 700);
        const r = await pg.evaluate('({tab:S.tab,text:(document.getElementById("tp")||document.body).innerText.trim().length,over:document.documentElement.scrollWidth>innerWidth+1})');
        if (r.tab !== t) fails.push(`${tag}: section "${t}" did not open (still "${r.tab}")`); else if (r.text < 20) fails.push(`${tag}: section "${t}" is empty`); else opened++;
        if (r.over) warns.push(`${tag}: section "${t}" scrolls sideways`); flush(t);
      }
      await pg.evaluate('setTab("parts"); select(Object.keys(PARTS).filter(id=>partVisible(id))[3])'); await pg.waitForTimeout(700);
      if (!(await pg.evaluate('!document.getElementById("card").hidden'))) fails.push(`${tag}: the part card did not open`); flush('part card');
      if (!quick && ((lang === 'ar' && w === 360) || (lang === 'en' && w === 1280))) {   // one flight per language: start on the runway, look, stop
        await pg.evaluate('setTab("fly"); FLY.opts.scn="takeoff"; FLY.opts.hints=false; document.querySelector("#flyGo").click()'); await pg.waitForTimeout(3000);
        if (!(await pg.evaluate('FLY.on===true&&!!FLY.s'))) fails.push(`${tag}: the flight did not start`);
        await pg.evaluate('flySetView("chase")'); await pg.waitForTimeout(700); await pg.evaluate('flyStop()'); await pg.waitForTimeout(500); flush('flight');
      }
    } catch (e) { fails.push(`${tag}: ${String(e).slice(0, 200)}`); }
    if (SELFHOSTED && ext.length) fails.push(`${tag}: requests to other hosts: ${[...new Set(ext.map(u => u.split('/').slice(0, 3).join('/')))].join(' ')}`);
    console.log(`${tag}: done`); await ctx.close();
  }
  await b.close(); srv.close();
  warns.forEach(x => console.log('WARN', x)); fails.forEach(x => console.log('FAIL', x));
  console.log(fails.length ? `SMOKE FAILED: ${fails.length} problem(s)` : `SMOKE OK: ${opened} section openings, 0 console errors, ${warns.length} warning(s)`); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
