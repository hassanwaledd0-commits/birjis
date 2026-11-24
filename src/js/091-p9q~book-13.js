/* ---------- Book 13: Navigation and Meteorology (1/3): radio navigation and satellite fixes ---------- */
const nvNorm=a=>((a%360)+360)%360;
/* 4x4 inverse by Gauss-Jordan (used for dilution of precision) */
function nvInv4(M){ const n=4, A=M.map((r,i)=>r.concat([0,1,2,3].map(j=>i===j?1:0))); for(let i=0;i<n;i++){ let p=i; for(let r=i+1;r<n;r++) if(Math.abs(A[r][i])>Math.abs(A[p][i])) p=r; if(Math.abs(A[p][i])<1e-12) return null; [A[i],A[p]]=[A[p],A[i]]; const d=A[i][i]; for(let j=0;j<2*n;j++) A[i][j]/=d; for(let r=0;r<n;r++){ if(r===i) continue; const f=A[r][i]; if(f) for(let j=0;j<2*n;j++) A[r][j]-=f*A[i][j]; } } return A.map(r=>r.slice(n)); }
/* ---- 1 ---- */
LK("nav",{
  ar:"تحديد الموقع بإشعاعين VOR", en:"Position fix from two VOR radials",
  alt:"محطتا VOR وإشعاعان يتقاطعان عند موقع الطائرة، مع متوازي أضلاع خطأ الاتجاه، ومنحنى الخطأ مع زاوية تقاطع الإشعاعين",
  intro:["محطة VOR ترسل إشارة يستخلص منها المستقبل الاتجاه (الإشعاع) الذي تقع عليه الطائرة بالنسبة للمحطة. إشعاعان من محطتين مختلفتين يتقاطعان في نقطة واحدة هي موقع الطائرة. حسابه بسيط: حل مستقيمين مقطوعين من محطتين.",
         "لكن كل إشعاع فيه خطأ زاوي صغير (نحو ±1° إلى ±2°)، فيصبح الموقع داخل متوازي أضلاع. الخطأ يزداد مع بُعد المحطتين ويصبح كبيراً جداً إذا كان تقاطع الإشعاعين شديد الحدة أو شديد الانفراج، ولذلك يُفضَّل تقاطع قريب من 90°."],
  ctl:[{k:"D",ar:"المسافة بين المحطتين (B شرق A)",min:40,max:200,step:5,v:100,f:v=>nf(v,0)+" NM"},{k:"r1",ar:"إشعاع المحطة A",min:0,max:359,step:1,v:50,f:v=>nf(v,0)+"°"},{k:"r2",ar:"إشعاع المحطة B",min:0,max:359,step:1,v:320,f:v=>nf(v,0)+"°"},{k:"er",ar:"خطأ الإشعاع",min:0.2,max:3,step:0.1,v:1,f:v=>nf(v,1)+"°"}],
  pre:[{ar:"تقاطع جيد",set:{r1:50,r2:320}},{ar:"تقاطع حاد",set:{r1:75,r2:285}},{ar:"لا تقاطع",set:{r1:100,r2:80}}],
  calc(st){ const a=st.r1*D2R, b=st.r2*D2R, det=Math.sin(b-a); st.ok=Math.abs(det)>1e-3; if(st.ok){ st.t1=-st.D*Math.cos(b)/det; st.t2=-st.D*Math.cos(a)/det; st.ok=st.t1>0&&st.t2>0; } if(st.ok){ st.px=st.t1*Math.sin(a); st.py=st.t1*Math.cos(a); st.g=Math.abs(((st.r1-st.r2+540)%360)-180); const sg=Math.sin(Math.abs(b-a)); st.err=st.er*D2R*Math.hypot(st.t1,st.t2)/Math.max(0.05,Math.abs(sg)); st.errf=ang=>st.er*D2R*Math.hypot(st.t1,st.t2)/Math.max(0.05,Math.sin(ang*D2R)); } },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.7, s=Math.min(r.w*0.7/st.D,r.h*0.62/Math.max(60,st.ok?st.py:80)), A=[cx-st.D/2*s,cy], B=[cx+st.D/2*s,cy]; [A,B].forEach((p,i)=>{ g.fillStyle=mixC(C.panel,C.hyd,0.6); g.beginPath(); g.arc(p[0],p[1],8,0,Math.PI*2); g.fill(); g.strokeStyle=C.ink; g.lineWidth=1.4; g.stroke(); ltx(g,i?"B":"A",p[0],p[1]+22,{s:13,w:700,m:true}); for(let k=0;k<12;k++){ const an=k*Math.PI/6; lline(g,[[p[0]+Math.sin(an)*10,p[1]-Math.cos(an)*10],[p[0]+Math.sin(an)*15,p[1]-Math.cos(an)*15]],C.muted,1); } });
    [[A,st.r1,C.ctrl],[B,st.r2,C.power]].forEach(([p,rd,c])=>{ const an=rd*D2R; lline(g,[[p[0],p[1]],[p[0]+Math.sin(an)*r.h*0.9,p[1]-Math.cos(an)*r.h*0.9]],c,1.6,[6,4]); ltx(g,nf(rd,0)+"°",p[0]+Math.sin(an)*38,p[1]-Math.cos(an)*38,{s:11,m:true,c}); });
    if(st.ok){ const px=A[0]+st.px*s, py=A[1]-st.py*s; const e=st.er*D2R; [[st.r1+st.er,st.r2+st.er],[st.r1+st.er,st.r2-st.er],[st.r1-st.er,st.r2-st.er],[st.r1-st.er,st.r2+st.er]].forEach((q,i,arr)=>{ const n=arr[(i+1)%4], f=(a1,a2)=>{ const a=a1*D2R,b=a2*D2R,det=Math.sin(b-a); const t1=-st.D*Math.cos(b)/det; return [A[0]+t1*Math.sin(a)*s,A[1]-t1*Math.cos(a)*s]; }; lline(g,[f(q[0],q[1]),f(n[0],n[1])],C.hyd,1.4); });
      ldot(g,px,py,6,C.ink); ltx(g,"الموقع",px+10,py-10,{s:12,w:700,rtl:true,a:"left"}); ltx(g,"x = "+nf(st.px,0)+"  y = "+nf(st.py,0)+" NM",cx,r.y+r.h*0.07,{s:12,w:600,m:true}); } else ltx(g,"الإشعاعان لا يتقاطعان أمام المحطتين",cx,r.y+r.h*0.3,{s:14,w:700,rtl:true,c:C.power}); },
  plot(st){ if(!st.ok) return {x:[10,170],y:[0,10],xl:"زاوية التقاطع °",yl:"الخطأ NM",curves:[]}; return {x:[10,170],y:[0,Math.min(60,Math.max(5,st.errf(10)*1.05))],xl:"زاوية التقاطع °",yl:"الخطأ NM",curves:[{f:st.errf,c:"hyd"}],vl:[{x:90,c:"muted",t:"90°"}],dots:[{x:st.g,y:Math.min(st.err,60),c:"power"}]}; },
  ro(st){ return st.ok?[["بعد الطائرة عن A",nf(st.t1,1)+" NM"],["بعدها عن B",nf(st.t2,1)+" NM"],["زاوية التقاطع",nf(st.g,0)+"°"],["الخطأ التقريبي",nf(st.err,1)+" NM"],["جودة التقاطع",st.g>=30&&st.g<=150?"مناسبة":"ضعيفة"]]:[["الحالة","لا تقاطع"],["النصيحة","اختر إشعاعين يلتقيان أمام المحطتين"]]; },
  eq:["t₁ = − D cos r₂ / sin(r₂ − r₁)   ،   t₂ = − D cos r₁ / sin(r₂ − r₁)","الموقع = t₁ (sin r₁ ، cos r₁)","الخطأ ≈ ε √(t₁² + t₂²) / sin γ"],
  note:["الاتجاهات هنا حقيقية (north true). في الاستخدام الفعلي تُضاف تصحيحات الانحراف المغناطيسي للمحطة.","محطات VOR تتقاعد تدريجياً لصالح الملاحة بالأقمار، لكن مبادئها ما تزال أساسية في التدريب وفي العمليات الاحتياطية."],
  quiz:[{q:"أفضل زاوية لتقاطع الإشعاعين هي قريبة من:",o:["90°","10°","170°"],a:0,why:"الخطأ ∝ 1/sin γ ويقل عند 90°."},
        {q:"إذا زاد بُعد الطائرة عن المحطتين فالخطأ في الموقع:",o:["يزداد","يقل","لا يتغير"],a:0,why:"الخطأ الزاوي يتحول إلى مسافة أكبر مع البعد."}],
  ref:"الموضوع: الملاحة بالراديو، VOR (Radio Navigation)."
});
/* ---- 2 ---- */
LK("nav",{
  ar:"المدى المائل في DME", en:"DME slant range versus ground distance",
  alt:"مثلث قائم الزاوية بين الطائرة والمحطة، والفرق بين المدى المائل المقروء والمسافة الأرضية، ومنحنى الخطأ مع المسافة",
  intro:["جهاز DME يقيس زمن ذهاب نبضة وإيابها إلى المحطة، فيحسب 'المدى المائل' s وهو الخط المستقيم بين الطائرة والهوائي. المسافة على الأرض d أقل منه: s² = d² + h²، حيث h الارتفاع فوق المحطة.",
         "الخطأ صغير ما دامت المسافة كبيرة، ويصبح كبيراً عند الاقتراب من المحطة أو الطيران على ارتفاع عالٍ: فوق المحطة مباشرة يقرأ الجهاز الارتفاع نفسه (6 NM عند 36000 قدم تقريباً). لذلك يحسب الحاسوب المسافة الأرضية أحياناً لتصحيح هذا."],
  ctl:[{k:"h",ar:"الارتفاع فوق المحطة",min:0,max:45000,step:500,v:30000,f:v=>nf(v,0)+" ft"},{k:"d",ar:"المسافة الأرضية",min:0,max:100,step:0.5,v:8,f:v=>nf(v,1)+" NM"}],
  pre:[{ar:"فوق المحطة",set:{d:0}},{ar:"قوس DME",set:{d:10,h:20000}},{ar:"بعيد",set:{d:60}}],
  calc(st){ const hn=st.h/6076; st.hn=hn; st.s=Math.hypot(st.d,hn); st.err=st.s-st.d; st.ep=st.d>0?st.err/st.d*100:0; st.sf=d=>Math.hypot(d,hn)-d; st.dg=ds=>Math.sqrt(Math.max(0,ds*ds-hn*hn)); },
  scene(g,r,st,C){ const x0=r.x+r.w*0.12, x1=r.x+r.w*0.88, gy=r.y+r.h*0.78, mx=Math.max(st.d,st.hn,10), s=Math.min((x1-x0)/mx*0.9,r.h*0.62/Math.max(st.hn,3)), sx=(x1-x0)*0.85/mx; const ax=x0+st.d*sx, ay=gy-st.hn*s; lline(g,[[x0,gy],[x1,gy]],C.muted,2); g.fillStyle=mixC(C.panel,C.hyd,0.6); g.beginPath(); g.moveTo(x0-10,gy); g.lineTo(x0,gy-14); g.lineTo(x0+10,gy); g.closePath(); g.fill(); g.strokeStyle=C.ink; g.stroke();
    lline(g,[[x0,gy],[ax,gy]],C.hyd,2.4); lline(g,[[ax,gy],[ax,ay]],C.muted,1.4,[4,3]); lline(g,[[x0,gy],[ax,ay]],C.power,2.4); lplane(g,ax,ay,0.1*(x1-x0)/0.9,0,C,{flip:true}); ltx(g,"d = "+nf(st.d,1),(x0+ax)/2,gy+16,{s:12,m:true,c:C.hyd}); ltx(g,"h = "+nf(st.hn,2),ax+10,(ay+gy)/2,{s:12,m:true,a:"left"}); ltx(g,"s = "+nf(st.s,2),(x0+ax)/2,(ay+gy)/2-14,{s:13,w:700,m:true,c:C.power});
    ltx(g,"الجهاز يقرأ "+nf(st.s,1)+" NM، والأرضية "+nf(st.d,1),r.x+r.w*0.5,r.y+r.h*0.1,{s:13,w:600,rtl:true}); },
  plot(st){ return {x:[0,30],y:[0,Math.max(1,st.hn*1.05)],xl:"المسافة الأرضية NM",yl:"خطأ المدى NM",curves:[{f:st.sf,c:"power"}],dots:[{x:Math.min(st.d,30),y:st.err,c:"power"}]}; },
  ro(st){ return [["المدى المائل s",nf(st.s,2)+" NM"],["المسافة الأرضية d",nf(st.d,2)+" NM"],["الارتفاع بالأميال",nf(st.hn,2)+" NM"],["الخطأ",nf(st.err,2)+" NM"],["الخطأ نسبة",st.d>0?nf(st.ep,1)+" %":"—"]]; },
  eq:["s = √(d² + h²)","d = √(s² − h²)","الارتفاع بالأميال = h(ft) / 6076"],
  note:["الأرض كروية، لكن لمسافات أقصر من 100 NM يكفي هذا المثلث المستوي.","عند قوس DME بمسافة ثابتة يلزم أخذ الارتفاع بالحسبان لكي يتطابق مسار الطائرة مع القوس الأرضي المطلوب."],
  quiz:[{q:"فوق المحطة مباشرة، ماذا يقرأ DME؟",o:["الارتفاع فوق المحطة بالأميال","صفراً","المسافة الأرضية"],a:0,why:"d = 0 فيكون s = h."},
        {q:"متى يكون الخطأ ضئيلاً؟",o:["عند مسافة أرضية كبيرة","فوق المحطة","على ارتفاع عالٍ قريباً"],a:0,why:"s ≈ d حين d ≫ h."}],
  ref:"الموضوع: أجهزة قياس المسافة (Distance Measuring Equipment)."
});
/* ---- 3 ---- */
LK("nav",{
  ar:"عرض مسار جهاز التوجيه ILS ومؤشر الانحراف", en:"Localizer course width and needle sensitivity",
  alt:"منظر علوي لمدرج ومخروط توجيه الاتجاه يضيق عند الاقتراب من الهوائي، وطائرة منحرفة جانبياً، ومنحنى عرض المسار مع المسافة",
  intro:["هوائي مُحدِّد الاتجاه (localizer) يقع خلف نهاية المدرج، ويرسل مساراً زاويته ثابتة. تُضبط زاوية المسار بحيث يبلغ عرضه عند عتبة المدرج نحو 210 م (±105 م). نصف الزاوية θ = atan( 105 / L ) حيث L مسافة الهوائي حتى العتبة.",
         "حساسية المؤشر زاوية، لا مسافة: إذا ابتعدت الطائرة عن المسار بزاوية φ يكون انحراف الإبرة نسبة φ إلى θ. لذلك فإن الانحراف الجانبي نفسه يعطي انحرافاً أكبر عند الاقتراب من المدرج. وهذا يفسّر لماذا تحتاج الطائرة تصحيحات أدق كلما قربت، وتقل الحاجة لها عند البعد."],
  ctl:[{k:"L",ar:"بعد الهوائي عن العتبة",min:1500,max:4500,step:100,v:3000,f:v=>nf(v,0)+" m"},{k:"cw",ar:"عرض المسار عند العتبة",min:150,max:300,step:10,v:210,f:v=>nf(v,0)+" m"},{k:"dn",ar:"المسافة من العتبة",min:0.5,max:15,step:0.5,v:5,f:v=>nf(v,1)+" NM"},{k:"x",ar:"الانحراف الجانبي",min:-600,max:600,step:10,v:150,f:v=>nf(v,0)+" m"}],
  calc(st){ st.th=Math.atan(st.cw/2/st.L); st.dist=st.dn*1852+st.L; st.phi=Math.atan(st.x/st.dist); st.dots=clamp(2*st.phi/st.th,-3,3); st.fs=st.dist*Math.tan(st.th); st.dpd=st.fs/2; st.wf=d=>(d*1852+st.L)*Math.tan(st.th)*2; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.1, x1=r.x+r.w*0.9, cy=r.y+r.h*0.5, mx=15*1852+st.L, sx=(x1-x0)/mx, ant=x1; g.fillStyle=mixC(C.panel,C.struct,0.4); g.fillRect(ant-st.L*sx-6,cy-5,st.L*sx+6,10); ldot(g,ant,cy,5,C.hyd); ltx(g,"هوائي",ant,cy+20,{s:11,rtl:true}); g.fillStyle=mixC(C.panel,C.hyd,0.18); g.beginPath(); g.moveTo(ant,cy); g.lineTo(x0,cy-Math.tan(st.th)*mx*sx*1.0); g.lineTo(x0,cy+Math.tan(st.th)*mx*sx*1.0); g.closePath(); g.fill();
    const px=ant-st.dist*sx; const ofs=clamp(st.x/600,-1,1)*r.h*0.3; lplane(g,px+0,cy+ofs,0.06*(x1-x0)/0.9,0,C,{flip:true}); ltx(g,nf(st.dots,2)+" نقطة",px,cy+ofs-22,{s:12,w:700,rtl:true,c:Math.abs(st.dots)>1?C.power:C.ink}); const mw=r.w*0.12, mx0=r.x+r.w*0.06, my=r.y+r.h*0.12; g.strokeStyle=C.ink; g.strokeRect(mx0,my,mw,22); lline(g,[[mx0+mw/2,my],[mx0+mw/2,my+22]],C.line,1); lline(g,[[mx0+mw/2+st.dots/3*mw/2,my-2],[mx0+mw/2+st.dots/3*mw/2,my+24]],C.power,3);
    ltx(g,"عرض المسار الكامل عند الطائرة ≈ "+nf(st.fs*2,0)+" m",r.x+r.w*0.5,r.y+r.h*0.92,{s:12,rtl:true,c:C.muted}); },
  plot(st){ return {x:[0,15],y:[0,st.wf(15)*1.05],xl:"المسافة من العتبة NM",yl:"عرض المسار الكامل m",curves:[{f:st.wf,c:"hyd"}],hl:[{y:st.cw,c:"muted",t:"عند العتبة"}],dots:[{x:st.dn,y:st.fs*2,c:"power"}]}; },
  ro(st){ return [["نصف زاوية المسار",nf(st.th/D2R,2)+"°"],["انحراف الإبرة",nf(st.dots,2)+" نقطة"],["الانحراف الزاوي",nf(st.phi/D2R,2)+"°"],["نصف عرض المسار هنا",nf(st.fs,0)+" m"],["الانحراف لكل نقطة",nf(st.dpd,0)+" m"]]; },
  eq:["θ = atan( عرض/2 ÷ L )","φ = atan( x / (d + L) )","النقاط = 2 φ / θ"],
  note:["انحراف كامل (نقطتان) يمثل خروج الطائرة بنصف زاوية المسار. القيم تقريبية لتوضيح الاتجاه، والمعايرة الفعلية في دليل التشغيل.","الطيار الآلي يستخدم الإشارة نفسها عبر تحكم يعدّل الكسب مع المسافة."],
  quiz:[{q:"الانحراف الجانبي نفسه يعطي إبرة أكبر عند:",o:["القرب من المدرج","البعد","لا فرق"],a:0,why:"الزاوية تكبر مع تناقص المسافة."},
        {q:"زيادة عرض المسار عند العتبة تجعل الإبرة:",o:["أقل حساسية","أكثر حساسية","كما هي"],a:0,why:"θ أكبر فتقل النسبة φ/θ."}],
  ref:"الموضوع: نظام الهبوط بالأجهزة ILS (Instrument Landing System)."
});
/* ---- 4 ---- */
LK("nav",{
  ar:"دقة نظام الأقمار: هندسة التوزيع DOP", en:"Satellite geometry and dilution of precision",
  alt:"مخطط سماء بدائري فيه مواقع الأقمار، ومنحنى معامل التخفيف PDOP مع انتشار الأقمار في السماء",
  intro:["يحسب مستقبل الأقمار موقعه من مدى مقاس إلى عدة أقمار. لكل مدى خطأ صغير σ، لكن الخطأ النهائي يتضاعف بحسب هندسة الأقمار: PDOP يضرب خطأ المدى ليعطي خطأ الموقع. أقمار مجتمعة في ناحية واحدة من السماء تعطي هندسة سيئة (PDOP كبير).",
         "رياضياً: مصفوفة G لكل قمر صفها [−cos e sin a ، −cos e cos a ، −sin e ، 1] (اتجاه القمر من المستقبل وأخرها عمود للساعة). ثم PDOP = √(Q₁₁+Q₂₂+Q₃₃) حيث Q = (GᵀG)⁻¹. الأقمار الموزعة جيداً في السماء، مع قمر قرب الذروة، تعطي أصغر قيمة."],
  ctl:[{k:"n",ar:"عدد الأقمار",min:4,max:10,step:1,v:6,f:v=>nf(v,0)},{k:"sp",ar:"انتشار الأقمار في السماء",min:0.15,max:1,step:0.01,v:0.9,f:v=>nf(v*100,0)+" %"},{k:"el",ar:"ارتفاع الأقمار",min:10,max:75,step:1,v:35,f:v=>nf(v,0)+"°"},{k:"se",ar:"خطأ المدى لكل قمر",min:1,max:15,step:0.5,v:5,f:v=>nf(v,1)+" m"}],
  pre:[{ar:"سماء مفتوحة",set:{n:8,sp:1}},{ar:"وادٍ ضيق",set:{n:5,sp:0.3,el:60}}],
  calc(st){ const dop=(n,sp,el)=>{ const G=[]; for(let i=0;i<n;i++){ const a=(i/n)*sp*360*D2R, e=clamp(el+(i%3-1)*20,5,89)*D2R; G.push([-Math.cos(e)*Math.sin(a),-Math.cos(e)*Math.cos(a),-Math.sin(e),1]); } const M=[0,1,2,3].map(r=>[0,1,2,3].map(c=>G.reduce((s,g)=>s+g[r]*g[c],0))); const Q=nvInv4(M); if(!Q) return null; return {p:Math.sqrt(Math.max(0,Q[0][0]+Q[1][1]+Q[2][2])),h:Math.sqrt(Math.max(0,Q[0][0]+Q[1][1])),v:Math.sqrt(Math.max(0,Q[2][2])),t:Math.sqrt(Math.max(0,Q[3][3]))}; }; st.dopf=dop; st.d=dop(st.n,st.sp,st.el); st.pf=sp=>{ const d=dop(st.n,sp,st.el); return d?Math.min(40,d.p):40; }; st.ok=!!st.d; st.pd=st.ok?st.d.p:99; st.ep=st.pd*st.se; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.5, R=Math.min(r.w*0.3,r.h*0.4); [1,2/3,1/3].forEach(f=>{ g.strokeStyle=C.line; g.lineWidth=1; g.beginPath(); g.arc(cx,cy,R*f,0,Math.PI*2); g.stroke(); }); lline(g,[[cx-R,cy],[cx+R,cy]],C.line,1); lline(g,[[cx,cy-R],[cx,cy+R]],C.line,1); ltx(g,"N",cx,cy-R-10,{s:11,m:true,c:C.muted});
    for(let i=0;i<st.n;i++){ const a=(i/st.n)*st.sp*360*D2R, e=clamp(st.el+(i%3-1)*20,5,89), rr=R*(90-e)/90, x=cx+Math.sin(a)*rr, y=cy-Math.cos(a)*rr; ldot(g,x,y,7,C.hyd); ltx(g,String(i+1),x,y,{s:9,w:700,m:true,c:"#fff"}); }
    ltx(g,"PDOP = "+nf(st.pd,2),r.x+r.w*0.5,r.y+r.h*0.07,{s:15,w:700,m:true,c:st.pd>6?C.power:C.ink}); ltx(g,"خطأ الموقع ≈ "+nf(st.ep,0)+" m",r.x+r.w*0.5,r.y+r.h*0.93,{s:13,w:600,rtl:true}); },
  plot(st){ return {x:[0.15,1],y:[0,12],xl:"انتشار الأقمار",yl:"PDOP",curves:[{f:st.pf,c:"hyd"}],hl:[{y:6,c:"power",t:"سيئة"},{y:2,c:"muted",t:"جيدة"}],dots:[{x:st.sp,y:Math.min(12,st.pd),c:"power"}]}; },
  ro(st){ return st.ok?[["PDOP",nf(st.d.p,2)],["HDOP أفقي",nf(st.d.h,2)],["VDOP رأسي",nf(st.d.v,2)],["TDOP زمني",nf(st.d.t,2)],["خطأ الموقع",nf(st.ep,0)+" m"]]:[["الحالة","هندسة غير صالحة"]]; },
  eq:["G_i = [ −cos e_i sin a_i ، −cos e_i cos a_i ، −sin e_i ، 1 ]","Q = (Gᵀ G)⁻¹","PDOP = √(Q₁₁ + Q₂₂ + Q₃₃)","خطأ الموقع ≈ PDOP × σ"],
  note:["أرقام σ وPDOP هنا أمثلة تعليمية، وتتغير أخطاء المدى مع الغلاف الجوي والتعدد المساري ودقة الساعة.","الطائرات تستخدم رقابة سلامة (RAIM) تكشف قمراً معطوباً بحسب اتفاق قياسات الأقمار الزائدة."],
  quiz:[{q:"أي توزيع للأقمار أفضل؟",o:["موزعة على كل السماء","مجتمعة في ناحية واحدة","كلها قرب الأفق"],a:0,why:"يعطي PDOP أصغر."},
        {q:"ماذا يعني PDOP = 3 وخطأ المدى 5 m؟",o:["خطأ الموقع نحو 15 m","نحو 5 m","نحو 1.7 m"],a:0,why:"خطأ الموقع = PDOP × σ."}],
  show:{ar:"اعرض هوائي GPS",fn:()=>lrnSel("ant_gps")},
  ref:"الموضوع: نظام تحديد المواقع العالمي وهندسته (GNSS Geometry)."
});
/* ---- 5 ---- */
LK("nav",{
  ar:"الملاحة بالقصور الذاتي: انجراف الجيروسكوب", en:"Inertial navigation drift and Schuler oscillation",
  alt:"منحنى خطأ الموقع مع زمن الطيران لوحدة قصور ذاتي بلا تحديث ومع تحديث دوري، وتذبذب شولر الصغير",
  intro:["تحسب وحدة القصور الذاتي موقعها بتكامل التسارع مرتين، وتعتمد على جيروسكوبات تحفظ الاتجاه. أي انجراف صغير في الجيروسكوب ε يتحول إلى خطأ ميل ثم إلى خطأ موقع ينمو تقريباً بخطية: e ≈ 60 · ε · t ميلاً بحرياً، حيث ε بالدرجة في الساعة وt بالساعة.",
         "إلى جانب النمو الخطي يوجد تذبذب شولر الدوري بزمن 84.4 دقيقة (T = 2π √(R/g))، ناتج عن ضبط الوحدة حتى لا تتأثر بحركة الطائرة. يمكن ضبط الخطأ بتحديثات دورية من الأقمار أو محطات الراديو، فيعود للصفر ويبدأ من جديد."],
  ctl:[{k:"ep",ar:"انجراف الجيروسكوب",min:0.001,max:0.1,step:0.001,v:0.01,f:v=>nf(v,3)+" °/h"},{k:"mis",ar:"خطأ المحاذاة الأولي",min:0,max:10,step:0.5,v:2,f:v=>nf(v,1)+" ′"},{k:"T",ar:"مدة الطيران",min:1,max:16,step:0.5,v:8,f:v=>nf(v,1)+" h"},{k:"up",ar:"فاصل التحديث (0 = بلا)",min:0,max:8,step:0.5,v:0,f:v=>v===0?"بلا":nf(v,1)+" h"}],
  pre:[{ar:"وحدة ملاحية جيدة",set:{ep:0.003}},{ar:"وحدة أضعف",set:{ep:0.05}},{ar:"مع تحديث كل 2 ساعة",set:{up:2}}],
  calc(st){ st.ws=2*Math.PI/(84.4*60); st.A=3440*st.mis/60*D2R; st.err=(t,u)=>{ const tt=u>0?t%u:t; return 60*st.ep*tt+st.A*Math.abs(Math.sin(st.ws*tt*3600)); }; st.e1=st.err(st.T,0); st.e2=st.up>0?st.err(st.T,st.up):st.e1; st.rate=60*st.ep; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.1, x1=r.x+r.w*0.9, y=r.y+r.h*0.46; lline(g,[[x0,y],[x1,y]],C.ink,2); const ex=Math.min(st.e1,60), tm=(st.t*0.12)%1, px=x0+(x1-x0)*tm, T=st.T*tm, e=st.err(T,st.up), off=clamp(e/Math.max(5,st.e1)*r.h*0.22,0,r.h*0.28); ldot(g,px,y,6,C.ink); ldot(g,px,y+off,6,C.power); lline(g,[[px,y],[px,y+off]],C.power,1.6,[3,3]); ltx(g,"الموقع الحقيقي",x1,y-14,{s:11,a:"right",rtl:true}); ltx(g,"موقع الوحدة",px,y+off+16,{s:11,rtl:true,c:C.power});
    if(st.up>0) for(let k=1;k*st.up<st.T;k++){ const x=x0+(x1-x0)*k*st.up/st.T; lline(g,[[x,y-14],[x,y+14]],C.hyd,1.4); ltx(g,"تحديث",x,y-24,{s:10,rtl:true,c:C.hyd}); }
    ltx(g,"معدل النمو "+nf(st.rate,2)+" NM/h  ·  بعد "+nf(st.T,1)+" h: "+nf(st.e2,1)+" NM",r.x+r.w*0.5,r.y+r.h*0.1,{s:13,w:600,rtl:true}); ltx(g,"دورة شولر 84.4 دقيقة",r.x+r.w*0.5,r.y+r.h*0.92,{s:11,rtl:true,c:C.muted}); },
  plot(st){ const a=[],b=[],N=160; for(let i=0;i<=N;i++){ const t=st.T*i/N; a.push([t,st.err(t,0)]); b.push([t,st.err(t,st.up)]); } const mx=Math.max(1,a[a.length-1][1]*1.05); return {x:[0,st.T],y:[0,mx],xl:"الزمن h",yl:"خطأ الموقع NM",lines:[{pts:a,c:"power",w:2.2}].concat(st.up>0?[{pts:b,c:"hyd",w:2.2}]:[]),leg:st.up>0?[{c:"power",t:"بلا تحديث"},{c:"hyd",t:"مع تحديث"}]:[]}; },
  ro(st){ return [["معدل نمو الخطأ",nf(st.rate,2)+" NM/h"],["خطأ التذبذب الأقصى",nf(st.A,2)+" NM"],["الخطأ بلا تحديث",nf(st.e1,1)+" NM"],["الخطأ مع التحديث",st.up>0?nf(st.e2,1)+" NM":"—"],["دورة شولر","84.4 min"]]; },
  eq:["e(t) ≈ 60 ε t + R φ₀ |sin ω_s t|","T_s = 2π √(R / g) ≈ 84.4 min","ω_s = 2π / T_s"],
  note:["المعادلة تقريبية: تجمع الانجراف الخطي الأقصى مع سعة التذبذب. الأنظمة الحديثة تدمج الأقمار فتُصحح الانجراف باستمرار.","في الطائرات الكبيرة تتوفر ثلاث وحدات مرجعية، وتتحقق بالمقارنة بينها."],
  quiz:[{q:"ماذا يعني انجراف 0.01 °/h تقريباً؟",o:["نحو 0.6 NM في الساعة","نحو 6 NM في الساعة","لا خطأ"],a:0,why:"60 × 0.01."},
        {q:"ما فائدة التحديث الدوري؟",o:["إعادة الخطأ إلى الصفر","زيادة الدقة الأولية","زيادة الانجراف"],a:0,why:"يزيل الخطأ المتراكم."}],
  show:{ar:"اعرض وحدة القصور الذاتي",fn:()=>lrnSel("adiru")},
  ref:"الموضوع: أنظمة الملاحة بالقصور الذاتي (Inertial Navigation Systems)."
});
/* ---- 6 ---- */
LK("nav",{
  ar:"RNP: ميزانية خطأ الملاحة", en:"Required navigation performance error budget",
  alt:"ممر ملاحي عرضه RNP وحدوده 2 RNP مع مسار طائرة متذبذب، ومنحنى الخطأ الكلي مع خطأ الطيران",
  intro:["RNP يحدد دقة الملاحة المطلوبة جانبياً: مثلاً RNP 0.3 يعني أن الطائرة يجب أن تبقى ضمن 0.3 ميل بحري على جانبي المسار لـ95% من الوقت. الخطأ الكلي للنظام TSE مجموع ثلاثة أخطاء مستقلة تقريباً: خطأ نظام الملاحة NSE وخطأ الطيران FTE وخطأ تعريف المسار PDE.",
         "تُجمع بجذر مجموع المربعات: TSE = √(NSE² + FTE² + PDE²). لذلك الخطأ الأكبر هو المتحكم، وتخفيضه يعطي فائدة أكبر. وتستوجب الإجراءات كذلك رقابة وتنبيهاً لتجاوز حد 2×RNP، ما يجعل الإنذار قبل الخروج من الممر."],
  ctl:[{k:"rnp",ar:"قيمة RNP",min:0.1,max:2,step:0.05,v:0.3,f:v=>nf(v,2)+" NM"},{k:"nse",ar:"خطأ نظام الملاحة NSE",min:0.01,max:0.3,step:0.01,v:0.08,f:v=>nf(v,2)+" NM"},{k:"fte",ar:"خطأ الطيران FTE",min:0.01,max:0.4,step:0.01,v:0.1,f:v=>nf(v,2)+" NM"},{k:"pde",ar:"خطأ تعريف المسار PDE",min:0,max:0.1,step:0.005,v:0.01,f:v=>nf(v,3)+" NM"}],
  pre:[{ar:"طيار آلي دقيق",set:{fte:0.03}},{ar:"طيران يدوي",set:{fte:0.25}}],
  calc(st){ st.tse=Math.hypot(st.nse,st.fte,st.pde); st.ok=st.tse<=st.rnp; st.mar=st.rnp-st.tse; st.tf=f=>Math.hypot(st.nse,f,st.pde); st.sh=[st.nse,st.fte,st.pde].map(v=>v*v/(st.tse*st.tse)*100); },
  scene(g,r,st,C){ const x0=r.x+r.w*0.08, x1=r.x+r.w*0.92, cy=r.y+r.h*0.5, sc=Math.min(r.h*0.34/Math.max(st.rnp*2,st.tse*1.2),160); g.fillStyle=mixC(C.panel,C.hyd,0.12); g.fillRect(x0,cy-st.rnp*sc,x1-x0,st.rnp*2*sc); [-2,2].forEach(k=>lline(g,[[x0,cy+k*st.rnp*sc],[x1,cy+k*st.rnp*sc]],C.power,1.4,[6,4])); [-1,1].forEach(k=>lline(g,[[x0,cy+k*st.rnp*sc],[x1,cy+k*st.rnp*sc]],C.hyd,1.8)); lline(g,[[x0,cy],[x1,cy]],C.ink,1.2,[2,3]);
    const pts=[]; for(let i=0;i<=120;i++){ const f=i/120, x=x0+(x1-x0)*f, y=cy+(Math.sin(f*18+st.t*0.4)*0.55+Math.sin(f*7.3+1)*0.45)*st.tse*sc*0.85; pts.push([x,y]); } lline(g,pts,C.ctrl,2.2); const f=(st.t*0.08)%1, k=Math.floor(f*120); lplane(g,pts[k][0],pts[k][1],0.06*(x1-x0),90,C,{flip:false});
    ltx(g,"RNP "+nf(st.rnp,2)+" NM",x1-4,cy-st.rnp*sc-10,{s:11,m:true,a:"right",c:C.hyd}); ltx(g,"2×RNP حد التنبيه",x1-4,cy-2*st.rnp*sc-10,{s:11,rtl:true,a:"right",c:C.power}); ltx(g,"TSE 95% = "+nf(st.tse,3)+" NM",r.x+r.w*0.5,r.y+r.h*0.07,{s:14,w:700,m:true,c:st.ok?C.ink:C.power}); ltx(g,st.ok?"يستوفي RNP":"لا يستوفي RNP",r.x+r.w*0.5,r.y+r.h*0.93,{s:13,w:700,rtl:true,c:st.ok?C.hyd:C.power}); },
  plot(st){ return {x:[0,0.4],y:[0,Math.max(st.rnp*1.3,st.tf(0.4)*1.05)],xl:"خطأ الطيران NM",yl:"TSE NM",curves:[{f:st.tf,c:"hyd"}],hl:[{y:st.rnp,c:"power",t:"RNP"}],dots:[{x:st.fte,y:st.tse,c:st.ok?"hyd":"power"}]}; },
  ro(st){ return [["TSE الكلي",nf(st.tse,3)+" NM"],["RNP",nf(st.rnp,2)+" NM"],["الهامش",nf(st.mar,3)+" NM"],["حصة NSE / FTE / PDE",nf(st.sh[0],0)+" / "+nf(st.sh[1],0)+" / "+nf(st.sh[2],0)+" %"],["الحالة",st.ok?"مستوفٍ":"غير مستوفٍ"]]; },
  eq:["TSE = √(NSE² + FTE² + PDE²)","شرط الاستيفاء: TSE₉₅ ≤ RNP","حد التنبيه ≈ 2 × RNP"],
  note:["يفترض الدرس استقلال الأخطاء الثلاثة وتوزيعها الطبيعي. التعريف الدقيق لنسب الاحتواء في وثائق مجال التشغيل.","الطائرات الحديثة تحسب 'الأداء الفعلي' ACTUAL NAV PERFORMANCE وتعرضه، وتنبه حين يتجاوز RNP المطلوب."],
  quiz:[{q:"لخفض TSE بأفضل أثر نخفض:",o:["أكبر الأخطاء الثلاثة","أصغرها","أي منها بالتساوي"],a:0,why:"الجذر التربيعي لمجموع المربعات يتحكم فيه الأكبر."},
        {q:"RNP 0.3 يعني:",o:["البقاء ضمن 0.3 NM جانبياً في 95% من الوقت","تقدير الارتفاع","السرعة 0.3 ماخ"],a:0,why:"هو معيار الدقة الجانبية."}],
  ref:"الموضوع: الملاحة المعتمدة على الأداء (Performance Based Navigation)."
});
/* ---- 7 ---- */
LK("nav",{
  ar:"البوصلة: الاتجاه الحقيقي والمغناطيسي وزاوية الميل", en:"True, magnetic and compass headings; magnetic dip",
  alt:"وردة بوصلة فيها الشمال الحقيقي والمغناطيسي والاتجاه، ومنحنى زاوية ميل المجال المغناطيسي مع خط العرض",
  intro:["الشمال المغناطيسي غير الشمال الحقيقي: الفرق هو الانحراف المغناطيسي (variation) ويتغير بالمكان والزمن. وجود الحديد في الطائرة يضيف انحرافاً آخر (deviation) تقيسه البوصلة. السلسلة المعروفة: T → V → M → D → C. وبالاتجاه المعاكس تُطرح أو تُضاف الإشارات.",
         "القاعدة: الشرق أقل والغرب أكثر عند الانتقال من الحقيقي إلى المغناطيسي: M = T − Var_E. أما ميل المجال المغناطيسي I فيجعل الإبرة تميل نحو الأرض: tan I = 2 tan φ_m، حيث φ_m خط العرض المغناطيسي. وهذا يضعف المركّبة الأفقية قرب القطبين فتصبح البوصلة المغناطيسية غير موثوقة."],
  ctl:[{k:"tc",ar:"المسار الحقيقي",min:0,max:359,step:1,v:90,f:v=>nf(v,0)+"°"},{k:"va",ar:"الانحراف المغناطيسي (شرق +)",min:-30,max:30,step:1,v:5,f:v=>(v>0?"E ":v<0?"W ":"")+nf(Math.abs(v),0)+"°"},{k:"dv",ar:"انحراف البوصلة (شرق +)",min:-10,max:10,step:1,v:2,f:v=>(v>0?"E ":v<0?"W ":"")+nf(Math.abs(v),0)+"°"},{k:"pm",ar:"خط العرض المغناطيسي",min:0,max:85,step:1,v:50,f:v=>nf(v,0)+"°"}],
  calc(st){ st.mc=nvNorm(st.tc-st.va); st.ch=nvNorm(st.mc-st.dv); st.dip=Math.atan(2*Math.tan(st.pm*D2R))/D2R; st.hz=Math.cos(st.dip*D2R)/Math.cos(Math.atan(2*Math.tan(0))); st.dpf=p=>Math.atan(2*Math.tan(p*D2R))/D2R; st.hf=p=>Math.cos(st.dpf(p)*D2R)*100; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.5, R=Math.min(r.w*0.3,r.h*0.38); g.strokeStyle=C.ink; g.lineWidth=1.4; g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.stroke(); for(let i=0;i<36;i++){ const a=i*10*D2R, L=i%9===0?12:i%3===0?8:5; lline(g,[[cx+Math.sin(a)*R,cy-Math.cos(a)*R],[cx+Math.sin(a)*(R-L),cy-Math.cos(a)*(R-L)]],C.muted,1); }
    const arrow=(deg,c,t,rr)=>{ const a=deg*D2R; larrow(g,cx,cy,cx+Math.sin(a)*R*rr,cy-Math.cos(a)*R*rr,c,2.6,9); ltx(g,t,cx+Math.sin(a)*(R*rr+14),cy-Math.cos(a)*(R*rr+14),{s:11,w:700,rtl:true,c}); };
    arrow(0,C.hyd,"شمال حقيقي",0.92); arrow(-st.va,C.power,"شمال مغناطيسي",0.8); arrow(st.tc,C.ctrl,"مسار حقيقي",0.65); ltx(g,"M = "+nf(st.mc,0)+"°  ·  C = "+nf(st.ch,0)+"°",cx,r.y+r.h*0.06,{s:14,w:700,m:true}); ltx(g,"T "+nf(st.tc,0)+"° − Var "+nf(st.va,0)+" = M ؛ M − Dev "+nf(st.dv,0)+" = C",cx,r.y+r.h*0.94,{s:11,m:true,c:C.muted}); },
  plot(st){ return {x:[0,85],y:[0,90],xl:"خط العرض المغناطيسي °",yl:"ميل المجال °",curves:[{f:st.dpf,c:"hyd"}],dots:[{x:st.pm,y:st.dip,c:"power"}]}; },
  ro(st){ return [["الاتجاه المغناطيسي M",nf(st.mc,0)+"°"],["اتجاه البوصلة C",nf(st.ch,0)+"°"],["ميل المجال",nf(st.dip,1)+"°"],["المركبة الأفقية نسبة",nf(st.hf(st.pm)/st.hf(0)*100,0)+" % من خط الاستواء"]]; },
  eq:["M = T − Var(شرق +)  ،  C = M − Dev","tan I = 2 tan φ_m","H ∝ cos I"],
  note:["القيم أعلاه نموذج ثنائي القطب مبسط للأرض؛ الخرائط الحقيقية تعتمد نموذجاً عالمياً يتغير سنوياً.","في الطائرات الحديثة يُرجع الاتجاه إلى الشمال الحقيقي بالقصور الذاتي، ويحول إلى المغناطيسي بجدول لخطوط الانحراف."],
  quiz:[{q:"من الحقيقي إلى المغناطيسي عند انحراف شرقي 5°:",o:["نطرح 5°","نجمع 5°","لا نغيّر"],a:0,why:"الشرق أقل."},
        {q:"قرب القطبين البوصلة المغناطيسية:",o:["تضعف لأن المركبة الأفقية تقل","تتحسن","لا تتغير"],a:0,why:"ميل المجال يقترب من العمودي."}],
  ref:"الموضوع: الاتجاهات والبوصلة (Compass and Variation)."
});
/* ---- 8 ---- */
LK("nav",{
  ar:"إسقاط ميركاتور: التشوه مع خط العرض", en:"Mercator projection distortion",
  alt:"خريطة ميركاتور فيها دوائر متساوية على الأرض تكبر باتجاه القطبين، ومنحنى عامل المقياس sec φ مع خط العرض",
  intro:["خريطة ميركاتور تحفظ الزوايا فتبقى الاتجاهات المستقيمة خطوطاً مستقيمة، ولهذا تُستعمل في الملاحة. الثمن تشوه في المقياس: تُمدّد المساحات شمالاً وجنوباً. عامل المقياس عند خط العرض φ هو k = sec φ، فتزداد المسافات على الخريطة بنسبة 1/cos φ.",
         "الدوائر المتساوية على الأرض تظهر دوائر أكبر قرب القطبين (مساحتها تتضخّم sec² φ). والمسافة الحقيقية لدرجة خط طول واحدة تساوي 60·cos φ ميلاً بحرياً. لذلك لا يُقاس بالمسطرة من الخريطة إلا بمقياس خط العرض المحلي."],
  ctl:[{k:"lat",ar:"خط العرض",min:0,max:80,step:1,v:55,f:v=>nf(v,0)+"°"},{k:"cm",ar:"طول القياس على الخريطة",min:1,max:20,step:0.5,v:5,f:v=>nf(v,1)+" cm"},{k:"sc",ar:"مقياس الخريطة عند خط الاستواء",min:1,max:30,step:1,v:10,f:v=>"1 cm = "+nf(v,0)+" NM"}],
  calc(st){ st.k=1/Math.cos(st.lat*D2R); st.ar=st.k*st.k; st.nm=st.cm*st.sc/st.k; st.lon=60*Math.cos(st.lat*D2R); st.kf=l=>1/Math.cos(l*D2R); },
  scene(g,r,st,C){ const mx=r.x+r.w*0.1, mw=r.w*0.8, my=r.y+r.h*0.08, mh=r.h*0.8, ps=l=>Math.log(Math.tan(Math.PI/4+l*D2R/2)), ymax=ps(75), Y=l=>my+mh/2-(ps(l)/ymax)*mh/2; g.fillStyle=mixC(C.panel,C.hyd,0.07); g.fillRect(mx,my,mw,mh); g.strokeStyle=C.line; g.lineWidth=1; g.strokeRect(mx,my,mw,mh);
    for(let l=-60;l<=60;l+=15){ lline(g,[[mx,Y(l)],[mx+mw,Y(l)]],C.line,0.8,[2,4]); ltx(g,Math.abs(l)+"°",mx-4,Y(l),{s:9,m:true,a:"right",c:C.muted}); } lline(g,[[mx,Y(0)],[mx+mw,Y(0)]],C.line,1.2);
    const R0=mh*0.035; [0,20,40,60,70].forEach((l,i)=>{ const x=mx+mw*(0.14+i*0.18), k=1/Math.cos(l*D2R), on=Math.abs(l-st.lat)<12; g.fillStyle=mixC(C.panel,C.power,0.25); g.strokeStyle=C.power; g.lineWidth=1.4; g.beginPath(); g.arc(x,Y(l),R0*k,0,Math.PI*2); g.fill(); g.stroke(); ltx(g,"k = "+nf(k,2),x,Y(l)+R0*k+12,{s:10,m:true}); });
    const yl=Y(st.lat); lline(g,[[mx,yl],[mx+mw,yl]],C.ctrl,2); ltx(g,"φ = "+nf(st.lat,0)+"°",mx+mw-6,yl-10,{s:11,m:true,a:"right",c:C.ctrl}); },
  plot(st){ return {x:[0,80],y:[1,6],xl:"خط العرض °",yl:"عامل المقياس k",curves:[{f:st.kf,c:"hyd"}],dots:[{x:st.lat,y:Math.min(6,st.k),c:"power"}]}; },
  ro(st){ return [["عامل المقياس k = sec φ",nf(st.k,3)],["تضخم المساحة",nf(st.ar,2)+" ×"],["المسافة الحقيقية للقياس",nf(st.nm,1)+" NM"],["ميل شرقي لكل درجة طول",nf(st.lon,1)+" NM"]]; },
  eq:["k = sec φ = 1 / cos φ","تضخم المساحة = sec² φ","المسافة الحقيقية = (قياس × مقياس) / k","درجة طول = 60 cos φ NM"],
  note:["المسافات على ميركاتور تُقاس على مقياس خط العرض في الجانب، لا على مقياس مركزي واحد.","للرحلات الطويلة جداً تُفضَّل خرائط لامبرت المخروطية التي تقلل التشوه."],
  quiz:[{q:"عند خط عرض 60° عامل المقياس:",o:["2","0.5","1"],a:0,why:"1 / cos 60° = 2."},
        {q:"لماذا تُستعمل ميركاتور في الملاحة رغم التشوه؟",o:["تحفظ الاتجاهات الثابتة خطوطاً مستقيمة","تحفظ المساحات","تحفظ المسافات"],a:0,why:"مسار الخط المعيّن مستقيم."}],
  ref:"الموضوع: إسقاطات الخرائط (Map Projections)."
});
/* ---- 9 ---- */
LK("nav",{
  ar:"أفق الراديو: مدى الاتصال بخط البصر", en:"Radio horizon and line-of-sight range",
  alt:"كرة أرضية مقوّسة مع هوائي أرضي وطائرة وخط بصر مماس، ومنحنى المدى مع ارتفاع الطائرة لهوائيين مختلفين",
  intro:["الإشارات عالية التردد (VHF وDME وILS) تنتقل بخط شبه مستقيم، فيحجبها انحناء الأرض. مدى الاتصال بين هوائيين ارتفاعاهما h₁ وh₂ بالقدم هو تقريباً d ≈ 1.23 (√h₁ + √h₂) ميلاً بحرياً، بعد إضافة انكسار الغلاف الجوي الذي يمدّ المدى قليلاً (نصف قطر أرض فعلي 4/3).",
         "طائرة على 35000 قدم تتصل بمحطة ارتفاعها 100 قدم عبر مدى يقارب 250 NM. وكلما انخفضت الطائرة قصر المدى بشدة، فمثلاً عند 1000 قدم لا يتجاوز نحو 60 NM. ولذلك تتوزع هوائيات الاتصال والملاحة بكثافة قرب المطارات."],
  ctl:[{k:"ha",ar:"ارتفاع الطائرة",min:0,max:45000,step:500,v:35000,f:v=>nf(v,0)+" ft"},{k:"hg",ar:"ارتفاع هوائي المحطة",min:0,max:600,step:10,v:100,f:v=>nf(v,0)+" ft"}],
  pre:[{ar:"طيران منخفض",set:{ha:3000}},{ar:"ارتفاع الإبحار",set:{ha:36000}}],
  calc(st){ st.rng=(a,g)=>1.23*(Math.sqrt(a)+Math.sqrt(g)); st.d=st.rng(st.ha,st.hg); st.da=1.23*Math.sqrt(st.ha); st.dg=1.23*Math.sqrt(st.hg); },
  scene(g,r,st,C){ const R=r.w*1.1, ox=r.x+r.w*0.5, oy=r.y+r.h*0.92+R, span=clamp(st.d/260,0.1,1)*0.26;
    g.save(); g.beginPath(); g.rect(r.x,r.y,r.w,r.h); g.clip(); g.fillStyle=mixC(C.panel,C.struct,0.35); g.beginPath(); g.arc(ox,oy,R,0,Math.PI*2); g.fill(); g.strokeStyle=C.ink; g.lineWidth=1.4; g.stroke();
    const aG=-Math.PI/2-span, aA=-Math.PI/2+span, hgp=10+st.hg/600*26, hap=14+st.ha/45000*r.h*0.4, P=(a,h)=>[ox+Math.cos(a)*(R+h),oy+Math.sin(a)*(R+h)], g0=P(aG,0), g1=P(aG,hgp), a0=P(aA,0), a1=P(aA,hap);
    lline(g,[g0,g1],C.ink,3); ldot(g,g1[0],g1[1],4,C.hyd); lline(g,[a0,a1],C.line,1,[2,3]); lplane(g,a1[0],a1[1]-4,0.08*r.w,0,C); lline(g,[g1,a1],C.power,1.8,[6,4]); g.restore();
    ltx(g,"هوائي الأرض",g1[0],g1[1]-16,{s:11,rtl:true}); ltx(g,"مدى الاتصال ≈ "+nf(st.d,0)+" NM",r.x+r.w*0.5,r.y+r.h*0.1,{s:15,w:700,rtl:true}); ltx(g,nf(st.dg,0)+" + "+nf(st.da,0)+" NM",r.x+r.w*0.5,r.y+r.h*0.2,{s:12,m:true,c:C.muted}); },
  plot(st){ return {x:[0,45000],y:[0,st.rng(45000,st.hg)*1.05],xl:"ارتفاع الطائرة ft",yl:"المدى NM",curves:[{f:a=>st.rng(a,st.hg),c:"hyd"},{f:a=>st.rng(a,10),c:"muted",dash:[5,3]}],leg:[{c:"hyd",t:"الهوائي الحالي"},{c:"muted",t:"هوائي 10 ft",dash:[5,3]}],dots:[{x:st.ha,y:st.d,c:"power"}]}; },
  ro(st){ return [["أفق الطائرة",nf(st.da,0)+" NM"],["أفق الهوائي",nf(st.dg,0)+" NM"],["المدى الكلي",nf(st.d,0)+" NM"]]; },
  eq:["d ≈ 1.23 ( √h₁ + √h₂ )   (ميل بحري ، قدم)","كل أفق: d = 1.23 √h","نصف قطر الأرض الفعلي = 4/3 R"],
  note:["المعادلة تفترض هواءً قياسياً. الانكسار الشاذ (مثل طبقات الانقلاب الحراري) قد يزيد المدى أو يقصره أحياناً.","ترددات الرادار والملاحة قد تتجاوز الأفق قليلاً بسبب تشتت الغلاف الجوي، لكن لا يُعتمد عليه."],
  quiz:[{q:"ما أثر مضاعفة ارتفاع الطائرة مرتين على أفقها؟",o:["يزداد بنسبة √2 فقط","يتضاعف","لا يتغير"],a:0,why:"d ∝ √h."},
        {q:"لماذا تُركَّب هوائيات VHF بمواضع عالية؟",o:["لزيادة أفق الراديو","لتبريدها","لتخفيف الضجيج"],a:0,why:"ترفع √h₂."}],
  show:{ar:"اعرض هوائي VHF",fn:()=>lrnSel("ant_vhf")},
  ref:"الموضوع: انتشار الموجات الراديوية (Radio Wave Propagation)."
});
