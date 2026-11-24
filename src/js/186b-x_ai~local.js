/* ---------- tier (c): offline answers from the site's own content (prefix ail) ----------
   One small search index over the parts (PARTS), the lessons (LESSONS, with their equations), the glossary (GLOSS) and the training AMM
   cards (AMM_TASKS). Built once, on the first offline question. Arabic is normalised (arNorm) and lightly stemmed (the article, plural and
   feminine endings), English is lower-cased; ranking is BM25-like with the title weighted above the body.
   An answer quotes the site's own text (nothing is invented) and carries buttons to where it came from.
   In English every piece is passed through the site's dictionary (ilT), the same strings the page shows. */
const AIL={docs:null, df:null, N:0, pre:null};
const AIL_STOP=new Set("ال ما ماذا من هو هي هل كيف لماذا ليش شنو شلون اين وين متى كم في على عن الى او ام ثم لا لم لن ان انه انها كان تكون يكون هذا هذه ذلك تلك هناك هنا عند عندما التي الذي الذين مع بين كل بعض اي اذا قد لقد ايش اريد ممكن اشرح اشرحلي اعطني قل لي لنا انا انت نحن هم بس جدا اكثر اقل مثل غير".split(" ").map(w=>arNorm(w)));
const AIL_EN_STOP=new Set("the a an of to in on at for and or is are was what why how does do did can could which who when where with by from as it its this that be please explain tell me about".split(" "));
function ailStem(w){
  const m=/^(وال|فال|بال|كال|لل|ال)(.{3,})$/.exec(w); if(m) w=m[2];
  if(w.length>4&&/(ات|ون|ين|ان|ها|هم|يه|يا)$/.test(w)) w=w.slice(0,-2);
  if(w.length>4&&/ت$/.test(w)) w=w.slice(0,-1);   /* "وظيفت(ها)": the feminine ending before a pronoun */
  if(w.length>3&&/[هي]$/.test(w)) w=w.slice(0,-1);
  return w;
}
function ailTok(s){
  const out=[]; String(arNorm(s||"")).replace(/<[^>]*>/g," ").split(/[^\p{L}\p{N}]+/u).forEach(w=>{ if(!w) return;
    if(/^[a-z0-9]+$/.test(w)){ if(w.length>1&&!AIL_EN_STOP.has(w)) out.push(w.length>3?w.replace(/(ies)$/,"y").replace(/([^s])s$/,"$1"):w); return; }
    if(AIL_STOP.has(w)) return; const t=ailStem(w); if(t.length>1&&!AIL_STOP.has(t)) out.push(t); });
  return out;
}
const ailPlain=h=>String(h==null?"":h).replace(/<[^>]*>/g," ").replace(/&[a-z]+;/g," ").replace(/\s+/g," ").trim();
const ailArr=x=>Array.isArray(x)?x:(x?[x]:[]);
function ailCount(toks){ const m=new Map(); toks.forEach(t=>m.set(t,(m.get(t)||0)+1)); return m; }
function ailBuild(){
  if(AIL.docs) return; const D=[];
  /* names: the title outside and inside its brackets, each normalised; a question that contains one of them is about this entry */
  const names=t=>{ const n=arNorm(t), a=[n.replace(/\(.*?\)/g," ")]; n.replace(/\(([^)]*)\)/g,(x,y)=>{ a.push(y); return x; }); return a.map(x=>x.replace(/\s+/g," ").trim()).filter(x=>x.length>3); };
  const add=(k,id,go,title,body,en)=>{ const ta=ailTok(title), te=en?ailTok(en):[]; D.push({k,id,go,ti:ailCount(ta.concat(te)),bo:ailCount(ailTok(body)),nm:names(title).concat(en&&en.length>3?[en.toLowerCase()]:[]),tA:new Set(ta),tE:new Set(te)}); };
  try{ Object.keys(PARTS).forEach(id=>{ const p=PARTS[id]; add("part",id,"part:"+id,p.ar,[p.sum,p.ata,(p.comps||[]).map(c=>c.join(" ")).join(" "),(p.insp||[]).join(" "),(p.fast||[]).map(c=>c.join(" ")).join(" ")].join(" "),p.en); }); }catch(e){}
  try{ Object.keys(LESSONS).forEach(b=>LESSONS[b].forEach((l,i)=>{
    if(l._dl){ let e=null; try{ e=dlIdxEntry(b,i); }catch(er){} add("lesson",b+":"+i,"lesson:"+b+":"+i,l.ar,e?e.x:"",l.en); return; }
    add("lesson",b+":"+i,"lesson:"+b+":"+i,l.ar,[ailArr(l.intro).join(" "),ailArr(l.note).join(" "),ailArr(l.eq).join(" "),l.alt||"",l.ref||"",(l.quiz||[]).map(q=>q.q+" "+(q.why||"")).join(" ")].map(ailPlain).join(" "),l.en); })); }catch(e){}
  try{ GLOSS.forEach((g,i)=>add("gloss",i,"gloss:"+g.en,g.ar,g.d,g.en)); }catch(e){}
  try{ AMM_TASKS.forEach(t=>add("amm",t.id,"amm:"+t.id,t.ar,[t.reason,t.zone,(t.warn||[]).join(" "),(t.caut||[]).join(" ")].join(" "),t.en)); }catch(e){}
  const df=new Map(), pre=new Map();
  D.forEach(d=>{ new Set([...d.ti.keys(),...d.bo.keys()]).forEach(t=>{ df.set(t,(df.get(t)||0)+1); }); });
  df.forEach((n,t)=>{ if(t.length<4) return; const k=t.slice(0,4); let a=pre.get(k); if(!a) pre.set(k,a=[]); a.push(t); });
  AIL.docs=D; AIL.df=df; AIL.N=D.length; AIL.pre=pre;
}
/* what the question is about: drives which fields of a part / lesson are quoted */
function ailIntent(q){ const n=arNorm(q).toLowerCase();
  return {insp:/فحص|يفحص|تفتيش|معاين|inspect|check/.test(n), comp:/مكون|يتكون|اجزاء|اجزائ|component|made of/.test(n), eq:/معادل|قانون|علاق|يحسب|حساب|equation|formula/.test(n),
          def:/^\s*(ما|شنو|شو)\s+(هو|هي|معني|تعريف)|معني|تعريف|يعني|what is|define|meaning/.test(n), fail:/تعطل|عطل|خلل|فشل|ينكسر|fail|broke/.test(n), amm:/صيان|amm|اجراء|خطوات|بطاق/.test(n)}; }
