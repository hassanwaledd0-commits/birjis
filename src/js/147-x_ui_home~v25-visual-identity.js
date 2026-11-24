/* ---------- v25 visual identity (prefix id): «ورق المخطّطات والصندوق البرتقالي»
   The colour tokens live in p1s.html (:root, dark). This late layer re-skins the components on top of them:
   flat paper surfaces with hairlines (no glass, no gradients, no floating shadows), squared 8–14 px corners instead of pills,
   one accent (flight-recorder orange) with graphite ink and an instrument-teal for small labels, a faint chart-paper grid behind everything.
   Selectors start with `body` so they win over the styles that other modules inject later (x_profile, x_brand, ...). ---------- */
(function(){
  const css=`
/* ===== ground: chart paper ===== */
body .uiCl,body .uiSt{display:none}
body{font-size:15px}
::selection{background:color-mix(in srgb,var(--accent) 28%,transparent)}

body #uiTheme{display:none}
/* ===== v28: one dark neutral look (shadcn / 21st.dev style): grid + top spotlight, hairline cards with a soft sheen and a cursor spotlight, bento shortcuts ===== */
body .uiSky{background:radial-gradient(ellipse 70% 45% at 50% -8%,rgb(255 178 62 / .10),transparent 70%),var(--bg)}
body .uiSky::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgb(255 255 255 / .035) 1px,transparent 1px),linear-gradient(90deg,rgb(255 255 255 / .035) 1px,transparent 1px);background-size:56px 56px;-webkit-mask-image:radial-gradient(ellipse 80% 60% at 50% 0%,#000,transparent 78%);mask-image:radial-gradient(ellipse 80% 60% at 50% 0%,#000,transparent 78%)}
body .pitem,body .matcard,body .fxcard,body .book,body .lbk,body .dcard,body .dsec,body .gt,body .uiRowC,body .uiQ,body .uiDay,body .myCd,body .leq,body .lnote,body .lquiz,body .fsc{
  background:radial-gradient(260px circle at var(--mx,-999px) var(--my,-999px),rgb(255 178 62 / .10),transparent 70%),linear-gradient(180deg,rgb(255 255 255 / .04),rgb(255 255 255 / .012)),var(--panel);border-color:var(--line);transition:border-color var(--dur1),transform var(--dur2) var(--ease)}
body .pitem:hover,body .matcard:hover,body .fxcard:hover,body .book:hover,body .lbk:hover,body .dcard:hover,body .gt:hover,body .uiQ:hover,body .uiDay:hover,body .fsc:hover{border-color:color-mix(in srgb,var(--accent) 50%,var(--line))}
body .uiQ:hover,body .uiDay:hover{transform:translateY(-2px)}
@media (min-width:700px){
  body .uiQuick{grid-template-columns:repeat(4,minmax(0,1fr))}
  body .uiQuick .uiQ:nth-child(-n+2){grid-column:span 2;min-height:92px}
}
@media (min-width:1100px){ body .uiQuick{grid-template-columns:repeat(4,minmax(0,1fr))} }
/* ===== header: one calm row ===== */
body .top{gap:8px;padding:6px 0 10px;border-bottom:1px solid var(--line)}
body .brand .sub{display:none}
body .brand .mark,body .brand .mark svg{width:40px;height:40px;border-radius:10px;box-shadow:none}
body .brand h1{font-size:20px;letter-spacing:0}
body .top .seg{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:3px;box-shadow:none;-webkit-backdrop-filter:none;backdrop-filter:none;gap:2px}
body .top .seg button{border-radius:7px;min-height:36px;padding:0 13px;font-size:13.5px;font-weight:600;color:var(--muted)}
body .top .seg button:hover{color:var(--ink)}
body .top .seg button[aria-pressed="true"]{background:var(--ink);color:var(--bg)}
body #q{border-radius:10px;background-color:var(--panel);border:1px solid var(--line);box-shadow:none;min-height:42px}
body #q:focus{border-color:var(--accent);outline:0;box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 22%,transparent)}
body .uiTheme{width:42px;height:42px;border-radius:10px;background:var(--panel);border:1px solid var(--line);box-shadow:none;-webkit-backdrop-filter:none;backdrop-filter:none}
body .uiTheme:hover{border-color:var(--ink)}
@media (max-width:640px){ body .top{gap:6px} body .top .seg button{padding:0 10px;font-size:13px} body .brand h1{font-size:19px} }

/* ===== controls ===== */
body .btn{border-radius:var(--r);box-shadow:none;background:var(--panel);border:1px solid var(--line);min-height:42px;font-weight:600;transition:background var(--dur1),border-color var(--dur1),transform var(--dur1) var(--ease)}
body .btn:hover{border-color:var(--ink);background:var(--panel2)}
body .btn:active{transform:translateY(1px)}
body .btn.pri{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
body .btn.pri:hover{background:color-mix(in srgb,var(--accent) 88%,#000)}
body .chip{border-radius:var(--r);box-shadow:none;min-height:36px}
body .chip[aria-pressed="true"],body .chip.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}
body .seg{border-radius:10px;box-shadow:none}
body .seg button[aria-pressed="true"],body .tg[aria-pressed="true"]{background:var(--ink);border-color:var(--ink);color:var(--bg)}
body input,body select,body textarea{border-radius:var(--r)}
body :focus-visible{outline:2.5px solid var(--accent);outline-offset:2px}
body .chip,body .pitem,body .matcard,body .fxcard,body .book,body .lbk,body .dcard,body .dsec,body .gt,body .msg{box-shadow:none}
body .pitem,body .matcard,body .fxcard,body .book,body .lbk,body .dcard,body .dsec,body .gt{border-radius:var(--r-lg)}
body .pitem:hover,body .matcard:hover,body .fxcard:hover,body .book:hover,body .lbk:hover{border-color:var(--accent)}
body .view{border-radius:var(--r-xl);box-shadow:none;border:1px solid var(--line);background:linear-gradient(180deg,var(--sky1),var(--sky2))}
body .card{background:var(--panel);-webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:0 18px 40px -22px rgb(var(--shadow) / .45);border-color:var(--line);border-radius:var(--r-xl)}
body .dock{border-radius:var(--r-lg);box-shadow:var(--sh2);background:color-mix(in srgb,var(--panel) 94%,transparent);border:1px solid var(--line)}

/* ===== navigation: bottom bar (phones) / side rail (desktop) ===== */
body .uiNav{background:var(--panel);-webkit-backdrop-filter:none;backdrop-filter:none;border-top:1px solid var(--line);box-shadow:none}
body .uiNav .tg{border-radius:0;position:relative;font-size:12px;font-weight:600;color:var(--muted)}
body .uiNav .tg[aria-pressed="true"]{color:var(--ink);font-weight:700}
body .uiNav .tg[aria-pressed="true"]::before{content:"";position:absolute;inset-inline:22%;top:-1px;height:3px;border-radius:0 0 3px 3px;background:var(--accent)}
body .uiNav .tg[aria-pressed="true"] .uiNi{background:color-mix(in srgb,var(--accent) 14%,transparent);transform:none}
body .uiNi{width:46px;height:30px;border-radius:9px}
:root[data-theme="dark"] body .uiNav .tg[aria-pressed="true"],:root[data-theme="dark"] .uiNav .tg[aria-pressed="true"]{color:var(--ink)}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) .uiNav .tg[aria-pressed="true"]{color:var(--ink)}}
@media (min-width:1000px){
  body .uiNav{border:1px solid var(--line);border-radius:var(--r-xl);box-shadow:none;padding:8px 6px}
  body .uiNav .tg{border-radius:var(--r)}
  body .uiNav .tg[aria-pressed="true"]::before{inset:auto;inset-inline-start:-7px;top:22%;bottom:22%;width:3px;height:auto;border-radius:3px}
}

/* ===== sub-tabs: underlined, scroll fades ===== */
body .tabs{margin-top:-2px}
body .tsub{border-top:0;border-bottom:1px solid var(--line);gap:0;padding:0 14px;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 14px,#000 calc(100% - 14px),transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 14px,#000 calc(100% - 14px),transparent 100%)}
body .tsub button{border-radius:0;padding:10px 14px;min-height:44px;font-weight:600;font-size:14px;color:var(--muted);background:transparent;box-shadow:none;position:relative}
body .tsub button[aria-selected="true"]{background:transparent;color:var(--ink);box-shadow:inset 0 -3px 0 var(--accent)}
body .tsub button#t-ckpt::after{background:var(--accent);color:var(--accent-ink);border-radius:4px;font-size:10px}

/* ===== home ===== */
body .uiHome{gap:16px}
body .uiHero{background:var(--panel);color:var(--ink);border:1px solid var(--line);border-radius:var(--r-xl);box-shadow:none;padding:16px 16px 14px;grid-template-columns:minmax(0,1fr) auto;gap:10px 12px}
body .uiHero::before{content:"";position:absolute;inset-block:0;inset-inline-start:0;width:5px;background:var(--accent)}
body .uiHeroTxt{gap:6px}
body .uiKick{color:var(--signal);font-size:11px}
body .uiKick .bwKm{display:inline-flex;vertical-align:-4px;margin-inline-end:6px}
body .uiHero h2{color:var(--ink);font-size:clamp(20px,5.4vw,26px);line-height:1.35}
body .uiHero p{color:var(--muted);font-size:14px}
body .uiHeroBob{width:76px;height:80px;overflow:hidden;align-self:start;margin:0;place-items:start center}
body .uiHeroBtns{margin-top:2px;display:grid;grid-template-columns:minmax(0,1fr)}
body .uiGhost{background:var(--panel2);border:1px solid var(--line);color:var(--muted);justify-content:flex-start;gap:10px;min-height:46px;border-radius:var(--r);font-weight:500;width:100%}
body .uiGhost:hover{border-color:var(--accent);color:var(--ink)}
body .uiRings{border-top:1px solid var(--line);padding:10px 0 0;grid-template-columns:repeat(auto-fit,minmax(74px,1fr));gap:6px}
body .uiRg{color:var(--ink);grid-template:"r" 56px "l" auto/1fr}
body .uiRg svg{width:56px;height:56px}
body .uiRg b{font-size:13px}
body .uiRg small{color:var(--muted);font-size:11.5px}
body .uiRgT{stroke:var(--line)}
body .uiDue b{background:color-mix(in srgb,var(--accent) 16%,transparent);border-color:var(--accent);color:var(--accent);width:48px;height:48px}
@media (min-width:900px){
  body .uiHero{grid-template-columns:minmax(0,1fr) auto auto;padding:18px 22px 16px;align-items:center}
  body .uiHeroTxt{grid-column:1;grid-row:1}
  body .uiRings{grid-column:2;grid-row:1;grid-template-columns:repeat(3,76px);border-top:0;padding:0;padding-inline-start:20px;border-inline-start:1px solid var(--line)}
  body .uiHeroBob{grid-column:3;grid-row:1;width:100px;height:104px;align-self:center;place-items:end center;overflow:visible}
  body .uiDue{grid-column:1/-1}
  body .uiHeroBtns{max-width:520px}
}
body .uiH3{font-size:16px;font-weight:700;gap:10px}
body .uiH3::after{background:var(--line)}
body .uiRowC{border-radius:var(--r-lg);box-shadow:none;min-height:68px;transition:border-color var(--dur1),background var(--dur1)}
body .uiRowC:hover{transform:none;box-shadow:none;border-color:var(--accent)}
body .uiRi{border-radius:10px;background:color-mix(in srgb,var(--accent) 11%,var(--panel))}
body .uiRt2 small{color:var(--signal)}
body .uiConts .uiRowC:first-child{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
body .uiConts .uiRowC:first-child:hover{background:color-mix(in srgb,var(--accent) 90%,#000)}
body .uiConts .uiRowC:first-child .uiRi{background:rgb(255 255 255 / .2)}
body .uiConts .uiRowC:first-child .uiRi svg,body .uiConts .uiRowC:first-child .uiGoI svg{stroke:var(--accent-ink)}
body .uiConts .uiRowC:first-child small,body .uiConts .uiRowC:first-child em{color:inherit;opacity:.88}
body .uiQuick{gap:8px;grid-template-columns:repeat(2,minmax(0,1fr))}
@media (min-width:700px){body .uiQuick{grid-template-columns:repeat(4,minmax(0,1fr))}}
body .uiQ{grid-template-columns:auto minmax(0,1fr);grid-template-rows:auto auto;column-gap:10px;row-gap:0;align-items:center;align-content:center;min-height:68px;padding:10px 12px;border-radius:var(--r-lg);box-shadow:none;transition:border-color var(--dur1)}
body .uiQ:hover{transform:none;box-shadow:none;border-color:var(--accent)}
body .uiQuick .uiQ:nth-child(n) .uiQi{grid-row:1/3;width:40px;height:40px;border-radius:10px;margin:0;box-shadow:none;background:color-mix(in srgb,var(--accent) 12%,var(--panel))}
body .uiQuick .uiQ:nth-child(n) .uiQi svg{stroke:var(--accent);width:22px;height:22px}
body .uiQ b{font-size:14.5px;line-height:1.3;align-self:end}
body .uiQ small{font-size:12px;line-height:1.35;align-self:start}
body .uiDay{border-radius:var(--r-xl);box-shadow:none}
body .uiDk{background:var(--ink);color:var(--bg);border-radius:5px;font-size:11px;letter-spacing:.02em}
body .uiDi{border-radius:var(--r)}
body .uiStats>div{background:var(--panel);box-shadow:none;border-radius:var(--r-lg)}
body .uiStats b{color:var(--ink)}
/* profile and assessment cards (injected by x_profile): slim, side by side on wide screens */
body .myHm{gap:8px}
@media (min-width:760px){body .myHm{grid-template-columns:repeat(2,minmax(0,1fr))}}
body .myCd{border-radius:var(--r-lg);box-shadow:none;padding:12px 14px;gap:6px}
body .myCd h3{font-size:15px}
body .myBt{border-radius:var(--r)}
body .myCp{border-radius:var(--r)}

/* ===== flight setup: everything reachable without a long scroll ===== */
body .flysetup{gap:12px;min-width:0}
body .flysetup>*,body .flysetup .fsec{min-width:0;max-width:100%}
body .flysetup .fsec h4{margin:0 0 6px;font-size:12.5px;font-weight:700;color:var(--muted);letter-spacing:.01em}
body .flysetup .chip{min-height:38px}
body .flysetup .chip[aria-pressed="true"]{background:var(--ink);border-color:var(--ink);color:var(--bg)}
body .fsc{border-radius:var(--r-lg);box-shadow:none;padding:10px 12px;transition:border-color var(--dur1)}
body .fsc:hover{border-color:var(--ink)}
body .fsc[aria-pressed="true"]{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent);background:color-mix(in srgb,var(--accent) 7%,var(--panel))}
body .fgo{position:sticky;bottom:calc(var(--nav-h) + env(safe-area-inset-bottom) + 8px);z-index:30;flex-wrap:nowrap;gap:10px;padding:8px 10px;background:var(--panel);border:1px solid var(--line);border-radius:var(--r-lg);box-shadow:var(--sh2)}
body .fgo .btn.pri{flex:none;min-height:48px;padding:0 24px;font-size:15.5px}
body .fgo .fsum{flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:0;overflow:hidden;white-space:nowrap;font-size:12.5px;color:var(--muted)}
body .fgo .fsum span{flex:none}
body .fgo .fsum span+span::before{content:"·";margin-inline:6px;opacity:.6}
body .fgo .fsum span:first-child{color:var(--ink);font-weight:700}
body .fgo .status{flex:none}
body .fgo .status:empty{display:none}
@media (min-width:1000px){ body .fgo{bottom:12px} }
@media (max-width:640px){
  body .fgo{padding-left:78px}   /* keeps clear of the Bobby tab in the corner */
  body .flysetup .fsec .chips{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;margin-inline:-16px;padding-inline:16px;padding-bottom:2px}
  body .flysetup .fsec .chips::-webkit-scrollbar{display:none}
  body .flysetup .fsec .chips .chip{flex:none;white-space:nowrap}
  body .flysetup .fkapts{display:grid;grid-template-columns:none;grid-auto-flow:column;grid-auto-columns:minmax(188px,62%);overflow-x:auto;scroll-snap-type:x mandatory;margin-inline:-16px;padding-inline:16px;padding-bottom:6px;scrollbar-width:none}
  body .flysetup .fkapts::-webkit-scrollbar{display:none}
  body .flysetup .fkapts .fsc{scroll-snap-align:start}
  body .flysetup .fscn:not(.fkapts){grid-template-columns:minmax(0,1fr);gap:6px}
}
@media (min-width:1000px){
  body .flysetup{grid-template-columns:repeat(2,minmax(0,1fr));column-gap:20px;align-items:start}
  body .flysetup>.status,body .flysetup>.fgo,body .flysetup>.fhelpd,body .flysetup>.fsec:has(.fkapts),body .flysetup>.fsec:has(.fscn),body .flysetup>div:not(.fsec){grid-column:1/-1}
}

/* ===== lesson cards / forms that were pill-shaped ===== */
body .lbk[aria-pressed="true"]{background:color-mix(in srgb,var(--accent) 9%,var(--panel));color:var(--ink);border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}
body .lbk[aria-pressed="true"] small,body .lbk[aria-pressed="true"] em{color:var(--muted)}
body .lbk[aria-pressed="true"] .lbn{color:var(--signal)}
body .star{color:var(--muted)}
body .star[aria-pressed="true"]{color:var(--accent)}
body .abW{border-radius:var(--r-xl);box-shadow:none;background:radial-gradient(90% 70% at 100% 0%,rgb(255 138 61 / .18),transparent 60%),linear-gradient(160deg,#1E1E22,#0E0E11 72%)}
body .bwRpB{border-radius:var(--r);background:var(--panel)}
body .pill,body .tag,body .tsub .badge{border-radius:6px}
footer{border-top:1px solid var(--line);padding-top:var(--s4);font-size:12.5px}
`;
  const st=document.createElement("style"); st.id="idv25"; st.textContent=css; document.head.appendChild(st);
  /* keep the browser chrome colour in step with the paper */
  try{ const m=document.querySelector('meta[name="theme-color"]'); if(m) m.setAttribute("content",document.documentElement.getAttribute("data-theme")==="dark"?"#0D0F12":"#F2EFE7"); }catch(e){}
})();

