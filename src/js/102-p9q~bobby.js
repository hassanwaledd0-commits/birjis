/* ---------- Bobby (ميسلون): the 3D mascot, procedural three.js r128, no assets ----------
   One shared WebGLRenderer draws every Bobby on the page into an offscreen canvas and each widget copies its own square into a plain 2D canvas,
   so any number of Bobbies cost a single WebGL context (phones allow very few). Toon shading (4-step gradient), inverted-hull ink outline, rim light.
   Y up, Bobby faces +z (the camera). The character's right hand (holding the wrench) is on -x, the free (waving) hand on +x. */
const BOB3={geo:{},mat:null,R:null,cam:null,gw:0,gh:0,uW:{value:.03},uRim:null,tex:{},n:0,lost:false,var:0};
const BOB_HX=.68,BOB_HY=.6,BOB_HZ=.64;   /* head ellipsoid radii */
const bobSm=(c,t,k,dt)=>c+(t-c)*(1-Math.exp(-k*dt));
const bobCl=(v,a,b)=>v<a?a:v>b?b:v;
/* expression targets: eye openness, smile, open-mouth base, brow height/angle (left,right), cheek, mouth width, head roll, forward lean, lamp, gaze, happy arc eyes */
const BOB_EMO={
  idle :{eye:1,sm:.6,mo:0,by:[0,0],ba:[.05,.05],ch:.45,mw:1,roll:0,lean:0,lamp:.3,gz:[0,0],hap:0},
  happy:{eye:1,sm:1,mo:.34,by:[.045,.045],ba:[.16,.16],ch:1,mw:1.1,roll:.05,lean:0,lamp:.6,gz:[0,0],hap:1},
  think:{eye:.9,sm:.15,mo:0,by:[.075,-.015],ba:[.25,-.18],ch:.2,mw:.6,roll:.16,lean:0,lamp:.2,gz:[-.8,.7],hap:0},
  alert:{eye:1.18,sm:-.3,mo:.14,by:[.085,.085],ba:[-.16,-.16],ch:0,mw:.8,roll:0,lean:.1,lamp:1,gz:[0,.05],hap:0}
};
/* arm poses: shoulder forward swing, outward swing, elbow bend, thumb */
const BOB_POSE={rest:[.04,.3,.3,0],hold:[.35,.55,.9,0],wave:[0,2.45,.15,0],thumbs:[.95,.5,1.45,1],stop:[.3,2.2,.55,0],chin:[1.25,-.15,1.7,0],hip:[.1,.7,1.3,0],point:[1.5,.25,.1,0]};

/* ----- geometry helpers ----- */
function bobCaps(r,len,seg){ const a=[],h=len/2,n=8; for(let i=0;i<=n;i++){ const t=-Math.PI/2+i*Math.PI/2/n; a.push(new THREE.Vector2(Math.max(.0001,r*Math.cos(t)),-h+r*Math.sin(t))); }
  for(let i=0;i<=n;i++){ const t=i*Math.PI/2/n; a.push(new THREE.Vector2(Math.max(.0001,r*Math.cos(t)),h+r*Math.sin(t))); } return new THREE.LatheGeometry(a,seg||14); }
/* torso profile (y,r): the silhouette shared by shirt, vest and reflective bands */
const BOB_TR=[[.36,.27],[.46,.37],[.62,.45],[.8,.46],[.96,.41],[1.08,.32],[1.17,.21],[1.22,.14]];
const bobTrR=y=>{ for(let i=1;i<BOB_TR.length;i++){ const a=BOB_TR[i-1],b=BOB_TR[i]; if(y<=b[0]){ const f=bobCl((y-a[0])/(b[0]-a[0]),0,1); return a[1]+(b[1]-a[1])*f; } } return BOB_TR[BOB_TR.length-1][1]; };
function bobTorsoGeo(y0,y1,k,add,seg){ const a=[]; for(let i=0;i<=16;i++){ const y=y0+(y1-y0)*i/16; a.push(new THREE.Vector2(bobTrR(y)*k+add,y)); } return new THREE.LatheGeometry(a,seg||32); }
const bobZs=(x,y)=>BOB_HZ*Math.sqrt(Math.max(1e-4,1-(x/BOB_HX)*(x/BOB_HX)-(y/BOB_HY)*(y/BOB_HY)));   /* head surface depth at (x,y) */
const bobFp=(th,ph)=>{ const c=Math.cos(ph); return new THREE.Vector3(BOB_HX*c*Math.sin(th),BOB_HY*Math.sin(ph),BOB_HZ*c*Math.cos(th)); };
const bobFn=p=>new THREE.Vector3(p.x/(BOB_HX*BOB_HX),p.y/(BOB_HY*BOB_HY),p.z/(BOB_HZ*BOB_HZ)).normalize();
function bobDisc(cx,cy,rx,ry,eps){ const g=new THREE.CircleGeometry(1,20), p=g.attributes.position; for(let i=0;i<p.count;i++){ const X=cx+p.getX(i)*rx,Y=cy+p.getY(i)*ry; p.setXYZ(i,X,Y,bobZs(X,Y)+eps); } return g; }
function bobTexRadial(c0,c1,sz){ const k=document.createElement("canvas"); k.width=k.height=sz||64; const g=k.getContext("2d"), r=k.width/2, gr=g.createRadialGradient(r,r,0,r,r,r);
  gr.addColorStop(0,c0); gr.addColorStop(1,c1); g.fillStyle=gr; g.fillRect(0,0,k.width,k.height); const t=new THREE.CanvasTexture(k); t.minFilter=THREE.LinearFilter; t.generateMipmaps=false; return t; }
function bobG(k,f){ return BOB3.geo[k]||(BOB3.geo[k]=f()); }

