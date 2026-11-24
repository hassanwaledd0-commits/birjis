/* ---------------- Book 9: Spacecraft Systems Engineering ---------------- */
function stageCalc(st){ const N=st.N, lam=Math.pow(st.pf,1/N), r=1/(1-(1-st.eps)*(1-lam)), dvs=st.isp*G0*Math.log(r)/1000; return {lam,r,dvs,dv:N*dvs}; }
LESSONS.sse.push({
  ar:"معادلة الصاروخ والمراحل", en:"The rocket equation and staging", alt:"صاروخ يصعد وتنفصل مراحله واحدة بعد الأخرى، وشريط السرعة يقترب من السرعة اللازمة للمدار",
  intro:["الصاروخ يتسارع بقذف كتلة للخلف. معادلة تسيولكوفسكي تقول إن التغيير في السرعة يعتمد على سرعة العادم (أي الدفع النوعي Isp) ولوغاريتم نسبة الكتلة الابتدائية إلى النهائية.",
         "المشكلة أن الخزانات والمحركات الفارغة ثقيلة. الحل: المراحل. بعد ما ينتهي وقود المرحلة نرميها ونكمل بصاروخ أخف. للوصول للمدار المنخفض نحتاج حوالي 9.4 km/s متضمنة خسائر الجاذبية والهواء."],
  ctl:[{k:"isp",ar:"الدفع النوعي Isp",min:250,max:460,step:1,v:340,f:v=>nf(v,0)+" s"},{k:"eps",ar:"نسبة الهيكل في كل مرحلة",min:0.05,max:0.2,step:0.005,v:0.1,f:v=>nf(v*100,1)+"%"},{k:"pf",ar:"نسبة الحمولة من الكتلة الكلية",min:0.005,max:0.06,step:0.001,v:0.025,f:v=>nf(v*100,1)+"%"}],
  pre:[{ar:"مرحلة واحدة",set:{N:1}},{ar:"مرحلتان",set:{N:2}},{ar:"ثلاث مراحل",set:{N:3}}],
  init(st){ st.N=2; st.tt=0; }, onSet(st){ st.tt=0; },
  calc(st){ Object.assign(st,stageCalc(st)); st.ok=st.dv>=9.4; },
  step(st,dt){ st.tt+=dt; },
  draw(g,W,H,st,C){
    const N=st.N, cyc=st.tt%(N*3+3), k=Math.min(N,Math.floor(cyc/3)), fr=Math.min(1,(cyc-k*3)/3), cx=W*0.3;
    const hs=[]; for(let i=0;i<N;i++) hs.push(Math.pow(st.lam,i)); const tot=hs.reduce((a,b)=>a+b,0)+0.35, hp=H*0.62/tot;
    const climb=Math.min(1,cyc/(N*3))*H*0.25; let y=H*0.88-climb;
    for(let i=0;i<N;i++){ const h=hs[i]*hp, w=Math.max(16,W*0.06*Math.sqrt(hs[i])); if(i<k){ const fall=(cyc-(i+1)*3)*30; g.save(); g.globalAlpha=Math.max(0,0.6-fall/200); g.fillStyle=C.struct; g.fillRect(cx-w/2-fall*0.3,y+fall,w,h); g.restore(); continue; }
      g.fillStyle=mixC(C.panel,C.struct,0.3); g.strokeStyle=C.ink; g.lineWidth=1.4; g.fillRect(cx-w/2,y-h,w,h); g.strokeRect(cx-w/2,y-h,w,h);
      const fill=i===k?1-fr:1; g.fillStyle=C.fuel; g.globalAlpha=0.75; g.fillRect(cx-w/2+3,y-h+3+(h-6)*(1-fill),w-6,(h-6)*fill); g.globalAlpha=1;
      if(i===k&&cyc<N*3){ g.fillStyle=C.power; g.beginPath(); g.moveTo(cx-w/3,y); g.lineTo(cx,y+18+Math.random()*10); g.lineTo(cx+w/3,y); g.closePath(); g.fill(); }
      y-=h; }
    const pw=Math.max(10,W*0.03); g.fillStyle=C.accent; g.beginPath(); g.moveTo(cx-pw/2,y); g.lineTo(cx,y-0.35*hp); g.lineTo(cx+pw/2,y); g.closePath(); g.fill();
    const bx=W*0.6, bw=W*0.33, by=H*0.42, maxv=Math.max(12,st.dv*1.1), sc=bw/maxv, done=Math.min(N,(cyc/3));
    let acc=0; for(let i=0;i<N;i++){ const part=clamp(done-i,0,1)*st.dvs; g.fillStyle=[C.ctrl,C.hyd,C.gear][i%3]; g.fillRect(bx+acc*sc,by,part*sc,26); acc+=part; }
    g.strokeStyle=C.line; g.strokeRect(bx,by,bw,26); lline(g,[[bx+9.4*sc,by-14],[bx+9.4*sc,by+40]],C.power,2,[4,3]);
    ltx(g,"المدار 9.4 km/s",bx+9.4*sc,by-22,{c:C.power,s:10,rtl:true}); ltx(g,"Δv = "+nf(acc,2)+" km/s",bx,by+48,{s:12,w:600,a:"left",m:true});
    ltx(g,st.ok?"يكفي للوصول إلى المدار":"لا يكفي للمدار",W-12,20,{c:st.ok?C.hyd:C.power,s:13,w:600,a:"right",rtl:true});
  },
  ro(st){ return [["Δv لكل مرحلة",nf(st.dvs,2)+" km/s"],["Δv الكلي",nf(st.dv,2)+" km/s"],["نسبة الكتلة لكل مرحلة",nf(st.r,2)],["عدد المراحل",String(st.N)],["سرعة العادم",nf(st.isp*G0/1000,2)+" km/s"]]; },
  eq:["Δv = I_sp · g₀ · ln(m₀ / m_f)","مراحل متماثلة: λ = π^(1/N) ,  m₀/m_f = 1 / [1 − (1 − ε)(1 − λ)]","Δv_total = Σ Δv_k"],
  note:["مرحلة واحدة نادراً ما تكفي للمدار لأن الهيكل الفارغ يُحمل حتى النهاية.","مضاعفة Isp تضاعف Δv لنفس نسبة الكتلة؛ لهذا محركات الهيدروجين (Isp حوالي 450 s) تُستخدم في المراحل العليا.","فوائد المرحلة الرابعة والخامسة تقل، مقابل تعقيد وتكلفة أكبر."],
  quiz:[{q:"لماذا نستخدم المراحل؟",o:["لزيادة الوزن","للتخلص من الهيكل الفارغ وتحسين نسبة الكتلة لما تبقى","لتقليل Isp"],a:1,why:"رمي الخزانات الفارغة يجعل كل مرحلة لاحقة تبدأ بكتلة أخف."},
        {q:"إذا تضاعف Isp مع ثبات الكتل، Δv:",o:["يتضاعف","يزيد 41%","لا يتغيّر"],a:0,why:"Δv يتناسب خطياً مع Isp."}],
  ref:"الموضوع المقابل: الدفع ومعادلة الصاروخ (Spacecraft Propulsion — Rocket Equation, Staging)."
});

