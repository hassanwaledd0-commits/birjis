/* ---------- flight sound (ff): procedural WebAudio only, no files ----------
   API (all feature-detected by the flight code):
     ffSndStart(key)        on the flight-start click (a user gesture): creates / resumes the AudioContext, mounts the speaker button in .ftop
     ffSndUpdate(info,s,dt) once per frame from the flight loop (internally throttled to ~25 Hz, no allocations)
     ffSndStop()            leaving the flight: fades out, stops every source, closes the context
     ffSndToggle(on)        speaker button; the choice is kept in localStorage (default ON)
   Sounds: turbofans (2 or 4, each: filtered noise roar + fan whine that follow its own N1, shared low rumble and core roar at high thrust, start spool-up and shut-down),
   wind rising with IAS and falling with altitude, tyre rumble with ground speed, gear transit + lock thunk, flap motor, spoiler roar, reverse-thrust roar, touchdown thump + squeal
   scaled by the sink rate, crash thud. Cockpit alerts come in two families (ffS.fam from FD_FAMILY: a380 airbus, 737/747 boeing), all synthesized lookalikes, never recordings:
   airbus = single chime for cautions, repeating chime for warnings (also overspeed), rising three-note «charge» when the autopilot drops, «stall stall» voice + cricket;
   boeing = beeper for cautions, bell-like warning, wailing siren when the autopilot drops, overspeed clacker, stick-shaker rattle for the stall, configuration horn for the gear.
   Both: altitude-alert chime, SINK RATE / PULL UP / TOO LOW GEAR calls (speechSynthesis when the browser has it, tones otherwise), engine-start cues (ffSndEngineStart).
   The alert bus skips the cockpit low-pass and the cockpit level so a warning is heard from every view; mute and pause still silence it. Inside the cockpit everything is low-passed and quieter;
   chase / wing / spotter / orbit views are brighter and louder. Bobby's voice (BOB.sp.on) ducks the whole mix. Persistent nodes: 5 per engine + about 33 shared. */
