/* ---------- Book 6: Flight Stability and Automatic Control — 10 more lessons ---------- */
LK("fsc",{
  ar:"أثر الزاوية الزوجية: عودة الجناحين إلى الاستواء", en:"Dihedral effect (Clβ)",
  alt:"منظر أمامي لطائرة مائلة تنزلق جانبياً فيرتفع رفع الجناح المنخفض ويعيدها، ومنحنى زاوية الميل مع الزمن",
  intro:["عندما تميل الطائرة تنزلق قليلاً نحو الجناح المنخفض. إذا كان للجناحين زاوية زوجية (مرفوعين على شكل V) يرى الجناح المنخفض زاوية هجوم أكبر فيزيد رفعه ويعيد الطائرة نحو الاستواء.",
         "الميلان للخلف يعطي الأثر نفسه، والجناح المرتفع (فوق الجسم) يضيف أثراً موجباً، والمنخفض يقلله. لهذا للطائرات ذات الأجنحة المائلة والمنخفضة زاوية زوجية صغيرة، وللطائرات ذات الأجنحة المرتفعة أحياناً زاوية سالبة (anhedral)."],
  ctl:[{k:"G",ar:"الزاوية الزوجية",min:-5,max:10,step:0.5,v:5,f:v=>nf(v,1)+"°"},{k:"L",ar:"زاوية الميلان للخلف",min:0,max:40,step:1,v:25,f:v=>nf(v,0)+"°"},{k:"pos",ar:"موضع الجناح",min:-1,max:1,step:1,v:-1,f:v=>["منخفض","وسط","مرتفع"][v+1]}],
  pre:[{ar:"737 تقريباً",set:{G:6,L:25,pos:-1}},{ar:"طائرة شحن بجناح مرتفع",set:{G:-3,L:25,pos:1}},{ar:"طائرة تدريب",set:{G:2,L:0,pos:1}}],
  calc(st){ st.Ge=st.G+st.L/10+st.pos*2; st.clb=-0.0002*st.Ge; st.tau=st.Ge>0.2?9/st.Ge:Infinity; st.phi=t=>15*(st.Ge>0.2?Math.exp(-t/st.tau):Math.exp(Math.max(0,-st.Ge)*t/14)); },
  scene(g,r,st,C){ const T=(st.t%10), ph=clamp(st.phi(T),-60,60)*D2R, cx=r.x+r.w*0.5, cy=r.y+r.h*0.45, sp=r.w*0.4, G=st.G*D2R;
    g.save(); g.translate(cx,cy); g.rotate(ph); g.fillStyle=mixC(C.panel,C.struct,0.4); g.beginPath(); g.ellipse(0,st.pos*-r.h*0.05,r.h*0.07,r.h*0.07,0,0,Math.PI*2); g.fill(); g.strokeStyle=C.ink; g.stroke();
    const wy=-st.pos*r.h*0.05; lline(g,[[0,wy],[-sp,wy-Math.tan(G)*sp]],mixC(C.panel,C.struct,0.8),6); lline(g,[[0,wy],[sp,wy-Math.tan(G)*sp]],mixC(C.panel,C.struct,0.8),6);
    lline(g,[[0,-r.h*0.07],[0,-r.h*0.2]],mixC(C.panel,C.struct,0.8),4); if(st.Ge>0) larrow(g,sp*0.7,wy-Math.tan(G)*sp*0.7,sp*0.7,wy-Math.tan(G)*sp*0.7-r.h*0.15,C.ctrl,2.5,8); g.restore();
    ltx(g,"φ = "+nf(st.phi(T),1)+"°",cx,r.y+r.h*0.92,{s:13,w:600,m:true,c:st.Ge>0?C.ctrl:C.power}); ltx(g,"الزاوية الفعّالة "+nf(st.Ge,1)+"°",cx,r.y+14,{s:11,rtl:true}); },
  plot(st){ return {x:[0,10],y:[0,40],xl:"الزمن s",yl:"φ (°)",curves:[{f:st.phi,c:st.Ge>0?"ctrl":"power"}],dots:[{x:st.t%10,y:clamp(st.phi(st.t%10),0,40)}]}; },
  ro(st){ return [["الزاوية الزوجية الفعّالة",nf(st.Ge,1)+"°"],["C_lβ تقريباً",nf(st.clb,4)+" /°"],["السلوك",st.Ge>0.2?"تعود نحو الاستواء":"لا تعود أو تزيد ميلاً"]]; },
  eq:["C_lβ ≈ −0.0002 × Γ_eff (لكل درجة)","Γ_eff ≈ Γ + Λ/10 + (أثر موضع الجناح ≈ ±2°)"],
  note:["القيم قواعد إبهام للتوضيح: كل 10° ميلان تقارب 1° زاوية زوجية عند معامل رفع متوسط.","زيادة أثر الزاوية الزوجية كثيراً تسوء بالتأرجح الهولندي، لذلك يوازن المصمم بينهما."],
  quiz:[{q:"لماذا للطائرات ذات الجناح المرتفع زاوية زوجية سالبة أحياناً؟",o:["لأن الجناح المرتفع يعطي أثراً موجباً كبيراً فتُقلل","للجمال","لتقليل الوزن"],a:0,why:"تجنب ثبات التفافي زائد وتأرجح هولندي."},
        {q:"الميلان للخلف بالنسبة للثبات الالتفافي:",o:["يشبه زاوية زوجية موجبة","يشبه سالبة","لا أثر"],a:0,why:"الجناح المتقدم في الانزلاق يرى سرعة عمودية أكبر فيرفع أكثر."}],
  show:{ar:"اعرض طرف الجناح",fn:()=>lrnSel("wingtip")},
  ref:"الموضوع المقابل: الاستقرار الالتفافي (Lateral Static Stability, Dihedral Effect)."
});
LK("fsc",{
  ar:"الاستقرار الحلزوني", en:"Spiral stability",
  alt:"منظر علوي لمسار طائرة يلتف حلزونياً ويضيق أو يستقيم، ومنحنى زاوية الميل مع الزمن",
  intro:["إذا مالت الطائرة قليلاً وتركها الطيار بلا تصحيح، فإما أن تعود ببطء إلى الاستواء أو تزيد ميلاً وتدخل حلزوناً يضيق. هذا «النمط الحلزوني» بطيء جداً (عشرات الثواني) ويسهل على الطيار تصحيحه.",
         "الشرط يقارن قوتين: أثر الزاوية الزوجية مع تخميد الانعراج (يعيدان الطائرة)، مقابل ثبات ديك الريح مع الدوران الناتج (يزيدان الميل). ذيل عمودي كبير جداً يجعل الطائرة حلزونياً غير مستقرة."],
  ctl:[{k:"lb",ar:"أثر الزاوية الزوجية |C_lβ|",min:0,max:0.2,step:0.005,v:0.09,f:v=>nf(v,3)},{k:"nb",ar:"ثبات ديك الريح C_nβ",min:0.02,max:0.25,step:0.005,v:0.12,f:v=>nf(v,3)}],
  calc(st){ const cnr=-0.15, clr=0.1; st.E=st.lb*(-cnr)-st.nb*clr; st.lam=-st.E*5; st.th=Math.log(2)/Math.max(Math.abs(st.lam),1e-6); st.phi=t=>10*Math.exp(st.lam*t); },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.5, pts=[]; let x=0,y=0,psi=-Math.PI/2; const V=6, dt=0.5;
    for(let t=0;t<60;t+=dt){ const ph=clamp(st.phi(t),-70,70)*D2R; psi+=G0*Math.tan(ph)/80*dt; x+=Math.cos(psi)*V*dt; y+=Math.sin(psi)*V*dt; pts.push([x,y]); }
    const F=kFit(pts.map(p=>[p[0],-p[1]]),{x:r.x,y:r.y+r.h*0.1,w:r.w,h:r.h*0.85},20), P=pts.map(p=>F([p[0],-p[1]]));
    lline(g,P,st.E>=0?C.ctrl:C.power,2); const k=Math.floor((st.t*4)%P.length), q=P[k], q2=P[Math.min(k+1,P.length-1)]; tplane(g,q[0],q[1],22,Math.atan2(q2[1]-q[1],q2[0]-q[0]),C);
    ltx(g,st.E>=0?"مستقرة: يستقيم المسار":"غير مستقرة: الحلزون يضيق",cx,r.y+14,{s:12,w:600,c:st.E>=0?C.ctrl:C.power,rtl:true}); },
  plot(st){ return {x:[0,60],y:[0,40],xl:"الزمن s",yl:"φ (°)",curves:[{f:st.phi,c:st.E>=0?"ctrl":"power"}]}; },
  ro(st){ return [["معيار الحلزون E = C_lβC_nr − C_nβC_lr",nf(st.E,4)],["الحالة",st.E>=0?"مستقر":"غير مستقر"],[st.E>=0?"زمن نصف الميل":"زمن تضاعف الميل",nf(st.th,0)+" s"]]; },
  eq:["مستقر حلزونياً إذا: C_lβ C_nr − C_nβ C_lr > 0","C_nr ≈ −0.15 ، C_lr ≈ 0.1 (ثابتان هنا)"],
  note:["معظم الطائرات غير مستقرة حلزونياً قليلاً، والزمن طويل بما يكفي ليصحح الطيار أو الطيار الآلي بسهولة.","المعيار والثوابت مبسطة لتوضيح التوازن بين الزاوية الزوجية والذيل العمودي."],
  quiz:[{q:"تكبير الذيل العمودي كثيراً يجعل النمط الحلزوني:",o:["أكثر استقراراً","أقل استقراراً","لا يتأثر"],a:1,why:"C_nβ في الطرف السالب من المعيار."},
        {q:"لماذا لا يخيف عدم الاستقرار الحلزوني البسيط الطيارين؟",o:["لأنه بطيء جداً ويسهل تصحيحه","لأنه يختفي وحده","لأنه سريع"],a:0,why:"زمن التضاعف عشرات الثواني."}],
  show:{ar:"اعرض الذيل العمودي",fn:()=>lrnSel("fin")},
  ref:"الموضوع المقابل: النمط الحلزوني (Spiral Mode)."
});
function cubicRoots(a,b,c){ let z=[{re:0.4,im:0.9},{re:-0.6,im:0.5},{re:-1.2,im:-0.3}]; const f=s=>{ const s2={re:s.re*s.re-s.im*s.im,im:2*s.re*s.im}, s3={re:s2.re*s.re-s2.im*s.im,im:s2.re*s.im+s2.im*s.re}; return {re:s3.re+a*s2.re+b*s.re+c,im:s3.im+a*s2.im+b*s.im}; };
  for(let it=0;it<200;it++){ z=z.map((zi,i)=>{ let den={re:1,im:0}; z.forEach((zj,j)=>{ if(i!==j){ const d={re:zi.re-zj.re,im:zi.im-zj.im}; den={re:den.re*d.re-den.im*d.im,im:den.re*d.im+den.im*d.re}; } }); const fz=f(zi), dd=den.re*den.re+den.im*den.im||1e-12; return {re:zi.re-(fz.re*den.re+fz.im*den.im)/dd,im:zi.im-(fz.im*den.re-fz.re*den.im)/dd}; }); } return z; }
