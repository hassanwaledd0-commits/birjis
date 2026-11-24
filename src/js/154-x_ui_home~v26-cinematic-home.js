/* ---------- v26 cinematic Home (prefix uiS / id): the live 3D aircraft fills the screen behind the page and the camera moves with the scroll.
   Chapters (each one screen tall): hero, outside, inside (X-ray), engines, cockpit, fly. After the last one the page turns into the practical dashboard
   (continue, shortcuts, daily picks) and the stage fades out and stops rendering.
   Only when WebGL works and the user has not asked for reduced motion; otherwise the plain dashboard Home is shown (x_ui_home.js).
   The same #view element is used for the stage and for the "plane" destination, so the scene is borrowed (environment "stage") and handed back. ---------- */
const UIS={on:false,ch:"",cur:"hero",env0:null,xr0:false,io:null,sc:null,dim:false,raf:0,p:0,open:true,seen:false,ty:0,hand:null,ra:0};
const UIS_CH={
  hero:{xray:false,spin:true,view:"three"},
  out:{xray:false,view:"side"},
  in:{xray:true,view:"three"},
  eng:{xray:false,focus:"eng"},
  cock:{xray:false,focus:"cock"},
  fly:{xray:false,env:"sky",view:"front"}
};
const UIS_LIST=[["hero","البداية"],["out","من الخارج"],["in","من الداخل"],["eng","المحركات"],["cock","قمرة القيادة"],["fly","الطيران"]];
const uiSPhone=()=>matchMedia("(max-width:700px)").matches;
/* software rendering (SwiftShader, llvmpipe, ...) would make a full-screen scene crawl, so the plain dashboard Home is used there.
   ?stage=1 forces the stage on (screenshots, tests of the stage itself), ?stage=0 or localStorage birjis-stage=0 forces it off. */
function uiSoftGL(){
  if(UIS.soft!==undefined) return UIS.soft; let r=false;
  try{ const c=document.createElement("canvas"), g=c.getContext("webgl")||c.getContext("experimental-webgl"), e=g&&g.getExtension("WEBGL_debug_renderer_info");
    r=/swiftshader|llvmpipe|softpipe|software/i.test(e?String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)):"");
    try{ const l=g&&g.getExtension("WEBGL_lose_context"); if(l) l.loseContext(); }catch(er){} }catch(e){}
  UIS.soft=r; return r;
}
function uiStageOK(){
  try{
    if(/[?&]stage=0\b/.test(location.search)||localStorage.getItem("birjis-stage")==="0") return false;
    if(!(typeof GLOK!=="undefined"&&GLOK&&typeof HAS3D!=="undefined"&&HAS3D&&!reduced())) return false;
    return /[?&]stage=1\b/.test(location.search)||!uiSoftGL();
  }catch(e){ return false; }
}

