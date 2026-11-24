/* ---------- (ed) part 2, batch B (items 62-64, 69-78, 81, 83-84, 87-88): air-conditioning packs and ducts, the bleed-air / hydraulic / air-data system diagrams, ADIRU, TRUs, static inverter, flight recorders, ELT.
   A "diagram" part is a 3D schematic: the real components at their places, joined by coloured pipes, with a label on each. See m_ed737.js. ---------- */
function edFrame(w,h,d,x,y,z,r){ const g=[], X=[x-w/2,x+w/2], Y=[y-h/2,y+h/2], Z=[z-d/2,z+d/2];
  X.forEach(a=>Y.forEach(b=>g.push(edBar([a,b,Z[0]],[a,b,Z[1]],r)))); X.forEach(a=>Z.forEach(c=>g.push(edBar([a,Y[0],c],[a,Y[1],c],r)))); Y.forEach(b=>Z.forEach(c=>g.push(edBar([X[0],b,c],[X[1],b,c],r)))); return g; }

/* ---- air-conditioning pack: heat exchangers, air-cycle machine, ram inlet, recirculation fans, mix manifold (64, 78, 81, 84, 74) ---- */
ED.pack_heat_exch={layer:"int",mk:"edyel",both:true,cam:[Math.PI-0.8,1.0],
  geo:K=>{ const Z=K.Z, x=0.8, y=2.2, g=[];
    g.push(...edC("edyel",[edBox(0.5,0.34,0.5,x,y,Z(16.2)),edBox(0.5,0.34,0.5,x,y,Z(17.0))]));                                          /* primary and secondary exchangers */
    for(let i=-3;i<=3;i++) g.push(...edC("edgry",[edBox(0.5,0.012,0.52,x,y+i*0.05,Z(16.2)),edBox(0.5,0.012,0.52,x,y+i*0.05,Z(17.0))]));   /* the fins */
    g.push(...edC("edblu",[edBox(0.58,0.025,1.8,x,y+0.25,Z(16.6)),edBox(0.58,0.025,1.8,x,y-0.25,Z(16.6))]));                          /* the ram-air duct (top and bottom plates) */
    [15.45,15.7,17.55].forEach(X=>g.push(...edC("edcy",[edCyl(0.06,0.2,"z",x,y,Z(X),10,0)])));                                         /* ram-air flow arrows */
    return g; },
  lab:K=>{ const Z=K.Z, x=0.8, y=2.2; return [["المبدّل الحراري الأولي","Primary heat exchanger",[x,y+0.5,Z(16.2)]],["المبدّل الحراري الثانوي","Secondary heat exchanger",[x,y+0.5,Z(17.0)]],["مجرى هواء الاندفاع (Ram air)","Ram-air duct",[x+0.3,y-0.45,Z(16.6)]],["اتجاه تدفق هواء التبريد","Ram-air flow",[x,y-0.35,Z(15.5)]]]; }};
ED.pack_acm={layer:"int",mk:"edmet",both:true,cam:[Math.PI-0.8,1.0],
  geo:K=>{ const Z=K.Z, x=0.45, y=2.55, g=[];
    g.push(...edC("edmet",[edBar([x,y,Z(16.3)],[x,y,Z(17.0)],0.035)]));                                                               /* the shaft */
    g.push(...edC("edblu",[edCyl(0.15,0.14,"z",x,y,Z(16.45),16,0.07)]));                                                              /* compressor */
    g.push(...edC("edred",[edCyl(0.07,0.14,"z",x,y,Z(16.68),16,0.14)]));                                                              /* turbine */
    g.push(...edC("edgld",[edDisc(0.18,0.18,0.04,x,y,Z(16.9))]));                                                                     /* cooling fan */
    g.push(...edC("edyel",[edBox(0.3,0.2,0.22,x,y-0.35,Z(15.7)),edBox(0.2,0.16,0.2,x+0.4,y-0.35,Z(15.7))]));                           /* condenser and reheater */
    g.push(...edC("edcy",[edCyl(0.07,0.22,"y",x+0.4,y-0.65,Z(15.7))]));                                                                /* water extractor */
    g.push(...edC("edred",edPipe([[0.05,2.3,Z(15.2)],[x-0.2,y,Z(15.2)],[x-0.2,y,Z(16.35)]],0.035)));                                  /* hot bleed air in */
    g.push(...edC("edcy",edPipe([[x,y,Z(16.75)],[0.15,y-0.1,Z(15.0)],[0.0,2.2,Z(14.4)]],0.04)));                                      /* cold air out to the mix manifold */
    g.push(...edC("edgrn",[edBox(0.1,0.1,0.1,x-0.28,y-0.1,Z(15.9))]));                                                                /* temperature control valve */
    return g; },
  lab:K=>{ const Z=K.Z, x=0.45, y=2.55; return [["الضاغط","Compressor",[x,y+0.3,Z(16.45)]],["التوربين","Turbine",[x,y+0.3,Z(16.68)]],["المروحة","Cooling fan",[x,y+0.3,Z(16.95)]],["المكثّف","Condenser",[x,y-0.55,Z(15.7)]],["مستخلص الماء","Water extractor",[x+0.4,y-0.95,Z(15.7)]],["هواء النزف الساخن","Hot bleed air",[x-0.25,y+0.2,Z(15.2)]],["هواء بارد إلى مجمّع الخلط","Cold air to the mix manifold",[0.1,y-0.15,Z(14.8)]],["صمام التحكم بالحرارة","Temperature control valve",[x-0.3,y,Z(15.9)]]]; }};
