/* ---------- doors and windows ---------- */
ED.door_pax={layer:"ext",mk:"edorg",cat:"W",sel:true,cam:[Math.PI+1.1,1.35],
  geo:K=>{ const d=jdDoor(K,/^(M1|1)$/); if(!d) return []; const g=jdDoorGeo(K,d,-1,true); [-0.3,0,0.3].forEach(f=>g.push(edBox(0.1,0.14,0.12,-(K.half(d.X,d.z)-0.02),d.z+f*d.h*0.7,K.Z(d.X)+d.w/2-0.07))); return g; },
  lab:K=>{ const d=jdDoor(K,/^(M1|1)$/); if(!d) return []; return jdDoorLab(K,d,-1,"باب الركاب الأمامي الأيسر","Forward passenger door (left)").concat([["مفصّلات الباب العلوية","Upper hinges",[-(K.half(d.X,d.z)+0.1),d.z+d.h/2,K.Z(d.X)]],["مزاليج القفل","Latch mechanism",[-(K.half(d.X,d.z)+0.1),d.z,K.Z(d.X)+d.w/2]]]); }};
ED.door_cargo_fwd={layer:"ext",mk:"edorg",cat:"W",sel:true,cam:[Math.PI/2+0.5,1.3],
  geo:K=>{ const d=jdDoor(K,/^FWD CARGO$/); if(!d) return []; const g=jdDoorGeo(K,d,1,true), x=K.half(d.X,d.z)+0.06; g.push(edBar([x,d.z+d.h/2-0.1,K.Z(d.X)-d.w*0.15],[x-0.6,d.z+d.h/2-0.6,K.Z(d.X)-d.w*0.15],0.04)); return g; },
  lab:K=>{ const d=jdDoor(K,/^FWD CARGO$/); if(!d) return []; return jdDoorLab(K,d,1,"باب الشحن الأمامي","Forward cargo door").concat([["مفصّلة المحرّك","Hinge and actuator",[K.half(d.X,d.z)+0.1,d.z+d.h/2,K.Z(d.X)]]]); }};
ED.door_cargo_aft={layer:"ext",mk:"edorg",cat:"W",sel:true,cam:[Math.PI/2+0.5,1.3],
  geo:K=>{ const d=jdDoor(K,/^AFT CARGO$/); if(!d) return []; const g=jdDoorGeo(K,d,1,true), x=K.half(d.X,d.z)+0.06; g.push(edBar([x,d.z+d.h/2-0.1,K.Z(d.X)+d.w*0.15],[x-0.6,d.z+d.h/2-0.6,K.Z(d.X)+d.w*0.15],0.04)); return g; },
  lab:K=>{ const d=jdDoor(K,/^AFT CARGO$/); if(!d) return []; return jdDoorLab(K,d,1,"باب الشحن الخلفي","Aft cargo door").concat([["المحرّك والمزاليج","Actuator and latches",[K.half(d.X,d.z)+0.1,d.z+d.h/2,K.Z(d.X)]]]); }};
ED.window_cockpit={layer:"ext",mk:"edgl",cat:"W",both:true,sel:true,cam:[Math.PI/2+0.9,1.3],
  geo:K=>{ const X=jdCkX(K)+K.c.fd*0.18, y=jdCkY(K,X)+1.15, x=K.half(X,y)+0.03, Z=K.Z(X); return [edBox(0.04,0.42,0.55,x,y,Z),edBox(0.05,0.03,0.7,x,y+0.26,Z),edBox(0.05,0.03,0.7,x,y-0.26,Z)]; },
  lab:K=>{ const X=jdCkX(K)+K.c.fd*0.18, y=jdCkY(K,X)+1.15, x=K.half(X,y)+0.05; return [["نافذة القمرة المنزلقة","Cockpit sliding window",[x,y+0.35,K.Z(X)]],["مجرى الانزلاق","Track",[x,y-0.3,K.Z(X)+0.25]]]; }};
ED.upper_deck_stairs={layer:"int",mk:"edgry",cat:"W",cam:[Math.PI-0.7,1.0],
  geo:K=>{ const P=jdLoc(K,"upper_deck_stairs"); if(!P) return []; const k=jdKey(K), dz=(JD_CK[k]||JD_CK.b747).dz||2.6, y0=jdFl(K,P.z+K.L/2), n=14, g=[], R=0.78;
    for(let i=0;i<n;i++){ const a=i/n*Math.PI*1.5, y=y0+dz*i/n; g.push(new THREE.BoxGeometry(0.9,0.06,0.34).translate(0.45,0,0).rotateY(-a).translate(P.x,y,P.z)); }
    g.push(edCyl(0.07,dz,"y",P.x,y0+dz/2,P.z));
    for(let i=0;i<=n;i++){ const a=i/n*Math.PI*1.5, a2=(i+1)/n*Math.PI*1.5, p=[P.x+Math.cos(a)*(R+0.5),y0+dz*i/n+0.95,P.z-Math.sin(a)*(R+0.5)], q=[P.x+Math.cos(a2)*(R+0.5),y0+dz*(i+1)/n+0.95,P.z-Math.sin(a2)*(R+0.5)]; if(i<n) g.push(edBar(p,q,0.025)); }
    return g; },
  lab:K=>{ const P=jdLoc(K,"upper_deck_stairs"); if(!P) return []; const dz=(JD_CK[jdKey(K)]||JD_CK.b747).dz||2.6, y0=jdFl(K,P.z+K.L/2); return [["درجات الدرج الحلزوني","Spiral stair treads",[P.x+0.5,y0+0.5,P.z]],["العمود المركزي","Centre post",[P.x,y0+dz*0.55,P.z]],["الدرابزين","Handrail",[P.x+1.2,y0+dz*0.9,P.z]]]; }};
