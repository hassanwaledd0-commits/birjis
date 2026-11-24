/* ---------- (ed) part 2, batch A («تعديلات 737 الجزء 2», items 55-68, 80-82, 85, 100, 102): fire protection, ice detector, gear locks, the engine as a set of detailed parts, nacelle sections, engine mounts,
   TAT probe, engine anti-ice and the engine generator. Same rules as m_ed737.js: all shapes drawn from scratch, several colours per part through edC(), names floating on the parts. ---------- */

/* ---- fire protection (55, 56, 60, 61) ---- */
ED.fire_bottle_eng={layer:"int",mk:"edgry",both:true,cam:[Math.PI-0.9,0.9],
  geo:K=>{ const x=EDN.x-0.1, y=1.98, z=-2.6, g=[];
    g.push(...edC("edred",[edSph(0.21,x,y,z)]));
    g.push(...edC("edgld",[edCyl(0.075,0.12,"y",x,y-0.24,z),edCyl(0.05,0.11,"x",x+0.13,y-0.26,z),edTor(0.2,0.012,"y",x,y,z)]));       /* discharge head, outlet port, mounting strap */
    g.push(...edC("edorg",[edCyl(0.035,0.16,"y",x,y-0.37,z),edBox(0.07,0.05,0.07,x,y-0.46,z)]));                                       /* cartridge (squib) and its connector */
    g.push(...edC("edmet",edPipe([[x+0.17,y-0.26,z],[x+0.32,1.72,z-0.15],[x+0.32,1.6,-3.0]],0.025)));                                  /* tube to the core compartment */
    g.push(...edC("edmet",edPipe([[x,y-0.26,z],[x,y-0.35,z-0.5],[x,1.88,-4.2],[x+0.22,1.72,-4.55]],0.025)));                            /* tube to the fan compartment */
    return g; },
  lab:K=>{ const x=EDN.x-0.1, y=1.98, z=-2.6; return [["قارورة الإطفاء (كروية)","Extinguisher bottle",[x,y+0.28,z]],["الخرطوشة المتفجّرة (Squib)","Fire cartridge (squib)",[x,y-0.5,z]],["رأس التفريغ","Discharge head",[x+0.2,y-0.3,z]],["أنبوب إلى حيّز النواة","Tube to the core compartment",[x+0.32,1.66,-2.85]],["أنبوب إلى حيّز المروحة","Tube to the fan compartment",[x+0.1,1.85,-4.3]]]; }};
ED.apu_fire_bottle={layer:"int",mk:"edgry",cam:[Math.PI/2-0.6,0.95],
  geo:K=>{ const y=K.zc(36.6)-0.2, x=0.62, z=K.Z(35.3), g=[];
    g.push(...edC("edred",[edSph(0.18,x,y+0.2,z)]));
    g.push(...edC("edgld",[edCyl(0.07,0.1,"y",x,y-0.02,z),edCyl(0.045,0.16,"x",x+0.1,y-0.05,z),edCyl(0.085,0.03,"y",x,y+0.0,z,6)]));  /* discharge assembly, discharge port, gland nut */
    g.push(...edC("edorg",[edCyl(0.032,0.14,"y",x,y-0.13,z)]));                                                                       /* squib */
    g.push(...edC("edblk",[edBox(0.07,0.05,0.07,x,y-0.22,z),edBox(0.05,0.03,0.09,x-0.09,y-0.1,z)]));                                  /* electrical connector, ground lug */
    g.push(...edC("edmet",edPipe([[x+0.16,y-0.05,z],[x+0.16,y-0.1,z+0.4],[0.2,y-0.05,K.Z(36.6)]],0.022)));                           /* line to the APU */
    return g; },
  lab:K=>{ const y=K.zc(36.6)-0.2, x=0.62, z=K.Z(35.3); return [["قارورة إطفاء الـAPU","APU extinguisher bottle",[x,y+0.5,z]],["غشاء الأمان (Diaphragm)","Diaphragm (burst disc)",[x-0.12,y+0.15,z]],["صمولة الإحكام","Gland nut",[x-0.2,y+0.0,z]],["منفذ التفريغ","Discharge port",[x+0.3,y-0.05,z]],["الخرطوشة (Squib)","Squib",[x+0.1,y-0.2,z]],["الموصّل الكهربائي","Electrical connector",[x+0.2,y-0.28,z]],["وصلة التأريض","Ground lug",[x-0.3,y-0.1,z]]]; }};
