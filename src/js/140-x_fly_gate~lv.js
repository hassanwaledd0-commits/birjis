/* ---------- lv: the learner's level, ONE number like in a game. XP from lessons and from flights adds up to one level (the store keeps the
   f / l split only as a record). Stored in this browser only (localStorage `birjis-xp`, try/catch), never sent anywhere.
   The level badge sits on the logo in the header of every page, with a thin XP bar under the wordmark; a tap opens the missions page (lvOpen). ---------- */
const LV_PK="birjis-xp";
let LV_D=null;
function lvLoad(){ if(LV_D) return LV_D; try{ LV_D=JSON.parse(localStorage.getItem(LV_PK)||"null"); }catch(e){ LV_D=null; } if(!LV_D||typeof LV_D!=="object") LV_D={f:0,l:0,aw:{}}; if(!LV_D.aw) LV_D.aw={}; return LV_D; }
function lvSave(){ try{ localStorage.setItem(LV_PK,JSON.stringify(LV_D)); }catch(e){} }
const LV_NAMES=[{ar:"متدرّب",en:"Trainee"},{ar:"طالب طيران",en:"Aviation student"},{ar:"مساعد مهندس",en:"Assistant engineer"},{ar:"مساعد طيّار",en:"First officer"},{ar:"طيّار",en:"Pilot"},
  {ar:"مهندس طيران",en:"Aircraft engineer"},{ar:"كابتن",en:"Captain"},{ar:"كابتن خبير",en:"Senior captain"},{ar:"أسطورة الجو",en:"Sky legend"}];
