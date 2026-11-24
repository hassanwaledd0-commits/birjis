/* ---------- hand controls artwork (v36): the Boeing control wheel (737 / 747-400) and the Airbus sidestick (A380), drawn once as layered vector shapes and rendered two ways:
   skSvg(name)   -> SVG markup for the cockpit tab (src/p7e.js puts the numbered switch caps and callouts on top of it);
   skDraw(g,...) -> the same shapes on a canvas for the flight deck (src/x_fly_deck4.js moves the wheel with the roll input and the stick with roll and pitch).
   The shapes are the common outline of these controls seen from the pilot's seat: the 737 / 747 wheel is a squared U with rubber grips, a hub with two spokes and a column with a
   boot; the A380 sidestick is a small hand grip on a rubber boot at the outboard side console, with the red priority button on top. Nothing here copies a drawing or a photograph.
   A layer: {d: SVG path, f: fill, s: stroke, w: stroke width, a: opacity, c: line cap, mv: moves with the input}. A fill / stroke is a colour or ["g",x1,y1,x2,y2,[[stop,colour],...]].
   Art box 250 x 280, the same box as the cockpit panels, so switch positions in p7e.js are unchanged. ---------- */
const SKA={
  yoke:{w:250,h:280,px:125,py:122,pz:10,layers:[
    /* column: a tube with a rubber boot, down into the panel */
    {d:"M105 168L109 262Q125 270 141 262L145 168Z",f:["g",100,0,150,0,[[0,"#121416"],[.35,"#3c4148"],[.7,"#23272c"],[1,"#101214"]]],s:"#07080a",w:1.4},
    {d:"M104 226Q125 233 146 226M103 238Q125 245 147 238M102 250Q125 257 148 250",s:"#050607",w:2.2,a:.9},
    {d:"M82 264H168L160 276H90Z",f:["g",0,264,0,276,[[0,"#2b2f35"],[1,"#15171a"]]],s:"#07080a",w:1.2},
    /* wheel: moves with the roll input, rotating about the hub */
    {mv:1,d:"M34 74C24 108 28 140 54 162C74 178 100 184 125 184C150 184 176 178 196 162C222 140 226 108 216 74",s:"#08090b",w:31,c:"round"},
    {mv:1,d:"M34 74C24 108 28 140 54 162C74 178 100 184 125 184C150 184 176 178 196 162C222 140 226 108 216 74",s:["g",0,60,0,190,[[0,"#4a4f57"],[.55,"#2d3137"],[1,"#1b1e22"]]],w:24,c:"round"},
    {mv:1,d:"M37 78C29 108 33 136 56 156",s:"#8d949d",w:3,a:.28,c:"round"},
    {mv:1,d:"M213 78C221 108 217 136 194 156",s:"#8d949d",w:3,a:.18,c:"round"},
    /* spokes from the hub to the rim */
    {mv:1,d:"M88 124C66 124 48 132 40 152",s:"#08090b",w:21,c:"round"},{mv:1,d:"M162 124C184 124 202 132 210 152",s:"#08090b",w:21,c:"round"},
    {mv:1,d:"M88 124C66 124 48 132 40 152",s:["g",40,110,90,160,[[0,"#3a3f46"],[1,"#22262b"]]],w:16,c:"round"},{mv:1,d:"M162 124C184 124 202 132 210 152",s:["g",210,110,160,160,[[0,"#33383e"],[1,"#1e2126"]]],w:16,c:"round"},
    /* grips: rubber, with finger ridges */
    {mv:1,d:"M10 26C10 12 42 12 42 26L46 96C46 110 10 110 10 96Z",f:["g",10,0,46,0,[[0,"#1b1d20"],[.4,"#3a3e44"],[1,"#141618"]]],s:"#050607",w:1.8},
    {mv:1,d:"M208 26C208 12 240 12 240 26L240 96C240 110 204 110 204 96Z",f:["g",204,0,240,0,[[0,"#141618"],[.6,"#3a3e44"],[1,"#1b1d20"]]],s:"#050607",w:1.8},
    {mv:1,d:"M14 62Q28 66 42 62M14 74Q28 78 42 74M14 86Q28 90 42 86M208 62Q222 66 236 62M208 74Q222 78 236 74M208 86Q222 90 236 86",s:"#0a0b0c",w:1.8,a:.8},
    {mv:1,d:"M14 30C14 20 22 16 28 18",s:"#9aa1aa",w:2.4,a:.35,c:"round"},
    /* hub */
    {mv:1,d:"M80 90H170Q186 90 186 106V146Q186 164 170 164H80Q64 164 64 146V106Q64 90 80 90Z",f:["g",0,90,0,164,[[0,"#454a52"],[.5,"#2c3036"],[1,"#1a1d21"]]],s:"#07080a",w:2},
    {mv:1,d:"M80 94H170",s:"#9aa1aa",w:1.6,a:.4,c:"round"},
    {mv:1,d:"M96 110H154Q160 110 160 116V138Q160 144 154 144H96Q90 144 90 138V116Q90 110 96 110Z",f:["g",0,110,0,144,[[0,"#191c20"],[1,"#101215"]]],s:"#2d3238",w:1.2},
    {mv:1,d:"M100 114H150",s:"#7b838c",w:1,a:.35,c:"round"},
    {mv:1,d:"M105 127a2.4 2.4 0 1 0 .01 0M145 127a2.4 2.4 0 1 0 .01 0",f:"#3a3f46"}
  ]},
  side:{w:250,h:280,px:125,py:182,pz:6,layers:[
    /* the side console: a block with a rim, a ring where the stick leaves it, screws */
    {d:"M20 216Q20 200 38 200H212Q230 200 230 216V268Q230 278 220 278H30Q20 278 20 268Z",f:["g",0,200,0,278,[[0,"#444a52"],[.12,"#363b42"],[1,"#202328"]]],s:"#07080a",w:1.6},
    {d:"M38 202H212",s:"#98a0aa",w:1.2,a:.45,c:"round"},{d:"M34 236H216M34 252H216",s:"#101215",w:1.6,a:.8},
    {d:"M46 220a3 3 0 1 0 .01 0M204 220a3 3 0 1 0 .01 0M46 262a3 3 0 1 0 .01 0M204 262a3 3 0 1 0 .01 0",f:"#14161a",s:"#6b727c",w:.8},
    {d:"M62 204a63 15 0 1 0 126 0a63 15 0 1 0 -126 0",f:"#14161a",s:"#07080a",w:1.4},
    /* the rubber boot */
    {d:"M82 206C82 190 94 178 102 170H148C156 178 168 190 168 206Z",f:["g",82,0,168,0,[[0,"#141619"],[.45,"#32363c"],[1,"#101215"]]],s:"#07080a",w:1.4},
    {d:"M86 196Q125 204 164 196M90 186Q125 193 160 186",s:"#07080a",w:2,a:.8},
    /* stalk and grip: move with roll and pitch about the base of the stalk */
    {mv:1,d:"M107 184L109 150H141L143 184Z",f:["g",104,0,146,0,[[0,"#181a1e"],[.5,"#33373d"],[1,"#15171a"]]],s:"#07080a",w:1.4},
    {mv:1,d:"M103 152C97 136 94 116 95 96C96 70 99 46 109 31C115 22 127 18 136 21C150 25 158 38 158 58C159 82 158 112 151 136L146 152Z",f:["g",94,0,160,0,[[0,"#25282d"],[.28,"#4b5058"],[.62,"#2d3036"],[1,"#1a1c20"]]],s:"#07080a",w:2.4},
    {mv:1,d:"M150 56C168 58 172 78 164 92C160 99 154 100 152 100Z",f:["g",150,0,172,0,[[0,"#2f3238"],[1,"#4a4f57"]]],s:"#07080a",w:1.4},
    {mv:1,d:"M104 40C106 28 118 21 131 22C145 24 154 33 155 47C140 41 118 39 104 40Z",f:["g",0,21,0,47,[[0,"#6a717b"],[1,"#363a41"]]],s:"#07080a",w:1},
    {mv:1,d:"M99 62C97 88 99 114 106 140",s:"#b3bac3",w:3,a:.2,c:"round"},
    {mv:1,d:"M98 110L137 100M99 122L142 112M101 134L146 125",s:"#0b0c0e",w:1.7,a:.65,c:"round"},
    {mv:1,d:"M118 28a10 10 0 1 0 .01 0",f:"#0d0e10",s:"#050607",w:1},
    {mv:1,d:"M122 104H146Q151 104 151 109V117Q151 122 146 122H122Q117 122 117 117V109Q117 104 122 104Z",f:["g",0,104,0,122,[[0,"#69707a"],[1,"#454b53"]]],s:"#050607",w:1.2}
  ]}
};
/* ---- SVG ---- */
function skPaint(v,id){ if(!v) return "none"; if(typeof v==="string") return v; return `url(#${id})`; }
function skSvg(name,pre){
  const A=SKA[name], P=(pre||"sk")+name; let defs="", body="", n=0;
  A.layers.forEach(L=>{
    let f=L.f, s=L.s; const gid=(v)=>{ const id=P+"g"+(++n); defs+=`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${v[1]}" y1="${v[2]}" x2="${v[3]}" y2="${v[4]}">${v[5].map(t=>`<stop offset="${t[0]}" stop-color="${t[1]}"/>`).join("")}</linearGradient>`; return id; };
    const fi=Array.isArray(f)?gid(f):null, si=Array.isArray(s)?gid(s):null;
    body+=`<path d="${L.d}" fill="${f?(fi?`url(#${fi})`:f):"none"}"${s?` stroke="${si?`url(#${si})`:s}" stroke-width="${L.w||1}"`:""}${L.c?` stroke-linecap="${L.c}" stroke-linejoin="round"`:""}${L.a!==undefined?` opacity="${L.a}"`:""}/>`;
  });
  return `<defs>${defs}</defs>${body}`;
}
/* ---- canvas ---- */
function skPaintC(g,L,v,key){
  if(!Array.isArray(v)) return v; const c=L[key]; if(c&&c.g===g) return c.o;
  const o=g.createLinearGradient(v[1],v[2],v[3],v[4]); v[5].forEach(t=>o.addColorStop(t[0],t[1])); L[key]={g,o}; return o;
}
/* draw art `name` into the box (x,y,w,h); o: {roll (rad, + = clockwise), pitch (-1..1, + = pulled), mirror, ap (red dot on the top of the sidestick)} */
function skDraw(g,name,x,y,w,h,o){
  o=o||{}; const A=SKA[name], k=Math.min(w/A.w,h/A.h), roll=o.roll||0, pit=o.pitch||0;
  g.save(); g.translate(x+w/2,y+h/2); g.scale(k*(o.mirror?-1:1),k); g.translate(-A.w/2,-A.h/2);
  A.layers.forEach(L=>{
    if(!L._p) L._p=new Path2D(L.d);
    g.save();
    if(L.mv){ g.translate(A.px,A.py); g.rotate(roll); const sc=1+pit*0.07; g.scale(sc,sc); g.translate(-A.px,-A.py+pit*A.pz); }
    if(L.a!==undefined) g.globalAlpha=L.a;
    const f=skPaintC(g,L,L.f,"_gf"), s=skPaintC(g,L,L.s,"_gs");
    if(f){ g.fillStyle=f; g.fill(L._p); } if(s){ g.strokeStyle=s; g.lineWidth=L.w||1; g.lineCap=L.c||"butt"; g.lineJoin="round"; g.stroke(L._p); }
    g.restore();
  });
  /* the switch caps that the cockpit tab draws as interactive caps: here they are plain shapes that follow the control */
  g.save(); g.translate(A.px,A.py); g.rotate(roll); const sc=1+pit*0.07; g.scale(sc,sc); g.translate(-A.px,-A.py+pit*A.pz);
  const cap=(x0,y0,w0,h0,fill,line)=>{ g.fillStyle=fill; g.beginPath(); g.rect(x0,y0,w0,h0); g.fill(); g.strokeStyle=line; g.lineWidth=1; g.stroke(); };
  if(name==="side"){
    const rg=g.createRadialGradient(116,34,1,118,38,9); rg.addColorStop(0,"#ff7b6e"); rg.addColorStop(.45,"#d8392e"); rg.addColorStop(1,"#8f1d16"); g.fillStyle=rg; g.beginPath(); g.arc(118,38,8,0,6.2832); g.fill(); g.strokeStyle="#3a0b08"; g.lineWidth=1; g.stroke();
    cap(122,107,24,11,"#c9ced5","#50565e");
  } else {
    cap(14,34,18,12,"#d8392e","#3a0b08"); cap(16,68,10,26,"#d9dde1","#50565e"); cap(218,34,18,12,"#d8392e","#3a0b08"); cap(224,68,10,26,"#d9dde1","#50565e");
  }
  g.restore(); g.restore();
}
