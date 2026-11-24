# CLAUDE.md — Birjis / بيرجس (project memory)

> **Restored on 2026-11-12.** The original working copy (with a ~600-line CLAUDE.md, 67 test scripts and the git history)
> lived only in a cloud container that was recycled. The source was cut back out of the deployed page (see RECOVERY.md);
> sections 32 and 33 below are the original text, recovered from the session log. Everything above them is rewritten from memory.

## Rules that always apply
- Reply to the owner in Iraqi Arabic. No airline / brand logos or names in site content. Never invent a number: unverified facts go to TODO-VERIFY.md.
- Never remove a feature, lesson or translation. Saved progress (33 localStorage keys with the prefixes `atlas-`, `birjis-`, `bw-`, and the IndexedDB database `birjis-notes`) must keep loading: a changed key or format needs a migration.
- Keep the notice «للاستخدام التعليمي فقط، وليس للتشغيل أو الصيانة».
- One improvement per commit; never claim something works without running it.
- **Push after every step.** A local-only repository is how the source was lost.

## How it is built
- `./build.sh` concatenates `src/app.html` + the files of `src/manifest.txt` (in that order) into `dist/aircraft-atlas.html`.
- `python3 tools/mksite.py` wraps it into `dist/site/` (the deploy package) and `dist/old-site/` (301 redirect package for the old address). The production address is `site_url` in `site.config.json` (birjis3.netlify.app since step 2); deploy steps in `docs/DEPLOY.md` (Arabic).
- Since step 3 the site serves three.js r128 (`node_modules/three` 0.128.0) and the IBM Plex fonts (`@fontsource/*` 5.3.0, Arabic + Latin subsets, woff2, inline `@font-face`) itself from `dist/site/vendor/` (mksite.py swaps the tags; cached 1 year, immutable: a new version needs a new file name). The Claude artifact copy (`dist/aircraft-atlas.html`) keeps cdnjs + Google Fonts. The smoke test fails on any request to another host. No API keys in the page.
- AI (Meyslon chat, lesson tutor, quiz «why», camera, flight coach) since step 2b goes through three tiers (`src/js/186a-x_ai~tiers.js`): (a) `window.claude` sample inside a Claude artifact, (b) the server function `netlify/functions/ask.mjs` (key only in Netlify env `ANTHROPIC_API_KEY`; path = `ai_endpoint` in `site.config.json`, written as `<meta name="birjis-ai">` by mksite, absent in the artifact copy), (c) offline answers from the site's content (`186b-x_ai~local.js`, with links). `getSample()` never returns null any more. A failing tier is rested (`AI.aDown/bDown`) and the next answers; the mode line `[data-aimode]` says which. Camera without a/b: manual part picker. When the 3D view cannot start, `no3d(why)` (`190-p4s~start.js`) shows `#glFail` over the 2D drawing: why (`script` / `webgl` / `init` / `offline`) and «أعد المحاولة» (reload). New UI strings get English via `ilExtra([[ar,en]])` (the dictionary packer is lost).

## Where things are (src/js, in manifest order)
`NNN-<old file name>.js` starts an original file; `NNN-<old name>~<banner>.js` is a later section (possibly a later original file) in the same run.
p2* parts data and specs · p3* schematics · p5a–p5g and m_* the procedural 3D models (A380, 737-800, 747-400) · p5c2 the WebGL viewer · p6*, p9* the 274 lessons in 14 books ·
x_* extensions (brand, Meyslon, lesson engine, flight world, i18n, notebook, home UI) · p7* cockpit · p8* flight physics and simulator · p4* glossary, camera, dashboard and the app shell (last).
- English layer: `const ILDATA` (packed) in the i18n piece; decode with `tools/i18n_unpack.py`. The packer was lost and must be rewritten before translations can be edited.
- Pitfall: later files override earlier values (the A380 fin and nose profile set in the p3 piece are overridden in the p5f piece). Grep for `GEO.a380` before tuning a number.

