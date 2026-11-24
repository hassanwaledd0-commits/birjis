/* ---------- 3D builder v2: realistic materials, per-part pull directions, detail (windows, cheatline, cockpit glass, nav lights, fan blades) ---------- */
GEO.a380.wl=[1.2,1.8,1.8]; GEO.b737.wl=[0.5,1.0,0.0];   /* 737: a plain raked tip (no winglet) like the reference model */
GEO.a380.engZ=[3.45,4.3]; GEO.b737.engZ=[1.87];
const EXP = { radome:[0,0,-.22], flightdeck:[0,.02,-.14], fuse_fwd:[0,0,-.07], fuse_mid:[0,.03,0], fuse_aft:[0,0,.10],
  wingbox:[0,0,0], slats:[.04,.03,-.13], flaps:[.03,-.02,.13], aileron:[.06,-.02,.15], spoilers:[.02,.11,.03], wingtip:[.14,.03,.04],
  engine:[.07,-.14,-.09], stabilizer:[0,.04,.17], elevator:[.04,.04,.26], fin:[0,.2,.12],
  eng_inlet:[0,0,-0.06], eng_fancowl:[0,-0.1,0], eng_fandoor:[0,0.12,0], eng_tr:[0,0,0.1], eng_nozzle:[0,0,0.12],
  eng_fan:[0,0,-0.1], eng_core:[0,0,-0.04], eng_pylon:[0,0.1,0],
  gear_nose:[0,-.13,0], gear_main:[.03,-.13,0], wheels:[.05,-.18,0],
  fuel:[0,.15,0], hyd:[0,-.1,.02], packs:[0,-.16,0], avionics:[0,-.14,-.06], apu:[0,.04,.15], windows:[0,0,0], doors:[0,0,0] };
/* direction used for the per-part "pull out" when the part has no explode direction */
const PULLD = { wingbox:[0,.5,0], fuse_mid:[0,.6,0], fuel:[0,.6,0], hyd:[0,-.6,0], avionics:[0,-.5,-.3], packs:[0,-.6,0], apu:[0,.5,.4] };
const SPEC = {
  skin:{c:"#EEF2F5",r:.42,m:.12}, wing:{c:"#DFE6EC",r:.45,m:.14}, glass:{c:"#17242F",r:.08,m:.4},
  door:{c:"#DCE3E9",r:.4,m:.15}, stripe:{c:"#1F5AA0",r:.35,m:.1}, tail:{c:"#1F5AA0",r:.35,m:.1}, tyre:{c:"#7a828c",r:.85,m:0},
  hub:{c:"#C9D1D8",r:.3,m:.7}, gear:{c:"#8E99A3",r:.45,m:.6}, engine:{c:"#E4EAEF",r:.35,m:.25},
  fan:{c:"#2B3339",r:.4,m:.6}, nav:{c:"#FFF4D6",r:.3,m:0,e:"#FFF4D6"}, navL:{c:"#FF2A2A",r:.3,m:0,e:"#FF2A2A"}, navR:{c:"#22FF66",r:.3,m:0,e:"#22FF66"}, beacon:{c:"#FF2020",r:.3,m:0,e:"#FF2020"},
  fair:{c:"#D3DAE0",r:.4,m:.15}, ant:{c:"#B9C2C9",r:.45,m:.3}, probe:{c:"#9AA3AB",r:.35,m:.7}, int:{c:"#CDD6DD",r:.5,m:.2},
  chrome:{c:"#E6EBEF",r:.24,m:.75}, brake:{c:"#3B4046",r:.55,m:.75}, hose:{c:"#17191C",r:.7,m:0}, liner:{c:"#14181B",r:.85,m:.25}, exh:{c:"#5C534B",r:.5,m:.8}, cowlseam:{c:"#6E7880",r:.6,m:.3}, spin:{c:"#FFFFFF",r:.3,m:.25}
};

function mergeG(list){
  const pos=[], idx=[]; let off=0;
  list.forEach(g=>{
    const p=g.attributes.position.array, ix=g.index?g.index.array:null;
    for(let i=0;i<p.length;i++) pos.push(p[i]);
    if(ix) for(let i=0;i<ix.length;i++) idx.push(ix[i]+off); else for(let i=0;i<p.length/3;i++) idx.push(i+off);
    off+=p.length/3;
  });
  const m=new THREE.BufferGeometry(); m.setAttribute("position",new THREE.Float32BufferAttribute(pos,3)); m.setIndex(idx); m.computeVertexNormals(); return m;
}
/* a band on the right side of the fuselage between two height functions (metres), stations X0..X1 */
function sideBand(c,X0,X1,fzA,fzB,n=36,e=0.03){
  const pos=[], idx=[];
  for(let i=0;i<=n;i++){
    const X=X0+(X1-X0)*i/n;
    [fzA(X),fzB(X)].forEach(z=>{ const p=sidePoint(c,X,z); pos.push(p.x+e,p.y,p.z); });
  }
  for(let i=0;i<n;i++){ const a=i*2,b=a+1,cc=a+2,d=a+3; idx.push(a,cc,b, b,cc,d); }
  const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}

