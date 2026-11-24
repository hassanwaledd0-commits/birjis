/* ---------- (ed) part 2, batch C (items 59, 79, 86, 89-99, 101-107): flight-control actuators and the control run, landing-gear assemblies and sensors, fuel pumps and the refuelling panel,
   external-power panel, beacon, passenger oxygen, GPS and radio-altimeter antennas, APU inlet, the wing structure with its skin ghosted (104). See m_ed737.js. ---------- */

/* ---- flight controls (90, 91, 93, 94, 76) ---- */
ED.rudder_pcu={layer:"int",mk:"edred",cam:[Math.PI/2+0.55,0.95],
  geo:K=>{ const F=K.F, p=F.pt(0.1,0.68,0), g=[], x=0, y=p.y, z=p.z;
    g.push(...edC("edred",[edBox(0.22,0.2,0.5,x,y,z-0.05)]));                                                                           /* main PCU */
    g.push(...edC("edgry",[edBox(0.18,0.16,0.4,x,y+0.26,z-0.05)]));                                                                     /* standby PCU */
    g.push(...edC("edgld",[edCyl(0.035,0.22,"x",x,y+0.0,z+0.24),edCyl(0.035,0.22,"x",x,y+0.26,z+0.2)]));                              /* the dual valves (two independent) */
    g.push(...edC("edorg",[edBar([x-0.08,y-0.05,z+0.2],[x-0.08,y-0.2,z+0.5],0.02),edBar([x+0.08,y-0.05,z+0.2],[x+0.08,y-0.2,z+0.5],0.02)]));   /* the dual input arms */
    [-0.08,0.08].forEach(dx=>g.push(...edC("edmet",[edTor(0.04,0.008,"x",x+dx,y-0.13,z+0.35)])));                                       /* spring overrides */
    g.push(...edC("edgrn",[edBox(0.06,0.06,0.06,x+0.13,y+0.1,z+0.1),edBox(0.06,0.06,0.06,x-0.13,y+0.1,z+0.1)]));                       /* hydraulic pressure sensors */
    return g; },
  lab:K=>{ const p=K.F.pt(0.1,0.68,0), y=p.y, z=p.z; return [["وحدة التحكم الرئيسية (Main PCU)","Main PCU",[0.2,y-0.05,z-0.3]],["وحدة التحكم الاحتياطية","Standby PCU",[0.2,y+0.35,z-0.2]],["صمّامان مستقلان","Two independent valves",[0.2,y+0.1,z+0.35]],["ذراعا الإدخال","Input arms",[0.2,y-0.25,z+0.5]],["نوابض التخطّي","Spring overrides",[-0.2,y-0.15,z+0.4]],["حسّاسات الضغط الهيدروليكي","Pressure sensors",[0.2,y+0.2,z+0.1]]]; }};
ED.spoiler_pcu={layer:"int",mk:"edgld",both:true,cam:[Math.PI-0.6,0.8],
  geo:K=>{ const W=K.W, g=[]; [0.22,0.36,0.5,0.64,0.78].forEach(u=>{ const a=edWp(W,u,0.6,0), b=edWp(W,u,0.67,0.8);
      g.push(...edC("edgld",[edCyl(0.045,0.22,"y",a.x,a.y-0.12,a.z)]));                                                                  /* the actuator cylinder */
      g.push(...edC("edmet",[edBar([a.x,a.y,a.z],[b.x,b.y,b.z],0.022)]));                                                                /* the rod to the spoiler panel */
      g.push(...edC("edblk",[edBox(0.07,0.06,0.07,a.x,a.y-0.26,a.z)])); });                                                              /* its fitting on the rear spar */
    return g; },
  lab:K=>{ const W=K.W, a=edWp(W,0.5,0.6,0), b=edWp(W,0.5,0.67,0.8); return [["مشغّل السبويلر (أسطوانة هيدروليكية)","Spoiler actuator (hydraulic cylinder)",[a.x,a.y-0.5,a.z]],["ذراع الدفع إلى اللوح","Rod to the panel",[b.x,b.y+0.3,b.z]]]; }};
ED.ths_actuator={layer:"int",mk:"edblu",cam:[Math.PI/2-0.55,0.9],
  geo:K=>{ const H=K.H, p=H.pt(0,0.3,0), g=[], x=0.0, z=p.z, y=p.y;
    g.push(...edC("edblu",[edCyl(0.035,1.4,"y",x,y+0.35,z)]));                                                                         /* the acme screw (jackscrew) */
    g.push(...edC("edyel",[edCyl(0.1,0.16,"y",x,y,z),edBox(0.34,0.06,0.14,x,y-0.1,z)]));                                              /* the acme nut and its yoke */
    g.push(...edC("edgry",[edBar([x-0.17,y-0.1,z],[x-0.5,y-0.1,z+0.4],0.03),edBar([x+0.17,y-0.1,z],[x+0.5,y-0.1,z+0.4],0.03)]));      /* fittings to the stabilizer */
    g.push(...edC("edblk",[edBox(0.4,0.26,0.3,x,y+1.15,z)]));                                                                           /* the gearbox */
    g.push(...edC("edpur",[edCyl(0.09,0.3,"y",x-0.14,y+1.45,z),edCyl(0.09,0.3,"y",x+0.14,y+1.45,z)]));                               /* two trim motors */
    const q=H.pt(0,0.85,0); g.push(...edC("edgld",[edCyl(0.07,0.5,"x",0,q.y,q.z)]));                                                    /* the stabilizer pivot at the rear spar */
    return g; },
  lab:K=>{ const p=K.H.pt(0,0.3,0), y=p.y, z=p.z, q=K.H.pt(0,0.85,0); return [["محرّكا الموازنة","Trim motors",[0.4,y+1.55,z]],["علبة التروس","Gear box",[0.4,y+1.15,z]],["البرغي اللولبي (Acme screw)","Acme screw",[0.25,y+0.5,z]],["الصامولة (Acme nut)","Acme nut",[0.25,y,z]],["محور دوران الذيل الأفقي","Stabilizer pivot",[0.4,q.y+0.2,q.z]]]; }};
