#!/usr/bin/env python3
"""One-time recovery (2026-11-12): rebuild the source tree from the deployed page.

The original working copy lived only in a cloud container that was recycled. The deployed page holds all of the
product code (one HTML/CSS fragment + ~140 JS files concatenated by build.sh), so the source is cut back out of it:
  src/app.html       everything before the three.js <script> tag (was src/p1s.html, 99,896 bytes: matches the old file)
  src/js/NNN-*.js    the inline script, cut at every known original file start and at every section banner
  src/manifest.txt   the concatenation order (build.sh reads it)
A file keeps its original name when the session log still held a `grep -n` line that pins where it started
(known_starts.json); other pieces are named after their own banner comment.
Proof of a lossless cut: ./build.sh && python3 tools/mksite.py must reproduce the deployed page byte for byte.

usage: recover_from_page.py <deployed index.html> <known_starts.json> <out src dir>
"""
import sys, os, re, json, hashlib
live, known_json, out = sys.argv[1:4]
s = open(live, encoding="utf-8").read()
VIEWPORT = '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
APP_TITLE = '<title>بيرجس — الطائرات التفاعلية ثلاثية الأبعاد</title>\n'      # mksite.py drops the app's own <title>
THREE = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n<script>\n'
a = s.index(VIEWPORT); k = s.rindex("</script>") + len("</script>")
page = APP_TITLE + s[a:k] + "\n"                                       # = dist/aircraft-atlas.html of the last build
i = page.index(THREE); html = page[:i]; js = page[i + len(THREE):]
assert js.endswith("</script>\n"); js = js[:-len("</script>\n")]
J = js.split("\n"); assert J[-1] == ""; n = len(J) - 1                  # n real lines, each ended by \n
known = {v: kname for kname, v in json.load(open(known_json)).items() if v is not None}
known[0] = "p2a"
cuts = set(known) | {g for g in range(1, n) if J[g - 1] == "" and J[g].startswith("/* ----------")}
cuts = sorted(cuts)
def slug(line):
    t = re.sub(r"^/\*[\s\-=]*", "", line); t = re.split(r"[:(\.—]| -{4,}", t)[0]
    w = re.findall(r"[A-Za-z0-9]+", t.lower())[:6]
    return "-".join(w)[:48] or "section"
os.makedirs(out + "/js", exist_ok=True); manifest = []; cur = "start"
for idx, g in enumerate(cuts):
    e = cuts[idx + 1] if idx + 1 < len(cuts) else n
    if g in known: cur = known[g]; name = f"{idx+1:03d}-{cur}.js"
    else: name = f"{idx+1:03d}-{cur}~{slug(J[g])}.js"                   # "~": follows that file in the old order (may be a later file)
    body = "\n".join(J[g:e])                                           # build.sh adds the final newline (cat + echo)
    open(f"{out}/js/{name}", "w", encoding="utf-8").write(body); manifest.append("js/" + name)
open(out + "/app.html", "w", encoding="utf-8").write(html)
open(out + "/manifest.txt", "w", encoding="utf-8").write("# concatenation order of the inline script (build.sh). One file per line.\n" + "\n".join(manifest) + "\n")
print("app.html bytes", len(html.encode()), "| js pieces", len(manifest), "| page sha1", hashlib.sha1(page.encode()).hexdigest()[:12], "| page bytes", len(page.encode()))