ED.eng_fire_loop={layer:"int",mk:"edgry",both:true,
  geo:K=>{ const x=EDN.x, y=EDN.y, g=[];
    [[-3.75,0.55],[-3.15,0.57]].forEach(([z,R])=>g.push(...edC("edblu",[edTor(R,0.014,"z",x,y,z)])));                                  /* loop A: two rings round the core */
    g.push(...edC("edblu",[edBar([x,y+0.55,-3.75],[x,y+0.57,-3.15],0.014),edBar([x,y+0.57,-3.15],[x,y+0.62,-2.3],0.014)]));
    [[-4.3,0.9],[-2.6,0.6]].forEach(([z,R])=>g.push(...edC("edred",[edTor(R,0.014,"z",x,y,z)])));                                      /* loop B: a ring round the fan case and one behind the turbine */
    g.push(...edC("edred",[edBar([x,y-0.9,-4.3],[x,y-0.6,-2.6],0.014)]));
    g.push(...edC("edgld",[edBox(0.16,0.1,0.16,x,1.72,-3.3),edBox(0.1,0.08,0.1,x,y-0.92,-4.3),edBox(0.1,0.08,0.1,x,y-0.64,-2.6)]));   /* junction boxes */
    return g; },
  lab:K=>{ const x=EDN.x, y=EDN.y; return [["الحلقة A (عنصر استشعار)","Loop A (sensing element)",[x+0.55,y+0.2,-3.75]],["الحلقة B (عنصر استشعار)","Loop B (sensing element)",[x+0.9,y,-4.3]],["علبة التوصيل (Junction)","Junction box",[x,1.85,-3.3]]]; }};
ED.cargo_smoke_det={layer:"int",mk:"edwht",
  geo:K=>{ const g=[], Z=K.Z, y=2.3;
    [[10.6,"f"],[27.2,"a"]].forEach(([X,k])=>{ [-1.35,1.35].forEach(x=>{ g.push(...edC("edwht",[edBox(0.2,0.14,0.2,x,y,Z(X)),edCyl(0.07,0.06,"y",x,y-0.1,Z(X))])); g.push(...edC("edblk",[edBox(0.1,0.03,0.1,x,y+0.09,Z(X))])); });
      g.push(...edC("edgld",[edBar([-1.35,y+0.02,Z(X)],[1.35,y+0.02,Z(X)],0.016)]));                                                  /* sampling tube along the ceiling */
      g.push(...edC("edgry",[edBox(0.34,0.22,0.46,0,y+0.14,Z(X)-0.7),edCyl(0.11,0.12,"y",0.2,y+0.3,Z(X)-0.7)]));                         /* plenum and blower */ });
    return g; },
  lab:K=>{ const Z=K.Z, y=2.3; return [["كاشفا الدخان (الشحن الأمامي)","Smoke detectors (forward cargo)",[-1.35,y+0.35,Z(10.6)]],["أنبوب أخذ العيّنات","Sampling tube",[0,y+0.3,Z(10.6)]],["حيّز التجميع والنافخ","Plenum and blower",[0.2,y+0.65,Z(10.6)-0.7]],["كاشفا الدخان (الشحن الخلفي)","Smoke detectors (aft cargo)",[1.35,y+0.35,Z(27.2)]]]; }};
