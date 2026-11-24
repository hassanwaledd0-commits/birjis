/* ---------- the visitor's profile (prefix my): name, field, level. Kept in this browser's localStorage only (`birjis-profile`), never sent anywhere ----------
   API: myProfile() -> {name,role,lang,since,level?,assess?}|null, mySaveProfile(patch), myProfileClear(), myName(), myRoleOf(), myHelloText(lang,hi), myUserCtx(),
        myHomeHTML() (the Home cards), myProfileEdit() (the edit sheet), myIso(s) (bidi-isolate a name), myTopics, myLevels.
   Written for the welcome flow (x_brand.js), the Home screen (x_ui_home.js), the AI prompts (a one-line user context) and the assessment (x_assess.js). */
const MY_PK="birjis-profile", MY_PSKIP="birjis-profile-skip";
const MY_ROLES=[
  {k:"eng",ar:"مهندس طيران",en:"Aircraft engineer",hiAr:"مهندس",hiEn:"Engineer {n}",tipAr:"سأركّز معك على الهياكل والصيانة ودليل الصيانة.",tipEn:"I'll focus with you on structures, maintenance and the maintenance manual.",
   sug:[{t:{ar:"هياكل الطائرات",en:"Aircraft structures"},a:"book:str"},{t:{ar:"دليل الصيانة AMM",en:"Maintenance manual (AMM)"},a:"tab:amm"},{t:{ar:"الصيانة والموثوقية",en:"Maintenance and reliability"},a:"book:mnt"}]},
  {k:"tech",ar:"فنّي صيانة",en:"Maintenance technician",hiAr:"فنّي",hiEn:"{n}",tipAr:"سأركّز معك على الصيانة ودليل الصيانة والمثبتات.",tipEn:"I'll focus with you on maintenance, the maintenance manual and fasteners.",
   sug:[{t:{ar:"دليل الصيانة AMM",en:"Maintenance manual (AMM)"},a:"tab:amm"},{t:{ar:"الصيانة والموثوقية",en:"Maintenance and reliability"},a:"book:mnt"},{t:{ar:"أنظمة الطائرة",en:"Aircraft systems"},a:"book:asy"}]},
  {k:"student",ar:"طالب",en:"Student",hiAr:"طالب",hiEn:"{n}",tipAr:"سنبدأ من الأساسيات خطوة خطوة.",tipEn:"We'll start from the fundamentals, step by step.",
   sug:[{t:{ar:"مدخل إلى الطيران",en:"Introduction to flight"},a:"book:itf"},{t:{ar:"الدروس",en:"Lessons"},a:"tab:learn"},{t:{ar:"اسأل ميسلون",en:"Ask Maysaloon"},a:"tab:ask"}]},
  {k:"pilot",ar:"طيّار",en:"Pilot",hiAr:"كابتن",hiEn:"Captain {n}",tipAr:"سأركّز معك على الأداء والملاحة والطيران.",tipEn:"I'll focus with you on performance, navigation and flying.",
   sug:[{t:{ar:"الأداء والعمليات",en:"Flight operations and performance"},a:"book:prf"},{t:{ar:"الملاحة والأرصاد",en:"Navigation and meteorology"},a:"book:nav"},{t:{ar:"جرّب الطيران",en:"Try flying"},a:"tab:fly"}]},
  {k:"fan",ar:"هاوٍ",en:"Enthusiast",hiAr:"عاشق الطيران",hiEn:"{n}",tipAr:"جولة حول الطائرة وتجربة طيران، ثم نتعمّق إذا أحببت.",tipEn:"A tour around the aircraft and a flight, then we go deeper if you like.",
   sug:[{t:{ar:"جولة بين القطع",en:"Tour the parts"},a:"tab:parts"},{t:{ar:"جرّب الطيران",en:"Try flying"},a:"tab:fly"},{t:{ar:"قمرة القيادة",en:"The cockpit"},a:"tab:ckpt"}]}
];
const MY_LEVELS=[{k:"beg",ar:"مبتدئ",en:"Beginner"},{k:"mid",ar:"متوسط",en:"Intermediate"},{k:"adv",ar:"متقدّم",en:"Advanced"},{k:"exp",ar:"خبير",en:"Expert"}];
const MY_TOPICS={aero:{ar:"الديناميكا الهوائية",en:"Aerodynamics"},str:{ar:"الهياكل",en:"Structures"},prop:{ar:"المحركات والدفع",en:"Propulsion"},sys:{ar:"الأنظمة والتحكم",en:"Systems and control"},perf:{ar:"الأداء",en:"Performance"},nav:{ar:"الملاحة",en:"Navigation"},mnt:{ar:"الصيانة",en:"Maintenance"}};
const myLang=()=>{ try{ return typeof ilLang==="function"&&ilLang()==="en"?"en":"ar"; }catch(e){ return "ar"; } };
const myTx=o=>myLang()==="en"?o.en:o.ar;
const myEsc2=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const myIso=s=>s?"⁨"+s+"⁩":"";   /* first-strong isolate: an Arabic or Latin name keeps its own direction inside any sentence */
const myRoleOf=k=>MY_ROLES.find(r=>r.k===k)||null;
const myLevelOf=k=>MY_LEVELS.find(l=>l.k===k)||null;
const MY_P={v:undefined};
function myProfile(){
  if(MY_P.v!==undefined) return MY_P.v; let p=null;
  try{ const j=JSON.parse(localStorage.getItem(MY_PK)||"null"); if(j&&typeof j==="object"&&(j.name||j.role||j.assess)) p=j; }catch(e){}
  return MY_P.v=p;
}
function mySaveProfile(patch){
  const cur=Object.assign({},myProfile()||{}); const p=Object.assign(cur,patch||{});
  if(typeof p.name==="string") p.name=p.name.replace(/[⁦-⁩‎‏<>]/g,"").replace(/\s+/g," ").trim().slice(0,24);
  if(!p.since) p.since=new Date().toISOString().slice(0,10); try{ p.lang=myLang(); }catch(e){}
  MY_P.v=p; try{ localStorage.setItem(MY_PK,JSON.stringify(p)); }catch(e){}
  try{ document.dispatchEvent(new CustomEvent("my-profile",{detail:p})); }catch(e){}
  return p;
}
function myProfileClear(){ MY_P.v=null; try{ localStorage.removeItem(MY_PK); }catch(e){} try{ document.dispatchEvent(new CustomEvent("my-profile",{detail:null})); }catch(e){} }
const myName=()=>{ const p=myProfile(); return p&&p.name?p.name:""; };
const myProfileSkipped=()=>{ try{ return localStorage.getItem(MY_PSKIP)==="1"; }catch(e){ return false; } };
function myProfileSkip(on){ try{ if(on===false) localStorage.removeItem(MY_PSKIP); else localStorage.setItem(MY_PSKIP,"1"); }catch(e){} }
/* "<time greeting> يا <name>، مهندس" / "<greeting>, Engineer <name>" (the caller appends the punctuation) */
function myHelloText(lang,hi){
  const p=myProfile(), n=p&&p.name?myIso(p.name):"", r=p&&p.role?myRoleOf(p.role):null; if(!n) return hi;
  if(lang==="en") return hi+", "+(r?r.hiEn.replace("{n}",n):n);
  return hi+" يا "+n+(r?"، "+r.hiAr:"");
}
/* the Home hero title for a known visitor ("" for an unknown one: the caller keeps its own text) */
function myHeroTitle(arGreet){
  const p=myProfile(); if(!p||!p.name) return ""; const en=myLang()==="en", h=new Date().getHours();
  if(en) return myEsc2(myHelloText("en",h<12?"Good morning":h<17?"Good afternoon":"Good evening"))+", ready to take off?";
  return myEsc2(myHelloText("ar",arGreet))+"، هل أنت مستعد للتحليق؟";
}
/* one line of context for the AI prompts (tutor, ask, camera, flight coach); empty without a profile */
function myUserCtx(){
  const p=myProfile(); if(!p||(!p.name&&!p.role)) return ""; const r=p.role?myRoleOf(p.role):null, lv=p.assess&&p.assess.lvl?myLevelOf(p.assess.lvl):null;
  return "معلومة عن المستخدم (للتخصيص فقط): "+(p.name?"اسمه «"+p.name+"»، ":"")+(r?"واختصاصه: "+r.ar+"، ":"")+(lv?"ومستواه بحسب تقييم الموقع: "+lv.ar+"، ":"")+"فخاطبه باسمه أحياناً (وليس في كل جملة) وقدّم الشرح بما يناسب اختصاصه ومستواه.";
}

