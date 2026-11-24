/* ---------- notebook (v36, prefix nb): a separate tab for notes: freehand drawing, text boxes, and audio / video recordings, all kept on this device.
   Drawing is stored as strokes (normalised points), not pixels: it scales to any screen, undo / redo is exact, and a page is a few kilobytes. Text boxes are real <textarea>s (they are the accessible way to write).
   Pages and recordings live in IndexedDB ("birjis-notes"); with no IndexedDB the notebook still works for the session and says so. Recording uses getUserMedia + MediaRecorder; when the browser or the
   embedding page blocks the camera / microphone, a file picker (the phone's own recorder) takes its place. Nothing leaves the device. Tab "notes" in the "learn" group (p1s.html, p4s.js renderTab). ---------- */
const NB={murl:{},db:null,mem:{pages:new Map(),media:new Map()},pages:[],cur:null,tool:"pen",color:"#FAFAFA",size:6,strokes:[],redo:[],texts:[],media:[],urls:[],rec:null,drawing:null,saveT:0,root:null,cv:null,dpr:1,facing:"user",msg:""};
const NB_COLORS=[["#FAFAFA","أبيض"],["#FFC25E","ذهبي"],["#FF7A3C","برتقالي"],["#F0705F","أحمر"],["#52C28A","أخضر"],["#5FA4EA","أزرق"]];
const NB_SIZES=[[3,"رفيع"],[6,"وسط"],[12,"سميك"]];
const NB_AR=4/3;   /* the board is always 4:3, so normalised points mean the same on every screen */
const NB_MAXREC={audio:900,video:300};   /* seconds */
/* (v37) a page can be longer than the 4:3 box. hf = its height in "base pages" (1 = the old 4:3 box = 13 ruled lines); points keep x in widths and y in BASE heights, so y runs 0..hf and making
   a page longer never moves or stretches what is on it. NB_LINE = the pitch of the ruled lines as a share of the base height. */
const NB_HF_MAX=8, NB_LINE=0.075;
const nbHf=()=>Math.max(1,Math.min(NB_HF_MAX,+(NB.cur&&NB.cur.hf)||1));
const nbDefHf=()=>{ let w=0; try{ const b=document.getElementById("nbBoard"); w=(b&&b.clientWidth)||window.innerWidth||0; }catch(e){} return w&&w<560?2:1.5; };   /* a new page: 27 lines on a phone, 20 on a wide screen */
const nbLines=hf=>Math.round(hf/NB_LINE);

/* ---- storage ---- */
function nbDB(){
  return new Promise(res=>{
    if(NB.db!==null) return res(NB.db||null);
    try{ const rq=indexedDB.open("birjis-notes",1);
      rq.onupgradeneeded=()=>{ const d=rq.result; d.createObjectStore("pages",{keyPath:"id"}); const m=d.createObjectStore("media",{keyPath:"id"}); m.createIndex("page","page"); };
      rq.onsuccess=()=>{ NB.db=rq.result; res(NB.db); }; rq.onerror=rq.onblocked=()=>{ NB.db=false; res(null); };
    }catch(e){ NB.db=false; res(null); } });
}
function nbTx(store,mode,fn){
  return nbDB().then(db=>new Promise(res=>{ if(!db) return res(undefined);
    try{ const tx=db.transaction(store,mode), r=fn(tx.objectStore(store)); if(r&&"onsuccess" in r){ r.onsuccess=()=>res(r.result); r.onerror=()=>res(undefined); } else { tx.oncomplete=()=>res(true); } tx.onerror=tx.onabort=()=>res(undefined); }catch(e){ res(undefined); } }));
}
async function nbLoadPages(){ const r=await nbTx("pages","readonly",s=>s.getAll()); const a=r===undefined?[...NB.mem.pages.values()]:r; NB.ok=NB.db!==false; return a.sort((x,y)=>y.t-x.t); }
async function nbPut(page){ if(NB.db===false){ NB.mem.pages.set(page.id,page); return; } const r=await nbTx("pages","readwrite",s=>{ s.put(page); }); if(r===undefined) NB.mem.pages.set(page.id,page); }
async function nbDelPage(id){ NB.mem.pages.delete(id); await nbTx("pages","readwrite",s=>{ s.delete(id); }); const ms=await nbMediaOf(id); for(const m of ms) await nbDelMedia(m.id); }
async function nbPutMedia(m){ if(NB.db===false){ NB.mem.media.set(m.id,m); return true; } const r=await nbTx("media","readwrite",s=>{ s.put(m); }); if(r===undefined){ NB.mem.media.set(m.id,m); return false; } return true; }
async function nbMediaOf(pid){ const r=await nbTx("media","readonly",s=>s.index("page").getAll(pid)); const a=r===undefined?[...NB.mem.media.values()].filter(m=>m.page===pid):r; return a.sort((x,y)=>x.t-y.t); }
async function nbDelMedia(id){ NB.mem.media.delete(id); await nbTx("media","readwrite",s=>{ s.delete(id); }); }
const nbId=()=>"n"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
function nbNewPage(){ return {id:nbId(),title:"",t:Date.now(),strokes:[],texts:[],imgs:[],hf:nbDefHf(),paper:"lined"}; }
function nbDirty(){ clearTimeout(NB.saveT); NB.saveT=setTimeout(nbSave,500); }
async function nbSave(){ clearTimeout(NB.saveT); const p=NB.cur; if(!p) return; p.strokes=NB.strokes; p.texts=NB.texts; p.t=Date.now(); await nbPut(p); nbStatus(NB.db===false?"الملاحظات تُحفظ لهذه الجلسة فقط: المتصفح لا يسمح بالتخزين الدائم.":""); }
document.addEventListener("visibilitychange",()=>{ if(document.hidden&&NB.cur&&NB.root&&NB.root.isConnected) nbSave(); });

