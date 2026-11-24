/* ---------- tyres, wheels and brake units, shared by the aircraft builder (p5b2.js) and the ground vehicles (m_ap_gse.js).
   All geometry is built with the axle along +X and centred on the origin; translate it afterwards. lod 0 = full detail, 1 = neighbour aircraft / vehicles. ---------- */
/* merge indexed/non-indexed geometries keeping position, normal and uv (mergeG in p5b2.js drops uv and recomputes normals) */
function apMergeG(list){
  let nv=0, ni=0; list.forEach(g=>{ nv+=g.attributes.position.count; ni+=g.index?g.index.count:g.attributes.position.count; });
  const P=new Float32Array(nv*3), N=new Float32Array(nv*3), U=new Float32Array(nv*2), I=nv<65535?new Uint16Array(ni):new Uint32Array(ni); let vo=0, io=0;
  list.forEach(g=>{ const c=g.attributes.position.count; P.set(g.attributes.position.array,vo*3); if(!g.attributes.normal) g.computeVertexNormals(); N.set(g.attributes.normal.array,vo*3); if(g.attributes.uv) U.set(g.attributes.uv.array,vo*2);
    if(g.index){ const a=g.index.array; for(let i=0;i<a.length;i++) I[io+i]=a[i]+vo; io+=a.length; } else { for(let i=0;i<c;i++) I[io+i]=vo+i; io+=c; } vo+=c; });
  const m=new THREE.BufferGeometry(); m.setAttribute("position",new THREE.BufferAttribute(P,3)); m.setAttribute("normal",new THREE.BufferAttribute(N,3)); m.setAttribute("uv",new THREE.BufferAttribute(U,2)); m.setIndex(new THREE.BufferAttribute(I,1)); return m;
}
/* lathe from [radius, axial] pairs; v is the arc length along the profile (so textures do not stretch), axis turned to +X */
function apLathe(pts,seg,arcUV){
  const g=new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),seg);
  if(arcUV){ const n=pts.length, cum=[0]; for(let j=1;j<n;j++) cum.push(cum[j-1]+Math.hypot(pts[j][0]-pts[j-1][0],pts[j][1]-pts[j-1][1])); const tot=cum[n-1]||1, uv=g.attributes.uv.array;
    for(let i=0;i<=seg;i++) for(let j=0;j<n;j++) uv[(i*n+j)*2+1]=cum[j]/tot; }
  return g.rotateZ(-Math.PI/2);
}
/* tyre: rounded shoulders and sidewall, circumferential tread grooves. R outer radius, W width, rf = rim radius / R */
function apTyreGeo(R,W,rf,o){
  o=o||{}; const hw=W/2, Rr=R*rf, H=R-Rr, gn=o.grooves!==undefined?o.grooves:2, gd=Math.min(0.06*H,0.025), tw=0.6*hw, pts=[];
  const side=[[Rr*1.02,0.66],[Rr+0.16*H,0.9],[Rr+0.42*H,1],[Rr+0.72*H,0.96],[R-0.13*H,0.84],[R-0.04*H,0.72]];
  side.forEach(([r,y])=>pts.push([r,-y*hw])); pts.push([R,-tw]);
  for(let k=0;k<gn;k++){ const yc=-tw+2*tw*(k+1)/(gn+1), gw=0.05*hw; pts.push([R,yc-gw*1.3],[R-gd,yc-gw*0.6],[R-gd,yc+gw*0.6],[R,yc+gw*1.3]); }
  pts.push([R,tw]); for(let i=side.length-1;i>=0;i--) pts.push([side[i][0],side[i][1]*hw]);
  return apLathe(pts,o.seg||20,true);
}
/* wheel rim: flanges, dished outboard face (+X when out=1) with hub boss and axle cap, open inboard side showing the barrel; bolt circle on the boss (lod 0) */
function apRimGeo(R,W,rf,out,o){
  o=o||{}; const hw=W/2, Rr=R*rf, lod=o.lod||0;
  const full=[[1.0,0.66],[1.09,0.70],[1.09,0.76],[1.0,0.77],[0.93,0.70],[0.8,0.6],[0.52,0.55],[0.42,0.62],[0.34,0.66],[0.22,0.70],[0.18,0.74],[0,0.76],[0,0.38],[0.45,0.40],[0.93,0.44],[0.93,-0.55],[0.97,-0.70],[1.09,-0.76],[1.09,-0.70],[1.0,-0.66]];
  const lite=[[1.09,0.76],[0.93,0.70],[0.52,0.55],[0.22,0.70],[0,0.76],[0,0.38],[0.93,0.44],[0.93,-0.55],[1.09,-0.76],[1.09,-0.70]];
  let pr=(lod?lite:full).map(([r,d])=>[r*Rr,d*hw]); if(out<0) pr=pr.map(([r,y])=>[r,-y]).reverse();
  const gs=[apLathe(pr,lod?14:18,false)];
  if(!lod){ const nb=o.bolts||6, rb=Rr*0.04; for(let k=0;k<nb;k++){ const a=k/nb*Math.PI*2; gs.push(new THREE.CylinderGeometry(rb,rb,hw*0.12,5).rotateZ(Math.PI/2).translate(out*0.62*hw,0.47*Rr*Math.cos(a),0.47*Rr*Math.sin(a))); } }
  return gs.length===1?gs[0]:apMergeG(gs);
}
/* brake unit seen through the open inboard side of a main wheel: heat-sink drum, pressure plate, piston housings, axle sleeve (all on the inboard side = -out) */
function apBrakeGeo(R,W,rf,out,o){
  o=o||{}; const hw=W/2, Rr=R*rf, lod=o.lod||0, sg=-out, gs=[], sgm=lod?10:16;
  const cyl=(r,len,yc)=>new THREE.CylinderGeometry(r,r,len,sgm).rotateZ(Math.PI/2).translate(yc,0,0);   /* axis along X, centre at x=yc (signed below) */
  gs.push(cyl(Rr*0.74,hw*0.95,sg*hw*0.2)); gs.push(cyl(Rr*0.9,hw*0.2,sg*hw*0.68)); gs.push(cyl(Rr*0.2,hw*3.0,sg*hw*1.1));
  const np=lod?4:6; for(let k=0;k<np;k++){ const a=k/np*Math.PI*2+0.4; gs.push(new THREE.BoxGeometry(hw*0.5,Rr*0.2,Rr*0.2).translate(sg*hw*1.0,Rr*0.82,0).rotateX(a)); }
  return apMergeG(gs);
}
/* one wheel (tyre + rim [+ brake]) at x,y,z with its outboard face towards +X (out=1) or -X (out=-1); returns {tyre,rim,brake} */
function apWheel(x,y,z,R,W,rf,out,o){
  o=o||{}; const lod=o.lod||0, t=apTyreGeo(R,W,rf,{seg:lod?14:20,grooves:lod?0:2}).translate(x,y,z), r=apRimGeo(R,W,rf,out,{lod,bolts:o.bolts}).translate(x,y,z), b=o.brake?apBrakeGeo(R,W,rf,out,{lod}).translate(x,y,z):null;
  return {tyre:t,rim:r,brake:b};
}
/* small canvas textures for the tyre rubber (colour + roughness variation, lighter worn tread, darker bead) and the 737 spinner spiral; cached */
let AP_TT=null;
function apTyreTex(){
  if(AP_TT) return AP_TT; const mk=(col)=>{ const cv=document.createElement("canvas"); cv.width=64; cv.height=128; const g=cv.getContext("2d");
    g.fillStyle=col?"#9aa0a6":"#c8c8c8"; g.fillRect(0,0,64,128);
    for(let i=0;i<900;i++){ const v=(col?95:150)+Math.random()*(col?85:80)|0; g.fillStyle=`rgb(${v},${v},${v})`; g.fillRect(Math.random()*64,Math.random()*128,1+Math.random()*2,1+Math.random()*3); }
    g.fillStyle=col?"rgba(190,190,190,0.28)":"rgba(255,255,255,0.18)"; g.fillRect(0,46,64,36);                                  /* worn tread band */
    g.fillStyle="rgba(0,0,0,0.35)"; g.fillRect(0,0,64,10); g.fillRect(0,118,64,10);                                              /* bead */
    g.fillStyle=col?"rgba(210,210,214,0.5)":"rgba(255,255,255,0.4)"; g.fillRect(8,24,34,2); g.fillRect(8,100,34,2);               /* sidewall marking lines */
    const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; if(col) t.encoding=THREE.sRGBEncoding; t.anisotropy=4; return t; };
  return AP_TT={map:mk(true),rough:mk(false)};
}
let AP_ST=null;
function apSpinTex(){
  if(AP_ST) return AP_ST; const cv=document.createElement("canvas"); cv.width=128; cv.height=128; const g=cv.getContext("2d");
  g.fillStyle="#262c32"; g.fillRect(0,0,128,128); g.strokeStyle="#f4f4f0"; g.lineWidth=18; g.lineCap="butt";
  [-128,0,128].forEach(o=>{ g.beginPath(); g.moveTo(o,0); g.lineTo(o+128,128); g.stroke(); g.beginPath(); g.moveTo(o+64,0); g.lineTo(o+192,128); g.stroke(); });
  const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.encoding=THREE.sRGBEncoding; return AP_ST=t;
}
