#!/usr/bin/env python3
"""Decode the English layer that ships inside the page (const ILDATA={n,z}: raw-deflate + base64 of a JSON object).
 d: {hash of the Arabic string: English string}   p: templates with numbered slots.   usage: i18n_unpack.py [out.json]"""
import re, base64, zlib, json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
js = "".join(open(f"{ROOT}/src/{l.strip()}", encoding="utf-8").read() for l in open(ROOT + "/src/manifest.txt") if l.strip() and not l.startswith("#") and "i18n" in l)
m = re.search(r'const ILDATA=\{n:(\d+),z:"([A-Za-z0-9+/=]+)"', js)
raw = zlib.decompress(base64.b64decode(m.group(2)), -15); assert len(raw) == int(m.group(1))
d = json.loads(raw.decode("utf-8")); print("exact translations:", len(d["d"]), "| templates:", len(d["p"]))
if len(sys.argv) > 1: json.dump(d, open(sys.argv[1], "w", encoding="utf-8"), ensure_ascii=False, indent=0); print("written", sys.argv[1])
