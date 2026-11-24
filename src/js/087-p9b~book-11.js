/* ---------- Book 11: Jet Aircraft Systems (3/3): rectifiers, air systems, oxygen, evacuation, fire ---------- */
/* ---- 19 ---- */
LK("asy",{
  ar:"محوّل التيار TRU: التقويم والتموّج", en:"Transformer rectifier unit and ripple",
  alt:"مخطط كتلي من محوّل ثم مقوّم ثم مرشح إلى 28 فولت، وموجة الخرج المقوّمة مع التموّج قبل المرشح وبعده",
  intro:["معظم أجهزة الطائرة الإلكترونية تحتاج تياراً مستمراً بجهد 28 V تقريباً، بينما المولّد يعطي 115/200 V متناوب. تخفض وحدة TRU الجهد بمحوّل ثم تقوّم الأطوار الثلاثة بستة صمامات، فيصير الخرج ست نبضات في كل دورة، وتردده 6 f.",
         "الخرج المقوّم غير المرشّح له تموّج يقارب 14% بين الذروة والقاع. يضيف مكثف الخرج سحباً للتيار بين النبضات فيقل التموّج إلى ΔV ≈ I / (6 f · C). تموّج أقل يعني أجهزة أهدأ وبطاريات أطول عمراً."],
  ctl:[{k:"f",ar:"تردد المولّد",min:300,max:800,step:10,v:400,f:v=>nf(v,0)+" Hz"},{k:"Iz",ar:"تيار الحمل",min:5,max:100,step:1,v:50,f:v=>nf(v,0)+" A"},{k:"Cm",ar:"مكثف المرشح",min:0,max:20,step:0.5,v:10,f:v=>nf(v,1)+" mF"},{k:"Vd",ar:"جهد الخرج المستهدف",min:24,max:30,step:0.5,v:28,f:v=>nf(v,1)+" V"}],
  calc(st){ const fr=6*st.f, Vpk=st.Vd/0.955, T=1/st.f, dt=T/1200, N=Math.round(2.2*T/dt); st.rect=[]; st.filt=[]; let v=0; const C=st.Cm*1e-3; const e=t=>{ const a=((t*st.f*6)%1+1)%1; return Vpk*Math.cos((a-0.5)*Math.PI/3); };
    for(let i=0;i<N;i++){ const t=i*dt, et=e(t); v=C>0?Math.max(et,v-st.Iz/C*dt):et; if(i%6===0){ st.rect.push([t*1000,et]); st.filt.push([t*1000,v]); } }
    const last=st.filt.filter(p=>p[0]>T*1000*1.1), vs=last.map(p=>p[1]); st.vmax=Math.max(...vs); st.vmin=Math.min(...vs); st.rpp=st.vmax-st.vmin; st.mean=(st.vmax+st.vmin)/2; st.rpct=st.rpp/st.mean*100; st.fr=fr; st.Vpk=Vpk; st.Pd=st.Iz*st.mean; st.Vpp0=Vpk*(1-Math.cos(Math.PI/6)); },
  scene(g,r,st,C){ const y=r.y+r.h*0.4, bw=r.w*0.2, bh=r.h*0.2, xs=[r.x+r.w*0.04,r.x+r.w*0.28,r.x+r.w*0.52,r.x+r.w*0.76], tx=["محوّل","مقوّم","مرشح","28 V"], cl=["struct","power","hyd","fuel"];
    xs.forEach((x,i)=>{ kBox(g,x,y,bw,bh,mixC(C.panel,KC(cl[i],C),0.35),C,tx[i],{s:12}); if(i<3) larrow(g,x+bw,y+bh/2,xs[i+1],y+bh/2,C.muted,1.6,6); });
    ltx(g,"115/200 V · "+nf(st.f,0)+" Hz",xs[0]+bw/2,y-14,{s:11,m:true}); ltx(g,"تموّج "+nf(st.rpct,1)+" %",xs[2]+bw/2,y+bh+18,{s:12,w:600,rtl:true,c:st.rpct>5?C.power:C.ink}); ltx(g,nf(st.mean,1)+" V · "+nf(st.Pd/1000,2)+" kW",xs[3]+bw/2,y+bh+18,{s:11,m:true});
    const wy=r.y+r.h*0.78, ww=r.w*0.84, wx=r.x+r.w*0.08, hh=r.h*0.1; const ph=(st.t*0.6)%1; lline(g,[[wx,wy+hh],[wx+ww,wy+hh]],C.line,1);
    lline(g,st.rect.map(p=>[wx+p[0]/(st.rect[st.rect.length-1][0])*ww,wy+hh-(p[1]/st.Vpk)*hh]),C.muted,1.2); lline(g,st.filt.map(p=>[wx+p[0]/(st.filt[st.filt.length-1][0])*ww,wy+hh-(p[1]/st.Vpk)*hh]),C.power,2); ldot(g,wx+ww*ph,wy+hh-(st.filt[Math.floor(ph*(st.filt.length-1))][1]/st.Vpk)*hh,3.5,C.ink); },
  plot(st){ return {x:[0,st.rect[st.rect.length-1][0]],y:[0,st.Vpk*1.08],xl:"الزمن ms",yl:"الجهد V",lines:[{pts:st.rect,c:"muted",w:1.2},{pts:st.filt,c:"power",w:2.2}],leg:[{c:"muted",t:"قبل المرشح"},{c:"power",t:"بعد المرشح"}],hl:[{y:st.mean,c:"hyd",t:"المتوسط"}]}; },
  ro(st){ return [["تردد التموّج 6 f",nf(st.fr,0)+" Hz"],["التموّج قبل المرشح",nf(st.Vpp0,2)+" V"],["التموّج بعد المرشح",nf(st.rpp,2)+" V"],["نسبة التموّج",nf(st.rpct,1)+" %"],["الجهد المتوسط",nf(st.mean,2)+" V"]]; },
  eq:["V_dc ≈ 0.955 V_pk","ΔV_بلا مرشح = V_pk (1 − cos 30°)","ΔV_بمكثف ≈ I / (6 f C)"],
  note:["المحاكاة مثالية: لا مقاومة محوّل ولا انخفاض صمام، والتحكم في الجهد غير مدرج. الغرض بيان أثر التردد والمكثف على التموّج.","في الطائرات الحقيقية تُقاس جودة التيار المستمر بتموّجه أيضاً، وتراقب الأنظمة ذلك حفاظاً على الأجهزة."],
  quiz:[{q:"لماذا يكون تموّج مقوّم الأطوار الثلاثة أقل من الطور الواحد؟",o:["لأن نبضاته ست في الدورة وأقرب إلى القيمة العظمى","لأنه أسخن","لأن جهده أعلى"],a:0,why:"النبضات المتقاربة تترك هبوطاً أصغر بين كل نبضة والتي تليها."},
        {q:"ماذا يحدث للتموّج إذا ارتفع تيار الحمل مع بقاء المكثف؟",o:["يزداد","يقل","لا يتغير"],a:0,why:"ΔV ≈ I/(6 f C)."}],
  show:{ar:"اعرض محوّلات التيار",fn:()=>lrnSel("tru")},
  ref:"الموضوع: وحدات المحوّل المقوّم (Transformer Rectifier Units)."
});
/* ---- 20 ---- */
LK("asy",{
  ar:"جدول ضغط المقصورة: ارتفاع المقصورة والفرق الأقصى", en:"Cabin pressure schedule",
  alt:"منحنى ارتفاع المقصورة مع ارتفاع الطيران وحد 8000 قدم وفرق الضغط الأقصى",
  intro:["جسم الطائرة يتحمل فرق ضغط محدداً بين الداخل والخارج Δp_max. الطائرة ترفع الضغط داخل المقصورة ليبقى مريحاً، لكن لا يمكن أن يتجاوز الفرق الحد. فعند الارتفاع الأعلى يصبح ضغط المقصورة p_amb + Δp_max ويرتفع 'ارتفاع المقصورة' تدريجياً.",
         "يُصمَّم الجدول بحيث لا يتجاوز ارتفاع المقصورة نحو 8000 قدم عند أعلى ارتفاع طيران للطائرة. أما معدل صعود المقصورة فيبقى صغيراً (نحو 300–500 قدم/د) حفاظاً على راحة الأذنين."],
  ctl:[{k:"ft",ar:"ارتفاع الطيران",min:0,max:45000,step:500,v:37000,f:v=>nf(v,0)+" ft"},{k:"dp",ar:"فرق الضغط الأقصى",min:6,max:10,step:0.1,v:8.6,f:v=>nf(v,1)+" psi"},{k:"vs",ar:"معدل صعود الطائرة",min:0,max:3000,step:100,v:1800,f:v=>nf(v,0)+" ft/min"},{k:"ca",ar:"حد ارتفاع المقصورة المسموح",min:6000,max:10000,step:100,v:8000,f:v=>nf(v,0)+" ft"}],
  calc(st){ const FT=0.3048, ps=101.325, ppa=st.dp*6.89476; st.cab=ft=>{ const pc=Math.min(ps,isa(ft*FT).p/1000+ppa); let lo=0,hi=60000; for(let i=0;i<40;i++){ const m=(lo+hi)/2; if(isa(m*FT).p/1000>pc) lo=m; else hi=m; } return lo<30?0:lo; };
    st.ch=st.cab(st.ft); st.pa=isa(st.ft*FT).p/1000; st.dpn=Math.min(ps,st.pa+ppa)-st.pa; st.rc=(st.cab(st.ft+250)-st.cab(Math.max(0,st.ft-250)))/(st.ft<250?250+st.ft:500)*st.vs; st.okc=st.ch<=st.ca; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.5, rx=r.w*0.4, ry=r.h*0.2; g.fillStyle=mixC(C.panel,C.struct,0.25); g.strokeStyle=C.ink; g.lineWidth=1.5; g.beginPath(); g.ellipse(cx,cy,rx,ry,0,0,Math.PI*2); g.fill(); g.stroke();
    const pulse=1+0.03*Math.sin(st.t*3); g.strokeStyle=mixC(C.panel,C.hyd,0.8); g.lineWidth=2; g.beginPath(); g.ellipse(cx,cy,rx*0.9*pulse,ry*0.8*pulse,0,0,Math.PI*2); g.stroke();
    for(let i=0;i<10;i++){ const a=i*Math.PI/5+st.t*0.2; larrow(g,cx+Math.cos(a)*rx*1.02,cy+Math.sin(a)*ry*1.02,cx+Math.cos(a)*rx*(1.02+0.1*Math.min(1,st.dpn/60)),cy+Math.sin(a)*ry*(1.02+0.1*Math.min(1,st.dpn/60)),C.power,1.4,5); }
    ltx(g,"داخل المقصورة: "+nf(st.ch,0)+" ft",cx,cy-6,{s:13,w:600,rtl:true}); ltx(g,"فرق الضغط "+nf(st.dpn/6.89476,2)+" psi",cx,cy+14,{s:12,rtl:true,c:C.muted}); ltx(g,"الارتفاع الخارجي "+nf(st.ft,0)+" ft",cx,r.y+r.h*0.12,{s:12,rtl:true}); },
  plot(st){ const pts=[]; for(let h=0;h<=45000;h+=500) pts.push([h,st.cab(h)]); return {x:[0,45000],y:[0,10000],xl:"ارتفاع الطيران ft",yl:"ارتفاع المقصورة ft",lines:[{pts,c:"hyd",w:2.4}],hl:[{y:st.ca,c:"power",t:"الحد"}],dots:[{x:st.ft,y:st.ch,c:st.okc?"hyd":"power"}]}; },
  ro(st){ return [["ارتفاع المقصورة",nf(st.ch,0)+" ft"],["ضغط الجو",nf(st.pa,1)+" kPa"],["فرق الضغط الحالي",nf(st.dpn/6.89476,2)+" psi"],["معدل صعود المقصورة",nf(st.rc,0)+" ft/min"],["حالة الارتفاع",st.okc?"ضمن الحد":"فوق الحد: الطائرة فوق سقفها"],["حالة المعدل",st.rc>500?"أعلى من المريح":"مريح"]]; },
  eq:["p_مقصورة = min( p_أرض ,  p_جو + Δp_max )","ارتفاع المقصورة = الارتفاع الجوي المكافئ لـ p_مقصورة","معدل صعود المقصورة = (d h_مقصورة / d h) × معدل صعود الطائرة"],
  note:["الجدول المبسط يُبقي المقصورة عند مستوى البحر حتى يبلغ الفرق حده الأقصى. أنظمة الطائرات الحقيقية تضيف منحنيات هبوط وصعود لراحة الركاب.","الفرق الأقصى وأرقام الارتفاع هنا أمثلة؛ الحدود المعتمدة في دليل الطائرة."],
  quiz:[{q:"عند الارتفاع الأعلى، ارتفاع المقصورة:",o:["يزداد قليلاً لأن فرق الضغط محدود","يبقى عند الصفر","ينقص"],a:0,why:"ضغط المقصورة = ضغط الجو + Δp_max."},
        {q:"لماذا يبقى معدل صعود المقصورة صغيراً؟",o:["لراحة الأذنين","لتوفير الوقود","لتبريد الهواء"],a:0,why:"تغيّر الضغط السريع يؤذي الأذن."}],
  show:{ar:"اعرض صمام التفريغ",fn:()=>lrnSel("outflow_valve")},
  ref:"الموضوع: أنظمة تضغيط المقصورة (Cabin Pressurization)."
});
/* ---- 21 ---- */
LK("asy",{
  ar:"وحدة دورة الهواء: التبريد بالتمدد", en:"Air cycle machine: cooling by expansion",
  alt:"مخطط: هواء ساخن من المحرك ثم مبادل حراري ثم توربين يوسّع الهواء ويبرده، ومنحنى حرارة الخروج مع نسبة التمدد",
  intro:["هواء المحرك المسحوب ساخن وكثيف ويصل لنحو 200 °C أو أكثر. تبرّده الوحدة بمرحلتين: مبادل حراري يمرر الحرارة إلى هواء خارجي، ثم توربين يوسّع الهواء من ضغط مرتفع إلى ضغط المقصورة فيبرد بشدة لأنه ينجز شغلاً على عمود التوربين.",
         "الحرارة بعد التمدد: T₂ = T₁ [1 − η_t (1 − π^(−(γ−1)/γ))] بحيث π نسبة الضغط عبر التوربين وη_t كفاءته. كلما زادت نسبة التمدد انخفضت الحرارة أكثر، لكن الرطوبة قد تتجمد في مخرج التوربين، فيُراقَب أن تبقى فوق نحو 0 °C."],
  ctl:[{k:"Tb",ar:"حرارة هواء السحب",min:150,max:260,step:5,v:200,f:v=>nf(v,0)+" °C"},{k:"Tr",ar:"حرارة هواء التبريد الخارجي",min:-10,max:50,step:1,v:30,f:v=>nf(v,0)+" °C"},{k:"ep",ar:"فعالية المبادل",min:0.5,max:0.95,step:0.01,v:0.75,f:v=>nf(v*100,0)+" %"},{k:"pi",ar:"نسبة التمدد",min:1.2,max:4,step:0.05,v:2.2,f:v=>nf(v,2)},{k:"et",ar:"كفاءة التوربين",min:0.6,max:0.92,step:0.01,v:0.8,f:v=>nf(v*100,0)+" %"}],
  pre:[{ar:"أرض حارة",set:{Tr:45,Tb:220}},{ar:"رحلة باردة",set:{Tr:-30,Tb:190}}],
  calc(st){ st.T1=st.Tb-st.ep*(st.Tb-st.Tr); const k=0.2857; st.To=pi=>{ const T=st.T1+273.15; return T*(1-st.et*(1-Math.pow(pi,-k)))-273.15; }; st.T2=st.To(st.pi); st.wt=1.005*(st.T1-st.T2); st.ice=st.T2<0; st.dT=st.Tb-st.T2; },
  scene(g,r,st,C){ const y=r.y+r.h*0.44, bw=r.w*0.2, bh=r.h*0.22, xs=[r.x+r.w*0.04,r.x+r.w*0.3,r.x+r.w*0.56,r.x+r.w*0.8], tx=["سحب المحرك","مبادل حراري","توربين تمدد","المقصورة"], T=[st.Tb,st.T1,st.T2,st.T2];
    xs.forEach((x,i)=>{ const f=clamp((T[i]+20)/260,0,1); kBox(g,x,y,bw*0.9,bh,mixC(C.panel,C.power,0.12+0.7*f),C,"",{}); ltx(g,tx[i],x+bw*0.45,y-12,{s:11,rtl:true}); ltx(g,nf(T[i],0)+" °C",x+bw*0.45,y+bh/2,{s:13,w:700,m:true,c:T[i]<0?C.hyd:C.ink}); if(i<3) larrow(g,x+bw*0.9,y+bh/2,xs[i+1],y+bh/2,C.muted,1.6,6); });
    for(let i=0;i<6;i++){ const f=(st.t*0.5+i/6)%1; ldot(g,xs[0]+(xs[3]+bw*0.9-xs[0])*f,y+bh+18,3,mixC(C.panel,f<0.4?C.power:C.hyd,0.9)); }
    ltx(g,st.ice?"خطر تجمد الرطوبة في المخرج":"حرارة المخرج مقبولة",r.x+r.w*0.5,r.y+r.h*0.9,{s:12,w:600,rtl:true,c:st.ice?C.power:C.ink}); },
  plot(st){ return {x:[1.2,4],y:[-80,st.T1],xl:"نسبة التمدد",yl:"حرارة المخرج °C",curves:[{f:st.To,c:"hyd"}],hl:[{y:0,c:"power",t:"0 °C"}],dots:[{x:st.pi,y:st.T2,c:st.ice?"power":"hyd"}]}; },
  ro(st){ return [["بعد المبادل",nf(st.T1,0)+" °C"],["بعد التوربين",nf(st.T2,1)+" °C"],["الانخفاض الكلي",nf(st.dT,0)+" °C"],["شغل مأخوذ من الهواء",nf(st.wt,0)+" kJ/kg"],["الحالة",st.ice?"قد تتجمد الرطوبة":"آمن من التجمد"]]; },
  eq:["T₁ = T_b − ε (T_b − T_ram)","T₂ = T₁ [1 − η_t (1 − π^(−0.2857))]","w = c_p (T₁ − T₂)"],
  note:["دورة مبسطة: الوحدة الحقيقية تضيف ضاغطاً وفاصل ماء ومراحل مبادلات، وتتحكم بحرارة المخرج بخلطها مع هواء حار.","الشغل المأخوذ من التوربين يدير المروحة والضاغط على العمود نفسه."],
  quiz:[{q:"لماذا يبرد الهواء عند مروره بالتوربين؟",o:["لأنه ينجز شغلاً فيفقد طاقته الحرارية","لأنه يمر بالماء","لأنه يضغط"],a:0,why:"التمدد مع انتزاع شغل يخفض الحرارة."},
        {q:"أي المتغيرات يخفض الحرارة الخارجة أكثر؟",o:["نسبة تمدد أكبر","كفاءة توربين أقل","هواء خارجي أسخن"],a:0,why:"π أكبر يعطي تبريداً أكبر."}],
  show:{ar:"اعرض وحدة دورة الهواء",fn:()=>lrnSel("pack_acm")},
  ref:"الموضوع: دورة الهواء للتكييف (Air Cycle Refrigeration)."
});
/* ---- 22 ---- */
LK("asy",{
  ar:"هواء السحب من المحرك والمبرّد المسبق", en:"Engine bleed air temperature and the precooler",
  alt:"ضاغط محرك بمراحل ومخرجي سحب منخفض وعالٍ، ومنحنى حرارة الهواء المسحوب مع نسبة الضغط عند نقطة السحب",
  intro:["الهواء يسخن كلما ضُغِط في الضاغط. عند سحبه من مرحلة وسطى (منفذ منخفض) تكون حرارته أقل مما لو سُحب من مرحلة أخيرة (منفذ عالٍ). تتحكم الطائرة بمنفذ السحب بحسب حاجتها: المنفذ المنخفض يوفر الوقود، والعالي يلزم عند دوران بطيء.",
         "الحرارة بعد الضغط: T = T₀ [1 + (π^(0.2857) − 1)/η_c]. تتجاوز غالباً 250 °C، فتمرر الطائرة الهواء بمبرّد مسبق يبرّده بهواء المروحة إلى نحو 200 °C لحماية الأنابيب ولأن الحد الأعلى يجب أن يبقى دون حرارة الاشتعال التلقائي للوقود في حال تسرب."],
  ctl:[{k:"opr",ar:"نسبة الضغط الكلية للمحرك",min:10,max:50,step:1,v:32,f:v=>nf(v,0)},{k:"x",ar:"موقع السحب على الضاغط",min:0.2,max:1,step:0.02,v:0.6,f:v=>nf(v*100,0)+" %"},{k:"Ti",ar:"حرارة الدخول",min:-50,max:50,step:1,v:15,f:v=>nf(v,0)+" °C"},{k:"ec",ar:"كفاءة الضاغط",min:0.8,max:0.92,step:0.01,v:0.87,f:v=>nf(v*100,0)+" %"},{k:"mb",ar:"تدفق السحب",min:0.1,max:1.5,step:0.05,v:0.6,f:v=>nf(v,2)+" kg/s"}],
  pre:[{ar:"منفذ منخفض",set:{x:0.5}},{ar:"منفذ عالٍ",set:{x:0.95}}],
  calc(st){ st.pb=x=>Math.pow(st.opr,x); st.Tbf=x=>(st.Ti+273.15)*(1+(Math.pow(st.pb(x),0.2857)-1)/st.ec)-273.15; st.pr=st.pb(st.x); st.Tb=st.Tbf(st.x); st.Ts=200; st.q=st.mb*1.005*Math.max(0,st.Tb-st.Ts); st.over=st.Tb>st.Ts; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.06, w=r.w*0.62, cy=r.y+r.h*0.45, h0=r.h*0.3, n=10; for(let i=0;i<n;i++){ const f=i/(n-1), x=x0+f*w, hh=h0*(1-0.55*f), on=Math.abs(f-st.x)<0.06;
      g.fillStyle=mixC(C.panel,C.power,0.12+0.7*clamp((st.Tbf(Math.max(f,0.02))+50)/700,0,1)); g.fillRect(x,cy-hh/2,w/n-2,hh); g.strokeStyle=on?C.ink:C.line; g.lineWidth=on?2:1; g.strokeRect(x,cy-hh/2,w/n-2,hh); }
    const bx=x0+st.x*w+w/n*0.5; lline(g,[[bx,cy-h0*0.5],[bx,r.y+r.h*0.18]],C.ink,3); ltx(g,"سحب "+nf(st.Tb,0)+" °C",bx,r.y+r.h*0.1,{s:12,w:600,rtl:true,c:st.over?C.power:C.ink});
    const px=r.x+r.w*0.78; kBox(g,px,r.y+r.h*0.2,r.w*0.16,r.h*0.3,mixC(C.panel,C.hyd,0.3),C,"مبرّد مسبق",{s:11}); lline(g,[[bx,r.y+r.h*0.18],[px,r.y+r.h*0.3]],C.power,2); ltx(g,nf(Math.min(st.Tb,st.Ts),0)+" °C",px+r.w*0.08,r.y+r.h*0.58,{s:13,w:700,m:true});
    ltx(g,"حرارة محكومة بعد المبرّد",px+r.w*0.08,r.y+r.h*0.66,{s:10,rtl:true,c:C.muted}); ltx(g,"حرارة المبرّد المنزوعة "+nf(st.q,0)+" kW",r.x+r.w*0.5,r.y+r.h*0.9,{s:12,rtl:true,c:C.muted}); },
  plot(st){ return {x:[0.2,1],y:[0,900],xl:"موقع السحب",yl:"حرارة الهواء °C",curves:[{f:st.Tbf,c:"power"}],hl:[{y:st.Ts,c:"hyd",t:"هدف المبرّد"}],dots:[{x:st.x,y:st.Tb,c:"power"}]}; },
  ro(st){ return [["نسبة الضغط عند المنفذ",nf(st.pr,1)],["حرارة الهواء المسحوب",nf(st.Tb,0)+" °C"],["الهدف بعد المبرّد",nf(st.Ts,0)+" °C"],["الحرارة المنزوعة",nf(st.q,0)+" kW"]]; },
  eq:["π_سحب = OPR^x","T = T₀ [1 + (π^0.2857 − 1)/η_c]","Q = ṁ c_p (T − T_هدف)"],
  note:["الحساب لضغط ثابت الحرارة النوعية 1.005 kJ/kg·K، وهو تقريب. ارتفاع الحرارة الفعلي يتأثر بتبريد الجدران والتسرب.","اختيار المنفذ يعتمد على الارتفاع وقدرة المحرك، فالمنفذ المنخفض يوفر وقوداً لأن الضغط المطلوب أقل."],
  quiz:[{q:"أي منفذ يعطي هواءً أسخن؟",o:["المنفذ العالي (قرب نهاية الضاغط)","المنفذ المنخفض","متساويان"],a:0,why:"الضغط أعلى فالحرارة أعلى."},
        {q:"ما دور المبرّد المسبق؟",o:["خفض الحرارة إلى حد آمن للأنابيب","رفع الضغط","زيادة التدفق"],a:0,why:"يبرّد هواء السحب بهواء المروحة."}],
  show:{ar:"اعرض صمام السحب",fn:()=>lrnSel("eng_bleed_valve")},
  ref:"الموضوع: أنظمة الهواء المضغوط (Pneumatic Systems)."
});
/* ---- 23 ---- */
LK("asy",{
  ar:"التهوية وتركيز ثاني أكسيد الكربون", en:"Cabin ventilation and carbon dioxide",
  alt:"مقصورة بمسافرين وهواء جديد يدخل وهواء يخرج، ومنحنى تركيز ثاني أكسيد الكربون مع الزمن نحو قيمة الاستقرار",
  intro:["كل مسافر ينتج نحو 0.005 L/s من ثاني أكسيد الكربون. في المقصورة المغلقة يتراكم الغاز حتى يتوازن مع تدفق الهواء الجديد: C_ss = C_خارج + (G·N)/Q_جديد. كلما قل الهواء الجديد لكل راكب ارتفع التركيز.",
         "الوصول إلى القيمة المستقرة بطيء بالنسبة لحجم المقصورة: τ = V / Q_جديد. وإعادة تدوير الهواء مع ترشيحه لا تخفض CO₂ لأن المرشح لا يزيله، فمعيار التهوية هو الهواء الخارجي الداخل فقط."],
  ctl:[{k:"N",ar:"عدد الركاب",min:20,max:550,step:5,v:180,f:v=>nf(v,0)},{k:"q",ar:"هواء جديد لكل راكب",min:2,max:12,step:0.1,v:5,f:v=>nf(v,1)+" L/s"},{k:"V",ar:"حجم المقصورة",min:100,max:1200,step:10,v:300,f:v=>nf(v,0)+" m³"},{k:"Co",ar:"CO₂ في الهواء الخارجي",min:380,max:500,step:5,v:420,f:v=>nf(v,0)+" ppm"}],
  pre:[{ar:"تهوية قليلة",set:{q:3}},{ar:"تهوية جيدة",set:{q:9}}],
  calc(st){ const Q=st.q*st.N/1000, G=0.005*st.N/1000; st.Q=Q; st.tau=st.V/Q; st.Css=st.Co+G/Q*1e6; st.Cf=t=>st.Css-(st.Css-st.Co)*Math.exp(-t*60/st.tau); st.ach=Q*3600/st.V; st.C60=st.Cf(60); },
  scene(g,r,st,C){ const x0=r.x+r.w*0.08, w=r.w*0.84, y0=r.y+r.h*0.3, h=r.h*0.3; g.fillStyle=mixC(C.panel,C.struct,0.15); g.fillRect(x0,y0,w,h); g.strokeStyle=C.ink; g.lineWidth=1.4; g.strokeRect(x0,y0,w,h);
    const n=Math.min(60,Math.round(st.N/9)); for(let i=0;i<n;i++){ ldot(g,x0+12+((i*37)%(w-24)),y0+h*0.3+(i%6)*h*0.1,2.6,C.muted); }
    const sev=clamp((st.Css-400)/3000,0,1); for(let i=0;i<14;i++){ const f=(st.t*0.2+i/14)%1; ldot(g,x0+f*w,y0+h*0.12+((i*53)%10)*h*0.04,3.2+sev*2,mixC(C.panel,C.power,0.2+0.7*sev),0.8); }
    for(let i=0;i<4;i++){ const f=(st.t*0.4+i/4)%1; larrow(g,x0+w*(0.15+0.2*i),y0-30+f*14,x0+w*(0.15+0.2*i),y0-10+f*14,C.hyd,1.8,6); } ltx(g,"هواء جديد "+nf(st.Q*1000,0)+" L/s",x0+w*0.5,y0-44,{s:12,rtl:true,c:C.hyd});
    ltx(g,"CO₂ المستقر "+nf(st.Css,0)+" ppm",r.x+r.w*0.5,y0+h+30,{s:13,w:600,rtl:true,c:st.Css>2500?C.power:C.ink}); ltx(g,"تجدد الهواء "+nf(st.ach,1)+" مرة بالساعة",r.x+r.w*0.5,y0+h+52,{s:12,rtl:true,c:C.muted}); },
  plot(st){ return {x:[0,60],y:[300,Math.max(1500,st.Css*1.1)],xl:"الزمن min",yl:"CO₂ ppm",curves:[{f:st.Cf,c:"power"}],hl:[{y:1000,c:"hyd",t:"1000"},{y:st.Css,c:"muted",t:"المستقر"}],dots:[{x:60,y:st.C60,c:"power"}]}; },
  ro(st){ return [["هواء جديد كلي",nf(st.Q*1000,0)+" L/s"],["ثابت الزمن τ",nf(st.tau/60,1)+" min"],["CO₂ المستقر",nf(st.Css,0)+" ppm"],["بعد ساعة",nf(st.C60,0)+" ppm"],["مرات تجدد الهواء",nf(st.ach,1)+" /h"]]; },
  eq:["C_ss = C_خارج + G N / Q_جديد","τ = V / Q_جديد","C(t) = C_ss − (C_ss − C₀) e^(−t/τ)"],
  note:["التهوية في الطائرات الحقيقية تقاس بحجم هواء جديد لكل شخص، ويعتمد مقدارها على الطراز ومرحلة الرحلة.","الأرقام تقريبية؛ هذا النموذج يفترض خلطاً كاملاً للهواء، بينما تتفاوت التراكيز فعلاً بين مناطق المقصورة."],
  quiz:[{q:"لو ضاعفنا الهواء الجديد لكل راكب، فإضافة CO₂ فوق الخارج:",o:["تنخفض إلى النصف","تتضاعف","لا تتغير"],a:0,why:"C_ss − C_خارج يتناسب عكسياً مع Q."},
        {q:"هل يخفض ترشيح الهواء المعاد تدويره CO₂؟",o:["لا، لا يزيله المرشح","نعم تماماً","جزئياً بالحرارة"],a:0,why:"المرشحات تحجز الجسيمات لا الغازات."}],
  show:{ar:"اعرض مراوح إعادة التدوير",fn:()=>lrnSel("recirc_fan")},
  ref:"الموضوع: التهوية وجودة الهواء في المقصورة (Cabin Air Quality)."
});
/* ---- 24 ---- */
const ayTUC=[[18000,1500],[22000,500],[25000,240],[28000,165],[30000,90],[35000,45],[40000,18],[45000,12]];
function ayTucAt(ft){ if(ft<=ayTUC[0][0]) return ayTUC[0][1]; for(let i=1;i<ayTUC.length;i++){ if(ft<=ayTUC[i][0]){ const a=ayTUC[i-1], b=ayTUC[i], f=(ft-a[0])/(b[0]-a[0]); return Math.exp(Math.log(a[1])+(Math.log(b[1])-Math.log(a[1]))*f); } } return ayTUC[ayTUC.length-1][1]; }
LK("asy",{
  ar:"فقدان الضغط: كم من الوقت لدينا؟", en:"Decompression through a hole and time of useful consciousness",
  alt:"مقصورة بها ثقب يتسرب منه الهواء، ومنحنى ارتفاع المقصورة مع الزمن مقابل حد 14000 قدم وزمن الوعي المفيد",
  intro:["عند وجود فتحة في جسم الطائرة يندفع الهواء إلى الخارج بسرعة الصوت إذا كان فرق الضغط كبيراً، فينخفض ضغط المقصورة تقريباً أسّياً: τ = V / (0.58 C_d A √(γ R T)). كلما كبرت الفتحة أو صغر الحجم قصر الوقت.",
         "ما يهم الإنسان هو 'زمن الوعي المفيد' عند الارتفاع الذي وصلت إليه المقصورة، وهو يقصر بسرعة مع الارتفاع (دقائق عند 25000 قدم، ثوانٍ عند 40000). لذلك تنزل أقنعة الأكسجين تلقائياً عند 14000 قدم تقريباً، وتبدأ الطائرة هبوطاً طارئاً."],
  ctl:[{k:"ft",ar:"ارتفاع الطيران",min:20000,max:43000,step:500,v:37000,f:v=>nf(v,0)+" ft"},{k:"Ah",ar:"مساحة الفتحة",min:50,max:10000,step:50,v:1000,f:v=>nf(v,0)+" cm²"},{k:"Vc",ar:"حجم المقصورة",min:100,max:800,step:10,v:300,f:v=>nf(v,0)+" m³"},{k:"cc",ar:"ارتفاع المقصورة قبل الحادث",min:0,max:8000,step:100,v:6500,f:v=>nf(v,0)+" ft"}],
  pre:[{ar:"نافذة صغيرة",set:{Ah:400}},{ar:"فتحة كبيرة",set:{Ah:8000}}],
  calc(st){ const FT=0.3048, po=isa(st.ft*FT).p, R=287.05, T=288, g=1.4, A=st.Ah*1e-4, Cd=0.8, dt=0.05; let pc=isa(st.cc*FT).p, tt=0; st.tr=[]; st.t14=Infinity; const alt=p=>{ let lo=0,hi=60000; for(let i=0;i<30;i++){ const m=(lo+hi)/2; if(isa(m*FT).p>p) lo=m; else hi=m; } return lo; };
    for(let i=0;i<=3000;i++){ tt=i*dt; const ca=alt(pc); if(i%4===0) st.tr.push([tt,ca]); if(ca>=14000&&!isFinite(st.t14)) st.t14=tt; const pr=pc/po; let m; if(pr>1.893) m=Cd*A*pc*Math.sqrt(g/(R*T))*Math.pow(2/(g+1),(g+1)/(2*(g-1))); else if(pr>1.0001){ const r=1/pr; m=Cd*A*pc*Math.sqrt(2*g/((g-1)*R*T))*Math.sqrt(Math.max(0,Math.pow(r,2/g)-Math.pow(r,(g+1)/g))); } else m=0; pc-=R*T/(st.Vc)*m*dt; if(pc<po) pc=po; }
    st.cf=st.tr[st.tr.length-1][1]; st.tuc=ayTucAt(st.cf); st.tau=st.Vc/(0.58*Cd*A*Math.sqrt(g*R*T)); st.cabAt=t=>{ const k=Math.min(st.tr.length-1,Math.max(0,Math.round(t/(dt*4)))); return st.tr[k][1]; }; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.1, w=r.w*0.8, y0=r.y+r.h*0.25, h=r.h*0.34, tm=(st.t*3)%60, ca=st.cabAt(tm), f=clamp(ca/st.ft,0,1); g.fillStyle=mixC(C.panel,C.hyd,0.12+0.3*(1-f)); g.beginPath(); g.ellipse(x0+w/2,y0+h/2,w/2,h/2,0,0,Math.PI*2); g.fill(); g.strokeStyle=C.ink; g.lineWidth=1.5; g.stroke();
    const hx=x0+w*0.78, hy=y0+h*0.1; ldot(g,hx,hy,4+Math.sqrt(st.Ah)/10,C.bg); for(let i=0;i<10;i++){ const q=(st.t*1.6+i*0.37)%1; ldot(g,hx+q*50,hy-q*34+((i*7)%5),2.4*(1-q),C.hyd,1-q); }
    ltx(g,"بعد "+nf(tm,0)+" s : ارتفاع المقصورة "+nf(ca,0)+" ft",x0+w/2,y0+h/2,{s:13,w:600,rtl:true,c:ca>=14000?C.power:C.ink}); kBar(g,x0,r.y+r.h*0.82,w,10,ca/Math.max(st.ft,14000),ca>=14000?"power":"hyd",C,"حد الأقنعة 14000 ft"); },
  plot(st){ return {x:[0,Math.min(st.tr[st.tr.length-1][0],Math.max(15,Math.round(6*st.tau)))],y:[0,st.ft*1.05],xl:"الزمن s",yl:"ارتفاع المقصورة ft",lines:[{pts:st.tr,c:"hyd",w:2.4}],hl:[{y:14000,c:"power",t:"14000 ft"},{y:st.ft,c:"muted",t:"الخارج"}],dots:isFinite(st.t14)?[{x:st.t14,y:14000,c:"power",t:nf(st.t14,0)+" s"}]:[]}; },
  ro(st){ return [["ثابت الزمن τ",nf(st.tau,1)+" s"],["وقت بلوغ 14000 ft",isFinite(st.t14)?nf(st.t14,0)+" s":"لا يبلغ"],["ارتفاع المقصورة النهائي",nf(st.cf,0)+" ft"],["زمن الوعي المفيد التقريبي",st.tuc>=120?nf(st.tuc/60,1)+" min":nf(st.tuc,0)+" s"]]; },
  eq:["τ = V / (0.58 C_d A √(γ R T))","dp/dt = −(R T / V) ṁ(p)","ṁ = C_d A p √(γ/RT) (2/(γ+1))^((γ+1)/(2(γ−1)))  عند الاختناق"],
  note:["التمدد المتجه للخارج يُحاكى بتدفق خانق إذا تجاوزت نسبة الضغط 1.89. أثر الحرارة والتسرب عبر الأبواب أهمل.","أزمنة الوعي المفيد تقريبية جداً وتتفاوت بين الأشخاص؛ العبرة أنها تنهار بين 25 و40 ألف قدم."],
  quiz:[{q:"تكبير الثقب يجعل زمن فقدان الضغط:",o:["أقصر","أطول","كما هو"],a:0,why:"τ يتناسب عكسياً مع المساحة."},
        {q:"ما فائدة الهبوط الطارئ بعد فقدان الضغط؟",o:["الوصول إلى ارتفاع يتنفس فيه الناس","توفير الوقود","تقليل الضجيج"],a:0,why:"الأقنعة تعطي أكسجين لمدة محدودة."}],
  show:{ar:"اعرض مولدات الأكسجين",fn:()=>lrnSel("oxygen_pax")},
  ref:"الموضوع: فقدان ضغط المقصورة والنزول الطارئ (Rapid Decompression)."
});
/* ---- 25 ---- */
LK("asy",{
  ar:"الأكسجين: الضغط الجزئي والقناع", en:"Oxygen partial pressure and the mask",
  alt:"رئتان ومنحنى ضغط الأكسجين في الحويصلات مع الارتفاع للهواء العادي وللقناع بأكسجين كامل مع حد الخطر",
  intro:["نسبة الأكسجين في الهواء ثابتة (21%) حتى ارتفاعات عالية، لكن ضغطه الجزئي ينخفض مع الضغط الكلي، وهو ما يهم الجسم. ضغط الأكسجين في الحويصلات: P_A = F_O₂ (p − 6.3) − P_CO₂ / 0.8 بالكيلوباسكال، حيث 6.3 ضغط بخار الماء، وP_CO₂ ضغط ثاني أكسيد الكربون في الحويصلات وهو نحو 5.3 عند مستوى البحر ويهبط إلى نحو 2.7 مع فرط التنفس على الارتفاع.",
         "رفع نسبة الأكسجين بالقناع يعوّض نقص الضغط: عند 40000 قدم يعطي الأكسجين الكامل ضغطاً حويصلياً يعادل الهواء العادي على ارتفاع نحو 10000 قدم. وتحت 8 kPa تقريباً يبدأ نقص الأكسجة الخطير."],
  ctl:[{k:"ft",ar:"ارتفاع المقصورة",min:0,max:50000,step:500,v:30000,f:v=>nf(v,0)+" ft"},{k:"fo",ar:"نسبة الأكسجين المستنشق",min:21,max:100,step:1,v:21,f:v=>nf(v,0)+" %"}],
  pre:[{ar:"هواء عادي",set:{fo:21}},{ar:"قناع طوارئ",set:{fo:100}}],
  calc(st){ const FT=0.3048; st.PA=(h,f)=>{ const p=isa(h*FT).p/1000, pc=Math.max(2.7,5.3-2.6*h/25000); return f/100*(p-6.3)-pc/0.8; }; st.p=isa(st.ft*FT).p/1000; st.pa=st.PA(st.ft,st.fo); st.p0=st.PA(0,21); st.pct=st.pa/st.p0*100; st.eqa=kRoot(h=>st.PA(h,21)-st.pa,-2000,50000); st.ok=st.pa>=8; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.3, cy=r.y+r.h*0.46, s=Math.min(r.w*0.16,r.h*0.3), br=0.5+0.5*Math.sin(st.t*2.2); [-1,1].forEach(sg=>{ g.fillStyle=mixC(C.panel,st.ok?C.hyd:C.power,0.25+0.4*Math.min(1,st.pct/100)); g.beginPath(); g.ellipse(cx+sg*s*0.55,cy,s*(0.42+0.05*br),s*(0.7+0.07*br),sg*0.08,0,Math.PI*2); g.fill(); g.strokeStyle=C.ink; g.lineWidth=1.3; g.stroke(); });
    lline(g,[[cx,cy-s*0.9],[cx,cy-s*0.2]],C.ink,3); ltx(g,"P_A = "+nf(st.pa,1)+" kPa",cx,cy+s*0.95,{s:13,w:700,m:true,c:st.ok?C.ink:C.power}); ltx(g,nf(st.pct,0)+" % من مستوى البحر",cx,cy+s*1.25,{s:11,rtl:true,c:C.muted});
    ltx(g,"يكافئ هواء عادياً عند "+nf(Math.max(0,st.eqa),0)+" ft",r.x+r.w*0.5,r.y+r.h*0.08,{s:12,w:600,rtl:true}); kBar(g,r.x+r.w*0.1,r.y+r.h*0.88,r.w*0.8,10,st.pa/14,st.ok?"hyd":"power",C,"حد الخطر 8 kPa"); },
  plot(st){ return {x:[0,50000],y:[-2,15],xl:"ارتفاع المقصورة ft",yl:"P_A kPa",curves:[{f:h=>st.PA(h,21),c:"muted"},{f:h=>st.PA(h,st.fo),c:"hyd"},{f:h=>st.PA(h,100),c:"power",dash:[5,4]}],leg:[{c:"muted",t:"هواء عادي"},{c:"hyd",t:"النسبة الحالية"},{c:"power",t:"100 %",dash:[5,4]}],hband:[{y0:-2,y1:8,c:"power",a:0.1}],dots:[{x:st.ft,y:st.pa,c:st.ok?"hyd":"power"}]}; },
  ro(st){ return [["الضغط الكلي",nf(st.p,1)+" kPa"],["ضغط الأكسجين في الحويصلات",nf(st.pa,1)+" kPa"],["نسبة من مستوى البحر",nf(st.pct,0)+" %"],["الارتفاع المكافئ بالهواء",nf(Math.max(0,st.eqa),0)+" ft"],["الحالة",st.ok?"فوق حد الخطر":"نقص أكسجة خطير"]]; },
  eq:["P_A = F_O₂ (p − 6.3) − P_CO₂ / 0.8   (kPa)","P_CO₂ ≈ 5.3 → 2.7 kPa بفرط التنفس","نقص الأكسجة تقريباً عند P_A < 8 kPa"],
  note:["المعادلة تقريب شائع للحويصلات؛ القيم الفعلية تختلف بحسب التنفس والتأقلم. فوق نحو 40000 قدم لا يكفي الأكسجين الكامل بلا ضغط إضافي في القناع.","الأكسجين المخزّن محدود زمنياً، فهو لتغطية الهبوط وليس للبقاء على ارتفاع."],
  quiz:[{q:"لماذا يقل الأكسجين الذي يستفيد منه الجسم رغم ثبات نسبة 21%؟",o:["لأن الضغط الكلي يهبط فيهبط الضغط الجزئي","لأن النسبة تتغير","لأن الحرارة ترتفع"],a:0,why:"الضغط الجزئي = النسبة × الضغط الكلي."},
        {q:"ما أثر قناع الأكسجين الكامل عند ارتفاع عالٍ؟",o:["يرفع الضغط الجزئي للأكسجين","يخفض الضغط","لا أثر"],a:0,why:"F_O₂ تقترب من 1."}],
  show:{ar:"اعرض أسطوانة أكسجين الطاقم",fn:()=>lrnSel("oxygen_crew")},
  ref:"الموضوع: فسيولوجيا الطيران والأكسجين (Aviation Physiology)."
});
/* ---- 26 ---- */
LK("asy",{
  ar:"الإخلاء في 90 ثانية", en:"Emergency evacuation time",
  alt:"مقصورة من أعلى فيها صف من المخارج ومسافرون يتحركون نحوها، ومنحنى عدد المخلَين مع الزمن مقابل حد 90 ثانية",
  intro:["من شروط اعتماد الطائرة أن يمكن إخلاء كل ركابها بسعتها القصوى خلال 90 ثانية باستخدام نصف المخارج فقط (أي مع افتراض أن نصفها غير صالح). تتدفق الركاب عبر كل مخرج بمعدل شبه ثابت تقريباً.",
         "زمن الإخلاء ≈ زمن تهيئة المخرج + N / (n · r). وكل ما يبطئ التدفق، كحقائب في الممر أو مخرج محجوب، يزيد الزمن. لهذا تُحسب أعداد وأنواع المخارج بما يتناسب مع عدد المقاعد."],
  ctl:[{k:"N",ar:"عدد الركاب",min:100,max:850,step:5,v:189,f:v=>nf(v,0)},{k:"n",ar:"عدد المخارج الصالحة",min:2,max:16,step:1,v:4,f:v=>nf(v,0)},{k:"r",ar:"معدل المخرج الواحد",min:20,max:90,step:1,v:45,f:v=>nf(v,0)+" pax/min"},{k:"d0",ar:"زمن فتح المخرج",min:3,max:25,step:1,v:10,f:v=>nf(v,0)+" s"}],
  pre:[{ar:"طائرة ممرّ واحد",set:{N:189,n:4,r:45}},{ar:"طائرة كبيرة",set:{N:600,n:12,r:50}}],
  calc(st){ st.tev=st.d0+st.N/(st.n*st.r/60); st.ok=st.tev<=90; st.fl=t=>Math.min(st.N,Math.max(0,(t-st.d0)*st.n*st.r/60)); st.nmin=Math.ceil(st.N/((90-st.d0)*st.r/60)); },
  scene(g,r,st,C){ const x0=r.x+r.w*0.06, w=r.w*0.88, y0=r.y+r.h*0.3, h=r.h*0.3; g.fillStyle=mixC(C.panel,C.struct,0.15); g.fillRect(x0,y0,w,h); g.strokeStyle=C.ink; g.lineWidth=1.4; g.strokeRect(x0,y0,w,h);
    const n=st.n, tm=(st.t*5)%100; for(let i=0;i<n;i++){ const x=x0+w*(0.1+0.8*i/Math.max(1,n-1)), top=i%2===0; g.fillStyle=C.bg; g.fillRect(x-7,(top?y0-3:y0+h-3),14,6); g.strokeRect(x-7,(top?y0-3:y0+h-3),14,6); const fr=clamp((tm-st.d0)/(st.tev-st.d0),0,1); const k=12; for(let j=0;j<k;j++){ const q=(fr*3+j/k)%1; if(fr>0&&fr<1) ldot(g,x,(top?y0+h*0.45-q*h*0.5:y0+h*0.55+q*h*0.5),2.4,C.hyd,0.9*(1-q*0.4)); } }
    const out=st.fl(tm); const nd=Math.round(60*(1-out/st.N)); for(let j=0;j<nd;j++) ldot(g,x0+8+((j*61)%(w-16)),y0+8+((j*29)%(h-16)),2.2,C.muted,0.8);
    ltx(g,"بعد "+nf(tm,0)+" s : خرج "+nf(out,0)+" من "+nf(st.N,0),x0+w/2,y0-22,{s:12,w:600,rtl:true}); ltx(g,"زمن الإخلاء "+nf(st.tev,0)+" s",x0+w/2,y0+h+30,{s:14,w:700,rtl:true,c:st.ok?C.ink:C.power}); },
  plot(st){ return {x:[0,Math.max(100,st.tev*1.1)],y:[0,st.N*1.05],xl:"الزمن s",yl:"عدد المخلَين",curves:[{f:st.fl,c:"hyd"}],vl:[{x:90,c:"power",t:"90 s"}],dots:[{x:st.tev,y:st.N,c:st.ok?"hyd":"power"}]}; },
  ro(st){ return [["زمن الإخلاء المقدّر",nf(st.tev,1)+" s"],["حد الشرط",nf(90,0)+" s"],["الحالة",st.ok?"ضمن الحد":"أكثر من الحد"],["أقل مخارج لتحقيق الحد",nf(st.nmin,0)],["تدفق كل المخارج",nf(st.n*st.r,0)+" pax/min"]]; },
  eq:["t = t₀ + N / (n r)","n_أدنى = ⌈ N / ((90 − t₀) r) ⌉"],
  note:["الدرس لا يستخدم أرقام معدّلات معتمدة لطراز معين، بل يبين الاتجاه. الاعتماد الحقيقي يتطلب اختباراً فعلياً أو تحليلاً يقبله المنظّم.","حجب نصف المخارج في الاختبار يفسّر لماذا تُصمَّم المخارج بوفرة."],
  quiz:[{q:"إذا تعطّل مخرجان من أربعة، فزمن التدفق (الجزء المتعلق بالركاب):",o:["يتضاعف","ينصف","لا يتغير"],a:0,why:"التدفق الكلي ينقص إلى النصف."},
        {q:"ما أثر زيادة زمن فتح المخرج؟",o:["زيادة الزمن الكلي بنفس المقدار","لا أثر","تقليل الزمن"],a:0,why:"t = t₀ + N/(n r)."}],
  show:{ar:"اعرض زحليقة الطوارئ",fn:()=>lrnSel("escape_slide")},
  ref:"الموضوع: متطلبات الإخلاء الطارئ (Emergency Evacuation)."
});
/* ---- 27 ---- */
LK("asy",{
  ar:"الإطفاء: تركيز العامل ومدة الاحتفاظ به", en:"Fire suppression: agent concentration and hold time",
  alt:"حيّز شحن مغلق يُحقن فيه عامل إطفاء غازي ومنحنى تركيزه يتناقص مع الزمن مقابل التركيز اللازم",
  intro:["لإخماد حريق في حيّز مغلق نحقن عاملاً غازياً حتى يبلغ تركيزه حجماً معيّناً. التركيز الأولي c₀ ≈ (m / ρ_بخار) / V، حيث ρ_بخار = p·M/(R·T) كثافة العامل كغاز. يعتمد التركيز اللازم على الوقود والحيّز.",
         "بعد الحقن يتسرب العامل مع تبديل الهواء في الحيّز: c(t) = c₀ e^(−λ t). لإبقاء النار مطفأة يلزم أن يبقى التركيز فوق الحد مدة كافية لتبريد الأسطح، ولهذا تُحسب كمية العامل بحيث تعطي تركيزاً يزيد عن اللازم بهامش، وتُستخدم ثانية احتياطية بمعدل أبطأ في بعض الأنظمة."],
  ctl:[{k:"m",ar:"كتلة العامل",min:1,max:40,step:0.5,v:22,f:v=>nf(v,1)+" kg"},{k:"Vv",ar:"حجم الحيّز",min:10,max:200,step:5,v:60,f:v=>nf(v,0)+" m³"},{k:"lam",ar:"معدل تبديل الهواء",min:0,max:6,step:0.1,v:0.3,f:v=>nf(v,1)+" /h"},{k:"cr",ar:"التركيز اللازم",min:2,max:8,step:0.1,v:5,f:v=>nf(v,1)+" %"},{k:"Tk",ar:"حرارة الحيّز",min:-20,max:60,step:1,v:20,f:v=>nf(v,0)+" °C"}],
  calc(st){ const M=0.149, rho=101325*M/(8.314*(st.Tk+273.15)); st.c0=st.m/rho/st.Vv*100; st.cf=t=>st.c0*Math.exp(-st.lam*t/60); st.th=st.c0>st.cr?(st.lam>0?60*Math.log(st.c0/st.cr)/st.lam:Infinity):0; st.ok=st.c0>=st.cr; st.mn=st.cr/100*st.Vv*rho; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.08, w=r.w*0.84, y0=r.y+r.h*0.26, h=r.h*0.34, tm=(st.t*2.4)%60, c=st.cf(tm), f=clamp(c/Math.max(st.c0,1e-6),0,1); g.fillStyle=mixC(C.panel,C.struct,0.2); g.fillRect(x0,y0,w,h); g.strokeStyle=C.ink; g.lineWidth=1.4; g.strokeRect(x0,y0,w,h);
    g.fillStyle=mixC(C.panel,c>=st.cr?C.hyd:C.power,0.1+0.55*f); g.fillRect(x0+2,y0+2,w-4,h-4); for(let i=0;i<30;i++){ const px=x0+((i*53+st.t*10)%w), py=y0+((i*31)%h); ldot(g,px,py,2+f*1.6,C.ink,0.15+0.5*f); }
    kBox(g,x0+w*0.04,y0-30,28,24,mixC(C.panel,C.power,0.5),C,"",{}); ltx(g,"قارورة "+nf(st.m,1)+" kg",x0+w*0.04+14,y0-38,{s:11,rtl:true}); lline(g,[[x0+w*0.04+14,y0-6],[x0+w*0.04+14,y0+10]],C.power,3);
    ltx(g,"التركيز بعد "+nf(tm,0)+" دقيقة : "+nf(c,2)+" %",x0+w/2,y0+h+24,{s:13,w:600,rtl:true,c:c>=st.cr?C.ink:C.power}); ltx(g,st.ok?"يتجاوز التركيز اللازم":"أقل من اللازم",x0+w/2,y0+h+46,{s:12,rtl:true,c:st.ok?C.hyd:C.power}); },
  plot(st){ return {x:[0,60],y:[0,Math.max(st.c0*1.1,st.cr*1.2)],xl:"الزمن min",yl:"التركيز %",curves:[{f:st.cf,c:"hyd"}],hl:[{y:st.cr,c:"power",t:"اللازم"}],dots:[{x:0,y:st.c0,c:"hyd"}].concat(isFinite(st.th)&&st.th>0&&st.th<60?[{x:st.th,y:st.cr,c:"power",t:nf(st.th,0)+" min"}]:[])}; },
  ro(st){ return [["التركيز الأولي",nf(st.c0,2)+" %"],["زمن الاحتفاظ بالتركيز اللازم",st.ok?(isFinite(st.th)?nf(st.th,0)+" min":"غير محدود"):"لا يبلغ"],["أقل كتلة للتركيز اللازم",nf(st.mn,1)+" kg"],["الحالة",st.ok?"كافٍ":"غير كافٍ"]]; },
  eq:["ρ = p M / (R T)","c₀ = m / (ρ V)","c(t) = c₀ e^(−λ t)","t_احتفاظ = ln(c₀/c_لازم) / λ"],
  note:["العامل المفترض غاز كتلته المولية 149 g/mol كمثال عام. أنواع العوامل وتركيزاتها تتبع المواصفة المعتمدة لكل منظومة.","التركيز يتجانس في الحيّز تدريجياً، أما الحساب هنا فيفترض خلطاً كاملاً."],
  quiz:[{q:"لماذا يلزم التقدير عند حرارة الحيّز؟",o:["كثافة بخار العامل تتغير مع الحرارة","لأن الحجم يتغير","لأن الكتلة تتغير"],a:0,why:"ρ = pM/RT."},
        {q:"أي تغيير يطيل زمن الاحتفاظ بالتركيز؟",o:["تقليل معدل تبديل الهواء","زيادة التسرب","تقليل كتلة العامل"],a:0,why:"c تتناقص أسّياً بمعدل λ."}],
  show:{ar:"اعرض قارورة إطفاء المحرك",fn:()=>lrnSel("fire_bottle_eng")},
  ref:"الموضوع: أنظمة الإطفاء في الطائرات (Fire Protection)."
});
