/* ---------- (ed) batch 4: cabin seat zones, fan blades, engine core stages, electrical extras, air-data modules. See m_ed737.js. ---------- */
/* ---- cabin seat zones (item 45): the same rows as the cabin, split by zone like a seat map ---- */
function edSeatRows(K){ const c=K.c, M=VW_CAB.b737.main, zf=ringAt(c,(M.x[0]+M.x[1])/2*c.L).zb+M.zf, rows=vwRowsX(c,M); return {c,M,zf,rows}; }
function edSeatZone(K,pick){ const S=edSeatRows(K), out=[]; vwSeatGeos(S.c,S.M,S.rows.filter(pick),S.zf,out); return out; }
const edExitX=X=>Math.abs(X-16.6)<1.7;
ED.seat_zone_front={layer:"int",mk:"edblu",meta:["seat_zone_front","المقاعد الأمامية","Front rows","ATA 25","sys","fuse_mid",["F",0.2,"c",0.2],
  "أول صفوف الكابينة قرب المطبخ الأمامي وباب الركاب. غالباً تُخصَّص لدرجة أعلى أو لمن يريد النزول أول.",[["Seat","المقعد"],["Seat track","سكة المقعد"]],[["boltnut","مسامير"]],["تثبيت المقاعد","سلامة الأحزمة"],{int:true,only:"b737"}],
  geo:K=>edSeatZone(K,X=>X<12.5),
  lab:K=>{ const S=edSeatRows(K), X=S.rows.find(x=>x<12.5); return [["المقاعد الأمامية","Front rows",[0,S.zf+1.5,K.Z(X||8)]]]; }};
ED.seat_zone_exit={layer:"int",mk:"edred",meta:["seat_zone_exit","صفوف مخرج الطوارئ","Exit rows (extra legroom)","ATA 25","sys","fuse_mid",["F",0.42,"c",0.2],
  "الصفوف عند مخارج الطوارئ فوق الجناح. فيها مسافة أوسع للأرجل لأن من يجلس فيها يساعد عند الإخلاء.",[["Seat","المقعد"],["Overwing exit","مخرج فوق الجناح"]],[["boltnut","مسامير"]],["تثبيت المقاعد","وضوح مسار المخرج"],{int:true,only:"b737"}],
  geo:K=>edSeatZone(K,edExitX),
  lab:K=>{ const S=edSeatRows(K); return [["صفوف المخرج (مساحة أكبر)","Exit rows (extra legroom)",[0,S.zf+1.5,K.Z(16.6)]]]; }};
ED.seat_zone_std={layer:"int",mk:"edgrn",meta:["seat_zone_std","الصفوف العادية","Standard rows","ATA 25","sys","fuse_mid",["F",0.62,"c",0.2],
  "بقية صفوف الكابينة، ثلاثة مقاعد على كل جانب من الممر، وتمتد حتى المطبخ والمراحيض الخلفية.",[["Seat","المقعد"],["Aisle","الممر"]],[["boltnut","مسامير"]],["تثبيت المقاعد","سلامة الأحزمة"],{int:true,only:"b737"}],
  geo:K=>edSeatZone(K,X=>X>=12.5&&!edExitX(X)),
  lab:K=>{ const S=edSeatRows(K), X=S.rows.filter(x=>x>=12.5&&!edExitX(x)); return [["الصفوف العادية","Standard rows",[0,S.zf+1.5,K.Z(X[X.length>>1]||24)]]]; }};

/* ---- fan blades and the engine core stages (items 7, 31, 47) ---- */
function edStack(x,y,z0,z1,rA,rB,n,t){ const g=[]; for(let i=0;i<n;i++){ const f=n>1?i/(n-1):0; g.push(edCyl(rA+(rB-rA)*f,t,"z",x,y,z0+(z1-z0)*f)); } return g; }
ED.eng_fan_blades={layer:"int",mk:"edmet",both:true,
  geo:K=>{ const g=[], z=-5.35, R=1.0, n=22;
    for(let i=0;i<n;i++){ const a=i/n*Math.PI*2, dx=Math.cos(a), dy=Math.sin(a), tx=-dy, ty=dx, pairs=[];
      for(let k=0;k<=8;k++){ const r=0.26+(R-0.26)*k/8, ch=0.11+0.2*(k/8), th=0.95-1.05*(k/8), ax=Math.cos(th)*ch/2, tg=Math.sin(th)*ch/2;
        pairs.push([edV(EDN.x+dx*r+tx*tg,EDN.y+dy*r+ty*tg,z-ax),edV(EDN.x+dx*r-tx*tg,EDN.y+dy*r-ty*tg,z+ax)]); }
      g.push(edStrip(pairs)); }
    g.push(edTor(0.64,0.018,"z",EDN.x,EDN.y,z)); g.push(edCyl(0.3,0.06,"z",EDN.x,EDN.y,z+0.06));      /* mid-span shroud and the rotor disc */
    return g; },
  lab:K=>[["شفرة المروحة (ملتوية)","Fan blade (twisted)",[EDN.x+0.7,EDN.y+0.7,-5.35]],["حلقة التثبيت في منتصف الشفرة","Part-span shroud",[EDN.x-0.45,EDN.y+0.45,-5.35]]]};
