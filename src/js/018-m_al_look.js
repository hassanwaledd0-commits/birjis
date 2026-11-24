/* ---------- A380 look pack (prefix al): double-bubble section, tapered cheat-line, livery tail swoosh and engine rings, tip fences, rounded tailplane tips, small details.
   Everything here is called from buildAircraft (p5b2.js) behind `key==="a380"` and (for the heavy extras) `!lod`, so the 737 / 747 and the neighbour LOD stay as they were.
   Nothing here touches part ids, ANIM or physics: every piece is added to an existing part id through put(). ---------- */
GEO.a380.sec=[0.18,-0.08];                    /* upper deck 18 % narrower than the main deck at the crown (secK in p5a.js) */
Object.assign(SPEC,{
  tail2:{c:"#6FB3EA",r:.33,m:.1}, acc:{c:"#C8D3DE",r:.3,m:.15}, ering:{c:"#1F5AA0",r:.32,m:.15}, lipm:{c:"#C9CFD5",r:.24,m:.9}, alk:{c:"#1A2028",r:.55,m:.2}
});
const AL_GLOSS=["skin","wing","door","tail","stripe","tail2","acc","ering"];
const alSS=(a,b,x)=>{ const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); };
/* a geometry plus its mirror image across x = 0 in ONE mesh (one draw call for both sides) */
function alBoth(g){ return mergeG([g,bakeMirror(g.clone())]); }
/* a flat disc / oval lying on the fuselage skin (right side), centre X,z, half sizes rx (along) and rz (up) */
function alDisc(c,X,z,rx,rz,off,seg){
  seg=seg||10; const pos=[], idx=[], p0=skinPt(c,X,z,off); pos.push(p0.x,p0.y,p0.z);
  for(let j=0;j<seg;j++){ const t=j/seg*Math.PI*2, p=skinPt(c,X+Math.cos(t)*rx,z+Math.sin(t)*rz,off); pos.push(p.x,p.y,p.z); idx.push(0,1+j,1+(j+1)%seg); }
  const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
/* ---- cheat-line: a tapered main stripe with a thin accent line under it; it starts as a point behind the cockpit, runs under the windows and sweeps up the tail cone ---- */
function alSideBands(B,put,lod){
  const c=B.c, zWin=c.win[0][2], Xs=c.fd+1.5, Xe=c.L-3.2, Xk=50, z0=zWin-0.8, wte=c.wle+c.rc;
  const zAt=(X,zb)=>{ const r=ringAt(c,X); if(X<=Xk) return zb;
    const rk=ringAt(c,Xk), sK=(zb-rk.zc)/rk.hh, tg=-0.62+(zb-z0)/Math.max(r.hh,0.3)+0.55*alSS(62,Xe,X), s=sK+(tg-sK)*alSS(Xk,Xk+8,X);
    return r.zc+s*r.hh; };
  const wf=X=>alSS(Xs,Xs+9,X)*(1-alSS(Xe-9,Xe,X));
  const band=(zb,half,mk,X0,X1,id)=>{ const n=Math.max(4,Math.ceil((X1-X0)/1.0));
    put(id,alBoth(sideBand(c,X0,X1,X=>zAt(X,zb)-Math.max(half(X),0.004),X=>zAt(X,zb)+Math.max(half(X),0.004),n,0.03)),{mk}); };
  [[Xs,c.wle,"fuse_fwd"],[c.wle,wte,"fuse_mid"],[wte,Xe,"fuse_aft"]].forEach(([X0,X1,id])=>{ if(X1-X0<0.2) return;   /* v19: one piece per section (exploding left a piece in the gap) */
    band(z0,X=>0.21*wf(X),"stripe",X0,X1,id);
    if(!lod) band(z0-0.3,X=>0.034*wf(X),"acc",X0,X1,id); });
}
/* ---- fin swoosh: a curved band of the second livery colour plus a thin accent line, on the fixed fin only (the rudder keeps the base colour so it can move) ---- */
function alFinBands(c,F,put){
  const nt=22, e=0.045, V=THREE.Vector3, sw=(t,p)=>Math.pow(Math.max(0,Math.sin(Math.PI*t)),p);
  const strip=(fn)=>{ const gs=[]; [1,-1].forEach(k=>{ const pos=[], idx=[];
    for(let i=0;i<=nt;i++){ const [f,u0,u1]=fn(i/nt); [u0,u1].forEach(u=>{ const p=F.pt(Math.max(0.01,Math.min(0.99,u)),f,k,e); pos.push(p.x,p.y,p.z); }); }
    for(let i=0;i<nt;i++){ const a=i*2; if(k>0) idx.push(a,a+2,a+1,a+1,a+2,a+3); else idx.push(a,a+1,a+2,a+1,a+3,a+2); }
    const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals(); gs.push(g); });
    return mergeG(gs); };
  const cu=t=>0.1+0.5*Math.pow(t,1.35), cf=t=>0.03+0.64*t, hu=t=>0.1*sw(t,0.75)+0.002;
  put("fin",strip(t=>[cf(t),cu(t)-hu(t),cu(t)+hu(t)]),{mk:"tail2"});
  put("fin",strip(t=>[cf(t),cu(t)-hu(t)-0.085-0.01*sw(t,0.5),cu(t)-hu(t)-0.06+0.01*sw(t,0.5)]),{mk:"acc"});
}
/* ---- rounded tip for a lifting surface: extra stations beyond u = 1 whose chord and thickness close up elliptically ---- */
function alRoundLS(ls,du){
  return Object.assign({},ls,{pt:(u,f,k,e=0)=>{ if(u<=1) return ls.pt(u,f,k,e);
    const t=Math.min(1,(u-1)/du), cs=Math.sqrt(Math.max(0,1-t*t)), ff=0.5+(f-0.5)*cs, p=ls.pt(u,ff,k,e), q=ls.pt(u,ff,0,0); p.y=q.y+(p.y-q.y)*cs; return p; }});
}
/* lsRegion with an explicit list of stations (used for the rounded tailplane) */
function alRegion(ls,us,f0,f1,e,nf){
  const rings=[], fj=j=>f0+(f1-f0)*(1-Math.cos(Math.PI*j/nf))/2;
  us.forEach(u=>{ const ring=[]; for(let j=0;j<=nf;j++) ring.push(ls.pt(u,fj(j),1,e)); for(let j=nf;j>=0;j--) ring.push(ls.pt(u,fj(j),-1,e)); rings.push(ring); });
  return loftGeom(rings);
}
const alTipUs=(n,du)=>{ const a=[]; for(let i=0;i<n;i++) a.push(i/n); [0.5,0.8,0.94,1].forEach(t=>a.push(1+du*t)); return a; };
/* ---- per-engine extras collected in the engine loop and merged afterwards (one mesh each for all four nacelles) ---- */
function alEngine(AL,o){
  const {Ye,zc,z0,R,Ln,nacR}=o, pts=[];
  for(let k=0;k<=3;k++){ const t=0.05+0.07*k/3; pts.push(new THREE.Vector2(nacR(t)*R*1.007,t*Ln)); }
  AL.ring.push(new THREE.LatheGeometry(pts,28).rotateX(Math.PI/2).translate(Ye,zc,z0));
}
function alEngineDone(B,put,AL){
  if(AL.ring.length) put("eng_inlet",alBoth(mergeG(AL.ring)),{mk:"ering"});
}
/* ---- wing tip fence below the winglet, small dark and light details on the skin ---- */
function alFences(B,put,W){
  const c=B.c, V=THREE.Vector3, lerp=(a,b,u)=>a+(b-a)*u;
  const WF={pt:(u,f,k,e=0)=>{ const le=lerp(W.LE(1),W.LE(1)+0.7,u), ch=lerp(c.tc,0.6,u); return new V(lerp(c.tipY,c.tipY+0.25,u)+k*thk(0.15*sh(f),e), lerp(W.zc(1),W.zc(1)-1.1,u), le+f*ch-c.L/2); }};
  put("wingtip",alBoth(lsRegion(WF,0,1,0,1,0,5,8)),{mk:"tip"});
}
function alDetails(B,put,W){
  const c=B.c, V=THREE.Vector3, dk=[], lt=[], X0=c.fd, wk=[];
  /* static ports and ice-detector lights, fuselage nose (dark ovals), angle-of-attack vanes (light) */
  [[X0-2.6,c.win[0][2]-1.25,0.2,0.1],[X0-2.6,c.win[0][2]-1.6,0.2,0.1]].forEach(([X,z,rx,rz])=>dk.push(alDisc(c,X,z,rx,rz,0.016,10)));
  [[X0-5.2,c.win[0][2]+0.35]].forEach(([X,z])=>{ lt.push(alDisc(c,X,z,0.22,0.1,0.02,8)); });
  /* landing light recesses at the wing root leading edge, taxi light on the nose gear bay (dark ovals) */
  { const p=W.pt(0.1,0.03,-1,0.02), q=W.pt(0.2,0.03,-1,0.02); [p,q].forEach(s=>dk.push(new THREE.SphereGeometry(1,8,5).scale(0.22,0.03,0.4).translate(s.x,s.y-0.01,s.z))); }
  /* tail cone: APU exhaust, a dark oval at the very end of the fuselage */
  { const r=ringAt(c,c.L-0.9), rr=Math.min(r.hh,r.hw)*0.55; wk.push(new THREE.CylinderGeometry(rr,rr*0.9,0.9,14).rotateX(Math.PI/2).translate(0,r.zc,c.L-0.45-c.L/2)); }
  /* thin dark seam ring where the radome meets the nose section */
  { const X=c.rad+0.02, n=64, pos=[], idx=[]; for(let j=0;j<=n;j++){ const t=j/n*Math.PI*2, r=ringAt(c,X); for(const w of [-0.007,0.007]){ const Xs=X+w, q=ringAt(c,Xs), k=secK(c,Math.sin(t)); pos.push(q.hw*Math.cos(t)*k*1.003,q.zc+q.hh*Math.sin(t)*1.003,Xs-c.L/2); } }
    for(let j=0;j<n;j++){ const a=j*2; idx.push(a,a+1,a+2,a+1,a+3,a+2); }
    const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals(); put("radome",g,{mk:"alk",nl:true}); }
  if(dk.length) put("fuse_fwd",alBoth(mergeG(dk)),{mk:"alk",nl:true});
  if(lt.length) put("fuse_fwd",alBoth(mergeG(lt)),{mk:"ant",nl:true});
  if(wk.length) put("fuse_aft",mergeG(wk),{mk:"exh",nl:true});
}
/* polygon offset for the thin livery layers so they never z-fight with the skin below them */
function alMats(B){
  ["tail2","acc","ering","alk"].forEach(mk=>{ for(const k in B.cache){ const m=B.cache[k]; if(m.userData.mk===mk){ m.polygonOffset=true; m.polygonOffsetFactor=-2; m.polygonOffsetUnits=-2; } } });
}
