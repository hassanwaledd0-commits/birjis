/* ---------- card actions ---------- */
$("#cClose").addEventListener("click",clearSel);
$("#cPull").addEventListener("click",()=>{
  if(!S.sel) return;
  if(S.pull.has(S.sel)) S.pull.delete(S.sel); else S.pull.add(S.sel);
  if(GLOK){ GL.sync(); GL.kick(); }
  showCard(S.sel);
});
