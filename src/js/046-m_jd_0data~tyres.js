/* ---------- tyres: every wheel of every leg (the engine / gear categories copy ONE axle, which would miss half of a 4-wheel bogie) ---------- */
function jdWheels(K){ const c=K.c, big=jdBig(K), wo=big?0.55:0.42, wid=big?0.5:0.4, nwid=big?0.4:0.22, out=[], ax=jdAx(K);
  (c.mg||[]).forEach(([gy,gx])=>[-1,1].forEach(s=>ax.forEach(d=>[-wo,wo].forEach(dx=>out.push({x:s*gy+dx,y:c.wheelR,z:K.Z(gx+d),R:c.wheelR,w:wid})))));
  [-wo,wo].forEach(dx=>out.push({x:dx,y:c.nwR,z:K.Z((c.ng||[5])[0]),R:c.nwR,w:nwid,nose:true}));
  return out; }
ED.wheel_tire={gearDep:true,layer:"ext",mk:"edblk",cat:"W",sel:true,cam:[Math.PI/2-0.6,1.15],
  geo:K=>jdWheels(K).map(w=>edTor(w.R*0.76,w.R*0.26,"x",0,0,0).scale(w.w/(w.R*0.52),1,1).translate(w.x,w.y,w.z)),
  lab:K=>{ const w=jdWheels(K)[0]; return w?[["المداس (Tread)","Tread",[w.x+0.3,w.y+w.R,w.z]],["الهيكل الداخلي للإطار (Carcass)","Carcass",[w.x,w.y,w.z+w.R*0.9]],["صمام النفخ","Valve",[w.x+0.35,w.y-0.1,w.z-w.R*0.5]]]:[]; }};
ED.tire_pressure_sensor={gearDep:true,layer:"ext",mk:"edyel",cat:"W",sel:true,cam:[Math.PI/2-0.6,1.15],
  geo:K=>jdWheels(K).map(w=>edCyl(0.045,0.07,"x",w.x+(w.x>0?1:-1)*(w.w/2+0.03),w.y,w.z)),
  lab:K=>{ const w=jdWheels(K)[0]; return w?[["حساس ضغط الإطار","Tyre pressure sensor",[w.x+0.4,w.y+0.1,w.z]]]:[]; }};
