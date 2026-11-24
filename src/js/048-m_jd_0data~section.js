/* ---------- (jd) v29, part 2: 26 NEW parts of the 747 (owner: «الك صلاحيه اضافه اكثر من 20 قطعه»). The text of every card is generated from tools/jd_gen.py (m_jd_data.js: JD_DATA);
   the geometry is here, written in the aircraft's own proportions (fractions of L, rings, wing loft), like m_jd_a.js.  Parts marked sel are drawn only while selected (highlight overlays on
   existing surfaces); the others are real objects (the cabin items, the cockpit, the holds, the wheel wells) shown in the X-ray. ---------- */
const jdEdges=(pts,pairs,r)=>pairs.map(e=>edBar(pts[e[0]].toArray?pts[e[0]].toArray():pts[e[0]],pts[e[1]].toArray?pts[e[1]].toArray():pts[e[1]],r||0.03));
const JD_BOX=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
/* a wire-frame box between world coordinates */
function jdFrame(x0,x1,y0,y1,z0,z1,r){ const p=[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]]; return jdEdges(p,JD_BOX,r||0.035); }
/* ribbons over the wing surface (u = span fraction, f = chord fraction, k = +1 top / -1 bottom) */
function jdPanels(W,segs,f0,f1,k,e){ const g=[]; segs.forEach(([u0,u1])=>{ const pairs=[], n=6; for(let i=0;i<=n;i++){ const u=u0+(u1-u0)*i/n; pairs.push([W.pt(u,f0,k,e),W.pt(u,f1,k,e)]); }
    g.push(edStrip(pairs)); for(let i=0;i<n;i++){ g.push(edBar(pairs[i][0].toArray(),pairs[i+1][0].toArray(),0.04),edBar(pairs[i][1].toArray(),pairs[i+1][1].toArray(),0.04)); }
    g.push(edBar(pairs[0][0].toArray(),pairs[0][1].toArray(),0.04),edBar(pairs[n][0].toArray(),pairs[n][1].toArray(),0.04)); }); return g; }
const jdPm=(W,segs,f,k,e)=>{ const s=segs[Math.floor(segs.length/2)], u=(s[0]+s[1])/2; return W.pt(u,f,k,e).toArray(); };
function jdBoxW(W,u0,u1,f0,f1,k){ const a=(u,f,s)=>W.pt(u,f,s*k,0), P=[a(u0,f0,1),a(u1,f0,1),a(u1,f1,1),a(u0,f1,1),a(u0,f0,-1),a(u1,f0,-1),a(u1,f1,-1),a(u0,f1,-1)]; const g=jdEdges(P,JD_BOX,0.03);
  g.push(edStrip([[P[0],P[3]],[P[1],P[2]]]),edStrip([[P[4],P[7]],[P[5],P[6]]])); return g; }
const jdLowerHold=(K,X0,X1)=>{ const yb=ringAt(K.c,(X0+X1)/2).zb+0.25, yt=jdFl(K,(X0+X1)/2)-0.3, hw=K.half((X0+X1)/2,yb+0.9)-0.4; return {yb,yt,hw}; };
const jdCk=K=>{ const X=jdCkX(K), yf=jdCkY(K,X); return {X,yf,Z:K.Z(X),hw:K.half(X,yf+0.8)}; };
const jdCkLoc=(ac,dy,dx)=>{ const c=GEO[ac], cab=JD_CK[ac], X=c.rad+(c.fd-c.rad)*0.5+(dx||0), r=ringAt(c,X); return ["F",X/c.L,"c",(r.zb+cab.zf+cab.dz+dy)-r.zc]; };

