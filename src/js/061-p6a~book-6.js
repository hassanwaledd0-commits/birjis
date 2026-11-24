/* ---------------- Book 6: Flight Stability and Automatic Control ---------------- */
LESSONS.fsc.push({
  ar:"الأنماط الطولية: النمط القصير والفوغويد", en:"Longitudinal dynamic modes: short period and phugoid", alt:"لوحتان: على اليسار تذبذب سريع في زاوية الميل يخمد خلال ثوانٍ، وعلى اليمين مسار طويل يرتفع وينخفض ببطء",
  intro:["إذا أزعجت طائرة مستقرة عن طيرانها المستوي، ترجع عبر نمطين مختلفين جداً. «النمط القصير»: تذبذب سريع في زاوية الأنف يخمد خلال ثوانٍ قليلة. و«الفوغويد»: تبادل بطيء بين الارتفاع والسرعة، تصعد فتبطئ ثم تنزل فتسرع، بدورة تقارب دقيقة ونصف أو أكثر.",
         "اضغط «اضطراب» وشاهد الاثنين معاً. الفوغويد معروض بزمن مسرّع ×25 لأنه بطيء جداً، ودوره يقارب √2·π·U/g."],
  ctl:[{k:"U",ar:"سرعة الطيران",min:60,max:260,step:1,v:230,f:v=>nf(v,0)+" m/s"},{k:"LD",ar:"L/D",min:8,max:25,step:0.5,v:18,f:v=>nf(v,1)},{k:"wsp",ar:"تردد النمط القصير ωn",min:1,max:6,step:0.1,v:2.5,f:v=>nf(v,1)+" rad/s"},{k:"zsp",ar:"تخميد النمط القصير ζ",min:0.1,max:0.9,step:0.01,v:0.5,f:v=>nf(v,2)}],
  act:{ar:"اضطراب",fn:st=>{ st.t0=st.t; }},
  init(st){ st.t0=0; },
  calc(st){ st.wp=Math.SQRT2*G0/st.U; st.zp=1/(Math.SQRT2*st.LD); st.wdp=st.wp*Math.sqrt(1-st.zp*st.zp); st.Tp=2*Math.PI/st.wdp;
    st.wds=st.wsp*Math.sqrt(1-st.zsp*st.zsp); st.Ts=2*Math.PI/st.wds; st.th2=Math.log(2)/(st.zp*st.wp); },
  draw(g,W,H,st,C){
    const tau=st.t-st.t0, ths=t=>6*Math.exp(-st.zsp*st.wsp*t)*Math.cos(st.wds*t), hp=t=>Math.exp(-st.zp*st.wp*t)*Math.sin(st.wdp*t);
    const half=W*0.48;
    ltx(g,"النمط القصير (زمن حقيقي)",half/2,16,{c:C.muted,s:11,rtl:true}); ltx(g,"الفوغويد (زمن مسرّع ×25)",half+W*0.04+half/2,16,{c:C.muted,s:11,rtl:true});
    lplane(g,half/2,H*0.3,Math.min(half*0.55,H*0.6),tau<12?ths(tau):0,C,{flip:true});
    const r1={x:40,y:H*0.58,w:half-56,h:H*0.32}, P1=lplot(g,r1,[0,8],[-7,7],{xt:[0,2,4,6,8],yt:[-6,0,6],xl:"s",yl:"θ (°)"});
    lline(g,[[r1.x,P1.Y(0)],[r1.x+r1.w,P1.Y(0)]],C.line,1);
    const a1=[]; for(let t=0;t<=Math.min(8,tau);t+=0.04) a1.push([P1.X(t),P1.Y(ths(t))]); lline(g,a1,C.accent,2);
    const x2=half+W*0.04, r2={x:x2+30,y:H*0.58,w:half-46,h:H*0.32}, Tt=3*st.Tp, P2=lplot(g,r2,[0,Tt],[-1.2,1.2],{xt:[0,Math.round(st.Tp),Math.round(2*st.Tp),Math.round(3*st.Tp)],xl:"s",yl:"Δh"});
    lline(g,[[r2.x,P2.Y(0)],[r2.x+r2.w,P2.Y(0)]],C.line,1);
    const tp=Math.min(Tt,tau*25), a2=[]; for(let t=0;t<=tp;t+=Tt/300) a2.push([P2.X(t),P2.Y(hp(t))]); lline(g,a2,C.power,2);
    const py=H*0.3-hp(tp)*H*0.16, path=[]; for(let i=0;i<=60;i++){ const t=tp-i*st.Tp/60; if(t<0) break; path.push([x2+half*0.75-i*(half*0.7/60),H*0.3-hp(t)*H*0.16]); }
    lline(g,path,C.power,1.5,[4,4]); lplane(g,x2+half*0.75,py,Math.min(half*0.3,H*0.3),Math.atan(st.wdp*Math.cos(st.wdp*tp)*0.6)/D2R,C,{flip:true});
  },
  ro(st){ return [["دور الفوغويد",nf(st.Tp,0)+" s"],["تخميد الفوغويد ζ",nf(st.zp,3)],["زمن نصف السعة (فوغويد)",nf(st.th2,0)+" s"],["دور النمط القصير",nf(st.Ts,2)+" s"],["تخميد النمط القصير",nf(st.zsp,2)]]; },
  eq:["فوغويد (لانشستر): ω_n ≈ √2 · g / U₀ ,  ζ ≈ 1 / (√2 · L/D)","T = 2π / (ω_n √(1 − ζ²))","النمط القصير: θ(t) = A e^(−ζω_n t) cos(ω_d t)"],
  note:["النمط القصير سريع، ويحدد إحساس الطيار بالتحكم؛ لازم يكون تخميده جيداً (حوالي 0.35 إلى 1.3 في المعايير العسكرية).","الفوغويد بطيء وتخميده ضعيف، لكن الطيار يصححه بسهولة، والطيار الآلي يلغيه تقريباً.","كلما زادت L/D قلّ تخميد الفوغويد: الطائرة الأنظف تتأرجح أطول."],
  quiz:[{q:"في الفوغويد، ماذا يتبادل؟",o:["زاوية الهجوم والميلان","الارتفاع والسرعة (طاقة كامنة وحركية)","الدفع والسحب"],a:1,why:"زاوية الهجوم شبه ثابتة، والطائرة تحوّل السرعة إلى ارتفاع وبالعكس."},
        {q:"دور الفوغويد عند 230 m/s تقريباً:",o:["2 ثانية","100 ثانية","10 دقائق"],a:1,why:"T ≈ √2·π·U/g = 1.414 × 3.14 × 230 / 9.81 ≈ 104 s."}],
  show:{ar:"اعرض المصعد على الطائرة",fn:()=>lrnSel("elevator",1)},
  ref:"الموضوع المقابل: الحركة الطولية — أنماط الطيران الديناميكية (Longitudinal Motion: Short-Period and Phugoid Modes)."
});

