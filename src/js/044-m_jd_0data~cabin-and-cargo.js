/* ---------- cabin and cargo ---------- */
ED.cabin_galley={layer:"int",mk:"edmet",cat:"W",cam:[Math.PI-0.7,1.0],
  geo:K=>{ const P=jdLoc(K,"cabin_galley"); if(!P) return []; const X=P.z+K.L/2, y=jdFl(K,X), hw=K.half(X,y+1), g=[]; [-1,1].forEach(s=>{ const x=s*(hw-0.65);
      g.push(edBox(1.0,1.9,1.5,x,y+0.95,P.z)); g.push(edBox(0.3,0.25,0.4,x-s*0.15,y+1.1,P.z-0.78)); g.push(edBox(0.3,0.25,0.4,x-s*0.15,y+1.55,P.z-0.78));   /* oven faces */
      for(let i=0;i<3;i++) g.push(edBox(0.28,0.5,0.4,x-s*0.15,y+0.3,P.z-0.78+0.0+i*0.0)); g.push(edCyl(0.06,0.5,"y",x+s*0.2,y-0.25,P.z)); });
    return g; },
  lab:K=>{ const P=jdLoc(K,"cabin_galley"); if(!P) return []; const X=P.z+K.L/2, y=jdFl(K,X), hw=K.half(X,y+1); return [["وحدة المطبخ (Galley)","Galley unit",[hw-0.65,y+1.95,P.z]],["أفران","Ovens",[-(hw-0.65),y+1.5,P.z-0.9]],["عربات الخدمة (Trolleys)","Service trolleys",[hw-0.8,y+0.35,P.z-0.9]],["ماسورة التصريف (Drain mast)","Drain mast",[-(hw-0.45),y-0.45,P.z]]]; }};
ED.cabin_lav={layer:"int",mk:"edwht",cat:"W",cam:[Math.PI+0.7,1.0],
  geo:K=>{ const P=jdLoc(K,"cabin_lav"); if(!P) return []; const X=P.z+K.L/2, y=jdFl(K,X), hw=K.half(X,y+1), g=[]; [-1,1].forEach(s=>{ const x=s*(hw-0.55); g.push(edBox(0.95,2.0,1.0,x,y+1.0,P.z)); g.push(edBox(0.4,0.1,0.4,x-s*0.1,y+0.5,P.z-0.35)); g.push(edCyl(0.2,0.12,"y",x-s*0.1,y+0.46,P.z-0.35)); g.push(edBox(0.5,0.4,0.4,x+s*0.05,y-0.25,P.z+0.2)); }); return g; },
  lab:K=>{ const P=jdLoc(K,"cabin_lav"); if(!P) return []; const X=P.z+K.L/2, y=jdFl(K,X), hw=K.half(X,y+1); return [["المرحاض (Lavatory)","Lavatory",[hw-0.55,y+2.1,P.z]],["مرحاض بالتفريغ (Vacuum toilet)","Vacuum toilet",[hw-0.65,y+0.7,P.z-0.35]],["خزان النفايات تحت الأرضية","Waste tank below the floor",[hw-0.5,y-0.1,P.z+0.2]]]; }};
ED.overhead_bins={layer:"int",mk:"edcrm",cat:"W",cam:[Math.PI-0.7,1.0],
  geo:K=>{ const L=K.L, g=[]; for(let X=0.25*L;X<=0.75*L;X+=1.25){ const y=jdFl(K,X)+2.05, hw=K.half(X,y); if(hw<1.2) continue; [-1,1].forEach(s=>g.push(edBox(0.6,0.36,1.15,s*(hw-0.6),y,K.Z(X)))); } return g; },
  lab:K=>{ const X=0.5*K.L, y=jdFl(K,X)+2.05, hw=K.half(X,y); return [["خزانة أمتعة علوية","Overhead stowage bin",[hw-0.6,y+0.3,K.Z(X)]],["مزلاج الخزانة","Bin latch",[-(hw-0.6),y-0.1,K.Z(X)+0.55]]]; }};
ED.cargo_floor_pdu={layer:"int",mk:"edgry",cat:"W",cam:[Math.PI-0.7,1.0],
  geo:K=>{ const d=jdDoor(K,/^FWD CARGO$/); if(!d) return []; const g=[], Xc=d.X, y=ringAt(K.c,Xc).zb+0.34, r=1.1;
    [-1,1].forEach(s=>g.push(edBox(0.07,0.07,11,s*0.95,y,K.Z(Xc))));
    for(let z=-5;z<=5;z+=1.0) g.push(edCyl(0.035,1.9,"x",0,y+0.02,K.Z(Xc)+z)); for(let i=0;i<3;i++) g.push(edBox(0.3,0.1,0.35,0.0,y-0.03,K.Z(Xc)+(i-1)*3.3)); return g; },
  lab:K=>{ const d=jdDoor(K,/^FWD CARGO$/); if(!d) return []; const y=ringAt(K.c,d.X).zb+0.34; return [["وحدة تحريك الحاويات (PDU)","Power drive unit (PDU)",[0,y+0.25,K.Z(d.X)]],["بكرات الأرضية","Roller bed",[0.7,y+0.15,K.Z(d.X)+2.0]],["سكة التثبيت الجانبية","Side guide rail",[0.95,y+0.2,K.Z(d.X)-2.2]]]; }};
ED.escape_slide={layer:"ext",mk:"edorg",cat:"W",sel:true,cam:[Math.PI+1.1,1.3],
  geo:K=>{ const d=jdDoor(K,/^(M2|2)$/); if(!d) return []; const x=-(K.half(d.X,d.z)-0.15), Z=K.Z(d.X), g=[]; g.push(edBox(0.28,0.34,Math.min(1.0,d.w),x,d.z-d.h*0.35,Z)); g.push(edCyl(0.07,0.5,"z",x,d.z-d.h*0.5,Z)); g.push(edBar([x-0.1,d.z-d.h*0.45,Z-0.4],[x-0.1,d.z-d.h*0.45,Z+0.4],0.03)); return g; },
  lab:K=>{ const d=jdDoor(K,/^(M2|2)$/); if(!d) return []; const x=-(K.half(d.X,d.z)-0.15), Z=K.Z(d.X); return [["حزمة الزحليقة المطوية","Packed slide",[x,d.z-d.h*0.1,Z]],["أسطوانة الغاز للنفخ","Inflation gas bottle",[x,d.z-d.h*0.65,Z]],["قضيب التسليح (Girt bar)","Girt bar",[x-0.1,d.z-d.h*0.38,Z+0.4]]]; }};
