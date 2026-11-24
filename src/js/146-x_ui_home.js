/* ---------- home screen (prefix ui): welcome + today's progress, continue where you left, quick actions, part and lesson of the day, stat tiles ---------- */
const UIH={bob:null,cnt:0};
const uiLS=k=>{ try{ return localStorage.getItem(k); }catch(e){ return null; } };
const uiDayN=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*60000)/86400000);
const uiHash=(n,salt)=>n?((Math.imul(uiDayN()+17,2654435761)^Math.imul(salt+3,40503))>>>0)%n:0;
const uiIcon={
  book:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v15H5.5C4.7 19 4 19.7 4 20.5z" transform="translate(0 -.5)"/><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H13v15h5.5c.8 0 1.5.7 1.5 1.5z" transform="translate(0 -.5)"/></svg>',
  part:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 7.5v9L12 21l8-4.5v-9z"/><path d="M12 12 4.5 7.8M12 12l7.5-4.2M12 12v9"/></svg>',
  fly:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c.9 0 1.5.8 1.5 2v5.2l7.5 4.3v2.2l-7.5-2.3v4.6l2 1.5V22L12 21l-3.5 1v-1.5l2-1.5v-4.6L3 16.7v-2.2l7.5-4.3V5c0-1.2.6-2 1.5-2z"/></svg>',
  cockpit:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="m12 13 4-4"/><path d="M7 13h1.2M12 8v1.2M17 13h-1.2"/></svg>',
  cam:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3.2l1.6-2.5h6.4L16.8 8H20v11H4z"/><circle cx="12" cy="13.2" r="3.6"/></svg>',
  chat:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9.5L4 20.5z"/><path d="M9 10h.01M15 10h.01M9.5 13c1.4 1.1 3.6 1.1 5 0"/></svg>',
  go:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg>',
  search:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  flame:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c1 3.5 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/></svg>'
};
function uiHomeStop(){ try{ if(UIH.bob&&UIH.bob.destroy) UIH.bob.destroy(); }catch(e){} UIH.bob=null; cancelAnimationFrame(UIH.cnt); }
function uiRing(p,txt,label,col){
  const r=28, c=2*Math.PI*r;
  return `<div class="uiRg"><svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="${r}" class="uiRgT"/><circle cx="36" cy="36" r="${r}" class="uiRgV" style="stroke:${col};stroke-dasharray:${(c*Math.min(1,Math.max(0,p))).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 36 36)"/></svg><b>${txt}</b><small>${label}</small></div>`;
}
function uiLastLesson(){
  let l=null; try{ l=JSON.parse(localStorage.getItem("atlas-lrn")||"null"); }catch(e){}
  if(l&&LESSONS[l.b]&&LESSONS[l.b][l.i]&&!LDONE.has(l.b+":"+l.i)) return {b:l.b,i:l.i,cont:true};
  const n=nextLessons(1)[0]; if(n) return {b:n[0],i:n[1],cont:!!l};
  return l&&LESSONS[l.b]&&LESSONS[l.b][l.i]?{b:l.b,i:l.i,cont:true}:null;
}
function uiLessonOfDay(){
  const bs=Object.keys(LESSONS).filter(b=>LESSONS[b].length), tot=bs.reduce((a,b)=>a+LESSONS[b].length,0); if(!tot) return null;
  let k=uiHash(tot,7); for(const b of bs){ if(k<LESSONS[b].length) return {b,i:k}; k-=LESSONS[b].length; } return null;
}
function uiPartOfDay(){
  const ks=Object.keys(PARTS).filter(id=>!PARTS[id].only).sort(); return ks.length?ks[uiHash(ks.length,11)]:null;
}
function uiHomeHTML(){
  const st=streak(), td=STUDY.days[today()]||{l:0,r:0}, goal=Math.max(1,STUDY.goal||2), tot=totalLessons(), dn=totalDone(), due=srsDue().length, hr=new Date().getHours();
  const greet=hr<5?"مساء النور":hr<12?"صباح الخير":hr<17?"أهلاً بك":"مساء الخير", ds=(typeof dlStats==="function")?dlStats():{lessons:tot,books:Object.keys(LBOOK).length};
  const last=uiLastLesson(), L=last&&LESSONS[last.b][last.i], pid=uiLS("atlas-lastpart");
  const lp=pid&&PARTS[pid]&&partVisible(pid)?pid:null, pod=uiPartOfDay(), lod=uiLessonOfDay(), LL=lod&&LESSONS[lod.b][lod.i];
  const stT=st?arCount(st,"يوم واحد","يومان","أيام","يوماً"):"ابدأ اليوم";
  const thumb=id=>{ const tid=thumbOf(id), s=partThumb(S.ac,tid,bestView(S.ac,tid)); return s?`<img src="${s}" alt="" loading="lazy" decoding="async">`:uiIcon.part; };
  const cont=[];
  if(last&&L) cont.push(`<button type="button" class="uiRowC" data-uih="lesson:${last.b}:${last.i}"><span class="uiRi">${uiIcon.book}</span><span class="uiRt2"><small>${last.cont?"تابع الدرس":"ابدأ درسك"}</small><b>${esc(L.ar)}</b><em>${esc(LBOOK[last.b].ar)} · الدرس ${last.i+1}</em></span><span class="uiGoI">${uiIcon.go}</span></button>`);
  if(lp) cont.push(`<button type="button" class="uiRowC" data-uih="part:${lp}"><span class="uiRi uiRiImg">${thumb(lp)}</span><span class="uiRt2"><small>آخر قطعة فتحتها</small><b>${esc(PARTS[lp].ar)}</b><em>${esc(PARTS[lp].en||"")}</em></span><span class="uiGoI">${uiIcon.go}</span></button>`);
  cont.push(`<button type="button" class="uiRowC" data-uih="go:fly"><span class="uiRi">${uiIcon.fly}</span><span class="uiRt2"><small>تدرّب</small><b>جرّب الطيران بمنظور الطيار</b><em>إقلاع وهبوط واقتراب بسيناريوهات جاهزة</em></span><span class="uiGoI">${uiIcon.go}</span></button>`);
  return `${typeof uiStageHTML==="function"?uiStageHTML():""}<div class="uiHome">
  <section class="uiHero" aria-label="الترحيب">
    <div class="uiHeroTxt">
      <span class="uiKick">${typeof bwLogo==="function"?`<i class="bwKm">${bwLogo()}</i>`:""}بيرجس · Birjis</span>
      <h2>${typeof myHeroTitle==="function"&&myHeroTitle(greet)||`${greet}، هل أنت مستعد للتحليق؟`}</h2>
      <p>${td.l?`أنجزت اليوم ${arCount(td.l,"درساً واحداً","درسين","دروس","درساً")}. أحسنت، واصل.`:"اختر درساً قصيراً أو اكتشف قطعة من الطائرة، وابدأ بخطوة صغيرة."}</p>
      <div class="uiHeroBtns"><button type="button" class="btn uiGhost" data-uih="search">${uiIcon.search}<span>ابحث عن قطعة أو درس…</span></button></div>
    </div>
    <div class="uiHeroBob" id="uiHeroBob" aria-hidden="true"></div>
    <div class="uiRings" role="group" aria-label="تقدّمك">
      ${uiRing(td.l/goal,`${td.l}/${goal}`,"هدف اليوم","var(--accent)")}
      ${uiRing(Math.min(1,st/7),`${st}`,st?"يوم متتالٍ":"السلسلة","var(--signal)")}
      ${uiRing(tot?dn/tot:0,`${tot?Math.round(dn/tot*100):0}%`,"الدروس","var(--ink)")}
      ${due?`<button type="button" class="uiRg uiDue" data-uih="go:review"><b>${due}</b><small>مراجعة مستحقة</small></button>`:""}
    </div>
  </section>
  <p class="uiEduNote" role="note"><b>للاستخدام التعليمي فقط، وليس للتشغيل أو الصيانة.</b></p>
  <section class="uiSec"><h3 class="uiH3">تابع</h3><div class="uiConts">${cont.join("")}</div></section>
  <section class="uiSec"><h3 class="uiH3">ابدأ من هنا</h3><div class="uiQuick">
    <button type="button" class="uiQ" data-uih="go:parts"><span class="uiQi">${uiIcon.part}</span><b>المجسّم ثلاثي الأبعاد</b><small>قطع وتفكيك ومواد</small></button>
    <button type="button" class="uiQ" data-uih="go:learn"><span class="uiQi">${uiIcon.book}</span><b>الدروس</b><small>من الأساس للمتقدم</small></button>
    <button type="button" class="uiQ" data-uih="go:fly"><span class="uiQi">${uiIcon.fly}</span><b>طيران</b><small>منظور الطيار</small></button>
    <button type="button" class="uiQ" data-uih="go:ckpt"><span class="uiQi">${uiIcon.cockpit}</span><b>قمرة القيادة</b><small>كل زر بمكانه</small></button>
    <button type="button" class="uiQ" data-uih="go:cam"><span class="uiQi">${uiIcon.cam}</span><b>كاميرا</b><small>صوّر قطعة واسأل</small></button>
    <button type="button" class="uiQ" data-uih="go:ask"><span class="uiQi">${uiIcon.chat}</span><b>اسأل ميسلون</b><small>المهندس المساعد</small></button>
  </div></section>
  ${typeof lvCardHTML==="function"?lvCardHTML():""}
  ${typeof myHomeHTML==="function"?myHomeHTML():""}
  <section class="uiSec"><h3 class="uiH3">اختيار اليوم</h3><div class="uiDaily">
    ${pod?`<article class="uiDay"><span class="uiDk">قطعة اليوم</span><div class="uiDi">${thumb(pod)}</div><b>${esc(PARTS[pod].ar)}</b><small dir="ltr">${esc(PARTS[pod].en||"")}</small><p>${esc(typeof ilTrunc==="function"?ilTrunc(PARTS[pod].sum||"",120):(PARTS[pod].sum||"").slice(0,120)+((PARTS[pod].sum||"").length>120?"…":""))}</p><button type="button" class="btn" data-uih="part:${pod}">اعرضها على الطائرة</button></article>`:""}
    ${lod&&LL?`<article class="uiDay"><span class="uiDk">درس اليوم</span><div class="uiDi uiDl">${uiIcon.book}</div><b>${esc(LL.ar)}</b><small>${esc(LBOOK[lod.b].ar)}${LL.min?` · ${LL.min} دقيقة`:""}${LL.lv?` · ${UI_LVN[LL.lv]||""}`:""}</small><p>${LDONE.has(lod.b+":"+lod.i)?"أكملت هذا الدرس من قبل، ويمكنك مراجعته بسرعة.":"درس قصير مناسب لبداية اليوم."}</p><button type="button" class="btn" data-uih="lesson:${lod.b}:${lod.i}">ابدأ الدرس</button></article>`:""}
  </div></section>
  <section class="uiStats" aria-label="أرقام"><div><b data-uicnt="${Object.keys(PARTS).length}">0</b><span>قطعة</span></div><div><b data-uicnt="${ds.lessons}">0</b><span>درس</span></div><div><b data-uicnt="${ds.books}">0</b><span>كتاباً</span></div></section>
  ${typeof bwReplayHTML==="function"?bwReplayHTML():""}
  ${typeof abHTML==="function"?abHTML():""}
  </div>`;
}
function uiOpenLesson(b,i){ try{ localStorage.setItem("atlas-lrn",JSON.stringify({b,i:+i})); }catch(e){} setTab("learn"); }
function uiHomeMount(root){
  const box=root.querySelector("#uiHeroBob");
  if(box){ let ok=false; if(typeof bobMount==="function"){ try{ UIH.bob=bobMount(box,{size:112,view:"full"}); ok=!!UIH.bob; }catch(e){ UIH.bob=null; } }
    if(!ok) box.innerHTML=`<svg viewBox="0 0 48 48" class="uiFallback"><circle cx="24" cy="25" r="11" fill="#F4B13E"/><path d="M4 31C14 41 34 35 44 20 36 31 16 35 4 31Z" fill="#fff"/></svg>`; }
  root.addEventListener("click",e=>{
    const b=e.target.closest("[data-uih]"); if(!b) return; const p=b.dataset.uih.split(":"), k=p[0];
    if(k==="go") setTab(p[1]);
    else if(k==="lesson") uiOpenLesson(p[1],p[2]);
    else if(k==="part"){ setTab("parts"); select(p[1]); }
    else if(k==="xray"){ setTab("parts"); if(!S.xray){ const x=document.getElementById("bXray"); if(x) x.click(); } }
    else if(k==="eng"){ setTab("parts"); select("eng_fan"); }
    else if(k==="search"){ setTab("parts"); setTimeout(()=>{ const i=document.getElementById("uiPq"); if(i) i.focus(); },60); }
  });
  /* count-up of the stat tiles */
  const els=[...root.querySelectorAll("[data-uicnt]")], t0=performance.now(), rm=reduced();
  const step=t=>{ const k=rm?1:Math.min(1,(t-t0)/700), e=1-Math.pow(1-k,3); els.forEach(el=>{ el.textContent=Math.round(+el.dataset.uicnt*e).toLocaleString("en-US"); }); if(k<1&&root.isConnected) UIH.cnt=requestAnimationFrame(step); };
  UIH.cnt=requestAnimationFrame(step);
  if(typeof uiStageBind==="function") uiStageBind(root);
}
(function(){
  const css=`
.uiHome{display:grid;grid-template-columns:minmax(0,1fr);gap:22px;min-width:0}
.uiHero{position:relative;overflow:hidden;border-radius:var(--r-xl);padding:36px 18px 18px;color:#EAF2FF;background:radial-gradient(120% 100% at 88% -10%,rgb(246 185 77 / .30),transparent 55%),linear-gradient(165deg,#1B427A 0%,#0C1D36 58%,#070F1F 100%);box-shadow:var(--sh3);display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px 10px;align-items:end;isolation:isolate;border:1px solid rgb(125 182 255 / .18)}
.uiHeroSt{position:absolute;inset:0;z-index:-1;opacity:.8;background-image:radial-gradient(1.2px 1.2px at 12% 18%,#fff,transparent),radial-gradient(1px 1px at 30% 40%,#fff,transparent),radial-gradient(1.4px 1.4px at 55% 12%,#fff,transparent),radial-gradient(1px 1px at 70% 34%,#fff,transparent),radial-gradient(1.2px 1.2px at 90% 20%,#fff,transparent),radial-gradient(1px 1px at 42% 70%,#fff,transparent),radial-gradient(1px 1px at 82% 62%,#fff,transparent)}
.uiHeroPl{position:absolute;top:8px;inset-inline-start:0;width:64px;z-index:-1;opacity:.85;animation:uiFlyBy 46s linear infinite}
.uiHeroPl svg{width:64px;height:22px;fill:#fff;display:block;transform:scaleX(-1)}
.uiHeroPl i{position:absolute;top:10px;left:100%;width:140px;height:2px;background:linear-gradient(90deg,rgb(255 255 255 / .5),transparent);display:block;border-radius:2px}
@keyframes uiFlyBy{from{transform:translateX(0)}to{transform:translateX(calc(-1 * (100vw + 140px)))}}
@media (min-width:1000px){@keyframes uiFlyBy{from{transform:translateX(0)}to{transform:translateX(-1100px)}}}
.uiHeroTxt{display:grid;gap:8px;align-content:end;min-width:0}
.uiKick{font-family:var(--font-mono);font-size:11.5px;letter-spacing:.08em;color:#F6B94D;font-weight:500}
.uiHero h2{font-size:clamp(22px,6vw,30px);line-height:1.3;font-weight:700;margin:0;color:#fff}
.uiHero p{font-size:14.5px;line-height:1.7;color:#C9D8EC;max-width:46ch}
.uiHeroBtns{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}
.uiHeroBtns .btn{min-height:46px;padding:0 18px;font-size:14.5px}
.uiGhost{background:rgb(255 255 255 / .08);border-color:rgb(255 255 255 / .22);color:#fff;gap:8px;box-shadow:none}
.uiGhost svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round}
.uiHeroBob{width:112px;height:116px;align-self:end;margin-bottom:-4px;display:grid;place-items:end center}
.uiFallback{width:96px;height:96px}
.uiRings{grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fit,minmax(78px,1fr));gap:8px;padding:12px 6px 0;border-top:1px solid rgb(255 255 255 / .12)}
.uiRg{display:grid;grid-template:"r" 64px "l" auto/1fr;justify-items:center;align-items:center;gap:2px;color:#fff;position:relative;background:none;border:0;padding:0;font-size:inherit}
.uiRg svg{grid-area:r;width:64px;height:64px}
.uiRg b{grid-area:r;font-size:14px;font-weight:700;font-family:var(--font-mono);direction:ltr}
.uiRg small{grid-area:l;font-size:12px;color:#B7C8DF;text-align:center;line-height:1.4}
.uiRgT{fill:none;stroke:rgb(255 255 255 / .14);stroke-width:7}
.uiRgV{fill:none;stroke-width:7;stroke-linecap:round;animation:uiRgIn .9s var(--ease) both}
@keyframes uiRgIn{from{stroke-dasharray:0 999}}
.uiDue{cursor:pointer;min-height:44px}
.uiDue b{grid-area:r;width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:rgb(246 185 77 / .18);border:2px solid #F6B94D;color:#FFD98A;margin:auto}
.uiSec{display:grid;grid-template-columns:minmax(0,1fr);gap:10px;min-width:0}
.uiH3{margin:0;font-size:var(--fs-lg);font-weight:700;display:flex;align-items:center;gap:10px}
.uiH3::after{content:"";height:1px;flex:1;background:linear-gradient(90deg,var(--line),transparent)}
.uiConts{display:grid;grid-template-columns:minmax(0,1fr);gap:8px}
@media (min-width:900px){.uiConts{grid-template-columns:repeat(3,minmax(0,1fr))}}
.uiRowC{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center;text-align:start;min-height:72px;padding:10px 14px;border:1px solid var(--line);border-radius:var(--r-lg);background:var(--panel);color:var(--ink);box-shadow:var(--sh1);transition:transform var(--dur1) var(--ease),box-shadow var(--dur1),border-color var(--dur1)}
.uiRowC:hover{transform:translateY(-2px);box-shadow:var(--sh2);border-color:color-mix(in srgb,var(--accent) 45%,var(--line))}
.uiRi{width:48px;height:48px;border-radius:14px;display:grid;place-items:center;background:color-mix(in srgb,var(--accent) 12%,var(--panel));overflow:hidden}
.uiRi svg{width:24px;height:24px;stroke:var(--accent);fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.uiRiImg{background:var(--thumb-bg)}.uiRiImg img{width:100%;height:100%;object-fit:contain}
.uiRt2{display:grid;gap:1px;min-width:0}
.uiRt2 small{font-size:12px;color:var(--signal);font-weight:600}
.uiRt2 b{font-size:15px;font-weight:600;line-height:1.45}
.uiRt2 em{font-style:normal;font-size:12.5px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.uiGoI svg{width:20px;height:20px;stroke:var(--muted);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.uiQuick{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
@media (min-width:760px){.uiQuick{grid-template-columns:repeat(4,minmax(0,1fr))}}
.uiQ{display:grid;gap:2px;justify-items:start;text-align:start;padding:14px;border:1px solid var(--line);border-radius:var(--r-lg);background:var(--panel);color:var(--ink);box-shadow:var(--sh1);min-height:104px;align-content:start;transition:transform var(--dur1) var(--ease),box-shadow var(--dur1)}
.uiQ:hover{transform:translateY(-2px);box-shadow:var(--sh2)}
.uiQ:nth-child(1) .uiQi{background:linear-gradient(135deg,#6FB4FF,#2B6CB0)}
.uiQ:nth-child(2) .uiQi{background:linear-gradient(135deg,#FFC969,#E8912A)}
.uiQ:nth-child(3) .uiQi{background:linear-gradient(135deg,#7BE0B5,#2F8556)}
.uiQ:nth-child(4) .uiQi{background:linear-gradient(135deg,#C4A8F2,#7A50B4)}
.uiQi{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;margin-bottom:8px;box-shadow:0 8px 16px -8px rgb(var(--shadow) / .5)}
.uiQi svg{width:24px;height:24px;stroke:#fff;fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.uiQ:nth-child(2) .uiQi svg{stroke:#2A1800}
.uiQ b{font-size:15px;font-weight:600}.uiQ small{font-size:12.5px;color:var(--muted)}
.uiDaily{display:grid;grid-template-columns:minmax(0,1fr);gap:10px}
@media (min-width:760px){.uiDaily{grid-template-columns:repeat(2,minmax(0,1fr))}}
.uiDay{display:grid;gap:6px;align-content:start;padding:14px;border:1px solid var(--line);border-radius:var(--r-xl);background:var(--panel);box-shadow:var(--sh1);position:relative}
.uiDk{justify-self:start;font-size:11.5px;font-weight:600;color:var(--gold-ink);background:linear-gradient(180deg,var(--gold),var(--gold2));border-radius:999px;padding:2px 10px}
.uiDi{height:120px;border-radius:var(--r);background:var(--thumb-bg);display:grid;place-items:center;overflow:hidden}
.uiDi img{width:100%;height:100%;object-fit:contain}
.uiDi svg{width:44px;height:44px;stroke:var(--accent);fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.uiDay b{font-size:16px;font-weight:600;line-height:1.45}
.uiDay small{font-size:12.5px;color:var(--muted);text-align:start}
.uiDay small[dir=ltr]{font-family:var(--font-mono);text-align:end}
.uiDay p{font-size:13.5px;line-height:1.7;color:var(--muted)}
.uiDay .btn{justify-self:start;margin-top:2px}
.uiStats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.uiStats>div{display:grid;justify-items:center;gap:0;padding:14px 8px;border-radius:var(--r-lg);border:1px solid var(--line);background:linear-gradient(180deg,var(--panel),var(--panel2));box-shadow:var(--sh1)}
.uiStats b{font-family:var(--font-mono);font-size:clamp(22px,6vw,30px);font-weight:600;color:var(--accent);direction:ltr}
.uiStats span{font-size:13px;color:var(--muted)}
body[data-dest="home"] .bobw,body[data-dest="home"] .bobtab,body[data-dest="home"] .bobcap{display:none}
@media (min-width:900px){
  .uiHero{grid-template-columns:minmax(0,1fr) auto auto;padding:28px 30px 22px;align-items:center}
  .uiRings{grid-column:auto;grid-template-columns:repeat(3,76px);border-top:0;padding:0;border-inline-start:1px solid rgb(255 255 255 / .12);padding-inline-start:20px}
  .uiHeroBob{grid-column:3;grid-row:1;width:132px}
  .uiRings{grid-column:2;grid-row:1}
  .uiDue{grid-column:1/-1}
}
@media (prefers-reduced-motion:reduce){.uiHeroPl{animation:none}.uiRgV{animation:none}}
`;
  const st=document.createElement("style"); st.id="uiHomeCss"; st.textContent=css; document.head.appendChild(st);
})();