function latSys(st){ const g_U=G0/200, Yb=-0.12, Lp=-2.0, Lr=0.6, Np=-0.05;
  return [[Yb,0,-1,g_U],[st.Lb,Lp,Lr,0],[st.Nb,Np,st.Nr,0],[0,1,0,0]]; }
LESSONS.fsc.push({
  ar:"الأنماط الجانبية: الهولندي واللولبي والدحرجة", en:"Lateral–directional modes: Dutch roll, spiral and roll", alt:"منظر خلفي يبيّن ميلان الطائرة ومنظر علوي يبيّن اتجاهها، ومنحنيات الانزلاق الجانبي والميلان مع الزمن بعد ركلة دفة",
  intro:["الحركة الجانبية فيها ثلاثة أنماط. «الدحرجة الهولندية»: الطائرة تتأرجح يميناً ويساراً في الاتجاه والميلان معاً مثل متزلج. و«الدحرجة»: الميلان يتوقف بسرعة بعد ترك المقود. و«اللولبي»: نمط بطيء جداً قد يجعل الطائرة تميل تدريجياً في دوامة نازلة.",
         "النتائج هنا محسوبة فعلاً من نموذج خطي بأربع متغيرات: نحسب الجذور المميّزة للمصفوفة ونحاكي ركلة دفة. جرّب تقوية الاستقرار الاتجاهي (مثل ذيل عمودي أكبر)، أو تأثير الزاوية الثنائية (Dihedral)."],
  ctl:[{k:"Nb",ar:"الاستقرار الاتجاهي N_β (ذيل عمودي)",min:0.2,max:6,step:0.05,v:2,f:v=>nf(v,2)},{k:"Lb",ar:"تأثير الزاوية الثنائية L_β",min:-12,max:0,step:0.1,v:-4,f:v=>nf(v,1)},{k:"Nr",ar:"تخميد الانعراج N_r",min:-1.5,max:-0.05,step:0.01,v:-0.35,f:v=>nf(v,2)}],
  act:{ar:"ركلة دفة",fn:st=>{ st.t0=st.t; }},
  pre:[{ar:"زاوية ثنائية كبيرة",set:{Lb:-10,Nb:1.5}},{ar:"ذيل عمودي كبير",set:{Nb:5,Lb:-2}},{ar:"مخمّد انعراج مشغّل",set:{Nr:-1.2}}],
  init(st){ st.t0=0; },
  calc(st){ const A=latSys(st), r=polyRoots(charPoly(A)); st.roots=r;
    const cpx=r.filter(z=>Math.abs(z.im)>1e-6), real=r.filter(z=>Math.abs(z.im)<=1e-6).map(z=>z.re).sort((a,b)=>a-b);
    if(cpx.length){ const z=cpx[0], wn=Math.hypot(z.re,z.im); st.dr={wn,z:-z.re/wn,T:2*Math.PI/Math.abs(z.im)}; } else st.dr=null;
    st.roll=real.length?real[0]:null; st.spiral=real.length>1?real[real.length-1]:null;
    const tr=[]; let y=[0,0,0.12,0], psi=0; const f=(t,x)=>A.map(row=>row.reduce((s,v,j)=>s+v*x[j],0));
    for(let t=0;t<=40.0001;t+=0.02){ tr.push([t,y[0],y[3],psi]); psi+=y[2]*0.02; y=rk4(f,y,t,0.02); }
    st.tr=tr; },
  draw(g,W,H,st,C){
    const tau=(st.t-st.t0)%40, i=Math.min(st.tr.length-1,Math.round(tau/0.02)), [,b,ph,psi]=st.tr[i];
    const rx=W*0.18, ry=H*0.3, sp=Math.min(W*0.13,H*0.26);
    g.save(); g.translate(rx,ry); g.rotate(clamp(ph,-1.4,1.4)); g.strokeStyle=C.ink; g.lineWidth=4; g.beginPath(); g.moveTo(-sp,0); g.lineTo(sp,0); g.stroke();
    g.fillStyle=mixC(C.panel,C.struct,0.35); g.lineWidth=1.4; g.beginPath(); g.arc(0,0,sp*0.13,0,Math.PI*2); g.fill(); g.stroke(); g.fillStyle=C.ink; g.beginPath(); g.moveTo(-3,-sp*0.1); g.lineTo(0,-sp*0.42); g.lineTo(3,-sp*0.1); g.closePath(); g.fill(); g.restore();
    ltx(g,"من الخلف: الميلان φ",rx,H*0.56,{c:C.muted,s:10,rtl:true});
    const tx=W*0.45, ty=H*0.3, L=Math.min(W*0.14,H*0.26);
    g.save(); g.translate(tx,ty); g.rotate(clamp(psi,-1.4,1.4)); g.fillStyle=mixC(C.panel,C.struct,0.35); g.strokeStyle=C.ink; g.lineWidth=1.4;
    g.beginPath(); g.ellipse(0,0,L*0.1,L,0,0,Math.PI*2); g.fill(); g.stroke(); g.beginPath(); g.moveTo(-L,L*0.05); g.lineTo(0,-L*0.25); g.lineTo(L,L*0.05); g.lineTo(L,L*0.15); g.lineTo(0,-L*0.05); g.lineTo(-L,L*0.15); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-L*0.35,L*0.85); g.lineTo(0,L*0.7); g.lineTo(L*0.35,L*0.85); g.lineTo(0,L*0.78); g.closePath(); g.fill(); g.stroke(); g.restore();
    larrow(g,tx+Math.sin(psi+b)*L*1.5,ty-Math.cos(psi+b)*L*1.5,tx+Math.sin(psi+b)*L*1.15,ty-Math.cos(psi+b)*L*1.15,C.ctrl,2,7);
    ltx(g,"من الأعلى: الاتجاه والانزلاق β",tx,H*0.56,{c:C.muted,s:10,rtl:true});
    const r={x:W*0.62,y:24,w:W*0.35,h:H*0.6}; let m=0.05; st.tr.forEach(p=>{ m=Math.max(m,Math.abs(p[1]),Math.abs(p[2])); }); m=Math.min(m,1.2);
    const P=lplot(g,r,[0,40],[-m,m],{xt:[0,10,20,30,40],xl:"s"}); lline(g,[[r.x,P.Y(0)],[r.x+r.w,P.Y(0)]],C.line,1);
    lclip(g,r); const bb=[],pp=[]; st.tr.forEach((p,k)=>{ if(k%3) return; bb.push([P.X(p[0]),P.Y(p[1])]); pp.push([P.X(p[0]),P.Y(p[2])]); }); lline(g,bb,C.ctrl,1.8); lline(g,pp,C.power,1.8);
    lline(g,[[P.X(tau),r.y],[P.X(tau),r.y+r.h]],C.muted,1,[3,3]); g.restore();
    ltx(g,"β انزلاق",r.x+r.w-6,r.y+12,{c:C.ctrl,s:10,a:"right",rtl:true}); ltx(g,"φ ميلان",r.x+r.w-6,r.y+26,{c:C.power,s:10,a:"right",rtl:true});
    const rr={x:W*0.62,y:H*0.72,w:W*0.35,h:H*0.2}, Pr=lplot(g,rr,[-3,0.5],[-3,3],{xt:[-3,-2,-1,0],xl:"Re(λ)"});
    lline(g,[[Pr.X(0),rr.y],[Pr.X(0),rr.y+rr.h]],C.line,1); lline(g,[[rr.x,Pr.Y(0)],[rr.x+rr.w,Pr.Y(0)]],C.line,1);
    st.roots.forEach(z=>{ const x=Pr.X(clamp(z.re,-3,0.5)), y=Pr.Y(clamp(z.im,-3,3)); g.strokeStyle=z.re>0?C.power:C.ink; g.lineWidth=2; g.beginPath(); g.moveTo(x-4,y-4); g.lineTo(x+4,y+4); g.moveTo(x+4,y-4); g.lineTo(x-4,y+4); g.stroke(); });
    ltx(g,"الجذور المميّزة",rr.x-6,rr.y+rr.h/2,{c:C.muted,s:10,a:"right",rtl:true});
  },
  ro(st){ const sp=st.spiral; return [["الهولندي: الدور",st.dr?nf(st.dr.T,2)+" s":"—"],["الهولندي: التخميد ζ",st.dr?nf(st.dr.z,3):"—"],["ثابت زمن الدحرجة",st.roll!=null?nf(-1/st.roll,2)+" s":"—"],
    ["اللولبي",sp==null?"—":(sp<0?"مستقر (نصف السعة "+nf(Math.log(2)/-sp,0)+" s)":"غير مستقر (تضاعف "+nf(Math.log(2)/sp,0)+" s)")]]; },
  eq:["β̇ = Y_β β − r + (g/U₀) φ","ṗ = L_β β + L_p p + L_r r","ṙ = N_β β + N_p p + N_r r ,  φ̇ = p","det(λI − A) = 0  ⇒  الجذور المميّزة = الأنماط"],
  note:["زيادة الزاوية الثنائية تحسّن الاستقرار اللولبي لكنها تسوء الدحرجة الهولندية؛ والذيل الكبير بالعكس. التصميم توازن بينهما.","الطائرات النفاثة ذات الأجنحة المائلة تميل لدحرجة هولندية ضعيفة التخميد، لذلك فيها «مخمّد انعراج» يحرّك الدفة تلقائياً.","اللولبي غير المستقر ببطء مقبول عادة لأن الطيار يصححه بسهولة."],
  quiz:[{q:"ما الذي يحسّن تخميد الدحرجة الهولندية مباشرة؟",o:["زيادة تخميد الانعراج (مخمّد انعراج)","تقليل الذيل العمودي","زيادة الوزن"],a:0,why:"المخمّد يعطي N_r أكبر سلبيةً فيستهلك طاقة التذبذب."},
        {q:"جذر حقيقي موجب صغير يعني:",o:["تذبذب سريع","انحراف بطيء يكبر مع الوقت (لولبي غير مستقر)","استقرار تام"],a:1,why:"الجذر الموجب يعطي e^(λt) متزايداً، والصغير يعني أنه بطيء."}],
  show:{ar:"اعرض الذيل العمودي والدفة",fn:()=>lrnSel("fin",1)},
  ref:"الموضوع المقابل: الحركة الجانبية والاتجاهية (Lateral Directional Motion — Dutch Roll, Spiral, Roll Modes)."
});

