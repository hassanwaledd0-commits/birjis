#!/bin/bash
# The one command: build, validate the HTML, check the links, open every section in a browser (Arabic + English, 360 px + 1280 px),
# the page without 3D (three.js blocked, no WebGL: a plain message and a retry, every section still works), then Meyslon's AI: the server function against a fake API, and the three tiers in the page (Claude in the page -> the site's server -> offline).
# Needs: python3, node >= 22, `npm ci` (three.js for the tests, html-validate, the Anthropic SDK of the server function) and Playwright with its Chromium.
set -e
cd "$(dirname "$0")"
{ [ -d node_modules/html-validate ] && [ -d node_modules/@anthropic-ai/sdk ]; } || npm ci
./build.sh
python3 tools/mksite.py
npx html-validate dist/site/index.html dist/old-site/index.html && echo "HTML OK"
python3 tools/check_links.py
node tests/smoke.js "$@"
node tests/no3d_test.js
node tests/ai_function_test.mjs
node tests/ai_test.js
echo "ALL CHECKS PASSED"
