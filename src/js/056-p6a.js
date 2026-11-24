/* ---------- lessons: an interactive course on the core topics of two aerospace textbooks.
   Text, figures and animations are original; nothing is copied from the books. Each lesson: intro, live canvas driven by the equations, sliders, readouts, equations, notes, a short quiz, a reference to the matching chapter, and (where it helps) a link to the 3D aircraft. ---------- */
const LRN={book:"itf", i:0, st:null, run:false, raf:0, last:0, cv:null, C:null, cT:0, play:true, el:null, ac:null};
const LBOOK={
  itf:{ar:"مدخل إلى الطيران", en:"Introduction to Flight", au:"John D. Anderson Jr."},
  foa:{ar:"أساسيات الديناميكا الهوائية", en:"Fundamentals of Aerodynamics", au:"John D. Anderson Jr."},
  rds:{ar:"تصميم الطائرات: منهج مفاهيمي", en:"Aircraft Design: A Conceptual Approach", au:"Daniel P. Raymer"},
  mof:{ar:"ميكانيكا الطيران", en:"Mechanics of Flight", au:""},
  str:{ar:"هياكل الطائرات", en:"Aircraft Structures for Engineering Students", au:"T. H. G. Megson"},
  fsc:{ar:"الاستقرار والتحكم الآلي", en:"Flight Stability and Automatic Control", au:"Robert C. Nelson"},
  aaf:{ar:"الديناميكا الهوائية وميكانيكا الطيران", en:"Aerodynamics, Aeronautics, and Flight Mechanics", au:"Barnes W. McCormick"},
  ast:{ar:"أساسيات الديناميكا الفلكية", en:"Fundamentals of Astrodynamics", au:"Bate, Mueller & White"},
  sse:{ar:"هندسة أنظمة المركبات الفضائية", en:"Spacecraft Systems Engineering", au:"Fortescue, Swinerd & Stark"},
  tof:{ar:"نظرية الطيران", en:"Theory of Flight", au:"Richard von Mises"},
  /* four practical tracks written for this site (no source book): systems, operations, navigation and weather, maintenance */
  asy:{ar:"أنظمة الطائرة النفاثة", en:"Jet Aircraft Systems", au:"", grp:"app"},
  prf:{ar:"الأداء والعمليات الجوية", en:"Flight Operations and Performance", au:"", grp:"app"},
  nav:{ar:"الملاحة والأرصاد الجوية", en:"Navigation and Meteorology", au:"", grp:"app"},
  mnt:{ar:"الصيانة والموثوقية", en:"Maintenance Engineering and Reliability", au:"", grp:"app"}
};
const LESSONS={}; Object.keys(LBOOK).forEach(k=>LESSONS[k]=[]);
const G0=9.80665, RAIR=287.05, GAM=1.4, KT=1.943844, D2R=Math.PI/180;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t;

/* International Standard Atmosphere, 0–20 km */
function isa(h){
  let T,p;
  if(h<=11000){ T=288.15-0.0065*h; p=101325*Math.pow(T/288.15,5.25588); }
  else { T=216.65; p=22632.06*Math.exp(-G0*(h-11000)/(RAIR*T)); }
  return {T,p,rho:p/(RAIR*T),a:Math.sqrt(GAM*RAIR*T),mu:1.458e-6*Math.pow(T,1.5)/(T+110.4)};
}
/* aircraft data used by the performance lessons (public figures, rounded) */
const LAC={
  a380:{n:"A380",S:845,b:79.8,mtow:575000,e:0.85,T0:4*310e3},
  b737:{n:"737-800",S:124.6,b:35.8,mtow:79016,e:0.82,T0:2*121.4e3},
  b747:{n:"747-400",S:525,b:64.4,mtow:396900,e:0.84,T0:4*250e3}
};
function lac(){ let k="a380"; try{ k=S.ac; }catch(e){} return LAC[k]||LAC.a380; }

