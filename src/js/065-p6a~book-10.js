/* ---------------- Book 10: Theory of Flight ---------------- */
function jkVel(st,x,y){ const sx=x-st.z0x, sy=y-st.z0y, r2=sx*sx+sy*sy, ca=Math.cos(st.ar), sa=Math.sin(st.ar);
  const inv2=cdiv(cx_(1,0),cmul(cx_(sx,sy),cx_(sx,sy))), t2=cmul(cmul(cx_(st.R*st.R,0),cx_(ca,sa)),inv2), t3=cmul(cx_(0,st.G/(2*Math.PI)),cdiv(cx_(1,0),cx_(sx,sy)));
  const w=cadd(csub(cx_(ca,-sa),t2),t3); return [w.re,-w.im,r2]; }
function jkMap(x,y){ const r2=x*x+y*y||1e-9; return [x+x/r2,y-y/r2]; }
LESSONS.tof.push({
  ar:"التحويل المطابق وجناح جوكوفسكي", en:"Conformal mapping and the Joukowski airfoil", alt:"لوحتان: دائرة وخطوط انسياب حولها، وبجانبها نفس الخطوط بعد تحويلها إلى خطوط حول مقطع جناح",
  intro:["فكرة جميلة من نظرية الطيران: نعرف تماماً كيف يمر الهواء حول دائرة. باستخدام تحويل رياضي (z = ζ + 1/ζ) نحوّل الدائرة إلى شكل مقطع جناح، وتتحوّل معها خطوط الانسياب.",
         "تحريك مركز الدائرة أفقياً يعطي سماكة، وعمودياً يعطي انحناء. والدوران Γ يُختار بحيث يغادر الهواء الحافة الخلفية الحادة بسلاسة (شرط كوتا). اليسار: الدائرة، واليمين: الجناح الناتج؛ نفس الجزيئات في المكانين."],
  ctl:[{k:"al",ar:"زاوية الهجوم",min:-4,max:14,step:0.25,v:6,f:v=>nf(v,2)+"°"},{k:"eps",ar:"السماكة (إزاحة أفقية)",min:0,max:0.15,step:0.005,v:0.08,f:v=>nf(v,3)},{k:"mu",ar:"الانحناء (إزاحة عمودية)",min:0,max:0.2,step:0.005,v:0.08,f:v=>nf(v,3)}],
  init(st){ st.p=[]; for(let i=0;i<190;i++) st.p.push({x:-3+Math.random()*6,y:Math.random()*4-2,h:[]}); },
  calc(st){ st.ar=st.al*D2R; st.z0x=-st.eps; st.z0y=st.mu; st.R=Math.hypot(1+st.eps,st.mu); st.beta=Math.atan2(st.mu,1+st.eps); st.G=4*Math.PI*st.R*Math.sin(st.ar+st.beta);
    let mn=1e9,mx=-1e9; for(let k=0;k<360;k++){ const t=k*D2R, z=jkMap(st.z0x+st.R*Math.cos(t),st.z0y+st.R*Math.sin(t)); mn=Math.min(mn,z[0]); mx=Math.max(mx,z[0]); } st.ch=mx-mn; st.cl=2*st.G/st.ch; st.aL0=-st.beta/D2R; },
  step(st,dt){ const k=dt*0.6; st.p.forEach(q=>{ const a=jkVel(st,q.x,q.y), b=jkVel(st,q.x+a[0]*k/2,q.y+a[1]*k/2); q.h.push([q.x,q.y]); if(q.h.length>9) q.h.shift(); q.x+=b[0]*k; q.y+=b[1]*k;
      const dx=q.x-st.z0x, dy=q.y-st.z0y; if(dx*dx+dy*dy<st.R*st.R*1.002||q.x>3||Math.abs(q.y)>2||!isFinite(q.x)){ q.x=-3; q.y=Math.random()*4-2; q.h=[]; } }); },
  draw(g,W,H,st,C){
    const half=W/2, s1=Math.min(half/6.2,H/4.4), o1=[half/2,H/2], s2=Math.min(half/5.4,H/3.4), o2=[half+half/2,H/2];
    const A=(x,y)=>[o1[0]+x*s1,o1[1]-y*s1], B=(x,y)=>{ const z=jkMap(x,y); return [o2[0]+z[0]*s2,o2[1]-z[1]*s2]; };
    lclip(g,{x:0,y:0,w:half,h:H}); st.p.forEach(q=>{ if(q.h.length<2) return; lline(g,q.h.concat([[q.x,q.y]]).map(p=>A(p[0],p[1])),C.ctrl,1.3,null,0.55); }); g.restore();
    lclip(g,{x:half,y:0,w:half,h:H}); st.p.forEach(q=>{ if(q.h.length<2) return; lline(g,q.h.concat([[q.x,q.y]]).map(p=>B(p[0],p[1])),C.ctrl,1.3,null,0.55); }); g.restore();
    const circ=[], foil=[]; for(let k=0;k<=360;k+=3){ const t=k*D2R, x=st.z0x+st.R*Math.cos(t), y=st.z0y+st.R*Math.sin(t); circ.push(A(x,y)); foil.push(B(x,y)); }
    g.fillStyle=mixC(C.panel,C.struct,0.3); g.strokeStyle=C.ink; g.lineWidth=2; [circ,foil].forEach(pp=>{ g.beginPath(); pp.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])); g.closePath(); g.fill(); g.stroke(); });
    const te=A(1,0); ldot(g,te[0],te[1],4,C.power); const te2=B(1,0); ldot(g,te2[0],te2[1],4,C.power);
    lline(g,[[half,10],[half,H-10]],C.line,1); ltx(g,"مستوى الدائرة ζ",o1[0],16,{c:C.muted,s:11,rtl:true}); ltx(g,"مستوى الجناح z = ζ + 1/ζ",o2[0],16,{c:C.muted,s:11,rtl:true});
  },
  ro(st){ return [["الدوران Γ (V∞ = 1)",nf(st.G,3)],["طول الوتر",nf(st.ch,3)],["معامل الرفع c_l",nf(st.cl,3)],["زاوية الرفع الصفري",nf(st.aL0,2)+"°"]]; },
  eq:["z = ζ + 1/ζ   (تحويل جوكوفسكي)","مركز الدائرة ζ₀ = (−ε, μ) ,  R = |1 − ζ₀|","كوتا: Γ = 4π V∞ R sin(α + β) ,  β = atan(μ / (1 + ε))","L′ = ρ V∞ Γ"],
  note:["التحويل يحافظ على الزوايا (مطابق)، فتتحول خطوط الانسياب حول الدائرة إلى خطوط انسياب صحيحة حول الجناح.","النقطة ζ = 1 تتحول إلى الحافة الخلفية الحادة؛ عندها السرعة محددة فقط إذا اخترنا Γ حسب شرط كوتا.","هذه الطريقة كانت أساس حسابات المقاطع في بدايات الطيران قبل الحاسوب."],
  quiz:[{q:"ما الذي يعطي الجناح انحناءه في تحويل جوكوفسكي؟",o:["إزاحة مركز الدائرة عمودياً","تكبير الدائرة","زاوية الهجوم"],a:0,why:"الإزاحة العمودية μ تنتج خط انحناء مقوّس، والأفقية ε تنتج السماكة."},
        {q:"لماذا نحتاج اختيار Γ بقيمة محددة؟",o:["لتكون السرعة محدودة عند الحافة الخلفية الحادة (شرط كوتا)","لتقليل الوزن","لزيادة السماكة"],a:0,why:"أي قيمة أخرى تجعل السرعة لا نهائية عند الحافة الحادة."}],
  ref:"الموضوع المقابل: التحويل المطابق ومقاطع جوكوفسكي (Conformal Mapping, Joukowski Profiles)."
});

