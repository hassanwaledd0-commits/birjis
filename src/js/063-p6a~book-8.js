/* ---------------- Book 8: Fundamentals of Astrodynamics ---------------- */
function orb(st){ const r=RE+st.h, Vc=Math.sqrt(MU/r), V=st.k*Vc, eps=V*V/2-MU/r, pp=r*r*V*V/MU; let e=Math.abs(r*V*V/MU-1); if(Math.abs(e-1)<2e-3) e=1.002;
  const peri=st.k>=1, a=e<1?pp/(1-e*e):-pp/(e*e-1), rp=pp/(1+e), ra=e<1?pp/(1-e):Infinity, T=e<1?2*Math.PI*Math.sqrt(a*a*a/MU):null;
  const type=e<1e-3?"دائري":(e<1?"إهليلجي":(Math.abs(e-1)<0.01?"قطع مكافئ (سرعة إفلات)":"قطع زائد (يفلت من الأرض)"));
  return {r,Vc,V,eps,pp,e,a,rp,ra,T,type,peri,Vesc:Math.sqrt(2*MU/r),crash:rp<RE}; }
LESSONS.ast.push({
  ar:"المدارات وقوانين كبلر", en:"Orbits, conic sections and Kepler's laws", alt:"الأرض وقمر صناعي يدور في مدار يتغير من دائري إلى إهليلجي إلى زائد حسب السرعة، مع قطاعات متساوية المساحة",
  intro:["القمر الصناعي يسقط باستمرار نحو الأرض، لكنه يتحرك جانبياً بسرعة كافية فيبقى «يخطئها». شكل مداره يحدده شيء واحد: سرعته وارتفاعه في نقطة ما. عند السرعة الدائرية مداره دائرة، وأسرع منها يصير إهليلجياً، وعند √2 مرة السرعة الدائرية يفلت.",
         "قانون كبلر الثاني: الخط من الأرض للقمر يمسح مساحات متساوية في أزمنة متساوية؛ لذلك يسرع قرب الحضيض ويبطئ قرب الأوج. القطاعات الملوّنة كلها بنفس المساحة."],
  ctl:[{k:"h",ar:"ارتفاع نقطة الحقن",min:200,max:2000,step:10,v:400,f:v=>nf(v,0)+" km"},{k:"k",ar:"السرعة / السرعة الدائرية",min:0.85,max:1.6,step:0.005,v:1.15,f:v=>nf(v,3)}],
  pre:[{ar:"دائري",set:{k:1}},{ar:"إهليلجي",set:{k:1.25}},{ar:"سرعة الإفلات (√2)",set:{k:1.4142}},{ar:"زائد",set:{k:1.55}}],
  init(st){ st.tt=0; }, onSet(st){ st.tt=0; },
  calc(st){ Object.assign(st,orb(st)); },
  step(st,dt){ st.tt+=dt; },
  draw(g,W,H,st,C){
    const cx=W*0.42, cy=H*0.5, box=Math.min(W*0.38,H*0.44), dir=st.peri?0:Math.PI, s=st.e<1?box/st.a:box/(4*st.rp);
    const ox=st.e<1?cx+(st.ra-st.rp)/2*s*(st.peri?1:-1):cx-box*0.4;
    const P=nu=>{ const r=st.pp/(1+st.e*Math.cos(nu)); return [ox+r*s*Math.cos(nu+dir), cy-r*s*Math.sin(nu+dir)]; };
    const path=[]; const nm=st.e<1?Math.PI:Math.acos(-1/st.e)*0.985; for(let nu=-nm;nu<=nm;nu+=nm/180) path.push(P(nu)); if(st.e<1) path.push(path[0]);
    if(st.e<1&&!st.crash){ const T=st.T, n=12; for(let i=0;i<n;i+=2){ const a0=i/n*T, a1=(i+1)/n*T; g.save(); g.globalAlpha=0.13; g.fillStyle=C.accent; g.beginPath(); g.moveTo(ox,cy);
        for(let tt=a0;tt<=a1;tt+=(a1-a0)/20){ const E=kepE(2*Math.PI*tt/T,st.e), nu=2*Math.atan(Math.sqrt((1+st.e)/(1-st.e))*Math.tan(E/2)); const p=P(nu); g.lineTo(p[0],p[1]); } g.closePath(); g.fill(); g.restore(); } }
    lline(g,path,C.accent,2); earth(g,ox,cy,Math.max(4,RE*s),C);
    let nu=0; if(st.e<1){ const M=2*Math.PI*((st.tt/8)%1), E=kepE(M,st.e); nu=2*Math.atan(Math.sqrt((1+st.e)/(1-st.e))*Math.tan(E/2)); }
    else { const aa=Math.abs(st.a), Fm=Math.acosh(Math.max(1.0001,(4*st.rp/aa+1)/st.e)), Mm=st.e*Math.sinh(Fm)-Fm, span=6, M=((st.tt%span)/span*2-1)*Mm, F=kepH(M,st.e); nu=2*Math.atan(Math.sqrt((st.e+1)/(st.e-1))*Math.tanh(F/2)); }
    const sp=P(nu); if(!st.crash){ ldot(g,sp[0],sp[1],5,C.power); }
    const ip=P(st.peri?0:Math.PI); ldot(g,ip[0],ip[1],3,C.ink); ltx(g,st.peri?"الحضيض (نقطة الحقن)":"الأوج (نقطة الحقن)",ip[0]+8,ip[1]-10,{s:10,a:"left",rtl:true});
    ltx(g,st.crash?"المدار يقطع سطح الأرض: يصطدم!":st.type,W-12,20,{c:st.crash?C.power:C.ink,s:13,w:600,a:"right",rtl:true});
  },
  ro(st){ return [["نوع المدار",st.type],["اللامركزية e",nf(st.e,4)],["ارتفاع الحضيض",nf(st.rp-RE,0)+" km"],["ارتفاع الأوج",isFinite(st.ra)?nf(st.ra-RE,0)+" km":"∞"],["الدور",st.T?nf(st.T/60,1)+" min ("+nf(st.T/3600,2)+" h)":"لا يعود"],["السرعة / سرعة الإفلات هنا",nf(st.V,3)+" / "+nf(st.Vesc,3)+" km/s"]]; },
  eq:["vis-viva: V² = μ (2/r − 1/a)","ε = V²/2 − μ/r = −μ/(2a)","r = p / (1 + e cos ν) ,  p = h²/μ","T = 2π √(a³/μ) ,  μ_⊕ = 398,600 km³/s²"],
  note:["في المدار الأرضي المنخفض (400 km) السرعة الدائرية حوالي 7.67 km/s، والدورة حوالي 92 دقيقة.","زيادة السرعة 41% فقط فوق الدائرية تكفي للإفلات من جاذبية الأرض.","الحركة هنا حسب معادلة كبلر الحقيقية، لهذا تلاحظ التسارع قرب الحضيض."],
  quiz:[{q:"قمر في مدار إهليلجي يتحرك أسرع عند:",o:["الأوج","الحضيض","السرعة ثابتة"],a:1,why:"من قانون المساحات المتساوية والطاقة: أقرب نقطة تعني أعلى سرعة."},
        {q:"سرعة الإفلات مقارنة بالسرعة الدائرية عند نفس الارتفاع:",o:["ضعفها","√2 مرة","نفسها"],a:1,why:"V_esc = √(2μ/r) و V_c = √(μ/r)."}],
  ref:"الموضوع المقابل: مسألة الجسمين والمقاطع المخروطية (Two-Body Orbital Mechanics)."
});

