/* ---------- part animations: one motion per part, added on top of explode and pull ----------
   t: rot (hinge about an axis; a = [min,max] degrees, v0 = resting slider position),
      move (translation in units of root chord, or of the nacelle length when unit:"ln"), spin, breathe, glow, blink, door.
   pv: pivot used for rot/spin: fmin/fmax = hinge at the front/back edge, root = wing root,
       bottom/top = base or top of a part, center, build = pivot set in the builder.
   v0: resting value. Ambient motions (glow, blink, breathe, spin) start at a visible level so every part shows motion. */
const DEG=Math.PI/180;
const ANIM = {
  radome:{t:"rot",ax:"x",pv:"build",a:[0,80],v0:0,lbl:"فتح الرادوم",d:"يُفتح غطاء الأنف المصنوع من مادة تسمح بمرور موجات الرادار، على مفصلة بأعلاه، لتظهر تحته أجهزة الرادار وهوائيات الهبوط الآلي والحاجز الضاغط الأمامي."},
  flightdeck:{t:"glow",spd:1.3,v0:0,col:"#7FDBA4",lbl:"شاشات قمرة القيادة",d:"وميض الشاشات والمؤشرات وهي تحدّث البيانات من أنظمة الطيران."},
  fuse_fwd:{t:"breathe",amp:0.02,v0:0,lbl:"تمدّد الهيكل بالضغط",d:"الكابينة مضغوطة على ارتفاع الطيران فيتمدّد الهيكل قليلاً ويرجع عند الهبوط. التكرار هنا مبالغ فيه ليُرى."},
  fuse_mid:{t:"breathe",amp:0.02,v0:0,lbl:"تمدّد الهيكل بالضغط",d:"الكابينة مضغوطة على ارتفاع الطيران فيتمدّد الهيكل قليلاً ويرجع عند الهبوط. التكرار هنا مبالغ فيه ليُرى."},
  fuse_aft:{t:"breathe",amp:0.02,v0:0,lbl:"تمدّد الهيكل بالضغط",d:"الكابينة مضغوطة على ارتفاع الطيران فيتمدّد الهيكل قليلاً ويرجع عند الهبوط. التكرار هنا مبالغ فيه ليُرى."},
  wingbox:{t:"rot",ax:"z",pv:"root",a:[0,6],v0:0,lbl:"مرونة الجناح تحت الحمل",d:"الجناح يلتوي للأعلى قليلاً تحت الرفعة. هذا الانحناء مقصود في التصميم ويُحسب بدقة في تحليل الإجهاد."},
  slats:{t:"move",vec:[0,-0.03,-0.1],lbl:"تمدّد الشفرات الأمامية",d:"تتقدّم وتنزل لتزيد انحناء مقطع الجناح عند الإقلاع والهبوط، فيتأخر انفصال الهواء."},
  flaps:{t:"rot",ax:"x",pv:"build",a:[0,32],v0:0,lbl:"الفلاب ينزل",d:"يزيد مساحة الجناح وانحناءه فيرتفع الرفع عند السرعات المنخفضة. يتحرك للخلف وللأسفل."},
  aileron:{t:"rot",ax:"x",pv:"build",a:[-20,20],diff:true,v0:0.5,lbl:"الإيليرون يميل",d:"عند اللفّ يرتفع إيليرون ويهبط الآخر، فيختلف الرفع بين الجناحين ويدور الجسم حول محوره الطولي."},
  spoilers:{t:"rot",ax:"x",pv:"build",a:[0,-45],v0:0,lbl:"السبويلرز ترتفع",d:"ترتفع فوق الجناح فتقلل الرفع وتزيد السحب. تُستخدم عند الهبوط لتثبيت الطائرة على الأرض."},
  wingtip:{t:"blink",mk:"nav",spd:3.0,v0:1,lbl:"أنوار الملاحة",d:"الأنوار الحمراء اليسرى والخضراء اليمنى والبيضاء الخلفية، لتُرى الطائرة ليلاً ويعرف الآخرون اتجاهها."},
  stabilizer:{t:"rot",ax:"x",pv:"center",a:[-3,4],v0:0.43,lbl:"ضبط الذيل الأفقي",d:"تتغيّر زاوية الذيل الأفقي لتوازن الطائرة. يُضبط بنظام Trim ويتحرك ببطء."},
  elevator:{t:"rot",ax:"x",pv:"build",a:[-25,20],v0:0.556,lbl:"المصعد يرفع أو ينزل الأنف",d:"المصعد يغيّر الميل: مرفوع يرفع الأنف، ومنخفض يخفضه."},
  fin:{t:"rot",ax:"y",pv:"build",mk:"rudder",a:[-25,25],v0:0.5,lbl:"الدفة تتحرك يميناً ويساراً",d:"الدفة تتحكم بالدوران حول المحور الرأسي، وتعادل الانحراف عند فقد محرك."},
  fuel:{t:"glow",spd:0.8,v0:0.6,col:"#F2C94C",lbl:"الوقود داخل الخزانات",d:"وميض يمثل توزيع الوقود في الأجنحة وخزان المركز. توازنه مهم لمركز ثقل الطائرة."},
  gear_nose:{t:"gear",pv:"build",v0:0,lbl:"عجلة الأنف تُسحب إلى حجرتها",d:"بعد الإقلاع تنفتح أبواب الحجرة ثم تدور رجل الأنف إلى الأمام وتقصر وتدخل بالكامل داخل البدن، وبعدها تُغلق الأبواب على سطح الهيكل فتقل المقاومة."},
  gear_main:{t:"gear",pv:"build",v0:0,lbl:"العجلات الرئيسية تُسحب إلى حجراتها",d:"تنفتح أبواب الحجرة أولاً ثم ترتفع الأرجل الرئيسية: أرجل الجسم إلى الأمام وأرجل الجناح إلى الداخل، فتقصر وتدخل كلها داخل البطن، وبعدها تُغلق الأبواب لتصير مستوية مع الجلد."},
  wheels:{t:"gear",pv:"build",v0:0,lbl:"العجلات تُرفع مع الأرجل",d:"العجلات تتحرك مع أرجل الهبوط في المسار نفسه: تُسحب إلى الحجرة بعد الإقلاع، وتُنزل قبل الهبوط وتُقفل في مكانها."},
  doors:{t:"door",lbl:"الأبواب تنفتح",d:"باب الركاب ينفتح إلى الخارج بعد سحب الدرج الهوائي وفتح الأقفال."},
  windows:{t:"glow",spd:0.6,v0:0,col:"#BFE7FF",lbl:"وهج الزجاج",d:"الزجاج العازل يعكس الضوء. التوهج يوضح أماكن النوافذ على الهيكل، وليس حركة فعلية."},
  apu:{t:"spin",ax:"z",pv:"center",spd:5,v0:0.5,lbl:"وحدة الطاقة المساعدة",d:"APU توفر الكهرباء والهواء المضغوط على الأرض، ويدور عند بدء التشغيل."},
  packs:{t:"glow",spd:1.6,v0:0.6,col:"#7FDBA4",lbl:"تكييف هواء الكابينة",d:"وميض يمثل الهواء المكيّف الذي تنظمه وحدات التكييف (Packs) قبل دخوله الكابينة."},
  hyd:{t:"glow",spd:2.5,v0:0.6,col:"#56CCF2",lbl:"ضغط الهيدروليك",d:"نبضات تمثل السائل تحت ضغط عالٍ يتدفق إلى المشغّلات مثل الأجنحة والعجلات."},
  avionics:{t:"glow",spd:2.8,v0:0.6,col:"#BB6BD9",lbl:"إلكترونيات الطيران",d:"وميض يمثل نشاط الحواسيب والمعالجات داخل حامل الإلكترونيات."},
  /* engine parts (the nacelle is split so each piece moves on its own) */
  eng_inlet:{t:"glow",spd:1.4,v0:0,col:"#FFB347",lbl:"تسخين شفة المدخل ضد الجليد",d:"يُسخَّن مدخل الهواء بهواء ساخن مسحوب من الضاغط لمنع تكوّن الجليد في الطيران. الوهج يمثل هذا التسخين، وليس حركة ميكانيكية."},
  eng_fancowl:{t:"glow",spd:0.9,v0:0,col:"#7FB6FF",lbl:"القناة الخارجية (Bypass)",d:"أغلب هواء المروحة يمر في هذه القناة دون أن يُحرق، فيعطي معظم الدفع. الوهج يوضح مسار هذا الهواء."},
  eng_fandoor:{t:"rot",ax:"z",pv:"build",a:[0,-45],v0:0,lbl:"باب غطاء المروحة",d:"الباب العلوي للغلاف يُفتح على مفصلة جانبية للوصول إلى المروحة وفحص الشفرات. الإغلاق يتم بالمشابك."},
  eng_tr:{t:"move",vec:[0,0,0.35],unit:"ln",v0:0,lbl:"معكوس الدفع يتحرك للخلف",d:"عند الهبوط يتحرك الغلاف الخلفي إلى الخلف فتنكشف شرائح توجّه هواء المروحة إلى الأمام، فتتباطأ الطائرة."},
  eng_nozzle:{t:"glow",spd:1.8,v0:0,col:"#FF8A3D",lbl:"فوهة العادم الساخنة",d:"الغاز الساخن يخرج من الفوهة بسرعة عالية. الوهج يمثل حرارة العادم وليس حركة فعلية."},
  eng_fan:{t:"spin",ax:"z",pv:"center",spd:9,v0:0.6,lbl:"دوران المروحة",d:"المروحة وشفراتها تدور بسرعة عالية وتسحب الهواء من المدخل. السرعة هنا تتبع المنزلق."},
  eng_core:{t:"glow",spd:2.2,v0:0.6,col:"#FF6A3D",lbl:"الاحتراق داخل القلب",d:"داخل الغلاف يُخلط الهواء المضغوط بالوقود فيُحرق. الوهج يمثل نبضات الاحتراق، ويظهر في وضع الأشعة (X-ray)."},
  eng_pylon:{t:"glow",spd:1.2,v0:0,col:"#F2994A",lbl:"الحمل من المحرك إلى الجناح",d:"عمود التعليق ينقل وزن المحرك ودفعه إلى الجناح. الوهج يوضح مسار الحمل، وليس حركة فعلية."}
};

