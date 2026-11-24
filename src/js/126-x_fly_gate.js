/* ---------- fk: the gate scenario («من البوابة»). The player's aircraft stands nose-in at a stand with the jet bridge docked and the ground crew around it.
   A small state machine drives: boarding checklist -> request pushback -> tug connects -> pushback along a curved path (kinematic, <= 3 kt) -> engine start in sequence ->
   tug leaves, crew signals -> taxi along a drawn route (speed advice, pavement and building checks, hold short) -> line up -> takeoff clearance -> the normal takeoff.
   Hooks (all feature-detected from p8f.js / p8p.js / p8h.js): fkGateInit, fkGateStep, fkGateStop, fkGatePose, fkMapDraw. Radio lines are {ar,en} and spoken by Bobby when he is there. ---------- */
const FKG={ph:"off"};
function fkLang(){ try{ if(typeof ilLang==="function") return ilLang()==="en"?"en":"ar"; }catch(e){} try{ if(typeof I18N!=="undefined"&&I18N&&I18N.lang) return I18N.lang; }catch(e){} try{ if(typeof BOB!=="undefined"&&BOB&&BOB.lang) return BOB.lang; }catch(e){} const l=(document.documentElement.getAttribute("lang")||"ar"); return /^en/i.test(l)?"en":"ar"; }
const fkTx=o=>typeof o==="string"?o:(fkLang()==="en"?o.en:o.ar);
function fkSay(o,opt){ if(typeof faAtcSilences==="function"&&opt&&faAtcSilences(opt.key)) return;   /* fa: the controller speaks these ground lines */ try{ if(typeof bobSay==="function") bobSay(fkTx(o),Object.assign({priority:"high"},opt||{})); }catch(e){} }
const FKG_T={
  board:{ar:"الركاب على متن الطائرة. أكمل قائمة الفحص ثم اطلب الدفع للخلف.",en:"Boarding is complete. Finish the checklist, then request pushback."},
  chk:[{ar:"الركاب صعدوا والأبواب أُغلقت",en:"Passengers aboard, doors closed"},{ar:"جسر الركاب ينسحب",en:"Jet bridge retracting"},{ar:"وحدة الطاقة المساعدة (APU) تعمل",en:"APU running"},{ar:"منارة التصادم تعمل",en:"Beacon on"},{ar:"القلابات والتوازن مضبوطة للإقلاع",en:"Flaps and trim set for takeoff"}],
  ready:{ar:"جاهز. اطلب الدفع للخلف من برج الأرض.",en:"Ready. Request pushback from ground control."},
  req:{ar:"برج الأرض، برجس واحد، أطلب الدفع للخلف.",en:"Ground, Birjis one, request pushback."},
  appr:{ar:"برجس واحد، الدفع للخلف مصرّح، واجه الجنوب.",en:"Birjis one, pushback approved, face south."},
  tug:{ar:"سيارة الدفع تقترب وتتصل بعجلة الأنف.",en:"The tug is coming and connecting to the nose gear."},
  conn:{ar:"ذراع السحب متصل، أُزيلت الوتدات. فرامل الوقوف محرّرة.",en:"Tow bar connected, chocks removed. Parking brake released."},
  push:{ar:"الدفع للخلف جارٍ... بسرعة لا تتجاوز 3 عقد.",en:"Pushing back, at no more than 3 knots."},
  start:{ar:"مصرّح بتشغيل المحركات. شغّل المنارة ثم ابدأ كل محرك بمفاتيح القمرة.",en:"Cleared to start engines. Turn the beacon on, then start each engine with its cockpit switches."},
  started:{ar:"المحركات تعمل. سيارة الدفع تنفصل، وطاقم الأرض يشير: الطريق خالٍ.",en:"Engines running. The tug disconnects and the crew signals all clear."},
  taxi:{ar:"تاكسي إلى المدرج ستة وثلاثين عبر الممر ألفا، وانتظر قبل المدرج. اتبع الخط الأخضر.",en:"Taxi to runway three-six via Alpha, hold short of the runway. Follow the green line."},
  hold:{ar:"وصلت إلى خط الانتظار. اطلب الدخول إلى المدرج.",en:"You are at the hold line. Request to enter the runway."},
  lu:{ar:"ادخل المدرج وحاذِ خط المنتصف، ثم انتظر.",en:"Line up on runway three-six and wait."},
  tko:{ar:"محاذاة ممتازة. اطلب الإقلاع.",en:"Well lined up. Request takeoff."},
  go:{ar:"مصرّح بالإقلاع من المدرج ستة وثلاثين. ادفع الدفع إلى الأقصى.",en:"Cleared for takeoff runway three-six. Push the thrust to maximum."},
  viol:{ar:"قف! دخلت المدرج بدون إذن.",en:"Stop! You entered the runway without clearance."},
  fast:{ar:"السرعة عالية على الممر. الحد 30 عقدة.",en:"Taxi speed is too high. The limit is 30 knots."},
  off:{ar:"خرجت عن الممر المعبّد. عُد إلى الخط الأخضر.",en:"You left the pavement. Return to the green line."},
  bld:{ar:"مبنى أمامك! أُوقفت الطائرة.",en:"A building is ahead! The aircraft was stopped."}
};
const FKG_X={wait:{ar:"اكتمل الدفع للخلف. بانتظار إذن تشغيل المحركات...",en:"Pushback complete. Waiting for engine start clearance..."}};
const FKG_BTN={push:{ar:"اطلب الدفع للخلف",en:"Request pushback"},skip:{ar:"تخطّي القائمة",en:"Skip checklist"},x4:{ar:"تسريع ×4",en:"Speed up ×4"},lineup:{ar:"اطلب الدخول إلى المدرج",en:"Request line up"},takeoff:{ar:"اطلب الإقلاع",en:"Request takeoff"}};
function fkGatePose(key,L){ const A=FPH_AC[key], st=L.stands[L.gate]; return {pos:[L.sg*(L.xn-A.cgX),A.hm-0.12,st.z],hdg:st.hdg}; }
/* rounded polyline through the route corners (quadratic corners of radius r) */
function fkRoute(pts,r){ const o=[pts[0].slice()]; for(let i=1;i<pts.length-1;i++){ const a=pts[i-1], b=pts[i], c=pts[i+1], d1=Math.hypot(b[0]-a[0],b[1]-a[1]), d2=Math.hypot(c[0]-b[0],c[1]-b[1]), rr=Math.min(r,d1*0.45,d2*0.45), p0=[b[0]+(a[0]-b[0])*rr/d1,b[1]+(a[1]-b[1])*rr/d1], p1=[b[0]+(c[0]-b[0])*rr/d2,b[1]+(c[1]-b[1])*rr/d2];
    for(let k=0;k<=8;k++){ const t=k/8, u=1-t; o.push([u*u*p0[0]+2*u*t*b[0]+t*t*p1[0],u*u*p0[1]+2*u*t*b[1]+t*t*p1[1]]); } } o.push(pts[pts.length-1].slice());
  const r2=[o[0]]; for(let i=1;i<o.length;i++){ const a=o[i-1], b=o[i], d=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.ceil(d/20); for(let k=1;k<=n;k++) r2.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]); } return r2; }
