/* ---------- Book 8: Fundamentals of Astrodynamics ---------- */
LESSONS.ast.push({
  ar:"الالتقاء المداري ومدار الملاحقة", en:"Rendezvous and phasing orbits",
  alt:"الأرض في الوسط ومركبة هدف تدور في مدار دائري، ومركبة ملاحِقة تنزل إلى مدار بيضوي أدنى قليلاً فتدور أسرع حتى تلحق بالهدف",
  intro:["لكي تلحق مركبة بأخرى أمامها في نفس المدار لا يكفي أن «تسرع». إذا زادت سرعتها ارتفعت إلى مدار أعلى صار دورانها فيه أبطأ فتتأخر أكثر! الحل المعاكس: تبطئ قليلاً فتنزل إلى مدار أدنى زمنه أقصر، وتدور فيه عدة دورات حتى تلحق.",
         "عندما تعود إلى نقطة البداية بعد عدد الدورات المختار تكون قد عوّضت فرق الزاوية، فتزيد سرعتها بالمقدار نفسه لتعود إلى المدار الأصلي بجانب الهدف."],
  ctl:[{k:"h",ar:"ارتفاع مدار الهدف",min:300,max:2000,step:10,v:420,f:v=>nf(v,0)+" km"},{k:"dth",ar:"تأخر الملاحِقة خلف الهدف",min:2,max:60,step:1,v:20,f:v=>nf(v,0)+"°"},{k:"k",ar:"عدد دورات الملاحقة",min:1,max:8,step:1,v:3,f:v=>nf(v,0)}],
  init(st){ st.tt=0; },
  calc(st){ const r=RE+st.h, Tt=2*Math.PI*Math.sqrt(r**3/MU), Tp=Tt*(1-st.dth/360/st.k), ap=Math.cbrt(MU*(Tp/(2*Math.PI))**2), rp=2*ap-r;
    const vc=Math.sqrt(MU/r), va=Math.sqrt(MU*(2/r-1/ap)); st.dv=2*(vc-va); st.Tt=Tt; st.Tp=Tp; st.ap=ap; st.rp=rp; st.r=r; st.e=(r-rp)/(r+rp); st.time=st.k*Tp; st.low=rp-RE; },
  step(st,dt){ st.tt+=dt*st.Tt/9; if(st.tt>st.time+st.Tt*0.4) st.tt=0; },
  draw(g,W,H,st,C){
    const cx=W*0.36, cy=H*0.52, R=Math.min(W*0.3,H*0.42), thP=Math.PI/2, nt=2*Math.PI/st.Tt, R0=R*0.62;
    /* altitude is exaggerated so the two orbits can be told apart: radius on screen grows linearly with height */
    const rd=rr=>R0+(R-R0)*(rr-RE)/(st.r-RE), scr=(x,y)=>{ const rr=Math.hypot(x,y), th=Math.atan2(y,x), d=rd(rr); return [cx+d*Math.cos(th),cy-d*Math.sin(th)]; };
    earth(g,cx,cy,R0,C); g.strokeStyle=C.line; g.lineWidth=1.2; g.setLineDash([4,4]); g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.stroke(); g.setLineDash([]);
    const a=st.ap, e=st.e, b=a*Math.sqrt(1-e*e), up=[Math.cos(thP+Math.PI),Math.sin(thP+Math.PI)], uq=[-up[1],up[0]];
    const ell=E=>{ const p=a*(Math.cos(E)-e), q=b*Math.sin(E); return scr(up[0]*p+uq[0]*q,up[1]*p+uq[1]*q); };
    const pe=[]; for(let i=0;i<=160;i++) pe.push(ell(i/160*Math.PI*2)); lline(g,pe,C.power,1.6,[5,3]);
    const tgtTh=thP+st.dth*D2R+nt*st.tt, tgt=scr(st.r*Math.cos(tgtTh),st.r*Math.sin(tgtTh));
    let ch; if(st.tt<=st.time){ const M=Math.PI+2*Math.PI*st.tt/st.Tp, E=kepE(((M%(2*Math.PI))+2*Math.PI)%(2*Math.PI),e); ch=ell(E); }
    else { const th=thP+nt*(st.tt-st.time)-0.6*D2R; ch=scr(st.r*Math.cos(th),st.r*Math.sin(th)); }
    const P0=scr(0,st.r); lline(g,[[P0[0]-7,P0[1]],[P0[0]+7,P0[1]]],C.ink,2.2); ltx(g,"دفعة",P0[0],P0[1]-13,{c:C.muted,s:10,rtl:true});
    const Pp=scr(0,-st.rp); ltx(g,nf(st.low,0)+" km",Pp[0],Pp[1]-12,{c:C.power,s:10,m:true}); ltx(g,nf(st.h,0)+" km",cx,cy+R+14,{c:C.muted,s:10,m:true});
    const lab=(p,t,c,dy)=>{ const rt=p[0]>cx?p[0]+80<W:p[0]-80<0; ltx(g,t,p[0]+(rt?10:-10),p[1]+dy,{c,s:11,a:rt?"left":"right",rtl:true}); };
    ldot(g,tgt[0],tgt[1],6,C.hyd); lab(tgt,"الهدف",C.hyd,-10);
    ldot(g,ch[0],ch[1],5,C.power); lab(ch,"الملاحِقة",C.power,12);
    const lap=Math.min(st.k,Math.floor(st.tt/st.Tp)+1);
    ltx(g,st.tt<=st.time?"دورة الملاحقة "+lap+" من "+st.k:"تم الالتقاء ✓",W-12,18,{s:12,w:600,a:"right",rtl:true});
    ltx(g,"الارتفاعات مكبّرة في الرسم",W-12,H-12,{c:C.muted,s:10,a:"right",rtl:true});
  },
  ro(st){ return [["Δv الكلي (دفعتان)",nf(st.dv*1000,1)+" m/s"],["زمن الالتقاء",nf(st.time/3600,2)+" h"],["أدنى ارتفاع في مدار الملاحقة",nf(st.low,0)+" km"+(st.low<200?" ⚠ قريب من الغلاف الجوي":"")],["دور الهدف / الملاحِقة",nf(st.Tt/60,1)+" / "+nf(st.Tp/60,1)+" min"]]; },
  eq:["T_ph = T_t (1 − Δθ / (2π k))","a_ph = (μ T_ph² / 4π²)^(1/3)","Δv = 2 (v_c − v_apo,ph)"],
  note:["عدد دورات أكبر يعني فرقاً أصغر في المدار ووقوداً أقل لكن وقتاً أطول. مركبات الإمداد تستغرق عادة بين ساعات ويومين للوصول إلى المحطة الفضائية.","هذه الطريقة للملاحِقة المتأخرة خلف الهدف؛ إذا كانت أمامه ترفع مدارها بدلاً من خفضه."],
  quiz:[{q:"لكي تلحق مركبة بهدف أمامها في نفس المدار:",o:["تزيد سرعتها مباشرة","تخفض سرعتها قليلاً لتنزل إلى مدار أسرع دوراناً","تغيّر مستوى المدار"],a:1,why:"المدار الأدنى دوره أقصر، فتقترب من الهدف تدريجياً."},
        {q:"زيادة عدد دورات الملاحقة:",o:["تزيد Δv","تقلل Δv وتزيد الزمن","لا تغيّر شيئاً"],a:1,why:"الفرق المطلوب في الدور يُوزَّع على دورات أكثر."}],
  ref:"الموضوع المقابل: الالتقاء والمدارات القريبة (Rendezvous, Phasing)."
});
LESSONS.ast.push({
  ar:"الرحلة إلى الكواكب: نافذة الإطلاق", en:"Interplanetary transfer and launch windows",
  alt:"الشمس ومدار الأرض ومدار الكوكب الهدف، ومسار انتقال هوهمان نصف إهليلج، والكوكبان يتحركان حتى يلتقي المسبار بالهدف",
  intro:["للذهاب إلى المريخ لا نطير نحوه مباشرة؛ نترك الأرض بسرعة إضافية (v∞) فندخل مداراً حول الشمس يلامس طرفه مدار الأرض وطرفه الآخر مدار المريخ: انتقال هوهمان.",
         "يجب أن يكون المريخ في المكان الصحيح عندما نصل، لذلك لا يصلح الإطلاق إلا عندما تكون زاوية المريخ أمام الأرض مناسبة. هذه «نافذة الإطلاق»، وتتكرر كل فترة مجمعية (للمريخ نحو 26 شهراً)."],
  ctl:[{k:"p",ar:"الكوكب الهدف",min:1,max:3,step:1,v:2,f:v=>["","الزهرة","المريخ","المشتري"][v]},{k:"hp",ar:"ارتفاع مدار الانتظار حول الأرض",min:200,max:2000,step:50,v:300,f:v=>nf(v,0)+" km"}],
  pre:[{ar:"الزهرة",set:{p:1}},{ar:"المريخ",set:{p:2}},{ar:"المشتري",set:{p:3}}],
  init(st){ st.tt=0; },
  calc(st){ const P=[null,[0.723,0.615],[1.524,1.881],[5.203,11.86]][st.p], AU=1.495978707e8, MUS=1.32712440018e11, r1=AU, r2=P[0]*AU, a=(r1+r2)/2;
    const v1=Math.sqrt(MUS/r1), vt1=Math.sqrt(MUS*(2/r1-1/a)); st.vinf=Math.abs(vt1-v1); const rp=RE+st.hp; st.dv=Math.sqrt(st.vinf**2+2*MU/rp)-Math.sqrt(MU/rp);
    st.tof=Math.PI*Math.sqrt(a**3/MUS)/86400; st.Tp=P[1]; st.syn=1/Math.abs(1-1/P[1]); st.phase=180-360*(st.tof/365.25)/P[1]; st.r2=P[0]; st.e=Math.abs(P[0]-1)/(P[0]+1); st.name=["","الزهرة","المريخ","المشتري"][st.p]; },
  step(st,dt){ st.tt+=dt*0.08; if(st.tt>1.3) st.tt=0; },
  draw(g,W,H,st,C){
    const cx=W*0.4, cy=H*0.52, Rm=Math.min(W*0.36,H*0.44), s=Rm/Math.max(1,st.r2), outer=st.r2>1, e=st.e, aT=(1+st.r2)/2;
    const scr=(r,th)=>[cx+r*s*Math.cos(th),cy-r*s*Math.sin(th)];
    const gl=g.createRadialGradient(cx,cy,2,cx,cy,22); gl.addColorStop(0,C.fuel); gl.addColorStop(1,"rgba(0,0,0,0)"); g.fillStyle=gl; g.beginPath(); g.arc(cx,cy,22,0,Math.PI*2); g.fill(); ldot(g,cx,cy,9,C.fuel);
    g.lineWidth=1.6; g.strokeStyle=mixC(C.panel,C.hyd,0.55); g.beginPath(); g.arc(cx,cy,s,0,Math.PI*2); g.stroke(); g.strokeStyle=mixC(C.panel,C.power,0.55); g.beginPath(); g.arc(cx,cy,st.r2*s,0,Math.PI*2); g.stroke();
    const rAt=th=>aT*(1-e*e)/(1+(outer?1:-1)*e*Math.cos(th));
    const tr=[]; for(let i=0;i<=80;i++){ const th=Math.PI*i/80; tr.push(scr(rAt(th),th)); } lline(g,tr,C.ctrl,2.6,[7,4]);
    const f=Math.min(1,st.tt), yrs=f*st.tof/365.25;
    const M=(outer?0:Math.PI)+Math.PI*f, E=kepE(M,e), nu=2*Math.atan2(Math.sqrt(1+e)*Math.sin(E/2),Math.sqrt(1-e)*Math.cos(E/2)), th=outer?nu:nu-Math.PI, rr=aT*(1-e*Math.cos(E));
    const pE=scr(1,2*Math.PI*yrs), pP=scr(st.r2,st.phase*D2R+2*Math.PI*yrs/st.Tp), pS=scr(rr,th);
    ldot(g,pE[0],pE[1],6,C.hyd); ltx(g,"الأرض",pE[0]+8,pE[1]+12,{c:C.hyd,s:10,a:"left",rtl:true});
    ldot(g,pP[0],pP[1],6,C.power); ltx(g,st.name,pP[0]+8,pP[1]-10,{c:C.power,s:10,a:"left",rtl:true});
    ldot(g,pS[0],pS[1],4,C.ink); ltx(g,"المسبار",pS[0]-8,pS[1]-10,{s:10,a:"right",rtl:true});
    ltx(g,"اليوم "+nf(f*st.tof,0)+" من "+nf(st.tof,0),W-12,18,{s:12,w:600,a:"right",rtl:true});
  },
  ro(st){ return [["السرعة الزائدة v∞",nf(st.vinf,2)+" km/s"],["Δv من مدار الانتظار",nf(st.dv,2)+" km/s"],["زمن الرحلة",nf(st.tof,0)+" يوم"],["زاوية الكوكب أمام الأرض عند الإطلاق",nf(st.phase,1)+"°"],["تتكرر النافذة كل",nf(st.syn*12,1)+" شهراً"]]; },
  eq:["v∞ = √(μ☉/r₁) (√(2r₂/(r₁+r₂)) − 1)","Δv = √(v∞² + 2μ/r_p) − √(μ/r_p)","t = π √(a³/μ☉) ، الفترة المجمعية = 1/|1/T₁ − 1/T₂|"],
  note:["المدارات هنا دائرية وفي مستوى واحد للتبسيط، والمهمات الحقيقية تختار مسارات قريبة من هوهمان بحسب التاريخ الفعلي.","للمشتري تستخدم المسابير عادة مناورات جاذبية حول الزهرة والأرض لأن Δv المباشر كبير.","الزاوية السالبة تعني أن الكوكب يجب أن يكون خلف الأرض عند الإطلاق (كما في الزهرة)."],
  quiz:[{q:"لماذا لا يمكن الإطلاق إلى المريخ في أي يوم؟",o:["بسبب الطقس","لأن المريخ يجب أن يكون بزاوية مناسبة أمام الأرض ليصل مع المسبار","لأن الشمس تمنع ذلك"],a:1,why:"زمن الرحلة ثابت تقريباً، فيجب أن يصل المريخ إلى نقطة اللقاء في الوقت نفسه."},
        {q:"نافذة المريخ تتكرر تقريباً كل:",o:["سنة","26 شهراً","5 سنوات"],a:1,why:"الفترة المجمعية للأرض والمريخ نحو 2.14 سنة."}],
  ref:"الموضوع المقابل: المسارات بين الكواكب (Interplanetary Trajectories)."
});