ED.ice_detector={layer:"ext",mk:"edmet",
  geo:K=>{ const X=3.7, y=K.zc(X)+0.15, hw=K.half(X,y), z=K.Z(X), g=[];
    g.push(...edC("edwht",[edCyl(0.085,0.02,"x",hw+0.01,y,z)]));                                                                         /* mounting plate */
    for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; g.push(...edC("edgry",[edCyl(0.01,0.02,"x",hw+0.03,y+Math.sin(a)*0.07,z+Math.cos(a)*0.07)])); }   /* bolts */
    g.push(...edC("edblu",[edCyl(0.055,0.12,"x",hw-0.07,y,z)]));                                                                          /* housing (behind the skin) */
    g.push(...edC("edwht",[edBox(0.1,0.05,0.04,hw+0.07,y,z)]));                                                                           /* strut */
    g.push(...edC("edmet",[edCyl(0.008,0.14,"x",hw+0.2,y,z)]));                                                                           /* vibrating probe */
    return edSc(g,hw,y,z,2.6); },
  lab:K=>{ const X=3.7, y=K.zc(X)+0.15, hw=K.half(X,y), z=K.Z(X), s=(v,a)=>hw+(v-hw)*2.6; return [["المسبار المهتز","Vibrating probe",[s(hw+0.2),y+0.12,z]],["الدعامة (Strut)","Strut",[s(hw+0.07),y+0.15,z]],["صفيحة التثبيت","Mounting plate",[s(hw+0.03),y-0.3,z+0.1]],["الغلاف (Housing)","Housing",[s(hw-0.07),y-0.2,z]]]; }};

/* ---- landing-gear locks and the ground-lock pin (57) ---- */
ED.gear_uplock={gearDep:true,layer:"int",mk:"edgry",both:true,
  geo:K=>{ const x=EDG.x, z=K.Z(EDG.X), g=[];
    g.push(...edC("edgld",[edBox(0.16,0.12,0.2,x-0.45,1.56,z+0.55),edCyl(0.04,0.18,"x",x-0.45,1.47,z+0.55)]));                          /* up-lock hook and its roller */
    g.push(...edC("edmet",[edBar([x-0.35,1.38,z+0.02],[x-0.02,1.12,z+0.02],0.035),edBar([x-0.7,1.55,z-0.2],[x-0.35,1.38,z+0.02],0.035)]));   /* the over-centre down-lock links */
    g.push(...edC("edorg",[edCyl(0.02,0.4,"x",x-0.35,1.38,z+0.1)]));                                                                    /* ground-lock pin through the lock */
    g.push(...edC("edred",[edBox(0.012,0.12,0.5,x-0.62,1.3,z+0.35),edTor(0.035,0.008,"x",x-0.36,1.38,z+0.1)]));                         /* the red streamer and the ring */
    if(!K.xg){ const zn=K.Z(5.0); g.push(...edC("edgld",[edBox(0.16,0.12,0.2,0,1.5,zn-0.3)]));  g.push(...edC("edorg",[edCyl(0.02,0.4,"x",0,1.25,zn)])); g.push(...edC("edred",[edBox(0.34,0.012,0.5,0.0,1.25,zn+0.3)])); }   /* nose gear lock pin and its flag (737 view only) */
    return g; },
  lab:K=>{ const x=EDG.x, z=K.Z(EDG.X), zn=K.Z(5.0), R=[["خطّاف قفل الرفع (Up-lock)","Up-lock hook",[x-0.45,1.75,z+0.55]],["قفل الإنزال (Down-lock)","Down-lock (over-centre)",[x-0.2,1.62,z+0.02]],["مسمار القفل الأرضي","Ground-lock pin",[x-0.35,1.15,z+0.1]],["شريط «REMOVE BEFORE FLIGHT»","“REMOVE BEFORE FLIGHT” streamer",[x-0.62,1.1,z+0.6]],["مسمار قفل الجهاز الأمامي","Nose-gear lock pin",[0,1.05,zn]]]; if(K.xg) R.pop(); return R; }};

