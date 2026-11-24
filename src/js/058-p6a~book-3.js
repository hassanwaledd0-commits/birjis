/* ---------------- Book 3: Aircraft Design (conceptual design) ---------------- */
LESSONS.rds.push({
  ar:"تحجيم الوزن الأولي من المهمة", en:"Initial sizing: takeoff weight from the mission", alt:"مسار المهمة من الإقلاع إلى الهبوط، وشريط يقسم وزن الإقلاع إلى فارغ ووقود وحمولة، ونقاط تتقارب نحو الحل",
  intro:["أول سؤال في تصميم أي طائرة: كم سيكون وزنها عند الإقلاع؟ الوزن = الطاقم + الحمولة + الوقود + الوزن الفارغ. الوقود يُحسب من مراحل المهمة (إقلاع، صعود، تطواف، انتظار، هبوط)، والوزن الفارغ نسبة من الوزن الكلي مأخوذة من إحصاءات طائرات مشابهة.",
         "المشكلة أن الوزن الفارغ يعتمد على الوزن الكلي اللي نبحث عنه، فنخمّن ونكرر الحساب حتى يتقارب الجواب. شاهد النقاط في الأسفل وهي تتقارب، وجرّب تزيد المدى: الوزن يكبر بسرعة لأن الوقود الإضافي نفسه يحتاج وقوداً لحمله."],
  ctl:[{k:"R",ar:"مدى التصميم",min:500,max:15000,step:100,v:8000,f:v=>nf(v,0)+" km"},{k:"pl",ar:"الحمولة (ركاب وأمتعة وشحن)",min:2000,max:90000,step:500,v:20000,f:v=>nf(v/1000,1)+" t"},
       {k:"LD",ar:"L/D في التطواف",min:12,max:22,step:0.1,v:17,f:v=>nf(v,1)},{k:"c",ar:"استهلاك الوقود النوعي",min:0.45,max:0.8,step:0.005,v:0.55,f:v=>nf(v,3)+" /h"}],
  pre:[{ar:"قريب من A380",set:{R:14800,pl:66000,LD:19,c:0.53}},{ar:"قريب من 737-800",set:{R:5400,pl:20000,LD:17,c:0.6}},{ar:"طائرة إقليمية",set:{R:2000,pl:7000,LD:15,c:0.62}}],
  init(st){ st.ph=0; }, onSet(st){ st.ph=0; },
  calc(st){ const V=250, E=0.5, crew=500;
    const fr=[0.97,0.985,Math.exp(-st.R*1000*(st.c/3600)/(V*st.LD)),Math.exp(-E*st.c*0.9/(st.LD/0.866)),0.995];
    let wx=1; fr.forEach(f=>wx*=f); const ff=1.06*(1-wx); st.fr=fr; st.ff=ff; st.crew=crew;
    let W0=2*(st.pl+crew), ok=true; const hist=[];
    for(let i=0;i<80;i++){ const we=1.02*Math.pow(W0*2.2046,-0.06), den=1-ff-we; if(den<=0.02){ ok=false; break; } const Wn=(st.pl+crew)/den; hist.push(Wn); if(Math.abs(Wn-W0)<1){ W0=Wn; break; } W0=Wn; }
    st.ok=ok; st.hist=hist; st.W0=W0; st.we=1.02*Math.pow(W0*2.2046,-0.06); st.Wf=ff*W0; st.We=st.we*W0; },
  step(st,dt){ st.ph+=dt*0.12; },
  draw(g,W,H,st,C){
    const x0=W*0.05, x1=W*0.95, yb=H*0.4, yt=H*0.1, X=f=>x0+f*(x1-x0);
    const prof=[[0,yb],[0.03,yb],[0.12,yt],[0.7,yt],[0.78,yt+H*0.04],[0.86,yt+H*0.04],[0.97,yb],[1,yb]].map(p=>[X(p[0]),p[1]]);
    lline(g,[[x0,yb],[x1,yb]],C.line,2); lline(g,prof,C.accent,2.2,[6,5]);
    g.save(); g.strokeStyle=C.accent; g.setLineDash([3,4]); g.beginPath(); g.ellipse(X(0.82),yt+H*0.04,W*0.035,H*0.03,0,0,Math.PI*2); g.stroke(); g.restore();
    const segs=[["إقلاع",0.015],["صعود",0.075],["تطواف",0.41],["انتظار",0.82],["هبوط",0.92]];
    segs.forEach(([n,f],i)=>{ ltx(g,n,X(f),yb+14,{c:C.muted,s:10,rtl:true}); ltx(g,nf(st.fr[i],3),X(f),yb+28,{s:10,m:true}); });
    let L=0; const seg=[]; for(let i=1;i<prof.length;i++){ const d=Math.hypot(prof[i][0]-prof[i-1][0],prof[i][1]-prof[i-1][1]); seg.push(d); L+=d; }
    let f=(st.ph%1)*L, k=0; while(k<seg.length-1&&f>seg[k]){ f-=seg[k]; k++; } const a=prof[k], b=prof[k+1], u=Math.min(1,f/seg[k]);
    const px=a[0]+(b[0]-a[0])*u, py=a[1]+(b[1]-a[1])*u, ang=Math.atan2(b[1]-a[1],b[0]-a[0]);
    g.save(); g.translate(px,py); g.rotate(ang); g.fillStyle=C.ink; g.beginPath(); g.moveTo(10,0); g.lineTo(-8,-6); g.lineTo(-5,0); g.lineTo(-8,6); g.closePath(); g.fill(); g.restore();
    const by=H*0.52, bh=26;
    if(!st.ok){ ltx(g,"لا يوجد حل: الوقود والوزن الفارغ أكبر من الطائرة نفسها",W/2,by+bh/2,{c:C.power,s:13,w:600,rtl:true}); }
    else { const parts=[["فارغ",st.We,C.struct],["وقود",st.Wf,C.fuel],["حمولة",st.pl,C.hyd],["طاقم",st.crew,C.sys]]; let xx=x1;
      parts.forEach(([n,w,c])=>{ const ww=(x1-x0)*w/st.W0; g.fillStyle=c; g.globalAlpha=0.85; g.fillRect(xx-ww,by,ww,bh); g.globalAlpha=1; if(ww>60) ltx(g,n+" "+nf(w/1000,0)+" t",xx-ww/2,by+bh/2,{c:"#fff",s:11,w:600,rtl:true}); xx-=ww; });
      ltx(g,"وزن الإقلاع W₀ = "+nf(st.W0/1000,1)+" t",x1,by-12,{s:12,w:600,a:"right",rtl:true}); }
    if(st.hist.length){ const r={x:56,y:H*0.7,w:W-80,h:H*0.2}, mx=Math.max(...st.hist)*1.1, n=st.hist.length;
      const P=lplot(g,r,[0,Math.max(5,n)],[0,mx],{yt:[0,mx/2,mx].map(v=>Math.round(v/1000)*1000),yf:t=>nf(t/1000,0)+"t",xl:"دورة الحساب",xlr:true});
      const shown=Math.min(n,1+Math.floor((st.ph%1)*n*2.2)); const pts=st.hist.slice(0,shown).map((w,i)=>[P.X(i+1),P.Y(w)]);
      lline(g,pts,C.accent,1.6); pts.forEach(p=>ldot(g,p[0],p[1],3.5,C.accent)); }
  },
  ro(st){ if(!st.ok) return [["النتيجة","المهمة غير ممكنة بهذه الأرقام"],["نسبة الوقود المطلوبة",nf(st.ff*100,1)+"%"]];
    return [["وزن الإقلاع W₀",nf(st.W0/1000,1)+" t"],["الوزن الفارغ",nf(st.We/1000,1)+" t ("+nf(st.we*100,1)+"%)"],["الوقود",nf(st.Wf/1000,1)+" t ("+nf(st.ff*100,1)+"%)"],["نسبة الحمولة",nf(st.pl/st.W0*100,1)+"%"],["عدد دورات الحساب",String(st.hist.length)]]; },
  eq:["W₀ = (W_crew + W_payload) / (1 − W_f/W₀ − W_e/W₀)","W_e/W₀ ≈ A·W₀^C   (نقل نفاث: A = 1.02 ، C = −0.06 ، W₀ بالباوند)","تطواف: W₃/W₂ = exp(−R·c / (V·L/D))","انتظار: W₄/W₃ = exp(−E·c / (L/D)max)","W_f/W₀ = 1.06 (1 − W_x/W₀)   (6% احتياط ووقود محبوس)"],
  note:["زيادة المدى ترفع الوزن بشكل متسارع: كل طن وقود إضافي يحتاج هيكلاً أثقل ووقوداً إضافياً لحمله.","تحسين L/D أو استهلاك المحرك بنسبة صغيرة يخفض وزن الإقلاع كثيراً، لهذا تهتم الشركات بالأجنحة الكفؤة والمحركات الجديدة.","هذه طريقة المرحلة الأولى فقط؛ بعدها تُحسب الأوزان قطعة قطعة بدقة أكبر."],
  quiz:[{q:"لماذا نحتاج تكرار الحساب لإيجاد وزن الإقلاع؟",o:["لأن الوقود ثابت","لأن نسبة الوزن الفارغ تعتمد على الوزن الكلي المجهول","لأن الحمولة تتغيّر"],a:1,why:"W_e/W₀ دالة في W₀ نفسه، فنخمّن W₀ ونصحح حتى يتطابق الطرفان."},
        {q:"إذا ضاعفنا المدى، وزن الإقلاع:",o:["يتضاعف تماماً","يزيد أكثر من الضعف أحياناً بسبب تأثير الوقود المتراكم","لا يتغيّر"],a:1,why:"العلاقة غير خطية: الوقود يزيد أُسّياً مع المدى، والوزن الفارغ يكبر معه."}],
  ref:"الموضوع المقابل: التحجيم الأولي ونسب أوزان المهمة (Sizing from a Conceptual Sketch)."
});

