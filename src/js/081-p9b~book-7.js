/* ---------- Book 7: Aerodynamics, Aeronautics and Flight Mechanics — 10 more lessons ---------- */
function heliModel(W,R,f,alt){ const rho=isa(alt).rho, A=Math.PI*R*R, T=W*G0, vh=Math.sqrt(T/(2*rho*A)), OR=210, sig=0.08, cd0=0.01;
  const parts=V=>{ const vi=Math.sqrt((-V*V+Math.sqrt(V**4+4*vh**4))/2), mu=V/OR; return {i:1.15*T*vi, o:sig*cd0/8*rho*A*OR**3*(1+4.65*mu*mu), p:0.5*rho*V**3*f}; };
  const P=V=>{ const q=parts(V); return q.i+q.o+q.p; }; let vbe=0,pm=1e18,vbr=0,br=1e18; for(let V=1;V<=90;V+=0.25){ const p=P(V); if(p<pm){ pm=p; vbe=V; } if(p/V<br){ br=p/V; vbr=V; } }
  return {rho,A,T,vh,parts,P,vbe,pm,vbr}; }
function heliDraw(g,x,y,s,tilt,C,t){ g.save(); g.translate(x,y); g.rotate(tilt); g.fillStyle=mixC(C.panel,C.struct,0.4); g.strokeStyle=C.ink; g.lineWidth=1.3;
  g.beginPath(); g.ellipse(0,0,s*0.3,s*0.16,0,0,Math.PI*2); g.fill(); g.stroke(); g.fillStyle=mixC(C.panel,C.hyd,0.4); g.beginPath(); g.ellipse(-s*0.16,-s*0.03,s*0.12,s*0.09,0,0,Math.PI*2); g.fill();
  lline(g,[[s*0.25,-s*0.02],[s*0.85,-s*0.06]],C.ink,4); g.beginPath(); g.arc(s*0.85,-s*0.06,s*0.09,0,Math.PI*2); g.stroke(); lline(g,[[0,-s*0.16],[0,-s*0.24]],C.ink,3);
  const b=Math.cos(t*20)*s*0.62; lline(g,[[-b,-s*0.25],[b,-s*0.25]],C.ink,2.5); lline(g,[[-s*0.62,-s*0.25],[s*0.62,-s*0.25]],mixC(C.panel,C.ink,0.3),1.2,[3,3]); lline(g,[[-s*0.2,s*0.2],[s*0.2,s*0.2]],C.ink,2); g.restore(); }