function buildAircraft(key,opt){
  const lod=(opt&&opt.lod)||0, c=GEO[key], a=c.fw/2, V=THREE.Vector3, Z=X=>X-c.L/2, a380=key!=="b737", wte=c.wle+c.rc;
  const B={key,c,root:new THREE.Group(),mats:[],cache:{},byId:{}};
  B.mat=(id,mk,layer)=>{
    const k=id+"|"+mk;
    if(!B.cache[k]){
      const sp=SPEC[mk]||SPEC.skin;
      const glossy=AL_GLOSS.indexOf(mk)>=0;
      const m=glossy
        ? new THREE.MeshPhysicalMaterial({color:sp.c,roughness:sp.r,metalness:sp.m,clearcoat:0.55,clearcoatRoughness:0.22,side:THREE.DoubleSide})
        : new THREE.MeshStandardMaterial({color:sp.c,roughness:sp.r,metalness:sp.m,side:THREE.DoubleSide});
      if(sp.e){ m.emissive=new THREE.Color(sp.e); m.emissiveIntensity=0.9; }
      if(mk==="tyre"){ const tt=apTyreTex(); m.map=tt.map; m.roughnessMap=tt.rough; } else if(mk==="spin") m.map=apSpinTex();
      m.userData={id,mk,layer:layer||"ext",base:sp.c};
      B.cache[k]=m; B.mats.push(m);
    }
    return B.cache[k];
  };
  const put=(id,geom,o={})=>{
    const layer=o.layer||"ext", mk=o.mk||(layer==="int"?"int":"skin"), mat=B.mat(id,mk,layer), out=[];
    if(o.belly){ /* fuselage: the lower part takes the livery belly colour; the ratio is set per livery in syncI */
      const P=geom.attributes.position, n=P.count; let mn=1e9, mx=-1e9;
      for(let i=0;i<n;i++){ const y=P.getY(i); if(y<mn) mn=y; if(y>mx) mx=y; }
      const t=new Float32Array(n);
      for(let i=0;i<n;i++) t[i]=THREE.MathUtils.smoothstep((P.getY(i)-mn)/((mx-mn)||1),BELLY_T[0],BELLY_T[1]);
      geom.setAttribute("color",new THREE.BufferAttribute(new Float32Array(n*3).fill(1),3)); mat.vertexColors=true; mat.needsUpdate=true;
      (B.bellies=B.bellies||[]).push({geom,mat,t,key:""});
    }
    [false,true].forEach(mirror=>{
      if(mirror&&!o.both) return;
      const m=new THREE.Mesh(geom,mat); if(mirror) m.scale.x=-1;
      const hg=o.hinge?[[o.hinge[0].x,o.hinge[0].y,o.hinge[0].z],[o.hinge[1].x,o.hinge[1].y,o.hinge[1].z]]:null;
      m.userData={id,layer,mirror,dir:EXP[id]||[0,0,0],child:false,piv:o.piv||(hg?hg[0]:null),hinge:hg,nl:!!o.nl,role:o.role,mvk:o.mvk};
      B.root.add(m); (B.byId[id]=B.byId[id]||[]).push(m); out.push(m);
    });
    return out;
  };

  /* fuselage sections, with windows, doors, cockpit glass and cheatline */
  const secs=[["radome",0,c.rad],["flightdeck",c.rad,c.fd],["fuse_fwd",c.fd,c.wle],["fuse_mid",c.wle,wte],["fuse_aft",wte,c.L]]
    .map(([id,x0,x1])=>({id,x0,x1,mesh:put(id,fuseGeom(c,x0,x1),{belly:id.indexOf("fuse_")===0,piv:id==="radome"?(r=>[0,r.zc+r.hh,c.rad-c.L/2])(ringAt(c,c.rad)):undefined})[0],win:[],door:[]}));
  const zWin=c.win[0][2];
  if(a380) alSideBands(B,put,lod);   /* tapered cheat-line + accent line, sweeping up the tail cone (m_al_look.js) */
  else [["fuse_fwd",c.fd+1.5,c.wle],["fuse_mid",c.wle,wte-0.5]].forEach(([id,x0,x1])=>{ if(x1-x0>0.2) put(id,sideBand(c,x0,x1,X=>zWin-0.95,X=>zWin-0.68),{both:true,mk:"stripe"}); });   /* v19: split at the section joint, so no piece of the line hangs in the gap when exploded */
  skinParts(B,put);

  /* wing, control surfaces, winglet, nav light */
  const W=wingLS(c);
  if(key==="b747") jcWing(B,put,W,c,lod);   /* 747-400: kinked trailing edge, Krueger/slat panels, flap groups (m_jc_wing.js) */
  else {
  /* v21: the wing box no longer lies UNDER the movable surfaces. Before, slats / flaps / ailerons were overlay slabs on a full-chord box, so once they moved they floated off the wing
     (a thin strip ahead of the leading edge, planks hanging behind the trailing edge). Now the box is the root, the centre section between the slat and the flap, the gap between
     flap and aileron and the tip; the slats, flaps and ailerons fill the rest, so the wing is whole at rest and opens where a surface moves. */
  put("wingbox",mergeG([lsRegion(W,0,0.12,0,1,0,6,30),lsRegion(W,0.97,1,0,1,0,3,30),lsRegion(W,0.62,0.64,0.74,1,0,2,12)]),{both:true,mk:"wing",nl:true});
  put("wingbox",lsRegion(W,0.12,0.97,0.12,0.74,0,22,22),{both:true,mk:"wing"});
  /* slats: four segments; each one extends by a fraction of ITS OWN chord (mvk), so the outboard (small chord) segments no longer fly off */
  [0.12,0.34,0.55,0.76,0.97].forEach((u0,i,A)=>{ if(i===A.length-1) return; const u1=A[i+1]; put("slats",lsRegion(W,u0,u1,0,0.12,0.035,5),{both:true,mk:"wing",mvk:W.CH((u0+u1)/2)*0.7}); });
  /* control surfaces hinge about their real (swept) hinge lines */
  put("spoilers",lsRegion(W,0.12,0.88,0.58,0.74,0.045),{both:true,mk:"wing",hinge:[W.pt(0.12,0.58,1,0.045),W.pt(0.88,0.58,1,0.045)]});
  put("flaps",lsRegion(W,0.12,0.62,0.74,1,0.035),{both:true,mk:"wing",hinge:[W.pt(0.12,0.74,0),W.pt(0.62,0.74,0)]});
  put("aileron",lsRegion(W,0.64,0.97,0.74,1,0.035),{both:true,mk:"wing",hinge:[W.pt(0.64,0.74,0),W.pt(0.97,0.74,0)]});
  }
  const WL={pt:(u,f,k,e=0)=>{ const l=(x,y)=>x+(y-x)*u, le=l(W.LE(1),W.LE(1)+c.wl[0]), ch=l(c.tc,c.wl[1]);
    return new V(l(c.tipY,c.tipEnd)+k*thk(0.16*sh(f),e), l(W.zc(1),W.zc(1)+c.wl[2]), le+f*ch-c.L/2); }};
  put("wingtip",lsRegion(WL,0,1,0,1,0,6,10),{both:true,mk:"tip"});   /* mk tip = wing colour unless the livery has its own tip colour */
  const np=WL.pt(1,0.5,0), nlr=key==="b747"?0.13:a380?0.26:0.2, lp=WL.pt(0.35,0.02,0);   /* 747: small lenses on the raked tip */
  put("wingtip",new THREE.SphereGeometry(key==="b747"?0.15:a380?0.3:0.22,8,6).translate(np.x,np.y,np.z),{both:true,mk:"nav"});          /* white strobe at the tip */
  put("wingtip",new THREE.SphereGeometry(nlr,10,8).translate(-lp.x,lp.y,lp.z),{mk:"navL"});                               /* red position light, left */
  put("wingtip",new THREE.SphereGeometry(nlr,10,8).translate(lp.x,lp.y,lp.z),{mk:"navR"});                                /* green position light, right */
  if(key==="a380"&&!lod) alFences(B,put,W);
  /* flap-track fairings: streamlined bodies under the trailing edge, fixed to the wing (they stay when the flaps move) */
  if(key!=="b747"){ const FT=a380?[0.17,0.28,0.4,0.52,0.63]:[0.2,0.34,0.48,0.6], fl=a380?4.6:2.8, fr=a380?0.27:0.17, gs=[];
    FT.forEach(u=>{ const p=W.pt(u,0.95,-1,0); gs.push(new THREE.SphereGeometry(1,16,10).scale(fr,fr*0.95,fl/2).translate(p.x,p.y-fr*0.45,p.z)); });
    put("wingbox",mergeG(gs),{both:true,mk:"fair",nl:true}); }

  /* tail */
  const H=htpLS(c), F=finLS(c), HR=a380?alRoundLS(H,0.07):H;   /* HR: tailplane with a rounded tip (A380 / 747) */
  if(HR!==H){ const us=alTipUs(14,0.07); put("stabilizer",alRegion(HR,us,0,0.66,0,18),{both:true,mk:"wing"}); put("elevator",alRegion(HR,us,0.66,1,0,8),{both:true,mk:"wing",hinge:[H.pt(0,0.66,0),H.pt(1,0.66,0)]}); }
  else { put("stabilizer",lsRegion(H,0,1,0,0.66,0,14,18),{both:true,mk:"wing"});
    put("elevator",lsRegion(H,0,1,0.66,1,0,14,8),{both:true,mk:"wing",hinge:[H.pt(0,0.66,0),H.pt(1,0.66,0)]}); }
  put("fin",lsRegion(F,0,1,0,0.7,0,16,18),{mk:"tail"});
  if(a380&&!lod) alFinBands(c,F,put);
  { const r0=c.L<45&&!a380?0.0:0.03, r1=c.L<45&&!a380?1.0:0.97;   /* 737: the rudder runs the full height of the fin, flush at the top */
    put("fin",lsRegion(F,r0,r1,0.7,1,0,14,8),{mk:"rudder",hinge:[F.pt(r0,0.7,0),F.pt(r1,0.7,0)]}); }

  /* engines: nacelle split into inlet, fan cowl (bottom fixed, top door hinged), thrust-reverser sleeve and nozzle;
     plus fan rotor (swept wide-chord blades, spinner), outlet guide vanes, core cowl with exhaust plug, internal core and a faired pylon.
     Every piece has its own id, so it can be picked and animated. */
  const NPR=[[.9,0],[.96,.03],[1,.12],[1,.55],[.93,.78],[.72,.94],[.62,1]];
  const nacR=t=>{ if(t<=NPR[0][1]) return NPR[0][0];
    for(let i=1;i<NPR.length;i++){ if(t<=NPR[i][1]){ const a=NPR[i-1], b=NPR[i]; return a[0]+(b[0]-a[0])*(t-a[1])/(b[1]-a[1]); } }
    return NPR[NPR.length-1][0]; };
  const lathe=(R,Ln,t0,t1,phi0,phiL)=>{ const pts=[]; for(let i=0;i<=8;i++){ const t=t0+(t1-t0)*i/8; pts.push(new THREE.Vector2(nacR(t)*R,t*Ln)); }
    return new THREE.LatheGeometry(pts,phiL<6?(lod?10:16):(lod?20:32),phi0,phiL); };
  B.engLn=(c.ef+0.8)+(c.eb-1.6);
  const FULL=Math.PI*2, HALF=Math.PI, V2=THREE.Vector2;
  /* a wide-chord fan blade along +y: stagger from root to tip, tip swept back; ring of 4 vertices per station */
  const fanBlade=(r0,r1,ch0,ch1,st0,st1)=>{ const rings=[], n=4; for(let k=0;k<=n;k++){ const f=k/n, r=r0+(r1-r0)*f, ch=ch0+(ch1-ch0)*f, al=(st0+(st1-st0)*f)*Math.PI/180, sw=0.1*r1*f*f, th=0.05*ch;
      const cd=[Math.sin(al),Math.cos(al)], nm=[Math.cos(al),-Math.sin(al)];
      rings.push([[-0.5,0],[0,1],[0.5,0],[0,-1]].map(([a,b])=>new V(cd[0]*ch*a+nm[0]*th*b, r, cd[1]*ch*a+nm[1]*th*b+sw))); }
    return loftGeom(rings); };
  const AL={ring:[]};
  c.eng.forEach((Ye,i)=>{
    const u=(Ye-W.Y0)/(c.tipY-W.Y0), le=W.LE(u), zc=c.engZ[i]||c.engZ[0], R=c.engD/2, Ln=B.engLn;
    const xa=le-(c.ef+0.8), z0=Z(xa), zf=z0+Ln*0.2;
    const fR=c.fanR||(a380?1.45:0.775), rF=fR/R, rh=rF+0.045;                       /* fan diameter 2.9 m (A380) / 1.55 m (737); inlet highlight just outside the fan case */
    /* a nacelle band from t0 to t1 (fraction of the length), optionally only part of the circle */
    const at=(t0,t1,phi0,phiL)=>lathe(R,Ln,t0,t1,phi0,phiL).rotateX(Math.PI/2).translate(Ye,zc,z0);
    const lt=(pts,seg)=>new THREE.LatheGeometry(pts.map(([r,t])=>new V2(r*R,t*Ln)),seg||(lod?20:32)).rotateX(Math.PI/2).translate(Ye,zc,z0);
    put("eng_inlet",at(0,0.2,0,FULL),{both:true,mk:"engine"});
    if(!lod) alEngine(AL,{Ye,zc,z0,R,Ln,nacR});
    put("eng_fancowl",at(0.2,0.62,-Math.PI/2,HALF),{both:true,mk:"engine"});
    put("eng_fandoor",at(0.2,0.62,Math.PI/2,HALF),{both:true,mk:"engine",piv:[Ye+R,zc,0]});
    put("eng_tr",at(0.62,0.92,0,FULL),{both:true,mk:"engine"});
    put("eng_nozzle",at(0.92,1,0,FULL),{both:true,mk:"engine"});
    /* inlet: rounded lip, inner barrel narrowing to the fan face, dark acoustic-liner ring */
    { const lip=[], rm=(0.9+rh)/2, rl=(0.9-rh)/2; for(let k=0;k<=8;k++){ const th=k/8*Math.PI; lip.push([rm+rl*Math.cos(th),-0.012*Math.sin(th)]); }
      const bar=(s0,s1)=>{ const p=[]; for(let k=0;k<=6;k++){ const s=s0+(s1-s0)*k/6; p.push([rF+(rh-rF)*Math.pow(Math.max(0,1-s),2.2),0.2*s]); } return p; };
      put("eng_inlet",lt(lip),{both:true,mk:(a380&&!lod)?"lipm":"engine"}); put("eng_inlet",lt(bar(0,0.2)),{both:true,mk:"engine"}); put("eng_inlet",lt(bar(0.2,1)),{both:true,mk:"liner"}); }
    /* seams: rings between the cowls and four thrust-reverser seams */
    { const sm=[]; [0.2,0.62,0.92].forEach(t=>sm.push(new THREE.TorusGeometry(nacR(t)*R*1.002,0.012*R/1.0,4,lod?20:36).translate(0,0,0).translate(Ye,zc,z0+t*Ln)));
      for(let k=0;k<4;k++){ const a=k*Math.PI/2+Math.PI/4; for(let s=0;s<6;s++){ const t0=0.62+0.3*s/6, t1=0.62+0.3*(s+1)/6, r0=nacR(t0)*R*1.002, r1=nacR(t1)*R*1.002;
        sm.push(barBetween(new V(Ye+r0*Math.cos(a),zc+r0*Math.sin(a),z0+t0*Ln),new V(Ye+r1*Math.cos(a),zc+r1*Math.sin(a),z0+t1*Ln),0.01*R,4)); } }
      put("eng_tr",mergeG(sm),{both:true,mk:"cowlseam",nl:true}); }
    /* fan: swept blades on a hub drum, spinner; outlet guide vanes, core splitter and a dark back plate sit in the (static) fan case */
    { const N=a380?24:24, bl=[], blade=fanBlade(0.3*fR,0.985*fR,a380?0.24*fR:0.26*fR,a380?0.34*fR:0.36*fR,38,64);
      for(let k=0;k<N;k++) bl.push(blade.clone().rotateZ(k*Math.PI*2/N).translate(Ye,zc,zf+0.02));
      bl.push(new THREE.CylinderGeometry(0.31*fR,0.34*fR,0.5*fR,lod?12:20).rotateX(Math.PI/2).translate(Ye,zc,zf+0.2*fR));
      put("eng_fan",mergeG(bl),{both:true,mk:"fan"});
      const Ls=1.0*fR*0.7, rb=0.3*fR, sp=[]; for(let k=0;k<=8;k++){ const s=k/8; sp.push(new V2(rb*Math.sin(Math.PI/2*Math.pow(s,0.85)),s*Ls)); }
      put("eng_fan",new THREE.LatheGeometry(sp,lod?14:24).rotateX(Math.PI/2).translate(Ye,zc,zf-Ls+0.04),{both:true,mk:a380?"engine":"spin"});
      const og=[], NV=lod?18:34; if(!lod){ for(let k=0;k<NV;k++) og.push(new THREE.BoxGeometry(0.03*fR,0.56*fR,0.22*fR).translate(0,0.7*fR,0).rotateZ((k+0.5)*Math.PI*2/NV).translate(Ye,zc,zf+0.55*fR)); }
      og.push(new THREE.CylinderGeometry(0.4*fR,0.4*fR,0.4*fR,lod?12:20).rotateX(Math.PI/2).translate(Ye,zc,zf+0.62*fR));
      put("eng_fancowl",mergeG(og),{both:true,mk:"fan",nl:true});
      put("eng_fancowl",new THREE.CircleGeometry(fR*0.99,lod?14:28).translate(Ye,zc,zf+0.84*fR),{both:true,mk:"liner",nl:true}); }
    /* rear: dark bypass duct inside the nozzle lip, core cowl, exhaust plug / tail cone */
    put("eng_nozzle",lt([[0.6,0.72],[0.585,0.86],[0.57,1.0]],lod?16:28),{both:true,mk:"liner"});
    put("eng_nozzle",lt([[0.5,0.74],[0.52,0.84],[0.5,0.95],[0.44,1.03],[0.37,1.1]],lod?16:28),{both:true,mk:"engine"});
    put("eng_nozzle",lt([[0.35,1.09],[0.29,1.16],[0.15,1.28],[0.0,1.36]],lod?12:20),{both:true,mk:"exh"});
    put("eng_core",new THREE.CylinderGeometry(R*0.5,R*0.5,Ln*0.6,20).rotateX(Math.PI/2).translate(Ye,zc,z0+Ln*0.55),{both:true,layer:"int"});
    put("eng_core",new THREE.TorusGeometry(R*0.42,R*0.1,8,28).translate(Ye,zc,z0+Ln*0.5),{both:true,layer:"int"});
    /* pylon: a faired, swept strut (lens sections) from the nacelle top to the wing leading edge */
    { const ph=Math.max(0.5,W.zc(u)-zc-R+0.5), ya=zc+R*0.55, yb=zc+R+ph-0.15, zl=Z(le-0.6), rings=[];
      for(let k=0;k<=5;k++){ const f=k/5, y=ya+(yb-ya)*f, ch=Ln*(0.62-0.14*f), zle=zl-Ln*0.25-Ln*0.04*(1-f)+Ln*0.1*f, w=R*(0.15-0.04*f), ring=[];
        for(let j=0;j<12;j++){ const th=j/12*Math.PI*2; ring.push(new V(Ye+w*Math.sin(th),y,zle+ch*(0.5-0.5*Math.cos(th)))); } rings.push(ring); }
      put("eng_pylon",loftGeom(rings),{both:true,mk:"fair"}); }
  });
  if(!lod) alEngineDone(B,put,AL);

  /* landing gear (down): oleo struts with chrome pistons, torque links and brake hoses; tyres with tread grooves, rims with bolt circle and axle caps, brake units */
  const wid=a380?0.5:0.4, wo=a380?0.55:0.42, sr=a380?0.2:0.13, nwid=a380?0.4:0.22;
  const hoseG=(p)=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p),8,0.014,4);
  c.ng.forEach(X=>{
    const r=ringAt(c,X), top=r.zb+0.3, q=Z(X), R=c.nwR, Hh=top-R, y1=R+Hh*0.5, pv=[0,top,q], rs=sr*0.8;
    put("gear_nose",mergeG([new THREE.CylinderGeometry(rs,rs,top-y1,10).translate(0,(top+y1)/2,q),new THREE.CylinderGeometry(rs*1.2,rs*1.2,0.14,10).translate(0,y1,q),new THREE.CylinderGeometry(rs*1.15,rs*1.15,0.1,10).translate(0,top-0.45,q),
      barBetween(new V(0,top-0.4,q),new V(0,R+0.2,q-(a380?0.9:0.6)),0.045),barBetween(new V(0,top-0.2,q+0.08),new V(0,top-Hh*0.55,q-0.5),0.04),
      barBetween(new V(0,y1-0.02,q+rs*0.9),new V(0,y1-Hh*0.14,q+0.28),0.03),barBetween(new V(0,y1-Hh*0.14,q+0.28),new V(0,y1-Hh*0.28,q+rs*0.6),0.03)]),{mk:"gear",both:false,piv:pv});
    put("gear_nose",new THREE.CylinderGeometry(rs*0.55,rs*0.55,y1-R,10).translate(0,(y1+R)/2,q),{mk:"chrome",both:false,piv:pv});
    put("gear_nose",barBetween(new V(-wo,R,q),new V(wo,R,q),0.06),{mk:"gear",both:false,piv:pv,role:"bogie"});   /* axle: rides with the wheels (see ffGearPlan) */
    put("gear_nose",new THREE.BoxGeometry(0.34,0.1,0.12).translate(0,top-0.45,q-0.55),{mk:"nav",piv:pv});
    const wn=[apWheel(-wo,R,q,R,nwid,0.55,-1,{lod}),apWheel(wo,R,q,R,nwid,0.55,1,{lod})];
    put("wheels",apMergeG(wn.map(w=>w.tyre)),{mk:"tyre",both:false,piv:pv}); put("wheels",apMergeG(wn.map(w=>w.rim)),{mk:"hub",both:false,piv:pv});
  });
  c.mg.forEach(([gy,gx,gl])=>{
    const ax=!a380?[0]:(gl<5?(c.axl||[-0.95,0.95]):[-1.7,0,1.7]), top=gy>a?c.wz[0]-0.7:ringAt(c,gx).zb+0.4, wr=c.wheelR, Hh=top-wr, y1=wr+Hh*0.46, zg=Z(gx), pv=[gy,top,zg];
    const st=[new THREE.CylinderGeometry(sr,sr,top-y1,10).translate(gy,(top+y1)/2,zg),new THREE.CylinderGeometry(sr*1.2,sr*1.2,0.16,10).translate(gy,y1,zg)], bg=[new THREE.CylinderGeometry(sr*0.9,sr*0.9,0.3,10).translate(gy,wr+0.05,zg)];   /* bg = bogie: axle housing, beam, axles (move with the wheels) */
    if(ax.length>1) bg.push(barBetween(new V(gy,wr,Z(gx+ax[0])),new V(gy,wr,Z(gx+ax[ax.length-1])),0.12));
    ax.forEach(d=>bg.push(barBetween(new V(gy-wo,wr,Z(gx+d)),new V(gy+wo,wr,Z(gx+d)),0.07)));
    const lk=a380?0.34:0.24;
    st.push(barBetween(new V(gy,top-0.25,zg-0.15),new V(gy,wr+Hh*0.5,zg-1.1),a380?0.08:0.055),barBetween(new V(gy,top-0.25,zg+0.15),new V(gy,wr+Hh*0.45,zg+0.95),a380?0.08:0.055),
      barBetween(new V(gy,y1-0.04,zg+sr),new V(gy,y1-Hh*0.1,zg+lk),0.035),barBetween(new V(gy,y1-Hh*0.1,zg+lk),new V(gy,y1-Hh*0.2,zg+sr*0.65),0.035));
    put("gear_main",mergeG(st),{both:true,mk:"gear",piv:pv});
    put("gear_main",mergeG(bg),{both:true,mk:"gear",piv:pv,role:"bogie"});
    put("gear_main",new THREE.CylinderGeometry(sr*0.6,sr*0.6,y1-wr-0.05,10).translate(gy,(y1+wr)/2+0.03,zg),{both:true,mk:"chrome",piv:pv});
    const hs=[]; ax.forEach(d=>[-1,1].forEach(s=>hs.push(hoseG([new V(gy+s*sr*0.6,y1-0.08,zg+sr*0.3),new V(gy+s*0.12,y1-Hh*0.22,zg+d*0.4+0.15),new V(gy+s*(wo-wid*0.45),wr+0.5*wr,Z(gx+d))]))));
    put("gear_main",mergeG(hs),{both:true,mk:"hose",piv:pv,nl:true});
    const ws=[]; ax.forEach(d=>{ ws.push(apWheel(gy-wo,wr,Z(gx+d),wr,wid,0.46,-1,{lod,brake:true}),apWheel(gy+wo,wr,Z(gx+d),wr,wid,0.46,1,{lod,brake:true})); });
    put("wheels",apMergeG(ws.map(w=>w.tyre)),{mk:"tyre",both:true,piv:pv}); put("wheels",apMergeG(ws.map(w=>w.rim)),{mk:"hub",both:true,piv:pv}); put("wheels",apMergeG(ws.map(w=>w.brake)),{mk:"brake",both:true,piv:pv});
  });

  /* anti-collision beacons (red, flashing at night), blade antennas, pitot and static probes, static discharge wicks */
  { const tp=X=>ringAt(c,X).zt, bt=X=>ringAt(c,X).zb, br=a380?0.3:0.22, xb=c.wle+(a380?5:3);
    put("fuse_mid",new THREE.SphereGeometry(br,10,6).scale(1,0.55,1).translate(0,tp(xb)+0.02,Z(xb)),{mk:"beacon"});
    put("fuse_mid",new THREE.SphereGeometry(br,10,6).scale(1,0.55,1).translate(0,bt(xb+(a380?6:4.5))-0.04,Z(xb+(a380?6:4.5))),{mk:"beacon"});
    const blade=(X,top,s=1)=>new THREE.BoxGeometry(0.05,0.34*s,0.55*s).rotateX(top?-0.35:0.35).translate(0,(top?tp(X)+0.14:bt(X)-0.14)*1,Z(X));
    put("fuse_fwd",mergeG([blade(c.fd+3.2,true),blade(c.fd+9,false)]),{mk:"ant"});
    put("fuse_mid",mergeG([blade(c.wle+(a380?14:9),true),blade(c.wle+(a380?18:11),false)]),{mk:"ant"});
    put("fuse_aft",mergeG([blade(c.L-(a380?14:9),true,1.2)]),{mk:"ant"});
    const zw=c.win[0][2], pr=[]; for(let i=0;i<3;i++){ const q=sidePoint(c,c.fd-2.0-i*0.0,zw-0.55-i*0.5); pr.push(new THREE.CylinderGeometry(0.022,0.03,a380?0.34:0.26,6).rotateX(Math.PI/2).translate(q.x+0.03,q.y,q.z-0.05)); }
    put("flightdeck",mergeG(pr),{both:true,mk:"probe"});
    const wk=[], wick=(p,dz)=>wk.push(new THREE.CylinderGeometry(0.008,0.014,dz,4).rotateX(Math.PI/2).translate(p.x,p.y,p.z+dz/2));
    [0.35,0.65,0.95].forEach(u=>{ wick(W.pt(u,1,0),0.4); }); put("wingbox",mergeG(wk),{both:true,mk:"probe",nl:true});
    const hk=[]; [0.3,0.6,0.95].forEach(u=>{ const p=H.pt(u,1,0); hk.push(new THREE.CylinderGeometry(0.008,0.014,0.3,4).rotateX(Math.PI/2).translate(p.x,p.y,p.z+0.15)); }); put("stabilizer",mergeG(hk),{both:true,mk:"probe",nl:true}); }

  if(a380&&!lod) alDetails(B,put,W);
  /* internal layer (X-ray) */
  put("fuel",lsRegion(W,0.02,0.86,0.15,0.65,-0.06,10,10),{both:true,layer:"int"});
  const cx0=c.wle+0.12*c.rc, cx1=wte-0.05*c.rc, rr=ringAt(c,(cx0+cx1)/2), fh=Math.min(1.4,rr.hh*0.5);
  put("fuel",new THREE.BoxGeometry(a*1.56,fh,cx1-cx0).translate(0,rr.zb+0.5+fh/2,Z((cx0+cx1)/2)),{layer:"int"});
  if(a380) put("fuel",lsRegion(H,0.1,0.85,0.2,0.6,-0.03,6,8),{both:true,layer:"int"});
  const bars=[], br=a380?0.12:0.07, nr=a380?16:9;
  [0.15,0.65].forEach(f=>bars.push(barBetween(W.pt(0,f,0),W.pt(0.9,f,0),br)));
  for(let i=1;i<=nr;i++){ const u=i/(nr+1)*0.9; bars.push(barBetween(W.pt(u,0.15,0),W.pt(u,0.65,0),br*0.5)); }
  put("wingbox",mergeG(bars),{both:true,layer:"int"});
  const ry=ringAt(c,wte-3).zb+0.6, hp=[new V(0,ry,Z(wte-3)),new V(a*0.75,ry,Z(wte-3)),W.pt(0.03,0.72,0),W.pt(0.4,0.72,0),W.pt(0.8,0.72,0)];
  put("hyd",new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hp),48,a380?0.1:0.065,6),{both:true,layer:"int"});
  const pk=c.wle+0.22*c.rc;
  put("packs",new THREE.BoxGeometry(a*1.3,0.9,2.2).translate(0,ringAt(c,pk).zb+0.8,Z(pk)),{layer:"int"});
  const av=c.fd+1.6;
  put("avionics",new THREE.BoxGeometry(a*1.4,0.9,2.6).translate(0,ringAt(c,av).zb+0.8,Z(av)),{layer:"int"});
  put("apu",new THREE.CylinderGeometry(a380?0.55:0.38,a380?0.55:0.38,2.4,16).rotateX(Math.PI/2).translate(0,ringAt(c,c.apuX).zc,Z(c.apuX)),{layer:"int"});
  alMats(B);
  prepAnim(B);
  addSkin(B);
  addDetail(B);
  return B;
}
