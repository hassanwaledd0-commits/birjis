/* ---------- pictures: fastener icons, system icons, spec pictograms, part thumbnails drawn from the diagram itself ---------- */
const svgI = (b, vb="0 0 80 60") => `<svg class="ico" viewBox="${vb}" aria-hidden="true" focusable="false">${b}</svg>`;
const svgS = b => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${b}</svg>`;

/* plates used by most fastener drawings */
const PL = `<rect class="f" x="8" y="22" width="64" height="8"/><rect class="f" x="8" y="32" width="64" height="8"/>`;
const FXICON = {
  rivet:    svgI(PL+`<rect x="34" y="22" width="12" height="18"/><path class="f" d="M28 22 Q40 6 52 22 Z"/><path class="f" d="M30 40 H50 L47 46 H33 Z"/>`),
  blind:    svgI(PL+`<rect x="34" y="22" width="12" height="18"/><rect class="f" x="30" y="16" width="20" height="6"/><path d="M40 16 V5"/><circle class="a" cx="40" cy="4" r="2"/>`),
  hilok:    svgI(PL+`<rect class="f" x="30" y="6" width="20" height="8" rx="1"/><rect x="36" y="14" width="8" height="32"/><rect class="f" x="31" y="44" width="18" height="9" rx="2"/><path d="M36 26 H44 M36 30 H44 M36 34 H44"/>`),
  lockbolt: svgI(PL+`<rect class="f" x="30" y="6" width="20" height="8" rx="1"/><rect x="36" y="14" width="8" height="30"/><path class="f" d="M30 44 H50 L53 55 H27 Z"/><path d="M33 49 l3 -2 l3 2 l3 -2 l3 2"/>`),
  boltnut:  svgI(PL+`<rect class="f" x="26" y="6" width="28" height="8" rx="1"/><rect x="36" y="14" width="8" height="30"/><rect class="f" x="26" y="44" width="28" height="11" rx="1"/><rect class="a" x="30" y="49" width="20" height="3"/>`),
  castle:   svgI(PL+`<rect class="f" x="26" y="6" width="28" height="8" rx="1"/><rect x="36" y="14" width="8" height="26"/><rect class="f" x="26" y="40" width="28" height="12" rx="1"/><path d="M30 40 V52 M36 40 V52 M44 40 V52 M50 40 V52"/><path class="a" d="M38 52 V58 M42 52 V58 M38 58 Q40 60 42 58"/>`),
  safewire: svgI(`<rect class="f" x="8" y="22" width="20" height="14" rx="2"/><rect class="f" x="52" y="22" width="20" height="14" rx="2"/><path class="a" d="M28 26 Q34 20 40 26 T52 26"/><path class="a" d="M28 32 Q34 38 40 32 T52 32"/>`),
  quarter:  svgI(`<rect class="f" x="8" y="38" width="64" height="8"/><rect x="36" y="14" width="8" height="26"/><ellipse class="f" cx="40" cy="14" rx="15" ry="4.5"/><path class="a" d="M25 14 H55"/>`),
  nutplate: svgI(`<rect class="f" x="8" y="22" width="64" height="7"/><path d="M40 6 V22"/><rect class="f" x="22" y="34" width="36" height="8"/><path d="M30 34 V26 H50 V34"/><circle class="a" cx="26" cy="38" r="2"/><circle class="a" cx="54" cy="38" r="2"/>`),
  insert:   svgI(`<rect class="f" x="10" y="10" width="60" height="40" rx="3"/><rect x="26" y="18" width="28" height="26"/><path class="a" d="M30 21 L50 24 L30 27 L50 30 L30 33 L50 36 L30 39 L50 41"/>`),
  sealant:  svgI(`<rect class="f" x="8" y="14" width="64" height="9"/><rect class="f" x="8" y="38" width="64" height="9"/><path class="a" style="opacity:.55" d="M8 23 Q40 40 72 23 V38 Q40 55 8 38 Z"/>`),
  stripe:   svgI(`<rect class="f" x="26" y="8" width="28" height="7"/><rect x="36" y="15" width="8" height="30"/><rect class="f" x="8" y="45" width="64" height="8"/><rect class="a" x="8" y="26" width="64" height="3"/>`),
  latch:    svgI(`<rect class="f" x="8" y="42" width="64" height="8"/><path d="M22 42 V22 Q22 14 30 14 H50 Q58 14 58 22 V32"/><path class="a" d="M58 32 H66 V40"/>`),
  vband:    svgI(`<rect class="f" x="6" y="34" width="26" height="8"/><rect class="f" x="48" y="34" width="26" height="8"/><path class="a" d="M22 34 L40 14 L58 34"/><path d="M26 30 L40 20 L54 30"/>`),
  rodend:   svgI(`<circle class="f" cx="40" cy="22" r="11"/><circle cx="40" cy="22" r="4"/><rect x="36" y="33" width="8" height="13"/><rect class="f" x="28" y="46" width="24" height="7" rx="1"/>`),
  fitting:  svgI(`<rect class="f" x="4" y="26" width="72" height="8"/><rect class="f" x="26" y="18" width="28" height="24" rx="2"/><circle class="a" cx="26" cy="30" r="3"/>`)
};

/* system icons (24 px grid) */
const SYSICON = {
  struct: svgS(`<path d="M3 5 H21 V19 H3 Z"/><path d="M3 12 H21 M12 5 V19"/>`),
  power:  svgS(`<circle cx="12" cy="12" r="9"/><path d="M12 12 V4 M12 12 L19 14 M12 12 L5 14"/>`),
  fuel:   svgS(`<path d="M12 3 C8 9 6 12 6 15 A6 6 0 0 0 18 15 C18 12 16 9 12 3 Z"/>`),
  hyd:    svgS(`<circle cx="12" cy="13" r="8"/><path d="M12 13 L16 8"/><path d="M5 19 H19"/>`),
  ctrl:   svgS(`<path d="M12 20 V10"/><circle cx="12" cy="8" r="3"/><path d="M5 20 H19"/>`),
  gear:   svgS(`<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M12 4 V8 M12 16 V20 M4 12 H8 M16 12 H20"/>`),
  sys:    svgS(`<path d="M13 2 L5 13 H11 L10 22 L19 10 H13 Z"/>`)
};

