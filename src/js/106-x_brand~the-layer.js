/* ---------- the layer ---------- */
function bwCss(){
  if(document.getElementById("bwCss")) return;
  const st=document.createElement("style"); st.id="bwCss"; st.textContent=`
.bwW{position:fixed;inset:0;z-index:100000;display:grid;overflow:auto;overscroll-behavior:contain;padding:max(16px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));color:var(--ink);font-family:var(--font-ar);
  background:radial-gradient(80% 55% at 50% -5%,rgb(244 177 62 / .30),transparent 62%),radial-gradient(70% 50% at 50% 108%,rgb(43 108 184 / .22),transparent 70%),linear-gradient(180deg,var(--sky1),var(--bg) 62%,var(--sky2));opacity:0;transition:opacity .5s var(--ease),transform .5s var(--ease)}
.bwW.bwIn{opacity:1}.bwW.bwOut{opacity:0;transform:scale(1.025);pointer-events:none}
.bwSt{position:absolute;inset:0;pointer-events:none;opacity:0;background-image:radial-gradient(1.4px 1.4px at 12% 16%,#fff,transparent),radial-gradient(1px 1px at 28% 38%,#fff,transparent),radial-gradient(1.6px 1.6px at 46% 10%,#fff,transparent),radial-gradient(1px 1px at 63% 28%,#fff,transparent),radial-gradient(1.4px 1.4px at 82% 14%,#fff,transparent),radial-gradient(1px 1px at 90% 44%,#fff,transparent),radial-gradient(1.2px 1.2px at 8% 62%,#fff,transparent),radial-gradient(1px 1px at 74% 70%,#fff,transparent),radial-gradient(1.2px 1.2px at 36% 82%,#fff,transparent)}
:root[data-theme="dark"] .bwSt{opacity:.8}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .bwSt{opacity:.8}}
.bwC{position:relative;width:100%;max-width:560px;margin:auto;display:grid;grid-template-columns:minmax(0,1fr);justify-items:center;align-items:center;gap:14px;text-align:center;grid-template-areas:"brand" "bobby" "bubble" "form" "cta" "skip" "lang"}
.bwBr{grid-area:brand;display:flex;align-items:center;justify-content:center;gap:12px}
.bwLg{position:relative;width:58px;height:58px;flex:none}
.bwLg svg{display:block;width:100%;height:100%;filter:drop-shadow(0 14px 22px rgb(10 30 60 / .42))}
.bwLg::before{content:"";position:absolute;inset:-6px;border-radius:30px;border:2px solid var(--gold);opacity:0}
.bwWk{display:grid;justify-items:start;gap:2px;line-height:1.2}
.bwWk b{font-size:28px;font-weight:700;letter-spacing:0}
.bwWh{margin:0;font:inherit;line-height:inherit}
.bwWk b{display:block;line-height:0}.bwWk b .bwWsv{display:block;width:auto;color:var(--ink)}.bwWk b .bwWsv.ar{height:34px}.bwWk b .bwWsv.lat{height:26px}
.bwWk span{font:600 12.5px/1.2 var(--font-mono);letter-spacing:.34em;color:var(--signal);text-indent:.34em}
.bwWk span[lang="ar"]{font:600 14px/1.3 var(--font-ar);letter-spacing:.04em;text-indent:0}
.bwTg{display:none}
.bwBub{grid-area:bubble;position:relative;width:100%;max-width:460px;min-height:72px;display:grid;align-items:center;padding:14px 18px 14px 44px;border-radius:20px;background:var(--panel);border:1px solid var(--line);box-shadow:var(--sh2);font-size:16.5px;line-height:1.85}
.bwBub::after{content:"";position:absolute;top:-8px;left:calc(50% - 8px);width:16px;height:16px;background:var(--panel);border:1px solid var(--line);border-bottom:0;border-right:0;transform:rotate(45deg)}
.bwW[dir="ltr"] .bwBub{padding:14px 44px 14px 18px}
.bwSpk{position:absolute;top:50%;left:8px;transform:translateY(-50%);width:32px;height:32px;display:grid;place-items:center;padding:0;border:0;border-radius:50%;background:var(--panel2);color:var(--muted);cursor:pointer}.bwW[dir="ltr"] .bwSpk{left:auto;right:8px}
.bwSpk svg{width:18px;height:18px}.bwSpk:hover{color:var(--ink)}
.bwBub p{margin:0;overflow-wrap:anywhere}
.bwBo{grid-area:bobby;display:grid;place-items:end center;min-height:96px;margin-bottom:-4px}
.bwLs{grid-area:lang;display:inline-flex;margin-top:2px;padding:3px;border-radius:999px;background:var(--panel2);border:1px solid var(--line)}
.bwLs button{min-height:34px;padding:0 16px;font-size:14px!important;border:0;border-radius:999px;background:transparent;color:var(--ink);font-weight:600;font-size:15px}
.bwLs button[aria-pressed="true"]{background:var(--accent);color:var(--accent-ink)}
.bwGo{grid-area:cta;display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:58px;max-width:100%;padding:0 32px;border:0;border-radius:999px;background:linear-gradient(135deg,var(--gold),var(--gold2));color:var(--gold-ink);font:700 18px/1.2 var(--font-ar);box-shadow:0 14px 30px -12px rgb(232 145 42 / .8),inset 0 1px 0 rgb(255 255 255 / .55);transition:transform var(--dur1) var(--ease),box-shadow var(--dur2) var(--ease)}
.bwGo:hover{transform:translateY(-1px)}.bwGo:active{transform:translateY(1px)}.bwGo svg{width:22px;height:22px;flex:none}
.bwGo.bwPulse{animation:bwPulse 2.6s var(--ease) infinite}
.bwSk{grid-area:skip;min-height:40px;padding:0 16px;border:0;background:none;color:var(--muted);font-size:14.5px;text-decoration:underline;text-underline-offset:4px}
.bwW button:focus-visible{outline:3px solid var(--accent);outline-offset:3px}
.bwW.bwIn .bwLg::before{animation:bwRing 1.6s .3s var(--ease) 1 both}
.bwW.bwIn .bwLg{animation:bwPop .7s var(--ease) both}
.bwW.bwIn .bwLw{animation:bwWing .8s .15s var(--ease) both;transform-box:fill-box}
.bwW.bwIn .bwLd{animation:bwDot .8s .55s cubic-bezier(.3,1.5,.5,1) both;transform-box:fill-box;transform-origin:center}
.bwW.bwIn .bwWk,.bwW.bwIn .bwTg{animation:bwUp .6s .45s var(--ease) both}
.bwW.bwIn .bwBub{animation:bwUp .6s .75s var(--ease) both}
.bwW.bwIn .bwLs,.bwW.bwIn .bwGo,.bwW.bwIn .bwSk,.bwW.bwIn .bwFm{animation:bwUp .6s .95s var(--ease) both}
@keyframes bwPop{from{opacity:0;transform:scale(.55) rotate(-8deg)}to{opacity:1;transform:none}}
@keyframes bwWing{from{opacity:0;transform:translate(-9px,5px) rotate(-9deg)}to{opacity:1;transform:none}}
@keyframes bwDot{from{opacity:0;transform:translateY(-14px) scale(.3)}to{opacity:1;transform:none}}
@keyframes bwUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes bwRing{0%{opacity:.9;transform:scale(.9)}100%{opacity:0;transform:scale(1.7)}}
@keyframes bwPulse{0%,100%{box-shadow:0 14px 30px -12px rgb(232 145 42 / .8),0 0 0 0 rgb(244 177 62 / .45),inset 0 1px 0 rgb(255 255 255 / .55)}60%{box-shadow:0 14px 30px -12px rgb(232 145 42 / .8),0 0 0 14px rgb(244 177 62 / 0),inset 0 1px 0 rgb(255 255 255 / .55)}}
@media (max-height:700px) and (orientation:portrait){.bwLg{width:48px;height:48px}.bwWk b{font-size:24px}.bwC{gap:10px}.bwBub{min-height:0;font-size:15.5px;line-height:1.75}.bwGo{min-height:52px}}
@media (orientation:landscape) and (max-height:560px){
  .bwC{max-width:880px;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);column-gap:30px;row-gap:8px;grid-template-areas:"brand bubble" "bobby form" "bobby cta" "bobby skip" "bobby lang"}
  .bwLg{width:60px;height:60px}.bwWk b{font-size:24px}.bwTg{display:none}.bwBub{max-width:none;min-height:0;font-size:15.5px;line-height:1.7;padding-block:12px}.bwBub::after{display:none}.bwGo{min-height:50px;font-size:17px}.bwLs button{min-height:34px}.bwSk{min-height:34px}}
@media (prefers-reduced-motion:reduce){.bwW,.bwW *{animation:none!important;transition:opacity .2s linear!important}.bwW.bwOut{transform:none}}
.bwFm{grid-area:form;display:grid;gap:10px;justify-items:center;width:100%;grid-template-columns:minmax(0,1fr)}.bwFm[hidden]{display:none}
.bwNmF{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;width:100%}.bwNmF[hidden],.bwRl[hidden]{display:none}
.bwNmI{min-height:52px;width:min(300px,100%);font:inherit;font-size:19px;text-align:center;border-radius:16px;border:1.5px solid var(--line);background:var(--panel);color:var(--ink);padding:0 14px;unicode-bidi:plaintext}
.bwNmI[aria-invalid="true"]{border-color:#c0392b}
.bwNx{min-height:52px;padding:0 26px;border:0;border-radius:999px;background:linear-gradient(135deg,var(--gold),var(--gold2));color:var(--gold-ink);font:700 17px/1.2 var(--font-ar);cursor:pointer}
.bwRl{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}.bwRl button{min-height:50px;padding:0 20px;border-radius:999px;border:1.5px solid var(--line);background:var(--panel);color:var(--ink);font:600 16px/1.2 var(--font-ar);cursor:pointer}
.bwRl button:hover{border-color:var(--accent)}.bwPv{margin:0;font-size:12.5px;color:var(--muted);max-width:360px}
.bwRp{display:flex;justify-content:center;padding:4px 0 8px}
.bwRpB{display:inline-flex;align-items:center;gap:10px;min-height:44px;padding:0 16px 0 14px;border-radius:999px;border:1px solid var(--line);background:var(--glass);color:var(--muted);font-size:13.5px}
.bwRpB:hover{color:var(--ink);border-color:var(--accent)}.bwRpB svg{width:24px;height:24px;border-radius:7px;flex:none}
.bwRpB .e,:root[lang="en"] .bwRpB .a{display:none}:root[lang="en"] .bwRpB .e{display:inline}
.bwHi{position:fixed;z-index:99990;top:max(10px,env(safe-area-inset-top));left:50%;width:min(460px,calc(100% - 24px));transform:translate(-50%,-16px);opacity:0;display:flex;align-items:center;gap:10px;padding:8px 8px 8px 12px;border-radius:20px;background:var(--panel);border:1px solid var(--line);box-shadow:var(--sh2);color:var(--ink);font-family:var(--font-ar);transition:opacity .35s var(--ease),transform .35s var(--ease);cursor:pointer}
.bwHi.bwIn{opacity:1;transform:translate(-50%,0)}.bwHi.bwOut{opacity:0;transform:translate(-50%,-12px);pointer-events:none}
.bwHiA{flex:none;width:52px;height:52px;display:grid;place-items:center;overflow:hidden;border-radius:50%;background:var(--panel2)}
.bwHi p{margin:0;flex:1;min-width:0;font-size:14.5px;line-height:1.6;overflow-wrap:anywhere}
.bwHiX{flex:none;width:36px;height:36px;border:0;border-radius:50%;background:transparent;color:var(--muted);font-size:22px;line-height:1;cursor:pointer}.bwHiX:hover{background:var(--panel2);color:var(--ink)}
@media (prefers-reduced-motion:reduce){.bwHi{transition:opacity .2s linear}}
.bwKm{display:inline-block;vertical-align:middle;width:20px;height:20px;margin-inline-end:8px;line-height:0}.bwKm svg{width:20px;height:20px;display:block}
`; document.head.appendChild(st);
}
const bwSpkIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
const bwGoIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
function bwFocusables(){ return BW.el?[...BW.el.querySelectorAll("button:not([hidden]),input")].filter(b=>!b.closest("[hidden]")).filter(b=>b.offsetParent!==null||b===document.activeElement):[]; }
function bwRender(){
  const el=BW.el; if(!el) return; const l=BW.lang, ar=l==="ar";
  el.lang=l; el.dir=ar?"rtl":"ltr"; el.setAttribute("aria-label",bwT("dlg"));
  el.querySelector(".bwWk").innerHTML=ar?`<h1 class="bwWh"><b lang="ar">${bwWord()}</b></h1><span lang="en">BIRJIS</span>`:`<h1 class="bwWh"><b lang="en">${bwWordLat()}</b></h1><span lang="ar">بيرجس</span>`;
  el.querySelector(".bwTg").textContent=bwT("tag");
  const stp=BW.step; el.querySelector(".bwBub p").textContent=stp?bwStepText(stp,l):bwText(l);
  const go=el.querySelector(".bwGo"); go.innerHTML=(BW.state==="ask"?bwSpkIco:bwGoIco)+`<span>${stp==="offer"?BW_Q.assess[l]:bwT(BW.state==="ask"?"start":"enter")}</span>`; go.classList.toggle("bwPulse",(BW.state==="ask"||stp==="offer")&&!bwReduced());
  go.hidden=stp==="name"||stp==="role"; const sk=el.querySelector(".bwSk"); sk.textContent=stp==="offer"?BW_Q.later[l]:stp==="name"?BW_Q.notNow[l]:bwT("skip"); sk.hidden=stp==="hello";
  const spk=el.querySelector(".bwSpk"); if(spk){ spk.innerHTML=bwSpkIco; spk.setAttribute("aria-label",BW_Q.listen[l]); spk.title=BW_Q.listen[l]; }
  const fm=el.querySelector(".bwFm"), nf=fm.querySelector(".bwNmF"), rl=fm.querySelector(".bwRl"); fm.hidden=!(stp==="name"||stp==="role"); nf.hidden=stp!=="name"; rl.hidden=stp!=="role";
  if(stp==="name"){ el.querySelector("label[for=bwNm]").textContent=BW_Q.name[l]; el.querySelector("#bwNm").placeholder=BW_Q.namePh[l]; el.querySelector(".bwNx").textContent=BW_Q.next[l]; }
  if(stp==="role"&&typeof MY_ROLES!=="undefined"){ rl.setAttribute("aria-label",BW_Q.field[l]); rl.innerHTML=MY_ROLES.map(r=>`<button type="button" data-bwr="${r.k}">${r[l]}</button>`).join(""); }
  fm.querySelector(".bwPv").textContent=fm.hidden?"":BW_Q.privacy[l];
  const ls=el.querySelector(".bwLs"); ls.hidden=!BW.pick||(!!stp&&stp!=="name"); ls.setAttribute("aria-label",bwT("lang"));
  ls.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.bwl===l)));
}
function bwSize(){ const h=innerHeight, w=innerWidth; return (w>h&&h<=560)?Math.max(92,Math.min(150,Math.round(h*.34))):Math.max(104,Math.min(210,Math.round(h*.22))); }
function bwMountBob(){
  const box=BW.el&&BW.el.querySelector(".bwBo"); if(!box) return; let ok=false;
  if(typeof bobMount==="function"){ try{ BW.bob=bobMount(box,{size:bwSize(),view:"full"}); ok=!!BW.bob; }catch(e){ BW.bob=null; } }
  if(!ok) box.innerHTML=`<svg viewBox="0 0 48 48" width="96" height="96" aria-hidden="true"><circle cx="24" cy="25" r="11" fill="#F4B13E"/><path d="M4 31C14 41 34 35 44 20 36 31 16 35 4 31Z" fill="#fff"/></svg>`;
  else setTimeout(()=>{ try{ BW.bob&&BW.bob.gesture("wave"); }catch(e){} },900);
}
/* speak the greeting; returns false when nothing could be said (muted, no engine) */
function bwSpeak(){
  const tok=++BW.tok; BW.state="talk"; BW.started=true; clearTimeout(BW.closeT); const text=bwText(BW.lang);
  let ok=false;
  if(typeof bobSay==="function"){ try{ if(typeof bobStop==="function") bobStop();
    ok=bobSay(text,{lang:BW.lang,priority:"high",key:"bwhello",keyMs:0,onend:()=>{ if(BW.open&&BW.tok===tok){ if(bwFlowStart()) return; BW.state="done"; BW.closeT=setTimeout(()=>bwClose("end"),1500); } }}); }catch(e){ ok=false; } }
  if(!ok) BW.closeT=setTimeout(()=>{ if(BW.open&&BW.tok===tok){ if(bwFlowStart()) return; bwClose("end"); } },Math.max(3500,text.length*55));   /* muted or no engine: leave time to read the bubble */
  try{ BW.bob&&BW.bob.gesture("wave"); }catch(e){}
  bwRender(); return ok;
}
/* speech without a gesture: only when the browser may allow it; give up quickly (before Bobby's own 4 s watchdog) and remember what the browser did */
function bwAuto(){
  const act=!!(navigator.userActivation&&navigator.userActivation.hasBeenActive), flag=bwLS("bw-auto",""), seen=!!BW.seen;
  if(!(act||flag==="1"||(seen&&flag===""))) return;
  if(typeof bobSay!=="function"||typeof BOB==="undefined") return;
  bwSpeak();
  BW.autoT=setTimeout(()=>{ if(!BW.open||BW.state!=="talk") return;
    const worked=!!(BOB.cur&&BOB.cur.started);
    if(!act) bwLW("bw-auto",worked?"1":"0");
    if(!worked){ clearTimeout(BW.closeT); BW.tok++; try{ bobStop(); }catch(e){} BW.state="ask"; BW.started=false; bwRender(); } },1700);
}
function bwShow(o){
  o=o||{}; if(BW.open||!document.body) return false; bwCss(); bwHiClose(true);
  BW.step=""; BW.seen=bwLS("bw-seen","")==="1"||bwLS("atlas-bob-seen","")==="1"; BW.replay=!!o.replay; BW.lang=bwLang(); BW.pick=!BW.replay&&!bwLS("birjis-lang",""); BW.state="ask"; BW.started=false; BW.prevFocus=document.activeElement;
  bwLW("bw-seen","1"); bwLW("atlas-bob-seen","1");   /* Bobby's old corner greeting is replaced by this welcome (the time of the visit is stored when it closes: bwClose) */
  const el=document.createElement("div"); el.className="bwW"; el.id="bwW"; el.setAttribute("role","dialog"); el.setAttribute("aria-modal","true"); el.setAttribute("data-il-skip","");
  el.innerHTML=`<span class="bwSt" aria-hidden="true"></span><div class="bwC"><div class="bwBr"><div class="bwLg">${bwLogo()}</div><div class="bwWk"></div><div class="bwTg"></div></div>
<div class="bwBub" role="status" aria-live="polite"><p></p><button type="button" class="bwSpk"></button></div><div class="bwBo"></div>
<div class="bwFm" hidden><form class="bwNmF" hidden><label for="bwNm" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)"></label><input id="bwNm" class="bwNmI" maxlength="24" autocomplete="given-name" enterkeyhint="next"><button type="submit" class="bwNx"></button></form><div class="bwRl" role="group" hidden></div><p class="bwPv"></p></div>
<div class="bwLs" role="group"><button type="button" data-bwl="ar" lang="ar">العربية</button><button type="button" data-bwl="en" lang="en">English</button></div>
<button type="button" class="bwGo"></button><button type="button" class="bwSk"></button></div>`;
  document.body.appendChild(el); BW.el=el; BW.open=true;
  try{ if(typeof GL!=="undefined"&&GL.setPaused) GL.setPaused(true); }catch(e){}   /* v26: the welcome layer covers the screen, so the Home stage behind it stops rendering */
  [...document.body.children].forEach(c=>{ if(c!==el&&!c.inert&&!/^(SCRIPT|STYLE|LINK)$/.test(c.tagName)){ c.inert=true; BW.inerts.push(c); } });
  if(bwFlowNeeded()) bwStep("name",{quiet:true}); else bwRender();   /* v18: a new visitor is asked the name straight away (no extra "start" screen first) */
  el.addEventListener("click",e=>{
    const b=e.target.closest("button"); if(!b) return;
    if(b.classList.contains("bwGo")){ if(BW.step==="offer"){ bwClose("assess-go"); try{ if(typeof myAssessOpen==="function") myAssessOpen(); }catch(er){ console.error(er); } } else if(BW.state==="ask") bwSpeak(); else bwClose("enter"); }
    else if(b.classList.contains("bwSk")) bwClose("skip");
    else if(b.classList.contains("bwSpk")) bwListen();
    else if(b.dataset.bwr) bwPickRole(b.dataset.bwr);
    else if(b.dataset.bwl) bwSetLang(b.dataset.bwl);
  });
  el.querySelector(".bwNmF").addEventListener("submit",e=>{ e.preventDefault(); bwSubmitName(); });
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ if(!BW.el) return; el.classList.add("bwIn"); if(BW.step) return; const g=el.querySelector(".bwGo"); if(g) g.focus({preventScroll:true}); }));
  setTimeout(()=>{ if(BW.open) bwMountBob(); },60);
  setTimeout(()=>{ if(BW.open&&BW.state==="ask") bwAuto(); },700);
  return true;
}
function bwSetLang(l){
  if(l!=="ar"&&l!=="en") return; const was=BW.state;
  BW.lang=l; try{ if(typeof ilSetLang==="function") ilSetLang(l); else bwLW("birjis-lang",l); }catch(e){}
  BW.lang=l; BW.tok++; clearTimeout(BW.closeT);
  if(BW.step){ bwRender(); return; }
  if(was!=="ask"){ BW.state="ask"; } bwRender();
  if(was!=="ask") bwSpeak();   /* already talking: say it again in the new language */
}
function bwClose(why){
  if(!BW.open) return; BW.open=false; clearTimeout(BW.closeT); clearTimeout(BW.autoT); BW.tok++;
  bwMarkSeen(); try{ if((why==="skip"||why==="esc")&&!bwKnown()){ if(typeof myProfileSkip==="function") myProfileSkip(); bwLW("bw-skip-t",String(Date.now())); } }catch(e){}   /* a visitor who skipped is asked again after half a day (the Home card stays) */
  BW.step="";
  if((why==="skip"||why==="esc")&&typeof bobStop==="function") try{ bobStop(); }catch(e){}
  const el=BW.el; BW.inerts.forEach(c=>{ c.inert=false; }); BW.inerts=[];
  try{ if(typeof GL!=="undefined"&&GL.setPaused) GL.setPaused(false); }catch(e){}
  el.classList.remove("bwIn"); el.classList.add("bwOut");
  const done=()=>{ try{ BW.bob&&BW.bob.destroy(); }catch(e){} BW.bob=null; if(el.parentNode) el.remove(); if(BW.el===el) BW.el=null; };
  setTimeout(done,bwReduced()?220:520);
  try{ const p=BW.prevFocus; if(p&&p.isConnected&&p!==document.body&&p.focus) p.focus({preventScroll:true}); else if(document.activeElement&&document.activeElement.blur) document.activeElement.blur(); }catch(e){}
  try{ document.dispatchEvent(new CustomEvent("bw-welcome-done",{detail:{why}})); }catch(e){}
}
/* keyboard: Escape closes, Tab stays inside the layer */
document.addEventListener("keydown",e=>{
  if(!BW.open||!BW.el) return;
  if(e.key==="Escape"){ e.preventDefault(); e.stopPropagation(); bwClose("esc"); return; }
  if(e.key!=="Tab") return;
  const f=bwFocusables(); if(!f.length) return; const a=document.activeElement, i=f.indexOf(a);
  if(!BW.el.contains(a)){ e.preventDefault(); f[0].focus(); return; }
  if(e.shiftKey&&i<=0){ e.preventDefault(); f[f.length-1].focus(); } else if(!e.shiftKey&&i===f.length-1){ e.preventDefault(); f[0].focus(); }
},true);
document.addEventListener("click",e=>{ const b=e.target.closest&&e.target.closest("[data-bwreplay]"); if(b){ e.preventDefault(); bwShow({replay:true}); } });
document.addEventListener("il-lang",()=>{ if(!BW.open) return; const l=bwLang(); if(l!==BW.lang){ BW.lang=l; BW.tok++; clearTimeout(BW.closeT); if(BW.step){ bwRender(); return; } if(BW.state!=="ask"){ BW.state="ask"; try{ bobStop(); }catch(e){} } bwRender(); } });
addEventListener("resize",()=>{ if(!BW.open||!BW.bob) return; const s=bwSize(), w=BW.bob.el; if(w&&Math.abs(parseInt(w.style.width)-s)>24){ try{ BW.bob.destroy(); }catch(e){} BW.bob=null; bwMountBob(); } });
/* ---------- getting to know the visitor: name -> field -> a personal hello -> an offer of the assessment (x_profile.js stores the answers) ---------- */
const BW_Q={
  name:{ar:"شنو اسمك؟",en:"What's your name?"}, namePh:{ar:"اكتب اسمك",en:"Type your name"}, next:{ar:"يلا",en:"Next"}, field:{ar:"الاختصاص",en:"Field"},
  ask:{ar:h=>`${h}! آني ميسلون، مهندسك ببيرجس. شنو اسمك حتى أصيحك بيه؟`,en:h=>`${h}! I'm Maysaloon, your engineer at Birjis. What's your name, so I can call you by it?`},
  notNow:{ar:"بعدين",en:"Later"}, listen:{ar:"اسمع ميسلون",en:"Hear Maysaloon"},
  privacy:{ar:"يُحفظ اسمك واختصاصك على هذا الجهاز فقط ولا يغادر متصفحك.",en:"Your name and field stay on this device only and never leave your browser."},
  assess:{ar:"ابدأ التقييم",en:"Start the assessment"}, later:{ar:"لاحقاً، ادخل إلى بيرجس",en:"Later, enter Birjis"},
  role:{ar:n=>`تشرّفنا يا ${n}! شنو اختصاصك؟`,en:n=>`Nice to meet you, ${n}! What's your field?`},
  offer:{ar:"تحب نسوي تقييم سريع لمستواك؟ عشرة أسئلة تقريباً، وبعدها أعطيك تقريراً بنقاط القوة والضعف.",en:"Shall we do a quick assessment of your level? About ten questions, then a report on your strengths and weaknesses."}
};
function bwStepText(s,l){
  const p=typeof myProfile==="function"?myProfile():null, n=p&&p.name&&typeof myIso==="function"?myIso(p.name):"";
  if(s==="name") return BW_Q.ask[l](BW_HI[bwHour()][l]);
  if(s==="role") return BW_Q.role[l](n||(l==="en"?"friend":"يا صديقي"));
  if(s==="offer") return BW_Q.offer[l];
  const r=p&&p.role&&typeof myRoleOf==="function"?myRoleOf(p.role):null;   /* hello */
  if(l==="en") return `Welcome, ${r?r.hiEn.replace("{n}",n):n}! ${r?r.tipEn:""}`.trim();
  return `هلا بيك يا ${n}${r?"، "+r.hiAr:""}! ${r?r.tipAr:""}`.trim();
}
function bwFlowNeeded(){ try{ return typeof mySaveProfile==="function"&&!bwKnown()&&!bwSkipped(); }catch(e){ return false; } }   /* no name yet: ask it, unless "later" was pressed in the last half day */
function bwFlowStart(){ if(!BW.open||BW.step||!bwFlowNeeded()) return false; bwStep("name"); return true; }
function bwStep(s,o){
  o=o||{}; BW.step=s; BW.tok++; clearTimeout(BW.closeT); BW.state="flow"; bwRender(); const l=BW.lang, text=bwStepText(s,l), t0=Date.now(), tok=BW.tok;
  const next=()=>{ if(!BW.open||BW.tok!==tok||BW.step!==s) return; if(s==="hello"){ const w=Math.max(0,2400-(Date.now()-t0)); BW.closeT=setTimeout(()=>{ if(BW.open&&BW.tok===tok&&BW.step==="hello") bwStep("offer"); },w); } };
  const mute=o.quiet&&!(navigator.userActivation&&navigator.userActivation.hasBeenActive)&&bwLS("bw-auto","")!=="1";
  let ok=false; if(!mute) try{ if(typeof bobSay==="function"){ if(typeof bobStop==="function") bobStop(); ok=bobSay(text,{lang:l,priority:"high",key:"bwstep",keyMs:0,onend:next}); } }catch(e){ ok=false; }
  if(!ok&&s==="hello") BW.closeT=setTimeout(()=>{ if(BW.open&&BW.tok===tok&&BW.step==="hello") bwStep("offer"); },Math.max(3000,text.length*55));
  try{ BW.bob&&BW.bob.gesture(s==="hello"?"thumbs":"wave"); }catch(e){}
  const el=BW.el; if(!el) return; setTimeout(()=>{ try{ if(s==="name"){ const i=el.querySelector("#bwNm"), fine=(()=>{ try{ return matchMedia("(pointer:fine)").matches; }catch(e){ return true; } })(); if(i&&(fine||!o.quiet)) i.focus({preventScroll:true}); else { const g=el.querySelector(".bwSk"); if(g) g.focus({preventScroll:true}); } } else if(s==="role"){ const b=el.querySelector(".bwRl button"); if(b) b.focus({preventScroll:true}); } else if(s==="offer"){ const g=el.querySelector(".bwGo"); if(g) g.focus({preventScroll:true}); } }catch(e){} },60);
}
function bwSubmitName(){
  const i=BW.el&&BW.el.querySelector("#bwNm"); if(!i) return; const v=i.value.replace(/\s+/g," ").trim();
  if(!v){ i.setAttribute("aria-invalid","true"); i.focus(); return; } i.removeAttribute("aria-invalid");
  try{ mySaveProfile({name:v}); }catch(e){ console.error(e); } bwStep("role");
}
function bwPickRole(k){ try{ mySaveProfile({role:k}); }catch(e){ console.error(e); } bwStep("hello"); }
/* the "replay" tile of the Home screen (called from x_ui_home.js) */
function bwReplayHTML(){ return `<div class="bwRp" data-il-skip><button type="button" class="bwRpB" data-bwreplay>${bwLogo()}<span class="a" lang="ar">${BW_UI.replay.ar}</span><span class="e" lang="en">${BW_UI.replay.en}</span></button></div>`; }
/* v19: when it shows: EVERY time the site is entered, for everyone (a visitor with a name is greeted by name, a new one is asked the name).
   Only a quick reload (closed less than 3 minutes ago) skips it, and coming back to the page after 10 minutes away shows it again
   (an app keeps the page alive between visits). The time is stored only when the welcome is closed (bwClose), so a hidden preview never uses it up.
   Never judged by the session or the #hash; tests (webdriver), ?welcome=0 and window.bwAuto===false skip it. */
