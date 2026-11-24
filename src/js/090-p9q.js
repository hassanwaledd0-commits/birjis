/* ---------- Book 12: Flight Operations and Performance (3/3): ground fuel, routing, control, speeds ---------- */
/* ---- 19 ---- */
LK("prf",{
  ar:"وقود الأرض: التاكسي والوحدة المساعدة", en:"Ground fuel: taxi and auxiliary power",
  alt:"طائرة على الأرض بمحركات تعمل وصندوق وحدة طاقة مساعدة، وأعمدة استهلاك الوقود وانبعاثات CO₂، ومنحنى الوقود مع زمن التاكسي لمحرك أو عدة محركات",
  intro:["تحرق الطائرة وقوداً على الأرض أيضاً: المحركات تدور على السكون أثناء التاكسي، والوحدة المساعدة APU تولّد الكهرباء والهواء أثناء الوقوف. يبدو استهلاك كل محرك صغيراً، لكن مجموع آلاف الرحلات كبير.",
         "تقلل شركات الطيران هذا الاستهلاك بالتاكسي بمحرك واحد عند السماح بذلك، وبالتزويد بكهرباء أرضية GPU وهواء مكيّف أرضي بدل APU. كل كيلوغرام وقود يعطي نحو 3.16 كيلوغرام CO₂، فالتوفير مالي وبيئي معاً."],
  ctl:[{k:"tx",ar:"زمن التاكسي",min:5,max:45,step:1,v:15,f:v=>nf(v,0)+" min"},{k:"ne",ar:"عدد المحركات العاملة",min:1,max:4,step:1,v:2,f:v=>nf(v,0)},{k:"ff",ar:"استهلاك المحرك على السكون",min:3,max:15,step:0.5,v:6,f:v=>nf(v,1)+" kg/min"},{k:"ta",ar:"زمن الوحدة المساعدة",min:5,max:120,step:5,v:45,f:v=>nf(v,0)+" min"},{k:"fa",ar:"استهلاك الوحدة المساعدة",min:60,max:300,step:5,v:120,f:v=>nf(v,0)+" kg/h"},{k:"pr",ar:"سعر الوقود",min:0.4,max:1.6,step:0.05,v:0.8,f:v=>nf(v,2)+" /kg"}],
  tog:[{k:"gpu",ar:"استخدام كهرباء أرضية",v:false}],
  pre:[{ar:"737 تقريباً",set:{ne:2,ff:6,fa:120}},{ar:"A380 تقريباً",set:{ne:4,ff:11,fa:190,tx:20}}],
  calc(st){ st.taxi=st.tx*st.ne*st.ff; const ta=st.gpu?Math.min(5,st.ta):st.ta; st.apu=ta*st.fa/60; st.tot=st.taxi+st.apu; st.co2=st.tot*3.16; st.cost=st.tot*st.pr; st.one=st.tx*1*st.ff; st.fz=(t,n)=>t*n*st.ff; st.sav=st.taxi-st.one+(st.gpu?0:0); },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, y=r.y+r.h*0.42, W=r.w*0.7, ex=[0.18,0.38,0.62,0.82]; g.fillStyle=mixC(C.panel,C.struct,0.4); g.strokeStyle=C.ink; g.lineWidth=1.3; g.beginPath(); g.ellipse(cx,y,W*0.48,r.h*0.06,0,0,Math.PI*2); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(cx-W*0.05,y); g.lineTo(cx-W*0.46,y-r.h*0.2); g.lineTo(cx-W*0.38,y-r.h*0.2); g.lineTo(cx+W*0.05,y); g.fill(); g.stroke(); g.beginPath(); g.moveTo(cx-W*0.05,y); g.lineTo(cx-W*0.46,y+r.h*0.2); g.lineTo(cx-W*0.38,y+r.h*0.2); g.lineTo(cx+W*0.05,y); g.fill(); g.stroke();
    const eys=[-0.16,-0.08,0.08,0.16]; for(let i=0;i<4;i++){ const on=(st.ne>=4)||(st.ne===1&&i===0)||(st.ne===2&&(i===1||i===2))||(st.ne===3&&i!==3); const ey=y+(i<2?-1:1)*r.h*(i%2?0.09:0.17); const exx=cx-W*(i%2?0.22:0.3); if(i>=2&&st.ne<3&&false) continue; g.fillStyle=on?mixC(C.panel,C.power,0.8):mixC(C.panel,C.ink,0.12); g.beginPath(); g.ellipse(exx,ey,r.w*0.03,r.h*0.03,0,0,Math.PI*2); g.fill(); g.stroke(); if(on) for(let k=0;k<3;k++){ const f=(st.t*0.6+k/3)%1; ldot(g,exx+r.w*0.03+f*18,ey,2.2*(1-f),C.muted,1-f); } }
    kBox(g,cx+W*0.4,y-10,r.w*0.07,20,st.gpu?mixC(C.panel,C.muted,0.2):mixC(C.panel,C.gear,0.6),C,"APU",{s:10}); const ps=[[st.taxi,"تاكسي","power"],[st.apu,"وحدة مساعدة","gear"]], mx=Math.max(st.tot,1);
    let x=r.x+r.w*0.1; ps.forEach(([v,t,c])=>{ const w=r.w*0.8*v/mx; g.fillStyle=mixC(C.panel,KC(c,C),0.7); g.fillRect(x,r.y+r.h*0.76,w,16); g.strokeStyle=C.ink; g.strokeRect(x,r.y+r.h*0.76,w,16); if(w>46) ltx(g,t+" "+nf(v,0),x+w/2,r.y+r.h*0.76+8,{s:10,rtl:true,c:"#fff"}); x+=w; });
    ltx(g,"المجموع "+nf(st.tot,0)+" kg  ·  CO₂ "+nf(st.co2,0)+" kg",r.x+r.w*0.5,r.y+r.h*0.9,{s:13,w:700,rtl:true}); },
  plot(st){ return {x:[5,45],y:[0,st.fz(45,Math.max(st.ne,2))*1.05],xl:"زمن التاكسي min",yl:"الوقود kg",curves:[{f:t=>st.fz(t,1),c:"hyd"},{f:t=>st.fz(t,st.ne),c:"power"}],leg:[{c:"hyd",t:"محرك واحد"},{c:"power",t:"المحركات الحالية"}],dots:[{x:st.tx,y:st.taxi,c:"power"}]}; },
  ro(st){ return [["وقود التاكسي",nf(st.taxi,0)+" kg"],["وقود الوحدة المساعدة",nf(st.apu,0)+" kg"],["المجموع",nf(st.tot,0)+" kg"],["انبعاث CO₂",nf(st.co2,0)+" kg"],["الكلفة",nf(st.cost,0)],["توفير التاكسي بمحرك واحد",nf(st.taxi-st.one,0)+" kg"]]; },
  eq:["وقود التاكسي = زمن × عدد المحركات × معدل","وقود APU = زمن × معدل","CO₂ ≈ 3.16 × كتلة الوقود"],
  note:["التاكسي بمحرك واحد يحتاج موافقة إجراءات الشركة وظروف المطار، ويبقى بعض التأخير في تشغيل المحرك الآخر.","استخدام الكهرباء الأرضية يخفض الضجيج والانبعاثات قرب المبنى كذلك."],
  quiz:[{q:"ماذا يوفّر التاكسي بمحرك واحد من أصل اثنين؟",o:["نصف وقود التاكسي تقريباً","ربع الوقود","لا شيء"],a:0,why:"الاستهلاك يتناسب مع عدد المحركات العاملة."},
        {q:"لماذا تُفضَّل الكهرباء الأرضية عن APU؟",o:["تقل الانبعاثات والضجيج والوقود","لأنها أقوى","لأنها أسرع"],a:0,why:"تشغيل APU يحرق وقوداً."}],
  show:{ar:"اعرض مخرج الوحدة المساعدة",fn:()=>lrnSel("apu_exhaust")},
  ref:"الموضوع: كفاءة الوقود على الأرض (Ground Operations Efficiency)."
});
/* ---- 20 ---- */
LK("prf",{
  ar:"التيار النفاث: شرقاً أسرع من غرب", en:"Jet stream and eastbound-westbound flight time",
  alt:"خط رحلة بين قارتين مع شريط التيار النفاث وأسهم الريح، ومنحنى زمن الرحلة شرقاً وغرباً مع سرعة التيار",
  intro:["التيار النفاث نهر هواء سريع غربي الاتجاه على ارتفاع نحو 9–12 كم. الرحلة نحو الشرق تستفيد منه ريحاً خلفية، ونحو الغرب تعاني ريحاً أمامية. السرعة الأرضية = TAS ± ريح المتوسط على المسار.",
         "إذا مرّت الطائرة بالتيار طوال نسبة f من المسار فالريح الفعالة W = f × سرعة التيار على المسار. زمن الرحلة D / (TAS ± W)، فتتباعد الأزمنة مع قوة التيار. وفرق الوقود يتبع الفرق بالزمن. ولذلك تُخطَّط مسارات الأطلسي يومياً حسب موقع التيار."],
  ctl:[{k:"D",ar:"طول المسار",min:1000,max:6000,step:50,v:3000,f:v=>nf(v,0)+" NM"},{k:"tas",ar:"السرعة الحقيقية",min:400,max:520,step:5,v:460,f:v=>nf(v,0)+" kt"},{k:"wj",ar:"سرعة التيار على المسار",min:0,max:200,step:5,v:80,f:v=>nf(v,0)+" kt"},{k:"fj",ar:"نسبة المسار داخل التيار",min:0,max:1,step:0.05,v:0.6,f:v=>nf(v*100,0)+" %"},{k:"FF",ar:"استهلاك الوقود",min:2000,max:12000,step:100,v:2600,f:v=>nf(v,0)+" kg/h"}],
  pre:[{ar:"تيار قوي",set:{wj:150,fj:0.8}},{ar:"بلا تيار",set:{wj:0}}],
  calc(st){ st.W=st.fj*st.wj; st.te=st.D/(st.tas+st.W); st.tw=st.D/(st.tas-st.W); st.dt=(st.tw-st.te)*60; st.df=(st.tw-st.te)*st.FF; st.tf=(w,s)=>st.D/(st.tas+s*w*st.fj); },
  scene(g,r,st,C){ const x0=r.x+r.w*0.08, x1=r.x+r.w*0.92, y=r.y+r.h*0.46; g.fillStyle=mixC(C.panel,C.hyd,0.12+0.22*st.wj/200); g.beginPath(); g.moveTo(x0+(x1-x0)*(0.5-st.fj*0.45),y-r.h*0.1); g.lineTo(x0+(x1-x0)*(0.5+st.fj*0.45),y-r.h*0.1); g.lineTo(x0+(x1-x0)*(0.5+st.fj*0.45),y+r.h*0.1); g.lineTo(x0+(x1-x0)*(0.5-st.fj*0.45),y+r.h*0.1); g.closePath(); g.fill();
    for(let i=0;i<7;i++){ const f=(st.t*0.12*(0.3+st.wj/100)+i/7)%1, x=x0+(x1-x0)*f; if(x>x0+(x1-x0)*(0.5-st.fj*0.45)&&x<x0+(x1-x0)*(0.5+st.fj*0.45)) larrow(g,x,y,x+(10+st.wj*0.15),y,C.hyd,1.6,6); }
    [[y-r.h*0.2,1,"شرقاً",C.hyd,st.te],[y+r.h*0.22,-1,"غرباً",C.power,st.tw]].forEach(([yy,sg,t,c,tm])=>{ lline(g,[[x0,yy],[x1,yy]],c,2); const px=sg>0?x0+(x1-x0)*((st.t*0.2)%1):x1-(x1-x0)*((st.t*0.2*(st.te/st.tw))%1); ldot(g,px,yy,5,c); ltx(g,t+": "+nf(Math.floor(tm),0)+" h "+nf(Math.round((tm-Math.floor(tm))*60),0)+" m",sg>0?x0:x1,yy+(sg>0?-14:16),{s:12,w:600,rtl:true,a:sg>0?"left":"right",c}); });
    ltx(g,"الفرق "+nf(st.dt,0)+" دقيقة  ·  وقود "+nf(st.df,0)+" kg",r.x+r.w*0.5,r.y+r.h*0.92,{s:13,w:700,rtl:true}); },
  plot(st){ return {x:[0,200],y:[0,st.tf(200,-1)*1.05],xl:"سرعة التيار kt",yl:"زمن الرحلة h",curves:[{f:w=>st.tf(w,1),c:"hyd"},{f:w=>st.tf(w,-1),c:"power"}],leg:[{c:"hyd",t:"شرقاً"},{c:"power",t:"غرباً"}],dots:[{x:st.wj,y:st.te,c:"hyd"},{x:st.wj,y:st.tw,c:"power"}]}; },
  ro(st){ return [["الريح الفعالة",nf(st.W,0)+" kt"],["زمن شرقاً",nf(st.te,2)+" h"],["زمن غرباً",nf(st.tw,2)+" h"],["الفرق",nf(st.dt,0)+" min"],["فرق الوقود",nf(st.df,0)+" kg"]]; },
  eq:["W = f · W_jet","t_شرق = D / (TAS + W)   ،   t_غرب = D / (TAS − W)","Δ الوقود = معدل × (t_غرب − t_شرق)"],
  note:["المحاكاة تفترض مساراً مستقيماً. التخطيط الحقيقي يغيّر المسار ليدخل التيار شرقاً ويتجنبه غرباً، ما يقلل الفرق عن هذا الحساب.","حرارة الجو والاضطراب المصاحب للتيار يؤثران أيضاً على اختيار الارتفاع."],
  quiz:[{q:"لماذا تزيد رحلة الغرب زمناً؟",o:["الريح الأمامية تخفض السرعة الأرضية","الطائرة أثقل","الجاذبية"],a:0,why:"G = TAS − W."},
        {q:"إذا ضاعفنا سرعة التيار فالفرق بين الاتجاهين يزداد:",o:["بنسبة أكبر من الضعف قليلاً","بالضعف تماماً","لا يتغير"],a:0,why:"1/(TAS−W) − 1/(TAS+W) = 2W/(TAS²−W²)."}],
  ref:"الموضوع: تأثير الرياح العليا على التخطيط (Winds Aloft)."
});
/* ---- 21 ---- */
const pfTail={a380:{mac:12.3,St:205,lt:30.5},b737:{mac:3.96,St:32.8,lt:16.6},b747:{mac:8.3,St:136,lt:29}};
LK("prf",{
  ar:"ضبط الذيل الأفقي: علاقته بمركز الثقل", en:"Stabiliser trim and centre of gravity",
  alt:"منظر جانبي لطائرة بنقطة مركز الثقل ومركز الرفع وسهم قوة الذيل، ومنحنى زاوية الذيل المطلوبة مع موقع مركز الثقل",
  intro:["لكي تبقى الطائرة متزنة لحظة الإقلاع يجب أن تصبح العزوم حول مركز الثقل صفراً: رفع الجناح عند مركزه الهوائي يعطي عزماً يتعلق بموقع الثقل، وعزم الجناح الدافع للأنف إلى الأسفل، والذيل يضيف قوة رأسية بذراع طويل. قوة الذيل المطلوبة L_t = [W (x_cg − x_ac) + C_m q S c̄] / l_t.",
         "عندما يتقدم مركز الثقل يحتاج الذيل إلى قوة نحو الأسفل أكبر، وعندما يتأخر يحتاج قوة نحو الأعلى. تحدد زاوية الذيل المطلوبة α_t = L_t / (q S_t a_t). لهذا يضبط الطيارون ضبط الذيل قبل الإقلاع حسب مركز الثقل في ورقة التحميل، ولذلك لا يسمح بخروج المركز عن الحدود."],
  ctl:[{k:"cg",ar:"مركز الثقل",min:8,max:40,step:0.5,v:22,f:v=>nf(v,1)+" %MAC"},{k:"wf",ar:"الوزن كنسبة من MTOW",min:0.6,max:1,step:0.01,v:0.9,f:v=>nf(v,2)},{k:"V",ar:"سرعة الدوران",min:120,max:200,step:1,v:150,f:v=>nf(v,0)+" kt"},{k:"cm",ar:"عزم الجناح C_m",min:-0.25,max:-0.05,step:0.01,v:-0.12,f:v=>nf(v,2)}],
  calc(st){ const a=lac(), T=pfTail[S&&S.ac||"a380"]||pfTail.a380; st.T=T; st.q=0.5*1.225*Math.pow(st.V/KT,2); st.W=st.wf*a.mtow*G0; st.at=3.4; st.Lt=cg=>(st.W*(cg-25)/100*T.mac+st.cm*st.q*a.S*T.mac)/T.lt; st.Ltv=st.Lt(st.cg); st.al=cg=>st.Lt(cg)/(st.q*T.St*st.at)/D2R; st.alv=st.al(st.cg); st.dx=(st.cg-25)/100*T.mac; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, y=r.y+r.h*0.46, s=Math.min(r.w*0.8,r.h*1.4); lplane(g,cx,y,s,0,C); const wa=cx-0.05*s, cgp=wa+(st.cg-25)/100*s*0.07;
    ldot(g,wa,y+s*0.03,4,C.hyd); ltx(g,"مركز الرفع",wa,y+s*0.12,{s:10,rtl:true,c:C.hyd}); ldot(g,cgp,y+s*0.03,6,C.power); ltx(g,"مركز الثقل "+nf(st.cg,0)+"%",cgp,y+s*0.19,{s:11,w:600,rtl:true,c:C.power});
    larrow(g,cgp,y+s*0.03,cgp,y+s*0.03+clamp(st.W/9e6*40,12,70),C.ink,2,7); const tx=cx+0.44*s, ln=clamp(Math.abs(st.Ltv)/st.W*s*7+8,8,s*0.2); larrow(g,tx,y+s*0.03,tx,y+s*0.03+(st.Ltv>0?-ln:ln),st.Ltv>0?C.hyd:C.power,2.4,8);
    ltx(g,"قوة الذيل "+nf(st.Ltv/1000,1)+" kN "+(st.Ltv>=0?"لأعلى":"لأسفل"),r.x+r.w*0.5,r.y+r.h*0.1,{s:13,w:700,rtl:true}); ltx(g,"زاوية الذيل المطلوبة "+nf(st.alv,2)+"°",r.x+r.w*0.5,r.y+r.h*0.9,{s:13,w:600,rtl:true,c:C.muted}); },
  plot(st){ return {x:[8,40],y:[-10,10],xl:"مركز الثقل MAC%",yl:"زاوية الذيل °",curves:[{f:st.al,c:"hyd"}],hl:[{y:0,c:"muted",t:""}],vl:[{x:12,c:"power",t:"حد أمامي مثال"},{x:32,c:"power",t:"حد خلفي مثال"}],band:[{x0:8,x1:12,c:"power",a:0.1},{x0:32,x1:40,c:"power",a:0.1}],dots:[{x:st.cg,y:clamp(st.alv,-10,10),c:"power"}]}; },
  ro(st){ return [["الضغط الديناميكي",nf(st.q,0)+" Pa"],["بعد مركز الثقل عن الرفع",nf(st.dx,2)+" m"],["قوة الذيل",nf(st.Ltv/1000,1)+" kN"],["زاوية الذيل",nf(st.alv,2)+"°"],["ذراع الذيل",nf(st.T.lt,1)+" m"]]; },
  eq:["L_t = [ W (x_cg − x_ac) + C_m q S c̄ ] / l_t","α_t = L_t / (q S_t a_t)"],
  note:["الحدود الأمامية والخلفية في الرسم أمثلة لا تخص طائرة بعينها. الحدود الفعلية في دليل الطائرة وتتغير مع الوزن.","النموذج يهمل تأثير الهواء النازل خلف الجناح وفعالية المصعد، ويستخدم a_t = 3.4 لكل راديان."],
  quiz:[{q:"عند تقدم مركز الثقل، الذيل يحتاج:",o:["قوة أكبر نحو الأسفل","قوة نحو الأعلى","لا شيء"],a:0,why:"الثقل أمام مركز الرفع يعطي عزماً مائلاً للأنف، فتوازنه قوة ذيل لأسفل."},
        {q:"لماذا توجد حدود لمركز الثقل؟",o:["حتى يبقى الذيل قادراً على الموازنة والتحكم","لتوفير الوقود فقط","للراحة"],a:0,why:"تجاوز الحد يستنفد قدرة المصعد أو الذيل."}],
  show:{ar:"اعرض محرك الذيل الأفقي",fn:()=>lrnSel("ths_actuator")},
  ref:"الموضوع: الاتزان الطولي والتحكم بالموازنة (Longitudinal Trim)."
});
/* ---- 22 ---- */
LK("prf",{
  ar:"السرعة الدنيا للتحكم VMC بمحرك معطل", en:"Minimum control speed with one engine inoperative",
  alt:"طائرة من أعلى بمحرك معطّل يتولد منه عزم انعراج ودفة تقاومه، ومنحنى عزم الدفة مع السرعة وتقاطعه مع العزم غير المتناظر",
  intro:["عندما يتعطل محرك يبقى المحرك الآخر يدفع على جانب واحد فيدير الطائرة نحو المحرك المعطل: عزم الانعراج N = T·y (يضاف إليه سحب المروحة المعطلة). تقاوم الدفة هذا العزم بقوة جانبية على الذيل، وعزمها يتناسب مع مربع السرعة: N_rudder = ½ρV²·S_f·C_Y·l_f.",
         "السرعة التي تتعادل عندها الدفة عند أقصى انحراف مع العزم هي VMC. تحتها تفقد الطائرة التحكم الاتجاهي. لذلك يجب أن تكون سرعة الإقلاع بعد القرار V₂ أعلى من VMC بهامش، وكلما بعد المحرك عن المحور زاد العزم، وكلما زاد الدفع زاد VMC."],
  ctl:[{k:"T",ar:"دفع المحرك الواحد",min:80,max:350,step:5,v:121,f:v=>nf(v,0)+" kN"},{k:"y",ar:"بعد المحرك عن المحور",min:3,max:32,step:0.1,v:5.7,f:v=>nf(v,1)+" m"},{k:"Sf",ar:"مساحة الذيل العمودي",min:15,max:130,step:1,v:26,f:v=>nf(v,0)+" m²"},{k:"lf",ar:"ذراع الذيل العمودي",min:10,max:35,step:0.5,v:16.5,f:v=>nf(v,1)+" m"},{k:"cy",ar:"أقصى معامل قوة جانبية",min:0.3,max:1,step:0.01,v:0.65,f:v=>nf(v,2)},{k:"kw",ar:"سحب المروحة المعطلة",min:0,max:0.3,step:0.01,v:0.15,f:v=>nf(v,2)+" T"}],
  pre:[{ar:"737 تقريباً",set:{T:121,y:5.7,Sf:26,lf:16.5}},{ar:"A380 محرك خارجي",set:{T:310,y:29,Sf:122,lf:30}}],
  calc(st){ st.Nas=st.T*1000*(1+st.kw)*st.y; st.mr=V=>0.5*1.225*V*V*st.Sf*st.cy*st.lf; st.Vm=Math.sqrt(2*st.Nas/(1.225*st.Sf*st.cy*st.lf)); st.Vk=st.Vm*KT; st.mrk=vk=>st.mr(vk/KT)/1000; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.5, L=r.h*0.38, b=Math.min(r.w*0.4,r.h*0.45), flick=Math.sin(st.t*3)*0.02; g.save(); g.translate(cx,cy); g.rotate(flick); g.fillStyle=mixC(C.panel,C.struct,0.4); g.strokeStyle=C.ink; g.lineWidth=1.3; g.beginPath(); g.ellipse(0,0,L*0.07,L,0,0,Math.PI*2); g.fill(); g.stroke(); g.beginPath(); g.moveTo(0,-L*0.2); g.lineTo(b,L*0.12); g.lineTo(b,L*0.2); g.lineTo(0,L*0.08); g.lineTo(-b,L*0.2); g.lineTo(-b,L*0.12); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(0,L*0.82); g.lineTo(b*0.34,L*0.95); g.lineTo(b*0.34,L*1.0); g.lineTo(0,L*0.93); g.lineTo(-b*0.34,L*1.0); g.lineTo(-b*0.34,L*0.95); g.closePath(); g.fill(); g.stroke(); const ex=b*clamp(st.y/32,0.15,0.9)*0.9, ey=L*0.05;
    g.fillStyle=mixC(C.panel,C.muted,0.4); g.fillRect(-ex-8,ey-14,16,28); g.strokeRect(-ex-8,ey-14,16,28); g.fillStyle=mixC(C.panel,C.power,0.8); g.fillRect(ex-8,ey-14,16,28); g.strokeRect(ex-8,ey-14,16,28); ltx(g,"معطّل",-ex,ey+26,{s:10,rtl:true,c:C.muted}); larrow(g,ex,ey+30,ex,ey-30-Math.min(40,st.T/10),C.power,2.6,9);
    larrow(g,0,L*0.92,-b*0.5,L*0.92,C.hyd,2.6,9); g.restore(); ltx(g,"VMC ≈ "+nf(st.Vk,0)+" kt",r.x+r.w*0.5,r.y+r.h*0.07,{s:16,w:700,m:true}); ltx(g,"عزم الانعراج "+nf(st.Nas/1000,0)+" kN·m",r.x+r.w*0.5,r.y+r.h*0.93,{s:12,rtl:true,c:C.muted}); },
  plot(st){ const mx=Math.max(st.mrk(230),st.Nas/1000)*1.05; return {x:[80,230],y:[0,mx],xl:"السرعة kt",yl:"العزم kN·m",curves:[{f:st.mrk,c:"hyd"}],hl:[{y:st.Nas/1000,c:"power",t:"العزم غير المتناظر"}],vl:[{x:st.Vk,c:"muted",t:"VMC"}],dots:[{x:st.Vk,y:st.Nas/1000,c:"power"}]}; },
  ro(st){ return [["العزم غير المتناظر",nf(st.Nas/1000,0)+" kN·m"],["VMC",nf(st.Vk,0)+" kt"],["VMC",nf(st.Vm,1)+" m/s"],["عزم الدفة عند 150 kt",nf(st.mrk(150),0)+" kN·m"]]; },
  eq:["N = T (1 + k_w) y","N_rudder = ½ ρ V² S_f C_Y l_f","V_MC = √( 2 N / (ρ S_f C_Y l_f) )"],
  note:["VMC المعتمد يُقاس بالاختبار ويتغير مع الارتفاع والحرارة والوزن وزاوية الميل. هذا نموذج توضيحي للهندسة.","في الطيران الحقيقي يراعى أن تكون V₁ وV_R وV₂ أعلى من V_MCG وV_MCA بهوامش محددة."],
  quiz:[{q:"زيادة دفع المحرك السليم تجعل VMC:",o:["أعلى","أدنى","كما هو"],a:0,why:"العزم أكبر فيلزم ضغط ديناميكي أكبر."},
        {q:"ما أثر مساحة ذيل عمودي أكبر؟",o:["VMC أدنى","VMC أعلى","لا أثر"],a:0,why:"عزم الدفة أكبر عند نفس السرعة."}],
  show:{ar:"اعرض الذيل العمودي",fn:()=>lrnSel("fin")},
  ref:"الموضوع: السرعات الدنيا للتحكم (Minimum Control Speeds)."
});
/* ---- 23 ---- */
LK("prf",{
  ar:"اختيار الجنيحات الخلفية للإقلاع", en:"Takeoff flap setting trade-off",
  alt:"جناح بقلاب بزوايا مختلفة، ومنحنيان لمسافة الإقلاع وميل الصعود بمحرك واحد مع زاوية القلاب",
  intro:["القلاب الأكبر يزيد C_Lmax فتقل سرعة الإقلاع وتقصر مسافة الجري. لكنه يزيد السحب فيقل ميل الصعود بعد تعطل محرك. لا يوجد إعداد 'أفضل' دائماً: على مدرج قصير نختار قلاباً أكبر، وعلى مدرج طويل مع عوائق بعد الإقلاع نختار قلاباً أصغر.",
         "ميل الصعود بعد المحرك المعطل γ = T_oei/W − C_D/C_L عند V₂ = 1.2 V_s. ويشترط أن يبلغ نحو 2.4% (محركان) أو 3.0% (أربعة محركات) على الأقل. هذا الشرط وطول المدرج هما الحدّان اللذان يختار بينهما القلاب."],
  ctl:[{k:"fd",ar:"زاوية القلاب",min:0,max:30,step:1,v:15,f:v=>nf(v,0)+"°"},{k:"wf",ar:"الوزن من MTOW",min:0.6,max:1,step:0.01,v:0.9,f:v=>nf(v,2)},{k:"dI",ar:"الحرارة فوق المعيارية",min:-10,max:40,step:1,v:15,f:v=>nf(v,0)+" °C"}],
  pre:[{ar:"قلاب صغير",set:{fd:5}},{ar:"قلاب كبير",set:{fd:25}}],
  calc(st){ const a=lac(), n=a.n==="A380"?4:2, rho=101325/(287.05*(288.15+st.dI)), k=1/(Math.PI*(a.b*a.b/a.S)*a.e); st.n=n; st.req=n===4?3.0:2.4; st.ev=(fd)=>{ const CLm=1.45+0.035*fd, W=st.wf*a.mtow*G0, Vs=Math.sqrt(2*W/(rho*a.S*CLm)), V2=1.2*Vs, Vl=1.2*Vs, CL2=CLm/1.44, cd0=0.021+0.0004*fd, CD=cd0+0.005+k*CL2*CL2, T=a.T0*Math.pow(rho/1.225,0.8), Toei=T*0.75*(n-1)/n, gam=Toei/W-CD/CL2; const q=0.5*rho*0.49*Vl*Vl, Dg=q*a.S*(cd0+0.07+k*0.6*0.6), ac=(T*0.88-Dg-0.02*(W-q*a.S*0.6))/(W/G0), S=(Vl*Vl/(2*Math.max(0.3,ac))+Vl*4)*1.15; return {CLm,Vs,V2,gam:gam*100,S}; }; st.e=st.ev(st.fd); st.gok=st.e.gam>=st.req; const s0=st.ev(0).S, s30=st.ev(30).S, g0=st.ev(0).gam, g30=st.ev(30).gam; st.sn=fd=>(st.ev(fd).S-s30)/(s0-s30); st.gn=fd=>(st.ev(fd).gam-g30)/(g0-g30); },
  scene(g,r,st,C){ const x0=r.x+r.w*0.12, y=r.y+r.h*0.4, ch=r.w*0.5; g.fillStyle=mixC(C.panel,C.struct,0.45); g.strokeStyle=C.ink; g.lineWidth=1.4; g.beginPath(); g.moveTo(x0,y); g.quadraticCurveTo(x0+ch*0.2,y-r.h*0.1,x0+ch*0.72,y-r.h*0.015); g.lineTo(x0+ch*0.72,y+r.h*0.015); g.quadraticCurveTo(x0+ch*0.2,y+r.h*0.04,x0,y); g.closePath(); g.fill(); g.stroke();
    const fx=x0+ch*0.72, a=st.fd*D2R; g.save(); g.translate(fx,y); g.rotate(a); g.fillStyle=mixC(C.panel,C.ctrl,0.6); g.fillRect(0,-3,ch*0.28,7); g.strokeRect(0,-3,ch*0.28,7); g.restore(); for(let i=0;i<7;i++){ const f=(st.t*0.5+i/7)%1, px=x0-14+f*(ch+60), dy=(i-3)*8; const dd=px>fx?Math.sin(a)*(px-fx)*0.9:0; ldot(g,px,y+dy+dd*(dy>0?0.6:1),1.8,C.hyd,0.8); }
    ltx(g,"زاوية القلاب "+nf(st.fd,0)+"°",x0+ch*0.5,y-r.h*0.2,{s:13,w:700,rtl:true}); ltx(g,"C_Lmax "+nf(st.e.CLm,2)+"  ·  V_s "+nf(st.e.Vs*KT,0)+" kt  ·  V₂ "+nf(st.e.V2*KT,0)+" kt",r.x+r.w*0.5,r.y+r.h*0.66,{s:12,m:true,c:C.muted}); ltx(g,"المدرج التقديري "+nf(st.e.S,0)+" m",r.x+r.w*0.5,r.y+r.h*0.78,{s:13,w:600,rtl:true}); ltx(g,"ميل الصعود "+nf(st.e.gam,1)+" % مقابل "+nf(st.req,1)+" %",r.x+r.w*0.5,r.y+r.h*0.9,{s:13,w:700,rtl:true,c:st.gok?C.hyd:C.power}); },
  plot(st){ return {x:[0,30],y:[0,1],xl:"زاوية القلاب °",yl:"قيمة نسبية",curves:[{f:st.sn,c:"hyd"},{f:st.gn,c:"power"}],leg:[{c:"hyd",t:"المدرج"},{c:"power",t:"ميل الصعود"}],dots:[{x:st.fd,y:st.sn(st.fd),c:"hyd"},{x:st.fd,y:st.gn(st.fd),c:"power"}]}; },
  ro(st){ return [["C_Lmax",nf(st.e.CLm,2)],["سرعة الانهيار",nf(st.e.Vs*KT,0)+" kt"],["المدرج التقديري",nf(st.e.S,0)+" m"],["ميل الصعود بمحرك معطل",nf(st.e.gam,1)+" %"],["الحد الأدنى",nf(st.req,1)+" %"],["الحالة",st.gok?"يحقق الحد":"لا يحقق الحد"]]; },
  eq:["C_Lmax ≈ 1.45 + 0.035 δ_f","V₂ = 1.2 V_s","γ = T_oei / W − C_D / C_L"],
  note:["الأرقام المبسطة تظهر الاتجاه: القلاب يقلل V_s لكنه يرفع C_D. معادلات C_Lmax وC_D تقريبية لطائرة نموذجية.","اختيار القلاب في الواقع يتبع جداول الأداء المعتمدة وحدود الضجيج والمدرج والعوائق."],
  quiz:[{q:"ما أثر زيادة القلاب على مسافة الجري؟",o:["تقصر","تطول","لا تتغير"],a:0,why:"C_Lmax يرتفع فتنخفض سرعة الإقلاع."},
        {q:"وما أثرها على ميل الصعود بمحرك معطل؟",o:["ينقص","يزيد","لا يتغير"],a:0,why:"السحب يزداد."}],
  show:{ar:"اعرض القلابات",fn:()=>lrnSel("flaps",0.5)},
  ref:"الموضوع: اختيار إعداد الإقلاع (Takeoff Flap Selection)."
});
/* ---- 24 ---- */
LK("prf",{
  ar:"انسداد أنبوب بيتو: عندما يتصرف المقياس كمقياس ارتفاع", en:"Blocked pitot tube",
  alt:"أنبوب بيتو مسدود بجليد ومقياس سرعة، ومنحنى السرعة المؤشرة مع الارتفاع بعد الانسداد",
  intro:["مؤشر السرعة يقيس الفرق بين الضغط الكلي من أنبوب بيتو والضغط الساكن. إذا انسد مدخل أنبوب بيتو بالجليد وانسد ثقب التصريف أيضاً، يبقى في الأنبوب ضغط محبوس ثابت. حين تصعد الطائرة ينخفض الضغط الساكن فيرتفع الفرق، فيزيد المؤشر رغم ثبات السرعة الحقيقية، وكأنه مقياس ارتفاع.",
         "وعند الهبوط يحدث العكس ويقل المؤشر. أما إذا بقي ثقب التصريف مفتوحاً فيتسرب الضغط المحبوس وينخفض المؤشر نحو الصفر. الخطر هنا أن قراءة السرعة تتناقض مع بقية القرائن، فيجب تمييز العطل بالمقارنة بين المصادر واتباع إجراءات السرعة غير الموثوقة."],
  ctl:[{k:"h0",ar:"الارتفاع عند الانسداد",min:0,max:40000,step:500,v:8000,f:v=>nf(v,0)+" ft"},{k:"i0",ar:"السرعة المؤشرة عند الانسداد",min:150,max:350,step:5,v:250,f:v=>nf(v,0)+" kt"},{k:"hn",ar:"الارتفاع الحالي",min:0,max:41000,step:500,v:30000,f:v=>nf(v,0)+" ft"}],
  tog:[{k:"dr",ar:"ثقب التصريف مفتوح",v:false}],
  calc(st){ const FT=0.3048, a0=340.294, ps0=isa(st.h0*FT).p, qc0=101325*(Math.pow(1+0.2*Math.pow(st.i0/KT/a0,2),3.5)-1); st.pt=ps0+qc0; st.ind=h=>{ if(st.dr) return 0; const qc=st.pt-isa(h*FT).p; if(qc<=0) return 0; return a0*Math.sqrt(5*(Math.pow(qc/101325+1,2/7)-1))*KT; }; st.v=st.ind(st.hn); st.err=st.v-st.i0; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.28, cy=r.y+r.h*0.5, R=Math.min(r.w*0.2,r.h*0.34); kGauge(g,cx,cy,R,st.v,0,600,C,{step:100,labels:true,label:"kt",val:nf(st.v,0)+" kt"}); const tx=r.x+r.w*0.55, ty=r.y+r.h*0.46; g.fillStyle=mixC(C.panel,C.struct,0.7); g.strokeStyle=C.ink; g.lineWidth=1.3; g.beginPath(); g.moveTo(tx,ty-7); g.lineTo(tx+r.w*0.3,ty-9); g.lineTo(tx+r.w*0.3,ty+9); g.lineTo(tx,ty+7); g.closePath(); g.fill(); g.stroke();
    g.fillStyle=mixC(C.panel,C.hyd,0.8); g.fillRect(tx-6,ty-8,10,16); g.strokeRect(tx-6,ty-8,10,16); ltx(g,"جليد",tx-12,ty-20,{s:11,rtl:true,c:C.hyd}); for(let i=0;i<5;i++){ const f=(st.t*0.8+i/5)%1; larrow(g,tx-60+f*40,ty-16+i*8,tx-12+f*40,ty-16+i*8,C.muted,1.2,5); }
    ltx(g,"الضغط الكلي المحبوس "+nf(st.pt/1000,1)+" kPa",tx+r.w*0.15,ty+34,{s:11,rtl:true}); ltx(g,st.dr?"التصريف مفتوح: المؤشر ينهار":(Math.abs(st.err)>8?(st.err>0?"المؤشر أعلى من الحقيقة بـ ":"المؤشر أدنى من الحقيقة بـ ")+nf(Math.abs(st.err),0)+" kt":"لا فرق ظاهر"),r.x+r.w*0.5,r.y+r.h*0.9,{s:13,w:700,rtl:true,c:C.power}); },
  plot(st){ return {x:[0,41000],y:[0,Math.max(400,st.ind(41000)*1.05,st.i0*1.1)],xl:"الارتفاع ft",yl:"السرعة المؤشرة kt",curves:[{f:st.ind,c:"power"}],hl:[{y:st.i0,c:"muted",t:"السرعة الحقيقية"}],vl:[{x:st.h0,c:"hyd",t:"الانسداد"}],dots:[{x:st.hn,y:st.v,c:"power"}]}; },
  ro(st){ return [["الضغط الكلي المحبوس",nf(st.pt/1000,1)+" kPa"],["السرعة المؤشرة الآن",nf(st.v,0)+" kt"],["الخطأ",nf(st.err,0)+" kt"],["الحالة",st.dr?"التصريف مفتوح: تنخفض إلى الصفر":st.err>8?"فوق الحقيقة بالصعود":st.err<-8?"دون الحقيقة بالهبوط":"عند ارتفاع الانسداد"]]; },
  eq:["p_t,محبوس = p_s(h₀) + q_c(V₀)","q_c,مؤشر = p_t,محبوس − p_s(h)","V_c = a₀ √{5[(q_c/p₀ + 1)^(2/7) − 1]}"],
  note:["الحالة النموذجية: أنبوب بيتو مسدود من الخارج وثقب التصريف مسدود أيضاً. تُسخَّن أنابيب بيتو وتُغطّى على الأرض لمنع هذا.","عند ظهور اختلاف بين المؤشرات يتبع الطاقم إجراء 'السرعة غير الموثوقة': وضع دفع وميل معروفين بدل الاعتماد على السرعة."],
  quiz:[{q:"عند الصعود بأنبوب بيتو مسدود (التصريف مغلق) يزداد المؤشر لأن:",o:["الضغط الساكن ينخفض والكلي محبوس ثابت","السرعة الحقيقية تزداد","الحرارة ترتفع"],a:0,why:"الفرق q_c = p_t − p_s يزداد."},
        {q:"لماذا يوجد ثقب تصريف؟",o:["لتفريغ الماء المتجمع في الأنبوب","لزيادة الضغط","لتبريد الأنبوب"],a:0,why:"ويمنع تجمع الماء الذي قد يتجمد."}],
  show:{ar:"اعرض مسبار بيتو",fn:()=>lrnSel("pitot_probe")},
  ref:"الموضوع: نظام بيانات الهواء (Pitot-Static System)."
});
/* ---- 25 ---- */
LK("prf",{
  ar:"سرعة المناورة VA وعلاقتها بالوزن", en:"Manoeuvring speed and weight",
  alt:"مقياس سرعة عليه علامات الانهيار والمناورة وسرعة الاضطراب، ومنحنى VA مع الوزن",
  intro:["سرعة المناورة VA هي السرعة التي يصل عندها الجناح إلى انهياره قبل أن يتجاوز الحمل الأقصى المسموح. VA = V_s √n_lim، حيث V_s سرعة الانهيار وn_lim الحد الأقصى لعامل الحمل (نحو 2.5 g للمدنية الكبيرة). تحتها يؤدي أي تحريك كامل للمقود إلى انهيار الجناح قبل تلف الهيكل.",
         "V_s تزداد مع الوزن (V_s ∝ √W)، فتزداد VA مع الوزن أيضاً. لذلك في طائرة خفيفة تكون VA أقل. في الاضطراب الشديد تُحدَّد سرعة خاصة للدخول (مثل 280 عقدة أو ماخ 0.76 تقريباً) تختلف عن VA، وهي تعتمد على الإجراء المعتمد."],
  ctl:[{k:"wf",ar:"الوزن من MTOW",min:0.5,max:1,step:0.01,v:0.8,f:v=>nf(v,2)},{k:"n",ar:"أقصى عامل حمل",min:2,max:3.8,step:0.1,v:2.5,f:v=>nf(v,1)+" g"},{k:"cm",ar:"C_Lmax نظيف",min:1.2,max:1.9,step:0.01,v:1.45,f:v=>nf(v,2)},{k:"hf",ar:"الارتفاع",min:0,max:40000,step:1000,v:10000,f:v=>nf(v,0)+" ft"}],
  calc(st){ const a=lac(); st.Vs=w=>Math.sqrt(2*w*a.mtow*G0/(1.225*a.S*st.cm))*KT; st.Va=w=>st.Vs(w)*Math.sqrt(st.n); st.vs=st.Vs(st.wf); st.va=st.Va(st.wf); const rho=isa(st.hf*0.3048).rho; st.tas=st.va/KT*Math.sqrt(1.225/rho)*KT; st.mach=st.tas/KT/isa(st.hf*0.3048).a; st.vra=280; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.06, x1=r.x+r.w*0.94, y=r.y+r.h*0.5, mx=420, X=v=>x0+(x1-x0)*v/mx; g.fillStyle=mixC(C.panel,C.ink,0.08); g.fillRect(x0,y-8,x1-x0,16); g.fillStyle=mixC(C.panel,C.power,0.5); g.fillRect(x0,y-8,X(st.vs)-x0,16);
    for(let v=0;v<=400;v+=50){ lline(g,[[X(v),y+8],[X(v),y+14]],C.muted,1); ltx(g,String(v),X(v),y+24,{s:10,m:true,c:C.muted}); }
    [[st.vs,"Vs","power",-30],[st.va,"VA","hyd",-30],[st.vra,"280 اضطراب","ctrl",-52]].forEach(([v,t,c,dy])=>{ lline(g,[[X(v),y-8],[X(v),y+dy+10]],KC(c,C),2); ltx(g,t+" "+nf(v,0),X(v),y+dy,{s:11,w:700,rtl:true,c:KC(c,C)}); });
    ltx(g,"VA المكافئة "+nf(st.va,0)+" kt  ·  السرعة الحقيقية "+nf(st.tas,0)+" kt  ·  ماخ "+nf(st.mach,2),r.x+r.w*0.5,r.y+r.h*0.14,{s:12,w:600,m:true}); const pulse=(Math.sin(st.t*2)+1)/2; lline(g,[[X(st.va),y+30],[X(st.va),y+50]],C.hyd,3,null,0.5+0.5*pulse); ltx(g,"تحت VA: التحريك الكامل آمن للهيكل",X(st.va)/1-0,y+66,{s:11,rtl:true,c:C.muted,a:"center"}); },
  plot(st){ return {x:[0.5,1],y:[80,Math.max(300,st.Va(1)*1.1)],xl:"الوزن من MTOW",yl:"السرعة kt",curves:[{f:st.Vs,c:"power"},{f:st.Va,c:"hyd"}],leg:[{c:"power",t:"Vs"},{c:"hyd",t:"VA"}],dots:[{x:st.wf,y:st.va,c:"hyd"}]}; },
  ro(st){ return [["سرعة الانهيار V_s",nf(st.vs,0)+" kt"],["سرعة المناورة VA",nf(st.va,0)+" kt"],["نسبة VA/V_s",nf(Math.sqrt(st.n),2)],["السرعة الحقيقية المكافئة",nf(st.tas,0)+" kt"],["VA عند MTOW",nf(st.Va(1),0)+" kt"]]; },
  eq:["V_s = √( 2 W / (ρ S C_Lmax) )","V_A = V_s √n_lim","V_A ∝ √W"],
  note:["V_A مرجع للتصميم، وليست حداً بذاته لكل تحريك للمقود؛ التحريك المنفرد الكامل للدفة ثم عكسه قد يتجاوز أحمال الذيل حتى تحت V_A.","في الطائرات الكبيرة تُعطى سرعة الاضطراب في الدليل ولا يُعتمد على V_A وحدها."],
  quiz:[{q:"تقل VA إذا:",o:["قل وزن الطائرة","زاد وزنها","ارتفع التبريد"],a:0,why:"V_s تقل بنقص الوزن."},
        {q:"VA = 1.58 V_s عندما n = 2.5 لأن:",o:["√2.5 ≈ 1.58","2.5 ÷ 1.58","1.58 = ماخ"],a:0,why:"V_A = V_s √n."}],
  ref:"الموضوع: سرعة المناورة ومخطط V–n (Manoeuvring Speed)."
});
/* ---- 26 ---- */
LK("prf",{
  ar:"سرعة الاقتراب والمضافات للرياح والهبّات", en:"Approach speed additives for wind and gusts",
  alt:"مدرج من أعلى مع سهم الريح وزاوية الريح، وسرعة الاقتراب مع المضافة، ومنحنى سرعة الاقتراب مع قوة الهبّة",
  intro:["سرعة الاقتراب V_app تساوي V_ref (1.23 V_s في هيئة الهبوط) زائداً مضافة تعوّض تقلب الرياح. القاعدة الشائعة: نصف مركبة الريح الأمامية الثابتة، زائداً كامل الفرق بين الهبّة والريح الثابتة، بحد أدنى 5 عقد وحد أقصى 20 عقدة. تحمي هذه المضافة من هبوط مفاجئ في السرعة عند انقطاع الهبّة.",
         "السرعة الأرضية عند الملامسة V_app − المركبة الأمامية. رياح خلفية جانبية تحتاج حساب مركبة الريح الجانبية V_w sin θ لمقارنتها بحدود الطائرة. زيادة السرعة تزيد مسافة الهبوط بنسبة مربع السرعة تقريباً، لذلك لا نضيف أكثر مما يلزم."],
  ctl:[{k:"Vr",ar:"سرعة V_ref",min:110,max:160,step:1,v:135,f:v=>nf(v,0)+" kt"},{k:"Wn",ar:"الريح الثابتة",min:0,max:45,step:1,v:20,f:v=>nf(v,0)+" kt"},{k:"an",ar:"زاوية الريح عن المدرج",min:0,max:90,step:1,v:30,f:v=>nf(v,0)+"°"},{k:"gu",ar:"سرعة الهبّة",min:0,max:55,step:1,v:32,f:v=>nf(v,0)+" kt"}],
  pre:[{ar:"ريح هادئة",set:{Wn:5,gu:5,an:20}},{ar:"ريح جانبية",set:{Wn:25,gu:35,an:70}}],
  calc(st){ const gu=Math.max(st.gu,st.Wn); st.hw=st.Wn*Math.cos(st.an*D2R); st.xw=st.Wn*Math.sin(st.an*D2R); st.xg=gu*Math.sin(st.an*D2R); st.gf=gu-st.Wn; st.add=clamp(Math.max(0.5*st.hw+st.gf,5),5,20); st.Va=st.Vr+st.add; st.gs=st.Va-st.hw; st.vs=st.Vr/1.23; st.mar=st.Va/st.vs; st.vaf=(w,g)=>st.Vr+clamp(Math.max(0.5*w*Math.cos(st.an*D2R)+Math.max(0,g-w),5),5,20); },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.52, L=r.h*0.7, w=r.w*0.07; g.fillStyle=mixC(C.panel,C.struct,0.4); g.fillRect(cx-w/2,cy-L/2,w,L); for(let i=0;i<10;i++) lline(g,[[cx,cy-L/2+L*i/10+6],[cx,cy-L/2+L*i/10+16]],"#fff",2);
    const dx=-Math.sin(st.an*D2R), dy=Math.cos(st.an*D2R), len=24+st.Wn*1.6; for(let i=0;i<5;i++){ const f=(st.t*0.3+i/5)%1, bx=cx+r.w*0.3-(i%2)*r.w*0.1, by=r.y+r.h*0.2+i*r.h*0.1; larrow(g,bx+dx*f*60,by+dy*f*60,bx+dx*(f*60+len),by+dy*(f*60+len),C.hyd,1.8,7); }
    g.save(); g.translate(cx,cy+L*0.12); g.fillStyle=C.ink; g.beginPath(); g.moveTo(0,-14); g.lineTo(6,10); g.lineTo(0,6); g.lineTo(-6,10); g.closePath(); g.fill(); lline(g,[[-14,0],[14,0]],C.ink,3); g.restore();
    ltx(g,"V_app = "+nf(st.Va,0)+" kt  (مضافة "+nf(st.add,0)+")",r.x+r.w*0.5,r.y+r.h*0.07,{s:14,w:700,m:true}); ltx(g,"أمامية "+nf(st.hw,0)+"  ·  جانبية "+nf(st.xw,0)+"  ·  جانبية في الهبّة "+nf(st.xg,0),r.x+r.w*0.5,r.y+r.h*0.93,{s:12,rtl:true,c:C.muted}); },
  plot(st){ return {x:[0,55],y:[st.Vr,st.Vr+22],xl:"سرعة الهبّة kt",yl:"V_app kt",curves:[{f:g=>st.vaf(st.Wn,g),c:"hyd"}],hl:[{y:st.Vr+5,c:"muted",t:"أدنى"},{y:st.Vr+20,c:"power",t:"أقصى"}],dots:[{x:Math.max(st.gu,st.Wn),y:st.Va,c:"power"}]}; },
  ro(st){ return [["المركبة الأمامية",nf(st.hw,1)+" kt"],["المركبة الجانبية",nf(st.xw,1)+" kt"],["مضافة الهبّة",nf(st.gf,0)+" kt"],["المضافة الكلية",nf(st.add,1)+" kt"],["V_app",nf(st.Va,0)+" kt"],["السرعة الأرضية",nf(st.gs,0)+" kt"]]; },
  eq:["مضافة = max( 5 ، ½ V_w cos θ + (V_gust − V_w) ) ، بحد أقصى 20","V_app = V_ref + مضافة","V_xwind = V_w sin θ"],
  note:["القاعدة هنا مثال شائع؛ كل شركة وطراز له معادلة معتمدة في الدليل. في الاقتراب إلى هبوط بهبّة جانبية يُراعى أيضاً حد الريح الجانبية المسموح.","السرعة الأرضية الأقل مع الريح الأمامية تقصّر مسافة الهبوط، لكن المضافة تمنع نقص السرعة المؤشرة عند هبة مفاجئة."],
  quiz:[{q:"هبّة 32 kt فوق ريح ثابتة 20 kt تضيف إلى V_app:",o:["12 kt من الهبّة","32 kt","لا شيء"],a:0,why:"كامل الفرق بين الهبّة والثابتة."},
        {q:"ما الحد الأقصى للمضافة في القاعدة؟",o:["20 kt","5 kt","50 kt"],a:0,why:"حتى لا تزداد مسافة الهبوط كثيراً."}],
  ref:"الموضوع: سرعات الاقتراب الإضافية للرياح (Approach Speed Additives)."
});
/* ---- 27 ---- */
LK("prf",{
  ar:"معدل النزول لمسار 3 درجات", en:"Rate of descent for a 3 degree path",
  alt:"مسار نزول بزاوية 3 درجات مع ارتفاعات كل ميل بحري، ومنحنى معدل النزول مع السرعة الأرضية لزوايا مختلفة",
  intro:["لمتابعة مسار نزول بزاوية θ بسرعة أرضية G (بالعقدة) يجب أن يكون معدل النزول V/S = G × 101.3 × tan θ قدم/دقيقة. من أجل 3° يكون تقريباً 5.3 × G، وتبسّطها القاعدة الشائعة: ضع معدل النزول = السرعة الأرضية × 5.",
         "كل ميل بحري على الأرض يعادل نزولاً قدره 6076 × tan θ قدماً، أي 318 قدماً لكل ميل عند 3°، ولهذا قاعدة 3 إلى 1 (3 أميال لكل 1000 قدم). عند ريح خلفية تزداد G فيجب زيادة معدل النزول للحفاظ على المسار."],
  ctl:[{k:"gs",ar:"السرعة الأرضية",min:90,max:200,step:1,v:140,f:v=>nf(v,0)+" kt"},{k:"th",ar:"زاوية المسار",min:2.5,max:6,step:0.1,v:3,f:v=>nf(v,1)+"°"}],
  pre:[{ar:"ريح أمامية",set:{gs:125}},{ar:"ريح خلفية",set:{gs:155}},{ar:"مسار 3.5°",set:{th:3.5}}],
  calc(st){ const t=Math.tan(st.th*D2R); st.rod=st.gs*101.27*t; st.gr=6076*t; st.rule=st.gs*5; st.t1000=1000/st.rod; st.rf=(g,th)=>g*101.27*Math.tan(th*D2R); },
  scene(g,r,st,C){ const x0=r.x+r.w*0.06, x1=r.x+r.w*0.94, gy=r.y+r.h*0.82, W=x1-x0, N=8, sx=W/N, hy=st.gr*N, sy=(r.h*0.62)/Math.max(hy,2500); g.fillStyle=mixC(C.panel,C.struct,0.35); g.fillRect(x0,gy,W,5); lline(g,[[x1,gy],[x0,gy-hy*sy]],C.hyd,2.4);
    for(let n=0;n<=N;n++){ const x=x1-n*sx, h=n*st.gr; lline(g,[[x,gy],[x,gy-h*sy]],C.line,0.8,[2,4]); ltx(g,nf(n,0)+" NM",x,gy+16,{s:10,m:true,c:C.muted}); if(n>0) ltx(g,nf(h,0)+" ft",x,gy-h*sy-10,{s:10,m:true}); }
    const f=(st.t*0.1)%1, px=x0+f*W, py=gy-(N*(1-f))*st.gr*sy; lplane(g,px,py,0.11*W,3,C,{flip:true}); ltx(g,"معدل النزول "+nf(st.rod,0)+" ft/min",r.x+r.w*0.5,r.y+r.h*0.08,{s:15,w:700,rtl:true}); ltx(g,"القاعدة (G × 5) = "+nf(st.rule,0)+"  ·  "+nf(st.gr,0)+" ft لكل NM",r.x+r.w*0.5,r.y+r.h*0.93,{s:12,rtl:true,c:C.muted}); },
  plot(st){ return {x:[90,200],y:[0,st.rf(200,6)*1.0],xl:"السرعة الأرضية kt",yl:"معدل النزول ft/min",curves:[{f:g=>st.rf(g,3),c:"hyd"},{f:g=>st.rf(g,3.5),c:"ctrl",dash:[5,3]},{f:g=>st.rf(g,4.5),c:"gear",dash:[5,3]}],leg:[{c:"hyd",t:"3°"},{c:"ctrl",t:"3.5°",dash:[5,3]},{c:"gear",t:"4.5°",dash:[5,3]}],dots:[{x:st.gs,y:st.rod,c:"power"}]}; },
  ro(st){ return [["معدل النزول",nf(st.rod,0)+" ft/min"],["القاعدة السريعة",nf(st.rule,0)+" ft/min"],["الميل لكل ميل بحري",nf(st.gr,0)+" ft"],["زمن نزول 1000 ft",nf(st.t1000,1)+" min"]]; },
  eq:["V/S = G × 6076/60 × tan θ ≈ 101.3 G tan θ","الميل لكل NM = 6076 tan θ","للمسار 3°: V/S ≈ 5.3 G"],
  note:["المعدل المحسوب لمسار ثابت في الهواء الساكن. عند ريح تتغير مع الارتفاع يتغير المعدل اللازم.","سرعة الهبوط الأعلى من V_ref تعني معدل نزول أكبر؛ لذلك تضبط مثبتات الاقتراب في الطائرات الحديثة المعدل تلقائياً."],
  quiz:[{q:"زيادة السرعة الأرضية مع بقاء المسار 3° تتطلب معدل نزول:",o:["أكبر","أقل","نفسه"],a:0,why:"V/S تتناسب مع G."},
        {q:"عند 3° كم قدماً ينزل المسار في كل ميل؟",o:["نحو 318 ft","نحو 100 ft","نحو 1000 ft"],a:0,why:"6076 × tan 3° ≈ 318."}],
  ref:"الموضوع: مسارات النزول ومعدلاتها (Descent Gradients)."
});
