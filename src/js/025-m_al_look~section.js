/* ---------- (ed) batch 2: electrical bay, pressurisation valves, landing gear, engine accessories, fuel tanks, wing structure and tracks, aft bulkhead, lights. See m_ed737.js. ---------- */
/* ribbons and plates (double sided) */
function edStrip(pairs){ const pos=[], idx=[]; pairs.forEach(([a,b])=>pos.push(a.x,a.y,a.z,b.x,b.y,b.z)); for(let i=0;i<pairs.length-1;i++){ const o=i*2; idx.push(o,o+1,o+2,o+1,o+3,o+2); }
  const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals(); return g; }
const edWp=(W,u,f,k)=>{ const q=W.pt(u,f,k===0?1:k,0); if(k===0&&W.zc) q.y=W.zc(u); return q; };
/* a spar web with its two flanges, along the span from u0 to u1 at chord fraction f */
function edSpar(W,f,u0,u1,n){ const g=[], pairs=[]; for(let i=0;i<=n;i++){ const u=u0+(u1-u0)*i/n; pairs.push([edWp(W,u,f,0.86),edWp(W,u,f,-0.86)]); }
  g.push(edStrip(pairs)); for(let i=0;i<n;i++){ g.push(edBar(pairs[i][0].toArray(),pairs[i+1][0].toArray(),0.04)); g.push(edBar(pairs[i][1].toArray(),pairs[i+1][1].toArray(),0.04)); } return g; }
/* a rib plate across the box at span station u between the two spars */
function edRib(W,u,f0,f1){ const pairs=[]; for(let i=0;i<=6;i++){ const f=f0+(f1-f0)*i/6; pairs.push([edWp(W,u,f,0.86),edWp(W,u,f,-0.86)]); } return edStrip(pairs); }

/* =====================================================================  electrical bay and power system (items 10, 14, 37) */
const EDE={z0:7.2,y:2.05};   /* the equipment bay under the flight deck: stations from the nose */
ED.batt_main={layer:"int",mk:"edyel",
  geo:K=>[edBox(0.55,0.34,0.5,0.75,EDE.y,K.Z(EDE.z0)),edBox(0.5,0.05,0.04,0.75,EDE.y+0.2,K.Z(EDE.z0)-0.12),edBar([0.62,EDE.y+0.2,K.Z(EDE.z0)-0.12],[0.62,EDE.y+0.2,K.Z(EDE.z0)+0.12],0.015),edBar([0.88,EDE.y+0.2,K.Z(EDE.z0)-0.12],[0.88,EDE.y+0.2,K.Z(EDE.z0)+0.12],0.015)],
  lab:K=>[["البطارية الرئيسية (نيكل-كادميوم)","Main battery (nickel-cadmium)",[0.75,EDE.y+0.3,K.Z(EDE.z0)]],["قطبا التوصيل","Terminals",[0.75,EDE.y+0.26,K.Z(EDE.z0)-0.15]]]};
ED.tru={layer:"int",mk:"edgrn",
  geo:K=>[-0.9,-0.3].map(x=>edBox(0.45,0.3,0.4,x,EDE.y,K.Z(EDE.z0+0.9))).concat([edBox(0.45,0.3,0.4,-0.6,EDE.y,K.Z(EDE.z0+1.5))]),
  lab:K=>[["وحدة تقويم (TRU) 1","TRU 1",[-0.9,EDE.y+0.28,K.Z(EDE.z0+0.9)]],["وحدة تقويم (TRU) 2","TRU 2",[-0.3,EDE.y+0.28,K.Z(EDE.z0+0.9)]],["وحدة تقويم (TRU) 3","TRU 3",[-0.6,EDE.y+0.28,K.Z(EDE.z0+1.5)]]]};
ED.static_inverter={layer:"int",mk:"edblu",
  geo:K=>[edBox(0.5,0.28,0.42,0.7,EDE.y,K.Z(EDE.z0+1.0)),edBox(0.5,0.04,0.3,0.7,EDE.y+0.16,K.Z(EDE.z0+1.0))],
  lab:K=>[["المحوّل الساكن (Static inverter)","Static inverter",[0.7,EDE.y+0.3,K.Z(EDE.z0+1.0)]]]};