/* level n starts at 15*(n-1)*(n+2) XP: 2 at 60, 3 at 150, 4 at 270, 5 at 420 ... (three lessons make the first level) */
const lvNeed=n=>15*(n-1)*(n+2);
const lvLevel=xp=>{ let n=1; while(lvNeed(n+1)<=xp) n++; return n; };
const lvXP=()=>{ const d=lvLoad(); return (d.f||0)+(d.l||0)+(d.m||0); };
const lvLang=()=>(typeof myLang==="function"&&myLang())||"ar";
const lvT=o=>lvLang()==="en"?o.en:o.ar;
function lvInfo(){ const xp=lvXP(), l=lvLevel(xp), a=lvNeed(l), b=lvNeed(l+1); return {xp,level:l,name:LV_NAMES[Math.min(l,LV_NAMES.length)-1],pct:Math.max(0,Math.min(1,(xp-a)/(b-a))),next:b-xp,a,b}; }
/* award once per key (track: "l" lessons, "f" flying, "m" missions); fires lv-xp (gain, level, up) for the toast. quiet: no toast (backfill) */
let LV_IN=false;
function lvAward(track,key,xp,quiet){
  const d=lvLoad(); if(d.aw[key]) return 0; d.aw[key]=1;
  const before=lvLevel(lvXP()); d[track]=(d[track]||0)+xp; lvSave(); const after=lvLevel(lvXP());
  if(!quiet) try{ document.dispatchEvent(new CustomEvent("lv-xp",{detail:{gain:xp,track,level:after,up:after>before}})); }catch(e){}
  if(!LV_IN){ LV_IN=true; try{ lvCheck(quiet); }catch(e){} LV_IN=false; }
  lvBadge(); return xp;
}
/* record an event without XP (the missions' counters) */
function lvMark(key){ const d=lvLoad(); if(d.aw[key]) return; d.aw[key]=1; lvSave(); try{ lvCheck(); }catch(e){} lvBadge(); }
function lvCount(d,pre){ let n=0; for(const k in d.aw) if(k.indexOf(pre)===0) n++; return n; }
/* missions: each adds its XP once when its counter reaches the goal (ids of v17 kept, so nothing is paid twice) */
const LV_MS=[
  {id:"les1",ic:"b",xp:15,goal:1,pre:"lesson:",ar:"خلّص أول درس",en:"Finish your first lesson"},
  {id:"land1",ic:"p",xp:15,goal:1,pre:"land:",ar:"أول هبوط",en:"Your first landing"},
  {id:"smooth",ic:"p",xp:25,goal:1,pre:"smooth:",ar:"هبوط ناعم (أقل من 300 قدم بالدقيقة)",en:"A smooth landing (under 300 fpm)"},
  {id:"cargo1",ic:"c",xp:20,goal:1,pre:"cargo:",ar:"طير رحلة شحن جوي واهبط",en:"Fly and land a cargo flight"},
  {id:"les5",ic:"b",xp:30,goal:5,pre:"lesson:",ar:"خلّص 5 دروس",en:"Finish 5 lessons"},
  {id:"land3",ic:"p",xp:30,goal:3,pre:"land:",ar:"اهبط 3 مرات",en:"Land 3 times"},
  {id:"trip1",ic:"t",xp:40,goal:1,pre:"trip:",ar:"أول رحلة من مطار لمطار",en:"Your first trip between airports"},
  {id:"allac",ic:"p",xp:50,goal:3,pre:"landac:",ar:"اهبط بالطيارات الثلاث",en:"Land all three aircraft"},
  {id:"les15",ic:"b",xp:60,goal:15,pre:"lesson:",ar:"خلّص 15 درس",en:"Finish 15 lessons"},
  {id:"trip3",ic:"t",xp:60,goal:3,pre:"trip:",ar:"3 رحلات بين المطارات",en:"3 trips between airports"},
  {id:"les40",ic:"b",xp:120,goal:40,pre:"lesson:",ar:"خلّص 40 درس",en:"Finish 40 lessons"}
];
function lvCheck(quiet){ const d=lvLoad(); LV_MS.forEach(m=>{ if(!d.aw["m:"+m.id]&&lvCount(d,m.pre)>=m.goal) lvAward("m","m:"+m.id,m.xp,quiet); }); }
function lvMissions(){ const d=lvLoad(); return LV_MS.map(m=>({m,p:Math.min(m.goal,lvCount(d,m.pre)),done:!!d.aw["m:"+m.id]})); }
/* lessons finished before the levels existed count too (once, quietly) */
function lvBackfill(){ try{ if(typeof LDONE!=="undefined"&&LDONE&&LDONE.forEach) LDONE.forEach(k=>lvAward("l","lesson:"+k,20,true)); }catch(e){} }
let LV_CSS=false;
function lvCssOnce(){ if(LV_CSS) return; LV_CSS=true; const st=document.createElement("style");
  st.textContent=`
.top .brand .mark.lvMk{position:relative;padding:0;border:0;background:none;cursor:pointer;font:inherit;color:inherit;overflow:visible}
.top .brand .mark.lvMk:focus-visible{outline:3px solid var(--accent);outline-offset:3px}
.lvLv{position:absolute;bottom:-5px;inset-inline-end:-6px;width:23px;height:23px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--gold) calc(var(--p,0)*1%),rgb(255 255 255 / .38) 0);box-shadow:0 2px 6px rgb(4 12 28 / .45)}
.lvLv span{width:18px;height:18px;border-radius:50%;background:#0B2147;color:#FFE2A6;font:700 11px/18px var(--font-mono,monospace);text-align:center}
.lvWb{display:block;height:4px;width:100%;max-width:96px;margin-top:4px;border-radius:9px;background:var(--line);overflow:hidden}
.lvWb>i{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,var(--gold),var(--gold2));transition:width .6s var(--ease,ease)}
.lvToast{position:fixed;left:50%;bottom:calc(88px + env(safe-area-inset-bottom));transform:translate(-50%,16px);opacity:0;z-index:99970;display:flex;align-items:center;gap:8px;max-width:calc(100% - 32px);padding:10px 16px;border-radius:999px;background:var(--panel);border:1px solid var(--line);box-shadow:var(--sh2);color:var(--ink);font-size:14.5px;font-weight:600;transition:opacity .3s,transform .3s;cursor:pointer}
.lvToast.on{opacity:1;transform:translate(-50%,0)}.lvToast b{color:var(--signal)}
.lvToast.up{background:linear-gradient(135deg,var(--gold),var(--gold2));color:var(--gold-ink);border-color:transparent}.lvToast.up b{color:inherit}
.lvSh{position:fixed;inset:0;z-index:99960;overflow:auto;overscroll-behavior:contain;background:var(--bg);color:var(--ink);padding:max(12px,env(safe-area-inset-top)) 16px max(24px,env(safe-area-inset-bottom))}
.lvSh[hidden]{display:none}
.lvIn{max-width:560px;margin:0 auto;display:grid;gap:16px}
.lvTb{display:flex;align-items:center;gap:10px}.lvTb h2{margin:0;font-size:19px;flex:1}
.lvX{min-width:44px;min-height:44px;border-radius:999px;border:1px solid var(--line);background:var(--panel);color:var(--ink);font:600 14px/1 var(--font-ar);padding:0 14px;cursor:pointer}
.lvHero{display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:center;padding:18px;border-radius:22px;color:#fff;background:radial-gradient(120% 120% at 0% 0%,#1B4E8F,#081630 70%);box-shadow:var(--sh2)}
.lvRing{width:104px;height:104px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--gold) calc(var(--p,0)*1%),rgb(255 255 255 / .16) 0)}
.lvRing div{width:86px;height:86px;border-radius:50%;background:#0B1E40;display:grid;place-content:center;text-align:center;line-height:1.1}
.lvRing small{font-size:11.5px;color:#BFD3F2}.lvRing b{font:700 36px/1 var(--font-mono,monospace);color:#FFE2A6}
.lvHero h3{margin:0 0 4px;font-size:20px}.lvHero p{margin:0;color:#C9D8F0;font-size:14px}
.lvBig{height:10px;border-radius:9px;background:rgb(255 255 255 / .16);overflow:hidden;margin:10px 0 6px}.lvBig i{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,var(--gold),var(--gold2))}
.lvHow{display:flex;flex-wrap:wrap;gap:8px}.lvHow span{padding:7px 12px;border-radius:999px;background:var(--panel);border:1px solid var(--line);font-size:13.5px}.lvHow b{color:var(--signal)}
.lvH4{margin:4px 0 0;font-size:16px}
.lvList{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.lvM{display:grid;grid-template-columns:40px 1fr auto;gap:12px;align-items:center;padding:12px 14px;border-radius:16px;background:var(--panel);border:1px solid var(--line)}
.lvM .ic{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--panel2);font-size:20px}
.lvM .tx{display:grid;gap:6px;min-width:0}.lvM .tx b{font-size:15px;font-weight:600}
.lvM .pb{height:6px;border-radius:9px;background:var(--line);overflow:hidden}.lvM .pb i{display:block;height:100%;background:var(--accent);border-radius:9px}
.lvM .rw{font:700 13px/1.2 var(--font-mono,monospace);color:var(--signal);text-align:center}.lvM .rw small{display:block;font:500 12px/1.3 var(--font-ar);color:var(--muted)}
.lvM.done{opacity:.72}.lvM.done .ic{background:#1F8A4C;color:#fff}.lvM.done .pb i{background:#1F8A4C}
@media (prefers-reduced-motion:reduce){.lvToast,.lvWb>i{transition:none}}`;
  document.head.appendChild(st); }