ED.elevator_pcu={layer:"int",mk:"edred",both:true,cam:[Math.PI-0.55,0.85],
  geo:K=>{ const H=K.H, g=[]; [0.3,0.62].forEach((u,i)=>{ const a=edWp(H,u,0.62,0), b=edWp(H,u,0.78,0);
      g.push(...edC(i?"edgrn":"edred",[edCyl(0.05,0.34,"z",a.x,a.y,a.z+0.22)]));                                                      /* hydraulic system A (red) and B (green) cylinders */
      g.push(...edC("edmet",[edBar([a.x,a.y,a.z+0.38],[b.x,b.y,b.z+0.2],0.02)]));                                                    /* control rod to the elevator */ });
    const t0=edWp(H,0.08,0.7,0), t1=edWp(H,0.9,0.7,0); g.push(...edC("edgld",[edBar([t0.x,t0.y,t0.z],[t1.x,t1.y,t1.z],0.035)]));          /* the output torque tube along the hinge */
    const m=edWp(H,0.45,0.5,0); g.push(...edC("edorg",[edCyl(0.04,0.26,"z",m.x,m.y,m.z)]));                                              /* Mach trim / autopilot actuator */
    return g; },
  lab:K=>{ const H=K.H, a=edWp(H,0.3,0.62,0), b=edWp(H,0.62,0.62,0), t=edWp(H,0.8,0.7,0), m=edWp(H,0.45,0.5,0); return [["مشغّل المصعد (النظام A)","Elevator PCU (system A)",[a.x,a.y+0.3,a.z]],["مشغّل المصعد (النظام B)","Elevator PCU (system B)",[b.x,b.y+0.3,b.z]],["أنبوب العزم الخارج","Output torque tube",[t.x,t.y+0.3,t.z]],["مشغّل الطيار الآلي","Autopilot / Mach trim actuator",[m.x,m.y-0.3,m.z]]]; }};
ED.elev_feel={layer:"int",mk:"edblu",cam:[Math.PI/2-0.55,0.9],meta:["elev_feel","وحدة إحساس المصعد","Elevator feel and centering unit","ATA 27","ctrl","elevator",["F",0.9,"c",0.4],
  "وحدة تعطي الطيار إحساساً بقوة تتناسب مع السرعة وتُرجع العمود للوسط. حاسوب الإحساس يستقبل السرعة ووضع الذيل الأفقي ويضبط الضغط الهيدروليكي المسلَّط عليها.",[["Feel computer","حاسوب الإحساس"],["Feel and centering unit","وحدة الإحساس والتمركز"],["Mach trim actuator","مشغّل موازنة ماخ"]],[["boltnut","وصلات"]],["الضغط الهيدروليكي","تسريب الوحدة"],{int:true,only:"b737"}],
  geo:K=>{ const Z=K.Z, X=36.4, y=K.zc(X)+0.5, z=Z(X), g=[];
    g.push(...edC("edblu",[edBox(0.34,0.22,0.44,0,y+0.35,z)]));                                                                        /* feel computer */
    g.push(...edC("edgrn",[edBox(0.4,0.26,0.4,0,y-0.05,z)]));                                                                           /* feel and centering unit */
    g.push(...edC("edorg",[edCyl(0.05,0.34,"z",0.3,y-0.05,z)]));                                                                        /* Mach trim actuator */
    g.push(...edC("edred",edPipe([[-0.2,y-0.05,z-0.2],[-0.45,y-0.1,z-0.4]],0.02)));                                                    /* system A line */
    g.push(...edC("edgrn",edPipe([[0.2,y-0.05,z-0.2],[0.45,y-0.1,z-0.4]],0.02)));                                                       /* system B line */
    g.push(...edC("edyel",edPipe([[0,y+0.45,z],[0,y+0.8,z+0.3]],0.015)));                                                               /* stabilizer position input */
    return g; },
  lab:K=>{ const Z=K.Z, X=36.4, y=K.zc(X)+0.5, z=Z(X); return [["حاسوب الإحساس","Elevator feel computer",[0,y+0.65,z]],["وحدة الإحساس والتمركز","Feel and centering unit",[0.2,y-0.35,z]],["مشغّل موازنة ماخ","Mach trim actuator",[0.45,y-0.05,z]],["دخل وضع الذيل الأفقي","Stabilizer position input",[0.1,y+1.05,z+0.3]]]; }};