ED.eng_lp_compressor={layer:"int",mk:"edblu",both:true,
  geo:K=>edStack(EDN.x,EDN.y,-4.7,-4.15,0.44,0.34,4,0.04).concat([edCyl(0.1,0.7,"z",EDN.x,EDN.y,-4.4)]),
  lab:K=>[["ضاغط الضغط المنخفض (4 مراحل)","Low-pressure compressor (4 stages)",[EDN.x+0.4,EDN.y+0.4,-4.45]]]};
ED.eng_hp_compressor={layer:"int",mk:"edgrn",both:true,
  geo:K=>edStack(EDN.x,EDN.y,-4.05,-3.25,0.32,0.2,9,0.035).concat([edCyl(0.07,0.9,"z",EDN.x,EDN.y,-3.65)]),
  lab:K=>[["ضاغط الضغط العالي (9 مراحل)","High-pressure compressor (9 stages)",[EDN.x+0.35,EDN.y+0.35,-3.65]]]};
ED.eng_combustor={layer:"int",mk:"edred",both:true,
  geo:K=>{ const g=[edTor(0.27,0.1,"z",EDN.x,EDN.y,-3.0)]; for(let i=0;i<20;i++){ const a=i/20*Math.PI*2; g.push(edCyl(0.012,0.12,"z",EDN.x+Math.cos(a)*0.27,EDN.y+Math.sin(a)*0.27,-3.17)); } return g; },
  lab:K=>[["حجرة الاحتراق الحلقية","Annular combustor",[EDN.x+0.35,EDN.y+0.35,-3.0]],["حاقنات الوقود (20)","Fuel nozzles (20)",[EDN.x-0.3,EDN.y+0.3,-3.17]]]};
ED.eng_hp_turbine={layer:"int",mk:"edyel",both:true,
  geo:K=>edStack(EDN.x,EDN.y,-2.75,-2.55,0.3,0.32,2,0.05),
  lab:K=>[["توربين الضغط العالي (مرحلتان)","High-pressure turbine (2 stages)",[EDN.x+0.3,EDN.y+0.3,-2.65]]]};
ED.eng_lp_turbine={layer:"int",mk:"edgld",both:true,
  geo:K=>edStack(EDN.x,EDN.y,-2.45,-1.85,0.34,0.5,4,0.045).concat([edCyl(0.07,0.7,"z",EDN.x,EDN.y,-2.15)]),
  lab:K=>[["توربين الضغط المنخفض (4 مراحل)","Low-pressure turbine (4 stages)",[EDN.x+0.4,EDN.y+0.4,-2.15]]]};

/* ---- electrical extras (item 10) ---- */
ED.load_panel={layer:"int",mk:"eddark",meta:["load_panel","لوحة توزيع الأحمال وقواطع الدوائر","Load distribution panel and circuit breakers","ATA 24","sys","avionics",["F",0.2,"c",0.0],
  "لوحة تتفرع منها الكهرباء إلى كل جهاز، وفي كل فرع قاطع يفصل الدائرة تلقائياً عند الحمل الزائد.",[["Bus panel","لوحة الناقل"],["Circuit breaker","قاطع الدائرة"]],[["boltnut","مسامير"]],["القواطع المنفصلة","الحرارة"],{int:true}],
  geo:K=>{ const g=[edBox(0.9,0.5,0.1,-0.4,2.15,K.Z(6.6))]; for(let i=0;i<4;i++) for(let j=0;j<8;j++) g.push(edCyl(0.022,0.05,"z",-0.75+j*0.1,2.0+i*0.1,K.Z(6.6)-0.07)); return g; },
  lab:K=>[["لوحة التوزيع","Load distribution panel",[-0.4,2.5,K.Z(6.6)]],["قواطع الدوائر","Circuit breakers",[-0.4,2.0,K.Z(6.6)-0.1]]]};
ED.emerg_battery={layer:"int",mk:"edyel",meta:["emerg_battery","بطارية الطوارئ","Emergency power battery","ATA 24","sys","avionics",["F",0.2,"c",0.0],
  "بطارية صغيرة تغذي الإنارة الطارئة وبعض الأجهزة الضرورية لو فُقدت كل مصادر الكهرباء.",[["Battery cells","خلايا البطارية"],["Charger","الشاحن"]],[["boltnut","مسامير"]],["الشحن","الحرارة"],{int:true}],
  geo:K=>[edBox(0.4,0.22,0.3,0.3,EDE.y-0.05,K.Z(EDE.z0+2.6)),edBox(0.34,0.04,0.24,0.3,EDE.y+0.08,K.Z(EDE.z0+2.6))],
  lab:K=>[["بطارية الطوارئ","Emergency battery",[0.3,EDE.y+0.3,K.Z(EDE.z0+2.6)]]]};