function ailSearch(q,o){
  ailBuild(); o=o||{}; const qt=[...new Set(ailTok(q))]; if(!qt.length) return [];
  const N=AIL.N, idf=t=>{ const n=AIL.df.get(t)||0; return n?Math.log(1+(N-n+0.5)/(n+0.5)):0; };
  /* a query word the index does not know: the index words that share its first 4 letters, at a lower weight */
  const terms=[]; qt.forEach(t=>{ if(AIL.df.has(t)) terms.push([t,1]); else if(t.length>=4){ (AIL.pre.get(t.slice(0,4))||[]).slice(0,6).forEach(u=>terms.push([u,0.55])); } });
  if(!terms.length) return [];
  const it=ailIntent(q), qn=arNorm(q).toLowerCase(), qs=new Set(terms.map(x=>x[0])), out=[], how=/كيف|طريق|خطوات|how/.test(qn);
  AIL.docs.forEach(d=>{ let s=0, hit=0;
    terms.forEach(([t,w])=>{ const a=d.ti.get(t)||0, b=d.bo.get(t)||0; if(a||b){ hit++; s+=w*idf(t)*(2.6*Math.min(a,2)+Math.log(1+b)); } });
    if(!s) return;
    s*=0.6+0.4*hit/terms.length;
    /* how much of the title the question covers (Arabic and English titles apart): "radome" beats "radome hold-open rod" */
    const cov=T=>{ if(!T.size) return 0; let m=0; T.forEach(t=>{ if(qs.has(t)) m++; }); return m/T.size; };
    s*=0.75+0.6*Math.max(cov(d.tA),cov(d.tE));
    if(d.nm.some(x=>qn.includes(x))) s*=1.6;   /* a whole name of the entry is in the question */
    if(it.def&&d.k==="gloss") s*=1.35; if(it.eq&&d.k==="lesson") s*=1.25; if((it.insp||it.comp||it.fail)&&d.k==="part") s*=1.2; if(it.amm&&d.k==="amm") s*=1.3; if(how&&it.insp&&d.k==="amm") s*=1.5;
    if(o.part&&d.k==="part"&&d.id===o.part) s*=1.3; if(o.lesson&&d.k==="lesson"&&d.id===o.lesson) s*=1.3;
    out.push([s,d]); });
  return out.sort((a,b)=>b[0]-a[0]);
}
/* labels and pieces in the active language */
const ailL=(ar,en)=>ilTA(ar,en);
const ailT=s=>typeof ilT==="function"?ilT(s):s;
/* "الاسم (English)" in Arabic; in English the name once */
const ailName=(ar,en)=>IL.lang==="en"?(en||ailT(ar)):`${ar} (${en})`;
function ailSent(s,max){ s=ailPlain(s); if(s.length<=max) return s; const c=s.slice(0,max), k=Math.max(c.lastIndexOf(". "),c.lastIndexOf("؛ "),c.lastIndexOf("، ")); return (k>max*0.5?c.slice(0,k+1):c)+"…"; }
function ailLink(d){
  const K={part:["القطعة","Part"],lesson:["الدرس","Lesson"],gloss:["القاموس","Glossary"],amm:["بطاقة AMM","AMM card"]}[d.k];
  let t=""; try{ if(d.k==="part") t=PARTS[d.id].ar; else if(d.k==="lesson"){ const q=d.id.split(":"); t=LESSONS[q[0]][+q[1]].ar; } else if(d.k==="gloss") t=GLOSS[d.id].ar; else t=AMM_TASKS.find(x=>x.id===d.id).ar; }catch(e){}
  return {go:d.go,k:ailL(K[0],K[1]),t:ailT(t)};
}
function ailPartText(id,it){
  const p=PARTS[id]; if(!p) return ""; it=it||{}; const L=[];
  L.push(`${ailName(p.ar,p.en)} · ${p.ata}`);
  L.push(ailT(p.sum));
  if((it.comp||!it.insp)&&p.comps&&p.comps.length) L.push(ailL("مكوّناتها الرئيسية:","Main components:")+"\n"+p.comps.slice(0,3).map(c=>"• "+(IL.lang==="en"?c[0]:c[1]+" ("+c[0]+")")).join("\n"));
  if((it.insp||it.fail)&&p.insp&&p.insp.length) L.push(ailL("ما يُنظر إليه في الفحص البصري (للتعلّم فقط):","What a visual inspection looks at (for learning only):")+"\n"+p.insp.slice(0,3).map(x=>"• "+ailT(x)).join("\n"));
  if(it.fail) L.push(ailL("لا يذكر محتوى الموقع أعطالاً محددة لهذه القطعة؛ ما فوق هو ما يُفحص فيها عادةً.","The site's content lists no specific failures for this part; above is what is usually checked."));
  return L.join("\n");
}
function ailLessonText(b,i,it){
  let l=null; try{ l=dlEnsure(b,i)||LESSONS[b][i]; }catch(e){ l=LESSONS[b]&&LESSONS[b][i]; } if(!l) return "";
  it=it||{}; const L=[ailL("من درس «","From the lesson «")+ailT(l.ar)+"» · "+ailT(LBOOK[b].ar)];
  const intro=ailArr(l.intro).map(x=>ailT(ailPlain(x))).join(" "); if(intro) L.push(ailSent(intro,460));
  const eq=ailArr(l.eq).map(ailPlain).filter(Boolean); if(eq.length&&(it.eq||!intro)) L.push(ailL("المعادلة: ","Equation: ")+eq.slice(0,2).join(" | "));
  else if(eq.length) L.push(ailL("في الدرس معادلة تقدر تجربها بالمنزلقات.","The lesson has an equation you can try with its sliders."));
  return L.join("\n");
}
function ailDocText(d,it){
  if(d.k==="part") return ailPartText(d.id,it);
  if(d.k==="lesson"){ const q=d.id.split(":"); return ailLessonText(q[0],+q[1],it); }
  if(d.k==="gloss"){ const g=GLOSS[d.id]; return `${ailName(g.ar,g.en)}: ${ailT(g.d)}`; }
  if(d.k==="amm"){ const t=AMM_TASKS.find(x=>x.id===d.id); if(!t) return "";
    return [ailL("بطاقة AMM تدريبية: ","Training AMM card: ")+ailName(t.ar,t.en)+` · ATA ${t.ata}`,ailT(t.reason),t.warn&&t.warn[0]?ailL("تحذير: ","Warning: ")+ailT(t.warn[0]):"",ailL("القيم الفعلية تأتي دائماً من دليل الصيانة المعتمد. للتدريب فقط.","Real values always come from the approved maintenance manual. Training only.")].filter(Boolean).join("\n"); }
  return "";
}
/* related buttons for any question (also under answers from tiers a and b) */
function aiLocalLinks(q,o){ const r=ailSearch(q,o); if(!r.length) return []; const top=r[0][0], seen={}, out=[];
  for(const [s,d] of r){ if(s<top*0.35||out.length>=3) break; seen[d.k]=(seen[d.k]||0)+1; if(seen[d.k]>2) continue; out.push(ailLink(d)); }
  return out; }