ED.gcu_bus={layer:"int",mk:"edgld",
  geo:K=>{ const g=[]; [-1.1,-0.7,-0.3,0.1,0.5].forEach((x,i)=>g.push(edBar([x,EDE.y+0.45,K.Z(EDE.z0-0.8)],[x,EDE.y+0.45,K.Z(EDE.z0+2.0)],0.025))); g.push(edBar([-1.1,EDE.y+0.45,K.Z(EDE.z0-0.8)],[0.5,EDE.y+0.45,K.Z(EDE.z0-0.8)],0.025),edBar([-1.1,EDE.y+0.45,K.Z(EDE.z0+2.0)],[0.5,EDE.y+0.45,K.Z(EDE.z0+2.0)],0.025));
    g.push(edBox(0.5,0.3,0.36,-0.2,EDE.y+0.05,K.Z(EDE.z0-0.45))); return g; },
  lab:K=>[["قضبان التوزيع (Bus bars)","Bus bars",[-0.3,EDE.y+0.55,K.Z(EDE.z0+0.6)]],["وحدة التحكم بالمولّد (GCU)","Generator control unit",[-0.2,EDE.y+0.3,K.Z(EDE.z0-0.45)]]]};
ED.ext_power_recept={layer:"ext",mk:"eddark",
  geo:K=>{ const X=5.5, y=K.zc(X)-0.6, hw=K.half(X,y); return [edBox(0.03,0.34,0.5,hw,y,K.Z(X)),edCyl(0.09,0.04,"x",hw+0.03,y,K.Z(X)-0.1),edCyl(0.09,0.04,"x",hw+0.03,y,K.Z(X)+0.1)]; },
  lab:K=>{ const X=5.5, y=K.zc(X)-0.6, hw=K.half(X,y); return [["مأخذ الطاقة الأرضية","External power receptacle",[hw,y+0.35,K.Z(X)]]]; }};

/* =====================================================================  pressurisation valves (items 38, 48) */
ED.neg_relief_valve={layer:"ext",mk:"edwht",meta:["neg_relief_valve","صمام تخفيف الضغط السالب","Negative pressure relief valve","ATA 21","sys","fuse_aft",["F",0.78,"r",-0.2],
  "لوح دوّار بسيط يفتح للداخل إذا صار ضغط الخارج أعلى من داخل الكابينة، حتى لا يتعرض الهيكل لضغط معكوس.",[["Hinged flap","لوح مفصلي"],["Seal","حشوة"],["Frame","إطار"]],[["boltnut","مسامير"]],["نظافة الحشوة","حرية حركة اللوح"]],
  geo:K=>{ const X=31.2, y=K.zc(X)-0.2, hw=K.half(X,y); return [edBox(0.03,0.26,0.5,hw,y,K.Z(X)),edBox(0.04,0.2,0.42,hw+0.015,y,K.Z(X))]; },
  lab:K=>{ const X=31.2, y=K.zc(X)-0.2, hw=K.half(X,y); return [["صمام الضغط السالب","Negative relief valve",[hw,y+0.3,K.Z(X)]]]; }};
ED.safety_relief_valve={layer:"ext",mk:"edwht",
  geo:K=>{ const X=30.0, y=K.zc(X)-0.5, hw=K.half(X,y); return [edBox(0.03,0.34,0.62,hw,y,K.Z(X)),edBox(0.04,0.26,0.52,hw+0.015,y,K.Z(X))]; },
  lab:K=>{ const X=30.0, y=K.zc(X)-0.5, hw=K.half(X,y); return [["صمام أمان الضغط الموجب","Positive pressure relief valve",[hw,y+0.35,K.Z(X)]]]; }};
ED.outflow_valve={layer:"ext",mk:"eddark",
  geo:K=>{ const X=29.4, y=K.bot(X); return [edBox(0.6,0.04,0.36,0.0,y,K.Z(X)),edBox(0.46,0.03,0.26,0.0,y-0.03,K.Z(X))]; },
  lab:K=>{ const X=29.4; return [["صمام تصريف هواء الكابينة","Outflow valve",[0,K.bot(X)-0.3,K.Z(X)]]]; }};

