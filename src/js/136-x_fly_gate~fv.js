/* ---------- fv: flight-world visuals (agent flyvis). (1) The aircraft of the flight airports (stands next to the player's gate, remote stands, taxiways / hold short) are the REAL builder output
   (apJetBake, m_ap_jet.js) vertex-cluster decimated per level of detail and MERGED into a handful of draw calls: one paint mesh (vertex colours = livery colours, no logos, with a little ground equipment drawn as boxes), one detail mesh (gear, engine internals),
   one glass mesh, one window mesh per aircraft type, one soft contact-shadow mesh and one Points draw for the nav lights. (2) Night lighting of the own aircraft and the neighbours (moon + apron floodlight spill, warm bounce, lit cabin windows). ---------- */
const FV={dec:{},dim:{},col:{},mats:null,AU:null,env:null,envK:1,tier:2,tris:0,calls:0,n:0,glow:0,night:0,spill:0,L:null,base:null,flood:null};
const FV_LIV=["classic","purple","teal","red","gold","maroon","sky","navy","green"];
const FV_BY={"-2":"a380","-1":"b737",1:"b747",2:"b737",3:"b737",4:"a380",5:"b737",6:"b737",7:"b747"};   /* aircraft type by stand index relative to the player's gate */
const FV_CELLS=[[2.4,2.4,3.0],[1.1,1.7,2.5],[0.7,1.1,1.7]];   /* decimation cell (m) per tier: near / mid / far */
function fvCol(h){ return FV.col[h]||(FV.col[h]=(c=>[c.r,c.g,c.b])(apLin(h))); }
function fvPal(k){ const L=typeof LIVERY!=="undefined"&&LIVERY[k]; return L?{skin:L.skin,belly:L.belly||"#9aa3ab",tail:L.tail,stripe:L.stripe,wing:L.wing||L.skin,engine:L.skin}:AP_PAL[0]; }
/* dimensions of one type: fuselage half width from the baked body, the first main door and the right fwd cargo door (stations from the nose), wing tip lights */
function fvDim(key){
  if(FV.dim[key]) return FV.dim[key]; const c=GEO[key], b=apJetBake(key), g=b.geo.body; if(!g.boundingBox) g.computeBoundingBox(); const dr=c.doorList||[], m1=dr.find(q=>q.deck==="main"&&q.side==="both")||{X:6,z:3.4}, cg=dr.find(q=>q.deck==="cargo"&&q.side==="R")||{X:10}, tip=b.lp.find(q=>q[3]===0&&Math.abs(q[0])>10);
  return FV.dim[key]={L:c.L,span:c.span,hw:g.boundingBox.max.x,dX:m1.X,dZ:m1.z,cX:cg.X,tipU:tip?c.L/2+tip[2]:c.L*0.75,tipX:tip?Math.abs(tip[0]):c.span/2};
}
function fvDoor(key){ const d=fvDim(key); return {X:d.dX,z:d.dZ,hw:d.hw}; }
/* the cast: which aircraft stand where. Deterministic per airport; the stands next to the gate are the near ones. */
function fvNbPlan(Ly){
  if(Ly._fvp) return Ly._fvp; const sg=Ly.sg, id=(Ly.apt&&Ly.apt.id)||"", ofs=id.split("").reduce((a,c)=>a+c.charCodeAt(0),0), livs=FV_LIV.filter(k=>typeof LIVERY!=="undefined"&&LIVERY[k]), E=[], by={}, half=Math.PI/2;
  const liv=i=>fvPal(livs[(i*5+ofs)%livs.length]||"classic");
  /* (v36) the owner asked for no parked aircraft on the runway or at the gates "except those that are actively boarding passengers": only the two stands next to the player's gate keep an aircraft, and each of
     them is a boarding aircraft (jet bridge docked, cabin lit even by day, a power unit, a catering truck and a baggage train at it). Every other stand is empty (its bridge is parked), and there are no remote stands. */
  Ly.stands.forEach((st,i)=>{ if(i===Ly.gate||i===Ly.empty) return; const r=i-Ly.gate; if(Math.abs(r)!==1) return; const key=FV_BY[r]||(((i+ofs)%3===0)?"a380":"b737"), L=GEO[key].L,
    e={st:"stand",i,key,x:sg*(Ly.xn-L/2),z:st.z,ry:-sg*half,lod:0,pal:liv(i),fl:{beacon:false},boarding:true}; E.push(e); by[i]=e; });
  /* v18: no aircraft on the taxiways or near the runway: the way out to the runway and the take-off stay clear (the owner asked for an empty runway) */
  return Ly._fvp={E,by};
}
function fvDecim(key,cell){
  const ck=key+"|"+cell; if(FV.dec[ck]) return FV.dec[ck]; const b=apJetBake(key), o={}, W={body:1,wing:1.5,tail:1,stripe:1,engine:1,detail:1.5,glass:1.6};
  for(const r in W){ const g=b.geo[r]; if(!g) continue; const ex=[]; if(r==="body") ex.push({arr:b.t,size:1}); else if(g.attributes.color) ex.push({arr:g.attributes.color.array,size:3}); const d=apDecimate(g,cell*W[r],ex); o[r]={g:d.g,e:d.ex[0]||null}; }
  return FV.dec[ck]=o;
}
function fvAcc(){ return {p:[],n:[],c:[],u:[],i:[],nv:0}; }
/* append geometry g (nose -z, centred) rotated by ry about y and moved to (tx,0,tz); cf(i) gives the vertex colour */
function fvAdd(a,g,ry,tx,tz,cf,uv){
  const P=g.attributes.position.array, N=g.attributes.normal.array, I=g.index.array, n=P.length/3, cs=Math.cos(ry), sn=Math.sin(ry), b=a.nv, U=uv&&g.attributes.uv?g.attributes.uv.array:null;
  for(let i=0;i<n;i++){ const x=P[i*3], z=P[i*3+2], nx=N[i*3], nz=N[i*3+2]; a.p.push(x*cs+z*sn+tx,P[i*3+1],-x*sn+z*cs+tz); a.n.push(nx*cs+nz*sn,N[i*3+1],-nx*sn+nz*cs); if(cf){ const c=cf(i); a.c.push(c[0],c[1],c[2]); } if(U) a.u.push(U[i*2],U[i*2+1]); }
  for(let i=0;i<I.length;i++) a.i.push(I[i]+b); a.nv+=n;
}
function fvBox(a,cx,cy,cz,sx,sy,sz,col){   /* axis-aligned box in world axes (flat shaded) */
  const h=[sx/2,sy/2,sz/2], c=[cx,cy,cz];
  for(let ax=0;ax<3;ax++) for(const s of [-1,1]){ const u=(ax+1)%3, v=(ax+2)%3, b=a.nv;
    [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(q=>{ const p=[0,0,0], nn=[0,0,0]; p[ax]=c[ax]+s*h[ax]; p[u]=c[u]+q[0]*h[u]; p[v]=c[v]+q[1]*h[v]; nn[ax]=s; a.p.push(p[0],p[1],p[2]); a.n.push(nn[0],nn[1],nn[2]); a.c.push(col[0],col[1],col[2]); });
    if(s>0) a.i.push(b,b+1,b+2,b,b+2,b+3); else a.i.push(b,b+2,b+1,b,b+3,b+2); a.nv+=4; }
}
function fvMesh(a,mat,ord){
  if(!a.nv) return null; const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(a.p,3)); g.setAttribute("normal",new THREE.Float32BufferAttribute(a.n,3)); if(a.c.length) g.setAttribute("color",new THREE.Float32BufferAttribute(a.c,3)); if(a.u.length) g.setAttribute("uv",new THREE.Float32BufferAttribute(a.u,2));
  g.setIndex(a.nv>65535?new THREE.Uint32BufferAttribute(a.i,1):new THREE.Uint16BufferAttribute(a.i,1)); g.computeBoundingSphere(); const m=new THREE.Mesh(g,mat); m.raycast=()=>{}; if(ord) m.renderOrder=ord; FV.tris+=a.i.length/3; FV.calls++; return m;
}
/* soft top-down aircraft silhouette (blurred) for the contact shadow; nose at the bottom of the canvas (v = fraction from the nose) */
function fvShadowTex(){ return fwMkCanvasTex(128,128,(g,w,h)=>{ g.clearRect(0,0,w,h); g.fillStyle="#000"; g.shadowColor="#000"; g.shadowBlur=6; const X=f=>f*w, Y=f=>(1-f)*h;
  g.beginPath(); g.ellipse(X(0.5),h/2,w*0.052,h*0.455,0,0,7); g.fill();
  [1,-1].forEach(s=>{ g.beginPath(); g.moveTo(X(0.5+s*0.04),Y(0.38)); g.lineTo(X(0.5+s*0.46),Y(0.55)); g.lineTo(X(0.5+s*0.46),Y(0.6)); g.lineTo(X(0.5+s*0.04),Y(0.52)); g.fill();
    g.beginPath(); g.moveTo(X(0.5+s*0.02),Y(0.87)); g.lineTo(X(0.5+s*0.2),Y(0.94)); g.lineTo(X(0.5+s*0.2),Y(0.97)); g.lineTo(X(0.5+s*0.02),Y(0.94)); g.fill(); }); },false); }