const JD_GEO={
 /* ---- wing and tail surfaces (only the 747 has these panel breaks) ---- */
 jb_winglet:{layer:"ext",mk:"edorg",sel:true,both:true,cam:[Math.PI-0.6,0.9],
  geo:K=>{ const W=K.W, wl=K.c.wl||[2.4,0.9,1.83], P0=edWp(W,1,0,0), P1=edWp(W,1,1,0), h=wl[2], T0=P0.clone().add(new THREE.Vector3(h*0.27,h,wl[0])), T1=T0.clone().add(new THREE.Vector3(0,0,wl[1])), g=[edStrip([[P0,P1],[T0,T1]])];
    [[P0,T0],[P1,T1],[P0,P1],[T0,T1]].forEach(e=>g.push(edBar(e[0].toArray(),e[1].toArray(),0.05))); [0.33,0.66].forEach(t=>g.push(edBar(P0.clone().lerp(T0,t).toArray(),P1.clone().lerp(T1,t).toArray(),0.03))); return g; },
  lab:K=>{ const W=K.W, wl=K.c.wl||[2.4,0.9,1.83], P0=edWp(W,1,0,0), P1=edWp(W,1,1,0), T0=P0.clone().add(new THREE.Vector3(wl[2]*0.27,wl[2],wl[0])); return [["الجنيح الطرفي المائل","Canted winglet",[T0.x,T0.y*0.97,T0.z+0.4]],["وصلته بطرف الجناح","Joint with the wingtip",[P0.x,P0.y,P0.z+0.4]],["ضوء الطرف","Tip light",[T0.x,T0.y,T0.z+wl[1]+0.2]]]; }},
 jb_vc_flap:{layer:"ext",mk:"edorg",sel:true,both:true,cam:[Math.PI-0.5,0.8],
  geo:K=>jdPanels(K.W,[[0.385,0.50],[0.51,0.625],[0.635,0.76],[0.845,0.925],[0.935,0.975]],0,0.1,1,0.05),
  lab:K=>{ const S=[[0.385,0.50],[0.51,0.625],[0.635,0.76],[0.845,0.925],[0.935,0.975]], W=K.W; return [["شريحة متغيرة التحدب","Variable camber flap",jdPm(W,S,0.05,1,0.4)],["فجوة عند العمود (Pylon gap)","Gap at the pylon",W.pt(0.505,0.05,1,0.4).toArray()]]; }},
 jb_flap_inboard:{layer:"ext",mk:"edorg",sel:true,both:true,cam:[Math.PI-0.5,0.8],
  geo:K=>jdPanels(K.W,[[0.075,0.2414]],0.72,1,1,0.05),
  lab:K=>[["القلاب الداخلي (ثلاثي الشقوق)","Inboard flap (triple slotted)",K.W.pt(0.16,0.86,1,0.4).toArray()],["حافة القلاب الخلفية","Flap trailing edge",K.W.pt(0.16,1,1,0.3).toArray()]]},
 jb_flap_outboard:{layer:"ext",mk:"edorg",sel:true,both:true,cam:[Math.PI-0.5,0.8],
  geo:K=>jdPanels(K.W,[[0.2464,0.47],[0.48,0.72]],0.72,1,1,0.05),
  lab:K=>[["القلاب الخارجي (ثلاثي الشقوق)","Outboard flap (triple slotted)",K.W.pt(0.36,0.86,1,0.4).toArray()],["الفجوة بين مجموعتي القلابات","Gap between the flap groups",K.W.pt(0.475,0.9,1,0.4).toArray()]]},
 jb_aileron_inboard:{layer:"ext",mk:"edorg",sel:true,both:true,cam:[Math.PI-0.5,0.8],
  geo:K=>jdPanels(K.W,[[0.74,0.83]],0.76,1,1,0.05),
  lab:K=>[["الجنيحة الداخلية","Inboard aileron",K.W.pt(0.785,0.88,1,0.4).toArray()],["خط المفصلات","Hinge line",K.W.pt(0.785,0.76,1,0.3).toArray()]]},
 jb_aileron_outboard:{layer:"ext",mk:"edorg",sel:true,both:true,cam:[Math.PI-0.5,0.8],
  geo:K=>jdPanels(K.W,[[0.84,0.97]],0.76,1,1,0.05),
  lab:K=>[["الجنيحة الخارجية","Outboard aileron",K.W.pt(0.9,0.88,1,0.4).toArray()],["خط المفصلات","Hinge line",K.W.pt(0.9,0.76,1,0.3).toArray()]]},
 jb_yehudi:{layer:"ext",mk:"edorg",sel:true,both:true,cam:[Math.PI-0.7,0.8],
  geo:K=>jdPanels(K.W,[[0.0,0.2414]],0.8,1,1,0.05),
  lab:K=>[["امتداد الحافة الخلفية الداخلي","Inboard trailing-edge extension",K.W.pt(0.12,0.9,1,0.4).toArray()],["نقطة الانكسار (Yehudi)","Break point (Yehudi)",K.W.pt(0.2414,1,1,0.3).toArray()]]},
 jb_reserve_tank:{layer:"int",mk:"edyel",both:true,cam:[Math.PI-0.6,0.9],
  geo:K=>jdBoxW(K.W,0.8,0.95,0.18,0.62,0.8),
  lab:K=>[["خزان الوقود الاحتياطي","Reserve fuel tank",K.W.pt(0.875,0.4,1,0.4).toArray()],["الجدار بين العمودين","Spar-to-spar boundary",K.W.pt(0.8,0.18,0,0.2).toArray()]]},
 jb_upper_windows:{layer:"ext",mk:"edorg",sel:true,both:true,cam:[Math.PI/2+0.3,1.35],
  geo:K=>{ const w=(K.c.win||[])[1]; if(!w) return []; const y=w[2], g=[], n=Math.max(4,Math.floor((w[1]-w[0])/0.95)); for(let i=0;i<=n;i++){ const X=w[0]+(w[1]-w[0])*i/n, x=K.half(X,y)+0.035; g.push(edTor(0.5,0.03,"x",0,0,0).scale(1,0.55,0.4).translate(x,y,K.Z(X))); } return g; },
  lab:K=>{ const w=(K.c.win||[])[1]; if(!w) return []; const y=w[2], X=(w[0]+w[1])/2; return [["نوافذ الطابق العلوي","Upper-deck windows",[K.half(X,y)+0.1,y+0.35,K.Z(X)]],["إطار النافذة","Window frame",[K.half(w[0],y)+0.1,y,K.Z(w[0])]]]; }},
 jb_bulk_door:{layer:"ext",mk:"edorg",sel:true,cam:[Math.PI/2+0.5,1.3],
  geo:K=>{ const d=jdDoor(K,/^BULK$/); return d?jdDoorGeo(K,d,1,true):[]; },
  lab:K=>{ const d=jdDoor(K,/^BULK$/); return d?jdDoorLab(K,d,1,"باب الشحن السائب","Bulk cargo door"):[]; }},
 /* ---- gear, structure, ground equipment ---- */
 wheel_well_main:{gearDep:false,layer:"int",mk:"edgry",cam:[Math.PI/2-0.6,1.1],
  geo:K=>{ const c=K.c, big=jdBig(K), wo=big?0.55:0.42, g=[]; (c.mg||[]).forEach(([gy,gx,gl])=>[-1,1].forEach(s=>{ const top=gy>c.fw/2?c.wz[0]-0.7:ringAt(c,gx).zb+0.4, hl=(gl||4)/2+0.7; g.push(...jdFrame(s*gy-wo-0.45,s*gy+wo+0.45,c.wheelR*0.6,top+0.25,K.Z(gx)-hl,K.Z(gx)+hl,0.035)); })); return g; },
  lab:K=>{ const c=K.c, m=(c.mg||[])[0]; if(!m) return []; const top=m[0]>c.fw/2?c.wz[0]-0.7:ringAt(c,m[1]).zb+0.4; return [["حجرة عجلات الجناح","Wing-gear wheel well",[m[0],top,K.Z(m[1])]],["حجرة عجلات الجسم","Body-gear wheel well",(c.mg[1]?[c.mg[1][0],ringAt(c,c.mg[1][1]).zb+0.5,K.Z(c.mg[1][1])]:[m[0],top,K.Z(m[1])])]]; }},
 wheel_well_nose:{layer:"int",mk:"edgry",cam:[Math.PI-0.7,1.1],
  geo:K=>{ const c=K.c, X=(c.ng||[5])[0], zb=ringAt(c,X).zb; return jdFrame(-0.85,0.85,zb-0.05,zb+1.6,K.Z(X-0.9),K.Z(X+1.6),0.04); },
  lab:K=>{ const c=K.c, X=(c.ng||[5])[0], zb=ringAt(c,X).zb; return [["حجرة عجلات الأنف","Nose wheel well",[0.85,zb+1.6,K.Z(X)]],["الجدار الأمامي للحجرة","Forward wall",[0,zb+0.8,K.Z(X-0.9)]]]; }},
 gear_tow_fitting:{gearDep:true,layer:"ext",mk:"edorg",sel:true,cam:[Math.PI-0.6,1.15],
  geo:K=>{ const c=K.c, X=(c.ng||[5])[0], z=K.Z(X)-0.5, y=c.nwR+0.1; return [edTor(0.1,0.03,"y",0,y,z-0.12),edCyl(0.035,0.45,"x",0,y,z),edBox(0.2,0.14,0.2,0,y,z+0.05)]; },
  lab:K=>{ const c=K.c, X=(c.ng||[5])[0], z=K.Z(X)-0.5; return [["عروة السحب","Tow lug",[0,c.nwR+0.3,z-0.15]],["مسمار الربط","Connecting pin",[0.25,c.nwR+0.1,z]]]; }},
 jack_points:{layer:"ext",mk:"edorg",sel:true,both:true,cam:[Math.PI-0.6,1.35],
  geo:K=>{ const W=K.W, p=W.pt(0.3,0.4,-1,0), c=K.c, X=Math.max(1.5,(c.ng||[5])[0]-1.2), g=[edCyl(0.05,0.35,"y",p.x,p.y-0.17,p.z),edCyl(0.14,0.06,"y",p.x,p.y-0.36,p.z)]; g.push(edCyl(0.05,0.35,"y",0,K.bot(X)-0.17,K.Z(X)),edCyl(0.14,0.06,"y",0,K.bot(X)-0.36,K.Z(X))); return g; },
  lab:K=>{ const W=K.W, p=W.pt(0.3,0.4,-1,0), c=K.c, X=Math.max(1.5,(c.ng||[5])[0]-1.2); return [["نقطة رفع تحت الجناح","Wing jacking point",[p.x,p.y-0.45,p.z]],["نقطة رفع الأنف","Nose jacking point",[0,K.bot(X)-0.45,K.Z(X)]]]; }},
 drain_mast:{layer:"ext",mk:"edorg",sel:true,cam:[Math.PI-0.6,1.5],
  geo:K=>{ const g=[]; [0.21,0.75].forEach(f=>{ const X=f*K.L, y=K.bot(X); g.push(edCyl(0.055,0.5,"y",0,y-0.2,K.Z(X)),edBox(0.03,0.22,0.3,0,y-0.28,K.Z(X)+0.12)); }); return g; },
  lab:K=>{ const g=[], X=0.21*K.L, X2=0.75*K.L; return [["ماسورة تصريف المطبخ","Galley drain mast",[0,K.bot(X)-0.55,K.Z(X)]],["ماسورة تصريف المرحاض","Lavatory drain mast",[0,K.bot(X2)-0.55,K.Z(X2)]]]; }},
 fuel_vent_scoop:{layer:"ext",mk:"edorg",sel:true,both:true,cam:[Math.PI-0.6,1.4],
  geo:K=>{ const p=K.W.pt(0.97,0.35,-1,0); return [edBox(0.3,0.08,0.7,p.x,p.y-0.04,p.z),edBox(0.2,0.12,0.18,p.x,p.y-0.1,p.z+0.3)]; },
  lab:K=>{ const p=K.W.pt(0.97,0.35,-1,0); return [["فتحة التهوية (NACA)","NACA vent",[p.x,p.y-0.3,p.z]],["مدخل المجرى","Duct inlet",[p.x+0.15,p.y-0.2,p.z-0.35]]]; }},
 wing_center_box:{layer:"int",mk:"edgrn",cam:[Math.PI-0.8,0.9],
  geo:K=>{ const W=K.W, g=[], a=edWp(W,0.03,0.18,0), b=edWp(W,0.03,0.62,0), dy=0.55; const P=[[-a.x,a.y-dy,a.z],[a.x,a.y-dy,a.z],[b.x,b.y-dy,b.z],[-b.x,b.y-dy,b.z],[-a.x,a.y+dy,a.z],[a.x,a.y+dy,a.z],[b.x,b.y+dy,b.z],[-b.x,b.y+dy,b.z]];
    g.push(...jdEdges(P,JD_BOX,0.05)); const V=P.map(q=>edV(q[0],q[1],q[2])); g.push(edStrip([[V[0],V[3]],[V[1],V[2]]]),edStrip([[V[4],V[7]],[V[5],V[6]]])); return g; },
  lab:K=>{ const W=K.W, a=edWp(W,0.03,0.18,0), b=edWp(W,0.03,0.62,0); return [["الصندوق الوسطي للجناح","Center wing box",[0,a.y+0.7,(a.z+b.z)/2]],["العمود الأمامي","Front spar",[0,a.y,a.z]],["العمود الخلفي","Rear spar",[0,b.y,b.z]]]; }},
 cargo_comp_fwd:{layer:"int",mk:"edcrm",cam:[Math.PI-0.7,1.0],
  geo:K=>{ const d=jdDoor(K,/^FWD CARGO$/); if(!d) return []; const X0=d.X-5.2, X1=d.X+5.2, h=jdLowerHold(K,X0,X1); return jdFrame(-h.hw,h.hw,h.yb,h.yt,K.Z(X0),K.Z(X1),0.04).concat([edBox(2*h.hw,0.03,X1-X0,0,h.yb,K.Z((X0+X1)/2))]); },
  lab:K=>{ const d=jdDoor(K,/^FWD CARGO$/); if(!d) return []; const X0=d.X-5.2, X1=d.X+5.2, h=jdLowerHold(K,X0,X1); return [["حجرة الشحن الأمامية","Forward cargo compartment",[h.hw,h.yt,K.Z(d.X)]],["بوابة الباب الأيمن","Right-hand door opening",[h.hw,(h.yb+h.yt)/2,K.Z(d.X)]]]; }},
 cargo_comp_aft:{layer:"int",mk:"edcrm",cam:[Math.PI-0.7,1.0],
  geo:K=>{ const d=jdDoor(K,/^AFT CARGO$/); if(!d) return []; const X0=d.X-5.0, X1=d.X+4.0, h=jdLowerHold(K,X0,X1); return jdFrame(-h.hw,h.hw,h.yb,h.yt,K.Z(X0),K.Z(X1),0.04).concat([edBox(2*h.hw,0.03,X1-X0,0,h.yb,K.Z((X0+X1)/2))]); },
  lab:K=>{ const d=jdDoor(K,/^AFT CARGO$/); if(!d) return []; const X0=d.X-5.0, X1=d.X+4.0, h=jdLowerHold(K,X0,X1); return [["حجرة الشحن الخلفية","Aft cargo compartment",[h.hw,h.yt,K.Z(d.X)]],["بوابة الباب الأيمن","Right-hand door opening",[h.hw,(h.yb+h.yt)/2,K.Z(d.X)]]]; }},
 bulk_cargo_comp:{layer:"int",mk:"edcrm",cam:[Math.PI-0.7,1.0],
  geo:K=>{ const d=jdDoor(K,/^BULK$/); if(!d) return []; const X0=d.X-0.4, X1=d.X+2.6, h=jdLowerHold(K,X0,X1); return jdFrame(-h.hw*0.8,h.hw*0.8,h.yb,h.yt,K.Z(X0),K.Z(X1),0.04).concat([edBox(1.6*h.hw,0.03,X1-X0,0,h.yb,K.Z((X0+X1)/2))]); },
  lab:K=>{ const d=jdDoor(K,/^BULK$/); if(!d) return []; const X0=d.X-0.4, X1=d.X+2.6, h=jdLowerHold(K,X0,X1); return [["حجرة الأمتعة السائبة","Bulk cargo compartment",[h.hw*0.8,h.yt,K.Z(d.X)]]]; }},
 /* ---- flight deck ---- */
 crew_seats:{layer:"int",mk:"edgry",cam:[Math.PI-0.4,1.2],
  geo:K=>{ const k=jdCk(K), g=[]; [-1,1].forEach(s=>{ const x=s*Math.min(0.55,k.hw-0.35); g.push(edBox(0.5,0.1,0.5,x,k.yf+0.5,k.Z),edBox(0.5,0.78,0.1,x,k.yf+0.95,k.Z+0.27),edBox(0.3,0.22,0.08,x,k.yf+1.45,k.Z+0.3),edBox(0.07,0.05,0.5,x-0.28,k.yf+0.72,k.Z),edBox(0.07,0.05,0.5,x+0.28,k.yf+0.72,k.Z),edBox(0.5,0.05,0.8,x,k.yf+0.06,k.Z)); }); return g; },
  lab:K=>{ const k=jdCk(K), x=Math.min(0.55,k.hw-0.35); return [["مقعد الكابتن","Captain's seat",[-x,k.yf+1.6,k.Z]],["مقعد المساعد","First officer's seat",[x,k.yf+1.6,k.Z]],["سكة المقعد","Seat rail",[x,k.yf+0.1,k.Z+0.3]]]; }},
 yoke_columns:{layer:"int",mk:"edmet",cam:[Math.PI-0.4,1.1],
  geo:K=>{ const k=jdCk(K), g=[], z=k.Z-0.95; [-1,1].forEach(s=>{ const x=s*Math.min(0.55,k.hw-0.35); g.push(edCyl(0.035,0.7,"y",x,k.yf+0.65,z),edTor(0.18,0.02,"z",x,k.yf+1.05,z-0.12),edBar([x,k.yf+0.95,z],[x,k.yf+1.05,z-0.12],0.025),edBox(0.08,0.1,0.06,x-0.2,k.yf+1.05,z-0.12),edBox(0.08,0.1,0.06,x+0.2,k.yf+1.05,z-0.12)); }); return g; },
  lab:K=>{ const k=jdCk(K), x=Math.min(0.55,k.hw-0.35), z=k.Z-0.95; return [["عجلة القيادة (Yoke)","Control wheel (yoke)",[x,k.yf+1.35,z-0.12]],["عمود التحكم","Control column",[x,k.yf+0.5,z]],["مقبض بمفاتيح","Grip with switches",[-x-0.2,k.yf+1.15,z-0.12]]]; }},
 rudder_pedals:{layer:"int",mk:"edgry",cam:[Math.PI-0.4,1.2],
  geo:K=>{ const k=jdCk(K), g=[], z=k.Z-1.55; [-1,1].forEach(s=>{ const x=s*Math.min(0.55,k.hw-0.35); [-0.13,0.13].forEach(dx=>{ g.push(edBox(0.2,0.16,0.04,x+dx,k.yf+0.2,z)); g.push(edBar([x+dx,k.yf+0.12,z+0.02],[x+dx,k.yf+0.05,z+0.5],0.018)); }); }); return g; },
  lab:K=>{ const k=jdCk(K), x=Math.min(0.55,k.hw-0.35), z=k.Z-1.55; return [["دواسة الدفّة اليسرى","Left rudder pedal",[x-0.13,k.yf+0.35,z]],["دواسة الدفّة اليمنى","Right rudder pedal",[x+0.13,k.yf+0.35,z]],["وصلات الحركة","Linkage",[x,k.yf+0.1,z+0.3]]]; }},
 thrust_levers:{layer:"int",mk:"edmet",cam:[Math.PI-0.4,1.1],
  geo:K=>{ const k=jdCk(K), n=(K.c.eng||[1]).length*2, g=[edBox(0.4,0.3,0.9,0,k.yf+0.35,k.Z-0.1)], z0=k.Z-0.2; for(let i=0;i<n;i++){ const x=(i-(n-1)/2)*0.075; g.push(edBar([x,k.yf+0.5,z0],[x,k.yf+0.86,z0-0.12],0.014),edSph(0.03,x,k.yf+0.88,z0-0.13)); } return g; },
  lab:K=>{ const k=jdCk(K), n=(K.c.eng||[1]).length*2; return [["أذرع الدفع (واحد لكل محرك)","Thrust levers (one per engine)",[0,k.yf+1.05,k.Z-0.32]],["القاعدة (Quadrant)","Quadrant",[0.25,k.yf+0.4,k.Z-0.1]],["عدد الأذرع "+n,"Number of levers: "+n,[0,k.yf+0.62,k.Z+0.2]]]; }},
 overhead_panel:{layer:"int",mk:"edgry",cam:[Math.PI-0.4,1.0],
  geo:K=>{ const k=jdCk(K), y=Math.min(k.yf+1.95,K.top(k.X)-0.3), g=[edBox(0.9,0.04,1.2,0,y,k.Z-0.1)]; for(let r=0;r<4;r++) for(let c=0;c<7;c++) edC("edcy",edBox(0.07,0.03,0.07,-0.36+c*0.12,y-0.03,k.Z-0.55+r*0.28)).forEach(q=>g.push(q)); return g; },
  lab:K=>{ const k=jdCk(K), y=Math.min(k.yf+1.95,K.top(k.X)-0.3); return [["اللوحة العلوية","Overhead panel",[0,y+0.1,k.Z-0.1]],["مفاتيح الأنظمة","System switches",[0.3,y-0.1,k.Z-0.5]]]; }},
 cockpit_door:{layer:"int",mk:"edgry",cam:[Math.PI+0.4,1.15],
  geo:K=>{ const k=jdCk(K), Xd=k.X+(K.c.fd-K.c.rad)*0.45, z=K.Z(Xd), g=[edBox(0.9,2.0,0.08,0,k.yf+1.0,z),edBox(0.12,0.05,0.12,0.3,k.yf+1.0,z+0.08)]; [-1,1].forEach(s=>g.push(edBox(0.06,2.1,0.1,s*0.48,k.yf+1.05,z))); g.push(edBox(1.0,0.06,0.1,0,k.yf+2.05,z)); return g; },
  lab:K=>{ const k=jdCk(K), Xd=k.X+(K.c.fd-K.c.rad)*0.45, z=K.Z(Xd); return [["باب قمرة القيادة","Flight deck door",[0,k.yf+2.15,z]],["القفل","Lock",[0.3,k.yf+1.1,z+0.12]]]; }}
};
const JD_LDY={crew_seats:0.5,yoke_columns:0.9,rudder_pedals:0.3,thrust_levers:0.6,overhead_panel:1.9,cockpit_door:1.0}, JD_LDX={yoke_columns:-0.95,rudder_pedals:-1.55,thrust_levers:-0.1,cockpit_door:1.7};
(function(){
  if(typeof JD_DATA==="undefined") return;
  JD_DATA.forEach(d=>{
    let loc=d.loc; if(!loc) loc={b747:jdCkLoc("b747",JD_LDY[d.id]||0.5,JD_LDX[d.id]||0)};
    const extra=d.only?{only:d.only}:{};
    subParts([[d.id,d.ar,d.en,d.ata,d.sys,d.parent,loc,d.sum,d.comps,d.fast,d.insp,extra]]);
    ["b747","a380","b737"].forEach(ac=>{ if(jbOnlyHas(d.only,ac)&&MATS[ac]) MATS[ac][d.id]=d.mat; });
    const g=JD_GEO[d.id]; if(g) ED[d.id]=Object.assign({cat:"W"},g);
  });
  edFinish();   /* the X-ray flag of the interior parts (m_jd_a.js too) */
})();
const JD_THUMB={int_frames:"fuse_mid",int_stringers:"fuse_mid",int_floor:"fuse_mid",int_seats:"fuse_mid",int_galleys:"fuse_mid",int_lavs:"fuse_aft",int_bins:"fuse_mid",int_cargo:"fuse_mid"};   /* the interior groups have no region of their own on the flat views */
/* the two 737-authored parts that the other aircraft did not get: same card, a model in the aircraft's own proportions (the 737 keeps its hand-built one) */
(function(){
  const ct=ED.fuel_center_tank, ox=ED.oxygen_pax;
  if(ct){ const g0=ct.geo, l0=ct.lab; ct.cat="W";
    ct.geo=K=>{ if(jdKey(K)==="b737") return g0(K); const W=K.W, a=edWp(W,0.03,0.2,0), b=edWp(W,0.03,0.6,0), x=a.x*0.92, dy=0.5, V=edV, P=[[-x,a.y-dy,a.z],[x,a.y-dy,a.z],[x,b.y-dy,b.z],[-x,b.y-dy,b.z],[-x,a.y+dy,a.z],[x,a.y+dy,a.z],[x,b.y+dy,b.z],[-x,b.y+dy,b.z]], g=jdEdges(P,JD_BOX,0.045), Q=P.map(q=>V(q[0],q[1],q[2]));
      g.push(edStrip([[Q[0],Q[3]],[Q[1],Q[2]]]),edStrip([[Q[4],Q[7]],[Q[5],Q[6]]])); [-0.5,0.5].forEach(f=>g.push(edCyl(0.14,0.3,"y",f*x,a.y-dy+0.2,(a.z+b.z)/2))); return g; };
    ct.lab=K=>{ if(jdKey(K)==="b737") return l0(K); const W=K.W, a=edWp(W,0.03,0.2,0), b=edWp(W,0.03,0.6,0); return [["الخزان الوسطي للوقود","Center wing tank",[0,a.y+0.65,(a.z+b.z)/2]],["مضخات الخزان الوسطي","Center-tank pumps",[a.x*0.46,a.y-0.2,(a.z+b.z)/2]]]; }; }
  if(ox){ const g0=ox.geo, l0=ox.lab; ox.cat="W";
    ox.geo=K=>{ if(jdKey(K)==="b737") return g0(K); const L=K.L, g=[]; for(let X=0.2*L;X<=0.8*L;X+=1.75){ const y=jdFl(K,X)+2.0, hw=K.half(X,y); if(hw<1.2) continue; [-1,1].forEach(s=>{ const x=s*(hw*0.55), z=K.Z(X);
        edC("edwht",[edBox(0.78,0.07,0.2,x,y,z)]).forEach(q=>g.push(q)); edC("edorg",[edCyl(0.045,0.2,"x",x,y+0.09,z)]).forEach(q=>g.push(q));
        edC("edyel",[-0.25,0,0.25].map(dx=>edBox(0.07,0.07,0.06,x+dx,y-0.06,z))).forEach(q=>g.push(q)); }); } return g; };
    ox.lab=K=>{ if(jdKey(K)==="b737") return l0(K); const X=0.5*K.L, y=jdFl(K,X)+2.0, hw=K.half(X,y), z=K.Z(X); return [["مولّد الأكسجين الكيميائي","Chemical oxygen generator",[hw*0.55,y+0.3,z]],["الأقنعة داخل الصندوق","Masks in the drop-out box",[-hw*0.55,y-0.2,z]]]; }; }
})();