ED.ram_air_inlet={layer:"ext",mk:"edmet",both:true,
  geo:K=>{ const Z=K.Z, yb=K.bot(17.2)-0.04, g=[];
    g.push(...edC("edmet",[edBox(0.5,0.2,0.5,1.0,yb,Z(17.2)),edBox(0.5,0.2,0.46,1.0,yb,Z(19.4))]));                                    /* inlet scoop and exit housing */
    g.push(...edC("edred",[edRot(edBox(0.46,0.02,0.4,1.0,yb-0.02,Z(17.35)),'x',-0.45)]));                                              /* ram-air door */
    g.push(...edC("edgld",[edBox(0.46,0.12,0.02,1.0,yb-0.04,Z(16.92))]));                                                            /* deflector door */
    g.push(...edC("edblu",[edRot(edBox(0.46,0.02,0.4,1.0,yb-0.02,Z(19.5)),'x',0.4)]));                                                  /* exit door */
    g.push(...edC("edcy",edPipe([[1.0,yb+0.1,Z(17.2)],[0.95,2.05,Z(16.9)]],0.07)));                                                   /* duct to the heat exchangers */
    return g; },
  lab:K=>{ const Z=K.Z, yb=K.bot(17.2)-0.04; return [["باب هواء الاندفاع (Ram air door)","Ram-air door",[1.0,yb-0.25,Z(17.35)]],["باب العاكس (Deflector)","Deflector door",[1.0,yb-0.3,Z(16.85)]],["مجرى الهواء","Ram-air duct",[1.0,yb+0.5,Z(17.0)]],["باب الخروج","Exit door",[1.0,yb-0.25,Z(19.6)]]]; }};
ED.recirc_fan={layer:"int",mk:"edgry",both:true,cam:[Math.PI-0.7,1.0],
  geo:K=>{ const Z=K.Z, x=0.62, y=2.4, g=[];
    g.push(...edC("edgry",[edTube(0.22,0.4,"z",x,y,Z(13.2),20),edCyl(0.1,0.2,"z",x,y,Z(13.45))]));                                    /* fan housing and motor */
    g.push(...edC("edgld",[edDisc(0.19,0.19,0.025,x,y,Z(13.15))]));                                                                  /* the fan wheel */
    g.push(...edC("edwht",[edBox(0.4,0.34,0.1,x,y,Z(12.8))]));                                                                       /* filter */
    g.push(...edC("edcy",edPipe([[x,y,Z(13.6)],[x*0.4,y-0.12,Z(14.0)],[0,2.25,Z(14.3)]],0.06)));                                      /* duct to the mix manifold */
    g.push(...edC("edorg",[edBox(0.22,0.22,0.3,x*0.4,y+0.32,Z(14.5)),edCyl(0.1,0.03,"x",x*0.4,y+0.32,Z(14.5))]));                    /* trim-air pressure regulator and shut-off valve */
    return g; },
  lab:K=>{ const Z=K.Z, x=0.62, y=2.4; return [["مروحة إعادة التدوير","Recirculation fan",[x,y+0.35,Z(13.2)]],["المرشّح","Filter",[x,y-0.3,Z(12.8)]],["مجرى إلى مجمّع الخلط","Duct to the mix manifold",[x*0.5,y-0.25,Z(13.9)]],["منظّم ضغط الهواء المقطّر (Trim air)","Trim-air pressure regulator and shut-off valve",[x*0.4,y+0.65,Z(14.5)]]]; }};
