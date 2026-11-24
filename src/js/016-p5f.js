/* ---------- 3D skin detail v3: conformal doors (with their own opening motion), painted window bands,
   windscreen panes, belly fairing. Door stations follow the manufacturers' airport-planning documents. ---------- */
const BELLY_T=[0.17,0.29];   /* belly colour ends just under the cheatline, below the windows and doors */
SPEC.wtex={c:"#FFFFFF",r:.12,m:.35}; SPEC.seam={c:"#0E1318",r:.7,m:0}; SPEC.rudder=SPEC.tail;
/* door list: X station from the nose, z centre height, w x h, deck, which side, how it opens, window in the door */
GEO.a380.doorList=[
  ...[6.32,20.94,32.68,44.74,53.63].map((X,i)=>({X,z:6.2,w:1.07,h:1.93,deck:"main",side:"both",kind:"slide",win:true,n:"M"+(i+1)})),
  ...[16.5,40.3,49.19].map((X,i)=>({X,z:9.35,w:1.07,h:1.9,deck:"upper",side:"both",kind:"slide",win:true,n:"U"+(i+1)})),
  {X:11.73,z:4.6,w:2.8,h:1.75,deck:"cargo",side:"R",kind:"hatch",n:"FWD CARGO"},
  {X:48.07,z:4.75,w:2.8,h:1.75,deck:"cargo",side:"R",kind:"hatch",n:"AFT CARGO"},
  {X:51.09,z:4.95,w:0.95,h:1.1,deck:"cargo",side:"R",kind:"hatch",n:"BULK"}];
GEO.b737.doorList=[
  {X:5.0,z:3.45,w:0.86,h:1.83,deck:"main",side:"both",kind:"swing",win:true,n:"1"},
  {X:33.3,z:3.45,w:0.86,h:1.83,deck:"main",side:"both",kind:"swing",win:true,n:"2"},
  {X:16.15,z:3.52,w:0.51,h:0.97,deck:"main",side:"both",kind:"hatch",win:true,exitWin:true,n:"EXIT 1"},
  {X:17.05,z:3.52,w:0.51,h:0.97,deck:"main",side:"both",kind:"hatch",win:true,exitWin:true,n:"EXIT 2"},
  {X:9.4,z:2.05,w:1.22,h:0.89,deck:"cargo",side:"R",kind:"hatch",n:"FWD CARGO"},
  {X:26.0,z:2.1,w:1.22,h:0.84,deck:"cargo",side:"R",kind:"hatch",n:"AFT CARGO"}];
/* cabin window rows: X from, X to, centre height; window size and frame pitch */
GEO.a380.winRows=[{x0:8.2,x1:61,z:6.65,deck:"main"},{x0:13.2,x1:54.8,z:9.75,deck:"upper"}]; GEO.a380.winSz={w:0.27,h:0.38,pitch:0.6,band:0.6};
GEO.b737.winRows=[{x0:6.0,x1:32.2,z:3.6,deck:"main"}]; GEO.b737.winSz={w:0.25,h:0.35,pitch:0.508,band:0.5};
/* windscreen panes (right side, mirrored): m "f" = outline in front view (x lateral, y height), "s" = in side view (X from the nose tip, z height), "r" = on the fuselage rings (X, angle in degrees from the side line upwards);
   q = corners in cyclic order, r = corner radius, fw = frame width, post = solid centre post out to the pane's inner edge, brow = fill-only dark paint polygons.
   wsFront / wsSide keep the old simple quads (the neighbouring stands build their small copies from them). */
GEO.a380.wsFront=[[0.07,7.5],[1.28,7.62],[1.22,8.38],[0.07,8.48]];
GEO.a380.wsSide=[[[3.95,7.5],[4.95,7.46],[4.88,8.36],[4.05,8.46]],[[5.07,7.46],[5.78,7.5],[5.78,8.16],[5.07,8.3]]];
GEO.b737.wsFront=[[0.05,3.98],[0.84,4.08],[0.8,4.46],[0.05,4.6]];
GEO.b737.wsSide=[[[3.0,4.0],[3.98,4.02],[3.98,4.5],[3.55,4.4]],[[4.1,4.04],[4.5,4.08],[4.5,4.42],[4.1,4.5]]];
GEO.a380.fairing=[15.2,41.2,0.55]; GEO.b737.fairing=[12.8,24.2,0.3];
GEO.a380.dorsal=[49.5,56.2,1.7]; GEO.b737.dorsal=[28.4,31.6,1.0];
GEO.a380.hdih=4; GEO.b737.hdih=6.6;
/* A380: more faithful nose (lower, blunter radome, higher cockpit "forehead") and fin planform; 737 fin */
GEO.a380.top=[[0,5.7],[0.5,6.5],[1.5,7.35],[2.6,7.95],[3.8,8.6],[5.2,9.5],[7,10.45],[9.5,11.25],[12,11.65],[14,11.7],[52,11.7],[62,11],[72.7,9]];
GEO.a380.bot=[[0,5.7],[0.8,4.55],[2.2,3.85],[4.5,3.4],[8,3.2],[44,3.2],[60,4.6],[72.7,8.2]];
GEO.a380.fin=[[55.7,11.6],[67.1,24.1],[72.4,24.1],[65.8,9.6]]; GEO.a380.htZ=8.5;   /* (v36) fin planform from the reference: LE swept ~42°, TE raked aft with height */
GEO.a380.win=[[8.2,61,6.65],[13.2,54.8,9.75]]; GEO.a380.doors=[6.32,20.94,32.68,44.74,53.63];
GEO.b737.doors=[5.0,33.3];

