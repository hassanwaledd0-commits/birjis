/* ---------- ask the engineer (AI via the sample capability) and the reading list ---------- */
const CHAT = {msgs:[], busy:false, ctl:null};
const gbUrl = isbn => "https://www.google.com/search?tbm=bks&q=isbn:" + encodeURIComponent(isbn);
const BOOKS = [
  {t:"Aircraft Structures for Engineering Students", a:"T.H.G. Megson", lvl:"جامعي", topic:"هيكل الطائرة والإجهاد والأحمال على الجناح والجسم.", why:"يشرح لماذا يُصمَّم الجناح والجسم بالشكل الذي تراه في النموذج.", isbn:"9780081009147", url:"https://educate.elsevier.com/book/details/9780081009147"},
  {t:"Aircraft Systems: Mechanical, Electrical and Avionics Subsystems Integration", a:"Ian Moir, Allan Seabridge", lvl:"جامعي / مهني", topic:"الوقود والهيدروليك والكهرباء والإلكترونيات والتحكم.", why:"يربط بين الأنظمة التي تراها في وضع الداخل بالطائرة.", isbn:"9780470059968", url:"https://www.wiley-vch.de/en/areas-interest/engineering/aircraft-systems-978-0-470-05996-8"},
  {t:"Introduction to Flight", a:"John D. Anderson Jr.", lvl:"مدخل", topic:"أساسيات الرفع والسحب والديناميكا الهوائية.", why:"الأساس النظري لمختبر الجناح في هذا الموقع.", url:"https://www.mheducation.com/highered/product/Introduction-to-Flight-Anderson.html"},
  {t:"Mechanics of Flight (2nd ed.)", a:"Warren F. Phillips", lvl:"جامعي", topic:"الأداء والاستقرار والتحكم في الطيران.", why:"يشرح كيف تعمل أسطح التحكم مثل الإيليرون والمصعد والدفة.", isbn:"9780470539750"},
  {t:"Aircraft Propulsion (2nd ed.)", a:"Saeed Farokhi", lvl:"جامعي / متقدم", topic:"المحركات النفاثة والتوربينية.", why:"يفسّر المروحة الأمامية والنواة وغرفة الاحتراق.", isbn:"9781118806777"},
  {t:"The Jet Engine", a:"Rolls-Royce plc", lvl:"مدخل / فني", topic:"كيف يعمل المحرك النفاث، بقلم شركة المحركات نفسها.", why:"مرجع مبسط بأشكال للأجزاء الداخلية.", isbn:"9781119065999"},
  {t:"Aircraft Maintenance and Repair (7th ed.)", a:"Michael J. Kroes, William A. Watkins, Frank Delp", lvl:"فني", topic:"الصيانة والفحص وإصلاح الهيكل والأنظمة.", why:"يشرح الفحص اليومي والدوري ونقاط التفتيش.", isbn:"9781260441062"},
  {t:"Aviation Maintenance Technician Handbook: Airframe (FAA-H-8083-31B)", a:"Federal Aviation Administration (الولايات المتحدة)", lvl:"فني / مجاني", topic:"هيكل الطائرة والأنظمة والتركيبات والمواد.", why:"كتيّب حكومي مجاني بصيغة PDF، ويحتوي أشكالاً كثيرة.", url:"https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/FAA-H-8083-31B_Aviation_Maintenance_Technician_Handbook.pdf"},
  {t:"Airplane Flying Handbook (FAA-H-8083-3C)", a:"Federal Aviation Administration (الولايات المتحدة)", lvl:"مدخل / مجاني", topic:"أساسيات الطيران والأداء والتحكم.", why:"مفيد لمن يريد الجانب الطياري إلى جانب الهندسي.", url:"https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/airplane_handbook"}
];
function booksHTML(){
  return `<div class="books">${BOOKS.map(b=>`<article class="book"><b>${esc(b.t)}</b><span class="status">${esc(b.a)} · ${esc(b.lvl)}</span><p>${esc(b.topic)}</p><p class="status">${esc(b.why)}</p><a class="btn" href="${esc(b.url||gbUrl(b.isbn))}" target="_blank" rel="noopener noreferrer">صفحة الكتاب ↗</a></article>`).join("")}</div>
  <p class="status" style="margin-top:12px">الكتب بالإنجليزية. تحقّق من أحدث طبعة قبل الشراء. الكتب المرجعية الفنية الدقيقة مثل دليل الصيانة (AMM) تأتي من الشركة المصنعة وليست من هذه القائمة.</p>`;
}
const SUGGEST_GEN=["ما الفرق بين الفلاب والسبويلر؟","لماذا تحتاج الطائرة إلى عجلة أنف؟","كيف يعمل نظام الهيدروليك باختصار؟","لماذا يُدار الجناح بزاوية حتى يرفع الطائرة؟"];
function askHTML(){
  const sug = S.sel ? suggestFor(S.sel) : SUGGEST_GEN;
  return `<div class="chat">
    ${typeof bobAvatarHTML==="function"?`<div class="bobhd">${bobAvatarHTML(72,"bust")}<div><b>ميسلون، مهندسك</b><small>اسألني عن أي قطعة أو عن الطيران. أجيبك بالكتابة، وتقدر تضغط «اسمعني» لأتكلم معك.</small>${typeof myVoiceSheet==="function"?`<button type="button" class="bobspk" style="margin-top:6px" data-myvs="1">الصوت</button>`:""}</div></div>`:""}
    <p class="status" id="chCtx"></p>
    <div class="chips" role="group" aria-label="أسئلة مقترحة">${sug.map(q=>`<button class="chip" type="button" data-q="${esc(q)}">${esc(q)}</button>`).join("")}</div>
    <div class="msgs" id="chMsgs" aria-live="polite"></div>
    <form class="chform" id="chForm"><label class="sr" for="chIn">اكتب سؤالك</label><textarea id="chIn" rows="2" maxlength="600" placeholder="اكتب سؤالك للمهندس الافتراضي..."></textarea><button class="btn pri" type="submit" id="chSend">أرسل</button></form>
    <p class="status" id="chSt"></p>
    ${aiModeHTML()}
    <p class="status">الإجابات تعليمية. لأي إجراء فعلي على طائرة، ارجع إلى دليل الصيانة المعتمد (AMM) وإلى تعليمات مؤسسة الصيانة المرخّصة.</p>
  </div>`;
}
function suggestFor(id){ const p=PARTS[id]; return [`ما وظيفة ${p.ar}؟`,`ماذا يحدث إذا تعطّل ${p.ar}؟`,`ما أهم نقاط الفحص في ${p.ar}؟`,`كيف ترتبط ${p.ar} بباقي الطائرة؟`]; }
function chatPrompt(q){
  const p=S.sel?PARTS[S.sel]:null;
  const ctx=p?`الجزء المعروض حالياً: ${p.ar} (${p.en})، ${p.ata}${p.parent?"، وهو قطعة فرعية من "+PARTS[p.parent].ar:""}. ملخص الصفحة عنه: ${p.sum}`:"لا يوجد جزء محدد حالياً، والسؤال عام.";
  const hist=CHAT.msgs.slice(-6).filter(m=>m.text).map(m=>(m.role==="user"?"المستخدم: ":"المساعد: ")+m.text).join("\n");
  return `${typeof myUserCtx==="function"?myUserCtx()+"\n":""}أنت «ميسلون»، مهندس طيران وصيانة ودود ومعلّم، شخصية كرتونية لطيفة تتحدث مع طالب عربي يحب الطيران. أسلوبك مرح ومشجّع وجملك قصيرة، وتجيب بالعربية الفصحى المبسّطة، وتكتب المصطلحات الإنجليزية بين قوسين عند الحاجة فقط.
الطائرة المعروضة: ${AC[S.ac].name}. ${ctx}
قواعد صارمة: لا تخترع أرقاماً أو قيم عزم أو أرقام قطع أو حدود تشغيل. إن لم تكن متأكداً فقل ذلك صراحةً. أي إجراء فعلي تُرجع فيه إلى دليل الصيانة AMM الصادر عن الشركة المصنعة. اجعل الإجابة منظمة وتصل إلى 150 كلمة كحد أقصى، بلا جداول ولا رموز غريبة، لأن الطالب قد يطلب أن يسمع إجابتك بصوتك.
${hist?"المحادثة السابقة:\n"+hist+"\n":""}السؤال الحالي: ${q}`;
}
function chatRender(){
  const box=document.getElementById("chMsgs"); if(!box) return;
  box.innerHTML = CHAT.msgs.length ? CHAT.msgs.map((m,i)=>`<div class="msg ${m.role}${m.role==="ai"?" bob":""}"><span>${m.role==="user"?"أنت":"ميسلون"}${m.role==="ai"&&m.text&&!(CHAT.busy&&i===CHAT.msgs.length-1)&&typeof bobSpeakBtn==="function"?bobSpeakBtn("اسمعني",`data-bobspk="${i}"`):""}</span><p>${esc(m.text||"...")}</p>${m.role==="ai"&&!(CHAT.busy&&i===CHAT.msgs.length-1)?aiLinksHTML(m.links):""}</div>`).join("") : `<p class="status">اسأل عن أي جزء أو عن الطيران بشكل عام.</p>`;
  box.scrollTop = box.scrollHeight;
  const ctx=document.getElementById("chCtx"); if(ctx) ctx.textContent = S.sel ? `السياق: ${PARTS[S.sel].ar} · ${AC[S.ac].name}` : `السياق: عام · ${AC[S.ac].name}`;
}
async function chatSend(text){
  const q=(text||"").trim(), st=document.getElementById("chSt"); if(!q||CHAT.busy) return;
  const sm=await getSample();
  const prompt=chatPrompt(q), part=S.sel;
  CHAT.msgs.push({role:"user",text:q}); const a={role:"ai",text:""}; CHAT.msgs.push(a);
  CHAT.busy=true; chatRender(); st.textContent="ميسلون يفكّر..."; try{ bobMood("think"); }catch(e){}
  CHAT.ctl=new AbortController();
  try{
    const r=await sm(prompt,{signal:CHAT.ctl.signal,cache:false,kind:"chat",local:()=>aiLocalAnswer(q,{part}),onText:({text})=>{ a.text=text; chatRender(); }});
    a.text=r.text||a.text; a.links=r.tier==="c"?r.links:aiLocalLinks(q,{part});
  }catch(e){
    const c=e&&e.code;
    a.text = c==="not_granted" ? "لم تتم الموافقة على استخدام Claude في هذه الصفحة." : c==="rate_limited" ? "طلبات كثيرة الآن، انتظر قليلاً ثم أعد المحاولة." : (a.text||"تعذّر الحصول على إجابة الآن.");
    if(c!=="aborted"&&e&&e.name!=="AbortError"){ try{ const L=aiLocalAnswer(q,{part}); if(L&&L.text){ a.text=L.text; a.links=L.links; } }catch(er){} }
  }finally{ CHAT.busy=false; st.textContent=""; chatRender(); try{ bobMood(a.text&&a.text.length>20?"happy":"idle",2600); }catch(e){} }
}
function askMount(root){
  chatRender(); try{ bobAvatarMount(root); }catch(e){}
  root.querySelector("#chMsgs").addEventListener("click",e=>{ const b=e.target.closest("[data-bobspk]"); if(!b) return; const m=CHAT.msgs[+b.dataset.bobspk]; if(m) bobRead(m.text,b); });
  root.querySelectorAll("[data-q]").forEach(b=>b.addEventListener("click",()=>chatSend(b.dataset.q)));
  root.querySelector("#chForm").addEventListener("submit",e=>{ e.preventDefault(); const i=root.querySelector("#chIn"); const v=i.value; i.value=""; chatSend(v); });
  root.querySelector("#chIn").addEventListener("keydown",e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); const i=e.target; const v=i.value; i.value=""; chatSend(v); } });
  if(CHAT.prefill){ const i=root.querySelector("#chIn"); i.value=CHAT.prefill; CHAT.prefill=""; i.focus(); }
}
