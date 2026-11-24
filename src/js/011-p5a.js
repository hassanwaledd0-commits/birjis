/* ---------- 3D: geometry helpers (world: x lateral, y up, z along fuselage, nose at -z) ---------- */
const HAS3D = (()=>{ try{ if(!window.THREE||!THREE.WebGLRenderer||!THREE.Raycaster||!THREE.Vector3) return false; const c=document.createElement("canvas"); return !!(c.getContext("webgl2")||c.getContext("webgl")); }catch(e){ return false; } })();
GEO.a380.th=[2.2,0.45]; GEO.a380.hth=[0.9,0.25]; GEO.a380.fth=[1.3,0.3];
GEO.b737.th=[0.55,0.10]; GEO.b737.hth=[0.5,0.15]; GEO.b737.fth=[0.7,0.18];
GEO.b737.chF=y=>{ const P=[[0.658,6.7],[5.3,4.29],[17.0,1.7]]; if(y<=P[0][0]) return P[0][1]; for(let i=1;i<P.length;i++){ if(y<=P[i][0]){ const a=P[i-1], b=P[i]; return a[1]+(b[1]-a[1])*(y-a[0])/(b[0]-a[0]); } } return P[P.length-1][1]; };   /* (v24) inboard trailing edge nearly straight, then the swept outboard one: chord at the root, at the engine station and at the tip */

