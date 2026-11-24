/* ---------- (vw) night light sprites that stay believable: a physical halo size per fixture, clamped in screen pixels,
   faded out when the camera is close (no big discs), softer falloff texture. Used by the apron / airfield / neighbour-jet light batches. ---------- */
const VW_GLOW={
  /* D = halo diameter in metres, px = [min,max] css pixels, near = [fade-in start, full] metres from the camera, I = intensity */
  rwy:{D:1.1,px:[2.5,12],near:[6,30],I:0.85},      /* runway / taxiway / approach lamps (fixture head ~0.3 m) */
  fac:{D:1.8,px:[2.5,15],near:[8,32],I:0.7},       /* terminal facade lamps */
  flood:{D:3.0,px:[3,24],near:[25,80],I:0.5},      /* stand floodlight banks on the facade */
  mast:{D:3.5,px:[3,28],near:[30,90],I:0.55},      /* apron high-mast lamp rings (32 m up) */
  beacon:{D:0.7,px:[2,8],near:[3,14],I:0.8},       /* vehicle beacons */
  nav:{D:0.8,px:[2,9],near:[3,14],I:0.9},          /* aircraft position lights */
  tower:{D:2.0,px:[3,14],near:[20,60],I:0.8}       /* obstruction light */
};
let vwGlowT=null;
function vwGlowTex(){
  if(vwGlowT) return vwGlowT;
  const cv=document.createElement("canvas"); cv.width=cv.height=64; const g=cv.getContext("2d"), r=g.createRadialGradient(32,32,0,32,32,32);
  [[0,1],[0.1,0.75],[0.25,0.28],[0.5,0.07],[0.78,0.015],[1,0]].forEach(([t,a])=>r.addColorStop(t,`rgba(255,255,255,${a})`)); g.fillStyle=r; g.fillRect(0,0,64,64);
  vwGlowT=new THREE.CanvasTexture(cv); vwGlowT.encoding=THREE.sRGBEncoding; return vwGlowT;
}
/* turn a PointsMaterial into a clamped, distance-faded halo of the given kind (see VW_GLOW); returns the material */
function vwGlow(mat,kind){
  const q=VW_GLOW[kind]||VW_GLOW.fac;
  mat.size=q.D; mat.map=vwGlowTex(); mat.sizeAttenuation=true; mat.needsUpdate=true;
  const U={vwD:{value:q.D},vwP:{value:new THREE.Vector4(q.px[0],q.px[1],q.near[0],q.near[1])},vwI:{value:q.I}};
  mat.onBeforeCompile=sh=>{
    Object.assign(sh.uniforms,U);
    sh.vertexShader="varying float vVwF; uniform float vwD; uniform vec4 vwP;\n"+sh.vertexShader.replace("if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );",
      "vVwF=1.0; if ( isPerspective ){ float pr=size/vwD, dz=max(-mvPosition.z,0.01); gl_PointSize=clamp(size*scale/dz,vwP.x*pr,vwP.y*pr); vVwF=smoothstep(vwP.z,vwP.w,dz); }");
    sh.fragmentShader="varying float vVwF; uniform float vwI;\n"+sh.fragmentShader.replace("#include <alphatest_fragment>","#include <alphatest_fragment>\n diffuseColor.a*=vVwF*vwI;"); };
  mat.customProgramCacheKey=()=>"vwglow"; return mat;
}
