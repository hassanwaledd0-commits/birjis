/* ---------- landing gear retraction (ff) ----------
   One gear value v drives everything (0 = down ... 1 = up; the flight sim sets GL.setAnim(id,1-gear), the atlas viewer uses the slider):
     doors open 0-15 %, the legs move 15-85 %, doors close 85-100 % (extension runs the same sequence backwards).
   ffGearPlan(B) runs at the end of prepAnim: it groups the meshes of each leg (same builder pivot `piv`), then searches a stowed pose that lies completely
   inside the fuselage / belly-fairing hull: the strut turns 90 deg (nose and body gear forward about x, wing gear inward about z), shortens by k, the bogie keeps its
   orientation and rides on the strut end, and the whole leg is shifted by D. It also adds two flush door panels per bay (ids of the leg, so part selection keeps working).
   Generic: any mesh whose id has ANIM t:"gear" and a builder pivot works (a 747 with 5 legs and 4-wheel bogies needs no change). Bogie-only parts other than
   `wheels` (axle beams) are tagged role:"bogie" in the builder; everything else of a leg is the strut. B.gear holds the plan (for tests); ffGearHidden(B) = fraction of stowed points inside the hull. */
const ffK=0.35, ffOpen=1.35, ffSq=Math.PI/2, ffO=[0,0,0], ffSolved={}; let ffQ=null, ffAX=null, ffAZ=null;   /* created lazily: the page must still load (flat fallback) when three.js is unavailable */
const ffSs=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
function ffRot(ax,phi,x,y,z,o){ const c=Math.cos(phi), s=Math.sin(phi); if(ax==="x"){ o[0]=x; o[1]=y*c-z*s; o[2]=y*s+z*c; } else { o[0]=x*c-y*s; o[1]=x*s+y*c; o[2]=z; } }
/* hull cross-sections at station X: fuselage ring and the belly fairing ring of p5f.js skinParts, as [zc,hw,hh] */
function ffRings(c,X){
  const r=ringAt(c,X), out=[[r.zc,r.hw,r.hh]];
  if(c.fairing&&X>=c.fairing[0]&&X<=c.fairing[1]){ const [x0,x1,dep]=c.fairing, t=(X-x0)/(x1-x0), b=Math.pow(Math.sin(Math.PI*Math.min(1,Math.max(0,t*1.08-0.04))),0.55), hh=Math.max(0.4,r.hh*0.42);
    out.push([r.zb+hh+0.06-(dep+0.06)*b,c.fw/2*(0.62+0.36*b),hh]); }
  return out;
}
function ffIn(c,x,y,z,m){
  const X=z+c.L/2; if(X<0.3||X>c.L-0.3) return false; const R=ffRings(c,X), q=(1-m)*(1-m);
  for(let i=0;i<R.length;i++){ const hw=R[i][1], hh=R[i][2]; if(hw<0.05||hh<0.05) continue; const a=x/hw, b=(y-R[i][0])/hh; if(a*a+b*b<=q) return true; }
  return false;
}
/* lowest hull surface point at lateral x, station X: [y, outward nx, ny] */
function ffSurf(c,x,X){
  const R=ffRings(c,X); let best=null;
  R.forEach(([zc,hw,hh])=>{ const xx=Math.max(-hw*0.96,Math.min(hw*0.96,x)), s=Math.sqrt(1-(xx/hw)*(xx/hw)), y=zc-hh*s;
    if(!best||y<best[0]){ let nx=xx/(hw*hw), ny=-s/hh; const l=Math.hypot(nx,ny)||1; best=[y,nx/l,ny/l]; } });
  return best;
}
/* door panel: a patch of the lower hull (stations Xa..Xb, lateral xa..xb), off by `off` m along the surface normal, in coordinates relative to the hinge H */
function ffDoorGeom(c,xa,xb,Xa,Xb,H,off){
  const nx=Math.max(3,Math.ceil((xb-xa)/0.22)), nz=Math.max(2,Math.ceil((Xb-Xa)/0.7)), pos=[], idx=[];
  for(let j=0;j<=nz;j++){ const X=Xa+(Xb-Xa)*j/nz; for(let i=0;i<=nx;i++){ const x=xa+(xb-xa)*i/nx, s=ffSurf(c,x,X); pos.push(x+s[1]*off-H[0],s[0]+s[2]*off-H[1],X-c.L/2-H[2]); } }
  for(let j=0;j<nz;j++) for(let i=0;i<nx;i++){ const a=j*(nx+1)+i, b=a+1, d=a+nx+1, e=d+1; idx.push(a,b,d,b,e,d); }
  const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
/* stowed transform of a leg: returns true when every sampled point is inside the hull */
function ffFits(c,L,k,dx,dy,dz,mg){
  const P=L.P, o=ffO; ffRot(L.ax,L.ang,0,-L.Hh*(1-k),0,o);
  const bx=dx+o[0], by=dy+o[1]+L.Hh, bz=dz+o[2];
  for(let i=0;i<L.bp.length;i++){ const p=L.bp[i]; if(!ffIn(c,P[0]+p[0]+bx,P[1]+p[1]+by,P[2]+p[2]+bz,mg)) return false; }
  for(let i=0;i<L.sp.length;i++){ const p=L.sp[i]; ffRot(L.ax,L.ang,p[0],p[1]*(1-k),p[2],o); if(!ffIn(c,P[0]+dx+o[0],P[1]+dy+o[1],P[2]+dz+o[2],mg)) return false; }
  return true;
}
function ffSolve(c,L){
  const side=L.P[0]>0?1:-1, ctr=Math.abs(L.P[0])<0.3;
  for(const k of [ffK,0.55,0.75]){
    let best=null, bc=1e9;
    for(const dz of [0,-0.4,0.4,-0.8,0.8,-1.2,1.2]) for(let dy=0;dy<=7;dy+=0.1){
      for(let dm=0;dm<=(ctr?0:Math.abs(L.P[0])+0.6);dm+=0.1){
        const cost=dm*dm+dy*dy+0.5*dz*dz; if(cost>=bc) continue;
        if(ffFits(c,L,k,-side*dm,dy,dz,0.06)){ best={k,dm,dy,dz}; bc=cost; break; } } }
    if(best) return best;
  }
  return {k:0.75,dm:Math.abs(L.P[0]),dy:7,dz:0};
}
function ffGearPlan(B){
  const c=B.c, G={}, legs=[], bb=new THREE.Box3(), bb2=new THREE.Box3();
  B.root.children.slice().forEach(m=>{
    const u=m.userData, an=u&&ANIM[u.id]; if(!m.isMesh||!u||u.child||!an||an.t!=="gear"||!u.P) return;
    const key=u.P.map(v=>v.toFixed(2)).join(","); let L=G[key]; if(!L){ L=G[key]={P:u.P.slice(),ms:[],sid:"gear_main",bp:[],sp:[]}; legs.push(L); }
    u.gl=L; u.gr=(u.id==="wheels"||u.role==="bogie")?"bogie":"strut"; if(u.gr==="strut"&&u.id!=="wheels") L.sid=u.id; L.ms.push(m);
  });
  legs.forEach((L,li)=>{
    L.idx=li; bb.makeEmpty(); bb2.makeEmpty(); let nS=0; L.ms.forEach(m=>{ const g=m.geometry; if(!g.boundingBox) g.computeBoundingBox(); if(m.userData.id==="wheels") bb2.union(g.boundingBox); if(m.userData.gr==="bogie") bb.union(g.boundingBox); else nS+=g.attributes.position.count; });
    if(bb2.isEmpty()) { L.ms.forEach(m=>{ m.userData.gl=null; }); return; }
    L.Hh=-(bb2.min.y+bb2.max.y)/2; const e=bb.min, f=bb.max;
    for(let i=0;i<8;i++) L.bp.push([i&1?f.x:e.x,i&2?f.y:e.y,i&4?f.z:e.z]);
    const st=Math.max(1,Math.floor(nS/150)); L.ms.forEach(m=>{ if(m.userData.gr!=="strut") return; const a=m.geometry.attributes.position.array; for(let i=0;i<a.length;i+=3*st) L.sp.push([a[i],a[i+1],a[i+2]]); });
    const X=L.P[2]+c.L/2; L.ax=Math.abs(L.P[0])<=hwAt(c,X)*0.95?"x":"z"; L.ang=L.ax==="x"?ffSq:-(L.P[0]>0?1:-1)*ffSq;
    const ck=B.key+"|"+L.ax+"|"+Math.abs(L.P[0]).toFixed(2)+","+L.P[1].toFixed(2)+","+L.P[2].toFixed(2), sv=ffSolved[ck]||(ffSolved[ck]=ffSolve(c,L)), sd=L.P[0]>0?1:-1;
    L.k=sv.k; L.D=[-sd*sv.dm,sv.dy,sv.dz]; L.dopen=ffOpen;
    ffRot(L.ax,L.ang,0,-L.Hh*(1-L.k),0,ffO); L.bt=[L.D[0]+ffO[0],L.D[1]+ffO[1]+L.Hh,L.D[2]+ffO[2]];      /* bogie translation at full retraction */
    ffDoors(B,L);
  });
  B.gear=legs;
}
/* two door panels per bay, hinged along z at the lateral edges of the bay, flush with the lower hull; belly livery colour via B.bellies */
function ffDoors(B,L){
  const c=B.c, P=L.P; let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  const add=(x,z)=>{ if(x<x0)x0=x; if(x>x1)x1=x; if(z<z0)z0=z; if(z>z1)z1=z; };
  L.bp.forEach(p=>{ add(P[0]+p[0],P[2]+p[2]); add(P[0]+p[0]+L.bt[0],P[2]+p[2]+L.bt[2]); });
  L.sp.forEach(p=>{ add(P[0]+p[0],P[2]+p[2]); ffRot(L.ax,L.ang,p[0],p[1]*(1-L.k),p[2],ffO); add(P[0]+L.D[0]+ffO[0],P[2]+L.D[2]+ffO[2]); });
  const Xa=Math.max(1,z0+c.L/2-0.2), Xb=Math.min(c.L-1,z1+c.L/2+0.2), lim=0.9*Math.min(ringAt(c,Xa).hw,ringAt(c,Xb).hw,ringAt(c,(Xa+Xb)/2).hw);
  let xa=Math.max(-lim,x0-0.15), xb=Math.min(lim,x1+0.15); if(xb-xa<0.5){ xa=Math.max(-lim,(xa+xb)/2-0.4); xb=Math.min(lim,xa+0.8); }
  const xm=(xa+xb)/2, mat=B.mat(L.sid,"skin","ext"), zm=(Xa+Xb)/2-c.L/2, off=0.012+0.005*(L.idx%3), mn=Math.min.apply(null,c.bot.map(p=>p[1])), mx=Math.max.apply(null,c.top.map(p=>p[1]));
  if(!mat.vertexColors){ mat.vertexColors=true; mat.polygonOffset=true; mat.polygonOffsetFactor=-2; mat.polygonOffsetUnits=-2; mat.needsUpdate=true; }
  L.doors=[];
  [[xa,xm,xa,1],[xm,xb,xb,-1]].forEach(([a,b,h,ds])=>{
    const H=[h,ffSurf(c,h,(Xa+Xb)/2)[0],zm], g=ffDoorGeom(c,a,b,Xa,Xb,H,off), pa=g.attributes.position, cn=pa.count, t=new Float32Array(cn);
    for(let i=0;i<cn;i++) t[i]=THREE.MathUtils.smoothstep((pa.getY(i)+H[1]-mn)/((mx-mn)||1),BELLY_T[0],BELLY_T[1]);
    g.setAttribute("color",new THREE.BufferAttribute(new Float32Array(cn*3).fill(1),3));
    const m=new THREE.Mesh(g,mat); m.userData={id:L.sid,layer:"ext",mirror:false,dir:EXP[L.sid]||[0,0,0],child:false,piv:H,hinge:null,nl:false,P:H,gr:"door",gl:L,ds};
    ["castShadow","receiveShadow"].forEach(k=>Object.defineProperty(m,k,{get:()=>false,set:()=>{}}));
    B.root.add(m); (B.byId[L.sid]=B.byId[L.sid]||[]).push(m); (B.bellies=B.bellies||[]).push({geom:g,mat,t,key:""}); L.doors.push(m); });
}
/* called by GL.moveParts for every mesh whose id has ANIM t:"gear": sets position / quaternion / scale from the gear value; returns false when the mesh has no plan */
function ffGearPose(m,u,getV,ox,oy,oz){
  const L=u.gl; if(!L||!L.D||!u.P) return false;
  if(!ffQ){ ffQ=new THREE.Quaternion(); ffAX=new THREE.Vector3(1,0,0); ffAZ=new THREE.Vector3(0,0,1); }
  const v=Math.max(getV(L.sid),getV("wheels")), e=ffSs((v-0.15)/0.7), P=u.P;
  if(u.gr==="door"){ const d=ffSs(v/0.15)*(1-ffSs((v-0.85)/0.15)); ffQ.setFromAxisAngle(ffAZ,-u.ds*L.dopen*d); m.quaternion.copy(ffQ); m.scale.set(1,1,1); m.position.set(P[0]+ox,P[1]+oy,P[2]+oz); return true; }
  if(u.gr==="bogie"){ m.quaternion.set(0,0,0,1); m.scale.set(1,1,1);
    if(e<=0){ m.position.set(P[0]+ox,P[1]+oy,P[2]+oz); return true; }
    const k=L.k*e; ffRot(L.ax,L.ang*e,0,-L.Hh*(1-k),0,ffO);
    m.position.set(P[0]+L.D[0]*e+ffO[0]+ox,P[1]+L.D[1]*e+ffO[1]+L.Hh+oy,P[2]+L.D[2]*e+ffO[2]+oz); return true; }
  m.quaternion.setFromAxisAngle(L.ax==="x"?ffAX:ffAZ,L.ang*e); m.scale.set(1,1-L.k*e,1);
  m.position.set(P[0]+L.D[0]*e+ox,P[1]+L.D[1]*e+oy,P[2]+L.D[2]*e+oz); return true;
}
/* fraction of the stowed (v=1) leg points inside the hull (1 = fully hidden); test helper */
function ffGearHidden(B){ let n=0,h=0; (B.gear||[]).forEach(L=>{ const P=L.P; L.sp.forEach(p=>{ ffRot(L.ax,L.ang,p[0],p[1]*(1-L.k),p[2],ffO); n++; if(ffIn(B.c,P[0]+L.D[0]+ffO[0],P[1]+L.D[1]+ffO[1],P[2]+L.D[2]+ffO[2],0)) h++; });
  L.bp.forEach(p=>{ n++; if(ffIn(B.c,P[0]+p[0]+L.bt[0],P[1]+p[1]+L.bt[1],P[2]+p[2]+L.bt[2],0)) h++; }); }); return n?h/n:1; }
