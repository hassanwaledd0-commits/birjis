/* ---------- data v2: specs with sources, materials per part (with confidence), liveries (colours only, no logos or brand names) ---------- */
const SPECS = {
  a380:[
    ["الطول","72.7 م","GlobalAir (238 ft 7 in)، Qantas يذكر 72.57 م"],
    ["باع الجناحين","79.8 م","Qantas"],
    ["الارتفاع","24.1 م","GlobalAir (79 ft 1 in)"],
    ["الوزن الأقصى عند الإقلاع","560 طن","Qantas"],
    ["مساحة الجناح","845 م²","Qantas"],
    ["المحركات","4 × GP7200 أو Trent 900","GlobalAir"],
    ["سعة الوقود القصوى","310,400 لتر","Qantas"],
    ["المدى بالحمولة القصوى","14,800 كم","Qantas"],
    ["عرض المقصورة الرئيسية","6.54 م","Qantas"],
    ["المواد المركّبة","حوالي 22% من وزن الطائرة","FlightGlobal"],
    ["ضغط الهيدروليك","5,000 psi (بدل 3,000 المعتاد)","Airport-Technology"]
  ],
  b737:[
    ["الطول","39.5 م","LOT و SKYbrary"],
    ["باع الجناحين","35.8 م مع الـ winglets، وحوالي 34.3 م بدونها","LOT، SKYbrary"],
    ["الارتفاع","12.6 م","LOT"],
    ["الوزن الأقصى عند الإقلاع","79,015 كغ","LOT و FleetBoeing"],
    ["المحركات","2 × CFM56-7B، دفع حوالي 117 kN لكل محرك","SKYbrary"],
    ["سعة الوقود القصوى","21,320 كغ","LOT"],
    ["المدى","حوالي 5,400 كم","LOT و FleetBoeing"],
    ["السقف التشغيلي","12,500 م","LOT"],
    ["سرعة الرحلة","Mach 0.79","SKYbrary"],
    ["الهيكل","سبائك ألمنيوم عالية المقاومة في الجناح، ومواد مركّبة في مناطق محددة","Durstus (وثيقة هيكل الجناح)"],
    ["الفرامل","فرامل كربون متوفرة للـ737NG","Safran"]
  ],
  b747:[
    ["الطول","70.66 م (تقريبي)","قيمة تقريبية من مواصفات عامة منشورة"],
    ["باع الجناحين","64.44 م مع الـ winglets بارتفاع نحو 1.8 م (تقريبي)","قيمة تقريبية"],
    ["الارتفاع","19.41 م (تقريبي)","قيمة تقريبية"],
    ["الوزن الأقصى عند الإقلاع","حوالي 397 طناً","قيمة تقريبية"],
    ["مساحة الجناح","حوالي 525 م²","قيمة تقريبية"],
    ["المحركات","4 محركات توربينية مروحية (فئة CF6 وPW4000 وRB211)، دفع حوالي 250 kN لكل محرك","قيمة تقريبية"],
    ["سعة الوقود القصوى","حوالي 216,800 لتر","قيمة تقريبية"],
    ["المدى","حوالي 13,450 كم","قيمة تقريبية"],
    ["السقف التشغيلي","حوالي 13,700 م (45,100 قدم)","قيمة تقريبية"],
    ["سرعة الرحلة","Mach 0.85 تقريباً","قيمة تقريبية"],
    ["عرض المقصورة الرئيسية","حوالي 6.1 م","قيمة تقريبية"],
    ["الهيكل","سبائك ألمنيوم في الجسم والجناح، ومواد مركّبة في الغلاف والأسطح الخلفية","وصف عام تقريبي"]
  ]
};
/* material keys: al aluminium alloy · cfrp carbon-fibre composite · glare fibre-metal laminate · ti titanium · steel high-strength steel · glass · rubber · comp other composite · cbrake carbon brake
   conf: "مؤكد" = supported by a source listed in SPECS, "تقريبي" = general engineering practice, not checked against a specific document */
