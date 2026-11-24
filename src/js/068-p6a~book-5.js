/* ---------- Book 5: Aircraft Structures ---------- */
LESSONS.str.push({
  ar:"الكلال (Fatigue): منحنى S-N وقاعدة ماينر", en:"Fatigue: S-N curve and Miner's rule",
  alt:"منحنى الإجهاد مقابل عدد الدورات على مقياس لوغاريتمي، ومقطع جسم طائرة ينتفخ مع كل رحلة، وشريط ضرر يمتلئ، وشق صغير يظهر عند زاوية نافذة",
  intro:["المعدن يتلف من التكرار حتى لو كان الإجهاد أقل بكثير من حد الكسر. كل رحلة تضغط المقصورة ثم تفرغها، فيتمدد الجسم ويعود: هذه «دورة» واحدة. منحنى S-N يعطي عدد الدورات حتى الكسر لكل مستوى إجهاد.",
         "قاعدة ماينر تجمع الضرر: كل دورة تستهلك جزءاً قدره 1/N من العمر، وعندما يصل المجموع إلى 1 نتوقع ظهور شق. لذلك تُقسم النتيجة على معامل أمان، ويُفحص الهيكل دورياً لاكتشاف الشقوق مبكراً."],
  ctl:[{k:"sa",ar:"إجهاد الطوق في كل رحلة (بعيداً عن الثقوب)",min:30,max:160,step:1,v:85,f:v=>nf(v,0)+" MPa"},{k:"kt",ar:"تركيز الإجهاد عند زاوية النافذة Kt",min:1,max:4,step:0.05,v:2.2,f:v=>nf(v,2)},
       {k:"fpd",ar:"رحلات في اليوم",min:1,max:12,step:1,v:6,f:v=>nf(v,0)},{k:"sf",ar:"معامل الأمان على العمر",min:1,max:5,step:0.5,v:3,f:v=>nf(v,1)}],
  pre:[{ar:"رحلات قصيرة كثيرة (737)",set:{sa:85,kt:2.2,fpd:6,sf:3}},{ar:"رحلات طويلة (A380)",set:{sa:115,kt:2.2,fpd:2,sf:3}},{ar:"نافذة بزوايا حادة",set:{kt:3.8}}],
  init(st){ st.cyc=0; },
  calc(st){ st.smax=st.sa*st.kt; st.lgN=5.3-4*Math.log10(st.smax/190); st.N=Math.pow(10,st.lgN); st.Nd=st.N/st.sf; st.years=st.Nd/(st.fpd*365); },
  step(st,dt){ st.cyc+=dt*st.Nd/16; if(st.cyc>st.Nd*1.15) st.cyc=0; },
  draw(g,W,H,st,C){
    const r={x:W*0.1,y:H*0.1,w:W*0.48,h:H*0.7};
    const sup="⁰¹²³⁴⁵⁶⁷⁸⁹", P=lplot(g,r,[2,9],[20,600],{log:true,xt:r.w<300?[2,4,6,8]:[2,3,4,5,6,7,8,9],xf:t=>"10"+sup[t],yt:[20,50,100,200,500],xl:"عدد الدورات حتى الكسر",xlr:true,yl:"الإجهاد (MPa)"});
    const pts=[]; for(let lg=2;lg<=9;lg+=0.05){ const S=190*Math.pow(10,(5.3-lg)/4); if(S<=600) pts.push([P.X(lg),P.Y(S)]); } lline(g,pts,C.struct,2.5);
    const lx=clamp(st.lgN,2,9), ly=clamp(st.smax,20,600); ldot(g,P.X(lx),P.Y(ly),6,C.power); lline(g,[[P.X(lx),P.Y(ly)],[P.X(lx),r.y+r.h]],C.power,1,[3,3]);
    const D=st.cyc/st.Nd, fx=W*0.8, fy=H*0.4, R0=Math.min(W*0.1,H*0.22), R=R0*(1+0.03*Math.max(0,Math.sin(st.t*5)));
    g.fillStyle=mixC(C.panel,C.struct,0.25); g.strokeStyle=C.ink; g.lineWidth=1.5; g.beginPath(); g.ellipse(fx,fy,R,R*1.05,0,0,Math.PI*2); g.fill(); g.stroke();
    const wx=fx, wy=fy, ww=R0*0.28, wh=R0*0.42, rr=st.kt>3.3?1:ww*0.45;
    g.fillStyle=mixC(C.panel,C.ink,0.75); g.beginPath(); g.moveTo(wx-ww/2+rr,wy-wh/2); g.arcTo(wx+ww/2,wy-wh/2,wx+ww/2,wy+wh/2,rr); g.arcTo(wx+ww/2,wy+wh/2,wx-ww/2,wy+wh/2,rr); g.arcTo(wx-ww/2,wy+wh/2,wx-ww/2,wy-wh/2,rr); g.arcTo(wx-ww/2,wy-wh/2,wx+ww/2,wy-wh/2,rr); g.closePath(); g.fill();
    if(D>0.7){ const k=Math.min(1,(D-0.7)/0.4); lline(g,[[wx+ww/2-rr*0.3,wy-wh/2+rr*0.3],[wx+ww/2+k*R0*0.25,wy-wh/2-k*R0*0.15]],C.power,2.2); }
    ltx(g,"نافذة",wx,wy+wh/2+12,{c:C.muted,s:10,rtl:true});
    const bx=W*0.66, by=H*0.8, bw=W*0.3; g.fillStyle=mixC(C.panel,C.ink,0.08); g.fillRect(bx,by,bw,12); g.fillStyle=D<0.8?C.ctrl:C.power; g.fillRect(bx,by,bw*Math.min(1,D),12);
    ltx(g,"الضرر المتراكم D = "+nf(D,2),bx+bw,by-12,{s:12,w:600,a:"right",rtl:true});
  },
  ro(st){ return [["الإجهاد عند زاوية النافذة",nf(st.smax,0)+" MPa"],["دورات حتى الكسر (مثال)",sci(st.N,2)],["العمر التصميمي بعد معامل الأمان",sci(st.Nd,2)+" رحلة"],["بالسنوات",nf(st.years,1)+" سنة"]]; },
  eq:["قاعدة ماينر: D = Σ nᵢ / Nᵢ ، والشق متوقع عند D ≈ 1","عند الثقب: σ_max = K_t · σ","منحنى S-N تقريبي: N ∝ σ^(−m)"],
  note:["منحنى S-N هنا شكل توضيحي لسبيكة ألمنيوم حول ثقب؛ القيم الحقيقية تأتي من اختبارات المادة والهيكل.","طائرات Comet في الخمسينيات سقطت بسبب شقوق كلال بدأت من زوايا فتحات شبه مربعة في السقف. منذ ذلك الحين صارت النوافذ مستديرة الزوايا، وأصبح «التصميم المتسامح مع الضرر» قاعدة."],
  quiz:[{q:"لماذا يُحسب عمر جسم الطائرة بالرحلات لا بالساعات؟",o:["لأن ضغط المقصورة وتفريغها يحدث مرة في كل رحلة","لأن الساعات لا تُسجّل","لأن المحرك يحدد العمر"],a:0,why:"دورة الضغط تحدث مرة في كل رحلة، ولذلك تتعب طائرات الرحلات القصيرة أسرع."},
        {q:"إذا ارتفع تركيز الإجهاد Kt من 2 إلى 4:",o:["العمر ينقص قليلاً","العمر ينقص بشدة","العمر يزيد"],a:1,why:"الإجهاد يتضاعف، والعمر يتناسب مع قوة سالبة كبيرة للإجهاد (هنا الرابعة)، فينقص نحو 16 مرة."}],
  show:{ar:"اعرض تمدد الجسم بالضغط",fn:()=>lrnSel("fuse_mid",1)},
  ref:"الموضوع المقابل: الكلال وتراكم الضرر (Fatigue, Miner's Rule)."
});
LESSONS.str.push({
  ar:"تركيز الإجهاد حول الثقوب والنوافذ", en:"Stress concentration at holes and windows",
  alt:"لوح فيه ثقب بيضوي ملوّن حسب شدة الإجهاد، والأحمر عند حافتي الثقب العموديتين على الحمل، وأسهم الحمل على الطرفين",
  intro:["عندما يمر الحمل في لوح فيه ثقب، تلتف خطوط القوة حول الثقب وتتزاحم عند حافتيه، فيرتفع الإجهاد هناك. في الثقب الدائري يصل الإجهاد إلى 3 أضعاف الإجهاد البعيد.",
         "الثقب البيضوي الممدود عرضياً على اتجاه الحمل أخطر: Kt = 1 + 2a/b، أما إذا كان ممدوداً مع الحمل فيقل. وفي جسم الطائرة المضغوط إجهاد الطوق ضعف الإجهاد الطولي، فيعدّل الحمل الثاني القيمة."],
  ctl:[{k:"ab",ar:"نسبة الثقب: العرضي a ÷ الطولي b",min:0.25,max:3,step:0.05,v:1,f:v=>nf(v,2)},{k:"s",ar:"الإجهاد البعيد σ",min:20,max:150,step:1,v:90,f:v=>nf(v,0)+" MPa"}],
  tog:[{k:"bi",ar:"ضغط المقصورة (طولي = نصف الطوق)",v:false}],
  pre:[{ar:"ثقب دائري",set:{ab:1}},{ar:"شق عرضي",set:{ab:3}},{ar:"بيضوي مع الحمل",set:{ab:0.4}}],
  init(st){},
  calc(st){ st.kt=1+2*st.ab; st.kEff=st.bi?st.kt-0.5:st.kt; st.max=st.s*st.kEff; },
  step(st,dt){},
  draw(g,W,H,st,C){
    const cx=W*0.42, cy=H*0.5, pw=W*0.6, ph=H*0.66, base=Math.min(pw,ph)*0.13, a=base*Math.sqrt(st.ab), b=base/Math.sqrt(st.ab);
    const key=[st.ab,st.bi,Math.round(pw),Math.round(ph),C.ctrl,C.fuel,C.power].join("|");
    if(st._key!==key){
      const iw=Math.ceil(pw/3), ih=Math.ceil(ph/3), off=document.createElement("canvas"); off.width=iw; off.height=ih; const og=off.getContext("2d"), img=og.createImageData(iw,ih);
      const c1=hx(C.ctrl), c2=hx(C.fuel), c3=hx(C.power);
      for(let j=0;j<ih;j++) for(let i=0;i<iw;i++){
        const x=i*3-pw/2, y=j*3-ph/2, e=(x*x)/(a*a)+(y*y)/(b*b), k=4*(i+j*iw);
        if(e<1){ img.data[k+3]=0; continue; }
        const rr=Math.sqrt(e), cosT=Math.abs(x)/(a*rr), fall=Math.pow(rr,2.4), conc=1+(st.kEff-1)*cosT*cosT/fall-0.6*(1-cosT*cosT)/fall;
        const v=clamp((conc-0.7)/5,0,1), cc=v<0.5?c1.map((q,u)=>q+(c2[u]-q)*v*2):c2.map((q,u)=>q+(c3[u]-q)*(v-0.5)*2);
        img.data[k]=cc[0]; img.data[k+1]=cc[1]; img.data[k+2]=cc[2]; img.data[k+3]=235; }
      og.putImageData(img,0,0); st._off=off; st._key=key; }
    g.imageSmoothingEnabled=true; g.drawImage(st._off,cx-pw/2,cy-ph/2,pw,ph);
    g.strokeStyle=C.ink; g.lineWidth=1.5; g.strokeRect(cx-pw/2,cy-ph/2,pw,ph); g.beginPath(); g.ellipse(cx,cy,a,b,0,0,Math.PI*2); g.stroke();
    for(let i=-2;i<=2;i++){ larrow(g,cx+i*pw*0.18,cy-ph/2-3,cx+i*pw*0.18,cy-ph/2-22,C.ink,2,7); larrow(g,cx+i*pw*0.18,cy+ph/2+3,cx+i*pw*0.18,cy+ph/2+22,C.ink,2,7); }
    if(st.bi){ [-1,0,1].forEach(i=>{ larrow(g,cx-pw/2-3,cy+i*ph*0.25,cx-pw/2-18,cy+i*ph*0.25,C.muted,1.6,6); larrow(g,cx+pw/2+3,cy+i*ph*0.25,cx+pw/2+18,cy+i*ph*0.25,C.muted,1.6,6); }); }
    ldot(g,cx+a,cy,4,C.ink); ldot(g,cx-a,cy,4,C.ink);
    const lx=cx+pw/2+26; ltx(g,"σ_max",lx,H*0.36,{s:11,a:"left",m:true,c:C.muted}); ltx(g,nf(st.max,0)+" MPa",lx,H*0.36+16,{s:13,w:600,a:"left",m:true,c:C.power});
    ltx(g,"K = "+nf(st.kEff,2),lx,H*0.36+34,{s:12,a:"left",m:true});
  },
  ro(st){ return [["Kt (حمل باتجاه واحد)",nf(st.kt,2)],["أقصى إجهاد على الحافة",nf(st.max,0)+" MPa"],["المعامل الفعلي",nf(st.kEff,2)+" ×"]]; },
  eq:["ثقب دائري: σ_max = 3σ","ثقب بيضوي (a عمودي على الحمل): K_t = 1 + 2a/b","حملان σ₁ و σ₂: σ_max ≈ σ₁(1 + 2a/b) − σ₂"],
  note:["لهذا تُصنع نوافذ الطائرات بزوايا مستديرة ويُقوّى حولها الإطار بحلقة سميكة.","الشق يشبه ثقباً بيضوياً رفيعاً جداً (a كبيرة و b صغيرة جداً)، فتركيز الإجهاد عند طرفه هائل؛ لذلك يُثقب طرف الشق أحياناً (Stop-drill) لإيقاف نموه.","التلوين توضيحي، ويطابق الحل الدقيق عند حافة الثقب فقط."],
  quiz:[{q:"ثقب دائري في لوح تحت شد 100 MPa، أقصى إجهاد:",o:["100 MPa","200 MPa","300 MPa"],a:2,why:"Kt = 3 للثقب الدائري."},
        {q:"أي شكل نافذة أفضل؟",o:["مربع بزوايا حادة","مستطيل بزوايا مستديرة كبيرة","مثلث"],a:1,why:"نصف قطر الزاوية الكبير يقلل تركيز الإجهاد."}],
  show:{ar:"اعرض النوافذ",fn:()=>lrnSel("windows",1)},
  ref:"الموضوع المقابل: تركيز الإجهاد (Stress Concentrations)."
});
