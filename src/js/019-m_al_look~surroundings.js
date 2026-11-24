/* ---------- surroundings: horizon haze ring, dunes, perimeter fence, windsocks, hangars, cargo sheds, fuel farm, palms and shrubs, apron high masts ---------- */
function apPalmGeo(seed){
  let s=seed||7; const rnd=()=>{ s=(s*16807)%2147483647; return s/2147483647; }, PI=Math.PI, gs=[];
  const H=7+rnd()*3.5, lean=(rnd()-0.5)*0.35, tr=new THREE.CylinderGeometry(0.2,0.34,H,7,3); { const p=tr.attributes.position; for(let i=0;i<p.count;i++){ const t=(p.getY(i)+H/2)/H; p.setX(i,p.getX(i)+lean*t*t*H*0.5); } tr.translate(0,H/2,0); gs.push(tr); }
  const top=new THREE.Vector3(lean*H*0.5,H,0), N=11+Math.floor(rnd()*3);
  for(let k=0;k<N;k++){ const a=k/N*PI*2+rnd()*0.4, len=4.2+rnd()*1.4, up=0.9-rnd()*0.9, P=[], U=[], I=[];
    for(let q=0;q<=4;q++){ const t=q/4, r=len*t, y=len*(up*0.45*t-0.95*t*t*(0.6+0.4*up)), w=1.5*(1-0.55*t); const ca=Math.cos(a), sa=Math.sin(a); P.push(top.x+ca*r-sa*w*0.5,top.y+y,top.z+sa*r+ca*w*0.5, top.x+ca*r+sa*w*0.5,top.y+y,top.z+sa*r-ca*w*0.5); U.push(0,t,1,t); }
    for(let q=0;q<4;q++){ const b=q*2; I.push(b,b+1,b+2,b+1,b+3,b+2); } const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(P,3)); g.setAttribute("uv",new THREE.Float32BufferAttribute(U,2)); g.setIndex(I); g.computeVertexNormals(); gs.push(g); }
  return gs;   /* [0] trunk, rest fronds */
}
function apSurround(X){
  const {a380,L,zF,zN,zTL,zTW,zRW,zApEnd,tW,mp,conMat,sandMat,dayFog}=X, PI=Math.PI, G=new THREE.Group(), night=[];
  const Mt=(c,r,m,o)=>new THREE.MeshStandardMaterial(Object.assign({color:apLin(c),roughness:r===undefined?0.8:r,metalness:m||0},o||{}));
  const noRay=(o)=>{ o.raycast=()=>{}; return o; };
  let seed=29; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  /* ---- horizon haze: a camera-centred open cylinder fading from the ground colour into the sky colour; hides the finite edge of the desert/sea planes ---- */
  const hzT=(dk)=>{ const cv=document.createElement("canvas"); cv.width=4; cv.height=128; const g=cv.getContext("2d"); const gr=g.createLinearGradient(0,0,0,128), c=dk?[33,47,66]:[226,232,230], t=dk?[30,46,66]:[214,228,240];
    gr.addColorStop(0,`rgba(${t[0]},${t[1]},${t[2]},0)`); gr.addColorStop(0.4,`rgba(${t[0]},${t[1]},${t[2]},0.18)`); gr.addColorStop(0.78,`rgba(${c[0]},${c[1]},${c[2]},0.78)`); gr.addColorStop(1,`rgba(${c[0]},${c[1]},${c[2]},1)`); g.fillStyle=gr; g.fillRect(0,0,4,128); const x=new THREE.CanvasTexture(cv); x.encoding=THREE.sRGBEncoding; return x; };
  const hzD=hzT(false), hzN=hzT(true), hzM=new THREE.MeshBasicMaterial({map:hzD,transparent:true,depthWrite:false,side:THREE.BackSide,fog:false,toneMapped:false});
  const haze=noRay(new THREE.Mesh(new THREE.CylinderGeometry(3300,3300,560,48,1,true).translate(0,150,0),hzM)); haze.renderOrder=5; haze.frustumCulled=false; G.add(haze);
  /* ---- dunes behind the runway and on both sides: smooth height fields that fade to flat towards the airfield ---- */
  const dune=(x0,x1,z0,z1,fade)=>{ const nx=70, nz=28, g=new THREE.PlaneGeometry(x1-x0,z1-z0,nx,nz).rotateX(-PI/2), p=g.attributes.position;
    for(let i=0;i<p.count;i++){ const x=p.getX(i)+(x0+x1)/2, z=p.getZ(i)+(z0+z1)/2, f=Math.min(1,Math.max(0,fade(x,z))), n=Math.sin(x/210+1.3)*Math.cos(z/170)*0.55+Math.sin(x/83+z/121)*0.3+Math.sin(x/37-z/53)*0.1+0.35; p.setY(i,Math.max(0,n)*34*f*f); }
    const u=g.attributes.uv; for(let i=0;i<u.count;i++){ u.setX(i,u.getX(i)*(x1-x0)/6000); u.setY(i,u.getY(i)*(z1-z0)/6000); } g.computeVertexNormals();
    const m=noRay(new THREE.Mesh(g,sandMat)); m.position.set((x0+x1)/2,-0.06,(z0+z1)/2); G.add(m); return m; };
  dune(-3200,3200,zRW+260,zRW+1900,(x,z)=>(z-zRW-260)/700); dune(2350,3200,-500,zRW+260,(x,z)=>(x-2350)/500); dune(-3200,-2350,-500,zRW+260,(x,z)=>(-2350-x)/500);
  /* ---- chain-link fence along the airfield boundary behind the runway ---- */
  { const fT=(()=>{ const cv=document.createElement("canvas"); cv.width=64; cv.height=64; const g=cv.getContext("2d"); g.strokeStyle="rgba(150,156,160,0.9)"; g.lineWidth=2; for(let i=-64;i<128;i+=16){ g.beginPath(); g.moveTo(i,0); g.lineTo(i+64,64); g.stroke(); g.beginPath(); g.moveTo(i+64,0); g.lineTo(i,64); g.stroke(); } const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.encoding=THREE.sRGBEncoding; t.repeat.set(1500,1); t.anisotropy=4; return t; })();
    const fz=zRW+95, fm=noRay(new THREE.Mesh(new THREE.PlaneGeometry(4600,2.4),new THREE.MeshBasicMaterial({map:fT,transparent:true,alphaTest:0.3,side:THREE.DoubleSide,depthWrite:false}))); fm.position.set(0,1.3,fz); G.add(fm);
    const ps=[]; for(let x=-2300;x<=2300;x+=20) ps.push(new THREE.BoxGeometry(0.12,2.7,0.12).translate(x,1.35,fz)); ps.push(new THREE.BoxGeometry(4600,0.08,0.08).translate(0,2.65,fz)); G.add(noRay(new THREE.Mesh(apMergeG(ps),Mt("#8d949a",0.6,0.4)))); }
  /* ---- windsocks ---- */
  { const sT=(()=>{ const cv=document.createElement("canvas"); cv.width=64; cv.height=64; const g=cv.getContext("2d"); for(let i=0;i<5;i++){ g.fillStyle=i%2?"#f4f4f0":"#ee6a14"; g.fillRect(0,i*13,64,13); } const t=new THREE.CanvasTexture(cv); t.encoding=THREE.sRGBEncoding; return t; })();
    const sm=new THREE.MeshStandardMaterial({map:sT,roughness:0.8,side:THREE.DoubleSide}), pm=Mt("#d8dadb",0.5);
    [[-880,zRW-70,0.5],[1150,zRW-70,-0.3],[a380?-420:-330,zApEnd-6,0.8]].forEach(([x,z,ry])=>{ const g=new THREE.Group(); g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.14,7,8).translate(0,3.5,0),pm)); g.add(new THREE.Mesh(new THREE.TorusGeometry(0.55,0.04,6,14).rotateY(PI/2).translate(0.15,7.2,0),pm));
      const cn=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.22,3.2,12,5,true).rotateZ(-PI/2).translate(1.9,7.1,0),sm); g.add(cn); g.position.set(x,0,z); g.rotation.y=ry; g.traverse(o=>{ if(o.isMesh) o.raycast=()=>{}; }); G.add(g); }); }
  /* ---- buildings: hangars with arched roofs, cargo sheds with dock doors, a fuel farm ---- */
  const wallT=(()=>{ const cv=document.createElement("canvas"); cv.width=128; cv.height=32; const g=cv.getContext("2d"); g.fillStyle="#d4d8d9"; g.fillRect(0,0,128,32); for(let i=0;i<32;i++){ g.fillStyle=i%2?"rgba(0,0,0,0.10)":"rgba(255,255,255,0.12)"; g.fillRect(i*4,0,2,32); } const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.encoding=THREE.sRGBEncoding; t.repeat.set(30,1); return t; })();
  const wall=new THREE.MeshStandardMaterial({map:wallT,roughness:0.7,metalness:0.1}), roofM=Mt("#b6bec3",0.55,0.3), doorM=Mt("#4b535a",0.6,0.3), darkM=Mt("#2a2f33",0.7), stM=Mt("#9aa2a8",0.5,0.4), tankM=Mt("#e6e8e6",0.4,0.3), bund=Mt("#8f9396",0.9);
  const bg=new THREE.Group(), add=(g,mt,x,y,z)=>{ const o=new THREE.Mesh(g,mt); o.position.set(x,y,z); bg.add(o); return o; };
  const hangar=(cx,cz,len,span,wh,rise,face)=>{ add(new THREE.BoxGeometry(len,wh,span),wall,cx,wh/2,cz);
    const sh=new THREE.Shape(); sh.absellipse(0,0,span/2,rise,0,PI,false); sh.lineTo(span/2,0); const ge=new THREE.ExtrudeGeometry(sh,{depth:len,bevelEnabled:false,curveSegments:14}); ge.translate(0,0,-len/2); ge.rotateY(PI/2); add(ge,roofM,cx,wh,cz);
    add(new THREE.BoxGeometry(0.4,wh*0.85,span*0.78),doorM,cx+face*(len/2+0.1),wh*0.45,cz); for(let i=0;i<6;i++) add(new THREE.BoxGeometry(0.1,wh*0.85,0.12),darkM,cx+face*(len/2+0.28),wh*0.45,cz-span*0.39+i*span*0.78/5); };
  const shed=(cx,cz,len,span,h,face)=>{ add(new THREE.BoxGeometry(len,h,span),wall,cx,h/2,cz); add(new THREE.BoxGeometry(len+1,0.5,span+1),roofM,cx,h+0.25,cz); for(let i=0;i<8;i++) add(new THREE.BoxGeometry(0.3,3.4,4.2),doorM,cx+face*(len/2+0.1),1.7,cz-span/2+3+i*(span-6)/7); add(new THREE.BoxGeometry(2.4,0.3,span),stM,cx+face*(len/2+1.2),3.6,cz); };
  const rx=tW/2+120, lx=-(tW/2+260);
  hangar(rx,zN+34,84,66,18,9,-1); hangar(rx+96,zN+34,84,66,18,9,-1); shed(lx,zN+30,24,92,11,1); shed(lx-40,zN+30,24,92,11,1);
  { const fx=lx-150, fz=zTL-10; for(let i=0;i<3;i++) for(let j=0;j<2;j++){ const x=fx-40+i*40, z=fz-20+j*40; add(new THREE.CylinderGeometry(9.5,9.5,15,24),tankM,x,7.5,z); add(new THREE.ConeGeometry(9.7,3,24),stM,x,16.5,z); add(new THREE.TorusGeometry(9.6,0.15,4,24).rotateX(PI/2),stM,x,10,z); add(new THREE.CylinderGeometry(0.3,0.3,15,6),stM,x+9.8,7.5,z); }
    [[0,-45,150,0.3],[0,45,150,0.3]].forEach(([dx,dz,w])=>add(new THREE.BoxGeometry(w,1.2,0.6),bund,fx,0.6,fz+dz)); [-75,75].forEach(dx=>add(new THREE.BoxGeometry(0.6,1.2,90),bund,fx+dx,0.6,fz)); add(new THREE.BoxGeometry(150,0.4,2),stM,fx,3,fz+0); add(new THREE.BoxGeometry(3,3,6),wall,fx+60,1.5,fz+50); }
  const cT=conMat.map.clone(); cT.needsUpdate=true; cT.repeat.set(1,1); const padM=new THREE.MeshStandardMaterial({map:cT,roughness:0.92}); [[rx+48,zN+34,260,150],[lx-20,zN+30,120,130],[lx-150,zTL-10,180,120]].forEach(([x,z,w,d])=>{ const m=noRay(new THREE.Mesh(new THREE.PlaneGeometry(w,d).rotateX(-PI/2),padM)); m.position.set(x,-0.015,z); m.receiveShadow=true; const u=m.geometry.attributes.uv; for(let i=0;i<u.count;i++){ u.setX(i,u.getX(i)*w/20); u.setY(i,u.getY(i)*d/20); } G.add(m); });
  G.add(apMerge(bg,{cast:false,recv:false}));
  /* ---- palms (feather-textured fronds) and low shrubs ---- */
  { const fT=(()=>{ const cv=document.createElement("canvas"); cv.width=64; cv.height=128; const g=cv.getContext("2d"); g.clearRect(0,0,64,128); g.fillStyle="#356f2b"; for(let y=2;y<128;y+=3){ const w=31*Math.pow(1-y/140,0.7); g.beginPath(); g.moveTo(32,y); g.lineTo(32-w,y+11); g.lineTo(32-w+1,y+13); g.lineTo(32,y+4); g.lineTo(32+w-1,y+13); g.lineTo(32+w,y+11); g.closePath(); g.fill(); } g.fillStyle="#2a5a22"; g.fillRect(31,0,2,128);
    const t=new THREE.CanvasTexture(cv); t.encoding=THREE.sRGBEncoding; return t; })();
    const fm=new THREE.MeshStandardMaterial({map:fT,alphaTest:0.35,side:THREE.DoubleSide,roughness:0.8}), tm=Mt("#8a6d4c",0.9), V=[apPalmGeo(3),apPalmGeo(11),apPalmGeo(19)], trunks=[], fronds=[];
    const palm=(x,z,sc)=>{ const v=V[Math.floor(rnd()*3)], ry=rnd()*PI*2, mt=new THREE.Matrix4().makeRotationY(ry).setPosition(x,0,z).multiply(new THREE.Matrix4().makeScale(sc,sc,sc)); v.forEach((g,i)=>{ const c=g.clone().applyMatrix4(mt); (i?fronds:trunks).push(c); }); };
    for(let i=0;i<7;i++) [-1,1].forEach(s=>palm(s*(tW/2+10+i*12),zF-30-((i*7)%5)*14,0.9+rnd()*0.3));
    for(let i=0;i<24;i++){ const s=i%2?1:-1; palm(s*(620+rnd()*260),zN-30+rnd()*(zTL-zN+40),0.8+rnd()*0.5); }
    for(let i=0;i<10;i++) palm(-100+i*22+rnd()*8,zF-100-rnd()*30,0.9+rnd()*0.3);
    const tm2=apMergeG(trunks.map(g=>{ if(!g.attributes.uv) g.setAttribute("uv",new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2)); return g; })); G.add(noRay(new THREE.Mesh(tm2,tm)));
    G.add(noRay(new THREE.Mesh(apMergeG(fronds),fm)));
    const sg=[]; for(let i=0;i<70;i++){ const x=(rnd()-0.5)*1700, z=(rnd()<0.5?zF-20-rnd()*60:zApEnd+4+rnd()*8), r=0.5+rnd()*0.9; if(Math.abs(x)<tW/2-20&&z<zF) continue; sg.push(new THREE.IcosahedronGeometry(r,1).scale(1,0.7,1).translate(x,r*0.5,z)); }
    G.add(noRay(new THREE.Mesh(apMergeG(sg),Mt("#4a6b3a",0.95)))); }
  /* ---- apron high masts: tapered 12-sided shaft, head ring with a cluster of angled floodlights ---- */
  { const mg=[], lg=[]; mp.forEach(([x,z])=>{ mg.push(new THREE.CylinderGeometry(0.28,0.5,32,12).translate(x,16,z)); mg.push(new THREE.CylinderGeometry(1.4,1.4,0.25,16).translate(x,32.2,z)); mg.push(new THREE.CylinderGeometry(0.7,0.7,1.2,12).translate(x,0.6,z));
      for(let k=0;k<8;k++){ const a=k/8*PI*2, lx=x+Math.cos(a)*1.25, lz=z+Math.sin(a)*1.25; mg.push(new THREE.BoxGeometry(0.9,0.5,0.7).rotateY(-a).translate(0,0,0).translate(lx,32.55,lz)); lg.push(new THREE.PlaneGeometry(0.7,0.35).rotateX(0.5).rotateY(PI/2-a).translate(lx+Math.cos(a)*0.5,32.35,lz+Math.sin(a)*0.5)); } });
    G.add(noRay(new THREE.Mesh(apMergeG(mg.map(g=>{ if(!g.index){ g.setIndex([...Array(g.attributes.position.count).keys()]); } return g; })),Mt("#8f979d",0.5,0.5)))); const lm=new THREE.MeshBasicMaterial({color:0xcfd6da,toneMapped:false,side:THREE.DoubleSide}); G.add(noRay(new THREE.Mesh(apMergeG(lg),lm))); night.push(on=>lm.color.set(on?0xfff0c8:0xcfd6da)); }
  /* stars on the night sky (follow the camera) */
  const sp=[]; for(let i=0;i<700;i++){ const u=rnd(), v=rnd(), th=u*PI*2, ph=Math.acos(0.04+0.96*v); sp.push(Math.sin(ph)*Math.cos(th)*1700,Math.cos(ph)*1700,Math.sin(ph)*Math.sin(th)*1700); }
  const sg=new THREE.BufferGeometry(); sg.setAttribute("position",new THREE.Float32BufferAttribute(sp,3)); const stars=noRay(new THREE.Points(sg,new THREE.PointsMaterial({color:0xdfe8ff,size:1.7,sizeAttenuation:false,transparent:true,opacity:0.8,depthWrite:false,fog:false}))); stars.frustumCulled=false; stars.visible=false; stars.renderOrder=-5; G.add(stars);
  return {group:G, update(cam){ haze.position.set(cam.x,0,cam.z); stars.position.set(cam.x,0,cam.z); },
    night(on){ hzM.map=on?hzN:hzD; hzM.needsUpdate=true; stars.visible=on; night.forEach(f=>f(on)); } };
}
