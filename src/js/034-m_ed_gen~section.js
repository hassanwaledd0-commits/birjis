/* ---------- (hg) the world outside the hangar (owner's request «خلي اكو عالم خارجي خارج الهنجر»): an apron in front of the open door, a taxiway, a runway, a terminal with jet bridges and a few parked airliners,
   a control tower, two neighbouring hangars, a fuel farm, light poles, ground vehicles, trees, a fence and distant hills. All drawn from scratch, merged per material (a handful of draw calls),
   no signs, text or logos. hgWorld(G,c,D) adds it to the hangar group and returns {setNight(on)}. The hangar front (the door) is at z = D.zF (nose side, -z). ---------- */
function hgWorld(G,c,D){
  const PI=Math.PI, lin=apLin, Hw=D.Hw, zF=D.zF, zB=D.zB, wH=D.wH, S=Math.max(1,c.L/40), parts={}, night=[];
  const MS=(col,r,m,o)=>new THREE.MeshStandardMaterial(Object.assign({color:lin(col),roughness:r===undefined?0.8:r,metalness:m||0},o));
  const MB=(col)=>new THREE.MeshBasicMaterial({color:lin(col),fog:true});
  const mk={}, mat=(col,r,m)=>{ const k=col+"|"+r+"|"+m; return mk[k]||(mk[k]=MS(col,r,m)); };
  const P=(m,g)=>{ (parts[m.uuid]=parts[m.uuid]||{m,g:[]}).g.push(g); };
  const box=(m,w,h,d,x,y,z)=>P(m,new THREE.BoxGeometry(w,h,d).translate(x,y,z));
  const cyl=(m,r,len,x,y,z,seg,r2)=>P(m,new THREE.CylinderGeometry(r2===undefined?r:r2,r,len,seg||12).translate(x,y,z));
  const cylx=(m,r,len,x,y,z,seg)=>P(m,new THREE.CylinderGeometry(r,r,len,seg||12).rotateZ(PI/2).translate(x,y,z));
  const cylz=(m,r,len,x,y,z,seg)=>P(m,new THREE.CylinderGeometry(r,r,len,seg||12).rotateX(PI/2).translate(x,y,z));
  const sph=(m,r,x,y,z,sx,sy,sz)=>P(m,new THREE.SphereGeometry(r,10,7).scale(sx||1,sy||1,sz||1).translate(x,y,z));
  const plane=(m,w,d,x,y,z,rep)=>{ const g=new THREE.PlaneGeometry(w,d).rotateX(-PI/2); const o=new THREE.Mesh(g,m); o.position.set(x,y,z); o.receiveShadow=true; o.raycast=()=>{}; G.add(o); return o; };
  let seed=4242; const R=()=>{ seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
  const white=mat("#eceff0",0.5,0.1), grey=mat("#9aa3a9",0.6,0.2), dark=mat("#2f353b",0.7,0.2), steel=mat("#7d868e",0.5,0.5), yel=mat("#e3b82b",0.55,0.1), red=mat("#c8463b",0.55,0.1), blue=mat("#3d6fa8",0.6,0.1), conc=mat("#b9bcbc",0.9,0), rub=mat("#1b1e21",0.9,0);
  const glassD=MB("#8fb3c9"); night.push([glassD,"#8fb3c9","#f1c27a"]); const lamp=MB("#fff2d6"); night.push([lamp,"#fff2d6","#ffd9a0"]);

  /* ---- ground: grass, apron, taxiway, runway (drawn with canvas textures; the hangar floor itself lies inside the hangar) ---- */
  const grassT=apTex(256,256,(g,w,h)=>{ g.fillStyle="#6f8a4c"; g.fillRect(0,0,w,h); apNoise(g,w,h,9000,70,150,0.55); for(let i=0;i<30;i++){ g.fillStyle=`rgba(${60+R()*40|0},${90+R()*40|0},50,.16)`; g.fillRect(R()*w,R()*h,20+R()*40,10+R()*30); } },[160,160]);
  const grass=plane(MS("#ffffff",1,0,{map:grassT}),3600,3600,0,-0.12,zF-400);
  const aprT=apTex(512,512,(g,w,h)=>{ g.fillStyle="#a2a6a8"; g.fillRect(0,0,w,h); apNoise(g,w,h,14000,125,185,0.45); g.strokeStyle="rgba(50,54,58,.5)"; g.lineWidth=2.5; for(let i=0;i<=4;i++){ g.beginPath(); g.moveTo(i*w/4,0); g.lineTo(i*w/4,h); g.stroke(); g.beginPath(); g.moveTo(0,i*h/4); g.lineTo(w,i*h/4); g.stroke(); } },[1,1]);
  const apW=2*Hw+420, apD=420; aprT.repeat.set(apW/20,apD/20);
  plane(MS("#ffffff",0.92,0,{map:aprT}),apW,apD,0,-0.06,zF-apD/2+6);                                    /* the apron in front of the door */
  const lineMat=(w,d,draw)=>MS("#ffffff",0.85,0,{map:apTex(512,64,draw,null)});
  const tx=MS("#ffffff",0.9,0,{map:apTex(256,256,(g,w,h)=>{ g.fillStyle="#6a6e71"; g.fillRect(0,0,w,h); apNoise(g,w,h,9000,70,120,0.5); },[1,1])}); tx.map.repeat.set(30,1400/50);
  plane(tx,36,1700,-300,-0.04,zF-330).rotation.y=PI/2;                                                        /* taxiway running across the front */
  const rwT=apTex(256,1024,(g,w,h)=>{ g.fillStyle="#4a4f53"; g.fillRect(0,0,w,h); apNoise(g,w,h,22000,40,110,0.5); g.fillStyle="#f1f1ee"; g.fillRect(8,0,5,h); g.fillRect(w-13,0,5,h); for(let y=60;y<h-60;y+=90) g.fillRect(w/2-3,y,6,45); for(let k=0;k<8;k++){ g.fillRect(24+k*24,8,12,70); g.fillRect(24+k*24,h-78,12,70); } },[1,1]);
  rwT.repeat.set(1,3200/1024*1.0);
  const rw=plane(MS("#ffffff",0.9,0,{map:rwT}),60,3200,0,-0.03,zF-700); rw.rotation.y=PI/2;                      /* the runway: along x */
  /* yellow taxi lines: from the door to the taxiway, along the taxiway */
  const yl=MS("#e6b51d",0.7,0); box(yl,0.5,0.06,300,0,-0.02,zF-150); box(yl,0.5,0.06,1700,0,0,0); G.children.length;
  P(yl,new THREE.BoxGeometry(1700,0.06,0.5).translate(-300,0.0,zF-330)); P(yl,new THREE.BoxGeometry(18,0.06,0.5).translate(0,0.0,zF-12));
  [-1,1].forEach(s=>P(yl,new THREE.BoxGeometry(1700,0.06,0.3).translate(-300,0.0,zF-330+s*15.5)));

  /* ---- buildings: control tower, terminal with bridges, neighbouring hangars, fuel farm ---- */
  const tw=Hw+110*S, tz=zF-260*S;
  cyl(mat("#c9ccce",0.7,0.1),4.5,70,tw,35,tz,16,6.5); cyl(mat("#c9ccce",0.7,0.1),13,8,tw,74,tz,20,10); cyl(glassD,13.5,5.5,tw,74,tz,20); cyl(white,14.5,1.2,tw,79,tz,20); cyl(steel,0.3,16,tw,87,tz,6); box(red,1.2,1.2,1.2,tw,95.5,tz);
  const tmx=-(Hw+240*S), tmz=zF-300*S, tl=300;
  box(white,70,18,tl,tmx,9,tmz); box(glassD,0.4,12,tl-6,tmx+35.3,8.5,tmz); box(grey,86,2,tl+20,tmx+10,19,tmz); box(grey,6,22,tl,tmx-34,11,tmz);
  for(let k=0;k<9;k++){ const z=tmz-tl/2+20+k*(tl-40)/8; box(grey,3.2,3.4,38,tmx+52,6.5,z); cyl(white,2.6,7.2,tmx+68,3.6,z+18,12); box(yel,5,3.6,4,tmx+36,6.5,z); }       /* the jet bridges along the terminal front */
  [-1,1].forEach((s,i)=>{ const hx=s*(Hw+90+30*i), hz=zB-80-i*50, hm=mat("#aeb5ba",0.6,0.2); box(hm,70,22,150,hx,11,hz); P(mat("#c3c9cd",0.6,0.2),new THREE.CylinderGeometry(35,35,150,20,1,false,PI/2,PI).rotateX(PI/2).scale(1,0.34,1).translate(hx,22,hz)); box(dark,40,16,0.4,hx,8,hz-75.3); });   /* neighbouring hangars, doors towards the apron */
  for(let k=0;k<10;k++) cyl(white,12,16,Hw+280*S+Math.floor(k/5)*30,8,zF-20-(k%5)*30,18);                      /* fuel farm */

  /* ---- a few simple parked airliners at the terminal (long body, swept wings, fin, tail plane) ---- */
  const jet=(x,z,k,col)=>{ const fm=mat(col,0.5,0.1), L=38*k, r=1.9*k; cylz(fm,r,L*0.78,x,r+1.6*k,z,18); P(fm,new THREE.SphereGeometry(r,16,10).scale(1,1,2).translate(x,r+1.6*k,z-L*0.39-r*0.2)); P(fm,new THREE.ConeGeometry(r,L*0.24,16).rotateX(-PI/2).translate(x,r+1.6*k,z+L*0.39+L*0.12));
    [-1,1].forEach(s=>{ const g=new THREE.BoxGeometry(17*k,0.5*k,6*k); g.rotateY(s*0.5); P(fm,g.translate(x+s*9*k,1.7*k+r*0.2,z+2*k)); cylz(steel,1.1*k,3.6*k,x+s*6.5*k,1.4*k,z-2.5*k,12); P(fm,new THREE.BoxGeometry(6*k,0.3*k,2.6*k).rotateY(s*0.5).translate(x+s*3.4*k,r+1.9*k,z+L*0.36)); });
    P(mat("#3d6fa8",0.5,0.1),new THREE.BoxGeometry(0.4*k,7*k,5*k).translate(x,r+4.8*k,z+L*0.36)); [-0.6,0.6].forEach(dx=>cylz(rub,0.5*k,0.5*k,x+dx*k,0.5*k,z+2*k,10)); cylz(rub,0.45*k,0.45*k,x,0.45*k,z-L*0.3,10); };
  jet(tmx+85,tmz-90,1,"#e6e9ea"); jet(tmx+85,tmz+10,1.05,"#dfe3e5"); jet(tmx+85,tmz+110,1,"#e6e9ea");

  /* ---- ground vehicles near the door, light poles, trees, fence, hills ---- */
  const veh=(x,z,ry,kind)=>{ const g=(gm,w,h,d,px,py,pz)=>{ const q=new THREE.BoxGeometry(w,h,d); q.rotateY(ry); const v=new THREE.Vector3(px,py,pz).applyAxisAngle(new THREE.Vector3(0,1,0),ry); P(gm,q.translate(x+v.x,py,z+v.z)); };
    if(kind==="tug"){ g(yel,2.2,1.6,4,0,1.1,0); g(dark,2.0,0.6,1.4,0,2.0,-0.6); }
    else if(kind==="fuel"){ g(red,2.6,1.4,6,0,1.4,0); P(white,new THREE.CylinderGeometry(1.4,1.4,6,14).rotateX(PI/2).rotateY(ry).translate(x,2.7,z)); }
    else if(kind==="stairs"){ g(white,2.4,1.6,5,0,1.2,0); g(grey,1.8,3.2,1.4,0,3.4,1.4); }
    else { g(blue,1.6,1.1,3.2,0,0.9,0); for(let i=1;i<=3;i++) g(grey,1.7,0.6,2.6,0,0.7,3.2*i); } };
  [[-18,-14,"tug"],[16,-30,"fuel"],[-30,-46,"stairs"],[28,-70,"bag"],[-42,-80,"bag"],[40,-110,"tug"]].forEach(([dx,dz,k],i)=>veh(dx,zF+dz*0.8-12,(i*0.7)%PI,k));
  for(let i=0;i<14;i++){ const z=zF-30-i*26, x=(i%2?1:-1)*(Hw+34); cyl(steel,0.25,16,x,8,z,6); box(lamp,2.2,0.3,1.0,x,16.2,z); }                    /* the light poles along the apron */
  for(let i=0;i<150;i++){ const x=(R()-0.5)*2600, z=zF-80-R()*2000; if(Math.abs(x)<Hw+120&&z>zF-460) continue; if(Math.abs(z-(zF-330))<40||Math.abs(z-(zF-700))<60) continue; const h=5+R()*5; cyl(mat("#6b5a3e",0.9,0),0.3,h,x,h/2,z,6); sph(mat(R()<0.5?"#4f7a3a":"#5d8c43",0.9,0),2.2+R()*1.6,x,h+1.2,z); }
  for(let k=-6;k<=6;k++){ cyl(steel,0.1,2.4,k*52,1.2,zF-1000,5); } P(mat("#9aa3a9",0.6,0.4),new THREE.BoxGeometry(2800,2.4,0.05).translate(0,1.2,zF-1000));
  const hills=[[-900,-1500,260,130,"#7f8e6c"],[-300,-1700,320,150,"#8a9774"],[420,-1650,300,120,"#7b8a6a"],[1000,-1400,280,140,"#8f9a7c"],[1500,-900,260,110,"#7f8e6c"],[-1500,-1000,300,120,"#8a9774"],[-1200,200,260,100,"#7b8a6a"],[1300,300,260,120,"#8f9a7c"]];
  hills.forEach(([x,z,w,h,col])=>{ const m=mat(col,1,0); P(m,new THREE.SphereGeometry(1,16,8).scale(w,h,w*0.8).translate(x,h*-0.25,z)); });

  Object.keys(parts).forEach(k=>{ const e=parts[k]; const mg=mergeG(e.g); const o=new THREE.Mesh(mg,e.m); o.raycast=()=>{}; o.receiveShadow=true; G.add(o); });
  return { setNight(on){ night.forEach(([m,d,n])=>m.color.copy(lin(on?n:d))); [grass.material,rw.material].forEach(m=>{ const v=on?0.35:1; m.color.setRGB(v,v,on?v*1.1:v); }); Object.keys(mk).forEach(k=>{ const m=mk[k]; if(m.userData.hgN===undefined) m.userData.hgN=m.color.clone(); m.color.copy(m.userData.hgN).multiplyScalar(on?0.4:1); }); } };
}