function nf(v,d){ if(!isFinite(v)) return "—"; return v.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d}); }
function sci(v,d){ d=d==null?2:d; if(!isFinite(v)) return "—"; if(v===0) return "0"; const e=Math.floor(Math.log10(Math.abs(v))), m=v/Math.pow(10,e);
  const sup={"-":"⁻","0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹"};
  return m.toFixed(d)+"×10"+String(e).split("").map(c=>sup[c]).join(""); }
function hx(c){ c=(c||"#888888").replace("#","").trim(); if(c.length===3) c=c.split("").map(x=>x+x).join(""); const n=parseInt(c,16)||0; return [(n>>16)&255,(n>>8)&255,n&255]; }
function mixC(a,b,t){ const A=hx(a),B=hx(b); t=clamp(t,0,1); return "rgb("+A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(",")+")"; }
function lrnColors(){
  const cs=getComputedStyle(document.documentElement), v=k=>(cs.getPropertyValue("--"+k)||"").trim()||"#888888";
  const o={}; ["bg","panel","ink","muted","line","accent","power","fuel","hyd","ctrl","gear","sys","struct"].forEach(k=>o[k]=v(k)); return o;
}

/* canvas helpers */
const LF='"IBM Plex Sans Arabic","Segoe UI",Tahoma,sans-serif', LM='"IBM Plex Mono",ui-monospace,Consolas,monospace';
const LTR_RUN=/[A-Za-z0-9][A-Za-z0-9 .,:\/%°+\-−×·²³⁰¹⁴⁵⁶⁷⁸⁹_()=≈~₀₁₂*']*[A-Za-z0-9%°)²³₀₁₂]/g;
function ltx(g,s,x,y,o){ o=o||{}; if(o.rtl&&/[A-Za-z0-9]/.test(s)) s=String(s).replace(/\([^()]*[A-Za-z0-9][^()]*\)/g,m=>"\u2066"+m+"\u2069").replace(LTR_RUN,m=>"\u2066"+m+"\u2069");   /* a parenthesised Latin group "(kt)" stays one left-to-right unit */ g.save(); g.fillStyle=o.c||LRN.C.ink; g.font=(o.w||400)+" "+(o.s||12)+"px "+(o.m?LM:LF);
  g.textAlign=o.a||"center"; g.textBaseline=o.b||"middle"; g.direction=o.rtl?"rtl":"ltr"; if(o.al!=null) g.globalAlpha=o.al; g.fillText(s,x,y); g.restore(); }
function larrow(g,x1,y1,x2,y2,c,w,hd){ w=w||2; hd=hd||8; const a=Math.atan2(y2-y1,x2-x1), L=Math.hypot(x2-x1,y2-y1); if(L<2) return;
  g.save(); g.strokeStyle=c; g.fillStyle=c; g.lineWidth=w; g.lineCap="round";
  g.beginPath(); g.moveTo(x1,y1); g.lineTo(x2-Math.cos(a)*hd*0.6,y2-Math.sin(a)*hd*0.6); g.stroke();
  g.beginPath(); g.moveTo(x2,y2); g.lineTo(x2-hd*Math.cos(a-0.45),y2-hd*Math.sin(a-0.45)); g.lineTo(x2-hd*Math.cos(a+0.45),y2-hd*Math.sin(a+0.45)); g.closePath(); g.fill(); g.restore(); }
function lline(g,pts,c,w,dash,al){ if(pts.length<2) return; g.save(); g.strokeStyle=c; g.lineWidth=w||2; g.lineJoin="round"; g.lineCap="round"; if(dash) g.setLineDash(dash); if(al!=null) g.globalAlpha=al;
  g.beginPath(); pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])); g.stroke(); g.restore(); }
