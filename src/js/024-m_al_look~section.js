/* ---------- (ed) detailed Boeing 737 parts: real geometry for the sub-parts, each with its own layout labels (prefix ed). ----------
   Requested by the owner («تعديلات 737»): a part that used to be only a marker on its parent now appears in 3D in its real arrangement, with the names of its components
   floating on it like the labelled diagrams of a maintenance manual. All shapes are drawn from scratch (boxes, cylinders, lofts): no logos, no copied artwork, no numbers invented.
   ED[id] = {layer: "ext" (visible on the outside, hidden by the skin where it sits inside) | "int" (X-ray), mk: SPEC key, both: mirrored copy on the left side,
             geo(K) -> list of geometries (world coordinates: x right, y up, z = station - L/2), lab(K) -> [[ar, en, [x,y,z]], ...], meta: card data for a NEW part}.
   Built lazily for the 737 by edEnsure(B) (called from GL.sync); selection uses the part's own mesh (edHas), the labels are drawn by edLabels() from updateTag(). ---------- */
Object.assign(SPEC,{
  edmet:{c:"#B9C2CA",r:.35,m:.7}, eddark:{c:"#454C55",r:.6,m:.3}, edwht:{c:"#ECEFF2",r:.5,m:.1}, edgld:{c:"#C9A24A",r:.4,m:.6}, edgrn:{c:"#4FA36B",r:.6,m:.1},
  edblu:{c:"#4A86C8",r:.5,m:.2}, edorg:{c:"#E56F2B",r:.5,m:.1}, edgry:{c:"#7C858D",r:.55,m:.35}, edpur:{c:"#7C5CC4",r:.5,m:.2}, edcy:{c:"#34B8D6",r:.45,m:.15}, edgl:{c:"#BFE3F2",r:.2,m:.1,o:0.4}, edred:{c:"#C8463B",r:.55,m:.1}, edyel:{c:"#D9B83F",r:.55,m:.1}, edblk:{c:"#1E2328",r:.7,m:.2}, edcrm:{c:"#E4D9B0",r:.6,m:.1}
});
const ED={};
function edV(x,y,z){ return new THREE.Vector3(x,y,z); }
/* primitives, all returned already placed in model coordinates; ax = the axis the shape lies along */
function edCyl(r,len,ax,x,y,z,seg,r2){ const g=new THREE.CylinderGeometry(r2===undefined?r:r2,r,len,seg||14,1,false); if(ax==="z") g.rotateX(Math.PI/2); else if(ax==="x") g.rotateZ(Math.PI/2); return g.translate(x,y,z); }
function edBox(w,h,d,x,y,z){ return new THREE.BoxGeometry(w,h,d).translate(x,y,z); }
function edSph(r,x,y,z,sx,sy,sz){ return new THREE.SphereGeometry(r,14,9).scale(sx||1,sy||1,sz||1).translate(x,y,z); }
function edTor(R,r,ax,x,y,z){ const g=new THREE.TorusGeometry(R,r,8,26); if(ax==="y") g.rotateX(Math.PI/2); else if(ax==="x") g.rotateY(Math.PI/2); return g.translate(x,y,z); }
function edBar(a,b,r){ return barBetween(edV(a[0],a[1],a[2]),edV(b[0],b[1],b[2]),r,6); }
/* an antenna blade standing on the skin at (x,y,z): height h, length l (nose to tail), thickness t, leading edge swept back by sw */
function edBlade(x,y,z,h,l,t,sw){ const s=new THREE.Shape(); s.moveTo(-l/2,0); s.lineTo(l/2,0); s.lineTo(l/2-(sw||0.1)-0.02,h); s.lineTo(-l/2+l*0.18,h); s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:t,bevelEnabled:false}); g.translate(0,0,-t/2); g.rotateY(Math.PI/2); return g.translate(x,y,z); }
/* elliptic plate facing forward (nose = -z): used for bulkheads and radar dishes */
function edDisc(rx,ry,t,x,y,z){ const g=new THREE.CylinderGeometry(1,1,t,40); g.rotateX(Math.PI/2); g.scale(rx,ry,1); return g.translate(x,y,z); }
/* open tube (shell) along an axis, tagged geometry helpers, a pipe through points, scale about a point (exaggerates small parts so they read on screen) */
function edTube(r,len,ax,x,y,z,seg){ const g=new THREE.CylinderGeometry(r,r,len,seg||32,1,true); if(ax==="z") g.rotateX(Math.PI/2); else if(ax==="x") g.rotateZ(Math.PI/2); return g.translate(x,y,z); }
/* rotate a geometry about its own centre (BufferGeometry.rotateX turns about the origin, which would fling an already-placed part away) */
function edRot(g,ax,a){ g.computeBoundingBox(); const c=g.boundingBox.getCenter(new THREE.Vector3()); g.translate(-c.x,-c.y,-c.z); if(ax==='x') g.rotateX(a); else if(ax==='y') g.rotateY(a); else g.rotateZ(a); return g.translate(c.x,c.y,c.z); }
const edC=(k,gs)=>(Array.isArray(gs)?gs:[gs]).map(g=>{ g.edmk=k; return g; });                         /* tag geometries with a material key (one part may use several colours) */
function edPipe(pts,r){ const g=[]; for(let i=0;i<pts.length-1;i++) g.push(edBar(pts[i],pts[i+1],r)); for(let i=1;i<pts.length-1;i++) g.push(edSph(r*1.2,pts[i][0],pts[i][1],pts[i][2])); return g; }
const edSc=(gs,cx,cy,cz,s)=>gs.map(g=>{ g.translate(-cx,-cy,-cz); g.scale(s,s,s); return g.translate(cx,cy,cz); });
const edHalf=(c,X,y)=>vwHalf(c,X,y);

