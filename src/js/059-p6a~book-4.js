/* ---------------- Book 4: Mechanics of Flight ---------------- */
LESSONS.mof.push({
  ar:"الصعود والانزلاق: توازن القوى على مسار مائل", en:"Climbing and gliding flight", alt:"طائرة على مسار مائل مع أسهم الرفع والسحب والدفع والوزن، تصعد أو تنزلق",
  intro:["في الطيران المستقيم المائل تكون القوى الأربع متوازنة، لكن الوزن ينقسم: جزء عمودي على المسار يوازنه الرفع، وجزء على طول المسار يضاف للسحب في الصعود أو يدفع الطائرة في الانزلاق.",
         "بدون محرك تنزلق الطائرة بزاوية تعتمد فقط على L/D: كل متر ارتفاع يعطي L/D متر مسافة أفقية. لهذا الطائرة الشراعية (L/D حوالي 40 وأكثر) تقطع مسافات طويلة جداً."],
  ctl:[{k:"tw",ar:"الدفع / الوزن",min:0,max:0.35,step:0.005,v:0.25,f:v=>nf(v,3)},{k:"LD",ar:"نسبة الرفع إلى السحب L/D",min:6,max:50,step:0.5,v:17,f:v=>nf(v,1)},{k:"V",ar:"السرعة",min:30,max:250,step:1,v:85,f:v=>nf(v,0)+" m/s"}],
  pre:[{ar:"صعود بعد الإقلاع",set:{tw:0.25,LD:12,V:85}},{ar:"A380 بلا دفع",set:{tw:0,LD:19,V:130}},{ar:"طائرة شراعية",set:{tw:0,LD:45,V:30}}],
  init(st){ st.ph=0; },
  calc(st){ const k=1/st.LD, R=Math.sqrt(1+k*k), x=clamp(st.tw/R,-1,1); st.gam=Math.asin(x)-Math.atan(k); st.roc=st.V*Math.sin(st.gam); st.gd=10*Math.abs(1/Math.tan(Math.min(-1e-4,st.gam))); },
  step(st,dt){ st.ph+=dt*0.18; },
  draw(g,W,H,st,C){
    const gm=st.gam, gx=W*0.08, gy=gm>=0?H*0.85:H*0.15, L=W*0.84, ex=gx+L*Math.cos(gm), ey=gy-L*Math.sin(gm);
    lline(g,[[0,H*0.92],[W,H*0.92]],C.line,2); lline(g,[[gx,gy],[ex,ey]],C.accent,1.6,[6,5]);
    const f=st.ph%1, px=gx+(ex-gx)*f, py=gy+(ey-gy)*f;
    lplane(g,px,py,W*0.16,gm/D2R,C,{flip:true});
    const k=H*0.22, c=Math.cos(gm), s=Math.sin(gm), tx=Math.cos(gm), ty=-Math.sin(gm);
    larrow(g,px,py,px-ty*k*c* -1,py+tx*k*c*-1,C.hyd,3,9);
    larrow(g,px,py,px-tx*k*c/st.LD*2.5,py-ty*k*c/st.LD*2.5,C.power,3,9);
    if(st.tw>0) larrow(g,px,py,px+tx*k*st.tw*2.5,py+ty*k*st.tw*2.5,C.ctrl,3,9);
    larrow(g,px,py,px,py+k,C.ink,3,9);
    ltx(g,"L",px+ty*k*c-12,py-tx*k*c-6,{c:C.hyd,s:12,w:600,m:true});
    ltx(g,(gm>=0?"زاوية الصعود ":"زاوية الانزلاق ")+nf(Math.abs(gm)/D2R,2)+"°",W-12,20,{s:13,w:600,a:"right",rtl:true});
    ltx(g,"(الأسهم: L رفع، D سحب ×2.5، T دفع ×2.5، W وزن)",W-12,40,{c:C.muted,s:10,a:"right",rtl:true});
  },
  ro(st){ return [["زاوية المسار γ",nf(st.gam/D2R,2)+"°"],["معدل الصعود",nf(st.roc,2)+" m/s ("+nf(st.roc*196.85,0)+" ft/min)"],["نسبة الانزلاق",nf(st.LD,1)+" : 1"],["مسافة الانزلاق من 10 كم",st.gam<0?nf(st.gd,0)+" km":"— (الطائرة تصعد)"]]; },
  eq:["على المسار: T − D − W sin γ = 0","عمودياً عليه: L − W cos γ = 0","sin γ = T/W − (cos γ)/(L/D)","الانزلاق (T = 0): tan γ = 1/(L/D)"],
  note:["في 2001 انزلقت طائرة A330 بلا وقود حوالي 120 كم وهبطت في جزر الأزور، مثال حقيقي على قيمة L/D العالية.","زاوية الانزلاق لا تعتمد على الوزن؛ الطائرة الأثقل تنزلق بنفس الزاوية لكن بسرعة أعلى.","أفضل زاوية صعود ليست أفضل معدل صعود: الأولى لتجاوز العوائق، والثانية للوصول لارتفاع بأسرع وقت."],
  quiz:[{q:"طائرة L/D = 18 فقدت محركاتها على ارتفاع 10 كم. تقريباً كم تقطع؟",o:["18 كم","180 كم","1800 كم"],a:1,why:"مسافة الانزلاق ≈ الارتفاع × L/D = 10 × 18 = 180 كم."},
        {q:"هل يغيّر الوزن زاوية الانزلاق؟",o:["نعم، الأثقل ينزلق أطول","لا، الزاوية تعتمد على L/D فقط","نعم، الأثقل ينزلق أقصر"],a:1,why:"tan γ = D/L؛ الوزن يغيّر السرعة المناسبة فقط."}],
  ref:"الموضوع المقابل: الطيران الصاعد والانزلاقي (Climbing and Gliding Flight)."
});

