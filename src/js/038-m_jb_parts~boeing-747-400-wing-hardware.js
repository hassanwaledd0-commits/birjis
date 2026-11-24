/* ---------- Boeing 747-400 wing hardware (prefix jc): wing box with the trailing-edge kink (Yehudi), Krueger flaps + slats with gaps at the pylons,
   spoiler panels, two triple-slotted flap groups and two ailerons, each group hinged about its own swept hinge line.
   Called from buildAircraft (p5b2.js) in place of the generic wing hardware when key==="b747"; part ids / hinge conventions unchanged. ---------- */
/* a lifting-surface region through an explicit list of span stations us (the chord is piecewise linear, so a station sits exactly on the kink) */
function jcRegion(ls,us,f0,f1,e,nf){
  const rings=[], fj=j=>f0+(f1-f0)*(1-Math.cos(Math.PI*j/nf))/2;
  us.forEach(u=>{ const ring=[]; for(let j=0;j<=nf;j++) ring.push(ls.pt(u,fj(j),1,e)); for(let j=nf;j>=0;j--) ring.push(ls.pt(u,fj(j),-1,e)); rings.push(ring); });
  return loftGeom(rings);
}
/* panels [u0,u1] merged into one geometry (gaps between them) */
function jcPanels(ls,seg,f0,f1,e,nf){ return mergeG(seg.map(s=>jcRegion(ls,s.length>2?s:[s[0],s[1]],f0,f1,e,nf||8))); }
function jcWing(B,put,W,c,lod){
  const ku=(jcT.kinkY-W.Y0)/(c.tipY-W.Y0), nf=lod?10:22;
  /* v21: the wing box no longer lies under the movable panels (they floated off the wing once they moved): the box is the root, the tip, the centre section, and the
     bands where a gap between panels is (pylons, flap groups, aileron joint); the slats / Krueger flaps / flaps / ailerons fill the rest */
  const st=(a,b)=>ku>a+1e-4&&ku<b-1e-4?[a,ku,b]:[a,b], nb=lod?14:30, band=(g,f0,f1)=>g.map(q=>jcRegion(W,st(q[0],q[1]),f0,f1,0,lod?6:10));
  put("wingbox",mergeG([jcRegion(W,st(0,0.075),0,1,0,nb),jcRegion(W,st(0.97,1),0,1,0,nb)].concat(
    band([[0.21,0.22],[0.335,0.385],[0.50,0.51],[0.625,0.635],[0.76,0.845],[0.925,0.935]],0,0.1),    /* leading edge between the slat segments */
    band([[0.2414,0.2464],[0.47,0.48]],0.72,1),band([[0.72,0.74],[0.83,0.84]],0.76,1))),{both:true,mk:"wing",nl:true});   /* trailing edge between the flap groups and the aileron panels */
  put("wingbox",mergeG([jcRegion(W,st(0.075,0.72),0.1,0.72,0,nb),jcRegion(W,st(0.72,0.97),0.1,0.76,0,nb)]),{both:true,mk:"wing"});
  /* leading edge: Krueger flaps inboard of the inner engine, slats between and outboard of the pylons (the pylon stations stay clear) */
  [[0.075,0.21],[0.22,0.335],[0.385,0.50],[0.51,0.625],[0.635,0.76],[0.845,0.925],[0.935,0.975]].forEach(q=>put("slats",jcRegion(W,q,0,0.1,0.03,6),{both:true,mk:"wing",mvk:W.CH((q[0]+q[1])/2)*0.7}));   /* each segment extends by a fraction of its own chord */
  /* spoilers: one inboard panel, five outboard panels (hinged at 58 % chord) */
  const hp=(u0,u1,f)=>[W.pt(u0,f,1,0.045),W.pt(u1,f,1,0.045)];
  put("spoilers",jcPanels(W,[[0.09,0.2414]],0.58,0.74,0.045,6),{both:true,mk:"wing",hinge:hp(0.09,0.2414,0.58)});
  put("spoilers",jcPanels(W,[[0.252,0.34],[0.345,0.43],[0.435,0.52],[0.525,0.61],[0.615,0.70],[0.705,0.80]],0.58,0.74,0.045,6),{both:true,mk:"wing",hinge:hp(0.252,0.80,0.58)});
  /* triple-slotted flaps: inboard group (parallel to the straight inboard trailing edge) and outboard group; hinge lines at 72 % chord */
  const hf=(u0,u1)=>[W.pt(u0,0.72,0),W.pt(u1,0.72,0)];
  put("flaps",jcPanels(W,[[0.075,0.2414]],0.72,1,0.035,nf),{both:true,mk:"wing",hinge:hf(0.075,0.2414)});
  put("flaps",jcPanels(W,[[0.2464,0.47],[0.48,0.72]],0.72,1,0.035,nf),{both:true,mk:"wing",hinge:hf(0.2464,0.72)});
  /* ailerons: inboard (low speed) and outboard, hinged at 76 % chord */
  put("aileron",jcPanels(W,[[0.74,0.83],[0.84,0.97]],0.76,1,0.035,nf),{both:true,mk:"wing",hinge:[W.pt(0.74,0.76,0),W.pt(0.97,0.76,0)]});
  /* flap-track fairings: long streamlined bodies under the trailing edge (they stay when the flaps move) */
  const gs=[], fr=0.2, fl=3.4; [0.115,0.18,0.30,0.40,0.52,0.64].forEach(u=>{ const p=W.pt(u,0.93,-1,0); gs.push(new THREE.SphereGeometry(1,16,10).scale(fr,fr*0.95,fl/2).translate(p.x,p.y-fr*0.45,p.z)); });
  put("wingbox",mergeG(gs),{both:true,mk:"fair",nl:true});
}