LESSONS.tof.push({
  ar:"مركز الضغط والمركز الهوائي", en:"Center of pressure and aerodynamic center", alt:"مقطع جناح عليه سهم القوة المحصلة يتحرك على طول الوتر مع تغير زاوية الهجوم، أو قوة ثابتة الموضع مع عزم",
  intro:["الضغط موزّع على الجناح، لكن يمكن استبداله بقوة واحدة تؤثر عند «مركز الضغط». المزعج أن هذا المركز يتحرك كثيراً مع زاوية الهجوم في المقاطع المنحنية، بل يهرب بعيداً عندما يقترب الرفع من الصفر.",
         "الحل الأذكى: نضع القوة عند «المركز الهوائي» (ربع الوتر تقريباً) مع عزم ثابت لا يتغيّر مع الزاوية. فعّل الخيار وقارن التمثيلين: نفس التأثير الفيزيائي، لكن الثاني أسهل في الحسابات."],
  ctl:[{k:"al",ar:"زاوية الهجوم",min:-2,max:12,step:0.25,v:3,f:v=>nf(v,2)+"°"},{k:"m",ar:"الانحناء الأقصى",min:0,max:0.06,step:0.002,v:0.03,f:v=>nf(v*100,1)+"%"}],
  tog:[{k:"ac",ar:"تمثيل بالمركز الهوائي + عزم",v:false}],
  init(st){ st.xd=0.3; },
  calc(st){ st.cl=2*Math.PI*(st.al*D2R+2*st.m); st.cm=-Math.PI*st.m; st.xcp=Math.abs(st.cl)>1e-4?0.25-st.cm/st.cl:null; },
  step(st,dt){ st.xd=lease(st.xd,st.xcp==null?3:clamp(st.xcp,-1,3),dt,4); },
  draw(g,W,H,st,C){
    const x0=W*0.12, c=W*0.62, y0=H*0.42, a=st.al*D2R, P=x=>{ const z=4*st.m*x*(1-x)*3; return [x0+(x*Math.cos(a)+z*Math.sin(a))*c, y0+(x*Math.sin(a)-z*Math.cos(a))*c]; };
    const pts=[]; for(let i=0;i<=40;i++) pts.push(P(i/40)); lline(g,pts,C.ink,6);
    for(let x=0;x<=1;x+=0.25){ const p=P(x); lline(g,[[p[0],p[1]+10],[p[0],p[1]+16]],C.muted,1); ltx(g,nf(x,2),p[0],p[1]+26,{c:C.muted,s:9,m:true}); }
    const L=clamp(Math.abs(st.cl)*H*0.28,6,H*0.33)*Math.sign(st.cl||1);
    if(!st.ac){ const xc=st.xd, inside=xc>=-0.1&&xc<=1.4, p=P(clamp(xc,-0.1,1.4)); if(inside) larrow(g,p[0],p[1],p[0],p[1]-L,C.power,4,12);
      ltx(g,st.xcp==null?"مركز الضغط في اللانهاية (رفع صفر)":"مركز الضغط x_cp/c = "+nf(st.xcp,3),W-12,20,{c:C.power,s:13,w:600,a:"right",rtl:true}); }
    else { const p=P(0.25); larrow(g,p[0],p[1],p[0],p[1]-L,C.hyd,4,12); g.save(); g.strokeStyle=C.accent; g.lineWidth=2.5; g.beginPath(); g.arc(p[0],p[1],26,Math.PI*0.2,Math.PI*1.2,st.cm>0); g.stroke(); g.restore();
      ltx(g,"رفع عند ربع الوتر + عزم ثابت c_m = "+nf(st.cm,3),W-12,20,{c:C.hyd,s:13,w:600,a:"right",rtl:true}); }
    const r={x:W*0.12,y:H*0.66,w:W*0.84,h:H*0.25}, Pl=lplot(g,r,[-2,12],[0,1.2],{xt:[-2,0,2,4,6,8,10,12],yt:[0,0.25,0.5,1],xl:"α (°)",yl:"x_cp / c"});
    lline(g,[[r.x,Pl.Y(0.25)],[r.x+r.w,Pl.Y(0.25)]],C.hyd,1.2,[5,4]); lclip(g,r); const cur=[]; for(let a2=-2;a2<=12;a2+=0.05){ const cl=2*Math.PI*(a2*D2R+2*st.m); if(Math.abs(cl)<1e-3){ cur.push(null); continue; } const x=0.25+Math.PI*st.m/cl; cur.push(x>0&&x<1.3?[Pl.X(a2),Pl.Y(x)]:null); }
    let seg=[]; cur.forEach(p=>{ if(p) seg.push(p); else { lline(g,seg,C.power,2); seg=[]; } }); lline(g,seg,C.power,2); if(st.xcp!=null&&st.xcp<1.3&&st.xcp>0) ldot(g,Pl.X(st.al),Pl.Y(st.xcp),5,C.power); g.restore();
  },
  ro(st){ return [["c_l",nf(st.cl,3)],["c_m حول المركز الهوائي",nf(st.cm,3)],["مركز الضغط",st.xcp==null?"∞":nf(st.xcp,3)+" c"],["المركز الهوائي","0.25 c (ثابت)"]]; },
  eq:["x_cp = x_ac − c_m,ac / c_l","نظرية المقطع الرقيق: x_ac = c/4 ,  c_m,ac = −π m (خط قطعي)","Lift·x_cp = Lift·x_ac − M_ac"],
  note:["للمقطع المتماثل (m = 0) مركز الضغط ثابت عند ربع الوتر.","حركة مركز الضغط كانت مشكلة كبيرة لاستقرار الطائرات الأولى؛ استخدام المركز الهوائي جعل التحليل أبسط.","العزم حول المركز الهوائي سالب للمقاطع المنحنية (يخفض الأنف)، ويعوّضه الذيل."],
  quiz:[{q:"ما ميزة المركز الهوائي؟",o:["العزم حوله لا يتغيّر مع زاوية الهجوم","الرفع عنده صفر","يتحرك مع الزاوية"],a:0,why:"هذا تعريفه، وهو قرب ربع الوتر في السرعات دون الصوتية."},
        {q:"ماذا يحدث لمركز الضغط لمقطع منحنٍ عندما يقترب الرفع من الصفر؟",o:["يبقى ثابتاً","يبتعد كثيراً (نحو اللانهاية)","يذهب للحافة الأمامية"],a:1,why:"x_cp = 0.25 − c_m/c_l، ومع c_l → 0 يكبر الحد الثاني بلا حد."}],
  ref:"الموضوع المقابل: القوى والعزوم على المقطع — مركز الضغط (Moments, Center of Pressure)."
});

