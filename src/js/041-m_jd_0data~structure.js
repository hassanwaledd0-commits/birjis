/* ---------- structure ---------- */
ED.frames={layer:"int",mk:"edgld",cat:"W",cam:[Math.PI-0.8,1.1],
  geo:K=>{ const L=K.L, g=[]; jdRange(0.2*L,0.8*L,13).forEach((X,i)=>{ g.push(jdLoop(K,X,0.035,0.03)); if(i%3===0) g.push(edBox(2*(K.half(X,jdFl(K,X))-0.12),0.08,0.07,0,jdFl(K,X)-0.05,K.Z(X))); }); return g; },
  lab:K=>{ const X=0.5*K.L, q=jdPt(K,X,0.25,0.05); return [["إطار رئيسي (حلقة الجسم)","Main frame (fuselage ring)",jdPt(K,X,Math.PI/2+0.4,0.03)],["وصلة قص بين الإطار والجلد","Shear tie to the skin",q],["ربط الإطار بعارضة الأرضية","Frame-to-floor-beam connection",[0.6,jdFl(K,X)-0.05,K.Z(X)]]]; }};
ED.stringers={layer:"int",mk:"edcy",cat:"W",cam:[Math.PI-0.8,1.1],
  geo:K=>{ const L=K.L, X0=0.24*L, X1=0.78*L, g=[]; for(let i=0;i<22;i++){ const a=i/22*Math.PI*2; g.push(edBar(jdPt(K,X0,a,0.09),jdPt(K,X1,a,0.09),0.022)); }
    [0.3,0.5,0.7].forEach(f=>g.push(jdLoop(K,X0+(X1-X0)*f,0.02,0.06))); return g; },
  lab:K=>{ const L=K.L, Xm=0.5*L; return [["مقوّية طولية (Stringer)","Stringer (hat section)",jdPt(K,Xm,Math.PI/2-0.3,0.09)],["إطار تمرّ منه المقوّيات","Frame the stringers pass through",jdPt(K,0.24*L+(0.78-0.24)*L*0.5,-0.4,0.06)]]; }};
ED.floor_beams={layer:"int",mk:"edorg",cat:"W",cam:[Math.PI-0.8,1.15],
  geo:K=>{ const L=K.L, g=[]; for(let X=0.2*L;X<=0.8*L;X+=0.03*L){ const y=jdFl(K,X), w=2*(K.half(X,y)-0.12); g.push(edBox(w,0.1,0.08,0,y-0.06,K.Z(X))); }
    [-0.55,0.55].forEach(f=>g.push(edBox(0.07,0.1,0.6*L,f*K.ring(0.5*L).hw*0.6,jdFl(K,0.5*L)-0.06,K.Z(0.5*L)))); return g; },
  lab:K=>{ const X=0.5*K.L, y=jdFl(K,X); return [["عارضة عرضية للأرضية","Cross floor beam",[1.0,y,K.Z(X)]],["عارضة طولية (Rail)","Longitudinal rail",[K.ring(X).hw*0.33,y,K.Z(X+K.L*0.1)]]]; }};
ED.seat_track={layer:"int",mk:"edgld",cat:"W",cam:[Math.PI-0.8,1.15],
  geo:K=>{ const Lg=K.L, X0=0.2*Lg, X1=0.8*Lg, X=0.5*Lg, y=jdFl(K,X)+0.03, hw=K.half(X,y), g=[]; [-0.62,-0.3,0,0.3,0.62].forEach(f=>{ const x=f*(hw-0.4); g.push(edBox(0.05,0.03,X1-X0,x,y,K.Z(X)));
      for(let s=X0;s<X1;s+=2.2) g.push(edBox(0.09,0.035,0.09,x,y+0.02,K.Z(s))); }); return g; },
  lab:K=>{ const X=0.5*K.L, y=jdFl(K,X)+0.05, hw=K.half(X,y); return [["سكة المقاعد (Seat track)","Seat track",[0.3*(hw-0.4),y,K.Z(X)]],["ثقب التثبيت (Stud fitting)","Stud fitting",[0,y+0.05,K.Z(X+0.5)]]]; }};
ED.wing_root_fitting={layer:"int",mk:"edorg",cat:"W",cam:[Math.PI-0.9,1.0],
  geo:K=>{ const W=K.W, g=[]; [-1,1].forEach(s=>[0.18,0.62].forEach(f=>{ const p=edWp(W,0.03,f,0); g.push(edBox(0.55,0.5,0.45,s*p.x,p.y,p.z)); for(let i=0;i<3;i++) g.push(edCyl(0.05,0.62,"y",s*p.x+(i-1)*0.14,p.y,p.z)); })); return g; },
  lab:K=>{ const W=K.W, a=edWp(W,0.03,0.18,0), b=edWp(W,0.03,0.62,0); return [["وصلة جذر الجناح الأمامية","Front wing-root fitting",[a.x,a.y+0.4,a.z]],["وصلة جذر الجناح الخلفية","Rear wing-root fitting",[b.x,b.y+0.4,b.z]],["مسامير الربط بالجسم","Attachment bolts",[a.x+0.14,a.y-0.35,a.z]]]; }};
ED.belly_fairing={layer:"ext",mk:"edorg",cat:"W",sel:true,cam:[Math.PI-0.6,1.5],
  geo:K=>{ const f=K.c.fairing||[0.32*K.L,0.62*K.L,0.4], X0=f[0], X1=f[1], Xc=(X0+X1)/2, r=K.ring(Xc), h=Math.max(0.8,f[2]*2); return [edSph(1,0,K.bot(Xc)-h*0.05,K.Z(Xc),r.hw*0.9,h,(X1-X0)/2*1.02)]; },
  lab:K=>{ const f=K.c.fairing||[0.32*K.L,0.62*K.L,0.4], Xc=(f[0]+f[1])/2, r=K.ring(Xc); return [["الغطاء البطني (Belly fairing)","Wing-to-body belly fairing",[0,K.bot(Xc)-0.1,K.Z(Xc)]],["حافة الغطاء مع الجناح","Wing-fairing junction",[r.hw*0.85,K.bot(Xc)+0.3,K.Z(f[0]+(f[1]-f[0])*0.3)]]]; }};
ED.tail_cone={layer:"ext",mk:"edorg",cat:"W",sel:true,cam:[Math.PI+0.6,1.15],
  geo:K=>{ const c=K.c, X0=c.tail||0.8*K.L, X1=K.L-0.5, xs=jdRange(X0,X1,7), g=[]; xs.forEach(X=>g.push(jdLoop(K,X,0.05,-0.05)));
    for(let i=0;i<10;i++){ const a=i/10*Math.PI*2; for(let k=0;k<xs.length-1;k++) g.push(edBar(jdPt(K,xs[k],a,-0.05),jdPt(K,xs[k+1],a,-0.05),0.04)); }
    if(c.apuX) g.push(edBox(0.9,0.8,1.5,0,K.zc(c.apuX),K.Z(c.apuX-0.2))); return g; },
  lab:K=>{ const c=K.c, X0=c.tail||0.8*K.L; return [["مخروط الذيل (Tail cone)","Tail cone",jdPt(K,X0+(K.L-X0)*0.45,Math.PI/2,-0.02)],["غرفة الـ APU","APU compartment",[0.6,K.zc(c.apuX||K.L-1)+0.3,K.Z((c.apuX||K.L-1)-0.2)]]]; }};
