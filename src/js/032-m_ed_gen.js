/* ---------- (ed) the detailed parts on all three aircraft (owner's request: «اذا كو شغلات تشابه بين 737 وبقية الطيارات ضيفهن»).
   The detailed parts are drawn for the 737 (m_ed737*.js). A part that every airliner has is placed on the A380 and the 747-400 too, by category:
   F  skin-mounted parts (antennas, probes, ports, lights): the 737 stations are mapped to the other fuselage (piece by piece: nose to wing root, wing root, wing root to tail) and the part follows that skin;
   Fi parts inside the fuselage: the same mapping, lifted by the difference in belly height; Fa the APU (placed from the aircraft's own APU station);
   W  wing and tail parts: drawn with that aircraft's own wing / tail loft (they are fractions of span and chord);
   E  engine parts: one copy per engine, scaled to that nacelle and placed at its front face;  G main-gear parts: one copy per main-gear leg, scaled to its wheels;  N nose gear.
   Parts that are the 737's own (seat zones, the system diagrams, the section of the barrel) stay on the 737 only. edEnsure and edLabels live here. ---------- */
const EDGEN={
  F:["wx_radar","wx_receiver","press_bulkhead_fwd","ant_ils","ant_vhf","ant_gps","ant_tcas","ant_atc","radio_altimeter_ant","ant_dme","ant_marker","ant_adf","ant_satcom","ant_iridium","elt","pitot_probe","static_port","tat_probe","aoa_vane","ice_detector","ext_power_recept","neg_relief_valve","safety_relief_valve","outflow_valve","light_beacon","light_tail","light_wing_scan","press_bulkhead_aft","ram_air_inlet"],
  Fi:["batt_main","tru","static_inverter","gcu_bus","load_panel","emerg_battery","bus_tie","adm","adiru","oxygen_crew","keel_beam","fdr","cvr","elt_unit","recirc_fan","pack_heat_exch","pack_acm","mix_manifold","cargo_smoke_det","hyd_epump","hyd_reservoir","light_bus"],
  Fa:["apu_gen","apu_exhaust","apu_inlet","apu_fire_bottle"],
  W:["wing_front_spar","wing_rear_spar","wing_ribs","wing_skin_panels","slat_tracks","flap_track_fairing","flap_actuators","jb_krueger","static_wicks","light_nav_left","light_nav_right","light_strobe","light_landing","light_logo","spoiler_pcu","elevator_pcu","ths_actuator","rudder_pcu","refuel_panel","fuel_wing_tank","fuel_surge_tank","fuel_boost_pump","ground_strap","ant_hf","ant_vor","dorsal_fin"],
  E:["eng_fan_blades","eng_lp_compressor","eng_hp_compressor","eng_combustor","eng_hp_turbine","eng_lp_turbine","eng_core","eng_gearbox","eng_starter","eng_oil_tank","eng_fuel_pump","hyd_edp","idg","eng_bleed_valve","eng_fan_case","eng_exhaust_plug","eng_ogv","eng_inlet_cowl","eng_mounts","eng_cowl_antiice","eng_generator","fire_bottle_eng","eng_fire_loop"],
  G:["wheel_brake","gear_shock_strut","gear_drag_brace","gear_doors","wheel_fuse_plug","gear_uplock","gear_torque_link","gear_prox_sensor"],
  N:["gear_actuator","gear_shimmy","light_taxi"]
};
Object.keys(EDGEN).forEach(k=>EDGEN[k].forEach(id=>{ if(ED[id]) ED[id].cat=k; }));
/* the cards of the new parts that were made 737-only become available to every aircraft that gets the part */
Object.keys(ED).forEach(id=>{ const d=ED[id]; if(d.cat&&d.meta&&PARTS[id]&&PARTS[id].only==="b737") delete PARTS[id].only; });
const ED0={eng:{x:4.95,y:1.87,zf:-6.42,r:1.15},gear:{x:2.8,X:18,r:0.5},nose:{X:5.0,r:0.4}};

/* ---- the 737 -> other aircraft station map and the context the part functions get ---- */
function edStationMap(c){ const a=GEO.b737, A=[0,a.wle,a.wle+a.rc,a.L], T=[0,c.wle,c.wle+c.rc,c.L];
  return X=>{ const i=X<=A[1]?0:X<=A[2]?1:2; return T[i]+(X-A[i])*(T[i+1]-T[i])/(A[i+1]-A[i]); }; }
function edProxy(c,apu){ const Kt=edCtx(c), a=GEO.b737, m=apu?(X=>X-a.apuX+c.apuX):edStationMap(c);
  return Object.assign({},Kt,{Z:X=>Kt.Z(m(X)),top:X=>Kt.top(m(X)),bot:X=>Kt.bot(m(X)),half:(X,y)=>Kt.half(m(X),y),zc:X=>Kt.zc(m(X)),ring:X=>Kt.ring(m(X))}); }
