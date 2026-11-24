/* ---------- Flight deck (قمرة القيادة): night-lit panels drawn as SVG. Every control is clickable, explained in Arabic,
   keeps its state, and drives the displays (PFD, ND, ECAM / EICAS memos, master caution). Data per aircraft in p7b/p7c. ---------- */
const CK={};
const CKS={ac:"", area:"all", sel:null, st:{}, act:true, day:false, lbl:true, test:false, q:"", raf:0, el:null, refs:null,
  sim:{t:0,spd:250,alt:24000,hdg:90,vs:0}, sd:"", ackC:"", ackW:"", apuT:0};
const CKC={amber:"#FFB020", white:"#F5F3EC", blue:"#41AAFF", green:"#2BE07C", red:"#FF3B30", dim:"#3B4249"};
const LCOL={a:CKC.amber, w:CKC.white, b:CKC.blue, g:CKC.green, r:CKC.red};
/* constructors (x,y = control centre inside its panel). d = [Arabic name, what it does, normal setting in flight] */
const pb=(id,x,y,lbl,top,bot,o)=>Object.assign({k:"pb",id,x,y,lbl,top,bot,n:2,v:0},o||{});
const rot=(id,x,y,lbl,pos,v,o)=>Object.assign({k:"rot",id,x,y,lbl,pos,v},o||{});
const tog=(id,x,y,lbl,pos,v,o)=>Object.assign({k:"tog",id,x,y,lbl,pos,v},o||{});
const lt=(id,x,y,w,h,txt,col,o)=>Object.assign({k:"lt",id,x,y,w,h,txt,col,v:0},o||{});
const dsp=(id,x,y,w,h,o)=>Object.assign({k:"dsp",id,x,y,w,h,v:0},o||{});
const scr=(id,x,y,w,h,kind,o)=>Object.assign({k:"scr",id,x,y,w,h,kind,v:0},o||{});
const lev=(id,x,y,kind,pos,v,o)=>Object.assign({k:"lev",id,x,y,kind,pos,v},o||{});
const kn=(id,x,y,lbl,o)=>Object.assign({k:"kn",id,x,y,lbl,v:0,n:2},o||{});
const gau=(id,x,y,r,lbl,o)=>Object.assign({k:"gau",id,x,y,r,lbl,v:0},o||{});
const fh=(id,x,y,lbl,o)=>Object.assign({k:"fh",id,x,y,lbl,v:0,pos:["IN","PULL","DISCH L","DISCH R"]},o||{});
const pn=(id,t,x,y,w,h,c,o)=>Object.assign({id,t,x,y,w,h,c},o||{});
const TYPE_AR={pb:"زر ضغط مضيء",rot:"مفتاح دوّار",tog:"مفتاح ذراع",lt:"مصباح تنبيه",dsp:"شاشة رقمية",scr:"شاشة عرض",lev:"ذراع",kn:"مقبض دوّار يُدفع ويُسحب",gau:"مؤشر",fh:"مقبض إطفاء الحريق",sw:"زر أو مفتاح على العجلة/العصا",co:"كتابة توضيحية"};

function ckKey(p,c){ return p.id+"."+c.id; }
function ckAll(ac){ const out=[]; const A=CK[ac]; Object.keys(A.areas).forEach(a=>A.areas[a].panels.forEach(p=>p.c.forEach(c=>{ if(c.k!=="co") out.push([a,p,c]); }))); return out; }
function ckS(ac,key){ const st=CKS.st[ac]; return st&&st[key]!==undefined?st[key]:0; }
function ckInit(ac){
  if(CKS.st[ac]) return;
  const st={}; ckAll(ac).forEach(([a,p,c])=>{ st[ckKey(p,c)]=c.v||0; if(c.multi) for(let i=0;i<(c.n||1);i++) st[c.multi+i]=c.v||0; }); CKS.st[ac]=st;
}
function ckPreset(ac,which){
  const st=CKS.st[ac]; ckAll(ac).forEach(([a,p,c])=>{ const k=ckKey(p,c); st[k]=which==="cold"?(c.c!==undefined?c.c:(c.k==="pb"?0:(c.v||0))):which==="start"?(c.s!==undefined?c.s:(c.v||0)):(c.v||0); if(c.multi) for(let i=0;i<(c.n||1);i++) st[c.multi+i]=st[k]; });
  CKS.apuT=which==="start"?performance.now()-5000:0; CKS.ackC=""; CKS.ackW="";
  const A=CK[ac]; if(A.onPreset) A.onPreset(st,which);
}
/* is the aircraft electrically alive? (cold & dark = no power: nothing lights) */
function ckPower(ac){ const A=CK[ac]; return A.power?A.power(CKS.st[ac]):true; }
/* legend rule: T = test/fault only, P = pressed (state>=1), N = state 0, digits = exact state, @key=v = another control */
function ckLit(ac,rule,s){
  if(!rule) return false; if(!ckPower(ac)) return false;
  if(CKS.test) return true;
  if(rule==="T") return false; if(rule==="P") return s>=1; if(rule==="N") return s===0;
  if(rule[0]==="@"){ const [k,v]=rule.slice(1).split("="); return String(ckS(ac,k))===v; }
  if(rule[0]==="!"){ const A=CK[ac]; return !!(A.rules&&A.rules[rule.slice(1)]&&A.rules[rule.slice(1)](CKS.st[ac])); }
  return String(s)===rule;
}
const esc2=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
function lblTxt(x,y,t,cls,anchor){ if(!t) return ""; const L=String(t).split("|");
  return L.map((s,i)=>`<text class="${cls||"cl"}" x="${x}" y="${y-(L.length-1-i)*8}" text-anchor="${anchor||"middle"}">${esc2(s)}</text>`).join(""); }