/* v30: aircraft-specific wording for the shared main cards. The 747-400 is not a 737 with two more engines: it has no slats (Krueger and variable-camber flaps instead),
   four hydraulic systems, four main gear legs, a stabilizer fuel tank, an upper-deck hump... setAc() calls acOvrApply(ac); the base text comes back when another aircraft is chosen. */
const AC_OVR = {
  b747: {
    fuse_fwd:{ sum:"من خلف الرادار حتى قبل الجناح. يضم قمرة القيادة ومقدمة حدبة الطابق العلوي، وأول مقصورة الركاب، وحجرة الإلكترونيات تحت الأرضية، وعنبر الشحن الأمامي." },
    fuse_mid:{ sum:"المنطقة التي يلتقي فيها الجناحان بالجسم. هنا الصندوق المركزي للجناح (center wing box) وحجرات العجلات الرئيسية الجناحية والجسمية." },
    slats:{ ar:"الحافة الأمامية (Krueger وVC flaps)", short:"الحافة الأمامية", en:"Leading-edge flaps (Krueger and variable camber)", q:"Krueger flap leading edge",
      sum:"لا يستخدم الـ747-400 شرائح (slats) مثل الـ737، بل نوعين من الألواح على الحافة الأمامية: فلاب كروغر (Krueger) قرب جذع الجناح، وألواح متغيرة التحدب (variable camber) في الجزء الخارجي. تنفتح عند الإقلاع والهبوط فتزيد الرفع بالسرعات المنخفضة." },
    flaps:{ sum:"قلابات كبيرة ثلاثية الشقوق على الحافة الخلفية للجناح، مجموعة داخلية وأخرى خارجية. تنزلق إلى الخلف والأسفل فتزيد مساحة الجناح وتحدّبه لرفع أكبر عند الإقلاع والهبوط." },
    aileron:{ ar:"الأيليرون (داخلي وخارجي)", short:"الأيليرون", en:"Ailerons (inboard and outboard)",
      sum:"على كل جناح جنيحتان للتحكم بالإمالة: داخلية وخارجية. ترتفع الجنيحة في جناح وتنخفض في الآخر لتميل الطائرة يميناً أو يساراً (roll)." },
    wingtip:{ ar:"طرف الجناح (Winglet)", short:"طرف الجناح", en:"Winglet", q:"winglet",
      sum:"امتداد صغير يميل للأعلى في نهاية كل جناح من الـ747-400. يقلل الدوّامات الهوائية عند طرف الجناح (wingtip vortices) فيخفّض السحب المستحث ويوفر وقوداً." },
    stabilizer:{ sum:"جناح صغير في المؤخرة يعطي الاستقرار الطولي. زاويته قابلة للضبط (trim) لتخفيف الجهد على الطيار، وفي الـ747-400 يحتوي بداخله خزان وقود." },
    fuel:{ sum:"يُخزَّن الوقود في الجناحين نفسيهما (خزانات رئيسية وخزانات احتياطية في الجزء الخارجي) وفي خزان وسطي داخل جذع الجناح، وفي خزان داخل الذيل الأفقي، مع مضخات وحسّاسات وأنابيب تغذية للمحركات الأربعة." },
    gear_main:{ sum:"أربعة أجهزة هبوط رئيسية: اثنان تحت الجناحين واثنان تحت الجسم، لكل منها هيكل بأربع عجلات (bogie). تحمل معظم وزن الطائرة وتمتص صدمة الهبوط، وتتراجع داخل حجراتها بعد الإقلاع." },
    wheels:{ sum:"الإطار والجنط والفرامل. في الـ747-400 عجلتان في الأنف وست عشرة عجلة في الأجهزة الرئيسية. تتحمل الهبوط وتوقف الطائرة، وتُراقب بحساسات حرارة وسرعة." },
    hyd:{ sum:"ينقل القوة بسائل مضغوط إلى أسطح التحكم وجهاز الهبوط والفرامل. في الـ747 أربعة أنظمة هيدروليكية مستقلة، لكل محرك نظام، فإن تعطل أحدها بقيت الأنظمة الأخرى تعمل." },
    doors:{ sum:"أبواب الركاب الرئيسية على الجانبين، وأبواب الشحن الأمامية والخلفية والسائبة على الجانب الأيمن، ومخارج الطوارئ للطابقين. الأبواب على طراز plug: ضغط المقصورة نفسه يثبّتها مغلقة." },
    windows:{ sum:"كل نافذة من ثلاث طبقات: الخارجية تتحمل فرق الضغط، والوسطى احتياطية، والداخلية تحمي الوسطى من الخدوش. وفي الـ747 صف إضافي من النوافذ على جانبي حدبة الطابق العلوي." },
  },
};
const AC_BASE = {};   /* id -> the fields as first defined (shared text) */
function acOvrApply(ac){
  const ids = {}; Object.keys(AC_OVR).forEach(k=>Object.keys(AC_OVR[k]).forEach(id=>{ ids[id]=1; }));
  Object.keys(ids).forEach(id=>{
    const p = PARTS[id]; if(!p) return;
    if(!AC_BASE[id]) AC_BASE[id] = { ar:p.ar, en:p.en, short:p.short, sum:p.sum, q:(typeof PHOTOQ_JD!=="undefined"&&PHOTOQ_JD[id])||undefined };
    const b = AC_BASE[id], o = (AC_OVR[ac]&&AC_OVR[ac][id])||null;
    p.ar = (o&&o.ar)||b.ar; p.en = (o&&o.en)||b.en; p.sum = (o&&o.sum)||b.sum;
    if(b.short!==undefined||(o&&o.short)) p.short = (o&&o.short)||b.short;
    if(typeof PHOTOQ_JD!=="undefined"){ const q = (o&&o.q)||b.q; if(q) PHOTOQ_JD[id]=q; else delete PHOTOQ_JD[id]; }
  });
}
