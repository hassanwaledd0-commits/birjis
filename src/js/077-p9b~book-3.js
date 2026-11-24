/* ---------- Book 3: Aircraft Design — 10 more lessons ---------- */
const kornM=(tc,L,CL,k)=>{ const c=Math.cos(L*D2R); return k/c-tc/(c*c)-CL/(10*c*c*c); };
LK("rds",{
  ar:"معادلة كورن: السماكة والميلان وارتفاع السحب", en:"The Korn equation: thickness, sweep and drag divergence",
  alt:"مقطع جناح بسماكة قابلة للتغيير ومنظر علوي للميلان، ومنحنى رقم ماخ لارتفاع السحب مع نسبة السماكة",
  intro:["المصمم يريد جناحاً سميكاً لأنه أخف وأقوى ويتسع لوقود أكثر، لكن السماكة تقرّب الصدمات وارتفاع السحب. معادلة كورن تجمع الثلاثة: السماكة والميلان ومعامل الرفع في رقم ماخ واحد يبدأ عنده السحب بالارتفاع.",
         "المقاطع فوق الحرجة (supercritical) تعطي ماخ أعلى بنفس السماكة، ولذلك تستخدمها كل طائرات النقل الحديثة. والميلان يرفع الحد لكنه يكلّف وزناً."],
  ctl:[{k:"tc",ar:"نسبة السماكة t/c",min:0.08,max:0.18,step:0.005,v:0.12,f:v=>nf(v*100,1)+"%"},{k:"L",ar:"زاوية الميلان",min:0,max:40,step:0.5,v:25,f:v=>nf(v,1)+"°"},{k:"CL",ar:"معامل الرفع في الطيران",min:0.2,max:0.8,step:0.01,v:0.5,f:v=>nf(v,2)}],
  tog:[{k:"sc",ar:"مقطع فوق حرج",v:true}],
  calc(st){ st.k=st.sc?0.95:0.87; st.Mdd=kornM(st.tc,st.L,st.CL,st.k); st.Mcr=st.Mdd-0.108; },
  scene(g,r,st,C){ kFoil(g,r.x+r.w*0.08,r.y+r.h*0.32,r.w*0.84,0,C,{m:st.sc?0.01:0.02,p:0.5,t:st.tc});
    const rx=r.x+r.w*0.5, ry=r.y+r.h*0.55, sp=r.w*0.36, L=st.L*D2R, ch=r.h*0.14; g.fillStyle=mixC(C.panel,C.struct,0.3); g.strokeStyle=C.ink; g.lineWidth=1.3;
    [-1,1].forEach(s=>{ g.beginPath(); g.moveTo(rx,ry); g.lineTo(rx+s*sp,ry+sp*Math.tan(L)); g.lineTo(rx+s*sp,ry+sp*Math.tan(L)+ch*0.4); g.lineTo(rx,ry+ch); g.closePath(); g.fill(); g.stroke(); });
    ltx(g,"Mdd = "+nf(st.Mdd,3),r.x+r.w*0.5,r.y+r.h*0.95,{s:14,w:600,m:true,c:C.ctrl}); },
  plot(st){ return {x:[0.06,0.2],y:[0.55,1],xl:"t/c",yl:"Mdd",curves:[{f:t=>kornM(t,st.L,st.CL,st.k),c:"hyd"},{f:t=>kornM(t,st.L,st.CL,st.sc?0.87:0.95),c:"muted",dash:[4,3]}],dots:[{x:st.tc,y:st.Mdd}],leg:[{c:"hyd",t:st.sc?"فوق حرج":"تقليدي"},{c:"muted",t:st.sc?"تقليدي":"فوق حرج",dash:[4,3]}]}; },
  ro(st){ return [["ماخ ارتفاع السحب Mdd",nf(st.Mdd,3)],["ماخ الحرج تقريباً",nf(st.Mcr,3)],["κ للمقطع",nf(st.k,2)]]; },
  eq:["Mdd = κ/cos Λ − (t/c)/cos²Λ − C_L/(10 cos³Λ)","κ ≈ 0.87 تقليدي ، 0.95 فوق حرج","Mcr ≈ Mdd − (0.1/80)^(1/3)"],
  note:["المعادلة تقديرية للتصميم الأولي ودقتها في حدود ±0.02 من ماخ.","زيادة الوزن (C_L أعلى) تخفض Mdd قليلاً، ولهذا تطير الطائرة الثقيلة أبطأ قليلاً."],
  quiz:[{q:"لرفع Mdd بدون تغيير الميلان:",o:["زيادة السماكة","تقليل السماكة أو استخدام مقطع فوق حرج","زيادة C_L"],a:1,why:"السماكة والرفع يخفضان Mdd، والمقطع فوق الحرج يرفع κ."},
        {q:"لماذا لا يُصنع الجناح رقيقاً جداً؟",o:["لأنه أثقل ويتسع لوقود أقل","لأنه أبطأ","لأنه أقل رفعاً دائماً"],a:0,why:"الجناح الرقيق يحتاج هيكلاً أثقل لنفس الانحناء ومساحة خزانات أقل."}],
  show:{ar:"اعرض صندوق الجناح",fn:()=>lrnSel("wingbox")},
  ref:"الموضوع المقابل: اختيار المقطع والسماكة (Airfoil Selection, Thickness Ratio)."
});
const lapse=(alt,M,bpr)=>Math.pow(isa(alt*0.3048).rho/1.225,0.7)*Math.max(0.05,1-(0.15+0.05*bpr)*M);
LK("rds",{
  ar:"انخفاض دفع المحرك مع الارتفاع والسرعة", en:"Engine thrust lapse with altitude and speed",
  alt:"محرك بسهم دفع يقصر مع الارتفاع والسرعة، ومنحنيات نسبة الدفع إلى الدفع الثابت مع ماخ لعدة ارتفاعات",
  intro:["الدفع المكتوب في مواصفات المحرك هو دفعه ثابتاً على الأرض. في الجو يقل كثيراً: الهواء أخف فيدخل المحرك كتلة أقل، والسرعة تقلل الفرق بين سرعة العادم وسرعة الطيران.",
         "المحرك ذو نسبة التجاوز العالية يخسر دفعاً أكثر مع السرعة. لذلك قد يكون الشرط الأصعب على المصمم هو الدفع في الطيران أو الصعود عند الارتفاع العالي، لا الإقلاع."],
  ctl:[{k:"bpr",ar:"نسبة التجاوز",min:0,max:12,step:0.5,v:5,f:v=>nf(v,1)},{k:"alt",ar:"الارتفاع",min:0,max:41000,step:500,v:35000,f:v=>nf(v,0)+" ft"},{k:"M",ar:"رقم ماخ",min:0,max:0.9,step:0.01,v:0.78,f:v=>nf(v,2)},{k:"T0",ar:"الدفع الثابت",min:80,max:350,step:1,v:120,f:v=>nf(v,0)+" kN"}],
  pre:[{ar:"CFM56 تقريباً",set:{bpr:5.5,T0:120}},{ar:"محرك A380 تقريباً",set:{bpr:9,T0:310}},{ar:"نفاث قديم",set:{bpr:0,T0:60}}],
  calc(st){ st.r=lapse(st.alt,st.M,st.bpr); st.T=st.r*st.T0; st.sig=isa(st.alt*0.3048).rho/1.225; },
  scene(g,r,st,C){ const cy=r.y+r.h*0.42, x0=r.x+r.w*0.1, w=r.w*0.34, d=r.h*0.3;
    g.fillStyle=mixC(C.panel,C.struct,0.35); g.strokeStyle=C.ink; g.lineWidth=1.4; g.beginPath(); g.moveTo(x0,cy-d/2); g.lineTo(x0+w,cy-d*0.4); g.lineTo(x0+w*1.15,cy-d*0.15); g.lineTo(x0+w*1.15,cy+d*0.15); g.lineTo(x0+w,cy+d*0.4); g.lineTo(x0,cy+d/2); g.closePath(); g.fill(); g.stroke();
    const al=r.w*0.45; larrow(g,x0+w*1.2,cy,x0+w*1.2+al,cy,C.muted,1.5,6); ltx(g,"على الأرض",x0+w*1.2+al,cy-12,{c:C.muted,s:10,a:"right",rtl:true});
    larrow(g,x0+w*1.2,cy+d*0.35,x0+w*1.2+al*st.r,cy+d*0.35,C.power,4,10); ltx(g,nf(st.T,0)+" kN",x0+w*1.2+al*st.r+6,cy+d*0.35,{c:C.power,s:12,w:600,a:"left",m:true});
    kBar(g,r.x+r.w*0.08,r.y+r.h*0.85,r.w*0.84,10,st.sig,"hyd",C,"كثافة الهواء σ = "+nf(st.sig,2)); },
  plot(st){ return {x:[0,0.9],y:[0,1.05],xl:"M",yl:"T / T₀",curves:[{f:M=>lapse(0,M,st.bpr),c:"ctrl"},{f:M=>lapse(15000,M,st.bpr),c:"hyd"},{f:M=>lapse(35000,M,st.bpr),c:"power"}],dots:[{x:st.M,y:st.r,c:"accent"}],
    leg:[{c:"ctrl",t:"0 ft"},{c:"hyd",t:"15000 ft"},{c:"power",t:"35000 ft"}]}; },
  ro(st){ return [["σ = ρ/ρ₀",nf(st.sig,3)],["T / T₀",nf(st.r,3)],["الدفع المتاح",nf(st.T,1)+" kN"]]; },
  eq:["T/T₀ ≈ σ^0.7 · (1 − c·M)","c يزيد مع نسبة التجاوز (هنا 0.15 + 0.05·BPR)"],
  note:["هذا نموذج تقريبي للتصميم الأولي؛ منحنيات المحرك الحقيقية من الشركة المصنعة وتعتمد على الحرارة أيضاً.","في الطيران على 35000 قدم يكون الدفع المتاح من محرك 737 حوالي خُمس دفع الإقلاع."],
  quiz:[{q:"لماذا يقل الدفع مع الارتفاع؟",o:["لأن الهواء أخف فتدخل كتلة أقل","لأن المحرك يبرد","لأن الوقود أقل"],a:0,why:"الدفع يتناسب مع كتلة الهواء المار."},
        {q:"المحرك ذو نسبة التجاوز العالية مع زيادة السرعة:",o:["يخسر دفعاً أكثر نسبياً","يخسر أقل","لا يتأثر"],a:0,why:"سرعة عادمه منخفضة فيقترب الفرق Ve − V₀ من الصفر أسرع."}],
  show:{ar:"اعرض المحرك",fn:()=>lrnSel("engine")},
  ref:"الموضوع المقابل: تحجيم المحرك وأداؤه (Engine Sizing, Thrust Lapse)."
});
const PRAC=[{n:"737-800",OEW:41.4,MZFW:62.7,MTOW:79,F:20.8,LD:16,c:1.65e-5,V:230},{n:"A380",OEW:277,MZFW:369,MTOW:575,F:254,LD:19,c:1.5e-5,V:250}];
LK("rds",{
  ar:"مخطط الحمولة والمدى", en:"The payload–range diagram",
  alt:"عمود يبين الوزن الفارغ والحمولة والوقود مقارنة بأقصى وزن إقلاع، ومخطط الحمولة مقابل المدى بنقاطه الثلاث",
  intro:["لا تستطيع الطائرة أن تحمل أقصى حمولة وأقصى وقود معاً، لأن المجموع يتجاوز أقصى وزن إقلاع. مخطط الحمولة والمدى يبين ما الممكن: بأقصى حمولة يمتلئ ما تبقى من الوزن بالوقود، وبعد ذلك كل طن وقود إضافي يعني طن حمولة أقل.",
         "عند امتلاء الخزانات لا يمكن زيادة الوقود، فإذا قللنا الحمولة تخف الطائرة وتطير أبعد قليلاً فقط. هذا المخطط هو أول ما تنظر إليه شركة الطيران عند اختيار طائرة لخط معين."],
  ctl:[{k:"pf",ar:"الحمولة (من أقصاها)",min:0,max:100,step:1,v:80,f:v=>nf(v,0)+"%"},{k:"LD",ar:"نسبة الرفع إلى السحب",min:12,max:22,step:0.5,v:16,f:v=>nf(v,1)},{k:"cc",ar:"استهلاك المحرك (×10⁻⁵ kg/N·s)",min:1.3,max:2.0,step:0.05,v:1.65,f:v=>nf(v,2)}],
  pre:[{ar:"737-800",set:{ac:0,LD:16,cc:1.65}},{ar:"A380",set:{ac:1,LD:19,cc:1.5}}],
  init(st){ st.ac=0; },
  calc(st){ const A=PRAC[st.ac||0], c=st.cc*1e-5*G0, k=A.V/c*st.LD/1000, R=(W0,F)=>k*Math.log(W0/(W0-0.9*F)), mp=A.MZFW-A.OEW; st.A=A; st.mp=mp;
    const p2=mp, F2=A.MTOW-A.MZFW, F3=A.F, p3=Math.max(0,A.MTOW-A.OEW-F3), W4=A.OEW+A.F;
    st.pts=[[0,mp],[R(A.MTOW,F2),p2],[R(A.MTOW,F3),p3],[R(W4,A.F),0]];
    st.p=mp*st.pf/100; st.F=Math.min(A.F,A.MTOW-A.OEW-st.p); st.TOW=A.OEW+st.p+st.F; st.R=R(st.TOW,st.F); },
  scene(g,r,st,C){ const A=st.A, x=r.x+r.w*0.35, w=r.w*0.3, y0=r.y+r.h*0.92, s=r.h*0.82/A.MTOW;
    const seg=(v,c,t,yy)=>{ kBox(g,x,yy-v*s,w,v*s,mixC(C.panel,KC(c,C),0.55),C,v*s>14?t:""); return yy-v*s; };
    let y=seg(A.OEW,"struct","الوزن الفارغ",y0); y=seg(st.p,"hyd","الحمولة",y); seg(st.F,"fuel","الوقود",y);
    const ym=y0-A.MTOW*s; lline(g,[[x-r.w*0.1,ym],[x+w+r.w*0.1,ym]],C.power,2,[5,4]); ltx(g,"MTOW",x+w+r.w*0.12,ym,{c:C.power,s:11,a:"left",m:true});
    ltx(g,A.n,r.x+r.w*0.12,r.y+16,{s:14,w:600,m:true}); ltx(g,"≈ "+nf(st.p*10,0)+" راكب",x+w+r.w*0.03,y0-(A.OEW+st.p/2)*s,{c:C.hyd,s:11,a:"left"}); },
  plot(st){ const mx=st.pts[3][0]*1.08; return {x:[0,mx],y:[0,st.mp*1.15],xl:"المدى km",yl:"الحمولة t",lines:[{pts:st.pts,c:"hyd",w:2.6}],dots:[{x:st.R,y:st.p,t:nf(st.R,0)+" km"}]}; },
  ro(st){ return [["المدى بهذه الحمولة",nf(st.R,0)+" km"],["الوقود",nf(st.F,1)+" t"],["وزن الإقلاع",nf(st.TOW,1)+" t"],["أقصى مدى (بلا حمولة)",nf(st.pts[3][0],0)+" km"]]; },
  eq:["R = (V/(c g)) (L/D) ln(W₀/W₁)","الوقود = min(سعة الخزانات ، MTOW − OEW − الحمولة)","10% من الوقود احتياطي في هذا الحساب"],
  note:["الأوزان من الأرقام المنشورة تقريباً، والمدى من معادلة بريغيه بلا حساب الصعود والهبوط، فهو أعلى قليلاً من الواقع.","الراكب محسوب 100 كغم مع أمتعته."],
  quiz:[{q:"بعد امتلاء الخزانات، تقليل الحمولة:",o:["يزيد المدى كثيراً","يزيد المدى قليلاً فقط","لا يغيّر شيئاً"],a:1,why:"لا يمكن إضافة وقود، فقط الطائرة تخف."},
        {q:"عند أقصى حمولة، ما الذي يحد الوقود؟",o:["سعة الخزانات","أقصى وزن إقلاع","سرعة الطائرة"],a:1,why:"الوقود = MTOW − MZFW، وغالباً أقل من سعة الخزانات."}],
  show:{ar:"اعرض الوقود",fn:()=>lrnSel("fuel")},
  ref:"الموضوع المقابل: الحمولة والمدى في التحجيم (Payload–Range)."
});
LK("rds",{
  ar:"طول المدرج المتوازن", en:"Balanced field length",
  alt:"مدرج عليه مساران: تسارع ثم توقف، وتسارع مع محرك معطل ثم إقلاع، يتساويان في الطول، ومنحنى طول المدرج مع نسبة الدفع إلى الوزن",
  intro:["إذا تعطل محرك أثناء الإقلاع على الطيار أن يقرر: يتوقف أو يكمل. «طول المدرج المتوازن» هو الطول الذي تتساوى فيه مسافة التوقف ومسافة الإكمال حتى 35 قدماً، والسرعة التي يتخذ عندها القرار هي V1.",
         "يقدّر المصمم هذا الطول من حمل الجناح ونسبة الدفع إلى الوزن وأقصى معامل رفع للإقلاع وارتفاع المطار. الطائرة ذات المحركين تحتاج نسبة دفع أعلى من ذات الأربعة لأن فقدان محرك يعني فقدان نصف الدفع."],
  ctl:[{k:"ws",ar:"حمل الجناح",min:400,max:750,step:5,v:600,f:v=>nf(v,0)+" kg/m²"},{k:"tw",ar:"الدفع ÷ الوزن",min:0.2,max:0.4,step:0.005,v:0.3,f:v=>nf(v,3)},{k:"cl",ar:"أقصى C_L للإقلاع",min:1.6,max:2.6,step:0.05,v:2.0,f:v=>nf(v,2)},{k:"el",ar:"ارتفاع المطار",min:0,max:2500,step:50,v:0,f:v=>nf(v,0)+" m"}],
  pre:[{ar:"محركان",set:{N:2}},{ar:"أربعة محركات",set:{N:4}},{ar:"مطار مرتفع",set:{el:2200}}],
  init(st){ st.N=2; },
  calc(st){ const sig=isa(st.el).rho/1.225, rho=1.225*sig, WS=st.ws*G0, CL2=0.694*st.cl, U=0.01*st.cl+0.02, tw=st.tw*Math.pow(sig,0.7), N=st.N||2;
    st.g2=tw*(N-1)/N-0.1; st.G=Math.max(0,st.g2-(N===2?0.024:0.030));
    st.bfl=0.863/(1+2.3*st.G)*(WS/(rho*G0*CL2)+10.7)*(1/Math.max(0.02,0.75*tw-U)+2.7)+199.6/Math.sqrt(sig); st.sig=sig;
    st.fn=tw0=>{ const t=tw0*Math.pow(sig,0.7), G=Math.max(0,t*(N-1)/N-0.1-(N===2?0.024:0.030)); return 0.863/(1+2.3*G)*(WS/(rho*G0*CL2)+10.7)*(1/Math.max(0.02,0.75*t-U)+2.7)+199.6/Math.sqrt(sig); }; },
  scene(g,r,st,C){ const y=r.y+r.h*0.62, x0=r.x+r.w*0.05, L=r.w*0.9, mx=Math.max(4000,st.bfl*1.1), X=d=>x0+d/mx*L, v1=st.bfl*0.62;
    g.fillStyle=mixC(C.panel,C.ink,0.22); g.fillRect(X(0),y,X(st.bfl)-X(0),10); for(let d=0;d<=mx;d+=1000){ lline(g,[[X(d),y+10],[X(d),y+16]],C.muted,1); ltx(g,nf(d,0),X(d),y+26,{c:C.muted,s:9,m:true}); }
    larrow(g,X(0),y-14,X(v1),y-14,C.ink,2,7); larrow(g,X(v1),y-14,X(st.bfl),y-14,C.power,2,7); ltx(g,"توقف",(X(v1)+X(st.bfl))/2,y-26,{c:C.power,s:10,rtl:true});
    const p=[[X(v1),y-40]]; for(let i=1;i<=10;i++){ const f=i/10; p.push([X(v1)+(X(st.bfl)-X(v1))*f,y-40-f*f*r.h*0.25]); } lline(g,[[X(0),y-40],[X(v1),y-40]],C.ink,2); lline(g,p,C.ctrl,2); ltx(g,"إكمال بمحرك معطل حتى 35 ft",X(st.bfl),y-46-r.h*0.25,{c:C.ctrl,s:10,a:"right",rtl:true});
    lline(g,[[X(v1),y-56],[X(v1),y+10]],C.accent,2,[3,3]); ltx(g,"V1",X(v1),y-62,{c:C.accent,s:11,w:600,m:true}); },
  plot(st){ return {x:[0.2,0.4],y:[0,Math.min(8000,Math.max(st.fn(0.2),st.bfl)*1.1)],xl:"T/W",yl:"m",curves:[{f:st.fn,c:"hyd"}],dots:[{x:st.tw,y:st.bfl,t:nf(st.bfl,0)+" m"}]}; },
  ro(st){ return [["طول المدرج المتوازن",nf(st.bfl,0)+" m"],["ميل الصعود بمحرك معطل",nf(st.g2*100,1)+"%"],["σ عند المطار",nf(st.sig,3)]]; },
  eq:["BFL ≈ 0.863/(1+2.3G) · [ (W/S)/(ρ g C_L2) + h ] · [ 1/(T̄/W − U) + 2.7 ] + 200/√σ  (متر)","C_L2 = 0.694 C_Lmax ، U = 0.01 C_Lmax + 0.02","G = ميل الصعود الثاني − الحد الأدنى (2.4% لمحركين)"],
  note:["هذه معادلة تقديرية للتصميم الأولي (بوحدات SI)، والطول الحقيقي يُحسب من دليل الأداء لكل وزن وحرارة.","الرسم يبين فكرة V1: قبلها التوقف أقصر، وبعدها الإكمال أقصر."],
  quiz:[{q:"في المطار المرتفع، طول المدرج المطلوب:",o:["يقل","يزيد","لا يتغير"],a:1,why:"الهواء أخف: سرعة أكبر مطلوبة ودفع أقل."},
        {q:"ماذا يعني «متوازن»؟",o:["مسافة التوقف = مسافة الإكمال","الوزن موزع بالتساوي","المحركات متساوية الدفع"],a:0,why:"يُختار V1 بحيث تتساوى المسافتان."}],
  show:{ar:"اعرض العجلات والفرامل",fn:()=>lrnSel("wheels")},
  ref:"الموضوع المقابل: تحليل الإقلاع وطول المدرج المتوازن (Balanced Field Length)."
});
LK("rds",{
  ar:"حجم الوقود في الجناح", en:"Wing fuel volume",
  alt:"منظر علوي لنصف جناح بين صاريتيه خزان وقود ملوّن، ومنحنى حجم الوقود مع نسبة سماكة الجذر",
  intro:["معظم وقود الطائرات النفاثة في الأجنحة، داخل الصندوق بين الصاري الأمامي والخلفي. حجم هذا الصندوق يتناسب مع مساحة الجناح ووتره وسماكته، لذلك الجناح الأسمك والأعرض وتراً يتسع لوقود أكثر.",
         "يقدّر المصمم الحجم بمعادلة بسيطة، ثم يتأكد أنه يكفي للمدى المطلوب. إذا لم يكفِ يضيف خزاناً في الجسم أو يعيد التفكير في الجناح."],
  ctl:[{k:"S",ar:"مساحة الجناح",min:20,max:400,step:1,v:124.6,f:v=>nf(v,1)+" m²"},{k:"b",ar:"الباع",min:10,max:65,step:0.1,v:34.3,f:v=>nf(v,1)+" m"},{k:"tcr",ar:"سماكة الجذر t/c",min:0.08,max:0.18,step:0.005,v:0.15,f:v=>nf(v*100,1)+"%"},{k:"lam",ar:"نسبة الاستدقاق",min:0.15,max:1,step:0.01,v:0.28,f:v=>nf(v,2)},{k:"tau",ar:"سماكة الطرف ÷ الجذر",min:0.5,max:1,step:0.01,v:0.7,f:v=>nf(v,2)}],
  pre:[{ar:"737-800 تقريباً",set:{S:124.6,b:34.3,tcr:0.15,lam:0.28,tau:0.7}},{ar:"طائرة إقليمية",set:{S:70,b:26,tcr:0.14,lam:0.3,tau:0.75}}],
  calc(st){ const f=tc=>0.54*st.S*st.S/st.b*tc*(1+st.lam*Math.sqrt(st.tau)+st.lam*st.lam*st.tau)/((1+st.lam)**2); st.fn=f; st.V=f(st.tcr); st.m=st.V*0.8; st.AR=st.b*st.b/st.S; },
  scene(g,r,st,C){ const rx=r.x+r.w*0.06, ry=r.y+r.h*0.18, sp=r.w*0.86, cr=Math.min(r.h*0.55,2*st.S/(st.b*(1+st.lam))/(st.b/2)*sp), ct=cr*st.lam, sw=0.3*cr;
    const P=(y,x)=>[rx+y*sp,ry+y*sw+x*(cr+(ct-cr)*y)];
    g.fillStyle=mixC(C.panel,C.struct,0.3); g.strokeStyle=C.ink; g.lineWidth=1.4; g.beginPath(); g.moveTo(...P(0,0)); g.lineTo(...P(1,0)); g.lineTo(...P(1,1)); g.lineTo(...P(0,1)); g.closePath(); g.fill(); g.stroke();
    const lvl=0.85+0.1*Math.sin(st.t); g.fillStyle=mixC(C.panel,C.fuel,0.6); g.beginPath(); g.moveTo(...P(0,0.15)); g.lineTo(...P(0.85*lvl,0.15)); g.lineTo(...P(0.85*lvl,0.6)); g.lineTo(...P(0,0.6)); g.closePath(); g.fill();
    lline(g,[P(0,0.15),P(1,0.15)],C.ink,1.2,[4,3]); lline(g,[P(0,0.6),P(1,0.6)],C.ink,1.2,[4,3]); ltx(g,"صاري أمامي",P(0.75,0.15)[0],P(0.75,0.15)[1]-9,{c:C.muted,s:9,rtl:true}); ltx(g,"صاري خلفي",P(0.75,0.6)[0],P(0.75,0.6)[1]+11,{c:C.muted,s:9,rtl:true});
    ltx(g,"الوقود ≈ "+nf(st.m,1)+" t",r.x+r.w*0.5,r.y+r.h*0.95,{s:13,w:600,c:C.fuel,rtl:true}); },
  plot(st){ return {x:[0.08,0.18],y:[0,st.fn(0.18)*1.1],xl:"t/c (الجذر)",yl:"m³",curves:[{f:st.fn,c:"fuel"}],dots:[{x:st.tcr,y:st.V,t:nf(st.V,1)+" m³"}]}; },
  ro(st){ return [["حجم الخزانات (الجناحان)",nf(st.V,1)+" m³"],["كتلة الوقود (0.8 kg/L)",nf(st.m,1)+" t"],["نسبة الباع",nf(st.AR,2)]]; },
  eq:["V ≈ 0.54 (S²/b) (t/c)_r · (1 + λ√τ + λ²τ) / (1 + λ)²","τ = (t/c)_tip / (t/c)_root ، λ = c_tip / c_root"],
  note:["المعادلة تقديرية وتشمل الصندوق بين الصاريين تقريباً؛ الحجم القابل للاستخدام أقل قليلاً.","737-800 تحمل نحو 26 ألف لتر، جزء منها في خزان مركزي داخل صندوق الجناح المار عبر الجسم."],
  quiz:[{q:"مضاعفة مساحة الجناح مع ثبات الباع تجعل حجم الوقود:",o:["يتضاعف","يزيد أربع مرات","لا يتغير"],a:1,why:"V ∝ S²/b."},
        {q:"لماذا يوضع الوقود في الأجنحة؟",o:["لأنها أكبر مكان فارغ ووزنه يخفف انحناء الجناح","لأنها أبرد","لأنها أقرب للمحرك فقط"],a:0,why:"وزن الوقود في الجناح يقابل الرفع فيقل عزم الجذر."}],
  show:{ar:"اعرض الوقود",fn:()=>lrnSel("fuel")},
  ref:"الموضوع المقابل: تخطيط الجناح وحجم الوقود (Wing Fuel Volume)."
});
const CABCFG={4:"2-2",5:"2-3",6:"3-3",7:"2-3-2",8:"2-4-2",9:"3-3-3",10:"3-4-3"};
LK("rds",{
  ar:"مقطع المقصورة: المقاعد في الصف وقطر الجسم", en:"Cabin cross-section: seats abreast and fuselage diameter",
  alt:"مقطع عرضي لجسم طائرة دائري فيه مقاعد وممرات وخزائن علوية وتحتها عنبر الشحن، ومنحنى القطر مع عدد المقاعد في الصف",
  intro:["قطر الجسم يبدأ من الداخل: عدد المقاعد في الصف وعرض كل مقعد والممرات ومساند الأذرع. ستة مقاعد مع ممر واحد تعطي جسماً بقطر قرابة 3.8 م، وعشرة مع ممرين تعطي أكثر من 6 م.",
         "الجسم الأعرض يحمل ركاباً أكثر بطول أقل، لكن سحبه ووزنه أكبر لكل راكب إذا لم يمتلئ. ولهذا تختار الشركة المصنعة القطر بعناية لأنه يبقى ثابتاً لعشرات السنين."],
  ctl:[{k:"n",ar:"المقاعد في الصف",min:4,max:10,step:1,v:6,f:v=>nf(v,0)+" ("+CABCFG[v]+")"},{k:"ws",ar:"عرض المقعد",min:0.42,max:0.52,step:0.005,v:0.44,f:v=>nf(v*100,1)+" cm"}],
  calc(st){ st.aisles=st.n<=6?1:2; const blocks=st.aisles+1; st.W=st.n*st.ws+(st.n+blocks)*0.05+st.aisles*0.5+0.1; st.D=st.W+0.22; st.A=Math.PI*st.D*st.D/4;
    st.fn=n=>{ const a=n<=6?1:2; return n*st.ws+(n+a+1)*0.05+a*0.5+0.32; }; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.5, R=Math.min(r.w,r.h)*0.45, s=2*R/st.D, fy=cy+R*0.22;
    g.fillStyle=mixC(C.panel,C.struct,0.2); g.strokeStyle=C.ink; g.lineWidth=3; g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.fill(); g.stroke();
    g.fillStyle=mixC(C.panel,C.gear,0.25); g.beginPath(); g.arc(cx,cy,R-2,0.25*Math.PI,0.75*Math.PI); g.closePath(); g.fill(); ltx(g,"عنبر الشحن",cx,cy+R*0.72,{s:10,rtl:true});
    lline(g,[[cx-R*0.97,fy],[cx+R*0.97,fy]],C.ink,2);
    const grp=CABCFG[st.n].split("-").map(Number); let x=cx-(st.W-0.1)/2*s; grp.forEach((k,gi)=>{ for(let i=0;i<k;i++){ x+=0.05*s; kBox(g,x,fy-0.45*s,st.ws*s,0.45*s,mixC(C.panel,C.hyd,0.55),C,""); ldot(g,x+st.ws*s/2,fy-0.9*s,0.12*s,mixC(C.panel,C.ink,0.5)); x+=st.ws*s; } x+=0.05*s; if(gi<grp.length-1) x+=0.5*s; });
    [-1,1].forEach(sg=>{ g.fillStyle=mixC(C.panel,C.ink,0.15); g.fillRect(cx+sg*R*0.55-(sg<0?R*0.3:0),cy-R*0.62,R*0.3,R*0.2); });
    ltx(g,"Ø "+nf(st.D,2)+" m",cx,cy-R-10,{s:13,w:600,m:true}); },
  plot(st){ return {x:[4,10],y:[2.5,7],xt:[4,5,6,7,8,9,10],xl:"مقاعد في الصف",yl:"القطر m",lines:[{pts:[4,5,6,7,8,9,10].map(n=>[n,st.fn(n)]),c:"hyd"}],dots:[{x:6,y:3.76,c:"muted",r:4,t:"737"},{x:9,y:5.96,c:"muted",r:4,t:"A350"},{x:10,y:6.2,c:"muted",r:4,t:"777"},{x:st.n,y:st.D}]}; },
  ro(st){ return [["الترتيب",CABCFG[st.n]+" ("+st.aisles+(st.aisles>1?" ممران)":" ممر)")],["عرض المقصورة",nf(st.W,2)+" m"],["القطر الخارجي",nf(st.D,2)+" m"],["مساحة المقطع",nf(st.A,1)+" m²"]]; },
  eq:["عرض المقصورة = n·w_seat + (n + كتل المقاعد)·w_arm + ممرات·w_aisle + فراغ","القطر الخارجي ≈ عرض المقصورة + 0.22 m (الجلد والإطارات والعزل)"],
  note:["الأرقام تقريبية: مسند ذراع 5 سم، ممر 50 سم، و22 سم للهيكل والعزل.","A380 يستخدم جسماً بيضاوياً بطابقين: 10 مقاعد في الأسفل و8 في الأعلى."],
  quiz:[{q:"لماذا تستخدم الطائرات العريضة ممرين؟",o:["لأن قواعد الإخلاء والراحة تمنع أكثر من 3 مقاعد بين الراكب والممر","لتقليل الوزن","للتوازن فقط"],a:0,why:"مع أكثر من 6 مقاعد يحتاج الراكب ممراً قريباً."},
        {q:"زيادة عرض المقعد 2.5 سم في صف من 10 مقاعد تزيد القطر بحوالي:",o:["2.5 سم","25 سم","2.5 م"],a:1,why:"10 × 2.5 سم = 25 سم."}],
  show:{ar:"اعرض منتصف الجسم",fn:()=>lrnSel("fuse_mid")},
  ref:"الموضوع المقابل: تصميم الجسم وترتيب المقصورة (Fuselage and Cabin Layout)."
});
const ICAO=[["A",0,15],["B",15,24],["C",24,36],["D",36,52],["E",52,65],["F",65,80]];
LK("rds",{
  ar:"رمز المطار الدولي والباع", en:"ICAO aerodrome code letter and wingspan",
  alt:"بوابات مطار بعروض مختلفة حسب رمز الحرف وطائرة متوقفة بحجم الباع المختار، ومنحنى السحب المستحث مع الباع",
  intro:["الباع الأكبر يقلل السحب المستحث ويوفر الوقود، لكن المطارات مقسمة إلى رموز حسب الباع: الرمز C حتى 36 م (مثل 737 وA320)، E حتى 65 م (مثل 777 و787)، وF حتى 80 م (مثل A380).",
         "الطائرة التي تتجاوز حد رمزها لا تدخل البوابات والممرات المصممة له. لذلك تصمم الشركات أجنحة طويلة تقف عند الحد تماماً، أو أطرافاً قابلة للطي كما في 777X."],
  ctl:[{k:"b",ar:"الباع",min:10,max:80,step:0.1,v:35.8,f:v=>nf(v,1)+" m"}],
  tog:[{k:"fold",ar:"أطراف قابلة للطي (−7 م على الأرض)",v:false}],
  pre:[{ar:"737-800",set:{b:35.8,fold:false}},{ar:"787-9",set:{b:60.1,fold:false}},{ar:"777X",set:{b:71.8,fold:true}},{ar:"A380",set:{b:79.8,fold:false}}],
  calc(st){ st.gb=st.fold?st.b-7:st.b; const c=ICAO.find(q=>st.gb<q[2])||["—",80,999]; st.code=c[0]; st.lim=c[2]; st.di=Math.pow(35.8/st.b,2); },
  scene(g,r,st,C){ const y0=r.y+r.h*0.15, s=r.w*0.9/80, x0=r.x+r.w*0.05; [["C",36],["E",65],["F",80]].forEach(([k,w],i)=>{ const yy=y0+i*r.h*0.07; g.strokeStyle=k===st.code?C.ctrl:C.muted; g.lineWidth=k===st.code?2:1; g.setLineDash([5,4]); g.strokeRect(x0+(80-w)/2*s,yy,w*s,r.h*0.6-i*r.h*0.14); g.setLineDash([]); ltx(g,"الرمز "+k+" ≤ "+w+" m",x0+(80+w)/2*s-4,yy+12,{c:k===st.code?C.ctrl:C.muted,s:10,a:"right",rtl:true}); });
    const L=st.gb*1.0*s; tplane(g,r.x+r.w*0.5,r.y+r.h*0.55,L,-Math.PI/2,C); lline(g,[[r.x+r.w*0.5-st.gb/2*s,r.y+r.h*0.88],[r.x+r.w*0.5+st.gb/2*s,r.y+r.h*0.88]],C.power,2); ltx(g,"الباع على الأرض "+nf(st.gb,1)+" m",r.x+r.w*0.5,r.y+r.h*0.95,{c:C.power,s:11,w:600,rtl:true}); },
  plot(st){ return {x:[10,80],y:[0,3],xl:"الباع m",yl:"السحب المستحث ÷ 737",curves:[{f:b=>Math.pow(35.8/b,2),c:"hyd"}],band:ICAO.map((q,i)=>({x0:q[1],x1:q[2],c:i%2?"ctrl":"fuel",a:0.08})),vl:ICAO.slice(1).map(q=>({x:q[1],c:"line",t:q[0]})),dots:[{x:st.b,y:st.di}]}; },
  ro(st){ return [["رمز المطار",st.code],["حد الباع لهذا الرمز",nf(st.lim,0)+" m"],["السحب المستحث مقارنة بباع 35.8 م (نفس الرفع)",nf(st.di*100,0)+"%"]]; },
  eq:["D_i = L² / (π q b² e)","لنفس الرفع: D_i ∝ 1/b²"],
  note:["المقارنة هنا بنفس الوزن والسرعة لتوضيح أثر الباع وحده.","الرمز F جاء أساساً مع A380، وكثير من المطارات وسّعت ممراتها لاستقباله."],
  quiz:[{q:"زيادة الباع 10% (بنفس الرفع) تقلل السحب المستحث بحوالي:",o:["10%","17%","50%"],a:1,why:"1/1.1² ≈ 0.83."},
        {q:"لماذا أطراف 777X قابلة للطي؟",o:["لتدخل بوابات الرمز E على الأرض مع باع أكبر في الجو","لتقليل الوزن","للصيانة فقط"],a:0,why:"الباع الكبير للطيران، والمطوي ضمن حد 65 م على الأرض."}],
  show:{ar:"اعرض طرف الجناح",fn:()=>lrnSel("wingtip")},
  ref:"الموضوع المقابل: قيود المطارات على الأبعاد (Airport Compatibility)."
});
const OEIREQ={2:0.024,3:0.027,4:0.030};
LK("rds",{
  ar:"الصعود بمحرك معطل: ميل المقطع الثاني", en:"One-engine-inoperative climb gradient",
  alt:"طائرة تصعد بزاوية صغيرة وأحد محركاتها معطل، ومنحنيات ميل الصعود مع نسبة الدفع إلى الوزن لطائرات بمحركين وثلاثة وأربعة",
  intro:["القواعد تشترط أن تصعد الطائرة بعد الإقلاع حتى لو تعطل أحد محركاتها: ميل لا يقل عن 2.4% لذات المحركين، و2.7% لثلاثة، و3% لأربعة. وهذا الشرط غالباً هو الذي يحدد حجم المحركات.",
         "عند تعطل محرك في طائرة بمحركين يضيع نصف الدفع، أما في ذات الأربعة فالربع فقط. لهذا تحتاج الطائرة ذات المحركين نسبة دفع إلى وزن أعلى، وتكون أقوى بكثير من حاجتها في الطيران العادي."],
  ctl:[{k:"tw",ar:"الدفع ÷ الوزن (كل المحركات)",min:0.18,max:0.45,step:0.005,v:0.3,f:v=>nf(v,3)},{k:"LD",ar:"L/D عند V2",min:8,max:14,step:0.1,v:10,f:v=>nf(v,1)}],
  pre:[{ar:"محركان",set:{N:2}},{ar:"ثلاثة",set:{N:3}},{ar:"أربعة",set:{N:4}}],
  init(st){ st.N=2; },
  calc(st){ const N=st.N||2; st.gam=st.tw*(N-1)/N-1/st.LD; st.req=OEIREQ[N]; st.twmin=(st.req+1/st.LD)*N/(N-1); st.ok=st.gam>=st.req; },
  scene(g,r,st,C){ const a=Math.atan(clamp(st.gam,-0.05,0.15))*4, x0=r.x+r.w*0.08, y0=r.y+r.h*0.8; lline(g,[[x0,y0],[r.x+r.w*0.95,y0]],C.line,2);
    lline(g,[[x0,y0],[x0+r.w*0.85,y0-Math.tan(a)*r.w*0.85]],st.ok?C.ctrl:C.power,2,[6,4]); const px=x0+r.w*0.5, py=y0-Math.tan(a)*r.w*0.5-10;
    lplane(g,px,py,Math.min(r.w*0.45,140),a/D2R,C,{flip:true});
    const N=st.N||2; for(let i=0;i<N;i++){ const ex=r.x+r.w*0.3+i*r.w*0.12, ey=r.y+r.h*0.14; g.fillStyle=i===0?mixC(C.panel,C.power,0.5):mixC(C.panel,C.ctrl,0.5); g.beginPath(); g.ellipse(ex,ey,r.w*0.045,r.h*0.05,0,0,Math.PI*2); g.fill(); if(i===0){ lline(g,[[ex-8,ey-8],[ex+8,ey+8]],C.power,2.5); lline(g,[[ex-8,ey+8],[ex+8,ey-8]],C.power,2.5); } }
    ltx(g,"ميل "+nf(st.gam*100,2)+"% (المطلوب "+nf(st.req*100,1)+"%)",r.x+r.w*0.5,r.y+r.h*0.95,{s:12,w:600,c:st.ok?C.ctrl:C.power,rtl:true}); },
  plot(st){ const ln=N=>({f:t=>100*(t*(N-1)/N-1/st.LD),c:N===2?"power":N===3?"fuel":"ctrl",dash:N===(st.N||2)?null:[4,3]}); return {x:[0.18,0.45],y:[-6,25],xl:"T/W",yl:"ميل الصعود %",curves:[ln(2),ln(3),ln(4)],hl:[{y:st.req*100,t:"الحد",c:"muted"}],dots:[{x:st.tw,y:st.gam*100}],leg:[{c:"power",t:"2"},{c:"fuel",t:"3"},{c:"ctrl",t:"4"}]}; },
  ro(st){ return [["ميل الصعود بمحرك معطل",nf(st.gam*100,2)+"%"],["الحد المطلوب",nf(st.req*100,1)+"%"],["أقل T/W مطلوب",nf(st.twmin,3)],["الحالة",st.ok?"يحقق الشرط ✓":"لا يحقق ✗"]]; },
  eq:["γ = (T_OEI − D) / W = (T/W)·(N−1)/N − 1/(L/D)","T/W المطلوب = (γ_req + 1/(L/D)) · N/(N−1)"],
  note:["الحساب بعد سحب العجلات وبالجنيحات في وضع الإقلاع، ويهمل سحب المحرك المعطل والانعراج.","لهذا تبدو الطائرات ذات المحركين «أقوى» على الإقلاع من ذات الأربعة."],
  quiz:[{q:"طائرة بمحركين تفقد محركاً، تفقد من دفعها:",o:["25%","50%","100%"],a:1,why:"يبقى محرك واحد من اثنين."},
        {q:"لماذا يكون الشرط أعلى لذات الأربعة (3%)؟",o:["لأن احتمال تعطل محرك أكبر مع محركات أكثر","لأنها أثقل","لا سبب"],a:0,why:"القواعد توازن الأمان الكلي مع عدد المحركات."}],
  show:{ar:"اعرض المحرك",fn:()=>lrnSel("engine")},
  ref:"الموضوع المقابل: متطلبات الصعود بمحرك معطل (OEI Climb Requirements)."
});
LK("rds",{
  ar:"نسبة نحافة الجسم", en:"Fuselage fineness ratio",
  alt:"شكل جسم يتغير بين قصير سميك وطويل نحيف بنفس الحجم، ومنحنى السحب مع نسبة النحافة",
  intro:["لنفس الحجم الداخلي يمكن أن يكون الجسم قصيراً سميكاً أو طويلاً نحيفاً. القصير السميك سطحه أصغر لكن الهواء ينفصل خلفه فيزيد «سحب الشكل»، والطويل النحيف انسيابي لكن سطحه أكبر فيزيد الاحتكاك.",
         "بين الحالتين نسبة طول إلى قطر تعطي أقل سحب، وفي هذا النموذج تقع قرب 8. طائرات الركاب تستخدم عادة 8 إلى 12 لأن الجسم الطويل يعطي أيضاً ذراعاً أطول للذيل فيصغر حجمه، وتتسع المقصورة لصفوف أكثر."],
  ctl:[{k:"V",ar:"الحجم الداخلي",min:50,max:1500,step:10,v:400,f:v=>nf(v,0)+" m³"},{k:"fr",ar:"نسبة النحافة L/D",min:3,max:16,step:0.1,v:10,f:v=>nf(v,1)}],
  calc(st){ const nu=3.9e-5, Vt=230; st.fn=f=>{ const D=Math.pow(4*st.V/(0.8*Math.PI*f),1/3), L=f*D, Re=Vt*L/nu, Cf=0.455/Math.pow(Math.log10(Re),2.58)/Math.pow(1+0.144*0.6,0.65), FF=1+60/f**3+f/400, Sw=Math.PI*D*L*0.82; return {D,L,Sw,f:Cf*FF*Sw}; };
    const r=st.fn(st.fr); Object.assign(st,{D:r.D,L:r.L,Sw:r.Sw,fa:r.f}); let best=3,bv=1e9; for(let f=3;f<=16;f+=0.05){ const v=st.fn(f).f; if(v<bv){ bv=v; best=f; } } st.best=best; st.bv=bv; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.48, sc=Math.min(r.w*0.9/st.L,r.h*0.6/st.D*0.5), L=st.L*sc, D=st.D*sc;
    g.fillStyle=mixC(C.panel,C.struct,0.35); g.strokeStyle=C.ink; g.lineWidth=1.5; g.beginPath(); g.moveTo(cx-L/2,cy); g.bezierCurveTo(cx-L/2,cy-D/2,cx-L/2+D*0.8,cy-D/2,cx-L/2+D*1.2,cy-D/2); g.lineTo(cx+L/2-D*1.8,cy-D/2); g.quadraticCurveTo(cx+L/2-D*0.4,cy-D/2,cx+L/2,cy-D*0.1); g.lineTo(cx+L/2,cy+D*0.05); g.quadraticCurveTo(cx+L/2-D*0.6,cy+D/2,cx+L/2-D*1.8,cy+D/2); g.lineTo(cx-L/2+D*1.2,cy+D/2); g.bezierCurveTo(cx-L/2+D*0.8,cy+D/2,cx-L/2,cy+D/2,cx-L/2,cy); g.fill(); g.stroke();
    ltx(g,"L = "+nf(st.L,1)+" m",cx,cy+D/2+16,{s:11,m:true}); ltx(g,"D = "+nf(st.D,2)+" m",cx-L/2-4,cy-D/2-10,{s:11,m:true,a:"left"}); },
  plot(st){ return {x:[3,16],y:[0,st.fn(3).f*1.3],xl:"L/D",yl:"مساحة السحب m²",curves:[{f:f=>st.fn(f).f,c:"hyd"}],band:[{x0:8,x1:12,c:"ctrl",a:0.12}],dots:[{x:st.best,y:st.bv,c:"ctrl",t:"أقل سحب"},{x:st.fr,y:st.fa}]}; },
  ro(st){ return [["الطول × القطر",nf(st.L,1)+" × "+nf(st.D,2)+" m"],["مساحة السطح المبلل",nf(st.Sw,0)+" m²"],["مساحة السحب f = C_f·FF·S_wet",nf(st.fa,3)+" m²"],["أقل سحب عند L/D ≈",nf(st.best,1)]]; },
  eq:["FF = 1 + 60/f³ + f/400 (معامل الشكل)","C_f ≈ 0.455 / (log₁₀Re)^2.58","مساحة السحب = C_f · FF · S_wet"],
  note:["الحساب للاحتكاك والشكل فقط عند ظروف الطيران، ولا يشمل الوزن وذراع الذيل اللذين يدفعان نحو النحافة.","المنطقة المظللة 8–12 هي المجال الشائع لطائرات الركاب."],
  quiz:[{q:"الجسم الطويل جداً (L/D = 16) سحبه أكبر لأن:",o:["سطحه المبلل أكبر فيزيد الاحتكاك","الهواء ينفصل خلفه","وزنه أقل"],a:0,why:"لنفس الحجم يزيد الطول مساحة السطح، والاحتكاك يتناسب معها."},
        {q:"الجسم القصير جداً سيئ لأن:",o:["معامل شكله كبير (انفصال)","سطحه كبير","ثقيل"],a:0,why:"FF = 1 + 60/f³ يكبر بسرعة عندما تقل f."}],
  show:{ar:"اعرض الجسم الأمامي",fn:()=>lrnSel("fuse_fwd")},
  ref:"الموضوع المقابل: تقدير السحب وشكل الجسم (Fuselage Fineness Ratio)."
});
const flapTau=E=>{ const th=Math.acos(clamp(2*E-1,-1,1)); return 1-(th-Math.sin(th))/Math.PI; };
LK("rds",{
  ar:"تحجيم الجنيحات ومعدل الالتفاف", en:"Aileron sizing and roll rate",
  alt:"منظر أمامي لطائرة تلتف ومنظر علوي لنصف جناح مع موضع الجنيح مظلل، ومنحنى معدل الالتفاف مع زاوية الجنيح",
  intro:["الجنيح يغيّر الرفع قرب طرف الجناح فيولّد عزم التفاف. كلما كان أبعد عن الجسم وأعرض كان عزمه أكبر. لكن الطائرة عندما تلتف يقاومها الجناح نفسه: الجناح النازل يرى زاوية هجوم أكبر فيرتفع.",
         "يتوازن العزمان بسرعة فتصل الطائرة إلى معدل التفاف ثابت. المصمم يختار طول الجنيح ووتره ليصل المعدل إلى المطلوب، مثل الوصول إلى ميل 30° في بضع ثوانٍ."],
  ctl:[{k:"y1",ar:"بداية الجنيح (من نصف الباع)",min:40,max:85,step:1,v:70,f:v=>nf(v,0)+"%"},{k:"y2",ar:"نهاية الجنيح",min:60,max:100,step:1,v:95,f:v=>nf(v,0)+"%"},{k:"cf",ar:"وتر الجنيح ÷ وتر الجناح",min:0.15,max:0.35,step:0.01,v:0.25,f:v=>nf(v*100,0)+"%"},{k:"da",ar:"زاوية الجنيح",min:0,max:20,step:0.5,v:15,f:v=>nf(v,1)+"°"},{k:"V",ar:"السرعة",min:100,max:300,step:5,v:160,f:v=>nf(v,0)+" kt"}],
  calc(st){ const b=34.3, S=124.6, lam=0.28, a=5.0, cr=2*S/(b*(1+lam)), h=b/2, y1=h*st.y1/100, y2=h*Math.max(st.y2,st.y1+5)/100, I=y=>cr*(y*y/2-(1-lam)*y**3/(3*h));
    st.tau=flapTau(st.cf); st.cld=2*a*st.tau/(S*b)*(I(y2)-I(y1)); st.clp=-(a/12)*(1+3*lam)/(1+lam); st.p=-(st.cld/st.clp)*st.da*D2R*2*(st.V/KT)/b; st.pd=st.p/D2R; st.t30=st.pd>0.1?30/st.pd:Infinity; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.3, ph=30*D2R*Math.sin(st.t*Math.max(st.pd,0.5)/30), sp=r.w*0.42;
    g.save(); g.translate(cx,cy); g.rotate(ph); g.strokeStyle=C.ink; g.lineWidth=3; lline(g,[[-sp,0],[sp,0]],mixC(C.panel,C.struct,0.7),5); g.fillStyle=mixC(C.panel,C.struct,0.6); g.beginPath(); g.arc(0,0,r.h*0.06,0,Math.PI*2); g.fill(); lline(g,[[0,-r.h*0.06],[0,-r.h*0.16]],mixC(C.panel,C.struct,0.8),3);
    lline(g,[[sp*st.y1/100,0],[sp*Math.max(st.y2,st.y1+5)/100,0]],C.power,6); g.restore(); ltx(g,"منظر أمامي",cx,r.y+10,{c:C.muted,s:10,rtl:true});
    const ry=r.y+r.h*0.62, rx=r.x+r.w*0.06, L=r.w*0.88, cR=r.h*0.26, P=(y,x)=>[rx+y*L,ry+y*cR*0.25+x*cR*(1-0.72*y)];
    g.fillStyle=mixC(C.panel,C.struct,0.3); g.beginPath(); g.moveTo(...P(0,0)); g.lineTo(...P(1,0)); g.lineTo(...P(1,1)); g.lineTo(...P(0,1)); g.closePath(); g.fill(); g.strokeStyle=C.ink; g.lineWidth=1.2; g.stroke();
    const a1=st.y1/100, a2=Math.max(st.y2,st.y1+5)/100; g.fillStyle=mixC(C.panel,C.power,0.6); g.beginPath(); g.moveTo(...P(a1,1-st.cf)); g.lineTo(...P(a2,1-st.cf)); g.lineTo(...P(a2,1)); g.lineTo(...P(a1,1)); g.closePath(); g.fill();
    ltx(g,"الجنيح",P((a1+a2)/2,1)[0],P((a1+a2)/2,1)[1]+12,{c:C.power,s:10,rtl:true}); },
  plot(st){ const k=st.pd/Math.max(st.da,0.01); return {x:[0,20],y:[0,Math.max(40,k*20*1.1)],xl:"δa (°)",yl:"°/s",curves:[{f:d=>k*d,c:"hyd"}],dots:[{x:st.da,y:st.pd,t:nf(st.pd,1)+"°/s"}]}; },
  ro(st){ return [["فعالية الجنيح τ",nf(st.tau,3)],["C_lδa",nf(st.cld,4)+" /rad"],["C_lp (تخميد الالتفاف)",nf(st.clp,3)+" /rad"],["معدل الالتفاف",nf(st.pd,1)+" °/s"],["زمن الوصول إلى 30°",isFinite(st.t30)?nf(st.t30,1)+" s":"—"]]; },
  eq:["C_lδa = (2 C_Lα τ / S b) ∫ c(y) y dy (على طول الجنيح)","C_lp ≈ −(C_Lα/12)(1 + 3λ)/(1 + λ)","p = −(C_lδa / C_lp) · δa · (2V/b)"],
  note:["الجناح بأبعاد 737-800 تقريباً. الطائرات الكبيرة تستخدم أيضاً الكوابح الهوائية (spoilers) للمساعدة في الالتفاف.","الحساب يهمل التواء الجناح عند السرعة العالية، الذي قد يعكس فعل الجنيح (aileron reversal)."],
  quiz:[{q:"لماذا تُوضع الجنيحات قرب أطراف الجناح؟",o:["لأن ذراع العزم أطول","لأن الهواء أسرع هناك","لتقليل الوزن"],a:0,why:"العزم = القوة × البعد عن المحور."},
        {q:"ضعف السرعة مع نفس زاوية الجنيح يجعل معدل الالتفاف:",o:["نصفاً","ضعفاً","كما هو"],a:1,why:"p ∝ V في هذا النموذج."}],
  show:{ar:"اعرض الجنيحات",fn:()=>lrnSel("aileron",1)},
  ref:"الموضوع المقابل: تحجيم أسطح التحكم (Control Surface Sizing)."
});
