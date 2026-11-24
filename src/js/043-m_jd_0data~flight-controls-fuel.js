/* ---------- flight controls, fuel ---------- */
ED.aileron_pcu={layer:"int",mk:"edgry",cat:"W",both:true,cam:[Math.PI-0.7,0.9],
  geo:K=>{ const W=K.W, g=[]; [0.8,0.9].forEach(u=>{ const p=edWp(W,u,0.74,0); g.push(edCyl(0.07,0.6,"z",p.x,p.y,p.z+0.15)); g.push(edBox(0.16,0.14,0.2,p.x,p.y+0.12,p.z-0.2)); g.push(edBar([p.x,p.y,p.z+0.45],[p.x,p.y+0.05,edWp(W,u,0.9,0).z],0.025)); }); return g; },
  lab:K=>{ const W=K.W, p=edWp(W,0.8,0.74,0), q=edWp(W,0.9,0.74,0); return [["مشغّل هيدروليكي للجنيحة","Aileron hydraulic actuator",[p.x,p.y+0.3,p.z+0.15]],["صمام التحكم (Servo valve)","Servo valve",[p.x,p.y+0.3,p.z-0.2]],["مشغّل الجنيحة الخارجية","Outboard actuator",[q.x,q.y+0.3,q.z+0.15]]]; }};
ED.fuel_probes={layer:"int",mk:"edyel",cat:"W",both:true,cam:[Math.PI-0.7,0.9],
  geo:K=>{ const W=K.W, g=[]; [0.14,0.26,0.4,0.54,0.68,0.8].forEach(u=>{ const t=edWp(W,u,0.4,0.8), b=edWp(W,u,0.4,-0.8); g.push(edBar(t.toArray(),b.toArray(),0.014)); g.push(edCyl(0.04,0.08,"y",t.x,t.y+0.04,t.z)); });
    const t=edWp(W,0.14,0.55,0.7); g.push(edBox(0.14,0.1,0.14,t.x,t.y-0.05,t.z)); return g; },
  lab:K=>{ const W=K.W, t=edWp(W,0.4,0.4,0.8), d=edWp(W,0.14,0.55,0.7); return [["مجسّ سعوي لكمية الوقود","Capacitance fuel probe",[t.x,t.y+0.25,t.z]],["مقياس كثافة الوقود (Densitometer)","Fuel densitometer",[d.x,d.y+0.3,d.z]]]; }};
ED.fuel_xfeed={layer:"int",mk:"edgld",cat:"W",cam:[Math.PI-0.7,1.0],
  geo:K=>{ const P=jdLoc(K,"fuel_xfeed"); if(!P) return []; return [edCyl(0.13,0.42,"x",P.x,P.y,P.z),edBox(0.2,0.2,0.2,P.x,P.y+0.22,P.z),edCyl(0.05,0.22,"y",P.x,P.y+0.42,P.z),edBar([P.x-0.21,P.y,P.z],[P.x-0.9,P.y,P.z],0.07),edBar([P.x+0.21,P.y,P.z],[P.x+0.9,P.y,P.z],0.07)]; },
  lab:K=>{ const P=jdLoc(K,"fuel_xfeed"); if(!P) return []; return [["صمام التغذية المتقاطعة","Crossfeed valve",[P.x,P.y+0.15,P.z]],["مشغّل الصمام","Valve actuator",[P.x,P.y+0.55,P.z]],["أنبوب الوقود","Fuel line",[P.x+0.7,P.y+0.1,P.z]]]; }};
ED.fuel_trim_tank={layer:"int",mk:"edyel",cat:"W",both:true,cam:[Math.PI+0.5,0.8],
  geo:K=>{ const H=K.H, p=(u,f,k)=>H.pt(u,f,k,0), A=p(0.05,0.2,0.8),B=p(0.5,0.2,0.8),C=p(0.5,0.62,0.8),D=p(0.05,0.62,0.8),A2=p(0.05,0.2,-0.8),B2=p(0.5,0.2,-0.8),C2=p(0.5,0.62,-0.8),D2=p(0.05,0.62,-0.8), g=[];
    g.push(edStrip([[A,D],[B,C]]),edStrip([[A2,D2],[B2,C2]]),edStrip([[A,B],[A2,B2]]),edStrip([[D,C],[D2,C2]]));
    [[A,B],[B,C],[C,D],[D,A],[A2,B2],[B2,C2],[C2,D2],[D2,A2],[A,A2],[B,B2],[C,C2],[D,D2]].forEach(e=>g.push(edBar(e[0].toArray(),e[1].toArray(),0.03)));
    const m=p(0.1,0.4,0); g.push(edCyl(0.1,0.3,"y",m.x,m.y,m.z)); return g; },
  lab:K=>{ const H=K.H, a=H.pt(0.3,0.4,0.8,0), b=H.pt(0.1,0.4,0,0); return [["خزان الموازنة في الذيل الأفقي","Horizontal-stabilizer trim tank",[a.x,a.y+0.2,a.z]],["مضخة نقل الوقود","Transfer pump",[b.x,b.y+0.25,b.z]]]; }};
ED.hyd_accumulator={layer:"int",mk:"edgrn",cat:"W",cam:[Math.PI-0.6,0.9],
  geo:K=>{ const P=jdLoc(K,"hyd_accumulator"); if(!P) return []; return [edSph(0.3,P.x,P.y,P.z),edCyl(0.22,0.5,"y",P.x,P.y-0.45,P.z),edCyl(0.04,0.18,"y",P.x,P.y+0.38,P.z),edBar([P.x,P.y-0.7,P.z],[P.x+0.7,P.y-0.7,P.z],0.04)]; },
  lab:K=>{ const P=jdLoc(K,"hyd_accumulator"); if(!P) return []; return [["غرفة الغاز (نيتروجين)","Gas chamber (nitrogen)",[P.x,P.y+0.3,P.z]],["غرفة السائل","Fluid chamber",[P.x+0.3,P.y-0.45,P.z]],["صمام الشحن","Charging valve",[P.x,P.y+0.5,P.z]]]; }};
ED.hyd_filters={layer:"int",mk:"edblu",cat:"W",cam:[Math.PI-0.6,0.9],
  geo:K=>{ const P=jdLoc(K,"hyd_filters"); if(!P) return []; const g=[]; [-0.28,0.28].forEach(dx=>{ g.push(edCyl(0.11,0.5,"y",P.x+dx,P.y,P.z)); g.push(edCyl(0.14,0.06,"y",P.x+dx,P.y+0.3,P.z)); g.push(edBox(0.07,0.07,0.07,P.x+dx+0.14,P.y+0.1,P.z)); }); g.push(edBar([P.x-0.28,P.y-0.3,P.z],[P.x+0.28,P.y-0.3,P.z],0.04)); return g; },
  lab:K=>{ const P=jdLoc(K,"hyd_filters"); if(!P) return []; return [["مرشّح الضغط (Filter element)","Pressure filter",[P.x-0.28,P.y+0.45,P.z]],["مؤشر فرق الضغط","Differential-pressure indicator",[P.x+0.42,P.y+0.1,P.z]]]; }};