function pidSim(st){ const dt=0.002, Tend=12, out=[]; let a=0,q=0,th=0,d=0,I=0; const lim=20*D2R, tc=st.cmd*D2R;
  for(let t=0;t<=Tend;t+=dt){ const c=t>=1?tc:0, e=c-th; let dc=st.kp*e+st.ki*I-st.kd*q; const sat=Math.abs(dc)>lim; dc=clamp(dc,-lim,lim); if(!(sat&&Math.sign(e)===Math.sign(dc))) I+=e*dt;
    d+=(dc-d)/0.1*dt; const da=-1.2*a+q, dq=-4*a-1.2*q+6*d; a+=da*dt; q+=dq*dt; th+=q*dt; if(Math.round(t/dt)%10===0) out.push([t,th/D2R,d/D2R,c/D2R]); }
  const tgt=st.cmd, ys=out.filter(p=>p[0]>=1); let mx=-1e9, tr10=null, tr90=null, ts=1; ys.forEach(p=>{ mx=Math.max(mx,p[1]); if(tr10==null&&p[1]>=0.1*tgt) tr10=p[0]; if(tr90==null&&p[1]>=0.9*tgt) tr90=p[0]; if(Math.abs(p[1]-tgt)>0.02*Math.abs(tgt)) ts=p[0]; });
  return {out,os:tgt?Math.max(0,(mx-tgt)/tgt*100):0,tr:tr10!=null&&tr90!=null?tr90-tr10:null,ts:ts-1,ess:tgt-out[out.length-1][1],dmax:Math.max(...out.map(p=>Math.abs(p[2])))}; }