/* the offline answer to a free question; o.part / o.lesson = what the student is looking at */
function aiLocalAnswer(q,o){
  o=o||{}; const r=ailSearch(q,o), it=ailIntent(q);
  if(!r.length||r[0][0]<1.2){
    if(o.part&&PARTS[o.part]&&/وظيف|فحص|مكون|هذ|تعطل|this|\bit\b/.test(arNorm(q))) return {text:ailPartText(o.part,it),links:[{go:"part:"+o.part,k:ailL("القطعة","Part"),t:ailT(PARTS[o.part].ar)}]};
    const s=String(q||"").trim().slice(0,60);
    return {text:ailL("لم أجد في محتوى الموقع جواباً قريباً من سؤالك. جرّب اسم القطعة أو المصطلح نفسه (بالعربي أو بالإنجليزي)، أو ابحث في الدروس والقاموس من الأزرار تحت.","I found nothing close to your question in the site's content. Try the name of the part or the term itself (in Arabic or English), or search the lessons and the glossary with the buttons below."),
      links:s?[{go:"lsearch:"+s,k:ailL("ابحث في الدروس","Search lessons"),t:s},{go:"gloss:"+s,k:ailL("ابحث في القاموس","Search the glossary"),t:s}]:[]};
  }
  const best=r[0][1], text=ailDocText(best,it), links=[ailLink(best)], top=r[0][0], kinds={[best.k]:1};
  for(const [s,d] of r.slice(1)){ if(s<top*0.35||links.length>=4) break; if((kinds[d.k]=(kinds[d.k]||0)+1)>2) continue; links.push(ailLink(d)); }
  return {text,links};
}
/* the camera without tiers a and b: the student names the part, the page explains it */
function aiPartAnswer(id){ return {text:ailPartText(id,{comp:true,insp:true}),links:[]}; }

