/* ---------- camera: the student photographs a part and the AI engineer identifies and explains it ----------
   A plain <input type="file" capture="environment"> opens the phone camera (the page cannot open the camera by itself).
   The photo is shrunk, sent with sample(prompt,{images:[file]}), and the engineer ends with "PART: <key>" so the page can open that part in 3D.
   Needs the page to declare capabilities {sample:{images:true}} when it is published; sample.limits().images tells whether it is on. */
const CAM={file:null, url:null, busy:false, ctl:null, msgs:[], part:null};
const CAM_Q=[["id","ما هذه القطعة؟"],["fn","اشرح وظيفتها"],["chk","ما الذي يُفحص فيها؟"],["fail","ماذا يحدث لو تعطّلت؟"]];
const CAM_TASK={
  id:"تعرّف على ما في الصورة وسمّه بالعربية والإنجليزية، وبيّن ثقتك (مؤكد / محتمل / غير واضح) ولماذا.",
  fn:"اشرح وظيفة هذه القطعة في الطائرة وكيف تعمل، بلغة مبسطة، ثم اذكر مكوّناتها الرئيسية.",
  chk:"اذكر ما يُنظر إليه عادةً عند فحص هذه القطعة بصرياً (للتعلّم فقط)، وما علامات الخلل الشائعة.",
  fail:"ماذا يحدث لو تعطّلت هذه القطعة، وما الأنظمة التي ترتبط بها، وكيف تحمي الطائرة نفسها من ذلك (التكرار والاحتياط)؟"
};
function camIcon(){ return `<svg class="ico" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 8h3l1.6-2.2h6.8L17 8h3v11H4z"/><circle cx="12" cy="13.2" r="3.6"/></svg>`; }
function camHTML(){
  return `<div class="cam">
    ${typeof bobAvatarHTML==="function"?`<div class="bobhd">${bobAvatarHTML(72,"bust")}<div><b>ميسلون يشرح لك القطعة</b><small>صوّر قطعة وسأتعرّف عليها وأشرحها. اضغط «اسمعني» لأقرأ لك الشرح بصوتي.</small></div></div>`:""}
    <p class="status" id="camNote">صوّر قطعة من طائرة أو محرك أو معدات أرضية، والمهندس الذكي يتعرّف عليها ويشرحها لك. وإذا ما توفّر الذكاء الاصطناعي، اختر القطعة يدوياً.</p>
    <div class="camact">
      <label class="btn pri camtake" for="camIn">${camIcon()}<span>صوّر قطعة</span></label><input id="camIn" type="file" accept="image/*" capture="environment" hidden>
      <label class="btn" for="camPick"><span>اختر صورة من جهازك</span></label><input id="camPick" type="file" accept="image/*" hidden>
    </div>
    <div class="cammanual" id="camMan" hidden><p class="status" id="camManWhy">التعرّف على الصور يحتاج Claude (داخل الصفحة أو عبر خادم الموقع)، وهو غير متاح الآن. اختر القطعة من القائمة وسأشرحها لك من محتوى الموقع.</p>
      <label for="camSel">اختر القطعة يدوياً</label><select id="camSel">${camOptions()}</select></div>
    <figure class="campv" id="camPv" hidden><img id="camImg" alt="الصورة التي أخذتها"><figcaption class="status">الصورة تُرسل للذكاء الاصطناعي لتحليلها فقط ولا تُحفظ في الصفحة.</figcaption></figure>
    <div class="chips" id="camQ" role="group" aria-label="اسأل عن الصورة" hidden>${CAM_Q.map(([k,t])=>`<button type="button" class="chip" data-cq="${k}">${t}</button>`).join("")}</div>
    <div class="msgs" id="camMsgs" aria-live="polite"></div>
    <div class="camopen" id="camOpen" hidden></div>
    <form class="chform" id="camForm" hidden><label class="sr" for="camTx">سؤال عن الصورة</label><textarea id="camTx" rows="2" maxlength="600" placeholder="اسأل المهندس شيئاً عن هذه الصورة..."></textarea><button class="btn pri" type="submit">اسأل</button></form>
    <p class="status" id="camSt"></p>
    ${aiModeHTML()}
    <p class="status">للتعلّم فقط: لا يمكن الحكم على صلاحية قطعة للطيران من صورة. أي قرار فعلي يرجع إلى دليل الصيانة المعتمد (AMM) وإلى فنّي مرخّص.</p>
  </div>`;
}
/* shrink to at most 1280 px on the long side, as JPEG: smaller upload, and phone photos can be very large */
function camPrep(file){
  return new Promise((ok,no)=>{
    const u=URL.createObjectURL(file), im=new Image();
    im.onload=()=>{ const k=Math.min(1,1280/Math.max(im.naturalWidth,im.naturalHeight)), c=document.createElement("canvas"); c.width=Math.max(1,Math.round(im.naturalWidth*k)); c.height=Math.max(1,Math.round(im.naturalHeight*k));
      c.getContext("2d").drawImage(im,0,0,c.width,c.height); URL.revokeObjectURL(u); c.toBlob(b=>b?ok(new File([b],"part.jpg",{type:"image/jpeg"})):no(new Error("blob")),"image/jpeg",0.85); };
    im.onerror=()=>{ URL.revokeObjectURL(u); no(new Error("image")); };
    im.src=u;
  });
}
function camOptions(){ return `<option value="">— اختر قطعة —</option>`+Object.keys(PARTS).filter(partVisible).sort((a,b)=>PARTS[a].ar.localeCompare(PARTS[b].ar,"ar")).map(id=>`<option value="${id}">${IL.lang==="en"?esc(PARTS[id].en):esc(PARTS[id].ar)+" ("+esc(PARTS[id].en)+")"}</option>`).join(""); }
document.addEventListener("il-lang",()=>{ const s=document.getElementById("camSel"); if(s){ const v=s.value; s.innerHTML=camOptions(); s.value=v; } });
/* no tier that can see pictures (x_ai~tiers.js): the student names the part and the page explains it from its own content */
function camManual(on){ const m=document.getElementById("camMan"); if(m) m.hidden=!on; }
function camPickPart(id){
  if(!PARTS[id]) return; CAM.part=id; CAM.msgs.push({role:"user",text:ilTA("اخترت: ","I picked: ")+ilT(PARTS[id].ar)}); CAM.msgs.push({role:"ai",text:aiPartAnswer(id).text}); camRender();
}
function camCatalog(){ return Object.keys(PARTS).filter(partVisible).map(id=>`${id} = ${PARTS[id].ar} / ${PARTS[id].en}`).join("\n"); }
function camPrompt(task){
  const hist=CAM.msgs.slice(-6).filter(m=>m.text).map(m=>(m.role==="user"?"الطالب: ":"المهندس: ")+m.text.replace(/\n?PART:.*$/im,"")).join("\n");
  return `${typeof myUserCtx==="function"?myUserCtx()+"\n":""}أنت «ميسلون»، مهندس طيران وصيانة ودود ومعلّم (شخصية كرتونية لطيفة). طالب عربي صوّر شيئاً ويريد أن تتعرّف عليه وتشرحه له (الصورة مرفقة). أسلوبك مرح وبسيط وجملك قصيرة.
الطائرة المختارة في الموقع الآن: ${AC[S.ac].name}.
قائمة القطع الموجودة في الموقع (المفتاح = الاسم):
${camCatalog()}
المطلوب: ${task}
في آخر سطر من إجابتك اكتب بالضبط: PART: <مفتاح واحد من القائمة أعلاه إن كانت الصورة تُظهر هذه القطعة أو جزءاً منها>، أو PART: none إن لم تطابق شيئاً.
قواعد صارمة: لا تخترع أرقاماً أو أرقام قطع أو قيم عزم أو حدود تشغيل. لا تحكم على صلاحية قطعة للطيران من صورة؛ أي قرار فعلي يرجع إلى دليل الصيانة AMM وإلى فنّي مرخّص. إن كانت الصورة غير واضحة أو لا تُظهر شيئاً من الطائرات والمعدات فقل ذلك واطلب صورة أوضح بدل التخمين. أجب بالعربية الواضحة بما لا يزيد عن 170 كلمة وبلا جداول، فالطالب قد يسمع إجابتك بصوتك.
${hist?"المحادثة السابقة حول هذه الصورة:\n"+hist+"\n":""}`;
}
function camRender(){
  const box=document.getElementById("camMsgs"); if(!box) return;
  box.innerHTML=CAM.msgs.map((m,i)=>{ const t=(m.text||"").replace(/\n?PART:\s*[A-Za-z_0-9]+\s*$/i,"").trim(); return `<div class="msg ${m.role==="user"?"user":"ai bob"}"><span>${m.role==="user"?"أنت":"ميسلون"}${m.role!=="user"&&t&&!(CAM.busy&&i===CAM.msgs.length-1)&&typeof bobSpeakBtn==="function"?bobSpeakBtn("اسمعني",`data-bobspk="${i}"`):""}</span><p>${esc(t||"...")}</p></div>`; }).join("");
  box.scrollTop=box.scrollHeight;
  const op=document.getElementById("camOpen"); if(!op) return;
  if(CAM.part&&PARTS[CAM.part]){ op.hidden=false; op.innerHTML=`<button type="button" class="btn pri" data-camopen="${CAM.part}">افتح «${esc(PARTS[CAM.part].ar)}» في النموذج ثلاثي الأبعاد</button>`; } else { op.hidden=true; op.innerHTML=""; }
}
function camParsePart(text){ const m=/PART:\s*([A-Za-z_0-9]+)\s*$/im.exec(text||""); return m&&PARTS[m[1]]&&partVisible(m[1])?m[1]:null; }
async function camSend(shown,task){
  const st=document.getElementById("camSt"), note=document.getElementById("camNote"); if(CAM.busy||!CAM.file) return;
  const sm=await getSample(); if(!aiCanSee()){ camManual(true); aiModeSync(); return; }
  const prompt=camPrompt(task); CAM.msgs.push({role:"user",text:shown}); const a={role:"ai",text:""}; CAM.msgs.push(a);
  CAM.busy=true; camRender(); if(st) st.textContent="ميسلون يفحص الصورة..."; try{ bobMood("think"); }catch(e){}
  const ctl=CAM.ctl=new AbortController();
  try{
    const r=await sm(prompt,{images:[CAM.file],signal:ctl.signal,cache:false,kind:"camera",onText:({text})=>{ a.text=text; camRender(); }});
    a.text=r.text||a.text; CAM.part=camParsePart(a.text)||CAM.part;
  }catch(e){
    const c=e&&e.code;
    a.text=c==="no_vision"?"التعرّف على الصور يحتاج Claude (داخل الصفحة أو عبر خادم الموقع)، وهو غير متاح الآن. اختر القطعة من القائمة وسأشرحها لك من محتوى الموقع.":c==="not_granted"?"لم تتم الموافقة على استخدام Claude في هذه الصفحة.":c==="rate_limited"?"طلبات كثيرة الآن، انتظر قليلاً ثم أعد المحاولة.":c==="too_large"?"الصورة كبيرة جداً، جرّب صورة أصغر.":(a.text||"تعذّر تحليل الصورة الآن. جرّب صورة أوضح أو أعد المحاولة.");
    if(c==="no_vision") camManual(true);
  }finally{ CAM.busy=false; if(CAM.ctl===ctl) CAM.ctl=null; const s2=document.getElementById("camSt"); if(s2) s2.textContent=""; camRender(); try{ bobMood(a.text&&a.text.length>20?"happy":"idle",2600); }catch(e){} }
}
async function camTake(file){
  if(!file) return; const st=document.getElementById("camSt");
  try{ CAM.file=await camPrep(file); }catch(e){ if(st) st.textContent="تعذّرت قراءة هذه الصورة. جرّب صورة ثانية."; return; }
  if(CAM.url) URL.revokeObjectURL(CAM.url); CAM.url=URL.createObjectURL(CAM.file); CAM.msgs=[]; CAM.part=null;
  const img=document.getElementById("camImg"); if(img) img.src=CAM.url;
  ["camPv","camQ","camForm"].forEach(id=>{ const e=document.getElementById(id); if(e) e.hidden=false; });
  camRender(); camSend("ما هذه القطعة؟",CAM_TASK.id);
}
function camMount(root){
  const el=root.querySelector(".cam"); if(!el) return; try{ bobAvatarMount(el); }catch(e){}
  el.querySelector("#camMsgs").addEventListener("click",e=>{ const b=e.target.closest("[data-bobspk]"); if(!b) return; const m=CAM.msgs[+b.dataset.bobspk]; if(m) bobRead((m.text||"").replace(/\n?PART:\s*[A-Za-z_0-9]+\s*$/i,""),b); });
  ["camIn","camPick"].forEach(id=>el.querySelector("#"+id).addEventListener("change",e=>{ const f=e.target.files&&e.target.files[0]; e.target.value=""; camTake(f); }));
  el.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return;
    if(b.dataset.cq){ camSend(CAM_Q.find(q=>q[0]===b.dataset.cq)[1],CAM_TASK[b.dataset.cq]); return; }
    if(b.dataset.camopen){ const id=b.dataset.camopen; setTab("parts"); select(id); const v=document.getElementById("view"); if(v&&v.scrollIntoView) v.scrollIntoView({behavior:"smooth",block:"start"}); } });
  const f=el.querySelector("#camForm"), t=el.querySelector("#camTx");
  const go=()=>{ const v=t.value.trim(); t.value=""; if(v) camSend(v,"أجب عن سؤال الطالب بخصوص الصورة: "+v); };
  f.addEventListener("submit",e=>{ e.preventDefault(); go(); });
  t.addEventListener("keydown",e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); go(); } });
  if(CAM.file&&CAM.url){ el.querySelector("#camImg").src=CAM.url; ["camPv","camQ","camForm"].forEach(id=>{ el.querySelector("#"+id).hidden=false; }); camRender(); }
  el.querySelector("#camSel").addEventListener("change",e=>{ const id=e.target.value; if(id) camPickPart(id); });
  getSample().then(()=>{ if(!aiCanSee()) camManual(true); aiModeSync(); });
}
function camStop(){ try{ if(CAM.ctl) CAM.ctl.abort(); }catch(e){} CAM.ctl=null; CAM.busy=false; }
