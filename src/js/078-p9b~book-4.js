/* ---------- Book 4: Mechanics of Flight — 10 more lessons ---------- */
LK("mof",{
  ar:"ارتفاع الطاقة والقدرة الزائدة النوعية", en:"Energy height and specific excess power",
  alt:"عمودان للطاقة الكامنة والحركية وطائرة تتبادل السرعة بالارتفاع، ومنحنيات ارتفاع الطاقة الثابت في مستوى السرعة والارتفاع",
  intro:["الطائرة تخزن طاقة بشكلين: ارتفاع (طاقة كامنة) وسرعة (طاقة حركية). مجموعهما مقسوماً على الوزن يسمى «ارتفاع الطاقة»: h + V²/2g. يستطيع الطيار تحويل أحدهما للآخر، كأن يصعد بسرعة فيفقد سرعة.",
         "القدرة الزائدة النوعية Ps = V(T − D)/W هي معدل زيادة ارتفاع الطاقة. إذا كانت موجبة تستطيع الطائرة أن تصعد أو تتسارع أو الاثنين، وإذا كانت سالبة فلا بد أن تخسر سرعة أو ارتفاعاً."],
  ctl:[{k:"h",ar:"الارتفاع",min:0,max:40000,step:500,v:20000,f:v=>nf(v,0)+" ft"},{k:"V",ar:"السرعة الحقيقية",min:150,max:550,step:5,v:400,f:v=>nf(v,0)+" kt"},{k:"tw",ar:"الدفع ÷ الوزن الآن",min:0.05,max:0.4,step:0.005,v:0.12,f:v=>nf(v,3)},{k:"LD",ar:"L/D الآن",min:8,max:18,step:0.5,v:15,f:v=>nf(v,1)}],
  calc(st){ const V=st.V/KT; st.Es=st.h+V*V/(2*G0)/0.3048; st.Ps=V*(st.tw-1/st.LD)/0.3048*60; st.ke=V*V/(2*G0)/0.3048; },
  scene(g,r,st,C){ const bx=r.x+r.w*0.1, bw=r.w*0.16, y0=r.y+r.h*0.9, s=r.h*0.78/60000;
    kBox(g,bx,y0-st.h*s,bw,st.h*s,mixC(C.panel,C.hyd,0.5),C,st.h*s>16?"ارتفاع":""); kBox(g,bx,y0-st.Es*s,bw,st.ke*s,mixC(C.panel,C.power,0.5),C,st.ke*s>16?"سرعة":"");
    ltx(g,"Es = "+nf(st.Es,0)+" ft",bx+bw/2,y0-st.Es*s-12,{s:11,w:600,m:true});
    const px=r.x+r.w*0.42, pw=r.w*0.52, ph=r.y+r.h*0.15, f=(Math.sin(st.t*0.8)+1)/2, path=[]; for(let i=0;i<=40;i++){ const u=i/40; path.push([px+u*pw,ph+r.h*0.55-Math.sin(u*Math.PI)*r.h*0.4]); } lline(g,path,C.line,1.5,[4,3]);
    const q=path[Math.floor(f*40)]; ldot(g,q[0],q[1],6,C.accent); ltx(g,"تبادل: ارتفاع ↔ سرعة",px+pw/2,ph+r.h*0.7,{c:C.muted,s:10,rtl:true});
    ltx(g,"Ps = "+(st.Ps>=0?"+":"")+nf(st.Ps,0)+" ft/min",px+pw/2,r.y+r.h*0.95,{s:13,w:600,m:true,c:st.Ps>=0?C.ctrl:C.power}); },
  plot(st){ const hE=E=>v=>E-(v/KT)**2/(2*G0)/0.3048; return {x:[150,550],y:[0,50000],xl:"TAS kt",yl:"ft",curves:[10000,20000,30000,40000,50000,60000].map(E=>({f:hE(E),c:Math.abs(E-st.Es)<5000?"power":"line",w:1.4})),dots:[{x:st.V,y:st.h,t:"Es "+nf(st.Es/1000,1)+"k"}]}; },
  ro(st){ return [["ارتفاع الطاقة Es",nf(st.Es,0)+" ft"],["منها بسبب السرعة",nf(st.ke,0)+" ft"],["Ps",nf(st.Ps,0)+" ft/min"],["زمن كسب 1000 ft طاقة",st.Ps>1?nf(1000/st.Ps*60,0)+" s":"لا يمكن"]]; },
  eq:["E_s = h + V²/(2g)","P_s = dE_s/dt = V (T − D) / W","P_s = dh/dt + (V/g) dV/dt"],
  note:["المنحنيات في المخطط خطوط ارتفاع طاقة ثابت: الطيران عليها يعني تبادلاً بلا كسب ولا خسارة.","في الصعود الحقيقي يقسّم الطيار Ps بين صعود وتسارع حسب الحاجة."],
  quiz:[{q:"طائرة على 20000 قدم بسرعة 400 عقدة، ارتفاع طاقتها تقريباً:",o:["20000 ft","27000 ft","40000 ft"],a:1,why:"V²/2g ≈ 7000 ft عند 400 kt."},
        {q:"إذا كانت Ps سالبة:",o:["يمكن الصعود مع ثبات السرعة","يجب خسارة سرعة أو ارتفاع","الطائرة تتسارع"],a:1,why:"ارتفاع الطاقة يتناقص."}],
  show:{ar:"اعرض المحرك",fn:()=>lrnSel("engine")},
  ref:"الموضوع المقابل: طرق الطاقة في الأداء (Energy Methods)."
});
LK("mof",{
  ar:"الصعود الحاد والحلقة الرأسية", en:"Pull-up and the vertical loop",
  alt:"مسار دائري رأسي تدور فيه طائرة مع سهم معامل الحمل في الأسفل والأعلى، ومنحنى نصف قطر الدوران مع السرعة",
  intro:["في الصعود الحاد من طيران أفقي يجب أن يزيد الرفع على الوزن ليدير المسار للأعلى. نصف قطر المنحنى يعتمد على السرعة ومعامل الحمل: R = V²/(g(n−1)) في أسفل المسار.",
         "في الحلقة بسرعة ثابتة (دفع كافٍ) يكون معامل الحمل في القمة أقل بـ 2g من الأسفل، لأن الوزن نفسه يساعد على الدوران هناك. أما بلا دفع فتخسر الطائرة سرعة وهي تصعد، وتحتاج دائرة كاملة نحو 6g في الأسفل، ولهذا تكون الحلقات الحقيقية بيضاوية ويساعدها المحرك."],
  ctl:[{k:"V",ar:"السرعة عند الدخول",min:100,max:400,step:1,v:250,f:v=>nf(v,0)+" kt"},{k:"n",ar:"معامل الحمل في الأسفل",min:1.5,max:6,step:0.1,v:4,f:v=>nf(v,1)+" g"}],
  tog:[{k:"glide",ar:"بلا دفع (طاقة فقط)",v:false}],
  pre:[{ar:"طائرة تدريب استعراضي",set:{V:140,n:4}},{ar:"طائرة نقل (حد 2.5g)",set:{V:250,n:2.5}},{ar:"مقاتلة",set:{V:400,n:6}}],
  calc(st){ const V=st.V/KT; st.R=V*V/(G0*(st.n-1)); if(st.glide){ const vt2=V*V-4*G0*st.R; st.Vt=vt2>0?Math.sqrt(vt2):0; st.nt=vt2>0?vt2/(G0*st.R)-1:-1; } else { st.Vt=V; st.nt=st.n-2; } st.ok=st.nt>=0; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, R=Math.min(r.w*0.38,r.h*0.4), cy=r.y+r.h*0.5; g.strokeStyle=st.ok?C.ctrl:C.power; g.lineWidth=2; g.setLineDash([5,4]); g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.stroke(); g.setLineDash([]);
    lline(g,[[r.x,cy+R],[cx,cy+R]],C.line,2); const a=Math.PI/2-((st.t*0.6)%(Math.PI*2)), px=cx+Math.cos(a)*R, py=cy+Math.sin(a)*R; ldot(g,px,py,7,C.accent);
    larrow(g,cx,cy+R,cx,cy+R-R*0.18*st.n,C.power,3,8); ltx(g,"n = "+nf(st.n,1),cx+10,cy+R-R*0.12*st.n,{s:11,w:600,a:"left",m:true,c:C.power});
    ltx(g,st.ok?"في القمة n = "+nf(st.nt,2):"لا تكتمل الحلقة: السرعة في القمة غير كافية",cx,cy-R-14,{s:11,w:600,c:st.ok?C.ctrl:C.power,rtl:true}); ltx(g,"R = "+nf(st.R,0)+" m",cx,cy,{s:12,m:true}); },
  plot(st){ return {x:[100,400],y:[0,Math.max(1500,st.R*1.3)],xl:"V kt",yl:"R m",curves:[{f:v=>(v/KT)**2/(G0*(st.n-1)),c:"hyd"},{f:v=>(v/KT)**2/(G0*1.5),c:"muted",dash:[4,3]}],dots:[{x:st.V,y:st.R}],leg:[{c:"hyd",t:"n الحالي"},{c:"muted",t:"2.5g",dash:[4,3]}]}; },
  ro(st){ return [["نصف القطر في الأسفل",nf(st.R,0)+" m"],["قطر الحلقة",nf(2*st.R,0)+" m"],["السرعة في القمة",nf(st.Vt*KT,0)+" kt"],["معامل الحمل في القمة",st.ok?nf(st.nt,2)+" g":"سالب"]]; },
  eq:["n = 1 + V²/(gR) في أسفل المسار","R = V² / (g(n − 1))","بسرعة ثابتة: n_top = n − 2 ، وبلا دفع: V_top² = V² − 4gR ، n_top = V_top²/(gR) − 1"],
  note:["الحساب يفترض دائرة مثالية؛ اختر «بلا دفع» لترى لماذا تحتاج الحلقة الدائرية بلا محرك نحو 6g.","طائرات النقل لا تقوم بالحلقات؛ حد الحمل 2.5g يجعل نصف القطر كبيراً جداً."],
  quiz:[{q:"مضاعفة السرعة بنفس معامل الحمل تجعل نصف القطر:",o:["ضعفاً","أربعة أضعاف","نصفاً"],a:1,why:"R ∝ V²."},
        {q:"لماذا يقل معامل الحمل في قمة الحلقة؟",o:["الجاذبية في اتجاه مركز الحلقة والسرعة أقل","المحرك يتوقف","الجناح ينهار"],a:0,why:"في القمة الوزن نفسه يساعد على الدوران، والسرعة أقل."}],
  ref:"الموضوع المقابل: المناورات في المستوى الرأسي (Pull-up Maneuvers)."
});
LK("mof",{
  ar:"الرياح الجانبية: مركباتها وزاوية التصحيح", en:"Crosswind: components and crab angle",
  alt:"مدرج من الأعلى وطائرة تقترب مائلة بزاوية نحو الريح وسهم الريح بمركبتيه الأمامية والجانبية، ومنحنى المركبة الجانبية مع زاوية الريح",
  intro:["الريح التي تأتي بزاوية على المدرج تُقسم إلى مركبة أمامية (تساعد على الإقلاع والهبوط) ومركبة جانبية (تدفع الطائرة عن خط المدرج). الطيار يوجّه أنف الطائرة نحو الريح قليلاً ليبقى المسار على الخط: هذه «زاوية التصحيح».",
         "لكل طائرة حد مُثبت للرياح الجانبية في دليل الطيران. قاعدة سريعة: عند 30° المركبة الجانبية نصف الريح، وعند 45° حوالي 70%، وعند 60° حوالي 90%."],
  ctl:[{k:"W",ar:"سرعة الريح",min:0,max:45,step:1,v:20,f:v=>nf(v,0)+" kt"},{k:"ang",ar:"زاوية الريح على المدرج",min:0,max:90,step:1,v:40,f:v=>nf(v,0)+"°"},{k:"tas",ar:"سرعة الاقتراب",min:100,max:180,step:1,v:140,f:v=>nf(v,0)+" kt"},{k:"lim",ar:"حد الريح الجانبية للطائرة",min:15,max:40,step:1,v:30,f:v=>nf(v,0)+" kt"}],
  calc(st){ const a=st.ang*D2R; st.hw=st.W*Math.cos(a); st.xw=st.W*Math.sin(a); st.crab=Math.asin(clamp(st.xw/st.tas,-1,1))/D2R; st.ok=st.xw<=st.lim; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.42, rw=r.w*0.14; g.fillStyle=mixC(C.panel,C.ink,0.22); g.fillRect(cx-rw/2,r.y,rw,r.h); for(let y=r.y+8;y<r.y+r.h;y+=26) lline(g,[[cx,y],[cx,y+13]],"#f2f2ee",2);
    const py=r.y+r.h*(0.85-((st.t*0.08)%0.7)); tplane(g,cx,py,Math.min(rw*1.6,r.w*0.24),-Math.PI/2+st.crab*D2R,C);
    const wx=r.x+r.w*0.82, wy=r.y+r.h*0.3, a=st.ang*D2R, L=Math.min(r.w*0.16,r.h*0.25)*st.W/30, dx=Math.sin(a)*L, dy=-Math.cos(a)*L;
    larrow(g,wx+dx,wy+dy,wx,wy,C.power,2.5,8); ltx(g,"الريح "+nf(st.W,0)+" kt",wx,wy+L+16,{c:C.power,s:11,rtl:true});
    ltx(g,"أمامية "+nf(st.hw,0)+" kt",r.x+r.w*0.82,r.y+r.h*0.7,{s:11,rtl:true}); ltx(g,"جانبية "+nf(st.xw,0)+" kt",r.x+r.w*0.82,r.y+r.h*0.78,{s:11,w:600,rtl:true,c:st.ok?C.ink:C.power});
    ltx(g,"زاوية التصحيح "+nf(st.crab,1)+"°",cx,r.y+14,{s:12,w:600,rtl:true}); },
  plot(st){ return {x:[0,90],y:[0,45],xt:[0,30,45,60,90],xl:"زاوية الريح (°)",yl:"kt",curves:[{f:a=>st.W*Math.sin(a*D2R),c:"hyd"},{f:a=>st.W*Math.cos(a*D2R),c:"muted",dash:[4,3]}],hl:[{y:st.lim,t:"الحد",c:"power"}],dots:[{x:st.ang,y:st.xw,c:st.ok?"ctrl":"power"}],leg:[{c:"hyd",t:"جانبية"},{c:"muted",t:"أمامية",dash:[4,3]}]}; },
  ro(st){ return [["المركبة الأمامية",nf(st.hw,1)+" kt"],["المركبة الجانبية",nf(st.xw,1)+" kt"],["زاوية التصحيح",nf(st.crab,1)+"°"],["الحالة",st.ok?"ضمن الحد ✓":"فوق الحد ✗"]]; },
  eq:["أمامية = W cos θ","جانبية = W sin θ","زاوية التصحيح = sin⁻¹(جانبية / TAS)"],
  note:["الحد في دليل الطيران «مُثبت بالتجربة» وليس دائماً حداً هيكلياً، وشركات الطيران تضع حدوداً أقل للمدرج المبتل.","قبل الملامسة يعدّل الطيار الاتجاه ليتوافق الجسم مع المدرج، بالدفة وخفض الجناح المواجه للريح."],
  quiz:[{q:"ريح 20 عقدة بزاوية 30° على المدرج، المركبة الجانبية:",o:["10 kt","17 kt","20 kt"],a:0,why:"sin 30° = 0.5."},
        {q:"زاوية التصحيح أكبر عندما تكون:",o:["سرعة الطائرة أكبر","سرعة الطائرة أقل","الريح أمامية"],a:1,why:"sin(زاوية) = جانبية/TAS."}],
  show:{ar:"اعرض الدفة",fn:()=>lrnSel("fin",1)},
  ref:"الموضوع المقابل: الإقلاع والهبوط مع الرياح الجانبية (Crosswind Operations)."
});
const nrm360=a=>((a%360)+360)%360;
LK("mof",{
  ar:"مثلث الرياح: الاتجاه والسرعة الأرضية", en:"The wind triangle: heading and ground speed",
  alt:"مثلث متجهات فيه سرعة الطائرة في الهواء ومتجه الريح والمسار الناتج فوق الأرض داخل بوصلة، ومنحنى السرعة الأرضية مع اتجاه المسار",
  intro:["الطائرة تطير في كتلة هواء تتحرك. ما تراه الأرض هو مجموع متجه الطائرة في الهواء ومتجه الريح. لكي تتبع الطائرة مساراً معيناً على الخريطة يجب أن يوجّه الطيار الأنف قليلاً نحو الريح.",
         "الريح الأمامية تبطئ السرعة الأرضية والخلفية تزيدها. لذلك تختلف مدة الرحلة نفسها ذهاباً وإياباً، وتختار شركات الطيران مسارات تستفيد من التيارات النفاثة."],
  ctl:[{k:"tas",ar:"السرعة الحقيقية",min:100,max:520,step:5,v:450,f:v=>nf(v,0)+" kt"},{k:"crs",ar:"المسار المطلوب",min:0,max:359,step:1,v:90,f:v=>nf(v,0).padStart(3,"0")+"°"},{k:"wd",ar:"الريح من اتجاه",min:0,max:359,step:1,v:300,f:v=>nf(v,0).padStart(3,"0")+"°"},{k:"ws",ar:"سرعة الريح",min:0,max:180,step:5,v:100,f:v=>nf(v,0)+" kt"}],
  calc(st){ const d=(st.wd-st.crs)*D2R; st.wca=Math.asin(clamp(st.ws*Math.sin(d)/st.tas,-1,1))/D2R; st.gs=st.tas*Math.cos(st.wca*D2R)-st.ws*Math.cos(d); st.hdg=nrm360(st.crs+st.wca);
    st.gsf=c=>{ const dd=(st.wd-c)*D2R, w=Math.asin(clamp(st.ws*Math.sin(dd)/st.tas,-1,1)); return st.tas*Math.cos(w)-st.ws*Math.cos(dd); }; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.5, R=Math.min(r.w,r.h)*0.44, s=R/Math.max(st.tas+st.ws,1)*0.95, dir=a=>[Math.sin(a*D2R),-Math.cos(a*D2R)];
    g.strokeStyle=C.line; g.lineWidth=1; g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.stroke(); [["N",0],["E",90],["S",180],["W",270]].forEach(([t,a])=>{ const d=dir(a); ltx(g,t,cx+d[0]*(R+10),cy+d[1]*(R+10),{c:C.muted,s:10,m:true}); });
    const h=dir(st.hdg), w=dir(st.wd+180), A=[cx,cy], B=[cx+h[0]*st.tas*s,cy+h[1]*st.tas*s], Cc=[B[0]+w[0]*st.ws*s,B[1]+w[1]*st.ws*s];
    larrow(g,A[0],A[1],B[0],B[1],C.hyd,2.5,9); larrow(g,B[0],B[1],Cc[0],Cc[1],C.power,2.5,9); larrow(g,A[0],A[1],Cc[0],Cc[1],C.ctrl,3,10);
    ltx(g,"الاتجاه "+nf(st.hdg,0).padStart(3,"0"),B[0],B[1]-12,{c:C.hyd,s:10,rtl:true}); ltx(g,"المسار",Cc[0],Cc[1]+14,{c:C.ctrl,s:10,rtl:true});
    const f=(st.t*0.2)%1; tplane(g,A[0]+(Cc[0]-A[0])*f,A[1]+(Cc[1]-A[1])*f,Math.min(30,R*0.25),(st.hdg-90)*D2R,C); },
  plot(st){ return {x:[0,360],y:[Math.max(0,st.tas-st.ws-20),st.tas+st.ws+20],xt:[0,90,180,270,360],xl:"المسار (°)",yl:"GS kt",curves:[{f:st.gsf,c:"ctrl"}],hl:[{y:st.tas,t:"TAS",c:"muted"}],dots:[{x:st.crs,y:st.gs}]}; },
  ro(st){ return [["الاتجاه المطلوب للأنف",nf(st.hdg,0).padStart(3,"0")+"°"],["زاوية تصحيح الريح",(st.wca>=0?"+":"")+nf(st.wca,1)+"°"],["السرعة الأرضية",nf(st.gs,0)+" kt"],["زمن 1000 NM",st.gs>1?nf(1000/st.gs,2)+" h":"—"]]; },
  eq:["sin(WCA) = W sin(θ_w − TC) / TAS","GS = TAS cos(WCA) − W cos(θ_w − TC)","HDG = TC + WCA"],
  note:["اتجاه الريح في الأرصاد هو الاتجاه الذي تأتي منه.","الحاسوب الملاحي في الطائرة يحل هذا المثلث باستمرار ويعرض الريح على شاشة الملاحة."],
  quiz:[{q:"ريح من اليمين تجعل الطيار يوجّه الأنف:",o:["نحو اليمين","نحو اليسار","مستقيماً"],a:0,why:"يوجّه نحو الريح ليعوّض انجرافه."},
        {q:"طائرة TAS 450 kt وريح أمامية مباشرة 100 kt، السرعة الأرضية:",o:["550","450","350"],a:2,why:"450 − 100."}],
  show:{ar:"اعرض الإلكترونيات",fn:()=>lrnSel("avionics")},
  ref:"الموضوع المقابل: الملاحة ومثلث الرياح (Wind Triangle)."
});
LK("mof",{
  ar:"تخطيط النزول: متى تبدأ الهبوط", en:"Descent planning: when to start down",
  alt:"مقياس معدل الصعود والهبوط يعرض معدل النزول، ومقطع جانبي لمسار النزول من ارتفاع الطيران حتى المطار مع نقطة بدء النزول",
  intro:["الطائرة النفاثة تنزل بأقل وقود إذا خففت المحركات إلى الحد الأدنى وانزلقت بزاوية ثابتة. على الطيار أن يعرف متى يبدأ: مبكراً جداً يعني طيراناً منخفضاً مكلفاً، ومتأخراً جداً يعني الحاجة للكوابح الهوائية.",
         "القاعدة المشهورة: لمسار 3° تحتاج 3 أميال بحرية لكل 1000 قدم. ومعدل النزول المناسب ≈ السرعة الأرضية × 5 قدم/دقيقة."],
  ctl:[{k:"alt",ar:"ارتفاع الطيران",min:20000,max:41000,step:500,v:37000,f:v=>nf(v,0)+" ft"},{k:"tgt",ar:"الارتفاع المستهدف",min:0,max:10000,step:100,v:1500,f:v=>nf(v,0)+" ft"},{k:"gs",ar:"متوسط السرعة الأرضية",min:250,max:480,step:5,v:400,f:v=>nf(v,0)+" kt"},{k:"gam",ar:"زاوية النزول",min:2,max:4,step:0.1,v:3,f:v=>nf(v,1)+"°"}],
  calc(st){ const dh=st.alt-st.tgt, tg=Math.tan(st.gam*D2R); st.dist=dh/(6076*tg); st.rule=dh/1000*3; st.rod=st.gs*101.27*tg; st.time=dh/st.rod; },
  scene(g,r,st,C){ const R=Math.min(r.w*0.36,r.h*0.4); kGauge(g,r.x+r.w*0.5,r.y+r.h*0.45,R,-st.rod/1000,-6,6,C,{a0:180,sw:180,step:2,minor:2,lf:v=>nf(Math.abs(v),0),label:"VS ×1000",val:"−"+nf(st.rod,0)+" ft/min"});
    ltx(g,"صعود",r.x+r.w*0.5+R*0.7,r.y+r.h*0.45-R*0.2,{c:"#9fb0bf",s:9,rtl:true}); ltx(g,"نزول",r.x+r.w*0.5-R*0.7,r.y+r.h*0.45-R*0.2,{c:"#9fb0bf",s:9,rtl:true}); },
  plot(st){ const d=st.dist; return {x:[0,d*1.25],y:[0,42000],xl:"المسافة إلى الهدف NM",yl:"ft",lines:[{pts:[[d*1.25,st.alt],[d,st.alt],[0,st.tgt]],c:"hyd",w:2.6}],vl:[{x:d,c:"power",t:"TOD"}],dots:[{x:d,y:st.alt,t:nf(d,0)+" NM"}]}; },
  ro(st){ return [["نقطة بدء النزول",nf(st.dist,0)+" NM قبل الهدف"],["بقاعدة 3 لكل 1000",nf(st.rule,0)+" NM"],["معدل النزول",nf(st.rod,0)+" ft/min"],["زمن النزول",nf(st.time,1)+" min"]]; },
  eq:["المسافة (NM) = Δh / (6076 · tan γ)","معدل النزول (ft/min) = GS (kt) × 101.3 × tan γ","لـ 3°: المسافة ≈ 3 × Δh/1000 ، والمعدل ≈ 5 × GS"],
  note:["في الواقع يضيف الطيار مسافة لتخفيف السرعة قبل 10000 قدم (حد 250 عقدة في دول كثيرة) وللرياح.","الحاسوب الملاحي يحسب نقطة بدء النزول تلقائياً ويعرضها على شاشة الملاحة."],
  quiz:[{q:"من 37000 إلى 1000 قدم بمسار 3°، المسافة تقريباً:",o:["36 NM","108 NM","300 NM"],a:1,why:"3 × 36 = 108."},
        {q:"سرعة أرضية 300 عقدة على 3°، معدل النزول تقريباً:",o:["900 ft/min","1500 ft/min","3000 ft/min"],a:1,why:"300 × 5 = 1500."}],
  ref:"الموضوع المقابل: أداء النزول (Descent Performance)."
});
LK("mof",{
  ar:"سرعة القرار V1: التوقف أم الإكمال", en:"V1: accelerate-stop versus accelerate-go",
  alt:"منحنيان لمسافة التوقف ومسافة الإكمال مع محرك معطل بدلالة سرعة تعطل المحرك يتقاطعان عند V1 المتوازن، ومدرج يبين المسافة",
  intro:["إذا تعطل محرك مبكراً في الإقلاع فالتوقف أسهل، وإذا تعطل متأخراً فالإكمال أسلم. مسافة التوقف تزيد مع سرعة التعطل، ومسافة الإكمال تقل معها، والمنحنيان يتقاطعان عند سرعة واحدة: V1 المتوازن.",
         "قبل V1 يتوقف الطيار عند أي عطل خطير، وبعده يكمل الإقلاع حتى لو تعطل محرك. المدرج المبتل يقلل قوة الفرامل فينخفض V1 وتطول المسافة."],
  ctl:[{k:"tw",ar:"الدفع ÷ الوزن",min:0.22,max:0.4,step:0.005,v:0.3,f:v=>nf(v,3)},{k:"mu",ar:"معامل الفرملة",min:0.1,max:0.45,step:0.01,v:0.35,f:v=>nf(v,2)},{k:"vr",ar:"سرعة رفع الأنف VR",min:130,max:170,step:1,v:150,f:v=>nf(v,0)+" kt"}],
  pre:[{ar:"مدرج جاف",set:{mu:0.35}},{ar:"مدرج مبتل",set:{mu:0.18}},{ar:"أربعة محركات",set:{N:4}},{ar:"محركان",set:{N:2}}],
  init(st){ st.N=2; },
  calc(st){ const N=st.N||2, aA=G0*(st.tw-0.02), aO=G0*(st.tw*(N-1)/N-0.02), b=G0*(st.mu+0.04), VR=st.vr/KT, sAir=320;
    st.go=v=>{ const V=v/KT; return V*V/(2*aA)+(VR*VR-V*V)/(2*Math.max(aO,0.2))+sAir; }; st.stop=v=>{ const V=v/KT; return V*V/(2*aA)+V*2+V*V/(2*b); };
    st.v1=st.stop(st.vr)<=st.go(st.vr)?st.vr:kRoot(v=>st.stop(v)-st.go(v),60,st.vr); st.d=st.stop(st.v1); },
  scene(g,r,st,C){ const y=r.y+r.h*0.55, x0=r.x+r.w*0.04, L=r.w*0.92, mx=Math.max(st.d*1.15,2500), X=d=>x0+d/mx*L, s1=st.go(st.v1)-320-((st.vr/KT)**2-(st.v1/KT)**2)/(2*G0*(st.tw*((st.N||2)-1)/(st.N||2)-0.02));
    g.fillStyle=mixC(C.panel,C.ink,0.22); g.fillRect(X(0),y,X(st.d)-X(0),10); for(let d=0;d<=mx;d+=500){ lline(g,[[X(d),y+10],[X(d),y+15]],C.muted,1); if(d%1000===0) ltx(g,nf(d,0),X(d),y+25,{c:C.muted,s:9,m:true}); }
    const xv=X(st.d*0.55); lline(g,[[xv,y-30],[xv,y+10]],C.accent,2,[3,3]); ltx(g,"V1 = "+nf(st.v1,0)+" kt",xv,y-38,{c:C.accent,s:12,w:600,m:true});
    const f=(st.t*0.15)%1, px=X(st.d*0.55*Math.min(1,f*1.6)); tplane(g,Math.min(px,xv),y+5,Math.min(40,r.w*0.08),0,C);
    ltx(g,"طول المدرج المتوازن "+nf(st.d,0)+" m",r.x+r.w*0.5,r.y+r.h*0.88,{s:12,w:600,rtl:true}); },
  plot(st){ return {x:[80,st.vr],y:[0,Math.max(st.go(80),st.stop(st.vr))*1.05],xl:"سرعة تعطل المحرك kt",yl:"m",curves:[{f:st.stop,c:"power"},{f:st.go,c:"ctrl"}],vl:[{x:st.v1,c:"accent"}],dots:[{x:st.v1,y:st.d,c:"accent",t:"V1"}],leg:[{c:"power",t:"توقف"},{c:"ctrl",t:"إكمال"}]}; },
  ro(st){ return [["V1 المتوازن",nf(st.v1,0)+" kt"],["V1 / VR",nf(st.v1/st.vr,2)],["طول المدرج المتوازن",nf(st.d,0)+" m"]]; },
  eq:["مسافة التوقف = V1²/(2a) + V1·t_رد الفعل + V1²/(2b)","مسافة الإكمال = V1²/(2a) + (VR² − V1²)/(2a_OEI) + مسافة الصعود إلى 35 ft","V1 المتوازن: التوقف = الإكمال"],
  note:["نموذج مبسّط بتسارع ثابت ورد فعل ثانيتين ومسافة جوية ثابتة؛ V1 الحقيقي من دليل الأداء ولا يتجاوز VR.","على المدرج المبتل يسمح للطيار باستخدام V1 أقل حتى تكفي مسافة التوقف."],
  quiz:[{q:"إذا تعطل محرك بعد V1:",o:["يتوقف الطيار","يكمل الإقلاع","يعود فوراً"],a:1,why:"بعد V1 لا تكفي مسافة التوقف المتبقية."},
        {q:"المدرج المبتل يجعل V1 المتوازن:",o:["أعلى","أقل","كما هو"],a:1,why:"الفرملة أضعف فمنحنى التوقف يرتفع ويتقاطع مبكراً."}],
  show:{ar:"اعرض العجلات والفرامل",fn:()=>lrnSel("wheels")},
  ref:"الموضوع المقابل: أداء الإقلاع مع تعطل محرك (Engine Failure on Takeoff)."
});
LK("mof",{
  ar:"عنصر شفرة المروحة: الخطوة ونسبة التقدم", en:"Propeller blade element: pitch and advance ratio",
  alt:"مقطع شفرة مروحة بزاويته مع مثلث السرعات الدورانية والأمامية والناتجة وزاوية الهجوم، ومنحنى كفاءة المروحة مع نسبة التقدم",
  intro:["كل مقطع من شفرة المروحة جناح صغير يدور. الهواء يأتيه بمحصلة سرعتين: سرعة الدوران ωr وسرعة الطائرة V. زاوية الهجوم = زاوية الشفرة − زاوية المحصلة.",
         "عندما تزيد سرعة الطائرة تقل زاوية الهجوم، ولذلك تحتاج المروحة «خطوة متغيرة» تزيد زاوية الشفرة مع السرعة. نسبة التقدم J = V/(nD) تلخص الحالة، والكفاءة تصل لقمتها عند J معين لكل زاوية شفرة."],
  ctl:[{k:"V",ar:"سرعة الطيران",min:0,max:200,step:1,v:110,f:v=>nf(v,0)+" kt"},{k:"rpm",ar:"دورات المروحة",min:1500,max:2700,step:10,v:2400,f:v=>nf(v,0)+" rpm"},{k:"beta",ar:"زاوية الشفرة عند 75%",min:10,max:45,step:0.5,v:22,f:v=>nf(v,1)+"°"}],
  pre:[{ar:"إقلاع (خطوة صغيرة)",set:{V:60,beta:14}},{ar:"طيران (خطوة كبيرة)",set:{V:130,beta:28}}],
  calc(st){ const D=1.9, n=st.rpm/60; st.sec=V=>{ const Ut=2*Math.PI*n*0.75*D/2, phi=Math.atan2(V,Ut), al=st.beta*D2R-phi, cl=al<0.26?2*Math.PI*0.9*al:Math.max(0.6,1.47-(al-0.26)*3), cd=0.012+0.9*al*al, gm=Math.atan2(cd,Math.max(cl,1e-3)); return {phi,al,cl,cd,eta:cl>0?Math.tan(phi)/Math.tan(phi+gm):0,Ut}; };
    const s=st.sec(st.V/KT); Object.assign(st,s); st.J=(st.V/KT)/(n*D); st.n=n; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.48, sc=r.w*0.0035, U=st.Ut*sc, Va=st.V/KT*sc*1.5;
    lline(g,[[r.x+10,cy],[r.x+r.w-10,cy]],C.line,1,[3,3]); ltx(g,"مستوى الدوران",r.x+r.w-10,cy-10,{c:C.muted,s:9,a:"right",rtl:true});
    const ch=r.w*0.3; kFoil(g,cx-ch*0.25*Math.cos(st.beta*D2R),cy-ch*0.25*Math.sin(st.beta*D2R)*-1,ch,st.beta,C,{m:0.03,t:0.1});
    const ax=cx+r.w*0.18, ay=cy+r.h*0.05; larrow(g,ax+U,ay,ax,ay,C.hyd,2,7); larrow(g,ax+U,ay-Va,ax+U,ay,C.muted,2,7); larrow(g,ax+U,ay-Va,ax,ay,C.ctrl,2.5,8);
    ltx(g,"ωr",ax+U/2,ay+12,{c:C.hyd,s:11,m:true}); ltx(g,"V",ax+U+10,ay-Va/2,{c:C.muted,s:11,a:"left",m:true}); ltx(g,"المحصلة",ax+U/2-8,ay-Va/2-8,{c:C.ctrl,s:10,a:"right",rtl:true});
    ltx(g,"α = "+nf(st.al/D2R,1)+"°",r.x+r.w*0.2,r.y+r.h*0.9,{s:13,w:600,m:true,c:st.al<0?C.power:C.ink}); },
  plot(st){ const D=1.9, pts=[]; for(let v=0;v<=260;v+=4){ const s=st.sec(v/KT); if(s.eta>0) pts.push([(v/KT)/(st.n*D),s.eta]); } return {x:[0,1.6],y:[0,1],xl:"J = V/(nD)",yl:"η",lines:[{pts,c:"hyd"}],dots:[{x:st.J,y:Math.max(0,st.eta),t:nf(Math.max(0,st.eta)*100,0)+"%"}]}; },
  ro(st){ return [["نسبة التقدم J",nf(st.J,3)],["زاوية المحصلة φ",nf(st.phi/D2R,1)+"°"],["زاوية الهجوم α",nf(st.al/D2R,1)+"°"],["كفاءة المقطع",nf(Math.max(0,st.eta)*100,1)+"%"]]; },
  eq:["φ = tan⁻¹(V / ωr) ، α = β − φ","J = V / (nD)","η ≈ tan φ / tan(φ + γ) ، tan γ = c_d / c_l"],
  note:["الحساب لمقطع واحد عند 75% من نصف القطر، وهو تقريب شائع لأداء المروحة كاملة.","عند الإقلاع والسرعة صفر تكون الكفاءة صفراً بالتعريف رغم أن الدفع كبير."],
  quiz:[{q:"زيادة سرعة الطائرة مع ثبات زاوية الشفرة تجعل زاوية الهجوم:",o:["تزيد","تقل","لا تتغير"],a:1,why:"φ تزيد مع V، وα = β − φ."},
        {q:"لماذا تُستخدم المراوح متغيرة الخطوة؟",o:["لتبقى زاوية الهجوم مناسبة في كل السرعات","لتقليل الوزن","للصوت فقط"],a:0,why:"كل سرعة تحتاج زاوية شفرة مختلفة لأفضل كفاءة."}],
  ref:"الموضوع المقابل: نظرية عنصر الشفرة (Blade Element Theory)."
});
LK("mof",{
  ar:"نمط الانتظار: نصف القطر والتوقيت مع الريح", en:"The holding pattern: radius and timing in wind",
  alt:"نمط انتظار بيضوي بساقين ونصفي دائرة مع سهم الريح وطائرة تدور، ومنحنى نصف قطر الدوران مع السرعة",
  intro:["عندما يُطلب من الطائرة الانتظار تدور في نمط بيضوي: ساق داخلية مدتها دقيقة (تحت 14000 قدم)، ونصف دائرة، وساق خارجية، ونصف دائرة. الدوران بمعدل 3° في الثانية أو بميل 25° أيهما أقل.",
         "مع وجود ريح يعدّل الطيار زمن الساق الخارجية لتبقى الداخلية دقيقة واحدة: إذا كانت الريح أمامية في الداخلية تكون الخارجية أقصر زمناً."],
  ctl:[{k:"tas",ar:"السرعة الحقيقية",min:150,max:300,step:5,v:220,f:v=>nf(v,0)+" kt"},{k:"bmax",ar:"أقصى ميل",min:15,max:30,step:1,v:25,f:v=>nf(v,0)+"°"},{k:"w",ar:"ريح أمامية على الساق الداخلية",min:-40,max:40,step:1,v:20,f:v=>nf(v,0)+" kt"}],
  calc(st){ const V=st.tas/KT, b1=Math.atan(V*3*D2R/G0)/D2R; st.bank=Math.min(st.bmax,b1); st.R=V*V/(G0*Math.tan(st.bank*D2R))/1852; st.rate=G0*Math.tan(st.bank*D2R)/V/D2R; st.tout=60*(st.tas-st.w)/(st.tas+st.w); },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.48, Lin=(st.tas-st.w)/60, sc=Math.min(r.w*0.6/(Lin+2*st.R),r.h*0.6/(2*st.R)), L=Lin*sc, R=st.R*sc, per=2*L+2*Math.PI*R, d=(st.t*0.1*per)%per;
    g.strokeStyle=C.hyd; g.lineWidth=2; g.beginPath(); g.moveTo(cx+L/2,cy+R); g.lineTo(cx-L/2,cy+R); g.arc(cx-L/2,cy,R,Math.PI/2,Math.PI*1.5); g.lineTo(cx+L/2,cy-R); g.arc(cx+L/2,cy,R,-Math.PI/2,Math.PI/2); g.stroke();
    let x,y,a; if(d<L){ x=cx+L/2-d; y=cy+R; a=Math.PI; } else if(d<L+Math.PI*R){ const t=(d-L)/R; x=cx-L/2-Math.sin(t)*R; y=cy+Math.cos(t)*R; a=Math.PI+t; } else if(d<2*L+Math.PI*R){ x=cx-L/2+(d-L-Math.PI*R); y=cy-R; a=0; } else { const t=(d-2*L-Math.PI*R)/R; x=cx+L/2+Math.sin(t)*R; y=cy-Math.cos(t)*R; a=t; }
    tplane(g,x,y,Math.min(30,R*0.6),a,C); ldot(g,cx-L/2,cy+R,5,C.power); ltx(g,"نقطة الانتظار",cx-L/2,cy+R+16,{c:C.power,s:10,rtl:true}); ltx(g,"الداخلية: 1 دقيقة",cx,cy+R-12,{s:10,rtl:true}); ltx(g,"الخارجية: "+nf(st.tout,0)+" ثانية",cx,cy-R+16,{s:10,rtl:true});
    if(Math.abs(st.w)>0.5){ const s=Math.sign(st.w), ax=r.x+r.w*0.12; larrow(g,ax-s*20,r.y+r.h*0.1,ax+s*20,r.y+r.h*0.1,C.power,2.5,8); ltx(g,"الريح",ax,r.y+r.h*0.1+14,{c:C.power,s:10,rtl:true}); } },
  plot(st){ return {x:[150,300],y:[0,4],xl:"TAS kt",yl:"R NM",curves:[{f:v=>{ const V=v/KT, b=Math.min(st.bmax,Math.atan(V*3*D2R/G0)/D2R); return V*V/(G0*Math.tan(b*D2R))/1852; },c:"hyd"}],dots:[{x:st.tas,y:st.R}]}; },
  ro(st){ return [["الميل المستخدم",nf(st.bank,1)+"°"],["معدل الدوران",nf(st.rate,2)+"°/s"],["نصف القطر",nf(st.R,2)+" NM"],["زمن الساق الخارجية",nf(st.tout,0)+" s"]]; },
  eq:["ميل الدوران القياسي = tan⁻¹(V·ω/g) ، ω = 3°/s","R = V² / (g tan φ)","زمن الخارجية ≈ 60 × (TAS − W)/(TAS + W) ثانية"],
  note:["فوق 14000 قدم تكون الساق دقيقة ونصفاً، والسرعات القصوى للانتظار محددة بالارتفاع.","معادلة زمن الخارجية تقريبية وتهمل أثر الريح أثناء الدوران."],
  quiz:[{q:"عند السرعات العالية لا تستطيع الطائرة الدوران بمعدل 3°/s لأن:",o:["الميل المطلوب أكبر من 25°","المحرك ضعيف","الريح قوية"],a:0,why:"tan φ = Vω/g يزيد مع V."},
        {q:"مع ريح أمامية على الساق الداخلية، الخارجية تكون:",o:["أطول زمناً","أقصر زمناً","دقيقة دائماً"],a:1,why:"الريح تساعدها في الخارجية فتقطع المسافة أسرع."}],
  ref:"الموضوع المقابل: الطيران المنحني والملاحة (Turning Flight, Holding)."
});
LK("mof",{
  ar:"ميل الصعود وتجاوز العوائق", en:"Climb gradient and obstacle clearance",
  alt:"مقطع جانبي لمسار صعود بعد الإقلاع وعائق جبلي على مسافة، والمسار أخضر إذا تجاوزه وأحمر إذا لم يتجاوزه، ومنحنى معدل الصعود المطلوب مع السرعة الأرضية",
  intro:["معدل الصعود (قدم في الدقيقة) لا يكفي وحده لتجاوز العوائق؛ المهم «الميل»: كم ترتفع الطائرة لكل مسافة أفقية. نفس المعدل مع سرعة أرضية أكبر يعطي ميلاً أصغر.",
         "إجراءات المغادرة تحدد ميلاً أدنى (مثل 3.3% أو أكثر بسبب جبل). على الطيار أن يحسب معدل الصعود المطلوب من سرعته الأرضية، وتزيد الحاجة مع الريح الخلفية."],
  ctl:[{k:"roc",ar:"معدل الصعود",min:300,max:4000,step:50,v:1500,f:v=>nf(v,0)+" ft/min"},{k:"gs",ar:"السرعة الأرضية",min:80,max:250,step:1,v:160,f:v=>nf(v,0)+" kt"},{k:"oh",ar:"ارتفاع العائق",min:100,max:3000,step:50,v:900,f:v=>nf(v,0)+" ft"},{k:"od",ar:"بُعد العائق",min:1,max:10,step:0.1,v:4,f:v=>nf(v,1)+" NM"}],
  calc(st){ st.grad=st.roc/(st.gs*101.27); st.ftnm=st.roc/st.gs*60; st.req=st.oh/(st.od*6076); st.rocreq=st.req*st.gs*101.27; st.hat=st.grad*st.od*6076; st.ok=st.hat>=st.oh; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.05, y0=r.y+r.h*0.85, L=r.w*0.9, D=Math.max(st.od*1.4,3), H=Math.max(st.oh*1.5,st.hat*1.1,1000), X=d=>x0+d/D*L, Y=h=>y0-h/H*r.h*0.75;
    lline(g,[[x0,y0],[x0+L,y0]],C.ink,2); g.fillStyle=mixC(C.panel,C.struct,0.5); g.beginPath(); g.moveTo(X(st.od-0.6),y0); g.lineTo(X(st.od),Y(st.oh)); g.lineTo(X(st.od+0.6),y0); g.closePath(); g.fill();
    lline(g,[[X(0),y0],[X(D),Y(st.grad*D*6076)]],st.ok?C.ctrl:C.power,2.5); const f=(st.t*0.12)%1; tplane(g,X(D*f),Y(st.grad*D*f*6076),Math.min(28,r.w*0.07),-Math.atan(st.grad*4),C);
    ltx(g,"العائق "+nf(st.oh,0)+" ft",X(st.od),Y(st.oh)-12,{s:10,rtl:true}); ltx(g,st.ok?"يتجاوز العائق بـ "+nf(st.hat-st.oh,0)+" ft":"لا يتجاوز العائق!",r.x+r.w*0.5,r.y+14,{s:12,w:600,c:st.ok?C.ctrl:C.power,rtl:true}); },
  plot(st){ return {x:[80,250],y:[0,Math.max(4000,st.rocreq*1.2)],xl:"GS kt",yl:"ft/min المطلوب",curves:[{f:v=>st.req*v*101.27,c:"power"}],dots:[{x:st.gs,y:st.roc,c:st.ok?"ctrl":"power",t:"الحالي"}]}; },
  ro(st){ return [["الميل الحالي",nf(st.grad*100,2)+"%"],["قدم لكل ميل بحري",nf(st.ftnm,0)+" ft/NM"],["الميل المطلوب للعائق",nf(st.req*100,2)+"%"],["معدل الصعود المطلوب",nf(st.rocreq,0)+" ft/min"]]; },
  eq:["الميل = ROC / (GS × 101.3)","قدم لكل NM = ROC × 60 / GS","ROC المطلوب = الميل × GS × 101.3"],
  note:["في الإجراءات الحقيقية يضاف هامش فوق العائق، ويحسب الميل من نهاية المدرج.","الحساب هنا لميل ثابت، والصعود الحقيقي يتغير مع السرعة والارتفاع."],
  quiz:[{q:"نفس معدل الصعود مع ريح خلفية قوية يجعل الميل:",o:["أكبر","أصغر","كما هو"],a:1,why:"السرعة الأرضية أكبر فتقطع مسافة أكبر لنفس الارتفاع."},
        {q:"ميل 5% بسرعة أرضية 200 kt يحتاج معدل صعود حوالي:",o:["500 ft/min","1000 ft/min","2000 ft/min"],a:1,why:"0.05 × 200 × 101 ≈ 1013."}],
  ref:"الموضوع المقابل: الصعود والإجراءات بعد الإقلاع (Climb Gradient)."
});
LK("mof",{
  ar:"الريح الأمامية وسرعة أفضل مدى", en:"Headwind and best-range speed",
  alt:"طائرة تطير ضد ريح أمامية، ومنحنى الوقود لكل 100 كيلومتر أرضي مع السرعة بدون ريح ومع الريح، وأفضل سرعة تزيد مع الريح الأمامية",
  intro:["ما يهم شركة الطيران هو الوقود لكل كيلومتر على الأرض، لا في الهواء. في الريح الأمامية تقل السرعة الأرضية، فيصبح البقاء وقتاً أطول في الهواء مكلفاً، ويستحق الطيران أسرع قليلاً.",
         "في الريح الخلفية العكس: يمكن الإبطاء قليلاً لأن الريح تحمل الطائرة. لهذا يغيّر حاسوب إدارة الطيران السرعة الاقتصادية حسب الريح."],
  ctl:[{k:"w",ar:"ريح أمامية (سالب = خلفية)",min:-100,max:150,step:5,v:120,f:v=>nf(v,0)+" kt"},{k:"m",ar:"الكتلة",min:50,max:79,step:0.5,v:68,f:v=>nf(v,1)+" t"}],
  calc(st){ const S=124.6, k=1/(Math.PI*0.78*9.45), at=isa(35000*0.3048), W=st.m*1000*G0, tsfc=1.6e-5;
    st.D=V=>{ const q=0.5*at.rho*V*V, CL=W/(q*S), M=V/at.a; return q*S*(0.022+k*CL*CL+(M>0.68?20*Math.pow(M-0.68,4):0)); };
    st.fpk=(V,w)=>{ const gs=V-w/KT; return gs>5?tsfc*st.D(V)/gs*100000:NaN; };
    const best=w=>{ let bv=1e9,bV=0; for(let V=170;V<=270;V+=0.5){ const f=st.fpk(V,w); if(f<bv){ bv=f; bV=V; } } return [bV,bv]; };
    [st.V0,st.f0]=best(0); [st.Vw,st.fw]=best(st.w); st.fslow=st.fpk(st.V0,st.w); st.save=(st.fslow-st.fw)/st.fslow*100; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.45; lplane(g,cx,cy,Math.min(r.w*0.6,180),0,C);
    for(let i=0;i<8;i++){ const y=r.y+r.h*(0.15+0.1*i), s=Math.sign(st.w)||1, f=((st.t*0.4*s+i*0.17)%1+1)%1, x=r.x+(s>0?(1-f):f)*r.w; if(Math.abs(st.w)>2) larrow(g,x,y,x-s*16,y,mixC(C.power,C.panel,0.4),1.5,5); }
    ltx(g,"أفضل سرعة: "+nf(st.Vw*KT,0)+" kt TAS",cx,r.y+r.h*0.8,{s:13,w:600,rtl:true,c:C.ctrl}); ltx(g,"بدون ريح: "+nf(st.V0*KT,0)+" kt",cx,r.y+r.h*0.9,{s:11,c:C.muted,rtl:true}); },
  plot(st){ const lo=170*KT, hi=270*KT; return {x:[lo,hi],y:[0,Math.max(st.fpk(170,st.w),st.fpk(270,st.w),st.fpk(170,0))*1.1||800],xl:"TAS kt",yl:"kg / 100 km",curves:[{f:v=>st.fpk(v/KT,0),c:"muted",dash:[4,3]},{f:v=>st.fpk(v/KT,st.w),c:"hyd"}],dots:[{x:st.V0*KT,y:st.f0,c:"muted",r:4},{x:st.Vw*KT,y:st.fw,c:"ctrl",t:"الأفضل"}],leg:[{c:"hyd",t:"مع الريح"},{c:"muted",t:"بدون",dash:[4,3]}]}; },
  ro(st){ return [["أفضل TAS بدون ريح",nf(st.V0*KT,0)+" kt"],["أفضل TAS مع الريح",nf(st.Vw*KT,0)+" kt"],["الوقود لكل 100 km أرضي",nf(st.fw,0)+" kg"],["التوفير مقارنة بسرعة بلا ريح",nf(Math.max(0,st.save),1)+"%"]]; },
  eq:["الوقود لكل كيلومتر أرضي ∝ D(V) / (V − V_w)","أفضل سرعة: d/dV [ (V − V_w)/D ] = 0"],
  note:["النموذج لطائرة بحجم 737-800 على 35000 قدم مع ارتفاع سحب الانضغاط فوق ماخ 0.68 تقريباً.","في الواقع يدخل سعر الوقت أيضاً (مؤشر التكلفة Cost Index) فتطير الشركات أسرع قليلاً من أفضل مدى."],
  quiz:[{q:"في ريح أمامية قوية، أفضل سرعة للمدى:",o:["تزيد","تقل","لا تتغير"],a:0,why:"البقاء في الريح أطول مكلف، فالأسرع أفضل."},
        {q:"لماذا يقل التوفير عندما تكون الريح خفيفة؟",o:["لأن المنحنى مسطح قرب القمة","لأن المحرك يتغير","لأن الوزن يقل"],a:0,why:"قرب أفضل سرعة يتغير الاستهلاك ببطء."}],
  show:{ar:"اعرض المحرك",fn:()=>lrnSel("engine")},
  ref:"الموضوع المقابل: المدى وأثر الرياح (Range in Wind)."
});
