/* ---------------- Book 5: Aircraft Structures ---------------- */
function wingLoads(st){ let k="a380"; try{ k=S.ac; }catch(e){} const ac=LAC[k]||LAC.a380, g=(typeof GEO!=="undefined"&&GEO[k])?GEO[k]:null;
  const s=ac.b/2, N=200, dy=s/N, Wt=ac.mtow*G0, L=st.n*Wt/2, me=(k==="a380"?6300:k==="b747"?5800:2400)*G0, engY=g&&g.eng?g.eng:[s*0.35];
  const lam=0.25, cr=2*ac.S/(ac.b*(1+lam)), ch=y=>cr*(1-(1-lam)*y/s), cw=st.fuel?0.33:0.1, wsum=(cr+cr*lam)/2*s;
  const wl=y=>4*L/(Math.PI*s)*Math.sqrt(Math.max(0,1-(y/s)**2)), ww=y=>st.n*cw*Wt/2*ch(y)/wsum;
  const Vs=new Float64Array(N+1), Ms=new Float64Array(N+1);
  for(let i=N-1;i>=0;i--){ const y=(i+0.5)*dy; let dV=(wl(y)-ww(y))*dy; engY.forEach(ye=>{ if(ye>=i*dy&&ye<(i+1)*dy) dV-=st.n*me; }); Vs[i]=Vs[i+1]+dV; Ms[i]=Ms[i+1]+(Vs[i]+Vs[i+1])/2*dy; }
  const def=new Float64Array(N+1), sl=new Float64Array(N+1); for(let i=1;i<=N;i++){ const y=i*dy, kap=Ms[i]/Math.pow(ch(y)/cr,3); sl[i]=sl[i-1]+kap*dy; def[i]=def[i-1]+sl[i]*dy; }
  return {ac,k,s,N,dy,Vs,Ms,def,engY,ch,cr,wl}; }