/* point on the fuselage skin at station X, height z (right side), pushed out along the surface normal */
function skinPt(c,X,z,off){
  const r=ringAt(c,X), s=Math.max(-0.995,Math.min(0.995,(z-r.zc)/Math.max(r.hh,0.01))), co=Math.sqrt(1-s*s);
  const k=secK(c,s,X);
  if(c.secF&&off){ /* hump section: the skin normal from the slope of the width profile */ const d=0.01, k2=secK(c,Math.min(1,s+d),X), k1=secK(c,Math.max(-1,s-d),X), dx=(r.hw*Math.sqrt(1-Math.pow(Math.min(1,s+d),2))*k2-r.hw*Math.sqrt(1-Math.pow(Math.max(-1,s-d),2))*k1)/(2*d), nl=Math.hypot(r.hh,dx)||1;
    return new THREE.Vector3(r.hw*co*k+off*r.hh/nl, r.zc+r.hh*s-off*dx/nl, X-c.L/2); }
  const nx=co/Math.max(r.hw*k,0.01), ny=s/Math.max(r.hh,0.01), nl=Math.hypot(nx,ny)||1;
  return new THREE.Vector3(r.hw*co*k+off*nx/nl, r.zc+r.hh*s+off*ny/nl, X-c.L/2);
}
/* point on the nose seen from straight ahead at lateral x and height y */
function nosePt(c,x,y,off){
  const F=(xx,yy,XX)=>{ const q=ringAt(c,XX), sv=(yy-q.zc)/Math.max(q.hh,1e-3); return (xx/Math.max(q.hw*secK(c,sv,XX),1e-3))**2+sv**2-1; };
  let lo=0, hi=c.nose*1.5;
  for(let i=0;i<34;i++){ const m=(lo+hi)/2; if(F(x,y,m)<=0) hi=m; else lo=m; }
  const X=hi, e=0.02, gx=(F(x+e,y,X)-F(x-e,y,X))/(2*e), gy=(F(x,y+e,X)-F(x,y-e,X))/(2*e), gz=(F(x,y,X+e)-F(x,y,X-e))/(2*e), gl=Math.hypot(gx,gy,gz)||1;
  return new THREE.Vector3(x+off*gx/gl, y+off*gy/gl, X-c.L/2+off*gz/gl);
}
function gridGeom(nu,nv,fn,uv){
  const pos=[], idx=[], tex=[];
  for(let j=0;j<=nv;j++) for(let i=0;i<=nu;i++){ const p=fn(i/nu,j/nv); pos.push(p.x,p.y,p.z); if(uv){ const t=uv(i/nu,j/nv); tex.push(t[0],t[1]); } }
  for(let j=0;j<nv;j++) for(let i=0;i<nu;i++){ const a=j*(nu+1)+i, b=a+1, cc=a+nu+1, d=cc+1; idx.push(a,cc,b, b,cc,d); }   /* wound so normals face outwards (shadow normal-bias needs it) */
  const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));
  if(uv) g.setAttribute("uv",new THREE.Float32BufferAttribute(tex,2));
  g.setIndex(idx); g.computeVertexNormals(); return g;
}
const bilin=(Q,u,v)=>[(1-u)*(1-v)*Q[0][0]+u*(1-v)*Q[1][0]+u*v*Q[2][0]+(1-u)*v*Q[3][0], (1-u)*(1-v)*Q[0][1]+u*(1-v)*Q[1][1]+u*v*Q[2][1]+(1-u)*v*Q[3][1]];
/* rounded-rectangle (superellipse) patch on the skin, centred at X,z; sizes w x h; pivot subtracted */
function sePatch(c,X0,z0,w,h,off,P,n=7){
  const S=40, R=4, pos=[], idx=[], pv=P||[0,0,0];
  const at=(lx,ly)=>{ const p=skinPt(c,X0+lx,z0+ly,off); pos.push(p.x-pv[0],p.y-pv[1],p.z-pv[2]); };
  at(0,0);
  for(let k=1;k<=R;k++){ const rho=k/R; for(let j=0;j<S;j++){ const t=j/S*Math.PI*2, cx=Math.cos(t), sy=Math.sin(t);
    at(Math.sign(cx)*Math.pow(Math.abs(cx),2/n)*w/2*rho, Math.sign(sy)*Math.pow(Math.abs(sy),2/n)*h/2*rho); } }
  for(let j=0;j<S;j++) idx.push(0,1+(j+1)%S,1+j);
  for(let k=1;k<R;k++) for(let j=0;j<S;j++){ const a=1+(k-1)*S+j, b=1+(k-1)*S+(j+1)%S, cc=1+k*S+j, d=1+k*S+(j+1)%S; idx.push(a,b,cc, b,d,cc); }
  const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
function mirrorX(g){ return bakeMirror(g.clone()); }
/* window tile: one rounded window per frame pitch, drawn on a canvas and repeated along the band */
function winTexture(sz){
  const W=128, H=128, cv=document.createElement("canvas"); cv.width=W; cv.height=H; const g=cv.getContext("2d");
  const ww=sz.w/sz.pitch*W, wh=sz.h/sz.band*H, x=(W-ww)/2, y=(H-wh)/2, rx=ww*0.42, ry=Math.min(wh*0.32,rx*sz.pitch/sz.band*H/W*1.0+wh*0.12);
  const path=(x,y,w,h,rx,ry)=>{ g.beginPath(); g.moveTo(x+rx,y); g.lineTo(x+w-rx,y); g.ellipse(x+w-rx,y+ry,rx,ry,0,-Math.PI/2,0); g.lineTo(x+w,y+h-ry);
    g.ellipse(x+w-rx,y+h-ry,rx,ry,0,0,Math.PI/2); g.lineTo(x+rx,y+h); g.ellipse(x+rx,y+h-ry,rx,ry,0,Math.PI/2,Math.PI); g.lineTo(x,y+ry); g.ellipse(x+rx,y+ry,rx,ry,0,Math.PI,Math.PI*1.5); g.closePath(); };
  g.clearRect(0,0,W,H);
  path(x-4,y-4,ww+8,wh+8,rx+4,ry+4); g.fillStyle="#7F8B97"; g.fill();               /* rubber seal / frame (dark gasket) */
  path(x-1.5,y-1.5,ww+3,wh+3,rx+1.5,ry+1.5); g.lineWidth=1.2; g.strokeStyle="rgba(255,255,255,0.35)"; g.stroke();
  path(x,y,ww,wh,rx,ry); const gr=g.createLinearGradient(0,y,0,y+wh); gr.addColorStop(0,"#456078"); gr.addColorStop(0.4,"#13202B"); gr.addColorStop(1,"#26394A"); g.fillStyle=gr; g.fill();
  g.save(); path(x,y,ww,wh,rx,ry); g.clip(); g.fillStyle="rgba(255,255,255,0.22)"; g.beginPath(); g.ellipse(x+ww*0.28,y+wh*0.22,ww*0.5,wh*0.18,-0.5,0,Math.PI*2); g.fill(); g.restore();
  const t=new THREE.CanvasTexture(cv); t.encoding=THREE.sRGBEncoding; t.wrapS=THREE.RepeatWrapping; t.wrapT=THREE.ClampToEdgeWrapping; t.anisotropy=4; return t;
}
function addSkin(B){
  const c=B.c, L=c.L, sz=c.winSz, secs=["radome","flightdeck","fuse_fwd","fuse_mid","fuse_aft"].map(id=>B.byId[id].find(m=>m.material.userData.mk==="skin"||m.material.vertexColors)).filter(Boolean);
  secs.forEach(m=>m.geometry.computeBoundingBox());
  const secAt=X=>{ const z=X-L/2; let best=secs[secs.length-1]; secs.forEach(m=>{ m.geometry.computeBoundingBox(); const bb=m.geometry.boundingBox; if(z>=bb.min.z&&z<bb.max.z) best=m; }); return best; };
  const skinMat=B.mat("doors","skin","ext"), seamMat=B.mat("doors","seam","ext"), dglass=B.mat("doors","glass","ext");
  skinMat.polygonOffset=true; skinMat.polygonOffsetFactor=-1; skinMat.polygonOffsetUnits=-2;
  skinMat.vertexColors=true; skinMat.needsUpdate=true;
  const wmat=B.mat("windows","wtex","ext"); wmat.map=winTexture(sz); wmat.alphaTest=0.5; wmat.polygonOffset=true; wmat.polygonOffsetFactor=-1; wmat.polygonOffsetUnits=-2; wmat.needsUpdate=true;
  B.doorList=[];
  const child=(parent,geom,mat,id,extra)=>{ const m=new THREE.Mesh(geom,mat); m.userData=Object.assign({id,layer:"ext",mirror:false,dir:[0,0,0],child:true},extra||{}); parent.add(m); (B.byId[id]=B.byId[id]||[]).push(m); return m; };
  const bellyT=(sec,g)=>{ sec.geometry.computeBoundingBox(); const bb=sec.geometry.boundingBox, P=g.attributes.position, n=P.count, t=new Float32Array(n), base=g.userData.base||[0,0,0];
    const painted=(B.bellies||[]).some(e=>e.geom===sec.geometry);
    for(let i=0;i<n;i++) t[i]=painted?THREE.MathUtils.smoothstep(((P.getY(i)+base[1])-bb.min.y)/((bb.max.y-bb.min.y)||1),BELLY_T[0],BELLY_T[1]):1;
    g.setAttribute("color",new THREE.BufferAttribute(new Float32Array(n*3).fill(1),3)); (B.bellies=B.bellies||[]).push({geom:g,mat:skinMat,t,key:""}); };
  /* doors */
  c.doorList.forEach(d=>{
    const sec=secAt(d.X), sides=d.side==="both"?[1,-1]:[1];
    /* the opening (dark gap ring + interior) stays on the fuselage */
    const gap=sePatch(c,d.X,d.z,d.w+0.07,d.h+0.07,0.012);
    /* pivot: slide = centre, swing = forward edge (vertical hinge), hatch = top edge (longitudinal hinge) */
    const pv=d.kind==="swing"?skinPt(c,d.X-d.w/2,d.z,0.032):d.kind==="hatch"?skinPt(c,d.X,d.z+d.h/2,0.032):skinPt(c,d.X,d.z,0.032);
    const P=[pv.x,pv.y,pv.z];
    const door=sePatch(c,d.X,d.z,d.w,d.h,0.032,P); door.userData.base=P;
    const wwin=d.win?(d.exitWin?sePatch(c,d.X,d.z+d.h*0.12,c.winSz.w,c.winSz.h,0.038,P):sePatch(c,d.X,d.z+d.h*0.24,d.w*0.26,d.h*0.17,0.038,P)):null;
    sides.forEach(sg=>{
      child(sec,sg>0?gap:mirrorX(gap),seamMat,"doors");
      const g=sg>0?door:(()=>{ const m=mirrorX(door); m.userData={base:[-P[0],P[1],P[2]]}; return m; })();
      bellyT(sec,g);
      const dm=child(sec,g,skinMat,"doors",{door:true});
      dm.position.set(P[0]*sg,P[1],P[2]);
      if(wwin) child(dm,sg>0?wwin:mirrorX(wwin),dglass,"doors");
      B.doorList.push({mesh:dm,kind:d.kind,sg,w:d.w,P:[P[0]*sg,P[1],P[2]]});
    });
  });
  /* windows: rows broken at the doors on the same deck */
  c.winRows.forEach(row=>{
    const blocks=c.doorList.filter(d=>d.side==="both"&&(d.deck===row.deck||Math.abs(d.z-row.z)<d.h/2+0.3)).map(d=>[d.X-d.w/2-0.28,d.X+d.w/2+0.28]);
    const xs=[]; for(let X=row.x0;X<=row.x1;X+=sz.pitch){ if(!blocks.some(b=>X>b[0]&&X<b[1])) xs.push(X); }
    const runs=[]; xs.forEach(X=>{ const r=runs[runs.length-1]; if(r&&Math.abs(X-r[r.length-1]-sz.pitch)<1e-3) r.push(X); else runs.push([X]); });
    runs.forEach(r=>{
      const xa=r[0]-sz.pitch/2, n=r.length, xb=xa+n*sz.pitch, zb0=row.z-sz.band/2;
      /* split each run at section boundaries so every piece is a child of its own fuselage section */
      const cuts=[xa]; secs.forEach(m=>{ const bb=m.geometry.boundingBox, b=bb.max.z+L/2; if(b>xa&&b<xb) cuts.push(b); }); cuts.push(xb); cuts.sort((p,q)=>p-q);
      for(let k=0;k<cuts.length-1;k++){ const a=cuts[k], b=cuts[k+1]; if(b-a<0.05) continue;
        const nu=Math.max(2,Math.ceil((b-a)/0.3));
        const g=gridGeom(nu,3,(u,v)=>skinPt(c,a+(b-a)*u,zb0+sz.band*v,0.014),(u,v)=>[(a+(b-a)*u-xa)/sz.pitch,v]);
        const sec=secAt((a+b)/2);
        child(sec,g,wmat,"windows"); child(sec,mirrorX(g),wmat,"windows");
      }
    });
  });
}
/* ---------- cockpit windscreen (ws*) ----------
   Every pane is a rounded outline cast onto the fuselage skin (front panes along the flight axis, side panes along the lateral axis, or directly on the rings),
   so it follows the surface. Each pane = dark raised frame (with a recessed lip) + tinted glass with a painted sky reflection; a solid centre post and a dark
   brow band (paint) complete the A380 look. All pieces are merged into three meshes (glass, frame, brow) that belong to the part "flightdeck". */
SPEC.wsf={c:"#15181C",r:.45,m:.1}; SPEC.wsb={c:"#B4BDC6",r:.6,m:.05};   /* v18: like the real ones: dark glass flush with the skin, a thin dark seal round each pane, the posts between the panes are skin (no raised frame, no dark mask) */
/* smooth monotone curve through control points (no overshoot), sampled densely: used for the nose lines */
function wsCurve(P){
  const n=P.length, h=[], d=[], m=[]; for(let i=0;i<n-1;i++){ h[i]=P[i+1][0]-P[i][0]; d[i]=(P[i+1][1]-P[i][1])/h[i]; }
  m[0]=d[0]; m[n-1]=d[n-2];
  for(let i=1;i<n-1;i++) m[i]=d[i-1]*d[i]<=0?0:3*(h[i-1]+h[i])/((2*h[i]+h[i-1])/d[i-1]+(h[i]+2*h[i-1])/d[i]);
  const out=[[P[0][0],P[0][1]]];
  for(let i=0;i<n-1;i++){ const k=Math.max(1,Math.round(h[i]/(P[i][0]<2.2?0.14:0.3)));
    for(let j=1;j<=k;j++){ const t=j/k, t2=t*t, t3=t2*t;
      out.push([P[i][0]+h[i]*t,(2*t3-3*t2+1)*P[i][1]+(t3-2*t2+t)*h[i]*m[i]+(-2*t3+3*t2)*P[i+1][1]+(t3-t2)*h[i]*m[i+1]]); } }
  return out;
}
/* the nose lines: smooth control points up to X1, the old lines behind */
const wsHead=(old,ctrl)=>wsCurve(ctrl).concat(old.filter(p=>p[0]>ctrl[ctrl.length-1][0]+1e-6));
/* A380: drooped bulb radome, steep windscreen, brow, then the roof rises smoothly into the upper-deck hump */
GEO.a380.rad=2.5;
GEO.a380.top=wsHead(GEO.a380.top,[[0,5.7],[0.06,5.98],[0.2,6.28],[0.5,6.55],[1.0,6.85],[1.6,7.1],[2.2,7.3],[2.85,7.5],[3.5,8.0],[4.2,8.48],[5.0,8.78],[6.0,9.12],[7.5,9.78],[9,10.45],[11,11.15],[13,11.55],[14,11.7]]);
GEO.a380.bot=wsHead(GEO.a380.bot,[[0,5.7],[0.06,5.42],[0.2,5.12],[0.5,4.82],[1.0,4.5],[1.7,4.15],[2.5,3.82],[4,3.5],[6,3.28],[8,3.2]]);
/* 737: smooth drooped radome, windscreen, roof */
GEO.b737.rad=1.9;
GEO.b737.top=wsHead(GEO.b737.top,[[0,2.95],[0.06,3.1],[0.25,3.34],[0.75,3.62],[1.25,3.84],[1.75,4.2],[2.25,4.55],[3.25,4.88],[4.25,5.10],[5.25,5.22],[6.25,5.32],[7.25,5.36]]);
GEO.b737.bot=wsHead(GEO.b737.bot,[[0,2.85],[0.06,2.7],[0.25,2.47],[0.75,2.2],[1.25,2.01],[1.75,1.82],[2.25,1.69],[3.25,1.52],[4.25,1.45],[5.25,1.41],[6.25,1.40]]);
GEO.a380.nose=9.4; GEO.b737.nose=5.2;
GEO.a380.wsHull=null;
GEO.a380.wsP=[
  {m:"f",q:[[0.07,7.42],[1.4,7.52],[1.36,8.3],[0.07,8.52]],r:0.1,fw:0.026},
  {m:"s",q:[[3.62,7.42],[5.15,7.42],[5.15,8.45],[4.78,8.27]],r:0.1,fw:0.026},
  {m:"s",q:[[5.3,7.42],[5.92,7.46],[5.92,8.55],[5.3,8.5]],r:0.08,fw:0.024}];
GEO.b737.wsP=[
  {m:"f",q:[[0.05,3.98],[0.84,4.08],[0.8,4.46],[0.05,4.6]],r:0.07,fw:0.022},
  {m:"s",q:[[3.0,4.0],[3.98,4.02],[3.98,4.5],[3.55,4.4]],r:0.07,fw:0.022},
  {m:"s",q:[[4.1,4.04],[4.5,4.08],[4.5,4.42],[4.1,4.5]],r:0.05,fw:0.02}];

/* outward unit normal of the fuselage skin at a point on it (gradient of the ring equation, so it includes the taper of the nose) */
function wsNrm(c,p){
  const L2=c.L/2, e=0.012, G=(x,y,z)=>{ const q=ringAt(c,z+L2), sv=(y-q.zc)/Math.max(q.hh,1e-3); return (x/Math.max(q.hw*secK(c,sv,z+L2),1e-3))**2+sv**2; };
  const gx=G(p.x+e,p.y,p.z)-G(p.x-e,p.y,p.z), gy=G(p.x,p.y+e,p.z)-G(p.x,p.y-e,p.z), gz=G(p.x,p.y,p.z+e)-G(p.x,p.y,p.z-e), gl=Math.hypot(gx,gy,gz)||1;
  return new THREE.Vector3(gx/gl,gy/gl,gz/gl);
}
/* point on the skin (right side) for a 2-D outline coordinate, pushed out along the skin normal by off */
function wsPt(c,m,u,v,off){
  const L2=c.L/2; let p;
  if(m==="f"){ const F=X=>{ const q=ringAt(c,X), sv=(v-q.zc)/Math.max(q.hh,1e-3); return (u/Math.max(q.hw*secK(c,sv,X),1e-3))**2+sv**2-1; };
    let lo=0, hi=c.nose*1.5; for(let i=0;i<30;i++){ const mm=(lo+hi)/2; if(F(mm)<=0) hi=mm; else lo=mm; } p=new THREE.Vector3(u,v,hi-L2); }
  else if(m==="r"){ const q=ringAt(c,u), a=v*Math.PI/180; p=new THREE.Vector3(q.hw*Math.cos(a)*secK(c,Math.sin(a),u),q.zc+q.hh*Math.sin(a),u-L2); }
  else p=skinPt(c,u,v,0);
  return off?p.addScaledVector(wsNrm(c,p),off):p;
}
/* closed outline with rounded corners (quadratic arcs), long edges subdivided so the outline can bend with the skin */
function wsOutline(Q,rad,dmax){
  const n=Q.length, arcs=[];
  for(let i=0;i<n;i++){ const P0=Q[(i+n-1)%n], C=Q[i], P1=Q[(i+1)%n], r=Array.isArray(rad)?rad[i]:rad;
    const d0=Math.hypot(P0[0]-C[0],P0[1]-C[1]), d1=Math.hypot(P1[0]-C[0],P1[1]-C[1]), t0=Math.min(0.48,r/d0), t1=Math.min(0.48,r/d1);
    const A=[C[0]+(P0[0]-C[0])*t0,C[1]+(P0[1]-C[1])*t0], B=[C[0]+(P1[0]-C[0])*t1,C[1]+(P1[1]-C[1])*t1], arc=[];
    for(let k=0;k<=6;k++){ const t=k/6, a=(1-t)*(1-t), b=2*t*(1-t), cc=t*t; arc.push([a*A[0]+b*C[0]+cc*B[0],a*A[1]+b*C[1]+cc*B[1]]); }
    arcs.push(arc); }
  const out=[];
  for(let i=0;i<n;i++){ const arc=arcs[i], nx=arcs[(i+1)%n]; arc.forEach(p=>out.push(p));
    const a=arc[arc.length-1], b=nx[0], d=Math.hypot(b[0]-a[0],b[1]-a[1]), k=Math.floor(d/dmax);
    for(let j=1;j<=k;j++){ const t=j/(k+1); out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]); } }
  return out;
}
/* outline pushed outwards: by d everywhere, up to dTop on the edges that face upwards (the brow) */
function wsOffset(P,d,dTop){
  const n=P.length; let A=0; for(let i=0;i<n;i++){ const a=P[i], b=P[(i+1)%n]; A+=a[0]*b[1]-b[0]*a[1]; }
  const sg=A>0?1:-1;
  return P.map((p,i)=>{ const a=P[(i+n-1)%n], b=P[(i+1)%n], tx=b[0]-a[0], ty=b[1]-a[1], tl=Math.hypot(tx,ty)||1, nx=sg*ty/tl, ny=-sg*tx/tl;
    const up=Math.max(0,Math.min(1,ny*1.4)), k=d+((dTop===undefined?d:dTop)-d)*up*up*(3-2*up);
    return [p[0]+nx*k,p[1]+ny*k]; });
}
/* little geometry accumulator: strips between outlines, filled patches (rings shrunk towards the centre) */
function wsAcc(c,m){
  const pos=[], uv=[], idx=[];
  const P3=(P,off,box)=>P.map(p=>{ const v=wsPt(c,m,p[0],p[1],off); pos.push(v.x,v.y,v.z); if(box) uv.push((p[0]-box[0])/box[2],1-(p[1]-box[1])/box[3]); return pos.length/3-1; });
  return {pos,uv,idx,
    strip(rows){ const R=rows.map(r=>P3(r[0],r[1])), n=R[0].length;
      for(let k=0;k<R.length-1;k++) for(let j=0;j<n;j++){ const a=R[k][j], b=R[k][(j+1)%n], cc=R[k+1][j], d=R[k+1][(j+1)%n]; idx.push(a,cc,b,b,cc,d); } },
    fill(P,off,box,rings){ const n=P.length; let cx=0, cy=0; P.forEach(p=>{ cx+=p[0]/n; cy+=p[1]/n; });
      let md=0; P.forEach(p=>{ md=Math.max(md,Math.hypot(p[0]-cx,p[1]-cy)); }); const cI=P3([[cx,cy]],off,box)[0], R=[], K=Math.max(rings||2,Math.min(16,Math.ceil(md/0.12)));
      for(let k=1;k<=K;k++){ const s=k/K; R.push(P3(P.map(p=>[cx+(p[0]-cx)*s,cy+(p[1]-cy)*s]),off,box)); }
      for(let j=0;j<n;j++) idx.push(cI,R[0][j],R[0][(j+1)%n]);
      for(let k=0;k<K-1;k++) for(let j=0;j<n;j++){ const a=R[k][j], b=R[k][(j+1)%n], cc=R[k+1][j], d=R[k+1][(j+1)%n]; idx.push(a,cc,b,b,cc,d); } },
    geom(){ if(!pos.length) return null; const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(pos,3)); if(uv.length) g.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); return g; }};
}
/* glass reflection: sky tint at the top, dark horizon below, one soft diagonal glare; small and shared (64 x 128) */
function wsGlassTex(){
  const cv=document.createElement("canvas"); cv.width=64; cv.height=128; const g=cv.getContext("2d");
  const gr=g.createLinearGradient(0,0,0,128); gr.addColorStop(0,"#465F73"); gr.addColorStop(0.3,"#1E3142"); gr.addColorStop(0.6,"#0D1821"); gr.addColorStop(1,"#060A0E");
  g.fillStyle=gr; g.fillRect(0,0,64,128);
  const d=g.createLinearGradient(0,0,64,128); d.addColorStop(0,"rgba(255,255,255,0)"); d.addColorStop(0.3,"rgba(255,255,255,0.0)"); d.addColorStop(0.42,"rgba(255,255,255,0.13)"); d.addColorStop(0.5,"rgba(255,255,255,0.0)"); d.addColorStop(1,"rgba(255,255,255,0)");
  g.fillStyle=d; g.fillRect(0,0,64,128);
  const t=new THREE.CanvasTexture(cv); t.encoding=THREE.sRGBEncoding; t.anisotropy=4; return t;
}
/* finer skin for the nose sections (the standard loft has a ring every 0.5 m, which cuts through the curved windscreen area): same rings, denser */
function wsFuse(c,X0,X1){
  const rings=[], m=64; let X=X0;
  const step=x=>x<7?0.12:0.3, xs=[X0]; while(X<X1-1e-6){ X=Math.min(X1,X+step(X)); xs.push(X); }
  xs.forEach(X=>{ const r=ringAt(c,X), ring=[]; for(let j=0;j<m;j++){ const th=j/m*Math.PI*2; ring.push(new THREE.Vector3(r.hw*Math.cos(th)*secK(c,Math.sin(th),X),r.zc+r.hh*Math.sin(th),X-c.L/2)); } rings.push(ring); });
  const g=loftGeom(rings); wsNormals(c,g); return g;
}
/* analytic skin normals for a ring loft (last two vertices = end cap centres): every fuselage section then shades the same across its joints, no seam ridge shows */
function wsNormals(c,g){
  const P=g.attributes.position, N=g.attributes.normal, nv=P.count-2;
  for(let i=0;i<nv;i++){ const p=new THREE.Vector3(P.getX(i),P.getY(i),P.getZ(i)); const n=(p.z+c.L/2<1e-4)?new THREE.Vector3(0,0,-1):wsNrm(c,p); N.setXYZ(i,n.x,n.y,n.z); }
  N.setXYZ(nv,0,0,-1); N.setXYZ(nv+1,0,0,1); N.needsUpdate=true;
}
/* build the three merged geometries of one aircraft's windscreen: {glass, frame, brow} */
function wsBuild(c){
  const GL_=[], FR=[], BR=[];
  const accs={}, acc=(T,m)=>{ const k=T+m; return accs[k]||(accs[k]=wsAcc(c,m)); };
  (c.wsP||[]).forEach(p=>{
    const base=wsOutline(p.q,p.r,0.12), fw=p.fw||0.04;
    let u0=1e9,v0=1e9,u1=-1e9,v1=-1e9; base.forEach(q=>{ u0=Math.min(u0,q[0]); u1=Math.max(u1,q[0]); v0=Math.min(v0,q[1]); v1=Math.max(v1,q[1]); });
    const box=[u0,v0,u1-u0,v1-v0];
    acc("g",p.m).fill(base,0.006,box,3);
    acc("f",p.m).strip([[wsOffset(base,fw),0.007],[wsOffset(base,-0.004),0.007]]);
    if(p.bm) acc("b",p.m).fill(wsOffset(base,p.bm[0],p.bm[1]),0.006,null,3);
  });
  if(c.wsHull){ /* one dark band around the whole windscreen: convex hull of all panes on the rings (X, angle), pushed out a little, more above (the brow) */
    const K=0.045, pts=[]; (c.wsP||[]).forEach(p=>wsOutline(p.q,p.r,0.12).forEach(q=>{ const v=wsPt(c,p.m,q[0],q[1],0), r=ringAt(c,v.z+c.L/2);
      pts.push([v.z+c.L/2,Math.atan2((v.y-r.zc)/r.hh,v.x/(r.hw*secK(c,(v.y-r.zc)/r.hh,v.z+c.L/2)))*180/Math.PI*K]); }));
    pts.sort((a,b)=>a[0]-b[0]||a[1]-b[1]); const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]), lo=[], up=[];
    pts.forEach(p=>{ while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0) lo.pop(); lo.push(p); });
    for(let i=pts.length-1;i>=0;i--){ const p=pts[i]; while(up.length>1&&cr(up[up.length-2],up[up.length-1],p)<=0) up.pop(); up.push(p); }
    const hull=lo.slice(0,-1).concat(up.slice(0,-1)), H=wsOffset(wsOutline(hull,0.12,0.24),c.wsHull[0],c.wsHull[1]).map(q=>[q[0],q[1]/K]);
    acc("b","r").fill(H,0.008,null,3); }
  (c.wsBrow||[]).forEach(b=>acc("b",b.m).fill(wsOutline(b.q,b.r||0.1,0.12),0.006,null,3));
  const out={}; ["g","f","b"].forEach(T=>{ const gs=Object.keys(accs).filter(k=>k[0]===T).map(k=>accs[k].geom()).filter(Boolean); out[T]=gs.length?wsMergeUV(gs):null; });
  return out;
}
function wsMergeUV(list){
  const pos=[], uv=[], idx=[]; let off=0, hasUV=list.every(g=>g.attributes.uv);
  list.forEach(g=>{ const p=g.attributes.position.array, ix=g.index.array; for(let i=0;i<p.length;i++) pos.push(p[i]); if(hasUV){ const t=g.attributes.uv.array; for(let i=0;i<t.length;i++) uv.push(t[i]); }
    for(let i=0;i<ix.length;i++) idx.push(ix[i]+off); off+=p.length/3; });
  const m=new THREE.BufferGeometry(); m.setAttribute("position",new THREE.Float32BufferAttribute(pos,3)); if(hasUV) m.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2)); m.setIndex(idx); m.computeVertexNormals(); return m;
}
let wsGT=null;
/* windscreen panes (root meshes of the flight deck, so they glow and explode with it) and belly fairing, before prepAnim */
function skinParts(B,put){
  const c=B.c, W3=wsBuild(c);
  [["radome",0,c.rad],["flightdeck",c.rad,c.fd]].forEach(([id,x0,x1])=>{ const mm=B.byId[id]&&B.byId[id][0]; if(mm){ mm.geometry.dispose(); mm.geometry=wsFuse(c,x0,x1); } });
  ["fuse_fwd","fuse_mid","fuse_aft"].forEach(id=>{ const mm=B.byId[id]&&B.byId[id][0]; if(mm) wsNormals(c,mm.geometry); });
  /* thin layers on the skin neither cast nor receive shadows (the shadow map cannot resolve a 1 cm layer: it would show as stripes); the controller sets these flags later, so they are locked */
  const lock=ms=>ms.forEach(m=>["castShadow","receiveShadow"].forEach(k=>Object.defineProperty(m,k,{get:()=>false,set:()=>{}})));
  if(W3.g) lock(put("flightdeck",W3.g,{both:true,mk:"glass"}));
  if(W3.f) lock(put("flightdeck",W3.f,{both:true,mk:"wsf"}));
  if(W3.b) lock(put("flightdeck",W3.b,{both:true,mk:"wsb"}));
  { const g=B.mat("flightdeck","glass","ext"); g.map=wsGT||(wsGT=wsGlassTex()); g.roughness=0.06; g.metalness=0.3; g.userData.base="#FFFFFF"; g.polygonOffset=true; g.polygonOffsetFactor=-3; g.polygonOffsetUnits=-3; g.needsUpdate=true;
    [["wsf",-4],["wsb",-2]].forEach(([k,f])=>{ if(!B.cache["flightdeck|"+k]) return; const m=B.cache["flightdeck|"+k]; m.polygonOffset=true; m.polygonOffsetFactor=f; m.polygonOffsetUnits=f; m.needsUpdate=true; }); }
  /* belly fairing: a smooth bulge under the wing box */
  /* (vw) the blister grows out of the hull: at both ends its ring IS the hull ring (just under the skin, so no flat cap or step shows), the lower flanks swell smoothly (smoothstep envelope) into the wing-root pod */
  const [x0,x1,dep]=c.fairing, a=c.fw/2, rings=[], sm=(e0,e1,x)=>{ const q=Math.min(1,Math.max(0,(x-e0)/(e1-e0))); return q*q*(3-2*q); };
  for(let i=0;i<=44;i++){ const X=x0+(x1-x0)*i/44, t=(X-x0)/(x1-x0), env=sm(0,0.4,t)*sm(1,0.55,t), r=ringAt(c,X);
    const hw=a*(0.62+0.36*env), hh=Math.max(0.4,r.hh*0.42), zc=r.zb+hh+0.06-(dep+0.06)*env, ring=[];
    for(let j=0;j<56;j++){ const th=j/56*Math.PI*2, s=Math.sin(th), k=secK(c,s,X), hx=r.hw*Math.cos(th)*k*0.997, hz=r.zc+r.hh*s*0.997, w=env*sm(0.05,-0.5,s);
      ring.push(new THREE.Vector3(hx+(hw*Math.cos(th)-hx)*w,hz+(zc+hh*s-hz)*w,X-c.L/2)); }
    rings.push(ring); }
  put("fuse_mid",loftGeom(rings),{belly:true});
  /* dorsal fillet in front of the fin. (v37) Its aft edge lies ON the fin's swept leading edge (the apex is where the fillet's top line meets it, 0.3 m inside the fin so the two surfaces
     interpenetrate). It used to end at a fixed station with a vertical face: wherever the swept leading edge was further aft at that height it left a step and a notch in front of the fin
     (the owner's screenshot of the 737; the A380 got the same when its fin was re-swept in v36). The fin's leading edge here is the one finLS() builds: root 0.35 m under the fuselage top line. */
  const [d0,d1,dh]=c.dorsal, top=X=>interp(c.top,X), fp=c.fin, zr0=top(fp[0][0])-0.35, leX=z=>fp[0][0]+(fp[1][0]-fp[0][0])*Math.min(1,Math.max(0,(z-zr0)/(fp[1][1]-zr0)));
  let xa=d1; for(let i=0;i<6;i++) xa=leX(top(xa)+dh)+0.3;
  const DS={pt:(u,f,k,e=0)=>{ const Xr=d0+(xa-d0)*f, zb=top(Xr)-0.3, zt=top(d0)+(top(xa)+dh-top(d0))*Math.pow(f,1.35), z=zb+(Math.max(zb,zt)-zb)*u, xe=Math.min(xa,leX(z)+0.3), X=d0+(xe-d0)*f;
    return new THREE.Vector3(k*thk(0.28*(1-0.6*u)*Math.min(1,f*6),e), z, X-c.L/2); }};
  put("fin",lsRegion(DS,0,1,0,1,0,4,10),{mk:"tail"});
}