/* spec pictograms */
const SPECICON = {
  len:     svgS(`<path d="M3 12 H21 M3 12 l4 -3 M3 12 l4 3 M21 12 l-4 -3 M21 12 l-4 3"/>`),
  span:    svgS(`<path d="M2 10 L12 14 L22 10"/><path d="M12 14 V20"/>`),
  h:       svgS(`<path d="M12 3 V21 M12 3 l-3 4 M12 3 l3 4 M12 21 l-3 -4 M12 21 l3 -4"/>`),
  weight:  svgS(`<path d="M12 4 V20 M7 20 H17 M5 7 H19 M5 7 L2 14 H8 Z M19 7 L16 14 H22 Z"/>`),
  engines: svgS(`<circle cx="12" cy="12" r="9"/><path d="M12 12 V4 M12 12 L19 14 M12 12 L5 14"/>`),
  fuel:    svgS(`<path d="M12 3 C8 9 6 12 6 15 A6 6 0 0 0 18 15 C18 12 16 9 12 3 Z"/>`),
  range:   svgS(`<path d="M3 17 Q12 -2 21 17"/><path d="M18 13 L21 17 L17 18"/>`),
  ceiling: svgS(`<path d="M3 20 L12 5 L21 20 Z"/>`),
  speed:   svgS(`<path d="M3 16 A9 9 0 0 1 21 16"/><path d="M12 16 L16 9"/><circle cx="12" cy="16" r="1.5"/>`),
  material:svgS(`<path d="M3 8 L12 3 L21 8 L12 13 Z"/><path d="M3 12 L12 17 L21 12"/>`),
  pressure:svgS(`<circle cx="12" cy="13" r="9"/><path d="M12 13 L16 8"/><path d="M5 19 H19"/>`),
  seats:   svgS(`<path d="M8 4 H16 V13 H8 Z"/><path d="M6 13 H18 V20 M6 20 H18"/>`)
};
const SPEC_ICON = {"الطول":"len","باع الجناحين":"span","الارتفاع":"h","الوزن الأقصى عند الإقلاع":"weight","المحركات":"engines","سعة الوقود القصوى":"fuel","المدى بالحمولة القصوى":"range","المدى":"range","عرض المقصورة الرئيسية":"seats","المواد المركّبة":"material","ضغط الهيدروليك":"pressure","السقف التشغيلي":"ceiling","سرعة الرحلة":"speed","الهيكل":"material","الفرامل":"pressure"};
