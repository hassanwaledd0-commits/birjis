/* ---------- start and stop ---------- */
const FLY_SINK=0.12;   /* static gear compression of the physics (p8p.js): the drawn model is raised by it, so the tyres stand ON the apron instead of 12 cm inside it */
/* (v36) the start builds the world (airport, sky, the aircraft) in one go: the loading screen is painted first, then the build runs; it used to be a black screen (a frozen page) for seconds on a phone */
function flyStartSoft(){
  if(!GLOK||!HAS3D||FLY.on||FLY.starting||(navigator.webdriver&&!FLY.soft)){ if(!FLY.starting) flyStart(); return; }   /* automated tests start at once (as before v36); FLY.soft=true tests the loading screen */
  FLY.starting=true; const ov=flyEnsure(), ld=ov.querySelector("#flyLoad"); ov.hidden=false; if(ld) ld.hidden=false; document.body.style.overflow="hidden";
  try{ ov.setAttribute("tabindex","-1"); ov.focus({preventScroll:true}); }catch(e){}
  requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(()=>{ FLY.starting=false;
    try{ flyStart(); }catch(e){ console.error(e); flyStop(); }
    finally{ requestAnimationFrame(()=>requestAnimationFrame(()=>{ if(ld) ld.hidden=true; })); } },30)));
}
function flyStart(){
  const o=FLY.opts; if(!GLOK||!HAS3D) return;
  try{ if(S.ac!==o.ac) setAc(o.ac); }catch(e){ console.error(e); }
  try{ S.ex=0; S.exT=0; S.xray=false; S.pull=new Set(); }catch(e){}   /* the atlas viewer may have been left exploded or in x-ray on the same aircraft: the flight model starts whole */
  FLY.prevFocus=document.activeElement; const ov=flyEnsure(); ov.hidden=false; try{ ov.setAttribute("tabindex","-1"); ov.focus({preventScroll:true}); }catch(e){}   /* a11y: the dialog takes the focus */
  ov.hidden=false; document.body.style.overflow="hidden"; FLY.on=true; FLY.paused=false;
  FLY.key=S.ac; const key=FLY.key;
  if(typeof ffSndStart==="function") try{ ffSndStart(key); }catch(e){}   /* flight sound (x_fly_snd.js): created on this click */
  try{ if(!FLY.ren){ FLY.ren=new THREE.WebGLRenderer({canvas:ov.querySelector("#flyGl"),antialias:(window.devicePixelRatio||1)<2,powerPreference:"high-performance"}); FLY.ren.outputEncoding=THREE.sRGBEncoding; FLY.ren.toneMapping=THREE.ACESFilmicToneMapping; FLY.cam=new THREE.PerspectiveCamera(70,1,0.6,90000); FLY.pmrem=new THREE.PMREMGenerator(FLY.ren); }
    if(!FLY.W) FLY.W=fwBuild(); FLY.scene=FLY.W.scene; }
  catch(e){ console.error(e); document.getElementById("fMsg").textContent="تعذّر تشغيل الرسوم ثلاثية الأبعاد للطيران."; flyStop(); return; }
  GL.hide();
  FLY.B=GL.lend(); const B=FLY.B; if(!B){ flyStop(); return; }
  FLY.pivot=new THREE.Group(); FLY.W.scene.add(FLY.pivot); FLY.pivot.add(B.root);
  const c=GEO[key], A=FPH_AC[key]; B.root.position.set(0,-A.hm+FLY_SINK,-(A.cgX-c.L/2)); B.root.rotation.set(0,0,0); FLY.W.fx.setAircraft(B,A);
  try{ FLY.W.setApt(o.apt||"ORBI"); }catch(e){ console.error(e); } FLY.W.setTime(o.time); FLY.W.setWx(o.wx); flyEnv(); FLY.ren.toneMappingExposure=FLY.W.exposure; fgQualityInit();
  flyReset(); flyResize();
  FLY.last=performance.now(); FLY.raf=requestAnimationFrame(flyFrame);
}
function flyReset(){
  try{ if(typeof faReset==="function") faReset(); }catch(e){ console.error(e); }   /* fa: the trip of the setup; the departure world comes back before the scenario is built */
  const o=FLY.opts, s=FLY.s=fphScenario(FLY.key,o.scn,{L:FLY.W&&FLY.W.L,fuel:o.fuel,payload:o.load==="cargo"&&typeof fplKg==="function"?fplKg():0}); const w=FLY_WIND[o.wind]||FLY_WIND.calm; s.wind.set(w.v[0],0,w.v[1]); s.turb=Math.max(o.turb,FLY.W.turb||0); s.protect=!!o.protect; s.assist=!!o.assist; s.flareAssist=!!o.land;
  try{ if(typeof fkGateInit==="function") fkGateInit(FLY.W,s); }catch(e){ console.error(e); }
  try{ if(typeof ftReset==="function") ftReset(s); }catch(e){ console.error(e); }   /* x_fly_traffic.js: a fresh sky around the new start */
  flyCargoWin(o.load==="cargo");
  FLY.score=null; FLY.scoreShown=false; FLY.touchSeen=null; FLY.crashSeen=null; FLY.evLog=[]; FLY.rev=false; FLY.coach.text=""; FLY.look.zoom=1;
  document.getElementById("fScore").hidden=true; flyMsg("",0); flySetView(o.scn==="cruise"?"chase":"cockpit"); if(o.scn==="approach") FLY.view="cockpit";
  if(FLY.scn!==o.scn||true){ fphSetLever(s,s.lever); } flyApRefresh();
  const t=document.getElementById("fTtl"); if(t) t.textContent=FPH_SCN[o.scn].ar+" · "+FPH_AC[FLY.key].name+(o.apt?" · "+o.apt:"")+(o.load==="cargo"?" · شحن"+(typeof fplT==="function"?" "+fplT()+"t":""):"");
  flyStepFor(0.2); try{ bobFlightBrief(); }catch(e){}   /* Bobby speaks the briefing */
}
/* freighter: no cabin windows (only the flight-deck glass stays); shown again when the flight ends */
function flyCargoWin(on){
  (FLY.cargoHid||[]).forEach(m=>{ m.visible=true; }); FLY.cargoHid=[];
  if(on&&FLY.B&&FLY.B.byId) (FLY.B.byId.windows||[]).forEach(m=>{ if(m.visible){ m.visible=false; FLY.cargoHid.push(m); } });
}
function flyEnv(){   /* reflections for the aircraft materials: the sky shader captured to a small cube map and prefiltered */
  const W=FLY.W, t=FW_TIMES[W.time]; if(FLY.envRT) FLY.envRT.dispose(); FLY.envRT=W.makeEnv(FLY.ren,FLY.pmrem);
  FLY.B.mats.forEach(m=>{ m.envMap=FLY.envRT.texture; m.envMapIntensity=t.night?0.6:1.0; m.needsUpdate=true; });
  fvEnv(FLY.envRT.texture,t.night?0.6:1.0); fvOwnNight(FLY.B,t.glassE*0.9);
}
function flyStop(){
  { const ld=document.getElementById("flyLoad"); if(ld) ld.hidden=true; FLY.starting=false; }
  if(!FLY.on){ const ov0=document.getElementById("fly"); if(ov0&&!ov0.hidden){ ov0.hidden=true; document.body.style.overflow=""; } return; } FLY.on=false; try{ flyHub(false); }catch(e){} cancelAnimationFrame(FLY.raf); FLY.raf=0; flyCoachStop();
  if(typeof ffSndStop==="function") try{ ffSndStop(); }catch(e){}
  const ov=document.getElementById("fly"); if(ov) ov.hidden=true; document.body.style.overflow="";
  try{ const pf=FLY.prevFocus; FLY.prevFocus=null; if(pf&&pf.isConnected&&pf.focus&&pf!==document.body) pf.focus({preventScroll:true}); }catch(e){}   /* a11y: back to the control that opened it */
  flyCockpitShow(); flyCargoWin(false);
  try{ fgShadowSet(false); FLY.W.fx.clear(); }catch(e){} try{ if(typeof fkGateStop==="function") fkGateStop(); }catch(e){} try{ if(typeof feStop==="function") feStop(); }catch(e){} try{ if(typeof faStop==="function") faStop(); }catch(e){} try{ if(typeof ftStop==="function") ftStop(); }catch(e){}
  if(FLY.B&&FLY.pivot){ FLY.pivot.remove(FLY.B.root); FLY.W.scene.remove(FLY.pivot); }
  try{ fvOwnNight(FLY.B,0); }catch(e){}
  if(FLY.B){ FLY.B.mats.forEach(m=>{ m.envMap=null; }); FLY.B=null; }
  try{ GL.restore(); GL.show(); GL.kick(); }catch(e){ console.error(e); }
  FLY.s=null; FLY.keys={}; FLY.brake=false; FLY.stick.x=FLY.stick.y=0; FLY.rud=0;
}
function flyResize(){
  const ov=document.getElementById("fly"); if(!ov||!FLY.ren) return; const w=ov.clientWidth, h=ov.clientHeight; if(!w||!h) return;
  FLY.ren.setSize(w,h,false); FLY.W&&FLY.W.setSize(h,FLY.ren.getPixelRatio()); FLY.cam.aspect=w/h; FLY.cam.updateProjectionMatrix();
  const hc=ov.querySelector("#flyHud"), d=Math.min(window.devicePixelRatio||1,2); hc.width=Math.round(w*d); hc.height=Math.round(h*d); hc.style.width=w+"px"; hc.style.height=h+"px"; FLY.dpr=d;
  ov.classList.toggle("fport",h>w*1.05);
  clearTimeout(FLY.apT); FLY.apT=setTimeout(ffApPlace,150);
}
