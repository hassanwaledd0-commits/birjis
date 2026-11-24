/* ---------- fg stage 1: atmosphere (closed-form single scattering), sky dome with sun / moon / stars, sun lens flare, environment capture ----------
   Used by fwBuild() in p8w.js. World axes: x east, y up, z south. All colours below are LINEAR radiance; the renderer tone-maps (ACES) and encodes.
   Plane-parallel atmosphere with one scale height H: in-scattered radiance for a view ray with elevation dy and a sun with elevation sy is
   L = E * (bR*pR + bM*pM)/bE * u*exp(-t)*(1-exp(-(u-t)))/(u-t),  t=bE*H/sy, u=bE*H/dy   (per colour channel, derived by integrating along the ray). */
const fgAtmo=`
uniform vec3 uSunDir,uSunCol,uMoonDir,camPos,uLDir,uLCol,uAmb,uCloudCol;
uniform float uRay,uMie,uDip,uNight,uCover,uCoverL,uTime,uFogK,uFogH,uSunE,uCityG,uCloudK,uFlash;
const float FG_H=8000.0;
float fgHash(vec2 p){ vec3 q=fract(vec3(p.xyx)*0.1031); q+=dot(q,q.yzx+33.33); return fract((q.x+q.y)*q.z); }
float fgHash3(vec3 p){ p=fract(p*0.1031); p+=dot(p,p.zyx+31.32); return fract((p.x+p.y)*p.z); }
float fgNoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(fgHash(i),fgHash(i+vec2(1.0,0.0)),f.x),mix(fgHash(i+vec2(0.0,1.0)),fgHash(i+vec2(1.0,1.0)),f.x),f.y); }
vec3 fgSkyRad(vec3 d,float dip){
  float dy=max(d.y+dip,0.012), sy=max(uSunDir.y,0.02), mu=dot(d,uSunDir);
  vec3 bR=vec3(5.8e-6,13.5e-6,33.1e-6)*uRay, bM=vec3(6.0e-6*uMie), bE=bR+bM*1.1;
  float g=0.76, pR=0.0596831*(1.0+mu*mu), pM=0.0795775*(1.0-g*g)/pow(1.0+g*g-2.0*g*mu,1.5);
  vec3 S=(bR*pR+bM*pM)/bE, t=bE*FG_H/sy, u=bE*FG_H/dy, w=u-t; w=mix(w,vec3(1e-3),step(abs(w),vec3(1e-3)));
  return uSunE*S*u*exp(-t-vec3(0.020,0.035,0.003)/sy)*(1.0-exp(-w))/w;
}
vec3 fgNightSky(vec3 d,float dip){
  float dy=max(d.y+dip,0.0); vec3 c=mix(vec3(0.011,0.019,0.042),vec3(0.002,0.004,0.012),pow(dy,0.45));
  float m=max(dot(d,uMoonDir),0.0); c+=vec3(0.55,0.65,0.9)*(pow(m,60.0)*0.05+pow(m,5.0)*0.012);
  float h=max(dot(normalize(d.xz+1e-5),vec2(0.81,-0.58)),0.0); c+=vec3(0.95,0.5,0.2)*uCityG*exp(-dy*6.5)*(0.3+0.7*h);
  return c*uNight;
}
vec3 fgSky(vec3 d,float dip){
  vec3 c=fgSkyRad(d,dip);
  vec3 oc=vec3(uCoverL)*(0.45+0.55*clamp(d.y+dip,0.0,1.0))*vec3(1.0,1.02,1.06);
  c=mix(c,oc,uCover); c+=vec3(0.75,0.8,1.0)*uFlash*(0.5+0.5*d.y); return c+fgNightSky(d,dip);
}
/* aerial perspective: exponential height fog between the camera and a world position; colour = the sky just above the horizon in that direction */
vec3 fgFog(vec3 col,vec3 wp){
  vec3 v=wp-camPos; float dist=length(v); vec3 d=v/max(dist,1e-3);
  float y0=max(camPos.y,0.0), y1=max(wp.y,0.0), dy=y1-y0;
  float avg=abs(dy)>3.0?(exp(-y0/uFogH)-exp(-y1/uFogH))*uFogH/dy:exp(-0.5*(y0+y1)/uFogH);
  float T=exp(-uFogK*dist*avg);
  vec3 hz=fgSky(normalize(vec3(d.x,max(d.y,0.0),d.z)),uDip);
  float T2=exp(-uCloudK*dist); return (col*T+hz*(1.0-T))*T2+uCloudCol*(1.0-T2);
}
`;
function fgUniforms(){ const V=THREE.Vector3, C=THREE.Color, u=v=>({value:v});
  return { uSunDir:u(new V(0.3,0.8,-0.4)), uSunCol:u(new C(1,1,1)), uMoonDir:u(new V(0.25,0.55,-0.6)), camPos:u(new V()), uRay:u(1), uMie:u(1), uDip:u(0), uNight:u(0), uCover:u(0), uCoverL:u(0.3), uTime:u(0),
    uFogK:u(1e-4), uFogH:u(2500), uSunE:u(20), uCityG:u(0.3), uSunDisc:u(1), uStars:u(0), uLDir:u(new V(0,1,0)), uLCol:u(new C()), uAmb:u(new C()), uWet:u(0), uScl:u(1), uCloudK:u(0), uFlash:u(0), uCloudCol:u(new C(0.6,0.6,0.6)) }; }