const ffS={fam:"boeing",al:{},said:[],ctx:null,mute:false,key:"",rpm:[],eng:[],g:{},acc:0,clock:0,prev:{},nodes:0,src:[],vol:0.55,avol:0.8,duck:1,fade:1,busy:false,res:null,crashed:false};
function ffSndLS(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){} return null; }
ffS.log=[]; ffS.mute=ffSndLS("atlas-fly-snd")==="0";
function ffSndCtor(){ return (typeof window!=="undefined")&&(window.AudioContext||window.webkitAudioContext)||null; }
/* build the persistent graph for n engines */
function ffSndBuild(n){
  const C=ffSndCtor(); if(!C) return false;
  let ctx; try{ ctx=new C(); }catch(e){ return false; }
  const sr=ctx.sampleRate||44100, buf=ctx.createBuffer(1,Math.max(2,Math.floor(sr*2)),sr), d=buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  ffS.ctx=ctx; ffS.buf=buf; ffS.nodes=0; ffS.src=[]; ffS.g={}; ffS.eng=[]; ffS.rpm=new Array(n).fill(0); ffS.n=n;
  const G=(v)=>{ const g=ctx.createGain(); g.gain.value=v; ffS.nodes++; return g; };
  const F=(type,f,q)=>{ const b=ctx.createBiquadFilter(); b.type=type; b.frequency.value=f; b.Q.value=q===undefined?0.7:q; ffS.nodes++; return b; };
  const NS=(rate)=>{ const s=ctx.createBufferSource(); s.buffer=buf; s.loop=true; s.playbackRate.value=rate||1; ffS.nodes++; ffS.src.push(s); s.start(0,Math.random()*1.5); return s; };
  const OS=(type,f)=>{ const o=ctx.createOscillator(); o.type=type; o.frequency.value=f; ffS.nodes++; ffS.src.push(o); o.start(); return o; };
  /* output chain: bus -> cabin low-pass -> master -> compressor -> destination */
  const bus=G(1), lp=F("lowpass",9000,0.5), master=G(0), comp=ctx.createDynamicsCompressor(), abus=G(1), am=G(0); ffS.nodes++;
  bus.connect(lp); lp.connect(master); master.connect(comp); comp.connect(ctx.destination); ffS.bus=bus; ffS.g.lp=lp; ffS.g.master=master;
  abus.connect(am); am.connect(comp); ffS.abus=abus; ffS.g.am=am;   /* alerts: own bus, no cabin low-pass and no cockpit level */
  const ke=1.1/Math.sqrt(n);
  for(let i=0;i<n;i++){
    const ns=NS(0.93+Math.random()*0.14), bp=F("bandpass",600,0.7), ng=G(0), w=OS(i%2?"sine":"triangle",900*(1+(i-n/2)*0.012)), wg=G(0);
    ns.connect(bp); bp.connect(ng); ng.connect(bus); w.connect(wg); wg.connect(bus); ffS.eng.push({bp,ng,w,wg,ke});
  }
  const chain=(type,f,q,rate)=>{ const s=NS(rate), fl=F(type,f,q), g=G(0); s.connect(fl); fl.connect(g); g.connect(bus); return {fl,g}; };
  ffS.g.rumble=chain("lowpass",110,0.7,0.8); ffS.g.core=chain("bandpass",720,1.1,1.0); ffS.g.wind=chain("bandpass",900,0.6,1.1); ffS.g.tyre=chain("lowpass",160,0.8,0.7);
  ffS.g.spoil=chain("bandpass",520,0.6,1.0); ffS.g.rev=chain("lowpass",850,0.7,0.9); ffS.g.mech=chain("bandpass",180,1.4,0.6);
  const fo=OS("triangle",210), fg=G(0); fo.connect(fg); fg.connect(bus); ffS.g.flap={o:fo,g:fg};
  const bo=ffS.fam!=="airbus", so=OS(bo?"sawtooth":"triangle",bo?58:720), sg=G(0); so.connect(sg); sg.connect(abus); ffS.g.stall={o:so,g:sg};   /* boeing: stick-shaker rattle, airbus: cricket */
  const co=OS("sawtooth",230), cg=G(0); co.connect(cg); cg.connect(abus); ffS.g.clack={o:co,g:cg};
  return true;
}
/* one-shot helpers: transient nodes that free themselves (events only, never per frame) */
function ffSndTone(f0,f1,dur,vol,type,delay,dst,shape){   /* shape: undefined = quick attack, exponential decay; "flat" = steady with a short release; "lin" = straight fade out */
  const ctx=ffS.ctx; if(!ctx) return; const t=ctx.currentTime+(delay||0), o=ctx.createOscillator(), g=ctx.createGain(); o.type=type||"sine"; o.frequency.setValueAtTime(f0,t); if(f1!==f0) o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);
  g.gain.setValueAtTime(0.0001,t);
  if(shape==="flat"){ g.gain.linearRampToValueAtTime(vol,t+0.008); g.gain.setValueAtTime(vol,t+Math.max(0.009,dur-0.015)); g.gain.linearRampToValueAtTime(0.0001,t+dur); }
  else if(shape==="lin"){ g.gain.linearRampToValueAtTime(vol,t+0.005); g.gain.linearRampToValueAtTime(0.0001,t+dur); }
  else { g.gain.linearRampToValueAtTime(vol,t+Math.min(0.02,dur/4)); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); }
  o.connect(g); g.connect(dst||ffS.bus); o.start(t); o.stop(t+dur+0.05);
  o.onended=()=>{ try{ o.disconnect(); g.disconnect(); }catch(e){} };
}
function ffSndBurst(type,f,q,dur,vol,delay,dst){
  const ctx=ffS.ctx; if(!ctx) return; const t=ctx.currentTime+(delay||0), s=ctx.createBufferSource(), fl=ctx.createBiquadFilter(), g=ctx.createGain(); s.buffer=ffS.buf; s.loop=true; fl.type=type; fl.frequency.value=f; fl.Q.value=q;
  g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(vol,t+Math.min(0.03,dur/4)); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); s.connect(fl); fl.connect(g); g.connect(dst||ffS.bus); s.start(t,Math.random()); s.stop(t+dur+0.05);
  s.onended=()=>{ try{ s.disconnect(); fl.disconnect(); g.disconnect(); }catch(e){} };
}
/* ----- cockpit alerts. The frequencies, levels and pulse timings below were MEASURED from two reference recordings supplied by the owner (a flight-deck alert simulator app: its Boeing
   tab and its Airbus tab) and rebuilt here as synthesis: nothing is sampled or embedded. Every pattern is a list of voices:
     ["S",f0,f1,start,dur,vol,type,shape]   a tone (shape "flat" steady, "lin" fades out, none = decays)
     ["h",wave,f0a,f0b,start,dur,vol]       a harmonic-rich tone whose pitch glides from f0a to f0b (wave = FFS_WAVE key: spectral envelope or harmonic list)
     ["n",f,q,start,dur,vol]                a low-passed noise thump
   Matched to the recordings: boeing altitude alert, A/P disconnect (737: three rising buzzes, 747: rising wails), master caution (four beeps), take-off configuration horn;
   airbus A/P disconnect (three bursts), master caution (single chime), «level off» tones used as the altitude alert, master warning ticks. Stall shaker, overspeed clacker and
   the ground-proximity whoop are not in the recordings: they stay approximations. ----- */
