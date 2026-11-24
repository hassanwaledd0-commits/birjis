# بيرجس · Birjis

منصة تعليمية تفاعلية للطيران، عربية أولاً (RTL) وبالإنجليزية: مجسّمات ثلاثية الأبعاد لـA380 و747-400 و737-800، 274 درساً، قمرة تفاعلية، محاكي طيران، قسم AMM تدريبي، قاموس، ودفتر. **للاستخدام التعليمي فقط، وليس للتشغيل أو الصيانة.**

## البناء
```bash
./build.sh                 # src/ -> dist/aircraft-atlas.html (الصفحة الواحدة)
python3 tools/mksite.py    # -> dist/site/ (حزمة النشر: index.html + sitemap.xml + robots.txt + ملفات tools/site_static)
```
عنوان الموقع يُضبط بمكان واحد: `site_url` في `site.config.json`.

## الفحص (أمر واحد)
```bash
npm ci            # مرة واحدة: three.js للاختبارات + html-validate
./check.sh        # بناء + صحة HTML + فحص الروابط + اختبار دخان يفتح كل قسم (عربي/إنجليزي × 360px/1280px) ويفشل عند أي خطأ console
./check.sh --quick   # نفس الشي بانتظار أقصر وبدون تجربة الطيران
```
يحتاج Python 3 وNode 22+ وPlaywright مع Chromium. `CHECK_ONLINE=1 python3 tools/check_links.py` يجرّب الروابط الخارجية فعلياً (يحتاج نت).
صور الشعار والمشاركة: `node tools/mkbrand.js` يرسم `tools/site_static/logo.png` و`og.png` من أشكال الشعار داخل التطبيق.

## النشر (Netlify، سحب وإفلات)
ارفع **مجلد `dist/site/` كله** على موقع birjis3، مو `index.html` لوحده: ملف `_headers` هو اللي يطبّق رؤوس الأمان، و`robots.txt` و`sitemap.xml` وصورة المشاركة ملفات مستقلة.
وارفع `dist/old-site/` على الموقع القديم birjis حتى يحوّل كل الزوار للعنوان الجديد. الخطوات بالتفصيل: `docs/DEPLOY.md`.

## البنية
- `src/app.html`: رأس الصفحة والـCSS وهيكل الصفحة.
- `src/js/NNN-*.js`: الجافاسكربت مقسّماً، و`src/manifest.txt` ترتيب الدمج. لا مكتبات بناء.
- `tools/`: `mksite.py` (حزمة النشر)، `i18n_unpack.py` (فك الترجمة الإنجليزية)، `recover_from_page.py` (سكربت الاسترجاع، للتوثيق).
- `tests/smoke.js`: اختبار الدخان (جزء من `./check.sh`). `tests/hub_test.py` و`tests/cockpit_view_test.py`: اختباران مسترجعان بـPlaywright بايثون، لم يُعَد تشغيلهما بعد الاسترجاع.
- `CLAUDE.md` ذاكرة المشروع، `RECOVERY.md` ما حدث للمصدر، `TODO-VERIFY.md` ما لم يُتحقق منه، `CREDITS.md` التراخيص.

## التحقق من سلامة البناء
commit الاسترجاع (`8eddc3b`) يبني صفحة مطابقة حرفياً للمنشور يوم 2026-11-12 (`sha1 dcaf245ec29c…`). ما بعده يختلف عمداً (وسوم `</head>` و`<body>` وملاحظتان للمدقق).