function rdsCons(st,ws){ const sig=1, CLmT=0.8*st.CLl, CLTO=CLmT/1.21, TOP=st.BFL*3.2808/37.5, nE=st.e4?4:2, G=nE===4?0.03:0.024, k=1/(Math.PI*0.85*st.AR);
  const q=0.5*0.36392*250*250, wcr=0.95*ws*G0;
  return {to:(ws*0.2048)/(sig*CLTO*TOP), cr:(q*0.016/wcr+wcr*k/q)*0.95/0.24, cl:(nE/(nE-1))*(G+1/11)}; }
LESSONS.rds.push({
  ar:"مخطط القيود: الدفع/الوزن وحمل الجناح", en:"Constraint diagram: thrust-to-weight vs wing loading", alt:"منحنيات القيود للإقلاع والتطواف والصعود وسرعة الاقتراب، والمنطقة المسموحة، ونقطة التصميم وموقع A380 و737",
  intro:["قرار مبكر مهم: كم دفعاً نضع لكل كيلوغرام (T/W)، وكم وزناً نحمّل على كل متر مربع من الجناح (W/S)؟ كل متطلب أداء يرسم حداً: مسافة الإقلاع، والصعود بمحرك معطّل، والتطواف، وسرعة الاقتراب للهبوط.",
         "المنطقة المظللة هي اللي تحقق كل المتطلبات. المصمم عادةً يختار أعلى حمل جناح ممكن (جناح أصغر وأخف) بأقل دفع (محركات أصغر)، أي الزاوية السفلية اليمنى من المنطقة المسموحة."],
  ctl:[{k:"Va",ar:"سرعة الاقتراب",min:55,max:80,step:0.5,v:72,f:v=>nf(v,1)+" m/s ("+nf(v*KT,0)+" kt)"},{k:"CLl",ar:"أقصى C_L عند الهبوط",min:2,max:3.2,step:0.05,v:2.8,f:v=>nf(v,2)},
       {k:"BFL",ar:"طول المدرج المتاح",min:1500,max:3500,step:50,v:3000,f:v=>nf(v,0)+" m"},{k:"AR",ar:"نسبة الباع",min:6,max:12,step:0.1,v:7.5,f:v=>nf(v,1)}],
  tog:[{k:"e4",ar:"أربعة محركات",v:true}],
  calc(st){ st.wsS=0.5*1.225*Math.pow(st.Va/1.3,2)*st.CLl/(0.85*G0); const ws=Math.min(st.wsS,900); st.dws=ws; const c=rdsCons(st,ws); st.dtw=Math.max(c.to,c.cr,c.cl); st.lim=c.to>=c.cr&&c.to>=c.cl?"الإقلاع":(c.cr>=c.cl?"التطواف":"الصعود بمحرك معطّل"); },
  draw(g,W,H,st,C){
    const r={x:52,y:22,w:W-72,h:H-64}, P=lplot(g,r,[200,900],[0,0.6],{xt:[200,400,600,800],yt:[0,0.2,0.4,0.6],xl:"حمل الجناح W/S (kg/m²)",xlr:true,yl:"T/W"});
    lclip(g,r);
    const top=[], to=[], cr=[], cl=[]; for(let ws=200;ws<=900;ws+=5){ const c=rdsCons(st,ws); to.push([P.X(ws),P.Y(c.to)]); cr.push([P.X(ws),P.Y(c.cr)]); cl.push([P.X(ws),P.Y(c.cl)]); if(ws<=st.wsS) top.push([P.X(ws),P.Y(Math.max(c.to,c.cr,c.cl))]); }
    if(top.length){ g.save(); g.globalAlpha=0.16; g.fillStyle=C.hyd; g.beginPath(); g.moveTo(top[0][0],r.y); top.forEach(p=>g.lineTo(p[0],p[1])); g.lineTo(top[top.length-1][0],r.y); g.closePath(); g.fill(); g.restore(); }
    lline(g,to,C.power,2.2); lline(g,cr,C.ctrl,2.2); lline(g,cl,C.fuel,2.2); lline(g,[[P.X(st.wsS),r.y],[P.X(st.wsS),r.y+r.h]],C.gear,2.2);
    [["A380",680,0.22],["737-800",634,0.313]].forEach(([n,x,y])=>{ ldot(g,P.X(x),P.Y(y),4,C.ink); ltx(g,n,P.X(x)+6,P.Y(y)-9,{s:10,a:"left",m:true}); });
    ldot(g,P.X(st.dws),P.Y(st.dtw),6+1.5*Math.sin(st.t*4),C.accent);
    g.restore();
    [["الإقلاع",C.power],["التطواف",C.ctrl],["الصعود بمحرك معطّل",C.fuel],["سرعة الاقتراب",C.gear],["المنطقة المسموحة",C.hyd]].forEach(([t,c],i)=>{ ltx(g,t,r.x+r.w-22,r.y+12+i*15,{c,s:10,a:"right",rtl:true}); lline(g,[[r.x+r.w-16,r.y+12+i*15],[r.x+r.w-5,r.y+12+i*15]],c,3); });
  },
  ro(st){ return [["أقصى حمل جناح (الاقتراب)",nf(st.wsS,0)+" kg/m²"],["نقطة التصميم T/W",nf(st.dtw,3)],["القيد الحاكم",st.lim],["مساحة جناح لطائرة 575 t",nf(575000/st.dws,0)+" m²"]]; },
  eq:["الاقتراب: W/S ≤ ½ρ (V_app/1.3)² C_L,max / 0.85","الإقلاع: T/W ≥ (W/S) / (σ · C_L,TO · TOP) ,  BFL ≈ 37.5·TOP (ft)","التطواف: T/W = [q C_D0/(W/S) + (W/S)/(q π A e)] / lapse","الصعود (محرك معطّل): T/W ≥ N/(N−1) · (G + 1/(L/D))"],
  note:["نقطتا A380 و737 قريبتان من حدود القيود، لأن أي هامش زائد يعني وزناً ووقوداً ضائعاً.","القلابات الأقوى (C_L,max أعلى) تسمح بجناح أصغر، وهذا سبب تعقيد أنظمة القلابات في طائرات النقل.","الطائرة ذات المحركين تحتاج T/W أعلى لأن فقدان محرك يعني فقدان نصف الدفع، أما في الرباعية فالربع فقط."],
  quiz:[{q:"لماذا يفضّل المصمم أعلى حمل جناح مسموح؟",o:["لأن الجناح الأصغر أخف وأقل سحباً","لأنه يقلل سرعة الهبوط","لأنه يزيد الدفع"],a:0,why:"W/S أعلى يعني مساحة أقل للجناح لنفس الوزن، فوزن ومساحة مبللة وسحب أقل."},
        {q:"أي قيد يمنع زيادة حمل الجناح أكثر في هذا المخطط؟",o:["التطواف","سرعة الاقتراب والهبوط","الصعود"],a:1,why:"سرعة الانهيار عند الهبوط تحدد أقصى W/S لأن الرفع المتاح محدود بـ C_L,max."}],
  ref:"الموضوع المقابل: نسبة الدفع إلى الوزن وحمل الجناح (Thrust-to-Weight Ratio and Wing Loading)."
});

