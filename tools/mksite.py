#!/usr/bin/env python3
"""Wrap dist/aircraft-atlas.html (made by ./build.sh) into the deployable site: dist/site/
   index.html (search-engine and sharing tags + the app), sitemap.xml, robots.txt, and every file of tools/site_static/
   (_headers, netlify.toml, _redirects, images). Deploy the WHOLE dist/site/ folder, not index.html alone.
   It also writes dist/old-site/: a tiny package for each old address in "old_urls" that sends every visitor (and search engine)
   to the same path on site_url with a permanent redirect. Deploy it to the OLD Netlify site.

The production address comes from ONE place: "site_url" in site.config.json (or the first argument, for a one-off build).
usage: python3 tools/mksite.py [site_url]"""
import sys, os, json, datetime, shutil, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = json.load(open(ROOT + "/site.config.json", encoding="utf-8"))
URL = (sys.argv[1] if len(sys.argv) > 1 else CFG["site_url"]).rstrip("/") + "/"
TITLE = 'بيرجس Birjis — الطائرات التفاعلية: A380 و747 و737'
DESC = 'بيرجس (Birjis): طائرات تفاعلية ثلاثية الأبعاد لمهندسي الطائرات وعشّاقها. فكّك A380 و747 و737 قطعة قطعة بنموذج ثلاثي الأبعاد، وتعلّم من 274 درساً، وجرّب الطيران بنفسك. مجاني، بالعربي والإنجليزي، صُنع بيدٍ عراقية.'
DESC_EN = 'Birjis: interactive 3D aircraft for aircraft engineers. Explore the A380, 747 and 737 part by part, 274 lessons, and a flight simulator. Free, Arabic and English, made in Iraq.'
APP_TITLE_LINE = '<title>بيرجس — الطائرات التفاعلية ثلاثية الأبعاد</title>\n'   # the app's own <title>: replaced by TITLE
LD = '{"@context": "https://schema.org", "@type": "WebApplication", "name": "بيرجس", "alternateName": ["Birjis", "Birjis interactive aircraft", "الطائرات التفاعلية"], "url": "{URL}", "image": "{URL}logo.png", "applicationCategory": "EducationalApplication", "operatingSystem": "Web", "inLanguage": ["ar", "en"], "description": "{DESC}", "author": {"@type": "Person", "name": "حسن وليد", "alternateName": "Hassan Waleed"}, "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"}}'
AI = CFG.get("ai_endpoint", "")   # Meyslon's server tier (x_ai~tiers.js reads this meta tag; the Claude artifact copy has none)
assert not AI or (AI.startswith("/") and '"' not in AI), "ai_endpoint must be a path on the site, e.g. /api/ask"
AI_META = f'<meta name="birjis-ai" content="{AI}">\n' if AI else ""
esc = lambda s: s.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;")
src = open(ROOT + "/dist/aircraft-atlas.html", encoding="utf-8").read()
assert src.startswith(APP_TITLE_LINE), "src/app.html must start with the app <title> line"
ld = json.dumps(json.loads(LD.replace("{URL}", URL).replace("{DESC}", json.dumps(DESC, ensure_ascii=False)[1:-1])), ensure_ascii=False)
head = f'''<!doctype html>
<html lang="ar">
<head>
<meta charset="utf-8">
<title>{esc(TITLE)}</title>
<meta name="description" content="{esc(DESC)}">
<meta name="author" content="حسن وليد (Hassan Waleed)">
<meta name="robots" content="index,follow">
<link rel="canonical" href="{URL}">
<meta property="og:type" content="website">
<meta property="og:url" content="{URL}">
<meta property="og:title" content="{esc(TITLE)}">
<meta property="og:description" content="{esc(DESC)}">
<meta property="og:image" content="{URL}og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="ar_IQ">
<meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(TITLE)}">
<meta name="twitter:description" content="{esc(DESC_EN)}">
<meta name="twitter:image" content="{URL}og.png">
{AI_META}<script type="application/ld+json">{ld}</script>
'''
tail = f"\n\n<noscript><h1>بيرجس · Birjis</h1><p>{esc(DESC)}</p><p>{esc(DESC_EN)}</p></noscript>\n</body>\n</html>\n"
out = ROOT + "/dist/site"; os.makedirs(out, exist_ok=True)
body = src[len(APP_TITLE_LINE):-1]
# a real document: the app fragment starts with head content (meta, fonts, one <style>) and goes on with the page markup
CUT = '</style>\n\n<div class="uiSky"'
assert body.count(CUT) == 1, "src/app.html: the end of the <style> block must be followed by the first page element"
body = body.replace(CUT, '</style>\n</head>\n<body>\n<div class="uiSky"')

