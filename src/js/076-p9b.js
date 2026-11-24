/* ---------- Book 2: Fundamentals of Aerodynamics — 10 more lessons ---------- */
/* integrate a streamline through a 2D velocity field (unit free-stream along +x) */
function kStream(vel,x0,y0,x1,ds,body){ const pts=[[x0,y0]]; let x=x0,y=y0;
  for(let i=0;i<2000&&x<x1;i++){ let [u,v]=vel(x,y); let s=Math.hypot(u,v)||1e-9; const xm=x+0.5*ds*u/s, ym=y+0.5*ds*v/s; [u,v]=vel(xm,ym); s=Math.hypot(u,v)||1e-9; x+=ds*u/s; y+=ds*v/s; if(body&&body(x,y)) break; pts.push([x,y]); }
  return pts; }
function kFlowDraw(g,lines,map,C,t,speed){ lines.forEach((pl,k)=>{ lline(g,pl.map(map),mixC(C.panel,C.hyd,0.45),1.2); const n=pl.length; if(n<3) return;
  for(let j=0;j<3;j++){ const i=Math.floor((((t*(speed||0.12))+j/3+k*0.17)%1)*(n-1)); const q=map(pl[i]); ldot(g,q[0],q[1],2,C.hyd,0.9); } }); }
LK("foa",{
  ar:"بيضاوي رانكن: منبع ومصرف وتيار منتظم", en:"The Rankine oval: source, sink and uniform flow",
  alt:"خطوط انسياب حول جسم بيضاوي ناتج عن جمع منبع ومصرف مع تيار منتظم، ومنحنى نسبة طول الجسم إلى سماكته",
  intro:["في الانسياب المثالي يمكن بناء أشكال كثيرة بجمع حلول بسيطة. منبع يطلق الهواء ومصرف يبتلعه، وعندما نضيفهما إلى تيار منتظم يظهر خط انسياب مغلق يمكن اعتباره سطح جسم صلب: «بيضاوي رانكن».",
         "كلما قوي المنبع والمصرف أصبح الجسم أسمك وأقصر نسبياً. وهذه الفكرة (جمع الحلول) هي أساس طرق الألواح التي تحسب الضغط على أي شكل بالحاسوب."],
  ctl:[{k:"K",ar:"قوة المنبع Λ/(2πV∞b)",min:0.05,max:2,step:0.01,v:0.5,f:v=>nf(v,2)}],
  pre:[{ar:"نحيف",set:{K:0.1}},{ar:"متوسط",set:{K:0.5}},{ar:"سميك",set:{K:1.6}}],
  calc(st){ const K=st.K; st.h=kRoot(h=>h-K*(Math.PI-2*Math.atan(h)),0,10); st.l=Math.sqrt(1+2*K); st.fin=st.l/st.h; st.umax=1+2*K/(1+st.h*st.h); st.cpmin=1-st.umax*st.umax;
    const vel=(x,y)=>{ const r1=(x+1)**2+y*y, r2=(x-1)**2+y*y; return [1+K*((x+1)/r1-(x-1)/r2), K*(y/r1-y/r2)]; };
    const psi=(x,y)=>y+K*(Math.atan2(y,x+1)-Math.atan2(y,x-1)); const body=[]; for(let i=0;i<=60;i++){ const x=-st.l+2*st.l*i/60; body.push([x,Math.abs(x)>=st.l?0:kRoot(y=>psi(x,y),1e-6,6)]); } st.body=body;
    const yl=[0.18,0.45,0.8,1.2,1.7,2.3].map(f=>st.h*0.25+f*0.9); st.sl=[]; yl.forEach(y0=>{ const pl=kStream(vel,-4.5,y0,4.5,0.05); st.sl.push(pl,pl.map(q=>[q[0],-q[1]])); }); },
  scene(g,r,st,C){ const s=Math.min(r.w/9,r.h/(2*Math.max(2.6,st.h+1.2))), cx=r.x+r.w/2, cy=r.y+r.h/2, M=q=>[cx+q[0]*s,cy-q[1]*s];
    g.save(); g.beginPath(); g.rect(r.x,r.y,r.w,r.h); g.clip(); kFlowDraw(g,st.sl,M,C,st.t,0.1); g.restore();
    g.fillStyle=mixC(C.panel,C.struct,0.45); g.strokeStyle=C.ink; g.lineWidth=1.5; g.beginPath(); st.body.forEach((q,i)=>{ const p=M(q); i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]); }); for(let i=st.body.length-1;i>=0;i--){ const p=M([st.body[i][0],-st.body[i][1]]); g.lineTo(p[0],p[1]); } g.closePath(); g.fill(); g.stroke();
    ldot(g,cx-s,cy,4,C.ctrl); ldot(g,cx+s,cy,4,C.power); ltx(g,"منبع",cx-s,cy+14,{c:C.ctrl,s:10,rtl:true}); ltx(g,"مصرف",cx+s,cy+14,{c:C.power,s:10,rtl:true}); },
  plot(st){ const fin=K=>Math.sqrt(1+2*K)/kRoot(h=>h-K*(Math.PI-2*Math.atan(h)),0,10); return {x:[0.05,2],y:[0,8],xl:"K",yl:"l / h",curves:[{f:fin,c:"hyd",n:80}],dots:[{x:st.K,y:st.fin,t:nf(st.fin,2)}]}; },
  ro(st){ return [["نصف الطول l/b",nf(st.l,3)],["نصف السماكة h/b",nf(st.h,3)],["نسبة النحافة l/h",nf(st.fin,2)],["أقل Cp على السطح",nf(st.cpmin,3)]]; },
  eq:["ψ = V∞ y + (Λ/2π)(θ₁ − θ₂)","l = b √(1 + Λ/(π V∞ b))","h = (Λ/2πV∞)(π − 2 tan⁻¹(h/b))"],
  note:["في الانسياب المثالي لا يوجد سحب على الجسم المغلق؛ السحب الحقيقي يأتي من اللزوجة.","الطرق الحاسوبية الحديثة تضع آلاف المنابع والدوامات على سطح الطائرة وتحل لقوتها."],
  quiz:[{q:"زيادة قوة المنبع والمصرف تجعل الجسم:",o:["أنحف","أسمك نسبياً","لا يتغيّر"],a:1,why:"الهواء الخارج من المنبع يدفع خط الانسياب الفاصل بعيداً عن المحور."},
        {q:"لماذا يمكن اعتبار خط الانسياب المغلق سطحاً صلباً؟",o:["لأن الهواء لا يعبر خط الانسياب","لأن الضغط عليه صفر","لأن السرعة عليه صفر"],a:0,why:"بالتعريف لا يوجد تدفق عمودي على خط الانسياب."}],
  ref:"الموضوع المقابل: جمع الحلول الأولية (Source, Sink, Rankine Oval)."
});
LK("foa",{
  ar:"الأسطوانة: توزيع الضغط ومفارقة دالمبير وتأثير ماغنوس", en:"Flow past a cylinder: pressure, d'Alembert's paradox and the Magnus effect",
  alt:"أسطوانة في تيار هوائي مع خطوط الانسياب وأسهم الضغط حولها، ونقطتا الركود تنزلان مع زيادة الدوران، ومنحنى معامل الضغط حول السطح",
  intro:["في الانسياب المثالي حول أسطوانة يكون الضغط متماثلاً أمامها وخلفها، فلا يوجد سحب: هذه «مفارقة دالمبير». في الهواء الحقيقي تنفصل الطبقة المتاخمة على الجانب الخلفي فيبقى الضغط منخفضاً هناك، فيظهر سحب كبير.",
         "إذا دارت الأسطوانة أضيف دوران (circulation) يسرّع الهواء فوقها ويبطئه تحتها، فيقل الضغط فوقها ويتولد رفع: تأثير ماغنوس، وهو نفسه ما يجعل الكرة الدوّارة تنحرف."],
  ctl:[{k:"G",ar:"الدوران Γ/(4πV∞R)",min:0,max:1.5,step:0.01,v:0.3,f:v=>nf(v,2)}],
  tog:[{k:"real",ar:"الهواء الحقيقي (انفصال)",v:false}],
  pre:[{ar:"بلا دوران",set:{G:0}},{ar:"دوران متوسط",set:{G:0.5}},{ar:"نقطة ركود واحدة",set:{G:1}}],
  calc(st){ const G=st.G; st.cl=4*Math.PI*G; st.th=G<=1?-Math.asin(G)/D2R:-90;
    st.cp=th=>{ const t=th*D2R; if(st.real&&G<0.05){ const fr=Math.abs(((th%360)+360)%360-180); return fr<80?1-4*Math.sin(t)**2:-1.2; } return 1-4*(Math.sin(t)+G)**2; };
    const Gc=4*Math.PI*G; const vel=(x,y)=>{ const r2=x*x+y*y, r=Math.sqrt(r2), c=x/r, s=y/r, ur=(1-1/r2)*c, ut=-(1+1/r2)*s-Gc/(2*Math.PI*r); return [ur*c-ut*s, ur*s+ut*c]; };
    st.sl=[]; [-2.2,-1.5,-1.0,-0.6,-0.25,0.12,0.45,0.9,1.4,2.1].forEach(y0=>st.sl.push(kStream(vel,-4.5,y0,4.5,0.05,(x,y)=>x*x+y*y<1.0))); },
  scene(g,r,st,C){ const s=Math.min(r.w/9,r.h/5.6), cx=r.x+r.w/2, cy=r.y+r.h/2, M=q=>[cx+q[0]*s,cy-q[1]*s];
    g.save(); g.beginPath(); g.rect(r.x,r.y,r.w,r.h); g.clip(); if(!st.real) kFlowDraw(g,st.sl,M,C,st.t,0.12); g.restore();
    for(let k=0;k<24;k++){ const th=k*15, cp=st.cp(th), t=th*D2R, l=clamp(cp,-5,1.5)*s*0.18, px=cx+Math.cos(t)*s, py=cy-Math.sin(t)*s;
      if(Math.abs(l)>1){ const ox=px+Math.cos(t)*Math.abs(l), oy=py-Math.sin(t)*Math.abs(l); if(cp>0) larrow(g,ox,oy,px,py,C.power,1.4,5); else larrow(g,px,py,ox,oy,C.ctrl,1.4,5); } }
    g.fillStyle=mixC(C.panel,C.struct,0.45); g.strokeStyle=C.ink; g.lineWidth=1.5; g.beginPath(); g.arc(cx,cy,s,0,Math.PI*2); g.fill(); g.stroke();
    if(st.G>0.01){ const a=st.t*st.G*4; g.strokeStyle=C.ink; g.lineWidth=2; g.beginPath(); g.arc(cx,cy,s*0.6,a,a+4.2); g.stroke(); const e=a+4.2; larrow(g,cx+Math.cos(e-0.3)*s*0.6,cy+Math.sin(e-0.3)*s*0.6,cx+Math.cos(e)*s*0.6,cy+Math.sin(e)*s*0.6,C.ink,2,7); }
    if(st.G<=1){ [st.th,180-st.th].forEach(th=>{ const t=th*D2R; ldot(g,cx+Math.cos(t)*s,cy-Math.sin(t)*s,5,C.accent); }); }
    if(st.real&&st.G<0.05) ltx(g,"انفصال وأثر مضطرب خلف الأسطوانة",cx+s*2.2,cy-s*1.6,{c:C.muted,s:10,rtl:true});
    if(st.cl>0.05) larrow(g,cx,cy-s*1.15,cx,cy-s*1.15-Math.min(r.h*0.3,st.cl*6),C.ctrl,3,9); },
  plot(st){ return {x:[0,360],y:[-14,1.5],xt:[0,90,180,270,360],xl:"θ (°)",yl:"Cp",curves:[{f:st.cp,c:st.real?"power":"hyd",n:240}],hl:[{y:0,c:"line",dash:[2,3]}]}; },
  ro(st){ return [["الرفع لكل وحدة طول c_l",nf(st.cl,2)],["زاوية نقطتي الركود",st.G<=1?nf(st.th,1)+"° و "+nf(180-st.th,1)+"°":"نقطة خارج السطح"],["السحب",st.real&&st.G<0.05?"c_d ≈ 1.2 (حقيقي)":"صفر (مثالي)"]]; },
  eq:["Cp = 1 − 4 sin²θ (بلا دوران)","Cp = 1 − 4(sin θ + Γ/(4πV∞R))²","L′ = ρ V∞ Γ ، c_l = Γ/(V∞R)"],
  note:["في الهواء الحقيقي يتغير معامل سحب الأسطوانة كثيراً مع رقم رينولدز، ويهبط فجأة عندما تصبح الطبقة المتاخمة مضطربة.","هناك سفن تستخدم أسطوانات دوّارة كأشرعة (دوّار فلتنر) بالفكرة نفسها."],
  quiz:[{q:"مفارقة دالمبير تقول إن:",o:["السحب المثالي على جسم مغلق صفر","الرفع صفر دائماً","الضغط ثابت"],a:0,why:"تماثل الضغط أماماً وخلفاً في الانسياب المثالي يلغي السحب."},
        {q:"عند زيادة الدوران على الأسطوانة، نقطتا الركود:",o:["تصعدان للأعلى","تنزلان وتقتربان من بعضهما","لا تتحركان"],a:1,why:"sin θ_s = −Γ/(4πV∞R)."}],
  ref:"الموضوع المقابل: الانسياب حول الأسطوانة مع الدوران (Lifting Flow over a Cylinder)."
});
function pmNu(M){ if(M<=1) return 0; const a=Math.sqrt(M*M-1); return (Math.sqrt(6)*Math.atan(a/Math.sqrt(6))-Math.atan(a))/D2R; }
function aStar(M){ return Math.pow((1+0.2*M*M)/1.2,3)/M; }
LK("foa",{
  ar:"موجات التمدد: دالة براندتل–ماير", en:"Expansion waves: the Prandtl–Meyer function",
  alt:"تيار فوق صوتي يدور حول زاوية بعيداً عن نفسه عبر مروحة من موجات التمدد، وخطوط انسياب تنحني، ومنحنى دالة براندتل–ماير",
  intro:["عندما يدور تيار فوق صوتي بعيداً عن نفسه عند زاوية في الجدار لا تتكون صدمة بل «مروحة» من موجات ماخ الضعيفة. يتسارع الهواء عبرها وينخفض ضغطه وحرارته بشكل متدرج ومن غير خسارة.",
         "دالة براندتل–ماير ν(M) تعطي الحل بسهولة: زاوية الدوران تُضاف إلى ν، ومن القيمة الجديدة نجد رقم ماخ بعد التمدد. للدوران حد أقصى نظرياً، بعده يصل الهواء إلى الفراغ."],
  ctl:[{k:"M1",ar:"رقم ماخ قبل الزاوية",min:1,max:4,step:0.01,v:2,f:v=>nf(v,2)},{k:"th",ar:"زاوية الدوران",min:0,max:40,step:0.5,v:10,f:v=>nf(v,1)+"°"}],
  calc(st){ st.nu1=pmNu(st.M1); st.nu2=Math.min(st.nu1+st.th,130.3); st.M2=st.nu2<=0?1:kRoot(M=>pmNu(M)-st.nu2,1,80); const r=(1+0.2*st.M1**2)/(1+0.2*st.M2**2); st.T=r; st.p=Math.pow(r,3.5);
    st.mu1=Math.asin(1/st.M1)/D2R; st.mu2=Math.asin(1/st.M2)/D2R; },
  scene(g,r,st,C){ const xc=r.x+r.w*0.42, yc=r.y+r.h*0.72, th=st.th*D2R, m1=st.mu1*D2R, m2=st.mu2*D2R, L=Math.min(r.w,r.h)*0.75;
    g.fillStyle=mixC(C.panel,C.ink,0.18); g.beginPath(); g.moveTo(r.x,yc); g.lineTo(xc,yc); g.lineTo(xc+Math.cos(th)*L,yc+Math.sin(th)*L); g.lineTo(r.x,r.y+r.h); g.closePath(); g.fill(); lline(g,[[r.x,yc],[xc,yc],[xc+Math.cos(th)*L,yc+Math.sin(th)*L]],C.ink,2.5);
    const a1=-m1, a2=-(m2-th); g.fillStyle=mixC(C.panel,C.ctrl,0.15); g.beginPath(); g.moveTo(xc,yc); g.arc(xc,yc,L,a1-Math.PI*0+0,a2,false); g.closePath(); g.fill();
    for(let k=0;k<=6;k++){ const a=a1+(a2-a1)*k/6; lline(g,[[xc,yc],[xc+Math.cos(a)*L,yc+Math.sin(a)*L]],C.ctrl,1,[3,3]); }
    const A1=aStar(st.M1), A2=aStar(st.M2), sp=[0.12,0.26,0.42].map(f=>f*r.h*0.75);
    sp.forEach((n1,k)=>{ const rA=n1/Math.sin(m1), n2=n1*A2/A1, rB=n2/Math.sin(m2), pts=[[r.x,yc-n1]]; for(let i=0;i<=12;i++){ const f=i/12, a=a1+(a2-a1)*f, rr=rA+(rB-rA)*f; pts.push([xc+Math.cos(a)*rr,yc+Math.sin(a)*rr]); }
      const B=pts[pts.length-1]; pts.push([B[0]+Math.cos(th)*L,B[1]+Math.sin(th)*L]); lline(g,pts,C.hyd,1.6); const f=(st.t*0.25+k*0.3)%1, i=Math.floor(f*(pts.length-1)); ldot(g,pts[i][0],pts[i][1],2.6,C.hyd); });
    ltx(g,"M₁ = "+nf(st.M1,2),r.x+r.w*0.14,r.y+16,{s:12,w:600,m:true}); ltx(g,"M₂ = "+nf(st.M2,2),r.x+r.w*0.82,r.y+16,{s:12,w:600,m:true,c:C.ctrl}); },
  plot(st){ return {x:[1,5],y:[0,80],xl:"M",yl:"ν (°)",curves:[{f:pmNu,c:"hyd"}],dots:[{x:st.M1,y:st.nu1,c:"muted",t:"1"},{x:st.M2,y:st.nu2,c:"ctrl",t:"2"}]}; },
  ro(st){ return [["ν₁",nf(st.nu1,2)+"°"],["ν₂ = ν₁ + θ",nf(st.nu2,2)+"°"],["M₂",nf(st.M2,3)],["p₂/p₁",nf(st.p,3)],["T₂/T₁",nf(st.T,3)]]; },
  eq:["ν(M) = √((γ+1)/(γ−1)) tan⁻¹√((γ−1)(M²−1)/(γ+1)) − tan⁻¹√(M²−1)","ν₂ = ν₁ + θ","التمدد متساوي الأنتروبي: p₀ ثابت"],
  note:["الموجات هنا تتباعد (مروحة)، بعكس الصدمة التي تجمع الموجات في خط واحد.","على الجناح فوق الصوتي تظهر مراوح التمدد عند أعلى نقطة في السطح العلوي."],
  quiz:[{q:"عبر مروحة التمدد، رقم ماخ:",o:["يقل","يزيد","لا يتغيّر"],a:1,why:"الهواء يتمدد ويتسارع."},
        {q:"هل يفقد الهواء ضغطاً كلياً عبر التمدد؟",o:["نعم كثيراً","لا، التمدد متساوي الأنتروبي","فقط عند ماخ 2"],a:1,why:"الموجات ضعيفة جداً ولا خسارة فيها."}],
  ref:"الموضوع المقابل: موجات التمدد (Prandtl–Meyer Expansion Waves)."
});
LK("foa",{
  ar:"الجناح الرقيق فوق الصوتي: نظرية أكيريه", en:"Supersonic thin airfoils: Ackeret theory",
  alt:"مقطع على شكل معين في تيار فوق صوتي مع صدمات عند الحافتين ومراوح تمدد في المنتصف، والأسطح ملوّنة حسب الضغط، ومنحنى نسبة الرفع إلى السحب",
  intro:["في التيار فوق الصوتي يعتمد الضغط على السطح على ميله فقط: Cp = 2θ/√(M²−1). السطح الذي يواجه التيار يُضغط، والذي يبتعد عنه يتمدد. لذلك يُصنع الجناح فوق الصوتي رقيقاً وحاد الحافة.",
         "يظهر سحب جديد حتى بلا لزوجة: «سحب الموجة»، جزء منه بسبب زاوية الهجوم وجزء بسبب السماكة. نسبة الرفع إلى السحب لأي معيّن رقيق أقصاها 1/(2t/c) عند α = t/c."],
  ctl:[{k:"M",ar:"رقم ماخ",min:1.2,max:4,step:0.05,v:2,f:v=>nf(v,2)},{k:"al",ar:"زاوية الهجوم",min:0,max:10,step:0.1,v:4,f:v=>nf(v,1)+"°"},{k:"tc",ar:"السماكة t/c",min:0,max:0.1,step:0.005,v:0.05,f:v=>nf(v*100,1)+"%"}],
  calc(st){ const b=Math.sqrt(st.M*st.M-1), a=st.al*D2R; st.b=b; st.cl=4*a/b; st.cda=4*a*a/b; st.cdt=4*st.tc*st.tc/b; st.cd=st.cda+st.cdt; st.LD=st.cd>0?st.cl/st.cd:0; st.aopt=st.tc/D2R; st.LDmax=st.tc>0?1/(2*st.tc):Infinity; st.mu=Math.asin(1/st.M); },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.5, c=r.w*0.55, a=-st.al*D2R, h=Math.max(st.tc,0.004)*c*1.5, R=(x,y)=>[cx+(x*Math.cos(a)-y*Math.sin(a)),cy-(x*Math.sin(a)+y*Math.cos(a))];
    const LE=R(-c/2,0), TE=R(c/2,0), U=R(0,h/2), Lw=R(0,-h/2), b=st.b, cpc=th=>2*th/b, col=cp=>cp>0?mixC(C.panel,C.power,clamp(0.3+cp*4,0,1)):mixC(C.panel,C.ctrl,clamp(0.3-cp*4,0,1));
    const tau=Math.max(st.tc,0.004)*1.5*0+st.tc, al=st.al*D2R, panels=[[LE,U,cpc(tau-al)],[U,TE,cpc(-tau-al)],[LE,Lw,cpc(tau+al)],[Lw,TE,cpc(al-tau)]];
    const mu=st.mu, Ls=r.h*0.45; [[LE,1],[LE,-1],[TE,1],[TE,-1]].forEach(([p,s])=>lline(g,[p,[p[0]+Math.cos(mu)*Ls,p[1]-s*Math.sin(mu)*Ls]],C.power,1.4));
    [[U,1],[Lw,-1]].forEach(([p,s])=>{ for(let k=0;k<4;k++){ const m=mu*(0.85+k*0.08); lline(g,[p,[p[0]+Math.cos(m)*Ls*0.8,p[1]-s*Math.sin(m)*Ls*0.8]],C.ctrl,1,[3,3]); } });
    g.fillStyle=mixC(C.panel,C.struct,0.4); g.beginPath(); g.moveTo(...LE); g.lineTo(...U); g.lineTo(...TE); g.lineTo(...Lw); g.closePath(); g.fill();
    panels.forEach(([p,q,cp])=>lline(g,[p,q],col(cp),5));
    for(let i=0;i<8;i++){ const y=r.y+r.h*(0.1+0.8*i/7), x=r.x+((st.t*0.4+i*0.21)%1)*r.w*0.3; larrow(g,x,y,x+14,y,mixC(C.muted,C.panel,0.3),1.2,5); }
    ltx(g,"أحمر: ضغط · أزرق: تمدد",r.x+r.w*0.98,r.y+r.h*0.96,{c:C.muted,s:10,a:"right",rtl:true}); },
  plot(st){ const f=al=>{ const a=al*D2R, cl=4*a/st.b, cd=(4*a*a+4*st.tc*st.tc)/st.b; return cd>0?cl/cd:NaN; }; return {x:[0,10],y:[0,st.tc>0.004?Math.min(60,st.LDmax*1.2):60],xl:"α (°)",yl:"L/D",curves:[{f,c:"hyd"}],vl:[{x:st.aopt,c:"ctrl",t:"α = t/c"}],dots:[{x:st.al,y:st.LD}]}; },
  ro(st){ return [["c_l = 4α/β",nf(st.cl,3)],["سحب الموجة: زاوية + سماكة",nf(st.cda,4)+" + "+nf(st.cdt,4)],["L/D",nf(st.LD,2)],["أفضل L/D",isFinite(st.LDmax)?nf(st.LDmax,1)+" عند "+nf(st.aopt,2)+"°":"—"]]; },
  eq:["Cp = 2θ / √(M² − 1)","c_l = 4α/β ، β = √(M² − 1)","c_d = 4α²/β + 4(t/c)²/β (معيّن)"],
  note:["النظرية خطية وتصلح للزوايا والسماكات الصغيرة وماخ غير قريب من 1.","لاحظ أن الرفع لا يعتمد على شكل المقطع، فقط على زاوية الهجوم؛ الشكل يؤثر في السحب."],
  quiz:[{q:"في التيار فوق الصوتي، زيادة ماخ مع ثبات α:",o:["تزيد c_l","تقلل c_l","لا تغيّره"],a:1,why:"c_l = 4α/√(M²−1)."},
        {q:"لماذا الأجنحة فوق الصوتية رقيقة جداً؟",o:["لتقليل سحب الموجة الناتج عن السماكة","لزيادة الرفع","لتقليل الوزن فقط"],a:0,why:"سحب السماكة يتناسب مع (t/c)²."}],
  ref:"الموضوع المقابل: النظرية الخطية للمقاطع فوق الصوتية (Linearized Supersonic Flow)."
});
const cpStar=M=>2/(1.4*M*M)*(Math.pow((2+0.4*M*M)/2.4,3.5)-1);
const cpKT=(c0,M)=>{ const b=Math.sqrt(1-M*M); return c0/(b+(M*M/(1+b))*c0/2); };
LK("foa",{
  ar:"رقم ماخ الحرج", en:"The critical Mach number",
  alt:"مقطع جناح تظهر فوقه منطقة فوق صوتية وموجة صدمية عندما يتجاوز رقم ماخ القيمة الحرجة، ومنحنيا معامل الضغط الأدنى ومعامل الضغط الصوتي يتقاطعان",
  intro:["الهواء فوق الجناح أسرع من الطائرة. لذلك قبل أن تصل الطائرة إلى سرعة الصوت يصل الهواء في نقطة ما على السطح إلى ماخ 1. رقم ماخ للطائرة عندها يسمى «رقم ماخ الحرج».",
         "نجده من تقاطع منحنيين: أقل معامل ضغط على المقطع (يزداد سالبية مع ماخ بتصحيح الانضغاط) ومعامل الضغط الذي يقابل السرعة الصوتية محلياً. بعد الحرج تظهر منطقة فوق صوتية تنتهي بصدمة، ويبدأ السحب يرتفع."],
  ctl:[{k:"cp0",ar:"أقل Cp عند السرعة المنخفضة",min:-1.5,max:-0.2,step:0.01,v:-0.43,f:v=>nf(v,2)},{k:"M",ar:"رقم ماخ للطيران",min:0.3,max:0.95,step:0.01,v:0.78,f:v=>nf(v,2)}],
  pre:[{ar:"NACA 0012 عند α=0",set:{cp0:-0.43}},{ar:"مقطع سميك",set:{cp0:-0.9}},{ar:"مقطع رقيق",set:{cp0:-0.25}}],
  calc(st){ st.Mcr=kRoot(M=>cpKT(st.cp0,M)-cpStar(M),0.1,0.99); st.cpm=cpKT(st.cp0,st.M); st.cps=cpStar(st.M); st.sup=st.M>st.Mcr; },
  scene(g,r,st,C){ const ox=r.x+r.w*0.1, oy=r.y+r.h*0.62, ch=r.w*0.8, t=clamp(-st.cp0*0.22,0.06,0.3);
    if(st.sup){ const k=clamp((st.M-st.Mcr)/(1-st.Mcr),0,1), x0=0.08, x1=0.25+0.5*k, P0=ox+x0*ch, P1=ox+x1*ch, hh=ch*(0.05+0.2*k);
      g.fillStyle=mixC(C.panel,C.power,0.22); g.beginPath(); g.moveTo(P0,oy-ch*t*0.4); g.quadraticCurveTo((P0+P1)/2,oy-ch*t*0.4-hh*2,P1,oy-ch*t*0.35); g.lineTo(P1,oy-ch*t*0.2); g.closePath(); g.fill();
      lline(g,[[P1,oy-ch*t*0.3],[P1+4,oy-ch*t*0.4-hh*1.1]],C.power,3); ltx(g,"منطقة فوق صوتية",(P0+P1)/2,oy-ch*t*0.4-hh*1.3,{c:C.power,s:10,rtl:true}); ltx(g,"صدمة",P1+8,oy-ch*t*0.4-hh*1.2,{c:C.power,s:10,a:"left",rtl:true}); }
    kFoil(g,ox,oy,ch,0,C,{m:0,t});
    ltx(g,"M = "+nf(st.M,2)+(st.sup?" > Mcr":" < Mcr"),r.x+r.w*0.5,r.y+18,{s:13,w:600,m:true,c:st.sup?C.power:C.ctrl}); },
  plot(st){ return {x:[0.3,1],y:[0,3],xl:"M",yl:"−Cp",curves:[{f:M=>-cpStar(M),c:"power"},{f:M=>-cpKT(st.cp0,M),c:"hyd"},{f:M=>-st.cp0/Math.sqrt(1-M*M),c:"muted",dash:[4,3]}],
    vl:[{x:st.M,c:"accent"}],dots:[{x:st.Mcr,y:-cpStar(st.Mcr),c:"ctrl",t:"Mcr"}],leg:[{c:"power",t:"Cp*"},{c:"hyd",t:"Cp min"},{c:"muted",t:"PG",dash:[4,3]}]}; },
  ro(st){ return [["رقم ماخ الحرج",nf(st.Mcr,3)],["أقل Cp عند M الحالي",nf(st.cpm,3)],["Cp الصوتي Cp*",nf(st.cps,3)],["الحالة",st.sup?"توجد منطقة فوق صوتية":"كل الانسياب دون صوتي"]]; },
  eq:["Cp* = (2/γM²)[((2 + (γ−1)M²)/(γ+1))^(γ/(γ−1)) − 1]","كارمان–تسيين: Cp = Cp₀ / (√(1−M²) + [M²/(1+√(1−M²))] Cp₀/2)","Mcr: Cp,min(M) = Cp*(M)"],
  note:["المنحنى المتقطع تصحيح براندتل–غلاورت الأبسط، والأزرق كارمان–تسيين الأدق.","طائرات النقل تطير قليلاً فوق الحرج؛ المقاطع فوق الحرجة تجعل الصدمة ضعيفة فيتأخر ارتفاع السحب."],
  quiz:[{q:"المقطع الأسمك له رقم ماخ حرج:",o:["أعلى","أقل","مساوٍ"],a:1,why:"الهواء يتسارع فوقه أكثر فيصل إلى ماخ 1 مبكراً."},
        {q:"عند رقم ماخ الحرج يكون:",o:["كل الهواء فوق صوتي","الهواء صوتياً في نقطة واحدة على السطح","الجناح منهاراً"],a:1,why:"هذا تعريفه: أول نقطة تصل إلى ماخ 1."}],
  show:{ar:"اعرض صندوق الجناح",fn:()=>lrnSel("wingbox")},
  ref:"الموضوع المقابل: رقم ماخ الحرج (Critical Mach Number)."
});
LK("foa",{
  ar:"درجة حرارة الركود ومجس TAT", en:"Stagnation temperature and the TAT probe",
  alt:"مجس درجة حرارة كلية على جسم الطائرة يتباطأ الهواء داخله فيسخن، وشاشة تعرض TAT وSAT، ومنحنى ارتفاع الحرارة مع رقم ماخ",
  intro:["عندما يتوقف الهواء داخل مجس الحرارة تتحول طاقته الحركية إلى حرارة، فيقرأ المجس درجة أعلى من حرارة الهواء الحقيقية. القراءة تسمى درجة الحرارة الكلية TAT، والحقيقية الساكنة SAT.",
         "الفرق يكبر مع مربع رقم ماخ: عند ماخ 0.8 يقارب 27 درجة. هذا مهم للطيار لأن حرارة الوقود في الخزانات تقترب من TAT في الرحلات الطويلة، ولأن تكوّن الجليد يُقدَّر بالحرارة الحقيقية."],
  ctl:[{k:"alt",ar:"الارتفاع",min:0,max:43000,step:500,v:35000,f:v=>nf(v,0)+" ft"},{k:"M",ar:"رقم ماخ",min:0,max:0.95,step:0.01,v:0.78,f:v=>nf(v,2)},{k:"dev",ar:"الانحراف عن ISA",min:-20,max:20,step:1,v:0,f:v=>(v>0?"+":"")+nf(v,0)+" °C"}],
  calc(st){ st.T=isa(st.alt*0.3048).T+st.dev; st.TT=st.T*(1+0.2*st.M*st.M); st.rise=st.TT-st.T; st.p0=Math.pow(1+0.2*st.M*st.M,3.5); },
  scene(g,r,st,C){ const sx=r.x+r.w*0.08, sy=r.y+r.h*0.62; g.fillStyle=mixC(C.panel,C.struct,0.3); g.fillRect(r.x,sy,r.w*0.62,r.h*0.1); ltx(g,"جلد الطائرة",r.x+r.w*0.3,sy+r.h*0.05,{s:10,rtl:true});
    g.fillStyle=mixC(C.panel,C.ink,0.5); g.fillRect(sx+r.w*0.24,sy-r.h*0.3,r.w*0.03,r.h*0.3); g.fillRect(sx+r.w*0.13,sy-r.h*0.34,r.w*0.17,r.h*0.06);
    const ix=sx+r.w*0.13, iy=sy-r.h*0.31; for(let i=0;i<12;i++){ const f=((st.t*0.6+i/12)%1), x=r.x+f*(ix-r.x+r.w*0.08), slow=x>ix?Math.pow(1-(x-ix)/(r.w*0.08),0.5):1, c=x>ix?mixC(C.hyd,C.power,1-slow):C.hyd; ldot(g,Math.min(x,ix+r.w*0.08),iy+((i%3)-1)*4,2.2,c,0.9); }
    const bx=r.x+r.w*0.66, bw=r.w*0.32, by=r.y+r.h*0.2; kBox(g,bx,by,bw,r.h*0.46,"#1d242b",C,"",{stroke:"#5d6873"});
    ltx(g,"TAT",bx+10,by+r.h*0.12,{c:"#9fb0bf",s:11,a:"left",m:true}); ltx(g,(st.TT-273.15>0?"+":"")+nf(st.TT-273.15,0)+" °C",bx+bw-10,by+r.h*0.12,{c:"#7fe08a",s:15,w:600,a:"right",m:true});
    ltx(g,"SAT",bx+10,by+r.h*0.32,{c:"#9fb0bf",s:11,a:"left",m:true}); ltx(g,(st.T-273.15>0?"+":"")+nf(st.T-273.15,0)+" °C",bx+bw-10,by+r.h*0.32,{c:"#7fe08a",s:15,w:600,a:"right",m:true}); },
  plot(st){ return {x:[0,1],y:[0,50],xl:"M",yl:"TAT − SAT (°C)",curves:[{f:M=>st.T*0.2*M*M,c:"power"}],dots:[{x:st.M,y:st.rise,t:"+"+nf(st.rise,1)}]}; },
  ro(st){ return [["الحرارة الساكنة SAT",nf(st.T-273.15,1)+" °C"],["الحرارة الكلية TAT",nf(st.TT-273.15,1)+" °C"],["الارتفاع بسبب السرعة",nf(st.rise,1)+" °C"],["p₀/p",nf(st.p0,3)]]; },
  eq:["T₀/T = 1 + (γ−1)/2 · M²","TAT ≈ SAT (1 + 0.2 M²) (بالكلفن)","p₀/p = (1 + 0.2 M²)^3.5"],
  note:["المجس الحقيقي له «معامل استرداد» أقل قليلاً من 1، والقيم هنا مثالية.","المجس مسخّن كهربائياً ليمنع الجليد، والتسخين على الأرض قد يرفع القراءة قليلاً."],
  quiz:[{q:"على 35000 قدم وماخ 0.8، TAT أعلى من SAT بحوالي:",o:["3 °C","27 °C","80 °C"],a:1,why:"0.2 × 0.64 × 218 K ≈ 28 K."},
        {q:"لماذا يهتم الطيار بـ TAT في الرحلات الطويلة جداً؟",o:["لأن حرارة الوقود تقترب منها وقد يتجمد","لأنها تحدد السرعة","لأنها تحدد الوزن"],a:0,why:"الوقود في الأجنحة يبرد نحو TAT؛ إذا اقترب من حد التجمد يزيد الطيار السرعة أو ينزل."}],
  show:{ar:"اعرض الإلكترونيات",fn:()=>lrnSel("avionics")},
  ref:"الموضوع المقابل: الخواص الكلية (الركود) للانسياب (Total Conditions)."
});
const rayF=M=>4.8*M*M*(1+0.2*M*M)/((1+1.4*M*M)**2);
LK("foa",{
  ar:"تسخين الهواء في أنبوب: انسياب رايلي", en:"Heat addition in a duct: Rayleigh flow",
  alt:"أنبوب فيه لهب في المنتصف وجزيئات هواء تتسارع أو تتباطأ بعده، ومنحنى نسبة الحرارة الكلية مع رقم ماخ يصل قمته عند ماخ 1",
  intro:["إضافة الحرارة لهواء يجري في أنبوب ثابت المساحة (كغرفة الاحتراق) تدفع رقم ماخ دائماً نحو 1: الانسياب دون الصوتي يتسارع، وفوق الصوتي يتباطأ. ويخسر الهواء جزءاً من ضغطه الكلي.",
         "هناك حد للحرارة الممكن إضافتها: عندما يصل الهواء إلى ماخ 1 عند المخرج «يختنق» الأنبوب، وأي حرارة زائدة تجبر ما قبله على التغيّر. لهذا تصمم غرف الاحتراق بسرعة دخول منخفضة."],
  ctl:[{k:"M1",ar:"رقم ماخ عند الدخول",min:0.1,max:3,step:0.01,v:0.3,f:v=>nf(v,2)},{k:"q",ar:"الحرارة المضافة",min:0,max:1500,step:10,v:500,f:v=>nf(v,0)+" kJ/kg"},{k:"T01",ar:"الحرارة الكلية عند الدخول",min:300,max:900,step:10,v:600,f:v=>nf(v,0)+" K"}],
  calc(st){ st.T02=st.T01+st.q/1.005; const r=rayF(st.M1)*st.T02/st.T01; st.ch=r>=1; const sub=st.M1<1;
    st.M2=st.ch?1:(sub?kRoot(M=>rayF(M)-r,st.M1,1):kRoot(M=>rayF(M)-r,1,st.M1)); st.qmax=(st.T01/rayF(st.M1)-st.T01)*1.005; st.p=(1+1.4*st.M1**2)/(1+1.4*st.M2**2); },
  scene(g,r,st,C){ const cy=r.y+r.h*0.45, h=r.h*0.36, x0=r.x+4, x1=r.x+r.w-4, xf=r.x+r.w*0.42, xf2=r.x+r.w*0.58;
    g.fillStyle=mixC(C.panel,C.hyd,0.08); g.fillRect(x0,cy-h/2,x1-x0,h); lline(g,[[x0,cy-h/2],[x1,cy-h/2]],C.ink,2); lline(g,[[x0,cy+h/2],[x1,cy+h/2]],C.ink,2);
    for(let i=0;i<7;i++){ const fx=xf+(xf2-xf)*(i+0.5)/7, fl=h*0.3*(0.6+0.4*Math.sin(st.t*9+i*1.7)); g.fillStyle=mixC(C.fuel,C.power,i%2?0.3:0.7); g.beginPath(); g.moveTo(fx-6,cy+h/2); g.quadraticCurveTo(fx,cy+h/2-fl*2,fx+6,cy+h/2); g.fill(); }
    const v1=st.M1, v2=st.M2; for(let k=0;k<5;k++){ const y=cy-h/2+h*(k+0.5)/5; for(let j=0;j<3;j++){ const ph=(st.t*0.15+j/3+k*0.11)%1; const sAt=f=>f<0.42?v1:f>0.58?v2:v1+(v2-v1)*(f-0.42)/0.16; const f=ph; ldot(g,x0+f*(x1-x0),y,2.2,mixC(C.hyd,C.power,f<0.5?0:Math.min(1,st.q/1500+0.2)),0.9); } }
    ltx(g,"M₁ = "+nf(st.M1,2),r.x+r.w*0.18,cy-h/2-14,{s:12,w:600,m:true}); ltx(g,"M₂ = "+nf(st.M2,2),r.x+r.w*0.82,cy-h/2-14,{s:12,w:600,m:true,c:st.ch?C.power:C.ctrl});
    ltx(g,"حرارة",(xf+xf2)/2,cy+h/2+14,{c:C.power,s:10,rtl:true}); if(st.ch) ltx(g,"اختناق حراري: الحرارة أكثر من الحد",r.x+r.w*0.5,r.y+r.h*0.9,{c:C.power,s:12,w:600,rtl:true}); },
  plot(st){ return {x:[0.05,3],y:[0,1.1],xl:"M",yl:"T₀/T₀*",curves:[{f:rayF,c:"hyd"}],hl:[{y:1,t:"ماخ 1",c:"power"}],dots:[{x:st.M1,y:rayF(st.M1),c:"muted",t:"1"},{x:st.M2,y:rayF(st.M2),c:st.ch?"power":"ctrl",t:"2"}]}; },
  ro(st){ return [["الحرارة الكلية عند الخروج",nf(st.T02,0)+" K"],["أقصى حرارة قبل الاختناق",nf(Math.max(0,st.qmax),0)+" kJ/kg"],["M₂",nf(st.M2,3)+(st.ch?" (مختنق)":"")],["p₂/p₁",nf(st.p,3)]]; },
  eq:["T₀/T₀* = 2(γ+1)M²(1 + (γ−1)M²/2) / (1 + γM²)²","p₂/p₁ = (1 + γM₁²) / (1 + γM₂²)","q = c_p (T₀₂ − T₀₁)"],
  note:["في الانسياب دون الصوتي يقل الضغط الساكن مع التسخين، ولهذا يحاول المصممون إدخال الهواء إلى الاحتراق ببطء.","الاحتكاك في الأنبوب (انسياب فانو) يدفع ماخ نحو 1 أيضاً لكن بآلية مختلفة."],
  quiz:[{q:"تسخين انسياب دون صوتي في أنبوب ثابت المساحة:",o:["يبطئه","يسرّعه نحو ماخ 1","لا يغير سرعته"],a:1,why:"الكثافة تقل مع التسخين، فلنقل نفس الكتلة يجب أن تزيد السرعة."},
        {q:"ماذا يحدث إذا أضفنا حرارة أكثر من الحد؟",o:["يصبح الانسياب فوق صوتياً","يختنق الأنبوب وتتغير الظروف قبله","لا شيء"],a:1,why:"لا يمكن تجاوز ماخ 1 بالتسخين وحده."}],
  show:{ar:"اعرض قلب المحرك",fn:()=>lrnSel("eng_core")},
  ref:"الموضوع المقابل: الانسياب مع إضافة الحرارة (Rayleigh Flow)."
});
LK("foa",{
  ar:"الأجنحة المائلة: لماذا يؤخر الميلان ارتفاع السحب", en:"Swept wings: delaying drag rise",
  alt:"منظر علوي لجناح مائل وسهم السرعة مقسوم إلى مركبة عمودية على الحافة ومركبة على طولها، ومنحنى رقم ماخ الحرج مع زاوية الميلان",
  intro:["الجناح المائل «يرى» فقط مركبة السرعة العمودية على حافته الأمامية، أما المركبة الموازية للحافة فلا تولّد ضغطاً تقريباً. لذلك يتصرف الجناح كأنه يطير بماخ أصغر: M × cos Λ.",
         "هكذا يتأخر ظهور الصدمات وارتفاع السحب، وهذا سبب ميلان أجنحة الطائرات النفاثة. في الواقع الفائدة أقل من النظرية البسيطة بسبب أطراف الجناح وجذره، وثمن الميلان رفع أقل لكل درجة وانهيار أصعب عند الأطراف."],
  ctl:[{k:"M",ar:"رقم ماخ للطيران",min:0.5,max:0.95,step:0.01,v:0.82,f:v=>nf(v,2)},{k:"L",ar:"زاوية الميلان",min:0,max:45,step:0.5,v:25,f:v=>nf(v,1)+"°"},{k:"mc",ar:"ماخ الحرج للمقطع",min:0.6,max:0.8,step:0.005,v:0.7,f:v=>nf(v,3)}],
  pre:[{ar:"737 (25°)",set:{L:25,M:0.79}},{ar:"A380 (33.5°)",set:{L:33.5,M:0.85}},{ar:"بلا ميلان",set:{L:0,M:0.7}}],
  calc(st){ const c=Math.cos(st.L*D2R); st.Mn=st.M*c; st.Mi=st.mc/c; st.Mp=st.mc/Math.sqrt(c); st.dCD=st.M>st.Mp?20*Math.pow(st.M-st.Mp,4):0; st.cla=c; },
  scene(g,r,st,C){ const L=st.L*D2R, rx=r.x+r.w*0.5, ry=r.y+r.h*0.15, span=r.w*0.42, ch=r.h*0.22, tip=y=>ry+y*Math.tan(L);
    g.fillStyle=mixC(C.panel,C.struct,0.35); g.strokeStyle=C.ink; g.lineWidth=1.4; [-1,1].forEach(s=>{ g.beginPath(); g.moveTo(rx,ry); g.lineTo(rx+s*span,tip(span)); g.lineTo(rx+s*span,tip(span)+ch*0.45); g.lineTo(rx,ry+ch); g.closePath(); g.fill(); g.stroke(); });
    g.fillStyle=mixC(C.panel,C.struct,0.5); g.fillRect(rx-r.w*0.025,ry-r.h*0.08,r.w*0.05,r.h*0.8);
    const px=rx+span*0.55, py=tip(span*0.55)+ch*0.2, V=Math.min(r.h*0.3,py-r.y-6), n=[-Math.sin(L),Math.cos(L)];
    larrow(g,px,py-V,px,py,C.ink,2.5,8); ltx(g,"V",px+8,py-V*0.7,{s:12,w:600,a:"left",m:true});
    const ex=px-Math.sin(L)*V*Math.cos(L), ey=py-V+V*Math.cos(L)*Math.cos(L);
    larrow(g,px,py-V,ex,ey,C.ctrl,2.5,8); larrow(g,ex,ey,px,py,C.muted,2,7);
    ltx(g,"عمودية: V cos Λ",ex-8,ey,{c:C.ctrl,s:11,a:"right",rtl:true}); ltx(g,"Mn = "+nf(st.Mn,3),r.x+r.w*0.5,r.y+r.h*0.98,{s:13,w:600,m:true,c:st.M>st.Mp?C.power:C.ctrl}); },
  plot(st){ return {x:[0,45],y:[0.6,1.1],xl:"Λ (°)",yl:"Mcr",curves:[{f:L=>st.mc/Math.cos(L*D2R),c:"muted",dash:[4,3]},{f:L=>st.mc/Math.sqrt(Math.cos(L*D2R)),c:"hyd"}],hl:[{y:st.M,t:"M الطيران",c:"accent"}],dots:[{x:st.L,y:st.Mp}],leg:[{c:"muted",t:"نظري",dash:[4,3]},{c:"hyd",t:"عملي"}]}; },
  ro(st){ return [["ماخ العمودي Mn",nf(st.Mn,3)],["Mcr نظري (÷cos Λ)",nf(st.Mi,3)],["Mcr عملي تقريباً",nf(st.Mp,3)],["زيادة السحب تقريباً",nf(st.dCD*1e4,0)+" counts"],["ميل الرفع",nf(st.cla*100,0)+"% من غير المائل"]]; },
  eq:["M_n = M cos Λ","Mcr(مائل) ≈ Mcr(مقطع) / cos Λ (نظرية الجناح اللانهائي)","C_Lα(مائل) ≈ C_Lα cos Λ"],
  note:["الطائرات الأسرع تحتاج ميلاناً أكبر، لكن الميلان يزيد الوزن ويقلل الرفع عند الإقلاع والهبوط.","التصحيح «العملي» هنا تقريب شائع وليس قانوناً دقيقاً."],
  quiz:[{q:"جناح مائل 30° يطير بماخ 0.8، ماخ العمودي:",o:["0.8","0.69","0.4"],a:1,why:"0.8 × cos 30° ≈ 0.69."},
        {q:"ثمن الميلان الكبير:",o:["رفع أقل لكل درجة وانهيار الأطراف","سحب موجة أكبر","وزن أقل"],a:0,why:"C_Lα يقل مع cos Λ، والهواء يجري نحو الأطراف."}],
  show:{ar:"اعرض طرف الجناح",fn:()=>lrnSel("wingtip")},
  ref:"الموضوع المقابل: الأجنحة المائلة (Swept Wings)."
});
LK("foa",{
  ar:"الأجنحة الدلتا ورفع الدوامات", en:"Delta wings and vortex lift",
  alt:"منظر علوي لجناح دلتا تلتف فوق حافتيه دوامتان تكبران مع زاوية الهجوم، ومنحنى معامل الرفع مع وبدون رفع الدوامات",
  intro:["على الجناح المثلث (الدلتا) ذي الحافة الحادة ينفصل الهواء عند الحافة الأمامية ويلتف في دوامتين كبيرتين فوق الجناح. الضغط المنخفض داخلهما يضيف رفعاً كبيراً لا تتنبأ به النظرية العادية.",
         "تقدير بولهاموس يقسم الرفع إلى جزء «عادي» وجزء «دوامي» يزيد مع sin²α. هذا ما سمح لطائرات مثل كونكورد بالهبوط بزوايا هجوم كبيرة. عند زاوية معينة «تنفجر» الدوامة فوق الجناح ويقل الرفع."],
  ctl:[{k:"AR",ar:"نسبة الباع",min:0.8,max:3,step:0.05,v:1.5,f:v=>nf(v,2)},{k:"al",ar:"زاوية الهجوم",min:0,max:45,step:0.5,v:15,f:v=>nf(v,1)+"°"}],
  calc(st){ st.Kp=2*Math.PI*st.AR/(2+Math.sqrt(st.AR*st.AR+4)); st.Kv=Math.PI; st.ab=40-6*st.AR;
    st.f=(a,v)=>{ const s=Math.sin(a*D2R), c=Math.cos(a*D2R), bk=a>st.ab?Math.max(0,1-(a-st.ab)/12):1; return st.Kp*s*c*c+(v?st.Kv*s*s*c*bk:0); };
    st.CLp=st.f(st.al,false); st.CL=st.f(st.al,true); st.CLv=st.CL-st.CLp; st.burst=st.al>st.ab; },
  scene(g,r,st,C){ const ax=r.x+r.w*0.5, ay=r.y+r.h*0.08, len=r.h*0.82, half=Math.min(r.w*0.46,len*st.AR/4);
    g.fillStyle=mixC(C.panel,C.struct,0.35); g.strokeStyle=C.ink; g.lineWidth=1.5; g.beginPath(); g.moveTo(ax,ay); g.lineTo(ax+half,ay+len); g.lineTo(ax-half,ay+len); g.closePath(); g.fill(); g.stroke();
    const k=clamp(st.al/30,0,1); [-1,1].forEach(s=>{ for(let i=1;i<=10;i++){ const f=i/10, x=ax+s*half*f*0.72, y=ay+len*f, rr=(2+f*22)*k; if(st.burst&&f>Math.max(0.3,1-(st.al-st.ab)/10)){ for(let j=0;j<4;j++) ldot(g,x+(Math.random()-0.5)*rr*1.6,y+(Math.random()-0.5)*rr,1.6,C.power,0.6); continue; }
      if(rr>1){ g.strokeStyle=mixC(C.panel,C.hyd,0.8); g.lineWidth=1.3; const ph=st.t*6*s+i; g.beginPath(); g.arc(x,y,rr,ph,ph+4.6); g.stroke(); } } });
    ltx(g,st.burst?"انفجار الدوامة":"دوامتا الحافة الأمامية",ax,ay+len+16,{c:st.burst?C.power:C.hyd,s:11,w:600,rtl:true}); },
  plot(st){ return {x:[0,45],y:[0,1.6],xl:"α (°)",yl:"C_L",curves:[{f:a=>st.f(a,false),c:"muted",dash:[4,3]},{f:a=>st.f(a,true),c:"hyd"}],vl:[{x:st.ab,c:"power",t:"انفجار"}],dots:[{x:st.al,y:st.CL}],leg:[{c:"hyd",t:"مع الدوامات"},{c:"muted",t:"عادي",dash:[4,3]}]}; },
  ro(st){ return [["C_L العادي",nf(st.CLp,3)],["C_L الدوامي",nf(st.CLv,3)],["C_L الكلي",nf(st.CL,3)],["حصة الدوامات",st.CL>0?nf(st.CLv/st.CL*100,0)+"%":"—"]]; },
  eq:["C_L = K_p sin α cos²α + K_v sin²α cos α","K_p ≈ 2πA / (2 + √(A² + 4)) ، K_v ≈ π"],
  note:["زاوية انفجار الدوامة هنا تقديرية وتتغير مع شكل الجناح.","الرفع الدوامي يأتي مع سحب كبير، لذلك تقترب الدلتا من المدرج بقوة محرك عالية."],
  quiz:[{q:"رفع الدوامات يزيد مع:",o:["sin α","sin²α","لا يتغير"],a:1,why:"يتناسب مع مربع زاوية الهجوم تقريباً."},
        {q:"ماذا يحدث عند انفجار الدوامة فوق الجناح؟",o:["يزيد الرفع","يقل الرفع فجأة","تتوقف المحركات"],a:1,why:"الدوامة المنظمة تتحول لاضطراب فيرتفع الضغط فوق الجناح."}],
  ref:"الموضوع المقابل: الأجنحة الدلتا وتشبيه شفط الحافة الأمامية (Delta Wings, Vortex Lift)."
});
function waveDQ(A){ const N=A.length, dx=1/(N-1), A2=new Float64Array(N); for(let i=1;i<N-1;i++) A2[i]=(A[i+1]-2*A[i]+A[i-1])/(dx*dx); let s=0;
  for(let i=1;i<N-1;i++) for(let j=1;j<N-1;j++){ s+=A2[i]*A2[j]*(i===j?(Math.log(dx)-1.5):Math.log(Math.abs(i-j)*dx)); } return -s*dx*dx/(2*Math.PI); }