/* ---- the context a definition gets ---- */
function edCtx(c){ const L=c.L; return {c,L,W:wingLS(c),H:htpLS(c),F:finLS(c),Z:X=>X-L/2,top:X=>interp(c.top,X),bot:X=>interp(c.bot,X),half:(X,y)=>vwHalf(c,X,y),zc:X=>ringAt(c,X).zc,ring:X=>ringAt(c,X)}; }

/* =====================================================================  1. nose radar bay (items 8, 17, 25, 35) */
ED.wx_radar={layer:"ext",mk:"edmet",open:["radome"],cam:[Math.PI-0.45,1.32],
  geo:K=>{ const Z=K.Z, y=K.zc(1.2), g=[];
    const rr=Math.min(0.62,K.ring(0.95).hw*0.78);                       /* dish and gimbal ring fit the (pointed) nose */
    g.push(edDisc(rr,rr,0.07,0,y,Z(0.85)));                             /* flat-plate antenna */
    g.push(edTor(rr+0.04,0.03,"z",0,y,Z(0.85)+0.0));                    /* gimbal ring */
    g.push(edBar([-0.66,y,Z(0.85)],[-0.66,y,Z(1.45)],0.03)); g.push(edBar([0.66,y,Z(0.85)],[0.66,y,Z(1.45)],0.03));
    g.push(edCyl(0.16,0.4,"z",0,y,Z(1.45)));                          /* drive unit behind the dish */
    g.push(edBox(0.9,0.06,0.5,0,y-0.74,Z(1.35)));                     /* mounting shelf */
    return g; },
  lab:K=>{ const Z=K.Z, y=K.zc(1.2); return [["هوائي الرادار (طبق مسطّح)","Radar antenna (flat plate)",[0,y+0.45,Z(0.8)]],["حلقة التحريك","Gimbal ring",[0.66,y,Z(0.9)]],["وحدة تحريك الرادار","Radar drive unit",[0,y-0.25,Z(1.5)]]]; }};
ED.wx_receiver={layer:"ext",mk:"eddark",open:["radome"],cam:[Math.PI-0.45,1.32],
  geo:K=>{ const Z=K.Z, y=K.zc(1.2)-0.45; return [edBox(0.55,0.3,0.34,-0.1,y,Z(1.6)),edBox(0.4,0.28,0.3,0.45,y,Z(1.62)),edCyl(0.05,0.2,"y",-0.1,y+0.22,Z(1.6)),edBar([0.1,y+0.1,Z(1.45)],[0,K.zc(1.2),Z(1.4)],0.02)]; },
  lab:K=>{ const Z=K.Z, y=K.zc(1.2)-0.45; return [["جهاز الإرسال والاستقبال","Radar transceiver",[-0.1,y+0.3,Z(1.6)]],["وحدة التحكم","Control unit",[0.45,y+0.3,Z(1.62)]]]; }};