/* ---- the engine core as one assembled part (58) and its case parts (65, 67, 68) ---- */
ED.eng_core={layer:"int",mk:"edgry",both:true,cam:[Math.PI-0.75,1.0],
  geo:K=>{ const g=[]; ["eng_lp_compressor","eng_hp_compressor","eng_combustor","eng_hp_turbine","eng_lp_turbine"].forEach(id=>{ const k=ED[id].mk; edC(k,ED[id].geo(K)).forEach(x=>g.push(x)); });
    g.push(...edC("edmet",[edCyl(0.05,2.6,"z",EDN.x,EDN.y,-3.3)]));                                                                                           /* the shafts */
    g.push(...edC("edgry",[edTube(0.62,2.9,"z",EDN.x,EDN.y,-3.4,28)]));                                                                                        /* core case (a shell, so the stages stay visible through it) */
    [["eng_gearbox","edmet"],["eng_starter","edyel"],["eng_fuel_pump","edred"],["eng_oil_tank","edblu"]].forEach(([id,k])=>edC(k,ED[id].geo(K)).forEach(x=>g.push(x)));   /* the external accessories */
    g.push(...edC("edorg",edPipe([[EDN.x+0.3,EDN.y-0.62,-4.2],[EDN.x+0.55,EDN.y-0.3,-3.6],[EDN.x+0.58,EDN.y+0.2,-3.2],[EDN.x+0.3,EDN.y+0.58,-3.0]],0.03)));       /* an external pipe run */
    return g; },
  lab:K=>{ const x=EDN.x, y=EDN.y; return [["ضاغط الضغط المنخفض","Low-pressure compressor",[x-0.45,y+0.5,-4.45]],["ضاغط الضغط العالي","High-pressure compressor",[x+0.1,y+0.7,-3.65]],["حجرة الاحتراق","Combustor",[x+0.3,y+0.5,-3.0]],["توربين الضغط العالي","High-pressure turbine",[x-0.2,y+0.55,-2.65]],["توربين الضغط المنخفض","Low-pressure turbine",[x+0.3,y+0.65,-2.15]],["علبة تروس الملحقات","Accessory gearbox",[x,y-0.85,-4.1]],["أنابيب خارجية","External pipes",[x+0.7,y,-3.4]]]; }};
ED.eng_fan_case={layer:"int",mk:"edgry",both:true,cam:[Math.PI-0.7,0.95],
  geo:K=>{ const x=EDN.x, y=EDN.y, g=[];
    g.push(...edC("edmet",[edTube(1.03,0.5,"z",x,y,-4.7),edTor(1.03,0.03,"z",x,y,-4.95),edTor(1.03,0.03,"z",x,y,-4.45)]));              /* the containment ring with its two flanges */
    for(let i=0;i<10;i++){ const a=i/10*Math.PI*2; g.push(...edC("edgld",[edBox(0.09,0.1,0.14,x+Math.cos(a)*1.06,y+Math.sin(a)*1.06,-4.7)])); }   /* case brackets */
    g.push(...edC("edred",[edRot(edBox(0.02,0.7,0.2,x-0.45,y+0.62,-5.3),'z',0.5)]));                                                       /* a released blade (shown red) */
    g.push(...edC("edgrn",[edBox(0.32,0.18,0.4,x,y+1.1,-4.35),edBar([x-0.15,y+1.05,-4.35],[x-0.05,y+0.78,-4.6],0.035),edBar([x+0.15,y+1.05,-4.35],[x+0.05,y+0.78,-4.6],0.035)]));   /* the engine mount */
    return g; },
  lab:K=>{ const x=EDN.x, y=EDN.y; return [["حلقة الاحتواء (Containment ring)","Containment ring",[x+0.8,y+0.72,-4.7]],["حامِلات الغلاف","Case brackets",[x+1.1,y,-4.7]],["شفرة منفصلة (توضيح)","Released blade (illustration)",[x-0.55,y+0.85,-5.3]],["مثبّت المحرك الأمامي","Forward engine mount",[x,y+1.35,-4.35]]]; }};