/* ----- styles (injected once; shared by the Home cards, the edit sheet and the assessment) ----- */
function myCssOnce(){
  if(document.getElementById("myCss")) return; const st=document.createElement("style"); st.id="myCss";
  st.textContent=`.myHm{display:grid;gap:12px;grid-template-columns:minmax(0,1fr)}
.myCd{display:grid;gap:10px;grid-template-columns:minmax(0,1fr);background:var(--panel,#fff);color:var(--ink,#0e1a24);border:1px solid var(--line,#d3dce4);border-radius:var(--r-lg,18px);padding:14px 16px;box-shadow:var(--sh1,0 1px 3px rgba(10,20,50,.1))}
.myCh{display:flex;align-items:center;justify-content:space-between;gap:10px;min-width:0}.myCh h3{margin:0;font-size:15.5px}
.myNm{display:flex;align-items:center;gap:10px;min-width:0;font-size:17px;font-weight:700}.myNm span{overflow-wrap:anywhere;unicode-bidi:plaintext}
.myRl{display:inline-flex;align-items:center;min-height:26px;padding:0 10px;border-radius:999px;background:color-mix(in srgb,var(--accent,#1f5fbf) 13%,transparent);color:var(--accent,#1f5fbf);font-size:12.5px;font-weight:600;white-space:nowrap}
.myBt{min-height:40px;padding:0 16px;border-radius:999px;border:1px solid var(--accent,#1f5fbf);background:var(--accent,#1f5fbf);color:var(--accent-ink,#fff);font:inherit;font-size:14px;cursor:pointer}
.myBt.alt{background:none;color:var(--accent,#1f5fbf)}.myBt.sm{min-height:34px;padding:0 12px;font-size:13px}
.myBt:focus-visible,.myOp:focus-visible,.myCp:focus-visible,.myIn:focus-visible{outline:3px solid var(--accent,#1f5fbf);outline-offset:2px}
.myMs{margin:0;font-size:13px;line-height:1.7;color:var(--muted,#566574)}
.myRow{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.myAsR{display:grid;grid-template-columns:64px minmax(0,1fr);gap:12px;align-items:center}
.myRg{position:relative;width:64px;height:64px}.myRg svg{width:100%;height:100%;display:block;transform:rotate(-90deg)}.myRg b{position:absolute;inset:0;display:grid;place-items:center;font-size:15px}
.myRg .bg{stroke:var(--line,#d3dce4)}.myRg .fg{stroke:var(--gold,#e8912a);stroke-linecap:round;transition:stroke-dasharray .6s}
.myCps{display:flex;flex-wrap:wrap;gap:8px}.myCp{min-height:36px;padding:0 14px;border-radius:999px;border:1px solid var(--line,#d3dce4);background:var(--panel2,var(--panel,#fff));color:inherit;font:inherit;font-size:13.5px;cursor:pointer}
.myCp:hover{border-color:var(--accent,#1f5fbf)}.myCp[aria-pressed="true"]{background:var(--accent,#1f5fbf);border-color:var(--accent,#1f5fbf);color:var(--accent-ink,#fff)}
.myIn{width:100%;min-height:44px;font:inherit;font-size:16px;color:inherit;background:var(--bg,#f5f8fb);border:1px solid var(--line,#d3dce4);border-radius:12px;padding:6px 12px}
.mySh{position:fixed;inset:0;z-index:2400;display:grid;place-items:center;background:rgba(8,14,28,.5);padding:16px}.mySh[hidden]{display:none}
.myShP{background:var(--panel,#fff);color:var(--ink,#0e1a24);border:1px solid var(--line,#d3dce4);border-radius:20px;box-shadow:0 18px 50px rgba(10,20,50,.35);width:min(460px,100%);max-height:calc(100dvh - 32px);overflow:auto;padding:16px 18px 18px;display:grid;gap:12px;grid-template-columns:minmax(0,1fr)}
.myShP h3{margin:0;font-size:17px}
@media (max-width:640px){.mySh{place-items:end center;padding:0}.myShP{border-radius:20px 20px 0 0;width:100%;max-height:90dvh}}`;
  document.head.appendChild(st);
}

