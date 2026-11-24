/* ---------- Book 11: Jet Aircraft Systems (2/3): steering, fuel, electrical power ---------- */
/* ---- 10 ---- */
LK("asy",{
  ar:"توجيه العجلة الأمامية ونصف قطر الدوران", en:"Nose wheel steering and turning radius",
  alt:"منظر علوي لطائرة تدور حول مركز لحظي مع أقواس مسار العجلة الأمامية وعجلات الجسم وطرفي الجناح، ومنحنى نصف القطر مع زاوية التوجيه",
  intro:["عند الدوران على الأرض تدور الطائرة حول نقطة تقع على امتداد محور العجلات الرئيسية، تسمى المركز اللحظي. العجلة الأمامية الموجّهة بزاوية δ تحدد موقع هذه النقطة: نصف قطر مسار منتصف العجلات الرئيسية R = L / tan δ، حيث L المسافة بين العجلة الأمامية والرئيسية.",
         "الجناح البعيد يرسم قوساً أكبر بكثير، لأن طرفه يبعد عن المركز بنحو R + b/2 عرضياً وبمسافة طولية عن محور العجلات. لهذا يتحكم الطرف الخارجي بعرض الممر اللازم، وليس الأنف."],
  ctl:[{k:"L",ar:"المسافة بين العجلة الأمامية والرئيسية",min:10,max:35,step:0.1,v:15.6,f:v=>nf(v,1)+" m"},{k:"dl",ar:"زاوية التوجيه",min:5,max:78,step:1,v:45,f:v=>nf(v,0)+"°"},{k:"b",ar:"باع الجناح",min:25,max:80,step:0.5,v:35.8,f:v=>nf(v,1)+" m"},{k:"xw",ar:"طرف الجناح خلف الرئيسية",min:0,max:12,step:0.5,v:3,f:v=>nf(v,1)+" m"}],
  pre:[{ar:"انعطاف حاد",set:{dl:70}},{ar:"انعطاف واسع",set:{dl:20}},{ar:"طائرة كبيرة",set:{L:32,b:79.8,xw:8}}],
  calc(st){ const d=st.dl*D2R; st.Rm=st.L/Math.tan(d); st.Rn=st.L/Math.sin(d); st.Ro=Math.hypot(st.Rm+st.b/2,st.xw); st.Ri=Math.hypot(Math.max(0,st.Rm-st.b/2),st.xw); st.Rf=(dd,sel)=>{ const q=dd*D2R, rm=st.L/Math.tan(q); return sel===0?rm:Math.hypot(rm+st.b/2,st.xw); }; },
  scene(g,r,st,C){ const s=Math.min(r.w,r.h)*0.44/Math.max(st.Ro,st.Rn,10), icx=r.x+r.w*0.5, icy=r.y+r.h*0.54, th=(st.t*0.25)%(Math.PI*1.2);
    g.save(); g.beginPath(); g.rect(r.x,r.y,r.w,r.h); g.clip();
    [[st.Ri,C.muted,"جناح داخلي"],[st.Rm,C.ctrl,"العجلات الرئيسية"],[st.Rn,C.hyd,"العجلة الأمامية"],[st.Ro,C.power,"طرف الجناح الخارجي"]].forEach(([R,c])=>{ g.strokeStyle=c; g.lineWidth=1.3; g.setLineDash([5,4]); g.beginPath(); g.arc(icx,icy,R*s,0,Math.PI*2); g.stroke(); g.setLineDash([]); });
    ldot(g,icx,icy,4,C.ink); ltx(g,"المركز اللحظي",icx,icy+16,{s:10,rtl:true,c:C.muted});
    g.translate(icx,icy); g.rotate(-th); g.translate(st.Rm*s,0);
    const fw=Math.max(8,st.b*s*0.075), nose=(st.L+4)*s, tail=(st.L*0.85+14)*s;
    g.fillStyle=mixC(C.panel,C.struct,0.35); g.strokeStyle=C.ink; g.lineWidth=1.3; g.beginPath(); g.moveTo(-fw/2,tail); g.lineTo(-fw/2,-nose*0.8); g.quadraticCurveTo(0,-nose*1.06,fw/2,-nose*0.8); g.lineTo(fw/2,tail); g.closePath(); g.fill(); g.stroke();
    g.fillStyle=mixC(C.panel,C.struct,0.5); g.beginPath(); g.moveTo(-fw/2,-st.L*s*0.25); g.lineTo(-st.b*s/2,st.xw*s); g.lineTo(-st.b*s/2+fw*0.8,st.xw*s+fw*1.3); g.lineTo(-fw/2,st.xw*s*0.3+fw*3); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(fw/2,-st.L*s*0.25); g.lineTo(st.b*s/2,st.xw*s); g.lineTo(st.b*s/2-fw*0.8,st.xw*s+fw*1.3); g.lineTo(fw/2,st.xw*s*0.3+fw*3); g.closePath(); g.fill(); g.stroke();
    ldot(g,0,0,3,C.ctrl); ldot(g,0,-st.L*s,3.5,C.hyd); lline(g,[[0,-st.L*s],[-Math.sin(st.dl*D2R)*16,-st.L*s-Math.cos(st.dl*D2R)*16]],C.hyd,2.6); g.restore();
    ltx(g,"R = L / tan δ = "+nf(st.Rm,1)+" m",r.x+r.w*0.5,r.y+14,{s:12,w:600,m:true}); },
  plot(st){ return {x:[5,78],y:[5,400],log:true,xl:"زاوية التوجيه °",yl:"نصف القطر m",curves:[{f:d=>st.Rf(d,0),c:"ctrl"},{f:d=>st.Rf(d,1),c:"power"}],leg:[{c:"ctrl",t:"الرئيسية"},{c:"power",t:"طرف الجناح"}],dots:[{x:st.dl,y:st.Rm,c:"ctrl"},{x:st.dl,y:st.Ro,c:"power"}]}; },
  ro(st){ return [["مسار العجلات الرئيسية R",nf(st.Rm,1)+" m"],["مسار العجلة الأمامية",nf(st.Rn,1)+" m"],["الطرف الخارجي",nf(st.Ro,1)+" m"],["الطرف الداخلي",nf(st.Ri,1)+" m"],["قطر دائرة الطرف الخارجي",nf(2*st.Ro,0)+" m"]]; },
  eq:["R = L / tan δ","R_أنف = L / sin δ","R_طرف = √[(R + b/2)² + x_w²]"],
  note:["النموذج يفترض دحرجة بلا انزلاق للعجلات. الانزلاق وزاوية الانحراف الفعلية للإطارات يزيدان نصف القطر قليلاً.","لهذا تُرسم خطوط التوجيه على الأرض بحيث يبقى الأنف على الخط؛ فيتجاوز الذيل والجناح الخارجي المسار حسب الهندسة."],
  quiz:[{q:"عند زيادة زاوية التوجيه، نصف قطر الدوران:",o:["يقل","يزداد","لا يتغير"],a:0,why:"R = L / tan δ يقل مع ازدياد δ."},
        {q:"أي نقطة تتحكم عادة بعرض الممر اللازم للدوران؟",o:["طرف الجناح الخارجي","العجلة الأمامية","منتصف الجسم"],a:0,why:"هو الأبعد عن المركز اللحظي."}],
  show:{ar:"اعرض مشغّل التوجيه",fn:()=>lrnSel("gear_steering")},
  ref:"الموضوع: هندسة الدوران على الأرض (Ground Turning Geometry)."
});
/* ---- 11 ---- */
LK("asy",{
  ar:"كثافة الوقود وكتلته مع الحرارة", en:"Fuel density and temperature",
  alt:"خزان وقود بحجم ثابت ومقياس حرارة، وعمودان للكتلة عند 15 درجة وعند الحرارة الحالية، ومنحنى الكثافة مع الحرارة",
  intro:["الوقود يُسلَّم بالحجم لكن تُحسب الأوزان بالكتلة. كثافته تقل مع ارتفاع الحرارة لأنه يتمدد: ρ(T) = ρ₁₅·[1 − β(T − 15)]، ومعامل التمدد β لوقود الطائرات يقارب 0.0008 لكل درجة.",
         "لذلك يعني ملء الخزان نفسه بالحجم نفسه في صيف حارّ كتلة وقود أقل منها في شتاء بارد. لهذا تقيس مجسّات الخزان كثافة الوقود فعلياً ولا تعتمد على رقم ثابت، ولهذا يُحسب الشحن بالكتلة."],
  ctl:[{k:"V",ar:"حجم الوقود",min:5000,max:300000,step:1000,v:26000,f:v=>nf(v,0)+" L"},{k:"T",ar:"درجة حرارة الوقود",min:-40,max:50,step:1,v:35,f:v=>nf(v,0)+" °C"},{k:"r15",ar:"الكثافة عند 15 °C",min:0.775,max:0.84,step:0.001,v:0.8,f:v=>nf(v,3)+" kg/L"}],
  pre:[{ar:"صيف حار",set:{T:42}},{ar:"شتاء بارد",set:{T:-15}},{ar:"ارتفاع الرحلة",set:{T:-35}}],
  calc(st){ st.b=0.00083; st.rho=T=>st.r15*(1-st.b*(T-15)); st.m=st.V*st.rho(st.T); st.m15=st.V*st.r15; st.dm=st.m-st.m15; st.dV=st.b*(st.T-15)*100; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.1, w=r.w*0.34, y0=r.y+r.h*0.16, h=r.h*0.6, f=clamp(st.V/320000,0.1,1); g.fillStyle=mixC(C.panel,C.fuel,0.45); g.fillRect(x0,y0+h*(1-f),w,h*f); g.strokeStyle=C.ink; g.lineWidth=1.4; g.strokeRect(x0,y0,w,h);
    ltx(g,nf(st.V,0)+" L",x0+w/2,y0+h*(1-f/2),{s:12,w:600,m:true}); const tx=x0+w+22; g.strokeStyle=C.ink; g.strokeRect(tx-4,y0+8,8,h*0.7); const lv=clamp((st.T+40)/90,0,1); g.fillStyle=mixC(C.panel,C.power,0.8); g.fillRect(tx-3,y0+8+h*0.7*(1-lv),6,h*0.7*lv); ldot(g,tx,y0+h*0.7+14,8,C.power); ltx(g,nf(st.T,0)+" °C",tx,y0+h*0.7+34,{s:11,m:true});
    const bx=r.x+r.w*0.62, bw=r.w*0.12, mx=Math.max(st.m,st.m15)*1.1; [[st.m15,"15 °C","muted"],[st.m,"الآن","fuel"]].forEach(([m,t,c],i)=>{ const hh=h*m/mx, x=bx+i*(bw+14); g.fillStyle=mixC(C.panel,KC(c,C),0.7); g.fillRect(x,y0+h-hh,bw,hh); g.strokeRect(x,y0+h-hh,bw,hh); ltx(g,nf(m/1000,1)+" t",x+bw/2,y0+h-hh-10,{s:11,m:true}); ltx(g,t,x+bw/2,y0+h+14,{s:11,rtl:true}); }); },
  plot(st){ return {x:[-40,50],y:[0.74,0.86],xl:"درجة الحرارة °C",yl:"الكثافة kg/L",curves:[{f:st.rho,c:"fuel"}],dots:[{x:st.T,y:st.rho(st.T),c:"power",t:nf(st.rho(st.T),3)}]}; },
  ro(st){ return [["الكثافة الآن",nf(st.rho(st.T),3)+" kg/L"],["كتلة الوقود",nf(st.m/1000,2)+" t"],["كتلته عند 15 °C",nf(st.m15/1000,2)+" t"],["الفرق في الكتلة",nf(st.dm,0)+" kg"],["الفرق %",nf(st.dm/st.m15*100,1)+" %"]]; },
  eq:["ρ(T) = ρ₁₅ [1 − β (T − 15)]","m = V · ρ(T)","β ≈ 0.00083 / °C"],
  note:["معامل التمدد تقريبي. للوقود المحدد يؤخذ من مواصفاته ومن قياس المجسّ المثبّت في الخزان.","في الرحلة الباردة ترتفع الكثافة قليلاً، لكن مدى الطائرة يتحدد بالكتلة وليس بالحجم."],
  quiz:[{q:"إذا ملأنا الخزان بنفس الحجم والوقود أسخن، فالكتلة:",o:["تقل","تزيد","لا تتغير"],a:0,why:"الكثافة تقل مع الحرارة."},
        {q:"لماذا تقيس المجسّات الكثافة؟",o:["لأن الكتلة هي ما يهم الأداء","لتبريد الوقود","لتقليل الحجم"],a:0,why:"الحجم وحده لا يعطي الوزن."}],
  show:{ar:"اعرض مجسّات الوقود",fn:()=>lrnSel("fuel_probes")},
  ref:"الموضوع: خصائص وقود الطائرات (Aviation Fuel Properties)."
});
/* ---- 12 ---- */
LK("asy",{
  ar:"توازن الوقود بين الجناحين", en:"Lateral fuel balance and crossfeed",
  alt:"منظر أمامي لطائرة بخزاني جناحين بمستوى مختلف وسهم تغذية متقاطعة، وخط يبين نزول فرق الوقود مع الزمن",
  intro:["إذا اختلفت كتلة الوقود بين الجناحين، تنشأ عزم لف وانحراف في مركز الثقل عن المحور. تعوّض الطائرة ذلك بالجنيحات (وزيادة السحب)، وتحدد الشركة المصنّعة حداً أقصى للفرق.",
         "نعيد التوازن بفتح صمام التغذية المتقاطعة أو بنقل الوقود، فتنتقل الكتلة من الخزان الأثقل إلى الأخف بمعدل ثابت. ينقص الفرق بمقدار ضعف المعدل في الدقيقة، لأن ما يخرج من جانب يدخل الآخر."],
  ctl:[{k:"mL",ar:"وقود الجناح الأيسر",min:0,max:30000,step:100,v:18000,f:v=>nf(v/1000,1)+" t"},{k:"mR",ar:"وقود الجناح الأيمن",min:0,max:30000,step:100,v:15000,f:v=>nf(v/1000,1)+" t"},{k:"ya",ar:"ذراع مركز الخزان",min:3,max:15,step:0.5,v:9,f:v=>nf(v,1)+" m"},{k:"rt",ar:"معدل النقل",min:100,max:1500,step:50,v:600,f:v=>nf(v,0)+" kg/min"},{k:"lim",ar:"الحد المسموح للفرق",min:300,max:4000,step:100,v:1500,f:v=>nf(v,0)+" kg"}],
  tog:[{k:"xf",ar:"فتح التغذية المتقاطعة",v:true}],
  calc(st){ st.dm=st.mL-st.mR; st.ad=Math.abs(st.dm); st.M=st.dm*G0*st.ya; st.cg=st.dm*st.ya/(st.mL+st.mR+60000); st.tb=st.ad/(2*st.rt); st.over=st.ad>st.lim; st.fm=t=>Math.max(0,st.ad-2*st.rt*t); },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.42, roll=clamp(st.dm/12000,-1,1)*0.06, ws=r.w*0.4; g.save(); g.translate(cx,cy); g.rotate(roll);
    g.fillStyle=mixC(C.panel,C.struct,0.4); g.strokeStyle=C.ink; g.lineWidth=1.3; g.beginPath(); g.ellipse(0,0,r.h*0.09,r.h*0.12,0,0,Math.PI*2); g.fill(); g.stroke();
    [-1,1].forEach(sg=>{ const m=sg<0?st.mL:st.mR, f=clamp(m/30000,0.02,1), x0=sg*r.h*0.09, x1=sg*ws; g.fillStyle=mixC(C.panel,C.struct,0.2); g.beginPath(); g.moveTo(x0,-3); g.lineTo(x1,-12); g.lineTo(x1,6); g.lineTo(x0,8); g.closePath(); g.fill(); g.stroke();
      const tx=Math.min(x0,x1)+Math.abs(x1-x0)*0.12, tw=Math.abs(x1-x0)*0.76; g.fillStyle=mixC(C.panel,C.fuel,0.2); g.fillRect(tx,r.h*0.12,tw,r.h*0.28); g.fillStyle=mixC(C.panel,C.fuel,0.8); g.fillRect(tx,r.h*0.12+r.h*0.28*(1-f),tw,r.h*0.28*f); g.strokeRect(tx,r.h*0.12,tw,r.h*0.28);
      ltx(g,nf(m/1000,1)+" t",tx+tw/2,r.h*0.12+r.h*0.14,{s:12,w:600,m:true}); });
    if(st.xf&&st.ad>1){ const xs=(st.dm>0?-1:1)*ws*0.45; for(let i=0;i<4;i++){ const f=(st.t*0.7+i/4)%1; ldot(g,xs-2*xs*f,r.h*0.46,4,C.fuel); } }
    g.restore(); ltx(g,st.over?"الفرق أكبر من الحد المسموح":"الفرق ضمن الحد",cx,r.y+r.h*0.92,{s:12,w:600,rtl:true,c:st.over?C.power:C.ink}); },
  plot(st){ const T=Math.max(10,st.tb*1.3); return {x:[0,T],y:[0,Math.max(st.ad*1.05,st.lim*1.1,500)],xl:"الزمن min",yl:"فرق الوقود kg",curves:[{f:st.xf?st.fm:()=>st.ad,c:"fuel"}],hl:[{y:st.lim,c:"power",t:"الحد"}],dots:[{x:st.xf?st.tb:0,y:st.xf?0:st.ad,c:"power"}]}; },
  ro(st){ return [["الفرق بين الجناحين",nf(st.dm,0)+" kg"],["عزم اللف الإضافي",nf(st.M/1000,1)+" kN·m"],["انحراف مركز الثقل",nf(st.cg*100,1)+" cm"],["زمن التوازن بالنقل",st.xf?nf(st.tb,1)+" min":"مغلقة"],["الحالة",st.over?"أكبر من الحد":"مقبول"]]; },
  eq:["Δm = m_L − m_R","M = Δm · g · y","t = Δm / (2 · معدل النقل)"],
  note:["أرقام الحد والكتلة الكلية في المثال افتراضية؛ الحد الحقيقي يؤخذ من دليل الطائرة المعتمد.","النقل يتم عادة بإيقاف مضخة الجانب الأخف أو بفتح التغذية المتقاطعة حسب إجراء الطاقم، لا من هذا الدرس."],
  quiz:[{q:"لو نقلنا 600 kg/min من الجناح الأثقل، فالفرق ينقص كل دقيقة بمقدار:",o:["1200 kg","600 kg","300 kg"],a:0,why:"ما يخرج من جانب يدخل الآخر فيتضاعف الأثر."},
        {q:"ما أثر الفرق الكبير على الطيران؟",o:["عزم لف تعوّضه الجنيحات","تغيّر في الرفع فقط","لا أثر"],a:0,why:"يميل الجناح الأثقل ويحتاج تعويضاً."}],
  show:{ar:"اعرض صمام التغذية المتقاطعة",fn:()=>lrnSel("fuel_xfeed")},
  ref:"الموضوع: نظام الوقود وإدارة التوازن (Fuel Management)."
});
/* ---- 13 ---- */
const ayPv=(T,wide)=>(wide?17:0.8)*Math.exp(0.055*(T-37.8));
LK("asy",{
  ar:"ضغط بخار الوقود والتجويف", en:"Vapour pressure, NPSH and boost pumps",
  alt:"خزان فيه مضخة تعزيز تغذي مضخة المحرك، ومنحنى الضغط الفائض فوق ضغط البخار مع الارتفاع مقابل الحد المطلوب",
  intro:["إذا هبط الضغط عند مدخل مضخة المحرك إلى ضغط بخار الوقود يغلي الوقود وتتكون فقاعات تتحطم داخل المضخة، وهذه ظاهرة التجويف (cavitation) التي تتلف المضخة وتقطع التدفق. الضغط الفائض فوق ضغط البخار يسمى NPSH.",
         "NPSH المتاح = ضغط الخزان + ضغط ارتفاع الوقود + ضغط المضخة المعززة − الفقد − ضغط البخار. وكلما صعدت الطائرة قل الضغط الخارجي، وكلما سخن الوقود ارتفع ضغط بخاره. لهذا توضع مضخات تعزيز داخل الخزان تدفع الوقود بضغط يتجاوز المطلوب."],
  ctl:[{k:"h",ar:"ارتفاع الطيران",min:0,max:13,step:0.5,v:11,f:v=>nf(v,1)+" km"},{k:"T",ar:"حرارة الوقود",min:-40,max:60,step:1,v:20,f:v=>nf(v,0)+" °C"},{k:"hd",ar:"عمود الوقود فوق المضخة",min:0,max:2,step:0.1,v:0.5,f:v=>nf(v,1)+" m"},{k:"pb",ar:"ضغط مضخة التعزيز",min:0,max:100,step:5,v:40,f:v=>nf(v,0)+" kPa"},{k:"nr",ar:"NPSH المطلوب",min:5,max:60,step:1,v:20,f:v=>nf(v,0)+" kPa"}],
  tog:[{k:"wide",ar:"وقود واسع القطع (أخف)",v:false},{k:"on",ar:"مضخة التعزيز تعمل",v:true}],
  pre:[{ar:"وقود خفيف ساخن بلا تعزيز",set:{wide:true,T:45,on:false,h:11}},{ar:"كيروسين بارد",set:{wide:false,T:-20,on:true}}],
  calc(st){ st.npsh=(h,T)=>isa(h*1000).p/1000+1+800*G0*st.hd/1000+(st.on?st.pb:0)-3-ayPv(T,st.wide); st.na=st.npsh(st.h,st.T); st.pv=ayPv(st.T,st.wide); st.pa=isa(st.h*1000).p/1000; st.ok=st.na>=st.nr; st.mar=st.na-st.nr; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.06, w=r.w*0.42, y0=r.y+r.h*0.2, h=r.h*0.5; g.fillStyle=mixC(C.panel,C.fuel,0.4); g.fillRect(x0,y0+h*0.25,w,h*0.75); g.strokeStyle=C.ink; g.lineWidth=1.4; g.strokeRect(x0,y0,w,h);
    ltx(g,"مضخة تعزيز",x0+w*0.45,y0+h*0.9,{s:11,rtl:true}); g.fillStyle=mixC(C.panel,st.on?C.hyd:C.muted,0.7); g.beginPath(); g.arc(x0+w*0.45,y0+h*0.75,14,0,Math.PI*2); g.fill(); g.stroke();
    const px=r.x+r.w*0.72, py=y0+h*0.75; lline(g,[[x0+w*0.45+14,py],[px-18,py]],C.fuel,5); g.fillStyle=mixC(C.panel,C.struct,0.7); g.beginPath(); g.arc(px,py,18,0,Math.PI*2); g.fill(); g.stroke(); ltx(g,"مضخة المحرك",px,py+34,{s:11,rtl:true});
    if(!st.ok){ for(let i=0;i<8;i++){ const f=(st.t*0.8+i*0.37)%1; ldot(g,px-14+((i*13)%28),py+10-f*30,2.4+(i%3),C.ink,0.7*(1-f)); } }
    kBar(g,r.x+r.w*0.1,r.y+r.h*0.86,r.w*0.8,10,st.na/Math.max(80,st.na),st.ok?"hyd":"power",C,"NPSH المتاح "+nf(st.na,0)+" kPa مقابل "+nf(st.nr,0)); ltx(g,st.ok?"لا تجويف":"تجويف محتمل",px,y0+4,{s:12,w:600,rtl:true,c:st.ok?C.hyd:C.power}); },
  plot(st){ return {x:[0,13],y:[-30,130],xl:"الارتفاع km",yl:"NPSH kPa",curves:[{f:h=>st.npsh(h,st.T),c:"fuel"}],hl:[{y:st.nr,c:"power",t:"المطلوب"}],dots:[{x:st.h,y:st.na,c:st.ok?"hyd":"power"}]}; },
  ro(st){ return [["ضغط الجو",nf(st.pa,1)+" kPa"],["ضغط بخار الوقود",nf(st.pv,1)+" kPa"],["NPSH المتاح",nf(st.na,1)+" kPa"],["الهامش",nf(st.mar,1)+" kPa"],["الحالة",st.ok?"آمن":"خطر تجويف"]]; },
  eq:["NPSH_متاح = p_خزان + ρ g h + Δp_تعزيز − Δp_فقد − p_بخار","التجويف عندما NPSH_متاح < NPSH_مطلوب"],
  note:["ضغط البخار مقدّر بمعادلة أسّية تقريبية لتوضيح الاتجاه، وليس لخصائص وقود محدد.","الوقود الأخف (واسع القطع) أشد عرضة للتجويف لأن ضغط بخاره أعلى بكثير من وقود الكيروسين."],
  quiz:[{q:"ماذا يحدث لـNPSH المتاح مع صعود الطائرة؟",o:["يقل لأن ضغط الجو ينخفض","يزداد","لا يتغير"],a:0,why:"ضغط الخزان يتبع ضغط الجو."},
        {q:"ما فائدة مضخة التعزيز؟",o:["رفع ضغط مدخل مضخة المحرك فوق ضغط البخار","تبريد الوقود","قياس الكمية"],a:0,why:"تزيد NPSH المتاح."}],
  show:{ar:"اعرض مضخة التعزيز",fn:()=>lrnSel("fuel_boost_pump")},
  ref:"الموضوع: ارتفاع الشفط الإيجابي الصافي NPSH (Net Positive Suction Head)."
});
/* ---- 14 ---- */
LK("asy",{
  ar:"حرارة الوقود في الرحلة ونقطة التجمد", en:"Fuel temperature in cruise and freezing",
  alt:"مقطع في خزان جناح بوقود يبرد تدريجياً، ومنحنى حرارة الوقود مع الزمن يقترب من حرارة الهواء الخارجي مقابل نقطة التجمد",
  intro:["في الرحلة الطويلة على ارتفاع عالٍ تبلغ الحرارة الخارجية نحو −55 °C، وتبرد الأجنحة والوقود بالتدريج. لكن كتلة الوقود الكبيرة تتغير حرارتها ببطء: dT/dt = (T_هدف − T)/τ، فيها زمن ثابت τ قد يبلغ عدة ساعات.",
         "إن اقتربت حرارة الوقود من نقطة التجمد (نحو −47 °C لوقود Jet A-1 و−40 °C لـJet A) يتكوّن بلّور شمعي يسدّ المرشحات. الحل بإنزال الارتفاع أو رفع السرعة (فترتفع الحرارة الكلية TAT) أو الاتجاه لمنطقة أدفأ."],
  ctl:[{k:"T0",ar:"حرارة الوقود عند الإقلاع",min:0,max:35,step:1,v:15,f:v=>nf(v,0)+" °C"},{k:"Tt",ar:"الحرارة المستهدفة (TAT قريب)",min:-60,max:-10,step:1,v:-32,f:v=>nf(v,0)+" °C"},{k:"tau",ar:"الزمن الثابت للخزان",min:1,max:8,step:0.1,v:3.5,f:v=>nf(v,1)+" h"},{k:"fp",ar:"نقطة التجمد",min:-50,max:-35,step:1,v:-47,f:v=>nf(v,0)+" °C"},{k:"hr",ar:"مدة الرحلة",min:1,max:16,step:0.5,v:10,f:v=>nf(v,1)+" h"}],
  pre:[{ar:"رحلة قطبية باردة",set:{Tt:-50,hr:12}},{ar:"رحلة استوائية",set:{Tt:-20,hr:8}}],
  calc(st){ st.Tf=t=>st.Tt+(st.T0-st.Tt)*Math.exp(-t/st.tau); st.Te=st.Tf(st.hr); st.mar=st.Te-st.fp; st.tc=st.Tt<st.fp+3?st.tau*Math.log((st.T0-st.Tt)/(st.fp+3-st.Tt)):Infinity; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, y0=r.y+r.h*0.22, w=r.w*0.7, h=r.h*0.4, ph=(st.t*0.12)%1, T=st.Tf(ph*st.hr), f=clamp((T-st.fp)/(40-st.fp),0,1);
    g.fillStyle=mixC(C.panel,C.fuel,0.35); g.beginPath(); g.moveTo(cx-w/2,y0+h*0.2); g.lineTo(cx+w/2,y0); g.lineTo(cx+w/2,y0+h); g.lineTo(cx-w/2,y0+h*0.9); g.closePath(); g.fill(); g.strokeStyle=C.ink; g.lineWidth=1.4; g.stroke();
    g.fillStyle=mixC(C.panel,C.hyd,0.2+0.5*(1-f)); g.globalAlpha=0.6; g.fillRect(cx-w/2+3,y0+h*0.5,w-6,h*0.45); g.globalAlpha=1;
    for(let i=0;i<10;i++){ const x=cx-w/2+((i*53+st.t*20)%w), y=y0-14-(i%3)*10; ltx(g,"❄",x,y,{s:11,c:C.hyd,al:0.7}); }
    ltx(g,"بعد "+nf(ph*st.hr,1)+" h : "+nf(T,1)+" °C",cx,y0+h+28,{s:13,w:600,rtl:true,c:T<st.fp+3?C.power:C.ink}); kBar(g,cx-w/2,r.y+r.h*0.84,w,10,f,T<st.fp+3?"power":"hyd",C,"الهامش فوق التجمد "+nf(Math.max(0,T-st.fp),1)+" °C"); },
  plot(st){ return {x:[0,st.hr],y:[-60,40],xl:"الزمن h",yl:"°C",curves:[{f:st.Tf,c:"fuel"}],hl:[{y:st.fp,c:"power",t:"التجمد"},{y:st.Tt,c:"muted",t:"الهدف"}],dots:[{x:st.hr,y:st.Te,c:"power"}]}; },
  ro(st){ return [["حرارة الوقود في النهاية",nf(st.Te,1)+" °C"],["الهامش فوق التجمد",nf(st.mar,1)+" °C"],["الوصول إلى هامش 3 °C",isFinite(st.tc)?"بعد "+nf(st.tc,1)+" h":"لا يصل"],["الحالة",st.mar<3?"قريب من التجمد: يلزم إجراء":"آمن"]]; },
  eq:["dT/dt = (T_هدف − T) / τ","T(t) = T_هدف + (T₀ − T_هدف) e^(−t/τ)"],
  note:["النموذج يفترض هدفاً ثابتاً، بينما تتغير الحرارة الكلية مع الارتفاع والسرعة والمنطقة.","الطواقم تراقب حرارة الوقود في الخزانات وتقرر تغيير الارتفاع قبل الوصول إلى الحد."],
  quiz:[{q:"أي خزان يبرد أبطأ؟",o:["الأكبر كتلة (τ أكبر)","الأصغر","كلاهما سواء"],a:0,why:"τ يزيد مع الكتلة."},
        {q:"ما أحد حلول اقتراب الوقود من التجمد؟",o:["إنزال الارتفاع إلى هواء أدفأ","رفع الارتفاع","إطفاء المضخات"],a:0,why:"الهواء الأدفأ يرفع حرارة الهدف."}],
  show:{ar:"اعرض خزانات الوقود",fn:()=>lrnSel("fuel")},
  ref:"الموضوع: إدارة حرارة الوقود في الرحلات الطويلة (Fuel Temperature Management)."
});
/* ---- 15 ---- */
LK("asy",{
  ar:"قانون أوم وهبوط الجهد في الأسلاك", en:"Ohm's law and wire voltage drop",
  alt:"سلك طويل يغذي حملاً من منبع 28 فولت مع تدرّج جهد، ومنحنى هبوط الجهد مع مساحة مقطع السلك",
  intro:["السلك النحاسي له مقاومة R = ρ·L/A، فإذا مرّ فيه تيار I هبط عبره جهد V = I·R وتحوّل جزء من القدرة I²R إلى حرارة. في أنظمة الطائرة ذات الجهد المنخفض (28 V) يؤثر هذا الهبوط كثيراً على الأجهزة البعيدة.",
         "لخفض الهبوط نكبّر مقطع السلك أو نقصّر طوله. لكن السلك الأثقل يزيد وزن الطائرة، وعلى المصمم الموازنة. ولذلك تُرفع جهود الأنظمة الكبيرة إلى 115 V متناوب أو أكثر لتقليل التيار لنفس القدرة."],
  ctl:[{k:"I",ar:"التيار",min:1,max:200,step:1,v:20,f:v=>nf(v,0)+" A"},{k:"L",ar:"طول السلك",min:1,max:60,step:1,v:10,f:v=>nf(v,0)+" m"},{k:"A",ar:"مساحة المقطع",min:0.5,max:35,step:0.5,v:10,f:v=>nf(v,1)+" mm²"},{k:"Vs",ar:"جهد المنبع",min:24,max:30,step:0.5,v:28,f:v=>nf(v,1)+" V"}],
  tog:[{k:"ret",ar:"رجوع بسلك (ذهاب وإياب)",v:true}],
  calc(st){ st.rho=1.72e-8; st.vdf=A=>st.I*st.rho*st.L*(st.ret?2:1)/(A*1e-6); st.R=st.rho*st.L*(st.ret?2:1)/(st.A*1e-6); st.vd=st.I*st.R; st.pl=st.I*st.I*st.R; st.pct=st.vd/st.Vs*100; st.vl=st.Vs-st.vd; st.cd=st.I/st.A; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.1, x1=r.x+r.w*0.9, y=r.y+r.h*0.42, hh=Math.max(4,Math.min(18,st.A*0.9)), f=clamp(st.vd/st.Vs,0,1);
    kBox(g,x0-8,y-24,32,48,mixC(C.panel,C.power,0.5),C,st.Vs+" V",{s:10}); kBox(g,x1-24,y-24,32,48,mixC(C.panel,C.fuel,0.4),C,"حمل",{s:11});
    for(let i=0;i<30;i++){ const f0=i/30; g.fillStyle=mixC(C.panel,C.power,0.85-0.7*f*f0); g.fillRect(x0+24+(x1-x0-48)*f0,y-hh/2,(x1-x0-48)/30+1,hh); }
    for(let i=0;i<12;i++){ const fx=(st.t*0.18*Math.min(3,0.3+st.I/60)+i/12)%1; ldot(g,x0+24+(x1-x0-48)*fx,y+(i%3-1)*hh*0.25,2,C.ink,0.8); }
    ltx(g,"V عند الحمل = "+nf(st.vl,2)+" V",(x0+x1)/2,y+40,{s:13,w:600,m:true,c:st.pct>3?C.power:C.ink}); ltx(g,"هبوط "+nf(st.vd,2)+" V، أي "+nf(st.pct,1)+" %",(x0+x1)/2,y+60,{s:12,rtl:true,c:C.muted}); kBar(g,x0,r.y+r.h*0.84,x1-x0,10,st.pct/10,st.pct>3?"power":"hyd",C,"الهبوط من الجهد "+nf(st.pct,1)+" %"); },
  plot(st){ return {x:[0.5,35],y:[0.01,60],log:true,xl:"مساحة المقطع mm²",yl:"هبوط الجهد V",curves:[{f:st.vdf,c:"power"}],hband:[{y0:0.01,y1:0.6,c:"hyd",a:0.14}],hl:[{y:0.6,c:"hyd",t:"2 % تقريباً"}],dots:[{x:st.A,y:Math.max(0.011,st.vd),c:"power"}]}; },
  ro(st){ return [["مقاومة السلك",nf(st.R*1000,1)+" mΩ"],["هبوط الجهد",nf(st.vd,2)+" V"],["القدرة الضائعة",nf(st.pl,1)+" W"],["كثافة التيار",nf(st.cd,1)+" A/mm²"],["الجهد عند الحمل",nf(st.vl,2)+" V"]]; },
  eq:["R = ρ L / A   ،   ρ_نحاس ≈ 1.72×10⁻⁸ Ω·m","V = I R","P_ضائعة = I² R"],
  note:["نظام الرجوع بسلك يضاعف الطول الفعال. في الهياكل المعدنية القديمة كان جسم الطائرة يستخدم كمسار رجوع، وهذا غير ممكن في الهياكل المركّبة.","أحجام الأسلاك الفعلية تحددها جداول السعة الحرارية والتجميع في دليل الأسلاك المعتمد؛ هذا الدرس يوضح الفكرة فقط."],
  quiz:[{q:"إذا ضاعفنا مقطع السلك، يصبح هبوط الجهد:",o:["النصف","الضعف","لا يتغير"],a:0,why:"R تتناسب عكسياً مع المساحة."},
        {q:"إذا تضاعف التيار، فالقدرة الضائعة في السلك:",o:["تتضاعف أربع مرات","تتضاعف","تبقى"],a:0,why:"P = I² R."}],
  show:{ar:"اعرض قضبان التوزيع",fn:()=>lrnSel("gcu_bus")},
  ref:"الموضوع: أسلاك الطائرات وهبوط الجهد (Aircraft Wiring)."
});
/* ---- 16 ---- */
LK("asy",{
  ar:"التيار المتناوب ثلاثي الطور 115/200 فولت", en:"Three-phase 400 Hz AC power",
  alt:"مخطط متجهات دوّارة لثلاثة أطوار بينها 120 درجة، وموجات الجهد الثلاث مع الزمن",
  intro:["المولّد الكبير في الطائرة ينتج ثلاث موجات جهد متماثلة تتأخر كل واحدة عن سابقتها 120°. مجموع التيارات في الحمل المتزن يساوي صفراً، فلا يلزم سلك رجوع ثقيل. ويُستخدم تردد 400 Hz لأن الآلات الكهربائية والمحوّلات تصبح أخف وزناً مع التردد الأعلى.",
         "الجهد بين الطور والحياد 115 V يعني جهداً بين طورين = √3 × 115 ≈ 200 V. القدرة الفعلية للحمل المتزن P = 3·V_ph·I·cos φ. والقيمة العظمى للموجة V_ph·√2 أعلى من القيمة الفعالة."],
  ctl:[{k:"Vp",ar:"جهد الطور الفعال",min:100,max:130,step:1,v:115,f:v=>nf(v,0)+" V"},{k:"f",ar:"التردد",min:300,max:800,step:10,v:400,f:v=>nf(v,0)+" Hz"},{k:"I",ar:"تيار كل طور",min:10,max:100,step:1,v:40,f:v=>nf(v,0)+" A"},{k:"pf",ar:"معامل القدرة",min:0.6,max:1,step:0.01,v:0.85,f:v=>nf(v,2)}],
  tog:[{k:"ll",ar:"إظهار الجهد بين طورين",v:true}],
  calc(st){ st.pk=st.Vp*Math.SQRT2; st.VL=st.Vp*Math.sqrt(3); st.P=3*st.Vp*st.I*st.pf; st.S=3*st.Vp*st.I; st.T=1000/st.f; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.5, R=Math.min(r.w,r.h)*0.36, w=st.t*2.4, cols=[C.power,C.fuel,C.hyd];
    g.strokeStyle=C.line; g.lineWidth=1; g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.stroke(); lline(g,[[cx-R-6,cy],[cx+R+6,cy]],C.line,1); lline(g,[[cx,cy-R-6],[cx,cy+R+6]],C.line,1);
    [0,1,2].forEach(i=>{ const a=-w-i*2*Math.PI/3; larrow(g,cx,cy,cx+Math.cos(a)*R,cy+Math.sin(a)*R,cols[i],2.6,9); ltx(g,["A","B","C"][i],cx+Math.cos(a)*(R+14),cy+Math.sin(a)*(R+14),{s:12,w:700,c:cols[i],m:true}); });
    if(st.ll){ const a0=-w, a1=-w-2*Math.PI/3; lline(g,[[cx+Math.cos(a0)*R,cy+Math.sin(a0)*R],[cx+Math.cos(a1)*R,cy+Math.sin(a1)*R]],C.muted,1.4,[4,3]); }
    ltx(g,nf(st.Vp,0)+" V طور  ·  "+nf(st.VL,0)+" V بين طورين",cx,r.y+r.h*0.06,{s:12,w:600,rtl:true}); ltx(g,"P = "+nf(st.P/1000,1)+" kW",cx,r.y+r.h*0.95,{s:13,w:600,m:true}); },
  plot(st){ const T=2*st.T; const cv=[0,1,2].map(i=>({f:t=>st.pk*Math.sin(2*Math.PI*t/st.T-i*2*Math.PI/3),c:["power","fuel","hyd"][i],n:200,w:1.8})); if(st.ll) cv.push({f:t=>st.pk*Math.sqrt(3)*Math.sin(2*Math.PI*t/st.T+Math.PI/6),c:"muted",dash:[4,3],n:200,w:1.2}); return {x:[0,T],y:[-230,230],xl:"الزمن ms",yl:"الجهد V",curves:cv,hl:[{y:st.pk,c:"muted",t:"الذروة"}]}; },
  ro(st){ return [["القيمة العظمى للطور",nf(st.pk,0)+" V"],["الجهد بين طورين",nf(st.VL,0)+" V"],["القدرة الفعلية",nf(st.P/1000,2)+" kW"],["القدرة الظاهرية",nf(st.S/1000,2)+" kVA"],["زمن الدورة",nf(st.T,2)+" ms"]]; },
  eq:["v_ph(t) = V_p √2 sin(2π f t − k·120°)","V_LL = √3 · V_ph","P = 3 V_ph I cos φ"],
  note:["الحمل المتزن مفترض: تيارات الأطوار الثلاثة متساوية، ولذلك ينعدم تيار الحياد.","الأجهزة الكهربائية تعتمد على القيم الفعالة (RMS)، لا العظمى."],
  quiz:[{q:"إذا كان جهد الطور 115 V، فالجهد بين طورين تقريباً:",o:["200 V","115 V","230 V"],a:0,why:"√3 × 115 ≈ 199 V."},
        {q:"لماذا يستخدم 400 Hz في الطائرات؟",o:["لتخفيف وزن المحولات والمولدات","لأنه أرخص","لا فرق"],a:0,why:"الأحمال المغناطيسية تصغر كلما زاد التردد."}],
  show:{ar:"اعرض مولّد المحرك",fn:()=>lrnSel("eng_generator")},
  ref:"الموضوع: أنظمة التيار المتناوب في الطائرات (AC Power Generation)."
});
/* ---- 17 ---- */
LK("asy",{
  ar:"تردد المولّد: السرعة الثابتة أم التردد المتغير", en:"Generator frequency: constant speed drive versus variable frequency",
  alt:"صندوق تروس يدير مولداً، ومنحنى تردد الخرج مع سرعة المحرك للنظامين: سرعة ثابتة وتردد متغير",
  intro:["تردد الخرج لمولد متزامن f = p·N/120 حيث p عدد الأقطاب وN دوران العمود. لو دار المولد بسرعة المحرك المتغيرة لتغيّر التردد، لذلك تضع بعض الطائرات صندوقاً هيدروميكانيكياً يثبّت السرعة (CSD/IDG) لينتج 400 Hz دائماً.",
         "في طائرات أحدث حذف المصممون الصندوق فبقي التردد متغيراً (VFG)، وصار الحمل الإلكتروني يحوّل الكهرباء بعدها. يوفّر ذلك وزناً وصيانة، لكنه يتطلب أجهزة تقبل تردداً من نحو 360 إلى 800 Hz."],
  ctl:[{k:"N",ar:"دوران صندوق تروس المحرك",min:3000,max:7000,step:100,v:5000,f:v=>nf(v,0)+" rpm"},{k:"p",ar:"عدد الأقطاب",min:2,max:8,step:2,v:4,f:v=>nf(v,0)},{k:"kg",ar:"نسبة التروس إلى المولد",min:1,max:4,step:0.1,v:2.4,f:v=>nf(v,1)}],
  tog:[{k:"csd",ar:"سرعة ثابتة (IDG)",v:true}],
  calc(st){ st.Ng=st.csd?(12000*4/st.p):st.N*st.kg; st.fo=st.p*st.Ng/120; st.fv=n=>st.p*n*st.kg/120; st.fc=st.p*(12000*4/st.p)/120; st.inb=st.fo>=360&&st.fo<=800; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.28, cy=r.y+r.h*0.44, R=Math.min(r.w*0.18,r.h*0.26), a=st.t*st.Ng/900;
    g.fillStyle=mixC(C.panel,C.struct,0.5); g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.fill(); g.strokeStyle=C.ink; g.lineWidth=1.4; g.stroke();
    for(let i=0;i<st.p;i++){ const an=a+i*2*Math.PI/st.p; g.fillStyle=i%2?C.power:C.hyd; g.beginPath(); g.arc(cx,cy,R*0.85,an,an+Math.PI/st.p*0.8); g.arc(cx,cy,R*0.45,an+Math.PI/st.p*0.8,an,true); g.closePath(); g.fill(); }
    ltx(g,"مولّد "+nf(st.Ng,0)+" rpm",cx,cy+R+16,{s:11,rtl:true}); const gx=r.x+r.w*0.56, gw=r.w*0.34; g.fillStyle=mixC(C.panel,C.struct,0.35); g.fillRect(gx,cy-R*0.5,gw,R); g.strokeRect(gx,cy-R*0.5,gw,R);
    ltx(g,st.csd?"صندوق السرعة الثابتة":"توصيل مباشر بنسبة تروس",gx+gw/2,cy,{s:11,w:600,rtl:true}); lline(g,[[cx+R,cy],[gx,cy]],C.ink,3);
    ltx(g,nf(st.fo,0)+" Hz",r.x+r.w*0.5,r.y+r.h*0.1,{s:16,w:700,m:true,c:st.inb?C.ink:C.power}); kBar(g,r.x+r.w*0.1,r.y+r.h*0.86,r.w*0.8,10,(st.fo-300)/600,st.inb?"hyd":"power",C,"التردد المقبول 360 إلى 800 Hz"); },
  plot(st){ return {x:[3000,7000],y:[200,900],xl:"دوران المحرك rpm",yl:"التردد Hz",curves:[{f:st.fv,c:"ctrl"},{f:()=>st.fc,c:"hyd"}],leg:[{c:"ctrl",t:"تردد متغير"},{c:"hyd",t:"سرعة ثابتة"}],hband:[{y0:360,y1:800,c:"hyd",a:0.1}],dots:[{x:st.N,y:st.fo,c:"power"}]}; },
  ro(st){ return [["دوران المولد",nf(st.Ng,0)+" rpm"],["تردد الخرج",nf(st.fo,0)+" Hz"],["عدد أقطاب الأزواج",nf(st.p/2,0)],["الحالة",st.csd?"ثابت بنظام السرعة":st.inb?"ضمن 360–800 Hz":"خارج المجال"]]; },
  eq:["f = p N / 120","N_مولد = k · N_محرك (توصيل مباشر)"],
  note:["الدرس مبسّط: الأقطاب هنا عدد الأقطاب الكلي، وقيم التردد والسرعات أمثلة لتوضيح الفكرة.","التردد المتغير يحتاج تحويلاً للأحمال الحساسة، وتفضيله أو رفضه قرار تصميمي في كل طائرة."],
  quiz:[{q:"لماذا يلزم صندوق السرعة الثابتة؟",o:["ليبقى التردد 400 Hz مهما تغيّر دوران المحرك","ليبرد المولد","لزيادة القدرة"],a:0,why:"f تتبع السرعة، فنثبّتها."},
        {q:"ما ميزة المولد المتغير التردد؟",o:["خفة وصيانة أقل لحذف الصندوق","تردد أدق","جهد أعلى"],a:0,why:"الصندوق الميكانيكي هو الجزء الأثقل والأكثر صيانة."}],
  show:{ar:"اعرض مولّد المحرك",fn:()=>lrnSel("eng_generator")},
  ref:"الموضوع: مولدات التردد الثابت والمتغير (CSD and VFG)."
});
/* ---- 18 ---- */
LK("asy",{
  ar:"تفريغ البطارية وزمن التشغيل الطارئ", en:"Battery discharge and emergency endurance",
  alt:"بطارية بخلايا تتفرغ تدريجياً ومنحنى زمن التشغيل مع تيار الحمل بمقياس لوغاريتمي مقابل حد 30 دقيقة",
  intro:["البطارية تعطي طاقتها عبر تفاعل كيميائي، وسعتها تُقاس بالأمبير ساعة عند معدل تفريغ مرجعي. كلما زاد التيار كثيراً عن المعدل المرجعي قلّ ما تعطيه فعلياً، وتقدّر ذلك معادلة بوكرت: t = H · (C / (I·H))ᵏ.",
         "البرد يبطئ التفاعل فتنخفض السعة المتاحة. وبسبب ذلك تُحسب بطارية الطوارئ بحيث تغذي الأجهزة الأساسية مدة محددة (مثل 30 دقيقة) حتى في أسوأ الظروف المتوقعة."],
  ctl:[{k:"C",ar:"السعة عند معدل ساعة",min:10,max:100,step:1,v:40,f:v=>nf(v,0)+" Ah"},{k:"I",ar:"تيار الحمل",min:5,max:150,step:1,v:40,f:v=>nf(v,0)+" A"},{k:"kp",ar:"أس بوكرت",min:1,max:1.35,step:0.01,v:1.12,f:v=>nf(v,2)},{k:"Tc",ar:"حرارة البطارية",min:-30,max:40,step:1,v:20,f:v=>nf(v,0)+" °C"}],
  pre:[{ar:"طقس شديد البرودة",set:{Tc:-25}},{ar:"حمل طوارئ",set:{I:25}}],
  calc(st){ st.ft=st.Tc>=20?1:Math.max(0.4,1-0.008*(20-st.Tc)); st.Ce=st.C*st.ft; st.tf=I=>60*Math.pow(st.Ce/I,st.kp); st.te=st.tf(st.I); st.ok=st.te>=30; st.Ex=st.Ce*24; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.18, w=r.w*0.6, y0=r.y+r.h*0.3, h=r.h*0.34, ph=(st.t*0.1)%1, f=clamp(1-ph,0,1);
    g.strokeStyle=C.ink; g.lineWidth=1.6; g.strokeRect(x0,y0,w,h); g.fillStyle=C.ink; g.fillRect(x0+w,y0+h*0.3,8,h*0.4); const n=8; for(let i=0;i<n;i++){ const cx0=x0+4+i*(w-8)/n, cw=(w-8)/n-3, fill=clamp(f*n-i,0,1); g.fillStyle=mixC(C.panel,st.ok?C.hyd:C.power,0.25+0.6*fill); g.fillRect(cx0,y0+4,cw,h-8); }
    ltx(g,"زمن التشغيل المقدّر: "+nf(st.te,0)+" دقيقة",r.x+r.w*0.5,r.y+r.h*0.12,{s:13,w:600,rtl:true,c:st.ok?C.ink:C.power}); ltx(g,"السعة الفعلية "+nf(st.Ce,0)+" Ah عند "+nf(st.Tc,0)+" °C",r.x+r.w*0.5,y0+h+26,{s:12,rtl:true,c:C.muted});
    kBar(g,x0,r.y+r.h*0.84,w,10,st.te/60,st.ok?"hyd":"power",C,"مقارنة بحد 30 دقيقة"); },
  plot(st){ return {x:[5,150],y:[1,600],log:true,xl:"تيار الحمل A",yl:"الزمن min",curves:[{f:st.tf,c:"hyd"}],hl:[{y:30,c:"power",t:"30 دقيقة"}],dots:[{x:st.I,y:st.te,c:st.ok?"hyd":"power"}]}; },
  ro(st){ return [["عامل الحرارة",nf(st.ft*100,0)+" %"],["السعة الفعلية",nf(st.Ce,1)+" Ah"],["زمن التشغيل",nf(st.te,0)+" min"],["الحالة",st.ok?"يكفي 30 دقيقة":"لا يكفي 30 دقيقة"]]; },
  eq:["t = H (C_فعلية / (I H))ᵏ ،  H = 1 h","C_فعلية = C · f(T)"],
  note:["معامل الحرارة تقريبي ويختلف بحسب نوع البطارية. البطاريات الليثيومية والنيكل–كادميوم تختلف في أسّ بوكرت وفي استجابتها للبرد.","الحمل المحسوب يشمل الأجهزة الأساسية فقط؛ إغلاق الأحمال غير الضرورية يطيل المدة كثيراً."],
  quiz:[{q:"زيادة تيار التفريغ تجعل السعة المستفاد منها:",o:["أقل","أكبر","كما هي"],a:0,why:"بوكرت: التفريغ السريع يعطي سعة أقل."},
        {q:"ما أثر البرد على البطارية؟",o:["ينقص السعة المتاحة","يزيدها","لا أثر"],a:0,why:"التفاعل الكيميائي يبطؤ."}],
  show:{ar:"اعرض البطارية الرئيسية",fn:()=>lrnSel("batt_main")},
  ref:"الموضوع: بطاريات الطائرة وتحجيمها (Aircraft Batteries)."
});