LESSONS.str.push({
  ar:"الجناح كعارضة: القص والانحناء", en:"The wing as a beam: shear force and bending moment", alt:"منظر أمامي لجناح ينحني للأعلى تحت الرفع ويتلوّن حسب الإجهاد، مع مخططي قوة القص وعزم الانحناء",
  intro:["الجناح عارضة مثبتة من جهة الجسم وحرة عند الطرف. الرفع موزّع على طوله ويدفعه للأعلى، فيتولد قص وعزم انحناء يكبران كلما اقتربنا من الجذر.",
         "وزن المحركات والوقود داخل الجناح يدفع للأسفل عكس الرفع، فيقلل العزم عند الجذر («تخفيف الحمل»). لهذا تُعلّق المحركات على الجناح ويُستهلك وقود الجسم أولاً. القيم تقريبية للطائرة المختارة."],
  ctl:[{k:"n",ar:"معامل الحمل n",min:-1,max:2.5,step:0.05,v:1,f:v=>nf(v,2)+" g"}],
  tog:[{k:"fuel",ar:"الأجنحة مملوءة بالوقود",v:true}],
  pre:[{ar:"طيران مستوٍ 1g",set:{n:1}},{ar:"الحد الهيكلي 2.5g",set:{n:2.5}},{ar:"مطب سالب −1g",set:{n:-1}}],
  init(st){ st.nd=st.n; },
  calc(st){ Object.assign(st,wingLoads(st)); const r=wingLoads(Object.assign({},st,{fuel:false})); st.Mnf=r.Ms[0]; st.Mref=wingLoads(Object.assign({},st,{n:2.5,fuel:false})).Ms[0]; },
  step(st,dt){ st.nd=lease(st.nd,st.n,dt,3); },
  draw(g,W,H,st,C){
    const cx=W/2, y0=H*0.36, span=W*0.44, k=st.nd/Math.max(0.01,st.n||1), tip=st.def[st.N]||1, sc=H*0.17*(st.Ms[0]/st.Mref);
    const pts=[]; for(let i=0;i<=st.N;i+=4){ const y=i*st.dy/st.s, d=(st.def[i]/tip)*sc*k; pts.push([y,d,i]); }
    const smax=Math.abs(st.Mref)/Math.pow(1,2);
    for(const side of [-1,1]){ for(let j=0;j<pts.length-1;j++){ const a=pts[j], b=pts[j+1], idx=a[2], str=Math.abs(st.Ms[idx])/Math.pow(st.ch(idx*st.dy)/st.cr,2)/smax;
        lline(g,[[cx+side*a[0]*span,y0-a[1]],[cx+side*b[0]*span,y0-b[1]]],mixC(C.ctrl,C.power,str*k),9-5*a[0]); } }
    g.fillStyle=mixC(C.panel,C.struct,0.35); g.beginPath(); g.arc(cx,y0+4,H*0.05,0,Math.PI*2); g.fill(); g.strokeStyle=C.ink; g.lineWidth=1.5; g.stroke();
    for(let i=10;i<st.N;i+=22){ const y=i*st.dy, f=st.wl(y)/st.wl(0), d=(st.def[i]/tip)*sc*k; for(const side of [-1,1]){ const x=cx+side*(y/st.s)*span; larrow(g,x,y0-d-6,x,y0-d-6-Math.sign(st.n||1)*Math.max(3,22*f*Math.abs(st.nd)),C.hyd,1.6,6); } }
    st.engY.forEach(ye=>{ const i=Math.round(ye/st.dy), d=(st.def[i]/tip)*sc*k; for(const side of [-1,1]){ const x=cx+side*(ye/st.s)*span; g.fillStyle=C.ink; g.beginPath(); g.ellipse(x,y0-d+12,11,6,0,0,Math.PI*2); g.fill(); larrow(g,x,y0-d+20,x,y0-d+20+16*Math.sign(st.n||1),C.power,1.8,6); } });
    const r1={x:52,y:H*0.62,w:W/2-70,h:H*0.27}, r2={x:W/2+40,y:H*0.62,w:W/2-60,h:H*0.27};
    const vmax=Math.max(1,...Array.from(st.Vs).map(Math.abs)), mmax=Math.max(1,...Array.from(st.Ms).map(Math.abs));
    const P1=lplot(g,r1,[0,1],[-vmax,vmax],{yl:"قوة القص",ylr:true}), P2=lplot(g,r2,[0,1],[-mmax,mmax],{yl:"عزم الانحناء",ylr:true});
    lline(g,[[r1.x,P1.Y(0)],[r1.x+r1.w,P1.Y(0)]],C.line,1); lline(g,[[r2.x,P2.Y(0)],[r2.x+r2.w,P2.Y(0)]],C.line,1);
    const v=[],m=[]; for(let i=0;i<=st.N;i+=2){ v.push([P1.X(i/st.N),P1.Y(st.Vs[i])]); m.push([P2.X(i/st.N),P2.Y(st.Ms[i])]); } lline(g,v,C.accent,2); lline(g,m,C.power,2);
    ltx(g,"الجذر",r1.x,r1.y+r1.h+12,{c:C.muted,s:10,rtl:true}); ltx(g,"الطرف",r1.x+r1.w,r1.y+r1.h+12,{c:C.muted,s:10,rtl:true});
    ltx(g,"الانحناء مكبّر للتوضيح · "+st.ac.n,W-12,18,{c:C.muted,s:10,a:"right",rtl:true});
  },
  ro(st){ return [["قوة القص عند الجذر",nf(st.Vs[0]/1e6,2)+" MN"],["عزم الانحناء عند الجذر",nf(st.Ms[0]/1e6,1)+" MN·m"],["تخفيف العزم بوزن الوقود",st.fuel?nf((1-st.Ms[0]/st.Mnf)*100,0)+"%":"—"],["معامل الحمل",nf(st.n,2)+" g"]]; },
  eq:["dV/dy = −(w_lift − w_weight) ,  dM/dy = −V","w_lift(y) = (4L/πs) √(1 − (y/s)²)   (توزيع إهليلجي)","σ = M·z / I   (إجهاد الانحناء)","κ = M / (E I) ⇒ الانحراف بالتكامل مرتين"],
  note:["أعلى إجهاد في الجذر، لذلك صندوق الجناح أسمك وأقوى هناك ويقل نحو الطرف.","عند مطب سالب ينقلب الحمل: الجزء العلوي يصير تحت الشد والسفلي تحت الضغط.","في اختبار الكسر لطائرة A380 ثُني الجناح حتى 1.5 ضعف الحمل الأقصى، وانكسر قريباً من ذلك."],
  quiz:[{q:"أين يكون عزم الانحناء أكبر؟",o:["عند الطرف","عند الجذر","في المنتصف"],a:1,why:"كل الرفع الموجود خارج نقطة ما يولّد عزماً حولها، والجذر يحمل الجناح كله."},
        {q:"لماذا يقلل الوقود داخل الجناح عزم الجذر؟",o:["لأنه يزيد الرفع","لأن وزنه يعاكس الرفع على طول الجناح","لأنه يبرّد الهيكل"],a:1,why:"الوزن الموزع على الجناح يعطي عزماً معاكساً لعزم الرفع، فينخفض العزم الصافي."}],
  ref:"الموضوع المقابل: انحناء العوارض وتحليل أحمال الجناح (Bending of Beams, Wing Loads).",
  show:{ar:"اعرض صندوق الجناح",fn:()=>lrnSel("wingbox")}
});