# ---- self-hosted three.js and fonts (step 3): the site needs no other host. The Claude artifact copy keeps cdnjs + Google Fonts.
VEND = out + "/vendor"; shutil.rmtree(VEND, ignore_errors=True); os.makedirs(VEND + "/fonts")
THREE_CDN = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
THREE_NPM = ROOT + "/node_modules/three/build/three.min.js"
assert json.load(open(ROOT + "/node_modules/three/package.json"))["version"] == "0.128.0", "three.js must stay r128 (npm 0.128.0) until the upgrade step"
shutil.copy(THREE_NPM, VEND + "/three-r128.min.js")
assert body.count(THREE_CDN) == 1; body = body.replace(THREE_CDN, '<script src="/vendor/three-r128.min.js"></script>')
GF = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap">\n')
assert body.count(GF) == 1, "src/app.html: the Google Fonts lines changed; update tools/mksite.py"
faces = []   # the same families, weights and subsets the Google Fonts link asked for (Arabic + Latin), woff2 only
for pkg, subsets, weights in (("ibm-plex-sans-arabic", ("arabic", "latin-ext", "latin"), (400, 500, 600, 700)), ("ibm-plex-mono", ("latin-ext", "latin"), (400, 500))):
    d = ROOT + "/node_modules/@fontsource/" + pkg
    shutil.copy(d + "/LICENSE", VEND + "/fonts/" + pkg + "-LICENSE.txt")
    for w in weights:
        for sb in subsets:
            fn = f"{pkg}-{sb}-{w}-normal.woff2"   # the block of this subset in {w}.css (the per-subset files carry no unicode-range)
            css = open(f"{d}/{w}.css", encoding="utf-8").read().split(f"/* {fn[:-6]} */")[1].split("}")[0]
            fam = re.search(r"font-family: '([^']+)'", css).group(1); ur = re.search(r"unicode-range: ([^;]+);", css).group(1)
            shutil.copy(f"{d}/files/{fn}", VEND + "/fonts/" + fn)
            faces.append(f"@font-face{{font-family:'{fam}';font-style:normal;font-display:swap;font-weight:{w};src:url(/vendor/fonts/{fn}) format('woff2');unicode-range:{ur}}}")
body = body.replace(GF, '<link rel="preload" href="/vendor/fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2" as="font" type="font/woff2" crossorigin>\n'
                    '<style>/* IBM Plex, SIL Open Font License 1.1 (vendor/fonts/*-LICENSE.txt), served from this site */\n' + "\n".join(faces) + "\n</style>\n")
page = head + body + tail
open(out + "/index.html", "w", encoding="utf-8").write(page)
today = datetime.date.today().isoformat()
open(out + "/sitemap.xml", "w", encoding="utf-8").write(f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>{URL}</loc><lastmod>{today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
</urlset>
''')
open(out + "/robots.txt", "w", encoding="utf-8").write(f"User-agent: *\nAllow: /\n\nSitemap: {URL}sitemap.xml\n")
st = ROOT + "/tools/site_static"
for f in sorted(os.listdir(st)): shutil.copy(st + "/" + f, out + "/" + f)
print("ok", URL, len(page.encode()), "bytes | files:", " ".join(sorted(os.listdir(out))))
# the old addresses: every path answers with a permanent redirect to the same path on the new address
old = [u.rstrip("/") + "/" for u in CFG.get("old_urls", []) if u.rstrip("/") + "/" != URL]
od = ROOT + "/dist/old-site"; shutil.rmtree(od, ignore_errors=True)
if old:
    os.makedirs(od)
    open(od + "/_redirects", "w", encoding="utf-8").write(f"# old address -> {URL} (made by tools/mksite.py from site.config.json)\n/*  {URL}:splat  301!\n")
    open(od + "/netlify.toml", "w", encoding="utf-8").write(f'# old address -> {URL} (made by tools/mksite.py)\n[build]\n  publish = "."\n\n[[redirects]]\n  from = "/*"\n  to = "{URL}:splat"\n  status = 301\n  force = true\n')
    open(od + "/index.html", "w", encoding="utf-8").write(f'''<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(TITLE)}</title>
<link rel="canonical" href="{URL}">
<meta name="robots" content="noindex,follow">
<meta http-equiv="refresh" content="0; url={URL}">
</head>
<body>
<p>انتقل الموقع إلى عنوان جديد: <a href="{URL}">{URL}</a></p>
<p lang="en" dir="ltr">Birjis has moved to <a href="{URL}">{URL}</a></p>
</body>
</html>
''')
    print("old addresses", " ".join(old), "->", URL, "| package: dist/old-site/")