/* CPU mirror of fgSkyRad (dip 0) for ambient colours and fog colour */
function fgSkyJS(dy,mu,sy,ray,mie,E){ dy=Math.max(dy,0.012); sy=Math.max(sy,0.02); const bR=[5.8e-6*ray,13.5e-6*ray,33.1e-6*ray], bM=6e-6*mie, g=0.76, pR=0.0596831*(1+mu*mu), pM=0.0795775*(1-g*g)/Math.pow(1+g*g-2*g*mu,1.5), H=8000, o=[0,0,0];
  for(let i=0;i<3;i++){ const bE=bR[i]+bM*1.1, S=(bR[i]*pR+bM*pM)/bE, t=bE*H/sy, u=bE*H/dy; let w=u-t; if(Math.abs(w)<1e-3) w=1e-3; o[i]=E*S*u*Math.exp(-t-[0.020,0.035,0.003][i]/sy)*(1-Math.exp(-w))/w; } return o; }
/* sets every atmosphere uniform and the lights for a time preset t and a weather preset w; returns the horizon haze colour [r,g,b] */
function fgAtmoApply(U,L,t,w){
  const V=THREE.Vector3, sd=new V().fromArray(t.sun).normalize(), sy=sd.y, night=t.night?1:0, ray=t.ray||1, mie=(t.mie||1)*(w.haze||1), E=t.E*(night?0:1), H=8000, syc=Math.max(sy,0.02), cov=w.cover||0;
  const bR=[5.8e-6*ray,13.5e-6*ray,33.1e-6*ray], bM=6e-6*mie, lum=c=>0.3*c[0]+0.55*c[1]+0.15*c[2];
  U.uSunDir.value.copy(sd); U.uRay.value=ray; U.uMie.value=mie; U.uSunE.value=E; U.uNight.value=night; U.uCover.value=cov; U.uCityG.value=night*0.07*(1-cov*0.6);
  const dir=[0,1,2].map(i=>t.D*Math.exp(-(bR[i]+bM*1.1)*H/syc-[0.020,0.035,0.003][i]/syc)*(1-cov*0.88)*(night?0:1));
  U.uSunCol.value.setRGB(dir[0],dir[1],dir[2]);
  /* ambient: average of the clear sky over a few directions (toward, across, away from the sun) */
  let amb=[0,0,0]; const els=[0.12,0.45,0.9], ws=[0.2,0.45,0.35], ce=Math.sqrt(1-sy*sy);
  els.forEach((el,i)=>{ const se=Math.sin(el), ceL=Math.cos(el); [[1,0.25],[0,0.5],[-1,0.25]].forEach(([c,wt])=>{ const mu=Math.max(-1,Math.min(1,se*sy+ceL*ce*c)), s=fgSkyJS(se,mu,sy,ray,mie,E); for(let k=0;k<3;k++) amb[k]+=s[k]*ws[i]*wt; }); });
  amb=amb.map(v=>v*0.9); const la=lum(amb);
  if(night) amb=[0.012,0.018,0.036];
  amb=amb.map(v=>(v*(1-cov*0.7)+la*1.2*cov*0.7*(night?0:1))*(1-(w.dark||0)*0.4)); U.uAmb.value.setRGB(amb[0],amb[1],amb[2]);
  U.uCoverL.value=(night?0.02:la*1.7+lum(dir)*Math.max(sy,0)*0.12)*(1-(w.dark||0)*0.55);
  U.uDip.value=0; U.uStars.value=night*(1-cov); U.uSunDisc.value=(1-night)*(1-cov)*Math.max(0,Math.min(1,(sy+0.03)/0.06));
  /* lights: the sun by day, the moon at night */
  const mv=new V().fromArray(t.moon||[0.25,0.55,-0.6]).normalize(); U.uMoonDir.value.copy(mv);
  const ld=night?mv:sd, lc=night?[0.075,0.10,0.17]:dir; U.uLDir.value.copy(ld); U.uLCol.value.setRGB(lc[0],lc[1],lc[2]);
  const m=Math.max(lc[0],lc[1],lc[2],1e-4); L.sun.color.setRGB(lc[0]/m,lc[1]/m,lc[2]/m); L.sun.intensity=m; L.sun.position.copy(ld).multiplyScalar(1000);
  L.hemi.color.setRGB(amb[0],amb[1],amb[2]); L.hemi.intensity=1; const gb=[0.30,0.24,0.17].map((a,i)=>a*(lc[i]*Math.max(ld.y,0)+amb[i])); L.hemi.groundColor.setRGB(gb[0],gb[1],gb[2]);
  /* fog */
  U.uFogK.value=3.912/w.vis; U.uFogH.value=w.fh;
  let hz=fgSkyJS(0.04,0.2,sy,ray,mie,E); if(night) hz=[0.012,0.02,0.045]; const lh=lum(hz); hz=hz.map(v=>v*(1-cov)+lh*cov*(night?1:1.0));
  return hz;
}
function fgSkyMat(U,env){
  return new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,toneMapped:!env,uniforms:Object.assign({},U),
    vertexShader:"varying vec3 vD; void main(){ vD=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_Position.z=gl_Position.w*0.99999; }",
    fragmentShader:fgAtmo+`uniform float uSunDisc,uStars,uScl; varying vec3 vD;
      void main(){
        vec3 d=normalize(vD); vec3 c=fgSky(d,uDip); float mu=dot(d,uSunDir), x=1.0-mu;
        c+=uSunCol*uSunDisc*((1.0-smoothstep(6.0e-5,1.0e-4,x))*14.0+exp(-x*1100.0)*1.6+exp(-x*80.0)*0.22);
        if(uNight>0.01){
          vec3 mt=normalize(cross(uMoonDir,vec3(0.0,1.0,0.0))), mb=cross(mt,uMoonDir); vec2 q=vec2(dot(d,mt),dot(d,mb))/0.0125; float r2=dot(q,q);
          if(r2<1.0){ vec3 n=vec3(q,sqrt(1.0-r2)); float lit=smoothstep(-0.1,0.3,dot(n,normalize(vec3(0.55,0.2,0.8)))); float mar=0.72+0.28*fgNoise(q*2.6+4.0)*fgNoise(q*5.1+9.0); c+=vec3(0.85,0.9,1.0)*lit*mar*(1.0-uCover*0.9)*uNight*2.2*(0.6+0.4*n.z); }
        }
        if(uStars>0.01&&d.y>-0.02){ vec3 p=d*64.0, i=floor(p), f=fract(p); float h=fgHash3(i);
          if(h>0.92){ vec3 off=0.3+0.4*vec3(fgHash3(i+7.1),fgHash3(i+13.7),fgHash3(i+3.3)); float r=length(f-off), b=(h-0.92)/0.08, tw=0.78+0.22*sin(uTime*(2.0+6.0*fgHash3(i+1.7))+h*40.0);
            c+=mix(vec3(0.7,0.8,1.0),vec3(1.0,0.85,0.7),fgHash3(i+5.0))*smoothstep(0.17,0.0,r)*(0.2+3.2*b*b)*tw*uStars*smoothstep(0.0,0.25,d.y); }
          vec3 gn=normalize(vec3(0.35,0.8,-0.5)); float band=exp(-pow(dot(d,gn)*3.6,2.0)); c+=vec3(0.45,0.5,0.75)*0.05*band*(0.4+fgNoise(vec2(atan(d.x,d.z)*7.0,d.y*9.0))*0.9)*uStars*smoothstep(0.0,0.2,d.y);
        }
        c=mix(uCloudCol,c,exp(-uCloudK*9000.0)); c*=uScl; gl_FragColor=vec4(max(c,vec3(0.0)),1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }`});
}
function fgSkyBuild(scene,U){ const geo=new THREE.SphereGeometry(40000,40,24), mesh=new THREE.Mesh(geo,fgSkyMat(U,false)); mesh.renderOrder=-10; mesh.frustumCulled=false; scene.add(mesh);
  /* environment capture: the same sky shader rendered to a small cube map, prefiltered for the aircraft materials (cheap fake reflections) */
  const esc=new THREE.Scene(), em=new THREE.Mesh(geo,fgSkyMat(Object.assign({},U,{uScl:{value:0.35}}),true)); em.frustumCulled=false; esc.add(em);
  const gm=new THREE.MeshBasicMaterial({color:0x777060,toneMapped:false,fog:false}), gd=new THREE.Mesh(new THREE.CircleGeometry(30000,24).rotateX(-Math.PI/2),gm); gd.position.y=-12; esc.add(gd);
  const rt=new THREE.WebGLCubeRenderTarget(64), cc=new THREE.CubeCamera(10,90000,rt);
  return {mesh,capture:(ren,pm,gc)=>{ gm.color.setRGB(gc[0]*0.35,gc[1]*0.35,gc[2]*0.35); cc.update(ren,esc); return pm.fromCubemap(rt.texture); }}; }