LK("fsc",{
  ar:"المحل الجذري: ماذا يفعل الكسب بالأقطاب", en:"Root locus: what feedback gain does to the poles",
  alt:"مستوى الأعداد المركبة فيه مسارات الأقطاب مع زيادة الكسب وتعبر إلى النصف الأيمن عند كسب معين، واستجابة خطوة تتذبذب أكثر مع الكسب",
  intro:["في نظام التحكم الآلي يضرب الحاسوب الخطأ في «كسب» ويرسله للمحرك أو سطح التحكم. زيادة الكسب تجعل الاستجابة أسرع، لكنها تحرك «أقطاب» النظام نحو التذبذب، وعند حد معين نحو عدم الاستقرار.",
         "المحل الجذري يرسم أماكن الأقطاب لكل كسب. الأقطاب في النصف الأيسر مستقرة، وكلما ابتعدت عن المحور الحقيقي زاد التذبذب. هنا نظام من الدرجة الثالثة يصبح غير مستقر عند كسب 20."],
  ctl:[{k:"K",ar:"الكسب K",min:0.2,max:30,step:0.1,v:4,f:v=>nf(v,1)}],
  calc(st){ st.p=cubicRoots(5,4,st.K); const cx=st.p.filter(q=>Math.abs(q.im)>1e-4); st.unst=st.p.some(q=>q.re>1e-6); st.zeta=cx.length?-cx[0].re/Math.hypot(cx[0].re,cx[0].im):1;
    st.loc=[]; for(let k=0.05;k<60;k*=1.08) st.loc.push(cubicRoots(5,4,k));
    const y=[0,0,0]; st.resp=[]; const dt=0.02; for(let t=0;t<=20;t+=dt){ const a=st.K*(1-y[0])-4*y[1]-5*y[2]; y[0]+=y[1]*dt; y[1]+=y[2]*dt; y[2]+=a*dt; if(Math.round(t/dt)%5===0) st.resp.push([t,clamp(y[0],-2,3)]); } },
  scene(g,r,st,C){ const P=kPlot(g,{x:r.x+r.w*0.12,y:r.y+r.h*0.12,w:r.w*0.84,h:r.h*0.62},{x:[0,20],y:[-0.5,2],xl:"الزمن s",yl:"استجابة خطوة",lines:[{pts:st.resp,c:st.unst?"power":"ctrl"}],hl:[{y:1,c:"muted"}]},C); },
  plot(st){ const pts=[[],[],[]]; st.loc.forEach(rs=>rs.slice().sort((a,b)=>a.im-b.im).forEach((q,i)=>pts[i].push([q.re,q.im]))); return {x:[-6,2],y:[-4,4],xl:"Re",yl:"Im",lines:pts.map(p=>({pts:p,c:"muted",w:1.4})),vl:[{x:0,c:"power"}],dots:st.p.map(q=>({x:q.re,y:q.im,c:st.unst?"power":"ctrl",r:5}))}; },
  ro(st){ return [["الأقطاب",st.p.map(q=>nf(q.re,2)+(Math.abs(q.im)>1e-3?(q.im>0?"+":"−")+nf(Math.abs(q.im),2)+"j":"")).join(" ، ")],["تخميد الزوج المركب",nf(st.zeta,2)],["الحالة",st.unst?"غير مستقر ✗":"مستقر ✓"],["حد الاستقرار","K = 20"]]; },
  eq:["G(s) = K / (s(s+1)(s+4))","المعادلة المميزة: s³ + 5s² + 4s + K = 0","روث–هورفيتز: مستقر إذا 0 < K < 20"],
  note:["في الطيار الآلي الحقيقي تُختار الكسبات بهامش كافٍ عن حد الاستقرار، وتتغير مع السرعة والارتفاع.","الأقطاب قريبة من المحور التخيلي تعني تذبذباً بطيء التلاشي."],
  quiz:[{q:"عندما تعبر الأقطاب إلى النصف الأيمن:",o:["النظام غير مستقر","النظام أسرع ومستقر","لا شيء"],a:0,why:"جزء حقيقي موجب يعني نمواً أُسياً."},
        {q:"زيادة الكسب في هذا النظام تجعل الاستجابة:",o:["أبطأ وأهدأ","أسرع وأكثر تذبذباً","ثابتة"],a:1,why:"الأقطاب المركبة تبتعد عن المحور الحقيقي."}],
  ref:"الموضوع المقابل: تصميم أنظمة التحكم بالمحل الجذري (Root Locus)."
});
LK("fsc",{
  ar:"الاستجابة الترددية (مخطط بود)", en:"Frequency response: the Bode plot",
  alt:"موجتان: الإثارة والاستجابة بفرق طور وسعة مختلفة، ومخطط بود لسعة الاستجابة مع التردد وقمة عند التردد الطبيعي",
  intro:["إذا أثرت نظاماً بموجة جيبية بتردد معين يستجيب بموجة بنفس التردد لكن بسعة مختلفة وتأخير (طور). مخطط بود يرسم هذه السعة بالديسيبل على كل الترددات.",
         "عند التردد الطبيعي تظهر قمة إذا كان التخميد قليلاً، وفي الترددات العالية تتجاهل الطائرة الإثارة. لهذا تهتم الطائرة بالاضطرابات القريبة من ترددات أنماطها، ويُصمم الطيار الآلي ليبتعد عنها."],
  ctl:[{k:"wn",ar:"التردد الطبيعي ωn",min:0.5,max:5,step:0.1,v:2,f:v=>nf(v,1)+" rad/s"},{k:"z",ar:"التخميد ζ",min:0.05,max:1,step:0.01,v:0.2,f:v=>nf(v,2)},{k:"lw",ar:"تردد الإثارة",min:-1,max:1.5,step:0.01,v:0.25,f:v=>nf(Math.pow(10,v),2)+" rad/s"}],
  calc(st){ st.w=Math.pow(10,st.lw); const r=st.w/st.wn; st.mag=1/Math.sqrt((1-r*r)**2+(2*st.z*r)**2); st.db=20*Math.log10(st.mag); st.ph=-Math.atan2(2*st.z*r,1-r*r)/D2R; st.pk=st.z<0.707?1/(2*st.z*Math.sqrt(1-st.z*st.z)):1; },
  scene(g,r,st,C){ const y0=r.y+r.h*0.5, A=r.h*0.18, sp=st.w; const inp=[], out=[]; for(let i=0;i<=120;i++){ const x=r.x+r.w*0.05+i/120*r.w*0.9, t=st.t*0.6+i/120*4*Math.PI/Math.max(sp,0.3)*0.5; inp.push([x,y0-A*Math.sin(sp*t)]); out.push([x,y0-A*Math.min(st.mag,2.4)*Math.sin(sp*t+st.ph*D2R)]); }
    lline(g,[[r.x,y0],[r.x+r.w,y0]],C.line,1); lline(g,inp,C.muted,1.5,[4,3]); lline(g,out,C.ctrl,2.4);
    ltx(g,"الإثارة",r.x+r.w*0.12,r.y+16,{c:C.muted,s:11,rtl:true}); ltx(g,"الاستجابة ×"+nf(st.mag,2)+" ، تأخير "+nf(-st.ph,0)+"°",r.x+r.w*0.6,r.y+16,{c:C.ctrl,s:11,w:600,rtl:true}); },
  plot(st){ return {x:[-1,1.5],y:[-40,Math.max(10,20*Math.log10(st.pk)+4)],xt:[-1,0,1],xf:x=>nf(Math.pow(10,x),x<0?1:0),xl:"ω (rad/s)",yl:"dB",curves:[{f:lx=>{ const r=Math.pow(10,lx)/st.wn; return -10*Math.log10((1-r*r)**2+(2*st.z*r)**2); },c:"hyd",n:300}],vl:[{x:Math.log10(st.wn),c:"power",t:"ωn"}],dots:[{x:st.lw,y:st.db}]}; },
  ro(st){ return [["السعة",nf(st.mag,2)+"× ("+nf(st.db,1)+" dB)"],["الطور",nf(st.ph,0)+"°"],["قمة الرنين",nf(st.pk,2)+"×"]]; },
  eq:["|G(jω)| = 1 / √((1 − r²)² + (2ζr)²) ، r = ω/ωn","الطور = −tan⁻¹(2ζr / (1 − r²))","dB = 20 log₁₀|G|"],
  note:["عند r = 1 يتأخر الرد ربع دورة (−90°) مهما كان التخميد.","اختبارات الطيران تقيس هذه المنحنيات بتحريك أسطح التحكم بترددات متغيرة."],
  quiz:[{q:"عند ترددات أعلى بكثير من الطبيعي، الاستجابة:",o:["كبيرة جداً","صغيرة جداً","تساوي الإثارة"],a:1,why:"السعة تهبط بنحو 40 dB لكل عقد."},
        {q:"قمة الرنين تكبر عندما:",o:["يقل التخميد","يزيد التخميد","يزيد التردد الطبيعي"],a:0,why:"القمة ≈ 1/(2ζ)."}],
  ref:"الموضوع المقابل: الاستجابة الترددية (Frequency Response)."
});
LK("fsc",{
  ar:"الطيار الآلي: مسك الارتفاع والالتقاط", en:"Autopilot altitude hold and capture",
  alt:"شريط أنماط الطيران يتبدل من ALT* إلى ALT، ومؤشر وضع يظهر زاوية الأنف، ومنحنى الارتفاع مع الزمن يقترب من الهدف",
  intro:["مسك الارتفاع حلقتان: الداخلية تتحكم بزاوية الأنف، والخارجية تحسب زاوية الأنف المطلوبة من خطأ الارتفاع ومعدل الصعود. الكسب الكبير يصل أسرع لكنه قد يتجاوز الهدف.",
         "عند الاقتراب من الارتفاع المختار يظهر على شاشة الطيار «ALT*» (التقاط)، ثم «ALT» عند المسك. مصطلح التخميد هنا (كسب معدل الصعود) يمنع التجاوز."],
  ctl:[{k:"dh",ar:"تغيير الارتفاع المطلوب",min:100,max:2000,step:50,v:1000,f:v=>nf(v,0)+" ft"},{k:"Kh",ar:"كسب الارتفاع",min:0.002,max:0.05,step:0.001,v:0.01,f:v=>nf(v,3)+" °/ft"},{k:"Kd",ar:"كسب معدل الصعود",min:0,max:0.3,step:0.005,v:0.08,f:v=>nf(v,3)+" °/(ft/s)"},{k:"tau",ar:"زمن استجابة الحلقة الداخلية",min:0.5,max:5,step:0.1,v:1.5,f:v=>nf(v,1)+" s"}],
  calc(st){ const V=150/0.3048; let h=0,hd=0,th=0; const dt=0.05; st.res=[]; st.thr=[]; let mx=0, ts=null, mp=0;
    for(let t=0;t<=120;t+=dt){ const thc=clamp(st.Kh*(st.dh-h)-st.Kd*hd,-10,10); th+=(thc-th)/st.tau*dt; hd=V*Math.sin(th*D2R); h+=hd*dt; mx=Math.max(mx,h); mp=Math.max(mp,Math.abs(th)); if(ts===null&&Math.abs(h-st.dh)<20&&Math.abs(hd)<2) ts=t; if(Math.round(t/dt)%10===0){ st.res.push([t,h]); st.thr.push(th); } }
    st.os=Math.max(0,mx-st.dh); st.ts=ts; st.mp=mp; },
  scene(g,r,st,C){ const i=Math.min(st.res.length-1,Math.floor((st.t%30)*4)), h=st.res[i][1], th=st.thr[i], err=st.dh-h, cap=Math.abs(err)>20;
    kBox(g,r.x+r.w*0.2,r.y+r.h*0.06,r.w*0.6,r.h*0.14,"#1d242b",C,"",{stroke:"#5d6873"}); ltx(g,cap?"ALT*":"ALT",r.x+r.w*0.5,r.y+r.h*0.13,{c:"#7fe08a",s:16,w:600,m:true});
    const cx=r.x+r.w*0.5, cy=r.y+r.h*0.58, R=Math.min(r.w*0.3,r.h*0.3); g.save(); g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.clip(); const off=th*R/15;
    g.fillStyle="#3f87c9"; g.fillRect(cx-R,cy-R+off-R,2*R,2*R); g.fillStyle="#9a6b3c"; g.fillRect(cx-R,cy+off,2*R,2*R); for(let k=-20;k<=20;k+=5){ if(!k) continue; const y=cy+off-k*R/15; lline(g,[[cx-R*0.25,y],[cx+R*0.25,y]],"#fff",1); } lline(g,[[cx-R,cy+off],[cx+R,cy+off]],"#fff",2); g.restore();
    lline(g,[[cx-R*0.5,cy],[cx-R*0.15,cy]],"#f2c230",4); lline(g,[[cx+R*0.15,cy],[cx+R*0.5,cy]],"#f2c230",4); ltx(g,"θ = "+nf(th,1)+"°",cx,cy+R+14,{s:11,m:true}); },
  plot(st){ return {x:[0,120],y:[0,Math.max(st.dh*1.3,st.dh+st.os+50)],xl:"الزمن s",yl:"Δh ft",lines:[{pts:st.res,c:"hyd"}],hl:[{y:st.dh,t:"الهدف",c:"ctrl"}],vl:[{x:(st.t%30)*4,c:"accent"}]}; },
  ro(st){ return [["التجاوز",nf(st.os,0)+" ft"],["زمن الاستقرار ضمن 20 ft",st.ts!==null?nf(st.ts,0)+" s":"> 120 s"],["أقصى زاوية أنف",nf(st.mp,1)+"°"]]; },
  eq:["θ_c = K_h (h_c − h) − K_ḣ ḣ (محدودة بـ ±10°)","θ̇ = (θ_c − θ) / τ","ḣ = V sin θ"],
  note:["السرعة هنا ثابتة 150 m/s، والطيار الآلي الحقيقي ينسق مع منظم الدفع للحفاظ على السرعة.","جرّب Kd = 0 لترى كيف يتجاوز الهدف ويتذبذب."],
  quiz:[{q:"ماذا يعني ALT* على شاشة الطيار؟",o:["الارتفاع مُمسوك","الطيار الآلي يلتقط الارتفاع المختار","عطل"],a:1,why:"النجمة تعني مرحلة الالتقاط قبل المسك."},
        {q:"لإزالة التجاوز نزيد:",o:["كسب الارتفاع","كسب معدل الصعود (التخميد)","زمن الاستجابة"],a:1,why:"يقلل زاوية الأنف عند الاقتراب السريع."}],
  show:{ar:"اعرض الإلكترونيات",fn:()=>lrnSel("avionics")},
  ref:"الموضوع المقابل: أنظمة الطيار الآلي الطولية (Altitude Hold Autopilot)."
});
LK("fsc",{
  ar:"اختيار الاتجاه: الالتفاف للدوران", en:"Heading select: bank to turn",
  alt:"منظر علوي لطائرة تدور إلى اتجاه جديد مع مؤشر ميلها، ومنحنى الاتجاه مع الزمن",
  intro:["الطائرة تدور بالميل: الرفع المائل يسحبها جانباً. في نمط اختيار الاتجاه يحسب الطيار الآلي الميل المطلوب من فرق الاتجاه، ويحده بأقصى ميل (25° عادة) ويغيّره بمعدل التفاف محدود ليكون مريحاً للركاب.",
         "معدل الدوران = g tan φ / V. لذلك في السرعات العالية يكون الدوران أبطأ ونصف قطره أكبر بكثير، ولهذا تبدأ الطائرات دورانها مبكراً قبل نقاط المسار."],
  ctl:[{k:"dp",ar:"تغيير الاتجاه",min:10,max:180,step:5,v:90,f:v=>nf(v,0)+"°"},{k:"V",ar:"السرعة الحقيقية",min:150,max:480,step:5,v:250,f:v=>nf(v,0)+" kt"},{k:"pm",ar:"أقصى ميل",min:10,max:30,step:1,v:25,f:v=>nf(v,0)+"°"},{k:"K",ar:"كسب الاتجاه",min:0.5,max:3,step:0.1,v:1.5,f:v=>nf(v,1)+" °/°"}],
  calc(st){ const V=st.V/KT; let psi=0,phi=0; const dt=0.1; st.res=[]; st.path=[]; let x=0,y=0,tt=null;
    for(let t=0;t<=240;t+=dt){ const pc=clamp(st.K*(st.dp-psi),-st.pm,st.pm); phi+=clamp(pc-phi,-5*dt,5*dt); psi+=G0*Math.tan(phi*D2R)/V/D2R*dt; x+=Math.cos(psi*D2R)*V*dt; y+=Math.sin(psi*D2R)*V*dt; if(tt===null&&Math.abs(st.dp-psi)<1) tt=t; if(Math.round(t/dt)%10===0){ st.res.push([t,psi]); st.path.push([x,y,phi,psi]); } }
    st.tt=tt; st.R=V*V/(G0*Math.tan(st.pm*D2R))/1852; st.rate=G0*Math.tan(st.pm*D2R)/V/D2R; },
  scene(g,r,st,C){ const sub=st.path.slice(0,Math.min(st.path.length,Math.ceil((st.tt||240)+25))), F=kFit(sub.map(p=>[p[1],p[0]]),{x:r.x,y:r.y+r.h*0.1,w:r.w,h:r.h*0.88},24), M=p=>F([p[1],p[0]]);
    const pts=sub.map(M); lline(g,pts,C.hyd,2); const i=Math.min(pts.length-1,Math.floor((st.t*6)%pts.length)), p=sub[i], q=M(p); tplane(g,q[0],q[1],24,(-90+p[3])*D2R,C);
    ltx(g,"الميل "+nf(p[2],0)+"°",r.x+r.w*0.75,r.y+16,{s:12,w:600,rtl:true}); },
  plot(st){ return {x:[0,Math.min(240,(st.tt||200)*1.3)],y:[0,st.dp*1.15],xl:"الزمن s",yl:"الاتجاه (°)",lines:[{pts:st.res,c:"hyd"}],hl:[{y:st.dp,c:"ctrl",t:"الهدف"}]}; },
  ro(st){ return [["زمن الوصول إلى الاتجاه",st.tt!==null?nf(st.tt,0)+" s":"> 240 s"],["معدل الدوران عند أقصى ميل",nf(st.rate,2)+"°/s"],["نصف القطر عند أقصى ميل",nf(st.R,2)+" NM"]]; },
  eq:["ψ̇ = g tan φ / V","φ_c = K (ψ_c − ψ) محدودة بـ φ_max ، ومعدل الالتفاف ≤ 5°/s","R = V² / (g tan φ)"],
  note:["الطيار الآلي الحقيقي يغيّر حد الميل مع السرعة والارتفاع.","عند 450 عقدة وميل 25° يكون نصف القطر نحو 6 أميال بحرية."],
  quiz:[{q:"مضاعفة السرعة بنفس الميل تجعل معدل الدوران:",o:["ضعفاً","نصفاً","كما هو"],a:1,why:"ψ̇ ∝ 1/V."},
        {q:"لماذا يُحد معدل الالتفاف (تغيّر الميل)؟",o:["لراحة الركاب وتجنب الأحمال المفاجئة","لتوفير الوقود","لا سبب"],a:0,why:"الدخول السريع في الميل مزعج وغير ضروري."}],
  show:{ar:"اعرض الجنيحات",fn:()=>lrnSel("aileron",1)},
  ref:"الموضوع المقابل: الطيار الآلي الجانبي (Heading Select, Coordinated Turn)."
});
LK("fsc",{
  ar:"مسار الانحدار ILS: حساسية الحزمة", en:"ILS glideslope: beam sensitivity",
  alt:"منظر جانبي لحزمة الانحدار بزاوية 3 درجات تضيق قرب المدرج وطائرة فوقها أو تحتها، ومؤشر الانحراف بالنقاط على شاشة الطيار",
  intro:["حزمة الانحدار في نظام الهبوط الآلي ILS زاوية (3° عادة) لا ارتفاع. مؤشر الانحراف على شاشة الطيار يقيس الانحراف الزاوي، وكل نقطة تقارب 0.35°.",
         "لأن الحزمة زاوية، يضيق عرضها بالأقدام كلما اقتربت الطائرة: نقطة واحدة على بعد 10 أميال تعني أكثر من 350 قدماً، وقرب العتبة بضعة أقدام فقط. لذلك يصبح المؤشر حساساً جداً في النهاية والطيار الآلي يخفض كسبه."],
  ctl:[{k:"d",ar:"المسافة من هوائي الانحدار",min:0.5,max:10,step:0.1,v:5,f:v=>nf(v,1)+" NM"},{k:"dv",ar:"انحراف الطائرة عن الحزمة",min:-300,max:300,step:5,v:60,f:v=>(v>0?"+":"")+nf(v,0)+" ft"}],
  calc(st){ const D=st.d*6076; st.ang=Math.atan(st.dv/D)/D2R; st.dots=st.ang/0.35; st.fpd=D*Math.tan(0.35*D2R); st.h=D*Math.tan(3*D2R)+st.dv; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.05, y0=r.y+r.h*0.85, L=r.w*0.62, X=d=>x0+L-d/10*L, k=r.h*0.6/(10*6076*Math.tan(3.7*D2R)), Y=f=>y0-f*k;
    lline(g,[[x0,y0],[x0+L+r.w*0.05,y0]],C.ink,2); g.fillStyle=mixC(C.panel,C.ctrl,0.12); g.beginPath(); g.moveTo(X(0),y0); g.lineTo(X(10),Y(10*6076*Math.tan(3.7*D2R))); g.lineTo(X(10),Y(10*6076*Math.tan(2.3*D2R))); g.closePath(); g.fill();
    lline(g,[[X(0),y0],[X(10),Y(10*6076*Math.tan(3*D2R))]],C.ctrl,1.5,[5,4]); const ax=X(st.d), ay=Y(st.h); tplane(g,ax,ay,18,Math.PI,C); ldot(g,ax,ay,3,C.power);
    const sx=r.x+r.w*0.82, sy=r.y+r.h*0.18, sh=r.h*0.62; kBox(g,sx-14,sy,28,sh,"#1d242b",C,"",{stroke:"#5d6873"}); for(let i=-2;i<=2;i++){ if(!i) continue; g.strokeStyle="#e8edf2"; g.lineWidth=1.5; g.beginPath(); g.arc(sx,sy+sh/2-i*sh/5,4,0,Math.PI*2); g.stroke(); }
    lline(g,[[sx-12,sy+sh/2],[sx+12,sy+sh/2]],"#f2c230",2); const dy=sy+sh/2+clamp(st.dots,-2.4,2.4)*sh/5; g.fillStyle="#d96bd9"; g.beginPath(); g.moveTo(sx,dy-7); g.lineTo(sx+7,dy); g.lineTo(sx,dy+7); g.lineTo(sx-7,dy); g.closePath(); g.fill();
    ltx(g,"GS",sx,sy-10,{s:10,m:true}); },
  plot(st){ return {x:[0.5,10],y:[0,400],xl:"المسافة NM",yl:"ft لكل نقطة",curves:[{f:d=>d*6076*Math.tan(0.35*D2R),c:"hyd"}],dots:[{x:st.d,y:st.fpd,t:nf(st.fpd,0)+" ft"}]}; },
  ro(st){ return [["الانحراف الزاوي",nf(st.ang,2)+"°"],["بالنقاط",nf(st.dots,1)+(st.dots>0?" (الطائرة فوق: المؤشر تحت)":" ")],["قدم لكل نقطة هنا",nf(st.fpd,0)+" ft"],["ارتفاع الطائرة",nf(st.h,0)+" ft"]]; },
  eq:["الانحراف الزاوي = tan⁻¹(Δh / d)","نقطة واحدة ≈ 0.35° (نقطتان = 0.7° حد المقياس)","عرض النقطة = d · tan 0.35°"],
  note:["المؤشر يبين مكان الحزمة بالنسبة للطائرة: إذا كانت الطائرة فوق الحزمة ينزل المعيّن.","الهوائي يكون عادة على بعد نحو 300 متر من عتبة المدرج، فتعبر الحزمة العتبة على نحو 50 قدماً."],
  quiz:[{q:"نفس الانحراف بالأقدام قرب المدرج يظهر بالنقاط:",o:["أصغر","أكبر بكثير","مساوياً"],a:1,why:"الزاوية = الانحراف ÷ المسافة."},
        {q:"إذا كان المعيّن تحت المركز فالطائرة:",o:["فوق الحزمة","تحت الحزمة","على الحزمة"],a:0,why:"المؤشر يدل على مكان الحزمة: هي تحتك."}],
  show:{ar:"اعرض الإلكترونيات",fn:()=>lrnSel("avionics")},
  ref:"الموضوع المقابل: التحكم بمسار الطيران والاقتراب الآلي (Glideslope Coupling)."
});
LK("fsc",{
  ar:"لسان التقليم وقوة العصا", en:"Trim tab and stick force",
  alt:"دفة ارتفاع مع لسان تقليم صغير يتحرك، وعصا تحكم بسهم القوة المطلوبة، ومنحنى قوة العصا مع السرعة يمر بالصفر عند سرعة التقليم",
  intro:["لسان التقليم سطح صغير على حافة دفة الارتفاع. عندما يُضبط تتوازن قوى الهواء على الدفة عند سرعة معينة، فلا يحتاج الطيار لأي قوة على العصا: هذه «سرعة التقليم».",
         "في الطائرة المستقرة، لكي تطير أبطأ من سرعة التقليم يجب أن تسحب، ولكي تطير أسرع يجب أن تدفع. ميل منحنى القوة يعطي الطيار إحساساً بالسرعة ويعتمد على مكان مركز الثقل."],
  ctl:[{k:"dt",ar:"لسان التقليم (موجب = أنف للأعلى)",min:-10,max:10,step:0.5,v:0,f:v=>(v>0?"+":"")+nf(v,1)+"°"},{k:"V",ar:"السرعة الحالية",min:120,max:320,step:1,v:200,f:v=>nf(v,0)+" kt"},{k:"sm",ar:"هامش الاستقرار",min:0.02,max:0.2,step:0.005,v:0.1,f:v=>nf(v*100,1)+"% MAC"}],
  calc(st){ st.Vt=220*Math.exp(-0.035*st.dt); st.Fs=400*st.sm; st.F=st.Fs*(1-(st.V/st.Vt)**2); st.grad=-2*st.Fs/st.Vt*10; },
  scene(g,r,st,C){ const ex=r.x+r.w*0.08, ey=r.y+r.h*0.35, L=r.w*0.5, de=clamp(-st.dt*0.6,-8,8)*D2R, tb=st.dt*2*D2R;
    g.fillStyle=mixC(C.panel,C.struct,0.4); g.strokeStyle=C.ink; g.lineWidth=1.3; g.beginPath(); g.moveTo(ex,ey-8); g.lineTo(ex+L*0.55,ey-4); g.lineTo(ex+L*0.55,ey+4); g.lineTo(ex,ey+8); g.closePath(); g.fill(); g.stroke();
    const hx=ex+L*0.55, ee=[hx+Math.cos(de)*L*0.35,ey+Math.sin(de)*L*0.35]; lline(g,[[hx,ey],ee],mixC(C.panel,C.ctrl,0.7),7); lline(g,[ee,[ee[0]+Math.cos(de-tb)*L*0.12,ee[1]+Math.sin(de-tb)*L*0.12]],C.power,5);
    ltx(g,"لسان التقليم",ee[0]+L*0.06,ee[1]+18,{c:C.power,s:10,rtl:true});
    const sx=r.x+r.w*0.78, sy=r.y+r.h*0.85, ang=clamp(-st.F/60,-0.5,0.5); lline(g,[[sx,sy],[sx+Math.sin(ang)*r.h*0.4,sy-Math.cos(ang)*r.h*0.4]],C.ink,5); ldot(g,sx+Math.sin(ang)*r.h*0.4,sy-Math.cos(ang)*r.h*0.4,9,C.ink);
    if(Math.abs(st.F)>1) larrow(g,sx+Math.sin(ang)*r.h*0.4,sy-Math.cos(ang)*r.h*0.45,sx+Math.sin(ang)*r.h*0.4-Math.sign(st.F)*Math.min(60,Math.abs(st.F)),sy-Math.cos(ang)*r.h*0.45,C.power,2.5,8);
    ltx(g,Math.abs(st.F)<1?"لا قوة: مقلّمة ✓":(st.F>0?"اسحب ":"ادفع ")+nf(Math.abs(st.F),0)+" N",sx,r.y+r.h*0.95,{s:12,w:600,rtl:true,c:Math.abs(st.F)<1?C.ctrl:C.power}); },
  plot(st){ return {x:[120,320],y:[-120,60],xl:"السرعة kt",yl:"قوة العصا N (+ سحب)",curves:[{f:v=>st.Fs*(1-(v/st.Vt)**2),c:"hyd"}],hl:[{y:0,c:"line"}],vl:[{x:st.Vt,c:"ctrl",t:"التقليم"}],dots:[{x:st.V,y:st.F}]}; },
  ro(st){ return [["سرعة التقليم",nf(st.Vt,0)+" kt"],["قوة العصا الآن",(st.F>=0?"سحب ":"دفع ")+nf(Math.abs(st.F),1)+" N"],["الميل عند التقليم",nf(st.grad,1)+" N لكل 10 kt"]]; },
  eq:["F = G · q · S_e c_e · C_h (العزم المفصلي × نسبة الربط)","C_h = C_h0 + C_hα α + C_hδ δ_e + C_hδt δ_t","F = 0 عند سرعة التقليم"],
  note:["النموذج مبسّط: ميل القوة يتناسب مع هامش الاستقرار، ويقل إذا تحرك مركز الثقل للخلف.","في الطائرات الكبيرة يُقلَّم المثبت الأفقي كله بدلاً من لسان، والمبدأ نفسه."],
  quiz:[{q:"لكي تطير أبطأ من سرعة التقليم في طائرة مستقرة:",o:["تدفع العصا","تسحب العصا","لا شيء"],a:1,why:"الطائرة تريد العودة لسرعة التقليم، فتحتاج قوة سحب لإبقائها أبطأ."},
        {q:"مركز ثقل خلفي يجعل ميل قوة العصا:",o:["أكبر","أصغر (عصا أخف)","كما هو"],a:1,why:"هامش الاستقرار أقل."}],
  show:{ar:"اعرض دفة الارتفاع",fn:()=>lrnSel("elevator",1)},
  ref:"الموضوع المقابل: الاستقرار بعصا حرة وقوى التحكم (Stick-Free Stability, Trim Tabs)."
});
LK("fsc",{
  ar:"انخفاض الأنف بماخ ومصحح ماخ", en:"Mach tuck and the Mach trim",
  alt:"طائرة يميل أنفها للأسفل تدريجياً كلما زاد رقم ماخ إلا إذا عمل مصحح ماخ، ومنحنى عزم الانحدار الإضافي مع ماخ",
  intro:["قرب سرعة الصوت تظهر موجة صدمية على الجناح وتتحرك للخلف، فينتقل مركز الضغط للخلف ويقل التيار الهابط على الذيل. النتيجة عزم يدفع الأنف للأسفل يزداد مع ماخ: «Mach tuck».",
         "إذا لم يصحح الطيار تزيد السرعة أكثر فيزيد الانحدار. لذلك في الطائرات النفاثة نظام آلي (Mach trim) يحرك دفة الارتفاع أو المثبت تلقائياً للأعلى مع ماخ."],
  ctl:[{k:"M",ar:"رقم ماخ",min:0.6,max:0.92,step:0.005,v:0.84,f:v=>nf(v,3)}],
  tog:[{k:"mt",ar:"مصحح ماخ يعمل",v:true}],
  calc(st){ const Mt=0.72; st.dcm=st.M>Mt?-1.5*(st.M-Mt)**2:0; st.de=st.dcm/(-1.2)/D2R; st.pitch=st.mt?0:clamp(st.dcm*400,-15,0); },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.42, osc=st.mt?0:Math.min(1,(st.t%6)/6); lplane(g,cx,cy+(-st.pitch)*osc*2,Math.min(r.w*0.7,200),st.pitch*osc,C,{flip:true});
    if(st.dcm<0){ larrow(g,cx+r.w*0.22,cy-30,cx+r.w*0.22,cy+10,C.power,2.5,8); ltx(g,"عزم أنف للأسفل",cx+r.w*0.22,cy-40,{c:C.power,s:10,rtl:true}); }
    ltx(g,st.mt?"مصحح ماخ يرفع الدفة "+nf(st.de,2)+"°":"بلا تصحيح: الأنف ينخفض",cx,r.y+r.h*0.92,{s:12,w:600,c:st.mt?C.ctrl:C.power,rtl:true}); },
  plot(st){ return {x:[0.6,0.92],y:[-0.06,0.005],xl:"M",yl:"ΔC_m",curves:[{f:M=>M>0.72?-1.5*(M-0.72)**2:0,c:"power"}],hl:[{y:0,c:"line"}],dots:[{x:st.M,y:st.dcm}]}; },
  ro(st){ return [["عزم الانحدار الإضافي ΔC_m",nf(st.dcm,4)],["دفة ارتفاع مطلوبة للتعويض",nf(st.de,2)+"° للأعلى"],["الحالة",st.mt?"مُعوَّض آلياً":"الطيار يجب أن يسحب"]]; },
  eq:["ΔC_m ≈ −k (M − M_t)² عندما M > M_t","δ_e المطلوبة = −ΔC_m / C_mδe"],
  note:["الأرقام توضيحية (M_t = 0.72 وk = 1.5)، والقيم الحقيقية من اختبارات الطيران لكل طائرة.","عطل مصحح ماخ يُحد عادة بسرعة قصوى أقل في قائمة المعدات الدنيا."],
  quiz:[{q:"لماذا ينخفض الأنف قرب سرعة الصوت؟",o:["مركز الضغط يتحرك للخلف","المحرك يدفع للأسفل","الوقود يتحرك للأمام"],a:0,why:"الموجة الصدمية تتحرك للخلف على الجناح."},
        {q:"مصحح ماخ يحرك:",o:["الجنيحات","دفة الارتفاع أو المثبت للأعلى","الدفة"],a:1,why:"ليعوّض عزم الانحدار."}],
  show:{ar:"اعرض المثبت الأفقي",fn:()=>lrnSel("stabilizer",1)},
  ref:"الموضوع المقابل: آثار الانضغاط على الاستقرار (Mach Tuck)."
});
LK("fsc",{
  ar:"التحكم الإلكتروني: طلب معامل الحمل والحمايات", en:"Fly-by-wire normal law: load-factor demand and protections",
  alt:"عصا جانبية مائلة ومؤشر معامل الحمل وشريط زاوية الهجوم مع حدود الحماية، ومخطط معامل الحمل الممكن مع السرعة",
  intro:["في طائرات إيرباص بالتحكم الإلكتروني لا تحرك العصا الجانبية الدفة مباشرة؛ هي «تطلب» معامل حمل. ترك العصا يعني 1g أي طيران مستقيم يحافظ على المسار، والسحب الكامل يطلب حتى 2.5g.",
         "إذا كانت السرعة منخفضة لا يمكن تحقيق هذا الحمل دون تجاوز زاوية الهجوم القصوى، فتتدخل «حماية زاوية الهجوم» وتمنع الانهيار مهما سحب الطيار. هذا الفرق الكبير عن التحكم التقليدي."],
  ctl:[{k:"stk",ar:"العصا الجانبية (سحب +)",min:-1,max:1,step:0.05,v:0.8,f:v=>nf(v,2)},{k:"V",ar:"السرعة",min:120,max:350,step:1,v:170,f:v=>nf(v,0)+" kt"}],
  tog:[{k:"prot",ar:"الحمايات تعمل (قانون عادي)",v:true}],
  calc(st){ const WS=386000*G0/845, q=0.5*1.225*(st.V/KT)**2, CLa=0.09; st.nc=st.stk>=0?1+1.5*st.stk:1+2*st.stk; const amax=15, aprot=13, clp=CLa*(aprot+2), clm=CLa*(amax+2);
    st.nprot=q*clp/WS; st.nmax=q*clm/WS; const cap=st.prot?Math.min(st.nprot,2.5):st.nmax; st.n=Math.min(st.nc,cap); const reqCL=st.n*WS/q; st.al=reqCL/CLa-2; st.stall=!st.prot&&st.nc>st.nmax; if(st.stall){ st.n=st.nmax*0.7; st.al=amax+4; } st.lim=st.prot&&st.nc>st.nprot; },
  scene(g,r,st,C){ const sx=r.x+r.w*0.18, sy=r.y+r.h*0.78; g.fillStyle=mixC(C.panel,C.ink,0.6); g.fillRect(sx-24,sy,48,12); const a=-st.stk*0.5; lline(g,[[sx,sy],[sx-Math.sin(a)*r.h*0.4*-1,sy-Math.cos(a)*r.h*0.4]],C.ink,7); ldot(g,sx+Math.sin(a)*r.h*0.4,sy-Math.cos(a)*r.h*0.4,10,C.ink);
    ltx(g,"العصا الجانبية",sx,sy+26,{c:C.muted,s:10,rtl:true});
    kGauge(g,r.x+r.w*0.55,r.y+r.h*0.42,Math.min(r.w*0.2,r.h*0.3),st.n,-1,3,C,{a0:135,sw:270,step:1,arcs:[{from:2.5,to:3,c:"#d9534f"}],label:"g",val:"n = "+nf(st.n,2)});
    const bx=r.x+r.w*0.86, by=r.y+r.h*0.12, bh=r.h*0.7, A=v=>by+bh-(clamp(v,-2,20)+2)/22*bh; g.fillStyle=mixC(C.panel,C.ink,0.1); g.fillRect(bx-8,by,16,bh); g.fillStyle=st.stall?C.power:st.lim?C.fuel:C.ctrl; g.fillRect(bx-8,A(st.al),16,by+bh-A(st.al));
    lline(g,[[bx-14,A(13)],[bx+14,A(13)]],C.fuel,2); lline(g,[[bx-14,A(15)],[bx+14,A(15)]],C.power,2); ltx(g,"α",bx,by-10,{s:11,m:true});
    ltx(g,st.stall?"انهيار!":st.lim?"حماية زاوية الهجوم":"",r.x+r.w*0.55,r.y+r.h*0.95,{s:12,w:600,c:st.stall?C.power:C.fuel,rtl:true}); },
  plot(st){ const WS=386000*G0/845, f=c=>v=>0.5*1.225*(v/KT)**2*0.09*(c+2)/WS; return {x:[120,350],y:[-1,3],xl:"السرعة kt",yl:"n (g)",curves:[{f:f(13),c:"fuel"},{f:f(15),c:"power",dash:[4,3]}],hl:[{y:2.5,c:"muted",t:"2.5g"},{y:1,c:"line"}],dots:[{x:st.V,y:st.nc,c:"muted",r:4,t:"مطلوب"},{x:st.V,y:st.n,c:st.stall?"power":"ctrl"}],leg:[{c:"fuel",t:"α prot"},{c:"power",t:"α max",dash:[4,3]}]}; },
  ro(st){ return [["معامل الحمل المطلوب",nf(st.nc,2)+" g"],["المتحقق",nf(st.n,2)+" g"],["زاوية الهجوم",nf(st.al,1)+"°"],["الحالة",st.stall?"انهيار (بلا حماية)":st.lim?"الحماية تحد الطلب":"طبيعي"]]; },
  eq:["العصا → n_c: 1 + 1.5·δ (سحب) حتى 2.5g ، و1 + 2·δ (دفع) حتى −1g","n الممكن عند α = ½ρV² S C_L(α) / W","الحماية: n ≤ n(α_prot)"],
  note:["الأرقام لطائرة بحجم A380 بوزن الهبوط وحدود زاوية هجوم تقريبية؛ القوانين الحقيقية أعقد وتشمل حماية الميل والسرعة.","في القانون البديل (عند أعطال معينة) تختفي بعض الحمايات، ويُكتب ذلك على شاشة الطيار."],
  quiz:[{q:"ترك العصا الجانبية في القانون العادي يعني:",o:["الطائرة تهبط","طلب 1g فتحافظ على المسار","فصل الطيار الآلي"],a:1,why:"العصا المحايدة تطلب معامل حمل 1."},
        {q:"لماذا لا يحصل الطيار على 2.5g عند السرعة المنخفضة؟",o:["حماية زاوية الهجوم تمنع الانهيار","المحركات ضعيفة","العصا معطلة"],a:0,why:"الحمل الممكن محدود بأقصى معامل رفع عند تلك السرعة."}],
  show:{ar:"اعرض قمرة القيادة",fn:()=>lrnSel("flightdeck")},
  ref:"الموضوع المقابل: أنظمة تحسين الاستقرار والتحكم الإلكتروني (Fly-by-Wire Control Laws)."
});
