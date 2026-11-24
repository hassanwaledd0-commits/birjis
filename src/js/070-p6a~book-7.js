/* ---------- Book 7: Aerodynamics, Aeronautics and Flight Mechanics ---------- */
const WAKE_SEP={Super:{Super:3,Heavy:6,Medium:7,Light:8},Heavy:{Super:3,Heavy:4,Medium:5,Light:6},Medium:{Super:3,Heavy:3,Medium:3,Light:5},Light:{Super:3,Heavy:3,Medium:3,Light:3}};
LESSONS.aaf.push({
  ar:"اضطراب الأعقاب ومسافات الفصل", en:"Wake turbulence and separation",
  alt:"منظر خلفي لدوامتين تدوران عكس بعضهما وتنزلان خلف طائرة، وأشرطة مسافة الفصل بالأميال البحرية للطائرات اللاحقة",
  intro:["الجناح الذي يولّد رفعاً يترك خلفه دوامتين قويتين تدوران عكس بعضهما. قوتهما (الدوران Γ) تزيد مع وزن الطائرة وتقل مع سرعتها وباعها، لذلك تترك الطائرة الثقيلة البطيئة عند الاقتراب أقوى الدوامات.",
         "الدوامتان تنزلان ببطء (بضعة أمتار في الثانية) وتضعفان مع الوقت. لذلك تفصل المراقبة الجوية بين الطائرات حسب فئة الوزن: خلف A380 مثلاً يجب أن تبقى الطائرة المتوسطة على بعد 7 أميال بحرية أثناء الاقتراب."],
  ctl:[{k:"m",ar:"كتلة الطائرة القائدة",min:3,max:560,step:1,v:386,f:v=>nf(v,0)+" t"},{k:"V",ar:"سرعة الاقتراب",min:45,max:90,step:1,v:72,f:v=>nf(v,0)+" m/s ("+nf(v*KT,0)+" kt)"},{k:"b",ar:"الباع",min:10,max:80,step:0.1,v:79.8,f:v=>nf(v,1)+" m"}],
  pre:[{ar:"A380 (Super)",set:{m:386,V:72,b:79.8}},{ar:"777 (Heavy)",set:{m:250,V:75,b:64.8}},{ar:"737-800 (Medium)",set:{m:65,V:72,b:35.8}},{ar:"طائرة صغيرة (Light)",set:{m:5,V:50,b:16}}],
  init(st){ st.p=[]; for(let i=0;i<260;i++){ st.p.push({s:i%2?1:-1,a:Math.random()*Math.PI*2,r:Math.sqrt(Math.random())}); } st.z=0; },
  calc(st){ const rho=1.225, W=st.m*1000*G0; st.b0=Math.PI/4*st.b; st.G=W/(rho*st.V*st.b0); st.w=st.G/(2*Math.PI*st.b0);
    st.cat=st.m>=380?"Super":st.m>=120?"Heavy":st.m>=7?"Medium":"Light"; st.sep=WAKE_SEP[st.cat]; },
  step(st,dt){ st.z=(st.z+dt*st.w*4)%60; const k=Math.min(3,st.G/300); st.p.forEach(q=>{ q.a+=dt*q.s*(1.5/(0.25+q.r))*k; }); },
  draw(g,W,H,st,C){
    const cx=W*0.28, top=H*0.16, sc=Math.min(W*(W<600?0.4:0.46),H*0.9)/(st.b*1.15), sep=st.b0*sc/2, cr=clamp(st.G/12,8,Math.min(60,sep*0.9)), cy=top+30+st.z*1.4;
    ltx(g,"منظر من الخلف",cx,14,{c:C.muted,s:10,rtl:true}); lline(g,[[cx-st.b*sc/2,top],[cx+st.b*sc/2,top]],C.ink,3); ldot(g,cx,top,4,C.ink);
    st.p.forEach(q=>{ const x=cx+q.s*sep+Math.cos(q.a)*q.r*cr, y=cy+Math.sin(q.a)*q.r*cr; ldot(g,x,y,1.6,q.s>0?C.hyd:C.power,0.75); });
    larrow(g,cx,top+10,cx,top+30,C.muted,1.5,6); ltx(g,"الدوامتان تنزلان "+nf(st.w,2)+" m/s",cx,H-14,{c:C.muted,s:10,rtl:true});
    const x0=W*0.58, w=W*0.38, y0=H*0.36;
    ltx(g,"مسافة الفصل خلف "+st.cat,x0+w,y0-34,{s:12,w:600,a:"right",rtl:true}); ltx(g,"(ميل بحري)",x0+w,y0-17,{c:C.muted,s:10,a:"right",rtl:true});
    ["Super","Heavy","Medium","Light"].forEach((c,i)=>{ const v=st.sep[c], y=y0+i*24, bx=x0+52, bwMax=w-52-38, bw=bwMax*v/8;
      ltx(g,c,x0,y+8,{s:10,a:"left",m:true,c:C.muted}); g.fillStyle=v>3?mixC(C.panel,C.power,0.25+v*0.07):mixC(C.panel,C.ctrl,0.35); g.fillRect(bx,y,bw,16); ltx(g,v+" NM",bx+bw+4,y+8,{s:10,a:"left",m:true}); });
    ltx(g,"3 NM = الحد الأدنى العادي للرادار",x0+w,y0+4*24+10,{c:C.muted,s:9,a:"right",rtl:true});
  },
  ro(st){ return [["فئة الوزن (تقريبية)",st.cat],["قوة الدوامة Γ₀",nf(st.G,0)+" m²/s"],["المسافة بين الدوامتين",nf(st.b0,1)+" m"],["سرعة نزول الدوامات",nf(st.w,2)+" m/s ("+nf(st.w*196.85,0)+" ft/min)"]]; },
  eq:["Γ₀ = W / (ρ V b₀) ، b₀ = (π/4) b للتوزيع الإهليلجي","سرعة النزول w = Γ₀ / (2π b₀)"],
  note:["الفئة الحقيقية تُحدَّد بأقصى وزن إقلاع (Heavy من 136 طناً فأكثر)، وفئة Super خاصة بـA380؛ هنا تُقدَّر من الكتلة للتوضيح.","مسافات الفصل المعروضة هي حدود الاقتراب المعروفة في قواعد منظمة الطيران المدني الدولي، وبعض الدول تطبّق تصنيفاً أحدث بفئات أكثر.","في الرياح الجانبية الخفيفة قد تبقى إحدى الدوامتين فوق المدرج مدة أطول، وهي أخطر حالة."],
  quiz:[{q:"أقوى الدوامات تتركها الطائرة:",o:["الخفيفة السريعة","الثقيلة البطيئة","الخفيفة البطيئة"],a:1,why:"Γ ∝ W/(ρVb): وزن كبير وسرعة منخفضة."},
        {q:"الدوامات خلف الطائرة:",o:["تصعد","تنزل ببطء","تبقى على نفس الارتفاع"],a:1,why:"كل دوامة تدفع الأخرى للأسفل بسرعة w = Γ/(2πb₀)."}],
  show:{ar:"اعرض دوامات طرف الجناح",fn:()=>{ lrnFlowOn(); lrnSel("wingtip"); }},
  ref:"الموضوع المقابل: الدوامات الخلفية واضطراب الأعقاب (Wake Vortices)."
});
LESSONS.aaf.push({
  ar:"المدى النوعي وسرعة أفضل مدى", en:"Specific range and best-range cruise",
  alt:"منحنى الكيلومترات لكل كيلوغرام وقود مقابل رقم ماخ، مع نقطة أفضل مدى ونقطة الطيران بعيد المدى، وطائرة تطير وخزان وقود يفرغ",
  intro:["المدى النوعي (SAR) هو المسافة لكل كيلوغرام وقود: السرعة مقسومة على استهلاك الوقود. ولأن الاستهلاك يتناسب مع السحب، يكون أفضل مدى للطائرة النفاثة عند أكبر قيمة لـV/D، وهي أسرع من سرعة أقل سحب.",
         "قرب سرعة الصوت يبدأ «ارتفاع سحب الانضغاط» فيهبط المدى بسرعة. لذلك تطير الشركات عادة بسرعة أعلى قليلاً من أفضل مدى (Long Range Cruise) تخسر فيها 1% من المدى وتكسب وقتاً."],
  ctl:[{k:"m",ar:"الكتلة",min:45,max:79,step:0.5,v:70,f:v=>nf(v,1)+" t"},{k:"alt",ar:"الارتفاع",min:25000,max:41000,step:500,v:35000,f:v=>nf(v,0)+" ft"},{k:"mdd",ar:"ماخ ارتفاع السحب Mdd",min:0.72,max:0.86,step:0.005,v:0.79,f:v=>nf(v,3)}],
  init(st){ st.x=0; st.fuel=1; },
  calc(st){ const S=124.6, A=9.45, e=0.78, CD0=0.022, tsfc=1.6e-5, at=isa(st.alt*0.3048), W=st.m*1000*G0, mc=st.mdd-0.108;
    const sar=M=>{ const V=M*at.a, q=0.5*at.rho*V*V, CL=W/(q*S), CD=CD0+CL*CL/(Math.PI*e*A)+(M>mc?20*Math.pow(M-mc,4):0); return V/(tsfc*q*S*CD)/1000; };
    st.sarF=sar; let best=0, bm=0.5; for(let M=0.5;M<=0.9;M+=0.002){ const v=sar(M); if(v>best){ best=v; bm=M; } } st.best=best; st.bm=bm;
    let lrc=bm; for(let M=bm;M<=0.9;M+=0.002){ if(sar(M)>=0.99*best) lrc=M; } st.lrc=lrc; st.at=at; },
  step(st,dt){ st.x+=dt*st.lrc*60; st.fuel-=dt*0.01; if(st.fuel<0.05) st.fuel=1; },
  draw(g,W,H,st,C){
    const r={x:W*0.1,y:H*0.1,w:W*0.55,h:H*0.68}, ymax=Math.ceil(st.best*1.15*20)/20;
    const yt=[]; for(let v=0;v<=ymax+1e-9;v+=ymax>0.4?0.1:0.05) yt.push(Math.round(v*100)/100);
    const P=lplot(g,r,[0.5,0.9],[0,ymax],{xt:[0.5,0.6,0.7,0.8,0.9],yt,yf:t=>nf(t,2),xl:"رقم ماخ",xlr:true,yl:"km لكل kg وقود"});
    const pts=[]; for(let M=0.5;M<=0.9;M+=0.004) pts.push([P.X(M),P.Y(Math.max(0,st.sarF(M)))]); lline(g,pts,C.hyd,2.5);
    ldot(g,P.X(st.bm),P.Y(st.best),6,C.ctrl); ltx(g,"أفضل مدى",P.X(st.bm)-6,P.Y(st.best)-14,{c:C.ctrl,s:11,rtl:true,a:"right"});
    ldot(g,P.X(st.lrc),P.Y(st.sarF(st.lrc)),6,C.power); ltx(g,"LRC",P.X(st.lrc)+8,P.Y(st.sarF(st.lrc))+14,{c:C.power,s:11,m:true,a:"left"});
    const mx=W*0.72, my=H*0.14, mw=W*0.24, mh=H*0.5; g.strokeStyle=C.line; g.lineWidth=1; g.strokeRect(mx,my,mw,mh);
    g.save(); g.beginPath(); g.rect(mx,my,mw,mh); g.clip();
    for(let i=0;i<8;i++){ const y=my+((i*37+st.x)%mh); lline(g,[[mx+mw*0.12,y],[mx+mw*0.32,y+8]],C.line,1); lline(g,[[mx+mw*0.68,y+14],[mx+mw*0.88,y+4]],C.line,1); }
    tplane(g,mx+mw/2,my+mh/2,Math.min(mw*0.6,64),-Math.PI/2,C); g.restore();
    g.fillStyle=mixC(C.panel,C.ink,0.08); g.fillRect(mx,my+mh+14,mw,12); g.fillStyle=C.fuel; g.fillRect(mx,my+mh+14,mw*st.fuel,12); ltx(g,"الوقود",mx+mw,my+mh+38,{c:C.muted,s:10,a:"right",rtl:true});
  },
  ro(st){ return [["أفضل مدى عند ماخ",nf(st.bm,3)],["المدى النوعي الأقصى",nf(st.best,3)+" km/kg"],["سرعة LRC (99% من أفضل مدى)",nf(st.lrc,3)],["سرعة الصوت هنا",nf(st.at.a*KT,0)+" kt"]]; },
  eq:["SAR = V / (c_T · D)","للنفاثة: أفضل مدى عند أكبر V/D","ارتفاع سحب الانضغاط: ΔC_D ≈ 20 (M − M_crit)⁴ ، و M_crit ≈ M_dd − 0.108"],
  note:["النموذج لطائرة بحجم 737-800 بمعاملات تقريبية؛ أرقام التشغيل الفعلية من دليل الأداء.","مع احتراق الوقود تخف الطائرة فيرتفع الارتفاع الأمثل، لذلك تصعد الطائرات على مراحل أثناء الرحلات الطويلة (Step climb)."],
  quiz:[{q:"لماذا لا تطير الشركات بسرعة أفضل مدى تماماً؟",o:["لأنها ممنوعة","لأن سرعة أعلى قليلاً تخسر 1% من المدى وتوفّر وقتاً","لأن المحرك لا يعمل عليها"],a:1,why:"منحنى SAR مسطح قرب القمة، فزيادة السرعة قليلاً تكلّف وقوداً قليلاً جداً."},
        {q:"ما الذي يحد السرعة الاقتصادية القصوى للنفاثات؟",o:["ارتفاع سحب الانضغاط قرب سرعة الصوت","وزن الوقود","درجة الحرارة"],a:0,why:"الموجات الصدمية على الجناح ترفع السحب بسرعة فوق M_crit."}],
  show:{ar:"اعرض المحرك",fn:()=>lrnSel("engine")},
  ref:"الموضوع المقابل: أداء الطيران المستقيم والمدى (Cruise Performance, Range)."
});
