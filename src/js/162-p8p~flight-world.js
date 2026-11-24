/* ---------- flight world: sky, terrain, airport, clouds, lights (used by the flight simulator, p8f.js) ----------
   World axes as in p8p.js: x east, y up, z south. Runway 36 starts at the origin and runs north (-z) for 3600 m.
   Atmosphere / sky / flare: x_fly_sky.js. Per time preset: sun [x,y,z] (y = elevation), E sky scale, D direct sun scale, ex tone-map exposure, mie haze. Per weather: vis (m), fh (haze scale height, m), cover (overcast 0-1). */
const FW_TIMES={
  dawn:{ar:"الفجر",sun:[0.93,0.10,-0.35],E:16,D:2.6,ex:1.5,mie:1.0,night:0,lightK:0.7,lamp:0.4,glassE:0.4,sunI:0.9,amb:0.42,cloud:"#ffd1b0"},
  day:{ar:"الظهر",sun:[0.40,0.80,-0.40],E:20,D:3.2,ex:0.9,mie:0.5,ray:1.2,night:0,lightK:0.12,lamp:0,glassE:0,sunI:1.25,amb:0.6,cloud:"#ffffff"},
  dusk:{ar:"الغروب",sun:[-0.50,0.075,-0.86],E:16,D:2.6,ex:1.5,mie:1.0,night:0,lightK:0.9,lamp:0.6,glassE:0.55,sunI:0.8,amb:0.38,cloud:"#ffae88"},
  night:{ar:"الليل",sun:[0.25,-0.5,-0.6],moon:[0.25,0.55,-0.6],E:0,D:0,ex:1.25,night:1,lightK:1,lamp:1,glassE:0.9,sunI:0.3,amb:0.2,cloud:"#222a3c"}
};
const FW_WX={
  clear:{cl:[0,0,0.3,0],wind:0.25,ar:"صافٍ",n:0,vis:60000,fh:2400,cover:0,haze:1,dark:0,turb:0,low:[1300,2400],wet:0},
  scattered:{cl:[0.55,0,0.5,0],wind:0.4,ar:"غيوم متفرقة",n:70,vis:30000,fh:2800,cover:0.1,haze:1.2,dark:0,turb:0.1,low:[1300,2300],wet:0},
  overcast:{cl:[0.25,0.8,0.2,0],wind:0.6,ar:"غائم",n:230,vis:11000,fh:2200,cover:0.8,haze:1.8,dark:0.25,turb:0.35,low:[700,1500],wet:0},
  fog:{cl:[0,0,0,0],wind:0.1,ar:"ضباب",n:0,vis:350,fh:260,cover:0.9,haze:1,dark:0.1,turb:0,low:[1300,2400],wet:0.3,exm:1.1},
  rain:{ar:"مطر",cl:[0.2,1,0,0],rain:0.6,wind:0.8,n:200,vis:6500,fh:1800,cover:0.9,haze:1.6,dark:0.5,turb:0.5,low:[600,1400],wet:1,exm:1.1},
  storm:{cl:[0.3,1,0,0.8],rain:1,storm:1,wind:1,ar:"عاصف",n:210,vis:4500,fh:1800,cover:1,haze:2,dark:0.7,turb:1.0,low:[500,1700],wet:1,exm:1.1}
};
function fwMkCanvasTex(w,h,draw,srgb){ const cv=document.createElement("canvas"); cv.width=w; cv.height=h; draw(cv.getContext("2d"),w,h); const t=new THREE.CanvasTexture(cv); if(srgb!==false) t.encoding=THREE.sRGBEncoding; t.anisotropy=8; return t; }
const FW_GLSL_NOISE=`
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y); }
float fbm(vec2 p){ float a=0.5,s=0.0; for(int i=0;i<5;i++){ s+=a*noise(p); p*=2.03; a*=0.5; } return s; }`;

