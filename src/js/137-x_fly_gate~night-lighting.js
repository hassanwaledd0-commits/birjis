/* ---------- night lighting (the scene lights only touch standard materials: own aircraft, neighbours, equipment; the terrain has its own shader) ----------
   fvLightApply runs after every time / weather change (p8w.js applyWx), fvLightTick every frame: it fades the apron-light spill in with proximity to the airport and low height. */
function fvLightApply(W,L,t,w){
  const night=t.night?1:0, lamp=t.lamp||0, dark=1-(w&&w.dark||0)*0.4; FV.L=L; FV.night=night; FV.lamp=lamp;
  if(!FV.flood){ FV.flood=new THREE.DirectionalLight(0xffc98a,0); FV.flood.position.set(0.35,0.8,0.5).multiplyScalar(1000); L.scene.add(FV.flood); }
  FV.base={hc:L.hemi.color.clone(),hg:L.hemi.groundColor.clone(),hi:L.hemi.intensity,sc:L.sun.color.clone(),si:L.sun.intensity};
  if(night){ L.sun.color.setRGB(0.62,0.72,1.0); L.sun.intensity=0.5*dark; L.hemi.color.setRGB(0.09,0.125,0.24); L.hemi.intensity=0.72*dark; }
  FV.k=night?1:Math.min(1,lamp*1.1); FV.spill=-1; fvLightTick(W,null,0);
}
function fvLightTick(W,pos,agl){
  const L=FV.L; if(!L||!FV.base) return; let s=FV.k;
  if(pos&&W.L){ const b=W.L.box, dx=Math.max(0,Math.abs(pos.x-b[0])-b[2]), dz=Math.max(0,Math.abs(pos.z-b[1])-b[3]); s*=Math.exp(-Math.hypot(dx,dz)/450)*Math.exp(-Math.max(0,agl)/140); } else if(pos) s=0; else s=FV.k;
  if(Math.abs(s-FV.spill)<0.004) return; FV.spill=s; const g=FV.base.hg;
  L.hemi.groundColor.setRGB(g.r+0.20*s,g.g+0.15*s,g.b+0.09*s); FV.flood.intensity=0.5*s;
}
/* the own aircraft: lit cabin windows at night (warm emissive through the window texture); fvOwnNight(B,0) puts the shared material back */
function fvOwnNight(B,k){   /* the viewer's per-frame sync copies userData.em0 into emissive, so the glow lives there */
  const wm=B&&B.cache&&B.cache["windows|wtex"]; if(!wm||!wm.map) return; const u=wm.userData||(wm.userData={});
  if(k>0){ u.em0=new THREE.Color(1,0.78,0.42).multiplyScalar(k); wm.emissive.copy(u.em0); } else { u.em0=null; wm.emissive.setRGB(0,0,0); } wm.emissiveIntensity=1;
}
