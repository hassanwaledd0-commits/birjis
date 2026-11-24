/* ---------- Maysaloon's voice (prefix my): pick a MAN's voice from the voices the device offers, and the «الصوت» settings sheet ----------
   Web Speech API only (no files, no network of our own). x_bobby.js calls myVcPick(voices) from bobPickVoice() and myVcParams(lang,voice) when it speaks.
   Scoring: language match + natural/neural/online + known male names - known female names; the user's choice per language is remembered (localStorage, try/catch).
   Nothing here can be heard in a test sandbox: the choice logic is verified with a mock speechSynthesis (tests/may_voice_test.py), the sound itself only on a real device. */
const MY_VC_F=/\b(female|woman)\b|zariyah|salma|laila|leila|hoda|zira|hazel|susan|samantha|amany|rana\b|mariam|maryam|fatima|noura|reem|iman\b|ghada|sana\b|zeina|hanan|amina|aria\b|jenny|michelle|emma|sonia|libby|karen|moira|tessa|victoria|allison|ava\b|serena|kate\b|fiona|catherine|linda|heather|joanna|ivy\b|kendra|kimberly|salli|nicole|natasha|clara|elsa|yara|laura|google us english|google العربية|google عربي|\bgoogle arabic\b|ayanda|zosia|lekha|\bkanya\b|alice|amelie|anna\b|milena|paulina|tracy|zuzana|ioana|sara\b|sin-ji|mei-jia|ting-ting|yuna|kyoko|o-ren|damayanti|veena|tian-tian/i;
const MY_VC_M=/\b(male|man)\b|hamed|hamdan|naayf|naif|nayef|shakir|maged|majed|tarik|tareq|tariq|salem|saleh|fahed|fahad|omar\b|hamza|bassel|taim\b|moaz|rami\b|jamal|laith|ismael|hedi|abdullah|ahmed|khalid|yousef|youssef|mohamed|zayed|david|mark\b|guy\b|ryan|daniel|alex\b|aaron|george|thomas|eric\b|james|richard|rishi|brian|christopher|davis|andrew|steffan|roger|liam|william|oliver|arthur|fred\b|lee\b|nathan|gordon|jason|ralph|evan\b|connor|jacob|henry|neil|noah|thomas|ravi|hemant|jorge|diego|luca|google uk english male|حامد|نايف|شاكر|ماجد|طارق|سالم|فهد/i;
const MY_VC_NAT=/natural|neural|online|enhanced|premium|studio|wavenet/i;
const myVcLow=s=>String(s||"").toLowerCase().replace("_","-");
/* "m" (male-likely), "f" (female-likely) or "?" (cannot tell from the name) */
function myVcGender(v){ const n=String(v&&v.name||""); if(!n) return "?"; if(/\bmale\b/i.test(n)&&!/\bfemale\b/i.test(n)) return "m"; if(MY_VC_F.test(n)) return "f"; if(MY_VC_M.test(n)) return "m"; return "?"; }
/* language rank of a voice for "ar" or "en"; -1 when it speaks neither */
function myVcLang(v,lang){
  const l=myVcLow(v&&v.lang), n=String(v&&v.name||"");
  if(lang==="en"){ if(l==="en-us") return 50; if(l==="en-gb") return 48; if(l==="en-au"||l==="en-ca"||l==="en-ie"||l==="en-in") return 40; if(l==="en") return 35; if(l.indexOf("en")===0) return 30; return -1; }
  if(l==="ar-sa") return 50; if(l==="ar-ae") return 45; if(l==="ar-eg") return 40; if(l==="ar") return 35; if(l.indexOf("ar")===0) return 30; if(/arab|عرب/i.test(n)) return 20; return -1;
}
function myVcScore(v,lang){
  const r=myVcLang(v,lang); if(r<0) return -1; const n=String(v.name||""), g=myVcGender(v);
  return r+(v.localService?3:0)+(MY_VC_NAT.test(n)?8:0)+(g==="m"?30:g==="f"?-45:0);
}
/* the voices of one language, best first, each with its tags */
function myVcList(vs,lang){
  return (vs||[]).map(v=>({v,s:myVcScore(v,lang),g:myVcGender(v),nat:MY_VC_NAT.test(String(v.name||""))})).filter(a=>a.s>=-40&&myVcLang(a.v,lang)>=0).sort((a,b)=>b.s-a.s);
}
const myVcId=v=>String((v&&(v.voiceURI||v.name))||"");
const myVcKey=lang=>"atlas-bob-vname-"+(lang==="en"?"en":"ar");
function myVcSaved(lang){ try{ return localStorage.getItem(myVcKey(lang))||""; }catch(e){ return ""; } }
function myVcSave(lang,id){ try{ if(id) localStorage.setItem(myVcKey(lang),id); else localStorage.removeItem(myVcKey(lang)); }catch(e){} }
/* choose the voice for a language: the saved choice if the device still has it, else the best scored one */
function myVcChoose(vs,lang){
  const L=myVcList(vs,lang); if(!L.length) return null; const id=myVcSaved(lang);
  if(id){ const f=L.find(a=>myVcId(a.v)===id||a.v.name===id); if(f) return f.v; }
  return L[0].v;
}
/* called by bobPickVoice(): sets BOB.voice / BOB.voiceEn / the no-voice flags and BOB.vgen (gender per language) */
function myVcPick(vs){
  BOB.voice=myVcChoose(vs,"ar"); BOB.voiceEn=myVcChoose(vs,"en");
  BOB.noVoice=vs.length>0&&!BOB.voice; BOB.noVoiceEn=vs.length>0&&!BOB.voiceEn;
  BOB.vgen={ar:BOB.voice?myVcGender(BOB.voice):"",en:BOB.voiceEn?myVcGender(BOB.voiceEn):""};
  return BOB.voice;
}
/* speaking parameters: a natural male register is rate about .95 and pitch .9-.95; with no male voice the pitch is lowered further */
function myVcParams(lang,v){
  const g=v?myVcGender(v):"?", en=lang==="en";
  return {rate:en?1:.95,pitch:g==="m"?.93:(g==="?"?.88:.8)};
}
/* true when the best voice of this language is not (known to be) a man's */
function myVcNoMale(lang){ const v=lang==="en"?BOB.voiceEn:BOB.voice; return !!v&&myVcGender(v)!=="m"; }
/* how the name is spelled for the speech engine only; captions and the screen keep the plain name */
const MY_NAME_AR="مَيْسَلُون", MY_NAME_EN="My-sa-loon";
const myVcShown=t=>String(t).split(MY_NAME_AR).join("ميسلون").split(MY_NAME_EN).join("Maysaloon");

