/* ---------- Book 13: Navigation and Meteorology (3/3): gusts, ice, storms, visibility, time and sun ---------- */
/* ---- 19 ---- */
LK("nav",{
  ar:"حمل الهبّات: لماذا نخفض السرعة في الاضطراب؟", en:"Gust load factor and turbulence penetration speed",
  alt:"طائرة تتلقى هبة رأسية مع زاوية الهجوم الإضافية، ومنحنى زيادة عامل الحمل مع السرعة المكافئة مقابل حد الحمل",
  intro:["عندما تصادف الطائرة هبّة رأسية بسرعة U تزداد زاوية هجوم الجناح بمقدار U/V، فيزداد الرفع فجأة. زيادة عامل الحمل Δn تتناسب مع سرعة الطائرة المكافئة V_e وسرعة الهبّة وميل منحنى الرفع a، وتتناسب عكسياً مع تحميل الجناح W/S: Δn = ρ₀ K_g U V_e a / (2 W/S).",
         "معامل التخفيف K_g = 0.88 μ / (5.3 + μ) يقل إن كانت الطائرة خفيفة نسبياً (μ صغير). النتيجة العملية: خفض السرعة في الاضطراب يخفض الحمل نسبياً، ولذلك تحدد الطائرات 'سرعة دخول الاضطراب' التي تحمي الهيكل مع هامش من الانهيار."],
  ctl:[{k:"wf",ar:"الوزن من MTOW",min:0.6,max:1,step:0.01,v:0.85,f:v=>nf(v,2)},{k:"U",ar:"سرعة الهبّة",min:3,max:20,step:0.5,v:15.2,f:v=>nf(v,1)+" m/s"},{k:"Ve",ar:"السرعة المكافئة",min:150,max:400,step:5,v:280,f:v=>nf(v,0)+" kt"},{k:"h",ar:"الارتفاع",min:0,max:40000,step:1000,v:30000,f:v=>nf(v,0)+" ft"}],
  pre:[{ar:"اضطراب شديد",set:{U:20}},{ar:"سرعة دخول الاضطراب",set:{Ve:250}}],
  calc(st){ const a0=lac(), AR=a0.b*a0.b/a0.S, ca=2*Math.PI*AR/(2+Math.sqrt(4+AR*AR)), c=a0.S/a0.b, WS=st.wf*a0.mtow*G0/a0.S, rho=isa(st.h*0.3048).rho, mu=2*WS/(rho*c*G0*ca), kg=0.88*mu/(5.3+mu); st.a=ca; st.WS=WS; st.mu=mu; st.kg=kg; st.dn=ve=>1.225*kg*st.U*(ve/KT)*ca/(2*WS); st.d=st.dn(st.Ve); st.np=1+st.d; st.lim=2.5; st.ok=st.np<=st.lim; st.vd=(st.lim-1)/(1.225*kg*st.U*ca/(2*WS))*KT; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.46; lplane(g,cx,cy,r.w*0.55,0,C); const k=clamp(st.d/2,0,1); for(let i=0;i<6;i++){ const f=(st.t*0.5+i/6)%1, x=cx-r.w*0.3+i*r.w*0.11, L=14+st.U*1.4; larrow(g,x,cy+r.h*0.34-f*r.h*0.1+L,x,cy+r.h*0.34-f*r.h*0.1,C.hyd,2,7); }
    ltx(g,"Δn = "+nf(st.d,2)+"  ·  n = "+nf(st.np,2)+" g",r.x+r.w*0.5,r.y+r.h*0.08,{s:15,w:700,m:true,c:st.ok?C.ink:C.power}); kBar(g,r.x+r.w*0.1,r.y+r.h*0.86,r.w*0.8,10,st.np/4,st.ok?"hyd":"power",C,"حد التصميم "+nf(st.lim,1)+" g"); ltx(g,"أقصى سرعة تحقق الحد "+nf(st.vd,0)+" kt",r.x+r.w*0.5,r.y+r.h*0.72,{s:12,rtl:true,c:C.muted}); },
  plot(st){ return {x:[150,400],y:[0,Math.max(2,st.dn(400))*1.05],xl:"السرعة المكافئة kt",yl:"Δn",curves:[{f:st.dn,c:"hyd"}],hl:[{y:1.5,c:"power",t:"حد 2.5 g"}],dots:[{x:st.Ve,y:st.d,c:st.ok?"hyd":"power"}]}; },
  ro(st){ return [["ميل الرفع a",nf(st.a,2)+" /rad"],["تحميل الجناح",nf(st.WS,0)+" N/m²"],["μ",nf(st.mu,0)],["K_g",nf(st.kg,3)],["Δn",nf(st.d,2)],["عامل الحمل الأقصى",nf(st.np,2)+" g"]]; },
  eq:["μ = 2 (W/S) / (ρ c̄ g a)","K_g = 0.88 μ / (5.3 + μ)","Δn = ρ₀ K_g U V_e a / (2 W/S)"],
  note:["الصيغة تصميمية من معايير الجناح المرن المبسطة، وتعطي عامل حمل تصميمياً لهبّة 15.2 m/s عند V_C. الأحمال الفعلية تعتمد على التصميم.","حد الحمل 2.5 g مثال شائع لطائرة النقل؛ الدليل المعتمد لكل طائرة هو المرجع."],
  quiz:[{q:"خفض السرعة المكافئة في الاضطراب:",o:["يخفض Δn","يرفعه","لا يغيّره"],a:0,why:"Δn ∝ V_e."},
        {q:"تحميل جناح أكبر (طائرة أثقل) يجعل Δn:",o:["أقل","أكبر","كما هو"],a:0,why:"Δn ∝ 1/(W/S)."}],
  ref:"الموضوع: الأحمال بسبب الهبّات (Gust Loads)."
});
/* ---- 20 ---- */
LK("nav",{
  ar:"الجليد على الجناح: نمو الطبقة وخسارة الرفع", en:"Ice accretion and its effect on lift",
  alt:"مقطع جناح عليه جليد على الحافة الأمامية يزداد مع الزمن، ومنحنى خسارة الرفع وارتفاع سرعة الانهيار مع الزمن",
  intro:["في سحابة فيها قطرات ماء فائقة البرودة تلتصق القطرات بالحافة الأمامية للجناح فتتجمد. معدل نمو السماكة تقريباً dh/dt = β · LWC · V / ρ_جليد حيث β كفاءة التجميع (تقل مع سماكة الجسم) وLWC المحتوى المائي السائل. ويزداد مع السرعة وكثافة الماء.",
         "الجليد الخشن على الحافة الأمامية يفسد انسياب الهواء قبل أن يبلغ سماكة كبيرة، فتهبط C_Lmax بشدة وتزداد سرعة الانهيار. لهذا تُحمى الأجنحة بالتسخين أو الأغطية المتمددة ويُمنع الطيران في الجليد الشديد دون حماية، ويجب أن تتجاوز السرعة الانهيار بهامش أكبر."],
  ctl:[{k:"lwc",ar:"المحتوى المائي",min:0.05,max:3,step:0.05,v:0.2,f:v=>nf(v,2)+" g/m³"},{k:"V",ar:"سرعة الطائرة",min:100,max:400,step:5,v:200,f:v=>nf(v,0)+" kt"},{k:"be",ar:"كفاءة التجميع",min:0.1,max:0.9,step:0.05,v:0.4,f:v=>nf(v,2)},{k:"tm",ar:"مدة التعرض",min:0,max:60,step:1,v:8,f:v=>nf(v,0)+" min"},{k:"T",ar:"حرارة الهواء",min:-30,max:5,step:1,v:-8,f:v=>nf(v,0)+" °C"}],
  pre:[{ar:"جليد خفيف",set:{lwc:0.15,tm:10}},{ar:"جليد شديد",set:{lwc:1.5,tm:20}}],
  calc(st){ st.th=t=>st.T>0?0:st.be*st.lwc*1e-3*(st.V/KT)*t*60/880*1000; st.th0=st.th(st.tm); st.ls=t=>Math.min(45,12*Math.sqrt(st.th(t))); st.l0=st.ls(st.tm); st.vi=1/Math.sqrt(1-st.l0/100); st.sv=(st.vi-1)*100; st.fr=st.T<=0; },
  scene(g,r,st,C){ const ox=r.x+r.w*0.16, oy=r.y+r.h*0.46, ch=r.w*0.62, P=kFoil(g,ox,oy,ch,3,C,{m:0.02,p:0.4,t:0.12}); const thp=Math.min(r.w*0.09,st.th0*1.2); if(st.fr&&st.th0>0.1){ g.fillStyle=mixC(C.panel,C.hyd,0.55); g.strokeStyle=C.hyd; g.lineWidth=1.2; g.beginPath(); const le=P(0,0); g.moveTo(le[0]+2,le[1]-ch*0.055); g.quadraticCurveTo(le[0]-thp*1.5,le[1]-ch*0.1,le[0]-thp*1.2,le[1]-ch*0.02); g.quadraticCurveTo(le[0]-thp*1.7,le[1]+ch*0.01,le[0]-thp*1.0,le[1]+ch*0.04); g.lineTo(le[0]+2,le[1]+ch*0.05); g.closePath(); g.fill(); g.stroke(); }
    for(let i=0;i<10;i++){ const f=(st.t*0.7+i/10)%1; ldot(g,ox-r.w*0.12+f*r.w*0.12,oy+(i-4.5)*r.h*0.035,2.2,C.hyd,0.8*(1-f*0.5)); }
    ltx(g,st.fr?"سماكة الجليد "+nf(st.th0,1)+" mm":"فوق الصفر: لا جليد",r.x+r.w*0.5,r.y+r.h*0.1,{s:14,w:700,rtl:true}); ltx(g,"خسارة الرفع "+nf(st.l0,0)+" %  ·  سرعة الانهيار +"+nf(st.sv,0)+" %",r.x+r.w*0.5,r.y+r.h*0.84,{s:13,w:600,rtl:true,c:st.l0>20?C.power:C.ink}); },
  plot(st){ return {x:[0,60],y:[0,48],xl:"الزمن min",yl:"خسارة الرفع %",curves:[{f:st.ls,c:"power"}],hl:[{y:20,c:"muted",t:"خطير"}],dots:[{x:st.tm,y:st.l0,c:"power"}]}; },
  ro(st){ return [["سماكة الجليد",nf(st.th0,1)+" mm"],["خسارة C_Lmax التقريبية",nf(st.l0,0)+" %"],["زيادة سرعة الانهيار",nf(st.sv,0)+" %"],["معدل النمو",nf(st.th(1),2)+" mm/min"]]; },
  eq:["dh/dt = β · LWC · V / ρ_جليد","خسارة الرفع ≈ 12 √h  (%)  (تقريب)","V_s,جليد = V_s / √(1 − الخسارة)"],
  note:["معادلة الخسارة تجريبية تقريبية مبنية على سلوك الجليد الخشن على الحافة الأمامية؛ أثر الجليد الفعلي يعتمد على شكله وعلى المقطع.","الطيران في ظروف الجليد يتطلب نظام حماية يعمل بإجراء، ومراقبة أجهزة كشف الجليد."],
  quiz:[{q:"ماذا يحدث لسرعة الانهيار عند تراكم الجليد؟",o:["تزداد","تقل","لا تتغير"],a:0,why:"C_Lmax تنخفض."},
        {q:"أين يتراكم الجليد أولاً عادة؟",o:["على الحافة الأمامية","في منتصف الجناح","على السطح السفلي"],a:0,why:"حيث تصطدم القطرات."}],
  show:{ar:"اعرض كاشف الجليد",fn:()=>lrnSel("ice_detector")},
  ref:"الموضوع: الطيران في ظروف الجليد (Aircraft Icing)."
});
/* ---- 21 ---- */
LK("nav",{
  ar:"طاقة العاصفة: تيار الصعود وحجم البَرَد", en:"Storm updraft from CAPE and hail size",
  alt:"سحابة عاصفة ركامية بتيار صاعد وحجارة برد معلقة، ومنحنى سرعة التيار وقطر البرد مع طاقة الحمل المتاحة",
  intro:["طاقة الحمل المتاحة CAPE (بوحدة J/kg) تقيس شغل الطفو الذي يمكن أن يبذله هواء صاعد أدفأ من محيطه. بتحويل كامل الطاقة إلى حركة رأسية تكون السرعة العظمى w = √(2 CAPE). في الواقع يبلغ التيار نحو نصف هذه القيمة بسبب مقاومة الهواء وخلط الهواء المحيط.",
         "التيار الصاعد يحمل حجارة البرد: تتوازن حين تساوي سرعة السقوط النهائية سرعة التيار. قطر حبة البرد D = 3 ρ_هواء C_d w² / (4 ρ_جليد g). تيارات أقوى تعني حبات أكبر وتحطيم أوسع. لهذا تتجنب الطائرات القلب القوي للعواصف بمسافات آمنة بحسب إرشادات التشغيل."],
  ctl:[{k:"cape",ar:"CAPE",min:0,max:5000,step:100,v:1800,f:v=>nf(v,0)+" J/kg"},{k:"ef",ar:"كفاءة التيار نسبة للنظرية",min:0.3,max:1,step:0.05,v:0.5,f:v=>nf(v,2)},{k:"cd",ar:"معامل سحب البرد",min:0.4,max:0.9,step:0.05,v:0.6,f:v=>nf(v,2)},{k:"ra",ar:"كثافة الهواء في الطبقة",min:0.35,max:0.9,step:0.05,v:0.55,f:v=>nf(v,2)+" kg/m³"}],
  pre:[{ar:"عاصفة عادية",set:{cape:1000}},{ar:"عاصفة قوية",set:{cape:3500}}],
  calc(st){ st.wt=Math.sqrt(2*st.cape); st.w=st.wt*st.ef; st.Df=w=>3*st.ra*st.cd*w*w/(4*900*G0)*100; st.D=st.Df(st.w); st.wf=c=>Math.sqrt(2*c)*st.ef; st.Dc=c=>st.Df(Math.sqrt(2*c)*st.ef); st.cls=st.D<0.5?"بلا برد يُذكر":st.D<2?"برد صغير":st.D<5?"برد متوسط":"برد كبير"; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, base=r.y+r.h*0.82, top=r.y+r.h*0.14, h=base-top, k=clamp(st.w/50,0.1,1); g.fillStyle=mixC(C.panel,C.ink,0.1); for(let i=0;i<12;i++){ const f=i/11, y=base-h*f*(0.5+0.5*k), w=(r.w*0.2+Math.sin(f*Math.PI)*r.w*0.1)*(0.7+0.3*k)*(f>0.8?1+(f-0.8)*3:1); g.beginPath(); g.arc(cx+Math.sin(i*1.7)*8,y,w*0.5,0,Math.PI*2); g.fill(); }
    lline(g,[[cx-r.w*0.2,top+h*0.2],[cx+r.w*0.2,top+h*0.2]],C.line,0.8,[3,4]); const L=20+st.w*2.2; for(let i=0;i<3;i++) larrow(g,cx-r.w*0.06+i*r.w*0.06,base,cx-r.w*0.06+i*r.w*0.06,base-L-(Math.sin(st.t*2+i)*4),C.power,2.6,9);
    const hs=clamp(st.D*2.8+2,2,16); for(let i=0;i<9;i++){ const f=(st.t*0.25+i/9)%1, x=cx-r.w*0.14+((i*47)%100)/100*r.w*0.28, y=top+h*0.3+Math.sin(st.t*3+i)*6+f*h*0.1; ldot(g,x,y,hs*(0.7+0.3*((i*3)%3)/3),C.hyd,0.9); }
    ltx(g,"تيار صاعد ≈ "+nf(st.w,0)+" m/s  ("+nf(st.w*KT,0)+" kt)",r.x+r.w*0.5,r.y+r.h*0.06,{s:13,w:700,rtl:true}); ltx(g,"قطر البرد ≈ "+nf(st.D,1)+" cm  ·  "+st.cls,r.x+r.w*0.5,r.y+r.h*0.93,{s:13,w:700,rtl:true,c:st.D>=2?C.power:C.ink}); },
  plot(st){ return {x:[0,5000],y:[0,Math.max(3,st.Dc(5000))*1.05],xl:"CAPE J/kg",yl:"قطر البرد cm",curves:[{f:st.Dc,c:"power"}],hl:[{y:2,c:"muted",t:"2 cm"},{y:5,c:"muted",t:"5 cm"}],dots:[{x:st.cape,y:st.D,c:"power"}]}; },
  ro(st){ return [["السرعة النظرية √(2·CAPE)",nf(st.wt,0)+" m/s"],["التيار الفعلي المقدّر",nf(st.w,0)+" m/s"],["بالعقدة",nf(st.w*KT,0)+" kt"],["قطر البرد",nf(st.D,1)+" cm"],["الفئة",st.cls]]; },
  eq:["w_max = √(2 CAPE)","w ≈ ε w_max","D = 3 ρ C_d w² / (4 ρ_i g)"],
  note:["كفاءة التيار ε واقعية بين 0.3 و0.6. البرد الفعلي أيضاً يذوب أثناء السقوط، ويعتمد حجمه على زمن بقائه في التيار.","تعتمد سياسة المسافة عن العواصف على إرشادات رسمية، وليس على هذه الحسبة."],
  quiz:[{q:"زيادة CAPE إلى أربعة أضعاف تضاعف سرعة التيار الصاعد:",o:["إلى الضعف تقريباً","أربع مرات","لا تغير"],a:0,why:"w ∝ √CAPE."},
        {q:"لماذا يحتاج البرد الأكبر تياراً أقوى؟",o:["لأن سرعة سقوطه النهائية أكبر","لأن الهواء أخف","لأنه أبرد"],a:0,why:"D ∝ w²."}],
  show:{ar:"اعرض رادار الطقس",fn:()=>lrnSel("wx_radar")},
  ref:"الموضوع: العواصف الرعدية والبرد (Thunderstorms and Hail)."
});
/* ---- 22 ---- */
LK("nav",{
  ar:"مدى الرؤية في الضباب: المحتوى المائي وعدد القطرات", en:"Fog visibility, liquid water and droplet number",
  alt:"أضواء مدرج تتناقص إضاءتها مع المسافة داخل الضباب، ومنحنى مدى الرؤية مع المحتوى المائي لأعداد مختلفة من القطرات",
  intro:["الضباب قطرات ماء معلقة تحجب الضوء. ضعف الضوء مع المسافة أسّي: I = I₀ e^(−σ d)، ومعامل التخميد σ يربط بمدى الرؤية بقانون كوشميدر: V = 3.912 / σ (حدّ التباين 2%). ويقدّر مدى الرؤية في الضباب بدلالة المحتوى المائي LWC وعدد القطرات N: V ≈ 1.002 / (LWC · N)^0.6473 كيلومتراً (LWC بـ g/m³ وN بـ cm⁻³).",
         "لنفس المحتوى المائي، ضباب بقطرات كثيرة صغيرة أضعف رؤية من ضباب بقطرات قليلة كبيرة. تعتمد فئات الهبوط على مدى الرؤية على المدرج RVR: فعندما ينقص عن نحو 550 م لا يُسمح بهبوط من الفئة الأولى."],
  ctl:[{k:"lwc",ar:"المحتوى المائي السائل",min:0.005,max:0.5,step:0.005,v:0.06,f:v=>nf(v,3)+" g/m³"},{k:"N",ar:"عدد القطرات",min:20,max:400,step:5,v:100,f:v=>nf(v,0)+" /cm³"}],
  pre:[{ar:"ضباب كثيف",set:{lwc:0.15,N:200}},{ar:"ضباب خفيف",set:{lwc:0.01,N:60}}],
  calc(st){ st.vf=(l,n)=>1.002/Math.pow(l*n,0.6473)*1000; st.V=st.vf(st.lwc,st.N); st.sg=3912/st.V; st.cat=st.V<75?"أقل من أدنى معايير الهبوط":st.V<200?"قريب من الفئة الثالثة":st.V<350?"الفئة الثانية/الثالثة":st.V<550?"الفئة الثانية":st.V<800?"الفئة الأولى بالحد الأدنى":"الفئة الأولى فما فوق"; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.08, x1=r.x+r.w*0.92, y=r.y+r.h*0.62, mx=1500; g.fillStyle=mixC(C.panel,C.struct,0.35); g.beginPath(); g.moveTo(x0,y+30); g.lineTo(x1,y-4); g.lineTo(x1,y+4); g.lineTo(x0,y+44); g.closePath(); g.fill();
    for(let i=0;i<30;i++){ const d=i*50+30, x=x0+(x1-x0)*(i/29), tr=Math.exp(-st.sg/1000*d), size=7-4*i/29; ldot(g,x,y+34-30*(i/29),size,"#f2c200",clamp(tr,0.03,1)); }
    for(let i=0;i<40;i++){ const x=x0+((i*79+st.t*6)%(x1-x0)), yy=r.y+r.h*0.2+((i*37)%100)/100*r.h*0.5, a=clamp(0.04+0.34*Math.min(1,st.sg/12),0.04,0.38); ldot(g,x,yy,9,mixC(C.panel,C.ink,0.22),a); }
    lplane(g,x0+22,r.y+r.h*0.28,0.1*(x1-x0)/0.9,3,C,{flip:true}); ltx(g,"مدى الرؤية ≈ "+nf(st.V,0)+" m",r.x+r.w*0.5,r.y+r.h*0.08,{s:16,w:700,rtl:true}); ltx(g,st.cat,r.x+r.w*0.5,r.y+r.h*0.92,{s:13,w:600,rtl:true,c:st.V<550?C.power:C.ink}); },
  plot(st){ return {x:[0.005,0.5],y:[20,20000],log:true,xl:"المحتوى المائي g/m³",yl:"مدى الرؤية m",curves:[{f:l=>st.vf(l,50),c:"hyd"},{f:l=>st.vf(l,100),c:"ctrl"},{f:l=>st.vf(l,300),c:"power"}],leg:[{c:"hyd",t:"N 50"},{c:"ctrl",t:"N 100"},{c:"power",t:"N 300"}],hl:[{y:550,c:"muted",t:"550 m"}],dots:[{x:st.lwc,y:st.V,c:"ink"}]}; },
  ro(st){ return [["مدى الرؤية",nf(st.V,0)+" m"],["معامل التخميد σ",nf(st.sg,2)+" /km"],["الفئة التقريبية",st.cat],["النسبة المتبقية بعد 300 m من الضوء",nf(Math.exp(-st.sg*0.3)*100,0)+" %"]]; },
  eq:["I = I₀ e^(−σ d)","V = 3.912 / σ","V ≈ 1.002 / (LWC · N)^0.6473   (km)"],
  note:["المعادلة التجريبية تقريبية للضباب. القياس الرسمي لمدى الرؤية يعتمد على أجهزة تقيس تخميد الضوء مباشرة.","تقارير RVR تؤخذ من مجسات على المدرج بدل الاعتماد على تقدير بصري."],
  quiz:[{q:"لنفس المحتوى المائي، زيادة عدد القطرات تجعل الرؤية:",o:["أسوأ","أفضل","كما هي"],a:0,why:"القطرات الأصغر تشتّت أكثر."},
        {q:"معامل تخميد σ = 7.8 /km يعطي مدى رؤية تقريباً:",o:["500 m","50 m","5 km"],a:0,why:"3.912 / 7.8 ≈ 0.5 km."}],
  ref:"الموضوع: الرؤية ومدى الرؤية على المدرج (Visibility and RVR)."
});
/* ---- 23 ---- */
LK("nav",{
  ar:"الارتفاع الضغطي والارتفاع الكثافي", en:"Pressure altitude and density altitude",
  alt:"ثلاثة أعمدة للارتفاع الحقيقي للمطار والارتفاع الضغطي والارتفاع الكثافي مع حرارة مرتفعة، ومنحنى الارتفاع الكثافي مع الحرارة",
  intro:["الارتفاع الضغطي PA هو الارتفاع في الجو القياسي الذي يعادل الضغط الحالي: PA ≈ ارتفاع المطار + 27 × (1013.25 − QNH) قدماً. والارتفاع الكثافي DA هو الارتفاع في الجو القياسي الذي تعادل كثافته الكثافة الحالية: DA ≈ PA + 118.8 × (T − T_ISA) قدماً، حيث T_ISA الحرارة القياسية عند PA.",
         "الأداء كله مرتبط بالكثافة، فمطار منخفض في يوم حار جداً يتصرف كأنه مطار مرتفع كثيراً: ينقص الدفع ويزداد طول الجري وتنقص سرعة الصعود. ولذلك يحسب الطيار DA قبل الإقلاع في الصيف الحار."],
  ctl:[{k:"qnh",ar:"الضغط عند مستوى البحر QNH",min:960,max:1050,step:1,v:1006,f:v=>nf(v,0)+" hPa"},{k:"el",ar:"ارتفاع المطار",min:0,max:8000,step:100,v:1500,f:v=>nf(v,0)+" ft"},{k:"T",ar:"حرارة الهواء",min:-30,max:55,step:1,v:38,f:v=>nf(v,0)+" °C"}],
  pre:[{ar:"يوم صيفي حار",set:{T:45,qnh:1004}},{ar:"يوم بارد عالي الضغط",set:{T:-10,qnh:1030}}],
  calc(st){ st.pa=st.el+27*(1013.25-st.qnh); st.ti=15-1.98*st.pa/1000; st.da=T=>st.pa+118.8*(T-st.ti); st.D=st.da(st.T); st.sg=isa(st.D*0.3048).rho/1.225; st.th=Math.pow(st.sg,0.8); st.dev=st.T-st.ti; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.12, w=r.w*0.76, gy=r.y+r.h*0.84, mx=Math.max(st.D,st.pa,st.el,3000)*1.1, Y=h=>gy-h/mx*r.h*0.66, bars=[[st.el,"المطار","muted"],[st.pa,"ضغطي","hyd"],[st.D,"كثافي","power"]]; bars.forEach(([h,t,c],i)=>{ const x=x0+i*w/3+10, bw=w/3-30; g.fillStyle=mixC(C.panel,KC(c,C),0.6); g.fillRect(x,Y(h),bw,gy-Y(h)); g.strokeStyle=C.ink; g.strokeRect(x,Y(h),bw,gy-Y(h)); ltx(g,nf(h,0)+" ft",x+bw/2,Y(h)-10,{s:12,w:700,m:true}); ltx(g,t,x+bw/2,gy+16,{s:12,rtl:true}); });
    lplane(g,x0+w*0.84,Y(st.D)-12,0.1*w,0,C); ltx(g,"كأن المطار على "+nf(st.D,0)+" ft",r.x+r.w*0.5,r.y+r.h*0.08,{s:14,w:700,rtl:true,c:st.D>st.el+1500?C.power:C.ink}); ltx(g,"كثافة "+nf(st.sg*100,0)+" % من القياسية · دفع ≈ "+nf(st.th*100,0)+" %",r.x+r.w*0.5,r.y+r.h*0.93,{s:12,rtl:true,c:C.muted}); },
  plot(st){ return {x:[-30,55],y:[Math.min(st.da(-30),0)-200,st.da(55)*1.05+100],xl:"حرارة الهواء °C",yl:"الارتفاع الكثافي ft",curves:[{f:st.da,c:"hyd"}],hl:[{y:st.pa,c:"muted",t:"الضغطي"}],dots:[{x:st.T,y:st.D,c:"power"}]}; },
  ro(st){ return [["الارتفاع الضغطي",nf(st.pa,0)+" ft"],["حرارة المعيار عندها",nf(st.ti,1)+" °C"],["انحراف الحرارة",nf(st.dev,1)+" °C"],["الارتفاع الكثافي",nf(st.D,0)+" ft"],["نسبة الكثافة σ",nf(st.sg,3)]]; },
  eq:["PA ≈ h_مطار + 27 (1013.25 − QNH)","T_ISA = 15 − 1.98 · PA / 1000","DA ≈ PA + 118.8 (T − T_ISA)"],
  note:["الصيغ خطية تقريبية صالحة بالقرب من الارتفاعات المعتادة. الحسابات الدقيقة تستخدم معادلة الجو القياسي مباشرة.","تقديرات الدفع التقريبية هنا تعتمد σ^0.8 وهي مبسطة."],
  quiz:[{q:"في يوم حار جداً يكون الارتفاع الكثافي:",o:["أعلى من ارتفاع المطار","أدنى","مساوياً"],a:0,why:"الهواء الأسخن أقل كثافة."},
        {q:"ماذا يعني DA عالٍ للإقلاع؟",o:["جري أطول وأداء صعود أقل","أداء أفضل","لا فرق"],a:0,why:"الكثافة أقل فالدفع والرفع أقل."}],
  ref:"الموضوع: الارتفاع الكثافي وأداء الطائرة (Density Altitude)."
});
/* ---- 24 ---- */
LK("nav",{
  ar:"تقارب خطوط الطول: لماذا يتغير الاتجاه على الدائرة العظمى؟", en:"Convergence of meridians along a great circle",
  alt:"إسقاط قطبي لخطوط الطول المتقاربة نحو القطب ومسار دائرة عظمى بين مدينتين مع سهمي الاتجاه الابتدائي والنهائي، ومنحنى التقارب مع فرق خط الطول",
  intro:["خطوط الطول تتقارب نحو القطب. عندما تطير على دائرة عظمى تقطع كل خط طول بزاوية مختلفة قليلاً عن السابق، فيتغير الاتجاه الحقيقي تدريجياً من البداية إلى النهاية. الفرق الكلي تقريباً يساوي التقارب Δλ · sin φ_m حيث φ_m متوسط خط العرض.",
         "عند خط الاستواء التقارب صفر، وعند خط عرض 60° يقارب 0.87 من Δλ. لذلك يذكر مخطط الرحلة اتجاهاً ابتدائياً ونهائياً مختلفين. الطائرات الحديثة تحسب ذلك آلياً عبر نقاط طريق متتابعة."],
  ctl:[{k:"p1",ar:"خط عرض المنطلق",min:0,max:75,step:0.5,v:51.5,f:v=>nf(v,1)+"°"},{k:"p2",ar:"خط عرض الوصول",min:0,max:75,step:0.5,v:40.6,f:v=>nf(v,1)+"°"},{k:"dl",ar:"فرق خط الطول (شرقاً)",min:10,max:150,step:1,v:74,f:v=>nf(v,0)+"°"}],
  pre:[{ar:"قريب من القطب",set:{p1:65,p2:60,dl:100}},{ar:"قرب الاستواء",set:{p1:10,p2:5,dl:60}}],
  calc(st){ const a=st.p1*D2R,b=st.p2*D2R,l=st.dl*D2R; st.c1=nvNorm(Math.atan2(Math.sin(l)*Math.cos(b),Math.cos(a)*Math.sin(b)-Math.sin(a)*Math.cos(b)*Math.cos(l))/D2R); st.c2=nvNorm(Math.atan2(-Math.sin(l)*Math.cos(a),Math.cos(b)*Math.sin(a)-Math.sin(b)*Math.cos(a)*Math.cos(l))/D2R+180); let d=st.c2-st.c1; if(d>180) d-=360; if(d<-180) d+=360; st.dc=d; st.cv=st.dl*Math.sin((st.p1+st.p2)/2*D2R); st.cf=l=>l*Math.sin((st.p1+st.p2)/2*D2R); const P1=[Math.cos(a),0,Math.sin(a)], P2=[Math.cos(b)*Math.cos(l),Math.cos(b)*Math.sin(l),Math.sin(b)], om=Math.acos(clamp(P1[0]*P2[0]+P1[1]*P2[1]+P1[2]*P2[2],-1,1)); st.pts=[]; for(let i=0;i<=40;i++){ const f=i/40, A=Math.sin((1-f)*om)/Math.sin(om||1), B=Math.sin(f*om)/Math.sin(om||1), v=[A*P1[0]+B*P2[0],A*P1[1]+B*P2[1],A*P1[2]+B*P2[2]]; st.pts.push([Math.atan2(v[1],v[0])/D2R,Math.asin(clamp(v[2],-1,1))/D2R]); } },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.6, R=Math.min(r.w*0.42,r.h*0.52), M=(la,lo)=>{ const rho=(90-la)/90*R, a=lo*D2R-Math.PI/2*0; return [cx+rho*Math.sin(a-st.dl*D2R*0.5),cy-rho*Math.cos(a-st.dl*D2R*0.5)]; };
    for(let lo=-90;lo<=st.dl+90;lo+=10){ lline(g,[M(90,lo),M(0,lo)],C.line,0.8,[2,4]); } for(let la=0;la<=80;la+=20){ const pts=[]; for(let lo=-70;lo<=st.dl+70;lo+=4) pts.push(M(la,lo)); lline(g,pts,C.line,0.8,[2,4]); ltx(g,la+"°",M(la,-70)[0]-8,M(la,-70)[1],{s:9,m:true,c:C.muted}); }
    lline(g,st.pts.map(p=>M(p[1],p[0])),C.power,2.6); const A=M(st.p1,0), B=M(st.p2,st.dl); ldot(g,A[0],A[1],6,C.ink); ldot(g,B[0],B[1],6,C.ink);
    const north=lo=>{ const t=(lo-st.dl*0.5)*D2R; return [-Math.sin(t),Math.cos(t)]; }, east=lo=>{ const t=(lo-st.dl*0.5)*D2R; return [Math.cos(t),Math.sin(t)]; }; const vec=(hd,lo)=>{ const n=north(lo), e=east(lo), a=hd*D2R; return [n[0]*Math.cos(a)+e[0]*Math.sin(a), n[1]*Math.cos(a)+e[1]*Math.sin(a)]; };
    const va=vec(st.c1,0), vb=vec(st.c2,st.dl); larrow(g,A[0],A[1],A[0]+va[0]*38,A[1]+va[1]*38,C.ctrl,2.6,9); larrow(g,B[0],B[1],B[0]+vb[0]*38,B[1]+vb[1]*38,C.hyd,2.6,9);
    ltx(g,"ابتدائي "+nf(st.c1,0)+"° ← نهائي "+nf(st.c2,0)+"°",r.x+r.w*0.5,r.y+r.h*0.06,{s:13,w:700,rtl:true}); ltx(g,"التغير "+nf(st.dc,1)+"°  ·  Δλ sin φm = "+nf(st.cv,1)+"°",r.x+r.w*0.5,r.y+r.h*0.94,{s:12,rtl:true,c:C.muted}); },
  plot(st){ return {x:[10,150],y:[0,Math.max(10,st.cf(150))*1.05],xl:"فرق خط الطول °",yl:"التقارب °",curves:[{f:st.cf,c:"hyd"}],dots:[{x:st.dl,y:Math.abs(st.dc),c:"power"}]}; },
  ro(st){ return [["الاتجاه الابتدائي",nf(st.c1,1)+"°"],["الاتجاه النهائي",nf(st.c2,1)+"°"],["التغير الكلي",nf(st.dc,1)+"°"],["التقريب Δλ sin φm",nf(st.cv,1)+"°"]]; },
  eq:["θ₁ = atan2( sin Δλ cos φ₂ ، cos φ₁ sin φ₂ − sin φ₁ cos φ₂ cos Δλ )","التقارب ≈ Δλ · sin φ_m","θ₂ = اتجاه النقطة الأولى من الثانية + 180°"],
  note:["الاتجاه الابتدائي والنهائي يتغيران، لكن زاوية قطع كل خط طول تتغير بالتقارب بينهما فقط على الدائرة العظمى.","على الخط المعيّن يبقى الاتجاه ثابتاً لكن المسافة أطول."],
  quiz:[{q:"عند خط الاستواء التقارب:",o:["صفر","كبير","90°"],a:0,why:"sin 0 = 0."},
        {q:"ما أثر زيادة فرق خط الطول على التغير في الاتجاه؟",o:["يزداد","يقل","لا يتغير"],a:0,why:"التقارب يتناسب مع Δλ."}],
  ref:"الموضوع: الملاحة على الدائرة العظمى (Great Circle Navigation)."
});
/* ---- 25 ---- */
LK("nav",{
  ar:"ضوء النهار والشفق: متى يشرق الفجر؟", en:"Day length, sunrise and twilight",
  alt:"قوس مسار الشمس فوق الأفق مع منطقة الشفق، ومنحنى طول النهار على مدار السنة لخط العرض المختار ولخط الاستواء",
  intro:["انحراف الشمس δ يتغير على مدار السنة بين +23.44° و−23.44°: δ ≈ 23.44° sin(360° (N − 81)/365). زاوية الساعة عند الشروق والغروب H₀ تحقق cos H₀ = (sin(−0.833°) − sin φ sin δ)/(cos φ cos δ)، فيكون طول النهار 2H₀/15 ساعة.",
         "الشفق المدني ينتهي حين تنخفض الشمس 6° تحت الأفق. تحتاج الرحلات الليلية وتأهيل الطاقم للطيران الليلي لمعرفة ساعات الظلام. وفي العرض العالي قد لا تغرب الشمس صيفاً (شمس منتصف الليل) أو لا تشرق شتاءً."],
  ctl:[{k:"lat",ar:"خط العرض",min:-70,max:70,step:1,v:33,f:v=>nf(v,0)+"°"},{k:"doy",ar:"اليوم من السنة",min:1,max:365,step:1,v:172,f:v=>nf(v,0)}],
  pre:[{ar:"الانقلاب الصيفي",set:{doy:172}},{ar:"الانقلاب الشتوي",set:{doy:355}},{ar:"الاعتدال",set:{doy:80}}],
  calc(st){ st.dl=d=>23.44*Math.sin(2*Math.PI*(d-81)/365); st.H=(la,d,h0)=>{ const p=la*D2R, de=st.dl(d)*D2R, c=(Math.sin(h0*D2R)-Math.sin(p)*Math.sin(de))/(Math.cos(p)*Math.cos(de)); return c>=1?0:c<=-1?180:Math.acos(c)/D2R; }; st.de=st.dl(st.doy); st.h0=st.H(st.lat,st.doy,-0.833); st.h6=st.H(st.lat,st.doy,-6); st.len=2*st.h0/15; st.sr=12-st.h0/15; st.ss=12+st.h0/15; st.tw=(st.h6-st.h0)/15; st.lf=(la)=>d=>2*st.H(la,d,-0.833)/15; st.alt=h=>{ const p=st.lat*D2R, de=st.de*D2R; return Math.asin(Math.sin(p)*Math.sin(de)+Math.cos(p)*Math.cos(de)*Math.cos(h*D2R))/D2R; }; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.08, x1=r.x+r.w*0.92, gy=r.y+r.h*0.62, W=x1-x0, X=hr=>x0+W*hr/24, Y=a=>gy-a/90*r.h*0.5; g.fillStyle=mixC(C.panel,C.ink,0.18); g.fillRect(x0,gy,W,r.h*0.3); const tw=mixC(C.panel,C.ctrl,0.18); g.fillStyle=tw; g.fillRect(X(st.sr-st.tw),Y(0)-2,X(st.sr)-X(st.sr-st.tw),r.h*0.3); g.fillRect(X(st.ss),Y(0)-2,X(st.ss+st.tw)-X(st.ss),r.h*0.3);
    const pts=[]; for(let hr=0;hr<=24;hr+=0.25) pts.push([X(hr),Y(st.alt((hr-12)*15))]); g.save(); g.beginPath(); g.rect(x0,r.y,W,gy-r.y); g.clip(); lline(g,pts,C.power,2.4); g.restore(); lline(g,[[x0,gy],[x1,gy]],C.ink,2);
    const hr=(st.t*1.2)%24, sa=st.alt((hr-12)*15); if(sa>=-6){ ldot(g,X(hr),Y(Math.max(sa,-3)),9,"#f2b900"); }
    if(st.h0>0&&st.h0<180){ [st.sr,st.ss].forEach((v,i)=>{ lline(g,[[X(v),gy-8],[X(v),gy+8]],C.ink,2); ltx(g,nf(Math.floor(v),0)+":"+String(Math.round((v%1)*60)).padStart(2,"0"),X(v),gy+24,{s:12,w:700,m:true}); }); }
    ltx(g,st.h0===0?"ليل قطبي: لا شروق":st.h0>=180?"شمس منتصف الليل":"طول النهار "+nf(st.len,1)+" h  ·  شفق مدني "+nf(st.tw*60,0)+" min",r.x+r.w*0.5,r.y+r.h*0.1,{s:14,w:700,rtl:true}); ltx(g,"الوقت الشمسي المحلي ؛ انحراف الشمس "+nf(st.de,1)+"°",r.x+r.w*0.5,r.y+r.h*0.92,{s:11,rtl:true,c:C.muted}); },
  plot(st){ return {x:[1,365],y:[0,24],xl:"اليوم من السنة",yl:"طول النهار h",curves:[{f:st.lf(st.lat),c:"power",n:200},{f:st.lf(0),c:"muted",dash:[4,4],n:200}],leg:[{c:"power",t:"خط العرض الحالي"},{c:"muted",t:"الاستواء",dash:[4,4]}],dots:[{x:st.doy,y:st.len,c:"power"}]}; },
  ro(st){ return [["انحراف الشمس",nf(st.de,1)+"°"],["طول النهار",nf(st.len,2)+" h"],["الشروق (شمسي)",nf(st.sr,2)+" h"],["الغروب (شمسي)",nf(st.ss,2)+" h"],["الشفق المدني",nf(st.tw*60,0)+" min"]]; },
  eq:["δ ≈ 23.44° sin( 360° (N − 81) / 365 )","cos H₀ = ( sin(−0.833°) − sin φ sin δ ) / ( cos φ cos δ )","طول النهار = 2 H₀ / 15"],
  note:["الأوقات بالتوقيت الشمسي المحلي، ولا تشمل معادلة الزمن ولا فرق التوقيت. الحسابات للطيران الدقيقة تستخدم جداول فلكية.","الفترة بين الغروب والشفق المدني مهمة لتحديد 'الليل' في قواعد الطيران."],
  quiz:[{q:"أطول يوم في نصف الكرة الشمالي عند:",o:["الانقلاب الصيفي","الاعتدال","الانقلاب الشتوي"],a:0,why:"انحراف الشمس أقصى."},
        {q:"عند خط الاستواء طول النهار:",o:["12 ساعة تقريباً طوال السنة","يتغير كثيراً","24 ساعة"],a:0,why:"تأثير الانحراف صغير."}],
  ref:"الموضوع: الفلك الملاحي (Celestial Navigation Basics)."
});
/* ---- 26 ---- */
LK("nav",{
  ar:"فرق التوقيت ووقت الوصول المحلي", en:"Time zones and local arrival time",
  alt:"ساعتان لمدينتي الانطلاق والوصول بفرق التوقيت، وطائرة بينهما، ومنحنى وقت الوصول المحلي مع مدة الرحلة",
  intro:["الجداول تذكر الأوقات المحلية، لكن الطيران يعمل بالتوقيت العالمي UTC. لتحويل وقت الإقلاع المحلي إلى UTC نطرح فرق التوقيت للمنطلق، ثم نضيف زمن الرحلة، ثم نضيف فرق التوقيت للوجهة: وصول محلي = إقلاع محلي − O_منطلق + زمن الرحلة + O_وجهة.",
         "إن تجاوز الناتج 24 ساعة فالوصول في اليوم التالي، وإن نقص عن صفر ففي اليوم السابق (عبور خط التاريخ). تفيد هذه الحسابات في ترتيب الطاقم والصيانة، ومعرفة فرق الإيقاع البيولوجي: يحتاج الجسم نحو يوم لكل ساعة فرق."],
  ctl:[{k:"od",ar:"فرق توقيت المنطلق عن UTC",min:-12,max:14,step:0.5,v:3,f:v=>"UTC"+(v>=0?"+":"")+nf(v,1)},{k:"oa",ar:"فرق توقيت الوجهة عن UTC",min:-12,max:14,step:0.5,v:-5,f:v=>"UTC"+(v>=0?"+":"")+nf(v,1)},{k:"dp",ar:"إقلاع محلي",min:0,max:24,step:0.25,v:22.5,f:v=>fmtHM(v)},{k:"bt",ar:"زمن الرحلة",min:1,max:18,step:0.25,v:9.75,f:v=>nf(v,2)+" h"}],
  calc(st){ st.utc=st.dp-st.od; st.au=st.utc+st.bt; st.al=st.au+st.oa; st.dd=Math.floor(st.al/24); st.am=((st.al%24)+24)%24; st.diff=st.oa-st.od; st.af=b=>((st.dp-st.od+b+st.oa)%24+24)%24; },
  scene(g,r,st,C){ const clk=(cx,cy,R,hr,c,t,off)=>{ g.strokeStyle=C.ink; g.lineWidth=1.6; g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.stroke(); for(let i=0;i<12;i++){ const a=i*Math.PI/6; lline(g,[[cx+Math.sin(a)*R*0.88,cy-Math.cos(a)*R*0.88],[cx+Math.sin(a)*R*0.98,cy-Math.cos(a)*R*0.98]],C.muted,1.2); } const h=((hr%24)+24)%24, ah=(h%12)/12*Math.PI*2, am=(h%1)*Math.PI*2; lline(g,[[cx,cy],[cx+Math.sin(ah)*R*0.5,cy-Math.cos(ah)*R*0.5]],C.ink,3); lline(g,[[cx,cy],[cx+Math.sin(am)*R*0.78,cy-Math.cos(am)*R*0.78]],c,2); ltx(g,t,cx,cy+R+18,{s:12,w:700,rtl:true}); ltx(g,fmtHM(h)+(h>=12?" م":" ص"),cx,cy+R+36,{s:12,m:true,c:C.muted}); ltx(g,"UTC"+(off>=0?"+":"")+nf(off,1),cx,cy-R-10,{s:10,m:true,c:C.muted}); };
    const R=Math.min(r.w*0.14,r.h*0.24), cy=r.y+r.h*0.4; clk(r.x+r.w*0.16,cy,R,st.dp,C.hyd,"الإقلاع",st.od); clk(r.x+r.w*0.84,cy,R,st.am,C.power,"الوصول",st.oa); const f=(st.t*0.12)%1; lline(g,[[r.x+r.w*0.3,cy],[r.x+r.w*0.7,cy]],C.line,1.4,[5,4]); lplane(g,r.x+r.w*(0.3+0.4*f),cy-4,0.1*r.w,0,C,{flip:true});
    ltx(g,"الوصول: "+fmtHM(st.am)+(st.dd>0?"  (اليوم +"+st.dd+")":st.dd<0?"  (اليوم "+st.dd+")":"  (نفس اليوم)"),r.x+r.w*0.5,r.y+r.h*0.08,{s:14,w:700,rtl:true}); ltx(g,"فرق التوقيت "+(st.diff>=0?"+":"")+nf(st.diff,1)+" h  ·  بـ UTC: إقلاع "+fmtHM(((st.utc%24)+24)%24),r.x+r.w*0.5,r.y+r.h*0.93,{s:12,rtl:true,c:C.muted}); },
  plot(st){ const L=[]; let prev=0, pts=[]; for(let b=1;b<=18.001;b+=0.1){ const v=st.af(b); if(pts.length&&Math.abs(v-prev)>12){ L.push({pts,c:"hyd",w:2.2}); pts=[]; } pts.push([b,v]); prev=v; } if(pts.length) L.push({pts,c:"hyd",w:2.2}); return {x:[1,18],y:[0,24],xl:"زمن الرحلة h",yl:"الوصول المحلي h",lines:L,dots:[{x:st.bt,y:st.am,c:"power"}]}; },
  ro(st){ return [["وقت الإقلاع بـ UTC",fmtHM(((st.utc%24)+24)%24)],["وقت الوصول بـ UTC",fmtHM(((st.au%24)+24)%24)],["الوصول المحلي",fmtHM(st.am)],["اليوم",st.dd>0?"+"+st.dd:st.dd<0?""+st.dd:"نفسه"],["فرق التوقيت",(st.diff>=0?"+":"")+nf(st.diff,1)+" h"]]; },
  eq:["UTC = محلي − O","وصول محلي = إقلاع محلي − O_م + زمن الرحلة + O_و","اليوم = ⌊ وصول / 24 ⌋"],
  note:["بعض المناطق تعتمد توقيتاً صيفياً يغيّر O خلال السنة. وفروق نصف الساعة وربعها موجودة (مثل +5.5 و+5.75).","تعتمد جداول الطيران على UTC لتجنب اللبس في الأيام والمواعيد."],
  quiz:[{q:"طائرة تقلع 22:30 محلياً بفرق UTC+3، وتطير 9.75 ساعة إلى مدينة بفرق UTC−5. وقت الوصول المحلي:",o:["00:15 في اليوم التالي","17:15 في اليوم نفسه","22:30 في اليوم نفسه"],a:0,why:"22.5 − 3 + 9.75 − 5 = 24.25 ساعة، أي 00:15 من اليوم التالي."},
        {q:"لماذا يستخدم الطيران UTC؟",o:["يوحّد الأوقات بين المناطق","لأنه أسرع","لأنه محلي"],a:0,why:"يتجنب اللبس."}],
  ref:"الموضوع: التوقيت العالمي وفروق المناطق (Time Zones and UTC)."
});
function fmtHM(h){ const x=((h%24)+24)%24, m=Math.round(x*60), hh=Math.floor(m/60)%24, mm=m%60; return String(hh).padStart(2,"0")+":"+String(mm).padStart(2,"0"); }
/* ---- 27 ---- */
LK("nav",{
  ar:"موجات الجبال: طول الموجة وشدة التيار الرأسي", en:"Mountain waves and rotor turbulence",
  alt:"ريح تعبر جبلاً فتتكون موجات في الهواء المستقر خلفه، ومنحنى سرعة التيار الرأسي مع سرعة الريح",
  intro:["عندما تعبر ريح قوية جبلاً في هواء مستقر يتذبذب الهواء خلفه موجياً بطول موجة λ = 2πU / N، حيث U سرعة الريح وN تردد برونت–فيسالا الذي يقيس الاستقرار: N² = (g/T)(Γ_d − Γ). كلما قلّ معدل انخفاض الحرارة Γ (جو أكثر استقراراً) كبر N وقصرت الموجة.",
         "سعة الموجة تكون أكبر حين يتوافق طول الموجة مع عرض الجبل (k a ≈ 1)، وسرعة التيار الرأسي تقارب w = N · A. تتراوح الموجات المتطورة بين تيار صاعد وهابط مئات الأقدام في الدقيقة، وتتكون تحتها دوارات (rotors) شديدة الاضطراب قرب الأرض. لذلك يُتجنب الطيران خلف الجبال في ريح قوية."],
  ctl:[{k:"U",ar:"سرعة الريح عبر الجبل",min:5,max:40,step:1,v:18,f:v=>nf(v,0)+" m/s"},{k:"G",ar:"معدل انخفاض الحرارة",min:0,max:9,step:0.2,v:5,f:v=>nf(v,1)+" °C/km"},{k:"H",ar:"ارتفاع الجبل",min:300,max:3000,step:50,v:1200,f:v=>nf(v,0)+" m"},{k:"a",ar:"نصف عرض الجبل",min:1,max:15,step:0.5,v:5,f:v=>nf(v,1)+" km"}],
  pre:[{ar:"جو شديد الاستقرار",set:{G:2,U:22}},{ar:"ريح ضعيفة",set:{U:8}}],
  calc(st){ const calc=(U,G)=>{ const N2=G9/270*(9.8-G)/1000, N=Math.sqrt(Math.max(N2,1e-8)), lam=2*Math.PI*U/N, q=lam/(2*Math.PI*st.a*1000), f=1/(1+Math.pow(Math.log(q)/0.8,2)), A=0.5*st.H*f; return {N,lam,f,A,w:N*A}; }; const G9=9.81; st.mw=U=>calc(U,st.G).w; st.o=calc(st.U,st.G); st.w=st.o.w; st.fpm=st.w*196.85; st.sev=st.w<1?"ضعيف":st.w<3?"متوسط":st.w<5?"شديد":"شديد جداً"; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.04, x1=r.x+r.w*0.96, gy=r.y+r.h*0.82, W=x1-x0, lamPx=clamp(st.o.lam/1000/60*W,30,W*0.6), A=clamp(st.o.A/1500*r.h*0.18,3,r.h*0.2), mx=x0+W*0.28, hm=st.H/3000*r.h*0.34;
    g.fillStyle=mixC(C.panel,C.struct,0.5); g.beginPath(); g.moveTo(x0,gy); for(let x=x0;x<=x1;x+=4){ const d=(x-mx)/(st.a*5.5); g.lineTo(x,gy-hm*Math.exp(-d*d)); } g.lineTo(x1,gy); g.closePath(); g.fill();
    for(let k=1;k<=5;k++){ const y0=gy-r.h*0.16*k, pts=[]; for(let x=x0;x<=x1;x+=4){ const d=(x-mx)/(st.a*5.5), env=Math.exp(-d*d*0.15), wave=x>mx?Math.sin((x-mx)/lamPx*2*Math.PI-st.t*1.4)*A*(1-k*0.1):0; pts.push([x,y0-hm*Math.exp(-d*d)*(1-k*0.15)+wave]); } lline(g,pts,C.hyd,1.4); }
    const rx=mx+lamPx*0.75, ry=gy-r.h*0.05; for(let i=0;i<3;i++){ g.strokeStyle=C.power; g.lineWidth=1.4; g.beginPath(); g.arc(rx,ry,10+i*8,st.t*2,st.t*2+Math.PI*1.6); g.stroke(); } ltx(g,"دوّار",rx,ry-34,{s:11,rtl:true,c:C.power});
    ltx(g,"λ = "+nf(st.o.lam/1000,1)+" km  ·  w ≈ "+nf(st.w,1)+" m/s ("+nf(st.fpm,0)+" ft/min)",r.x+r.w*0.5,r.y+r.h*0.07,{s:13,w:700,rtl:true}); ltx(g,"الاضطراب "+st.sev,r.x+r.w*0.5,r.y+r.h*0.93,{s:13,w:700,rtl:true,c:st.w>=3?C.power:C.ink}); },
  plot(st){ return {x:[5,40],y:[0,Math.max(8,st.mw(40))*1.05],xl:"سرعة الريح m/s",yl:"التيار الرأسي m/s",curves:[{f:st.mw,c:"hyd"}],hl:[{y:3,c:"muted",t:"متوسط"},{y:5,c:"power",t:"شديد"}],dots:[{x:st.U,y:st.w,c:st.w>=3?"power":"hyd"}]}; },
  ro(st){ return [["N (تردد برونت)",nf(st.o.N,4)+" s⁻¹"],["طول الموجة",nf(st.o.lam/1000,1)+" km"],["عامل الرنين",nf(st.o.f,2)],["سعة الموجة",nf(st.o.A,0)+" m"],["التيار الرأسي",nf(st.w,1)+" m/s"],["الشدة",st.sev]]; },
  eq:["N² = (g / T)(Γ_d − Γ)","λ = 2π U / N","w ≈ N · A  ،  A = ½ H f(λ/2πa)"],
  note:["النموذج يقرب موجة جبلية ثابتة بمعامل رنين تجريبي؛ الأمواج الفعلية تتأثر بتغير الريح مع الارتفاع وبتضاريس معقدة.","علامات الموجات: غيوم عدسية، ورياح سطحية متغيرة قرب المطارات الجبلية."],
  quiz:[{q:"جو أكثر استقراراً (Γ أصغر) يعطي موجة:",o:["أقصر","أطول","لا يتغير"],a:0,why:"N أكبر فتقل λ."},
        {q:"ريح أقوى مع جو ثابت تجعل طول الموجة:",o:["أطول","أقصر","كما هو"],a:0,why:"λ ∝ U."}],
  ref:"الموضوع: الموجات الجبلية والاضطراب (Mountain Waves)."
});