LK("foa",{
  ar:"قاعدة المساحة وجسم سيرز–هاك", en:"The area rule and the Sears–Haack body",
  alt:"منظر علوي لجسم طائرة وجناح، مع خصر في الجسم عند الجناح عند تطبيق قاعدة المساحة، ومنحنيات توزيع مساحة المقطع على الطول",
  intro:["قرب سرعة الصوت وما بعدها يعتمد سحب الموجة على توزيع مساحة المقطع العرضي للطائرة على طولها، لا على شكلها التفصيلي. أقل سحب لطول وحجم معينين يعطيه شكل مغزلي ناعم يسمى جسم سيرز–هاك.",
         "عندما يضاف الجناح تقفز المساحة فجأة فيزيد السحب. الحل «قاعدة المساحة»: تضييق الجسم عند الجناح (خصر) لتبقى المساحة الكلية ناعمة. ويقل سحب الموجة كثيراً كلما زادت نحافة الجسم."],
  ctl:[{k:"f",ar:"نسبة النحافة L/D",min:6,max:20,step:0.5,v:10,f:v=>nf(v,1)},{k:"wv",ar:"حجم الجناح ÷ حجم الجسم",min:0,max:0.4,step:0.01,v:0.2,f:v=>nf(v*100,0)+"%"}],
  tog:[{k:"waist",ar:"تطبيق قاعدة المساحة (خصر)",v:false}],
  calc(st){ const N=121, sh=x=>Math.pow(Math.max(0,4*x*(1-x)),1.5), bump=x=>Math.exp(-(((x-0.56)/0.13)**2)); let iS=0,iB=0; for(let i=0;i<N;i++){ const x=i/(N-1); iS+=sh(x); iB+=bump(x); }
    const Am=Math.PI/4/(st.f*st.f), kb=st.wv*iS/iB; st.Af=[]; st.Aw=[]; st.At=[]; st.As=[];
    for(let i=0;i<N;i++){ const x=i/(N-1), af=Am*sh(x), aw=Am*kb*bump(x), tgt=Am*(1+st.wv)*sh(x); st.As.push(tgt); st.Aw.push(aw); const fus=st.waist?Math.max(tgt-aw,0.15*af):af; st.Af.push(fus); st.At.push(fus+aw); }
    st.Am=Am; st.cdSH=9*Math.PI*Math.PI/8/(st.f*st.f); st.ratio=waveDQ(st.At)/waveDQ(st.As); },
  scene(g,r,st,C){ const N=st.Af.length, x0=r.x+r.w*0.06, L=r.w*0.88, cy=r.y+r.h*0.5, R=a=>Math.sqrt(a/Math.PI)*L*2;
    const wx0=x0+L*0.45, wx1=x0+L*0.68, span=r.h*0.44*Math.min(1,0.4+st.wv*2); g.fillStyle=mixC(C.panel,C.struct,0.25); g.strokeStyle=C.ink; g.lineWidth=1.3;
    if(st.wv>0.005){ g.beginPath(); g.moveTo(wx0,cy); g.lineTo(wx1-L*0.04,cy-span); g.lineTo(wx1,cy-span); g.lineTo(wx1+L*0.03,cy); g.lineTo(wx1,cy+span); g.lineTo(wx1-L*0.04,cy+span); g.closePath(); g.fill(); g.stroke(); }
    g.fillStyle=mixC(C.panel,C.struct,0.45); g.beginPath(); for(let i=0;i<N;i++){ const x=x0+L*i/(N-1); g.lineTo(x,cy-R(st.Af[i])); } for(let i=N-1;i>=0;i--){ const x=x0+L*i/(N-1); g.lineTo(x,cy+R(st.Af[i])); } g.closePath(); g.fill(); g.stroke();
    ltx(g,st.waist?"جسم بخصر عند الجناح":"جسم بلا خصر",r.x+r.w*0.5,r.y+14,{s:12,w:600,rtl:true}); ltx(g,"السماكة مكبّرة مرتين في الرسم",r.x+r.w*0.5,r.y+r.h-8,{c:C.muted,s:10,rtl:true}); },
  plot(st){ const N=st.At.length, P=a=>a.map((v,i)=>[i/(N-1),v/st.Am]); return {x:[0,1],y:[0,1.6],xl:"x / L",yl:"A / A_max",lines:[{pts:P(st.As),c:"muted",dash:[4,3]},{pts:P(st.Af),c:"struct"},{pts:P(st.Aw),c:"fuel"},{pts:P(st.At),c:"power",w:2.6}],
    leg:[{c:"power",t:"الكلية"},{c:"struct",t:"الجسم"},{c:"fuel",t:"الجناح"},{c:"muted",t:"المثالية",dash:[4,3]}]}; },
  ro(st){ return [["C_D موجة لجسم سيرز–هاك",nf(st.cdSH,3)+" (على A_max)"],["سحب الموجة ÷ المثالي",nf(st.ratio,2)+" ×"],["الحالة",st.ratio<1.15?"توزيع ناعم ✓":"قفزة في المساحة تزيد السحب"]]; },
  eq:["D/q = (9π/2) A_max² / L² (سيرز–هاك)","C_D,wave ≈ 9π² / (8 f²) على مساحة المقطع الأكبر","D/q = −(1/2π) ∬ A″(x₁) A″(x₂) ln|x₁ − x₂| dx₁ dx₂"],
  note:["النسبة إلى المثالي محسوبة عددياً بصيغة الأجسام النحيفة، وهي للمقارنة لا للتصميم.","طائرات مثل F-102 لم تستطع تجاوز سرعة الصوت حتى أعيد تصميم جسمها بخصر."],
  quiz:[{q:"قاعدة المساحة تهتم بـ:",o:["شكل الجناح فقط","توزيع مساحة المقطع الكلي على الطول","وزن الطائرة"],a:1,why:"سحب الموجة يعتمد على نعومة توزيع المساحة."},
        {q:"مضاعفة نسبة النحافة تقلل سحب الموجة (على A_max) بمعامل:",o:["2","4","لا تغيّره"],a:1,why:"C_D ∝ 1/f²."}],
  ref:"الموضوع المقابل: سحب الموجة وقاعدة المساحة (Area Rule, Sears–Haack Body)."
});
