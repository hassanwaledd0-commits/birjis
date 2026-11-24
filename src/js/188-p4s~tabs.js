/* ---------- tabs ---------- */
const TAB_ID = {home:"t-home",parts:"t-parts",learn:"t-learn",dash:"t-dash",review:"t-review",gloss:"t-gloss",ckpt:"t-ckpt",amm:"t-amm",spec:"t-spec",mat:"t-mat",fx:"t-fx",ctl:"t-ctl",lab:"t-lab",sim:"t-sim",ask:"t-ask",cam:"t-cam",fly:"t-fly",books:"t-books",notes:"t-notes"};
/* two levels: four groups, each with its own tabs (a tab belongs to the group written in the markup) */
const TAB_GROUP = {}; $$(".tsub [data-tab]").forEach(b=>{ TAB_GROUP[b.dataset.tab]=b.dataset.g; });
function setTab(name){
  S.tab=name; const g=TAB_GROUP[name]||"plane"; (S.gtab=S.gtab||{})[g]=name;
  uiDest(g,name);
  $$(".tsub [data-tab]").forEach(b=>{ const on=b.dataset.tab===name; b.hidden=b.dataset.g!==g; b.setAttribute("aria-selected",on); b.tabIndex=on?0:-1; });
  $tp.setAttribute("aria-labelledby", TAB_ID[name]);
  const cur=document.querySelector(`.tsub [data-tab="${name}"]`); if(cur&&cur.scrollIntoView&&cur.parentNode.scrollWidth>cur.parentNode.clientWidth+2){ try{ cur.scrollIntoView({block:"nearest",inline:"center"}); }catch(e){} }
  renderTab();
}
$$(".tsub [data-tab]").forEach(b=>b.addEventListener("click",()=>setTab(b.dataset.tab)));
$$(".tgs .tg").forEach(b=>b.addEventListener("click",()=>{ const g=b.dataset.g; if(TAB_GROUP[S.tab]===g){ try{ window.scrollTo({top:0,behavior:reduced()?"auto":"smooth"}); }catch(e){} return; } const last=S.gtab&&S.gtab[g]; const first=document.querySelector(`.tsub [data-g="${g}"]`).dataset.tab; setTab(last||first); }));
function renderTab(){
  labStop(); lrnStop(); ckStop(); camStop(); uiHomeStop(); if(S.tab!=="notes"&&typeof nbLeave==="function") nbLeave();
  if(S.tab==="home"){
    $tp.innerHTML = uiHomeHTML();
    uiHomeMount($tp);
  } else if(S.tab==="parts"){
    $tp.innerHTML = uiPartsHTML();
    uiPartsMount($tp);
  } else if(S.tab==="spec"){
    $tp.innerHTML = `<div class="tablewrap"><table class="spec"><thead><tr><th></th><th>البند</th><th>القيمة</th><th>المصدر</th></tr></thead><tbody>${SPECS[S.ac].map(([a,b,c])=>`<tr><td class="sico">${SPECICON[SPEC_ICON[a]]||""}</td><td>${esc(a)}</td><td>${esc(b)}</td><td class="src">${esc(c)}</td></tr>`).join("")}</tbody></table></div>`;
  } else if(S.tab==="mat"){
    const ids=Object.keys(MATS[S.ac]);
    $tp.innerHTML = `<div class="matgrid">${Object.keys(MATLBL).map(k=>{
      const mine=ids.filter(id=>MATS[S.ac][id][0]===k); if(!mine.length) return "";   /* main parts first, the sub-parts folded below */
      const ok=mine.every(id=>MATS[S.ac][id][1]==="مؤكد");
      return `<div class="matcard"><span class="msw sw-${k}" role="img" aria-label="${esc(MATLBL[k])}"></span><b class="w5">${esc(MATLBL[k])}</b><span class="status">${mine.filter(id=>!PARTS[id].parent).map(id=>esc(PARTS[id].ar)).join("، ")}</span>${mine.some(id=>PARTS[id].parent)?`<details class="matsub"><summary>${mine.filter(id=>PARTS[id].parent).length} قطعة فرعية</summary><span class="status">${mine.filter(id=>PARTS[id].parent).map(id=>esc(PARTS[id].short)).join("، ")}</span></details>`:""}<span class="conf ${ok?"ok":""}">${ok?"مؤكد":"تقريبي"}</span></div>`; }).join("")}</div>
      <p class="status" style="margin-top:12px">"تقريبي" تعني ممارسة هندسية عامة لم تُتحقق من وثيقة محددة.</p>`;
  } else if(S.tab==="fx"){
    $tp.innerHTML = `<div class="fxgrid">${Object.keys(FX).map(k=>{ const f=FX[k];
      return `<article class="fxcard"><div class="ficon">${FXICON[k]||""}</div><b>${esc(f.en)}</b><span>${esc(f.ar)}</span><p>${esc(f.what)}</p><p class="status">${esc(f.check)}</p></article>`; }).join("")}</div>`;
  } else if(S.tab==="ctl"){
    $tp.innerHTML = mcHTML();
    mcMount($tp);
  } else if(S.tab==="lab"){
    $tp.innerHTML = labHTML();
    labMount($tp);
    labReadout();
  } else if(S.tab==="ask"){
    $tp.innerHTML = askHTML();
    askMount($tp);
  } else if(S.tab==="amm"){
    $tp.innerHTML = ammHTML();
    ammMount($tp);
  } else if(S.tab==="ckpt"){
    $tp.innerHTML = ckHTML();
    ckMount($tp);
  } else if(S.tab==="learn"){
    $tp.innerHTML = lrnHTML();
    lrnMount($tp);
  } else if(S.tab==="sim"){
    $tp.innerHTML = simHTML();
    simMount($tp);
  } else if(S.tab==="dash"){
    $tp.innerHTML = dashHTML();
    dashMount($tp);
  } else if(S.tab==="review"){
    $tp.innerHTML = revHTML();
    revMount($tp);
  } else if(S.tab==="gloss"){
    $tp.innerHTML = glossHTML();
    glossMount($tp);
  } else if(S.tab==="fly"){
    $tp.innerHTML = flyHTML();
    flyMount($tp);
  } else if(S.tab==="cam"){
    $tp.innerHTML = camHTML();
    camMount($tp);
  } else if(S.tab==="books"){
    $tp.innerHTML = booksHTML();
  } else if(S.tab==="notes"){
    $tp.innerHTML = nbHTML();
    nbMount($tp);
  }
}
function labHTML(){
  return `<div class="lab">
    <canvas id="labCv" class="labcv" role="img" aria-label="محاكاة تدفق الهواء حول مقطع جناح"></canvas>
    <div class="labctl">
      <label class="lrow"><span>زاوية الهجوم</span><b id="lAv"></b><input id="lA" type="range" min="-10" max="20" step="0.5"></label>
      <label class="lrow"><span>انحناء المقطع</span><b id="lCv"></b><input id="lC" type="range" min="0" max="0.12" step="0.005"></label>
      <label class="lrow"><span>سماكة المقطع</span><b id="lTv"></b><input id="lT" type="range" min="0.06" max="0.18" step="0.005"></label>
    </div>
    <div class="presets">
      <button class="btn" type="button" data-preset="sym">متماثل</button>
      <button class="btn" type="button" data-preset="cam">منحنٍ</button>
      <button class="btn" type="button" data-preset="thick">سميك</button>
      <button class="btn" type="button" id="labPlay" aria-pressed="false"></button>
    </div>
    <div class="labro" id="labRo"></div>
    <p class="status">محاكاة تعليمية لتدفق مثالي بلا لزوجة حول مقطع Joukowski. تُظهر الاتجاهات الأساسية: زيادة زاوية الهجوم أو الانحناء ترفع الرفع، وتجاوز الزاوية الحرجة يُضعف الرفع. قيم السحب تقديرية، وهذه ليست بديلاً عن حساب CFD أو اختبار النفق الهوائي.</p>
  </div>`;
}