LESSONS.ast.push({
  ar:"مناورة هوهمان: الانتقال بين مدارين", en:"Hohmann transfer between circular orbits", alt:"مداران دائريان ومركبة تشغّل محركها مرتين لتنتقل عبر نصف مدار إهليلجي من المدار الداخلي إلى الخارجي",
  intro:["لرفع قمر صناعي من مدار منخفض إلى مدار أعلى بأقل وقود، نشغّل المحرك مرتين: دفعة أولى تحوّل المدار الدائري إلى إهليلج يلمس المدار الأعلى، ثم بعد نصف دورة دفعة ثانية تجعله دائرياً هناك.",
         "مجموع التغيير في السرعة Δv هو «ثمن» المناورة بالوقود. الانتقال إلى المدار الثابت (36,000 km) يكلف حوالي 3.9 km/s من مدار منخفض، ويستغرق حوالي 5 ساعات."],
  ctl:[{k:"h1",ar:"ارتفاع المدار الأول",min:200,max:2000,step:10,v:300,f:v=>nf(v,0)+" km"},{k:"h2",ar:"ارتفاع المدار الهدف",min:500,max:40000,step:50,v:35786,f:v=>nf(v,0)+" km"}],
  pre:[{ar:"إلى المدار الثابت",set:{h1:300,h2:35786}},{ar:"إلى مدار GPS",set:{h1:300,h2:20200}},{ar:"رفع مدار صغير",set:{h1:400,h2:800}}],
  init(st){ st.tt=0; }, onSet(st){ st.tt=0; },
  calc(st){ const r1=RE+st.h1, r2=RE+Math.max(st.h2,st.h1+10); st.r1=r1; st.r2=r2; st.at=(r1+r2)/2; st.et=(r2-r1)/(r2+r1);
    st.dv1=Math.sqrt(MU/r1)*(Math.sqrt(2*r2/(r1+r2))-1); st.dv2=Math.sqrt(MU/r2)*(1-Math.sqrt(2*r1/(r1+r2))); st.tof=Math.PI*Math.sqrt(st.at**3/MU); },
  step(st,dt){ st.tt+=dt; },
  draw(g,W,H,st,C){
    const cx=W*0.42, cy=H*0.52, s=Math.min(W*0.36,H*0.44)/st.r2;
    g.save(); g.strokeStyle=C.muted; g.setLineDash([4,4]); g.lineWidth=1.3; [st.r1,st.r2].forEach(r=>{ g.beginPath(); g.arc(cx,cy,r*s,0,Math.PI*2); g.stroke(); }); g.restore();
    const tr=[]; for(let nu=0;nu<=Math.PI;nu+=Math.PI/90){ const r=st.at*(1-st.et*st.et)/(1+st.et*Math.cos(nu)); tr.push([cx+r*s*Math.cos(nu),cy-r*s*Math.sin(nu)]); } lline(g,tr,C.accent,2.2);
    earth(g,cx,cy,Math.max(5,RE*s),C);
    const cyc=(st.tt%10); let x,y,burn=null;
    if(cyc<3){ const a=-Math.PI*1.5*(1-cyc/3); x=cx+st.r1*s*Math.cos(a); y=cy-st.r1*s*Math.sin(a); if(cyc>2.6) burn=[cx+st.r1*s,cy]; }
    else if(cyc<7){ const M=Math.PI*(cyc-3)/4, E=kepE(M,st.et), nu=2*Math.atan(Math.sqrt((1+st.et)/(1-st.et))*Math.tan(E/2)), r=st.at*(1-st.et*Math.cos(E)); x=cx+r*s*Math.cos(nu); y=cy-r*s*Math.sin(nu); if(cyc<3.4) burn=[cx+st.r1*s,cy]; if(cyc>6.6) burn=[cx-st.r2*s,cy]; }
    else { const a=Math.PI+(cyc-7)/3*Math.PI; x=cx+st.r2*s*Math.cos(a); y=cy-st.r2*s*Math.sin(a); if(cyc<7.4) burn=[cx-st.r2*s,cy]; }
    if(burn){ g.save(); g.fillStyle=C.fuel; g.globalAlpha=0.6+0.4*Math.sin(st.tt*30); g.beginPath(); g.arc(burn[0],burn[1],10,0,Math.PI*2); g.fill(); g.restore(); }
    ldot(g,x,y,5,C.power);
    ltx(g,"Δv₁",cx+st.r1*s+14,cy+14,{c:C.fuel,s:12,w:600,a:"left",m:true}); ltx(g,"Δv₂",cx-st.r2*s-14,cy+14,{c:C.fuel,s:12,w:600,a:"right",m:true});
    const bx=W*0.84, bw=W*0.06, bh=H*0.6, by=H*0.2, tot=st.dv1+st.dv2, sc=bh/Math.max(4.5,tot);
    g.fillStyle=C.fuel; g.fillRect(bx,by+bh-st.dv1*sc,bw,st.dv1*sc); g.fillStyle=mixC(C.fuel,C.power,0.5); g.fillRect(bx,by+bh-tot*sc,bw,st.dv2*sc);
    g.strokeStyle=C.line; g.strokeRect(bx,by,bw,bh); ltx(g,"Δv الكلي",bx+bw/2,by-12,{s:11,rtl:true}); ltx(g,nf(tot,2)+" km/s",bx+bw/2,by+bh+14,{s:11,w:600,m:true});
  },
  ro(st){ return [["Δv₁ (الدفعة الأولى)",nf(st.dv1,3)+" km/s"],["Δv₂ (الدفعة الثانية)",nf(st.dv2,3)+" km/s"],["Δv الكلي",nf(st.dv1+st.dv2,3)+" km/s"],["زمن الانتقال",nf(st.tof/3600,2)+" h"],["سرعة المدار الأول / الهدف",nf(Math.sqrt(MU/st.r1),2)+" / "+nf(Math.sqrt(MU/st.r2),2)+" km/s"]]; },
  eq:["a_t = (r₁ + r₂)/2","Δv₁ = √(μ/r₁) [√(2r₂/(r₁+r₂)) − 1]","Δv₂ = √(μ/r₂) [1 − √(2r₁/(r₁+r₂))]","t = π √(a_t³/μ)"],
  note:["المدار الأعلى سرعته أقل، لكن الوصول إليه يحتاج طاقة أكثر؛ الدفعتان كلاهما للأمام.","هوهمان هي الأكفأ بين دفعتين لمعظم الحالات، لكنها بطيئة؛ المهمات المستعجلة تدفع أكثر لتصل أسرع.","مركبات الإطلاق غالباً تضع الأقمار في «مدار انتقال» مباشرة، وتنفذ المركبة نفسها الدفعة الثانية."],
  quiz:[{q:"كم دفعة محرك تحتاج مناورة هوهمان؟",o:["واحدة","اثنتان","أربع"],a:1,why:"دفعة لدخول إهليلج الانتقال، ودفعة لتدوير المدار عند الوصول."},
        {q:"سرعة القمر في المدار الثابت مقارنة بالمدار المنخفض:",o:["أكبر","أقل","مساوية"],a:1,why:"V = √(μ/r) تقل مع زيادة نصف القطر (حوالي 3.07 مقابل 7.7 km/s)."}],
  ref:"الموضوع المقابل: المناورات المدارية — انتقال هوهمان (Orbital Maneuvers — Hohmann Transfer)."
});

