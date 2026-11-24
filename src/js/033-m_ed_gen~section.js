/* ---------- (hg) the maintenance hangar: the scene of the atlas viewer that replaced the airport apron (owner's request «الغي المطار وضيف هنجر»).
   A barrel-vault hangar sized from the aircraft in view: steel arch ribs, corrugated wall and roof, a clerestory strip, high-bay lights, an overhead bridge crane,
   benches, tool chests, shelving, a compressor, a small office mezzanine and floor markings (aircraft outline, walkways, centre line). The overhead steelwork is hidden while the camera is above the roof. Everything is drawn from scratch
   (no signs, no text, no logos). The shell is drawn from the inside only (BackSide), so from outside or above the walls and roof vanish and the aircraft stays in view.
   buildHangar(c) returns the same shape of object the old airport did: {group, boxes, update(camPos), setNight(on)}; the aircraft stands on y=0, nose towards -z. ---------- */
function buildHangar(c){
  const G=new THREE.Group(), PI=Math.PI, L=c.L, Hw=c.span*0.8+16, wH=c.H*1.45+4, arch=Math.max(7,c.H*0.6), zB=L/2+40, zF=-L/2-36, Ld=zB-zF, zc=(zB+zF)/2, lin=apLin;   /* (v24) a much bigger hangar */
  const boxes=[], parts={}, night=[], hi={};   /* hi: the overhead parts (ribs, crane, lights), drawn only while the camera is under the roof */
  const MS=(col,r,m,o)=>new THREE.MeshStandardMaterial(Object.assign({color:lin(col),roughness:r===undefined?0.7:r,metalness:m||0},o));
  const MB=(col)=>new THREE.MeshBasicMaterial({color:lin(col),fog:true});
  const matK={}, mat=(col,r,m)=>{ const k=col+"|"+r+"|"+m; return matK[k]||(matK[k]=MS(col,r,m)); };
  const add=(geo,m,x,y,z,ry)=>{ const o=new THREE.Mesh(geo,m); o.position.set(x,y,z); if(ry) o.rotation.y=ry; o.raycast=()=>{}; G.add(o); return o; };
  /* small solids are collected per material and merged at the end */
  let hiOn=false; const P=(m,g)=>{ const T=hiOn?hi:parts; (T[m.uuid]=T[m.uuid]||{m,g:[]}).g.push(g); };
  const box=(m,w,h,d,x,y,z)=>P(m,new THREE.BoxGeometry(w,h,d).translate(x,y,z));
  const cyl=(m,r,len,ax,x,y,z,seg)=>{ const g=new THREE.CylinderGeometry(r,r,len,seg||14); if(ax==="z") g.rotateX(PI/2); else if(ax==="x") g.rotateZ(PI/2); P(m,g.translate(x,y,z)); };
  const bx=(n,x,y,z,hx,hy,hz)=>boxes.push({n:"hangar:"+n,u:"hangar",c:[x,y,z],h:[hx,hy,hz],ry:0});

  /* ---- textures ---- */
  const wallT=(rep)=>apTex(64,64,(g,w,h)=>{ g.fillStyle="#d3d9de"; g.fillRect(0,0,w,h); g.fillStyle="#bcc4cb"; g.fillRect(0,0,w/2,h); g.fillStyle="rgba(255,255,255,.35)"; g.fillRect(w/2,0,3,h); g.fillStyle="rgba(40,50,60,.25)"; g.fillRect(w/2-3,0,3,h); },rep);
  const roofT=(rep)=>apTex(64,64,(g,w,h)=>{ g.fillStyle="#c8ced3"; g.fillRect(0,0,w,h); g.fillStyle="#aeb7be"; g.fillRect(0,0,w/2,h); g.fillStyle="rgba(255,255,255,.3)"; g.fillRect(w/2,0,2,h); },rep);
  /* floor: epoxy slabs 6 m, an outline for the aircraft, walkways along the walls, a centre line, red keep-clear boxes (drawn once, world to pixel) */
  const FW=1600, FH=Math.round(FW*Ld/(2*Hw));
  const floorT=apTex(FW,FH,(g,w,h)=>{ const px=x=>(x+Hw)/(2*Hw)*w, pz=z=>(z-zF)/Ld*h, mpp=w/(2*Hw);
    g.fillStyle="#8d9398"; g.fillRect(0,0,w,h); apNoise(g,w,h,26000,120,170,0.35);
    for(let x=-Hw;x<=Hw;x+=6){ g.fillStyle="rgba(40,44,48,.35)"; g.fillRect(px(x)-1,0,2,h); } for(let z=zF;z<=zB;z+=6){ g.fillStyle="rgba(40,44,48,.35)"; g.fillRect(0,pz(z)-1,w,2); }
    for(let i=0;i<12;i++){ const x=Math.random()*w, y=Math.random()*h, r=10+Math.random()*28, gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,"rgba(30,30,32,.34)"); gr.addColorStop(1,"rgba(30,30,32,0)"); g.fillStyle=gr; g.fillRect(x-r,y-r,2*r,2*r); }
    const lw=Math.max(3,0.22*mpp); g.lineWidth=lw;
    g.strokeStyle="#e3b82b"; g.strokeRect(px(-c.span/2-3),pz(-L/2-3),(c.span+6)*mpp,(L+6)*(h/Ld));                         /* aircraft footprint */
    g.strokeStyle="#f3f3ee"; g.setLineDash([mpp*2,mpp*1.5]); g.beginPath(); g.moveTo(px(0),pz(zF)); g.lineTo(px(0),pz(zB)); g.stroke(); g.setLineDash([]);   /* centre line */
    g.strokeStyle="#3f9a5a"; [-Hw+2.6,Hw-2.6].forEach(x=>{ g.beginPath(); g.moveTo(px(x),pz(zF+2)); g.lineTo(px(x),pz(zB-2)); g.stroke(); }); g.strokeRect(px(-Hw+2.6),pz(zF+2),(2*Hw-5.2)*mpp,(Ld-4)*(h/Ld)); /* walkways */
  },null);
  const _unusedOutside=apTex(256,256,(g,w,h)=>{ g.fillStyle="#9ea3a6"; g.fillRect(0,0,w,h); apNoise(g,w,h,5000,120,185,0.5); g.strokeStyle="rgba(50,54,58,.4)"; g.lineWidth=2; g.strokeRect(0,0,w,h); },[90,90]);

  /* ---- ground: the hangar floor, the apron outside ---- */
  const fm=MS("#ffffff",0.5,0.05,{map:floorT}); const floor=add(new THREE.PlaneGeometry(2*Hw,Ld).rotateX(-PI/2),fm,0,0.0,zc); floor.receiveShadow=true;
  const world=hgWorld(G,c,{Hw,zF,zB,wH});   /* the apron, taxiway, runway, terminal, tower and hills outside the open door */

  /* ---- shell (inside faces only) ---- */
  const wMat=MS("#ffffff",0.7,0.1,{side:THREE.BackSide,map:wallT([Ld/1.0,1])}), wMat2=MS("#ffffff",0.7,0.1,{side:THREE.BackSide,map:wallT([(2*Hw)/1.0,1])});
  const side=(sx)=>{ const g=new THREE.PlaneGeometry(Ld,wH); g.rotateY(sx<0?-PI/2:PI/2); const m=add(g,wMat,sx*Hw,wH/2,zc); return m; }; side(-1); side(1);
  const lowM=MS("#7d8892",0.8,0.1,{side:THREE.BackSide}); [-1,1].forEach(sx=>{ const g=new THREE.PlaneGeometry(Ld,1.25); g.rotateY(sx<0?-PI/2:PI/2); add(g,lowM,sx*(Hw-0.03),0.62,zc); });
  const winM=MB("#bcd9ee"); night.push([winM,"#bcd9ee","#0d1824"]);
  [-1,1].forEach(sx=>{ const g=new THREE.PlaneGeometry(Ld-6,1.5); g.rotateY(sx<0?PI/2:-PI/2); add(g,winM,sx*(Hw-0.06),wH-2.4,zc); });                    /* clerestory strip (faces inwards) */
  /* end walls with the arched top; the front one has the big door opening */
  const endShape=(hole)=>{ const s=new THREE.Shape(); s.moveTo(-Hw,0); s.lineTo(Hw,0); s.lineTo(Hw,wH); for(let i=1;i<=24;i++){ const a=i/24*PI; s.lineTo(Hw*Math.cos(a),wH+arch*Math.sin(a)); } s.lineTo(-Hw,wH); s.closePath();
    if(hole){ const dw=Math.min(2*Hw-10,c.span*1.15+10), dh=Math.max(c.H+3.5,wH-1.5), h=new THREE.Path(); h.moveTo(-dw/2,0.01); h.lineTo(-dw/2,dh); h.lineTo(dw/2,dh); h.lineTo(dw/2,0.01); h.closePath(); s.holes.push(h); }
    return new THREE.ShapeGeometry(s); };
  add(endShape(false),wMat2,0,0,zB); const frontWall=add(endShape(true),MS("#ffffff",0.7,0.1,{side:THREE.BackSide,map:wallT([(2*Hw)/1.0,1])}),0,0,zF);
  frontWall.rotation.y=PI;   /* faces the inside: the opening looks out to the apron */
  const roofM=MS("#ffffff",0.6,0.15,{side:THREE.BackSide,map:roofT([Ld/1.0,PI*(Hw+arch)/2/1.0])});
  { const g=new THREE.CylinderGeometry(1,1,Ld,48,1,true,PI/2,PI); g.rotateX(PI/2); g.scale(Hw,arch,1); add(g,roofM,0,wH,zc); }
  /* the roof is a half cylinder: after rotateX the circle lies in the x-y plane, the upper half is the arch */

  /* ---- steel: arch ribs, crane rails, high-bay lights (the overhead set) ---- */
  hiOn=true;
  const steel=mat("#5f6a74",0.6,0.5), yellow=mat("#e3b82b",0.55,0.2), redM=mat("#c8463b",0.55,0.1), blueM=mat("#3d6fa8",0.6,0.1), greyM=mat("#9aa3a9",0.6,0.3), darkM=mat("#2f353b",0.7,0.2), woodM=mat("#b99a6a",0.8,0), carton=mat("#c9b894",0.9,0);
  const NR=Math.max(4,Math.round(Ld/11)); const arcY=(x)=>wH+arch*Math.sqrt(Math.max(0,1-(x/Hw)*(x/Hw)));
  for(let r=0;r<=NR;r++){ const z=zF+0.8+(Ld-1.6)*r/NR; for(let i=0;i<24;i++){ const a0=i/24*PI, a1=(i+1)/24*PI, x0=-Hw*Math.cos(a0), y0=wH+arch*Math.sin(a0), x1=-Hw*Math.cos(a1), y1=wH+arch*Math.sin(a1);
      const len=Math.hypot(x1-x0,y1-y0), g=new THREE.BoxGeometry(len+0.05,0.5,0.55); g.rotateZ(Math.atan2(y1-y0,x1-x0)); P(steel,g.translate((x0+x1)/2,(y0+y1)/2-0.22,z)); }
    [-Hw+0.35,Hw-0.35].forEach(x=>box(steel,0.5,wH,0.5,x,wH/2,z)); }                                                                        /* columns */
  [-1,1].forEach(sx=>box(steel,0.5,0.6,Ld-1,sx*(Hw-1.2),wH-0.6,zc));                                                                           /* crane rails */
  const bz=zc-Ld*0.12; box(yellow,2*(Hw-1.2),0.8,1.0,0,wH-1.2,bz); box(darkM,1.8,0.7,1.5,-c.span*0.12,wH-2.1,bz); cyl(darkM,0.07,Math.max(4,wH-6),"y",-c.span*0.12,wH-2.4-Math.max(4,wH-6)/2,bz,8); box(redM,0.5,0.7,0.5,-c.span*0.12,6.0,bz);   /* bridge, trolley, hoist rope and hook */
  [-1,1].forEach(sx=>box(darkM,1.2,0.9,1.6,sx*(Hw-1.2),wH-1.2,bz));
  const lampM=MB("#fff6e0"); night.push([lampM,"#ffffff","#ffd9a0"]);
  for(let r=0;r<NR*2;r++){ const z=zF+3+(Ld-6)*r/(NR*2-1); [-0.62,0,0.62].forEach(k=>{ const x=Hw*k; P(lampM,new THREE.BoxGeometry(2.0,0.14,0.45).translate(x,arcY(x)-0.9,z)); P(darkM,new THREE.BoxGeometry(2.1,0.1,0.55).translate(x,arcY(x)-0.78,z)); }); }

  hiOn=false;
  /* ---- equipment against the walls (never inside the aircraft footprint) ---- */
  const zs=[zF+8,zF+14,zF+20,zF+26];
  zs.forEach((z,i)=>{ const x=-Hw+1.0; box(mat("#7b858c",0.6,0.4),0.9,0.9,3.0,x,0.45,z); box(woodM,1.0,0.06,3.1,x,0.93,z); box(i%2?redM:blueM,0.7,1.1,0.8,x,1.5,z-0.9); cyl(mat("#ccd2d6",0.4,0.5),0.18,0.45,"y",x,1.18,z+0.8,10); bx("bench"+i,x,0.9,z,0.55,0.9,1.6); });
  [0,1,2].forEach(i=>{ const z=zF+11+i*2.2, x=Hw-1.0; box(redM,0.9,1.15,0.75,x-0.5,0.58,z); box(darkM,0.95,0.08,0.8,x-0.5,1.18,z); bx("chest"+i,x-0.5,0.6,z,0.5,0.6,0.42); });
  const shelfZ=zB-1.0; for(let s=0;s<4;s++){ const x=-Hw*0.55+s*Hw*0.3; [0,1,2,3].forEach(k=>box(blueM,0.08,3.4,0.08,x+(k%2?1.4:-1.4),1.7,shelfZ+(k<2?-0.4:0.4))); [0.4,1.5,2.6].forEach(h=>{ box(greyM,3.0,0.06,1.0,x,h,shelfZ); box(carton,0.9,0.5,0.7,x-0.9,h+0.28,shelfZ); box(mat("#b8654d",0.8,0),0.7,0.4,0.6,x+0.2,h+0.23,shelfZ); box(mat("#6c8aa6",0.8,0),0.6,0.35,0.6,x+1.0,h+0.2,shelfZ); }); bx("shelf"+s,x,1.7,shelfZ,1.6,1.7,0.55); }
  cyl(mat("#3f6a8f",0.55,0.4),0.75,3.6,"z",Hw-2.6,1.2,zB-3.4,20); [-1.2,1.2].forEach(dz=>box(darkM,0.25,0.6,0.5,Hw-2.6,0.3,zB-3.4+dz)); bx("compressor",Hw-2.6,1.2,zB-3.4,0.8,1.0,1.9);   /* air compressor */
  [zF+9,zF+24].forEach(z=>{ cyl(darkM,0.05,0.3,"x",Hw-0.5,2.0,z,8); cyl(yellow,0.28,0.18,"x",Hw-0.62,2.0,z,16); });                                      /* hose reels on the wall */
  [zF+3,zB-3].forEach(z=>[-1,1].forEach(sx=>{ cyl(redM,0.11,0.55,"y",sx*(Hw-0.7),1.3,z,10); box(darkM,0.3,0.05,0.3,sx*(Hw-0.7),1.03,z); }));            /* extinguishers on the columns */
  /* two mobile work platforms outside the footprint */
  const platX=Hw-4.5, platZ=zc+Ld*0.2; box(yellow,2.4,0.15,2.0,platX,1.9,platZ); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{ box(darkM,0.1,1.9,0.1,platX+a*1.1,0.95,platZ+b*0.9); cyl(darkM,0.12,0.1,"x",platX+a*1.1,0.12,platZ+b*0.9,10); });
  box(yellow,2.4,1.0,0.05,platX,2.5,platZ-1.0); box(yellow,2.4,1.0,0.05,platX,2.5,platZ+1.0); box(yellow,0.05,1.0,2.0,platX+1.2,2.5,platZ); bx("platform",platX,1.0,platZ,1.2,1.0,1.0);
  /* office mezzanine in the back-left corner */
  { const mx=-Hw+6.5, mz=zB-4.2, mw=12.5, md=8, my=3.5, wm=mat("#e8ecef",0.7,0), glassM=MB("#9ec6df"); night.push([glassM,"#9ec6df","#f0c070"]);
    box(wm,mw,0.25,md,mx,my,mz); box(wm,mw,2.7,0.12,mx,my+1.4,mz+md/2-0.06); box(wm,0.12,2.7,md,mx-mw/2+0.06,my+1.4,mz); P(glassM,new THREE.BoxGeometry(mw-0.6,1.3,0.06).translate(mx,my+1.7,mz-md/2+0.02)); P(glassM,new THREE.BoxGeometry(0.06,1.3,md-0.6).translate(mx+mw/2-0.02,my+1.7,mz));
    for(let i=0;i<=8;i++) box(steel,0.07,1.05,0.07,mx-mw/2+0.3+i*(mw-0.6)/8,my+0.65,mz-md/2+0.1); box(steel,mw,0.06,0.06,mx,my+1.18,mz-md/2+0.1);
    [-1,1].forEach(s=>box(steel,0.3,my,0.3,mx+s*(mw/2-0.3),my/2,mz-md/2+0.4));
    for(let i=0;i<16;i++) box(greyM,1.1,0.1,0.5,mx+mw/2+0.8,0.12+i*(my/16),mz+md/2-0.3-i*0.5);                  /* stairs: 16 treads climbing towards the front along the mezzanine's side */
    bx("mezzanine",mx,my/2,mz,mw/2,my/2,md/2); }
  /* ---- merge the small solids: one mesh per material ---- */
  Object.keys(parts).forEach(k=>{ const e=parts[k]; const m=add(mergeG(e.g),e.m,0,0,0); m.receiveShadow=true; });
  const over=new THREE.Group(); G.add(over); Object.keys(hi).forEach(k=>{ const e=hi[k]; const m=new THREE.Mesh(mergeG(e.g),e.m); m.raycast=()=>{}; over.add(m); });

  return { group:G, boxes, slots:[], zF, zN:-L/2, sp:0, stand:{}, size:{Hw,wH,arch,zF,zB},
    update(cp){ const inside=Math.abs(cp.x)<Hw&&cp.z>zF&&cp.z<zB&&cp.y<wH+arch*0.9; if(over.visible!==inside) over.visible=inside; },
    setNight(on){ world.setNight(on); night.forEach(([m,d,n])=>m.color.copy(lin(on?n:d))); const v=on?0.42:1; [wMat,wMat2,lowM,roofM,fm].forEach(m=>m.color.setRGB(v,v,on?v*1.12:v)); } };
}
