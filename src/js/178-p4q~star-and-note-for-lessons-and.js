/* ---------- star and note for lessons and parts ---------- */
function starBtn(k,cls){ return `<button type="button" class="star${cls?" "+cls:""}" data-star="${esc(k)}" aria-pressed="${STUDY.fav.has(k)}" aria-label="أضف للمفضلة" title="المفضلة">★</button>`; }
function noteBox(k){ return `<details class="lnotebox"${STUDY.notes[k]?" open":""}><summary>ملاحظتي</summary><textarea data-note="${esc(k)}" aria-label="ملاحظتي" rows="3" placeholder="اكتب ملاحظتك هنا، تُحفظ تلقائياً في متصفحك." maxlength="2000">${esc(STUDY.notes[k]||"")}</textarea></details>`; }
let noteTimer=0;
document.addEventListener("click",e=>{ const b=e.target.closest&&e.target.closest("[data-star]"); if(!b) return; const on=favToggle(b.dataset.star); document.querySelectorAll(`[data-star="${CSS.escape(b.dataset.star)}"]`).forEach(x=>x.setAttribute("aria-pressed",on)); });
document.addEventListener("input",e=>{ const t=e.target; if(!t||!t.dataset||t.dataset.note===undefined) return; clearTimeout(noteTimer); const k=t.dataset.note, v=t.value; noteTimer=setTimeout(()=>noteSet(k,v),400); });