/* ----- Home: the profile card, the assessment card and the field's shortcuts ----- */
function myAsDate(d){ try{ return new Date(d).toLocaleDateString(myLang()==="en"?"en-GB":"ar-IQ-u-nu-latn",{day:"numeric",month:"short",year:"numeric"}); }catch(e){ return String(d||"").slice(0,10); } }
function myRing(pct,txt){ const C=2*Math.PI*26, d=Math.max(0,Math.min(1,pct))*C; return `<div class="myRg" aria-hidden="true"><svg viewBox="0 0 64 64"><circle class="bg" cx="32" cy="32" r="26" fill="none" stroke-width="7"/><circle class="fg" cx="32" cy="32" r="26" fill="none" stroke-width="7" stroke-dasharray="${d.toFixed(1)} ${C.toFixed(1)}"/></svg><b>${txt}</b></div>`; }
function myHomeHTML(){
  myCssOnce(); const p=myProfile(), r=p&&p.role?myRoleOf(p.role):null, a=p&&p.assess;
  const prof=p&&(p.name||p.role)?`<section class="myCd" aria-label="${myEsc2(myTx({ar:"ملفك",en:"Your profile"}))}"><div class="myCh"><div class="myNm"><span>${myEsc2(p.name||myTx({ar:"زائر",en:"Visitor"}))}</span>${r?`<em class="myRl" style="font-style:normal">${myEsc2(myTx(r))}</em>`:""}</div><button type="button" class="myBt alt sm" data-my="edit">${myEsc2(myTx({ar:"تعديل",en:"Edit"}))}</button></div>
      ${r?`<div class="myCps" role="group" aria-label="${myEsc2(myTx({ar:"اقتراحات لاختصاصك",en:"Suggestions for your field"}))}">${r.sug.map(s=>`<button type="button" class="myCp" data-my="go:${s.a}">${myEsc2(myTx(s.t))}</button>`).join("")}</div>`:""}</section>`
    :`<section class="myCd" aria-label="${myEsc2(myTx({ar:"عرّفنا بنفسك",en:"Introduce yourself"}))}"><div class="myCh"><h3>${myEsc2(myTx({ar:"عرّفنا بنفسك",en:"Introduce yourself"}))}</h3></div><p class="myMs">${myEsc2(myTx({ar:"اسمك واختصاصك يساعدان ميسلون على مخاطبتك واختيار ما يناسبك. يُحفظان على هذا الجهاز فقط.",en:"Your name and field help Maysaloon address you and pick what suits you. They are kept on this device only."}))}</p><div class="myRow"><button type="button" class="myBt" data-my="edit">${myEsc2(myTx({ar:"ابدأ",en:"Start"}))}</button></div></section>`;
  let as;
  if(a&&a.lvl){ const lv=myLevelOf(a.lvl); as=`<section class="myCd" aria-label="${myEsc2(myTx({ar:"تقييمك",en:"Your assessment"}))}"><div class="myCh"><h3>${myEsc2(myTx({ar:"تقييمك",en:"Your assessment"}))}</h3><button type="button" class="myBt alt sm" data-my="assess">${myEsc2(myTx({ar:"أعد التقييم",en:"Retake"}))}</button></div>
      <div class="myAsR">${myRing((a.score||0)/100,Math.round(a.score||0)+"%")}<div><div class="myNm"><span>${myEsc2(myTx(lv))}</span></div><p class="myMs">${myEsc2(myAsDate(a.date))}</p></div></div>
      ${a.rec&&a.rec.length&&typeof LESSONS!=="undefined"?`<div class="myCps" role="group" aria-label="${myEsc2(myTx({ar:"دروس مقترحة",en:"Suggested lessons"}))}">${a.rec.slice(0,3).map(x=>{ const L=LESSONS[x.b]&&LESSONS[x.b][x.i]; return L?`<button type="button" class="myCp" data-my="lesson:${x.b}:${x.i}">${myEsc2(L.ar)}</button>`:""; }).join("")}</div>`:""}</section>`; }
  else as=`<section class="myCd" aria-label="${myEsc2(myTx({ar:"تقييم المستوى",en:"Level assessment"}))}"><div class="myCh"><h3>${myEsc2(myTx({ar:"اعرف مستواك",en:"Find your level"}))}</h3></div><p class="myMs">${myEsc2(myTx({ar:"عشرة أسئلة تقريباً من دروس الموقع، ثم تقرير بنقاط القوة والضعف ودروس مقترحة.",en:"About ten questions from the site's lessons, then a report with strengths, weaknesses and suggested lessons."}))}</p><div class="myRow"><button type="button" class="myBt" data-my="assess">${myEsc2(myTx({ar:"ابدأ التقييم",en:"Start the assessment"}))}</button></div></section>`;
  return `<section class="myHm" id="myHm">${prof}${as}</section>`;
}
/* the profile edit sheet: name, field, delete */
const MY_SH={el:null,prev:null,role:""};
function myProfileEdit(open){
  try{
    myCssOnce();
    if(open===false){ if(MY_SH.el){ MY_SH.el.hidden=true; try{ if(MY_SH.prev&&MY_SH.prev.focus) MY_SH.prev.focus(); }catch(e){} } return false; }
    if(!MY_SH.el){ const el=document.createElement("div"); el.className="mySh"; el.id="myShEd"; el.hidden=true; el.setAttribute("role","dialog"); el.setAttribute("aria-modal","true"); el.setAttribute("aria-labelledby","mySht"); el.innerHTML='<div class="myShP"></div>'; document.body.appendChild(el); MY_SH.el=el;
      el.addEventListener("click",e=>{ if(e.target===el){ myProfileEdit(false); return; } const b=e.target.closest("[data-mye]"); if(!b) return; const k=b.dataset.mye;
        if(k==="role"){ MY_SH.role=MY_SH.role===b.dataset.v?"":b.dataset.v; el.querySelectorAll("[data-mye=role]").forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.v===MY_SH.role))); }
        else if(k==="save"){ const nm=el.querySelector("#myEdN").value; mySaveProfile({name:nm,role:MY_SH.role||undefined}); myProfileSkip(false); myProfileEdit(false); myRefreshHome(); }
        else if(k==="cancel") myProfileEdit(false);
        else if(k==="del"){ myProfileClear(); myProfileEdit(false); myRefreshHome(); } });
      el.addEventListener("keydown",e=>{ if(e.key==="Escape"){ e.stopPropagation(); myProfileEdit(false); } else if(e.key==="Enter"&&e.target.id==="myEdN"){ e.preventDefault(); el.querySelector("[data-mye=save]").click(); } },true); }
    const p=myProfile()||{}; MY_SH.role=p.role||""; MY_SH.prev=document.activeElement;
    MY_SH.el.querySelector(".myShP").innerHTML=`<h3 id="mySht">${myEsc2(myTx({ar:"ملفك",en:"Your profile"}))}</h3><label class="myMs" for="myEdN">${myEsc2(myTx({ar:"الاسم",en:"Name"}))}</label><input class="myIn" id="myEdN" maxlength="24" autocomplete="given-name" value="${myEsc2(p.name||"")}" placeholder="${myEsc2(myTx({ar:"اكتب اسمك",en:"Type your name"}))}">
      <div class="myMs">${myEsc2(myTx({ar:"الاختصاص",en:"Field"}))}</div><div class="myCps" role="group" aria-label="${myEsc2(myTx({ar:"الاختصاص",en:"Field"}))}">${MY_ROLES.map(r=>`<button type="button" class="myCp" data-mye="role" data-v="${r.k}" aria-pressed="${r.k===MY_SH.role}">${myEsc2(myTx(r))}</button>`).join("")}</div>
      <div class="myRow"><button type="button" class="myBt" data-mye="save">${myEsc2(myTx({ar:"حفظ",en:"Save"}))}</button><button type="button" class="myBt alt" data-mye="cancel">${myEsc2(myTx({ar:"إلغاء",en:"Cancel"}))}</button>${p.name||p.role||p.assess?`<button type="button" class="myBt alt" data-mye="del">${myEsc2(myTx({ar:"حذف بياناتي",en:"Delete my data"}))}</button>`:""}</div>
      <p class="myMs">${myEsc2(myTx({ar:"لا يغادر شيء من هذا متصفحك: يُحفظ على هذا الجهاز فقط.",en:"None of this leaves your browser: it is stored on this device only."}))}</p>`;
    MY_SH.el.hidden=false; const f=MY_SH.el.querySelector("#myEdN"); if(f) try{ f.focus(); }catch(e){}
    return true;
  }catch(e){ console.error(e); return false; }
}
function myRefreshHome(){ try{ if(typeof BW!=="undefined"&&BW.open) return; if(typeof S!=="undefined"&&S.tab==="home"&&typeof renderTab==="function") renderTab(); }catch(e){} }
document.addEventListener("click",e=>{
  const b=e.target.closest&&e.target.closest("[data-my]"); if(!b) return; const k=b.dataset.my.split(":");
  if(k[0]==="edit"){ e.preventDefault(); myProfileEdit(); }
  else if(k[0]==="assess"){ e.preventDefault(); if(typeof myAssessOpen==="function") myAssessOpen(); }
  else if(k[0]==="go"){ e.preventDefault(); if(k[1]==="tab"){ try{ setTab(k[2]); }catch(er){} } else if(k[1]==="book"){ try{ const bk=k[2]; let i=0; const ds=LESSONS[bk]||[]; for(let j=0;j<ds.length;j++){ if(!LDONE.has(bk+":"+j)){ i=j; break; } } uiOpenLesson(bk,i); }catch(er){} } }
  else if(k[0]==="lesson"){ e.preventDefault(); try{ uiOpenLesson(k[1],k[2]); }catch(er){} }
});
document.addEventListener("my-profile",()=>myRefreshHome());
