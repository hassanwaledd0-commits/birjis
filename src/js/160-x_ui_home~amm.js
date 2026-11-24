/* ---------- AMM (دليل صيانة الطائرة): the rules for using the manual, its ATA structure, and interactive training task cards
   whose procedure stays locked until the job set-up conditions are met. Training cards only, not approved data. ---------- */
const AMMS={view:"rules", task:null, done:{}, sign:{}};
try{ const j=JSON.parse(localStorage.getItem("atlas-amm")||"null"); if(j&&j.done) AMMS.done=j.done; }catch(e){}
const ammSave=()=>{ try{ localStorage.setItem("atlas-amm",JSON.stringify({done:AMMS.done})); }catch(e){} };

const AMM_RULES=[
  ["المراجعة السارية فقط","يُعمل دائماً بآخر مراجعة معتمدة من الدليل، مع المراجعات المؤقتة (Temporary Revisions) السارية. النسخة المطبوعة أو المحفوظة قد تكون قديمة؛ يُتحقق من رقم المراجعة وتاريخها قبل البدء."],
  ["الفاعلية (Effectivity)","كل مهمة تنطبق على طائرات معيّنة بحسب الرقم التسلسلي للمصنع (MSN) أو التسجيل والتعديلات ونشرات الخدمة (SB) المنفذة. إذا لم تنطبق المهمة على هذه الطائرة بالذات فلا تُستخدم."],
  ["اقرأ المهمة كاملة قبل البدء","تُقرأ المهمة من أولها إلى آخرها، مع كل تحذير وتنبيه وملاحظة، قبل لمس الطائرة. وتُنفّذ الخطوات بالترتيب نفسه دون اختصار."],
  ["التحذيرات: WARNING وCAUTION وNOTE","WARNING: خطر على حياة الأشخاص أو إصابتهم. CAUTION: خطر تلف الطائرة أو المعدات. NOTE: معلومة تسهّل العمل. التحذير يأتي قبل الخطوة التي يخصها دائماً."],
  ["تهيئة العمل (Job Set-up)","قبل الإجراء: تجهيز الأدوات والمعدات المذكورة بالرقم، والمواد المستهلكة المعتمدة، والمراجع المرتبطة، وتحديد المناطق (Zones) ولوحات الوصول (Access panels)، ووضع الطائرة في الحالة المطلوبة (كهرباء، هيدروليك، قواطع مفتوحة ومعلّمة، أقفال العجلات، لافتات التحذير)."],
  ["الأدوات معايَرة ومعتمدة","أدوات القياس (عزم الشد، الضغط، الكهرباء) يجب أن تكون معايرة وضمن تاريخ صلاحيتها. يُستخدم البديل فقط إذا كان مكافئاً معتمداً."],
  ["القيم من الدليل لا من الذاكرة","عزوم الشد والضغوط والكميات والحدود والمواد تؤخذ من الـAMM نفسه في كل مرة، لا من الذاكرة ولا من طائرة أخرى."],
  ["أرقام القطع من الـIPC","القطع تُحدد بأرقامها من كتالوج القطع المصوّر (IPC) مع قابلية التبادل، وكل قطعة جديدة تحتاج شهادة صلاحية وتتبع (مثل EASA Form 1 أو FAA 8130-3)."],
  ["الصلاحية والتأهيل","يُنفّذ المهمة فني مرخّص أو مخوّل لهذا الطراز ولهذا النوع من العمل. المهام الحرجة (أنظمة التحكم بالطيران والمحركات) تحتاج فحصاً مستقلاً مزدوجاً بشخص ثانٍ."],
  ["الإغلاق (Close-up)","بعد العمل: إزالة كل الأدوات والمواد (فحص الأجسام الغريبة FOD)، إعادة القواطع والأنظمة إلى حالتها، إغلاق لوحات الوصول، ثم الاختبار الوظيفي أو التشغيلي المطلوب."],
  ["التوقيع والسجلات","كل خطوة حرجة تُوقَّع، وتُسجَّل المهمة في سجل الطائرة، ثم يصدر شهادة الإفراج للخدمة (CRS) من المخوّل بذلك. ما لم يُسجَّل يُعدّ كأنه لم يُنفّذ."],
  ["الانحراف يحتاج موافقة","أي اختلاف عن الإجراء (أداة مختلفة، ضرر خارج الحدود) لا يُحل بالاجتهاد؛ يُرجع إلى دليل الإصلاحات الهيكلية (SRM) أو الهندسة أو الشركة المصنّعة للحصول على بيانات معتمدة."]];
