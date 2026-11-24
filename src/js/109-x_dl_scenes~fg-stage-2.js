/* ---------- fg stage 2: the airport (terminal, jet bridges, parked aircraft, tower, hangars, masts), all its lights, instanced city towers and trees.
   Everything static is merged by material (apMerge) so the whole airport is a handful of draw calls; lights are ONE Points draw; towers one instanced draw; trees one instanced draw. ---------- */
function fgPatchFog(m,AU){   /* make a standard material use the same height fog / sky-coloured haze as the ground */
  m.fog=false; m.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,AU);
    sh.vertexShader="varying vec3 vFgW;\n"+sh.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\n vFgW=(modelMatrix*vec4(transformed,1.0)).xyz;");
    sh.fragmentShader="varying vec3 vFgW;\n"+sh.fragmentShader.replace("#include <common>","#include <common>\n"+fgAtmo).replace("#include <tonemapping_fragment>","gl_FragColor.rgb=fgFog(gl_FragColor.rgb,vFgW);\n#include <tonemapping_fragment>"); };
  m.customProgramCacheKey=()=>"fgfog"; return m; }
function fgSlab(r0,r1,t0,t1,span,dy,th){   /* a tapered, swept, thin slab (wing / stabiliser); root leading edge at z=r0, trailing r1, tip t0,t1 at x=span */
  const p=[[0,0,r0],[0,0,r1],[span,dy,t1],[span,dy,t0]], P=[]; [[0,1,2,0,2,3],[4,6,5,4,7,6]].forEach(()=>{}); const v=[]; p.forEach(a=>v.push(a)); p.forEach(a=>v.push([a[0],a[1]-th,a[2]]));
  const f=[[0,1,2],[0,2,3],[4,6,5],[4,7,6],[0,4,5],[0,5,1],[1,5,6],[1,6,2],[2,6,7],[2,7,3],[3,7,4],[3,4,0]]; f.forEach(t=>t.forEach(i=>P.push(...v[i])));
  const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(P,3)); g.computeVertexNormals(); return g; }