ED.eng_exhaust_plug={layer:"ext",mk:"edgry",both:true,
  geo:K=>{ const x=EDN.x, y=EDN.y, g=[]; g.push(...edC("edgry",[edCyl(0.36,1.3,"z",x,y,-1.28,18,0.04)])); g.push(...edC("edmet",[edTor(0.4,0.022,"z",x,y,-1.9)])); return g; },
  lab:K=>[["مخروط العادم (Exhaust center body)","Exhaust center body",[EDN.x,EDN.y+0.5,-1.3]]]};
ED.eng_ogv={layer:"int",mk:"edmet",both:true,cam:[Math.PI-0.7,0.95],meta:["eng_ogv","ريش التوجيه الخلفية للمروحة (OGV)","Fan outlet guide vanes (OGV)","ATA 72","power","eng_fancowl",["N",0,0.3,"t"],
  "حلقة ثابتة من الريش خلف المروحة مباشرةً تعدّل دوران الهواء الخارج منها فيمشي مستقيماً بالقناة الخارجية، وتحمل غلاف المحرك.",[["Vane","ريشة التوجيه"],["Outer ring","الحلقة الخارجية"],["Inner ring","الحلقة الداخلية"]],[["boltnut","مسامير"]],["شقوق الريش","الارتفاع بالحلقة"],{int:true,only:"b737"}],
  geo:K=>{ const x=EDN.x, y=EDN.y, g=[], z=-4.55; for(let i=0;i<30;i++){ const a=i/30*Math.PI*2, c=Math.cos(a), s=Math.sin(a); g.push(edBar([x+c*0.5,y+s*0.5,z-0.04],[x+c*1.0,y+s*1.0,z+0.1],0.012));}
    g.push(edTor(1.0,0.02,"z",x,y,z+0.1),edTor(0.5,0.02,"z",x,y,z-0.04)); return g; },
  lab:K=>{ const x=EDN.x, y=EDN.y; return [["ريش التوجيه (OGV)","Outlet guide vanes",[x+0.75,y+0.6,-4.5]],["الحلقة الخارجية","Outer ring",[x+1.0,y,-4.45]],["الحلقة الداخلية","Inner ring",[x-0.5,y+0.1,-4.6]]]; }};
ED.eng_inlet_cowl={layer:"ext",mk:"edred",both:true,meta:["eng_inlet_cowl","أقسام غلاف المحرك","Nacelle sections (inlet cowl, fan cowl, thrust reverser)","ATA 71","power","eng_fancowl",["N",0,0.5,"s"],
  "الغلاف الخارجي للمحرك من ثلاثة أقسام: فم المدخل بالأمام، وغطاء المروحة (يُفتح للصيانة)، ومعكوس الدفع بالخلف.",[["Inlet cowl","فم المدخل"],["Fan cowl","غطاء المروحة"],["Thrust reverser","معكوس الدفع"]],[["boltnut","مسامير"]],["مفاصل الأبواب","أقفال الغطاء"],{only:"b737"}],
  geo:K=>{ const x=EDN.x, y=EDN.y, r=1.17, g=[]; g.push(...edC("edred",[edTube(r-0.05,0.89,"z",x,y,-5.975)])); g.push(...edC("edblu",[edTube(r,1.77,"z",x,y,-4.645)])); g.push(...edC("edgrn",[edTube(r+0.01,1.27,"z",x,y,-3.125)])); return g; },
  lab:K=>{ const x=EDN.x, y=EDN.y; return [["فم المدخل (Inlet cowl)","Inlet cowl",[x,y+1.1,-5.7]],["غطاء المروحة (Fan cowl)","Fan cowl",[x,y+1.1,-4.1]],["معكوس الدفع (Thrust reverser)","Thrust reverser",[x,y+1.1,-2.3]]]; }};