function fwBuild(){
  const scene=new THREE.Scene(), PI=Math.PI, V3=THREE.Vector3, CL=THREE.Color;
  const W={scene,time:"day",wx:"clear",night:false,exposure:1};
  const AU=fgUniforms();
  scene.fog=new THREE.Fog(0xd3e4f2,4000,90000);
  const skyB=fgSkyBuild(scene,AU), flare=fgFlareBuild(scene);

  /* ---- ground (x_fly_land.js): clipmap terrain, sea, roads, towns, airport surface ---- */
  const land=fgGroundBuild(scene,AU), city=fkCityBuild(scene,AU); W.city=city;


  /* ---- lights ---- */
  const hemi=new THREE.HemisphereLight(0xdfeaf8,0x6a5f50,0.6); scene.add(hemi); const sun=new THREE.DirectionalLight(0xfff2d6,1.2); scene.add(sun); scene.add(sun.target);

  /* ---- airport buildings, lights, city towers, trees (x_fly_air.js) ---- */
  const air=fgAirBuild(scene,AU,W);

  /* ---- clouds, rain (x_fly_cloud.js) ---- */
  const cloud=fgCloudBuild(scene,AU), rain=fgRainBuild(scene,AU), fx=fgFxBuild(scene,AU,W); W.fx=fx; W.sun=sun; W.sunScr=flare.sun; const nT=air.trees.geometry.instanceCount;


  /* ---- presets ---- */
  W.setTime=(name)=>{ const t=FW_TIMES[name]||FW_TIMES.day; W.time=name; W.night=!!t.night; W.applyWx(); };
  W.setWx=(name)=>{ W.wx=name; W.applyWx(); };
  W.applyWx=()=>{ const w=FW_WX[W.wx]||FW_WX.clear, t=FW_TIMES[W.time]||FW_TIMES.day, hz=fgAtmoApply(AU,{sun,hemi},t,w); W.hz=hz; W.exposure=t.ex*(w.exm||1); W.w=w;
    const g=AU.uAmb.value, l=AU.uLCol.value, ld=AU.uLDir.value; W.gnd=[0.4*(l.r*Math.max(ld.y,0)+g.r),0.4*(l.g*Math.max(ld.y,0)+g.g),0.4*(l.b*Math.max(ld.y,0)+g.b)];
    W.amb0=[g.r,g.g,g.b]; { const dk=1-(w.dark||0)*0.5; AU.uCloudCol.value.setRGB((g.r*1.4+l.r*0.35)*dk,(g.g*1.4+l.g*0.35)*dk,(g.b*1.4+l.b*0.35)*dk); }
    scene.fog.color.setRGB(hz[0],hz[1],hz[2]); scene.fog.near=Math.max(40,w.vis*0.25); scene.fog.far=w.vis*1.5;
    air.setLight(t.lightK*(1+0.3*w.cover),t.lamp,t.glassE); fvLightApply(W,{hemi,sun,scene},t,w); AU.uWet.value=w.wet; AU.uWind.value=w.wind; cloud.setWx(w,t); rain.set(w.rain||0); W.turb=w.turb; AU.uCloudK.value=0; cloud.inCloud=0; };
  W.setTier=(t)=>{ W.tier=t; const k=[0.3,0.6,1][t]; cloud.setQuality(k); cloud.setWx(W.w||FW_WX.clear); W.rainQ=k; air.trees.geometry.instanceCount=Math.round(nT*[0.3,0.65,1][t]); city.setTier(t); fx.setTier(t); air.nbTier(t); };
  W.makeEnv=(ren,pm)=>skyB.capture(ren,pm,W.gnd);
  /* per frame: keep the sky under the camera, update PAPI, aircraft shadow, clouds, rain, lightning, flare and the atmosphere uniforms */
  W.update=(cam,pos,hdgRad,span,agl,info,dt,len,vel)=>{
    dt=dt||0.016; AU.camPos.value.copy(cam.position); city.update(cam.position); skyB.mesh.position.copy(cam.position);
    if(info) fvLightTick(W,pos,agl);
    AU.uTime.value+=dt; AU.uDip.value=Math.min(0.12,Math.sqrt(2*Math.max(cam.position.y,0)/6371000));
    const ld=AU.uLDir.value, hh=Math.max(0,pos.y), k=hh/Math.max(0.18,ld.y), ch=Math.cos(hdgRad), sh=Math.sin(hdgRad), fa=1-Math.min(1,hh/1400);
    AU.uShad.value.set(pos.x-ld.x*k,pos.z-ld.z*k,ch,sh); AU.uShad2.value.set(span*1.05,(len||span*0.95)*1.05,0.9*fa*(1-AU.uCover.value*0.6)*(1-AU.uNight.value*0.62),Math.max(Math.min(5,hh/90),AU.uNight.value*2.6));
    if(info){ const dz=Math.max(40,pos.z+300); air.update(Math.atan2(Math.max(0.1,agl+2.5),dz)*180/PI); }
    air.LU.uPx.value=(W.vh||360)*(W.pr||1)/(2*Math.tan(cam.fov*PI/360));
    cloud.update(cam,dt,W.cloudScale); fx.PU.uPx.value=fx.LU.uPx.value=air.LU.uPx.value; fx.PU.uPR.value=fx.LU.uPR.value=W.pr||1;
    if(sun.castShadow){ sun.position.set(pos.x+ld.x*300,pos.y+ld.y*300,pos.z+ld.z*300); sun.target.position.copy(pos); sun.target.updateMatrixWorld(); } else if(sun.target.position.lengthSq()>0){ sun.position.set(ld.x*1000,ld.y*1000,ld.z*1000); sun.target.position.set(0,0,0); sun.target.updateMatrixWorld(); }
    const w=W.w; if(w&&w.rain) rain.set(w.rain*(W.rainQ||1),vel);
    if(w&&w.storm){ W.flT=(W.flT===undefined?4:W.flT)-dt; if(W.flT<0){ W.flT=5+Math.random()*9; W.flA=1; } } const fl=W.flA>0?Math.max(0,Math.sin(W.flA*Math.PI*3))*W.flA:0; if(W.flA>0) W.flA=Math.max(0,W.flA-dt*1.6);
    AU.uFlash.value=fl*0.5; if(w&&w.storm){ const a=W.amb0, g=AU.uAmb.value; g.setRGB(a[0]+fl*0.35,a[1]+fl*0.38,a[2]+fl*0.5); }
    flare.update(cam,AU.uSunDir.value,AU.uSunDisc.value*(1-cloud.inCloud),cam.aspect);
  };
  W.setPR=(pr)=>{ W.pr=pr; air.LU.uPR.value=pr; };
  W.setSize=(h,pr)=>{ W.vh=h; W.pr=pr; air.LU.uPR.value=pr; };
  /* airport: terrain / water / pavement / city uniforms, the airport scenery and the city rings all come from the airport table (x_fly_apt.js) */
  W.setApt=(id)=>{ if(W.aptId===id) return W.L; const a=fkAptById(id); W.aptId=a.id; W.L=fkEnvApply(AU,a); air.build(W.L); city.reset(); if(!W.ships) W.ships=fkShipsBuild(scene,AU); W.ships.place(!!a.env.ships); W.applyWx(); return W.L; };
  W.setApt((typeof FLY!=="undefined"&&FLY.opts&&FLY.opts.apt)||"ORBI");
  W.setTime("day"); W.setWx("clear");
  return W;
}
