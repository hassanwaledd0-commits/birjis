/* ---------------- Book 7: Aerodynamics, Aeronautics, and Flight Mechanics ---------------- */
LESSONS.aaf.push({
  ar:"الطيران المعلّق: نظرية الزخم للدوّار", en:"Hovering rotor: momentum theory", alt:"دوّار مروحية يدفع الهواء للأسفل، وأنبوب الهواء ينكمش إلى نصف المساحة، والجزيئات تتسارع",
  intro:["المروحية في التعليق تدفع كتلة هواء للأسفل بقوة تساوي وزنها. نظرية الزخم تعطي السرعة اللي يمر بها الهواء خلال قرص الدوّار، والقدرة الدنيا المطلوبة.",
         "أهم رقم هو «حمل القرص» (الوزن ÷ مساحة القرص): القرص الكبير يحتاج قدرة أقل بكثير. لهذا دوّارات المروحيات كبيرة، والطائرات الرأسية بمراوح صغيرة تحتاج قدرة هائلة."],
  ctl:[{k:"m",ar:"كتلة المروحية",min:500,max:15000,step:50,v:5000,f:v=>nf(v,0)+" kg"},{k:"D",ar:"قطر الدوّار",min:6,max:20,step:0.1,v:14,f:v=>nf(v,1)+" m"},{k:"h",ar:"الارتفاع",min:0,max:4000,step:50,v:0,f:v=>nf(v,0)+" m"},{k:"fm",ar:"معامل الجدارة FM",min:0.55,max:0.8,step:0.01,v:0.72,f:v=>nf(v,2)}],
  pre:[{ar:"مروحية خفيفة",set:{m:1200,D:10}},{ar:"مروحية متوسطة",set:{m:5000,D:14}},{ar:"مروحية نقل ثقيلة",set:{m:14000,D:19}}],
  init(st){ st.p=[]; st.ang=0; for(let i=0;i<170;i++) st.p.push({s:Math.random(),r:Math.random()*2-1}); },
  calc(st){ const rho=isa(st.h).rho, A=Math.PI*st.D*st.D/4, T=st.m*G0; st.vh=Math.sqrt(T/(2*rho*A)); st.Pi=T*st.vh; st.Pa=st.Pi/st.fm; st.dl=T/A; st.pl=T/st.Pa; },
  step(st,dt){ st.ang+=dt*25; st.p.forEach(q=>{ const v=0.15+0.85*(1+Math.tanh((q.s-0.3)*9))/2; q.s+=dt*0.25*v*(0.4+st.vh/25); if(q.s>1){ q.s=0; q.r=Math.random()*2-1; } }); },
  draw(g,W,H,st,C){
    const cx=W*0.36, yd=H*0.3, R=Math.min(W*0.26,H*0.32)*st.D/20, Y=s=>H*0.03+s*H*0.9, rad=s=>R*(1.7+(1/Math.SQRT2-1.7)*(1+Math.tanh((s-0.3)*9))/2);
    const L=[],Rr=[]; for(let i=0;i<=50;i++){ const s=i/50; L.push([cx-rad(s),Y(s)]); Rr.push([cx+rad(s),Y(s)]); } lline(g,L,C.muted,1.2,[5,4]); lline(g,Rr,C.muted,1.2,[5,4]);
    st.p.forEach(q=>{ ldot(g,cx+q.r*rad(q.s)*0.95,Y(q.s),1.9,q.s>0.3?C.ctrl:C.muted,0.85); });
    g.fillStyle=mixC(C.panel,C.struct,0.4); g.strokeStyle=C.ink; g.lineWidth=1.5; g.beginPath(); g.ellipse(cx,yd+R*0.32,R*0.28,R*0.16,0,0,Math.PI*2); g.fill(); g.stroke();
    lline(g,[[cx+R*0.2,yd+R*0.32],[cx+R*0.95,yd+R*0.26]],C.ink,3);
    for(let i=0;i<4;i++){ const a=st.ang+i*Math.PI/2, x=Math.cos(a)*R; g.strokeStyle=C.ink; g.globalAlpha=0.3+0.6*Math.abs(Math.sin(a)); g.lineWidth=3; g.beginPath(); g.moveTo(cx,yd); g.lineTo(cx+x,yd+Math.sin(a)*R*0.08); g.stroke(); } g.globalAlpha=1;
    lline(g,[[cx,yd],[cx,yd+R*0.18]],C.ink,3);
    lline(g,[[0,H*0.97],[W*0.72,H*0.97]],C.line,3);
    const k=H*0.004; [[0.3,st.vh,"v_h"],[0.9,2*st.vh,"2 v_h"]].forEach(([s,v,l])=>{ const x=W*0.64; larrow(g,x,Y(s),x,Y(s)+Math.max(6,v*k*3),C.accent,2.5,8); ltx(g,l+" = "+nf(v,1)+" m/s",x+8,Y(s)+10,{s:10,a:"left",m:true}); });
    ltx(g,"مساحة التيار تحت الدوّار = نصف مساحة القرص",W-12,18,{c:C.muted,s:11,a:"right",rtl:true});
  },
  ro(st){ return [["السرعة المستحثة v_h",nf(st.vh,2)+" m/s"],["سرعة الهواء البعيد تحت الدوّار",nf(2*st.vh,1)+" m/s"],["القدرة المثالية",nf(st.Pi/1000,0)+" kW"],["القدرة الفعلية التقريبية",nf(st.Pa/1000,0)+" kW ("+nf(st.Pa/745.7,0)+" hp)"],["حمل القرص",nf(st.dl,0)+" N/m²"],["حمل القدرة T/P",nf(st.pl*1000,1)+" N/kW"]]; },
  eq:["T = 2 ρ A v_h²  ⇒  v_h = √(T / (2ρA))","P_ideal = T·v_h = T^1.5 / √(2ρA)","P_actual ≈ P_ideal / FM","سرعة التيار البعيد = 2 v_h"],
  note:["مضاعفة قطر الدوّار تقلل القدرة المثالية للنصف تقريباً بنفس الوزن.","في الارتفاعات العالية الهواء أقل كثافة فتحتاج قدرة أكبر للتعليق؛ لهذا للمروحيات سقف تعليق.","قرب الأرض يتحسن الأداء («تأثير الأرض») لأن الأرض تعيق تيار الهواء النازل."],
  quiz:[{q:"لتقليل القدرة المطلوبة للتعليق بنفس الوزن:",o:["نصغّر الدوّار","نكبّر الدوّار (حمل قرص أقل)","نزيد سرعة الدوران فقط"],a:1,why:"P ∝ T^1.5/√A، فالمساحة الأكبر تقلل القدرة."},
        {q:"كم تبلغ سرعة الهواء بعيداً تحت الدوّار مقارنة بسرعته عند القرص؟",o:["نفسها","ضعفها","نصفها"],a:1,why:"من نظرية الزخم: سرعة الأثر البعيد = 2 v_h."}],
  ref:"الموضوع المقابل: نظرية الزخم للدوّار في التعليق (Momentum Theory of Rotors in Hover)."
});