const BW_GAP=3*60*1000, BW_GAP_SKIP=12*3600*1000, BW_AWAY=10*60*1000;
function bwMarkSeen(){ bwLW("bw-last",String(Date.now())); }
/* "later" on the name question holds for half a day: until then the welcome greets without asking the name */
function bwSkipped(){ if(bwLS("birjis-profile-skip","")!=="1") return false; const t=+bwLS("bw-skip-t","0")||0; return !!t&&Date.now()-t<BW_GAP_SKIP; }
function bwKnown(){ let p=null; try{ p=myProfile(); }catch(e){ try{ p=JSON.parse(localStorage.getItem("birjis-profile")||"null"); }catch(x){ p=null; } } return !!(p&&p.name); }   /* x_profile.js runs after this file: before that its consts are not initialised, so read the store directly */
function bwWanted(){
  if(window.bwAuto===false) return false;
  const q=location.search||"";
  if(/[?&]welcome=0\b/.test(q)) return false;
  if(/[?&]welcome\b/.test(q)) return true;
  if(navigator.webdriver) return false;
  const last=+bwLS("bw-last","0")||0, now=Date.now();
  return !(last&&now>=last&&now-last<BW_GAP);
}
/* the short hello for a known visitor: a card at the top, Maysaloon's face and one sentence with the name; it does not block the page,
   goes away by itself, a tap reads it aloud (a tap is the gesture the browser needs for speech) */
