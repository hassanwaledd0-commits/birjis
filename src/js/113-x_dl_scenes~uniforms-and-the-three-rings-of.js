/* ---------- uniforms and the three rings of instanced buildings ---------- */
function fkApplyCfg(AU){ const C=FK.cur, V4=THREE.Vector4, V3=THREE.Vector3;
  for(let k=0;k<3;k++){ const c=C.ct[k]||[0,0,0,0]; AU.uCt.value[k].set(c[0],c[1],c[2],c[3]); }
  AU.uCP.value.set(Math.cos(C.rot),Math.sin(C.rot),C.warp,0); AU.uCQ.value.set(C.th,0,0,0); AU.uAp.value.set(C.ap[0],C.ap[1],C.ap[2],C.ap[3]);
  ["uCP2","uCP3","uCP4","uCP5"].forEach((n,i)=>AU[n].value.set(C.pal[i][0],C.pal[i][1],C.pal[i][2])); }
function fkCityUniforms(AU){ const V4=THREE.Vector4, V3=THREE.Vector3;
  Object.assign(AU,{uHs:{value:fkMkHash()},uCt:{value:[new V4(),new V4(),new V4()]},uCP:{value:new V4()},uCQ:{value:new V4()},uAp:{value:new V4()},uCP2:{value:new V3()},uCP3:{value:new V3()},uCP4:{value:new V3()},uCP5:{value:new V3()}}); fkApplyCfg(AU); }