/* the engines of one aircraft (right side), read from its own nacelle meshes */
function edEngines(B){ if(B._edE) return B._edE; B.root.updateMatrixWorld(true); const cl=[], span=(B.c&&B.c.span)||40;
  /* (v32) the nacelle has several "eng_inlet" meshes (lip, rings, anti-ice...) and every one of them used to become an engine: the 747 got 9 engines (one in the middle of the fuselage) and every engine part
     (core, pump, gearbox...) was built 9 times, with its labels on the fuselage. Meshes of one nacelle share an axis: one engine per axis, off the centreline, right-hand side only (the left is the mirror). */
  (B.byId.eng_inlet||[]).forEach(m=>{ if(m.userData.mirror) return; const bb=new THREE.Box3().setFromObject(m), cx=(bb.min.x+bb.max.x)/2, cy=(bb.min.y+bb.max.y)/2;
    if(cx<Math.max(2,span*0.08)) return;
    const r=Math.max(0.3,Math.min(bb.max.x-bb.min.x,bb.max.y-bb.min.y)/2);
    const q=cl.find(e=>Math.abs(e.x-cx)<1.2&&Math.abs(e.y-cy)<1.2);
    if(!q) cl.push({x:cx,y:cy,zf:bb.min.z,r}); else { if(r>q.r){ q.r=r; q.x=cx; q.y=cy; } q.zf=Math.min(q.zf,bb.min.z); } });
  cl.sort((p,q)=>p.x-q.x); return B._edE=cl; }
function edInstances(B,id){
  const d=ED[id]; if(!d||!d.cat) return null; B._edI=B._edI||{}; if(B._edI[id]) return B._edI[id];
  const c=B.c, cat=d.cat, I=[], K737=B._edK7||(B._edK7=edCtx(GEO.b737)), same=p=>p;
  if(cat==="F"||cat==="Fi"||cat==="Fa"){ const K=edProxy(c,cat==="Fa"), dy=cat==="F"?0:c.zb-GEO.b737.zb; I.push({K,xf:g=>dy?g.translate(0,dy,0):g,tp:p=>[p[0],p[1]+dy,p[2]]}); }
  else if(cat==="W"){ I.push({K:edCtx(c),xf:g=>g,tp:same}); }
  else if(cat==="E"){ edEngines(B).forEach(e=>{ const s=e.r/ED0.eng.r; I.push({K:K737,xf:g=>{ g.translate(-ED0.eng.x,-ED0.eng.y,-ED0.eng.zf); g.scale(s,s,s); return g.translate(e.x,e.y,e.zf); },tp:p=>[(p[0]-ED0.eng.x)*s+e.x,(p[1]-ED0.eng.y)*s+e.y,(p[2]-ED0.eng.zf)*s+e.zf]}); }); }
  else if(cat==="G"){ const s=c.wheelR/ED0.gear.r, z0=ED0.gear.X-GEO.b737.L/2; (c.mg||[]).forEach(q=>{ const x=q[0], z=q[1]-c.L/2; I.push({K:Object.assign({},K737,{xg:true}),xf:g=>{ g.translate(-ED0.gear.x,0,-z0); g.scale(s,s,s); return g.translate(x,0,z); },tp:p=>[(p[0]-ED0.gear.x)*s+x,p[1]*s,(p[2]-z0)*s+z]}); }); }
  else if(cat==="N"){ const s=c.nwR/ED0.nose.r, z0=ED0.nose.X-GEO.b737.L/2, z=(c.ng&&c.ng[0]||5)-c.L/2; I.push({K:K737,xf:g=>{ g.translate(0,0,-z0); g.scale(s,s,s); return g.translate(0,0,z); },tp:p=>[p[0]*s,p[1]*s,(p[2]-z0)*s+z]}); }
  return B._edI[id]=I; }

/* ---- building: the 737 as before; the other aircraft through the instances above ---- */
/* (v36) two phases: B.ed=1 after the exterior detailed parts (always visible), B.ed=2 after the rest (X-ray interior parts and the "shown only while selected" models).
   The second set is 3/4 of the meshes and nobody sees it before X-ray, explode, a selection or a pull-out, so it is built then (GL.sync decides) or while the page is idle (GL.prepEd). */
