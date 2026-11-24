# RECOVERY: what happened to the source (2026-11-12)

**What happened.** The project was developed in `/home/user/aircraft-atlas`, a local git repository inside a cloud container. Pushes to GitHub were refused
(the Claude GitHub App is not installed on `hassanwaledd0-commits/birjis`), so nothing was ever pushed. The container was recycled on 2026-11-12 and the
working copy was lost: the split source files, 67 test scripts, the build / translation / measurement tools, the documentation and the git history.

**What was never at risk.** The product itself. The page deployed at https://birjis3.netlify.app (and the Claude artifact) is the last build, v37.

**How the source was restored.** `tools/recover_from_page.py` cut the deployed page back into `src/app.html` + 190 JS pieces
(at 32 original file starts pinned by `grep -n` lines in the session log, `tools/known_starts.json`, and at 185 section banners).
Proof that nothing was lost or altered: `./build.sh && python3 tools/mksite.py` reproduces the deployed page **byte for byte**
(3,957,555 bytes, sha1 `dcaf245ec29c…`; the HTML part is 99,896 bytes, the size of the old `src/p1s.html`).

| | Status |
|---|---|
| Product code (HTML, CSS, all JS, lesson and part data) | restored, verified byte-identical |
| English translations (13,670 strings + 505 templates) | inside the page, decodable (`tools/i18n_unpack.py`); the packer and the JSON sources are lost |
| `build.sh`, `tools/mksite.py` | rewritten; output verified identical |
| `tools/site_static/` (`_headers`, `netlify.toml`, `_redirects`) | restored verbatim from the session log |
| `tests/hub_test.py`, `tests/cockpit_view_test.py`, `docs/DESIGN-SYSTEM.md`, CLAUDE.md sections 32-33, TODO-VERIFY sections 11-14 | restored from the session log (not re-run yet) |
| TODO-VERIFY sections 0-10, CREDITS.md | partial (some long lines cut) |
| 65 other test scripts, CLAUDE.md sections 1-31, i18n tooling, reference-model measurement tools, `logo.png` / `og.png`, git history, original file names of ~107 files | lost |
| The owner's uploads (reference GLB models, logo PDF) | lost from the container; the owner has the originals |

**So it cannot happen again.** Every step ends with a push to GitHub (once the app is installed) and a zip of the repository sent to the owner.
