/* ---------- Book 14: Maintenance Engineering and Reliability (2/3): redundancy, impact, lightning, fluids, trends ---------- */
const mnC=(n,k)=>{ let r=1; for(let i=1;i<=k;i++) r=r*(n-k+i)/i; return r; };
/* ---- 10 ---- */
LK("mnt",{
  ar:"الازدواجية: كم نظاماً نحتاج؟", en:"Redundancy: k-out-of-n reliability",
  alt:"مجموعة من الأنظمة المتوازية يلزم عمل k منها، مع موثوقية كل نظام، ومنحنى موثوقية المجموعة مع موثوقية المكوّن",
  intro:["الأنظمة الحرجة في الطائرة مزدوجة أو ثلاثية: ثلاثة أنظمة هيدروليكية، وعدة مولّدات كهربائية. إذا كانت موثوقية كل نظام p وكان يلزم عمل k على الأقل من n، فموثوقية المجموعة R = Σ_{i=k}^{n} C(n,i) pⁱ (1−p)^{n−i}.",
         "عندما يلزم نظام واحد من اثنين (k = 1، n = 2) تصبح R = 1 − (1−p)²، وتتحسن الموثوقية بنسبة كبيرة. أما إن لزم عمل الكل (k = n) فتنخفض الموثوقية إلى pⁿ. التقدير يفترض استقلال الأعطال، فلو شاركت الأنظمة سبباً واحداً (تلوث وقود مشترك مثلاً) لا ينطبق الحساب."],
  ctl:[{k:"p",ar:"موثوقية النظام الواحد",min:0.9,max:0.999,step:0.001,v:0.98,f:v=>nf(v*100,1)+" %"},{k:"n",ar:"عدد الأنظمة n",min:1,max:5,step:1,v:3,f:v=>nf(v,0)},{k:"kk",ar:"المطلوب عمله k",min:1,max:5,step:1,v:2,f:v=>nf(v,0)}],
  pre:[{ar:"1 من 2",set:{n:2,kk:1}},{ar:"2 من 3",set:{n:3,kk:2}},{ar:"الكل مطلوب",set:{n:3,kk:3}}],
  calc(st){ st.k2=Math.min(st.kk,st.n); st.rs=(p,n,k)=>{ let s=0; for(let i=k;i<=n;i++) s+=mnC(n,i)*Math.pow(p,i)*Math.pow(1-p,n-i); return s; }; st.R=st.rs(st.p,st.n,st.k2); st.F=1-st.R; st.imp=(1-st.p)/Math.max(st.F,1e-15); },
  scene(g,r,st,C){ const y=r.y+r.h*0.42, n=st.n, bw=Math.min(70,r.w*0.7/n-12), x0=r.x+r.w*0.5-(n*(bw+12))/2+6, ph=Math.floor((st.t*1.2)%8); const rng=i=>Math.abs(Math.sin((ph+1)*12.9898+i*78.233)*43758.5453)%1; let ok=0; for(let i=0;i<n;i++){ const up=rng(i)<st.p||ph%3!==0; if(up) ok++; const x=x0+i*(bw+12); g.fillStyle=up?mixC(C.panel,C.hyd,0.55):mixC(C.panel,C.power,0.6); g.fillRect(x,y,bw,bw*0.7); g.strokeStyle=C.ink; g.lineWidth=1.4; g.strokeRect(x,y,bw,bw*0.7); ltx(g,up?"يعمل":"عطل",x+bw/2,y+bw*0.35,{s:12,w:700,rtl:true}); ltx(g,nf(st.p*100,1)+"%",x+bw/2,y-12,{s:10,m:true,c:C.muted}); }
    ltx(g,"المطلوب عمل "+st.k2+" من "+n,r.x+r.w*0.5,r.y+r.h*0.14,{s:15,w:700,rtl:true}); ltx(g,"موثوقية المجموعة "+nf(st.R*100,3)+" %",r.x+r.w*0.5,r.y+r.h*0.76,{s:14,w:700,rtl:true,c:C.hyd}); ltx(g,"احتمال الفشل "+sci(st.F,2)+"  ·  تحسّن "+nf(st.imp,0)+" ×",r.x+r.w*0.5,r.y+r.h*0.88,{s:12,rtl:true,c:C.muted}); },
  plot(st){ return {x:[0.9,0.999],y:[0.7,1.0005],xl:"موثوقية المكوّن",yl:"موثوقية المجموعة",curves:[{f:p=>p,c:"muted",dash:[4,3]},{f:p=>st.rs(p,st.n,st.k2),c:"hyd"},{f:p=>Math.pow(p,st.n),c:"power",dash:[2,3]}],leg:[{c:"muted",t:"نظام واحد",dash:[4,3]},{c:"hyd",t:"الحالي"},{c:"power",t:"الكل مطلوب",dash:[2,3]}],dots:[{x:st.p,y:st.R,c:"hyd"}]}; },
  ro(st){ return [["موثوقية المجموعة",nf(st.R*100,4)+" %"],["احتمال الفشل",sci(st.F,2)],["مقارنة بنظام واحد",nf(st.imp,0)+" ×"],["احتمال الفشل لنظام واحد",sci(1-st.p,2)]]; },
  eq:["R = Σ_{i=k}^{n} C(n,i) pⁱ (1−p)^{n−i}","1 من 2: R = 1 − (1 − p)²","الكل: R = pⁿ"],
  note:["نفترض أعطالاً مستقلة. الأعطال ذات السبب المشترك تحتاج تصميماً يعزل الأنظمة عن بعضها (فصل مسارات الأنابيب والأسلاك).","الموثوقية تُقاس هنا لكل رحلة؛ مقاييس السلامة الحقيقية أعمق وأدق."],
  quiz:[{q:"أي ترتيب أعلى موثوقية؟",o:["1 من 3","3 من 3","2 من 2"],a:0,why:"يكفي نظام واحد من ثلاثة."},
        {q:"عند p = 0.99، 1 من 2 يعطي احتمال فشل:",o:["10⁻⁴","10⁻²","10⁻⁶"],a:0,why:"(1−p)² = 10⁻⁴."}],
  ref:"الموضوع: الموثوقية والتكرار (Redundancy and Reliability)."
});
/* ---- 11 ---- */
LK("mnt",{
  ar:"الاستبدال الوقائي: الفترة الأمثل", en:"Optimum preventive replacement interval",
  alt:"أعمدة تكلفة الاستبدال الوقائي وتكلفة العطل لفترة محددة، ومنحنى معدل التكلفة مع الفترة وتعليم الحد الأدنى",
  intro:["لجزء يبلى مع العمر (β > 1) نختار استبداله عند فترة T قبل فشله. إن اخترنا T قصيرة جداً صرفنا كثيراً على استبدالات لا حاجة لها، وإن اخترنا T كبيرة فتزيد احتمالية الفشل غير المخطط (وكلفته أعلى بكثير من الاستبدال المخطط).",
         "معدل التكلفة لكل ساعة g(T) = [ C_p R(T) + C_u (1 − R(T)) ] / ∫₀ᵀ R(t) dt. أدنى قيمة له عند فترة مثلى T*. وإن كان معدل الفشل ثابتاً (β = 1) فلا فائدة من الاستبدال الوقائي ويكفي التشغيل حتى الفشل. تُحسب الفترة المثلى لكل جزء بحسب بيانات η وβ ونسبة التكلفة."],
  ctl:[{k:"eta",ar:"العمر المميز η",min:2000,max:40000,step:500,v:12000,f:v=>nf(v,0)+" h"},{k:"be",ar:"معامل الشكل β",min:1.2,max:5,step:0.1,v:3,f:v=>nf(v,1)},{k:"cu",ar:"تكلفة العطل ÷ تكلفة الاستبدال",min:2,max:50,step:1,v:8,f:v=>nf(v,0)+" ×"},{k:"T",ar:"فترة الاستبدال",min:500,max:80000,step:500,v:8000,f:v=>nf(v,0)+" h"}],
  pre:[{ar:"عطل مكلف جداً",set:{cu:30}},{ar:"عطل رخيص",set:{cu:3}},{ar:"معدل ثابت",set:{be:1.2}}],
  calc(st){ const R=t=>Math.exp(-Math.pow(t/st.eta,st.be)); st.Rf=R; st.gf=T=>{ const N=300, h=T/N; let I=0; for(let i=0;i<N;i++) I+=R((i+0.5)*h)*h; return (R(T)+st.cu*(1-R(T)))/I*1000; }; let bT=st.eta*0.05,bg=1e9; for(let T=st.eta*0.05;T<=st.eta*3;T+=st.eta*0.01){ const v=st.gf(T); if(v<bg){ bg=v; bT=T; } } st.Ts=bT; st.gs=bg; st.g=st.gf(st.T); st.mttf=st.eta*mnGam(1+1/st.be); st.gr=st.cu/st.mttf*1000; st.sv=(1-st.gs/st.gr)*100; st.Rt=R(st.T); },
  scene(g,r,st,C){ const x0=r.x+r.w*0.12, x1=r.x+r.w*0.88, y=r.y+r.h*0.78, H=r.h*0.5, mx=Math.max(st.g,st.gr,st.gs)*1.1, B=[[st.g,"عند الفترة الحالية","hyd"],[st.gs,"عند الفترة المثلى","ctrl"],[st.gr,"حتى الفشل","power"]]; B.forEach(([v,t,c],i)=>{ const bw=(x1-x0)/3-18, x=x0+i*(x1-x0)/3+9, h=H*v/mx; g.fillStyle=mixC(C.panel,KC(c,C),0.65); g.fillRect(x,y-h,bw,h); g.strokeStyle=C.ink; g.strokeRect(x,y-h,bw,h); ltx(g,nf(v,2),x+bw/2,y-h-10,{s:12,w:700,m:true}); ltx(g,t,x+bw/2,y+16,{s:11,rtl:true}); });
    ltx(g,"الفترة المثلى T* = "+nf(st.Ts,0)+" h  ·  وفر "+nf(st.sv,0)+" % عن التشغيل حتى الفشل",r.x+r.w*0.5,r.y+r.h*0.1,{s:13,w:700,rtl:true}); ltx(g,"احتمال بقاء الجزء حتى T الحالية "+nf(st.Rt*100,0)+" %",r.x+r.w*0.5,r.y+r.h*0.93,{s:12,rtl:true,c:C.muted}); },
  plot(st){ return {x:[st.eta*0.05,st.eta*3],y:[0,Math.min(st.gr*2.2,st.gf(st.eta*0.05)*1.05)],xl:"فترة الاستبدال h",yl:"التكلفة / 1000 h",curves:[{f:st.gf,c:"hyd",n:200}],hl:[{y:st.gr,c:"power",t:"حتى الفشل"}],dots:[{x:st.Ts,y:st.gs,c:"ctrl"},{x:st.T,y:st.g,c:"power"}]}; },
  ro(st){ return [["الفترة المثلى T*",nf(st.Ts,0)+" h"],["معدل التكلفة عند T*",nf(st.gs,2)],["معدل التكلفة الحالي",nf(st.g,2)],["معدل التشغيل حتى الفشل",nf(st.gr,2)],["الوفر المحتمل",nf(st.sv,0)+" %"]]; },
  eq:["g(T) = [ C_p R(T) + C_u (1 − R(T)) ] / ∫₀ᵀ R(t) dt","T* = argmin g(T)","للتشغيل حتى الفشل: g = C_u / MTTF"],
  note:["الوحدات نسبية (تكلفة الاستبدال = 1). الوفر الحقيقي يعتمد على بيانات التكاليف الدقيقة وعلى ما إذا كان العطل يؤثر على السلامة، فتُعدّ بعض الأجزاء بحدود إلزامية مستقلة عن التكلفة.","نتائج الفترة المثلى تتغير بتغير β، ويُعاد تقديرها عند توفر بيانات تشغيل أحدث."],
  quiz:[{q:"زيادة تكلفة العطل نسبة إلى الاستبدال تجعل الفترة المثلى:",o:["أقصر","أطول","نفسها"],a:0,why:"نستبدل أبكر لتجنب العطل."},
        {q:"لجزء β = 1 الاستبدال الوقائي:",o:["لا يخفض التكلفة","دائماً يخفضها","يضاعفها"],a:0,why:"معدل الفشل ثابت."}],
  ref:"الموضوع: سياسات الاستبدال المثلى (Age Replacement Policy)."
});
/* ---- 12 ---- */
LK("mnt",{
  ar:"ضربة الطيور: الطاقة والقوة على الزجاج", en:"Bird strike energy and impact force",
  alt:"طائر يصطدم بزجاج أمامي ويضغطه، ومنحنى طاقة الاصطدام مع السرعة لكتل مختلفة للطيور",
  intro:["الطاقة الحركية لطائر كتلته m يصطدم بالطائرة بسرعة نسبية v: E = ½ m v². تتغير بقوة مع السرعة (مربعها). وبسبب المدة القصيرة للتصادم Δt يبلغ متوسط القوة F ≈ m v / Δt، والضغط على الزجاج p = F / A حيث A مساحة التلامس.",
         "تنص متطلبات الاعتماد على أن يتحمل الزجاج الأمامي طائراً كتلته نحو 1.8 كغم (4 رطل) بسرعة الإبحار دون اختراق، وتُختبر المحركات بطيور أخرى. الطيور غالباً ما تُصاب قرب الأرض حيث السرعة أقل وعددها أكبر، فتُراقب أنظمة المطار حركة الطيور."],
  ctl:[{k:"mb",ar:"كتلة الطائر",min:0.1,max:4,step:0.1,v:1.8,f:v=>nf(v,1)+" kg"},{k:"V",ar:"السرعة النسبية",min:100,max:400,step:5,v:250,f:v=>nf(v,0)+" kt"},{k:"dt",ar:"مدة التصادم",min:1,max:12,step:0.5,v:4,f:v=>nf(v,1)+" ms"},{k:"A",ar:"مساحة التلامس",min:50,max:300,step:10,v:120,f:v=>nf(v,0)+" cm²"}],
  pre:[{ar:"طائر صغير",set:{mb:0.4}},{ar:"طائر 1.8 kg",set:{mb:1.8}},{ar:"طائر كبير سريع",set:{mb:3.6,V:300}}],
  calc(st){ const v=st.V/KT; st.E=0.5*st.mb*v*v; st.J=st.mb*v; st.F=st.J/(st.dt*1e-3); st.p=st.F/(st.A*1e-4)/1e6; st.ef=(m,V)=>0.5*m*Math.pow(V/KT,2)/1000; st.Ek=st.E/1000; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.12, y=r.y+r.h*0.46, gx=r.x+r.w*0.62, ph=(st.t*0.5)%1, hit=ph>0.55, d=hit?Math.sin((ph-0.55)/0.45*Math.PI)*16:0; g.fillStyle=mixC(C.panel,C.hyd,0.25); g.strokeStyle=C.hyd; g.lineWidth=2; g.beginPath(); g.moveTo(gx,y-r.h*0.25); g.quadraticCurveTo(gx+d*2.2,y,gx,y+r.h*0.25); g.lineTo(gx+10,y+r.h*0.25); g.quadraticCurveTo(gx+10+d*2.2,y,gx+10,y-r.h*0.25); g.closePath(); g.fill(); g.stroke();
    const bx=hit?gx-14+d*0.6:x0+(gx-x0-30)*(ph/0.55), s=6+st.mb*4; g.fillStyle=mixC(C.panel,C.ink,0.5); g.beginPath(); g.ellipse(bx,y,s*1.6,s,0,0,Math.PI*2); g.fill(); g.stroke(); g.strokeStyle=C.ink; g.lineWidth=1.2; g.beginPath(); g.moveTo(bx-4,y); g.lineTo(bx-s*2.6,y-s*1.2); g.lineTo(bx-s*1.4,y); g.lineTo(bx-s*2.6,y+s*1.2); g.closePath(); g.stroke(); larrow(g,x0-6,y,x0+34,y,C.power,2.4,8);
    ltx(g,"E = "+nf(st.Ek,1)+" kJ",r.x+r.w*0.5,r.y+r.h*0.1,{s:16,w:700,m:true}); ltx(g,"قوة متوسطة "+nf(st.F/1000,0)+" kN  ·  ضغط "+nf(st.p,1)+" MPa",r.x+r.w*0.5,r.y+r.h*0.84,{s:13,w:600,rtl:true}); ltx(g,"دفع "+nf(st.J,0)+" N·s",r.x+r.w*0.5,r.y+r.h*0.93,{s:11,rtl:true,c:C.muted}); },
  plot(st){ return {x:[100,400],y:[0,st.ef(3.6,400)*1.05],xl:"السرعة kt",yl:"الطاقة kJ",curves:[{f:v=>st.ef(0.45,v),c:"hyd"},{f:v=>st.ef(1.8,v),c:"ctrl"},{f:v=>st.ef(3.6,v),c:"power"}],leg:[{c:"hyd",t:"0.45 kg"},{c:"ctrl",t:"1.8 kg"},{c:"power",t:"3.6 kg"}],dots:[{x:st.V,y:st.Ek,c:"ink"}]}; },
  ro(st){ return [["الطاقة الحركية",nf(st.Ek,1)+" kJ"],["الدفع m·v",nf(st.J,0)+" N·s"],["القوة المتوسطة",nf(st.F/1000,0)+" kN"],["الضغط المتوسط",nf(st.p,1)+" MPa"]]; },
  eq:["E = ½ m v²","F ≈ m v / Δt","p = F / A"],
  note:["القوة الفعلية تبلغ ذروة أعلى من المتوسط ثم تتراوح خلال التصادم. الاختبارات تقيس ذلك مباشرة وتُحدد قبول التصميم.","يُراعى أن تتحمل أي طائرة الاصطدام بالطائر على أجزاء مختلفة: زجاج، حافة الجناح، ذيل، ومحرك."],
  quiz:[{q:"مضاعفة السرعة النسبية تضاعف الطاقة:",o:["أربع مرات","مرتين","لا تغير"],a:0,why:"E ∝ v²."},
        {q:"لماذا يزداد الخطر قرب الأرض؟",o:["كثرة الطيور رغم انخفاض السرعة","لأن الطائرة أثقل","لأن الزجاج أرق"],a:0,why:"تواجد الطيور في الارتفاعات المنخفضة."}],
  show:{ar:"اعرض الزجاج الأمامي",fn:()=>lrnSel("window_cockpit")},
  ref:"الموضوع: اصطدام الطيور (Bird Strike Certification)."
});
/* ---- 13 ---- */
const mnLM=[["ألمنيوم",2.8e-8,2700,900],["ألياف كربون (بلا حماية)",1.0e-5,1600,1000],["ألياف كربون مع شبكة نحاسية",1.7e-8,8960,385]];
LK("mnt",{
  ar:"الصاعقة: تسخين الجلد بالتيار", en:"Lightning strike: skin heating",
  alt:"صاعقة تضرب سطح الطائرة وتسري عبر شريط من الجلد الملون حسب الحرارة، ومنحنى ارتفاع الحرارة مع سماكة الجلد لثلاث مواد",
  intro:["الصاعقة تمر عبر جلد الطائرة وتخرج من نقطة أخرى. تسخّن مقاومة الجلد المسار حسب مكامل الفعل ∫I²dt (بوحدة A²·s): ΔT = (AI · ρ_el) / (A_cs² · ρ_m · c) حيث A_cs مساحة مقطع المسار وρ_el المقاومية الكهربائية وρ_m c السعة الحرارية الحجمية.",
         "الألمنيوم موصل جيد فتبقى ΔT صغيرة. أما الألياف الكربونية فمقاوميتها أكبر بأكثر من 100 مرة، فترتفع حرارتها إلى مئات الدرجات وتحترق المادة المتماسكة، لذلك تُدمج شبكة نحاسية أو رقائق معدنية في سطح الأجزاء المركبة. وتؤثر السماكة أيضاً بمربعها."],
  ctl:[{k:"mi",ar:"مادة الجلد",min:0,max:2,step:1,v:1,f:v=>mnLM[Math.round(v)][0]},{k:"tk",ar:"سماكة الموصل",min:0.05,max:5,step:0.05,v:1.5,f:v=>nf(v,2)+" mm"},{k:"w",ar:"عرض مسار التيار",min:10,max:200,step:5,v:50,f:v=>nf(v,0)+" mm"},{k:"AI",ar:"مكامل الفعل",min:0.25,max:2,step:0.05,v:0.5,f:v=>nf(v,2)+" MA²·s"}],
  pre:[{ar:"ألمنيوم",set:{mi:0}},{ar:"كربون بلا حماية",set:{mi:1}},{ar:"كربون مع نحاس",set:{mi:2,tk:0.1}}],
  calc(st){ st.dTf=(mi,tk)=>{ const m=mnLM[mi], A=st.w*1e-3*tk*1e-3; return st.AI*1e6*m[1]/(A*A*m[2]*m[3]); }; st.m=mnLM[Math.round(st.mi)]; st.dT=st.dTf(Math.round(st.mi),st.tk); st.cl=st.dT<150?"آمن":st.dT<600?"تلف محتمل":"ذوبان أو احتراق"; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.1, x1=r.x+r.w*0.9, y=r.y+r.h*0.55, h=Math.max(10,st.tk*8), f=clamp(Math.log10(Math.max(st.dT,1))/3.3,0,1); g.fillStyle=mixC(C.panel,C.power,0.12+0.78*f); g.fillRect(x0,y,x1-x0,h); g.strokeStyle=C.ink; g.lineWidth=1.4; g.strokeRect(x0,y,x1-x0,h);
    const bx=x0+(x1-x0)*0.5; const pts=[[bx+30,r.y+r.h*0.06],[bx-8,r.y+r.h*0.2],[bx+10,r.y+r.h*0.3],[bx-14,r.y+r.h*0.42],[bx,y]]; const fl=Math.sin(st.t*14)>0; lline(g,pts,fl?"#f2c200":"#fff3b0",3.4); lline(g,[[x0-6,y+h/2],[x0+10,y+h/2]],C.ink,2); larrow(g,bx,y+h/2,x1-6,y+h/2,"#f2c200",2.4,9); larrow(g,bx,y+h/2,x0+10,y+h/2,"#f2c200",2.4,9);
    ltx(g,st.m[0]+": ΔT = "+nf(st.dT,0)+" K",r.x+r.w*0.5,r.y+r.h*0.1,{s:14,w:700,rtl:true,c:st.dT>=150?C.power:C.ink}); ltx(g,st.cl,r.x+r.w*0.5,r.y+r.h*0.9,{s:14,w:700,rtl:true,c:st.dT>=150?C.power:C.hyd}); },
  plot(st){ return {x:[0.05,5],y:[1,1e6],log:true,xl:"سماكة الموصل mm",yl:"ΔT K",curves:[{f:t=>st.dTf(0,t),c:"hyd"},{f:t=>st.dTf(1,t),c:"power"},{f:t=>st.dTf(2,t),c:"ctrl"}],leg:[{c:"hyd",t:"ألمنيوم"},{c:"power",t:"كربون"},{c:"ctrl",t:"كربون + نحاس"}],hl:[{y:600,c:"muted",t:"600 K"}],dots:[{x:st.tk,y:Math.max(1.01,st.dT),c:"ink"}]}; },
  ro(st){ return [["المادة",st.m[0]],["المقاومية",sci(st.m[1],1)+" Ω·m"],["ΔT",nf(st.dT,0)+" K"],["الحالة",st.cl]]; },
  eq:["ΔT = AI · ρ_el / ( A_cs² · ρ_m · c )","AI = ∫ I² dt","A_cs = w · t"],
  note:["نموذج أدياباتي: يتجاهل التبريد ويفترض تياراً منتظماً عبر المقطع، وهو أسوأ حالة. القيم تقريبية لتوضيح الاتجاه.","الحماية من الصواعق تشمل تأريضاً وأغطية وموزعات (diverters) وفحصاً بعد كل ضربة."],
  quiz:[{q:"لماذا يحتاج الكربون إلى شبكة معدنية؟",o:["لأن مقاوميته عالية فيحترق بالتيار","لأنه أثقل","لأنه أرخص"],a:0,why:"ΔT ∝ ρ_el."},
        {q:"مضاعفة سماكة الموصل تخفض ΔT إلى:",o:["ربع القيمة","نصفها","لا تتغير"],a:0,why:"ΔT ∝ 1/A_cs²."}],
  ref:"الموضوع: الحماية من الصواعق (Lightning Protection)."
});
/* ---- 14 ---- */
LK("mnt",{
  ar:"الكهرباء الساكنة في الوقود: زمن الاسترخاء", en:"Static charge relaxation in fuel",
  alt:"وقود يتدفق في خرطوم ويكتسب شحنة تتناقص مع الزمن، ومنحنى الشحنة المتبقية مع توصيلية الوقود",
  intro:["تنتج حركة الوقود في الأنابيب والمرشحات شحنة كهربائية ساكنة. تتبدد الشحنة بتوصيلية الوقود بحسب ثابت زمني τ = ε₀ ε_r / σ، حيث ε₀ = 8.85×10⁻¹² F/m وε_r السماحية النسبية (نحو 2) وσ التوصيلية. الشحنة المتبقية تتناقص أسّياً: q(t) = q₀ e^(−t/τ).",
         "وقود الطائرات النقي موصليته منخفضة جداً (أقل من 1 pS/m) فيصل τ إلى عشرات الثواني، فتتراكم شحنة قد تتسبب بشرارة داخل الخزان. تُضاف مادة مبدّدة للكهرباء الساكنة ترفع التوصيلية (50–600 pS/m) فيصبح τ جزءاً من الثانية. وتقتضي إجراءات التزود الربط الكهربائي بين الطائرة والمعدات لتجنب فرق الجهد."],
  ctl:[{k:"sg",ar:"توصيلية الوقود",min:0.5,max:300,step:0.5,v:3,f:v=>nf(v,1)+" pS/m"},{k:"er",ar:"السماحية النسبية",min:1.9,max:2.3,step:0.05,v:2.1,f:v=>nf(v,2)},{k:"tr",ar:"زمن بقاء الوقود قبل الخزان",min:1,max:60,step:1,v:10,f:v=>nf(v,0)+" s"}],
  pre:[{ar:"وقود بلا مبدّد",set:{sg:0.8}},{ar:"مع مبدّد",set:{sg:100}}],
  calc(st){ st.tau=8.854e-12*st.er/(st.sg*1e-12); st.q=t=>Math.exp(-t/st.tau)*100; st.qr=st.q(st.tr); st.t95=3*st.tau; st.qf=s=>Math.exp(-st.tr/(8.854e-12*st.er/(s*1e-12)))*100; st.risk=st.qr>30?"شحنة عالية: خطر":st.qr>5?"متوسطة":"منخفضة"; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.08, x1=r.x+r.w*0.92, y=r.y+r.h*0.46, h=r.h*0.14; g.fillStyle=mixC(C.panel,C.fuel,0.4); g.fillRect(x0,y,(x1-x0)*0.7,h); g.strokeStyle=C.ink; g.lineWidth=1.4; g.strokeRect(x0,y,(x1-x0)*0.7,h); g.fillStyle=mixC(C.panel,C.struct,0.5); g.fillRect(x0+(x1-x0)*0.7,y-r.h*0.12,(x1-x0)*0.3,h+r.h*0.24); g.strokeRect(x0+(x1-x0)*0.7,y-r.h*0.12,(x1-x0)*0.3,h+r.h*0.24); ltx(g,"خزان",x0+(x1-x0)*0.85,y-r.h*0.16,{s:11,rtl:true});
    const n=24; for(let i=0;i<n;i++){ const f=(st.t*0.3+i/n)%1, x=x0+(x1-x0)*0.7*f, q=Math.exp(-(f*st.tr)/st.tau); const sg=(i%2?1:-1); ldot(g,x,y+h*(0.2+0.6*((i*37)%10)/10),2.6,sg>0?C.power:C.hyd,0.2+0.8*q); }
    if(st.qr>30&&Math.sin(st.t*10)>0.7){ lline(g,[[x0+(x1-x0)*0.72,y],[x0+(x1-x0)*0.78,y+h*0.7],[x0+(x1-x0)*0.75,y+h*0.9]],"#f2c200",2.4); }
    ltx(g,"τ = "+(st.tau<1?nf(st.tau*1000,0)+" ms":nf(st.tau,1)+" s"),r.x+r.w*0.5,r.y+r.h*0.1,{s:16,w:700,m:true}); ltx(g,"الشحنة عند الوصول إلى الخزان "+nf(st.qr,1)+" %  ·  "+st.risk,r.x+r.w*0.5,r.y+r.h*0.86,{s:13,w:700,rtl:true,c:st.qr>30?C.power:C.ink}); },
  plot(st){ return {x:[0.5,100],y:[0,100],xl:"التوصيلية pS/m",yl:"الشحنة المتبقية %",curves:[{f:st.qf,c:"hyd",n:300}],hl:[{y:5,c:"muted",t:"5 %"}],dots:[{x:st.sg,y:st.qr,c:"power"}]}; },
  ro(st){ return [["الثابت الزمني τ",(st.tau<1?nf(st.tau*1000,0)+" ms":nf(st.tau,1)+" s")],["الشحنة بعد "+nf(st.tr,0)+" s",nf(st.qr,1)+" %"],["زمن التبدد إلى 5%",(st.t95<1?nf(st.t95*1000,0)+" ms":nf(st.t95,1)+" s")],["الخطر",st.risk]]; },
  eq:["τ = ε₀ ε_r / σ","q(t) = q₀ e^(−t/τ)","زمن 5% ≈ 3 τ"],
  note:["النموذج يفترض شحنة متجانسة تتبدد بتوصيلية الوقود فقط، دون أثر التيارات الدوامية في الخزان.","معايير التزويد تشمل الربط والتأريض ونسب التدفق وحدوداً لإضافة المبدّد؛ هذا الدرس لتوضيح الفيزياء."],
  quiz:[{q:"زيادة توصيلية الوقود تجعل τ:",o:["أقصر","أطول","كما هي"],a:0,why:"τ ∝ 1/σ."},
        {q:"لماذا يلزم ربط الطائرة بمعدات التزويد؟",o:["لمساواة الجهد وتجنب الشرر","لزيادة التدفق","لتسخين الوقود"],a:0,why:"فرق الجهد قد يولّد شرارة."}],
  show:{ar:"اعرض لوحة التزود",fn:()=>lrnSel("refuel_panel")},
  ref:"الموضوع: الكهرباء الساكنة وسلامة التزود بالوقود (Static Electricity in Fuel)."
});
/* ---- 15 ---- */
LK("mnt",{
  ar:"ضغط الإطار والحرارة: قانون الغاز", en:"Tyre pressure and temperature",
  alt:"إطار ساخن بعد الهبوط وحرارته على الألوان، ومنحنى الضغط مع درجة حرارة الإطار",
  intro:["الإطار غاز محصور بحجم ثابت تقريباً، فيتبع ضغطه المطلق درجة حرارته المطلقة: p₂/p₁ = T₂/T₁ (درجات كلفن وضغط مطلق = ضغط المقياس + 1.013 bar). لذلك يرتفع ضغط الإطار الساخن بعد الهبوط أو الإقلاع، ويهبط في الطقس البارد.",
         "عند فحص الضغط يجب أن يكون الإطار بارداً (بالحرارة المحيطة). وفي الجو الحار أو البارد يُضبط الضغط المقاس حسب جدول التصحيح لحرارة المكان: p_ضبط = p_أسمي_مطلق × T_محيط / T_مرجع − 1.013. إهمال الحرارة يجعل الضغط ناقصاً في الشتاء، فيزداد انحناء الإطار ويسخن."],
  ctl:[{k:"ps",ar:"الضغط المضبوط (مقياس)",min:8,max:20,step:0.1,v:15,f:v=>nf(v,1)+" bar"},{k:"Ts",ar:"حرارة الضبط",min:-20,max:50,step:1,v:20,f:v=>nf(v,0)+" °C"},{k:"Tn",ar:"حرارة الإطار الآن",min:-30,max:150,step:1,v:90,f:v=>nf(v,0)+" °C"}],
  pre:[{ar:"بعد هبوط قوي",set:{Tn:110}},{ar:"مطار شتوي",set:{Ts:-15,Tn:-15}}],
  calc(st){ const pa=1.01325; st.pf=(T)=>(st.ps+pa)*(T+273.15)/(st.Ts+273.15)-pa; st.pn=st.pf(st.Tn); st.dp=st.pn-st.ps; st.rise=st.pf(st.Ts+10)-st.ps; st.pset=(Ta)=>(st.ps+pa)*(Ta+273.15)/(293.15)-pa; st.p20=st.pset(st.Ts); },
  scene(g,r,st,C){ const cx=r.x+r.w*0.34, cy=r.y+r.h*0.48, R=Math.min(r.w*0.2,r.h*0.34), f=clamp((st.Tn+30)/180,0,1); g.fillStyle=mixC(C.panel,C.power,0.12+0.7*f); g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.fill(); g.strokeStyle=C.ink; g.lineWidth=2; g.stroke(); g.fillStyle=mixC(C.panel,C.struct,0.7); g.beginPath(); g.arc(cx,cy,R*0.55,0,Math.PI*2); g.fill(); g.stroke(); for(let i=0;i<10;i++){ const a=i*Math.PI/5+st.t*(st.Tn>60?0.6:0.2); lline(g,[[cx+Math.cos(a)*R*0.56,cy+Math.sin(a)*R*0.56],[cx+Math.cos(a)*R*0.98,cy+Math.sin(a)*R*0.98]],C.muted,1); }
    ltx(g,nf(st.Tn,0)+" °C",cx,cy,{s:15,w:700,m:true}); kGauge(g,r.x+r.w*0.72,cy,Math.min(r.w*0.14,r.h*0.24),st.pn,0,30,C,{step:5,labels:true,label:"bar",val:nf(st.pn,1)+" bar"}); ltx(g,"ضبط "+nf(st.ps,1)+" bar عند "+nf(st.Ts,0)+" °C",r.x+r.w*0.5,r.y+r.h*0.08,{s:12,rtl:true,c:C.muted}); ltx(g,"الضغط الآن "+nf(st.pn,2)+" bar  ("+(st.dp>=0?"+":"")+nf(st.dp,2)+")",r.x+r.w*0.5,r.y+r.h*0.92,{s:13,w:700,rtl:true}); },
  plot(st){ return {x:[-30,150],y:[0,Math.max(20,st.pf(150))*1.05],xl:"حرارة الإطار °C",yl:"الضغط المقياس bar",curves:[{f:st.pf,c:"hyd"}],hl:[{y:st.ps,c:"muted",t:"المضبوط"}],dots:[{x:st.Tn,y:st.pn,c:"power"}]}; },
  ro(st){ return [["الضغط الآن",nf(st.pn,2)+" bar"],["الفرق عن المضبوط",nf(st.dp,2)+" bar"],["ارتفاع كل 10 °C",nf(st.rise,2)+" bar"],["نسبة الارتفاع",nf(st.dp/st.ps*100,0)+" %"]]; },
  eq:["p₂ / p₁ = T₂ / T₁   (مطلق)","p_مطلق = p_مقياس + 1.013","كل 10 °C ≈ 3.4 % من الضغط المطلق"],
  note:["الحساب لغاز مثالي وحجم ثابت؛ الإطار الحقيقي يتمدد قليلاً مع الضغط والحرارة.","يمنع ضبط ضغط الإطار الساخن (قبل التبريد)؛ يؤخذ ضغط الإطار البارد وفق جدول الطراز."],
  quiz:[{q:"كل 10 °C زيادة في حرارة الإطار ترفع الضغط المطلق نحو:",o:["3.4%","10%","0.1%"],a:0,why:"10/293 ≈ 3.4%."},
        {q:"لماذا نقيس الضغط والإطار بارد؟",o:["لأن الحرارة ترفع القراءة","لأن المقياس لا يعمل","لتوفير الوقت"],a:0,why:"ضغط الإطار الساخن أعلى من الحقيقي البارد."}],
  show:{ar:"اعرض مستشعر ضغط الإطار",fn:()=>lrnSel("tire_pressure_sensor")},
  ref:"الموضوع: صيانة الإطارات (Tyre Servicing)."
});
/* ---- 16 ---- */
LK("mnt",{
  ar:"مرشح الهيدروليك: نسبة بيتا ونظافة السائل", en:"Hydraulic filter beta ratio and fluid cleanliness",
  alt:"سائل يمر بمرشح بنسبة بيتا معينة وتركيز الجسيمات الذي يستقر مع الزمن، ومنحنى تركيز الجسيمات مع نسبة بيتا",
  intro:["الجسيمات الصغيرة تخرّب المضخات والصمامات. تقاس كفاءة المرشح بنسبة بيتا β = عدد الجسيمات قبل المرشح ÷ بعده (لحجم محدد). كفاءته η = 1 − 1/β: فـ β = 2 يعني 50% و β = 100 يعني 99% و β = 1000 يعني 99.9%.",
         "في نظام مغلق تدخل الجسيمات بمعدل ثابت (من الأختام والمشغلات)، ويمر سائل بمعدل Q عبر المرشح، فيستقر التركيز عند C = معدل_الدخول / (Q · η). تُصنَّف نظافة السائل برمز ISO 4406 المبني على عدد الجسيمات في كل مللتر (الرمز 14 يقارب 80–160 جسيماً/mL للأكبر من 4 µm)."],
  ctl:[{k:"lb",ar:"لوغاريتم β",min:0.3,max:3,step:0.05,v:2,f:v=>"β = "+nf(Math.pow(10,v),0)},{k:"Q",ar:"تدفق المرشح",min:5,max:100,step:1,v:40,f:v=>nf(v,0)+" L/min"},{k:"ing",ar:"دخول الجسيمات",min:0.1,max:100,step:0.1,v:4,f:v=>nf(v,1)+" مليون/min"},{k:"V",ar:"حجم النظام",min:20,max:400,step:5,v:120,f:v=>nf(v,0)+" L"}],
  pre:[{ar:"مرشح ضعيف β=2",set:{lb:0.3}},{ar:"مرشح ممتاز β=1000",set:{lb:3}}],
  calc(st){ st.be=Math.pow(10,st.lb); st.eff=1-1/st.be; st.cf=b=>st.ing*1e6/(st.Q*1000*(1-1/b)); st.Css=st.cf(st.be); st.tau=st.V/(st.Q*st.eff); st.iso=Math.max(0,14+Math.floor(Math.log2(Math.max(st.Css,1)/80))); st.Ct=t=>st.Css*(1-Math.exp(-t/st.tau)); st.t95=3*st.tau; },
  scene(g,r,st,C){ const y=r.y+r.h*0.46, x0=r.x+r.w*0.08, x1=r.x+r.w*0.92, mid=(x0+x1)/2; g.fillStyle=mixC(C.panel,C.hyd,0.35); g.fillRect(x0,y-8,mid-x0-20,16); g.fillRect(mid+20,y-8,x1-mid-20,16); kBox(g,mid-20,y-22,40,44,mixC(C.panel,C.struct,0.6),C,"",{}); ltx(g,"مرشح",mid,y-32,{s:11,rtl:true});
    const nIn=Math.min(40,Math.round(st.Css/6)+6), nOut=Math.round(nIn*(1-st.eff)*1.0)+1; for(let i=0;i<nIn;i++){ const f=(st.t*0.3+i/nIn)%1, x=x0+(mid-x0-20)*f, yy=y+(((i*37)%10)/10-0.5)*12; ldot(g,x,yy,2.2,C.ink,0.8); } for(let i=0;i<nOut;i++){ const f=(st.t*0.3+i/nOut)%1, x=mid+20+(x1-mid-20)*f, yy=y+(((i*53)%10)/10-0.5)*12; ldot(g,x,yy,2.2,C.power,0.9); }
    ltx(g,"كفاءة المرشح "+nf(st.eff*100,2)+" %",r.x+r.w*0.5,r.y+r.h*0.1,{s:14,w:700,rtl:true}); ltx(g,"الاستقرار "+nf(st.Css,0)+" جسيم/mL  ·  رمز ISO ≈ "+nf(st.iso,0),r.x+r.w*0.5,r.y+r.h*0.78,{s:13,w:700,rtl:true,c:st.iso>17?C.power:C.ink}); ltx(g,"زمن بلوغ 95% = "+nf(st.t95,0)+" min",r.x+r.w*0.5,r.y+r.h*0.9,{s:12,rtl:true,c:C.muted}); },
  plot(st){ const T=Math.max(10,st.tau*6); return {x:[0,T],y:[0,Math.max(10,st.Css*1.1)],xl:"الزمن min",yl:"جسيم/mL",curves:[{f:st.Ct,c:"hyd"}],hl:[{y:st.Css,c:"muted",t:"الاستقرار"}]}; },
  ro(st){ return [["نسبة بيتا",nf(st.be,0)],["الكفاءة",nf(st.eff*100,2)+" %"],["التركيز المستقر",nf(st.Css,0)+" /mL"],["رمز ISO التقريبي",nf(st.iso,0)],["ثابت الزمن",nf(st.tau,1)+" min"]]; },
  eq:["η = 1 − 1/β","C_ss = معدل_الدخول / (Q · η)","C(t) = C_ss (1 − e^(−t/τ)) ،  τ = V / (Q η)"],
  note:["نموذج صندوق واحد مخلوط يتجاهل توزيع الأحجام وتفريغ المرشح. الحدود المقبولة في دليل الصيانة.","لرمز ISO نستخدم 80 جسيم/mL كحد لرمز 14 والمضاعفة لكل رمز، وهي قاعدة تقريبية للتعليم."],
  quiz:[{q:"β = 100 تعني كفاءة:",o:["99%","90%","100%"],a:0,why:"1 − 1/100."},
        {q:"زيادة تدفق المرشح تخفض التركيز المستقر لأن:",o:["السائل يُنظَّف بمعدل أكبر","المرشح أنظف","الجسيمات أقل"],a:0,why:"C_ss ∝ 1/Q."}],
  show:{ar:"اعرض مرشحات الهيدروليك",fn:()=>lrnSel("hyd_filters")},
  ref:"الموضوع: تلوث السوائل الهيدروليكية (Hydraulic Fluid Contamination)."
});
/* ---- 17 ---- */
LK("mnt",{
  ar:"هامش حرارة العادم EGT: اتجاه التدهور", en:"Engine EGT margin trend and shop-visit forecast",
  alt:"نقاط قياس لهامش EGT مع الدورات مع خط انحدار ونقطة تقاطعه مع حد الاستبدال، ومنحنى تقدير العمر المتبقي",
  intro:["تقيس شركات الطيران كل رحلة هامش حرارة غاز العادم EGT: الفرق بين أقصى حرارة مسموحة وحرارة المحرك الفعلية عند الإقلاع. ينقص هذا الهامش تدريجياً مع تآكل الضاغط والتوربين. تُرسم القيم المصححة مقابل عدد الدورات.",
         "يطبق المهندس انحداراً خطياً على النقاط (مع تباين القياس)، ويقدّر العدد الذي يبلغ عنده الهامش حد الاستبدال، فيخطط لزيارة الورشة قبله. الدقة تعتمد على عدد النقاط وضجيجها: خطأ ميل الانحدار se = σ_res / √Σ(x − x̄)². وقدرة التنبؤ تتحسن مع المزيد من البيانات."],
  ctl:[{k:"m0",ar:"الهامش الابتدائي",min:40,max:120,step:1,v:80,f:v=>nf(v,0)+" °C"},{k:"rt",ar:"معدل التدهور",min:2,max:25,step:0.5,v:9,f:v=>nf(v,1)+" °C/1000 cyc"},{k:"nz",ar:"ضجيج القياس",min:0,max:12,step:0.5,v:4,f:v=>nf(v,1)+" °C"},{k:"lim",ar:"حد الهامش المسموح",min:0,max:40,step:1,v:20,f:v=>nf(v,0)+" °C"},{k:"np",ar:"عدد النقاط",min:6,max:40,step:1,v:20,f:v=>nf(v,0)}],
  pre:[{ar:"ضجيج عالٍ",set:{nz:10,np:10}},{ar:"بيانات كثيرة",set:{nz:6,np:40}}],
  calc(st){ const n=st.np, X=[],Y=[]; const rnd=i=>{ const v=Math.sin(i*12.9898+78.233)*43758.5453; return (v-Math.floor(v))*2-1; }; for(let i=0;i<n;i++){ const x=i*4800/Math.max(1,n-1)/1000*1000; X.push(x); Y.push(st.m0-st.rt*x/1000+st.nz*rnd(i+1)); } const mx=X.reduce((a,b)=>a+b,0)/n, my=Y.reduce((a,b)=>a+b,0)/n; let sxx=0,sxy=0; for(let i=0;i<n;i++){ sxx+=(X[i]-mx)**2; sxy+=(X[i]-mx)*(Y[i]-my); } st.b=sxy/sxx; st.a=my-st.b*mx; let ss=0; for(let i=0;i<n;i++) ss+=(Y[i]-(st.a+st.b*X[i]))**2; st.se=Math.sqrt(ss/Math.max(1,n-2))/Math.sqrt(sxx); st.X=X; st.Y=Y; st.cyc=st.b<0?(st.lim-st.a)/st.b:Infinity; st.cycT=(st.m0-st.lim)/st.rt*1000; st.rngc=st.b<0?Math.abs((st.lim-st.a)/(st.b+2*st.se)-(st.lim-st.a)/(st.b-2*st.se)):Infinity; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.1, x1=r.x+r.w*0.9, y0=r.y+r.h*0.14, H=r.h*0.62, xm=Math.max(6000,isFinite(st.cyc)?st.cyc*1.1:6000), X=c=>x0+(x1-x0)*c/xm, Y=m=>y0+H-(m/Math.max(120,st.m0+5))*H; lline(g,[[x0,y0+H],[x1,y0+H]],C.ink,1.4); lline(g,[[x0,Y(st.lim)],[x1,Y(st.lim)]],C.power,1.6,[6,3]); ltx(g,"حد "+nf(st.lim,0)+" °C",x1,Y(st.lim)-9,{s:11,m:true,a:"right",c:C.power});
    st.X.forEach((c,i)=>ldot(g,X(c),Y(st.Y[i]),3.4,C.hyd)); lline(g,[[X(0),Y(st.a)],[X(xm),Y(st.a+st.b*xm)]],C.ink,1.8); if(isFinite(st.cyc)&&st.cyc>0){ ldot(g,X(st.cyc),Y(st.lim),6,C.power); ltx(g,nf(st.cyc,0)+" دورة",X(st.cyc),Y(st.lim)+18,{s:12,w:700,rtl:true,c:C.power}); }
    ltx(g,"زيارة الورشة المتوقعة بعد "+(isFinite(st.cyc)?nf(st.cyc,0):"—")+" دورة (±"+nf(st.rngc/2,0)+")",r.x+r.w*0.5,r.y+r.h*0.06,{s:13,w:700,rtl:true}); ltx(g,"الميل المقدّر "+nf(st.b*1000,1)+" °C لكل 1000 دورة  ·  الحقيقي "+nf(-st.rt,1),r.x+r.w*0.5,r.y+r.h*0.92,{s:11,rtl:true,c:C.muted}); },
  plot(st){ return {x:[0,Math.max(6000,isFinite(st.cyc)?st.cyc*1.1:6000)],y:[0,Math.max(100,st.m0+10)],xl:"الدورات",yl:"هامش EGT °C",curves:[{f:c=>st.a+st.b*c,c:"ink"}],hl:[{y:st.lim,c:"power",t:"الحد"}],dots:st.X.map((c,i)=>({x:c,y:st.Y[i],c:"hyd",r:3}))}; },
  ro(st){ return [["الميل المقدّر",nf(st.b*1000,2)+" °C/1000"],["خطأ الميل (se)",nf(st.se*1000,2)],["الدورات حتى الحد",isFinite(st.cyc)?nf(st.cyc,0):"—"],["المدى التقريبي ±2se",isFinite(st.rngc)?nf(st.rngc/2,0)+" دورة":"—"],["القيمة الحقيقية",nf(st.cycT,0)+" دورة"]]; },
  eq:["y = a + b x   (انحدار خطي)","se(b) = s_res / √Σ(x − x̄)²","الدورات حتى الحد = (y_lim − a) / b"],
  note:["البيانات مولّدة بضجيج شبه عشوائي ثابت لكل إعداد حتى تتكرر النتيجة. البيانات الحقيقية تُصحَّح بالتأثيرات الجوية والارتفاع ودرجة الحرارة.","التدهور قد لا يكون خطياً بالكامل؛ يستخدم المهندسون أيضاً أنماط الاتجاه الأحدث وتنبيهات التغير المفاجئ."],
  quiz:[{q:"زيادة عدد النقاط مع نفس الضجيج تجعل خطأ الميل:",o:["أقل","أكبر","كما هو"],a:0,why:"se ∝ 1/√Σ(x−x̄)²."},
        {q:"ماذا يدل ارتفاع مفاجئ في هامش EGT بعد الغسيل؟",o:["تحسن بسبب إزالة الأوساخ","عطل شديد","لا شيء"],a:0,why:"غسل الضاغط يعيد جزءاً من الهامش."}],
  show:{ar:"اعرض توربين الضغط العالي",fn:()=>lrnSel("eng_hp_turbine")},
  ref:"الموضوع: مراقبة حالة المحرك (Engine Condition Monitoring)."
});
/* ---- 18 ---- */
LK("mnt",{
  ar:"موازنة المروحة: جمع متجهات الخلل", en:"Fan balancing by vector addition",
  alt:"مخطط قطبي لمتجه الخلل الابتدائي ومتجه وزن الموازنة والمتجه المحصّل، ومنحنى الخلل المتبقي مع زاوية وزن الموازنة",
  intro:["الكتلة غير المتوازنة في العضو الدوّار تولّد قوة طاردة F = m e ω² تهز المحرك. تُعبَّر عنها بالخلل U = m e (بوحدة g·mm). لإزالتها نضيف وزن موازنة متجهه T = m_t · r_t على زاوية مناسبة، فتصبح المحصلة R = U + T (جمع متجهات).",
         "الحل المثالي: وزن مساوٍ في العزم ومعاكس بزاوية 180°: m_t · r_t = U وزاوية T = زاوية U + 180°. نقيس الاهتزاز، ونجرّب وزناً، ونقيس التغيير، ثم نصحح الزاوية والمقدار. القوة تتناسب مع مربع سرعة الدوران، فاهتزاز الخلل نفسه يزداد بسرعة مع N."],
  ctl:[{k:"U0",ar:"الخلل الابتدائي",min:5000,max:40000,step:500,v:20000,f:v=>nf(v,0)+" g·mm"},{k:"a0",ar:"زاوية الخلل",min:0,max:359,step:1,v:40,f:v=>nf(v,0)+"°"},{k:"mt",ar:"وزن الموازنة",min:0,max:200,step:1,v:60,f:v=>nf(v,0)+" g"},{k:"at",ar:"زاوية الوزن",min:0,max:359,step:1,v:90,f:v=>nf(v,0)+"°"},{k:"rt",ar:"نصف قطر التثبيت",min:100,max:300,step:5,v:150,f:v=>nf(v,0)+" mm"},{k:"N",ar:"سرعة الدوران",min:1500,max:5000,step:50,v:3500,f:v=>nf(v,0)+" rpm"}],
  pre:[{ar:"الحل المثالي",set:{mt:133,at:220}},{ar:"بلا وزن",set:{mt:0}}],
  calc(st){ const ux=st.U0*Math.cos(st.a0*D2R), uy=st.U0*Math.sin(st.a0*D2R); st.mtq=(m,a)=>{ const tx=m*st.rt*Math.cos(a*D2R), ty=m*st.rt*Math.sin(a*D2R); return Math.hypot(ux+tx,uy+ty); }; st.res=st.mtq(st.mt,st.at); st.w=2*Math.PI*st.N/60; st.F=st.res*1e-6*st.w*st.w; st.F0=st.U0*1e-6*st.w*st.w; st.mid=st.U0/st.rt; st.aid=(st.a0+180)%360; st.ok=st.res<1500; st.tx=st.mt*st.rt*Math.cos(st.at*D2R); st.ty=st.mt*st.rt*Math.sin(st.at*D2R); st.ux=ux; st.uy=uy; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.5, R=Math.min(r.w*0.3,r.h*0.34), sc=R/Math.max(st.U0,st.mt*st.rt,st.res,1000); g.strokeStyle=C.line; g.lineWidth=1; [0.33,0.66,1].forEach(f=>{ g.beginPath(); g.arc(cx,cy,R*f,0,Math.PI*2); g.stroke(); }); lline(g,[[cx-R,cy],[cx+R,cy]],C.line,1); lline(g,[[cx,cy-R],[cx,cy+R]],C.line,1); const P=(x,y)=>[cx+x*sc,cy-y*sc];
    larrow(g,cx,cy,P(st.ux,st.uy)[0],P(st.ux,st.uy)[1],C.power,2.8,10); ltx(g,"U",P(st.ux,st.uy)[0]+10,P(st.ux,st.uy)[1]-8,{s:13,w:700,m:true,c:C.power}); const tp=P(st.ux+st.tx,st.uy+st.ty); lline(g,[P(st.ux,st.uy),tp],C.hyd,2.4); larrow(g,P(st.ux,st.uy)[0],P(st.ux,st.uy)[1],tp[0],tp[1],C.hyd,2.4,9); ltx(g,"T",(P(st.ux,st.uy)[0]+tp[0])/2+10,(P(st.ux,st.uy)[1]+tp[1])/2-8,{s:13,w:700,m:true,c:C.hyd}); larrow(g,cx,cy,tp[0],tp[1],C.ink,2.8,10); ltx(g,"R",tp[0]+10,tp[1]-8,{s:13,w:700,m:true});
    const a=st.t*st.w*0.002; ldot(g,cx+Math.cos(a)*R*1.12,cy-Math.sin(a)*R*1.12,3,C.muted); ltx(g,"المتبقي "+nf(st.res,0)+" g·mm  ·  قوة "+nf(st.F,0)+" N",r.x+r.w*0.5,r.y+r.h*0.07,{s:13,w:700,rtl:true,c:st.ok?C.hyd:C.power}); ltx(g,st.ok?"المروحة متزنة":"غير متزنة: الحل الأمثل "+nf(st.mid,0)+" g عند "+nf(st.aid,0)+"°",r.x+r.w*0.5,r.y+r.h*0.94,{s:13,w:700,rtl:true,c:st.ok?C.hyd:C.power}); },
  plot(st){ return {x:[0,360],y:[0,Math.max(st.U0*2,st.res*1.1)],xl:"زاوية وزن الموازنة °",yl:"المتبقي g·mm",curves:[{f:a=>st.mtq(st.mt,a),c:"hyd",n:300}],hl:[{y:1500,c:"power",t:"مقبول"}],dots:[{x:st.at,y:st.res,c:"ink"}]}; },
  ro(st){ return [["الخلل الابتدائي",nf(st.U0,0)+" g·mm"],["المتبقي",nf(st.res,0)+" g·mm"],["القوة الطاردة المتبقية",nf(st.F,0)+" N"],["قوة بلا موازنة",nf(st.F0,0)+" N"],["الحل الأمثل",nf(st.mid,0)+" g عند "+nf(st.aid,0)+"°"]]; },
  eq:["R = U + T   (جمع متجهات)","T = m_t r_t ∠ θ_t","F = R · 10⁻⁶ · ω²"],
  note:["القياس الحقيقي يتم بمتحسسات اهتزاز وعلامة طور، ويُحسب الوزن والزاوية من استجابة عدة تشغيلات تجريبية. الحدود المقبولة في دليل المحرك.","إزالة الكتلة (حفر) أو إضافة وزن على الجهة الأخرى تعطي نتيجة متكافئة."],
  quiz:[{q:"لموازنة خلل زاويته 40° نضع الوزن عند:",o:["220°","40°","90°"],a:0,why:"معاكس بزاوية 180°."},
        {q:"مضاعفة سرعة الدوران تضاعف قوة الخلل:",o:["أربع مرات","مرتين","لا تغيرها"],a:0,why:"F ∝ ω²."}],
  show:{ar:"اعرض شفرات المروحة",fn:()=>lrnSel("eng_fan_blades")},
  ref:"الموضوع: موازنة الأجزاء الدوّارة (Rotor Balancing)."
});
