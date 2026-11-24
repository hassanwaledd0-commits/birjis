/* ---------- part thumbnails: the same diagram, with one part highlighted ---------- */
const THUMBS = {};
const svgUri = s => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);
const THUMB_BASE = `.hs{fill:#E7EDF2;stroke:#7D8A95;stroke-width:1;opacity:.9}
.hs[data-sys=power]{fill:#F3DCD8}.hs[data-sys=fuel]{fill:#F1E4C8}.hs[data-sys=hyd]{fill:#D5EADF}.hs[data-sys=ctrl]{fill:#D6E4F3}.hs[data-sys=gear]{fill:#E4DCF1}.hs[data-sys=sys]{fill:#D3EDED}
.layer-int .hs{opacity:.1}.ln{fill:none;stroke:#7D8A95;stroke-width:1}.lbl{font:9px monospace;fill:#7D8A95}`;
function thumbSVG(ac, view, hl){
  const raw = views(ac)[view].svg;
  const hi = hl ? `.hs{opacity:.2}.hs[data-id="${hl}"]{fill:#F08A4B;stroke:#B83A08;stroke-width:2;opacity:1}.layer-int .hs[data-id="${hl}"]{opacity:1}` : "";
  const css = `<style>${THUMB_BASE}${hi}</style>`;
  return raw.replace(/^<svg([^>]*)>/, (m, a) => `<svg xmlns="http://www.w3.org/2000/svg"${a}>${css}`);
}
function thumbRegion(ac, id){   /* v29: the nearest part (itself, its parent chain, or the table JD_THUMB) that has a region on the flat views */
  const V = views(ac); let k = id;
  for(let i = 0; i < 5 && k; i++){ if(V.plan.reg.some(r => r[2] === k) || V.side.reg.some(r => r[2] === k)) return k; const p = PARTS[k]; k = p && p.parent || null; }
  return (typeof JD_THUMB !== "undefined" && (JD_THUMB[id] || (/^(eng_|fire_bottle_eng$|hyd_edp$)/.test(id) ? "engine" : null))) || null;
}
function partThumb(ac, id, view){
  const key = ac + "|" + id + "|" + view;
  if(THUMBS[key] !== undefined) return THUMBS[key];
  let rid = id, v = view;
  if(!views(ac)[view].reg.some(r => r[2] === id)){ const f = thumbRegion(ac, id); if(f){ rid = f; v = bestView(ac, f); } }
  THUMBS[key] = views(ac)[v].reg.some(r => r[2] === rid) ? svgUri(thumbSVG(ac, v, rid)) : "";
  return THUMBS[key];
}
function bestView(ac, id){ return views(ac).plan.reg.some(r => r[2] === id) ? "plan" : "side"; }
function aircraftThumb(ac){ return svgUri(thumbSVG(ac, "plan", null)); }