LESSONS.fsc.push({
  ar:"الطيار الآلي: مثبّت زاوية الأنف (PID)", en:"Autopilot: pitch-attitude hold with PID control", alt:"طائرة ترفع أنفها نحو زاوية مطلوبة، ومنحنى الاستجابة مع الزمن وحركة المصعد",
  intro:["الطيار الآلي يقيس زاوية الأنف θ، ويقارنها بالمطلوب، ويحرّك المصعد (Elevator) ليصحح الفرق. أشهر طريقة: متحكم PID. الجزء P يتفاعل مع الخطأ الحالي، وI يزيل الخطأ المتبقي مع الوقت، وD يخمّد التذبذب.",
         "المحاكاة هنا لنموذج طائرة حقيقي مبسّط (النمط القصير + زاوية الأنف) مع محرّك مصعد له زمن استجابة وحد أقصى ±20°. غيّر المعاملات وراقب: تجاوز الهدف، والسرعة، والتذبذب."],
  ctl:[{k:"cmd",ar:"زاوية الأنف المطلوبة",min:1,max:15,step:0.5,v:5,f:v=>nf(v,1)+"°"},{k:"kp",ar:"المعامل التناسبي Kp",min:0,max:5,step:0.05,v:1.5,f:v=>nf(v,2)},{k:"ki",ar:"المعامل التكاملي Ki",min:0,max:3,step:0.05,v:0.5,f:v=>nf(v,2)},{k:"kd",ar:"المعامل التفاضلي Kd",min:0,max:3,step:0.05,v:0.8,f:v=>nf(v,2)}],
  pre:[{ar:"P فقط",set:{kp:2,ki:0,kd:0}},{ar:"PD",set:{kp:2,ki:0,kd:1}},{ar:"PID متوازن",set:{kp:1.5,ki:0.5,kd:0.8}},{ar:"عدواني",set:{kp:4.5,ki:2.5,kd:0.2}}],
  init(st){ st.t0=0; }, onSet(st){ st.t0=st.t; },
  calc(st){ Object.assign(st,pidSim(st)); },
  draw(g,W,H,st,C){
    const tau=(st.t-st.t0)%13, i=Math.min(st.out.length-1,Math.round(tau/0.02)), p=st.out[i];
    lplane(g,W*0.22,H*0.38,Math.min(W*0.36,H*0.8),p[1],C,{flip:true,marks:(g)=>{ g.save(); g.translate(0.46,-0.02); g.rotate(-p[2]*D2R*2); g.fillStyle=C.power; g.fillRect(0,-0.006,0.06,0.012); g.restore(); }});
    lline(g,[[W*0.02,H*0.38],[W*0.42,H*0.38]],C.line,1,[4,4]);
    const ca=-st.cmd*D2R; lline(g,[[W*0.22,H*0.38],[W*0.22+Math.cos(ca)*W*0.2,H*0.38+Math.sin(ca)*W*0.2]],C.hyd,1.6,[6,4]);
    ltx(g,"الهدف",W*0.22+Math.cos(ca)*W*0.2,H*0.38+Math.sin(ca)*W*0.2-10,{c:C.hyd,s:10,rtl:true});
    ltx(g,"θ = "+nf(p[1],2)+"° · المصعد "+nf(p[2],1)+"°",W*0.22,H*0.82,{s:12,m:true});
    const r={x:W*0.5,y:24,w:W*0.46,h:H*0.48}, ymax=Math.max(st.cmd*1.6,...st.out.map(q=>q[1]))*1.05, P=lplot(g,r,[0,12],[0,ymax],{xt:[0,2,4,6,8,10,12],xl:"s",yl:"θ (°)"});
    lclip(g,r); lline(g,st.out.map(q=>[P.X(q[0]),P.Y(q[3])]),C.hyd,1.5,[5,4]); lline(g,st.out.map(q=>[P.X(q[0]),P.Y(q[1])]),C.accent,2.3);
    g.save(); g.globalAlpha=0.12; g.fillStyle=C.hyd; g.fillRect(r.x,P.Y(st.cmd*1.02),r.w,P.Y(st.cmd*0.98)-P.Y(st.cmd*1.02)); g.restore();
    lline(g,[[P.X(tau),r.y],[P.X(tau),r.y+r.h]],C.muted,1,[3,3]); g.restore();
    const r2={x:W*0.5,y:H*0.66,w:W*0.46,h:H*0.24}, P2=lplot(g,r2,[0,12],[-20,20],{xt:[0,4,8,12],yt:[-20,0,20],yl:"المصعد (°)",ylr:true});
    lline(g,[[r2.x,P2.Y(0)],[r2.x+r2.w,P2.Y(0)]],C.line,1); lline(g,st.out.map(q=>[P2.X(q[0]),P2.Y(q[2])]),C.power,1.8);
  },
  ro(st){ return [["تجاوز الهدف",nf(st.os,1)+"%"],["زمن الصعود 10→90%",st.tr!=null?nf(st.tr,2)+" s":"لا يصل"],["زمن الاستقرار (±2%)",nf(st.ts,2)+" s"],["الخطأ المتبقي",nf(st.ess,3)+"°"],["أقصى حركة للمصعد",nf(st.dmax,1)+"°"]]; },
  eq:["δ_c = Kp·e + Ki·∫e dt − Kd·q ,  e = θ_cmd − θ","α̇ = −1.2 α + q ,  q̇ = −4 α − 1.2 q + 6 δ","δ̇ = (δ_c − δ) / 0.1   (محرّك المصعد، حد ±20°)"],
  note:["P وحده يترك خطأ متبقياً أو يتذبذب؛ إضافة D تخمّد، وإضافة I تزيل الخطأ النهائي.","المعاملات العدوانية تسرّع الاستجابة لكنها تشبّع المصعد وتسبب تجاوزاً كبيراً.","الطيار الآلي الحقيقي فيه حلقات متداخلة: حلقة داخلية لزاوية الأنف، وحلقة خارجية للارتفاع أو السرعة."],
  quiz:[{q:"ما وظيفة الجزء التكاملي I؟",o:["تخميد التذبذب","إزالة الخطأ المتبقي مع الوقت","تسريع الاستجابة فقط"],a:1,why:"يجمع الخطأ عبر الزمن فيستمر بالتصحيح حتى يصبح الخطأ صفراً."},
        {q:"لماذا يُستخدم معدل الأنف q في الجزء التفاضلي بدل مشتقة الخطأ؟",o:["لتجنب قفزة حادة في المصعد عند تغيّر الأمر فجأة","لأنه أرخص","لأنه أكبر"],a:0,why:"اشتقاق الخطأ عند أمر مفاجئ يعطي قفزة كبيرة؛ استخدام القياس يتفاداها."}],
  show:{ar:"اعرض المصعد يتحرك",fn:()=>lrnSel("elevator",1)},
  ref:"الموضوع المقابل: الطيار الآلي ونظرية التحكم الكلاسيكي (Autopilot Design — Displacement Autopilot, Classical Control)."
});