/* ----- shared materials (toon + ink outline) ----- */
function bobMats(){
  if(BOB3.mat) return BOB3.mat; const T=THREE, M={};
  const gd=new Uint8Array(64); for(let i=0;i<64;i++){ const d=i/63*2-1, sm=(a,b,x)=>{ const t=bobCl((x-a)/(b-a),0,1); return t*t*(3-2*t); }; gd[i]=Math.round(255*(.34+.3*sm(-.3,-.02,d)+.36*sm(.18,.5,d))); }
  const g=new T.DataTexture(gd,64,1,T.LuminanceFormat); g.minFilter=g.magFilter=T.LinearFilter; g.generateMipmaps=false; g.needsUpdate=true;
  BOB3.uRim={value:new T.Color(0x9fc4ff)};
  const rim=sh=>{ sh.uniforms.uRim=BOB3.uRim; sh.fragmentShader=sh.fragmentShader.replace("void main() {","uniform vec3 uRim;\nvoid main() {")
    .replace("gl_FragColor = vec4( outgoingLight, diffuseColor.a );","float rimF=pow(1.0-clamp(dot(normalize(normal),normalize(vViewPosition)),0.0,1.0),2.8); outgoingLight+=uRim*rimF*0.4; gl_FragColor = vec4( outgoingLight, diffuseColor.a );"); };
  const toon=(c,o)=>{ const m=new T.MeshToonMaterial(Object.assign({color:c,gradientMap:g},o||{})); m.onBeforeCompile=rim; return m; };
  const flat=(c,o)=>new T.MeshBasicMaterial(Object.assign({color:c},o||{}));
  Object.assign(M,{
    vc:toon(0xffffff,{vertexColors:true}),skin:toon(0xcc9567),skinD:toon(0xb98355),
    steel:toon(0xb9c8d8),dark:toon(0x4d576a),eye:toon(0x21120f),brow:toon(0x1d120d),
    refl:flat(0xeef6fb),white:flat(0xffffff),
    mouthIn:flat(0x5c1626,{polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),
    tongue:flat(0xea7380,{polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),
    teeth:flat(0xfffaf0,{polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),
    ol:new T.MeshBasicMaterial({color:0x2b1727,side:T.BackSide})
  });
  M.ol.onBeforeCompile=sh=>{ sh.uniforms.uW=BOB3.uW; sh.vertexShader=sh.vertexShader.replace("void main() {","uniform float uW;\nvoid main() {")
    .replace("#include <project_vertex>","vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 ); mvPosition.xyz += normalize( normalMatrix * normal ) * uW; gl_Position = projectionMatrix * mvPosition;"); };
  BOB3.tex.iris=bobTexRadial("rgba(158,92,42,1)","rgba(158,92,42,0)"); BOB3.tex.cheek=bobTexRadial("rgba(255,100,125,.8)","rgba(255,100,125,0)"); BOB3.tex.shadow=bobTexRadial("rgba(20,24,70,.45)","rgba(20,24,70,0)");
  M.cheek=flat(0xffffff,{map:BOB3.tex.cheek,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
  M.shadow=flat(0xffffff,{map:BOB3.tex.shadow,transparent:true,depthWrite:false});
  M.iris=flat(0xffffff,{map:BOB3.tex.iris,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  return BOB3.mat=M;
}

/* ----- static parts are merged into vertex-coloured geometries (one draw call per piece + one for its ink hull), cached and shared by every instance ----- */
function bobPart(L,geo,col,x,y,z,sx,sy,sz,ol,rot){ L.push({g:geo,col,x,y,z,sx:sx===undefined?1:sx,sy:sy===undefined?(sx===undefined?1:sx):sy,sz:sz===undefined?(sx===undefined?1:sx):sz,ol:!!ol,rot}); }
function bobBake(key,fn){
  if(BOB3.geo[key]) return BOB3.geo[key]; const T=THREE, L=[]; fn(L);
  const P=[],N=[],C=[],I=[],PO=[],NO=[],IO=[], m=new T.Matrix4(), nm=new T.Matrix3(), q=new T.Quaternion(), e=new T.Euler(), v=new T.Vector3(), sc=new T.Vector3(), ps=new T.Vector3(), c=new T.Color(), n=new T.Vector3();
  L.forEach(it=>{ const pa=it.g.attributes.position, na=it.g.attributes.normal, ia=it.g.index; e.set(it.rot?it.rot[0]:0,it.rot?it.rot[1]:0,it.rot?it.rot[2]:0); q.setFromEuler(e); m.compose(ps.set(it.x,it.y,it.z),q,sc.set(it.sx,it.sy,it.sz)); nm.getNormalMatrix(m); c.setHex(it.col);
    const base=P.length/3, bo=PO.length/3;
    for(let i=0;i<pa.count;i++){ v.fromBufferAttribute(pa,i).applyMatrix4(m); n.fromBufferAttribute(na,i).applyMatrix3(nm).normalize(); P.push(v.x,v.y,v.z); N.push(n.x,n.y,n.z); C.push(c.r,c.g,c.b); if(it.ol){ PO.push(v.x,v.y,v.z); NO.push(n.x,n.y,n.z); } }
    const cnt=ia?ia.count:pa.count; for(let j=0;j<cnt;j++){ const k=ia?ia.getX(j):j; I.push(base+k); if(it.ol) IO.push(bo+k); } });
  const mkg=(p,nn,ii,cc)=>{ const g=new T.BufferGeometry(); g.setAttribute("position",new T.Float32BufferAttribute(p,3)); g.setAttribute("normal",new T.Float32BufferAttribute(nn,3)); if(cc) g.setAttribute("color",new T.Float32BufferAttribute(cc,3)); g.setIndex(ii); g.computeBoundingSphere(); return g; };
  return BOB3.geo[key]={g:mkg(P,N,I,C),h:IO.length?mkg(PO,NO,IO):null};
}
/* ----- the rig (one per instance; baked geometry and materials are shared) ----- */
/* ----- the look: an Arab aircraft engineer in his early 30s. Three hair/face variants (BOB_VAR); BOB3.var picks the one used by new instances ----- */
const BOB_NAVY=0x1f3158, BOB_ORG=0xff7a1c, BOB_SKIN=0xcc9567, BOB_GLV=0xd5dce6, BOB_HAIR=0x241812;
/* hairline latitude against |theta| (0 = straight ahead, pi = back of the head) */
const BOB_LINE=[[0,.55],[.5,.52],[.9,.36],[1.3,.1],[1.75,-.2],[2.4,-.55],[3.15,-.78]];
const BOB_VAR=[
  {id:"wave", line:BOB_LINE, vol:.17, wv:.04, fr:0, curls:0, hair:BOB_HAIR, hair2:0x3a291e, beard:{top:[[0,-.5],[.45,-.52],[.8,-.4],[1.1,-.2],[1.5,.08]],off:.028,col:0x2a1c14,chin:.03}, mu:.036},
  {id:"quiff", line:[[0,.46],[.5,.46],[.9,.34],[1.3,.1],[1.75,-.2],[2.4,-.5],[3.15,-.7]], vol:.08, wv:.012, fr:1, curls:0, hair:0x1d130e, hair2:0x3a291e, beard:{top:[[0,-.62],[.6,-.58],[1,-.42],[1.3,-.14],[1.5,.06]],off:.014,col:0x70503a,chin:.025}, mu:.05},
  {id:"curl", line:[[0,.60],[.5,.56],[.9,.4],[1.3,.14],[1.75,-.16],[2.4,-.5],[3.15,-.72]], vol:.07, wv:0, fr:0, curls:34, hair:0x2a1b14, hair2:0x44301f, beard:{top:[[0,-.44],[.45,-.46],[.8,-.3],[1.1,-.08],[1.5,.1]],off:.04,col:0x2d1f17,chin:.05}, mu:.034}
];
const bobSs=(a,b,x)=>{ const t=bobCl((x-a)/(b-a),0,1); return t*t*(3-2*t); };
const bobTab=(tab,x)=>{ for(let i=1;i<tab.length;i++){ if(x<=tab[i][0]){ const a=tab[i-1],b=tab[i],f=(x-a[0])/(b[0]-a[0]); return a[1]+(b[1]-a[1])*f*f*(3-2*f); } } return tab[tab.length-1][1]; };
/* a shell hugging the head ellipsoid: theta in [t0,t1], latitude from line(th) to top(th), pushed out by off(th,ph,u) along the surface normal */
function bobShellGeo(o){
  const T=THREE, nt=o.nt, np=o.np, P=[], I=[], tmp=new T.Vector3();
  for(let i=0;i<=nt;i++){ const th=o.t0+(o.t1-o.t0)*i/nt, p0=o.line(th), p1=o.top(th);
    for(let j=0;j<=np;j++){ const u=j/np, ph=p0+(p1-p0)*u, p=bobFp(th,ph), n=bobFn(p); tmp.copy(p).addScaledVector(n,o.off(th,ph,u)); if(o.fwd) o.fwd(th,ph,u,tmp); P.push(tmp.x,tmp.y,tmp.z); } }
  for(let i=0;i<nt;i++) for(let j=0;j<np;j++){ const a=i*(np+1)+j, b=a+np+1; I.push(a,b,a+1,b,b+1,a+1); }
  const g=new T.BufferGeometry(); g.setAttribute("position",new T.Float32BufferAttribute(P,3)); g.setIndex(I); g.computeVertexNormals();
  if(o.closed){ const N=g.attributes.normal, w=np+1; for(let j=0;j<w;j++){ const a=j, b=nt*w+j; tmp.set(N.getX(a)+N.getX(b),N.getY(a)+N.getY(b),N.getZ(a)+N.getZ(b)).normalize(); N.setXYZ(a,tmp.x,tmp.y,tmp.z); N.setXYZ(b,tmp.x,tmp.y,tmp.z); } }
  return g;
}
/* a disc lying on the head surface with the surface's own normals (so it shades like the skin around it) */
function bobDiscN(cx,cy,rx,ry,eps){ const g=bobDisc(cx,cy,rx,ry,eps), p=g.attributes.position, n=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){ const v=bobFn(new THREE.Vector3(p.getX(i),p.getY(i),p.getZ(i))); n[i*3]=v.x; n[i*3+1]=v.y; n[i*3+2]=v.z; } g.setAttribute("normal",new THREE.BufferAttribute(n,3)); return g; }
/* orientation (XYZ Euler) that turns +z to the surface normal n */
function bobEulN(n){ const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),n), e=new THREE.Euler().setFromQuaternion(q); return [e.x,e.y,e.z]; }
/* rotate about y by a after tilting about x by t (XYZ Euler) */
function bobEulYX(a,t){ const e=new THREE.Euler(t,a,0,"YXZ"), q=new THREE.Quaternion().setFromEuler(e), r=new THREE.Euler().setFromQuaternion(q); return [r.x,r.y,r.z]; }
/* a thin cylinder from a to b (Vector3) */
function bobSeg(L,a,b,r,col,ol){ const d=b.clone().sub(a), len=d.length(), c=a.clone().add(b).multiplyScalar(.5), q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()), e=new THREE.Euler().setFromQuaternion(q);
  bobPart(L,bobG("seg8",()=>new THREE.CylinderGeometry(1,1,1,6)),col,c.x,c.y,c.z,r,len,r,ol,[e.x,e.y,e.z]); }
/* the baked hair, beard, moustache of one variant (head space) */
function bobFaceHair(L,K){
  const T=THREE, SPHL=bobG("sphl",()=>new T.SphereGeometry(1,8,6));
  const line=th=>bobTab(K.line,Math.abs(th)), full=K.beard;
  /* the hair cap: a closed shell from the hairline up, with volume on top and soft waves */
  const cap=bobShellGeo({nt:56,np:14,t0:-Math.PI,t1:Math.PI,closed:true,line,top:()=>Math.PI/2,
    off:(th,ph,u)=>{ const side=bobSs(.9,1.6,Math.abs(th)); let o=.045+K.vol*bobSs(.25,1.45,ph)*(1-.5*side)+K.wv*Math.sin(th*7+ph*9)*bobSs(.1,.8,ph); if(K.fr) o+=.12*K.fr*bobSs(.3,1.3,ph)*Math.pow(Math.max(0,Math.cos(th)),2); return o; },
    fwd:K.fr?(th,ph,u,v)=>{ const k=bobSs(.5,1.3,ph)*Math.max(0,Math.cos(th)); v.z+=.12*k; v.y+=.04*k; v.x-=.05*k*Math.sin(th); }:null});
  bobPart(L,cap,K.hair,0,0,0,1,1,1,1);
  /* fringe locks along the front hairline (wavy) or a swept crest (quiff) or small curls (curly) */
  if(!K.curls&&!K.fr){ for(let k=-4;k<=4;k++){ const th=k*.16, ph=line(th)+.07, p=bobFp(th,ph), n=bobFn(p), q=p.clone().addScaledVector(n,.07);
      bobPart(L,SPHL,k%2?K.hair2:K.hair,q.x,q.y+Math.abs(k)*.004,q.z,.105,.075,.1,1,bobEulN(n)); }
    [[-.75,.95,.35],[.1,1.18,.1],[.7,1.0,.3]].forEach(([th,ph,sz],i)=>{ const p=bobFp(th,ph), n=bobFn(p), q=p.clone().addScaledVector(n,.1); bobPart(L,SPHL,K.hair2,q.x,q.y,q.z,.14*sz*2,.05,.2*sz*2,0,bobEulN(n)); }); }
  if(K.fr){ const p=bobFp(.0,.86), n=bobFn(p), q=p.clone().addScaledVector(n,.1); q.z+=.1; bobPart(L,SPHL,K.hair,q.x+.04,q.y,q.z,.3,.1,.36,1,[-.38,0,.16]);
    const p2=bobFp(.5,.84), n2=bobFn(p2), q2=p2.clone().addScaledVector(n2,.08); bobPart(L,SPHL,K.hair2,q2.x,q2.y,q2.z+.06,.2,.07,.24,0,[-.3,.25,.2]); }
  if(K.curls){ const S5=bobG("sphc",()=>new T.SphereGeometry(1,9,6)); for(let i=0;i<K.curls;i++){ const s=(i+.5)/K.curls, ph=Math.PI/2-Math.acos(1-s*1.25)*0.62-0.0, th=i*2.399963;
      const ph2=Math.PI/2-s*(Math.PI/2-(-.5)), phh=Math.max(ph2,-.5); const t2=((th+Math.PI)%(2*Math.PI))-Math.PI; if(phh<line(t2)+.04) continue;
      const p=bobFp(t2,phh), n=bobFn(p), r=.095+.03*((i*7)%5)/4, q=p.clone().addScaledVector(n,.06); bobPart(L,S5,i%3?K.hair:K.hair2,q.x,q.y,q.z,r,r*.9,r,1,bobEulN(n)); } }
  /* beard: from the cheeks round the chin; the mouth sits on a skin patch with a moustache above it */
  const top=th=>bobTab(full.top,Math.abs(th));
  const beard=bobShellGeo({nt:44,np:12,t0:-1.5,t1:1.5,line:()=>-1.3,top,
    off:(th,ph,u)=>full.off+full.chin*bobSs(-.8,-1.3,ph)*(1-bobSs(.2,1.1,Math.abs(th)))+.012*Math.sin(th*9+ph*7)});
  bobPart(L,beard,full.col,0,0,0,1,1,1,full.off>.02?1:0);
  const eps=full.off+.008;
  bobPart(L,bobDiscN(0,-.262,.205,.112,eps),BOB_SKIN,0,0,0,1,1,1,0);
  const pts=[[-.27,-.29],[-.19,-.238],[-.08,-.218],[0,-.224],[.08,-.218],[.19,-.238],[.27,-.29]].map(([x,y])=>new T.Vector3(x,y,bobZs(x,y)+eps+K.mu*.55));
  bobPart(L,new T.TubeGeometry(new T.CatmullRomCurve3(pts),22,K.mu,6,false),full.col===0x70503a?0x2a1c14:full.col,0,0,0,1,1,1,1);
  [pts[0],pts[6]].forEach(p=>bobPart(L,bobG("sphl",()=>new T.SphereGeometry(1,8,6)),full.col===0x70503a?0x2a1c14:full.col,p.x,p.y,p.z,K.mu,K.mu,K.mu,1));
}

function bobBuild(V){
  const T=THREE, M=bobMats(), R={}, HIP=.42, K=BOB_VAR[V||0], SPH=bobG("sph",()=>new T.SphereGeometry(1,28,20)), SPHH=bobG("sphh",()=>new T.SphereGeometry(1,44,30)), CIR=bobG("cir",()=>new T.CircleGeometry(1,18));
  const mesh=(par,bk,x,y,z,mat)=>{ const m=new T.Mesh(bk.g,mat||M.vc); m.position.set(x||0,y||0,z||0); par.add(m); if(bk.h) m.add(new T.Mesh(bk.h,M.ol)); return m; };
  const mk=(par,geo,mat,x,y,z,sx,sy,sz)=>{ const m=new T.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx===undefined?1:sx,sy===undefined?(sx===undefined?1:sx):sy,sz===undefined?(sx===undefined?1:sx):sz); par.add(m); return m; };
  const grp=(par,x,y,z)=>{ const g=new T.Group(); g.position.set(x||0,y||0,z||0); par.add(g); return g; };
  const root=R.root=new T.Group(), body=R.body=grp(root,0,0,0), ty=y=>y-HIP, Z=new T.Vector3(0,0,1);
  R.shadow=mk(root,bobG("pl",()=>new T.PlaneGeometry(1,1)),M.shadow,0,.01,.04,1.9,1.9,1.9); R.shadow.rotation.x=-Math.PI/2;
  /* legs and boots */
  mesh(body,bobBake("legs",L=>{ [-1,1].forEach(s=>{ bobPart(L,bobG("leg",()=>bobCaps(.115,.16,12)),BOB_NAVY,s*.2,.29,0,1,1,1,1); bobPart(L,SPH,0x2f2b2e,s*.2,.105,.07,.185,.12,.27,1); bobPart(L,SPH,0xe9e2d2,s*.2,.04,.07,.178,.04,.262,0); }); }));
  /* torso group (pivot at the hips): navy coverall, two orange hi-vis bands with reflective stripes, belt with pouches, hard hat on the belt, ID badge on a lanyard (no text) */
  const tor=R.tor=grp(body,0,HIP,0);
  mesh(tor,bobBake("torso",L=>{ bobPart(L,bobTorsoGeo(.36,1.22,1,0,32),BOB_NAVY,0,ty(0),0,1,1,1,1);
    [[.55,.67],[.71,.83]].forEach(([a,b])=>bobPart(L,bobTorsoGeo(a,b,1,.016,32),BOB_ORG,0,ty(0),0,1,1,1,0));
    bobPart(L,bobTorsoGeo(.43,.5,1,.026,32),0x70452a,0,ty(0),0,1,1,1,0); bobPart(L,new T.BoxGeometry(.1,.07,.03),0xe9d9a8,0,ty(.465),bobTrR(.465)+.05,1,1,1,0);
    [-1,1].forEach(s=>{ const a=s*.78, R0=bobTrR(.46)+.03; bobPart(L,new T.BoxGeometry(.13,.12,.08),0x70452a,R0*Math.sin(a),ty(.45),R0*Math.cos(a),1,1,1,1,[0,a,0]); });
    { const a=.46, y=.93, R0=bobTrR(y)+.03, c=new T.Vector3(R0*Math.sin(a),ty(y),R0*Math.cos(a)), q=new T.Quaternion().setFromEuler(new T.Euler(-.3,a,0,"YXZ")), e=new T.Euler().setFromQuaternion(q), eu=[e.x,e.y,e.z], L3=(x,yy,z)=>new T.Vector3(x,yy,z).applyQuaternion(q).add(c);
      const bx=(w,h,d)=>bobG("bx"+w+"_"+h+"_"+d,()=>new T.BoxGeometry(w,h,d));
      bobPart(L,bx(.14,.18,.025),0xf2ecdc,c.x,c.y,c.z,1,1,1,1,eu);
      let t=L3(0,.07,.004); bobPart(L,bx(.14,.04,.03),BOB_ORG,t.x,t.y,t.z,1,1,1,0,eu);
      t=L3(0,.005,.018); const e2=new T.Euler().setFromQuaternion(q.clone().multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),Math.PI/2)));
      bobPart(L,bobG("cyl10",()=>new T.CylinderGeometry(.036,.036,.012,10)),0x4a6fa5,t.x,t.y,t.z,1,1,1,0,[e2.x,e2.y,e2.z]);
      t=L3(0,-.058,.016); bobPart(L,bx(.09,.014,.01),0x9aa3b0,t.x,t.y,t.z,1,1,1,0,eu); t=L3(0,-.078,.016); bobPart(L,bx(.06,.014,.01),0x9aa3b0,t.x,t.y,t.z,1,1,1,0,eu);
      const top=L3(0,.09,0); [-1,1].forEach(s=>bobSeg(L,new T.Vector3(s*.1,ty(1.2),.15),top,.012,BOB_ORG,0)); }
    }));
  mesh(tor,bobBake("bands",L=>{ [[.59,.63],[.75,.79]].forEach(([a,b])=>bobPart(L,bobTorsoGeo(a,b,1,.03,32),0xffffff,0,ty(0),0,1,1,1,0)); }),0,0,0,M.refl);
  /* arms: shoulder pivot -> upper arm -> elbow -> forearm with cuff and glove; the hand group carries the wrench and the thumb */
  R.arm=[-1,1].map(s=>{ const sh=grp(tor,s*.47,ty(1.04),.02), el=grp(sh,0,-.25,0), hand=grp(el,0,-.27,.02);
    mesh(sh,bobBake("upper",L=>{ bobPart(L,bobG("up",()=>bobCaps(.12,.14,12)),BOB_NAVY,0,-.12,0,1,1,1,1); bobPart(L,bobG("ring",()=>new T.CylinderGeometry(.126,.126,.04,14)),BOB_ORG,0,-.1,0,1,1,1,0); }));
    mesh(el,bobBake("fore"+s,L=>{ bobPart(L,bobG("fo",()=>bobCaps(.105,.12,12)),BOB_NAVY,0,-.1,0,1,1,1,1); bobPart(L,bobG("cuff",()=>new T.CylinderGeometry(.115,.115,.05,14)),0x4d576a,0,-.2,0,1,1,1,0);
      bobPart(L,SPH,BOB_GLV,0,-.27,.02,.145,.135,.145,1); bobPart(L,SPH,BOB_GLV,-s*.1,-.26,.12,.06,.06,.06,0); }));
    const thp=grp(hand,0,0,0); mesh(thp,bobBake("thumb",L=>bobPart(L,bobG("thumb",()=>bobCaps(.052,.1,8)),BOB_GLV,0,.15,.05,1,1,1,1))); thp.visible=false;
    return {sh,el,hand,th:thp,s,p:[0,0,0,0]}; });
  { /* the wrench in the character's right hand (-x): handle, open jaw at the top, ring at the bottom */
    const w=grp(R.arm[0].hand,0,0,.03); w.rotation.set(.35,0,-.35); R.wrench=w;
    mesh(w,bobBake("wrench",L=>{ bobPart(L,bobG("wh",()=>bobCaps(.036,.46,10)),0xb9c8d8,0,.17,0,1,1,1,1); bobPart(L,bobG("wj",()=>new T.TorusGeometry(.078,.042,8,16,4.5)),0xb9c8d8,0,.47,0,1,1,1,1,[0,0,2.46]); bobPart(L,bobG("wr",()=>new T.TorusGeometry(.058,.032,8,14)),0xb9c8d8,0,-.1,0,1,1,1,1); })); }
  /* neck pivot + head: olive skin, ears and a man's nose are one piece; hair, beard and moustache are baked per variant */
  R.neck=grp(tor,0,ty(1.15),0);
  const head=R.head=grp(R.neck,0,.46,0);
  mesh(head,bobBake("head",L=>{ bobPart(L,SPHH,BOB_SKIN,0,0,0,BOB_HX,BOB_HY,BOB_HZ,1); [-1,1].forEach(s=>bobPart(L,SPH,BOB_SKIN,s*.665,-.06,-.02,.1,.14,.1,1)); bobPart(L,SPH,0xb98355,0,-.14,bobZs(0,-.14)+.03,.06,.06,.07,0); }));
  mesh(head,bobBake("face"+(V||0),L=>bobFaceHair(L,K)));
  /* eyes: dark glossy ellipsoids with a warm brown lower glow and two highlights */
  const ez=(x,y)=>Math.sqrt(Math.max(0,1-x*x/(.108*.108)-y*y/(.14*.14)))*.07+.004;
  R.eye=[-1,1].map(s=>{ const p=bobFp(s*.44,-.1), n=bobFn(p), g=grp(head,p.x,p.y,p.z); g.quaternion.setFromUnitVectors(Z,n);
    const ball=mk(g,SPH,M.eye,0,0,0,.108,.14,.07), ir=mk(g,CIR,M.iris,0,-.05,ez(0,-.05),.092,.078,1);
    const h1=mk(g,CIR,M.white,-.033,.046,ez(-.033,.046)+.002,.036,.036,1), h2=mk(g,CIR,M.white,.038,-.052,ez(.038,-.052)+.002,.017,.017,1);
    const arc=mk(g,bobG("arc",()=>new T.TorusGeometry(.086,.025,8,18,Math.PI)),M.eye,0,-.04,.03,1,1,1); arc.visible=false;
    return {g,ball,ir,h1,h2,arc,s,b:{ir:[0,-.05],h1:[-.033,.046],h2:[.038,-.052]}}; });
  /* brows (thick, dark) and cheeks */
  R.brow=[-1,1].map(s=>{ const p=bobFp(s*.45,.3), n=bobFn(p), g=grp(head,p.x,p.y,p.z); g.quaternion.setFromUnitVectors(Z,n); const m=mk(g,bobG("brow",()=>bobCaps(.04,.15,8)),M.brow,0,0,.03); m.rotation.z=Math.PI/2; return {g,m,s}; });
  R.cheek=[-1,1].map(s=>{ const m=new T.Mesh(bobG("cheek"+s,()=>bobDisc(s*.4,-.12,.11,.07,.006)),M.cheek.clone()); head.add(m); return m; });
  /* mouth: three dynamic strips on the head surface (cavity, tongue, teeth), lifted over the beard patch */
  const strip=(mat,ord)=>{ const g=new T.BufferGeometry(), N=14; g.setAttribute("position",new T.BufferAttribute(new Float32Array((N+1)*2*3),3)); const ix=[]; for(let i=0;i<N;i++){ const a=i*2; ix.push(a,a+1,a+2,a+1,a+3,a+2); } g.setIndex(ix);
    const m=new T.Mesh(g,mat); m.frustumCulled=false; m.renderOrder=ord; head.add(m); return m; };
  R.mouth={cav:strip(M.mouthIn,1),tg:strip(M.tongue,2),te:strip(M.teeth,2),N:14,cy:-.29,k:"",zo:K.beard.off+.012};
  /* headset instead of a helmet: band over the hair, two ear cups, a mic boom to the corner of the mouth with a small status light */
  mesh(head,bobBake("headset",L=>{ const band=[]; for(let i=0;i<=16;i++){ const a=Math.PI*i/16; band.push(new T.Vector3(.8*Math.cos(a),.0+.83*Math.sin(a)-.01,-.13)); }
    bobPart(L,new T.TubeGeometry(new T.CatmullRomCurve3(band),32,.03,6,false),0x39424f,0,0,0,1,1,1,1);
    [-1,1].forEach(s=>{ bobPart(L,SPH,0x2e3644,s*.78,-.04,-.1,.1,.17,.15,1); bobPart(L,SPH,0x4a566a,s*.84,-.04,-.1,.05,.11,.1,0); });
    const boom=[new T.Vector3(.8,-.12,-.02),new T.Vector3(.76,-.28,.22),new T.Vector3(.58,-.35,.48),new T.Vector3(.3,-.35,.6)];
    bobPart(L,new T.TubeGeometry(new T.CatmullRomCurve3(boom),16,.016,5,false),0x39424f,0,0,0,1,1,1,1); bobPart(L,SPH,0x2e3644,.28,-.35,.605,.045,.04,.04,1); }));
  { const m=new T.Mesh(bobG("lens",()=>new T.SphereGeometry(.026,8,6)),new T.MeshBasicMaterial({color:0xfff2b0})); m.position.set(.285,-.335,.645); head.add(m); R.lamp=m; }
  return R;
}
/* mouth shape: o = open (0..1), s = smile (-1..1), w = half width, th = lip line thickness */
function bobMouth(R,o,s,w,th){
  const m=R.mouth, N=m.N, key=[o,s,w,th].map(v=>v.toFixed(3)).join(); if(key===m.k) return; m.k=key;
  const ck=.075*s, oh=.17*o, cy=m.cy, zo=m.zo||0, P=m.cav.geometry.attributes.position, Q=m.tg.geometry.attributes.position, W=m.te.geometry.attributes.position;
  const yU=x=>ck*(x/w)*(x/w)-ck*.3, hh=x=>{ const u=1-(x/w)*(x/w); return th*(.65+.35*u)+oh*Math.pow(Math.max(u,0),.7); };
  for(let i=0;i<=N;i++){ const x=-w+2*w*i/N, yu=yU(x), yl=yu-hh(x);
    P.setXYZ(i*2,x,cy+yu,bobZs(x,cy+yu)+zo+.004); P.setXYZ(i*2+1,x,cy+yl,bobZs(x,cy+yl)+zo+.004);
    const tt=Math.max(0,1-Math.pow(Math.abs(x)/(w*.62),2)), tyU=yl+hh(x)*.62*tt+.001*(1-tt), tyL=yl+.002;
    Q.setXYZ(i*2,x,cy+tyU,bobZs(x,cy+tyU)+zo+.006); Q.setXYZ(i*2+1,x,cy+tyL,bobZs(x,cy+tyL)+zo+.006);
    const te=(Math.abs(x)<w*.8&&o>.22)?Math.min(.05,hh(x)*.34):0;
    W.setXYZ(i*2,x,cy+yu,bobZs(x,cy+yu)+zo+.006); W.setXYZ(i*2+1,x,cy+yu-te,bobZs(x,cy+yu-te)+zo+.006); }
  P.needsUpdate=Q.needsUpdate=W.needsUpdate=true; m.tg.visible=o>.2; m.te.visible=o>.22;
}

