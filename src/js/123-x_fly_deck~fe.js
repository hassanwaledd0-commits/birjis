/* ---------- fe: engine start by the captain (Airbus ENG MASTER / ENG MODE, Boeing START + FUEL CONTROL) ----------
   The engines no longer start from a pop-up: the player switches them on. Procedure (simplified): beacon ON, start air (APU), start approval (gate: after pushback; `window.feStartApproved`),
   then Airbus: ENG MASTER ON -> starter, light-off at 20 % N2, spool-up to idle (about 30 s). Boeing: START (GRD) -> N2 climbs to ~27 %, at 20 %+ the player moves FUEL CONTROL to RUN -> light-off -> idle.
   Two engines may start together. The model keeps N2/N1/EGT/fuel flow/oil per engine for the displays; the physics only sees s.eng[i] (true from light-off) and s.n1[i] (thrust, 0 = idle).
   Public: feStep(dt) feStop() feAct(code) feKey(k) feEngState() feRunCount() feAllRunning() feDisp(s,i) feN1(s,i) feApprove(v) feGateStartOpen() feNext(); window.feStartApproved;
   window events: fe-start-approved, fe-engine-start, fe-engine-running, fe-engine-stop; sound hook: ffSndEngineStart(i,phase) with phase crank | light | idle | stop (feature-detected). */
