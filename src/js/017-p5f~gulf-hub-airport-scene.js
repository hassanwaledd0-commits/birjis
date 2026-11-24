/* ---------- Gulf hub airport scene (in the style of Doha and Abu Dhabi).
   Nose-in stands: the aircraft stops with its nose towards a glass terminal front. Apron-drive jet bridges run from rotundas on the
   terminal to the real left-side doors. Ground equipment stands where it does in service (all on the right side, away from engines and wing).
   buildAirport() also returns `boxes`: oriented collision boxes for everything on the apron, used by tests/ap_collide.py. ---------- */
function apTex(w,h,draw,rep,enc){ const cv=document.createElement("canvas"); cv.width=w; cv.height=h; draw(cv.getContext("2d",{willReadFrequently:true}),w,h); const t=new THREE.CanvasTexture(cv);
  if(enc!==false) t.encoding=THREE.sRGBEncoding; t.wrapS=t.wrapT=THREE.RepeatWrapping; if(rep) t.repeat.set(rep[0],rep[1]); t.anisotropy=4; return t; }
/* (v36) grain written straight into the pixels (one read, one write) instead of 10-25 thousand fillRect calls with a new colour string each: same look, ~15x faster */
function apNoise(g,w,h,n,a,b,al){
  al=al||1; let img=null; try{ img=g.getImageData(0,0,w,h); }catch(e){ img=null; }
  if(!img){ for(let i=0;i<n;i++){ const v=a+Math.random()*(b-a)|0; g.fillStyle=`rgba(${v},${v},${v},${al})`; g.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1+Math.random()*2); } return; }
  const d=img.data;
  for(let i=0;i<n;i++){
    const v=a+Math.random()*(b-a)|0, x0=Math.random()*w, y0=Math.random()*h, xs=x0|0, ys=y0|0, xe=Math.min(w,Math.ceil(x0+1+Math.random()*2)), ye=Math.min(h,Math.ceil(y0+1+Math.random()*2));
    for(let y=ys;y<ye;y++){ let q=(y*w+xs)*4; for(let x=xs;x<xe;x++,q+=4){ const da=d[q+3]; if(da===255){ d[q]+=(v-d[q])*al; d[q+1]+=(v-d[q+1])*al; d[q+2]+=(v-d[q+2])*al; } else { const dk=da/255, oa=al+dk*(1-al); d[q]=(v*al+d[q]*dk*(1-al))/oa; d[q+1]=(v*al+d[q+1]*dk*(1-al))/oa; d[q+2]=(v*al+d[q+2]*dk*(1-al))/oa; d[q+3]=oa*255; } } }
  }
  g.putImageData(img,0,0);
}
function glowTex(){ return apTex(64,64,(g,w,h)=>{ const r=g.createRadialGradient(32,32,0,32,32,32); r.addColorStop(0,"rgba(255,255,255,1)"); r.addColorStop(0.25,"rgba(255,255,255,0.65)"); r.addColorStop(1,"rgba(255,255,255,0)"); g.fillStyle=r; g.fillRect(0,0,w,h); },null,false); }
/* bake a group of static meshes into one mesh per material (fewer draw calls; everything here is scenery) */
function apMerge(src,opt){
  opt=opt||{}; src.updateMatrixWorld(true); const inv=new THREE.Matrix4().copy(src.matrixWorld).invert(), by=new Map();
  src.traverse(o=>{ if(!o.isMesh||Array.isArray(o.material)) return; let g=o.geometry.clone(); g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld)); if(g.index) g=g.toNonIndexed(); if(!g.attributes.normal) g.computeVertexNormals();
    const k=o.material.uuid; if(!by.has(k)) by.set(k,{mat:o.material,gs:[],rs:o.receiveShadow}); by.get(k).gs.push(g); });
  const out=new THREE.Group();
  by.forEach(({mat,gs,rs})=>{ let n=0; gs.forEach(g=>n+=g.attributes.position.count); const P=new Float32Array(n*3), N=new Float32Array(n*3), U=new Float32Array(n*2); let o=0;
    gs.forEach(g=>{ const c=g.attributes.position.count; P.set(g.attributes.position.array.subarray(0,c*3),o*3); N.set(g.attributes.normal.array.subarray(0,c*3),o*3); if(g.attributes.uv) U.set(g.attributes.uv.array.subarray(0,c*2),o*2); o+=c; g.dispose(); });
    const mg=new THREE.BufferGeometry(); mg.setAttribute("position",new THREE.BufferAttribute(P,3)); mg.setAttribute("normal",new THREE.BufferAttribute(N,3)); mg.setAttribute("uv",new THREE.BufferAttribute(U,2)); mg.computeBoundingSphere();
    const m=new THREE.Mesh(mg,mat); m.receiveShadow=opt.recv!==undefined?opt.recv:!!rs; m.castShadow=!!opt.cast; m.raycast=()=>{}; out.add(m); });
  return out;
}

