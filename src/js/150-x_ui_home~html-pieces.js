/* ---------- HTML pieces ---------- */
const uiSvg={
  search:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  chev:'<svg class="uiChev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  back:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
  go:'<svg class="uiGo" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg>',
  layers:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 3 8l9 5 9-5-9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 17.5 9 5 9-5" opacity=".5"/></svg>'
};
function uiPartsHTML(){
  return `<div class="uiP" id="uiP">
    <div class="uiSb">${uiSvg.search}<input id="uiPq" class="uiPq" type="search" enterkeyhint="search" autocomplete="off" spellcheck="false" placeholder="ابحث: الاسم بالعربي أو الإنجليزي، أو رقم ATA" aria-label="ابحث عن قطعة" value="${esc(UIP.q)}"><button type="button" class="uiClr" id="uiPclr" aria-label="مسح البحث"${UIP.q?"":" hidden"}>×</button></div>
    <div id="uiPF"></div>
    <div id="uiPB" aria-live="polite"></div>
  </div>`;
}
function uiFiltHTML(){
  const ch=(attr,on,txt,dot)=>`<button type="button" class="uiCh" ${attr} aria-pressed="${on}">${dot?`<i class="uiDot" style="--c:var(--${dot})"></i>`:""}${txt}</button>`;
  const sys=`<div class="uiFr" role="group" aria-label="تصفية حسب النظام">${ch('data-uisys=""',!UIP.sys,"كل الأنظمة")}${Object.keys(SYS).map(k=>ch(`data-uisys="${k}"`,UIP.sys===k,esc(uiShort(k)),k)).join("")}</div>`;
  const lv=`<div class="uiFr" role="group" aria-label="المستوى والخيارات"><span class="uiSeg" role="group" aria-label="المستوى">${[0,1,2,3].map(i=>ch(`data-uilv="${i}"`,UIP.lv===i,i?UI_LVN[i]:"كل المستويات")).join("")}</span>`
    +ch('data-uitog="here"',UIP.here,"على هذه الطائرة")+ch('data-uitog="int"',UIP.int,"داخلية")+ch('data-uitog="fav"',UIP.fav,"★ المفضلة")
    +(UIP.par&&PARTS[UIP.par]?`<button type="button" class="uiCh uiPar" data-uipar="" aria-label="إلغاء تصفية القطع التابعة">ضمن: ${esc(PARTS[UIP.par].short||PARTS[UIP.par].ar)} <b aria-hidden="true">×</b></button>`:"")
    +(uiActive()?`<button type="button" class="uiCh uiClear" data-uiclear>مسح الكل</button>`:"")+`</div>`;
  return sys+lv;
}
function uiRow(r,rx){
  const p=PARTS[r.id], other=p.only&&!jbOnlyHas(p.only,S.ac);
  return `<button type="button" class="uiRow${other?" uiOther":""}" data-pick="${r.id}" aria-pressed="${r.id===S.sel}"${other?' data-other="1"':""}>`
    +`<span class="uiLv" data-lv="${r.lv}" role="img" aria-label="${UI_LVN[r.lv]}"><i></i><i></i><i></i></span>`
    +`<span class="uiRt"><b>${uiHl(p.ar,rx)}${p.only?`<em class="uiFlag">${jbOnlyTxt(p.only)} فقط</em>`:""}${p.int?'<em class="uiFlag">داخلية</em>':""}</b><small>${uiHl(p.en||"",rx)}</small></span>`
    +`<span class="uiTags"><span class="uiSy"><i class="uiDot" style="--c:var(--${p.sys})"></i>${esc(uiShort(p.sys))}</span><span class="uiMeta">${esc(((p.ata||"").replace(/\s*\/.*$/,"")).replace(/^ATA\s*/,"ATA "))}</span></span></button>`;
}
function uiPager(total,pg){
  const n=Math.ceil(total/UI_PAGE); if(n<=1) return "";
  return `<nav class="uiPg" aria-label="التنقل بين الصفحات"><button type="button" class="uiCh" data-uipg="${pg-1}"${pg<=0?" disabled":""}>السابق</button><span>${pg+1} / ${n}</span><button type="button" class="uiCh" data-uipg="${pg+1}"${pg>=n-1?" disabled":""}>التالي</button></nav>`;
}
function uiEmpty(){
  return `<div class="uiEmpty"><b>لا توجد قطع مطابقة</b><p>جرّب كلمة أقصر أو بالإنجليزية، أو أزل بعض عوامل التصفية.</p>${uiActive()?'<button type="button" class="btn" data-uiclear>مسح البحث والتصفية</button>':""}</div>`;
}
function uiGridHTML(){
  const ix=uiIndex(), ids=ix.list.filter(r=>r.main&&partVisible(r.id)).map(r=>r.id);
  return `<div class="uiGrid">${ids.map(id=>{ const p=PARTS[id], tid=thumbOf(id), v=bestView(S.ac,tid), src=partThumb(S.ac,tid,v);
    return `<button type="button" class="uiCard" data-pick="${id}" aria-pressed="${id===S.sel}"><span class="uiTh">${src?`<img src="${src}" alt="" loading="lazy" decoding="async">`:""}</span><b>${esc(p.short||p.ar)}</b><small><i class="uiDot" style="--c:var(--${p.sys})"></i>${esc(uiShort(p.sys))}</small></button>`; }).join("")}</div>`;
}
function uiBodyHTML(){
  const ix=uiIndex();
  if(uiActive()){                                  /* results: flat, ranked, paginated */
    const res=uiResults(), pg=Math.min(UIP.pg,Math.max(0,Math.ceil(res.length/UI_PAGE)-1)); UIP.pg=pg;
    const rx=UIP.q?uiRx(uiToks(UIP.q)):null, rows=res.slice(pg*UI_PAGE,(pg+1)*UI_PAGE);
    return `<div class="uiHd"><h3>${res.length?`${res.length} نتيجة`:"لا نتائج"}</h3></div>${rows.length?`<div class="uiList">${rows.map(r=>uiRow(r,rx)).join("")}</div>${uiPager(res.length,pg)}`:uiEmpty()}`;
  }
  const total=ix.list.filter(uiPass).length;
  if(UIP.mode==="browse"){
    return `<div class="uiHd"><button type="button" class="uiBk" data-uihome>${uiSvg.back}الأجزاء الرئيسية</button><h3>تصفّح كل القطع <em>${total}</em></h3></div><div class="uiAcc">${UI_GRP.map(g=>uiGroupHTML(g)).join("")}</div>`;
  }
  const nMain=ix.list.filter(r=>r.main&&partVisible(r.id)).length;
  return `<div class="uiHd"><h3>الأجزاء الرئيسية <em>${nMain}</em></h3></div>${uiGridHTML()}
    <button type="button" class="uiBrowse" data-uibrowse><span class="uiBi">${uiSvg.layers}</span><span class="uiBt"><b>تصفّح كل القطع (${total})</b><small>مرتبة بحسب فصول ATA في ${UI_GRP.length-1} مجموعة، من الأساسي إلى المتقدّم</small></span>${uiSvg.go}</button>`;
}
function uiGroupHTML(g){
  const all=uiIndex().sorted[g.id].filter(uiPass); if(!all.length&&g.id==="oth") return "";
  const open=UIP.grp===g.id, a=g.ata.length?(g.ata.length>1?g.ata[0]+"–"+g.ata[g.ata.length-1]:g.ata[0]):"•";
  let body="";
  if(open){
    const chs=[...new Set(all.map(r=>r.ch))], items=UIP.ch?all.filter(r=>r.ch===UIP.ch):all, pg=Math.min(UIP.pg,Math.max(0,Math.ceil(items.length/UI_PAGE)-1)); UIP.pg=pg;
    const rows=items.slice(pg*UI_PAGE,(pg+1)*UI_PAGE); let last="", h="";
    rows.forEach(r=>{ if(!UIP.ch&&r.ch!==last){ last=r.ch; const n=all.filter(x=>x.ch===r.ch).length; h+=`<h4 class="uiChh"><span>ATA ${esc(r.ch||"—")}</span>${esc(uiChName(r.ch))}<em>${n}</em></h4>`; } h+=uiRow(r,null); });
    body=`<div class="uiGb" role="region" aria-label="${esc(g.ar)}">${chs.length>1?`<div class="uiFr uiChs" role="group" aria-label="فصول ATA"><button type="button" class="uiCh" data-uich="" aria-pressed="${!UIP.ch}">كل الفصول (${all.length})</button>${chs.map(c=>`<button type="button" class="uiCh" data-uich="${c}" aria-pressed="${UIP.ch===c}">${c} ${esc(uiChName(c))} (${all.filter(r=>r.ch===c).length})</button>`).join("")}</div>`:""}<div class="uiList">${h}</div>${uiPager(items.length,pg)}</div>`;
  }
  return `<section class="uiG${open?" uiOpen":""}"><button type="button" class="uiGh" data-uigrp="${g.id}" aria-expanded="${open}"><span class="uiAta" style="--c:var(--${g.c})">${a}</span><b>${esc(g.ar)}</b><em>${all.length}</em>${uiSvg.chev}</button>${body}</section>`;
}
