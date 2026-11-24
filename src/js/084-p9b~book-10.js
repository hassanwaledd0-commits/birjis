/* ---------- Book 10: Theory of Flight — 10 more lessons ---------- */
/* side view of a transport aircraft, nose toward +x; ez = engine offset (px, + = below the reference line) */
function kSide(g,x,y,s,pit,C,o){ o=o||{}; g.save(); g.translate(x,y); g.rotate(-pit); g.strokeStyle=C.ink; g.lineWidth=1.2;
  g.fillStyle=mixC(C.panel,C.struct,0.3); g.beginPath(); g.moveTo(-s*0.5,-s*0.035); g.lineTo(-s*0.36,-s*0.05); g.lineTo(s*0.4,-s*0.05); g.quadraticCurveTo(s*0.5,-s*0.045,s*0.5,0); g.quadraticCurveTo(s*0.49,s*0.05,s*0.4,s*0.05); g.lineTo(-s*0.32,s*0.05); g.lineTo(-s*0.5,-s*0.01); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-s*0.36,-s*0.05); g.lineTo(-s*0.46,-s*0.2); g.lineTo(-s*0.5,-s*0.2); g.lineTo(-s*0.49,-s*0.03); g.closePath(); g.fill(); g.stroke();
  g.fillStyle=mixC(C.panel,C.struct,0.55); g.beginPath(); g.ellipse(-s*0.02,s*0.03,s*0.12,s*0.014,-0.05,0,Math.PI*2); g.fill(); g.stroke();
  if(o.eng!==false){ const ez=o.ez==null?s*0.06:o.ez; g.fillStyle=mixC(C.panel,C.ink,0.35); g.beginPath(); g.ellipse(s*0.03,ez,s*0.055,s*0.022,0,0,Math.PI*2); g.fill(); g.stroke(); lline(g,[[s*0.0,s*0.03],[s*0.03,ez-s*0.02]],C.ink,1.2); }
  g.restore(); }