/* =====================================================================  landing gear details (items 4, 19, 21, 41, 42, 54) */
const EDG={x:2.8,X:18,wr:0.5};
ED.wheel_brake={gearDep:true,layer:"int",mk:"edmet",both:true,
  geo:K=>{ const g=[]; [-0.28,0.28].forEach(dx=>{ const x=EDG.x+dx, z=K.Z(EDG.X);
      for(let i=0;i<5;i++){ g.push(edCyl(i%2?0.2:0.28,0.028,"x",x-0.1+i*0.05,EDG.wr,z)); }            /* rotors and stators */
      g.push(edCyl(0.1,0.34,"x",x,EDG.wr,z));                                                      /* torque tube */
      g.push(edCyl(0.3,0.045,"x",x+0.16,EDG.wr,z));                                                /* pressure plate */
      for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; g.push(edCyl(0.035,0.1,"x",x+0.22,EDG.wr+Math.sin(a)*0.2,z+Math.cos(a)*0.2)); } });   /* pistons */
    return g; },
  lab:K=>[["كتلة الفرامل (قرص ثابت ومتحرك)","Brake stack (stators and rotors)",[EDG.x-0.28,EDG.wr+0.4,K.Z(EDG.X)]],["الأمكنة الهيدروليكية (المكابس)","Pistons",[EDG.x+0.28,EDG.wr+0.3,K.Z(EDG.X)-0.2]],["الأنبوب العازم للدوران","Torque tube",[EDG.x,EDG.wr-0.35,K.Z(EDG.X)]]]};
ED.gear_shock_strut={gearDep:true,layer:"int",mk:"edblu",both:true,
  geo:K=>{ const x=EDG.x, z=K.Z(EDG.X), g=[]; g.push(edCyl(0.08,0.55,"y",x,1.15,z)); g.push(edCyl(0.05,0.5,"y",x,0.78,z));       /* piston rod inside the cylinder */
    g.push(edCyl(0.1,0.03,"y",x,0.98,z)); g.push(edCyl(0.085,0.1,"y",x,1.28,z));                                               /* orifice plate and gas chamber */
    g.push(edBox(0.22,0.06,0.06,x,0.7,z+0.03)); g.push(edBox(0.2,0.05,0.2,x,1.43,z)); return g; },
  lab:K=>{ const x=EDG.x, z=K.Z(EDG.X); return [["الأسطوانة الخارجية","Outer cylinder",[x,1.4,z]],["ثقب التحكم بالسائل","Orifice",[x,0.98,z]],["غرفة الغاز (نيتروجين)","Gas chamber",[x,1.28,z]],["قضيب المكبس","Piston rod",[x,0.7,z]]]; }};
ED.gear_drag_brace={gearDep:true,layer:"ext",mk:"edmet",both:true,
  geo:K=>{ const x=EDG.x, z=K.Z(EDG.X), g=[];
    g.push(edBar([x-0.7,1.55,z-0.2],[x-0.02,1.05,z+0.02],0.045));                               /* side brace */
    g.push(edBar([x-0.7,1.55,z-0.2],[x-0.35,1.38,z+0.02],0.05));
    g.push(edBar([x-0.05,1.5,z-0.9],[x,1.15,z-0.05],0.05));                                      /* drag brace */
    g.push(edBar([x,0.88,z+0.0],[x,0.68,z+0.06],0.04)); g.push(edBar([x,0.88,z+0.0],[x,0.68,z-0.06],0.04));   /* torsion links */
    g.push(edBox(0.1,0.06,0.1,x-0.35,1.38,z+0.02)); return g; },
  lab:K=>{ const x=EDG.x, z=K.Z(EDG.X); return [["الساق الجانبية (Side brace)","Side brace",[x-0.7,1.6,z-0.2]],["قفل الساق (Down-lock)","Down-lock",[x-0.35,1.45,z+0.02]],["ساق السحب (Drag brace)","Drag brace",[x,1.55,z-0.9]],["وصلة العزم (Torsion link)","Torsion link",[x+0.1,0.78,z]]]; }};
ED.gear_doors={gearDep:true,layer:"ext",mk:"edwht",both:true,
  geo:K=>{ const z=K.Z(EDG.X), y=K.bot(EDG.X)-0.02, g=[]; g.push(edBox(0.8,0.03,2.2,1.4,y+0.04,z-0.2)); g.push(edBox(0.03,0.62,1.1,3.3,1.0,z-0.1)); g.push(edBox(0.03,0.5,0.7,3.25,0.85,z+0.9)); return g; },
  lab:K=>{ const z=K.Z(EDG.X); return [["باب حجرة العجلات الداخلي","Inner wheel-well door",[1.4,K.bot(EDG.X)+0.1,z-0.2]],["باب الساق الخارجي","Strut door",[3.3,1.3,z-0.1]]]; }};