/* ----- the «الصوت» sheet ----- */
const myLg=()=>{ try{ return typeof ilLang==="function"?ilLang():"ar"; }catch(e){ return "ar"; } };
const myT=o=>myLg()==="en"?o.en:o.ar;
const myEsc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const MY_VS={el:null,prev:null,css:false};
function myVsCss(){
  if(MY_VS.css) return; MY_VS.css=true; const st=document.createElement("style"); st.id="myvscss";
  st.textContent=`.myvs{position:fixed;inset:0;z-index:2400;display:grid;place-items:center;background:rgba(8,14,28,.5);padding:16px}.myvs[hidden]{display:none}
.myvsp{background:var(--panel,#fff);color:var(--ink,#0e1a24);border:1px solid var(--line,#d3dce4);border-radius:20px;box-shadow:0 18px 50px rgba(10,20,50,.35);width:min(460px,100%);max-height:calc(100dvh - 32px);overflow:auto;padding:16px 18px 18px;display:grid;gap:12px;grid-template-columns:minmax(0,1fr)}
.myvsh{display:flex;align-items:center;justify-content:space-between;gap:10px}.myvsh b{font-size:17px}
.myvsx{border:0;background:none;color:inherit;font:inherit;font-size:22px;line-height:1;width:40px;height:40px;border-radius:50%;cursor:pointer}.myvsx:hover,.myvsx:focus-visible{background:color-mix(in srgb,var(--accent,#1f5fbf) 14%,transparent)}
.myvsr{display:grid;gap:6px;grid-template-columns:minmax(0,1fr)}.myvsr label{font-size:13.5px;font-weight:600}
.myvsr select{width:100%;min-height:42px;font:inherit;font-size:14px;color:inherit;background:var(--bg,#f5f8fb);border:1px solid var(--line,#d3dce4);border-radius:12px;padding:6px 10px}
.myvsr select:focus-visible,.myvsb:focus-visible,.myvsx:focus-visible{outline:3px solid var(--accent,#1f5fbf);outline-offset:2px}
.myvsb{justify-self:start;min-height:40px;border:1px solid var(--accent,#1f5fbf);background:var(--accent,#1f5fbf);color:var(--accent-ink,#fff);border-radius:999px;font:inherit;font-size:14px;padding:6px 18px;cursor:pointer}
.myvsb.alt{background:none;color:var(--accent,#1f5fbf)}
.myvsn{margin:0;font-size:13px;line-height:1.7;color:var(--muted,#566574);background:color-mix(in srgb,var(--signal,#b8730a) 11%,var(--panel,#fff));border:1px solid color-mix(in srgb,var(--signal,#b8730a) 40%,var(--line,#d3dce4));border-radius:12px;padding:8px 12px}
.myvsn ul{margin:4px 0;padding-inline-start:20px}.myvsn li{margin:2px 0}.myvsn.ok{background:color-mix(in srgb,var(--accent,#1f5fbf) 8%,var(--panel,#fff));border-color:var(--line,#d3dce4)}
.myvsf{margin:0;font-size:12px;line-height:1.6;color:var(--muted,#566574)}
@media (max-width:640px){.myvs{place-items:end center;padding:0}.myvsp{border-radius:20px 20px 0 0;width:100%;max-height:88dvh}}`;
  document.head.appendChild(st);
}
function myVsTag(a){ const t=[]; t.push(a.g==="m"?myT({ar:"رجالي",en:"male"}):a.g==="f"?myT({ar:"نسائي",en:"female"}):myT({ar:"غير محدد",en:"unspecified"})); if(a.nat) t.push(myT({ar:"طبيعي",en:"natural"})); if(a.v.localService) t.push(myT({ar:"محلي",en:"local"})); return t.join("، "); }
function myVsRow(lang,vs){
  const L=myVcList(vs,lang), cur=lang==="en"?BOB.voiceEn:BOB.voice, lab=lang==="en"?myT({ar:"الصوت الإنجليزي",en:"English voice"}):myT({ar:"الصوت العربي",en:"Arabic voice"});
  if(!L.length) return `<div class="myvsr"><label>${lab}</label><p class="myvsn">${myEsc(lang==="en"?myT({ar:"جهازك لا يعرض صوتاً إنجليزياً، فستظهر عبارات ميسلون مكتوبة.",en:"Your device offers no English voice, so Maysaloon's lines appear as text."}):myT({ar:"جهازك لا يعرض صوتاً عربياً، فستظهر عبارات ميسلون مكتوبة.",en:"Your device offers no Arabic voice, so Maysaloon's lines appear as text."}))}</p></div>`;
  const opts=L.map(a=>`<option value="${myEsc(myVcId(a.v))}"${cur&&myVcId(cur)===myVcId(a.v)?" selected":""}>${myEsc(myVsTag(a))} · ${myEsc(a.v.name)}</option>`).join("");
  const noMale=myVcNoMale(lang);
  const H=lang==="en"?{a:{ar:"لا يوجد صوت رجالي إنجليزي مؤكّد على جهازك. للحصول على صوت رجل طبيعي:",en:"No English male voice could be confirmed on your device. To get a natural man's voice:"},
      l:[{ar:"في متصفح Edge أو ويندوز: أضف أصوات Natural مثل Guy أو Ryan.",en:"Edge or Windows: add the Natural voices, for example Guy or Ryan."},{ar:"على الآيفون: الإعدادات ← تسهيلات الاستخدام ← المحتوى المنطوق ← الأصوات ← English ← Daniel أو Aaron.",en:"iPhone: Settings > Accessibility > Spoken Content > Voices > English > Daniel or Aaron."}]}
    :{a:{ar:"لا يوجد صوت رجالي عربي مؤكّد على جهازك. للحصول على صوت رجل طبيعي:",en:"No Arabic male voice could be confirmed on your device. To get a natural man's voice:"},
      l:[{ar:"في متصفح Edge على ويندوز: أضف حزمة صوت العربية (السعودية)، ثم اختر الصوت الطبيعي Hamed.",en:"Edge on Windows: add the Arabic (Saudi Arabia) voice pack, then pick the Natural voice Hamed."},{ar:"على الآيفون: الإعدادات ← تسهيلات الاستخدام ← المحتوى المنطوق ← الأصوات ← العربية ← ماجد.",en:"iPhone: Settings > Accessibility > Spoken Content > Voices > Arabic > Maged."}]};
  const tail={ar:"حتى ذلك الحين يتكلم ميسلون بأفضل صوت متاح مع خفض النبرة.",en:"Until then Maysaloon speaks with the best voice available and a lowered pitch."};
  const hint=noMale?`<div class="myvsn" dir="auto"><span>${myEsc(myT(H.a))}</span><ul>${H.l.map(x=>`<li dir="auto">${myEsc(myT(x))}</li>`).join("")}</ul><span>${myEsc(myT(tail))}</span></div>`:"";
  return `<div class="myvsr"><label for="myvs-${lang}">${lab}</label><select id="myvs-${lang}" data-myl="${lang}">${opts}</select>
    <button type="button" class="myvsb" data-mytest="${lang}">${myEsc(myT({ar:"جرّب الصوت",en:"Try the voice"}))}</button>${hint?hint:`<p class="myvsn ok">${myEsc(myT({ar:"هذا صوت رجالي، وسيُستخدم لميسلون.",en:"This looks like a male voice and is used for Maysaloon."}))}</p>`}</div>`;
}
function myVsRender(){
  const el=MY_VS.el; if(!el) return; const sy=bobSyn(); let vs=[]; try{ vs=sy?(sy.getVoices()||[]):[]; }catch(e){}
  const none=!sy?`<p class="myvsn">${myEsc(myT({ar:"متصفحك لا يدعم الصوت المنطوق، فستظهر عبارات ميسلون مكتوبة.",en:"Your browser has no speech support, so Maysaloon's lines appear as text."}))}</p>`:"";
  el.querySelector(".myvsp").innerHTML=`<div class="myvsh"><b id="myvst">${myEsc(myT({ar:"الصوت",en:"Voice"}))}</b><button type="button" class="myvsx" data-myx="1" aria-label="${myEsc(myT({ar:"إغلاق",en:"Close"}))}">×</button></div>${none}${sy?myVsRow("ar",vs)+myVsRow("en",vs):""}
    <p class="myvsf">${myEsc(myT({ar:"الصوت يأتي من جهازك أو متصفحك وليس من الموقع، ولا يمكن تسجيل صوت إنسان هنا. يُحفظ اختيارك على هذا الجهاز فقط.",en:"The voice comes from your device or browser, not from this site, and a human voice cannot be recorded here. Your choice is kept on this device only."}))}</p>`;
}
document.addEventListener("click",e=>{ const b=e.target.closest&&e.target.closest("[data-myvs]"); if(b){ e.preventDefault(); myVoiceSheet(); } });   /* any button with data-myvs opens the sheet */
function myVoiceSheet(open){
  try{
    myVsCss();
    if(open===false){ if(MY_VS.el){ MY_VS.el.hidden=true; try{ if(MY_VS.prev&&MY_VS.prev.focus) MY_VS.prev.focus(); }catch(e){} } return false; }
    if(!MY_VS.el){
      const el=document.createElement("div"); el.className="myvs"; el.id="myVs"; el.hidden=true; el.setAttribute("role","dialog"); el.setAttribute("aria-modal","true"); el.setAttribute("aria-labelledby","myvst"); el.innerHTML='<div class="myvsp"></div>';
      document.body.appendChild(el); MY_VS.el=el;
      el.addEventListener("click",e=>{ if(e.target===el||e.target.closest("[data-myx]")){ myVoiceSheet(false); return; }
        const tb=e.target.closest("[data-mytest]"); if(tb){ const lang=tb.dataset.mytest; try{ bobStop(); }catch(er){} if(!BOB.v) bobVoiceOn(true);
          bobSay(lang==="en"?"Hello, I'm Maysaloon. This is how I sound.":"أهلاً، أنا ميسلون. هذا هو صوتي.",{lang,priority:"high",caption:true}); } });
      el.addEventListener("change",e=>{ const s=e.target.closest("select[data-myl]"); if(!s) return; const lang=s.dataset.myl; myVcSave(lang,s.value); try{ bobPickVoice(); }catch(er){} myVsRender(); const f=MY_VS.el.querySelector("#myvs-"+lang); if(f) f.focus(); });
      document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&MY_VS.el&&!MY_VS.el.hidden){ e.stopPropagation(); myVoiceSheet(false); } },true);
      document.addEventListener("il-lang",()=>{ if(MY_VS.el&&!MY_VS.el.hidden) myVsRender(); });
      try{ const sy=bobSyn(); if(sy) sy.addEventListener("voiceschanged",()=>{ if(MY_VS.el&&!MY_VS.el.hidden) myVsRender(); }); }catch(e){}
    }
    MY_VS.prev=document.activeElement; try{ bobPickVoice(); }catch(e){} myVsRender(); MY_VS.el.hidden=false;
    const f=MY_VS.el.querySelector("select,.myvsx"); if(f) try{ f.focus(); }catch(e){}
    return true;
  }catch(e){ console.error(e); return false; }
}
