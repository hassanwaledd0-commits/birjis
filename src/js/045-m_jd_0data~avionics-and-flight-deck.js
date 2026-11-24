/* ---------- avionics and flight deck ---------- */
ED.avionics_bay={layer:"int",mk:"edgry",cat:"W",cam:[Math.PI-0.8,1.05],
  geo:K=>{ const P=jdLoc(K,"avionics_bay"); if(!P) return []; const g=[]; [-0.9,0,0.9].forEach(dx=>{ g.push(edBox(0.7,0.6,0.5,P.x+dx,P.y,P.z)); for(let i=0;i<3;i++) edC("edcy",edBox(0.62,0.04,0.02,P.x+dx,P.y-0.15+i*0.15,P.z-0.27)).forEach(q=>g.push(q)); }); g.push(edBox(2.8,0.04,0.7,P.x,P.y-0.34,P.z)); return g; },
  lab:K=>{ const P=jdLoc(K,"avionics_bay"); if(!P) return []; return [["رفّ إلكترونيات","Equipment rack",[P.x-0.9,P.y+0.45,P.z]],["رفّ إلكترونيات وسطي","Centre rack",[P.x,P.y+0.45,P.z]],["رفّ إلكترونيات يميني","Right rack",[P.x+0.9,P.y+0.45,P.z]]]; }};
ED.fmc={layer:"int",mk:"edblu",cat:"W",cam:[Math.PI-0.8,1.05],
  geo:K=>{ const P=jdLoc(K,"fmc"); if(!P) return []; return [edBox(0.32,0.2,0.46,P.x-0.2,P.y,P.z),edBox(0.32,0.2,0.46,P.x+0.2,P.y,P.z),edBox(0.1,0.03,0.1,P.x-0.2,P.y+0.12,P.z-0.1),edBox(0.1,0.03,0.1,P.x+0.2,P.y+0.12,P.z-0.1)]; },
  lab:K=>{ const P=jdLoc(K,"fmc"); if(!P) return []; return [["حاسوب إدارة الطيران 1","FMC 1",[P.x-0.2,P.y+0.3,P.z]],["حاسوب إدارة الطيران 2","FMC 2",[P.x+0.2,P.y+0.3,P.z]]]; }};
ED.transponder={layer:"int",mk:"edgld",cat:"W",cam:[Math.PI-0.8,1.05],
  geo:K=>{ const P=jdLoc(K,"transponder"); if(!P) return []; return [edBox(0.3,0.16,0.4,P.x-0.18,P.y,P.z),edBox(0.3,0.16,0.4,P.x+0.18,P.y,P.z),edBar([P.x,P.y+0.1,P.z],[P.x,P.y+0.8,P.z-0.2],0.02)]; },
  lab:K=>{ const P=jdLoc(K,"transponder"); if(!P) return []; return [["جهاز الإرسال المستجيب 1","Transponder 1",[P.x-0.18,P.y+0.3,P.z]],["جهاز الإرسال المستجيب 2","Transponder 2",[P.x+0.18,P.y+0.3,P.z]],["كبل الهوائي","Antenna cable",[P.x,P.y+0.7,P.z-0.2]]]; }};
ED.cabin_pressure_controller={layer:"int",mk:"edcy",cat:"W",cam:[Math.PI-0.8,1.05],
  geo:K=>{ const P=jdLoc(K,"cabin_pressure_controller"); if(!P) return []; return [edBox(0.36,0.2,0.46,P.x,P.y,P.z),edCyl(0.04,0.2,"y",P.x-0.12,P.y+0.2,P.z),edCyl(0.04,0.2,"y",P.x+0.12,P.y+0.2,P.z),edBar([P.x,P.y,P.z+0.23],[P.x,P.y,P.z+0.7],0.025)]; },
  lab:K=>{ const P=jdLoc(K,"cabin_pressure_controller"); if(!P) return []; return [["حاسوب ضغط المقصورة","Cabin pressure controller",[P.x,P.y+0.25,P.z]],["مجسّات الضغط","Pressure sensors",[P.x,P.y+0.45,P.z]]]; }};