## State of the checks
- Recovered: `tests/hub_test.py`, `tests/cockpit_view_test.py` (they expect Python Playwright and `node_modules/three`; not re-run since the recovery).
- **`./check.sh`** (step 1, 2026-11-13; `tests/reg.sh` is an alias; step 2b added `tests/ai_function_test.mjs` and `tests/ai_test.js`, step 3 `tests/no3d_test.js`): build, `html-validate` (recommended rules), `tools/check_links.py`, `tests/smoke.js` (19 sections x ar/en x 360/1280 px = 76 openings, a part card, two flights; fails on any console error). `SMOKE_SITE=<dir>` tests another folder. Known warning: the cockpit section scrolls sideways in English at 360 px.
- Lost: the other 65 scripts.
- Baseline (2026-11-11, Lighthouse 13.6, local gzip server, software GL): mobile performance 26 (FCP 11.0 s, LCP 11.0 s, TBT 12.3 s, CLS 0), desktop 34 (CLS 0.86); accessibility, best practices and SEO 100.



## 32. النسخة 36: الأداء، الاسم والشعار، لوحة «المركز»، القمرة، الدفتر، مطابقة المجسّمات

طلب المستخدم (نص + صورتا موبايل + zip لنموذجَي A380 و747-400 + PDF شعارات + `/design:design-system`): (1) تأخر فتح قائمة الطائرات بعد الترحيب وبطء التنقل بين القوائم وشاشة سودة عند تحميل الـ3D، (2) العصا الجانبية غير واقعية، (3) «أطلس» → «بيرجس» والشعار الخيار 1 من الـPDF، (4) إزالة الطائرات الواقفة بالمدرج والبوابات إلا اللي تركّب ركاب، (5) لوحة (مركز) تضم أدوات الإقلاع والهبوط، (6) شبابيك الطائرة غير ظاهرة بالقمرة، (7) تبويب دفتر منفصل (رسم، نص، تسجيل صوت/فيديو)، (8) مجسّم مطابق «100٪» للطائرة الحقيقية.

**نقطة تشغيل مهمة:** `src/p5f.js` يُحمَّل **بعد** `p3.js` ويُعيد كتابة `GEO.a380.fin/top/bot/fairing/doorList/...`. تعديل قيمة بـ`p3.js` ثم رؤيتها «لا تفعل شيئاً» سببه غالباً هذا (ضاع به ساعة بتعديل الزعنفة). ابحث `grep -n "GEO.a380" src/*.js` قبل ضبط أي رقم.

### 32.1 الأداء (البند 1)
| المشكلة | العلاج | الملف |
|---|---|---|
| بناء الهنجر مع كل `setAircraft` | `ensureHangar()` كسول (يُبنى عند اختيار بيئة الهنجر فقط، ويُحفظ بـ`hangars` لكل طائرة)؛ الإقلاع الأول `GL.lazyHangar(true)` | `p5c2.js`, `p4s.js` |
| بناء كل قطع ED (آلاف الشبكات) عند فتح القائمة | بناء على مرحلتين: `edEnsure(B,all)`، `B.ed=1` المظهر الخارجي فقط و`2` الكل؛ `syncI` يطلب الكل فقط عند الداخل/التفكيك/التحديد | `m_ed_gen.js`, `p5c2.js` |
| كل شيء بنفس لحظة العرض الأول | مجدول وقت الفراغ `perfWarm(name,fn,ms)` / `idleDo`: الهنجر بعد 2.5ث والـED بعد 1.5ث بوقت هادئ | `p4s.js` |
| بوبي يرسم بكل الصفحة | `bobFrame` يتخطى النسخ خارج طبقة الترحيب وهي مفتوحة؛ فجوة 42/70 مللي | `x_bobby.js` |
| نسيج المدرج/الرصيف غير المرئي مكلف | نسيج 8×8 للمخفي، `willReadFrequently`، `apNoise` بـImageData | `p5g.js`, `p5c2.js` |
| الأجهزة الضعيفة | طبقة `PHONE` (DPR ≤ 1.5، `PCFShadowMap`، خريطة ظل 1024)، فجوة الدوران 44مللي | `p5c2.js` |
| الشاشة السودة | صورة بديلة أولاً `#glPoster` ثم أول فريم ثم تلاشي (`glFirstFrame`)؛ أزرار الطائرة `setAcSoft` (تبديل بلا حجب)؛ استقبال `webglcontextlost/restored` برسالة واستعادة (`glLostUI`)؛ شاشة تحميل لبدء الطيران `flyStartSoft` ترسم أولاً ثم تبني العالم | `p4s.js`, `p1s.html`, `p8f.js` |

**بدء الطيران:** شاشة التحميل `flyStartSoft` تُتخطى تحت الأتمتة (`navigator.webdriver`) كي تبقى توقيتات الاختبارات القديمة كما كانت؛ `FLY.soft=true` يعيدها لاختبارها.

