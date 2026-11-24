/* ---------- Book 10: Theory of Flight ---------- */
LESSONS.tof.push({
  ar:"الانهيار: كيف ينفصل الهواء عن الجناح", en:"Stall: how the flow separates",
  alt:"مقطع جناح وجزيئات هواء فوقه؛ مع زيادة زاوية الهجوم ينفصل الهواء من الخلف وتتقدم نقطة الانفصال للأمام، ومنحنى الرفع يصل لقمته ثم يهبط",
  intro:["مع زيادة زاوية الهجوم يزيد الرفع تقريباً بخط مستقيم، لكن الهواء فوق الجزء الخلفي من الجناح يجب أن «يصعد» ضد ضغط متزايد. عند زاوية معينة يعجز الهواء القريب من السطح عن ذلك فينفصل ويكوّن دوامات.",
         "في المقاطع السميكة يبدأ الانفصال من الحافة الخلفية ويتقدم تدريجياً فيكون الانهيار ناعماً. في المقاطع الرقيقة قد ينفصل الهواء فجأة من الحافة الأمامية فيسقط الرفع بشدة. وعدد رينولدز الأكبر يؤخر الانفصال قليلاً."],
  ctl:[{k:"al",ar:"زاوية الهجوم",min:0,max:22,step:0.25,v:8,f:v=>nf(v,2)+"°"},{k:"re",ar:"عدد رينولدز",min:5.5,max:7.5,step:0.1,v:6.5,f:v=>sci(Math.pow(10,v),1)}],
  tog:[{k:"thin",ar:"مقطع رقيق (انهيار مفاجئ)",v:false}],
  pre:[{ar:"قبل الانهيار",set:{al:8}},{ar:"عند القمة",set:{al:15}},{ar:"بعد الانهيار",set:{al:19}}],
  init(st){ st.p=[]; for(let i=0;i<90;i++) st.p.push({u:Math.random()*1.6-0.25,li:i%9,ph:Math.random()*6}); },
  calc(st){ st.amax=(st.thin?11:15)+1.2*(st.re-6.5); const lin=a=>0.1*(a+2); st.clmax=lin(st.amax)*(st.thin?0.92:0.9);
    const a0=st.amax-4, l0=lin(a0);
    st.clF=a=>{ if(a<=a0) return lin(a); if(a<=st.amax){ const t=(a-a0)/4; return l0+(st.clmax-l0)*(1-(1-t)*(1-t)); } const d=a-st.amax; return st.thin?st.clmax*0.62-0.01*d:st.clmax-0.035*Math.pow(d,1.5); };
    st.cl=st.clF(st.al); st.xs=st.thin?(st.al>st.amax?0.03:1):clamp(1-(st.al-a0)/10,0.03,1); },
  step(st,dt){ st.p.forEach(q=>{ const slow=st.xs<1&&q.li<3&&q.u>st.xs; q.u+=dt*(slow?0.1:0.3); if(q.u>1.2) q.u=-0.25; q.ph+=dt*4; }); },
  draw(g,W,H,st,C){
    const ox=W*0.07, oy=H*0.42, ch=W*0.42, a=-st.al*D2R, th=st.thin?0.06:0.12;
    const surf=(x,up)=>{ x=clamp(x,0,1); const yt=5*th*(0.2969*Math.sqrt(x)-0.126*x-0.3516*x*x+0.2843*x**3-0.1015*x**4), yc=x<0.4?0.02/0.16*(0.8*x-x*x):0.02/0.36*(0.2+0.8*x-x*x); return yc+(up?yt:-yt); };
    const P=(x,y)=>[ox+(x*Math.cos(a)-y*Math.sin(a))*ch,oy-(x*Math.sin(a)+y*Math.cos(a))*ch];
    const sepOn=st.xs<1, DY=[0.025,0.06,0.11,0.17,0.25,0.34,0.04,0.1,0.18];
    const fy=(x,li)=>{ const up=li<6, dy=DY[li], xc=clamp(x,0,1), base=x<0.03?surf(0.03,up)*Math.max(0,1+(x-0.03)*5):surf(xc,up); if(!up) return base-dy;
      let y=base+dy; if(sepOn&&x>st.xs&&dy<0.22) y+=(x-st.xs)*0.6*(0.22-dy)/0.22; return y; };
    for(let li=0;li<9;li++){ const pts=[]; for(let x=-0.25;x<=1.2;x+=0.025){ pts.push(P(x,fy(x,li))); } lline(g,pts,mixC(C.panel,C.hyd,li<6?0.5:0.35),1.2); }
    if(sepOn){ const nv=3; for(let j=0;j<nv;j++){ const xv=st.xs+(1.15-st.xs)*(j+0.5)/nv, k=(xv-st.xs), cy0=(xv>1?surf(1,true):surf(xv,true))+0.03+k*0.14, rr=0.025+k*0.05, c=P(xv,cy0), r=rr*ch, ph=-st.t*3+j*2;
        g.save(); g.strokeStyle=C.power; g.lineWidth=1.6; g.globalAlpha=0.85; g.beginPath(); g.arc(c[0],c[1],r,ph,ph+4.4); g.stroke(); g.restore(); } }
    st.p.forEach(q=>{ const x=q.u, sep=sepOn&&q.li<3&&x>st.xs; let y=fy(x,q.li); if(sep) y+=Math.sin(q.ph)*0.025;
      const p=P(x,y); ldot(g,p[0],p[1],2.2,sep?C.power:C.hyd,0.9); });
    g.fillStyle=mixC(C.panel,C.struct,0.4); g.strokeStyle=C.ink; g.lineWidth=1.5; g.beginPath();
    for(let i=0;i<=40;i++){ const x=1-i/40, p=P(x,surf(x,true)); i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]); } for(let i=0;i<=40;i++){ const x=i/40, p=P(x,surf(x,false)); g.lineTo(p[0],p[1]); } g.closePath(); g.fill(); g.stroke();
    if(st.xs<1){ const p=P(st.xs,surf(st.xs,true)); ldot(g,p[0],p[1],5,C.power); ltx(g,"الانفصال",p[0],p[1]-16,{c:C.power,s:10,w:600,rtl:true}); }
    const r={x:W*0.62,y:H*0.12,w:W*0.34,h:H*0.64}, Pl=lplot(g,r,[0,22],[0,1.8],{xt:[0,5,10,15,20],yt:[0,0.5,1,1.5],xl:"α (°)",yl:"C_L"});
    const pts=[]; for(let x=0;x<=22;x+=0.25) pts.push([Pl.X(x),Pl.Y(clamp(st.clF(x),0,1.8))]); lline(g,pts,C.hyd,2.2); ldot(g,Pl.X(st.al),Pl.Y(clamp(st.cl,0,1.8)),6,C.power);
  },
  ro(st){ return [["C_L",nf(st.cl,2)],["C_L الأقصى",nf(st.clmax,2)+" عند "+nf(st.amax,1)+"°"],["الانفصال",st.xs<1?"يبدأ عند "+nf(st.xs*100,0)+"% من الوتر":"لا يوجد"]]; },
  eq:["قبل الانهيار: C_L ≈ 2π (α − α₀) لكل راديان","الانفصال يحدث حين يتغلب ارتفاع الضغط (dp/dx > 0) على زخم الطبقة المتاخمة"],
  note:["الأرقام والمنحنى توضيحية لشكل الانهيار، وقيم المقاطع الحقيقية تُقاس في أنفاق الرياح.","مولّدات الدوامات الصغيرة على أجنحة بعض الطائرات تخلط هواءً سريعاً داخل الطبقة المتاخمة فتؤخر الانفصال."],
  quiz:[{q:"في المقطع السميك يبدأ الانفصال عادة من:",o:["الحافة الأمامية","الحافة الخلفية","المنتصف دائماً"],a:1,why:"الضغط المتزايد على الجزء الخلفي يجعل الانفصال يبدأ من الخلف ويتقدم."},
        {q:"زيادة عدد رينولدز:",o:["تقلل C_L الأقصى","تزيد C_L الأقصى قليلاً","لا تؤثر"],a:1,why:"الطبقة المتاخمة الأكثر اضطراباً تقاوم الانفصال أكثر."}],
  show:{ar:"اعرض الشرائح الأمامية",fn:()=>lrnSel("slats",1)},
  ref:"الموضوع المقابل: الطبقة المتاخمة والانهيار (Boundary Layer and Stall)."
});
LESSONS.tof.push({
  ar:"توزيع الرفع على الباع: أين ينهار الجناح أولاً؟", en:"Spanwise lift and where the wing stalls first",
  alt:"منظر علوي لنصف جناح ملوّن حسب معامل الرفع المحلي مع علامات الانهيار، ومنحنى توزيع معامل الرفع على الباع",
  intro:["الرفع لا يتوزع بالتساوي على الباع. الجناح المستطيل يحمل معاملاً محلياً أعلى عند الجذر، والجناح المستدق كثيراً يحمل معاملاً أعلى قرب الطرف. الجزء الذي يصل أولاً إلى أقصى معامل رفع ينهار أولاً.",
         "الانهيار عند الطرف خطير لأنه يُفقد الجنيحات فعاليتها وقد يجعل الطائرة تميل فجأة. لذلك يُصمَّم الجناح بالتواء للأسفل عند الطرف (Washout) أو بشرائح أمامية خارجية، ليبدأ الانهيار من الجذر."],
  ctl:[{k:"lam",ar:"نسبة الاستدقاق (وتر الطرف ÷ وتر الجذر)",min:0.15,max:1,step:0.01,v:0.3,f:v=>nf(v,2)},{k:"tw",ar:"التواء الطرف للأسفل",min:0,max:6,step:0.1,v:2,f:v=>nf(v,1)+"°"},{k:"sw",ar:"زاوية الميلان للخلف",min:0,max:40,step:1,v:25,f:v=>nf(v,0)+"°"}],
  pre:[{ar:"مستطيل بلا التواء",set:{lam:1,tw:0,sw:0}},{ar:"مستدق جداً بلا التواء",set:{lam:0.2,tw:0,sw:30}},{ar:"طائرة نقل نموذجية",set:{lam:0.3,tw:4.5,sw:28}}],
  init(st){ st.ph=0; },
  calc(st){ const n=40, ys=[], cl=[]; let mx=-1, my=0;
    for(let i=0;i<=n;i++){ const y=i/n*0.98, c=1-(1-st.lam)*y, cav=(1+st.lam)/2, ce=4/Math.PI*cav*Math.sqrt(1-y*y), load=(c+ce)/2*(1+0.006*st.sw*(y-0.4));
      ys.push(y); cl.push(load/c-0.1*st.tw*y); }
    let area=0, ca=0; for(let i=0;i<=n;i++){ const c=1-(1-st.lam)*ys[i]; area+=cl[i]*c; ca+=c; } const avg=area/ca;
    st.ys=ys; st.cl=cl.map(v=>v/avg); st.cl.forEach((v,i)=>{ if(v>mx){ mx=v; my=ys[i]; } }); st.peak=my; st.pmax=mx; st.root=my<0.4; },
  step(st,dt){ st.ph=(st.ph+dt*0.16)%1.25; },
  draw(g,W,H,st,C){
    const ox=W*0.06, span=W*0.5, cr=H*0.3, tan=Math.tan(st.sw*D2R), top=H*0.2, CLg=0.5+Math.min(1,st.ph)*0.8, lim=1.3;
    const LE=y=>top+y*span*tan*0.6;
    for(let i=0;i<st.ys.length-1;i++){ const y0=st.ys[i], y1=st.ys[i+1], c0=1-(1-st.lam)*y0, c1=1-(1-st.lam)*y1;
      const v=st.cl[i]*CLg/lim, col=v>=1?C.power:lcmap(Math.max(0,(v-0.3)/0.7)*0.95,C);
      g.fillStyle=col; g.beginPath(); g.moveTo(ox+y0*span,LE(y0)); g.lineTo(ox+y1*span+0.5,LE(y1)); g.lineTo(ox+y1*span+0.5,LE(y1)+c1*cr); g.lineTo(ox+y0*span,LE(y0)+c0*cr); g.closePath(); g.fill();
      if(v>=1&&i%2===0) ltx(g,"✕",ox+(y0+y1)/2*span,LE(y0)+c0*cr*0.5,{c:C.panel,s:10,w:700}); }
    g.strokeStyle=C.ink; g.lineWidth=1.4; g.beginPath(); g.moveTo(ox,LE(0)); g.lineTo(ox+span*0.98,LE(0.98)); g.lineTo(ox+span*0.98,LE(0.98)+(1-(1-st.lam)*0.98)*cr); g.lineTo(ox,LE(0)+cr); g.closePath(); g.stroke();
    ltx(g,"الجذر",ox+4,top-12,{c:C.muted,s:10,a:"left",rtl:true}); ltx(g,"الطرف",ox+span,LE(0.98)-12,{c:C.muted,s:10,rtl:true});
    ltx(g,"C_L الكلي = "+nf(CLg,2),ox,H-14,{s:12,w:600,a:"left",m:true});
    const r={x:W*0.64,y:H*0.14,w:W*0.32,h:H*0.6}, P=lplot(g,r,[0,1],[0,1.8],{xt:[0,0.5,1],yt:[0,0.5,1,1.5],xl:"y / (b/2)",yl:"c_l / C_L"});
    lline(g,st.ys.map((y,i)=>[P.X(y),P.Y(clamp(st.cl[i],0,1.8))]),C.hyd,2.2); ldot(g,P.X(st.peak),P.Y(clamp(st.pmax,0,1.8)),5,C.power);
  },
  ro(st){ return [["أعلى معامل محلي عند",nf(st.peak*100,0)+"% من نصف الباع"],["أين يبدأ الانهيار",st.root?"قرب الجذر ✓ (آمن)":"نحو الطرف ✗ (خطر فقد الجنيحات)"]]; },
  eq:["تقريب شرنك: c·c_l ∝ ( c(y) + c_إهليلجي(y) ) / 2","c_l المحلي = الحمل ÷ الوتر المحلي","الالتواء للأسفل يقلل c_l عند الطرف"],
  note:["التوزيع هنا بتقريب شرنك المبسّط، ومعالجة الميلان تقريبية.","الطائرات الحديثة تجمع الاستدقاق مع التواء الطرف والشرائح الأمامية لتبقى الأطراف تعمل حتى بعد بدء الانهيار عند الجذر."],
  quiz:[{q:"الجناح المستطيل ينهار أولاً عند:",o:["الطرف","الجذر","المنتصف دائماً"],a:1,why:"الوتر ثابت والحمل أكبر قرب الجذر، فيبلغ معامله المحلي الحد أولاً."},
        {q:"الغرض من التواء الطرف للأسفل (Washout):",o:["زيادة السرعة","جعل الانهيار يبدأ من الجذر لتبقى الجنيحات فعالة","تقليل الوزن"],a:1,why:"زاوية هجوم أقل عند الطرف تؤخر وصوله إلى الانهيار."}],
  show:{ar:"اعرض الجنيحات",fn:()=>lrnSel("aileron",1)},
  ref:"الموضوع المقابل: توزيع الرفع على الباع وسلوك الانهيار (Spanwise Lift Distribution)."
});

/* keep the header's lesson count honest as lessons are added */
/* lesson count in the header is updated at the end of the last lesson file */