const edVisNow=d=>!d.sel&&(d.layer||"ext")==="ext";
function edEnsure(B,all){
  if(!B) return;
  if(!B.ed){ B.ed=1; edBuild(B,edVisNow); }
  if(all&&B.ed<2){ B.ed=2; edBuild(B,d=>!edVisNow(d)); }
}
function edBuild(B,want){
  const k737=B.key==="b737", K0=k737?edCtx(B.c):null;
  const build=(id,gs)=>{ const d=ED[id], layer=d.layer||"ext", par=PARTS[id]&&PARTS[id].parent, by={};
    gs.forEach(g=>{ const k=g.edmk||d.mk||"edmet"; (by[k]=by[k]||[]).push(g); });
    Object.keys(by).forEach(k=>{ const geom=mergeG(by[k]), mat=B.mat(id,k,layer);
      [false,true].forEach(mirror=>{ if(mirror&&!d.both) return; const m=new THREE.Mesh(geom,mat); if(mirror) m.scale.x=-1;
        m.userData={id,layer,mirror,dir:EXP[id]||EXP[par]||[0,0,0],child:false,piv:null,hinge:null,nl:false,role:undefined,mvk:undefined,gearDep:!!d.gearDep,edSel:!!d.sel}; if(d.sel) m.visible=false; B.root.add(m); (B.byId[id]=B.byId[id]||[]).push(m); }); }); };
  Object.keys(ED).forEach(id=>{ try{ const d=ED[id]; if(!want(d)) return;
    if(PARTS[id]&&PARTS[id].only&&!jbOnlyHas(PARTS[id].only,B.key)) return;   /* v29: a part that belongs to another aircraft is not built (the 747's hump and body gear, the A380 / 747 stairs ...) */
    if(k737){ const gs=d.geo(K0); if(gs&&gs.length) build(id,gs); return; }
    const inst=edInstances(B,id); if(!inst||!inst.length) return; const all=[];
    inst.forEach(it=>{ const gs=d.geo(it.K); (gs||[]).forEach(g=>{ all.push(it.xf(g)); }); }); if(all.length) build(id,all);
  }catch(e){ console.error("ed",id,e); } });
}

/* ---- labels: the first instance of the part on the aircraft in view ---- */
/* (v32) with several instances (engines, landing-gear legs) the name chips follow the one the camera is looking at, not always the first */
let ED_LI={k:"",t:0,i:0};
function edLabelInst(B,id,its){
  if(its.length<2) return its[0];
  const cs=GL.camState(), t=cs.t, key=id+"|"+B.key+"|"+t.map(v=>Math.round(v)).join(","), now=performance.now();
  if(ED_LI.k===key&&now-ED_LI.t<1500) return its[ED_LI.i]||its[0];
  let bi=0, bd=1e9; its.forEach((it,i)=>{ try{ const L=ED[id].lab(it.K); let sx=0,sy=0,sz=0; L.forEach(q=>{ const p=it.tp(q[2]); sx+=p[0]; sy+=p[1]; sz+=p[2]; });
    const n=Math.max(1,L.length), d=Math.hypot(sx/n-t[0],sy/n-t[1],sz/n-t[2]); if(d<bd){ bd=d; bi=i; } }catch(e){} });
  ED_LI={k:key,t:now,i:bi}; return its[bi];
}
function edLabels(){
  const id=S.sel, on=id&&edHas(id)&&ED[id].lab; if(!on){ if(ED_LB) ED_LB.hidden=true; return; }
  const B=GL.dbg(), lb=edLabelsEnsure(), en=typeof myLang==="function"&&myLang()==="en"; let K, tp=p=>p;
  if(B.key==="b737") K=edCtx(GEO.b737); else { const its=edInstances(B,id)||[]; if(!its.length){ lb.hidden=true; return; } const it=edLabelInst(B,id,its); K=it.K; tp=it.tp; }
  const L=ED[id].lab(K); lb.hidden=false;
  while(lb.children.length<L.length) lb.appendChild(document.createElement("span")); while(lb.children.length>L.length) lb.lastChild.remove();
  const W=lb.clientWidth;
  const pos=[];
  L.forEach((q,i)=>{ const el=lb.children[i], pp=tp(q[2]), p=GL.projectPoint(edV(pp[0],pp[1],pp[2])), t=en?q[1]:q[0];
    if(el.textContent!==t) el.textContent=t; if(!p||!p.ok){ el.style.display="none"; return; } el.style.display=""; el.classList.toggle("r",p.x>W*0.62); pos.push({el,x:p.x,y:p.y}); });
  /* keep the name chips from sitting on top of each other: sort by height and push a chip down when it would overlap a neighbour */
  pos.sort((a,b)=>a.y-b.y); pos.forEach((q,i)=>{ for(let k=i-1;k>=0&&k>=i-4;k--){ const o=pos[k]; if(Math.abs(o.x-q.x)<170&&q.y-o.y<20){ q.y=o.y+20; } } q.el.style.left=q.x+"px"; q.el.style.top=q.y+"px"; });
}