LESSONS.mof.push({
  ar:"الانعطاف ومعامل الحمل", en:"Turning flight and load factor", alt:"منظر علوي لمسار دائري، ومنظر خلفي لطائرة مائلة مع تحليل الرفع إلى مركبة رأسية وأفقية، ومؤشر الجاذبية",
  intro:["لكي تنعطف الطائرة تميل جناحيها، فيميل الرفع ويعطي مركبة أفقية تسحب الطائرة نحو مركز الدائرة. لكن المركبة الرأسية لازم تبقى مساوية للوزن، فيجب أن يكبر الرفع الكلي.",
         "نسبة الرفع إلى الوزن اسمها «معامل الحمل» n. عند ميل 60° يكون n = 2: الركاب يشعرون بضعف وزنهم، والجناح يحمل ضعف الحمل، وسرعة الانهيار تزيد بحوالي 41%."],
  ctl:[{k:"ph",ar:"زاوية الميل φ",min:0,max:70,step:0.5,v:30,f:v=>nf(v,1)+"°"},{k:"V",ar:"السرعة الحقيقية",min:40,max:250,step:1,v:120,f:v=>nf(v,0)+" m/s ("+nf(v*KT,0)+" kt)"}],
  pre:[{ar:"انعطاف قياسي لطائرة نقل (25°)",set:{ph:25,V:120}},{ar:"ميل 60°: ضعف الحمل",set:{ph:60,V:120}},{ar:"طائرة صغيرة بطيئة",set:{ph:30,V:50}}],
  init(st){ st.a=0; },
  calc(st){ const p=st.ph*D2R; st.n=1/Math.cos(p); st.R=st.ph>0.01?st.V*st.V/(G0*Math.tan(p)):Infinity; st.w=st.ph>0.01?G0*Math.tan(p)/st.V:0; st.T360=st.w>0?2*Math.PI/st.w:Infinity; st.vs=(Math.sqrt(st.n)-1)*100; },
  step(st,dt){ st.a+=st.w*dt*6; },
  draw(g,W,H,st,C){
    const cx=W*0.27, cy=H*0.5, Rp=Math.min(W*0.22,H*0.4), rr=isFinite(st.R)?clamp(Rp*Math.sqrt(st.R/3000),12,Rp):Rp;
    g.strokeStyle=C.line; g.setLineDash([5,5]); g.lineWidth=1.2; g.beginPath(); if(isFinite(st.R)) g.arc(cx,cy,rr,0,Math.PI*2); else { g.moveTo(cx-Rp,cy); g.lineTo(cx+Rp,cy); } g.stroke(); g.setLineDash([]);
    const a=st.a, px=isFinite(st.R)?cx+rr*Math.cos(a):cx+((st.t*40)%(2*Rp))-Rp, py=isFinite(st.R)?cy+rr*Math.sin(a):cy, hd=isFinite(st.R)?a+Math.PI/2:0;
    g.save(); g.translate(px,py); g.rotate(hd); g.fillStyle=C.accent; g.beginPath(); g.moveTo(11,0); g.lineTo(-7,-8); g.lineTo(-3,0); g.lineTo(-7,8); g.closePath(); g.fill(); g.restore();
    ltx(g,"منظر علوي · نصف القطر "+(isFinite(st.R)?nf(st.R/1000,2)+" km":"∞"),cx,H-12,{c:C.muted,s:10,rtl:true});
    const bx=W*0.72, by=H*0.52, sp=Math.min(W*0.2,H*0.35), p=st.ph*D2R;
    g.save(); g.translate(bx,by); g.rotate(p); g.strokeStyle=C.ink; g.lineWidth=4; g.beginPath(); g.moveTo(-sp,0); g.lineTo(sp,0); g.stroke();
    g.fillStyle=mixC(C.panel,C.struct,0.35); g.lineWidth=1.5; g.beginPath(); g.arc(0,0,sp*0.12,0,Math.PI*2); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-3,-sp*0.1); g.lineTo(0,-sp*0.45); g.lineTo(3,-sp*0.1); g.closePath(); g.fillStyle=C.ink; g.fill(); g.restore();
    const k=H*0.2, Lx=Math.sin(p)*k*st.n, Ly=-Math.cos(p)*k*st.n;
    larrow(g,bx,by,bx+Lx,by+Ly,C.hyd,3.5,10); lline(g,[[bx,by],[bx,by-k]],C.hyd,1.5,[4,4]); lline(g,[[bx,by-k],[bx+Lx,by+Ly]],C.hyd,1.5,[4,4]);
    larrow(g,bx,by,bx,by+k,C.power,3.5,10); ltx(g,"L = "+nf(st.n,2)+" W",bx+Lx+8,by+Ly,{c:C.hyd,s:12,w:600,a:"left",m:true}); ltx(g,"W",bx+8,by+k-6,{c:C.power,s:12,w:600,a:"left",m:true});
    ltx(g,"n = "+nf(st.n,2)+" g",W-14,22,{s:16,w:600,a:"right",m:true});
  },
  ro(st){ return [["معامل الحمل n",nf(st.n,2)+" g"],["نصف قطر الانعطاف",isFinite(st.R)?nf(st.R,0)+" m":"—"],["معدل الانعطاف",nf(st.w/D2R,2)+" °/s"],["زمن دورة كاملة",isFinite(st.T360)?nf(st.T360,0)+" s":"—"],["زيادة سرعة الانهيار",nf(st.vs,1)+"%"]]; },
  eq:["n = L/W = 1 / cos φ","R = V² / (g · tan φ)","ω = g · tan φ / V","V_s,turn = V_s · √n"],
  note:["الانعطاف «القياسي» للطائرات بمعدل 3 درجات في الثانية، أي دورة كاملة في دقيقتين.","بنفس الميل، الطائرة الأسرع تحتاج دائرة أكبر بكثير (R يتناسب مع V²).","طائرات النقل محددة هيكلياً عادة بحوالي 2.5g، لذلك الميل في الطيران العادي نادراً ما يتجاوز 30°."],
  quiz:[{q:"عند ميل 60° في انعطاف مستوٍ، معامل الحمل:",o:["1.15","1.41","2"],a:2,why:"n = 1/cos 60° = 2."},
        {q:"إذا ضاعفت السرعة بنفس زاوية الميل، نصف قطر الانعطاف:",o:["يتضاعف","يصير 4 أضعاف","لا يتغيّر"],a:1,why:"R = V²/(g tan φ)، فمضاعفة V تضرب R في 4."}],
  show:{ar:"اعرض الجنيحات على الطائرة",fn:()=>lrnSel("aileron",1)},
  ref:"الموضوع المقابل: الانعطاف ومعامل الحمل (Turning Flight, Load Factor)."
});