function plan(st){ const b=Math.sqrt(st.AR*st.S), cr=2*st.S/(b*(1+st.lam)), ct=st.lam*cr, mac=(2/3)*cr*(1+st.lam+st.lam*st.lam)/(1+st.lam), ym=(b/6)*(1+2*st.lam)/(1+st.lam);
  const tLE=Math.tan(st.sw*D2R)+(1-st.lam)/(st.AR*(1+st.lam)), LLE=Math.atan(tLE)/D2R, k=1-0.045*Math.pow(st.AR,0.68);
  const e=LLE>30?4.61*k*Math.pow(Math.cos(LLE*D2R),0.15)-3.1:1.78*k-0.64; return {b,cr,ct,mac,ym,tLE,LLE,e,Mcr:Math.min(0.95,0.7/Math.cos(st.sw*D2R))}; }
LESSONS.rds.push({
  ar:"تصميم شكل الجناح: الباع والتدبيب والميلان", en:"Wing planform: aspect ratio, taper and sweep", alt:"منظر علوي لجناح يتغير شكله مع الميلان والتدبيب، مع الوتر الهوائي المتوسط وتحليل سرعة الهواء إلى مركبتين",
  intro:["شكل الجناح من الأعلى يحدده أربعة أرقام: المساحة، ونسبة الباع، ونسبة التدبيب، وزاوية الميلان (Sweep). كل واحد له ثمن ومكسب.",
         "الميلان للخلف يجعل الهواء «يرى» سرعة أقل عمودية على الجناح (V·cos Λ)، فتتأخر الموجات الصدمية ويقدر الجناح يطير قرب ماخ 0.85. لكن الجناح المائل أثقل، وكفاءته أقل في السرعات المنخفضة."],
  ctl:[{k:"S",ar:"مساحة الجناح",min:100,max:900,step:5,v:845,f:v=>nf(v,0)+" m²"},{k:"AR",ar:"نسبة الباع",min:5,max:12,step:0.1,v:7.5,f:v=>nf(v,1)},
       {k:"lam",ar:"نسبة التدبيب λ",min:0.15,max:1,step:0.01,v:0.28,f:v=>nf(v,2)},{k:"sw",ar:"ميلان خط ربع الوتر Λ",min:0,max:45,step:0.5,v:33.5,f:v=>nf(v,1)+"°"}],
  pre:[{ar:"قريب من A380",set:{S:845,AR:7.5,lam:0.28,sw:33.5}},{ar:"قريب من 737-800",set:{S:125,AR:9.4,lam:0.28,sw:25}},{ar:"طائرة مروحية مستقيمة",set:{S:61,AR:12,lam:0.55,sw:3}}],
  init(st){ st.p=[]; for(let i=0;i<70;i++) st.p.push({u:Math.random(),v:Math.random()}); },
  calc(st){ Object.assign(st,plan(st)); },
  step(st,dt){ st.p.forEach(q=>{ q.v+=dt*0.25; if(q.v>1){ q.v=0; q.u=Math.random(); } }); },
  draw(g,W,H,st,C){
    const ext=Math.max(st.cr,(st.b/2)*st.tLE+st.ct), s=Math.min((W*0.9)/st.b,(H*0.62)/ext), cx=W/2, y0=H*0.16, X=y=>cx+y*s, Y=x=>y0+x*s;
    const tipLE=(st.b/2)*st.tLE;
    g.fillStyle=mixC(C.panel,C.struct,0.3); g.strokeStyle=C.ink; g.lineWidth=1.6;
    g.beginPath(); g.moveTo(X(0),Y(0)); g.lineTo(X(st.b/2),Y(tipLE)); g.lineTo(X(st.b/2),Y(tipLE+st.ct)); g.lineTo(X(0),Y(st.cr)); g.lineTo(X(-st.b/2),Y(tipLE+st.ct)); g.lineTo(X(-st.b/2),Y(tipLE)); g.closePath(); g.fill(); g.stroke();
    lline(g,[[X(-st.b/2),Y(tipLE+st.ct*0.25)],[X(0),Y(st.cr*0.25)],[X(st.b/2),Y(tipLE+st.ct*0.25)]],C.muted,1.2,[5,4]);
    const yl=st.ym, xl=yl*st.tLE; lline(g,[[X(yl),Y(xl)],[X(yl),Y(xl+st.mac)]],C.accent,3); lline(g,[[X(-yl),Y(xl)],[X(-yl),Y(xl+st.mac)]],C.accent,3);
    ltx(g,"MAC",X(yl)+8,Y(xl+st.mac/2),{c:C.accent,s:11,w:600,a:"left",m:true});
    st.p.forEach(q=>{ const yy=(q.u*2-1)*st.b/2, le=Math.abs(yy)*st.tLE, ch=st.cr+(st.ct-st.cr)*Math.abs(yy)/(st.b/2), x=-ext*0.25+q.v*(ext*1.5), on=x>le&&x<le+ch;
      const sx=X(yy+(on?(x-le)*Math.sin(st.sw*D2R)*0.25*Math.sign(yy):0)), sy=Y(x); ldot(g,sx,sy,1.8,on?C.ctrl:C.muted,on?0.85:0.4); });
    const ax=W*0.86, ay=H*0.8, L=H*0.13, sw=st.sw*D2R;
    larrow(g,ax,ay-L,ax,ay,C.ink,2.2,8); ltx(g,"V",ax+10,ay-L/2,{s:12,w:600,a:"left",m:true});
    const nx=Math.cos(sw)*Math.sin(sw), ny=Math.cos(sw)*Math.cos(sw); larrow(g,ax,ay-L,ax-L*nx,ay-L+L*ny,C.power,2,7); larrow(g,ax,ay-L,ax+L*Math.sin(sw)*Math.cos(sw),ay-L+L*Math.sin(sw)*Math.sin(sw),C.sys,2,7);
    ltx(g,"V cos Λ",ax-L*nx-4,ay-L+L*ny+12,{c:C.power,s:10,a:"right",m:true}); ltx(g,"على امتداد الجناح",ax+8,ay-L-10,{c:C.sys,s:10,a:"left",rtl:true});
  },
  ro(st){ return [["الباع b",nf(st.b,1)+" m"],["وتر الجذر / الطرف",nf(st.cr,2)+" / "+nf(st.ct,2)+" m"],["الوتر الهوائي المتوسط",nf(st.mac,2)+" m"],["موقعه من المنتصف",nf(st.ym,2)+" m"],["ميلان الحافة الأمامية",nf(st.LLE,1)+"°"],["كفاءة أوزوالد e (تقديرية)",nf(st.e,3)],["ماخ حرج تقريبي",nf(st.Mcr,2)]]; },
  eq:["b = √(AR · S) ,  c_r = 2S / (b(1 + λ)) ,  c_t = λ·c_r","MAC = (2/3) c_r (1 + λ + λ²)/(1 + λ) ,  ȳ = (b/6)(1 + 2λ)/(1 + λ)","tan Λ_LE = tan Λ_c/4 + (1 − λ)/(AR(1 + λ))","e ≈ 4.61(1 − 0.045 AR^0.68)(cos Λ_LE)^0.15 − 3.1   (ميلان أكبر من 30°)"],
  note:["الوتر الهوائي المتوسط هو «الوتر المرجعي» اللي يُقاس عليه مركز الثقل (مثل 25% MAC).","التدبيب حوالي 0.3 يقرّب الرفع من الإهليلجي ويخفف وزن الجذر، لكن التدبيب الزائد يجعل الأطراف تنهار أولاً.","ميلان الجناح يدفع الهواء على السطح نحو الأطراف، وهذا يزيد خطر انهيار الأطراف؛ لهذا تُضاف أسوار وموانع."],
  quiz:[{q:"لماذا تُمال أجنحة طائرات النقل النفاثة للخلف؟",o:["لزيادة الرفع عند الإقلاع","لتأخير الموجات الصدمية بتقليل مركبة السرعة العمودية على الجناح","لتقليل الوزن"],a:1,why:"الجناح يتأثر بالسرعة العمودية عليه V·cos Λ، فيتأخر ظهور الصدمات."},
        {q:"زيادة نسبة الباع مع ثبات المساحة:",o:["تقلل السحب المستحث لكنها تزيد وزن الجناح","تزيد السحب المستحث","لا تغيّر شيئاً"],a:0,why:"جناح أطول وأنحف أكفأ هوائياً، لكنه يحتاج هيكلاً أقوى لتحمل عزم الانحناء."}],
  ref:"الموضوع المقابل: اختيار المقطع وهندسة الجناح (Airfoil and Geometry Selection).",
  show:{ar:"اعرض الجناح على الطائرة",fn:()=>lrnSel("wingbox")}
});

