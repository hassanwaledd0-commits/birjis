/* ---------- Book 3: Aircraft Design ---------- */
LESSONS.rds.push({
  ar:"تصميم عجلات الهبوط: زوايا الانقلاب وضرب الذيل", en:"Landing-gear layout: tip-back, tail-strike and overturn",
  alt:"منظر جانبي لطائرة على عجلاتها تدور للخلف حول العجلات الرئيسية حتى يلامس ذيلها الأرض، مع مركز الثقل وزاوية الانقلاب الخلفي، ومنظر علوي لمثلث العجلات",
  intro:["مكان العجلات الرئيسية بالنسبة لمركز الثقل قرار تصميمي دقيق. إذا كانت قريبة جداً من مركز الثقل قد تنقلب الطائرة على ذيلها عند تحميل الجزء الخلفي، وإذا كانت بعيدة جداً تحمل عجلة الأنف وزناً كبيراً ويصعب رفع الأنف عند الإقلاع.",
         "يقيس المصمم ثلاثة أشياء: زاوية الانقلاب الخلفي (Tip-back) يجب أن تكون أكبر من زاوية ضرب الذيل ولا تقل عن 15° تقريباً، وزاوية الانقلاب الجانبي (Overturn) يجب ألا تتجاوز نحو 63°، وعجلة الأنف تحمل عادة بين 8 و15% من الوزن."],
  ctl:[{k:"dx",ar:"العجلات الرئيسية خلف مركز الثقل",min:0.3,max:6,step:0.05,v:1.4,f:v=>nf(v,2)+" m"},{k:"h",ar:"ارتفاع مركز الثقل عن الأرض",min:1.5,max:8,step:0.05,v:2.8,f:v=>nf(v,2)+" m"},
       {k:"a",ar:"عجلة الأنف أمام مركز الثقل",min:6,max:40,step:0.1,v:14.2,f:v=>nf(v,1)+" m"},{k:"tr",ar:"المسافة بين العجلات الرئيسية",min:2,max:16,step:0.1,v:5.7,f:v=>nf(v,1)+" m"},
       {k:"ts",ar:"زاوية ضرب الذيل",min:7,max:16,step:0.1,v:11,f:v=>nf(v,1)+"°"}],
  pre:[{ar:"737-800 (تقريبي)",set:{dx:1.4,h:2.8,a:14.2,tr:5.7,ts:11}},{ar:"A380 (تقريبي)",set:{dx:2.6,h:6.2,a:30,tr:14.3,ts:13}},{ar:"عجلات قريبة جداً",set:{dx:0.5,h:3,a:14,tr:5.7,ts:11}}],
  init(st){ st.ph=0; },
  calc(st){ st.tip=Math.atan(st.dx/st.h)/D2R; st.nose=st.dx/(st.a+st.dx)*100; const y=st.a*(st.tr/2)/Math.hypot(st.a+st.dx,st.tr/2); st.over=Math.atan(st.h/y)/D2R;
    st.okTip=st.tip>=Math.max(15,st.ts); st.okNose=st.nose>=8&&st.nose<=15; st.okOver=st.over<=63; },
  step(st,dt){ st.ph+=dt; },
  draw(g,W,H,st,C){
    const gy=H*0.8, Lt=1.05*st.a+6, xN=-(st.dx+st.a+3), d=clamp(0.3*st.a+0.5,2.5,10), sc=Math.min(W*0.6/(Lt-xN),H*0.5/(st.h+d*1.6)), mx=W*0.05-xN*sc;
    lline(g,[[8,gy],[W*0.66,gy]],C.line,2);
    const rock=Math.max(0,Math.sin(st.ph*0.9))*Math.min(st.ts,st.tip)*D2R;
    const yb=Math.max(0.5,st.h-d/2), yt=yb+d, R=d/2, tsT=Math.tan(st.ts*D2R), xT=Lt*0.8, zT=xT*tsT, zE=Math.min(Lt*tsT+0.15*R,yt-0.2*R);
    const P=(x,y)=>[x*sc,-y*sc];
    g.save(); g.translate(mx,gy); g.rotate(rock);
    g.fillStyle=mixC(C.panel,C.struct,0.25); g.strokeStyle=C.ink; g.lineWidth=1.4;
    g.beginPath(); g.moveTo(...P(xN,yb+R*0.9)); g.quadraticCurveTo(...P(xN,yt),...P(xN+R*1.6,yt)); g.lineTo(...P(Lt*0.78,yt)); g.lineTo(...P(Lt*0.93,yt+d*1.3)); g.lineTo(...P(Lt,yt+d*1.3)); g.lineTo(...P(Lt,yt-0.3*R));
    g.lineTo(...P(Lt,zE)); g.lineTo(...P(xT,zT)); g.lineTo(...P(1,yb)); g.lineTo(...P(xN+R*1.6,yb)); g.quadraticCurveTo(...P(xN,yb),...P(xN,yb+R*0.9)); g.closePath(); g.fill(); g.stroke();
    const xn=-(st.dx+st.a);
    lline(g,[P(0,0.5),P(0,yb+0.2)],C.gear,3); ldot(g,0,-0.5*sc,Math.max(4,0.55*sc),C.gear); lline(g,[P(xn,0.4),P(xn,yb+0.2)],C.gear,2.5); ldot(g,xn*sc,-0.4*sc,Math.max(3,0.4*sc),C.gear);
    const cg=P(-st.dx,st.h); ldot(g,cg[0],cg[1],6,C.power); ltx(g,"CG",cg[0],cg[1]-13,{c:C.power,s:11,w:600,m:true});
    lline(g,[[0,0],cg],C.power,1.5,[4,3]); lline(g,[[0,0],[0,cg[1]]],C.muted,1,[3,3]);
    g.restore();
    ltx(g,"زاوية الانقلاب الخلفي "+nf(st.tip,1)+"°",W*0.33,gy+20,{c:st.okTip?C.ctrl:C.power,s:12,w:600,rtl:true});
    if(rock>0.02) ltx(g,"الطائرة تدور للخلف حول العجلات الرئيسية",W*0.33,18,{c:C.muted,s:11,rtl:true});
    const ox=W*0.84, oy=H*0.52, s2=Math.min(W*0.13/(st.tr/2+1),H*0.34/(st.a+st.dx));
    const N=[ox,oy-st.a*s2], Lm=[ox-st.tr/2*s2,oy+st.dx*s2], Rm=[ox+st.tr/2*s2,oy+st.dx*s2];
    g.fillStyle=mixC(C.panel,C.gear,0.12); g.beginPath(); g.moveTo(...N); g.lineTo(...Lm); g.lineTo(...Rm); g.closePath(); g.fill(); lline(g,[N,Lm,Rm,N],C.gear,1.5);
    [N,Lm,Rm].forEach(p=>ldot(g,p[0],p[1],4,C.gear)); ldot(g,ox,oy,5,C.power);
    ltx(g,"منظر علوي",ox,H-12,{c:C.muted,s:10,rtl:true}); ltx(g,"الجانبي "+nf(st.over,1)+"°",ox,18,{c:st.okOver?C.ctrl:C.power,s:12,w:600,rtl:true});
  },
  ro(st){ return [["زاوية الانقلاب الخلفي",nf(st.tip,1)+"° "+(st.okTip?"✓":"✗ (المطلوب ≥ "+nf(Math.max(15,st.ts),1)+"°)")],["حمل عجلة الأنف",nf(st.nose,1)+"% "+(st.okNose?"✓":"✗ (8–15%)")],["زاوية الانقلاب الجانبي",nf(st.over,1)+"° "+(st.okOver?"✓":"✗ (≤ 63°)")]]; },
  eq:["tan(tip-back) = Δx / h_cg","حمل الأنف ÷ W = Δx / (a + Δx)","tan(overturn) = h_cg / y ، و y أقصر مسافة من CG إلى الخط الواصل بين عجلة الأنف والعجلة الرئيسية"],
  note:["أثناء تحميل الطائرات الكبيرة تُوضع أحياناً دعامة تحت الذيل، لأن نقل الحمولة إلى الخلف قد يقلب الطائرة شبه الفارغة.","المسافة الواسعة بين عجلات A380 (أكثر من 14 م) تُبقي زاوية الانقلاب الجانبي صغيرة رغم ارتفاع مركز ثقلها."],
  quiz:[{q:"إذا قرّبت العجلات الرئيسية من مركز الثقل:",o:["يزيد حمل الأنف","تقل زاوية الانقلاب الخلفي ويسهل انقلاب الطائرة على ذيلها","تزيد زاوية الانقلاب الخلفي"],a:1,why:"tan(tip-back) = Δx/h، فتصغير Δx يصغّر الزاوية."},
        {q:"الحمل الطبيعي على عجلة الأنف تقريباً:",o:["1–3%","8–15%","40–50%"],a:1,why:"الأقل يضعف التوجيه على الأرض، والأكثر يصعّب رفع الأنف."}],
  show:{ar:"اعرض العجلات الرئيسية",fn:()=>lrnSel("gear_main",0)},
  ref:"الموضوع المقابل: تصميم جهاز الهبوط وترتيبه (Landing Gear and Subsystems)."
});
LESSONS.rds.push({
  ar:"معاملات حجم الذيل", en:"Tail volume coefficients",
  alt:"منظر علوي لطائرة بمساحات الجناح والذيل وذراع الذيل، ومقياسان لمعامل حجم الذيل الأفقي والعمودي مع النطاق المعتاد لطائرات النقل",
  intro:["في التصميم الأولي يُحدَّد حجم الذيل من «معامل الحجم»: مساحة الذيل مضروبة في بعده عن الجناح، مقسومة على مساحة الجناح ووتره (أو باعه في حالة الذيل العمودي). كلما زاد المعامل زادت قدرة الذيل على إعادة الطائرة إلى وضعها.",
         "الطائرات المتشابهة لها معاملات متقاربة، لذلك يبدأ المصمم من القيمة المعتادة لنوع الطائرة. لطائرات النقل النفاثة يكون الأفقي غالباً بين 0.8 و1.2 والعمودي بين 0.06 و0.11 تقريباً. والذيل الأبعد (ذراع أطول) يكفيه مساحة أصغر."],
  ctl:[{k:"Sw",ar:"مساحة الجناح",min:15,max:900,step:1,v:124.6,f:v=>nf(v,0)+" m²"},{k:"c",ar:"الوتر المتوسط للجناح",min:1,max:14,step:0.05,v:3.96,f:v=>nf(v,2)+" m"},
       {k:"b",ar:"باع الجناح",min:8,max:80,step:0.1,v:34.3,f:v=>nf(v,1)+" m"},{k:"Lh",ar:"ذراع الذيل الأفقي",min:3,max:40,step:0.1,v:17.7,f:v=>nf(v,1)+" m"},
       {k:"Sh",ar:"مساحة الذيل الأفقي",min:2,max:220,step:0.5,v:32.8,f:v=>nf(v,1)+" m²"},{k:"Lv",ar:"ذراع الذيل العمودي",min:3,max:40,step:0.1,v:16.5,f:v=>nf(v,1)+" m"},{k:"Sv",ar:"مساحة الذيل العمودي",min:1,max:140,step:0.5,v:26.4,f:v=>nf(v,1)+" m²"}],
  pre:[{ar:"737-800 (تقريبي)",set:{Sw:124.6,c:3.96,b:34.3,Lh:17.7,Sh:32.8,Lv:16.5,Sv:26.4}},{ar:"A380 (تقريبي)",set:{Sw:845,c:12.0,b:79.8,Lh:31,Sh:205.6,Lv:29,Sv:122.3}},{ar:"طائرة صغيرة (تقريبي)",set:{Sw:16.2,c:1.5,b:11,Lh:4.6,Sh:3.4,Lv:4.9,Sv:1.7}}],
  init(st){ st.th=0; st.om=0; st.kick=0; },
  calc(st){ st.ch=st.Lh*st.Sh/(st.c*st.Sw); st.cv=st.Lv*st.Sv/(st.b*st.Sw); st.Shreq=1.0*st.c*st.Sw/st.Lh; st.Svreq=0.09*st.b*st.Sw/st.Lv; },
  step(st,dt){ const w=2.2*Math.sqrt(Math.max(0.02,st.cv/0.09)), z=0.18*Math.min(2,st.cv/0.09); st.kick-=dt; if(st.kick<=0){ st.om=0.9; st.kick=5; } st.om+=(-w*w*st.th-2*z*w*st.om)*dt; st.th=clamp(st.th+st.om*dt,-0.8,0.8); },
  draw(g,W,H,st,C){
    const cx=W*0.3, Lf=st.Lh+st.c*1.6, s=Math.min(W*0.5/st.b,H*0.7/Lf), cy=H*0.12+st.c*s*0.5;
    const wb=st.b*s/2, wc=st.Sw/st.b*s, tb=Math.sqrt(st.Sh*4)*s/2, tc=st.Sh/Math.sqrt(st.Sh*4)*s, ty=st.Lh*s;
    g.save(); g.translate(cx,cy); g.rotate(st.th*0.25);
    g.fillStyle=mixC(C.panel,C.ink,0.15); g.fillRect(-Math.max(2,s*1.8),-wc*0.9,Math.max(4,s*3.6),ty+tc*1.1);
    g.fillStyle=mixC(C.panel,C.struct,0.3); g.strokeStyle=C.ink; g.lineWidth=1.3;
    g.beginPath(); g.moveTo(0,-wc*0.4); g.lineTo(wb,wc*0.25); g.lineTo(wb,wc*0.6); g.lineTo(0,wc*0.7); g.lineTo(-wb,wc*0.6); g.lineTo(-wb,wc*0.25); g.closePath(); g.fill(); g.stroke();
    g.fillStyle=mixC(C.panel,C.ctrl,0.35); g.beginPath(); g.moveTo(0,ty-tc*0.6); g.lineTo(tb,ty+tc*0.2); g.lineTo(tb,ty+tc*0.6); g.lineTo(-tb,ty+tc*0.6); g.lineTo(-tb,ty+tc*0.2); g.closePath(); g.fill(); g.stroke();
    g.fillStyle=C.hyd; g.fillRect(-Math.max(1.5,s*0.4),ty-tc*1.1-st.Sv/st.Sh*tc*0.4,Math.max(3,s*0.8),tc*1.5);
    g.restore();
    const lx=cx-Math.min(wb*0.5,W*0.08); lline(g,[[lx,cy],[lx,cy+ty]],C.power,1.5,[4,3]); ltx(g,"L_HT",lx-6,cy+ty*0.5,{c:C.power,s:11,m:true,a:"right"});
    const bar=(y,v,lo,hi,mx,lbl)=>{ const x0=W*0.62, w=W*0.34; g.fillStyle=mixC(C.panel,C.ink,0.07); g.fillRect(x0,y,w,14); g.fillStyle=mixC(C.panel,C.ctrl,0.45); g.fillRect(x0+w*lo/mx,y,w*(hi-lo)/mx,14);
      ldot(g,x0+w*Math.min(v,mx)/mx,y+7,6,v>=lo&&v<=hi?C.ctrl:C.power); ltx(g,lbl+" = "+nf(v,3),x0+w,y-12,{s:12,w:600,a:"right",m:true}); };
    bar(H*0.3,st.ch,0.8,1.2,1.6,"c_HT"); bar(H*0.6,st.cv,0.06,0.11,0.16,"c_VT");
    ltx(g,"الشريط الملوّن: المدى المعتاد لطائرات النقل",W*0.96,H*0.82,{c:C.muted,s:10,a:"right",rtl:true});
  },
  ro(st){ return [["معامل الذيل الأفقي c_HT",nf(st.ch,3)],["معامل الذيل العمودي c_VT",nf(st.cv,3)],["مساحة الأفقي لمعامل 1.0",nf(st.Shreq,1)+" m²"],["مساحة العمودي لمعامل 0.09",nf(st.Svreq,1)+" m²"]]; },
  eq:["c_HT = L_HT · S_HT / (c̄_W · S_W)","c_VT = L_VT · S_VT / (b_W · S_W)","S_HT = c_HT · c̄_W · S_W / L_HT"],
  note:["المعامل نقطة بداية فقط؛ بعده تأتي حسابات الاستقرار والتحكم الدقيقة. معاملات A380 هنا أقل من المعتاد، وهذا متوقع مع التحكم الإلكتروني.","في الرسم تتأرجح الطائرة بعد كل هبّة: كلما زاد معامل الذيل العمودي عادت أسرع وبتأرجح أقل.","الطائرات ذات التحكم الإلكتروني (Fly-by-wire) قد تقبل ذيلاً أصغر من المعتاد لأن الحاسوب يساعد في الاستقرار، فتوفّر وزناً وسحباً."],
  quiz:[{q:"إذا ضاعفت ذراع الذيل الأفقي مع ثبات المعامل، المساحة المطلوبة:",o:["تتضاعف","تنقص إلى النصف","لا تتغيّر"],a:1,why:"S_HT = c_HT c̄ S_W / L_HT، فالمساحة تتناسب عكسياً مع الذراع."},
        {q:"معامل الذيل العمودي يُقسم على:",o:["الوتر المتوسط","باع الجناح","طول الجسم"],a:1,why:"الذيل العمودي يقاوم الانعراج، والطول المرجعي لعزم الانعراج هو الباع."}],
  show:{ar:"اعرض الذيل الأفقي",fn:()=>lrnSel("stabilizer")},
  ref:"الموضوع المقابل: التحجيم الأولي للأسطح الخلفية (Tail Volume Coefficient)."
});
