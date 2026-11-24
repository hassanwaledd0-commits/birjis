/* ---------- Book 14: Maintenance Engineering and Reliability (1/3): fasteners, joints, corrosion, fatigue, inspection ---------- */
/* gamma function (Lanczos), used by the Weibull lessons */
function mnGam(z){ if(z<0.5) return Math.PI/(Math.sin(Math.PI*z)*mnGam(1-z)); z-=1; const g=7, c=[0.99999999999980993,676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7]; let x=c[0]; for(let i=1;i<g+2;i++) x+=c[i]/(z+i); const t=z+g+0.5; return Math.sqrt(2*Math.PI)*Math.pow(t,z+0.5)*Math.exp(-t)*x; }
/* ---- 1 ---- */
LK("mnt",{
  ar:"مفتاح العزم مع وصلة التمديد", en:"Torque wrench with an extension",
  alt:"مفتاح عزم بوصلة تمديد ومسمار، وأسهم القوة والذراع الفعلي، ومنحنى خطأ العزم مع طول الوصلة لزوايا مختلفة",
  intro:["مفتاح العزم يُعايَر على أساس ذراع محدد L: يقرأ العزم T = F · L حيث F القوة على المقبض. عند إضافة وصلة تمديد طولها E على استقامة المفتاح يصبح الذراع الفعلي L + E، فيكون العزم المطبّق على المسمار أكبر من القراءة: T_فعلي = T_قراءة (L + E)/L.",
         "لتحقيق العزم المطلوب نضبط المفتاح على T_ضبط = T_هدف · L / (L + E cos θ) حيث θ زاوية الوصلة مع محور المفتاح (cos θ تأخذ الاتجاه في الحسبان). إهمال هذا التصحيح قد يؤدي إلى شد زائد وتلف المسمار أو الصامولة؛ ولهذا تنص إجراءات الصيانة على استخدام معادلة التصحيح أو أدوات معايرة مناسبة."],
  ctl:[{k:"Tt",ar:"العزم المطلوب",min:5,max:500,step:5,v:60,f:v=>nf(v,0)+" N·m"},{k:"L",ar:"طول المفتاح",min:150,max:800,step:10,v:300,f:v=>nf(v,0)+" mm"},{k:"E",ar:"طول الوصلة",min:0,max:300,step:5,v:100,f:v=>nf(v,0)+" mm"},{k:"th",ar:"زاوية الوصلة",min:0,max:90,step:1,v:0,f:v=>nf(v,0)+"°"}],
  pre:[{ar:"وصلة على استقامة",set:{th:0,E:100}},{ar:"وصلة عمودية",set:{th:90,E:100}}],
  calc(st){ const c=Math.cos(st.th*D2R); st.Ts=st.Tt*st.L/(st.L+st.E*c); st.err=st.E*c/st.L*100; st.Ta=st.Tt*(st.L+st.E*c)/st.L; st.ef=(e,th)=>e*Math.cos(th*D2R)/st.L*100; },
  scene(g,r,st,C){ const y=r.y+r.h*0.46, x0=r.x+r.w*0.1, s=Math.min(r.w*0.7/(st.L+st.E+80),1.0), cx=x0+(st.L+st.E)*s+20; g.fillStyle=mixC(C.panel,C.struct,0.6); g.strokeStyle=C.ink; g.lineWidth=1.3; g.fillRect(x0,y-8,st.L*s,16); g.strokeRect(x0,y-8,st.L*s,16); g.fillStyle=mixC(C.panel,C.hyd,0.7); const ex=x0+st.L*s, a=-st.th*D2R; g.save(); g.translate(ex,y); g.rotate(a); g.fillRect(0,-6,st.E*s,12); g.strokeRect(0,-6,st.E*s,12); g.restore();
    const hx=ex+st.E*s*Math.cos(a), hy=y+st.E*s*Math.sin(a); g.fillStyle=mixC(C.panel,C.ink,0.55); g.beginPath(); for(let i=0;i<6;i++){ const an=i*Math.PI/3; g.lineTo(hx+Math.cos(an)*16,hy+Math.sin(an)*16); } g.closePath(); g.fill(); g.stroke(); larrow(g,x0+6,y-40,x0+6,y-10,C.power,2.6,9); ltx(g,"F",x0+16,y-34,{s:12,w:700,m:true,c:C.power}); lline(g,[[x0,y+26],[hx,y+26]],C.muted,1.2); ltx(g,"L + E cosθ = "+nf(st.L+st.E*Math.cos(st.th*D2R),0)+" mm",(x0+hx)/2,y+40,{s:11,m:true});
    ltx(g,"اضبط المفتاح على "+nf(st.Ts,1)+" N·m",r.x+r.w*0.5,r.y+r.h*0.1,{s:15,w:700,rtl:true,c:C.hyd}); ltx(g,"لو ضُبط على "+nf(st.Tt,0)+" لتجاوز العزم بنسبة "+nf(st.err,0)+" %  ("+nf(st.Ta,0)+" N·m)",r.x+r.w*0.5,r.y+r.h*0.86,{s:12,rtl:true,c:st.err>10?C.power:C.muted}); },
  plot(st){ return {x:[0,300],y:[0,Math.max(10,st.ef(300,0))*1.05],xl:"طول الوصلة mm",yl:"زيادة العزم %",curves:[{f:e=>st.ef(e,0),c:"power"},{f:e=>st.ef(e,45),c:"ctrl"},{f:e=>st.ef(e,90),c:"hyd"}],leg:[{c:"power",t:"0°"},{c:"ctrl",t:"45°"},{c:"hyd",t:"90°"}],dots:[{x:st.E,y:st.err,c:"power"}]}; },
  ro(st){ return [["العزم المطلوب",nf(st.Tt,1)+" N·m"],["الضبط الصحيح",nf(st.Ts,1)+" N·m"],["الذراع الفعلي",nf(st.L+st.E*Math.cos(st.th*D2R),0)+" mm"],["الزيادة لو لم نصحح",nf(st.err,1)+" %"]]; },
  eq:["T_فعلي = F (L + E cos θ)","T_ضبط = T_هدف · L / (L + E cos θ)","الخطأ = E cos θ / L"],
  note:["الأمثلة بوحدات SI. بعض المفاتيح تُعاير بوصلات خاصة تُدرج تعليمات المصنّع في بطاقة المعايرة.","وصلة عمودية (90°) لا تغيّر العزم لأن cos 90° = 0، لكن الوضع العملي قد يتطلب الحرص."],
  quiz:[{q:"وصلة تمديد على استقامة المفتاح بدون تصحيح تجعل العزم الفعلي:",o:["أكبر من القراءة","أقل","نفسه"],a:0,why:"الذراع أطول."},
        {q:"وصلة بزاوية 90° على المفتاح:",o:["لا تغيّر العزم","تضاعفه","تنصّفه"],a:0,why:"cos 90° = 0."}],
  ref:"الموضوع: أدوات ربط البراغي والعزم (Torque Tools)."
});
/* ---- 2 ---- */
LK("mnt",{
  ar:"المسمار تحت القص: الأضرار بالقص والضغط", en:"Bolt shear versus bearing failure",
  alt:"صفيحتان بمسمار يحمل حملاً مع رسم لمستويات القص وسطح التحميل، ومنحنى سعة القص والضغط مع قطر المسمار",
  intro:["وصلة المسمار تفشل بإحدى طرق: قص المسمار نفسه، أو سحق جدار الثقب (ضغط الحمل bearing)، أو قص الحافة، أو شد المسمار. سعة القص P_s = n · τ · (π d²/4) حيث n عدد مستويات القص (1 للقص المفرد و2 للمزدوج). وسعة الضغط P_b = σ_b · d · t حيث t أقل سماكة للصفيحة.",
         "السعة الفعلية هي الأقل بينهما. زيادة القطر ترفع القص بمربعه والضغط خطياً، فعند قطر كبير يصبح الضغط هو الحاكم. والقص المزدوج يضاعف سعة القص دون تغيير الضغط، لذلك يفيد حين يكون المسمار نفسه هو الحلقة الأضعف."],
  ctl:[{k:"d",ar:"قطر المسمار",min:4,max:20,step:0.5,v:8,f:v=>nf(v,1)+" mm"},{k:"tk",ar:"سماكة الصفيحة",min:1,max:10,step:0.25,v:3,f:v=>nf(v,2)+" mm"},{k:"tau",ar:"مقاومة القص المسموحة",min:150,max:500,step:10,v:300,f:v=>nf(v,0)+" MPa"},{k:"sb",ar:"مقاومة الضغط المسموحة",min:300,max:900,step:10,v:600,f:v=>nf(v,0)+" MPa"},{k:"n",ar:"عدد مستويات القص",min:1,max:2,step:1,v:1,f:v=>nf(v,0)},{k:"P",ar:"الحمل",min:0,max:80,step:1,v:10,f:v=>nf(v,0)+" kN"}],
  pre:[{ar:"قص مفرد",set:{n:1}},{ar:"قص مزدوج",set:{n:2}},{ar:"صفيحة سميكة",set:{tk:8}}],
  calc(st){ st.cs=d=>st.n*st.tau*Math.PI*d*d/4/1000; st.cb=d=>st.sb*d*st.tk/1000; st.Ps=st.cs(st.d); st.Pb=st.cb(st.d); st.Pm=Math.min(st.Ps,st.Pb); st.mode=st.Ps<st.Pb?"قص المسمار":"سحق الثقب"; st.mg=st.Pm-st.P; st.ok=st.mg>=0; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, y=r.y+r.h*0.46, w=r.w*0.5, th=Math.max(8,st.tk*5), d=Math.max(10,st.d*2.4); g.fillStyle=mixC(C.panel,C.struct,0.55); g.strokeStyle=C.ink; g.lineWidth=1.3; g.fillRect(cx-w/2,y-th-2,w*0.72,th); g.strokeRect(cx-w/2,y-th-2,w*0.72,th); g.fillRect(cx-w*0.22,y+2,w*0.72,th); g.strokeRect(cx-w*0.22,y+2,w*0.72,th);
    if(st.n===2){ g.fillRect(cx-w/2,y+th+4,w*0.72,th); g.strokeRect(cx-w/2,y+th+4,w*0.72,th); } g.fillStyle=mixC(C.panel,C.hyd,0.7); g.fillRect(cx-d/2+w*0.04,y-th-8,d,2*th+16+(st.n===2?th+4:0)); g.strokeRect(cx-d/2+w*0.04,y-th-8,d,2*th+16+(st.n===2?th+4:0));
    larrow(g,cx-w/2-30,y-th/2,cx-w/2,y-th/2,C.power,2.8,10); larrow(g,cx+w*0.5+30,y+th/2+2,cx+w*0.5,y+th/2+2,C.power,2.8,10); ltx(g,nf(st.P,0)+" kN",cx-w/2-30,y-th/2-14,{s:11,m:true,c:C.power}); ltx(g,"سعة القص "+nf(st.Ps,1)+" kN  ·  سعة الضغط "+nf(st.Pb,1)+" kN",r.x+r.w*0.5,r.y+r.h*0.1,{s:13,w:600,rtl:true});
    ltx(g,"الأضعف: "+st.mode+"  ·  "+(st.ok?"هامش "+nf(st.mg,1)+" kN":"نقص "+nf(-st.mg,1)+" kN"),r.x+r.w*0.5,r.y+r.h*0.9,{s:14,w:700,rtl:true,c:st.ok?C.hyd:C.power}); },
  plot(st){ return {x:[4,20],y:[0,Math.max(st.cs(20),st.cb(20))*1.05],xl:"قطر المسمار mm",yl:"السعة kN",curves:[{f:st.cs,c:"power"},{f:st.cb,c:"hyd"}],leg:[{c:"power",t:"قص"},{c:"hyd",t:"ضغط"}],hl:[{y:st.P,c:"muted",t:"الحمل"}],dots:[{x:st.d,y:st.Pm,c:st.ok?"hyd":"power"}]}; },
  ro(st){ return [["سعة القص",nf(st.Ps,1)+" kN"],["سعة الضغط",nf(st.Pb,1)+" kN"],["الأضعف",st.mode],["الهامش",nf(st.mg,1)+" kN"]]; },
  eq:["P_قص = n τ π d² / 4","P_ضغط = σ_b d t","السعة = min(P_قص ، P_ضغط)"],
  note:["القيم أمثلة بلا معاملات أمان؛ التصميم الحقيقي يضيف عوامل ويراعي الشد والعزم الانحنائي ووجود الفلزات المختلفة.","اختيار المسمار يتم من كتيب الهياكل (SRM) وليس من هذه الحسبة."],
  quiz:[{q:"زيادة قطر المسمار مع ثبات السماكة ترفع:",o:["القص بسرعة أكبر من الضغط","الضغط فقط","لا شيء"],a:0,why:"القص ∝ d² والضغط ∝ d."},
        {q:"تحويل القص المفرد إلى مزدوج:",o:["يضاعف سعة القص فقط","يضاعف الضغط","يضاعف الاثنين"],a:0,why:"n تدخل في القص فقط."}],
  ref:"الموضوع: وصلات المسامير (Bolted Joint Analysis)."
});
/* ---- 3 ---- */
LK("mnt",{
  ar:"مسافة الحافة: لماذا قاعدة 2 أضعاف القطر؟", en:"Edge distance and tear-out",
  alt:"ثقب بقرب حافة صفيحة مع خطي القص عند الحافة وسهم الحمل، ومنحنى سعة القص والضغط مع نسبة المسافة إلى القطر",
  intro:["عندما يكون الثقب قريباً من الحافة قد تنخلع قطعة الصفيحة بين الثقب والحافة بقصها على مستويين متوازيين: P_قص-حافة = 2 (e − D/2) t τ_u. وسعة الضغط على جدار الثقب P_ضغط = σ_br D t. ما دام الأول أكبر يحكم الضغط، وإلا ينخلع الحافة قبل أن يصل الضغط حده.",
         "مسافة الحافة e تُعبّر عنها النسبة e/D. عند نسبة صغيرة تنخفض السعة بسرعة. تتبنى قواعد التصميم نسبة دنيا نحو 2 (ثقوب المسامير في الألمنيوم)، لتكون السعة محكومة بالضغط فيتحمل الجدار بدل انخلاع الحافة. ولهذا لا يُسمح بتقريب الثقوب من الحواف في الإصلاحات."],
  ctl:[{k:"D",ar:"قطر الثقب",min:3,max:12,step:0.5,v:6,f:v=>nf(v,1)+" mm"},{k:"tk",ar:"سماكة الصفيحة",min:1,max:5,step:0.25,v:2,f:v=>nf(v,2)+" mm"},{k:"e",ar:"مسافة الحافة",min:4,max:40,step:0.5,v:12,f:v=>nf(v,1)+" mm"},{k:"tu",ar:"مقاومة القص",min:200,max:400,step:10,v:300,f:v=>nf(v,0)+" MPa"},{k:"sb",ar:"مقاومة الضغط",min:500,max:800,step:10,v:650,f:v=>nf(v,0)+" MPa"}],
  pre:[{ar:"حافة قريبة",set:{e:7}},{ar:"e/D = 2",set:{e:12}},{ar:"حافة بعيدة",set:{e:24}}],
  calc(st){ st.Pb=st.sb*st.D*st.tk/1000; st.Pse=ee=>2*Math.max(0,ee-st.D/2)*st.tk*st.tu/1000; st.Ps=st.Pse(st.e); st.ra=st.e/st.D; st.Pm=Math.min(st.Pb,st.Ps); st.mode=st.Ps<st.Pb?"انخلاع الحافة":"سحق الثقب"; st.rmin=0.5+st.sb/(2*st.tu); },
  scene(g,r,st,C){ const x0=r.x+r.w*0.1, y0=r.y+r.h*0.3, w=r.w*0.7, h=r.h*0.34, sc=Math.min(w*0.8/Math.max(st.e*2.2,10),8), ex=x0+Math.min(st.e*sc,w*0.9), hy=y0+h/2, R=st.D*sc/2; g.fillStyle=mixC(C.panel,C.struct,0.5); g.strokeStyle=C.ink; g.lineWidth=1.4; g.fillRect(x0,y0,w,h); g.strokeRect(x0,y0,w,h);
    g.fillStyle=C.panel; g.beginPath(); g.arc(x0+Math.min(st.e*sc,w*0.9)+0*0,hy,R,0,Math.PI*2); g.fill(); g.stroke(); const hx=x0+Math.min(st.e*sc,w*0.9); lline(g,[[x0,y0+h*0.12],[hx,y0+h*0.12]],C.muted,1.2); ltx(g,"e = "+nf(st.e,1),(x0+hx)/2,y0+h*0.12-10,{s:11,m:true});
    lline(g,[[x0,hy-R],[hx-R*0.2,hy-R]],st.Ps<st.Pb?C.power:C.muted,2.4,[4,3]); lline(g,[[x0,hy+R],[hx-R*0.2,hy+R]],st.Ps<st.Pb?C.power:C.muted,2.4,[4,3]); larrow(g,hx+R+36,hy,hx+R,hy,C.power,2.8,10);
    ltx(g,"e/D = "+nf(st.ra,2)+"  (الحد الأدنى للضغط الحاكم "+nf(st.rmin,2)+")",r.x+r.w*0.5,r.y+r.h*0.1,{s:13,w:600,rtl:true}); ltx(g,"الأضعف: "+st.mode+" بسعة "+nf(st.Pm,1)+" kN",r.x+r.w*0.5,r.y+r.h*0.86,{s:14,w:700,rtl:true,c:st.Ps<st.Pb?C.power:C.hyd}); },
  plot(st){ return {x:[1,4],y:[0,Math.max(st.Pb,st.Pse(4*st.D))*1.1],xl:"e / D",yl:"السعة kN",curves:[{f:x=>st.Pse(x*st.D),c:"power"},{f:()=>st.Pb,c:"hyd"}],leg:[{c:"power",t:"انخلاع الحافة"},{c:"hyd",t:"ضغط"}],vl:[{x:2,c:"muted",t:"القاعدة 2D"}],dots:[{x:st.ra,y:st.Pm,c:"ink"}]}; },
  ro(st){ return [["e / D",nf(st.ra,2)],["سعة الانخلاع",nf(st.Ps,1)+" kN"],["سعة الضغط",nf(st.Pb,1)+" kN"],["الأضعف",st.mode],["e/D الأدنى لحكم الضغط",nf(st.rmin,2)]]; },
  eq:["P_حافة = 2 (e − D/2) t τ_u","P_ضغط = σ_br D t","(e/D)_حرج = 0.5 + σ_br / (2 τ_u)"],
  note:["القاعدة الشائعة 2D مقبولة لأن النسبة الحرجة قريبة منها لمعظم السبائك، ولتعوّض عيوب الثقوب.","التعديلات على الإصلاح تتبع حدود دليل الإصلاح الهيكلي بشأن المسافات الدنيا."],
  quiz:[{q:"لماذا لا نقرّب الثقب كثيراً من الحافة؟",o:["لأن الحافة تنخلع قبل أن يتحمل الجدار","لأن المسمار يتلف","لأن الصفيحة تنثني"],a:0,why:"سعة الانخلاع تنخفض بسرعة."},
        {q:"ماذا يحدث للسعة عند e/D كبيرة جداً؟",o:["تحكمها سعة الضغط وتثبت","تزداد دون حد","تنعدم"],a:0,why:"P_ضغط لا يتأثر بـ e."}],
  ref:"الموضوع: تصميم وصلات الألواح (Joint Edge Distance)."
});
/* ---- 4 ---- */
const mnMat=[["مغنيسيوم",-1.60],["ألمنيوم 7075",-0.75],["ألمنيوم 2024",-0.69],["كادميوم",-0.70],["فولاذ كربوني",-0.65],["نحاس أصفر",-0.30],["تيتانيوم",-0.15],["ألياف كربون",0.20]];
LK("mnt",{
  ar:"التآكل الجلفاني: معدنان وماء مالح", en:"Galvanic corrosion",
  alt:"معدنان متلامسان في محلول مالح، الأقل نبلاً يذوب، مع سهم تيار، ومنحنى معدل التآكل النسبي مع نسبة مساحة المهبط إلى المصعد",
  intro:["عندما يتلامس معدنان مختلفان بوجود إلكتروليت (رطوبة أو ماء مالح) يتكون عنصر كهروكيميائي: المعدن ذو الجهد الأكثر سلبية (الأقل نبلاً) يكون المصعد ويذوب، والأنبل مهبط. ويزداد معدل التآكل مع فرق الجهد ΔE وكلما كبرت مساحة المهبط نسبة إلى المصعد.",
         "لهذا يُتجنب مسمار ألمنيوم صغير على صفيحة كربون كبيرة، ويُستخدم مسمار نبيل صغير على سطح مصعدي كبير (التيار موزع)، وتُعزل المعادن بمانع تسرب أو طلاء أو أغطية بلاستيكية. الألياف الكربونية نبيلة جداً، لذا تحتاج الفلزات المتصلة بها حماية خاصة."],
  ctl:[{k:"ia",ar:"المادة الأولى",min:0,max:7,step:1,v:2,f:v=>mnMat[Math.round(v)][0]},{k:"ib",ar:"المادة الثانية",min:0,max:7,step:1,v:7,f:v=>mnMat[Math.round(v)][0]},{k:"ae",ar:"لوغاريتم نسبة المساحة (مهبط/مصعد)",min:-1,max:2,step:0.1,v:1,f:v=>nf(Math.pow(10,v),1)+" : 1"},{k:"ec",ar:"توصيلية الإلكتروليت",min:0.2,max:5,step:0.1,v:2,f:v=>nf(v,1)+" ×"}],
  pre:[{ar:"ألمنيوم مع كربون",set:{ia:2,ib:7,ae:1}},{ar:"ألمنيوم مع تيتانيوم",set:{ia:2,ib:6,ae:0}},{ar:"ألمنيوم مع فولاذ",set:{ia:2,ib:4,ae:0}}],
  calc(st){ const a=mnMat[Math.round(st.ia)], b=mnMat[Math.round(st.ib)]; st.an=a[1]<=b[1]?a:b; st.ca=a[1]<=b[1]?b:a; st.dE=Math.abs(a[1]-b[1]); st.ar=Math.pow(10,st.ae); st.rr=ar=>st.dE/0.25*Math.pow(ar,0.7)*st.ec; st.rate=st.rr(st.ar); st.risk=st.dE<0.05?"لا خطر يذكر":st.dE<0.15?"منخفض":st.dE<0.3?"متوسط":"مرتفع"; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.12, w=r.w*0.76, y=r.y+r.h*0.42, h=r.h*0.2; g.fillStyle=mixC(C.panel,C.hyd,0.2); g.fillRect(x0,y+h*0.15,w,h*1.0); const wa=w*0.3, wb=w*0.4; const ax=x0+w*0.1, bx=x0+w*0.1+wa+10; g.fillStyle=mixC(C.panel,C.power,0.55); g.strokeStyle=C.ink; g.lineWidth=1.4; g.fillRect(ax,y-h*0.2,wa,h); g.strokeRect(ax,y-h*0.2,wa,h); g.fillStyle=mixC(C.panel,C.struct,0.7); g.fillRect(bx,y-h*0.2,Math.min(wb*Math.min(1,st.ar/5+0.3),w*0.6-wa),h); g.strokeRect(bx,y-h*0.2,Math.min(wb*Math.min(1,st.ar/5+0.3),w*0.6-wa),h);
    ltx(g,st.an[0]+" (مصعد)",ax+wa/2,y-h*0.2-10,{s:11,rtl:true,c:C.power,w:700}); ltx(g,st.ca[0]+" (مهبط)",bx+30,y-h*0.2-10,{s:11,rtl:true,c:C.ink,w:700,a:"left"}); for(let i=0;i<6;i++){ const f=(st.t*0.5+i/6)%1; ldot(g,ax+wa/2+(bx-ax)*f,y+h*0.3+Math.sin(f*6+i)*5,2.6,C.hyd,0.9); } larrow(g,bx+20,y+h*0.45,ax+wa*0.6,y+h*0.45,C.ctrl,1.6,6); ltx(g,"تيار",(ax+bx)/2+10,y+h*0.6,{s:10,rtl:true,c:C.ctrl});
    const pits=clamp(st.rate,0,10); for(let i=0;i<pits*3;i++) ldot(g,ax+3+((i*53)%Math.round(wa-6)),y-h*0.2+3,1.6+(i%3),C.ink,0.5);
    ltx(g,"ΔE = "+nf(st.dE,2)+" V  ·  المعدل النسبي "+nf(st.rate,1),r.x+r.w*0.5,r.y+r.h*0.1,{s:14,w:700,rtl:true,c:st.dE>0.3?C.power:C.ink}); ltx(g,"الخطر: "+st.risk,r.x+r.w*0.5,r.y+r.h*0.9,{s:13,w:600,rtl:true}); },
  plot(st){ return {x:[0.1,100],y:[0,Math.max(3,st.rr(100))*1.0],xl:"نسبة المساحة مهبط/مصعد",yl:"معدل نسبي",curves:[{f:st.rr,c:"power"}],dots:[{x:st.ar,y:st.rate,c:"ink"}]}; },
  ro(st){ return [["المصعد (يتآكل)",st.an[0]],["المهبط",st.ca[0]],["فرق الجهد",nf(st.dE,2)+" V"],["معدل التآكل النسبي",nf(st.rate,1)],["الخطر",st.risk]]; },
  eq:["ΔE = E_مهبط − E_مصعد","المعدل ∝ ΔE · (A_مهبط / A_مصعد)^0.7 · توصيلية الإلكتروليت"],
  note:["جهود المعادن تقريبية في ماء البحر نسبة لمرجع قياسي، وتتغير بالسبيكة والسطح؛ المعدل النسبي هنا مقياس مقارنة وليس سرعة تآكل فعلية.","الحماية: عزل كهربائي، مانع تسرب، طلاء، تراكب معدني بينهما مثل الأنودة، وتصميم الصرف بحيث لا يبقى الماء."],
  quiz:[{q:"أي المعدنين يتآكل عند تلامسهما؟",o:["الأقل نبلاً (جهده أكثر سلبية)","الأنبل","كلاهما بالتساوي"],a:0,why:"هو المصعد."},
        {q:"أخطر توليفة من حيث المساحة:",o:["مصعد صغير ومهبط كبير","مصعد كبير ومهبط صغير","متساويان"],a:0,why:"التيار يتركز على سطح المصعد الصغير."}],
  ref:"الموضوع: التآكل الكهروكيميائي في الطائرات (Corrosion Control)."
});
/* ---- 5 ---- */
LK("mnt",{
  ar:"قاعدة ماينر: تراكم تلف الكلال", en:"Miner's rule and spectrum fatigue",
  alt:"أعمدة لإسهام كل مستوى إجهاد في تلف الكلال لكل رحلة، ومنحنى S–N بنقاط مستويات الإجهاد الثلاثة",
  intro:["في كل رحلة تمر الطائرة بدورات إجهاد مختلفة: دورة كبيرة واحدة (أرض–جو–أرض: ضغط المقصورة وتحميل الجناح) وعدد كبير من دورات الهبّات الأصغر. كل مستوى يحمل عمراً N_i حسب منحنى S–N: N = 10⁶ (S₀/S)ᵐ حيث S₀ إجهاد التحمل عند مليون دورة.",
         "تقول قاعدة ماينر إن التلف الجزئي يتراكم خطياً: D = Σ n_i / N_i، ويحدث الفشل عند D = 1. إذن عدد الرحلات حتى الفشل = 1 / D لكل رحلة. ثم يُقسم على معامل تشتت (3 إلى 5) لضمان الأمان، وهو العمر المسموح. الإجهاد الأعلى يهيمن على التلف لأن N تقل بقوة m."],
  ctl:[{k:"S1",ar:"إجهاد الدورة الكبيرة",min:60,max:250,step:5,v:150,f:v=>nf(v,0)+" MPa"},{k:"S2",ar:"إجهاد هبّات صغيرة (40 دورة)",min:20,max:100,step:2,v:50,f:v=>nf(v,0)+" MPa"},{k:"S3",ar:"إجهاد هبّات أكبر (6 دورات)",min:30,max:160,step:2,v:90,f:v=>nf(v,0)+" MPa"},{k:"m",ar:"أس منحنى S–N",min:4,max:12,step:0.5,v:8,f:v=>nf(v,1)},{k:"SF",ar:"معامل التشتت",min:2,max:5,step:0.5,v:3,f:v=>nf(v,1)}],
  pre:[{ar:"إجهاد منخفض",set:{S1:90,S2:35,S3:60}},{ar:"إجهاد مرتفع",set:{S1:150,S2:60,S3:100}}],
  calc(st){ const S0=120; st.Nf=S=>1e6*Math.pow(S0/S,st.m); st.bl=[[st.S1,1],[st.S2,40],[st.S3,6]].map(([S,n])=>({S,n,N:st.Nf(S),d:n/st.Nf(S)})); st.D=st.bl.reduce((a,b)=>a+b.d,0); st.life=1/st.D; st.safe=st.life/st.SF; st.yrs=st.safe/1500; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.12, x1=r.x+r.w*0.9, y=r.y+r.h*0.78, hh=r.h*0.5, mx=Math.max(...st.bl.map(b=>b.d),1e-12), cols=["hyd","ctrl","power"], names=["دورة كبيرة","هبّات 40","هبّات 6"]; st.bl.forEach((b,i)=>{ const bw=(x1-x0)/3-20, x=x0+i*(x1-x0)/3+10, h=hh*b.d/mx; g.fillStyle=mixC(C.panel,KC(cols[i],C),0.65); g.fillRect(x,y-h,bw,h); g.strokeStyle=C.ink; g.strokeRect(x,y-h,bw,h); ltx(g,nf(b.d/st.D*100,0)+" %",x+bw/2,y-h-10,{s:12,w:700,m:true}); ltx(g,names[i]+" ("+nf(b.S,0)+")",x+bw/2,y+16,{s:11,rtl:true}); });
    ltx(g,"التلف لكل رحلة D = "+nf(st.D*1e6,2)+"×10⁻⁶",r.x+r.w*0.5,r.y+r.h*0.1,{s:14,w:700,rtl:true}); ltx(g,"العمر "+nf(st.life,0)+" رحلة  ·  المسموح "+nf(st.safe,0)+" (نحو "+nf(st.yrs,1)+" سنة)",r.x+r.w*0.5,r.y+r.h*0.94,{s:12,w:600,rtl:true,c:C.muted}); },
  plot(st){ return {x:[20,250],y:[1e3,1e10],log:true,xl:"إجهاد الدورة MPa",yl:"عدد الدورات N",curves:[{f:st.Nf,c:"hyd"}],dots:st.bl.map((b,i)=>({x:b.S,y:b.N,c:["hyd","ctrl","power"][i]}))}; },
  ro(st){ return [["N للدورة الكبيرة",sci(st.bl[0].N,1)],["التلف لكل رحلة",sci(st.D,2)],["عمر الفشل",nf(st.life,0)+" رحلة"],["العمر المسموح",nf(st.safe,0)+" رحلة"],["بالسنوات (1500 رحلة/سنة)",nf(st.yrs,1)]]; },
  eq:["N(S) = 10⁶ (S₀ / S)ᵐ","D = Σ n_i / N_i","عدد الرحلات = 1 / D  ؛  المسموح = ÷ SF"],
  note:["القاعدة الخطية تتجاهل أثر ترتيب الأحمال والإجهاد المتوسط. مصمّمو الهياكل يستخدمون بيانات اختبار وطيفاً مفصلاً.","S₀ = 120 MPa مثال ثابت هنا؛ حدود عمر الهيكل تأتي من برنامج السلامة الهيكلية للمصنّع."],
  quiz:[{q:"عند زيادة الإجهاد 10%، يتغير عمر الكلال بنسبة:",o:["تنخفض بقوة (أسّ m)","تنخفض 10%","لا تتغير"],a:0,why:"N ∝ S^(−m)."},
        {q:"لماذا نقسم العمر على معامل تشتت؟",o:["بسبب تباين نتائج الكلال بين العينات","لتخفيف الوزن","للتبسيط"],a:0,why:"أعمار الكلال تتفرق كثيراً."}],
  ref:"الموضوع: الكلال وتراكم التلف (Fatigue Damage Accumulation)."
});
/* ---- 6 ---- */
LK("mnt",{
  ar:"التيارات الدوامية: عمق النفاذ وتردد الفحص", en:"Eddy current inspection and skin depth",
  alt:"ملف فحص فوق جلد معدني وتيارات دوامية تضعف مع العمق، وشق في عمق معين، ومنحنى عمق النفاذ مع التردد",
  intro:["تُحدِث الملفات تياراً متناوباً يولّد في المعدن تيارات دوامية تقل كثافتها مع العمق أسّياً: J(z) = J₀ e^(−z/δ). عمق النفاذ δ = 1 / √(π f μ σ) حيث f التردد وμ النفاذية المغناطيسية وσ التوصيلية. تردد أعلى يعني فحصاً أدق للسطح لكنه أقل عمقاً.",
         "إشارة الشق على عمق d تتناسب تقريباً مع e^(−d/δ)، لذلك نختار تردداً يجعل δ مناسباً لعمق التفتيش. المعادن الأقل توصيلاً (التيتانيوم) تعطي δ أكبر لنفس التردد. والفولاذ المغناطيسي يعطي δ أصغر كثيراً بسبب μ_r كبيرة."],
  ctl:[{k:"lf",ar:"تردد الفحص",min:2,max:6.5,step:0.1,v:4.5,f:v=>fmtF(Math.pow(10,v))},{k:"sg",ar:"التوصيلية",min:0.5,max:40,step:0.5,v:17,f:v=>nf(v,1)+" MS/m"},{k:"mu",ar:"النفاذية النسبية",min:1,max:200,step:1,v:1,f:v=>nf(v,0)},{k:"dd",ar:"عمق الشق",min:0,max:6,step:0.1,v:1.5,f:v=>nf(v,1)+" mm"}],
  pre:[{ar:"ألمنيوم",set:{sg:17,mu:1}},{ar:"تيتانيوم",set:{sg:0.58,mu:1,lf:4}},{ar:"فولاذ مغناطيسي",set:{sg:5,mu:100}}],
  calc(st){ st.dl=f=>1/Math.sqrt(Math.PI*f*4e-7*Math.PI*st.mu*st.sg*1e6)*1000; st.f=Math.pow(10,st.lf); st.d=st.dl(st.f); st.sig=Math.exp(-st.dd/st.d)*100; st.pen=3*st.d; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.15, w=r.w*0.7, y0=r.y+r.h*0.2, H=r.h*0.5, mx=Math.max(8,st.d*4,st.dd*1.4), Y=z=>y0+z/mx*H; g.fillStyle=mixC(C.panel,C.struct,0.5); g.fillRect(x0,y0,w,H); g.strokeStyle=C.ink; g.lineWidth=1.3; g.strokeRect(x0,y0,w,H); g.fillStyle=mixC(C.panel,C.power,0.7); g.fillRect(x0+w*0.4,y0-26,w*0.2,22); g.strokeRect(x0+w*0.4,y0-26,w*0.2,22); ltx(g,"ملف",x0+w*0.5,y0-37,{s:11,rtl:true});
    for(let k=0;k<20;k++){ const z=k/20*mx, a=Math.exp(-z/st.d); g.strokeStyle=mixC(C.panel,C.hyd,0.2+0.8*a); g.lineWidth=1+1.6*a; g.beginPath(); g.ellipse(x0+w*0.5,Y(z),w*0.1+z/mx*w*0.2,Math.max(1,(H/20)*0.4),0,0,Math.PI*2); g.stroke(); }
    lline(g,[[x0,Y(st.d)],[x0+w,Y(st.d)]],C.power,1.6,[5,3]); ltx(g,"δ = "+nf(st.d,2)+" mm",x0+w-4,Y(st.d)-9,{s:11,m:true,a:"right",c:C.power}); g.fillStyle=C.ink; g.fillRect(x0+w*0.7,Y(st.dd)-4,5,8); ltx(g,"شق على "+nf(st.dd,1)+" mm",x0+w*0.7+10,Y(st.dd),{s:11,rtl:true,a:"left"}); ltx(g,"الإشارة المتبقية "+nf(st.sig,0)+" %",r.x+r.w*0.5,r.y+r.h*0.9,{s:13,w:700,rtl:true,c:st.sig<20?C.power:C.ink}); },
  plot(st){ return {x:[100,3e6],y:[0.01,30],log:true,xl:"التردد Hz",yl:"δ mm",curves:[{f:st.dl,c:"hyd"}],dots:[{x:st.f,y:st.d,c:"power"}]}; },
  ro(st){ return [["التردد",fmtF(st.f)],["عمق النفاذ δ",nf(st.d,2)+" mm"],["عمق مفيد تقريباً 3δ",nf(st.pen,2)+" mm"],["إشارة الشق",nf(st.sig,0)+" %"]]; },
  eq:["δ = 1 / √(π f μ₀ μ_r σ)","J(z) = J₀ e^(−z/δ)","الإشارة ≈ e^(−d/δ)"],
  note:["النموذج لوح لانهائي. الفحص الفعلي يعتمد على نوع الملف وهندسة الشق وإعداد الجهاز بمعايير مرجعية.","يُعاير الفحص على قطعة مرجعية فيها شقوق معروفة؛ وتحدد المراجع تردداً لكل تطبيق."],
  quiz:[{q:"رفع التردد يجعل عمق النفاذ:",o:["أقل","أكبر","كما هو"],a:0,why:"δ ∝ 1/√f."},
        {q:"أي معدن يعطي δ أكبر لنفس التردد؟",o:["الأقل توصيلاً مثل التيتانيوم","الأعلى توصيلاً","لا فرق"],a:0,why:"δ ∝ 1/√σ."}],
  ref:"الموضوع: الفحص بالتيارات الدوامية (Eddy Current Testing)."
});
function fmtF(f){ return f>=1e6?nf(f/1e6,2)+" MHz":f>=1e3?nf(f/1e3,1)+" kHz":nf(f,0)+" Hz"; }
/* ---- 7 ---- */
LK("mnt",{
  ar:"الفحص بالموجات فوق الصوتية: السماكة والعيوب", en:"Ultrasonic thickness and flaw detection",
  alt:"مجس فوق صوتي على قطعة معدنية وإشارة A-scan بنبضة أولية وصدى عيب وصدى الجدار الخلفي، ومنحنى طول الموجة مع التردد",
  intro:["يرسل المجس نبضة فوق صوتية تنتقل في المعدن بسرعة v وتنعكس عند الجدار الخلفي أو عند عيب. الزمن بين الإرسال وعودة الصدى t يعطي المسافة: d = v t / 2. لذلك نعرف السماكة أو عمق العيب من زمن الصدى.",
         "أصغر عيب يمكن كشفه نحو نصف طول الموجة λ = v / f، لذلك ترفع الترددات العالية الحساسية للعيوب الصغيرة لكنها تضعف أسرع داخل المعدن. وتوجد منطقة قريبة من المجس طولها N = D² f / (4 v) لا يعطي فيها الفحص قراءة موثوقة."],
  ctl:[{k:"v",ar:"سرعة الصوت في المعدن",min:2000,max:6500,step:50,v:6320,f:v=>nf(v,0)+" m/s"},{k:"tm",ar:"زمن الصدى الخلفي",min:0.5,max:60,step:0.1,v:4.8,f:v=>nf(v,1)+" µs"},{k:"f",ar:"التردد",min:1,max:15,step:0.5,v:5,f:v=>nf(v,1)+" MHz"},{k:"Dp",ar:"قطر المجس",min:6,max:25,step:1,v:10,f:v=>nf(v,0)+" mm"}],
  tog:[{k:"fl",ar:"وجود عيب",v:true}],
  pre:[{ar:"ألمنيوم",set:{v:6320}},{ar:"فولاذ",set:{v:5900}},{ar:"تيتانيوم",set:{v:6100}}],
  calc(st){ st.d=st.v*st.tm*1e-6/2*1000; st.lam=st.v/(st.f*1e6)*1000; st.fm=st.lam/2; st.nf=st.Dp*st.Dp*st.f*1e6/(4*st.v)/1000*1000/1000; st.nf=(st.Dp*1e-3)**2*st.f*1e6/(4*st.v)*1000; st.fd=st.d*0.42; st.tf=st.fd*2/st.v*1e3; st.lm=f=>st.v/(f*1e6)*1000; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.1, w=r.w*0.55, y0=r.y+r.h*0.28, H=r.h*0.4; g.fillStyle=mixC(C.panel,C.struct,0.55); g.strokeStyle=C.ink; g.lineWidth=1.4; g.fillRect(x0,y0,w,H); g.strokeRect(x0,y0,w,H); const px=x0+w*0.3; g.fillStyle=mixC(C.panel,C.power,0.8); g.fillRect(px-st.Dp*1.1,y0-18,st.Dp*2.2,16); g.strokeRect(px-st.Dp*1.1,y0-18,st.Dp*2.2,16);
    if(st.fl){ g.fillStyle=C.ink; g.beginPath(); g.ellipse(px+10,y0+H*0.42,9,4,0,0,Math.PI*2); g.fill(); }
    const ph=(st.t*0.5)%1; for(let i=0;i<3;i++){ const f=(ph+i*0.15)%1; g.strokeStyle=mixC(C.panel,C.hyd,0.9-i*0.25); g.lineWidth=2; g.beginPath(); g.moveTo(px-14,y0+H*f); g.lineTo(px+14,y0+H*f); g.stroke(); }
    const ax=r.x+r.w*0.7, aw=r.w*0.26, ay=r.y+r.h*0.7, ah=r.h*0.4; lline(g,[[ax,ay],[ax+aw,ay]],C.ink,1.4); const T=st.tm*1.15, X=t=>ax+aw*t/T, pulse=(t0,a,c)=>lline(g,[[X(t0-0.15),ay],[X(t0-0.08),ay-ah*a],[X(t0),ay+ah*a*0.5],[X(t0+0.08),ay-ah*a*0.3],[X(t0+0.15),ay]],c,1.8); pulse(0.2,0.9,C.ink); if(st.fl) pulse(st.tf,0.5,C.power); pulse(st.tm,0.8,C.hyd); ltx(g,"A-scan",ax+aw/2,ay+14,{s:11,m:true,c:C.muted});
    ltx(g,"d = v t / 2 = "+nf(st.d,2)+" mm",r.x+r.w*0.5,r.y+r.h*0.1,{s:15,w:700,m:true}); ltx(g,"λ = "+nf(st.lam,2)+" mm  ·  أصغر عيب ≈ "+nf(st.fm,2)+" mm  ·  المنطقة القريبة "+nf(st.nf,1)+" mm",r.x+r.w*0.5,r.y+r.h*0.92,{s:11,rtl:true,c:C.muted}); },
  plot(st){ return {x:[1,15],y:[0,Math.max(1,st.lm(1))*1.05],xl:"التردد MHz",yl:"طول الموجة mm",curves:[{f:st.lm,c:"hyd"}],dots:[{x:st.f,y:st.lam,c:"power"}]}; },
  ro(st){ return [["السماكة",nf(st.d,2)+" mm"],["طول الموجة",nf(st.lam,2)+" mm"],["أصغر عيب تقريباً",nf(st.fm,2)+" mm"],["المنطقة القريبة",nf(st.nf,1)+" mm"],["عمق العيب (إن وُجد)",st.fl?nf(st.fd,1)+" mm":"—"]]; },
  eq:["d = v t / 2","λ = v / f","N = D² f / (4 v)","أصغر عيب ≈ λ / 2"],
  note:["السرعات المعتمدة للمعدن تؤخذ من المعايرة على كتلة مرجعية بسماكة معروفة، ولا ثقة بالجداول وحدها.","في الواقع تُضاف مادة اقتران (جل) بين المجس والسطح لتنتقل الموجة بلا هواء."],
  quiz:[{q:"زمن الصدى 5 µs في ألمنيوم (6320 m/s) يعطي سماكة نحو:",o:["15.8 mm","31.6 mm","7.9 mm"],a:0,why:"d = v t / 2."},
        {q:"رفع التردد يجعل أصغر عيب مرئي:",o:["أصغر","أكبر","كما هو"],a:0,why:"λ أقل."}],
  ref:"الموضوع: الفحص بالموجات فوق الصوتية (Ultrasonic Testing)."
});
/* ---- 8 ---- */
LK("mnt",{
  ar:"السائل المتغلغل: الخاصية الشعرية داخل الشق", en:"Penetrant inspection and capillary action",
  alt:"شق ضيق في سطح معدني يتغلغل فيه سائل ملوّن بالخاصية الشعرية، ومنحنى زمن التغلغل مع عرض الشق",
  intro:["الفحص بالسائل المتغلغل يكشف الشقوق السطحية: نغطي السطح بسائل ملوّن منخفض التوتر السطحي، فيدخل الشقوق بقوة شعرية ضغطها p = 2γ cos θ / w (لشق عرضه w). كلما ضاق الشق قوي الضغط، لكن يطول زمن الوصول لعمق معين.",
         "زمن ملء شق بعمق L يعطيه قانون لوكاس–واشبورن للشق المستوي: t = 3 η L² / (γ w cos θ) حيث η لزوجة السائل. من أجل الكشف يُترك السائل على السطح زمناً (زمن المكث) ثم يُمسح السطح ويُرش مظهر يسحب السائل المخزون في الشق فتظهر علامة ملوّنة."],
  ctl:[{k:"w",ar:"عرض الشق",min:0.5,max:50,step:0.5,v:5,f:v=>nf(v,1)+" µm"},{k:"L",ar:"عمق الشق",min:0.2,max:5,step:0.1,v:2,f:v=>nf(v,1)+" mm"},{k:"ga",ar:"التوتر السطحي",min:20,max:40,step:1,v:28,f:v=>nf(v,0)+" mN/m"},{k:"th",ar:"زاوية التماس",min:0,max:60,step:1,v:10,f:v=>nf(v,0)+"°"},{k:"et",ar:"اللزوجة",min:2,max:20,step:0.5,v:6,f:v=>nf(v,1)+" mPa·s"}],
  pre:[{ar:"شق دقيق",set:{w:1}},{ar:"شق عريض",set:{w:40}}],
  calc(st){ const c=Math.cos(st.th*D2R); st.pc=2*st.ga*1e-3*c/(st.w*1e-6)/1000; st.twf=w=>3*st.et*1e-3*Math.pow(st.L*1e-3,2)/(st.ga*1e-3*w*1e-6*c); st.tw=st.twf(st.w); },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, y0=r.y+r.h*0.22, H=r.h*0.5, W=r.w*0.5, cw=clamp(st.w*0.9,3,26), cyc=Math.max(0.6,Math.min(6,st.tw*3)), ph=((st.t*0.6)%(cyc+1.2)), fr=clamp(ph/cyc,0,1); g.fillStyle=mixC(C.panel,C.struct,0.55); g.strokeStyle=C.ink; g.lineWidth=1.4; g.fillRect(cx-W/2,y0,W/2-cw/2,H); g.fillRect(cx+cw/2,y0,W/2-cw/2,H); g.strokeRect(cx-W/2,y0,W,H);
    g.fillStyle=mixC(C.panel,C.power,0.75); g.fillRect(cx-cw/2,y0,cw,H*fr); g.fillRect(cx-W/2,y0-6,W,6); ltx(g,"سائل متغلغل",cx+W/2+8,y0-4,{s:11,rtl:true,a:"left",c:C.power}); lline(g,[[cx-cw/2,y0+H+10],[cx+cw/2,y0+H+10]],C.muted,1.2); ltx(g,nf(st.w,1)+" µm",cx,y0+H+24,{s:11,m:true}); lline(g,[[cx+W/2+8,y0],[cx+W/2+8,y0+H*fr]],C.hyd,2); ltx(g,nf(st.L*fr,2)+" mm",cx+W/2+14,y0+H*fr/2,{s:11,m:true,a:"left",c:C.hyd});
    ltx(g,"ضغط شعري "+nf(st.pc,1)+" kPa",r.x+r.w*0.5,r.y+r.h*0.07,{s:14,w:700,rtl:true}); ltx(g,"زمن الملء "+(st.tw<60?nf(st.tw,2)+" s":nf(st.tw/60,1)+" min"),r.x+r.w*0.5,r.y+r.h*0.93,{s:13,w:700,rtl:true,c:st.tw>120?C.power:C.ink}); },
  plot(st){ return {x:[0.5,50],y:[0.01,3000],log:true,xl:"عرض الشق µm",yl:"زمن الملء s",curves:[{f:st.twf,c:"hyd"}],hl:[{y:600,c:"muted",t:"10 min"}],dots:[{x:st.w,y:st.tw,c:"power"}]}; },
  ro(st){ return [["الضغط الشعري",nf(st.pc,1)+" kPa"],["زمن ملء "+nf(st.L,1)+" mm",st.tw<60?nf(st.tw,2)+" s":nf(st.tw/60,1)+" min"],["زاوية التماس",nf(st.th,0)+"°"],["لزوجة السائل",nf(st.et,1)+" mPa·s"]]; },
  eq:["p = 2 γ cos θ / w","t = 3 η L² / (γ w cos θ)"],
  note:["القانون للشق المستوي المثالي ويفترض سطحاً نظيفاً ومبللاً. الشقوق الحقيقية متعرجة ومعبأة بالأوساخ فيطول الزمن كثيراً.","التنظيف قبل الفحص وزمن المكث ونوع المظهر تحددها إجراءات الفحص المعتمدة، لا هذه الحسبة."],
  quiz:[{q:"شق أضيق يعطي ضغطاً شعرياً:",o:["أكبر","أقل","كما هو"],a:0,why:"p ∝ 1/w."},
        {q:"لماذا يختلف زمن الملء مع العمق؟",o:["لأنه يتناسب مع مربع العمق","خطياً","لا يختلف"],a:0,why:"t ∝ L²."}],
  ref:"الموضوع: الفحص بالسوائل المتغلغلة (Liquid Penetrant Testing)."
});
/* ---- 9 ---- */
LK("mnt",{
  ar:"توزيع ويبل ومنحنى حوض الاستحمام", en:"Weibull distribution and the bathtub curve",
  alt:"منحنى معدل الفشل بحسب الزمن لثلاثة أشكال: وفيات الطفولة وفشل عشوائي وفشل بلى، ومنحنى الموثوقية للقيم الحالية",
  intro:["تنفصل أعطال الأجزاء إلى ثلاث مراحل: فشل مبكر ينخفض معدله (عيوب التصنيع)، ثم فترة فشل عشوائي معدلها ثابت، ثم فشل بلى يرتفع معدله. يلخّصها توزيع ويبل بمعاملين: عمر مميز η وشكل β. الموثوقية R(t) = exp(−(t/η)^β) ومعدل الفشل h(t) = (β/η)(t/η)^(β−1).",
         "إذا كانت β أقل من 1 فمعدل الفشل ينخفض مع الزمن (فشل مبكر)، وإذا كانت 1 فالمعدل ثابت (توزيع أسّي)، وإذا زادت عن 1 فالمعدل يرتفع (بلى). وتخبرنا قيمتها كيف نخطط الصيانة: لا فائدة في الاستبدال الوقائي للجزء ذي β ≤ 1، وهو يفيد عندما β كبيرة."],
  ctl:[{k:"eta",ar:"العمر المميز η",min:1000,max:60000,step:500,v:20000,f:v=>nf(v,0)+" h"},{k:"be",ar:"معامل الشكل β",min:0.5,max:4,step:0.1,v:2.5,f:v=>nf(v,1)},{k:"tt",ar:"زمن التشغيل",min:0,max:60000,step:500,v:15000,f:v=>nf(v,0)+" h"}],
  pre:[{ar:"فشل مبكر",set:{be:0.6}},{ar:"فشل عشوائي",set:{be:1}},{ar:"بلى",set:{be:3.5}}],
  calc(st){ st.R=t=>Math.exp(-Math.pow(t/st.eta,st.be)); st.hz=(x,b)=>b*Math.pow(x,b-1); st.r=st.R(st.tt); st.F=1-st.r; st.h=(st.be/st.eta)*Math.pow(Math.max(st.tt,1e-6)/st.eta,st.be-1); st.mttf=st.eta*mnGam(1+1/st.be); st.cls=st.be<0.95?"فشل مبكر (يتحسن بالتشغيل)":st.be<1.05?"فشل عشوائي":"بلى (يزداد مع العمر)"; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.12, x1=r.x+r.w*0.9, y=r.y+r.h*0.78, H=r.h*0.5, N=60; const pts=[], pr=[]; for(let i=1;i<=N;i++){ const x=i/N*3, h=Math.min(5,st.hz(x,st.be)); pts.push([x0+(x1-x0)*x/3,y-H*h/5]); pr.push([x0+(x1-x0)*x/3,y-H*Math.exp(-Math.pow(x,st.be))]); } lline(g,[[x0,y],[x1,y]],C.ink,1.4); lline(g,pts,C.power,2.4); lline(g,pr,C.hyd,2.4,[5,3]); ltx(g,"معدل الفشل",x1-4,pts[N-1][1]-8,{s:11,rtl:true,a:"right",c:C.power}); ltx(g,"الموثوقية",x0+4,y-H-8,{s:11,rtl:true,a:"left",c:C.hyd});
    const tx=x0+(x1-x0)*Math.min(3,st.tt/st.eta)/3; lline(g,[[tx,y],[tx,y-H]],C.muted,1.2,[4,3]); ltx(g,"R = "+nf(st.r*100,0)+" %  ·  "+st.cls,r.x+r.w*0.5,r.y+r.h*0.08,{s:14,w:700,rtl:true}); ltx(g,"MTTF = "+nf(st.mttf,0)+" h",r.x+r.w*0.5,r.y+r.h*0.94,{s:12,m:true,c:C.muted}); },
  plot(st){ return {x:[0,3],y:[0,5],xl:"الزمن ÷ η",yl:"h(t) × η",curves:[{f:x=>Math.min(5,st.hz(x,0.6)),c:"gear",x:[0.02,3]},{f:x=>st.hz(x,1),c:"hyd"},{f:x=>Math.min(5,st.hz(x,3.5)),c:"power"}],leg:[{c:"gear",t:"β 0.6"},{c:"hyd",t:"β 1"},{c:"power",t:"β 3.5"}],vl:[{x:Math.min(3,st.tt/st.eta),c:"muted",t:"الآن"}]}; },
  ro(st){ return [["الموثوقية R(t)",nf(st.r*100,1)+" %"],["احتمال الفشل",nf(st.F*100,1)+" %"],["معدل الفشل الآن",sci(st.h,2)+" /h"],["متوسط العمر MTTF",nf(st.mttf,0)+" h"],["النمط",st.cls]]; },
  eq:["R(t) = exp[ −(t/η)^β ]","h(t) = (β/η)(t/η)^(β−1)","MTTF = η Γ(1 + 1/β)"],
  note:["منحنى الحوض الكامل يجمع ثلاثة توزيعات ويبل مختلفة β؛ هنا نعرض كل واحدة منها منفردة.","تقدّر قيم η وβ من بيانات التشغيل بتقنيات إحصائية، وتتطلب بيانات كافية."],
  quiz:[{q:"إذا كانت β = 1 فمعدل الفشل:",o:["ثابت","يرتفع","ينخفض"],a:0,why:"h = 1/η."},
        {q:"الاستبدال الوقائي مجدٍ عندما:",o:["β أكبر من 1 بوضوح","β أقل من 1","β = 1"],a:0,why:"لأن معدل الفشل يرتفع مع العمر."}],
  ref:"الموضوع: تحليل الموثوقية وتوزيع ويبل (Reliability Analysis)."
});
