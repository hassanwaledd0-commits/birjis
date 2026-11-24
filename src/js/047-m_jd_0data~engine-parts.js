/* ---------- engine parts (737 engine frame: axis EDN, cat E: one copy per nacelle) ---------- */
ED.eng_spinner={layer:"ext",mk:"edmet",cat:"E",both:true,cam:[Math.PI-0.45,1.1],
  geo:K=>[edCyl(0.02,0.46,"z",EDN.x,EDN.y,-5.55,18,0.3),edCyl(0.3,0.04,"z",EDN.x,EDN.y,-5.3,18)],
  lab:K=>[["مخروط المروحة (Spinner)","Fan spinner",[EDN.x,EDN.y+0.18,-5.7]],["اللوحة الخلفية للمخروط","Spinner back plate",[EDN.x+0.3,EDN.y,-5.3]]]};
ED.eng_fadec={layer:"int",mk:"edgrn",cat:"E",both:true,cam:[Math.PI-0.8,1.1],
  geo:K=>{ const x=EDN.x+1.02, z=-4.5; return [edBox(0.2,0.34,0.5,x,EDN.y,z),edBox(0.06,0.3,0.4,x-0.12,EDN.y,z),edBar([x-0.1,EDN.y+0.1,z+0.25],[EDN.x+0.5,EDN.y+0.3,-3.6],0.025),edBar([x-0.1,EDN.y-0.1,z+0.25],[EDN.x+0.55,EDN.y-0.2,-3.6],0.025)]; },
  lab:K=>{ const x=EDN.x+1.02; return [["حاسوب المحرك FADEC (قناتان)","FADEC (dual channel)",[x+0.15,EDN.y+0.25,-4.5]],["حزمة الأسلاك إلى المحرك","Engine harness",[EDN.x+0.8,EDN.y+0.3,-3.8]]]; }};
ED.eng_igniter={layer:"int",mk:"edyel",cat:"E",both:true,cam:[Math.PI-0.8,1.0],
  geo:K=>{ const z=-3.4, y=EDN.y+0.62; return [edCyl(0.035,0.28,"y",EDN.x,y,z),edCyl(0.05,0.05,"y",EDN.x,y+0.16,z),edBar([EDN.x,y+0.18,z],[EDN.x+0.3,y+0.45,z],0.02),edBox(0.22,0.16,0.3,EDN.x+0.4,y+0.5,z)]; },
  lab:K=>{ const z=-3.4, y=EDN.y+0.62; return [["شمعة الإشعال","Igniter plug",[EDN.x,y+0.22,z]],["الكبل إلى المحرّض","Ignition lead",[EDN.x+0.2,y+0.35,z]],["محرّض الشرارة (Exciter)","Ignition exciter",[EDN.x+0.4,y+0.7,z]]]; }};
ED.eng_vibration={layer:"int",mk:"edorg",cat:"E",both:true,cam:[Math.PI-0.8,1.1],
  geo:K=>{ const x=EDN.x-0.98, z=-4.7; return [edCyl(0.05,0.12,"x",x,EDN.y+0.1,z),edBar([x-0.06,EDN.y+0.1,z],[x-0.3,EDN.y+0.4,-4.2],0.015)]; },
  lab:K=>{ const x=EDN.x-0.98; return [["مقياس اهتزاز المحرك","Engine vibration sensor",[x,EDN.y+0.3,-4.7]],["كبل المستشعر","Sensor cable",[x-0.25,EDN.y+0.5,-4.3]]]; }};
ED.gear_steering={gearDep:true,layer:"int",mk:"edorg",cat:"N",both:true,cam:[Math.PI-0.7,1.0],
  geo:K=>{ const X=5.0, z=K.Z(X), y=1.0; return [edTor(0.22,0.04,"y",0,y,z),edCyl(0.05,0.55,"z",0.32,y+0.05,z-0.25),edCyl(0.05,0.55,"z",-0.32,y+0.05,z-0.25),edBar([0.25,y,z],[0.3,y+0.02,z-0.5],0.03),edCyl(0.03,0.2,"x",0,y+0.12,z+0.2)]; },
  lab:K=>{ const z=K.Z(5.0); return [["مشغّلا التوجيه","Steering actuators",[0.32,1.15,z-0.3]],["طوق التوجيه (Steering collar)","Steering collar",[0,1.0,z]],["مسمار فك التوجيه (للسحب)","Disconnect pin (for towing)",[0,1.15,z+0.2]]]; }};
