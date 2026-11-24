/* ---------- livery picker extras (prefix al): adds the new colour schemes to the existing #bLivery list (names in both languages, switched on the "il-lang" event) ---------- */
(function(){
  try{
    const sel=document.getElementById("bLivery"); if(!sel||typeof LIVERY==="undefined") return;
    const raw=[...sel.options].find(o=>o.value==="raw"), add=["purple","teal","red","redgold"].filter(k=>LIVERY[k]&&![...sel.options].some(o=>o.value===k)), made=[];
    add.forEach(k=>{ const o=document.createElement("option"); o.value=k; o.textContent=LIVERY[k].name; sel.insertBefore(o,raw||null); made.push([o,k]); });
    const lab=()=>{ let en=false; try{ en=ilLang()==="en"; }catch(e){} made.forEach(([o,k])=>{ o.textContent=en?LIVERY[k].en:LIVERY[k].name; }); };
    document.addEventListener("il-lang",lab); setTimeout(lab,0);   /* x_i18n.js is evaluated after this file */
  }catch(e){ try{ console.error("alLiv",e); }catch(e2){} }
})();
