/* ---------- overlay ---------- */
function flyEnsure(){
  let o=document.getElementById("fly"); if(o) return o;
  o=document.createElement("div"); o.id="fly"; o.className="fly"; o.hidden=true; o.setAttribute("dir","ltr"); o.setAttribute("role","dialog"); o.setAttribute("aria-modal","true"); o.setAttribute("aria-label","وضع الطيران");
  o.innerHTML=`<canvas id="flyGl"></canvas><canvas id="flyHud"></canvas>
    <div class="flyLoad" id="flyLoad" role="status" hidden><svg class="glPosterIc" viewBox="0 0 120 120" aria-hidden="true"><path d="M60 6c3 0 5 4 5 10v24l47 28v8L65 62v26l15 12v6l-20-5-20 5v-6l15-12V62L8 76v-8l47-28V16c0-6 2-10 5-10z"/></svg><span id="flyLoadT">جارٍ تجهيز المطار والطائرة…</span><i class="glPosterBar" aria-hidden="true"></i></div>
    <div class="ftop"><button type="button" class="fb" data-fa="exit" aria-label="خروج">✕</button><div class="fttl" id="fTtl" dir="rtl"></div>
      <button type="button" class="fb" data-fa="pause" id="fPause" aria-label="إيقاف مؤقت">❚❚</button><button type="button" class="fb" data-fa="view" id="fView" aria-label="الكاميرا"></button><button type="button" class="fb" data-fa="map" id="fMap" aria-label="مدى الخريطة">km</button><button type="button" class="fb" data-fa="q" id="fQ" aria-label="الجودة">AUTO</button><button type="button" class="fb" data-fa="help" aria-label="مساعدة">?</button></div>
    <div class="fhint" id="fHint" dir="rtl" hidden></div>
    <div class="fmsg" id="fMsg" dir="rtl" hidden></div>
    <div class="fstick"><div class="fpad" id="fPad"><i id="fKnob"></i></div><label class="frud"><span>الدفّة</span><input type="range" id="fRud" min="-100" max="100" value="0" aria-label="الدفّة"></label></div>
    <div class="fthr"><div class="fth" id="fThr"><i id="fThrK"></i><b id="fThrV">0</b></div><span>الدفع</span></div>
    <div class="fcfg fl" dir="rtl"><button type="button" class="fb w fhubB" data-fa="hub" id="fHubB" aria-haspopup="true" aria-expanded="false" aria-controls="fHub" aria-keyshortcuts="H"><svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v7M5 12l7-9 7 9M3 21h18M8 21v-5h8v5"/></svg><span>الإقلاع والهبوط</span></button></div>
    <div class="fcfg fr" dir="rtl"><button type="button" class="fb w" data-fa="ap" id="fApB">طيار آلي</button><button type="button" class="fb w" data-fa="coach" id="fCoach" hidden>المدرّب</button></div>
    <div class="fhub" id="fHub" dir="rtl" role="group" aria-labelledby="fHubT" hidden>
      <div class="fhubH"><b id="fHubT">الإقلاع والهبوط</b><button type="button" class="fb fhubX" data-fa="hub" aria-label="إغلاق اللوحة">✕</button></div>
      <div class="fhubS"><h4 id="fhF">القلابات <small id="fFlap">FLAPS 0</small></h4>
        <div class="fhubFl"><button type="button" class="fb" data-fa="flapup" aria-label="رفع القلابات">−</button><div class="fhubDt" id="fFlapDt" role="group" aria-labelledby="fhF"></div><button type="button" class="fb" data-fa="flapdn" aria-label="إنزال القلابات">+</button></div></div>
      <div class="fhubT">
        <button type="button" class="fb fhubTile" data-fa="gear" id="fGear" aria-pressed="true"><span class="k">العجلات <small>GEAR</small></span><b id="fGearV">نازلة</b></button>
        <button type="button" class="fb fhubTile" data-fa="spoil" id="fSpoil" aria-pressed="false"><span class="k">السبويلر <small>SPEEDBRAKE</small></span><b id="fSpoilV">مسحوب</b></button>
        <button type="button" class="fb fhubTile" data-fa="brake" id="fBrake" aria-pressed="false" aria-keyshortcuts="B"><span class="k">الفرامل <small>BRAKES</small></span><b>اضغط مطوّلاً</b></button>
        <button type="button" class="fb fhubTile" data-fa="park" id="fPark" aria-pressed="false"><span class="k">فرامل الوقوف <small>PARKING</small></span><b id="fParkV">غير مفعّلة</b></button>
        <button type="button" class="fb fhubTile" data-fa="rev" id="fRev" aria-pressed="false"><span class="k">عكس الدفع <small>REVERSE</small></span><b id="fRevV">متوقف</b></button>
      </div>
    </div>
    <div class="fap" id="fAp" dir="rtl" hidden>
      <div class="fapt"><button type="button" class="fb w" data-fa="apon" id="fApOn">AP</button><button type="button" class="fb w" data-fa="athr" id="fAthr">A/THR</button><button type="button" class="fb w" data-fa="appr" id="fAppr">APPR</button></div>
      <div class="fapr">${[["alt","ALT","ft"],["hdg","HDG","°"],["spd","SPD","kt"],["vs","V/S","fpm"]].map(([k,t,u])=>`<div class="fapi"><button type="button" class="fb" data-fa="${k}-" aria-label="${t} −">−</button><div class="fapv"><span>${t} <small>${u}</small></span><b id="fa_${k}">0</b></div><button type="button" class="fb" data-fa="${k}+" aria-label="${t} +">+</button></div>`).join("")}</div></div>
    <div class="fscore" id="fScore" dir="rtl" hidden></div>
    <div class="fhelp" id="fHelp" dir="rtl" hidden></div>`;
  document.body.appendChild(o); try{ bobFlightInit(o); }catch(e){ console.error(e); }   /* Bobby's avatar, voice/caption buttons and the question button */
  o.addEventListener("pointerdown",e=>{ const p=document.getElementById("fAp"); if(p&&!p.hidden&&!e.target.closest("#fAp,#fApB")){ p.hidden=true; o.classList.remove("apOpen"); }
    const h=document.getElementById("fHub"); if(h&&!h.hidden&&!e.target.closest("#fHub,#fHubB")) flyHub(false); },true);   /* tap outside closes the autopilot panel and the takeoff / landing hub */
  o.addEventListener("click",flyClick); window.addEventListener("keydown",flyKey); window.addEventListener("keyup",flyKey);
  flyPad(o); flyThrottle(o);
  o.querySelector("#fRud").addEventListener("input",e=>{ FLY.rud=e.target.value/100; });
  ["pointerup","pointercancel"].forEach(ev=>o.querySelector("#fRud").addEventListener(ev,e=>{ e.target.value=0; FLY.rud=0; }));
  const br=o.querySelector("#fBrake"); br.addEventListener("pointerdown",e=>{ e.preventDefault(); if(FLY.s&&FLY.s.parkBrake){ FLY.s.parkBrake=false; return; } FLY.brake=true; br.setAttribute("aria-pressed",true); }); ["pointerup","pointerleave","pointercancel"].forEach(ev=>br.addEventListener(ev,()=>{ FLY.brake=false; br.setAttribute("aria-pressed",false); }));
  const cv=o.querySelector("#flyGl"); flyLook(cv);
  FLY.ro=new ResizeObserver(()=>flyResize()); FLY.ro.observe(o);
  getSample().then(sm=>{ if(sm) o.querySelector("#fCoach").hidden=false; });
  return o;
}
/* the joystick: pull down for nose up, push right for right roll; it springs back to the centre */
function flyPad(o){
  const pad=o.querySelector("#fPad"), knob=o.querySelector("#fKnob"); let id=null;
  const set=(e)=>{ const r=pad.getBoundingClientRect(), R=r.width/2, dx=e.clientX-(r.left+R), dy=e.clientY-(r.top+R), d=Math.hypot(dx,dy), k=d>R?R/d:1; const x=dx*k/R, y=dy*k/R; FLY.stick.x=x; FLY.stick.y=y; knob.style.transform=`translate(${x*R*0.62}px,${y*R*0.62}px)`; };
  pad.addEventListener("pointerdown",e=>{ id=e.pointerId; pad.setPointerCapture(id); FLY.stick.on=true; set(e); e.preventDefault(); });
  pad.addEventListener("pointermove",e=>{ if(e.pointerId===id) set(e); });
  const up=e=>{ if(e.pointerId!==id) return; id=null; FLY.stick.x=FLY.stick.y=0; FLY.stick.on=false; knob.style.transform=""; };
  pad.addEventListener("pointerup",up); pad.addEventListener("pointercancel",up);
}
function flyThrottle(o){
  const th=o.querySelector("#fThr"); let id=null;
  const set=(e)=>{ const r=th.getBoundingClientRect(); const f=Math.max(0,Math.min(1,1-(e.clientY-r.top)/r.height)); FLY.rev=false; if(FLY.s) fphSetLever(FLY.s,f); };
  th.addEventListener("pointerdown",e=>{ id=e.pointerId; th.setPointerCapture(id); set(e); e.preventDefault(); });
  th.addEventListener("pointermove",e=>{ if(e.pointerId===id) set(e); });
  const up=e=>{ if(e.pointerId===id) id=null; }; th.addEventListener("pointerup",up); th.addEventListener("pointercancel",up);
}
/* dragging the 3D view looks around (cockpit) or orbits (outside views); the wheel and a pinch zoom */
function flyLook(cv){
  const pt=new Map(); let pd=0;
  cv.addEventListener("pointerdown",e=>{ cv.setPointerCapture(e.pointerId); pt.set(e.pointerId,{x:e.clientX,y:e.clientY}); if(pt.size===2){ const a=[...pt.values()]; pd=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y); } });
  cv.addEventListener("pointermove",e=>{ const p=pt.get(e.pointerId); if(!p) return; const dx=e.clientX-p.x, dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY;
    if(pt.size===2){ const a=[...pt.values()], d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y); if(pd>0) FLY.look.zoom=Math.max(0.35,Math.min(3,FLY.look.zoom*pd/d)); pd=d; return; }
    FLY.look.yaw-=dx*0.006; FLY.look.pitch=Math.max(-1.2,Math.min(1.2,FLY.look.pitch+dy*0.005));
    if(FLY.view==="cockpit"){ const lm=flyLookLim(); FLY.look.snap=false; FLY.look.yaw=Math.max(-lm.yaw,Math.min(lm.yaw,FLY.look.yaw)); FLY.look.pitch=Math.max(lm.dn,Math.min(lm.up,FLY.look.pitch)); } });
  const up=e=>{ pt.delete(e.pointerId); pd=0; if(FLY.view==="cockpit"&&pt.size===0){ FLY.look.snap=true; } }; cv.addEventListener("pointerup",up); cv.addEventListener("pointercancel",up);
  cv.addEventListener("wheel",e=>{ e.preventDefault(); FLY.look.zoom=Math.max(0.35,Math.min(3,FLY.look.zoom*Math.exp(e.deltaY*0.001))); },{passive:false});
}
function flyKey(e){
  if(!FLY.on) return; const k=e.key, down=e.type==="keydown", tg=e.target&&e.target.tagName; if(tg==="INPUT"||tg==="TEXTAREA") return;
  const map={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right",w:"up",s:"down",a:"left",d:"right",W:"up",S:"down",D:"right",q:"yl",Q:"yl",e:"yr",E:"yr",Shift:"thUp",Control:"thDn",PageUp:"thUp",PageDown:"thDn"};
  if(map[k]){ FLY.keys[map[k]]=down; e.preventDefault(); return; }
  if(!down) { if(k==="b"||k==="B") FLY.brake=false; return; }
  if(k.length===1&&k>="1"&&k<="9"&&typeof feKey==="function"&&feKey(k)){ e.preventDefault(); return; }   /* fe: digits start/stop engines 1-4 while the gate scenario brings the engines up */
  if(k==="Escape"){ const hb=document.getElementById("fHub"); if(hb&&!hb.hidden){ flyHub(false); e.preventDefault(); return; } }
  const act={g:"gear",G:"gear",f:"flapup",F:"flapup",v:"flapdn",V:"flapdn",x:"spoil",X:"spoil",r:"rev",R:"rev",h:"hub",H:"hub",A:"apon",p:"pause",P:"pause",m:"map",M:"map","1":"v0","2":"v1","3":"v2","4":"v3","5":"v4",Escape:"exit"}[k];
  if(k==="b"||k==="B"){ if(FLY.s&&FLY.s.parkBrake) FLY.s.parkBrake=false; else FLY.brake=true; return; }
  if(act){ flyAction(act); e.preventDefault(); }
}
/* autopilot panel placement (ff): the nearest free spot to the «طيار آلي» button that covers nothing drawn on the HUD canvas (PFD, tapes, map, strip) and no visible overlay control;
   tries the 2x2 layout, then a one-column layout, else the spot with the least overlap. Called on open, on resize and after an orientation change. */
function ffApPlace(){
  const ov=document.getElementById("fly"), p=ov&&ov.querySelector("#fAp"); if(ov) ov.classList.toggle("apOpen",!!p&&!p.hidden);   /* the controller strip steps aside while the panel is open (x_fly_atc.js CSS) */
  if(!p||p.hidden) return;
  const W=ov.clientWidth, H=ov.clientHeight, cs=8, cols=Math.ceil(W/cs), rows=Math.ceil(H/cs), N=cols*rows, dom=new Uint8Array(N), bob=new Uint8Array(N), cvs=new Uint8Array(N), O=ov.getBoundingClientRect();
  const mark=(o,x0,y0,x1,y1)=>{ for(let r=Math.max(0,Math.floor(y0/cs));r<=Math.min(rows-1,Math.floor(y1/cs));r++) for(let c=Math.max(0,Math.floor(x0/cs));c<=Math.min(cols-1,Math.floor(x1/cs));c++) o[r*cols+c]=1; };
  const addEl=e=>{ if(e===p||e.tagName==="CANVAS"||e.hidden||e.id==="fScore"||e.id==="fHelp") return; if(getComputedStyle(e).pointerEvents==="none"&&e.id!=="bobFly"){ Array.prototype.forEach.call(e.children,addEl); return; }   /* click-through layers (cockpit deck) count by their controls */
    const r=e.getBoundingClientRect(); if(!r.width||!r.height) return; mark(e.id==="bobFly"?bob:dom,r.left-O.left-4,r.top-O.top-4,r.right-O.left+4,r.bottom-O.top+4); };   /* controls (top bar, buttons, stick, throttle) are hard obstacles; Bobby's avatar is soft */
  Array.prototype.forEach.call(ov.children,addEl);
  const thr=FLY.view==="cockpit"?96:8;   /* (v36) in the cockpit the glass tint / edge darkening / seals are drawn on the same canvas (alpha <= 0.34): scenery, not instruments */
  const hc=ov.querySelector("#flyHud"); if(hc&&hc.width){ try{ const dd=FLY.dpr||1, a=hc.getContext("2d").getImageData(0,0,hc.width,hc.height).data, w=hc.width;
    for(let y=0;y<hc.height;y++){ const rr=Math.floor(y/dd/cs)*cols; for(let x=0;x<w;x++) if(a[(y*w+x)*4+3]>thr){ cvs[rr+Math.floor(x/dd/cs)]=1; x+=Math.max(0,Math.floor(dd)-1); } } }catch(e){} }
  FLY.apDeck=0;   /* cockpit view: the frame pillars / glare shield above the instrument panels are scenery; only the panels (first row below the top bar that is >= 50 % drawn) count */
  if(FLY.view==="cockpit"){ for(let r=Math.ceil(rows*0.15);r<rows;r++){ let n=0; for(let c=0;c<cols;c++) n+=cvs[r*cols+c]; if(n>=cols*0.5){ FLY.apDeck=r*cs; for(let q=0;q<r;q++) for(let c=0;c<cols;c++) cvs[q*cols+c]=0; break; } } }
  const mix=(...a)=>{ const o=new Uint8Array(N); for(let i=0;i<N;i++) for(let k=0;k<a.length;k++) if(a[k][i]){ o[i]=1; break; } return o; };
  FLY.apDbg={cols,rows,occ:mix(dom,bob,cvs)};
  const sat=o=>{ const S=new Int32Array((cols+1)*(rows+1)); for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) S[(r+1)*(cols+1)+c+1]=o[r*cols+c]+S[r*(cols+1)+c+1]+S[(r+1)*(cols+1)+c]-S[r*(cols+1)+c]; return (c0,r0,c1,r1)=>S[r1*(cols+1)+c1]-S[r0*(cols+1)+c1]-S[r1*(cols+1)+c0]+S[r0*(cols+1)+c0]; };
  const sAll=sat(mix(dom,bob,cvs)), sHard=sat(mix(dom,cvs)), sDom=sat(dom), sCvs=sat(cvs), ab=ov.querySelector("#fApB").getBoundingClientRect(), ax=ab.left-O.left+ab.width/2, ay=ab.top-O.top+ab.height/2, top=1, bot=Math.ceil(10/cs);
  /* layouts: 2x2 selectors; one wide row of four only when every cell gets >= 128 px (else the label/value column collapses under the buttons) */
  const dims=(W>=556?["","fapw"]:[""]).map(k=>{ p.classList.toggle("fapw",!!k); p.style.visibility="hidden"; p.style.left="0px"; p.style.top="0px"; return [k,Math.ceil((p.offsetWidth+8)/cs),Math.ceil((p.offsetHeight+8)/cs),p.offsetWidth,p.offsetHeight]; });
  const find=(sum,sec)=>{ for(const [k,pw,ph,w,h] of dims){ let bs=1e18, bp=null;
    for(let r=top;r+ph<=rows-bot;r++) for(let c=1;c+pw<=cols-1;c++){ if(sum(c,r,c+pw,r+ph)!==0) continue; const o=sec?sec(c,r,c+pw,r+ph):0, d=o*1e5+Math.hypot((c+pw/2)*cs-ax,(r+ph/2)*cs-ay); if(d<bs){ bs=d; bp=[c,r]; } }
    if(bp) return {k,w,h,x:bp[0]*cs+4,y:bp[1]*cs+4}; } return null; };
  /* 1: nothing covered; 2: only Bobby's avatar covered; 3: no control covered, least HUD drawing covered (cockpit view fills the HUD with panels); 4: least overlap */
  let best=find(sAll), tier=1; if(!best){ best=find(sHard); tier=2; } if(!best){ best=find(sDom,sCvs); tier=3; }
  if(!best){ tier=4; const [k,pw,ph,w,h]=dims[0], sum=sat(mix(dom,cvs)); let bo=1e18, bp=[1,top]; for(let r=top;r+ph<=rows-bot;r++) for(let c=1;c+pw<=cols-1;c++){ const o=sum(c,r,c+pw,r+ph)*1e5+Math.hypot((c+pw/2)*cs-ax,(r+ph/2)*cs-ay); if(o<bo){ bo=o; bp=[c,r]; } } best={k,w,h,x:bp[0]*cs+4,y:bp[1]*cs+4}; }
  p.classList.toggle("fapw",!!best.k); p.style.left=Math.max(4,Math.min(W-best.w-4,best.x))+"px"; p.style.top=Math.max(4,Math.min(H-best.h-4,best.y))+"px"; p.style.visibility=""; FLY.apFit=tier<=2; FLY.apTier=tier;
}
/* ---------- (v36) the takeoff / landing hub: flaps, gear, speedbrake, brakes, parking brake and reverse thrust in ONE panel behind one button (they used to be six separate buttons on the screen) ---------- */
function flyHub(open){
  const h=document.getElementById("fHub"), b=document.getElementById("fHubB"); if(!h||!b) return; const on=open===undefined?h.hidden:!!open; if(on===!h.hidden) return;
  h.hidden=!on; b.setAttribute("aria-expanded",on); b.classList.toggle("on",on);
  if(on){ const ap=document.getElementById("fAp"); if(ap&&!ap.hidden){ ap.hidden=true; document.getElementById("fly").classList.remove("apOpen"); } flyHubBuild(); ffHubPlace(); try{ h.querySelector("[data-fa='flapdn']").focus({preventScroll:true}); }catch(e){} }
  else { try{ if(h.contains(document.activeElement)) b.focus({preventScroll:true}); }catch(e){} }
}
/* one chip per flap detent of this aircraft (labels as on its own lever); tapping a chip selects that detent */
function flyHubBuild(){
  const s=FLY.s, box=document.getElementById("fFlapDt"); if(!s||!box) return; const key=s.A.flaps.join("|"); if(box.dataset.k===key) return; box.dataset.k=key; box.innerHTML="";
  s.A.flaps.forEach((t,i)=>{ const c=document.createElement("button"); c.type="button"; c.className="fb"; c.textContent=t; c.setAttribute("aria-label","FLAPS "+t); c.setAttribute("aria-pressed",i===s.flapsT);
    c.addEventListener("click",()=>{ if(FLY.s) fphSetFlaps(FLY.s,i); }); box.appendChild(c); });
}
/* the same free-space search as the autopilot panel, simpler: no wide layout. Controls are hard obstacles, the drawn HUD is avoided where possible, the spot nearest to the hub button wins. */
function ffHubPlace(){
  const ov=document.getElementById("fly"), p=ov&&ov.querySelector("#fHub"); if(!p||p.hidden) return;
  const W=ov.clientWidth, H=ov.clientHeight, cs=8, cols=Math.ceil(W/cs), rows=Math.ceil(H/cs), N=cols*rows, dom=new Uint8Array(N), soft=new Uint8Array(N), cvs=new Uint8Array(N), O=ov.getBoundingClientRect();
  const mark=(o,x0,y0,x1,y1)=>{ for(let r=Math.max(0,Math.floor(y0/cs));r<=Math.min(rows-1,Math.floor(y1/cs));r++) for(let c=Math.max(0,Math.floor(x0/cs));c<=Math.min(cols-1,Math.floor(x1/cs));c++) o[r*cols+c]=1; };
  const addEl=e=>{ if(e===p||e.tagName==="CANVAS"||e.hidden||e.id==="fScore"||e.id==="fHelp"||e.id==="bobFly") return; if(getComputedStyle(e).pointerEvents==="none"){ Array.prototype.forEach.call(e.children,addEl); return; }
    const r=e.getBoundingClientRect(); if(!r.width||!r.height) return; const isSoft=e.id==="faAtc"||(typeof e.className==="string"&&/(^|\s)fd(h|big)(\s|$)/.test(e.className));   /* the flight controls (stick, throttle, rudder, the button columns, the top bar) are hard obstacles; the ATC strip and the deck's tap zones may be covered for a moment */
    mark(isSoft?soft:dom,r.left-O.left-4,r.top-O.top-4,r.right-O.left+4,r.bottom-O.top+4); };
  Array.prototype.forEach.call(ov.children,addEl);
  const thr=FLY.view==="cockpit"?96:8;   /* (v36) in the cockpit the glass tint / edge darkening / seals are drawn on the same canvas (alpha <= 0.34): scenery, not instruments */
  const hc=ov.querySelector("#flyHud"); if(hc&&hc.width){ try{ const dd=FLY.dpr||1, a=hc.getContext("2d").getImageData(0,0,hc.width,hc.height).data, w=hc.width;
    for(let y=0;y<hc.height;y++){ const rr=Math.floor(y/dd/cs)*cols; for(let x=0;x<w;x++) if(a[(y*w+x)*4+3]>thr){ cvs[rr+Math.floor(x/dd/cs)]=1; x+=Math.max(0,Math.floor(dd)-1); } } }catch(e){} }
  if(FLY.view==="cockpit"){ for(let r=Math.ceil(rows*0.15);r<rows;r++){ let n=0; for(let c=0;c<cols;c++) n+=cvs[r*cols+c]; if(n>=cols*0.5){ for(let q=0;q<r;q++) for(let c=0;c<cols;c++) cvs[q*cols+c]=0; break; } } }
  const sat=o=>{ const S=new Int32Array((cols+1)*(rows+1)); for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) S[(r+1)*(cols+1)+c+1]=o[r*cols+c]+S[r*(cols+1)+c+1]+S[(r+1)*(cols+1)+c]-S[r*(cols+1)+c]; return (c0,r0,c1,r1)=>S[r1*(cols+1)+c1]-S[r0*(cols+1)+c1]-S[r1*(cols+1)+c0]+S[r0*(cols+1)+c0]; };
  p.style.visibility="hidden"; p.style.left="0px"; p.style.top="0px"; const pw=Math.ceil(p.offsetWidth/cs), ph=Math.ceil(p.offsetHeight/cs), w=p.offsetWidth, h=p.offsetHeight;   /* a 360 px phone: the panel is nearly as wide as the screen, so no extra margin cells here (the final position is clamped to a 4 px margin) */
  const mixO=new Uint8Array(N); for(let i=0;i<N;i++) mixO[i]=(dom[i]||cvs[i]||soft[i])?1:0; const sAll=sat(mixO), sDom=sat(dom), sCvs=sat(cvs), sSoft=sat(soft), ab=ov.querySelector("#fHubB").getBoundingClientRect(), ax=ab.left-O.left+ab.width/2, ay=ab.top-O.top+ab.height/2, top=0, bot=0;
  const find=(sum,sec)=>{ let bs=1e18, bp=null; for(let r=top;r+ph<=rows-bot;r++) for(let c=0;c+pw<=cols;c++){ if(sum(c,r,c+pw,r+ph)!==0) continue; const o=sec?sec(c,r,c+pw,r+ph):0, d=o*1e5+Math.hypot((c+pw/2)*cs-ax,(r+ph/2)*cs-ay); if(d<bs){ bs=d; bp=[c,r]; } } return bp; };
  let bp=find(sAll)||find(sDom,(c0,r0,c1,r1)=>sCvs(c0,r0,c1,r1)+sSoft(c0,r0,c1,r1));   /* free of everything, else free of the flight controls with the least HUD drawing / ATC strip / deck zones covered */
  if(!bp){ let bo=1e18; bp=[0,top]; for(let r=top;r+ph<=rows-bot;r++) for(let c=0;c+pw<=cols;c++){ const o=sDom(c,r,c+pw,r+ph)*1e5+sSoft(c,r,c+pw,r+ph)*10+Math.hypot((c+pw/2)*cs-ax,(r+ph/2)*cs-ay); if(o<bo){ bo=o; bp=[c,r]; } } }
  p.style.left=Math.max(4,Math.min(W-w-4,bp[0]*cs))+"px"; p.style.top=Math.max(4,Math.min(H-h-4,bp[1]*cs))+"px"; p.style.visibility="";
}
function flyClick(e){ const b=e.target.closest("[data-fa]"); if(b) flyAction(b.dataset.fa); }
function flyAction(a){
  const s=FLY.s; if(!s&&a!=="exit") return;
  if(a==="exit") return flyStop();
  if(a==="pause"){ FLY.paused=!FLY.paused; document.getElementById("fPause").textContent=FLY.paused?"▶":"❚❚"; flyMsg(FLY.paused?"متوقف مؤقتاً":"",FLY.paused?99:0); return; }
  if(a==="view"){ flySetView(FLY_VIEWS[(FLY_VIEWS.findIndex(v=>v[0]===FLY.view)+1)%FLY_VIEWS.length][0]); return; }
  if(a[0]==="v"&&a.length===2){ flySetView(FLY_VIEWS[+a[1]][0]); return; }
  if(a==="q"){ const o=["auto","high","low"]; FLY.opts.q=o[(o.indexOf(FLY.opts.q)+1)%3]; flySaveOpts(); fgQualityInit(); flyResize(); return; }
  if(a==="map"){ const R=[3,10,30,100]; FLY.range=R[(R.indexOf(FLY.range)+1)%R.length]; return; }
  if(a==="help"){ FLY.help=!FLY.help; const h=document.getElementById("fHelp"); h.hidden=!FLY.help; h.innerHTML=FLY.help?`<b>الطيران</b><ul><li>العصا: اسحب للأسفل لرفع الأنف.</li><li>الدفع: المنزلق الأيمن.</li><li>الدفّة: المنزلق السفلي أو Q وE.</li><li>G عجلات · F وV قلابات · X سبويلر · B فرامل · R عكس الدفع · A طيار آلي · 1 إلى 5 كاميرات (وأثناء تشغيل المحركات من البوابة: 1 إلى 4 تشغّل المحركات) · P إيقاف · Esc خروج.</li><li>اسحب على المشهد للتلفّت أو للدوران حول الطائرة.</li></ul>`:""; return; }
  if(a==="hub") return flyHub();
  if(a==="park"){ if(s.ground){ s.parkBrake=!s.parkBrake; } else flyMsg("فرامل الوقوف على الأرض فقط",2); return; }
  if(a==="gear"){ if(s.ground&&s.gearT>0.5&&s.gear>0.9){ flyMsg("لا يمكن رفع العجلات وأنت على الأرض",2); return; } fphSetGear(s,s.gearT<0.5); return; }
  if(a==="flapup") return fphSetFlaps(s,s.flapsT-1); if(a==="flapdn") return fphSetFlaps(s,s.flapsT+1);
  if(a==="spoil"){ s.spoilT=s.spoilT>0.5?0:1; return; }
  if(a==="rev"){ if(s.ground){ FLY.rev=!FLY.rev; fphSetLever(s,FLY.rev?-0.8:0); } else flyMsg("عكس الدفع على الأرض فقط",2); return; }
  if(a==="ap"){ const p=document.getElementById("fAp"); p.hidden=!p.hidden; if(!p.hidden) flyHub(false); ffApPlace(); return; }
  if(a==="coach") return flyCoach();
  const ap=s.ap, info=fphInfo(s);
  if(a==="apon"){ if(!ap.on){ if(s.ground) return flyMsg("الطيار الآلي يُفعّل في الجو",2); ap.on=true; ap.hdg=Math.round(info.hdg)%360; ap.alt=fphApAlt(s,Math.max(500,Math.round(info.alt/100)*100)).v; ap.spd=Math.round(info.ias/5)*5; ap.vert="ALT"; ap.lat="HDG"; ap.appr=false; } else { ap.on=false; ap.appr=false; } return flyApRefresh(); }
  if(a==="athr"){ ap.athr=!ap.athr; if(ap.athr&&!ap.on) ap.on=true; return flyApRefresh(); }
  if(a==="appr"){ ap.appr=!ap.appr; if(ap.appr&&!ap.on){ ap.on=true; ap.hdg=Math.round(info.hdg)%360; ap.alt=fphApAlt(s,Math.max(500,Math.round(info.alt/100)*100)).v; } if(!ap.appr){ ap.lat="HDG"; ap.vert="ALT"; } return flyApRefresh(); }
  const m=/^(alt|hdg|spd|vs)([+-])$/.exec(a); if(m){ const d=m[2]==="+"?1:-1; ap.on=true;
    if(m[1]==="alt"){ const r=fphApAlt(s,ap.alt+d*(FLY.keys.Shift?1000:100)); ap.alt=r.v; if(r.clamped) flyMsg("أقصى ارتفاع لهذه الطائرة "+r.v+" قدم",2); ap.vert="ALT"; ap.appr=false; }
    if(m[1]==="hdg"){ ap.hdg=(ap.hdg+d*10+360)%360; ap.lat="HDG"; ap.appr=false; }
    if(m[1]==="spd"){ ap.spd=Math.max(110,Math.min(380,ap.spd+d*5)); ap.athr=true; }
    if(m[1]==="vs"){ ap.vs=Math.max(-FPH_VSMAX,Math.min(FPH_VSMAX,(ap.vert==="VS"?ap.vs:Math.round(info.vs/100)*100)+d*(FLY.keys.Shift?500:100))); ap.vert="VS"; ap.appr=false; }
    flyApRefresh(); }
}
function flyApRefresh(){
  const s=FLY.s; if(!s) return; const ap=s.ap, g=id=>document.getElementById(id); if(!g("fa_alt")) return;
  g("fa_alt").textContent=ap.alt; g("fa_hdg").textContent=String(ap.hdg).padStart(3,"0"); g("fa_spd").textContent=ap.spd; g("fa_vs").textContent=ap.vert==="VS"?ap.vs:"—";
  g("fApOn").setAttribute("aria-pressed",ap.on); g("fAthr").setAttribute("aria-pressed",ap.athr); g("fAppr").setAttribute("aria-pressed",ap.appr); g("fApB").setAttribute("aria-pressed",ap.on);
}
function flyMsg(t,sec){ FLY.msg=t; FLY.msgT=sec||3; const m=document.getElementById("fMsg"); if(m){ m.textContent=t; m.hidden=!t; } }
function flySetView(v){
  FLY.view=v; FLY.look.yaw=0; FLY.look.pitch=v==="orbit"?0.25:0; FLY.look.zoom=1; FLY.chase.init=false;
  const b=document.getElementById("fView"); if(b) b.textContent=FLY_VIEWS.find(x=>x[0]===v)[1];
  if(FLY.B){ flyCockpitShow(); if(v==="cockpit") flyCockpitHide(); }
  if(typeof fdView==="function") fdView(v);
}
