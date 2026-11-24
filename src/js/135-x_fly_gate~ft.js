/* ---------- ft: air traffic (prefix ft). A few other aircraft fly through the sky around the player on straight tracks at flight levels: they are drawn in the 3D world
   (decimated builder output, one paint mesh + one glass mesh + one light draw each, through the same materials as the parked aircraft) and shown on the radar: the
   mini-map and the navigation display (diamond = other traffic, filled cyan = proximate, amber disc = traffic advisory, with the height difference in hundreds of feet).
   A traffic advisory also says «traffic, traffic» (the sound module) when another aircraft is on course to pass within about 9 km and 850 ft of the player.
   Rules that keep it safe and calm: nothing below 3,500 ft, nothing within 1,500 ft of the player's level at the moment it appears, every track passes the player
   at least 4 km to the side, and the aircraft are never near the runway (they fly high; the departure and the approach stay clear). When the trip swaps the
   airport (x_fly_route.js) ftRebase moves them with the world. Option: FLY.opts.traffic (setup chip), default on. API: ftReset(s) ftFrame(dt,s,info) ftStop() ftRebase(dx,dz)
   ftTraffic() ftMapDraw(g,px,pz,k,range,s) ftNdDraw(g,px,pz,k,boe,s,hd,R). ---------- */