const MAT={al:{n:"ألمنيوم 2024",E:73e9,sy:324e6},ti:{n:"تيتانيوم Ti-6Al-4V",E:114e9,sy:880e6},st:{n:"فولاذ 4340",E:200e9,sy:1000e6}};
LESSONS.str.push({
  ar:"انبعاج الأعمدة", en:"Buckling of columns", alt:"عمود يُضغط تدريجياً فيبدأ ينحني جانبياً حتى ينبعج، مع منحنى أويلر للإجهاد الحرج",
  intro:["الأجزاء النحيفة تحت الضغط (مثل الدعامات والأعمدة الطولية في جلد الجسم) قد تفشل قبل أن يصل الإجهاد لحد المادة: تنحني فجأة جانبياً. هذا «الانبعاج».",
         "الحمل الحرج يقل مع مربع الطول، ويعتمد على طريقة تثبيت الطرفين. العمود القصير السميك يفشل بالسحق، والطويل النحيف بالانبعاج. حرّك الحمل واقترب من الحد."],
  ctl:[{k:"P",ar:"الحمل المضغوط P",min:0,max:300,step:0.5,v:40,f:v=>nf(v,1)+" kN"},{k:"L",ar:"طول العمود",min:0.3,max:3,step:0.05,v:1.2,f:v=>nf(v,2)+" m"},{k:"D",ar:"القطر الخارجي للأنبوب",min:20,max:80,step:1,v:40,f:v=>nf(v,0)+" mm"},{k:"tw",ar:"سماكة الجدار",min:1,max:5,step:0.1,v:1.5,f:v=>nf(v,1)+" mm"}],
  pre:[{ar:"طرفان مفصليان K=1",set:{K:1}},{ar:"مثبت وحر K=2",set:{K:2}},{ar:"طرفان مثبتان K=0.5",set:{K:0.5}},{ar:"تيتانيوم",set:{mat:"ti"}},{ar:"ألمنيوم",set:{mat:"al"}}],
  init(st){ st.K=1; st.mat="al"; st.amp=0; },
  calc(st){ const m=MAT[st.mat]||MAT.al, Do=st.D/1000, Di=Do-2*st.tw/1000, I=Math.PI/64*(Do**4-Di**4), A=Math.PI/4*(Do*Do-Di*Di), r=Math.sqrt(I/A);
    st.m=m; st.A=A; st.r=r; st.lam=st.K*st.L/r; st.Pcr=Math.PI*Math.PI*m.E*I/Math.pow(st.K*st.L,2); st.Py=m.sy*A; st.sig=st.P*1000/A;
    st.Pf=Math.min(st.Pcr,st.Py); st.mode=st.Pcr<st.Py?"انبعاج":"سحق (خضوع المادة)"; st.rat=st.P*1000/st.Pf; },
  step(st,dt){ const tgt=st.rat>=1?1:Math.min(1,0.02/(1-st.rat)); st.amp=lease(st.amp,tgt,dt,5); },
  draw(g,W,H,st,C){
    const cx=W*0.22, yt=H*0.12, yb=H*0.88, Lp=yb-yt, A=st.amp*Lp*0.22, failed=st.rat>=1;
    const shp=f=>st.K===2?(1-Math.cos(Math.PI*f/2)):(st.K===0.5?(1-Math.cos(2*Math.PI*f))/2:Math.sin(Math.PI*f));
    const pts=[]; for(let i=0;i<=40;i++){ const f=i/40; pts.push([cx+A*shp(f),yb-f*Lp]); }
    lline(g,pts,failed?C.power:C.ink,Math.max(3,st.D/6));
    g.fillStyle=C.muted; g.fillRect(cx-30,yb,60,8); if(st.K!==2) g.fillRect(cx-30+(st.K===2?A:0),yt-8,60,8);
    larrow(g,pts[40][0],yt-46,pts[40][0],yt-10,C.power,3+Math.min(5,st.rat*3),10); ltx(g,"P",pts[40][0]+12,yt-34,{c:C.power,s:13,w:600,m:true});
    ltx(g,failed?(st.mode==="انبعاج"?"انبعج العمود!":"سُحقت المادة!"):"P / P_crit = "+nf(st.rat,2),cx,H*0.05,{c:failed?C.power:C.ink,s:12,w:600,rtl:failed});
    const r={x:W*0.46,y:22,w:W*0.5,h:H-70}, smax=Math.max(st.m.sy*1.3,1);
    const P=lplot(g,r,[0,250],[0,smax],{xt:[0,50,100,150,200,250],yt:[0,st.m.sy],yf:t=>nf(t/1e6,0),xl:"النحافة KL/r",xlr:true,yl:"الإجهاد الحرج (MPa)",ylr:true});
    lclip(g,r); const e=[]; for(let l=8;l<=250;l+=2) e.push([P.X(l),P.Y(Math.min(smax,Math.PI*Math.PI*st.m.E/(l*l)))]); lline(g,e,C.ctrl,2.2);
    lline(g,[[r.x,P.Y(st.m.sy)],[r.x+r.w,P.Y(st.m.sy)]],C.fuel,1.6,[5,4]); ldot(g,P.X(Math.min(250,st.lam)),P.Y(Math.min(smax,st.Pf/st.A)),6,C.accent); g.restore();
    ltx(g,"منحنى أويلر",r.x+r.w-6,r.y+14,{c:C.ctrl,s:10,a:"right",rtl:true}); ltx(g,"حد خضوع المادة",r.x+r.w-6,P.Y(st.m.sy)-9,{c:C.fuel,s:10,a:"right",rtl:true});
  },
  ro(st){ return [["الحمل الحرج للانبعاج",nf(st.Pcr/1000,1)+" kN"],["حمل السحق",nf(st.Py/1000,1)+" kN"],["نمط الفشل الأول",st.mode],["النحافة KL/r",nf(st.lam,0)],["الإجهاد الحالي",nf(st.sig/1e6,1)+" MPa"],["المادة / K",st.m.n+" / "+nf(st.K,1)]]; },
  eq:["P_cr = π² E I / (K L)²","σ_cr = π² E / (KL/r)² ,  r = √(I/A)","أنبوب: I = π(D⁴ − d⁴)/64","K: مفصلي–مفصلي 1 · مثبت–حر 2 · مثبت–مثبت 0.5"],
  note:["مضاعفة الطول تقسم حمل الانبعاج على 4.","الأنبوب أكفأ من القضيب المصمت لنفس الوزن لأن المادة بعيدة عن المحور فيكبر I.","في جلد الطائرة الرقيق قد «يتجعد» الجلد بين الأعمدة الطولية تحت الضغط بدون أن ينهار الهيكل؛ التصميم يسمح بذلك أحياناً."],
  quiz:[{q:"إذا ضاعفنا طول عمود مفصلي الطرفين، حمل الانبعاج:",o:["يقل للنصف","يقل للربع","لا يتغيّر"],a:1,why:"P_cr ∝ 1/L²."},
        {q:"عمود قصير وسميك جداً يفشل غالباً بـ:",o:["الانبعاج","السحق (خضوع المادة)","الالتواء"],a:1,why:"نحافته صغيرة فحمل أويلر عالٍ جداً، والمادة تخضع قبله."}],
  ref:"الموضوع المقابل: انبعاج الأعمدة والصفائح (Elastic Buckling of Columns and Plates)."
});