function hlCurve(st,al){ const a=0.09, f=st.dev, k={none:0,plain:0.33,slot:0.48,fowl:0.55}[f]||0, sl=f==="fowl"?1.15:1, df=f==="none"?0:st.df;
  const dA0=k*df, dCL0=a*sl*dA0, cmax0=1.45, cmax=cmax0+0.78*dCL0+(st.slat?0.55:0), a0=-1.5-dA0, as=(cmax/(a*sl))+a0+(st.slat?3:0);
  const cl=al<=as?a*sl*(al-a0):Math.max(cmax*0.6,cmax-0.07*(al-as)); return {cl:Math.min(cl,al<=as?cmax:cl),cmax,as,dCL0}; }
LESSONS.aaf.push({
  ar:"أجهزة الرفع العالي: القلابات والشرائح", en:"High-lift devices: flaps and slats", alt:"مقطع جناح تنزل منه قلابات بأنواعها وتتقدم شريحة أمامية، ومنحنى معامل الرفع مع زاوية الهجوم",
  intro:["الجناح المصمم للتطواف السريع لا يعطي رفعاً كافياً للهبوط البطيء. الحل: أجزاء متحركة تغيّر شكله. القلابات الخلفية تزيد الانحناء (وبعضها المساحة)، فيرتفع منحنى الرفع كله.",
         "الشرائح الأمامية (Slats) تفتح شقاً يمر منه هواء سريع فوق السطح العلوي، فتؤخر الانهيار لزاوية أكبر. اختر نوع القلاب وقارن المنحنى الجديد بالمنحنى الأصلي المنقّط."],
  ctl:[{k:"al",ar:"زاوية الهجوم",min:-4,max:24,step:0.5,v:8,f:v=>nf(v,1)+"°"},{k:"df",ar:"زاوية القلاب",min:0,max:40,step:1,v:30,f:v=>nf(v,0)+"°"}],
  tog:[{k:"slat",ar:"شرائح أمامية",v:false}],
  pre:[{ar:"بدون قلاب",set:{dev:"none"}},{ar:"قلاب بسيط",set:{dev:"plain"}},{ar:"قلاب مشقوق",set:{dev:"slot"}},{ar:"قلاب فاولر",set:{dev:"fowl"}}],
  init(st){ st.dev="slot"; st.dd=0; st.sd=0; st.p=[]; for(let i=0;i<110;i++) st.p.push({x:Math.random(),y:Math.random()}); },
  calc(st){ Object.assign(st,hlCurve(st,st.al)); st.base=hlCurve({dev:"none",df:0,slat:false},st.al); st.cmax0=1.45; st.vsr=(1-Math.sqrt(st.cmax0/st.cmax))*100; },
  step(st,dt){ st.dd=lease(st.dd,st.dev==="none"?0:st.df,dt,4); st.sd=lease(st.sd,st.slat?1:0,dt,4); st.p.forEach(q=>{ q.x+=dt*0.25; if(q.x>1){ q.x=0; q.y=Math.random(); } }); },
  draw(g,W,H,st,C){
    const c=Math.min(W*0.5,H*1.2), x0=W*0.06, y0=H*0.38, rot=st.al*D2R, f=st.dev;
    const thick=x=>0.6*(0.2969*Math.sqrt(x)-0.126*x-0.3516*x*x+0.2843*x**3-0.1015*x**4), up=[],lo=[]; for(let i=0;i<=40;i++){ const x=(1-Math.cos(Math.PI*i/40))/2; up.push([x,thick(x)]); lo.push([x,-thick(x)]); }
    const T=(p,ox,oy,a,ext)=>{ const x=p[0],y=p[1], ca=Math.cos(a), sa=Math.sin(a); return [x0+((x*ca+y*sa)+ox)*c*ext, y0+((x*sa-y*ca)+oy)*c]; };
    st.p.forEach(q=>{ const x=q.x*W, yy=H*0.06+q.y*H*0.6, dy=x>x0+c*0.8?(x-(x0+c*0.8))*0.25*st.cl/2:0; ldot(g,x,yy+dy,1.6,C.ctrl,0.5); });
    const main=up.filter(p=>p[0]<=0.75).concat(lo.filter(p=>p[0]<=0.75).reverse()), sf=st.sd*0.0, sl=up.filter(p=>p[0]<=0.12);
    const draw=(pts,ox,oy,a,fill)=>{ g.fillStyle=fill; g.strokeStyle=C.ink; g.lineWidth=1.5; g.beginPath(); pts.forEach((p,i)=>{ const q=T(p,ox,oy,a,1); i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]); }); g.closePath(); g.fill(); g.stroke(); };
    draw(main.filter(p=>p[0]>=(st.sd>0.01?0.1:0)),0,0,rot,mixC(C.panel,C.struct,0.35));
    if(st.sd>0.01){ const sp=up.filter(p=>p[0]<=0.13).concat(lo.filter(p=>p[0]<=0.13).reverse()); draw(sp.map(p=>[p[0]-0.06*st.sd,p[1]-0.03*st.sd]),0,0,rot+0.35*st.sd,mixC(C.panel,C.sys,0.5)); }
    else draw(up.filter(p=>p[0]<=0.1).concat(lo.filter(p=>p[0]<=0.1).reverse()),0,0,rot,mixC(C.panel,C.struct,0.35));
    const fl=up.filter(p=>p[0]>=0.75).concat(lo.filter(p=>p[0]>=0.75).reverse()).map(p=>[p[0]-0.75,p[1]]), fd=st.dd*D2R, slide=f==="fowl"?0.16*st.dd/40:(f==="slot"?0.03*st.dd/40:0), drop=f==="plain"?0:0.02*st.dd/40;
    const hx=0.75+slide, hy=-drop, ca=Math.cos(rot), sa=Math.sin(rot);
    g.fillStyle=mixC(C.panel,C.power,0.45); g.strokeStyle=C.ink; g.lineWidth=1.5; g.beginPath(); fl.forEach((p,i)=>{ const a=-fd, xx=p[0]*Math.cos(a)-p[1]*Math.sin(a)+hx, yy=p[0]*Math.sin(a)+p[1]*Math.cos(a)+hy; const q=T([xx,yy],0,0,rot,1); i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]); }); g.closePath(); g.fill(); g.stroke();
    const r={x:W*0.62,y:24,w:W*0.35,h:H-70}, P=lplot(g,r,[-4,24],[0,3.6],{xt:[0,5,10,15,20],yt:[0,1,2,3],xl:"α (°)",yl:"C_L"});
    const b=[],cu=[]; for(let a=-4;a<=24;a+=0.25){ b.push([P.X(a),P.Y(Math.max(0,hlCurve({dev:"none",df:0,slat:false},a).cl))]); cu.push([P.X(a),P.Y(Math.max(0,hlCurve(st,a).cl))]); }
    lline(g,b,C.muted,1.5,[5,4]); lline(g,cu,C.accent,2.4); ldot(g,P.X(st.al),P.Y(Math.max(0,st.cl)),5,C.accent);
  },
  ro(st){ const n={none:"بدون قلاب",plain:"قلاب بسيط",slot:"قلاب مشقوق",fowl:"قلاب فاولر"}[st.dev]; return [["الجهاز",n+(st.slat?" + شرائح":"")],["أقصى C_L",nf(st.cmax,2)+" (الأصلي 1.45)"],["زاوية الانهيار",nf(st.as,1)+"°"],["زيادة C_L عند نفس الزاوية",nf(st.dCL0,2)],["تخفيض سرعة الانهيار",nf(st.vsr,1)+"%"],["C_L الحالي",nf(st.cl,2)]]; },
  eq:["القلاب: يزيد الانحناء ⇒ Δα_L=0 سالبة ⇒ المنحنى يرتفع","فاولر: يزيد المساحة أيضاً ⇒ ميل أكبر","الشرائح: تؤخر الانهيار ⇒ α_stall و C_L,max أكبر","V_s ∝ 1/√C_L,max"],
  note:["القلاب المشقوق والمتعدد الشقوق يمرّر هواءً سريعاً من تحت الجناح للسطح العلوي للقلاب فيمنع انفصاله.","قلابات فاولر في A380 و737 تنزلق للخلف وتنزل معاً، لذلك ترى «سكك» القلابات تحت الجناح.","القيم هنا نموذجية للتوضيح؛ الأرقام الدقيقة تأتي من اختبارات النفق والطيران."],
  quiz:[{q:"ما الذي تفعله الشرائح الأمامية أساساً؟",o:["تؤخر الانهيار إلى زاوية هجوم أكبر","تزيد الرفع عند الزاوية الصفرية فقط","تقلل السحب في التطواف"],a:0,why:"الشق يعطي الطبقة المتاخمة طاقة جديدة فتبقى ملتصقة لزوايا أكبر."},
        {q:"لماذا قلاب فاولر أقوى من القلاب البسيط؟",o:["لأنه يزيد الانحناء والمساحة معاً","لأنه أثقل","لأنه أمامي"],a:0,why:"ينزلق للخلف فيزيد مساحة الجناح، ثم ينحني للأسفل فيزيد الانحناء."}],
  ref:"الموضوع المقابل: أجهزة الرفع العالي (High-Lift Devices).",
  show:{ar:"اعرض القلابات والشرائح",fn:()=>{ lrnSel("slats",1); setTimeout(()=>lrnSel("flaps",1),500); }}
});