LESSONS.mof.push({
  ar:"الإقلاع: المسافة على المدرج", en:"Takeoff: ground roll", alt:"مدرج عليه علامات مسافة، والطائرة تتسارع حتى سرعة الإقلاع ثم ترفع أنفها وتصعد، مع مؤشر السرعة",
  intro:["أثناء الجري على المدرج يدفع المحرك الطائرة للأمام، ويقاومها السحب واحتكاك العجلات. نحسب التسارع لحظة بلحظة حتى تصل لسرعة الإقلاع (حوالي 1.2 من سرعة الانهيار).",
         "المطارات المرتفعة والأيام الحارة تقلل كثافة الهواء: المحرك يعطي دفعاً أقل، والجناح يحتاج سرعة أعلى لنفس الرفع، فتطول المسافة كثيراً. جرّب إعداد «يوم حار في مطار مرتفع»."],
  ctl:[{k:"w",ar:"الوزن (نسبة من أقصى وزن إقلاع)",min:0.6,max:1,step:0.01,v:0.9,f:v=>nf(v*100,0)+"%"},{k:"thr",ar:"الدفع المستخدم",min:0.7,max:1,step:0.01,v:1,f:v=>nf(v*100,0)+"%"},
       {k:"el",ar:"ارتفاع المطار",min:0,max:3000,step:50,v:0,f:v=>nf(v,0)+" m"},{k:"dT",ar:"الحرارة فوق القياسي",min:0,max:35,step:1,v:0,f:v=>"ISA + "+nf(v,0)+"°C"},{k:"clto",ar:"أقصى C_L بالقلابات",min:1.8,max:2.6,step:0.05,v:2.2,f:v=>nf(v,2)}],
  pre:[{ar:"يوم قياسي عند سطح البحر",set:{el:0,dT:0}},{ar:"يوم حار في مطار مرتفع",set:{el:2000,dT:30}},{ar:"وزن خفيف",set:{w:0.7,el:0,dT:0}}],
  init(st){ st.tp=0; }, onSet(st){ st.tp=0; },
  calc(st){ const ac=lac(), Ti=288.15-0.0065*st.el, p=101325*Math.pow(Ti/288.15,5.25588), Ta=Ti+st.dT, rho=p/(RAIR*Ta), sig=rho/1.225, a=Math.sqrt(GAM*RAIR*Ta);
    const Wt=st.w*ac.mtow*G0, m=Wt/G0, S=ac.S, Vs=Math.sqrt(2*Wt/(rho*S*st.clto)), Vl=1.2*Vs, AR=ac.b*ac.b/S, k=1/(Math.PI*ac.e*AR), CLg=0.8, CDg=0.036+k*CLg*CLg, mu=0.02, T0=ac.T0*st.thr*Math.pow(sig,0.75);
    let V=0,x=0,t=0; const tr=[[0,0,0]]; while(V<Vl&&t<240){ const T=T0*(1-0.6*V/a), q=0.5*rho*V*V, acc=(T-q*S*CDg-mu*(Wt-q*S*CLg))/m; if(acc<=0.02) break; V+=acc*0.05; x+=V*0.05; t+=0.05; tr.push([t,x,V]); }
    st.ac=ac; st.ok=V>=Vl; st.Vl=Vl; st.sg=x; st.tg=t; st.tr=tr; st.sig=sig; st.a0=(T0-mu*Wt)/m/G0; st.tot=x+3*Vl; },
  step(st,dt){ st.tp+=dt*3; if(st.tp>st.tg+9) st.tp=0; },
  draw(g,W,H,st,C){
    const Lr=Math.max(3500,Math.ceil(st.tot*1.25/500)*500), x0=W*0.04, x1=W*0.96, ry=H*0.62, X=d=>x0+d/Lr*(x1-x0);
    g.fillStyle=mixC(C.panel,C.ink,0.65); g.fillRect(x0,ry,x1-x0,H*0.08); g.strokeStyle=C.panel; g.setLineDash([14,12]); g.lineWidth=2; g.beginPath(); g.moveTo(x0,ry+H*0.04); g.lineTo(x1,ry+H*0.04); g.stroke(); g.setLineDash([]);
    for(let d=0;d<=Lr;d+=500){ lline(g,[[X(d),ry+H*0.08],[X(d),ry+H*0.08+6]],C.muted,1); ltx(g,nf(d,0),X(d),ry+H*0.08+16,{c:C.muted,s:9,m:true}); }
    if(st.ok){ lline(g,[[X(st.sg),ry-H*0.3],[X(st.sg),ry+H*0.08]],C.hyd,1.4,[4,4]); ltx(g,"رفع العجلات",X(st.sg),ry-H*0.3-10,{c:C.hyd,s:11,rtl:true}); }
    let x,V,alt=0,pit=0; const tr=st.tr;
    if(st.tp<=st.tg||!st.ok){ let i=0; while(i<tr.length-1&&tr[i+1][0]<st.tp) i++; x=tr[i][1]; V=tr[i][2]; }
    else { const tt=st.tp-st.tg; V=st.Vl; x=st.sg+V*tt; pit=Math.min(8,tt*4); alt=Math.max(0,(tt-1.5))*V*0.08; }
    lplane(g,X(Math.min(x,Lr)),ry-10-alt*(H*0.4/300),Math.min(W*0.22,H*0.5),pit,C,{flip:true});
    ltx(g,nf(V*KT,0)+" kt",W-14,22,{s:16,w:600,a:"right",m:true}); ltx(g,"الزمن مسرّع ×3",W-14,42,{c:C.muted,s:10,a:"right",rtl:true});
    if(!st.ok) ltx(g,"الدفع لا يكفي للوصول لسرعة الإقلاع",W/2,H*0.25,{c:C.power,s:13,w:600,rtl:true});
  },
  ro(st){ return [["سرعة رفع العجلات",nf(st.Vl*KT,0)+" kt"],["مسافة الجري على الأرض",st.ok?nf(st.sg,0)+" m":"—"],["زمن الجري",st.ok?nf(st.tg,0)+" s":"—"],["التسارع الأولي",nf(st.a0,3)+" g"],["نسبة الكثافة σ",nf(st.sig,3)],["الطائرة",st.ac.n]]; },
  eq:["m dV/dt = T − D − μ(W − L)","V_LOF ≈ 1.2 V_s ,  V_s = √(2W / (ρ S C_L,max))","S_g = ∫ V dt   (تكامل عددي كل 0.05 s)","ρ = p / (R T) ,  T = T_ISA + ΔT"],
  note:["مسافة الإقلاع الرسمية أطول من الجري على الأرض: تشمل الارتفاع حتى 35 قدماً وهوامش أمان لفقدان محرك.","في الأيام الحارة تخفض الشركات الحمولة أحياناً في المطارات المرتفعة لأن المدرج لا يكفي.","معامل احتكاك العجلات على مدرج جاف حوالي 0.02، وعلى العشب أو الثلج أعلى بكثير."],
  quiz:[{q:"لماذا يطول الإقلاع في مطار مرتفع حار؟",o:["لأن الجاذبية أقوى","لأن الكثافة أقل: دفع أقل وسرعة إقلاع أعلى","لأن المدرج أقصر"],a:1,why:"الهواء الأقل كثافة يقلل الدفع ويزيد سرعة الانهيار الحقيقية، فيتأثر الطرفان معاً."},
        {q:"إذا زاد الوزن، سرعة رفع العجلات:",o:["تقل","تزيد مع جذر الوزن","لا تتغيّر"],a:1,why:"V_s ∝ √W، فالطائرة الأثقل تحتاج سرعة أكبر لتولّد رفعاً أكبر."}],
  ref:"الموضوع المقابل: أداء الإقلاع والهبوط (Takeoff and Landing Performance).",
  show:{ar:"اعرض العجلات الرئيسية",fn:()=>lrnSel("gear_main",1)}
});

