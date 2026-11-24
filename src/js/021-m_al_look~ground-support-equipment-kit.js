/* ---------- ground support equipment kit: pushback tug, GPU, air-conditioning unit, baggage tractor and carts, belt loader, container high-loader,
   catering high-lift, fuel bowser, lavatory/water trucks, passenger stairs, apron bus, crew figures, cones, chocks, extinguisher carts.
   Everything is built from boxes/cylinders and the shared tyre/wheel geometry; apMerge() later bakes it into a handful of meshes. Vehicles are authored with the
   same conventions as before: built facing -z (except where noted), centred on the footprint, returning {g,b:[name,x,y,z,hx,hy,hz],slot}. ---------- */
let AP_GK=null;
function apGseKit(){
  if(AP_GK) return AP_GK;
  const K={}, PI=Math.PI, V=THREE.Vector3;
  const M=(c,r,m,o)=>new THREE.MeshStandardMaterial(Object.assign({color:apLin(c),roughness:r===undefined?0.55:r,metalness:m||0},o||{}));
  const hazT=(()=>{ const cv=document.createElement("canvas"); cv.width=64; cv.height=16; const g=cv.getContext("2d"); g.fillStyle="#f0b800"; g.fillRect(0,0,64,16); g.fillStyle="#1b1d1f"; for(let i=-2;i<8;i++){ g.beginPath(); g.moveTo(i*10,16); g.lineTo(i*10+6,16); g.lineTo(i*10+14,0); g.lineTo(i*10+8,0); g.fill(); } const t=new THREE.CanvasTexture(cv); t.encoding=THREE.sRGBEncoding; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(5,1); return t; })();
  const beltT=(()=>{ const cv=document.createElement("canvas"); cv.width=32; cv.height=64; const g=cv.getContext("2d"); g.fillStyle="#2b2e31"; g.fillRect(0,0,32,64); g.fillStyle="#44484c"; for(let i=0;i<8;i++) g.fillRect(0,i*8,32,2); const t=new THREE.CanvasTexture(cv); t.encoding=THREE.sRGBEncoding; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(1,6); return t; })();
  const m=K.m={ yel:M("#f2b705",0.5,0.05), orn:M("#ea6a14",0.5,0.05), wht:M("#e8ebeb",0.45,0.05), pal:M("#cfd5d9",0.5,0.05), red:M("#c4322a",0.5), blu:M("#2d5d9c",0.5), lbl:M("#8fb4cf",0.5), gry:M("#8a9298",0.55,0.3), dk:M("#23272b",0.6,0.2), stl:M("#b9c1c7",0.35,0.7),
    glass:M("#16232d",0.06,0.55), rub:M("#1d2023",0.9), hub:M("#aeb6bc",0.4,0.6), haz:M("#ffffff",0.6,0,{map:hazT}), belt:M("#ffffff",0.85,0,{map:beltT}), hose:M("#17191b",0.7), hosey:M("#d8b000",0.7), tank:M("#e4e8ea",0.35,0.35), skin:M("#c58a62",0.8), navy:M("#1f2c45",0.8), hvO:M("#ff7a12",0.7), hvY:M("#d4e600",0.7), silv:M("#d6dadc",0.4,0.6),
    beacon:M("#ffa500",0.4,0,{emissive:new THREE.Color("#ff8a00"),emissiveIntensity:0.15}), lamp:M("#fff2cf",0.3,0,{emissive:new THREE.Color("#fff0c0"),emissiveIntensity:0.1}), tail:M("#a01810",0.4,0,{emissive:new THREE.Color("#ff2a1a"),emissiveIntensity:0.05}),
    ext:M("#c8281e",0.4,0.3), bag:[M("#2f4a66",0.8),M("#6b4e3d",0.8),M("#3b3f45",0.8),M("#7a2f2f",0.8),M("#4d6b58",0.8),M("#a58f6a",0.8)], uld:M("#c3c9ce",0.4,0.4), uld2:M("#9aa5ad",0.5,0.3), cone:M("#ee5a10",0.5), wood:M("#caa93a",0.7) };
  K.night=(on)=>{ m.beacon.emissiveIntensity=on?1.8:0.15; m.lamp.emissiveIntensity=on?1.4:0.1; m.tail.emissiveIntensity=on?1.2:0.05; };
  const bx=(g,w,h,l,x,y,z,mt,rx,ry,rz)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,l),mt); o.position.set(x,y,z); if(rx||ry||rz) o.rotation.set(rx||0,ry||0,rz||0); g.add(o); return o; };
  const cyl=(g,r,h,x,y,z,mt,ax,seg,r2)=>{ const G0=new THREE.CylinderGeometry(r,r2===undefined?r:r2,h,seg||12); if(ax==="z") G0.rotateX(PI/2); else if(ax==="x") G0.rotateZ(PI/2); const o=new THREE.Mesh(G0,mt); o.position.set(x,y,z); g.add(o); return o; };
  const wheel=(g,x,y,z,R,W,out)=>{ const w=apWheel(x,y,z,R,W,0.56,out,{lod:1}); g.add(new THREE.Mesh(w.tyre,m.rub)); g.add(new THREE.Mesh(w.rim,m.hub)); };
  const beacon=(g,x,y,z)=>{ bx(g,0.22,0.06,0.22,x,y,z,m.dk); const d=new THREE.Mesh(new THREE.SphereGeometry(0.11,8,6,0,PI*2,0,PI/2),m.beacon); d.position.set(x,y+0.03,z); g.add(d); };
  const lamps=(g,x,y,z,s,fz)=>{ [-1,1].forEach(q=>bx(g,0.22*s,0.12*s,0.05,q*x,y,z+fz*0.02,m.lamp)); };
  const tails=(g,x,y,z,s)=>{ [-1,1].forEach(q=>bx(g,0.16*s,0.14*s,0.05,q*x,y,z,m.tail)); };
  const mirror=(g,x,y,z,s)=>{ bx(g,0.04,0.04,0.2*s,x,y,z,m.dk); bx(g,0.05,0.22*s,0.14*s,x+Math.sign(x)*0.02,y,z-0.14*s,m.dk); };
  /* cab: glazing box with pillars, roof, optional windscreen tilt; front = -1 faces -z */
  const cab=(g,w,h,l,x,y,z,body,front)=>{ bx(g,w*0.94,h*0.62,l*0.94,x,y+h*0.12,z,m.glass); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>bx(g,0.07,h*0.66,0.07,x+sx*w*0.47,y+h*0.12,z+sz*l*0.47,body));
    bx(g,w*1.04,0.07,l*1.04,x,y+h*0.45,z,body); bx(g,w,h*0.2,l,x,y-h*0.28,z,body); bx(g,w*0.9,0.05,0.04,x,y-h*0.12,z+front*l*0.5,m.dk); mirror(g,w*0.58+x,y+h*0.05,z+front*l*0.35,1); mirror(g,-w*0.58+x,y+h*0.05,z+front*l*0.35,1); lamps(g,w*0.34,y-h*0.34,z+front*l*0.52,1,front); };
  K.hose=(g,pts,r,mt)=>{ const t=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new V(p[0],p[1],p[2]))),pts.length*5,r,6),mt||m.hose); g.add(t); return t; };
  /* ---- pushback tug (towbarless-looking tractor; optional tow bar towards +z of length tow) ---- */
  K.tug=(w,l,h,tow)=>{ const g=new THREE.Group(), R=h*0.5, W=w>3?0.55:0.4, top=h*1.95;
    bx(g,w*0.96,h*0.5,l,0,h*0.5+0.02,0,m.yel); bx(g,w*0.84,h*0.34,l*0.42,0,h*0.93,l*0.26,m.yel); bx(g,w*0.8,0.05,l*0.4,0,h*1.11,l*0.26,m.dk); bx(g,w*0.5,h*0.5,0.08,0,h*0.95,l*0.47,m.dk);
    cab(g,w*0.66,h*1.0,l*0.34,0,h*1.15,-l*0.12,m.yel,-1); beacon(g,0,top+0.08,-l*0.04);
    bx(g,w*1.0,h*0.3,0.36,0,h*0.36,-l/2-0.12,m.haz); bx(g,w*1.0,h*0.3,0.36,0,h*0.36,l/2+0.12,m.haz); tails(g,w*0.38,h*0.62,l/2+0.02,1); lamps(g,w*0.38,h*0.66,-l/2-0.02,1,-1);
    [-1,1].forEach(sx=>[-1,1].forEach(sz=>{ const zz=sz*(l/2-R*1.3); wheel(g,sx*(w/2-0.04),R,zz,R,W,sx); bx(g,W+0.12,0.06,R*2.3,sx*(w/2-0.04),R*2+0.06,zz,m.dk); }));
    bx(g,0.5,0.4,0.5,0,h*0.42,-l/2-0.1,m.dk); const b=[["body",0,top/2,0,w/2+0.28,top/2,l/2+0.3]];
    if(tow){ [-1,1].forEach(q=>bx(g,0.1,0.1,tow*1.02,q*0.18,0.5,l/2+0.3+tow/2,m.stl,0,q*0.1,0)); bx(g,0.5,0.1,0.14,0,0.5,l/2+0.3+tow,m.stl); }
    return {g,b,slot:[w+0.9,l+0.9]}; };
  /* ---- ground power unit: yellow trailer with louvres, cable reel; two wheels at the back (+z), jockey wheel at the front ---- */
  K.gpu=(w,l,h)=>{ const g=new THREE.Group();
    bx(g,w,h*0.62,l,0,h*0.31+0.25,0,m.yel); bx(g,w*0.92,h*0.42,l*0.56,0,h*0.83+0.25,l*0.14,m.yel); for(let i=0;i<5;i++) bx(g,w*0.8,0.04,0.03,0,h*0.62+0.25+i*0.07,l*0.14-l*0.28-0.015,m.dk);
    for(let i=0;i<4;i++) bx(g,0.03,h*0.3,l*0.4,w*0.46+0.01,h*0.8+0.25,l*0.14,m.dk); bx(g,w*0.6,h*0.18,0.06,0,h*0.5+0.25,-l/2-0.02,m.dk); cyl(g,h*0.16,0.2,w*0.52,h*0.4+0.25,-l*0.1,m.dk,"x",10);
    [-1,1].forEach(sx=>wheel(g,sx*(w/2+0.02),0.3,l*0.3,0.3,0.24,sx)); bx(g,0.1,0.1,l*0.35,0,0.5,-l/2-l*0.17,m.stl); cyl(g,0.1,0.28,0,0.14,-l/2-l*0.35,m.rub,"x",8); bx(g,0.4,0.05,0.5,0,h+0.27,l*0.14,m.dk);
    return {g,b:[["body",0,h/2+0.25,0,w/2+0.2,h/2+0.25,l/2]],slot:[w+0.8,l+0.8]}; };
  /* ---- pre-conditioned air unit with a flexible duct coiled on the side ---- */
  K.acu=(w,l,h)=>{ const g=new THREE.Group();
    bx(g,w,h*0.7,l,0,h*0.35+0.3,0,m.wht); bx(g,w*0.96,0.08,l*0.96,0,h*0.7+0.34,0,m.stl); for(let i=0;i<6;i++) bx(g,w*0.7,0.05,0.04,0,h*0.5+0.3+(i%3)*0.1,-l/2-0.015+i*0.0,m.dk); cyl(g,0.45,0.35,0,h*0.7+0.55,l*0.12,m.dk,"y",14); bx(g,w,0.18,l,0,0.34,0,m.dk);
    bx(g,w+0.02,0.2,l*0.6,0,h*0.45+0.3,l*0.12,m.orn); [-1,1].forEach(sx=>{ wheel(g,sx*(w/2-0.1),0.33,l*0.28,0.33,0.26,sx); wheel(g,sx*(w/2-0.1),0.33,-l*0.28,0.33,0.26,sx); });
    for(let k=0;k<6;k++) cyl(g,0.32,0.08,w/2+0.05,h*0.55+0.3,-l*0.2+k*0.09,m.hosey,"x",12); bx(g,0.1,0.1,l*0.3,0,0.5,-l/2-l*0.15,m.stl);
    return {g,b:[["body",0,h/2+0.3,0,w/2+0.2,h/2+0.3,l/2]],slot:[w+0.8,l+0.8]}; };
  /* ---- one cart (baggage trolley with tilt, or container dollies carrying LD3-style containers) ---- */
  const uld=(g,x,y,z,cw,cl,ch)=>{ const sh=new THREE.Shape(); sh.moveTo(-cw/2,0); sh.lineTo(cw/2,0); sh.lineTo(cw/2,ch*0.62); sh.lineTo(cw/2*0.35,ch); sh.lineTo(-cw/2,ch); sh.lineTo(-cw/2,0); const ge=new THREE.ExtrudeGeometry(sh,{depth:cl,bevelEnabled:false}); ge.translate(0,0,-cl/2); const o=new THREE.Mesh(ge,m.uld); o.position.set(x,y,z); g.add(o); bx(g,cw+0.02,0.05,cl+0.02,x,y+0.03,z,m.uld2); bx(g,0.03,ch*0.7,cl*0.9,x-cw/2-0.01,y+ch*0.4,z,m.uld2); };
  const cart=(g,z,cw,cl,cargo,seed)=>{ bx(g,cw,0.14,cl,0,0.6,z,m.gry); bx(g,0.08,0.12,cl,-cw/2+0.1,0.5,z,m.dk); bx(g,0.08,0.12,cl,cw/2-0.1,0.5,z,m.dk); [-1,1].forEach(sx=>[-1,1].forEach(sz=>wheel(g,sx*(cw/2-0.02),0.28,z+sz*(cl/2-0.5),0.28,0.2,sx)));
    if(cargo==="ake"){ uld(g,0,0.67,z,cw-0.15,cl-0.2,1.55); }
    else { bx(g,cw,0.06,0.06,0,0.7,z-cl/2+0.03,m.dk); bx(g,cw,0.06,0.06,0,0.7,z+cl/2-0.03,m.dk); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>bx(g,0.06,1.0,0.06,sx*(cw/2-0.04),1.2,z+sz*(cl/2-0.06),m.gry)); bx(g,cw,0.05,cl,0,1.72,z,m.pal);
      for(let i=0;i<3;i++) bx(g,0.5+((seed+i)%3)*0.12,0.34+((seed*3+i)%3)*0.1,0.65+((seed+i*2)%3)*0.1,(i-1)*0.52,0.84+0.17,z+((i+seed)%2?0.45:-0.4),m.bag[(seed+i*2)%6]);
      for(let i=0;i<2;i++) bx(g,0.7,0.4,0.55,(i-0.5)*0.7,0.84+0.62,z+(i?0.2:-0.3),m.bag[(seed+i+3)%6]); } };
  /* ---- tractor + n carts; the tractor leads at -z ---- */
  K.train=(n,cargo,cw,cl)=>{ const g=new THREE.Group(), tl=2.7, gp=0.55, col=cargo==="ake"?m.yel:m.orn, hh=cargo==="ake"?2.35:2.0; let z=-((tl+n*(cl+gp))/2)+tl/2;
    bx(g,1.45,0.62,tl,0,0.62,z,col); bx(g,1.2,0.5,1.0,0,1.0,z-0.55,col); bx(g,1.3,0.16,0.4,0,0.4,z-tl/2-0.05,m.haz); bx(g,1.3,0.16,0.3,0,0.42,z+tl/2+0.04,m.dk);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>bx(g,0.07,1.05,0.07,sx*0.62,1.55,z+0.15+sz*0.45,col)); bx(g,1.45,0.07,1.15,0,2.08,z+0.15,col); bx(g,1.3,0.7,0.06,0,1.55,z-0.32,m.glass); bx(g,1.2,0.4,0.5,0,1.15,z+0.6,m.dk); cyl(g,0.12,0.04,0,1.4,z-0.1,m.dk,"y",8);
    [-1,1].forEach(sx=>[-1,1].forEach(sz=>wheel(g,sx*0.74,0.32,z+sz*0.95,0.32,0.26,sx))); beacon(g,0,2.14,z+0.15); lamps(g,0.45,0.72,z-tl/2-0.02,1,-1);
    for(let i=0;i<n;i++){ const zc=z+tl/2+gp+cl/2+i*(cl+gp); cart(g,zc,cw,cl,cargo,i+1); bx(g,0.1,0.1,gp+0.25,0,0.55,zc-cl/2-gp/2,m.stl); }
    const len=tl+n*(cl+gp); return {g,b:[["train",0,hh/2,0,cw/2+0.1,hh/2,len/2]],slot:[cw+0.8,len+0.8]}; };
  /* ---- belt loader: world coordinates; conveyor from head (door) down to foot, chassis and cab behind the foot ---- */
  K.belt=(head,foot,w)=>{ const g=new THREE.Group(), dir=new V(foot.x-head.x,0,foot.z-head.z).normalize(), len=head.distanceTo(foot), ry=Math.atan2(dir.x,dir.z), sl=Math.abs(head.y-foot.y)/len, b=[];
    const cv=new THREE.Group(); cv.position.copy(head.clone().add(foot).multiplyScalar(0.5)); g.add(cv); cv.lookAt(foot);
    bx(cv,w,0.1,len,0,0.02,0,m.belt); [-1,1].forEach(s=>{ bx(cv,0.08,0.3,len,s*(w/2+0.04),0.1,0,m.yel); bx(cv,0.1,0.3,len,s*(w/2+0.14),-0.2,0,m.dk); }); bx(cv,w+0.3,0.12,0.4,0,-0.02,-len/2+0.1,m.rub); bx(cv,w*0.9,0.28,len*0.8,0,-0.22,0,m.dk);
    [-1,1].forEach(s=>{ bx(cv,0.05,0.5,0.05,s*(w/2+0.1),0.35,-len/2+0.5,m.stl); }); bx(cv,w+0.3,0.05,0.05,0,0.6,-len/2+0.5,m.stl);
    const cz=foot.clone().add(dir.clone().multiplyScalar(2.1)); cz.y=0; const ch=new THREE.Group(); ch.position.set(cz.x,0,cz.z); ch.rotation.y=ry; g.add(ch);
    bx(ch,1.9,0.8,4.0,0,0.75,0,m.yel); bx(ch,1.9,0.3,0.4,0,0.45,2.15,m.haz); cab(ch,1.7,1.15,1.4,0,1.59,1.2,m.yel,1); beacon(ch,0,2.2,1.2); [-1,1].forEach(sx=>[-1,1].forEach(sz=>wheel(ch,sx*0.95,0.4,sz*1.4,0.4,0.3,sx))); bx(ch,0.5,0.7,0.1,0,1.0,-2.02,m.dk);
    const n=5; for(let i=0;i<n;i++){ const a=head.clone().lerp(foot,i/n), c2=head.clone().lerp(foot,(i+1)/n), l2=a.distanceTo(c2), m2=a.clone().add(c2).multiplyScalar(0.5); b.push(["belt"+i,m2.x,m2.y+0.1,m2.z,w/2+0.08,0.25+l2*sl*0.5,l2/2,ry]); }
    b.push(["chassis",cz.x,1.05,cz.z,1.1,1.05,2.0,ry]); b.push(["cab",cz.x+dir.x*1.2,1.7,cz.z+dir.z*1.2,0.95,1.0,0.8,ry]);
    return {g,b,slot:{x:cz.x,z:cz.z,ry,w:2.9,l:4.9}}; };
  /* scissor lift: two X-arm pairs from base height y0 to platform height y1 at (x,z), spanning width ww */
  const scissor=(g,x,z,ww,y0,y1,zl)=>{ [-1,1].forEach(s=>{ const xx=x+s*ww/2, h=y1-y0, a=new V(xx,y0,z-zl/2), b2=new V(xx,y1,z+zl/2), c2=new V(xx,y0,z+zl/2), d=new V(xx,y1,z-zl/2); g.add(new THREE.Mesh(barBetween(a,b2,0.07,6),m.stl)); g.add(new THREE.Mesh(barBetween(c2,d,0.07,6),m.stl)); bx(g,0.14,0.14,0.14,xx,(y0+y1)/2,z,m.dk); bx(g,0.12,0.12,zl*1.05,xx,y0+0.06,z,m.dk); }); };
  /* ---- container / pallet high-loader (A380): cab at -z, scissor platform at +z with roller bed and rails ---- */
  K.loader=(floorY,W,pl,tl)=>{ const g=new THREE.Group(), zp=tl/2-pl/2, zc=-tl/2+1.1;
    bx(g,W,0.9,tl,0,0.75,0,m.yel); bx(g,W,0.3,pl,0,floorY,zp,m.pal); for(let i=0;i<6;i++) bx(g,W*0.92,0.04,0.08,0,floorY+0.17,zp-pl/2+0.5+i*(pl-1)/5,m.dk); [-1,1].forEach(s=>bx(g,0.08,0.9,pl,s*(W/2-0.05),floorY+0.55,zp,m.yel)); bx(g,W,0.06,0.08,0,floorY+1.0,zp+pl/2,m.yel);
    scissor(g,0,zp,W*0.8,1.1,floorY-0.15,pl*0.5); cab(g,2.2,1.9,2.2,0,1.92,zc,m.yel,-1); [-1,1].forEach(sx=>{ wheel(g,sx*(W/2),0.55,zc,0.55,0.42,sx); wheel(g,sx*(W/2),0.55,zp,0.55,0.42,sx); }); beacon(g,0,2.88,zc);
    bx(g,W*0.5,0.4,pl*0.55,0,1.15,zp,m.dk); bx(g,0.9,0.1,pl*0.45,-W/2-0.45,floorY+0.08,zp,m.pal); bx(g,0.12,0.14,pl*0.45,-W/2-0.9,floorY+0.12,zp,m.rub); bx(g,W,0.3,0.4,0,0.45,-tl/2-0.1,m.haz);
    return {g,zp,b:[["cab",0,1.9,zc,1.1,1.45,1.1],["chassis",0,0.75,0,W/2,0.75,tl/2],["lift",0,floorY/2,zp,W*0.4,floorY/2,pl*0.25],["platform",0,floorY+0.45,zp,W/2,0.6,pl/2],["plate",-W/2-0.45,floorY+0.08,zp,0.45,0.1,pl*0.22]],slot:[W+1.2,tl+0.8]}; };
  /* ---- catering high-lift: cab at +z, box on a scissor lift at -z with a bridging plate towards -x ---- */
  K.cater=(floorY,W,bl,tl)=>{ const g=new THREE.Group(), bh=2.5, zb=-(tl/2-bl/2), zc=tl/2-1.1;
    bx(g,W,0.55,tl-0.2,0,0.78,0,m.gry); cab(g,2.2,1.9,2.2,0,1.78,zc,m.wht,1); beacon(g,0,2.75,zc); [-1,1].forEach(sx=>{ wheel(g,sx*(W/2),0.5,zc,0.5,0.4,sx); wheel(g,sx*(W/2),0.5,zb+bl*0.3,0.5,0.4,sx); });
    bx(g,W,0.28,bl,0,floorY,zb,m.pal); bx(g,W,bh,bl,0,floorY+0.14+bh/2,zb,m.wht); bx(g,W+0.02,0.2,bl,0,floorY+0.14+bh*0.84,zb,m.blu); bx(g,0.06,bh*0.55,bl*0.5,-W/2-0.02,floorY+0.14+bh*0.45,zb,m.glass); bx(g,W*0.7,bh*0.7,0.05,0,floorY+0.14+bh*0.45,zb+bl/2+0.02,m.pal);
    bx(g,0.9,0.12,bl*0.5,-W/2-0.45,floorY+0.1,zb,m.pal); bx(g,0.14,0.2,bl*0.5,-W/2-0.9,floorY+0.12,zb,m.rub); scissor(g,0,zb,W*0.78,1.0,floorY-0.15,bl*0.45); bx(g,W*0.8,0.35,bl*0.6,0,1.05,zb,m.dk);
    [-1,1].forEach(sx=>bx(g,0.12,0.5,0.12,sx*(W/2-0.1),0.35,zb-bl/2-0.1,m.stl)); bx(g,W,0.3,0.4,0,0.45,zc+1.3,m.haz);
    return {g,zb,b:[["cab",0,1.45,zc,1.1,1.45,1.1],["frame",0,0.78,0,W/2,0.5,tl/2],["lift",0,floorY/2,zb,W*0.4,floorY/2,bl*0.3],["box",0,floorY+0.14+bh/2,zb,W/2,(bh+0.28)/2,bl/2],["plate",-W/2-0.45,floorY+0.1,zb,0.45,0.12,bl*0.25]],slot:[W+1.2,tl+0.8]}; };
  /* ---- fuel bowser: elliptical tank, catwalk with rail, hose cabinet at the rear (+z), coiled hoses, three axles; cab at -z ---- */
  K.tanker=(w,l,h,col,stripe)=>{ const g=new THREE.Group(), tk=M(col,0.32,0.3), st=M(stripe,0.5), tr=h*0.36, ty=0.95+tr;
    bx(g,w*0.9,0.5,l,0,0.65,0,m.gry); const t=new THREE.Mesh(new THREE.CylinderGeometry(tr,tr,l*0.66,22).rotateX(PI/2).scale(1.18,1,1),tk); t.position.set(0,ty,l*0.14); g.add(t);
    [-1,1].forEach(s=>{ const cap=new THREE.Mesh(new THREE.SphereGeometry(tr,14,8,0,PI*2,0,PI/2).rotateX(s>0?PI/2:-PI/2).scale(1.18,1,0.35),tk); cap.position.set(0,ty,l*0.14+s*l*0.33); g.add(cap); });
    bx(g,tr*2.4+0.02,0.14,l*0.5,0,ty,l*0.14,st); bx(g,tr*1.1,0.08,l*0.5,0,ty+tr+0.04,l*0.14,m.stl); [-1,1].forEach(s=>{ bx(g,0.03,0.4,l*0.5,s*tr*0.55,ty+tr+0.25,l*0.14,m.stl); }); cyl(g,0.28,0.18,0,ty+tr+0.12,l*0.2,m.stl,"y",10);
    cab(g,w*0.9,2.1,1.9,0,1.7,-l/2+1.1,tk,-1); beacon(g,0,2.75,-l/2+1.1); bx(g,w*0.98,0.35,0.4,0,0.5,-l/2-0.1,m.haz);
    bx(g,w*0.96,1.5,1.0,0,1.5,l/2-0.7,m.pal); bx(g,w*0.8,0.9,0.06,0,1.5,l/2-0.18,m.dk); cyl(g,0.32,0.1,0,1.5,l/2-0.14,m.hosey,"z",14); bx(g,w*0.98,0.4,0.4,0,0.55,l/2+0.15,m.haz); tails(g,w*0.4,0.8,l/2+0.36,1);
    [-1,1].forEach(sx=>{ bx(g,0.14,0.14,l*0.5,sx*(w/2+0.02),ty-tr*0.7,l*0.12,m.hosey); [-l/2+1.1,l*0.2,l*0.34].forEach(zz=>{ wheel(g,sx*(w/2),0.5,zz,0.5,0.4,sx); bx(g,0.5,0.06,1.2,sx*(w/2),1.02,zz,m.dk); }); });
    return {g,b:[["cab",0,1.45,-l/2+1.1,w/2,1.45,1.0],["tank",0,0.95+h*0.36,l*0.14,w/2,h*0.36+0.5,l*0.35]],slot:[w+0.8,l+0.8]}; };
  /* ---- service trucks: lavatory (tall box, rear platform, hose reel) and potable water (cylindrical tank) ---- */
  K.truck=(kind,w,l,h,col)=>{ const g=new THREE.Group(), bd=M(col,0.5);
    bx(g,w*0.92,0.5,l,0,0.65,0,m.gry); cab(g,w*0.9,1.9,1.9,0,1.62,-l/2+1.1,bd,-1); beacon(g,0,2.58,-l/2+1.1); bx(g,w*0.98,0.35,0.4,0,0.5,-l/2-0.1,m.haz);
    if(kind==="lav"){ bx(g,w,h,l*0.5,0,0.9+h/2,l*0.18,bd); bx(g,w+0.02,0.14,l*0.5,0,0.9+h*0.55,l*0.18,m.blu); bx(g,w*0.5,0.8,0.05,0,0.9+h*0.5,l*0.18-l*0.25-0.02,m.dk); bx(g,w*0.9,0.1,0.9,0,0.95,l/2-0.2,m.pal); [-1,1].forEach(s=>bx(g,0.04,0.5,0.9,s*w*0.45,1.3,l/2-0.2,m.stl)); cyl(g,0.22,0.4,0,1.3,l/2-0.35,m.hose,"z",10); }
    else { const t=new THREE.Mesh(new THREE.CylinderGeometry(h*0.46,h*0.46,l*0.52,20).rotateX(PI/2),M("#d2e1ec",0.35,0.3)); t.position.set(0,0.95+h*0.46,l*0.18); g.add(t); bx(g,w*0.94,0.14,l*0.52,0,0.95+h*0.46,l*0.18,m.blu); bx(g,w*0.94,0.9,0.7,0,1.45,l/2-0.45,m.pal); cyl(g,0.26,0.12,w*0.3,1.45,l/2-0.07,m.hose,"z",10); }
    [-1,1].forEach(sx=>[-l/2+1.1,l*0.25,l*0.38].forEach(zz=>{ wheel(g,sx*(w/2),0.5,zz,0.5,0.4,sx); bx(g,0.5,0.06,1.2,sx*(w/2),1.02,zz,m.dk); })); tails(g,w*0.4,0.8,l/2+0.02,1);
    return {g,b:[["cab",0,1.45,-l/2+1.1,w/2,1.45,1.0],["box",0,0.9+h/2,l*0.18,w/2,h/2+0.3,l*0.31]],slot:[w+0.8,l+0.8]}; };
  /* ---- passenger stairs: platform at the top-front (-z) next to the door, flight of steps descending to +z; the platform faces -x (door on the left) ---- */
  K.stairs=(sill)=>{ const g=new THREE.Group(), n=Math.round(sill/0.18), tl=4.2+n*0.28, tw=2.1, pz=-tl/2+0.9, X0=-0.1, zs=pz+2.65;
    bx(g,tw,0.55,tl,0,0.75,0,m.gry); cab(g,1.9,1.7,1.6,0,1.68,-tl/2+0.7,m.wht,-1); beacon(g,0,2.55,-tl/2+0.7);
    bx(g,1.5,0.14,1.5,X0,sill,pz+1.9,m.pal); bx(g,1.5,0.7,0.05,X0,sill+0.45,zs,m.stl); [-1,1].forEach(s2=>bx(g,0.05,0.7,1.5,X0+s2*0.72,sill+0.45,pz+1.9,m.stl)); bx(g,0.5,0.14,1.2,-0.95,sill-0.05,pz+1.9,m.pal); bx(g,0.1,0.2,1.1,-1.22,sill-0.03,pz+1.9,m.rub);
    for(let i=0;i<n;i++) bx(g,1.1,0.05,0.28,X0,sill-0.1-i*0.18,zs+i*0.28,m.pal);
    [-1,1].forEach(s2=>{ const a=new V(X0+s2*0.58,sill+0.75,zs), b2=new V(X0+s2*0.58,0.9,zs+n*0.28); g.add(new THREE.Mesh(barBetween(a,b2,0.025,5),m.stl)); g.add(new THREE.Mesh(barBetween(new V(a.x,a.y-0.5,a.z),new V(b2.x,b2.y-0.5,b2.z),0.02,5),m.stl)); });
    [-1,1].forEach(sx=>{ wheel(g,sx*(tw/2),0.45,-tl/2+0.9,0.45,0.36,sx); wheel(g,sx*(tw/2),0.45,tl/2-0.7,0.45,0.36,sx); });
    return {g,pz,b:[["chassis",0,0.9,0,tw/2+0.2,0.9,tl/2],["cab",0,2.0,-tl/2+0.7,0.95,0.9,0.8],["platform",X0,sill+0.35,pz+1.9,0.8,0.5,0.8],["steps",X0,sill/2,zs+n*0.14,0.65,sill/2,n*0.14+0.15]],slot:[tw+1.2,tl+1.2]}; };
  /* ---- apron bus: long low floor, big windows, doors, roof pod; faces -z ---- */
  K.bus=(w,l,h)=>{ const g=new THREE.Group();
    bx(g,w,h*0.62,l,0,h*0.31+0.35,0,m.wht); bx(g,w+0.02,h*0.34,l-0.5,0,h*0.62+0.38,0,m.glass); bx(g,w,0.06,l,0,h+0.42,0,m.wht); bx(g,w*0.7,0.3,l*0.45,0,h+0.6,l*0.05,m.pal); bx(g,w*0.96,0.2,l,0,0.55,0,m.gry); bx(g,w*0.98,0.22,0.35,0,0.5,-l/2-0.1,m.haz); bx(g,w*0.98,0.22,0.35,0,0.5,l/2+0.1,m.haz);
    [-1,1].forEach(s=>{ bx(g,0.04,h*0.55,1.4,s*(w/2+0.02),h*0.42+0.35,-l/2+2.2,m.glass); bx(g,0.04,h*0.55,1.4,s*(w/2+0.02),h*0.42+0.35,l/2-3.0,m.glass); bx(g,0.05,0.12,l*0.8,s*(w/2+0.01),h*0.5+0.35,0,m.red); mirror(g,s*(w/2+0.1),h*0.7,-l/2+0.7,1.3); });
    bx(g,w*0.9,h*0.4,0.05,0,h*0.78+0.35,-l/2-0.02,m.glass); lamps(g,w*0.38,0.75,-l/2,1.2,-1); tails(g,w*0.38,0.75,l/2,1.2); beacon(g,0,h+0.45,-l/2+1.0);
    [-1,1].forEach(sx=>{ wheel(g,sx*(w/2-0.05),0.5,-l/2+1.7,0.5,0.34,sx); wheel(g,sx*(w/2-0.05),0.5,l/2-1.6,0.5,0.34,sx); wheel(g,sx*(w/2-0.05),0.5,l/2-2.6,0.5,0.34,sx); });
    return {g,b:[["body",0,(h+0.5)/2,0,w/2+0.1,(h+0.5)/2,l/2+0.15]],slot:[w+0.8,l+0.8]}; };
  /* ---- crew figure: hi-vis vest, helmet, ear defenders; pose 0 standing, 1 arms raised (marshaller with wands), 2 arm out (pointing) ---- */
  K.person=(g,x,y,z,ry,o)=>{ o=o||{}; const p=new THREE.Group(), vest=o.vest==="y"?m.hvY:m.hvO;
    [-1,1].forEach(s=>{ bx(p,0.15,0.82,0.2,s*0.1,0.46,0,m.navy); bx(p,0.16,0.1,0.28,s*0.1,0.05,0.03,m.dk); });
    bx(p,0.4,0.58,0.24,0,1.17,0,vest); bx(p,0.41,0.05,0.25,0,1.07,0,m.silv); bx(p,0.41,0.05,0.25,0,1.3,0,m.silv); bx(p,0.12,0.2,0.2,0,1.52,0,m.skin);
    const hd=new THREE.Mesh(new THREE.SphereGeometry(0.115,10,8),m.skin); hd.position.y=1.66; p.add(hd); const hm=new THREE.Mesh(new THREE.SphereGeometry(0.13,10,6,0,PI*2,0,PI/2),o.hat==="y"?m.hvY:m.wht); hm.position.y=1.68; p.add(hm); [-1,1].forEach(s=>bx(p,0.05,0.1,0.1,s*0.125,1.66,0,m.dk));
    const arm=(s,pose)=>{ const a=new THREE.Group(); a.position.set(s*0.26,1.38,0); const up=pose===1||(pose===2&&s>0); bx(a,0.09,0.55,0.09,0,up?0.18:-0.25,0,vest); a.rotation.z=up?-s*2.7:s*0.06; if(pose===2&&s>0) a.rotation.set(-1.45,0,-0.1); if(pose===1&&o.wand) bx(a,0.03,0.45,0.03,0,0.55,0,m.beacon); p.add(a); };
    arm(-1,o.pose||0); arm(1,o.pose||0); p.position.set(x,y,z); p.rotation.y=ry||0; g.add(p); return p; };
  K.person.box=(x,y,z)=>["crew",x,y+0.9,z,0.3,0.9,0.3];
  /* ---- cones, wheel chocks (wedges) and fire-extinguisher carts ---- */
  K.cone=(g,x,z)=>{ bx(g,0.42,0.04,0.42,x,0.02,z,m.rub); cyl(g,0.04,0.7,x,0.39,z,m.cone,"y",10,0.17); cyl(g,0.115,0.12,x,0.38,z,m.wht,"y",10); };
  K.chock=(g,x,z,dir)=>{ const sh=new THREE.Shape(); sh.moveTo(0,0); sh.lineTo(0.5,0); sh.lineTo(0.5,0.22); sh.lineTo(0,0); const ge=new THREE.ExtrudeGeometry(sh,{depth:0.3,bevelEnabled:false}); ge.translate(-0.25,0,-0.15); ge.rotateY(PI/2*(dir||1)); const o=new THREE.Mesh(ge,m.yel); o.position.set(x,0,z); g.add(o); };
  K.ext=(g,x,z)=>{ bx(g,0.5,0.06,0.4,x,0.28,z,m.dk); [-1,1].forEach(s=>wheel(g,x+s*0.27,0.14,z,0.14,0.07,s)); cyl(g,0.13,0.7,x,0.65,z,m.ext,"y",10); cyl(g,0.05,0.1,x,1.05,z,m.dk,"y",8); bx(g,0.04,0.7,0.04,x,0.7,z+0.22,m.dk); };
  return AP_GK=K;
}
