/* ---------- Book 11: Jet Aircraft Systems (1/3): hydraulics and landing gear ---------- */
/* a vertical cylinder: x centre, y top, width w, height h; fluid fills from the bottom; the piston sits at fraction pos (0 top, 1 bottom) of the height */
function ayCyl(g,x,y,w,h,pos,C,o){ o=o||{}; const py=y+h*clamp(pos,0,1);
  g.fillStyle=mixC(C.panel,C.hyd,0.35); g.fillRect(x-w/2,py,w,y+h-py);
  g.strokeStyle=C.ink; g.lineWidth=1.3; g.strokeRect(x-w/2,y,w,h);
  g.fillStyle=mixC(C.panel,C.struct,0.8); g.fillRect(x-w/2+1,py-5,w-2,7); g.strokeRect(x-w/2+1,py-5,w-2,7);
  lline(g,[[x,py-5],[x,y-(o.rod||18)]],C.ink,o.rw||3); }
/* ---- 1 ---- */
LK("asy",{
  ar:"قانون باسكال: الرافعة الهيدروليكية", en:"Pascal's law and the hydraulic jack",
  alt:"أسطوانتان متصلتان بالسائل: مكبس صغير تدفعه قوة صغيرة ومكبس كبير يرفع حملاً أكبر، ومنحنى القوة الناتجة مع مساحة المكبس الكبير",
  intro:["السائل لا ينضغط تقريباً، وأي ضغط يُطبَّق عليه ينتقل بالقيمة نفسها إلى كل نقطة فيه. هذا قانون باسكال، وعليه تقوم كل مشغّلات الطائرة الهيدروليكية: العجلات والقلابات والدفة.",
         "ندفع مكبساً صغيراً بقوة F₁ فينشأ ضغط p = F₁/A₁ ينتقل إلى مكبس أكبر مساحة، فتصبح قوته F₂ = p·A₂ أكبر بنسبة المساحتين. لا شيء مجاني: حجم السائل ثابت، فيتحرك المكبس الكبير مسافة أصغر بالنسبة نفسها، والشغل المبذول يساوي الشغل الناتج."],
  ctl:[{k:"A1",ar:"مساحة المكبس الصغير",min:2,max:20,step:0.5,v:5,f:v=>nf(v,1)+" cm²"},{k:"A2",ar:"مساحة المكبس الكبير",min:20,max:200,step:5,v:80,f:v=>nf(v,0)+" cm²"},{k:"F1",ar:"القوة على الصغير",min:50,max:1000,step:10,v:200,f:v=>nf(v,0)+" N"},{k:"s1",ar:"شوط المكبس الصغير",min:10,max:100,step:1,v:40,f:v=>nf(v,0)+" mm"}],
  pre:[{ar:"رافعة يدوية",set:{A1:3,A2:60,F1:150,s1:60}},{ar:"مشغّل كبير",set:{A1:10,A2:180,F1:800,s1:30}}],
  calc(st){ st.p=st.F1/(st.A1*1e-4); st.F2=st.p*st.A2*1e-4; st.gain=st.A2/st.A1; st.s2=st.s1/st.gain; st.W=st.F1*st.s1*1e-3; st.n=Math.ceil(10/st.s2); },
  scene(g,r,st,C){ const ph=(Math.sin(st.t*1.6)+1)/2, base=r.y+r.h*0.78, hh=r.h*0.5, top=base-hh, w1=14+30*Math.sqrt(st.A1/20), w2=18+Math.min(r.w*0.3,66*Math.sqrt(st.A2/200)), x1=r.x+r.w*0.2, x2=r.x+r.w*0.7;
    g.fillStyle=mixC(C.panel,C.hyd,0.35); g.fillRect(x1,base-6,x2-x1,12); g.strokeStyle=C.ink; g.lineWidth=1.2; g.strokeRect(x1,base-6,x2-x1,12);
    const p1=0.15+0.5*ph, p2=0.15+0.5*ph*st.s2/Math.max(st.s1,1)*0.9+0.0;
    ayCyl(g,x1,top,w1,hh,p1,C); ayCyl(g,x2,top,w2,hh,0.15+(p1-0.15)/Math.max(1,st.gain)*1.0,C);
    larrow(g,x1,top-48,x1,top-24-(1-ph)*0,C.power,2.6,9); ltx(g,"F₁ = "+nf(st.F1,0)+" N",x1,top-58,{s:11,w:600,c:C.power,m:true});
    const ly=top+hh*(0.15+(p1-0.15)/Math.max(1,st.gain))-34; kBox(g,x2-w2*0.45,ly-18,w2*0.9,18,mixC(C.panel,C.struct,0.45),C,"حمل",{s:10}); larrow(g,x2,ly+4,x2,ly-48,C.ctrl,2.6,9);
    ltx(g,"F₂ = "+nf(st.F2,0)+" N",x2,Math.max(r.y+8,ly-58),{s:11,w:600,c:C.ctrl,m:true}); ltx(g,"p = "+nf(st.p*1e-5,1)+" bar",(x1+x2)/2,base+22,{s:12,w:600,m:true,c:C.hyd}); },
  plot(st){ const mx=Math.max(1,st.p*200e-4/1000*1.05); return {x:[20,200],y:[0,mx],xl:"A₂ (cm²)",yl:"F₂ (kN)",curves:[{f:a=>st.p*a*1e-4/1000,c:"hyd"}],dots:[{x:st.A2,y:st.F2/1000,c:"power",t:nf(st.F2/1000,1)+" kN"}]}; },
  ro(st){ return [["الضغط p",nf(st.p*1e-5,1)+" bar"],["القوة الناتجة F₂",nf(st.F2,0)+" N"],["تضخيم القوة",nf(st.gain,1)+" ×"],["شوط المكبس الكبير",nf(st.s2,2)+" mm"],["الشغل المبذول = الناتج",nf(st.W,1)+" J"],["ضغطات لرفع الحمل 10 mm",nf(st.n,0)]]; },
  eq:["p = F₁ / A₁","F₂ = p · A₂ = F₁ · A₂ / A₁","s₂ = s₁ · A₁ / A₂","F₁ s₁ = F₂ s₂"],
  note:["الرافعة تضخّم القوة وتخسر المسافة بالنسبة نفسها؛ لا تضيف طاقة. الطاقة الداخلة والخارجة متساوية إذا أهملنا الاحتكاك.","في الطائرة تأتي القوة الصغيرة من مضخة تعطي الضغط، وتتحكم الصمامات بمن يتلقى السائل في كل لحظة."],
  quiz:[{q:"ضاعفنا مساحة المكبس الكبير مع بقاء الباقي ثابتاً. تصبح القوة الناتجة:",o:["ضعف القيمة","نصف القيمة","كما هي"],a:0,why:"F₂ = p·A₂، والضغط p لم يتغير."},
        {q:"ماذا يحدث لشوط المكبس الكبير حين تكبر مساحته؟",o:["يقصر","يطول","لا يتغير"],a:0,why:"حجم السائل المزاح ثابت، فتقل المسافة بنسبة المساحتين."}],
  ref:"الموضوع: مبادئ الهيدروليك (Hydraulic Systems)."
});
/* ---- 2 ---- */
LK("asy",{
  ar:"المشغّل الهيدروليكي: القوة والسرعة", en:"Hydraulic actuator force and speed",
  alt:"أسطوانة مشغّل بمكبس وساق تتحرك بسرعة تتناسب مع التدفق، وخطان لقوة الدفع والسحب مع الضغط",
  intro:["الأسطوانة تحوّل ضغط السائل إلى قوة، وتحوّل تدفقه إلى سرعة. قوة الدفع F = p·A، وسرعة الحركة v = Q/A. المساحة الأكبر تعطي قوة أكبر لكنها تحتاج تدفقاً أكبر لتتحرك بالسرعة نفسها.",
         "عند السحب تنقص المساحة الفعالة بمساحة الساق، فتكون قوة السحب أقل من قوة الدفع، وتكون السرعة أعلى لنفس التدفق. لهذا تُصمَّم أحمال الطائرة (جهاز الهبوط، القلابات) مع مراعاة اتجاه الحركة."],
  ctl:[{k:"D",ar:"قطر المكبس",min:30,max:160,step:1,v:80,f:v=>nf(v,0)+" mm"},{k:"d",ar:"قطر الساق",min:15,max:70,step:1,v:40,f:v=>nf(v,0)+" mm"},{k:"p",ar:"ضغط النظام",min:100,max:350,step:5,v:207,f:v=>nf(v,0)+" bar"},{k:"Q",ar:"التدفق",min:5,max:100,step:1,v:30,f:v=>nf(v,0)+" L/min"}],
  pre:[{ar:"3000 psi",set:{p:207}},{ar:"5000 psi",set:{p:345}}],
  calc(st){ st.d=Math.min(st.d,st.D*0.9); const A=Math.PI/4*(st.D*1e-3)**2, Ar=Math.PI/4*(st.d*1e-3)**2, p=st.p*1e5, Q=st.Q/60000; st.Fe=p*A; st.Fr=p*(A-Ar); st.ve=Q/A; st.vr=Q/(A-Ar); st.P=p*Q; },
  scene(g,r,st,C){ const cy=r.y+r.h*0.45, x0=r.x+r.w*0.08, L=r.w*0.5, ph=(st.t*0.35)%2, f=ph<1?ph:2-ph, hh=r.h*0.2, rod=hh*st.d/Math.max(st.D,1)*0.9;
    g.fillStyle=mixC(C.panel,C.hyd,0.3); g.fillRect(x0,cy-hh/2,L,hh); g.strokeStyle=C.ink; g.lineWidth=1.3; g.strokeRect(x0,cy-hh/2,L,hh);
    const px=x0+L*(0.1+0.8*f); g.fillStyle=mixC(C.panel,C.struct,0.8); g.fillRect(px-4,cy-hh/2+1,8,hh-2); g.strokeRect(px-4,cy-hh/2+1,8,hh-2);
    g.fillStyle=mixC(C.panel,C.struct,0.6); g.fillRect(px,cy-rod/2,x0+L+r.w*0.3-px,rod); g.strokeRect(px,cy-rod/2,x0+L+r.w*0.3-px,rod);
    const dir=ph<1?1:-1, F=ph<1?st.Fe:st.Fr; larrow(g,x0+L+r.w*0.3,cy-hh*0.9,x0+L+r.w*0.3+dir*Math.min(60,10+Math.log10(F)*8),cy-hh*0.9,C.power,2.6,9);
    ltx(g,(ph<1?"دفع: ":"سحب: ")+nf(F/1000,1)+" kN  ·  "+nf((ph<1?st.ve:st.vr)*1000,0)+" mm/s",r.x+r.w*0.5,r.y+r.h*0.14,{s:12,w:600,rtl:true,c:C.power});
    ltx(g,"p = "+nf(st.p,0)+" bar",x0+L*0.5,cy+hh*0.9,{s:11,m:true,c:C.hyd}); },
  plot(st){ const A=Math.PI/4*(st.D*1e-3)**2, Ar=Math.PI/4*(st.d*1e-3)**2, mx=A*350e5/1000*1.05; return {x:[100,350],y:[0,mx],xl:"الضغط bar",yl:"القوة kN",curves:[{f:x=>A*x*1e5/1000,c:"power"},{f:x=>(A-Ar)*x*1e5/1000,c:"hyd",dash:[5,4]}],leg:[{c:"power",t:"دفع"},{c:"hyd",t:"سحب",dash:[5,4]}],dots:[{x:st.p,y:st.Fe/1000,c:"power"},{x:st.p,y:st.Fr/1000,c:"hyd"}]}; },
  ro(st){ return [["قوة الدفع",nf(st.Fe/1000,1)+" kN"],["قوة السحب",nf(st.Fr/1000,1)+" kN"],["سرعة الدفع",nf(st.ve*1000,0)+" mm/s"],["سرعة السحب",nf(st.vr*1000,0)+" mm/s"],["القدرة الهيدروليكية p·Q",nf(st.P/1000,1)+" kW"]]; },
  eq:["F = p · A","v = Q / A","A_سحب = A_مكبس − A_ساق","P = p · Q"],
  note:["القدرة هي القوة × السرعة = p·Q، ولا تتغير بين الدفع والسحب. ما يتغير هو التقسيم بين القوة والسرعة.","الضغط الأعلى يعطي قوة أكبر من أسطوانة أصغر، وهذا سبب انتقال الطائرات الحديثة إلى 5000 psi."],
  quiz:[{q:"لماذا قوة السحب أقل من قوة الدفع عند نفس الضغط؟",o:["لأن الساق تشغل جزءاً من مساحة المكبس","لأن الضغط ينخفض","لأن الاحتكاك أكبر"],a:0,why:"المساحة الفعالة عند السحب A − A_ساق."},
        {q:"ماذا يحدث للسرعة إذا زاد التدفق وبقيت الأسطوانة نفسها؟",o:["تزداد","تقل","لا تتغير"],a:0,why:"v = Q/A."}],
  show:{ar:"اعرض مشغّل رفع جهاز الهبوط",fn:()=>lrnSel("gear_actuator")},
  ref:"الموضوع: المشغّلات الهيدروليكية الخطية (Linear Actuators)."
});
/* ---- 3 ---- */
LK("asy",{
  ar:"المراكم: مخزن الضغط بغاز النيتروجين", en:"The hydraulic accumulator",
  alt:"وعاء بجدار مرن يفصل غاز النيتروجين عن السائل، ومنحنى الضغط مع حجم الغاز مع نطاق الضغط العامل",
  intro:["المراكم وعاء نصفه غاز نيتروجين مضغوط ونصفه سائل. حين ينخفض ضغط النظام فجأة يدفع الغاز السائل إلى المشغّلات، فيسد الفرق ويخفف الصدمات ويحمي المضخة من التذبذب.",
         "الغاز يتبع قانون p·Vᵏ = ثابت. التفريغ البطيء قريب من ثبات الحرارة (k ≈ 1)، والتفريغ السريع أقرب لانعدام تبادل الحرارة (k ≈ 1.4) فيعطي سائلاً أقل. الضغط المسبق في الغاز يجب أن يبقى أقل من أدنى ضغط عامل، وإلا لم يعد يعطي شيئاً."],
  ctl:[{k:"V0",ar:"حجم الوعاء",min:0.5,max:10,step:0.1,v:3,f:v=>nf(v,1)+" L"},{k:"p0",ar:"الضغط المسبق للغاز",min:40,max:200,step:5,v:100,f:v=>nf(v,0)+" bar"},{k:"pmin",ar:"أدنى ضغط عامل",min:110,max:250,step:5,v:150,f:v=>nf(v,0)+" bar"},{k:"pmax",ar:"أعلى ضغط عامل",min:160,max:350,step:5,v:207,f:v=>nf(v,0)+" bar"}],
  tog:[{k:"fast",ar:"تفريغ سريع (k = 1.4)",v:false}],
  calc(st){ st.k=st.fast?1.4:1; const p0=st.p0, pmin=Math.max(st.pmin,p0+5), pmax=Math.max(st.pmax,pmin+5); st.pn=pmin; st.px=pmax; st.vg=p=>st.V0*Math.pow(p0/p,1/st.k);
    st.dV=st.vg(pmin)-st.vg(pmax); st.ratio=st.dV/st.V0; st.ok=st.p0<st.pmin; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, w=r.w*0.34, top=r.y+r.h*0.12, h=r.h*0.72, ph=(Math.sin(st.t*1.2)+1)/2, p=st.px+(st.pn-st.px)*ph, gv=clamp(st.vg(p)/st.V0,0.05,1), yg=top+h*(1-gv);
    g.fillStyle=mixC(C.panel,C.hyd,0.35); g.fillRect(cx-w/2,top,w,h); g.fillStyle=mixC(C.panel,C.ctrl,0.35); g.fillRect(cx-w/2,top,w,yg-top);
    g.strokeStyle=C.ink; g.lineWidth=1.4; g.beginPath(); g.ellipse(cx,top,w/2,10,0,Math.PI,0); g.lineTo(cx+w/2,top+h); g.lineTo(cx-w/2,top+h); g.closePath(); g.stroke();
    lline(g,[[cx-w/2,yg],[cx+w/2,yg]],C.ink,2); ltx(g,"غاز N₂",cx,(top+yg)/2+4,{s:12,w:600,rtl:true}); ltx(g,"سائل",cx,(yg+top+h)/2,{s:12,w:600,rtl:true});
    lline(g,[[cx,top+h],[cx,top+h+18]],C.hyd,5); ltx(g,"p = "+nf(p,0)+" bar",cx,r.y+8,{s:12,w:600,m:true,c:C.hyd}); },
  plot(st){ const V=st.V0; return {x:[0,V],y:[0,360],xl:"حجم الغاز L",yl:"الضغط bar",curves:[{f:v=>st.p0*Math.pow(V/v,st.k),c:"ctrl",x:[V*0.08,V]}],hband:[{y0:st.pn,y1:st.px,c:"hyd",a:0.18}],hl:[{y:st.p0,c:"muted",t:"الشحن المسبق"}],dots:[{x:st.vg(st.px),y:st.px,c:"power"},{x:st.vg(st.pn),y:st.pn,c:"gear"}]}; },
  ro(st){ return [["سائل مفيد عند التفريغ",nf(st.dV,2)+" L"],["نسبة من حجم الوعاء",nf(st.ratio*100,0)+" %"],["حجم الغاز عند أعلى ضغط",nf(st.vg(st.px),2)+" L"],["حجم الغاز عند أدنى ضغط",nf(st.vg(st.pn),2)+" L"],["الحالة",st.ok?"الشحن المسبق مناسب":"الشحن المسبق عالٍ: المراكم لا يعمل"]]; },
  eq:["p₀ V₀ᵏ = p V ᵏ","V(p) = V₀ (p₀/p)^(1/k)","ΔV = V(p_min) − V(p_max)"],
  note:["الشحن المسبق يُفحص والمراكم فارغ من السائل؛ التسرب البطيء للنيتروجين يقلل السائل المفيد تدريجياً.","اختيار الشحن المسبق قريباً من 0.6–0.9 من أدنى ضغط عامل يعطي أكبر سائل مفيد عملياً."],
  quiz:[{q:"أي التفريغين يعطي سائلاً أكثر؟",o:["البطيء (k قريب من 1)","السريع (k = 1.4)","متساويان"],a:0,why:"في التفريغ السريع يبرد الغاز ويفقد جزءاً من الضغط فيدفع سائلاً أقل."},
        {q:"إذا ارتفع الشحن المسبق فوق أدنى ضغط عامل:",o:["يتوقف المراكم عن تزويد السائل في نطاق العمل","يزداد السائل المفيد","لا يتأثر"],a:0,why:"الغاز لا يتمدد حين يكون الضغط الخارجي أعلى من شحنه."}],
  show:{ar:"اعرض المراكم",fn:()=>lrnSel("hyd_accumulator")},
  ref:"الموضوع: مراكمات الهيدروليك وتذبذب الضغط (Accumulators)."
});
/* ---- 4 ---- */
LK("asy",{
  ar:"فقد الضغط في الأنابيب", en:"Pressure drop in hydraulic lines",
  alt:"أنبوب يمر فيه سائل مع تدرّج لون يدل على هبوط الضغط، ومنحنى هبوط الضغط مع قطر الأنبوب",
  intro:["السائل الذي يجري في الأنبوب يفقد جزءاً من ضغطه بالاحتكاك، ويتحول ذلك الفقد إلى حرارة. فقد الضغط يتناسب مع الطول وطرديّاً تقريباً مع مربع السرعة، فيزداد بشدة حين يضيق الأنبوب.",
         "المعيار هو رقم رينولدز Re = v·D/ν. أقل من نحو 2300 يكون الجريان طبقياً وعامل الاحتكاك 64/Re، وأعلى من نحو 4000 يصبح مضطرباً. تُحدَّد أقطار خطوط الضغط عادة لإبقاء السرعة تحت نحو 5–7 m/s."],
  ctl:[{k:"D",ar:"القطر الداخلي",min:6,max:25,step:0.5,v:12,f:v=>nf(v,1)+" mm"},{k:"Q",ar:"التدفق",min:5,max:60,step:1,v:25,f:v=>nf(v,0)+" L/min"},{k:"Lm",ar:"طول الخط",min:1,max:60,step:1,v:20,f:v=>nf(v,0)+" m"},{k:"nu",ar:"اللزوجة الحركية",min:5,max:30,step:1,v:12,f:v=>nf(v,0)+" cSt"}],
  calc(st){ const D=st.D*1e-3, Q=st.Q/60000, nu=st.nu*1e-6, v=Q/(Math.PI/4*D*D), Re=v*D/nu; st.v=v; st.Re=Re; st.fr=(Re<2300?64/Re:Re>4000?0.316/Math.pow(Re,0.25):64/2300+(0.316/Math.pow(4000,0.25)-64/2300)*(Re-2300)/1700);
    st.dp=st.fr*(st.Lm/D)*1000*v*v/2; st.heat=st.dp*Q; st.dpf=d=>{ const Dd=d*1e-3, vv=Q/(Math.PI/4*Dd*Dd), R=vv*Dd/nu, f=R<2300?64/R:R>4000?0.316/Math.pow(R,0.25):64/2300+(0.316/Math.pow(4000,0.25)-64/2300)*(R-2300)/1700; return f*(st.Lm/Dd)*1000*vv*vv/2/1e5; }; },
  scene(g,r,st,C){ const y=r.y+r.h*0.45, x0=r.x+r.w*0.06, x1=r.x+r.w*0.94, hh=Math.max(10,Math.min(r.h*0.3,st.D*2.2)); const loss=clamp(st.dp/2.5e7,0,0.95);
    for(let i=0;i<40;i++){ const f=i/40, xa=x0+(x1-x0)*f; g.fillStyle=mixC(C.panel,C.hyd,0.9*(1-f*loss)); g.fillRect(xa,y-hh/2,(x1-x0)/40+1,hh); }
    g.strokeStyle=C.ink; g.lineWidth=1.4; g.strokeRect(x0,y-hh/2,x1-x0,hh);
    const n=Math.round(14+st.v*3); for(let i=0;i<n;i++){ const f=(st.t*0.05*st.v+i/n)%1, yy=y+(((i*37)%11)/11-0.5)*hh*0.8; ldot(g,x0+(x1-x0)*f,yy,2,C.ink,0.7); }
    ltx(g,"p₁",x0,y+hh/2+16,{s:12,m:true}); ltx(g,"p₂ = p₁ − "+nf(st.dp/1e5,1)+" bar",x1-4,y+hh/2+16,{s:12,m:true,a:"right",c:C.power});
    ltx(g,"v = "+nf(st.v,1)+" m/s · Re = "+nf(st.Re,0),(x0+x1)/2,r.y+r.h*0.12,{s:12,w:600,m:true,c:st.v>7?C.power:C.ink}); },
  plot(st){ return {x:[6,25],y:[0.01,300],log:true,xl:"القطر mm",yl:"الفقد bar",curves:[{f:st.dpf,c:"hyd"}],hl:[{y:20,c:"power",t:"فقد كبير"}],dots:[{x:st.D,y:Math.max(0.011,st.dp/1e5),c:"power"}]}; },
  ro(st){ return [["السرعة",nf(st.v,1)+" m/s"],["رقم رينولدز",nf(st.Re,0)],["نوع الجريان",st.Re<2300?"طبقي":st.Re>4000?"مضطرب":"انتقالي"],["هبوط الضغط",nf(st.dp/1e5,2)+" bar"],["القدرة الضائعة حرارة",nf(st.heat,0)+" W"]]; },
  eq:["Re = v D / ν","Δp = f (L/D) (ρ v²/2)","f = 64/Re (طبقي) ،  f ≈ 0.316 Re^−0.25 (مضطرب ناعم)"],
  note:["تقليل القطر إلى النصف يزيد الفقد نحو ‏16 ضعفاً في الجريان الطبقي، ونحو ‏27 ضعفاً في المضطرب بنفس التدفق.","الحرارة الناتجة تُسحب بمبرّد السائل؛ لذلك يلاحظ الفنيون أن الخطوط الطويلة الضيقة تُسخّن السائل."],
  quiz:[{q:"ماذا يحدث لفقد الضغط إذا ضاق الأنبوب مع بقاء التدفق ثابتاً؟",o:["يزداد بسرعة كبيرة","يقل","لا يتغير"],a:0,why:"السرعة تزداد مع تقلص المساحة، والفقد يعتمد على v² وعلى 1/D."},
        {q:"أي رقم رينولدز يدل على جريان طبقي؟",o:["1500","8000","50000"],a:0,why:"الجريان طبقي تحت نحو 2300."}],
  ref:"الموضوع: ميكانيكا الموائع في الأنابيب (Pipe Flow)."
});
/* ---- 5 ---- */
LK("asy",{
  ar:"ضغط النظام: 3000 أم 5000 psi؟", en:"System pressure level and weight",
  alt:"منحنى كتلة الأنابيب والسائل مع ضغط النظام لنفس القدرة، مع خطين عند 3000 و5000 psi",
  intro:["لنقل القدرة نفسها بتدفق أقل نرفع الضغط، لأن القدرة P = p·Q. تدفق أقل يعني أنابيب أنحف وسائلاً أقل وخزاناً أصغر. لهذا اعتمدت الطائرة الكبيرة الحديثة 5000 psi بينما بقيت طائرات كثيرة عند 3000 psi.",
         "لكن الجدار يجب أن يتحمل ضغطاً أعلى، فيزداد سمكه (t ≈ p·D/2σ)، وتصير الأختام والمضخات أدق وأغلى. المحصلة أن الكتلة الكلية تقل بارتفاع الضغط حتى حد، ثم يتباطأ التحسن."],
  ctl:[{k:"P",ar:"القدرة المنقولة",min:5,max:150,step:5,v:50,f:v=>nf(v,0)+" kW"},{k:"p",ar:"ضغط النظام",min:150,max:400,step:5,v:207,f:v=>nf(v,0)+" bar"},{k:"vm",ar:"السرعة المسموحة",min:3,max:8,step:0.5,v:5,f:v=>nf(v,1)+" m/s"},{k:"Ld",ar:"طول الخطوط الكلي",min:100,max:600,step:10,v:300,f:v=>nf(v,0)+" m"}],
  pre:[{ar:"3000 psi",set:{p:207}},{ar:"5000 psi",set:{p:345}}],
  calc(st){ const mass=p=>{ const Q=st.P*1e3/(p*1e5), D=Math.sqrt(4*Q/(Math.PI*st.vm)), t=Math.max(0.0005,p*1e5*D/(2*300e6)), mt=Math.PI*D*t*4500, mf=Math.PI/4*D*D*1000; return {Q,D,t,mt,mf,m:(mt+mf)*st.Ld}; }; st.f=mass; const o=mass(st.p); Object.assign(st,{Q:o.Q*60000,Dd:o.D*1000,t:o.t*1000,mt:o.mt*st.Ld,mf:o.mf*st.Ld,mtot:o.m}); st.m3=mass(207).m; st.m5=mass(345).m; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, y=r.y+r.h*0.46, Dd=clamp(st.Dd*4.4,20,r.h*0.4), wall=clamp(st.t*12,3,Dd*0.4);
    g.fillStyle=mixC(C.panel,C.struct,0.8); g.beginPath(); g.arc(cx,y,Dd/2+wall,0,Math.PI*2); g.fill(); g.strokeStyle=C.ink; g.lineWidth=1.2; g.stroke();
    g.fillStyle=mixC(C.panel,C.hyd,0.55); g.beginPath(); g.arc(cx,y,Dd/2,0,Math.PI*2); g.fill(); g.stroke();
    ltx(g,"D = "+nf(st.Dd,1)+" mm",cx,y+Dd/2+wall+18,{s:12,m:true}); ltx(g,"جدار "+nf(st.t,2)+" mm",cx,y+Dd/2+wall+34,{s:12,rtl:true,c:C.muted});
    ltx(g,"Q = "+nf(st.Q,0)+" L/min",cx,r.y+r.h*0.1,{s:12,w:600,m:true,c:C.hyd}); ltx(g,"كتلة الخطوط ≈ "+nf(st.mtot,0)+" kg",cx,r.y+r.h*0.9,{s:13,w:600,rtl:true,c:C.power}); },
  plot(st){ const hi=st.f(150).m*1.05; return {x:[150,400],y:[0,hi],xl:"الضغط bar",yl:"كتلة الخطوط kg",curves:[{f:p=>st.f(p).m,c:"hyd"}],vl:[{x:207,c:"muted",t:"3000 psi"},{x:345,c:"muted",t:"5000 psi"}],dots:[{x:st.p,y:st.mtot,c:"power"}]}; },
  ro(st){ return [["التدفق المطلوب",nf(st.Q,0)+" L/min"],["قطر الأنبوب",nf(st.Dd,1)+" mm"],["سمك الجدار",nf(st.t,2)+" mm"],["كتلة المعدن + السائل",nf(st.mt,0)+" + "+nf(st.mf,0)+" kg"],["توفير 5000 مقابل 3000 psi",nf(st.m3-st.m5,0)+" kg"]]; },
  eq:["Q = P / p","D = √(4Q / π v)","t = p D / (2 σ)   (حد أدنى للسمك)","الكتلة = L (π D t ρₘ + π D² ρₛ / 4)"],
  note:["الأرقام مبسطة: σ = 300 MPa تقريباً مع هامش أمان، وسرعة محددة وسائل كثافته 1000 kg/m³. الغرض فهم الاتجاه لا حساب نظام حقيقي.","التوفير الفعلي في الطائرة أصغر لأن المضخات والمشغّلات وخزان السائل تتأثر أيضاً، لكنه يبقى أحد أسباب اختيار الضغط الأعلى."],
  quiz:[{q:"لماذا يقل التدفق المطلوب عند رفع ضغط النظام؟",o:["لأن القدرة تساوي الضغط × التدفق","لأن السائل يصبح أخف","لأن الأنابيب أطول"],a:0,why:"لنقل P ثابتة، رفع p يعني تدفقاً Q أقل."},
        {q:"ماذا يزيد عند رفع الضغط؟",o:["سمك جدار الأنبوب","قطر الأنبوب","طول الخطوط"],a:0,why:"السمك يتناسب مع p·D."}],
  ref:"الموضوع: اختيار مستوى الضغط في النظام الهيدروليكي."
});
/* ---- 6 ---- */
LK("asy",{
  ar:"سعة المضخة وطلب الأنظمة", en:"Pump capacity versus demand",
  alt:"مضخة يديرها صندوق تروس المحرك ومنحنى تدفقها مع سرعة المحرك مقابل خط الطلب",
  intro:["مضخة المحرك (EDP) تدور بصندوق تروس يتبع سرعة المحرك، وتدفقها الأقصى Q = D·N·η_v. عند الدوران البطيء، مثل الهبوط بقوة دفع منخفضة، قد لا يكفي التدفق لتشغيل كل المشغّلات معاً.",
         "حين يزيد الطلب عن السعة ينخفض الضغط ما لم يتدخل المراكم أو مضخة كهربائية أو وحدة نقل القدرة. لذلك يحدد المصممون الطلب الأعلى المحتمل (مثل مد العجلات والقلابات) ويتأكدون أن النظام يغطيه في أبطأ سرعة محرك متوقعة."],
  ctl:[{k:"Dp",ar:"إزاحة المضخة",min:20,max:80,step:1,v:40,f:v=>nf(v,0)+" cc/rev"},{k:"N",ar:"دوران صندوق التروس",min:2000,max:7000,step:100,v:3500,f:v=>nf(v,0)+" rpm"},{k:"ev",ar:"الكفاءة الحجمية",min:0.85,max:0.97,step:0.01,v:0.92,f:v=>nf(v*100,0)+" %"},{k:"dem",ar:"طلب الأنظمة",min:10,max:150,step:1,v:80,f:v=>nf(v,0)+" L/min"}],
  pre:[{ar:"محرك على الدوران البطيء",set:{N:2200,dem:80}},{ar:"قدرة الإقلاع",set:{N:6500,dem:80}}],
  calc(st){ st.cap=st.Dp*st.N*st.ev/1000; st.def=Math.max(0,st.dem-st.cap); st.acc=2; st.tac=st.def>0?st.acc*60/st.def:Infinity; st.mrg=st.cap-st.dem; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.3, cy=r.y+r.h*0.45, R=Math.min(r.w*0.2,r.h*0.28), a=st.t*st.N/700;
    g.fillStyle=mixC(C.panel,C.struct,0.6); g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.fill(); g.strokeStyle=C.ink; g.lineWidth=1.3; g.stroke();
    for(let i=0;i<7;i++){ const an=a+i*Math.PI*2/7; ldot(g,cx+Math.cos(an)*R*0.6,cy+Math.sin(an)*R*0.6,R*0.12,C.hyd); }
    ltx(g,"مضخة",cx,cy+R+16,{s:12,rtl:true}); ltx(g,nf(st.N,0)+" rpm",cx,cy,{s:11,m:true});
    const bx=r.x+r.w*0.62, bw=r.w*0.12, bh=r.h*0.62, by=r.y+r.h*0.14, mx=Math.max(st.cap,st.dem,10)*1.15;
    g.strokeStyle=C.ink; g.strokeRect(bx,by,bw,bh); g.fillStyle=mixC(C.panel,C.hyd,0.6); const hc=bh*st.cap/mx; g.fillRect(bx,by+bh-hc,bw,hc);
    const yd=by+bh-bh*st.dem/mx; lline(g,[[bx-8,yd],[bx+bw+8,yd]],C.power,2.4); ltx(g,"الطلب "+nf(st.dem,0),bx+bw+10,yd,{s:11,a:"left",rtl:true,c:C.power}); ltx(g,"السعة "+nf(st.cap,0),bx+bw/2,by+bh+16,{s:11,rtl:true,c:C.hyd});
    lline(g,[[cx+R,cy],[bx,cy]],C.hyd,4); },
  plot(st){ return {x:[2000,7000],y:[0,Math.max(60,st.Dp*7000*st.ev/1000*1.05)],xl:"دوران صندوق التروس rpm",yl:"التدفق L/min",curves:[{f:n=>st.Dp*n*st.ev/1000,c:"hyd"}],hl:[{y:st.dem,c:"power",t:"الطلب"}],dots:[{x:st.N,y:st.cap,c:"hyd"}]}; },
  ro(st){ return [["سعة المضخة",nf(st.cap,1)+" L/min"],["الطلب",nf(st.dem,0)+" L/min"],[st.mrg>=0?"فائض":"عجز",nf(Math.abs(st.mrg),1)+" L/min"],["مدة تغطية مراكم 2 L للعجز",isFinite(st.tac)?nf(st.tac,1)+" s":"لا حاجة"]]; },
  eq:["Q = D · N · η_v","العجز = الطلب − Q","مدة التغطية = ΔV_مراكم / العجز"],
  note:["مضخات الطائرات الحقيقية متغيرة الإزاحة وتقلل إزاحتها تلقائياً حين يقل الطلب، فلا تضيع طاقة بلا فائدة.","وجود مضخات كهربائية وPTU يعني أن النظام يبقى عاملاً حتى مع محرك واحد أو على الأرض."],
  quiz:[{q:"متى تكون سعة مضخة المحرك أقل؟",o:["عند دوران المحرك البطيء","عند الإقلاع","عند الرحلة المستوية فقط"],a:0,why:"Q تتناسب مع N."},
        {q:"ما دور المراكم عند العجز اللحظي؟",o:["يزوّد سائلاً مضغوطاً لسد الفرق","يرفع دوران المحرك","يخفض الطلب"],a:0,why:"يخزن سائلاً مضغوطاً ويطلقه عند هبوط الضغط."}],
  show:{ar:"اعرض مضخة المحرك",fn:()=>lrnSel("hyd_edp")},
  ref:"الموضوع: مضخات الهيدروليك متغيرة الإزاحة (Variable Displacement Pumps)."
});
/* ---- 7 ---- */
function aySimStrut(st){ const m=st.m, mg=m*G0, s=st.sm, f0=st.f0*mg, n=1.3, ko=st.ko, dt=0.0005; let x=0, v=st.v, E=0, Fm=0, xm=0; const F=(x,v)=>f0*Math.pow(1/Math.max(0.02,1-x/(1.1*s)),n)+ko*mg*Math.pow(v/3.05,2), tr=[[0,0,F(0,st.v)]];
  for(let i=0;i<9000&&v>0;i++){ const f=F(x,v); v-=f/m*dt; x+=v*dt; E+=f*v*dt; if(f>Fm) Fm=f; xm=Math.max(xm,x); if(i%10===0) tr.push([i*dt,x,f]); if(x>=s) break; }
  st.bot=xm>=s*0.999; st.xm=xm; st.Fm=Fm; st.ng=Fm/mg; st.eta=st.bot?0:0.5*m*st.v*st.v/Math.max(1,Fm*xm); st.tr=tr; st.Fg=x=>f0*Math.pow(1/Math.max(0.02,1-x/(1.1*s)),n); st.Tend=tr[tr.length-1][0]; }