const FK_BVERT=`
attribute vec4 iA,iB,iC; attribute float aT; uniform vec3 camPos; uniform vec4 uRg; uniform vec2 uRg2; varying vec3 vW,vQ; varying vec2 vL,vU; varying vec4 vI; varying float vY;
void main(){
  vec2 c=iA.xy, wc=fkUnrot(c+fkWarp(c)); float dist=length(wc-camPos.xz), f=smoothstep(uRg.x,uRg.y,dist)*(1.0-smoothstep(uRg.z,uRg.w,dist))*uRg2.x;
  if(f<0.01||iB.x<=0.0||(aT>0.5&&aT<1.5&&iB.y<0.01)||(aT>1.5&&iC.x<0.01)){ gl_Position=vec4(2.0,2.0,2.0,1.0); vW=vQ=vec3(0.0); vL=vU=vec2(0.0); vI=vec4(0.0); vY=0.0; return; }
  float h0=iB.x*f, h1=iB.y*f, h2=iC.x*f, y; vec2 off, P=position.xz;
  if(aT<0.5){ y=position.y*h0; off=P*iA.zw; } else if(aT<1.5){ y=h0+position.y*h1; off=P*iA.zw*(1.0-mix(iB.z,iB.w,position.y)); } else { y=h0+h1+position.y*h2; off=P*min(iA.z,iA.w)*0.1; }
  vec2 u=c+off, w=fkUnrot(u+fkWarp(u)), dc=w-camPos.xz; float dd=dot(dc,dc), lv=max(0.0,floor(log2(max(sqrt(dd),1.0)/110.0)+1.0));
  float gs=dd/12742000.0+lv*0.12+10.0*exp2(lv)*0.0015; vW=vec3(w.x,y-1.3-gs,w.y); vL=u-c; vU=u; vY=y; vQ=vec3(iA.zw,aT); vI=vec4(iC.y,iC.z,iC.w,h0+h1);
  gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.0);
}`;
const FK_BFRAG=`
uniform float uLamp; varying vec3 vW,vQ; varying vec2 vL,vU; varying vec4 vI; varying float vY;
float fkBar(float v,float a,float b,float aa){ return clamp((v-a)/aa+0.5,0.0,1.0)-clamp((v-b)/aa+0.5,0.0,1.0); }
void main(){
  vec3 Vv=camPos-vW; float dist=length(Vv); vec3 V=Vv/dist, N=normalize(cross(dFdx(vW),dFdy(vW))); if(dot(N,V)<0.0) N=-N;
  float typ=vI.y, seed=vI.x, y=vY; vec3 tone=fkTone(vI.z)*(0.88+0.2*seed), alb, emis=vec3(0.0); float F=0.0, far=smoothstep(2000.0,8000.0,dist);
  if(vQ.z>1.5){ alb=vec3(0.55,0.57,0.6); }
  else if(N.y>0.35){
    /* roofs: flat with parapet and equipment, or hipped tiles on houses */
    vec2 l=vL; float edge=min(vQ.x-abs(l.x),vQ.y-abs(l.y)); float flatR=smoothstep(0.88,0.96,N.y);
    if(flatR<0.5&&typ<3.5){ float ln=0.5+0.5*sin(dot(vW.xz,vec2(N.z,-N.x))*6.0); alb=vec3(0.62,0.30,0.20)*(0.8+0.25*seed)*(0.88+0.12*ln); }
    else { alb=typ>5.5?vec3(0.70,0.72,0.74):typ>4.5?vec3(0.50,0.52,0.54):mix(vec3(0.52,0.51,0.49),tone,0.4)*(0.85+0.2*seed)*(0.95+0.1*fgHash(floor(l/2.5)+seed*13.0));
      alb*=1.0-0.2*(1.0-smoothstep(0.0,0.6,edge))*step(vQ.z,0.5);
      float fa=max(fwidth(l.x),fwidth(l.y));
      vec2 g=floor(l/3.5+100.0); float hh=fgHash(g+seed*53.0); vec2 gf=abs(fract(l/3.5)-0.5); float unit=step(0.8,hh)*step(max(gf.x,gf.y),0.32)*(1.0-smoothstep(1.0,3.0,fa))*step(1.5,edge)*step(vQ.z,0.5)*step(typ,5.5);
      alb=mix(alb,vec3(0.78,0.79,0.8)*(0.8+0.3*fract(hh*7.0)),unit);
      if(typ<3.5&&typ>0.5){ vec2 g2=abs(fract((l/vQ.xy)*vec2(1.5,2.0)+0.25)-0.5); alb*=1.0-0.16*(1.0-smoothstep(0.42,0.5,max(g2.x,g2.y)))*(1.0-smoothstep(0.5,2.0,fa));
        vec2 tp=l-vQ.xy*vec2(0.45,-0.4); float tk=1.0-smoothstep(0.8,1.2,length(tp)); alb=mix(alb,vec3(0.04,0.045,0.05),tk*step(2.0,vQ.x)*step(vQ.z,0.5)*(1.0-smoothstep(1.5,5.0,fa))); }
      if(typ>5.5){ float sk=fkBar(abs(fract(l.x/9.0)-0.5),0.0,0.12,max(fwidth(l.x)/9.0,0.01)); alb=mix(alb,vec3(0.32,0.45,0.55),sk*0.5); } }
  } else {
    /* facades: floor lines, bays, glass; towers are curtain walls that reflect the sky. Coordinates come from the lattice (u) so they are stable at any world position */
    vec2 Nu=fkRot(N.xz); float s=abs(Nu.x)>abs(Nu.y)?vU.y:vU.x; float fh=3.2,bw=3.4,x0=0.2,x1=0.8,y0=0.22,y1=0.78;
    if(typ>4.5){ fh=3.9; bw=1.8; } else if(typ>3.5){ fh=3.4; bw=3.4; x0=0.18; x1=0.82; y0=0.2; y1=0.8; } else if(typ>2.5){ fh=3.2; bw=3.2; x0=0.22; x1=0.78; y0=0.22; y1=0.76; }
    else if(typ>1.5){ fh=3.1; bw=4.0; x0=0.3; x1=0.7; y0=0.28; y1=0.8; } else if(typ>0.5){ fh=3.1; bw=5.0; x0=0.34; x1=0.66; y0=0.3; y1=0.8; } else { fh=1.4; bw=40.0; x0=0.0; x1=0.0; y0=0.0; y1=0.0; }
    vec2 fw=max(vec2(fwidth(s)/bw,fwidth(y)/fh),vec2(0.002)), cl=floor(vec2(s/bw,y/fh)), ff=fract(vec2(s/bw,y/fh)); float hh=fgHash(cl+floor(seed*97.0)*vec2(1.7,3.1)), hf=fgHash(vec2(cl.y,seed*61.0+3.0));
    float far2=smoothstep(0.3,0.9,max(fw.x,fw.y)), win;
    if(typ>4.5){ /* curtain wall: glass with thin mullions and slab edges */
      float mu=fkBar(abs(ff.x-0.5),0.455,0.5,fw.x)*0.5, sl=fkBar(ff.y,0.0,0.12,fw.y); win=1.0-max(mu,sl); win=mix(win,0.84,far2);
      vec3 tint=mix(vec3(0.16,0.30,0.40),tone*vec3(0.5,0.6,0.7),0.3)*(0.85+0.3*fract(hh*5.0+hf)); alb=mix(vec3(0.62,0.64,0.66),tint,win); F=win*0.42*(0.35+0.65*pow(1.0-max(dot(N,V),0.0),2.0))+0.04;
    } else if(typ<0.5||typ>5.5){ float rib=0.5+0.5*sin(y*10.0); alb=(typ>5.5?vec3(0.72,0.74,0.77):tone)*(0.88+0.12*mix(rib,0.5,smoothstep(0.2,0.6,fwidth(y)*10.0))); win=0.0; }
    else { win=fkBar(ff.x,x0,x1,fw.x)*fkBar(ff.y,y0,y1,fw.y); win=mix(win,(x1-x0)*(y1-y0),far2); alb=mix(tone,vec3(0.05,0.08,0.11),win*0.92); F=win*0.2*(0.2+0.8*pow(1.0-max(dot(N,V),0.0),3.0))+0.03; }
    float fl=hf>0.55?step(0.2,hh):step(0.9,hh); emis=vec3(1.0,0.72,0.42)*(0.7+0.6*fract(hh*13.0))*win*fl*(typ>4.5?1.1:0.9)*(1.0-far)*(typ<0.5||typ>5.5?0.0:1.0);
    alb*=0.6+0.4*smoothstep(0.0,12.0,y); }
  float dif=max(dot(N,uLDir),0.0); alb=pow(alb,vec3(2.2)); vec3 col=alb*(uAmb*(0.55+0.45*N.y)+uLCol*dif);
  vec3 R=reflect(-V,N); R.y=abs(R.y); col+=fgSky(R,0.0)*F*(1.0-far*0.6)+emis*uLamp;
  gl_FragColor=vec4(fgFog(col,vW),1.0);
  #include <tonemapping_fragment>
  #include <encodings_fragment>
}`;
function fkCityBuild(scene,AU){
  const V4=THREE.Vector4, V2=THREE.Vector2, bx=new THREE.BoxGeometry(2,1,2); bx.translate(0,0.5,0);
  const bp=bx.attributes.position.array, bi0=bx.index.array, wp=[], remap=[];   /* weld the 24 box vertices to 8 corners: normals come from derivatives in the shader */
  for(let i=0;i<bp.length/3;i++){ const k=bp[i*3]+","+bp[i*3+1]+","+bp[i*3+2]; let j=wp.findIndex(q=>q.k===k); if(j<0){ j=wp.length; wp.push({k,x:bp[i*3],y:bp[i*3+1],z:bp[i*3+2]}); } remap.push(j); }
  const pos=new Float32Array(24*3), at=new Float32Array(24), idx=new Uint16Array(108);
  for(let t=0;t<3;t++){ wp.forEach((q,i)=>{ pos.set([q.x,q.y,q.z],(t*8+i)*3); at[t*8+i]=t; }); for(let i=0;i<36;i++) idx[t*36+i]=remap[bi0[i]]+t*8; }
  const mkMat=U=>new THREE.ShaderMaterial({uniforms:U,vertexShader:fgTerr+FK_BVERT,fragmentShader:fgAtmo+fgTerr+FK_BFRAG,extensions:{derivatives:true}});
  const defs=[[1,84,2500,4500],[3,64,6000,10000],[9,64,12000,17000]];   /* slot size in cells, maximum slots per side, camera altitudes where the ring fades out */
  const rings=defs.map(([m,N,a0,a1])=>{ const R={m,N0:N,N,a0,a1,iA:new Float32Array(N*N*4),iB:new Float32Array(N*N*4),iC:new Float32Array(N*N*4),ci:0,cj:0,ready:false,fd:[0,0,0,0]};
    const g=new THREE.InstancedBufferGeometry(); g.setAttribute("position",new THREE.BufferAttribute(pos,3)); g.setAttribute("aT",new THREE.BufferAttribute(at,1)); g.setIndex(new THREE.BufferAttribute(idx,1));
    R.ba=[["iA",R.iA],["iB",R.iB],["iC",R.iC]].map(([n,a])=>{ const b=new THREE.InstancedBufferAttribute(a,4); b.setUsage(THREE.DynamicDrawUsage); g.setAttribute(n,b); return b; }); R.g=g; g.instanceCount=N*N;
    R.U=Object.assign({uRg:{value:new V4(0,0,1,2)},uRg2:{value:new V2(1,1)}},AU); R.mesh=new THREE.Mesh(g,mkMat(R.U)); R.mesh.frustumCulled=false; scene.add(R.mesh); return R; });
  const fill=(R,si0,si1,sj0,sj1)=>{ for(let sj=sj0;sj<sj1;sj++) for(let si=si0;si<si1;si++) fkFillSlot(R,si,sj); R.ba.forEach(b=>{ b.needsUpdate=true; }); };
  const ringUpdate=(R,ux,uz)=>{ const size=R.m*FK_C, ci=Math.floor(ux/size), cj=Math.floor(uz/size), H=R.N>>1;
    if(!R.ready||Math.abs(ci-R.ci)>=R.N||Math.abs(cj-R.cj)>=R.N){ fill(R,ci-H,ci+H,cj-H,cj+H); R.ci=ci; R.cj=cj; R.ready=true; return; }
    if(ci!==R.ci){ if(ci>R.ci) fill(R,R.ci+H,ci+H,R.cj-H,R.cj+H); else fill(R,ci-H,R.ci-H,R.cj-H,R.cj+H); R.ci=ci; }
    if(cj!==R.cj){ if(cj>R.cj) fill(R,ci-H,ci+H,R.cj+H,cj+H); else fill(R,ci-H,ci+H,cj-H,R.cj-H); R.cj=cj; } };
  const q=[0,0];
  const CT={ rings, tier:2,
    update(cp){ const C=FK.cur, c=Math.cos(C.rot), s=Math.sin(C.rot), qx=c*cp.x+s*cp.z, qz=-s*cp.x+c*cp.z; fkWarpJS(qx,qz,fkw); let ux=qx-fkw[0], uz=qz-fkw[1]; fkWarpJS(ux,uz,fkw); ux=qx-fkw[0]; uz=qz-fkw[1];
      rings.forEach((R,i)=>{ const fa=1-fkSS(R.a0,R.a1,cp.y), on=fa>0.01&&R.N>0; R.mesh.visible=on; if(!on) return; R.U.uRg2.value.set(fa,1); ringUpdate(R,ux,uz); }); },
    setTier(t){ this.tier=t; const NN=[[48,40,0],[64,52,48],[84,64,64]][t]; let prev=0;
      rings.forEach((R,i)=>{ R.N=NN[i]; R.g.instanceCount=R.N*R.N; R.ready=false; const rad=R.N*R.m*FK_C/2, o1=rad*0.96, o0=rad*0.74; R.fd=[i?prev*0.9:-2,i?prev*1.2:-1,o0,o1]; prev=o0; R.U.uRg.value.set(R.fd[0],R.fd[1],R.fd[2],R.fd[3]); }); },
    reset(){ rings.forEach(R=>{ R.ready=false; }); } };
  CT.setTier(2); return CT;
}