ED.mix_manifold={layer:"int",mk:"edgry",cam:[Math.PI-0.7,1.0],
  geo:K=>{ const Z=K.Z, y=2.2, zc=Z(14.4), g=[];
    g.push(...edC("edgry",[edSph(0.42,0,y,zc,1,0.8,1.2)]));                                                                           /* the manifold */
    g.push(...edC("edcy",edPipe([[-0.8,2.2,Z(15.2)],[-0.45,y,zc+0.1]],0.07).concat(edPipe([[0.8,2.2,Z(15.2)],[0.45,y,zc+0.1]],0.07))));    /* from the left and right packs */
    g.push(...edC("edcy",edPipe([[-0.62,2.4,Z(13.3)],[-0.3,y,zc-0.1]],0.06).concat(edPipe([[0.62,2.4,Z(13.3)],[0.3,y,zc-0.1]],0.06))));  /* recirculated cabin air */
    g.push(...edC("edgrn",edPipe([[0,y-0.35,zc],[0,1.6,zc]],0.06)));                                                                 /* ground conditioned air connection */
    [[-0.25,Z(12.0)],[0,Z(15.9)],[0.25,Z(18.0)]].forEach(([x,z],i)=>g.push(...edC("edcy",edPipe([[x*0.6,y+0.3,zc+(i-1)*0.3],[x,3.0,z],[x,3.8,z]],0.05))));   /* the three risers: flight deck/cabin zones */
    g.push(...edC("edred",[edBox(0.16,0.12,0.16,0,y+0.55,zc-0.3)]));                                                                   /* trim-air inlet */
    return g; },
  lab:K=>{ const Z=K.Z, y=2.2, zc=Z(14.4); return [["مجمّع الخلط","Mix manifold",[0,y+0.55,zc]],["من الحزمة اليسرى","From the left pack",[-0.7,y-0.15,Z(15.2)]],["من الحزمة اليمنى","From the right pack",[0.7,y-0.15,Z(15.2)]],["هواء مُعاد تدويره","Recirculated air",[0.55,y+0.3,Z(13.4)]],["مدخل هواء التهيئة الأرضي","Ground conditioned-air connection",[0,1.55,zc]],["قنوات التوزيع (3 مناطق)","Distribution ducts (3 zones)",[0.25,3.2,Z(18.0)]]]; }};

/* ---- the bleed-air system as a diagram (73): engine valves, isolation valve, pack valves, APU and ground supply ---- */
ED.bleed_diagram={layer:"int",mk:"edred",both:false,cam:[Math.PI-0.85,1.05],meta:["bleed_diagram","مخطط الهواء المضغوط (Bleed air)","Bleed-air system diagram","ATA 36","sys","packs",["F",0.43,"b",0.8],
  "كل محرك يمدّ الجسم بهواء ساخن مضغوط عبر صمام. الهواء يمشي بقناتين جانبيتين، وصمام العزل بينهما، إلى حزمتي التكييف ومنع الجليد. الـAPU أو مصدر أرضي يمدّ القناة عند توقف المحركات.",[["Engine bleed valve","صمام سحب المحرك"],["Isolation valve","صمام العزل"],["Pack valve","صمام الحزمة"],["APU bleed valve","صمام هواء APU"]],[["boltnut","وصلات"]],["تسريب بالوصلات","ضغط القناة"],{int:true,only:"b737"}],
  geo:K=>{ const Z=K.Z, g=[], hdr=2.3, zh=-3.8, ex=EDN.x;
    [-1,1].forEach(s=>{ g.push(...edC("edred",edPipe([[s*(ex+0.2),EDN.y+0.5,-4.6],[s*ex,2.25,-4.2],[s*3.2,2.2,-3.6],[s*1.1,hdr,zh]],0.045)));            /* engine to the pneumatic duct */
      g.push(...edC("edgld",[edBox(0.2,0.14,0.2,s*(ex+0.2),EDN.y+0.55,-4.6),edBox(0.16,0.12,0.16,s*0.9,hdr+0.0,zh+0.8)]));                                    /* engine bleed valve, pack valve */
      g.push(...edC("edred",edPipe([[s*1.1,hdr,zh],[s*0.9,hdr,zh+0.8]],0.045)));
      g.push(...edC("edyel",[edBox(0.18,0.12,0.18,s*2.2,2.15,-3.5)]));                                                                                     /* wing anti-ice valve */
      g.push(...edC("edorg",[edBox(0.14,0.12,0.14,s*(ex+0.5),EDN.y-0.5,-4.35)])); });                                                                        /* air-starter valve */
    g.push(...edC("edred",[edBar([-1.1,hdr,zh],[1.1,hdr,zh],0.045)]));                                                                                      /* the cross-over */
    g.push(...edC("edgld",[edBox(0.24,0.18,0.24,0,hdr,zh)]));                                                                                               /* isolation valve */
    g.push(...edC("edred",edPipe([[0,hdr,zh],[0,hdr+0.1,Z(30)],[0,hdr+0.1,Z(35.0)],[0,hdr+0.0,Z(36.0)]],0.04)));                                          /* line from the APU */
    g.push(...edC("edgld",[edBox(0.2,0.14,0.2,0,hdr+0.1,Z(35.2))]));                                                                                         /* APU bleed valve */
    g.push(...edC("edgrn",edPipe([[0,hdr,zh],[0,1.55,zh]],0.04)));                                                                                           /* external (ground) air connection */
    return g; },
  lab:K=>{ const Z=K.Z, zh=-3.8, ex=EDN.x; return [["صمام سحب المحرك","Engine bleed valve",[ex+0.2,EDN.y+0.85,-4.6]],["قناة الهواء المضغوط","Pneumatic duct",[2.2,2.55,-3.7]],["صمام العزل","Isolation valve",[0,2.6,zh]],["صمام الحزمة","Pack valve",[0.9,2.5,zh+0.8]],["صمام منع الجليد (جناح)","Wing anti-ice valve",[2.2,2.5,-3.5]],["بادئ الهواء","Air-starter valve",[ex+0.5,EDN.y-0.75,-4.35]],["صمام هواء الـAPU","APU bleed valve",[0,2.5,Z(35.2)]],["وصلة الهواء الأرضي","External air connection",[0,1.45,zh]]]; }};