function uiStageHTML(){
  if(!uiStageOK()) return "";
  const parts=Object.keys(PARTS).length, ds=(typeof dlStats==="function")?dlStats():{lessons:totalLessons()};
  const last=uiLastLesson(), L=last&&LESSONS[last.b]&&LESSONS[last.b][last.i];
  const cont=L?`<button type="button" class="idCont" data-uih="lesson:${last.b}:${last.i}"><span><small>${last.cont?"تابع الدرس":"ابدأ درسك الأول"}</small><b>${esc(L.ar)}</b></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg></button>`:"";
  const card=(k,no,t,p,tags,btns)=>`<section class="idCh" data-ch="${k}" aria-label="${t}"><div class="idCard"><span class="idNo">${no}</span><h3>${t}</h3><p>${p}</p><div class="idTags">${tags.map(x=>`<span>${x}</span>`).join("")}</div><div class="idCta">${btns}</div></div></section>`;
  const go=(a,t,pri)=>`<button type="button" class="idBtn${pri?" pri":""}" data-uih="${a}">${t}</button>`;
  const intro=`<div class="idIntro" id="idIntro" aria-hidden="true"><div class="idIFrame" id="idIFrame"></div>
    <h2 class="idIT"><span id="idIT1">افتح الطائرة</span><span id="idIT2">قطعة قطعة</span></h2>
    <p class="idIDate" id="idIDate">BIRJIS · الطائرات التفاعلية</p><p class="idIHint" id="idIHint">اسحب للأسفل لتكبير الطائرة</p></div>
  <button type="button" class="idSkip" id="idSkip">تخطّي المقدمة</button>`;
  return `${intro}<div class="idStage" id="idStage">
  <section class="idHero" data-ch="hero" aria-label="البداية"><div class="idIn">
    <span class="idEy">BIRJIS · الطائرات التفاعلية</span>
    <h2 class="idH">افتح الطائرة <em>قطعة قطعة</em></h2>
    <p class="idSub">نموذج ثلاثي الأبعاد لثلاث طائرات حقيقية. فكّكها، شوف داخلها، وتعلّم كل جزء بدروس بسيطة، وبعدها حلّق بها بنفسك.</p>
    <div class="idCta">${go("go:parts","ابدأ الاستكشاف",true)}${go("go:fly","حلّق الآن")}</div>
    ${cont}
    <div class="idSt"><div><b data-uicnt="${parts}">0</b><span>قطعة</span></div><div><b data-uicnt="${ds.lessons}">0</b><span>درس</span></div><div><b data-uicnt="3">0</b><span>طائرات</span></div></div>
    <div class="idScroll" aria-hidden="true"><i></i><span>اسحب للأسفل</span></div>
  </div></section>
  ${card("out","01","من الخارج","دوّر الطائرة بإصبعك وقرّب من أي جزء: الأجنحة والذيل والمحركات وجهاز الهبوط. اضغط على القطعة وتطلع لك بطاقتها بالتفاصيل.",["الأجنحة","الذيل","المحركات","جهاز الهبوط"],go("go:parts","افتح المجسّم",true))}
  ${card("in","02","من الداخل","بضغطة وحدة تختفي الجلدة وتبين الهياكل والأنظمة تحتها: الأضلاع والخزانات والأنابيب والأسلاك. فكّك القطع وشوف مكان كل شي.",["الهيكل","الوقود","الهيدروليك","الكهرباء"],go("xray","داخل الطائرة",true))}
  ${card("eng","03","المحركات","قلب الطائرة: المروحة والضاغط وغرفة الاحتراق والتوربين. شغّل الحركات وتابع كيف يتحرك كل جزء ويشتغل مع غيره.",["المروحة","الضاغط","الاحتراق","التوربين"],go("eng","قطع المحرك",true))}
  ${card("cock","04","قمرة القيادة","كل زر ومفتاح بمكانه الحقيقي. شغّل المحركات بمفاتيح الكابتن وتعلّم شنو يسوي كل جهاز قدامك.",["الشاشات","الطيار الآلي","المحركات","الإنذارات"],go("go:ckpt","ادخل القمرة",true))}
  ${card("fly","05","حلّق بها","اقلع من البوابة، تكلّم مع المراقب الجوي، واهبط بالطيار الآلي أو بيدك بمنظور الطيار، بمطارات وطقس وليل ونهار.",["المطارات","المراقب الجوي","الطقس","الليل"],go("go:fly","ابدأ الطيران",true))}
  </div>
  <nav class="idRail" aria-label="فصول الصفحة">${UIS_LIST.map(([k,t])=>`<button type="button" data-idgo="${k}" aria-label="${t}"><i></i></button>`).join("")}</nav>
  <div class="idDashTop" id="idDashTop"><span>لوحتك</span></div>`;
}