ED.wheel_fuse_plug={gearDep:true,layer:"ext",mk:"edred",both:true,
  geo:K=>{ const g=[], z=K.Z(EDG.X); [-0.28,0.28].forEach(dx=>{ for(let i=0;i<3;i++){ const a=i/3*Math.PI*2+0.4; g.push(edCyl(0.028,0.05,"x",EDG.x+dx+0.24,EDG.wr+Math.sin(a)*0.22,z+Math.cos(a)*0.22)); } }); return g; },
  lab:K=>[["سدادات الانصهار الحراري","Thermal fuse plugs",[EDG.x+0.28+0.25,EDG.wr+0.22,K.Z(EDG.X)]]]};

/* =====================================================================  engine accessories (items 7, 22, 49) */
const EDN={x:4.95,y:1.87,z0:-4.0};   /* (v24) the engine axis of the matched 737 */
ED.idg={layer:"int",mk:"edgrn",both:true,
  geo:K=>[edCyl(0.2,0.42,"z",EDN.x-0.62,EDN.y-0.5,EDN.z0),edCyl(0.13,0.2,"z",EDN.x-0.62,EDN.y-0.5,EDN.z0-0.3),edBox(0.1,0.1,0.1,EDN.x-0.45,EDN.y-0.42,EDN.z0+0.1)],
  lab:K=>[["المولّد المتكامل (IDG)","Integrated drive generator",[EDN.x-0.62,EDN.y-0.75,EDN.z0]]]};
ED.eng_gearbox={layer:"int",mk:"edmet",both:true,
  geo:K=>[edBox(0.5,0.24,1.0,EDN.x,EDN.y-0.6,EDN.z0-0.1),edCyl(0.05,0.5,"y",EDN.x,EDN.y-0.35,EDN.z0-0.4)],
  lab:K=>[["علبة تروس الملحقات","Accessory gearbox",[EDN.x+0.1,EDN.y-0.8,EDN.z0-0.1]]]};
ED.eng_starter={layer:"int",mk:"edyel",both:true,
  geo:K=>[edCyl(0.14,0.3,"z",EDN.x+0.5,EDN.y-0.5,EDN.z0-0.35)],
  lab:K=>[["بادئ الهواء","Air starter",[EDN.x+0.5,EDN.y-0.75,EDN.z0-0.35]]]};
ED.eng_oil_tank={layer:"int",mk:"edblu",both:true,
  geo:K=>[edCyl(0.2,0.5,"z",EDN.x+0.62,EDN.y-0.15,EDN.z0+0.05)],
  lab:K=>[["خزان الزيت","Oil tank",[EDN.x+0.62,EDN.y-0.45,EDN.z0+0.05]]]};
ED.eng_fuel_pump={layer:"int",mk:"edred",both:true,
  geo:K=>[edBox(0.28,0.22,0.36,EDN.x+0.28,EDN.y-0.62,EDN.z0+0.45),edCyl(0.05,0.3,"z",EDN.x+0.28,EDN.y-0.45,EDN.z0+0.9)],
  lab:K=>[["مضخة الوقود ووحدة القياس","Fuel pump and metering unit",[EDN.x+0.28,EDN.y-0.85,EDN.z0+0.45]]]};
ED.hyd_edp={layer:"int",mk:"edgld",both:true,
  geo:K=>[edCyl(0.12,0.34,"z",EDN.x-0.25,EDN.y-0.66,EDN.z0+0.35)],
  lab:K=>[["مضخة هيدروليكية يديرها المحرك","Engine-driven hydraulic pump",[EDN.x-0.25,EDN.y-0.9,EDN.z0+0.35]]]};
