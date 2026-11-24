/* ---------- Book 6: Flight Stability and Automatic Control ---------- */
LESSONS.fsc.push({
  ar:"الاستقرار الاتجاهي: ديك الريح", en:"Directional (weathercock) stability",
  alt:"منظر علوي لطائرة تنحرف عن اتجاه الهواء بعد هبّة ثم يعيدها الذيل العمودي، مع سهم القوة على الذيل ومنحنى زاوية الانزلاق مع الزمن",
  intro:["إذا ضربت هبّة جانبية الطائرة صار الهواء يأتيها بزاوية انزلاق β. الذيل العمودي يعمل كجناح صغير: يولّد قوة جانبية خلف مركز الثقل تدير الأنف نحو الريح، كما يدور ديك الريح.",
         "الجسم الأمامي يعمل عكس ذلك ويزيد الانحراف. لذلك يجب أن تغلب مساهمة الذيل مساهمة الجسم فيكون Cnβ موجباً. وكلما كبر الذيل وطال ذراعه عادت الطائرة أسرع."],
  ctl:[{k:"cv",ar:"معامل حجم الذيل العمودي",min:0.02,max:0.14,step:0.002,v:0.09,f:v=>nf(v,3)},{k:"fus",ar:"تأثير الجسم المزعزع",min:0,max:0.2,step:0.005,v:0.08,f:v=>nf(v,3)},
       {k:"dmp",ar:"التخميد",min:0,max:1,step:0.05,v:0.2,f:v=>nf(v,2)}],
  act:{ar:"هبّة جانبية",fn:st=>{ st.b=0; st.r=0.3; }},
  init(st){ st.b=0; st.r=0.3; st.hist=[]; },
  calc(st){ st.cnb=st.cv*3.0-st.fus; },
  step(st,dt){ const k=st.cnb*14, c=0.25+st.dmp*2.2; st.r+=(-k*st.b-c*st.r)*dt; st.b=clamp(st.b+st.r*dt,-1.2,1.2); if(Math.abs(st.b)>=1.2) st.r=0; st.hist.push(st.b); if(st.hist.length>300) st.hist.shift(); },
  draw(g,W,H,st,C){
    const cx=W*0.26, cy=H*0.52, s=Math.min(W*0.34,H*0.4);
    for(let i=0;i<4;i++){ const y0=H*0.08+i*H*0.2; larrow(g,W*0.035,y0,W*0.035,y0+H*0.12,mixC(C.muted,C.panel,0.3),1.5,6); }
    ltx(g,"الهواء",W*0.035,H*0.94,{c:C.muted,s:10,rtl:true});
    const ang=-Math.PI/2+st.b;
    g.save(); g.translate(cx,cy); g.rotate(ang);
    g.fillStyle=mixC(C.panel,C.struct,0.3); g.strokeStyle=C.ink; g.lineWidth=1.3;
    g.beginPath(); g.moveTo(s*0.06,0); g.lineTo(-s*0.12,-s*0.48); g.lineTo(-s*0.2,-s*0.48); g.lineTo(-s*0.1,0); g.lineTo(-s*0.2,s*0.48); g.lineTo(-s*0.12,s*0.48); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-s*0.38,0); g.lineTo(-s*0.48,-s*0.16); g.lineTo(-s*0.52,-s*0.16); g.lineTo(-s*0.48,0); g.lineTo(-s*0.52,s*0.16); g.lineTo(-s*0.48,s*0.16); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(-s*0.02,0,s*0.52,s*0.055,0,0,Math.PI*2); g.fill(); g.stroke();
    const fl=s*(0.08+st.cv*1.4); g.fillStyle=C.hyd; g.fillRect(-s*0.54,-s*0.012,fl,s*0.024);
    g.restore();
    if(Math.abs(st.b)>0.02&&st.cnb>0){ const tx=cx+Math.cos(ang)*(-s*0.46), ty=cy+Math.sin(ang)*(-s*0.46), dx=-Math.sin(ang)*Math.sign(st.b), dy=Math.cos(ang)*Math.sign(st.b), L=s*0.5*Math.min(1,Math.abs(st.b)*3)*Math.min(1,st.cnb*8);
      larrow(g,tx,ty,tx+dx*L,ty+dy*L,C.ctrl,2.5,8); }
    ltx(g,"β = "+nf(st.b/D2R,1)+"°",cx,H-12,{s:11,m:true});
    const r={x:W*0.54,y:H*0.15,w:W*0.42,h:H*0.62}, P=lplot(g,r,[0,300],[-0.6,0.6],{yt:[-0.5,0,0.5],yf:t=>nf(t/D2R,0)+"°",xl:"الزمن",xlr:true,yl:"β"});
    lline(g,st.hist.map((v,i)=>[P.X(i),P.Y(clamp(v,-0.6,0.6))]),st.cnb>0?C.ctrl:C.power,2);
    ltx(g,st.cnb>0?"مستقرة: تعود نحو الريح":"غير مستقرة: الانحراف يزيد",r.x+r.w,r.y-12,{s:12,w:600,a:"right",rtl:true,c:st.cnb>0?C.ctrl:C.power});
  },
  ro(st){ return [["Cnβ (لكل راديان)",nf(st.cnb,3)],["الحالة",st.cnb>0?"مستقرة اتجاهياً":"غير مستقرة"],["β الآن",nf(st.b/D2R,1)+"°"]]; },
  eq:["Cnβ = Cnβ(الذيل) − Cnβ(الجسم) > 0","Cnβ(الذيل) ≈ η · c_VT · C_Lα,v"],
  note:["في الطائرات ذات المحركين يُحجَّم الذيل العمودي أيضاً ليعادل الانعراج عند تعطل محرك على سرعة منخفضة، وغالباً يكون هذا الشرط هو الأشد.","الأرقام هنا مبسّطة لإظهار الفكرة. اضغط «هبّة جانبية» بعد تغيير المعاملات."],
  quiz:[{q:"الجسم الأمامي للطائرة بالنسبة للاستقرار الاتجاهي:",o:["مثبّت","مزعزع","لا تأثير له"],a:1,why:"القوة الجانبية على الجسم أمام مركز الثقل تدير الأنف بعيداً عن الريح."},
        {q:"لكي تكون الطائرة مستقرة اتجاهياً يجب أن يكون Cnβ:",o:["موجباً","سالباً","صفراً"],a:0,why:"Cnβ موجب يعني أن الانزلاق يولّد عزماً يعيد الأنف نحو الريح."}],
  show:{ar:"اعرض الذيل العمودي والدفة",fn:()=>lrnSel("fin",1)},
  ref:"الموضوع المقابل: الاستقرار الاتجاهي الساكن (Static Directional Stability)."
});
LESSONS.fsc.push({
  ar:"مخمّد الانعراج وتحسين الاستقرار", en:"Yaw damper: stability augmentation",
  alt:"منظر علوي لطائرة تتأرجح يميناً ويساراً (التأرجح الهولندي) مع أثر طرفي الجناح، ومنحنى الانزلاق مع المخمّد وبدونه",
  intro:["التأرجح الهولندي (Dutch roll) حركة جانبية متذبذبة: الطائرة تنعرج وتميل معاً ذهاباً وإياباً. في الطائرات ذات الجناح المائل للخلف يكون تخميده ضعيفاً، خاصة على الارتفاعات العالية حيث الهواء رقيق.",
         "مخمّد الانعراج حاسوب صغير يقيس سرعة الانعراج ويحرّك الدفة قليلاً عكسها، فيضيف تخميداً صناعياً. مع المخمّد يختفي التأرجح خلال دورة أو دورتين بدلاً من عشرات."],
  ctl:[{k:"alt",ar:"الارتفاع",min:0,max:43000,step:500,v:37000,f:v=>nf(v,0)+" ft"},{k:"K",ar:"كسب مخمّد الانعراج",min:0.1,max:1,step:0.05,v:0.6,f:v=>nf(v,2)}],
  tog:[{k:"yd",ar:"مخمّد الانعراج يعمل",v:false}],
  act:{ar:"ضربة دفة",fn:st=>{ st.y=[0.12,0]; st.hist=[]; }},
  init(st){ st.y=[0.12,0]; st.hist=[]; st.tr=[]; },
  calc(st){ st.wn=1.3-0.25*st.alt/43000; st.z0=0.13-0.1*st.alt/43000; st.z=st.z0+(st.yd?0.45*st.K:0); st.T=2*Math.PI/(st.wn*Math.sqrt(Math.max(0.01,1-st.z*st.z))); st.half=Math.log(2)/(st.z*st.wn); },
  step(st,dt){ const h=dt*2.5, w=st.wn, z=st.z, b=st.y[0], bd=st.y[1], a=-w*w*b-2*z*w*bd; st.y=[b+bd*h,bd+a*h]; st.hist.push(st.y[0]); if(st.hist.length>320) st.hist.shift(); st.tr.push(st.y[0]); if(st.tr.length>70) st.tr.shift(); },
  draw(g,W,H,st,C){
    const cx=W*0.24, cy=H*0.4, s=Math.min(W*0.4,H*0.55), b=st.y[0], phi=-st.y[1]/st.wn*1.6;
    st.tr.forEach((q,i)=>{ const age=st.tr.length-i, y=cy+s*0.25+age*2.4, x=cx+Math.sin(q*3)*s*0.06; ldot(g,x-s*0.44,y,1.6,C.hyd,i/st.tr.length); ldot(g,x+s*0.44,y,1.6,C.power,i/st.tr.length); });
    g.save(); g.translate(cx,cy); g.rotate(b*3);
    g.fillStyle=mixC(C.panel,C.struct,0.3); g.strokeStyle=C.ink; g.lineWidth=1.3;
    const ws=s*0.46*Math.cos(clamp(phi,-1,1)*0.7);
    g.beginPath(); g.moveTo(0,-s*0.04); g.lineTo(ws,s*0.14); g.lineTo(ws,s*0.2); g.lineTo(0,s*0.1); g.lineTo(-ws,s*0.2); g.lineTo(-ws,s*0.14); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(0,s*0.36); g.lineTo(s*0.15,s*0.44); g.lineTo(s*0.15,s*0.47); g.lineTo(0,s*0.43); g.lineTo(-s*0.15,s*0.47); g.lineTo(-s*0.15,s*0.44); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(0,s*0.05,s*0.05,s*0.45,0,0,Math.PI*2); g.fill(); g.stroke();
    g.restore();
    const r={x:W*0.52,y:H*0.14,w:W*0.44,h:H*0.62}, P=lplot(g,r,[0,320],[-0.15,0.15],{yt:[-0.1,0,0.1],yf:t=>nf(t/D2R,0)+"°",xl:"الزمن",xlr:true,yl:"β"});
    lline(g,st.hist.map((v,i)=>[P.X(i),P.Y(clamp(v,-0.15,0.15))]),st.yd?C.ctrl:C.power,2);
    ltx(g,st.yd?"المخمّد يعمل":"بدون مخمّد",r.x+r.w,r.y-12,{s:12,w:600,a:"right",rtl:true,c:st.yd?C.ctrl:C.power});
  },
  ro(st){ return [["نسبة التخميد ζ",nf(st.z,3)],["زمن الدورة",nf(st.T,1)+" s"],["زمن نصف السعة",nf(st.half,1)+" s"]]; },
  eq:["β(t) = β₀ e^(−ζω_n t) cos(ω_d t)","ω_d = ω_n √(1 − ζ²)","t½ = ln 2 / (ζ ω_n)"],
  note:["في بعض الطائرات تسمح قائمة المعدات الدنيا (MEL) بالطيران والمخمّد معطل لكن بحدود على الارتفاع.","على الارتفاع العالي تقل كثافة الهواء فتضعف قوى التخميد الطبيعية، لذلك يكون التأرجح أوضح هناك.","الحركة في الرسم مسرّعة 2.5 مرة."],
  quiz:[{q:"مخمّد الانعراج يحرّك:",o:["الجنيحات","الدفة","المصعد"],a:1,why:"يقيس سرعة الانعراج ويحرك الدفة عكسها."},
        {q:"لماذا يكون التأرجح الهولندي أسوأ على الارتفاع العالي؟",o:["الهواء الرقيق يقلل التخميد الطبيعي","المحركات أقوى","الطائرة أثقل"],a:0,why:"قوى التخميد الهوائية تتناسب مع كثافة الهواء."}],
  show:{ar:"اعرض الدفة تتحرك",fn:()=>lrnSel("fin",1)},
  ref:"الموضوع المقابل: تحسين الاستقرار (Stability Augmentation, Yaw Damper)."
});