const DBG={a380:{S:845,c:10.6,tc:0.11,sw:33.5,fl:72.7,fd:7.1,Sh:205.6,ch:6.5,Sv:122.3,cv:8.5,nE:4,nl:7.0,nd:3.6},b737:{S:124.6,c:3.5,tc:0.12,sw:25,fl:38.0,fd:3.76,Sh:32.8,ch:3.0,Sv:26.4,cv:3.9,nE:2,nl:4.5,nd:2.1},b747:{S:525,c:8.3,tc:0.11,sw:37.5,fl:70.66,fd:6.5,Sh:136,ch:6.0,Sv:77,cv:7.0,nE:4,nl:5.8,nd:3.0}};
function dbuild(st){ let k="a380"; try{ k=S.ac; }catch(e){} const d=DBG[k]||DBG.a380, a=isa(st.h), V=st.M*a.a, M=st.M;
  const Cf=L=>{ const Re=a.rho*V*L/a.mu; return 0.455/(Math.pow(Math.log10(Re),2.58)*Math.pow(1+0.144*M*M,0.65)); };
  const ffw=tc=>(1+0.6/0.35*tc+100*Math.pow(tc,4))*(1.34*Math.pow(M,0.18)*Math.pow(Math.cos(d.sw*D2R),0.28));
  const f=d.fl/d.fd, fn=d.nl/d.nd;
  const parts=[
    {n:"الجناح",c:LRN.C.ctrl,v:Cf(d.c)*ffw(d.tc)*1.0*(0.85*d.S*(1.977+0.52*d.tc))/d.S},
    {n:"جسم الطائرة",c:LRN.C.struct,v:Cf(d.fl)*(1+60/Math.pow(f,3)+f/400)*1.0*(Math.PI*d.fd*d.fl*0.8)/d.S},
    {n:"الذيل الأفقي",c:LRN.C.hyd,v:Cf(d.ch)*ffw(0.1)*1.04*(2.04*d.Sh)/d.S},
    {n:"الذيل العمودي",c:LRN.C.gear,v:Cf(d.cv)*ffw(0.1)*1.04*(2.04*d.Sv)/d.S},
    {n:"المحركات",c:LRN.C.fuel,v:Cf(d.nl)*(1+0.35/fn)*1.2*(d.nE*Math.PI*d.nd*d.nl*0.9)/d.S}];
  let sum=parts.reduce((s,p)=>s+p.v,0); const misc=sum*st.ex/100; parts.push({n:"تسرب ونتوءات",c:LRN.C.muted,v:misc}); sum+=misc;
  return {d,parts,sum,ReW:a.rho*V*d.c/a.mu,CfW:Cf(d.c),k}; }