ED.eng_bleed_valve={layer:"int",mk:"edgld",both:true,
  geo:K=>{ const x=EDN.x, z=EDN.z0-0.6; return [edCyl(0.1,0.3,"y",x+0.2,EDN.y+0.45,z),edCyl(0.07,0.38,"x",x+0.2,EDN.y+0.5,z),edBox(0.2,0.12,0.2,x+0.2,EDN.y+0.66,z),edCyl(0.14,0.06,"y",x+0.2,EDN.y+0.3,z)]; },
  lab:K=>{ const x=EDN.x, z=EDN.z0-0.6; return [["صمام تنظيم وإغلاق هواء السحب (PRSOV)","Pressure regulating & shut-off valve",[x+0.2,EDN.y+0.82,z]],["المشغِّل الهوائي","Pneumatic actuator",[x+0.45,EDN.y+0.5,z]]]; }};

/* =====================================================================  fuel tanks (item 46) */
ED.fuel_center_tank={layer:"int",mk:"edblu",
  geo:K=>{ const Z=K.Z, y=1.7; return [edBox(2.8,0.7,3.3,0,y,Z(17.0))]; },
  lab:K=>[["الخزان المركزي","Center tank",[0,2.15,K.Z(17.0)]]]};
ED.fuel_wing_tank={layer:"int",mk:"edblu",both:true,meta:["fuel_wing_tank","خزانات الجناح (الداخلي والخارجي)","Wing tanks (inner and outer)","ATA 28","fuel","fuel",["W",0.45,0.4,0],
  "الجناح نفسه هو الخزان: الحيّز بين العمودين الأمامي والخلفي مقسّم بالأضلاع إلى خزان داخلي كبير وخزان خارجي أصغر.",[["Inner tank","الخزان الداخلي"],["Outer tank","الخزان الخارجي"],["Baffle rib","ضلع حاجز"]],[["boltnut","مسامير"]],["تسريب الوقود","مسبار الكمية"],{int:true}],
  geo:K=>[lsRegion(K.W,0.05,0.62,0.17,0.62,0,10,6),lsRegion(K.W,0.64,0.93,0.17,0.62,0,6,6)],
  lab:K=>{ const a=edWp(K.W,0.3,0.4,0), b=edWp(K.W,0.8,0.4,0); return [["الخزان الداخلي","Inner tank",[a.x,a.y+0.3,a.z]],["الخزان الخارجي","Outer tank",[b.x,b.y+0.3,b.z]]]; }};
ED.fuel_surge_tank={layer:"int",mk:"edyel",both:true,
  geo:K=>[lsRegion(K.W,0.94,0.99,0.2,0.6,0,4,4)],
  lab:K=>{ const p=edWp(K.W,0.96,0.4,0); return [["خزان التنفيس (Surge tank)","Surge tank",[p.x,p.y+0.35,p.z]]]; }};

/* =====================================================================  wing structure and tracks (items 24, 26, 29, 30, 43, 44) */
ED.wing_front_spar={layer:"int",mk:"edblu",both:true,geo:K=>edSpar(K.W,0.17,0.03,0.96,14),
  lab:K=>{ const p=edWp(K.W,0.5,0.17,0), q=edWp(K.W,0.15,0.17,0); return [["العمود الأمامي (Front spar)","Front spar",[p.x,p.y+0.3,p.z]],["الشفة العلوية","Upper flange",[q.x,q.y+0.5,q.z]]]; }};
ED.wing_rear_spar={layer:"int",mk:"edgrn",both:true,geo:K=>edSpar(K.W,0.66,0.03,0.96,14),
  lab:K=>{ const p=edWp(K.W,0.5,0.66,0); return [["العمود الخلفي (Rear spar)","Rear spar",[p.x,p.y+0.3,p.z]]]; }};
ED.wing_ribs={layer:"int",mk:"edyel",both:true,
  geo:K=>{ const g=[]; for(let i=0;i<=16;i++){ g.push(edRib(K.W,0.04+i*0.0575,0.17,0.66)); } return g; },
  lab:K=>{ const a=edWp(K.W,0.30,0.4,0), b=edWp(K.W,0.7,0.4,0); return [["ضلع (Rib)","Rib",[a.x,a.y+0.45,a.z]],["ضلع طرفي","Outer rib",[b.x,b.y+0.45,b.z]]]; }};