const AMM_DOCS=[["AMM","دليل صيانة الطائرة: الوصف والتشغيل والإجراءات"],["IPC / AIPC","كتالوج القطع المصوّر: أرقام القطع وقابلية تبادلها"],["SRM","دليل الإصلاحات الهيكلية وحدود الضرر المسموح"],["TSM / FIM","دليل تحرّي الأعطال: من رسالة العطل إلى الحل"],["MEL","قائمة الحد الأدنى من المعدات: ما يجوز الطيران به معطلاً ولأي مدة"],["WDM / ASM","مخططات الأسلاك والأنظمة الكهربائية"],["CMM","دليل صيانة المكوّن عند إصلاحه في الورشة"],["MPD","وثيقة تخطيط الصيانة: متى تُنفّذ كل مهمة (ساعات، دورات، أيام)"]];
const PAGE_BLOCKS=[["001–099","الوصف والتشغيل (Description & Operation)"],["101–199","تحرّي الأعطال (Troubleshooting)"],["201–299","ممارسات الصيانة (Maintenance Practices)"],["301–399","الخدمة: تعبئة الزيت والوقود والهواء (Servicing)"],["401–499","الفك والتركيب (Removal / Installation)"],["501–599","الضبط والاختبار (Adjustment / Test)"],["601–699","الفحص (Inspection / Check)"],["701–799","التنظيف والطلاء (Cleaning / Painting)"],["801–899","الإصلاحات المعتمدة (Approved Repairs)"]];
const ATA_CH=[["05","حدود الوقت وفحوص الصيانة"],["06","الأبعاد والمساحات"],["07","الرفع والإسناد"],["08","الوزن والاستواء"],["09","السحب والتدرج"],["10","الوقوف والربط والتخزين"],["12","الخدمة (Servicing)"],["20","الممارسات القياسية للطائرة"],["21","التكييف والضغط"],["22","الطيار الآلي"],["23","الاتصالات"],["24","الطاقة الكهربائية"],["25","التجهيزات والمقصورة"],["26","الحماية من الحريق"],["27","أنظمة التحكم بالطيران"],["28","الوقود"],["29","الطاقة الهيدروليكية"],["30","الحماية من الجليد والمطر"],["31","أنظمة العرض والتسجيل"],["32","عجلات الهبوط"],["33","الأضواء"],["34","الملاحة"],["35","الأكسجين"],["36","الهواء المضغوط (النزف)"],["38","الماء والفضلات"],["45","نظام الصيانة المركزي"],["49","وحدة الطاقة المساعدة APU"],["51","الممارسات القياسية للهيكل"],["52","الأبواب"],["53","جسم الطائرة"],["54","الأغلفة والأعمدة (Nacelles/Pylons)"],["55","الموازن الأفقي والعمودي"],["56","النوافذ"],["57","الأجنحة"],["71","المحرك كوحدة (Power Plant)"],["72","المحرك"],["73","وقود المحرك والتحكم"],["74","الإشعال"],["75","هواء المحرك"],["76","تحكم المحرك"],["77","مؤشرات المحرك"],["78","العادم وعكس الدفع"],["79","زيت المحرك"],["80","بدء التشغيل"]];

