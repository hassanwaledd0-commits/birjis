/* ---------- Boeing 747-400 flight deck (prefix jb). Same interactive framework as the 737 deck (p7a/p7c): every control sits in its panel with an explanation.
   Boeing family: control columns with yokes, MCP on the glareshield, EICAS (four engines) in the middle of the main panel, a pedestal with FOUR thrust levers,
   four fuel control switches, speed brake, flap lever, three CDUs and the fire panel. Panels that are identical to the 737 (navigation sources, APU, window and probe heat,
   air temperature, pressurisation, lights, EFIS, PFD/ND, CDU) are copied from CK.b737; everything that depends on the number of engines is rebuilt for four engines.
   Layout and wording are approximate and educational (not a training device). Loaded after p7c.js. ---------- */
(function(){
const A7=CK.b737, D=(a,b,c)=>[a,b,c];
const cp=p=>Object.assign({},p,{c:p.c.map(c=>Object.assign({},c))});
const get=(a,id)=>cp(A7.areas[a].panels.find(p=>p.id===id));
const pl=(p,x,y,w,h)=>{ p.x=x; p.y=y; if(w) p.w=w; if(h) p.h=h; return p; };
const N4=[1,2,3,4], I4=[0,1,2,3];
const run=(st,i)=>st["ctl.f"+(i+1)]===0, anyRun=st=>I4.some(i=>run(st,i)), nRun=st=>I4.filter(i=>run(st,i)).length;
const ac=st=>st["elm.bat"]===1&&(anyRun(st)||st["apu.sw"]>=1||st["elb.grd"]===0);   /* is AC power available (an engine, the APU or ground power) */
const LOWP=(id,x,y,o)=>lt(id,x,y,40,16,"LOW|PRESSURE","a",Object.assign({d:D("ضغط منخفض","يضيء كهرماني عندما يكون ضغط المضخة منخفضاً أو المضخة مطفأة.","مطفأ")},o||{}));
const hydOK=(st,i)=>(run(st,i)&&st["hyd.e"+(i+1)]===0)||st["hyd.d"+(i+1)]===2||(st["hyd.d"+(i+1)]===1&&ac(st));

/* ================= overhead (four columns, like the 737 deck but with four engines) ================= */
const OVH=[];
/* column 1: flight control, navigation sources, fuel */
OVH.push(pn("fltc","FLIGHT CONTROL",10,10,235,200,[
  tog("ydu",38,72,"YAW DAMPER|UPPER",["ON","OFF"],0,{c:1,gap:12,d:D("مخمّد الانعراج العلوي","في 747 مخمّدان للانعراج، أحدهما على الجزء العلوي من الدفة والآخر على السفلي. يحرّكان الدفة آلياً ليخمدا تأرجح الطائرة الجانبي (Dutch roll).","ON")}),
  tog("ydl",98,72,"YAW DAMPER|LOWER",["ON","OFF"],0,{c:1,gap:12,d:D("مخمّد الانعراج السفلي","مثل العلوي، ويعمل على الجزء السفلي من الدفة.","ON")}),
  lt("ydul",38,130,40,16,"YAW DAMPER|UPR","a",{when:"@fltc.ydu=1",d:D("المخمّد العلوي مفصول","يضيء عندما لا يعمل مخمّد الانعراج العلوي.","مطفأ")}),
  lt("ydll",98,130,40,16,"YAW DAMPER|LWR","a",{when:"@fltc.ydl=1",d:D("المخمّد السفلي مفصول","يضيء عندما لا يعمل مخمّد الانعراج السفلي.","مطفأ")}),
  tog("altarm",158,72,"ALTERNATE|FLAPS",["ARM","OFF"],1,{g:"r",gap:12,d:D("تسليح الجنيحات البديل","يسلّح النظام الكهربائي البديل لتحريك الجنيحات الخلفية والأمامية عند فشل النظام العادي.","OFF")}),
  tog("altpos",208,72,"",["UP","OFF","DOWN"],1,{d:D("تحريك الجنيحات البديل","يحرك الجنيحات كهربائياً بعد التسليح (UP لرفعها وDOWN لإنزالها).","OFF")}),
  lt("altl",158,130,40,16,"ALT FLAPS|ARMED","a",{when:"@fltc.altarm=0",d:D("الجنيحات البديل مسلّح","يضيء عند تسليح النظام البديل.","مطفأ")})]));
OVH.push(pl(get("ovhd","nav"),10,220,235,150));
OVH.push(pn("fuel","FUEL",10,380,235,340,[
  {k:"gau",id:"temp",x:36,y:116,r:24,lbl:"FUEL TEMP",v:0,val:()=>0.4,d:D("حرارة الوقود","يعرض حرارة الوقود في الخزان الرئيسي 2؛ يجب أن تبقى فوق حد التجمد.","فوق -43 درجة")},
  ...N4.map((n,i)=>lt("ev"+n,[35,92,150,207][i],24,40,16,"ENG VALVE|CLOSED","b",{when:"@ctl.f"+n+"=1",d:D("صمام وقود المحرك "+n,"أزرق ساطع عندما يكون الصمام مغلقاً (مفتاح الوقود CUTOFF).","مطفأ عند التشغيل")})),
  ...N4.map((n,i)=>lt("sv"+n,[35,92,150,207][i],46,40,16,"SPAR VALVE|CLOSED","b",{when:"@ctl.f"+n+"=1",d:D("صمام وقود الجناح "+n,"صمام في جذر الجناح يغلق مع مفتاح الوقود أو مقبض الحريق.","مطفأ")})),
  ...N4.map((n,i)=>tog("xf"+n,[86,122,158,194][i],118,"XFEED "+n,["CLOSE","OPEN"],0,{gap:12,d:D("صمام التغذية المتقاطعة "+n,"في 747 أربعة صمامات تغذية متقاطعة تربط خطوط الوقود بين المحركات لموازنة الوقود بين الخزانات.","مغلق")})),
  tog("ctl",28,200,"CTR L",["ON","OFF"],1,{c:1,d:D("مضخة الخزان المركزي اليسرى","تُشغّل عندما يكون في الخزان المركزي وقود، لأن الخزان المركزي يُستهلك أولاً.","ON إذا فيه وقود")}),
  tog("ctr",70,200,"CTR R",["ON","OFF"],1,{c:1,d:D("مضخة الخزان المركزي اليمنى","مثل اليسرى.","ON إذا فيه وقود")}),
  tog("stab",112,200,"STAB",["ON","OFF"],1,{c:1,d:D("مضخة خزان الذيل الأفقي","تنقل الوقود من وإلى الخزان الموجود في الذيل الأفقي لضبط مركز الثقل في الطيران.","حسب مرحلة الطيران")}),
  tog("r2",154,200,"RSV 2",["ON","OFF"],1,{c:1,d:D("مضخة الخزان الاحتياطي 2","الخزانان الاحتياطيان قرب طرف الجناح؛ يُنقل وقودهما إلى الخزانين الرئيسيين.","حسب الحاجة")}),
  tog("r3",196,200,"RSV 3",["ON","OFF"],1,{c:1,d:D("مضخة الخزان الاحتياطي 3","مثل 2.","حسب الحاجة")}),
  ...N4.map((n,i)=>LOWP("lp"+n,[30,86,142,198][i],262,{when:"!lp"+n})),
  ...N4.map((n,i)=>[["f","FWD"],["a","AFT"]].map(([k,t],j)=>tog("m"+n+k,[18,74,130,186][i]+j*24,300,n+" "+t,["ON","OFF"],0,{c:1,gap:10,d:D("مضخة الخزان الرئيسي "+n+" ("+t+")","لكل خزان رئيسي مضختان، أمامية وخلفية، تغذيان المحرك "+n+". تبقى كلتاهما ON في الطيران.","ON")}))).reduce((a,b)=>a.concat(b),[])],{sd:"FUEL"}));
/* column 2: electrical, generators, APU */
OVH.push(((p)=>{ const q=p.c.find(c=>c.id==="acs"); q.pos=["STBY","GRD","GEN 1","GEN 2","APU","GEN 3","GEN 4","TEST"]; q.v=2; return p; })(get("ovhd","elm")));
OVH.push(pn("elb","GENERATORS",255,255,235,295,[
  ...N4.map((n,i)=>lt("drv"+n,[30,88,146,204][i],24,40,16,"DRIVE","a",{d:D("عطل مولد المحرك "+n,"يضيء عند انخفاض ضغط زيت وحدة القيادة أو ارتفاع حرارتها.","مطفأ")})),
  ...N4.map((n,i)=>tog("dd"+n,[30,88,146,204][i],72,"DISC "+n,["DISC","NORM"],1,{g:"r",d:D("فصل مولد "+n,"يفصل المولد عن المحرك نهائياً في الطيران (لا يمكن إعادة توصيله إلا على الأرض).","NORMAL")})),
  ...N4.map((n,i)=>tog("g"+n,[30,88,146,204][i],132,"GEN "+n,["ON","OFF"],0,{c:1,s:1,d:D("مولد المحرك "+n,"يوصل مولد المحرك "+n+" بنواقل الكهرباء بعد تشغيل المحرك. في 747 أربعة مولدات رئيسية، مولد لكل محرك.","ON")})),
  ...N4.map((n,i)=>lt("gob"+n,[30,88,146,204][i],170,40,16,"GEN OFF|BUS","b",{when:"!gen"+n+"off",d:D("المولد "+n+" ليس على الناقل","يضيء أزرق عندما لا يغذي المولد ناقله.","مطفأ")})),
  tog("ag1",60,218,"APU GEN 1",["ON","OFF"],1,{s:0,d:D("مولد الـAPU الأول","يوصل أحد مولدي الـAPU بالنواقل.","OFF في الطيران")}),
  tog("ag2",118,218,"APU GEN 2",["ON","OFF"],1,{s:0,d:D("مولد الـAPU الثاني","يوصل المولد الثاني للـAPU بالنواقل.","OFF في الطيران")}),
  lt("apob",190,218,48,16,"APU GEN|OFF BUS","b",{when:"!apuAvailOff",d:D("مولد APU جاهز وغير موصول","يضيء أزرق عندما يكون الـAPU جاهزاً ومولداه غير موصولين.","مطفأ")}),
  tog("stby",50,268,"STANDBY POWER",["BAT","OFF","AUTO"],2,{g:"r",d:D("الكهرباء الاحتياطية","AUTO تغذي النواقل الأساسية من البطارية عند فقد كل المولدات.","AUTO")}),
  tog("grd",118,268,"GRD POWER",["ON","OFF"],1,{s:1,d:D("الكهرباء الأرضية","يوصل كهرباء المطار بالطائرة.","OFF")}),
  lt("gpa",190,268,48,16,"GRD POWER|AVAILABLE","b",{when:"!gpu",d:D("الكهرباء الأرضية متاحة","تضيء أزرق عند توصيل كهرباء المطار.","مطفأ في الطيران")})],{sd:"ELEC"}));
OVH.push(get("ovhd","apu"));
/* column 3: misc, signs, heat, anti-ice, hydraulics */
["misc","sgn","wh","ph"].forEach(id=>OVH.push(get("ovhd",id)));
OVH.push(pn("ai","ANTI-ICE",500,472,240,112,[
  ...N4.map((n,i)=>lt("cv"+n,[26,72,118,164][i],26,36,16,"COWL|VLV","a",{when:"@ai.e"+n+"=1",d:D("صمام غطاء المحرك "+n,"يضيء عندما يكون صمام مانع الجليد على مدخل المحرك "+n+" مفتوحاً.","مطفأ")})),
  ...N4.map((n,i)=>tog("e"+n,[26,72,118,164][i],78,"ENG "+n,["OFF","ON"],0,{d:D("مانع الجليد للمحرك "+n,"يسخّن مقدمة مدخل المحرك بهواء ساخن حتى لا يتراكم عليها الجليد.","ON داخل الغيوم عند البرد")})),
  lt("wvl",212,26,36,16,"WING|VLV","a",{when:"@ai.wing=1",d:D("صمامات الجناح","يضيء عندما تكون صمامات مانع الجليد على مقدمة الجناح مفتوحة.","مطفأ")}),
  tog("wing",212,78,"WING",["OFF","ON"],0,{d:D("مانع الجليد للجناح","يسخّن الحافة الأمامية للجناح بهواء الصرف من المحركات.","ON عند الحاجة فقط")})],{sd:"BLEED"}));
OVH.push(pn("hyd","HYDRAULIC",500,594,240,126,[
  ...N4.map((n,i)=>lt("lp"+n,[32,92,152,212][i],20,40,16,"SYS "+n+"|PRESS","a",{when:"!hyd_p"+n,d:D("ضغط النظام الهيدروليكي "+n,"يضيء كهرماني عندما يكون ضغط النظام "+n+" منخفضاً. في 747 أربعة أنظمة هيدروليكية مستقلة.","مطفأ")})),
  ...N4.map((n,i)=>tog("e"+n,[32,92,152,212][i],62,"ENG PUMP "+n,["ON","OFF"],0,{c:1,s:0,gap:10,d:D("المضخة الهيدروليكية للمحرك "+n,"المضخة التي يديرها المحرك "+n+" وتغذي النظام "+n+" بالضغط.","ON")})),
  ...N4.map((n,i)=>tog("d"+n,[32,92,152,212][i],106,"DEMAND "+n,["OFF","AUTO","ON"],1,{c:0,s:1,gap:10,d:D("مضخة الطلب "+n,"مضخة إضافية تدعم النظام "+n+" عند ارتفاع الحاجة (الإقلاع والهبوط) أو عند فشل مضخة المحرك. AUTO تعمل عند الحاجة.","AUTO")}))],{sd:"HYD"}));
/* column 4: air temperature, bleed and packs, pressurisation */
OVH.push(get("ovhd","cond"));
OVH.push(pn("bleed","BLEED AIR",750,192,240,270,[
  {k:"gau",id:"duct",x:44,y:52,r:26,lbl:"DUCT PRESS",v:0,val:st=>anyRun(st)||st["bleed.apu"]===0?0.55:0.02,d:D("ضغط هواء القنوات","يعرض ضغط الهواء الساخن المأخوذ من المحركات والـAPU.","حوالي 30-40 psi")},
  lt("dual",150,28,60,16,"DUAL|SOURCE","b",{when:"!dualBleed",d:D("مصدران للهواء","يضيء عندما تكون الـAPU والمحرك يغذيان الهواء معاً.","مطفأ")}),
  tog("iso1",120,112,"ISOLATION 1",["CLOSE","AUTO","OPEN"],1,{d:D("صمام العزل 1","يفصل أو يصل خط الهواء الأيسر عن الأيمن.","AUTO")}),
  tog("iso2",200,112,"ISOLATION 2",["CLOSE","AUTO","OPEN"],1,{d:D("صمام العزل 2","مثل 1 للخط الأيمن.","AUTO")}),
  ...[1,2,3].map((n,i)=>tog("pk"+n,[40,120,200][i],176,"PACK "+n,["OFF","AUTO","HIGH"],1,{c:0,gap:11,d:D("وحدة تكييف "+n,"في 747 ثلاث وحدات تكييف (packs) تبرّد هواء الصرف وتغذي المقصورة. AUTO تضبط التدفق آلياً.","AUTO")})),
  ...N4.map((n,i)=>tog("b"+n,[22,68,114,160][i],232,"BLEED "+n,["ON","OFF"],0,{c:1,gap:10,d:D("هواء المحرك "+n,"يفتح أو يغلق أخذ هواء الصرف من المحرك "+n+" لتغذية التكييف والضغط ومانع الجليد.","ON")})),
  tog("apu",206,232,"APU",["ON","OFF"],1,{c:1,s:0,gap:10,d:D("هواء الـAPU","يوصل هواء الـAPU بالقنوات، ويُستخدم للتكييف وبدء المحركات على الأرض.","ON على الأرض")})],{sd:"BLEED"}));
OVH.push(get("ovhd","press"));
/* bottom row: lights and engine start */
OVH.push(get("ovhd","land")); OVH.push(get("ovhd","taxi"));
OVH.push(pn("start","ENGINE START",440,732,215,110,[
  ...N4.map((n,i)=>rot("s"+n,[28,70,112,154][i],58,""+n,["GRD","OFF","FLT"],1,{r:11,pd:["بدء التشغيل على الأرض: يفتح صمام البادئ ويشعل","مطفأ","إشعال لإعادة التشغيل في الجو"],d:D("مفتاح بدء المحرك "+n,"يُدار إلى GRD لبدء المحرك "+n+" بهواء الـAPU أو هواء المطار، ثم يرجع إلى OFF عند اكتمال البدء.","OFF أو CONT")})),
  tog("ign",196,58,"IGNITION",["IGN L","BOTH","IGN R"],0,{gap:12,d:D("اختيار شمعات الإشعال","يختار أي مُشعل يُستخدم: الأيسر أو الأيمن أو كلاهما.","حسب اليوم")})],{sd:"ENG"}));
OVH.push(get("ovhd","lts"));

/* ================= glareshield: master lights, EFIS, MCP with three autopilot buttons ================= */
const mcp=get("glare","mcp"); pl(mcp,332,8,470,150);
const mc=id=>mcp.c.find(c=>c.id===id);
mc("n1").lbl="THR"; mc("n1").d=D("وضع الدفع THR","يجعل الدفع الآلي يثبت قوة الدفع المرجعية للإقلاع أو الصعود.","—");
mc("lvl").lbl="FL CH"; mc("lvl").d=D("تغيير مستوى الطيران FL CH","صعود أو نزول إلى الارتفاع المختار بقوة دفع ثابتة وسرعة يحافظ عليها الارتفاع.","—");
["cmda","cmdb","cwsa","cwsb"].forEach(id=>mcp.c.splice(mcp.c.findIndex(c=>c.id===id),1));
[["ap1","L",366],["ap2","C",404],["ap3","R",442]].forEach(([id,t,x])=>mcp.c.push(pb(id,x,36,"A/P "+t,null,["▬","g","P"],{v:id==="ap2"?1:0,c:0,s:0,w:32,h:22,d:D("الطيار الآلي "+t,"يشغّل أحد أنظمة الطيار الآلي الثلاثة. يُستعمل اثنان أو ثلاثة معاً للهبوط الآلي.",id==="ap2"?"مشغّل":"—")})));
mc("disc").x=398; mc("disc").y=124;
mcp.c.push(tog("fdR",448,124,"F/D R",["ON","OFF"],0,{gap:12,d:D("موجّه الطيران الأيمن","يعرض خطوط التوجيه على شاشة الضابط الأول.","ON")}));
const efisR=get("glare","efisR"); pl(efisR,808,8);
const GLS=[pl(get("glare","mwL"),8,20), pl(get("glare","efisL"),70,8), mcp, efisR, pl(get("glare","mwR"),1074,20)];

/* ================= main panel: PFD/ND, standby, upper and lower EICAS, gear lever ================= */
const MAIN=[get("main","capt"),get("main","fo")];
const ctr=get("main","ctr"); ctr.c=ctr.c.filter(c=>c.id!=="eicas");
const flapV={flap:[0,0.14,0.3,0.46,0.62,0.8,1]};
ctr.c.find(c=>c.id==="flap").val=st=>flapV.flap[st["ctl.flap"]||0];
ctr.c.push(scr("eicasU",200,70,190,124,"ewd",{d:D("شاشة EICAS العليا","تعرض N1 والحرارة EGT للمحركات الأربعة، وتنبيهات الأنظمة (رسائل EICAS) بالألوان: أحمر للتحذير وكهرماني للتنبيه.","—")}));
ctr.c.push(scr("eicasL",200,180,190,92,"sd",{d:D("شاشة EICAS السفلية","صفحات الأنظمة الثانوية: الهيدروليك والوقود والكهرباء والهواء والمحرك.","—")}));
MAIN.splice(1,0,ctr);
MAIN.forEach(p=>p.c.forEach(c=>{ if(c.k==="scr") c.pw=ac; }));

/* ================= pedestal: three CDUs, thrust levers, fire panel ================= */
const cduL=get("ped","cduL"), cduR=get("ped","cduR"), cduC=pl(cp(cduL),400,8,300,240); cduC.id="cduC";
cduC.c.find(c=>c.id==="s").d=D("CDU الأوسط","وحدة تحكم وعرض ثالثة في الكونسول الوسطي، تستعمل كاحتياط لحاسوب الطيران FMC.","—");
const PED=[cduL,cduC,cduR];
PED.forEach(p=>p.c.forEach(c=>{ if(c.k==="scr") c.pw=ac; }));
PED.push(pn("ctl","CONTROL STAND",250,258,600,300,[
  lev("spd",60,130,"spd",["DOWN","ARMED","FLT DET","UP"],0,{h:160,left:true,lbl:"SPEED BRAKE",d:D("ذراع الكوابح الهوائية","يرفع السبويلرز. ARMED قبل الهبوط لترتفع تلقائياً عند ملامسة المدرج.","DOWN")}),
  lev("tl",260,120,"thr",["TO/GA","CLB","CRZ","IDLE","REV"],2,{n:4,sp:44,multi:"ctl.tl",h:160,c:3,s:3,lbl:"THRUST LEVERS",d:D("أذرع الدفع الأربعة","كل ذراع تتحكم بمحرك واحد. زر TO/GA عليها للإقلاع أو إلغاء الهبوط، وتتحرك ذاتياً مع الدفع الآلي.","يحركها الدفع الآلي")}),
  lev("flap",470,130,"flap",["UP","1","5","10","20","25","30"],0,{h:200,lbl:"FLAP",d:D("ذراع الجنيحات","درجات الجنيحات: 5 إلى 20 للإقلاع، و25 أو 30 للهبوط. في 747 تتحرك الجنيحات الأمامية (Krueger وslats) والخلفية معاً.","UP")}),
  ...N4.map((n,i)=>tog("f"+n,[185,235,285,335][i],262,"ENG "+n,["RUN","CUTOFF"],0,{c:1,s:1,gap:18,d:D("مفتاح وقود المحرك "+n,"RUN يفتح الوقود ويشغّل الإشعال أثناء البدء. CUTOFF يطفئ المحرك.","RUN")})),
  lev("pk",110,262,"park",["OFF","SET"],0,{h:34,c:1,s:1,left:true,d:D("فرامل الوقوف","تثبت الطائرة واقفة. مصباح أحمر يضيء عند ضبطها.","OFF")}),
  tog("stm",540,250,"STAB TRIM|CUTOUT",["NORMAL","CUTOUT"],0,{g:"r",gap:14,d:D("قطع موازنة المثبت","يفصل محرك موازنة المثبت إذا تحرك وحده بلا أمر (Runaway).","NORMAL")})],{sd:"ENG"}));
PED.push(pn("fire","FIRE PROTECTION",250,568,600,160,[
  ...[["e1",60,"ENG 1"],["e2",170,"ENG 2"],["apu",300,"APU"],["e3",430,"ENG 3"],["e4",540,"ENG 4"]].map(([id,x,l])=>fh(id,x,58,l,{when:"T",d:D("مقبض حريق "+(id==="apu"?"الـAPU":"المحرك "+id[1]),"عند الحريق يضيء أحمر. سحبه يقطع الوقود والهواء والكهرباء عن "+(id==="apu"?"الـAPU":"المحرك")+"، وتدويره يطلق قارورة الإطفاء.","في مكانه")})),
  tog("da",190,118,"OVHT DET",["A","NORMAL","B"],1,{gap:10,d:D("كاشف الحرارة","يختار حلقة الكشف المستخدمة.","NORMAL")}),
  tog("test",410,118,"TEST",["FAULT/INOP","","OVHT/FIRE"],1,{gap:10,onSet:(st,v)=>{ CKS.test=v===2; },d:D("فحص الحريق","OVHT/FIRE يضيء مقابض الحريق ويطلق الجرس للفحص.","وسط")}),
  lt("bd",300,132,60,16,"BOTTLE|DISCHARGE","a",{d:D("تفريغ القارورة","يضيء بعد تفريغ قارورة الإطفاء.","مطفأ")})]));

/* ================= the deck object ================= */
const A={name:"Boeing 747-400",style:"boeing",engines:4,ewdTitle:"N1",
  intro:"قمرة 747-400 كما يراها من يقف خلف المقعدين في الطابق العلوي: اللوحة العلوية في أربعة أعمدة (الوقود والكهرباء والهيدروليك بأربعة أنظمة، لكل محرك نظام)، ثم واقي الوهج وفيه لوحة الطيار الآلي MCP بثلاثة أزرار للطيار الآلي، ثم اللوحة الأمامية بشاشتي EICAS للمحركات الأربعة، ثم الكونسول الوسطي بأذرع الدفع الأربعة ومفاتيح الوقود ومقابض الحريق.",
  foot:"ترتيب اللوحات تقريبي ومبني على عائلة بوينغ العامة (737 و747). الشاشات تمثيل مبسّط، والغرض تعليمي وليس بديلاً عن دليل الطائرة.",
  areas:{ovhd:{t:"اللوحة العلوية",w:1000,h:852,panels:OVH},glare:{t:"واقي الوهج",w:1140,h:164,panels:GLS},main:{t:"اللوحة الأمامية",w:1100,h:248,panels:MAIN},ped:{t:"الكونسول الوسطي",w:1100,h:738,panels:PED}},
  power:st=>st["elm.bat"]===1,
  rules:{
    gpu:st=>CKS.gnd747===true&&st["elb.grd"]!==0, apuAvailOff:st=>st["apu.sw"]>=1&&st["elb.ag1"]===1&&st["elb.ag2"]===1,
    gen1off:st=>st["elb.g1"]===1||!run(st,0), gen2off:st=>st["elb.g2"]===1||!run(st,1), gen3off:st=>st["elb.g3"]===1||!run(st,2), gen4off:st=>st["elb.g4"]===1||!run(st,3),
    dualBleed:st=>st["bleed.apu"]===0&&N4.some(n=>st["bleed.b"+n]===0)&&anyRun(st), exitNot:st=>st["sgn.exit"]!==1,
    hyd_p1:st=>!hydOK(st,0), hyd_p2:st=>!hydOK(st,1), hyd_p3:st=>!hydOK(st,2), hyd_p4:st=>!hydOK(st,3),
    lp1:st=>st["fuel.m1f"]===1||st["fuel.m1a"]===1, lp2:st=>st["fuel.m2f"]===1||st["fuel.m2a"]===1, lp3:st=>st["fuel.m3f"]===1||st["fuel.m3a"]===1, lp4:st=>st["fuel.m4f"]===1||st["fuel.m4a"]===1,
    caut:st=>{ const s=ckCaut("b747"); return !!s&&s!==CKS.ackC; }, warn:st=>false },
  after:(st,key,v)=>{ if(key.endsWith(".mc")) CKS.ackC=ckCaut("b747"); },
  onPreset:(st,w)=>{ CKS.gnd747=w!=="flight"; },
  memos:st=>{ const m=[], f=k=>st[k]===1;
    if(f("fuel.m1f")||f("fuel.m1a")||f("fuel.m2f")||f("fuel.m2a")||f("fuel.m3f")||f("fuel.m3a")||f("fuel.m4f")||f("fuel.m4a")) m.push(["FUEL PUMP LOW PRESS","a","FUEL"]);
    I4.forEach(i=>{ if(!hydOK(st,i)&&anyRun(st)) m.push(["HYD PRESS SYS "+(i+1),"a","HYD"]); });
    I4.forEach(i=>{ if(f("elb.g"+(i+1))&&run(st,i)) m.push(["ELEC GEN OFF "+(i+1),"a","ELEC"]); });
    if(f("fltc.ydu")||f("fltc.ydl")) m.push(["YAW DAMPER","a","FLT CONT"]);
    if(anyRun(st)&&[1,2,3].some(n=>st["bleed.pk"+n]===0)) m.push(["PACK OFF","a","AIR COND"]);
    if(anyRun(st)&&N4.some(n=>st["bleed.b"+n]===1)) m.push(["BLEED OFF","a","AIR COND"]);
    if(f("ph.a")||f("ph.b")) m.push(["PROBE HEAT OFF","a","ANTI-ICE"]);
    if(["ls","lf","rf","rs"].some(k=>f("wh."+k))&&anyRun(st)) m.push(["WINDOW HEAT OFF","a","ANTI-ICE"]);
    if(st["sgn.exit"]!==1) m.push(["EMER EXIT LT NOT ARMED","a","OVERHEAD"]);
    if(N4.some(n=>f("ai.e"+n))) m.push(["ENG ANTI-ICE","g"]); if(f("ai.wing")) m.push(["WING ANTI-ICE","g"]);
    if(st["apu.sw"]>=1) m.push(["APU RUNNING","g"]); if(st["ctl.pk"]===1) m.push(["PARKING BRAKE SET","g"]);
    return m; },
  fma:st=>{ const a=[1,2,3].filter(n=>st["mcp.ap"+n]===1).length, at=st["mcp.at"]===0;
    return [at?(st["mcp.speed"]?"SPD":st["mcp.n1"]?"THR":"ARM"):"", st["mcp.lnav"]?"LNAV":st["mcp.hdgsel"]?"HDG SEL":"", st["mcp.vnav"]?"VNAV PTH":st["mcp.althld"]?"ALT":st["mcp.vs"]?"V/S":"", a>=2?"CMD":a?"CMD":st["mcp.fdL"]===0?"FD":"", ""]; },
  baro:A7.baro, ndMode:A7.ndMode, ndRange:A7.ndRange, ndOv:A7.ndOv,
  thrPos:st=>I4.map(i=>[97,92,85,22,70][st["ctl.tl"+i]||0]),
  sdDefault:"ENG",
  sdPage:(pg,st)=>{ const r=i=>run(st,i), f=k=>st[k]===1;
    if(pg==="HYD") return I4.map(i=>["SYS "+(i+1),hydOK(st,i)?"3000 PSI":"0",hydOK(st,i)?"g":"a"]);
    if(pg==="FUEL") return [["TANK 1","8.4 T","g"],["TANK 2","15.1 T","g"],["TANK 3","15.1 T","g"],["TANK 4","8.4 T","g"],["CTR",f("fuel.ctl")&&f("fuel.ctr")?"0":"12.0 T",f("fuel.ctl")&&f("fuel.ctr")?"g":"a"],["STAB","3.0 T","g"],["FUEL USED","2.1 T","g"]];
    if(pg==="ELEC") return I4.map(i=>["GEN "+(i+1),run(st,i)&&!f("elb.g"+(i+1))?"115V":"OFF",run(st,i)&&!f("elb.g"+(i+1))?"g":"a"]).concat([["APU GEN",st["apu.sw"]>=1?"AVAIL":"--","g"],["BAT",st["elm.bat"]===1?"28V":"OFF","g"]]);
    if(pg==="BLEED"||pg==="COND") return N4.map(n=>["BLEED "+n,f("bleed.b"+n)?"OFF":"ON","g"]).concat([["APU BLEED",st["bleed.apu"]===0?"ON":"OFF","g"]],[1,2,3].map(n=>["PACK "+n,["OFF","AUTO","HIGH"][st["bleed.pk"+n]],"g"]));
    if(pg==="PRESS") return [["CABIN ALT","8000 FT","g"],["DIFF","8.6 PSI","g"],["MODE",["AUTO","ALTN","MAN"][st["press.mode"]],"g"]];
    if(pg==="APU") return [["APU",["OFF","ON","START"][st["apu.sw"]],"g"],["EGT",st["apu.sw"]>=1?"420 °C":"--","g"]];
    return I4.map(i=>["ENG "+(i+1)+" N2",r(i)?"95 %":"0","g"]).concat(I4.map(i=>["ENG "+(i+1)+" OIL P",r(i)?"52 PSI":"0","g"]),[["FUEL FLOW","4.8 T/H","g"]]).slice(0,9); },
  simStep:(st,sim,dt)=>ckSimStep("b747",st,sim,dt,[24000,30000,37000,10000,5000][st["mcp.altk"]||0],[90,135,180,45][st["mcp.hdgk"]||0],[250,280,300,290][st["mcp.spdk"]||0])
};
CK.b747=A;
})();