const FFS_WAVE={ap737:{step:100,a:[0.03,0.02,0.02,0.11,0.34,0.35,0.92,0.87,1.0,0.63,0.29,0.26,0.87,0.64,0.7,0.48,0.4,0.21,0.4,0.34,0.25,0.17,0.16,0.45,0.61,0.4,0.5,0.33,0.38,0.18,0.24,0.16,0.13,0.41,0.38,0.37,0.35]},ap747:{step:100,a:[0.05,0.31,0.74,1.0,0.18,0.14,0.27,0.28,0.18,0.27,0.18,0.09,0.09,0.08,0.09,0.13,0.14,0.1,0.09,0.11,0.19,0.05,0.06,0.08,0.1,0.06,0.04,0.08,0.03,0.04,0.02,0.03,0.03,0.02,0.02,0.02,0.02]},horn:{k:[0.06,0.26,0.82,0.46,0.83,0.33,1.0,0.71,0.38,0.12,0.38,0.77,0.45,0.78,0.61,0.67,0.43]}};
const FFS_AL={
  airbus:{
    caution:[["S",1001,1001,0,0.55,0.36,"sine","lin"],["S",3003,3003,0,0.4,0.032,"sine","lin"],["n",1200,0.7,0,0.06,0.25]],
    warning:[["S",824,824,0,0.26,0.3,"sine","flat"],["S",1650,1650,0,0.26,0.04,"sine","flat"],["n",2000,0.6,0,0.26,0.12]],
    ap:[0,0.395,0.79].flatMap(d=>[["S",832,832,d,0.23,0.125,"sine","flat"],["S",1662,1662,d,0.23,0.112,"sine","flat"],["S",2503,2503,d,0.23,0.037,"sine","flat"],["S",1620,1620,d,0.23,0.05,"sine","flat"],["S",1698,1698,d,0.23,0.05,"sine","flat"],["S",4971,4971,d,0.23,0.062,"sine","flat"]]),
    alt:[["S",659,659,0,1.36,0.084,"sine","flat"],["S",1050,1050,0,1.36,0.084,"sine","flat"]],
    gear:[["S",824,824,0,0.26,0.3,"sine","flat"],["S",1650,1650,0,0.26,0.04,"sine","flat"],["n",2000,0.6,0,0.26,0.12],["S",824,824,0.4,0.26,0.3,"sine","flat"],["S",1650,1650,0.4,0.26,0.04,"sine","flat"],["n",2000,0.6,0.4,0.26,0.12]]},
  boeing:{
    caution:[0,1,2,3].flatMap(i=>[["S",1074,1074,i*0.222,0.18,0.113,"sine","flat"],["S",1243,1243,i*0.222,0.18,0.016,"sine","flat"],["S",2148,2148,i*0.222,0.18,0.012,"sine","flat"],["n",900,0.7,i*0.222,0.1,0.3]]),
    warning:[["S",990,990,0,0.2,0.3,"sine"],["S",1980,1980,0,0.1,0.08,"sine"],["S",990,990,0.2,0.2,0.3,"sine"],["S",990,990,0.4,0.2,0.3,"sine"],["S",990,990,0.6,0.2,0.3,"sine"]],
    ap:[0,0.76,1.52].map(d=>["h","ap737",122,165,d,0.62,0.64]),
    ap747:[["h","ap747",150,300,0,0.43,0.39],["h","ap747",150,300,0.43,0.43,0.39],["h","ap747",160,300,0.86,0.4,0.39]],
    alt:[["S",518,518,0,0.97,0.059,"sine","flat"],["S",638,638,0,0.97,0.177,"sine","flat"],["S",779,779,0,0.97,0.295,"sine","flat"],["S",1276,1276,0,0.97,0.03,"sine","flat"],["S",1559,1559,0,0.97,0.027,"sine","flat"]],
    gear:[0,1,2,3].map(i=>["h","horn",202.3,202.3,i*0.526,0.22,0.296])},
  both:{ whoop:[["S",500,950,0,0.34,0.26,"triangle"],["S",500,950,0.44,0.34,0.26,"triangle"]] }};