function fvMats(AU){
  if(FV.mats&&FV.AU===AU) return FV.mats; FV.AU=AU; const std=o=>fgPatchFog(new THREE.MeshStandardMaterial(Object.assign({side:THREE.DoubleSide},o)),AU);
  const M=FV.mats={paint:std({vertexColors:true,roughness:0.42,metalness:0.14}),detail:std({vertexColors:true,roughness:0.5,metalness:0.3}),glass:std({color:apLin("#17242f"),roughness:0.08,metalness:0.4}),win:{},
    shadow:new THREE.MeshBasicMaterial({color:0x000000,map:fvShadowTex(),transparent:true,opacity:0.3,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})};
  fvEnvSet(M); return M;
}
function fvEnvSet(M){ M=M||FV.mats; if(!M) return; [M.paint,M.detail,M.glass].concat(Object.values(M.win)).forEach(m=>{ m.envMap=FV.env; m.envMapIntensity=FV.envK; m.needsUpdate=true; }); }
function fvEnv(tex,k){ FV.env=tex; FV.envK=k; fvEnvSet(); }
function fvWinMat(key0,M){
  const key=key0.split("|")[0]; if(M.win[key0]) return M.win[key0]; const b=apJetBake(key), m=fgPatchFog(new THREE.MeshStandardMaterial({map:b.win,alphaTest:0.5,roughness:0.2,metalness:0.3,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2,emissive:new THREE.Color(1,0.78,0.42),emissiveIntensity:FV.glow}),M.AU||FV.AU);
  m.envMap=FV.env; m.envMapIntensity=FV.envK; if(key0!==key) m.emissiveIntensity=Math.max(FV.glow,0.6); return M.win[key0]=m;
}
/* cabin windows glow at night (called with the airport window glow, 0 by day) and the contact shadow gets fainter */
function fvGlow(k){ FV.glow=k; if(!FV.mats) return; Object.keys(FV.mats.win).forEach(kk=>{ FV.mats.win[kk].emissiveIntensity=kk.indexOf("|b")>0?Math.max(k,0.6):k; }); FV.mats.shadow.opacity=0.3-0.14*Math.min(1,k); }
/* the ground equipment of one stand (boxes, vertex coloured): a power unit at the nose, a baggage train forward of the right cargo door, cones at the wing tips. u = metres from the nose to the tail, v = to the aircraft's right. */
function fvGse(a,e,Ly,d){
  const sg=Ly.sg, xn=Ly.xn, zc=e.z, hw=d.hw, B=(u,v,y,l,w,h,c)=>fvBox(a,sg*(xn-u),y+h/2,zc+sg*v,l,h,w,fvCol(c));
  B(3.6,hw+1.7,0,2.8,1.5,1.4,"#d9a400"); B(3.6,hw+1.7,1.4,1.6,1.1,0.25,"#2a2e32");
  const u0=Math.max(d.cX-4,2.5), v=hw+3.1, bag=["#2f4a66","#6b4e3d","#3b3f45","#7a2f2f"];
  B(d.cX+0.4,v-0.2,0.3,5.2,1.7,0.55,"#8a9298"); B(d.cX+0.4,v-0.2,0.85,5.0,1.5,0.14,"#23272b");
  for(let k=0;k<3;k++){ const u=u0+(k?-1:0)*0-(k*3.7); B(u,v,0.3,3.1,1.9,0.5,"#8a9298"); B(u,v,0.8,2.6,1.6,0.9,bag[(k+e.i)%4]); }
  B(u0-3*3.7,v,0,2.4,1.5,1.55,"#c8641a");
  if(e.boarding){ const u=d.L*0.74, v2=hw+3.4; B(u,v2,0.35,6.6,2.4,0.9,"#3a4047"); B(u+0.4,v2,1.25,5.8,2.25,2.5,"#e9ebec"); B(u-2.7,v2,1.25,1.5,2.0,1.5,"#c9ced2"); B(u+0.4,v2,3.75,5.6,2.1,0.25,"#9aa2a8"); }   /* the catering truck: chassis, box, cab */
  [[d.tipU,d.tipX+1.4],[d.tipU,-d.tipX-1.4],[d.L*0.5,hw+9],[d.L-3.5,0]].forEach(q=>B(q[0],q[1],0,0.5,0.5,0.7,"#ee5a10"));
}
/* the neighbours of the airport described by layout Ly at detail tier t: {group, lights:{P,C,A}} (tris and draw calls in FV.tris / FV.calls) */
function fvNbBuild(Ly,AU,tier){
  const M=fvMats(AU), plan=fvNbPlan(Ly), cl=FV_CELLS[tier], acc={paint:fvAcc(),detail:fvAcc(),glass:fvAcc()}, win={}, shd=fvAcc(), P=[], C=[], A=[], grp=new THREE.Group();
  FV.tris=0; FV.calls=0; FV.n=0; const lin=[0,0,0];
  plan.E.forEach(e=>{
    if(tier<1&&(e.st==="remote"||e.i===201)) return; if(tier<2&&e.st==="remote"&&e.i>100) return;
    const key=e.key, D=fvDecim(key,cl[e.lod]), b=apJetBake(key), d=fvDim(key), pal=e.pal, sk=fvCol(pal.skin), bl=fvCol(pal.belly), T=D.body.e; FV.n++;
    fvAdd(acc.paint,D.body.g,e.ry,e.x,e.z,i=>{ const t=T[i]; lin[0]=bl[0]+(sk[0]-bl[0])*t; lin[1]=bl[1]+(sk[1]-bl[1])*t; lin[2]=bl[2]+(sk[2]-bl[2])*t; return lin; });
    [["wing",pal.wing],["tail",pal.tail],["stripe",pal.stripe],["engine",pal.engine]].forEach(([r,h])=>{ if(D[r]){ const c=fvCol(h); fvAdd(acc.paint,D[r].g,e.ry,e.x,e.z,()=>c); } });
    if(D.detail){ const E3=D.detail.e; fvAdd(acc.detail,D.detail.g,e.ry,e.x,e.z,i=>{ lin[0]=E3[i*3]; lin[1]=E3[i*3+1]; lin[2]=E3[i*3+2]; return lin; }); }
    if(D.glass) fvAdd(acc.glass,D.glass.g,e.ry,e.x,e.z,null);
    if(b.geo.wtex&&(tier===2&&e.lod<=1||tier===1&&e.lod===0)){ const wk=key+(e.boarding?"|b":""); fvAdd(win[wk]||(win[wk]=fvAcc()),b.geo.wtex,e.ry,e.x,e.z,null,true); }
    if(e.st==="stand"&&tier>=1&&e.lod<=1) fvGse(acc.paint,e,Ly,d);
    /* contact shadow: one quad under the aircraft */
    { const cs=Math.cos(e.ry), sn=Math.sin(e.ry), hx=d.span*0.56, hz=d.L*0.53, b0=shd.nv; [[-1,-1,0,0],[1,-1,1,0],[1,1,1,1],[-1,1,0,1]].forEach(q=>{ const x=q[0]*hx, z=q[1]*hz; shd.p.push(x*cs+z*sn+e.x,0.05,-x*sn+z*cs+e.z); shd.n.push(0,1,0); shd.u.push(q[2],q[3]); }); shd.i.push(b0,b0+2,b0+1,b0,b0+3,b0+2); shd.nv+=4; }
    /* lights (model positions rotated into the world): nav lights steady; beacon / strobes / nose light per flags */
    const cs=Math.cos(e.ry), sn=Math.sin(e.ry), L=(x,y,z,c,s,code)=>{ P.push(x*cs+z*sn+e.x,y,-x*sn+z*cs+e.z); C.push(c[0],c[1],c[2]); A.push(s,code); };
    b.lp.forEach(q=>{ const wing=Math.abs(q[0])>10;
      if(q[3]===1&&wing) L(q[0],q[1],q[2],[1,0.1,0.06],0.5,0); else if(q[3]===2) L(q[0],q[1],q[2],[0.1,1,0.3],0.5,0);
      else if(q[3]===0&&wing){ L(q[0],q[1],q[2],[1,0.95,0.85],e.fl.strobe?0.8:0.4,e.fl.strobe?5:0); }
      else if(q[3]===1&&e.fl.beacon) L(q[0],q[1],q[2],[1,0.1,0.06],0.9,4);
      else if(q[3]===0&&e.fl.land) L(q[0],q[1],q[2],[1,0.95,0.85],1.1,0); });
  });
  [[acc.paint,M.paint],[acc.detail,M.detail],[acc.glass,M.glass]].forEach(([a,m])=>{ const o=fvMesh(a,m); if(o) grp.add(o); });
  Object.keys(win).forEach(k=>{ const o=fvMesh(win[k],fvWinMat(k,M)); if(o) grp.add(o); });
  { const o=fvMesh(shd,M.shadow,1); if(o) grp.add(o); }
  return {group:grp,lights:{P,C,A}};
}
function fvNbDispose(grp){ grp.traverse(o=>{ if(o.geometry) o.geometry.dispose(); }); }
