/* ---------- Book 1: Introduction to Flight — 10 more lessons ---------- */
LK("itf",{
  ar:"مقياس الارتفاع: الارتفاع الضغطي وارتفاع الكثافة", en:"Altimetry: pressure altitude and density altitude",
  alt:"مقياسا ارتفاع: الأول مضبوط على QNH ويقرأ ارتفاع المطار، والثاني على 1013 ويقرأ الارتفاع الضغطي، ومنحنى ارتفاع الكثافة مع درجة الحرارة",
  intro:["مقياس الارتفاع في الطائرة هو مقياس ضغط. إذا ضبطه الطيار على ضغط المطار المحوّل إلى سطح البحر (QNH) يقرأ ارتفاع المطار الحقيقي، وإذا ضبطه على 1013 يقرأ «الارتفاع الضغطي» الذي تستخدمه كل الطائرات فوق ارتفاع الانتقال.",
         "أداء الطائرة لا يتبع الارتفاع الحقيقي بل كثافة الهواء. في يوم حار يكون الهواء أخف، فتتصرف الطائرة كأنها على ارتفاع أعلى: هذا «ارتفاع الكثافة». المحرك يعطي دفعاً أقل والجناح يحتاج سرعة حقيقية أكبر، فيطول الإقلاع."],
  ctl:[{k:"elev",ar:"ارتفاع المطار",min:0,max:10000,step:10,v:114,f:v=>nf(v,0)+" ft"},{k:"qnh",ar:"QNH",min:960,max:1050,step:1,v:1003,f:v=>nf(v,0)+" hPa"},{k:"oat",ar:"درجة الحرارة الخارجية",min:-30,max:55,step:1,v:48,f:v=>nf(v,0)+" °C"}],
  pre:[{ar:"صيف بغداد",set:{elev:114,qnh:1003,oat:48}},{ar:"يوم قياسي",set:{elev:0,qnh:1013,oat:15}},{ar:"مطار مرتفع وحار",set:{elev:5400,qnh:1018,oat:35}},{ar:"شتاء بارد",set:{elev:114,qnh:1030,oat:2}}],
  calc(st){ const elm=st.elev*0.3048, ps=st.qnh*Math.pow(1-2.25577e-5*elm,5.25588);
    st.PA=(1-Math.pow(ps/1013.25,0.190263))/2.25577e-5/0.3048;
    st.dAt=o=>{ const rho=ps*100/(287.05*(o+273.15)), sig=rho/1.225; return {sig,da:(1-Math.pow(sig,1/4.25588))/2.25577e-5/0.3048}; };
    const r=st.dAt(st.oat); st.sig=r.sig; st.DA=r.da; st.isaT=15-1.98*st.PA/1000; st.DAr=st.PA+120*(st.oat-st.isaT); },
  scene(g,r,st,C){ const R=Math.min(r.w*0.22,r.h*0.3), y=r.y+r.h*0.38;
    const alt=(cx,v,lab)=>kGauge(g,cx,y,R,((v%1000)+1000)%1000,0,1000,C,{a0:-90,sw:360,step:100,lf:x=>x>=1000?"":nf(x/100,0),label:lab,val:nf(v,0)+" ft"});
    alt(r.x+r.w*0.27,st.elev,"QNH "+nf(st.qnh,0)); alt(r.x+r.w*0.73,st.PA,"1013");
    ltx(g,"يقرأ ارتفاع المطار",r.x+r.w*0.27,y-R-12,{c:C.muted,s:10,rtl:true}); ltx(g,"يقرأ الارتفاع الضغطي",r.x+r.w*0.73,y-R-12,{c:C.muted,s:10,rtl:true});
    const by=r.y+r.h*0.86, bw=r.w*0.86, bx=r.x+r.w*0.07, mx=Math.max(12000,st.DA*1.1);
    kBar(g,bx,by,bw,10,st.DA/mx,st.DA>st.elev+1500?"power":"ctrl",C,"ارتفاع الكثافة "+nf(st.DA,0)+" ft");
    lline(g,[[bx+bw*st.elev/mx,by-4],[bx+bw*st.elev/mx,by+14]],C.ink,2); },
  plot(st){ const f=o=>st.dAt(o).da, lo=Math.min(f(-30),st.PA)-800, hi=Math.max(f(55),st.PA)+800;
    return {x:[-30,55],y:[lo,hi],xl:"درجة الحرارة °C",yl:"ارتفاع الكثافة ft",curves:[{f,c:"hyd"}],hl:[{y:st.PA,t:"PA"}],vl:[{x:st.isaT,t:"ISA"}],dots:[{x:st.oat,y:st.DA}]}; },
  ro(st){ return [["الارتفاع الضغطي PA",nf(st.PA,0)+" ft"],["حرارة ISA عند المطار",nf(st.isaT,1)+" °C"],["ارتفاع الكثافة",nf(st.DA,0)+" ft"],["بقاعدة الإبهام",nf(st.DAr,0)+" ft"],["σ = ρ/ρ₀",nf(st.sig,3)]]; },
  eq:["PA ≈ ارتفاع المطار + 27 × (1013 − QNH) ft","DA ≈ PA + 120 × (OAT − ISA) ft","σ = ρ/ρ₀ ، والسرعة الحقيقية = المؤشرة ÷ √σ تقريباً"],
  note:["في صيف بغداد يصل ارتفاع الكثافة إلى أكثر من 3000 قدم رغم أن المطار قرب مستوى البحر، ولهذا تقل الأحمال المسموحة في الظهيرة.","الحسابات هنا للهواء الجاف؛ الرطوبة تزيد ارتفاع الكثافة قليلاً."],
  quiz:[{q:"في يوم حار جداً، ارتفاع الكثافة:",o:["أقل من ارتفاع المطار","أعلى من ارتفاع المطار","يساويه دائماً"],a:1,why:"الهواء الحار أقل كثافة، فتتصرف الطائرة كأنها أعلى."},
        {q:"مقياس الارتفاع المضبوط على 1013 hPa يقرأ:",o:["الارتفاع الحقيقي","الارتفاع الضغطي","ارتفاع الكثافة"],a:1,why:"1013.25 هو ضغط سطح البحر القياسي، فالقراءة هي الارتفاع الضغطي."}],
  show:{ar:"اعرض الإلكترونيات",fn:()=>lrnSel("avionics")},
  ref:"الموضوع المقابل: الغلاف الجوي القياسي ومقاييس الارتفاع (Altimeters)."
});
LK("itf",{
  ar:"السرعات: المؤشرة والمعايرة والمكافئة والحقيقية وماخ", en:"Airspeeds: IAS, CAS, EAS, TAS and Mach",
  alt:"مؤشر سرعة مع إبرة على السرعة المعايرة وصندوق يعرض السرعة الحقيقية ورقم ماخ، ومنحنيات السرعات مع الارتفاع",
  intro:["مؤشر السرعة يقيس فرق الضغط بين أنبوب بيتو والضغط الساكن، فهو يعرض سرعة «تشعر بها» الطائرة لا سرعتها الحقيقية. بعد تصحيح أخطاء الموضع نحصل على السرعة المعايرة CAS، وبعد تصحيح الانضغاط على السرعة المكافئة EAS.",
         "السرعة الحقيقية TAS أكبر كلما صعدنا لأن الهواء أخف. لذلك في الصعود بسرعة معايرة ثابتة يزيد رقم ماخ، وعند «ارتفاع التقاطع» يبدأ الطيار يحافظ على ماخ بدلاً من السرعة المعايرة."],
  ctl:[{k:"cas",ar:"السرعة المعايرة CAS",min:100,max:350,step:1,v:280,f:v=>nf(v,0)+" kt"},{k:"alt",ar:"الارتفاع الضغطي",min:0,max:41000,step:500,v:30000,f:v=>nf(v,0)+" ft"},{k:"dev",ar:"الانحراف عن ISA",min:-20,max:20,step:1,v:0,f:v=>(v>0?"+":"")+nf(v,0)+" °C"}],
  pre:[{ar:"اقتراب",set:{cas:140,alt:3000}},{ar:"صعود",set:{cas:290,alt:25000}},{ar:"طيران",set:{cas:260,alt:37000}}],
  calc(st){ const p0=101325, a0=340.294;
    st.at=altft=>{ const s=isa(altft*0.3048), T=s.T+st.dev, p=s.p, a=Math.sqrt(1.4*287.05*T), rho=p/(287.05*T), V=st.cas/KT, qc=p0*(Math.pow(1+0.2*(V/a0)**2,3.5)-1), M=Math.sqrt(5*(Math.pow(qc/p+1,2/7)-1)), tas=M*a; return {M,tas:tas*KT,eas:tas*Math.sqrt(rho/1.225)*KT,a:a*KT}; };
    Object.assign(st,st.at(st.alt)); },
  scene(g,r,st,C){ const R=Math.min(r.w*0.27,r.h*0.36), cx=r.x+r.w*0.3, cy=r.y+r.h*0.45;
    kGauge(g,cx,cy,R,st.cas,40,400,C,{a0:-90,sw:300,step:40,arcs:[{from:100,to:300,c:"#3cb371"},{from:340,to:400,c:"#d9534f"}],label:"KNOTS",val:"CAS "+nf(st.cas,0)+" kt"});
    const bx=r.x+r.w*0.62, bw=r.w*0.34, rows=[["TAS",nf(st.tas,0)+" kt"],["EAS",nf(st.eas,0)+" kt"],["MACH","."+nf(Math.round(st.M*1000),0).padStart(3,"0").slice(-3)]];
    rows.forEach(([k,v],i)=>{ const y=r.y+r.h*0.2+i*r.h*0.22; kBox(g,bx,y,bw,r.h*0.16,"#1d242b",C,"",{stroke:"#5d6873"}); ltx(g,k,bx+8,y+r.h*0.08,{c:"#9fb0bf",s:10,a:"left",m:true}); ltx(g,v,bx+bw-8,y+r.h*0.08,{c:i===2?"#7fe08a":"#ffffff",s:14,w:600,a:"right",m:true}); }); },
  plot(st){ return {x:[0,41000],y:[0,650],xl:"الارتفاع ft",yl:"kt",curves:[{f:h=>st.at(h).tas,c:"power"},{f:h=>st.at(h).eas,c:"ctrl"},{f:()=>st.cas,c:"muted",dash:[5,4]}],
    dots:[{x:st.alt,y:st.tas,c:"power"},{x:st.alt,y:st.eas,c:"ctrl"}],leg:[{c:"power",t:"TAS"},{c:"ctrl",t:"EAS"},{c:"muted",t:"CAS",dash:[5,4]}]}; },
  ro(st){ return [["رقم ماخ",nf(st.M,3)],["السرعة الحقيقية TAS",nf(st.tas,0)+" kt"],["السرعة المكافئة EAS",nf(st.eas,0)+" kt"],["سرعة الصوت هنا",nf(st.a,0)+" kt"]]; },
  eq:["q_c = p₀[(1 + 0.2 (CAS/a₀)²)^3.5 − 1]","M = √(5[(q_c/p + 1)^(2/7) − 1])","TAS = M · a ، EAS = TAS · √σ"],
  note:["على ارتفاعات الطيران قد تكون TAS ضعف CAS تقريباً.","الطائرة تنهار عند نفس السرعة المكافئة تقريباً على أي ارتفاع، لذلك يطير الطيار بالمؤشرة لا بالحقيقية."],
  quiz:[{q:"في صعود بسرعة معايرة ثابتة، رقم ماخ:",o:["يقل","يزيد","يبقى ثابتاً"],a:1,why:"السرعة الحقيقية تزيد وسرعة الصوت تقل مع البرودة، فيزيد ماخ."},
        {q:"أي سرعة تحدد الرفع والحمل على الهيكل؟",o:["الحقيقية TAS","المكافئة EAS","الأرضية GS"],a:1,why:"الضغط الديناميكي ½ρ₀EAS² هو ما يولّد القوى الهوائية."}],
  show:{ar:"اعرض الإلكترونيات",fn:()=>lrnSel("avionics")},
  ref:"الموضوع المقابل: قياس السرعة الجوية (Measurement of Airspeed)."
});
LK("itf",{
  ar:"مقاطع NACA ذات الأرقام الأربعة", en:"NACA four-digit airfoils",
  alt:"مقطع جناح NACA مرسوم مع خط التحدب وخط الوتر، ومنحنى معامل الرفع مع زاوية الهجوم مقارنة بالمقطع المتماثل",
  intro:["سلسلة NACA ذات الأرقام الأربعة طريقة قديمة وواضحة لتسمية المقطع: الرقم الأول أقصى تحدب بالنسبة المئوية من الوتر، والثاني مكانه بالأعشار، والأخيران أقصى سماكة بالنسبة المئوية. فالمقطع 2412 تحدبه 2% عند 40% وسماكته 12%.",
         "التحدب يجعل المقطع يولّد رفعاً حتى عند زاوية هجوم صفر، فتصبح «زاوية الرفع الصفري» سالبة، ويظهر عزم يدير الأنف للأسفل. السماكة لا تغيّر الرفع كثيراً في النظرية الرقيقة لكنها تؤثر على الانهيار والسحب والمتانة."],
  ctl:[{k:"m",ar:"أقصى تحدب",min:0,max:9,step:1,v:2,f:v=>nf(v,0)+"%"},{k:"p",ar:"مكان أقصى تحدب",min:1,max:9,step:1,v:4,f:v=>nf(v*10,0)+"%"},{k:"th",ar:"أقصى سماكة",min:6,max:24,step:1,v:12,f:v=>nf(v,0)+"%"},{k:"al",ar:"زاوية الهجوم",min:-6,max:12,step:0.5,v:4,f:v=>nf(v,1)+"°"}],
  pre:[{ar:"NACA 0012",set:{m:0,p:4,th:12}},{ar:"NACA 2412",set:{m:2,p:4,th:12}},{ar:"NACA 4415",set:{m:4,p:4,th:15}},{ar:"NACA 6409",set:{m:6,p:4,th:9}}],
  calc(st){ const m=st.m/100, p=st.p/10, dz=x=>m===0?0:(x<p?2*m/(p*p)*(p-x):2*m/((1-p)*(1-p))*(p-x)); let i0=0,i1=0,i2=0; const N=400;
    for(let i=0;i<N;i++){ const th=(i+0.5)/N*Math.PI, x=(1-Math.cos(th))/2, d=dz(x)*Math.PI/N; i0+=d*(Math.cos(th)-1); i1+=d*Math.cos(th); i2+=d*Math.cos(2*th); }
    st.aL0=-i0/Math.PI/D2R; const A1=2/Math.PI*i1, A2=2/Math.PI*i2; st.cm=Math.PI/4*(A2-A1); st.cl=2*Math.PI*(st.al-st.aL0)*D2R; st.rle=1.1019*(st.th/100)**2*100;
    st.name="NACA "+st.m+st.p+String(st.th).padStart(2,"0"); },
  scene(g,r,st,C){ const ch=r.w*0.84, ox=r.x+r.w*0.08, oy=r.y+r.h*0.55;
    const P=kFoil(g,ox,oy,ch,st.al,C,{m:st.m/100,p:st.p/10,t:st.th/100,camber:true});
    if(st.m>0){ const q=P(st.p/10,P.yc(st.p/10)); ldot(g,q[0],q[1],4,C.power); ltx(g,"أقصى تحدب",q[0],q[1]-14,{c:C.power,s:10,rtl:true}); }
    const q2=P(0.3,P.yc(0.3)+P.yt(0.3)), q3=P(0.3,P.yc(0.3)-P.yt(0.3)); lline(g,[q2,q3],C.hyd,1.5); ltx(g,nf(st.th,0)+"%",q3[0],q3[1]+12,{c:C.hyd,s:10,m:true});
    ltx(g,st.name,r.x+r.w*0.5,r.y+16,{s:16,w:600,m:true}); larrow(g,r.x+4,oy+r.h*0.25,r.x+44,oy+r.h*0.25,C.muted,1.5,6); ltx(g,"الهواء",r.x+24,oy+r.h*0.25+14,{c:C.muted,s:10,rtl:true}); },
  plot(st){ return {x:[-8,14],y:[-0.8,2],xl:"α (°)",yl:"c_l",curves:[{f:a=>2*Math.PI*(a-st.aL0)*D2R,c:"hyd"},{f:a=>2*Math.PI*a*D2R,c:"muted",dash:[5,4]}],
    hl:[{y:0,c:"line",dash:[2,3]}],dots:[{x:st.aL0,y:0,c:"power",t:"α₀"},{x:st.al,y:st.cl,c:"accent"}],leg:[{c:"hyd",t:st.name},{c:"muted",t:"متماثل",dash:[5,4]}]}; },
  ro(st){ return [["المقطع",st.name],["زاوية الرفع الصفري",nf(st.aL0,2)+"°"],["c_l عند α",nf(st.cl,2)],["c_m حول ربع الوتر",nf(st.cm,3)],["نصف قطر الحافة الأمامية",nf(st.rle,2)+"% c"]]; },
  eq:["y_c = (m/p²)(2px − x²) قبل p ، و y_c = (m/(1−p)²)[(1−2p) + 2px − x²] بعده","α_L0 = −(1/π)∫ (dz/dx)(cos θ − 1) dθ","c_m,c/4 = (π/4)(A₂ − A₁)"],
  note:["القيم هنا من نظرية المقطع الرقيق، وهي قريبة من الاختبار حتى قبل الانهيار بقليل.","طائرات النقل الحديثة تستخدم مقاطع «فوق حرجة» مصممة بالحاسوب، لكن أرقام NACA ما زالت شائعة في الطائرات الصغيرة."],
  quiz:[{q:"ماذا يعني الرقم 12 في NACA 2412؟",o:["التحدب 12%","السماكة 12% من الوتر","زاوية الهجوم 12°"],a:1,why:"آخر رقمين هما أقصى سماكة كنسبة من الوتر."},
        {q:"زيادة التحدب تجعل زاوية الرفع الصفري:",o:["أكثر سالبية","موجبة","صفراً"],a:0,why:"المقطع المتحدب يرفع عند α = 0، فيجب خفض الأنف أكثر ليختفي الرفع."}],
  show:{ar:"اعرض صندوق الجناح",fn:()=>lrnSel("wingbox")},
  ref:"الموضوع المقابل: تسمية المقاطع وخصائصها (Airfoil Nomenclature)."
});
LK("itf",{
  ar:"نفق الرياح: الفنتوري وسرعة قسم الاختبار", en:"Low-speed wind tunnel and the Venturi",
  alt:"نفق رياح بغرفة تهدئة ثم تضييق ثم قسم اختبار، وجزيئات تسرع في الجزء الضيق، ومانومتر على شكل U يعرض فرق الضغط",
  intro:["في نفق الرياح يمر الهواء من غرفة واسعة إلى قسم ضيق، فتزيد سرعته بنسبة تضييق المساحة (معادلة الاستمرارية)، وينخفض ضغطه (برنولي). قياس فرق الضغط بين الجزأين يعطي سرعة الهواء في قسم الاختبار.",
         "يقاس فرق الضغط بمانومتر: أنبوب على شكل U فيه ماء، يرتفع الماء في جهة الضغط المنخفض. كل مليمتر ماء يساوي نحو 9.8 باسكال. وهذا المبدأ نفسه في أنبوب الفنتوري الذي كان يشغّل بعض أجهزة الطائرات القديمة."],
  ctl:[{k:"cr",ar:"نسبة التضييق A₁/A₂",min:3,max:12,step:0.5,v:8,f:v=>nf(v,1)},{k:"dh",ar:"فرق ارتفاع الماء",min:10,max:400,step:5,v:120,f:v=>nf(v,0)+" mm"},{k:"ch",ar:"وتر النموذج",min:0.1,max:0.5,step:0.01,v:0.25,f:v=>nf(v,2)+" m"}],
  calc(st){ st.dp=1000*9.81*st.dh/1000; st.V2=Math.sqrt(2*st.dp/(1.225*(1-1/(st.cr*st.cr)))); st.V1=st.V2/st.cr; st.Re=1.225*st.V2*st.ch/1.79e-5; },
  scene(g,r,st,C){ const cy=r.y+r.h*0.34, H1=r.h*0.44, H2=H1/Math.sqrt(st.cr), x0=r.x+4, x1=r.x+r.w*0.3, x2=r.x+r.w*0.45, x3=r.x+r.w*0.72, x4=r.x+r.w*0.98;
    const top=x=>x<x1?cy-H1/2:x<x2?cy-H1/2+(H1-H2)/2*(1-Math.cos(Math.PI*(x-x1)/(x2-x1)))/2:x<x3?cy-H2/2:cy-H2/2-(x-x3)/(x4-x3)*(H1-H2)*0.3;
    g.fillStyle=mixC(C.panel,C.hyd,0.08); g.beginPath(); for(let x=x0;x<=x4;x+=4) g.lineTo(x,top(x)); for(let x=x4;x>=x0;x-=4) g.lineTo(x,2*cy-top(x)); g.closePath(); g.fill();
    const tl=[], bl=[]; for(let x=x0;x<=x4;x+=4){ tl.push([x,top(x)]); bl.push([x,2*cy-top(x)]); } lline(g,tl,C.ink,2); lline(g,bl,C.ink,2);
    for(let k=0;k<5;k++){ const f=(k+0.5)/5; let x=x0+((st.t*40*(1+k*0.13))%(x4-x0)); for(let j=0;j<3;j++){ const xx=x0+((x-x0+j*(x4-x0)/3)%(x4-x0)), w=cy-top(xx); ldot(g,xx,cy-w+2*w*f,2,C.hyd,0.8); } }
    const mc=(x2+x3)/2; kFoil(g,mc-r.w*0.06,cy,r.w*0.12,4,C,{m:0.02,t:0.12});
    ltx(g,"غرفة التهدئة",(x0+x1)/2,cy-H1/2-10,{c:C.muted,s:10,rtl:true}); ltx(g,"قسم الاختبار",mc,cy-H2/2-10,{c:C.muted,s:10,rtl:true});
    const my=r.y+r.h*0.9, ux=r.x+r.w*0.36, uw=r.w*0.12, hpx=Math.min(r.h*0.18,st.dh*0.12);
    lline(g,[[(x0+x1)/2,cy+H1/2],[(x0+x1)/2,my-r.h*0.22],[ux,my-r.h*0.22],[ux,my]],C.muted,1.2); lline(g,[[mc,cy+H2/2],[mc,my-r.h*0.26],[ux+uw,my-r.h*0.26],[ux+uw,my]],C.muted,1.2);
    g.strokeStyle=C.ink; g.lineWidth=1.5; g.beginPath(); g.moveTo(ux,my-r.h*0.2); g.lineTo(ux,my); g.arc(ux+uw/2,my,uw/2,Math.PI,0,true); g.lineTo(ux+uw,my-r.h*0.2); g.stroke();
    g.fillStyle=C.hyd; g.fillRect(ux-2,my-r.h*0.06+hpx/2,4,r.h*0.06-hpx/2+2); g.fillRect(ux+uw-2,my-r.h*0.06-hpx/2,4,r.h*0.06+hpx/2+2);
    ltx(g,"Δh = "+nf(st.dh,0)+" mm",ux+uw+10,my-r.h*0.05,{s:11,a:"left",m:true}); },
  plot(st){ const f=h=>Math.sqrt(2*1000*9.81*h/1000/(1.225*(1-1/(st.cr*st.cr)))); return {x:[0,400],y:[0,90],xl:"Δh (mm ماء)",yl:"V m/s",curves:[{f,c:"hyd"}],dots:[{x:st.dh,y:st.V2,t:nf(st.V2,1)+" m/s"}]}; },
  ro(st){ return [["فرق الضغط",nf(st.dp,0)+" Pa"],["سرعة قسم الاختبار",nf(st.V2,1)+" m/s ("+nf(st.V2*3.6,0)+" km/h)"],["سرعة غرفة التهدئة",nf(st.V1,2)+" m/s"],["رينولدز النموذج",sci(st.Re,2)]]; },
  eq:["A₁V₁ = A₂V₂","p₁ − p₂ = ½ρ(V₂² − V₁²)","V₂ = √(2Δp / (ρ[1 − (A₂/A₁)²]))"],
  note:["رقم رينولدز للنموذج الصغير أقل بكثير من الطائرة الحقيقية، ولهذا تُصحَّح نتائج الأنفاق قبل استخدامها.","نسبة التضييق الكبيرة تهدّئ الاضطراب وتجعل الهواء في قسم الاختبار أكثر انتظاماً."],
  quiz:[{q:"إذا ضاعفت فرق الضغط، سرعة قسم الاختبار:",o:["تتضاعف","تزيد بمعامل √2","لا تتغيّر"],a:1,why:"V ∝ √Δp."},
        {q:"لماذا يرتفع الماء في جهة قسم الاختبار؟",o:["لأن ضغطه أعلى","لأن ضغطه أقل","بسبب الحرارة"],a:1,why:"الهواء أسرع هناك فضغطه الساكن أقل."}],
  ref:"الموضوع المقابل: نفق الرياح منخفض السرعة (Low-Speed Wind Tunnels)."
});
LK("itf",{
  ar:"القدرة المطلوبة والتحمّل لطائرة مروحية", en:"Power required and endurance of a propeller airplane",
  alt:"منحنى القدرة المطلوبة مع السرعة وخط القدرة المتاحة، مع نقاط أقل قدرة وأفضل مدى والسرعة القصوى",
  intro:["لطائرة المروحة نتكلم عن القدرة (الدفع × السرعة). القدرة المطلوبة كبيرة عند السرعات البطيئة بسبب السحب المستحث، وكبيرة عند السرعات العالية بسبب السحب الطفيلي، وبينهما قاع واضح.",
         "عند قاع المنحنى تستهلك الطائرة أقل وقود في الساعة: هذه سرعة أطول تحمّل. أما أفضل مدى للمروحية فعند أقل سحب، أي حيث يمس خط من نقطة الصفر المنحنى. الفرق بين القدرة المتاحة والمطلوبة هو ما يصعد بالطائرة."],
  ctl:[{k:"W",ar:"الكتلة",min:600,max:2500,step:10,v:1100,f:v=>nf(v,0)+" kg"},{k:"cd0",ar:"معامل السحب الطفيلي C_D0",min:0.02,max:0.05,step:0.001,v:0.032,f:v=>nf(v,3)},
       {k:"AR",ar:"نسبة الباع",min:5,max:12,step:0.1,v:7.4,f:v=>nf(v,1)},{k:"P",ar:"قدرة المحرك",min:60,max:250,step:1,v:120,f:v=>nf(v,0)+" kW"},{k:"alt",ar:"الارتفاع",min:0,max:15000,step:500,v:3000,f:v=>nf(v,0)+" ft"}],
  calc(st){ const S=16.2, e=0.8, rho=isa(st.alt*0.3048).rho, k=1/(Math.PI*e*st.AR), Wn=st.W*G0;
    st.Pr=V=>0.5*rho*V**3*S*st.cd0+k*Wn*Wn/(0.5*rho*V*S); st.Vmd=Math.sqrt(2*Wn/(rho*S))*Math.pow(k/st.cd0,0.25); st.Vmp=st.Vmd/Math.pow(3,0.25);
    st.Pa=0.7*st.P*1000; st.Pmin=st.Pr(st.Vmp); st.roc=(st.Pa-st.Pmin)/Wn; st.Vmax=st.Pa>st.Pmin?kRoot(V=>st.Pr(V)-st.Pa,st.Vmp,200):NaN; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.32, s=Math.min(r.w*0.7,r.h*0.8);
    lplane(g,cx,cy,s,2+Math.sin(st.t*1.3)*1.2,C,{flip:true});
    const bx=r.x+r.w*0.08, bw=r.w*0.84; kBar(g,bx,r.y+r.h*0.7,bw,12,st.Pmin/st.Pa,"ctrl",C,"أقل قدرة مطلوبة "+nf(st.Pmin/1000,0)+" kW");
    kBar(g,bx,r.y+r.h*0.88,bw,12,1,"fuel",C,"القدرة المتاحة "+nf(st.Pa/1000,0)+" kW (كفاءة المروحة 70%)"); },
  plot(st){ const kt=v=>v*KT; return {x:[30,220],y:[0,Math.max(st.Pa,st.Pr(200/KT))/1000*1.1],xl:"السرعة kt",yl:"kW",
    curves:[{f:v=>st.Pr(v/KT)/1000,c:"hyd"},{f:()=>st.Pa/1000,c:"fuel",dash:[5,4]},{f:v=>st.Pr(st.Vmd)/st.Vmd*v/KT/1000,c:"muted",dash:[2,3]}],
    dots:[{x:kt(st.Vmp),y:st.Pmin/1000,c:"ctrl",t:"تحمّل"},{x:kt(st.Vmd),y:st.Pr(st.Vmd)/1000,c:"power",t:"مدى"},...(isFinite(st.Vmax)?[{x:kt(st.Vmax),y:st.Pa/1000,c:"accent",t:"Vmax"}]:[])]}; },
  ro(st){ return [["سرعة أطول تحمّل",nf(st.Vmp*KT,0)+" kt"],["سرعة أفضل مدى",nf(st.Vmd*KT,0)+" kt"],["السرعة القصوى",isFinite(st.Vmax)?nf(st.Vmax*KT,0)+" kt":"لا تطير أفقياً"],["أقصى معدل صعود",nf(Math.max(0,st.roc)*196.85,0)+" ft/min"]]; },
  eq:["P_R = ½ρV³S C_D0 + 2kW² / (ρVS)","V(أقل قدرة) = V(أقل سحب) / 3^¼","معدل الصعود = (P_A − P_R) / W"],
  note:["الأرقام لطائرة تدريب بحجم سيسنا 172 تقريباً، وكفاءة المروحة مأخوذة ثابتة 70% للتبسيط.","مع الارتفاع يقل الفرق بين المنحنيين حتى ينعدم عند السقف المطلق."],
  quiz:[{q:"أطول بقاء في الجو للطائرة المروحية يكون عند:",o:["أقل سحب","أقل قدرة مطلوبة","أعلى سرعة"],a:1,why:"استهلاك الوقود يتناسب مع القدرة لمحرك المكبس."},
        {q:"أفضل مدى للطائرة المروحية يكون عند:",o:["أقل قدرة","أقل سحب، أي أكبر L/D","السرعة القصوى"],a:1,why:"الوقود لكل كيلومتر يتناسب مع P/V = D."}],
  show:{ar:"اعرض المحرك",fn:()=>lrnSel("engine")},
  ref:"الموضوع المقابل: القدرة المطلوبة والمتاحة (Power Required and Power Available)."
});
LK("itf",{
  ar:"التحمّل للطائرة النفاثة وسرعة الانتظار", en:"Jet endurance and holding speed",
  alt:"نمط انتظار بيضوي تدور فيه طائرة، ومنحنى استهلاك الوقود بالساعة مع السرعة وأدنى نقطة عند سرعة أقل سحب",
  intro:["عندما تنتظر الطائرة دورها للهبوط يريد الطيار أن يبقى أطول وقت بأقل وقود. للمحرك النفاث يتناسب الاستهلاك مع الدفع، والدفع المطلوب أقل ما يمكن عند أقل سحب، أي عند أكبر نسبة رفع إلى سحب.",
         "معادلة بريغيه للتحمّل تقول إن الزمن يتناسب مع L/D ويقل مع استهلاك المحرك، ويعتمد على لوغاريتم نسبة الوزن قبل وبعد. لذلك تنتظر الطائرات على ارتفاع متوسط وبسرعة قريبة من سرعة أقل سحب."],
  ctl:[{k:"m",ar:"الكتلة",min:50,max:79,step:0.5,v:65,f:v=>nf(v,1)+" t"},{k:"alt",ar:"ارتفاع الانتظار",min:5000,max:25000,step:500,v:15000,f:v=>nf(v,0)+" ft"},{k:"F",ar:"الوقود المتاح للانتظار",min:500,max:8000,step:100,v:3000,f:v=>nf(v,0)+" kg"},{k:"cd0",ar:"C_D0",min:0.018,max:0.03,step:0.001,v:0.022,f:v=>nf(v,3)}],
  calc(st){ const S=124.6, k=1/(Math.PI*0.8*9.45), at=isa(st.alt*0.3048), W=st.m*1000*G0, tsfc=1.5e-5;
    st.D=V=>0.5*at.rho*V*V*S*st.cd0+k*W*W/(0.5*at.rho*V*V*S); st.Vmd=Math.sqrt(2*W/(at.rho*S))*Math.pow(k/st.cd0,0.25); st.E=1/(2*Math.sqrt(k*st.cd0));
    st.ff=V=>tsfc*st.D(V)*3600; st.ffmin=st.ff(st.Vmd); st.tE=st.E/(tsfc*G0)*Math.log(W/(W-st.F*G0))/60; st.ias=st.Vmd*Math.sqrt(at.rho/1.225)*KT; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.45, L=r.w*0.28, R=r.h*0.2, per=2*L+2*Math.PI*R, d=(st.t*0.12*per)%per;
    g.strokeStyle=C.line; g.lineWidth=1.5; g.setLineDash([5,4]); g.beginPath(); g.moveTo(cx-L/2,cy-R); g.lineTo(cx+L/2,cy-R); g.arc(cx+L/2,cy,R,-Math.PI/2,Math.PI/2); g.lineTo(cx-L/2,cy+R); g.arc(cx-L/2,cy,R,Math.PI/2,Math.PI*1.5); g.stroke(); g.setLineDash([]);
    let x,y,a; if(d<L){ x=cx-L/2+d; y=cy-R; a=0; } else if(d<L+Math.PI*R){ const t=(d-L)/R; x=cx+L/2+Math.sin(t)*R; y=cy-Math.cos(t)*R; a=t; } else if(d<2*L+Math.PI*R){ x=cx+L/2-(d-L-Math.PI*R); y=cy+R; a=Math.PI; } else { const t=(d-2*L-Math.PI*R)/R; x=cx-L/2-Math.sin(t)*R; y=cy+Math.cos(t)*R; a=Math.PI+t; }
    tplane(g,x,y,Math.min(36,r.w*0.1),a,C); ldot(g,cx-L/2,cy-R,4,C.power); ltx(g,"نقطة الانتظار",cx-L/2,cy-R-14,{c:C.power,s:10,rtl:true});
    ltx(g,"IAS ≈ "+nf(st.ias,0)+" kt",cx,r.y+r.h*0.86,{s:13,w:600,m:true}); },
  plot(st){ const lo=st.Vmd*0.6*KT, hi=st.Vmd*1.8*KT; return {x:[lo,hi],y:[0,st.ff(st.Vmd*0.6)*1.1],xl:"TAS kt",yl:"kg/h",curves:[{f:v=>st.ff(v/KT),c:"fuel"}],vl:[{x:st.Vmd*KT,c:"ctrl"}],dots:[{x:st.Vmd*KT,y:st.ffmin,c:"ctrl",t:"أقل استهلاك"}]}; },
  ro(st){ return [["سرعة الانتظار (TAS)",nf(st.Vmd*KT,0)+" kt"],["تقريباً (IAS)",nf(st.ias,0)+" kt"],["L/D الأقصى",nf(st.E,1)],["استهلاك الوقود",nf(st.ffmin,0)+" kg/h"],["زمن الانتظار بالوقود المتاح",nf(st.tE,0)+" min"]]; },
  eq:["t = (1/c)(L/D) ln(W₀/W₁)","الدفع المطلوب الأدنى = W / (L/D)max","(L/D)max = 1 / (2√(k C_D0))"],
  note:["نموذج مبسّط لطائرة بحجم 737-800 باستهلاك ثابت للمحرك؛ أرقام الانتظار الفعلية في دليل الأداء.","يطير الطيار عادة أسرع قليلاً من سرعة أقل سحب لأن الطائرة هناك أقل ثباتاً في السرعة."],
  quiz:[{q:"أطول انتظار للنفاثة يكون عند:",o:["أقل قدرة","أقل سحب (أكبر L/D)","أعلى سرعة"],a:1,why:"استهلاك النفاثة يتناسب مع الدفع، والدفع الأدنى عند أقل سحب."},
        {q:"عندما تخف الطائرة أثناء الانتظار، سرعة أقل سحب:",o:["تزيد","تقل","لا تتغيّر"],a:1,why:"V_md ∝ √W."}],
  show:{ar:"اعرض المحرك",fn:()=>lrnSel("engine")},
  ref:"الموضوع المقابل: التحمّل للطائرات النفاثة (Endurance of Jet Airplanes)."
});
const WB_ENV=[[8,40],[8,62],[12,79],[28,79],[33,66],[33,40]];
function wbIn(x,y){ let c=false; for(let i=0,j=WB_ENV.length-1;i<WB_ENV.length;j=i++){ const [xi,yi]=WB_ENV[i],[xj,yj]=WB_ENV[j]; if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi)) c=!c; } return c; }
LK("itf",{
  ar:"الوزن والتوازن: مركز الثقل ونسبة الوتر المتوسط", en:"Weight and balance: CG and %MAC",
  alt:"جسم طائرة بمناطق الركاب والشحن والوقود ملوّنة حسب الحمل، ومؤشر مركز الثقل على مقياس نسبة الوتر المتوسط، ومخطط الحدود المسموحة",
  intro:["قبل كل رحلة يُحسب مكان مركز الثقل من وزن كل حمل وذراعه: الوزن × الذراع يعطي العزم، ومجموع العزوم ÷ مجموع الأوزان يعطي مكان المركز. ويُكتب كنسبة مئوية من «الوتر الهوائي المتوسط» MAC.",
         "لكل طائرة حدود أمامية وخلفية. المركز الأمامي جداً يجعل رفع الأنف صعباً ويزيد الاستهلاك، والخلفي جداً يجعل الطائرة غير مستقرة. لذلك يوزع الحمل بين المقصورة الأمامية والخلفية وعنابر الشحن."],
  ctl:[{k:"pf",ar:"ركاب القسم الأمامي",min:0,max:80,step:1,v:70,f:v=>nf(v,0)},{k:"pa",ar:"ركاب القسم الخلفي",min:0,max:109,step:1,v:90,f:v=>nf(v,0)},
       {k:"cf",ar:"الشحن الأمامي",min:0,max:5000,step:50,v:2000,f:v=>nf(v,0)+" kg"},{k:"ca",ar:"الشحن الخلفي",min:0,max:6000,step:50,v:1500,f:v=>nf(v,0)+" kg"},{k:"fu",ar:"الوقود",min:0,max:20800,step:100,v:12000,f:v=>nf(v,0)+" kg"}],
  pre:[{ar:"رحلة ممتلئة",set:{pf:80,pa:109,cf:2500,ca:3000,fu:14000}},{ar:"ركاب في الأمام فقط",set:{pf:80,pa:0,cf:3000,ca:0,fu:8000}},{ar:"ركاب في الخلف فقط",set:{pf:0,pa:109,cf:0,ca:5500,fu:6000}}],
  calc(st){ const L=[[41400,16.0],[st.pf*85,10.5],[st.pa*85,21.5],[st.cf,9.0],[st.ca,23.5],[st.fu,16.5]]; let m=0,mo=0; L.forEach(([w,a])=>{ m+=w; mo+=w*a; });
    st.TOW=m; st.cg=mo/m; st.mac=(st.cg-15.4)/3.96*100; const zm=m-st.fu, zmo=mo-st.fu*16.5; st.ZFW=zm; st.zmac=(zmo/zm-15.4)/3.96*100;
    st.ok=wbIn(st.mac,st.TOW/1000)&&st.TOW<=79000&&st.ZFW<=62700; },
  scene(g,r,st,C){ const y=r.y+r.h*0.34, x0=r.x+r.w*0.04, len=r.w*0.92, X=a=>x0+(a-1)/(38-1)*len, hh=r.h*0.16;
    g.fillStyle=mixC(C.panel,C.struct,0.2); g.strokeStyle=C.ink; g.lineWidth=1.4; g.beginPath(); g.moveTo(X(1),y); g.quadraticCurveTo(X(1),y-hh,X(4),y-hh); g.lineTo(X(32),y-hh); g.lineTo(X(36),y-hh*2.2); g.lineTo(X(38),y-hh*2.2); g.lineTo(X(38),y-hh*0.6); g.lineTo(X(32),y+hh*0.6); g.lineTo(X(4),y+hh); g.quadraticCurveTo(X(1),y+hh,X(1),y); g.fill(); g.stroke();
    const zone=(a0,a1,frac,c,yy,h)=>{ g.fillStyle=mixC(C.panel,KC(c,C),0.25+0.6*frac); g.fillRect(X(a0),yy,X(a1)-X(a0),h); };
    zone(6,15,st.pf/80,"hyd",y-hh*0.85,hh*0.8); zone(16,29,st.pa/109,"hyd",y-hh*0.85,hh*0.8); zone(6,12,st.cf/5000,"gear",y+hh*0.05,hh*0.6); zone(20,28,st.ca/6000,"gear",y+hh*0.05,hh*0.6);
    ltx(g,"ركاب",X(10.5),y-hh*0.45,{s:10,rtl:true}); ltx(g,"ركاب",X(22.5),y-hh*0.45,{s:10,rtl:true}); ltx(g,"شحن",X(9),y+hh*0.35,{s:10,rtl:true}); ltx(g,"شحن",X(24),y+hh*0.35,{s:10,rtl:true});
    const sy=r.y+r.h*0.78, s0=r.x+r.w*0.1, sw=r.w*0.8, M=v=>s0+clamp(v,0,40)/40*sw; g.fillStyle=mixC(C.panel,C.ctrl,0.25); g.fillRect(M(8),sy-6,M(33)-M(8),12);
    for(let v=0;v<=40;v+=10){ lline(g,[[M(v),sy+6],[M(v),sy+12]],C.muted,1); ltx(g,v+"%",M(v),sy+22,{c:C.muted,s:9,m:true}); }
    g.fillStyle=st.ok?C.ctrl:C.power; g.beginPath(); g.moveTo(M(st.mac),sy-8); g.lineTo(M(st.mac)-7,sy-20); g.lineTo(M(st.mac)+7,sy-20); g.closePath(); g.fill(); ltx(g,"CG "+nf(st.mac,1)+"% MAC",M(st.mac),sy-30,{c:st.ok?C.ctrl:C.power,s:11,w:600,m:true}); },
  plot(st){ return {x:[0,40],y:[38,82],xl:"% MAC",yl:"الوزن t",lines:[{pts:WB_ENV.concat([WB_ENV[0]]),c:"ctrl",fill:"ctrl"},{pts:[[st.zmac,st.ZFW/1000],[st.mac,st.TOW/1000]],c:"fuel",dash:[4,3]}],
    hl:[{y:79,t:"MTOW",c:"power"},{y:62.7,t:"MZFW",c:"muted"}],dots:[{x:st.zmac,y:st.ZFW/1000,c:"fuel",r:4},{x:st.mac,y:st.TOW/1000,c:st.ok?"ctrl":"power"}]}; },
  ro(st){ return [["وزن الإقلاع",nf(st.TOW/1000,1)+" t"],["الوزن بلا وقود",nf(st.ZFW/1000,1)+" t"],["مركز الثقل",nf(st.mac,1)+"% MAC"],["الحالة",st.ok?"ضمن الحدود ✓":"خارج الحدود ✗"]]; },
  eq:["العزم = الوزن × الذراع","CG = Σ(W·arm) / ΣW","%MAC = (CG − LEMAC) / MAC × 100"],
  note:["الأذرع والحدود هنا أرقام تعليمية قريبة من طائرة بحجم 737-800؛ القيم الحقيقية في دليل الوزن والتوازن للطائرة.","الخط المتقطع في المخطط يبين حركة مركز الثقل مع احتراق الوقود."],
  quiz:[{q:"مركز الثقل الخلفي جداً يجعل الطائرة:",o:["أكثر استقراراً","أقل استقراراً وأخف في التحكم","أثقل في الهبوط"],a:1,why:"الذراع بين مركز الثقل ونقطة الحياد يقل، فتضعف قدرة الطائرة على العودة."},
        {q:"لماذا يُحسب الوزن بلا وقود (ZFW)؟",o:["لأن له حداً هيكلياً يخص جذر الجناح","لأنه يحدد سرعة الإقلاع","لأنه يساوي الوزن الفارغ"],a:0,why:"الوقود في الجناح يخفف انحناء الجذر؛ بدونه يتحمّل الجذر كل الحمل."}],
  show:{ar:"اعرض منتصف الجسم",fn:()=>lrnSel("fuse_mid")},
  ref:"الموضوع المقابل: الوزن ومركز الثقل والاستقرار (Weight and Balance)."
});
LK("itf",{
  ar:"الرفع والضغط الديناميكي: لماذا يطير الطيار بالمؤشرة", en:"Lift and dynamic pressure: why pilots fly indicated airspeed",
  alt:"طائرتان على ارتفاعين مختلفين بنفس زاوية الهجوم وسهمَي سرعة حقيقية مختلفي الطول، ومنحنى معامل الرفع مع السرعة المكافئة",
  intro:["الرفع = الضغط الديناميكي × مساحة الجناح × معامل الرفع. والضغط الديناميكي ½ρV² يساوي ½ρ₀EAS²، أي أنه يعتمد على السرعة المكافئة فقط مهما كان الارتفاع.",
         "لذلك إذا طارت الطائرة بنفس السرعة المؤشرة على أي ارتفاع تحتاج نفس معامل الرفع ونفس زاوية الهجوم، وتنهار عند نفس السرعة المؤشرة تقريباً. لكن سرعتها الحقيقية فوق تكون أكبر بكثير."],
  ctl:[{k:"m",ar:"الكتلة",min:45,max:79,step:0.5,v:65,f:v=>nf(v,1)+" t"},{k:"eas",ar:"السرعة المكافئة EAS",min:110,max:340,step:1,v:250,f:v=>nf(v,0)+" kt"},{k:"alt",ar:"الارتفاع",min:0,max:41000,step:500,v:30000,f:v=>nf(v,0)+" ft"}],
  calc(st){ const S=124.6, W=st.m*1000*G0, s=isa(st.alt*0.3048); st.q=0.5*1.225*(st.eas/KT)**2; st.CL=W/(st.q*S); st.al=st.CL/0.09-2; st.tas=st.eas/Math.sqrt(s.rho/1.225); st.M=st.tas/KT/s.a; st.vs=Math.sqrt(2*W/(1.225*S*1.45))*KT; },
  scene(g,r,st,C){ const s=Math.min(r.w*0.42,r.h*0.5), pit=clamp(st.al,-2,16), x0=r.x+r.w*0.3;
    const lv=(y,tas,lab)=>{ lplane(g,x0,y,s,pit,C,{flip:true}); larrow(g,x0+s*0.55,y,x0+s*0.55+tas/700*r.w*0.4,y,C.power,2.5,8); ltx(g,lab+" · TAS "+nf(tas,0)+" kt",r.x+r.w*0.98,y-s*0.22,{s:11,a:"right",rtl:true}); };
    lv(r.y+r.h*0.3,st.tas,nf(st.alt,0)+" ft"); lv(r.y+r.h*0.75,st.eas,"سطح البحر");
    ltx(g,"نفس زاوية الهجوم: "+nf(st.al,1)+"°",r.x+r.w*0.5,r.y+r.h*0.97,{s:12,w:600,c:st.CL>1.45?C.power:C.ctrl,rtl:true}); },
  plot(st){ return {x:[100,350],y:[0,2],xl:"EAS kt",yl:"C_L",curves:[{f:v=>st.m*1000*G0/(0.5*1.225*(v/KT)**2*124.6),c:"hyd"}],hband:[{y0:1.45,y1:2,c:"power",a:0.18}],hl:[{y:1.45,t:"انهيار (نظيف)",c:"power"}],dots:[{x:st.eas,y:st.CL}]}; },
  ro(st){ return [["الضغط الديناميكي q",nf(st.q,0)+" Pa"],["معامل الرفع C_L",nf(st.CL,3)],["زاوية الهجوم تقريباً",nf(st.al,1)+"°"],["السرعة الحقيقية",nf(st.tas,0)+" kt (M "+nf(st.M,2)+")"],["سرعة الانهيار المكافئة",nf(st.vs,0)+" kt"]]; },
  eq:["L = q S C_L ، q = ½ρV² = ½ρ₀ EAS²","C_L = W / (q S)","TAS = EAS / √σ"],
  note:["على الارتفاعات العالية يتدخل الانضغاط (ماخ) فيرتفع حد الانهيار المؤشر قليلاً، وهذا يضيّق المجال بين أبطأ وأسرع سرعة.","الأرقام لطائرة بحجم 737-800 بجناح نظيف."],
  quiz:[{q:"طائرة تطير 250 kt مؤشرة على سطح البحر وعلى 30000 قدم، زاوية الهجوم:",o:["أكبر فوق","نفسها تقريباً","أصغر فوق"],a:1,why:"نفس EAS تعني نفس q ونفس C_L."},
        {q:"على 30000 قدم وبنفس EAS، السرعة الحقيقية:",o:["أقل","نفسها","أكبر بكثير"],a:2,why:"TAS = EAS/√σ، وσ هناك حوالي 0.37."}],
  ref:"الموضوع المقابل: معادلة الرفع والضغط الديناميكي (Dynamic Pressure)."
});
LK("itf",{
  ar:"الكفاءة الدافعة: نفاث ومروحي ومروحة", en:"Propulsive efficiency: turbojet, turbofan and propeller",
  alt:"محرك بمدخل يتغير حجمه مع كمية الهواء وعادم تتغير سرعته، ومنحنى الكفاءة الدافعة مع نسبة سرعة العادم إلى سرعة الطيران",
  intro:["المحرك يولد الدفع بتسريع الهواء: الدفع = كمية الهواء في الثانية × (سرعة العادم − سرعة الطيران). يمكن تحقيق نفس الدفع بكمية قليلة تُسرّع كثيراً، أو بكمية كبيرة تُسرّع قليلاً.",
         "الطريقة الثانية أكفأ: الطاقة الضائعة في العادم أقل. لهذا كبرت مراوح المحركات الحديثة (نسبة التجاوز العالية)، والمراوح العادية أكفأ عند السرعات المنخفضة."],
  ctl:[{k:"V0",ar:"سرعة الطيران",min:50,max:280,step:1,v:230,f:v=>nf(v,0)+" m/s"},{k:"Ve",ar:"سرعة العادم",min:260,max:950,step:5,v:400,f:v=>nf(v,0)+" m/s"},{k:"T",ar:"الدفع المطلوب",min:20,max:300,step:5,v:120,f:v=>nf(v,0)+" kN"}],
  pre:[{ar:"نفاث قديم",set:{Ve:900}},{ar:"مروحي BPR 5",set:{Ve:450}},{ar:"مروحي BPR 11",set:{Ve:330}},{ar:"مروحة عادية",set:{V0:150,Ve:260}}],
  calc(st){ st.ve=Math.max(st.Ve,st.V0+5); st.eta=2/(1+st.ve/st.V0); st.md=st.T*1000/(st.ve-st.V0); st.waste=0.5*st.md*(st.ve-st.V0)**2/1e6; st.use=st.T*st.V0/1000; },
  scene(g,r,st,C){ const cy=r.y+r.h*0.45, Din=clamp(Math.sqrt(st.md)*2.2,r.h*0.12,r.h*0.62), x0=r.x+r.w*0.08, x1=r.x+r.w*0.48;
    g.fillStyle=mixC(C.panel,C.struct,0.35); g.strokeStyle=C.ink; g.lineWidth=1.4; g.beginPath(); g.moveTo(x0,cy-Din/2); g.lineTo(x1,cy-Din*0.42); g.lineTo(x1+r.w*0.06,cy-Din*0.2); g.lineTo(x1+r.w*0.06,cy+Din*0.2); g.lineTo(x1,cy+Din*0.42); g.lineTo(x0,cy+Din/2); g.closePath(); g.fill(); g.stroke();
    g.fillStyle=mixC(C.panel,C.ink,0.6); g.beginPath(); g.ellipse(x0,cy,Din*0.12,Din/2,0,0,Math.PI*2); g.fill();
    const jl=r.w*0.42*st.ve/950, jx=x1+r.w*0.06; for(let i=0;i<14;i++){ const f=((st.t*st.ve/300+i/14)%1); ldot(g,jx+f*jl,cy+(i%3-1)*Din*0.1,2.2,C.power,1-f*0.6); }
    for(let i=0;i<10;i++){ const f=((st.t*st.V0/300+i/10)%1); ldot(g,x0-r.w*0.07+f*r.w*0.07,cy+(i%5-2)*Din*0.18,1.8,C.hyd,0.8); }
    ltx(g,"كمية الهواء "+nf(st.md,0)+" kg/s",(x0+x1)/2,cy+Din/2+16,{s:11,m:false,rtl:true}); ltx(g,"العادم "+nf(st.ve,0)+" m/s",jx+jl/2,cy-Din*0.3-10,{s:11,c:C.power,rtl:true}); },
  plot(st){ return {x:[1,5],y:[0,1],xl:"Ve / V0",yl:"η_p",curves:[{f:x=>2/(1+x),c:"ctrl"}],dots:[{x:st.ve/st.V0,y:st.eta,t:nf(st.eta*100,0)+"%"}]}; },
  ro(st){ return [["الكفاءة الدافعة",nf(st.eta*100,1)+"%"],["كمية الهواء المطلوبة",nf(st.md,0)+" kg/s"],["قدرة مفيدة T·V",nf(st.use,1)+" MW"],["طاقة ضائعة في العادم",nf(st.waste,1)+" MW"]]; },
  eq:["T = ṁ (Ve − V₀)","η_p = 2 / (1 + Ve/V₀)","القدرة الضائعة = ½ ṁ (Ve − V₀)²"],
  note:["الكفاءة الدافعة جزء واحد من الكفاءة الكلية؛ الجزء الآخر هو الكفاءة الحرارية للمحرك نفسه.","المروحة الضخمة تزيد السحب والوزن، ولذلك هناك حد عملي لنسبة التجاوز."],
  quiz:[{q:"لنفس الدفع، المحرك ذو المروحة الكبيرة:",o:["يسرّع هواءً قليلاً كثيراً","يسرّع هواءً كثيراً قليلاً فيكون أكفأ","لا فرق"],a:1,why:"سرعة عادم أقل تعني طاقة ضائعة أقل."},
        {q:"إذا كانت سرعة العادم تساوي ضعف سرعة الطيران، الكفاءة الدافعة:",o:["50%","67%","100%"],a:1,why:"2/(1+2) = 0.67."}],
  show:{ar:"اعرض المروحة الأمامية",fn:()=>lrnSel("eng_fan")},
  ref:"الموضوع المقابل: الدفع والكفاءة الدافعة (Propulsive Efficiency)."
});
LK("itf",{
  ar:"الطيران فوق الصوتي العالي: نظرية نيوتن", en:"Hypersonic flow: Newtonian theory",
  alt:"لوح مائل في تيار فوق صوتي عالٍ تصطدم به جزيئات الهواء من الأسفل، وظل خالٍ من الضغط فوقه، ومنحنيات معاملي الرفع والسحب مع زاوية الهجوم",
  intro:["عند السرعات فوق الصوتية العالية جداً تلتصق الموجة الصدمية بالجسم تقريباً، فيتصرف الهواء كجزيئات تصطدم بالسطح وتفقد سرعتها العمودية. هذه فكرة نيوتن القديمة، وهي تعمل جيداً هنا رغم أنها فشلت في السرعات المنخفضة.",
         "معامل الضغط على السطح المواجه = Cp,max × sin²θ، والسطح الخلفي في «ظل» بلا ضغط تقريباً. لهذا تكون نسبة الرفع إلى السحب صغيرة، وتعود المركبات الفضائية بزاوية هجوم كبيرة لتزيد السحب وتبطئ."],
  ctl:[{k:"al",ar:"زاوية الهجوم",min:0,max:60,step:0.5,v:40,f:v=>nf(v,1)+"°"},{k:"M",ar:"رقم ماخ",min:3,max:25,step:0.5,v:10,f:v=>nf(v,1)}],
  calc(st){ const g=1.4, M2=st.M*st.M, a=Math.pow((g+1)**2*M2/(4*g*M2-2*(g-1)),g/(g-1))*(1-g+2*g*M2)/(g+1); st.cpm=2/(g*M2)*(a-1);
    const s=Math.sin(st.al*D2R), c=Math.cos(st.al*D2R), CN=st.cpm*s*s; st.CL=CN*c; st.CD=CN*s; st.LD=st.al>0.5?c/s:Infinity; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.5, L=Math.min(r.w,r.h)*0.42, a=Math.max(st.al,0.01)*D2R, ca=Math.cos(a), sa=Math.sin(a), dx=ca*L, dy=sa*L;
    g.fillStyle=mixC(C.panel,C.ink,0.07); g.beginPath(); g.moveTo(cx-dx,cy-dy); g.lineTo(cx+dx,cy+dy); g.lineTo(r.x+r.w,cy+dy); g.lineTo(r.x+r.w,cy-dy); g.closePath(); g.fill();
    ltx(g,"ظل: لا ضغط تقريباً",Math.min(cx+dx,r.x+r.w*0.82),cy-dy-12,{c:C.muted,s:10,rtl:true});
    for(let i=0;i<24;i++){ const y=r.y+r.h*(0.06+0.88*i/23), x=r.x+((st.t*0.45+i*0.137)%1)*r.w;
      if(y>cy-dy&&y<cy+dy){ const u=(y-cy)/sa, xp=cx+u*ca; if(x<xp) ldot(g,x,y,1.7,C.hyd,0.8); else { const u2=u+(x-xp)*0.8; if(u2<L) ldot(g,cx+u2*ca,cy+u2*sa,2,C.power,0.9); } }
      else ldot(g,x,y,1.7,C.hyd,0.8); }
    const l0=L*0.32*st.cpm*sa*sa; for(let i=1;i<6;i++){ const u=-L+2*L*i/6, px=cx+u*ca, py=cy+u*sa, nx=-sa, ny=ca; if(l0>3) larrow(g,px+nx*(l0+4),py+ny*(l0+4),px+nx*3,py+ny*3,C.power,1.6,6); }
    lline(g,[[cx-dx,cy-dy],[cx+dx,cy+dy]],C.ink,4); },
  plot(st){ const f=(k)=>a=>{ const s=Math.sin(a*D2R), c=Math.cos(a*D2R), N=st.cpm*s*s; return k?N*c:N*s; };
    return {x:[0,60],y:[0,1.6],xl:"α (°)",yl:"معامل",curves:[{f:f(1),c:"ctrl"},{f:f(0),c:"power"}],dots:[{x:st.al,y:st.CL,c:"ctrl"},{x:st.al,y:st.CD,c:"power"}],leg:[{c:"ctrl",t:"C_L"},{c:"power",t:"C_D"}]}; },
  ro(st){ return [["Cp الأقصى (خلف الصدمة العمودية)",nf(st.cpm,3)],["C_L",nf(st.CL,3)],["C_D",nf(st.CD,3)],["L/D",isFinite(st.LD)?nf(st.LD,2):"—"]]; },
  eq:["Cp = Cp,max sin²θ","لوح مستوٍ: C_N = Cp,max sin²α ، C_L = C_N cos α ، C_D = C_N sin α","L/D = cot α (بلا احتكاك)"],
  note:["أقصى رفع لوح نيوتني عند α ≈ 54.7°، وهو أعلى بكثير من زاوية انهيار الجناح العادي.","الاحتكاك والتسخين مهملان هنا، وهما مهمّان جداً في العودة الحقيقية إلى الغلاف الجوي."],
  quiz:[{q:"في نظرية نيوتن، السطح الذي لا يواجه التيار:",o:["عليه ضغط كبير","في ظل بلا ضغط تقريباً","عليه رفع"],a:1,why:"الجزيئات لا تصطدم به."},
        {q:"لماذا تعود المركبات الفضائية بزاوية هجوم كبيرة؟",o:["لزيادة السحب وتوزيع الحرارة","لزيادة السرعة","لتقليل الوزن"],a:0,why:"السحب الكبير يبطئها في الهواء الرقيق العالي."}],
  ref:"الموضوع المقابل: التدفق فوق الصوتي العالي (Hypersonic Vehicles, Newtonian Theory)."
});