function fgLightMat(LU){   /* light fixtures as screen-space points: size follows the fixture (0.1-0.5 m) with distance, clamped to ~1.6 px .. 8-15 px so nothing becomes a disc, small hot core, capped colour so overlapping lights never blow out */
  return new THREE.ShaderMaterial({uniforms:LU,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:fgAtmo+`attribute vec3 aCol; attribute vec2 aP; uniform float uPx,uLightK,uPR; uniform vec4 uPapi; varying vec3 vC;
      void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); float dist=length(mv.xyz), code=floor(aP.y+0.001), ph=aP.y-code, nat=aP.x*uPx/max(dist,2.0), mn=1.6*uPR, mx=(7.0+3.0*min(aP.x,2.6))*uPR, sz=clamp(nat*1.6,mn,mx);
        vec3 c=aCol; float b=1.0;
        if(code>=3.0&&code<4.0){ float i=floor(ph*8.0+0.5); float wv=i<0.5?uPapi.x:i<1.5?uPapi.y:i<2.5?uPapi.z:uPapi.w; c=mix(vec3(1.0,0.1,0.06),vec3(1.0,0.97,0.9),wv); b=1.3; }
        else if(code<1.5&&code>0.5){ b=0.35+3.0*exp(-fract(uTime*2.0-ph)*16.0); }
        else if(code<2.5&&code>1.5){ b=step(fract(uTime*0.6+ph),0.5)*1.6+0.05; }
        else if(code>=5.0){ float f=fract(uTime*0.9); b=(step(f,0.05)+step(abs(f-0.18),0.04))*3.5; }
        else if(code>=4.0){ b=step(fract(uTime*0.45),0.12)*3.0+0.15; }
        float fogT=exp(-uFogK*dist*(0.4+0.6*exp(-max(camPos.y,0.0)/uFogH))); float glow=1.0+min(0.5,uFogK*dist*1.2);
        gl_PointSize=min(sz*glow,mx*1.2); vC=min(c*b*uLightK*fogT*min(1.0,0.4+0.6*nat*1.6/sz),vec3(1.25)); gl_Position=projectionMatrix*mv; }`,
    fragmentShader:"varying vec3 vC; void main(){ vec2 p=gl_PointCoord-0.5; float r=length(p)*2.0; float a=exp(-r*r*5.0)*0.7+0.75*exp(-r*r*28.0); if(r>1.0) discard; gl_FragColor=vec4(vC*a,1.0); }"});
}
function fgAirBuild(scene,AU,W){
  const V3=THREE.Vector3, M=THREE.Matrix4, MS=(c,r,m)=>fgPatchFog(new THREE.MeshStandardMaterial({color:c,roughness:r===undefined?0.7:r,metalness:m||0}),AU), cache={}, mat=(c,r,m)=>cache[c+"/"+r+"/"+m]||(cache[c+"/"+r+"/"+m]=MS(c,r,m));
  const grp=new THREE.Group(); let seed=4242; const R=()=>{ seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
  const add=(geo,m,x,y,z,ry,rx)=>{ const o=new THREE.Mesh(geo,m); o.position.set(x,y,z); if(ry) o.rotation.y=ry; if(rx) o.rotation.x=rx; grp.add(o); return o; };
  const box=(w,h,l,x,y,z,m,ry)=>add(new THREE.BoxGeometry(w,h,l),m,x,y,z,ry), cyl=(r0,r1,h,x,y,z,m,seg)=>add(new THREE.CylinderGeometry(r0,r1,h,seg||14),m,x,y,z);
  const white=mat("#e9ebec",0.55), grey=mat("#9aa2a8",0.6), dark=mat("#2b3136",0.5), concrete=mat("#b9b6ae",0.85), orange=mat("#e7792b",0.6), yellow=mat("#e8c21d",0.6), steel=mat("#7d868d",0.4,0.5), red=mat("#b8312a",0.6), tailC=["#1f5fbf","#d1382c","#1f8a5b","#e0a21a","#6a3fa0","#16a0b8"].map(c=>mat(c,0.5));
  /* facade textures (day glass / night windows) */
  const facD=fwMkCanvasTex(128,64,(g,w,h)=>{ g.fillStyle="#3f5a6c"; g.fillRect(0,0,w,h); for(let i=0;i<4;i++){ g.fillStyle=i%2?"#58788c":"#4a6b80"; g.fillRect(0,i*16+1,w,13); } g.fillStyle="#d8dde0"; for(let x=0;x<w;x+=16) g.fillRect(x,0,2,h); g.fillRect(0,0,w,2); },true);
  const facN=fwMkCanvasTex(128,64,(g,w,h)=>{ g.fillStyle="#000"; g.fillRect(0,0,w,h); for(let i=0;i<4;i++) for(let x=0;x<w;x+=16){ const v=0.55+0.45*((x*7+i*13)%5)/4; g.fillStyle=`rgb(${255*v|0},${200*v|0},${130*v|0})`; g.fillRect(x+3,i*16+2,11,11); } },true);
  [facD,facN].forEach(t=>{ t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=4; });
  const glass=fgPatchFog(new THREE.MeshStandardMaterial({color:0xffffff,map:facD,emissive:0xffffff,emissiveMap:facN,emissiveIntensity:0,roughness:0.2,metalness:0.35}),AU);
  const facade=(w,h,l,x,y,z,ry)=>{ const g=new THREE.BoxGeometry(w,h,l), uv=g.attributes.uv; const fs=[[l,h],[l,h],[w,l],[w,l],[w,h],[w,h]]; for(let f=0;f<6;f++) for(let k=0;k<4;k++){ const i=f*4+k; uv.setXY(i,uv.getX(i)*fs[f][0]/12,uv.getY(i)*fs[f][1]/6); } return add(g,glass,x,y,z,ry); };
  /* the airport is built from a layout (x_fly_apt.js fkLayout): terminal, jet bridges, parked aircraft, tower, hangars, tanks, masts and all the lights; rebuilt when the airport changes */
  let stat=null, lights=null, nb=null, nbL=null, curLy=null, nbTier=2; const LU=Object.assign({uPx:{value:600},uLightK:{value:0},uPR:{value:1},uPapi:{value:new THREE.Vector4(1,1,1,1)}},AU), lmat=fgLightMat(LU), ST={light:null};
  /* neighbour aircraft (x_fly_vis.js): baked + merged for the current detail tier; rebuilt when the airport or the tier changes */
  const nbMake=()=>{ if(nb){ scene.remove(nb); fvNbDispose(nb); nb=null; } if(nbL){ scene.remove(nbL); nbL.geometry.dispose(); nbL=null; } if(!curLy) return; FV.tier=nbTier;
    const r=fvNbBuild(curLy,AU,nbTier); nb=r.group; scene.add(nb); const q=r.lights, g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(q.P,3)); g.setAttribute("aCol",new THREE.Float32BufferAttribute(q.C,3)); g.setAttribute("aP",new THREE.Float32BufferAttribute(q.A,2));
    nbL=new THREE.Points(g,lmat); nbL.frustumCulled=false; nbL.renderOrder=6; nbL.visible=LU.uLightK.value>0.005; scene.add(nbL); };
  const bridge=(sg,x0,x1,z,y,mt)=>{ const m=mt||grey, xc=(x0+x1)/2, ln=Math.abs(x1-x0); box(ln,3.2,3.0,sg*xc,y,z,m); cyl(3.4,3.4,y+0.6,sg*x1,(y+0.6)/2,z,white,12); box(5,3.4,4.2,sg*x0,y,z,yellow); box(2.4,y-1.6,2.4,sg*(xc),(y-1.6)/2,z,grey); };
  const build=(Ly)=>{
    if(stat){ scene.remove(stat); stat.traverse(o=>{ if(o.geometry) o.geometry.dispose(); }); }
    if(lights){ scene.remove(lights); lights.geometry.dispose(); }
    while(grp.children.length){ const o=grp.children[0]; grp.remove(o); if(o.geometry) o.geometry.dispose(); }
    const sg=Ly.sg, len=Ly.len, tw=Ly.tw, X=x=>sg*x, zc=Ly.term.z, tl=Ly.term.len, xf=Ly.xf, xn=Ly.xn;
    /* terminal: glass body, roof canopy, columns; a jet bridge at every stand (nose-in: the aircraft face the terminal) */
    facade(110,22,tl,X(xf+55),11,zc); box(116,3,tl+30,X(xf+52),23.5,zc,white); box(150,2,tl+50,X(xf+10),27.2,zc,white); box(10,4,tl,X(xf+108),24,zc,grey);   /* (v24) a much bigger terminal: deeper, taller, wider canopy */
    facade(80,30,tl*0.72,X(xf+160),15,zc); box(86,3,tl*0.72+10,X(xf+160),31.5,zc,white); box(70,28,tl*0.5,X(xf+250),14,zc,concrete); for(let k=1;k<5;k++) box(70.4,0.6,tl*0.5+0.4,X(xf+250),k*5.6,zc,white);   /* second block and a multi-storey car park */
    for(let k=0;k*38<tl;k++) box(1.6,27,1.6,X(xf-8),13.5,zc+tl/2-k*38-6,white);
    /* jet bridges at the neighbour stands, docked to the first main door of the aircraft that stands there (left side of the aircraft: -z for sg>0); the aircraft themselves are baked in x_fly_vis.js (fvNbBuild) */
    const nbp=fvNbPlan(Ly); Ly.stands.forEach((st,i)=>{ if(i===Ly.gate) return; const e=nbp.by[i], d=e?fvDoor(e.key):{X:5.4,z:3.45,hw:2.0}; if(e) bridge(sg,xn-d.X-0.6,xf-4,st.z-sg*(d.hw+2.6),d.z); else bridge(sg,xf-4-13,xf-4,st.z-sg*(d.hw+2.6),d.z); });   /* (v36) a stand without an aircraft keeps its bridge parked against the terminal */
    /* tower, hangars, fuel tanks, radar, masts, windsock, localizer, glide slope */
    const tx=Ly.tower.x, tz=Ly.tower.z; cyl(3.6,5.4,96,tx,48,tz,concrete,16); cyl(13.5,10.5,8,tx,100,tz,glass,20); cyl(14.5,14.5,1.2,tx,104.8,tz,white,20); cyl(0.3,0.3,18,tx,114,tz,steel,6); cyl(7,7,2.5,tx,95.5,tz,grey,16);   /* (v24) a taller tower */
    Ly.hangars.forEach(([x,z,l])=>{ box(130,24,l*1.3,x,12,z,grey); box(120,5,l*1.3+2,x,26.5,z,white); box(2,16,70,x-sg*66,8,z,dark); });
    for(let k=0;k<14;k++) cyl(13,13,18,Ly.tanks.x+sg*Math.floor(k/4)*34,9,Ly.tanks.z-(k%4)*34,white,18);
    const rx=X(tw+68), rz=-len+300; cyl(2.2,2.2,14,rx,7,rz,white,10); add(new THREE.SphereGeometry(6,14,10),white,rx,18,rz);
    Ly.masts.forEach(([x,z])=>{ cyl(0.45,0.7,28,x,14,z,steel,6); box(3.4,0.7,2.2,x,28.2,z,white); });
    const wx=-sg*58; cyl(0.15,0.15,8,wx,4,-380,steel,5); add(new THREE.CylinderGeometry(0.95,0.35,4.2,10,1,true).rotateZ(Math.PI/2),orange,wx+2.2,8,-380); add(new THREE.CylinderGeometry(0.6,0.35,2.4,10,1,true).rotateZ(Math.PI/2),white,wx+4.8,8,-380);
    const lz=-len-280; for(let k=-7;k<=7;k++){ box(0.15,2.6,0.15,k*2.6,1.4,lz,steel); } box(40,0.3,0.3,0,2.9,lz,steel); cyl(0.2,0.2,14,-sg*135,7,-340,steel,6); box(2.2,1.2,1.2,-sg*135,13.5,-340,white);
    stat=apMerge(grp); scene.add(stat); while(grp.children.length){ const o=grp.children[0]; grp.remove(o); o.traverse(m=>{ if(m.geometry) m.geometry.dispose(); }); }
    /* ---- lights: one Points draw ---- */
    const P=[], C=[], A=[]; const LL=(x,y,z,r,g,b,sz,code)=>{ P.push(x,y,z); C.push(r,g,b); A.push(sz,code||0); };
    const WH=[1,0.93,0.8], YE=[1,0.72,0.2], GR=[0.2,1,0.4], RD=[1,0.12,0.08], BL=[0.25,0.45,1], pl=(x,y,z,c,s,code)=>LL(x,y,z,c[0],c[1],c[2],s,code), hw=Ly.w/2+1;
    for(let z=0;z>=-len;z-=60){ const yel=(-z<600||-z>len-600), c=yel?YE:WH; pl(-hw,0.45,z,c,0.55); pl(hw,0.45,z,c,0.55); }
    for(let z=0;z>=-len;z-=15){ const e=-z, c=e>len-300?RD:(e>len-900&&Math.floor(e/15)%2)?RD:WH; pl(0,0.2,z,c,0.45); }
    for(let k=-8;k<=8;k++){ pl(k*3.4,0.4,1,GR,0.5); pl(k*3.4,0.4,-len-1,RD,0.5); }
    for(let z=-30;z>=-900;z-=30) [-1,1].forEach(s=>[0,1,2].forEach(k=>pl(s*(4.5+k*1.5),0.25,z,WH,0.4)));
    for(let k=0;k<30;k++){ const z=30+k*30; for(let j=-2;j<=2;j++) pl(j*1.3,1.1,z,WH,0.6,1+k/30); }
    [150,300,450,600,750].forEach(z=>{ for(let j=1;j<=(z===300?9:7);j++) [-1,1].forEach(s=>pl(s*(2.5+j*1.5),1.1,z,WH,0.6)); });
    for(let z=30;z<=270;z+=30) [-1,1].forEach(s=>{ pl(s*10,1.1,z,RD,0.6); pl(s*13,1.1,z,RD,0.6); pl(s*16,1.1,z,RD,0.6); });
    for(let i=0;i<4;i++) LL(-sg*(40+i*9.5),1.3,-300,1,1,1,1.3,3+i/8);
    for(let z=-len-100;z<=100;z+=25){ pl(X(tw)-11.9,0.4,z,BL,0.5); pl(X(tw)+11.9,0.4,z,BL,0.5); } for(let z=-len-100;z<=100;z+=15) pl(X(tw),0.2,z,GR,0.4);
    Ly.ex.forEach(cz=>{ for(let x=34;x<=tw-4;x+=22){ pl(X(x),0.4,cz-12,BL,0.5); pl(X(x),0.4,cz+12,BL,0.5); } for(let x=36;x<=tw-4;x+=14) pl(X(x),0.2,cz,GR,0.4); });
    Ly.links.forEach(cz=>{ for(let x=tw+16;x<=Ly.xl;x+=18){ pl(X(x),0.4,cz-15,BL,0.5); pl(X(x),0.4,cz+15,BL,0.5); } for(let x=tw+4;x<=Ly.xl;x+=14) pl(X(x),0.2,cz,GR,0.4); });
    for(let z=Ly.zs;z>=Ly.zn;z-=15){ pl(X(Ly.xl)-14.5,0.4,z,BL,0.5); pl(X(Ly.xl)+14.5,0.4,z,BL,0.5); }
    Ly.masts.forEach(([x,z])=>{ for(let k=0;k<3;k++) pl(x+k*1.2-1.2,28.0,z,[1,0.92,0.75],2.6); });
    for(let z=Ly.zn+30;z<=Ly.zs-30;z+=14) pl(X(xf-1),17,z,[1,0.78,0.5],1.1);
    pl(tx,115,tz,[1,1,1],1.6,4); pl(rx,24.5,rz,RD,0.0+1.0,2); Ly.hangars.forEach(([x,z,l])=>pl(x,29,z,RD,0.9,2));
    const geoL=new THREE.BufferGeometry(); geoL.setAttribute("position",new THREE.Float32BufferAttribute(P,3)); geoL.setAttribute("aCol",new THREE.Float32BufferAttribute(C,3)); geoL.setAttribute("aP",new THREE.Float32BufferAttribute(A,2));
    lights=new THREE.Points(geoL,lmat); lights.frustumCulled=false; lights.renderOrder=6; lights.visible=LU.uLightK.value>0.005; scene.add(lights); ST.lights=lights;
    Ly.masts.slice(0,8).forEach(([x,z],i)=>AU.uFl.value[i].set(x,z,125,AU.uFl.value[i].w)); for(let i=Ly.masts.length;i<8;i++) AU.uFl.value[i].set(0,0,1,0);
    curLy=Ly; nbMake();
  };
  /* ---- instanced trees: billboards wrapped around the camera so they exist everywhere the ground says there is vegetation ---- */
  const trT=fwMkCanvasTex(128,64,(g,w,h)=>{ g.clearRect(0,0,w,h); g.lineCap="round";
    g.strokeStyle="#5a4630"; g.lineWidth=3.2; g.beginPath(); g.moveTo(32,63); g.quadraticCurveTo(35,38,31,16); g.stroke();
    for(let i=0;i<9;i++){ const a=-Math.PI*0.95+i*Math.PI*1.9/8, L=22+(i%2)*4; g.strokeStyle=i%2?"#2f6a2a":"#3d7d34"; g.lineWidth=3; g.beginPath(); g.moveTo(31,16); g.quadraticCurveTo(31+Math.cos(a)*L*0.6,16+Math.sin(a)*L*0.6-8,31+Math.cos(a)*L,16+Math.sin(a)*L*0.9+6); g.stroke(); }
    g.fillStyle="#2c6226"; for(let i=0;i<26;i++){ const a=Math.random()*6.28, r=Math.random()*15; g.beginPath(); g.arc(96+Math.cos(a)*r,44+Math.sin(a)*r*0.8,5+Math.random()*5,0,7); g.fill(); g.fillStyle=i%3?"#2c6226":"#3b7a31"; } },true);
  const NT=1800, tg=new THREE.InstancedBufferGeometry(); tg.setAttribute("position",new THREE.Float32BufferAttribute([-0.5,0,0,0.5,0,0,0.5,1,0,-0.5,1,0],3)); tg.setAttribute("uv",new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,1],2)); tg.setIndex([0,1,2,0,2,3]);
  const tr=new Float32Array(NT*4); for(let i=0;i<tr.length;i++) tr[i]=R(); tg.setAttribute("aR",new THREE.InstancedBufferAttribute(tr,4)); tg.instanceCount=NT;
  const tm=new THREE.ShaderMaterial({uniforms:Object.assign({uTex:{value:trT}},AU),side:THREE.DoubleSide,
    vertexShader:fgTerr+`attribute vec4 aR; uniform vec3 camPos; varying vec2 vUv; varying vec3 vW; varying float vT,vS;
      float fgVeg(vec2 w){ vec2 ab=abs(w-uAp.xy)-uAp.zw; if(max(ab.x,ab.y)<0.0) return 0.0; float s=fkWaterS(w); if(s>-20.0) return 0.0; float rd=fkRoadInfo(w).x, road=1.0-smoothstep(16.0,46.0,rd), forest=uTrn.y*smoothstep(0.55,0.7,fgT(w/2300.0+0.9).g)*0.9, rip=exp(s/200.0)*0.5*min(1.0,uTrn.x*3.0+0.3);
        return max(max(fgFarmM(w)*0.5,fgTownM(w)*0.28),max(max(road*0.4,forest),max(rip,uTrn.x*0.12))); }
      void main(){ float per=2600.0; vec2 c=aR.xy*per; c+=per*floor((camPos.xz-c)/per+0.5); float dist=length(c-camPos.xz); float on=step(aR.z,fgVeg(c))*(1.0-smoothstep(1100.0,1550.0,dist));
        float h=fgH(c,0.0); float pm=step(1.0-uPalm,aR.w); float sz=mix(2.4,mix(9.0,13.0,aR.w),pm)*on; vec3 rt=normalize(vec3(camPos.z-c.y,0.0,c.x-camPos.x)); vec3 p=vec3(c.x,h,c.y)+rt*position.x*sz*(0.5+0.5*pm+0.7*(1.0-pm))+vec3(0.0,position.y*sz,0.0);
        vUv=vec2(uv.x*0.5+0.5*(1.0-pm),uv.y); vW=p; vT=pm; vS=aR.w; gl_Position=projectionMatrix*viewMatrix*vec4(p,1.0); }`,
    fragmentShader:fgAtmo+`uniform sampler2D uTex; varying vec2 vUv; varying vec3 vW; varying float vT,vS;
      void main(){ vec4 t=texture2D(uTex,vUv); if(t.a<0.45) discard; vec3 col=t.rgb*t.rgb*(0.75+0.5*fract(vS*7.0))*(uAmb*0.9+uLCol*0.45); gl_FragColor=vec4(fgFog(col,vW),1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }`});
  const trees=new THREE.Mesh(tg,tm); trees.frustumCulled=false; scene.add(trees);
  /* floodlight pools on the apron (night / dusk) */
  return {build,bridge,trees,glass,LU,nbTier:(t)=>{ if(t!==nbTier){ nbTier=t; nbMake(); } },get lights(){ return lights; },update:(papiAng)=>{ const th=[2.5,2.83,3.17,3.5]; LU.uPapi.value.set(papiAng>th[0]?1:0,papiAng>th[1]?1:0,papiAng>th[2]?1:0,papiAng>th[3]?1:0); },
    setLight:(k,lamp,glassE)=>{ LU.uLightK.value=k; if(lights) lights.visible=k>0.005; if(nbL) nbL.visible=k>0.005; fvGlow(glassE); AU.uLamp.value=lamp; glass.emissiveIntensity=glassE; AU.uFl.value.forEach(v=>{ v.w=lamp*0.9; }); }};
}
