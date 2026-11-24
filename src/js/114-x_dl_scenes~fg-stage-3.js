/* ---------- fg stage 3: clouds (lit sprite volumes, sorted, you can fly through them), rain streaks, lightning ----------
   Cloud = billboards that stay upright (axial), textured with a baked normal/thickness map and lit in the shader from the sun direction (diffuse wrap, self-shadow, silver lining).
   Sprites wrap around the camera on the CPU (period 30 km) and are depth-sorted by an insertion sort every frame; the number shown depends on the weather. ---------- */
function fgCloudTex(){
  const S=128, d=new Uint8Array(S*S*4*4); let seed=31337; const R=()=>{ seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
  const tile=(tx,ty,kind)=>{ const h=new Float32Array(S*S), a=new Float32Array(S*S);
    const bl=[]; if(kind<2){ for(let b=0;b<30;b++){ const ang=R()*6.283, rr=Math.sqrt(R())*0.5; bl.push([Math.cos(ang)*rr*1.05,Math.sin(ang)*rr*0.5-0.1+Math.abs(Math.sin(ang))*0.1,0.13+R()*0.2]); } }
    const ph=[0,1,2,3,4,5].map(()=>[R()*6.283,R()*6.283]);
    for(let y=0;y<S;y++) for(let x=0;x<S;x++){ const u=x/S*2-1, v=y/S*2-1; let H=0, A=0;
      if(kind<2){ bl.forEach(b=>{ const dd=(u-b[0])*(u-b[0])+(v-b[1])*(v-b[1])*1.1, r2=b[2]*b[2]; if(dd<r2) H+=Math.sqrt(r2-dd); }); A=Math.min(1,H*5)*(0.9+0.1*Math.sin(u*7+ph[0][0])*Math.sin(v*6+ph[0][1])); A*=Math.min(1,Math.max(0,(v+0.62)*9)); }
      else if(kind===2){ const e=Math.max(0,1-(u*u*0.8+v*v*2.6)); let n=0.5; for(let o=0;o<5;o++){ const f=2.2*Math.pow(1.9,o); n+=0.5*Math.pow(0.55,o)*Math.sin(u*f+ph[o][0])*Math.cos(v*f*1.3+ph[o][1]); } H=e*(0.28+0.22*n)*0.7; A=Math.min(1,H*5.5); }
      else { const e=Math.max(0,1-(u*u*0.55+v*v*40)); let n=0.5; for(let o=0;o<4;o++){ const f=3+o*5; n+=0.4*Math.pow(0.6,o)*Math.sin(u*f*1.5+ph[o][0]+v*30*(o+1))*Math.cos(v*f*9+ph[o][1]); } H=e*Math.max(0,0.15+0.15*n)*0.5; A=Math.min(1,H*5)*0.55; }
      A*=Math.min(1,Math.max(0,(0.97-Math.hypot(u,v))*8)); h[y*S+x]=H; a[y*S+x]=A; }
    for(let y=0;y<S;y++) for(let x=0;x<S;x++){ const hx=(h[y*S+Math.min(S-1,x+1)]-h[y*S+Math.max(0,x-1)])*S*0.5, hy=(h[Math.min(S-1,y+1)*S+x]-h[Math.max(0,y-1)*S+x])*S*0.5, k=kind<2?0.9:0.25;
      let nx=-hx*k, ny=-hy*k, nz=1, l=Math.hypot(nx,ny,nz); nx/=l; ny/=l; const o=((ty*S+y)*S*2+tx*S+x)*4; d[o]=Math.round((nx*0.5+0.5)*255); d[o+1]=Math.round((ny*0.5+0.5)*255); d[o+2]=Math.round(Math.min(1,h[y*S+x]*(kind<2?3:2.5))*255); d[o+3]=Math.round(a[y*S+x]*255); } };
  tile(0,0,0); tile(1,0,1); tile(0,1,2); tile(1,1,3);
  const t=new THREE.DataTexture(d,S*2,S*2,THREE.RGBAFormat); t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping; t.magFilter=THREE.LinearFilter; t.minFilter=THREE.LinearMipmapLinearFilter; t.generateMipmaps=true; t.anisotropy=2; t.needsUpdate=true; return t;
}
function fgCloudBuild(scene,AU){
  const PER=30000; let seed=2024; const R=()=>{ seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
  const sx=[],sy=[],sz=[],ss=[],sa=[],sf=[],st=[],sty=[],sl=[],sr=[];   /* x,y,z,size,aspect,flip,tint,type,layer,rank */
  const put=(x,y,z,s,a,ty,l,rk,tint)=>{ sx.push(x); sy.push(y); sz.push(z); ss.push(s); sa.push(a); sf.push(R()<0.5?1:-1); st.push(tint); sty.push(ty); sl.push(l); sr.push(rk); };
  for(let c=0;c<110;c++){ const cx=R()*PER, cz=R()*PER, base=1350+R()*350, w=600+R()*1000, n=9+Math.floor(R()*9), rk=R(), ht=500+R()*800; for(let k=0;k<n;k++){ const ang=R()*6.283, r=w*Math.sqrt(R())*(0.7+R()*0.3), q=1-r/w; put(cx+Math.cos(ang)*r*1.3,base+q*ht+R()*160,cz+Math.sin(ang)*r,300+q*620+R()*260,1,R()<0.5?0:1,0,rk,0.92+R()*0.08); } }
  for(let i=0;i<340;i++){ put(R()*PER,1000+R()*500,R()*PER,2300+R()*1500,0.2+R()*0.12,2,1,R(),0.9+R()*0.1); }
  for(let i=0;i<100;i++){ put(R()*PER,8300+R()*1300,R()*PER,4500+R()*3500,0.16+R()*0.08,3,2,R(),1); }
  for(let c=0;c<16;c++){ const cx=R()*PER, cz=R()*PER, rk=R(), hh=4200+R()*2200; for(let k=0;k<26;k++){ const q=R(), y=1100+q*hh; put(cx+(R()-0.5)*900*(1.2-q*0.6),y,cz+(R()-0.5)*900*(1.2-q*0.6),1100+q*900+R()*500,1,R()<0.5?0:1,3,rk,0.55+q*0.4); }
    for(let k=0;k<7;k++) put(cx+(R()-0.5)*3000,1100+hh+R()*500,cz+(R()-0.5)*3000,2600+R()*1500,0.5,2,3,rk,0.95); }
  const N=sx.length, geo=new THREE.InstancedBufferGeometry(); geo.setAttribute("position",new THREE.Float32BufferAttribute([-0.5,-0.5,0,0.5,-0.5,0,0.5,0.5,0,-0.5,0.5,0],3)); geo.setAttribute("uv",new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,1],2)); geo.setIndex([0,1,2,0,2,3]);
  const bA=new Float32Array(N*4), bB=new Float32Array(N*4), aA=new THREE.InstancedBufferAttribute(bA,4), aB=new THREE.InstancedBufferAttribute(bB,4); aA.setUsage(THREE.DynamicDrawUsage); aB.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute("iA",aA); geo.setAttribute("iB",aB); geo.instanceCount=0;
  Object.assign(AU,{uCloudA:{value:0.85},uDarkCl:{value:0}}); const CU=Object.assign({uTex:{value:fgCloudTex()}},AU);
  const mat=new THREE.ShaderMaterial({uniforms:CU,transparent:true,depthWrite:false,
    vertexShader:fgAtmo+`attribute vec4 iA,iB; varying vec2 vUv; varying vec3 vL,vW; varying float vFS,vTint,vType,vD;
      void main(){ vec3 c=iA.xyz, to=c-camPos; float dist=length(to); vec3 f=to/max(dist,1.0), r=cross(f,vec3(0.0,1.0,0.0)); float rl=length(r); r=rl>0.02?r/rl:vec3(1.0,0.0,0.0); vec3 u=cross(r,f);
        vec3 wp=c+r*position.x*iA.w+u*position.y*iA.w*iB.x; vL=vec3(dot(uLDir,r)*iB.y,dot(uLDir,u),-dot(uLDir,f)); vFS=dot(f,uLDir); vUv=vec2(iB.y>0.0?uv.x:1.0-uv.x,uv.y); vTint=iB.z; vType=iB.w; vW=wp; vD=dist;
        gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.0); }`,
    fragmentShader:fgAtmo+`uniform sampler2D uTex; uniform float uCloudA,uDarkCl; varying vec2 vUv; varying vec3 vL,vW; varying float vFS,vTint,vType,vD;
      void main(){ float ty=floor(vType+0.5); vec4 t=texture2D(uTex,(vec2(ty-2.0*floor(ty*0.5),floor(ty*0.5))+vUv)*0.5); if(t.a<0.003) discard;
        vec3 n=vec3(t.r*2.0-1.0,t.g*2.0-1.0,0.0); n.z=sqrt(max(0.0,1.0-dot(n.xy,n.xy))); float dif=smoothstep(0.05,0.95,dot(n,normalize(vL))*0.5+0.5), th=t.b;
        vec3 col=vec3(vTint)*(uAmb*1.4*(0.78+0.22*vUv.y)+uLCol*dif*(1.0-0.5*th*(1.0-dif))*0.9); col+=uLCol*pow(max(vFS,0.0),9.0)*(1.0-th)*1.1*vTint;
        col*=1.0-uDarkCl*0.6*(1.0-0.5*vUv.y);
        float a=t.a*uCloudA*smoothstep(50.0,380.0,vD)*(1.0-smoothstep(10500.0,14500.0,vD)); gl_FragColor=vec4(fgFog(col,vW),a);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }`});
  const mesh=new THREE.Mesh(geo,mat); mesh.frustumCulled=false; mesh.renderOrder=5; scene.add(mesh);
  let vis=new Int32Array(0), nv=0, ord=new Int32Array(0); const key=new Float32Array(N), wx=new Float32Array(N), wz=new Float32Array(N); let lowOff=0, q=1;
  const API={mesh,count:0,inCloud:0,
    setWx:(w,t)=>{ const d=w.cl||[0,0,0,0], lay=[d[0],d[1],d[2],d[3]], tmp=[]; for(let i=0;i<N;i++) if(sr[i]<lay[sl[i]]*q) tmp.push(i); vis=Int32Array.from(tmp); ord=Int32Array.from(tmp); nv=vis.length; lowOff=(w.low?(w.low[0]-1300)*0.5:0); AU.uDarkCl.value=w.dark||0; AU.uCloudA.value=0.85; },
    setQuality:(k)=>{ q=k; },
    update:(cam,dt,cloudScale)=>{ const cx=cam.position.x, cy=cam.position.y, cz=cam.position.z; let n=0, dens=0;
      for(let j=0;j<nv;j++){ const i=ord[j]; let dx=sx[i]-cx, dz=sz[i]-cz; dx-=PER*Math.floor(dx/PER+0.5); dz-=PER*Math.floor(dz/PER+0.5); const dy=sy[i]+(sl[i]===0?lowOff:0)-cy; wx[i]=cx+dx; wz[i]=cz+dz; key[i]=dx*dx+dz*dz+dy*dy; if(dx*dx+dz*dz>2.25e8) key[i]=-1; }
      for(let j=1;j<nv;j++){ const v=ord[j], k=key[v]; let m=j-1; while(m>=0&&key[ord[m]]<k){ ord[m+1]=ord[m]; m--; } ord[m+1]=v; }
      for(let j=0;j<nv;j++){ const i=ord[j]; if(key[i]<0) continue; const o=n*4, y=sy[i]+(sl[i]===0?lowOff:0), s=ss[i]*(cloudScale||1); bA[o]=wx[i]; bA[o+1]=y; bA[o+2]=wz[i]; bA[o+3]=s; bB[o]=sa[i]; bB[o+1]=sf[i]; bB[o+2]=st[i]; bB[o+3]=sty[i]; n++;
        const r=s*0.5, ry=r*sa[i], ddy=y-cy, hd=wx[i]-cx, hz=wz[i]-cz, nd=(hd*hd+hz*hz)/(r*r)+ddy*ddy/(ry*ry); if(nd<1&&sl[i]!==2){ const f=1-Math.sqrt(nd); dens+=f*f*0.9; } }
      geo.instanceCount=n; aA.needsUpdate=true; aB.needsUpdate=true; API.count=n; const tgt=Math.min(1,dens); API.inCloud+=(tgt-API.inCloud)*Math.min(1,dt*2.5); AU.uCloudK.value=0.0085*API.inCloud*API.inCloud; } };
  return API;
}
/* rain: streak line segments in a box around the camera, slanted by the aircraft's own motion */
function fgRainBuild(scene,AU){
  const NR=1100, S=new Float32Array(NR*2*4); let seed=99; const R=()=>{ seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
  for(let i=0;i<NR;i++){ const a=R(),b=R(),c=R(),ph=R(); for(let e=0;e<2;e++){ S.set([a,b,c,e+ph*0.0],(i*2+e)*4); } }
  const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(new Float32Array(NR*2*3),3)); g.setAttribute("aS",new THREE.BufferAttribute(S,4)); g.setDrawRange(0,0);
  const U=Object.assign({uRel:{value:new THREE.Vector3()},uInt:{value:0}},AU);
  const m=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,vertexShader:`attribute vec4 aS; uniform vec3 camPos,uRel; uniform float uTime,uInt; varying float vA;
    void main(){ vec3 box=vec3(60.0,45.0,60.0), vr=vec3(2.0,-9.5,0.0), p0=aS.xyz*box, rel=mod(p0+vr*uTime-camPos+box*0.5,box)-box*0.5, pw=camPos+rel; vec3 d=(vr-uRel)*0.010; d*=min(1.0,1.6/max(length(d),0.01)); if(aS.w>0.5) pw-=d;
      vec4 mv=viewMatrix*vec4(pw,1.0); vA=uInt*(1.0-smoothstep(25.0,55.0,length(rel)))*(aS.w>0.5?0.1:0.38); gl_Position=projectionMatrix*mv; }`,
    fragmentShader:"varying float vA; uniform vec3 uAmb; void main(){ gl_FragColor=vec4(vec3(0.72,0.8,0.92)*(0.5+uAmb*2.0),vA); }"});
  const lines=new THREE.LineSegments(g,m); lines.frustumCulled=false; lines.renderOrder=7; lines.visible=false; scene.add(lines);
  return {lines,set:(k,vel)=>{ lines.visible=k>0.01; g.setDrawRange(0,Math.floor(NR*0.6*Math.min(1,k))*2); U.uInt.value=Math.min(1,k*1.4); if(vel) U.uRel.value.copy(vel); }};
}