const FT={list:[],grp:null,lm:null,seed:90210,clock:0,ta:{},idc:0,cool:0,on:false};
const FT_FT=0.3048, FT_R=80000, FT_N=[4,6,8], FT_YMIN=1100, FT_YMAX=12500;   /* decimation: the far-aircraft cell of the airport's own detail tier (FV_CELLS), so the airport's work is reused */
const FT_KEYS=["b737","b737","a380","b747","b737","a380","b747","b737","b737"];
const FT_LV=[4000,5000,6000,7000,9000,10000,12000,14000,16000,18000,20000,22000,24000,26000,28000,30000,32000,34000,36000,38000,40000];
const FT_COL=["#cfe3ee","#33d6ff","#ffb02e"];
function ftRnd(){ FT.seed=(Math.imul(FT.seed,1664525)+1013904223)>>>0; return FT.seed/4294967296; }
const ftEnabled=()=>typeof FLY!=="undefined"&&FLY.opts&&FLY.opts.traffic!==false&&typeof THREE!=="undefined"&&typeof apJetBake==="function"&&typeof fvDecim==="function";
const ftTarget=()=>FT_N[Math.max(0,Math.min(2,(FLY.q&&FLY.q.tier)!==undefined?FLY.q.tier:2))];
/* one aircraft: decimated body / wings / tail / engines in the livery colours (no gear, no ground equipment) + glass + its own lights, nose along -z, origin at the model origin */
function ftMake(key,pal){
  const M=FV.mats, W=FLY.W; if(!M||!W||!W.fx) return null;
  if(!FT.lm) FT.lm=fgLightMat(W.fx.LU);
  const t0=FV.tris, c0=FV.calls, cell=FV_CELLS[Math.max(0,Math.min(2,(FLY.q&&FLY.q.tier)||0))][2], D=fvDecim(key,cell), b=apJetBake(key), sk=fvCol(pal.skin), bl=fvCol(pal.belly), T=D.body.e, a=fvAcc(), gl=fvAcc(), lin=[0,0,0];
  fvAdd(a,D.body.g,0,0,0,i=>{ const t=T[i]; lin[0]=bl[0]+(sk[0]-bl[0])*t; lin[1]=bl[1]+(sk[1]-bl[1])*t; lin[2]=bl[2]+(sk[2]-bl[2])*t; return lin; });
  [["wing",pal.wing],["tail",pal.tail],["stripe",pal.stripe],["engine",pal.engine]].forEach(([r,h])=>{ if(D[r]){ const c=fvCol(h); fvAdd(a,D[r].g,0,0,0,()=>c); } });
  if(D.glass) fvAdd(gl,D.glass.g,0,0,0,null);
  const G=new THREE.Group(); G.rotation.order="YXZ"; const p=fvMesh(a,M.paint), g=fvMesh(gl,M.glass); if(p) G.add(p); if(g) G.add(g);
  const P=[], C=[], A=[], L=(x,y,z,c,s,code)=>{ P.push(x,y,z); C.push(c[0],c[1],c[2]); A.push(s,code); };
  b.lp.forEach(q=>{ const wing=Math.abs(q[0])>10;
    if(q[3]===1&&wing) L(q[0],q[1],q[2],[1,0.1,0.06],0.5,0); else if(q[3]===2) L(q[0],q[1],q[2],[0.1,1,0.3],0.5,0);
    else if(q[3]===0&&wing) L(q[0],q[1],q[2],[1,0.95,0.85],0.8,5); else if(q[3]===1) L(q[0],q[1],q[2],[1,0.1,0.06],0.9,4); else if(q[3]===0) L(q[0],q[1],q[2],[1,0.95,0.85],0.4,0); });
  if(P.length){ const lg=new THREE.BufferGeometry(); lg.setAttribute("position",new THREE.Float32BufferAttribute(P,3)); lg.setAttribute("aCol",new THREE.Float32BufferAttribute(C,3)); lg.setAttribute("aP",new THREE.Float32BufferAttribute(A,2));
    const pt=new THREE.Points(lg,FT.lm); pt.frustumCulled=false; pt.renderOrder=6; pt.raycast=()=>{}; G.add(pt); }
  FV.tris=t0; FV.calls=c0;   /* the counters belong to the parked aircraft of the airport */
  return G;
}
/* choose a level, a track and a start for aircraft t. first = the opening picture (spread over the sky); later = it enters at the edge of the area, on its way past the player */
function ftSpawn(t,s,first){
  const py=s.p.y/FT_FT, low=py<4000; let alt=0;
  for(let i=0;i<10;i++){ alt=FT_LV[(ftRnd()*FT_LV.length)|0]; if(Math.abs(alt-py)>1500&&alt>=(low?6000:3500)) break; alt=Math.max(6000,py+4000); }
  const v=alt<10000?130+ftRnd()*45:alt<24000?170+ftRnd()*45:215+ftRnd()*35, h=ftRnd()*6.2832, c=(4000+ftRnd()*12000)*(ftRnd()<0.5?-1:1), d0=first?-20000+ftRnd()*75000:FT_R-5000;
  const ux=Math.sin(h), uz=-Math.cos(h), nx=Math.cos(h), nz=Math.sin(h);
  t.x=s.p.x+nx*c-ux*d0; t.z=s.p.z+nz*c-uz*d0; t.y=alt*FT_FT; t.h=h; t.v=v; t.vz=ftRnd()<0.7?0:(ftRnd()<0.5?-1:1)*(4+ftRnd()*7); t.st=0; t.id=++FT.idc;
}
function ftAdd(s){
  const key=FT_KEYS[(ftRnd()*FT_KEYS.length)|0], livs=FV_LIV.filter(k=>typeof LIVERY!=="undefined"&&LIVERY[k]), pal=fvPal(livs[(ftRnd()*livs.length)|0]||"classic"), G=ftMake(key,pal); if(!G) return false;
  const t={key,g:G,x:0,y:0,z:0,h:0,v:0,vz:0,st:0,id:0,r:0,rel:0,tau:99}; ftSpawn(t,s,true); FT.grp.add(G); FT.list.push(t); ftPlace(t); return true;
}
function ftPlace(t){ const G=t.g; G.position.set(t.x,t.y,t.z); G.rotation.y=-t.h; G.rotation.x=Math.asin(Math.max(-0.3,Math.min(0.3,t.vz/Math.max(60,t.v)))); }
function ftDrop(t){ FT.grp.remove(t.g); t.g.traverse(o=>{ if(o.isPoints&&o.geometry) o.geometry.dispose(); else if(o.geometry) o.geometry.dispose(); }); }
/* flight start / restart: a fresh sky; the aircraft appear one per frame (the first builds of a type are the slow part) */
function ftReset(s){
  ftStop(); if(!ftEnabled()||!FLY.W||!FLY.W.scene) return; FT.grp=new THREE.Group(); FT.grp.name="traffic"; FLY.W.scene.add(FT.grp); FT.on=true; FT.clock=0; FT.ta={}; FT.cool=0; FT.seed=(FT.seed^((Date.now()/1000)|0))>>>0;
}
function ftStop(){ if(FT.grp){ FT.list.forEach(ftDrop); if(FT.grp.parent) FT.grp.parent.remove(FT.grp); } FT.list=[]; FT.grp=null; FT.on=false; }
function ftRebase(dx,dz){ FT.list.forEach(t=>{ t.x+=dx; t.z+=dz; ftPlace(t); }); }
function ftFrame(dt,s,info){
  if(!FT.on){ if(!FT.grp&&FLY.opts&&FLY.opts.traffic!==false&&FLY.on&&FLY.W&&s) ftReset(s); if(!FT.on) return; }
  if(!ftEnabled()){ ftStop(); return; }
  FT.clock+=dt; const kk=typeof faScale==="function"?faScale():1, d=FLY.paused?0:dt*kk, want=ftTarget(), L=FT.list;
  if(L.length<want&&FV.mats){ try{ ftAdd(s); }catch(e){ console.error(e); FT.on=false; return; } }
  else if(L.length>want&&FT.clock>3){ ftDrop(L.pop()); }
  let ta=null;
  for(const t of L){
    if(d>0){ t.x+=Math.sin(t.h)*t.v*d; t.z-=Math.cos(t.h)*t.v*d; t.y+=t.vz*d; if(t.y<FT_YMIN) t.vz=Math.abs(t.vz); else if(t.y>FT_YMAX) t.vz=-Math.abs(t.vz); }
    const dx=t.x-s.p.x, dz=t.z-s.p.z, r=Math.hypot(dx,dz);
    if(r>FT_R&&dx*Math.sin(t.h)-dz*Math.cos(t.h)>0){ ftSpawn(t,s,false); ftPlace(t); continue; }   /* gone past the edge of the area: comes in again at the far side */
    t.r=r; t.rel=(t.y-s.p.y)/FT_FT/100; const dvx=Math.sin(t.h)*t.v-s.v.x, dvz=-Math.cos(t.h)*t.v-s.v.z, cr=-(dx*dvx+dz*dvz)/Math.max(r,1); t.tau=cr>1?r/cr:99;
    const dy=Math.abs(t.y-s.p.y); t.st=(r<9000&&dy<260&&t.tau<40)?2:(r<11000&&dy<366)?1:0;
    if(t.st===2&&(!ta||t.r<ta.r)) ta=t;
    ftPlace(t);
  }
  /* traffic advisory: one call per aircraft per 45 s, never on the ground or low down, never while paused */
  if(ta&&!s.ground&&info.agl>1000&&!FLY.paused&&FT.clock-(FT.ta[ta.id]||-99)>45){ FT.ta[ta.id]=FT.clock; try{ flyMsg("TRAFFIC",3); if(typeof ffSndWarn==="function") ffSndWarn("caution"); if(typeof ffSndSay==="function") ffSndSay("traffic"); }catch(e){} }
}
const ftTraffic=()=>FT.list;
/* radar symbols. ftSym draws in the current transform: size r, state st (0 other, 1 proximate, 2 advisory) */
function ftSym(g,r,st,lw){
  g.lineWidth=lw; g.strokeStyle=FT_COL[st]; g.fillStyle=FT_COL[st]; g.beginPath();
  if(st===2) g.arc(0,0,r*0.9,0,6.2832); else { g.moveTo(0,-r); g.lineTo(r*0.75,0); g.lineTo(0,r); g.lineTo(-r*0.75,0); g.closePath(); }
  if(st>0) g.fill(); else g.stroke();
}
const ftRel=t=>{ const n=Math.round(Math.abs(t.rel)); return (t.rel>=0?"+":"-")+(n<10?"0":"")+n+(Math.abs(t.vz)>2.5?(t.vz>0?"↑":"↓"):""); };
/* mini-map (p8h.js, north up): px / pz turn world x / z into canvas offsets from the aircraft */
function ftMapDraw(g,px,pz,k,range,s){
  const L=FT.list; if(!L.length) return; const lim=range*1000*k*1.05;
  for(const t of L){ const x=px(t.x), y=pz(t.z); if(Math.abs(x)>lim||Math.abs(y)>lim) continue;
    g.save(); g.translate(x,y); g.strokeStyle=FT_COL[t.st]; g.lineWidth=1; g.beginPath(); g.moveTo(0,0); g.lineTo(Math.sin(t.h)*9,-Math.cos(t.h)*9); g.stroke(); ftSym(g,4.2,t.st,1.2);
    g.font="700 9px sans-serif"; g.textAlign="left"; g.fillStyle=FT_COL[t.st]; g.fillText(ftRel(t),6,3); g.restore(); }
}
/* navigation display (x_fly_deck2.js, inside the rotated frame, 100 x 100 units): R = the radius of the display, hd = the heading used to rotate the frame */
function ftNdDraw(g,px,pz,k,boe,s,hd,R){
  const L=FT.list; if(!L.length) return;
  for(const t of L){ const x=px(t.x), y=pz(t.z); if(Math.hypot(x,y)>R+3) continue;
    g.save(); g.translate(x,y); g.rotate(hd); ftSym(g,2.5,t.st,0.55); if(typeof fdTx==="function") fdTx(g,ftRel(t),0,t.rel>=0?-4.6:5.2,3.4,FT_COL[t.st]); g.restore(); }
}