/* ---- stage lifecycle ---- */
function uiStageSync(g){
  const want=g==="home"&&uiStageOK()&&!(typeof UIN!=="undefined"&&UIN.peek);
  if(want&&!UIS.on) uiStageEnter(); else if(!want&&UIS.on) uiStageLeave();
}
function uiStageEnter(){
  UIS.on=true; UIS.ch=""; UIS.dim=false; const v=document.getElementById("view");
  v.classList.remove("uiOff","uiMin","uiStick"); v.classList.add("uiStage"); document.body.classList.add("uiStageOn"); document.body.classList.remove("uiStickView","uiStageDim");
  try{ UIS.env0=GL.getEnv(); UIS.xr0=S.xray; GL.show(); }catch(e){}
  UIS.p=UIS.seen?1:0; UIS.open=UIS.p>=1; document.documentElement.classList.toggle("uiIntro",!UIS.open); if(!UIS.open){ try{ window.scrollTo(0,0); }catch(e){} }
  uiIntroBindEvents();
}
function uiStageLeave(){
  UIS.on=false; uiStageUnbind(); uiIntroUnbindEvents(); const v=document.getElementById("view"); v.style.clipPath=""; document.documentElement.classList.remove("uiIntro");
  v.classList.remove("uiStage"); document.body.classList.remove("uiStageOn","uiStageDim");
  try{
    GL.setEnv(UIS.env0||document.getElementById("bEnv").value);
    if(S.xray!==UIS.xr0){ S.xray=UIS.xr0; if(typeof syncDock==="function") syncDock(); }
    GL.setShift(0,0); GL.setZoom(1); GL.setSpin(true); GL.reset(); GL.sync(); if(typeof layoutShift==="function") layoutShift(); GL.kick();
  }catch(e){ console.error(e); }
}
function uiStageShiftVals(){
  const ph=uiSPhone(), rtl=getComputedStyle(document.getElementById("tp")||document.body).direction==="rtl";
  return [ph?0:(rtl?-1:1)*0.22, ph?0.27:0];   /* negative = the aircraft goes left, positive = right */
}
function uiStageShift(){ const v=uiStageShiftVals(); try{ GL.setShift(v[0],v[1]); }catch(e){} }
function uiStageGo(k,force){
  if(!UIS.on||!UIS_CH[k]||(UIS.ch===k&&!force)) return; UIS.ch=k; UIS.cur=k; const c=UIS_CH[k];
  document.querySelectorAll(".idRail button").forEach(b=>b.classList.toggle("on",b.dataset.idgo===k));
  try{
    const env=c.env||"stage"; if(GL.getEnv()!==env) GL.setEnv(env);
    if(S.xray!==c.xray){ S.xray=c.xray; S.xrayAuto=false; if(typeof syncDock==="function") syncDock(); GL.sync(); }
    if(!c.spin) GL.setSpin(false);
    if(c.focus==="eng") GL.focus(ENG,engXR(),false,[Math.PI-0.55,1.0]);
    else if(c.focus==="cock") GL.focus(["flightdeck"],null,false,[Math.PI+0.62,1.22]);
    else { if(!(k==="hero"&&!UIS.open)) GL.setZoom(uiSPhone()?1.75:(c.env==="sky"?1.25:1.18)); GL.setView(c.view); }
    if(c.spin) GL.setSpin(true);
    if(k==="hero"&&!UIS.open) uiIntroApply(); else uiStageShift();
    GL.setEase(0.05); GL.kick();
  }catch(e){ console.error(e); }
}
function uiStageUnbind(){
  try{ if(UIS.io) UIS.io.disconnect(); }catch(e){} UIS.io=null;
  if(UIS.sc){ window.removeEventListener("scroll",UIS.sc); window.removeEventListener("resize",UIS.sc); UIS.sc=null; }
  cancelAnimationFrame(UIS.raf);
}
/* called by uiHomeMount after every render of the Home */
function uiStageBind(root){
  uiStageUnbind(); if(!UIS.on) return;
  const secs=[...root.querySelectorAll(".idStage [data-ch]")]; if(!secs.length) return;
  UIS.io=new IntersectionObserver(es=>{ es.forEach(e=>{ if(e.isIntersecting){ secs.forEach(s=>s.classList.toggle("on",s===e.target)); uiStageGo(e.target.dataset.ch); } }); },{rootMargin:"-42% 0px -42% 0px",threshold:0});
  secs.forEach(s=>UIS.io.observe(s)); secs[0].classList.add("on");
  const top=root.querySelector("#idDashTop"), tp=document.getElementById("tp");
  const tick=()=>{ UIS.raf=0;
    const h=innerHeight||800, y=window.scrollY||0; tp.style.setProperty("--idp",Math.min(1,y/(h*0.55)).toFixed(3));
    const dim=!!top&&top.getBoundingClientRect().top<h*0.72;
    if(dim!==UIS.dim){ UIS.dim=dim; document.body.classList.toggle("uiStageDim",dim); try{ if(dim) GL.hide(); else { GL.show(); GL.kick(); } }catch(e){} } };
  UIS.sc=()=>{ if(!UIS.raf) UIS.raf=requestAnimationFrame(tick); };
  window.addEventListener("scroll",UIS.sc,{passive:true}); window.addEventListener("resize",UIS.sc); tick();
  root.addEventListener("click",e=>{ const b=e.target.closest("[data-idgo]"); if(!b) return; const s=root.querySelector(`.idStage [data-ch="${b.dataset.idgo}"]`); if(s) s.scrollIntoView({behavior:reduced()?"auto":"smooth",block:"start"}); });
  UIS.ch=""; uiStageGo(UIS.cur||"hero",true); uiIntroApply();
}