LESSONS.sse.push({
  ar:"نظام الطاقة: ألواح شمسية وبطاريات", en:"Power subsystem: solar arrays and batteries", alt:"الأرض وظلها والقمر الصناعي يدور فيدخل الظل وتنخفض شحنة البطارية ثم تُشحن في الشمس",
  intro:["معظم الأقمار الصناعية تأخذ طاقتها من ألواح شمسية. لكن في المدار المنخفض يقضي القمر حوالي ثلث وقته في ظل الأرض، فيحتاج بطارية، ويجب أن تكون الألواح كبيرة بما يكفي لتشغيل الحمل وشحن البطارية في الجزء المضيء فقط.",
         "عمق التفريغ (DoD) مهم: البطارية في المدار المنخفض تشحن وتفرغ أكثر من 5000 مرة في السنة، فلا يُسمح بتفريغها كثيراً حتى تعيش."],
  ctl:[{k:"h",ar:"ارتفاع المدار",min:300,max:2000,step:10,v:500,f:v=>nf(v,0)+" km"},{k:"P",ar:"الحمل الكهربائي",min:200,max:5000,step:50,v:1500,f:v=>nf(v,0)+" W"},{k:"dod",ar:"عمق التفريغ المسموح",min:0.15,max:0.6,step:0.01,v:0.3,f:v=>nf(v*100,0)+"%"}],
  init(st){ st.tt=0; st.soc=1; },
  calc(st){ const r=RE+st.h; st.T=2*Math.PI*Math.sqrt(r**3/MU); st.fe=Math.asin(RE/r)/Math.PI; st.Te=st.T*st.fe; st.Td=st.T-st.Te;
    st.Psa=(st.P*st.Te/0.6+st.P*st.Td/0.8)/st.Td; st.A=st.Psa/(0.28*1361*0.85); st.Cb=st.P*st.Te/3600/(st.dod*0.9); },
  step(st,dt){ st.tt+=dt; const ph=((st.tt/10)%1), dark=ph<st.fe/2||ph>1-st.fe/2; const de=st.dod/(st.fe*10), ch=st.dod/((1-st.fe)*10*0.6); st.soc=clamp(st.soc+(dark?-de:ch)*dt,1-st.dod-0.02,1); st.dark=dark; },
  draw(g,W,H,st,C){
    const cx=W*0.36, cy=H*0.5, Re=Math.min(W,H)*0.16, R=Re*(RE+st.h)/RE*1.0+Re*0.25;
    for(let i=0;i<6;i++){ const y=cy-H*0.35+i*H*0.14; larrow(g,W*0.98,y,W*0.82,y,C.fuel,2,8); } ltx(g,"الشمس",W*0.9,H*0.08,{c:C.fuel,s:11,rtl:true});
    g.save(); g.fillStyle=C.ink; g.globalAlpha=0.12; g.fillRect(0,cy-Re,cx,2*Re); g.restore();
    g.save(); g.strokeStyle=C.muted; g.setLineDash([4,4]); g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.stroke(); g.restore();
    earth(g,cx,cy,Re,C);
    const a=((st.tt/10)%1)*Math.PI*2, sx=cx-R*Math.cos(a), sy=cy-R*Math.sin(a);
    g.save(); g.translate(sx,sy); g.fillStyle=C.struct; g.fillRect(-5,-5,10,10); g.fillStyle=st.dark?C.muted:C.ctrl; g.fillRect(-22,-3,14,6); g.fillRect(8,-3,14,6); g.restore();
    ltx(g,st.dark?"في الظل: البطارية تغذي الحمل":"في الشمس: الألواح تغذي وتشحن",cx,H-14,{c:st.dark?C.power:C.hyd,s:12,w:600,rtl:true});
    const bx=W*0.72, by=H*0.3, bw=W*0.08, bh=H*0.45; g.strokeStyle=C.ink; g.lineWidth=2; g.strokeRect(bx,by,bw,bh); g.fillRect(bx+bw*0.3,by-6,bw*0.4,6);
    g.fillStyle=st.soc>0.75?C.hyd:(st.soc>0.5?C.fuel:C.power); g.fillRect(bx+3,by+3+(bh-6)*(1-st.soc),bw-6,(bh-6)*st.soc);
    ltx(g,"شحنة البطارية "+nf(st.soc*100,0)+"%",bx+bw/2,by+bh+16,{s:11,rtl:true});
  },
  ro(st){ return [["دور المدار",nf(st.T/60,1)+" min"],["زمن الظل في كل دورة",nf(st.Te/60,1)+" min ("+nf(st.fe*100,0)+"%)"],["قدرة الألواح المطلوبة",nf(st.Psa,0)+" W"],["مساحة الألواح (بداية العمر)",nf(st.A,1)+" m²"],["سعة البطارية",nf(st.Cb,0)+" Wh"]]; },
  eq:["كسر الظل (أسوأ حالة): f_e = sin⁻¹(R_⊕ / r) / π","P_sa = (P_e T_e / X_e + P_d T_d / X_d) / T_d ,  X_e = 0.6 ، X_d = 0.8","A = P_sa / (η · S · I_d) ,  S = 1361 W/m²","C = P_e T_e / (DoD · η_b)"],
  note:["في المدار الثابت الظل يحدث فقط حول الاعتدالين، ولمدة أقصاها حوالي 72 دقيقة يومياً.","الألواح تضعف مع الزمن بسبب الإشعاع، فتُصمم بمساحة أكبر لتكفي في نهاية العمر.","الحساب هنا لأسوأ حالة حين تكون الشمس في مستوى المدار."],
  quiz:[{q:"لماذا يجب أن تعطي الألواح أكثر من الحمل؟",o:["لأنها تعمل أيضاً على شحن البطارية خلال الجزء المضيء فقط","لأن الحمل يتغيّر","لأن الشمس أبعد"],a:0,why:"الطاقة المستهلكة في الظل يجب تعويضها خلال وقت الإضاءة."},
        {q:"لماذا يكون عمق التفريغ صغيراً في المدار المنخفض؟",o:["لأن الدورات كثيرة جداً وتقصّر عمر البطارية","لأن البطارية صغيرة","لأن الظل قصير"],a:0,why:"آلاف الدورات سنوياً؛ التفريغ العميق يتلف البطارية بسرعة."}],
  ref:"الموضوع المقابل: نظام الطاقة الكهربائية للمركبة (Electrical Power Systems)."
});