ED.press_bulkhead_fwd={layer:"ext",mk:"edcrm",open:["radome"],cam:[Math.PI-0.3,1.3],
  geo:K=>{ const Z=K.Z, X=2.0, r=K.ring(X), y=r.zc, rx=r.hw*0.97, ry=r.hh*0.97, g=[edDisc(rx,ry,0.1,0,y,Z(X))];
    for(let i=0;i<6;i++){ const a=i/6*Math.PI; g.push(edBar([Math.cos(a)*rx*0.96,y+Math.sin(a)*ry*0.96,Z(X)-0.07],[-Math.cos(a)*rx*0.96,y-Math.sin(a)*ry*0.96,Z(X)-0.07],0.025)); }
    g.push(edTor(1,0.04,"z",0,0,0).scale(rx,ry,1).translate(0,y,Z(X)-0.04));
    return g; },
  lab:K=>{ const Z=K.Z, r=K.ring(2.0); return [["الحاجز الضاغط الأمامي","Forward pressure bulkhead",[r.hw*0.7,r.zc-r.hh*0.55,Z(2.0)-0.1]],["أضلاع التقوية","Stiffeners",[-r.hw*0.5,r.zc+r.hh*0.3,Z(2.0)-0.1]]]; }};
ED.ant_ils={layer:"ext",mk:"edwht",open:["radome"],cam:[Math.PI-0.3,1.3],
  geo:K=>{ const Z=K.Z, r=K.ring(1.95), y=r.zc, g=[];
    [-0.32,0.32].forEach(x=>g.push(edBox(0.34,0.06,0.2,x,y+r.hh*0.62,Z(1.78)))); g.push(edBox(0.9,0.03,0.04,0,y+r.hh*0.62+0.12,Z(1.78)));   /* localizer: two loops on the bulkhead top */
    g.push(edBox(0.55,0.34,0.05,0,y-r.hh*0.7,Z(1.78)));                                                                                      /* glide-slope panel */
    return g; },
  lab:K=>{ const Z=K.Z, r=K.ring(1.95), y=r.zc; return [["هوائي المحدِّد (Localizer)","Localizer antenna",[0,y+r.hh*0.62+0.15,Z(1.78)]],["هوائي مسار الهبوط (Glide slope)","Glide-slope antenna",[0,y-r.hh*0.7,Z(1.78)]]]; }};