/* ---- the hydraulic system as a diagram (71): reservoirs, pumps, PTU, lines to the controls and the gear ---- */
ED.hyd_diagram={layer:"int",mk:"edred",cam:[Math.PI-0.85,1.05],meta:["hyd_diagram","مخطط النظام الهيدروليكي","Hydraulic system diagram","ATA 29","hyd","hyd",["F",0.47,"b",0.5],
  "نظامان مستقلان A وB، لكل واحد خزان ومضختان (واحدة يديرها المحرك وأخرى كهربائية)، ونظام احتياطي. الأنابيب تغذّي سطوح التحكم والفرامل والجهاز، ووحدة PTU تنقل القدرة بين A وB.",[["Reservoir A/B","خزانا النظامين A وB"],["EDP","مضخة يديرها المحرك"],["EMDP","مضخة بمحرك كهربائي"],["PTU","وحدة نقل القدرة"]],[["boltnut","وصلات"]],["تسريب الأنابيب","مستوى الخزان"],{int:true,only:"b737"}],
  geo:K=>{ const Z=K.Z, g=[], yR=1.95, zr=Z(17.6);
    g.push(...edC("edred",[edCyl(0.16,0.5,"y",-0.9,yR,zr),edCyl(0.07,0.2,"y",-0.9,yR+0.35,zr)]));                                       /* reservoir A */
    g.push(...edC("edblu",[edCyl(0.16,0.5,"y",0.9,yR,zr),edCyl(0.07,0.2,"y",0.9,yR+0.35,zr)]));                                        /* reservoir B */
    g.push(...edC("edyel",[edCyl(0.12,0.4,"y",0,1.85,Z(18.4))]));                                                                     /* standby reservoir */
    [[-1,"edred"],[1,"edblu"]].forEach(([s,k])=>{ g.push(...edC(k,[edCyl(0.1,0.3,"z",s*0.9,1.7,Z(18.4))]));                              /* the electric pumps */
      g.push(...edC("edgld",[edCyl(0.12,0.3,"z",s*(EDN.x-0.25),EDN.y-0.66,-3.65)]));                                                    /* the engine-driven pumps */
      g.push(...edC(k,edPipe([[s*(EDN.x-0.25),EDN.y-0.5,-3.65],[s*(EDN.x-0.25),1.75,-3.2],[s*3.0,2.0,-2.9],[s*0.9,2.0,Z(17.4)]],0.03)));    /* EDP to the system */
      g.push(...edC(k,edPipe([[s*0.9,1.7,Z(18.4)],[s*0.9,1.75,Z(17.8)]],0.03)));
      const W=K.W; const a=edWp(W,0.3,0.78,0), b=edWp(W,0.85,0.78,0);                                                                    /* a line along the rear spar to the control surfaces */
      g.push(...edC(k,edPipe([[s*0.9,1.9,Z(17.4)],[s*a.x,a.y,a.z],[s*b.x,b.y,b.z]],0.025)));
      g.push(...edC(k,edPipe([[s*0.9,1.8,Z(17.7)],[s*2.8,1.5,Z(18.0)]],0.03))); });                                                      /* to the landing gear */
    g.push(...edC("edgrn",[edBox(0.2,0.14,0.34,0,1.7,Z(19.2))]));                                                                       /* power transfer unit */
    g.push(...edC("edred",edPipe([[-0.9,1.7,Z(18.4)],[0,1.7,Z(19.2)]],0.025))); g.push(...edC("edblu",edPipe([[0.9,1.7,Z(18.4)],[0,1.7,Z(19.2)]],0.025)));
    g.push(...edC("edyel",edPipe([[0,1.85,Z(18.4)],[0,1.95,Z(30)],[0,2.0,Z(36.5)]],0.025)));                                           /* the standby line aft to the rudder */
    return g; },
  lab:K=>{ const Z=K.Z, yR=1.95; return [["خزان النظام A","Reservoir A",[-0.9,yR+0.7,Z(17.6)]],["خزان النظام B","Reservoir B",[0.9,yR+0.7,Z(17.6)]],["الخزان الاحتياطي","Standby reservoir",[0,2.3,Z(18.4)]],["مضخة كهربائية","Electric motor-driven pump",[0.9,1.35,Z(18.4)]],["مضخة يديرها المحرك","Engine-driven pump",[EDN.x-0.25,EDN.y-0.95,-3.65]],["وحدة نقل القدرة (PTU)","Power transfer unit",[0,1.4,Z(19.2)]],["خط إلى سطوح التحكم","Line to the flight controls",[2.2,2.3,-0.9]],["خط إلى جهاز الهبوط","Line to the landing gear",[2.0,1.4,Z(18.0)]]]; }};
