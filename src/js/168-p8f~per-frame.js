/* ---------- per-frame ---------- */
function flyInputs(dt){
  if(typeof fkGateStep==="function") fkGateStep(dt);
  if(typeof feStep==="function") feStep(dt);
  if(typeof faStep==="function") faStep(dt);   /* fa: route, top of descent, arrival configuration, rollout */
  const s=FLY.s, k=FLY.keys, kb=FLY.kb, ap=(a,t,r)=>a+Math.max(-r*dt,Math.min(r*dt,t-a));
  kb.p=ap(kb.p,(k.down?1:0)-(k.up?1:0),3); kb.r=ap(kb.r,(k.right?1:0)-(k.left?1:0),3); kb.y=ap(kb.y,(k.yr?1:0)-(k.yl?1:0),3);
  s.inp.p=Math.max(-1,Math.min(1,FLY.stick.y+kb.p)); s.inp.r=Math.max(-1,Math.min(1,FLY.stick.x+kb.r)); s.inp.y=Math.max(-1,Math.min(1,FLY.rud+kb.y));
  if(k.thUp) fphSetLever(s,Math.min(1,s.lever+0.45*dt)); if(k.thDn) fphSetLever(s,Math.max(s.ground?-1:0,s.lever-0.45*dt));
  s.brake=(FLY.brake||s.parkBrake)?1:0;
  if(s.ap.on&&(Math.abs(s.inp.p)>0.35||Math.abs(s.inp.r)>0.4)){ s.ap.on=false; s.ap.appr=false; flyMsg("تم فصل الطيار الآلي",2); flyApRefresh(); }
  if(s.ground&&FLY.rev&&s.lever>-0.3) FLY.rev=false; if(!s.ground) FLY.rev=false;
  if(s.failAt&&!s.failDone&&fphInfo(s).ias>=s.failAt.ias){ s.eng[s.failAt.eng]=false; s.failDone=true; flyMsg("فشل محرك! ثبّت الاتجاه بالدفّة",5); FLY.evLog.push("engine failure"); }
}
function flyEvents(){
  const s=FLY.s;
  if(s.ev.touch&&FLY.touchSeen!==s.ev.touch){ FLY.touchSeen=s.ev.touch; flyScoreTouch(s.ev.touch); FLY.evLog.push("touchdown "+Math.round(s.ev.touch.sink)+" fpm"); }
  if(s.ev.crash&&!FLY.crashSeen){ FLY.crashSeen=s.ev.crash; flyScore(null,true); }
  if(FLY.msgT>0&&FLY.msgT<90){ FLY.msgT-=0.016; if(FLY.msgT<=0) flyMsg("",0); }
  if(s.ground&&s.scn==="approach"&&s.ev.touch){ const gs=fphInfo(s).gs; if(gs<3&&!FLY.scoreShown&&FLY.score){ FLY.scoreShown=true; flyScore(s.ev.touch,false); } if(gs>3&&s.p.z<-FPH_RWY.len-60&&!FLY.crashSeen){ FLY.crashSeen="overrun"; flyScore(null,true); } }
}
function flyScoreTouch(t){
  const sink=t.sink, off=Math.abs(t.x), td=-t.z; let st=3; const issues=[];
  if(sink>180) st--; if(sink>360) st--; if(off>6) st--; if(off>14) st--; if(td<150||td>1000) st--; if(td<0||td>1800) st--; st=Math.max(0,st);
  FLY.score={sink,off,td,ias:t.ias,pitch:t.pitch,st,onRwy:t.onRwy};
}
function flyScore(t,crash){
  const el=document.getElementById("fScore"); if(!el) return; const s=FLY.s, sc=FLY.score;
  if(!crash&&sc&&!sc.lvDone){ sc.lvDone=1; try{ const t=Date.now(); lvMark("landac:"+FLY.key); if(FLY.opts.load==="cargo"&&(typeof fplKg!=="function"||fplKg()>0)) lvMark("cargo:"+t);   /* a cargo flight with no cargo does not count */ if(sc.sink<300) lvMark("smooth:"+t); lvAward("f","land:"+t,10+(sc.sink<300?10:sc.sink<700?5:0)); }catch(e){} }   /* flying level: a landing scores more when it is smooth */
  let html;
  if(crash){ const why=FLY.crashSeen==="hard"?"هبوط عنيف جداً تجاوز تحمّل جهاز الهبوط.":FLY.crashSeen==="belly"?"لمست الطائرة المدرج وعجلاتها غير منزلة.":FLY.crashSeen==="overrun"?"خرجت الطائرة من نهاية المدرج.":"حدث تحطّم.";
    html=`<h3>تحطّمت الطائرة</h3><p>${why}</p><div class="fsbtn"><button type="button" class="btn pri" data-fs="again">أعد المحاولة</button><button type="button" class="btn" data-fs="exit">رجوع</button></div>`; }
  else if(sc){ const grade=sc.sink<150?"ممتاز":sc.sink<300?"جيد جداً":sc.sink<500?"جيد":sc.sink<700?"هبوط ثقيل":"هبوط عنيف";
    let best=null; try{ best=JSON.parse(localStorage.getItem("atlas-fly-best")||"null"); }catch(e){}
    const total=sc.st; if(!best||total>best.st||(total===best.st&&sc.sink<best.sink)){ best={st:total,sink:Math.round(sc.sink)}; try{ localStorage.setItem("atlas-fly-best",JSON.stringify(best)); }catch(e){} }
    html=`<h3>هبطت بسلام</h3><div class="stars" aria-label="${sc.st} من 3 نجوم">${[0,1,2].map(i=>`<span class="${i<sc.st?"on":""}">★</span>`).join("")}</div>
      <ul><li>معدل النزول عند اللمس: <b>${Math.round(sc.sink)} قدم/دقيقة</b> (${grade})</li><li>الانحراف عن خط المنتصف: <b>${sc.off.toFixed(1)} م</b></li><li>مكان اللمس بعد بداية المدرج: <b>${Math.round(sc.td)} م</b> (المثالي بين 150 و900)</li><li>سرعة اللمس: <b>${Math.round(sc.ias)} kt</b></li></ul>
      <p class="status">أفضل نتيجة لك: ${best.st} نجوم، بمعدل نزول ${best.sink} قدم/دقيقة.</p>
      <div class="fsbtn"><button type="button" class="btn pri" data-fs="again">أعد السيناريو</button><button type="button" class="btn" data-fs="coach">حلّل هبوطي</button><button type="button" class="btn" data-fs="exit">رجوع</button></div>`; }
  else return;
  try{ bobFlightScore(sc,crash); }catch(e){}
  el.innerHTML=html; el.hidden=false; const co=el.querySelector('[data-fs="coach"]'); if(co) getSample().then(sm=>{ if(!sm) co.remove(); });
  el.onclick=e=>{ const b=e.target.closest("[data-fs]"); if(!b) return; if(b.dataset.fs==="again"){ el.hidden=true; flyReset(); } else if(b.dataset.fs==="exit") flyStop(); else if(b.dataset.fs==="coach"){ el.hidden=true; flyCoach("حلّل هبوطي: ما الذي أجدته وما الذي أحسّنه؟ اذكر نقطتين فقط."); } };
}
/* fixed-step update so physics does not depend on the frame rate */
function flyStepFor(sec){ const s=FLY.s; let t=sec; while(t>1e-6){ const d=Math.min(1/60,t); flyInputs(d); fphUpdate(s,d); t-=d; } flyAircraft(); }
function flyFrame(ts){
  if(!FLY.on) return; FLY.raf=requestAnimationFrame(flyFrame);
  let dt=Math.min(0.1,(ts-FLY.last)/1000||0.016); FLY.last=ts; const s=FLY.s; if(!s) return;
  if(!FLY.paused){ const kk=typeof faScale==="function"?faScale():1; FLY.acc+=dt*kk; let n=0; while(FLY.acc>=1/60&&n<6*kk){ flyInputs(1/60); fphUpdate(s,1/60); FLY.acc-=1/60; n++; } if(n>=6*kk) FLY.acc=0; flyEvents(); }   /* fa: time compression runs more steps per frame, same step size */
  FLY.dtF=dt; fgQualityTick(dt); if(typeof faFrame==="function") faFrame(dt); const info=fphInfo(s); if(typeof ftFrame==="function") try{ ftFrame(dt,s,info); }catch(e){}   /* fa: whiteout and world swap on real time */ flyAircraft(info); flyCamera(dt,info); if(typeof ffSndUpdate==="function") try{ ffSndUpdate(info,s,dt); }catch(e){} FLY.W.fx.update(dt,s,info,FLY.paused);
  FLY.W.update(FLY.cam,s.p,fphEuler(s.q).hdg*Math.PI/180,s.A.b,s.last.agl,info,dt,GEO[FLY.key].L,s.v); FLY.ren.render(FLY.scene,FLY.cam);
  flyHud(info,ts); if(ts-FLY.tDom>120){ FLY.tDom=ts; flyDom(info); } if(FLY.view==="cockpit"&&ts-(FLY.tHide||0)>1000){ FLY.tHide=ts; flyCockpitHide(); }
}
function flyAircraft(info){
  const s=FLY.s, B=FLY.B; if(!B) return; const A=s.A, cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  FLY.pivot.position.copy(s.p); FLY.pivot.quaternion.copy(s.q);
  const stk=s.inp, rev=s.ground&&s.lever<0, nm=s.n1.reduce((a,b)=>a+b,0)/s.n1.length;
  const set=(id,v)=>GL.setAnim(id,cl(v,0,1),false);
  set("aileron",0.5-0.5*cl(stk.r+(s.ap.on&&s.cmd.hasRoll?s.cmd.apRoll/A.pmax:0),-1,1));
  set("elevator",(-cl(stk.p+(s.ap.on?s.cmd.apNz:0),-1,1)*20+25)/45); set("fin",0.5+0.5*cl(stk.y,-1,1));
  set("flaps",s.flaps/4); set("slats",s.flaps>0.2?1:0); set("spoilers",s.spoil);
  ["gear_nose","gear_main","wheels"].forEach(id=>set(id,1-s.gear));
  set("eng_fan",0.12+0.88*nm); set("eng_tr",rev?Math.min(1,Math.max(0,-s.lever)*1.2):0);
  GL.pose();
}
function flyCamera(dt,info){
  const s=FLY.s, cam=FLY.cam, A=s.A, c=GEO[FLY.key], L=c.L, V3=THREE.Vector3, Q=THREE.Quaternion, q=s.q, p=s.p, v=FLY.view, lk=FLY.look;
  const cgZ=A.cgX-L/2; const body=(x,y,z)=>new V3(x,y,z).applyQuaternion(q).add(p);
  if(v==="cockpit"){
    cam.fov=72/Math.max(0.6,Math.min(1.6,lk.zoom)); const e=A.eye; cam.position.copy(body(e[0],e[1]-A.hm+FLY_SINK,e[2]-cgZ));
    if(lk.snap){ lk.yaw*=Math.exp(-dt*0.8); lk.pitch*=Math.exp(-dt*0.8); }
    { const lm=flyLookLim(); lk.yaw=Math.max(-lm.yaw,Math.min(lm.yaw,lk.yaw)); lk.pitch=Math.max(lm.dn,Math.min(lm.up,lk.pitch)); }   /* (v37) the head turns to the side window and no further */
    cam.quaternion.copy(q).multiply(new Q().setFromEuler(new THREE.Euler(lk.pitch*0.9,lk.yaw,0,"YXZ")));
  } else if(v==="chase"||v==="orbit"){
    const e=fphEuler(q), tgtH=e.hdg*Math.PI/180, tgtP=Math.max(-0.4,Math.min(0.5,e.pitch*Math.PI/180*0.55)), ch=FLY.chase;
    if(!ch.init){ ch.hdg=tgtH; ch.pit=tgtP; ch.init=true; ch.pos=null; }
    let dh=tgtH-ch.hdg; dh=Math.atan2(Math.sin(dh),Math.cos(dh)); const k=1-Math.exp(-dt*(v==="chase"?2.6:5)); ch.hdg+=dh*k; ch.pit+=(tgtP-ch.pit)*k;
    const r=Math.max(L*(v==="chase"?0.95:1.9)*lk.zoom,Math.max(L-A.cgX,v==="orbit"?c.span/2:0)+8), yaw=ch.hdg+(v==="orbit"?lk.yaw:lk.yaw), pit=(v==="orbit"?lk.pitch:0.16+lk.pitch*0.6)+ch.pit*0.5;
    const dir=new V3(-Math.sin(yaw)*Math.cos(pit),Math.sin(pit),Math.cos(yaw)*Math.cos(pit));   /* from the aircraft towards the camera, behind it */
    const want=p.clone().add(dir.multiplyScalar(r)), fl=Math.max(3.5,p.y*0.5); if(want.y<fl) want.y=fl;   /* floor relative to the aircraft height: not a flat 2 m that hugs the pavement */ cam.position.copy(want); cam.fov=v==="chase"?55:50; cam.up.set(0,1,0); cam.lookAt(p.clone().add(new V3(0,-L*(v==="chase"?0.1:0.04),0)));
  } else if(v==="wing"){
    cam.position.copy(body(c.span/2*0.46,2.4+(FLY.key==="a380"?1.2:FLY.key==="b747"?0.6:0),L*0.05)); cam.fov=62/Math.max(0.6,Math.min(1.6,lk.zoom)); cam.up.copy(new V3(0,1,0).applyQuaternion(q)); cam.lookAt(body(0,A.hm*0.35,-L*0.34)); cam.rotateY(lk.yaw*0.4); cam.rotateX(lk.pitch*0.4);
  } else { /* spotter: stands beside the runway and follows the aircraft; the lens narrows with distance */
    const Lw=FLY.W&&FLY.W.L, sg=Lw&&Lw.sg?Lw.sg:1, sx=-sg*170, sz=Math.max(-3300,Math.min(600,p.z)), pos=new V3(sx,6,sz); { const dd=Math.hypot(pos.x-p.x,pos.z-p.z), mn=c.span/2+30; if(dd<mn&&dd>0.01){ pos.x=p.x+(pos.x-p.x)/dd*mn; pos.z=p.z+(pos.z-p.z)/dd*mn; } } cam.position.copy(pos); cam.up.set(0,1,0); cam.lookAt(p);
    const d=Math.max(30,pos.distanceTo(p)); cam.fov=Math.max(5,Math.min(60,2*Math.atan(55*lk.zoom/d)*180/Math.PI));
  }
  if(cam.position.y<1.5) cam.position.y=1.5; if(typeof fdCamView==="function") fdCamView(cam,v); cam.updateProjectionMatrix();
  fgCamMotion(dt,FLY.s,info,cam,v);
}
