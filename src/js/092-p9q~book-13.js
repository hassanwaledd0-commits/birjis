/* ---------- Book 13: Navigation and Meteorology (2/3): radar, ground speed, turns, terrain, weather ---------- */
/* ---- 10 ---- */
LK("nav",{
  ar:"رادار الطقس: ارتفاع الشعاع وانحناء الأرض", en:"Weather radar beam height and tilt",
  alt:"طائرة ترسل شعاع رادار مائلاً عبر السماء فوق أرض منحنية نحو عاصفة، ومنحنى ارتفاع الشعاع مع المدى مقابل ارتفاع قمة العاصفة",
  intro:["شعاع رادار الطقس مخروطي ضيق (عرضه 3° إلى 5° تقريباً). في الخط المستقيم يرتفع الشعاع مع المدى بحسب ميل الهوائي θ: الارتفاع ≈ r tan θ. لكن الأرض تنحني تحته، فيرتفع الشعاع عنها أكثر: H(r) = h_طائرة + r tan θ − r² / (2 R_eff). مع نصف قطر فعلي R_eff = 4/3 R.",
         "لذلك إذا لم يعدّل الطيار الميل قد يمر الشعاع فوق قمة عاصفة بعيدة أو تحتها. ويؤثر ارتفاع الشعاع أيضاً على ما تراه: الجزء الأعلى من العاصفة جليدي أقل انعكاساً، والمنخفض يظهر عند ارتفاع منخفض. ولهذا يغيّر الطاقم الميل بحسب المدى."],
  ctl:[{k:"tl",ar:"ميل الهوائي",min:-5,max:10,step:0.5,v:1,f:v=>nf(v,1)+"°"},{k:"bw",ar:"عرض الشعاع",min:2.5,max:6,step:0.1,v:3.5,f:v=>nf(v,1)+"°"},{k:"ha",ar:"ارتفاع الطائرة",min:5000,max:42000,step:1000,v:35000,f:v=>nf(v,0)+" ft"},{k:"rs",ar:"مدى العاصفة",min:20,max:250,step:5,v:90,f:v=>nf(v,0)+" NM"},{k:"ht",ar:"قمة العاصفة",min:20000,max:65000,step:1000,v:45000,f:v=>nf(v,0)+" ft"}],
  pre:[{ar:"ميل لأسفل للعاصفة القريبة",set:{tl:-3,rs:40}},{ar:"عاصفة بعيدة",set:{rs:200,tl:2}}],
  calc(st){ const Re=4/3*3440.065; st.hb=(r,a)=>st.ha+r*6076*Math.tan(a*D2R)-r*r/(2*Re)*6076; st.hc=r=>st.hb(r,st.tl); st.hl=r=>st.hb(r,st.tl-st.bw/2); st.hh=r=>st.hb(r,st.tl+st.bw/2); st.c=st.hc(st.rs); st.lo=st.hl(st.rs); st.hi=st.hh(st.rs); const a=Math.max(2000,st.lo), b=Math.min(st.ht,st.hi); st.cov=b>a?(b-a)/(st.ht-2000)*100:0; st.stat=st.lo>st.ht?"الشعاع فوق القمة":st.hi<2000?"الشعاع تحت العاصفة":st.cov<40?"يرى جزءاً صغيراً":"يرى معظم العاصفة"; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.08, x1=r.x+r.w*0.94, gy=r.y+r.h*0.84, mx=250, X=d=>x0+(x1-x0)*d/mx, Y=h=>gy-h/65000*r.h*0.7-(0); const gd=d=>Y(Math.max(0,0)+0)+(d*d)/(2*4586.75)*6076/65000*r.h*0.7;
    g.fillStyle=mixC(C.panel,C.struct,0.35); g.beginPath(); g.moveTo(x0,gy); for(let d=0;d<=mx;d+=10) g.lineTo(X(d),gy+(d*d)/(2*4586.75)*6076/65000*r.h*0.7); g.lineTo(x1,r.y+r.h); g.lineTo(x0,r.y+r.h); g.closePath(); g.fill();
    const H=(f,d)=>Y(f(d))+(d*d)/(2*4586.75)*6076/65000*r.h*0.7*0; g.fillStyle=mixC(C.panel,C.hyd,0.2); g.beginPath(); g.moveTo(X(0),Y(st.ha)); for(let d=0;d<=mx;d+=10) g.lineTo(X(d),Y(st.hh(d))); for(let d=mx;d>=0;d-=10) g.lineTo(X(d),Y(st.hl(d))); g.closePath(); g.fill(); lline(g,Array.from({length:26},(_,i)=>[X(i*10),Y(st.hc(i*10))]),C.hyd,1.6,[5,3]);
    const sx=X(st.rs); g.fillStyle=mixC(C.panel,C.power,0.55); g.fillRect(sx-9,Y(st.ht),18,gy+(st.rs*st.rs)/(2*4586.75)*6076/65000*r.h*0.7-Y(st.ht)); ltx(g,"عاصفة",sx,Y(st.ht)-10,{s:11,rtl:true,c:C.power}); lplane(g,X(0)+14,Y(st.ha),0.08*(x1-x0)/0.9,0,C,{flip:true});
    ltx(g,st.stat,r.x+r.w*0.5,r.y+r.h*0.07,{s:14,w:700,rtl:true,c:st.cov<40?C.power:C.ink}); ltx(g,"الشعاع عند العاصفة من "+nf(st.lo,0)+" إلى "+nf(st.hi,0)+" ft",r.x+r.w*0.5,r.y+r.h*0.94,{s:11,rtl:true,c:C.muted}); },
  plot(st){ return {x:[0,250],y:[0,65000],xl:"المدى NM",yl:"الارتفاع فوق الأرض ft",curves:[{f:st.hc,c:"hyd"},{f:st.hh,c:"muted",dash:[4,3]},{f:st.hl,c:"muted",dash:[4,3]}],hl:[{y:st.ht,c:"power",t:"قمة العاصفة"}],vl:[{x:st.rs,c:"muted",t:"العاصفة"}],dots:[{x:st.rs,y:st.c,c:"hyd"}]}; },
  ro(st){ return [["مركز الشعاع عند العاصفة",nf(st.c,0)+" ft"],["الحد الأدنى",nf(st.lo,0)+" ft"],["الحد الأعلى",nf(st.hi,0)+" ft"],["نسبة التغطية",nf(st.cov,0)+" %"],["الحالة",st.stat]]; },
  eq:["H(r) = h + r tan θ − r² / (2 R_eff)","R_eff = 4/3 R","الحدّان: θ ± BW/2"],
  note:["الحسابات بوحدات الميل البحري والقدم. النموذج يتجاهل التشتت وانكسار الشعاع الدقيق وتخميد الإشارة بالمطر.","تقدّر الطواقم الارتفاع بتغيير الميل ورؤية تغيّر الصورة، ولا يُعتمد على تصوير واحد."],
  quiz:[{q:"لعاصفة بعيدة جداً، لماذا قد يتجاوز الشعاع قمتها؟",o:["لأن الأرض تنحني فيرتفع الشعاع عنها","لأن الرادار يضعف","لأن العاصفة تهبط"],a:0,why:"الارتفاع فوق الأرض يزيد بالمدى وبانحناء الأرض."},
        {q:"لرؤية الجزء السفلي من عاصفة قريبة نحتاج:",o:["ميلاً لأسفل","ميلاً لأعلى","لا تغيير"],a:0,why:"نخفض الشعاع نحو قاعدة الخلية."}],
  show:{ar:"اعرض رادار الطقس",fn:()=>lrnSel("wx_radar")},
  ref:"الموضوع: رادار الطقس المحمول جواً (Airborne Weather Radar)."
});
/* ---- 11 ---- */
LK("nav",{
  ar:"أثر دوبلر وسرعة نايكويست", en:"Doppler shift and the Nyquist velocity",
  alt:"رادار يرسل نحو سحابة تتحرك جزيئاتها نحو الرادار وبعيداً عنه، ومنحنى السرعة المقاسة مع الحقيقية يظهر الالتفاف عند حد نايكويست",
  intro:["حين يتحرك الهدف نحو الرادار بسرعة شعاعية v يتغير تردد الإشارة المنعكسة بمقدار f_d = 2 v / λ (التغير مضاعف لأنه يحدث في الذهاب والإياب). هذا يسمح للرادار الدوبلري بقياس سرعة الرياح داخل العاصفة، وكشف الاضطراب والقص.",
         "لكن الرادار ينبض بمعدل PRF، فيقيس طور الإشارة مرة لكل نبضة، فلا يميّز سرعة أكبر من V_Ny = λ · PRF / 4. فوقها 'تلتف' القراءة وتظهر بإشارة معاكسة. زيادة PRF ترفع حد السرعة لكنها تقلل أقصى مدى لا لبس فيه R_u = c/(2 PRF)."],
  ctl:[{k:"f0",ar:"تردد الرادار",min:3,max:10,step:0.1,v:9.3,f:v=>nf(v,1)+" GHz"},{k:"v",ar:"السرعة الشعاعية",min:-40,max:40,step:0.5,v:12,f:v=>nf(v,1)+" m/s"},{k:"prf",ar:"معدل النبضات PRF",min:300,max:4000,step:50,v:2000,f:v=>nf(v,0)+" Hz"}],
  pre:[{ar:"سرعة كبيرة",set:{v:30,prf:1000}},{ar:"PRF عالٍ",set:{v:30,prf:3500}}],
  calc(st){ st.lam=3e8/(st.f0*1e9); st.fd=2*st.v/st.lam; st.vn=st.lam*st.prf/4; st.ru=3e8/(2*st.prf)/1000; st.meas=u=>((u+st.vn)%(2*st.vn)+2*st.vn)%(2*st.vn)-st.vn; st.vm=st.meas(st.v); st.al=Math.abs(st.v)>st.vn; },
  scene(g,r,st,C){ const rx=r.x+r.w*0.12, y=r.y+r.h*0.46; g.fillStyle=mixC(C.panel,C.ink,0.6); g.beginPath(); g.arc(rx,y,10,-Math.PI/2,Math.PI/2); g.fill(); g.strokeStyle=C.ink; g.stroke(); const cx=r.x+r.w*0.68, cw=r.w*0.28; g.fillStyle=mixC(C.panel,C.hyd,0.2); [[0,-0.08,0.12],[0.15,0.02,0.14],[-0.12,0.1,0.12],[0.1,-0.12,0.1]].forEach(([dx,dy,rr])=>{ g.beginPath(); g.arc(cx+dx*cw,y+dy*r.h*0.9,rr*cw,0,Math.PI*2); g.fill(); });
    for(let i=0;i<6;i++){ const f=(st.t*0.4+i/6)%1; ldot(g,rx+10+(cx-cw*0.3-rx)*f,y+Math.sin(i*2+f*6)*4,2.5,C.muted,1-f*0.6); }
    const col=st.v>0?C.power:C.hyd, L=14+Math.min(60,Math.abs(st.v)*2); [-0.15,0,0.15].forEach(dy=>larrow(g,cx,y+dy*r.h,cx+(st.v>0?-L:L),y+dy*r.h,col,2.4,8)); ltx(g,st.v>0?"نحو الرادار":st.v<0?"بعيداً عن الرادار":"ثابت",cx,y+r.h*0.3,{s:12,w:600,rtl:true,c:col});
    ltx(g,"f_d = "+nf(st.fd,0)+" Hz",r.x+r.w*0.5,r.y+r.h*0.08,{s:14,w:700,m:true}); ltx(g,st.al?"التفاف: المقيس "+nf(st.vm,1)+" m/s":"V_Ny = "+nf(st.vn,1)+" m/s: لا التفاف",r.x+r.w*0.5,r.y+r.h*0.92,{s:13,w:700,rtl:true,c:st.al?C.power:C.hyd}); },
  plot(st){ const L=[], m=Math.max(40,st.vn*3.2); for(let k=-4;k<=4;k++){ const a=Math.max(-m,(2*k-1)*st.vn), b=Math.min(m,(2*k+1)*st.vn); if(a<b) L.push({pts:[[a,a-2*k*st.vn],[b,b-2*k*st.vn]],c:"hyd",w:2.2}); } return {x:[-m,m],y:[-st.vn*1.15,st.vn*1.15],xl:"السرعة الحقيقية m/s",yl:"المقيسة m/s",lines:L,hl:[{y:st.vn,c:"power",t:"V_Ny"},{y:-st.vn,c:"power",t:""}],dots:[{x:st.v,y:st.vm,c:st.al?"power":"hyd"}]}; },
  ro(st){ return [["الطول الموجي",nf(st.lam*100,2)+" cm"],["الإزاحة الترددية",nf(st.fd,0)+" Hz"],["سرعة نايكويست",nf(st.vn,1)+" m/s"],["أقصى مدى بلا لبس",nf(st.ru,0)+" km"],["السرعة المقيسة",nf(st.vm,1)+" m/s"]]; },
  eq:["λ = c / f₀","f_d = 2 v / λ","V_Ny = λ · PRF / 4","R_u = c / (2 PRF)"],
  note:["السرعة الموجبة هنا نحو الرادار. الأنظمة الحديثة تستخدم أكثر من PRF معاً لحل اللبس وتوسيع الحدود.","رادار الطقس المحمول جواً يقيس غالباً ثلاث أشياء: شدة الانعكاس والسرعة الشعاعية وتباين السرعة (الاضطراب)."],
  quiz:[{q:"زيادة PRF مع بقاء كل شيء ثابت:",o:["ترفع V_Ny وتقصر R_u","تخفض V_Ny","لا تغير شيئاً"],a:0,why:"V_Ny ∝ PRF بينما R_u ∝ 1/PRF."},
        {q:"لماذا يتضاعف الإزاحة الترددية؟",o:["لأن الحركة تؤثر في الذهاب والإياب","لأن التردد مضاعف","لأن الرادار يدور"],a:0,why:"f_d = 2 v / λ."}],
  ref:"الموضوع: رادار دوبلر (Doppler Radar)."
});
/* ---- 12 ---- */
LK("nav",{
  ar:"استنتاج السرعة الأرضية والريح من زمن العبور", en:"Ground speed and wind from fix timing",
  alt:"طائرة تمر بنقطتين على مسار وتقدّر السرعة الأرضية من الزمن بينهما، ومنحنى السرعة الأرضية مع زمن العبور",
  intro:["أبسط طريقة لقياس السرعة الأرضية بلا أجهزة: نقيس الزمن بين نقطتين معروفتي المسافة. السرعة الأرضية G = 60 d / t (d بالميل، t بالدقيقة). بمقارنتها بالسرعة الحقيقية نستنتج مركبة الريح: مركبة أمامية = TAS − G.",
         "ثم نقدّر زمن الوصول للنقطة التالية من المسافة المتبقية: ETA = المسافة ÷ G. يتأثر هذا بدقة القياس: خطأ ثوانٍ قليلة في الزمن بين النقطتين قد يعطي خطأ بعشرات العقد إذا كان الزمن قصيراً، لذلك تفضّل نقاط متباعدة نسبياً."],
  ctl:[{k:"tas",ar:"السرعة الحقيقية",min:200,max:520,step:5,v:440,f:v=>nf(v,0)+" kt"},{k:"d",ar:"المسافة بين النقطتين",min:20,max:150,step:5,v:60,f:v=>nf(v,0)+" NM"},{k:"tm",ar:"زمن العبور",min:3,max:25,step:0.1,v:8.5,f:v=>nf(v,1)+" min"},{k:"rem",ar:"المسافة المتبقية",min:50,max:1500,step:10,v:300,f:v=>nf(v,0)+" NM"},{k:"ds",ar:"خطأ القياس",min:0,max:30,step:1,v:6,f:v=>nf(v,0)+" s"}],
  pre:[{ar:"زمن قصير",set:{d:20,tm:3}},{ar:"نقاط متباعدة",set:{d:120,tm:17}}],
  calc(st){ st.gs=60*st.d/st.tm; st.wc=st.tas-st.gs; st.eta=st.rem/st.gs*60; st.gf=t=>60*st.d/t; st.g1=60*st.d/(st.tm-st.ds/60); st.g2=60*st.d/(st.tm+st.ds/60); st.sen=(st.g1-st.g2)/2; st.dEta=st.rem/st.g2*60-st.rem/st.g1*60; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.1, x1=r.x+r.w*0.9, y=r.y+r.h*0.48, a=x0+(x1-x0)*0.22, b=x0+(x1-x0)*0.62; lline(g,[[x0,y],[x1,y]],C.ink,2); [[a,"النقطة 1"],[b,"النقطة 2"],[x1,"الوجهة"]].forEach(([x,t],i)=>{ ldot(g,x,y,6,C.hyd); ltx(g,t,x,y+22,{s:11,rtl:true}); }); lline(g,[[a,y-22],[b,y-22]],C.muted,1.2); ltx(g,nf(st.d,0)+" NM في "+nf(st.tm,1)+" min",(a+b)/2,y-34,{s:12,w:600,rtl:true});
    const f=(st.t*0.14)%1, px=x0+(x1-x0)*f; lplane(g,px,y-12,0.08*(x1-x0)/0.9,0,C,{flip:true}); const wa=-st.wc/80; for(let i=0;i<5;i++){ const q=(st.t*0.3+i/5)%1, wx=x0+(x1-x0)*q; if(Math.abs(st.wc)>2) larrow(g,wx,r.y+r.h*0.16,wx+(-Math.sign(st.wc))*(10+Math.min(30,Math.abs(st.wc)/2)),r.y+r.h*0.16,C.muted,1.4,6); }
    ltx(g,"السرعة الأرضية "+nf(st.gs,0)+" kt",r.x+r.w*0.5,r.y+r.h*0.7,{s:15,w:700,rtl:true}); ltx(g,(st.wc>=0?"ريح أمامية ":"ريح خلفية ")+nf(Math.abs(st.wc),0)+" kt  ·  ETA "+nf(st.eta,0)+" min",r.x+r.w*0.5,r.y+r.h*0.82,{s:13,rtl:true,c:C.muted}); ltx(g,"كل ±"+nf(st.ds,0)+" s في القياس تعطي ±"+nf(st.sen,0)+" kt",r.x+r.w*0.5,r.y+r.h*0.93,{s:11,rtl:true,c:C.muted}); },
  plot(st){ return {x:[3,25],y:[0,Math.min(1500,st.gf(3))],xl:"زمن العبور min",yl:"السرعة الأرضية kt",curves:[{f:st.gf,c:"hyd"}],hl:[{y:st.tas,c:"muted",t:"TAS"}],dots:[{x:st.tm,y:st.gs,c:"power"}]}; },
  ro(st){ return [["السرعة الأرضية",nf(st.gs,0)+" kt"],["مركبة الريح الأمامية",nf(st.wc,0)+" kt"],["الوصول إلى الوجهة",nf(st.eta,0)+" min"],["أثر خطأ القياس على G",nf(st.sen,0)+" kt"],["أثره على ETA",nf(st.dEta,1)+" min"]]; },
  eq:["G = 60 d / t","W_أمامية = TAS − G","ETA = D_متبقية / G × 60"],
  note:["القياس يعتمد على سرعة حقيقية دقيقة وعلى أن المسار مستقيم. أنظمة اليوم تعطي G من القصور الذاتي أو GPS مباشرة.","تُستخدم هذه الطريقة في التدريب وفي حالات الاحتياط عند تعطل أجهزة الملاحة."],
  quiz:[{q:"زمن عبور أقصر مع نفس المسافة يعني سرعة أرضية:",o:["أكبر","أقل","نفسها"],a:0,why:"G = 60 d / t."},
        {q:"لماذا تفضَّل نقاط متباعدة؟",o:["يقل أثر خطأ القياس النسبي","لأن الطائرة أسرع","لأن الريح أضعف"],a:0,why:"الخطأ بالثواني يصبح جزءاً أصغر من الزمن."}],
  ref:"الموضوع: الملاحة بالتقدير (Dead Reckoning)."
});
/* ---- 13 ---- */
LK("nav",{
  ar:"الدوران عند نقطة الطريق: مسافة الاستباق", en:"Fly-by turn and turn anticipation",
  alt:"مساران مستقيمان يلتقيان عند نقطة طريق ومسار الطائرة يبدأ الدوران قبل النقطة بقوس مماس، ومنحنى مسافة الاستباق مع السرعة",
  intro:["لا تمر الطائرة فوق نقطة الطريق بزاوية حادة؛ تبدأ الدوران قبلها لتنساب مماسّاً للمسار التالي (fly-by). مسافة البدء قبل النقطة L = R · tan(Δψ/2)، حيث R نصف قطر الدوران R = V² / (g tan φ) وΔψ تغيّر المسار.",
         "تزداد مسافة الاستباق بزيادة السرعة وبزيادة زاوية التغيير. لهذا يحسب نظام إدارة الطيران الدوران مسبقاً. ولو تأخر الدوران لتجاوزت الطائرة المسار الجديد وخرجت عن الممر. ويتضمن التصميم تحديد أقصى ميل (نحو 25°) لراحة الركاب."],
  ctl:[{k:"dp",ar:"تغيّر المسار",min:10,max:150,step:1,v:70,f:v=>nf(v,0)+"°"},{k:"gs",ar:"السرعة الأرضية",min:120,max:480,step:5,v:250,f:v=>nf(v,0)+" kt"},{k:"bk",ar:"زاوية الميل",min:10,max:30,step:1,v:25,f:v=>nf(v,0)+"°"}],
  pre:[{ar:"اقتراب بطيء",set:{gs:160,bk:20,dp:90}},{ar:"إبحار",set:{gs:470,bk:25,dp:40}}],
  calc(st){ const V=st.gs/KT; st.R=V*V/(G0*Math.tan(st.bk*D2R)); st.L=st.R*Math.tan(st.dp*D2R/2); st.arc=st.R*st.dp*D2R; st.tt=st.arc/V; st.Lnm=st.L/1852; st.lf=(g,d)=>{ const v=g/KT; return v*v/(G0*Math.tan(st.bk*D2R))*Math.tan(d*D2R/2)/1852; }; },
  scene(g,r,st,C){ const d=st.dp*D2R, cx=r.x+r.w*0.5, cy=r.y+r.h*0.84, s=Math.min(r.w*0.8/(4.4*st.L),r.h*0.62/(2.6*st.L*Math.sin(d)+0.3*st.L)), u2=[Math.cos(d),Math.sin(d)], P=(x,y)=>[cx+x*s,cy-y*s], S=[-st.L,0], E=[st.L*u2[0],st.L*u2[1]], Cc=[S[0],st.R];
    lline(g,[P(-st.L*2.2,0),P(0,0)],C.line,1.6,[6,4]); lline(g,[P(0,0),P(st.L*2.6*u2[0],st.L*2.6*u2[1])],C.line,1.6,[6,4]); ldot(g,P(0,0)[0],P(0,0)[1],6,C.hyd); ltx(g,"نقطة الطريق",P(0,0)[0],P(0,0)[1]+18,{s:11,rtl:true,c:C.hyd});
    const pts=[]; pts.push(P(-st.L*2.2,0)); pts.push(P(S[0],S[1])); for(let i=0;i<=40;i++){ const a=-Math.PI/2+d*i/40; pts.push(P(Cc[0]+st.R*Math.cos(a),Cc[1]+st.R*Math.sin(a))); } pts.push(P(E[0]+st.L*1.6*u2[0],E[1]+st.L*1.6*u2[1])); lline(g,pts,C.power,2.6); ldot(g,P(S[0],S[1])[0],P(S[0],S[1])[1],4,C.ink); lline(g,[P(S[0],S[1]),P(0,0)],C.ctrl,1.4); ltx(g,"L = "+nf(st.Lnm,2)+" NM",P(-st.L/2,0)[0],P(0,0)[1]+16,{s:12,w:700,m:true,c:C.ctrl});
    const f=(st.t*0.12)%1, k=Math.floor(f*(pts.length-1)), pp=pts[k]; ldot(g,pp[0],pp[1],5,C.ink); ltx(g,"R = "+nf(st.R/1852,2)+" NM  ·  زمن الدوران "+nf(st.tt,0)+" s",r.x+r.w*0.5,r.y+r.h*0.08,{s:13,w:600,rtl:true}); },
  plot(st){ return {x:[120,480],y:[0,Math.max(2,st.lf(480,90))*1.05],xl:"السرعة الأرضية kt",yl:"مسافة الاستباق NM",curves:[{f:g=>st.lf(g,30),c:"gear"},{f:g=>st.lf(g,60),c:"hyd"},{f:g=>st.lf(g,90),c:"power"}],leg:[{c:"gear",t:"30°"},{c:"hyd",t:"60°"},{c:"power",t:"90°"}],dots:[{x:st.gs,y:st.Lnm,c:"ink"}]}; },
  ro(st){ return [["نصف قطر الدوران R",nf(st.R/1852,2)+" NM"],["مسافة الاستباق L",nf(st.Lnm,2)+" NM"],["طول القوس",nf(st.arc/1852,2)+" NM"],["زمن الدوران",nf(st.tt,0)+" s"]]; },
  eq:["R = V² / (g tan φ)","L = R tan(Δψ / 2)","الزمن = R Δψ / V"],
  note:["الريح تغيّر المسار الأرضي للقوس، فيصحح النظام الميل أثناء الدوران. هنا ريح صفر.","مسارات RNP تستخدم دوراناً بنصف قطر ثابت (RF) لضمان المسار حول العوائق بدقة."],
  quiz:[{q:"زيادة السرعة تجعل مسافة الاستباق:",o:["أكبر","أقل","كما هي"],a:0,why:"R تزداد مع V²."},
        {q:"لأي تغيير مسار تكون مسافة الاستباق أكبر؟",o:["120° أكبر من 40°","40° أكبر من 120°","متساوية"],a:0,why:"tan(Δψ/2) يزداد مع Δψ."}],
  ref:"الموضوع: دوران المرور (Fly-by Waypoint Geometry)."
});
/* ---- 14 ---- */
LK("nav",{
  ar:"نظام تحذير الاقتراب من الأرض: الارتفاع اللازم للإنقاذ", en:"Terrain warning and pull-up recovery height",
  alt:"طائرة تهبط بمعدل نزول عال فوق أرض مرتفعة، مسار المتابعة لحظة التنبيه ثم قوس الصعود، ومنحنى الارتفاع اللازم للتعافي مع معدل النزول",
  intro:["يحذّر نظام الاقتراب من الأرض (TAWS/GPWS) الطاقم حين يكون معدل النزول مرتفعاً بالنسبة للارتفاع أو تقترب الطائرة من تضاريس. السؤال العملي: هل يكفي الارتفاع المتبقي للتعافي؟ تحتاج الطائرة وقتاً لتتفاعل الطاقم (تأخر استجابة) ثم لتحويل النزول إلى صعود.",
         "في أثناء التأخر تهبط الطائرة h₁ = v_z · t_d. وبعدها تقوّس المسار بعامل حمل n: التسارع الرأسي (n − 1) g، فيضيع ارتفاع إضافي h₂ ≈ v_z² / (2 (n−1) g). مجموعهما هو الارتفاع اللازم. إن كان الارتفاع الفعلي فوق التضاريس أقل منه فلن تكفي المناورة."],
  ctl:[{k:"vz",ar:"معدل النزول",min:500,max:6000,step:100,v:3000,f:v=>nf(v,0)+" ft/min"},{k:"td",ar:"تأخر الاستجابة",min:1,max:8,step:0.5,v:3,f:v=>nf(v,1)+" s"},{k:"n",ar:"عامل الحمل أثناء الصعود",min:1.2,max:2.2,step:0.05,v:1.5,f:v=>nf(v,2)+" g"},{k:"V",ar:"السرعة",min:120,max:350,step:5,v:250,f:v=>nf(v,0)+" kt"},{k:"h",ar:"الارتفاع فوق التضاريس",min:100,max:3000,step:50,v:800,f:v=>nf(v,0)+" ft"}],
  pre:[{ar:"نزول سريع قرب الأرض",set:{vz:4000,h:600}},{ar:"استجابة سريعة",set:{td:1.5,n:1.8}}],
  calc(st){ const v=st.vz/60, g=32.174; st.v0=v; st.h1=v*st.td; st.h2=v*v/(2*(st.n-1)*g); st.need=st.h1+st.h2; st.ti=st.h/v; st.ok=st.h>st.need; st.mar=st.h-st.need; st.nf=vz=>{ const vv=vz/60; return vv*st.td+vv*vv/(2*(st.n-1)*g); }; st.tr=Math.sqrt(2*st.h2/((st.n-1)*g)); },
  scene(g,r,st,C){ const x0=r.x+r.w*0.08, x1=r.x+r.w*0.94, gy=r.y+r.h*0.84, W=x1-x0, V=st.V/KT*3.28084, sx=W/(V*Math.max(10,st.td+st.tr+st.ti*0.3)), sy=r.h*0.62/Math.max(st.h,st.need,300); g.fillStyle=mixC(C.panel,C.struct,0.4); g.fillRect(x0,gy,W,5);
    const T1=st.td, T2=st.td+st.tr*2.0, pts=[]; for(let t=0;t<=T1+st.tr*2.4;t+=0.1){ let x=V*t, z; if(t<=T1) z=st.h-st.v0*t; else { const q=t-T1, a=(st.n-1)*32.174; z=st.h-st.v0*T1-(st.v0*q-0.5*a*q*q); } pts.push([x0+x*sx,gy-z*sy]); } lline(g,pts,st.ok?C.hyd:C.power,2.6); const ip=pts.findIndex(p=>p[1]>=gy); const use=ip>0?pts.slice(0,ip+1):pts; if(ip>0){ ldot(g,pts[ip][0],gy,7,C.power); ltx(g,"اصطدام",pts[ip][0],gy+18,{s:12,w:700,rtl:true,c:C.power}); }
    const f=(st.t*0.2)%1, k=Math.floor(f*(use.length-1)); lplane(g,use[k][0],use[k][1],0.07*W,0,C,{flip:true}); ldot(g,pts[0][0],pts[0][1],5,C.ink); ltx(g,"التنبيه",pts[0][0]+4,pts[0][1]-14,{s:11,rtl:true,a:"left"}); ltx(g,"ضاع أثناء التأخر "+nf(st.h1,0)+" ft ثم "+nf(st.h2,0)+" ft في القوس",r.x+r.w*0.5,r.y+r.h*0.06,{s:12,rtl:true}); ltx(g,st.ok?"يكفي الارتفاع: هامش "+nf(st.mar,0)+" ft":"لا يكفي: نقص "+nf(-st.mar,0)+" ft",r.x+r.w*0.5,r.y+r.h*0.94,{s:14,w:700,rtl:true,c:st.ok?C.hyd:C.power}); },
  plot(st){ return {x:[500,6000],y:[0,Math.max(st.h*1.2,st.nf(6000)*1.05)],xl:"معدل النزول ft/min",yl:"الارتفاع ft",curves:[{f:st.nf,c:"power"}],hl:[{y:st.h,c:"hyd",t:"الارتفاع المتاح"}],dots:[{x:st.vz,y:st.need,c:st.ok?"hyd":"power"}]}; },
  ro(st){ return [["زمن حتى الاصطدام",nf(st.ti,1)+" s"],["ضياع أثناء التأخر",nf(st.h1,0)+" ft"],["ضياع أثناء القوس",nf(st.h2,0)+" ft"],["الارتفاع اللازم",nf(st.need,0)+" ft"],["الهامش",nf(st.mar,0)+" ft"]]; },
  eq:["h₁ = v_z · t_d","h₂ ≈ v_z² / (2 (n − 1) g)","h_لازم = h₁ + h₂"],
  note:["النموذج يتجاهل زمن تحوّل الطائرة من الميل ومعدل دورانها الفعلي، وهما يزيدان الارتفاع اللازم عملياً.","عند إنذار 'PULL UP' يطبّق الطاقم المناورة المعتمدة فوراً، وتدريبات المحاكاة تقيس زمن الاستجابة."],
  quiz:[{q:"ما أثر زيادة معدل النزول على الارتفاع اللازم؟",o:["يزداد بسرعة كبيرة","يقل","لا يتغير"],a:0,why:"h₂ تتناسب مع v_z²."},
        {q:"كيف نقلل الارتفاع الضائع؟",o:["استجابة أسرع وعامل حمل أكبر","نزول أبطأ فقط","لا يمكن"],a:0,why:"يقل h₁ وh₂."}],
  show:{ar:"اعرض مستشعرات القرب لجهاز الهبوط",fn:()=>lrnSel("gear_prox_sensor")},
  ref:"الموضوع: الوقاية من الاصطدام بالأرض (Terrain Awareness)."
});
/* ---- 15 ---- */
LK("nav",{
  ar:"معدل الانخفاض الحراري والاستقرار وقاعدة السحب", en:"Lapse rates, stability and cloud base",
  alt:"منحنيان لحرارة الهواء المحيط وحرارة الكتلة الصاعدة مع الارتفاع وسحابة ركامية قاعدتها عند مستوى التكاثف",
  intro:["تنخفض حرارة الهواء مع الارتفاع بمعدل المحيط Γ (يقارب 6.5 °C/km في الجو المعياري). كتلة هواء جافة صاعدة تبرد بمعدل 9.8 °C/km (الأدياباتي الجاف). وحين تبرد حتى حرارة الندى يتكاثف بخارها وتتكون السحابة، فيتحرر حرارة كامنة ويقل التبريد إلى نحو 5.5 °C/km.",
         "إذا كانت الكتلة الصاعدة أدفأ من محيطها تستمر في الصعود (جو غير مستقر) وتنمو سحب ركامية. قاعدة السحابة تقدر بـ 125 م لكل درجة فرق بين الحرارة ونقطة الندى: z_قاعدة ≈ 125 (T − T_d). وإن كان Γ أقل من نحو 5.5 فالجو مستقر ويمنع التيارات الصاعدة."],
  ctl:[{k:"T0",ar:"حرارة السطح",min:5,max:42,step:1,v:26,f:v=>nf(v,0)+" °C"},{k:"sp",ar:"فرق الحرارة ونقطة الندى",min:0,max:25,step:1,v:8,f:v=>nf(v,0)+" °C"},{k:"G",ar:"معدل انخفاض المحيط",min:3,max:12,step:0.1,v:8.8,f:v=>nf(v,1)+" °C/km"},{k:"dp",ar:"زيادة حرارة الكتلة الصاعدة",min:0,max:4,step:0.5,v:2,f:v=>nf(v,1)+" °C"}],
  pre:[{ar:"جو مستقر",set:{G:4}},{ar:"جو غير مستقر",set:{G:10.5,sp:6}}],
  calc(st){ st.lcl=125*st.sp; st.env=z=>Math.max(-70,st.T0-st.G*Math.min(z,11000)/1000); const t0=st.T0+st.dp, Z=[],Tp=[]; let T=t0; for(let z=0;z<=14000;z+=50){ Z.push(z); Tp.push(T); const gm=z<st.lcl?9.8:3.5+5.5*clamp((28-T)/70,0,1); T-=gm*0.05; } st.par=z=>{ const i=clamp(z/50,0,Tp.length-1), a=Math.floor(i), b=Math.min(Tp.length-1,a+1); return Tp[a]+(Tp[b]-Tp[a])*(i-a); };
    let top=0, go=true; for(let i=0;i<Z.length&&go;i++){ if(Tp[i]>=st.env(Z[i])) top=Z[i]; else if(Z[i]>200) go=false; } st.top=top; st.st=st.G<5.5?"مستقر":st.G<9.8?"غير مستقر بشرط":"غير مستقر"; st.cloud=st.top>st.lcl+100; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.12, x1=r.x+r.w*0.88, gy=r.y+r.h*0.86, Hm=Math.max(6000,st.top*1.2,st.lcl*1.5), Y=z=>gy-z/Hm*r.h*0.72; g.fillStyle=mixC(C.panel,C.struct,0.35); g.fillRect(x0,gy,x1-x0,5);
    [0,2000,4000,6000,8000,10000].filter(z=>z<=Hm).forEach(z=>{ lline(g,[[x0,Y(z)],[x1,Y(z)]],C.line,0.7,[2,5]); ltx(g,nf(z/1000,0)+" km",x0-6,Y(z),{s:10,m:true,a:"right",c:C.muted}); });
    const cx=(x0+x1)/2; lline(g,[[x0,Y(st.lcl)],[x1,Y(st.lcl)]],C.hyd,1.6,[6,3]); ltx(g,"قاعدة السحابة "+nf(st.lcl*3.28084,0)+" ft",x1,Y(st.lcl)-9,{s:11,rtl:true,a:"right",c:C.hyd});
    if(st.cloud){ const base=Y(st.lcl), top=Y(st.top), w=(x1-x0)*0.3; g.fillStyle=mixC(C.panel,C.ink,0.08); for(let i=0;i<9;i++){ const f=i/8, yy=base+(top-base)*f, ww=w*(0.5+0.5*Math.sin(Math.PI*clamp(f*0.9+0.1,0,1))*(1-0.3*f)); g.beginPath(); g.arc(cx+Math.sin(i*2.1)*w*0.1,yy,ww*0.5+4,0,Math.PI*2); g.fill(); } g.strokeStyle=C.line; g.lineWidth=1; ltx(g,"قمة الحمل "+nf(st.top/1000,1)+" km",cx+w*0.7,top,{s:11,rtl:true,a:"left"}); }
    const f=(st.t*0.18)%1, z=Math.min(st.top||st.lcl,Hm)*f; ldot(g,cx-(x1-x0)*0.2,Y(z),6,C.power); ltx(g,"كتلة صاعدة",cx-(x1-x0)*0.2-10,Y(z),{s:11,rtl:true,a:"right",c:C.power}); ltx(g,"الجو: "+st.st,r.x+r.w*0.5,r.y+r.h*0.06,{s:14,w:700,rtl:true,c:st.G>=9.8?C.power:C.ink}); },
  plot(st){ const e=[],p=[]; for(let z=0;z<=12000;z+=250){ e.push([st.env(z),z/1000]); p.push([st.par(z),z/1000]); } return {x:[-60,45],y:[0,12],xl:"الحرارة °C",yl:"الارتفاع km",lines:[{pts:e,c:"ink",w:2},{pts:p,c:"power",w:2.2}],leg:[{c:"ink",t:"المحيط"},{c:"power",t:"الكتلة الصاعدة"}],hl:[{y:st.lcl/1000,c:"hyd",t:"التكاثف"}]}; },
  ro(st){ return [["قاعدة السحابة",nf(st.lcl,0)+" m"],["قاعدة السحابة",nf(st.lcl*3.28084,0)+" ft"],["قمة الحمل",nf(st.top/1000,1)+" km"],["حالة الجو",st.st],["حرارة الندى",nf(st.T0-st.sp,0)+" °C"]]; },
  eq:["z_قاعدة ≈ 125 (T − T_d)   (م)","T_كتلة = T₀ − 9.8 z/1000 (قبل التكاثف)","بعد التكاثف يقل التبريد إلى 3.5 – 9 °C/km حسب الحرارة"],
  note:["النموذج مبسط: المعدل الرطب يتغير مع الحرارة والضغط، ومعامل 125 م تقريب جيد. التنبؤ الفعلي يعتمد على قياسات المسبار الجوي.","الحمل الحراري يولّد اضطراباً وسحب ركامية حتى ارتفاعات كبيرة، ويتجنبها الطاقم."],
  quiz:[{q:"فرق 8 °C بين الحرارة ونقطة الندى يعطي قاعدة سحابة نحو:",o:["1000 m","125 m","8000 m"],a:0,why:"125 × 8 = 1000 m."},
        {q:"متى يكون الجو غير مستقر؟",o:["حين ينخفض المحيط أسرع من الكتلة الصاعدة","حين لا يوجد ريح","حين يكون صافياً"],a:0,why:"الكتلة الصاعدة تبقى أدفأ."}],
  ref:"الموضوع: الاستقرار الجوي والحمل الحراري (Atmospheric Stability)."
});
/* ---- 16 ---- */
LK("nav",{
  ar:"الرطوبة ونقطة الندى وتكوّن الضباب", en:"Humidity, dew point and fog formation",
  alt:"مقياس حرارة وسحابة ضباب تتكوّن ليلاً مع انخفاض الحرارة نحو نقطة الندى، ومنحنى الرطوبة النسبية مع الزمن",
  intro:["الرطوبة النسبية RH نسبة ضغط بخار الماء الفعلي إلى ضغط البخار المشبع عند الحرارة نفسها: RH = e_s(T_d) / e_s(T). ويعطي ضغط البخار المشبع معادلة ماغنوس: e_s = 6.112 exp(17.62 T / (243.12 + T)) بالهكتوباسكال.",
         "عندما تبرد الأرض ليلاً تقترب حرارة الهواء من نقطة الندى فترتفع الرطوبة حتى 100%، ويتكوّن الضباب في ليال هادئة صافية. ينخفض مدى الرؤية فيه فتتعطل العمليات. يتوقع المنبئون ذلك من الفرق T − T_d ومعدل التبريد، وتنبّه الطائرات حين يكون الفرق ضمن 2 °C."],
  ctl:[{k:"T",ar:"حرارة الهواء",min:-10,max:40,step:0.5,v:14,f:v=>nf(v,1)+" °C"},{k:"Td",ar:"نقطة الندى",min:-15,max:40,step:0.5,v:10,f:v=>nf(v,1)+" °C"},{k:"cr",ar:"معدل التبريد الليلي",min:0.2,max:3,step:0.1,v:1,f:v=>nf(v,1)+" °C/h"}],
  pre:[{ar:"ليلة رطبة",set:{T:12,Td:11}},{ar:"جو جاف",set:{T:30,Td:5}}],
  calc(st){ st.Td=Math.min(st.Td,st.T); st.es=T=>6.112*Math.exp(17.62*T/(243.12+T)); st.rh=T=>Math.min(100,st.es(st.Td)/st.es(T)*100); st.sp=st.T-st.Td; st.tf=st.sp/st.cr; st.R=st.rh(st.T); st.rt=t=>st.rh(st.T-st.cr*t); st.risk=st.sp<=2?"ضباب محتمل الآن":st.tf<6?"ضباب خلال "+nf(st.tf,1)+" h":"خطر قليل"; },
  scene(g,r,st,C){ const tm=(st.t*0.6)%12, T=st.T-st.cr*tm, rh=st.rh(Math.max(T,st.Td)), x0=r.x+r.w*0.1, x1=r.x+r.w*0.9, gy=r.y+r.h*0.8; g.fillStyle=mixC(C.panel,C.struct,0.4); g.fillRect(x0,gy,x1-x0,5); const f=clamp((rh-60)/40,0,1); for(let i=0;i<40;i++){ const x=x0+((i*83+st.t*8)%(x1-x0)), h=f*r.h*0.38*(0.6+0.4*Math.sin(i*1.7)), y=gy-h*(0.4+0.6*((i*37)%10)/10); ldot(g,x,y,6+f*10,mixC(C.panel,C.ink,0.08+0.18*f),0.5); }
    const tx=r.x+r.w*0.82, ty=r.y+r.h*0.14, th=r.h*0.5; g.strokeStyle=C.ink; g.lineWidth=1.4; g.strokeRect(tx-4,ty,8,th); const lv=clamp((Math.max(T,st.Td)+10)/50,0,1); g.fillStyle=mixC(C.panel,C.power,0.8); g.fillRect(tx-3,ty+th*(1-lv),6,th*lv); ldot(g,tx,ty+th+8,8,C.power); lline(g,[[tx-12,ty+th*(1-clamp((st.Td+10)/50,0,1))],[tx+12,ty+th*(1-clamp((st.Td+10)/50,0,1))]],C.hyd,2); ltx(g,"ندى",tx+16,ty+th*(1-clamp((st.Td+10)/50,0,1)),{s:10,rtl:true,a:"left",c:C.hyd});
    ltx(g,"بعد "+nf(tm,1)+" h : "+nf(Math.max(T,st.Td),1)+" °C  ·  RH "+nf(rh,0)+" %",r.x+r.w*0.42,r.y+r.h*0.1,{s:13,w:700,rtl:true}); ltx(g,st.risk,r.x+r.w*0.42,r.y+r.h*0.92,{s:13,w:700,rtl:true,c:st.sp<=2||st.tf<6?C.power:C.ink}); },
  plot(st){ return {x:[0,12],y:[0,105],xl:"الزمن h",yl:"الرطوبة النسبية %",curves:[{f:st.rt,c:"hyd"}],hl:[{y:100,c:"power",t:"تشبع"}],dots:[{x:0,y:st.R,c:"hyd"}].concat(st.tf<12?[{x:st.tf,y:100,c:"power",t:nf(st.tf,1)+" h"}]:[])}; },
  ro(st){ return [["الرطوبة النسبية",nf(st.R,0)+" %"],["فرق الحرارة والندى",nf(st.sp,1)+" °C"],["زمن الوصول إلى الندى",st.tf<24?nf(st.tf,1)+" h":"أكثر من 24 h"],["الحالة",st.risk]]; },
  eq:["e_s(T) = 6.112 exp( 17.62 T / (243.12 + T) )","RH = e_s(T_d) / e_s(T)","t = (T − T_d) / معدل التبريد"],
  note:["الضباب الإشعاعي يتطلب ليلاً صافياً وريحاً خفيفة؛ مع الريح القوية يتكون غيم منخفض بدل الضباب.","فرق 2 °C أو أقل على المدرج مؤشر مبكر للضباب في تقارير الطقس (METAR)."],
  quiz:[{q:"متى تصل الرطوبة النسبية إلى 100%؟",o:["حين تساوي الحرارة نقطة الندى","حين ترتفع الحرارة","في ليلة جافة"],a:0,why:"RH = e_s(T_d)/e_s(T) = 1."},
        {q:"أي ظرف يرفع احتمال الضباب؟",o:["فرق صغير وتبريد ليلي هادئ","ريح قوية","فرق كبير"],a:0,why:"يصل الهواء إلى الندى."}],
  ref:"الموضوع: الرطوبة والضباب (Humidity and Fog)."
});
/* ---- 17 ---- */
LK("nav",{
  ar:"الريح الجيوستروفية من تقارب الخطوط متساوية الضغط", en:"Geostrophic wind from isobar spacing",
  alt:"خريطة طقس بخطوط متساوية الضغط حول منخفض مع سهم الريح موازياً لها، ومنحنى سرعة الريح مع خط العرض",
  intro:["بعيداً عن الاحتكاك (على ارتفاعات الطيران) تتوازن قوة تدرج الضغط مع قوة كوريوليس فتهب الريح موازية للخطوط متساوية الضغط. سرعتها V = (1 / (ρ f)) · Δp/Δn حيث f = 2Ω sin φ مُعامل كوريوليس وΩ = 7.292×10⁻⁵ rad/s سرعة دوران الأرض.",
         "كلما تقاربت الخطوط (تدرج أكبر) زادت الريح. وعلى ارتفاع أعلى تقل الكثافة فتزداد الريح لنفس التدرج. وعند خط الاستواء f → 0 فلا ينطبق التوازن. وقاعدة بايز-بالوت: وقوفاً ووجهك للريح في نصف الكرة الشمالي، يكون الضغط المنخفض إلى يمينك."],
  ctl:[{k:"gr",ar:"تدرج الضغط",min:0.2,max:6,step:0.1,v:2,f:v=>nf(v,1)+" hPa/100 km"},{k:"lat",ar:"خط العرض",min:10,max:80,step:1,v:45,f:v=>nf(v,0)+"°"},{k:"ft",ar:"الارتفاع",min:0,max:40000,step:1000,v:10000,f:v=>nf(v,0)+" ft"}],
  pre:[{ar:"منخفض عميق",set:{gr:5}},{ar:"ارتفاع الطيران",set:{ft:35000,gr:2}}],
  calc(st){ st.rho=isa(st.ft*0.3048).rho; st.fc=2*7.292e-5*Math.sin(st.lat*D2R); st.V=g=>(g*100/1e5)/(st.rho*(2*7.292e-5*Math.sin(st.lat*D2R)))*KT; st.v=st.V(st.gr); st.vl=l=>(st.gr*100/1e5)/(st.rho*(2*7.292e-5*Math.sin(l*D2R)))*KT; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.42, cy=r.y+r.h*0.5, R0=Math.min(r.w*0.34,r.h*0.4); const sp=R0/(1+st.gr*1.6); for(let k=1;k<=5;k++){ const rr=sp*k*1.0+10; g.strokeStyle=k%2?C.hyd:C.muted; g.lineWidth=1.4; g.beginPath(); g.arc(cx,cy,rr,0,Math.PI*2); g.stroke(); ltx(g,String(1000+k*4),cx+rr*0.72,cy-rr*0.72,{s:9,m:true,c:C.muted}); }
    ltx(g,"L",cx,cy,{s:22,w:700,c:C.power,m:true}); const rr=sp*3+10; for(let i=0;i<4;i++){ const a=st.t*0.4*Math.min(2,st.v/40+0.3)+i*Math.PI/2; const x=cx+Math.cos(a)*rr, y=cy+Math.sin(a)*rr; larrow(g,x,y,x-Math.sin(a)*26,y+Math.cos(a)*26,C.ctrl,2.4,8); }
    ltx(g,"V = "+nf(st.v,0)+" kt",r.x+r.w*0.42,r.y+r.h*0.07,{s:15,w:700,m:true}); ltx(g,"f = "+nf(st.fc*1e4,2)+"×10⁻⁴  ·  ρ = "+nf(st.rho,2)+" kg/m³",r.x+r.w*0.42,r.y+r.h*0.94,{s:11,m:true,c:C.muted}); },
  plot(st){ return {x:[10,80],y:[0,Math.min(400,st.vl(10)*1.05)],xl:"خط العرض °",yl:"الريح kt",curves:[{f:st.vl,c:"hyd"}],dots:[{x:st.lat,y:st.v,c:"power"}]}; },
  ro(st){ return [["الريح الجيوستروفية",nf(st.v,0)+" kt"],["معامل كوريوليس",nf(st.fc*1e4,2)+"×10⁻⁴ s⁻¹"],["كثافة الهواء",nf(st.rho,3)+" kg/m³"],["تدرج الضغط",nf(st.gr,1)+" hPa/100 km"]]; },
  eq:["V = (1 / ρ f) · Δp / Δn","f = 2 Ω sin φ ،  Ω = 7.292×10⁻⁵ s⁻¹","الضغط المنخفض إلى اليمين عند وجه للريح (نصف الكرة الشمالي)"],
  note:["الريح الجيوستروفية تقدير للريح العلوية. قرب الأرض يخفضها الاحتكاك وتتجه قليلاً نحو الضغط المنخفض، وحول المنخفضات المنحنية تضاف قوة طاردة.","عند خطوط عرض أقل من نحو 10° لا يصح التوازن الجيوستروفي."],
  quiz:[{q:"تقارب الخطوط متساوية الضغط يعني ريحاً:",o:["أقوى","أضعف","بلا تغيير"],a:0,why:"تدرج الضغط أكبر."},
        {q:"عند ارتفاع أعلى، لنفس التدرج تكون الريح:",o:["أكبر","أقل","لا تتغير"],a:0,why:"الكثافة أقل في الصيغة V ∝ 1/ρ."}],
  ref:"الموضوع: ديناميكا الغلاف الجوي (Atmospheric Dynamics)."
});
/* ---- 18 ---- */
LK("nav",{
  ar:"الانفجار الهابط (Microburst) وقص الريح أثناء الاقتراب", en:"Microburst wind shear on approach",
  alt:"عمود هواء هابط يتفرق على الأرض وطائرة تقترب على مسار يمر بالخرج، ومنحنى مركبة الريح الأمامية والسرعة الهوائية على طول المسار",
  intro:["الانفجار الهابط تيار هابط قوي من سحابة عاصفة يصطدم بالأرض ويتفرق منها أفقياً. الطائرة التي تعبره على مسار الاقتراب تواجه أولاً ريحاً أمامية متزايدة (تزداد سرعتها الهوائية فتميل لمتابعة الارتفاع فوق المسار)، ثم تنعكس الريح في القلب إلى خلفية قوية بينما تتحرك الطائرة خلف قلب التيار الهابط.",
         "إن بقيت السرعة الأرضية ثابتة تقريباً تتبع السرعة الهوائية تغير الريح الأمامية: IAS(x) = V₀ + [W(x) − W(0)]. فالتغيّر الكلي بين القمة والقاع يساوي ضعف شدة التفرق. إن كان ذلك أكبر من هامش السرعة فوق الانهيار (مضافاً إليه خسارة الرفع بسبب الهبوط) تصبح الحالة خطرة، ولذلك تُلغى الطائرات اقترابها أو تتحدى الإنذار."],
  ctl:[{k:"A",ar:"شدة تفرق الريح",min:5,max:60,step:1,v:35,f:v=>nf(v,0)+" kt"},{k:"sg",ar:"عرض الانفجار",min:0.3,max:2.5,step:0.1,v:0.8,f:v=>nf(v,1)+" NM"},{k:"sc",ar:"موقع القلب من بداية المسار",min:1,max:5,step:0.1,v:3,f:v=>nf(v,1)+" NM"},{k:"v0",ar:"سرعة الاقتراب",min:110,max:160,step:1,v:140,f:v=>nf(v,0)+" kt"}],
  pre:[{ar:"انفجار ضعيف",set:{A:15}},{ar:"انفجار شديد",set:{A:50,sg:0.6}}],
  calc(st){ st.W=s=>{ const u=(s-st.sc)/st.sg; return st.A*(-u)*Math.exp((1-u*u)/2); }; st.Vi=s=>st.v0+(st.W(s)-st.W(0)); let mx=-1e9,mn=1e9,smx=0,smn=0; for(let s=0;s<=6;s+=0.02){ const v=st.Vi(s); if(v>mx){ mx=v; smx=s; } if(v<mn){ mn=v; smn=s; } } st.mx=mx; st.mn=mn; st.smx=smx; st.smn=smn; st.sw=mx-mn; st.vs=st.v0/1.23; st.mar=mn-1.1*st.vs; st.bad=st.mar<5; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.06, x1=r.x+r.w*0.94, gy=r.y+r.h*0.78, W=x1-x0, X=s=>x1-W*s/6, hy=r.h*0.45; g.fillStyle=mixC(C.panel,C.struct,0.4); g.fillRect(x0,gy,W,5); lline(g,[[x0,gy-hy],[x1,gy-0]],C.line,1.2,[5,4]);
    const cx=X(st.sc); g.fillStyle=mixC(C.panel,C.hyd,0.2); g.beginPath(); g.moveTo(cx-18,gy-hy*1.0-10); g.lineTo(cx+18,gy-hy*1.0-10); g.lineTo(cx+10,gy); g.lineTo(cx-10,gy); g.closePath(); g.fill(); for(let i=0;i<5;i++){ const f=(st.t*0.5+i/5)%1; larrow(g,cx-6+i*3,gy-hy*(1-f)-0,cx-6+i*3,gy-hy*(1-f)+20,C.hyd,1.8,6); } [-1,1].forEach(sg=>{ for(let k=1;k<=3;k++){ const a=Math.min(1,st.A/50), L=18+a*20; larrow(g,cx+sg*k*W*0.06,gy-8-k*3,cx+sg*(k*W*0.06+L),gy-8-k*3,C.power,1.8,6); } });
    const f=(st.t*0.08)%1, s=6*f, px=X(s), py=gy-hy*(1-f)*(1-0)+0; lplane(g,px,gy-hy*(1-s/6)-8,0.09*W,3,C,{flip:true}); ltx(g,"IAS "+nf(st.Vi(s),0)+" kt",px,gy-hy*(1-s/6)-28,{s:12,w:700,m:true,c:st.Vi(s)<st.vs*1.15?C.power:C.ink});
    ltx(g,"تغير السرعة بين القمة والقاع "+nf(st.sw,0)+" kt",r.x+r.w*0.5,r.y+r.h*0.08,{s:13,w:700,rtl:true}); ltx(g,st.bad?"هامش السرعة غير كافٍ: خطر":"هامش السرعة "+nf(st.mar,0)+" kt فوق 1.1 V_s",r.x+r.w*0.5,r.y+r.h*0.94,{s:13,w:700,rtl:true,c:st.bad?C.power:C.hyd}); },
  plot(st){ const a=[],b=[]; for(let s=0;s<=6;s+=0.05){ a.push([s,st.W(s)]); b.push([s,st.Vi(s)]); } return {x:[0,6],y:[st.v0-80,st.v0+80],xl:"المسافة المقطوعة NM",yl:"السرعة الهوائية kt",lines:[{pts:b,c:"hyd",w:2.4},{pts:a.map(p=>[p[0],p[1]+st.v0]),c:"muted",w:1.4}],leg:[{c:"hyd",t:"IAS"},{c:"muted",t:"الريح الأمامية"}],hl:[{y:1.1*st.vs,c:"power",t:"1.1 V_s"}],dots:[{x:st.smn,y:st.mn,c:st.bad?"power":"hyd"}]}; },
  ro(st){ return [["أعلى سرعة هوائية",nf(st.mx,0)+" kt"],["أدنى سرعة هوائية",nf(st.mn,0)+" kt"],["التغير الكلي",nf(st.sw,0)+" kt"],["الهامش فوق 1.1 V_s",nf(st.mar,0)+" kt"],["الحالة",st.bad?"خطر":"مقبول"]]; },
  eq:["W(s) = A (−u) e^{(1 − u²)/2} ،  u = (s − s_c)/σ","IAS(s) = V₀ + [W(s) − W(0)]","الهامش = IAS_min − 1.1 V_s"],
  note:["النموذج يفترض سرعة أرضية ثابتة وعدم تدخل الطاقم. في الواقع يزيد الطيار الدفع ويغيّر الميل، كما يهبط الهواء بسرعة تضيف خسارة ارتفاع.","أنظمة كشف قص الريح تعطي إنذاراً حين يتجاوز تغيّر الريح حداً معيناً، وتتبع الطواقم إجراء الإنقاذ المعتمد."],
  quiz:[{q:"أخطر ما يحدث في الانفجار الهابط أثناء الاقتراب:",o:["تحوّل الريح الأمامية إلى خلفية فتنخفض السرعة الهوائية","ارتفاع الحرارة","زيادة الرؤية"],a:0,why:"السرعة الهوائية تنخفض بمقدار تحول الريح."},
        {q:"ماذا يعني مضاعفة شدة التفرق؟",o:["مضاعفة التغير في السرعة","نصفه","لا يتغير"],a:0,why:"التغير يتناسب مع A."}],
  ref:"الموضوع: قص الريح والانفجار الهابط (Wind Shear and Microbursts)."
});