function climbData(st){ const ac=lac(), W=st.w*ac.mtow*G0, AR=ac.b*ac.b/ac.S, k=1/(Math.PI*ac.e*AR), rows=[];
  for(let h=0;h<=15000;h+=250){ const a=isa(h), T00=ac.T0*st.thr*Math.pow(a.rho/1.225,0.75); let best=-1e9,Vb=0;
    for(let V=90;V<=330;V+=3){ const q=0.5*a.rho*V*V, CL=W/(q*ac.S), M=V/a.a, TA=T00*(1-0.45*M), CD=st.cd0+k*CL*CL+(M>0.8?20*Math.pow(M-0.8,4):0), rc=(TA-q*ac.S*CD)*V/W; if(rc>best){ best=rc; Vb=V; } }
    rows.push([h,best,Vb]); }
  let sc=null,ab=null; for(let i=1;i<rows.length;i++){ if(sc==null&&rows[i][1]<0.508) sc=rows[i-1][0]+250*(rows[i-1][1]-0.508)/(rows[i-1][1]-rows[i][1]); if(ab==null&&rows[i][1]<0) ab=rows[i-1][0]+250*rows[i-1][1]/(rows[i-1][1]-rows[i][1]); }
  let t=0; const prof=[[0,0]]; for(let i=1;i<rows.length;i++){ const r=(rows[i-1][1]+rows[i][1])/2; if(r<=0.3) break; t+=250/r; prof.push([t,rows[i][0]]); }
  let t10=null; prof.forEach(p=>{ if(t10==null&&p[1]>=10000) t10=p[0]; });
  return {ac,rows,sc,ab,prof,t10}; }
