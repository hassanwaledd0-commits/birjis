/* ---------- Book 14: Maintenance Engineering and Reliability (3/3): fluids, weighing, repairs, planning ---------- */
/* ---- 19 ---- */
LK("mnt",{
  ar:"تحليل الزيت: مخطط التحكم وكشف الاتجاه", en:"Oil analysis and control charts",
  alt:"نقاط تركيز معدن البلى في عينات الزيت مع الزمن وخط حد التحكم العلوي ونقطة الإنذار، مع عينة زيت فيها جسيمات",
  intro:["يحمل زيت المحرك وصندوق التروس جسيمات معدنية دقيقة من البلى، وتقاس تراكيزها (جزء في المليون ppm) من عينات دورية. القيمة المرجعية تُستنتج من الفترة الأولى المستقرة: متوسط m وانحراف معياري s. حد التحكم العلوي UCL = m + 3s.",
         "الإنذار يصدر حين تتجاوز قراءتان متتاليتان الحد، أو حين يرتفع الاتجاه بوضوح. زيادة بطيئة في التركيز (بلى طبيعي) تختلف عن قفزة مفاجئة تدل على عطل ناشئ في محمل أو تروس. وكلما كان الضجيج أقل قلّ زمن كشف القفزة."],
  ctl:[{k:"mu",ar:"التركيز الأساسي",min:2,max:20,step:0.5,v:6,f:v=>nf(v,1)+" ppm"},{k:"sg",ar:"ضجيج القياس",min:0.3,max:3,step:0.1,v:1,f:v=>nf(v,1)+" ppm"},{k:"dr",ar:"انجراف بطيء",min:0,max:2,step:0.05,v:0.1,f:v=>nf(v,2)+" ppm/100h"},{k:"sp",ar:"حجم القفزة",min:0,max:30,step:0.5,v:8,f:v=>nf(v,1)+" ppm"},{k:"ts",ar:"بدء القفزة",min:200,max:1800,step:50,v:1200,f:v=>nf(v,0)+" h"}],
  pre:[{ar:"بلا عطل",set:{sp:0,dr:0.1}},{ar:"عطل ناشئ سريع",set:{sp:25,ts:900}},{ar:"ضجيج عالٍ",set:{sg:2.5}}],
  calc(st){ const rnd=i=>{ const v=Math.sin(i*12.9898+4.1414)*43758.5453; return (v-Math.floor(v))*2-1; }; st.pts=[]; for(let i=0;i<=40;i++){ const t=i*50, v=st.mu+st.dr*t/100+(t>st.ts?st.sp*(1-Math.exp(-(t-st.ts)/150)):0)+st.sg*1.7*rnd(i+1); st.pts.push([t,Math.max(0,v)]); } const b=st.pts.slice(0,9).map(p=>p[1]); st.m=b.reduce((a,c)=>a+c,0)/b.length; st.s=Math.sqrt(b.reduce((a,c)=>a+(c-st.m)**2,0)/(b.length-1)); st.ucl=st.m+3*Math.max(st.s,0.2); st.al=null; for(let i=9;i<st.pts.length-1;i++){ if(st.pts[i][1]>st.ucl&&st.pts[i+1][1]>st.ucl){ st.al=st.pts[i+1][0]; break; } } st.dl=st.al!=null&&st.sp>0?st.al-st.ts:null; st.pf=t=>st.mu+st.dr*t/100; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.14, x1=r.x+r.w*0.86, y0=r.y+r.h*0.3, H=r.h*0.4; g.fillStyle=mixC(C.panel,C.fuel,0.35); g.fillRect(x0,y0,x1-x0,H); g.strokeStyle=C.ink; g.lineWidth=1.4; g.strokeRect(x0,y0,x1-x0,H); const tm=(st.t*160)%2000, v=st.pts[Math.min(40,Math.floor(tm/50))][1], n=Math.round(clamp(v*3,2,120));
    for(let i=0;i<n;i++){ const x=x0+6+((i*61+st.t*14)%(x1-x0-12)), y=y0+8+((i*37)%Math.round(H-16)); ldot(g,x,y,1.6+(i%3)*0.6,C.ink,0.75); } ltx(g,"عينة عند "+nf(tm,0)+" h : "+nf(v,1)+" ppm",r.x+r.w*0.5,r.y+r.h*0.14,{s:14,w:700,rtl:true,c:v>st.ucl?C.power:C.ink}); kBar(g,x0,r.y+r.h*0.8,x1-x0,10,v/Math.max(st.ucl*2,1),v>st.ucl?"power":"hyd",C,"حد التحكم "+nf(st.ucl,1)+" ppm");
    ltx(g,st.al!=null?"الإنذار عند "+nf(st.al,0)+" h"+(st.dl!=null?" (بعد "+nf(st.dl,0)+" h من بدء القفزة)":""):"لا إنذار",r.x+r.w*0.5,r.y+r.h*0.93,{s:13,w:700,rtl:true,c:st.al!=null?C.power:C.hyd}); },
  plot(st){ return {x:[0,2000],y:[0,Math.max(st.ucl*1.3,Math.max(...st.pts.map(p=>p[1]))*1.1)],xl:"ساعات التشغيل",yl:"ppm",lines:[{pts:st.pts,c:"hyd",w:1.8}],hl:[{y:st.ucl,c:"power",t:"UCL"},{y:st.m,c:"muted",t:"المتوسط"}],vl:st.sp>0?[{x:st.ts,c:"muted",t:"القفزة"}]:[],dots:st.al!=null?[{x:st.al,y:st.pts[Math.round(st.al/50)][1],c:"power"}]:[]}; },
  ro(st){ return [["المتوسط المرجعي",nf(st.m,2)+" ppm"],["الانحراف s",nf(st.s,2)],["حد التحكم UCL",nf(st.ucl,2)+" ppm"],["ساعة الإنذار",st.al!=null?nf(st.al,0)+" h":"لا إنذار"],["زمن الكشف بعد القفزة",st.dl!=null?nf(st.dl,0)+" h":"—"]]; },
  eq:["UCL = m + 3 s","إنذار: قراءتان متتاليتان > UCL","m وs من فترة الأساس (أول 400 h)"],
  note:["بيانات الضجيج ثابتة لكل إعداد حتى تتكرر النتيجة. في الواقع تُحلَّل عدة معادن معاً (حديد ونحاس وفضة وغيرها) لتحديد المصدر.","حدود الإنذار الفعلية تحددها شركة المحرك لكل معدن وطراز، وتُستخدم المخططات لتنبيه المهندس لا لاتخاذ قرار منفرد."],
  quiz:[{q:"ما فائدة حد التحكم 3s؟",o:["تمييز القفزة الحقيقية عن التذبذب العشوائي","زيادة الضجيج","لا فائدة"],a:0,why:"أغلب التذبذب العشوائي يبقى دونه."},
        {q:"ضجيج قياس أكبر يجعل كشف القفزة:",o:["أبطأ","أسرع","كما هو"],a:0,why:"UCL ترتفع وتحتاج قفزة أكبر."}],
  show:{ar:"اعرض صندوق التروس",fn:()=>lrnSel("eng_gearbox")},
  ref:"الموضوع: تحليل الزيوت ومراقبة الحالة (Oil Analysis)."
});
/* ---- 20 ---- */
LK("mnt",{
  ar:"وزن الطائرة ومركز الثقل من خلايا الأحمال", en:"Aircraft weighing and centre of gravity",
  alt:"طائرة على ثلاث خلايا أحمال تحت العجلة الأمامية والعجلتين الرئيسيتين مع حساب مركز الثقل نسبة لوتر الجناح، ومنحنى مركز الثقل مع حمل العجلة الأمامية",
  intro:["لمعرفة الوزن الفارغ ومركز الثقل تُوزَن الطائرة على ثلاث نقاط (العجلة الأمامية والعجلتان الرئيسيتان) بجهاز خلايا أحمال أو بمنصات. الوزن الكلي W = W_أمامي + W_يسار + W_يمين. وعزم الأحمال حول العجلة الأمامية يعطي موضع مركز الثقل: x_cg = (W_يسار + W_يمين)· L / W حيث L المسافة بين العجلة الأمامية والرئيسية.",
         "يحول x_cg إلى نسبة من الوتر الهوائي الوسطي MAC: CG% = (x_cg − x_LEMAC) / MAC. ويجب أن تقع في حدود دليل الوزن والتوازن. فرق الأحمال بين الرئيسيتين يدل على ميل جانبي أو خطأ قراءة. تتم الوزنة داخل حظيرة مغلقة، والطائرة مستوية، وبوضع السوائل المحدد."],
  ctl:[{k:"wn",ar:"حمل العجلة الأمامية",min:2,max:40,step:0.1,v:6.5,f:v=>nf(v,1)+" t"},{k:"wl",ar:"حمل الرئيسية اليسرى",min:10,max:250,step:0.5,v:29,f:v=>nf(v,1)+" t"},{k:"wr",ar:"حمل الرئيسية اليمنى",min:10,max:250,step:0.5,v:29.5,f:v=>nf(v,1)+" t"},{k:"L",ar:"المسافة بين الأمامية والرئيسية",min:8,max:35,step:0.1,v:15.6,f:v=>nf(v,1)+" m"},{k:"le",ar:"بداية الوتر الوسطي من الأنف",min:8,max:40,step:0.1,v:13.3,f:v=>nf(v,1)+" m"},{k:"mc",ar:"طول الوتر الوسطي MAC",min:3,max:13,step:0.05,v:3.96,f:v=>nf(v,2)+" m"}],
  pre:[{ar:"طائرة ممرّ واحد",set:{wn:6.5,wl:29,wr:29.5,L:15.6,le:13.3,mc:3.96}},{ar:"حمل أمامي مرتفع",set:{wn:10}}],
  calc(st){ st.W=st.wn+st.wl+st.wr; st.x=(st.wl+st.wr)*st.L/st.W; st.cg=(st.x-st.le)/st.mc*100; st.im=(st.wl-st.wr)/st.W*100; st.cgf=w=>{ const m=st.W-w; return ((m*st.L/st.W)-st.le)/st.mc*100; }; st.lo=12; st.hi=32; st.ok=st.cg>=st.lo&&st.cg<=st.hi; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, y=r.y+r.h*0.4, s=Math.min(r.w*0.7,r.h*1.2); lplane(g,cx,y,s,0,C); const nx=cx-s*0.36, mx=cx+s*0.0; [[nx,st.wn,"أمامية"],[mx,st.wl+st.wr,"رئيسية"]].forEach(([x,w,t])=>{ const L=clamp(w/st.W*s*0.16+8,8,s*0.2); larrow(g,x,y+s*0.18+L,x,y+s*0.1,C.hyd,2.4,8); ltx(g,t+" "+nf(w,1)+" t",x,y+s*0.18+L+14,{s:11,rtl:true}); });
    const cgx=nx+st.x/st.L*(mx-nx); ldot(g,cgx,y+s*0.05,6,C.power); ltx(g,"مركز الثقل",cgx,y-s*0.12,{s:11,w:700,rtl:true,c:C.power}); const bx=r.x+r.w*0.12, bw=r.w*0.76, by=r.y+r.h*0.78; g.fillStyle=mixC(C.panel,C.hyd,0.2); g.fillRect(bx+bw*st.lo/50,by,bw*(st.hi-st.lo)/50,14); g.strokeStyle=C.ink; g.strokeRect(bx,by,bw,14); ldot(g,bx+bw*clamp(st.cg,0,50)/50,by+7,6,st.ok?C.hyd:C.power); ltx(g,"MAC% "+nf(st.cg,1),bx+bw*clamp(st.cg,0,50)/50,by-10,{s:12,w:700,m:true});
    ltx(g,"الوزن الكلي "+nf(st.W,1)+" t  ·  x = "+nf(st.x,2)+" m من الأنف",r.x+r.w*0.5,r.y+r.h*0.08,{s:13,w:700,rtl:true}); ltx(g,(st.ok?"داخل":"خارج")+" الحدود المثال ("+st.lo+"–"+st.hi+" %)  ·  فرق الرئيسيتين "+nf(st.im,1)+" %",r.x+r.w*0.5,r.y+r.h*0.94,{s:12,rtl:true,c:st.ok?C.muted:C.power}); },
  plot(st){ return {x:[2,16],y:[-10,60],xl:"حمل العجلة الأمامية t",yl:"MAC %",curves:[{f:st.cgf,c:"hyd"}],hband:[{y0:st.lo,y1:st.hi,c:"hyd",a:0.14}],dots:[{x:st.wn,y:st.cg,c:st.ok?"hyd":"power"}]}; },
  ro(st){ return [["الوزن الكلي",nf(st.W,2)+" t"],["بعد مركز الثقل عن الأنف",nf(st.x,2)+" m"],["مركز الثقل % MAC",nf(st.cg,1)+" %"],["فرق الرئيسيتين",nf(st.im,2)+" %"],["الحالة",st.ok?"ضمن الحدود المثال":"خارج الحدود المثال"]]; },
  eq:["W = W_N + W_L + W_R","x_cg = (W_L + W_R) L / W","CG% = (x_cg − x_LEMAC) / MAC × 100"],
  note:["الحدود 12–32% أمثلة للرسم فقط، والحدود الفعلية في دليل الطائرة وتتغير مع الوزن. الوزنة تتطلب تصحيح الصفر وأوزان الرافعات والسوائل.","فرق كبير بين الرئيسيتين يستدعي فحص مستوى الطائرة وخلايا الأحمال."],
  quiz:[{q:"زيادة حمل العجلة الأمامية مع ثبات الوزن الكلي تجعل مركز الثقل:",o:["أكثر تقدماً","أكثر تأخراً","كما هو"],a:0,why:"يقترب من العجلة الأمامية."},
        {q:"ماذا نحتاج لتحويل x_cg إلى % MAC؟",o:["موضع بداية الوتر وطوله","الارتفاع","السرعة"],a:0,why:"(x − LEMAC) / MAC."}],
  show:{ar:"اعرض جهاز الهبوط الأمامي",fn:()=>lrnSel("gear_nose")},
  ref:"الموضوع: الوزن والتوازن بالوزن الفعلي (Weighing and Balance)."
});
/* ---- 21 ---- */
LK("mnt",{
  ar:"إصلاح المركّبات: نسبة الوصلة المشطوفة", en:"Composite scarf repair and bond shear",
  alt:"لوح مركّب فيه رقعة مشطوفة بنسبة ميل، ومنحنى إجهاد القص في طبقة اللصق مع نسبة الشطف",
  intro:["في إصلاح الألياف الكربونية تُزال المنطقة التالفة بقطع مائل (scarf) ثم تُلصق رقعة مماثلة بنفس الميل. حين يعمل اللوح بإجهاد σ، تتوزع القوة على سطح اللصق المائل بزاوية θ: إجهاد القص τ = σ sin θ cos θ والعمودي σ_n = σ sin² θ، حيث tan θ = 1/n لنسبة شطف 1:n.",
         "كلما كبرت n (أشد تدرجاً) قلّ إجهاد القص على اللاصق، لكن المنطقة المزالة أكبر (الطول = n × السماكة لكل جانب). تُختار نسبة شائعة 1:20 إلى 1:30 بحسب الاعتبارات الهيكلية. وإن كان القص يتجاوز مقاومة اللاصق فالإصلاح غير مقبول بتلك النسبة."],
  ctl:[{k:"n",ar:"نسبة الشطف 1 : n",min:5,max:60,step:1,v:20,f:v=>"1 : "+nf(v,0)},{k:"sg",ar:"إجهاد اللوح",min:50,max:600,step:10,v:300,f:v=>nf(v,0)+" MPa"},{k:"ta",ar:"مقاومة قص اللاصق",min:15,max:40,step:1,v:25,f:v=>nf(v,0)+" MPa"},{k:"tk",ar:"سماكة اللوح",min:1,max:10,step:0.5,v:3,f:v=>nf(v,1)+" mm"}],
  pre:[{ar:"شطف حاد",set:{n:8}},{ar:"شطف متدرج",set:{n:40}}],
  calc(st){ st.th=Math.atan(1/st.n); st.tau=st.sg*Math.sin(st.th)*Math.cos(st.th); st.sn=st.sg*Math.sin(st.th)**2; st.L=st.n*st.tk; st.ratio=st.tau/st.ta; st.ok=st.ratio<=1; const s=st.ta/st.sg; st.nmin=s>=0.5?1:1/Math.tan(Math.asin(2*s)/2); st.tf=n=>{ const t=Math.atan(1/n); return st.sg*Math.sin(t)*Math.cos(t); }; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.1, x1=r.x+r.w*0.9, y=r.y+r.h*0.44, H=Math.max(18,st.tk*7), len=Math.min((x1-x0)*0.45,st.L*6); g.fillStyle=mixC(C.panel,C.struct,0.5); g.strokeStyle=C.ink; g.lineWidth=1.4; const cx=(x0+x1)/2; g.beginPath(); g.moveTo(x0,y); g.lineTo(cx-len/2,y); g.lineTo(cx+len/2,y+H); g.lineTo(x0,y+H); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.moveTo(x1,y); g.lineTo(cx-len/2,y); g.lineTo(cx+len/2,y+H); g.lineTo(x1,y+H); g.closePath(); g.fillStyle=mixC(C.panel,C.ctrl,0.5); g.fill(); g.stroke();
    lline(g,[[cx-len/2,y],[cx+len/2,y+H]],st.ok?C.hyd:C.power,3.4); larrow(g,x0-4,y+H/2,x0+30,y+H/2,C.power,2.6,9); larrow(g,x1+4,y+H/2,x1-30,y+H/2,C.power,2.6,9); ltx(g,"الشطف 1 : "+nf(st.n,0)+"  ·  θ = "+nf(st.th/D2R,2)+"°",r.x+r.w*0.5,r.y+r.h*0.14,{s:13,w:700,rtl:true}); ltx(g,"طول الشطف لكل جانب "+nf(st.L,0)+" mm",cx,y+H+24,{s:12,rtl:true,c:C.muted});
    ltx(g,"τ = "+nf(st.tau,1)+" MPa  مقابل "+nf(st.ta,0)+" MPa",r.x+r.w*0.5,r.y+r.h*0.78,{s:14,w:700,m:true,c:st.ok?C.hyd:C.power}); ltx(g,st.ok?"اللاصق يتحمل":"اللاصق لا يتحمل: خفّف الشطف إلى 1 : "+nf(Math.ceil(st.nmin),0),r.x+r.w*0.5,r.y+r.h*0.9,{s:13,w:700,rtl:true,c:st.ok?C.hyd:C.power}); },
  plot(st){ return {x:[5,60],y:[0,Math.max(st.tf(5),st.ta*1.2)],xl:"n",yl:"إجهاد القص MPa",curves:[{f:st.tf,c:"hyd"}],hl:[{y:st.ta,c:"power",t:"مقاومة اللاصق"}],dots:[{x:st.n,y:st.tau,c:st.ok?"hyd":"power"}]}; },
  ro(st){ return [["زاوية الشطف",nf(st.th/D2R,2)+"°"],["إجهاد القص",nf(st.tau,1)+" MPa"],["الإجهاد العمودي",nf(st.sn,1)+" MPa"],["نسبة للمقاومة",nf(st.ratio*100,0)+" %"],["أقل n مقبولة",nf(Math.ceil(st.nmin),0)]]; },
  eq:["tan θ = 1 / n","τ = σ sin θ cos θ","σ_n = σ sin² θ","الطول = n × t"],
  note:["نموذج مبسط لوصلة لاصقة تحت إجهاد منتظم. وصلات المركّبات الحقيقية تحتاج تحليلاً للتدرج والإجهاد التقشيري، وتُنفَّذ وفق دليل الإصلاح المعتمد.","الإصلاح يتطلب عملية معالجة (cure) بحرارة وضغط مضبوطين وفحصاً بعدها بالموجات فوق الصوتية."],
  quiz:[{q:"شطف أكثر تدرجاً (n أكبر) يعطي إجهاد قص:",o:["أقل","أكبر","كما هو"],a:0,why:"sin θ cos θ ≈ 1/n."},
        {q:"ما ثمن زيادة n؟",o:["منطقة إزالة وإصلاح أكبر","اللاصق أضعف","لا ثمن"],a:0,why:"الطول = n × السماكة."}],
  ref:"الموضوع: إصلاح المركّبات (Composite Repair)."
});
/* ---- 22 ---- */
LK("mnt",{
  ar:"معالجة مانع التسرب: أثر الحرارة على زمن التصلب", en:"Sealant cure time versus temperature",
  alt:"خط من مانع التسرب على وصلة يتصلب مع الزمن، ومنحنى زمن التصلب مع الحرارة",
  intro:["مانع التسرب يتصلب بتفاعل كيميائي يتسارع مع الحرارة. قاعدة عامة: يتضاعف معدل التفاعل لكل ارتفاع 10 °C تقريباً (Q₁₀ ≈ 2). فإذا كان زمن زوال اللزوجة السطحية عند 25 °C هو t₂₅ فإن t(T) = t₂₅ · Q^((25 − T)/10).",
         "في الورشة الباردة يطول الانتظار كثيراً، وفي الحارة يقصر ويقل زمن العمل المتاح قبل أن يتصلب المانع. لذلك تُسجَّل حرارة الورشة وتُتبع جداول المصنّع للمنتج المحدد. التسريع بالتسخين يجب أن يكون ضمن الحدود المعتمدة وإلا تفسد الخواص."],
  ctl:[{k:"T",ar:"الحرارة",min:0,max:50,step:1,v:15,f:v=>nf(v,0)+" °C"},{k:"t25",ar:"زمن التصلب السطحي عند 25 °C",min:2,max:48,step:1,v:12,f:v=>nf(v,0)+" h"},{k:"Q",ar:"عامل Q₁₀",min:1.5,max:3,step:0.1,v:2,f:v=>nf(v,1)},{k:"kf",ar:"نسبة التصلب الكامل إلى السطحي",min:3,max:10,step:0.5,v:6,f:v=>nf(v,1)+" ×"}],
  pre:[{ar:"ورشة باردة",set:{T:5}},{ar:"يوم حار",set:{T:38}}],
  calc(st){ st.tt=T=>st.t25*Math.pow(st.Q,(25-T)/10); st.ts=st.tt(st.T); st.tfull=st.ts*st.kf; st.fct=st.ts/st.t25; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.12, x1=r.x+r.w*0.88, y=r.y+r.h*0.48, T=st.tfull*1.15, tm=(st.t*0.6)%1*T, pr=clamp(tm/st.ts,0,1), pf=clamp(tm/st.tfull,0,1); g.fillStyle=mixC(C.panel,C.struct,0.5); g.fillRect(x0,y,x1-x0,16); g.strokeStyle=C.ink; g.lineWidth=1.3; g.strokeRect(x0,y,x1-x0,16); g.fillStyle=mixC(C.panel,C.ctrl,0.3+0.5*pf); g.beginPath(); g.moveTo(x0+30,y); g.quadraticCurveTo((x0+x1)/2,y-48+pf*20,x1-30,y); g.closePath(); g.fill(); g.stroke(); ltx(g,"مانع التسرب",(x0+x1)/2,y-58,{s:11,rtl:true});
    kBar(g,x0,r.y+r.h*0.72,x1-x0,10,pr,"hyd",C,"تصلب سطحي "+nf(pr*100,0)+" %"); kBar(g,x0,r.y+r.h*0.82,x1-x0,10,pf,"ctrl",C,"تصلب كامل "+nf(pf*100,0)+" %"); ltx(g,"بعد "+nf(tm,1)+" h",r.x+r.w*0.5,r.y+r.h*0.08,{s:14,w:700,rtl:true}); ltx(g,"سطحي "+nf(st.ts,1)+" h  ·  كامل "+nf(st.tfull,0)+" h",r.x+r.w*0.5,r.y+r.h*0.93,{s:13,w:700,rtl:true}); },
  plot(st){ return {x:[0,50],y:[1,400],log:true,xl:"الحرارة °C",yl:"الزمن h",curves:[{f:st.tt,c:"hyd"},{f:T=>st.tt(T)*st.kf,c:"ctrl",dash:[4,3]}],leg:[{c:"hyd",t:"سطحي"},{c:"ctrl",t:"كامل",dash:[4,3]}],dots:[{x:st.T,y:st.ts,c:"power"}]}; },
  ro(st){ return [["زمن التصلب السطحي",nf(st.ts,1)+" h"],["التصلب الكامل",nf(st.tfull,0)+" h"],["نسبة لزمن 25 °C",nf(st.fct,2)+" ×"]]; },
  eq:["t(T) = t₂₅ · Q^((25 − T)/10)","t_كامل = k · t_سطحي"],
  note:["المعادلة تقريب لقاعدة Q₁₀، ولا تغني عن ورقة بيانات المنتج التي تعطي زمن العمل وزمن التصلب وحدود الحرارة والرطوبة.","بعض المواد تعتمد في تصلبها على رطوبة الجو أيضاً."],
  quiz:[{q:"انخفاض الحرارة 10 °C مع Q = 2 يجعل زمن التصلب:",o:["الضعف","النصف","نفسه"],a:0,why:"t ∝ Q^(−ΔT/10)."},
        {q:"لماذا لا نتجاوز حدود التسخين المعتمدة؟",o:["حتى لا تفسد خواص المانع","للتوفير","لا سبب"],a:0,why:"التسخين الزائد يغير الكيمياء."}],
  show:{ar:"اعرض خزان الوقود الداخلي",fn:()=>lrnSel("fuel")},
  ref:"الموضوع: موانع التسرب وعمليات المعالجة (Sealing and Curing)."
});
/* ---- 23 ---- */
LK("mnt",{
  ar:"وزن الطلاء: كم وقوداً يكلّف؟", en:"Paint weight and its fuel cost",
  alt:"طبقات الطلاء على سطح الطائرة بسماكة محددة وكتلة الطلاء الكلية، ومنحنى الوقود السنوي الإضافي مع سماكة الطلاء",
  intro:["الطلاء يضيف وزناً: الكتلة m = مساحة الجلد × سماكة الطلاء الجاف × كثافته. طائرة ممرّ واحد بسطح 900 m² وسماكة 100 µm وكثافة 1.4 g/cm³ تحمل نحو 126 كغم من الطلاء. لا يبدو كثيراً لكنه يُحمل في كل رحلة.",
         "الوزن الإضافي يحرق وقوداً إضافياً بنسبة تقارب 3–4% من وزنه لكل ساعة طيران. وعلى ساعات التشغيل في السنة يصبح الأثر آلاف الكيلوغرامات وتكلفة وانبعاثات. لذلك تهتم الشركات بتخفيف طبقات الطلاء أو اختيار مواد أخف، دون المساس بالحماية من التآكل."],
  ctl:[{k:"A",ar:"مساحة الطلاء",min:200,max:3500,step:50,v:900,f:v=>nf(v,0)+" m²"},{k:"dft",ar:"سماكة الطلاء الجاف",min:30,max:250,step:5,v:100,f:v=>nf(v,0)+" µm"},{k:"rho",ar:"الكثافة",min:1.1,max:1.9,step:0.05,v:1.4,f:v=>nf(v,2)+" g/cm³"},{k:"hr",ar:"ساعات الطيران سنوياً",min:500,max:5000,step:100,v:3000,f:v=>nf(v,0)+" h"},{k:"fb",ar:"استهلاك الوزن الإضافي",min:2,max:5,step:0.1,v:3.5,f:v=>nf(v,1)+" %/h"},{k:"pr",ar:"سعر الوقود",min:0.4,max:1.5,step:0.05,v:0.8,f:v=>nf(v,2)+" /kg"}],
  pre:[{ar:"طلاء رقيق",set:{dft:60}},{ar:"طلاء سميك",set:{dft:180}}],
  calc(st){ st.m=st.A*st.dft*1e-6*st.rho*1000; st.ff=d=>st.A*d*1e-6*st.rho*1000*st.fb/100*st.hr; st.fy=st.ff(st.dft); st.cost=st.fy*st.pr; st.co2=st.fy*3.16; st.sv=st.ff(st.dft)-st.ff(Math.max(30,st.dft-30)); },
  scene(g,r,st,C){ const x0=r.x+r.w*0.12, w=r.w*0.34, y=r.y+r.h*0.2, H=r.h*0.52; const layers=[["أرضية",0.3,"hyd"],["طبقة الحماية",0.5,"ctrl"],["اللون",0.2,"power"]]; let yy=y+H; g.strokeStyle=C.ink; g.lineWidth=1.3; g.fillStyle=mixC(C.panel,C.struct,0.55); g.fillRect(x0,y+H,w,12); g.strokeRect(x0,y+H,w,12); ltx(g,"جلد",x0+w/2,y+H+26,{s:11,rtl:true});
    const scale=H/250; layers.forEach(([t,f,c])=>{ const h=st.dft*f*scale; yy-=h; g.fillStyle=mixC(C.panel,KC(c,C),0.65); g.fillRect(x0,yy+H-H,w,h); }); yy=y+H; layers.forEach(([t,f,c])=>{ const h=st.dft*f*scale; yy-=h; g.fillStyle=mixC(C.panel,KC(c,C),0.65); g.fillRect(x0,yy,w,h); g.strokeRect(x0,yy,w,h); if(h>12) ltx(g,t,x0+w/2,yy+h/2,{s:10,rtl:true}); }); ltx(g,nf(st.dft,0)+" µm",x0-8,y+H-st.dft*scale/2,{s:11,m:true,a:"right"});
    const bx=r.x+r.w*0.58, bw=r.w*0.3, mx=Math.max(st.m,50)*1.2, bh=H*st.m/mx; g.fillStyle=mixC(C.panel,C.power,0.6); g.fillRect(bx,y+H-bh,bw,bh); g.strokeRect(bx,y+H-bh,bw,bh); ltx(g,nf(st.m,0)+" kg",bx+bw/2,y+H-bh-12,{s:14,w:700,m:true}); ltx(g,"كتلة الطلاء",bx+bw/2,y+H+16,{s:11,rtl:true});
    ltx(g,"وقود إضافي "+nf(st.fy/1000,1)+" t سنوياً  ·  كلفة "+nf(st.cost,0)+"  ·  CO₂ "+nf(st.co2/1000,0)+" t",r.x+r.w*0.5,r.y+r.h*0.07,{s:13,w:700,rtl:true}); ltx(g,"تخفيف 30 µm يوفر "+nf(st.sv,0)+" kg وقود سنوياً",r.x+r.w*0.5,r.y+r.h*0.93,{s:12,rtl:true,c:C.muted}); },
  plot(st){ return {x:[30,250],y:[0,st.ff(250)/1000*1.05],xl:"سماكة الطلاء µm",yl:"الوقود الإضافي t/سنة",curves:[{f:d=>st.ff(d)/1000,c:"power"}],dots:[{x:st.dft,y:st.fy/1000,c:"ink"}]}; },
  ro(st){ return [["كتلة الطلاء",nf(st.m,0)+" kg"],["وقود إضافي سنوياً",nf(st.fy,0)+" kg"],["الكلفة السنوية",nf(st.cost,0)],["CO₂ سنوياً",nf(st.co2/1000,1)+" t"],["أثر تخفيف 30 µm",nf(st.sv,0)+" kg"]]; },
  eq:["m = A · t · ρ","وقود إضافي = m · ك_احتراق · ساعات","CO₂ ≈ 3.16 × الوقود"],
  note:["الأرقام تقريبية ومبسطة: توزيع السماكة غير منتظم، وطبقات الطلاء تختلف بحسب النظام. سماكة الطلاء المعتمدة تُحدد في دليل التشطيب لحماية السطح.","الأثر يصبح أكبر في الطائرات الكبيرة ذات الأسطح الواسعة."],
  quiz:[{q:"ضعف سماكة الطلاء يضاعف كتلته:",o:["نعم تقريباً","لا يتغير","أربع مرات"],a:0,why:"m ∝ t."},
        {q:"لماذا يهم 126 kg رغم صغره؟",o:["لأنه يُحمل في كل رحلة ويكلّف وقوداً","لأنه ثقيل جداً","لا يهم"],a:0,why:"الأثر تراكمي."}],
  ref:"الموضوع: كفاءة الوزن والتشطيب (Paint Weight)."
});
/* ---- 24 ---- */
LK("mnt",{
  ar:"تقدير التسرب الهيدروليكي من هبوط الضغط", en:"Hydraulic leak rate from pressure decay",
  alt:"نظام هيدروليكي مغلق يهبط ضغطه مع الزمن ومقياس ضغط، ومنحنى معدل التسرب مع هبوط الضغط",
  intro:["إذا عُزل نظام هيدروليكي وهبط ضغطه خلال مدة، يمكن تقدير حجم السائل الذي تسرب: السائل شبه غير قابل للانضغاط، فهبوط الضغط Δp مع حجم V يعني فقد حجم ΔV = V · Δp / B حيث B معامل الانضغاط الحجمي للسائل (نحو 1500 MPa).",
         "وجود هواء محبوس يخفض B الفعلي: 1/B_eff = 1/B + α/p حيث α نسبة الحجم الهوائي، فيعطي الهواء قراءة تسرب أكبر لنفس الهبوط. يقارن الفني معدل التسرب (mL/min) بحدود دليل الصيانة، ويحدد مصدره بعزل أجزاء النظام. نقطة كل ثانية من التسرب تعادل نحو 3 لتر في اليوم."],
  ctl:[{k:"V",ar:"حجم النظام",min:5,max:200,step:1,v:40,f:v=>nf(v,0)+" L"},{k:"dp",ar:"هبوط الضغط",min:0.5,max:50,step:0.5,v:8,f:v=>nf(v,1)+" bar"},{k:"dt",ar:"المدة",min:1,max:60,step:1,v:10,f:v=>nf(v,0)+" min"},{k:"p0",ar:"ضغط النظام",min:100,max:350,step:5,v:207,f:v=>nf(v,0)+" bar"},{k:"B",ar:"معامل الانضغاط",min:1000,max:2000,step:50,v:1500,f:v=>nf(v,0)+" MPa"},{k:"al",ar:"هواء محبوس",min:0,max:2,step:0.05,v:0.2,f:v=>nf(v,2)+" %"}],
  pre:[{ar:"بلا هواء",set:{al:0}},{ar:"هواء محبوس 1%",set:{al:1}}],
  calc(st){ const pm=st.p0/10; st.Be=1/(1/st.B+st.al/100/pm); st.dv=ddp=>st.V*1000*(ddp/10)/st.Be; st.dV=st.dv(st.dp); st.q=st.dV/st.dt; st.drops=st.q/0.05; st.day=st.q*1440/1000; st.qf=ddp=>st.dv(ddp)/st.dt; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.3, cy=r.y+r.h*0.48, R=Math.min(r.w*0.2,r.h*0.32), tm=(st.t*0.4)%1, p=st.p0-st.dp*tm; kGauge(g,cx,cy,R,p,0,400,C,{step:50,labels:true,label:"bar",val:nf(p,0)+" bar"}); const bx=r.x+r.w*0.58, bw=r.w*0.34, by=r.y+r.h*0.3, bh=r.h*0.3; g.fillStyle=mixC(C.panel,C.hyd,0.4); g.fillRect(bx,by,bw,bh); g.strokeStyle=C.ink; g.lineWidth=1.4; g.strokeRect(bx,by,bw,bh); ltx(g,nf(st.V,0)+" L",bx+bw/2,by+bh/2,{s:14,w:700,m:true});
    const dd=Math.round(clamp(st.drops/10,0,6)); for(let i=0;i<Math.max(1,dd);i++){ const f=(st.t*1.2+i/6)%1; ldot(g,bx+bw*0.25+i*14,by+bh+6+f*34,3,C.hyd,1-f); } ltx(g,"تسرب "+nf(st.q,2)+" mL/min",r.x+r.w*0.5,r.y+r.h*0.1,{s:15,w:700,rtl:true}); ltx(g,"فقد "+nf(st.dV,0)+" mL في "+nf(st.dt,0)+" min  ·  نحو "+nf(st.drops,0)+" نقطة/min  ·  "+nf(st.day,1)+" L/يوم",r.x+r.w*0.5,r.y+r.h*0.9,{s:12,rtl:true,c:C.muted}); },
  plot(st){ return {x:[0.5,50],y:[0,Math.max(1,st.qf(50))*1.05],xl:"هبوط الضغط bar",yl:"التسرب mL/min",curves:[{f:st.qf,c:"hyd"}],dots:[{x:st.dp,y:st.q,c:"power"}]}; },
  ro(st){ return [["B الفعلي",nf(st.Be,0)+" MPa"],["حجم التسرب",nf(st.dV,1)+" mL"],["معدل التسرب",nf(st.q,2)+" mL/min"],["نقاط في الدقيقة",nf(st.drops,0)],["باليوم",nf(st.day,1)+" L"]]; },
  eq:["ΔV = V Δp / B_eff","1/B_eff = 1/B + α / p","التسرب = ΔV / Δt"],
  note:["الهواء المحبوس والتمدد الحراري للسائل يعطيان هبوط ضغط ظاهري دون تسرب حقيقي؛ لذلك تُجرى القياسات بعد استقرار الحرارة وتفريغ الهواء.","نقطة السائل تساوي نحو 0.05 mL تقريباً؛ الرقم تقريبي لتقدير الحجم."],
  quiz:[{q:"هواء محبوس أكثر يجعل التسرب المقدّر:",o:["أكبر لنفس الهبوط","أقل","كما هو"],a:0,why:"B_eff أقل."},
        {q:"ما أثر مضاعفة حجم النظام مع نفس الهبوط؟",o:["يتضاعف حجم التسرب","ينصف","لا يتغير"],a:0,why:"ΔV ∝ V."}],
  show:{ar:"اعرض خزان الهيدروليك",fn:()=>lrnSel("hyd_reservoir")},
  ref:"الموضوع: اختبار الأنظمة الهيدروليكية (Hydraulic System Testing)."
});
/* ---- 25 ---- */
LK("mnt",{
  ar:"نمو الحفر التآكلية: كم بقي من العمر؟", en:"Corrosion pit growth and remaining life",
  alt:"مقطع في جلد معدني فيه حفرة تآكل تتعمق مع الزمن، ومنحنى عمق الحفرة مع الزمن مع نقطتي قياس وحد القبول",
  intro:["عمق الحفر التآكلية لا ينمو خطياً بل يتباطأ غالباً مع تكوّن نواتج التآكل: d = k tⁿ مع n أقل من 1 في كثير من الحالات. بقياسين لعمق الحفرة d₁ عند t₁ وd₂ عند t₂ نقدّر n = ln(d₂/d₁)/ln(t₂/t₁) وk = d₁ / t₁ⁿ.",
         "ثم نتنبأ بالزمن الذي يبلغ عنده العمق حد القبول d_lim: t_lim = (d_lim / k)^(1/n). يفيد هذا في جدولة الإصلاح قبل أن تتجاوز الحفرة الحد المسموح من سماكة الجلد. التقدير غير مضمون، لذلك يُكرَّر القياس ويُراعى هامش أمان وتتم إزالة التآكل وحماية السطح عند اللزوم."],
  ctl:[{k:"d1",ar:"العمق الأول",min:0.02,max:0.5,step:0.01,v:0.15,f:v=>nf(v,2)+" mm"},{k:"t1",ar:"عند السنة",min:0.5,max:10,step:0.5,v:2,f:v=>nf(v,1)},{k:"d2",ar:"العمق الثاني",min:0.03,max:1,step:0.01,v:0.27,f:v=>nf(v,2)+" mm"},{k:"t2",ar:"عند السنة",min:1,max:20,step:0.5,v:5,f:v=>nf(v,1)},{k:"dl",ar:"حد القبول",min:0.2,max:1.5,step:0.05,v:0.6,f:v=>nf(v,2)+" mm"}],
  pre:[{ar:"نمو متباطئ",set:{d1:0.15,t1:2,d2:0.24,t2:6}},{ar:"نمو متسارع",set:{d1:0.1,t1:2,d2:0.35,t2:5}}],
  calc(st){ const d2=Math.max(st.d2,st.d1*1.01), t2=Math.max(st.t2,st.t1*1.1); st.n=Math.log(d2/st.d1)/Math.log(t2/st.t1); st.k=st.d1/Math.pow(st.t1,st.n); st.df=t=>st.k*Math.pow(t,st.n); st.tl=Math.pow(st.dl/st.k,1/st.n); st.rem=st.tl-t2; st.t2c=t2; st.d2c=d2; st.ok=st.rem>2; },
  scene(g,r,st,C){ const x0=r.x+r.w*0.18, w=r.w*0.64, y=r.y+r.h*0.24, H=r.h*0.4, T=Math.min(30,Math.max(st.tl*1.1,st.t2c*1.5)), tm=(st.t*1.2)%T, d=st.df(tm), sc=H/Math.max(st.dl*1.6,0.1); g.fillStyle=mixC(C.panel,C.struct,0.5); g.fillRect(x0,y,w,H); g.strokeStyle=C.ink; g.lineWidth=1.4; g.strokeRect(x0,y,w,H);
    g.fillStyle=mixC(C.panel,C.power,0.6); g.beginPath(); g.moveTo(x0+w*0.4,y); g.quadraticCurveTo(x0+w*0.5,y+Math.min(H,d*sc)*1.3,x0+w*0.6,y); g.closePath(); g.fill(); lline(g,[[x0,y+st.dl*sc],[x0+w,y+st.dl*sc]],C.power,1.6,[6,3]); ltx(g,"حد القبول "+nf(st.dl,2)+" mm",x0+w-4,y+st.dl*sc-8,{s:11,rtl:true,a:"right",c:C.power}); ltx(g,"بعد "+nf(tm,1)+" سنة: "+nf(d,2)+" mm",r.x+r.w*0.5,r.y+r.h*0.1,{s:14,w:700,rtl:true});
    ltx(g,"d = "+nf(st.k,3)+" · t^"+nf(st.n,2),r.x+r.w*0.5,r.y+r.h*0.74,{s:13,m:true,w:600}); ltx(g,"يبلغ الحد بعد "+(isFinite(st.tl)?nf(st.tl,1):"—")+" سنة؛ المتبقي "+(isFinite(st.rem)?nf(st.rem,1):"—")+" سنة",r.x+r.w*0.5,r.y+r.h*0.88,{s:14,w:700,rtl:true,c:st.ok?C.hyd:C.power}); },
  plot(st){ const T=Math.min(40,Math.max(10,st.tl*1.2)); return {x:[0,T],y:[0,Math.max(st.dl*1.3,0.3)],xl:"الزمن سنة",yl:"عمق الحفرة mm",curves:[{f:st.df,c:"hyd"}],hl:[{y:st.dl,c:"power",t:"الحد"}],dots:[{x:st.t1,y:st.d1,c:"ink"},{x:st.t2c,y:st.d2c,c:"ink"}].concat(isFinite(st.tl)&&st.tl<T?[{x:st.tl,y:st.dl,c:"power"}]:[])}; },
  ro(st){ return [["الأس n",nf(st.n,2)],["المعامل k",nf(st.k,3)],["زمن بلوغ الحد",isFinite(st.tl)?nf(st.tl,1)+" سنة":"—"],["المتبقي من آخر قياس",isFinite(st.rem)?nf(st.rem,1)+" سنة":"—"],["النمط",st.n<0.95?"متباطئ":st.n>1.05?"متسارع":"خطي"]]; },
  eq:["d = k tⁿ","n = ln(d₂/d₁) / ln(t₂/t₁)","t_lim = (d_lim / k)^(1/n)"],
  note:["نموذج قانون القوة يصلح لنمو الحفرة الواحدة في ظروف ثابتة؛ البيئة المتغيرة وتجديد الطلاء تغيران المعدل. يستخدم المهندس هامش أمان وقياساً مدعوماً بفحص.","حدود القبول وإجراءات الإصلاح من دليل الإصلاح الهيكلي لكل جزء."],
  quiz:[{q:"إذا كانت n أقل من 1 فالنمو:",o:["يتباطأ مع الزمن","يتسارع","ثابت"],a:0,why:"d ∝ tⁿ."},
        {q:"كلما زاد حد القبول فالزمن المتاح:",o:["أطول","أقصر","كما هو"],a:0,why:"t_lim يزداد مع d_lim."}],
  ref:"الموضوع: مراقبة التآكل وجدولة الإصلاح (Corrosion Monitoring)."
});
/* ---- 26 ---- */
LK("mnt",{
  ar:"احتمال الكشف وفترات الفحص", en:"Probability of detection and inspection intervals",
  alt:"شق ينمو أسّياً مع الرحلات ونقاط فحص عليها احتمال الكشف، ومنحنى احتمال الكشف الكلي مع فاصل الفحص",
  intro:["لا يكشف الفحص كل الشقوق: احتمال الكشف POD يزداد مع حجم الشق a: POD(a) = 1 / (1 + (a₅₀/a)^s) حيث a₅₀ الحجم الذي يُكشف باحتمال 50% وs ميل المنحنى. الشقوق الصغيرة قد تفوت في فحص واحد.",
         "الشق ينمو أسّياً تقريباً: a(t) = a₀ e^(t/τ) حتى الطول الحرج a_c. ولذلك نفحص مرات متعددة قبل بلوغه، فاحتمال أن نفوته كلها = Π(1 − POD(a_i)). تقليل الفاصل يزيد فرص الكشف لكن يزيد التكلفة؛ وتحسين طريقة الفحص (a₅₀ أصغر) يعطي فائدة مماثلة."],
  ctl:[{k:"a0",ar:"طول الشق الأولي",min:0.3,max:3,step:0.1,v:1,f:v=>nf(v,1)+" mm"},{k:"ac",ar:"الطول الحرج",min:10,max:60,step:1,v:15,f:v=>nf(v,0)+" mm"},{k:"tau",ar:"ثابت النمو",min:1500,max:20000,step:100,v:5000,f:v=>nf(v,0)+" رحلة"},{k:"I",ar:"فاصل الفحص",min:500,max:15000,step:100,v:4500,f:v=>nf(v,0)+" رحلة"},{k:"a50",ar:"a₅₀",min:0.5,max:10,step:0.1,v:5,f:v=>nf(v,1)+" mm"},{k:"s",ar:"ميل POD",min:2,max:10,step:0.5,v:4,f:v=>nf(v,1)}],
  pre:[{ar:"فحص متباعد",set:{I:9000}},{ar:"طريقة أدق",set:{a50:2}}],
  calc(st){ st.pod=a=>1/(1+Math.pow(st.a50/a,st.s)); st.tc=st.tau*Math.log(st.ac/st.a0); const detect=I=>{ let miss=1; for(let t=I;t<st.tc;t+=I){ const a=st.a0*Math.exp(t/st.tau); miss*=1-st.pod(a); } return 1-miss; }; st.pdf=detect; st.insp=[]; for(let t=st.I;t<st.tc;t+=st.I) st.insp.push([t,st.a0*Math.exp(t/st.tau)]); st.P=detect(st.I); st.n=st.insp.length; st.af=t=>st.a0*Math.exp(t/st.tau); },
  scene(g,r,st,C){ const x0=r.x+r.w*0.1, x1=r.x+r.w*0.92, y0=r.y+r.h*0.16, H=r.h*0.6, X=t=>x0+(x1-x0)*t/st.tc, Y=a=>y0+H-H*Math.log(a/st.a0+0.0001+1)/Math.log(st.ac/st.a0+1); lline(g,[[x0,y0+H],[x1,y0+H]],C.ink,1.4); const pts=[]; for(let t=0;t<=st.tc;t+=st.tc/80) pts.push([X(t),Y(st.af(t))]); lline(g,pts,C.hyd,2.4); lline(g,[[x0,Y(st.ac)],[x1,Y(st.ac)]],C.power,1.4,[6,3]); ltx(g,"الطول الحرج",x0+4,Y(st.ac)-9,{s:11,rtl:true,a:"left",c:C.power});
    st.insp.forEach(([t,a],i)=>{ const p=st.pod(a); ldot(g,X(t),Y(a),6,mixC(C.panel,p>0.5?C.hyd:C.power,0.95)); ltx(g,nf(p*100,0)+"%",X(t),Y(a)-12,{s:10,m:true,w:700}); lline(g,[[X(t),y0+H],[X(t),Y(a)]],C.line,0.8,[2,3]); }); ltx(g,"احتمال كشف الشق قبل الحرج "+nf(st.P*100,1)+" %",r.x+r.w*0.5,r.y+r.h*0.07,{s:14,w:700,rtl:true,c:st.P<0.9?C.power:C.ink}); ltx(g,nf(st.n,0)+" فحوصات  ·  الزمن إلى الحرج "+nf(st.tc,0)+" رحلة",r.x+r.w*0.5,r.y+r.h*0.92,{s:12,rtl:true,c:C.muted}); },
  plot(st){ return {x:[500,Math.max(1500,st.tc)],y:[0,1.02],xl:"فاصل الفحص (رحلة)",yl:"احتمال الكشف",curves:[{f:st.pdf,c:"hyd",n:300}],hl:[{y:0.9,c:"power",t:"90 %"}],dots:[{x:st.I,y:st.P,c:"power"}]}; },
  ro(st){ return [["الزمن إلى الطول الحرج",nf(st.tc,0)+" رحلة"],["عدد الفحوصات",nf(st.n,0)],["احتمال الكشف",nf(st.P*100,1)+" %"],["احتمال الفوات",nf((1-st.P)*100,2)+" %"],["POD عند الطول الحرج",nf(st.pod(st.ac)*100,0)+" %"]]; },
  eq:["POD(a) = 1 / (1 + (a₅₀/a)^s)","a(t) = a₀ e^(t/τ)","P_كشف = 1 − Π (1 − POD(a_i))"],
  note:["المنحنى مسنّن لأن موضع الفحص الأخير قبل الطول الحرج يتغير مع الفاصل، فقد يقع فحص متأخر فيرفع الاحتمال فجأة. النموذج يفترض استقلال الفحوص، وهو متفائل لأن العيب نفسه قد يفوت بالطريقة نفسها كل مرة. تُدمج في الحسابات الفعلية عوامل السلامة.","فواصل الفحص المعتمدة تأتي من برنامج السلامة الهيكلية وتعتمد على بيانات النمو والتحقق التجريبي."],
  quiz:[{q:"تقصير الفاصل يرفع احتمال الكشف لأن:",o:["عدد الفحوصات يزداد","الشق يتوقف","POD تنخفض"],a:0,why:"فرص أكثر لكشف الشق."},
        {q:"أيهما أنفع: تحسين a₅₀ أم إضافة فحص؟",o:["كلاهما يرفع الاحتمال","لا شيء","تحسين a₅₀ فقط يضر"],a:0,why:"يرفع POD أو يزيد الفحوص."}],
  ref:"الموضوع: الفحص غير المتلف وفترات التفتيش (NDT Reliability and Inspection Intervals)."
});
/* ---- 27 ---- */
LK("mnt",{
  ar:"قطع الغيار: مستوى المخزون واحتمال النفاد", en:"Spares provisioning with Poisson demand",
  alt:"رف قطع غيار بعدد معين ونقاط طلب تصل عشوائياً، ومنحنى مستوى الخدمة مع كمية المخزون",
  intro:["الطلب على قطعة غيار يأتي عشوائياً بمعدل λ في السنة. أثناء زمن التوريد L (حتى تصل القطعة المطلوبة) يكون متوسط الطلب μ = λ L / 365. توزيع بواسون يعطي احتمال أن يكون الطلب k: P(k) = e^(−μ) μᵏ / k!.",
         "مستوى الخدمة = احتمال ألا ينفد المخزون خلال زمن التوريد = P(D ≤ s) مجموع الاحتمالات حتى المخزون s. لبلوغ 95% أو 99% نختار أقل s يحققها. الزيادة الأولى في المخزون ترفع الاحتمال كثيراً، ثم تتباطأ؛ ولذلك توازن الشركات بين تكلفة القطعة وكلفة تعطل الطائرة (AOG)."],
  ctl:[{k:"lam",ar:"معدل الطلب",min:0.5,max:30,step:0.5,v:6,f:v=>nf(v,1)+" /سنة"},{k:"Ld",ar:"زمن التوريد",min:5,max:180,step:5,v:45,f:v=>nf(v,0)+" يوم"},{k:"s",ar:"المخزون",min:0,max:20,step:1,v:2,f:v=>nf(v,0)}],
  pre:[{ar:"قطعة نادرة بتوريد طويل",set:{lam:2,Ld:150,s:1}},{ar:"قطعة شائعة",set:{lam:24,Ld:30,s:3}}],
  calc(st){ st.mu=st.lam*st.Ld/365; st.pk=k=>Math.exp(-st.mu)*Math.pow(st.mu,k)/mnGam(k+1); st.cdf=s=>{ let a=0; for(let k=0;k<=Math.floor(s);k++) a+=st.pk(k); return Math.min(1,a); }; st.sl=st.cdf(st.s); st.eb=(()=>{ let e=0; for(let k=Math.floor(st.s)+1;k<60;k++) e+=(k-st.s)*st.pk(k); return e; })(); st.s95=(()=>{ for(let k=0;k<=40;k++) if(st.cdf(k)>=0.95) return k; return 40; })(); st.s99=(()=>{ for(let k=0;k<=40;k++) if(st.cdf(k)>=0.99) return k; return 40; })(); },
  scene(g,r,st,C){ const x0=r.x+r.w*0.1, x1=r.x+r.w*0.9, y=r.y+r.h*0.42, bw=Math.min(40,(x1-x0)/Math.max(8,st.s+1)-8); g.strokeStyle=C.ink; g.lineWidth=1.6; lline(g,[[x0,y+bw+8],[x1,y+bw+8]],C.ink,2); for(let i=0;i<st.s;i++){ const x=x0+i*(bw+8); g.fillStyle=mixC(C.panel,C.hyd,0.6); g.fillRect(x,y,bw,bw); g.strokeRect(x,y,bw,bw); } ltx(g,"المخزون "+nf(st.s,0)+" قطعة",(x0+x1)/2,y-26,{s:13,w:700,rtl:true});
    const ph=(st.t*0.8)%1; for(let i=0;i<Math.round(clamp(st.mu*2,1,6));i++){ const f=(ph+i/6)%1, x=x0+(x1-x0)*f; ldot(g,x,y+bw+34,4,C.power,0.5+0.5*Math.sin(f*Math.PI)); } ltx(g,"طلبات خلال التوريد: متوسط "+nf(st.mu,2),r.x+r.w*0.5,r.y+r.h*0.74,{s:12,rtl:true,c:C.muted});
    ltx(g,"مستوى الخدمة "+nf(st.sl*100,1)+" %",r.x+r.w*0.5,r.y+r.h*0.1,{s:16,w:700,rtl:true,c:st.sl<0.9?C.power:C.hyd}); ltx(g,"للوصول 95%: "+nf(st.s95,0)+" قطعة  ·  99%: "+nf(st.s99,0)+"  ·  نقص متوقع "+nf(st.eb,2),r.x+r.w*0.5,r.y+r.h*0.92,{s:12,w:600,rtl:true}); },
  plot(st){ const X=Math.max(8,st.s99+4), pts=[]; for(let k=0;k<=X;k++) pts.push([k,st.cdf(k)]); return {x:[0,X],y:[0,1.02],xl:"المخزون s",yl:"مستوى الخدمة",lines:[{pts,c:"hyd",w:2.4}],hl:[{y:0.95,c:"power",t:"95 %"},{y:0.99,c:"muted",t:"99 %"}],dots:[{x:st.s,y:st.sl,c:"power"}]}; },
  ro(st){ return [["متوسط الطلب خلال التوريد",nf(st.mu,2)],["مستوى الخدمة",nf(st.sl*100,1)+" %"],["النقص المتوقع",nf(st.eb,3)],["أقل مخزون لـ95%",nf(st.s95,0)],["أقل مخزون لـ99%",nf(st.s99,0)]]; },
  eq:["μ = λ L / 365","P(D = k) = e^(−μ) μᵏ / k!","مستوى الخدمة = Σ_{k=0}^{s} P(D = k)"],
  note:["النموذج يفترض طلباً مستقلاً ومعدلاً ثابتاً؛ في الأسطول الحقيقي ترتبط الأعطال بعمر الأسطول وبعمليات الإصلاح (مخزون الصالح للإصلاح).","كلفة نفاد قطعة حرجة (طائرة متوقفة) تفوق كلفة احتفاظ قطعة إضافية، فيُختار مستوى خدمة عالٍ للأجزاء الحيوية."],
  quiz:[{q:"زيادة زمن التوريد مع نفس الطلب تحتاج مخزوناً:",o:["أكبر","أقل","نفسه"],a:0,why:"μ يزداد."},
        {q:"إضافة قطعة إلى مخزون صغير ترفع مستوى الخدمة:",o:["كثيراً في البداية","لا ترفعه","تخفضه"],a:0,why:"CDF شديد الانحدار عند s صغيرة."}],
  ref:"الموضوع: تخطيط قطع الغيار (Spares Provisioning)."
});
/* header lesson count, run after every lesson file has registered */
try{ const n=Object.values(LESSONS).reduce((a,l)=>a+l.length,0), el=document.querySelector(".brand .sub"); if(el) el.textContent=el.textContent.replace(/\d+\s*درساً من \d+ كتاباً?/,n+" درساً من "+Object.keys(LESSONS).length+" كتاباً"); }catch(e){}