LESSONS.str.push({
  ar:"الالتواء: المقاطع المغلقة والمفتوحة", en:"Torsion of thin-walled closed and open sections", alt:"صندوق جناح يلتف تحت عزم، وتدفق القص يدور حول المقطع، ومقارنة مع مقطع مشقوق مفتوح",
  intro:["صندوق الجناح أنبوب مغلق رقيق الجدار. عندما يُلوى، يدور «تدفق قص» ثابت حول الجدار كله (معادلة بريت–باتو)، ويقاوم الالتواء بصلابة عالية جداً.",
         "إذا انقطع الجدار في مكان واحد (مقطع مفتوح)، تنهار صلابة الالتواء مئات المرات لأن القص يضطر يدور داخل سماكة الجدار الرقيق فقط. فعّل «مقطع مفتوح» وشاهد الفرق."],
  ctl:[{k:"T",ar:"عزم الالتواء",min:1,max:200,step:1,v:50,f:v=>nf(v,0)+" kN·m"},{k:"b",ar:"عرض الصندوق",min:0.5,max:3,step:0.05,v:1.5,f:v=>nf(v,2)+" m"},{k:"h",ar:"ارتفاع الصندوق",min:0.1,max:1,step:0.01,v:0.4,f:v=>nf(v,2)+" m"},{k:"tk",ar:"سماكة الجلد",min:1,max:10,step:0.1,v:3,f:v=>nf(v,1)+" mm"}],
  tog:[{k:"open",ar:"مقطع مفتوح (مشقوق)",v:false}],
  init(st){ st.phd=0; st.ph=0; },
  calc(st){ const G=27e9, t=st.tk/1000, A=st.b*st.h, per=2*(st.b+st.h), T=st.T*1000, J=per*t*t*t/3;
    st.q=T/(2*A); st.tauC=st.q/t; st.thC=T*per/t/(4*A*A*G); st.tauO=T*t/J; st.thO=T/(G*J); st.ratio=st.thO/st.thC;
    st.tau=st.open?st.tauO:st.tauC; st.th=st.open?st.thO:st.thC; },
  step(st,dt){ st.ph+=dt; st.phd=lease(st.phd,Math.min(1.2,st.th*10/D2R*0.02),dt,4); },
  draw(g,W,H,st,C){
    const L=W*0.5, x0=W*0.12, cy=H*0.5, bw=Math.min(W*0.18,H*0.5)*st.b/1.6, bh=Math.min(W*0.18,H*0.5)*st.h/1.0*1.2;
    const corner=(f)=>{ const a=st.phd*f, ca=Math.cos(a), sa=Math.sin(a), cx=x0+f*L, cyy=cy-f*H*0.08; return [[-bw/2,-bh/2],[bw/2,-bh/2],[bw/2,bh/2],[-bw/2,bh/2]].map(([u,v])=>[cx+(u*ca-v*sa)*0.55+u*0.0,cyy+(u*sa+v*ca)]); };
    for(let c=0;c<4;c++){ const pts=[]; for(let i=0;i<=20;i++){ pts.push(corner(i/20)[c]); } lline(g,pts,C.muted,1.4); }
    const f0=corner(0), f1=corner(1);
    g.fillStyle=mixC(C.panel,C.struct,0.4); g.strokeStyle=C.ink; g.lineWidth=2; g.beginPath(); f1.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])); g.closePath(); g.fill(); g.stroke();
    g.fillStyle=mixC(C.panel,C.struct,0.2); g.beginPath(); f0.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])); g.closePath(); g.fill(); g.stroke();
    if(st.open){ const m=[(f1[0][0]+f1[1][0])/2,(f1[0][1]+f1[1][1])/2]; g.strokeStyle=C.panel; g.lineWidth=6; g.beginPath(); g.moveTo(m[0]-3,m[1]); g.lineTo(m[0]+3,m[1]); g.stroke(); }
    g.save(); g.strokeStyle=C.power; g.lineWidth=2.5; g.setLineDash([8,7]); g.lineDashOffset=-st.ph*30; g.beginPath(); f1.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])); if(!st.open) g.closePath(); g.stroke(); g.restore();
    larrow(g,x0+L+bw*0.8,cy-H*0.08-bh*0.7,x0+L+bw*0.8,cy-H*0.08+bh*0.7,C.ink,2,8); ltx(g,"T",x0+L+bw*0.8+10,cy-H*0.08,{s:13,w:600,m:true});
    ltx(g,"الالتواء مكبّر للتوضيح · طول الصندوق 10 m",W-12,18,{c:C.muted,s:10,a:"right",rtl:true});
    ltx(g,st.open?"مفتوح: صلابة أقل بـ "+nf(st.ratio,0)+" مرة":"مغلق: تدفق قص ثابت q حول الجدار",W-12,H-16,{c:st.open?C.power:C.hyd,s:12,w:600,a:"right",rtl:true});
  },
  ro(st){ return [["تدفق القص q (مغلق)",nf(st.q/1000,1)+" N/mm"],["أقصى إجهاد قص",nf(st.tau/1e6,1)+" MPa"],["معدل الالتواء",nf(st.th/D2R,4)+" °/m"],["المفتوح أضعف بـ",nf(st.ratio,0)+" مرة"]]; },
  eq:["مغلق (بريت–باتو): q = T / (2A) ,  τ = q / t","dθ/dz = (T / 4A²G) ∮ ds/t","مفتوح: J = (1/3) Σ s t³ ,  τ_max = T t / J ,  dθ/dz = T / (G J)"],
  note:["لهذا يُبنى الجناح كصندوق مغلق بين العارضتين الأمامية والخلفية، والجلد جزء أساسي من الهيكل.","الفتحات الكبيرة (أبواب، فتحات صيانة) تقطع المسار المغلق، فتُقوّى حوافها بإطارات سميكة.","المساحة المحصورة A أهم من سماكة الجدار: صندوق أعرض يقاوم الالتواء أفضل بكثير."],
  quiz:[{q:"لماذا المقطع المغلق أصلب بكثير في الالتواء من المفتوح؟",o:["لأنه أثقل","لأن تدفق القص يدور حول المساحة المحصورة كلها","لأن مادته مختلفة"],a:1,why:"في المغلق ذراع العزم هو المساحة المحصورة، وفي المفتوح القص يدور داخل السماكة الرقيقة فقط."},
        {q:"في المقطع المغلق، تدفق القص q:",o:["ثابت حول المحيط","صفر عند الزوايا","يتغيّر مع السماكة"],a:0,why:"q = T/(2A) ثابت، بينما الإجهاد τ = q/t يكبر حيث الجدار أرق."}],
  ref:"الموضوع المقابل: التواء المقاطع رقيقة الجدار (Torsion of Thin-Walled Sections)."
});

