/* ---------- (ed) batch 3: crew oxygen system, static dischargers, air-data sensors, keel beam. See m_ed737.js. ---------- */
/* crew oxygen (item 5): two cylinders under the flight deck floor, a regulator on each, and one mask stowage box per crew seat, joined by thin lines */
ED.oxygen_crew={layer:"int",mk:"edgrn",
  geo:K=>{ const Z=K.Z, g=[], y0=2.0;
    [0.85,1.25].forEach(x=>{ g.push(edCyl(0.17,0.78,"z",x,y0,Z(4.2))); g.push(edSph(0.17,x,y0,Z(4.2)-0.39,1,1,0.8)); g.push(edBox(0.2,0.2,0.2,x,y0+0.28,Z(4.55))); g.push(edCyl(0.05,0.1,"y",x,y0+0.43,Z(4.55))); });   /* cylinders + regulators */
    const masks=[[-0.55,3.45,4.7],[0.55,3.45,4.7],[-0.9,3.3,5.4],[0.9,3.3,5.4]];
    masks.forEach(m=>{ g.push(edBox(0.26,0.2,0.2,m[0],m[1],Z(m[2]))); g.push(edBar([1.05,y0+0.43,Z(4.55)],[m[0],m[1]-0.1,Z(m[2])],0.012)); });
    return g; },
  lab:K=>{ const Z=K.Z; return [["أسطوانة أكسجين الطاقم","Crew oxygen cylinder",[1.05,2.35,Z(3.8)]],["المنظّم","Regulator",[1.25,2.6,Z(4.55)]],["كمامة الكابتن","Captain mask",[-0.55,3.65,Z(4.7)]],["كمامة مساعد الطيار","First-officer mask",[0.55,3.65,Z(4.7)]],["كمامة المراقب","Observer mask",[0.9,3.5,Z(5.4)]]]; }};
/* static dischargers (item 6): thin rods along the trailing edges of the wing tips, the tailplane and the fin tip, bleeding off the static charge */
ED.static_wicks={layer:"ext",mk:"edblk",both:true,
  geo:K=>{ const g=[]; const add=(p,len)=>{ g.push(edBar([p.x,p.y,p.z],[p.x,p.y,p.z+len],0.012)); g.push(edSph(0.022,p.x,p.y,p.z+len,1,1,1)); };
    [0.82,0.88,0.94,0.99].forEach(u=>add(edWp(K.W,u,1.0,0),0.42));      /* aileron and wing tip */
    [0.6,0.8,0.97].forEach(u=>add(edWp(K.H,u,1.0,0),0.34));              /* elevator tip */
    g.push(edBar([0,K.F.pt(0.97,1,0).y,K.F.pt(0.97,1,0).z],[0,K.F.pt(0.97,1,0).y,K.F.pt(0.97,1,0).z+0.4],0.012));   /* fin tip */
    return g; },
  lab:K=>{ const a=edWp(K.W,0.94,1.0,0), b=edWp(K.H,0.8,1.0,0); return [["ذباذب التفريغ الساكن (الجناح)","Static wicks (wing)",[a.x,a.y+0.3,a.z+0.35]],["ذباذب التفريغ الساكن (الذيل الأفقي)","Static wicks (tailplane)",[b.x,b.y+0.3,b.z+0.3]]]; }};
/* air-data sensors that were only markers: total air temperature probe and the two angle-of-attack vanes */
ED.tat_probe={layer:"ext",mk:"edmet",
  geo:K=>{ const X=3.0, y=K.zc(X)+0.55, hw=K.half(X,y); return [edCyl(0.05,0.16,"x",hw+0.05,y,K.Z(X)),edBox(0.1,0.12,0.22,hw+0.06,y,K.Z(X))]; },
  lab:K=>{ const X=3.0, y=K.zc(X)+0.55, hw=K.half(X,y); return [["مجسّ الحرارة الكلية (TAT)","Total air temperature probe",[hw+0.1,y+0.3,K.Z(X)]]]; }};
ED.aoa_vane={layer:"ext",mk:"edmet",
  geo:K=>{ const X=4.7, y=K.zc(X)+0.12, hw=K.half(X,y), g=[]; [-1,1].forEach(s=>{ g.push(edCyl(0.12,0.05,"x",s*(hw+0.02),y,K.Z(X))); g.push(edBox(0.03,0.04,0.34,s*(hw+0.06),y,K.Z(X)+0.1)); g.push(edBox(0.03,0.12,0.06,s*(hw+0.06),y,K.Z(X)+0.27)); }); return g; },
  lab:K=>{ const X=4.7, y=K.zc(X)+0.12, hw=K.half(X,y); return [["مجسّ زاوية الهجوم (يمين)","Angle-of-attack vane (right)",[hw+0.1,y+0.3,K.Z(X)]],["مجسّ زاوية الهجوم (يسار)","Angle-of-attack vane (left)",[-hw-0.1,y+0.3,K.Z(X)]]]; }};
/* keel beam: the strong member along the belly that carries the load through the wheel-well and wing-box cut-out */
ED.keel_beam={layer:"int",mk:"edgld",
  geo:K=>{ const y=K.bot(18.0)+0.22, g=[]; g.push(edBox(0.34,0.28,8.2,0,y,K.Z(18.2))); g.push(edBox(0.8,0.05,8.2,0,y-0.12,K.Z(18.2))); g.push(edBox(0.8,0.05,8.2,0,y+0.14,K.Z(18.2))); return g; },
  lab:K=>{ const y=K.bot(18.0)+0.22; return [["عارضة الكيل (Keel beam)","Keel beam",[0.2,y+0.4,K.Z(18.2)]]]; }};
edFinish();
