/* ---------- fe: fuel ----------
   Physics (p8p.js): s.fuel (kg), s.tank=[left,centre,right], s.ff[i] (kg/s), mass = zero-fuel mass + fuel, burn = thrust x sfc, empty tanks flame the engines out (N1 runs down in ~10 s).
   Here: the plan (setup chips + slider, FLY.opts.fuel), the gate refuelling step with a fuel truck, the gauges (E/WD line, SD FUEL page, HUD line), LOW FUEL / FUEL CRITICAL warnings and Bobby's lines.
   Public: feFuelState() -> {kg,max,endurMin,low,crit,tanks,flow,used,target}; feFuelTick(dt) (from feStep); feFuelBegin/feFuelStep/feFuelPanel/feFuelAct (gate); feFuelHTML/feFuelMount (setup); feFuelHud, feFuelWarns, feFuelSd, feFuelFob. */
const FEF={ffS:0,low:false,crit:false,out:false,tCrit:0,s:null};
const FEF_T={
  low:{ar:"الوقود منخفض. توجّه إلى أقرب مطار.",en:"Low fuel. Head for the nearest airport."},
  crit:{ar:"وقود حرج! اهبط في أقرب فرصة.",en:"Critical fuel! Land as soon as possible."},
  out:{ar:"نفد الوقود وتوقفت المحركات. حافظ على سرعة الانزلاق وابحث عن مدرج.",en:"Out of fuel, the engines have stopped. Hold the glide speed and look for a runway."},
  start:{ar:"شاحنة الوقود وصلت. التزويد بالوقود جارٍ.",en:"The fuel truck is here. Refuelling now."},
  done:{ar:"اكتمل التزويد بالوقود.",en:"Refuelling is complete."},
  more:{ar:"طُلب وقود إضافي.",en:"More fuel requested."},
  title:{ar:"التزويد بالوقود",en:"Refuelling"},
  lowW:{ar:"وقود منخفض",en:"LOW FUEL"},critW:{ar:"وقود حرج",en:"FUEL CRITICAL"}
};
const FEF_B={fuelx:{ar:"اطلب وقوداً إضافياً",en:"Request more fuel"},fuels:{ar:"تخطّي",en:"Skip"},fuel4:{ar:"تسريع ×4",en:"Speed up ×4"}};
const FEF_CH=[["auto","حسب السيناريو","Scenario default"],["min","أدنى","Minimum"],["std","قياسي","Standard"],["full","ممتلئ","Full"]];
const fefTx=o=>typeof fkTx==="function"?fkTx(o):o.ar;
const fefKg=v=>String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g,",");
const fefHm=m=>{ m=Math.max(0,Math.round(m)); return Math.floor(m/60)+":"+String(m%60).padStart(2,"0"); };
/* ---------- state for the displays and the ATC agent ---------- */
/* the gate scenario loads its plan before the engines start: no warnings until the taxi begins */
const feFuelQuiet=()=>{ const s=FLY.s; return !!(s&&s.scn==="gate"&&typeof FKG!=="undefined"&&["board","fuel","ready","tug","push","start","disc"].indexOf(FKG.ph)>=0); };
function feFuelState(){
  const s=FLY.s; if(!s) return null; const F=fphFuelCfg(s.key), fl=s.ff.reduce((a,b)=>a+b,0)*3600, fs=FEF.s===s&&FEF.ffS>=0?FEF.ffS:fl, base=s.ground?F.flow:Math.max(fs,0.6*F.flow), q=feFuelQuiet();
  const endur=s.fuel/Math.max(500,base)*60, low=!q&&endur<45&&s.fuel<F.max*0.6, crit=!q&&endur<20&&s.fuel<F.max*0.6;
  return {kg:s.fuel,max:F.max,endurMin:endur,low,crit,tanks:s.tank.slice(),flow:fl,used:s.fuelUsed,target:s.fuelTarget,empty:s.fuel<=1};
}
const feFuelCol=st=>st&&st.crit?FDC.red:st&&st.low?FDC.amb:FDC.grn;
/* once per physics step from feStep: smooth the flow, raise / clear the warnings (chime hook, Bobby, message) */
function feFuelTick(dt){
  const s=FLY.s; if(!s) return; if(FEF.s!==s){ FEF.s=s; FEF.ffS=-1; FEF.low=FEF.crit=FEF.out=false; FEF.tCrit=0; }
  const fl=s.ff.reduce((a,b)=>a+b,0)*3600; if(FEF.ffS<0){ if(fl>0) FEF.ffS=fl; else return; } FEF.ffS+=(fl-FEF.ffS)*(1-Math.exp(-dt/20)); const st=feFuelState(), say=(o,k,ms)=>{ try{ if(typeof bobSay==="function") bobSay(fefTx(o),{priority:"alert",key:"fef_"+k,keyMs:ms}); }catch(e){} };
  const chime=k=>{ try{ if(typeof ffSndWarn==="function") ffSndWarn(k); }catch(e){} };
  if(st.low&&!FEF.low){ FEF.low=true; chime("caution"); say(FEF_T.low,"low",60000); } else if(!st.low) FEF.low=false;
  if(st.crit&&!FEF.crit){ FEF.crit=true; FEF.tCrit=0; chime("warning"); say(FEF_T.crit,"crit",45000); } else if(!st.crit) FEF.crit=false;
  if(FEF.crit){ FEF.tCrit+=dt; if(FEF.tCrit>30){ FEF.tCrit=0; chime("caution"); } }
  if(s.ev.flameout&&!FEF.out){ FEF.out=true; chime("warning"); say(FEF_T.out,"out",1e9); try{ flyMsg("ENGINE FAIL",4); }catch(e){} }
}
/* ---------- gauges ---------- */
function feFuelWarns(w,FH){ const st=feFuelState(); if(!st) return; if(st.empty) w.push(["NO FUEL",FH.red]); else if(st.crit) w.push(["FUEL CRITICAL",FH.red]); else if(st.low) w.push(["LOW FUEL",FH.amb]); }
function feFuelFob(s){ const st=feFuelState(); return {txt:fefKg(Math.round(st.kg/10)*10),col:feFuelCol(st),st}; }
/* the SD FUEL page: wing and centre tanks as level bars, total on board, flow, used, endurance; h is the box height in 100-wide units */
function feFuelSd(g,h,s,boe){
  const F=fphFuelCfg(s.key), st=feFuelState(), nb=F.cen>0?3:2, ids=nb===3?[0,1,2]:[0,2], lab=["L","C","R"], cap=[F.max*(1-F.cen)/2,F.max*F.cen,F.max*(1-F.cen)/2], col=feFuelCol(st), cy=FDC.cy, lc=boe?"#aeb8c1":cy;
  const bh=Math.max(6,Math.min(24,h-24)), by=11, bw=nb===3?19:25, x0=nb===3?30:34, step=nb===3?24:30;
  for(let j=0;j<nb;j++){ const i=ids[j], x=x0+j*step, lv=cap[i]>0?Math.max(0,Math.min(1,s.tank[i]/cap[i])):0; g.strokeStyle="#7d8791"; g.lineWidth=0.5; g.strokeRect(x-bw/2,by,bw,bh); g.fillStyle=lv<0.08?FDC.amb:FDC.grn; g.fillRect(x-bw/2+0.4,by+bh-(bh-0.8)*lv-0.4,bw-0.8,(bh-0.8)*lv);
    fdTx(g,lab[i],x,by-2.6,3.8,lc); fdTx(g,(s.tank[i]/1000).toFixed(1),x,by+bh/2,Math.min(5.4,bw*0.28),"#fff"); }
  const yb=by+bh+6.2; fdTx(g,"FOB",4,yb,3.9,lc,"left"); fdTx(g,fefKg(Math.round(st.kg/10)*10)+" KG",18,yb,5,col,"left");
  if(h>=40){ const y2=yb+5.6; fdTx(g,"F.USED",4,y2,3.9,lc,"left"); fdTx(g,fefKg(Math.round(s.fuelUsed/10)*10),24,y2,4.6,"#fff","left"); fdTx(g,"ENDUR",56,y2,3.9,lc,"left"); fdTx(g,fefHm(st.endurMin),77,y2,4.8,col,"left"); }
  fdTx(g,"TONNES",96,by+bh+0.5,3.2,"#7d8791","right");
}
/* a compact line under the HUD engine strip (chase / wing / spotter / orbit views) */
function feFuelHud(g,x,y,sz,s){
  const st=feFuelState(); if(!st) return; const c=st.empty||st.crit?FH.red:st.low?FH.amb:FH.grn, w=sz*10.6, h=sz*1.9;
  g.save(); fhRound(g,x-sz*0.4,y-sz*0.2,w,h,6); g.fillStyle=FH.panel; g.fill(); fhText(g,"FUEL",x,y+sz*0.7,sz*0.62,"#9fb0c0","left"); fhText(g,fefKg(Math.round(st.kg/10)*10)+" kg",x+sz*2.6,y+sz*0.7,sz*0.7,c,"left"); fhText(g,"⏱ "+fefHm(st.endurMin),x+sz*9.9,y+sz*0.7,sz*0.7,c,"right"); g.restore();
}
/* ---------- setup form: fuel chips + slider ---------- */
function feFuelHTML(o){
  const ch=(k,a,e)=>`<button type="button" class="chip" data-fo="fuel" data-fv="${k}" aria-pressed="${String(o.fuel===undefined?"auto":o.fuel)===k}">${fkLang()==="en"?e:a}</button>`, pct=typeof o.fuel==="number"?o.fuel:50;
  return `<div class="fsec"><h4>الوقود</h4><div class="chips">${FEF_CH.map(c=>ch(c[0],c[1],c[2])).join("")}</div>
    <label class="status" style="display:flex;gap:10px;align-items:center;margin-top:6px"><span>${fkLang()==="en"?"Amount":"الكمية"}</span><input type="range" id="feFuelR" min="5" max="100" step="5" value="${pct}" style="flex:1" aria-label="${fkLang()==="en"?"Fuel load, percent of the tanks":"كمية الوقود بالنسبة المئوية للخزانات"}"><b id="feFuelV" style="min-width:4.5em;text-align:end"></b></label>
    <span class="status" id="feFuelI"></span></div>`;
}
function feFuelInfo(el){
  const o=FLY.opts, F=fphFuelCfg(o.ac), pl=fphFuelPlan(o.ac,o.scn,o.fuel===undefined?"auto":o.fuel), i=el.querySelector("#feFuelI"), v=el.querySelector("#feFuelV"), r=el.querySelector("#feFuelR");
  if(i) i.textContent=(fkLang()==="en"?"Fuel on board for the flight: ":"الوقود المحمّل: ")+fefKg(pl.kg)+" kg ("+Math.round(100*pl.kg/F.max)+"%) ≈ "+fefHm(pl.kg/F.flow*60)+(fkLang()==="en"?" h at cruise burn":" س بمعدل الاستهلاك في الرحلة");
  if(v) v.textContent=Math.round(100*pl.kg/F.max)+"%"; if(r&&typeof o.fuel!=="number") r.value=Math.round(100*pl.kg/F.max/5)*5;
}
function feFuelMount(el){
  const r=el.querySelector("#feFuelR"); if(!r) return;
  r.addEventListener("input",()=>{ FLY.opts.fuel=+r.value; flySaveOpts(); el.querySelectorAll('[data-fo="fuel"]').forEach(x=>x.setAttribute("aria-pressed","false")); feFuelInfo(el); });
  el.addEventListener("click",()=>setTimeout(()=>feFuelInfo(el),0)); feFuelInfo(el);
}
/* ---------- the gate refuelling step: phase "fuel" between the checklist and "ready" ---------- */
function feFuelNeed(F){ return F.s.fuelTarget-F.s.fuel>150; }
function feFuelBegin(F){
  if(F.fuelDone||!feFuelNeed(F)){ F.fuelDone=true; return false; }
  const s=F.s; F.ph="fuel"; F.t=0; F.fk=1; F.fuel0=s.fuel; F.fuelRate=Math.max(250,(s.fuelTarget-s.fuel)/45); try{ fkSay(FEF_T.start,{key:"fef_start",keyMs:500}); }catch(e){} return true;
}
function feFuelStep(F,dt){
  const s=F.s, need=s.fuelTarget-s.fuel; if(need>1){ fphFuelAdd(s,Math.min(need,F.fuelRate*dt*F.fk)); }
  if(Math.floor(F.t*2)!==F.fkR){ F.fkR=Math.floor(F.t*2); fkGateRender(F); }
  if(s.fuelTarget-s.fuel<=1){ F.fuelDone=true; F.ph="board"; try{ fkSay(FEF_T.done,{key:"fef_done",keyMs:500}); }catch(e){} fkGateReady(F); fkGateRender(F); }
}
function feFuelPanel(F){
  const s=F.s, tg=s.fuelTarget, pct=Math.max(0,Math.min(100,100*(s.fuel-F.fuel0)/Math.max(1,tg-F.fuel0))), B=k=>`<button type="button" class="sec" data-fk="${k}">${fefTx(FEF_B[k])}</button>`;
  return `<div class="fkgs">${fefTx(FEF_T.start)} <bdi dir="ltr">${fefKg(s.fuel)} / ${fefKg(tg)} kg</bdi></div><div style="height:6px;border-radius:3px;background:rgba(255,255,255,.18);margin:5px 4px;overflow:hidden"><div style="height:100%;width:${pct.toFixed(0)}%;background:#7df0a6"></div></div><div class="fkgb">${F.fk>1?"":B("fuel4")}${B("fuelx")}${B("fuels")}</div>`;
}
function feFuelAct(F,a){
  const s=F.s;
  if(a==="fuels"&&F.ph==="fuel"){ fphFuelAdd(s,s.fuelTarget-s.fuel); F.fuelDone=true; F.ph="board"; fkGateReady(F); return true; }
  if(a==="fuel4"&&F.ph==="fuel"){ F.fk=4; return true; }
  if(a==="fuelx"&&(F.ph==="fuel"||F.ph==="ready")){ const FC=fphFuelCfg(s.key), add=Math.max(1000,Math.round(FC.max*0.1/500)*500); s.fuelTarget=Math.min(FC.max,Math.max(s.fuelTarget,s.fuel)+add); F.fuelDone=false;
    if(F.ph==="ready"){ F.ph="fuel"; F.t=0; F.fk=1; F.fuel0=s.fuel; } else F.fuel0=Math.min(F.fuel0,s.fuel); F.fuelRate=Math.max(250,(s.fuelTarget-s.fuel)/45); try{ fkSay(FEF_T.more,{key:"fef_more",keyMs:500}); }catch(e){} return true; }
  return false;
}
/* the gate's fuel truck (same place and look as at the airport stand: in front of the right wing) with its hose to the wing underside; merged into the static ground-crew group, hidden with it at pushback */
function feFuelTruck(K,body,put,c,key,cg){
  if(typeof K.tanker!=="function") return; const P={a380:[21.0,-4.0,2.7,9.0,2.6],b747:[18.7,-6.2,2.7,9.0,2.6],b737:[13.4,-5.5,2.5,8.0,2.3]}[key]||[18,-5,2.7,9,2.6], fx=P[0], zc=c.L/2-cg, fz=P[1]+zc;   /* airport coordinates (z from the fuselage centre) -> centre-of-gravity frame */
  put(K.tanker(P[2],P[3],P[4],"#eceeee","#c8322a"),fx,fz,0);
  try{ const Wg=wingLS(c), u=Math.min(1,Math.max(0,(fx-0.2-Wg.Y0)/(c.tipY-Wg.Y0))), q=Wg.pt(u,0.3,-1,0); K.hose(body,[[fx-1.1,1.6,fz+3.7],[fx-1.2,1.0,fz+4.8],[fx-0.7,1.6,fz+6.8],[q.x,q.y-0.02,q.z+zc]],0.05,K.m.hosey); }catch(e){}
}
const feFuelBtn=()=>`<button type="button" class="sec" data-fk="fuelx">${fefTx(FEF_B.fuelx)}</button>`;