LESSONS.ast.push({
  ar:"المسار الأرضي للقمر الصناعي", en:"Satellite ground track", alt:"خريطة شبكية للأرض عليها مسار القمر الصناعي يتموج بين خطي عرض ويتحرك غرباً مع كل دورة لأن الأرض تدور تحته",
  intro:["لو أسقطنا خطاً من القمر الصناعي إلى سطح الأرض، يرسم أثره «المسار الأرضي». يتموج بين خطَّي عرض يساويان ميل المدار، ويتزحزح غرباً مع كل دورة لأن الأرض تدور تحت المدار.",
         "في المدار الثابت دورة القمر تساوي دورة الأرض، فيبقى فوق نقطة واحدة. والمدارات القطبية تمر فوق كل الأرض تدريجياً، لهذا تُستخدم للتصوير والطقس. النقطة البرتقالية على الخريطة هي بغداد."],
  ctl:[{k:"inc",ar:"ميل المدار",min:0,max:98,step:0.5,v:51.6,f:v=>nf(v,1)+"°"},{k:"h",ar:"الارتفاع",min:300,max:36000,step:50,v:420,f:v=>nf(v,0)+" km"}],
  pre:[{ar:"محطة الفضاء الدولية",set:{inc:51.6,h:420}},{ar:"مدار متزامن مع الشمس",set:{inc:98,h:700}},{ar:"مدار ثابت",set:{inc:0,h:35786}},{ar:"مدار مائل 24 ساعة",set:{inc:45,h:35786}}],
  init(st){ st.tt=0; }, onSet(st){ st.tt=0; },
  calc(st){ const r=RE+st.h; st.T=2*Math.PI*Math.sqrt(r**3/MU); st.n=2*Math.PI/st.T; st.shift=-7.2921159e-5*st.T/D2R; st.perday=86164/st.T; },
  step(st,dt){ st.tt+=dt; },
  draw(g,W,H,st,C){
    const mx=W*0.03, mw=W*0.94, mh=Math.min(H*0.86,mw/2), my=(H-mh)/2, X=l=>mx+(l+180)/360*mw, Y=b=>my+(90-b)/180*mh;
    g.fillStyle=mixC(C.panel,C.ctrl,0.1); g.fillRect(mx,my,mw,mh);
    for(let l=-180;l<=180;l+=30) lline(g,[[X(l),my],[X(l),my+mh]],C.line,1); for(let b=-90;b<=90;b+=30) lline(g,[[mx,Y(b)],[mx+mw,Y(b)]],b===0?C.muted:C.line,b===0?1.6:1);
    ldot(g,X(44.37),Y(33.31),4,C.fuel); ltx(g,"بغداد",X(44.37)+6,Y(33.31)-9,{c:C.fuel,s:10,a:"left",rtl:true});
    const warp=st.T/8, tnow=st.tt*warp, wE=7.2921159e-5, i=st.inc*D2R, pos=t=>{ const u=st.n*t, lat=Math.asin(Math.sin(i)*Math.sin(u)), lon=Math.atan2(Math.cos(i)*Math.sin(u),Math.cos(u))-wE*t; return [lat/D2R,((lon/D2R+180)%360+360)%360-180]; };
    let prev=null; g.save(); g.strokeStyle=C.power; g.lineWidth=1.8;
    for(let k=0;k<=360;k++){ const t=tnow-3*st.T*(1-k/360); if(t<0){ prev=null; continue; } const p=pos(t); g.globalAlpha=0.2+0.8*k/360;
      if(prev&&Math.abs(p[1]-prev[1])<180){ g.beginPath(); g.moveTo(X(prev[1]),Y(prev[0])); g.lineTo(X(p[1]),Y(p[0])); g.stroke(); } prev=p; }
    g.restore(); const p=pos(tnow); ldot(g,X(p[1]),Y(p[0]),6,C.power);
    lline(g,[[mx,Y(st.inc>90?180-st.inc:st.inc)],[mx+mw,Y(st.inc>90?180-st.inc:st.inc)]],C.accent,1,[4,4]);
    ltx(g,"خريطة شبكية مبسّطة · الزمن مسرّع",mx+mw-4,my-8,{c:C.muted,s:10,a:"right",rtl:true});
  },
  ro(st){ return [["الدور",nf(st.T/60,1)+" min"],["عدد الدورات في اليوم",nf(st.perday,2)],["الإزاحة غرباً لكل دورة",(()=>{ const w=((-st.shift+180)%360+360)%360-180; return nf(Math.abs(w)<0.005?0:w,2)+"°"+(Math.abs(w)<1?" (المسار يتكرر)":""); })()],["أقصى خط عرض يمر فوقه",nf(st.inc>90?180-st.inc:st.inc,1)+"°"]]; },
  eq:["sin(خط العرض) = sin i · sin u ,  u = n t","خط الطول = atan2(cos i · sin u, cos u) − ω_⊕ t + λ₀","الإزاحة لكل دورة = ω_⊕ · T ,  ω_⊕ = 7.292×10⁻⁵ rad/s"],
  note:["لا يمكن لقمر صناعي أن يمر فوق خطوط عرض أعلى من ميل مداره.","المدار الثابت (ميل صفر) يظهر نقطة ثابتة فوق خط الاستواء؛ لو كان مائلاً يرسم شكل «8».","المدار المتزامن مع الشمس يمر فوق كل نقطة في نفس الوقت المحلي تقريباً، مفيد للتصوير بظروف إضاءة متشابهة."],
  quiz:[{q:"قمر صناعي ميل مداره 30°، هل يمكن أن يمر فوق لندن (خط عرض 51.5°)؟",o:["نعم","لا","فقط ليلاً"],a:1,why:"أقصى خط عرض للمسار يساوي ميل المدار."},
        {q:"لماذا يتزحزح المسار غرباً مع كل دورة؟",o:["لأن القمر يبطئ","لأن الأرض تدور شرقاً تحت المدار","بسبب القمر"],a:1,why:"خلال دورة القمر، تدور الأرض بزاوية ω_⊕ T نحو الشرق."}],
  ref:"الموضوع المقابل: المسارات الأرضية وتحديد المدار من الأرض (Ground Track, Orbit Determination)."
});