ED.fcs_layout={layer:"int",mk:"edgrn",cam:[Math.PI-0.9,1.1],meta:["fcs_layout","مخطط نظام التحكم بالطيران","Flight-control system layout","ATA 27","ctrl","flightdeck",["F",0.4,"c",-0.4],
  "الطيار يحرّك العمود وعجلة القيادة والدواسات، فتنتقل الحركة عبر كابلات وقضبان إلى مشغّلات هيدروليكية تحرّك الجنيحات والمصاعد والدفة والسبويلر والقلابات.",[["Control column","عمود التحكم"],["Cables and rods","كابلات وقضبان"],["Rudder pedals","دواسات الدفة"],["Actuators","المشغّلات"]],[["boltnut","وصلات"]],["شدّ الكابلات","تآكل البكرات"],{int:true,only:"b737"}],
  geo:K=>{ const Z=K.Z, W=K.W, H=K.H, F=K.F, g=[], y=1.95;
    [-0.45,0.45].forEach(x=>{ g.push(...edC("edgry",[edCyl(0.03,0.9,"y",x,3.05,Z(3.4))])); g.push(...edC("edblk",[edTor(0.17,0.014,"z",x,3.55,Z(3.2))]));           /* control columns and wheels */
      g.push(...edC("edgry",[edBox(0.16,0.03,0.12,x,2.3,Z(1.9)),edBox(0.16,0.03,0.12,x+0.2*Math.sign(x),2.3,Z(1.9))])); });                                            /* rudder pedals */
    const run=(k,x,yb,pts)=>g.push(...edC(k,edPipe(pts,0.012)));
    [-1,1].forEach(s=>{ const a1=edWp(W,0.8,0.7,0);
      run("edgrn",s*0.75,y,[[s*0.75,y+0.9,Z(3.6)],[s*0.75,y,Z(6)],[s*0.75,y,Z(15.0)],[s*a1.x*0.4,a1.y,a1.z*0.2+Z(15.0)*0.8],[s*a1.x,a1.y,a1.z]]);                      /* aileron cable */
      run("edblu",s*0.55,y,[[s*0.45,y+0.9,Z(3.6)],[s*0.55,y,Z(6)],[s*0.55,y+0.05,Z(30)],[s*0.4,5.0,Z(35)]]);                                                          /* elevator cable */
      run("edorg",s*0.35,y,[[s*0.2,2.3,Z(2.0)],[s*0.35,y,Z(6)],[s*0.35,y+0.1,Z(30)],[0,F.pt(0.05,0.7,0).y,F.pt(0.05,0.7,0).z]]);                                      /* rudder cable */ });
    const ts=edWp(W,0.55,0.62,0); g.push(...edC("edyel",[edBar([ts.x,ts.y,ts.z],[ts.x*0.5,ts.y,ts.z-0.9],0.025)]));                                                       /* flap drive shaft */
    [["edgld",0.3],["edgld",0.62]].forEach(([k,u])=>{ const a=edWp(H,u,0.62,0); g.push(...edC(k,[edBox(0.1,0.1,0.22,a.x,a.y,a.z+0.2),edBox(0.1,0.1,0.22,-a.x,a.y,a.z+0.2)])); }); /* elevator actuators */
    return g; },
  lab:K=>{ const Z=K.Z; return [["أعمدة التحكم وعجلتا القيادة","Control columns and wheels",[0,3.95,Z(3.3)]],["دواسات الدفة","Rudder pedals",[0,2.0,Z(1.9)]],["كابلات الجنيحات","Aileron cables",[0.8,1.8,Z(9)]],["كابلات المصعد","Elevator cables",[0.55,1.8,Z(20)]],["كابلات الدفة","Rudder cables",[0.35,1.8,Z(26)]],["مشغّلات المصعد","Elevator actuators",[0.4,5.4,Z(34.2)]]]; }};

/* ---- landing gear: the nose assembly (92), the shimmy damper and torque links (79), the main-gear assembly (107), proximity sensors (86) ---- */
ED.gear_actuator={gearDep:true,layer:"int",mk:"edgry",cam:[Math.PI/2-0.5,1.1],
  geo:K=>{ const z=K.Z(5.0), g=[];
    g.push(...edC("edblk",[edCyl(0.4,0.22,"x",-0.24,0.4,z),edCyl(0.4,0.22,"x",0.24,0.4,z)]));                                           /* the two tyres */
    g.push(...edC("edmet",[edCyl(0.2,0.24,"x",-0.24,0.4,z),edCyl(0.2,0.24,"x",0.24,0.4,z),edCyl(0.05,0.8,"x",0,0.4,z)]));              /* wheels and axle */
    g.push(...edC("edblu",[edCyl(0.1,0.7,"y",0,1.2,z)]));                                                                              /* the outer cylinder */
    g.push(...edC("edpur",[edCyl(0.06,0.8,"y",0,0.78,z)]));                                                                             /* the piston rod shaft */
    g.push(...edC("edgld",[edBar([0,1.95,z-0.95],[0,1.5,z-0.35],0.045)]));                                                              /* forward upper strut */
    g.push(...edC("edgrn",[edBar([0,1.5,z-0.35],[0,1.22,z-0.06],0.045)]));                                                              /* forward lower strut */
    g.push(...edC("edorg",[edBar([0,1.95,z+0.55],[0,1.5,z-0.35],0.035)]));                                                              /* locking strut */
    g.push(...edC("edred",[edCyl(0.05,0.62,"z",0,1.75,z+0.35),edBar([0,1.75,z+0.05],[0,1.55,z-0.28],0.025)]));                       /* the retraction / extension actuator and its rod */
    g.push(...edC("edmet",[edBar([0,0.95,z-0.02],[0,0.62,z+0.2],0.03),edBar([0,0.95,z-0.02],[0,0.62,z-0.24],0.03)]));                   /* torque links */
    return g; },
  lab:K=>{ const z=K.Z(5.0); return [["مشغّل الرفع والإنزال","Retraction and extension actuator",[0.3,1.95,z+0.35]],["الدعامة الأمامية العليا","Forward upper strut",[0.3,1.85,z-0.7]],["الدعامة الأمامية السفلى","Forward lower strut",[0.3,1.4,z-0.2]],["دعامة القفل","Locking strut",[0.3,1.75,z+0.3]],["الأسطوانة الخارجية","Outer cylinder",[0.3,1.3,z]],["عمود المكبس","Piston rod shaft",[0.3,0.75,z]],["الإطار والعجلة","Tyre and wheel",[0.55,0.45,z]]]; }};