ED.bus_tie={layer:"int",mk:"edred",meta:["bus_tie","موصِّل ربط النواقل (Bus tie)","Bus tie contactor","ATA 24","sys","avionics",["F",0.2,"c",0.0],
  "مفتاح كهربائي قوي يربط ناقلي التوزيع ببعض، فيبقى الناقل مغذّى لو تعطل أحد المولّدات.",[["Contactor","الموصِّل"],["Coil","الملف"]],[["boltnut","مسامير"]],["نقاط التلامس","الحرارة"],{int:true}],
  geo:K=>[edBox(0.28,0.24,0.26,0,EDE.y+0.1,K.Z(EDE.z0+2.2)),edBar([-0.6,EDE.y+0.45,K.Z(EDE.z0+2.2)],[0,EDE.y+0.22,K.Z(EDE.z0+2.2)],0.02),edBar([0,EDE.y+0.22,K.Z(EDE.z0+2.2)],[0.5,EDE.y+0.45,K.Z(EDE.z0+2.2)],0.02)],
  lab:K=>[["موصِّل ربط النواقل","Bus tie contactor",[0,EDE.y+0.4,K.Z(EDE.z0+2.2)]]]};
ED.adm={layer:"int",mk:"edblu",meta:["adm","وحدات بيانات الهواء (ADM)","Air data modules (ADM)","ATA 34","sys","avionics",["F",0.1,"c",0.0],
  "وحدات صغيرة تحوّل ضغط بيتو والضغط الساكن إلى إشارات رقمية ترسلها لحواسيب الطيران.",[["Pressure sensor","مستشعر ضغط"],["Pitot line","خط بيتو"],["Static line","خط الضغط الساكن"]],[["boltnut","مسامير"]],["الوصلات","التسرب"],{int:true}],
  geo:K=>{ const g=[], Z=K.Z; [[-0.9,3.1,4.2],[0.9,3.1,4.2],[-0.7,3.1,6.0],[0.7,3.1,6.0]].forEach(m=>{ g.push(edBox(0.18,0.14,0.22,m[0],m[1],Z(m[2]))); }); g.push(edBar([-1.2,3.1,Z(4.4)],[-0.9,3.1,Z(4.2)],0.012),edBar([1.2,3.1,Z(4.4)],[0.9,3.1,Z(4.2)],0.012),edBar([-0.9,3.1,Z(4.2)],[-0.7,3.1,Z(6.0)],0.012),edBar([0.9,3.1,Z(4.2)],[0.7,3.1,Z(6.0)],0.012)); return g; },
  lab:K=>[["وحدة بيانات الهواء (كابتن)","Air data module (captain)",[-0.9,3.35,K.Z(4.2)]],["وحدة بيانات الهواء (مساعد)","Air data module (first officer)",[0.9,3.35,K.Z(4.2)]]]};
/* explode (items 28, 32): the detailed parts spread out from their parent, so the exploded aircraft shows its components like the manual's exploded views (engine stages along the axis, wing members apart, interior blocks lifted) */
Object.assign(EXP,{eng_fan_blades:[0,0,-0.05],eng_lp_compressor:[0,0,-0.03],eng_hp_compressor:[0,0,-0.012],eng_combustor:[0,0,0.01],eng_hp_turbine:[0,0,0.03],eng_lp_turbine:[0,0,0.055],
  idg:[-0.03,-0.03,0],eng_gearbox:[0,-0.04,0],eng_starter:[0.03,-0.03,0],eng_oil_tank:[0.04,0,0],eng_fuel_pump:[0.03,-0.04,0],hyd_edp:[-0.02,-0.05,0],eng_bleed_valve:[0.02,0.04,0],
  wing_front_spar:[0,0.012,-0.03],wing_rear_spar:[0,0.012,0.03],wing_ribs:[0,0.045,0],wing_skin_panels:[0,0.08,0],fuel_wing_tank:[0,-0.035,0],fuel_surge_tank:[0.03,-0.02,0],
  seat_zone_front:[0,0.05,-0.02],seat_zone_exit:[0,0.05,0],seat_zone_std:[0,0.05,0.02],apu_gen:[0,0,0.05],oxygen_crew:[0,-0.04,-0.02],batt_main:[0,-0.04,0],tru:[0,-0.04,0],gcu_bus:[0,-0.03,0],keel_beam:[0,-0.05,0],
  wheel_brake:[0,-0.03,0],gear_shock_strut:[0,-0.02,0],press_bulkhead_fwd:[0,0,-0.05],press_bulkhead_aft:[0,0,0.05],wx_radar:[0,0,-0.05]});
edFinish();