ED.hyd_epump={layer:"int",mk:"edgld",both:true,cam:[Math.PI-0.85,1.05],
  geo:K=>{ const Z=K.Z, x=0.9, y=1.7, z=Z(18.4), g=[];
    g.push(...edC("edgld",[edCyl(0.1,0.3,"z",x,y,z-0.1),edCyl(0.07,0.18,"z",x,y,z+0.2)]));                                             /* motor and pump */
    g.push(...edC("edgry",[edTube(0.12,0.32,"z",x,y,z-0.1,16)]));
    g.push(...edC("edblk",[edBox(0.08,0.07,0.1,x+0.15,y+0.05,z-0.1)]));                                                                  /* motor connector */
    g.push(...edC("edorg",[edBox(0.06,0.06,0.07,x-0.16,y+0.1,z+0.2),edBox(0.06,0.06,0.07,x-0.16,y-0.1,z+0.2)]));                         /* pressure and temperature transducers */
    g.push(...edC("edred",edPipe([[x,y+0.08,z+0.3],[x,y+0.25,z+0.45]],0.022)));
    return g; },
  lab:K=>{ const Z=K.Z, x=0.9, y=1.7, z=Z(18.4); return [["المحرّك الكهربائي","Electric motor",[x,y+0.25,z-0.1]],["المضخّة","Pump",[x,y+0.25,z+0.25]],["مجسّات الضغط والحرارة","Pressure and temperature transducers",[x-0.2,y+0.25,z+0.2]],["موصّل المحرّك","Motor connector",[x+0.2,y+0.15,z-0.1]]]; }};
ED.hyd_reservoir={layer:"int",mk:"edred",both:true,cam:[Math.PI-0.85,1.05],
  geo:K=>{ const Z=K.Z, x=0.9, y=1.95, z=Z(17.6), g=[];
    g.push(...edC("edred",[edCyl(0.16,0.5,"y",x,y,z),edSph(0.16,x,y+0.25,z,1,0.5,1),edSph(0.16,x,y-0.25,z,1,0.5,1)]));
    g.push(...edC("edwht",[edCyl(0.05,0.34,"y",x+0.19,y,z)]));                                                                        /* the sight glass */
    g.push(...edC("edgld",[edCyl(0.045,0.1,"y",x,y+0.42,z)]));                                                                        /* filler cap */
    g.push(...edC("edorg",[edBox(0.06,0.06,0.07,x-0.2,y+0.12,z),edBox(0.06,0.06,0.07,x-0.2,y-0.1,z),edBox(0.06,0.06,0.07,x+0.0,y-0.3,z+0.17)]));   /* quantity, pressure and temperature transducers */
    return g; },
  lab:K=>{ const Z=K.Z, x=0.9, y=1.95, z=Z(17.6); return [["الخزان","Reservoir",[x,y+0.6,z]],["زجاجة قياس المستوى","Sight glass",[x+0.3,y,z]],["غطاء التعبئة","Filler cap",[x,y+0.65,z]],["مجسّات الكمية والضغط والحرارة","Quantity, pressure and temperature transducers",[x-0.3,y+0.1,z]]]; }};

/* ---- the air-data system as a diagram (75, 72): probes and ports, ADMs, ADIRU, displays ---- */
ED.adiru={layer:"int",mk:"edblu",both:true,cam:[Math.PI-0.7,0.9],
  geo:K=>{ const x=0.75, y=EDE.y, z=K.Z(EDE.z0+0.4), g=[];
    edFrame(0.5,0.34,0.56,x,y,z,0.012).forEach(b=>g.push(...edC("edmet",[b])));                                                          /* the unit's outline */
    g.push(...edC("edgrn",[edBox(0.14,0.12,0.2,x-0.15,y-0.07,z-0.16)]));                                                                  /* power supply module */
    g.push(...edC("edblu",[edBox(0.16,0.12,0.2,x+0.1,y-0.07,z-0.16)]));                                                                   /* inertial-reference processor */
    g.push(...edC("edyel",[edBox(0.16,0.12,0.2,x+0.1,y-0.07,z+0.14)]));                                                                   /* air-data processor */
    [-0.1,0,0.1].forEach(d=>g.push(...edC("edgry",[edCyl(0.035,0.06,"y",x-0.15+d,y+0.08,z+0.1)])));                                      /* three gyros */
    [-0.06,0.0,0.06].forEach(d=>g.push(...edC("edorg",[edBox(0.04,0.04,0.04,x-0.15+d,y+0.08,z+0.2)])));                                  /* accelerometers */
    g.push(...edC("edpur",[edBox(0.07,0.05,0.07,x-0.15,y-0.07,z+0.14)]));                                                                  /* analogue-to-digital converter */
    return g; },
  lab:K=>{ const x=0.75, y=EDE.y, z=K.Z(EDE.z0+0.4); return [["وحدة بيانات الهواء والقصور الذاتي (ADIRU)","ADIRU",[x,y+0.3,z]],["وحدة التغذية","Power supply",[x-0.15,y-0.3,z-0.16]],["معالج القصور الذاتي (IR)","Inertial-reference processor",[x+0.12,y-0.3,z-0.16]],["معالج بيانات الهواء (ADR)","Air-data processor",[x+0.12,y-0.3,z+0.14]],["مقاييس الدوران (Gyros)","Gyros",[x-0.15,y+0.25,z+0.1]],["مقاييس التسارع","Accelerometers",[x-0.15,y+0.22,z+0.25]]]; }};