function fkOnPave(L,x,z,m){ for(const r of L.rects){ let hx=r[3], hz=r[4]; if(r[0]===1){ hx+=7.5; } if(Math.abs(x-r[1])<=hx+m&&Math.abs(z-r[2])<=hz+m) return true; } return Math.abs(x)<=L.w/2+7.5+m&&z<=0&&z>=-L.len; }
function fkGateKeep(L){ const sg=L.sg, K=[]; const bx=(cx,cz,hx,hz)=>K.push([cx-hx,cx+hx,cz-hz,cz+hz]);
  bx(sg*(L.xf+55),L.term.z,62,L.term.len/2+8); bx(sg*(L.xf+160),L.term.z,46,L.term.len*0.36+6); bx(sg*(L.xf+250),L.term.z,38,L.term.len*0.25+6); L.hangars.forEach(([x,z,l])=>bx(x,z,70,l*0.65+6)); bx(L.tower.x,L.tower.z,16,16); bx(L.tanks.x+sg*51,L.tanks.z-51,66,66);   /* (v24) the bigger terminal, car park, hangars, tower and fuel farm */ L.masts.forEach(([x,z])=>bx(x,z,2,2)); return K; }
const FKG_M={};   /* shared little materials */
function fkGateMats(){ if(FKG_M.ok) return FKG_M; const M=(c,r,m)=>new THREE.MeshStandardMaterial({color:c,roughness:r===undefined?0.6:r,metalness:m||0});
  Object.assign(FKG_M,{ok:1,grey:M("#9aa2a8",0.6),white:M("#e9ebec",0.55),yel:M("#e8c21d",0.6),dark:M("#2b3136",0.5),ribbon:new THREE.MeshBasicMaterial({color:0x35f08a,transparent:true,opacity:0.78,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})}); return FKG_M; }