const FE={s:null,key:"",fam:"airbus",n:2,e:[],mode:"NORM",bcn:false,apu:"off",apuT:0,msg:null,msgT:0,t:0,tDom:0,tHint:0,kbOn:false,doneOnce:false,userOpen:null,root:null,els:null,flash:"",amb:32,gateT:0,P:null};
const FE_FAM={a380:"airbus"};
const FE_PAR={
  a380:{n2i:61,n1i:20.5,egtI:405,egtP:625,oilI:50,tC:13,tS:19,tau:11,mx:24,ign:0.6},
  b737:{n2i:61,n1i:22,egtI:385,egtP:575,oilI:45,tC:9,tS:16,tau:8,mx:27,ign:1.2},
  b747:{n2i:60,n1i:19.5,egtI:395,egtP:600,oilI:50,tC:12,tS:20,tau:10,mx:27,ign:1.2}
};
const FE_T={
  title:{ar:"تشغيل المحركات",en:"Engine start"},
  bcn:{ar:"شغّل منارة التصادم (BCN) أولاً.",en:"Turn the beacon (BCN) on first."},
  noappr:{ar:"انتظر اكتمال الدفع للخلف وإذن تشغيل المحركات.",en:"Wait for pushback to finish and start clearance."},
  noair:{ar:"لا يوجد هواء للتشغيل. شغّل وحدة APU.",en:"No start air. Switch the APU on."},
  crank:{ar:"الوضع CRANK تدوير بلا وقود. اختر NORM.",en:"Mode CRANK is a dry crank. Select NORM."},
  n2wait:{ar:"انتظر حتى يبلغ N2 نحو 20%.",en:"Wait until N2 reaches about 20%."},
  apus:{ar:"وحدة APU تبدأ... انتظر لحظات.",en:"APU starting... wait a moment."},
  nofuel:{ar:"لا وقود في الخزانات.",en:"No fuel in the tanks."},
  hbcn:{ar:"شغّل المنارة الحمراء BCN قبل الدفع للخلف.",en:"Turn the red BCN beacon on before pushback."},
  hbcn2:{ar:"شغّل المنارة BCN، ثم ابدأ المحركات.",en:"Turn the BCN beacon on, then start the engines."},
  hapu:{ar:"شغّل وحدة APU للحصول على هواء التشغيل.",en:"Switch the APU on for start air."},
  hmode:{ar:"أعد مفتاح ENG MODE إلى NORM.",en:"Set ENG MODE back to NORM."},
  hmA:{ar:"اضغط مفتاح ENG MASTER للمحرك {n} إلى ON.",en:"Switch ENG MASTER {n} to ON."},
  hsB:{ar:"اضغط START على المحرك {n}.",en:"Press START on engine {n}."},
  hfB:{ar:"بلغ N2 عشرين بالمئة. حرّك FUEL CONTROL للمحرك {n} إلى RUN.",en:"N2 is above 20 percent. Move FUEL CONTROL {n} to RUN."},
  hrun:{ar:"المحرك {n} يعمل بثبات.",en:"Engine {n} is stable."},
  hall:{ar:"كل المحركات تعمل.",en:"All engines are running."},
  st:{off:"OFF",start:"START",run:"RUN",fail:"FAIL"},
  aria:{bcn:{ar:"منارة التصادم",en:"Beacon"},apu:{ar:"وحدة الطاقة المساعدة APU",en:"APU"},mode:{ar:"مفتاح وضع المحرك ENG MODE",en:"Engine mode selector"},
    m:{ar:"مفتاح تشغيل المحرك {n} ENG MASTER",en:"ENG MASTER {n}"},s:{ar:"مفتاح بدء المحرك {n} START",en:"Engine {n} START"},f:{ar:"مفتاح وقود المحرك {n} FUEL CONTROL",en:"Engine {n} FUEL CONTROL"},tog:{ar:"إظهار أو إخفاء لوحة المحركات",en:"Show or hide the engine panel"}}
};
const feTx=o=>typeof fkTx==="function"?fkTx(o):(o&&o.ar)||o;
const feFmt=(o,n)=>feTx(o).replace("{n}",n);
function feSay(o,key,ms,n){ try{ if(!FLY.opts.hints||typeof bobSay!=="function") return; bobSay(feFmt(o,n),{priority:"high",key:"fe_"+key,keyMs:ms||12000}); }catch(e){} }
function feSnd(i,ph){ try{ if(typeof ffSndEngineStart==="function") ffSndEngineStart(i,ph); }catch(e){} }
function feEvt(n,d){ try{ window.dispatchEvent(new CustomEvent(n,{detail:d||{}})); }catch(e){} }
const feSS=u=>{ u=u<0?0:u>1?1:u; return u*u*(3-2*u); };
function feMsg(o,sec){ FE.msg=o; FE.msgT=sec||3.5;  }
const feGate=()=>!!(FLY.s&&FLY.s.scn==="gate");
const feApproved=()=>!feGate()||window.feStartApproved===true;
function feApprove(v){ window.feStartApproved=v!==false; if(window.feStartApproved) feEvt("fe-start-approved");  }
const feOrder=()=>FE.n===4?[1,2,0,3]:[...Array(FE.n).keys()];
/* ---------- state ---------- */
function feNewEng(on,P,n1){ return {master:on,sel:false,fuel:on,starter:false,lit:on,run:on,fail:false,t:0,tl:on?99:0,ig:0,n2:on?P.n2i+(100-P.n2i)*Math.pow(n1||0,0.8):0,n2L:0,n1:on?P.n1i+(100-P.n1i)*(n1||0):0,egt:on?FE.amb+(P.egtI-FE.amb):FE.amb,ff:0,oilp:on?P.oilI:0,oilt:on?70:FE.amb,vib:0,prev:on?"run":"off"}; }
function feInit(s){
  const A=s.A, P=FE.P=FE_PAR[s.key]||FE_PAR.b737; P.ts=-P.tC/Math.log(1-20/P.mx); Object.assign(FE,{s,key:s.key,fam:(typeof FD_FAMILY!=="undefined"&&FD_FAMILY[s.key])?(FD_FAMILY[s.key]==="airbus"?"airbus":"boeing"):(FE_FAM[s.key]||"boeing"),n:A.n,mode:"NORM",msg:null,msgT:0,t:0,tHint:0,doneOnce:false,userOpen:null,flash:"",gateT:0});
  const gate=s.scn==="gate"; FE.e=[]; for(let i=0;i<A.n;i++) FE.e.push(feNewEng(!gate&&!!s.eng[i],P,s.n1[i]));
  FE.bcn=!gate; FE.apu=gate?"avail":"off"; FE.apuT=0; FE.kbOn=gate; window.feStartApproved=!gate;
}
function feStop(){ FE.s=null;  if(FE.root) FE.root.hidden=true; window.feStartApproved=undefined; }
const feStatus=e=>e.fail?"fail":e.run?"run":(e.starter||e.lit)?"start":"off";
const feRunCount=()=>FE.e.reduce((a,e)=>a+(e.run?1:0),0);
const feAllRunning=()=>FE.e.length>0&&FE.e.every(e=>e.run);
function feEngState(){ const E=FE.e; return {running:E.map(e=>!!e.run),starting:E.map(e=>!e.run&&(e.starter||e.lit)),failed:E.map(e=>!!e.fail),n2:E.map(e=>e.n2),approved:feApproved(),beacon:FE.bcn,apu:FE.apu,mode:FE.mode,family:FE.fam}; }
/* ---------- display numbers (decks, HUD) ---------- */
function feDisp(s,i){   /* a running engine is shown straight from the physics (so direct changes of s.n1 / s.eng show at once); a starting or stopping one from the start model */
  const e=FE.s===s?FE.e[i]:null; if(!e) return null; let st=feStatus(e), P=FE.P;
  if(st==="run"){ if(!s.eng[i]) st="fail"; else { const v=Math.max(0,s.n1[i]), A=s.A; return {st,n1:P.n1i+(100-P.n1i)*v,n2:P.n2i+(100-P.n2i)*Math.pow(v,0.8),egt:P.egtI+(860-P.egtI)*Math.pow(v,1.5),ff:s.ff&&s.ff[i]>0?s.ff[i]*3600:A.Tmax*(0.05+0.95*v)*A.sfc*3600,oilp:P.oilI+12*v,oilt:62+48*Math.min(1,e.n2/100)+20*v,vib:0.15+0.45*v,on:true}; } }
  return {st,n1:e.n1,n2:e.n2,egt:e.egt,ff:e.ff,oilp:e.oilp,oilt:e.oilt,vib:e.vib,on:false};
}
const feN1=(s,i)=>{ const d=feDisp(s,i); return d?d.n1:s.n1[i]*100; };
/* ---------- the engine model (one step) ---------- */
function feEngStep(e,P,dt,s,i){
  const A=s.A, n1p=Math.max(0,s.n1[i]), k=u=>1-Math.exp(-dt/u); let u=0;
  if(e.starter&&!e.lit){ e.n2+=(P.mx-e.n2)*k(P.ts); }
  if(!e.lit&&!e.starter&&e.n2>0){ e.n2*=Math.exp(-dt/P.tau); if(e.n2<1.2) e.n2=0; }
  if(e.fuel&&!e.lit&&!e.fail&&e.n2>=20&&(e.starter||!s.ground)){ e.ig+=dt; if(e.ig>=P.ign){ e.lit=true; e.tl=0; e.n2L=e.n2; e.ig=0; s.eng[i]=true; feSnd(i,"light"); } } else if(!e.fuel||e.n2<20) e.ig=0;
  if(e.lit&&!e.run){ e.tl+=dt; u=Math.min(1,e.tl/P.tS); const h=0.5*feSS(u)+0.5*(1-Math.pow(1-u,2.4)); e.n2=Math.max(e.n2,e.n2L+(P.n2i-e.n2L)*h); if(e.n2>=50&&e.starter){ e.starter=false; e.sel=false; }
    if(u>=1){ e.run=true; e.starter=false; e.sel=false; feSnd(i,"idle"); feEvt("fe-engine-running",{i}); } }
  else if(e.run){ u=1; const n2t=P.n2i+(100-P.n2i)*Math.pow(n1p,0.8); e.n2+=(n2t-e.n2)*k(0.5); }
  /* derived values, relaxed so that switch-overs do not jump */
  let n1t, egtT, ffT, amb=FE.amb;
  if(e.run) { n1t=P.n1i+(100-P.n1i)*n1p; egtT=P.egtI+(860-P.egtI)*Math.pow(n1p,1.5); ffT=(s.ff?s.ff[i]*3600:A.Tmax*(0.05+0.95*n1p)*A.sfc*3600); }
  else { n1t=P.n1i*Math.pow(Math.max(0,e.n2)/P.n2i,2.4); if(e.lit){ egtT=amb+(P.egtI-amb)*feSS(u)+(P.egtP-(amb+P.egtI)/2)*Math.pow(Math.sin(Math.PI*u),1.5); ffT=A.Tmax*0.05*A.sfc*3600*(0.45+0.55*feSS(u))*(1+0.2*Math.sin(Math.PI*u)); } else { egtT=amb+0.4*e.n2; ffT=0; } }
  e.n1+=(n1t-e.n1)*k(e.lit?0.4:1.2); e.egt+=(egtT-e.egt)*k(e.lit||e.run?0.7:(e.n2>8?6:30)); e.ff+=(ffT-e.ff)*k(0.6); if(e.ff<1&&!ffT) e.ff=0;
  const on=e.run||e.lit; e.oilp=e.n2<3?0:(e.oilp+((on?P.oilI+12*n1p:12+(P.oilI-12)*Math.min(1,e.n2/P.n2i))-e.oilp)*k(1.0)); e.oilt+=((on?62+48*Math.min(1,e.n2/100)+20*n1p:amb+0.2*e.n2)-e.oilt)*k(on?20:60); e.vib=on?0.15+0.45*n1p+0.15*Math.sin(FE.t*3+i):(e.n2>4?0.1:0);
}
/* ---------- switches ---------- */
function feBleed(){ return !feGate()||FE.apu==="avail"; }
function feShut(i,why){ const e=FE.e[i], s=FE.s; if(e.lit||e.run){ feSnd(i,"stop"); feEvt("fe-engine-stop",{i,why:why||"switch"}); } e.lit=false; e.run=false; e.starter=false; e.sel=false; e.ig=0; s.eng[i]=false; }
function feStartCheck(i){   /* returns true when a start may begin, else sets the refusal message */
  const s=FE.s; if(!feApproved()){ feMsg(FE_T.noappr); return false; }
  if(feGate()&&!FE.bcn){ FE.flash="bcn"; feMsg(FE_T.bcn); feSay(FE_T.bcn,"bcnref",9000); return false; }
  if(!feBleed()){ FE.flash="apu"; feMsg(FE.apu==="starting"?FE_T.apus:FE_T.noair); return false; }
  if(s.fuel!==undefined&&s.fuel<=1){ feMsg(FE_T.nofuel); return false; }
  return true;
}
function feEngToggle(i){   /* family-aware: the digit keys use this */
  const e=FE.e[i]; if(!e) return;
  if(FE.fam==="airbus") return feAct("m"+i);
  if(e.run||e.lit) return feAct("f"+i);
  if(e.sel&&!e.fuel) return feAct("f"+i);
  feAct("s"+i);
}
function feAct(code){
  const s=FE.s; if(!s||!FLY.on) return; const m=/^([a-z]+)(\d?)$/.exec(code); if(!m) return; const c=m[1], i=m[2]===""?-1:+m[2], e=FE.e[i]; 
  if(c==="bcn"){ FE.bcn=!FE.bcn; if(FE.flash==="bcn") FE.flash=""; return; }
  if(c==="apu"){ if(FE.apu==="off"){ FE.apu="starting"; FE.apuT=0; if(FE.flash==="apu") FE.flash=""; } else if(FE.apu==="avail"){ FE.apu="off"; } return; }
  if(c==="mode"){ if(FE.fam==="airbus") FE.mode=FE.mode==="NORM"?"IGN":FE.mode==="IGN"?"CRANK":"NORM"; return; }
  if(!e||i<0) return;
  if(c==="tog"){ return; }
  if(c==="m"){   /* Airbus ENG MASTER */
    if(e.master){ e.master=false; e.fuel=false; e.starter=false; e.fail=false; if(e.lit||e.run) feShut(i); e.ig=0; }
    else { if(!feStartCheck(i)) return; e.master=true; e.fail=false; if(FE.mode==="CRANK"){ e.fuel=false; e.starter=true; feMsg(FE_T.crank,4); } else { e.fuel=true; e.starter=true; } feSnd(i,"crank"); feEvt("fe-engine-start",{i}); }
  } else if(c==="s"){   /* Boeing START selector (GRD) */
    if(e.run||e.lit) return; if(e.sel){ e.sel=false; e.starter=false; e.fuel=false; return; }
    if(!feStartCheck(i)) return; e.sel=true; e.starter=true; e.fail=false; feSnd(i,"crank"); feEvt("fe-engine-start",{i});
  } else if(c==="f"){   /* Boeing FUEL CONTROL */
    if(e.fuel){ e.fuel=false; e.fail=false; if(e.lit||e.run) feShut(i); e.ig=0; return; }
    if(!e.sel&&!e.lit&&!e.run){ if(!s.ground){ if(!feStartCheck(i)) return; e.sel=true; e.starter=true; } else { feMsg({ar:"اضغط START أولاً.",en:"Press START first."}); return; } }
    if(e.n2<20&&s.ground){ feMsg(FE_T.n2wait); return; } e.fuel=true; e.fail=false;
  }
}
function feKey(k){   /* digits 1..n toggle engine k from the start phase of the gate scenario until all engines run once; otherwise the digits stay the camera keys */
  if(!FE.s||!FE.kbOn||FE.doneOnce||typeof FKG==="undefined"||["start","disc","taxi","hold","lineup","tko"].indexOf(FKG.ph)<0) return false; const i=+k-1; if(!(i>=0&&i<FE.n)) return false; feEngToggle(i); return true;
}
/* ---------- the next control to use (highlight + Bobby's hint) ---------- */
function feNext(){
  if(!feGate()||!feApproved()) return null; if(!FE.bcn) return {c:"bcn"}; if(FE.apu!=="avail") return {c:"apu",wait:FE.apu==="starting"};
  if(FE.fam==="airbus"&&FE.mode==="CRANK") return {c:"mode"};
  for(const i of feOrder()){ const e=FE.e[i]; if(e.run) continue;
    if(FE.fam==="airbus"){ if(!e.master||e.fail) return {c:"m"+i,i}; continue; }
    if(e.sel&&!e.fuel&&!e.lit){ if(e.n2>=20) return {c:"f"+i,i,f:1}; continue; }
    if(!e.sel&&!e.lit&&!e.starter) return {c:"s"+i,i}; }
  return null;
}
/* ---------- per physics step ---------- */
function feStep(dt){
  const s=FLY.s; if(!s||!FLY.on) return; if(FE.s!==s) feInit(s); FE.t+=dt; const P=FE.P;
  if(FE.msgT>0){ FE.msgT-=dt; if(FE.msgT<=0) FE.msg=null; }
  if(FE.apu==="starting"){ FE.apuT+=dt; if(FE.apuT>=6) FE.apu="avail"; }
  for(let i=0;i<FE.n;i++){ const e=FE.e[i], was=feStatus(e);
    /* an engine that the physics (or a scenario) switched off while it was burning is a failure; its switch stays ON until the player cycles it */
    if((e.lit||e.run)&&!s.eng[i]&&!e.fail){ e.fail=true; e.lit=false; e.run=false; e.starter=false; feSnd(i,"stop"); feEvt("fe-engine-stop",{i,why:"fail"}); }
    if(FE.fam==="boeing"&&e.sel&&!e.starter&&!e.lit&&!e.run&&e.n2<1) e.sel=false;
    feEngStep(e,P,dt,s,i); if(feStatus(e)==="run"&&was!=="run"&&feGate()) feSay(FE_T.hrun,"run"+i,6000,i+1); }
  /* gate scenario: the start approval comes automatically 1.5 s after pushback unless an ATC module takes it over (window.feAtcControls or atcOnPushbackDone) */
  if(feGate()&&typeof FKG!=="undefined"&&FKG.ph==="start"&&window.feStartApproved!==true){ FE.gateT+=dt; if(FE.gateT>1.5&&!window.feAtcControls&&typeof atcOnPushbackDone!=="function"){ feApprove(true); try{ if(typeof fkSay==="function") fkSay(FKG_T.start,{key:"fkg_start",keyMs:500}); }catch(x){} } }
  if(FE.kbOn&&!FE.doneOnce&&feAllRunning()){ FE.doneOnce=true; if(feGate()) feSay(FE_T.hall,"all",20000); }
  if(typeof feFuelTick==="function") feFuelTick(dt);
  if(FE.t-FE.tHint>1){ FE.tHint=FE.t; feCoach(); }
  const now=performance.now(); if(now-FE.tDom>130){ FE.tDom=now; try{ feDom(); }catch(x){ console.error("feDom",x); } }
}
function feGateStartOpen(){ FE.gateT=0; try{ if(typeof atcOnPushbackDone==="function") atcOnPushbackDone(); }catch(e){} }
function feCoach(){
  if(!feGate()||typeof FKG==="undefined") return; const ph=FKG.ph, nx=feNext();
  if(ph==="ready"&&!FE.bcn&&FKG.t>5){ feSay(FE_T.hbcn,"hb",25000); return; }
  if(ph!=="start"||!nx) return; const n=(nx.i===undefined?0:nx.i)+1;
  if(nx.c==="bcn") feSay(FE_T.hbcn2,"b2",11000); else if(nx.c==="apu"&&!nx.wait) feSay(FE_T.hapu,"apu",12000); else if(nx.c==="mode") feSay(FE_T.hmode,"mode",12000);
  else if(nx.f) feSay(FE_T.hfB,"f"+nx.i,9000,n); else if(FE.fam==="airbus") feSay(FE_T.hmA,"m"+nx.i,14000,n); else feSay(FE_T.hsB,"s"+nx.i,14000,n);
}
const feNxTxt=nx=>{ const n=(nx.i===undefined?0:nx.i)+1; return nx.c==="bcn"?{ar:"التالي: شغّل BCN",en:"Next: BCN ON"}:nx.c==="apu"?(nx.wait?FE_T.apus:{ar:"التالي: شغّل APU",en:"Next: APU ON"}):nx.c==="mode"?{ar:"التالي: ENG MODE إلى NORM",en:"Next: ENG MODE to NORM"}:
  nx.f?{ar:"التالي: FUEL CONTROL "+n+" إلى RUN",en:"Next: FUEL CONTROL "+n+" to RUN"}:FE.fam==="airbus"?{ar:"التالي: ENG MASTER "+n+" إلى ON",en:"Next: ENG MASTER "+n+" ON"}:{ar:"التالي: START للمحرك "+n,en:"Next: START engine "+n}; };