const AP_GSE=false;   /* v19: ground equipment around the parked aircraft off */
function buildAirport(c){
  AP_NITE.length=0;
  const G=new THREE.Group(), a380=c.L>60, jb=c===GEO.b747, L=c.L, half=c.span/2, V=THREE.Vector3, PI=Math.PI;
  const boxes=[], slots=[], lights=[], termG=new THREE.Group();
  const M=(o)=>{ if(typeof o.color==="string") o=Object.assign({},o,{color:apLin(o.color)}); return new THREE.MeshStandardMaterial(Object.assign({roughness:0.8,metalness:0},o)); };
  const MCc={}, MC=(col,r,m)=>{ const k=col+"|"+(r||0.6)+"|"+(m||0); return MCc[k]||(MCc[k]=M({color:col,roughness:r||0.6,metalness:m||0})); };
  const put=(grp,geo,mat,x,y,z)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); grp.add(m); return m; };
  const add=(geo,mat,x,y,z,o)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); if(o&&o.ry) m.rotation.y=o.ry; m.receiveShadow=!!(o&&o.rs); m.raycast=()=>{}; G.add(m); return m; };
  const BOX=(u,n,x,y,z,hx,hy,hz,ry,m)=>boxes.push({n:u+":"+n,u,c:[x,y,z],h:[hx,hy,hz],ry:ry||0,m});

  /* ---------- layout (metres; nose of the main aircraft towards -z, terminal front at zF) ---------- */
  const gap=a380?12:10, zN=-L/2, zF=zN-gap;                       /* nose-to-facade distance */
  const zR0=zF+5.4, zR1=zR0+(a380?3.4:3.0);                         /* service road in front of the nose */
  const clr=a380?3.75:2.25, Sw=half+clr;                            /* stand half width: wingtip clearance 7.5 m (code E/F) or 4.5 m (code C) between neighbours */
  const cN=GEO.b737, NB=(a380?[[-1,1.65,0],[1,1.5,1]]:[[-1,0.96,2],[1,1.04,3]]).map(([s,k,pi])=>{ const Nw=cN.span*k/2+clr; return {s,k,pal:AP_PAL[pi],Nw,cx:s*(Sw+Nw),LN:cN.L*k}; });
  const sp=(Sw+NB[0].Nw+Sw+NB[1].Nw)/2, spL=NB[0].cx, spR=NB[1].cx;
  const zTL=L/2+(a380?58:38), zTW=L/2+(a380?170:130), zRW=zTW+180, zRear=L/2+(a380?14:10), zApEnd=zTW-13-7.5-1.5;
  const skinX=(d)=>sidePoint(c,d.X,d.z).x;                          /* where the fuselage skin is at a door (right side, +x) */

  /* ---------- materials ---------- */
  const white=MC("#eef0f0",0.5), steel=MC("#9ca4aa",0.5,0.1), dark=MC("#2b3136",0.6), rubber=MC("#1b1e21",0.9), hub=MC("#9aa3a9",0.4,0.3), glassDark=MC("#1d2b36",0.1,0.5);
  const YEL=MC("#f2c230",0.55), ORG=MC("#e8742a",0.55), GRY=MC("#8f989e",0.6), BLU=MC("#3e6fa8",0.6), RED=MC("#c8322a",0.55);
  const glassT=(lit)=>apTex(512,256,(g,w,h)=>{ g.fillStyle=lit?"#2a2216":"#7b97a8"; g.fillRect(0,0,w,h); const grd=g.createLinearGradient(0,0,0,h); grd.addColorStop(0,lit?"rgba(255,200,120,0.85)":"rgba(220,240,250,0.55)"); grd.addColorStop(1,lit?"rgba(255,170,90,0.55)":"rgba(70,100,120,0.4)"); g.fillStyle=grd; g.fillRect(0,0,w,h);
    g.fillStyle=lit?"#1b160f":"#d7dde0"; for(let i=0;i<=16;i++) g.fillRect(i*w/16-1.5,0,3,h); for(let j=0;j<=4;j++) g.fillRect(0,j*h/4-1.5,w,3); },[1,1]);
  /* bridge tunnel side: white panel, a window strip in the middle */
  const tunT=(lit)=>apTex(512,128,(g,w,h)=>{ g.fillStyle=lit?"#cfc7bb":"#f1f3f3"; g.fillRect(0,0,w,h); const y0=h*0.3, y1=h*0.74; g.fillStyle=lit?"#ffc27a":"#6f8fa3"; g.fillRect(0,y0,w,y1-y0);
    g.fillStyle=lit?"#3a2c1c":"#dfe5e8"; for(let i=0;i<=14;i++) g.fillRect(i*w/14-2,y0,4,y1-y0); g.fillStyle="rgba(0,0,0,0.18)"; g.fillRect(0,y0-3,w,3); g.fillRect(0,y1,w,3); },null);
  const tW=a380?900:700;
  const glassDay=M({map:glassT(false),roughness:0.2,metalness:0.05}), glassNight=M({map:glassT(true),emissive:new THREE.Color("#ffb062"),emissiveIntensity:0.0,roughness:0.3,metalness:0.2});
  glassDay.map.repeat.set(tW/32,1); glassNight.map.repeat.set(tW/32,1);
  const tunDay=M({map:tunT(false),roughness:0.35,metalness:0.05}), tunNight=M({map:tunT(true),emissive:new THREE.Color("#ffb062"),emissiveIntensity:0,roughness:0.4});

  /* ---------- ground: desert, apron concrete, taxilane, taxiway, runway ---------- */
  const sandT=apTex(512,512,(g,w,h)=>{ g.fillStyle="#d9c49b"; g.fillRect(0,0,w,h); apNoise(g,w,h,16000,170,235,0.5); for(let i=0;i<40;i++){ g.strokeStyle="rgba(150,120,80,0.12)"; g.lineWidth=3; g.beginPath(); const y=Math.random()*h; g.moveTo(0,y); g.bezierCurveTo(w*0.3,y+30,w*0.6,y-30,w,y); g.stroke(); } },[60,60]);
  const seaZ=zF-520;
  const sand=add(new THREE.PlaneGeometry(6000,6000).rotateX(-PI/2),M({map:sandT}),0,-0.05,seaZ+3000,{rs:true});
  const sea=add(new THREE.PlaneGeometry(6000,3400).rotateX(-PI/2),M({color:"#3d7f98",roughness:0.22,metalness:0.1}),0,-0.08,seaZ-1700);
  const shore=add(new THREE.PlaneGeometry(6000,26).rotateX(-PI/2),M({color:"#e9e2c8",roughness:0.9}),0,-0.04,seaZ-6);
  /* apron concrete: 5 m slabs with joints, per-slab tone, grain, cracks, patches and oil stains (tile = 20 m) */
  const conT=apTex(512,512,(g,w,h)=>{ g.fillStyle="#9a9d9e"; g.fillRect(0,0,w,h); const sl=w/4;
    for(let i=0;i<4;i++) for(let j=0;j<4;j++){ const v=(Math.random()-0.5)*26, b=154+v; g.fillStyle=`rgb(${b},${b+1},${b-2})`; g.fillRect(i*sl,j*sl,sl,sl); }
    apNoise(g,w,h,22000,120,190,0.45); apNoise(g,w,h,6000,70,110,0.35);
    g.strokeStyle="rgba(50,54,58,0.55)"; g.lineWidth=2.2; for(let i=0;i<=4;i++){ g.beginPath(); g.moveTo(i*sl,0); g.lineTo(i*sl,h); g.stroke(); g.beginPath(); g.moveTo(0,i*sl); g.lineTo(w,i*sl); g.stroke(); }
    g.strokeStyle="rgba(235,235,230,0.22)"; g.lineWidth=1; for(let i=0;i<=4;i++){ g.beginPath(); g.moveTo(i*sl+2,0); g.lineTo(i*sl+2,h); g.stroke(); g.beginPath(); g.moveTo(0,i*sl+2); g.lineTo(w,i*sl+2); g.stroke(); }
    g.strokeStyle="rgba(40,42,44,0.38)"; g.lineWidth=1; for(let i=0;i<7;i++){ let x=Math.random()*w, y=Math.random()*h; g.beginPath(); g.moveTo(x,y); for(let k=0;k<6;k++){ x+=(Math.random()-0.5)*44; y+=(Math.random()-0.2)*36; g.lineTo(x,y); } g.stroke(); }
    for(let i=0;i<5;i++){ g.fillStyle=`rgba(${Math.random()<0.5?"30,32,34":"205,203,196"},0.06)`; g.fillRect(Math.random()*w,Math.random()*h,50+Math.random()*120,30+Math.random()*70); }
    for(let i=0;i<9;i++){ const x=Math.random()*w, y=Math.random()*h, r=6+Math.random()*16, gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,"rgba(34,34,36,0.42)"); gr.addColorStop(1,"rgba(34,34,36,0)"); g.fillStyle=gr; g.fillRect(x-r,y-r,2*r,2*r); } },[60,1]);
  const apW=1200, apD=zApEnd-zF; conT.repeat.set(apW/20,apD/20);
  const ap=add(new THREE.PlaneGeometry(apW,apD).rotateX(-PI/2),M({map:conT,roughness:0.92}),0,-0.02,zF+apD/2,{rs:true});

  /* ---------- terminal: long glass front facing the apron, undulating roof, signs, docking guidance display (hidden when the camera goes behind it) ---------- */
  const tD=90, tH=14;
  const term=new THREE.Mesh(new THREE.BoxGeometry(tW,tH,tD),[white,white,white,white,glassDay,white]); term.position.set(0,tH/2,zF-tD/2); term.userData.glass=1; term.raycast=()=>{}; termG.add(term);
  const wr=[], wi=[], NU=Math.round(tW/10), NV=12;
  for(let i=0;i<=NU;i++) for(let j=0;j<=NV;j++){ const x=-tW/2-10+(tW+20)*i/NU, zz=zF+5-(tD+30)*j/NV, f=j/NV, y=tH+1.6+7*Math.sin(f*PI*0.9)+2.6*Math.sin(x/38+f*2.2)*(0.4+f); wr.push(x,y,zz); }
  for(let i=0;i<NU;i++) for(let j=0;j<NV;j++){ const a=i*(NV+1)+j, b=a+1, cc=a+NV+1, d2=cc+1; wi.push(a,cc,b,b,cc,d2); }
  const wg=new THREE.BufferGeometry(); wg.setAttribute("position",new THREE.Float32BufferAttribute(wr,3)); wg.setIndex(wi); wg.computeVertexNormals(); { const uv=[]; for(let k=0;k<wr.length;k+=3) uv.push(wr[k]/14,wr[k+2]/14); wg.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2)); }
  const roofT=apTex(128,128,(g,w,h)=>{ g.fillStyle="#cfd3d2"; g.fillRect(0,0,w,h); for(let i=0;i<8;i++){ g.fillStyle="rgba(40,48,52,0.18)"; g.fillRect(i*16,0,2,h); g.fillStyle="rgba(255,255,255,0.18)"; g.fillRect(i*16+2,0,1,h); } apNoise(g,w,h,1200,150,215,0.4); },null), roofM=new THREE.MeshStandardMaterial({map:roofT,color:apLin("#e8ebea"),roughness:0.55,metalness:0.15,side:THREE.DoubleSide}), roof=new THREE.Mesh(wg,roofM); roof.raycast=()=>{}; termG.add(roof);
  { const cg=[]; for(let x=-tW/2;x<=tW/2+0.1;x+=9) cg.push(new THREE.BoxGeometry(0.55,tH,0.55).translate(x,tH/2,zF+0.4)); cg.push(new THREE.BoxGeometry(tW,0.3,0.5).translate(0,tH*0.5,zF+0.3)); cg.push(new THREE.BoxGeometry(tW,0.7,0.9).translate(0,tH-0.2,zF+0.5)); cg.push(new THREE.BoxGeometry(tW,0.9,0.7).translate(0,0.45,zF+0.4)); const cm=new THREE.Mesh(mergeG(cg),MC("#cfd3d4",0.5,0.3)); cm.raycast=()=>{}; termG.add(cm); }
  const sign=(txt,x,y,w,h)=>{ const t=apTex(256,96,(g,cw,ch)=>{ g.fillStyle="#12333f"; g.fillRect(0,0,cw,ch); g.fillStyle="#f4f4ef"; g.font="bold 64px sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillText(txt,cw/2,ch/2+4); g.strokeStyle="#c9a45c"; g.lineWidth=5; g.strokeRect(4,4,cw-8,ch-8); },null);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t})); m.position.set(x,y,zF+0.4); m.raycast=()=>{}; termG.add(m); };
  sign(a380?"A12":"C7",0,tH-2.2,4.4,1.65); sign(a380?"A11":"C6",spL,tH-2.2,4.4,1.65); sign(a380?"A13":"C8",spR,tH-2.2,4.4,1.65);
  const vdT=apTex(256,160,(g,w,h)=>{ g.fillStyle="#05080a"; g.fillRect(0,0,w,h); g.fillStyle="#ffb21a"; g.font="bold 54px monospace"; g.textAlign="center"; g.fillText(jb?"B744":a380?"A380":"B738",w/2,62); g.fillStyle="#ff3a2a"; g.fillRect(24,86,w-48,12); g.fillStyle="#32e07a"; g.fillRect(24,112,(w-48)*0.55,12); },null);
  const vd=new THREE.Mesh(new THREE.BoxGeometry(1.7,1.1,0.4),[dark,dark,dark,dark,new THREE.MeshBasicMaterial({map:vdT}),dark]); vd.position.set(0,a380?7.2:5.4,zF+0.45); vd.raycast=()=>{}; termG.add(vd);
  G.add(termG);
  BOX("terminal","front",0,tH/2,zF-tD/2,tW/2,tH/2,tD/2,0,0);
  /* control tower: slender shaft, flared cab with dark glass, mast */
  const tower=new THREE.Group(); const prof=[[3.2,0],[2.6,40],[2.2,78],[4.5,84],[7.5,90],[7.8,96],[6.0,100],[2.0,104],[0.6,118],[0.1,124]].map(([r,y])=>new THREE.Vector2(r,y));
  tower.add(new THREE.Mesh(new THREE.LatheGeometry(prof,28),M({color:"#e9eae6",roughness:0.45})));
  const cabG=new THREE.Mesh(new THREE.CylinderGeometry(7.75,7.4,6,28,1,true),M({color:"#1d2b36",roughness:0.1,metalness:0.7,emissive:new THREE.Color("#7fd0ff"),emissiveIntensity:0})); cabG.position.y=93; tower.add(cabG); cabG.userData.cab=1;
  tower.position.set(-(tW/2+110),0,zF-60); tower.traverse(m=>{ if(m.isMesh) m.raycast=()=>{}; }); G.add(tower);
  /* city skyline across the water */
  const skyT=(lit)=>apTex(64,256,(g,w,h)=>{ g.fillStyle=lit?"#0b0f16":"#8aa5b8"; g.fillRect(0,0,w,h); for(let y=4;y<h;y+=8) for(let x=3;x<w;x+=8){ g.fillStyle=lit?(Math.random()<0.55?`rgba(255,${190+Math.random()*50|0},120,${0.6+Math.random()*0.4})`:"rgba(30,40,55,1)"):(Math.random()<0.5?"#c6d6e0":"#6f8a9c"); g.fillRect(x,y,5,5); } },[1,1]);
  const skyDay=M({map:skyT(false),roughness:0.4}), skyNight=new THREE.MeshBasicMaterial({map:skyT(true),fog:false});
  const skyG=new THREE.Group(); let seed=11; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  for(let i=0;i<44;i++){ const h=60+Math.pow(rnd(),1.6)*280, w=18+rnd()*26, x=-1400+i*64+rnd()*20, z=seaZ-950-rnd()*420;
    put(skyG,new THREE.BoxGeometry(w,h,w),skyDay,x,h/2,z);
    if(rnd()<0.35) put(skyG,new THREE.ConeGeometry(w*0.35,h*0.25,6),skyDay,x,h+h*0.12,z); }
  [[-380,360,38],[130,440,30],[540,310,34],[-900,290,30],[900,340,36],[-1200,260,28]].forEach(([x,h,w],i)=>{ const z=seaZ-980-i*37; put(skyG,new THREE.CylinderGeometry(w*0.28,w*0.5,h,8),skyDay,x,h/2,z); put(skyG,new THREE.ConeGeometry(w*0.12,h*0.14,6),skyDay,x,h+h*0.07,z); });
  const skyM=apMerge(skyG); G.add(skyM); const towers=skyM.children;
  /* ---------- a complete jet bridge (apron-drive): rotunda on the terminal, telescoping tunnel, cab on the door, bogie leg.
     d = {x: skin x of the left door (negative), z: door station, sill}; xr = rotunda x; o.y0 = tunnel level at the rotunda ---------- */
  const brG=new THREE.Group();
  const bridge=(unit,xr,d,o)=>{
    o=o||{}; const R=2.3, cw=3.6, ch=3.0, cl=3.2;
    const capX=d.x-(0.85+cw/2), capY=d.sill+ch/2, capZ=d.z;
    const rz=zF+R+0.15, p0=new V(xr,o.y0!==undefined?o.y0:capY,rz), p1=new V(capX+0.3,capY-0.1,capZ-cl/2+0.25);
    const rotH=Math.max(p0.y,p1.y)+1.7;
    add(new THREE.CylinderGeometry(R,R,rotH,24),white,xr,rotH/2,rz); add(new THREE.CylinderGeometry(R+0.04,R+0.04,1.5,24),glassDark,xr,p0.y+0.1,rz); add(new THREE.CylinderGeometry(R+0.15,R+0.15,0.25,24),dark,xr,rotH,rz);
    BOX(unit,"rotunda",xr,rotH/2,rz,R,rotH/2,R,0);
    /* telescoping tunnel in three nested sections */
    [[0,0.42,3.0,3.0],[0.34,0.74,2.82,2.84],[0.66,1,2.64,2.68]].forEach(([t0,t1,w,h])=>{ const a=p0.clone().lerp(p1,t0), b=p0.clone().lerp(p1,t1), len=a.distanceTo(b), mid=a.clone().add(b).multiplyScalar(0.5);
      const m=add(new THREE.BoxGeometry(w,h,len),[tunDay,tunDay,white,dark,white,white],mid.x,mid.y,mid.z); m.lookAt(b); m.userData.glass=2; });
    const N=6, ry=Math.atan2(p1.x-p0.x,p1.z-p0.z), sl=Math.abs(p1.y-p0.y)/p0.distanceTo(p1);
    for(let i=0;i<N;i++){ const a=p0.clone().lerp(p1,i/N), b=p0.clone().lerp(p1,(i+1)/N), len=a.distanceTo(b), mid=a.clone().add(b).multiplyScalar(0.5);
      BOX(unit,"tunnel"+i,mid.x,mid.y,mid.z,1.5,1.5+len*sl*0.5,len/2,ry,0); }
    /* cab on the door (window face towards the apron) and rubber bumper against the skin */
    const cab=add(new THREE.BoxGeometry(cw,ch,cl),[white,tunDay,white,dark,white,white],capX,capY,capZ); cab.userData.glass=2;
    add(new THREE.BoxGeometry(0.5,ch*0.8,cl*0.75),rubber,d.x-0.6,capY,capZ);
    BOX(unit,"cab",capX,capY,capZ,cw/2,ch/2,cl/2,0,0); BOX(unit,"bumper",d.x-0.6,capY,capZ,0.25,ch*0.4,cl*0.375,0,0.12);
    /* bogie leg under the tunnel: post, cross beam and two wheels, turned along the tunnel */
    const lp=p0.clone().lerp(p1,0.66), lb=lp.y-1.5; add(new THREE.BoxGeometry(0.5,lb-0.5,0.5),steel,lp.x,0.5+(lb-0.5)/2,lp.z);
    const bg=new THREE.Group(); bg.position.set(lp.x,0,lp.z); bg.rotation.y=ry; put(bg,new THREE.BoxGeometry(2.6,0.28,0.6),dark,0,0.62,0);
    [-1,1].forEach(s=>{ const w=apWheel(s*1.0,0.42,0,0.42,0.34,0.56,s,{lod:1}); bg.add(new THREE.Mesh(w.tyre,rubber)); bg.add(new THREE.Mesh(w.rim,hub)); }); brG.add(bg);
    BOX(unit,"leg",lp.x,(lb+0.1)/2,lp.z,1.4,(lb+0.1)/2,0.6,ry,0);
  };

  /* ---------- ground vehicles (m_ap_gse.js): built facing -z, centred on the footprint; on the right side +x is away from the aircraft ---------- */
  const GK=apGseKit(), vehG=new THREE.Group(), cones=new THREE.Group(); let crewN=0;
  const vplace=(unit,v,x,z,ry)=>{ ry=ry||0; v.g.position.set(x,0,z); v.g.rotation.y=ry; vehG.add(v.g); const cs=Math.cos(ry), sn=Math.sin(ry);
    v.b.forEach(([n,lx,ly,lz,hx,hy,hz,m])=>boxes.push({n:unit+":"+n,u:unit,c:[x+lx*cs+lz*sn,ly,z-lx*sn+lz*cs],h:[hx,hy,hz],ry,m}));
    if(v.slot) slots.push({x,z,ry,w:v.slot[0],l:v.slot[1]}); return v; };
  const vTug=(w,l,h,tow)=>GK.tug(w,l,h,tow), vGPU=(w,l,h)=>GK.gpu(w,l,h), vTrain=(n,k,cw,cl)=>GK.train(n,k,cw,cl), vCater=(f,W,bl,tl)=>GK.cater(f,W,bl,tl), vLoader=(f,W,pl,tl)=>GK.loader(f,W,pl,tl), vTanker=(w,l,h,col,st)=>GK.tanker(w,l,h,col,st), vBox=(w,l,h,col,kind)=>GK.truck(kind||"lav",w,l,h,col);
  const vBelt=(unit,head,foot,w)=>{ const r=GK.belt(head,foot,w); vehG.add(r.g); r.b.forEach(([n,x,y,z,hx,hy,hz,ry])=>BOX(unit,n,x,y,z,hx,hy,hz,ry,0)); slots.push(r.slot); };
  const crew=(unit,x,y,z,ry,o)=>{ GK.person(vehG,x,y,z,ry,o); BOX(unit,"crew"+(crewN++),x,y+0.9,z,0.3,0.9,0.3,0,0); };
  const extC=(unit,x,z)=>{ GK.ext(vehG,x,z); BOX(unit,"ext",x,0.6,z,0.35,0.6,0.3,0,0); };
  const cone=(x,z)=>GK.cone(cones,x,z), chock=(x,z,dir)=>GK.chock(cones,x,z,dir);

  /* ---------- the main aircraft: equipment where it stands in service (right side), measured from the real door positions ---------- */
  const ng=c.ng[0]+zN;
  const door=(n)=>{ const d=(c.doorList||[]).find(q=>q.n===n); if(!d) return null; const lo=sidePoint(c,d.X,d.z-d.h/2).x, hi=sidePoint(c,d.X,d.z+d.h/2).x, mid=sidePoint(c,d.X,d.z).x;
    return {x:Math.max(lo,hi,mid),z:d.X+zN,sill:d.z-d.h/2,h:d.h,w:d.w}; };      /* x = outermost skin position over the door height */
  const px=(sk,W)=>sk+0.45+0.9+W/2;                                              /* origin x of a platform vehicle so that its bridging plate stops 0.45 m from the skin */
  const belly=(X,xr)=>{ const r=ringAt(c,X); return [xr,r.zc-r.hh*Math.sqrt(Math.max(0,1-(xr/r.hw)*(xr/r.hw)))+0.03,X+zN]; };
  const Wg=wingLS(c), wingUnder=(xx,f)=>{ const u=Math.min(1,Math.max(0,(xx-Wg.Y0)/(c.tipY-Wg.Y0))), q=Wg.pt(u,f,-1,0); return [q.x,q.y-0.02,q.z]; };
  const tugAt=(w,l,h,tz)=>vplace("tug",vTug(w,l,h,(ng-tz)-c.nwR-0.1-(l/2+0.3)),0,tz,0);
  /* v19: the owner wants nothing standing next to the aircraft: no vehicles, carts, crew, hoses, cones or chocks (AP_GSE=false). The kit stays in m_ap_gse.js. */
  if(AP_GSE){
  if(a380){
    if(jb) tugAt(3.0,5.2,0.9,ng-4.6); else tugAt(3.6,6.0,1.3,ng-5.0);
    vplace("gpu",vGPU(1.5,3.2,1.5),5.4,zN-1.6,0); { const e=belly(4.2,1.0); GK.hose(vehG,[[4.55,1.1,zN-1.6],[3.4,0.8,zN-0.4],[2.2,1.8,zN+1.8],e],0.035); }
    vplace("acu",GK.acu(2.3,4.0,2.0),8.5,zN-1.2,0); { const e=belly(7.0,1.5); GK.hose(vehG,[[7.4,1.5,zN-1.0],[6.2,0.7,zN+1.2],[3.8,1.3,zN+3.6],e],0.13,GK.m.hosey); }
    const fc=door("FWD CARGO"), ld=vLoader(fc.sill-0.07,3.1,4.6,8.2), lx=px(fc.x,3.1), lz=fc.z-0.8-ld.zp; vplace("loader",ld,lx,lz,0); crew("loader",lx+0.3,fc.sill-0.07+0.15,fc.z-0.8,-PI/2,{});
    vplace("akeTrain",vTrain(3,"ake",2.5,3.4),jb?fc.x+8.4:11.6,jb?fc.z-9.0:-31.0,0);
    if(!jb){ const u1=door("U1"), c1=vCater(u1.sill-0.05,2.5,5.3,9.4); vplace("cateringU1",c1,px(u1.x,2.5),u1.z-c1.zb,0); }
    const m5=door("M5"), c5=vCater(m5.sill-0.05,2.5,5.3,9.4); vplace("cateringM5",c5,px(m5.x,2.5),m5.z-c5.zb,0);
    const fxT=jb?18.7:21.0, fzT=jb?-6.2:-4.0;
    vplace("fuel",vTanker(2.7,9.0,2.6,"#eceeee","#c8322a"),fxT,fzT,0); GK.hose(vehG,[[fxT-1.1,1.6,fzT+3.7],[fxT-1.2,1.0,fzT+4.8],[fxT-0.7,1.6,fzT+6.8],wingUnder(fxT-0.2,0.3)],0.05,GK.m.hosey);
    const ac=door("AFT CARGO"); vBelt("beltAft",new V(ac.x+0.45,ac.sill+0.1,ac.z+0.5),new V(ac.x+0.45+5.6,0.55,ac.z+0.5+0.9),1.0); crew("beltAft",ac.x+0.45+4.0,0,ac.z+0.5-1.6,0,{});
    vplace("baggage",vTrain(3,"bag",1.9,3.0),12.0,24.0,0); crew("baggage",14.2,0,20.0,-PI/2,{vest:"y"});
    vplace("lav",vBox(2.4,6.4,2.2,"#d8dde0","lav"),6.6,34.0,0);
    vplace("water",vBox(2.4,6.4,2.2,"#c6d6e2","water"),6.6,41.5,0);
    crew("crewA",-3.4,0,zN-2.8,0,{pose:1,wand:1}); crew("crewB",2.6,0,ng-1.5,-PI/2,{vest:"y"}); crew("crewC",5.4,0,zN+0.7,PI/2,{}); crew("fuel",fxT+2.4,0,fzT+3.6,PI/2,{vest:"y"}); extC("crewD",3.4,zN-3.0);
    vplace("bus1",GK.bus(2.5,11.5,2.7),-46,(zR0+zR1)/2,PI/2); vplace("bus2",GK.bus(2.5,11.5,2.7),58,(zR0+zR1)/2,-PI/2);
  } else {
    tugAt(2.3,4.4,1.05,zN-5.0);
    vplace("gpu",vGPU(1.15,2.5,1.2),3.4,zN-2.4,0); { const e=belly(3.5,0.8); GK.hose(vehG,[[2.9,1.0,zN-2.4],[2.2,0.7,zN-0.6],[1.6,1.3,zN+1.4],e],0.035); }
    const r1=door("1"), cr=vCater(r1.sill-0.05,2.2,4.2,7.6); vplace("catering",cr,px(r1.x,2.2),r1.z-0.9-cr.zb,0);
    const fc=door("FWD CARGO"); vBelt("beltFwd",new V(fc.x+0.4,fc.sill+0.05,fc.z+0.5),new V(fc.x+0.4+4.9,0.5,fc.z+0.5+1.9),0.9); crew("beltFwd",fc.x+0.4+3.2,0,fc.z+0.5+0.3,0,{});
    vplace("baggage",vTrain(3,"bag",1.8,2.9),9.6,-19.0,0); crew("baggage",11.2,0,-23.0,-PI/2,{vest:"y"});
    vplace("fuel",vTanker(2.5,8.0,2.3,"#eceeee","#c8322a"),13.4,-5.5,0); GK.hose(vehG,[[12.4,1.5,-2.0],[12.5,1.0,-0.6],[13.0,1.5,1.2],wingUnder(13.4,0.3)],0.05,GK.m.hosey); crew("fuel",15.4,0,-3.0,PI/2,{vest:"y"});
    const ac=door("AFT CARGO"); vBelt("beltAft",new V(ac.x+0.4,ac.sill+0.05,ac.z),new V(ac.x+0.4+4.4,0.5,ac.z+2.6),0.9); crew("beltAft",ac.x+0.4+3.0,0,ac.z+0.4,0,{});
    vplace("lav",vBox(2.2,5.6,2.0,"#d8dde0","lav"),4.6,18.5,0);
    vplace("water",vBox(2.2,5.6,2.0,"#c6d6e2","water"),4.6,25.0,0);
    crew("crewA",-3.2,0,zN-3.0,0,{pose:1,wand:1}); crew("crewB",2.2,0,ng-1.4,-PI/2,{vest:"y"}); crew("crewC",4.9,0,zN-2.4,PI/2,{}); extC("crewD",5.6,zN-1.0);
    vplace("bus1",GK.bus(2.5,11.5,2.7),-21.5,(zR0+zR1)/2,PI/2); vplace("bus2",GK.bus(2.5,11.5,2.7),64,(zR0+zR1)/2,-PI/2);
  }
  /* cones at wingtips, engine fronts and tail; wheel chocks (wedges) in front of and behind the tyres */
  { const W=wingLS(c), wr=c.wheelR, reach=(r)=>Math.sqrt(Math.max(0,2*r*0.22-0.048))+0.28;
    [-1,1].forEach(sg=>{ cone(sg*(c.tipY+0.6),W.LE(1)+c.tc*0.5+zN); c.eng.forEach(Ye=>{ const u=(Ye-W.Y0)/(c.tipY-W.Y0), z=W.LE(u)-(c.ef+0.8)+zN-2.2; cone(sg*Ye,z); cone(sg*(Ye+c.engD*0.9),z+1.2); }); cone(sg*3.2,L/2+3.0); });
    cone(0,L/2+3.4); const wo=a380?0.55:0.42; [-wo,wo].forEach(x=>chock(x,ng-reach(c.nwR),-1));
    c.mg.forEach(([gy,gx,gl])=>{ const ax=!a380?[0]:(gl<5?(c.axl||[-0.95,0.95]):[-1.7,0,1.7]); [-1,1].forEach(sg=>[-wo,wo].forEach(dx=>{ chock(sg*gy+dx,gx+ax[0]+zN-reach(wr),-1); chock(sg*gy+dx,gx+ax[ax.length-1]+zN+reach(wr),1); })); }); }

  }
  /* ---------- jet bridges (left side, to the real doors) ---------- */
  const lDoor=(n)=>{ const d=door(n); d.x=-d.x; return d; };
  if(a380){ bridge("brM1",-11.5,lDoor("M1"),{}); { const d=lDoor("U1"); bridge("brU1",jb?-24.0:-23.0,d,{y0:d.sill+1.5-(jb?0:1.2)}); } bridge("brM2",jb?-36.0:-35.0,lDoor("M2"),{}); }
  else { bridge("br1",-11.0,lDoor("1"),{}); if(AP_GSE){ const l2=lDoor("2"), st=GK.stairs(l2.sill); vplace("stairs",st,l2.x-0.65-1.27,l2.z+st.pz+1.9,PI); crew("stairs",l2.x-0.65-1.27+0.1,l2.sill+0.07,l2.z,-PI/2,{vest:"y"}); } }

  /* ---------- neighbouring stands (real aircraft from the same builder, each with its own bridge and a little equipment) and remote aircraft ---------- */
  const nbG=new THREE.Group(), RM=[];
  const jbox=(g,un)=>{ g.updateMatrixWorld(true); const bb=new THREE.Box3().setFromObject(g); BOX(un,"aircraft",(bb.min.x+bb.max.x)/2,(bb.min.y+bb.max.y)/2,(bb.min.z+bb.max.z)/2,(bb.max.x-bb.min.x)/2,(bb.max.y-bb.min.y)/2,(bb.max.z-bb.min.z)/2,0,0); };
  NB.forEach((nb,i)=>{ const j=apJetMake("b737",nb.pal,nb.k), cx=nb.cx, un="nb"+(nb.s<0?"L":"R"); j.position.set(cx,0,zN+nb.LN/2); nbG.add(j); jbox(j,un);
    const dn=cN.doorList[0], sx=sidePoint(cN,dn.X,dn.z).x*nb.k; bridge(un,cx-(a380?12:10.5),{x:cx-sx,z:zN+dn.X*nb.k,sill:(dn.z-dn.h/2)*nb.k},{});
    if(AP_GSE){ vplace(un,vTug(a380?3.0:2.3,a380?5.0:4.2,a380?1.2:1.05),cx,zN-(a380?4.2:5.2),0);
    vplace(un,vTrain(3,"bag",1.9,3.0),cx+(a380?22:10),zN+(a380?8:3),0);
    if(i===0) vplace(un,vBox(2.4,6.2,2.3,"#eef0f0"),cx+(a380?9:6.5),zN+nb.LN*0.62,0); }
  });
  /* remote aircraft: parked further along the stand row, and taxiing on the parallel taxiway in the distance (decimated copies) */
  { const rm=(un,key,k,x,z,ry,pi,far)=>{ const j=apJetMake(key,AP_PAL[pi],k,far?{far:true,cell:key==="a380"?0.55:0.4}:null); j.position.set(x,0,z); j.rotation.y=ry||0; nbG.add(j); jbox(j,un); };
    const eL=spL-NB[0].Nw-(a380?3.75:2.25), eR=spR+NB[1].Nw+(a380?3.75:2.25), c37=GEO.b737, c80=GEO.a380;
    if(a380){ rm("remL","b737",1.0,eL-c37.span/2-(3.75-2.25),zN+c37.L/2,0,2); rm("remR","a380",1.0,eR+c80.span/2,zN+c80.L/2,0,4); rm("remR2","b737",1.0,eR+c80.span+3.75+c37.span/2+4,zN+c37.L/2,0,5,true); }
    else { rm("remL","b737",1.0,eL-c37.span/2-1.0,zN+c37.L/2,0,4); rm("remR","b737",1.0,eR+c37.span/2+1.0,zN+c37.L/2,0,0); rm("remR2","a380",1.0,eR+c37.span+8+c80.span/2,zN+c80.L/2,0,1,true); }
    rm("taxA","b737",1.0,-(a380?170:120),zTW,-PI/2,3,true); rm("taxB","b737",1.0,a380?270:230,zTW,-PI/2,5,true); }
  G.add(apMerge(brG,{cast:false,recv:true})); G.add(nbG); const vehM=apMerge(vehG,{cast:true,recv:true}); vehM.userData.gse=1; G.add(vehM); G.add(apMerge(cones,{cast:false,recv:false}));

  /* ---------- the airfield (runway, taxiways, apron markings, signs, PAPI, lights) lives in m_ap_field.js ---------- */
  const stands=[{cx:0,hw:Sw,L:L,ng:ng,n:a380?"A12":"C7",type:jb?"747":a380?"A380":"737"},{cx:spL,hw:NB[0].Nw,L:NB[0].LN,ng:zN+cN.ng[0]*NB[0].k,n:a380?"A11":"C6",type:a380?"B777":"A320"},{cx:spR,hw:NB[1].Nw,L:NB[1].LN,ng:zN+cN.ng[0]*NB[1].k,n:a380?"A13":"C8",type:a380?"B777":"A320"}];
  const FLD=apField({c,a380,L,zN,zF,zR0,zR1,zTL,zTW,zRW,zRear,Sw,NB,spL,spR,ng,slots,dx0:-(Sw+2*NB[0].Nw),dx1:Sw+2*NB[1].Nw,zApEnd,stands}); G.add(FLD.group);

  /* ---------- lights: runway edge (white), taxiway centre (green) and edge (blue), apron masts, facade lights; glow sprites that only matter at night ---------- */
  const gt=glowTex(), pts=(arr,col,size,kind)=>{ const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(arr,3)); const m=new THREE.PointsMaterial({color:col,size,map:gt,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true,fog:false}); if(kind&&typeof vwGlow==="function") vwGlow(m,kind); const p=new THREE.Points(g,m); p.raycast=()=>{}; G.add(p); lights.push(p); return p; };
  const fl=[]; for(let x=-tW/2+10;x<=tW/2-10;x+=10) fl.push(x,tH+0.4,zF+1.2); pts(fl,0xffe2a8,9,"fac");
  const stRow=[]; stRow.push(spL,tH-0.8,zF+0.9, spR,tH-0.8,zF+0.9, 0,tH-0.8,zF+0.9); pts(stRow,0xffe9bd,26,"flood");
  const mp=[]; for(let x=-300;x<=300;x+=100) mp.push([x,zTL+(a380?58:44)]);
  const masts=[]; mp.forEach(([x,z])=>masts.push(x,32,z)); pts(masts,0xffe2a8,30,"mast");
  pts([tower.position.x,126,tower.position.z],0xff3322,18,"tower");
  { const q=new Map(); vehM.traverse(o=>{ if(!o.isMesh||o.material!==GK.m.beacon) return; const P=o.geometry.attributes.position; for(let i=0;i<P.count;i++){ const k=Math.round(P.getX(i)/1.2)+","+Math.round(P.getY(i)/1.2)+","+Math.round(P.getZ(i)/1.2); let e=q.get(k); if(!e){ e={n:0,x:0,y:0,z:0}; q.set(k,e); } e.n++; e.x+=P.getX(i); e.y+=P.getY(i); e.z+=P.getZ(i); } }); const a=[]; q.forEach(e=>a.push(e.x/e.n,e.y/e.n+0.1,e.z/e.n)); if(a.length) pts(a,0xffa010,7,"beacon"); }
  try{ const B0=GL.dbg(); if(B0){ const P=[], C=[], cm={nav:[1,0.95,0.8],navL:[1,0.15,0.1],navR:[0.1,1,0.35],beacon:[1,0.15,0.1]}; B0.root.traverse(m=>{ const mk=m.material&&m.material.userData&&m.material.userData.mk; if(!m.isMesh||!cm[mk]) return; m.geometry.computeBoundingBox(); const bb=m.geometry.boundingBox; P.push((bb.min.x+bb.max.x)/2+m.position.x,(bb.min.y+bb.max.y)/2+m.position.y,(bb.min.z+bb.max.z)/2+m.position.z); C.push(...cm[mk]); });
      if(P.length){ const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(P,3)); g.setAttribute("color",new THREE.Float32BufferAttribute(C,3)); const mt=new THREE.PointsMaterial({size:6,map:gt,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true,fog:false}); if(typeof vwGlow==="function") vwGlow(mt,"nav"); const pp=new THREE.Points(g,mt); pp.raycast=()=>{}; pp.frustumCulled=false; G.add(pp); lights.push(pp); } } }catch(e){}
  const ENV=apSurround({a380,L,zF,zN,zTL,zTW,zRW,zApEnd,tW,mp,conMat:ap.material,sandMat:sand.material}); G.add(ENV.group); AP_ENVM.push(glassDay);
  const poolT=apTex(128,128,(g,w,h)=>{ const r=g.createRadialGradient(64,64,0,64,64,64); r.addColorStop(0,"rgba(255,214,150,0.3)"); r.addColorStop(0.45,"rgba(255,214,150,0.11)"); r.addColorStop(1,"rgba(255,214,150,0)"); g.fillStyle=r; g.fillRect(0,0,w,h); },null,false);
  const pools=[], poolAt=(x,z,s)=>{ const m=add(new THREE.PlaneGeometry(s,s).rotateX(-PI/2),new THREE.MeshBasicMaterial({map:poolT,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}),x,0.03,z); m.renderOrder=2; pools.push(m); };
  mp.forEach(([x,z])=>poolAt(x,z-12,120)); [spL,0,spR].forEach(x=>{ poolAt(x,zN+L*0.12,L*1.7); poolAt(x,zN+L*0.62,L*1.5); });
  let envCur=null; const glassMeshes=[]; G.traverse(m=>{ if(m.userData&&m.userData.glass) glassMeshes.push(m); });
  return { group:G, boxes, slots, zF, zN, sp, stand:{Sw,Nw:NB[1].Nw,zTL,zTW,zRW},
    /* from the camera: hide the terminal when the view comes from behind its glass front (otherwise the walls would hide the stand) */
    update(camPos){ ENV.update(camPos); const inside=camPos.z<zF-1; if(termG.visible===inside) termG.visible=!inside;
      try{ const B=GL.dbg(), e=B&&B.mats[0]&&B.mats[0].envMap; if(e&&e!==envCur){ envCur=e; AP_ENVM.forEach(m=>{ m.envMap=e; m.needsUpdate=true; }); } }catch(er){} },
    setNight(on){
      GK.night(on); AP_NITE.forEach(p=>{ p.visible=on; }); lights.forEach(p=>{ p.visible=on; }); FLD.lights.forEach(p=>{ p.visible=on; }); FLD.night(on); pools.forEach(p=>{ p.visible=on; }); AP_ENVM.forEach(m=>{ m.envMapIntensity=on?0.5:0.4; });
      glassMeshes.forEach(m=>{ if(Array.isArray(m.material)) m.material=m.material.map(x=>x===glassDay||x===glassNight?(on?glassNight:glassDay):(x===tunDay||x===tunNight?(on?tunNight:tunDay):x)); });
      glassNight.emissiveIntensity=on?0.8:0; glassNight.emissiveMap=glassNight.map; glassNight.needsUpdate=true; tunNight.emissiveIntensity=on?0.9:0; tunNight.emissiveMap=tunNight.map; tunNight.needsUpdate=true;
      towers.forEach(m=>{ m.material=on?skyNight:skyDay; });
      tower.traverse(m=>{ if(m.userData&&m.userData.cab){ m.material.emissiveIntensity=on?0.8:0; } });
      roofM.color.copy(apLin(on?"#59606a":"#e8ebea")); white.color.copy(apLin(on?"#aeb3b7":"#eef0f0")); sand.material.color.set(on?"#3f392f":"#ffffff"); ap.material.color.set(on?"#5c6064":"#ffffff"); sea.material.color.copy(apLin(on?"#18323f":"#3d7f98")); ENV.night(on);
    } };
}