ED.gear_shimmy={gearDep:true,layer:"int",mk:"edgry",cam:[Math.PI/2-0.5,1.0],
  geo:K=>{ const z=K.Z(5.0), g=[];
    g.push(...edC("edblu",[edCyl(0.1,0.4,"y",0,1.05,z)]));                                                                              /* shock-strut cylinder */
    g.push(...edC("edpur",[edCyl(0.065,0.5,"y",0,0.7,z)]));                                                                             /* piston */
    g.push(...edC("edmet",[edCyl(0.05,0.8,"x",0,0.4,z)]));                                                                              /* axle */
    g.push(...edC("edgld",[edBar([0,0.92,z],[0.0,0.72,z+0.26],0.035),edBar([0,0.92,z],[0,0.72,z+0.26],0.035)]));                      /* upper torque link */
    g.push(...edC("edorg",[edBar([0,0.72,z+0.26],[0,0.48,z+0.02],0.035)]));                                                            /* lower torque link */
    g.push(...edC("edred",[edCyl(0.05,0.42,"x",0.0,0.66,z+0.3)]));                                                                      /* the shimmy damper */
    g.push(...edC("edgry",[edSph(0.045,0,0.72,z+0.26)]));                                                                               /* the apex bolt */
    return g; },
  lab:K=>{ const z=K.Z(5.0); return [["مخمّد الاهتزاز (Shimmy damper)","Shimmy damper",[0.3,0.66,z+0.3]],["وصلة العزم العليا","Upper torque link",[0.3,0.95,z+0.1]],["وصلة العزم السفلى","Lower torque link",[0.3,0.55,z+0.1]],["المحور (Axle)","Axle",[0.45,0.4,z]],["أسطوانة الماصّ","Shock-strut cylinder",[0.3,1.2,z]],["المكبس","Piston",[0.3,0.75,z]]]; }};
ED.gear_torque_link={gearDep:true,layer:"int",mk:"edgry",both:true,cam:[Math.PI/2-0.5,1.0],
  geo:K=>{ const x=EDG.x, z=K.Z(EDG.X), g=[];
    g.push(...edC("edblu",[edCyl(0.1,0.6,"y",x,1.15,z)]));                                                                              /* 1 shock strut */
    g.push(...edC("edpur",[edCyl(0.06,0.5,"y",x,0.7,z)]));
    g.push(...edC("edgld",[edBar([x-0.05,1.5,z-0.9],[x,1.15,z-0.05],0.05)]));                                                           /* 2 drag strut */
    g.push(...edC("edorg",[edBar([x-0.7,1.55,z-0.2],[x-0.02,1.05,z+0.02],0.045)]));                                                     /* 3 side strut */
    g.push(...edC("edred",[edCyl(0.03,0.1,"x",x+0.12,1.28,z)]));                                                                         /* 4 oil / nitrogen servicing valve */
    g.push(...edC("edyel",[edBar([x,0.92,z],[x,0.7,z+0.22],0.035),edBar([x,0.7,z+0.22],[x,0.5,z+0.02],0.035),edSph(0.045,x,0.7,z+0.22)])); /* 7 torque links with the apex bolt */
    g.push(...edC("edmet",[edCyl(0.05,1.2,"x",x,EDG.wr,z)]));                                                                           /* 9 axle assembly */
    g.push(...edC("edgrn",[edCyl(0.035,0.08,"y",x,0.4,z)]));                                                                            /* 10 jack pad */
    g.push(...edC("edwht",[edBox(0.03,0.62,1.1,x+0.5,1.0,z-0.1)]));                                                                     /* 11 gear door */
    g.push(...edC("edblk",[edCyl(0.5,0.22,"x",x-0.28,EDG.wr,z),edCyl(0.5,0.22,"x",x+0.28,EDG.wr,z)]));                                  /* the wheels */
    return g; },
  lab:K=>{ const x=EDG.x, z=K.Z(EDG.X); return [["1 الماصّ الزيتي","1 Shock strut",[x,1.55,z]],["2 دعامة السحب","2 Drag strut",[x-0.05,1.6,z-0.9]],["3 الدعامة الجانبية","3 Side strut",[x-0.7,1.65,z-0.2]],["4 صمام الزيت والنيتروجين","4 Oil / nitrogen valve",[x+0.3,1.35,z]],["7 وصلة العزم (Torque link)","7 Torque link",[x+0.3,0.75,z+0.22]],["9 مجموعة المحور","9 Axle assembly",[x,0.2,z]],["10 نقطة الرفع بالجاك","10 Jack pad",[x+0.2,0.25,z]],["11 باب الجهاز","11 Gear door",[x+0.55,1.35,z-0.1]]]; }};
