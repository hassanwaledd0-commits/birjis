#!/bin/bash
# Birjis: builds the single-page app  dist/aircraft-atlas.html  (or the path in $OUT) from src/.
#   src/app.html      head fragment, CSS and the page markup
#   src/manifest.txt  the JS files, in concatenation order (one per line; lines starting with # are comments)
# Then:  python3 tools/mksite.py   wraps it into dist/site/ (the deployable package).
set -e
cd "$(dirname "$0")"
OUT="${OUT:-dist/aircraft-atlas.html}"
mkdir -p "$(dirname "$OUT")"
{
  cat src/app.html
  echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
  echo "<script>"
  grep -v '^\s*#' src/manifest.txt | grep -v '^\s*$' | while IFS= read -r f; do cat "src/$f"; echo; done
  echo "</script>"
} > "$OUT"
echo "built $OUT ($(wc -c < "$OUT") bytes)"