function glider(st){ const S=10.5, AR=22, cd0=0.012, k=1/(Math.PI*0.9*AR), W=st.m*G0, rho=1.225, sink=V=>{ const q=0.5*rho*V*V, CL=W/(q*S); return q*S*(cd0+k*CL*CL)*V/W; };
  let best=null; for(let V=18;V<=70;V+=0.05){ const s=sink(V)+st.air; if(s<=0) continue; const ratio=(V-st.wind)/s; if(!best||ratio>best.r) best={V,r:ratio,s}; }
  let ms={s:1e9,V:0}; for(let V=18;V<=70;V+=0.05){ const s=sink(V); if(s<ms.s) ms={s,V}; }
  return {sink,Vbg:Math.sqrt(2*W/(rho*S))*Math.pow(k/cd0,0.25),LDm:1/(2*Math.sqrt(k*cd0)),best,ms}; }
LESSONS.tof.push({
  ar:"الطيران الشراعي وسرعة الطيران المثلى", en:"Gliding flight: the polar and speed-to-fly", alt:"منحنى معدل الهبوط مع السرعة لطائرة شراعية وخط مماس يحدد أفضل سرعة، وطائرة شراعية تنزلق فوق الأرض",
  intro:["الطائرة الشراعية تنزل دائماً بالنسبة للهواء. منحنى «القطبية» يبيّن معدل الهبوط لكل سرعة. أبعد مسافة تأتي من الخط المماس للمنحنى من نقطة الأصل: هذه سرعة أفضل انزلاق.",
         "مع ريح معاكسة أو هواء هابط، نرسم المماس من نقطة مزاحة، فتصير السرعة المثلى أعلى: تطير أسرع لتقضي وقتاً أقل في الظروف السيئة. هذه فكرة «سرعة الطيران» عند الطيارين الشراعيين."],
  ctl:[{k:"m",ar:"الكتلة (مع ماء الثقل)",min:300,max:600,step:5,v:400,f:v=>nf(v,0)+" kg"},{k:"wind",ar:"ريح معاكسة",min:0,max:20,step:0.5,v:0,f:v=>nf(v,1)+" m/s"},{k:"air",ar:"حركة الهواء (+ هابط / − صاعد)",min:-1,max:3,step:0.05,v:0,f:v=>nf(v,2)+" m/s"}],
  init(st){ st.ph=0; }, onSet(st){ st.ph=0; },
  calc(st){ Object.assign(st,glider(st)); },
  step(st,dt){ st.ph+=dt*0.12; },
  draw(g,W,H,st,C){
    const r={x:52,y:24,w:W*0.44,h:H-70}, P=lplot(g,r,[0,70],[-5,1],{xt:[0,20,40,60],yt:[-4,-2,0],xl:"السرعة (m/s)",xlr:true,yl:"معدل الهبوط (m/s)",ylr:true});
    lline(g,[[r.x,P.Y(0)],[r.x+r.w,P.Y(0)]],C.line,1); lclip(g,r); const c=[]; for(let V=18;V<=70;V+=0.5) c.push([P.X(V),P.Y(-st.sink(V))]); lline(g,c,C.accent,2.4);
    if(st.best){ const o=[P.X(st.wind),P.Y(-st.air)], t=[P.X(st.best.V),P.Y(-st.sink(st.best.V))], dx=t[0]-o[0], dy=t[1]-o[1]; lline(g,[o,[o[0]+dx*1.6,o[1]+dy*1.6]],C.power,1.8); ldot(g,o[0],o[1],4,C.power); ldot(g,t[0],t[1],5,C.power); }
    ldot(g,P.X(st.ms.V),P.Y(-st.ms.s),4,C.hyd); g.restore();
    const gx=W*0.54, gw=W*0.43, gy0=H*0.2, gy1=H*0.85, ratio=st.best?st.best.r:0, dist=ratio*1, Dm=Math.max(10,Math.ceil(dist/10)*10);
    g.fillStyle=mixC(C.panel,C.hyd,0.15); g.fillRect(gx,gy1,gw,H-gy1); lline(g,[[gx,gy1],[gx+gw,gy1]],C.ink,2);
    const ex=gx+gw*Math.min(1,dist/Dm); lline(g,[[gx,gy0],[ex,gy1]],C.muted,1.4,[5,4]);
    const f=st.ph%1, px=gx+(ex-gx)*f, py=gy0+(gy1-gy0)*f; lplane(g,px,py,Math.min(W*0.1,H*0.2),-Math.atan((gy1-gy0)/Math.max(1,ex-gx))/D2R,C,{flip:true});
    for(let d=0;d<=Dm;d+=Dm/5){ ltx(g,nf(d,0)+" km",gx+gw*d/Dm,gy1+14,{c:C.muted,s:9,m:true}); }
    ltx(g,"من ارتفاع 1 km",gx+4,gy0-12,{c:C.muted,s:10,a:"left",rtl:true});
  },
  ro(st){ return [["أفضل L/D (هواء ساكن)",nf(st.LDm,1)],["سرعة أفضل انزلاق (ساكن)",nf(st.Vbg,1)+" m/s"],["أقل معدل هبوط",nf(st.ms.s,2)+" m/s عند "+nf(st.ms.V,0)+" m/s"],["السرعة المثلى في الظروف الحالية",st.best?nf(st.best.V,1)+" m/s":"—"],["نسبة الانزلاق الفعلية فوق الأرض",st.best?nf(st.best.r,1):"—"],["المسافة من 1 km",st.best?nf(st.best.r,1)+" km":"—"]]; },
  eq:["w(V) = D·V / W = (½ρV²S·C_D)·V / W","أفضل انزلاق: المماس من الأصل ⇒ max V/w","مع ريح V_w وهبوط هواء s: max (V − V_w)/(w + s)","(L/D)max = 1 / (2√(k·C_D0))"],
  note:["ماء الثقل (Ballast) يزيد الوزن: نفس L/D القصوى لكن عند سرعة أعلى، مفيد في الأيام القوية.","أقل معدل هبوط (للبقاء في تيار صاعد) عند سرعة أبطأ من سرعة أفضل انزلاق.","الطائرات الشراعية الحديثة تصل L/D حوالي 50 إلى 70."],
  quiz:[{q:"مع ريح معاكسة، السرعة المثلى للانزلاق:",o:["أبطأ","أسرع","نفسها"],a:1,why:"المماس من نقطة مزاحة لليمين يلمس المنحنى عند سرعة أعلى."},
        {q:"زيادة وزن الطائرة الشراعية (ماء الثقل):",o:["تقلل L/D القصوى","تُبقي L/D القصوى وتنقل السرعة المثلى للأعلى","تقلل السرعة المثلى"],a:1,why:"المنحنى يتمدد بعامل √(W)، فتبقى نسبة الانزلاق نفسها عند سرعة أكبر."}],
  ref:"الموضوع المقابل: الطيران الانزلاقي ومنحنى الأداء (Gliding Flight, Performance Polar)."
});

