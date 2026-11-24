/* ---------- the in-flight bar: destination, distance, ETA, clock, route button, speed button ---------- */
const FA_CSS=`.fabar{position:absolute;z-index:6;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 50px);display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:center;max-width:calc(100% - 20px);padding:5px 8px;border-radius:12px;background:rgba(8,16,28,.8);backdrop-filter:blur(6px);color:#eaf2f8;border:1px solid rgba(120,190,255,.3);font:600 11.5px/1.2 system-ui,sans-serif;direction:ltr;pointer-events:auto}
.fabar[hidden]{display:none}.fabar small{opacity:.85;font-weight:600}.fabar b{font-weight:700}
.fabar button{border:1px solid rgba(255,255,255,.24);border-radius:8px;background:rgba(255,255,255,.1);color:inherit;font:700 11px/1 system-ui,sans-serif;padding:6px 8px;min-height:28px;cursor:pointer}
.fabar button[aria-pressed="true"]{background:rgba(52,225,122,.24);border-color:#34e17a}
.faRt{margin:8px 0 2px;font-size:.92em;line-height:1.5}.faRt b{font-weight:700}.faRtl{margin-top:2px}.faRtl.ok{color:#2e8f55}.faRtl.warn{color:#b8651a}
.faRt .sec{margin-inline-start:6px;padding:4px 8px}`;
function faBar(){
  if(FA.bar&&FA.bar.isConnected) return FA.bar; const o=document.getElementById("fly"); if(!o) return null;
  if(!document.getElementById("faStyle")){ const st=document.createElement("style"); st.id="faStyle"; st.textContent=FA_CSS; document.head.appendChild(st); }
  const b=document.createElement("div"); b.id="faBar"; b.className="fabar"; b.hidden=true; b.setAttribute("dir","ltr");
  b.addEventListener("click",e=>{ const x=e.target.closest("[data-faa]"); if(!x) return; e.stopPropagation(); faAct(x.dataset.faa); faBarDom(); });
  o.appendChild(b); FA.bar=b; return b;
}
function faBarShow(on){ const b=faBar(); if(!b) return; if(!on){ b.hidden=true; return; } faBarDom(); }
/* the bar shows in the air (and while a route is flown): on the ground the gate panel and the checklist own the top of the screen */
function faBarDom(){
  const b=FA.bar; if(!b||!FA.trip) return; const s=FLY.s, en=fkLang()==="en", ts=+FLY.opts.ts||1, dst=FA.trip.dst, vis=FA.on&&!!s&&(!s.ground||FA.route);
  if(b.hidden===vis) b.hidden=!vis;
  let eta="—"; const gs=s?Math.hypot(s.v.x,s.v.z)/FPH_KT:0, rem=FA.route?FA.R||0:0;
  if(FA.route&&gs>1) eta=faHm(rem/(gs*FPH_KT)/60);
  const km=Math.round((FA.leg==="parked"||FA.leg==="done"?0:FA.leg==="arr"?Math.hypot(s.p.x,s.p.z):(FA.route?rem:FA.trip.km*1000))/1000);
  const txt=`<b>${dst.id}</b><small>${dst.rwy}</small><small>${km} km</small><small>ETA ${eta}</small><small>${en?"Clock":"الساعة"} ${faHm(FA.simT/60)}</small>`;
  const h=`${txt}<button type="button" data-faa="route" aria-pressed="${FA.route}">${en?"Route":faTx(FA_T.route)}</button><button type="button" data-faa="ts" aria-pressed="${ts>1}">×${ts}</button>`;
  if(b.dataset.k!==h){ b.dataset.k=h; b.innerHTML=h; }
}
/* ---------- state ---------- */
function faReset(){
  const o=FLY.opts, T=faTripFor(), dep=o.apt||"ORBI";
  Object.assign(FA,{on:!!T,route:false,leg:"dep",trip:T,simT:0,R:0,tod:false,swapped:false,iaf:false,landed:false,done:false,tBar:0});
  if(FLY.W&&FLY.W.aptId&&FLY.W.aptId!==dep) FLY.W.setApt(dep);   /* back to the departure world (the last flight may have landed elsewhere) */
  faBarShow(!!T);
  try{ faAtcReset(); }catch(e){ console.error(e); }
}
function faStop(){ FA.on=false; if(FA.bar) FA.bar.hidden=true; try{ faAtcStop(); }catch(e){} }
/* the buttons of the bar and the setup */
function faAct(a){
  const s=FLY.s, T=FA; if(!s||!T.on) return;
  if(a==="ts"){ const v=[1,4,16], i=v.indexOf(+FLY.opts.ts||1); FLY.opts.ts=v[(i+1)%v.length]; flySaveOpts(); flyMsg(faF(FA_T.ts,{n:FLY.opts.ts}),3); return; }
  if(a!=="route") return;
  if(T.route){ T.route=false; flyMsg(faTx(FA_T.off),4); return; }
  if(T.leg!=="dep") return;
  if(s.ground){ flyMsg(faTx(FA_T.afterTo),4); return; }
  if(fphInfo(s).agl<1000){ flyMsg(faTx(FA_T.noAlt),4); return; }
  if(s.gearT>0.5||s.flapsT>0){ flyMsg(faTx(FA_T.noCfg),4); return; }
  const d=faDestPt();
  Object.assign(s.ap,{on:true,athr:true,lat:"HDG",vert:"ALT",appr:false,spd:250,alt:fphApAlt(s,FA_CRUISE_FT).v,hdg:Math.round(faHdgTo(d[0]-s.p.x,d[1]-s.p.z))%360});
  T.route=true; T.leg="cruise"; flyApRefresh(); flyMsg(faF(FA_T.on,{icao:T.trip.dst.id}),5); faSay(FA_T.on,"on",20000); faBarDom();
}
/* per physics step (from flyInputs): the route, top of descent, the arrival configuration, the rollout */
function faStep(dt){
  if(typeof faAtcStep==="function") faAtcStep(dt);   /* fa: the controller follows the flight (also the ground part of the gate scenario) */
  const T=FA; if(!T.on) return; const s=FLY.s; if(!s) return; T.simT+=dt;
  if(T.route&&!s.ground){
    if(T.leg==="cruise"){
      const d=faDestPt(), dx=d[0]-s.p.x, dz=d[1]-s.p.z, R=Math.hypot(dx,dz); T.R=R; s.ap.hdg=Math.round(faHdgTo(dx,dz))%360;
      if(!T.tod&&R<=FA_TOD_M){ T.tod=true; s.ap.alt=fphApAlt(s,FA_ARR_FT).v; s.ap.spd=250; faSay(FA_T.tod,"tod",30000); }
      if(!T.swapped&&R<=FA_SWAP_M) faSwap();   /* v21: seamless re-base, no whiteout */
    } else if(T.leg==="arr"){
      const R=Math.hypot(s.p.x,s.p.z); T.R=R;
      if(!T.iaf){ const dx=-s.p.x, dz=FA_ARR_M-s.p.z, dI=Math.hypot(dx,dz);   /* direct to the fix on the extended centre line, then the runway heading (the ILS captures within 2.2 degrees) */
        if(dI>6000) s.ap.hdg=Math.round(faHdgTo(dx,dz))%360; else { T.iaf=true; s.ap.hdg=0; } }
      if(R<50000&&s.gearT<0.5) fphSetGear(s,true);
      if(R<40000&&s.flapsT<2) fphSetFlaps(s,2);
      if(R<25000&&s.flapsT<s.A.apprFlaps) fphSetFlaps(s,s.A.apprFlaps);
      s.ap.spd=R<25000?Math.round(fphSpeeds(s,s.A.apprFlaps).vref+8):R<45000?190:220;
    }
  }
  if(T.leg==="arr"&&s.ev.touch&&!T.landed){ T.landed=true; faSay(FA_T.landed,"landed",30000); }
  if(T.leg==="arr"&&s.ground){   /* rollout: autobrake, idle thrust, until the aircraft is slow */
    const gs=Math.hypot(s.v.x,s.v.z)/FPH_KT; s.ap.on=false; s.ap.appr=false; s.lever=0; s.autobrake=gs>25?0.5:0;
    if(gs<=25&&!T.done){ T.done=true; T.route=false; T.leg="done"; T.taxiR=faTaxiPlan(s); flyMsg(faF(FA_T.landed,{icao:T.trip.dst.id}),6); }
  }
  if(T.leg==="done"&&T.taxiR&&s.ground) faTaxiStep(s);   /* the ground follower takes the aircraft to its stand */
}
/* arrival taxi: from the rollout to the first runway exit ahead, the taxiway, the apron lane and the stand (the route corners go through fkRoute) */
function faTaxiPlan(s){
  const L=FLY.W&&FLY.W.L; if(!L) return null; const sg=L.sg, st=L.stands[L.gate], zl=L.links[0], ex=L.ex.slice(1).find(z=>z<s.p.z-50), zE=ex===undefined?L.ex[L.ex.length-1]:ex;
  return {pts:fkRoute([[s.p.x,s.p.z],[0,zE],[sg*L.tw,zE],[sg*L.tw,zl],[sg*L.xl,zl],[sg*L.xl,st.z],[st.x,st.z]],18),stand:{x:st.x,z:st.z},n:L.gate+1};
}
/* the follower: pure pursuit on the route (25 m look-ahead). Steering goes through FLY.rud (flyInputs sets the rudder input from it), braking through autobrake. */
function faTaxiStep(s){
  const R=FA.taxiR, P=R.pts, p=s.p; let bi=0, bd=1e18; for(let i=0;i<P.length;i++){ const d=(P[i][0]-p.x)*(P[i][0]-p.x)+(P[i][1]-p.z)*(P[i][1]-p.z); if(d<bd){ bd=d; bi=i; } }
  let ti=bi, acc=0; while(ti<P.length-1&&acc<25){ acc+=Math.hypot(P[ti+1][0]-P[ti][0],P[ti+1][1]-P[ti][1]); ti++; }
  const Tp=P[ti], hd=fphEuler(s.q).hdg, err=((faHdgTo(Tp[0]-p.x,Tp[1]-p.z)-hd+540)%360)-180, dS=Math.hypot(R.stand.x-p.x,R.stand.z-p.z), v=Math.hypot(s.v.x,s.v.z)/FPH_KT, last=bi>=P.length-3;
  s.taxi=true; FLY.rud=Math.max(-1,Math.min(1,err/15));
  if(last&&dS<4&&v<2){ if(FA.leg!=="parked"){ FA.leg="parked"; FA.taxiR=null; s.lever=0; s.autobrake=1; s.parkBrake=true; s.v.set(0,0,0); flyMsg(faF(FA_T.parked,{n:R.n}),6); } return; }
  const tgt=last?Math.min(5,dS*0.35+1):(Math.abs(err)>30?7:14);
  s.autobrake=v>tgt+2?0.35:0; s.lever=v<tgt-1.5?0.1:0;
}
/* time compression: the number of physics steps per real frame. Only while the autopilot flies the route in smooth air, not in the fade or the final approach. */
function faScale(){
  const T=FA, k=+FLY.opts.ts||1; if(!T.on||!T.route||k<=1) return 1; const s=FLY.s;
  if(!s||s.ground||!s.ap.on||s.ev.stall||s.ev.overspeed) return 1;
  if(T.leg==="arr"&&T.R<40000) return 1;
  if(Math.abs(s.inp.p)>0.05||Math.abs(s.inp.r)>0.05||Math.abs(s.inp.y)>0.05||Math.abs(fphEuler(s.q).bank)>15) return 1;
  return k;
}
/* the swap: the destination world is built and the coordinates re-based, nothing else changes (position relative to the airport, altitude, speed, heading, autopilot) */
function faSwap(){
  const T=FA, s=FLY.s, dst=T.trip.dst, d=faDestPt();
  FLY.W.setApt(dst.id); T.swapped=true; T.leg="arr"; T.route=true; T.iaf=false;
  s.p.x-=d[0]; s.p.z-=d[1];   /* all runways point north: a pure translation, the threshold of the destination is the new origin */
  Object.assign(s.ap,{on:true,athr:true,lat:"HDG",vert:"ALT",alt:fphApAlt(s,FA_ARR_FT).v,spd:Math.min(250,s.ap.spd||250),appr:!FAC.on,flare:true});   /* with the controller the approach waits for its clearance */
  s.ap.hdg=Math.round(faHdgTo(-s.p.x,FA_ARR_M-s.p.z))%360;
  try{ if(typeof ftRebase==="function") ftRebase(-d[0],-d[1]); }catch(e){ console.error(e); }   /* x_fly_traffic.js (if present) moves its aircraft with the world */
  faSay(FA_T.swap,"swap",30000); flyApRefresh(); flyMsg(faF(FA_T.swap,{icao:dst.id}),5);
}
function faFrame(dt){
  const T=FA; if(!T.on) return;
  T.tBar-=dt; if(T.tBar<=0){ T.tBar=0.25; faBarDom(); try{ faAtcStripDom(); }catch(e){} }
}
/* the route on the navigation display (inside fdNd's rotated, clipped group: px/pz map metres to the drawing; hd is the heading in radians) and on the mini map (north up) */
function faRouteTarget(s){ const T=FA; if(!T.on||!T.trip||!s) return null; if(!s.ground||T.route) return T.leg==="arr"?[0,0]:faDestPt(); return null; }
function faNdDraw(g,px,pz,k,boe,s,hd){
  const t=faRouteTarget(s); if(!t) return; const col=boe?FDC.mag:FDC.cy, km=Math.hypot(t[0]-s.p.x,t[1]-s.p.z)/1000;
  /* beyond the display the symbol sits on the edge in the direction of the destination, with its distance */
  const x0=px(t[0]), z0=pz(t[1]), dd=Math.hypot(x0,z0), Rd=(FD.ndMode==="arc"?76:41)*0.72, sc=dd>Rd?Rd/dd:1, x=x0*sc, z=z0*sc;
  g.save(); g.strokeStyle=col; g.lineWidth=0.7; g.setLineDash([1.6,1.2]); g.beginPath(); g.moveTo(0,0); g.lineTo(x,z); g.stroke(); g.setLineDash([]);
  g.translate(x,z); g.fillStyle=col; g.beginPath(); g.moveTo(0,-1.6); g.lineTo(1.6,0); g.lineTo(0,1.6); g.lineTo(-1.6,0); g.closePath(); g.fill(); g.restore();
  g.save(); g.translate(x,z); g.rotate(hd); fdTx(g,FA.trip.dst.id,2.6,-1.2,3.8,col,"left"); fdTx(g,Math.round(km)+" km",2.6,2.2,3.2,FDC.wht||col,"left"); g.restore();
}
function faMapDraw(g,px,pz,k,range,s){
  const t=faRouteTarget(s); if(!t) return; const x0=px(t[0]), z0=pz(t[1]), Rm=k*range*1000*0.8, dd=Math.hypot(x0,z0), sc=dd>Rm?Rm/dd:1, x=x0*sc, z=z0*sc;   /* beyond the map: on its edge, in the direction of the destination */
  g.save(); g.strokeStyle="#ffd27a"; g.lineWidth=1.2; g.setLineDash([3,3]); g.beginPath(); g.moveTo(0,0); g.lineTo(x,z); g.stroke(); g.setLineDash([]);
  g.fillStyle="#ffd27a"; g.beginPath(); g.arc(x,z,2.6,0,7); g.fill(); g.font="700 10px system-ui,sans-serif"; g.fillText(FA.trip.dst.id,x+5,z-4); g.restore();
}
