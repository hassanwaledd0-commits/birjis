/* ---------- «اسأل ميسلون»: the AI answers in two short sentences and Bobby SPEAKS them; with no AI he speaks the rule-based advice ---------- */
function flyCoachStop(){ try{ if(FLY.coach.ctl) FLY.coach.ctl.abort(); }catch(e){} FLY.coach.ctl=null; FLY.coach.busy=false; FLY.coach.text=""; try{ bobStop(); }catch(e){} }
async function flyCoach(q){
  const s=FLY.s; if(!s||FLY.coach.busy) return; const info=fphInfo(s); let txt="", sm=null;
  try{ sm=await getSample(); }catch(e){}
  if(sm){
    FLY.coach.busy=true; FLY.coach.text="ميسلون يفكّر..."; FLY.coach.ctl=new AbortController(); try{ bobMood("think"); }catch(e){}
    try{ const r=await sm(bobFlightPrompt(s,info,q),{signal:FLY.coach.ctl.signal,cache:false}); txt=bobFlightTrim(r&&r.text); }
    catch(e){ if(e&&(e.code==="aborted"||e.name==="AbortError")){ FLY.coach.busy=false; return; } txt=""; }
    FLY.coach.busy=false; FLY.coach.ctl=null; FLY.coach.text=""; if(!FLY.on) return;
  }
  if(!txt) txt=flyHint(s,fphInfo(FLY.s||s))||"حافظ على الاتجاه والسرعة، وراقب الأجهزة.";
  try{ bobSay(txt,{priority:"high",caption:bobCapEff()?true:undefined,mood:"idle"}); }catch(e){}
}