function trimSol(st){ const ac=lac(), q=0.5*isa(st.h).rho*st.V*st.V, CL=st.w*ac.mtow*G0/(q*ac.S), CLa=5.0, CLd=0.4, Cm0=0.06, Cmd=-1.6, Cma=-CLa*st.sm, det=CLa*Cmd-CLd*Cma;
  return {ac,CL,al:(CL*Cmd+CLd*Cm0)/det,de:(CLa*(-Cm0)-Cma*CL)/det,q}; }
LESSONS.fsc.push({
  ar:"التوازن والتقليم بالمصعد", en:"Trim: elevator angle for equilibrium", alt:"طائرة جانبية مع المصعد مائلاً لتحقيق التوازن، وأسهم رفع الجناح والذيل والوزن، ومنحنى زاوية المصعد مع السرعة",
  intro:["لكي تطير الطائرة بثبات يجب أن يكون مجموع العزوم حول مركز الثقل صفراً. المصعد يغيّر قوة الذيل حتى يتوازن العزم عند زاوية الهجوم المطلوبة للسرعة الحالية.",
         "عند السرعة البطيئة تحتاج زاوية هجوم أكبر، فيلزم مصعد أكثر للأعلى. منحنى زاوية المصعد مع السرعة يجب أن يكون «مستقراً»: لتطير أسرع تدفع المقود للأمام. والقيم هنا لطائرة نموذجية بالطائرة المختارة."],
  ctl:[{k:"V",ar:"السرعة الحقيقية",min:70,max:260,step:1,v:150,f:v=>nf(v,0)+" m/s"},{k:"sm",ar:"الهامش الساكن",min:0.02,max:0.3,step:0.005,v:0.12,f:v=>nf(v*100,1)+"% MAC"},{k:"w",ar:"الوزن (نسبة من الأقصى)",min:0.5,max:1,step:0.01,v:0.8,f:v=>nf(v*100,0)+"%"},{k:"h",ar:"الارتفاع",min:0,max:12000,step:100,v:3000,f:v=>nf(v/1000,1)+" km"}],
  init(st){ st.ded=0; },
  calc(st){ Object.assign(st,trimSol(st)); },
  step(st,dt){ st.ded=lease(st.ded,st.de,dt,4); },
  draw(g,W,H,st,C){
    const cx=W*0.3, cy=H*0.45, sc=Math.min(W*0.5,H*1.0), alD=st.al/D2R;
    lplane(g,cx,cy,sc,clamp(alD,-5,20),C,{flip:true,marks:(g)=>{ g.save(); g.translate(0.47,-0.02); g.rotate(-st.ded*4); g.fillStyle=C.power; g.fillRect(0,-0.007,0.08,0.014); g.restore(); }});
    larrow(g,cx,cy,cx,cy+H*0.22,C.ink,3,9); ltx(g,"W",cx+8,cy+H*0.2,{s:12,w:600,a:"left",m:true});
    larrow(g,cx-sc*0.04,cy,cx-sc*0.04,cy-H*0.24,C.hyd,3,9); ltx(g,"L_wing",cx-sc*0.04-6,cy-H*0.24,{c:C.hyd,s:11,a:"right",m:true});
    const tf=st.ded<0?-1:1, tx=cx-sc*0.46; larrow(g,tx,cy,tx,cy+tf*H*0.1*Math.min(1,Math.abs(st.de)*25+0.2),C.power,2.5,8); ltx(g,"قوة الذيل",tx,cy+tf*H*0.14+(tf>0?10:-10),{c:C.power,s:11,rtl:true});
    const r={x:W*0.62,y:24,w:W*0.35,h:H-70}, Vs=[], P=lplot(g,r,[70,260],[-12,4],{xt:[100,150,200,250],yt:[-12,-8,-4,0,4],xl:"V (m/s)",yl:"δe (°)"});
    lline(g,[[r.x,P.Y(0)],[r.x+r.w,P.Y(0)]],C.line,1);
    lclip(g,r); for(let V=70;V<=260;V+=3){ const s=trimSol(Object.assign({},st,{V})); Vs.push([P.X(V),P.Y(s.de/D2R)]); } lline(g,Vs,C.accent,2.3); ldot(g,P.X(st.V),P.Y(st.de/D2R),5,C.accent); g.restore();
    ltx(g,"(سالب = الحافة الخلفية للأعلى)",r.x+r.w-4,r.y+r.h-10,{c:C.muted,s:10,a:"right",rtl:true});
  },
  ro(st){ return [["C_L المطلوب",nf(st.CL,3)],["زاوية الهجوم للتوازن",nf(st.al/D2R,2)+"°"],["زاوية المصعد للتوازن",nf(st.de/D2R,2)+"° "+(st.de<0?"(للأعلى)":"(للأسفل)")],["الطائرة",st.ac.n]]; },
  eq:["C_L = C_Lα·α + C_Lδe·δe","C_m = C_m0 + C_mα·α + C_mδe·δe = 0","C_mα = −C_Lα · (h_n − h)"],
  note:["مركز ثقل متقدم (هامش أكبر) يحتاج مصعداً أكثر للأعلى، وقد ينفد مدى المصعد عند الهبوط البطيء؛ هذا يحدد الحد الأمامي لمركز الثقل.","«التقليم» (Trim) يضبط الذيل حتى تبقى القوة على المقود صفراً عند السرعة المطلوبة.","في طائرات النقل يُحرَّك الذيل الأفقي كله للتقليم، والمصعد للمناورة."],
  quiz:[{q:"عند الطيران أبطأ، زاوية المصعد للتوازن:",o:["أكثر للأعلى (سالبة أكثر)","أكثر للأسفل","لا تتغيّر"],a:0,why:"السرعة الأقل تحتاج C_L أكبر، أي زاوية هجوم أكبر، والطائرة المستقرة تحتاج مصعداً للأعلى لإبقائها."},
        {q:"لماذا يوجد حد أمامي لمركز الثقل؟",o:["لأن المصعد قد لا يكفي لرفع الأنف عند السرعات المنخفضة","لأن الطائرة تصبح غير مستقرة","لأن الوقود ينفد"],a:0,why:"كلما تقدم مركز الثقل زاد العزم المطلوب من الذيل، ومدى المصعد محدود."}],
  show:{ar:"اعرض المثبت الأفقي القابل للتقليم",fn:()=>lrnSel("stabilizer",1)},
  ref:"الموضوع المقابل: التوازن الساكن والتحكم الطولي (Static Stability and Control — Elevator Angle to Trim)."
});
