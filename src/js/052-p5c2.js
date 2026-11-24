/* ---------- 3D controller v2: lighting, shadows, sky reflections, per-part pull animation ---------- */
const GL = !HAS3D ? null : (()=>{
  const V3=THREE.Vector3, CL=THREE.Color;
  /* r128 keeps hex values as linear light; colours here are sRGB, so convert them first (dark liveries stay dark) */
  const toLin=v=>v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4);
  const linCol=h=>{ const c=new CL(h); c.setRGB(toLin(c.r),toLin(c.g),toLin(c.b)); return c; };
  let ren, scene, cam, host, cvs, pmrem, key, hemi, ground, grid, B=null, running=false, dirty=true, ready=false;
  let mk=null, R0=100, spin=true, touched=false, hoverId=null, drag=null, pinch=0, hoverPend=false, pick=[];
  /* (v31) frame governor: the shadow map is only redrawn when the scene itself changed (the light is fixed), ambient animation (blinking lights, glow, breathing, fan spin) is drawn at ~10 fps and the auto-rotation at ~30 fps,
     and the pixel ratio steps down on a device that cannot keep up. Before this the whole aircraft (~385 draw calls, shadow pass included) was redrawn at full frame rate for ever. */
  let lastSpinT=0, shDirty=true, ambientOn=false, lastMv=false, lastStepT=0, lastFrameT=0, renderedLast=false, slowN=0, prMax=1, prCur=1, accCache=null, accT=-9999;
  let H={}, getState=()=>({}), failed=false, lent=false;
  const env={}, builds={}, sph={theta:Math.PI-0.75,phi:1.12,r:100}, tgt=new V3(), goal={t:new V3(),r:100,on:false};
  const ray=new THREE.Raycaster(), mouse=new THREE.Vector2(), ptrs=new Map();
  const pulled={}; let pulledTgt={};
  const animV={}, animPlay={}, spinA={}, dmO=new THREE.Object3D(), hAx=new THREE.Vector3(), hQ=new THREE.Quaternion(); let lastNow=0, lastDoor=-1, shX=0, shY=0;
  let flowObj=null, flowOn=false, flowKey=null, vgoal=null, camEase=0.12;
  const PULLK=0.24;
  /* (v31) syncI() asks for the system colours once per material (hundreds of getComputedStyle calls on every hover change): cached for a moment, and a copy is returned because callers change it */
  const _cc={};
  const css=n=>{ const t=performance.now(), e=_cc[n]; if(e&&t-e.t<400) return e.c.clone();
    let c; try{ c=new CL(getComputedStyle(document.documentElement).getPropertyValue(n).trim()||"#888888"); }catch(er){ c=new CL("#888888"); } _cc[n]={t,c}; return c.clone(); };
  const isDark=()=>{ const t=document.documentElement.getAttribute("data-theme"); if(t==="dark") return true; if(t==="light") return false; return matchMedia("(prefers-color-scheme: dark)").matches; };
  const pdist=()=>{ const a=[...ptrs.values()]; return a.length<2?1:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1; };
  const clampR=r=>Math.max(R0*0.07,Math.min(R0*2.6,r));
  let stK=1;   /* zoom factor of the fitted distance: 1 normally, larger on the Home stage so the whole aircraft fits next to the text */
  const fitR=()=>R0*stK*Math.max(1,Math.min(1.8,0.9/Math.pow((cam&&cam.aspect)||1.6,0.8)));
  const touch=()=>{ touched=true; goal.on=false; vgoal=null; camEase=0.12; };

  function skyTex(dk){
    /* small equirect (256 x 128) reflected by the glossy paint: deep sky at the zenith, bright haze band at the horizon, a darker warm ground, soft clouds and one sun hot spot */
    const cv=document.createElement("canvas"); cv.width=256; cv.height=128; const g=cv.getContext("2d");
    const gr=g.createLinearGradient(0,0,0,128);
    if(dk){ gr.addColorStop(0,"#1B2A3B"); gr.addColorStop(0.42,"#2A3D52"); gr.addColorStop(0.5,"#3B4E63"); gr.addColorStop(0.52,"#10161C"); gr.addColorStop(1,"#05080B"); }
    else { gr.addColorStop(0,"#5E94CF"); gr.addColorStop(0.3,"#9FC6E8"); gr.addColorStop(0.47,"#E4EFF8"); gr.addColorStop(0.5,"#F7FAFC"); gr.addColorStop(0.53,"#B7B1A4"); gr.addColorStop(0.72,"#7E7F82"); gr.addColorStop(1,"#4B4F54"); }
    g.fillStyle=gr; g.fillRect(0,0,256,128);
    const blob=(x,y,r,col)=>{ const q=g.createRadialGradient(x,y,0,x,y,r); q.addColorStop(0,col); q.addColorStop(1,col.replace(/[\d.]+\)$/,"0)")); g.fillStyle=q; g.fillRect(x-r,y-r,2*r,2*r); };
    if(!dk){ blob(40,34,26,"rgba(255,255,255,0.55)"); blob(150,24,30,"rgba(255,255,255,0.5)"); blob(215,40,22,"rgba(255,255,255,0.45)"); blob(70,28,13,"rgba(255,251,238,1)"); }
    else { blob(70,30,12,"rgba(190,205,230,0.5)"); blob(200,20,24,"rgba(120,140,170,0.25)"); }
    const t=new THREE.CanvasTexture(cv); t.mapping=THREE.EquirectangularReflectionMapping; return t;
  }
  function applyEnv(){
    if(!B||lent) return; const dk=isDark(), e=dk?env.dark:env.light;
    B.mats.forEach(m=>{ m.envMap=e; m.envMapIntensity=dk?0.6:0.42; m.needsUpdate=true; });
  }


  /* ---------- environment: sky dome, apron and runway, clouds (hangar / in flight / studio) ---------- */
  let envMode="hangar", sky=null, apron=null, runway=null, clouds=null, airport=null;
  function cTex(w,h,draw,rep){ const cv=document.createElement("canvas"); cv.width=w; cv.height=h; draw(cv.getContext("2d"),w,h); const t=new THREE.CanvasTexture(cv); t.encoding=THREE.sRGBEncoding; t.wrapS=t.wrapT=THREE.RepeatWrapping; if(rep) t.repeat.set(rep[0],rep[1]); t.anisotropy=Math.min(8,ren.capabilities.getMaxAnisotropy()); return t; }
  function noise(g,w,h,n,a,b){ for(let i=0;i<n;i++){ const v=a+Math.random()*(b-a)|0; g.fillStyle="rgb("+v+","+v+","+v+")"; g.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1+Math.random()*2); } }
  function makeEnv(){
    const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
      uniforms:{top:{value:new CL()},hor:{value:new CL()},bot:{value:new CL()},sun:{value:new THREE.Vector3(0.5,0.45,0.6).normalize()},sunC:{value:new CL()}},
      vertexShader:"varying vec3 vD; void main(){ vD=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
      fragmentShader:"uniform vec3 top; uniform vec3 hor; uniform vec3 bot; uniform vec3 sun; uniform vec3 sunC; varying vec3 vD; void main(){ float h=vD.y; vec3 c=h>0.0?mix(hor,top,pow(min(1.0,h*1.6),0.55)):mix(hor,bot,pow(min(1.0,-h*3.0),0.6)); float s=max(dot(normalize(vD),sun),0.0); c+=sunC*(pow(s,600.0)*1.5+pow(s,12.0)*0.18); gl_FragColor=vec4(c,1.0); }"});
    sky=new THREE.Mesh(new THREE.SphereGeometry(1800,48,24),skyMat); sky.renderOrder=-10; sky.frustumCulled=false; scene.add(sky);
    const apT=cTex(8,8,(g,w,h)=>{ g.fillStyle="#a7aeb3"; g.fillRect(0,0,w,h); },[8,8]);   /* (v36) apron and runway below are never shown (the hangar scene has its own ground): no grain textures */
    apron=new THREE.Mesh(new THREE.PlaneGeometry(2000,2000).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({map:apT,roughness:0.95,metalness:0}));
    apron.receiveShadow=true; apron.position.y=-0.02; scene.add(apron);
    const rwT=cTex(8,8,(g,w,h)=>{ g.fillStyle="#4a4f53"; g.fillRect(0,0,w,h); },[1,35]);
    runway=new THREE.Mesh(new THREE.PlaneGeometry(60,3500).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({map:rwT,roughness:0.9,metalness:0}));
    runway.receiveShadow=true; runway.position.y=0.0; scene.add(runway);
    const clT=cTex(512,512,(g,w,h)=>{ g.clearRect(0,0,w,h); for(let i=0;i<70;i++){ const x=Math.random()*w, y=Math.random()*h, r=20+Math.random()*70, gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,"rgba(255,255,255,0.75)"); gr.addColorStop(1,"rgba(255,255,255,0)"); g.fillStyle=gr; for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++){ g.save(); g.translate(dx*w,dy*h); g.fillRect(x-r,y-r,2*r,2*r); g.restore(); } } },[6,6]);
    clouds=new THREE.Mesh(new THREE.PlaneGeometry(3000,3000).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:clT,transparent:true,depthWrite:false,opacity:0.9}));
    scene.add(clouds); recolorEnv(); applyEnvMode();
  }
  function recolorEnv(){
    if(!sky) return; const dk=isDark(), u=sky.material.uniforms;
    u.top.value.set(dk?"#0a1626":"#5f9bd6"); u.hor.value.set(dk?"#2a3c52":"#dfeaf4"); u.bot.value.set(dk?"#141c24":(envMode==="sky"?"#c9dcef":"#aab3ba")); u.sunC.value.set(dk?"#6d7f99":"#fff4dc");
    apron.material.color.set(dk?"#5a6168":"#ffffff"); runway.material.color.set(dk?"#8c9196":"#ffffff"); clouds.material.color.set(dk?"#6f7d8c":"#ffffff");
    if(scene.fog) scene.fog.color.set(dk?"#1a2636":"#dfeaf4"); if(airport) airport.setNight(dk);
    const nite=dk&&envMode==="hangar", apt=envMode==="hangar"&&!dk;   /* the day hangar is pale concrete and white steel, so it gets a little less light and exposure than the studio */
    const stg=envMode==="stage"; hemi.intensity=stg?0.62:nite?0.3:apt?0.5:0.55; key.intensity=stg?1.9:nite?0.7:apt?1.3:1.55; key.color.set(stg?"#eaf2ff":nite?"#ffe0b0":"#fff6ea"); ren.toneMappingExposure=apt?0.86:1.0;
    dirty=true; shDirty=true;
  }
  function applyEnvMode(){
    if(!sky) return; const m=envMode, on=m!=="studio"&&m!=="stage";   /* "stage" = the Home screen: no sky, floor or fog, the page behind the canvas is the backdrop */
    sky.visible=on; apron.visible=false; runway.visible=false; clouds.visible=m==="sky"; if(airport) airport.group.visible=m==="hangar";
    if(ground) ground.visible=m==="studio"; if(grid) grid.visible=m==="studio";
    scene.fog=on?new THREE.Fog(isDark()?0x1a2636:0xdfeaf4,m==="hangar"?R0*4:R0*3,m==="hangar"?Math.max(R0*20,2600):R0*16):null;
    if(clouds) clouds.position.y=-R0*0.9;
    const gv=(m==="sky"||m==="stage")?1:0; ["gear_nose","gear_main","wheels"].forEach(id=>{ animV[id]=gv; animPlay[id]=false; });
    B&&B.mats.forEach(mt=>{ mt.needsUpdate=true; }); recolorEnv(); dirty=true; shDirty=true;
  }

  /* (v36) phones: a lighter tier. Fewer pixels (1.5 instead of 2), cheaper soft-shadow filter, smaller shadow map and a slower idle spin: the GPU and the main thread were both kept busy by a 30 fps idle render of ~390 draw calls */
  const PHONE=(()=>{ try{ return matchMedia("(max-width:700px)").matches||(matchMedia("(pointer:coarse)").matches&&Math.min(screen.width,screen.height)<700); }catch(e){ return false; } })();
  let ctxLost=false;
  function init(el,opts){
    host=el; H={pick:opts.pick,hover:opts.hover,fail:opts.fail||(()=>{}),frame:opts.frame,lost:opts.lost||(()=>{})}; getState=opts.getState;
    ren=new THREE.WebGLRenderer({antialias:true,alpha:true});
    prMax=prCur=Math.min(window.devicePixelRatio||1,PHONE?1.5:2); ren.setPixelRatio(prCur); ren.setClearColor(0x000000,0);
    ren.outputEncoding=THREE.sRGBEncoding; ren.toneMapping=THREE.ACESFilmicToneMapping; ren.toneMappingExposure=1.0;
    ren.shadowMap.enabled=true; ren.shadowMap.autoUpdate=false; ren.shadowMap.needsUpdate=true; ren.shadowMap.type=PHONE?THREE.PCFShadowMap:THREE.PCFSoftShadowMap;
    cvs=ren.domElement; host.prepend(cvs);
    /* (v36) a lost WebGL context (memory pressure, a backgrounded tab, too many contexts) used to leave a dead canvas: say so, and draw again as soon as the browser gives it back */
    cvs.addEventListener("webglcontextlost",e=>{ e.preventDefault(); ctxLost=true; try{ H.lost(true); }catch(x){} });
    cvs.addEventListener("webglcontextrestored",()=>{ ctxLost=false; dirty=true; shDirty=true; try{ if(B) B.mats.forEach(m=>{ m.needsUpdate=true; }); }catch(x){} try{ H.lost(false); }catch(x){} });
    pmrem=new THREE.PMREMGenerator(ren);
    /* (v36) the two reflection maps are made when first needed (the site is dark: the light one is only built if someone switches the theme) */
    Object.defineProperty(env,"light",{get(){ return env._l||(env._l=pmrem.fromEquirectangular(skyTex(false)).texture); }});
    Object.defineProperty(env,"dark",{get(){ return env._d||(env._d=pmrem.fromEquirectangular(skyTex(true)).texture); }});
    scene=new THREE.Scene(); cam=new THREE.PerspectiveCamera(34,1,0.3,4000);
    hemi=new THREE.HemisphereLight(0xE6EFFA,0x3E4A55,0.55); scene.add(hemi);
    key=new THREE.DirectionalLight(0xFFF6EA,1.55); key.castShadow=true;
    key.shadow.mapSize.set(PHONE?1024:2048,PHONE?1024:2048); key.shadow.bias=-0.0006; key.shadow.normalBias=0.15;
    scene.add(key); scene.add(key.target);
    const fill=new THREE.DirectionalLight(0xDFEAFF,0.55); fill.position.set(-80,40,-60); scene.add(fill);
    ground=new THREE.Mesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.ShadowMaterial({opacity:0.22}));
    ground.receiveShadow=true; scene.add(ground);
    /* sub-part marker: a glowing point drawn over everything (also through the skin) at the computed location of a small component */
    { const mm=(o,c)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,depthTest:false,depthWrite:false,toneMapped:false}), sg=new THREE.SphereGeometry(1,18,12);
      const core=new THREE.Mesh(sg,mm(1,0xE8330A)), halo=new THREE.Mesh(sg,mm(0.3,0xFF6A1F)); core.renderOrder=999; halo.renderOrder=998; core.frustumCulled=halo.frustumCulled=false;
      mk=new THREE.Group(); mk.add(halo,core); mk.visible=false; mk.userData={core,halo}; scene.add(mk); }
    makeEnv();
    const el_=cvs;
    el_.addEventListener("pointerdown",e=>{ el_.setPointerCapture(e.pointerId); ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY}); drag={x:e.clientX,y:e.clientY,t:performance.now(),moved:0}; touch(); if(ptrs.size===2) pinch=pdist(); });
    el_.addEventListener("pointermove",e=>{
      const p=ptrs.get(e.pointerId);
      if(!p){ if(e.pointerType==="mouse") hover(e); return; }
      const dx=e.clientX-p.x, dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY;
      if(ptrs.size===1){ if(drag) drag.moved+=Math.abs(dx)+Math.abs(dy); sph.theta-=dx*0.008; sph.phi=Math.max(0.12,Math.min(1.53,sph.phi-dy*0.008)); dirty=true; }
      else if(ptrs.size===2){ const d=pdist(); if(pinch>0) sph.r=clampR(sph.r*pinch/d); pinch=d; dirty=true; if(drag) drag.moved+=99; }
    });
    const up=e=>{ if(!ptrs.delete(e.pointerId)) return; pinch=0;
      if(drag&&drag.moved<7&&performance.now()-drag.t<600&&ptrs.size===0) tap(e);
      if(ptrs.size===0) drag=null; };
    el_.addEventListener("pointerup",up);
    el_.addEventListener("pointercancel",e=>{ ptrs.delete(e.pointerId); if(ptrs.size===0) drag=null; });
    el_.addEventListener("wheel",e=>{ e.preventDefault(); touch(); sph.r=clampR(sph.r*Math.exp(e.deltaY*0.0012)); dirty=true; },{passive:false});
    el_.addEventListener("pointerleave",()=>{ if(hoverId){ hoverId=null; if(H.hover) H.hover(null); sync(); } });
    new ResizeObserver(resize).observe(host);
    ready=true;
  }
  function ndc(e){ const r=cvs.getBoundingClientRect(); mouse.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1); }
  function hitId(e){ if(!pick.length) return null; ndc(e); ray.setFromCamera(mouse,cam); const h=ray.intersectObjects(pick,false); return h.length?h[0].object.userData.id:null; }
  function tap(e){ const id=hitId(e); if(id&&H.pick) H.pick(id); }
  function hover(e){
    if(hoverPend) return; hoverPend=true;
    requestAnimationFrame(()=>{ hoverPend=false; const id=hitId(e);
      if(id!==hoverId){ hoverId=id; cvs.style.cursor=id?"pointer":"grab"; if(H.hover) H.hover(id); sync(); } });
  }
  function resize(){
    if(!ready) return; const r=host.getBoundingClientRect(); if(r.width<2||r.height<2) return;
    ren.setSize(r.width,r.height,false); cam.aspect=r.width/r.height; cam.updateProjectionMatrix(); dirty=true;
    if(B&&!touched){ goal.r=fitR(); if(!goal.on&&!vgoal) sph.r=goal.r; }
  }

  /* airflow over the whole aircraft: a head and a short streamline trail per lane. Lanes run along the fuselage axis:
     fuselage ring, over and under each wing and the tailplane, around the fin and each nacelle. Near a surface they hug
     it and away from it they spread out. Schematic, not a CFD solution: it shows where the air goes around each part. */
  const FLOWCOL={fuse:[0.23,0.56,0.85], wing:[0.08,0.68,0.78], tail:[0.16,0.64,0.40], eng:[0.94,0.52,0.12], vort:[0.58,0.40,0.95]};
  const TRK=6, TDS=0.012;            /* trail: TRK segments, spaced TDS in progress units along the aircraft */
  function lanePos(d,s,L,c,U,out,o){
    let z=-L*0.9+s*L*1.8, x=0, y=0;
    if(d.f===0){ /* fuselage ring */
      const X=Math.max(0,Math.min(L,z+L/2)), r=ringAt(c,X), hh=Math.max(r.hh,0.2);
      const th=d.th+0.25*Math.sin(s*7+d.th), off=d.k*Math.max(0.4,c.fw*0.5);
      x=(r.hw+off)*Math.cos(th); y=r.zc+(hh+off*0.7)*Math.sin(th);
    } else if(d.f===1||(d.f===2&&d.part===0)){ /* wing (with dihedral) or tailplane: lanes over and under the chord */
      const P=d.f===1?U.W:U.T, u=d.u, Y=P.Y(u), LE=P.LE(u), CH=P.CH(u), tk=P.tk(u);
      const zc=d.f===1?P.zc(u):c.htZ;
      const f=(z+L/2-LE)/CH, fc=Math.min(1,Math.max(0,f));
      const e=Math.max(0,-f,f-1), wg=1-Math.min(1,e/0.5), w=wg*wg*(3-2*wg);
      const skin=0.5*tk*sh(fc)+0.02, clr=(d.f===1?U.Dw:U.Dt)*d.d*(0.25+0.75*(1-w));
      x=d.side*Y; y=zc+d.up*(skin*w+clr);
    } else if(d.f===2){ /* fin: lanes on both sides, along its height */
      const p=c.fin, u=d.u, zr=p[0][1]-0.4, zt=p[1][1], ly=zr+u*(zt-zr);
      const LE=p[0][0]+(p[1][0]-p[0][0])*u, TE=p[3][0]+(p[2][0]-p[3][0])*u;
      const f=(z+L/2-LE)/(TE-LE), fc=Math.min(1,Math.max(0,f));
      const e=Math.max(0,-f,f-1), wg=1-Math.min(1,e/0.5), w=wg*wg*(3-2*wg);
      const tk=c.fth[0]+(c.fth[1]-c.fth[0])*u;
      x=d.up*((0.5*tk*sh(fc)+0.02)*w+U.Df*d.d*(0.25+0.75*(1-w))); y=ly;
    } else if(d.f===4){ /* wingtip vortex: starts at the tip trailing edge, turns outboard-up / inboard-down, widens and sinks downstream */
      const P=U.W, Yt=P.Y(1), TE=P.LE(1)+P.CH(1), zt=P.zc(1), z0=TE-L/2, z1=L*0.9, dz=s*(z1-z0);
      z=z0+dz; const R0=Math.max(0.6,P.CH(1)*0.9), r=d.rr*R0*(0.25+0.75*Math.min(1,dz/(0.15*L))), ph=d.th+dz*2*Math.PI/(0.22*L);
      x=d.side*(Yt+r*Math.cos(ph)); y=zt-0.03*dz+r*Math.sin(ph);
    } else { /* nacelle: lanes circling each engine as they pass */
      const Ye=c.eng[d.ei], zc=c.engZ[d.ei]||c.engZ[0], rr=d.rr*U.R, th=d.th+0.3*Math.sin(s*6.2832+d.th);
      x=d.side*(Ye+rr*Math.cos(th)); y=zc+rr*Math.sin(th);
    }
    out[o]=x; out[o+1]=y; out[o+2]=z;
  }
  function makeFlow(c){
    const seeds=[];
    const add=o=>{ o.s=Math.random(); o.sp=0.7+Math.random()*0.6; seeds.push(o); };
    const side=()=>Math.random()<0.5?-1:1, rnd=()=>0.05+0.95*Math.random();
    for(let i=0;i<360;i++) add({f:0, th:Math.random()*Math.PI*2, k:0.35+Math.random()*0.9});
    for(let i=0;i<360;i++) add({f:1, side:side(), up:side(), u:Math.random(), d:rnd()});
    for(let i=0;i<120;i++) add({f:2, part:0, side:side(), up:side(), u:Math.random(), d:rnd()});
    for(let i=0;i<80;i++) add({f:2, part:1, up:side(), u:Math.random(), d:rnd()});
    c.eng.forEach((Ye,ei)=>{ [-1,1].forEach(sd=>{ for(let i=0;i<60;i++) add({f:3, ei, side:sd, th:Math.random()*Math.PI*2, rr:1.15+0.4*Math.random()}); }); });
    [-1,1].forEach(sd=>{ for(let i=0;i<70;i++) add({f:4, side:sd, th:Math.random()*Math.PI*2, rr:0.3+0.7*Math.random()}); });
    const N=seeds.length;
    const pos=new Float32Array(N*3), hcol=new Float32Array(N*3);
    const lpos=new Float32Array(N*TRK*6), lcol=new Float32Array(N*TRK*6);
    const pg=new THREE.BufferGeometry(); pg.setAttribute("position",new THREE.BufferAttribute(pos,3)); pg.setAttribute("color",new THREE.BufferAttribute(hcol,3));
    const lg=new THREE.BufferGeometry(); lg.setAttribute("position",new THREE.BufferAttribute(lpos,3)); lg.setAttribute("color",new THREE.BufferAttribute(lcol,3));
    const pts=new THREE.Points(pg,new THREE.PointsMaterial({size:Math.max(0.9,c.fw*0.22), vertexColors:true, sizeAttenuation:true, transparent:true, opacity:0.9, depthWrite:false}));
    const lines=new THREE.LineSegments(lg,new THREE.LineBasicMaterial({vertexColors:true, transparent:true, opacity:0.7, depthWrite:false}));
    pts.frustumCulled=false; lines.frustumCulled=false;
    const grp=new THREE.Group(); grp.add(lines); grp.add(pts);
    grp.userData={seeds,N,pos,lpos,pg,lg,hcol,lcol,W:wingLS(c),T:htpLS(c),R:c.engD/2,Dw:c.rc*0.2,Dt:c.hrc*0.2,Df:(c.fin[3][0]-c.fin[0][0])*0.12,tmp:new Float32Array((TRK+1)*3)};
    paintFlow(grp,seeds,c);
    return grp;
  }
  /* colours: heads in the family colour, trails fade toward the page background */
  function paintFlow(grp,seeds,c){
    const U=grp.userData, bg=css("--bg"), base=new CL();
    seeds.forEach((d,i)=>{ const k=d.f===0?FLOWCOL.fuse:d.f===1?FLOWCOL.wing:d.f===2?FLOWCOL.tail:d.f===4?FLOWCOL.vort:FLOWCOL.eng;
      base.setRGB(k[0],k[1],k[2]);
      U.hcol.set([k[0],k[1],k[2]],i*3);
      for(let j=0;j<TRK;j++){
        const a=new CL().copy(base).lerp(bg,0.85*j/TRK), b=new CL().copy(base).lerp(bg,0.85*(j+1)/TRK);
        U.lcol.set([a.r,a.g,a.b,b.r,b.g,b.b],(i*TRK+j)*6);
      } });
    U.pg.attributes.color.needsUpdate=true; U.lg.attributes.color.needsUpdate=true;
  }
  function flowStep(dt){
    if(!flowObj||!B) return;
    const c=B.c, L=c.L, U=flowObj.userData, seeds=U.seeds, tmp=U.tmp;
    for(let i=0;i<U.N;i++){
      const d=seeds[i]; d.s+=dt*0.09*d.sp; if(d.s>1) d.s-=1;
      for(let k=0;k<=TRK;k++) lanePos(d,Math.max(0,d.s-k*TDS),L,c,U,tmp,k*3);
      U.pos[i*3]=tmp[0]; U.pos[i*3+1]=tmp[1]; U.pos[i*3+2]=tmp[2];
      for(let k=0;k<TRK;k++){ const o=(i*TRK+k)*6, q=k*3;
        U.lpos[o]=tmp[q]; U.lpos[o+1]=tmp[q+1]; U.lpos[o+2]=tmp[q+2];
        U.lpos[o+3]=tmp[q+3]; U.lpos[o+4]=tmp[q+4]; U.lpos[o+5]=tmp[q+5]; }
    }
    U.pg.attributes.position.needsUpdate=true; U.lg.attributes.position.needsUpdate=true;
  }

  function setFlow(on){
    flowOn=!!on;
    if(flowOn&&B&&(!flowObj||flowKey!==B.key)){
      if(flowObj) scene.remove(flowObj);
      flowObj=makeFlow(B.c); flowKey=B.key; scene.add(flowObj);
    }
    if(flowObj) flowObj.visible=flowOn;
    dirty=true; shDirty=true;
  }

  const hangars={}; let lazyHangar=false;
  function ensureHangar(){
    if(airport||!B) return;
    try{ airport=hangars[B.key]||(hangars[B.key]=buildHangar(B.c)); scene.add(airport.group); airport.group.visible=(envMode==="hangar"); if(airport.setNight) airport.setNight(isDark()); dirty=true; shDirty=true; }
    catch(e){ console.error(e); airport=null; }
  }
  function setAircraft(k){
    if(B) scene.remove(B.root);
    if(mk) mk.visible=false;
    if(flowObj){ scene.remove(flowObj); flowObj=null; flowKey=null; }
    for(const q in animV) delete animV[q]; for(const q in animPlay) delete animPlay[q]; for(const q in spinA) delete spinA[q]; lastDoor=-1;
    B=builds[k]||(builds[k]=buildAircraft(k));
    scene.add(B.root);
    const c=B.c; R0=Math.max(c.span,c.L)*1.5;
    B.root.traverse(m=>{ if(m.material){ m.castShadow=true; m.receiveShadow=true; } });
    ground.scale.set(R0*4,1,R0*4);
    if(grid) scene.remove(grid);
    grid=new THREE.GridHelper(R0*3,30,0x888888,0x888888); grid.material.transparent=true; grid.material.opacity=0.2; scene.add(grid);
    key.position.set(R0*0.5,R0*1.1,R0*0.6);
    const sc=key.shadow.camera; sc.left=-R0*0.8; sc.right=R0*0.8; sc.top=R0*0.8; sc.bottom=-R0*0.8; sc.near=1; sc.far=R0*4; sc.updateProjectionMatrix();
    if(airport) scene.remove(airport.group);   /* (v31) one hangar per aircraft, kept: rebuilding it (canvas textures included) cost ~170 ms on every switch */
    airport=null; if(envMode==="hangar"&&!lazyHangar) ensureHangar();   /* (v36) the hangar is built on first need (the Home stage never shows it); GL.prepHangar() builds it while the page is idle */
    applyEnvMode(); applyEnv(); reset(true); recolorGrid(); sync();
    if(!matchMedia("(prefers-reduced-motion: reduce)").matches){ /* fly-in: start high and far, ease down to the hero angle */
      vgoal={theta:sph.theta,phi:sph.phi}; sph.theta-=1.2; sph.phi=0.42; sph.r=goal.r*2.3; goal.on=true; camEase=0.035; }
    if(flowOn) setFlow(true);
  }
  function recolorGrid(){ if(grid){ grid.material.color.copy(css("--muted")); } dirty=true; }
  const defTheta=()=>Math.PI-0.75;
  function reset(instant){
    const c=B.c; goal.t.set(0,c.H*0.22,0); goal.r=fitR(); vgoal=null;
    sph.theta=defTheta(); sph.phi=1.12;
    if(instant){ tgt.copy(goal.t); sph.r=goal.r; goal.on=false; } else { goal.on=true; }
    dirty=true; shDirty=true;
  }

  /* materials, visibility and picking, driven by the page state */
  function sync(){ try{ syncI(); }catch(e){ running=false; console.error(e); H.fail(e); } }
  function syncI(){
    if(!B||!ready) return;
    const s=getState(), flt=s.filter, lay=s.layer, iso=s.isolate, acc=css("--accent");
    /* (vw) the interior is built on first need: X-ray layer, explode, or an interior part selected */
    if(B&&typeof edEnsure==="function") edEnsure(B,lay==="int"||(s.explode||0)>0||!!s.sel||!!iso||!!(s.pulled&&s.pulled.size)||!!(s.grp&&s.grp.length));   /* (ed) detailed parts: the always-visible set now, the X-ray / selection set when something asks for it */
    if(B&&typeof vwIntEnsure==="function"&&(lay==="int"||(s.explode||0)>0||(s.sel&&String(s.sel).indexOf("int_")===0))) vwIntEnsure(B);
    pulledTgt={}; s.pulled.forEach(id=>{ pulledTgt[id]=1; });
    B.mats.forEach(m=>{
      const u=m.userData, id=u.id, sys=PARTS[id].sys, isInt=u.layer==="int";
      let base=u.base;
      if(!isInt&&!/^(nav|beacon)/.test(u.mk)){
        const mt=MATS[B.key]&&MATS[B.key][id];
        if(s.matView&&mt&&MATCOL[mt[0]]) base=MATCOL[mt[0]];
        else if(LIVERY[s.livery]&&LIVERY[s.livery][u.mk==='rudder'?'tail':u.mk==='tip'&&!LIVERY[s.livery].tip?'wing':u.mk]) base=LIVERY[s.livery][u.mk==='rudder'?'tail':u.mk==='tip'&&!LIVERY[s.livery].tip?'wing':u.mk];
      }
      const col=linCol(base);
      const grp=!!(s.grp&&s.grp.indexOf(id)>=0), pick=(id===s.sel||grp);
      if(isInt) col.lerp(css("--"+sys),/^ed/.test(u.mk)?0.1:0.62);   /* (ed) detailed parts keep their own colours */
      else if(flt!=="all"&&sys===flt) col.lerp(css("--"+sys),0.5);
      /* (v30) an added glow cannot tint white paint (a white surface is already saturated), so the picked part takes the accent colour itself and the rest of the aircraft steps back */
      if(!isInt&&lay!=="int"&&!/^ed/.test(u.mk)){ if(pick) col.lerp(acc,0.9).multiplyScalar(0.72); else if(s.sel) col.multiplyScalar(0.52);   /* a little darker than the accent: the light would wash a bright amber out to cream */ }
      else if(isInt&&!/^ed/.test(u.mk)&&s.sel&&!pick) col.multiplyScalar(0.5);   /* (v32) X-ray: a picked system (hydraulics, fuel...) was lost among the cabin interior */
      m.color.copy(col);
      /* dark paints reflect the sky too strongly and turn pale; scale the reflection with the colour brightness (white paint keeps the full value) */
      m.envMapIntensity=(isDark()?0.6:0.42)*(0.25+0.75*Math.min(1,Math.max(col.r,col.g,col.b)*2.5));
      if(m.isMeshPhysicalMaterial) m.clearcoat=0.55*(0.3+0.7*Math.min(1,Math.max(col.r,col.g,col.b)*2.5));
      let op=1;
      if(lay==="int"&&!isInt) op=0.1;
      if(flt!=="all"&&sys!==flt) op=Math.min(op,0.12);
      if(iso&&!iso.has(id)) op=Math.min(op,(s.ghost&&s.ghost[id])||(isInt?0.02:0.1));   /* (ed) around an isolated detailed part the cabin and other interiors almost vanish */   /* (ed) a structural part keeps the wing itself faintly visible */
      m.opacity=op; const tr=op<1; if(m.transparent!==tr){ m.transparent=tr; m.needsUpdate=true; } m.depthWrite=op>=0.5;
      m.emissive.setRGB(0,0,0);
      if(u.mk==="nav") m.emissive.set("#FFF4D6").multiplyScalar(0.8);
      else if(u.mk==="navL") m.emissive.set("#FF2A2A").multiplyScalar(0.9);
      else if(u.mk==="navR") m.emissive.set("#22FF66").multiplyScalar(0.9);
      else if(u.mk==="beacon") m.emissive.set("#FF2020").multiplyScalar(0.9);
      if(pick) m.emissive.copy(acc).multiplyScalar(0.32);
      else if(id===hoverId) m.emissive.copy(acc).multiplyScalar(0.2);
      u.em0=m.emissive.clone();
    });
    if(B.panelMat){ const lv=LIVERY[s.livery]||LIVERY.classic, sk=new CL(lv.skin), lum=0.3*sk.r+0.59*sk.g+0.11*sk.b, dsk=lum<0.35;
      B.panelMat.color.set(dsk?0xb8c7d6:0x1b2733); B.panelMat.opacity=(lay==="int"||iso||(flt&&flt!=="all"))?0.02:(dsk?0.14:0.09); }
    if(B.bellies){ /* belly: vertex colour turns the skin colour into the livery belly colour at the bottom and leaves the skin colour above the belt line */
      const lv=LIVERY[s.livery]||LIVERY.classic, bc=linCol(lv.belly||LIVERY.classic.belly);
      B.bellies.forEach(e=>{
        const c=e.mat.color, k=c.getHexString()+"|"+bc.getHexString();
        if(e.key===k) return; e.key=k;
        const A=e.geom.attributes.color.array, t=e.t;
        const rr=bc.r/Math.max(c.r,1e-3), gg=bc.g/Math.max(c.g,1e-3), bb=bc.b/Math.max(c.b,1e-3);
        for(let i=0;i<t.length;i++){ const f=t[i]; A[i*3]=rr+(1-rr)*f; A[i*3+1]=gg+(1-gg)*f; A[i*3+2]=bb+(1-bb)*f; }
        e.geom.attributes.color.needsUpdate=true;
      });
    }
    pick=[];
    B.root.traverse(m=>{
      const u=m.userData; if(!u||!u.id||!m.material) return;
      if(u.layer==="int") m.visible=(lay==="int");
      if(u.edSel) m.visible=(s.sel===u.id);   /* (ed) exaggerated or coloured detail models show only while their part is selected */
      if(m.visible&&m.material.opacity>=0.5) pick.push(m);
    });
    dirty=true; shDirty=true;
  }
  /* animation values: slider 0..1 per part; playing parts oscillate on their own */
  function getV(id){ const an=ANIM[id]; return animV[id]!==undefined?animV[id]:((an&&an.v0)||0); }
  function glowColour(an,accC){ if(an.col){ if(!an._c) an._c=new CL(an.col); return an._c; } return accC; }
  /* the most downward and the most forward explode directions of the current aircraft (cached per build) */
  function expMin(){ if(B._exm) return B._exm; let y=0, z=0; B.root.traverse(m=>{ const u=m.userData; if(!u||!u.id||u.child||!u.dir) return; y=Math.min(y,u.dir[1]); z=Math.min(z,u.dir[2]); }); return B._exm={y,z}; }
  /* per-part offsets (explode and pull-out) plus each part's own animation, applied every frame */
  function moveParts(now){
    if(!B) return false;
    const s=getState(), L=B.c.L, rc=B.c.rc||L*0.1, ex=s.explode||0, sec=now/1000;
    const dt=lastNow?Math.min(0.1,(now-lastNow)/1000):0; lastNow=now;
    let moving=false;
    for(const id in animPlay){ if(animPlay[id]){ animV[id]=0.5+0.5*Math.sin(sec*1.6); moving=true; } }
    ambientOn=false;
    for(const id in ANIM){ const an=ANIM[id]; if((an.t==="glow"||an.t==="blink"||an.t==="breathe"||an.t==="spin")&&getV(id)>0.001){ ambientOn=true; break; } }   /* (v31) ambient only: drawn at a low rate, no shadow redraw */
    B.root.traverse(m=>{
      const u=m.userData; if(!u||!u.id||u.child) return;
      if(u.gearDep){ const gv=Math.max(getV("gear_main"),getV("wheels"),getV("gear_nose")); if(gv>0.02){ m.visible=false; u.gdHid=true; return; } else if(u.gdHid){ u.gdHid=false; m.visible=u.layer==="ext"||getState().layer==="int"; } }   /* (ed) gear details leave with the gear */
      const id=u.id, cur=pulled[id]||0, tg=pulledTgt[id]||0;
      let nv=cur+(tg-cur)*0.14; if(Math.abs(tg-nv)<0.002) nv=tg;
      if(nv!==cur) moving=true; pulled[id]=nv;
      let d=u.dir; if(!d||(!d[0]&&!d[1]&&!d[2])) d=PULLD[id]||[0,0.35,0];
      const total=ex*L+nv*PULLK*L;
      let ox=(u.mirror?-1:1)*d[0]*total, oy=d[1]*total, oz=d[2]*total;
      if(envMode==="hangar"&&ex>0){ const m0=expMin(); oy-=m0.y*ex*L; oz-=m0.z*ex*L; }   /* v19 airport: the exploded set is lifted and moved back, so the wheels stay on the apron and the nose stays clear of the terminal */
      let rx=0,ry=0,rz=0,mx=0,my=0,mz=0,sc=1,useQ=false;
      const an=ANIM[id];
      if(an&&an.t==="gear"&&ffGearPose(m,u,getV,ox,oy,oz)) return;   /* landing gear: leg plan in p5d.js */
      if(an){
        const v=getV(id);
        if(an.t==="rot"&&(!an.mk||(m.material&&m.material.userData.mk===an.mk))){
          let phi=(an.a[0]+(an.a[1]-an.a[0])*v)*DEG;
          if(u.axis){ /* about the swept hinge line; a mirrored surface turns the other way about its mirrored axis */
            useQ=true; hAx.set(u.axis[0],u.axis[1],u.axis[2]); hQ.setFromAxisAngle(hAx,phi*(u.mirror?(an.diff?1:-1):1));
          } else {
            let sg=(u.mirror&&an.ax!=="x")?-1:1; if(an.diff&&u.mirror) sg=-sg;
            phi*=sg;
            if(an.ax==="x") rx=phi; else if(an.ax==="y") ry=phi; else rz=phi;
          }
        } else if(an.t==="move"){ const k=u.mvk!==undefined?u.mvk:(an.unit==="ln"?B.engLn:rc); mx=an.vec[0]*k*v; my=an.vec[1]*k*v; mz=an.vec[2]*k*v; }
        else if(an.t==="spin"){
          const mkOK=!an.mk||(m.material&&m.material.userData.mk===an.mk);
          spinA[id]=(spinA[id]||0)+dt*an.spd*v;
          if(mkOK){ if(an.ax==="z") rz=spinA[id]; else if(an.ax==="y") ry=spinA[id]; else rx=spinA[id]; }
        }
        else if(an.t==="breathe"){ sc=1+an.amp*v*(0.6+0.4*Math.sin(sec*2)); }
      }
      if(useQ) m.quaternion.copy(hQ); else m.rotation.set(rx,ry,rz); m.scale.set(sc,sc,sc);
      const P=u.P;
      m.position.set((P?P[0]:0)+ox+mx,(P?P[1]:0)+oy+my,(P?P[2]:0)+oz+mz);
    });
    /* glow and blink: add light on top of each material's base colour */
    if(now-accT>1000){ accT=now; accCache=css("--accent"); } const accC=accCache;   /* (v31) was a getComputedStyle every frame */
    B.mats.forEach(mt=>{
      const u=mt.userData, an=ANIM[u.id];
      if(u.em0) mt.emissive.copy(u.em0); else mt.emissive.setRGB(0,0,0);
      if(u.mk==="beacon"){ mt.emissive.multiplyScalar(Math.sin(sec*5.2)>0.55?1:0.1); return; }     /* anti-collision beacon: short red flashes */
      if(!an||(an.t!=="glow"&&an.t!=="blink")) return;
      if(an.mk&&u.mk!==an.mk) return;
      const v=getV(u.id); if(v<=0.001) return;
      const k=an.t==="glow"?v*(0.55+0.45*Math.sin(sec*an.spd)):v*((Math.sin(sec*an.spd)>0)?1:0.12);
      const gc=glowColour(an,accC), kk=k*0.9;
      mt.emissive.setRGB(mt.emissive.r+gc.r*kk, mt.emissive.g+gc.g*kk, mt.emissive.b+gc.b*kk);
    });
    /* doors: each instance moves out along its own side */
    const dv=getV("doors");
    if(B.doorList&&Math.abs(dv-lastDoor)>0.0005){
      lastDoor=dv; const ez=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
      B.doorList.forEach(d=>{ const m=d.mesh, P=d.P, sg=d.sg;
        if(d.kind==="slide"){ /* plug door: pushed out, then slides forward along the fuselage */
          const a=ez(dv/0.35), b=ez((dv-0.35)/0.65); m.position.set(P[0]+sg*0.42*a,P[1],P[2]-(d.w+0.3)*b); m.rotation.set(0,0,0); }
        else if(d.kind==="swing"){ /* hinged on its forward edge, swings out and forward */
          m.position.set(P[0]+sg*0.06*ez(dv/0.12),P[1],P[2]); m.rotation.set(0,sg*1.75*ez(dv),0); }
        else { m.position.set(P[0],P[1],P[2]); m.rotation.set(0,0,sg*1.9*ez(dv)); }   /* hatch hinged on its top edge */
      });
    }
    return moving;
  }

  function symR(list){ let r=false; B.root.traverse(m=>{ const u=m.userData; if(u&&u.id&&!u.child&&!u.mirror&&m.geometry&&m.visible&&list.indexOf(u.id)>=0) r=true; }); return r; }
  function focus(ids,xr,tight,ang,both){
    if(!B) return; const list=[].concat(ids); const box=new THREE.Box3(); let n=0;
    B.root.updateMatrixWorld(true);
    const hasR=both?false:symR(list);   /* (v32) both=true frames the mirrored copies too (all four engines from the front) */   /* a mirrored part (engines, wings, tail halves) is framed at its right-hand copy, not at the fuselage between the two */
    const intSel=list.some(id=>PARTS[id]&&PARTS[id].int);   /* an X-ray part is framed before the sync that makes its layer visible */
    B.root.traverse(m=>{
      const u=m.userData; if(!u||!u.id||u.child||!m.geometry||(!m.visible&&!(intSel&&u.layer==="int")&&!u.edSel)||list.indexOf(u.id)<0||(hasR&&u.mirror)) return;
      if(!m.geometry.boundingBox) m.geometry.computeBoundingBox();
      const mb=m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);
      if(xr&&!both){ const cx=(mb.min.x+mb.max.x)/2; if(cx<xr[0]||cx>xr[1]) return; }
      box.union(mb); n++;
    });
    if(!n){ goal.t.set(0,B.c.H*0.22,0); goal.r=fitR(); goal.on=true; return; }
    const ctr=box.getCenter(new V3()), sz=box.getSize(new V3());
    const minR=tight?5.5:(xr?R0*0.12:((host.clientWidth<520)?R0*0.55:R0*0.25));
    goal.t.copy(ctr); goal.r=Math.max(minR,Math.min(R0*1.05,sz.length()*1.7)); goal.on=true; touched=true; if(ang) vgoal={theta:ang[0],phi:ang[1]};
  }
  function place(){
    cam.position.set(tgt.x+sph.r*Math.sin(sph.phi)*Math.sin(sph.theta), tgt.y+sph.r*Math.cos(sph.phi), tgt.z+sph.r*Math.sin(sph.phi)*Math.cos(sph.theta));
    cam.near=Math.max(0.3,sph.r/200); cam.far=Math.max(R0*30,5200);
    if(shX||shY){ const W=host.clientWidth, Hh=host.clientHeight; cam.setViewOffset(W,Hh,-shX*W,shY*Hh,W,Hh); } else cam.clearViewOffset();
    cam.updateProjectionMatrix(); cam.lookAt(tgt);
  }
  function step(){
    let ch=dirty;
    if(goal.on){ tgt.lerp(goal.t,camEase); sph.r+=(goal.r-sph.r)*camEase; if(tgt.distanceTo(goal.t)<0.03&&Math.abs(goal.r-sph.r)<0.03) goal.on=false; ch=true; }
    if(vgoal){ let da=vgoal.theta-sph.theta; da=Math.atan2(Math.sin(da),Math.cos(da)); sph.theta+=da*camEase*1.15; sph.phi+=(vgoal.phi-sph.phi)*camEase*1.15;
      if(Math.abs(da)<0.002&&Math.abs(vgoal.phi-sph.phi)<0.002){ sph.theta=vgoal.theta; sph.phi=vgoal.phi; vgoal=null; } ch=true; }
    if(!goal.on&&!vgoal) camEase=0.12;
    if(spin&&!touched&&!drag&&!(matchMedia("(prefers-reduced-motion: reduce)").matches)){ const tn=performance.now(); sph.theta+=0.0022*Math.min(4,(tn-(lastSpinT||tn-16.7))/16.7); lastSpinT=tn; ch=true; } else lastSpinT=0;
    lastMv=moveParts(performance.now()); if(lastMv){ ch=true; shDirty=true; } else if(ambientOn) ch=true;
    if(mk&&mk.visible&&!lent){ const t=performance.now()/1000, w=(Math.sin(t*3.4)+1)/2, k=Math.max(0.12,sph.r*0.018), u=mk.userData;
      u.core.scale.setScalar(k); u.halo.scale.setScalar(k*(1.9+1.7*w)); u.halo.material.opacity=0.42-0.3*w; ch=true; }
    if(flowOn&&flowObj){ flowStep(1/60); ch=true; }
    if(ch){ place(); if(airport&&airport.update&&envMode==="hangar") airport.update(cam.position); if(shDirty){ ren.shadowMap.needsUpdate=true; shDirty=false; } ren.render(scene,cam); dirty=false; renderedLast=true; if(H.frame) H.frame(); } else renderedLast=false;
  }
  function setPR(v){ prCur=v; ren.setPixelRatio(v); resize(); }
  function frame(){
    if(!running) return; requestAnimationFrame(frame);
    const t=performance.now();
    const busy=dirty||goal.on||vgoal||drag||pinch||lastMv||hoverPend;                         /* the viewer is being used: full rate */
    if(!busy){ const gap=(spin&&!touched)?(PHONE?44:30):95; if(t-lastStepT<gap) return; }                  /* idle: spin ~30 fps, ambient light animation ~10 fps */
    else if(renderedLast&&lastStepT){                                                           /* adaptive resolution: only while rendering back to back */
      const dtf=t-lastStepT; if(dtf>46){ if(++slowN>=18&&prCur>0.8){ slowN=0; setPR(Math.max(0.8,prCur-0.25)); } } else if(dtf<26&&slowN>0) slowN--;
    }
    lastStepT=t;
    try{ step(); }catch(e){ running=false; console.error(e); H.fail(e); }
  }
  function project(ids){
    if(!B||!ready) return null; const list=[].concat(ids);
    const box=new THREE.Box3(); let n=0; const hasR=symR(list);
    B.root.traverse(m=>{ const u=m.userData; if(!u||!u.id||u.child||!m.geometry||!m.visible||list.indexOf(u.id)<0||(hasR&&u.mirror)) return;
      if(!m.geometry.boundingBox) m.geometry.computeBoundingBox();
      box.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld)); n++; });
    if(!n) return null;
    const p=box.getCenter(new V3()).project(cam);
    const w=host.clientWidth, h=host.clientHeight;
    return {x:(p.x+1)/2*w, y:(1-p.y)/2*h, ok:p.z>-1&&p.z<1};
  }
  let paused=false;   /* a layer that covers the whole screen (the welcome) pauses the scene behind it */
  function show(){
    if(!ready||failed||lent||paused) return; resize(); dirty=true; shDirty=true;
    if(!running){ running=true; requestAnimationFrame(frame); }
  }
  function hide(){ running=false; }
  function recolor(){ if(!ready) return; applyEnv(); recolorEnv(); recolorGrid(); sync(); if(flowObj&&B){ scene.remove(flowObj); flowObj=null; flowKey=null; if(flowOn) setFlow(true); } }
  /* camera presets: smooth turn to a fixed viewing angle (theta around the aircraft, phi from the top) */
  const VIEWS={three:[Math.PI-0.75,1.12], front:[Math.PI,1.3], side:[Math.PI/2,1.3], top:[Math.PI-0.75,0.12]};
  /* (the old airport scene is gone: the hangar replaced it, so every view uses its own fixed angles) */
  function setView(k){ let v=VIEWS[k]; if(!v||!B) return; vgoal={theta:v[0],phi:v[1]}; touched=true; dirty=true; }

  return {
    init, setAircraft, sync, focus, show, hide, recolor, setFlow, setView, project, kick:()=>{ dirty=true; shDirty=true; },
    /* (v37) the view as it is now, as a 2D canvas at most maxW wide (the notebook's «للدفتر» button). Rendered and copied in the same task, so no preserveDrawingBuffer is needed; the page background
       behind the transparent canvas is filled in. */
    snap:(maxW)=>{ try{ if(ctxLost) return null; ren.render(scene,cam); const w=cvs.width, h=cvs.height, k=Math.min(1,(maxW||1600)/w), c=document.createElement("canvas"); c.width=Math.max(1,Math.round(w*k)); c.height=Math.max(1,Math.round(h*k));
        const g2=c.getContext("2d"); g2.fillStyle="#101013"; g2.fillRect(0,0,c.width,c.height); g2.drawImage(cvs,0,0,c.width,c.height); return c; }catch(e){ return null; } },
    setEnv:m=>{ envMode=(m==='airport'?'hangar':m); if(envMode==='hangar') ensureHangar(); applyEnvMode(); }, getEnv:()=>envMode,
    lazyHangar:v=>{ lazyHangar=!!v; }, prepHangar:()=>{ if(!airport) ensureHangar(); return !!airport; },
    lost:()=>ctxLost, hasBuild:k=>!!builds[k], prepEd:()=>{ if(B&&typeof edEnsure==="function"&&B.ed!==2){ edEnsure(B,true); sync(); } return B?B.ed:0; },
    setAnim:(id,v,play)=>{ animV[id]=Math.max(0,Math.min(1,v)); animPlay[id]=!!play; dirty=true; shDirty=true; },
    setPlay:(id,on)=>{ animPlay[id]=!!on; dirty=true; shDirty=true; },
    setShift:(x,y)=>{ shX=x||0; shY=y||0; dirty=true; },
    setMarker:v=>{ if(!mk) return; mk.visible=!!(v&&B); if(mk.visible) mk.position.set(v.x,v.y,v.z); dirty=true; },
    focusPoint:(v,r)=>{ if(!v||!B) return; goal.t.set(v.x,v.y,v.z); goal.r=r||Math.max(R0*0.09,B.c.L*0.1); goal.on=true; touched=true; dirty=true; },
    projectPoint:v=>{ if(!v||!B||!ready) return null; const p=new V3(v.x,v.y,v.z).project(cam), w=host.clientWidth, h=host.clientHeight; return {x:(p.x+1)/2*w, y:(1-p.y)/2*h, ok:p.z>-1&&p.z<1}; },
    getAnim:id=>({v:getV(id),play:!!animPlay[id]}),
    dbg:()=>B, ap:()=>airport, marker:()=>mk,
    /* the flight simulator borrows the aircraft (and its animation machinery) for its own scene, then gives it back */
    lend:()=>{ if(!B) return null; lent=true; running=false; scene.remove(B.root); return B; },
    restore:()=>{ if(!B) return; B.root.position.set(0,0,0); B.root.quaternion.identity(); B.root.scale.set(1,1,1); scene.add(B.root); lent=false; for(const q in animV) delete animV[q]; for(const q in animPlay) delete animPlay[q]; lastDoor=-1; applyEnvMode(); applyEnv(); sync(); dirty=true; },
    pose:()=>moveParts(performance.now()),
    info:()=>ren?{calls:ren.info.render.calls,tris:ren.info.render.triangles,geos:ren.info.memory.geometries,tex:ren.info.memory.textures,ap:airport?(()=>{ let n=0; airport.group.traverse(o=>{ if(o.isMesh||o.isPoints||o.isLine) n++; }); return n; })():0}:null,
    camState:()=>({r:sph.r,theta:sph.theta,phi:sph.phi,t:tgt.toArray(),goalR:goal.r,goalT:goal.t.toArray(),goalOn:goal.on,goalTh:vgoal?vgoal.theta:null,goalPh:vgoal?vgoal.phi:null,R0}),
    setCam:(th,ph,r,t)=>{ sph.theta=th; sph.phi=ph; sph.r=r; if(t) tgt.set(t[0],t[1],t[2]); goal.on=false; vgoal=null; touched=true; camEase=0.12; dirty=true; },
    reset:()=>{ touched=false; reset(false); dirty=true; },
    setSpin:v=>{ spin=v; touched=false; dirty=true; },
    setZoom:k=>{ stK=k||1; if(!B) return; goal.t.set(0,B.c.H*0.22,0); goal.r=fitR(); goal.on=true; touched=true; dirty=true; },
    setEase:k=>{ camEase=k; },
    /* the Home intro drives the distance every frame from the scroll: no easing, the scroll itself is the animation */
    setZoomLive:k=>{ stK=k||1; if(!B) return; goal.t.set(0,B.c.H*0.22,0); tgt.copy(goal.t); goal.r=fitR(); sph.r=goal.r; goal.on=false; dirty=true; },
    setPaused:v=>{ paused=!!v; if(paused) running=false; else show(); },
    get ready(){ return ready; }
  };
})();