ED.gear_prox_sensor={gearDep:true,layer:"int",mk:"edyel",both:true,cam:[Math.PI/2-0.5,1.0],
  geo:K=>{ const x=EDG.x, z=K.Z(EDG.X), zn=K.Z(5.0), g=[];
    g.push(...edC("edyel",[edBox(0.07,0.07,0.1,x-0.35,1.47,z+0.1),edBox(0.07,0.07,0.1,x-0.45,1.64,z+0.55)]));                          /* main-gear down-lock and up-lock sensors */
    g.push(...edC("edgry",[edBox(0.08,0.05,0.12,x-0.35,1.38,z+0.1),edBox(0.06,0.05,0.1,x-0.45,1.52,z+0.55)]));                          /* their targets on the moving parts */
    if(!K.xg) [-0.18,0.18].forEach(dx=>{ g.push(...edC("edyel",[edBox(0.07,0.07,0.1,dx,1.6,zn)])); g.push(...edC("edgry",[edBox(0.08,0.05,0.12,dx,1.5,zn)])); });   /* nose-gear down-lock sensors and targets */
    g.push(...edC("edorg",[edBar([x-0.35,1.5,z+0.1],[x-0.5,1.8,z-0.6],0.01),edBar([x-0.45,1.68,z+0.55],[x-0.5,1.8,z-0.6],0.01)]));    /* the wiring up to the airframe */
    return g; },
  lab:K=>{ const x=EDG.x, z=K.Z(EDG.X), zn=K.Z(5.0), R=[["مستشعر قفل الإنزال (قرب)","Down-lock proximity sensor",[x-0.35,1.7,z+0.1]],["مستشعر قفل الرفع","Up-lock proximity sensor",[x-0.45,1.85,z+0.55]],["الهدف المعدني","Target",[x-0.2,1.3,z+0.1]],["مستشعرا الجهاز الأمامي","Nose-gear sensors",[0,1.8,zn]]]; if(K.xg) R.pop(); return R; }};

/* ---- fuel: boost pumps (97), the refuelling panel (63) ---- */
ED.fuel_boost_pump={layer:"int",mk:"edgld",both:true,cam:[Math.PI-0.6,0.8],
  geo:K=>{ const W=K.W, g=[]; [0.1,0.22].forEach(u=>{ const p=edWp(W,u,0.42,-0.8);
      g.push(...edC("edgld",[edCyl(0.1,0.44,"z",p.x,p.y+0.12,p.z)]));                                                                  /* the pump canister */
      g.push(...edC("edgry",[edCyl(0.07,0.1,"z",p.x,p.y+0.12,p.z-0.27,12,0.1)]));                                                     /* inlet screen */
      g.push(...edC("edblu",edPipe([[p.x,p.y+0.12,p.z+0.22],[p.x+0.1,p.y+0.3,p.z+0.5],[p.x+0.4,p.y+0.3,p.z+0.5]],0.025))); });          /* outlet to the manifold */
    [-0.7,0.7].forEach(x=>{ g.push(...edC("edgld",[edCyl(0.1,0.44,"z",x,1.48,K.Z(17.0))])); g.push(...edC("edgry",[edCyl(0.07,0.1,"z",x,1.48,K.Z(17.0)-0.27,12,0.1)])); });   /* the two centre-tank pumps */
    return g; },
  lab:K=>{ const W=K.W, p=edWp(W,0.1,0.42,-0.8); return [["مضخة التعزيز","Boost pump",[p.x,p.y+0.5,p.z]],["مصفاة المدخل","Inlet screen",[p.x,p.y-0.2,p.z-0.35]],["مخرج إلى مشعّب الوقود","Outlet to the fuel manifold",[p.x+0.4,p.y+0.55,p.z+0.5]],["مضخّتا الخزان المركزي","Centre-tank pumps",[0.7,1.1,K.Z(17.0)]]]; }};
