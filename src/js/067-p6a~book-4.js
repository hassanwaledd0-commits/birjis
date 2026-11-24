/* ---------- Book 4: Mechanics of Flight ---------- */
LESSONS.mof.push({
  ar:"الهبوط: المسافة من 50 قدماً حتى التوقف", en:"Landing distance",
  alt:"طائرة تنزل بزاوية 3 درجات فوق عتبة المدرج على ارتفاع 50 قدماً، ثم تلامس وتفرمل حتى التوقف، مع علامة نقطة التوقف وطول المدرج المطلوب",
  intro:["مسافة الهبوط جزءان: جزء جوي من ارتفاع 50 قدماً فوق عتبة المدرج حتى ملامسة العجلات، وجزء أرضي من الملامسة حتى التوقف. سرعة الاقتراب المرجعية Vref تساوي تقريباً 1.23 من سرعة الانهيار في وضع الهبوط.",
         "على الأرض تُبطئ الطائرة الفرامل (يحدّها احتكاك الإطارات بالمدرج)، والكوابح الهوائية التي تلغي الرفع فتضغط العجلات على الأرض، وعكس الدفع. المدرج المبتل أو المتجمد يقلل الاحتكاك فتطول المسافة كثيراً."],
  ctl:[{k:"wf",ar:"الوزن (نسبة من أقصى وزن هبوط)",min:0.6,max:1,step:0.01,v:0.9,f:v=>nf(v*100,0)+"%"},{k:"mu",ar:"معامل الفرملة الفعّال",min:0.04,max:0.45,step:0.01,v:0.35,f:v=>nf(v,2)},
       {k:"elev",ar:"ارتفاع المطار",min:0,max:2500,step:50,v:0,f:v=>nf(v,0)+" m"},{k:"wind",ar:"رياح أمامية (سالب = خلفية)",min:-10,max:30,step:1,v:0,f:v=>nf(v,0)+" kt"}],
  tog:[{k:"rev",ar:"عكس الدفع",v:true},{k:"spl",ar:"الكوابح الهوائية",v:true}],
  pre:[{ar:"مدرج جاف",set:{mu:0.35}},{ar:"مدرج مبتل",set:{mu:0.18}},{ar:"جليد",set:{mu:0.06}},{ar:"مطار مرتفع",set:{elev:2200,mu:0.35}}],
  init(st){ st.ph=0; },
  calc(st){
    const m=66000*st.wf, S=124.6, rho=isa(st.elev).rho, CLmax=2.4, W=m*G0;
    st.Vs=Math.sqrt(2*W/(rho*S*CLmax)); st.Vref=1.23*st.Vs; const wnd=st.wind/KT, Vtd=0.97*st.Vref;
    st.sAir=15.24/Math.tan(3*D2R)*0.85+(st.Vref-wnd)*1.5;
    let V=Vtd, s=(Vtd-wnd)*2, t=2; const dt=0.05, CL=st.spl?0.1:0.6, CD=st.spl?0.16:0.09;
    while(V-wnd>0.5&&t<200){ const q=0.5*rho*V*V, L=q*S*CL, D=q*S*CD, Tr=st.rev&&V>31?0.12*W:0; const a=(st.mu*Math.max(0,W-L)+D+Tr)/m; s+=(V-wnd)*dt; V-=a*dt; t+=dt; }
    st.sGround=s; st.tGround=t; st.total=st.sAir+st.sGround; st.req=st.total/0.6;
  },
  step(st,dt){ st.ph=(st.ph+dt*0.12)%1.2; },
  draw(g,W,H,st,C){
    const gy=H*0.74, x0=W*0.05, x1=W*0.97, span=Math.max(st.req*1.04,2600), X=d=>x0+(d+700)/(span+700)*(x1-x0), vk=Math.min(2.6,gy*0.55/55);
    g.fillStyle=mixC(C.panel,C.ink,0.2); g.fillRect(X(0),gy,X(span)-X(0),9);
    for(let d=0;d<=span;d+=500){ lline(g,[[X(d),gy+9],[X(d),gy+15]],C.muted,1); ltx(g,nf(d,0),X(d),gy+25,{c:C.muted,s:9,m:true}); }
    ltx(g,"m",X(span),gy+38,{c:C.muted,s:9,m:true});
    lline(g,[[X(-700),gy-(15.24+700*Math.tan(3*D2R))*vk],[X(0),gy-15.24*vk]],C.muted,1,[3,4]); ltx(g,"50 ft",X(0)-4,gy-15.24*vk-10,{c:C.muted,s:9,m:true,a:"right"});
    lline(g,[[X(st.total),gy-10],[X(st.total),gy+9]],C.power,2.5); ltx(g,"التوقف",X(st.total),gy-18,{c:C.power,s:10,w:600,rtl:true});
    lline(g,[[X(st.req),gy-34],[X(st.req),gy+9]],C.ctrl,2,[5,4]); ltx(g,"المطلوب للتخطيط",X(st.req),gy-42,{c:C.ctrl,s:10,rtl:true});
    const p=Math.min(1,st.ph); let d,hgt,pitch;
    if(p<0.35){ const f=p/0.35; d=-700+f*(700+st.sAir); hgt=d<0?15.24-d*Math.tan(3*D2R):15.24*Math.pow(1-d/st.sAir,2); pitch=d<0?2:2+3*(d/st.sAir); }
    else { const f=(p-0.35)/0.65, e=1-Math.pow(1-f,2); d=st.sAir+e*st.sGround; hgt=0; pitch=f<0.08?5-f*55:0.5; }
    const sz=Math.min(W*0.08,60), sx=X(d), sy=gy-hgt*vk-sz*0.07;
    lplane(g,sx,sy,sz,pitch,C,{flip:true});
    if(p>=0.38&&p<0.98&&st.rev) ltx(g,"عكس الدفع",sx,sy-sz*0.35,{c:C.power,s:10,rtl:true});
    ltx(g,"الجوية "+nf(st.sAir,0)+" م · الأرضية "+nf(st.sGround,0)+" م",W-12,18,{s:12,w:600,a:"right",rtl:true});
  },
  ro(st){ return [["Vref",nf(st.Vref*KT,0)+" kt"],["المسافة الجوية من 50 قدماً",nf(st.sAir,0)+" m"],["الجري على الأرض",nf(st.sGround,0)+" m ("+nf(st.tGround,0)+" s)"],["مسافة الهبوط الفعلية",nf(st.total,0)+" m"],["طول المدرج المطلوب (÷ 0.6)",nf(st.req,0)+" m"]]; },
  eq:["V_s = √(2W / (ρ S C_L,max)) ، Vref ≈ 1.23 V_s","تباطؤ الجري: a = [μ(W − L) + D + T_rev] / m","طول المدرج للتخطيط = المسافة الفعلية ÷ 0.6"],
  note:["قواعد التخطيط تشترط أن تتوقف الطائرة ضمن 60% من المدرج المتاح على مدرج جاف، ويُضاف 15% أخرى للمدرج المبتل.","الأرقام هنا لطائرة بحجم 737-800 ونموذج مبسّط (ثانيتان قبل بدء الفرملة، وعكس دفع حتى 60 عقدة)؛ الأرقام الفعلية من دليل أداء الطائرة."],
  quiz:[{q:"المدرج المبتل يطيل مسافة الهبوط لأن:",o:["Vref تزيد","احتكاك الفرامل يقل","الوزن يزيد"],a:1,why:"الماء يقلل معامل الاحتكاك بين الإطار والمدرج، فتقل قوة الفرملة."},
        {q:"الرياح الأمامية:",o:["تقصّر المسافة على الأرض","تطيلها","لا تؤثر"],a:0,why:"السرعة بالنسبة للأرض أقل، فالطاقة الحركية التي يجب تبديدها أقل."}],
  show:{ar:"اعرض الكوابح الهوائية",fn:()=>lrnSel("spoilers",1)},
  ref:"الموضوع المقابل: أداء الهبوط (Landing Performance)."
});
LESSONS.mof.push({
  ar:"مخطط V-n: حدود السرعة والحمل", en:"The V-n diagram",
  alt:"مخطط معامل الحمل مقابل السرعة: منحنى الانهيار وخط الحمل الأقصى وسرعة الغوص وخطوط الهبّات، ونقطة تتحرك داخل الحدود",
  intro:["لكل طائرة «غلاف» مسموح. عند السرعات المنخفضة يحد الانهيار معامل الحمل، وعند السرعات الأعلى تحدّه متانة الهيكل (2.5g موجباً و−1g سالباً لطائرات النقل)، وسرعة الغوص التصميمية VD هي الحد الأقصى للسرعة.",
         "يتقاطع منحنى الانهيار مع خط 2.5g عند «سرعة المناورة» VA: تحتها لا يمكن تجاوز حد الهيكل بحركة العصا لأن الجناح ينهار أولاً. وتُضاف خطوط الهبّات الهوائية لأن الاضطراب يغيّر زاوية الهجوم فجأة."],
  ctl:[{k:"ws",ar:"حمل الجناح W/S",min:40,max:800,step:5,v:560,f:v=>nf(v,0)+" kg/m²"},{k:"cl",ar:"أقصى معامل رفع (نظيف)",min:1.1,max:1.8,step:0.01,v:1.45,f:v=>nf(v,2)},
       {k:"cbar",ar:"الوتر المتوسط",min:1,max:12,step:0.1,v:4,f:v=>nf(v,1)+" m"},{k:"vc",ar:"سرعة الطيران التصميمية VC (مكافئة)",min:50,max:200,step:1,v:175,f:v=>nf(v,0)+" m/s ("+nf(v*KT,0)+" kt)"},{k:"nl",ar:"حد الحمل الموجب",min:2.5,max:6,step:0.1,v:2.5,f:v=>nf(v,1)+" g"}],
  pre:[{ar:"طائرة نقل (737)",set:{ws:560,cl:1.45,cbar:4,vc:175,nl:2.5}},{ar:"A380 (تقريبي)",set:{ws:650,cl:1.5,cbar:12,vc:175,nl:2.5}},{ar:"طائرة صغيرة",set:{ws:68,cl:1.6,cbar:1.5,vc:65,nl:3.8}}],
  init(st){ st.ph=0; },
  calc(st){ const rho=1.225, w=st.ws*G0, a=5.5; st.Vs=Math.sqrt(2*w/(rho*st.cl)); st.Va=st.Vs*Math.sqrt(st.nl); st.Vd=1.25*st.vc;
    const mu=2*st.ws/(rho*st.cbar*a), Kg=0.88*mu/(5.3+mu); st.Kg=Kg; st.gust=V=>1+rho*15.24*V*a*Kg/(2*w); st.ngc=st.gust(st.vc); st.ngd=1+(st.ngc-1)*0.5*st.Vd/st.vc; },
  step(st,dt){ st.ph+=dt*0.25; },
  draw(g,W,H,st,C){
    const r={x:W*0.1,y:H*0.1,w:W*0.84,h:H*0.72}, vmax=st.Vd*1.06, nmax=Math.max(st.nl,st.ngc)+0.6;
    const stp=vmax>150?50:20, xt=[]; for(let v=0;v<=vmax;v+=stp) xt.push(v);
    const P=lplot(g,r,[0,vmax],[-1.6,nmax],{xt,yt:[-1,0,1,2,3,4,5,6].filter(v=>v<=nmax),xl:"السرعة المكافئة (m/s)",xlr:true,yl:"n (g)"});
    const pos=[]; for(let V=0;V<=st.Va;V+=st.Va/60) pos.push([P.X(V),P.Y(Math.min(st.nl,(V/st.Vs)**2))]);
    const neg=[], Vn=st.Vs*Math.sqrt(1/0.8); for(let V=0;V<=Vn;V+=Vn/40) neg.push([P.X(V),P.Y(Math.max(-1,-0.8*(V/st.Vs)**2))]);
    const env=[...pos,[P.X(st.Va),P.Y(st.nl)],[P.X(st.Vd),P.Y(st.nl)],[P.X(st.Vd),P.Y(0)],[P.X(st.vc),P.Y(-1)],[P.X(Vn),P.Y(-1)],...neg.slice().reverse()];
    g.fillStyle=mixC(C.panel,C.ctrl,0.16); g.beginPath(); env.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])); g.closePath(); g.fill();
    lline(g,env.concat([env[0]]),C.ctrl,2);
    lline(g,[[P.X(0),P.Y(1)],[P.X(st.vc),P.Y(st.ngc)],[P.X(st.Vd),P.Y(st.ngd)]],C.power,1.4,[6,4]); lline(g,[[P.X(0),P.Y(1)],[P.X(st.vc),P.Y(2-st.ngc)],[P.X(st.Vd),P.Y(2-st.ngd)]],C.power,1.4,[6,4]);
    lline(g,[[P.X(0),P.Y(1)],[P.X(vmax),P.Y(1)]],C.line,1,[2,4]);
    [["VS",st.Vs],["VA",st.Va],["VC",st.vc],["VD",st.Vd]].forEach(([l,v],i)=>{ lline(g,[[P.X(v),P.Y(-1.6)],[P.X(v),P.Y(nmax)]],C.line,1,[2,4]); ltx(g,l,P.X(v),r.y-6-(i%2)*10,{c:C.muted,s:10,m:true}); });
    const V=st.Vs+(st.vc-st.Vs)*(0.5+0.45*Math.sin(st.ph)), nlim=Math.min(st.nl,(V/st.Vs)**2), sw=Math.sin(st.ph*2.3), n=1+(nlim-1)*0.85*Math.max(0,sw)-0.6*Math.max(0,-sw);
    ldot(g,P.X(V),P.Y(n),6,C.accent);
    ltx(g,"خطوط الهبّات",P.X(st.vc)-6,P.Y(st.ngc)-12,{c:C.power,s:10,a:"right",rtl:true});
  },
  ro(st){ return [["سرعة الانهيار VS (1g)",nf(st.Vs*KT,0)+" kt"],["سرعة المناورة VA",nf(st.Va*KT,0)+" kt"],["سرعة الغوص VD ≈ 1.25 VC",nf(st.Vd*KT,0)+" kt"],["حمل الهبّة عند VC",nf(st.ngc,2)+" g"]]; },
  eq:["على منحنى الانهيار: n = ½ ρ V² C_L,max / (W/S)","V_A = V_S · √n_limit","هبّة: Δn = ρ₀ U_de V a K_g / (2 W/S) ، و K_g = 0.88μ/(5.3+μ)"],
  note:["لطائرات النقل حد الحمل الموجب 2.5g تقريباً، والهيكل مصمم ليتحمّل 1.5 ضعف هذا الحد دون انهيار (معامل الأمان).","الطائرة الأخف (W/S أصغر) تتأثر بالهبّات أكثر، لذلك ترتج الطائرات الصغيرة أكثر في الاضطراب.","السرعات هنا مكافئة عند سطح البحر، وسرعة الهبّة 50 قدماً/ثانية عند VC."],
  quiz:[{q:"تحت سرعة المناورة VA، سحب العصا بقوة يؤدي إلى:",o:["كسر الجناح","انهيار الجناح قبل بلوغ حد الحمل","لا شيء"],a:1,why:"عند السرعة المنخفضة يبلغ الجناح أقصى رفع قبل أن يصل الحمل إلى حد الهيكل."},
        {q:"لماذا تتأثر الطائرات ذات حمل الجناح المنخفض بالهبّات أكثر؟",o:["لأن Δn يتناسب عكسياً مع W/S","لأنها أبطأ","لأن أجنحتها أقصر"],a:0,why:"نفس التغيّر في الرفع يُقسم على وزن أقل لكل متر مربع."}],
  show:{ar:"اعرض صندوق الجناح",fn:()=>lrnSel("wingbox",1)},
  ref:"الموضوع المقابل: غلاف الطيران ومخطط V-n (Flight Envelope, V-n Diagram)."
});
