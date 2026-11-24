/* ---------- ab: «منو بيرجس؟», the maker's story, the last section of the Home screen (called from x_ui_home.js).
   The owner's own words, written up at his request; both languages are in the markup (data-il-skip) and CSS shows the one of the page. ---------- */
const AB_NAME={ar:"حسن وليد",en:"Hassan Waleed"};
const AB_PHONE="07735546642", AB_TEL="+9647735546642", AB_MAIL="hassanwaledd0@gmail.com";
const AB_STEPS=[
  {n:"4",ar:"أول طائرة ركبتها",en:"My first flight"},
  {n:"5",ar:"أول طائرة رسمتها",en:"My first drawing of a plane"},
  {n:"7",ar:"عرفت كيف تطير",en:"I learned how it flies"},
  {n:"18",ar:"بيرجس",en:"Birjis"}
];
const AB_AR=[
  "كنت في الرابعة من عمري حين صعدت أول طائرة في حياتي. لا أذكر إلى أين كنا ذاهبين، لكنني أذكر الشعور جيداً: قلب صغير يخفق مع هدير المحركات، ونافذة تتسع فيها الأرض ثم تصغر، وسؤال واحد لم يفارقني منذ ذلك اليوم: كيف يطير كل هذا الحديد؟",
  "بعدها بسنة رسمت أول طائرة بيدي. ألوان بسيطة وخطوط مرتجفة، لكنها كانت في عيني مشروعاً عظيماً… وكانت، من غير أن أدري، أول صفحة في هذا المشروع.",
  "وفي السابعة عرفت أخيراً كيف تطير الطائرة، فلم يُطفئ الجواب فضولي بل أشعله. صرت أقضي أغلب وقتي أشاهد مقاطع تحطّم الطائرات، وأعيد المقطع ولو للمرة الألف، لأن كل حادثة كانت تعلّمني شيئاً: لماذا تسقط الطائرة، وكيف يتعلّم الإنسان من الخطأ حتى لا يتكرر. وبكل صدق، كانت الطائرات أكثر شيء أفكر فيه.",
  "واليوم، وعمري لم يتجاوز الثامنة عشرة، صار ذلك الحلم الصغير شيئاً تستطيع أن تلمسه بيدك: «بيرجس»، برنامج تفاعلي لمهندسي الطائرات ولكل من يعشقها، تفكّ فيه الطائرة قطعة قطعة، وتتعلّم، وتطير.",
  "البرجيس هو اسم المشتري عند العرب، أكبر كواكب السماء. اخترته لأن الأحلام التي تولد صغيرة تستحق أن تكبر حتى تلامس السماء."
];
const AB_EN=[
  "I was four years old when I boarded my first plane. I don't remember where we were going, but I remember the feeling: a small heart racing with the roar of the engines, a window where the ground grew wide and then small, and one question that has never left me since: how does all this metal fly?",
  "A year later I drew my first aircraft. Simple colours and shaky lines, but in my eyes it was a great project… and, without knowing it, it was the first page of this one.",
  "At seven I finally learned how an aircraft flies, and the answer didn't put out my curiosity, it set it on fire. I spent most of my time watching videos of air crashes, playing the same one for the thousandth time, because every accident taught me something: why an aircraft falls, and how people learn from a mistake so it never happens again. Honestly, aircraft were what I thought about more than anything.",
  "Today, not yet past eighteen, that small dream has become something you can hold in your hand: Birjis, an interactive program for aircraft engineers and everyone who loves aircraft, where you take an aircraft apart piece by piece, learn, and fly.",
  "Al-Birjis is the old Arabic name for Jupiter, the largest planet in the sky. I chose it because dreams that are born small deserve to grow until they touch the sky."
];
let AB_CSS=false;
function abCss(){ if(AB_CSS) return; AB_CSS=true; const st=document.createElement("style");
  st.textContent=`
.abW{position:relative;overflow:hidden;margin-top:6px;padding:26px 20px 22px;border-radius:24px;color:#EAF1FB;background:radial-gradient(90% 70% at 100% 0%,rgb(244 177 62 / .22),transparent 60%),radial-gradient(80% 60% at 0% 100%,rgb(43 108 184 / .35),transparent 70%),linear-gradient(160deg,#13386C,#081630 70%);box-shadow:var(--sh2)}
.abW::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.7;background-image:radial-gradient(1.3px 1.3px at 8% 14%,#fff,transparent),radial-gradient(1px 1px at 22% 40%,#fff,transparent),radial-gradient(1.4px 1.4px at 70% 10%,#fff,transparent),radial-gradient(1px 1px at 88% 34%,#fff,transparent),radial-gradient(1.2px 1.2px at 52% 22%,#fff,transparent),radial-gradient(1px 1px at 94% 70%,#fff,transparent)}
.abW>*{position:relative}
.abE,:root[lang="en"] .abA{display:none}:root[lang="en"] .abE{display:block}
.abHd{display:flex;align-items:center;gap:14px;margin-bottom:16px}
.abLg{width:56px;height:56px;flex:none;filter:drop-shadow(0 10px 18px rgb(0 0 0 / .45))}.abLg svg{width:100%;height:100%;display:block}
.abK{display:block;font-size:13px;font-weight:600;color:#F6C46A;letter-spacing:.02em}
.abHd h3{margin:2px 0 0;font-size:24px;line-height:1.3;color:#fff}
.abTl{list-style:none;margin:0 0 18px;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.abTl li{display:grid;justify-items:center;gap:6px;text-align:center;font-size:12.5px;line-height:1.35;color:#C9D8F0}
.abTl b{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;font:700 17px/1 var(--font-mono,monospace);color:#0B1A2D;background:linear-gradient(135deg,#FFE2A6,#F0A53A);box-shadow:0 6px 14px -6px rgb(240 165 58 / .8)}
.abTl li:last-child b{background:linear-gradient(135deg,#9CC8FF,#3D7FD6);color:#fff}
.abTx p{margin:0 0 14px;font-size:16px;line-height:2;color:#E3ECF8;overflow-wrap:anywhere}
.abTx p:first-child::first-letter{font-size:1.25em;color:#F6C46A}
.abE .abTx p{line-height:1.8}
.abSg{margin:6px 0 0;display:flex;flex-direction:column;align-items:flex-end;gap:2px}.abSg b{font-size:22px;font-weight:700;color:#F6C46A}.abSg span{font-size:13px;color:#C9D8F0}.abSg b::before{content:"— "}
.abPr{margin:18px 0 0;padding:14px 16px;border-radius:16px;background:rgb(255 255 255 / .07);border:1px solid rgb(255 255 255 / .14);font-size:17px;font-weight:700;color:#fff;text-align:center;line-height:1.7}
.abPr span{display:block;font-size:13px;font-weight:500;color:#C9D8F0}
.abCt{margin-top:16px;display:grid;gap:10px}
.abCt h4{margin:0;font-size:15px;color:#F6C46A}
.abBt{display:flex;flex-wrap:wrap;gap:10px}
.abBt a{flex:1 1 200px;display:flex;align-items:center;justify-content:center;gap:10px;min-height:50px;padding:0 16px;border-radius:999px;text-decoration:none;font-weight:600;font-size:15px;color:#0B1A2D;background:#fff;box-shadow:0 8px 18px -10px rgb(0 0 0 / .6)}
.abBt a:hover{transform:translateY(-1px)}.abBt a:focus-visible{outline:3px solid #F6C46A;outline-offset:3px}
.abBt a svg{width:20px;height:20px;flex:none}.abBt a bdi{font-family:var(--font-mono,monospace);font-size:14.5px}
@media (max-width:420px){.abW{padding:22px 16px 18px}.abHd h3{font-size:21px}.abTx p{font-size:15.5px}.abTl b{width:40px;height:40px;font-size:15px}}
@media (prefers-reduced-motion:reduce){.abBt a:hover{transform:none}}`;
  document.head.appendChild(st); }
