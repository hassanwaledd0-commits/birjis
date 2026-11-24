/* ---------- card additions: level, ATA chapter, reference books, related parts ---------- */
function uiRelated(id){
  const p=PARTS[id], ix=uiIndex(), me=ix.by[id]; if(!me) return [];
  const root=p.parent||id, seen=new Set([id]), out=[];
  const add=r=>{ if(r&&!seen.has(r.id)&&partVisible(r.id)){ seen.add(r.id); out.push(r.id); } };
  ix.list.filter(r=>(PARTS[r.id].parent===root||r.id===root)).sort((a,b)=>((b.ch===me.ch)-(a.ch===me.ch))||a.lv-b.lv).slice(0,12).forEach(add);
  if(out.length<8) ix.list.filter(r=>r.ch===me.ch&&r.ch).slice(0,40).forEach(r=>{ if(out.length<8) add(r); });
  return out.slice(0,8);
}
function uiCardExtra(id){
  const p=PARTS[id], r=uiIndex().by[id], m=document.getElementById("uiCardMeta"), rel=document.getElementById("uiCardRel"), rf=document.getElementById("uiCardRef"); if(!p||!r||!m) return;
  const cn=uiChName(r.ch), kids=Object.keys(PARTS).filter(k=>PARTS[k].parent===id&&partVisible(k)).length;
  m.innerHTML=`<span class="uiBadge uiB${r.lv}">المستوى: ${UI_LVN[r.lv]}</span>${r.ch?`<span class="uiBadge">ATA ${r.ch}${cn?" · "+esc(cn):""}</span>`:""}${p.only?`<span class="uiBadge">${jbOnlyTxt(p.only)} فقط</span>`:""}`;
  const bk=(p.bk&&UI_BK[p.bk])?[p.bk]:uiGrpOf(r.g).bk.slice(0,2);
  rf.hidden=!bk.length; rf.querySelector("div").innerHTML=bk.map(k=>`<p class="uiBook"><b dir="ltr">${esc(UI_BK[k]||k)}</b></p>`).join("")+`<p class="status">مراجع عامة للتوسّع في الموضوع، وليست نصاً منقولاً.</p>`;
  const ids=uiRelated(id);
  rel.hidden=!ids.length&&!kids;
  rel.querySelector("div").innerHTML=(kids?`<button type="button" class="btn uiKids" data-uikids="${id}">عرض القطع التابعة لها (${kids})</button>`:"")+ids.map(k=>`<button type="button" class="uiRel" data-uirel="${k}"><i class="uiDot" style="--c:var(--${PARTS[k].sys})"></i>${esc(PARTS[k].short||PARTS[k].ar)}</button>`).join("");
}
document.addEventListener("click",e=>{
  const a=e.target.closest&&e.target.closest("[data-uirel],[data-uikids]"); if(!a) return;
  if(a.dataset.uirel) select(a.dataset.uirel); else uiOpenPar(a.dataset.uikids);
});