ED.eng_mounts={layer:"int",mk:"edgrn",both:true,cam:[Math.PI-0.9,0.9],meta:["eng_mounts","مثبّتات المحرك (أمامي وخلفي)","Engine mounts (forward and aft)","ATA 71","power","eng_pylon",["N",0,0.45,"t"],
  "يتعلّق المحرك بعمود التعليق من نقطتين: مثبّت أمامي عند غلاف المروحة ومثبّت خلفي عند غلاف التوربين، وقضبان تنقل قوة الدفع للجناح.",[["Forward mount","المثبّت الأمامي"],["Aft mount","المثبّت الخلفي"],["Thrust links","قضبان الدفع"]],[["boltnut","مسامير"]],["تشققات المثبّتات","ربط البراغي"],{int:true,only:"b737"}],
  geo:K=>{ const x=EDN.x, y=EDN.y, g=[];
    g.push(...edC("edgrn",[edBox(0.34,0.2,0.42,x,y+1.1,-4.35),edBox(0.3,0.22,0.36,x,y+0.62,-2.2)]));
    g.push(...edC("edgld",[edBar([x-0.17,y+1.0,-4.35],[x-0.12,y+0.8,-4.65],0.04),edBar([x+0.17,y+1.0,-4.35],[x+0.12,y+0.8,-4.65],0.04),edBar([x-0.15,y+0.55,-2.2],[x-0.3,y+0.35,-2.0],0.04),edBar([x+0.15,y+0.55,-2.2],[x+0.3,y+0.35,-2.0],0.04)]));
    g.push(...edC("edmet",[edBar([x-0.2,y+0.98,-4.35],[x-0.2,y+0.55,-2.2],0.035),edBar([x+0.2,y+0.98,-4.35],[x+0.2,y+0.55,-2.2],0.035)]));   /* the thrust links */
    return g; },
  lab:K=>{ const x=EDN.x, y=EDN.y; return [["المثبّت الأمامي","Forward mount",[x,y+1.4,-4.35]],["المثبّت الخلفي","Aft mount",[x,y+0.95,-2.2]],["قضبان نقل الدفع","Thrust links",[x+0.35,y+0.8,-3.3]]]; }};
ED.eng_cowl_antiice={layer:"int",mk:"edgld",both:true,cam:[Math.PI-0.7,0.9],
  geo:K=>{ const x=EDN.x, y=EDN.y, g=[];
    g.push(...edC("edorg",[edTor(0.93,0.026,"z",x,y,-5.95)]));                                                                           /* the piccolo tube: a ring with small holes round the lip */
    for(let i=0;i<24;i++){ const a=i/24*Math.PI*2; g.push(...edC("edred",[edCyl(0.012,0.04,"z",x+Math.cos(a)*0.93,y+Math.sin(a)*0.93,-6.0)])); }   /* the spray holes */
    g.push(...edC("edorg",edPipe([[x,y+0.58,-4.0],[x,y+0.9,-4.5],[x,y+0.93,-5.4],[x,y+0.93,-5.95]],0.035)));                          /* supply duct from the compressor bleed */
    g.push(...edC("edgld",[edCyl(0.1,0.22,"y",x,y+0.8,-4.55),edBox(0.18,0.1,0.18,x,y+0.94,-4.55)]));                                  /* the regulating (thermal anti-ice) valve and its actuator */
    g.push(...edC("edgry",[edBox(0.14,0.01,0.2,x,y-0.99,-5.7)]));                                                                        /* outlet vent at the bottom of the cowl */
    return g; },
  lab:K=>{ const x=EDN.x, y=EDN.y; return [["أنبوب الرش الحلقي (Piccolo)","Piccolo tube",[x+0.75,y+0.6,-5.95]],["صمام التنظيم","Regulating valve",[x+0.2,y+1.15,-4.55]],["مجرى الهواء الساخن من الضاغط","Hot-air duct from the compressor",[x+0.1,y+0.75,-5.0]],["فتحة الخروج","Air outlet",[x,y-1.0,-5.7]]]; }};