**لم يُنجز:** إعادة `perfWarm("ed")` بعد تبديل الطائرة (يُبنى الـED عند أول حاجة)، وتقسيم الكود (Q4). **القياس** (`prof.py`: SwiftShader + تبطيء معالج 4× على نافذة 390×844 بوضع الموبايل، مقابل بناء v35 من git؛ **الرسم برمجي، ليس GPU حقيقياً**): انشغال المسار الرئيسي بالتحميل (+3ث خمول) 8.0ث → 6.5ث (−18٪) وأطول مهمة 3.8ث → 2.6ث؛ بإغلاق الترحيب 3.6ث → 2.6ث (−27٪) وأطول مهمة 1.9ث → 1.3ث؛ **بفتح قائمة الطائرات 3.6ث → 3.35ث (−8٪ فقط)**: هذه الفترة تهيمن عليها كلفة الرسم البرمجي `(program)` و`drawImage` (≈ 3ث من 3.4) وليس الجافاسكربت (`uiRender` + `setTab` ≈ 90 مللي ثانية). مؤشرات الـGL بتبويب القطع (وهي الأقرب لما يشعر به GPU حقيقي): نداءات الرسم 392 → 348 (−11٪)، المثلثات 207 ألف → 182 ألف (−12٪)، النسيج 18 → 7، ومجسّمات المطار/الهنجر 59 → 0 (تُبنى وقت الفراغ). **الخلاصة الصادقة:** الشغل الثقيل لم يُلغَ، نُقل لوقت الفراغ بعد التحميل (يظهر بأول تبويب بعد الإغلاق، `tab spec` أبطأ بالقياس لهذا السبب)، فالأثر المحسوس المتوقع: تحميل وإغلاق ترحيب أخف، وقائمة تُفتح بدون بناء الهنجر والقطع التفصيلية؛ **أما «الخفة» بجهاز حقيقي فلم تُقَس.**

### 32.2 الاسم والشعار (البند 3)
الاسم الظاهر «بيرجس / Birjis» بكل مكان (العنوان، الترويسة، الترحيب، `og`، Netlify). بقيت أسماء الملفات الداخلية (`aircraft-atlas.html`) ومفاتيح التخزين `atlas-*` لعدم فقد بيانات المستخدم. الشعار الخيار 1 «مركز الثقل»: متجهات SVG بـ`data/brand/` (انظر README هناك)، مُعاد بناؤها بـ`x_brand.js` (`bwLogo/bwMark/bwWord/bwWordLat`)؛ الجزء العربي تطابقه 97.8٪ مع الصورة. الاختبار: `brand_test.py`.

### 32.3 لوحة «المركز» (البند 5)
زر واحد `#fHubB` (مفتاح **H**) يفتح `#fHub`: شرائح القلابات حسب الطائرة (`flyHubBuild` من `s.A.flaps`) و±، وبلاطات العجلات، السبويلر، الفرامل (اضغط مطوّلاً)، فرامل الوقوف (`park`، أرضي فقط)، عكس الدفع (أرضي فقط). اختفت الأزرار المفردة من الشاشة. التموضع: بحث مساحة حرة بشبكة 8px (`ffHubPlace`): عوائق **صلبة** = أدوات الطيران (العصا، المسرّع، الدفة، أعمدة الأزرار، الشريط العلوي، زر المركز)، و**ناعمة** = شريط المراقب الجوي ومناطق لمس الأجهزة (`fdh/fdbig`) يجوز تغطيتها مؤقتاً، ثم رسم الـHUD (قدر الإمكان)، وأقرب لزر المركز (على شاشة 360px اللوحة أعرض من الشبكة بالهامش فلا يوجد مرشح: أُصلح بإزالة هامش الخلايا؛ كان يرميها بالزاوية فوق الشريط العلوي)؛ يُغلق بـEscape أو نقرة خارجه أو زر الطيار الآلي (الاثنان لا يظهران معاً)؛ التركيز يعود للزر. حالة البلاطات تتحدّث من `flyDom`. الاختبار: `tests/hub_test.py` (4 أحجام شاشة × منظورين، نقرات فأرة حقيقية).

