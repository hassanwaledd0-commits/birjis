/* ---------- part animation controls ---------- */
function animUI(){
  const mid = S.sel && meshOf(S.sel), an = mid && ANIM[mid];
  $("#cAnim").hidden = !(an && GLOK);
  if(!an || !GLOK) return;
  $("#aLbl").textContent = an.lbl;
  $("#aDesc").textContent = an.d;
  const g = GL.getAnim(mid);
  $("#aV").value = Math.round(g.v*100);
  $("#aPlay").textContent = g.play ? "إيقاف الحركة" : "تشغيل الحركة";
  $("#aPlay").setAttribute("aria-pressed", g.play);
}
$("#aV").addEventListener("input",e=>{
  if(!S.sel||!GLOK) return;
  GL.setAnim(meshOf(S.sel), e.target.value/100, false); GL.kick(); animUI();
});
$("#aPlay").addEventListener("click",()=>{
  if(!S.sel||!GLOK) return;
  const mid=meshOf(S.sel), g=GL.getAnim(mid); GL.setAnim(mid, g.v, !g.play); animUI();
});
/* engine box: every engine piece with its own name, play button and slider (one list for the whole engine) */
function engUI(){
  const show = GLOK && S.sel && isEng(meshOf(S.sel));
  $("#cEng").hidden = !show;
  if(!show) return;
  $("#eList").innerHTML = ENG.map(id=>{ const an=ANIM[id], g=GL.getAnim(id), on=id===meshOf(S.sel);
    return `<div class="erow${on?" on":""}"><button class="ename" type="button" data-sel="${id}" aria-current="${on}">${esc(PARTS[id].short)}</button>`
      +`<button class="btn" type="button" data-play="${id}" aria-pressed="${g.play}">${g.play?"إيقاف":"تشغيل"}</button>`
      +`<input type="range" min="0" max="100" step="1" value="${Math.round(g.v*100)}" data-v="${id}" aria-label="${esc(an.lbl)}"></div>`; }).join("");
  const all=ENG.every(id=>GL.getAnim(id).play);
  $("#eAll").textContent = all ? "إيقاف الكل" : "تشغيل الكل";
  $("#eAll").setAttribute("aria-pressed", all);
}
$("#eList").addEventListener("click",e=>{
  const s=e.target.closest("[data-sel]"), b=e.target.closest("[data-play]");
  if(s){ select(s.dataset.sel); return; }
  if(b&&GLOK){ const id=b.dataset.play, g=GL.getAnim(id); GL.setAnim(id, g.v, !g.play); engUI(); }
});
$("#eList").addEventListener("input",e=>{
  const id=e.target.dataset.v; if(!id||!GLOK) return;
  GL.setAnim(id, e.target.value/100, false); GL.kick();
});
$("#eAll").addEventListener("click",()=>{
  if(!GLOK) return;
  const on=!ENG.every(id=>GL.getAnim(id).play);
  ENG.forEach(id=>GL.setPlay(id,on)); engUI();
});
$("#cAsk").addEventListener("click",()=>{
  if(!S.sel) return;
  CHAT.prefill = `ما وظيفة ${PARTS[S.sel].ar}؟`;
  setTab("ask");
});
