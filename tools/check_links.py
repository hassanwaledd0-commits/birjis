#!/usr/bin/env python3
"""Link check of the deploy package dist/site/ (no network by default).
 - every relative href/src and every local file named by the head tags (og:image, JSON-LD image) exists in dist/site/
 - every #fragment link points at an id that exists in the page markup or is created by the scripts
 - canonical, og:url, sitemap.xml and robots.txt all use site_url of site.config.json
 - dist/old-site/ (the package for the old addresses in "old_urls") redirects every path to site_url
 - the AI meta tag carries ai_endpoint, and netlify/functions/ask.mjs answers on that same path
 - with CHECK_ONLINE=1 every external URL of the page is requested and must answer below 400
usage: python3 tools/check_links.py"""
import os, re, sys, json, html, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); SITE = ROOT + "/dist/site"
URL = json.load(open(ROOT + "/site.config.json", encoding="utf-8"))["site_url"].rstrip("/") + "/"
s = open(SITE + "/index.html", encoding="utf-8").read(); bad = []
k = s.index("<script>", s.index("three-r128.min.js" if "three-r128.min.js" in s else "three.min.js")); markup = s[:k] + s[s.rindex("</script>"):]; script = s[k:]
refs = [html.unescape(m.group(2)) for m in re.finditer(r'\s(href|src|content)="([^"]*)"', markup) if m.group(1) != "content" or m.group(2).startswith(("http", "/"))]
AI = json.load(open(ROOT + "/site.config.json", encoding="utf-8")).get("ai_endpoint", "")
if AI:   # Meyslon's server tier: the meta tag carries ai_endpoint and the function answers on the same path (it is not a file)
    refs = [r for r in refs if r != AI]
    if f'<meta name="birjis-ai" content="{AI}">' not in markup: bad.append(f"meta birjis-ai is not {AI}")
    fn = ROOT + "/netlify/functions/ask.mjs"
    if not os.path.isfile(fn) or f'path: "{AI}"' not in open(fn, encoding="utf-8").read(): bad.append(f"netlify/functions/ask.mjs does not answer on {AI}")
refs += [m for m in re.findall(r"url\((/[^)'\"]+)\)", markup)]   # fonts named by the inline @font-face rules
for m in re.finditer(r'<(script|link)\b[^>]*\s(src|href)="(https?:)?//([^/"]+)', markup):
    if not ('rel="canonical"' in m.group(0) or m.group(4) == URL.split("/")[2]): bad.append(f"third-party host in the site page: {m.group(0)[:120]}")
ids = set(re.findall(r'\sid="([^"]+)"', s))
for r in sorted(set(refs)):
    if r.startswith("#"):
        if len(r) > 1 and r[1:] not in ids and ('"' + r[1:] + '"') not in script: bad.append("fragment target missing: " + r)
    elif r.startswith(("data:", "mailto:", "tel:", "javascript:")): pass
    elif r.startswith(URL):
        f = r[len(URL):].split("?")[0].split("#")[0]
        if f and not os.path.isfile(SITE + "/" + f): bad.append(f"points at {r} but dist/site/{f} is not in the package")
    elif re.match(r"https?://", r): pass
    elif r.startswith("//"): bad.append("protocol-relative URL: " + r)
    else:
        f = r.split("?")[0].split("#")[0].lstrip("/")
        if f and not os.path.isfile(SITE + "/" + f): bad.append("local file missing: " + r)
for tag, pat in (("canonical", r'<link rel="canonical" href="([^"]+)"'), ("og:url", r'property="og:url" content="([^"]+)"')):
    m = re.search(pat, s)
    if not m or m.group(1) != URL: bad.append(f"{tag} is {m.group(1) if m else None}, site_url is {URL}")
for f, must in (("sitemap.xml", f"<loc>{URL}</loc>"), ("robots.txt", f"Sitemap: {URL}sitemap.xml")):
    p = SITE + "/" + f
    if not os.path.isfile(p) or must not in open(p, encoding="utf-8").read(): bad.append(f"{f}: missing or not using {URL}")
for f in ("_headers", "netlify.toml", "_redirects", "logo.png", "og.png"):
    if not os.path.isfile(SITE + "/" + f): bad.append("package file missing: " + f)
CFG = json.load(open(ROOT + "/site.config.json", encoding="utf-8"))
if [u for u in CFG.get("old_urls", []) if u.rstrip("/") + "/" != URL]:   # the redirect package of the old addresses
    OLD = ROOT + "/dist/old-site"
    for f, must in (("_redirects", f"/*  {URL}:splat  301!"), ("netlify.toml", f'to = "{URL}:splat"'), ("index.html", f'url={URL}"')):
        p = OLD + "/" + f
        if not os.path.isfile(p) or must not in open(p, encoding="utf-8").read(): bad.append(f"old-site/{f}: missing or not sending visitors to {URL}")
ext = sorted(set(u.rstrip(".,;)'\\") for u in re.findall(r'https?://[^\s"\'<>`\\]+', s) if "w3.org" not in u and "schema.org" not in u and not u.startswith(URL)))
print(f"links: {len(set(refs))} references in the markup, {len(ids)} ids, {len(ext)} external URLs")
if os.environ.get("CHECK_ONLINE"):
    for u in ext:
        try:
            rq = urllib.request.Request(u, method="GET", headers={"User-Agent": "birjis-link-check"}); code = urllib.request.urlopen(rq, timeout=20).status
        except Exception as e: code = getattr(e, "code", None) or str(e)[:60]
        print("  ", code, u[:100])
        if not (isinstance(code, int) and code < 400): bad.append(f"external link {u} -> {code}")
for b in bad: print("FAIL", b)
print("LINKS OK" if not bad else f"{len(bad)} link problem(s)"); sys.exit(1 if bad else 0)
