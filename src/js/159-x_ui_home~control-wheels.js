/* ---------- Control wheels (Boeing 737 / 747-400) and sidesticks (A380): the pilot's hand controls, drawn as their own cockpit area and as a band in the whole-deck picture.
   Each button carries a numbered callout (like a fighter-stick diagram) and an Arabic explanation. Loaded after p7d.js.
   Only functions confirmed by at least one aviation source are drawn. NOT drawn: a push-to-talk switch on the Boeing wheels (not confirmed). The sources are secondary
   (open aviation sites and simulator documentation) and are listed in TODO-VERIFY.md until checked against the manufacturer's manual. ---------- */
(function(){
const D=(a,b,c)=>[a,b,c];
const sw=(id,x,y,lbl,pos,o)=>Object.assign({k:"sw",id,x,y,lbl,pos,v:0},o||{});
const co=(id,ref,n,txt,bx,by,w,tx,ty)=>({k:"co",id,ref,n,txt,x:bx,y:by,w,tx,ty});
const PW=250, PH=280;

/* ---- artwork: the captain's version, drawn with the outboard side on the left; the first officer's is the mirror image ---- */
/* the artwork lives in x_stick_art.js (shared with the flight deck); one copy per seat so the gradient ids stay unique */
const wheelSvg=pre=>skSvg("yoke",pre), stickSvg=pre=>skSvg("side",pre);
const mirror=svg=>`<g transform="translate(${PW},0) scale(-1,1)">${svg}</g>`;

/* ---- the two panels of one aircraft: seat = "c" (captain, outboard left) or "f" (first officer, outboard right) ---- */
function panels(ac,art,items){
  return ["c","f"].map((seat,i)=>{
    const L=seat==="c", ox=L?190:460, X=x=>L?x:PW-x;
    const cs=[], cos=[];
    items.forEach((it,j)=>{
      cs.push(sw(it.id,X(it.x),it.y,it.lbl,it.pos,{w:it.w,h:it.h,col:it.col,mark:it.mark,pd:it.pd,d:it.d}));
      cos.push(co("co"+(j+1),it.id,j+1,it.short,L?-180:PW+8,22+j*54,170,X(it.x),it.y));
    });
    const a=art("k"+seat); return {id:"y"+seat,t:L?"CAPT":"F/O",x:ox,y:10,w:PW,h:PH,svg:L?a:mirror(a),c:cs.concat(cos)};
  });
}
function area(t,ac,art,items){ return {t,w:900,h:300,panels:panels(ac,art,items)}; }

/* ---- Boeing 737 and 747-400: AP disengage switch and stabilizer-trim switches on the outboard horn ---- */
const B7=(ac)=>{
  const is747=ac==="b747";
  return [
    {id:"ap",x:22,y:42,w:16,h:14,col:"r",lbl:"AP DISC",short:"AP DISC",pos:["RELEASED","PRESSED"],
      pd:["غير مضغوط: الطيار الآلي كما هو","مضغوط: ينفصل الطيار الآلي ويُصدر إنذاراً"],
      d:D("مفتاح فصل الطيار الآلي (AP DISENGAGE)",is747
        ?"زر أحمر على القرن الخارجي للعجلة. هو الطريقة المعتادة لفصل الطيار الآلي أثناء الطيران؛ وشريط الفصل في لوحة MCP نظام احتياطي."
        :"زر أحمر على القرن الخارجي للعجلة. ضغطة واحدة تفصل الطيار الآلي مع إنذار صوتي وضوئي، وضغطة ثانية تُسكت الإنذار. إن تعطل المفتاح الكهربائي فهناك شريط فصل ميكانيكي احتياطي في لوحة MCP.","غير مضغوط في الطيران")},
    {id:"trim",x:22,y:82,w:11,h:30,col:"w",lbl:"STAB TRIM",short:"STAB TRIM",pos:["NEUTRAL","NOSE UP","NOSE DN"],
      pd:["لا حركة","تشذيب الأنف للأعلى","تشذيب الأنف للأسفل"],
      d:D(is747?"مفاتيح تشذيب المثبّت (STAB TRIM)":"مفتاحا تشذيب المثبّت (STAB TRIM)",
        is747?"على القرن الخارجي للعجلة؛ تحرّك المثبّت الأفقي كهربائياً لتشذيب الأنف للأعلى أو للأسفل. استعمالها أثناء تشغيل طيار آلي واحد يفصله."
             :"مفتاحان على القرن الخارجي للعجلة يحرّكان المثبّت الأفقي كهربائياً لتشذيب الأنف للأعلى أو للأسفل. استعمالهما أثناء الطيار الآلي يفصله.","محايد")}
  ];
};
/* ---- A380: the red takeover button and the radio push-to-talk switch on the sidestick ---- */
const SS=()=>[
  {id:"tk",x:118,y:38,w:16,h:12,col:"r",lbl:"TAKEOVER",short:"TAKEOVER (PRIORITY)",pos:["RELEASED","PRESSED"],
    pd:["غير مضغوط","مضغوط: يُفصل الطيار الآلي، وبالضغط المستمر تأخذ العصا الأولوية"],
    d:D("زر أولوية العصا (TAKEOVER / PRIORITY)","الزر الأحمر على العصا: ضغطة سريعة تفصل الطيار الآلي، والضغط المستمر يعطي عصاك الأولوية فتُهمَل مدخلات العصا الأخرى. وإذا حرّك الطياران العصاوين معاً دون ضغطه يُصدر النظام إنذار DUAL INPUT.","غير مضغوط")},
  {id:"ptt",x:134,y:112,w:24,h:11,col:"w",mark:"PTT",lbl:"PTT",short:"PTT (RADIO)",pos:["RELEASED","PRESSED"],
    pd:["غير مضغوط","مضغوط: الإرسال اللاسلكي"],
    d:D("مفتاح الإرسال اللاسلكي (PTT)","اضغطه لتتكلم عبر جهاز الاتصال اللاسلكي المختار؛ منفصل عن زر الأولوية.","غير مضغوط")}
];

const NOTE="وظائف الأزرار هنا من مصادر ثانوية (مواقع طيران مفتوحة ووثائق محاكاة) وتنتظر التحقق من دليل الشركة المصنّعة. قد توجد أزرار أخرى بحسب الطراز والتجهيز، ولم أضفها لأنها غير مؤكدة (مثل مفتاح الإرسال اللاسلكي بعجلات بوينغ).";
CK.b737.areas.yoke=area("عجلة القيادة (Yoke)","b737",wheelSvg,B7("b737")); CK.b737.yokeNote=NOTE;
CK.b747.areas.yoke=area("عجلة القيادة (Yoke)","b747",wheelSvg,B7("b747")); CK.b747.yokeNote=NOTE;
CK.a380.areas.yoke=area("العصا الجانبية (Sidestick)","a380",stickSvg,SS()); CK.a380.yokeNote=NOTE;
})();