/* task cards (training wording, values deliberately not given: they always come from the approved AMM) */
const AMM_TASKS=[
 {id:"tire",ata:"12-14 / 32-41",en:"Tire Pressure Check",ar:"فحص ضغط الإطارات وتعبئتها",part:"wheels",zone:"منطقة عجلات الهبوط الرئيسية والأمامية",panels:"لا يوجد",
  reason:"ضغط الإطار المنخفض يسبب حرارة زائدة وتلفاً للإطار وقد يؤدي لانفجاره، والمرتفع يقلل التماسك. لذلك يُفحص الضغط يومياً.",
  tools:["مقياس ضغط إطارات معايَر وضمن تاريخ المعايرة","جهاز تعبئة نيتروجين بمنظّم ضغط","غطاء صمام احتياطي"],cons:["غاز النيتروجين الجاف المحدد في الدليل"],refs:["لوحة ضغط الإطارات أو جدولها في الـAMM حسب وزن الطائرة","مهمة فحص الإطارات بصرياً (Inspection)"],
  warn:["لا تقف أمام جانب الإطار ولا خلفه أثناء التعبئة؛ قف جهة الكتف (Tread) لأن الإطار قد ينفجر جانبياً.","لا تُفرغ أو تعبّئ إطاراً ساخناً؛ انتظر حتى يبرد (المدة في الـAMM، وعادة ساعات بعد الهبوط)."],
  caut:["استخدم النيتروجين فقط، لا الهواء العادي، لأن الأكسجين يزيد خطر الاحتراق داخل الإطار عند حرارة الفرامل."],
  notes:["الضغط المقاس على إطار بارد هو المرجع. القراءة على إطار ساخن أعلى من الحقيقية."],
  setup:["الطائرة متوقفة، وفرامل الوقوف مضبوطة، والأسافين (Chocks) مركّبة","أقفال العجلات (Gear pins) مركّبة","الإطارات باردة: مرّ الوقت المطلوب منذ آخر هبوط","مقياس الضغط معايَر ومسجّل رقمه"],
  proc:[["انزع غطاء الصمام وافحص الصمام من التلف",null],["قِس الضغط بالمقياس المعايَر وسجّل القراءة لكل إطار",["wheels",null]],["قارن القراءة بالقيمة المطلوبة من الـAMM لهذا الطراز والوزن",null],["إذا كان الضغط أقل: عبّئ بالنيتروجين ببطء حتى القيمة المطلوبة، ثم أعد القياس",null],["إذا كان الفقد أكبر من الحد المسموح في الـAMM: افحص التسرب وطبّق إجراء الاستبدال",null],["تأكد من عدم التسرب من الصمام، ثم ركّب الغطاء",null]],
  close:["أزل المعدات من منطقة العجلات","سجّل الضغوط في سجل الطائرة"],insp:false},
 {id:"cowl",ata:"71-11",en:"Fan Cowl Doors — Open / Close",ar:"فتح أبواب غطاء المروحة وإغلاقها",part:"eng_fandoor",anim:1,zone:"محرك (المنطقة 400)",panels:"أبواب غطاء المروحة اليسرى واليمنى",
  reason:"للوصول إلى المروحة وعلبة التروس الملحقة وأنابيب الزيت والوقود للفحص والخدمة.",
  tools:["عصي التثبيت المرفقة بالأبواب","منصة عمل آمنة"],cons:[],refs:["مهمة تعطيل عاكس الدفع إذا كان العمل يتطلبه","حدود سرعة الرياح لفتح الأبواب في الـAMM"],
  warn:["تأكد أن المحرك مطفأ وأن لافتة «DO NOT OPERATE» على مفتاح المحرك في القمرة؛ تشغيل المحرك والأبواب مفتوحة يسبب إصابات خطيرة.","لا تفتح الأبواب إذا تجاوزت سرعة الرياح الحد المذكور في الـAMM؛ الريح قد تغلق الباب بقوة."],
  caut:["ثبّت الباب بعصي التثبيت مباشرة بعد رفعه، ولا تترك الباب مرفوعاً دون تثبيت.","أغلق المزاليج (Latches) بالترتيب المحدد في الدليل لتجنب تشوه الباب."],
  notes:["بعض المحركات لها مؤشرات تبيّن أن المزلاج غير مغلق؛ تحقق منها بصرياً عند الإغلاق."],
  setup:["المحرك مطفأ ومرّ وقت التبريد","مفتاح المحرك في القمرة على OFF مع لافتة تحذير","سرعة الرياح ضمن الحد المسموح","المنطقة حول المحرك خالية"],
  proc:[["افتح مزاليج الباب السفلية",null],["ارفع الباب ببطء",["eng_fandoor",1]],["ركّب عصي التثبيت في مواقعها وتأكد من قفلها",null],["نفّذ العمل المطلوب داخل الغلاف",null]],
  close:["فك عصي التثبيت وأعدها لمكانها","أنزل الباب وأغلق المزاليج بالترتيب المحدد","تحقق بصرياً أن كل المزاليج مغلقة تماماً","أزل لافتة التحذير من القمرة"],insp:true},
 {id:"oil",ata:"12-13-79",en:"Engine Oil Servicing",ar:"تعبئة زيت المحرك",part:"engine",zone:"محرك (المنطقة 400)",panels:"باب الوصول لخزان الزيت",
  reason:"للحفاظ على كمية الزيت ضمن الحدود؛ الاستهلاك غير الطبيعي مؤشر مبكر على عطل.",
  tools:["وعاء تعبئة نظيف أو مضخة تعبئة","قطعة قماش خالية من الوبر"],cons:["زيت المحرك المعتمد بالنوع والماركة المذكورين في الدليل"],refs:["مهمة فتح باب الوصول للزيت","حدود استهلاك الزيت"],
  warn:["زيت المحرك ساخن بعد التشغيل وقد يكون تحت ضغط؛ افتح الغطاء ببطء وارتدِ القفازات والنظارات.","الزيت الصناعي ضار بالجلد؛ اغسل أي ملامسة فوراً."],
  caut:["لا تخلط أنواعاً أو ماركات زيت مختلفة إلا إذا سمح الدليل.","تأكد أن غطاء الخزان مقفل تماماً؛ الغطاء المفتوح يسبب فقدان الزيت في الطيران وإطفاء المحرك."],
  notes:["افحص المستوى ضمن المدة المحددة في الـAMM بعد إطفاء المحرك، لأن الزيت ينزل تدريجياً إلى الخزان فيتغير المستوى."],
  setup:["المحرك مطفأ ضمن المدة الزمنية المحددة لقراءة المستوى","لافتة «DO NOT OPERATE» على مفتاح المحرك","الزيت المتوفر من النوع المعتمد نفسه"],
  proc:[["افتح باب الوصول لخزان الزيت",["engine",null]],["اقرأ المستوى من زجاجة البيان (Sight gauge) أو الشاشة",null],["افتح الغطاء ببطء وأضف الزيت حتى المستوى المطلوب دون تجاوزه",null],["ركّب الغطاء وتأكد من قفله بالكامل",null],["سجّل الكمية المضافة لحساب معدل الاستهلاك",null]],
  close:["افحص عدم وجود تسرب حول الغطاء","أغلق باب الوصول","أزل لافتة التحذير"],insp:true},
 {id:"pins",ata:"32-00 / 10-11",en:"Landing Gear Ground Safety Pins",ar:"تركيب أقفال أمان العجلات",part:"gear_main",zone:"حجرات العجلات",panels:"لا يوجد",
  reason:"تمنع الأقفال انطواء العجلات على الأرض أثناء الصيانة أو عند تحريك ذراع العجلات بالخطأ.",
  tools:["أقفال الأمان الخاصة بالطراز مع أعلامها الحمراء «REMOVE BEFORE FLIGHT»"],cons:[],refs:["مواقع الأقفال في الـAMM"],
  warn:["لا تقف داخل مسار حركة العجلات أو أبوابها عندما يكون في النظام الهيدروليكي ضغط."],
  caut:["عدد الأقفال المركّبة يُسجَّل، ويُحسب عند الإزالة قبل الطيران."],
  notes:["في الـA380 أقفال للعجلة الأمامية والعجلات الرئيسية في الجناح والجسم؛ في الـ737 قفل للأمامية واثنان للرئيسية."],
  setup:["الطائرة على الأرض والأسافين مركّبة","ذراع العجلات في القمرة على DOWN","لا يوجد عمل في حجرات العجلات"],
  proc:[["ركّب قفل العجلة الأمامية في موضعه",["gear_nose",0]],["ركّب أقفال العجلات الرئيسية",["gear_main",0]],["تأكد أن كل علم أحمر ظاهر ومثبت",null],["سجّل عدد الأقفال المركّبة",null]],
  close:["عند الإفراج للطيران: أزل كل الأقفال وطابق عددها مع السجل","خزّن الأقفال في مكانها في الطائرة"],insp:false},
 {id:"door",ata:"52-11",en:"Passenger Door — Open From Outside",ar:"فتح باب الركاب من الخارج",part:"doors",anim:1,zone:"باب الركاب الأمامي",panels:"لا يوجد",
  reason:"لدخول الطائرة على الأرض. الخطر الأكبر هو انطلاق الزلاقة إذا كانت مسلحة.",
  tools:["سلم أو جسر ركاب"],cons:[],refs:["إجراء نزع تسليح الزلاقة من الداخل"],
  warn:["تأكد من نافذة الباب أو المؤشر أن الزلاقة غير مسلّحة (DISARMED) قبل فتح الباب؛ فتح باب بزلاقة مسلحة يطلقها بقوة كبيرة وقد يسبب إصابات قاتلة.","قف جانباً عن مسار الباب أثناء فتحه."],
  caut:["لا تترك الباب مفتوحاً دون تثبيته بقفل الريح (Gust lock)."],
  notes:["أبواب الـA380 تتحرك للخارج ثم للأمام موازية للجسم، وباب الـ737 يدور على مفصلة أمامية."],
  setup:["المضيف أو الطاقم في الداخل أُبلغ","مؤشر الزلاقة يبيّن DISARMED","المنصة أو الجسر في مكانه ومثبت"],
  proc:[["تحقق مجدداً من مؤشر الزلاقة",null],["ارفع مقبض الباب الخارجي",null],["ادفع الباب للخارج ثم إلى مكانه المفتوح",["doors",1]],["تأكد من تعشيق قفل الريح",null]],
  close:["عند الإغلاق: حرّر قفل الريح وأغلق الباب","تحقق أن المقبض في وضع القفل وأن مؤشر الباب مغلق"],insp:false},
 {id:"fuel",ata:"12-11-28",en:"Pressure Refuel",ar:"التزوّد بالوقود تحت الضغط",part:"fuel",zone:"لوحة التزود تحت الجناح",panels:"باب لوحة التزود بالوقود",
  reason:"تعبئة الخزانات بالكمية المطلوبة للرحلة من نقطة واحدة.",
  tools:["سيارة الوقود أو صنبور المطار","كابل التأريض"],cons:["وقود الطائرات المعتمد (Jet A-1)"],refs:["حدود كمية كل خزان","إجراءات السلامة عند التزوّد والركاب على متن الطائرة"],
  warn:["وصّل كابل التأريض بين الطائرة وسيارة الوقود قبل فتح أي غطاء؛ الكهرباء الساكنة قد تشعل أبخرة الوقود.","لا تشغيل للرادار ولا استخدام لأجهزة غير مسموحة قرب الطائرة أثناء التزوّد."],
  caut:["راقب الكمية في كل خزان ولا تتجاوز سعة الخزان؛ صمامات الإيقاف التلقائي لا تُعتبر بديلاً عن المراقبة."],
  notes:["كمية الوقود تُدخل بالوزن (كغ) وتُحوّل للحجم حسب كثافة الوقود الفعلية."],
  setup:["كابل التأريض موصول","طفاية الحريق متوفرة في المنطقة","الكمية المطلوبة لكل خزان معروفة"],
  proc:[["افتح باب لوحة التزود",["fuel",null]],["أدخل الكمية المطلوبة واختر الوضع الآلي",null],["وصّل خرطوم الوقود وابدأ الضخ",null],["راقب كمية الخزانات حتى التوقف التلقائي",null],["افصل الخرطوم وأغلق الأغطية",null]],
  close:["افصل كابل التأريض في النهاية","سجّل الكمية والكثافة","أغلق باب لوحة التزود"],insp:false}];