function bwHi(){
  if(!document.body||document.getElementById("bwHi")||BW.open) return false; bwCss(); const l=bwLang(), en=l==="en", txt=bwText(l);
  const el=document.createElement("div"); el.id="bwHi"; el.className="bwHi"; el.setAttribute("role","status"); el.setAttribute("aria-live","polite"); el.setAttribute("data-il-skip",""); el.lang=l; el.dir=en?"ltr":"rtl";
  el.innerHTML=`<span class="bwHiA" aria-hidden="true"></span><p></p><button type="button" class="bwHiX" aria-label="${en?"Close":"إغلاق"}">×</button>`;
  el.querySelector("p").textContent=txt; document.body.appendChild(el);
  try{ if(typeof bobMount==="function") BW.hiBob=bobMount(el.querySelector(".bwHiA"),{size:52,view:"bust"}); }catch(e){ BW.hiBob=null; }
  if(!BW.hiBob) el.querySelector(".bwHiA").innerHTML=bwLogo();
  requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add("bwIn")));
  const say=()=>{ try{ if(typeof bobSay==="function"){ if(typeof bobStop==="function") bobStop(); bobSay(txt,{lang:l,priority:"high",key:"bwhi",keyMs:0}); } }catch(e){} };
  el.addEventListener("click",e=>{ if(e.target.closest(".bwHiX")){ bwHiClose(); return; } clearTimeout(BW.hiT2); BW.hiT2=setTimeout(bwHiClose,9000); say(); });
  BW.hiT=setTimeout(bwMarkSeen,1500); BW.hiT2=setTimeout(bwHiClose,8000);
  if((navigator.userActivation&&navigator.userActivation.hasBeenActive)||bwLS("bw-auto","")==="1") say();
  setTimeout(()=>{ try{ BW.hiBob&&BW.hiBob.gesture("wave"); }catch(e){} },700);
  return true;
}
function bwHiClose(now){ const el=document.getElementById("bwHi"); clearTimeout(BW.hiT); clearTimeout(BW.hiT2); if(!el) return; bwMarkSeen(); el.id=""; el.classList.remove("bwIn"); el.classList.add("bwOut");
  const done=()=>{ try{ BW.hiBob&&BW.hiBob.destroy(); }catch(e){} BW.hiBob=null; el.remove(); }; if(now) done(); else setTimeout(done,420); }