/* header: the logo becomes the level button (badge with the number, ring = progress to the next level) and a thin bar under the wordmark */
function lvBadge(){
  try{ lvCssOnce(); const br=document.querySelector(".top .brand"); if(!br) return; let mk=br.querySelector(".mark"); if(!mk) return;
    if(!mk.classList.contains("lvMk")){ const b=document.createElement("button"); b.type="button"; b.className=mk.className+" lvMk"; while(mk.firstChild) b.appendChild(mk.firstChild); mk.replaceWith(b); mk=b; b.addEventListener("click",()=>lvOpen()); }
    const i=lvInfo(), en=lvLang()==="en", pc=Math.round(i.pct*100);
    let bd=mk.querySelector(".lvLv"); if(!bd){ bd=document.createElement("b"); bd.className="lvLv"; bd.setAttribute("aria-hidden","true"); bd.innerHTML="<span></span>"; mk.appendChild(bd); }
    bd.style.setProperty("--p",pc); bd.firstChild.textContent=i.level;
    mk.setAttribute("aria-label",en?`Level ${i.level}, ${i.name.en}: missions`:`المستوى ${i.level}، ${i.name.ar}: المهام`); mk.title=mk.getAttribute("aria-label");
    const wm=br.querySelector(".bwWm"); if(wm){ let bar=br.querySelector(".lvWb"); if(!bar){ bar=document.createElement("i"); bar.className="lvWb"; bar.setAttribute("aria-hidden","true"); bar.innerHTML="<i></i>"; wm.after(bar); } bar.firstChild.style.width=pc+"%"; }
    const sh=document.getElementById("lvSh"); if(sh&&!sh.hidden) lvRender();
  }catch(e){}
}
const LV_IC={b:"📘",p:"🛬",c:"📦",t:"🧭"};
const lvX=t=>`<bdi dir="ltr">${t}</bdi>`;   /* "+20 XP" keeps its order inside Arabic text */
function lvRender(){
  const sh=document.getElementById("lvSh"); if(!sh) return; const i=lvInfo(), en=lvLang()==="en", pc=Math.round(i.pct*100);
  sh.lang=en?"en":"ar"; sh.dir=en?"ltr":"rtl";
  const ms=lvMissions().sort((a,b)=>(a.done-b.done)||(LV_MS.indexOf(a.m)-LV_MS.indexOf(b.m)));
  sh.innerHTML=`<div class="lvIn"><div class="lvTb"><h2 id="lvShT">${en?"Level and missions":"المستوى والمهام"}</h2><button type="button" class="lvX" data-lvx>${en?"Back":"رجوع"}</button></div>
<section class="lvHero"><div class="lvRing" style="--p:${pc}"><div><small>${en?"Level":"المستوى"}</small><b>${i.level}</b></div></div>
<div><h3>${lvT(i.name)}</h3><p>${lvX(i.xp+" XP")}</p><div class="lvBig" role="progressbar" aria-label="${en?"Progress to the next level":"التقدّم للمستوى الجاي"}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pc}"><i style="width:${pc}%"></i></div>
<p>${en?`${i.next} XP to level ${i.level+1}`:`باقي ${lvX(i.next+" XP")} للمستوى ${i.level+1}`}</p></div></section>
<div class="lvHow" aria-label="${en?"How to earn XP":"شلون تجمع XP"}"><span>${en?"Lesson":"درس"} <b>${lvX("+20")}</b></span><span>${en?"Landing":"هبوط"} <b>${lvX("+10…20")}</b></span><span>${en?"Trip between airports":"رحلة بين مطارين"} <b>${lvX("+40")}</b></span><span>${en?"Mission":"مهمة"} <b>${lvX("+XP")}</b></span></div>
<h4 class="lvH4">${en?"Missions":"المهام"}</h4>
<ul class="lvList">${ms.map(x=>`<li class="lvM${x.done?" done":""}"><span class="ic" aria-hidden="true">${x.done?"✓":LV_IC[x.m.ic]||"⭐"}</span><span class="tx"><b>${lvT(x.m)}</b><span class="pb" role="progressbar" aria-valuemin="0" aria-valuemax="${x.m.goal}" aria-valuenow="${x.p}"><i style="width:${Math.round(x.p/x.m.goal*100)}%"></i></span></span><span class="rw">${lvX("+"+x.m.xp+" XP")}<small>${x.done?(en?"Done":"خلصت"):lvX(x.p+"/"+x.m.goal)}</small></span></li>`).join("")}</ul></div>`;
}
let LV_PREV=null;
function lvOpen(){
  lvCssOnce(); let sh=document.getElementById("lvSh");
  if(!sh){ sh=document.createElement("div"); sh.id="lvSh"; sh.className="lvSh"; sh.setAttribute("role","dialog"); sh.setAttribute("aria-modal","true"); sh.setAttribute("aria-labelledby","lvShT"); sh.setAttribute("data-il-skip",""); sh.hidden=true; document.body.appendChild(sh);
    sh.addEventListener("click",e=>{ if(e.target.closest("[data-lvx]")) lvClose(); }); }
  LV_PREV=document.activeElement; lvRender(); sh.hidden=false; document.body.style.overflow="hidden";
  setTimeout(()=>{ try{ const b=sh.querySelector("[data-lvx]"); b&&b.focus({preventScroll:true}); }catch(e){} },30);
}
function lvClose(){ const sh=document.getElementById("lvSh"); if(!sh||sh.hidden) return; sh.hidden=true; document.body.style.overflow=""; try{ LV_PREV&&LV_PREV.focus&&LV_PREV.focus({preventScroll:true}); }catch(e){} }
document.addEventListener("keydown",e=>{ if(e.key==="Escape"){ const sh=document.getElementById("lvSh"); if(sh&&!sh.hidden){ e.preventDefault(); lvClose(); } } });
/* the Home card of v17 is gone: the level lives in the header now */
function lvCardHTML(){ return ""; }
/* a short toast when XP is earned (bottom centre, above the nav bar); a tap opens the missions */
let LV_TT=null;
document.addEventListener("lv-xp",e=>{ try{ lvCssOnce(); const d=e.detail, en=lvLang()==="en", i=lvInfo();
  let el=document.getElementById("lvToast"); if(!el){ el=document.createElement("div"); el.id="lvToast"; el.className="lvToast"; el.setAttribute("role","status"); el.setAttribute("aria-live","polite"); el.setAttribute("data-il-skip",""); document.body.appendChild(el); el.addEventListener("click",()=>{ el.classList.remove("on"); lvOpen(); }); }
  el.classList.toggle("up",!!d.up);
  el.innerHTML=d.up?(en?`Level up! <b>Level ${i.level}</b> · ${i.name.en}`:`ترقّيت! <b>المستوى ${i.level}</b> · ${i.name.ar}`):`<b>${lvX("+"+d.gain+" XP")}</b> · ${en?"Level":"المستوى"} ${i.level}`;
  el.classList.add("on"); clearTimeout(LV_TT); LV_TT=setTimeout(()=>el.classList.remove("on"),d.up?4200:2600);
 }catch(x){} });
document.addEventListener("il-lang",()=>lvBadge());
{ const go=()=>setTimeout(()=>{ lvBackfill(); try{ lvCheck(true); }catch(e){} lvBadge(); },0); if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",go); else go(); }