ED.air_data_diagram={layer:"int",mk:"edcy",cam:[Math.PI-0.6,0.9],meta:["air_data_diagram","مخطط منظومة بيانات الهواء","Air-data system diagram","ATA 34","sys","avionics",["F",0.2,"c",0.3],
  "المجسّات (بيتو والضغط الساكن وزاوية الهجوم والحرارة الكلية) تنقل قياساتها إلى وحدات ADM ثم إلى وحدتي ADIRU، ومنها إلى شاشات القمرة والحواسيب الأخرى.",[["Pitot probes","مجسّات بيتو"],["Static ports","فتحات الضغط الساكن"],["ADM","وحدات بيانات الهواء"],["ADIRU","وحدة ADIRU"],["Displays","الشاشات"]],[["boltnut","وصلات"]],["انسداد الفتحات","تسريب الأنابيب"],{int:true,only:"b737"}],
  geo:K=>{ const Z=K.Z, g=[], yE=EDE.y, zE=Z(EDE.z0+0.4), hw4=K.half(4.4,K.zc(4.4)-0.15), hw11=K.half(11.8,K.zc(11.8)+0.05);
    [-1,1].forEach(s=>{ g.push(...edC("edcy",edPipe([[s*hw4*0.95,K.zc(4.4)-0.15,Z(4.4)],[s*1.1,K.zc(4.4)-0.4,Z(5.5)],[s*0.95,yE,Z(EDE.z0-0.2)]],0.02)));              /* pitot line to the ADM */
      g.push(...edC("edcy",edPipe([[s*hw11*0.95,K.zc(11.8)+0.05,Z(11.8)],[s*1.2,yE+0.35,Z(10.5)],[s*0.95,yE,Z(EDE.z0+0.8)]],0.02)));                                   /* static line to the ADM */
      g.push(...edC("edgld",[edBox(0.2,0.16,0.2,s*0.95,yE,Z(EDE.z0-0.2)),edBox(0.2,0.16,0.2,s*0.95,yE,Z(EDE.z0+0.8))]));                                             /* ADMs */
     });
    g.push(...edC("edblu",[edBox(0.46,0.3,0.5,0,yE,zE)]));                                                                                                      /* the ADIRU */
    g.push(...edC("edyel",edPipe([[0.1,K.zc(4.7)+0.12,Z(4.7)],[0.3,yE+0.1,Z(6.5)],[0.2,yE,zE-0.3]],0.015)));                                                          /* AOA (electrical) */
    g.push(...edC("edyel",edPipe([[0.15,K.zc(3.0)+0.55,Z(3.0)],[0.3,yE+0.15,Z(5.0)],[0.15,yE,zE-0.3]],0.015)));                                                       /* TAT (electrical) */
    [[-1.0,-0.6,-0.18,0.24,0.62,1.0]].forEach(xs=>xs.forEach((x,i)=>{ g.push(...edC("edblk",[edBox(0.26,0.26,0.1,x,3.75,Z(3.1))])); g.push(...edC("edyel",edPipe([[0,yE+0.15,zE],[0.0,3.0,Z(6.5)],[x,3.5,Z(3.4)]],0.01))); }));   /* six display units */
    return g; },
  lab:K=>{ const Z=K.Z, yE=EDE.y; return [["مجسّات بيتو","Pitot probes",[0.0,K.zc(4.4)-0.4,Z(4.4)]],["فتحات الضغط الساكن","Static ports",[1.9,K.zc(11.8)+0.2,Z(11.8)]],["وحدات ADM","Air data modules",[0.95,yE+0.25,Z(EDE.z0-0.2)]],["وحدة ADIRU","ADIRU",[0,yE+0.28,Z(EDE.z0+0.4)]],["مجسّ زاوية الهجوم","Angle-of-attack sensor",[0.1,K.zc(4.7)+0.35,Z(4.7)]],["مجسّ الحرارة الكلية","Total air temperature probe",[0.15,K.zc(3.0)+0.85,Z(3.0)]],["شاشات القمرة","Display units",[0,4.1,Z(3.1)]]]; }};