/* ---- the lesson tutor offline: built from the open lesson (its introduction, live readouts, controls, notes and quiz) ---- */
function aiTutorLocal(kind,q){
  let l=null, s=null; try{ l=lrnCur(); s=tutSnap(); }catch(e){ return null; } if(!l) return null;
  const intro=ailArr(l.intro).map(x=>ailT(ailPlain(x))).join(" "), notes=ailArr(l.note).map(x=>ailT(ailPlain(x))).filter(Boolean);
  const ctl=(l.ctl||[]).map(c=>ailT(c.ar)), ro=(()=>{ try{ return l.ro(LRN.st||{}).map(([a])=>ailT(ailPlain(a))); }catch(e){ return []; } })();
  const lk=[{go:"lesson:"+LRN.book+":"+LRN.i,k:ailL("الدرس","Lesson"),t:ailT(l.ar)}];
  if(kind==="simple") return {text:(intro?ailSent(intro,420):ailT(l.ar))+"\n"+ailL("حرّك منزلقات الدرس ولاحظ كيف تتغيّر القراءات؛ هذا أسرع طريق للفهم.","Move the lesson's sliders and watch the readouts change; that is the quickest way to understand it.")};
  if(kind==="reading") return {text:s.ro?ailL("القراءات الآن: ","Readouts now: ")+ailT(s.ro)+(s.ctl?"\n"+ailL("بالقيم التي ضبطتها: ","With the values you set: ")+ailT(s.ctl):""):ailL("هذا الدرس لا يعرض قراءات رقمية.","This lesson shows no numeric readouts.")};
  if(kind==="example") return {text:notes.length?notes.slice(0,2).join("\n"):(intro?ailSent(intro,300):""),links:lk};
  if(kind==="experiment"){ if(!ctl.length) return {text:ailL("هذا الدرس ليس فيه منزلقات. جرّب الأزرار في الرسم ولاحظ ما يتغيّر.","This lesson has no sliders. Try the buttons in the drawing and watch what changes.")};
    const r0=ro[0]?"«"+ro[0]+"»":ailL("القراءات","the readouts");
    return {text:[ailL("1) حرّك «","1) Move «")+ctl[0]+ailL("» إلى أقصى قيمة ثم إلى أدناها، وراقب "," to its highest and then lowest value, and watch ")+r0+".",
      ctl[1]?ailL("2) أعده للوسط وحرّك «","2) Put it back in the middle and move «")+ctl[1]+ailL("» وحده.","» alone."):ailL("2) أعد المنزلق للوسط وغيّره خطوة خطوة.","2) Put the slider back in the middle and change it step by step."),
      ailL("3) اكتب في الدفتر أي القيمتين غيّرت القراءة أكثر، ولماذا تظن ذلك.","3) Write in the notebook which value changed the readout more, and why you think so.")].join("\n")}; }
  if(kind==="quiz"){ const Q=(l.quiz||[]); if(!Q.length) return {text:ailL("هذا الدرس بلا أسئلة.","This lesson has no questions.")};
    const x=Q[(Date.now()/1000|0)%Q.length], A=IL.lang==="en"?["a","b","c","d","e"]:["أ","ب","ج","د","هـ"];
    return {text:ailL("سؤال: ","Question: ")+ailT(ailPlain(x.q))+"\n"+x.o.map((o,i)=>A[i]+") "+ailT(ailPlain(o))).join("\n")+"\n"+ailL("أجب في اختبار الدرس تحت لتعرف الجواب.","Answer in the lesson's quiz below to see the answer.")}; }
  if(kind==="pitfalls"){ const W=(l.quiz||[]).map(x=>ailT(ailPlain(x.why))).filter(Boolean).slice(0,3); const P=W.length?W:notes.slice(0,3);
    return {text:P.length?P.map((w,i)=>(i+1)+") "+w).join("\n"):(intro?ailSent(intro,300):"")}; }
  /* a free question: sentences of this lesson first, then the whole site */
  const qt=new Set(ailTok(q)); if(qt.size){
    const S=(intro+" "+notes.join(" ")).split(/(?<=[.!؟?])\s+/).map(x=>[ailTok(x).filter(t=>qt.has(t)).length,x]).filter(x=>x[0]>0).sort((a,b)=>b[0]-a[0]).slice(0,2).map(x=>x[1]);
    if(S.length) return {text:S.join(" "),links:lk};
  }
  return aiLocalAnswer(q,{lesson:LRN.book+":"+LRN.i});
}