/* ---- 1 ---- */
const bpSig=gb=>(1-0.66*gb)/(1.055+3.7*gb);
LK("tof",{
  ar:"الطائرة ذات الجناحين: التداخل بين الجناحين", en:"Biplane interference and induced drag",
  alt:"منظر أمامي لطائرة بجناحين بينهما فجوة وسهام الهواء النازل بين الجناحين ودوامات الأطراف، ومنحنى معامل السحب المستحث مع نسبة الفجوة إلى الباع",
  intro:["في الطائرة ذات الجناحين يحمل الجناحان الوزن معاً، فيبدو أن السحب المستحث يجب أن يقل إلى النصف. لكن كل جناح يقع في الهواء النازل الذي يسببه الآخر، فيزيد سحب كل منهما.",
         "قدّر برانتل هذا التداخل بمعامل σ يعتمد على نسبة الفجوة إلى الباع. السحب المستحث للجناحين معاً = (1 + σ)/2 من سحب جناح واحد بنفس الباع. الفجوة الأكبر تقلل التداخل، لكن الدعامات تصبح أطول وأثقل."],
  ctl:[{k:"gb",ar:"الفجوة ÷ الباع",min:0.05,max:0.4,step:0.01,v:0.15,f:v=>nf(v,2)},{k:"b",ar:"الباع",min:6,max:14,step:0.1,v:9,f:v=>nf(v,1)+" m"},{k:"W",ar:"الوزن",min:600,max:2000,step:10,v:1000,f:v=>nf(v,0)+" kg"},{k:"V",ar:"السرعة",min:50,max:120,step:1,v:70,f:v=>nf(v,0)+" kt"}],
  pre:[{ar:"طائرة ألعاب جوية",set:{gb:0.17,b:6.1,W:680,V:80}},{ar:"طائرة تدريب قديمة",set:{gb:0.16,b:8.9,W:830,V:60}}],
  calc(st){ st.sig=bpSig(st.gb); st.k=(1+st.sig)/2; const q=0.5*1.225*(st.V/KT)**2, L=st.W*G0; st.Dm=L*L/(Math.PI*q*st.b*st.b); st.Db=st.k*st.Dm; st.beq=st.b/Math.sqrt(st.k); st.G=st.gb*st.b; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, half=r.w*0.44, cy=r.y+r.h*0.5, G=Math.min(r.h*0.62,st.gb*2*half), y1=cy-G/2, y2=cy+G/2;
    for(let i=0;i<7;i++){ const x=cx+half*(-0.8+i*0.267), L=10+34*st.sig, f=(st.t*0.8+i*0.37)%1, y=y1+8+f*Math.max(4,G-26); if(Math.abs(x-cx)>16) larrow(g,x,y,x,y+L*0.5,C.hyd,1.4,5); }
    g.fillStyle=mixC(C.panel,C.struct,0.45); g.strokeStyle=C.ink; g.lineWidth=1.2; [y1,y2].forEach(y=>{ g.fillRect(cx-half,y-3,2*half,6); g.strokeRect(cx-half,y-3,2*half,6); });
    [-0.5,0.5].forEach(f=>{ lline(g,[[cx+f*half,y1+3],[cx+f*half,y2-3]],C.ink,1.6); lline(g,[[cx+f*half,y1+3],[cx+f*half*0.3,y2-3]],C.muted,0.8); });
    g.fillStyle=mixC(C.panel,C.struct,0.3); g.beginPath(); g.arc(cx,y2-4,13,0,Math.PI*2); g.fill(); g.stroke();
    [[cx-half,y1],[cx+half,y1],[cx-half,y2],[cx+half,y2]].forEach(([x,y],i)=>{ const s=x<cx?-1:1; g.strokeStyle=mixC(C.panel,C.power,0.7); g.lineWidth=1.3; g.beginPath(); g.arc(x,y,9,0,Math.PI*2); g.stroke(); const a=st.t*4*s+i; ldot(g,x+9*Math.cos(a),y+9*Math.sin(a),2.5,C.power); });
    ltx(g,"الفجوة G = "+nf(st.G,2)+" m",cx,r.y+14,{s:12,w:600,rtl:true}); ltx(g,"σ = "+nf(st.sig,2),cx,r.y+r.h-10,{s:12,m:true}); },
  plot(st){ return {x:[0.05,0.4],y:[0.5,1],xl:"G/b",yl:"(1+σ)/2",curves:[{f:x=>(1+bpSig(x))/2,c:"hyd"}],hl:[{y:1,c:"power",t:"لو كان σ = 1"},{y:0.5,c:"ctrl",t:"لو انعدم التداخل"}],dots:[{x:st.gb,y:st.k}]}; },
  ro(st){ return [["معامل التداخل σ",nf(st.sig,3)],["نسبة السحب المستحث",nf(st.k*100,0)+"%"],["سحب جناح واحد بنفس الباع",nf(st.Dm,0)+" N"],["سحب الجناحين معاً",nf(st.Db,0)+" N"],["باع الجناح الواحد المكافئ",nf(st.beq,2)+" m"]]; },
  eq:["σ ≈ (1 − 0.66 G/b) / (1.055 + 3.7 G/b)","D_i = (1 + σ)/2 · L² / (π q b²)","الباع المكافئ = b / √((1 + σ)/2)"],
  note:["الصيغة تقريب برانتل لجناحين متساويين في الباع بلا إزاحة أمامية، والسحب المستحث محسوب لتوزيع رفع مثالي (e = 1).","تركت الطائرات الحديثة هذا التصميم لأن الدعامات والأسلاك تضيف سحباً كبيراً، لكنه ما زال في طائرات الألعاب الجوية لخفته وقوة هيكله."],
  quiz:[{q:"إذا كانت σ = 0.6، فسحب الجناحين معاً مقارنة بجناح واحد بنفس الباع:",o:["80%","50%","60%"],a:0,why:"(1 + 0.6)/2 = 0.8."},
        {q:"زيادة الفجوة بين الجناحين:",o:["تقلل التداخل والسحب المستحث","تزيده","لا تؤثر"],a:0,why:"σ تقل مع G/b."}],
  ref:"الموضوع المقابل: نظرية الطائرة ذات الجناحين (Biplane Theory)."
});
/* ---- 2 ---- */
LK("tof",{
  ar:"الهواء النازل عند الذيل", en:"Downwash at the horizontal tail",
  alt:"منظر جانبي لجناح وذيل أفقي مع خطوط تيار تنحرف للأسفل خلف الجناح وتصل الذيل بزاوية أقل، ومنحنى زاوية هجوم الذيل مع زاوية هجوم الجناح",
  intro:["الجناح الذي يولد الرفع يدفع الهواء خلفه إلى الأسفل. الذيل الأفقي يقع في هذا الهواء النازل، فيرى زاوية هجوم أقل من زاوية الطائرة بمقدار ε.",
         "لأن ε تزداد مع زاوية الهجوم، يتأثر الذيل بتغير الزاوية أقل مما نتوقع، بنسبة (1 − dε/dα). هذا يقلل مساهمة الذيل في الاستقرار، والجناح ذو نسبة الباع الصغيرة يرسل هواءً نازلاً أقوى."],
  ctl:[{k:"AR",ar:"نسبة الباع",min:4,max:12,step:0.1,v:8,f:v=>nf(v,1)},{k:"al",ar:"زاوية هجوم الجناح",min:-2,max:14,step:0.1,v:5,f:v=>nf(v,1)+"°"},{k:"it",ar:"زاوية تركيب الذيل",min:-4,max:2,step:0.1,v:-2,f:v=>nf(v,1)+"°"},{k:"a0",ar:"زاوية الرفع الصفري للجناح",min:-4,max:0,step:0.1,v:-2,f:v=>nf(v,1)+"°"}],
  calc(st){ st.a=2*Math.PI*st.AR/(st.AR+2); st.de=2*st.a/(Math.PI*st.AR); st.CL=st.a*(st.al-st.a0)*D2R; st.eps=st.de*(st.al-st.a0); st.at=st.al-st.eps+st.it; st.eta=1-st.de; },
  scene(g,r,st,C){ const ch=r.w*0.26, wx=r.x+r.w*0.1, wy=r.y+r.h*0.42, xte=wx+ch, E3=st.eps*3*D2R, tx=r.x+r.w*0.7, tch=ch*0.42;
    const dyAt=(x,k)=>{ const fall=Math.exp(-Math.abs(k)*0.35); if(x<=wx) return 0; if(x<=xte) return Math.tan(E3)*0.25*(x-wx)*fall; return (Math.tan(E3)*0.25*ch+Math.tan(E3)*(x-xte))*fall; };
    const ty=wy+dyAt(tx,0)*0.85+r.h*0.05;
    for(let k=-3;k<=3;k++){ if(k===0) continue; const y0=wy+k*r.h*0.11, pts=[]; for(let i=0;i<=60;i++){ const x=r.x+r.w*i/60; pts.push([x,y0+dyAt(x,k)]); } lline(g,pts,mixC(C.panel,C.hyd,0.45),1.2);
      for(let j=0;j<4;j++){ const f=(st.t*0.25+j/4+k*0.07+1)%1, x=r.x+r.w*f; ldot(g,x,y0+dyAt(x,k),2.2,C.hyd); } }
    kFoil(g,wx,wy,ch,st.al,C,{m:0.02,p:0.4,t:0.12}); kFoil(g,tx,ty,tch,st.al+st.it,C,{m:0,t:0.1});
    const L=r.w*0.2; lline(g,[[tx,ty],[tx-L,ty]],C.muted,1.2,[4,3]); lline(g,[[tx,ty],[tx-L,ty-L*Math.tan(E3)]],C.power,2);
    ltx(g,"ε (مضخّمة ×3)",tx-L*0.5,ty+16,{c:C.power,s:10,rtl:true});
    ltx(g,"ε = "+nf(st.eps,2)+"°",r.x+r.w*0.3,r.y+r.h*0.93,{s:12,w:600,m:true,c:C.power}); ltx(g,"زاوية الذيل "+nf(st.at,2)+"°",r.x+r.w*0.7,r.y+r.h*0.93,{s:12,w:600,rtl:true}); },
  plot(st){ return {x:[-2,14],y:[-8,14],xl:"α (°)",yl:"α_ذيل (°)",curves:[{f:a=>a+st.it,c:"muted",dash:[5,4]},{f:a=>a-st.de*(a-st.a0)+st.it,c:"hyd"}],hl:[{y:0,c:"line"}],dots:[{x:st.al,y:st.at}],leg:[{c:"hyd",t:"مع الهواء النازل"},{c:"muted",t:"بلا هواء نازل",dash:[5,4]}]}; },
  ro(st){ return [["C_L للجناح",nf(st.CL,3)],["dε/dα",nf(st.de,3)],["زاوية الهواء النازل ε",nf(st.eps,2)+"°"],["زاوية هجوم الذيل",nf(st.at,2)+"°"],["فعالية الذيل (1 − dε/dα)",nf(st.eta*100,0)+"%"]]; },
  eq:["ε = (dε/dα)(α − α₀)","dε/dα ≈ 2a / (π AR) ، a = 2π AR / (AR + 2)","α_tail = α − ε + i_t"],
  note:["التقدير 2a/(πAR) يخص نقطة بعيدة خلف جناح بيضوي؛ عند الذيل الحقيقي القيمة أقل قليلاً وتتأثر بارتفاع الذيل عن أثر الجناح.","في الرسم زاوية انحراف التيار مضخّمة ثلاث مرات لتُرى."],
  quiz:[{q:"لماذا يرى الذيل زاوية هجوم أقل من الجناح؟",o:["الجناح يدفع الهواء خلفه للأسفل","لأن الذيل أصغر","بسبب المحرك"],a:0,why:"الهواء النازل يقلل الزاوية بمقدار ε."},
        {q:"جناح بنسبة باع أكبر يجعل dε/dα:",o:["أصغر","أكبر","لا يتغير"],a:0,why:"dε/dα ≈ 2a/(πAR) تقل مع AR."}],
  show:{ar:"اعرض الذيل الأفقي",fn:()=>lrnSel("stabilizer",1)},
  ref:"الموضوع المقابل: الهواء النازل والاستقرار الطولي (Downwash at the Tail)."
});
/* ---- 3 ---- */
LK("tof",{
  ar:"فعالية القلاب البسيط", en:"Plain flap effectiveness",
  alt:"مقطع جناح بقلاب خلفي قابل للإنزال وسهم رفع، ومنحنيا زيادة معامل الرفع مع زاوية القلاب نظرياً وبعد تصحيح انفصال الهواء",
  intro:["إنزال القلاب يزيد تحدب المقطع، فيزيد الرفع عند نفس زاوية الهجوم. نظرية المقطع الرقيق تعطي زيادة الرفع = 2π · τ · δ، حيث τ تعتمد على نسبة وتر القلاب إلى وتر الجناح.",
         "القلاب الذي وتره ربع وتر الجناح يعطي نحو 60% من أثر تدوير المقطع كله. لكن بعد نحو 10–15° ينفصل الهواء فوق القلاب البسيط فتقل فعاليته، ولهذا تستخدم طائرات النقل قلابات مشقوقة تعيد تنشيط الهواء."],
  ctl:[{k:"E",ar:"وتر القلاب ÷ وتر الجناح",min:0.1,max:0.4,step:0.01,v:0.25,f:v=>nf(v*100,0)+"%"},{k:"fd",ar:"زاوية القلاب",min:0,max:40,step:1,v:20,f:v=>nf(v,0)+"°"},{k:"al",ar:"زاوية الهجوم",min:-4,max:12,step:0.5,v:4,f:v=>nf(v,1)+"°"}],
  calc(st){ st.tau=flapTau(st.E); st.eff=d=>d<=10?1:Math.max(0.5,1-0.5*(d-10)/30); const d=st.fd*D2R, th=Math.acos(clamp(2*st.E-1,-1,1));
    st.dCLi=2*Math.PI*st.tau*d; st.dCL=st.dCLi*st.eff(st.fd); st.daL0=-st.tau*st.fd*st.eff(st.fd); st.cl0=2*Math.PI*(st.al+2.08)*D2R; st.cl=st.cl0+st.dCL; st.dcm=-(d/2)*Math.sin(th)*(1-Math.cos(th))*st.eff(st.fd); },
  scene(g,r,st,C){ const ch=r.w*0.62, ox=r.x+r.w*0.16, oy=r.y+r.h*0.5; const P=kFoil(g,ox,oy,ch,st.al,C,{m:0.02,p:0.4,t:0.12,E:st.E,fd:st.fd});
    const h=P(1-st.E,P.yc(1-st.E)); ldot(g,h[0],h[1],3.5,C.power); const q=P(0.25,0.03), L=r.h*0.17*st.cl; larrow(g,q[0],q[1],q[0],q[1]-L,C.ctrl,3,10);
    ltx(g,"c_l = "+nf(st.cl,2),q[0]+10,q[1]-L-4,{s:12,w:600,a:"left",m:true}); ltx(g,"المفصل",h[0],h[1]+18,{c:C.power,s:10,rtl:true});
    ltx(g,"τ = "+nf(st.tau,3),r.x+r.w*0.5,r.y+r.h*0.92,{s:12,m:true}); },
  plot(st){ return {x:[0,40],y:[0,2*Math.PI*flapTau(0.4)*40*D2R*1.05],xl:"δ (°)",yl:"Δc_l",curves:[{f:d=>2*Math.PI*st.tau*d*D2R,c:"muted",dash:[5,4]},{f:d=>2*Math.PI*st.tau*d*D2R*st.eff(d),c:"hyd"}],dots:[{x:st.fd,y:st.dCL}],leg:[{c:"muted",t:"نظري",dash:[5,4]},{c:"hyd",t:"مع الانفصال"}]}; },
  ro(st){ return [["فعالية القلاب τ",nf(st.tau,3)],["Δc_l نظري",nf(st.dCLi,3)],["Δc_l بعد التصحيح",nf(st.dCL,3)],["تغير زاوية الرفع الصفري",nf(st.daL0,2)+"°"],["c_l عند α",nf(st.cl,2)],["تغير العزم Δc_m",nf(st.dcm,3)]]; },
  eq:["τ = 1 − (θ_h − sin θ_h)/π ، cos θ_h = 2E − 1","Δc_l = 2π τ δ (نظري)","Δα₀ = −τ δ","Δc_m(¼) = −(δ/2) sin θ_h (1 − cos θ_h)"],
  note:["التصحيح بعد 10° تقريب تجريبي لانفصال الهواء فوق القلاب البسيط؛ القلابات المشقوقة ومتعددة الأجزاء تحافظ على فعالية أعلى.","المقطع المرسوم NACA 2412، والمنحنيات خطية لا تُظهر الانهيار."],
  quiz:[{q:"قلاب وتره 25% من وتر الجناح فعاليته τ تقارب:",o:["0.25","0.6","1"],a:1,why:"من الصيغة τ ≈ 0.61."},
        {q:"لماذا تقل فعالية القلاب البسيط عند الزوايا الكبيرة؟",o:["ينفصل الهواء فوق القلاب","يصبح أثقل","تقل السرعة"],a:0,why:"الهواء لا يستطيع الالتفاف حول الزاوية الحادة."}],
  show:{ar:"اعرض القلابات على الطائرة",fn:()=>lrnSel("flaps",1)},
  ref:"الموضوع المقابل: نظرية المقطع الرقيق والقلابات (Thin Airfoil Theory: Flaps)."
});
/* ---- 4 ---- */
LK("tof",{
  ar:"تدرج الريح قرب الأرض أثناء الاقتراب", en:"Wind gradient on final approach",
  alt:"منظر جانبي لمسار الاقتراب وطائرة تنزل نحو المدرج وسهام ريح تقصر كلما اقتربت من الأرض، ومنحنى سرعة الريح مع الارتفاع",
  intro:["الريح تبطؤ قرب الأرض بسبب الاحتكاك. عند الهبوط بريح أمامية تنزل الطائرة إلى هواء أبطأ، وبسبب قصورها تحافظ لحظياً على سرعتها الأرضية، فتنقص سرعتها الهوائية.",
         "لهذا يضيف الطيارون هامشاً لسرعة الاقتراب. قاعدة شائعة في طائرات النقل: نصف الريح الثابتة مع كامل الهبّة، بحد أدنى 5 وأقصى 20 عقدة، مع الاستعداد لزيادة القدرة في آخر مئات الأقدام."],
  ctl:[{k:"W10",ar:"الريح المبلّغ عنها (10 m)",min:0,max:40,step:1,v:20,f:v=>nf(v,0)+" kt"},{k:"gu",ar:"الهبّة فوقها",min:0,max:20,step:1,v:8,f:v=>nf(v,0)+" kt"},{k:"ex",ar:"أس التدرج (خشونة السطح)",min:0.1,max:0.3,step:0.01,v:0.14,f:v=>nf(v,2)},{k:"vr",ar:"سرعة المرجع V_REF",min:110,max:160,step:1,v:140,f:v=>nf(v,0)+" kt"}],
  pre:[{ar:"أرض مفتوحة",set:{ex:0.14}},{ar:"مدينة وأشجار",set:{ex:0.28}},{ar:"بحر هادئ",set:{ex:0.1}}],
  calc(st){ st.wf=h=>st.W10*Math.pow(Math.max(h,0.5)/10,st.ex); st.w500=st.wf(152.4); st.w50=st.wf(15.24); st.loss=st.w500-st.w50; st.add=Math.max(5,Math.min(20,0.5*st.W10+st.gu)); st.vapp=st.vr+st.add; },
  scene(g,r,st,C){ const gy=r.y+r.h*0.86, H=r.h*0.76, x0=r.x+r.w*0.03, ftm=3.2808;
    g.fillStyle=mixC(C.panel,C.ctrl,0.18); g.fillRect(r.x,gy,r.w,r.y+r.h-gy); g.fillStyle=mixC(C.panel,C.ink,0.5); g.fillRect(r.x+r.w*0.72,gy-2,r.w*0.27,5);
    const wmax=st.wf(1000/ftm)+0.5, sc=r.w*0.3/Math.max(wmax,1), tips=[];
    [20,50,100,200,300,500,700,1000].forEach(hf=>{ const y=gy-H*hf/1000, w=st.wf(hf/ftm)*sc; if(w>3) larrow(g,x0+w,y,x0,y,C.hyd,1.5,6); tips.push([x0+w,y]); ltx(g,nf(hf,0)+" ft",x0+w+5,y,{s:9,a:"left",c:C.muted,m:true}); });
    lline(g,tips,mixC(C.panel,C.hyd,0.5),1,[3,3]);
    const ax0=r.x+r.w*0.42, ax1=r.x+r.w*0.78; lline(g,[[ax0,gy-H],[ax1,gy]],C.muted,1,[5,4]);
    const f=(st.t*0.07)%1, hf=1000*(1-f), ax=ax0+(ax1-ax0)*f, ay=gy-H*(1-f); kSide(g,ax,ay-4,r.w*0.13,-3*D2R,C);
    const ias=st.vapp-(st.wf(1000/ftm)-st.wf(Math.max(hf,1)/ftm)); ltx(g,nf(hf,0)+" ft · السرعة الهوائية دون زيادة القدرة "+nf(ias,0)+" kt",r.x+r.w*0.5,r.y+12,{s:11,w:600,rtl:true,c:ias<st.vr?C.power:C.ink}); },
  plot(st){ const pts=[]; for(let h=1;h<=1000;h+=10) pts.push([st.wf(h/3.2808),h]); return {x:[0,Math.ceil((st.wf(1000/3.2808)+3)/5)*5],y:[0,1000],xl:"الريح kt",yl:"ft",lines:[{pts,c:"hyd"}],dots:[{x:st.w500,y:500,t:"500 ft"},{x:st.w50,y:50,c:"fuel",t:"50 ft"}]}; },
  ro(st){ return [["الريح عند 500 ft",nf(st.w500,1)+" kt"],["الريح عند 50 ft",nf(st.w50,1)+" kt"],["نقص السرعة بينهما",nf(st.loss,1)+" kt"],["الإضافة على V_REF",nf(st.add,0)+" kt"],["سرعة الاقتراب",nf(st.vapp,0)+" kt"]]; },
  eq:["V(h) = V₁₀ (h/10)^n ، n ≈ 1/7 فوق أرض مفتوحة","نقص السرعة الهوائية ≈ V(500 ft) − V(50 ft)","V_APP = V_REF + max(5, min(20, ½ الريح + الهبّة))"],
  note:["قاعدة الإضافة المعروضة شائعة في طائرات النقل، والرقم الملزم دائماً هو ما في دليل الطائرة المعنية.","التدرج أشد فوق الأرض الخشنة (مبانٍ وأشجار) وفي الليل حين يكون الهواء مستقراً."],
  quiz:[{q:"عند النزول في تدرج ريح أمامية تميل السرعة الهوائية إلى:",o:["الانخفاض","الزيادة","الثبات"],a:0,why:"الريح الأمامية تقل قرب الأرض والسرعة الأرضية لا تتغير فوراً."},
        {q:"ريح 20 عقدة وهبّة 10، الإضافة حسب القاعدة:",o:["20 kt","10 kt","30 kt"],a:0,why:"½ × 20 + 10 = 20، وهو الحد الأقصى."}],
  ref:"الموضوع المقابل: الطبقة الحدية الجوية وأثرها على الاقتراب (Wind Shear and Gradient)."
});
/* ---- 5 ---- */
function rfxInt(mPct,rf,E){ const m=mPct/100, p=0.4, r=Math.tan(rf*D2R), dz=x=>(m===0?0:(x<p?2*m/(p*p)*(p-x):2*m/((1-p)*(1-p))*(p-x)))+(x>1-E?r:0); let i0=0,i1=0,i2=0; const N=600;
  for(let i=0;i<N;i++){ const th=(i+0.5)/N*Math.PI, x=(1-Math.cos(th))/2, d=dz(x)*Math.PI/N; i0+=d*(Math.cos(th)-1); i1+=d*Math.cos(th); i2+=d*Math.cos(2*th); }
  return {aL0:-i0/Math.PI/D2R+0, cm0:Math.PI/4*(2/Math.PI*i2-2/Math.PI*i1)}; }