ED.refuel_panel={layer:"ext",mk:"edwht",cam:[Math.PI-0.7,0.4],
  geo:K=>{ const p=edWp(K.W,0.1,0.55,-1.0), g=[], x=p.x, y=p.y-0.05, z=p.z;
    g.push(...edC("edwht",[edBox(0.5,0.02,0.36,x,y,z)]));                                                                                /* the panel plate */
    [-0.16,0,0.16].forEach(dx=>{ g.push(...edC("edblk",[edCyl(0.065,0.025,"y",x+dx,y-0.02,z+0.06)])); g.push(...edC("edgrn",[edBox(0.07,0.01,0.03,x+dx,y-0.04,z+0.06)])); });   /* the quantity indicators: tank 2, centre, tank 1 */
    [-0.16,0.16].forEach(dx=>g.push(...edC("edblu",[edCyl(0.025,0.02,"y",x+dx,y-0.02,z-0.08)])));                                       /* valve position lights */
    g.push(...edC("edred",[edBox(0.05,0.02,0.04,x-0.2,y-0.02,z+0.15),edBox(0.05,0.02,0.04,x+0.2,y-0.02,z+0.15)]));                      /* test and fuel-door switches */
    [-0.16,0,0.16].forEach(dx=>g.push(...edC("edorg",[edCyl(0.018,0.1,"y",x+dx,y+0.1,z-0.14)])));                                       /* override plungers */
    g.push(...edC("edgld",[edCyl(0.07,0.3,"x",x,y+0.18,z-0.14),edBar([x-0.2,y+0.18,z-0.14],[x-0.2,y+0.3,z-0.14],0.02)]));            /* the fuelling manifold with its valves */
    return g; },
  lab:K=>{ const p=edWp(K.W,0.1,0.55,-1.0), x=p.x, y=p.y-0.05, z=p.z; return [["مؤشّرات كمية الوقود (خزان 2، وسط، 1)","Fuel quantity indicators (tank 2, centre, tank 1)",[x,y-0.2,z+0.1]],["أضواء وضع الصمامات","Valve position lights",[x+0.2,y-0.15,z-0.1]],["مفتاح باب الوقود والاختبار","Fuel-door and test switches",[x-0.25,y-0.15,z+0.18]],["مشعّب التعبئة","Fuelling manifold",[x,y+0.45,z-0.14]],["مكابس التجاوز اليدوي","Override plungers",[x+0.2,y+0.25,z-0.14]]]; }};
ED.ext_power_recept.geo=K=>{ const X=5.5, y=K.zc(X)-0.6, hw=K.half(X,y), z=K.Z(X), g=[];
  g.push(...edC("eddark",[edBox(0.03,0.34,0.5,hw,y,z),edCyl(0.09,0.04,"x",hw+0.03,y,z-0.1),edCyl(0.09,0.04,"x",hw+0.03,y,z+0.1)]));           /* the receptacle with its pins */
  const px=K.half(4.6,y), pz=K.Z(4.6);
  g.push(...edC("edgry",[edBox(0.03,0.2,0.34,px,y,pz)]));                                                                                      /* the control panel beside it */
  [[-0.1,0.06],[0,0.06],[0.1,0.06],[-0.1,-0.04],[0,-0.04]].forEach(([dz,dy],i)=>g.push(...edC(i===1?"edorg":i===2?"edblu":"edwht",[edCyl(0.025,0.02,"x",px+0.02,y+dy,pz+dz*1.3)])));   /* its lights */
  g.push(...edC("edred",[edBox(0.02,0.06,0.04,px+0.02,y-0.04,pz+0.13)]));                                                                      /* the guarded switch */
  return g; };
ED.ext_power_recept.lab=K=>{ const X=5.5, y=K.zc(X)-0.6, hw=K.half(X,y), px=K.half(4.6,y); return [["مأخذ الطاقة الأرضية","External power receptacle",[hw,y+0.35,K.Z(X)]],["لوحة التحكم بالطاقة الأرضية","External power control panel",[px,y+0.3,K.Z(4.6)]]]; };

/* ---- lights and sensors (99, 101, 105, 106) ---- */
ED.light_beacon.geo=K=>{ const X=18.2, y=K.top(X), z=K.Z(X), g=[];
  g.push(...edC("edmet",[edCyl(0.2,0.03,"y",0,y+0.01,z)]));                                                                                    /* the base flange */
  for(let i=0;i<4;i++){ const a=i/4*Math.PI*2+0.8; g.push(...edC("edgry",[edCyl(0.012,0.04,"y",Math.cos(a)*0.17,y+0.03,z+Math.sin(a)*0.17)])); }   /* bolts */
  g.push(...edC("edlampR",[edCyl(0.13,0.12,"y",0,y+0.09,z)]));                                                                                  /* the red lens */
  g.push(...edC("edlamp",(()=>{ const a=[]; for(let i=0;i<12;i++){ const t=i/12*Math.PI*2; a.push(edSph(0.012,Math.cos(t)*0.1,y+0.09,z+Math.sin(t)*0.1)); } return a; })()));   /* the ring of LEDs */
  g.push(...edC("edgry",[edCyl(0.07,0.08,"y",0,y+0.1,z,12,0.04)]));                                                                           /* the reflector in the middle */
  return edSc(g,0,y,z,1.8); };
ED.light_beacon.lab=K=>{ const X=18.2, y=K.top(X), z=K.Z(X); return [["غطاء العدسة الأحمر","Red lens dome",[0.3,y+0.3,z]],["حلقة المصابيح LED","LED ring",[-0.3,y+0.25,z]],["حلقة التثبيت","Base flange",[0.4,y+0.05,z]],["العاكس","Reflector",[0,y+0.45,z]]]; };
ED.ant_gps.geo=K=>{ const g=[]; [["t",9.0,-0.35],["t",9.7,0.35]].forEach(([sd,X,x])=>{ const y=K.top(X), z=K.Z(X), gg=[];
    gg.push(...edC("edgld",[edBox(0.3,0.015,0.2,x,y+0.005,z)]));                                                                               /* the metal base plate with its three bolts */
    gg.push(...edC("edwht",[edSph(0.13,x,y+0.02,z,1.2,0.4,0.85)]));                                                                             /* the housing dome */
    [-0.1,0.1].forEach(dz=>gg.push(...edC("edgld",[edCyl(0.02,0.04,"y",x+dz*0.7,y-0.03,z+dz*0.4)])));                                          /* the two connectors under the plate */
    gg.push(...edC("edblk",[edTor(0.07,0.006,"y",x,y-0.0,z)]));                                                                                 /* the sealing ring */
    edSc(gg,x,y,z,1.9).forEach(q=>g.push(q)); }); return g; };