LESSONS.tof.push({
  ar:"نظام الدوامات: المقيدة والخلفية ودوامة البداية", en:"The vortex system: bound, trailing and starting vortices", alt:"منظر مائل لجناح يتحرك من السكون فيترك خلفه دوامة بداية، وتمتد دوامتان من الطرفين لتشكل حلقة مع الدوامة المقيدة",
  intro:["حسب نظرية كلفن، الدوران الكلي في الهواء يبقى صفراً. فعندما يبدأ الجناح بالحركة ويتولد عليه دوران Γ («الدوامة المقيدة»)، تتكون خلفه دوامة معاكسة بنفس الشدة: «دوامة البداية».",
         "ولا تنتهي الدوامة عند طرفي الجناح؛ بل تمتد للخلف كدوامتين خلفيتين تصلان دوامة البداية، فتتكون حلقة مغلقة. كل تغيير في زاوية الهجوم يطلق دوامة جديدة صغيرة. حرّك الزاوية وشاهد."],
  ctl:[{k:"al",ar:"زاوية الهجوم",min:0,max:12,step:0.25,v:6,f:v=>nf(v,2)+"°"}],
  act:{ar:"ابدأ من السكون",fn:st=>{ st.shed=[{x:0,G:-st.G}]; st.prevG=st.G; }},
  init(st){ st.shed=null; st.p=[]; for(let i=0;i<240;i++) st.p.push({ln:Math.floor(Math.random()*4),s:Math.random(),a:Math.random()*6.283,r:0.04+Math.random()*0.12}); },
  calc(st){ const V=50, c=2, b=10; st.cl=2*Math.PI*(st.al+2)*D2R; st.G=0.5*V*c*st.cl; st.w=st.G/(Math.PI*b); if(!st.shed){ st.shed=[{x:0,G:-st.G}]; st.prevG=st.G; }
    else if(Math.abs(st.G-st.prevG)>1e-6){ st.shed.push({x:0,G:-(st.G-st.prevG)}); st.prevG=st.G; } },
  step(st,dt){ st.shed.forEach(s=>s.x+=dt*0.35); st.shed=st.shed.filter((s,i)=>i===0||s.x<4); const sgn=[-1,1,-1,1];
    st.p.forEach(q=>{ q.a+=dt*(q.ln===0?-4:(q.ln===1?4:3))/(q.r*8); }); },
  draw(g,W,H,st,C){
    const cx=W*0.22, cy=H*0.55, kx=W*0.17, ky=H*0.42, PR=(x,y,z)=>[cx+x*kx+y*0.42*ky, cy-z*ky+y*-0.3*ky*1.0+ -y*0.0];
    const P=(x,y,z)=>[cx+x*kx-y*0.5*ky, cy-z*ky+y*0.28*ky];
    const b2=1, xs=Math.min(st.shed[0].x,4);
    g.fillStyle=mixC(C.panel,C.struct,0.35); g.strokeStyle=C.ink; g.lineWidth=1.5; const w=[P(-0.08,-b2,0),P(-0.08,b2,0),P(0.12,b2,0),P(0.12,-b2,0)]; g.beginPath(); w.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])); g.closePath(); g.fill(); g.stroke();
    const sG=Math.abs(st.G)/40;
    lline(g,[P(0,-b2,0),P(0,b2,0)],C.power,3); lline(g,[P(0,b2,0),P(xs,b2,0)],C.sys,2.5); lline(g,[P(0,-b2,0),P(xs,-b2,0)],C.sys,2.5);
    st.shed.forEach((s,i)=>{ lline(g,[P(s.x,-b2,0),P(s.x,b2,0)],i===0?C.ctrl:mixC(C.ctrl,C.panel,0.4),i===0?3:1.6); });
    st.p.forEach(q=>{ let p; const rr=q.r*(0.5+sG);
      if(q.ln===0) p=P(0+rr*Math.cos(q.a),-b2+q.s*2*b2,rr*Math.sin(q.a));
      else if(q.ln===1) p=P(xs+rr*Math.cos(q.a),-b2+q.s*2*b2,rr*Math.sin(q.a));
      else if(q.ln===2) p=P(q.s*xs,b2+rr*Math.cos(q.a),rr*Math.sin(q.a));
      else p=P(q.s*xs,-b2-rr*Math.cos(q.a),rr*Math.sin(q.a));
      ldot(g,p[0],p[1],1.8,q.ln===0?C.power:(q.ln===1?C.ctrl:C.sys),0.75); });
    const lb=P(0,b2,0), ls=P(xs,b2,0); ltx(g,"دوامة مقيدة +Γ",lb[0]-6,lb[1]+20,{c:C.power,s:11,a:"right",rtl:true}); ltx(g,"دوامة البداية −Γ",ls[0]+8,ls[1]+20,{c:C.ctrl,s:11,a:"left",rtl:true});
    const lt=P(xs/2,-b2,0); ltx(g,"دوامة خلفية",lt[0],lt[1]-16,{c:C.sys,s:11,rtl:true});
    larrow(g,W*0.88,H*0.12,W*0.74,H*0.12,C.ink,2,8); ltx(g,"اتجاه الطيران",W*0.81,H*0.12-12,{c:C.muted,s:10,rtl:true});
  },
  ro(st){ return [["الدوران المقيد Γ",nf(st.G,1)+" m²/s"],["دوامة البداية",nf(-st.G,1)+" m²/s"],["الدوران الكلي (كلفن)","صفر"],["الهواء الهابط في المنتصف",nf(st.w,2)+" m/s"],["عدد الدوامات المنطلقة",String(st.shed.length)]]; },
  eq:["Γ = ½ · V∞ · c · c_l   (V∞ = 50 m/s ، c = 2 m)","نظرية كلفن: DΓ/Dt = 0 ⇒ Γ_bound + Γ_start = 0","هواء هابط من دوامتين خلفيتين في المنتصف: w = Γ / (π b)"],
  note:["دوامة البداية حقيقية ويمكن تصويرها بالدخان في الأنفاق: تنفصل عن الحافة الخلفية عند بدء الحركة.","الدوامات الخلفية هي نفسها دوامات الأطراف التي تسبب السحب المستحث.","في الطيران الحقيقي تبقى دوامة البداية على المدرج بعيداً، والحلقة «مفتوحة» عملياً."],
  quiz:[{q:"لماذا تتكون دوامة البداية؟",o:["بسبب المحرك","لأن الدوران الكلي يجب أن يبقى صفراً (كلفن)","بسبب الأرض"],a:1,why:"ظهور +Γ على الجناح يتطلب −Γ في الهواء خلفه."},
        {q:"عندما تزيد زاوية الهجوم فجأة:",o:["تنطلق دوامة جديدة بإشارة معاكسة للزيادة","لا يحدث شيء","تختفي الدوامات"],a:0,why:"أي تغيير في الدوران المقيد يُطلق دوامة مساوية ومعاكسة للتغيير."}],
  show:{ar:"اعرض الدوامات على الطائرة",fn:()=>{ lrnFlowOn(); lrnSel("wingtip"); }},
  ref:"الموضوع المقابل: الدوامات ونظرية كلفن وبدء الرفع (Vortex Theory, Starting Vortex)."
});