LESSONS.ast.push({
  ar:"تغيير مستوى المدار", en:"Plane-change maneuvers", alt:"مداران مائلان حول الأرض ومركبة تغيّر اتجاه سرعتها عند العقدة، مع مثلث السرعات",
  intro:["لتغيير ميل المدار، لازم نغيّر اتجاه السرعة نفسها عند نقطة تقاطع المدارين (العقدة). المشكلة أن السرعة المدارية كبيرة جداً، فحتى زاوية صغيرة تكلف Δv ضخماً.",
         "لهذا يُفضّل تغيير المستوى حيث السرعة أقل: في المدارات العالية أو عند الأوج. قارن تكلفة نفس الزاوية في مدار منخفض وفي المدار الثابت."],
  ctl:[{k:"h",ar:"ارتفاع المدار",min:200,max:36000,step:50,v:400,f:v=>nf(v,0)+" km"},{k:"di",ar:"زاوية تغيير المستوى Δi",min:0,max:60,step:0.5,v:28.5,f:v=>nf(v,1)+"°"}],
  init(st){ st.tt=0; },
  calc(st){ const r=RE+st.h; st.V=Math.sqrt(MU/r); st.dv=2*st.V*Math.sin(st.di*D2R/2); st.dvL=2*Math.sqrt(MU/(RE+400))*Math.sin(st.di*D2R/2); st.dvG=2*Math.sqrt(MU/(RE+35786))*Math.sin(st.di*D2R/2); st.r=r; },
  step(st,dt){ st.tt+=dt; },
  draw(g,W,H,st,C){
    const cx=W*0.36, cy=H*0.52, R=Math.min(W*0.28,H*0.38), el=25*D2R, i0=10*D2R, i1=i0+st.di*D2R;
    const proj=(u,inc)=>{ const X=Math.cos(u), Y=Math.sin(u)*Math.cos(inc), Z=Math.sin(u)*Math.sin(inc); return [cx+X*R, cy-(Z*Math.cos(el)+Y*Math.sin(el))*R, Y]; };
    const ring=(inc,c,w,dash)=>{ const pts=[]; for(let u=0;u<=Math.PI*2+0.01;u+=0.04){ const p=proj(u,inc); pts.push([p[0],p[1]]); } lline(g,pts,c,w,dash); };
    ring(i0,C.muted,1.5,[5,4]); earth(g,cx,cy,R*0.32,C); ring(i1,C.accent,2,null);
    const cyc=(st.tt%8)/8; const inc=cyc<0.5?i0:i1, u=(cyc<0.5?cyc*2:(cyc-0.5)*2)*Math.PI*2, p=proj(u,inc); ldot(g,p[0],p[1],5,C.power);
    const nd=proj(0,i0); if(cyc<0.04||cyc>0.96||(cyc>0.48&&cyc<0.53)){ g.save(); g.fillStyle=C.fuel; g.globalAlpha=0.7; g.beginPath(); g.arc(nd[0],nd[1],10,0,Math.PI*2); g.fill(); g.restore(); }
    ltx(g,"العقدة",nd[0]+12,nd[1]+14,{c:C.fuel,s:11,a:"left",rtl:true});
    const bx=W*0.78, by=H*0.62, L=Math.min(W*0.15,H*0.32), a1=-Math.PI/2-st.di*D2R/2, a2=-Math.PI/2+st.di*D2R/2;
    larrow(g,bx,by,bx+Math.cos(a1)*L,by+Math.sin(a1)*L,C.muted,2.5,8); larrow(g,bx,by,bx+Math.cos(a2)*L,by+Math.sin(a2)*L,C.accent,2.5,8);
    larrow(g,bx+Math.cos(a1)*L,by+Math.sin(a1)*L,bx+Math.cos(a2)*L,by+Math.sin(a2)*L,C.power,2.5,8);
    ltx(g,"V₁",bx+Math.cos(a1)*L-10,by+Math.sin(a1)*L,{c:C.muted,s:11,a:"right",m:true}); ltx(g,"V₂",bx+Math.cos(a2)*L+10,by+Math.sin(a2)*L,{c:C.accent,s:11,a:"left",m:true}); ltx(g,"Δv",bx,by+Math.sin(a1)*L-12,{c:C.power,s:12,w:600,m:true});
    ltx(g,"مثلث السرعات عند العقدة",bx,by+18,{c:C.muted,s:10,rtl:true});
  },
  ro(st){ return [["السرعة المدارية هنا",nf(st.V,3)+" km/s"],["Δv لتغيير المستوى",nf(st.dv,3)+" km/s"],["نفس الزاوية في مدار 400 km",nf(st.dvL,3)+" km/s"],["نفس الزاوية في المدار الثابت",nf(st.dvG,3)+" km/s"]]; },
  eq:["Δv = 2 V sin(Δi / 2)","V = √(μ / r)","الأرخص: تغيير المستوى حيث V أصغر (مدار عالٍ أو عند الأوج)"],
  note:["تغيير 28.5° في مدار منخفض يكلف حوالي 3.8 km/s، أي تقريباً مثل الصعود كله من المدار المنخفض إلى الثابت.","الأقمار المتجهة للمدار الثابت من قواعد إطلاق بعيدة عن خط الاستواء تدمج تغيير المستوى مع الدفعة الثانية عند الأوج.","لهذا تفضّل القواعد القريبة من خط الاستواء: ميل أقل يعني وقوداً أقل."],
  quiz:[{q:"لماذا يُجرى تغيير المستوى عادة عند الأوج أو في مدار عالٍ؟",o:["لأن السرعة هناك أقل فيكون Δv أقل","لأن الجاذبية أقوى","لأن الوقود أبرد"],a:0,why:"Δv = 2V sin(Δi/2) يتناسب مع السرعة."},
        {q:"تغيير المستوى بزاوية 60° يتطلب Δv يساوي:",o:["V","2V","نصف V"],a:0,why:"2V sin 30° = V."}],
  ref:"الموضوع المقابل: مناورات تغيير المستوى (Plane Change Maneuvers)."
});