function loftGeom(rings){
  const nr=rings.length, nc=rings[0].length, pos=[], idx=[];
  rings.forEach(r=>r.forEach(p=>pos.push(p.x,p.y,p.z)));
  for(let i=0;i<nr-1;i++) for(let j=0;j<nc;j++){
    const a=i*nc+j, b=i*nc+(j+1)%nc, c=(i+1)*nc+j, d=(i+1)*nc+(j+1)%nc; idx.push(a,b,c,b,d,c);
  }
  [0,nr-1].forEach(i=>{
    const ctr=new THREE.Vector3(); rings[i].forEach(p=>ctr.add(p)); ctr.multiplyScalar(1/nc);
    const ci=pos.length/3; pos.push(ctr.x,ctr.y,ctr.z);
    for(let j=0;j<nc;j++) idx.push(ci,i*nc+j,i*nc+(j+1)%nc);
  });
  const g=new THREE.BufferGeometry();
  g.setAttribute("position",new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
const sh = f => Math.sqrt(Math.max(f,0))*(1-f)/0.385;
const thk = (t,e) => Math.max(0.5*t+e, 0.012);

/* lifting surfaces: pt(u,f,k,e) -> point on top (k=1) / bottom (k=-1) skin, e = offset outward */
function wingLS(c){
  const a=c.fw/2, Y0=a*0.35, tan=Math.tan(c.sw*Math.PI/180), V=THREE.Vector3;
  const Y=u=>Y0+u*(c.tipY-Y0), LE=u=>c.wle+(Y(u)-Y0)*tan, CH=u=>c.chF?c.chF(Y(u)):c.rc+(c.tc-c.rc)*u;   /* c.chF(y): optional piecewise chord (747 inboard trailing-edge kink) */
  const zc=u=>c.wz[0]+(c.wz[1]-c.wz[0])*u, tk=u=>c.th[0]+(c.th[1]-c.th[0])*u;
  return {Y0,Y,LE,CH,zc,tk, pt:(u,f,k,e=0)=>new V(Y(u), zc(u)+k*thk(tk(u)*sh(f),e), LE(u)+f*CH(u)-c.L/2)};
}
function htpLS(c){
  const V=THREE.Vector3, tan=Math.tan(c.hsw*Math.PI/180), y0=c.hy0!==undefined?c.hy0:0.8, dh=Math.tan((c.hdih||0)*Math.PI/180);
  const Y=u=>y0+u*(c.hY-y0), LE=u=>c.hLE+(Y(u)-y0)*tan, CH=u=>c.hrc+(c.htc-c.hrc)*u, tk=u=>c.hth[0]+(c.hth[1]-c.hth[0])*u;
  return {Y,LE,CH,tk, pt:(u,f,k,e=0)=>new V(Y(u), c.htZ+(Y(u)-y0)*dh+k*thk(tk(u)*sh(f),e), LE(u)+f*CH(u)-c.L/2)};
}
function finLS(c){
  /* the root runs along the fuselage top line (so there is no gap over the tail cone); u = 0 root .. 1 tip */
  const V=THREE.Vector3, p=c.fin, zt=p[1][1];
  const LE=u=>p[0][0]+(p[1][0]-p[0][0])*u, TE=u=>p[3][0]+(p[2][0]-p[3][0])*u, tk=u=>c.fth[0]+(c.fth[1]-c.fth[0])*u;
  return {pt:(u,f,k,e=0)=>{ const X=LE(u)+f*(TE(u)-LE(u)), X0=LE(0)+f*(TE(0)-LE(0)), zr=interp(c.top,X0)-0.35;
    return new V(k*thk(tk(u)*sh(f),e), zr+u*(zt-zr), X-c.L/2); }};
}
function winletLS(c,ls){
  const V=THREE.Vector3, L0=ls.LE(1), c0=c.tc, z0=ls.zc(1);
  const lerp=(a,b,u)=>a+(b-a)*u;
  return {pt:(u,f,k,e=0)=>{ const le=lerp(L0,L0+1.6,u), ch=lerp(c0,0.8,u);
    return new V(lerp(c.tipY,c.tipEnd,u)+k*thk(0.16*sh(f),e), lerp(z0,z0+2.4,u), le+f*ch-c.L/2); }};
}
function lsRegion(ls,u0,u1,f0,f1,e=0,nu=10,nf=14){
  const rings=[];
  for(let i=0;i<=nu;i++){
    const u=u0+(u1-u0)*i/nu, ring=[];
    const fj=j=>f0+(f1-f0)*(1-Math.cos(Math.PI*j/nf))/2;   /* cosine spacing: round leading edge, sharp trailing edge */
    for(let j=0;j<=nf;j++) ring.push(ls.pt(u,fj(j),1,e));
    for(let j=nf;j>=0;j--) ring.push(ls.pt(u,fj(j),-1,e));
    rings.push(ring);
  }
  return loftGeom(rings);
}

/* fuselage: elliptical rings from plan half-width and side-view contours */
function hwAt(c,X){
  const a=c.fw/2;
  if(c.hwT) return interp(c.hwT,X);   /* (v24) measured half-width table (the 737) */
  if(X<=c.nose){ const t=(c.nose-X)/c.nose, e=c.nosP||2; return a*Math.pow(Math.max(0,1-Math.pow(t,e)),1/e); }   /* c.nosP < 2: more pointed nose in plan */
  if(X>=c.tail){ const t=(X-c.tail)/(c.L-c.tail); return a*(1-0.86*Math.pow(t,1.5)); }
  return a;
}
/* A380 double bubble: the upper deck is narrower than the main deck. secK = half-width factor at sin(angle) s (s = -1 belly .. 1 crown); c.sec = [narrowing, start s] (only the A380 has it) */
function secK(c,s,X){ if(c.secF&&X!==undefined) return c.secF(s,X); const q=c.sec; if(!q||s<=q[1]) return 1; const t=Math.min(1,(s-q[1])/(1-q[1])); return 1-q[0]*t*t*(3-2*t); }
function ringAt(c,X){
  const zt=interp(c.top,X), zb=interp(c.bot,X);
  return {hw:hwAt(c,X), zc:(zt+zb)/2, hh:(zt-zb)/2, zt, zb};
}
function fuseGeom(c,X0,X1){
  const rings=[], n=Math.max(3,Math.round((X1-X0)/c.L*150)), m=64;
  for(let i=0;i<=n;i++){
    const X=X0+(X1-X0)*i/n, r=ringAt(c,X), ring=[];
    for(let j=0;j<m;j++){ const th=j/m*Math.PI*2; ring.push(new THREE.Vector3(r.hw*Math.cos(th)*secK(c,Math.sin(th),X), r.zc+r.hh*Math.sin(th), X-c.L/2)); }
    rings.push(ring);
  }
  return loftGeom(rings);
}
/* point on the fuselage side surface at station X and height z (right side) */
function sidePoint(c,X,z){
  const r=ringAt(c,X), s=Math.max(-0.97,Math.min(0.97,(z-r.zc)/Math.max(r.hh,0.01)));
  return new THREE.Vector3(r.hw*Math.sqrt(1-s*s)*secK(c,s,X), z, X-c.L/2);
}
function barBetween(p0,p1,r,seg=6){
  const dir=new THREE.Vector3().subVectors(p1,p0), len=dir.length();
  const g=new THREE.CylinderGeometry(r,r,len,seg,1);
  g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize())));
  const mid=new THREE.Vector3().addVectors(p0,p1).multiplyScalar(0.5); g.translate(mid.x,mid.y,mid.z);
  return g;
}