LESSONS.aaf.push({
  ar:"أداء الصعود والسقف", en:"Climb performance and ceiling", alt:"منحنى أقصى معدل صعود مع الارتفاع ينتهي عند السقف، ومنحنى الارتفاع مع الزمن وطائرة تصعد عليه",
  intro:["معدل الصعود = (الدفع − السحب) × السرعة ÷ الوزن، أي «القدرة الزائدة» لكل وحدة وزن. مع الارتفاع يقل الدفع المتاح أسرع مما يقل السحب، فيقل معدل الصعود حتى يصير صفراً عند «السقف المطلق».",
         "«السقف العملي» هو الارتفاع اللي يبقى فيه معدل الصعود 0.5 m/s (100 قدم/دقيقة). الصعود يبطئ كثيراً قرب السقف، فنصف الوقت أحياناً يُصرف على آخر بضعة كيلومترات."],
  ctl:[{k:"w",ar:"الوزن (نسبة من الأقصى)",min:0.5,max:1,step:0.01,v:0.85,f:v=>nf(v*100,0)+"%"},{k:"thr",ar:"دفع الصعود المستخدم",min:0.6,max:1,step:0.01,v:0.85,f:v=>nf(v*100,0)+"%"},{k:"cd0",ar:"C_D0",min:0.014,max:0.025,step:0.0005,v:0.016,f:v=>nf(v,4)}],
  init(st){ st.tp=0; }, onSet(st){ st.tp=0; },
  calc(st){ Object.assign(st,climbData(st)); },
  step(st,dt){ st.tp+=dt*0.08; },
  draw(g,W,H,st,C){
    const mr=Math.max(5,...st.rows.map(r=>r[1])), r1={x:46,y:24,w:W*0.4,h:H-70}, P1=lplot(g,r1,[0,mr*1.1],[0,15000],{yt:[0,5000,10000,15000],yf:t=>nf(t/1000,0)+"k",xl:"أقصى معدل صعود (m/s)",xlr:true});
    lclip(g,r1); lline(g,st.rows.filter(r=>r[1]>-1).map(r=>[P1.X(Math.max(0,r[1])),P1.Y(r[0])]),C.accent,2.4);
    if(st.sc!=null){ lline(g,[[r1.x,P1.Y(st.sc)],[r1.x+r1.w,P1.Y(st.sc)]],C.fuel,1.4,[5,4]); } if(st.ab!=null){ lline(g,[[r1.x,P1.Y(st.ab)],[r1.x+r1.w,P1.Y(st.ab)]],C.power,1.4,[5,4]); } g.restore();
    if(st.sc!=null) ltx(g,"السقف العملي",r1.x+r1.w-4,P1.Y(st.sc)+10,{c:C.fuel,s:10,a:"right",rtl:true}); if(st.ab!=null) ltx(g,"السقف المطلق",r1.x+r1.w-4,P1.Y(st.ab)-9,{c:C.power,s:10,a:"right",rtl:true});
    const tmax=st.prof.length?st.prof[st.prof.length-1][0]:1, r2={x:W*0.56,y:24,w:W*0.4,h:H-70}, P2=lplot(g,r2,[0,Math.max(60,tmax)/60],[0,15000],{yt:[0,5000,10000,15000],yf:t=>nf(t/1000,0)+"k",xl:"الزمن (دقيقة)",xlr:true});
    lline(g,st.prof.map(p=>[P2.X(p[0]/60),P2.Y(p[1])]),C.hyd,2.4);
    const f=st.tp%1, tt=f*tmax; let hh=0; for(let i=1;i<st.prof.length;i++){ if(st.prof[i][0]>=tt){ const a=st.prof[i-1], b=st.prof[i]; hh=a[1]+(b[1]-a[1])*(tt-a[0])/Math.max(1e-6,b[0]-a[0]); break; } }
    lplane(g,P2.X(tt/60),P2.Y(hh),Math.min(W*0.12,H*0.25),8,C,{flip:true});
    ltx(g,st.ac.n,r2.x+r2.w-6,r2.y+12,{c:C.muted,s:11,a:"right",m:true});
  },
  ro(st){ const r0=st.rows[0]; return [["معدل الصعود عند سطح البحر",nf(r0[1],1)+" m/s ("+nf(r0[1]*196.85,0)+" ft/min)"],["أفضل سرعة صعود عند سطح البحر",nf(r0[2],0)+" m/s"],["السقف العملي (تقديري)",st.sc!=null?nf(st.sc,0)+" m":"فوق 15 km"],["السقف المطلق (تقديري)",st.ab!=null?nf(st.ab,0)+" m":"فوق 15 km"],["زمن الصعود إلى 10 km",st.t10!=null?nf(st.t10/60,1)+" min":"لا يصل"]]; },
  eq:["RC = (T − D)·V / W = (P_A − P_R) / W","T_A ≈ T₀ · σ^0.75 · (1 − 0.45 M)   (تقريب للمحرك التوربوفاني)","السقف المطلق: RC_max = 0 ,  العملي: RC_max = 0.5 m/s","t = ∫ dh / RC_max(h)"],
  note:["السقف المعتمد لطائرات النقل غالباً يحدده الضغط الهيكلي للمقصورة أو هامش الاهتزاز (Buffet)، وليس الدفع فقط؛ لهذا قد يختلف عن هذا التقدير.","الطائرة الأخف تصعد أسرع وتصل أعلى، لذلك تصعد طائرات النقل على مراحل («Step climb») كلما حرقت وقوداً.","الدفع المتاح هنا تقريب بسيط (σ^0.75) يكفي لإظهار الاتجاهات."],
  quiz:[{q:"معدل الصعود يساوي:",o:["(الدفع − السحب)/الوزن","القدرة الزائدة ÷ الوزن","الرفع ÷ السحب"],a:1,why:"RC = (T − D)V/W، أي القدرة الزائدة لكل وحدة وزن."},
        {q:"لماذا تصعد طائرات النقل على مراحل أثناء الرحلة؟",o:["لأنها تخفّ مع حرق الوقود فيرتفع ارتفاعها الأمثل","لتجنب الطيور","لأن المحرك يسخن"],a:0,why:"الوزن الأقل يعني ارتفاعاً أمثل أعلى، فترتفع الطائرة تدريجياً."}],
  ref:"الموضوع المقابل: أداء الصعود والسقف (Climb Performance and Ceilings)."
});