LESSONS.mof.push({
  ar:"المروحة: نظرية الزخم", en:"Propellers: momentum (actuator-disk) theory", alt:"مروحة تدور والهواء يتسارع خلفها وينكمش أنبوب التدفق، مع أسهم السرعة قبل المروحة وبعدها",
  intro:["المروحة تشبه قرصاً رقيقاً يرفع ضغط الهواء المار خلاله، فيتسارع الهواء للخلف. نصف الزيادة في السرعة تحدث قبل القرص ونصفها بعده، لذلك ينكمش أنبوب الهواء خلف المروحة.",
         "الكفاءة المثالية تعتمد على «حمل القرص»: قرص كبير يدفع كمية هواء كبيرة بزيادة سرعة صغيرة فيكون أكفأ. لهذا مراوح الطائرات الحديثة كبيرة وبطيئة نسبياً."],
  ctl:[{k:"T",ar:"الدفع لكل مروحة",min:1,max:40,step:0.5,v:15,f:v=>nf(v,1)+" kN"},{k:"D",ar:"قطر المروحة",min:1.5,max:5,step:0.05,v:3.9,f:v=>nf(v,2)+" m"},{k:"V",ar:"سرعة الطيران",min:0,max:150,step:1,v:70,f:v=>nf(v,0)+" m/s"},{k:"h",ar:"الارتفاع",min:0,max:8000,step:100,v:0,f:v=>nf(v/1000,1)+" km"}],
  init(st){ st.p=[]; st.ang=0; for(let i=0;i<150;i++) st.p.push({x:Math.random(),r:Math.random()*2-1}); },
  calc(st){ const rho=isa(st.h).rho, A=Math.PI*st.D*st.D/4, T=st.T*1000; st.A=A; st.vi=-st.V/2+Math.sqrt(st.V*st.V/4+T/(2*rho*A)); st.Vw=st.V+2*st.vi;
    st.eta=st.V>0?st.V/(st.V+st.vi):0; st.P=T*(st.V+st.vi); st.dl=T/A; st.ar=(st.V+st.vi)/(st.V+2*st.vi); },
  step(st,dt){ st.ang+=dt*30; const ref=Math.max(10,st.Vw); st.p.forEach(q=>{ const x=q.x, v=x<0.4?st.V+st.vi*(1+Math.tanh((x-0.4)*8)):st.V+st.vi*(1+Math.tanh((x-0.4)*8)); q.x+=dt*(0.03+0.3*v/ref); if(q.x>1){ q.x=0; q.r=Math.random()*2-1; } }); },
  draw(g,W,H,st,C){
    const cy=H*0.5, xd=W*0.4, Rd=H*0.3, rUp=st.V>0.5?Math.min(1.6*Rd,Rd*Math.sqrt((st.V+st.vi)/st.V)):1.6*Rd, rDn=Rd*Math.sqrt((st.V+st.vi)/(st.V+2*st.vi)), rad=x=>rUp+(rDn-rUp)*(1+Math.tanh((x-0.4)*8))/2;
    const top=[],bot=[]; for(let i=0;i<=60;i++){ const x=i/60; top.push([x*W,cy-rad(x)]); bot.push([x*W,cy+rad(x)]); }
    lline(g,top,C.muted,1.2,[5,4]); lline(g,bot,C.muted,1.2,[5,4]);
    st.p.forEach(q=>{ const y=cy+q.r*rad(q.x)*0.95; ldot(g,q.x*W,y,1.9,q.x>0.4?C.ctrl:C.muted,0.85); });
    g.fillStyle=C.ink; g.beginPath(); g.ellipse(xd,cy,6,Rd*0.12,0,0,Math.PI*2); g.fill();
    for(let i=0;i<4;i++){ const a=st.ang+i*Math.PI/2, y=Math.sin(a)*Rd; g.strokeStyle=C.ink; g.globalAlpha=0.3+0.5*Math.abs(Math.cos(a)); g.lineWidth=5; g.beginPath(); g.moveTo(xd,cy); g.lineTo(xd+Math.cos(a)*4,cy+y); g.stroke(); } g.globalAlpha=1;
    const k=W*0.0012; [[W*0.1,st.V,"V"],[xd+14,st.V+st.vi,"V + v"],[W*0.85,st.Vw,"V + 2v"]].forEach(([x,v,l])=>{ larrow(g,x,cy,x+Math.max(4,v*k*2),cy,C.accent,2.5,8); ltx(g,l+" = "+nf(v,1),x,cy+22,{s:10,a:"left",m:true}); });
    ltx(g,"أنبوب الهواء ينكمش خلف المروحة",W-12,18,{c:C.muted,s:11,a:"right",rtl:true});
  },
  ro(st){ return [["السرعة المستحثة عند القرص v",nf(st.vi,2)+" m/s"],["سرعة الهواء البعيدة خلفها",nf(st.Vw,1)+" m/s"],["الكفاءة المثالية",st.V>0?nf(st.eta*100,1)+"%":"— (عند السكون)"],["القدرة المثالية",nf(st.P/1000,0)+" kW"],["حمل القرص T/A",nf(st.dl,0)+" N/m²"]]; },
  eq:["T = ṁ · 2v = 2ρA v (V + v)","v = −V/2 + √(V²/4 + T/(2ρA))","η_ideal = V/(V + v) = 2 / (1 + √(1 + T/(qA)))","P_ideal = T (V + v)"],
  note:["الكفاءة الحقيقية للمراوح الجيدة حوالي 80 إلى 88%، أقل من المثالية بسبب سحب الشفرات والدوران في الهواء الخارج.","نظرية الزخم لا تعرف شكل الشفرة؛ تعطي الحد الأعلى للكفاءة لحمل قرص معيّن.","نفس الفكرة تفسّر لماذا محركات التوربوفان الحديثة ذات مراوح كبيرة."],
  quiz:[{q:"أين يحدث نصف التسارع الكلي للهواء؟",o:["كله بعد المروحة","نصفه قبل القرص ونصفه بعده","كله قبل المروحة"],a:1,why:"عند القرص السرعة V + v، وبعيداً خلفه V + 2v."},
        {q:"لزيادة الكفاءة المثالية بنفس الدفع:",o:["نصغّر القطر","نكبّر القطر (حمل قرص أقل)","نزيد سرعة الدوران فقط"],a:1,why:"مساحة أكبر تعني زيادة سرعة أصغر لنفس الدفع، فطاقة ضائعة أقل."}],
  ref:"الموضوع المقابل: المراوح ونظرية الزخم (Propellers — Momentum Theory)."
});