/* =====================================================================================
   More lessons: two per book for books 3–10 (design, mechanics, structures, stability,
   aeronautics, astrodynamics, spacecraft, theory of flight). Own wording, core ideas only.
   ===================================================================================== */

/* small helpers for these lessons */
function lcmap(v,C){ v=clamp(v,0,1); const a=hx(C.panel).map((q,i)=>q+(hx(C.ctrl)[i]-q)*0.45), b=hx(C.fuel), c=hx(C.power), m=v<0.6?a.map((q,i)=>q+(b[i]-q)*v/0.6):b.map((q,i)=>q+(c[i]-q)*(v-0.6)/0.4); return "rgb("+m.map(Math.round).join(",")+")"; }
/* top view of an airliner, nose pointing along angle ang (radians, screen), length s */
function tplane(g,x,y,s,ang,C){ g.save(); g.translate(x,y); g.rotate(ang); g.fillStyle=mixC(C.panel,C.struct,0.35); g.strokeStyle=C.ink; g.lineWidth=1.2;
  g.beginPath(); g.moveTo(s*0.5,0); g.quadraticCurveTo(s*0.46,-s*0.05,s*0.36,-s*0.05); g.lineTo(s*0.1,-s*0.05); g.lineTo(-s*0.12,-s*0.5); g.lineTo(-s*0.2,-s*0.5); g.lineTo(-s*0.08,-s*0.05); g.lineTo(-s*0.36,-s*0.04);
  g.lineTo(-s*0.46,-s*0.2); g.lineTo(-s*0.5,-s*0.2); g.lineTo(-s*0.47,0); g.lineTo(-s*0.5,s*0.2); g.lineTo(-s*0.46,s*0.2); g.lineTo(-s*0.36,s*0.04); g.lineTo(-s*0.08,s*0.05); g.lineTo(-s*0.2,s*0.5); g.lineTo(-s*0.12,s*0.5); g.lineTo(s*0.1,s*0.05); g.lineTo(s*0.36,s*0.05); g.quadraticCurveTo(s*0.46,s*0.05,s*0.5,0);
  g.closePath(); g.fill(); g.stroke(); g.restore(); }