ED.ant_gps.lab=K=>[["غطاء هوائي GPS","GPS antenna housing",[-0.35,K.top(9.0)+0.45,K.Z(9.0)]],["صفيحة التثبيت","Mounting plate",[-0.8,K.top(9.0)+0.1,K.Z(9.0)]],["موصّلات الكابل","Cable connectors",[-0.35,K.top(9.0)-0.2,K.Z(9.0)]],["GPS 2","GPS 2",[0.35,K.top(9.7)+0.45,K.Z(9.7)]]];
ED.radio_altimeter_ant.geo=(g0=>K=>{ const g=g0(K), Z=K.Z; g.push(...edC("edorg",[edBox(0.4,0.22,0.5,0,1.9,Z(9.4))]));
    [[-0.4,11.4],[-0.4,12.4],[0.4,11.4],[0.4,12.4]].forEach(([x,X])=>g.push(...edC("edgld",edPipe([[x,K.bot(X)+0.03,Z(X)],[x*0.6,1.62,Z(X)-0.4],[0.1,1.85,Z(9.7)]],0.007)))); return g; })(ED.radio_altimeter_ant.geo);
ED.radio_altimeter_ant.lab=K=>[["هوائيا الإرسال (2)","Transmit antennas (2)",[-0.4,K.bot(11.9)-0.35,K.Z(11.9)]],["هوائيا الاستقبال (2)","Receive antennas (2)",[0.4,K.bot(11.9)-0.35,K.Z(11.9)]],["جهاز الإرسال والاستقبال","Radio altimeter transceiver",[0,2.25,K.Z(9.4)]],["كابلات محورية","Coaxial cables",[-0.2,1.55,K.Z(10.6)]]];
ED.static_port.geo=K=>{ const X=11.8, y=K.zc(X)+0.05, hw=K.half(X,y), g=[]; [-1,1].forEach(s=>{ g.push(...edC("eddark",[edBox(0.03,0.22,0.5,s*hw,y,K.Z(X))])); g.push(...edC("edgry",[edTor(0.15,0.012,"x",s*(hw+0.02),y,K.Z(X)).scale(1,1,1)])); [-0.12,0.12].forEach(d=>g.push(...edC("edblk",[edCyl(0.025,0.04,"x",s*(hw+0.02),y,K.Z(X)+d)]))); }); return g; };
ED.aoa_vane.geo=(g0=>K=>{ const g=g0(K), X=4.7, y=K.zc(X)+0.12, hw=K.half(X,y); [-1,1].forEach(s=>g.push(...edC("edgry",[edCyl(0.08,0.07,"x",s*(hw-0.02),y,K.Z(X))]))); return g; })(ED.aoa_vane.geo);
ED.aoa_vane.lab=K=>{ const X=4.7, y=K.zc(X)+0.12, hw=K.half(X,y); return [["ريشة زاوية الهجوم (مجسّ يدور مع تيار الهواء)","Angle-of-attack vane (aligns with the airflow)",[hw+0.1,y+0.3,K.Z(X)]],["علبة المقياس والتسخين","Sensor and heater housing",[hw-0.1,y-0.2,K.Z(X)]],["الريشة اليسرى","Left vane",[-hw-0.1,y+0.3,K.Z(X)]]]; };

/* ---- passenger oxygen (103), the APU inlet door (80) ---- */
ED.oxygen_pax={layer:"int",mk:"edorg",cam:[Math.PI-0.7,0.9],
  geo:K=>{ const S=edSeatRows(K), g=[]; S.rows.filter((X,i)=>i%2===0).forEach(X=>{ [-1,1].forEach(s=>{ const x=s*1.02, y=4.38, z=K.Z(X);
      g.push(...edC("edwht",[edBox(0.78,0.07,0.2,x,y,z)]));                                                                                      /* the service unit over the seats */
      g.push(...edC("edorg",[edCyl(0.045,0.2,"x",x,y+0.09,z)]));                                                                                 /* the chemical oxygen generator */
      g.push(...edC("edyel",[edBox(0.07,0.07,0.06,x-0.25,y-0.06,z),edBox(0.07,0.07,0.06,x,y-0.06,z),edBox(0.07,0.07,0.06,x+0.25,y-0.06,z)]));   /* masks in the drop-out box */
      g.push(...edC("edgrn",[edBox(0.03,0.04,0.03,x+0.35,y+0.1,z)])); }); });                                                                    /* flow indicator */
    return g; },
  lab:K=>{ const S=edSeatRows(K), X=S.rows[S.rows.length>>1]||20; return [["مولّد الأكسجين الكيميائي","Chemical oxygen generator",[1.02,4.75,K.Z(X)]],["الأقنعة داخل الصندوق","Masks in the drop-out box",[-1.02,4.15,K.Z(X)]],["مؤشّر التدفق","Flow indicator",[1.4,4.7,K.Z(X)]]]; }};
