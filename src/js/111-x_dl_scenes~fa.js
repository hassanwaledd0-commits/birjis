/* ---------- fa: the air traffic controller ("Birjis one" to the captain) ----------
   The radio lines are English phraseology (as in real life), spoken with a radio voice (speechSynthesis; a voice other than Maysaloon's when the device has one) and
   written in the strip with an Arabic explanation (ماذا يعني؟) and the next action (ماذا أفعل الآن؟). The controller follows the flight: the gate scenario's ground part
   (pushback, start approval, taxi, hold short, line up, takeoff clearance, runway incursion), then departure, route, top of descent, approach, landing clearance, touchdown.
   It also checks the captain's altitude and speed with gentle prompts. The gate lines that the controller covers are silenced in x_fly_gate.js (faAtcSilences).
   Contract with the engine start (x_fly_eng.js): while the controller is on, window.feAtcControls is true and window.atcOnPushbackDone exists; the engine start clearance then
   comes from here (faAtcStart calls feApprove). With the controller off both are removed and the engines are approved automatically as before.
   Public: faAtcReset() faAtcStop() faAtcStep(dt) faAtcSilences(key) faAtcTalking() faAtcAct(a) faAtcStripDom() faAtcTxt(). */
const FAC={on:false,scn:"",t:0,tChk:0,done:{},last:null,expect:null,log:[],queue:[],talking:false,tk:null,spk:true,pendStart:false,altCl:null,altSet:0,altT:0,spdT:0,lvT:0,gph:"",strip:null,n:0};
const FA_SILENT=["fkg_req","fkg_appr","fkg_start","fkg_taxi","fkg_hold","fkg_lu","fkg_viol","fkg_go"];
const FA_NATO={A:"Alpha",B:"Bravo",C:"Charlie",D:"Delta",E:"Echo",F:"Foxtrot",G:"Golf",H:"Hotel",I:"India",J:"Juliett",K:"Kilo",L:"Lima",M:"Mike",N:"November",O:"Oscar",P:"Papa",Q:"Quebec",R:"Romeo",S:"Sierra",T:"Tango",U:"Uniform",V:"Victor",W:"Whiskey",X:"X-ray",Y:"Yankee",Z:"Zulu"};
const FA_DIG=["zero","one","two","three","four","five","six","seven","eight","nine"];
const faPh=icao=>icao.split("").map(c=>FA_NATO[c]||c).join(" ");                      /* "OTHH" -> "Oscar Tango Hotel Hotel" */
const faNum=n=>String(n).split("").map(d=>FA_DIG[+d]).join(" ");                        /* 350 -> "three five zero" */
const faAlt=ft=>ft>=18000?"flight level "+faNum(Math.round(ft/100)):(ft%1000===0?faNum(ft/1000)+" thousand":faNum(ft));
const faAtcTxt=o=>typeof fkTx==="function"?fkTx(o):o.ar;
/* the lines: en = radio phraseology (always English), ex = Arabic and English explanation, expect = the next action */
const FAL={
  pb:{en:"Birjis one, pushback approved, face south.",ex:{ar:"الدفع للخلف مصرّح، الأنف نحو الجنوب. سيارة الدفع تتصل بعجلة الأنف.",en:"Pushback approved, nose south. The tug connects to the nose gear."}},
  st:{en:"Birjis one, start approved, report engines running.",ex:{ar:"أُعطي إذن التشغيل. شغّل منارة BCN أولاً، ثم كل محرك بمفاتيحه في القمرة.",en:"Start clearance given. Beacon first, then each engine with its switches."},expect:{ar:"شغّل منارة BCN، ثم المحركات.",en:"Beacon on, then the engines."}},
  tx:{en:"Birjis one, taxi to runway three six via Alpha, hold short runway three six.",ex:{ar:"اتبع الخط الأخضر إلى خط الانتظار قبل المدرج. لا تدخل المدرج بدون إذن.",en:"Follow the green line to the hold line. Never enter the runway without clearance."},expect:{ar:"تاكسي إلى خط الانتظار.",en:"Taxi to the hold line."}},
  hd:{en:"Birjis one, hold short runway three six. Request line up when ready.",ex:{ar:"أوقف الطائرة قبل الخط الأحمر، ثم اطلب الدخول إلى المدرج.",en:"Stop before the hold line, then request to line up."},expect:{ar:"اطلب الدخول إلى المدرج.",en:"Request to enter the runway."}},
  lu:{en:"Birjis one, runway three six, line up and wait.",ex:{ar:"ادخل المدرج وحاذِ خط المنتصف، ثم انتظر إذن الإقلاع.",en:"Enter the runway, line up on the centre line, then wait for takeoff clearance."},expect:{ar:"انتظر إذن الإقلاع.",en:"Wait for takeoff clearance."}},
  vl:{en:"Birjis one, stop! You entered runway three six without clearance.",ex:{ar:"توقّف فوراً! دخلت المدرج بدون إذن. اخرج منه واطلب الدخول من جديد.",en:"Stop now. You entered the runway without clearance."},expect:{ar:"اخرج من المدرج واطلب الدخول.",en:"Leave the runway and request line up."}},
  go:{en:"Birjis one, runway three six, wind calm, cleared for takeoff.",ex:{ar:"مصرّح بالإقلاع. ادفع الدفع إلى الأقصى وحافظ على خط المنتصف.",en:"Cleared for takeoff. Push the thrust to maximum and hold the centre line."},expect:{ar:"ادفع الدفع إلى الأقصى.",en:"Thrust to maximum."}},
  tof:{en:"Birjis one, runway three six, wind calm, cleared for takeoff.",ex:{ar:"مصرّح بالإقلاع من المدرج 36. ادفع الدفع إلى الأقصى.",en:"Cleared for takeoff runway 36. Thrust to maximum."},expect:{ar:"ادفع الدفع إلى الأقصى.",en:"Thrust to maximum."}},
  airF:{en:"Birjis one, radar contact. Climb and maintain flight level three five zero.",ex:{ar:"اصعد إلى 35,000 قدم. بعد رفع العجلات والقلابات فعّل «مسار الرحلة» ليتّجه الطيار الآلي إلى الوجهة.",en:"Climb to 35,000 ft. Once gear and flaps are up, engage the route button."},expect:{ar:"ارفع العجلات والقلابات، ثم فعّل مسار الرحلة.",en:"Retract gear and flaps, then engage the route."}},
  air5:{en:"Birjis one, radar contact. Climb and maintain five thousand feet.",ex:{ar:"اصعد إلى 5000 قدم وحافظ على الاتجاه.",en:"Climb to 5,000 ft and keep the heading."},expect:{ar:"حافظ على 5000 قدم.",en:"Hold 5,000 ft."}},
  appI:{en:"Birjis one, descend and maintain two thousand. Expect ILS runway three six.",ex:{ar:"انزل إلى 2000 قدم. اقتراب ILS للمدرج 36. اضغط APPR لالتقاط المسار.",en:"Descend to 2,000 ft. ILS approach runway 36. Press APPR to capture the path."},expect:{ar:"اضغط APPR عند الالتقاط.",en:"Press APPR to capture."}},
  cruI:{en:"Birjis one, maintain flight level three five zero. Radar contact.",ex:{ar:"حافظ على 35,000 قدم. مراقبة الرادار مفعّلة.",en:"Maintain 35,000 ft. Radar contact."},expect:{ar:"حافظ على 35,000 قدم.",en:"Hold 35,000 ft."}},
  eoI:{en:"Birjis one, engine failure. Say your intentions.",ex:{ar:"فشل محرك. حافظ على الاتجاه بالدفّة وقل نواياك للمراقب.",en:"Engine failure. Hold heading with rudder and state your intentions."},expect:{ar:"حافظ على الاتجاه وأكمل الصعود.",en:"Hold heading and keep climbing."}},
  rt:{en:"Birjis one, proceed direct Oscar Tango Hotel Hotel.",ex:{ar:"الطيار الآلي يتّجه مباشرة إلى الوجهة. راقب الارتفاع والسرعة.",en:"The autopilot is flying direct to the destination. Watch altitude and speed."}},
  tod:{en:"Birjis one, descend and maintain one zero thousand. Expect ILS runway three six.",ex:{ar:"ابدأ النزول إلى 10,000 قدم. ستحصل على مسار ILS للمدرج 36.",en:"Start descending to 10,000 ft. Expect the ILS for runway 36."},expect:{ar:"انزل إلى 10,000 قدم.",en:"Descend to 10,000 ft."}},
  ap:{en:"Birjis one, cleared ILS runway three six approach.",ex:{ar:"مصرّح بالاقتراب على ILS. الموجّه والمنزلق يُلتقطان تلقائياً.",en:"Cleared for the ILS approach. The localizer and glide path capture automatically."},expect:{ar:"راقب الالتقاط وقلّل السرعة.",en:"Monitor the capture and slow down."}},
  ld:{en:"Birjis one, wind calm, cleared to land runway three six.",ex:{ar:"مصرّح بالهبوط. الطيار الآلي يتولى التقريب ويعيد الدفع تلقائياً.",en:"Cleared to land. The autopilot flares and brings the thrust back."},expect:{ar:"هبوط.",en:"Land."}},
  td:{en:"Birjis one, welcome. Vacate the runway when able.",ex:{ar:"أهلاً بك. اخرج من المدرج عند أول ممر متاح.",en:"Welcome. Leave the runway at the first taxiway you can use."},expect:{ar:"اخرج من المدرج.",en:"Leave the runway."}},
  dn:{en:"Birjis one, taxi to the terminal, stand {n}, via the taxiway. Follow the guidance.",ex:{ar:"تاكسي إلى البوابة {n} عبر الممر. اتركه يتبع التوجيه إلى الموقف.",en:"Taxi to stand {n} via the taxiway. The guidance follows the route to the stand."},expect:{ar:"انتظر الوصول إلى الموقف.",en:"Wait until you reach the stand."}},
  pk:{en:"Birjis one, parked. Welcome to the terminal.",ex:{ar:"وصلت إلى الموقف. أهلاً بك. أوقف المحركات وأنهِ الرحلة.",en:"You are parked at the stand. Shut the engines down and end the flight."},expect:{ar:"أوقف المحركات.",en:"Shut the engines down."}},
  P_spd:{en:"Birjis one, reduce speed to two five zero knots below one zero thousand.",ex:{ar:"خفّض السرعة إلى 250 عقدة تحت 10,000 قدم.",en:"Reduce speed to 250 knots below 10,000 ft."}}
};
const faLn=(key,en)=>({key,en:en||FAL[key].en,ex:FAL[key].ex,expect:FAL[key].expect||null});
/* ---------- the strip (cockpit and every view): radio line, explanation, buttons ---------- */
const FA_ATC_CSS=`.fly.apOpen #faAtc,.fly.apOpen #faAtcChip{display:none!important}.faatc{position:absolute;z-index:6;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 92px);width:min(580px,calc(100% - 20px));padding:7px 10px 8px;border-radius:12px;background:rgba(6,14,24,.86);backdrop-filter:blur(6px);color:#eaf2f8;border:1px solid rgba(120,190,255,.3);font:600 12px/1.4 system-ui,sans-serif;pointer-events:auto;box-sizing:border-box}
.faatc[hidden]{display:none}.faatcH{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:10.5px;letter-spacing:.06em;opacity:.8}
.faatcR{direction:ltr;text-align:left;font:700 13px/1.35 ui-monospace,Menlo,Consolas,monospace;color:#9be7ff;margin-top:2px}
.faatcX{margin-top:3px;font-size:12.5px;color:#f2e6c4}.faatcX em{font-style:normal;opacity:.7;margin-inline-end:6px}
.faatcB{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.faatcB button{border:1px solid rgba(255,255,255,.24);border-radius:8px;background:rgba(255,255,255,.1);color:inherit;font:700 11px/1 system-ui,sans-serif;padding:6px 8px;min-height:28px;cursor:pointer}
.faatcB button[aria-pressed="true"]{background:rgba(52,225,122,.24);border-color:#34e17a}
.faatc.off{display:none!important}
.faatcH span{display:inline-flex;gap:4px}.faatcH span button{border:0;border-radius:6px;background:rgba(255,255,255,.14);color:inherit;font:700 14px/1 system-ui,sans-serif;min-width:30px;min-height:24px;padding:0 6px;cursor:pointer}
.faatc.min{padding:3px 8px 4px;width:min(470px,calc(100% - 20px))}
.faatc.min .faatcX,.faatc.min .faatcB{display:none}
.faatc.min .faatcH{font-size:9.5px}.faatc.min .faatcR{margin-top:0;font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.faatcChip{position:absolute;z-index:6;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 92px);border:1px solid rgba(120,190,255,.4);border-radius:999px;background:rgba(6,14,24,.82);color:#9be7ff;font:700 11px/1 system-ui,sans-serif;padding:6px 12px;min-height:28px;cursor:pointer}.faatcChip[hidden]{display:none}`;
function faAtcEnsure(){
  if(FAC.strip&&FAC.strip.isConnected) return FAC.strip; const o=document.getElementById("fly"); if(!o) return null;
  if(!document.getElementById("faAtcStyle")){ const st=document.createElement("style"); st.id="faAtcStyle"; st.textContent=FA_ATC_CSS; document.head.appendChild(st); }
  const b=document.createElement("div"); b.id="faAtc"; b.className="faatc"; b.hidden=true;
  b.innerHTML=`<div class="faatcH"><b>${faAtcTxt({ar:"المراقب الجوي",en:"AIR TRAFFIC CONTROL"})}</b><span><button type="button" data-faq="min" aria-label="${faAtcTxt({ar:"تصغير أو تكبير لوحة المراقب",en:"Shrink or expand the controller panel"})}">–</button><button type="button" data-faq="off" aria-label="${faAtcTxt({ar:"إخفاء لوحة المراقب",en:"Hide the controller panel"})}">×</button></span></div><div class="faatcR"></div><div class="faatcX"></div>
    <div class="faatcB"><button type="button" data-faq="say">${faAtcTxt({ar:"اسأل المراقب",en:"Say again"})}</button><button type="button" data-faq="now">${faAtcTxt({ar:"ماذا أفعل الآن؟",en:"What now?"})}</button><button type="button" data-faq="spk">${faAtcTxt({ar:"الصوت",en:"Voice"})}</button></div>`;
  b.addEventListener("click",e=>{ const x=e.target.closest("[data-faq]"); if(!x) return; e.stopPropagation(); faAtcAct(x.dataset.faq); });
  const c=document.createElement("button"); c.type="button"; c.id="faAtcChip"; c.className="faatcChip"; c.hidden=true; c.textContent=faAtcTxt({ar:"المراقب الجوي",en:"ATC"}); c.setAttribute("aria-label",faAtcTxt({ar:"إظهار لوحة المراقب",en:"Show the controller panel"}));
  c.addEventListener("click",e=>{ e.stopPropagation(); FLY.opts.atcHide=false; flySaveOpts(); faAtcStripDom(); });
  o.appendChild(b); o.appendChild(c); FAC.strip=b; if(FLY.opts.atcSpk===undefined) FLY.opts.atcSpk=true; return b;
}
/* compact: the player's choice, else on by default on a phone (short or narrow screen), so the window stays visible */
const faAtcMin=()=>FLY.opts.atcMin!==undefined?!!FLY.opts.atcMin:(innerHeight<=430||innerWidth<=520);
function faAtcStripDom(){
  const el=faAtcEnsure(); if(!el) return; el.hidden=!FAC.on; const chip=document.getElementById("faAtcChip"), off=!!FLY.opts.atcHide; if(chip) chip.hidden=!(FAC.on&&off);
  el.classList.toggle("off",off); el.classList.toggle("min",faAtcMin()); if(!FAC.on) return; const en=fkLang()==="en", r=FAC.last;
  const mb=el.querySelector('[data-faq="min"]'); if(mb){ const t=faAtcMin()?"+":"–"; if(mb.textContent!==t) mb.textContent=t; }
  const sp=el.querySelector('[data-faq="spk"]'); if(sp){ const v=String(FLY.opts.atcSpk!==false); if(sp.getAttribute("aria-pressed")!==v) sp.setAttribute("aria-pressed",v); }
  const R=el.querySelector(".faatcR"), X=el.querySelector(".faatcX");
  if(!r){ if(R.textContent!=="") R.textContent=""; return; }
  if(R.textContent!==r.en) R.textContent=r.en;
  const t=FAC.showNow&&FAC.expect?(en?"What now: ":"ماذا أفعل الآن؟ ")+(en?FAC.expect.en:FAC.expect.ar):(en?r.ex.en:r.ex.ar);
  if(X.textContent!==t) X.textContent=t; X.setAttribute("dir",en?"ltr":"rtl");
}
/* the buttons: say again (repeat the last radio line), what now (the next action in the explanation line), voice on/off */
function faAtcAct(a){
  if(a==="say"&&FAC.last){ FAC.showNow=false; faAtcSpeak(FAC.last); faAtcStripDom(); }
  else if(a==="now"){ FAC.showNow=!FAC.showNow; faAtcStripDom(); }
  else if(a==="min"){ FLY.opts.atcMin=!faAtcMin(); flySaveOpts(); faAtcStripDom(); }
  else if(a==="off"){ FLY.opts.atcHide=true; flySaveOpts(); faAtcStripDom(); }
  else if(a==="spk"){ FLY.opts.atcSpk=!(FLY.opts.atcSpk!==false); flySaveOpts(); FAC.spk=FLY.opts.atcSpk; if(!FAC.spk) faAtcCancel(); faAtcStripDom(); }
}
/* ---------- speech: a queue of radio lines; one line at a time; a watchdog in case the engine never ends a line ---------- */
function faAtcVoice(){
  try{ const sy=speechSynthesis, vs=sy.getVoices()||[], en=vs.filter(v=>/^en/i.test(v.lang||"")), b=typeof BOB!=="undefined"?BOB.voiceEn:null;
    return en.find(v=>v!==b&&/male|daniel|george|arthur|alex|uk english/i.test(v.name||""))||en.find(v=>v!==b)||b||null; }catch(e){ return null; }
}
function faAtcSpeak(r){ if(!FAC.on) return; FAC.queue.push(r); faAtcPump(); }
function faAtcPump(){
  if(FAC.talking) return;
  while(FAC.queue.length){ const r=FAC.queue.shift(); if(!FAC.spk) continue; if(faAtcSynth(r)) return; }
}
function faAtcSynth(r){
  const sy=typeof speechSynthesis!=="undefined"?speechSynthesis:null, U=typeof SpeechSynthesisUtterance!=="undefined"?SpeechSynthesisUtterance:null; if(!sy||!U) return false;
  let u; try{ u=new U(r.en); }catch(e){ return false; }
  const v=faAtcVoice(); if(v){ u.voice=v; u.lang=v.lang||"en-GB"; } else u.lang="en-GB"; u.rate=1.05; u.pitch=0.85; u.volume=1;
  FAC.talking=true; let fin=false; const end=()=>{ if(fin) return; fin=true; clearTimeout(FAC.tk); FAC.talking=false; faAtcPump(); };
  u.onend=end; u.onerror=end; FAC.tk=setTimeout(end,2500+r.en.length*90);
  try{ sy.speak(u); }catch(e){ end(); return false; } return true;
}
function faAtcCancel(){ FAC.queue=[]; FAC.talking=false; clearTimeout(FAC.tk); try{ if(typeof speechSynthesis!=="undefined") speechSynthesis.cancel(); }catch(e){} }
const faAtcTalking=()=>!!FAC.talking;
/* ---------- a line: once per key; the strip and the speech; the expected action after it ---------- */
function faAtcSay(L,key){
  if(!FAC.on) return; if(key){ if(FAC.done[key]) return; FAC.done[key]=true; }
  const r={en:L.en,ex:L.ex,expect:L.expect||FAC.expect,id:++FAC.n}; FAC.last=r; FAC.log.push(r); if(FAC.log.length>300) FAC.log.shift();
  if(L.expect) FAC.expect=L.expect; FAC.showNow=false; faAtcSpeak(r); faAtcStripDom();
  try{ window.dispatchEvent(new CustomEvent("fa-atc",{detail:{en:r.en,key:key||""}})); }catch(e){}
}
/* ---------- the controller's state machine ---------- */
function faAtcSilences(key){ return FAC.on&&FA_SILENT.indexOf(key)>=0; }
function faAtcOnPushback(){ if(FAC.on) FAC.pendStart=true; }
function faAtcStart(){ faAtcSay(faLn("st"),"st"); try{ if(typeof feApprove==="function") feApprove(true); }catch(e){} }
/* the gate's ground phases: one radio line when the phase begins (the pilot's button is the request) */
function faAtcGate(ph){
  if(ph==="tug") faAtcSay(faLn("pb"),"pb");
  else if(ph==="taxi") faAtcSay(faLn("tx"),"tx");
  else if(ph==="hold") faAtcSay(faLn("hd"),"hd");
  else if(ph==="lineup") faAtcSay(FKG.viol?faLn("vl"):faLn("lu"),FKG.viol?"vl":"lu");
  else if(ph==="go") faAtcSay(faLn("go"),"go");
}
function faAtcStep(dt){
  if(!FAC.on) return; const s=FLY.s; if(!s) return; FAC.t+=dt; const FA_=FA, scn=FAC.scn;
  const gph=scn==="gate"&&typeof FKG!=="undefined"&&FKG.ph&&FKG.ph!=="off"?FKG.ph:"";
  if(gph&&FAC.gph!==gph){ FAC.gph=gph; faAtcGate(gph); }
  if(FAC.pendStart){ FAC.pendStart=false; faAtcStart(); }
  if(!FAC.done.introB&&FAC.t>0.2&&!gph){ FAC.done.introB=true;
    if(scn==="takeoff"){ faAtcSay(faLn("tof"),"tof"); } else if(scn==="approach"){ FAC.altCl=2000; FAC.altSet=FAC.t; faAtcSay(faLn("appI"),"intro"); }
    else if(scn==="cruise"){ FAC.altCl=35000; FAC.altSet=FAC.t; faAtcSay(faLn("cruI"),"intro"); } else if(scn==="engineout") faAtcSay(faLn("eoI"),"intro"); }
  if(FAC.t-FAC.tChk<0.25) return; FAC.tChk=FAC.t;
  const info=fphInfo(s), alt=info.alt, trip=!!(FA_&&FA_.on);
  if(!s.ground&&!FAC.done.airB&&info.agl>400){ FAC.done.airB=true;
    if(trip){ faAtcSay(faLn("airF"),"air"); FAC.altCl=35000; FAC.altSet=FAC.t; }
    else if(scn==="takeoff"||scn==="gate"){ faAtcSay(faLn("air5"),"air"); FAC.altCl=5000; FAC.altSet=FAC.t; } }
  if(trip){
    if(FA_.route&&!FAC.done.rt){ faAtcSay(faLn("rt"),"rt"); FAC.altCl=35000; FAC.altSet=FAC.t; }
    if(FA_.tod&&!FAC.done.tod){ faAtcSay(faLn("tod"),"tod"); FAC.altCl=10000; FAC.altSet=FAC.t; }
    if(FA_.leg==="arr"&&FA_.R<=61000&&!FAC.done.ap){ faAtcSay(faLn("ap"),"ap"); s.ap.appr=true; FAC.altCl=null; }
    if(FA_.leg==="arr"&&FA_.R<22000&&!FAC.done.ld){ faAtcSay(faLn("ld"),"ld"); }
    if(FA_.leg==="arr"&&s.ev.touch&&!FAC.done.td){ faAtcSay(faLn("td"),"td"); }
    if(FA_.leg==="done"&&!FAC.done.dn){ const nn=FA_.taxiR?String(FA_.taxiR.n):"", D=FAL.dn; faAtcSay({en:D.en.split("{n}").join(nn),ex:{ar:D.ex.ar.split("{n}").join(nn),en:D.ex.en.split("{n}").join(nn)},expect:D.expect},"dn"); }
    if(FA_.leg==="parked"&&!FAC.done.pk){ faAtcSay(faLn("pk"),"pk"); try{ lvAward("f","trip:"+FLY.opts.apt+":"+FLY.opts.dest+":"+FLY.opts.ac,40); }catch(e){} }   /* a finished trip adds to the flying level */
  }
  /* the captain's altitude and speed: gentle prompts, not more often than once a minute */
  /* only when level and off the altitude (a long climb is not a deviation); above 15,000 ft a captain who cannot hold the cleared level gets the level he can hold */
  const offL=!s.ground&&FAC.altCl!==null&&Math.abs(alt-FAC.altCl)>600&&Math.abs(info.vs)<60;   /* level and off the cleared altitude */
  FAC.lvT=offL?FAC.lvT+0.25:0;
  if(offL&&FAC.lvT>60&&FAC.t-FAC.altSet>90&&FAC.t-FAC.altT>60){
    FAC.altT=FAC.t;
    if(alt>15000&&s.ap.on){ const Lv=Math.floor(alt/1000)*1000; FAC.altCl=Lv; s.ap.alt=fphApAlt(s,Lv).v; faAtcSay({en:"Birjis one, level off at "+faAlt(Lv)+".",ex:{ar:"ثبّت الارتفاع عند "+Lv+" قدم. هذا أعلى ما تحمله الطائرة بوزنها الحالي.",en:"Level off at "+Lv+" ft: the most this aircraft holds at its present weight."},expect:{ar:"ثبّت الارتفاع.",en:"Level off."}}); }
    else faAtcSay({en:"Birjis one, check altitude, maintain "+faAlt(FAC.altCl)+".",ex:{ar:"انتبه للارتفاع: حافظ على "+FAC.altCl+" قدم.",en:"Check your altitude: hold "+FAC.altCl+" ft."},expect:null});
  }
  if(!s.ground&&alt<10000&&info.ias>255&&FAC.t-FAC.spdT>45){ FAC.spdT=FAC.t; faAtcSay(faLn("P_spd")); }
}
/* ---------- reset and stop: called from the flight set-up (flyReset) and when the flight ends ---------- */
function faAtcReset(){
  faAtcCancel(); FAC.on=FLY.opts.atc!==false; FAC.scn=FLY.opts.scn||"gate";
  Object.assign(FAC,{t:0,tChk:0,done:{},last:null,expect:null,log:[],pendStart:false,altCl:null,altSet:0,altT:0,spdT:0,lvT:0,gph:"",showNow:false,spk:FLY.opts.atcSpk!==false});
  window.feAtcControls=FAC.on; if(FAC.on) window.atcOnPushbackDone=faAtcOnPushback; else { try{ delete window.atcOnPushbackDone; }catch(e){ window.atcOnPushbackDone=undefined; } }
  faAtcStripDom();
}
function faAtcStop(){ faAtcCancel(); FAC.on=false; window.feAtcControls=false; try{ delete window.atcOnPushbackDone; }catch(e){} if(FAC.strip) FAC.strip.hidden=true; { const c=document.getElementById("faAtcChip"); if(c) c.hidden=true; } }