/* =====================================================================  2. antennas and probes on the skin (items 9, 33, 13, 53) */
const ED_ANT=[   /* [id, ar, en, X (m from the nose), side: t top / b belly, lateral x, kind, h, l] */
  ["ant_vhf","هوائيات VHF","VHF antennas",[["VHF 1","t",12.4,0],["VHF 2","b",21.6,0.0],["VHF 3","b",25.6,0]]],
  ["ant_gps","هوائيات GPS","GPS antennas",[["GPS 1","t",9.0,-0.35],["GPS 2","t",9.7,0.35]]],
  ["ant_tcas","هوائيات TCAS","TCAS antennas",[["TCAS upper","t",8.2,0],["TCAS lower","b",9.3,0]]],
  ["ant_atc","هوائيات الترانسبوندر ATC","ATC transponder antennas",[["ATC upper","t",10.6,0],["ATC lower","b",7.6,0]]],
  ["radio_altimeter_ant","هوائيات مقياس الارتفاع الراديوي","Radio altimeter antennas",[["RA 1","b",11.4,-0.4],["RA 2","b",11.4,0.4],["RA 3","b",12.4,-0.4],["RA 4","b",12.4,0.4]]],
  ["ant_dme","هوائيات DME","DME antennas",[["DME 1","b",14.2,0],["DME 2","b",22.6,0]]],
  ["ant_marker","هوائي مؤشر المنارة (Marker beacon)","Marker beacon antenna",[["Marker","b",19.8,0]]],
  ["ant_adf","هوائيات ADF","ADF antennas",[["ADF 1","t",23.4,-0.45],["ADF 2","t",23.4,0.45]]],
  ["ant_satcom","هوائي SATCOM","SATCOM antenna",[["SATCOM","t",20.8,0]]],
  ["elt","جهاز تحديد موقع الطوارئ ELT","Emergency locator transmitter",[["ELT","t",27.6,0]]]
];
ED_ANT.forEach(([id,ar,en,list])=>{ ED[id]={layer:"ext",mk:"edwht",
  geo:K=>{ const g=[]; list.forEach(([n,sd,X,x])=>{ const top=sd==="t", y0=top?K.top(X):K.bot(X), big=n==="SATCOM"||n.indexOf("TCAS")===0;
      if(n.indexOf("GPS")===0) g.push(edSph(0.12,x,y0,K.Z(X),1,0.6,1));
      else if(n==="SATCOM") g.push(edSph(0.4,x,y0+0.02,K.Z(X),1.25,0.5,1));
      else if(n.indexOf("ADF")===0||n==="Marker"||n.indexOf("RA ")===0||n.indexOf("DME")===0){ const w=n==="Marker"?0.5:n.indexOf("RA")===0?0.3:0.26, d=n==="Marker"?0.3:n.indexOf("RA")===0?0.3:0.5; g.push(edBox(w,0.04,d,x,y0+(top?0.02:-0.02),K.Z(X)));
        if(n.indexOf("DME")===0) g.push(edBlade(x,y0-0.0,K.Z(X),-0.25,0.35,0.035,0.08)); }
      else { const h=big?0.4:n==="ELT"?0.32:0.46, l=big?0.5:0.36; const b=edBlade(x,top?y0:y0,K.Z(X),h*(top?1:-1),l,0.035,0.1); g.push(b); } });
    return g; },
  lab:K=>list.map(([n,sd,X,x])=>[n,n,[x,(sd==="t"?K.top(X)+0.48:K.bot(X)-0.5),K.Z(X)]]) }; });
ED.ant_dme.meta=["ant_dme","هوائيات DME","DME antennas","ATA 34","sys","fuse_mid",["F",0.36,"b"],"هوائيان تحت البطن يرسلان ويستقبلان نبضات لقياس المسافة من محطة DME على الأرض.",[["Antenna element","عنصر الهوائي"],["Coax cable","كابل محوري"]],[["boltnut","مسامير"]],["نظافة الغطاء","وصلة الكابل"]];
ED.ant_marker.meta=["ant_marker","هوائي مؤشر المنارة","Marker beacon antenna","ATA 34","sys","fuse_mid",["F",0.5,"b"],"صفيحة تحت البطن تلتقط إشارة المنارات المؤشِّرة عند عبور أماكن محدّدة على مسار الاقتراب.",[["Antenna plate","صفيحة الاستقبال"],["Receiver","المستقبل"]],[["boltnut","مسامير"]],["نظافة الصفيحة","وصلة الكابل"]];
ED.ant_adf.meta=["ant_adf","هوائيات ADF","ADF antennas","ATA 34","sys","fuse_mid",["F",0.6,"t"],"هوائيان فوق الجسم لاستقبال إشارات المنارات اللاسلكية غير الاتجاهية (NDB) لتحديد الاتجاه.",[["Sense antenna","هوائي الإحساس"],["Loop antenna","هوائي الحلقة"]],[["boltnut","مسامير"]],["نظافة الغطاء","وصلة الكابل"]];
/* the extra antennas the diagram shows that the atlas did not have: HF, VOR / localizer (fin cap), glide slope is in the nose bay */
ED.ant_hf={layer:"ext",mk:"edwht",meta:["ant_hf","هوائي HF","HF antenna","ATA 23","sys","fin",["V",0.45,0.05],
  "هوائي للاتصال البعيد بموجات HF، مدمج بحافة الذيل العمودي الأمامية.",[["Antenna strip","شريط الهوائي"],["Coupler","وحدة التوافق"]],[["boltnut","مسامير التثبيت"]],["نظافة الشريط","وصلة الكابل"]],
  geo:K=>{ const F=finLS(K.c), p=F.pt(0.42,0.04,0), q=F.pt(0.78,0.04,0); return [edBar([p.x+0.05,p.y,p.z],[q.x+0.05,q.y,q.z],0.035)]; },
  lab:K=>{ const F=finLS(K.c), p=F.pt(0.6,0.04,0); return [["هوائي HF","HF antenna",[p.x+0.3,p.y,p.z]]]; }};
