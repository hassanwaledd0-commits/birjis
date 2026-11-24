/* ---------- (v36) idle work: heavy builders that nobody has asked for yet run in the gaps, never during a welcome or an interaction ---------- */
function idleDo(fn,timeout){
  const run=()=>{ try{ fn(); }catch(e){ console.error(e); } };
  if(typeof requestIdleCallback==="function") requestIdleCallback(run,{timeout:timeout||3000}); else setTimeout(run,200);
}
const PERF={warm:[],busyUntil:0};
function perfWarm(name,fn,delay){ PERF.warm.push([name,fn,delay||2500]); if(PERF.warm.length===1) perfWarmNext(); }
function perfWarmNext(){
  const j=PERF.warm[0]; if(!j) return;
  setTimeout(()=>{ const welcome=(typeof BW!=="undefined"&&BW&&BW.el), recent=performance.now()<PERF.busyUntil;
    if(welcome||document.hidden||recent){ j[2]=1500; perfWarmNext(); return; }   /* try again a little later */
    PERF.warm.shift(); idleDo(()=>{ try{ j[1](); }catch(e){ console.error(j[0],e); } if(PERF.warm.length) perfWarmNext(); },4000); },j[2]);
}
["pointerdown","keydown","wheel","touchstart"].forEach(t=>window.addEventListener(t,()=>{ PERF.busyUntil=performance.now()+900; },{passive:true,capture:true}));