/* ---- v27 intro: "scroll expansion hero". The aircraft starts inside a small framed window in the middle of the screen, the title splits to the two sides,
   and the wheel / swipe / arrow keys grow the window to the whole screen. Only then the page scrolls normally (chapters, dashboard). Scrolling up at the top
   shrinks it again. The idea comes from the open "scroll expansion hero" React component, rewritten here in plain JS around the real #view (clip-path, so the
   canvas is never resized). Skip button + keyboard keep it usable; no stage at all when reduced motion is asked for. ---- */
const uiClamp=(x,a,b)=>Math.max(a,Math.min(b,x)), uiLerp=(a,b,t)=>a+(b-a)*t;
function uiIntroApply(){
  if(!UIS.on) return;
  const p=UIS.p, e=p*p*(3-2*p), v=document.getElementById("view"), tp=document.getElementById("tp"), vw=innerWidth, vh=innerHeight, ph=uiSPhone();
  const w0=ph?Math.min(280,vw*0.74):300, h0=ph?Math.min(380,vh*0.46):400, w=uiLerp(w0,vw,e), h=uiLerp(h0,vh,e), r=uiLerp(22,0,e), ix=(vw-w)/2, iy=(vh-h)/2;
  if(v) v.style.clipPath=p>=1?"":`inset(${iy.toFixed(1)}px ${ix.toFixed(1)}px ${iy.toFixed(1)}px ${ix.toFixed(1)}px round ${r.toFixed(1)}px)`;
  const fr=document.getElementById("idIFrame"); if(fr){ fr.style.width=w.toFixed(1)+"px"; fr.style.height=h.toFixed(1)+"px"; fr.style.borderRadius=r.toFixed(1)+"px"; fr.style.opacity=String(uiClamp(1-(p-0.9)*10,0,1)); }
  const it=document.getElementById("idIntro"); if(it){ const tx=p*(ph?180:150); it.style.setProperty("--idtx",tx.toFixed(1)+"vw"); it.style.setProperty("--idh",(h/2).toFixed(1)+"px"); it.style.opacity=String(uiClamp(1-(p-0.78)*4.5,0,1)); }
  if(tp) tp.style.setProperty("--idq",uiClamp((p-0.72)/0.28,0,1).toFixed(3));
  try{ const sh=uiStageShiftVals(); GL.setZoomLive(uiLerp(ph?2.9:2.7,ph?1.75:1.18,e)); GL.setShift(sh[0]*e,sh[1]*e); GL.kick(); }catch(er){}
}
function uiIntroSched(){ if(UIS.ra) return; UIS.ra=requestAnimationFrame(()=>{ UIS.ra=0; uiIntroApply(); }); }
function uiIntroSetOpen(on){
  if(UIS.open===on) return; UIS.open=on; document.documentElement.classList.toggle("uiIntro",!on);
  if(on){ UIS.seen=true; UIS.p=1; try{ GL.setSpin(true); }catch(e){} } else { UIS.ch=""; try{ window.scrollTo(0,0); }catch(e){} uiStageGo("hero",true); }
  uiIntroSched();
}
function uiIntroAdd(d){ if(!UIS.on||!d) return; UIS.p=uiClamp(UIS.p+d,0,1); if(UIS.p>=1&&!UIS.open) uiIntroSetOpen(true); uiIntroSched(); }
function uiIntroSetP(p){ UIS.p=uiClamp(p,0,1); if(UIS.p>=1) uiIntroSetOpen(true); else if(UIS.open) uiIntroSetOpen(false); uiIntroApply(); }   /* tests and the skip button */
function uiIntroSkip(){
  if(UIS.open||!UIS.on) return; const t0=performance.now(), p0=UIS.p, d=reduced()?1:560;
  const st=t=>{ if(!UIS.on||UIS.open) return; const k=Math.min(1,(t-t0)/d); UIS.p=p0+(1-p0)*k; if(k>=1) uiIntroSetOpen(true); uiIntroApply(); if(k<1) requestAnimationFrame(st); };
  requestAnimationFrame(st);
}
function uiIntroBindEvents(){
  if(UIS.hand) return; const bw=()=>typeof BW!=="undefined"&&BW.open, atTop=()=>(window.scrollY||0)<=5;
  const H={
    wheel:e=>{ if(!UIS.on||bw()) return; if(UIS.open){ if(e.deltaY<0&&atTop()) uiIntroSetOpen(false); else return; } e.preventDefault(); uiIntroAdd(e.deltaY*0.0011); },
    touchstart:e=>{ UIS.ty=e.touches&&e.touches[0]?e.touches[0].clientY:0; },
    touchmove:e=>{ if(!UIS.on||bw()||!UIS.ty) return; const y=e.touches[0].clientY, d=UIS.ty-y;
      if(UIS.open){ if(d<-20&&atTop()) uiIntroSetOpen(false); else return; } e.preventDefault(); uiIntroAdd(d*(d<0?0.008:0.005)); UIS.ty=y; },
    touchend:()=>{ UIS.ty=0; },
    keydown:e=>{ if(!UIS.on||UIS.open||bw()||e.ctrlKey||e.metaKey||e.altKey) return; const t=e.target, k=e.key;
      if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if(k==="ArrowDown"||k==="PageDown"||k==="End"||(k===" "&&!(t&&t.tagName==="BUTTON"))){ e.preventDefault(); uiIntroAdd(k==="End"?1:0.18); }
      else if(k==="ArrowUp"||k==="PageUp"||k==="Home"){ e.preventDefault(); uiIntroAdd(k==="Home"?-1:-0.18); } },
    resize:()=>uiIntroSched()
  };
  window.addEventListener("wheel",H.wheel,{passive:false}); window.addEventListener("touchstart",H.touchstart,{passive:true}); window.addEventListener("touchmove",H.touchmove,{passive:false});
  window.addEventListener("touchend",H.touchend); window.addEventListener("keydown",H.keydown); window.addEventListener("resize",H.resize);
  UIS.hand=H;
}
function uiIntroUnbindEvents(){
  const H=UIS.hand; if(!H) return; UIS.hand=null;
  window.removeEventListener("wheel",H.wheel); window.removeEventListener("touchstart",H.touchstart); window.removeEventListener("touchmove",H.touchmove);
  window.removeEventListener("touchend",H.touchend); window.removeEventListener("keydown",H.keydown); window.removeEventListener("resize",H.resize);
}
document.addEventListener("click",e=>{ if(e.target&&e.target.closest&&e.target.closest("#idSkip")) uiIntroSkip(); });

