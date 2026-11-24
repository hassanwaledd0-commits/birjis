/* ---------- Book 5: Aircraft Structures — 10 more lessons ---------- */
const SMATS=[["Al 2024-T3",73.1,345,2780,"hyd"],["Al 7075-T6",71.7,503,2810,"ctrl"],["Al-Li",78,520,2630,"sys"],["Ti-6Al-4V",114,880,4430,"fuel"],["Steel 4340",205,1470,7850,"muted"],["CFRP",60,600,1600,"power"],["GFRP",25,400,1900,"gear"]];
const MCASE=[["مقاومة شد",m=>m[2]/m[3]],["صلابة شد",m=>m[1]/m[3]],["صلابة عارضة",m=>Math.sqrt(m[1])/m[3]],["لوح ضد الانبعاج",m=>Math.cbrt(m[1])/m[3]]];
LK("str",{
  ar:"اختيار المادة: المتانة والصلابة لكل كيلوغرام", en:"Choosing materials: specific strength and stiffness",
  alt:"أعمدة تبين الكتلة النسبية المطلوبة من كل مادة لنفس المهمة، ومخطط معامل المرونة مقابل الكثافة لمواد الطائرات",
  intro:["المادة الأفضل ليست الأقوى بل الأخف لنفس المهمة. للشد يهم «المتانة ÷ الكثافة»، وللوح الرقيق المعرّض للانبعاج يهم الجذر التكعيبي للصلابة ÷ الكثافة، وهنا تتفوق المواد الخفيفة كثيراً.",
         "لهذا بقي الألمنيوم لعقود، ودخلت المواد المركبة (ألياف الكربون) في الطائرات الحديثة مثل 787 وA350. والتيتانيوم يُستخدم حيث الحرارة أو التلامس مع الكربون، والفولاذ في عجلات الهبوط حيث الحجم محدود."],
  ctl:[{k:"cs",ar:"نوع المهمة",min:0,max:3,step:1,v:3,f:v=>MCASE[v][0]}],
  pre:[{ar:"شد",set:{cs:0}},{ar:"عارضة",set:{cs:2}},{ar:"لوح",set:{cs:3}}],
  calc(st){ const f=MCASE[st.cs][1], ref=f(SMATS[0]); st.rel=SMATS.map(m=>ref/f(m)); let bi=0; st.rel.forEach((v,i)=>{ if(v<st.rel[bi]) bi=i; }); st.best=SMATS[bi][0]; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.34, w=r.w*0.6, h=r.h*0.1, mx=Math.max(...st.rel,1.2);
    SMATS.forEach((m,i)=>{ const y=r.y+r.h*0.08+i*r.h*0.125; ltx(g,m[0],x0-8,y+h/2,{s:11,a:"right",m:true}); g.fillStyle=mixC(C.panel,KC(m[4],C),0.65); g.fillRect(x0,y,w*st.rel[i]/mx,h); ltx(g,nf(st.rel[i],2)+"×",x0+w*st.rel[i]/mx+4,y+h/2,{s:10,a:"left",m:true}); });
    ltx(g,"الكتلة المطلوبة نسبة إلى Al 2024 (الأقصر أفضل)",r.x+r.w*0.98,r.y+r.h*0.97,{c:C.muted,s:10,a:"right",rtl:true}); },
  plot(st){ return {x:[0,8000],y:[0,220],xl:"الكثافة kg/m³",yl:"E GPa",dots:SMATS.map(m=>({x:m[3],y:m[1],c:m[4],r:5,t:m[0].split(" ")[0]}))}; },
  ro(st){ return [["المهمة",MCASE[st.cs][0]],["الأخف لهذه المهمة",st.best],["CFRP مقارنة بالألمنيوم",nf(st.rel[5],2)+"×"],["الفولاذ مقارنة بالألمنيوم",nf(st.rel[4],2)+"×"]]; },
  eq:["شد بالمتانة: الكتلة ∝ ρ/σ","عارضة بالصلابة: الكتلة ∝ ρ/√E","لوح ضد الانبعاج: الكتلة ∝ ρ/∛E"],
  note:["الخواص تقريبية، وخواص المواد المركبة هنا لصفائح متعددة الاتجاهات وليست في اتجاه الألياف فقط.","الاختيار الحقيقي يشمل الكلال والتآكل والسعر وسهولة الإصلاح، وليس الكتلة وحدها."],
  quiz:[{q:"لماذا تتفوق المواد الخفيفة في الألواح المعرضة للانبعاج؟",o:["لأن اللوح الأخف يمكن أن يكون أسمك فيقاوم الانبعاج أكثر","لأنها أقوى دائماً","لأنها أرخص"],a:0,why:"مقاومة الانبعاج تتناسب مع مكعب السماكة."},
        {q:"أين يُستخدم الفولاذ عالي المتانة في الطائرة؟",o:["الجلد","عجلات الهبوط ووصلاتها","المقاعد"],a:1,why:"الحمل كبير والحجم محدود، فتهم المتانة المطلقة."}],
  show:{ar:"اعرض صندوق الجناح",fn:()=>lrnSel("wingbox")},
  ref:"الموضوع المقابل: مواد الهياكل (Structural Materials)."
});
LK("str",{
  ar:"دائرة مور: الإجهادات الرئيسية", en:"Mohr's circle: principal stresses",
  alt:"عنصر مربع مدوّر بزاوية مع أسهم الإجهادات العمودية والقصّية عليه، ودائرة مور في مستوى الإجهاد العمودي والقصّي مع النقطة الحالية",
  intro:["الإجهاد في نقطة يتغير حسب الاتجاه الذي ننظر منه. إذا أدرنا العنصر الصغير تتغير الإجهادات العمودية والقصّية على وجوهه، لكن هناك اتجاهين لا قص فيهما: «الاتجاهان الرئيسيان» وفيهما أكبر وأصغر إجهاد عمودي.",
         "دائرة مور ترسم كل الحالات في دائرة واحدة: إدارة العنصر بزاوية θ تعني الدوران على الدائرة بزاوية 2θ. الشقوق في المعادن الهشة تنمو عمودياً على أكبر إجهاد رئيسي."],
  ctl:[{k:"sx",ar:"σx",min:-200,max:200,step:1,v:120,f:v=>nf(v,0)+" MPa"},{k:"sy",ar:"σy",min:-200,max:200,step:1,v:-40,f:v=>nf(v,0)+" MPa"},{k:"tx",ar:"τxy",min:-150,max:150,step:1,v:60,f:v=>nf(v,0)+" MPa"},{k:"th",ar:"إدارة العنصر θ",min:0,max:180,step:1,v:0,f:v=>nf(v,0)+"°"}],
  pre:[{ar:"شد وقص",set:{sx:120,sy:-40,tx:60}},{ar:"قص صافٍ (التواء)",set:{sx:0,sy:0,tx:100}},{ar:"جسم مضغوط",set:{sx:45,sy:90,tx:0}}],
  calc(st){ const c=(st.sx+st.sy)/2, d=(st.sx-st.sy)/2; st.c=c; st.R=Math.hypot(d,st.tx); st.s1=c+st.R; st.s2=c-st.R; st.tp=0.5*Math.atan2(2*st.tx,st.sx-st.sy)/D2R; const t=2*st.th*D2R; st.sxp=c+d*Math.cos(t)+st.tx*Math.sin(t); st.syp=c-d*Math.cos(t)-st.tx*Math.sin(t); st.txp=-d*Math.sin(t)+st.tx*Math.cos(t); },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.5, a=Math.min(r.w,r.h)*0.22, th=-st.th*D2R, k=a*0.9/200;
    g.save(); g.translate(cx,cy); g.rotate(th); g.fillStyle=mixC(C.panel,C.struct,0.35); g.strokeStyle=C.ink; g.lineWidth=1.5; g.fillRect(-a/2,-a/2,a,a); g.strokeRect(-a/2,-a/2,a,a);
    const ar=(x1,y1,x2,y2,c)=>{ if(Math.hypot(x2-x1,y2-y1)>3) larrow(g,x1,y1,x2,y2,c,2,7); };
    const sx=st.sxp*k, sy=st.syp*k, tq=st.txp*k; [1,-1].forEach(s=>{ if(sx>=0) ar(s*a/2,0,s*(a/2+sx),0,C.power); else ar(s*(a/2-sx),0,s*a/2,0,C.ctrl); if(sy>=0) ar(0,-s*a/2,0,-s*(a/2+sy),C.power); else ar(0,-s*(a/2-sy),0,-s*a/2,C.ctrl);
      ar(s*(a/2+6),s*tq/2,s*(a/2+6),-s*tq/2,C.fuel); ar(-s*tq/2,-s*(a/2+6),s*tq/2,-s*(a/2+6),C.fuel); }); g.restore();
    ltx(g,"θ = "+nf(st.th,0)+"°",cx,r.y+r.h*0.95,{s:12,w:600,m:true}); },
  plot(st){ const pts=[]; for(let i=0;i<=90;i++){ const a=i/90*Math.PI*2; pts.push([st.c+st.R*Math.cos(a),st.R*Math.sin(a)]); } const L=Math.max(Math.abs(st.s1),Math.abs(st.s2),st.R)*1.2+10;
    return {x:[st.c-L,st.c+L],y:[-L*0.75,L*0.75],xl:"σ MPa",yl:"τ",lines:[{pts,c:"hyd"},{pts:[[st.sx,st.tx],[st.sy,-st.tx]],c:"muted",dash:[3,3]}],hl:[{y:0,c:"line",dash:[2,3]}],dots:[{x:st.s1,y:0,c:"power",r:4,t:"σ₁"},{x:st.s2,y:0,c:"ctrl",r:4,t:"σ₂"},{x:st.sxp,y:st.txp,c:"accent",t:"θ"}]}; },
  ro(st){ return [["σ₁ (الأكبر)",nf(st.s1,1)+" MPa"],["σ₂ (الأصغر)",nf(st.s2,1)+" MPa"],["زاوية الاتجاه الرئيسي",nf(st.tp,1)+"°"],["أقصى قص",nf(st.R,1)+" MPa"],["σx′ ، τ′ عند θ",nf(st.sxp,1)+" ، "+nf(st.txp,1)]]; },
  eq:["σ₁,₂ = (σx+σy)/2 ± √(((σx−σy)/2)² + τxy²)","tan 2θp = 2τxy / (σx − σy)","τmax = نصف قطر الدائرة"],
  note:["إدارة العنصر 90° تعني نصف دورة على الدائرة (180°).","في جسم الطائرة المضغوط وحده لا يوجد قص، فالإجهادان الطولي والطوق هما الرئيسيان."],
  quiz:[{q:"في القص الصافي τ = 100 MPa، الإجهادات الرئيسية:",o:["±100 MPa عند 45°","صفر","200 MPa"],a:0,why:"الدائرة مركزها الصفر ونصف قطرها 100."},
        {q:"إدارة العنصر بزاوية θ تعني على دائرة مور:",o:["θ","2θ","θ/2"],a:1,why:"العلاقات تعتمد على 2θ."}],
  ref:"الموضوع المقابل: تحويل الإجهاد ودائرة مور (Stress Transformation)."
});
LK("str",{
  ar:"انبعاج ألواح الجلد بين الأعصاب", en:"Buckling of skin panels between stringers",
  alt:"لوح جلد بين أعصاب طولية يتموّج عندما يتجاوز الإجهاد الحد الحرج، ومنحنى الإجهاد الحرج مع نسبة العرض إلى السماكة",
  intro:["جلد الطائرة رقيق جداً، ويُدعم بأعصاب طولية (stringers) وإطارات. اللوح بين عصبين ينبعج تحت الضغط عند إجهاد يتناسب مع مربع (السماكة ÷ العرض). لذلك تقريب الأعصاب من بعضها يرفع الحد كثيراً.",
         "في القص يكون الحد أعلى قليلاً (k ≈ 5.35 بدل 4). بعض الألواح في جسم الطائرة يُسمح لها بالتموّج تحت القص وتستمر في حمل الحمل كحقل شد، ولهذا قد ترى تموجاً خفيفاً في جلد طائرة على الأرض وهو طبيعي ضمن حدود الدليل."],
  ctl:[{k:"tt",ar:"سماكة الجلد",min:0.8,max:4,step:0.05,v:1.6,f:v=>nf(v,2)+" mm"},{k:"b",ar:"المسافة بين الأعصاب",min:80,max:250,step:1,v:150,f:v=>nf(v,0)+" mm"},{k:"sa",ar:"الإجهاد المؤثر",min:0,max:300,step:1,v:25,f:v=>nf(v,0)+" MPa"}],
  pre:[{ar:"ضغط",set:{k:4}},{ar:"قص",set:{k:5.35}}],
  init(st){ st.k=4; },
  calc(st){ const E=72000, nu=0.33; st.fn=bt=>Math.min(345,(st.k||4)*Math.PI*Math.PI*E/(12*(1-nu*nu))/(bt*bt)); st.bt=st.b/st.tt; st.scr=st.fn(st.bt); st.mg=st.sa>0?st.scr/st.sa-1:Infinity; st.buck=st.sa>st.scr; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.1, x1=r.x+r.w*0.9, y0=r.y+r.h*0.12, y1=r.y+r.h*0.82, n=4, pw=(x1-x0)/n;
    g.fillStyle=mixC(C.panel,C.struct,0.25); g.fillRect(x0,y0,x1-x0,y1-y0); for(let i=0;i<=n;i++) lline(g,[[x0+i*pw,y0],[x0+i*pw,y1]],C.ink,i%n?3:2);
    if(st.buck){ const amp=Math.min(pw*0.3,(st.sa/st.scr-1)*pw*0.4+3)*(0.8+0.2*Math.sin(st.t*3)); for(let i=0;i<n;i++) for(let j=0;j<4;j++){ const cx=x0+i*pw+pw/2, cy=y0+(j+0.5)*(y1-y0)/4; g.strokeStyle=mixC(C.panel,C.power,0.7); g.lineWidth=1.5; g.beginPath(); g.ellipse(cx,cy,pw*0.38,(y1-y0)/8*0.85,0,0,Math.PI*2); g.stroke(); g.fillStyle=mixC(C.panel,(j+i)%2?C.power:C.ctrl,clamp(amp/pw,0.1,0.35)); g.fill(); } }
    for(let i=0;i<5;i++){ const y=y0+(i+0.5)*(y1-y0)/5; larrow(g,x0-26,y,x0-4,y,C.ink,1.6,6); larrow(g,x1+26,y,x1+4,y,C.ink,1.6,6); }
    ltx(g,st.buck?"اللوح منبعج":"اللوح مستقر",r.x+r.w*0.5,r.y+r.h*0.93,{s:13,w:600,c:st.buck?C.power:C.ctrl,rtl:true}); },
  plot(st){ return {x:[20,250],y:[0,400],xl:"b / t",yl:"σcr MPa",curves:[{f:st.fn,c:"hyd"}],hl:[{y:345,t:"خضوع",c:"muted"},{y:st.sa,t:"المؤثر",c:"power"}],dots:[{x:st.bt,y:st.scr}]}; },
  ro(st){ return [["b / t",nf(st.bt,0)],["الإجهاد الحرج",nf(st.scr,0)+" MPa"+(st.scr>=345?" (محدود بالخضوع)":"")],["الهامش",isFinite(st.mg)?nf(st.mg*100,0)+"%":"—"],["الحالة",st.buck?"انبعاج ✗":"آمن ✓"]]; },
  eq:["σcr = k π² E / (12(1 − ν²)) · (t/b)²","k ≈ 4 للضغط بحواف مسنودة ، ≈ 5.35 للقص"],
  note:["الحساب لألمنيوم E = 72 GPa بحواف مسنودة بسيطة؛ الأعصاب الحقيقية تعطي إسناداً أقوى قليلاً.","فوق حد الخضوع لا تصح المعادلة المرنة، ولذلك قُطع المنحنى عند 345 MPa."],
  quiz:[{q:"تقريب الأعصاب للنصف (b/2) يجعل الإجهاد الحرج:",o:["ضعفاً","أربعة أضعاف","كما هو"],a:1,why:"σcr ∝ 1/b²."},
        {q:"تموّج خفيف في جلد الجسم تحت القص:",o:["دائماً عطل خطير","قد يكون مسموحاً بتصميم حقل الشد ضمن حدود الدليل","يعني أن الطائرة جديدة"],a:1,why:"بعض الألواح مصممة للعمل بعد الانبعاج بالقص؛ الحدود في دليل الصيانة."}],
  show:{ar:"اعرض منتصف الجسم",fn:()=>lrnSel("fuse_mid")},
  ref:"الموضوع المقابل: انبعاج الألواح الرقيقة (Thin Plate Buckling)."
});
LK("str",{
  ar:"انحناء صندوق الجناح: تمثيل الأعصاب كنقاط", en:"Wing-box bending with idealized booms",
  alt:"مقطع صندوق جناح مستطيل بأعصاب ملونة حسب الإجهاد، ضغط في الأعلى وشد في الأسفل، ومنحنى الإجهاد عبر ارتفاع المقطع",
  intro:["لتبسيط حساب صندوق الجناح نجمع مساحة كل عصب مع جزء من الجلد في «نقطة» (boom). عندها عزم القصور الذاتي مجموع بسيط: المساحة × مربع البعد عن المحور، والإجهاد في كل نقطة = العزم × البعد ÷ عزم القصور.",
         "الرفع يثني الجناح للأعلى فينضغط الجلد العلوي ويُشد السفلي. لهذا يصنع الجلد العلوي من سبيكة قوية بالضغط (7075 مثلاً) والسفلي من سبيكة متحملة للكلال (2024)."],
  ctl:[{k:"M",ar:"عزم الانحناء",min:0,max:3000,step:10,v:1500,f:v=>nf(v,0)+" kN·m"},{k:"h",ar:"ارتفاع الصندوق",min:0.3,max:1.2,step:0.01,v:0.6,f:v=>nf(v,2)+" m"},{k:"Ac",ar:"مساحة نقطة الزاوية",min:10,max:80,step:1,v:40,f:v=>nf(v,0)+" cm²"},{k:"ns",ar:"أعصاب كل جلد",min:2,max:10,step:1,v:6,f:v=>nf(v,0)}],
  calc(st){ const As=8e-4, Ac=st.Ac*1e-4, y=st.h/2; st.I=4*Ac*y*y+2*st.ns*As*y*y; st.sc=-st.M*1000*y/st.I/1e6; st.stn=-st.sc; st.mc=345/Math.abs(st.sc||1e-9)-1; st.mt=420/Math.abs(st.stn||1e-9)-1; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.5, W=r.w*0.8, H=Math.min(r.h*0.7,W*st.h/1.6); g.strokeStyle=C.ink; g.lineWidth=2; g.strokeRect(cx-W/2,cy-H/2,W,H);
    const col=s=>s<0?mixC(C.panel,C.ctrl,clamp(-s/345,0.15,1)):mixC(C.panel,C.power,clamp(s/420,0.15,1)), n=st.ns+2;
    for(let i=0;i<n;i++){ const x=cx-W/2+W*i/(n-1), corner=i===0||i===n-1, rr=corner?Math.sqrt(st.Ac)*1.6:5; ldot(g,x,cy-H/2,rr,col(st.sc)); ldot(g,x,cy+H/2,rr,col(st.stn)); }
    lline(g,[[cx-W/2-10,cy],[cx+W/2+10,cy]],C.muted,1,[4,3]); ltx(g,"المحور المحايد",cx+W/2,cy-10,{c:C.muted,s:10,a:"right",rtl:true});
    ltx(g,"ضغط "+nf(-st.sc,0)+" MPa",cx,cy-H/2-16,{c:C.ctrl,s:12,w:600,rtl:true}); ltx(g,"شد "+nf(st.stn,0)+" MPa",cx,cy+H/2+18,{c:C.power,s:12,w:600,rtl:true}); },
  plot(st){ const y=st.h/2; return {x:[-450,450],y:[-y*1.2,y*1.2],xl:"σ MPa",yl:"y m",lines:[{pts:[[st.sc,y],[st.stn,-y]],c:"hyd"}],vl:[{x:-345,c:"ctrl"},{x:420,c:"power"}],dots:[{x:st.sc,y,c:"ctrl"},{x:st.stn,y:-y,c:"power"}]}; },
  ro(st){ return [["عزم القصور I",nf(st.I*1e4,1)+" ×10⁻⁴ m⁴"],["الجلد العلوي",nf(st.sc,0)+" MPa"],["الجلد السفلي",nf(st.stn,0)+" MPa"],["هامش الضغط / الشد",nf(st.mc*100,0)+"% / "+nf(st.mt*100,0)+"%"]]; },
  eq:["I = Σ Aᵢ yᵢ²","σᵢ = M yᵢ / I","مضاعفة ارتفاع الصندوق تقلل الإجهاد للنصف وتزيد I أربع مرات"],
  note:["مساحة كل عصب عادي 8 سم² هنا، ونقاط الزوايا تمثل أغطية الصاريين.","الحد التصميمي للضغط عادة أقل من الشد بسبب انبعاج الألواح والأعصاب."],
  quiz:[{q:"أثناء الطيران، الجلد العلوي للجناح:",o:["مشدود","مضغوط","بلا إجهاد"],a:1,why:"الرفع يثني الجناح للأعلى."},
        {q:"لماذا الجناح السميك أخف لنفس العزم؟",o:["لأن الذراع بين الجلدين أكبر فيكفيه مساحة أقل","لأنه أقصر","لأنه أقل رفعاً"],a:0,why:"I ∝ y²، والإجهاد ∝ 1/y لنفس المساحة."}],
  show:{ar:"اعرض صندوق الجناح",fn:()=>lrnSel("wingbox",1)},
  ref:"الموضوع المقابل: الانحناء في المقاطع المثالية (Structural Idealization)."
});
LK("str",{
  ar:"مركز القص لمقطع القناة", en:"Shear centre of a channel section",
  alt:"مقطع قناة على شكل حرف C مع أسهم تدفق القص على الشفتين والجسم، وحمل رأسي يطبق عند الجسم فيلتوي المقطع أو عند مركز القص فلا يلتوي",
  intro:["إذا حمّلت مقطعاً مفتوحاً مثل القناة (C) بقوة رأسية تمر بمركزه الهندسي فإنه لا ينحني فقط بل يلتوي أيضاً. السبب أن تدفق القص في الشفتين يكوّن عزماً حول المقطع.",
         "هناك نقطة واحدة، «مركز القص»، إذا مرت بها القوة ينحني المقطع بلا التواء. في القناة تقع خارج المقطع خلف الجسم. لهذا يهتم المصممون بمكان تثبيت الأحمال على الأعصاب والدعامات."],
  ctl:[{k:"b",ar:"عرض الشفة",min:20,max:100,step:1,v:50,f:v=>nf(v,0)+" mm"},{k:"h",ar:"ارتفاع الجسم",min:50,max:200,step:1,v:100,f:v=>nf(v,0)+" mm"}],
  tog:[{k:"atsc",ar:"الحمل عند مركز القص",v:false}],
  calc(st){ st.e=3*st.b*st.b/(st.h+6*st.b); st.eh=st.e/st.h; },
  scene(g,r,st,C){ const s=Math.min(r.w*0.5/(st.b+st.e+30),r.h*0.6/st.h), cx=r.x+r.w*0.55, cy=r.y+r.h*0.5, H=st.h*s, B=st.b*s, E=st.e*s, tw=st.atsc?0:0.12*Math.sin(st.t*3);
    g.save(); g.translate(cx,cy); g.rotate(tw); g.strokeStyle=C.ink; g.lineWidth=6; g.beginPath(); g.moveTo(B,-H/2); g.lineTo(0,-H/2); g.lineTo(0,H/2); g.lineTo(B,H/2); g.stroke();
    larrow(g,B*0.9,-H/2-10,B*0.1,-H/2-10,C.fuel,1.8,6); larrow(g,-10,-H*0.35,-10,H*0.35,C.fuel,1.8,6); larrow(g,B*0.1,H/2+10,B*0.9,H/2+10,C.fuel,1.8,6); g.restore();
    ldot(g,cx-E,cy,5,C.power); ltx(g,"مركز القص",cx-E,cy+16,{c:C.power,s:10,rtl:true}); lline(g,[[cx-E,cy-6],[cx,cy-6]],C.power,1,[2,2]);
    const lx=st.atsc?cx-E:cx; larrow(g,lx,cy-H/2-r.h*0.25,lx,cy-H/2-14,C.ink,2.5,9);
    ltx(g,st.atsc?"انحناء بلا التواء ✓":"الحمل عند الجسم: انحناء + التواء",r.x+r.w*0.5,r.y+r.h*0.95,{s:12,w:600,c:st.atsc?C.ctrl:C.power,rtl:true}); },
  plot(st){ return {x:[0.1,1],y:[0,0.6],xl:"b / h",yl:"e / h",curves:[{f:x=>3*x*x/(1+6*x),c:"hyd"}],dots:[{x:st.b/st.h,y:st.eh}]}; },
  ro(st){ return [["بُعد مركز القص عن الجسم e",nf(st.e,1)+" mm"],["e / h",nf(st.eh,3)],["مكانه","خارج المقطع، خلف الجسم"]]; },
  eq:["e = 3b² / (h + 6b) (قناة بسماكة واحدة)","تدفق القص في الشفة يزيد خطياً من الطرف إلى الزاوية"],
  note:["الأسهم البرتقالية اتجاه تدفق القص لحمل رأسي نازل.","الأعصاب ذات المقطع Z أو J تُستخدم كثيراً في الطائرات، ولها أيضاً مراكز قص يجب مراعاتها."],
  quiz:[{q:"إذا مر الحمل بالمركز الهندسي لقناة:",o:["تنحني فقط","تنحني وتلتوي","لا تتأثر"],a:1,why:"مركز القص ليس في المركز الهندسي."},
        {q:"زيادة عرض الشفتين تجعل مركز القص:",o:["أبعد عن الجسم","أقرب","داخل المقطع"],a:0,why:"e يزيد مع b²."}],
  ref:"الموضوع المقابل: مركز القص للمقاطع المفتوحة (Shear Centre)."
});
function plyQ(th){ const E1=135,E2=10,G=5,n12=0.3, n21=n12*E2/E1, d=1-n12*n21, Q11=E1/d, Q22=E2/d, Q12=n12*E2/d, Q66=G, c=Math.cos(th*D2R), s=Math.sin(th*D2R);
  return {a11:Q11*c**4+2*(Q12+2*Q66)*s*s*c*c+Q22*s**4, a22:Q11*s**4+2*(Q12+2*Q66)*s*s*c*c+Q22*c**4, a12:(Q11+Q22-4*Q66)*s*s*c*c+Q12*(s**4+c**4)}; }
