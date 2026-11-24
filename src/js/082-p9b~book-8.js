/* ---------- Book 8: Fundamentals of Astrodynamics — 10 more lessons ---------- */
const J2=1.08263e-3;
function orbXYZ(a,e,i,O,w,nu){ const r=a*(1-e*e)/(1+e*Math.cos(nu)), u=w+nu, cO=Math.cos(O), sO=Math.sin(O), ci=Math.cos(i), si=Math.sin(i);
  return [r*(cO*Math.cos(u)-sO*Math.sin(u)*ci), r*(sO*Math.cos(u)+cO*Math.sin(u)*ci), r*Math.sin(u)*si]; }
function proj3(p,az,el){ const X=p[0]*Math.cos(az)-p[1]*Math.sin(az), Y=p[0]*Math.sin(az)+p[1]*Math.cos(az); return [X,-(p[2]*Math.cos(el)+Y*Math.sin(el)),Y*Math.cos(el)-p[2]*Math.sin(el)]; }
const nu2M=(nu,e)=>{ const E=2*Math.atan(Math.sqrt((1-e)/(1+e))*Math.tan(nu/2)); return ((E-e*Math.sin(E))%(2*Math.PI)+2*Math.PI)%(2*Math.PI); };
const M2nu=(M,e)=>{ const E=kepE(((M%(2*Math.PI))+2*Math.PI)%(2*Math.PI),e); return 2*Math.atan2(Math.sqrt(1+e)*Math.sin(E/2),Math.sqrt(1-e)*Math.cos(E/2)); };
LK("ast",{
  ar:"عناصر المدار الستة في الفضاء", en:"Classical orbital elements in 3D",
  alt:"الأرض ومستوى خط الاستواء ومدار مائل في منظور ثلاثي الأبعاد، مع خط العقد ونقطة الحضيض وقمر صناعي يتحرك",
  intro:["ستة أرقام تكفي لوصف أي مدار: نصف المحور الكبير (الحجم)، والاختلاف المركزي (الاستطالة)، والميل (زاوية المستوى مع خط الاستواء)، وطول العقدة الصاعدة Ω (أين يعبر المدار خط الاستواء صاعداً)، وحجة الحضيض ω (أين أقرب نقطة)، وأخيراً موضع القمر على المدار.",
         "غيّر الزوايا وشاهد: الميل يقلب المستوى، وΩ يديره حول محور الأرض، وω يدير الشكل البيضاوي داخل مستواه. ميل أكبر من 90° يعني أن القمر يدور عكس دوران الأرض."],
  ctl:[{k:"i",ar:"الميل i",min:0,max:180,step:0.5,v:51.6,f:v=>nf(v,1)+"°"},{k:"O",ar:"العقدة الصاعدة Ω",min:0,max:360,step:1,v:40,f:v=>nf(v,0)+"°"},{k:"w",ar:"حجة الحضيض ω",min:0,max:360,step:1,v:60,f:v=>nf(v,0)+"°"},{k:"e",ar:"الاختلاف المركزي e",min:0,max:0.8,step:0.01,v:0.3,f:v=>nf(v,2)}],
  pre:[{ar:"المحطة الفضائية",set:{i:51.6,e:0.001}},{ar:"قطبي",set:{i:98,e:0.001}},{ar:"مولنيا",set:{i:63.4,e:0.74,w:270}},{ar:"استوائي",set:{i:0.5,e:0.2}}],
  calc(st){ st.a=12000; st.rp=st.a*(1-st.e)-RE; st.ra=st.a*(1+st.e)-RE; st.T=2*Math.PI*Math.sqrt(st.a**3/MU)/3600; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.52, s=Math.min(r.w,r.h)*0.42/(st.a*(1+st.e)), az=-0.6, el=0.42, P=p=>{ const q=proj3(p,az,el); return [cx+q[0]*s,cy+q[1]*s,q[2]]; };
    const eq=[]; for(let k=0;k<=72;k++){ const t=k/72*Math.PI*2; eq.push(P([Math.cos(t)*st.a*1.15,Math.sin(t)*st.a*1.15,0])); } lline(g,eq,C.line,1,[3,3]);
    const orb=[]; for(let k=0;k<=180;k++) orb.push(P(orbXYZ(st.a,st.e,st.i*D2R,st.O*D2R,st.w*D2R,k/180*Math.PI*2)));
    const back=orb.map(q=>q[2]>0); for(let k=0;k<orb.length-1;k++) if(back[k]) lline(g,[orb[k],orb[k+1]],mixC(C.panel,C.power,0.45),1.5,[3,3]);
    earth(g,cx,cy,RE*s,C); for(let k=0;k<orb.length-1;k++) if(!back[k]) lline(g,[orb[k],orb[k+1]],C.power,2.2);
    const n1=P([Math.cos(st.O*D2R)*st.a*1.15,Math.sin(st.O*D2R)*st.a*1.15,0]), n2=P([-Math.cos(st.O*D2R)*st.a*1.15,-Math.sin(st.O*D2R)*st.a*1.15,0]); lline(g,[n1,n2],C.fuel,1.5,[6,3]); ldot(g,n1[0],n1[1],4,C.fuel); ltx(g,"☊",n1[0]+8,n1[1],{c:C.fuel,s:13});
    const pe=P(orbXYZ(st.a,st.e,st.i*D2R,st.O*D2R,st.w*D2R,0)); ldot(g,pe[0],pe[1],4,C.ctrl); ltx(g,"الحضيض",pe[0]+8,pe[1]-8,{c:C.ctrl,s:10,a:"left",rtl:true});
    const nu=M2nu(st.t*0.6,st.e), sp=P(orbXYZ(st.a,st.e,st.i*D2R,st.O*D2R,st.w*D2R,nu)); ldot(g,sp[0],sp[1],5,C.ink);
    const np=P([0,0,RE*1.5]); lline(g,[[cx,cy],np],C.muted,1.2); ltx(g,"N",np[0],np[1]-8,{c:C.muted,s:10,m:true}); },
  ro(st){ return [["ارتفاع الحضيض / الأوج",nf(st.rp,0)+" / "+nf(st.ra,0)+" km"],["الدور",nf(st.T,2)+" h"],["الاتجاه",st.i<90?"مع دوران الأرض":st.i>90?"عكس دوران الأرض":"قطبي تماماً"]]; },
  eq:["a, e: الحجم والشكل","i, Ω: اتجاه مستوى المدار","ω: اتجاه الحضيض داخل المستوى ، ν: موضع القمر"],
  note:["نصف المحور الكبير هنا ثابت 12000 كم لتوضيح الزوايا فقط.","الخط البرتقالي المتقطع هو خط العقد: تقاطع مستوى المدار مع مستوى خط الاستواء."],
  quiz:[{q:"أي عنصر يحدد زاوية مستوى المدار مع خط الاستواء؟",o:["Ω","i","ω"],a:1,why:"الميل i."},
        {q:"قمر بميل 98°:",o:["يدور مع دوران الأرض","يدور قليلاً عكس دورانها ويمر قرب القطبين","استوائي"],a:1,why:"الميل أكبر من 90° قليلاً."}],
  ref:"الموضوع المقابل: عناصر المدار الكلاسيكية (Classical Orbital Elements)."
});
LK("ast",{
  ar:"معادلة كبلر وزمن الطيران", en:"Kepler's equation and time of flight",
  alt:"مدار بيضوي مع قطاع مظلل بين موضعين للقمر يمثل الزمن، ومنحنى الزاوية الحقيقية مع الزمن يظهر السرعة الكبيرة قرب الحضيض",
  intro:["القمر في مدار بيضوي يسرع قرب الحضيض ويبطئ قرب الأوج، فالزاوية لا تتغير بانتظام مع الزمن. معادلة كبلر M = E − e sin E تربط الزمن (الشذوذ المتوسط M) بالموضع على المدار.",
         "المساحة المظللة بين موضعين تتناسب مع الزمن بينهما (قانون كبلر الثاني). لذلك يمر القمر بالحضيض سريعاً جداً ويقضي معظم وقته بعيداً."],
  ctl:[{k:"e",ar:"الاختلاف المركزي",min:0,max:0.9,step:0.01,v:0.6,f:v=>nf(v,2)},{k:"n1",ar:"الموضع الأول ν₁",min:0,max:359,step:1,v:330,f:v=>nf(v,0)+"°"},{k:"n2",ar:"الموضع الثاني ν₂",min:0,max:359,step:1,v:60,f:v=>nf(v,0)+"°"}],
  calc(st){ st.a=20000; st.T=2*Math.PI*Math.sqrt(st.a**3/MU); const M1=nu2M(st.n1*D2R,st.e), M2=nu2M(st.n2*D2R,st.e); st.fr=(((M2-M1)/(2*Math.PI))%1+1)%1; st.dt=st.fr*st.T; },
  scene(g,r,st,C){ const a=st.a, e=st.e, b=a*Math.sqrt(1-e*e), s=Math.min(r.w*0.45/a,r.h*0.45/b), fx=r.x+r.w*0.5+a*e*s, cy=r.y+r.h*0.5, P=nu=>{ const rr=a*(1-e*e)/(1+e*Math.cos(nu)); return [fx+rr*Math.cos(nu)*s,cy-rr*Math.sin(nu)*s]; };
    const o=[]; for(let k=0;k<=120;k++) o.push(P(k/120*Math.PI*2)); lline(g,o,C.line,1.5);
    let n1=st.n1*D2R, n2=st.n2*D2R; if(n2<n1) n2+=Math.PI*2; g.fillStyle=mixC(C.panel,C.ctrl,0.25); g.beginPath(); g.moveTo(fx,cy); for(let k=0;k<=60;k++){ const q=P(n1+(n2-n1)*k/60); g.lineTo(q[0],q[1]); } g.closePath(); g.fill();
    earth(g,fx,cy,Math.max(5,RE*s),C); const q1=P(n1), q2=P(n2); ldot(g,q1[0],q1[1],4,C.muted); ldot(g,q2[0],q2[1],4,C.muted); ltx(g,"1",q1[0]+8,q1[1],{s:11,m:true}); ltx(g,"2",q2[0]+8,q2[1],{s:11,m:true});
    const nu=M2nu(st.t*0.8,e), sp=P(nu); ldot(g,sp[0],sp[1],5,C.power); },
  plot(st){ const pts=[]; for(let k=0;k<=200;k++){ const f=k/200, nu=M2nu(f*2*Math.PI,st.e)/D2R; pts.push([f,(nu+360)%360]); } const t1=nu2M(st.n1*D2R,st.e)/(2*Math.PI), t2=nu2M(st.n2*D2R,st.e)/(2*Math.PI);
    return {x:[0,1],y:[0,360],yt:[0,90,180,270,360],xl:"الزمن ÷ الدور",yl:"ν (°)",dots:[{x:t1,y:st.n1,c:"muted",t:"1"},{x:t2,y:st.n2,c:"ctrl",t:"2"}],lines:[{pts:pts.filter((p,i)=>i===0||Math.abs(p[1]-pts[i-1][1])<180),c:"hyd"}]}; },
  ro(st){ return [["الزمن من 1 إلى 2",st.dt>7200?nf(st.dt/3600,2)+" h":nf(st.dt/60,1)+" min"],["نسبة من الدور",nf(st.fr*100,1)+"%"],["الدور الكامل",nf(st.T/3600,2)+" h"]]; },
  eq:["tan(E/2) = √((1−e)/(1+e)) tan(ν/2)","M = E − e sin E","Δt = (M₂ − M₁) / n ، n = √(μ/a³)"],
  note:["نصف المحور الكبير ثابت 20000 كم.","مع e = 0 تتطابق الزاوية مع الزمن تماماً (حركة منتظمة)."],
  quiz:[{q:"أين يتحرك القمر أسرع؟",o:["قرب الأوج","قرب الحضيض","بنفس السرعة"],a:1,why:"قانون المساحات المتساوية."},
        {q:"معادلة كبلر تُحل عادة:",o:["مباشرة بصيغة بسيطة","بالتكرار (نيوتن مثلاً)","لا حل لها"],a:1,why:"لا يوجد حل مغلق لـ E بدلالة M."}],
  ref:"الموضوع المقابل: الموضع كدالة في الزمن (Kepler's Equation)."
});
LK("ast",{
  ar:"القمر الثابت: التغطية وزاوية الارتفاع", en:"Geostationary coverage and elevation angle",
  alt:"الأرض كما تُرى من قمر ثابت مع دائرة التغطية لأدنى زاوية ارتفاع ومحطة أرضية، ومنحنى زاوية ارتفاع القمر مع فرق خط الطول",
  intro:["القمر الثابت يدور فوق خط الاستواء على ارتفاع 35786 كم بدور يساوي يوماً، فيبدو ثابتاً في السماء. يرى نحو ثلث الأرض، لكن المحطات البعيدة عن نقطته تراه منخفضاً قرب الأفق.",
         "زاوية الارتفاع تعتمد على فرق خط العرض وخط الطول بين المحطة ونقطة القمر. ما تحت 5–10° غير مفيد عادة بسبب العوائق والغلاف الجوي، والمناطق القطبية لا تراه أبداً."],
  ctl:[{k:"lat",ar:"خط عرض المحطة",min:-85,max:85,step:0.5,v:33.3,f:v=>nf(v,1)+"°"},{k:"dl",ar:"فرق خط الطول عن القمر",min:-90,max:90,step:0.5,v:20,f:v=>nf(v,1)+"°"},{k:"em",ar:"أدنى زاوية ارتفاع مقبولة",min:0,max:30,step:1,v:10,f:v=>nf(v,0)+"°"}],
  pre:[{ar:"بغداد",set:{lat:33.3,dl:11}},{ar:"قرب القطب",set:{lat:78,dl:0}},{ar:"على خط الاستواء",set:{lat:0,dl:0}}],
  calc(st){ const R=42164, f=(la,dl)=>{ const cb=Math.cos(la*D2R)*Math.cos(dl*D2R), sb=Math.sqrt(Math.max(1e-12,1-cb*cb)); return Math.atan2(cb-RE/R,sb)/D2R; };
    st.ef=f; st.el=f(st.lat,st.dl); const cb=Math.cos(st.lat*D2R)*Math.cos(st.dl*D2R); st.d=Math.sqrt(R*R+RE*RE-2*R*RE*cb); st.bm=(Math.acos(RE*Math.cos(st.em*D2R)/R)/D2R-st.em); st.ok=st.el>=st.em; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.5, R=Math.min(r.w,r.h)*0.42; earth(g,cx,cy,R,C);
    lline(g,[[cx-R,cy],[cx+R,cy]],mixC(C.panel,C.ink,0.4),1,[3,3]); g.strokeStyle=C.fuel; g.lineWidth=2; g.beginPath(); g.arc(cx,cy,R*Math.sin(st.bm*D2R),0,Math.PI*2); g.stroke();
    const vis=Math.cos(st.lat*D2R)*Math.cos(st.dl*D2R)>0, x=cx+R*Math.cos(st.lat*D2R)*Math.sin(st.dl*D2R), y=cy-R*Math.sin(st.lat*D2R); if(vis){ ldot(g,x,y,8,"#ffffff"); ldot(g,x,y,5.5,st.ok?"#2fbf71":"#e04848"); ltx(g,"المحطة",x+10,y-12,{s:11,w:600,a:"left",rtl:true,c:"#ffffff"}); }
    ldot(g,cx,cy,3,C.ink); ltx(g,"نقطة القمر",cx,cy+14,{s:9,rtl:true}); ltx(g,"حد التغطية",cx,cy-R*Math.sin(st.bm*D2R)-8,{c:C.fuel,s:10,rtl:true}); },
  plot(st){ return {x:[-90,90],y:[-10,90],xt:[-90,-45,0,45,90],xl:"فرق خط الطول (°)",yl:"الارتفاع (°)",curves:[{f:dl=>st.ef(st.lat,dl),c:"hyd"}],hl:[{y:st.em,c:"power",t:"الحد"},{y:0,c:"line"}],dots:[{x:st.dl,y:st.el,c:st.ok?"ctrl":"power"}]}; },
  ro(st){ return [["زاوية الارتفاع",nf(st.el,1)+"°"],["المسافة المائلة",nf(st.d,0)+" km"],["نصف قطر التغطية",nf(st.bm,1)+"° على الأرض"],["الحالة",st.ok?"صالحة للاتصال":"منخفض جداً أو غير مرئي"]]; },
  eq:["cos β = cos φ cos Δλ","tan el = (cos β − R_E/r) / sin β","d = √(r² + R_E² − 2 r R_E cos β)"],
  note:["الهوائي في بغداد يتجه نحو الجنوب لأن الأقمار الثابتة فوق خط الاستواء.","زمن ذهاب الإشارة وإيابها إلى القمر الثابت نحو ربع ثانية، ولهذا تأخير المكالمات الفضائية ملحوظ."],
  quiz:[{q:"لماذا لا ترى المناطق القطبية القمر الثابت جيداً؟",o:["لأنه فوق خط الاستواء فيكون تحت أفقها","لأنه يتحرك","بسبب البرد"],a:0,why:"زاوية الارتفاع تصبح سالبة فوق خط عرض 81° تقريباً."},
        {q:"على أي ارتفاع يدور القمر الثابت؟",o:["400 km","20000 km","35786 km"],a:2,why:"دوره هناك يوم نجمي واحد."}],
  ref:"الموضوع المقابل: المدار الثابت بالنسبة للأرض (Geostationary Orbit)."
});
LK("ast",{
  ar:"تفلطح الأرض والمدار المتزامن مع الشمس", en:"J2 precession and sun-synchronous orbits",
  alt:"الأرض من فوق القطب مع اتجاه الشمس ومستوى مدار يدور ببطء مع الأيام، ومنحنى معدل دوران العقدة مع الميل وخط المعدل المطلوب للتزامن مع الشمس",
  intro:["الأرض منتفخة عند خط الاستواء، وهذا الانتفاخ يدير مستوى المدار ببطء حول محور الأرض. المعدل يعتمد على الارتفاع والميل: المدارات المائلة أقل من 90° تدور غرباً، والأكثر من 90° تدور شرقاً.",
         "إذا اخترنا ميلاً يجعل المستوى يدور 0.9856° يومياً شرقاً (دورة كل سنة) يبقى المدار بنفس الزاوية مع الشمس طوال العام: مدار «متزامن مع الشمس». أقمار التصوير تحبه لأنها تمر فوق كل مكان في نفس الساعة المحلية."],
  ctl:[{k:"h",ar:"الارتفاع",min:300,max:1500,step:10,v:700,f:v=>nf(v,0)+" km"},{k:"i",ar:"الميل",min:0,max:180,step:0.1,v:98.2,f:v=>nf(v,1)+"°"}],
  calc(st){ const a=RE+st.h, n=Math.sqrt(MU/a**3), k=1.5*n*J2*(RE/a)**2/D2R*86400; st.k=k; st.dO=-k*Math.cos(st.i*D2R); st.isso=Math.acos(-0.9856/k)/D2R; st.drift=(st.dO-0.9856)*30; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.42, cy=r.y+r.h*0.52, R=Math.min(r.w,r.h)*0.2, day=(st.t*10)%365, sun=day*0.9856*D2R, pl=(90+day*st.dO)*D2R;
    larrow(g,cx+Math.cos(sun)*R*3.4,cy-Math.sin(sun)*R*3.4,cx+Math.cos(sun)*R*1.6,cy-Math.sin(sun)*R*1.6,C.fuel,3,10); ldot(g,cx+Math.cos(sun)*R*3.6,cy-Math.sin(sun)*R*3.6,9,C.fuel);
    earth(g,cx,cy,R,C); g.strokeStyle=C.power; g.lineWidth=2.5; g.beginPath(); g.ellipse(cx,cy,R*1.9,R*0.35,-pl,0,Math.PI*2); g.stroke();
    ltx(g,"اليوم "+nf(day,0),r.x+r.w*0.95,r.y+16,{s:12,w:600,a:"right",rtl:true}); ltx(g,Math.abs(st.dO-0.9856)<0.02?"الزاوية مع الشمس ثابتة ✓":"الزاوية مع الشمس تتغير",r.x+r.w*0.5,r.y+r.h*0.96,{s:11,w:600,rtl:true,c:Math.abs(st.dO-0.9856)<0.02?C.ctrl:C.power}); },
  plot(st){ return {x:[0,180],y:[-st.k*1.1,st.k*1.1],xt:[0,45,90,135,180],xl:"الميل (°)",yl:"°/يوم",curves:[{f:i=>-st.k*Math.cos(i*D2R),c:"hyd"}],hl:[{y:0.9856,c:"fuel",t:"تزامن شمسي"},{y:0,c:"line"}],vl:[{x:st.isso,c:"fuel"}],dots:[{x:st.i,y:st.dO}]}; },
  ro(st){ return [["دوران العقدة",nf(st.dO,3)+"°/يوم"],["الميل المطلوب للتزامن",isFinite(st.isso)?nf(st.isso,2)+"°":"غير ممكن"],["الانحراف عن الشمس كل 30 يوماً",nf(st.drift,1)+"°"]]; },
  eq:["dΩ/dt = −(3/2) n J₂ (R_E/a)² cos i","التزامن الشمسي: dΩ/dt = +0.9856°/يوم","J₂ = 1.0826×10⁻³"],
  note:["الحساب للمدار الدائري؛ الاختلاف المركزي يغيّر المعدل قليلاً.","المدارات المتزامنة مع الشمس غالباً بين 600 و800 كم وبميل 97°–99°."],
  quiz:[{q:"لماذا يدور مستوى المدار ببطء؟",o:["بسبب انتفاخ الأرض عند خط الاستواء","بسبب القمر فقط","بسبب الشمس فقط"],a:0,why:"حد J₂ في جاذبية الأرض."},
        {q:"ميل المدار المتزامن مع الشمس:",o:["أقل من 90°","أكبر قليلاً من 90°","صفر"],a:1,why:"يجب أن يدور المستوى شرقاً، وهذا يحتاج cos i سالب."}],
  ref:"الموضوع المقابل: اضطرابات المدار بفعل تفلطح الأرض (J2 Perturbations)."
});
const hohDv=R=>Math.sqrt(2*R/(1+R))-1+(1/Math.sqrt(R))*(1-Math.sqrt(2/(1+R)));
const biDv=(R,al)=>(Math.sqrt(2*al/(1+al))-1)+Math.sqrt(2/al)*(Math.sqrt(R/(al+R))-Math.sqrt(1/(1+al)))+Math.sqrt(1/R)*(Math.sqrt(2*al/(al+R))-1);
LK("ast",{
  ar:"المناورة ثنائية الإهليلج مقابل هوهمان", en:"Bi-elliptic versus Hohmann transfer",
  alt:"مداران دائريان وانتقالان: هوهمان بنصف إهليلج واحد، وثنائي الإهليلج يصعد بعيداً ثم ينزل، ومنحنيات السرعة المطلوبة مع نسبة نصفي القطرين",
  intro:["انتقال هوهمان هو الأوفر عادة بين مدارين دائريين. لكن إذا كان المدار الهدف أبعد من نحو 12 ضعفاً من الابتدائي، يمكن توفير وقود بحيلة غريبة: الصعود أولاً إلى نقطة أبعد من الهدف، ثم النزول إليه.",
         "عند النقطة البعيدة تكون السرعة صغيرة جداً، فتعديل المدار هناك رخيص. الثمن هو الوقت: الانتقال ثنائي الإهليلج أطول بكثير."],
  ctl:[{k:"R",ar:"نصف قطر الهدف ÷ الابتدائي",min:2,max:40,step:0.5,v:15,f:v=>nf(v,1)},{k:"k",ar:"النقطة البعيدة ÷ الهدف",min:1,max:5,step:0.1,v:2,f:v=>nf(v,1)}],
  calc(st){ const v1=Math.sqrt(MU/(RE+300)); st.al=st.k*st.R; st.h=hohDv(st.R)*v1; st.b=biDv(st.R,st.al)*v1; st.th=0.5*Math.pow((1+st.R)/2,1.5); st.tb=0.5*(Math.pow((1+st.al)/2,1.5)+Math.pow((st.al+st.R)/2,1.5)); },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.5, s=Math.min(r.w,r.h)*0.46/st.al, c=(rr,col,d)=>{ g.strokeStyle=col; g.lineWidth=1.5; g.setLineDash(d||[]); g.beginPath(); g.arc(cx,cy,rr*s,0,Math.PI*2); g.stroke(); g.setLineDash([]); };
    c(1,C.hyd); c(st.R,C.ctrl); const half=(ra,rb,up,col)=>{ const a=(ra+rb)/2, e=Math.abs(rb-ra)/(ra+rb), p=[]; for(let k=0;k<=60;k++){ const nu=Math.PI*k/60, rr=a*(1-e*e)/(1+e*Math.cos(nu)); p.push([cx+(ra<rb?1:-1)*rr*Math.cos(nu)*s*(up?1:1),cy-(up?1:-1)*rr*Math.sin(nu)*s]); } lline(g,p,col,2,[5,3]); };
    half(1,st.R,true,C.muted); half(1,st.al,false,C.power); const a2=(st.al+st.R)/2, e2=(st.al-st.R)/(st.al+st.R), p2=[]; for(let k=0;k<=60;k++){ const nu=Math.PI*k/60, rr=a2*(1-e2*e2)/(1+e2*Math.cos(nu)); p2.push([cx+rr*Math.cos(nu)*s,cy-rr*Math.sin(nu)*s]); } lline(g,p2,C.power,2,[5,3]);
    ldot(g,cx,cy,3,C.fuel); ltx(g,"هوهمان",r.x+r.w*0.02,r.y+14,{c:C.muted,s:10,a:"left",rtl:true}); ltx(g,"ثنائي الإهليلج",r.x+r.w*0.02,r.y+30,{c:C.power,s:10,a:"left",rtl:true}); },
  plot(st){ return {x:[2,40],y:[0.3,0.6],xl:"r₂ / r₁",yl:"Δv / v₁",curves:[{f:hohDv,c:"muted"},{f:R=>biDv(R,st.k*R),c:"power"}],vl:[{x:11.94,c:"line",t:"11.94"}],dots:[{x:st.R,y:hohDv(st.R),c:"muted",r:4},{x:st.R,y:biDv(st.R,st.al),c:"power"}],leg:[{c:"muted",t:"هوهمان"},{c:"power",t:"ثنائي"}]}; },
  ro(st){ return [["Δv هوهمان (من 300 كم)",nf(st.h,3)+" km/s"],["Δv ثنائي الإهليلج",nf(st.b,3)+" km/s"],["الفرق",(st.b<st.h?"توفير ":"زيادة ")+nf(Math.abs(st.h-st.b)*1000,0)+" m/s"],["الزمن ÷ دور المدار الابتدائي",nf(st.th,1)+" مقابل "+nf(st.tb,1)]]; },
  eq:["Δv_H/v₁ = √(2R/(1+R)) − 1 + (1/√R)(1 − √(2/(1+R)))","Δv_BE/v₁ = [√(2α/(1+α)) − 1] + √(2/α)[√(R/(α+R)) − √(1/(1+α))] + √(1/R)[√(2α/(α+R)) − 1]","الأفضلية تبدأ عند R ≈ 11.94 (مع α ← ∞)"],
  note:["الرسم بمقياس حقيقي، لذلك يبدو المدار الابتدائي صغيراً.","في الممارسة نادراً ما يُستخدم ثنائي الإهليلج لأن التوفير صغير والزمن طويل."],
  quiz:[{q:"متى قد يكون ثنائي الإهليلج أوفر؟",o:["عندما يكون الهدف أبعد بأكثر من نحو 12 ضعفاً","دائماً","للمدارات القريبة فقط"],a:0,why:"هذا حد المقارنة النظري."},
        {q:"ثمن ثنائي الإهليلج:",o:["زمن أطول بكثير","Δv أكبر دائماً","دقة أقل"],a:0,why:"يصعد إلى نقطة أبعد من الهدف."}],
  ref:"الموضوع المقابل: المناورات بين المدارات (Bi-elliptic Transfer)."
});
LK("ast",{
  ar:"موقع الإطلاق: خط العرض واتجاه الإطلاق", en:"Launch site latitude and launch azimuth",
  alt:"كرة أرضية عليها موقع إطلاق ومسار أرضي للصاروخ باتجاه معين، ومنحنى ميل المدار الناتج مع اتجاه الإطلاق",
  intro:["الصاروخ يبدأ بسرعة دوران الأرض: 465 م/ث عند خط الاستواء وأقل كلما ابتعدنا عنه. الإطلاق شرقاً يستفيد منها كاملة، ولهذا توضع مواقع الإطلاق قرب خط الاستواء وعلى سواحل شرقية.",
         "أقل ميل مداري ممكن يساوي خط عرض الموقع. للوصول إلى مدار ثابت فوق خط الاستواء من موقع شمالي يجب تغيير مستوى المدار لاحقاً، وهذا مكلف جداً."],
  ctl:[{k:"lat",ar:"خط عرض الموقع",min:0,max:63,step:0.5,v:28.5,f:v=>nf(v,1)+"°"},{k:"az",ar:"اتجاه الإطلاق من الشمال",min:0,max:180,step:1,v:90,f:v=>nf(v,0)+"°"}],
  pre:[{ar:"كورو (5°)",set:{lat:5.2,az:90}},{ar:"كيب كانافيرال (28.5°)",set:{lat:28.5,az:90}},{ar:"بايكونور (46°)",set:{lat:45.9,az:90}},{ar:"مدار قطبي",set:{lat:34.7,az:180}}],
  calc(st){ const ci=Math.cos(st.lat*D2R)*Math.sin(st.az*D2R); st.i=Math.acos(clamp(ci,-1,1))/D2R; st.boost=465.1*Math.cos(st.lat*D2R)*Math.sin(st.az*D2R); st.dvG=2*3.0747*Math.sin(st.i*D2R/2); },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.52, R=Math.min(r.w,r.h)*0.42; earth(g,cx,cy,R,C); const P=(la,lo)=>[cx+R*Math.cos(la)*Math.sin(lo),cy-R*Math.sin(la),Math.cos(la)*Math.cos(lo)];
    const eq=[]; for(let k=-90;k<=90;k+=3) eq.push(P(0,k*D2R)); lline(g,eq,mixC(C.panel,C.ink,0.4),1,[3,3]);
    const f=st.lat*D2R, az=st.az*D2R, tr=[]; for(let d=0;d<=170;d+=2){ const dl=d*D2R, la2=Math.asin(Math.sin(f)*Math.cos(dl)+Math.cos(f)*Math.sin(dl)*Math.cos(az)), lo=Math.atan2(Math.sin(az)*Math.sin(dl)*Math.cos(f),Math.cos(dl)-Math.sin(f)*Math.sin(la2)); const q=P(la2,lo); if(q[2]>0) tr.push(q); else break; }
    lline(g,tr,C.power,2.5); const s0=P(f,0); ldot(g,s0[0],s0[1],6,C.fuel); ltx(g,"الموقع",s0[0]-8,s0[1]+14,{c:C.fuel,s:10,rtl:true}); },
  plot(st){ return {x:[0,180],y:[0,180],xt:[0,45,90,135,180],yt:[0,45,90,135,180],xl:"الاتجاه (°)",yl:"الميل (°)",curves:[{f:az=>Math.acos(clamp(Math.cos(st.lat*D2R)*Math.sin(az*D2R),-1,1))/D2R,c:"hyd"}],hl:[{y:st.lat,c:"muted",t:"أقل ميل"}],dots:[{x:st.az,y:st.i}]}; },
  ro(st){ return [["ميل المدار",nf(st.i,1)+"°"],["مساعدة دوران الأرض",nf(st.boost,0)+" m/s"],["Δv لتصفير الميل عند المدار الثابت",nf(st.dvG,2)+" km/s"]]; },
  eq:["cos i = cos φ · sin Az","سرعة الدوران عند الموقع = 465 cos φ m/s","تغيير المستوى عند المدار الثابت ≈ 2 · 3.07 · sin(i/2) km/s"],
  note:["القيم تتجاهل قيود السلامة على اتجاهات الإطلاق (لا يُطلق فوق المدن).","لهذا تحتاج الأقمار الثابتة المطلقة من بايكونور وقوداً أكثر من تلك المطلقة من كورو."],
  quiz:[{q:"أقل ميل يمكن الوصول إليه مباشرة من موقع على خط عرض 30°:",o:["0°","30°","90°"],a:1,why:"cos i ≤ cos φ."},
        {q:"لماذا يُطلق معظم الصواريخ شرقاً؟",o:["للاستفادة من دوران الأرض","بسبب الرياح","لأسباب قانونية فقط"],a:0,why:"الأرض تدور شرقاً فتعطي سرعة مجانية."}],
  ref:"الموضوع المقابل: الإطلاق والتوجيه نحو المدار (Launch Site, Launch Azimuth)."
});
const PLAN=[["الزهرة",324859,6052,35.0],["الأرض",398600,6378,29.8],["المريخ",42828,3396,24.1],["المشتري",1.267e8,71492,13.1]];
LK("ast",{
  ar:"مساعدة الجاذبية: كسب السرعة من كوكب", en:"Gravity assist",
  alt:"مسار زائدي حول كوكب يدير متجه السرعة الزائدة بزاوية، ومثلث السرعات قبل وبعد بالنسبة للشمس، ومنحنى زاوية الانعطاف مع مسافة الاقتراب",
  intro:["بالنسبة للكوكب يدخل المسبار ويخرج بنفس السرعة، لكن اتجاهه يتغير. بالنسبة للشمس، الكوكب نفسه يتحرك، فإذا دار المسبار خلف الكوكب يُضاف جزء من سرعة الكوكب إلى سرعته: يكسب طاقة دون وقود.",
         "كلما اقترب المسبار من الكوكب وكان الكوكب أثقل زادت زاوية الانعطاف. هكذا وصلت مسابير فوياجر إلى أطراف المجموعة الشمسية، وتستخدم مسابير المشتري مرورات حول الزهرة والأرض."],
  ctl:[{k:"pl",ar:"الكوكب",min:0,max:3,step:1,v:3,f:v=>PLAN[v][0]},{k:"vi",ar:"السرعة الزائدة v∞",min:2,max:15,step:0.1,v:6,f:v=>nf(v,1)+" km/s"},{k:"rp",ar:"أقرب مسافة (أنصاف أقطار)",min:1.05,max:20,step:0.05,v:3,f:v=>nf(v,2)}],
  calc(st){ const P=PLAN[st.pl], mu=P[1], rp=st.rp*P[2]; st.ecc=1+rp*st.vi*st.vi/mu; st.d=2*Math.asin(1/st.ecc); st.dv=2*st.vi*Math.sin(st.d/2); const fi=Math.PI/2+st.d/2, fo=Math.PI/2-st.d/2;
    st.Vin=Math.hypot(P[3]+st.vi*Math.cos(fi),st.vi*Math.sin(fi)); st.Vout=Math.hypot(P[3]+st.vi*Math.cos(fo),st.vi*Math.sin(fo)); st.fd=rr=>2*Math.asin(1/(1+rr*P[2]*st.vi*st.vi/mu))/D2R; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.42, cy=r.y+r.h*0.55, R=r.h*0.1, e=st.ecc, sc=R*1.2*st.rp/Math.max(st.rp,1)*0+R, q=st.rp*R*0.6+R*0.4, pts=[];
    const pl=q*(1+e); for(let k=-60;k<=60;k++){ const lim=Math.acos(-1/e)*0.97, nu=lim*k/60, rr=pl/(1+e*Math.cos(nu)); pts.push([cx+rr*Math.cos(nu-Math.PI/2),cy-rr*Math.sin(nu-Math.PI/2)]); }
    g.fillStyle=mixC(C.panel,C.fuel,0.6); g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.fill(); lline(g,pts,C.power,2.2); const f=(st.t*0.12)%1, s=pts[Math.floor(f*(pts.length-1))]; ldot(g,s[0],s[1],4,C.ink);
    larrow(g,cx+r.w*0.25,cy,cx+r.w*0.38,cy,C.fuel,2.5,8); ltx(g,"حركة الكوكب",cx+r.w*0.31,cy+14,{c:C.fuel,s:10,rtl:true});
    ltx(g,"الانعطاف "+nf(st.d/D2R,1)+"°",r.x+r.w*0.5,r.y+14,{s:12,w:600,rtl:true}); },
  plot(st){ return {x:[1.05,20],y:[0,180],xl:"أقرب مسافة (R)",yl:"δ (°)",curves:[{f:st.fd,c:"hyd"}],dots:[{x:st.rp,y:st.d/D2R}]}; },
  ro(st){ return [["زاوية الانعطاف",nf(st.d/D2R,1)+"°"],["تغير متجه السرعة",nf(st.dv,2)+" km/s"],["السرعة حول الشمس قبل / بعد",nf(st.Vin,1)+" / "+nf(st.Vout,1)+" km/s"],["الكسب",nf(st.Vout-st.Vin,2)+" km/s"]]; },
  eq:["e = 1 + r_p v∞² / μ","sin(δ/2) = 1/e","|ΔV| = 2 v∞ sin(δ/2)"],
  note:["الحساب لمرور خلف الكوكب يعطي أكبر كسب في السرعة؛ المرور من أمامه يبطئ المسبار.","الطاقة المكتسبة تأتي من الكوكب نفسه، لكن تأثيرها عليه لا يُقاس لضخامة كتلته."],
  quiz:[{q:"بالنسبة للكوكب، سرعة المسبار بعد المرور:",o:["أكبر","مساوية لسرعته قبل","أقل"],a:1,why:"الطاقة محفوظة في إطار الكوكب؛ يتغير الاتجاه فقط."},
        {q:"الاقتراب أكثر من الكوكب يجعل الانعطاف:",o:["أكبر","أصغر","بلا تغيير"],a:0,why:"e أصغر فيكبر δ."}],
  ref:"الموضوع المقابل: مناورات الجاذبية (Gravity Assist)."
});
LK("ast",{
  ar:"المسار الباليستي: مدى الطيران دون المداري", en:"Suborbital flight: free-flight range",
  alt:"قوس من سطح الأرض ومسار باليستي بيضوي من نقطة الإطلاق إلى نقطة السقوط، ومنحنى المدى مع زاوية الإطلاق",
  intro:["الصاروخ الذي لا يصل إلى السرعة المدارية يتبع جزءاً من مدار بيضوي يقطع الأرض: يصعد ثم يعود. المدى يعتمد على السرعة وزاوية المسار عند انتهاء الاحتراق.",
         "على أرض مسطحة تكون أفضل زاوية 45°، لكن على الأرض الكروية وبسرعات كبيرة تصبح الزاوية الأفضل أصغر لأن الأرض «تنحني» تحت المسار. عند السرعة المدارية تقريباً يدور المسار حول الأرض."],
  ctl:[{k:"v",ar:"السرعة عند انتهاء الاحتراق",min:1,max:7.8,step:0.05,v:5,f:v=>nf(v,2)+" km/s"},{k:"gm",ar:"زاوية المسار",min:5,max:85,step:0.5,v:35,f:v=>nf(v,1)+"°"}],
  calc(st){ st.fn=(v,gd)=>{ const g=gd*D2R, Q=v*v*RE/MU; if(Q>=2) return null; const ec=Q*Math.cos(g)**2-1, es=Q*Math.sin(g)*Math.cos(g), e=Math.hypot(ec,es), nu=Math.atan2(es,ec), psi=2*(Math.PI-nu), p=Q*Math.cos(g)**2*RE, a=p/(1-e*e), ra=p/(1-e)-RE, n=Math.sqrt(MU/a**3), E=2*Math.atan(Math.sqrt((1-e)/(1+e))*Math.tan(nu/2)), M=E-e*Math.sin(E), t=2*(Math.PI-M)/n; return {psi,range:RE*psi,ra,t,e,p,nu}; };
    st.r=st.fn(st.v,st.gm); let best=0,bg=45; for(let g=5;g<=85;g+=0.5){ const q=st.fn(st.v,g); if(q&&q.range>best){ best=q.range; bg=g; } } st.best=bg; },
  scene(g,r,st,C){ const q=st.r; if(!q) return; const R=Math.min(r.w,r.h)*0.4, cx=r.x+r.w*0.5, cy=r.y+r.h*0.5+R*0.3, s=R/RE, rot=-Math.PI/2-q.psi/2;
    earth(g,cx,cy,R,C); const pts=[]; for(let k=0;k<=80;k++){ const nu=q.nu+(2*Math.PI-2*q.nu)*k/80, rr=q.p/(1+q.e*Math.cos(nu)), th=rot+(nu-q.nu); pts.push([cx+rr*s*Math.cos(th)*1,cy+rr*s*Math.sin(th)]); }
    lline(g,pts,C.power,2.4); ldot(g,pts[0][0],pts[0][1],5,C.ctrl); ldot(g,pts[80][0],pts[80][1],5,C.power); const f=(st.t*0.15)%1, sp=pts[Math.floor(f*80)]; ldot(g,sp[0],sp[1],3.5,C.ink);
    ltx(g,"المدى "+nf(q.range,0)+" km",r.x+r.w*0.5,r.y+14,{s:12,w:600,rtl:true}); },
  plot(st){ return {x:[5,85],y:[0,Math.max(...[...Array(17).keys()].map(k=>(st.fn(st.v,5+k*5)||{range:0}).range))*1.1+10],xl:"زاوية المسار (°)",yl:"km",curves:[{f:g=>{ const q=st.fn(st.v,g); return q?q.range:NaN; },c:"hyd"}],vl:[{x:st.best,c:"ctrl",t:"الأفضل"}],dots:st.r?[{x:st.gm,y:st.r.range}]:[]}; },
  ro(st){ const q=st.r; return q?[["المدى",nf(q.range,0)+" km"],["أقصى ارتفاع",nf(q.ra,0)+" km"],["زمن الطيران",nf(q.t/60,1)+" min"],["أفضل زاوية لهذه السرعة",nf(st.best,1)+"°"]]:[["الحالة","السرعة كافية للإفلات"]]; },
  eq:["Q = v² r / μ","tan ν = Q sin γ cos γ / (Q cos²γ − 1)","زاوية المدى Ψ = 2(π − ν) ، المدى = R_E Ψ"],
  note:["الحساب يهمل الهواء ودوران الأرض ويفترض انتهاء الاحتراق عند السطح.","عند سرعات صغيرة تقترب أفضل زاوية من 45° كما في المقذوفات العادية."],
  quiz:[{q:"على الأرض الكروية وبسرعة كبيرة، أفضل زاوية للمدى:",o:["أكبر من 45°","أقل من 45°","45° دائماً"],a:1,why:"انحناء الأرض يطيل المسار المنخفض."},
        {q:"المسار الباليستي جزء من:",o:["خط مستقيم","مدار بيضوي يقطع الأرض","دائرة حول الأرض"],a:1,why:"الحركة تحت جاذبية مركزية فقط."}],
  ref:"الموضوع المقابل: المسارات الباليستية (Ballistic Trajectories)."
});
LK("ast",{
  ar:"مدار مولنيا والميل الحرج", en:"Molniya orbits and the critical inclination",
  alt:"مدار بيضوي جداً بدور 12 ساعة مع نقاط تفصلها مدد زمنية متساوية تتزاحم قرب الأوج، ومنحنى دوران الحضيض مع الميل يمر بالصفر عند 63.4 درجة",
  intro:["الدول البعيدة شمالاً لا ترى الأقمار الثابتة جيداً. الحل مدار بيضوي جداً بدور 12 ساعة أوجه فوق الشمال: القمر يقضي معظم وقته بطيئاً قرب الأوج فوق المنطقة المطلوبة، ويمر بالحضيض بسرعة.",
         "لكن تفلطح الأرض يدير الحضيض داخل المدار فيضيع الأوج عن الشمال. عند ميل 63.4° بالضبط يتوقف هذا الدوران: هذا «الميل الحرج»، ولهذا تستخدم أقمار مولنيا هذا الميل."],
  ctl:[{k:"i",ar:"الميل",min:0,max:90,step:0.1,v:63.4,f:v=>nf(v,1)+"°"},{k:"e",ar:"الاختلاف المركزي",min:0,max:0.8,step:0.01,v:0.74,f:v=>nf(v,2)}],
  calc(st){ const T=43082, a=Math.cbrt(MU*(T/(2*Math.PI))**2), p=a*(1-st.e*st.e), n=2*Math.PI/T; st.a=a; st.dw=0.75*n*J2*(RE/p)**2*(5*Math.cos(st.i*D2R)**2-1)/D2R*86400; st.rp=a*(1-st.e)-RE; st.ra=a*(1+st.e)-RE;
    st.dwell=(nu2M(270*D2R,st.e)-nu2M(90*D2R,st.e))/(2*Math.PI); },
  scene(g,r,st,C){ const a=st.a, e=st.e, b=a*Math.sqrt(1-e*e), s=Math.min(r.h*0.46/a,r.w*0.4/b), cx=r.x+r.w*0.5, fy=r.y+r.h*0.5+a*e*s, P=nu=>{ const rr=a*(1-e*e)/(1+e*Math.cos(nu)); return [cx+rr*Math.sin(nu)*s,fy+rr*Math.cos(nu)*s]; };
    const o=[]; for(let k=0;k<=120;k++) o.push(P(k/120*Math.PI*2)); lline(g,o,C.line,1.5); earth(g,cx,fy,Math.max(4,RE*s),C);
    for(let k=0;k<24;k++){ const q=P(M2nu(k/24*Math.PI*2,e)); ldot(g,q[0],q[1],2.6,k%2?C.hyd:C.ctrl); } const sp=P(M2nu(st.t*0.5,e)); ldot(g,sp[0],sp[1],5,C.power);
    ltx(g,"الأوج فوق الشمال",cx,P(Math.PI)[1]-12,{s:10,rtl:true}); ltx(g,"نقطة كل 30 دقيقة",r.x+r.w*0.98,r.y+r.h*0.96,{c:C.muted,s:10,a:"right",rtl:true}); },
  plot(st){ return {x:[0,90],y:[-0.5,1.5],xt:[0,30,45,63.4,90],xl:"الميل (°)",yl:"دوران الحضيض °/يوم",curves:[{f:i=>{ const T=43082, a=Math.cbrt(MU*(T/(2*Math.PI))**2), p=a*(1-st.e*st.e); return 0.75*(2*Math.PI/T)*J2*(RE/p)**2*(5*Math.cos(i*D2R)**2-1)/D2R*86400; },c:"hyd"}],hl:[{y:0,c:"line"}],vl:[{x:63.43,c:"ctrl",t:"63.4°"}],dots:[{x:st.i,y:st.dw}]}; },
  ro(st){ return [["دوران الحضيض",nf(st.dw,4)+"°/يوم"],["الحضيض / الأوج",nf(st.rp,0)+" / "+nf(st.ra,0)+" km"],["الوقت في نصف الأوج",nf(st.dwell*100,0)+"% من الدور"]]; },
  eq:["dω/dt = (3/4) n J₂ (R_E/p)² (5 cos²i − 1)","الميل الحرج: 5 cos²i = 1 ⇒ i = 63.4° (أو 116.6°)"],
  note:["الدور هنا نصف يوم نجمي (11 ساعة و58 دقيقة).","النقاط الملوّنة متباعدة زمنياً بالتساوي: لاحظ تزاحمها قرب الأوج."],
  quiz:[{q:"لماذا يُختار ميل 63.4° لمدار مولنيا؟",o:["ليبقى الحضيض والأوج في مكانهما","لأنه أرخص إطلاقاً","لأنه قطبي"],a:0,why:"دوران الحضيض بفعل J₂ يصبح صفراً."},
        {q:"القمر في مدار مولنيا يقضي معظم وقته:",o:["قرب الحضيض","قرب الأوج","بالتساوي"],a:1,why:"يتحرك ببطء هناك."}],
  ref:"الموضوع المقابل: المدارات الخاصة واضطراب الحضيض (Molniya, Critical Inclination)."
});
const SOIP=[["عطارد",0.387,1.66e-7,2440],["الزهرة",0.723,2.45e-6,6052],["الأرض",1.0,3.0e-6,6378],["المريخ",1.524,3.23e-7,3396],["المشتري",5.203,9.55e-4,71492],["زحل",9.537,2.86e-4,60268],["أورانوس",19.19,4.37e-5,25559],["نبتون",30.07,5.15e-5,24764]];
LK("ast",{
  ar:"كرة التأثير: أين تبدأ جاذبية الكوكب", en:"The sphere of influence",
  alt:"كوكب محاط بدائرة كرة التأثير وكرة هيل، ومدار القمر للأرض داخلها، ومخطط لوغاريتمي لنصف قطر كرة التأثير للكواكب مع بعدها عن الشمس",
  intro:["في الرحلات بين الكواكب نقسم المسار إلى أجزاء: قرب الكوكب نحسب بجاذبيته وحدها، وبعيداً عنه بجاذبية الشمس وحدها. الحد بينهما «كرة التأثير»: r = a (m/M)^(2/5).",
         "كرة تأثير الأرض نحو 925 ألف كم، والقمر يدور داخلها على 384 ألف كم. وكرة المشتري هائلة (48 مليون كم) بسبب كتلته وبعده، ولهذا يملك أقماراً كثيرة بعيدة."],
  ctl:[{k:"pl",ar:"الكوكب",min:0,max:7,step:1,v:2,f:v=>SOIP[v][0]}],
  calc(st){ const P=SOIP[st.pl], a=P[1]*1.495978707e8; st.soi=a*Math.pow(P[2],0.4); st.hill=a*Math.cbrt(P[2]/3); st.rr=st.soi/P[3]; },
  scene(g,r,st,C){ const cx=r.x+r.w*0.5, cy=r.y+r.h*0.5, R=Math.min(r.w,r.h)*0.42, s=R/st.hill; g.strokeStyle=C.muted; g.lineWidth=1.2; g.setLineDash([4,4]); g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.stroke(); g.setLineDash([]);
    g.strokeStyle=C.ctrl; g.lineWidth=2; g.beginPath(); g.arc(cx,cy,st.soi*s,0,Math.PI*2); g.stroke(); ldot(g,cx,cy,Math.max(4,SOIP[st.pl][3]*s),C.fuel);
    if(st.pl===2){ g.strokeStyle=C.hyd; g.lineWidth=1.2; g.beginPath(); g.arc(cx,cy,384400*s,0,Math.PI*2); g.stroke(); const a=st.t*0.5; ldot(g,cx+Math.cos(a)*384400*s,cy+Math.sin(a)*384400*s,3,C.hyd); ltx(g,"مدار القمر",cx+384400*s*0.7,cy-384400*s*0.75,{c:C.hyd,s:10,rtl:true}); }
    ltx(g,"كرة التأثير",cx,cy-st.soi*s-10,{c:C.ctrl,s:11,rtl:true}); ltx(g,"كرة هيل",cx,cy-R-8,{c:C.muted,s:10,rtl:true}); larrow(g,r.x+r.w*0.06,cy,r.x+r.w*0.02,cy,C.fuel,2,7); ltx(g,"الشمس",r.x+r.w*0.06,cy+14,{c:C.fuel,s:10,rtl:true}); },
  plot(st){ return {x:[-0.5,1.6],y:[5,8.2],xt:[-0.4,0,0.7,1.3],xf:x=>nf(Math.pow(10,x),1),yt:[5,6,7,8],yf:y=>"10"+"⁰¹²³⁴⁵⁶⁷⁸⁹"[y],xl:"البعد عن الشمس (AU)",yl:"r_SOI km",dots:SOIP.map((P,i)=>({x:Math.log10(P[1]),y:Math.log10(P[1]*1.495978707e8*Math.pow(P[2],0.4)),c:i===st.pl?"power":"muted",r:i===st.pl?6:4,t:i===st.pl?P[0]:""}))}; },
  ro(st){ return [["نصف قطر كرة التأثير",nf(st.soi/1e6,3)+" مليون km"],["بأنصاف أقطار الكوكب",nf(st.rr,0)],["كرة هيل",nf(st.hill/1e6,3)+" مليون km"]]; },
  eq:["r_SOI = a (m/M☉)^(2/5)","r_Hill ≈ a (m / 3M☉)^(1/3)"],
  note:["طريقة «المخروطات المرقّعة» تقريب جيد للتخطيط الأولي، والمسارات النهائية تُحسب بتكامل عددي لكل الأجسام.","كرة هيل أكبر من كرة التأثير وتحدد أين يمكن لقمر أن يبقى مستقراً."],
  quiz:[{q:"هل القمر داخل كرة تأثير الأرض؟",o:["نعم (384 ألف من 925 ألف كم)","لا","على حدها تماماً"],a:0,why:"مداره أصغر من نصف قطر الكرة."},
        {q:"لماذا كرة المشتري كبيرة جداً؟",o:["كتلته كبيرة وبعده عن الشمس كبير","لأنه غازي","بسبب حلقاته"],a:0,why:"r ∝ a · m^(2/5)."}],
  ref:"الموضوع المقابل: المخروطات المرقّعة وكرة التأثير (Patched Conics, Sphere of Influence)."
});