function ldot(g,x,y,r,c,al){ g.save(); g.fillStyle=c; if(al!=null) g.globalAlpha=al; g.beginPath(); g.arc(x,y,r,0,Math.PI*2); g.fill(); g.restore(); }
function lplot(g,r,xr,yr,o){
  o=o||{}; const C=LRN.C, ly=!!o.log;
  const fy=v=>ly?Math.log10(Math.max(v,1e-9)):v, y0=fy(yr[0]), y1=fy(yr[1]);
  const X=v=>r.x+(v-xr[0])/(xr[1]-xr[0])*r.w, Y=v=>r.y+r.h-(fy(v)-y0)/(y1-y0)*r.h;
  g.save(); g.strokeStyle=C.line; g.lineWidth=1; g.strokeRect(Math.round(r.x)+0.5,Math.round(r.y)+0.5,Math.round(r.w),Math.round(r.h));
  (o.xt||[]).forEach(t=>{ const x=X(t); g.beginPath(); g.moveTo(x,r.y+r.h); g.lineTo(x,r.y+r.h+4); g.stroke(); ltx(g,o.xf?o.xf(t):String(t),x,r.y+r.h+12,{c:C.muted,s:10,m:true}); });
  (o.yt||[]).forEach(t=>{ const y=Y(t); g.beginPath(); g.moveTo(r.x-4,y); g.lineTo(r.x,y); g.stroke(); ltx(g,o.yf?o.yf(t):String(t),r.x-6,y,{c:C.muted,s:10,m:true,a:"right"}); });
  if(o.xl) ltx(g,o.xl,r.x+r.w/2,r.y+r.h+25,{c:C.muted,s:11,rtl:!!o.xlr});
  if(o.yl) ltx(g,o.yl,r.x+2,r.y-9,{c:C.muted,s:11,a:"left",rtl:!!o.ylr});
  g.restore(); return {X,Y};
}
function lclip(g,r){ g.save(); g.beginPath(); g.rect(r.x,r.y,r.w,r.h); g.clip(); }
/* side view of an airliner, nose to the left, length 1 in local units; pitch in degrees (nose up positive) */
function lplane(g,cx,cy,s,pitch,C,o){
  o=o||{}; g.save(); g.translate(cx,cy); if(o.flip) g.scale(-1,1); g.rotate(pitch*D2R); g.scale(s,s); g.lineWidth=1.4/s;
  g.fillStyle=mixC(C.panel,C.struct,0.25); g.strokeStyle=C.muted;
  g.beginPath(); g.moveTo(-0.5,0.01); g.bezierCurveTo(-0.5,-0.05,-0.45,-0.06,-0.38,-0.06); g.lineTo(0.3,-0.055); g.lineTo(0.5,-0.035); g.lineTo(0.5,-0.015); g.lineTo(0.3,0.05); g.lineTo(-0.38,0.055); g.bezierCurveTo(-0.46,0.055,-0.5,0.04,-0.5,0.01); g.closePath(); g.fill(); g.stroke();
  g.fillStyle=mixC(C.panel,C.ctrl,0.55); g.beginPath(); g.moveTo(0.33,-0.05); g.lineTo(0.45,-0.22); g.lineTo(0.5,-0.22); g.lineTo(0.5,-0.03); g.closePath(); g.fill(); g.stroke();
  g.fillStyle=mixC(C.panel,C.struct,0.45); g.beginPath(); g.ellipse(0.44,-0.02,0.07,0.012,0,0,Math.PI*2); g.fill();
  g.fillStyle=mixC(C.panel,C.struct,0.6); g.beginPath(); g.ellipse(0.0,0.025,0.13,0.016,0.02,0,Math.PI*2); g.fill(); g.stroke();
  g.fillStyle=mixC(C.panel,C.struct,0.35); g.beginPath(); g.ellipse(-0.04,0.07,0.06,0.022,0,0,Math.PI*2); g.fill(); g.stroke();
  g.fillStyle=C.ink; for(let x=-0.36;x<0.26;x+=0.035){ g.globalAlpha=0.35; g.fillRect(x,-0.025,0.012,0.012); } g.globalAlpha=1;
  g.fillStyle=C.ink; g.beginPath(); g.moveTo(-0.47,-0.02); g.lineTo(-0.43,-0.04); g.lineTo(-0.41,-0.04); g.lineTo(-0.42,-0.018); g.closePath(); g.fill();
  if(o.marks) o.marks(g,s);
  g.restore();
}