/* the player's jet bridge: a tunnel that can be shortened, a rotunda at the terminal and a cab that docks at the door */
function fkGateBridge(F){ const L=F.L, sg=L.sg, M=fkGateMats(), g=new THREE.Group(), A=F.A, key=F.key, d=(GEO[key].doorList||[]).find(q=>q.deck==="main"&&q.side==="both")||{X:6,z:A.hm*0.75}, hwF={a380:3.6,b737:2.1,b747:3.5}[key]||3.2;
  const xd=L.xn-d.X+0.4, zb=L.stands[L.gate].z-hwF-2.1, y=d.z, xr=L.xf-4;   /* positive-side x of the door, bridge z, door height, rotunda */
  const tun=new THREE.Mesh(new THREE.BoxGeometry(1,3.2,3.0),M.grey), cab=new THREE.Mesh(new THREE.BoxGeometry(4.2,3.4,4.2),M.yel), rot=new THREE.Mesh(new THREE.CylinderGeometry(3.4,3.4,y+0.8,14),M.white), col=new THREE.Mesh(new THREE.BoxGeometry(2.4,y-1.6,2.4),M.grey);
  g.add(tun,cab,rot,col); rot.position.set(sg*xr,(y+0.8)/2,zb);
  F.br={g,tun,cab,col,xd,xr,zb,y,x:xd}; F.bridgeSet=(x)=>{ F.br.x=x; const len=Math.abs(xr-x); tun.scale.x=Math.max(0.5,len); tun.position.set(sg*(x+xr)/2,y,zb); cab.position.set(sg*(x-1.0),y,zb); col.position.set(sg*(x+xr)/2,(y-1.6)/2,zb); };
  F.bridgeSet(xd); return g; }
function fkGateScenery(F){
  const W=F.W, L=F.L, s=F.s, A=F.A, key=F.key, sg=L.sg, hdg=s.q?fphEuler(s.q).hdg:L.stands[L.gate].hdg, G=new THREE.Group(); F.grp=G; W.scene.add(G);
  if(typeof apGseKit!=="function") return;
  const K=apGseKit(); try{ K.night(!!W.night); }catch(e){}
  const body=new THREE.Group(), c=GEO[key], hw={a380:3.6,b737:2.1,b747:3.5}[key]||3.2, dn=A.dn, cg=A.cgX, cargo=(c.doorList||[]).find(q=>q.deck==="cargo"&&q.side==="R"), zc=(cargo?cargo.X:10)-cg, big=key!=="b737";
  const put=(o,x,z,ry)=>{ o.g.position.set(x,0,z); o.g.rotation.y=ry||0; body.add(o.g); return o; };
  put(K.gpu(1.7,3.4,1.5),hw+2.4,-cg+4.5,0.2); put(K.train(big?3:2,"bag",2.0,3.2),hw+(big?5.2:3.6),zc-5,0); put(K.train(2,"bag",2.0,3.2),hw+(big?5.2:3.6),zc+9,0);
  try{ if(typeof feFuelTruck==="function") feFuelTruck(K,body,put,c,key,cg); }catch(e){ console.error(e); }   /* fe: the fuel truck at the right wing */
  [[hw+1.4,-cg+3,0.6],[hw+2.4,-cg+7,3.6],[hw+(big?5.2:3.6),zc-1,1.5]].forEach(q=>K.person(body,q[0],0,q[1],q[2],{vest:"y"}));
  [[-(c.span/2)-1.5,-cg+c.L*0.45],[c.span/2+1.5,-cg+c.L*0.45],[0,-cg+c.L+3]].forEach(q=>K.cone(body,q[0],q[1]));
  const wrap=new THREE.Group(); wrap.add(body); wrap.position.set(s.p.x,0,s.p.z); wrap.rotation.y=-hdg*Math.PI/180; F.gse=apMerge(wrap,{cast:false,recv:false}); F.gse.position.copy(wrap.position); F.gse.rotation.copy(wrap.rotation); G.add(F.gse);
  F.chocks=new THREE.Group(); K.chock(F.chocks,0.05,-dn-0.8,1); K.chock(F.chocks,0.05,-dn+0.8,-1); F.chocks.position.copy(wrap.position); F.chocks.rotation.copy(wrap.rotation); G.add(F.chocks);
  /* the tug (child of the aircraft once connected) and the headset man next to the nose gear */
  const tw=key==="b737"?[2.3,4.4,1.05]:[3.6,6.0,1.3], nwR=key==="b737"?0.45:0.62, tow=Math.max(0.4,5-nwR-0.1-(tw[1]/2+0.3)), tug=K.tug(tw[0],tw[1],tw[2],tow); tug.g.position.set(0,-A.hm+FLY_SINK,-dn-5); F.tug=tug.g;
  const hm=new THREE.Group(); [0,1].forEach(p=>{ const q=new THREE.Group(); K.person(q,0,0,0,0,{vest:"o",hat:"y",pose:p?1:0,wand:true}); q.visible=!p; hm.add(q); F.hmP=F.hmP||[]; F.hmP.push(q); }); hm.position.set(-hw-1.2,-A.hm+FLY_SINK,-dn-2.5); hm.rotation.y=-0.9; F.hm=hm;
  /* the bridge */
  F.bridgeG=fkGateBridge(F); G.add(F.bridgeG);
}
function fkGateRoute(F){ const L=F.L, s=F.s, e=F.endPush, cs=L.corners.map(p=>p.slice()), pts=[[e[0],e[1]]].concat(cs); F.route=fkRoute(pts,34);
  const M=fkGateMats(); if(F.rib){ F.W.scene.remove(F.rib); F.rib.geometry.dispose(); }
  const R=F.route, P=[], U=[], I=[]; let acc=0; for(let i=0;i<R.length;i++){ const a=R[Math.max(0,i-1)], b=R[Math.min(R.length-1,i+1)]; let dx=b[0]-a[0], dz=b[1]-a[1], l=Math.hypot(dx,dz)||1; dx/=l; dz/=l; if(i>0) acc+=Math.hypot(R[i][0]-R[i-1][0],R[i][1]-R[i-1][1]);
    P.push(R[i][0]-dz*1.1,0.14,R[i][1]+dx*1.1,R[i][0]+dz*1.1,0.14,R[i][1]-dx*1.1); U.push(0,acc/6,1,acc/6); if(i>0){ const k=(i-1)*2; I.push(k,k+1,k+2,k+1,k+3,k+2); } }
  const cv=document.createElement("canvas"); cv.width=cv.height=64; const g=cv.getContext("2d"); g.strokeStyle="#fff"; g.lineWidth=5; g.lineJoin="miter"; g.beginPath(); g.moveTo(12,32); g.lineTo(32,10); g.lineTo(52,32); g.stroke(); g.fillStyle="#fff"; g.fillRect(29.5,38,5,26);   /* thin dashed centre line + a small chevron per 6 m (fv: no wide ribbon) */ const tx=new THREE.CanvasTexture(cv); tx.wrapS=tx.wrapT=THREE.RepeatWrapping;
  const geo=new THREE.BufferGeometry(); geo.setAttribute("position",new THREE.Float32BufferAttribute(P,3)); geo.setAttribute("uv",new THREE.Float32BufferAttribute(U,2)); geo.setIndex(I);
  const mat=M.ribbon.clone(); mat.map=tx; mat.alphaTest=0.3; mat.side=THREE.DoubleSide; F.rib=new THREE.Mesh(geo,mat); F.rib.frustumCulled=false; F.rib.renderOrder=3; F.W.scene.add(F.rib); }
