/* ---------- sun lens flare: one draw call, quads placed along the line sun -> screen centre, additive, drawn last ---------- */
function fgFlareBuild(scene){
  const G=[[1,0.55,0.55,0,1.0,0.80,0.55,0.30],[1,0.14,0.14,0,1.0,0.95,0.85,0.9],[1,0.95,0.03,3,0.55,0.7,1.0,0.35],[0.62,0.07,0.07,2,1.0,0.7,0.35,0.30],[0.3,0.13,0.13,1,0.45,0.75,1.0,0.22],[-0.25,0.05,0.05,2,1.0,0.6,0.3,0.40],[-0.5,0.16,0.16,1,0.5,1.0,0.6,0.14],[-0.85,0.30,0.30,0,1.0,0.5,0.3,0.08]];
  const pos=[], gg=[], cc=[], idx=[]; G.forEach((g,i)=>{ [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(c=>{ pos.push(c[0],c[1],0); gg.push(g[0],g[1],g[2],g[3]); cc.push(g[4]*g[7],g[5]*g[7],g[6]*g[7]); }); idx.push(i*4,i*4+1,i*4+2,i*4,i*4+2,i*4+3); });
  const geo=new THREE.BufferGeometry(); geo.setAttribute("position",new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute("aG",new THREE.Float32BufferAttribute(gg,4)); geo.setAttribute("aC",new THREE.Float32BufferAttribute(cc,3)); geo.setIndex(idx);
  const U={uSunN:{value:new THREE.Vector2()},uInt:{value:0},uAsp:{value:1.6}};
  const mat=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,fog:false,
    vertexShader:"attribute vec4 aG; attribute vec3 aC; uniform vec2 uSunN; uniform float uAsp,uInt; varying vec2 vUv; varying vec3 vC; varying float vT; void main(){ vUv=position.xy; vC=aC*uInt; vT=aG.w; vec2 p=uSunN*aG.x+position.xy*aG.yz*vec2(1.0/uAsp,1.0); gl_Position=vec4(p,0.0,1.0); }",
    fragmentShader:"varying vec2 vUv; varying vec3 vC; varying float vT; void main(){ float r=length(vUv), a; if(vT<0.5) a=exp(-r*r*4.5); else if(vT<1.5) a=0.6*smoothstep(0.55,0.85,r)*smoothstep(1.0,0.85,r); else if(vT<2.5){ float h=max(abs(vUv.x)*0.866+abs(vUv.y)*0.5,abs(vUv.y)); a=smoothstep(1.0,0.75,h)*0.7; } else a=exp(-abs(vUv.y)*16.0)*exp(-abs(vUv.x)*1.8); gl_FragColor=vec4(vC*a*0.6,1.0); }"});
  const mesh=new THREE.Mesh(geo,mat); mesh.frustumCulled=false; mesh.renderOrder=999; scene.add(mesh);
  const v=new THREE.Vector3(), sunS={x:0,y:0,k:0};
  return {mesh,sun:sunS,update:(cam,sunDir,vis,asp)=>{ v.copy(sunDir).multiplyScalar(2000).add(cam.position); cam.updateMatrixWorld(); v.project(cam);
    const edge=1-Math.max(0,Math.min(1,(Math.max(Math.abs(v.x),Math.abs(v.y))-0.9)/0.7)), on=v.z<1&&vis>0.01&&edge>0; mesh.visible=on; sunS.x=v.x; sunS.y=v.y; sunS.k=on?vis*edge:0; if(!on) return;
    U.uSunN.value.set(v.x,v.y); U.uInt.value=vis*edge; U.uAsp.value=asp; }}; }
