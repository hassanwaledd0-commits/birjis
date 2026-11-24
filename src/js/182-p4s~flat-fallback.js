/* ---------- flat fallback (no 3D) ---------- */
function applyFlat(){
  if(GLOK) return;
  $flat.innerHTML = views(S.ac).plan.svg;
  $flat.dataset.layer = S.xray?"int":"ext";
  if(S.sel){ const el=$flat.querySelector(`.hs[data-id="${meshOf(S.sel)}"]`); if(el) el.classList.add("sel"); }
}
$flat.addEventListener("click",e=>{ const t=e.target.closest(".hs"); if(t) select(t.dataset.id); });
$flat.addEventListener("keydown",e=>{ if((e.key==="Enter"||e.key===" ")&&e.target.classList&&e.target.classList.contains("hs")){ e.preventDefault(); select(e.target.dataset.id); } });
