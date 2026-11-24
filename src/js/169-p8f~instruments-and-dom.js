/* ---------- instruments and DOM ---------- */
function flyHud(info,ts){
  const ov=document.getElementById("fly"), cv=ov.querySelector("#flyHud"), g=cv.getContext("2d"), d=FLY.dpr||1, W=cv.width/d, H=cv.height/d, s=FLY.s;
  g.setTransform(d,0,0,d,0,0); g.clearRect(0,0,W,H);
  const ils=fphIls(s), k=Math.min(W,H)*0.17;
  if(FLY.view==="cockpit") fgCockpitDraw(g,W,H,FLY.dtF||0.016,s,info);
  if(FLY.view==="cockpit"&&typeof fdDraw==="function"&&fdDraw(g,W,H,info,ts)){ fhWarn(g,W,H,s,info,ts/1000); return; }   /* flight-deck panel (x_fly_deck*.js) replaces the compact HUD */
  const port=H>W*1.05;
  fhPFD(g,W,H,k,info,s,(s.ap.appr||(!s.ground&&ils.valid&&s.gear>0.5&&s.scn==="approach"))?ils:null,port?Math.min(215,H*0.26):undefined);
  const sz=Math.max(10,Math.min(14,W*0.016)); fhStrip(g,12,Math.max(70,H*0.13),sz,s,info,H<460?4:6);
  if(typeof feFuelHud==="function") try{ feFuelHud(g,12,Math.max(70,H*0.13)+sz*4.3,sz,s); }catch(e){}   /* fe: fuel line under the engine strip */
  const ms=Math.max(96,Math.min(150,W*0.15)); fhMap(g,W-ms-10,Math.max(62,H*0.11),ms,s,info,FLY.range);
  fhWarn(g,W,H,s,info,ts/1000);
}
/* a simple cockpit frame: window pillars and glare shield, so the cockpit view reads as "inside" */
function flyCockpitFrame(g,W,H){
  g.save(); g.fillStyle="rgba(10,12,16,0.92)"; g.beginPath(); g.moveTo(0,H); g.lineTo(0,H*0.72); g.quadraticCurveTo(W*0.5,H*0.62,W,H*0.72); g.lineTo(W,H); g.closePath(); g.fill();
  g.fillStyle="rgba(14,16,20,0.96)"; g.fillRect(0,0,W*0.035,H); g.fillRect(W*0.965,0,W*0.035,H); g.fillRect(W*0.485,0,W*0.03,H*0.2); g.fillRect(0,0,W,H*0.035);
  g.strokeStyle="rgba(255,255,255,0.08)"; g.lineWidth=2; g.beginPath(); g.moveTo(0,H*0.72); g.quadraticCurveTo(W*0.5,H*0.62,W,H*0.72); g.stroke(); g.restore();
}
function flyHint(s,info){ if(FLY.crashSeen) return "اضغط «أعد المحاولة».";   /* the spoken coach (x_bobby_flight.js) decides what Bobby says; this returns the best current advice as text */
  try{ return bobFlightAdvice(s,info); }catch(e){ return ""; } }
function flyDom(info){
  const s=FLY.s, g=id=>document.getElementById(id); if(!g("fThrV")) return;
  const l=Math.max(0,s.lever); g("fThrK").style.height=(l*100)+"%"; g("fThrV").textContent=s.lever<0?"REV":Math.round(l*100);
  const T=(id,v)=>{ const e=g(id); if(e&&e.textContent!==v) e.textContent=v; }, P=(id,on)=>{ const e=g(id); if(e&&e.getAttribute("aria-pressed")!==String(!!on)) e.setAttribute("aria-pressed",!!on); };
  P("fGear",s.gearT>0.5); T("fGearV",s.gearT>0.5?"نازلة":"مرفوعة"); P("fSpoil",s.spoilT>0.5); T("fSpoilV",s.spoilT>0.5?"خارج":"مسحوب"); P("fRev",FLY.rev); T("fRevV",FLY.rev?"يعمل":"متوقف"); P("fPark",s.parkBrake); T("fParkV",s.parkBrake?"مفعّلة":"غير مفعّلة");
  T("fFlap","FLAPS "+s.A.flaps[s.flapsT]); flyHubBuild(); { const dt=g("fFlapDt"); if(dt) Array.prototype.forEach.call(dt.children,(c,i)=>{ const on=i===s.flapsT; if(c.getAttribute("aria-pressed")!==String(on)) c.setAttribute("aria-pressed",on); }); }
  try{ bobFlightTick(s,info); }catch(e){ console.error(e); }   /* the coach speaks instead of showing text (captions are Bobby's bubble) */
  flyApRefresh();
}