### 32.4 قمرة الطيران (البندان 2 و6)
`x_stick_art.js` (جديد): رسم طبقات متجهية مشترك للعجلة (737/747) والعصا الجانبية (A380) بشكلين: `skSvg()` لتبويب القمرة (`p7e.js` يضع عليه الأغطية المرقّمة) و`skDraw()` لشاشة الطيران (`x_fly_deck4.js` يحرّكها بحسب المدخلات). الشبابيك: إطار القمرة المخزَّن (`fgCockpitFrame` بـcanvas مخبأ لا يُعاد رسمه كل فريم، أعمدة وزجاج وحواف أعرض)، **تظليل الزجاج والانعكاسات وتغميق الحواف والمساحات تُرسم فقط والأجهزة ظاهرة** (بـ«إخفاء الأجهزة» يملأ المنظر الخارجي الشاشة؛ يحرسه `phone_view_test`)؛ ولوحتا الطيار الآلي والمركز تتجاهلان بكسلات الزجاج (alpha ≤ 0.34) عند البحث عن مساحة (`thr`=96 بمنظور القمرة)، مادة زجاج الشبابيك `fvWinMat` بدلاء `|b` وتوهج `fvGlow` ليلاً.

### 32.5 الطائرات الواقفة (البند 4)
`fvNbPlan` (`x_fly_vis.js`): لا طائرة على المدرج ولا على بقية البوابات؛ يبقى جاران لبوابة المستخدم **بمشهد تركيب ركاب** (جسر متصل، معدات، شاحنة تموين `fvGse`). المواقف الفارغة بجسور مركونة (`x_fly_air.js`). **تفسير**: عبارة «اللي تركّب ركاب فقط» فُهمت هكذا (انظر TODO-VERIFY §12).

### 32.6 الدفتر (البند 7)
تبويب `notes` («الدفتر»، مجموعة learn): `x_notes.js`. رسم بالقلم مخزَّن كنقاط مطبَّعة (لوح 4:3 فيصلح لكل شاشة، تراجع/إعادة دقيقان، ممحاة)، مربعات نص حقيقية (`<textarea>`)، صفحات، تسجيل صوت وفيديو (`getUserMedia` + `MediaRecorder`، حد 15 دقيقة صوت و5 فيديو) مع بديل «اختيار ملف» عندما يُمنع الإذن، تصدير PNG (نافذة بالصورة + رابط تنزيل: عارض Claude لا يسمح بالتنزيل فيبقى الضغط المطوّل)، التخزين IndexedDB `birjis-notes` (بدونه يعمل للجلسة ويُعلم المستخدم). لا شيء يغادر الجهاز. `nbLeave()` يوقف الكاميرا بالخروج من التبويب. الاختبار: `nb_test.py` (أجهزة وهمية، يخدم الصفحة على http لأن IndexedDB تحتاج origin).

### 32.7 مطابقة المجسّمات (البند 8): ما قيس وما لم يُقَس
المراجع: A380 (CC BY 4.0) و747-400 (CC BY-NC-SA 4.0) نماذج هواة. **للقياس فقط؛ لا شيء منها داخل الصفحة** (CREDITS.md). الأدوات `tools/refcmp/` (`refcmp.py` = IoU على اتحاد صور الظل بعد محاذاة الأنف والتكبير؛ `wing/edges/heights/nacelles/fin.py` = جداول الجناح والمحركات والزعنفة). المقاس الآن (مع العجلات / بدونها):

| | من فوق | من الجنب | من الأمام |
|---|---|---|---|
| A380 | 0.92 / 0.92 | 0.88 / 0.89 | 0.72 / 0.70 |
| 747-400 | 0.92 / 0.92 | 0.86 / 0.87 | 0.71 / 0.75 |

قبل التعديل كان من فوق 0.42 (A380) و0.64 (747). **«100٪» غير قابل للتحقق**: التطابق مع نموذج هواة لا يساوي التطابق مع الطائرة؛ والفروق المتبقية في TODO-VERIFY §11. القيم المعدَّلة: `GEO.a380` (p3.js وp5f.js وp5b2.js)، `jcT` و`GEO.b747.fairing` (`m_jb_geo.js`). ارتفاع الزعنفة بقي على القيمة الحقيقية (A380 24.1، 747 19.41 م) لا على ارتفاع المرجع.

### 32.8 تصميم النظام (`/design:design-system`)
`docs/DESIGN-SYSTEM.md`: جرد الرموز (ألوان، خط، مسافات، حواف) المستعمل فعلاً، وتوثيق مكوّنَي «لوحة المركز» و«الدفتر»، وقائمة أولويات.