/* pivot point from a mesh's geometry (world coordinates, after the mirror bake) */
function pivotOf(g,kind){
  const p=g.attributes.position.array; let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9,mA=1e9;
  for(let i=0;i<p.length;i+=3){ const x=p[i],y=p[i+1],z=p[i+2];
    if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; if(z<z0)z0=z; if(z>z1)z1=z; if(Math.abs(x)<mA) mA=Math.abs(x); }
  const cx=(x0+x1)/2, cy=(y0+y1)/2, cz=(z0+z1)/2;
  if(kind==="center") return new THREE.Vector3(cx,cy,cz);
  const avg=sel=>{ let sx=0,sy=0,sz=0,n=0; for(let i=0;i<p.length;i+=3){ if(sel(p[i],p[i+1],p[i+2])){ sx+=p[i]; sy+=p[i+1]; sz+=p[i+2]; n++; } } return n?new THREE.Vector3(sx/n,sy/n,sz/n):new THREE.Vector3(cx,cy,cz); };
  const tz=0.03*(z1-z0)+0.02, ty=0.03*(y1-y0)+0.02, tx=0.03*Math.abs(x1-x0)+0.02;
  if(kind==="fmin"){ const a=avg((x,y,z)=>z<z0+tz); return new THREE.Vector3(a.x,a.y,z0); }
  if(kind==="fmax"){ const a=avg((x,y,z)=>z>z1-tz); return new THREE.Vector3(a.x,a.y,z1); }
  if(kind==="root"){ const a=avg((x,y,z)=>Math.abs(x)<mA+tx); return new THREE.Vector3(0,a.y,a.z); }
  if(kind==="bottom"){ const a=avg((x,y,z)=>y<y0+ty); return new THREE.Vector3(a.x,y0,a.z); }
  if(kind==="top"){ const a=avg((x,y,z)=>y>y1-ty); return new THREE.Vector3(a.x,y1,a.z); }
  return new THREE.Vector3(cx,cy,cz);
}
/* mirror a geometry (scale -1 on x) and fix the winding so normals still face outwards */
function bakeMirror(g){
  g.applyMatrix4(new THREE.Matrix4().makeScale(-1,1,1));
  const ix=g.index;
  if(ix){ const a=ix.array; for(let i=0;i<a.length;i+=3){ const t=a[i+1]; a[i+1]=a[i+2]; a[i+2]=t; } ix.needsUpdate=true; }
  else { const arr=g.attributes.position.array; for(let i=0;i<arr.length;i+=9) for(let k=0;k<3;k++){ const t=arr[i+3+k]; arr[i+3+k]=arr[i+6+k]; arr[i+6+k]=t; } g.attributes.position.needsUpdate=true; }
  g.computeVertexNormals(); return g;
}
/* after the builder runs: bake mirrored meshes, give animated meshes their pivot, keep door data */
function prepAnim(B){
  const belly0=B.bellies?B.bellies.slice():[];
  B.root.children.slice().forEach(m=>{
    if(m.isInstancedMesh||!m.geometry) return;
    const u=m.userData; if(!u||!u.id) return;
    const an=ANIM[u.id], mirror=m.scale.x<0;
    const orig=m.geometry; let g=m.geometry.clone();
    let piv=u.piv?new THREE.Vector3(u.piv[0],u.piv[1],u.piv[2]):null;
    if(mirror){ g=bakeMirror(g); m.scale.set(1,1,1); if(piv) piv.x=-piv.x; }
    if(u.hinge){ const h=u.hinge, ax=new THREE.Vector3(h[1][0]-h[0][0],h[1][1]-h[0][1],h[1][2]-h[0][2]); if(mirror) ax.x=-ax.x; ax.normalize(); u.axis=[ax.x,ax.y,ax.z]; }
    m.geometry=g;
    if(B.bellies){ const e0=belly0.find(e=>e.geom===orig); if(e0) B.bellies.push({geom:g,mat:e0.mat,t:e0.t,key:""}); }
    u.P=null;
    if(an&&an.pv&&(!an.mk||(m.material&&m.material.userData.mk===an.mk))){
      const pv=(an.pv==="build")?(piv||pivotOf(g,"center")):pivotOf(g,an.pv);
      g.translate(-pv.x,-pv.y,-pv.z); u.P=[pv.x,pv.y,pv.z];
    }
  });
  if(B.bellies) B.bellies=B.bellies.filter(e=>belly0.indexOf(e)<0);
  ffGearPlan(B);
}