ED.apu_inlet.geo=K=>{ const X=35.4, y=K.zc(X)+0.05, hw=K.half(X,y), g=[]; [-1,1].forEach(s=>{
    g.push(...edC("eddark",[edBox(0.035,0.42,0.9,s*(hw+0.005),y,K.Z(X))]));                                                                        /* the door closed */
    g.push(...edC("edgld",[edRot(edBox(0.02,0.42,0.9,s*(hw+0.3),y,K.Z(X)-0.15),'y',s*0.9)]));                                                       /* the door open (second position) */
    g.push(...edC("edgry",[edCyl(0.03,0.35,"x",s*(hw-0.2),y+0.1,K.Z(X)+0.2),edBar([s*(hw-0.02),y+0.15,K.Z(X)+0.4],[s*(hw-0.35),y+0.1,K.Z(X)+0.2],0.015)]));   /* the door actuator */
    g.push(...edC("edcy",[edTube(0.22,0.6,"x",s*(hw-0.4),y,K.Z(X)-0.1,16)]));                                                                      /* the inlet duct to the APU */ });
  return g; };
ED.apu_inlet.lab=K=>{ const X=35.4, y=K.zc(X)+0.05, hw=K.half(X,y); return [["باب المدخل (مغلق)","Inlet door (closed)",[hw,y+0.45,K.Z(X)]],["باب المدخل (مفتوح)","Inlet door (open)",[hw+0.4,y+0.1,K.Z(X)-0.15]],["مشغّل الباب","Door actuator",[hw-0.2,y+0.35,K.Z(X)+0.3]],["مجرى الهواء إلى APU","Duct to the APU",[hw-0.4,y-0.3,K.Z(X)-0.1]]]; };

/* ---- the wing structure with the wing itself kept visible (104): the other parts of the wing show as a ghost while a structural part is selected ---- */
const EDGW={wingbox:0.34,slats:0.26,flaps:0.26,aileron:0.28,spoilers:0.26,wingtip:0.26};
["wing_front_spar","wing_rear_spar","wing_ribs","wing_skin_panels","slat_tracks","flap_actuators","flap_track_fairing","jb_krueger","spoiler_pcu","fuel_wing_tank","fuel_boost_pump","wing_root_fitting"].forEach(id=>{ if(ED[id]) ED[id].ghost=EDGW; });
edFinish();

/* ---- keel beam with its surroundings (62), fan-blade root labels (65), the second satellite-communication antenna from the antenna diagram (77) ---- */
ED.keel_beam.geo=(g0=>K=>{ const g=g0(K).map(x=>{ x.edmk="edgld"; return x; }), Z=K.Z;
  edFrame(3.5,0.8,5.0,0,2.05,Z(17.9),0.03).forEach(b=>{ b.edmk="edblu"; g.push(b); });                                                          /* the centre wing box */
  edFrame(3.2,0.7,2.6,0,1.55,Z(18.1),0.025).forEach(b=>{ b.edmk="edred"; g.push(b); });                                                         /* the main-gear bay opening */
  [-1.55,1.55].forEach(x=>g.push(...edC("edmet",[edBox(0.08,0.9,5.0,x,2.0,Z(17.9))])));                                                          /* the side walls of the box */
  return g; })(ED.keel_beam.geo);
ED.keel_beam.lab=K=>{ const y=K.bot(18.0)+0.22, Z=K.Z; return [["عارضة الكيل (Keel beam)","Keel beam",[0.2,y+0.4,Z(18.2)]],["الصندوق الأوسط للجناح","Centre wing box",[1.6,2.55,Z(16.4)]],["حجرة جهاز الهبوط الرئيسي","Main-gear bay",[1.4,1.2,Z(18.1)]],["جانبا الصندوق","Box side walls",[-1.55,2.5,Z(19.6)]]]; };
ED.eng_fan_blades.lab=K=>[["شفرة المروحة (ملتوية)","Fan blade (twisted)",[EDN.x+0.7,EDN.y+0.7,-5.35]],["جسم الشفرة (Blade body)","Blade body",[EDN.x+0.3,EDN.y+0.3,-5.35]],["جذر الشفرة (Tenon / Dovetail)","Blade root (tenon / dovetail)",[EDN.x-0.05,EDN.y+0.28,-5.35]],["حلقة التثبيت في منتصف الشفرة","Part-span shroud",[EDN.x-0.45,EDN.y+0.45,-5.35]]];
ED.ant_iridium={layer:"ext",mk:"edwht",meta:["ant_iridium","هوائي SATCOM ثانٍ (اختياري)","Second SATCOM antenna (optional)","ATA 23","sys","fuse_mid",["F",0.37,"t"],
  "هوائي اختياري فوق الجسم للاتصال بالأقمار الصناعية، يُركَّب على بعض الطائرات بجانب هوائي SATCOM الآخر.",[["Antenna dome","قبة الهوائي"],["Base plate","القاعدة"]],[["boltnut","مسامير"]],["نظافة القبة","وصلة الكابل"],{only:"b737"}],
  geo:K=>{ const X=14.8, y=K.top(X), z=K.Z(X), g=[]; g.push(edBox(0.34,0.02,0.34,0.3,y,z),edSph(0.16,0.3,y+0.02,z,1,0.6,1)); return g; },
  lab:K=>{ const X=14.8, y=K.top(X); return [["SATCOM ثانٍ (اختياري)","Second SATCOM (optional)",[0.3,y+0.35,K.Z(X)]]]; }};
edFinish();