/* ----- one instance: scene, rig, animation state ----- */
function bobInst3(o){
  const T=THREE, R=bobBuild(o.variant!==undefined?o.variant:BOB3.var), sc=new T.Scene(); sc.add(R.root);
  sc.add(new T.AmbientLight(0xa9acd6,.7)); const key=new T.DirectionalLight(0xfff0dc,.4), fill=new T.DirectionalLight(0xb8ccff,.14); key.position.set(-2.4,3.6,4.2); fill.position.set(3,1,2); sc.add(key,fill);
  const I={R,sc,mood:"idle",view:o.view||"full",t:Math.random()*10,bt:1.6+Math.random()*2,bp:-1,gx:0,gy:0,gtx:0,gty:0,hy:0,hp:0,
    st:{eye:1,sm:.6,mo:0,by0:0,by1:0,ba0:.05,ba1:.05,ch:.45,mw:1,roll:0,lean:0,lamp:.3,gzx:0,gzy:0,hap:0,mouth:0,mwS:1},
    bY:0,bV:0,gest:null,gT:0,idleT:4+Math.random()*5,calm:!!o.calm,talk:false,mO:0,mW:1,px:.02,alertT:0,tilt:0};
  return I;
}
function bobPoseSet(a,p,k,dt){ for(let i=0;i<4;i++) a.p[i]=bobSm(a.p[i],p[i],k,dt); }
/* advance the animation by dt seconds; sp = {mo,w} the shared lip-sync values while speaking; returns true while something is moving */
function bobAnim(I,dt,sp,ptr){
  const R=I.R, st=I.st, E=BOB_EMO[I.mood]||BOB_EMO.idle, calm=I.calm, t=I.t+=dt, talk=!!(sp&&sp.on);
  const ek=7, bs=Math.sin(t*1.9);
  /* blink */
  I.bt-=dt; if(I.bt<=0&&I.bp<0){ I.bp=0; } let bl=0; if(I.bp>=0){ I.bp+=dt/.17; if(I.bp>=1){ I.bp=-1; I.bt=Math.random()<.2?.18:(I.mood==="alert"?5:2.4+Math.random()*2.8); } else bl=Math.sin(I.bp*Math.PI); }
  /* expression */
  st.eye=bobSm(st.eye,E.eye,ek,dt); st.sm=bobSm(st.sm,E.sm,ek,dt); st.mo=bobSm(st.mo,E.mo,ek,dt); st.ch=bobSm(st.ch,E.ch,5,dt); st.mw=bobSm(st.mw,E.mw,ek,dt); st.roll=bobSm(st.roll,E.roll,4,dt);
  st.lean=bobSm(st.lean,E.lean,4,dt); st.by0=bobSm(st.by0,E.by[0],9,dt); st.by1=bobSm(st.by1,E.by[1],9,dt); st.ba0=bobSm(st.ba0,E.ba[0],9,dt); st.ba1=bobSm(st.ba1,E.ba[1],9,dt); st.hap=bobSm(st.hap,E.hap,10,dt);
  st.lamp=bobSm(st.lamp,E.lamp,5,dt);
  /* gaze: pointer (or wandering glances) steers the eyes fast and the head slowly */
  let tx=ptr?ptr.x:0, ty=ptr?ptr.y:0; if(!ptr||ptr.idle){ I.gw=(I.gw||0)-dt; if(I.gw<=0){ I.gw=1.6+Math.random()*3; I.gwx=(Math.random()-.5)*.7; I.gwy=(Math.random()-.4)*.4; } tx=I.gwx||0; ty=I.gwy||0; if(calm){ tx=0; ty=0; } }
  I.gx=bobSm(I.gx,tx,calm?3:9,dt); I.gy=bobSm(I.gy,ty,calm?3:9,dt);
  I.hy=bobSm(I.hy,tx*.5,3.2,dt); I.hp=bobSm(I.hp,ty*.28,3.2,dt);
  st.gzx=bobSm(st.gzx,I.gx*.8+E.gz[0],10,dt); st.gzy=bobSm(st.gzy,I.gy*.8+E.gz[1],10,dt);
  /* mouth: speech drives the opening, the mood sets the base shape */
  const wantO=talk?bobCl(E.mo*.35+sp.mo*.95,0,1):E.mo, wantW=talk?sp.w:1; st.mouth=bobSm(st.mouth,wantO,talk?22:9,dt); st.mwS=bobSm(st.mwS,wantW,14,dt);
  /* idle life: occasional gesture or glance */
  if(!I.gest&&!calm){ I.idleT-=dt; if(I.idleT<=0){ I.idleT=8+Math.random()*9; const r=Math.random(); if(I.mood==="idle"&&!talk) bobGesture(I,r<.45?"wave":r<.75?"thumbs":"look"); } }
  /* gestures: arm pose targets */
  let pa=BOB_POSE.rest, pb=BOB_POSE.rest, wv=0, gw=0, g=I.gest;
  if(g){ g.t+=dt; const u=g.t/g.d; if(u>=1){ I.gest=null; g=null; } else { gw=Math.min(1,g.t/.22,(g.d-g.t)/.28); } }
  const sPoseR=BOB_POSE.rest; let poseL=BOB_POSE.hold, poseR=sPoseR;
  if(I.mood==="think"&&!g){ poseR=BOB_POSE.chin; } else if(I.mood==="alert"&&!g){ poseR=BOB_POSE.stop; } else if(I.mood==="happy"&&!g){ poseR=BOB_POSE.thumbs; }
  if(g){ const gp=BOB_POSE[g.n==="look"?"rest":g.n]; if(g.n!=="look") poseR=gp; }
  /* arm 0 is the character's right hand (wrench, viewer's left); arm 1 the free hand */
  bobPoseSet(R.arm[0],poseL,8,dt); bobPoseSet(R.arm[1],poseR,g&&g.n==="wave"?14:9,dt);
  const A0=R.arm[0], A1=R.arm[1], wave=g&&g.n==="wave"?Math.sin(t*11)*.5*gw:0, hold=A1.p[3];
  A0.sh.rotation.set(-A0.p[0],0,-A0.p[1]*.9); A0.el.rotation.set(-A0.p[2],0,0);
  A1.sh.rotation.set(-A1.p[0],0,A1.p[1]); A1.el.rotation.set(-A1.p[2],0,wave); A1.th.visible=hold>.5; A1.th.scale.setScalar(Math.max(.01,hold));
  R.wrench.rotation.set(A0.p[0]+A0.p[2]-.15,0,.9*A0.p[1]-.05+Math.sin(t*1.7)*.04*(calm?0:1)); A1.th.rotation.set(A1.p[0]+A1.p[2]-.2,0,-A1.p[1]+.2);
  /* body: breathing, bounce spring, lean, squash and stretch */
  I.bV+=(-90*I.bY-9*I.bV)*dt; I.bY+=I.bV*dt; const sq=bobCl(I.bV*.012,-.1,.1);
  const br=calm?0:bs;
  R.body.position.y=Math.max(0,I.bY); R.body.scale.set(1-sq*.5,1+sq,1-sq*.5);
  R.tor.scale.set(1+.007*br,1+.016*br,1+.007*br); R.tor.rotation.set(st.lean+.02*br+(talk?.03*Math.sin(t*3.1):0),I.hy*.35,I.hy*-.02);
  R.neck.position.y=.73+.012*br;
  const nod=talk?Math.sin(t*4.3)*.045+Math.sin(t*7.1)*.02:0;
  R.neck.rotation.set(-I.hp+nod+(g&&g.n==="nod"?Math.sin(g.t*9)*.2*gw:0),I.hy+(talk?Math.sin(t*2.3)*.05:0),st.roll+(I.hy*-.06)+(I.tilt||0));
  /* face */
  const open=st.eye*(1-.93*bl);
  R.eye.forEach((e,i)=>{ const hp=st.hap>.5; e.ball.visible=!hp; e.ir.visible=!hp; e.h1.visible=!hp; e.h2.visible=!hp; e.arc.visible=hp&&bl<.5;
    e.g.scale.set(1+.04*(st.eye-1),Math.max(.05,open),1);
    const gx=st.gzx*.034, gy=st.gzy*.03; e.ball.position.set(gx,gy,0); e.ir.position.set(e.b.ir[0]+gx,e.b.ir[1]+gy,e.ir.position.z); e.h1.position.set(e.b.h1[0]+gx*.45,e.b.h1[1]+gy*.45,e.h1.position.z); e.h2.position.set(e.b.h2[0]+gx*.45,e.b.h2[1]+gy*.45,e.h2.position.z); });
  R.brow.forEach((b,i)=>{ const s=b.s, by=i?st.by1:st.by0, ba=i?st.ba1:st.ba0; b.m.position.y=.035+by+(1-open)*-.02; b.m.rotation.z=Math.PI/2+s*ba; b.m.scale.set(1,1,1); });
  R.cheek.forEach(c=>{ c.material.opacity=bobCl(st.ch,0,1); c.visible=st.ch>.03; });
  const lampPulse=I.mood==="alert"?(Math.sin(t*16)>0?1:.25):(talk?.65+.35*Math.sin(t*5):st.lamp);
  R.lamp.material.color.setRGB(1,.82+.18*lampPulse,.5+.4*lampPulse); if(I.mood==="alert"&&lampPulse>.9) R.lamp.material.color.setRGB(1,.55,.3);
  const w=.125*st.mw*st.mwS*(1+.18*st.mo);
  bobMouth(R,bobCl(st.mouth,0,1),st.sm*(1-.3*bobCl(st.mouth,0,1)),w,Math.max(.022,I.px*1.4));
  R.shadow.scale.setScalar(1.9*(1-.18*bobCl(I.bY,0,1)));
  return talk||!!g||I.bp>=0||Math.abs(I.bV)>.01||Math.abs(I.bY)>.002||Math.abs(I.gx-tx)>.01||Math.abs(st.sm-E.sm)>.01||Math.abs(st.eye-E.eye)>.01||Math.abs(st.mouth-wantO)>.01||Math.abs(st.roll-E.roll)>.01||I.mood==="alert"||Math.abs(st.by0-E.by[0])>.003;
}
function bobGesture(I,n,d){ const dur={wave:2.2,thumbs:1.8,stop:2,nod:.9,look:1.5,point:1.8,chin:2}[n]||1.8; I.gest={n,t:0,d:d||dur}; if(n==="wave"||n==="thumbs") I.bV=Math.max(I.bV,n==="wave"?2.5:3.2); if(n==="look"){ I.gwx=(Math.random()<.5?-1:1)*.6; I.gwy=.15; I.gw=dur; } }