ED.eng_generator={layer:"int",mk:"edgrn",both:true,cam:[Math.PI-0.7,0.8],
  geo:K=>{ const x=EDN.x-0.62, y=EDN.y-0.5, z=-3.4, g=[];
    g.push(...edC("edgrn",[edTube(0.19,0.42,"z",x,y,z,24)]));                                                                            /* housing (a shell, to see inside) */
    g.push(...edC("edgld",[edCyl(0.11,0.34,"z",x,y,z)]));                                                                                  /* rotor */
    g.push(...edC("edmet",[edTor(0.15,0.035,"z",x,y,z-0.1),edTor(0.15,0.035,"z",x,y,z+0.1)]));                                           /* stator windings */
    g.push(...edC("edgry",[edCyl(0.035,0.7,"z",x,y,z-0.05),edCyl(0.1,0.04,"z",x,y,z-0.26)]));                                          /* shaft and drive spline */
    g.push(...edC("edblu",[edCyl(0.03,0.14,"y",x,y+0.22,z-0.1),edCyl(0.03,0.14,"y",x,y-0.22,z+0.1)]));                                  /* cooling-oil ports */
    g.push(...edC("edblk",[edBox(0.12,0.1,0.14,x+0.2,y,z+0.1)]));                                                                        /* power terminal block */
    return g; },
  lab:K=>{ const x=EDN.x-0.62, y=EDN.y-0.5, z=-3.4; return [["الدوّار (Rotor)","Rotor",[x+0.05,y+0.25,z]],["لفائف الثابت (Stator)","Stator windings",[x-0.25,y+0.1,z+0.1]],["العمود والمسنّنات","Shaft and spline",[x,y-0.3,z-0.3]],["منافذ زيت التبريد","Cooling-oil ports",[x-0.05,y+0.35,z-0.1]],["مأخذ القدرة","Power terminal",[x+0.3,y,z+0.1]]]; }};

/* ---- the total-air-temperature probe with its internals (85) ---- */
ED.tat_probe.geo=K=>{ const X=3.0, y=K.zc(X)+0.55, hw=K.half(X,y), z=K.Z(X), g=[];
  g.push(...edC("edwht",[edBox(0.1,0.1,0.2,hw+0.07,y+0.06,z),edCyl(0.05,0.1,"x",hw+0.02,y,z)]));                                       /* the head with the air inlet scoop */
  g.push(...edC("edgry",[edCyl(0.06,0.04,"x",hw+0.0,y-0.03,z)]));                                                                       /* base plate */
  g.push(...edC("edgrn",[edBox(0.04,0.03,0.07,hw+0.09,y+0.05,z)]));                                                                     /* temperature sensor in the stream */
  g.push(...edC("edred",[edCyl(0.012,0.1,"x",hw-0.05,y,z)]));                                                                           /* heater / bleed connection */
  g.push(...edC("edcy",[edBar([hw+0.13,y+0.05,z-0.12],[hw+0.1,y+0.05,z-0.02],0.012)]));                                                  /* fresh-air path */
  return edSc(g,hw,y,z,2.4); };
ED.tat_probe.lab=K=>{ const X=3.0, y=K.zc(X)+0.55, hw=K.half(X,y), z=K.Z(X), s=(v)=>hw+(v-hw)*2.4; return [["مدخل الهواء","Fresh-air inlet",[s(hw+0.13),y+0.35,z-0.35]],["عنصر قياس الحرارة","Temperature sensor",[s(hw+0.09),y+0.3,z]],["صفيحة التثبيت","Base plate",[s(hw),y-0.35,z]],["اتصال التسخين","Heater connection",[s(hw-0.05),y,z+0.3]]]; };
edFinish();