/* ---------- the panel ---------- */
function fkGatePanel(F){
  let p=document.getElementById("fkGP"); if(!p){ const st=document.createElement("style"); st.textContent=".fkgp{position:absolute;top:calc(env(safe-area-inset-top,0px) + 54px);left:50%;transform:translateX(-50%);z-index:6;max-width:min(92vw,520px);background:rgba(8,16,28,.82);backdrop-filter:blur(6px);color:#eaf2f8;border:1px solid rgba(120,190,255,.28);border-radius:14px;padding:9px 13px;font:600 13px/1.45 system-ui,sans-serif;text-align:center;pointer-events:auto}.fkgp[hidden]{display:none}.fkgp b{display:block;font-size:14px;margin-bottom:3px}.fkgl{list-style:none;margin:4px 0;padding:0;text-align:start;font-weight:500;font-size:12.5px}.fkgl li{opacity:.45}.fkgl li.on{opacity:1;color:#7df0a6}.fkgl li:before{content:'\\25A1  '}.fkgl li.on:before{content:'\\2714  '}.fkgb{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:6px}.fkgb button{font:700 14px system-ui,sans-serif;padding:8px 16px;border-radius:10px;border:0;background:#2e7df6;color:#fff;min-height:40px}.fkgb button.sec{background:rgba(255,255,255,.16)}.fkgp .fkgs{font-weight:500;opacity:.85;font-size:12px}@media(max-height:430px){.fkgp{top:44px;padding:6px 10px;font-size:12px}.fkgl{display:none}}";
    document.head.appendChild(st); p=document.createElement("div"); p.id="fkGP"; p.className="fkgp"; p.hidden=true; p.setAttribute("dir",fkLang()==="en"?"ltr":"rtl"); p.addEventListener("click",e=>{ const b=e.target.closest("button"); if(b) fkGateAct(b.dataset.fk); }); const ov=document.getElementById("fly"); (ov||document.body).appendChild(p); }
  F.panel=p; return p; }
