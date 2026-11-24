/* ---------- (ed) part 1 leftovers («تعديلات 737» الجزء 1): the fuselage barrel structure (frames with Z-profile and shear ties, stringers, floor beams, seat tracks), the dorsal fin explained,
   the radome hold-open rod, the lighting bus and the bonding straps. See m_ed737.js. ---------- */

/* ---- a cut-away barrel of the fuselage: how skin, stringers, frames and floor beams are tied together ---- */
ED.fuse_section_detail={layer:"int",mk:"edmet",cam:[Math.PI-0.6,0.5],meta:["fuse_section_detail","مقطع هيكل البدن (أطر وقوائم وعوارض)","Fuselage barrel structure (frames, stringers, floor beams)","ATA 53","sys","fuse_mid",["F",0.55,"c",0.0],
  "الجلد يُثبَّت على قوائم طولية (Stringers) تمرّ عبر فتحات في الأطر الدائرية (Frames). الإطار مقطعه حرف Z ويرتبط بالجلد بوصلات قص (Shear ties). عوارض الأرضية تربط الإطارين المتقابلين وتحمل سكك المقاعد.",[["Skin","جلد الجسم"],["Stringer","القائمة الطولية"],["Frame (Z-section)","إطار الجسم Z"],["Shear tie","وصلة القص"],["Floor beam","عارضة الأرضية"]],[["rivet","برشام"]],["تشققات حول الوصلات","تآكل الإطار"],{int:true,only:"b737"}],
  geo:K=>{ const c=K.c, g=[], X0=21.0, n=5, sp=0.508, NA=40, S=edSeatRows(K), zf=S.zf;
    const ring=(X,f,a)=>{ const r=ringAt(c,X); return [r.hw*f*Math.cos(a),r.zc+r.hh*f*Math.sin(a)]; };
    for(let i=0;i<n;i++){ const X=X0+i*sp, z=K.Z(X), w=[], fi=[], fo=[];
      for(let k=0;k<=NA;k++){ const a=k/NA*Math.PI*2, o=ring(X,0.985,a), m=ring(X,0.935,a);
        w.push([edV(m[0],m[1],z),edV(o[0],o[1],z)]);                                                                         /* the web of the frame */
        fi.push([edV(m[0],m[1],z),edV(m[0],m[1],z+0.045)]);                                                                  /* the inner flange (towards +z) */
        fo.push([edV(o[0],o[1],z-0.045),edV(o[0],o[1],z)]); }                                                               /* the outer flange (on the skin) */
      edC("edgld",[edStrip(w)]).forEach(x=>g.push(x)); edC("edgld",[edStrip(fi)]).forEach(x=>g.push(x)); edC("edgld",[edStrip(fo)]).forEach(x=>g.push(x));
      for(let k=0;k<36;k++){ const a=(k+0.5)/36*Math.PI*2, o=ring(X,0.975,a); g.push(...edC("edred",[edBox(0.05,0.05,0.045,o[0],o[1],z)])); }   /* shear ties between the web and the skin */
      const hw=ringAt(c,X).hw*0.96; g.push(...edC("edblu",[edBox(2*hw,0.14,0.04,0,zf-0.1,z),edBox(2*hw,0.015,0.1,0,zf-0.17,z),edBox(2*hw,0.015,0.1,0,zf-0.03,z)]));   /* a floor beam (web and two flanges) */
      [-hw*0.7,hw*0.7].forEach(x=>g.push(...edC("edmet",[edBar([x,zf-0.17,z],[x*1.1,zf-0.7,z],0.015)])));                 /* stanchions down to the frame */ }
    const z0=K.Z(X0-0.2), z1=K.Z(X0+(n-1)*sp+0.2);
    for(let k=0;k<36;k++){ const a=(k+0.5)/36*Math.PI*2, o=ring(X0,0.992,a), p=ring(X0+(n-1)*sp,0.992,a); g.push(...edC("edgry",[edBar([o[0],o[1],z0],[p[0],p[1],z1],0.02)])); }   /* the stringers */
    [-1.2,-0.55,0.55,1.2].forEach(x=>g.push(...edC("edgrn",[edBar([x,zf+0.015,z0],[x,zf+0.015,z1],0.018)])));                /* the seat tracks */
    /* the skin: only the belly and the crown are drawn so the structure inside stays visible */
    [[Math.PI*1.1,Math.PI*1.9],[Math.PI*0.35,Math.PI*0.65]].forEach(([a0,a1])=>{ const pairs=[]; for(let k=0;k<=16;k++){ const a=a0+(a1-a0)*k/16, o=ring(X0,1.0,a), p=ring(X0+(n-1)*sp,1.0,a); pairs.push([edV(o[0],o[1],z0),edV(p[0],p[1],z1)]); }
      edC("edwht",[edStrip(pairs)]).forEach(x=>g.push(x)); });
    return g; },
  lab:K=>{ const c=K.c, X0=21.0, S=edSeatRows(K), r=ringAt(c,X0+1.0); return [["الجلد","Skin",[0,r.zc-r.hh*1.02,K.Z(X0+1.0)]],["قائمة طولية (Stringer)","Stringer",[r.hw*0.74,r.zc+r.hh*0.7,K.Z(X0+0.4)]],["الإطار (مقطع Z)","Frame (Z-section)",[-r.hw*1.0,r.zc+r.hh*0.1,K.Z(X0+1.0)]],["وصلة القص (Shear tie)","Shear tie",[-r.hw*0.5,r.zc+r.hh*0.8,K.Z(X0+1.5)]],["عارضة الأرضية","Floor beam",[0,S.zf-0.3,K.Z(X0+1.5)]],["سكّة المقاعد","Seat track",[0.55,S.zf+0.2,K.Z(X0+0.2)]]]; }};

