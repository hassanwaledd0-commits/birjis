/* ---------- glossary ---------- */
const GL_Q={q:"",cat:"all"};
function glossHTML(){
  const cats=[["all","الكل"]].concat(GLOSS_CATS);
  return `<div class="gloss"><div class="lsrch" role="search"><label for="gQ">ابحث بالقاموس</label><input id="gQ" type="search" autocomplete="off" placeholder="مثلاً: Lift، رفع، stall" value="${esc(GL_Q.q)}"></div>
    <div class="chips" role="group" aria-label="التصنيف">${cats.map(([k,t])=>`<button type="button" class="chip" data-gcat="${k}" aria-pressed="${GL_Q.cat===k}">${t}</button>`).join("")}</div>
    <p class="status" id="gCount"></p><div class="gl" id="gList"></div></div>`;
}
function glossFilter(){
  const q=arNorm(GL_Q.q).trim().toLowerCase(), L=GLOSS.filter(g=>(GL_Q.cat==="all"||g.c===GL_Q.cat)&&(!q||arNorm(g.ar).toLowerCase().indexOf(q)>=0||g.en.toLowerCase().indexOf(q)>=0||arNorm(g.d).toLowerCase().indexOf(q)>=0));
  const rank=g=>!q?0:(arNorm(g.ar).toLowerCase().indexOf(q)>=0||g.en.toLowerCase().indexOf(q)>=0?0:1);      /* term matches before definition matches */
  return L.sort((a,b)=>rank(a)-rank(b)||a.en.localeCompare(b.en));
}
function glossRender(root){
  const L=glossFilter(), box=root.querySelector("#gList"); if(!box) return;
  root.querySelector("#gCount").textContent=L.length+" من "+GLOSS.length+" مصطلحاً";
  box.innerHTML=L.length?L.map(g=>`<article class="gt"><b class="ltr">${esc(g.en)}</b><span class="gar">${esc(g.ar)}</span><p>${esc(g.d)}</p><button type="button" class="chip" data-gfind="${esc(g.ar)}">اعثر على دروسه</button></article>`).join(""):`<p class="status">لا يوجد مصطلح مطابق.</p>`;
}
function glossMount(root){
  const el=root.querySelector(".gloss"); if(!el) return; glossRender(el);
  el.querySelector("#gQ").addEventListener("input",e=>{ GL_Q.q=e.target.value; glossRender(el); });
  el.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return;
    if(b.dataset.gcat){ GL_Q.cat=b.dataset.gcat; el.querySelectorAll("[data-gcat]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.gcat===GL_Q.cat)); glossRender(el); return; }
    if(b.dataset.gfind){ LRN.pendingQ=b.dataset.gfind; setTab("learn"); } });
}
