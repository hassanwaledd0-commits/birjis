/* ---------- Book 12: Flight Operations and Performance (1/3): fuel, routes, cost, runway ---------- */
/* ---- 1 ---- */
LK("prf",{
  ar:"سياسة الوقود: من الرحلة إلى الاحتياطي", en:"Fuel policy: trip, contingency, alternate and final reserve",
  alt:"شريط أفقي مقسّم إلى مقاطع الوقود: التاكسي والرحلة والاحتياطي والبديل والاحتياطي النهائي، ومنحنى وقود الإقلاع مع المسافة",
  intro:["لا تُقلع الطائرة بوقود الرحلة وحده. تضاف إليه طبقات أمان: وقود للتاكسي، واحتياطي طارئ نسبته من وقود الرحلة (مثل 5%) لتغطية تغيّر الرياح والمسار، ووقود للتحويل إلى مطار بديل، ثم احتياطي نهائي يكفي للتحليق نحو 30 دقيقة قرب المطار.",
         "وقود الإقلاع الكلي (block fuel) هو مجموع هذه الأجزاء. وكل كيلوغرام إضافي يزيد الوزن فيزيد الاستهلاك أيضاً، لذلك تحسب شركات الطيران الأرقام بعناية: القليل يُعرّض للخطر والكثير يُهدر المال."],
  ctl:[{k:"D",ar:"مسافة الرحلة",min:200,max:7000,step:50,v:1500,f:v=>nf(v,0)+" NM"},{k:"FF",ar:"استهلاك الوقود في الرحلة",min:1500,max:15000,step:100,v:2600,f:v=>nf(v,0)+" kg/h"},{k:"tas",ar:"السرعة الحقيقية",min:380,max:520,step:5,v:440,f:v=>nf(v,0)+" kt"},{k:"wd",ar:"الريح على المسار (+ خلفية)",min:-80,max:80,step:5,v:0,f:v=>nf(v,0)+" kt"},{k:"cp",ar:"الاحتياطي الطارئ",min:3,max:10,step:0.5,v:5,f:v=>nf(v,1)+" %"},{k:"da",ar:"مسافة البديل",min:30,max:500,step:10,v:120,f:v=>nf(v,0)+" NM"},{k:"hd",ar:"الاحتياطي النهائي",min:30,max:60,step:5,v:30,f:v=>nf(v,0)+" min"},{k:"tx",ar:"وقود التاكسي",min:100,max:1500,step:50,v:250,f:v=>nf(v,0)+" kg"}],
  pre:[{ar:"رحلة قصيرة",set:{D:500,wd:0}},{ar:"رحلة طويلة",set:{D:3500,FF:2800,wd:-40}}],
  calc(st){ const gs=Math.max(150,st.tas+st.wd); st.gs=gs; st.tt=st.D/gs; st.fr=st.FF*st.tt; st.fc=st.fr*st.cp/100; st.fa=st.FF*0.9*(st.da/(st.tas*0.85)); st.ff=st.FF*0.8*st.hd/60; st.bl=st.tx+st.fr+st.fc+st.fa+st.ff; st.ld=st.fc+st.fa+st.ff;
    st.blk=D=>{ const t=D/gs, f=st.FF*t; return st.tx+f*(1+st.cp/100)+st.fa+st.ff; }; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.06, w=r.w*0.88, y=r.y+r.h*0.4, h=r.h*0.2, parts=[[st.tx,"تاكسي","muted"],[st.fr,"الرحلة","hyd"],[st.fc,"طارئ","ctrl"],[st.fa,"بديل","gear"],[st.ff,"نهائي","power"]]; let x=x0;
    parts.forEach(([v,t,c],i)=>{ const ww=w*v/st.bl; g.fillStyle=mixC(C.panel,KC(c,C),0.62); g.fillRect(x,y,ww,h); g.strokeStyle=C.ink; g.lineWidth=1; g.strokeRect(x,y,ww,h); if(ww>34){ ltx(g,t,x+ww/2,y+h/2-7,{s:11,rtl:true}); ltx(g,nf(v/1000,2)+" t",x+ww/2,y+h/2+8,{s:10,m:true}); } else ltx(g,nf(v/1000,1),x+ww/2,y+h+(i%2?30:14),{s:10,m:true,c:KC(c,C)}); x+=ww; });
    ltx(g,"وقود الإقلاع الكلي "+nf(st.bl/1000,2)+" t",r.x+r.w*0.5,r.y+r.h*0.14,{s:14,w:700,rtl:true}); ltx(g,"يبقى عند الهبوط من دون بديل "+nf(st.ld/1000,2)+" t",r.x+r.w*0.5,r.y+r.h*0.72,{s:12,rtl:true,c:C.muted}); ltx(g,"زمن الرحلة "+nf(st.tt,2)+" h",r.x+r.w*0.5,r.y+r.h*0.84,{s:12,rtl:true,c:C.muted}); },
  plot(st){ return {x:[200,7000],y:[0,st.blk(7000)/1000*1.05],xl:"مسافة الرحلة NM",yl:"وقود الإقلاع t",curves:[{f:d=>st.blk(d)/1000,c:"hyd"}],dots:[{x:st.D,y:st.bl/1000,c:"power"}]}; },
  ro(st){ return [["وقود الرحلة",nf(st.fr,0)+" kg"],["الاحتياطي الطارئ",nf(st.fc,0)+" kg"],["البديل",nf(st.fa,0)+" kg"],["الاحتياطي النهائي",nf(st.ff,0)+" kg"],["وقود الإقلاع",nf(st.bl,0)+" kg"]]; },
  eq:["وقود الإقلاع = تاكسي + رحلة + طارئ + بديل + نهائي","طارئ = c % × وقود الرحلة","نهائي = معدل الانتظار × الزمن"],
  note:["النموذج يتجاهل أن الوزن الإضافي يزيد الاستهلاك فعلاً. في الحساب الحقيقي يُكرَّر الحساب حتى يستقر.","النسب والمدد أمثلة عامة تتفق مع أنظمة شائعة؛ المعتمد هو ما تحدده سلطة الطيران وشركة الطيران."],
  quiz:[{q:"لماذا نضيف وقوداً للبديل؟",o:["لتغطية الذهاب إلى مطار آخر إن تعذّر الهبوط","لزيادة الوزن","لتبريد المحرك"],a:0,why:"قد يُغلق المطار أو يسوء الطقس."},
        {q:"ماذا يحدث لوقود الرحلة لو ازدادت الرياح الأمامية؟",o:["يزداد","يقل","لا يتغير"],a:0,why:"السرعة الأرضية تقل فيطول زمن الطيران."}],
  show:{ar:"اعرض مجسّات الوقود",fn:()=>lrnSel("fuel_probes")},
  ref:"الموضوع: تخطيط الوقود (Fuel Planning)."
});
/* ---- 2 ---- */
LK("prf",{
  ar:"نقطة التساوي ونقطة اللاعودة", en:"Equal time point and point of no return",
  alt:"خط بين مطارين عليه نقطتا التساوي واللاعودة وسهم الريح، ومنحنى موقع نقطة التساوي مع سرعة الريح",
  intro:["إذا حدث طارئ في منتصف الطريق فالسؤال: أعود أم أكمل؟ نقطة التساوي ETP هي النقطة التي يكون عندها زمن العودة إلى الأصل مساوياً لزمن المتابعة إلى الوجهة. تتغير مع الرياح: الريح الخلفية في الاتجاه نحو الوجهة تقرّب النقطة من المطار الأصلي.",
         "نقطة اللاعودة PNR تعتمد على الوقود: بعدها لا يكفي الوقود للعودة. d_PNR = E·G_out·G_ret/(G_out + G_ret) حيث E هي المدة التي يكفيها الوقود، وG_out وG_ret السرعتان الأرضيتان في الاتجاهين."],
  ctl:[{k:"D",ar:"طول المسار",min:800,max:4500,step:50,v:2400,f:v=>nf(v,0)+" NM"},{k:"tas",ar:"السرعة الحقيقية",min:350,max:520,step:5,v:440,f:v=>nf(v,0)+" kt"},{k:"W",ar:"الريح الخلفية نحو الوجهة",min:-100,max:100,step:5,v:30,f:v=>nf(v,0)+" kt"},{k:"E",ar:"مدة الوقود المتاحة",min:2,max:14,step:0.25,v:7,f:v=>nf(v,2)+" h"}],
  pre:[{ar:"بلا رياح",set:{W:0}},{ar:"ريح خلفية قوية",set:{W:80}},{ar:"ريح أمامية قوية",set:{W:-80}}],
  calc(st){ st.go=st.tas+st.W; st.gr=st.tas-st.W; st.etp=st.D*st.gr/(st.go+st.gr); st.tetp=st.etp/st.go; st.pnr=st.E*st.go*st.gr/(st.go+st.gr); st.pnrIn=st.pnr<st.D; st.etpf=w=>st.D*(st.tas-w)/(2*st.tas); },
  scene(g,r,st,C){ const x0=r.x+r.w*0.1, x1=r.x+r.w*0.9, y=r.y+r.h*0.46, X=d=>x0+(x1-x0)*d/st.D; lline(g,[[x0,y],[x1,y]],C.ink,2); [x0,x1].forEach((x,i)=>{ ldot(g,x,y,6,C.ink); ltx(g,i?"الوجهة B":"المصدر A",x,y+22,{s:12,w:600,rtl:true}); });
    const mk=(d,t,c,dy)=>{ ldot(g,X(d),y,7,KC(c,C)); lline(g,[[X(d),y],[X(d),y+dy]],KC(c,C),1.4,[3,3]); ltx(g,t,X(d),y+dy+(dy>0?14:-14),{s:12,w:600,rtl:true,c:KC(c,C)}); }; mk(st.etp,"نقطة التساوي "+nf(st.etp,0)+" NM","hyd",-38); if(st.pnrIn) mk(st.pnr,"نقطة اللاعودة "+nf(st.pnr,0)+" NM","power",42);
    const wa=clamp(st.W/100,-1,1); if(Math.abs(st.W)>1) for(let i=0;i<5;i++){ const f=(st.t*0.25+i/5)%1, x=x0+(x1-x0)*f; larrow(g,x,r.y+r.h*0.14,x+Math.sign(wa)*(10+22*Math.abs(wa)),r.y+r.h*0.14,C.muted,1.5,6); }
    ltx(g,"ريح "+nf(st.W,0)+" kt",r.x+r.w*0.5,r.y+r.h*0.06,{s:11,rtl:true,c:C.muted}); ltx(g,"زمن حتى التساوي "+nf(st.tetp*60,0)+" min",r.x+r.w*0.5,r.y+r.h*0.88,{s:12,rtl:true}); },
  plot(st){ return {x:[-100,100],y:[0,st.D],xl:"الريح الخلفية kt",yl:"البعد عن A NM",curves:[{f:st.etpf,c:"hyd"}],hl:[{y:st.D/2,c:"muted",t:"المنتصف"}],dots:[{x:st.W,y:st.etp,c:"power"}]}; },
  ro(st){ return [["السرعة الأرضية للمتابعة",nf(st.go,0)+" kt"],["السرعة الأرضية للعودة",nf(st.gr,0)+" kt"],["بعد نقطة التساوي عن A",nf(st.etp,0)+" NM"],["نقطة اللاعودة",st.pnrIn?nf(st.pnr,0)+" NM":"أبعد من الوجهة: لا توجد"]]; },
  eq:["G_out = TAS + W   ،   G_ret = TAS − W","d_ETP = D · G_ret / (G_out + G_ret)","d_PNR = E · G_out · G_ret / (G_out + G_ret)"],
  note:["الحساب يفترض أن السرعتين ثابتتان. في الواقع يتغير المحرك الواحد المعطّل سرعة التحليق وارتفاعه.","نقطة التساوي هي ما يستخدمه المخطط لاختيار مطارات بديلة في الطرق فوق المحيط."],
  quiz:[{q:"ريح خلفية نحو الوجهة تجعل نقطة التساوي:",o:["أقرب إلى المصدر","أقرب إلى الوجهة","في المنتصف دائماً"],a:0,why:"العودة ضد الريح أبطأ، فيجب أن نكون أقرب إلى المصدر لتساوي الزمنين."},
        {q:"ما الذي يحدد نقطة اللاعودة؟",o:["كمية الوقود","عدد الركاب","لون الطائرة"],a:0,why:"هي النقطة التي لا يكفي بعدها الوقود للعودة."}],
  ref:"الموضوع: تخطيط الطيران ومسارات الطوارئ (Flight Planning)."
});
/* ---- 3 ---- */
LK("prf",{
  ar:"ETOPS: دائرة التحويل ومطارات الطوارئ", en:"ETOPS diversion radius and alternate spacing",
  alt:"مطاران بديلان بدائرتين نصفا قطرهما مسافة التحويل خلال زمن محدد وبينهما فجوة، ومنحنى أقصى تباعد مع زمن القاعدة",
  intro:["الطائرة ثنائية المحرك فوق المحيط يجب أن تبقى دائماً قريبة من مطار صالح للهبوط. تحدد قاعدة ETOPS أقصى زمن طيران بمحرك واحد إلى أقرب بديل: مثلاً 120 أو 180 أو 240 دقيقة. نصف قطر الدائرة R = V_OEI × t_div.",
         "إذا وُجد مطاران بديلان على طرفي مقطع من الطريق، يغطي كل منهما دائرته، فيتحقق الشرط إذا كانت الفجوة بينهما أقل من أو تساوي 2R (على امتداد الطريق). ريح التحويل تغير الدائرة؛ لذلك يُحسب الأسوأ الاحتمالي."],
  ctl:[{k:"td",ar:"زمن التحويل المسموح",min:60,max:330,step:10,v:180,f:v=>nf(v,0)+" min"},{k:"vo",ar:"سرعة بمحرك واحد (هواء ساكن)",min:300,max:420,step:5,v:330,f:v=>nf(v,0)+" kt"},{k:"wh",ar:"ريح أمامية متوسطة للتحويل",min:-40,max:80,step:5,v:20,f:v=>nf(v,0)+" kt"},{k:"gap",ar:"الفجوة بين البديلين",min:500,max:3500,step:50,v:1800,f:v=>nf(v,0)+" NM"}],
  pre:[{ar:"قاعدة 120 دقيقة",set:{td:120}},{ar:"قاعدة 240 دقيقة",set:{td:240}}],
  calc(st){ st.R=Math.max(0,(st.vo-st.wh)*st.td/60); st.mx=2*st.R; st.ok=st.gap<=st.mx; st.mg=st.mx-st.gap; st.fx=t=>2*(st.vo-st.wh)*t/60; },
  scene(g,r,st,C){ const cy=r.y+r.h*0.5, x0=r.x+r.w*0.08, x1=r.x+r.w*0.92, s=Math.min((x1-x0)*0.45/Math.max(st.R,st.gap/2,1),r.h*0.42/Math.max(st.R,1)), ctr=r.x+r.w*0.5, a=ctr-st.gap/2*s, b=ctr+st.gap/2*s;
    g.save(); g.beginPath(); g.rect(r.x,r.y,r.w,r.h); g.clip(); [a,b].forEach(x=>{ g.fillStyle=mixC(C.panel,st.ok?C.hyd:C.power,0.14); g.beginPath(); g.arc(x,cy,st.R*s,0,Math.PI*2); g.fill(); g.strokeStyle=st.ok?C.hyd:C.power; g.lineWidth=1.4; g.stroke(); ldot(g,x,cy,5,C.ink); });
    lline(g,[[a,cy],[b,cy]],C.ink,2.4); const px=a+(b-a)*((st.t*0.1)%1); ldot(g,px,cy,4,C.ctrl); g.restore(); ltx(g,"بديل 1",a,cy+16,{s:11,rtl:true}); ltx(g,"بديل 2",b,cy+16,{s:11,rtl:true});
    ltx(g,"R = "+nf(st.R,0)+" NM  ·  أقصى فجوة "+nf(st.mx,0)+" NM",r.x+r.w*0.5,r.y+r.h*0.08,{s:13,w:600,m:true}); ltx(g,st.ok?"الطريق مغطّى":"الفجوة أكبر من 2R",r.x+r.w*0.5,r.y+r.h*0.92,{s:13,w:600,rtl:true,c:st.ok?C.hyd:C.power}); },
  plot(st){ return {x:[60,330],y:[0,st.fx(330)*1.05],xl:"زمن القاعدة min",yl:"أقصى فجوة NM",curves:[{f:st.fx,c:"hyd"}],hl:[{y:st.gap,c:"power",t:"الفجوة الحالية"}],dots:[{x:st.td,y:st.mx,c:st.ok?"hyd":"power"}]}; },
  ro(st){ return [["نصف قطر التحويل R",nf(st.R,0)+" NM"],["أقصى تباعد بين البديلين",nf(st.mx,0)+" NM"],["الفجوة الحالية",nf(st.gap,0)+" NM"],["الهامش",nf(st.mg,0)+" NM"],["الحالة",st.ok?"مغطّى":"يحتاج بديلاً إضافياً"]]; },
  eq:["R = (V_OEI − W_ريح أمامية) × t_div","أقصى فجوة = 2R"],
  note:["السرعة الأرضية الفعلية في التحويل تتبع الريح والارتفاع المتاح بمحرك واحد، لكننا نستخدم رقماً متوسطاً.","الشروط الكاملة تشمل حالة المطار والطقس عند وقت الوصول وقدرة التحمّل للأنظمة؛ هذا الدرس يعرض الهندسة فقط."],
  quiz:[{q:"زيادة زمن القاعدة من 120 إلى 240 دقيقة تجعل أقصى فجوة:",o:["تتضاعف","تنصف","لا تتغير"],a:0,why:"R تتناسب مع الزمن."},
        {q:"ريح أمامية قوية أثناء التحويل تجعل نصف القطر:",o:["أصغر","أكبر","كما هو"],a:0,why:"السرعة الأرضية أقل."}],
  ref:"الموضوع: عمليات الطائرات ثنائية المحرك بعيدة المدى (Extended-range Operations)."
});
/* ---- 4 ---- */
const pfR=3440.065;
function pfGC(p1,p2,dl){ const a=p1*D2R,b=p2*D2R,l=dl*D2R, s=Math.acos(clamp(Math.sin(a)*Math.sin(b)+Math.cos(a)*Math.cos(b)*Math.cos(l),-1,1)); return s*pfR; }
function pfRh(p1,p2,dl){ const a=p1*D2R,b=p2*D2R,l=dl*D2R, ps=x=>Math.log(Math.tan(Math.PI/4+x/2)), dpsi=ps(b)-ps(a), q=Math.abs(dpsi)>1e-9?(b-a)/dpsi:Math.cos(a); return pfR*Math.hypot(b-a,q*l); }
LK("prf",{
  ar:"الدائرة العظمى والخط المعيّن", en:"Great circle versus rhumb line",
  alt:"خريطة ميركاتور فيها مسار مستقيم (الخط المعيّن) ومسار منحنٍ نحو القطب (الدائرة العظمى)، ومنحنى وفر المسافة مع فرق خط الطول",
  intro:["أقصر مسافة بين نقطتين على سطح الكرة هي قوس الدائرة العظمى. على خريطة ميركاتور تظهر هذه الدائرة منحنية نحو القطب، بينما الخط المستقيم على الخريطة (الخط المعيّن، rhumb line) يقطع كل خطوط الطول بزاوية ثابتة لكنه أطول.",
         "الفرق يزداد كلما زاد فرق خط الطول وارتفع خط العرض. لذلك تطير الرحلات بين أوروبا وأمريكا الشمالية بمسارات منحنية قريبة من القطب. قوة الريح تُغيّر المسار الأمثل لاحقاً، لكن الهندسة هي الأساس."],
  ctl:[{k:"p1",ar:"خط عرض المنطلق",min:-60,max:70,step:0.5,v:51.5,f:v=>nf(v,1)+"°"},{k:"p2",ar:"خط عرض الوصول",min:-60,max:70,step:0.5,v:40.6,f:v=>nf(v,1)+"°"},{k:"dl",ar:"فرق خط الطول",min:10,max:150,step:1,v:74,f:v=>nf(v,0)+"°"}],
  pre:[{ar:"عبر الأطلسي",set:{p1:51.5,p2:40.6,dl:74}},{ar:"قريبة من خط الاستواء",set:{p1:5,p2:-5,dl:60}},{ar:"مسار شمالي طويل",set:{p1:60,p2:55,dl:130}}],
  calc(st){ st.gc=pfGC(st.p1,st.p2,st.dl); st.rh=pfRh(st.p1,st.p2,st.dl); st.sv=st.rh-st.gc; st.pc=st.sv/st.rh*100; st.dfn=d=>(pfRh(st.p1,st.p2,d)-pfGC(st.p1,st.p2,d))/pfRh(st.p1,st.p2,d)*100;
    const a=st.p1*D2R,b=st.p2*D2R,l=st.dl*D2R, y=Math.sin(l)*Math.cos(b), x=Math.cos(a)*Math.sin(b)-Math.sin(a)*Math.cos(b)*Math.cos(l); st.c0=(Math.atan2(y,x)/D2R+360)%360;
    st.ps=x=>Math.log(Math.tan(Math.PI/4+x*D2R/2)); const P1=[Math.cos(a),0,Math.sin(a)], P2=[Math.cos(b)*Math.cos(l),Math.cos(b)*Math.sin(l),Math.sin(b)], om=Math.acos(clamp(P1[0]*P2[0]+P1[1]*P2[1]+P1[2]*P2[2],-1,1)); st.gcp=[]; for(let i=0;i<=40;i++){ const f=i/40, A=Math.sin((1-f)*om)/Math.sin(om||1), B=Math.sin(f*om)/Math.sin(om||1), v=[A*P1[0]+B*P2[0],A*P1[1]+B*P2[1],A*P1[2]+B*P2[2]]; st.gcp.push([Math.atan2(v[1],v[0])/D2R,Math.asin(clamp(v[2],-1,1))/D2R]); } },
  scene(g,r,st,C){ const mx=r.x+r.w*0.1, mw=r.w*0.8, my=r.y+r.h*0.1, mh=r.h*0.74, lat0=Math.min(st.p1,st.p2,...st.gcp.map(p=>p[1]))-8, lat1=Math.max(st.p1,st.p2,...st.gcp.map(p=>p[1]))+8, y0=st.ps(lat0), y1=st.ps(lat1), X=l=>mx+(l/st.dl*0.9+0.05)*mw, Y=la=>my+mh-(st.ps(la)-y0)/(y1-y0)*mh;
    g.fillStyle=mixC(C.panel,C.hyd,0.07); g.fillRect(mx,my,mw,mh); g.strokeStyle=C.line; g.lineWidth=1; g.strokeRect(mx,my,mw,mh); for(let la=Math.ceil(lat0/10)*10;la<=lat1;la+=10){ lline(g,[[mx,Y(la)],[mx+mw,Y(la)]],C.line,0.8,[2,4]); ltx(g,la+"°",mx-4,Y(la),{s:9,m:true,a:"right",c:C.muted}); }
    lline(g,[[X(0),Y(st.p1)],[X(st.dl),Y(st.p2)]],C.ctrl,2.2); lline(g,st.gcp.map(p=>[X(p[0]),Y(p[1])]),C.power,2.4); ldot(g,X(0),Y(st.p1),5,C.ink); ldot(g,X(st.dl),Y(st.p2),5,C.ink); const f=(st.t*0.12)%1, q=st.gcp[Math.floor(f*40)]; ldot(g,X(q[0]),Y(q[1]),4,C.power);
    ltx(g,"أ",X(0),Y(st.p1)+14,{s:12,w:700,rtl:true}); ltx(g,"ب",X(st.dl),Y(st.p2)+14,{s:12,w:700,rtl:true}); ltx(g,"دائرة عظمى "+nf(st.gc,0)+" NM",r.x+r.w*0.3,r.y+r.h*0.93,{s:12,rtl:true,c:C.power}); ltx(g,"خط معيّن "+nf(st.rh,0)+" NM",r.x+r.w*0.72,r.y+r.h*0.93,{s:12,rtl:true,c:C.ctrl}); },
  plot(st){ return {x:[10,150],y:[0,Math.max(1,st.dfn(150)*1.1)],xl:"فرق خط الطول °",yl:"الوفر %",curves:[{f:st.dfn,c:"power"}],dots:[{x:st.dl,y:st.pc,c:"hyd"}]}; },
  ro(st){ return [["الدائرة العظمى",nf(st.gc,0)+" NM"],["الخط المعيّن",nf(st.rh,0)+" NM"],["الوفر",nf(st.sv,0)+" NM"],["الوفر %",nf(st.pc,1)+" %"],["الاتجاه الابتدائي",nf(st.c0,0)+"°"]]; },
  eq:["cos σ = sin φ₁ sin φ₂ + cos φ₁ cos φ₂ cos Δλ ،  d = R σ","ψ = ln tan(π/4 + φ/2) ،  q = Δφ/Δψ","d_rhumb = R √(Δφ² + q² Δλ²)"],
  note:["نصف قطر الأرض 3440 NM، ويفترض الحساب كرة مثالية. الخرائط الاسمية تأخذ شكل الأرض البيضاوي بدقة أعلى.","الاتجاه على الدائرة العظمى يتغير باستمرار، ولذلك تُقسم الرحلة إلى نقاط طريق."],
  quiz:[{q:"أين يظهر المسار الأقصر على خريطة ميركاتور؟",o:["منحنياً نحو القطب","خطاً مستقيماً","منحنياً نحو خط الاستواء"],a:0,why:"الدائرة العظمى تتقوس نحو القطب في نصف الكرة الشمالي."},
        {q:"متى يتساوى المساران تقريباً؟",o:["عند فرق خط طول صغير أو قرب خط الاستواء","دائماً","عند خطوط عرض عالية فقط"],a:0,why:"التقوس صغير في هذه الحالات."}],
  ref:"الموضوع: الملاحة الكروية (Spherical Navigation)."
});
/* ---- 5 ---- */
LK("prf",{
  ar:"مؤشر التكلفة: السرعة الاقتصادية", en:"Cost index and economic cruise Mach",
  alt:"منحنى تكلفة كل ميل مع رقم ماخ يتألف من جزء الوقود وجزء الوقت، مع نقطة أدنى تكلفة",
  intro:["الطيران أسرع يحرق وقوداً أكثر لكل ميل بعد حد معين، لكنه يوفر الوقت (طاقم وصيانة وإيجار). التكلفة لكل ميل C = وقود/ميل × سعر الوقود + تكلفة الساعة / السرعة. أدنى تكلفة تعطي رقم ماخ اقتصادياً يتغير مع نسبة تكلفة الوقت إلى الوقود، وتسمى هذه النسبة مؤشر التكلفة.",
         "عندما يرتفع سعر الوقود يميل الاقتصادي إلى البطء، وعندما ترتفع تكلفة الوقت يميل إلى السرعة. وأقل وقود لكل ميل (أطول مدى) يحدث عند ماخ مدى أقصى M₀، والاقتصادي يكون عادة أعلى منه قليلاً."],
  ctl:[{k:"Pf",ar:"سعر الوقود",min:0.4,max:1.6,step:0.05,v:0.8,f:v=>nf(v,2)+" /kg"},{k:"Ct",ar:"تكلفة الوقت",min:200,max:6000,step:100,v:1200,f:v=>nf(v,0)+" /h"},{k:"fm",ar:"أقل وقود لكل ميل",min:3,max:25,step:0.5,v:5,f:v=>nf(v,1)+" kg/NM"},{k:"M0",ar:"ماخ المدى الأقصى",min:0.72,max:0.80,step:0.005,v:0.76,f:v=>nf(v,3)}],
  pre:[{ar:"وقود غالٍ",set:{Pf:1.4,Ct:800}},{ar:"وقت غالٍ",set:{Pf:0.6,Ct:4500}}],
  calc(st){ st.fn=M=>st.fm*(1+14*Math.pow(M-st.M0,2)+260*Math.pow(Math.max(0,M-0.8),2)); st.ts=M=>1/(573*M); st.cf=M=>st.fn(M)*st.Pf; st.ct=M=>st.Ct*st.ts(M); st.cn=M=>st.cf(M)+st.ct(M); let b=0.65,bv=1e9; for(let M=0.65;M<=0.9;M+=0.001){ const c=st.cn(M); if(c<bv){ bv=c; b=M; } } st.Mo=b; st.co=bv; st.fx=st.fn(b)/st.fm*100-100; st.tsv=(1/(573*st.M0)-1/(573*b))*60*1000; st.ci=st.Ct/st.Pf; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.52, R=Math.min(r.w*0.2,r.h*0.34), a0=135*D2R, sw=270*D2R, v=(st.Mo-0.65)/0.25; g.strokeStyle=C.line; g.lineWidth=R*0.2; g.beginPath(); g.arc(cx,cy,R,a0,a0+sw); g.stroke(); g.strokeStyle=mixC(C.panel,C.hyd,0.8); g.beginPath(); g.arc(cx,cy,R,a0,a0+sw*v); g.stroke();
    const an=a0+sw*v; lline(g,[[cx,cy],[cx+Math.cos(an)*R*0.9,cy+Math.sin(an)*R*0.9]],C.ink,3); ldot(g,cx,cy,6,C.ink); ltx(g,"M "+nf(st.Mo,3),cx,cy+R+26,{s:16,w:700,m:true}); ltx(g,"أقل تكلفة: "+nf(st.co,1)+" لكل ميل",cx,cy+R+48,{s:12,rtl:true,c:C.muted});
    ltx(g,"مؤشر التكلفة (الوقت ÷ الوقود) = "+nf(st.ci,0),r.x+r.w*0.5,r.y+r.h*0.08,{s:12,rtl:true}); ltx(g,"وقود إضافي "+nf(st.fx,1)+" %  ·  وقت أقل "+nf(st.tsv,0)+" s/NM",r.x+r.w*0.5,r.y+r.h*0.9,{s:11,rtl:true,c:C.muted}); },
  plot(st){ return {x:[0.65,0.9],y:[0,st.cn(0.65)*1.05],xl:"رقم ماخ",yl:"التكلفة لكل ميل",curves:[{f:st.cn,c:"power",w:2.6},{f:st.cf,c:"fuel",dash:[5,3]},{f:st.ct,c:"hyd",dash:[5,3]}],leg:[{c:"power",t:"الكلية"},{c:"fuel",t:"وقود",dash:[5,3]},{c:"hyd",t:"وقت",dash:[5,3]}],dots:[{x:st.Mo,y:st.co,c:"power"}]}; },
  ro(st){ return [["ماخ الأدنى تكلفة",nf(st.Mo,3)],["السرعة الحقيقية",nf(573*st.Mo,0)+" kt"],["الوقود الإضافي عن أقصى مدى",nf(st.fx,1)+" %"],["مؤشر التكلفة",nf(st.ci,0)]]; },
  eq:["C(M) = f(M) · P_f + C_t / (a M)   ،   a ≈ 573 kt","f(M) = f_min [1 + k₁ (M − M₀)² + k₂ (M − 0.8)₊²]","M* = argmin C(M)"],
  note:["دالة الوقود لكل ميل شكل نموذجي: انحدار صغير حول M₀ ثم ارتفاع حاد عند اقتراب تأثير الانضغاط. القيم الفعلية من كتيب أداء الطائرة.","شركات الطيران تضبط مؤشر التكلفة لكل رحلة حسب مواعيد الربط وأسعار الوقود."],
  quiz:[{q:"إذا ارتفعت تكلفة الساعة مقارنة بالوقود، فالسرعة الاقتصادية:",o:["تزداد","تقل","لا تتغير"],a:0,why:"الوقت أغلى فيستحق توفيره."},
        {q:"ما الذي يمنع الطيران بأقصى ماخ دائماً؟",o:["ارتفاع استهلاك الوقود لكل ميل","نقص الوقود في الجو","الغيوم"],a:0,why:"السحب يزداد بشدة عند اقتراب انضغاطية الهواء."}],
  ref:"الموضوع: مؤشر التكلفة وتحسين السرعة (Cost Index)."
});
/* ---- 6 ---- */
LK("prf",{
  ar:"الارتفاع الأمثل ومراحل الصعود المتدرج", en:"Optimum cruise altitude and step climbs",
  alt:"منحنى نسبة الرفع إلى السحب مع ارتفاع الطيران مع تعليم الارتفاع الأمثل والمحدد الحالي",
  intro:["في الطيران المستوي الرفع يساوي الوزن: W = ½ρV²S·C_L. عند ماخ ثابت يتناسب الضغط الديناميكي مع الضغط الجوي، فيحدد الارتفاع قيمة C_L اللازمة: C_L = W / (0.7 p M² S). يقل السحب على الطائرة كثيراً عندما يقترب C_L من قيمة أفضل نسبة رفع إلى سحب.",
         "كلما احترقت الوقود قل الوزن، فيلزم C_L أقل عند الارتفاع نفسه، فيقل L/D عن الأفضل، ولذلك ترتفع الطائرة تدريجياً (صعود متدرج) إلى ارتفاع أمثل جديد. يمنع الاهتزاز عند اقتراب C_L من حد الانهيار الارتفاعات الأعلى."],
  ctl:[{k:"wf",ar:"الوزن كنسبة من MTOW",min:0.5,max:1,step:0.01,v:0.85,f:v=>nf(v,2)},{k:"M",ar:"رقم ماخ",min:0.72,max:0.85,step:0.005,v:0.78,f:v=>nf(v,3)},{k:"CD0",ar:"سحب الصفر",min:0.016,max:0.03,step:0.001,v:0.022,f:v=>nf(v,3)},{k:"fl",ar:"ارتفاع الطيران",min:250,max:430,step:10,v:350,f:v=>"FL"+nf(v,0)}],
  pre:[{ar:"بعد الإقلاع",set:{wf:0.98}},{ar:"قبيل الهبوط",set:{wf:0.66}}],
  calc(st){ const a=lac(), AR=a.b*a.b/a.S, k=1/(Math.PI*AR*a.e); st.k=k; st.W=st.wf*a.mtow*G0; st.CL=h=>st.W/(0.7*isa(h*0.3048*100).p*st.M*st.M*a.S); st.LD=h=>{ const c=st.CL(h); return c/(st.CD0+k*c*c); }; st.CLo=Math.sqrt(st.CD0/k); st.LDm=st.CLo/(2*st.CD0); st.cl=st.CL(st.fl); st.ld=st.LD(st.fl); st.dr=st.LDm/st.ld; let lo=100,hi=550; for(let i=0;i<40;i++){ const m=(lo+hi)/2; if(st.CL(m)>st.CLo) hi=m; else lo=m; } st.fo=(lo+hi)/2; st.cb=0.68; st.mgb=(st.cb-st.cl)/st.cb; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.12, x1=r.x+r.w*0.88, Y=f=>r.y+r.h*0.82-(f-250)/200*r.h*0.68; g.fillStyle=mixC(C.panel,C.hyd,0.07); g.fillRect(x0,r.y+r.h*0.14,x1-x0,r.h*0.68); [250,300,350,400].forEach(f=>{ lline(g,[[x0,Y(f)],[x1,Y(f)]],C.line,0.8,[2,4]); ltx(g,"FL"+f,x0-6,Y(f),{s:10,m:true,a:"right",c:C.muted}); });
    lline(g,[[x0,Y(st.fo)],[x1,Y(st.fo)]],C.hyd,1.8,[6,3]); ltx(g,"الأمثل FL"+nf(st.fo,0),x1,Y(st.fo)-9,{s:11,m:true,a:"right",c:C.hyd}); const px=x0+(x1-x0)*((st.t*0.08)%1); lplane(g,px,Y(st.fl),0.12*(x1-x0)/0.9,0,C); ltx(g,"FL"+nf(st.fl,0)+"  ·  L/D "+nf(st.ld,1),(x0+x1)/2,r.y+r.h*0.08,{s:13,w:600,m:true}); ltx(g,st.mgb<0.1?"قريب من حد الاهتزاز":"هامش الاهتزاز "+nf(st.mgb*100,0)+" %",(x0+x1)/2,r.y+r.h*0.92,{s:12,rtl:true,c:st.mgb<0.1?C.power:C.muted}); },
  plot(st){ const pts=[]; for(let f=250;f<=430;f+=5) pts.push([f,st.LD(f)]); return {x:[250,430],y:[8,Math.max(20,st.LDm*1.1)],xl:"مستوى الطيران FL",yl:"L/D",lines:[{pts,c:"hyd",w:2.4}],vl:[{x:st.fo,c:"muted",t:"الأمثل"}],dots:[{x:st.fl,y:st.ld,c:"power"}]}; },
  ro(st){ return [["C_L الحالي",nf(st.cl,3)],["L/D الحالي",nf(st.ld,1)],["أفضل L/D",nf(st.LDm,1)],["الارتفاع الأمثل",st.fo>100?"FL"+nf(st.fo,0):"—"],["زيادة السحب عن الأفضل",nf((st.dr-1)*100,1)+" %"]]; },
  eq:["C_L = W / (0.7 p M² S)","L/D = C_L / (C_D0 + k C_L²)","C_L,opt = √(C_D0 / k)"],
  note:["الدرس يستخدم طائرة المعاينة الحالية لقيم S والباع وe. القيم تقريبية وتغفل زيادة السحب الانضغاطي عند ماخ أعلى.","الهامش من الاهتزاز يُحسب مقابل C_L = 0.68 مثالياً؛ يحدده المصنّع لكل ماخ."],
  quiz:[{q:"مع نقص الوزن بالاحتراق يصبح الارتفاع الأمثل:",o:["أعلى","أدنى","ثابتاً"],a:0,why:"C_L الأمثل يتحقق عند ضغط أقل."},
        {q:"ماذا يحدث لـL/D إذا طارت الطائرة أعلى بكثير من الأمثل؟",o:["ينخفض لأن C_L يرتفع جداً","يرتفع","لا يتغير"],a:0,why:"السحب المستحث يزداد."}],
  show:{ar:"اعرض الجناح",fn:()=>lrnSel("wingbox")},
  ref:"الموضوع: أداء الطيران المستوي والارتفاع الأمثل (Cruise Performance)."
});
/* ---- 7 ---- */
LK("prf",{
  ar:"حدود وزن الإقلاع: الحرارة والارتفاع والمدرج", en:"Takeoff weight limit: hot, high and runway length",
  alt:"طائرة على مدرج مع مؤشر طول المدرج المتاح ومسافة الإقلاع المطلوبة، ومنحنى مسافة الإقلاع مع الوزن",
  intro:["مسافة الجري على المدرج تعتمد على سرعة الإقلاع وتسارع الطائرة. السرعة V_LOF تتناسب مع √(W / ρ S C_Lmax)، فتزداد عندما يقل ρ (حرارة وارتفاع). والتسارع يقل لأن قوة الدفع تتناقص مع كثافة الهواء، وتتناسب تقريباً مع ρ^0.8.",
         "لذلك يعطي مدرج واحد وزناً أقصى مختلفاً في الشتاء والصيف. تحسب شركات الطيران أقصى وزن إقلاع (TOW) حسب المدرج والارتفاع والحرارة والرياح والميل، وتُنقص الحمولة إن تجاوزنا الحد."],
  ctl:[{k:"wf",ar:"وزن الإقلاع (من MTOW)",min:0.6,max:1,step:0.01,v:0.9,f:v=>nf(v,2)},{k:"el",ar:"ارتفاع المطار",min:0,max:3000,step:50,v:0,f:v=>nf(v,0)+" m"},{k:"dI",ar:"الحرارة فوق المعيارية",min:-20,max:40,step:1,v:15,f:v=>nf(v,0)+" °C"},{k:"hw",ar:"ريح أمامية",min:-10,max:25,step:1,v:0,f:v=>nf(v,0)+" kt"},{k:"sl",ar:"ميل المدرج",min:-2,max:2,step:0.1,v:0,f:v=>nf(v,1)+" %"},{k:"rw",ar:"طول المدرج المتاح",min:1500,max:4500,step:50,v:3300,f:v=>nf(v,0)+" m"}],
  pre:[{ar:"بارد على مستوى البحر",set:{el:0,dI:-10}},{ar:"حار وعالٍ",set:{el:1500,dI:25}}],
  calc(st){ const a=lac(), I=isa(st.el), T=I.T+st.dI, rho=I.p/(287.05*T); st.rho=rho; const k=1/(Math.PI*(a.b*a.b/a.S)*a.e); st.sto=wf=>{ const W=wf*a.mtow*G0, Vs=Math.sqrt(2*W/(rho*a.S*2.2)), Vl=1.2*Vs, Vg=Math.max(10,Vl-st.hw/KT), Vm=0.7*Vl, q=0.5*rho*Vm*Vm, Th=a.T0*Math.pow(rho/1.225,0.8)*0.9, Dg=q*a.S*(0.03+0.07+k*0.8*0.8), L=q*a.S*0.8, ac=(Th-Dg-0.02*(W-L)-W*st.sl/100)/(W/G0); if(ac<=0.05) return 1e5; return (Vg*Vg/(2*ac)+Vl*4)*1.15; }; st.S=st.sto(st.wf); st.ok=st.S<=st.rw; let lo=0.4,hi=1.2; for(let i=0;i<40;i++){ const m=(lo+hi)/2; if(st.sto(m)<=st.rw) lo=m; else hi=m; } st.wm=lo; st.Wt=st.wf*a.mtow; st.Wmx=st.wm*a.mtow; st.Vs=Math.sqrt(2*st.Wt*G0/(rho*a.S*2.2))*KT; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.06, x1=r.x+r.w*0.94, y=r.y+r.h*0.55, w=x1-x0, pos=(st.t*0.2)%1, so=st.S/Math.max(st.rw,st.S)*w; g.fillStyle=mixC(C.panel,C.struct,0.35); g.fillRect(x0,y,w,r.h*0.06); const lim=st.rw/Math.max(st.rw,st.S)*w; lline(g,[[x0+lim,y-12],[x0+lim,y+r.h*0.06+12]],C.hyd,3); ltx(g,"نهاية المدرج "+nf(st.rw,0)+" m",x0+lim,y-24,{s:11,rtl:true,a:lim>w*0.7?"right":"center",c:C.hyd});
    const lx=x0+Math.min(so,w)*pos; lplane(g,lx,y-r.h*0.05,0.08*w/0.9,pos>0.7?6:0,C); lline(g,[[x0,y+r.h*0.1],[x0+Math.min(so,w),y+r.h*0.1]],st.ok?C.ink:C.power,3); ltx(g,"المسافة المطلوبة "+nf(st.S,0)+" m",x0+Math.min(so,w)/2,y+r.h*0.17,{s:12,w:600,rtl:true,c:st.ok?C.ink:C.power});
    ltx(g,"كثافة الهواء "+nf(st.rho,3)+" kg/m³",r.x+r.w*0.5,r.y+r.h*0.1,{s:12,rtl:true}); ltx(g,st.ok?"الإقلاع ممكن":"يجب تخفيف الوزن",r.x+r.w*0.5,r.y+r.h*0.9,{s:13,w:700,rtl:true,c:st.ok?C.hyd:C.power}); },
  plot(st){ const pts=[]; for(let w=0.6;w<=1.0001;w+=0.01){ const s=st.sto(w); pts.push([w,Math.min(s,9000)]); } return {x:[0.6,1],y:[500,Math.max(st.rw*1.4,Math.min(9000,st.S*1.1))],xl:"الوزن كنسبة من MTOW",yl:"مسافة الإقلاع m",lines:[{pts,c:"hyd",w:2.4}],hl:[{y:st.rw,c:"power",t:"المدرج"}],dots:[{x:st.wf,y:Math.min(st.S,9000),c:st.ok?"hyd":"power"}]}; },
  ro(st){ return [["مسافة الإقلاع التقديرية",nf(st.S,0)+" m"],["أقصى وزن لهذا المدرج",nf(st.Wmx/1000,1)+" t"],["وزن الإقلاع",nf(st.Wt/1000,1)+" t"],["سرعة الانهيار التقريبية",nf(st.Vs,0)+" kt"],["الحالة",st.ok?"ضمن المدرج":"أطول من المدرج"]]; },
  eq:["V_s = √(2 W / (ρ S C_Lmax)) ،  V_LOF = 1.2 V_s","T ≈ T₀ (ρ/ρ₀)^0.8","S ≈ (V_LOF − V_ريح)² / (2 a) + 4 V_LOF"],
  note:["الأرقام تقدير مبسط: يهمل أثر الانطلاق، وتغير الدفع مع السرعة، ويستخدم معامل 1.15 كهامش. الأداء المعتمد يُحسب من كتيب الطائرة.","تشمل الحدود الحقيقية أيضاً الصعود بعد إقلاع بمحرك معطّل وحدود الفرامل وحدود العوائق."],
  quiz:[{q:"ما أثر ارتفاع الحرارة على مسافة الإقلاع؟",o:["تزداد","تقل","لا أثر"],a:0,why:"الكثافة تقل فتزداد السرعة المطلوبة ويقل الدفع."},
        {q:"ريح أمامية تجعل مسافة الجري:",o:["أقصر","أطول","كما هي"],a:0,why:"السرعة الأرضية المطلوبة أقل."}],
  show:{ar:"اعرض المحرك",fn:()=>lrnSel("engine")},
  ref:"الموضوع: أداء الإقلاع (Takeoff Performance)."
});
/* ---- 8 ---- */
LK("prf",{
  ar:"مسافة الهبوط وعوامل الأمان", en:"Landing distance and safety factors",
  alt:"طائرة تقترب وتلمس المدرج ثم تتوقف، مع عمود لمسافة الهبوط الفعلية والمطلوبة بعامل أمان ومنحنى المسافة مع معامل الاحتكاك",
  intro:["بعد عبور عتبة المدرج على ارتفاع 50 قدماً تقطع الطائرة مسافة هوائية حتى اللمس، ثم مسافة فرملة. الفرملة تعتمد على الاحتكاك μ بين الإطار والمدرج: التباطؤ a ≈ μ·g (مع بعض الدعم من القواطع ومعكوس الدفع). المدرج المبلل أو الجليدي يخفض μ كثيراً.",
         "اللوائح تفرض أن يزيد المدرج المتاح على المسافة الفعلية الجافة بعامل 1/0.6 = 1.67، ثم يضاف ما لا يقل عن 15% للمدرج المبلل. وزيادة سرعة الاقتراب فوق V_ref بمقدار قليل تزيد المسافة بنسبة تقارب مربع السرعة."],
  ctl:[{k:"wf",ar:"الوزن كنسبة من MLW",min:0.6,max:1,step:0.01,v:0.9,f:v=>nf(v,2)},{k:"dv",ar:"زيادة سرعة الاقتراب",min:0,max:30,step:1,v:5,f:v=>nf(v,0)+" kt"},{k:"mu",ar:"معامل احتكاك الفرملة",min:0.05,max:0.5,step:0.01,v:0.4,f:v=>nf(v,2)},{k:"tw",ar:"ريح خلفية",min:0,max:20,step:1,v:0,f:v=>nf(v,0)+" kt"},{k:"lda",ar:"المدرج المتاح للهبوط",min:1200,max:4000,step:50,v:2200,f:v=>nf(v,0)+" m"}],
  pre:[{ar:"جاف",set:{mu:0.4}},{ar:"مبلل",set:{mu:0.22}},{ar:"جليد",set:{mu:0.08}}],
  calc(st){ const a=lac(), W=st.wf*a.mtow*0.85*G0; st.Vs=Math.sqrt(2*W/(1.225*a.S*2.6)); st.Vref=1.23*st.Vs; st.Va=st.Vref+st.dv/KT; const Vtd=st.Va*0.95+st.tw/KT; st.dist=mu=>{ const air=Vtd*7, ac=Math.max(0.3,(mu*0.95+0.03)*G0), br=Vtd*Vtd/(2*ac)+Vtd*2.5; return air+br; }; st.S=st.dist(st.mu); st.req=st.S*1.67; st.reqw=Math.max(st.S*1.67*1.15,st.dist(0.22)*1.67); st.ok=st.req<=st.lda; st.dryS=st.dist(0.4); st.mv=st.lda-st.req; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.06, x1=r.x+r.w*0.94, y=r.y+r.h*0.46, w=x1-x0, mx=Math.max(st.lda,st.req,st.S)*1.02, X=d=>x0+w*d/mx; g.fillStyle=mixC(C.panel,C.struct,0.35); g.fillRect(x0,y,X(st.lda)-x0,r.h*0.06); lline(g,[[X(st.lda),y-14],[X(st.lda),y+r.h*0.06+14]],C.hyd,3);
    const ph=(st.t*0.25)%1, tdp=0.18*st.S, pos=ph<0.25?ph/0.25*tdp:tdp+(ph-0.25)/0.75*(st.S-tdp); lplane(g,X(pos),y-r.h*0.045-(ph<0.25?(1-ph/0.25)*r.h*0.1:0),0.08*w/0.9,ph<0.25?4:0,C);
    [[st.S,"الفعلية","ink",r.h*0.64],[st.req,"المطلوبة ×1.67",st.ok?"hyd":"power",r.h*0.74]].forEach(([d,t,c,yy])=>{ lline(g,[[x0,r.y+yy],[X(d),r.y+yy]],KC(c,C),4); ltx(g,t+" "+nf(d,0)+" m",x0+4,r.y+yy-10,{s:11,a:"left",rtl:true,c:KC(c,C)}); });
    ltx(g,"Vref "+nf(st.Vref*KT,0)+" kt  ·  اقتراب "+nf(st.Va*KT,0)+" kt",r.x+r.w*0.5,r.y+r.h*0.1,{s:12,m:true}); ltx(g,st.ok?"المدرج كافٍ":"المدرج غير كافٍ",r.x+r.w*0.5,r.y+r.h*0.92,{s:13,w:700,rtl:true,c:st.ok?C.hyd:C.power}); },
  plot(st){ return {x:[0.05,0.5],y:[0,Math.max(st.lda*1.1,st.dist(0.05)*1.67*0.6)],xl:"معامل الاحتكاك μ",yl:"المسافة m",curves:[{f:m=>st.dist(m),c:"ink"},{f:m=>st.dist(m)*1.67,c:"power"}],leg:[{c:"ink",t:"فعلية"},{c:"power",t:"×1.67"}],hl:[{y:st.lda,c:"hyd",t:"المتاح"}],dots:[{x:st.mu,y:st.S,c:"ink"}]}; },
  ro(st){ return [["المسافة الفعلية",nf(st.S,0)+" m"],["المطلوبة بعامل 1.67",nf(st.req,0)+" m"],["المتاح",nf(st.lda,0)+" m"],["الهامش",nf(st.mv,0)+" m"],["الجاف للمقارنة",nf(st.dryS,0)+" m"]]; },
  eq:["a = (0.95 μ + 0.03) g","S = V_tp · 7 s + V_td² / (2a) + 2.5 s · V_td","المطلوبة = 1.67 × S_فعلية"],
  note:["العوامل 1.67 و1.15 هنا كما في إجراءات التشغيل الشائعة؛ تتفاوت بحسب سلطة الطيران ونوع العملية.","الحساب المبسط يتجاهل أثر الارتداد وقوة الدفع العكسي وحجم الفرامل. للأداء الفعلي استعمل كتيب الطائرة."],
  quiz:[{q:"زيادة سرعة الاقتراب بمقدار صغير تزيد مسافة التوقف تقريباً:",o:["بنسبة مربع السرعة","بنسبة خطية فقط","لا تزيد"],a:0,why:"طاقة الحركة ½mV²."},
        {q:"على مدرج مبلل نحتاج:",o:["مسافة مطلوبة أكبر","أقل","كما هي"],a:0,why:"μ أقل فالتباطؤ أقل."}],
  show:{ar:"اعرض وحدة الفرامل",fn:()=>lrnSel("wheel_brake")},
  ref:"الموضوع: أداء الهبوط (Landing Performance)."
});
/* ---- 9 ---- */
LK("prf",{
  ar:"الدوران القياسي: ميل الجناحين ومعدل الدوران", en:"Standard rate turn and bank angle",
  alt:"منظر علوي لطائرة تدور في دائرة مع معدل 3 درجات بالثانية، ومنحنى زاوية الميل اللازمة مع السرعة",
  intro:["معدل الدوران ω ≈ 1091·tan φ / V بالدرجة في الثانية حيث V بالعقدة. الدوران القياسي (rate-1) هو 3°/s، أي دورة كاملة في دقيقتين. زاوية الميل اللازمة تزداد مع السرعة: tan φ = ω V/1091، وللتقدير السريع: φ ≈ V/10 + 7 درجة.",
         "نصف قطر الدوران R = V² / (g tan φ). عند الجو الأعلى والسرعة الأكبر يزداد R، ولذلك يُراعى بُعد العوائق عند تصميم مسارات الاقتراب. وكلما زاد الميل ارتفع عامل الحمل 1/cos φ."],
  ctl:[{k:"V",ar:"السرعة الحقيقية",min:80,max:500,step:5,v:150,f:v=>nf(v,0)+" kt"},{k:"ph",ar:"زاوية الميل",min:5,max:45,step:0.5,v:22,f:v=>nf(v,1)+"°"}],
  pre:[{ar:"سرعة الاقتراب",set:{V:140,ph:21}},{ar:"سرعة الإبحار",set:{V:450,ph:25}}],
  calc(st){ const t=Math.tan(st.ph*D2R); st.om=1091*t/st.V; st.Rm=Math.pow(st.V/KT,2)/(G0*t); st.T360=360/st.om; st.n=1/Math.cos(st.ph*D2R); st.phs=V=>Math.atan(3*V/1091)/D2R; st.phh=V=>Math.atan(1.5*V/1091)/D2R; st.phr=Math.atan(3*st.V/1091)/D2R; st.rule=st.V/10+7; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.52, R=Math.min(r.w*0.32,r.h*0.34), a=-st.t*(st.om*D2R)*4+Math.PI; g.strokeStyle=C.line; g.lineWidth=1.2; g.setLineDash([4,4]); g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.stroke(); g.setLineDash([]);
    for(let i=0;i<12;i++){ const an=i*Math.PI/6; lline(g,[[cx+Math.cos(an)*R*0.97,cy+Math.sin(an)*R*0.97],[cx+Math.cos(an)*R*1.05,cy+Math.sin(an)*R*1.05]],C.muted,1.2); }
    const px=cx+Math.cos(a)*R, py=cy+Math.sin(a)*R; g.save(); g.translate(px,py); g.rotate(a-Math.PI/2); g.fillStyle=mixC(C.panel,C.ink,0.7); g.beginPath(); g.moveTo(0,-14); g.lineTo(5,8); g.lineTo(0,5); g.lineTo(-5,8); g.closePath(); g.fill(); lline(g,[[-14,0],[14,0]],C.ink,3); g.restore();
    ltx(g,nf(st.om,2)+" °/s",cx,cy-6,{s:16,w:700,m:true,c:Math.abs(st.om-3)<0.2?C.hyd:C.ink}); ltx(g,"دورة كاملة "+nf(st.T360/60,1)+" min",cx,cy+16,{s:12,rtl:true,c:C.muted}); ltx(g,"R = "+nf(st.Rm/1852,2)+" NM",cx,r.y+r.h*0.1,{s:12,w:600,m:true}); },
  plot(st){ return {x:[80,500],y:[0,45],xl:"السرعة kt",yl:"زاوية الميل °",curves:[{f:st.phs,c:"hyd"},{f:st.phh,c:"ctrl",dash:[5,3]},{f:V=>V/10+7,c:"muted",dash:[2,3]}],leg:[{c:"hyd",t:"3 °/s"},{c:"ctrl",t:"1.5 °/s",dash:[5,3]},{c:"muted",t:"القاعدة"}],dots:[{x:st.V,y:st.ph,c:"power"}]}; },
  ro(st){ return [["معدل الدوران",nf(st.om,2)+" °/s"],["نصف القطر",nf(st.Rm,0)+" m"],["نصف القطر",nf(st.Rm/1852,2)+" NM"],["ميل الدوران القياسي",nf(st.phr,1)+"°"],["القاعدة V/10 + 7",nf(st.rule,1)+"°"],["عامل الحمل",nf(st.n,2)+" g"]]; },
  eq:["ω = 1091 tan φ / V   (°/s ، V بالعقدة)","R = V² / (g tan φ)","n = 1 / cos φ"],
  note:["المعادلة تفترض دوراناً منسقاً بلا انزلاق جانبي وبارتفاع ثابت.","في الطائرات الكبيرة تحدد أنظمة الطيار الآلي زاوية ميل أقصاها 25° عادة لراحة الركاب."],
  quiz:[{q:"للحفاظ على معدل 3 °/s عند سرعة أكبر نحتاج ميلاً:",o:["أكبر","أقل","نفسه"],a:0,why:"tan φ = ω V / 1091."},
        {q:"بزيادة الميل يزداد نصف قطر الدوران؟",o:["لا، يقل","نعم يزداد","لا يتغير"],a:0,why:"R = V²/(g tan φ)."}],
  ref:"الموضوع: الدوران المنسق ومعدل الدوران (Coordinated Turn)."
});