/* ---- screen ---- */
function nbCss(){
  if(document.getElementById("nbCss")) return; const st=document.createElement("style"); st.id="nbCss";
  st.textContent=`.nb{display:grid;gap:var(--s4)}.nbBar,.nbTools,.nbRecBar{display:flex;flex-wrap:wrap;gap:var(--s2);align-items:center}
.nbBar select,.nbBar input{min-height:40px;border:1px solid var(--line);background:var(--panel);color:var(--ink);border-radius:var(--r);padding:6px 12px;font:inherit}.nbBar input{flex:1 1 160px;min-width:0}
.nbTools .btn,.nbBar .btn,.nbRecBar .btn{min-height:40px;padding:6px 12px;font-size:var(--fs-sm)}
.nbTools .btn[aria-pressed="true"],.nbTools .btn.on{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
.nbSw{display:inline-flex;gap:6px;padding:4px;border:1px solid var(--line);border-radius:999px;background:var(--panel)}
.nbSw button{width:36px;height:36px;border-radius:50%;border:2px solid transparent;padding:0;background:var(--c);box-shadow:inset 0 0 0 1px rgb(255 255 255/.25)}.nbSw button[aria-checked="true"]{border-color:var(--accent);outline:2px solid var(--ink);outline-offset:1px}
.nbSz{display:inline-flex;gap:4px}.nbSz button{width:40px;height:40px;border-radius:50%;border:1px solid var(--line);background:var(--panel);display:grid;place-items:center;padding:0}.nbSz button[aria-checked="true"]{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 18%,var(--panel))}.nbSz i{display:block;border-radius:50%;background:var(--ink)}
.nbBoard{position:relative;width:100%;max-width:980px;aspect-ratio:4/3;border:1px solid var(--line);border-radius:var(--r-lg);background:var(--panel2) linear-gradient(var(--line) 1px,transparent 1px) 0 0/100% var(--nbL,7.5%);overflow:hidden;container-type:inline-size;touch-action:none}
.nbBoard[data-paper="grid"]{background:linear-gradient(var(--line) 1px,transparent 1px) 0 0/100% var(--nbL,7.5%),linear-gradient(90deg,var(--line) 1px,transparent 1px) 0 0/5.625% 100%,var(--panel2)}.nbBoard[data-paper="blank"]{background:var(--panel2)}
.nbImgs{position:absolute;inset:0;pointer-events:none}.nbImgs img{position:absolute;height:auto;border-radius:4px;-webkit-user-select:none;user-select:none}
.nbLen{display:inline-flex;align-items:center;gap:6px;padding:3px;border:1px solid var(--line);border-radius:999px;background:var(--panel)}.nbLen .btn{min-height:36px;border-radius:999px}.nbLen output{font:600 var(--fs-sm) var(--font-ar);padding:0 6px;white-space:nowrap}
.nbTools select{min-height:40px;border:1px solid var(--line);background:var(--panel);color:var(--ink);border-radius:999px;padding:6px 12px;font:inherit;font-size:var(--fs-sm)}.nbTh{width:72px;height:54px;object-fit:cover;border-radius:var(--r-sm);background:#000}
.nbBoard canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:crosshair}.nbBoard.t canvas{cursor:text}
.nbT{position:absolute;display:grid;grid-template-columns:1fr auto;grid-template-rows:auto 1fr;min-width:12%;max-width:80%;border:1px dashed color-mix(in srgb,var(--ink) 35%,transparent);border-radius:var(--r-sm);background:color-mix(in srgb,var(--bg) 55%,transparent)}
.nbT:focus-within{border-style:solid;border-color:var(--accent)}.nbT textarea{grid-column:1/3;resize:none;border:0;background:transparent;color:var(--c,var(--ink));font:600 var(--fz,3.4cqw)/1.35 var(--font-ar);padding:2px 6px;min-height:1.6em;overflow:hidden;outline:none;width:100%}
.nbT .h,.nbT .x{border:0;background:transparent;color:var(--muted);font-size:15px;line-height:1;padding:4px 10px;min-height:32px;min-width:32px;cursor:grab}.nbT .x{cursor:pointer}.nbT .h:focus-visible,.nbT .x:focus-visible{outline:2px solid var(--accent)}
.nbRec{display:grid;gap:var(--s3);border:1px solid var(--line);border-radius:var(--r-lg);background:var(--panel);padding:var(--s3) var(--s4)}.nbRec h3{margin:0;font-size:var(--fs-md)}
.nbRecBar .btn.rec{border-color:var(--power);color:var(--power)}.nbRecBar .btn.rec[aria-pressed="true"]{background:var(--power);color:#fff;border-color:var(--power)}
.nbTime{font:600 15px var(--font-mono);direction:ltr;min-width:5ch}.nbPrev{width:100%;max-width:420px;border-radius:var(--r);background:#000;aspect-ratio:4/3}.nbPrev[hidden]{display:none}
.nbList{display:grid;gap:var(--s2);list-style:none;margin:0;padding:0}.nbList li{display:grid;gap:6px;border:1px solid var(--line);border-radius:var(--r);padding:8px 10px;background:var(--bg)}.nbList .m{display:flex;gap:8px;align-items:center;justify-content:space-between;font-size:var(--fs-sm);color:var(--muted)}
.nbList audio{width:100%}.nbList video{width:100%;max-width:420px;border-radius:var(--r-sm);background:#000}.nbNote{font-size:var(--fs-sm);color:var(--muted);margin:0}.nbWarn{color:var(--fuel)}
.nbFile{display:inline-flex}.nbFile .btn{gap:6px}.nbFile input{position:absolute;width:1px;height:1px;opacity:0}.nbFile:focus-within .btn{outline:2.5px solid var(--accent);outline-offset:2px}.nbPngDlg{position:fixed;inset:0;z-index:2147483100;background:rgba(0,0,0,.72);display:grid;place-items:center;padding:var(--s4)}.nbPngBox{background:var(--panel);border:1px solid var(--line);border-radius:var(--r-xl);padding:var(--s4);width:min(900px,100%);max-height:100%;overflow:auto;display:grid;gap:var(--s3)}.nbPngBox img{width:100%;height:auto;border-radius:var(--r);background:var(--panel2);-webkit-touch-callout:default;user-select:auto}.nbPngAct{display:flex;flex-wrap:wrap;gap:var(--s2)}.nbPngAct .btn{min-height:40px}`;
  document.head.appendChild(st);
}
const nbIco=p=>`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
function nbHTML(){
  nbCss();
  const sw=NB_COLORS.map(([c,n])=>`<button type="button" role="radio" aria-checked="${c===NB.color}" aria-label="${n}" data-nbc="${c}" style="--c:${c}"></button>`).join("");
  const sz=NB_SIZES.map(([v,n])=>`<button type="button" role="radio" aria-checked="${v===NB.size}" aria-label="${n}" data-nbs="${v}"><i style="width:${v+3}px;height:${v+3}px"></i></button>`).join("");
  return `<div class="nb" id="nb">
    <div class="nbBar"><label class="sr" for="nbPick">الصفحة</label><select id="nbPick"></select><label class="sr" for="nbTitle">عنوان الصفحة</label><input id="nbTitle" type="text" maxlength="60" placeholder="عنوان الصفحة (اختياري)" autocomplete="off">
      <button type="button" class="btn" id="nbNew">${nbIco('<path d="M12 5v14M5 12h14"/>')} صفحة جديدة</button><button type="button" class="btn" id="nbDel">${nbIco('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3"/>')} حذف الصفحة</button></div>
    <div class="nbTools" role="toolbar" aria-label="أدوات الدفتر">
      <button type="button" class="btn" data-nbt="pen" aria-pressed="true">${nbIco('<path d="M4 20l4-1 11-11-3-3L5 16z"/>')} قلم</button>
      <button type="button" class="btn" data-nbt="hi" aria-pressed="false">${nbIco('<path d="M5 17l4 3 9-9-4-4zM14 7l3-3 3 3-3 3"/>')} تظليل</button>
      <button type="button" class="btn" data-nbt="er" aria-pressed="false">${nbIco('<path d="M7 20h10M5 15l8-8 6 6-5 5H8z"/>')} ممحاة</button>
      <button type="button" class="btn" data-nbt="tx" aria-pressed="false">${nbIco('<path d="M5 6V4h14v2M12 4v16M9 20h6"/>')} نص</button>
      <span class="nbSw" role="radiogroup" aria-label="اللون">${sw}</span><span class="nbSz" role="radiogroup" aria-label="السمك">${sz}</span>
      <button type="button" class="btn" id="nbUndo">${nbIco('<path d="M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3"/>')} تراجع</button><button type="button" class="btn" id="nbRedo">${nbIco('<path d="M15 14l5-5-5-5M20 9H9a5 5 0 0 0 0 10h3"/>')} إعادة</button>
      <button type="button" class="btn" id="nbClr">مسح الرسم</button><button type="button" class="btn" id="nbPng">${nbIco('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>')} تنزيل صورة</button>
      <label class="nbFile"><input type="file" accept="image/*" id="nbImg"><span class="btn">${nbIco('<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M4 18l5-5 4 4 3-3 4 4"/>')} إدراج صورة</span></label>
      <span class="nbLen" role="group" aria-label="طول الصفحة"><button type="button" class="btn" id="nbLess" aria-label="أسطر أقل">−</button><output id="nbLines" aria-live="polite"></output><button type="button" class="btn" id="nbMore" aria-label="أسطر أكثر">＋ أسطر</button></span>
      <label class="sr" for="nbPaper">نوع الورق</label><select id="nbPaper"><option value="lined">ورق مسطّر</option><option value="grid">ورق مربعات</option><option value="blank">ورق فارغ</option></select></div>
    <div class="nbBoard" id="nbBoard"><div class="nbImgs" id="nbImgs"></div><canvas id="nbInk" role="img" aria-label="لوحة الرسم. للكتابة استعمل أداة «نص»: النصوص تقرؤها قارئات الشاشة."></canvas></div>
    <p class="nbNote" id="nbSt" role="status"></p>
    <section class="nbRec" aria-labelledby="nbRecH"><h3 id="nbRecH">مرفقات الصفحة: تسجيلات وصور</h3>
      <div class="nbRecBar"><button type="button" class="btn rec" id="nbRA" aria-pressed="false">${nbIco('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>')} <span>تسجيل صوت</span></button>
        <button type="button" class="btn rec" id="nbRV" aria-pressed="false">${nbIco('<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>')} <span>تسجيل فيديو</span></button>
        <button type="button" class="btn" id="nbCam" hidden>${nbIco('<path d="M4 10V7a1 1 0 0 1 1-1h3M20 14v3a1 1 0 0 1-1 1h-3M16 6h3a1 1 0 0 1 1 1v3M8 18H5a1 1 0 0 1-1-1v-3"/>')} قلب الكاميرا</button>
        <output class="nbTime" id="nbTime" aria-live="off">00:00</output></div>
      <video class="nbPrev" id="nbPrev" muted playsinline hidden aria-label="معاينة الكاميرا"></video>
      <div id="nbFall" class="nbNote" hidden></div>
      <ul class="nbList" id="nbList" aria-label="المرفقات المحفوظة"></ul>
      <p class="nbNote">كل شي يتخزّن على جهازك فقط ولا يطلع منه.</p></section></div>`;
}
const nbSelf=()=>NB.root&&NB.root.isConnected;
function nbStatus(t,info){ NB.msg=t; const e=document.getElementById("nbSt"); if(e){ e.textContent=t; e.classList.toggle("nbWarn",!!t&&!info); } }
async function nbMount(root){
  try{ nbRecStop(); }catch(e){}
  NB.root=root.querySelector("#nb"); NB.cv=root.querySelector("#nbInk"); NB.dpr=Math.min(2,window.devicePixelRatio||1);
  const pages=await nbLoadPages(); if(!nbSelf()) return; NB.pages=pages;
  if(!pages.length){ const p=nbNewPage(); NB.pages=[p]; await nbPut(p); }
  nbBind(root); nbOpen(NB.pages[0]);
  if(NB.db===false) nbStatus("الملاحظات تُحفظ لهذه الجلسة فقط: المتصفح لا يسمح بالتخزين الدائم.");
  try{ if(navigator.storage&&navigator.storage.persist) navigator.storage.persist(); }catch(e){}
}
function nbFillPick(){
  const s=document.getElementById("nbPick"); if(!s) return; const f=new Intl.DateTimeFormat(document.documentElement.lang==="en"?"en":"ar",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
  s.innerHTML=NB.pages.map(p=>`<option value="${p.id}"${NB.cur&&p.id===NB.cur.id?" selected":""}>${(p.title||"").replace(/[<&]/g,"")||f.format(new Date(p.t))}</option>`).join("");
}
function nbOpen(p){
  NB.cur=p; NB.strokes=(p.strokes||[]).slice(); NB.redo=[]; NB.texts=(p.texts||[]).map(t=>Object.assign({},t)); nbFillPick();
  const ti=document.getElementById("nbTitle"); if(ti) ti.value=p.title||""; nbApplyPage(); nbSize(); nbDrawAll(); nbRenderTexts(); nbLoadMedia();
}
/* the page's own length and paper on the board element */
function nbApplyPage(){
  const b=document.getElementById("nbBoard"), p=NB.cur; if(!b||!p) return; const hf=nbHf(), paper=p.paper||"lined";
  b.style.aspectRatio="4 / "+(3*hf); b.dataset.paper=paper; b.style.setProperty("--nbL",(NB_LINE/hf*100)+"%");
  const o=document.getElementById("nbLines"); if(o) o.textContent="الأسطر: "+nbLines(hf); const ps=document.getElementById("nbPaper"); if(ps) ps.value=paper;
  const l=document.getElementById("nbLess"), m=document.getElementById("nbMore"); if(l) l.disabled=hf<=1; if(m) m.disabled=hf>=NB_HF_MAX;
}
/* the lowest thing on the page, in base heights */
function nbBottom(){ let b=0; NB.strokes.forEach(s=>{ if(s.t!=="er") s.p.forEach(q=>{ if(q[1]>b) b=q[1]; }); }); NB.texts.forEach(t=>{ b=Math.max(b,t.y+0.08); }); ((NB.cur&&NB.cur.imgs)||[]).forEach(i=>{ b=Math.max(b,i.y+i.w*NB_AR/i.ar); }); return b; }
function nbSetHf(v,auto){
  const p=NB.cur; if(!p) return false; v=Math.max(1,Math.min(NB_HF_MAX,Math.round(v*2)/2)); const cur=nbHf(); if(v===cur) return false;
  if(v<cur&&nbBottom()>v-0.02){ nbStatus("آخر الأسطر بيها رسم أو كتابة أو صورة: امسحها أولاً حتى تقدر تقصّر الصفحة."); return false; }
  p.hf=v; nbApplyPage(); nbSize(); nbDrawAll(); nbRenderTexts(); nbRenderImgs(); nbDirty(); nbStatus(auto?"وصلت آخر الصفحة: انضافت أسطر جديدة.":"",true); return true;
}
/* writing or drawing in the last lines makes the page longer by itself (endless paper, up to the maximum) */
function nbGrow(y){ if(y>nbHf()-0.12&&nbHf()<NB_HF_MAX) nbSetHf(nbHf()+0.5,true); }
/* ---- board ---- */
function nbSize(){
  const c=NB.cv; if(!c) return; const w=c.clientWidth||c.parentNode.clientWidth||600, h=w/NB_AR*nbHf(); let d=NB.dpr; if(w*h*d*d>9e6) d=Math.sqrt(9e6/(w*h));   /* a long page on a sharp screen: cap the canvas at 9 megapixels */
  const W=Math.round(w*d), H=Math.round(h*d); if(c.width!==W||c.height!==H){ c.width=W; c.height=H; }
}
function nbStroke(g,s,W,H){
  const k=W/1000; g.save(); g.lineCap=g.lineJoin="round"; g.lineWidth=s.w*k*(s.t==="hi"?2.4:1); g.strokeStyle=s.c; g.globalAlpha=s.t==="hi"?0.38:1; g.globalCompositeOperation=s.t==="er"?"destination-out":"source-over";
  const p=s.p; if(!p.length){ g.restore(); return; } g.beginPath(); g.moveTo(p[0][0]*W,p[0][1]*H);
  if(p.length===1){ g.lineTo(p[0][0]*W+0.01,p[0][1]*H); } else { for(let i=1;i<p.length-1;i++){ const mx=(p[i][0]+p[i+1][0])/2*W, my=(p[i][1]+p[i+1][1])/2*H; g.quadraticCurveTo(p[i][0]*W,p[i][1]*H,mx,my); } const q=p[p.length-1]; g.lineTo(q[0]*W,q[1]*H); }
  g.stroke(); g.restore();
}
function nbDrawAll(){ const c=NB.cv; if(!c) return; const g=c.getContext("2d"), hb=c.width/NB_AR; g.clearRect(0,0,c.width,c.height); NB.strokes.forEach(s=>nbStroke(g,s,c.width,hb)); if(NB.drawing) nbStroke(g,NB.drawing,c.width,hb); }   /* hb: the BASE height in canvas pixels */
function nbPt(e){ const r=NB.cv.getBoundingClientRect(); return [Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)),Math.min(nbHf(),Math.max(0,(e.clientY-r.top)/(r.width/NB_AR)))]; }
function nbDown(e){
  if(e.button>0&&e.pointerType==="mouse") return; const pt=nbPt(e);
  if(NB.tool==="tx"){ e.preventDefault(); nbAddText(pt); return; }
  e.preventDefault(); NB.cv.setPointerCapture(e.pointerId); NB.drawing={t:NB.tool,c:NB.color,w:NB.tool==="er"?NB.size*3:NB.size,p:[pt]}; NB.pid=e.pointerId; nbDrawAll();
}
function nbMove(e){
  if(!NB.drawing||e.pointerId!==NB.pid) return; const evs=e.getCoalescedEvents?e.getCoalescedEvents():[e], p=NB.drawing.p, W=NB.cv.getBoundingClientRect().width;
  (evs.length?evs:[e]).forEach(ev=>{ const q=nbPt(ev), l=p[p.length-1]; if(Math.hypot((q[0]-l[0])*W,(q[1]-l[1])*W/NB_AR)>1.6) p.push(q); }); nbDrawAll();
}
function nbUp(e){
  if(!NB.drawing||e.pointerId!==NB.pid) return; const s=NB.drawing; NB.drawing=null; NB.strokes.push(s); NB.redo=[]; nbDrawAll(); nbDirty(); nbButtons(); if(s.t!=="er") nbGrow(Math.max.apply(null,s.p.map(q=>q[1])));
}
function nbButtons(){ const u=document.getElementById("nbUndo"), r=document.getElementById("nbRedo"); if(u) u.disabled=!NB.strokes.length; if(r) r.disabled=!NB.redo.length; }
/* ---- text boxes ---- */
function nbAddText(pt){
  const t={id:nbId(),x:Math.min(0.78,pt[0]),y:Math.min(nbHf()-0.1,pt[1]),w:0.34,c:NB.color,s:3.4,v:""}; NB.texts.push(t); nbDirty(); nbGrow(t.y+0.1); nbRenderTexts(t.id);
}
function nbRenderTexts(focusId){
  const b=document.getElementById("nbBoard"); if(!b) return; b.querySelectorAll(".nbT").forEach(e=>e.remove()); const hf=nbHf(), top=t=>t.y/hf*100+"%";   /* y is in base heights */
  NB.texts.forEach(t=>{ const d=document.createElement("div"); d.className="nbT"; d.dataset.id=t.id; d.style.cssText=`left:${t.x*100}%;top:${top(t)};width:${t.w*100}%;--c:${t.c};--fz:${t.s}cqw`;
    d.innerHTML=`<button type="button" class="h" aria-label="تحريك النص: اسحبه، أو استعمل الأسهم" title="تحريك">⠿</button><button type="button" class="x" aria-label="حذف هذا النص" title="حذف">×</button><textarea rows="1" aria-label="نص الملاحظة" placeholder="اكتب هنا"></textarea>`;
    const ta=d.querySelector("textarea"); ta.value=t.v; const fit=()=>{ ta.style.height="auto"; ta.style.height=ta.scrollHeight+"px"; };
    ta.addEventListener("input",()=>{ t.v=ta.value; fit(); nbDirty(); }); b.appendChild(d); fit();
    d.querySelector(".x").addEventListener("click",()=>{ NB.texts=NB.texts.filter(q=>q!==t); d.remove(); nbDirty(); });
    const h=d.querySelector(".h"); let drag=null;
    h.addEventListener("pointerdown",e=>{ e.preventDefault(); h.setPointerCapture(e.pointerId); const r=b.getBoundingClientRect(); drag={dx:(e.clientX-r.left)/r.width-t.x,dy:(e.clientY-r.top)/(r.width/NB_AR)-t.y,id:e.pointerId}; });
    h.addEventListener("pointermove",e=>{ if(!drag||e.pointerId!==drag.id) return; const r=b.getBoundingClientRect(); t.x=Math.min(0.9,Math.max(0,(e.clientX-r.left)/r.width-drag.dx)); t.y=Math.min(hf-0.05,Math.max(0,(e.clientY-r.top)/(r.width/NB_AR)-drag.dy)); d.style.left=t.x*100+"%"; d.style.top=top(t); });
    ["pointerup","pointercancel"].forEach(ev=>h.addEventListener(ev,()=>{ if(drag){ drag=null; nbDirty(); } }));
    h.addEventListener("keydown",e=>{ const m={ArrowLeft:[-0.02,0],ArrowRight:[0.02,0],ArrowUp:[0,-0.02],ArrowDown:[0,0.02]}[e.key]; if(!m) return; e.preventDefault(); t.x=Math.min(0.9,Math.max(0,t.x+m[0])); t.y=Math.min(hf-0.05,Math.max(0,t.y+m[1])); d.style.left=t.x*100+"%"; d.style.top=top(t); nbDirty(); });
    if(focusId===t.id) setTimeout(()=>ta.focus(),0); });
}
/* ---- PNG ---- */
function nbExport(){
  const hf=nbHf(), paper=(NB.cur&&NB.cur.paper)||"lined", W=hf>4?1200:1600, Hb=W/NB_AR, H=Math.round(Hb*hf), c=document.createElement("canvas"); c.width=W; c.height=H; const g=c.getContext("2d");   /* Hb: one base page */
  g.fillStyle="#18181B"; g.fillRect(0,0,W,H); g.strokeStyle="rgba(255,255,255,0.06)"; g.lineWidth=2;
  if(paper!=="blank") for(let y=Hb*NB_LINE;y<H;y+=Hb*NB_LINE){ g.beginPath(); g.moveTo(0,y); g.lineTo(W,y); g.stroke(); }
  if(paper==="grid") for(let x=Hb*NB_LINE;x<W;x+=Hb*NB_LINE){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,H); g.stroke(); }
  document.querySelectorAll("#nbImgs img").forEach(im=>{ const q=((NB.cur&&NB.cur.imgs)||[]).find(i=>i.id===im.dataset.id); if(q&&im.complete&&im.naturalWidth){ try{ g.drawImage(im,q.x*W,q.y*Hb,q.w*W,q.w*W/q.ar); }catch(e){} } });
  const ink=document.createElement("canvas"); ink.width=W; ink.height=H; const gi=ink.getContext("2d"); NB.strokes.forEach(s=>nbStroke(gi,s,W,Hb)); g.drawImage(ink,0,0);
  NB.texts.forEach(t=>{ g.fillStyle=t.c; g.font=`600 ${t.s/100*W}px sans-serif`; g.textBaseline="top"; g.direction=document.documentElement.dir==="ltr"?"ltr":"rtl"; const lh=t.s/100*W*1.35, mw=t.w*W; let y=t.y*Hb+4;
    String(t.v).split("\n").forEach(line=>{ let cur=""; line.split(" ").forEach(wd=>{ const tr=cur?cur+" "+wd:wd; if(g.measureText(tr).width>mw&&cur){ g.textAlign=g.direction==="rtl"?"right":"left"; g.fillText(cur,g.direction==="rtl"?t.x*W+mw:t.x*W,y); y+=lh; cur=wd; } else cur=tr; }); g.textAlign=g.direction==="rtl"?"right":"left"; g.fillText(cur,g.direction==="rtl"?t.x*W+mw:t.x*W,y); y+=lh; }); });
  c.toBlob(b=>{ if(!b) return; nbShowPng(URL.createObjectURL(b)); },"image/png");
}
/* the exported page opens in a small dialog: a download link, and the picture itself to press-and-hold (inside the Claude artifact viewer, and in some phone browsers, a plain download does nothing) */
function nbShowPng(url){
  const old=document.getElementById("nbPngDlg"); if(old) old.remove();
  const d=document.createElement("div"); d.id="nbPngDlg"; d.className="nbPngDlg"; d.setAttribute("role","dialog"); d.setAttribute("aria-modal","true"); d.setAttribute("aria-label","صورة الصفحة");
  d.innerHTML=`<div class="nbPngBox"><img alt="صورة الدفتر المصدّرة" src="${url}"><p class="status">إذا ما نزل الملف (بعض الصفحات والمتصفحات لا تسمح بالتنزيل): اضغط مطوّلاً على الصورة واختر حفظ الصورة.</p><div class="nbPngAct"><a class="btn pri" id="nbPngDl" download="birjis-note.png" href="${url}">تنزيل</a><button type="button" class="btn" id="nbPngX">إغلاق</button></div></div>`;
  document.body.appendChild(d);
  const close=()=>{ d.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000); try{ const b=document.getElementById("nbPng"); if(b) b.focus(); }catch(e){} };
  d.querySelector("#nbPngX").addEventListener("click",close); d.addEventListener("click",e=>{ if(e.target===d) close(); });
  d.addEventListener("keydown",e=>{ if(e.key==="Escape"){ e.preventDefault(); e.stopPropagation(); close(); } else if(e.key==="Tab"){ const a=d.querySelector("#nbPngDl"), x=d.querySelector("#nbPngX"), on=document.activeElement; if(e.shiftKey&&on===a){ e.preventDefault(); x.focus(); } else if(!e.shiftKey&&on===x){ e.preventDefault(); a.focus(); } } });
  d.querySelector("#nbPngDl").focus();
}
/* ---- recordings ---- */
function nbMime(kind){ const c=kind==="video"?["video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm","video/mp4"]:["audio/webm;codecs=opus","audio/webm","audio/mp4","audio/ogg;codecs=opus"]; try{ return c.find(m=>MediaRecorder.isTypeSupported(m))||""; }catch(e){ return ""; } }
const nbFmt=s=>String(Math.floor(s/60)).padStart(2,"0")+":"+String(Math.floor(s%60)).padStart(2,"0");
async function nbRecStart(kind){
  if(NB.rec) return nbRecStop();
  const fall=document.getElementById("nbFall"); fall.hidden=true;
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||typeof MediaRecorder==="undefined") return nbRecFallback(kind,"unsupported");
  let stream; try{ stream=await navigator.mediaDevices.getUserMedia(kind==="video"?{video:{facingMode:NB.facing},audio:true}:{audio:true}); }catch(e){ return nbRecFallback(kind,e&&e.name||"error"); }
  if(!nbSelf()){ stream.getTracks().forEach(t=>t.stop()); return; }
  const mt=nbMime(kind); let rec; try{ rec=new MediaRecorder(stream,mt?{mimeType:mt}:undefined); }catch(e){ stream.getTracks().forEach(t=>t.stop()); return nbRecFallback(kind,"unsupported"); }
  const R=NB.rec={rec,stream,kind,chunks:[],t0:Date.now(),page:NB.cur.id,mime:rec.mimeType||mt||(kind==="video"?"video/webm":"audio/webm"),tick:0};
  rec.ondataavailable=e=>{ if(e.data&&e.data.size) R.chunks.push(e.data); };
  rec.onstop=async()=>{ clearInterval(R.tick); stream.getTracks().forEach(t=>t.stop()); const dur=Math.max(1,Math.round((Date.now()-R.t0)/1000)); NB.rec=null; nbRecUI(false);
    const blob=new Blob(R.chunks,{type:R.mime}); if(blob.size){ const m={id:nbId(),page:R.page,kind:R.kind,mime:R.mime,blob,dur,t:Date.now()}; const ok=await nbPutMedia(m); if(nbSelf()&&NB.cur&&NB.cur.id===R.page){ nbLoadMedia(); } if(!ok) nbStatus("تعذّر حفظ التسجيل بشكل دائم؛ يبقى حتى تغلق الصفحة."); } };
  const pv=document.getElementById("nbPrev"); if(kind==="video"){ pv.srcObject=stream; pv.hidden=false; pv.play().catch(()=>{}); document.getElementById("nbCam").hidden=false; }
  rec.start(1000); nbRecUI(true,kind);
  R.tick=setInterval(()=>{ const s=(Date.now()-R.t0)/1000, o=document.getElementById("nbTime"); if(o) o.textContent=nbFmt(s); if(s>=NB_MAXREC[kind]) nbRecStop(); },500);
}
function nbRecStop(){ const R=NB.rec; if(!R) return; try{ if(R.rec.state!=="inactive") R.rec.stop(); }catch(e){ R.stream.getTracks().forEach(t=>t.stop()); NB.rec=null; nbRecUI(false); } }
function nbRecUI(on,kind){
  const a=document.getElementById("nbRA"), v=document.getElementById("nbRV"); if(!a) return;
  a.setAttribute("aria-pressed",on&&kind==="audio"); v.setAttribute("aria-pressed",on&&kind==="video"); a.querySelector("span").textContent=on&&kind==="audio"?"إيقاف التسجيل":"تسجيل صوت"; v.querySelector("span").textContent=on&&kind==="video"?"إيقاف التسجيل":"تسجيل فيديو";
  a.disabled=on&&kind==="video"; v.disabled=on&&kind==="audio"; if(!on){ const pv=document.getElementById("nbPrev"); pv.hidden=true; pv.srcObject=null; document.getElementById("nbCam").hidden=true; document.getElementById("nbTime").textContent="00:00"; }
  nbStatus(on?(kind==="video"?"جارٍ تسجيل الفيديو…":"جارٍ تسجيل الصوت…"):"");
}
const NB_FALL={ /* whole sentences (the English layer translates whole strings) */
  denied:{audio:"المتصفح أو الصفحة المضمّنة منعت المايكروفون.",video:"المتصفح أو الصفحة المضمّنة منعت الكاميرا."},
  none:{audio:"ما لقيت مايكروفون بهذا الجهاز.",video:"ما لقيت كاميرا بهذا الجهاز."},
  other:{audio:"التسجيل المباشر غير متاح هنا.",video:"التسجيل المباشر غير متاح هنا."}};
function nbRecFallback(kind,why){
  const f=document.getElementById("nbFall"); if(!f) return; const k=/NotAllowed|Security|Permission/i.test(why)?"denied":/NotFound|Overconstrained/i.test(why)?"none":"other";
  f.hidden=false; f.innerHTML=`<span class="nbWarn">${NB_FALL[k][kind]}</span> <span>تقدر تسجّل بتطبيق جهازك وتختار الملف:</span> <label class="nbFile"><input type="file" accept="${kind}/*" capture id="nbFile"><span class="btn">${kind==="video"?"تصوير أو اختيار فيديو":"تسجيل أو اختيار ملف صوتي"}</span></label>`;
  f.querySelector("#nbFile").addEventListener("change",async e=>{ const fl=e.target.files&&e.target.files[0]; if(!fl) return; const m={id:nbId(),page:NB.cur.id,kind,mime:fl.type||(kind+"/mp4"),blob:fl,dur:0,t:Date.now()}; await nbPutMedia(m); nbLoadMedia(); f.hidden=true; });
}
async function nbLoadMedia(){
  NB.urls.forEach(u=>URL.revokeObjectURL(u)); NB.urls=[]; const ul=document.getElementById("nbList"); if(!ul||!NB.cur) return; const ms=await nbMediaOf(NB.cur.id); if(!nbSelf()) return; NB.media=ms;
  const f=new Intl.DateTimeFormat(document.documentElement.lang==="en"?"en":"ar",{hour:"2-digit",minute:"2-digit"});
  ul.innerHTML=""; NB.murl={}; if(!ms.length){ ul.innerHTML=`<li class="nbNote">لا توجد مرفقات بهذه الصفحة بعد.</li>`; nbRenderImgs(); return; }
  ms.forEach((m,i)=>{ const url=URL.createObjectURL(m.blob); NB.urls.push(url); NB.murl[m.id]=url; const li=document.createElement("li"), ext=(m.mime.split(";")[0].split("/")[1]||"webm").replace("x-",""), wd=m.kind==="video"?"فيديو":m.kind==="image"?"صورة":"صوت", nm=wd+" "+(i+1);
    li.innerHTML=`<div class="m"><span><span>${wd}</span> ${i+1} · ${f.format(new Date(m.t))}${m.dur?" · "+nbFmt(m.dur):""}</span><span><a class="btn" download="birjis-${m.kind}-${i+1}.${ext}" href="${url}">تنزيل</a> <button type="button" class="btn" data-nbdel="${m.id}">حذف</button></span></div>${m.kind==="video"?`<video controls playsinline preload="metadata" src="${url}" aria-label="${nm}"></video>`:m.kind==="image"?`<img class="nbTh" src="${url}" alt="${nm}">`:`<audio controls preload="metadata" src="${url}" aria-label="${nm}"></audio>`}`; ul.appendChild(li); });
  nbRenderImgs();
}
/* ---- pictures (v37) ---- */
/* the pictures of the page lie under the ink, so they can be drawn over; x and width in page widths, y in base heights, like everything else */
function nbRenderImgs(){
  const box=document.getElementById("nbImgs"); if(!box) return; box.innerHTML=""; const hf=nbHf();
  ((NB.cur&&NB.cur.imgs)||[]).forEach(im=>{ const url=NB.murl[im.id]; if(!url) return; const e=document.createElement("img"); e.alt=im.alt||"صورة مدرجة بالصفحة"; e.src=url; e.draggable=false; e.dataset.id=im.id; e.style.cssText=`left:${im.x*100}%;top:${im.y/hf*100}%;width:${im.w*100}%`; box.appendChild(e); });
}
/* any picture file -> at most 1600 px wide JPEG (or the file itself when it is small and a web format) and its aspect ratio */
async function nbImgPrep(blob){
  let w=0, h=0, src=null; try{ src=await createImageBitmap(blob); w=src.width; h=src.height; }catch(e){ src=null; }
  if(!src){ try{ src=await new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=URL.createObjectURL(blob); }); w=src.naturalWidth; h=src.naturalHeight; }catch(e){ return null; } }
  if(!w||!h) return null; const k=Math.min(1,1600/w); let out=blob;
  if(k<1||!/^image\/(jpeg|png|webp)$/.test(blob.type||"")){ const c=document.createElement("canvas"); c.width=Math.max(1,Math.round(w*k)); c.height=Math.max(1,Math.round(h*k)); c.getContext("2d").drawImage(src,0,0,c.width,c.height); out=await new Promise(r=>c.toBlob(r,"image/jpeg",0.86)); if(!out) return null; }
  return {blob:out,ar:w/h};
}
/* a picture into the open page: under what is already there, almost the full width; the page grows to hold it */
async function nbAddImage(file,alt){
  const p=NB.cur; if(!p) return false; const q=await nbImgPrep(file); if(!q){ nbStatus("ما قدرت أقرأ هذا الملف كصورة."); return false; }
  const w=0.92, x=0.04, y=Math.max(0.03,nbBottom()+0.04), need=Math.ceil((y+w*NB_AR/q.ar+0.3)*2)/2;
  if(need>NB_HF_MAX){ nbStatus("الصفحة وصلت أقصى طولها: افتح صفحة جديدة لهذه الصورة."); return false; }
  const m={id:nbId(),page:p.id,kind:"image",mime:q.blob.type||"image/jpeg",blob:q.blob,dur:0,t:Date.now()}, ok=await nbPutMedia(m);
  (p.imgs=p.imgs||[]).push({id:m.id,x,y,w,ar:q.ar,alt:alt||""}); if(need>nbHf()) p.hf=need; await nbSave(); if(!nbSelf()||NB.cur!==p) return true;
  nbApplyPage(); nbSize(); nbDrawAll(); nbRenderTexts(); await nbLoadMedia(); nbStatus(ok?"":"تعذّر حفظ الصورة بشكل دائم؛ تبقى حتى تغلق الصفحة."); return true;
}
/* a new page that starts with one picture across its top; works whether or not the notebook tab is open (the 3D viewer's «للدفتر» button) */
async function nbPageFromImage(blob,title,ar,alt){
  const p=nbNewPage(), m={id:nbId(),page:p.id,kind:"image",mime:blob.type||"image/jpeg",blob,dur:0,t:Date.now()}; p.title=(title||"").slice(0,60);
  p.imgs=[{id:m.id,x:0,y:0,w:1,ar,alt:alt||""}]; p.hf=Math.min(NB_HF_MAX,Math.max(nbDefHf(),Math.ceil((NB_AR/ar+0.75)*2)/2));
  await nbPutMedia(m); await nbPut(p); return p;
}
/* the 3D view as it is now -> a new notebook page to write and draw on */
async function nbFromView(){
  if(typeof GL==="undefined"||!GL||typeof GL.snap!=="function") return; let c=null; try{ c=GL.snap(1600); }catch(e){ c=null; }
  if(!c){ try{ alert("تعذّر التقاط صورة المجسّم."); }catch(e){} return; }
  const blob=await new Promise(r=>c.toBlob(r,"image/jpeg",0.88)); if(!blob) return;
  const en=document.documentElement.lang==="en", an=S.ac==="a380"?"Airbus A380-800":S.ac==="b747"?"Boeing 747-400":"Boeing 737-800", P=S.sel&&typeof PARTS!=="undefined"&&PARTS[S.sel], pn=P?((en&&P.en)||P.short||P.ar||""):"";
  try{ if(NB.root&&NB.cur) await nbSave(); }catch(e){}
  await nbPageFromImage(blob,pn?pn+" · "+an:an,c.width/c.height,"لقطة من المجسّم الثلاثي الأبعاد"); setTab("notes");
}
document.addEventListener("click",e=>{ const b=e.target&&e.target.closest&&e.target.closest("#bNote"); if(b){ e.preventDefault(); nbFromView(); } });
/* ---- events ---- */
function nbBind(root){
  const q=s=>root.querySelector(s), cv=NB.cv;
  cv.addEventListener("pointerdown",nbDown); cv.addEventListener("pointermove",nbMove); cv.addEventListener("pointerup",nbUp); cv.addEventListener("pointercancel",nbUp);
  try{ new ResizeObserver(()=>{ if(nbSelf()){ nbSize(); nbDrawAll(); } }).observe(q("#nbBoard")); }catch(e){}
  root.querySelectorAll("[data-nbt]").forEach(b=>b.addEventListener("click",()=>{ NB.tool=b.dataset.nbt; root.querySelectorAll("[data-nbt]").forEach(x=>x.setAttribute("aria-pressed",x===b)); q("#nbBoard").classList.toggle("t",NB.tool==="tx"); }));
  root.querySelectorAll("[data-nbc]").forEach(b=>b.addEventListener("click",()=>{ NB.color=b.dataset.nbc; root.querySelectorAll("[data-nbc]").forEach(x=>x.setAttribute("aria-checked",x===b)); if(NB.tool==="er"){ NB.tool="pen"; root.querySelectorAll("[data-nbt]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.nbt==="pen")); } }));
  root.querySelectorAll("[data-nbs]").forEach(b=>b.addEventListener("click",()=>{ NB.size=+b.dataset.nbs; root.querySelectorAll("[data-nbs]").forEach(x=>x.setAttribute("aria-checked",x===b)); }));
  q("#nbUndo").addEventListener("click",()=>{ const s=NB.strokes.pop(); if(s){ NB.redo.push(s); nbDrawAll(); nbDirty(); nbButtons(); } });
  q("#nbRedo").addEventListener("click",()=>{ const s=NB.redo.pop(); if(s){ NB.strokes.push(s); nbDrawAll(); nbDirty(); nbButtons(); } });
  q("#nbClr").addEventListener("click",()=>{ if(!NB.strokes.length) return; if(!confirm("مسح كل الرسم من هذه الصفحة؟ (النصوص والتسجيلات تبقى)")) return; NB.redo=NB.strokes.slice().reverse(); NB.strokes=[]; nbDrawAll(); nbDirty(); nbButtons(); });
  q("#nbPng").addEventListener("click",nbExport);
  q("#nbMore").addEventListener("click",()=>nbSetHf(nbHf()+0.5)); q("#nbLess").addEventListener("click",()=>nbSetHf(nbHf()-0.5));
  q("#nbPaper").addEventListener("change",e=>{ if(!NB.cur) return; NB.cur.paper=e.target.value; nbApplyPage(); nbDirty(); });
  q("#nbImg").addEventListener("change",async e=>{ const f=e.target.files&&e.target.files[0]; e.target.value=""; if(f) await nbAddImage(f); });
  q("#nbNew").addEventListener("click",async()=>{ await nbSave(); const p=nbNewPage(); NB.pages.unshift(p); await nbPut(p); nbOpen(p); });
  q("#nbDel").addEventListener("click",async()=>{ if(!confirm("حذف هذه الصفحة بكل ما فيها (الرسم والنصوص والتسجيلات)؟")) return; const id=NB.cur.id; NB.pages=NB.pages.filter(p=>p.id!==id); await nbDelPage(id); if(!NB.pages.length){ const p=nbNewPage(); NB.pages=[p]; await nbPut(p); } NB.cur=null; nbOpen(NB.pages[0]); });
  q("#nbPick").addEventListener("change",async e=>{ await nbSave(); const p=NB.pages.find(x=>x.id===e.target.value); if(p) nbOpen(p); });
  q("#nbTitle").addEventListener("input",e=>{ NB.cur.title=e.target.value; nbFillPick(); nbDirty(); });
  q("#nbRA").addEventListener("click",()=>nbRecStart("audio")); q("#nbRV").addEventListener("click",()=>nbRecStart("video"));
  q("#nbCam").addEventListener("click",()=>{ const R=NB.rec; if(!R||R.kind!=="video") return; NB.facing=NB.facing==="user"?"environment":"user"; nbRecStop(); setTimeout(()=>nbRecStart("video"),400); });
  q("#nbList").addEventListener("click",async e=>{ const b=e.target.closest("[data-nbdel]"); if(!b) return; const id=b.dataset.nbdel, m=NB.media.find(x=>x.id===id); if(!confirm(m&&m.kind==="image"?"حذف هذه الصورة من الصفحة؟":"حذف هذا التسجيل؟")) return;
    await nbDelMedia(id); if(NB.cur&&NB.cur.imgs&&NB.cur.imgs.some(i=>i.id===id)){ NB.cur.imgs=NB.cur.imgs.filter(i=>i.id!==id); await nbSave(); } nbLoadMedia(); });
  nbButtons();
}
/* leaving the tab: the recording ends and is kept, the page is saved, the playback URLs are released */
function nbLeave(){ if(!NB.root) return; try{ nbRecStop(); }catch(e){} if(NB.cur) nbSave(); NB.urls.forEach(u=>URL.revokeObjectURL(u)); NB.urls=[]; NB.root=null; NB.cv=null; }