/* ---------- DOM: one bar, two skins (cockpit strip above the glareshield / compact card in the other views) ---------- */
const FE_CSS=`.feb{position:absolute;z-index:7;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;gap:5px;padding:6px 8px 7px;border-radius:12px;font:700 11px/1.1 'IBM Plex Mono','DejaVu Sans Mono',ui-monospace,Menlo,Consolas,monospace;color:#d6dfe7;background:linear-gradient(#1c2229,#12171c);border:1px solid #3a4651;box-shadow:0 6px 18px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.08);pointer-events:auto;touch-action:manipulation;user-select:none;-webkit-user-select:none;max-width:calc(100% - 14px);width:max-content;direction:ltr}
.feb[hidden]{display:none}.feb.fe-boe{background:linear-gradient(#41464a,#2c2f32);border-color:#767d83;color:#eef1f2}
.feb.fe-ck{bottom:calc(var(--fdph,160px) + 8px)}.feb.fe-card{top:var(--fetop,54px)}.fly:not(.fport) .feb.fe-ck{max-width:calc(100% - 330px)}
.fehd{display:flex;align-items:center;gap:8px;min-height:18px}.fehd b{letter-spacing:.1em;font-size:10.5px;opacity:.92;white-space:nowrap}.fest{flex:1;text-align:center;font-weight:600;font-size:10.5px;color:#ffd27a;min-height:12px;line-height:1.25}.fest.ok{color:#7df0a6}.fecn{font-weight:700;font-size:10.5px;opacity:.9;white-space:nowrap}
.fetg{border:0;border-radius:7px;background:rgba(255,255,255,.1);color:inherit;font:inherit;min-width:30px;height:24px;cursor:pointer}.fed{display:none;gap:4px}.fed i{width:9px;height:9px;border-radius:50%;background:#46515b}.fed i.run{background:#34e17a;box-shadow:0 0 5px #34e17a}.fed i.start{background:#ffb224}.fed i.fail{background:#ff4a3a}
.fe-mini .feg{display:none}.fe-mini .fed{display:flex}.fe-mini .fest,.fe-mini .fecn{display:none}.fe-mini .fehd{gap:10px}
.feg{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:stretch}
.fec{display:flex;flex-direction:column;gap:3px;align-items:center;justify-content:center;padding:4px 5px 5px;border-radius:9px;background:rgba(0,0,0,.26);border:1px solid rgba(255,255,255,.08);min-width:62px}.fe-boe .fec{background:rgba(0,0,0,.18)}
.fec>div{display:flex;gap:4px}.fen{font-size:10px;opacity:.9;white-space:nowrap}.fen em{font-style:normal;margin-inline-start:5px;color:#8fe3ff}.fec.run .fen em{color:#7df0a6}.fec.fail .fen em{color:#ffb224}
.fesw{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-width:50px;min-height:40px;padding:5px 7px;border-radius:9px;border:1px solid #56626e;background:linear-gradient(#2a323a,#1f262c);color:inherit;font:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
.fe-boe .fesw{background:linear-gradient(#53595e,#3d4246);border-color:#8b9298}.fesw:active{transform:translateY(1px)}.fesw:focus-visible{outline:2px solid #4fd8ff;outline-offset:1px}
.fesw i{display:block;width:24px;height:5px;border-radius:3px;background:#3b454e;box-shadow:inset 0 0 0 1px rgba(0,0,0,.4)}.fesw b{font-size:10.5px;letter-spacing:.04em}.fesw small{font-size:9px;font-weight:600;opacity:.82;white-space:nowrap}
.fesw.on i{background:#34e17a;box-shadow:0 0 7px #34e17a}.fesw.on small{color:#7df0a6;opacity:1}.fesw.warn i{background:#ffb224;box-shadow:0 0 7px #ffb224}.fesw.warn small{color:#ffcf6a;opacity:1}.fesw.bad i{background:#ff4a3a;box-shadow:0 0 7px #ff4a3a}.fesw.bad small{color:#ff8a7a;opacity:1}
.fesw.red.on i{background:#ff4a3a;box-shadow:0 0 7px #ff4a3a}.fesw.red.on small{color:#ff9a8a}.fesw.blu.on i{background:#4aa8ff;box-shadow:0 0 7px #4aa8ff}.fesw.blu.on small{color:#9bd0ff}
.fesw.nx{animation:fenx 1.1s ease-in-out infinite}.fesw.fl{animation:fenx .45s ease-in-out 6}@keyframes fenx{0%,100%{box-shadow:0 0 0 0 rgba(255,210,100,0)}50%{box-shadow:0 0 0 3px rgba(255,210,100,.9)}}
.fetk{display:block;position:relative;width:34px;height:16px;border-radius:8px;background:#0c1014;border:1px solid #5b6772}.fetk:after{content:'';position:absolute;top:1px;left:1px;width:12px;height:12px;border-radius:50%;background:#aeb7bf;transition:left .12s}
.fesw.on .fetk:after{left:19px;background:#34e17a;box-shadow:0 0 6px #34e17a}.fesw.warn .fetk:after{left:19px;background:#ffb224;box-shadow:0 0 6px #ffb224}.fesw.bad .fetk:after{left:19px;background:#ff4a3a}
.fesw.mode{min-width:112px}.fesw.mode b{font-size:11px;letter-spacing:.03em;color:#ffd27a}
@media(max-height:430px){.fesw{min-height:30px;padding:2px 6px;gap:1px}.fesw i{height:4px}.fesw small{display:none}.fesw.mode small{display:block}.feb{padding:4px 6px 5px;gap:3px}.fec{padding:3px 4px 4px;gap:2px}.fen{font-size:9.5px}.fetk{height:14px}.fetk:after{width:10px;height:10px}.fesw.on .fetk:after,.fesw.warn .fetk:after,.fesw.bad .fetk:after{left:21px}}
@media(max-width:520px){.fesw{min-width:42px;padding:4px 3px}.fec{min-width:0;flex:1 1 68px}.fesw.mode{min-width:92px}}`;
function feEnsure(){
  if(FE.root&&FE.root.isConnected) return true; const o=document.getElementById("fly"); if(!o) return false;
  if(!document.getElementById("feStyle")){ const st=document.createElement("style"); st.id="feStyle"; st.textContent=FE_CSS; document.head.appendChild(st); }
  const r=document.createElement("div"); r.id="feBar"; r.className="feb"; r.hidden=true;
  r.addEventListener("click",e=>{ const b=e.target.closest("[data-fe]"); if(!b) return; e.stopPropagation(); const c=b.dataset.fe;
    if(c==="tog") FE.userOpen=!(FE.userOpen===null?!feAllRunning():FE.userOpen); else feAct(c); try{ feDom(); }catch(x){} });
  o.appendChild(r); FE.root=r; FE.k=""; return true;
}
function feSw(code,cls,lab,sub,aria,extra){ return `<button type="button" class="fesw ${cls}" data-b="${cls}" data-fe="${code}" aria-pressed="false" aria-label="${aria}">${extra||"<i></i>"}<b>${lab}</b>${sub===null?"":`<small>${sub}</small>`}</button>`; }
function feBuild(){
  const boe=FE.fam==="boeing", n=FE.n, A=(a,i)=>feFmt(FE_T.aria[a],i===undefined?"":i+1), tk='<span class="fetk"></span>';
  let h=`<div class="fehd"><b>ENG START</b><span class="fest" id="feSt"></span><span class="fecn" id="feCn"></span><span class="fed">${FE.e.map(()=>"<i></i>").join("")}</span><button type="button" class="fetg" data-fe="tog" aria-label="${A("tog")}">&#9662;</button></div><div class="feg">`;
  h+=`<div class="fec">${feSw("bcn","red","BCN","OFF",A("bcn"))}</div><div class="fec">${feSw("apu","","APU","OFF",A("apu"))}</div>`;
  if(!boe) h+=`<div class="fec">${feSw("mode","mode","ENG MODE","NORM",A("mode"),"<i></i>")}</div>`;
  for(let i=0;i<n;i++){ h+=`<div class="fec" data-i="${i}"><span class="fen">ENG ${i+1}<em>N2 0%</em></span><div>`;
    h+=boe?feSw("s"+i,"blu","START","GRD",A("s",i))+feSw("f"+i,"","FUEL","CUTOFF",A("f",i),tk):feSw("m"+i,"",n>2?"MSTR":"MASTER","OFF",A("m",i),tk); h+=`</div></div>`; }
  FE.root.innerHTML=h+"</div>"; const q=s=>FE.root.querySelector(s), sw={}; FE.root.querySelectorAll("[data-fe]").forEach(b=>{ sw[b.dataset.fe]=b; });
  FE.els={st:q("#feSt"),cn:q("#feCn"),dots:[...FE.root.querySelectorAll(".fed i")],cells:[...FE.root.querySelectorAll(".fec[data-i]")],sw}; FE.els.v=FE.els.cells.map(c=>c.querySelector("em"));
}
function feSet(b,cls,sub,on,nx,fl){ if(!b) return; const k=cls+"|"+sub+"|"+on+"|"+(nx?1:0)+"|"+(fl?1:0); if(b._k===k) return; b._k=k; b.className="fesw "+b.dataset.b+(cls?" "+cls:"")+(nx?" nx":"")+(fl?" fl":""); b.setAttribute("aria-pressed",!!on); const sm=b.querySelector("small"); if(sm&&sm.textContent!==sub) sm.textContent=sub; }
function feDom(){
  if(!feEnsure()) return; const o=FE.root.parentNode, r=FE.root, s=FE.s; if(!s){ r.hidden=true; return; }
  const gate=feGate(), cockpit=o.classList.contains("fdk"), ph=gate&&typeof FKG!=="undefined"?FKG.ph:"", enl=typeof FD!=="undefined"&&!!FD.enl;
  const show=gate&&FLY.on&&!enl&&ph!=="go"&&ph!=="done"&&ph!=="off"&&ph!=="board"&&ph!=="fuel"&&!FLY.score;   /* from the checklist / refuelling on, the switches are not needed yet */ if(r.hidden===show) r.hidden=!show; if(!show) return;
  const mini=FE.userOpen===null?feAllRunning():!FE.userOpen, sig=[FE.fam,FE.n,fkLangSafe()].join("|"); if(FE.k!==sig){ FE.k=sig; feBuild(); }
  const cls="feb "+(FE.fam==="boeing"?"fe-boe":"fe-air")+(cockpit?" fe-ck":" fe-card")+(mini?" fe-mini":""); if(r.className!==cls) r.className=cls;
  if(!cockpit){ const gp=document.getElementById("fkGP"), top=gp&&!gp.hidden?gp.offsetTop+gp.offsetHeight+6:54; if(FE.top!==top){ FE.top=top; r.style.setProperty("--fetop",top+"px"); } }
  const gp0=document.getElementById("fkGP"); if(gp0){ const hide=cockpit&&ph==="start"; if(gp0._feH!==hide){ gp0._feH=hide; gp0.style.visibility=hide?"hidden":""; } }
  const E=FE.els, nx=feNext(), run=feRunCount(), st=FE.msg?feTx(FE.msg):(gate&&!feApproved()?feTx(FE_T.noappr):nx?feTx(feNxTxt(nx)):run>=FE.n?feTx(FE_T.hall):""), dir=fkLangSafe()==="en"?"ltr":"rtl";
  if(E.st.textContent!==st) E.st.textContent=st; if(E.st.getAttribute("dir")!==dir) E.st.setAttribute("dir",dir); E.st.classList.toggle("ok",!FE.msg&&run>=FE.n); const cn="RUN "+run+"/"+FE.n; if(E.cn.textContent!==cn) E.cn.textContent=cn;
  feSet(E.sw.bcn,FE.bcn?"on":"",FE.bcn?"ON":"OFF",FE.bcn,nx&&nx.c==="bcn",FE.flash==="bcn"&&!FE.bcn);
  feSet(E.sw.apu,FE.apu==="avail"?"on":FE.apu==="starting"?"warn":"",FE.apu==="avail"?"AVAIL":FE.apu==="starting"?"START":"OFF",FE.apu!=="off",nx&&nx.c==="apu"&&!nx.wait,FE.flash==="apu"&&FE.apu==="off");
  if(E.sw.mode) feSet(E.sw.mode,FE.mode==="CRANK"?"warn":"",FE.mode==="NORM"?"CRANK · [NORM] · IGN":FE.mode==="IGN"?"CRANK · NORM · [IGN]":"[CRANK] · NORM · IGN",true,nx&&nx.c==="mode",false);
  for(let i=0;i<FE.n;i++){ const e=FE.e[i], stt=feStatus(e), c=E.cells[i], t=stt==="fail"?"FAIL":"N2 "+Math.round(e.n2)+"%"; const cc="fec "+stt; if(c&&c.className!==cc) c.className=cc; if(E.v[i].textContent!==t) E.v[i].textContent=t; if(E.dots[i]&&E.dots[i].className!==stt) E.dots[i].className=stt;
    if(FE.fam==="airbus") feSet(E.sw["m"+i],e.fail?"bad":e.master?(e.run?"on":"warn"):"",e.fail?"FAULT":e.master?(e.run?"ON":(FE.mode==="CRANK"?"CRANK":"START")):"OFF",e.master,nx&&nx.c==="m"+i,false);
    else { feSet(E.sw["s"+i],e.starter?"on":"",e.starter?"ON":"GRD",e.starter,nx&&nx.c==="s"+i,false); feSet(E.sw["f"+i],e.fail?"bad":e.fuel?"on":"",e.fail?"FAULT":e.fuel?"RUN":"CUTOFF",e.fuel,nx&&nx.c==="f"+i,false); } }
}
const fkLangSafe=()=>{ try{ return typeof fkLang==="function"?fkLang():"ar"; }catch(e){ return "ar"; } };