ED.wing_skin_panels={layer:"int",mk:"edcrm",both:true,
  geo:K=>{ const g=[]; for(let i=0;i<7;i++){ const f=0.2+i*0.07; for(let j=0;j<2;j++){ const k=j?-0.97:0.97; const pts=[]; for(let u=0.05;u<=0.95;u+=0.06) pts.push(edWp(K.W,u,f,k)); for(let m=0;m<pts.length-1;m++) g.push(edBar(pts[m].toArray(),pts[m+1].toArray(),0.02)); } } return g; },
  lab:K=>{ const p=edWp(K.W,0.45,0.35,1); return [["الفرّادات (Stringers) تحت الجلد","Stringers under the skin",[p.x,p.y+0.35,p.z]]]; }};
ED.slat_tracks={layer:"ext",mk:"edmet",both:true,
  geo:K=>{ const g=[]; [0.2,0.32,0.45,0.58,0.7,0.82].forEach(u=>{ const a=edWp(K.W,u,0.17,-0.9), b=edWp(K.W,u,0.02,-0.6); g.push(edBar(a.toArray(),b.toArray(),0.035)); const c=edWp(K.W,u+0.03,0.17,-0.85), d=edWp(K.W,u+0.03,0.03,-0.55); g.push(edBar(c.toArray(),d.toArray(),0.02)); }); return g; },
  lab:K=>{ const a=edWp(K.W,0.45,0.1,-0.8), b=edWp(K.W,0.48,0.1,-0.8); return [["المسار الرئيسي للشريحة","Slat main track",[a.x,a.y-0.35,a.z]],["المسار المساعد","Auxiliary track",[b.x,b.y-0.1,b.z-0.3]]]; }};
ED.flap_track_fairing={layer:"ext",mk:"edwht",both:true,
  geo:K=>{ const g=[]; [0.22,0.42,0.62].forEach(u=>{ const p=edWp(K.W,0.82,u<0.3?u:u,-1); const q=edWp(K.W,0.82+0.0,u,-1); g.push(edSph(1,q.x,q.y-0.12,q.z+0.45,0.11,0.12,0.95)); }); return g; },
  lab:K=>{ const q=edWp(K.W,0.42,0.82,-1); return [["غطاء مسار الفلاب","Flap track fairing",[q.x,q.y-0.35,q.z+0.45]]]; }};
ED.flap_actuators={layer:"int",mk:"edgld",both:true,
  geo:K=>{ const g=[]; [0.22,0.42,0.62].forEach(u=>{ const a=edWp(K.W,u,0.7,-0.7), b=edWp(K.W,u,0.9,-1); g.push(edBar(a.toArray(),b.toArray(),0.035)); g.push(edBox(0.16,0.1,0.22,a.x,a.y,a.z)); g.push(edBar([b.x,b.y,b.z],[b.x,b.y-0.14,b.z+0.5],0.03)); }); return g; },
  lab:K=>{ const a=edWp(K.W,0.42,0.7,-0.7); return [["رافعة الفلاب (القابض الدوّار)","Flap drive actuator",[a.x,a.y-0.3,a.z]],["ذراع التوصيل","Flap link arm",[a.x,a.y-0.5,a.z+0.5]]]; }};
ED.jb_krueger={layer:"ext",mk:"edwht",both:true,
  geo:K=>{ const g=[]; [[0.045,0.1],[0.1,0.16]].forEach(([u0,u1])=>{ g.push(lsRegion(K.W,u0,u1,0,0.1,0.02,3,4)); }); return g; },
  lab:K=>{ const p=edWp(K.W,0.1,0.04,-0.8); return [["شريحة كروجر (Krueger flap)","Krueger flap",[p.x,p.y-0.4,p.z]]]; }};

/* =====================================================================  aft pressure bulkhead (item 36) */
ED.press_bulkhead_aft={layer:"int",mk:"edcrm",
  geo:K=>{ const Z=K.Z, X=30.6, r=K.ring(X), y=r.zc, rx=r.hw*0.97, ry=r.hh*0.97, g=[edDisc(rx,ry,0.1,0,y,Z(X)),edTor(1,0.04,"z",0,0,0).scale(rx,ry,1).translate(0,y,Z(X))];
    for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; g.push(edBar([0,y,Z(X)+0.06],[Math.cos(a)*rx*0.95,y+Math.sin(a)*ry*0.95,Z(X)+0.06],0.03)); } return g; },
  lab:K=>{ const Z=K.Z, X=30.6, r=K.ring(X); return [["الحاجز الضاغط الخلفي","Aft pressure bulkhead",[r.hw*0.6,r.zc+r.hh*0.4,Z(X)]],["أضلاع التقوية","Stiffeners",[-r.hw*0.5,r.zc-r.hh*0.4,Z(X)+0.1]]]; }};