/* ----- shared renderer: one context for all Bobbies ----- */
function bobGLR(w,h){
  if(!BOB3.R||BOB3.lost){ const c=document.createElement("canvas"); c.addEventListener("webglcontextlost",e=>{ e.preventDefault(); BOB3.lost=true; });
    c.addEventListener("webglcontextrestored",()=>{ BOB3.lost=false; });
    BOB3.R=new THREE.WebGLRenderer({canvas:c,alpha:true,antialias:true,premultipliedAlpha:true,powerPreference:"low-power"}); BOB3.R.setPixelRatio(1); BOB3.R.setClearColor(0x000000,0); BOB3.R.setScissorTest(true); BOB3.gw=BOB3.gh=0; BOB3.lost=false;
    BOB3.cam=new THREE.PerspectiveCamera(22,1,1,40); }
  if(w>BOB3.gw||h>BOB3.gh){ BOB3.gw=Math.max(BOB3.gw,Math.min(1024,Math.ceil(w/128)*128)); BOB3.gh=Math.max(BOB3.gh,Math.min(1024,Math.ceil(h/128)*128)); BOB3.R.setSize(BOB3.gw,BOB3.gh,false); }
  return BOB3.R;
}
/* draw one instance into its own 2D canvas (cw x ch device pixels) */
function bobDraw(I,ctx,cw,ch){
  const R=bobGLR(cw,ch), cam=BOB3.cam, bust=I.view==="bust", fh=bust?2.15:2.9, ty=bust?1.72:1.17, dist=fh/2/Math.tan(11*Math.PI/180);
  cam.position.set(0,ty+dist*.07,dist); cam.lookAt(0,ty,0); cam.aspect=cw/ch; cam.updateProjectionMatrix();
  BOB3.uW.value=Math.max(.02,1.7*fh/ch); R.setViewport(0,0,cw,ch); R.setScissor(0,0,cw,ch); R.render(I.sc,cam);
  ctx.clearRect(0,0,cw,ch); ctx.drawImage(R.domElement,0,BOB3.gh-ch,cw,ch,0,0,cw,ch);
}
function bobFreeI(I){ if(!I||!I.sc) return; I.R.mouth.cav.geometry.dispose(); I.R.mouth.tg.geometry.dispose(); I.R.mouth.te.geometry.dispose(); I.R.lamp.material.dispose(); I.R.cheek.forEach(c=>c.material.dispose()); I.sc=null; }
function bobGLFree(){ if(BOB3.R){ try{ BOB3.R.dispose(); BOB3.R.forceContextLoss(); }catch(e){} BOB3.R=null; BOB3.gw=BOB3.gh=0; } }
