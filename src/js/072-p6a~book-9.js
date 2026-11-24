/* ---------- Book 9: Spacecraft Systems Engineering ---------- */
LESSONS.sse.push({
  ar:"ميزانية الاتصالات (Link budget)", en:"Communications link budget",
  alt:"قمر صناعي يرسل موجات إلى هوائي أرضي، وشلال أعمدة بالديسيبل: القدرة والكسب والفقد في الفضاء والضجيج حتى الهامش",
  intro:["لكي تصل بيانات المركبة يجب أن تكون الإشارة أقوى من الضجيج بقدر كافٍ. نحسب ذلك بالديسيبل: نجمع قدرة المرسل وكسب الهوائيين، ونطرح فقد المسافة (يزيد مع مربعها) والفقد الآخر، ثم نقارن بالضجيج الحراري ومعدل البيانات.",
         "الفرق بين النسبة المتحققة Eb/N0 والمطلوبة لطريقة التشفير هو «الهامش»، ويحتاج المصمم عادة 3 ديسيبل على الأقل. لهذا تتكلم المسابير البعيدة ببطء شديد وعبر هوائيات أرضية ضخمة."],
  ctl:[{k:"P",ar:"قدرة المرسل",min:1,max:200,step:1,v:20,f:v=>nf(v,0)+" W"},{k:"dt",ar:"قطر هوائي المركبة",min:0.1,max:4,step:0.05,v:1,f:v=>nf(v,2)+" m"},{k:"dr",ar:"قطر الهوائي الأرضي",min:1,max:70,step:0.5,v:10,f:v=>nf(v,1)+" m"},
       {k:"ld",ar:"المسافة",min:3,max:9,step:0.05,v:4.56,f:v=>sci(Math.pow(10,v),2)+" km"},{k:"lr",ar:"معدل البيانات",min:2,max:9,step:0.1,v:7,f:v=>sci(Math.pow(10,v),1)+" bit/s"}],
  pre:[{ar:"قمر ثابت بالنسبة للأرض",set:{ld:4.56,lr:7,P:20,dt:1,dr:10}},{ar:"مدار منخفض",set:{ld:3,lr:8,P:5,dt:0.3,dr:5}},{ar:"مسبار عند المريخ",set:{ld:8.35,lr:5,P:100,dt:3,dr:70}}],
  init(st){ st.ph=0; },
  calc(st){ const f=8.4e9, lam=3e8/f, G=d=>10*Math.log10(0.55*Math.pow(Math.PI*d/lam,2)), d=Math.pow(10,st.ld)*1000;
    st.Pt=10*Math.log10(st.P); st.Gt=G(st.dt); st.Gr=G(st.dr); st.Ls=20*Math.log10(4*Math.PI*d/lam); st.Lo=3; st.Pr=st.Pt+st.Gt+st.Gr-st.Ls-st.Lo;
    st.N0=-228.6+10*Math.log10(150); st.R=10*st.lr; st.ebn0=st.Pr-st.N0-st.R; st.req=9.6; st.margin=st.ebn0-st.req; },
  step(st,dt){ st.ph=(st.ph+dt*0.6)%1; },
  draw(g,W,H,st,C){
    const sx=W*0.1, sy=H*0.16, gx=W*0.1, gy=H*0.84;
    g.fillStyle=mixC(C.panel,C.struct,0.45); g.fillRect(sx-10,sy-8,20,16); lline(g,[[sx-30,sy],[sx-10,sy]],C.hyd,4); lline(g,[[sx+10,sy],[sx+30,sy]],C.hyd,4);
    for(let i=0;i<4;i++){ const f=(st.ph+i/4)%1, y=sy+12+(gy-sy-30)*f; g.strokeStyle=mixC(C.ctrl,C.panel,f*0.9); g.lineWidth=2; g.beginPath(); g.arc(sx,y-10,10+f*16,0.2*Math.PI,0.8*Math.PI); g.stroke(); }
    g.strokeStyle=C.ink; g.lineWidth=2; g.beginPath(); g.arc(gx,gy-6,16,Math.PI*1.1,Math.PI*1.9); g.stroke(); lline(g,[[gx,gy-6],[gx,gy+10]],C.ink,2);
    const items=[["P_t",st.Pt],["G_t",st.Gt],["G_r",st.Gr],["L_s",-st.Ls],["L_o",-st.Lo],["kT·R",-(st.N0+st.R)],["req",-st.req]];
    const x0=W*0.24, w=W*0.74, n=items.length+1, cw=w/n, bw=cw*0.72; let acc=0; const all=[0]; items.forEach(([l,v])=>{ acc+=v; all.push(acc); });
    const lo=Math.min(...all)-12, hi=Math.max(...all)+16, Y=v=>H*0.1+(hi-v)/(hi-lo)*H*0.72;
    lline(g,[[x0,Y(0)],[x0+w,Y(0)]],C.line,1,[3,3]); ltx(g,"0 dB",x0-2,Y(0),{c:C.muted,s:9,m:true,a:"right"});
    acc=0; items.forEach(([l,v],i)=>{ const x=x0+i*cw+(cw-bw)/2, y1=Y(acc), y2=Y(acc+v); g.fillStyle=v>=0?mixC(C.panel,C.ctrl,0.6):mixC(C.panel,C.power,0.55); g.fillRect(x,Math.min(y1,y2),bw,Math.max(2,Math.abs(y2-y1)));
      if(i<items.length-1) lline(g,[[x+bw,y2],[x+cw,y2]],C.line,1); acc+=v;
      ltx(g,l,x+bw/2,H*0.88,{c:C.muted,s:9,m:true}); ltx(g,(v>=0?"+":"")+nf(v,0),x+bw/2,Math.min(y1,y2)-8,{s:9,m:true}); });
    const xm=x0+items.length*cw+(cw-bw)/2, ym=Y(acc), ok=st.margin>=3; g.fillStyle=ok?C.ctrl:C.power; g.fillRect(xm,Math.min(ym,Y(0)),bw,Math.max(3,Math.abs(ym-Y(0))));
    ltx(g,"M",xm+bw/2,H*0.88,{c:C.muted,s:9,m:true}); ltx(g,nf(st.margin,1),xm+bw/2,Math.min(ym,Y(0))-8,{s:10,w:600,m:true,c:ok?C.ctrl:C.power});
    ltx(g,"الهامش "+nf(st.margin,1)+" dB "+(ok?"✓":"✗"),W-10,16,{s:12,w:600,a:"right",rtl:true,c:ok?C.ctrl:C.power});
  },
  ro(st){ return [["فقد المسافة L_s",nf(st.Ls,1)+" dB"],["القدرة المستقبلة",nf(st.Pr,1)+" dBW"],["Eb/N0 المتحققة",nf(st.ebn0,1)+" dB"],["الهامش (المطلوب 9.6 dB)",nf(st.margin,1)+" dB "+(st.margin>=3?"✓":"✗")]]; },
  eq:["P_r = P_t + G_t + G_r − L_s − L_o (dB)","L_s = 20 log₁₀(4π d / λ)","G = 10 log₁₀(η (πD/λ)²)","Eb/N0 = P_r − 10 log(kT) − 10 log(R)"],
  note:["الأعمدة: P_t قدرة المرسل، G_t و G_r كسب الهوائيين، L_s فقد المسافة، L_o فقد آخر (كابلات وجو)، kT·R الضجيج ومعدل البيانات، req المطلوب، M الهامش.","الحساب على تردد 8.4 جيجاهرتز (نطاق X) مع حرارة ضجيج 150 كلفن؛ الأرقام تعليمية.","مضاعفة المسافة تخسر 6 ديسيبل، ومضاعفة قطر الهوائي تكسب 6 ديسيبل."],
  quiz:[{q:"إذا ضاعفت المسافة، يزيد الفقد في الفضاء بمقدار:",o:["3 dB","6 dB","10 dB"],a:1,why:"الفقد يتناسب مع مربع المسافة: 20 log 2 ≈ 6 dB."},
        {q:"لزيادة الهامش لمسبار بعيد دون تغيير المسبار:",o:["خفض معدل البيانات أو تكبير الهوائي الأرضي","زيادة المسافة","زيادة الضجيج"],a:0,why:"كل خفض للمعدل إلى النصف يكسب 3 dB، وكل مضاعفة لقطر الهوائي تكسب 6 dB."}],
  ref:"الموضوع المقابل: الاتصالات والهوائيات (Telecommunications, Link Budget)."
});
LESSONS.sse.push({
  ar:"تباطؤ المدار بسبب الغلاف الجوي", en:"Orbital decay from atmospheric drag",
  alt:"الأرض وقمر صناعي يدور في مدار يتقلص ببطء حتى يدخل الغلاف الجوي، ومنحنى الارتفاع مع الزمن",
  intro:["حتى على ارتفاع 400 كم يوجد هواء رقيق جداً، يكفي لإبطاء القمر قليلاً في كل دورة فينزل مداره تدريجياً. وكلما نزل صار الهواء أكثف فيتسارع النزول حتى يحترق في الغلاف الجوي.",
         "يعتمد العمر على «المعامل البالستي» β = m/(C_D A): القمر الثقيل الصغير يعيش أطول. ونشاط الشمس يسخّن الغلاف العلوي فيتمدد وتزيد الكثافة، فتسقط الأقمار المنخفضة أسرع في ذروة الدورة الشمسية."],
  ctl:[{k:"h",ar:"الارتفاع الابتدائي",min:200,max:800,step:5,v:410,f:v=>nf(v,0)+" km"},{k:"beta",ar:"المعامل البالستي β",min:20,max:300,step:1,v:127,f:v=>nf(v,0)+" kg/m²"},{k:"sol",ar:"نشاط الشمس",min:1,max:3,step:1,v:2,f:v=>["","منخفض","متوسط","مرتفع"][v]}],
  pre:[{ar:"محطة فضائية (تقريبي)",set:{h:410,beta:127}},{ar:"قمر مكعب صغير",set:{h:450,beta:30}},{ar:"قمر ثقيل على 600 كم",set:{h:600,beta:200}}],
  init(st){ st.tt=0; },
  calc(st){ const tab=[[200,2.5e-10],[300,1.9e-11],[400,2.8e-12],[500,5.2e-13],[600,1.1e-13],[700,3.1e-14],[800,1.1e-14],[900,5e-15]], f=[0,0.4,1,2.6][st.sol];
    const rho=h=>{ if(h<=200) return 2.5e-10*Math.exp((200-h)/40)*f; for(let i=1;i<tab.length;i++){ if(h<=tab[i][0]){ const a=tab[i-1], b=tab[i], t=(h-a[0])/(b[0]-a[0]); return Math.exp(Math.log(a[1])+(Math.log(b[1])-Math.log(a[1]))*t)*f; } } return tab[tab.length-1][1]*f; };
    const rate=h=>rho(h)*Math.sqrt(MU*1e9*(RE+h)*1000)/st.beta, cap=86400*365*100;
    let h=st.h, t=0; const hist=[[0,h]]; let n=0;
    while(h>150&&t<cap&&n<200000){ const r=rate(h), dt=Math.max(1800,Math.min(86400*20,300/r)); h-=r*dt/1000; t+=dt; n++; if(n%4===0) hist.push([t/86400,h]); }
    hist.push([t/86400,Math.max(h,150)]); st.hist=hist; st.life=t/86400; st.capped=t>=cap; st.rateNow=rate(st.h)*86400; },
  step(st,dt){ st.tt=(st.tt+dt*0.15)%1.15; },
  draw(g,W,H,st,C){
    const cx=W*0.22, cy=H*0.52, Rm=Math.min(W*0.19,H*0.4), rad=h=>Rm*(0.7+0.3*h/800), f=Math.min(1,st.tt), idx=Math.floor(f*(st.hist.length-1)), h=st.hist[idx][1];
    g.save(); g.globalAlpha=0.25; g.fillStyle=C.ctrl; g.beginPath(); g.arc(cx,cy,rad(150),0,Math.PI*2); g.fill(); g.restore();
    earth(g,cx,cy,Rm*0.7,C);
    const rr=rad(Math.max(150,h)); g.strokeStyle=C.line; g.lineWidth=1; g.beginPath(); g.arc(cx,cy,rr,0,Math.PI*2); g.stroke(); const an=st.t*2; ldot(g,cx+rr*Math.cos(an),cy+rr*Math.sin(an),5,h<=152?C.power:C.ink);
    ltx(g,nf(h,0)+" km",cx,cy+Rm+16,{s:11,m:true});
    const r={x:W*0.48,y:H*0.12,w:W*0.48,h:H*0.66}, xm=Math.max(st.life,1), yrs=xm>800;
    const P=lplot(g,r,[0,xm],[100,Math.max(800,st.h+20)],{xt:[0,xm/2,xm],xf:t=>yrs?nf(t/365,1)+" y":nf(t,0)+" d",yt:[200,400,600,800],xl:"الزمن",xlr:true,yl:"الارتفاع km"});
    lline(g,st.hist.map(([t,hh])=>[P.X(t),P.Y(hh)]),C.hyd,2.2); ldot(g,P.X(st.hist[idx][0]),P.Y(h),5,C.power);
    if(st.capped) ltx(g,"أكثر من 100 سنة",r.x+r.w,r.y+12,{c:C.muted,s:11,a:"right",rtl:true});
  },
  ro(st){ return [["العمر المتوقع",st.capped?"> 100 سنة":st.life>365?nf(st.life/365,1)+" سنة":nf(st.life,0)+" يوم"],["معدل النزول الآن",nf(st.rateNow,1)+" m/يوم"],["الارتفاع الابتدائي",nf(st.h,0)+" km"]]; },
  eq:["تسارع السحب: a_D = ½ ρ v² / β","لمدار دائري: da/dt = −ρ √(μ a) / β","β = m / (C_D A)"],
  note:["الكثافات هنا قيم تقريبية للغلاف العلوي، والنتيجة تقدير لا تنبؤ دقيق.","المحطة الفضائية الدولية تفقد عشرات الأمتار يومياً، فترفع مدارها دورياً بمحركات المركبات الملتحمة بها."],
  quiz:[{q:"أي القمرين يعيش أطول على نفس الارتفاع؟",o:["ذو β الكبير","ذو β الصغير","متساويان"],a:0,why:"β كبير يعني كتلة كبيرة لكل وحدة مساحة، فيتأثر بالسحب أقل."},
        {q:"في ذروة النشاط الشمسي:",o:["تطول أعمار الأقمار","تقصر أعمار الأقمار المنخفضة","لا تتأثر"],a:1,why:"الغلاف العلوي يسخن ويتمدد فتزيد الكثافة على ارتفاع المدار."}],
  ref:"الموضوع المقابل: بيئة الفضاء وعمر المدار (Atmospheric Drag, Orbit Lifetime)."
});