ED.display_units={layer:"int",mk:"edblk",cat:"W",cam:[Math.PI-0.45,1.2],
  geo:K=>{ const X=jdCkX(K)-0.9, y=jdCkY(K,X)+1.0, n=jdKey(K)==="b737"?5:6, g=[]; for(let i=0;i<n;i++){ const x=(i-(n-1)/2)*0.34; g.push(edBox(0.3,0.26,0.05,x,y+(i%2?0.0:0.0),K.Z(X))); edC("edcy",edBox(0.26,0.2,0.012,x,y,K.Z(X)-0.03)).forEach(q=>g.push(q)); } g.push(edBox(n*0.34,0.05,0.2,0,y-0.2,K.Z(X)+0.05)); return g; },
  lab:K=>{ const X=jdCkX(K)-0.9, y=jdCkY(K,X)+1.0; return [["شاشة طيران رئيسية (PFD)","Primary flight display",[-0.6,y+0.25,K.Z(X)-0.1]],["شاشة الملاحة (ND)","Navigation display",[0.15,y+0.25,K.Z(X)-0.1]],["شاشة المحركات (EICAS/ECAM)","Engine display (EICAS)",[0.8,y+0.25,K.Z(X)-0.1]]]; }};
ED.jb_hump={layer:"ext",mk:"edorg",cat:"W",sel:true,cam:[Math.PI-0.9,1.0],
  geo:K=>{ const L=K.L, xs=jdRange(0.12*L,0.34*L,8), g=[]; xs.forEach(X=>{ const pts=[]; for(let i=0;i<=10;i++){ const a=Math.PI*(0.08+0.84*i/10); pts.push(jdPt(K,X,a,-0.06)); } for(let i=0;i<10;i++) g.push(edBar(pts[i],pts[i+1],0.06)); });
    for(let k=0;k<5;k++){ const a=Math.PI*(0.2+0.6*k/4); for(let i=0;i<xs.length-1;i++) g.push(edBar(jdPt(K,xs[i],a,-0.06),jdPt(K,xs[i+1],a,-0.06),0.05)); } return g; },
  lab:K=>{ const L=K.L, X=0.22*L; return [["حدبة الطابق العلوي","Upper-deck hump",jdPt(K,X,Math.PI/2,-0.05)],["منطقة التقاء الحدبة بالسقف","Hump-to-crown blend",jdPt(K,0.34*L,Math.PI*0.55,-0.05)]]; }};
ED.jb_body_gear={gearDep:true,layer:"int",mk:"edblu",cat:"W",both:true,cam:[Math.PI/2-0.5,1.05],
  geo:K=>{ const c=K.c, m=(c.mg||[])[1]; if(!m) return []; const [gy,gx]=m, big=jdBig(K), sr=big?0.2:0.13, wo=big?0.55:0.42, wid=big?0.5:0.4, wr=c.wheelR, top=ringAt(c,gx).zb+0.4, Hh=top-wr, y1=wr+Hh*0.46, zg=K.Z(gx), ax=jdAx(K), g=[];
    g.push(edCyl(sr*1.05,top-y1,"y",gy,(top+y1)/2,zg),edCyl(sr*1.25,0.16,"y",gy,y1,zg));
    if(ax.length>1) g.push(edBar([gy,wr,K.Z(gx+ax[0])],[gy,wr,K.Z(gx+ax[ax.length-1])],0.13));
    ax.forEach(d=>[-wo,wo].forEach(dx=>{ g.push(edCyl(wr*1.02,wid,"x",gy+dx,wr,K.Z(gx+d))); g.push(edBar([gy,wr,K.Z(gx+d)],[gy+dx,wr,K.Z(gx+d)],0.07)); }));
    g.push(edBar([gy,top-0.25,zg-0.15],[gy,wr+Hh*0.5,zg-1.1],0.07),edBar([gy,top-0.25,zg+0.15],[gy,wr+Hh*0.45,zg+0.95],0.07)); return g; },
  lab:K=>{ const c=K.c, m=(c.mg||[])[1]; if(!m) return []; const [gy,gx]=m, top=ringAt(c,gx).zb+0.4; return [["ساق جهاز الهبوط الجسمي","Body gear leg",[gy,top-0.2,K.Z(gx)]],["عارضة الـ bogie","Bogie beam",[gy,c.wheelR+0.2,K.Z(gx)]],["العجلات والفرامل (4 عجلات)","Wheels and brakes (4 wheels)",[gy+0.55,c.wheelR,K.Z(gx+ (jdAx(K)[0]||0))]]]; }};