/* PeriodicWave of a harmonic voice at fundamental f0: built from a spectral envelope (one value per 100 Hz) or a list of harmonic levels; cached */
function ffSndWave(key,f0){
  const ctx=ffS.ctx, W=FFS_WAVE[key]; if(!ctx||!W||!ctx.createPeriodicWave) return null; const ck=key+"|"+Math.round(f0/5); ffS.pw=ffS.pw||{}; if(ffS.pw[ck]) return ffS.pw[ck];
  const K=W.k?W.k.length:Math.max(2,Math.floor(3600/f0)), re=new Float32Array(K+1), im=new Float32Array(K+1);
  for(let k=1;k<=K;k++){ if(W.k) im[k]=W.k[k-1]; else { const x=k*f0/W.step, i=Math.min(W.a.length-2,Math.floor(x)), u=Math.min(1,x-i); im[k]=W.a[i]+(W.a[i+1]-W.a[i])*u; } }
  try{ return ffS.pw[ck]=ctx.createPeriodicWave(re,im); }catch(e){ return null; }
}
function ffSndHarm(key,f0a,f0b,dur,vol,delay,dst){
  const ctx=ffS.ctx; if(!ctx) return; const pw=ffSndWave(key,(f0a+f0b)/2), t=ctx.currentTime+(delay||0), o=ctx.createOscillator(), g=ctx.createGain();
  if(pw&&o.setPeriodicWave) o.setPeriodicWave(pw); else o.type="sawtooth"; o.frequency.setValueAtTime(f0a,t); if(f0b!==f0a) o.frequency.linearRampToValueAtTime(f0b,t+dur);
  g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(vol,t+0.008); g.gain.setValueAtTime(vol,t+Math.max(0.009,dur-0.015)); g.gain.linearRampToValueAtTime(0.0001,t+dur);
  o.connect(g); g.connect(dst||ffS.bus); o.start(t); o.stop(t+dur+0.05); o.onended=()=>{ try{ o.disconnect(); g.disconnect(); }catch(e){} };
}
const FFS_SAY={sink:"Sink rate",pull:"Pull up",gear:"Too low, gear",stall:"Stall, stall",traffic:"Traffic, traffic"};
function ffSndAlert(name,reps,gap){
  const ctx=ffS.ctx; if(!ctx||ffS.mute) return false; if(name==="ap"&&ffS.key==="b747"&&ffS.fam==="boeing") name="ap747";
  const L=(FFS_AL[ffS.fam]&&FFS_AL[ffS.fam][name])||FFS_AL.both[name]; if(!L) return false;
  const len=L.reduce((m,x)=>Math.max(m,(x[0]==="S"?x[3]+x[4]:x[0]==="h"?x[4]+x[5]:x[3]+x[4])),0); ffS.log.push(ffS.fam+":"+name); if(ffS.log.length>40) ffS.log.shift();
  for(let r=0;r<(reps||1);r++){ const o=r*(len+(gap||0.25));
    L.forEach(x=>{ if(x[0]==="S") ffSndTone(x[1],x[2],x[4],x[5],x[6],x[3]+o,ffS.abus,x[7]); else if(x[0]==="h") ffSndHarm(x[1],x[2],x[3],x[5],x[6],x[4]+o,ffS.abus); else ffSndBurst("lowpass",x[1],x[2],x[4],x[5],x[3]+o,ffS.abus); }); }
  return true;
}
/* spoken call (speechSynthesis when the browser has it; the tones above always play); a call is not repeated while it is still being said */
function ffSndSay(key){
  if(ffS.mute||(typeof FLY!=="undefined"&&FLY.paused)) return false; const txt=FFS_SAY[key]; if(!txt) return false; ffS.said.push(key); if(ffS.said.length>40) ffS.said.shift();
  try{ const sy=typeof speechSynthesis!=="undefined"?speechSynthesis:null, U=typeof SpeechSynthesisUtterance!=="undefined"?SpeechSynthesisUtterance:null; if(!sy||!U||sy.pending) return false;
    const u=new U(txt); u.lang="en-US"; u.rate=1.05; u.pitch=0.9; u.volume=0.95; sy.speak(u); return true; }catch(e){ return false; }
}
/* the sound test of the setup screen: plays one alert of a family without starting a flight (its own short-lived audio context), so it can be compared by ear with the originals */
const FFS_TEST=[["boeing","Boeing 737 / 747",[["alt","تنبيه الارتفاع"],["ap","فصل الطيار الآلي 737"],["ap747","فصل الطيار الآلي 747"],["caution","تنبيه عام (Master caution)"],["gear","بوق إعدادات الإقلاع / العجلات"],["warning","تحذير رئيسي"]]],
  ["airbus","Airbus A380",[["alt","تنبيه الارتفاع"],["ap","فصل الطيار الآلي"],["caution","تنبيه عام (Master caution)"],["warning","تحذير رئيسي (Master warning)"]]]];