(function(){
  const css=`
/* ===== the stage: the real #view, full screen, behind everything ===== */
body .view.uiStage{display:block;position:fixed;inset:0;width:100%;height:100vh;height:100dvh;min-height:0;max-height:none;margin:0;border:0;border-radius:0;box-shadow:none;z-index:0;pointer-events:none;overflow:hidden;
  background:radial-gradient(68% 52% at 64% 44%,rgb(255 178 62 / .17),transparent 70%),radial-gradient(60% 70% at 10% 92%,rgb(111 227 245 / .13),transparent 70%),radial-gradient(1.2px 1.2px at 14% 22%,#fff,transparent),radial-gradient(1px 1px at 38% 12%,#fff,transparent),radial-gradient(1.2px 1.2px at 72% 18%,#fff,transparent),radial-gradient(1px 1px at 88% 34%,#fff,transparent),linear-gradient(180deg,#09090B 0%,#111114 58%,#09090B 100%);transition:opacity .55s var(--ease),visibility 0s}
body.uiStageDim .view.uiStage{opacity:0;visibility:hidden;transition:opacity .45s var(--ease),visibility 0s .45s}
body .view.uiStage .dock,body .view.uiStage .hint,body .view.uiStage .hud,body .view.uiStage .tag,body .view.uiStage .uiMore,body .view.uiStage .card,body .view.uiStage .uiHideView,body .view.uiStage .uiPeekBack,body .view.uiStage .flat{display:none!important}
body.uiStageOn .app>*:not(#view){position:relative;z-index:2}
body.uiStageOn .uiSky{display:none}
body.uiStageOn .top{border-bottom-color:rgb(255 255 255 / .1)}
body.uiStageOn .uiNav{background:rgb(9 9 11 / .72);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border-color:rgb(255 255 255 / .1)}
body.uiStageOn .bobw,body.uiStageOn .bobtab,body.uiStageOn .bobcap{display:none}
/* ===== hero and chapters ===== */
.idStage{display:block;margin-top:-6px}
.idHero{min-height:calc(100vh - 150px);min-height:calc(100dvh - 150px);display:grid;align-content:end;padding:0 0 calc(var(--nav-h) + 22px)}
.idIn{display:grid;gap:16px;justify-items:start;opacity:calc(var(--idq,1) * (1 - var(--idp,0)*1.7));transform:translateY(calc(var(--idp,0)*-34px));will-change:opacity,transform}
.idEy{font-family:var(--font-mono);font-size:12px;letter-spacing:.2em;color:var(--signal);text-transform:uppercase}
.idH{margin:0;font-size:clamp(40px,11.5vw,92px);line-height:1.05;font-weight:800;color:#fff;max-width:11ch;text-shadow:0 8px 50px rgb(0 0 0 / .55)}
.idH em{font-style:normal;background:linear-gradient(100deg,#FFD27A,#FF9A2E 55%,#FF6A4D);-webkit-background-clip:text;background-clip:text;color:transparent}
.idSub{margin:0;max-width:36ch;font-size:clamp(15px,4vw,19px);line-height:1.8;color:#C3CFE0}
.idCta{display:flex;flex-wrap:wrap;gap:10px}
.idBtn{min-height:52px;padding:0 24px;border-radius:14px;font-weight:700;font-size:16px;display:inline-flex;align-items:center;gap:10px;border:1px solid rgb(255 255 255 / .22);background:rgb(255 255 255 / .08);color:#fff;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);transition:transform var(--dur1) var(--ease),background var(--dur1)}
.idBtn:hover{background:rgb(255 255 255 / .16);transform:translateY(-1px)}
.idBtn.pri{background:linear-gradient(180deg,#FFC25E,#FF9A2E);border-color:transparent;color:#1A1000;box-shadow:0 14px 44px -12px rgb(255 160 46 / .65)}
.idBtn.pri:hover{background:linear-gradient(180deg,#FFCC77,#FFA444)}
.idCont{display:flex;align-items:center;gap:14px;max-width:min(100%,430px);width:100%;text-align:start;padding:11px 16px;border-radius:14px;background:rgb(255 255 255 / .07);border:1px solid rgb(255 255 255 / .15);color:#fff;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.idCont>span{display:grid;gap:1px;min-width:0;flex:1}.idCont small{font-size:12px;color:var(--gold)}.idCont b{font-size:15px;font-weight:600;line-height:1.4}
.idCont svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none}
.idSt{display:flex;gap:26px;flex-wrap:wrap;padding-top:6px}
.idSt>div{display:grid;gap:0}.idSt b{font:600 28px var(--font-mono);direction:ltr;color:#fff;text-align:start}.idSt span{font-size:12.5px;color:#9FADC1}
.idScroll{display:flex;align-items:center;gap:10px;font-size:12px;color:#9FADC1;margin-top:4px}
.idScroll i{width:2px;height:34px;border-radius:2px;background:linear-gradient(var(--gold),transparent);animation:idCue 1.9s ease-in-out infinite}
@keyframes idCue{0%{transform:scaleY(.2);transform-origin:top;opacity:.3}50%{transform:scaleY(1);transform-origin:top;opacity:1}100%{transform:scaleY(1);transform-origin:bottom;opacity:0}}
.idCh{min-height:100vh;min-height:100dvh;display:grid;align-content:end;padding:0 0 calc(var(--nav-h) + 22px)}
.idCard{max-width:470px;display:grid;gap:12px;padding:22px 22px 20px;border-radius:22px;background:rgb(9 9 11 / .66);border:1px solid rgb(255 255 255 / .14);-webkit-backdrop-filter:blur(18px) saturate(1.3);backdrop-filter:blur(18px) saturate(1.3);box-shadow:0 34px 80px -30px #000;opacity:0;transform:translateY(26px);transition:opacity .65s var(--ease),transform .65s var(--ease)}
.idCh.on .idCard{opacity:1;transform:none}
.idNo{font-family:var(--font-mono);font-size:13px;color:var(--gold);letter-spacing:.16em}
.idCard h3{margin:0;font-size:clamp(28px,7vw,42px);line-height:1.18;font-weight:800;color:#fff}
.idCard p{margin:0;font-size:15.5px;line-height:1.9;color:#C3CFE0}
.idTags{display:flex;flex-wrap:wrap;gap:6px}.idTags span{font-size:12.5px;padding:3px 11px;border-radius:999px;border:1px solid rgb(255 255 255 / .18);color:#DCE6F4}
.idRail{position:fixed;inset-inline-end:10px;top:50%;transform:translateY(-50%);display:none;gap:2px;z-index:6}
.idRail button{width:32px;height:32px;display:grid;place-items:center;background:none;border:0;padding:0}
.idRail i{width:9px;height:9px;border-radius:50%;border:1.5px solid rgb(255 255 255 / .55);transition:all var(--dur2) var(--ease)}
.idRail button.on i{background:var(--gold);border-color:var(--gold);height:22px;border-radius:6px}
body.uiStageDim .idRail{opacity:0;pointer-events:none}
.idDashTop{position:relative;padding:60px 0 6px;font-family:var(--font-mono);font-size:12px;letter-spacing:.22em;color:var(--signal);text-transform:uppercase;display:flex;align-items:center;gap:14px}
.idDashTop::after{content:"";height:1px;flex:1;background:linear-gradient(90deg,var(--line),transparent)}
/* ===== v27 intro ===== */
html.uiIntro,html.uiIntro body{overflow:hidden;overscroll-behavior:none}
html.uiIntro{touch-action:none}
body.uiStageOn{background:radial-gradient(58% 48% at 50% 46%,rgb(255 178 62 / .11),transparent 72%),radial-gradient(40% 40% at 12% 90%,rgb(111 227 245 / .06),transparent 70%),#09090B}
.idIntro{position:fixed;inset:0;z-index:4;pointer-events:none;display:grid;place-items:center}
html:not(.uiIntro) .idIntro,html:not(.uiIntro) .idSkip{display:none}
.idIFrame{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border:1px solid rgb(255 255 255 / .22);box-shadow:0 0 90px rgb(255 178 62 / .2),inset 0 0 50px rgb(0 0 0 / .35)}
.idIT{position:relative;display:grid;gap:2px;justify-items:center;margin:0;text-align:center;font-size:clamp(34px,8.5vw,76px);line-height:1.1;font-weight:800;color:#fff;text-shadow:0 6px 40px rgb(0 0 0 / .7)}
.idIT span:first-child{transform:translateX(calc(var(--idtx,0vw)*-1))}
.idIT span:last-child{transform:translateX(var(--idtx,0vw));background:linear-gradient(100deg,#FFD27A,#FF9A2E 55%,#FF6A4D);-webkit-background-clip:text;background-clip:text;color:transparent}
.idIDate,.idIHint{position:absolute;left:0;right:0;top:calc(50% + var(--idh,200px) + 14px);margin:0;text-align:center;font-size:13px}
.idIDate{font-family:var(--font-mono);letter-spacing:.2em;color:var(--signal);transform:translateX(calc(var(--idtx,0vw)*-1));text-transform:uppercase}
.idIHint{top:calc(50% + var(--idh,200px) + 40px);color:#C3CFE0;transform:translateX(var(--idtx,0vw))}
.idSkip{position:fixed;z-index:6;left:50%;transform:translateX(-50%);bottom:calc(var(--nav-h) + 16px + env(safe-area-inset-bottom));min-height:44px;padding:0 20px;border-radius:999px;border:1px solid rgb(255 255 255 / .22);background:rgb(9 9 11 / .6);color:#E8EFF8;font-size:13.5px;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.idSkip:hover{background:rgb(255 255 255 / .14)}
html.uiIntro .idIn{pointer-events:none}
html.uiIntro .idRail{display:none}
body.uiStageOn .uiHome{position:relative;background:linear-gradient(180deg,transparent,#09090B 120px);padding-top:10px}
@media (min-width:900px){
  .idHero{align-content:center;padding-bottom:40px}
  .idCh{align-content:center;padding-bottom:0}
  .idRail{display:grid}
  .idIn{max-width:560px}
}
@media (max-width:700px){ .idCard{padding:18px 18px 16px} .idH{font-size:clamp(34px,10vw,52px)} .idSub,.idScroll{display:none} .idIn{gap:12px} }
@media (prefers-reduced-motion:reduce){ .idIFrame{box-shadow:none} .idScroll i{animation:none} .idCard{transition:none;opacity:1;transform:none} }
`;
  const st=document.createElement("style"); st.id="idStageCss"; st.textContent=css; document.head.appendChild(st);
})();