LK("aaf",{
  ar:"المروحية في الطيران الأمامي: منحنى القدرة", en:"Helicopter forward flight: the power curve",
  alt:"مروحية يميل قرصها للأمام مع السرعة، ومنحنى القدرة المطلوبة مع السرعة بأجزائه: المستحثة والمقطعية والطفيلية",
  intro:["القدرة التي تحتاجها المروحية لها ثلاثة أجزاء: قدرة مستحثة لدفع الهواء للأسفل (كبيرة في التحويم وتقل مع السرعة)، وقدرة مقطعية لسحب الشفرات (تزيد قليلاً)، وقدرة طفيلية لسحب الجسم (تزيد مع مكعب السرعة).",
         "لهذا تحتاج المروحية قدرة أقل في سرعة متوسطة (60–80 عقدة) مما تحتاجه في التحويم! عند أقل قدرة تطير أطول وقت، وعند المماس من الصفر تطير أبعد مسافة."],
  ctl:[{k:"W",ar:"الكتلة",min:1000,max:8000,step:50,v:2500,f:v=>nf(v,0)+" kg"},{k:"R",ar:"نصف قطر الدوّار",min:4,max:9,step:0.1,v:5.3,f:v=>nf(v,1)+" m"},{k:"f",ar:"مساحة السحب المكافئة",min:0.5,max:3,step:0.05,v:1.2,f:v=>nf(v,2)+" m²"},{k:"alt",ar:"الارتفاع",min:0,max:3000,step:50,v:0,f:v=>nf(v,0)+" m"},{k:"V",ar:"السرعة الحالية",min:0,max:150,step:1,v:70,f:v=>nf(v,0)+" kt"}],
  calc(st){ st.h=heliModel(st.W,st.R,st.f,st.alt); st.Pnow=st.h.P(st.V/KT); st.Phov=st.h.P(0.01); },
  scene(g,r,st,C){ heliDraw(g,r.x+r.w*0.5,r.y+r.h*0.5,Math.min(r.w*0.7,r.h*0.9),st.V/150*0.25,C,st.t);
    for(let i=0;i<6;i++){ const x=r.x+r.w*(0.25+i*0.1), f=((st.t*0.8+i*0.2)%1); larrow(g,x,r.y+r.h*0.35+f*r.h*0.4,x,r.y+r.h*0.35+f*r.h*0.4+10,mixC(C.hyd,C.panel,f),1.5,5); }
    ltx(g,"القدرة الآن "+nf(st.Pnow/1000,0)+" kW",r.x+r.w*0.5,r.y+r.h*0.94,{s:12,w:600,rtl:true}); },
  plot(st){ const h=st.h, k=v=>v/KT; return {x:[0,150],y:[0,Math.max(st.Phov,h.P(150/KT))/1000*1.1],xl:"السرعة kt",yl:"kW",curves:[{f:v=>h.P(k(v))/1000,c:"hyd",w:2.6},{f:v=>h.parts(k(v)).i/1000,c:"ctrl",dash:[4,3]},{f:v=>h.parts(k(v)).o/1000,c:"fuel",dash:[4,3]},{f:v=>h.parts(k(v)).p/1000,c:"power",dash:[4,3]}],
    dots:[{x:h.vbe*KT,y:h.pm/1000,c:"ctrl",t:"تحمّل"},{x:h.vbr*KT,y:h.P(h.vbr)/1000,c:"power",t:"مدى"},{x:st.V,y:st.Pnow/1000,c:"accent",r:4}],leg:[{c:"hyd",t:"الكلية"},{c:"ctrl",t:"مستحثة",dash:[4,3]},{c:"fuel",t:"مقطعية",dash:[4,3]},{c:"power",t:"طفيلية",dash:[4,3]}]}; },
  ro(st){ return [["قدرة التحويم",nf(st.Phov/1000,0)+" kW"],["أقل قدرة",nf(st.h.pm/1000,0)+" kW عند "+nf(st.h.vbe*KT,0)+" kt"],["سرعة أفضل مدى",nf(st.h.vbr*KT,0)+" kt"],["السرعة المستحثة في التحويم",nf(st.h.vh,1)+" m/s"]]; },
  eq:["P = κ T v_i + (σ C_d0/8) ρ A (ΩR)³ (1 + 4.65 μ²) + ½ ρ V³ f","v_i⁴ + V² v_i² = v_h⁴ ، v_h = √(T / 2ρA)"],
  note:["النموذج تعليمي لمروحية خفيفة إلى متوسطة، والأرقام الحقيقية من دليل المروحية.","الفرق بين قدرة التحويم وأقل قدرة هو سبب صعوبة التحويم بحمل كامل في الأيام الحارة."],
  quiz:[{q:"لماذا تحتاج المروحية قدرة أقل عند 70 عقدة من التحويم؟",o:["لأن القدرة المستحثة تقل كثيراً مع السرعة","لأن المحرك أقوى","لأن الجسم أصغر"],a:0,why:"الدوّار يمر بهواء جديد أكثر فيحتاج تسريعاً أقل له."},
        {q:"القدرة الطفيلية تزيد مع:",o:["السرعة","مربع السرعة","مكعب السرعة"],a:2,why:"½ρV³f."}],
  ref:"الموضوع المقابل: أداء المروحيات في الطيران الأمامي (Helicopter Forward Flight)."
});
LK("aaf",{
  ar:"الدوران الذاتي: هبوط المروحية بلا محرك", en:"Autorotation",
  alt:"مروحية تهبط والهواء يمر عبر الدوّار من الأسفل للأعلى فيبقيه يدور، ومنحنى معدل الهبوط مع السرعة الأمامية",
  intro:["إذا تعطل محرك المروحية لا تسقط كالحجر: يخفض الطيار زاوية الشفرات فوراً، فيمر الهواء من الأسفل عبر الدوّار أثناء الهبوط ويبقيه يدور، تماماً كطاحونة الهواء. هذا «الدوران الذاتي».",
         "معدل الهبوط يقارب القدرة المطلوبة للطيران ÷ الوزن، لذلك يكون أقل عند سرعة أقل قدرة، وأبعد مسافة انزلاق عند سرعة أفضل مدى. وفي النهاية يرفع الطيار الأنف ويرفع الشفرات ليستخدم طاقة الدوّار في الملامسة الناعمة."],
  ctl:[{k:"W",ar:"الكتلة",min:1000,max:8000,step:50,v:2500,f:v=>nf(v,0)+" kg"},{k:"R",ar:"نصف قطر الدوّار",min:4,max:9,step:0.1,v:5.3,f:v=>nf(v,1)+" m"},{k:"V",ar:"السرعة الأمامية",min:0,max:140,step:1,v:70,f:v=>nf(v,0)+" kt"}],
  calc(st){ const h=heliModel(st.W,st.R,1.2,0); st.h=h; const V20=20/KT, r20=1.15*h.P(V20)/h.T; st.rod=V=>V<V20?1.8*h.vh+(r20-1.8*h.vh)*(V/V20):Math.max(1.15*h.P(V)/h.T,0); st.now=st.rod(st.V/KT); st.min=st.rod(h.vbe); st.gr=st.V>5?(st.V/KT)/st.now:0; },
  scene(g,r,st,C){ const yy=r.y+r.h*(0.2+((st.t*0.08)%0.5)); heliDraw(g,r.x+r.w*0.5,yy,Math.min(r.w*0.6,r.h*0.75),st.V/140*0.2,C,st.t);
    for(let i=0;i<6;i++){ const x=r.x+r.w*(0.28+i*0.09), f=((st.t*0.8+i*0.2)%1); larrow(g,x,yy+r.h*0.4-f*r.h*0.3,x,yy+r.h*0.4-f*r.h*0.3-10,C.ctrl,1.5,5); }
    lline(g,[[r.x,r.y+r.h*0.92],[r.x+r.w,r.y+r.h*0.92]],C.line,2); ltx(g,"الهواء يصعد عبر الدوّار",r.x+r.w*0.5,r.y+r.h*0.98,{c:C.ctrl,s:10,rtl:true}); },
  plot(st){ return {x:[0,140],y:[0,st.rod(0.01)*1.1*196.85],xl:"السرعة kt",yl:"ft/min",curves:[{f:v=>st.rod(v/KT)*196.85,c:"power"}],dots:[{x:st.h.vbe*KT,y:st.min*196.85,c:"ctrl",t:"أقل هبوط"},{x:st.V,y:st.now*196.85,c:"accent"}]}; },
  ro(st){ return [["معدل الهبوط الآن",nf(st.now*196.85,0)+" ft/min"],["أقل معدل",nf(st.min*196.85,0)+" ft/min عند "+nf(st.h.vbe*KT,0)+" kt"],["نسبة الانزلاق",st.gr>0?nf(st.gr,1)+" : 1":"—"],["أفضل انزلاق قرب",nf(st.h.vbr*KT,0)+" kt"]]; },
  eq:["معدل الهبوط ≈ P_required(V) / W (مع خسائر صغيرة)","الهبوط العمودي ≈ 1.8 v_h"],
  note:["الأرقام تقريبية؛ دليل المروحية يعطي سرعة الدوران الذاتي ومخطط «الارتفاع والسرعة» الذي يجب تجنبه.","التدريب على الدوران الذاتي جزء أساسي من رخصة طيار المروحية."],
  quiz:[{q:"في الدوران الذاتي، ما الذي يدير الدوّار؟",o:["المحرك","الهواء الصاعد عبره أثناء الهبوط","البطارية"],a:1,why:"يعمل كطاحونة هواء."},
        {q:"أقل معدل هبوط يكون عند:",o:["التحويم","سرعة أقل قدرة","أقصى سرعة"],a:1,why:"الهبوط ∝ القدرة المطلوبة."}],
  ref:"الموضوع المقابل: الدوران الذاتي (Autorotation)."
});
LK("aaf",{
  ar:"الدوّار الخلفي: مقاومة عزم الدوران", en:"The tail rotor: anti-torque",
  alt:"منظر علوي لمروحية: الدوّار الرئيسي يدور وعزمه يدير الجسم، والدوّار الخلفي يدفع جانباً ليعادله، ومنحنى قدرة الدوّار الخلفي مع طول الذراع",
  intro:["المحرك يدير الدوّار الرئيسي، وبحسب قانون نيوتن الثالث يحاول الجسم الدوران بالعكس. الدوّار الخلفي يدفع جانباً عند نهاية ذراع الذيل فيولّد عزماً معاكساً، ودواسات الطيار تغيّر دفعه لتوجيه المروحية.",
         "كلما طال ذراع الذيل قلّ الدفع المطلوب وبالتالي القدرة. الدوّار الخلفي يأخذ عادة 8 إلى 15% من قدرة المحرك في التحويم."],
  ctl:[{k:"P",ar:"قدرة الدوّار الرئيسي",min:200,max:2000,step:10,v:600,f:v=>nf(v,0)+" kW"},{k:"rpm",ar:"دورات الدوّار الرئيسي",min:250,max:450,step:5,v:380,f:v=>nf(v,0)+" rpm"},{k:"l",ar:"طول ذراع الذيل",min:4,max:10,step:0.1,v:6.3,f:v=>nf(v,1)+" m"},{k:"Rt",ar:"نصف قطر الدوّار الخلفي",min:0.6,max:1.6,step:0.05,v:0.9,f:v=>nf(v,2)+" m"}],
  calc(st){ const W=st.rpm*2*Math.PI/60, rho=1.225; st.Q=st.P*1000/W; st.fn=l=>{ const T=st.Q/l; return 1.15*Math.pow(T,1.5)/Math.sqrt(2*rho*Math.PI*st.Rt*st.Rt)/0.7; }; st.T=st.Q/st.l; st.Pt=st.fn(st.l); st.pc=st.Pt/(st.P*1000)*100; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.38, cy=r.y+r.h*0.5, Rr=Math.min(r.w*0.3,r.h*0.42), L=r.w*0.5*st.l/10;
    g.strokeStyle=mixC(C.panel,C.ink,0.3); g.lineWidth=1.2; g.setLineDash([4,4]); g.beginPath(); g.arc(cx,cy,Rr,0,Math.PI*2); g.stroke(); g.setLineDash([]);
    const a=st.t*6; lline(g,[[cx-Math.cos(a)*Rr,cy-Math.sin(a)*Rr],[cx+Math.cos(a)*Rr,cy+Math.sin(a)*Rr]],C.ink,3); lline(g,[[cx-Math.sin(a)*Rr,cy+Math.cos(a)*Rr],[cx+Math.sin(a)*Rr,cy-Math.cos(a)*Rr]],C.ink,3);
    g.fillStyle=mixC(C.panel,C.struct,0.45); g.beginPath(); g.ellipse(cx,cy,r.w*0.07,r.h*0.1,0,0,Math.PI*2); g.fill(); lline(g,[[cx+r.w*0.06,cy],[cx+L,cy]],C.ink,5);
    lline(g,[[cx+L,cy-st.Rt*12],[cx+L,cy+st.Rt*12]],C.ink,3); larrow(g,cx+L,cy,cx+L,cy-Math.min(r.h*0.35,st.T/400),C.ctrl,3,9); ltx(g,"دفع الدوّار الخلفي",cx+L+6,cy-r.h*0.2,{c:C.ctrl,s:10,a:"left",rtl:true});
    g.strokeStyle=C.power; g.lineWidth=2.5; g.beginPath(); g.arc(cx,cy,r.h*0.16,Math.PI*0.2,Math.PI*0.9); g.stroke(); ltx(g,"عزم الجسم",cx,cy+r.h*0.25,{c:C.power,s:10,rtl:true}); },
  plot(st){ return {x:[4,10],y:[0,Math.max(st.fn(4),st.Pt)/1000*1.15],xl:"ذراع الذيل m",yl:"kW",curves:[{f:l=>st.fn(l)/1000,c:"ctrl"}],dots:[{x:st.l,y:st.Pt/1000,t:nf(st.pc,1)+"%"}]}; },
  ro(st){ return [["عزم الدوّار الرئيسي",nf(st.Q/1000,2)+" kN·m"],["دفع الدوّار الخلفي",nf(st.T,0)+" N"],["قدرة الدوّار الخلفي",nf(st.Pt/1000,1)+" kW"],["نسبتها من الرئيسي",nf(st.pc,1)+"%"]]; },
  eq:["Q = P / Ω","T_tr = Q / l","P_tr ≈ κ T_tr^1.5 / √(2ρA_tr) ÷ FM"],
  note:["بعض المروحيات تستغني عن الدوّار الخلفي بدوّارين متعاكسين أو بنفث هواء في الذيل.","فقدان فعالية الدوّار الخلفي في رياح معينة حالة معروفة يتدرب عليها الطيارون."],
  quiz:[{q:"لماذا يحتاج الجسم دوّاراً خلفياً؟",o:["لمعادلة عزم رد فعل الدوّار الرئيسي","لزيادة السرعة","للتبريد"],a:0,why:"قانون الفعل ورد الفعل يدير الجسم بعكس الدوّار."},
        {q:"إطالة ذراع الذيل تجعل دفع الدوّار الخلفي المطلوب:",o:["أكبر","أصغر","كما هو"],a:1,why:"T = Q/l."}],
  ref:"الموضوع المقابل: الدوّار الخلفي ومقاومة العزم (Tail Rotor)."
});
LK("aaf",{
  ar:"الجليد: ماذا يفعل بالجناح", en:"Icing: what ice does to the wing",
  alt:"حافة جناح أمامية يتراكم عليها جليد على شكل قرنين، ومنحنى معامل الرفع مع زاوية الهجوم للجناح النظيف والمتجمد",
  intro:["حتى طبقة رقيقة من الجليد أو الصقيع تخرب انسياب الهواء قرب الحافة الأمامية. يقل أقصى معامل رفع، وتحدث الانهيار عند زاوية أصغر، ويزيد السحب. وقد لا تنبه أجهزة التحذير المضبوطة على الجناح النظيف.",
         "لهذا لا تقلع الطائرة وعلى جناحها صقيع، وتُرش بسوائل إزالة الجليد قبل الإقلاع في الشتاء. وفي الطيران تسخّن أنظمة منع الجليد الحواف الأمامية بالهواء الساخن من المحرك."],
  ctl:[{k:"sv",ar:"شدة الجليد",min:0,max:1,step:0.01,v:0.5,f:v=>v<0.05?"نظيف":v<0.3?"خشونة/صقيع":v<0.7?"جليد متوسط":"قرون جليد"},{k:"al",ar:"زاوية الهجوم",min:0,max:20,step:0.25,v:10,f:v=>nf(v,1)+"°"}],
  tog:[{k:"ai",ar:"منع الجليد يعمل",v:false}],
  calc(st){ const s=st.ai?0:st.sv; st.s=s; st.cm=1.6*(1-0.45*s); st.as=16-7*s;
    st.cl=(a,ss)=>{ const cm=1.6*(1-0.45*ss), as=16-7*ss, a0=as-4, k=1-0.1*ss, l0=0.1*(a0+2)*k; if(a<=a0) return 0.1*(a+2)*k; if(a<=as){ const t=(a-a0)/4; return l0+(cm-l0)*(1-(1-t)*(1-t)); } return cm-0.06*Math.pow(a-as,1.3)*(1+ss); };
    st.clNow=st.cl(st.al,s); st.vs=(1/Math.sqrt(st.cm/1.6)-1)*100; st.dd=120*s; st.stall=st.al>st.as; },
  scene(g,r,st,C){ const ox=r.x+r.w*0.12, oy=r.y+r.h*0.5, ch=r.w*1.3, P=kFoil(g,ox,oy,ch,st.al*0.4,C,{m:0.02,t:0.12});
    if(st.s>0.02){ const k=st.s; g.fillStyle="rgba(210,235,250,0.95)"; g.strokeStyle=mixC(C.panel,C.hyd,0.8); g.lineWidth=1;
      [[0.012,1],[0.012,-1]].forEach(([x,sg])=>{ const b=P(x,sg*P.yt(x)); g.beginPath(); g.moveTo(b[0],b[1]); g.lineTo(b[0]-k*r.w*0.08,b[1]-sg*k*r.h*0.16); g.lineTo(b[0]-k*r.w*0.03,b[1]-sg*k*r.h*0.04); g.lineTo(P(0.05,sg*P.yt(0.05))[0],P(0.05,sg*P.yt(0.05))[1]); g.closePath(); g.fill(); g.stroke(); });
      for(let i=0;i<20;i++){ const x=0.01+((i*37)%20)/20*0.08*k; const q=P(x,(((i*53)%20)/20-0.5)*0.12); ldot(g,q[0],q[1],1.4,"#e8f6ff"); } }
    if(st.ai) { g.fillStyle="rgba(255,120,60,0.18)"; g.beginPath(); g.arc(P(0,0)[0],P(0,0)[1],r.h*0.12,0,Math.PI*2); g.fill(); ltx(g,"هواء ساخن",P(0,0)[0]+10,P(0,0)[1]+r.h*0.18,{c:C.power,s:10,rtl:true}); }
    ltx(g,st.stall?"انهيار مبكر!":"",r.x+r.w*0.5,r.y+16,{s:13,w:600,c:C.power,rtl:true}); },
  plot(st){ return {x:[0,20],y:[0,1.8],xl:"α (°)",yl:"C_L",curves:[{f:a=>st.cl(a,0),c:"muted",dash:[4,3]},{f:a=>st.cl(a,st.s),c:"hyd"}],dots:[{x:st.al,y:st.clNow,c:st.stall?"power":"accent"}],leg:[{c:"muted",t:"نظيف",dash:[4,3]},{c:"hyd",t:"الحالي"}]}; },
  ro(st){ return [["أقصى C_L",nf(st.cm,2)+" ("+nf((1-st.cm/1.6)*100,0)+"% أقل)"],["زاوية الانهيار",nf(st.as,1)+"°"],["زيادة سرعة الانهيار",nf(st.vs,0)+"%"],["زيادة السحب تقريباً",nf(st.dd,0)+"%"]]; },
  eq:["V_s ∝ 1/√C_Lmax","فقدان 30% من C_Lmax يرفع سرعة الانهيار نحو 20%"],
  note:["الأرقام توضيحية؛ الاختبارات بيّنت أن خشونة تشبه ورق الصنفرة قد تخفض أقصى رفع بنسبة 20–30%.","لهذا مبدأ «الطائرة النظيفة»: لا إقلاع مع جليد أو صقيع على الأجنحة وأسطح التحكم."],
  quiz:[{q:"صقيع خفيف على الجناح:",o:["لا يهم","قد يخفض أقصى رفع كثيراً ويجب إزالته","يزيد الرفع"],a:1,why:"الخشونة قرب الحافة الأمامية تفصل الهواء مبكراً."},
        {q:"مع الجليد، الانهيار يحدث عند:",o:["زاوية هجوم أكبر","زاوية هجوم أصغر","نفس الزاوية"],a:1,why:"الانفصال يبدأ مبكراً."}],
  show:{ar:"اعرض الشرائح الأمامية",fn:()=>lrnSel("slats")},
  ref:"الموضوع المقابل: أثر الخشونة والجليد على الأداء (Icing Effects)."
});
LK("aaf",{
  ar:"الجنيحات الطرفية والباع الفعّال", en:"Winglets and effective span",
  alt:"منظر أمامي لطرف جناح بجنيح عمودي يصغّر دوامة الطرف، ومنحنى التغير في السحب الكلي مع ارتفاع الجنيح",
  intro:["الجنيح الطرفي (winglet) يعيق التفاف الهواء من أسفل الجناح إلى أعلاه عند الطرف، فتضعف الدوامة ويقل السحب المستحث، كأن الباع أطول قليلاً دون أن يزيد عرض الطائرة.",
         "لكنه يضيف وزناً وسطحاً يحتك بالهواء، ويزيد عزم الانحناء عند جذر الجناح. لذلك فائدته أكبر في الرحلات الطويلة حيث السحب المستحث مهم، ويُحسب صافي التوفير بعناية."],
  ctl:[{k:"hb",ar:"ارتفاع الجنيح ÷ الباع",min:0,max:0.12,step:0.002,v:0.05,f:v=>nf(v*100,1)+"%"},{k:"CL",ar:"معامل الرفع في الطيران",min:0.3,max:0.7,step:0.01,v:0.5,f:v=>nf(v,2)}],
  calc(st){ const A=9.45, e=0.8, S=124.6, b=34.3, CD0=0.022; st.fn=hb=>{ const ee=e*(1+1.9*hb), di=st.CL**2/(Math.PI*A*ee), dp=2*hb*b*1.25*0.0045/S; return {ee,di,dp}; };
    const z=st.fn(0), w=st.fn(st.hb); st.ee=w.ee; st.dDi=(w.di-z.di)/z.di*100; st.dp=w.dp; st.tot0=CD0+z.di; st.net=((w.di+w.dp)-z.di)/st.tot0*100; },
  scene(g,r,st,C){ const y=r.y+r.h*0.55, x0=r.x+r.w*0.05, L=r.w*0.62, h=st.hb*34.3/17.15*L; lline(g,[[x0,y],[x0+L,y]],mixC(C.panel,C.struct,0.8),8);
    if(h>1){ g.strokeStyle=mixC(C.panel,C.struct,0.8); g.lineWidth=6; g.beginPath(); g.moveTo(x0+L,y); g.quadraticCurveTo(x0+L+12,y,x0+L+14,y-h); g.stroke(); }
    const vr=Math.max(8,r.h*0.18*(1-Math.min(0.6,st.hb*5))), vx=x0+L+(h>1?16:4)+vr, a=st.t*5; g.strokeStyle=C.hyd; g.lineWidth=1.6; for(let k=1;k<=3;k++){ g.beginPath(); g.arc(vx,y-vr*0.3,vr*k/3,a+k,a+k+4.5); g.stroke(); }
    ltx(g,"دوامة الطرف",vx,y+vr+14,{c:C.hyd,s:10,rtl:true}); ltx(g,"صافي تغير السحب "+(st.net>0?"+":"")+nf(st.net,1)+"%",r.x+r.w*0.45,r.y+r.h*0.92,{s:12,w:600,c:st.net<0?C.ctrl:C.power,rtl:true}); },
  plot(st){ return {x:[0,0.12],y:[-15,3],xl:"h / b",yl:"تغير السحب %",curves:[{f:hb=>{ const z=st.fn(0), w=st.fn(hb); return ((w.di+w.dp)-z.di)/st.tot0*100; },c:"hyd"},{f:hb=>{ const z=st.fn(0), w=st.fn(hb); return (w.di-z.di)/st.tot0*100; },c:"muted",dash:[4,3]}],hl:[{y:0,c:"line"}],dots:[{x:st.hb,y:st.net}],leg:[{c:"hyd",t:"صافي"},{c:"muted",t:"المستحث فقط",dash:[4,3]}]}; },
  ro(st){ return [["كفاءة الباع الفعالة e",nf(st.ee,3)],["تغير السحب المستحث",nf(st.dDi,1)+"%"],["سحب احتكاك مضاف ΔC_D0",nf(st.dp*1e4,1)+" counts"],["صافي تغير السحب الكلي",nf(st.net,1)+"%"]]; },
  eq:["e_eff ≈ e (1 + 1.9 h/b) (تقريب الصفائح الطرفية)","C_Di = C_L² / (π A e)"],
  note:["التقريب مأخوذ من بيانات الصفائح الطرفية القديمة، والجنيحات الحديثة المصممة جيداً أفضل منه قليلاً.","التوفير الحقيقي في الوقود يقاس بالرحلات: بضعة بالمئة في الرحلات الطويلة."],
  quiz:[{q:"الجنيح الطرفي يقلل بشكل رئيسي:",o:["السحب الطفيلي","السحب المستحث","الوزن"],a:1,why:"يضعف دوامة الطرف."},
        {q:"لماذا فائدته أقل في الرحلات القصيرة جداً؟",o:["لأن وقت الطيران المستقر قليل ووزنه يُحمل دائماً","لأنه يذوب","لأنه يزيد السرعة"],a:0,why:"معظم الرحلة صعود وهبوط، والوزن الإضافي حاضر."}],
  show:{ar:"اعرض طرف الجناح",fn:()=>lrnSel("wingtip")},
  ref:"الموضوع المقابل: تقليل السحب المستحث (Winglets, End Plates)."
});
LK("aaf",{
  ar:"الكوابح الهوائية ومعدل النزول", en:"Speed brakes and rate of descent",
  alt:"جناح ترتفع عليه ألواح الكوابح الهوائية والهواء يضطرب خلفها، ومنحنى معدل النزول مع نسبة رفع الكوابح",
  intro:["الطائرة النظيفة انسيابية جداً، فإذا أراد الطيار النزول بسرعة دون زيادة السرعة يحتاج سحباً إضافياً. الكوابح الهوائية ألواح على سطح الجناح العلوي ترتفع فتزيد السحب وتقلل الرفع قليلاً.",
         "معدل النزول = السرعة × (السحب − الدفع) ÷ الوزن. مضاعفة السحب تقريباً تضاعف معدل النزول، وهذا يساعد الطيار عندما تطلب المراقبة نزولاً سريعاً."],
  ctl:[{k:"dep",ar:"رفع الكوابح",min:0,max:100,step:1,v:50,f:v=>nf(v,0)+"%"},{k:"V",ar:"السرعة الحقيقية",min:220,max:340,step:1,v:290,f:v=>nf(v,0)+" kt"},{k:"m",ar:"الكتلة",min:50,max:79,step:0.5,v:62,f:v=>nf(v,1)+" t"}],
  calc(st){ const S=124.6, k=1/(Math.PI*0.8*9.45), rho=isa(20000*0.3048).rho, W=st.m*1000*G0; st.fn=d=>{ const V=st.V/KT, q=0.5*rho*V*V, CL=W/(q*S), D=q*S*(0.022+k*CL*CL+0.03*d/100), T=0.03*W; return V*(D-T)/W; };
    st.rod=st.fn(st.dep)*196.85; st.rod0=st.fn(0)*196.85; st.gam=Math.asin(st.fn(st.dep)/(st.V/KT))/D2R; st.nm=1000/(st.rod)*(st.V/60); },
  scene(g,r,st,C){ const ox=r.x+r.w*0.08, oy=r.y+r.h*0.55, ch=r.w*0.84, P=kFoil(g,ox,oy,ch,1,C,{m:0.02,t:0.12}); const n=3;
    for(let i=0;i<n;i++){ const x0=0.55+i*0.08, b=P(x0,P.yc(x0)+P.yt(x0)), L=ch*0.075, a=-st.dep/100*45*D2R; lline(g,[b,[b[0]+Math.cos(a)*L,b[1]+Math.sin(a)*L]],C.power,4); }
    if(st.dep>5) for(let i=0;i<12;i++){ const f=((st.t*0.7+i/12)%1), x=P(0.8,0)[0]+f*r.w*0.25, y=P(0.8,0.1)[1]-Math.sin(f*9+i)*r.h*0.06*st.dep/100; ldot(g,x,y,2,C.hyd,0.6); }
    ltx(g,"معدل النزول "+nf(st.rod,0)+" ft/min",r.x+r.w*0.5,r.y+r.h*0.92,{s:12,w:600,rtl:true}); },
  plot(st){ return {x:[0,100],y:[0,Math.max(st.fn(100)*196.85*1.1,2000)],xl:"رفع الكوابح %",yl:"ft/min",curves:[{f:d=>st.fn(d)*196.85,c:"power"}],dots:[{x:st.dep,y:st.rod}]}; },
  ro(st){ return [["معدل النزول",nf(st.rod,0)+" ft/min"],["بدون كوابح",nf(st.rod0,0)+" ft/min"],["زاوية النزول",nf(st.gam,1)+"°"],["مسافة كل 1000 ft",nf(st.nm,1)+" NM"]]; },
  eq:["معدل النزول = V (D − T) / W","D = q S (C_D0 + k C_L² + ΔC_D,sb)"],
  note:["المحركات هنا في الوضع الأدنى (دفع 3% من الوزن تقريباً) على 20000 قدم؛ الأرقام تقريبية.","في بعض الطائرات تُحد الكوابح الهوائية عند السرعات العالية لأنها تسبب اهتزازاً."],
  quiz:[{q:"الكوابح الهوائية تزيد معدل النزول لأنها:",o:["تزيد السحب","تزيد الدفع","تزيد الرفع"],a:0,why:"معدل النزول ∝ (D − T)."},
        {q:"بعد الهبوط تُرفع الكوابح أيضاً لـ:",o:["تقليل الرفع فتضغط العجلات على المدرج","زيادة السرعة","تبريد الفرامل"],a:0,why:"الضغط على العجلات يجعل الفرامل أكثر فعالية."}],
  show:{ar:"اعرض الكوابح الهوائية",fn:()=>lrnSel("spoilers",1)},
  ref:"الموضوع المقابل: أجهزة زيادة السحب (Spoilers and Speed Brakes)."
});
LK("aaf",{
  ar:"الانزلاق المائي على المدرج", en:"Hydroplaning",
  alt:"إطار يسير على مدرج مبتل ويتكون أمامه إسفين ماء يرفعه عن السطح مع زيادة السرعة، ومنحنى سرعة الانزلاق المائي مع ضغط الإطار",
  intro:["على مدرج عليه ماء كافٍ، يتكون أمام الإطار إسفين ماء. فوق سرعة معينة يرفع الماء الإطار عن المدرج فيفقد الاحتكاك تقريباً: لا فرامل ولا توجيه. هذا «الانزلاق المائي الديناميكي».",
         "السرعة تعتمد على ضغط الإطار: V ≈ 9√p عقدة للإطار الدوّار، و7.7√p للإطار المتوقف عند الملامسة. لهذا يهم ضغط الإطارات في الصيانة: الإطار الناقص الضغط ينزلق عند سرعة أقل."],
  ctl:[{k:"p",ar:"ضغط الإطار",min:30,max:230,step:1,v:200,f:v=>nf(v,0)+" psi"},{k:"dep",ar:"عمق الماء",min:0,max:10,step:0.1,v:3,f:v=>nf(v,1)+" mm"},{k:"V",ar:"السرعة الأرضية",min:40,max:170,step:1,v:125,f:v=>nf(v,0)+" kt"}],
  pre:[{ar:"737 الرئيسية",set:{p:205}},{ar:"إطار ناقص الضغط",set:{p:150}},{ar:"طائرة صغيرة",set:{p:35,V:60}}],
  calc(st){ st.vr=9*Math.sqrt(st.p); st.vn=7.7*Math.sqrt(st.p); st.deep=st.dep>=2.5; st.risk=st.deep&&st.V>=st.vn; st.full=st.deep&&st.V>=st.vr; st.k=clamp(st.V/st.vn,0,1.3); },
  scene(g,r,st,C){ const gy=r.y+r.h*0.78, cx=r.x+r.w*0.45, R=r.h*0.3, lift=st.risk?Math.min(R*0.1,(st.k-0.9)*R*0.2):0, cy=gy-R-lift;
    g.fillStyle=mixC(C.panel,C.ink,0.25); g.fillRect(r.x,gy,r.w,r.h*0.1); g.fillStyle="rgba(80,150,220,0.5)"; g.fillRect(r.x,gy-Math.min(st.dep,10)*1.5,r.w,Math.min(st.dep,10)*1.5);
    if(st.dep>0.5){ const wl=R*st.k*0.9, wh=Math.min(st.dep,10)*1.5+R*0.25*st.k; g.fillStyle="rgba(80,150,220,0.65)"; g.beginPath(); g.moveTo(cx+R*0.2,gy); g.lineTo(cx+R*0.2+wl,gy-Math.min(st.dep,10)*1.5); g.lineTo(cx+R*0.35,gy-wh); g.closePath(); g.fill(); }
    g.fillStyle="#262b30"; g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.fill(); g.fillStyle="#7d868e"; g.beginPath(); g.arc(cx,cy,R*0.55,0,Math.PI*2); g.fill(); const a=st.t*4*(st.full?0.2:1); lline(g,[[cx,cy],[cx+Math.cos(a)*R*0.5,cy+Math.sin(a)*R*0.5]],"#c9d0d6",3);
    larrow(g,cx+R*1.6,cy,cx+R*2.3,cy,C.ink,2,8); ltx(g,st.full?"انزلاق مائي كامل":st.risk?"خطر انزلاق مائي":st.deep?"تماس جيد":"الماء قليل",r.x+r.w*0.5,r.y+16,{s:13,w:600,c:st.risk?C.power:C.ctrl,rtl:true}); },
  plot(st){ return {x:[30,230],y:[0,180],xl:"ضغط الإطار psi",yl:"kt",curves:[{f:p=>9*Math.sqrt(p),c:"power"},{f:p=>7.7*Math.sqrt(p),c:"fuel",dash:[4,3]}],dots:[{x:st.p,y:st.V,c:st.risk?"power":"ctrl"}],leg:[{c:"power",t:"دوّار 9√p"},{c:"fuel",t:"متوقف 7.7√p",dash:[4,3]}]}; },
  ro(st){ return [["سرعة الانزلاق (إطار دوّار)",nf(st.vr,0)+" kt"],["سرعة الانزلاق (إطار متوقف)",nf(st.vn,0)+" kt"],["الماء كافٍ للانزلاق؟",st.deep?"نعم (≥ 2.5 مم تقريباً)":"لا"],["الحالة",st.full?"انزلاق كامل":st.risk?"خطر":"آمن نسبياً"]]; },
  eq:["V_hp ≈ 9 √p (kt ، p بالـ psi) لإطار دوّار","V_hp ≈ 7.7 √p لإطار لا يدور عند الملامسة"],
  note:["المعادلات تجريبية مشهورة (هورن)، وعمق الماء الحرج تقريبي.","تخديد المدرج (grooving) والإطارات ذات الأخاديد الجيدة تقلل الخطر؛ لذلك يُقاس عمق أخاديد الإطار في الفحص."],
  quiz:[{q:"إطار ناقص الضغط:",o:["ينزلق عند سرعة أقل","ينزلق عند سرعة أعلى","لا يتأثر"],a:0,why:"V ∝ √p."},
        {q:"إطار 737 بضغط 200 psi، سرعة الانزلاق للإطار الدوّار تقريباً:",o:["90 kt","127 kt","200 kt"],a:1,why:"9 × √200 ≈ 127."}],
  show:{ar:"اعرض العجلات",fn:()=>lrnSel("wheels")},
  ref:"الموضوع المقابل: أداء الهبوط على المدرج الملوث (Hydroplaning)."
});
LK("aaf",{
  ar:"طاقة الفرامل والإقلاع المرفوض", en:"Brake energy and the rejected takeoff",
  alt:"عجلة وقرص فرامل يتوهج بلون يتغير مع الحرارة، ومنحنى ارتفاع حرارة الفرامل مع السرعة عند بدء الفرملة",
  intro:["عند رفض الإقلاع بسرعة عالية يجب أن تمتص الفرامل معظم الطاقة الحركية للطائرة: ½mV². لطائرة بحجم 737 عند 140 عقدة تقارب 180 ميغاجول، تتحول إلى حرارة في أقراص الكربون.",
         "إذا ارتفعت الحرارة كثيراً تذوب سدادات خاصة في العجلات (fuse plugs) لتفرغ الإطارات بأمان بدل أن تنفجر. لهذا توجد جداول تبريد للفرامل، ومراقبة لحرارتها، وحدود لطاقة الفرامل في دليل الأداء."],
  ctl:[{k:"m",ar:"الكتلة",min:40,max:80,step:0.5,v:70,f:v=>nf(v,1)+" t"},{k:"V",ar:"السرعة عند بدء الفرملة",min:60,max:160,step:1,v:140,f:v=>nf(v,0)+" kt"},{k:"nb",ar:"عدد الفرامل",min:4,max:16,step:2,v:4,f:v=>nf(v,0)},{k:"hs",ar:"كتلة قرص كل فرامل",min:20,max:150,step:1,v:60,f:v=>nf(v,0)+" kg"}],
  pre:[{ar:"737",set:{m:70,nb:4,hs:60}},{ar:"A380 (16 فرامل)",set:{m:560,nb:16,hs:120}}],
  calc(st){ const V=st.V/KT; st.KE=0.5*st.m*1000*V*V/1e6; st.per=st.KE*0.85/st.nb; st.dT=st.per*1e6/(st.hs*1200); st.lvl=st.dT<200?0:st.dT<450?1:2; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.42, cy=r.y+r.h*0.48, R=Math.min(r.w*0.32,r.h*0.4), hot=clamp(st.dT/700,0,1);
    g.fillStyle="#262b30"; g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.fill(); g.fillStyle="#7d868e"; g.beginPath(); g.arc(cx,cy,R*0.62,0,Math.PI*2); g.fill();
    const col=`rgb(${Math.round(90+165*hot)},${Math.round(90+60*hot*(1-hot))},${Math.round(90*(1-hot))})`; g.fillStyle=col; g.beginPath(); g.arc(cx,cy,R*0.45,0,Math.PI*2); g.fill();
    for(let i=0;i<8;i++){ const a=i/8*Math.PI*2+st.t*0.3; lline(g,[[cx+Math.cos(a)*R*0.15,cy+Math.sin(a)*R*0.15],[cx+Math.cos(a)*R*0.42,cy+Math.sin(a)*R*0.42]],"#3a3f44",2); }
    if(hot>0.3) for(let i=0;i<10;i++){ const f=((st.t*0.5+i/10)%1); ldot(g,cx+(i-5)*R*0.08,cy-R*0.5-f*R*0.8,2,C.power,1-f); }
    ltx(g,["حرارة مقبولة","مراقبة وتبريد","خطر ذوبان سدادات العجلات"][st.lvl],r.x+r.w*0.5,r.y+r.h*0.95,{s:12,w:600,c:[C.ctrl,C.fuel,C.power][st.lvl],rtl:true}); },
  plot(st){ return {x:[60,160],y:[0,Math.max(900,st.dT*1.1)],xl:"السرعة kt",yl:"ΔT (K)",curves:[{f:v=>0.5*st.m*1000*(v/KT)**2*0.85/st.nb/(st.hs*1200),c:"power"}],hband:[{y0:450,y1:2000,c:"power",a:0.12}],dots:[{x:st.V,y:st.dT}]}; },
  ro(st){ return [["الطاقة الحركية",nf(st.KE,0)+" MJ"],["لكل فرامل (85% منها)",nf(st.per,1)+" MJ"],["ارتفاع حرارة القرص",nf(st.dT,0)+" K"]]; },
  eq:["KE = ½ m V²","ΔT ≈ E_brake / (m_hs · c) ، c ≈ 1.2 kJ/kg·K للكربون","الطاقة ∝ V²: سرعة أكبر 10% تعني طاقة أكبر 21%"],
  note:["القيم تقريبية؛ قدرة الفرامل الحقيقية وأوقات التبريد في دليل الأداء للطائرة.","بعد هبوط ثقيل أو رفض إقلاع تُترك الطائرة بعيداً عن الناس حتى تبرد الفرامل، وقد يُطلب فحصها."],
  quiz:[{q:"رفع سرعة رفض الإقلاع من 100 إلى 140 عقدة يزيد طاقة الفرامل تقريباً:",o:["40%","96%","400%"],a:1,why:"(140/100)² ≈ 1.96."},
        {q:"وظيفة سدادات الانصهار (fuse plugs):",o:["تفريغ الإطار بأمان قبل أن ينفجر من الحرارة","تبريد الفرامل","قياس الضغط"],a:0,why:"تذوب عند حرارة محددة."}],
  show:{ar:"اعرض العجلات والفرامل",fn:()=>lrnSel("wheels")},
  ref:"الموضوع المقابل: أداء الإقلاع والفرملة (Rejected Takeoff, Brake Energy)."
});
LK("aaf",{
  ar:"دورة برايتون: لماذا تهم نسبة الضغط", en:"The Brayton cycle: why pressure ratio matters",
  alt:"مخطط حرارة–أنتروبي لدورة المحرك النفاث بأربع نقاط، ومنحنيا الكفاءة الحرارية والشغل النوعي مع نسبة الضغط",
  intro:["المحرك النفاث يضغط الهواء ثم يحرق فيه الوقود ثم يمدده في التوربين والمخرج. كفاءته الحرارية تعتمد على نسبة الضغط: كلما زادت قلّ الوقود الضائع حرارةً في العادم.",
         "لكن حرارة دخول التوربين محدودة بالمعادن. مع نسبة ضغط كبيرة جداً يسخن الهواء كثيراً في الضاغط فلا يبقى مجال لإضافة حرارة، فيقل الشغل الذي يخرج من كل كيلوغرام هواء. لذلك تتطور المحركات بمواد تتحمل حرارة أعلى."],
  ctl:[{k:"PR",ar:"نسبة الضغط الكلية",min:2,max:60,step:0.5,v:40,f:v=>nf(v,1)},{k:"T3",ar:"حرارة دخول التوربين",min:1200,max:1900,step:10,v:1600,f:v=>nf(v,0)+" K"},{k:"T1",ar:"حرارة الهواء الداخل",min:220,max:310,step:1,v:288,f:v=>nf(v,0)+" K"}],
  calc(st){ const ta=PR=>Math.pow(PR,0.4/1.4); st.tau=ta(st.PR); st.eta=1-1/st.tau; st.wf=PR=>{ const t=ta(PR); return 1.005*st.T1*((st.T3/st.T1)*(1-1/t)-(t-1)); }; st.w=st.wf(st.PR); st.Ropt=Math.pow(Math.sqrt(st.T3/st.T1),3.5); st.wmax=st.wf(st.Ropt); st.T2=st.T1*st.tau; },
  scene(g,r,st,C){ const T1=st.T1, T2=st.T2, T3=st.T3, T4=T3/st.tau, s3=Math.log(T3/T2), x0=r.x+r.w*0.12, y0=r.y+r.h*0.88, sx=r.w*0.75/Math.max(s3*1.2,0.3), sy=r.h*0.78/2000, M=(s,T)=>[x0+s*sx,y0-T*sy];
    lline(g,[[x0,y0],[x0,r.y+r.h*0.08]],C.muted,1); lline(g,[[x0,y0],[x0+r.w*0.82,y0]],C.muted,1); ltx(g,"T",x0-8,r.y+r.h*0.1,{s:11,m:true}); ltx(g,"s",x0+r.w*0.82,y0+12,{s:11,m:true});
    const iso=(Ta,sa,sb)=>{ const p=[]; for(let i=0;i<=30;i++){ const s=sa+(sb-sa)*i/30; p.push(M(s,Ta*Math.exp(s-sa))); } return p; };
    g.fillStyle=mixC(C.panel,C.power,0.15); const poly=[M(0,T1),M(0,T2),...iso(T2,0,s3),M(s3,T4),...iso(T1,0,s3).reverse()]; g.beginPath(); poly.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])); g.closePath(); g.fill();
    lline(g,[M(0,T1),M(0,T2)],C.hyd,2.4); lline(g,iso(T2,0,s3),C.power,2.4); lline(g,[M(s3,T3),M(s3,T4)],C.ctrl,2.4); lline(g,iso(T1,0,s3),C.muted,2);
    [["1",0,T1],["2",0,T2],["3",s3,T3],["4",s3,T4]].forEach(([n,s,T])=>{ const q=M(s,T); ldot(g,q[0],q[1],4,C.ink); ltx(g,n,q[0]-10,q[1]-8,{s:11,w:600,m:true}); });
    ltx(g,"المساحة = الشغل الصافي",x0+r.w*0.4,r.y+r.h*0.1,{c:C.muted,s:10,rtl:true}); },
  plot(st){ return {x:[2,60],y:[0,1],xl:"نسبة الضغط",yl:"نسبة",curves:[{f:PR=>1-1/Math.pow(PR,0.4/1.4),c:"ctrl"},{f:PR=>Math.max(0,st.wf(PR)/st.wmax),c:"power"}],vl:[{x:Math.min(st.Ropt,60),c:"power",t:"أقصى شغل"}],dots:[{x:st.PR,y:st.eta,c:"ctrl"},{x:st.PR,y:Math.max(0,st.w/st.wmax),c:"power"}],leg:[{c:"ctrl",t:"الكفاءة"},{c:"power",t:"الشغل ÷ الأقصى"}]}; },
  ro(st){ return [["الكفاءة الحرارية المثالية",nf(st.eta*100,1)+"%"],["الشغل النوعي",nf(st.w,0)+" kJ/kg"],["نسبة الضغط لأقصى شغل",nf(st.Ropt,1)],["حرارة خروج الضاغط",nf(st.T2,0)+" K"]]; },
  eq:["η = 1 − 1 / PR^((γ−1)/γ)","w = c_p T₁ [ (T₃/T₁)(1 − 1/τ) − (τ − 1) ] ، τ = PR^((γ−1)/γ)","أقصى شغل عند τ = √(T₃/T₁)"],
  note:["دورة مثالية بلا خسائر في الضاغط والتوربين؛ المحرك الحقيقي أقل كفاءة.","المحركات الحديثة تتجاوز نسبة ضغط 40 وتبرد شفرات التوربين بهواء داخلي."],
  quiz:[{q:"زيادة نسبة الضغط ترفع:",o:["الكفاءة الحرارية","حرارة الهواء الداخل","وزن الوقود"],a:0,why:"η = 1 − 1/τ تزيد مع τ."},
        {q:"لماذا لا تُرفع نسبة الضغط بلا حد؟",o:["لأن الشغل النوعي يقل مع حرارة توربين محدودة","لأن الكفاءة تقل","لأن الضاغط يبرد"],a:0,why:"الهواء يقترب من حرارة التوربين قبل الاحتراق."}],
  show:{ar:"اعرض قلب المحرك",fn:()=>lrnSel("eng_core")},
  ref:"الموضوع المقابل: دورة المحرك النفاث (Brayton Cycle)."
});
const ABS=[[250,1.1],[500,2.8],[1000,5.0],[2000,9.0],[4000,22.9]];
const absAt=f=>{ const lf=Math.log(f); for(let i=1;i<ABS.length;i++) if(f<=ABS[i][0]){ const a=ABS[i-1], b=ABS[i], t=(lf-Math.log(a[0]))/(Math.log(b[0])-Math.log(a[0])); return Math.exp(Math.log(a[1])+(Math.log(b[1])-Math.log(a[1]))*t); } return ABS[ABS.length-1][1]; };
LK("aaf",{
  ar:"ضجيج الطائرات والمسافة", en:"Aircraft noise and distance",
  alt:"طائرة تطير فوق بيت تخرج منها موجات صوت دائرية، ومنحنى مستوى الصوت مع المسافة للانتشار وحده ومع امتصاص الهواء",
  intro:["الصوت ينتشر في كرة تكبر، فيقل مستواه 6 ديسيبل كلما تضاعفت المسافة. ويمتص الهواء الترددات العالية أكثر من المنخفضة، لذلك تسمع هدير الطائرة البعيدة «غليظاً».",
         "المقياس لوغاريتمي: زيادة 10 ديسيبل تُسمع كأنها ضعف الصوت تقريباً. لهذا تقلل المطارات الضجيج بإجراءات صعود حادة ومسارات تبتعد عن الأحياء، وتقلله المحركات بمراوح أكبر وأبطأ."],
  ctl:[{k:"L0",ar:"مستوى الصوت على 100 م",min:90,max:130,step:1,v:115,f:v=>nf(v,0)+" dB"},{k:"d",ar:"المسافة",min:100,max:5000,step:10,v:1000,f:v=>nf(v,0)+" m"},{k:"lf",ar:"التردد",min:2.4,max:3.6,step:0.01,v:3,f:v=>nf(Math.pow(10,v),0)+" Hz"}],
  calc(st){ st.f=Math.pow(10,st.lf); st.a=absAt(st.f); st.sp=20*Math.log10(st.d/100); st.ab=st.a*(st.d-100)/1000; st.L=st.L0-st.sp-st.ab; },
  scene(g,r,st,C){ const px=r.x+r.w*0.3, py=r.y+r.h*0.18, hx=r.x+r.w*0.3+Math.min(r.w*0.6,st.d/5000*r.w*0.6+40), hy=r.y+r.h*0.82;
    lline(g,[[r.x,hy+12],[r.x+r.w,hy+12]],C.line,2); tplane(g,px,py,Math.min(60,r.w*0.18),0,C);
    for(let k=0;k<5;k++){ const rr=((st.t*40+k*60)%300); g.strokeStyle=mixC(C.panel,C.hyd,clamp(1-rr/300,0,1)*0.8); g.lineWidth=1.5; g.beginPath(); g.arc(px,py,rr,0,Math.PI*2); g.stroke(); }
    g.fillStyle=mixC(C.panel,C.struct,0.5); g.fillRect(hx-14,hy-14,28,26); g.beginPath(); g.moveTo(hx-18,hy-14); g.lineTo(hx,hy-30); g.lineTo(hx+18,hy-14); g.closePath(); g.fill();
    ltx(g,nf(st.L,0)+" dB",hx,hy-40,{s:13,w:600,m:true,c:st.L>80?C.power:C.ctrl}); },
  plot(st){ return {x:[100,5000],y:[Math.min(40,st.L-10),st.L0+5],xl:"المسافة m",yl:"dB",curves:[{f:d=>st.L0-20*Math.log10(d/100),c:"muted",dash:[4,3]},{f:d=>st.L0-20*Math.log10(d/100)-st.a*(d-100)/1000,c:"hyd"}],dots:[{x:st.d,y:st.L}],leg:[{c:"muted",t:"انتشار فقط",dash:[4,3]},{c:"hyd",t:"مع امتصاص الهواء"}]}; },
  ro(st){ return [["المستوى عند البيت",nf(st.L,1)+" dB"],["خسارة الانتشار",nf(st.sp,1)+" dB"],["امتصاص الهواء",nf(st.ab,1)+" dB ("+nf(st.a,1)+" dB/km)"]]; },
  eq:["L = L₀ − 20 log₁₀(d/d₀) − α (d − d₀)","مضاعفة المسافة: −6 dB تقريباً"],
  note:["معامل الامتصاص تقريبي لهواء 20 °C ورطوبة 70%؛ يتغير كثيراً مع الحرارة والرطوبة.","الأرض والمباني والرياح تغير الصوت أيضاً، ولهذا تقاس الضوضاء حول المطارات بمحطات ثابتة."],
  quiz:[{q:"عند مضاعفة المسافة من الطائرة، يقل الصوت بحوالي:",o:["3 dB","6 dB","50%"],a:1,why:"20 log 2 ≈ 6 dB."},
        {q:"لماذا يبدو صوت الطائرة البعيدة غليظاً؟",o:["الهواء يمتص الترددات العالية أكثر","المحرك يغير صوته","الصوت يتسارع"],a:0,why:"معامل الامتصاص يزيد كثيراً مع التردد."}],
  show:{ar:"اعرض المحرك",fn:()=>lrnSel("engine")},
  ref:"الموضوع المقابل: الضوضاء والبيئة (Aircraft Noise)."
});
