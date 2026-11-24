/* ---------- neighbouring and remote aircraft: the real aircraft builder (buildAircraft, lod 1) baked into 9 shared meshes per aircraft.
   The geometry of one type is baked once and shared by every aircraft of that type; only the livery materials differ (colours, no logos). ---------- */
const AP_JB={}, AP_ENVM=[], AP_NITE=[];
const AP_ROLE={skin:"body",wing:"wing",tip:"wing",fair:"wing",tail:"tail",rudder:"tail",stripe:"stripe",engine:"engine",spin:"engine",glass:"glass",wtex:"wtex",nav:"lights",navL:"lights",navR:"lights",beacon:"lights"};
const AP_DET={fan:"#2b3339",liner:"#12161a",exh:"#5b524a",chrome:"#d7dde2",brake:"#3a3f45",hose:"#1a1d20",gear:"#8e99a3",tyre:"#23282d",hub:"#b8c0c7",probe:"#9aa3ab",ant:"#b9c2c9",cowlseam:"#6f7a82"};
const AP_LIGHT={nav:"#fff4d6",navL:"#ff3030",navR:"#30ff70",beacon:"#ff2a2a"};
function apLin(h){ const k=new THREE.Color(h), f=v=>v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4); k.setRGB(f(k.r),f(k.g),f(k.b)); return k; }
/* vertex-cluster decimation for the distant aircraft: vertices snap to a grid (separately per normal octant, so thin surfaces keep both sides), degenerate triangles go away */
function apDecimate(g,cell,extra){
  const P=g.attributes.position.array, N=g.attributes.normal.array, I=g.index.array, n=P.length/3, key=new Map(), re=new Int32Array(n), ex=extra||[];
  const cp=[], cn=[], cc=[], ce=ex.map(()=>[]);
  for(let i=0;i<n;i++){ const k=Math.round(P[i*3]/cell)+","+Math.round(P[i*3+1]/cell)+","+Math.round(P[i*3+2]/cell)+","+((N[i*3]>0?1:0)+(N[i*3+1]>0?2:0)+(N[i*3+2]>0?4:0)); let j=key.get(k);
    if(j===undefined){ j=cc.length; key.set(k,j); cc.push(0); cp.push(0,0,0); cn.push(0,0,0); ex.forEach((e,q)=>{ for(let z=0;z<e.size;z++) ce[q].push(0); }); }
    re[i]=j; cc[j]++; for(let z=0;z<3;z++){ cp[j*3+z]+=P[i*3+z]; cn[j*3+z]+=N[i*3+z]; } ex.forEach((e,q)=>{ for(let z=0;z<e.size;z++) ce[q][j*e.size+z]+=e.arr[i*e.size+z]; }); }
  const m=cc.length, op=new Float32Array(m*3), on=new Float32Array(m*3), oe=ex.map(e=>new Float32Array(m*e.size));
  for(let j=0;j<m;j++){ const c=cc[j]; let nx=cn[j*3], ny=cn[j*3+1], nz=cn[j*3+2], l=Math.hypot(nx,ny,nz)||1; op[j*3]=cp[j*3]/c; op[j*3+1]=cp[j*3+1]/c; op[j*3+2]=cp[j*3+2]/c; on[j*3]=nx/l; on[j*3+1]=ny/l; on[j*3+2]=nz/l; ex.forEach((e,q)=>{ for(let z=0;z<e.size;z++) oe[q][j*e.size+z]=ce[q][j*e.size+z]/c; }); }
  const ix=[]; for(let t=0;t<I.length;t+=3){ const a=re[I[t]], b=re[I[t+1]], c=re[I[t+2]]; if(a!==b&&b!==c&&a!==c) ix.push(a,b,c); }
  const o=new THREE.BufferGeometry(); o.setAttribute("position",new THREE.BufferAttribute(op,3)); o.setAttribute("normal",new THREE.BufferAttribute(on,3)); o.setIndex(ix); return {g:o,ex:oe};
}
function apJetBake(key){
  if(AP_JB[key]) return AP_JB[key];
  const B=buildAircraft(key,{lod:1}), c=B.c, bell=new Map(); (B.bellies||[]).forEach(e=>bell.set(e.geom,e.t));
  B.root.traverse(m=>{ const u=m.userData; if(m.isMesh&&u&&u.id&&!u.child&&u.P) m.position.set(u.P[0],u.P[1],u.P[2]); }); B.root.updateMatrixWorld(true);
  const acc={}, nm=new THREE.Matrix3(), v=new THREE.Vector3();
  B.root.traverse(m=>{
    if(!m.isMesh) return; const u=m.userData, mu=m.material.userData||{}; if(mu.layer==="int"||u.layer==="int") return;
    const mk=mu.mk; if(mk==="seam"||(u.id==="doors"&&mk==="skin")) return;
    const role=AP_ROLE[mk]||"detail", a=acc[role]||(acc[role]={p:[],n:[],uv:[],c:[],t:[],i:[]}), g=m.geometry, P=g.attributes.position, N=g.attributes.normal, UV=g.attributes.uv, base=a.p.length/3;
    nm.getNormalMatrix(m.matrixWorld); const tt=role==="body"?bell.get(g):null, col=role==="detail"?apLin(AP_DET[mk]):(role==="lights"?apLin(AP_LIGHT[mk]):null);
    for(let i=0;i<P.count;i++){ v.fromBufferAttribute(P,i).applyMatrix4(m.matrixWorld); a.p.push(v.x,v.y,v.z); v.fromBufferAttribute(N,i).applyMatrix3(nm).normalize(); a.n.push(v.x,v.y,v.z);
      if(role==="wtex") a.uv.push(UV?UV.getX(i):0,UV?UV.getY(i):0); if(col) a.c.push(col.r,col.g,col.b); if(role==="body") a.t.push(tt?tt[i]:1); }
    if(g.index){ const ix=g.index.array; for(let i=0;i<ix.length;i++) a.i.push(ix[i]+base); } else for(let i=0;i<P.count;i++) a.i.push(base+i);
  });
  const lp=[]; { const Lg=acc.lights; if(Lg){ const mp=new Map(); for(let i=0;i<Lg.p.length/3;i++){ const cr=Lg.c[i*3], cg=Lg.c[i*3+1], kk=cr>0.5?(cg>0.5?0:1):2, k=Math.round(Lg.p[i*3]/1.5)+","+Math.round(Lg.p[i*3+1]/1.5)+","+Math.round(Lg.p[i*3+2]/1.5)+","+kk; let e=mp.get(k); if(!e){ e={n:0,x:0,y:0,z:0,k:kk}; mp.set(k,e); } e.n++; e.x+=Lg.p[i*3]; e.y+=Lg.p[i*3+1]; e.z+=Lg.p[i*3+2]; }
    mp.forEach(e=>lp.push([e.x/e.n,e.y/e.n,e.z/e.n,e.k])); } }
  const geo={}, T={};
  for(const role in acc){ const a=acc[role], g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(a.p,3)); g.setAttribute("normal",new THREE.Float32BufferAttribute(a.n,3));
    if(a.uv.length) g.setAttribute("uv",new THREE.Float32BufferAttribute(a.uv,2)); if(a.c.length) g.setAttribute("color",new THREE.Float32BufferAttribute(a.c,3)); g.setIndex(a.i); g.computeBoundingSphere(); geo[role]=g; if(a.t.length) T[role]=new Float32Array(a.t); }
  const wm=B.cache["windows|wtex"], bake={key,c,geo,t:T.body,win:wm?wm.map:null,far:null,bc:{},lp}; AP_JB[key]=bake; return bake;
}
/* distant variant: clustered copies of the heavy roles, no windows */
function apJetFar(bake,cell){
  if(bake.far) return bake.far; const out={};
  ["body","wing","tail","stripe","engine","glass","detail","lights"].forEach(r=>{ const g=bake.geo[r]; if(!g) return;
    const ex=r==="body"?[{arr:bake.t,size:1}]:(g.attributes.color?[{arr:g.attributes.color.array,size:3}]:[]), cl=(r==="glass"||r==="lights")?g:null;
    if(cl){ out[r]={g}; return; } const d=apDecimate(g,r==="detail"?cell*0.5:cell,ex);
    if(r==="body") d.t=d.ex[0]; else if(ex.length) d.g.setAttribute("color",new THREE.BufferAttribute(d.ex[0],3)); d.g.computeBoundingSphere(); out[r]={g:d.g,t:d.t}; });
  return bake.far=out;
}
let AP_SH=null;
function apJetShared(){
  if(AP_SH) return AP_SH; const s={}; const std=(o)=>{ const m=new THREE.MeshStandardMaterial(Object.assign({side:THREE.DoubleSide},o)); AP_ENVM.push(m); return m; };
  s.detail=std({vertexColors:true,roughness:0.5,metalness:0.35}); s.glass=std({color:apLin("#17242f"),roughness:0.08,metalness:0.4}); s.lights=new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false}); s.lightsBase=1;
  return AP_SH=s;
}
function apJetMats(pal){
  if(pal._m) return pal._m; const std=(c,r,m,vc)=>{ const x=new THREE.MeshStandardMaterial({color:apLin(c),roughness:r,metalness:m,side:THREE.DoubleSide,vertexColors:!!vc}); AP_ENVM.push(x); return x; };
  const sk=pal.skin||"#eef1f2", eng=pal.engine||pal.skin||"#e4eaef";
  return pal._m={body:std(sk,0.42,0.12,true),wing:std(pal.wing||"#dfe5ea",0.45,0.14),tail:std(pal.tail,0.4,0.12),stripe:std(pal.stripe||pal.tail,0.45,0.1),engine:std(eng,0.35,0.25)};
}
/* an aircraft of type key (nose towards -z, centred like the main aircraft), scaled by k; pal = {skin,belly,tail,stripe,wing,engine}; o.far = decimated, no windows */
function apJetMake(key,pal,k,o){
  o=o||{}; const bake=apJetBake(key), M=apJetMats(pal), S=apJetShared(), G=new THREE.Group(), src=o.far?apJetFar(bake,o.cell||0.45):null;
  const pick=r=>src?(src[r]&&src[r].g):bake.geo[r];
  const mk=(r,mat,cast)=>{ const g=pick(r); if(!g) return; const m=new THREE.Mesh(g,mat); m.castShadow=!!cast; m.receiveShadow=false; m.raycast=()=>{}; G.add(m); return m; };
  /* body: belly colour through vertex colours (t = 0 at the bottom, 1 above the belt line), computed per livery and cached per type */
  { const g0=pick("body"), t=src?src.body.t:bake.t, ck=(o.far?"f":"n")+(pal.skin||"")+"|"+(pal.belly||""); let g=bake.bc[ck];
    if(!g){ g=new THREE.BufferGeometry(); g.setAttribute("position",g0.attributes.position); g.setAttribute("normal",g0.attributes.normal); g.setIndex(g0.index); g.boundingSphere=g0.boundingSphere;
      const sk=apLin(pal.skin||"#eef1f2"), bl=apLin(pal.belly||"#9aa3ab"), rr=bl.r/Math.max(sk.r,1e-3), gg=bl.g/Math.max(sk.g,1e-3), bb=bl.b/Math.max(sk.b,1e-3), A=new Float32Array(t.length*3);
      for(let i=0;i<t.length;i++){ const f=t[i]; A[i*3]=rr+(1-rr)*f; A[i*3+1]=gg+(1-gg)*f; A[i*3+2]=bb+(1-bb)*f; } g.setAttribute("color",new THREE.BufferAttribute(A,3)); bake.bc[ck]=g; }
    const m=new THREE.Mesh(g,M.body); m.castShadow=true; m.raycast=()=>{}; G.add(m); }
  mk("wing",M.wing,true); mk("tail",M.tail,true); mk("stripe",M.stripe,false); mk("engine",M.engine,true); mk("glass",S.glass,false); mk("detail",S.detail,true); mk("lights",S.lights,false);
  if(!o.far&&bake.geo.wtex){ if(!bake.winM){ bake.winM=new THREE.MeshStandardMaterial({map:bake.win,alphaTest:0.5,roughness:0.2,metalness:0.3,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2}); AP_ENVM.push(bake.winM); } mk("wtex",bake.winM,false); }
  if(bake.lp.length){ if(!bake.lg){ const P=[], C=[], cc=[[1,0.95,0.8],[1,0.15,0.1],[0.1,1,0.35]]; bake.lp.forEach(q=>{ P.push(q[0],q[1],q[2]); C.push(...cc[q[3]]); }); bake.lg=new THREE.BufferGeometry(); bake.lg.setAttribute("position",new THREE.Float32BufferAttribute(P,3)); bake.lg.setAttribute("color",new THREE.Float32BufferAttribute(C,3)); }
    if(!S.glow){ S.glow=new THREE.PointsMaterial({size:6,map:glowTex(),vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true,fog:false}); if(typeof vwGlow==="function") vwGlow(S.glow,"nav"); }
    const pg=new THREE.Points(bake.lg,S.glow); pg.visible=false; pg.raycast=()=>{}; pg.frustumCulled=false; G.add(pg); AP_NITE.push(pg); }
  G.scale.setScalar(k||1); return G;
}
/* palettes: plain colours, no logos */
const AP_PAL=[
  {skin:"#f3f4f4",belly:"#a4acb2",tail:"#8a1f2e",stripe:"#8a1f2e",engine:"#e8eaeb"},
  {skin:"#f1f4f3",belly:"#9fb0ab",tail:"#1f7a6e",stripe:"#1f7a6e",engine:"#e6ecea"},
  {skin:"#f4f1ea",belly:"#aaa293",tail:"#b8863a",stripe:"#b8863a",engine:"#ebe6da"},
  {skin:"#eceff3",belly:"#9aa4b2",tail:"#5b3d8f",stripe:"#8a6dc0",engine:"#e2e6ec"},
  {skin:"#dfe4e8",belly:"#8d979f",tail:"#1d3157",stripe:"#1d3157",engine:"#cfd6dc"},
  {skin:"#f5f3f0",belly:"#b0aaa2",tail:"#c9622b",stripe:"#c9622b",engine:"#ece8e2"}
];