/* ---- the dorsal fin, with the side-slip flow it works on ---- */
ED.dorsal_fin={layer:"ext",mk:"edred",cam:[Math.PI/2+0.5,1.0],
  geo:K=>{ const F=K.F, p0=F.pt(0,0,0), pt=F.pt(0.17,0,0), c=K.c, Xg=p0.z+K.L/2-3.2, y0=K.top(Xg), g=[];
    const sh=new THREE.Shape(); sh.moveTo(p0.z-3.2,y0); sh.lineTo(pt.z+0.12,pt.y); sh.lineTo(p0.z+0.12,p0.y-0.05); sh.closePath();   /* (v37) the apex is on the swept leading edge, like the fillet itself (p5f.js) */
    const e=new THREE.ExtrudeGeometry(sh,{depth:0.16,bevelEnabled:false}); e.translate(0,0,-0.08); e.rotateY(-Math.PI/2); g.push(...edC("edred",[e.translate(0,0,0)]));
    g.push(...edC("edcy",edPipe([[1.9,p0.y+0.3,p0.z-1.2],[0.5,p0.y+0.3,p0.z-0.6]],0.02))); g.push(...edC("edcy",[edCyl(0.07,0.2,"z",0.4,p0.y+0.3,p0.z-0.55,10,0)]));   /* side-slip airflow (an arrow) */
    return g; },
  lab:K=>{ const F=K.F, p0=F.pt(0,0,0), pt=F.pt(0.17,0,0); return [["الزعنفة الظهرية (Dorsal fin)","Dorsal fin",[0.35,pt.y-0.4,p0.z-1.2]],["حافة الزعنفة العمودية الأمامية","Fin leading edge",[0.3,p0.y+1.1,p0.z+0.3]],["تدفق جانبي عند الانزلاق","Side-slip airflow",[1.9,p0.y+0.5,p0.z-1.2]]]; }};
(function(){ try{ if(PARTS.dorsal_fin) PARTS.dorsal_fin.sum="امتداد انسيابي أمام الزعنفة العمودية. لما تنزلق الطائرة جانبياً (مثلاً بريح جانبية أو عطل محرك) تصطدم الريح بالزعنفة بزاوية كبيرة فتنهار قوتها فجأة وتفقد الدفة فعاليتها. الزعنفة الظهرية تؤخر هذا الانهيار فتبقى الدفة تعمل بزوايا أكبر."; }catch(e){} })();

/* ---- the radome hold-open rod: drawn in its opened pose (the nose bay opens when this part is selected) ---- */
ED.radome_rod={layer:"ext",mk:"edgld",open:["radome"],cam:[Math.PI-0.5,1.2],meta:["radome_rod","قضيب تثبيت الرادوم (Hold-open rod)","Radome hold-open rod","ATA 53","sys","radome",["F",0.03,"c",0.4],
  "قضيب يُمسك غطاء الأنف مفتوحاً أثناء الصيانة حتى لا يسقط على الفني. يثبّت طرفه الأسفل بحاجز الضغط وطرفه الأعلى بحافة الرادوم.",[["Rod","قضيب التثبيت"],["Fittings","وصلات الطرفين"],["Latch","مزلاج القفل"]],[["boltnut","مسامير"]],["نظافة القضيب","قفل المزلاج"],{only:"b737"}],
  geo:K=>{ const c=K.c, r=ringAt(c,c.rad), pz=c.rad-c.L/2, py=r.zc+r.hh, th=80*Math.PI/180, g=[];
    const A0=[0.45,r.zc+0.1,pz-0.55], dy=A0[1]-py, dz=A0[2]-pz, A=[A0[0],py+dy*Math.cos(th)-dz*Math.sin(th),pz+dy*Math.sin(th)+dz*Math.cos(th)], B=[0.45,r.zc-0.55,pz-0.1];   /* the radome end follows the opened radome */
    g.push(edBar(B,A,0.03)); g.push(edSph(0.055,B[0],B[1],B[2]),edSph(0.055,A[0],A[1],A[2]));
    return g; },
  lab:K=>{ const c=K.c, r=ringAt(c,c.rad), pz=c.rad-c.L/2; return [["قضيب التثبيت","Hold-open rod",[0.55,r.zc+0.5,pz+0.2]],["وصلة الطرف الأسفل بالحاجز","Lower fitting (on the bulkhead)",[0.5,r.zc-0.7,pz]]]; }};