LESSONS.aaf.push({
  ar:"تأثير الأرض", en:"Ground effect", alt:"منظر أمامي لجناح قريب من الأرض ودوامتي الطرفين وصورتيهما المعكوستين تحت الأرض، ومنحنى انخفاض السحب المستحث",
  intro:["عندما يقترب الجناح من الأرض (أقل من نصف الباع تقريباً)، تمنع الأرض الهواء من الهبوط بحرية، فتضعف الدوامات الطرفية ويقل السحب المستحث.",
         "رياضياً نتخيّل دوامات «مرآة» تحت الأرض تعاكس الأصلية. لهذا تطفو الطائرة قليلاً قبل الهبوط، وتسارع بسهولة أكبر قبل الإقلاع. معادلة ماكورميك تعطي نسبة الانخفاض."],
  ctl:[{k:"hb",ar:"الارتفاع / الباع h/b",min:0.03,max:1.5,step:0.01,v:0.15,f:v=>nf(v,2)},{k:"CL",ar:"معامل الرفع",min:0.3,max:1.6,step:0.01,v:1.0,f:v=>nf(v,2)}],
  init(st){ st.v=[]; for(let s=-1;s<=1;s+=2) for(let i=0;i<55;i++) st.v.push({s,r:0.15+Math.random()*0.85,a:Math.random()*6.283}); },
  calc(st){ const ac=lac(), x=16*st.hb, AR=ac.b*ac.b/ac.S; st.ac=ac; st.phi=x*x/(1+x*x); st.cdi=st.CL*st.CL/(Math.PI*ac.e*AR); st.cdg=st.cdi*st.phi; st.hm=st.hb*ac.b; },
  step(st,dt){ const w=2.5*st.CL*Math.sqrt(st.phi)+0.2; st.v.forEach(p=>{ p.a+=p.s*dt*w/(p.r+0.25); }); },
  draw(g,W,H,st,C){
    const gy=H*0.62, span=W*0.4, cx=W*0.3, wy=gy-clamp(st.hb,0,1.5)*span*0.5-6, out=1+0.25*(1-st.phi), Rv=Math.min(H*0.14,(gy-wy)*0.9+8);
    g.fillStyle=mixC(C.panel,C.struct,0.18); g.fillRect(0,gy,W*0.6,H-gy); lline(g,[[0,gy],[W*0.6,gy]],C.ink,2);
    lline(g,[[cx-span/2,wy],[cx+span/2,wy]],C.ink,4); g.fillStyle=mixC(C.panel,C.struct,0.35); g.beginPath(); g.arc(cx,wy,H*0.035,0,Math.PI*2); g.fill(); g.strokeStyle=C.ink; g.lineWidth=1.4; g.stroke();
    st.v.forEach(p=>{ const tx=cx+p.s*span/2*out, x=tx+Math.cos(p.a)*p.r*Rv, y=wy-Math.sin(p.a)*p.r*Rv*0.85; if(y<gy-1) ldot(g,x,y,2,C.sys,0.85);
      const yi=2*gy-y; if(yi<H) ldot(g,x,yi,1.6,C.muted,0.35); });
    for(const s of [-1,1]){ g.save(); g.strokeStyle=C.muted; g.setLineDash([3,4]); g.beginPath(); g.arc(cx+s*span/2*out,2*gy-wy,Rv*0.6,0,Math.PI*2); g.stroke(); g.restore(); }
    ltx(g,"دوامات «مرآة» تحت الأرض",cx,H-12,{c:C.muted,s:10,rtl:true});
    for(let i=1;i<=4;i++){ const x=cx-span/2+span*i/5; if(Math.abs(x-cx)<H*0.05) continue; larrow(g,x,wy+8,x,wy+8+Math.max(3,30*st.phi*st.CL),C.ctrl,2,6); }
    const r={x:W*0.66,y:24,w:W*0.31,h:H-70}, P=lplot(g,r,[0,1.5],[0,1.05],{xt:[0,0.5,1,1.5],yt:[0,0.5,1],xl:"h / b",yl:"φ"});
    const c=[]; for(let x=0;x<=1.5;x+=0.01){ const t=16*x; c.push([P.X(x),P.Y(t*t/(1+t*t))]); } lline(g,c,C.accent,2.3); ldot(g,P.X(st.hb),P.Y(st.phi),5,C.accent);
  },
  ro(st){ return [["معامل التخفيض φ",nf(st.phi,3)],["السحب المستحث بعيداً عن الأرض",nf(st.cdi,4)],["السحب المستحث قرب الأرض",nf(st.cdg,4)],["الانخفاض",nf((1-st.phi)*100,0)+"%"],["الارتفاع الفعلي لـ "+st.ac.n,nf(st.hm,1)+" m"]]; },
  eq:["φ = (16 h/b)² / (1 + (16 h/b)²)","C_Di,IGE = φ · C_Di,OGE","تمثيل الأرض: دوامة صورة بنفس الشدة وعكس الاتجاه تحت السطح"],
  note:["التأثير ملحوظ فقط عندما يكون الارتفاع أقل من حوالي نصف الباع.","الطائرة «تطفو» عند التسوية فوق المدرج إذا كانت سرعتها زائدة، لأن السحب قلّ فجأة.","طائرات «الإكرانوبلان» صُممت للطيران دائماً قريباً جداً من سطح الماء للاستفادة من هذا التأثير."],
  quiz:[{q:"عند h/b = 0.1، السحب المستحث مقارنة بالطيران الحر تقريباً:",o:["كما هو","حوالي 72%","حوالي 10%"],a:1,why:"x = 1.6 ⇒ φ = 2.56/3.56 ≈ 0.72."},
        {q:"لماذا تطفو الطائرة أحياناً فوق المدرج قبل ملامسته؟",o:["لأن الريح تدفعها","لأن تأثير الأرض يقلل السحب المستحث فجأة","لأن المحرك يزيد دفعه"],a:1,why:"السحب ينخفض قرب الأرض، فإذا كانت السرعة زائدة تستمر الطائرة بالطيران فوق المدرج."}],
  show:{ar:"اعرض دوامات طرف الجناح",fn:()=>{ lrnFlowOn(); lrnSel("wingtip"); }},
  ref:"الموضوع المقابل: تأثير الأرض على الجناح (Ground Effect)."
});