ED.ant_vor={layer:"ext",mk:"edwht",meta:["ant_vor","هوائي VOR والمحدِّد (قمة الذيل)","VOR / localizer antenna (fin cap)","ATA 34","sys","fin",["V",0.98,0.5],
  "هوائي على قمة الذيل العمودي لاستقبال محطات VOR وإشارة المحدِّد.",[["Antenna element","عنصر الاستقبال"],["Fairing","غطاء"]],[["boltnut","مسامير"]],["نظافة الغطاء","وصلة الكابل"]],
  geo:K=>{ const F=finLS(K.c), p=F.pt(1,0.55,0); return [edBox(0.16,0.2,1.0,0,p.y+0.08,p.z)]; },
  lab:K=>{ const F=finLS(K.c), p=F.pt(1,0.55,0); return [["VOR / LOC","VOR / LOC",[0.2,p.y+0.4,p.z]]]; }};
ED.pitot_probe={layer:"ext",mk:"edmet",
  geo:K=>{ const X=4.4, y=K.zc(X)-0.15, g=[]; [-1,1].forEach(s=>{ const hw=K.half(X,y)*0.99; g.push(edCyl(0.035,0.5,"z",s*hw,y,K.Z(X)-0.25)); g.push(edCyl(0.05,0.12,"z",s*hw,y,K.Z(X)+0.02)); }); return g; },
  lab:K=>{ const X=4.4, y=K.zc(X)-0.15, hw=K.half(X,y); return [["مجسّ بيتو (الكابتن)","Pitot probe (captain)",[-hw,y+0.25,K.Z(X)-0.2]],["مجسّ بيتو (المساعد)","Pitot probe (first officer)",[hw,y+0.25,K.Z(X)-0.2]]]; }};
ED.static_port={layer:"ext",mk:"eddark",
  geo:K=>{ const X=11.8, y=K.zc(X)+0.05, hw=K.half(X,y), g=[]; [-1,1].forEach(s=>{ g.push(edBox(0.03,0.22,0.5,s*hw,y,K.Z(X))); [-0.12,0.12].forEach(d=>g.push(edCyl(0.025,0.04,"x",s*(hw+0.02),y,K.Z(X)+d))); }); return g; },
  lab:K=>{ const X=11.8, y=K.zc(X)+0.05, hw=K.half(X,y); return [["فتحات الضغط الساكن (يمين)","Static ports (right)",[hw,y+0.3,K.Z(X)]],["فتحات الضغط الساكن (يسار)","Static ports (left)",[-hw,y+0.3,K.Z(X)]]]; }};

/* =====================================================================  3. APU, its compartment and its exhaust (items 1, 51) */
ED.apu_gen={layer:"int",mk:"edmet",cam:[Math.PI/2-0.5,1.05],
  geo:K=>{ const Z=K.Z, y=K.zc(36.6)-0.2, g=[];
    g.push(edCyl(0.24,0.55,"z",0,y,Z(35.0)));                       /* generator */
    g.push(edBox(0.5,0.42,0.42,0,y,Z(35.65)));                       /* gearbox */
    g.push(edCyl(0.26,0.55,"z",0,y,Z(36.2),14,0.2));                 /* load compressor */
    g.push(edCyl(0.3,0.85,"z",0,y,Z(37.0)));                         /* power section */
    g.push(edCyl(0.2,1.6,"z",0,y,Z(38.4),14,0.14));                  /* exhaust duct */
    g.push(edCyl(0.07,0.2,"y",0.34,y+0.16,Z(36.8)));                 /* surge control valve */
    g.push(edCyl(0.035,0.28,"y",-0.3,y+0.3,Z(37.15)));               /* igniter */
    return g; },
  lab:K=>{ const Z=K.Z, y=K.zc(36.6)-0.2; return [["المولّد","Generator",[0,y+0.45,Z(35.0)]],["علبة التروس","Gearbox",[0.3,y+0.35,Z(35.65)]],["ضاغط الحمل","Load compressor",[0.35,y+0.4,Z(36.2)]],["القسم الحراري","Power section",[0,y+0.55,Z(37.0)]],["صمام التحكم بالاندفاع","Surge control valve",[0.45,y+0.4,Z(36.8)]],["شمعة الإشعال","Igniter",[-0.45,y+0.5,Z(37.15)]],["مجرى العادم","Exhaust duct",[0,y-0.35,Z(38.5)]]]; }};