/* the replay tile and the Home "introduce yourself" card open the full layer (bwShow) */
function bwListen(){ const l=BW.lang; if(!BW.step){ bwSpeak(); return; } const t=bwStepText(BW.step,l); try{ if(typeof bobSay==="function"){ if(typeof bobStop==="function") bobStop(); bobSay(t,{lang:l,priority:"high",key:"bwstep",keyMs:0}); } }catch(e){} try{ BW.bob&&BW.bob.gesture("wave"); }catch(e){} }
try{ bwCss(); bwTouchIcon(); }catch(e){}
try{ if(bwWanted()){ const go=()=>setTimeout(()=>{ try{ bwShow(); }catch(e){ console.error(e); } },0); if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",go); else go(); } }catch(e){ console.error(e); }   /* after every script ran: the profile (x_profile.js) is read when the first bubble is drawn */
/* coming back to the page after a while (the app kept it open in the background): welcome again, but never in the middle of a flight */
{ let hid=0; document.addEventListener("visibilitychange",()=>{ try{
    if(document.visibilityState==="hidden"){ hid=Date.now(); return; }
    if(!hid||Date.now()-hid<BW_AWAY) return; hid=0;
    if(BW.open||window.bwAuto===false||navigator.webdriver||(typeof FLY!=="undefined"&&FLY.on)) return;
    const last=+bwLS("bw-last","0")||0; if(last&&Date.now()-last<BW_AWAY) return;
    bwShow(); }catch(e){} }); }
