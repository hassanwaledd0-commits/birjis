/* ---------- Book 12: Flight Operations and Performance (2/3): speed schedule, approach, traffic, ground, money ---------- */
/* CAS (kt) at altitude h (m) -> Mach, and Mach -> CAS */
function pfMach(cas,h){ const a0=340.294, qc=101325*(Math.pow(1+0.2*Math.pow(cas/KT/a0,2),3.5)-1), p=isa(h).p; return Math.sqrt(5*(Math.pow(qc/p+1,2/7)-1)); }
function pfCas(M,h){ const a0=340.294, p=isa(h).p, qc=p*(Math.pow(1+0.2*M*M,3.5)-1); return a0*Math.sqrt(5*(Math.pow(qc/101325+1,2/7)-1))*KT; }
/* ---- 10 ---- */
LK("prf",{
  ar:"جدول سرعات الصعود وارتفاع التقاطع", en:"Climb speed schedule and crossover altitude",
  alt:"منحنى رقم ماخ مع الارتفاع عند سرعة معايرة ثابتة مقابل ماخ الصعود المستهدف، مع تعليم ارتفاع التقاطع",
  intro:["أثناء الصعود تثبّت الطائرة السرعة المعايرة CAS (مثل 290 عقدة) لأن ما يهم الهيكل والأداء قرب الأرض هو الضغط الديناميكي. لكن مع الارتفاع ينخفض ضغط الهواء، فيزداد رقم ماخ عند CAS ثابتة حتى يبلغ ماخ المستهدف (مثل 0.78) الذي لا ينبغي تجاوزه.",
         "الارتفاع الذي يتساوى عنده الاثنان هو ارتفاع التقاطع. فوقه تثبّت الطائرة ماخ فتنخفض CAS تدريجياً. معرفة هذه النقطة مهمة لأن أجهزة السرعة تنتقل عندها بين العرض بالعقدة والعرض بماخ."],
  ctl:[{k:"cas",ar:"السرعة المعايرة في الصعود",min:240,max:350,step:5,v:290,f:v=>nf(v,0)+" kt"},{k:"Mt",ar:"ماخ المستهدف",min:0.7,max:0.86,step:0.005,v:0.78,f:v=>nf(v,3)},{k:"fl",ar:"مستوى الطيران الحالي",min:0,max:430,step:10,v:300,f:v=>"FL"+nf(v,0)}],
  pre:[{ar:"سيناريو شائع",set:{cas:290,Mt:0.78}},{ar:"سرعة أعلى",set:{cas:320,Mt:0.82}}],
  calc(st){ st.Mc=h=>pfMach(st.cas,h*100*0.3048); let lo=0,hi=20000; for(let i=0;i<40;i++){ const m=(lo+hi)/2; if(pfMach(st.cas,m)<st.Mt) lo=m; else hi=m; } st.hx=(lo+hi)/2; st.flx=st.hx/0.3048/100; const h=st.fl*100*0.3048; st.below=st.fl<=st.flx; st.M=st.below?pfMach(st.cas,h):st.Mt; st.C=st.below?st.cas:pfCas(st.Mt,h); st.tas=st.M*Math.sqrt(1.4*287.05*isa(h).T)*KT; st.cf=h=>pfCas(st.Mt,h*100*0.3048); },
  scene(g,r,st,C){ const x0=r.x+r.w*0.12, x1=r.x+r.w*0.88, Y=f=>r.y+r.h*0.86-f/430*r.h*0.72, X=f=>x0+(x1-x0)*0.1+(x1-x0)*0.8*f/430*0.9; lline(g,[[x0,Y(0)],[X(st.flx),Y(st.flx)]],C.hyd,3); lline(g,[[X(st.flx),Y(st.flx)],[X(430),Y(430)]],C.ctrl,3);
    [0,100,200,300,400].forEach(f=>{ ltx(g,"FL"+f,x0-6,Y(f),{s:10,m:true,a:"right",c:C.muted}); lline(g,[[x0,Y(f)],[x1,Y(f)]],C.line,0.7,[2,5]); }); ldot(g,X(st.flx),Y(st.flx),6,C.power); ltx(g,"التقاطع FL"+nf(st.flx,0),X(st.flx)+8,Y(st.flx),{s:12,w:700,m:true,a:"left",c:C.power});
    const f=clamp(st.fl,0,430); ldot(g,X(f),Y(f),5,C.ink); ltx(g,"CAS ثابتة",X(st.flx*0.4)+6,Y(st.flx*0.4)+16,{s:11,rtl:true,c:C.hyd}); ltx(g,"ماخ ثابت",X(st.flx+(430-st.flx)*0.5)+20,Y(st.flx+(430-st.flx)*0.5)+16,{s:11,rtl:true,c:C.ctrl});
    ltx(g,"عند FL"+nf(st.fl,0)+" : M "+nf(st.M,3)+"  ·  CAS "+nf(st.C,0)+" kt  ·  TAS "+nf(st.tas,0)+" kt",r.x+r.w*0.5,r.y+r.h*0.06,{s:12,w:600,m:true}); },
  plot(st){ return {x:[0,430],y:[0.2,1],xl:"مستوى الطيران FL",yl:"رقم ماخ عند CAS ثابتة",curves:[{f:st.Mc,c:"hyd"}],hl:[{y:st.Mt,c:"ctrl",t:"ماخ المستهدف"}],vl:[{x:st.flx,c:"power",t:"التقاطع"}],dots:[{x:st.flx,y:st.Mt,c:"power"}]}; },
  ro(st){ return [["ارتفاع التقاطع","FL"+nf(st.flx,0)],["ماخ الحالي",nf(st.M,3)],["CAS الحالية",nf(st.C,0)+" kt"],["السرعة الحقيقية الحالية",nf(st.tas,0)+" kt"],["CAS عند FL370 بماخ ثابت",nf(pfCas(st.Mt,37000*0.3048),0)+" kt"]]; },
  eq:["q_c = p₀ [(1 + 0.2 (V_c/a₀)²)^3.5 − 1]","M = √{5 [ (q_c/p + 1)^(2/7) − 1 ]}","التقاطع عندما M(V_c, h) = M_مستهدف"],
  note:["الحساب لهواء قياسي معياري وسرعة معايرة بلا خطأ تركيب. ارتفاع التقاطع الفعلي يتغير قليلاً مع الحرارة.","في الهبوط يحدث التبدل عكسياً: تثبَّت CAS عند الانتقال من ماخ حتى الوصول إلى 250 عقدة تحت 10000 قدم."],
  quiz:[{q:"عند CAS ثابتة، ماذا يحدث لماخ مع الارتفاع؟",o:["يزداد","يقل","يبقى ثابتاً"],a:0,why:"الضغط الجوي يقل فيزداد ماخ لنفس الضغط الديناميكي."},
        {q:"فوق ارتفاع التقاطع بماخ ثابت، CAS:",o:["تنخفض","ترتفع","تبقى"],a:0,why:"ماخ ثابت مع ضغط أقل يعني ضغطاً ديناميكياً أقل."}],
  ref:"الموضوع: السرعات المعايرة وماخ في الصعود (Climb Speed Schedules)."
});
/* ---- 11 ---- */
LK("prf",{
  ar:"مؤشر مسار الاقتراب البصري PAPI", en:"Precision approach path indicator",
  alt:"أربعة مصابيح على جانب المدرج بألوان أبيض وأحمر تتغير مع زاوية الاقتراب، ومنظر جانبي لمسارات الأشعة، ومنحنى الارتفاع مع المسافة",
  intro:["PAPI صف من أربع وحدات ضوئية بجانب المدرج، لكل وحدة قطاع أبيض فوق زاوية ضبطها وأحمر تحتها. الطيار الذي يطير على مسار 3° يرى لونين أبيض ولونين أحمر. إن علا رأى أبيض أكثر، وإن هبط رأى أحمر أكثر.",
         "تُضبط الوحدات الأربع على θ − 30′ وθ − 10′ وθ + 10′ وθ + 30′، أي ‎±0.5° و‎±0.167° حول المسار. فتغيّر 0.33° فقط يغيّر عدد الأحمر. عند 3 NM تعادل هذه الزاوية نحو 100 قدم، لذا يرى الطيار انحرافه بدقة قبل الهبوط."],
  ctl:[{k:"dn",ar:"المسافة من العتبة",min:0.5,max:8,step:0.1,v:3,f:v=>nf(v,1)+" NM"},{k:"hh",ar:"الارتفاع فوق العتبة",min:50,max:2800,step:10,v:955,f:v=>nf(v,0)+" ft"},{k:"th",ar:"زاوية المسار θ",min:2.5,max:3.5,step:0.1,v:3,f:v=>nf(v,1)+"°"}],
  pre:[{ar:"فوق المسار",set:{hh:1150}},{ar:"على المسار",set:{hh:955}},{ar:"تحت المسار",set:{hh:760}}],
  calc(st){ st.dist=st.dn*6076; st.an=Math.atan(st.hh/st.dist)/D2R; st.us=[-0.5,-1/6,1/6,0.5].map(d=>st.th+d); st.w=st.us.filter(u=>st.an>u).length; st.dev=st.dist*(Math.tan(st.an*D2R)-Math.tan(st.th*D2R)); st.hp=(d,off)=>d*6076*Math.tan((st.th+off)*D2R); },
  scene(g,r,st,C){ const px=r.x+r.w*0.12, py=r.y+r.h*0.2; for(let i=0;i<4;i++){ const w=i<st.w; g.fillStyle=w?"#f5f5ef":"#d63a2f"; g.beginPath(); g.arc(px+i*34,py+8,12,0,Math.PI*2); g.fill(); g.strokeStyle=C.ink; g.lineWidth=1.3; g.stroke(); }
    ltx(g,st.w===4?"4 أبيض: عالٍ جداً":st.w===3?"3 أبيض و1 أحمر: عالٍ قليلاً":st.w===2?"أبيضان وأحمران: على المسار":st.w===1?"1 أبيض و3 أحمر: منخفض قليلاً":"4 أحمر: منخفض جداً",px+51,py+38,{s:12,w:700,rtl:true,c:st.w===2?C.hyd:C.power}); lline(g,[[px-14,py+22],[px+4*34-12,py+22]],C.ink,3);
    const gx=r.x+r.w*0.06, gx1=r.x+r.w*0.94, gy=r.y+r.h*0.84, W=gx1-gx, maxd=8, X=d=>gx1-W*d/maxd, Y=h=>gy-h/2800*r.h*0.46; g.fillStyle=mixC(C.panel,C.struct,0.35); g.fillRect(gx,gy,W,6);
    [[-0.5,"muted"],[-1/6,"muted"],[0,"hyd"],[1/6,"muted"],[0.5,"muted"]].forEach(([o,c])=>{ lline(g,[[X(0),Y(0)],[X(maxd),Y(st.hp(maxd,o))]],KC(c,C),o===0?2.4:1,o===0?null:[3,4]); });
    const ax=X(st.dn), ay=Y(st.hh); lplane(g,ax,ay,0.1*W,3,C,{flip:true}); ltx(g,nf(st.an,2)+"°",ax+16,ay-14,{s:12,w:700,m:true}); ltx(g,Math.abs(st.dev)<40?"على المسار تقريباً":(st.dev>=0?"أعلى من المسار ":"أدنى من المسار ")+nf(Math.abs(st.dev),0)+" ft",r.x+r.w*0.5,r.y+r.h*0.54,{s:12,w:600,rtl:true,c:Math.abs(st.dev)<40?C.hyd:C.power}); },
  plot(st){ return {x:[0.5,8],y:[0,2800],xl:"المسافة من العتبة NM",yl:"الارتفاع ft",curves:[{f:d=>st.hp(d,0),c:"hyd"},{f:d=>st.hp(d,0.5),c:"muted",dash:[4,4]},{f:d=>st.hp(d,-0.5),c:"muted",dash:[4,4]}],dots:[{x:st.dn,y:st.hh,c:"power"}]}; },
  ro(st){ return [["زاوية الرؤية",nf(st.an,2)+"°"],["عدد الأبيض",nf(st.w,0)+" من 4"],["الانحراف عن المسار",nf(Math.abs(st.dev)<0.5?0:st.dev,0)+" ft"],["ارتفاع المسار عند هذه المسافة",nf(st.hp(st.dn,0),0)+" ft"]]; },
  eq:["زاوية الرؤية = atan( h / d )","وحدات PAPI عند θ + {−0.5° ، −0.167° ، +0.167° ، +0.5°}","الانحراف ≈ d (tan زاوية الرؤية − tan θ)"],
  note:["الدرس يستخدم المسافة على الأفقي ولا يحتسب ارتفاع عين الطيار فوق العجلات. المسار الفعلي يؤخذ عند عجلات الطائرة، فتُضبط الاقتراب حسب نوع الطائرة.","زاوية 3° تعطي ميلاً نحو 318 قدماً لكل ميل بحري، وهذا ما تبنى عليه قاعدة 3 إلى 1."],
  quiz:[{q:"تظهر 3 أبيض و1 أحمر. أنت:",o:["أعلى قليلاً من المسار","أدنى من المسار","على المسار تماماً"],a:0,why:"الوحدات السفلى فقط تحوّلت للأبيض."},
        {q:"على مسار 3° عند 4 NM، الارتفاع تقريباً:",o:["1270 ft","600 ft","2500 ft"],a:0,why:"4 × 6076 × tan 3° ≈ 1274 ft."}],
  ref:"الموضوع: وسائل الاقتراب البصرية (Visual Approach Slope Indicators)."
});
/* ---- 12 ---- */
LK("prf",{
  ar:"TCAS: زمن الاصطدام والتقاء المسارين", en:"Traffic collision avoidance: tau and closest approach",
  alt:"منظر علوي لطائرتين متقاربتين مع اتجاه كل منهما والمسار النسبي، ومنحنى المسافة بينهما مع الزمن وعلامتا التنبيه",
  intro:["يقيس TCAS زمن التقارب tau = المدى ÷ معدل الاقتراب. إن كان tau أقل من نحو 40 ثانية يصدر تنبيه مرور (TA)، وإن بلغ نحو 25 ثانية يصدر تنبيه حل (RA) يطلب مناورة رأسية. هذه الأرقام تقريبية وتختلف بحسب الارتفاع.",
         "هندسة التقاء المسارين تُحسب بالحركة النسبية: موقع الدخيل r وسرعته النسبية v. أقرب اقتراب عند t = −(r·v)/|v|² والمسافة عنده |r + v t|. قد تكون المسافة كبيرة فلا خطر رغم أن tau صغير، ولذلك يضيف النظام مرشّحات إضافية."],
  ctl:[{k:"vo",ar:"سرعتنا (شمالاً)",min:200,max:500,step:10,v:300,f:v=>nf(v,0)+" kt"},{k:"b",ar:"اتجاه الدخيل بالنسبة لنا",min:0,max:359,step:1,v:10,f:v=>nf(v,0)+"°"},{k:"R",ar:"المدى الآن",min:5,max:40,step:1,v:24,f:v=>nf(v,0)+" NM"},{k:"hi",ar:"اتجاه الدخيل",min:0,max:359,step:1,v:192,f:v=>nf(v,0)+"°"},{k:"vi",ar:"سرعة الدخيل",min:150,max:550,step:10,v:400,f:v=>nf(v,0)+" kt"}],
  pre:[{ar:"مواجهة",set:{b:5,hi:185,R:25}},{ar:"من الجنب",set:{b:90,hi:270,R:20}},{ar:"مسارات متباعدة",set:{b:30,hi:60,R:24}}],
  calc(st){ const rx=st.R*Math.sin(st.b*D2R), ry=st.R*Math.cos(st.b*D2R), vx=st.vi*Math.sin(st.hi*D2R), vy=st.vi*Math.cos(st.hi*D2R)-st.vo; st.rx=rx; st.ry=ry; st.vx=vx; st.vy=vy; const vv=vx*vx+vy*vy, rv=rx*vx+ry*vy; st.cl=-rv/st.R; st.tau=st.cl>0?st.R/st.cl*3600:Infinity; st.tc=vv>0?-rv/vv:Infinity; st.conv=st.tc>0&&isFinite(st.tc); st.dc=st.conv?Math.hypot(rx+vx*st.tc,ry+vy*st.tc):st.R; st.rng=t=>Math.hypot(rx+vx*t/3600,ry+vy*t/3600);
    st.ta=null; st.ra=null; if(st.conv){ for(let t=0;t<=st.tc*3600;t+=1){ const r0=st.rng(t), c=-((rx+vx*t/3600)*vx+(ry+vy*t/3600)*vy)/r0, ta=c>0?r0/c*3600:1e9; if(st.ta==null&&ta<=40) st.ta=t; if(st.ra==null&&ta<=25) st.ra=t; } } st.alert=st.conv&&st.dc<3&&st.ra!=null; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.62, s=Math.min(r.w*0.42,r.h*0.5)/Math.max(st.R,8), T=Math.max(60,(st.conv?st.tc*3600:300)), ph=((st.t*0.25)%1)*(T+20), ox=0, oy=-st.vo*ph/3600, ix=st.rx+st.vx*0*0, iy=st.ry;
    const own=[cx,cy-st.vo*ph/3600*s], ip=[cx+(st.rx+(st.vi*Math.sin(st.hi*D2R))*ph/3600)*s, cy-(st.ry+(st.vi*Math.cos(st.hi*D2R))*ph/3600)*s];
    [0.33,0.66,1].forEach(f=>{ g.strokeStyle=C.line; g.lineWidth=1; g.beginPath(); g.arc(cx,cy,st.R*s*f,0,Math.PI*2); g.stroke(); }); lline(g,[[cx,cy],[cx,cy-st.vo*(T/3600)*s]],C.ctrl,1.4,[4,4]); lline(g,[[cx+st.rx*s,cy-st.ry*s],[cx+(st.rx+st.vi*Math.sin(st.hi*D2R)*T/3600)*s,cy-(st.ry+st.vi*Math.cos(st.hi*D2R)*T/3600)*s]],C.power,1.4,[4,4]);
    ldot(g,own[0],own[1],6,C.ctrl); ldot(g,ip[0],ip[1],6,C.power); lline(g,[[own[0],own[1]],[ip[0],ip[1]]],C.muted,1,[2,3]); const dd=Math.hypot((ip[0]-own[0])/s,(ip[1]-own[1])/s); ltx(g,"نحن",own[0]+10,own[1]-10,{s:11,rtl:true,c:C.ctrl}); ltx(g,"الدخيل",ip[0]+10,ip[1]-10,{s:11,rtl:true,c:C.power}); ltx(g,"المسافة "+nf(dd,1)+" NM",r.x+r.w*0.5,r.y+r.h*0.06,{s:12,w:600,rtl:true});
    ltx(g,st.conv?"أقرب اقتراب "+nf(st.dc,1)+" NM بعد "+nf(st.tc*60,1)+" min":"المسارات متباعدة",r.x+r.w*0.5,r.y+r.h*0.94,{s:12,w:600,rtl:true,c:st.alert?C.power:C.ink}); },
  plot(st){ const T=Math.max(60,st.conv?st.tc*3600*1.15:300), pts=[]; for(let t=0;t<=T;t+=T/120) pts.push([t,st.rng(t)]); const vl=[]; if(st.ta!=null) vl.push({x:st.ta,c:"ctrl",t:"TA"}); if(st.ra!=null) vl.push({x:st.ra,c:"power",t:"RA"}); return {x:[0,T],y:[0,Math.max(5,st.R*1.05)],xl:"الزمن s",yl:"المدى NM",lines:[{pts,c:"hyd",w:2.4}],vl,hl:[{y:st.dc,c:"muted",t:"أقرب اقتراب"}]}; },
  ro(st){ return [["معدل الاقتراب",nf(st.cl,0)+" kt"],["tau الآن",isFinite(st.tau)?nf(st.tau,0)+" s":"—"],["أقرب اقتراب",nf(st.dc,1)+" NM"],["تنبيه TA بعد",st.ta!=null?nf(st.ta,0)+" s":"—"],["تنبيه RA بعد",st.ra!=null?nf(st.ra,0)+" s":"—"]]; },
  eq:["τ = R / (−Ṙ)","t_cpa = −(r · v) / |v|²","d_cpa = | r + v t_cpa |"],
  note:["الدرس يعرض هندسة المسار الأفقي فقط. TCAS الحقيقي يستخدم أيضاً الارتفاع ومعدل الصعود ويحدد المناورة الرأسية المناسبة.","نصيحة: عند صدور RA يجب الاستجابة فوراً وفقاً للإجراء المعتمد، حتى لو خالف تعليمات المراقبة."],
  quiz:[{q:"ماذا يعني tau = 30 ثانية؟",o:["بقي نحو 30 ثانية على أقرب اقتراب لو بقي الاقتراب ثابتاً","المسافة 30 NM","السرعة 30 kt"],a:0,why:"tau المدى مقسوماً على معدل الاقتراب."},
        {q:"قد يكون tau صغيراً ومع ذلك لا يوجد خطر لأن:",o:["أقرب اقتراب سيكون كبيراً","السرعة بطيئة","الارتفاع عالٍ"],a:0,why:"d_cpa يحدد الخطر الفعلي."}],
  show:{ar:"اعرض هوائي TCAS",fn:()=>lrnSel("ant_tcas")},
  ref:"الموضوع: أنظمة تجنب التصادم الجوي (Airborne Collision Avoidance)."
});
/* ---- 13 ---- */
LK("prf",{
  ar:"زمن الدوران الأرضي: المسار الحرج", en:"Aircraft turnaround and the critical path",
  alt:"مخطط جانت لمهام الدوران: النزول والتنظيف والصعود والشحن والتزود والتموين، مع المسار الحرج بلون مميز، ومنحنى زمن الدوران مع معدل الصعود",
  intro:["بين هبوط الطائرة وإقلاعها تتم عدة مهام: نزول الركاب، التنظيف، التموين، الصعود، تفريغ الشحن وتحميله، التزود بالوقود. بعضها يتم بالتوازي وبعضها يجب أن ينتظر ما قبله.",
         "المسار الحرج هو السلسلة الأطول من المهام المتتابعة، وهو يحدد زمن الدوران. تقليل زمن مهمة ليست على المسار الحرج لا يختصر شيئاً، لذلك يركّز المخطط على المهمة التي تحدد النهاية. في الطائرات الكبيرة غالباً ما يكون المسار الحرج: نزول ثم تنظيف ثم صعود الركاب."],
  ctl:[{k:"N",ar:"عدد الركاب",min:50,max:850,step:10,v:160,f:v=>nf(v,0)},{k:"rd",ar:"معدل النزول",min:10,max:60,step:1,v:25,f:v=>nf(v,0)+" pax/min"},{k:"rb",ar:"معدل الصعود",min:8,max:40,step:1,v:16,f:v=>nf(v,0)+" pax/min"},{k:"cl",ar:"زمن التنظيف",min:5,max:35,step:1,v:10,f:v=>nf(v,0)+" min"},{k:"cg",ar:"الشحن تفريغاً وتحميلاً",min:10,max:70,step:1,v:28,f:v=>nf(v,0)+" min"},{k:"rf",ar:"التزود بالوقود",min:10,max:60,step:1,v:22,f:v=>nf(v,0)+" min"},{k:"ct",ar:"التموين",min:8,max:40,step:1,v:15,f:v=>nf(v,0)+" min"}],
  pre:[{ar:"طائرة ممرّ واحد",set:{N:160,rd:25,rb:16,cl:10,cg:28,rf:22,ct:15}},{ar:"طائرة كبيرة",set:{N:520,rd:45,rb:28,cl:20,cg:50,rf:45,ct:30}}],
  calc(st){ const dep=st.N/st.rd, brd=st.N/st.rb; st.tk=[["نزول الركاب",0,dep,"hyd"],["التنظيف",dep,dep+st.cl,"gear"],["التموين",dep,dep+st.ct,"ctrl"],["الشحن",1,1+st.cg,"fuel"],["الوقود",2,2+st.rf,"sys"]]; const bs=Math.max(dep+st.cl,dep+st.ct); st.tk.push(["صعود الركاب",bs,bs+brd,"power"]); st.tt=Math.max(...st.tk.map(t=>t[2]))+3; st.crit=st.tk.reduce((a,b)=>b[2]>a[2]?b:a); st.tf=r=>{ const bs2=Math.max(dep+st.cl,dep+st.ct); return Math.max(bs2+st.N/r,1+st.cg,2+st.rf)+3; }; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.2, x1=r.x+r.w*0.94, W=x1-x0, rows=st.tk.length, rh=r.h*0.74/rows, X=m=>x0+W*m/(st.tt+2); const tm=(st.t*3)%(st.tt+4); st.tk.forEach((t,i)=>{ const y=r.y+r.h*0.06+i*rh, crit=t===st.crit; ltx(g,t[0],x0-8,y+rh*0.5,{s:11,a:"right",rtl:true,c:crit?C.power:C.ink,w:crit?700:400}); g.fillStyle=mixC(C.panel,KC(t[3],C),crit?0.95:0.5); g.fillRect(X(t[1]),y+rh*0.18,X(t[2])-X(t[1]),rh*0.64); if(crit){ g.strokeStyle=C.power; g.lineWidth=2; g.strokeRect(X(t[1]),y+rh*0.18,X(t[2])-X(t[1]),rh*0.64); } ltx(g,nf(t[2]-t[1],0)+"′",(X(t[1])+X(t[2]))/2,y+rh*0.5,{s:10,m:true,c:"#fff"}); });
    lline(g,[[X(tm),r.y+r.h*0.04],[X(tm),r.y+r.h*0.82]],C.ink,1.4,[3,3]); lline(g,[[X(st.tt),r.y+r.h*0.04],[X(st.tt),r.y+r.h*0.82]],C.power,2); ltx(g,"زمن الدوران "+nf(st.tt,0)+" min  ·  الحرج: "+st.crit[0],r.x+r.w*0.5,r.y+r.h*0.92,{s:13,w:700,rtl:true,c:C.power}); },
  plot(st){ return {x:[8,40],y:[20,Math.max(60,st.tf(8)*1.05)],xl:"معدل الصعود pax/min",yl:"زمن الدوران min",curves:[{f:st.tf,c:"hyd"}],dots:[{x:st.rb,y:st.tt,c:"power"}]}; },
  ro(st){ return [["زمن الدوران",nf(st.tt,0)+" min"],["المسار الحرج",st.crit[0]],["مدة النزول",nf(st.N/st.rd,1)+" min"],["مدة الصعود",nf(st.N/st.rb,1)+" min"]]; },
  eq:["T = max( نهايات المهام ) + هامش إغلاق","بداية الصعود = max( نهاية التنظيف ، نهاية التموين )","نهاية الصعود = بداية + N / r_صعود"],
  note:["بعض المطارات تسمح بالتزود أثناء الصعود بشروط، والبعض لا تسمح؛ الدرس يفترض تزامناً بسيطاً.","هامش الإغلاق 3 دقائق للأبواب وتجهيز الدفع والمحركات."],
  quiz:[{q:"زيادة سرعة مهمة ليست حرجة:",o:["لا تقلل الزمن الكلي","تقلل الزمن الكلي كثيراً","تضاعفه"],a:0,why:"النهاية يحددها المسار الحرج."},
        {q:"أي مهمتين لا تعتمدان على بعضهما غالباً؟",o:["التزود والتنظيف","النزول والتنظيف","التنظيف والصعود"],a:0,why:"يجريان بالتوازي في الغالب."}],
  ref:"الموضوع: إدارة المناولة الأرضية وزمن الدوران (Ground Handling)."
});
/* ---- 14 ---- */
LK("prf",{
  ar:"نقل الوقود الزائد: متى يوفّر المال؟", en:"Fuel tankering economics",
  alt:"مطاران بسعري وقود مختلفين وطائرة تحمل وقوداً زائداً، ومنحنى الوفر الصافي مع زمن الرحلة",
  intro:["قد يكون الوقود أرخص في مطار الانطلاق من مطار الوصول. فتحمل الطائرة وقوداً زائداً يكفي رحلة العودة. لكن حمل الوزن الزائد يحرق وقوداً إضافياً: تقريباً من 2.5 إلى 4% من الوقود الزائد لكل ساعة طيران.",
         "إذا كان معدل الاحتراق k لكل ساعة والرحلة t ساعة، فلكي نصل بكتلة E يجب أن نحمل E·e^(k t). يكون الحمل مجدياً إذا كانت نسبة سعر الوصول إلى سعر الانطلاق أكبر من e^(k t). كلما قصرت الرحلة صار الحمل أجدى، لكن الوقود الزائد يرفع الوزن وانبعاثات CO₂ أيضاً."],
  ctl:[{k:"ra",ar:"نسبة سعر الوصول إلى الانطلاق",min:1,max:2,step:0.01,v:1.25,f:v=>nf(v,2)},{k:"tt",ar:"زمن الرحلة",min:0.5,max:12,step:0.1,v:3,f:v=>nf(v,1)+" h"},{k:"kk",ar:"معدل احتراق الوزن الزائد",min:2,max:5,step:0.1,v:3.5,f:v=>nf(v,1)+" %/h"},{k:"E",ar:"الوقود المطلوب عند الوصول",min:1,max:20,step:0.5,v:5,f:v=>nf(v,1)+" t"},{k:"p1",ar:"سعر الانطلاق",min:0.4,max:1.5,step:0.05,v:0.8,f:v=>nf(v,2)+" /kg"}],
  pre:[{ar:"رحلة قصيرة",set:{tt:1.5}},{ar:"رحلة طويلة",set:{tt:9}}],
  calc(st){ const k=st.kk/100; st.fac=Math.exp(k*st.tt); st.ex=st.E*(st.fac-1)*1000; st.sv=(st.E*1000*st.ra*st.p1-st.E*1000*st.fac*st.p1); st.sf=t=>st.E*1000*st.p1*(st.ra-Math.exp(k*t)); st.be=st.fac; st.co2=st.ex*3.16; st.ok=st.sv>0; },
  scene(g,r,st,C){ const y=r.y+r.h*0.46, x0=r.x+r.w*0.18, x1=r.x+r.w*0.82; [[x0,"الانطلاق","سعر 1.00",C.hyd],[x1,"الوصول","سعر "+nf(st.ra,2),C.power]].forEach(([x,t,p,c])=>{ kBox(g,x-34,y-12,68,44,mixC(C.panel,c,0.3),C,"",{}); ltx(g,t,x,y+2,{s:11,w:600,rtl:true}); ltx(g,p,x,y+20,{s:11,rtl:true}); });
    lline(g,[[x0+40,y+10],[x1-40,y+10]],C.line,1.4,[4,4]); const f=(st.t*0.2)%1, px=x0+40+(x1-x0-80)*f, bw=Math.max(8,Math.min(60,st.E*3)), by=y-34; lplane(g,px,y-8,0.14*(x1-x0)/0.9,0,C,{flip:true}); const ex=st.E*st.fac;
    g.fillStyle=mixC(C.panel,C.fuel,0.7); g.fillRect(px-bw/2,by-10,bw*(1-0.0),8); ltx(g,"وقود محمول "+nf(ex,1)+" t",px,by-24,{s:11,rtl:true}); ltx(g,"احتراق إضافي "+nf(st.ex,0)+" kg",r.x+r.w*0.5,r.y+r.h*0.72,{s:12,rtl:true,c:C.muted});
    ltx(g,st.ok?"الحمل مجدٍ: وفر "+nf(st.sv,0)+" وحدة":"غير مجدٍ: خسارة "+nf(-st.sv,0)+" وحدة",r.x+r.w*0.5,r.y+r.h*0.88,{s:14,w:700,rtl:true,c:st.ok?C.hyd:C.power}); },
  plot(st){ const mx=Math.max(Math.abs(st.sf(0.5)),Math.abs(st.sf(12)),1000)*1.1; return {x:[0.5,12],y:[-mx,mx],xl:"زمن الرحلة h",yl:"الوفر الصافي",curves:[{f:st.sf,c:"hyd"}],hl:[{y:0,c:"muted",t:""}],vl:[{x:Math.log(st.ra)/(st.kk/100),c:"power",t:"التعادل"}],dots:[{x:st.tt,y:st.sv,c:st.ok?"hyd":"power"}]}; },
  ro(st){ return [["معامل الحمل e^(k t)",nf(st.fac,3)],["الوقود الزائد المحترق",nf(st.ex,0)+" kg"],["الوفر الصافي",nf(st.sv,0)],["نسبة السعر للتعادل",nf(st.be,2)],["CO₂ إضافي",nf(st.co2/1000,2)+" t"]]; },
  eq:["حمل مطلوب = E · e^(k t)","وفر = E (P_وصول − P_انطلاق e^(k t))","التعادل عند P_وصول / P_انطلاق = e^(k t)"],
  note:["الحساب لا يشمل رسوم الوزن الزائد في الهبوط ولا حدود الوزن الأقصى للهبوط، وقد تمنع نقل الوقود.","الأثر البيئي حقيقي: كل كيلوغرام وقود يعطي نحو 3.16 كيلوغرام CO₂، ولذلك تقلّص بعض الشركات هذه الممارسة."],
  quiz:[{q:"أي رحلة يناسبها النقل أكثر؟",o:["الأقصر","الأطول","لا فرق"],a:0,why:"الاحتراق الإضافي e^(k t) يزداد مع الزمن."},
        {q:"إذا تساوى سعر الوقود في المطارين:",o:["لا يوفّر الحمل شيئاً ويكلّف احتراقاً","يوفّر","يوفّر في الرحلات الطويلة"],a:0,why:"الوفر = −E P (e^(kt) − 1)."}],
  ref:"الموضوع: اقتصاديات الوقود (Fuel Economics)."
});
/* ---- 15 ---- */
LK("prf",{
  ar:"نقطة التعادل: معامل الحمولة", en:"Break-even load factor",
  alt:"منحنى الربح لكل رحلة مع معامل الحمولة وتقاطعه مع الصفر عند نقطة التعادل، مع رسم مقاعد ممتلئة جزئياً",
  intro:["الرحلة تكلّف مبلغاً شبه ثابت مهما امتلأت المقاعد: وقود وطاقم وصيانة ورسوم. العائد يتناسب مع الركاب. معامل الحمولة LF هو نسبة المقاعد المباعة. نقطة التعادل BELF = التكلفة / (المقاعد × متوسط الأجرة).",
         "إذا ارتفع سعر الوقود ارتفعت التكلفة فيرتفع معامل التعادل. لذلك تضع الشركات حدوداً لسعر الوقود وتغيّر الأجرة والطائرة بحسب الطلب. كلما زاد عدد المقاعد على طائرة مليئة نزلت تكلفة المقعد الواحد."],
  ctl:[{k:"seats",ar:"عدد المقاعد",min:100,max:850,step:5,v:189,f:v=>nf(v,0)},{k:"fare",ar:"متوسط الأجرة",min:50,max:400,step:5,v:120,f:v=>nf(v,0)},{k:"cost",ar:"تكلفة الرحلة",min:5000,max:150000,step:1000,v:17000,f:v=>nf(v,0)},{k:"lf",ar:"معامل الحمولة الفعلي",min:0.4,max:1,step:0.01,v:0.8,f:v=>nf(v*100,0)+" %"},{k:"fs",ar:"حصة الوقود من التكلفة",min:0.2,max:0.5,step:0.01,v:0.3,f:v=>nf(v*100,0)+" %"},{k:"dp",ar:"تغير سعر الوقود",min:-30,max:60,step:1,v:0,f:v=>nf(v,0)+" %"}],
  pre:[{ar:"وقود أغلى 40%",set:{dp:40}},{ar:"أجرة منخفضة",set:{fare:90}}],
  calc(st){ st.c2=st.cost*(1+st.fs*st.dp/100); st.rev=st.lf*st.seats*st.fare; st.pr=st.rev-st.c2; st.be=st.c2/(st.seats*st.fare); st.pf=l=>l*st.seats*st.fare-st.c2; st.perPax=st.c2/(st.lf*st.seats); st.ok=st.pr>=0; },
  scene(g,r,st,C){ const cols=Math.min(30,Math.max(10,Math.round(st.seats/8))), rows=Math.ceil(st.seats/cols/ (st.seats>400?1:1)), n=cols*Math.ceil(st.seats/cols), x0=r.x+r.w*0.1, w=r.w*0.8, cw=w/cols, ch=Math.min(cw,(r.h*0.4)/Math.ceil(st.seats/cols)); const filled=Math.round(st.lf*st.seats), be=Math.ceil(st.be*st.seats);
    for(let i=0;i<st.seats;i++){ const c=i%cols, rr=Math.floor(i/cols); g.fillStyle=i<filled?(i<be?mixC(C.panel,C.gear,0.7):mixC(C.panel,C.hyd,0.8)):mixC(C.panel,C.ink,0.1); g.fillRect(x0+c*cw+1,r.y+r.h*0.14+rr*(ch)+1,cw-2,ch-2); }
    ltx(g,"مقاعد مباعة "+nf(filled,0)+" من "+nf(st.seats,0),r.x+r.w*0.5,r.y+r.h*0.07,{s:12,rtl:true}); ltx(g,"معامل التعادل "+nf(st.be*100,0)+" % (بنفسجي = مقاعد تغطي التكلفة)",r.x+r.w*0.5,r.y+r.h*0.7,{s:12,rtl:true,c:C.muted});
    ltx(g,(st.ok?"ربح ":"خسارة ")+nf(Math.abs(st.pr),0)+" للرحلة",r.x+r.w*0.5,r.y+r.h*0.84,{s:15,w:700,rtl:true,c:st.ok?C.hyd:C.power}); },
  plot(st){ return {x:[0.4,1],y:[st.pf(0.4)*1.1-1,Math.max(1,st.pf(1)*1.1)],xl:"معامل الحمولة",yl:"الربح للرحلة",curves:[{f:st.pf,c:"hyd"}],hl:[{y:0,c:"muted",t:""}],vl:[{x:st.be,c:"power",t:"التعادل"}],dots:[{x:st.lf,y:st.pr,c:st.ok?"hyd":"power"}]}; },
  ro(st){ return [["تكلفة الرحلة",nf(st.c2,0)],["العائد",nf(st.rev,0)],["الربح",nf(st.pr,0)],["معامل التعادل",nf(st.be*100,1)+" %"],["التكلفة لكل راكب",nf(st.perPax,0)]]; },
  eq:["BELF = C / (S · f)","الربح = LF · S · f − C","C′ = C (1 + حصة الوقود × تغير السعر)"],
  note:["النموذج يفترض أجرة وسطية ثابتة؛ الأجور الحقيقية تتفاوت بحسب الحجز المسبق والمقعد.","الأرقام مجرد وحدات نقدية افتراضية لا ترتبط بأي شركة أو خط."],
  quiz:[{q:"ارتفاع سعر الوقود يجعل معامل التعادل:",o:["أعلى","أدنى","كما هو"],a:0,why:"التكلفة تزيد فتحتاج ركاباً أكثر."},
        {q:"عند معامل حمولة أقل من التعادل:",o:["تخسر الرحلة","تربح","لا يتغير"],a:0,why:"العائد أقل من التكلفة."}],
  ref:"الموضوع: اقتصاديات تشغيل الطيران (Airline Economics)."
});
/* ---- 16 ---- */
const pfWK=[[4,6,7],[4,4,5],[3,3,3]];
LK("prf",{
  ar:"سعة المدرج: التباعد وفئات الاضطراب", en:"Runway arrival capacity and wake separation",
  alt:"مدرج وطائرات تقترب بتباعد مختلف حسب فئاتها، ومنحنى عدد الهبوطات في الساعة مع نسبة الطائرات الثقيلة",
  intro:["كل طائرة تهبط خلف الأخرى تحتاج تباعداً كافياً. الطائرة الكبيرة تترك خلفها دوامات قوية، لذا تحدد لوائح الفصل مسافات أكبر خلف الثقيلة، مقاسة بالأميال البحرية على المسار النهائي. زمن التباعد = المسافة ÷ سرعة الاقتراب.",
         "لا يقل الفاصل عن زمن إشغال المدرج (إخلاء الطائرة السابقة). متوسط الفاصل يعتمد على احتمال كل ترتيب بين فئتين، وسعة المدرج = 3600 ÷ متوسط الفاصل بالثواني. زيادة نسبة الطائرات الكبيرة تقلل السعة بوضوح."],
  ctl:[{k:"sj",ar:"نسبة الفئة الكبرى (J)",min:0,max:0.3,step:0.01,v:0.05,f:v=>nf(v*100,0)+" %"},{k:"sh",ar:"نسبة الثقيلة (H)",min:0,max:0.7,step:0.01,v:0.2,f:v=>nf(v*100,0)+" %"},{k:"va",ar:"سرعة الاقتراب",min:110,max:160,step:1,v:135,f:v=>nf(v,0)+" kt"},{k:"rot",ar:"زمن إشغال المدرج",min:40,max:90,step:1,v:55,f:v=>nf(v,0)+" s"},{k:"dm",ar:"أدنى فاصل رادار",min:2.5,max:5,step:0.1,v:3,f:v=>nf(v,1)+" NM"}],
  pre:[{ar:"طائرات متوسطة فقط",set:{sj:0,sh:0}},{ar:"مطار مزدحم بالثقيلة",set:{sj:0.1,sh:0.45}}],
  calc(st){ const m=Math.max(0,1-st.sj-st.sh), p=[st.sj,st.sh,m]; st.capf=(sj,sh)=>{ const mm=Math.max(0,1-sj-sh), pp=[sj,sh,mm]; let e=0; for(let i=0;i<3;i++) for(let j=0;j<3;j++){ const d=Math.max(pfWK[i][j],st.dm), tm=Math.max(st.rot,d*3600/st.va); e+=pp[i]*pp[j]*tm; } return 3600/e; };
    st.mix=p; st.cap=st.capf(st.sj,st.sh); let e=0; for(let i=0;i<3;i++) for(let j=0;j<3;j++){ const d=Math.max(pfWK[i][j],st.dm); e+=p[i]*p[j]*Math.max(st.rot,d*3600/st.va); } st.iat=e; st.ref=st.capf(0,0); },
  scene(g,r,st,C){ const y=r.y+r.h*0.52, x0=r.x+r.w*0.06, x1=r.x+r.w*0.94; g.fillStyle=mixC(C.panel,C.struct,0.4); g.fillRect(x0,y,x1-x0,r.h*0.07); const seq=[0,1,2,2,1,2,0,2], cl=[C.power,C.ctrl,C.hyd], sz=[1.2,0.9,0.65]; let x=x1-(st.t*40)%80; const gap=(i,j)=>Math.max(pfWK[i][j],st.dm)/8*(x1-x0)*0.5;
    let px=x1-((st.t*30)%100); for(let k=0;k<seq.length;k++){ const t=seq[k], tt=seq[(k+1)%seq.length]; lplane(g,px,y-r.h*0.1-k*2,0.13*(x1-x0)/0.9*sz[t],0,C); ltx(g,["J","H","M"][t],px,y-r.h*0.22,{s:11,w:700,c:cl[t],m:true}); px-=gap(t,tt)+30; }
    ltx(g,"السعة "+nf(st.cap,0)+" هبوط/ساعة",r.x+r.w*0.5,r.y+r.h*0.1,{s:15,w:700,rtl:true}); ltx(g,"متوسط الفاصل "+nf(st.iat,0)+" s",r.x+r.w*0.5,r.y+r.h*0.84,{s:12,rtl:true,c:C.muted}); },
  plot(st){ return {x:[0,0.7],y:[10,Math.max(60,st.ref*1.1)],xl:"نسبة الثقيلة",yl:"هبوط/ساعة",curves:[{f:h=>st.capf(st.sj,h),c:"hyd"}],dots:[{x:st.sh,y:st.cap,c:"power"}]}; },
  ro(st){ return [["السعة",nf(st.cap,1)+" /h"],["متوسط الفاصل",nf(st.iat,0)+" s"],["سعة المتوسطة فقط",nf(st.ref,1)+" /h"],["الفقد بسبب الخليط",nf((1-st.cap/st.ref)*100,1)+" %"]]; },
  eq:["IAT_ij = max( ROT ، d_ij × 3600 / V_app )","متوسط IAT = Σ p_i p_j IAT_ij","السعة = 3600 / متوسط IAT"],
  note:["مصفوفة التباعد مبسطة (J: كبرى مثل A380، H: ثقيلة، M: متوسطة) ويحدد المنظم القيم الفعلية. زمن الإشغال يشترط خروج السابقة من المدرج.","التباعد الزمني يمكن أن يقلل حين تتحسن الرياح الأمامية أو بتقنيات أخرى."],
  quiz:[{q:"ما أثر زيادة نسبة الطائرات الثقيلة على السعة؟",o:["تقل","تزيد","لا أثر"],a:0,why:"التباعد خلفها أكبر."},
        {q:"إذا كان زمن إشغال المدرج 90 s فلا يمكن أن يقل الفاصل عن:",o:["90 s","45 s","30 s"],a:0,why:"المدرج لا يستقبل أخرى قبل تفريغه."}],
  ref:"الموضوع: سعة المدارج والتباعد (Runway Capacity)."
});
/* ---- 17 ---- */
LK("prf",{
  ar:"المقطع البصري عند ارتفاع القرار", en:"Visual segment at decision height",
  alt:"منظر جانبي لطائرة عند ارتفاع القرار على مسار 3 درجات مع قطع الرؤية من القمرة ومدى الرؤية على المدرج وصف أضواء الاقتراب",
  intro:["عند الاقتراب بجهاز ILS يصل الطيار إلى ارتفاع القرار DH: يرى المراجع البصرية فيتابع الهبوط، وإلا يلغي. ما يراه يعتمد على زاوية القطع من القمرة (الجسم يحجب ما تحت زاوية معينة)، وعلى نزول الأنف (زاوية الميل)، وعلى مدى الرؤية على المدرج RVR.",
         "أقرب نقطة على الأرض يمكن رؤيتها تبعد d = ارتفاع العين / tan(زاوية القطع − الميل). وما يبعد عن ذلك حتى RVR هو المقطع البصري. أضواء الاقتراب تمتد عادة نحو 900 م قبل العتبة؛ وكلما رأى الطيار عدداً أكبر منها كان قرار المتابعة أوضح."],
  ctl:[{k:"DH",ar:"ارتفاع القرار",min:50,max:400,step:5,v:200,f:v=>nf(v,0)+" ft"},{k:"rv",ar:"مدى الرؤية RVR",min:150,max:1200,step:10,v:550,f:v=>nf(v,0)+" m"},{k:"cut",ar:"زاوية القطع من القمرة",min:12,max:22,step:0.5,v:17,f:v=>nf(v,1)+"°"},{k:"pt",ar:"زاوية ميل الأنف",min:0,max:8,step:0.1,v:3.5,f:v=>nf(v,1)+"°"}],
  pre:[{ar:"ضباب كثيف",set:{rv:300}},{ar:"طقس جيد",set:{rv:1000}}],
  calc(st){ const H=st.DH*0.3048; st.dth=H/Math.tan(3*D2R); st.dn=H/Math.tan(Math.max(1,st.cut-st.pt)*D2R); st.lights0=st.dth-900; const a=Math.max(st.dn,st.lights0), b=Math.min(st.rv,st.dth); st.seg=Math.max(0,st.rv-st.dn); st.nb=Math.max(0,Math.floor((b-a)/30)+(b>a?1:0)); st.ok=st.nb>=3; },
  scene(g,r,st,C){ const gx=r.x+r.w*0.06, gx1=r.x+r.w*0.94, gy=r.y+r.h*0.78, mx=Math.max(st.dth*1.2,st.rv*1.2,900), s=(gx1-gx)/mx, hy=gy-st.DH*0.3048*s*4, ax=gx+0*s; g.fillStyle=mixC(C.panel,C.struct,0.35); g.fillRect(gx,gy,gx1-gx,5);
    const px=gx+(st.t*0.0+0)*s, th=gx+st.dth*s; ldot(g,th,gy,3,C.ink); ltx(g,"عتبة",th,gy+16,{s:10,rtl:true}); for(let i=0;i<31;i++){ const d=st.lights0+i*30, x=gx+Math.min(0,0)*s+(d)*s; if(d<0||d>st.dth) continue; const vis=d>=st.dn&&d<=st.rv; ldot(g,gx+d*s,gy-2,vis?3.2:2,vis?"#f2c200":C.muted,vis?1:0.6); }
    const ex=gx, ey=hy; lplane(g,ex+16,ey,0.1*(gx1-gx)/0.9,st.pt,C,{flip:true}); const ang=(st.cut-st.pt)*D2R; lline(g,[[ex,ey],[ex+(gy-ey)/Math.tan(ang)*s,gy]],C.power,1.6,[5,3]); ldot(g,gx+st.dn*s,gy,4,C.power); ltx(g,"أقرب نقطة مرئية "+nf(st.dn,0)+" m",gx+st.dn*s+8,gy+22,{s:11,a:"left",rtl:true,c:C.power});
    g.fillStyle=mixC(C.panel,C.hyd,0.25); g.fillRect(gx+st.dn*s,gy-18,(Math.min(st.rv,mx)-st.dn)*s,10); ltx(g,"المقطع البصري "+nf(st.seg,0)+" m",gx+(st.dn+Math.min(st.rv,mx))/2*s,gy-30,{s:12,w:600,rtl:true,c:C.hyd}); ltx(g,"أضواء ظاهرة: "+nf(st.nb,0),r.x+r.w*0.5,r.y+r.h*0.1,{s:14,w:700,rtl:true,c:st.ok?C.ink:C.power}); },
  plot(st){ return {x:[150,1200],y:[0,40],xl:"RVR m",yl:"أضواء ظاهرة",curves:[{f:rv=>{ const a=Math.max(st.dn,st.lights0), b=Math.min(rv,st.dth); return Math.max(0,Math.floor((b-a)/30)+(b>a?1:0)); },c:"hyd",n:300}],hl:[{y:3,c:"power",t:"حد تقريبي"}],dots:[{x:st.rv,y:st.nb,c:st.ok?"hyd":"power"}]}; },
  ro(st){ return [["بعد الطائرة عن العتبة",nf(st.dth,0)+" m"],["أقرب نقطة مرئية",nf(st.dn,0)+" m"],["المقطع البصري",nf(st.seg,0)+" m"],["أضواء الاقتراب الظاهرة",nf(st.nb,0)],["الحالة",st.ok?"مراجع كافية للمتابعة":"مراجع قليلة"]]; },
  eq:["d_عتبة = DH / tan 3°","d_قريب = h_عين / tan(زاوية القطع − الميل)","المقطع = RVR − d_قريب"],
  note:["العدد المطلوب من الأضواء حد تقريبي للتوضيح، والمراجع المطلوبة وقواعد المتابعة تحددها لوائح التشغيل.","زاوية الميل تزداد حين تبطؤ السرعة، فتقلّ الرؤية القريبة ويتحرك المقطع البصري بعيداً."],
  quiz:[{q:"زيادة ميل الأنف بالنسبة للأفق تجعل أقرب نقطة مرئية:",o:["أبعد","أقرب","كما هي"],a:0,why:"زاوية القطع − الميل تقل."},
        {q:"إذا كان RVR أقل من أقرب نقطة مرئية، فالطيار يرى:",o:["لا أضواء","كل الأضواء","نصفها"],a:0,why:"لا يوجد مقطع بصري."}],
  ref:"الموضوع: مراجع الاقتراب البصرية ومدى الرؤية (Visual Segment and RVR)."
});
/* ---- 18 ---- */
LK("prf",{
  ar:"أخطاء مقياس الارتفاع: البرد والضغط", en:"Altimeter errors: cold weather and pressure setting",
  alt:"طائرة فوق تل ومقياسان للارتفاع، المؤشر والحقيقي، مع فرق ناتج عن البرودة وعن ضبط الضغط، ومنحنى الخطأ مع الحرارة",
  intro:["مقياس الارتفاع الضغطي يفترض هواءً قياسياً. إن كان الهواء أبرد من المعياري يكون عمود الهواء أقصر، فيكون الارتفاع الحقيقي أقل مما يُظهره المقياس. التقدير: الخطأ ≈ H × (ΔT / T) حيث ΔT انخفاض الحرارة عن المعيارية.",
         "خطأ آخر يأتي من ضبط الضغط: إذا كان الضغط الحقيقي أقل من المضبوط، فالمقياس يُظهر أعلى من الحقيقة بنحو 27 قدماً لكل hPa ('من الضغط العالي إلى المنخفض احذر الأرض'). وهذان الخطآن يتجمعان قرب الأرض في الطقس البارد، فيقلّ هامش العوائق."],
  ctl:[{k:"Ts",ar:"حرارة المطار",min:-50,max:45,step:1,v:-20,f:v=>nf(v,0)+" °C"},{k:"Hi",ar:"الارتفاع المؤشر فوق المطار",min:200,max:3000,step:50,v:1500,f:v=>nf(v,0)+" ft"},{k:"el",ar:"ارتفاع المطار",min:0,max:6000,step:100,v:0,f:v=>nf(v,0)+" ft"},{k:"dq",ar:"الضغط الحقيقي − المضبوط",min:-20,max:20,step:1,v:0,f:v=>nf(v,0)+" hPa"}],
  pre:[{ar:"برد شديد",set:{Ts:-40,dq:0}},{ar:"منخفض جوي",set:{dq:-15,Ts:5}},{ar:"الاثنان معاً",set:{Ts:-30,dq:-10}}],
  calc(st){ const Tisa=15-0.00198*st.el, Ta=273.15+st.Ts-0.00198*st.Hi/2*0, Ti=273.15+Tisa; st.tf=(T,H)=>{ const ta=273.15+T-0.00198*H/2, ti=273.15+Tisa-0.00198*H/2; return H*(ta/ti)-H; }; st.et=st.tf(st.Ts,st.Hi); st.ep=27*st.dq; st.tot=st.et+st.ep; st.tr=st.Hi+st.tot; st.dt=st.Ts-Tisa; },
  scene(g,r,st,C){ const gx=r.x+r.w*0.06, gx1=r.x+r.w*0.94, gy=r.y+r.h*0.84, hs=r.h*0.5/3000; g.fillStyle=mixC(C.panel,C.struct,0.4); g.beginPath(); g.moveTo(gx,gy); g.lineTo(gx+(gx1-gx)*0.35,gy); g.lineTo(gx+(gx1-gx)*0.55,gy-st.Hi*0.2*hs); g.lineTo(gx1,gy-st.Hi*0.2*hs*1.0); g.lineTo(gx1,gy+8); g.lineTo(gx,gy+8); g.closePath(); g.fill();
    const ax=gx+(gx1-gx)*0.28, ya=gy-st.Hi*hs, yt=gy-st.tr*hs; lplane(g,ax,yt,0.1*(gx1-gx)/0.9,0,C,{flip:true}); lline(g,[[ax,gy],[ax,ya]],C.muted,1.4,[4,3]); ldot(g,ax,ya,4,C.muted); ltx(g,"المؤشر "+nf(st.Hi,0)+" ft",ax-14,ya,{s:11,a:"right",rtl:true,c:C.muted});
    lline(g,[[ax+60,gy],[ax+60,yt]],st.tot<0?C.power:C.hyd,2.4); ltx(g,"الحقيقي "+nf(st.tr,0)+" ft",ax+68,yt,{s:11,a:"left",rtl:true,w:700,c:st.tot<0?C.power:C.hyd}); ltx(g,"فرق "+nf(st.tot,0)+" ft  (برد "+nf(st.et,0)+" ضغط "+nf(st.ep,0)+")",r.x+r.w*0.5,r.y+r.h*0.08,{s:12,w:600,rtl:true}); ltx(g,"انحراف الحرارة "+nf(st.dt,0)+" °C عن المعيارية",r.x+r.w*0.5,r.y+r.h*0.92,{s:11,rtl:true,c:C.muted}); },
  plot(st){ return {x:[-50,45],y:[-Math.max(300,Math.abs(st.tf(-50,3000))*1.05),100],xl:"حرارة المطار °C",yl:"الخطأ ft",curves:[{f:T=>st.tf(T,st.Hi),c:"hyd"}],hl:[{y:0,c:"muted",t:""}],dots:[{x:st.Ts,y:st.et,c:"power"}]}; },
  ro(st){ return [["انحراف الحرارة عن المعيارية",nf(st.dt,0)+" °C"],["خطأ البرودة",nf(st.et,0)+" ft"],["خطأ ضبط الضغط",nf(st.ep,0)+" ft"],["الخطأ الكلي",nf(st.tot,0)+" ft"],["الارتفاع الحقيقي فوق المطار",nf(st.tr,0)+" ft"]]; },
  eq:["H_حقيقي ≈ H_مؤشر × (T_فعلي / T_معياري)","خطأ الضغط ≈ 27 ft × (p_حقيقي − p_مضبوط)"],
  note:["تقدير مبسط يعتمد على الحرارة المتوسطة؛ الجداول الرسمية لتصحيح الارتفاع في البرد تُستخدم في الإجراءات الفعلية.","في الطقس البارد يضيف الطيارون تصحيحاً لارتفاعات الاقتراب الدنيا حسب جداول المطار."],
  quiz:[{q:"في طقس شديد البرودة، الارتفاع الحقيقي:",o:["أقل من المؤشر","أعلى من المؤشر","مساوٍ"],a:0,why:"الهواء البارد عمود أقصر، فالضغط ينزل أسرع."},
        {q:"إذا هبط الضغط الحقيقي دون المضبوط، فالمقياس يعرض:",o:["أعلى من الحقيقة","أقل من الحقيقة","الحقيقة"],a:0,why:"الطائرة أدنى مما يظهر؛ احذر الأرض."}],
  ref:"الموضوع: أخطاء الارتفاع الضغطي (Altimeter Errors)."
});