LESSONS.rds.push({
  ar:"تقدير السحب الطفيلي قطعةً قطعة", en:"Parasite drag: component build-up", alt:"منظر علوي للطائرة تتلوّن أجزاؤها حسب نصيبها من السحب، وأشرطة تبيّن عدد وحدات السحب لكل جزء",
  intro:["السحب الطفيلي C_D0 ما يُقاس بالحدس؛ المصمم يحسبه لكل جزء على حدة: احتكاك سطحه (يعتمد على رينولدز وماخ)، ومعامل الشكل (السماكة والنحافة)، والتداخل مع الأجزاء المجاورة، ثم يجمع الكل نسبةً إلى مساحة الجناح.",
         "النتيجة تقاس عادة بـ«وحدات سحب» (Drag counts)، والوحدة = 0.0001. الأجزاء الكبيرة المبللة (الجناح والجسم) تأخذ حصة الأسد، والطائرة المختارة في الأعلى."],
  ctl:[{k:"M",ar:"عدد ماخ",min:0.3,max:0.9,step:0.01,v:0.85,f:v=>nf(v,2)},{k:"h",ar:"الارتفاع",min:0,max:13000,step:100,v:11000,f:v=>nf(v/1000,1)+" km"},{k:"ex",ar:"تسرب ونتوءات وتآكل (%)",min:0,max:15,step:0.5,v:4,f:v=>nf(v,1)+"%"}],
  init(st){ st.disp=[0,0,0,0,0,0]; },
  calc(st){ Object.assign(st,dbuild(st)); },
  step(st,dt){ st.parts.forEach((p,i)=>st.disp[i]=lease(st.disp[i],p.v,dt,4)); },
  draw(g,W,H,st,C){
    const d=st.d, cx=W*0.24, cy=H*0.5, s=Math.min(W*0.4/ (d.fl), H*0.8/(d.fl));
    const mx=Math.max(...st.parts.map(p=>p.v)), hi=Math.floor(st.t/1.6)%5, col=i=>mixC(C.panel,st.parts[i].c,0.25+0.7*st.parts[i].v/mx);
    const span=Math.sqrt(d.S*8)*0.5;
    g.lineWidth=1.2; g.strokeStyle=C.ink;
    const shape=(i,fn)=>{ g.save(); g.fillStyle=col(i); g.globalAlpha=hi===i?1:0.9; g.beginPath(); fn(); g.fill(); g.stroke(); g.restore(); };
    shape(0,()=>{ g.moveTo(cx-span*s,cy+d.fl*s*0.08); g.lineTo(cx,cy-d.fl*s*0.12); g.lineTo(cx+span*s,cy+d.fl*s*0.08); g.lineTo(cx+span*s,cy+d.fl*s*0.12); g.lineTo(cx,cy+d.fl*s*0.05); g.lineTo(cx-span*s,cy+d.fl*s*0.12); g.closePath(); });
    shape(2,()=>{ const y=cy+d.fl*s*0.4, hs=Math.sqrt(d.Sh*4.5)*0.5*s; g.moveTo(cx-hs,y+hs*0.25); g.lineTo(cx,y-hs*0.15); g.lineTo(cx+hs,y+hs*0.25); g.lineTo(cx+hs,y+hs*0.38); g.lineTo(cx,y+hs*0.1); g.lineTo(cx-hs,y+hs*0.38); g.closePath(); });
    shape(1,()=>{ g.ellipse(cx,cy,d.fd*s*0.5,d.fl*s*0.5,0,0,Math.PI*2); });
    shape(3,()=>{ g.rect(cx-1.5,cy+d.fl*s*0.25,3,d.fl*s*0.24); });
    for(let e=0;e<d.nE;e++){ const side=e%2?1:-1, yy=(Math.floor(e/2)+1)*span*s/(d.nE/2+1); shape(4,()=>{ g.ellipse(cx+side*yy,cy-d.fl*s*0.05,d.nd*s*0.5,d.nl*s*0.5,0,0,Math.PI*2); }); }
    const bx=W*0.5, bw=W*0.46, by=H*0.12, bh=(H*0.76)/st.parts.length, max=Math.max(0.0001,...st.disp)*1.15;
    st.parts.forEach((p,i)=>{ const y=by+i*bh, w=bw*st.disp[i]/max; g.save(); g.fillStyle=p.c; g.globalAlpha=hi===i?1:0.75; g.fillRect(bx,y+bh*0.2,w,bh*0.6); g.restore();
      ltx(g,p.n,bx+bw,y+bh*0.5-8,{s:11,a:"right",rtl:true}); ltx(g,nf(st.disp[i]*1e4,1)+" counts",bx+w+6,y+bh*0.5+2,{c:C.muted,s:10,a:"left",m:true}); });
  },
  ro(st){ const big=st.parts.slice().sort((a,b)=>b.v-a.v)[0]; return [["C_D0 الكلي",nf(st.sum,5)+" ("+nf(st.sum*1e4,0)+" counts)"],["أكبر مساهم",big.n+" ("+nf(big.v/st.sum*100,0)+"%)"],["رينولدز الجناح",sci(st.ReW)],["معامل احتكاك الجناح C_f",nf(st.CfW,5)]]; },
  eq:["C_D0 = Σ C_f · FF · Q · S_wet / S_ref  + تسرب ونتوءات","C_f = 0.455 / [(log₁₀ Re)^2.58 · (1 + 0.144 M²)^0.65]   (مضطرب)","FF_جناح = [1 + 0.6/(x/c)_m · (t/c) + 100(t/c)⁴] · [1.34 M^0.18 (cos Λ)^0.28]","FF_جسم = 1 + 60/f³ + f/400 ,  f = طول/قطر"],
  note:["الجناح والجسم معاً يشكّلان غالباً أكثر من ثلثي السحب الطفيلي لطائرة النقل.","سطح أملس ونظيف مهم: الأوساخ والتآكل والفجوات ترفع السحب، وبالتالي استهلاك الوقود.","المساحة «المبللة» هي كل السطح الذي يلامسه الهواء، وهي أكبر بكثير من مساحة الجناح المرجعية."],
  quiz:[{q:"ماذا يعني «وحدة سحب» (drag count)؟",o:["0.01","0.0001 من C_D","نيوتن واحد"],a:1,why:"تُستخدم لأن فروق السحب الصغيرة مهمة: 10 وحدات قد تعني نحو 3% من السحب الكلي."},
        {q:"لماذا يقل معامل الاحتكاك C_f لجسم الطائرة الطويل؟",o:["لأن رينولدز أكبر","لأن السرعة أقل","لأن السطح خشن"],a:0,why:"C_f المضطرب يقل كلما كبر رينولدز (طول أكبر)."}],
  ref:"الموضوع المقابل: تقدير السحب بطريقة تجميع المكونات (Component Build-up Method)."
});