### 32.9 اختبارات V36
جديد: `hub_test.py`, `nb_test.py`؛ معدَّل: `phone_view_test.py`. المتوقع نظيفاً: `nogl, ui_test, nb_test, bobby_test, brand_test, stage_test, fk_gate_test, fly_test quick, fap_test, deck_test, phone_view_test, ctl_test, i18n_layout, parts_test, eng_test, gear_test, ap_collide all, wing_ctl (3 طائرات), allanim, a11y_audit, a11y_trap, i18n_test, hub_test`. الاختبارات الطويلة (`i18n_test` ~5د، `ctl_test` ~5د) تُشغَّل بالخلفية (`nohup`) وتُراقَب بحلقة `until`.


## 33. النسخة 37: ذيل الـ737، القمرة «الشفافة»، دفتر بأسطر أكثر وصور

طلب المستخدم (صورة + نص): (1) خطأ بالصورة: قطعة زرقاء منفصلة قدّام الذيل العمودي للـ737، (2) «الدفتر عدد أسطره قليل، كبّرهن أو سوّي حركة»، (3) بقمرة القيادة «أكدر أشوف هيكل الطيارة وكأنما القمرة شفافة»، (4) «إذا عندك إضافات ضيف».

### 33.1 الزعنفة الظهرية (البند 1) — `src/p5f.js`
السبب: الزعنفة الظهرية (dorsal fillet) كانت تنتهي بمحطة ثابتة `c.dorsal[1]` بوجه عمودي، والحافة الأمامية للذيل العمودي مائلة، فعند ارتفاع قمة الزعنفة تكون الحافة أبعد للخلف (737: ~1 م) ← درجة وفجوة بيضاء. نفس الخلل ظهر بالـA380 بعد تغيير ميل ذيلها بالنسخة 36. **الحل:** نهاية الزعنفة تُحسب من خط الحافة الأمامية نفسه (`leX(z)`، الجذر عند `top−0.35` مثل `finLS`)، والقمة `xa` = نقطة التقاء خطها العلوي بالحافة (+0.3 م داخل الذيل)، والوجه الخلفي يميل مع الحافة. `c.dorsal[1]` صار قيمة ابتدائية فقط. شارة التحديد `ED.dorsal_fin` (`m_ed737h.js`) عُدّلت قمتها بنفس المنطق. لا فحص آلي خاص (فحص بصري للطائرات الثلاث من الجنب ومن الخلف‑اليسار).

### 33.2 منظور القمرة بالطيران (البند 3) — `src/p8f.js`, `src/x_fly_fx.js`
- **السبب:** `flySetView` كان يخفي فقط قشرة البدن والذيل (`FLY_HIDE_COCKPIT` بـ`.visible=false`)، فتبقى القطع التفصيلية داخل المقدمة ظاهرة قدّام الكاميرا: حاجز الضغط الأمامي (القرص البيج)، رادار الطقس، الهوائيات، عجلة الأنف؛ وبالالتفات للخلف تبين الأجنحة والمحركات بلا بدن، وبالنظر للأسفل تبين الأرض من خلال الأرضية.
- **الحل (1) الإخفاء:** `flyCockpitHide()` ينقل **كل** ما يُرسم من الطائرة (Mesh/Line/Points/Sprite) إلى طبقة الرسم 1 (الكاميرا ترسم الطبقة 0)؛ `flyCockpitShow()` يرجّعها. **طبقة لا `.visible`**: العجلات والقطع التفصيلية تملك `.visible`. الأضواء لا تُلمس. يُعاد كل ثانية بمنظور القمرة لأن القطع التفصيلية تُبنى بكسل (`edEnsure`). من مقعد هذه الطائرات الثلاث لا يُرى شيء من الهيكل، فالإخفاء الكامل واقعي (ملاحظة TODO-VERIFY §12).
- **الحل (2) الالتفات:** `flyLookLim()`: يمين/يسار حتى شباك الجنب (`min(1.6 rad, W/ppr)`)، للأعلى 0.5 وللأسفل −0.55 rad؛ يُطبّق بالسحب وبكل فريم. `look.snap` صار يتعطل أثناء السحب (كان الرجوع للوسط يقاوم السحب).
- **الحل (3) الإطار يتبع الرأس:** `fgCockpitDraw` يزيح إطار الزجاج الأمامي بمقدار `yaw×ppr` و`pitch×0.9×ppr` (ppr = بكسل لكل راديان لهذه الكاميرا) ويرسم جنبه **جدار القمرة الجانبي** `fgCockpitSide()` (شباك جانبي بعمود وسطي، عتبة وكونسول، جدار خلفي؛ الأيمن = مرآة الأيسر)، وفوقه/تحته سقف/أرضية معتمة. يُرسم مرة لكل حجم.
- **الفحص:** `tests/cockpit_view_test.py` (3 طائرات × أفقي/عمودي): صفر عناصر مرسومة من الطائرة بمنظور القمرة (حتى بعد `edEnsure(B,true)`)، `.visible` لا يتغير، حدود الالتفات بسحب ماوس حقيقي، الجدار الجانبي والأرضية معتمان والشباك مفتوح، الرجوع للطبقة 0 عند الخروج وعند `flyStop`.