function ffSndTestHTML(){
  return `<details class="fsec fsnd"><summary>اختبار أصوات الإنذارات</summary><p class="status">اضغط لتسمع الصوت وقارنه بالأصل (بدون بدء الطيران).</p>`+FFS_TEST.map(g=>`<h4>${g[1]}</h4><div class="chips">${g[2].map(x=>`<button type="button" class="chip" data-fsnd="${g[0]}:${x[0]}">${x[1]}</button>`).join("")}</div>`).join("")+`</details>`;
}
function ffSndTest(fam,name){
  const key=name==="ap747"?"b747":(fam==="airbus"?"a380":"b737"); ffS.fam=fam; ffS.key=key;
  if(!ffS.ctx){ if(!ffSndBuild(2)) return false; ffS.testing=true; try{ const r=ffS.ctx.resume&&ffS.ctx.resume(); if(r&&r.catch) r.catch(()=>{}); }catch(e){} }
  try{ ffS.g.am.gain.value=ffS.avol; }catch(e){} const was=ffS.mute; ffS.mute=false; const ok=ffSndAlert(name==="ap747"?"ap":name,1,0.25); ffS.mute=was;
  clearTimeout(ffS.testT); ffS.testT=setTimeout(()=>{ if(ffS.testing&&!ffS.live){ ffS.testing=false; ffSndStopGraph(); } },7000); return ok;
}
/* a warning from another module (fuel, engines): "caution" (default) or "warning" */
function ffSndWarn(kind){ const t=ffS.clock; if(ffS.last&&t-ffS.last<0.4&&t>=ffS.last) return false; ffS.last=t; return ffSndAlert(kind==="warning"?"warning":"caution",kind==="warning"?2:1,0.3); }
/* engine start cues from the engine panel: crank (starter whine), light (light-off thump), idle, stop */
function ffSndEngineStart(i,ph){
  if(!ffS.ctx) return;
  if(ph==="crank"){ ffSndTone(180,820,3.2,0.07,"sawtooth"); ffSndBurst("bandpass",700,1.2,3,0.07); }
  else if(ph==="light"){ ffSndTone(80,45,0.5,0.4,"sine"); ffSndBurst("lowpass",420,0.8,0.45,0.35); }
  else if(ph==="stop"){ ffSndTone(120,30,0.6,0.25,"sine"); }
}
function ffSndEnsure(n){
  if(ffS.ctx||ffS.mute) return !!ffS.ctx;
  if(!ffSndBuild(n||2)) return false;
  try{ const r=ffS.ctx.resume&&ffS.ctx.resume(); if(r&&r.catch) r.catch(()=>{}); }catch(e){}
  if(!ffS.res){ ffS.res=()=>{ try{ if(ffS.ctx&&ffS.ctx.state==="suspended") ffS.ctx.resume(); }catch(e){} }; document.addEventListener("pointerdown",ffS.res,{passive:true}); document.addEventListener("keydown",ffS.res); }
  return true;
}
/* speaker button in the flight top bar */
function ffSndIcon(on){ return on?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>'
  :'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/></svg>'; }