ED.apu_exhaust={layer:"ext",mk:"eddark",
  geo:K=>{ const Z=K.Z, X=39.4, y=K.zc(X), g=[]; g.push(edTor(0.24,0.045,"z",0,y,Z(X)+0.02)); g.push(edCyl(0.22,0.05,"z",0,y,Z(X)+0.0)); g.push(edBox(0.55,0.04,0.55,0,y-0.3,Z(X)-0.1)); return g; },
  lab:K=>{ const Z=K.Z, X=39.4, y=K.zc(X); return [["فتحة عادم APU","APU exhaust opening",[0,y+0.35,Z(X)]]]; }};
ED.apu_inlet={layer:"ext",mk:"eddark",
  geo:K=>{ const X=35.4, y=K.zc(X)+0.05, hw=K.half(X,y), g=[]; [-1,1].forEach(s=>{ g.push(edBox(0.035,0.42,0.9,s*(hw+0.005),y,K.Z(X))); g.push(edBox(0.02,0.34,0.8,s*(hw+0.02),y,K.Z(X))); }); return g; },
  lab:K=>{ const X=35.4, y=K.zc(X)+0.05, hw=K.half(X,y); return [["باب مدخل هواء APU","APU air inlet door",[hw,y+0.45,K.Z(X)]]]; }};

/* ---- new parts of the list that need a card ---- */
/* run at the end of every ed file: new cards for the parts that had none, and the X-ray flag for the parts that sit inside */
function edFinish(){ Object.keys(ED).forEach(id=>{ const m=ED[id].meta; if(m&&!PARTS[id]) subParts([m]); if(PARTS[id]&&ED[id].layer==="int") PARTS[id].int=true; }); }
edFinish();
const EDONLY="b737";

/* ---- building ---- */
function edHas(id){ try{ if(!ED[id]) return false; const B=GL.dbg(); return !!(B&&B.ed&&B.key===S.ac&&B.byId[id]); }catch(e){ return false; } }

/* ---- labels (the layout diagram of the selected part) ---- */
let ED_LB=null, ED_CSS=false;
function edLabelsEnsure(){
  if(!ED_CSS){ ED_CSS=true; const st=document.createElement("style"); st.textContent=".edLb{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:4}.edLb span{position:absolute;transform:translate(8px,-50%);white-space:nowrap;font-size:11.5px;line-height:1;padding:4px 7px;border-radius:9px;background:rgb(10 22 42 / .82);color:#fff;border:1px solid rgb(255 255 255 / .22);box-shadow:0 4px 10px -4px rgb(0 0 0 / .5)}.edLb span::before{content:'';position:absolute;left:-9px;top:50%;width:8px;height:8px;margin-top:-4px;border-radius:50%;background:#F6B347;box-shadow:0 0 0 2px rgb(246 179 71 / .35)}.edLb span.r{transform:translate(calc(-100% - 8px),-50%)}.edLb span.r::before{left:auto;right:-9px}"; document.head.appendChild(st); }
  if(!ED_LB||!ED_LB.isConnected){ ED_LB=document.createElement("div"); ED_LB.className="edLb"; ED_LB.setAttribute("aria-hidden","true"); ED_LB.hidden=true; const v=document.getElementById("view")||document.body; v.appendChild(ED_LB); }
  return ED_LB;
}
/* selecting a part that sits behind a cover opens the cover (the radome for the nose bay), and closes it again when the selection moves on */
function edSel(id){
  S.edIso=(id&&edHas(id)&&ED[id].layer==="int")?new Set([id].concat(ED[id].with||[])):null;
  S.edGhost=(id&&edHas(id)&&ED[id].ghost)||null;   /* an interior detailed part is shown alone: everything else fades */
  try{ const want=(id&&edHas(id)&&ED[id].open)||[], prev=S.edOpen||[]; prev.forEach(k=>{ if(want.indexOf(k)<0) GL.setAnim(k,0,false); }); want.forEach(k=>GL.setAnim(k,1,false)); S.edOpen=want.slice(); }catch(e){}
}
