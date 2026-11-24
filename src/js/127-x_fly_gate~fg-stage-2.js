/* ---------- fg stage 2: the ground. One shader draws terrain (geometry-clipmap rings that follow the camera), desert / rock / farmland, the sea and coast,
   roads, towns, and the whole airport surface (runway with every marking, taxiways, apron) with analytic anti-aliasing, so there is no z-fighting and no texture cost.
   World: x east, y up, z south; runway 36 on x=0, z from 0 (threshold) to -3600. Used by fwBuild() in p8w.js. ---------- */
function fgNoiseTex(){
  const N=256, d=new Uint8Array(N*N*4); let seed=987654321; const R=()=>{ seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
  const chan=(ch,octs,ridged)=>{ const v=new Float32Array(N*N);
    octs.forEach((f,oi)=>{ const lat=new Float32Array(f*f); for(let i=0;i<lat.length;i++) lat[i]=R(); const sc=f/N, amp=Math.pow(0.5,oi);
      for(let y=0;y<N;y++){ const fy=y*sc, y0=Math.floor(fy), ty=fy-y0, sy=ty*ty*(3-2*ty), ya=(y0%f)*f, yb=((y0+1)%f)*f;
        for(let x=0;x<N;x++){ const fx=x*sc, x0=Math.floor(fx), tx=fx-x0, sx=tx*tx*(3-2*tx), xa=x0%f, xb=(x0+1)%f, a=lat[ya+xa], b=lat[ya+xb], c=lat[yb+xa], e=lat[yb+xb], t=a+(b-a)*sx; v[y*N+x]+=amp*(t+((c+(e-c)*sx)-t)*sy); } } });
    let m=0,s=0; for(let i=0;i<v.length;i++) m+=v[i]; m/=v.length; for(let i=0;i<v.length;i++) s+=(v[i]-m)*(v[i]-m); s=Math.sqrt(s/v.length)*4.4;
    for(let i=0;i<v.length;i++){ let u=Math.max(0,Math.min(1,0.5+(v[i]-m)/s)); if(ridged) u=1-Math.abs(2*u-1); d[i*4+ch]=Math.round(Math.pow(u,ridged?0.8:1)*255); } };
  chan(0,[2,4,8,16,32,64],0); chan(1,[2,4,8,16,32,64],0); chan(2,[2,4,8,16,32],1); chan(3,[32,64,128,128],0);
  FK_NZ=d; const t=new THREE.DataTexture(d,N,N,THREE.RGBAFormat); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.magFilter=THREE.LinearFilter; t.minFilter=THREE.LinearMipmapLinearFilter; t.generateMipmaps=true; t.anisotropy=4; t.needsUpdate=true; return t;
}
const fgTerr=`
uniform sampler2D uNz;
vec4 fgT(vec2 p){ return texture2D(uNz,p); }
uniform vec4 uSea0,uSea1,uRiv,uRiv2,uLak0,uLak1,uRel,uMt,uTrn,uRd[4],uRing; uniform vec2 uRiv3; uniform vec3 uPA,uPB,uPC,uGr,uWC0,uWC1; uniform float uPalm;
/* water: positive inside (metres), negative on land. Up to two seas (half planes with a wobbling coast), a sinusoidal river or creek, two lakes. */
float fkSea(vec2 w,vec4 S){ if(S.z>1.0e6) return -1.0e5; float a=dot(w,vec2(-S.y,S.x)), wob=S.w*(sin(a/2600.0)+0.47*sin(a/900.0+1.0)+0.66*(fgT(vec2(a/5000.0,0.37)).r-0.5)); return dot(w,S.xy)-S.z-wob; }
float fkWaterS(vec2 w){ float s=max(fkSea(w,uSea0),fkSea(w,uSea1));
  if(uRiv2.w>0.5){ float a=dot(w,vec2(-uRiv.y,uRiv.x)); if(a>uRiv3.x&&a<uRiv3.y){ float c=uRiv.z+uRiv2.x*sin(a/uRiv2.y+uRiv2.z)+0.3*uRiv2.x*sin(a/(uRiv2.y*0.31)+1.7); s=max(s,uRiv.w-abs(dot(w,uRiv.xy)-c)); } }
  if(uLak0.z>1.0) s=max(s,min(uLak0.z,uLak0.w)*(1.0-length((w-uLak0.xy)/uLak0.zw)));
  if(uLak1.z>1.0) s=max(s,min(uLak1.z,uLak1.w)*(1.0-length((w-uLak1.xy)/uLak1.zw)));
  return s; }
${FK_GLSL}
/* roads: x = distance to the nearest centre line, y = distance along it */
vec2 fkRoadInfo(vec2 w){ float d=1.0e9, al=0.0;
  for(int i=0;i<4;i++){ vec4 s=uRd[i]; vec2 a=s.xy, ba=s.zw-s.xy; float L2=dot(ba,ba); if(L2>1.0){ float h=clamp(dot(w-a,ba)/L2,0.0,1.0), dd=length(w-a-ba*h); if(dd<d){ d=dd; al=h*sqrt(L2)+float(i)*3000.0; } } }
  if(uRing.w>0.5){ vec2 q=w-uRing.xy; float dd=abs(length(q)-uRing.z); if(dd<d){ d=dd; al=atan(q.y,q.x)*uRing.z; } }
  return vec2(d,al); }
float fgFlatK(vec2 w){
  vec2 q=max(abs(w-uAp.xy)-uAp.zw-vec2(500.0),vec2(0.0));
  float ky; return smoothstep(0.0,2200.0,length(q))*(1.0-smoothstep(0.02,0.22,fkDens(w,ky)));
}
float fgH(vec2 w,float lod){
  float fl=fgFlatK(w); if(fl<0.002) return 0.0;
  float s=fkWaterS(w); if(s>0.0) return 0.0;
  vec4 a=fgT(w/26000.0), b=fgT(w/5600.0+0.31); float dE=length(w-uAp.xy);
  float rel=((a.r-0.5)*uRel.x+(b.g-0.5)*uRel.x*0.47)*smoothstep(2500.0,8000.0,dE);
  vec2 dw=vec2(dot(w,vec2(0.82,0.57)),dot(w,vec2(-0.57,0.82)));
  float dm=smoothstep(0.52,0.74,fgT(w/9000.0+0.6).r), ph=(dw.y/700.0+3.2*(fgT(w/2600.0).g-0.5)+0.35*sin(dw.x/900.0))*6.2832;
  float dune=dm*(0.5+0.5*sin(ph+0.5*sin(ph)))*(0.4+0.6*fgT(w/1700.0+0.2).b)*uRel.y*smoothstep(2500.0,6000.0,dE)*(1.0-smoothstep(2.0,4.0,lod));
  float m1=smoothstep(uMt.z,uMt.w,dot(w,uMt.xy)+0.2*abs(dot(w,vec2(-uMt.y,uMt.x)))), rg=fgT(w/11000.0+0.2).b;
  float mtn=m1*uRel.z*(0.128+pow(rg,1.4)*(0.5+0.5*a.g));
  float hill=pow(fgT(w/3200.0+0.7).b,2.6)*uRel.w*smoothstep(5000.0,12000.0,dE)*(1.0-m1);
  float h=(rel+dune+mtn+hill)*fl; if(lod<3.0) h+=(fgT(w/230.0+0.1).g-0.5)*3.0*fl;
  return mix(h,0.0,smoothstep(-500.0,0.0,s));
}
float fgTownM(vec2 w){ float ky; return fkDens(w,ky); }
float fgFarmM(vec2 w){ float ky; return uTrn.z*smoothstep(0.46,0.66,fgT(w/9000.0+0.4).r)*(1.0-smoothstep(0.0,0.25,fkDens(w,ky))); }
`;
const fgGroundVert=fgTerr+`
attribute vec2 gp; attribute float lvl; uniform float uCell; uniform vec3 camPos; varying vec3 vW; varying vec3 vN; varying float vH;
void main(){
  float cell=uCell*exp2(lvl); vec2 sn=floor(camPos.xz/(2.0*cell)+0.5)*2.0*cell, w=sn+gp*cell;
  float h=fgH(w,lvl), hx=fgH(w+vec2(cell,0.0),lvl), hz=fgH(w+vec2(0.0,cell),lvl);
  vN=normalize(vec3(h-hx,cell,h-hz)); vH=h;
  vec2 dc=w-camPos.xz; h-=dot(dc,dc)/12742000.0+lvl*0.12+cell*0.0015;
  vW=vec3(w.x,h,w.y); gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.0);
}`;
const fgGroundFragBody=`
uniform sampler2D uShTex,uNum; uniform vec4 uShad,uShad2,uFl[8],uLLp,uLLd,uRw,uR2,uPv[14],uAv,uAs,uHd[5]; uniform float uLamp,uWet,uWind,uPy[14];
varying vec3 vW; varying vec3 vN; varying float vH;
float fgBar(float v,float a,float b,float aa){ return clamp((v-a)/aa+0.5,0.0,1.0)-clamp((v-b)/aa+0.5,0.0,1.0); }
float fgSdBox(vec2 p,vec2 c,vec2 h){ vec2 d=abs(p-c)-h; return length(max(d,0.0))+min(max(d.x,d.y),0.0); }
float fgSmin(float a,float b,float k){ float h=max(k-abs(a-b),0.0)/k; return min(a,b)-h*h*k*0.25; }
float fgStr(float ar,float n,float aax){ float uu=ar-6.0, ix=floor(uu/3.6), fu=uu-ix*3.6; return fgBar(fu,0.0,1.8,aax)*step(0.0,uu)*step(ix,n-0.5); }
vec3 fgSea(vec2 w,float s,vec3 V,float dist,float dsc,out float foamOut){
  float dep=clamp(s/dsc,0.0,1.0), bank=smoothstep(0.52,0.72,fgT(w/2100.0+0.5).g)*smoothstep(dsc*1.25,dsc*0.08,s); dep*=1.0-0.85*bank;
  vec3 body=mix(uWC0,uWC1,pow(dep,0.45));
  float fade=1.0/(1.0+dist*0.0006), rough=0.45+uWind*0.9;
  vec2 n1=fgT(w/43.0+vec2(uTime*0.017,uTime*0.011)).rg-0.5, n2=fgT(w/9.7-vec2(uTime*0.021,-uTime*0.031)).gb-0.5;
  vec3 N=normalize(vec3((n1.x*0.9+n2.x*0.55)*fade*rough,1.0,(n1.y*0.9+n2.y*0.55)*fade*rough));
  float F=0.02+0.98*pow(1.0-max(dot(N,V),0.0),5.0);
  vec3 R=reflect(-V,N); R.y=abs(R.y)+0.01; vec3 refl=fgSky(normalize(R),0.0);
  float g=pow(max(dot(R,uSunDir),0.0),700.0)*5.0+pow(max(dot(R,uSunDir),0.0),60.0)*0.12;
  vec3 c=body*(uAmb+uLCol*0.45)*(1.0-F)+refl*F+uSunCol*g*(1.0-uNight)*(1.0-uCover);
  float gm=pow(max(dot(R,uMoonDir),0.0),500.0); c+=vec3(0.55,0.65,0.9)*gm*uNight*1.5*(1.0-uCover);
  float fb=exp(-s/10.0)*(0.55+0.45*sin(s*0.45-uTime*0.9+fgT(w/70.0).r*7.0))+0.08*exp(-s/60.0);
  foamOut=clamp(fb,0.0,1.0)*smoothstep(0.0,1.5,s); return c;
}
void main(){
  vec2 w=vW.xz; vec3 Vv=camPos-vW; float dist=length(Vv); vec3 V=Vv/dist;
  vec2 aa=max(fwidth(w),vec2(0.02)); float aaI=max(aa.x,aa.y);
  vec3 N=normalize(vN); float s=fkWaterS(w), sSea=max(fkSea(w,uSea0),fkSea(w,uSea1));
  vec4 gA=fgT(w/20000.0), gB=fgT(w/3500.0+0.2), gC=fgT(w/520.0+0.6), gD=fgT(w/55.0+0.1), gE=fgT(w/6.5+0.4);
  float nr=1.0-smoothstep(150.0,1200.0,dist);
  /* ---- desert, rock, gravel, salt flats ---- */
  vec3 alb=mix(uPA,uPB,smoothstep(0.35,0.7,gA.g)); alb=mix(alb,uPC,smoothstep(0.55,0.8,gB.r)*0.6);
  alb*=0.86+0.28*gC.r; alb*=0.93+0.14*gD.a; alb*=0.96+0.08*gE.a;
  float steep=1.0-N.y, rockM=clamp(smoothstep(0.07,0.2,steep+(gC.g-0.5)*0.07)+smoothstep(140.0,420.0,vH+(gB.b-0.5)*160.0)*0.8,0.0,1.0);
  float vegM=uTrn.x*smoothstep(0.3,0.6,gB.g*0.55+gA.r*0.45)*(1.0-rockM*0.9), rip=exp(min(s,0.0)/260.0)*step(s,0.0)*min(1.0,uTrn.x*3.0+0.25);
  alb=mix(alb,uGr*(0.7+0.5*gC.g)*(0.92+0.16*gD.a),max(vegM,rip*0.55));
  float forM=uTrn.y*smoothstep(0.52,0.68,fgT(w/2300.0+0.9).g)*(1.0-rockM); alb=mix(alb,uGr*0.5*(0.8+0.4*gD.r),forM);
  vec3 rockC=mix(vec3(0.40,0.32,0.26),vec3(0.55,0.45,0.35),gD.r)*(0.78+0.3*sin(vH*0.2+gB.g*9.0)); alb=mix(alb,rockC,rockM);
  float snow=smoothstep(uTrn.w,uTrn.w+140.0,vH+(gB.b-0.5)*260.0); alb=mix(alb,vec3(0.90,0.92,0.95)*(0.92+0.08*gD.a),snow*(1.0-0.5*smoothstep(0.3,0.55,steep)));
  float sab=smoothstep(0.55,0.7,gB.g)*smoothstep(4200.0,300.0,-s)*step(s,0.0)*(1.0-uTrn.x); alb=mix(alb,vec3(0.80,0.77,0.68)*(0.9+0.15*gD.a),sab*0.8);
  float wetS=exp(min(s,0.0)/16.0)*step(s,0.0); alb=mix(alb,alb*vec3(0.62,0.58,0.52),wetS);
  vec3 emis=vec3(0.0); float lampOn=uLamp;
  /* ---- farmland: pivot circles and rectangular plots ---- */
  float farm=fgFarmM(w);
  if(farm>0.01){
    vec2 cell=floor(w/720.0), j=vec2(fgHash(cell),fgHash(cell+7.3)); vec2 cc=(cell+0.5+(j-0.5)*0.25)*720.0; float h3=fgHash(cell+3.1), h4=fgHash(cell+11.7);
    float pivP=mix(0.38,0.93,smoothstep(0.3,0.7,uTrn.x)); float pv=(1.0-smoothstep(300.0-aaI,300.0+aaI,length(w-cc)))*step(pivP,h3);
    vec3 crop=mix(mix(vec3(0.13,0.31,0.09),vec3(0.24,0.42,0.12),h4),vec3(0.46,0.38,0.22),step(0.8,h4)); crop*=0.85+0.3*gD.g;
    vec2 d=w-cc; float ang=atan(d.y,d.x); crop*=1.0+0.08*sin(ang*70.0)*nr*pv; crop*=0.9+0.1*smoothstep(260.0,300.0,length(d));
    vec2 rc=(floor(w/vec2(380.0,260.0))+0.5)*vec2(380.0,260.0); float rectOn=step(h3,pivP)*step(0.3,fgHash(cell+5.0))*step(abs(w.x-rc.x),170.0)*step(abs(w.y-rc.y),110.0);
    vec3 rcr=mix(vec3(0.16,0.34,0.10),vec3(0.38,0.34,0.16),fgHash(floor(w/vec2(380.0,260.0)))); rcr*=0.85+0.15*sin(w.x*1.7)*nr;
    alb=mix(alb,crop,pv*farm); alb=mix(alb,rcr,rectOn*farm*0.9);
    float dots=step(0.9,fgHash(floor(w/11.0)))*(1.0-smoothstep(0.8,3.0,aaI)); alb=mix(alb,vec3(0.10,0.22,0.07),dots*farm*0.6*(1.0-pv));
  }
  alb=pow(alb,vec3(2.2));
  /* ---- airport graded area, then pavements: the runway plus a list of taxiway / apron rectangles (uniforms), all anti-aliased analytically ---- */
  float grd=1.0-smoothstep(0.0,260.0,fgSdBox(w,uAp.xy,uAp.zw-vec2(30.0))); alb=mix(alb,vec3(0.27,0.22,0.15)*(0.9+0.15*gC.r),grd*0.75*(1.0-farm));
  float cov=0.0, covRw=0.0, wearA=0.0; vec3 pav=vec3(0.1);
  vec2 abx=abs(w-uAp.xy)-uAp.zw;
  if(max(abx.x,abx.y)<0.0){
    float len=uRw.x, hw=uRw.y, u=w.x, v=-w.y, ar=abs(u), vt=min(v,len-v);
    float dSh=fgSdBox(w,vec2(0.0,-len*0.5),vec2(hw+7.5,len*0.5)), dRw=fgSdBox(w,vec2(0.0,-len*0.5),vec2(hw,len*0.5)), dTx=1.0e5, dAp=1.0e5;
    float dR2=1.0e5; if(uR2.z>0.0){ dR2=fgSdBox(w,uR2.xy,uR2.zw); dSh=min(dSh,fgSdBox(w,uR2.xy,uR2.zw+vec2(7.5))); dRw=min(dRw,dR2); }   /* (v23) a second runway beside the first: pavement, shoulders, edge lines, centre dashes, threshold bars */
    for(int k=0;k<14;k++){ float ty=uPy[k]; if(ty>1.5){ vec4 r=uPv[k]; float d=fgSdBox(w,r.xy,r.zw); if(ty<2.5) dTx=fgSmin(dTx,d,16.0); else dAp=fgSmin(dAp,d,16.0); } }
    float dT=fgSmin(dTx,dAp,16.0), dAll=fgSmin(dSh,dT,14.0);
    cov=clamp(0.5-dAll/aaI,0.0,1.0); covRw=clamp(0.5-dRw/aaI,0.0,1.0); float covSh=clamp(0.5-dSh/aaI,0.0,1.0);
    float apr=clamp(0.5-(dAp+6.0)/aaI,0.0,1.0);
    pav=mix(vec3(0.095,0.098,0.10)*(0.8+0.4*gD.r),vec3(0.07,0.072,0.075)*(0.8+0.4*gD.r),covRw); pav=mix(pav,vec3(0.15,0.15,0.15),(covSh-covRw)*0.8); pav=mix(pav,vec3(0.23,0.23,0.225)*(0.88+0.24*gD.g),apr);
    pav*=0.9+0.2*gE.a; vec2 jf=abs(fract(w/7.5-0.5)-0.5)*7.5; pav*=1.0-0.12*apr*(1.0-smoothstep(0.02,0.05+aa.x,min(jf.x,jf.y)))*(1.0-smoothstep(0.4,1.6,aaI));
    float rub=smoothstep(0.55,0.78,fgT(vec2(u/4.0,v/300.0)).r)*fgBar(vt,160.0,900.0,3.0)*fgBar(ar,0.5,14.0,0.5); pav*=1.0-0.16*rub*covRw;
    pav*=1.0-0.35*smoothstep(0.55,0.8,gC.b)*(1.0-apr)*0.5;
    alb*=1.0-0.22*smoothstep(9.0,0.0,dAll)*(1.0-cov); alb=mix(alb,pav,cov);
    /* runway markings */
    float mk=fgBar(ar,hw-1.5,hw-0.6,aa.x)*fgBar(v,0.0,len,aa.y);
    float dash=mix(fgBar(mod(v,50.0),10.0,40.0,aa.y),0.6,smoothstep(8.0,30.0,aa.y)); mk+=fgBar(ar,0.0,0.45,aa.x)*dash*fgBar(v,100.0,len-100.0,aa.y);
    float uu=ar-2.85, ix=floor(uu/3.35), fu=uu-ix*3.35, thr=mix(fgBar(fu,0.0,1.8,aa.x),0.54,smoothstep(1.0,3.0,aa.x))*step(0.0,uu)*step(ix,hw/3.75-0.5)*fgBar(vt,6.0,36.0,aa.y); mk+=thr;
    mk+=fgBar(ar,8.5,14.5,aa.x)*fgBar(vt,300.0,360.0,aa.y);
    mk+=fgBar(vt,150.0,172.5,aa.y)*fgStr(ar,3.0,aa.x)+fgBar(vt,450.0,472.5,aa.y)*fgStr(ar,2.0,aa.x)+fgBar(vt,600.0,622.5,aa.y)*fgStr(ar,2.0,aa.x)+fgBar(vt,750.0,772.5,aa.y)*fgStr(ar,1.0,aa.x)+fgBar(vt,900.0,922.5,aa.y)*fgStr(ar,1.0,aa.x);
    float north=step(len*0.5,v), vn=mix(v,len-v,north), un=mix(u,-u,north);
    float reg=fgBar(un,-10.0,10.0,aa.x)*fgBar(vn,46.0,64.0,aa.y);
    if(reg>0.001) mk+=reg*texture2D(uNum,vec2(0.5*(un+10.0)/20.0+0.5*north,(vn-46.0)/18.0)).a;
    if(uR2.z>0.0){ vec2 s2=w-uR2.xy; float u2=abs(s2.x), v2=uR2.w-s2.y, len2=uR2.w*2.0, vt2=min(v2,len2-v2), uu2=u2-2.85, ix2=floor(uu2/3.35), fu2=uu2-ix2*3.35;
      float m2=fgBar(u2,uR2.z-1.5,uR2.z-0.6,aa.x)*fgBar(v2,0.0,len2,aa.y); m2+=fgBar(u2,0.0,0.45,aa.x)*mix(fgBar(mod(v2,50.0),10.0,40.0,aa.y),0.6,smoothstep(8.0,30.0,aa.y))*fgBar(v2,80.0,len2-80.0,aa.y);
      m2+=mix(fgBar(fu2,0.0,1.8,aa.x),0.54,smoothstep(1.0,3.0,aa.x))*step(0.0,uu2)*step(ix2,uR2.z/3.75-0.5)*fgBar(vt2,6.0,36.0,aa.y)+fgBar(u2,8.5,14.5,aa.x)*fgBar(vt2,300.0,360.0,aa.y); mk+=m2*clamp(0.5-dR2/aaI,0.0,1.0); }
    mk*=covRw*(0.78+0.22*gE.a)*(1.0-0.25*rub);
    /* taxiway paint: centre lines along each taxi rectangle, edge lines, hold lines, stand lead-ins and stop bars (yellow) */
    float yl=0.0;
    for(int k=0;k<14;k++){ if(uPy[k]>1.5&&uPy[k]<2.5){ vec4 r=uPv[k]; if(r.z>=r.w) yl+=fgBar(w.y,r.y-0.15,r.y+0.15,aa.y)*fgBar(w.x,r.x-r.z+0.5,r.x+r.z-0.5,aa.x); else yl+=fgBar(w.x,r.x-0.15,r.x+0.15,aa.x)*fgBar(w.y,r.y-r.w+0.5,r.y+r.w-0.5,aa.y); } }
    float edge=fgBar(-dT,0.45,0.85,aaI)*smoothstep(0.0,3.0,dSh)*(1.0-0.7*apr); yl+=edge;
    for(int k=0;k<5;k++){ vec4 hd=uHd[k]; float lx=(w.x-hd.x)*hd.z; yl+=fgBar(w.y,hd.y-11.4,hd.y+11.4,aa.y)*(fgBar(lx,0.0,0.3,aa.x)+fgBar(lx,0.8,1.1,aa.x)+(fgBar(lx,1.6,1.9,aa.x)+fgBar(lx,2.4,2.7,aa.x))*step(mod(w.y,1.2),0.6)); }
    float kz=(uAv.x-w.y)/uAv.y, fz=abs(kz-floor(kz+0.5))*uAv.y, onS=step(-0.5,kz)*step(kz,uAs.x-0.5), xn=uAs.w>0.0?uAv.w:uAv.z;
    yl+=fgBar(fz,0.0,0.15,aa.y)*fgBar(w.x,uAv.z,uAv.w,aa.x)*onS*(1.0-smoothstep(3.0,12.0,aa.y))+fgBar(abs(w.x-xn),0.0,0.15,aa.x)*step(fz,3.5)*onS;
    yl*=cov;
    vec3 ylc=vec3(0.80,0.56,0.04)*(0.85+0.15*gE.a);
    alb=mix(alb,vec3(0.72)*(0.9+0.12*gD.a),clamp(mk,0.0,1.0)); alb=mix(alb,ylc,clamp(yl,0.0,1.0));
    wearA=cov;
  }
  /* ---- roads: the access road, the highway to the city and a ring road around it (uRd / uRing) ---- */
  vec2 ri=fkRoadInfo(w); float roadCov=clamp(0.5-(ri.x-14.0)/aaI,0.0,1.0)*(1.0-cov);
  if(roadCov>0.002){
    vec3 rc=vec3(0.065,0.067,0.07)*(0.85+0.3*gE.a);
    float lines=fgBar(ri.x,13.0,13.5,aaI), ld=fgBar(ri.x,7.4,7.8,aaI)*mix(step(mod(ri.y,12.0),3.0),0.25,smoothstep(2.0,8.0,aaI)), med=fgBar(ri.x,0.0,2.2,aaI);
    rc=mix(rc,vec3(0.22,0.21,0.19),med); rc=mix(rc,vec3(0.7),clamp(lines+ld,0.0,1.0)*(1.0-med));
    alb=mix(alb,rc,roadCov); emis+=vec3(1.0,0.55,0.2)*lampOn*roadCov*smoothstep(3.0,1.0,abs(ri.x-1.0))*(1.0-smoothstep(2.0,10.0,aaI))*step(mod(ri.y,52.0),4.0)*1.5;
  }
  /* ---- cities (x_fly_city.js): streets, lots and roofs from the same lattice the 3D buildings use ---- */
  float cky; float cdn=fkDens(w,cky);
  if(cdn>0.015&&s<-60.0){ vec3 cem; float cst; vec4 cc=fkGround(w,aa,cdn,cky,cem,cst); alb=mix(alb,cc.rgb,cc.a*(1.0-roadCov)); emis+=cem*lampOn*cc.a*(1.0-roadCov); }
  /* ---- sea ---- */
  float foam=0.0; vec3 seaC=vec3(0.0); float seaM=clamp(0.5+s/max(aa.x*2.0,1.5),0.0,1.0);
  if(seaM>0.0) seaC=fgSea(w,s,V,dist,sSea>=s-1.0?3600.0:220.0,foam);
  /* ---- shadow of the aircraft, light pools, lighting ---- */
  vec2 sp=w-uShad.xy; vec2 lo=vec2(dot(sp,vec2(uShad.z,uShad.w)),dot(sp,vec2(uShad.w,-uShad.z))); vec2 suv=vec2(lo.x/uShad2.x+0.5,lo.y/uShad2.y+0.5);
  float sh=texture2D(uShTex,suv,uShad2.w).a*uShad2.z*step(abs(suv.x-0.5),0.5)*step(abs(suv.y-0.5),0.5);
  vec3 flood=vec3(0.0); for(int i=0;i<8;i++){ vec4 fl=uFl[i]; float d=length(w-fl.xy); flood+=vec3(1.0,0.82,0.55)*fl.w*smoothstep(fl.z,fl.z*0.15,d); }
  vec3 Nd=normalize(N+vec3(gE.r-0.5,0.0,gE.g-0.5)*0.22*nr+vec3(gD.r-0.5,0.0,gD.g-0.5)*0.06*(1.0-nr));
  float dif=max(dot(Nd,uLDir),0.0)*(1.0-sh*0.7);
  vec3 lit=uAmb*(0.55+0.45*Nd.y)+uLCol*dif+flood*(1.0-sh*0.5);
  if(uLLp.w>0.01){ vec3 Lv=uLLp.xyz-vW; float Ld=length(Lv); vec3 Ln=Lv/max(Ld,1.0); float cone=smoothstep(uLLd.w,uLLd.w+0.08,dot(-Ln,uLLd.xyz)); lit+=vec3(1.0,0.94,0.82)*uLLp.w*cone*max(dot(Nd,Ln),0.0)*(1.0+Ld*0.0)*260.0/(Ld*Ld+180.0); }
  vec3 col=alb*lit+emis*(1.0-seaM);
  if(uWet>0.01&&cov>0.01){ vec3 R=reflect(-V,vec3(0.0,1.0,0.0)); float F=0.03+0.9*pow(1.0-max(V.y,0.0),5.0); col=mix(col,col*0.55,uWet*cov); col+=fgSky(R,0.0)*F*uWet*cov*(0.6+0.4*fgT(w/14.0).r); }
  col=mix(col,seaC+vec3(foam*0.7)*(uAmb+uLCol*0.6),seaM);
  gl_FragColor=vec4(fgFog(col,vW),1.0);
  #include <tonemapping_fragment>
  #include <encodings_fragment>
}`;
function fgMkNumTex(){ return fwMkCanvasTex(256,128,(g,w,h)=>{ g.clearRect(0,0,w,h); g.fillStyle="#fff"; g.textAlign="center"; g.textBaseline="middle"; g.font="900 112px Arial Black,Arial,Helvetica,sans-serif"; g.save(); g.scale(0.82,1); g.fillText("36",w*0.25/0.82,h*0.54); g.fillText("18",w*0.75/0.82,h*0.54); g.restore(); },false); }
function fgMkShadowTex(){ return fwMkCanvasTex(128,128,(g,w,h)=>{ g.clearRect(0,0,w,h); g.fillStyle="#000"; g.beginPath(); g.ellipse(64,62,5.2,57,0,0,7); g.fill();
  g.beginPath(); g.moveTo(60,46); g.lineTo(5,76); g.lineTo(4,84); g.lineTo(62,66); g.closePath(); g.fill(); g.beginPath(); g.moveTo(68,46); g.lineTo(123,76); g.lineTo(124,84); g.lineTo(66,66); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(61,100); g.lineTo(34,114); g.lineTo(34,119); g.lineTo(62,111); g.closePath(); g.fill(); g.beginPath(); g.moveTo(67,100); g.lineTo(94,114); g.lineTo(94,119); g.lineTo(66,111); g.closePath(); g.fill();
  [[40,64],[88,64],[24,70],[104,70]].forEach(([x,y])=>{ g.beginPath(); g.ellipse(x,y,3,7,0,0,7); g.fill(); }); },false); }
/* the ground: a full 48x48 patch under the camera plus nine rings of doubling cell size (about 38k triangles, 2 draw calls) */
function fgGroundBuild(scene,AU){
  const N=48, H=N/2, nz=fgNoiseTex(), V2=THREE.Vector2, V4=THREE.Vector4;
  const mk=(hole)=>{ const gp=[], idx=[]; for(let j=0;j<=N;j++) for(let i=0;i<=N;i++) gp.push(i-H,j-H);
    for(let j=0;j<N;j++) for(let i=0;i<N;i++){ if(hole&&Math.abs(i-H+0.5)<11&&Math.abs(j-H+0.5)<11) continue; const a=j*(N+1)+i, b=a+1, c=a+N+1, d=c+1; idx.push(a,c,b,b,c,d); }
    const g=new THREE.InstancedBufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(new Array(gp.length/2*3).fill(0),3)); g.setAttribute("gp",new THREE.Float32BufferAttribute(gp,2)); g.setIndex(idx); return g; };
  const gC=mk(false), gR=mk(true); gC.setAttribute("lvl",new THREE.InstancedBufferAttribute(new Float32Array([0]),1)); gC.instanceCount=1;
  const NR=9, lv=new Float32Array(NR); for(let i=0;i<NR;i++) lv[i]=i+1; gR.setAttribute("lvl",new THREE.InstancedBufferAttribute(lv,1)); gR.instanceCount=NR;
  Object.assign(AU,{uNz:{value:nz},uNum:{value:fgMkNumTex()},uShTex:{value:fgMkShadowTex()},uShad:{value:new V4(0,0,1,0)},uShad2:{value:new V4(60,70,0,0)},uFl:{value:Array.from({length:8},()=>new V4(0,0,1,0))},uLamp:{value:0},uWind:{value:0.3},uCell:{value:10},uLLp:{value:new V4(0,0,0,0)},uLLd:{value:new V4(0,-1,0,0.86)}});
  fkCityUniforms(AU); fkEnvUniforms(AU); AU.uNum.value.anisotropy=8; AU.uNum.value.generateMipmaps=true;
  const mat=new THREE.ShaderMaterial({uniforms:AU,vertexShader:fgGroundVert,fragmentShader:fgAtmo+fgTerr+FK_GROUND+fgGroundFragBody,extensions:{derivatives:true}});
  const mC=new THREE.Mesh(gC,mat), mR=new THREE.Mesh(gR,mat); [mC,mR].forEach(m=>{ m.frustumCulled=false; scene.add(m); });
  return {meshes:[mC,mR],mat};
}