function fkGateRender(F){
  const p=F.panel; if(!p) return; const ph=F.ph, T=FKG_T, B=(k)=>`<button type="button" data-fk="${k}">${fkTx(FKG_BTN[k])}</button>`, S=(k)=>`<button type="button" class="sec" data-fk="${k}">${fkTx(FKG_BTN[k])}</button>`;
  let h="", show=true; p.setAttribute("dir",fkLang()==="en"?"ltr":"rtl");
  const title={board:{ar:"من البوابة",en:"At the gate"},ready:{ar:"من البوابة",en:"At the gate"},tug:{ar:"الدفع للخلف",en:"Pushback"},push:{ar:"الدفع للخلف",en:"Pushback"},fuel:{ar:"التزويد بالوقود",en:"Refuelling"},start:{ar:"تشغيل المحركات",en:"Engine start"},disc:{ar:"تشغيل المحركات",en:"Engine start"},taxi:{ar:"التاكسي",en:"Taxi"},hold:{ar:"خط الانتظار",en:"Hold short"},lineup:{ar:"المحاذاة",en:"Line up"},tko:{ar:"جاهز للإقلاع",en:"Ready for takeoff"},go:{ar:"الإقلاع",en:"Takeoff"}}[ph];
  if(!title){ p.hidden=true; return; }
  if(!((ph==='taxi'&&F.t>=9||ph==='lineup'&&F.t>=8)&&!F.msg)) h+=`<b>${fkTx(title)}</b>`;
  if(ph==="board") h+=`<div class="fkgs">${fkTx(T.board)}</div><ul class="fkgl">${T.chk.map((c,i)=>`<li class="${F.chk>i&&(i!==3||typeof FE==="undefined"||FE.bcn)?"on":""}">${fkTx(c)}</li>`).join("")}</ul><div class="fkgb">${S("skip")}</div>`;
  else if(ph==="fuel") h+=feFuelPanel(F);
  else if(ph==="ready") h+=`<div class="fkgs">${fkTx(T.ready)}</div><div class="fkgb">${B("push")}${typeof feFuelBtn==="function"?feFuelBtn():""}</div>`;
  else if(ph==="tug") h+=`<div class="fkgs">${fkTx(T.tug)}</div>`;
  else if(ph==="push") h+=`<div class="fkgs">${fkTx(T.push)} ${Math.round(F.pushV/F.k/0.5144*10)/10} kt</div><div class="fkgb">${S("x4")}</div>`;
  else if(ph==="start") h+=`<div class="fkgs">${window.feStartApproved===true?fkTx(T.start):fkTx(FKG_X.wait)} · ${fkLang()==="en"?"Engines running":"المحركات تعمل"} ${F.engStarted||0}/${F.A.n}</div>`;
  else if(ph==="disc") h+=`<div class="fkgs">${fkTx(T.started)}</div>`;
  else if(ph==="taxi") h+=`<div class="fkgs">${F.msg?fkTx(F.msg):(F.t<9?fkTx(T.taxi):(fkLang()==="en"?"Follow the green line":"اتبع الخط الأخضر"))} · ${Math.round(F.gs)} kt</div>`;
  else if(ph==="hold") h+=`<div class="fkgs">${fkTx(T.hold)}</div><div class="fkgb">${B("lineup")}</div>`;
  else if(ph==="lineup") h+=`<div class="fkgs">${F.msg?fkTx(F.msg):(F.t<8?fkTx(T.lu):(fkLang()==="en"?"Line up on the centre line":"حاذِ خط المنتصف"))}</div>`;
  else if(ph==="tko") h+=`<div class="fkgs">${fkTx(T.tko)}</div><div class="fkgb">${B("takeoff")}</div>`;
  else if(ph==="go") h+=`<div class="fkgs">${fkTx(T.go)}</div>`;
  if(h!==F.lastH){ p.innerHTML=h; F.lastH=h; } p.hidden=!show; }