function ammHTML(){
  const v=AMMS.view;
  return `<div class="amm">
    <div class="ammhead"><div><h2>دليل الصيانة AMM</h2><p class="status">Aircraft Maintenance Manual — الدليل الذي تُنفّذ به كل أعمال الصيانة على ${esc(AC[S.ac].name)}.</p></div>
      <div class="seg ammseg" role="group" aria-label="أقسام الدليل">${[["rules","شروط استخدامه"],["struct","بنية الدليل"],["tasks","بطاقات المهام"]].map(([k,t])=>`<button type="button" data-av="${k}" aria-pressed="${v===k}">${t}</button>`).join("")}</div></div>
    <p class="ammnote">بطاقات تدريبية تشرح أسلوب الـAMM وشروطه، وليست مأخوذة من دليل معتمد ولا تصلح للعمل على طائرة حقيقية. القيم والعزوم والحدود تؤخذ دائماً من الـAMM المعتمد للطائرة نفسها بآخر مراجعة.</p>
    <div id="ammBody">${v==="rules"?ammRules():v==="struct"?ammStruct():ammTasks()}</div></div>`;
}
function ammRules(){
  return `<ol class="ammrules">${AMM_RULES.map(([t,d],i)=>`<li><b>${esc(t)}</b><p>${esc(d)}</p></li>`).join("")}</ol>
    <h3 class="ammh">الـAMM ليس وحده: الوثائق المرتبطة</h3>
    <div class="ammdocs">${AMM_DOCS.map(([a,b])=>`<div><b dir="ltr">${esc(a)}</b><span>${esc(b)}</span></div>`).join("")}</div>`;
}
function ammStruct(){
  const parts=Object.keys(PARTS).filter(partVisible);
  const partsOf=ch=>parts.filter(id=>(PARTS[id].ata||"").match(/\d+/g)&&PARTS[id].ata.match(/\d+/g).indexOf(ch)>=0);
  return `<div class="ammtn"><h3 class="ammh">كيف يُقرأ رقم المهمة</h3>
      <div class="tnum" dir="ltr"><span><b>32</b><i>الفصل ATA</i></span><span>-</span><span><b>41</b><i>القسم</i></span><span>-</span><span><b>00</b><i>الموضوع</i></span><span>-</span><span><b>601</b><i>نوع العمل (Page block)</i></span></div>
      <p class="status">الفصل 32 = عجلات الهبوط، والقسم 41 = العجلات والفرامل، و601 = فحص. ترقيم الفصول موحّد بين الشركات حسب مواصفة ATA iSpec 2200، فالفصل 32 هو عجلات الهبوط في إيرباص وبوينغ معاً.</p>
      <div class="pblk">${PAGE_BLOCKS.map(([a,b])=>`<div><b dir="ltr">${a}</b><span>${esc(b)}</span></div>`).join("")}</div></div>
    <h3 class="ammh">فصول ATA — اضغط فصلاً لترى قطعه على النموذج</h3>
    <div class="atagrid">${ATA_CH.map(([n,t])=>{ const ps=partsOf(n); return `<button type="button" class="ata${ps.length?"":" none"}" data-ata="${n}" ${ps.length?"":"aria-disabled=\"true\""}><b dir="ltr">${n}</b><span>${esc(t)}</span>${ps.length?`<em>${ps.length} قطعة</em>`:""}</button>`; }).join("")}</div>
    <div id="ataOut" class="status" aria-live="polite"></div>`;
}
function ammTasks(){
  const t=AMM_TASKS.find(x=>x.id===AMMS.task);
  return `<div class="tasklist">${AMM_TASKS.map(x=>{ const d=AMMS.done[x.id]||{}, n=x.setup.length+x.proc.length+x.close.length, k=Object.keys(d).filter(q=>d[q]).length;
      return `<button type="button" class="tcard" data-at="${x.id}" aria-pressed="${AMMS.task===x.id}"><span dir="ltr" class="tata">ATA ${esc(x.ata)}</span><b>${esc(x.ar)}</b><small dir="ltr">${esc(x.en)}</small><span class="tprog"><i style="width:${Math.round(100*k/n)}%"></i></span></button>`; }).join("")}</div>
    ${t?ammCard(t):`<p class="status">اختر مهمة لتفتح بطاقتها. الإجراء يبقى مقفلاً حتى تتحقق كل شروط تهيئة العمل، تماماً كما يُطلب في الـAMM.</p>`}`;
}
function ammCard(t){
  const d=AMMS.done[t.id]||(AMMS.done[t.id]={}), all=(pre,arr)=>arr.every((_,i)=>d[pre+i]);
  const setOK=all("s",t.setup), procOK=setOK&&all("p",t.proc), closeOK=procOK&&all("c",t.close);
  const ck=(pre,i,txt,dis,show)=>`<li class="${d[pre+i]?"ok":""}"><label><input type="checkbox" data-as="${pre+i}" ${d[pre+i]?"checked":""} ${dis?"disabled":""}><span>${esc(txt)}</span></label>${show?`<button type="button" class="btn sm" data-ash="${show[0]}" data-asa="${show[1]==null?"":show[1]}" ${dis?"disabled":""}>أرني على النموذج</button>`:""}</li>`;
  const n=t.setup.length+t.proc.length+t.close.length, k=Object.keys(d).filter(q=>d[q]).length;
  return `<article class="tcardx">
    <header><span dir="ltr" class="tata">TASK ${esc(t.ata)} · ${esc(t.en)} <em>(TRAINING)</em></span><h3>${esc(t.ar)}</h3>
      <div class="tbar" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${k}"><i style="width:${Math.round(100*k/n)}%"></i></div></header>
    <section><h4 dir="ltr">1. REASON FOR THE JOB</h4><p>${esc(t.reason)}</p></section>
    <section><h4 dir="ltr">2. JOB SET-UP INFORMATION</h4>
      <dl class="tinfo"><div><dt>الفاعلية</dt><dd>${esc(AC[S.ac].name)} (تعليمي)</dd></div><div><dt>المنطقة</dt><dd>${esc(t.zone)}</dd></div><div><dt>لوحات الوصول</dt><dd>${esc(t.panels)}</dd></div>
      <div><dt>الأدوات والمعدات</dt><dd>${t.tools.map(esc).join("<br>")||"—"}</dd></div><div><dt>المواد المستهلكة</dt><dd>${t.cons.map(esc).join("<br>")||"—"}</dd></div><div><dt>المراجع</dt><dd>${t.refs.map(esc).join("<br>")}</dd></div></dl></section>
    ${t.warn.map(w=>`<div class="twarn"><b dir="ltr">WARNING</b><p>${esc(w)}</p></div>`).join("")}
    ${t.caut.map(w=>`<div class="tcaut"><b dir="ltr">CAUTION</b><p>${esc(w)}</p></div>`).join("")}
    ${t.notes.map(w=>`<div class="tnote"><b dir="ltr">NOTE</b><p>${esc(w)}</p></div>`).join("")}
    <section><h4 dir="ltr">3. JOB SET-UP</h4><ol class="tsteps">${t.setup.map((s,i)=>ck("s",i,s,false)).join("")}</ol></section>
    <section class="${setOK?"":"locked"}"><h4 dir="ltr">4. PROCEDURE ${setOK?"":`<span class="lockt">مقفل حتى تكتمل تهيئة العمل</span>`}</h4><ol class="tsteps">${t.proc.map((s,i)=>ck("p",i,s[0],!setOK||(i>0&&!d["p"+(i-1)]),s[1])).join("")}</ol></section>
    <section class="${procOK?"":"locked"}"><h4 dir="ltr">5. CLOSE-UP ${procOK?"":`<span class="lockt">بعد إكمال الإجراء</span>`}</h4><ol class="tsteps">${t.close.map((s,i)=>ck("c",i,s,!procOK)).join("")}</ol></section>
    <section class="tsign ${closeOK?"":"locked"}"><h4 dir="ltr">6. SIGN-OFF</h4>
      <div class="tsg"><label>اسم الفني المنفّذ<input type="text" ${closeOK?"":"disabled"} autocomplete="off"></label>${t.insp?`<label>اسم المفتش المستقل (فحص مزدوج)<input type="text" ${closeOK?"":"disabled"} autocomplete="off"></label>`:""}</div>
      <p class="status">${closeOK?(t.insp?"هذه مهمة حرجة: لا تكتمل إلا بتوقيع فني ثانٍ يفحص العمل مستقلاً.":"اكتملت البطاقة. في الواقع يُوقَّع هنا ثم في سجل الطائرة."):"يُفتح التوقيع بعد إكمال كل الخطوات."}</p></section>
    <div class="tfoot"><button type="button" class="btn" data-ar="1">إعادة البطاقة</button></div>
  </article>`;
}
function ammMount(root){
  const el=root.querySelector(".amm");
  el.addEventListener("click",e=>{
    const v=e.target.closest("[data-av]"); if(v){ AMMS.view=v.dataset.av; renderTab(); return; }
    const t=e.target.closest("[data-at]"); if(t){ AMMS.task=AMMS.task===t.dataset.at?null:t.dataset.at; renderTab(); return; }
    const sh=e.target.closest("[data-ash]"); if(sh){ const a=sh.dataset.asa; lrnShow(()=>lrnSel(sh.dataset.ash,a===""?null:+a)); return; }
    if(e.target.closest("[data-ar]")){ delete AMMS.done[AMMS.task]; ammSave(); renderTab(); return; }
    const a=e.target.closest("[data-ata]"); if(a&&!a.classList.contains("none")){ const ch=a.dataset.ata, ids=Object.keys(PARTS).filter(partVisible).filter(id=>(PARTS[id].ata||"").match(/\d+/g)&&PARTS[id].ata.match(/\d+/g).indexOf(ch)>=0);
      el.querySelector("#ataOut").innerHTML=`الفصل ${ch}: `+ids.map(id=>`<button type="button" class="btn sm" data-ash="${id}" data-asa="">${esc(PARTS[id].ar)}</button>`).join(" ");
      el.querySelectorAll("[data-ata]").forEach(b=>b.setAttribute("aria-pressed",b===a)); return; }
  });
  el.addEventListener("change",e=>{
    const c=e.target.closest("[data-as]"); if(!c) return; const d=AMMS.done[AMMS.task]||(AMMS.done[AMMS.task]={});
    d[c.dataset.as]=c.checked;
    if(!c.checked){ /* unticking a step un-ticks everything that depended on it */ const t=AMM_TASKS.find(x=>x.id===AMMS.task), pre=c.dataset.as[0];
      if(pre==="s"){ t.proc.forEach((_,i)=>delete d["p"+i]); t.close.forEach((_,i)=>delete d["c"+i]); }
      if(pre==="p"){ const k=+c.dataset.as.slice(1); t.proc.forEach((_,i)=>{ if(i>k) delete d["p"+i]; }); t.close.forEach((_,i)=>delete d["c"+i]); } }
    ammSave(); const y=scrollY; renderTab(); scrollTo(0,y);
  });
}
