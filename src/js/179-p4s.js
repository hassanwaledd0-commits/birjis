/* ---------- app: one viewport with a dock, one card for the selected part, seven tabs ---------- */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const esc = t => String(t).replace(/[&<>"]/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
let GLOK = HAS3D;
const S = {ac:"a380", sel:null, xray:false, flow:false, livery:"classic", ex:0, exT:0, pull:new Set(), tab:"parts", q:"", playAll:false};
const INT_ONLY = new Set(["fuel","hyd","packs","avionics","apu","eng_core"]);
/* a sub-part (no mesh of its own) lights up its parent mesh part and gets a marker at its computed location */
const meshOf = id => (typeof edHas==="function"&&edHas(id))?id:((PARTS[id]&&PARTS[id].parent)||id);   /* a part with detailed geometry (m_ed737.js) is its own mesh */
const shortOf = id => PARTS[id].short||PARTS[id].ar;
/* engine pieces: the "engine" entry (plan view) stands for all of them */
const ENG = ["eng_inlet","eng_fancowl","eng_fandoor","eng_tr","eng_nozzle","eng_fan","eng_core","eng_pylon"];
const isEng = id => id==="engine" || ENG.indexOf(id)>=0;
/* the first (inboard) engine on the right: a band of x around it, so the close-up shows one nacelle */
const engXR = () => { const g=GEO[S.ac], R=g.engD/2, y=g.eng[0]; return [y-2*R, y+2*R]; };
const CACHE = {};
function views(ac){ if(!CACHE[ac]) CACHE[ac] = {plan:planView(ac), side:sideView(ac)}; return CACHE[ac]; }
const $view=$("#view"), $gl=$("#gl"), $flat=$("#flat"), $tag=$("#tag"), $card=$("#card"), $tp=$("#tp");
const reduced = () => window.matchMedia("(prefers-reduced-motion:reduce)").matches;
/* photo searches: short, curated English terms per part, so the search pages always return real photographs */
const PHOTOQ = { radome:"nose radome", flightdeck:"cockpit", fuse_fwd:"forward fuselage", fuse_mid:"fuselage wing root", fuse_aft:"rear fuselage tail cone",
  wingbox:"wing", slats:"slats extended", flaps:"flaps extended", aileron:"aileron", spoilers:"spoilers deployed", wingtip:"wingtip",
  engine:"engine", eng_inlet:"engine inlet", eng_fancowl:"engine cowling", eng_fandoor:"engine cowling open maintenance", eng_tr:"thrust reverser deployed",
  eng_nozzle:"engine exhaust nozzle", eng_fan:"engine fan blades", eng_core:"engine core", eng_pylon:"engine pylon",
  stabilizer:"horizontal stabilizer", elevator:"elevator tail", fin:"vertical stabilizer tail fin",
  gear_nose:"nose landing gear", gear_main:"main landing gear", wheels:"landing gear wheels tyres", doors:"passenger door",
  windows:"cabin windows", fuel:"refueling", hyd:"hydraulic", packs:"air conditioning pack", avionics:"avionics bay", apu:"APU exhaust tail" };
const photoQ = id => (S.ac==="a380"?"Airbus A380 ":S.ac==="b747"?"Boeing 747-400 ":"Boeing 737-800 ") + ((typeof PHOTOQ_JD!=="undefined"&&PHOTOQ_JD[id]) || PHOTOQ[id] || PARTS[id].en.replace(/[()&]/g," "));
const commonsUrl = id => "https://commons.wikimedia.org/w/index.php?search=" + encodeURIComponent(photoQ(id)) + "&title=Special%3AMediaSearch&type=image";
const gImgUrl = id => "https://www.google.com/search?tbm=isch&q=" + encodeURIComponent(photoQ(id));
const matOf = id => MATS[S.ac][id];
const thumbOf = id => (PARTS[id].thumb||id);

function glState(){ return {sel:S.sel&&meshOf(S.sel), grp:S.sel&&meshOf(S.sel)==="engine"?ENG:null, filter:"all", layer:S.xray?"int":"ext", isolate:S.edIso||null, ghost:S.edGhost||null, pulled:S.pull, explode:S.ex, livery:S.livery, matView:false}; }