/* ---- small electrical items: the lighting bus and the bonding (grounding) straps ---- */
ED.light_bus={layer:"int",mk:"edgld",meta:["light_bus","ناقل الإضاءة","Lighting bus","ATA 33","sys","avionics",["F",0.18,"c",0.0],
  "قضيب نحاسي في حجرة الإلكترونيات يوزّع الكهرباء على دوائر إضاءة الطائرة الخارجية والداخلية، وتخرج منه قواطع لكل دائرة.",[["Bus bar","القضيب"],["Circuit breakers","قواطع الدوائر"]],[["boltnut","مسامير"]],["نظافة القطبين","ثبات الأسلاك"],{int:true,only:"b737"}],
  geo:K=>{ const Z=K.Z, y=EDE.y+0.4, z0=Z(EDE.z0-1.1), g=[]; g.push(...edC("edgld",[edBar([-1.15,y,z0],[-0.2,y,z0],0.03)]));
    for(let i=0;i<7;i++){ const x=-1.1+i*0.14; g.push(...edC("edblk",[edBox(0.07,0.1,0.07,x,y-0.12,z0)])); g.push(...edC("edred",[edBar([x,y-0.06,z0],[x,y,z0],0.008)])); }
    g.push(...edC("edgry",[edBox(0.5,0.1,0.18,-0.7,y+0.15,z0)]));                                                                                      /* the dimmer / relay box above */
    return g; },
  lab:K=>{ const Z=K.Z, y=EDE.y+0.4, z0=Z(EDE.z0-1.1); return [["قضيب نحاسي (Bus bar)","Bus bar",[-0.65,y+0.1,z0]],["قواطع الدوائر","Circuit breakers",[-0.65,y-0.32,z0]],["مرحّل التعتيم","Dimmer / relay unit",[-0.7,y+0.4,z0]]]; }};
ED.ground_strap={layer:"ext",mk:"edmet",both:true,meta:["ground_strap","حزام التأريض (Bonding strap)","Bonding (grounding) strap","ATA 20","sys","wingbox",["W",0.55,0.8,0],
  "شريط معدني مضفور يربط الأجزاء المتحركة (جنيح، قلاب، مصعد، دفة) بالهيكل ليمرّ التيار الساكن أو صاعقة البرق بدل أن يقفز شرراً عند المفصلة.",[["Braided strap","الشريط المضفور"],["Lug","طرف التوصيل"]],[["boltnut","مسامير"]],["كسور الضفيرة","نظافة نقطة التأريض"],{only:"b737"}],
  geo:K=>{ const g=[], W=K.W, H=K.H; const s=(p,d)=>{ g.push(edBar([p.x,p.y+0.01,p.z],[p.x,p.y+0.06,p.z+d/2],0.012),edBar([p.x,p.y+0.06,p.z+d/2],[p.x,p.y+0.01,p.z+d],0.012),edSph(0.02,p.x,p.y+0.01,p.z),edSph(0.02,p.x,p.y+0.01,p.z+d)); };
    [0.55,0.7,0.85].forEach(u=>s(edWp(W,u,0.84,0.86),0.14));                                                                                           /* aileron hinge */
    [0.2,0.4].forEach(u=>s(edWp(W,u,0.7,0.86),0.14));                                                                                                  /* flap hinges */
    [0.3,0.62].forEach(u=>s(edWp(H,u,0.62,0.86),0.14));                                                                                                /* elevator hinges */
    return g; },
  lab:K=>{ const W=K.W, a=edWp(W,0.7,0.84,0.86); return [["شريط التأريض المضفور","Braided bonding strap",[a.x,a.y+0.4,a.z]]]; }};
edFinish();
/* detail models that are exaggerated or coloured differently from the real part show only while selected; belly and underwing parts are viewed from below */
["ice_detector","tat_probe","ant_gps","light_beacon","dorsal_fin","radome_rod","eng_inlet_cowl","eng_exhaust_plug","ram_air_inlet","apu_inlet"].forEach(id=>{ if(ED[id]) ED[id].sel=true; });
["ram_air_inlet","radio_altimeter_ant","ant_dme","ant_marker","refuel_panel","light_landing","gear_doors"].forEach(id=>{ if(ED[id]) ED[id].cam=[Math.PI-0.6,2.15]; });
edFinish();