LK("asy",{
  ar:"الماصّ الزيتي: امتصاص صدمة الهبوط", en:"Oleo-pneumatic shock strut",
  alt:"ساق جهاز هبوط تنضغط عند اللمس مع منحنى القوة مع الشوط يظهر مكوّن الغاز ومكوّن التخميد",
  intro:["عند الهبوط يجب أن تمتص الساق طاقة حركة الهبوط الرأسية ½·m·v² دون أن تتجاوز القوة حدّ الهيكل. الساق الزيتية تجمع نابضاً غازياً (نيتروجين) يزداد ضغطه مع الانضغاط، ومخمداً زيتياً يمر عبر فتحة ضيقة فتتناسب قوته مع مربع السرعة.",
         "الحالة المثالية قوة ثابتة على كامل الشوط، لأنها تمتص الطاقة بأقل قوة قصوى. الفتحة الصغيرة تعطي ذروة قوة عند اللمس، والكبيرة تنفخ الشوط وتترك الغاز يتحمل الحمل في نهايته. إذا انتهى الشوط قبل ضياع الطاقة تحدث 'ارتطام قاع' وتقفز القوة."],
  ctl:[{k:"m",ar:"الكتلة على الساق",min:10000,max:80000,step:1000,v:20000,f:v=>nf(v/1000,0)+" t"},{k:"v",ar:"معدل الهبوط الرأسي",min:0.5,max:3.7,step:0.05,v:2,f:v=>nf(v,2)+" m/s"},{k:"sm",ar:"شوط الساق",min:0.25,max:0.9,step:0.01,v:0.55,f:v=>nf(v,2)+" m"},{k:"f0",ar:"شحن الغاز (من الوزن)",min:0.1,max:0.9,step:0.01,v:0.4,f:v=>nf(v,2)},{k:"ko",ar:"مخمّد الفتحة",min:0.1,max:4,step:0.05,v:1,f:v=>nf(v,2)+" ×"}],
  pre:[{ar:"هبوط عادي",set:{v:1.2}},{ar:"هبوط شديد",set:{v:3.05}},{ar:"مخمّد ضعيف",set:{ko:0.2}}],
  calc(st){ aySimStrut(st); },
  scene(g,r,st,C){ const T=st.Tend+0.35, ph=((st.t/9)%T), idx=Math.min(st.tr.length-1,Math.floor(ph/(st.Tend/Math.max(1,st.tr.length-1)))), x=ph>st.Tend?st.tr[st.tr.length-1][1]*Math.max(0,1-(ph-st.Tend)/0.35):st.tr[idx][1];
    const cx=r.x+r.w*0.5, gy=r.y+r.h*0.9, R=r.h*0.1, sc=r.h*0.3/st.sm, wy=gy-R, hing=wy-r.h*0.5, top=hing+x*sc;
    g.fillStyle=mixC(C.panel,C.struct,0.35); g.fillRect(r.x+r.w*0.1,gy,r.w*0.8,3); g.beginPath(); g.arc(cx,wy,R,0,Math.PI*2); g.fillStyle=mixC(C.panel,C.ink,0.55); g.fill(); g.strokeStyle=C.ink; g.stroke();
    g.fillStyle=mixC(C.panel,C.struct,0.8); g.fillRect(cx-6,wy-r.h*0.2,12,r.h*0.2); g.strokeRect(cx-6,wy-r.h*0.2,12,r.h*0.2);
    const ob=wy-r.h*0.15; g.fillStyle=mixC(C.panel,C.hyd,0.25); g.fillRect(cx-12,top,24,Math.max(8,ob-top)); g.strokeRect(cx-12,top,24,Math.max(8,ob-top));
    const bw=r.w*0.34; g.fillStyle=mixC(C.panel,C.struct,0.45); g.fillRect(cx-bw/2,top-18,bw,16); g.strokeRect(cx-bw/2,top-18,bw,16);
    ltx(g,"الطائرة",cx,top-10,{s:10,rtl:true}); larrow(g,cx+bw/2+16,top-34,cx+bw/2+16,top-8,C.muted,1.6,7);
    ltx(g,st.bot?"ارتطام قاع الشوط!":"أقصى انضغاط "+nf(st.xm*100,0)+" cm",cx,r.y+r.h*0.07,{s:12,w:600,rtl:true,c:st.bot?C.power:C.ink}); },
  plot(st){ const mx=Math.max(st.Fm,st.m*G0*3)/1000*1.05; return {x:[0,st.sm],y:[0,mx],xl:"الانضغاط m",yl:"القوة kN",curves:[{f:x=>st.Fg(x)/1000,c:"ctrl",x:[0,st.sm*0.98]}],lines:[{pts:st.tr.map(q=>[q[1],q[2]/1000]),c:"power",w:2.4}],hl:[{y:st.m*G0/1000,c:"muted",t:"الوزن"}],leg:[{c:"ctrl",t:"الغاز"},{c:"power",t:"الغاز + المخمّد"}]}; },
  ro(st){ return [["أقصى انضغاط",nf(st.xm*100,1)+" cm من "+nf(st.sm*100,0)],["أقصى قوة",nf(st.Fm/1000,0)+" kN"],["عامل الحمل الأقصى",nf(st.ng,2)+" g"],["كفاءة الامتصاص",st.bot?"—":nf(st.eta*100,0)+" %"],["طاقة الهبوط",nf(0.5*st.m*st.v*st.v/1000,1)+" kJ"]]; },
  eq:["E = ½ m v²","F = F_غاز + F_مخمّد","F_غاز ∝ (1 − x/s′)^−n ،  F_مخمّد = k v²","η = E / (F_max · x_max)"],
  note:["النموذج مبسط: الرفع يساوي الوزن أثناء اللمس، والمخمّد يعمل أثناء الانضغاط فقط. الارتداد (recoil) يتحكم به مخمّد منفصل يمنع القفز.","الأحمال المسموحة أثناء الهبوط تحددها الاشتراطات التصميمية للهيكل، فالعبرة بالمقارنة بين الفتحة الكبيرة والصغيرة وليس بالرقم المطلق."],
  quiz:[{q:"لتقليل ذروة القوة على الهيكل مع نفس الطاقة نحتاج:",o:["قوة أقرب لثابتة على كامل الشوط","ذروة قوية في أول الشوط","شوطاً أقصر"],a:0,why:"القوة الثابتة تمتص الطاقة بأقل قوة قصوى."},
        {q:"ما الذي يحدث لو كان شوط الساق أقصر من اللازم؟",o:["ارتطام قاع وقفزة في القوة","قوة أقل","لا شيء"],a:0,why:"ينتهي الانضغاط قبل أن تتبدد الطاقة."}],
  show:{ar:"اعرض الماصّ الزيتي",fn:()=>lrnSel("gear_shock_strut")},
  ref:"الموضوع: ماصّات صدمة جهاز الهبوط (Landing Gear Shock Absorbers)."
});
/* ---- 8 ---- */
LK("asy",{
  ar:"الإطار: بصمة التلامس والضغط", en:"Tyre footprint and inflation pressure",
  alt:"بصمة إطار بيضاوية على الأرض مع مقدار الانحناء، ومنحنى نسبة الانحناء مع ضغط النفخ",
  intro:["الإطار يحمل الطائرة بالهواء المضغوط فيه. مساحة بصمة التلامس تساوي تقريباً الحمل مقسوماً على ضغط النفخ، لأن جدار الإطار يحمل جزءاً صغيراً فقط: A ≈ W / p.",
         "الضغط الأقل من اللازم يزيد انحناء جدار الإطار مع كل دورة، فتتولد حرارة وتتعب الأسلاك. لهذا يُفحص الضغط على الإطار البارد، ويُملأ بالنيتروجين لأنه جاف وأقل تأثراً بالحرارة ولا يغذّي الاحتراق داخل الإطار."],
  ctl:[{k:"W",ar:"الحمل على الإطار",min:40,max:300,step:5,v:200,f:v=>nf(v,0)+" kN"},{k:"p",ar:"ضغط النفخ",min:8,max:20,step:0.2,v:15,f:v=>nf(v,1)+" bar"},{k:"w",ar:"عرض الإطار",min:250,max:600,step:10,v:450,f:v=>nf(v,0)+" mm"}],
  pre:[{ar:"ضغط صحيح",set:{W:200,p:15}},{ar:"ضغط منخفض",set:{W:200,p:11}}],
  calc(st){ st.pc=1.1*st.p*1e5; st.A=st.W*1000/st.pc; st.l=4*st.A/(Math.PI*st.w*1e-3); st.defl=2.4*st.W/st.p; st.sg=st.pc/1e6; st.df=p=>2.4*st.W/p; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.46, wp=Math.min(r.w*0.7,st.w*0.38), lp=wp*(st.l*1000)/st.w;
    g.fillStyle=mixC(C.panel,C.struct,0.15); g.fillRect(r.x+r.w*0.06,r.y+r.h*0.1,r.w*0.88,r.h*0.62);
    g.fillStyle=mixC(C.panel,st.defl>35?C.power:C.hyd,0.55); g.beginPath(); g.ellipse(cx,cy,wp/2,Math.min(lp/2,r.h*0.28),0,0,Math.PI*2); g.fill(); g.strokeStyle=C.ink; g.lineWidth=1.4; g.stroke();
    ltx(g,"A = "+nf(st.A*1e4,0)+" cm²",cx,cy,{s:12,w:600,m:true}); ltx(g,nf(st.w,0)+" mm",cx,cy-Math.min(lp/2,r.h*0.28)-12,{s:11,m:true,c:C.muted});
    kBar(g,r.x+r.w*0.1,r.y+r.h*0.84,r.w*0.8,10,st.defl/50,st.defl>35?"power":"hyd",C,"انحناء الجدار "+nf(st.defl,0)+" %"); },
  plot(st){ return {x:[8,20],y:[0,60],xl:"ضغط النفخ bar",yl:"الانحناء %",curves:[{f:st.df,c:"hyd"}],hband:[{y0:35,y1:60,c:"power",a:0.14}],hl:[{y:35,c:"power",t:"تعب وحرارة"}],dots:[{x:st.p,y:st.defl,c:"power"}]}; },
  ro(st){ return [["مساحة التلامس",nf(st.A*1e4,0)+" cm²"],["طول البصمة",nf(st.l*1000,0)+" mm"],["إجهاد التلامس",nf(st.sg,2)+" MPa"],["انحناء الجدار التقريبي",nf(st.defl,0)+" %"],["الحالة",st.defl>35?"ضغط منخفض: خطر حرارة":st.defl<22?"ضغط عالٍ: بصمة صغيرة":"ضمن المعتاد"]]; },
  eq:["A ≈ W / (1.1 p)","l = 4A / (π w)","الانحناء ≈ 2.4 W / p  (%)"],
  note:["العامل 1.1 والمعامل 2.4 تقريبيان لتوضيح الاتجاه، وتعتمد القيم الحقيقية على الإطار المعتمد وجدوله.","ضغط الإطار يرتفع بالحرارة بعد الهبوط (قانون غاي لوساك)، فلا يصح ضبطه والإطار ساخن."],
  quiz:[{q:"ماذا يحدث لمساحة البصمة إذا انخفض ضغط النفخ مع بقاء الحمل؟",o:["تزداد","تقل","لا تتغير"],a:0,why:"A ≈ W/p."},
        {q:"لماذا يُنفخ الإطار بالنيتروجين؟",o:["لأنه جاف وأقل تأثراً بالحرارة ولا يغذّي الحريق","لأنه أخف بكثير","لأنه يرفع الضغط"],a:0,why:"الهواء يحمل رطوبة وأكسجيناً."}],
  show:{ar:"اعرض الإطار",fn:()=>lrnSel("wheel_tire")},
  ref:"الموضوع: إطارات الطائرات وضغط النفخ (Aircraft Tyres)."
});
/* ---- 9 ---- */
LK("asy",{
  ar:"تبريد الفرامل بعد الهبوط", en:"Brake heating and cooling",
  alt:"عجلة وفرامل ساخنة تُبرَّد بالهواء أو بمروحة، ومنحنى درجة الحرارة مع الزمن بعد الهبوط مع حد الإقلاع",
  intro:["أثناء الكبح تتحول طاقة الحركة إلى حرارة تمتصها كتلة حزمة الفرامل: ΔT = E_فرامل / (m·c). جزء من الطاقة تأخذه مقاومة الهواء والقاطعات والمعكوس، فتقل حصة الفرامل.",
         "بعد التوقف تبرد الفرامل ببطء أسّي تقريباً: T(t) = T_محيط + ΔT·e^(−t/τ). إن كانت حرارتها مرتفعة عند الإقلاع التالي يرتفع خطر ذوبان سدادة الانصهار أو انفجار الإطار، لذلك تضيف الجداول زمن تبريد أو تُستعمل مراوح التبريد."],
  ctl:[{k:"mt",ar:"كتلة الهبوط",min:40,max:500,step:5,v:65,f:v=>nf(v,0)+" t"},{k:"V",ar:"سرعة اللمس",min:55,max:85,step:1,v:70,f:v=>nf(v,0)+" m/s"},{k:"fb",ar:"حصة الفرامل من الطاقة",min:0.2,max:1,step:0.02,v:0.6,f:v=>nf(v*100,0)+" %"},{k:"mb",ar:"كتلة حزمة الفرامل",min:100,max:800,step:10,v:250,f:v=>nf(v,0)+" kg"},{k:"tau",ar:"ثابت التبريد",min:15,max:90,step:1,v:45,f:v=>nf(v,0)+" min"}],
  tog:[{k:"fan",ar:"مراوح تبريد الفرامل",v:false}],
  pre:[{ar:"737 تقريباً",set:{mt:65,V:70,fb:0.6,mb:250}},{ar:"A380 تقريباً",set:{mt:400,V:68,fb:0.4,mb:480}}],
  calc(st){ st.E=st.fb*0.5*st.mt*1000*st.V*st.V; st.dT=st.E/(st.mb*900); st.Ta=30; st.T0=st.Ta+st.dT; st.tauE=st.tau*(st.fan?0.5:1); st.lim=150; st.tl=st.T0>st.lim?st.tauE*Math.log((st.T0-st.Ta)/(st.lim-st.Ta)):0; st.Tf=t=>st.Ta+st.dT*Math.exp(-t/st.tauE); },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.45, R=Math.min(r.w*0.28,r.h*0.3), tm=(st.t*8)%60, T=st.Tf(tm), f=clamp((T-30)/700,0,1);
    g.fillStyle=mixC(C.panel,C.ink,0.5); g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.fill(); g.strokeStyle=C.ink; g.lineWidth=1.4; g.stroke();
    g.fillStyle=mixC(C.panel,C.power,0.2+0.75*f); g.beginPath(); g.arc(cx,cy,R*0.72,0,Math.PI*2); g.fill(); g.stroke(); g.fillStyle=mixC(C.panel,C.struct,0.7); g.beginPath(); g.arc(cx,cy,R*0.3,0,Math.PI*2); g.fill(); g.stroke();
    if(st.fan) for(let i=0;i<3;i++){ const a=st.t*9+i*2.1; lline(g,[[cx+Math.cos(a)*R*0.1,cy+Math.sin(a)*R*0.1],[cx+Math.cos(a)*R*0.28,cy+Math.sin(a)*R*0.28]],C.hyd,3); }
    ltx(g,nf(T,0)+" °C",cx,cy,{s:13,w:600,m:true}); ltx(g,"بعد "+nf(tm,0)+" دقيقة",cx,cy+R+18,{s:12,rtl:true,c:C.muted}); },
  plot(st){ return {x:[0,60],y:[0,Math.max(300,st.T0*1.05)],xl:"الزمن بعد التوقف min",yl:"°C",curves:[{f:st.Tf,c:"power"}],hl:[{y:st.lim,c:"hyd",t:"حد الإقلاع (افتراضي)"}],dots:[{x:st.tl,y:st.lim,c:"hyd",t:nf(st.tl,0)+" min"}]}; },
  ro(st){ return [["طاقة الفرامل",nf(st.E/1e6,0)+" MJ"],["ارتفاع الحرارة ΔT",nf(st.dT,0)+" °C"],["الذروة المقدّرة",nf(st.T0,0)+" °C"],["زمن النزول إلى 150 °C",st.tl>0?nf(st.tl,0)+" min":"لا انتظار"]]; },
  eq:["E = f_b · ½ m V²","ΔT = E / (m_b c)   ،   c ≈ 900 J/kg·K","T(t) = T_a + ΔT e^(−t/τ)","t = τ ln[(T₀ − T_a)/(T_حد − T_a)]"],
  note:["النموذج أسّي بسيط. في الواقع تصل حرارة العجلة إلى ذروتها بعد 10–15 دقيقة من التوقف لأن الحرارة تنتقل من الحزمة إلى الإطار.","حدود الحرارة وأزمنة الانتظار تأتي من دليل الطائرة المعتمد وليس من هذا النموذج."],
  quiz:[{q:"ماذا يقلل حرارة الفرامل بعد الهبوط؟",o:["استخدام المعكوس والقواطع الهوائية","الكبح المتأخر","زيادة السرعة"],a:0,why:"يأخذان جزءاً من الطاقة فتقل حصة الفرامل."},
        {q:"لماذا تُركَّب سدادة الانصهار في العجلة؟",o:["لتفريغ هواء الإطار بأمان قبل أن ينفجر","لتبريد الإطار","لتقليل الوزن"],a:0,why:"تذوب عند حرارة محددة فتفرّغ الإطار تدريجياً."}],
  show:{ar:"اعرض وحدة الفرامل",fn:()=>lrnSel("wheel_brake")},
  ref:"الموضوع: فرامل الطائرات وإدارة الحرارة (Brake Energy Management)."
});