LESSONS.str.push({
  ar:"ضغط المقصورة والإجهاد في جسم الطائرة", en:"Pressurized fuselage: hoop and longitudinal stress", alt:"مقطع دائري لجسم الطائرة ينتفخ قليلاً بضغط المقصورة، مع أسهم إجهاد الطوق والإجهاد الطولي ومؤشر الضغط",
  intro:["على ارتفاع 12 كم الضغط خارج الطائرة حوالي ربع ضغط سطح البحر، بينما المقصورة مضغوطة كأنها على ارتفاع 2400 م تقريباً. الفرق يدفع الجدار للخارج مثل البالون.",
         "جسم الطائرة أسطوانة رقيقة الجدار، والإجهاد حول المحيط («الطوق») ضعف الإجهاد على الطول. وكل رحلة دورة ضغط كاملة، لذلك التعب (Fatigue) من أهم ما يصمم عليه الهيكل."],
  ctl:[{k:"hf",ar:"ارتفاع الطيران",min:0,max:13000,step:100,v:12500,f:v=>nf(v,0)+" m"},{k:"hc",ar:"ارتفاع المقصورة المكافئ",min:0,max:2500,step:50,v:2400,f:v=>nf(v,0)+" m"},{k:"r",ar:"نصف قطر الجسم",min:1.5,max:4,step:0.05,v:3.55,f:v=>nf(v,2)+" m"},{k:"tk",ar:"سماكة الجلد",min:1,max:4,step:0.1,v:2,f:v=>nf(v,1)+" mm"}],
  pre:[{ar:"قريب من A380",set:{r:3.55,tk:2}},{ar:"قريب من 737",set:{r:1.88,tk:1.6}}],
  init(st){ st.inf=0; },
  calc(st){ st.dp=Math.max(0,isa(st.hc).p-isa(st.hf).p); st.sh=st.dp*st.r/(st.tk/1000); st.sl=st.sh/2; },
  step(st,dt){ st.inf=lease(st.inf,st.dp,dt,3); },
  draw(g,W,H,st,C){
    const cx=W*0.3, cy=H*0.5, R0=Math.min(W*0.2,H*0.36), R=R0*(1+0.06*st.inf/60000);
    g.fillStyle=mixC(C.panel,C.sys,0.12); g.strokeStyle=C.ink; g.lineWidth=3; g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.fill(); g.stroke();
    lline(g,[[cx-R*0.95,cy+R*0.35],[cx+R*0.95,cy+R*0.35]],C.muted,2);
    for(let i=0;i<12;i++){ const a=i/12*Math.PI*2, k=clamp(st.inf/60000,0,1.2); larrow(g,cx+Math.cos(a)*R*0.45,cy+Math.sin(a)*R*0.45,cx+Math.cos(a)*R*(0.45+0.4*k),cy+Math.sin(a)*R*(0.45+0.4*k),C.sys,1.6,6); }
    for(let i=0;i<8;i++){ const a=i/8*Math.PI*2+st.t*0.2, x=cx+Math.cos(a)*(R+10), y=cy+Math.sin(a)*(R+10), L=6+24*clamp(st.sh/150e6,0,1.3); larrow(g,x,y,x-Math.sin(a)*L,y+Math.cos(a)*L,C.power,2,6); }
    ltx(g,"σ_طوق",cx,cy-R-24,{c:C.power,s:12,w:600});
    const sx=W*0.58, sw=W*0.36, sy=cy-H*0.12, shh=H*0.24;
    g.fillStyle=mixC(C.panel,C.sys,0.08); g.strokeStyle=C.ink; g.lineWidth=2; g.beginPath(); g.ellipse(sx,sy+shh/2,10,shh/2,0,0,Math.PI*2); g.fill(); g.stroke(); g.strokeRect(sx,sy,sw,shh);
    const Ll=8+30*clamp(st.sl/75e6,0,1.3); [[sy+shh*0.25],[sy+shh*0.75]].forEach(([y])=>{ larrow(g,sx+sw+4,y,sx+sw+4+Ll,y,C.fuel,2,7); });
    ltx(g,"σ_طولي = نصف σ_طوق",sx+sw/2,sy+shh+18,{c:C.fuel,s:11,rtl:true});
    const gx=W*0.76, gy=H*0.18; ltx(g,"Δp = "+nf(st.dp/1000,1)+" kPa ("+nf(st.dp/6894.76,2)+" psi)",gx,gy,{s:13,w:600,m:true});
  },
  ro(st){ return [["فرق الضغط Δp",nf(st.dp/1000,1)+" kPa ("+nf(st.dp/6894.76,2)+" psi)"],["إجهاد الطوق",nf(st.sh/1e6,1)+" MPa"],["الإجهاد الطولي",nf(st.sl/1e6,1)+" MPa"],["دورة ضغط لكل رحلة","نعم: حمل تعب متكرر"]]; },
  eq:["σ_hoop = Δp · r / t","σ_long = Δp · r / (2t)","Δp = p_cabin − p_outside"],
  note:["في الخمسينيات تحطمت طائرات «كومت» بسبب شقوق تعب بدأت من زوايا نوافذ مربعة؛ منذها النوافذ مستديرة الزوايا.","الطائرات الحديثة المصنوعة من المركبات (مثل 787) تسمح بارتفاع مقصورة أقل (حوالي 1800 م) لأن مقاومتها للتعب أعلى.","الجلد الحقيقي يُدعّم بإطارات دائرية وأعمدة طولية، فالإجهاد الفعلي أقل من هذا الحساب البسيط في أغلب المواقع."],
  quiz:[{q:"في أسطوانة رقيقة تحت ضغط داخلي، إجهاد الطوق مقارنة بالطولي:",o:["مساوٍ","ضعفه","نصفه"],a:1,why:"σ_hoop = pr/t و σ_long = pr/(2t)."},
        {q:"لماذا يُحسب الهيكل على التعب؟",o:["لأن كل رحلة تضغط وتفرّغ المقصورة مرة","لأن الطائرة تطير ببطء","لأن الوقود ثقيل"],a:0,why:"آلاف دورات الضغط عبر عمر الطائرة يمكن أن تنمّي شقوقاً صغيرة."}],
  ref:"الموضوع المقابل: الأوعية رقيقة الجدار تحت الضغط والتعب (Thin-Walled Pressure Vessels, Fatigue).",
  show:{ar:"اعرض تمدد الهيكل على الطائرة",fn:()=>lrnSel("fuse_mid",1)}
});