const MATLBL = {al:"سبائك ألمنيوم", cfrp:"ألياف كربون (CFRP)", glare:"GLARE (ألمنيوم + ألياف زجاجية)", ti:"تيتانيوم", steel:"فولاذ عالي المقاومة", glass:"زجاج / أكريليك", rubber:"مطاط", comp:"مركّبات أخرى", cbrake:"فرامل كربون"};
const MATCOL = {al:"#C7D0D9", cfrp:"#2E343B", glare:"#D9BE7A", ti:"#7F8FA3", steel:"#4E5A66", glass:"#7FB7DA", rubber:"#1E2226", comp:"#8F7FB0", cbrake:"#2A2F36"};
const MATS = {
  a380:{
    radome:["comp","تقريبي"], flightdeck:["al","تقريبي"], fuse_fwd:["al","تقريبي"], fuse_mid:["glare","تقريبي"], fuse_aft:["glare","تقريبي"],
    doors:["al","تقريبي"], windows:["glass","تقريبي"], wingbox:["al","تقريبي"],
    slats:["comp","تقريبي"], flaps:["comp","تقريبي"], aileron:["comp","تقريبي"], spoilers:["comp","تقريبي"], wingtip:["comp","تقريبي"],
    stabilizer:["cfrp","تقريبي"], elevator:["comp","تقريبي"], fin:["cfrp","تقريبي"],
    engine:["ti","تقريبي"], eng_inlet:["al","تقريبي"], eng_fancowl:["comp","تقريبي"], eng_fandoor:["comp","تقريبي"], eng_tr:["comp","تقريبي"],
    eng_nozzle:["ti","تقريبي"], eng_fan:["ti","تقريبي"], eng_core:["steel","تقريبي"], eng_pylon:["steel","تقريبي"], gear_main:["steel","تقريبي"], gear_nose:["steel","تقريبي"], wheels:["rubber","تقريبي"],
    fuel:["al","تقريبي"], hyd:["steel","تقريبي"], packs:["al","تقريبي"], avionics:["al","تقريبي"], apu:["ti","تقريبي"]
  },
  b737:{
    radome:["comp","تقريبي"], flightdeck:["al","تقريبي"], fuse_fwd:["al","تقريبي"], fuse_mid:["al","تقريبي"], fuse_aft:["al","تقريبي"],
    doors:["al","تقريبي"], windows:["glass","تقريبي"], wingbox:["al","مؤكد"],
    slats:["al","تقريبي"], flaps:["al","تقريبي"], aileron:["al","تقريبي"], spoilers:["al","تقريبي"], wingtip:["comp","تقريبي"],
    stabilizer:["al","تقريبي"], elevator:["al","تقريبي"], fin:["al","تقريبي"],
    engine:["ti","تقريبي"], eng_inlet:["al","تقريبي"], eng_fancowl:["comp","تقريبي"], eng_fandoor:["comp","تقريبي"], eng_tr:["comp","تقريبي"],
    eng_nozzle:["ti","تقريبي"], eng_fan:["ti","تقريبي"], eng_core:["steel","تقريبي"], eng_pylon:["steel","تقريبي"], gear_main:["steel","تقريبي"], gear_nose:["steel","تقريبي"], wheels:["rubber","تقريبي"],
    fuel:["al","تقريبي"], hyd:["steel","تقريبي"], packs:["al","تقريبي"], avionics:["al","تقريبي"], apu:["ti","تقريبي"]
  },
  b747:{
    radome:["comp","تقريبي"], flightdeck:["al","تقريبي"], fuse_fwd:["al","تقريبي"], fuse_mid:["al","تقريبي"], fuse_aft:["al","تقريبي"],
    doors:["al","تقريبي"], windows:["glass","تقريبي"], wingbox:["al","تقريبي"],
    slats:["al","تقريبي"], flaps:["comp","تقريبي"], aileron:["comp","تقريبي"], spoilers:["comp","تقريبي"], wingtip:["al","تقريبي"],
    stabilizer:["al","تقريبي"], elevator:["comp","تقريبي"], fin:["al","تقريبي"],
    engine:["ti","تقريبي"], eng_inlet:["al","تقريبي"], eng_fancowl:["comp","تقريبي"], eng_fandoor:["comp","تقريبي"], eng_tr:["comp","تقريبي"],
    eng_nozzle:["ti","تقريبي"], eng_fan:["ti","تقريبي"], eng_core:["steel","تقريبي"], eng_pylon:["steel","تقريبي"], gear_main:["steel","تقريبي"], gear_nose:["steel","تقريبي"], wheels:["rubber","تقريبي"],
    fuel:["al","تقريبي"], hyd:["steel","تقريبي"], packs:["al","تقريبي"], avionics:["al","تقريبي"], apu:["ti","تقريبي"]
  }
};
/* colour schemes only: no logos, names or carrier branding */
const LIVERY = {
  /* skin/wing = body paint, stripe = cheat-line, tail = fin + engine rings base, tail2 = wide tail swoosh, acc = thin accent line (cheat-line and tail), ering = engine cowl ring, belly = lower fuselage; en = English name */
  classic:{name:"أبيض وأزرق", en:"White & blue", skin:"#EEF2F5", wing:"#DFE6EC", stripe:"#1F5AA0", tail:"#1F5AA0", tail2:"#5BA9E6", acc:"#7DBDF0", ering:"#1F5AA0", belly:"#8E98A3"},
  gold:{name:"أبيض وذهبي", en:"White & gold", skin:"#F7F5EF", wing:"#E7E2D6", stripe:"#B8925A", tail:"#B8925A", tail2:"#E3CB97", acc:"#7C5C2E", ering:"#B8925A", belly:"#9C927E"},
  green:{name:"أبيض وأخضر", en:"White & green", skin:"#F3F6F4", wing:"#E1E8E3", stripe:"#1E7A4C", tail:"#1E7A4C", tail2:"#5FBF8C", acc:"#A9DDC2", ering:"#1E7A4C", belly:"#8E9A92"},
  maroon:{name:"أبيض وعنابي", en:"White & maroon", skin:"#F5F2F2", wing:"#E6DEDF", stripe:"#6B1E2E", tail:"#6B1E2E", tail2:"#B04A5E", acc:"#D8B48E", ering:"#6B1E2E", belly:"#9A8F90"},
  sky:{name:"أزرق سماوي", en:"Sky blue", skin:"#F4F8FB", wing:"#E1EBF2", stripe:"#3AA0D8", tail:"#3AA0D8", tail2:"#1A6C9E", acc:"#1A6C9E", ering:"#3AA0D8", belly:"#8DA2B0"},
  navy:{name:"أزرق داكن وأبيض", en:"Navy & white", skin:"#1D3157", wing:"#E4E9EF", stripe:"#1D3157", tail:"#1D3157", tail2:"#C9D4E3", acc:"#E7EDF5", ering:"#1D3157", belly:"#F5F7FA"},
  purple:{name:"بنفسجي وذهبي", en:"Purple and gold", skin:"#F6F4F8", wing:"#E5E0EB", stripe:"#C6A04A", tail:"#4A1D7C", tail2:"#7B45B8", acc:"#E6CB84", ering:"#4A1D7C", belly:"#9A92A8"},
  teal:{name:"أخضر مزرق وفضي", en:"Teal and silver", skin:"#F2F6F6", wing:"#E0E8E8", stripe:"#0F6B73", tail:"#0F6B73", tail2:"#52B5B2", acc:"#BAC5CD", ering:"#0F6B73", belly:"#8DA1A5"},
  red:{name:"أحمر وأبيض", en:"Red and white", skin:"#F8F5F5", wing:"#E8E0E0", stripe:"#B3202A", tail:"#B3202A", tail2:"#E4545C", acc:"#F1BDBD", ering:"#B3202A", belly:"#A39798"},
  redgold:{name:"أحمر وذهبي", en:"Red & gold", skin:"#F8F6F2", wing:"#ECE8E2", stripe:"#C79F49", tail:"#A8122B", tail2:"#D8B25A", acc:"#EAD393", ering:"#A8122B", tip:"#A8122B", belly:"#B3AFAA"},
  raw:{name:"معدن بدون طلاء", en:"Bare metal", skin:"#C9D1D8", wing:"#B9C3CC", stripe:"#8A96A0", tail:"#8A96A0", tail2:"#9DA8B1", acc:"#A8B2BA", ering:"#9AA5AE", belly:"#7A8288"}
};