/* ---- electrical: the three TRUs with their buses and relays (70), the static inverter (69) ---- */
ED.tru.geo=K=>{ const Z=K.Z, y=EDE.y, g=[], zt=Z(EDE.z0+0.9);
  [[-0.9,"TR1"],[-0.3,"TR2"]].forEach(([x])=>g.push(...edC("edgrn",[edBox(0.45,0.3,0.4,x,y,zt),edBox(0.4,0.04,0.34,x,y+0.17,zt)])));
  g.push(...edC("edgrn",[edBox(0.45,0.3,0.4,-0.6,y,Z(EDE.z0+1.5)),edBox(0.4,0.04,0.34,-0.6,y+0.17,Z(EDE.z0+1.5))]));                          /* TR3 */
  g.push(...edC("edcy",[edBar([-0.9,y+0.7,zt],[-0.3,y+0.7,zt],0.03),edBar([-0.9,y+0.17,zt],[-0.9,y+0.7,zt],0.015),edBar([-0.3,y+0.17,zt],[-0.3,y+0.7,zt],0.015)])); /* the two AC transfer buses */
  g.push(...edC("edyel",[edBox(0.16,0.1,0.14,-0.6,y+0.7,zt)]));                                                                                       /* transfer relay */
  g.push(...edC("edred",[edBar([-0.9,y-0.17,zt],[-0.3,y-0.17,zt],0.03),edBar([-0.9,y-0.17,zt],[-0.9,y-0.3,zt],0.015),edBar([-0.3,y-0.17,zt],[-0.3,y-0.3,zt],0.015)]));   /* the DC buses */
  g.push(...edC("edyel",[edBox(0.14,0.1,0.12,-0.6,y-0.17,zt+0.2)]));                                                                                  /* DC bus tie relay */
  return g; };
ED.tru.lab=K=>{ const Z=K.Z, y=EDE.y, zt=Z(EDE.z0+0.9); return [["وحدة تقويم TR1","TR1",[-0.9,y+0.25,zt]],["وحدة تقويم TR2","TR2",[-0.3,y+0.25,zt]],["وحدة تقويم TR3 (احتياط)","TR3 (standby)",[-0.6,y+0.25,Z(EDE.z0+1.5)]],["ناقلا التيار المتناوب","AC transfer buses",[-0.6,y+0.95,zt]],["مرحّل النقل","Transfer relay",[-0.6,y+0.85,zt]],["ناقلا التيار المستمر","DC buses",[-0.6,y-0.45,zt]],["مرحّل ربط الناقلات","DC bus tie relay",[-0.6,y-0.3,zt+0.2]]]; };
ED.static_inverter.geo=K=>{ const Z=K.Z, x=0.7, y=EDE.y, z=Z(EDE.z0+1.0), g=[];
  g.push(...edC("edblk",[edBox(0.5,0.28,0.42,x,y,z)]));
  g.push(...edC("edgry",[edBox(0.5,0.04,0.3,x,y+0.16,z)]));                                                                                           /* cooling fins on top */
  [-0.18,0.18].forEach(d=>g.push(...edC("edmet",[edBar([x+d,y+0.05,z-0.21],[x+d,y-0.1,z-0.3],0.014),edBar([x+d,y+0.05,z-0.21],[x+d,y+0.05,z-0.3],0.014),edBar([x+d,y-0.1,z-0.3],[x+d,y+0.05,z-0.3],0.014)])));   /* the two handles */
  g.push(...edC("edred",[edCyl(0.014,0.05,"z",x+0.12,y-0.08,z-0.22)])); g.push(...edC("edblu",[edCyl(0.014,0.05,"z",x-0.12,y-0.08,z-0.22)]));     /* + and - terminals */
  g.push(...edC("edgld",[edBox(0.07,0.06,0.03,x,y+0.05,z-0.22)]));                                                                                     /* connector J1 */
  g.push(...edC("edgry",[edCyl(0.07,0.02,"z",x-0.15,y-0.05,z+0.21),edCyl(0.07,0.02,"z",x+0.15,y-0.05,z+0.21)]));                                    /* vents / fans at the side */
  return g; };
ED.static_inverter.lab=K=>{ const Z=K.Z, x=0.7, y=EDE.y, z=Z(EDE.z0+1.0); return [["المحوّل الساكن (DC ← AC)","Static inverter (DC to AC)",[x,y+0.45,z]],["المقبضان","Handles",[x+0.25,y+0.0,z-0.35]],["القطبان + و−","+ and − terminals",[x,y-0.3,z-0.3]],["الموصّل J1","Connector J1",[x,y+0.15,z-0.25]],["زعانف التبريد","Cooling fins",[x,y+0.3,z]]]; };