LESSONS.sse.push({
  ar:"التوازن الحراري للمركبة", en:"Spacecraft thermal balance", alt:"مكعب في الفضاء تصله أشعة الشمس ويشع حرارة من كل أوجهه، ويتغير لونه حسب درجة حرارته مع اختيار الطلاء",
  intro:["في الفضاء لا يوجد هواء يبرّد المركبة. حرارتها تتحدد بالتوازن: ما تمتصه من الشمس + ما تولّده أجهزتها = ما تشعّه للفضاء. نسبة الامتصاص α ونسبة الإشعاع ε للسطح هما مفتاح التحكم.",
         "الطلاء الأبيض يمتص قليلاً ويشع كثيراً فيبرد، والأسود يسخن، والرقائق الذهبية تعكس الإشعاع وتعزل. جرّب الطلاءات واقترب أو ابتعد عن الشمس."],
  ctl:[{k:"a",ar:"الامتصاص α",min:0.05,max:0.95,step:0.01,v:0.3,f:v=>nf(v,2)},{k:"e",ar:"الإشعاع ε",min:0.03,max:0.95,step:0.01,v:0.8,f:v=>nf(v,2)},{k:"Q",ar:"حرارة الأجهزة الداخلية",min:0,max:2000,step:10,v:300,f:v=>nf(v,0)+" W"},{k:"d",ar:"البعد عن الشمس",min:0.7,max:1.6,step:0.01,v:1,f:v=>nf(v,2)+" AU"}],
  pre:[{ar:"طلاء أبيض",set:{a:0.2,e:0.9}},{ar:"طلاء أسود",set:{a:0.95,e:0.9}},{ar:"رقائق ذهبية",set:{a:0.3,e:0.03}},{ar:"ألمنيوم مصقول",set:{a:0.15,e:0.05}}],
  init(st){ st.sun=[]; st.ir=[]; },
  calc(st){ const S=1361/(st.d*st.d), sig=5.670374e-8; st.S=S; st.Qa=st.a*S*1+st.Q; st.T=Math.pow(st.Qa/(st.e*sig*6),0.25); },
  step(st,dt,W,H){ const cx=W*0.36, cy=H*0.5;
    if(Math.random()<dt*25*st.S/1361) st.sun.push({x:W,y:cy+(Math.random()-0.5)*H*0.3,ab:Math.random()<st.a});
    st.sun.forEach(p=>{ p.x-=dt*W*0.4; if(p.x<cx+H*0.13){ p.dead=true; } }); st.sun=st.sun.filter(p=>!p.dead);
    const rate=st.e*5.670374e-8*6*st.T**4/40; if(Math.random()<dt*rate) { const a=Math.random()*Math.PI*2; st.ir.push({a,r:H*0.14,life:0}); }
    st.ir.forEach(p=>{ p.r+=dt*H*0.2; p.life+=dt; }); st.ir=st.ir.filter(p=>p.life<2); },
  draw(g,W,H,st,C){
    const cx=W*0.36, cy=H*0.5, s=H*0.13, tc=clamp((st.T-150)/250,0,1), col=mixC(C.ctrl,C.power,tc);
    st.sun.forEach(p=>ldot(g,p.x,p.y,2.4,C.fuel,0.9));
    st.ir.forEach(p=>ldot(g,cx+Math.cos(p.a)*p.r,cy+Math.sin(p.a)*p.r,2,C.power,Math.max(0,1-p.life/2)));
    g.fillStyle=col; g.strokeStyle=C.ink; g.lineWidth=1.5; g.fillRect(cx-s,cy-s,2*s,2*s); g.strokeRect(cx-s,cy-s,2*s,2*s);
    g.fillStyle=mixC(col,C.panel,0.3); g.beginPath(); g.moveTo(cx-s,cy-s); g.lineTo(cx-s+s*0.5,cy-s-s*0.4); g.lineTo(cx+s+s*0.5,cy-s-s*0.4); g.lineTo(cx+s,cy-s); g.closePath(); g.fill(); g.stroke();
    g.fillStyle=mixC(col,C.ink,0.25); g.beginPath(); g.moveTo(cx+s,cy-s); g.lineTo(cx+s+s*0.5,cy-s-s*0.4); g.lineTo(cx+s+s*0.5,cy+s-s*0.4); g.lineTo(cx+s,cy+s); g.closePath(); g.fill(); g.stroke();
    ltx(g,"أشعة الشمس",W*0.9,cy-H*0.2,{c:C.fuel,s:11,rtl:true}); ltx(g,"إشعاع حراري",cx-s*2,cy-s*1.6,{c:C.power,s:11,rtl:true});
    const tx=W*0.8, ty=H*0.15, th=H*0.6, Tmin=100, Tmax=450, Ty=T=>ty+th-(clamp(T,Tmin,Tmax)-Tmin)/(Tmax-Tmin)*th;
    g.strokeStyle=C.ink; g.lineWidth=2; g.strokeRect(tx-8,ty,16,th); g.fillStyle=col; g.fillRect(tx-6,Ty(st.T),12,ty+th-Ty(st.T));
    [173,273,373].forEach(T=>{ lline(g,[[tx+10,Ty(T)],[tx+16,Ty(T)]],C.muted,1); ltx(g,nf(T-273,0)+"°C",tx+20,Ty(T),{c:C.muted,s:10,a:"left",m:true}); });
    lline(g,[[tx-14,Ty(273+40)],[tx+14,Ty(273+40)]],C.hyd,1,[3,3]); lline(g,[[tx-14,Ty(273-10)],[tx+14,Ty(273-10)]],C.hyd,1,[3,3]);
    ltx(g,"مدى عمل الإلكترونيات",tx-18,Ty(288),{c:C.hyd,s:10,a:"right",rtl:true});
  },
  ro(st){ return [["درجة الحرارة المتوازنة",nf(st.T,0)+" K ("+nf(st.T-273.15,0)+"°C)"],["القدرة الممتصة + الداخلية",nf(st.Qa,0)+" W"],["الإشعاع الشمسي هنا",nf(st.S,0)+" W/m²"],["α / ε",nf(st.a/st.e,2)]]; },
  eq:["α · S · A_p + Q_int = ε · σ · A_r · T⁴","T = [(α S A_p + Q_int) / (ε σ A_r)]^¼","σ = 5.67×10⁻⁸ W/(m²·K⁴) ,  S = 1361 / d² W/m²"],
  note:["النسبة α/ε هي اللي تحدد الحرارة أكثر من كل واحد منهما.","الرقائق الذهبية والبطانيات متعددة الطبقات (MLI) تعزل الأجهزة عن تقلبات الشمس والظل.","المكعب هنا افتراض: وجه واحد يواجه الشمس، والأوجه الستة تشع؛ بدون الأرض وانعكاسها."],
  quiz:[{q:"أي طلاء يحافظ على المركبة أبرد في الشمس؟",o:["أسود","أبيض (α صغير و ε كبير)","ذهبي"],a:1,why:"يمتص قليلاً ويشع كثيراً، فـ α/ε صغيرة."},
        {q:"إذا تضاعف البعد عن الشمس، الإشعاع الشمسي:",o:["ينقص للنصف","ينقص للربع","لا يتغيّر"],a:1,why:"الشدة تتناسب عكسياً مع مربع البعد."}],
  ref:"الموضوع المقابل: التحكم الحراري للمركبة الفضائية (Thermal Control of Spacecraft)."
});