const plyEx=th=>{ const c=Math.cos(th*D2R), s=Math.sin(th*D2R); return 1/(c**4/135+(1/5-2*0.3/135)*s*s*c*c+s**4/10); };
LK("str",{
  ar:"ألياف الكربون: الصلابة واتجاه الألياف", en:"Composite plies: stiffness versus fibre angle",
  alt:"طبقة مادة مركبة بألياف مائلة بزاوية وحمل أفقي، ومقدار تمددها يتغير مع الزاوية، ومنحنى معامل المرونة مع زاوية الألياف",
  intro:["طبقة ألياف الكربون صلبة جداً في اتجاه الألياف وضعيفة عمودياً عليها: نحو 135 GPa مقابل 10 GPa. مع تدوير الألياف قليلاً تهبط الصلابة بسرعة كبيرة.",
         "لذلك تُرصّ الطبقات باتجاهات مختلفة (0° و±45° و90°) لتتحمل أحمالاً من اتجاهات عدة. المصمم يوجّه أكثر الطبقات حيث الحمل الأكبر، وهذا ما يجعل المواد المركبة خفيفة إذا صُممت جيداً."],
  ctl:[{k:"th",ar:"زاوية الألياف",min:0,max:90,step:1,v:30,f:v=>nf(v,0)+"°"}],
  calc(st){ st.Ex=plyEx(st.th); const L=[0,45,-45,90].map(plyQ), A={a11:0,a22:0,a12:0}; L.forEach(q=>{ A.a11+=q.a11/4; A.a22+=q.a22/4; A.a12+=q.a12/4; }); st.qi=(A.a11*A.a22-A.a12*A.a12)/A.a22; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.48, cy=r.y+r.h*0.48, a=Math.min(r.w,r.h)*0.3, str=1+0.25*Math.min(1,10/st.Ex)*(0.5+0.5*Math.sin(st.t*2)), w=a*str;
    g.save(); g.beginPath(); g.rect(cx-w,cy-a,2*w,2*a); g.clip(); g.fillStyle=mixC(C.panel,C.ink,0.75); g.fillRect(cx-w,cy-a,2*w,2*a);
    const th=-st.th*D2R, dx=Math.cos(th), dy=Math.sin(th); for(let k=-30;k<=30;k++){ const ox=cx-dy*k*7, oy=cy+dx*k*7; lline(g,[[ox-dx*300,oy-dy*300],[ox+dx*300,oy+dy*300]],"#c9d2db",1); } g.restore();
    g.strokeStyle=C.ink; g.lineWidth=1.5; g.strokeRect(cx-w,cy-a,2*w,2*a); for(let i=-1;i<=1;i++){ larrow(g,cx-w-4,cy+i*a*0.6,cx-w-28,cy+i*a*0.6,C.power,2,7); larrow(g,cx+w+4,cy+i*a*0.6,cx+w+28,cy+i*a*0.6,C.power,2,7); }
    ltx(g,"التمدد مكبّر ويتناسب مع 1/E",cx,cy+a+18,{c:C.muted,s:10,rtl:true}); },
  plot(st){ return {x:[0,90],y:[0,140],xt:[0,15,30,45,60,75,90],xl:"θ (°)",yl:"E_x GPa",curves:[{f:plyEx,c:"hyd"}],hl:[{y:st.qi,t:"0/±45/90",c:"ctrl"}],dots:[{x:st.th,y:st.Ex,t:nf(st.Ex,0)}]}; },
  ro(st){ return [["E_x عند الزاوية",nf(st.Ex,1)+" GPa"],["نسبة إلى اتجاه الألياف",nf(st.Ex/135*100,0)+"%"],["رصّة 0/±45/90",nf(st.qi,1)+" GPa"]]; },
  eq:["1/E_x = cos⁴θ/E₁ + (1/G₁₂ − 2ν₁₂/E₁) sin²θ cos²θ + sin⁴θ/E₂","E₁ = 135 ، E₂ = 10 ، G₁₂ = 5 GPa ، ν₁₂ = 0.3"],
  note:["عند 15° فقط تفقد الطبقة أكثر من نصف صلابتها.","فحص المواد المركبة في الصيانة يحتاج طرقاً خاصة (مثل الأمواج فوق الصوتية) لأن التلف قد يكون داخلياً بلا أثر ظاهر."],
  quiz:[{q:"لماذا تُرصّ طبقات بزاوية ±45°؟",o:["لتحمّل القص والالتواء","لزيادة الوزن","للون"],a:0,why:"القص يولّد إجهادات رئيسية عند 45°."},
        {q:"صلابة الطبقة عمودياً على الألياف تقارب:",o:["الصلابة على طول الألياف","جزءاً صغيراً منها","الصفر"],a:1,why:"10 GPa مقابل 135 GPa، تحملها الراتنج فقط."}],
  show:{ar:"اعرض الذيل العمودي",fn:()=>lrnSel("fin")},
  ref:"الموضوع المقابل: المواد المركبة المصفحة (Laminated Composites)."
});
LK("str",{
  ar:"الوصلة المبرشمة: كيف تنهار", en:"Riveted lap joint: how it fails",
  alt:"منظر علوي لوصلة تراكب بلوحين وصفوف برشام، والنمط الحاكم للانهيار ملوّن، ومنحنيات قوة كل نمط مع قطر البرشامة",
  intro:["الوصلة المبرشمة قد تنهار بثلاث طرق: قص البرشام نفسه، أو تشوّه ثقب اللوح تحت البرشامة (التحمّل)، أو تمزق اللوح في الصف الذي أُضعف بالثقوب. الأضعف من الثلاثة يحكم.",
         "القاعدة العملية في الإصلاح: قطر البرشامة نحو ثلاثة أضعاف سماكة أسمك لوح، والمسافة إلى الحافة لا تقل عن ضعفي القطر، وبين البراشيم ثلاثة أقطار على الأقل. هذه القواعد تجعل الأنماط الثلاثة متقاربة."],
  ctl:[{k:"d",ar:"قطر البرشامة",min:2.4,max:6.4,step:0.1,v:4,f:v=>nf(v,1)+" mm"},{k:"tt",ar:"سماكة اللوح",min:0.8,max:3.2,step:0.1,v:1.6,f:v=>nf(v,1)+" mm"},{k:"n",ar:"براشيم في الصف",min:2,max:8,step:1,v:4,f:v=>nf(v,0)},{k:"rows",ar:"عدد الصفوف",min:1,max:3,step:1,v:2,f:v=>nf(v,0)},{k:"w",ar:"عرض الوصلة",min:60,max:200,step:1,v:100,f:v=>nf(v,0)+" mm"}],
  calc(st){ st.fn=d=>{ const N=st.n*st.rows; return {sh:N*200*Math.PI*d*d/4/1000, br:N*d*st.tt*690/1000, nt:Math.max(0,(st.w-st.n*d))*st.tt*434/1000}; };
    const f=st.fn(st.d); Object.assign(st,f); const m=Math.min(f.sh,f.br,f.nt); st.mode=m===f.sh?"قص البرشام":m===f.br?"تحمّل الثقب":"تمزق اللوح"; st.P=m; st.ratio=st.d/st.tt; st.pitch=st.w/st.n/st.d; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.08, x1=r.x+r.w*0.92, y0=r.y+r.h*0.12, H=r.h*0.62, s=(x1-x0)/st.w, ov=Math.min(H*0.7,(st.rows*3+1)*st.d*s*1.2);
    g.fillStyle=mixC(C.panel,C.struct,0.3); g.fillRect(x0,y0,x1-x0,H/2+ov/2); g.fillStyle=mixC(C.panel,C.struct,0.5); g.fillRect(x0,y0+H/2-ov/2,x1-x0,H/2+ov/2); g.strokeStyle=C.ink; g.strokeRect(x0,y0,x1-x0,H+0.01);
    const col=st.mode==="قص البرشام"?C.power:st.mode==="تحمّل الثقب"?C.fuel:C.hyd; for(let j=0;j<st.rows;j++) for(let i=0;i<st.n;i++){ const x=x0+(i+0.5)*(x1-x0)/st.n, y=y0+H/2-ov/2+ov*(j+0.5)/st.rows; ldot(g,x,y,Math.max(3,st.d*s/2),st.mode==="تمزق اللوح"?C.ink:col); }
    if(st.mode==="تمزق اللوح") lline(g,[[x0,y0+H/2-ov/2+ov*0.5/st.rows],[x1,y0+H/2-ov/2+ov*0.5/st.rows]],C.power,2.5,[6,3]);
    larrow(g,r.x+r.w*0.5,y0+4,r.x+r.w*0.5,y0-r.h*0.08,C.ink,2,7); larrow(g,r.x+r.w*0.5,y0+H-4,r.x+r.w*0.5,y0+H+r.h*0.08,C.ink,2,7);
    ltx(g,"الحاكم: "+st.mode,r.x+r.w*0.5,r.y+r.h*0.97,{s:12,w:600,c:col,rtl:true}); },
  plot(st){ const mx=Math.max(st.fn(6.4).sh,st.fn(6.4).br,st.fn(2.4).nt)*1.05; return {x:[2.4,6.4],y:[0,mx],xl:"d mm",yl:"kN",curves:[{f:d=>st.fn(d).sh,c:"power"},{f:d=>st.fn(d).br,c:"fuel"},{f:d=>st.fn(d).nt,c:"hyd"}],vl:[{x:3*st.tt,c:"ctrl",t:"3t"}],dots:[{x:st.d,y:st.P,c:"ink"}],leg:[{c:"power",t:"قص"},{c:"fuel",t:"تحمّل"},{c:"hyd",t:"تمزق"}]}; },
  ro(st){ return [["قوة قص البرشام",nf(st.sh,1)+" kN"],["قوة التحمّل",nf(st.br,1)+" kN"],["قوة اللوح الصافي",nf(st.nt,1)+" kN"],["الحاكم",st.mode+" ("+nf(st.P,1)+" kN)"],["d/t ، المسافة بين البراشيم ÷ d",nf(st.ratio,1)+" ، "+nf(st.pitch,1)]]; },
  eq:["قص: P = N · τ · πd²/4","تحمّل: P = N · d · t · σ_br","تمزق: P = (w − n·d) · t · σ_u"],
  note:["القيم تقريبية لبرشام ألمنيوم (قص 200 MPa) ولوح 2024-T3؛ الإصلاح الحقيقي يتبع دليل الإصلاحات الإنشائية SRM للطائرة.","البرشامة الأكبر من اللازم لا تقوي الوصلة دائماً: تزيد التحمّل لكنها تضعف اللوح الصافي."],
  quiz:[{q:"القاعدة العملية لقطر البرشامة:",o:["مساوٍ لسماكة اللوح","نحو ثلاثة أضعاف سماكة أسمك لوح","عشرة أضعاف"],a:1,why:"هذه النسبة توازن بين قص البرشام وتحمّل اللوح."},
        {q:"أقل مسافة من مركز البرشامة إلى حافة اللوح عادة:",o:["قطر واحد","قطران","خمسة أقطار"],a:1,why:"أقل من ذلك يسمح بتمزق الحافة (shear-out)."}],
  show:{ar:"اعرض منتصف الجسم",fn:()=>lrnSel("fuse_mid")},
  ref:"الموضوع المقابل: الوصلات المبرشمة والمثبتات (Riveted Joints)."
});
LK("str",{
  ar:"نمو الشقوق وفترات الفحص (قانون باريس)", en:"Crack growth and inspection intervals (Paris law)",
  alt:"لوح فيه ثقب يخرج منه شق يطول مع الدورات وجهاز فحص بالتيارات الدوامية، ومنحنى طول الشق مع عدد الدورات وفترة الفحص بينهما",
  intro:["التصميم المتسامح مع الضرر يفترض أن الشق موجود من البداية، ويسأل: كم دورة يحتاج ليكبر من حجم يمكن اكتشافه إلى الحجم الحرج الذي ينكسر عنده اللوح؟ قانون باريس يعطي سرعة نمو الشق في كل دورة.",
         "فترة الفحص تُختار بحيث يكون هناك فحصان على الأقل خلال تلك المدة. طريقة الفحص مهمة: الفحص بالتيارات الدوامية يكتشف شقوقاً من 1–2 مم، فتطول الفترة كثيراً مقارنة بالفحص النظري."],
  ctl:[{k:"ds",ar:"مدى الإجهاد في كل رحلة Δσ",min:40,max:150,step:1,v:90,f:v=>nf(v,0)+" MPa"},{k:"ad",ar:"أصغر شق يمكن اكتشافه",min:1,max:25,step:0.5,v:5,f:v=>nf(v,1)+" mm"},{k:"kic",ar:"متانة الكسر K_IC",min:25,max:45,step:1,v:35,f:v=>nf(v,0)+" MPa√m"}],
  pre:[{ar:"تيارات دوامية",set:{ad:1.5}},{ar:"فحص بصري مفصّل",set:{ad:12}},{ar:"فحص بصري عام",set:{ad:25}}],
  calc(st){ const C0=2e-11, m=3.2, b=1.12, rate=a=>C0*Math.pow(b*st.ds*Math.sqrt(Math.PI*a),m); st.ac=Math.pow(st.kic/(b*st.ds),2)/Math.PI*1000;
    const curve=[]; let a=0.5e-3, N=0; curve.push([0,a*1000]); while(a<st.ac/1000&&N<5e7){ const da=a*0.02; N+=da/rate(a); a+=da; curve.push([N,a*1000]); } st.curve=curve; st.Nend=N;
    const Nat=x=>{ for(let i=1;i<curve.length;i++) if(curve[i][1]>=x) return curve[i][0]; return N; }; st.Nd=st.ad<st.ac?Nat(st.ad):N; st.window=st.Nend-st.Nd; st.interval=st.window/2; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.45, R=r.h*0.07, f=((st.t*0.08)%1), i=Math.floor(f*(st.curve.length-1)), a=st.curve[i][1], L=Math.min(r.w*0.4,(a/Math.max(st.ac,1))*r.w*0.4);
    g.fillStyle=mixC(C.panel,C.struct,0.3); g.fillRect(r.x+r.w*0.05,r.y+r.h*0.12,r.w*0.9,r.h*0.66); g.fillStyle=C.panel; g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.fill(); g.strokeStyle=C.ink; g.stroke();
    lline(g,[[cx+R,cy],[cx+R+L,cy]],C.power,2.5); lline(g,[[cx-R,cy],[cx-R-L,cy]],C.power,2.5);
    for(let k=0;k<5;k++){ const y=r.y+r.h*0.12+k*r.h*0.16; larrow(g,r.x+r.w*0.3+k*r.w*0.1,r.y+r.h*0.11,r.x+r.w*0.3+k*r.w*0.1,r.y+r.h*0.04,C.ink,1.6,6); }
    const px=cx+R+L+16, py=cy-r.h*0.18; g.fillStyle=C.hyd; g.fillRect(px-3,py-r.h*0.12,6,r.h*0.12); ldot(g,px,py,5,C.hyd); ltx(g,"مجس",px+10,py-r.h*0.1,{c:C.hyd,s:10,a:"left",rtl:true});
    ltx(g,"طول الشق "+nf(a,1)+" mm",cx,r.y+r.h*0.88,{s:12,w:600,rtl:true,c:a>=st.ad?C.power:C.muted}); },
  plot(st){ const N=st.Nend; return {x:[0,N/1000],y:[0,st.ac*1.1],xl:"الدورات (ألف)",yl:"a mm",lines:[{pts:st.curve.map(p=>[p[0]/1000,p[1]]),c:"power"}],band:[{x0:st.Nd/1000,x1:N/1000,c:"ctrl",a:0.14}],hl:[{y:st.ad,t:"قابل للاكتشاف",c:"ctrl"},{y:st.ac,t:"حرج",c:"power"}]}; },
  ro(st){ return [["الطول الحرج",nf(st.ac,1)+" mm"],["دورات من الاكتشاف إلى الحرج",nf(st.window,0)],["فترة الفحص (÷2)",nf(st.interval,0)+" رحلة"],["عمر الشق من 0.5 مم",nf(st.Nend,0)+" دورة"]]; },
  eq:["da/dN = C (ΔK)^m ، ΔK = β Δσ √(πa)","a_c = (K_IC / (β σ_max))² / π","فترة الفحص ≈ N(a_det → a_c) / 2"],
  note:["الثوابت C = 2×10⁻¹¹ وm = 3.2 تقريبية لسبيكة ألمنيوم؛ القيم الحقيقية من اختبارات المادة.","لهذا تحدد وثائق الصيانة طريقة الفحص بدقة: تغيير الطريقة يغيّر الفترة المسموحة."],
  quiz:[{q:"طريقة فحص تكتشف شقوقاً أصغر تجعل فترة الفحص:",o:["أقصر","أطول","كما هي"],a:1,why:"المدة بين الاكتشاف والحرج تصبح أطول."},
        {q:"زيادة مدى الإجهاد قليلاً تجعل نمو الشق:",o:["أبطأ","أسرع بكثير","نفسه"],a:1,why:"السرعة ∝ Δσ^m، وm أكبر من 3."}],
  show:{ar:"اعرض النوافذ",fn:()=>lrnSel("windows")},
  ref:"الموضوع المقابل: ميكانيكا الكسر والتصميم المتسامح مع الضرر (Fracture Mechanics, Damage Tolerance)."
});
LK("str",{
  ar:"عزم ربط البراغي والشد المسبق", en:"Bolt torque and preload",
  alt:"برغي يربط لوحين ومفتاح عزم يدور، والبرغي ملوّن حسب نسبة إجهاده من حد الخضوع، ومنحنيا الشد المسبق مع العزم للبرغي الجاف والمزيّت",
  intro:["عزم الربط ليس هدفاً بحد ذاته؛ الهدف هو «الشد المسبق» في البرغي الذي يضغط القطع على بعضها. معظم العزم يضيع في احتكاك السن ورأس البرغي، لذلك العلاقة T = K·D·F يعتمد فيها K على التزييت.",
         "إذا زُيّت برغي قيمة عزمه محددة لبرغي جاف يزيد الشد المسبق كثيراً وقد يتجاوز حد الخضوع. لهذا يحدد دليل الصيانة دائماً هل القيمة لسن جاف أو مزيّت، وبأي مادة."],
  ctl:[{k:"T",ar:"عزم الربط",min:2,max:120,step:1,v:30,f:v=>nf(v,0)+" N·m"},{k:"D",ar:"قطر البرغي",min:5,max:16,step:0.5,v:8,f:v=>nf(v,1)+" mm"},{k:"sy",ar:"حد خضوع البرغي",min:600,max:1100,step:10,v:900,f:v=>nf(v,0)+" MPa"}],
  tog:[{k:"lub",ar:"السن مزيّت",v:false}],
  calc(st){ st.K=st.lub?0.12:0.2; st.F=st.T/(st.K*st.D/1000)/1000; st.As=0.58*st.D*st.D; st.s=st.F*1000/st.As; st.pc=st.s/st.sy*100; st.Fy=st.sy*st.As/1000; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.45, cy=r.y+r.h*0.5, bw=r.w*0.07, ph=r.h*0.16; g.fillStyle=mixC(C.panel,C.struct,0.35); g.fillRect(r.x+r.w*0.1,cy-ph,r.w*0.7,ph-1); g.fillRect(r.x+r.w*0.1,cy+1,r.w*0.7,ph);
    const col=st.pc<75?C.ctrl:st.pc<95?C.fuel:C.power; g.fillStyle=mixC(C.panel,col,0.7); g.fillRect(cx-bw/2,cy-ph-r.h*0.08,bw,2*ph+r.h*0.16); g.fillStyle=mixC(C.panel,C.ink,0.6); g.fillRect(cx-bw,cy-ph-r.h*0.12,bw*2,r.h*0.05); g.fillRect(cx-bw,cy+ph+r.h*0.06,bw*2,r.h*0.06);
    larrow(g,cx-bw*1.6,cy-ph-r.h*0.2,cx-bw*1.6,cy-ph-r.h*0.02,C.ink,2,7); larrow(g,cx+bw*1.6,cy+ph+r.h*0.2,cx+bw*1.6,cy+ph+r.h*0.02,C.ink,2,7);
    const a=st.t*1.5, wx=cx, wy=cy-ph-r.h*0.1, L=r.w*0.28; lline(g,[[wx,wy],[wx+Math.cos(a)*L,wy+Math.sin(a)*L*0.3]],mixC(C.panel,C.ink,0.7),5);
    ltx(g,"الإجهاد "+nf(st.pc,0)+"% من الخضوع",r.x+r.w*0.5,r.y+r.h*0.95,{s:12,w:600,c:col,rtl:true}); },
  plot(st){ const k=d=>T=>T/(k0(d)*st.D/1000)/1000, k0=x=>x; return {x:[0,120],y:[0,Math.max(st.Fy*1.3,st.F*1.1)],xl:"العزم N·m",yl:"الشد المسبق kN",curves:[{f:T=>T/(0.2*st.D/1000)/1000,c:"muted",dash:[4,3]},{f:T=>T/(0.12*st.D/1000)/1000,c:"fuel"}],hl:[{y:st.Fy,t:"خضوع",c:"power"},{y:st.Fy*0.75,t:"75%",c:"ctrl"}],dots:[{x:st.T,y:st.F}],leg:[{c:"muted",t:"جاف K=0.2",dash:[4,3]},{c:"fuel",t:"مزيّت K=0.12"}]}; },
  ro(st){ return [["معامل العزم K",nf(st.K,2)],["الشد المسبق",nf(st.F,1)+" kN"],["إجهاد البرغي",nf(st.s,0)+" MPa"],["نسبة من الخضوع",nf(st.pc,0)+"%"+(st.pc>=100?" ✗ تجاوز الخضوع":st.pc>90?" ⚠":"")]]; },
  eq:["T = K · D · F","مساحة الإجهاد للسن ≈ 0.58 D²","σ = F / A_s"],
  note:["K قيمة تقريبية (0.2 جاف و0.12 مزيّت هنا) وتختلف مع المواد والطلاء؛ استخدم دائماً القيمة وطريقة التزييت المكتوبة في الدليل.","معظم الدلائل تضيف عزم احتكاك الصامولة ذات القفل (prevailing torque) إلى العزم المطلوب."],
  quiz:[{q:"إذا زيّتَ برغياً وربطته بعزم البرغي الجاف:",o:["يقل الشد المسبق","يزيد الشد المسبق وقد يتجاوز الخضوع","لا فرق"],a:1,why:"K أقل، فنفس العزم يعطي قوة أكبر."},
        {q:"أين يذهب معظم عزم الربط؟",o:["في شد البرغي","في الاحتكاك تحت الرأس وفي السن","في الحرارة فقط"],a:1,why:"نحو 90% يضيع في الاحتكاك، ولهذا K حساس للتزييت."}],
  show:{ar:"اعرض أنبوب المحرك",fn:()=>lrnSel("eng_pylon")},
  ref:"الموضوع المقابل: الوصلات المربوطة والشد المسبق (Bolted Joints)."
});
LK("str",{
  ar:"اهتزاز الجناح: التردد الطبيعي والرنين", en:"Wing vibration: natural frequency and resonance",
  alt:"جناح مثبت من جهة يهتز بشكل النمط الأول، ومنحنى التضخيم مع نسبة تردد الإثارة إلى التردد الطبيعي وقمته عند الرنين",
  intro:["الجناح عارضة مثبتة من جذرها، ولها تردد طبيعي تهتز عنده بسهولة. يعتمد على الصلابة (EI) والكتلة لكل متر والطول: الجناح الأطول والأثقل يهتز أبطأ.",
         "إذا أُثير الجناح بتردد قريب من تردده الطبيعي (من محرك أو اضطراب منتظم) تكبر الاهتزازات كثيراً: الرنين. والرفرفة (flutter) أخطر: تفاعل بين الانحناء والالتواء والهواء يُختبر في كل طائرة جديدة."],
  ctl:[{k:"L",ar:"طول نصف الجناح",min:5,max:40,step:0.5,v:17,f:v=>nf(v,1)+" m"},{k:"EI",ar:"صلابة الانحناء EI",min:10,max:3000,step:10,v:400,f:v=>nf(v,0)+" MN·m²"},{k:"m",ar:"الكتلة لكل متر",min:50,max:1500,step:10,v:400,f:v=>nf(v,0)+" kg/m"},{k:"fe",ar:"تردد الإثارة",min:0.2,max:10,step:0.05,v:1.2,f:v=>nf(v,2)+" Hz"},{k:"z",ar:"التخميد ζ",min:0.01,max:0.1,step:0.005,v:0.03,f:v=>nf(v,3)}],
  calc(st){ st.f1=1.875*1.875/(2*Math.PI)*Math.sqrt(st.EI*1e6/(st.m*st.L**4)); st.r=st.fe/st.f1; st.amp=1/Math.sqrt((1-st.r*st.r)**2+(2*st.z*st.r)**2); },
  scene(g,r,st,C){ const x0=r.x+r.w*0.08, y0=r.y+r.h*0.5, L=r.w*0.84, A=Math.min(r.h*0.35,6*Math.log(1+st.amp))*Math.sin(st.t*2*Math.PI*Math.min(st.fe,2)*0.5);
    g.fillStyle=mixC(C.panel,C.ink,0.6); g.fillRect(x0-14,y0-r.h*0.3,14,r.h*0.6); const phi=u=>{ const b=1.875*u; return (Math.cosh(b)-Math.cos(b))-0.7341*(Math.sinh(b)-Math.sin(b)); }, pm=phi(1);
    const up=[], lo=[]; for(let i=0;i<=40;i++){ const u=i/40, y=y0-A*phi(u)/pm, t=r.h*0.05*(1-0.6*u); up.push([x0+u*L,y-t]); lo.push([x0+u*L,y+t]); }
    g.fillStyle=mixC(C.panel,C.struct,0.4); g.beginPath(); up.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])); lo.reverse().forEach(q=>g.lineTo(q[0],q[1])); g.closePath(); g.fill(); g.strokeStyle=C.ink; g.stroke();
    lline(g,[[x0,y0],[x0+L,y0]],C.muted,1,[3,4]); ltx(g,st.r>0.85&&st.r<1.15?"قريب من الرنين!":"",r.x+r.w*0.5,r.y+r.h*0.12,{s:13,w:600,c:C.power,rtl:true}); },
  plot(st){ return {x:[0,3],y:[0,Math.min(1/(2*st.z)*1.1,30)],xl:"f / f₁",yl:"التضخيم",curves:[{f:x=>1/Math.sqrt((1-x*x)**2+(2*st.z*x)**2),c:"hyd",n:300}],vl:[{x:1,c:"power",t:"رنين"}],dots:[{x:Math.min(st.r,3),y:st.amp}]}; },
  ro(st){ return [["التردد الطبيعي الأول",nf(st.f1,2)+" Hz"],["نسبة الترددات",nf(st.r,2)],["التضخيم",nf(st.amp,2)+"×"],["أقصى تضخيم عند الرنين",nf(1/(2*st.z),1)+"×"]]; },
  eq:["f₁ = (1.875² / 2π) √(EI / (m L⁴))","التضخيم = 1 / √((1 − r²)² + (2ζr)²)","عند الرنين ≈ 1/(2ζ)"],
  note:["الأرقام لعارضة منتظمة؛ الجناح الحقيقي مستدق ويحمل محركات ووقوداً، فتُحسب أنماطه بالعناصر المحدودة وتُقاس في اختبار اهتزاز أرضي.","الوقود في الجناح يغيّر الكتلة، فتتغير الترددات مع احتراقه."],
  quiz:[{q:"مضاعفة طول العارضة مع ثبات خواصها تجعل ترددها:",o:["نصفاً","ربعاً","ضعفاً"],a:1,why:"f ∝ 1/L²."},
        {q:"كيف نقلل الاهتزاز عند الرنين؟",o:["بزيادة التخميد أو إبعاد التردد الطبيعي عن الإثارة","بزيادة الإثارة","بتقليل الصلابة دائماً"],a:0,why:"قمة الرنين ∝ 1/ζ، وتغيير الصلابة أو الكتلة يحرك التردد."}],
  show:{ar:"اعرض صندوق الجناح",fn:()=>lrnSel("wingbox",1)},
  ref:"الموضوع المقابل: الاهتزازات والمرونة الهوائية (Structural Vibration, Aeroelasticity)."
});