/* =====================================================================================
   Books 8–10: astrodynamics, spacecraft systems engineering, theory of flight
   ===================================================================================== */
const MU=398600.4418, RE=6378.137;
function kepE(M,e){ let E=e<0.8?M:Math.PI; for(let i=0;i<50;i++){ const d=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E)); E-=d; if(Math.abs(d)<1e-12) break; } return E; }
function kepH(M,e){ let F=Math.asinh(M/e); for(let i=0;i<60;i++){ const d=(e*Math.sinh(F)-F-M)/(e*Math.cosh(F)-1); F-=d; if(Math.abs(d)<1e-12) break; } return F; }
function earth(g,x,y,r,C){ const gr=g.createRadialGradient(x-r*0.3,y-r*0.3,r*0.1,x,y,r); gr.addColorStop(0,mixC(C.ctrl,C.panel,0.2)); gr.addColorStop(1,mixC(C.ctrl,C.ink,0.35));
  g.fillStyle=gr; g.beginPath(); g.arc(x,y,r,0,Math.PI*2); g.fill(); g.save(); g.globalAlpha=0.35; g.fillStyle=C.hyd; g.beginPath(); g.ellipse(x-r*0.2,y-r*0.1,r*0.35,r*0.22,0.5,0,Math.PI*2); g.fill(); g.beginPath(); g.ellipse(x+r*0.3,y+r*0.25,r*0.22,r*0.3,-0.3,0,Math.PI*2); g.fill(); g.restore(); }