LK("tof",{
  ar:"الجناح الطائر والمقطع المعكوس الحافة", en:"Flying wings and reflexed airfoils",
  alt:"مقطع جناح بحافة خلفية مرفوعة قليلاً مع علامتي مركز الثقل والمركز الهوائي وسهمي الرفع والوزن، ومنحنى عزم الانقلاب مع معامل الرفع يقطع الصفر عند نقطة التوازن",
  intro:["الطائرة بلا ذيل يجب أن تتوازن بجناحها وحده. لكي تكون مستقرة يجب أن يكون مركز ثقلها أمام المركز الهوائي، وعندها لا تتوازن عند رفع موجب إلا إذا كان عزم المقطع عند الرفع الصفري موجباً (رافعاً للأنف).",
         "المقطع المحدّب العادي عزمه سالب. الحل: رفع الحافة الخلفية قليلاً (الانعكاس)، فيصبح العزم صفراً أو موجباً. الثمن رفع أقل عند نفس الزاوية."],
  ctl:[{k:"m",ar:"التحدب",min:0,max:4,step:0.1,v:2,f:v=>nf(v,1)+"%"},{k:"rf",ar:"رفع الحافة الخلفية",min:0,max:12,step:0.5,v:6,f:v=>nf(v,1)+"°"},{k:"E",ar:"طول الجزء المرفوع",min:0.1,max:0.3,step:0.01,v:0.2,f:v=>nf(v*100,0)+"% c"},{k:"sm",ar:"هامش الاستقرار",min:0,max:15,step:0.5,v:5,f:v=>nf(v,1)+"% c"}],
  pre:[{ar:"مقطع عادي بلا انعكاس",set:{m:2,rf:0}},{ar:"جناح طائر نموذجي",set:{m:2,rf:6,E:0.2,sm:5}},{ar:"مقطع متماثل",set:{m:0,rf:0}}],
  calc(st){ const a=rfxInt(st.m,st.rf,st.E), b=rfxInt(st.m,0,st.E); st.aL0=a.aL0; st.cm0=a.cm0; st.cmN=b.cm0; st.dcm=a.cm0-b.cm0; st.CLt=st.sm>0?st.cm0/(st.sm/100):NaN; st.alt=st.CLt/(2*Math.PI)/D2R+st.aL0; st.ok=st.sm>0&&st.CLt>0.1&&st.CLt<1.3; },
  scene(g,r,st,C){ const ch=r.w*0.66, ox=r.x+r.w*0.14, oy=r.y+r.h*0.5, aD=isFinite(st.alt)?clamp(st.alt,-4,12):0; const P=kFoil(g,ox,oy,ch,aD,C,{m:st.m/100,p:0.4,t:0.12,E:st.E,fd:-st.rf,camber:true});
    const ac=P(0.25,0), cg=P(0.25-st.sm/100,0); ldot(g,ac[0],ac[1],5,C.hyd); ldot(g,cg[0],cg[1],5,C.power);
    ltx(g,"المركز الهوائي",ac[0]+6,ac[1]+r.h*0.2,{s:10,c:C.hyd,rtl:true,a:"left"}); lline(g,[[ac[0],ac[1]],[ac[0]+4,ac[1]+r.h*0.18]],C.hyd,1,[2,2]);
    ltx(g,"مركز الثقل",cg[0]-6,cg[1]+r.h*0.27,{s:10,c:C.power,rtl:true,a:"right"}); lline(g,[[cg[0],cg[1]],[cg[0]-4,cg[1]+r.h*0.25]],C.power,1,[2,2]);
    if(st.ok){ larrow(g,ac[0],ac[1],ac[0],ac[1]-r.h*0.3,C.ctrl,2.5,9); larrow(g,cg[0],cg[1],cg[0],cg[1]+r.h*0.14,C.power,2.5,9); }
    const R=22, x=ac[0]+ch*0.18, y=r.y+r.h*0.16, s=st.cm0>=0?-1:1; g.strokeStyle=C.accent; g.lineWidth=2; g.beginPath(); g.arc(x,y,R,Math.PI*0.15,Math.PI*1.25,s>0); g.stroke();
    ltx(g,"C_m0 = "+nf(st.cm0,3),x+R+6,y,{s:11,a:"left",m:true,c:C.accent});
    ltx(g,st.ok?"تتوازن عند C_L = "+nf(st.CLt,2):"لا يوجد توازن مستقر بالرفع الموجب",r.x+r.w*0.5,r.y+r.h*0.94,{s:12,w:600,rtl:true,c:st.ok?C.ctrl:C.power}); },
  plot(st){ const sm=st.sm/100; return {x:[0,1.3],y:[-0.1,0.1],xl:"C_L",yl:"C_m,cg",curves:[{f:c=>st.cmN-sm*c,c:"muted",dash:[5,4]},{f:c=>st.cm0-sm*c,c:"hyd"}],hl:[{y:0,c:"line"}],dots:st.ok?[{x:st.CLt,y:0,t:"توازن"}]:[],leg:[{c:"hyd",t:"مع الانعكاس"},{c:"muted",t:"بلا انعكاس",dash:[5,4]}]}; },
  ro(st){ return [["عزم المقطع C_m0",nf(st.cm0,4)],["إضافة الانعكاس",nf(st.dcm,4)],["زاوية الرفع الصفري",nf(st.aL0,2)+"°"],["C_L عند التوازن",isFinite(st.CLt)?nf(st.CLt,3):"—"],["الحالة",st.ok?"مستقرة ومتوازنة":st.sm<=0?"غير مستقرة (لا هامش)":"لا تتوازن بالرفع المطلوب"]]; },
  eq:["C_m,cg = C_m0 − (h_n − h) C_L","التوازن: C_L = C_m0 / (h_n − h)","الانعكاس يضيف: ΔC_m0 = (δ/2) sin θ_h (1 − cos θ_h)"],
  note:["حسابات نظرية المقطع الرقيق لمقطع ثنائي البعد؛ الأجنحة الطائرة الحقيقية تستعين أيضاً بالميلان للخلف والتواء الأطراف لتحقيق التوازن.","هامش الاستقرار هنا نسبة من الوتر بين مركز الثقل والمركز الهوائي."],
  quiz:[{q:"لماذا يحتاج الجناح الطائر المستقر عزماً موجباً عند الرفع الصفري؟",o:["ليتوازن برفع موجب ومركز الثقل أمام المركز الهوائي","ليطير أسرع","لتقليل الوزن"],a:0,why:"C_L = C_m0 / الهامش، فيجب أن يكون C_m0 موجباً."},
        {q:"رفع الحافة الخلفية يجعل زاوية الرفع الصفري:",o:["أقرب إلى الصفر أو موجبة","أكثر سالبية","لا تتغير"],a:0,why:"الانعكاس يقلل التحدب الفعلي."}],
  ref:"الموضوع المقابل: الطائرات عديمة الذيل (Tailless Aircraft)."
});
/* ---- 6 ---- */
LK("tof",{
  ar:"الانزلاق الأمامي: نزول أشد بلا زيادة سرعة", en:"The forward slip: descending without speeding up",
  alt:"منظر علوي لطائرة تطير بزاوية انزلاق عن مسارها والدفة مزاحة، ومنظر أمامي صغير يبين الميل، ومنحنى معدل الهبوط مع زاوية الانزلاق",
  intro:["في الانزلاق الأمامي يضغط الطيار الدفة في اتجاه ويميل الجناحين بالجنيحات في الاتجاه الآخر. تطير الطائرة بزاوية مع الهواء، فيواجه جانب جسمها التيار ويزيد السحب كثيراً.",
         "النتيجة نزول أشد بنفس السرعة، وهي طريقة قديمة لتصحيح الاقتراب العالي في الطائرات بلا قلابات. الجسم المائل يولد قوة جانبية يوازنها الميل، لذلك يلزم ميل أكبر لانزلاق أكبر."],
  ctl:[{k:"be",ar:"زاوية الانزلاق β",min:0,max:20,step:0.5,v:12,f:v=>nf(v,1)+"°"},{k:"V",ar:"السرعة",min:55,max:90,step:1,v:65,f:v=>nf(v,0)+" kt"}],
  calc(st){ const S=16, Wt=1000*G0, rho=1.225; st.fn=(bd,V)=>{ const q=0.5*rho*(V/KT)**2, b=bd*D2R, phi=Math.asin(clamp(q*S*0.8*b/Wt,0,0.99)), CL=Wt*Math.cos(phi)/(q*S), CD=0.032+0.055*CL*CL+0.9*b*b, D=q*S*CD, gam=Math.asin(clamp(D/Wt,0,0.9)); return {phi:phi/D2R,CL,CD,gam:gam/D2R,sink:(V/KT)*Math.sin(gam)*196.85}; };
    const a=st.fn(st.be,st.V), z=st.fn(0,st.V); st.phi=a.phi; st.CL=a.CL; st.CD=a.CD; st.gam=a.gam; st.sink=a.sink; st.s0=z.sink; st.g0=z.gam; st.dr=st.be*0.065/0.07; st.da=(0.09*st.be-0.008*st.dr)/0.15; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.45, cy=r.y+r.h*0.45, s=Math.min(r.w*0.5,r.h*0.62), b=st.be*D2R;
    larrow(g,r.x+r.w*0.06,r.y+r.h*0.08,r.x+r.w*0.6,r.y+r.h*0.08,C.ink,1.6,8); ltx(g,"اتجاه الطيران",r.x+r.w*0.33,r.y+r.h*0.08-11,{s:10,rtl:true,c:C.muted});
    for(let i=0;i<5;i++){ const y=cy-s*0.4+i*s*0.2, f=(st.t*0.6+i*0.21)%1, x=r.x+r.w*0.95-f*r.w*0.25; larrow(g,x,y,x-r.w*0.06,y,mixC(C.panel,C.hyd,0.7),1.3,5); }
    tplane(g,cx,cy,s,-b,C); g.save(); g.translate(cx,cy); g.rotate(-b); const dr=clamp(st.dr,0,30)*D2R; lline(g,[[-s*0.47,0],[-s*0.47-s*0.1*Math.cos(dr),s*0.1*Math.sin(dr)]],C.power,3); g.restore();
    const fx=r.x+r.w*0.78, fy=r.y+r.h*0.8, L=r.w*0.16, p=st.phi*D2R; g.save(); g.translate(fx,fy); g.rotate(p); lline(g,[[-L,0],[L,0]],C.ink,3); ldot(g,0,0,6,mixC(C.panel,C.struct,0.4)); lline(g,[[0,-6],[0,-14]],C.ink,2); g.restore();
    lline(g,[[fx-L,fy],[fx+L,fy]],C.muted,1,[3,3]); ltx(g,"الميل "+nf(st.phi,1)+"°",fx,fy+22,{s:11,rtl:true});
    ltx(g,"β = "+nf(st.be,1)+"°",cx,r.y+r.h*0.92,{s:12,w:600,m:true}); },
  plot(st){ const mx=st.fn(20,st.V).sink; return {x:[0,20],y:[0,Math.ceil(mx/200)*200],xl:"β (°)",yl:"ft/min",curves:[{f:b=>st.fn(b,st.V).sink,c:"hyd"}],hl:[{y:st.s0,c:"muted",t:"بلا انزلاق"}],dots:[{x:st.be,y:st.sink}]}; },
  ro(st){ return [["الميل اللازم",nf(st.phi,1)+"°"],["الدفة",nf(st.dr,1)+"°"],["الجنيحات (عكس الدفة)",nf(st.da,1)+"°"],["زاوية الانحدار",nf(st.gam,1)+"° (بلا انزلاق "+nf(st.g0,1)+"°)"],["معدل الهبوط",nf(st.sink,0)+" ft/min"]]; },
  eq:["توازن جانبي: W sin φ = q S C_Yβ β","C_D = C_D0 + k C_L² + C_Dβ β²","sin γ = D / W ، معدل الهبوط = V sin γ"],
  note:["أرقام لطائرة تدريب صغيرة كتلتها نحو طن، والمعاملات تقريبية.","بعض أدلة الطائرات تمنع الانزلاق مع القلابات المنزلة لأنه قد يغير تدفق الهواء على الذيل."],
  quiz:[{q:"في الانزلاق الأمامي تكون الدفة والجنيحات:",o:["متعاكستين","في نفس الاتجاه","محايدتين"],a:0,why:"الدفة تحافظ على الانزلاق والجنيحات تمنع الدوران."},
        {q:"لماذا يزيد معدل الهبوط دون زيادة السرعة؟",o:["جانب الجسم يواجه الهواء فيزيد السحب","المحرك يتوقف","الجناح يفقد كل الرفع"],a:0,why:"السحب الإضافي يحوَّل إلى انحدار أشد."}],
  show:{ar:"اعرض الدفة",fn:()=>lrnSel("fin",1)},
  ref:"الموضوع المقابل: الطيران المنزلق والقوى الجانبية (Sideslip)."
});
/* ---- 7 ---- */
const spCL=a=>{ const s=Math.sign(a); a=Math.abs(a); let c; if(a<=15) c=0.09*a; else { c=1.35-0.6*(1-Math.exp(-(a-15)/8)); if(a>45) c*=Math.cos(Math.min(90,(a-45)*2)*D2R); } return s*c; };
LK("tof",{
  ar:"الدوران الذاتي ودخول الحلزون", en:"Wing autorotation and the spin",
  alt:"منظر أمامي لجناح يدور، والجناح النازل والصاعد بسهمي رفع مختلفين، ومنحنى معامل الرفع مع زاوية الهجوم عليه نقطتا طرفي الجناح",
  intro:["عندما يدور الجناح حول محوره الطولي، يرى الجناح النازل زاوية هجوم أكبر والصاعد زاوية أصغر. قبل الانهيار يعني هذا رفعاً أكبر على الجناح النازل، فيقاوم الدوران ويوقفه: هذا تخميد طبيعي.",
         "بعد الانهيار ينقلب الأمر: الزاوية الأكبر تعطي رفعاً أقل، فيصبح الجناح النازل أضعف ويستمر الدوران ويتسارع. هذا «الدوران الذاتي» هو قلب الحلزون، ولهذا يبدأ الخروج منه بتقليل زاوية الهجوم."],
  ctl:[{k:"al",ar:"زاوية الهجوم",min:0,max:50,step:0.5,v:22,f:v=>nf(v,1)+"°"},{k:"ph",ar:"معدل الدوران pb/2V",min:0.02,max:0.3,step:0.01,v:0.12,f:v=>nf(v,2)}],
  pre:[{ar:"طيران عادي",set:{al:6}},{ar:"قرب الانهيار",set:{al:14}},{ar:"بعد الانهيار",set:{al:24}}],
  calc(st){ st.Cl=(a,ph)=>{ let s=0; const N=40; for(let i=0;i<N;i++){ const e=-1+(i+0.5)*2/N; s+=spCL(a+ph*e/D2R)*e*2/N; } return -s/4; }; st.cl=st.Cl(st.al,st.ph); st.ad=st.al+st.ph/D2R; st.au=st.al-st.ph/D2R; st.auto=st.cl>0; st.cd=spCL(st.al+0.5*st.ph/D2R); st.cu=spCL(st.al-0.5*st.ph/D2R); },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.52, hs=r.w*0.42, ang=st.auto?Math.sin(st.t*2)*0.05+0.05:0.03*Math.exp(-((st.t*2)%3));
    g.save(); g.translate(cx,cy); g.rotate(ang); lline(g,[[-hs,0],[hs,0]],C.ink,5); g.fillStyle=mixC(C.panel,C.struct,0.4); g.beginPath(); g.arc(0,0,14,0,Math.PI*2); g.fill(); g.strokeStyle=C.ink; g.stroke(); lline(g,[[0,-14],[0,-34]],C.ink,2.5);
    const Ls=r.h*0.22; larrow(g,hs*0.5,0,hs*0.5,-Ls*st.cd,C.power,3,9); larrow(g,-hs*0.5,0,-hs*0.5,-Ls*st.cu,C.hyd,3,9);
    larrow(g,hs*0.95,6,hs*0.95,30,C.muted,1.5,6); larrow(g,-hs*0.95,-6,-hs*0.95,-30,C.muted,1.5,6); g.restore();
    ltx(g,"الجناح النازل α = "+nf(st.ad,1)+"°",cx+hs*0.5,cy+r.h*0.2,{s:11,rtl:true,c:C.power}); ltx(g,"الجناح الصاعد α = "+nf(st.au,1)+"°",cx-hs*0.5,cy+r.h*0.2,{s:11,rtl:true,c:C.hyd});
    g.strokeStyle=C.accent; g.lineWidth=2; g.beginPath(); g.arc(cx,cy,48,-Math.PI*0.85,-Math.PI*0.15); g.stroke(); larrow(g,cx+48*Math.cos(-Math.PI*0.2),cy+48*Math.sin(-Math.PI*0.2),cx+48*Math.cos(-Math.PI*0.15),cy+48*Math.sin(-Math.PI*0.15),C.accent,2,8);
    ltx(g,st.auto?"دوران ذاتي: الدوران يستمر ويتسارع":"تخميد: الجناح يقاوم الدوران",cx,r.y+14,{s:12,w:600,rtl:true,c:st.auto?C.power:C.ctrl}); },
  plot(st){ return {x:[0,50],y:[0,1.6],xl:"α (°)",yl:"C_L",curves:[{f:spCL,c:"ink"}],band:[{x0:15,x1:50,c:"power",a:0.1}],vl:[{x:15,c:"muted",t:"الانهيار"}],dots:[{x:st.ad,y:spCL(st.ad),c:"power",t:"نازل"},{x:st.au,y:spCL(st.au),c:"hyd",t:"صاعد"}]}; },
  ro(st){ return [["C_L الجناح النازل (منتصفه)",nf(st.cd,2)],["C_L الجناح الصاعد (منتصفه)",nf(st.cu,2)],["معامل عزم الدوران C_l",nf(st.cl,4)],["النتيجة",st.auto?"يدفع الدوران":"يقاوم الدوران"]]; },
  eq:["تغير الزاوية على الباع: Δα = p y / V","C_l = −(1/4) ∫ C_L(α + p̂ η) η dη ، η من −1 إلى 1","قبل الانهيار dC_L/dα > 0 ⇒ تخميد؛ بعده < 0 ⇒ دوران ذاتي"],
  note:["نموذج شرائح لجناح مستطيل بمنحنى رفع مبسط؛ الحلزون الحقيقي يتأثر أيضاً بالسحب وبالجسم والذيل وبقوى القصور.","الخروج من الحلزون يتبع دليل كل طائرة، لكن جوهره دائماً إيقاف الدوران وتقليل زاوية الهجوم."],
  quiz:[{q:"قبل الانهيار، الجناح النازل في الدوران:",o:["يولد رفعاً أكبر فيقاوم الدوران","يولد رفعاً أقل","لا يتغير رفعه"],a:0,why:"زاويته أكبر والمنحنى صاعد."},
        {q:"لماذا يستمر الدوران بعد الانهيار؟",o:["الجناح النازل يفقد الرفع رغم زاويته الأكبر","المحرك يدفعه","الذيل يدفعه"],a:0,why:"ميل منحنى الرفع سالب بعد الانهيار."}],
  ref:"الموضوع المقابل: الانهيار والحلزون (Stall and Spin)."
});
/* ---- 8 ---- */
LK("tof",{
  ar:"خط الدفع وعزم الانقلاب", en:"Thrust line offset and pitching moment",
  alt:"منظر جانبي لطائرة نقل بمحرك تحت الجناح أسفل مركز الثقل وسهم دفع وسهم دوران يرفع الأنف، ومنحنى زاوية المصعد اللازمة للتوازن مع السرعة",
  intro:["محركات معظم طائرات النقل معلقة تحت الجناح، أي أسفل مركز الثقل. عند زيادة الدفع يولد خط الدفع عزماً يرفع الأنف، وعند تقليله ينخفض الأنف.",
         "الأثر أوضح عند السرعة المنخفضة، لأن قوة المصعد المضادة تعتمد على مربع السرعة. لهذا يحتاج الإجهاض بقدرة كاملة عند سرعة الاقتراب انتباهاً لدفع الأنف ثم ضبط الموازن."],
  ctl:[{k:"T",ar:"الدفع من الأقصى",min:0,max:100,step:1,v:100,f:v=>nf(v,0)+"%"},{k:"z",ar:"موضع خط الدفع (سالب = تحت مركز الثقل)",min:-3,max:2,step:0.05,v:-1.6,f:v=>nf(v,2)+" m"},{k:"V",ar:"السرعة",min:120,max:300,step:1,v:145,f:v=>nf(v,0)+" kt"}],
  pre:[{ar:"إجهاض عند الاقتراب",set:{T:100,V:145}},{ar:"دفع التطواف",set:{T:30,V:280}},{ar:"محركات خلفية عالية",set:{z:0.6}}],
  calc(st){ const S=124.6, c=4.17, Tm=242e3; st.Tn=Tm*st.T/100; st.M=-st.Tn*st.z; st.de=V=>{ const q=0.5*1.225*(V/KT)**2; return (-Tm*st.T/100*st.z)/(q*S*c)/1.3/D2R; }; const q=0.5*1.225*(st.V/KT)**2; st.dCm=st.M/(q*S*c); st.dE=st.de(st.V); },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.45, s=r.w*0.86, m=s/39.5, ez=-st.z*m; kSide(g,cx,cy,s,0,C,{eng:false});
    const ex=cx+s*0.03, ey=cy+ez; g.fillStyle=mixC(C.panel,C.ink,0.35); g.strokeStyle=C.ink; g.beginPath(); g.ellipse(ex,ey,s*0.055,s*0.022,0,0,Math.PI*2); g.fill(); g.stroke(); lline(g,[[ex,cy+s*0.02],[ex,ey]],C.ink,1.5);
    lline(g,[[r.x,ey],[r.x+r.w,ey]],C.fuel,1,[6,4]); if(st.T>0) larrow(g,ex+s*0.06,ey,ex+s*0.06+r.w*0.25*st.T/100,ey,C.fuel,3,10);
    g.fillStyle=C.panel; g.strokeStyle=C.ink; g.lineWidth=1.2; g.beginPath(); g.arc(cx,cy,7,0,Math.PI*2); g.fill(); g.stroke(); g.fillStyle=C.ink; g.beginPath(); g.moveTo(cx,cy); g.arc(cx,cy,7,0,Math.PI/2); g.fill(); g.beginPath(); g.moveTo(cx,cy); g.arc(cx,cy,7,Math.PI,Math.PI*1.5); g.fill();
    if(Math.abs(st.M)>1){ const R=34, up=st.M>0, a0=up?0.6:-0.6, a1=up?-1.6:1.6; g.strokeStyle=C.accent; g.lineWidth=2.2; g.beginPath(); g.arc(cx,cy,R,a0,a1,up); g.stroke(); const h=a1+(up?0.15:-0.15); larrow(g,cx+R*Math.cos(h),cy+R*Math.sin(h),cx+R*Math.cos(a1),cy+R*Math.sin(a1),C.accent,2.2,9); }
    ltx(g,"مركز الثقل",cx,cy-r.h*0.2,{s:10,rtl:true,c:C.muted}); ltx(g,st.M>1?"العزم يرفع الأنف":st.M<-1?"العزم يخفض الأنف":"لا عزم من الدفع",cx,r.y+r.h*0.9,{s:12,w:600,rtl:true,c:C.accent}); },
  plot(st){ const ym=Math.max(2,Math.abs(st.de(120))*1.1); return {x:[120,300],y:st.z<=0?[0,ym]:[-ym,0],xl:"kt",yl:"المصعد (°)",curves:[{f:st.de,c:"hyd"}],dots:[{x:st.V,y:st.dE}]}; },
  ro(st){ return [["الدفع",nf(st.Tn/1000,0)+" kN"],["عزم الدفع",nf(st.M/1000,0)+" kN·m"],["ΔC_m",nf(st.dCm,3)],["المصعد اللازم",nf(Math.abs(st.dE),1)+"° "+(st.dE>0.05?"للأسفل (دفع الأنف)":st.dE<-0.05?"للأعلى (سحب الأنف)":"")]]; },
  eq:["M = T · z_T","ΔC_m = M / (q S c̄)","Δδ_e = −ΔC_m / C_mδe ، C_mδe ≈ −1.3 لكل راديان"],
  note:["أرقام قريبة من طائرة نقل متوسطة بمحركين (مساحة الجناح 124.6 m² والوتر المتوسط 4.17 m)، وفاعلية المصعد تقريبية.","في الطيران الفعلي يُزال الضغط المستمر على عصا التحكم بالموازن (Stabilizer trim)."],
  quiz:[{q:"محركات تحت مركز الثقل، زيادة الدفع:",o:["ترفع الأنف","تخفض الأنف","لا تؤثر"],a:0,why:"الدفع أسفل مركز الثقل يولد عزماً رافعاً."},
        {q:"لماذا الأثر أكبر عند السرعة المنخفضة؟",o:["قوة المصعد ∝ V² بينما الدفع ثابت تقريباً","الدفع يزيد مع السرعة","الوزن يقل"],a:0,why:"ΔC_m = M/(qSc)."}],
  show:{ar:"اعرض المصعد",fn:()=>lrnSel("elevator",1)},
  ref:"الموضوع المقابل: الاستقرار الطولي وأثر القدرة (Power Effects on Stability)."
});
/* ---- 9 ---- */
LK("tof",{
  ar:"قانون بيو–سافار لقطعة دوامة مستقيمة", en:"Biot–Savart law for a straight vortex segment",
  alt:"قطعة دوامة مستقيمة ونقطة P فوقها مع الزاويتين θ₁ وθ₂ وخريطة ملونة لشدة السرعة المستحثة، ومنحنى السرعة مع البعد للقطعة وللخط اللانهائي ونصف اللانهائي",
  intro:["الدوامة تحرّك الهواء حولها حتى على بعد. السرعة التي تسببها قطعة دوامة مستقيمة عند نقطة تعطى بقانون بيو–سافار: V = Γ/(4πh) (cos θ₁ − cos θ₂). هذا القانون أساس نظرية خط الرفع وطرق الشبكة الدوامية.",
         "إذا كانت القطعة طويلة جداً تصبح (cos θ₁ − cos θ₂) = 2 فنحصل على Γ/(2πh). ودوامة طرف الجناح تبدأ من الجناح وتمتد للخلف، فهي نصف لانهائية وتعطي نصف هذه القيمة عند خط الجناح."],
  ctl:[{k:"G",ar:"شدة الدوامة Γ",min:10,max:200,step:1,v:80,f:v=>nf(v,0)+" m²/s"},{k:"L",ar:"طول القطعة",min:1,max:20,step:0.5,v:8,f:v=>nf(v,1)+" m"},{k:"px",ar:"موضع النقطة على طول القطعة",min:-15,max:15,step:0.5,v:0,f:v=>nf(v,1)+" m"},{k:"h",ar:"بعد النقطة عن القطعة",min:0.5,max:10,step:0.1,v:3,f:v=>nf(v,1)+" m"}],
  calc(st){ st.vf=(x,h)=>{ const a=-st.L/2, b=st.L/2; return st.G/(4*Math.PI*h)*((x-a)/Math.hypot(x-a,h)-(x-b)/Math.hypot(x-b,h)); }; st.c1=(st.px+st.L/2)/Math.hypot(st.px+st.L/2,st.h); st.c2=(st.px-st.L/2)/Math.hypot(st.px-st.L/2,st.h);
    st.V=st.vf(st.px,st.h); st.Vi=st.G/(2*Math.PI*st.h); st.th1=Math.acos(st.c1)/D2R; st.th2=Math.acos(st.c2)/D2R; },
  scene(g,r,st,C){ const xr=Math.max(st.L/2+2,Math.abs(st.px)+3,st.h*1.3), hr=r.h*0.8, sx=Math.min(r.w*0.94/(2*xr),hr/(st.h+2.5)), X=x=>r.x+r.w*0.5+x*sx, y0=r.y+r.h*0.86, Y=h=>y0-h*sx, ref=st.G/(2*Math.PI*Math.max(0.6,st.h*0.5));
    const xw=r.w*0.47/sx, hw=hr/sx, nx=44, ny=18; for(let i=0;i<nx;i++) for(let j=0;j<ny;j++){ const x=-xw+(i+0.5)*2*xw/nx, h=0.1+(j+0.5)*hw/ny, v=st.vf(x,h); g.fillStyle=lcmap(Math.sqrt(clamp(v/ref,0,1)),C); g.globalAlpha=0.55; g.fillRect(X(-xw+i*2*xw/nx),Y(0.1+(j+1)*hw/ny),2*xw/nx*sx+0.5,hw/ny*sx+0.5); } g.globalAlpha=1;
    lline(g,[[X(-xw),y0],[X(xw),y0]],C.muted,1,[4,4]); const A=[X(-st.L/2),y0], B=[X(st.L/2),y0], P=[X(st.px),Y(st.h)]; lline(g,[A,B],C.ink,4); larrow(g,X(-1),y0,X(1),y0,C.ink,2,9);
    lline(g,[A,P],C.ink,1,[3,3]); lline(g,[B,P],C.ink,1,[3,3]);
    g.strokeStyle=C.power; g.lineWidth=1.6; g.beginPath(); g.arc(A[0],A[1],20,-st.th1*D2R,0); g.stroke(); g.strokeStyle=C.hyd; g.beginPath(); g.arc(B[0],B[1],16,-st.th2*D2R,0); g.stroke();
    ltx(g,"θ₁",A[0]+26*Math.cos(st.th1*D2R/2),A[1]-26*Math.sin(st.th1*D2R/2),{s:11,c:C.power,m:true}); ltx(g,"θ₂",B[0]+24*Math.cos(st.th2*D2R/2),B[1]-24*Math.sin(st.th2*D2R/2),{s:11,c:C.hyd,m:true});
    const rr=4+Math.min(10,st.V*1.2); g.fillStyle=C.panel; g.strokeStyle=C.ink; g.lineWidth=1.5; g.beginPath(); g.arc(P[0],P[1],rr,0,Math.PI*2); g.fill(); g.stroke(); ldot(g,P[0],P[1],2.5,C.ink);
    ltx(g,"P · V = "+nf(st.V,2)+" m/s",P[0],P[1]-rr-10,{s:11,w:600,m:true}); ltx(g,"Γ",X(0),y0+14,{s:12,m:true}); },
  plot(st){ return {x:[0.5,10],y:[0.05,st.G/(2*Math.PI*0.5)*1.3],log:true,xl:"h (m)",yl:"V m/s",curves:[{f:h=>st.G/(2*Math.PI*h),c:"muted",dash:[5,4]},{f:h=>st.G/(4*Math.PI*h),c:"fuel",dash:[2,3]},{f:h=>st.vf(st.px,h),c:"hyd"}],dots:[{x:st.h,y:st.V}],leg:[{c:"hyd",t:"القطعة"},{c:"muted",t:"خط لانهائي",dash:[5,4]},{c:"fuel",t:"نصف لانهائي",dash:[2,3]}]}; },
  ro(st){ return [["θ₁",nf(st.th1,1)+"°"],["θ₂",nf(st.th2,1)+"°"],["السرعة المستحثة",nf(st.V,3)+" m/s"],["نسبتها إلى الخط اللانهائي",nf(st.V/st.Vi*100,0)+"%"]]; },
  eq:["V = Γ/(4πh) (cos θ₁ − cos θ₂)","خط لانهائي: V = Γ/(2πh)","نصف لانهائي (من طرفه): V = Γ/(4πh)"],
  note:["اتجاه السرعة عمودي على المستوى الذي يضم القطعة والنقطة (قاعدة اليد اليمنى)؛ في الرسم الدائرة عند P تعني سرعة خارجة من الشاشة.","قرب الدوامة الحقيقية يكون لقلبها قطر محدود فلا تصبح السرعة لانهائية."],
  quiz:[{q:"نقطة في منتصف قطعة طويلة جداً مقارنة بالبعد h:",o:["V ≈ Γ/(2πh)","V ≈ Γ/(4πh)","V = 0"],a:0,why:"cos θ₁ − cos θ₂ → 2."},
        {q:"مضاعفة البعد عن خط دوامة لانهائي تجعل السرعة:",o:["نصفاً","ربعاً","كما هي"],a:0,why:"V ∝ 1/h."}],
  ref:"الموضوع المقابل: الدوامات وقانون بيو–سافار (Vortex Filaments)."
});
/* ---- 10 ---- */
LK("tof",{
  ar:"زاوية التابوت: حدّا الاهتزاز عند الارتفاع العالي", en:"The coffin corner: low- and high-speed buffet at altitude",
  alt:"شريط رقم ماخ عمودي بمنطقتين حمراوين للاهتزاز عند السرعة المنخفضة والعالية، ومخطط الارتفاع مع رقم ماخ يبين الحدين يقتربان حتى يلتقيا",
  intro:["كلما صعدت الطائرة قلّت كثافة الهواء، فتحتاج رقم ماخ أعلى لتوليد نفس الرفع، فيرتفع حد الاهتزاز عند السرعة المنخفضة. وفي المقابل يسبب الطيران بماخ مرتفع موجات صدمية واهتزازاً، وهذا الحد ينخفض كلما زاد معامل الرفع.",
         "عند ارتفاع معين يلتقي الحدّان فلا يبقى هامش: هذه «زاوية التابوت». الوزن الأكبر أو الميل في المنعطف يرفع معامل الرفع المطلوب فيقرّب الحدين، لذلك يُحسب أقصى ارتفاع بحيث يبقى هامش 1.3g ضد الاهتزاز."],
  ctl:[{k:"FL",ar:"مستوى الطيران",min:250,max:450,step:5,v:390,f:v=>"FL"+nf(v,0)},{k:"Wt",ar:"الوزن",min:50,max:79,step:0.5,v:70,f:v=>nf(v,1)+" t"},{k:"bk",ar:"زاوية الميل",min:0,max:40,step:1,v:0,f:v=>nf(v,0)+"°"},{k:"M",ar:"رقم ماخ",min:0.55,max:0.88,step:0.005,v:0.78,f:v=>nf(v,3)}],
  pre:[{ar:"خفيفة على FL350",set:{Wt:58,FL:350,bk:0}},{ar:"ثقيلة على FL410",set:{Wt:76,FL:410,bk:0}},{ar:"منعطف 30° عالٍ",set:{Wt:70,FL:390,bk:30}}],
  calc(st){ const clb=M=>1.25-1.1*Math.max(0,M-0.4), mhb=cl=>0.86-0.12*cl*cl, n=1/Math.cos(st.bk*D2R); st.n=n;
    const scan=(f,a,b,dir)=>{ const N=160; let pa=dir>0?a:b, fa=f(pa); for(let i=1;i<=N;i++){ const x=dir>0?a+(b-a)*i/N:b-(b-a)*i/N, fx=f(x); if((fx<0)!==(fa<0)) return kRoot(f,pa,x,40); pa=x; fa=fx; } return NaN; };
    const env=(nn,h)=>{ const k=nn*st.Wt*1000*G0/(0.7*isa(h).p*124.6), lo=scan(M=>k/(M*M)-clb(M),0.15,0.99,1), hi=scan(M=>M-mhb(k/(M*M)),0.15,0.99,-1); return (isFinite(lo)&&isFinite(hi)&&lo<hi)?[lo,hi,k]:[NaN,NaN,k]; };
    const h=st.FL*30.48, e1=env(n,h), e3=env(n*1.3,h); st.ML=e1[0]; st.MH=e1[1]; st.ML3=e3[0]; st.MH3=e3[1]; st.CL=e1[2]/(st.M*st.M); st.ok=isFinite(st.ML)&&st.M>st.ML&&st.M<st.MH;
    st.lo1=[]; st.hi1=[]; st.lo3=[]; st.hi3=[]; st.fc=NaN; st.f13=NaN;
    for(let f=200;f<=500;f+=4){ const hh=f*30.48, a=env(n,hh), b=env(n*1.3,hh); if(isFinite(a[0])){ st.lo1.push([a[0],f]); st.hi1.push([a[1],f]); st.fc=f; } if(isFinite(b[0])){ st.lo3.push([b[0],f]); st.hi3.push([b[1],f]); st.f13=f; } } },
  scene(g,r,st,C){ const tx=r.x+r.w*0.3, tw=Math.min(90,r.w*0.26), ty=r.y+r.h*0.06, th=r.h*0.88, span=0.16, Y=M=>ty+th/2-(M-st.M)/span*th;
    g.fillStyle="#1d242b"; g.fillRect(tx,ty,tw,th); g.save(); g.beginPath(); g.rect(tx,ty,tw,th); g.clip();
    const pole=(m0,m1,col)=>{ const y0=Y(m1), y1=Y(m0); g.fillStyle=col; g.fillRect(tx+tw-14,Math.min(y0,y1),14,Math.abs(y1-y0)); };
    if(isFinite(st.ML3)){ pole(st.ML3,st.ML,"#e0a030"); pole(st.MH,st.MH3,"#e0a030"); }
    if(isFinite(st.ML)){ pole(0.3,st.ML,"#e04848"); pole(st.MH,1.0,"#e04848"); } else pole(0.3,1.0,"#e04848");
    for(let m=Math.ceil((st.M-span)*100)/100; m<=st.M+span; m+=0.01){ const y=Y(m), big=Math.round(m*100)%2===0; lline(g,[[tx,y],[tx+(big?14:8),y]],"#ffffff",1); if(big) ltx(g,nf(m,2),tx+18,y,{s:10,a:"left",m:true,c:"#ffffff"}); }
    g.restore(); g.strokeStyle=C.ink; g.strokeRect(tx,ty,tw,th);
    const py=ty+th/2; g.fillStyle="#000000"; g.strokeStyle="#ffffff"; g.lineWidth=1.5; g.beginPath(); g.moveTo(tx-6,py-12); g.lineTo(tx+tw-16,py-12); g.lineTo(tx+tw-8,py); g.lineTo(tx+tw-16,py+12); g.lineTo(tx-6,py+12); g.closePath(); g.fill(); g.stroke();
    ltx(g,nf(st.M,3),tx+(tw-20)/2,py,{s:13,w:700,m:true,c:"#ffffff"});
    const ix=r.x+r.w*0.72; ltx(g,"FL"+nf(st.FL,0),ix,r.y+r.h*0.2,{s:16,w:700,m:true}); ltx(g,"C_L = "+nf(st.CL,2),ix,r.y+r.h*0.32,{s:12,m:true}); ltx(g,"n = "+nf(st.n,2)+" g",ix,r.y+r.h*0.42,{s:12,m:true});
    ltx(g,!isFinite(st.ML)?"لا يوجد هامش!":st.ok?"ضمن الحدين ✓":"اهتزاز ✗",ix,r.y+r.h*0.58,{s:13,w:600,rtl:true,c:st.ok?C.ctrl:C.power});
    ltx(g,"أحمر: اهتزاز عند 1g",ix,r.y+r.h*0.74,{s:10,rtl:true,c:"#e04848"}); ltx(g,"برتقالي: هامش 1.3g",ix,r.y+r.h*0.82,{s:10,rtl:true,c:"#e0a030"}); },
  plot(st){ const env=st.lo1.concat(st.hi1.slice().reverse()); return {x:[0.5,0.9],y:[200,500],xl:"Mach",yl:"FL",lines:[{pts:env,c:"line",w:0.1,fill:"ctrl"},{pts:st.lo1,c:"power"},{pts:st.hi1,c:"power"},{pts:st.lo3,c:"fuel",dash:[5,4]},{pts:st.hi3,c:"fuel",dash:[5,4]}],dots:[{x:st.M,y:st.FL,c:st.ok?"ctrl":"power"}],leg:[{c:"power",t:"1g"},{c:"fuel",t:"1.3g",dash:[5,4]}]}; },
  ro(st){ return [["C_L المطلوب",nf(st.CL,3)],["حد الاهتزاز المنخفض",isFinite(st.ML)?"M "+nf(st.ML,3):"—"],["حد الاهتزاز العالي",isFinite(st.MH)?"M "+nf(st.MH,3):"—"],["أقصى ارتفاع بهامش 1.3g",isFinite(st.f13)?"FL"+nf(st.f13,0):"—"],["زاوية التابوت (1g)",isFinite(st.fc)?"FL"+nf(st.fc,0):"—"]]; },
  eq:["C_L = n W / (0.7 p M² S)","الحد المنخفض: C_L = C_L,buffet(M)","الحد العالي: M = M_buffet(C_L)","n = 1/cos φ"],
  note:["حدود الاهتزاز هنا نموذج تعليمي مبسط بأرقام قريبة من طائرة نقل متوسطة (مساحة الجناح 124.6 m²)، وليست بيانات دليل طيران.","الضغط محسوب من الجو القياسي الدولي."],
  quiz:[{q:"زيادة الوزن عند نفس الارتفاع تجعل حدّي الاهتزاز:",o:["يتقاربان","يتباعدان","لا يتغيران"],a:0,why:"C_L المطلوب يزيد."},
        {q:"لماذا يُترك هامش 1.3g؟",o:["لتحمل المطبات والمنعطفات دون اهتزاز","لتوفير الوقود","للهبوط"],a:0,why:"المطب أو المنعطف يرفع الحمل مؤقتاً."}],
  ref:"الموضوع المقابل: حدود الاهتزاز والطيران على ارتفاع عالٍ (Buffet Boundaries)."
});