/* ---- flight recorders and the ELT unit (87, 88, 83) ---- */
ED.fdr={layer:"int",mk:"edorg",cam:[Math.PI/2-0.6,1.0],
  geo:K=>{ const Z=K.Z, X=33.3, y=K.zc(X)+0.62, x=-0.3, z=Z(X), g=[];
    g.push(...edC("edorg",[edBox(0.42,0.26,0.3,x+0.18,y,z)]));                                                                              /* protective housing */
    g.push(...edC("edorg",[edCyl(0.09,0.34,"x",x-0.16,y,z)]));                                                                              /* crash-survivable memory unit */
    g.push(...edC("edgry",[edCyl(0.05,0.06,"x",x-0.36,y,z),edBox(0.5,0.03,0.36,x+0.05,y-0.15,z)]));                                       /* its end cap and the mounting base */
    g.push(...edC("edblk",[edBox(0.04,0.1,0.16,x+0.4,y,z)]));                                                                               /* data-port connector */
    g.push(...edC("edgrn",[edBox(0.28,0.02,0.2,x+0.18,y,z)]));                                                                              /* the electronic board inside */
    g.push(...edC("edblu",[edBox(0.12,0.12,0.2,x+0.3,y+0.0,z)]));                                                                           /* power supply module */
    return g; },
  lab:K=>{ const Z=K.Z, X=33.3, y=K.zc(X)+0.62, x=-0.3, z=Z(X); return [["وحدة الذاكرة المقاومة للتحطّم","Crash-survivable memory unit",[x-0.16,y+0.28,z]],["الغلاف الواقي","Protective housing",[x+0.2,y+0.28,z]],["القاعدة","Mounting base",[x,y-0.28,z]],["موصّل نقل البيانات","Data port connector",[x+0.4,y+0.18,z]],["اللوحة الإلكترونية","Electronic control board",[x+0.18,y+0.12,z+0.18]],["وحدة التغذية","Power supply module",[x+0.3,y-0.12,z+0.18]]]; }};
ED.cvr={layer:"int",mk:"edorg",cam:[Math.PI/2-0.6,1.0],
  geo:K=>{ const Z=K.Z, X=34.4, y=K.zc(X)+0.62, x=0.3, z=Z(X), g=[];
    g.push(...edC("edorg",[edBox(0.42,0.26,0.3,x-0.18,y,z),edCyl(0.09,0.34,"x",x+0.16,y,z)]));
    g.push(...edC("edgry",[edBox(0.5,0.03,0.36,x-0.05,y-0.15,z),edCyl(0.05,0.06,"x",x+0.36,y,z)]));
    g.push(...edC("edyel",[edCyl(0.022,0.2,"x",x-0.46,y+0.04,z+0.08)]));                                                                    /* underwater locator beacon */
    g.push(...edC("edblk",[edBox(0.04,0.1,0.16,x-0.4,y-0.04,z-0.08)]));
    g.push(...edC("edgrn",[edBox(0.28,0.02,0.2,x-0.18,y,z)]));
    return g; },
  lab:K=>{ const Z=K.Z, X=34.4, y=K.zc(X)+0.62, x=0.3, z=Z(X); return [["وحدة الذاكرة المقاومة للتحطّم","Crash-survivable memory unit",[x+0.16,y+0.28,z]],["الغلاف الواقي","Protective housing",[x-0.2,y+0.28,z]],["مرسل التحديد تحت الماء","Underwater locator beacon",[x-0.46,y+0.25,z+0.1]],["موصّل البيانات","Data connector",[x-0.4,y-0.22,z-0.1]],["القاعدة","Mounting base",[x,y-0.28,z]]]; }};
ED.elt_unit={layer:"int",mk:"edorg",cam:[Math.PI/2-0.6,1.0],meta:["elt_unit","وحدة مرسل الطوارئ (ELT)","ELT transmitter unit","ATA 23","sys","fuse_aft",["F",0.68,"t",-0.6],
  "جهاز صغير فوق سقف الكابينة الخلفي فيه مرسل ومستشعر صدمة وبطارية. يبدأ الإرسال تلقائياً عند الاصطدام أو يدوياً من مفتاح القمرة (ARM / ON)، ويرسل عبر الهوائي فوق الجسم.",[["Transmitter","مرسل الطوارئ"],["Impact switch","مفتاح الصدمة"],["Battery","بطارية ELT"]],[["boltnut","مسامير"]],["تاريخ البطارية","اختبار الإرسال"],{int:true,only:"b737"}],
  geo:K=>{ const Z=K.Z, X=27.0, y=K.top(X)-0.55, z=Z(X), g=[];
    g.push(...edC("edorg",[edBox(0.32,0.12,0.22,0.55,y,z)]));
    g.push(...edC("edgrn",[edBox(0.08,0.05,0.08,0.45,y+0.09,z-0.05)]));                                                                     /* impact (G) switch */
    g.push(...edC("edyel",[edBox(0.12,0.08,0.18,0.65,y+0.0,z+0.0)]));                                                                        /* battery pack */
    g.push(...edC("edgld",edPipe([[0.55,y+0.07,z],[0.3,K.top(27.6)-0.1,Z(27.6)],[0,K.top(27.6),Z(27.6)]],0.012)));                          /* coax cable to the ELT antenna on the roof */
    return g; },
  lab:K=>{ const Z=K.Z, X=27.0, y=K.top(X)-0.55, z=Z(X); return [["وحدة ELT (المرسل)","ELT transmitter unit",[0.55,y+0.3,z]],["مفتاح الصدمة","Impact switch",[0.42,y+0.22,z-0.1]],["البطارية","Battery",[0.7,y-0.2,z]],["كابل الهوائي","Antenna cable",[0.3,y+0.25,Z(27.3)]]]; }};
edFinish();