/* ---------- init / stop ---------- */
function fkGateStop(){ const F=FKG; if(F.W&&F.grp){ F.W.scene.remove(F.grp); F.grp.traverse(o=>{ if(o.geometry) o.geometry.dispose(); }); } if(F.W&&F.rib){ F.W.scene.remove(F.rib); F.rib.geometry.dispose(); } if(F.tug&&F.tug.parent) F.tug.parent.remove(F.tug); if(F.hm&&F.hm.parent) F.hm.parent.remove(F.hm); const p=document.getElementById("fkGP"); if(p) p.hidden=true; FKG.ph="off"; FKG.grp=null; FKG.rib=null; }
function fkGateInit(W,s){
  fkGateStop(); if(!s||s.scn!=="gate"||!W||!W.L) return;
  const L=W.L, key=s.key, A=s.A, F=FKG; Object.assign(F,{ph:"board",t:0,W,L,s,key,A,chk:0,k:1,pushV:0,sig:0,e0:0,engStarted:0,msg:null,msgT:0,warn:{},cleared:false,viol:false,gs:0,keep:fkGateKeep(L),lastH:"",tugT:0,tugOut:0,hmT:0});
  try{ fkGateScenery(F); }catch(e){ console.error(e); }
  F.pivot=FLY.pivot; fkGatePanel(F);
  /* the pushback plan in the positive-side frame (x along the stand, z south): straight back, then a quarter turn to face south */
  const dm=A.dm||5, cg=A.cgX, M0x=L.xn-cg-dm, R=Math.max(30,(A.dn+dm)*1.6), DA=Math.max(6,M0x-R-L.xl); F.pl={R,DA,S:DA+R*Math.PI/2,Mx:M0x,Mz:L.stands[L.gate].z,h:90,sg:0,Lb:A.dn+dm,dm};
  F.endPush=[L.sg*L.xl,L.stands[L.gate].z-R]; s.eng.fill(false); s.n1.fill(0); s.parkBrake=true; s.lever=0; s.taxi=true;
  fkGateRender(F); fkSay(FKG_T.board,{key:"fkg_board",keyMs:1000});
}
try{ window.addEventListener("fe-start-approved",()=>{ if(FKG.ph==="start") fkGateRender(FKG); }); }catch(e){}   /* the start clearance arrives: refresh the panel text */
/* ---------- actions ---------- */
function fkGateAct(a){ const F=FKG; if(F.ph==="off") return;
  if(typeof feFuelAct==="function"&&feFuelAct(F,a)){ fkGateRender(F); return; }
  if(a==="skip"&&F.ph==="board"){ F.chk=5; F.t=99; fkGateReady(F); }
  else if(a==="push"&&F.ph==="ready"){ F.ph="tug"; F.t=0; fkSay(FKG_T.req,{key:"fkg_req",keyMs:500}); setTimeout(()=>fkSay(FKG_T.appr,{key:"fkg_appr",keyMs:500}),600); fkTugIn(F); }
  else if(a==="x4"&&F.ph==="push"){ F.k=F.k===1?4:1; }
  else if(a==="lineup"&&F.ph==="hold"){ F.ph="lineup"; F.cleared=true; F.msg=null; fkSay(FKG_T.lu,{key:"fkg_lu",keyMs:500}); }
  else if(a==="takeoff"&&F.ph==="tko"){ F.ph="go"; F.s.taxi=false; F.s.parkBrake=false; fkSay(FKG_T.go,{key:"fkg_go",keyMs:500}); if(F.rib) F.rib.visible=false; }
  fkGateRender(F); }