const AB_ICO={
  tel:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
  mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>'
};
function abBlock(en){
  const T=o=>en?o.en:o.ar, P=en?AB_EN:AB_AR;
  return `<div class="${en?"abE":"abA"}" lang="${en?"en":"ar"}" dir="${en?"ltr":"rtl"}">
  <div class="abHd"><span class="abLg">${typeof bwLogo==="function"?bwLogo():""}</span><div><span class="abK">${en?"Who is Birjis?":"منو بيرجس؟"}</span><h3>${en?"The story behind Birjis":"حكاية بيرجس"}</h3></div></div>
  <ol class="abTl" aria-label="${en?"Ages":"محطات العمر"}">${AB_STEPS.map(s=>`<li><b>${s.n}</b>${T(s)}</li>`).join("")}</ol>
  <div class="abTx">${P.map(p=>`<p>${p}</p>`).join("")}</div>
  <p class="abSg"><b>${T(AB_NAME)}</b><span>${en?"Maker of Birjis":"صانع بيرجس"}</span></p>
  <p class="abPr">${en?"With pride, this project was made by Iraqi hands.":"بكل فخر، هذا المشروع صُنع بيدٍ عراقية."}<span>${en?"From a four-year-old's dream to a program for aircraft engineers.":"من حلم طفل عمره أربع سنوات إلى برنامج لمهندسي الطائرات."}</span></p>
  <div class="abCt"><h4>${en?"Get in touch":"للتواصل"}</h4><div class="abBt">
    <a href="tel:${AB_TEL}">${AB_ICO.tel}<bdi dir="ltr">${AB_PHONE}</bdi></a>
    <a href="mailto:${AB_MAIL}">${AB_ICO.mail}<bdi dir="ltr">${AB_MAIL}</bdi></a>
  </div></div></div>`;
}
function abHTML(){ abCss(); return `<section class="abW" id="abW" aria-label="منو بيرجس؟ · Who is Birjis?" data-il-skip>${abBlock(false)}${abBlock(true)}</section>`; }