/* =====================================================================  exterior lights (item 11) */
Object.assign(SPEC,{edlamp:{c:"#FFF4D6",r:.2,m:0,e:"#FFE9B0"},edlampR:{c:"#FF4A3A",r:.2,m:0,e:"#FF2A1A"},edlampG:{c:"#3CE078",r:.2,m:0,e:"#22C060"}});
ED.light_taxi={layer:"ext",mk:"edlamp",geo:K=>[edSph(0.09,0,1.3,K.Z(5.0)-0.2,1,1,0.7)],lab:K=>[["ضوء التاكسي","Taxi light",[0,1.0,K.Z(5.0)-0.2]]]};
ED.light_landing={layer:"ext",mk:"edlamp",both:true,geo:K=>{ const p=edWp(K.W,0.04,0.02,-1); return [edSph(0.11,p.x,p.y-0.02,p.z,1.2,0.5,1)]; },lab:K=>{ const p=edWp(K.W,0.04,0.02,-1); return [["ضوء الهبوط","Landing light",[p.x,p.y-0.3,p.z]]]; }};
ED.light_wing_scan={layer:"ext",mk:"edlamp",both:true,geo:K=>{ const X=14.4, y=K.zc(X)+0.55, hw=K.half(X,y); return [edSph(0.07,hw,y,K.Z(X),0.5,1,1)]; },lab:K=>{ const X=14.4, y=K.zc(X)+0.55, hw=K.half(X,y); return [["ضوء فحص الجناح","Wing inspection light",[hw,y+0.3,K.Z(X)]]]; }};
ED.light_beacon={layer:"ext",mk:"edlampR",geo:K=>[edSph(0.13,0,K.top(18.2)+0.03,K.Z(18.2),1.4,0.6,1.4),edSph(0.13,0,K.bot(18.2)-0.03,K.Z(18.2),1.4,0.6,1.4)],lab:K=>[["ضوء التنبيه العلوي","Upper beacon",[0,K.top(18.2)+0.4,K.Z(18.2)]],["ضوء التنبيه السفلي","Lower beacon",[0,K.bot(18.2)-0.4,K.Z(18.2)]]]};
ED.light_nav_right={layer:"ext",mk:"edlampG",geo:K=>{ const p=edWp(K.W,1,0.5,0); return [edSph(0.09,p.x,p.y,p.z,1,1,1.4)]; },lab:K=>{ const p=edWp(K.W,1,0.5,0); return [["ضوء الملاحة (أخضر)","Green navigation light",[p.x,p.y+0.4,p.z]]]; }};
ED.light_nav_left={layer:"ext",mk:"edlampR",geo:K=>{ const p=edWp(K.W,1,0.5,0); return [edSph(0.09,-p.x,p.y,p.z,1,1,1.4)]; },lab:K=>{ const p=edWp(K.W,1,0.5,0); return [["ضوء الملاحة (أحمر)","Red navigation light",[-p.x,p.y+0.4,p.z]]]; }};
ED.light_strobe={layer:"ext",mk:"edlamp",both:true,geo:K=>{ const p=edWp(K.W,1,0.98,0); return [edSph(0.08,p.x,p.y,p.z+0.08,1,1,1.2)]; },lab:K=>{ const p=edWp(K.W,1,0.98,0); return [["ضوء الوميض الأبيض","White strobe light",[p.x,p.y+0.4,p.z+0.1]]]; }};
ED.light_tail={layer:"ext",mk:"edlamp",geo:K=>[edSph(0.1,0,K.zc(39.3)+0.05,K.Z(39.3)+0.12,1,1,1)],lab:K=>[["ضوء الذيل","Tail light",[0,K.zc(39.3)+0.4,K.Z(39.3)]]]};
ED.light_logo={layer:"ext",mk:"edlamp",both:true,geo:K=>{ const p=edWp(K.H,0.9,0.4,-1); return [edSph(0.07,p.x,p.y-0.04,p.z,1.3,0.6,1)]; },lab:K=>{ const p=edWp(K.H,0.9,0.4,-1); return [["ضوء الشعار على الذيل","Logo light",[p.x,p.y-0.4,p.z]]]; }};

edFinish();