function attSim(st){ const dt=0.1, out=[]; let th=0,w=0,hw=0; const tg=st.tg*D2R, wn=st.wn, z=st.z, J=st.J, tm=st.tm;
  let peak=0, ptq=0, settle=null;
  for(let t=0;t<=600;t+=dt){ let tq=-J*(2*z*wn*w+wn*wn*(th-tg)); tq=clamp(tq,-tm,tm); w+=tq/J*dt; th+=w*dt; hw-=tq*dt; peak=Math.max(peak,Math.abs(hw)); ptq=Math.max(ptq,Math.abs(tq));
    if(Math.round(t/dt)%5===0) out.push([t,th/D2R,tq,hw]); }
  for(let i=out.length-1;i>=0;i--){ if(Math.abs(out[i][1]-st.tg)>1){ settle=out[i][0]; break; } }
  const mx=Math.max(...out.map(p=>p[1])); return {out,peak,ptq,settle,os:st.tg?Math.max(0,(mx-st.tg)/st.tg*100):0}; }
LESSONS.sse.push({
  ar:"التحكم بالوضع: عجلات الزخم", en:"Attitude control with reaction wheels", alt:"مركبة بألواح شمسية تدور لتتجه نحو هدف، وعجلة داخلها تدور بالعكس، ومنحنى الزاوية مع الزمن",
  intro:["لتوجيه كاميرا أو هوائي، تدير المركبة نفسها بدون وقود باستخدام «عجلات الزخم»: محرك داخلي يدير عجلة ثقيلة في اتجاه، فتدور المركبة في الاتجاه المعاكس (حفظ الزخم الزاوي).",
         "المتحكم هنا من نوع PD: يتناسب العزم مع الخطأ في الزاوية ومع سرعة الدوران. عزم العجلة محدود، فالمناورات الكبيرة تأخذ وقتاً. لاحظ أن زخم العجلة يتراكم؛ إذا وصل حدّه يجب «تفريغه» بمحركات صغيرة أو بعزم مغناطيسي."],
  ctl:[{k:"tg",ar:"زاوية الدوران المطلوبة",min:5,max:180,step:1,v:90,f:v=>nf(v,0)+"°"},{k:"J",ar:"عزم القصور للمركبة",min:50,max:2000,step:10,v:400,f:v=>nf(v,0)+" kg·m²"},{k:"tm",ar:"أقصى عزم للعجلة",min:0.02,max:1,step:0.01,v:0.2,f:v=>nf(v,2)+" N·m"},{k:"wn",ar:"سرعة الاستجابة ω_n",min:0.02,max:0.5,step:0.005,v:0.05,f:v=>nf(v,3)+" rad/s"},{k:"z",ar:"التخميد ζ",min:0.3,max:1.2,step:0.01,v:0.8,f:v=>nf(v,2)}],
  init(st){ st.t0=0; }, onSet(st){ st.t0=st.t; },
  calc(st){ Object.assign(st,attSim(st)); },
  draw(g,W,H,st,C){
    const tau=((st.t-st.t0)*40)%600, i=Math.min(st.out.length-1,Math.round(tau/0.5)), p=st.out[i], cx=W*0.24, cy=H*0.46, s=Math.min(W*0.08,H*0.14);
    lline(g,[[cx,cy],[cx+Math.cos(-st.tg*D2R)*s*3,cy+Math.sin(-st.tg*D2R)*s*3]],C.hyd,1.6,[6,4]); ltx(g,"الهدف",cx+Math.cos(-st.tg*D2R)*s*3.2,cy+Math.sin(-st.tg*D2R)*s*3.2,{c:C.hyd,s:10,rtl:true});
    g.save(); g.translate(cx,cy); g.rotate(-p[1]*D2R); g.fillStyle=mixC(C.panel,C.struct,0.4); g.strokeStyle=C.ink; g.lineWidth=1.5; g.fillRect(-s*0.6,-s*0.6,s*1.2,s*1.2); g.strokeRect(-s*0.6,-s*0.6,s*1.2,s*1.2);
    g.fillStyle=C.ctrl; g.fillRect(-s*2,-s*0.2,s*1.3,s*0.4); g.fillRect(s*0.7,-s*0.2,s*1.3,s*0.4); larrow(g,s*0.6,0,s*1.6,0,C.power,2.5,8);
    g.strokeStyle=C.fuel; g.lineWidth=2; g.beginPath(); g.arc(0,0,s*0.35,0,Math.PI*2); g.stroke(); const wa=p[3]*st.t*3; g.beginPath(); g.moveTo(0,0); g.lineTo(Math.cos(wa)*s*0.35,Math.sin(wa)*s*0.35); g.stroke(); g.restore();
    ltx(g,"زخم العجلة "+nf(p[3],1)+" N·m·s",cx,H*0.85,{c:C.fuel,s:11,rtl:true});
    const r={x:W*0.5,y:24,w:W*0.46,h:H*0.48}, ymax=Math.max(st.tg*1.3,...st.out.map(q=>q[1])), P=lplot(g,r,[0,600],[0,ymax],{xt:[0,200,400,600],xl:"s",yl:"الزاوية (°)",ylr:true});
    lline(g,[[r.x,P.Y(st.tg)],[r.x+r.w,P.Y(st.tg)]],C.hyd,1.2,[5,4]); lline(g,st.out.map(q=>[P.X(q[0]),P.Y(q[1])]),C.accent,2.3); lline(g,[[P.X(tau),r.y],[P.X(tau),r.y+r.h]],C.muted,1,[3,3]);
    const r2={x:W*0.5,y:H*0.66,w:W*0.46,h:H*0.24}, P2=lplot(g,r2,[0,600],[-st.tm*1.1,st.tm*1.1],{xt:[0,300,600],yl:"العزم (N·m)",ylr:true});
    lline(g,[[r2.x,P2.Y(0)],[r2.x+r2.w,P2.Y(0)]],C.line,1); lline(g,st.out.map(q=>[P2.X(q[0]),P2.Y(q[2])]),C.power,1.8);
    ltx(g,"الزمن مسرّع ×40",W-12,r2.y+r2.h+18,{c:C.muted,s:10,a:"right",rtl:true});
  },
  ro(st){ return [["زمن الوصول (±1°)",st.settle!=null?nf(st.settle,0)+" s":"لم يستقر في 600 s"],["تجاوز الهدف",nf(st.os,1)+"%"],["أقصى زخم للعجلة",nf(st.peak,2)+" N·m·s"],["أقصى عزم مستخدم",nf(st.ptq,3)+" N·m"]]; },
  eq:["J θ̈ = τ ,  τ = −J (2ζω_n θ̇ + ω_n² (θ − θ_t)) ,  |τ| ≤ τ_max","h_wheel = −∫ τ dt   (حفظ الزخم الزاوي)","θ̈_max = τ_max / J"],
  note:["المركبة الأثقل (J أكبر) تحتاج وقتاً أطول لنفس العجلة.","عندما يُشبَع عزم العجلة يصبح التحكم «بانغ-بانغ» تقريباً: تسارع أقصى ثم تباطؤ أقصى.","تلسكوب هابل يستخدم عجلات زخم ليوجّه نفسه بدقة عالية جداً بدون وقود."],
  quiz:[{q:"لماذا تدور المركبة عكس اتجاه العجلة؟",o:["بسبب الجاذبية","بسبب حفظ الزخم الزاوي للنظام كله","بسبب الضغط الشمسي"],a:1,why:"لا عزم خارجي، فالزخم الكلي يبقى ثابتاً."},
        {q:"ماذا يحدث إذا تشبعت سرعة العجلة؟",o:["تتحكم أفضل","تفقد قدرتها على إعطاء عزم إضافي بنفس الاتجاه ويجب تفريغ الزخم","تنفجر"],a:1,why:"عند أقصى سرعة لا تستطيع العجلة التسارع أكثر، فنستخدم محركات أو عزم مغناطيسي لتفريغها."}],
  ref:"الموضوع المقابل: التحكم في الوضع والتوجيه (Attitude Control Systems)."
});