function fkGateReady(F){ if(F.ph!=="board") return; if(typeof feFuelBegin==="function"&&feFuelBegin(F)){ fkGateRender(F); return; } F.ph="ready"; F.bridgeSet&&F.bridgeSet(F.br.xr-14); const s=F.s, A=F.A; s.flaps=s.flapsT=A.takeoffFlaps; fkSay(FKG_T.ready,{key:"fkg_ready",keyMs:500}); }
function fkTugIn(F){ F.tugT=0; F.W.scene.add(F.tug); F.tug.visible=true; }
/* ---------- per physics step ---------- */
function fkGateStep(dt){
  const F=FKG; if(F.ph==="off"||!F.s||F.s!==FLY.s) return; const s=F.s, L=F.L, A=F.A, sg=L.sg, ph=F.ph; F.t+=dt;
  try{ if(typeof BOBF!=="undefined"&&ph!=="go") BOBF.hold=performance.now()+3000; }catch(e){}
  const gsv=Math.hypot(s.v.x,s.v.z)/FPH_KT; F.gs=gsv;
  if(ph==="board"){ const n=Math.min(5,Math.floor(F.t/2.2)); if(n!==F.chk){ F.chk=n; if(n>=2&&F.bridgeSet){} fkGateRender(F); } if(F.bridgeSet&&F.t>3.5){ const k=Math.min(1,(F.t-3.5)/6); F.bridgeSet(F.br.xd+(F.br.xr-14-F.br.xd)*k); } if(F.t>=11.5) fkGateReady(F); fkGateRender(F); }
  else if(ph==="fuel"){ s.parkBrake=true; feFuelStep(F,dt); }
  else if(ph==="tug"){ F.tugT+=dt; const k=Math.min(1,F.tugT/5), tg=F.tug, yaw=-fphEuler(s.q).hdg*Math.PI/180, ey=new THREE.Euler(0,yaw,0); tg.quaternion.setFromEuler(ey);
    tg.position.set(0,0,-A.dn-5-(1-k)*22).applyQuaternion(tg.quaternion).add(s.p); tg.position.y=0;
    if(F.tugT>=6.5){ F.W.scene.remove(tg); tg.position.set(0,-A.hm+FLY_SINK,-A.dn-5); tg.quaternion.identity(); F.pivot.add(tg); if(F.chocks) F.chocks.visible=false; F.gse.visible=false; if(F.bridgeG) F.bridgeG.visible=true; F.ph="push"; F.t=0; F.sigma=0; fkSay(FKG_T.conn,{key:"fkg_conn",keyMs:500}); if(F.hm) F.pivot.add(F.hm); s.parkBrake=true; setTimeout(()=>fkSay(FKG_T.push,{key:"fkg_push",keyMs:500}),400); fkGateRender(F); } }
  else if(ph==="push"){ const P=F.pl, v=Math.min(1.45,Math.sqrt(2*0.5*Math.max(0.02,F.sigma)),Math.sqrt(2*0.5*Math.max(0.02,P.S-F.sigma)))*(P.S-F.sigma<0.05?0:1), d=v*dt*F.k; F.pushV=v*F.k; F.sigma+=d;
    if(F.sigma>P.DA){ P.h=90+(F.sigma-P.DA)/P.R*180/Math.PI; } P.h=Math.min(180,P.h); const hr=P.h*Math.PI/180; P.Mx-=Math.sin(hr)*d; P.Mz+=Math.cos(hr)*d;
    const cgx=P.Mx+Math.sin(hr)*P.dm, cgz=P.Mz-Math.cos(hr)*P.dm; s.p.x=sg*cgx; s.p.z=cgz; s.q.copy(fphQuat(sg>0?P.h:360-P.h,0,0)); s.v.set(0,0,0); s.parkBrake=true; s.lever=0;
    if(F.sigma>=P.S-0.06){ F.ph="start"; F.t=0; s.v.set(0,0,0); F.engStarted=0; try{ if(typeof feGateStartOpen==="function") feGateStartOpen(); }catch(e){} fkGateRender(F); } else if(Math.floor(F.t*4)%2===0) fkGateRender(F); }
  else if(ph==="start"){ s.parkBrake=true; const k=typeof feRunCount==="function"?feRunCount():A.n; if(k!==F.engStarted){ F.engStarted=k; fkGateRender(F); } if(k>=A.n&&F.t>1){ F.ph="disc"; F.t=0; F.disc=0; fkSay(FKG_T.started,{key:"fkg_started",keyMs:500}); fkGateRender(F); } }
  else if(ph==="disc"){ const t=F.t; if(F.hmP){ F.hmP[0].visible=t<1.2||t>3.4; F.hmP[1].visible=t>=1.2&&t<=3.4; }
    if(t>3.6&&!F.tugOut){ F.tugOut=1; const tg=F.tug; tg.updateMatrixWorld(true); const m=tg.matrixWorld.clone(); F.pivot.remove(tg); m.decompose(tg.position,tg.quaternion,tg.scale); F.W.scene.add(tg); F.tugY=-fphEuler(s.q).hdg*Math.PI/180; tg.quaternion.setFromEuler(new THREE.Euler(0,F.tugY+Math.PI/2,0)); }
    if(F.tugOut){ const tg=F.tug, dir=new THREE.Vector3(-Math.cos(F.tugY),0,Math.sin(F.tugY)); tg.position.addScaledVector(dir,2.2*Math.min(0.05,dt)); }
    if(t>7){ if(F.tug.parent) F.tug.parent.remove(F.tug); if(F.hm&&F.hm.parent) F.hm.parent.remove(F.hm); F.ph="taxi"; F.t=0; s.parkBrake=false; fkGateRoute(F); fkSay(FKG_T.taxi,{key:"fkg_taxi",keyMs:500}); fkGateRender(F); } else s.parkBrake=true; }
  else if(ph==="taxi"||ph==="hold"||ph==="lineup"||ph==="tko"){
    const e=fphEuler(s.q), hr=e.hdg*Math.PI/180, f=[Math.sin(hr),-Math.cos(hr)], N=[s.p.x+f[0]*A.dn,s.p.z+f[1]*A.dn], Mp=[s.p.x-f[0]*A.dm,s.p.z-f[1]*A.dm], xp=sg*Mp[0];
    if(F.msgT>0){ F.msgT-=dt; if(F.msgT<=0) F.msg=null; }
    const warn=(k,m,gap)=>{ if(F.t-(F.warn[k]||-99)>(gap||7)){ F.warn[k]=F.t; F.msg=m; F.msgT=3.5; fkSay(m,{key:"fkg_w_"+k,keyMs:6000}); fkGateRender(F); } };
    if(gsv>30) warn("fast",FKG_T.fast);
    if(ph!=="go"&&!fkOnPave(L,Mp[0],Mp[1],6)&&!fkOnPave(L,N[0],N[1],6)){ warn("off",FKG_T.off,8); const k=Math.exp(-0.9*dt); if(gsv>4){ s.v.x*=k; s.v.z*=k; } }
    for(const b of F.keep){ const m=A.b*0.28; if(s.p.x>b[0]-m&&s.p.x<b[1]+m&&s.p.z>b[2]-m&&s.p.z<b[3]+m){ const dx=Math.min(s.p.x-(b[0]-m),(b[1]+m)-s.p.x), dz=Math.min(s.p.z-(b[2]-m),(b[3]+m)-s.p.z); if(dx<dz){ s.p.x=(s.p.x-(b[0]+b[1])/2<0)?b[0]-m:b[1]+m; s.v.x=0; } else { s.p.z=(s.p.z-(b[2]+b[3])/2<0)?b[2]-m:b[3]+m; s.v.z=0; } warn("bld",FKG_T.bld,4); } }
    /* hold short: the nose gear must stop before the hold line until the player has asked to enter the runway */
    const XH=Math.abs(L.hold), nx=sg*N[0];
    if(ph==="taxi"){ if(Math.abs(N[1]-L.holdZ)<16&&nx>XH-1&&nx<XH+40&&gsv<1.5){ F.ph="hold"; F.t=0; fkSay(FKG_T.hold,{key:"fkg_hold",keyMs:500}); fkGateRender(F); }
      else if(nx<XH-4&&Math.abs(N[1]-L.holdZ)<14){ F.ph="lineup"; F.viol=true; F.msg=FKG_T.viol; F.msgT=5; fkSay(FKG_T.viol,{key:"fkg_viol",keyMs:500}); fkGateRender(F); } }
    else if(ph==="hold"){ if(nx<XH-6) warn("viol",FKG_T.viol,5); }
    if(ph==="lineup"){ const ok=Math.abs(s.p.x)<9&&Math.abs(e.hdg>180?e.hdg-360:e.hdg)<12&&s.p.z<20&&s.p.z>-120&&gsv<8; F.lu=ok?(F.lu||0)+dt:0; if(F.lu>1.2){ F.ph="tko"; F.t=0; s.parkBrake=true; fkSay(FKG_T.tko,{key:"fkg_tko",keyMs:500}); fkGateRender(F); } }
    if(F.t%0.5<dt) fkGateRender(F);
    if(ph==="tko") s.parkBrake=true;
  }
  else if(ph==="go"){ if(gsv>60){ F.ph="done"; fkGateRender(F); } if(F.panel&&gsv>25) F.panel.hidden=true; }
}
/* ---------- the mini map: water, pavement, cities, roads and the taxi route (north up, k = pixels per metre) ---------- */
function fkMapDraw(g,px,pz,k,range,s){
  const C=FK.cur, L=(FLY.W&&FLY.W.L)||null, R=range*1000*1.2, x0=s.p.x-R, z0=s.p.z-R, n=22, st=2*R/n;
  if(C.water){ g.fillStyle="rgba(40,110,150,0.55)"; for(let j=0;j<n;j++) for(let i=0;i<n;i++){ const x=x0+(i+0.5)*st, z=z0+(j+0.5)*st; if(C.water(x,z)>0) g.fillRect(px(x0+i*st),pz(z0+j*st),st*k+0.6,st*k+0.6); } }
  g.fillStyle="rgba(190,170,130,0.35)"; C.ct.forEach(c=>{ g.beginPath(); g.arc(px(c[0]),pz(c[1]),c[2]*0.7*k,0,7); g.fill(); });
  g.strokeStyle="rgba(200,200,210,0.55)"; g.lineWidth=Math.max(1,24*k); if(C.rd) C.rd.forEach(q=>{ g.beginPath(); g.moveTo(px(q[0]),pz(q[1])); g.lineTo(px(q[2]),pz(q[3])); g.stroke(); });
  if(L){ L.rects.forEach(r=>{ if(r[0]===1) return; g.fillStyle=r[0]===3?"rgba(150,140,120,0.55)":"rgba(150,150,160,0.8)"; g.fillRect(px(r[1]-r[3]),pz(r[2]-r[4]),Math.max(1.2,2*r[3]*k),Math.max(1.2,2*r[4]*k)); });
    g.fillStyle="rgba(190,190,200,0.7)"; g.fillRect(px(L.term.x-55),pz(L.term.z-L.term.len/2),110*k+1,L.term.len*k); }
  const F=FKG; if(F.ph!=="off"&&F.route&&F.rib&&F.rib.visible!==false){ g.strokeStyle="#35f08a"; g.lineWidth=2; g.beginPath(); F.route.forEach((p,i)=>{ if(i) g.lineTo(px(p[0]),pz(p[1])); else g.moveTo(px(p[0]),pz(p[1])); }); g.stroke(); }
}