/* =====================================================================================
   Books 6–7: flight stability & automatic control; aerodynamics, aeronautics & flight mechanics
   ===================================================================================== */
/* small complex helpers and polynomial roots (Durand–Kerner) */
const cx_=(re,im)=>({re,im}), cmul=(a,b)=>cx_(a.re*b.re-a.im*b.im,a.re*b.im+a.im*b.re), cdiv=(a,b)=>{ const d=b.re*b.re+b.im*b.im||1e-30; return cx_((a.re*b.re+a.im*b.im)/d,(a.im*b.re-a.re*b.im)/d); }, csub=(a,b)=>cx_(a.re-b.re,a.im-b.im), cadd=(a,b)=>cx_(a.re+b.re,a.im+b.im);
function polyRoots(c){ /* c: [1,c1,...,cn] for x^n + c1 x^(n-1) + ... */ const n=c.length-1; let z=[]; for(let i=0;i<n;i++) z.push(cmul(cx_(0.4,0.9),i?z[i-1]:cx_(1,0)));
  const P=x=>{ let r=cx_(1,0); for(let i=1;i<=n;i++) r=cadd(cmul(r,x),cx_(c[i],0)); return r; };
  for(let it=0;it<500;it++){ let mv=0; z=z.map((zi,i)=>{ let d=cx_(1,0); z.forEach((zj,j)=>{ if(j!==i) d=cmul(d,csub(zi,zj)); }); const dz=cdiv(P(zi),d); mv=Math.max(mv,Math.hypot(dz.re,dz.im)); return csub(zi,dz); }); if(mv<1e-12) break; }
  return z; }
function charPoly(A){ const n=A.length, I=A.map((r,i)=>r.map((_,j)=>i===j?1:0)); let M=A.map(r=>r.map(()=>0)), c=[1];
  const mm=(X,Y)=>X.map((r,i)=>Y[0].map((_,j)=>r.reduce((s,v,k)=>s+v*Y[k][j],0)));
  for(let k=1;k<=n;k++){ M=mm(A,M).map((r,i)=>r.map((v,j)=>v+c[k-1]*I[i][j])); const AM=mm(A,M); let tr=0; for(let i=0;i<n;i++) tr+=AM[i][i]; c.push(-tr/k); }
  return c; }