/* cursor spotlight on cards + keyboard shortcut for search (Ctrl/Cmd+K or "/") */
(function(){
  const SEL=".pitem,.matcard,.fxcard,.book,.lbk,.dcard,.dsec,.gt,.uiRowC,.uiQ,.uiDay,.myCd,.leq,.lnote,.lquiz,.fsc";
  try{ if(matchMedia("(hover:hover)").matches) document.addEventListener("pointermove",e=>{ const c=e.target&&e.target.closest&&e.target.closest(SEL); if(!c) return; const r=c.getBoundingClientRect(); c.style.setProperty("--mx",(e.clientX-r.left).toFixed(0)+"px"); c.style.setProperty("--my",(e.clientY-r.top).toFixed(0)+"px"); },{passive:true}); }catch(e){}
  document.addEventListener("keydown",e=>{
    const t=e.target, typing=t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable);
    const hit=((e.ctrlKey||e.metaKey)&&(e.key==="k"||e.key==="K"))||(e.key==="/"&&!typing&&!e.ctrlKey&&!e.metaKey&&!e.altKey);
    if(!hit||(typeof BW!=="undefined"&&BW.open)) return;
    const q=document.getElementById("q"); e.preventDefault();
    if(q&&q.offsetParent!==null){ q.focus(); q.select(); }
    else if(typeof setTab==="function"){ setTab("parts"); setTimeout(()=>{ const i=document.getElementById("uiPq"); if(i) i.focus(); },80); }
  });
})();