/* ---- control drawing ---- */
function ckDraw(ac,p,c){
  const key=c.k==="co"?p.id+"."+c.ref:ckKey(p,c), s=ckS(ac,key), sel=CKS.sel===key, hit=CKS.q&&ckMatch(c), on=ckPower(ac);
  const rc=c.k==="co"?(p.c.find(q=>q.id===c.ref)||c):c, aria=esc2((rc.d?rc.d[0]+" — ":"")+(rc.lbl||c.txt||c.id));
  let g="";
  if(c.k==="pb"){
    const w=c.w||28, h=c.h||28, x=-w/2, y=-h/2;
    g+=`<rect class="pbf" x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/>`;
    const L=(L1,yy)=>{ if(!L1) return ""; const [t,col,rule]=L1, lit=ckLit(ac,rule||"P",s);
      return `<text class="pbl${lit?" lit":""}" x="0" y="${yy}" text-anchor="middle" fill="${lit?LCOL[col||"w"]:CKC.dim}" ${lit?`style="--glow:${LCOL[col||"w"]}"`:""}>${esc2(t)}</text>`; };
    const tl=Array.isArray(c.top)?c.top:(c.top?[c.top,"a","T"]:null), bl=Array.isArray(c.bot)?c.bot:(c.bot?[c.bot,c.on||"w","P"]:null);
    if(tl&&!bl) g+=L(tl,3.5); else if(bl&&!tl) g+=L(bl,3.5); else { g+=L(tl,-3.2); g+=L(bl,9.5); }
    if(tl&&bl) g+=`<line class="pbd" x1="${x+3}" x2="${-x-3}" y1="2.6" y2="2.6"/>`;
    if(c.g) g+=`<rect class="guard ${c.g==="r"?"gr":"gk"}${s&&c.gopen!==false?" open":""}" x="${x-3}" y="${y-3}" width="${w+6}" height="${h+6}" rx="3"/>`;
    if(c.lbl) g+=lblTxt(0,y-5,c.lbl);
  } else if(c.k==="rot"){
    const n=c.pos.length, span=n<=2?90:n===3?110:Math.min(280,42*n), a=i=>(-span/2+span*(n===1?0:i/(n-1)))*Math.PI/180, R=c.r||(n>5?13:11), LR=R+(n>5?15:11);
    c.pos.forEach((t,i)=>{ const aa=a(i), tx=Math.sin(aa)*LR, ty=-Math.cos(aa)*LR+3; g+=`<text class="cp${i===s?" cur":""}" x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="middle">${esc2(t)}</text>`;
      g+=`<line class="tick" x1="${(Math.sin(aa)*(R+2)).toFixed(1)}" y1="${(-Math.cos(aa)*(R+2)).toFixed(1)}" x2="${(Math.sin(aa)*(R+5)).toFixed(1)}" y2="${(-Math.cos(aa)*(R+5)).toFixed(1)}"/>`; });
    const aa=a(s);
    g+=`<circle class="knob" r="${R}"/><line class="ptr" x1="0" y1="0" x2="${(Math.sin(aa)*(R-1)).toFixed(1)}" y2="${(-Math.cos(aa)*(R-1)).toFixed(1)}"/>`;
    if(c.lbl) g+=lblTxt(0,R+(c.lblY||24),c.lbl);
  } else if(c.k==="tog"){
    const n=c.pos.length, gap=c.gap||11, y0=-(n-1)*gap/2, yy=y0+s*gap;
    c.pos.forEach((t,i)=>{ g+=`<text class="cp${i===s?" cur":""}" x="${c.left?-10:10}" y="${(y0+i*gap+3).toFixed(1)}" text-anchor="${c.left?"end":"start"}">${esc2(t)}</text>`; });
    g+=`<rect class="tslot" x="-3.5" y="${y0-5}" width="7" height="${(n-1)*gap+10}" rx="3.5"/><line class="tlev" x1="0" y1="${(y0+(n-1)*gap/2).toFixed(1)}" x2="0" y2="${yy.toFixed(1)}"/><circle class="tball" cy="${yy.toFixed(1)}" r="4.2"/>`;
    if(c.g) g+=`<rect class="guard ${c.g==="r"?"gr":"gk"}" x="-7" y="${y0-8}" width="14" height="${(n-1)*gap+16}" rx="3"/>`;
    if(c.lbl) g+=lblTxt(c.lblX||0,y0-11,c.lbl);
  } else if(c.k==="lt"){
    const lit=ckLit(ac,c.when||"T",s);
    g+=`<rect class="ltf" x="${-c.w/2}" y="${-c.h/2}" width="${c.w}" height="${c.h}" rx="1.5"/>`;
    String(c.txt).split("|").forEach((t,i,arr)=>{ g+=`<text class="pbl${lit?" lit":""}" x="0" y="${(i-(arr.length-1)/2)*8+3}" text-anchor="middle" fill="${lit?LCOL[c.col]:CKC.dim}" ${lit?`style="--glow:${LCOL[c.col]}"`:""}>${esc2(t)}</text>`; });
    if(c.lbl) g+=lblTxt(0,-c.h/2-4,c.lbl);
  } else if(c.k==="dsp"){
    const txt=on?(c.val?c.val(CKS.st[ac],s):(c.txt||"")):"";
    g+=`<rect class="dspf" x="${-c.w/2}" y="${-c.h/2}" width="${c.w}" height="${c.h}" rx="2"/><text class="dspt" x="0" y="4" text-anchor="middle" ${c.col?`fill="${LCOL[c.col]}"`:""}${c.dynId?` id="${c.dynId}"`:""}>${esc2(txt)}</text>`;
    if(c.lbl) g+=lblTxt(0,-c.h/2-4,c.lbl);
  } else if(c.k==="kn"){
    g+=`<circle class="knob big" r="${c.r||12}"/><circle class="knob in" r="${(c.r||12)*0.55}"/>`;
    if(c.lbl) g+=lblTxt(0,(c.r||12)+12,c.lbl);
    if(c.dot) g+=`<circle cx="${c.dot}" cy="-${(c.r||12)+5}" r="2.4" fill="${s?CKC.dim:CKC.white}" class="mdot"/>`;
  } else if(c.k==="gau"){
    g+=`<circle class="gaf" r="${c.r}"/>`; for(let i=0;i<=10;i++){ const aa=(-135+27*i)*Math.PI/180; g+=`<line class="tick" x1="${(Math.sin(aa)*c.r*0.78).toFixed(1)}" y1="${(-Math.cos(aa)*c.r*0.78).toFixed(1)}" x2="${(Math.sin(aa)*c.r*0.92).toFixed(1)}" y2="${(-Math.cos(aa)*c.r*0.92).toFixed(1)}"/>`; }
    const val=on?(c.val?c.val(CKS.st[ac]):0.3):0, aa=(-135+270*Math.max(0,Math.min(1,val)))*Math.PI/180;
    g+=`<line class="ndl" id="${c.dynId||""}" x1="0" y1="0" x2="${(Math.sin(aa)*c.r*0.8).toFixed(1)}" y2="${(-Math.cos(aa)*c.r*0.8).toFixed(1)}"/><circle r="2.5" class="hub"/>`;
    if(c.lbl) g+=lblTxt(0,c.r+11,c.lbl);
  } else if(c.k==="fh"){
    const out=s>=1, rotA=s===2?-35:s===3?35:0;
    g+=`<g transform="translate(0,${out?-8:0}) rotate(${rotA})"><rect class="fhh${ckLit(ac,c.when||"T",s)?" fire":""}" x="-26" y="-9" width="52" height="18" rx="7"/><text class="fht" y="4" text-anchor="middle">${esc2(c.lbl)}</text></g><rect class="fhs" x="-4" y="9" width="8" height="10"/>`;
  } else if(c.k==="sw"){
    const w=c.w||14, h=c.h||18, dn=s>0;
    g+=`<rect class="swc ${c.col||"w"}${dn?" dn":""}" x="${-w/2}" y="${-h/2+(dn?1.5:0)}" width="${w}" height="${h}" rx="3"/>`;
    if(c.mark) g+=`<text class="swm" x="0" y="${3+(dn?1.5:0)}" text-anchor="middle">${esc2(c.mark)}</text>`;
  } else if(c.k==="co"){
    const w=c.w||150, tx=c.tx-c.x, ty=c.ty-c.y, ex=tx>w/2?w:0;
    g+=`<line class="col" x1="${ex}" y1="11" x2="${tx.toFixed(1)}" y2="${ty.toFixed(1)}"/><circle class="cod" cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="2.6"/>`;
    g+=`<rect class="cob${sel?" sel":""}" width="${w}" height="22" rx="3"/><circle class="con" cx="11" cy="11" r="8"/><text class="cot n" x="11" y="14.2" text-anchor="middle">${c.n}</text><text class="cot" x="24" y="14.6">${esc2(c.txt)}</text>`;
  } else if(c.k==="lev"){ g+=ckLever(ac,c,s); }
  else if(c.k==="scr"){ g+=ckScreen(ac,p,c); }
  return `<g class="ckc${sel?" sel":""}${hit?" hit":""}" data-ck="${key}" transform="translate(${c.x},${c.y})" tabindex="${c.k==="co"?-1:0}" role="button" aria-label="${aria}">${g}</g>`;
}
function ckLever(ac,c,s){
  const n=c.pos.length, H=c.h||110, y0=-H/2, step=H/(n-1), y=y0+s*step; let g="";
  const nl=c.n||1, sp=c.sp||22, ext=c.kind==="thr"?(nl-1)/2*sp+12:14;
  if(c.kind==="thr") for(let i=0;i<nl;i++) g+=`<rect class="lslot" x="${(i-(nl-1)/2)*sp-4}" y="${y0-6}" width="8" height="${H+12}" rx="4"/>`;
  else g+=`<rect class="lslot" x="-5" y="${y0-6}" width="10" height="${H+12}" rx="5"/>`;
  c.pos.forEach((t,i)=>{ g+=`<text class="cp${i===s?" cur":""}" x="${c.left?-ext:ext}" y="${(y0+i*step+3).toFixed(1)}" text-anchor="${c.left?"end":"start"}">${esc2(t)}</text>`; });
  for(let i=0;i<nl;i++){ const xx=(i-(nl-1)/2)*sp, sv=c.multi?ckS(ac,c.multi+i):s, yy=y0+sv*step;
    g+=`<rect class="lhan${c.kind==="gear"?" gear":c.kind==="park"?" park":""}" x="${xx-(c.kind==="thr"?7:12)}" y="${(yy-6).toFixed(1)}" width="${c.kind==="thr"?14:24}" height="12" rx="${c.kind==="gear"?6:2}"/>`;
    if(c.kind==="thr") g+=`<text class="cl" x="${xx}" y="${(H/2+22).toFixed(1)}" text-anchor="middle">${i+1}</text>`; }
  if(c.lbl) g+=lblTxt(0,y0-12,c.lbl);
  return g;
}
function ckMatch(c){ const q=CKS.q.toLowerCase(); return (c.lbl&&c.lbl.toLowerCase().indexOf(q)>=0)||(c.txt&&String(c.txt).toLowerCase().indexOf(q)>=0)||(c.d&&c.d[0].indexOf(CKS.q)>=0)||(c.id.toLowerCase().indexOf(q)>=0); }
function ckPanel(ac,p){
  let g=`<g class="ckp" transform="translate(${p.x},${p.y})"><rect class="pf" width="${p.w}" height="${p.h}" rx="3"/>`;
  if(p.t) g+=`<text class="pt" x="7" y="11">${esc2(p.t)}</text>`;
  if(p.svg) g+=p.svg;
  (p.ln||[]).forEach(l=>{ g+=`<polyline class="syn ${l[0]}" points="${l.slice(1).join(" ")}"/>`; });
  (p.tx||[]).forEach(t=>{ g+=`<text class="${t[3]||"cl"}" x="${t[0]}" y="${t[1]}" text-anchor="middle">${esc2(t[2])}</text>`; });
  (p.box||[]).forEach(b=>{ g+=`<rect class="sbox ${b[4]||""}" x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${b[3]}" rx="2"/>`; });
  p.c.forEach(c=>{ g+=ckDraw(ac,p,c); });
  return g+`</g>`;
}
function ckArea(ac,aid){
  const A=CK[ac].areas[aid];
  return `<svg class="cksvg" viewBox="0 0 ${A.w} ${A.h}" role="group" aria-label="${esc2(A.t)}">${A.bg?A.bg:""}${A.panels.map(p=>ckPanel(ac,p)).join("")}</svg>`;
}
/* the whole flight deck as one tall picture, like a photo from behind the seats: overhead, windscreen, glareshield, main panel, pedestal */
function ckWhole(ac){
  const A=CK[ac], W=1100, o=A.areas.ovhd, g=A.areas.glare, m=A.areas.main, pd=A.areas.ped, yk=A.areas.yoke;
  const so=760/o.w, oh=o.h*so, wy=oh+10, wh=230, gy=wy+wh, gH=g.h*W/g.w, my=gy+gH, mH=m.h*W/m.w, yH=yk?yk.h*W/yk.w:0, py=my+mH+yH, pH=pd.h*0.9;
  const H=py+pH+10;
  let city=""; let seed=7; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  for(let i=0;i<520;i++){ const x=rnd()*W, y=wy+wh*0.42+Math.pow(rnd(),0.7)*wh*0.58, r=rnd()<0.08?1.6:0.9, c=rnd()<0.7?"#FFC66B":rnd()<0.5?"#FFFFFF":"#9FD3FF"; city+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${c}" opacity="${(0.35+rnd()*0.6).toFixed(2)}"/>`; }
  const nest=(aid,x,y,w,h)=>{ const a=A.areas[aid]; return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 ${a.w} ${a.h}" role="group" aria-label="${esc2(a.t)}">${a.bg||""}${a.panels.map(p=>ckPanel(ac,p)).join("")}</svg>`; };
  return `<svg class="cksvg whole" viewBox="0 0 ${W} ${H}" role="group" aria-label="قمرة القيادة كاملة">
    <defs><linearGradient id="ckSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05080d"/><stop offset="0.38" stop-color="#14202d"/><stop offset="0.5" stop-color="#2a2a33"/><stop offset="1" stop-color="#0b0d10"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="#06080a"/>
    <path d="M60 ${oh+6} L${W-60} ${oh+6} L${W-10} ${H} L10 ${H} Z" fill="#0b0e11"/>
    ${nest("ovhd",(W-760)/2,0,760,oh)}
    <clipPath id="ckWin"><rect x="40" y="${wy}" width="${W-80}" height="${wh}"/></clipPath>
    <g><rect x="40" y="${wy}" width="${W-80}" height="${wh}" fill="url(#ckSky)"/><g clip-path="url(#ckWin)">${city}</g>
      <path d="M40 ${wy} L${W/2-28} ${wy} L${W/2-40} ${wy+wh} L40 ${wy+wh} Z M${W/2+28} ${wy} L${W-40} ${wy} L${W-40} ${wy+wh} L${W/2+40} ${wy+wh} Z" fill="none" stroke="#1b2026" stroke-width="10"/>
      <rect x="${W/2-28}" y="${wy}" width="56" height="${wh}" fill="#0d1013"/></g>
    ${nest("glare",0,gy,W,gH)}
    ${nest("main",0,my,W,mH)}
    ${yk?nest("yoke",0,my+mH,W,yH):""}
    ${nest("ped",(W-pd.w*0.9)/2,py,pd.w*0.9,pH)}
  </svg>`;
}
/* ---- displays ---- */
function ckScreen(ac,p,c){
  const on=ckPower(ac)&&(c.pw?c.pw(CKS.st[ac]):true), w=c.w, h=c.h, x=-w/2, y=-h/2, id=c.id;
  let g=`<rect class="scrb" x="${x-3}" y="${y-3}" width="${w+6}" height="${h+6}" rx="3"/><rect class="scr" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
  if(!on) return g;
  const clip=`clip_${ac}_${p.id}_${id}`;
  g+=`<clipPath id="${clip}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#${clip})">`;
  if(c.kind==="pfd") g+=scrPFD(ac,c,x,y,w,h);
  else if(c.kind==="nd") g+=scrND(ac,c,x,y,w,h);
  else if(c.kind==="ewd") g+=scrEWD(ac,c,x,y,w,h);
  else if(c.kind==="sd") g+=scrSD(ac,c,x,y,w,h);
  else if(c.kind==="mfd"||c.kind==="cdu") g+=scrMFD(ac,c,x,y,w,h);
  else if(c.kind==="isis") g+=scrISIS(ac,c,x,y,w,h);
  else if(c.kind==="rmp") g+=`<text class="dspt sm" x="${x+6}" y="${y+14}" fill="${CKC.green}">VHF1 118.700</text><text class="dspt sm" x="${x+6}" y="${y+28}" fill="${CKC.white}">STBY 121.500</text><text class="dspt sm" x="${x+6}" y="${y+42}" fill="${CKC.blue}">DATA</text>`;
  else if(c.kind==="clock") g+=`<text class="dspt" x="0" y="-2" text-anchor="middle" fill="${CKC.white}" data-dyn="clock">--:--</text><text class="dspt sm" x="0" y="12" text-anchor="middle" fill="${CKC.green}">UTC</text>`;
  else if(c.kind==="kbd") g+=scrKbd(x,y,w,h);
  return g+`</g>`;
}
function scrKbd(x,y,w,h){ let g=""; const cols=12, rows=4, kw=(w-8)/cols, kh=(h-10)/(rows+1);
  for(let r=0;r<rows;r++) for(let i=0;i<cols;i++) g+=`<rect class="key" x="${(x+4+i*kw+1).toFixed(1)}" y="${(y+4+r*kh+1).toFixed(1)}" width="${(kw-2).toFixed(1)}" height="${(kh-2).toFixed(1)}" rx="1.5"/>`;
  g+=`<circle class="ball" cx="${x+w-18}" cy="${y+h-12}" r="8"/>`; return g; }
function scrPFD(ac,c,x,y,w,h){
  const cx=x+w*0.47, cy=y+h*0.47, R=Math.min(w,h)*0.36;
  let g=`<g data-dyn="att" transform="translate(${cx},${cy})"><g data-dyn="attIn"><rect x="-${w}" y="-${h*2}" width="${w*2}" height="${h*2}" fill="#2C86E6"/><rect x="-${w}" y="0" width="${w*2}" height="${h*2}" fill="#8A5A2E"/><line x1="-${w}" x2="${w}" y1="0" y2="0" stroke="#fff" stroke-width="1.2"/>`;
  for(let p=-20;p<=20;p+=5){ if(!p) continue; const yy=-p*R/22, ww=p%10?R*0.18:R*0.34; g+=`<line x1="${-ww}" x2="${ww}" y1="${yy}" y2="${yy}" stroke="#fff" stroke-width="0.8"/>`; if(!(p%10)) g+=`<text x="${ww+4}" y="${yy+3}" fill="#fff" class="scrt">${Math.abs(p)}</text>`; }
  g+=`</g></g>`;
  g+=`<g transform="translate(${cx},${cy})"><path d="M${-R*0.75} 0 h${R*0.38} v5 M${R*0.75} 0 h${-R*0.38} v5" stroke="#FFD24A" stroke-width="3" fill="none"/><rect x="-2.5" y="-2.5" width="5" height="5" fill="#000" stroke="#FFD24A"/></g>`;
  g+=`<rect x="${x+2}" y="${y+h*0.12}" width="${w*0.16}" height="${h*0.7}" fill="#3a3f44" opacity="0.9"/><text class="scrt big" x="${x+w*0.1}" y="${cy+4}" text-anchor="middle" fill="#fff" data-dyn="spd">250</text><path d="M${x+w*0.18} ${cy} l6 -5 v10z" fill="#FFD24A"/>`;
  g+=`<rect x="${x+w*0.8}" y="${y+h*0.12}" width="${w*0.18}" height="${h*0.7}" fill="#3a3f44" opacity="0.9"/><text class="scrt big" x="${x+w*0.89}" y="${cy+4}" text-anchor="middle" fill="#fff" data-dyn="alt">24000</text><text class="scrt" x="${x+w*0.89}" y="${y+h*0.1}" text-anchor="middle" fill="${CKC.blue}" data-dyn="altSel">FL240</text>`;
  g+=`<rect x="${x+w*0.25}" y="${y+h*0.88}" width="${w*0.45}" height="${h*0.1}" fill="#3a3f44"/><text class="scrt" x="${x+w*0.47}" y="${y+h*0.955}" text-anchor="middle" fill="#fff" data-dyn="hdg">090</text>`;
  const fma=CK[ac].fma?CK[ac].fma(CKS.st[ac]):["","","","",""];
  [0,1,2,3,4].forEach(i=>{ g+=`<text class="scrt" x="${x+w*(0.1+i*0.2)}" y="${y+h*0.07}" text-anchor="middle" fill="${i<3?CKC.green:CKC.white}">${esc2(fma[i]||"")}</text>`; });
  g+=`<text class="scrt" x="${x+w*0.06}" y="${y+h*0.98}" fill="${CKC.blue}">${esc2(CK[ac].baro?CK[ac].baro(CKS.st[ac]):"STD")}</text>`;
  return g;
}
function scrND(ac,c,x,y,w,h){
  const st=CKS.st[ac], mode=CK[ac].ndMode?CK[ac].ndMode(st):"ARC", rng=CK[ac].ndRange?CK[ac].ndRange(st):40, ov=CK[ac].ndOv?CK[ac].ndOv(st):{};
  const arc=mode==="ARC", cx=x+w/2, cy=arc?y+h*0.82:y+h/2, R=arc?h*0.7:h*0.4;
  let g=`<g data-dyn="rose" transform="translate(${cx},${cy})">`;
  if(mode!=="PLAN"){ for(let a=0;a<360;a+=5){ const r1=R, r2=R-(a%10?4:8), aa=a*Math.PI/180; g+=`<line x1="${(Math.sin(aa)*r1).toFixed(1)}" y1="${(-Math.cos(aa)*r1).toFixed(1)}" x2="${(Math.sin(aa)*r2).toFixed(1)}" y2="${(-Math.cos(aa)*r2).toFixed(1)}" stroke="#fff" stroke-width="0.8"/>`;
      if(!(a%30)) g+=`<text class="scrt" x="${(Math.sin(aa)*(R-16)).toFixed(1)}" y="${(-Math.cos(aa)*(R-16)+3).toFixed(1)}" text-anchor="middle" fill="#fff">${a/10}</text>`; } }
  if(ov.terr){ for(let i=0;i<14;i++){ const aa=(i*47%360)*Math.PI/180, rr=R*(0.35+((i*37)%50)/100); g+=`<circle cx="${(Math.sin(aa)*rr).toFixed(1)}" cy="${(-Math.cos(aa)*rr).toFixed(1)}" r="${(R*0.12).toFixed(1)}" fill="${i%3?"#1d8a3a":"#b8a222"}" opacity="0.55"/>`; } }
  if(ov.wx){ for(let i=0;i<6;i++){ const aa=((i*61+20)%120-60)*Math.PI/180, rr=R*(0.45+i*0.06); g+=`<circle cx="${(Math.sin(aa)*rr).toFixed(1)}" cy="${(-Math.cos(aa)*rr).toFixed(1)}" r="${(R*0.09).toFixed(1)}" fill="${i%2?"#1ec53f":"#e8c51c"}" opacity="0.8"/>`; } g+=`<circle cx="${(R*0.15).toFixed(1)}" cy="${(-R*0.62).toFixed(1)}" r="${(R*0.05).toFixed(1)}" fill="#e52b2b"/>`; }
  g+=`</g>`;
  g+=`<polyline points="${cx},${cy} ${cx+w*0.06},${cy-R*0.45} ${cx-w*0.04},${cy-R*0.95}" fill="none" stroke="#2BE07C" stroke-width="1.6"/><circle cx="${cx+w*0.06}" cy="${cy-R*0.45}" r="3" fill="none" stroke="#fff"/>`;
  if(ov.wpt) g+=`<text class="scrt" x="${cx+w*0.06+6}" y="${cy-R*0.45}" fill="#fff">KOLAX</text>`;
  if(ov.arpt) g+=`<text class="scrt" x="${cx-w*0.04+6}" y="${cy-R*0.95+4}" fill="#E36BE0">OTHH</text>`;
  if(ov.traf) g+=`<path d="M${cx-w*0.2} ${cy-R*0.5} l5 -5 5 5 -5 5z" fill="#fff"/><text class="scrt" x="${cx-w*0.2}" y="${cy-R*0.5-8}" fill="#fff" text-anchor="middle">+12</text>`;
  g+=`<path d="M${cx} ${cy-8} l0 16 M${cx-9} ${cy} h18 M${cx-4} ${cy+7} h8" stroke="#FFD24A" stroke-width="2.2"/>`;
  g+=`<text class="scrt" x="${x+6}" y="${y+12}" fill="#2BE07C">${esc2(mode)}</text><text class="scrt" x="${x+w-6}" y="${y+12}" text-anchor="end" fill="#fff">${rng} NM</text><text class="scrt" x="${cx}" y="${y+12}" text-anchor="middle" fill="#FFD24A" data-dyn="ndhdg">090</text>`;
  return g;
}
function ckMemos(ac){ const A=CK[ac]; if(!ckPower(ac)) return []; return A.memos?A.memos(CKS.st[ac]):[]; }
function scrEWD(ac,c,x,y,w,h){
  const A=CK[ac], ne=A.engines||4; let g="";
  for(let i=0;i<ne;i++){ const cx=x+w*(i+0.5)/ne, cy=y+h*0.26, R=Math.min(w/ne*0.38,h*0.17);
    g+=`<path d="M${cx-R} ${cy} A${R} ${R} 0 1 1 ${cx+R*0.7} ${cy+R*0.7}" fill="none" stroke="#fff" stroke-width="1.2"/><line data-dyn="n1n${i}" x1="${cx}" y1="${cy}" x2="${cx-R}" y2="${cy}" stroke="${CKC.green}" stroke-width="2"/><text class="scrt" x="${cx+2}" y="${cy+R*0.95}" text-anchor="middle" fill="${CKC.green}" data-dyn="n1t${i}">0.0</text><text class="scrt" x="${cx}" y="${cy+R*1.6}" text-anchor="middle" fill="#9fd" data-dyn="egt${i}">EGT</text>`; }
  g+=`<text class="scrt" x="${x+w/2}" y="${y+h*0.06}" text-anchor="middle" fill="#fff">${A.ewdTitle||"N1 %"}</text><line x1="${x+4}" x2="${x+w-4}" y1="${y+h*0.58}" y2="${y+h*0.58}" stroke="#fff" stroke-width="0.6"/>`;
  ckMemos(ac).slice(0,6).forEach((m,i)=>{ g+=`<text class="scrt" x="${x+8}" y="${y+h*0.66+i*11}" fill="${LCOL[m[1]]||CKC.green}">${esc2(m[0])}</text>`; });
  return g;
}
function scrSD(ac,c,x,y,w,h){
  const A=CK[ac], page=CKS.sd||A.sdDefault||"ENG", st=CKS.st[ac], rows=A.sdPage?A.sdPage(page,st):[];
  let g=`<text class="scrt" x="${x+w/2}" y="${y+13}" text-anchor="middle" fill="#fff" text-decoration="underline">${esc2(page)}</text>`;
  rows.slice(0,9).forEach((r,i)=>{ g+=`<text class="scrt" x="${x+8}" y="${y+30+i*12}" fill="#fff">${esc2(r[0])}</text><text class="scrt" x="${x+w-8}" y="${y+30+i*12}" text-anchor="end" fill="${LCOL[r[2]]||CKC.green}">${esc2(r[1])}</text>`; });
  return g;
}
function scrMFD(ac,c,x,y,w,h){
  const lines=c.kind==="cdu"?["  RTE 1  ","ORIGIN   DEST","OTHH     OMDB","CO ROUTE","-----","RUNWAY  ","RW34R","<INDEX   ACT>"]:["ACTIVE/F-PLN","FROM  OTHH","KOLAX 090°","ITNUL  FL240","DEST  OMDB","TIME 0:52","EFOB 18.4"];
  let g=""; lines.forEach((t,i)=>{ g+=`<text class="scrt" x="${x+6}" y="${y+13+i*(h-14)/lines.length}" fill="${i===0?CKC.white:i%2?CKC.green:CKC.white}">${esc2(t)}</text>`; }); return g;
}
function scrISIS(ac,c,x,y,w,h){ const cx=x+w/2, cy=y+h/2;
  return `<g data-dyn="isis" transform="translate(${cx},${cy})"><g data-dyn="isisIn"><rect x="-${w}" y="-${h*2}" width="${w*2}" height="${h*2}" fill="#2C86E6"/><rect x="-${w}" y="0" width="${w*2}" height="${h*2}" fill="#8A5A2E"/></g></g><path d="M${cx-w*0.3} ${cy} h${w*0.18} M${cx+w*0.3} ${cy} h${-w*0.18}" stroke="#FFD24A" stroke-width="2"/>`; }

/* ---- page, events, info ---- */
function ckHTML(){
  const ac=CK[S.ac]?S.ac:"a380", A=CK[ac]; ckInit(ac); CKS.ac=ac;
  const areas=[["all","القمرة كاملة"],["ovhd","اللوحة العلوية"],["glare","واقي الوهج"],["main","اللوحة الأمامية"],["ped","الكونسول الوسطي"]];
  if(A.areas.yoke) areas.push(["yoke",A.areas.yoke.t]);
  return `<div class="ck ${A.style}${CKS.day?" day":""}${CKS.lbl?"":" nolbl"}">
    <div class="ckbar">
      <div class="seg ckseg" role="group" aria-label="جزء القمرة">${areas.map(([k,t])=>`<button type="button" data-cka="${k}" aria-pressed="${CKS.area===k}">${t}</button>`).join("")}</div>
      <div class="ckpre" role="group" aria-label="حالة الطائرة"><span class="status">حالة الطائرة:</span>
        <button type="button" class="btn sm" data-ckp="cold">باردة ومطفأة</button><button type="button" class="btn sm" data-ckp="start">قبل تشغيل المحركات</button><button type="button" class="btn sm" data-ckp="flight">في الطيران</button></div>
      <div class="ckopt"><input type="search" id="ckQ" placeholder="ابحث عن زر: FUEL، APU، مضخة…" value="${esc2(CKS.q)}" aria-label="ابحث عن زر">
        <button type="button" class="btn sm" data-cko="act" aria-pressed="${CKS.act}">الضغط يحرّك الزر</button>
        <button type="button" class="btn sm" data-cko="test" aria-pressed="${CKS.test}">فحص المصابيح</button>
        <button type="button" class="btn sm" data-cko="day" aria-pressed="${CKS.day}">إضاءة نهارية</button>
        <button type="button" class="btn sm" data-cko="lbl" aria-pressed="${CKS.lbl}">الأسماء</button></div>
    </div>
    <div class="ckgrid"><div class="ckstage" id="ckStage">${CKS.area==="all"?ckWhole(ac):ckArea(ac,CKS.area)}</div>
      <aside class="ckinfo" id="ckInfo" aria-live="polite">${ckInfo(ac)}</aside></div>
    <p class="status ckfoot">${esc2(A.foot||"")}</p>
  </div>`;
}
function ckFind(ac,key){ const r=ckAll(ac).find(([a,p,c])=>ckKey(p,c)===key); return r||null; }
function ckInfo(ac){
  const A=CK[ac];
  if(!CKS.sel){ return `<h3>${esc2(A.name)}</h3><p>${esc2(A.intro)}</p><ul class="cklegend">
    <li><i style="background:${CKC.amber}"></i>كهرماني: عطل أو تنبيه يحتاج انتباه</li><li><i style="background:${CKC.white}"></i>أبيض: وضع غير عادي اختاره الطيار (مثل OFF)</li>
    <li><i style="background:${CKC.blue}"></i>أزرق: نظام مشغّل مؤقتاً (ON)</li><li><i style="background:${CKC.green}"></i>أخضر: يعمل بشكل طبيعي أو متاح (AVAIL)</li><li><i style="background:${CKC.red}"></i>أحمر: تحذير خطير، مثل الحريق</li></ul>
    <p class="status">اضغط أي زر في الصورة لترى اسمه ووظيفته ووضعه الطبيعي في الطيران.</p>${ckYokeList(ac)}`; }
  const f=ckFind(ac,CKS.sel); if(!f) return "";
  const [aid,p,c]=f, s=ckS(ac,CKS.sel), d=c.d||[c.lbl||c.id,"",""];
  const posTxt=c.pos?c.pos.map((t,i)=>`<li${i===s?' class="cur"':""}><b dir="ltr">${esc2(t)}</b>${c.pd&&c.pd[i]?" — "+esc2(c.pd[i]):""}</li>`).join(""):"";
  const pbState=c.k==="pb"?`<p class="ckst">الوضع الآن: <b>${esc2(c.sd?c.sd[s]:(s?(Array.isArray(c.bot)?c.bot[0]:c.bot)||"مضغوط":"عادي (غير مضغوط)"))}</b></p>`:"";
  return `<div class="ckhead"><span class="ckarea">${esc2(A.areas[aid].t)} · ${esc2(p.t||p.id)}</span><button type="button" class="btn sm" data-ckx="1" aria-label="إغلاق الشرح">✕</button></div>
    <h3 dir="ltr" class="ckname">${esc2(String(c.lbl||c.txt||c.id).replace(/\|/g," "))}</h3><p class="ckar">${esc2(d[0])} · <span class="status">${TYPE_AR[c.k]||""}</span></p>
    <p>${esc2(d[1])}</p>${pbState}${posTxt?`<ul class="ckpos">${posTxt}</ul>`:""}
    ${d[2]?`<p class="cknorm"><b>في الطيران العادي:</b> ${esc2(d[2])}</p>`:""}
    ${c.k!=="lt"&&c.k!=="dsp"&&c.k!=="gau"&&c.k!=="scr"?`<button type="button" class="btn" data-ckt="1">${c.k==="pb"?"اضغط الزر":"حرّك إلى الوضع التالي"}</button>`:""}`;
}
/* the buttons of the yoke / sidestick as a numbered list (same numbers as the callouts in the picture): the text alternative */
function ckYokeList(ac){
  const A=CK[ac], y=A.areas.yoke; if(!y||CKS.area!=="yoke") return "";
  const p=y.panels[0], lst=p.c.filter(c=>c.k==="sw");
  return `<h4 class="ckyh">الأزرار والمفاتيح</h4><ol class="ckyl">${lst.map((c,i)=>`<li><button type="button" class="lnk" data-ck="${p.id}.${c.id}"><b dir="ltr">${i+1}. ${esc2(c.lbl||c.id)}</b> ${esc2(c.d?c.d[0]:"")}</button></li>`).join("")}</ol>${A.yokeNote?`<p class="status">${esc2(A.yokeNote)}</p>`:""}`;
}
function ckActuate(ac,key,dir){
  const f=ckFind(ac,key); if(!f) return; const c=f[2], st=CKS.st[ac];
  const n=c.k==="pb"||c.k==="kn"?(c.n||2):c.pos?c.pos.length:1, A=CK[ac];
  if(n<2){ if(c.onSet) c.onSet(st,0); if(A.after) A.after(st,key,1); if(f[1].sd) CKS.sd=f[1].sd; return; }
  if(c.multi){ /* one lever group moving together (thrust levers) */ const nv=((st[key]||0)+(dir||1)+n)%n; st[key]=nv; for(let i=0;i<(c.n||1);i++) st[c.multi+i]=nv; }
  else st[key]=((st[key]||0)+(dir||1)+n)%n;
  if(c.onSet) c.onSet(st,st[key]);
  if(A.after) A.after(st,key,st[key]);
  if(f[1].sd) CKS.sd=f[1].sd;
}
function ckRender(){
  const el=CKS.el; if(!el) return; const ac=CKS.ac;
  const stg=el.querySelector("#ckStage"); stg.innerHTML=CKS.area==="all"?ckWhole(ac):ckArea(ac,CKS.area);
  el.querySelector("#ckInfo").innerHTML=ckInfo(ac); ckRefs(); ckCenter();
}
function ckCenter(){ const stg=CKS.el&&CKS.el.querySelector("#ckStage"); if(!stg) return; if(CKS.area==="all"&&!CKS.sel) stg.scrollLeft=(stg.scrollWidth-stg.clientWidth)/2; }
function ckRefs(){ const el=CKS.el, R={}; el.querySelectorAll("[data-dyn]").forEach(n=>{ (R[n.dataset.dyn]=R[n.dataset.dyn]||[]).push(n); }); CKS.refs=R; }
function ckMount(root){
  CKS.el=root.querySelector(".ck"); const el=CKS.el, ac=CKS.ac;
  el.addEventListener("click",e=>{
    const a=e.target.closest("[data-cka]"); if(a){ CKS.area=a.dataset.cka; el.querySelectorAll("[data-cka]").forEach(b=>b.setAttribute("aria-pressed",b===a)); ckRender(); return; }
    const pr=e.target.closest("[data-ckp]"); if(pr){ ckPreset(CKS.ac,pr.dataset.ckp); ckRender(); return; }
    const o=e.target.closest("[data-cko]"); if(o){ const k=o.dataset.cko; CKS[k]=!CKS[k]; o.setAttribute("aria-pressed",CKS[k]);
      if(k==="day") el.classList.toggle("day",CKS.day); if(k==="lbl") el.classList.toggle("nolbl",!CKS.lbl); if(k==="test") ckRender(); return; }
    if(e.target.closest("[data-ckx]")){ CKS.sel=null; ckRender(); return; }
    if(e.target.closest("[data-ckt]")){ ckActuate(CKS.ac,CKS.sel,1); ckRender(); return; }
    const c=e.target.closest("[data-ck]"); if(c){ const key=c.dataset.ck; const was=CKS.sel===key; CKS.sel=key;
      if(CKS.act&&(was||true)) ckActuate(CKS.ac,key,e.shiftKey?-1:1); ckRender();
      const inf=el.querySelector("#ckInfo"); if(inf&&window.innerWidth<900&&inf.scrollIntoView) inf.scrollIntoView({behavior:"smooth",block:"nearest"}); }
  });
  el.addEventListener("keydown",e=>{ const c=e.target.closest&&e.target.closest("[data-ck]"); if(c&&(e.key==="Enter"||e.key===" ")){ e.preventDefault(); CKS.sel=c.dataset.ck; if(CKS.act) ckActuate(CKS.ac,CKS.sel,1); ckRender(); const n=CKS.el.querySelector(`[data-ck="${CKS.sel}"]`); if(n) n.focus(); } });
  const q=el.querySelector("#ckQ"); q.addEventListener("input",()=>{ CKS.q=q.value.trim(); const stg=el.querySelector("#ckStage"); stg.innerHTML=CKS.area==="all"?ckWhole(CKS.ac):ckArea(CKS.ac,CKS.area); ckRefs();
    const h=stg.querySelector(".hit"); if(h&&h.scrollIntoView) h.scrollIntoView({behavior:"smooth",block:"center",inline:"center"}); });
  ckRefs(); ckCenter(); ckLoop();
}
function ckStop(){ if(CKS.raf) cancelAnimationFrame(CKS.raf); CKS.raf=0; CKS.el=null; }
function ckLoop(){
  if(CKS.raf) cancelAnimationFrame(CKS.raf);
  let last=performance.now();
  const step=now=>{
    if(!CKS.el||!document.body.contains(CKS.el)){ CKS.raf=0; return; }
    CKS.raf=requestAnimationFrame(step);
    if(now-last<100) return; const dt=Math.min(0.3,(now-last)/1000); last=now;
    if(document.hidden) return; const sr=CKS.el.querySelector("#ckStage").getBoundingClientRect(); if(sr.bottom<0||sr.top>innerHeight) return;
    const ac=CKS.ac, A=CK[ac], st=CKS.st[ac], sim=CKS.sim; sim.t+=dt;
    if(A.simStep) A.simStep(st,sim,dt);
    const R=CKS.refs||{}, set=(k,f)=>{ (R[k]||[]).forEach(f); };
    const txt=(k,v)=>set(k,n=>{ if(n.textContent!==v) n.textContent=v; }), tr=(n,v)=>{ if(n.getAttribute("transform")!==v) n.setAttribute("transform",v); };
    const roll=sim.roll||0, pitch=sim.pitch||2.5;
    set("attIn",n=>tr(n,`rotate(${(-roll).toFixed(1)}) translate(0 ${(pitch*2.2).toFixed(1)})`));
    set("isisIn",n=>tr(n,`rotate(${(-roll).toFixed(1)}) translate(0 ${(pitch*1.6).toFixed(1)})`));
    txt("spd",String(Math.round(sim.spd))); txt("alt",String(Math.round(sim.alt/10)*10));
    txt("altSel","FL"+String(Math.round((sim.altT||sim.alt)/100)).padStart(3,"0"));
    const hh=String(Math.round(((sim.hdg%360)+360)%360)).padStart(3,"0"); txt("hdg",hh); txt("ndhdg",hh);
    set("rose",n=>{ const t=n.getAttribute("transform").replace(/ rotate\([^)]*\)/,""); tr(n,t+` rotate(${(-sim.hdg).toFixed(1)})`); });
    (sim.n1||[]).forEach((v,i)=>{ txt("n1t"+i,v.toFixed(1)); txt("egt"+i,"EGT "+Math.round(sim.egt[i]));
      set("n1n"+i,n=>{ const x1=+n.getAttribute("x1"), y1=+n.getAttribute("y1"), R=Math.hypot(+n.getAttribute("x2")-x1,+n.getAttribute("y2")-y1)||10, a=(-180+2.25*v)*Math.PI/180; n.setAttribute("x2",(x1+Math.cos(a)*R).toFixed(1)); n.setAttribute("y2",(y1+Math.sin(a)*R).toFixed(1)); }); });
    const d=new Date(); txt("clock",String(d.getUTCHours()).padStart(2,"0")+":"+String(d.getUTCMinutes()).padStart(2,"0"));
  };
  CKS.raf=requestAnimationFrame(step);
}