### 33.3 الدفتر (البندان 2 و4) — `src/x_notes.js`
- **تفسير الطلب:** «عدد أسطره قليل» = الصفحة 4:3 فيها 13 سطراً فقط. الحل «صفحة أطول» لا «أسطر أصغر».
- **نموذج البيانات:** لكل صفحة `hf` (طولها بعدد «الصفحات الأساسية»، 1 = صندوق 4:3 القديم = 13 سطراً، الحد `NB_HF_MAX=8` ≈ 107 أسطر). الإحداثيات: x بعرض الصفحة، **y بارتفاع الصفحة الأساسية** (فيمتد من 0 إلى `hf`). لذلك تطويل الصفحة لا يحرّك ولا يمطّ أي شيء، والصفحات القديمة (`hf` غير موجود = 1) تبقى كما هي. كل من يرسم يمرّر **الارتفاع الأساسي** لـ`nbStroke` (`c.width/NB_AR`)، لا ارتفاع اللوح.
- **الواجهة:** صفحة جديدة = 27 سطراً بالموبايل (`hf=2`) و20 بالشاشة العريضة (`1.5`)؛ أزرار «− / الأسطر: N / ＋ أسطر» (نصف صفحة كل مرة؛ التقصير يُرفض برسالة إن كان بآخر الأسطر محتوى)؛ **ورق لا ينتهي**: الرسم أو الكتابة بآخر 12٪ يطوّل الصفحة تلقائياً (`nbGrow`)؛ نوع الورق لكل صفحة (مسطّر / مربعات / فارغ) بـ`data-paper` و`--nbL`. اللوح يُحدّ بـ9 ميغابكسل (`nbSize`).
- **الصور:** `p.imgs=[{id,x,y,w,ar,alt}]` + سجل `media` بنوع `image`. تُرسم كعناصر `<img>` **تحت** لوح الحبر (يُرسم فوقها). «إدراج صورة» (`nbAddImage`): تصغير إلى 1600px، توضع تحت المحتوى والصفحة تطول لها. تظهر بقائمة «مرفقات الصفحة» مع حذف. التصدير PNG يشمل الصفحة الطويلة كلها والصور والورق.
- **زر «للدفتر» بالعارض** (`#bNote` بشريط أدوات المجسّم): `GL.snap(maxW)` (`p5c2.js`) يرسم ويَنسخ بنفس المهمة (لا حاجة لـ`preserveDrawingBuffer`) ← `nbFromView()` ينشئ صفحة جديدة باسم القطعة المحددة والطائرة، الصورة بعرض الصفحة وتحتها أسطر، ثم يفتح تبويب الدفتر. يعمل والدفتر غير مفتوح (`nbPageFromImage` تخزين فقط).
- **الفحص:** `nb_test.py` (56 فحصاً): الطول الافتراضي، ±أسطر، ثبات الحبر والنص عند التطويل، التخزين بوحدة الصفحة الأساسية، رفض التقصير، التطويل التلقائي، الورق، إدراج صورة، التصدير، الحفظ بعد إعادة التحميل، زر العارض (لقطة غير فارغة)، الموبايل.

### 33.4 ملاحظات تشغيل
- اختبارات تضغط أزراراً ثم ترسم: **أعد قراءة `bounding_box` بعد أي `click`** (Playwright يمرّر الصفحة للزر). وارسم بعيداً عن أسفل الشاشة (الشريط السفلي الثابت يعترض المؤشر).
- تذييل الـcommit تغيّر مع تبديل النموذج: يُؤخذ من تذكير النظام الحالي دائماً (`scratchpad/git/csel.py`).
