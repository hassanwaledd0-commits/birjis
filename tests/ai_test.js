// Meyslon's three AI tiers in the real page (dist/site): (a) Claude inside the page is mocked as window.claude, (b) the site's server
// is mocked by intercepting /api/ask, (c) the offline answers run for real on the site's content. No network, no key, no cost.
// It checks that a failing tier hands over to the next one, that an answer is never empty, that the mode line tells which tier
// answered, the links under an answer, the lesson tutor and the camera (manual part picker without a/b), in Arabic and English.
// usage: node tests/ai_test.js        (after ./build.sh && python3 tools/mksite.py)
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.dirname(__dirname), SITE = ROOT + '/dist/site', three = fs.readFileSync(ROOT + '/node_modules/three/build/three.min.js');
const TYPES = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.js': 'application/javascript', '.woff2': 'font/woff2' };
const fails = []; let n = 0; const ok = (c, what) => { n++; if (!c) { fails.push(what); console.log('FAIL', what); } };
// a 2x2 PNG for the camera
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR4nGP4z8Dwn4GBgYEBAB7mA/1tE/aCAAAAAElFTkSuQmCC', 'base64');
(async () => {
  const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html'; const f = path.join(SITE, p);
    if (!f.startsWith(SITE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('not found'); }
    r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
  await new Promise(ok => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

  // one page per setup: A = behaviour of window.claude ("none" = not in Claude), B = behaviour of /api/ask
  async function open(A, B, o = {}) {
    const ctx = await b.newContext({ viewport: { width: o.w || 400, height: 820 } }), pg = await ctx.newPage(), errs = [], hits = [];
    pg.on('pageerror', e => errs.push('page error: ' + String(e).slice(0, 200)));
    pg.on('console', m => { if (m.type() === 'error' && !(o.allow404 && /Failed to load resource/.test(m.text()))) errs.push('console: ' + m.text().slice(0, 200)); });
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.route('**/api/ask', async r => { const body = JSON.parse(r.request().postData() || '{}'); hits.push(body);
      if (B === 'ok') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ text: body.image ? 'هذه عجلة الأنف.\nPART: gear_nose' : 'جواب الخادم: الجناح يولّد الرفع.' }) });
      if (B === '429') return r.fulfill({ status: 429, contentType: 'application/json', body: '{"error":"rate_limited"}' });
      if (B === '404') return r.fulfill({ status: 404, contentType: 'text/plain', body: 'not found' });
      if (B === 'down') return r.abort('failed');
      return r.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"not_configured"}' }); });
    if (A !== 'none') await pg.addInitScript(mode => {
      const sm = async (prompt, opts) => { window.__aCalls = (window.__aCalls || 0) + 1;
        if (mode === 'ok') { const t = (opts && opts.images && opts.images.length) ? 'هذه عجلة الأنف.\nPART: gear_nose' : 'جواب Claude داخل الصفحة: الرفع قوة عمودية على تيار الهواء.'; if (opts && opts.onText) opts.onText({ text: t }); return { text: t }; }
        const e = new Error(mode); e.code = mode; throw e; };
      sm.limits = async () => ({ images: true });
      window.claude = { use: async () => sm };
    }, A);
    await pg.goto(URL, { waitUntil: 'load' }); await pg.waitForFunction('typeof setTab==="function"&&typeof S!=="undefined"&&typeof aiAsk==="function"', null, { timeout: 30000 }); await pg.waitForTimeout(800);
    if (o.en) { await pg.evaluate('ilSetLang("en")'); await pg.waitForTimeout(700); }
    return { ctx, pg, errs, hits };
  }
  const ask = async (pg, q) => { await pg.evaluate('setTab("ask")'); await pg.waitForTimeout(250); await pg.fill('#chIn', q); await pg.click('#chSend');
    await pg.waitForFunction('!CHAT.busy', null, { timeout: 15000 });
    return pg.evaluate(() => { const m = CHAT.msgs[CHAT.msgs.length - 1], el = document.querySelector('[data-aimode]');
      return { text: m.text, links: (m.links || []).map(l => l.go), mode: el && el.dataset.tier, line: el && el.textContent, shown: document.querySelectorAll('#chMsgs [data-aigo]').length }; }); };
  const done = async (S, tag) => { S.errs.forEach(e => { fails.push(`${tag}: ${e}`); console.log("FAIL", tag, e); }); n++; await S.ctx.close(); };

  // 1. inside Claude: tier a answers
  let S = await open('ok', 'ok'); let r = await ask(S.pg, 'ما وظيفة الرادوم؟');
  ok(/داخل الصفحة/.test(r.text) && r.mode === 'a', '1 tier a answers: ' + JSON.stringify(r)); ok(S.hits.length === 0, '1 the server is not called when tier a answers');
  ok(r.links.length > 0 && r.shown > 0, '1 links from the site under an AI answer ' + JSON.stringify(r.links)); await done(S, '1');
  // 2. Claude's limit reached: the site's server answers
  S = await open('rate_limited', 'ok'); r = await ask(S.pg, 'ما وظيفة الجناح؟');
  ok(/جواب الخادم/.test(r.text) && r.mode === 'b', '2 rate_limited -> tier b: ' + JSON.stringify(r)); ok(/حد الاستخدام/.test(r.line), '2 the mode line says why: ' + r.line);
  ok(S.hits.length === 1 && S.hits[0].kind === 'chat' && S.hits[0].prompt.includes('ما وظيفة الجناح؟'), '2 the request carries the prompt');
  r = await ask(S.pg, 'وماذا عن الذيل؟'); ok(r.mode === 'b' && S.hits.length === 2, '2 next question goes straight to b (a is resting)'); await done(S, '2');
  // 3. not granted + server busy: offline answer with links
  S = await open('not_granted', '429', { allow404: true }); r = await ask(S.pg, 'ما وظيفة الرادوم؟');   // the browser itself logs a refused request (429/404): not a script error
  ok(r.mode === 'c' && r.text.length > 40 && r.links[0] === 'part:radome', '3 offline answer about the radome: ' + JSON.stringify(r));
  ok(/مشغول/.test(r.line), '3 mode line: ' + r.line); await done(S, '3');
  // 4. a plain website without the function deployed (404): offline, and the server is not asked again
  S = await open('none', '404', { allow404: true }); r = await ask(S.pg, 'كيف أفحص ضغط الإطارات؟');
  ok(r.mode === 'c' && r.links[0] === 'amm:tire', '4 the AMM tyre card: ' + JSON.stringify(r));
  r = await ask(S.pg, 'ما معنى الرفع؟'); ok(S.hits.length === 1, '4 the missing server is asked only once'); ok(r.text.length > 20 && r.mode === 'c', '4 second answer: ' + JSON.stringify(r));
  // the links really open the place they name
  await S.pg.evaluate('aiGo("part:radome")'); await S.pg.waitForTimeout(400); ok(await S.pg.evaluate('S.tab==="parts"&&S.sel==="radome"'), '4 link opens the part');
  await S.pg.evaluate('aiGo("amm:tire")'); await S.pg.waitForTimeout(300); ok(await S.pg.evaluate('S.tab==="amm"&&AMMS.task==="tire"'), '4 link opens the AMM card');
  await S.pg.evaluate('aiGo("gloss:Lift")'); await S.pg.waitForTimeout(300); ok(await S.pg.evaluate('S.tab==="gloss"&&document.querySelectorAll("#gList .gt").length>0'), '4 link opens the glossary');
  const L = await S.pg.evaluate('Object.keys(LESSONS).find(b=>LESSONS[b].length>3)'); await S.pg.evaluate(`aiGo("lesson:${L}:2")`); await S.pg.waitForTimeout(500);
  ok(await S.pg.evaluate(`S.tab==="learn"&&LRN.book==="${L}"&&LRN.i===2`), '4 link opens the lesson');
  // search quality on a few questions (offline engine)
  const Q = await S.pg.evaluate(() => [['ما وظيفة الرادوم؟', 'part:radome'], ['شنو هو الرفع', 'gloss:Lift'], ['كيف أفحص ضغط الإطارات', 'amm:tire'], ['ما وظيفة جهاز الهبوط الأمامي', 'part:gear_nose'], ['ما هي عجلة الأنف', 'part:wheel_well_nose'], ['what is drag', 'gloss:Drag']]
    .map(([q, want]) => { const a = aiLocalAnswer(q); return { q, want, got: a.links.map(l => l.go).slice(0, 3), text: a.text.slice(0, 90) }; }));
  Q.forEach(x => ok(x.got.includes(x.want), `search "${x.q}": wanted ${x.want} in the top 3, got ${x.got.join(' ')}`));
  const none = await S.pg.evaluate('aiLocalAnswer("ققققق ززززز")'); ok(/لم أجد/.test(none.text) && none.links.some(l => /^lsearch:/.test(l.go)), '4 nothing found -> a clear sentence and search buttons');
  await done(S, '4');
  // 5. network failure on the server: offline
  S = await open('none', 'down', { allow404: true }); r = await ask(S.pg, 'ما وظيفة الجناح؟'); ok(r.mode === 'c' && r.text.length > 20, '5 network down -> offline: ' + JSON.stringify(r)); await done(S, '5');
  // 6. the lesson tutor offline: every button gives a non-empty answer
  S = await open('none', '404', { allow404: true }); await S.pg.evaluate('setTab("learn")'); await S.pg.waitForTimeout(700);
  ok(await S.pg.evaluate('!document.getElementById("lTut").hidden'), '6 the tutor is shown outside Claude too');
  for (const k of ['simple', 'reading', 'example', 'experiment', 'quiz', 'pitfalls']) {
    await S.pg.evaluate(`tutAsk("${k}")`); await S.pg.waitForFunction('!TUT.busy', null, { timeout: 10000 });
    const t = await S.pg.evaluate('(TUT.h[tutKey()]||[]).slice(-1)[0]'); ok(t && t.text && t.text.length > 15, `6 tutor "${k}": ${t && t.text && t.text.slice(0, 60)}`);
  }
  await S.pg.evaluate('tutFree("ما معنى هذا الدرس؟")'); await S.pg.waitForFunction('!TUT.busy', null, { timeout: 10000 });
  ok((await S.pg.evaluate('(TUT.h[tutKey()]||[]).slice(-1)[0].text')).length > 15, '6 tutor free question');
  ok(await S.pg.evaluate('document.querySelector("#lTut [data-aimode]").dataset.tier==="c"'), '6 tutor mode line = offline'); await done(S, '6');
  // 7. the camera: no tier that sees pictures -> manual picker; with the server -> the picture goes to it
  S = await open('none', '404', { allow404: true }); await S.pg.evaluate('setTab("cam")'); await S.pg.waitForTimeout(500);
  // the server may exist until it is tried: the photo is sent, the 404 hands over, the picker appears with a clear sentence
  await S.pg.setInputFiles('#camPick', { name: 'p.png', mimeType: 'image/png', buffer: PNG }); await S.pg.waitForFunction('!CAM.busy&&CAM.msgs.length>1', null, { timeout: 15000 });
  ok(await S.pg.evaluate('!document.getElementById("camMan").hidden&&/يحتاج Claude/.test(CAM.msgs.slice(-1)[0].text)'), '7 no AI for the photo -> manual picker and a clear sentence');
  await S.pg.selectOption('#camSel', 'gear_nose'); await S.pg.waitForTimeout(300);
  ok(await S.pg.evaluate('CAM.part==="gear_nose"&&!document.getElementById("camOpen").hidden&&CAM.msgs.slice(-1)[0].text.length>40'), '7 picking a part explains it and offers the 3D view');
  await done(S, '7');
  S = await open('none', '404', { allow404: true }); await S.pg.evaluate('AI.bDown=Date.now()+60000; setTab("cam")'); await S.pg.waitForTimeout(500);
  ok(await S.pg.evaluate('!document.getElementById("camMan").hidden'), '7a picker shown at once when no tier can see pictures'); await done(S, '7a');
  S = await open('none', 'ok'); await S.pg.evaluate('setTab("cam")'); await S.pg.waitForTimeout(500);
  ok(await S.pg.evaluate('document.getElementById("camMan").hidden'), '7b picker hidden when the server can see pictures');
  await S.pg.setInputFiles('#camPick', { name: 'p.png', mimeType: 'image/png', buffer: PNG }); await S.pg.waitForFunction('CAM.msgs.length>1&&!CAM.busy', null, { timeout: 15000 });
  ok(S.hits.length === 1 && S.hits[0].kind === 'camera' && S.hits[0].image && /^image\/jpeg$/.test(S.hits[0].image.media_type) && S.hits[0].image.data.length > 50, '7b the photo is sent to the server as JPEG');
  ok(await S.pg.evaluate('CAM.part==="gear_nose"'), '7b the answer opens the part'); await done(S, '7b');
  // 8. English site, offline: the answer and the mode line are in English
  S = await open('none', '404', { en: true, allow404: true, w: 1280 }); r = await ask(S.pg, 'What is lift?');
  ok(r.mode === 'c' && !/[ء-ي]/.test(r.text) && /lift/i.test(r.text), '8 English offline answer: ' + JSON.stringify(r.text.slice(0, 120)));
  ok(/^Mode: offline/.test(r.line), '8 English mode line: ' + r.line); await done(S, '8');
  // 9. the Claude artifact copy (no meta tag): the server tier is never tried
  S = await open('none', 'ok'); await S.pg.evaluate('document.querySelector(\'meta[name="birjis-ai"]\').remove()'); r = await ask(S.pg, 'ما وظيفة الجناح؟');
  ok(S.hits.length === 0 && r.mode === 'c', '9 no meta tag -> no server call'); await done(S, '9');

  await b.close(); srv.close();
  console.log(fails.length ? `AI TIERS FAILED: ${fails.length} of ${n}` : `AI TIERS OK: ${n} checks`); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