function ffSndMount(){
  const top=document.querySelector("#fly .ftop"); if(!top) return null; let b=document.getElementById("ffSndB");
  if(!document.getElementById("ffSndCss")){ const st=document.createElement("style"); st.id="ffSndCss";
    st.textContent=".ffsb{padding:0;display:grid;place-items:center;min-width:40px}.ffsb svg{width:20px;height:20px}.ffsb[aria-pressed=false]{opacity:.65}@media (max-width:400px){.ftop{gap:4px}.ftop .fb{min-width:36px;padding:0 6px}.ffsb{width:36px}}"; document.head.appendChild(st); }
  if(!b){ b=document.createElement("button"); b.type="button"; b.id="ffSndB"; b.className="fb ffsb"; b.setAttribute("aria-label","تشغيل أو إيقاف صوت الطيران"); b.title="الصوت";
    b.addEventListener("click",e=>{ e.stopPropagation(); ffSndToggle(); }); const help=top.querySelector('[data-fa="help"]'); top.insertBefore(b,help||null); }
  b.setAttribute("aria-pressed",String(!ffS.mute)); b.innerHTML=ffSndIcon(!ffS.mute); return b;
}
function ffSndToggle(on){
  ffS.mute=on===undefined?!ffS.mute:!on; ffSndLS("atlas-fly-snd",ffS.mute?"0":"1"); ffSndMount();
  if(!ffS.mute&&!ffS.ctx&&ffS.live) ffSndEnsure(ffS.nEng||2);
  if(ffS.ctx&&ffS.g.master){ ffS.g.master.gain.setTargetAtTime(ffS.mute?0:ffS.vol,ffS.ctx.currentTime,0.05); ffS.g.am.gain.setTargetAtTime(ffS.mute?0:ffS.avol,ffS.ctx.currentTime,0.05); }
  return !ffS.mute;
}
function ffSndStart(key){
  ffS.live=true; ffS.key=key; ffS.crashed=false; ffS.prev={}; ffS.fade=1; ffS.acc=0; ffS.clock=0; ffS.al={}; ffS.said=[]; ffS.log=[]; ffS.last=0;
  ffS.fam=(typeof FD_FAMILY!=="undefined"&&FD_FAMILY[key]==="airbus")?"airbus":"boeing";
  try{ ffSndMount(); }catch(e){}
  const A=typeof FPH_AC!=="undefined"&&FPH_AC[key]; ffS.nEng=A?A.n:2;
  if(ffS.ctx) ffSndStopGraph();
  return ffSndEnsure(ffS.nEng);
}
function ffSndStopGraph(){
  const c=ffS.ctx; if(!c) return;
  ffS.src.forEach(s=>{ try{ s.stop(); }catch(e){} try{ s.disconnect(); }catch(e){} });
  try{ ffS.g.master.disconnect(); ffS.bus.disconnect(); ffS.g.am.disconnect(); ffS.abus.disconnect(); }catch(e){}
  try{ const p=c.close&&c.close(); if(p&&p.catch) p.catch(()=>{}); }catch(e){}
  ffS.src=[]; ffS.ctx=null; ffS.g={}; ffS.eng=[]; ffS.nodes=0;
}
function ffSndStop(){
  ffS.live=false; if(ffS.res){ document.removeEventListener("pointerdown",ffS.res); document.removeEventListener("keydown",ffS.res); ffS.res=null; }
  const c=ffS.ctx; if(!c) return;
  try{ ffS.g.master.gain.setTargetAtTime(0,c.currentTime,0.04); ffS.g.am.gain.setTargetAtTime(0,c.currentTime,0.04); }catch(e){}
  setTimeout(()=>{ if(!ffS.live) ffSndStopGraph(); },180);       /* short fade, then everything is stopped and the context closed */
}
/* ----- per-frame update ----- */
function ffSndUpdate(info,s,dt){
  const c=ffS.ctx; if(!c||!ffS.g.master) return;
  ffS.clock+=dt; ffS.acc+=dt; if(ffS.acc<0.04) return; const h=ffS.acc; ffS.acc=0;
  const t=c.currentTime, T=(p,v,k)=>p.setTargetAtTime(v,t,k||0.12), n=ffS.n, A=s.A, paused=typeof FLY!=="undefined"&&FLY.paused, inside=typeof FLY!=="undefined"&&FLY.view==="cockpit", P=ffS.prev;
  if(c.state==="suspended"&&!paused&&!ffS.mute){ try{ c.resume(); }catch(e){} }
  /* engines: smoothed rpm per engine (spool-up from 0 after the start, spool-down after a failure) */
  let sum=0, mx=0;
  for(let i=0;i<n;i++){ const tg=s.eng[i]===false?0:0.2+0.8*Math.max(0,Math.min(1,s.n1[i])), r=ffS.rpm[i], k=tg>r?(r<0.17?0.3:0.9):0.5; ffS.rpm[i]=r+(tg-r)*Math.min(1,h*k); }
  const E=ffS.eng;
  for(let i=0;i<n;i++){ const r=ffS.rpm[i], e=E[i]; sum+=r; if(r>mx) mx=r;
    T(e.w.frequency,520+2350*r,0.1); T(e.wg.gain,(0.004+0.05*r*r)*e.ke*(r>0.02?1:0),0.15);
    T(e.bp.frequency,300+1350*r,0.12); T(e.ng.gain,(0.03+0.5*Math.pow(r,1.6))*e.ke*(r>0.02?1:0),0.15); }
  const avg=sum/n, G=ffS.g;
  T(G.rumble.g.gain,0.55*Math.pow(avg,1.2),0.2); T(G.core.g.gain,0.4*Math.pow(Math.max(0,(mx-0.78)/0.22),2),0.2);
  /* airflow: dynamic pressure grows with IAS^2, the outside gets quieter with altitude */
  const ias=Math.max(0,info.ias), alt=Math.max(0,info.alt), wv=Math.pow(ias/320,2), af=0.35+0.65*Math.exp(-alt/25000);
  T(G.wind.g.gain,0.6*wv*af,0.2); T(G.wind.fl.frequency,450+1900*Math.min(1.3,ias/320),0.3);
  /* tyres on the ground */
  const gs=info.gs, rolling=s.ground&&s.mains?Math.min(1,gs/90):0; T(G.tyre.g.gain,0.4*Math.pow(rolling,1.2),0.15); T(G.tyre.fl.frequency,80+280*Math.min(1,gs/130),0.2);
  /* airbrakes and reverse thrust */
  T(G.spoil.g.gain,0.28*s.spoil*Math.min(1,0.25+ias/130),0.2);
  const rev=s.lever<-0.05&&s.ground&&mx>0.25; T(G.rev.g.gain,rev?0.6*Math.min(1,ias/18+0.25)*Math.min(1,(mx-0.2)/0.5):0,0.2);
  /* gear transit (hydraulic rumble) and flap motor */
  const gm=Math.abs(s.gear-s.gearT)>0.003, fm=Math.abs(s.flaps-s.flapsT)>0.003;
  T(G.mech.g.gain,gm?0.28:0,0.1); if(gm) T(G.mech.fl.frequency,150+60*Math.sin(ffS.clock*3),0.1);
  T(G.flap.g.gain,fm?0.03:0,0.08); T(G.flap.o.frequency,190+60*Math.min(1,Math.abs(s.flaps-s.flapsT)*4)+8*Math.sin(ffS.clock*11),0.08);
  if(P.gm&&!gm){ ffSndTone(95,38,0.32,0.5,"sine"); ffSndBurst("lowpass",320,0.8,0.12,0.5); }        /* gear locks: thunk */
  P.gm=gm;
  /* warnings: the stall voice and the overspeed clacker are persistent nodes, everything else is a one-shot pattern that repeats on a timer while its condition holds */
  const bo=ffS.fam!=="airbus", live=!paused&&!ffS.mute, rep=(k,on,per,fn)=>{ if(!on||!live){ ffS.al[k]=0; return; } if(ffS.clock>=(ffS.al[k]||0)){ ffS.al[k]=ffS.clock+per; fn(); } };
  const stallW=!!s.ev.stall&&!s.ground&&ias>40; T(G.stall.g.gain,stallW&&Math.sin(ffS.clock*(bo?72:18.8))>0?(bo?0.2:0.11):0,0.012);
  rep("stall",stallW&&!bo,1.8,()=>{ ffSndAlert("warning"); ffSndSay("stall"); });
  const ovs=!!s.ev.overspeed, clk=ovs&&bo; T(G.clack.g.gain,clk&&((ffS.clock*7)%1)<0.35?0.1:0,0.01); T(G.clack.o.frequency,clk?230+((ffS.clock*7)%1<0.35?40:0):230,0.01);
  rep("ovs",ovs&&!bo,1.3,()=>ffSndAlert("warning"));
  if(P.ap===true&&!s.ap.on&&!s.ground) ffSndAlert("ap",bo?2:3,0.2); P.ap=!!s.ap.on;   /* autopilot disconnect */
  rep("gear",!!s.ev.gearWarn&&!s.ground,1.6,()=>{ ffSndAlert("gear"); ffSndSay("gear"); });
  const agl=info.agl, vs=info.vs, pullUp=!s.ground&&agl<400&&vs<-2800, sink=!s.ground&&!pullUp&&agl<1000&&vs<-1800;
  rep("pull",pullUp,1.6,()=>{ ffSndAlert("whoop"); ffSndSay("pull"); }); rep("sink",sink,3.2,()=>ffSndSay("sink"));
  if(!!s.ev.flapWarn&&!P.fw&&!s.ground) ffSndAlert("caution"); P.fw=!!s.ev.flapWarn;
  if(!!s.ev.tail&&!P.tl) ffSndAlert("caution"); P.tl=!!s.ev.tail;
  /* altitude alert: one chime when the selected altitude is about 1000 ft away, one more when the aircraft leaves it by more than 250 ft */
  if(s.ap.on&&!s.ground){ const d=Math.abs(info.alt-s.ap.alt);
    if(P.apAlt===s.ap.alt){ if(P.altd>1000&&d<=1000) ffSndAlert("alt"); if(P.cap&&d>250){ ffSndAlert("alt"); P.cap=false; } } else P.cap=false;
    if(d<100) P.cap=true; P.altd=d; P.apAlt=s.ap.alt; } else { P.altd=0; P.cap=false; P.apAlt=undefined; }
  /* touchdown: a thump plus tyre squeal scaled by the sink rate; crash thud */
  const td=s.ev.touch; if(td&&P.td!==td){ const k=Math.max(0.2,Math.min(1,td.sink/600)); ffSndTone(110,40,0.35,0.7*k,"sine"); ffSndBurst("lowpass",260,0.7,0.3,0.6*k); ffSndBurst("bandpass",2300,6,0.2+0.5*k,0.2+0.3*k,0.02); } P.td=td;
  if(s.ev.crash&&!ffS.crashed){ ffS.crashed=true; ffSndTone(70,25,0.9,0.9,"sine"); ffSndBurst("lowpass",600,0.6,1.2,0.9); ffS.fade=0.15; ffS.al={}; }
  /* mix: cockpit is muffled and quieter, outside views brighter; Bobby's voice ducks everything; pause and the speaker button silence it */
  const sp=(typeof BOB!=="undefined"&&BOB.sp&&BOB.sp.on)||(typeof faAtcTalking==="function"&&faAtcTalking()), dk=sp?0.42:1;   /* fa: the controller's radio ducks the engines too */ ffS.duck+=(dk-ffS.duck)*Math.min(1,h*6);
  T(ffS.g.lp.frequency,inside?1000:9000,0.2);
  T(ffS.g.master.gain,ffS.mute||paused?0:ffS.vol*ffS.duck*ffS.fade*(inside?0.6:1),0.12); T(ffS.g.am.gain,ffS.mute||paused||ffS.crashed?0:ffS.avol,0.08);
}
function ffSndVol(v){ ffS.vol=Math.max(0,Math.min(1,v)); return ffS.vol; }
