/* ---------- flight deck displays, part 1: PFD (Airbus and Boeing styles) and ND ----------
   Every display is drawn into a 100-unit-wide logical box (the caller scales the canvas), so layout code is resolution independent. */
const FDF="'IBM Plex Mono','DejaVu Sans Mono',ui-monospace,Menlo,Consolas,monospace";
const FDC={grn:"#31f06c",cy:"#37d8ff",mag:"#ff55e0",amb:"#ffb224",red:"#ff3d33",wht:"#f3f6f9",gry:"#8d98a4",dim:"#4a525b",blk:"#000"};
const FDD=Math.PI/180, FD_SKY=[0,"#0b57b0",1,"#52a6ea"], FD_GND=[0,"#8a5a2a",1,"#4a2f14"], FD_SKYB=[0,"#1363c4",1,"#62b2f0"], FD_GNDB=[0,"#93622f",1,"#503317"];
function fdTx(g,s,x,y,sz,col,al,w,mw){ if(sz<FD.mu) sz=FD.mu; g.font=(w||600)+" "+sz+"px "+FDF; g.textAlign=al||"center"; g.textBaseline="middle"; g.fillStyle=col||FDC.wht; if(mw) g.fillText(s,x,y,mw); else g.fillText(s,x,y); }
function fdLn(g,x1,y1,x2,y2,col,w){ g.strokeStyle=col; g.lineWidth=w||0.6; g.beginPath(); g.moveTo(x1,y1); g.lineTo(x2,y2); g.stroke(); }
function fdRR(g,x,y,w,h,r){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
function fdG(g,k,x0,y0,x1,y1,st){ const c=g.__fdg||(g.__fdg={}); let o=c[k]; if(!o){ o=g.createLinearGradient(x0,y0,x1,y1); for(let i=0;i<st.length;i+=2) o.addColorStop(st[i],st[i+1]); c[k]=o; } return o; }
const fdC=(v,a,b)=>v<a?a:v>b?b:v, fdP3=n=>String(Math.round(n)).padStart(3,"0");
/* airspeed trend (kt in 10 s), smoothed: the sim exposes no acceleration, so it is derived from the indicated speed */
function fdTrend(info,ts){ const st=FD.st; if(ts-st.t>=100){ const dt=(ts-st.t)/1000; if(st.t>0&&dt<1) st.tr+=((info.ias-st.ias)/dt*10-st.tr)*0.25; st.ias=info.ias; st.t=ts; } return fdC(st.tr,-30,30); }

/* attitude: horizon, pitch ladder, clipped to a window; (cx,cy) is the aircraft symbol centre, ppd = units per degree */
function fdAtt(g,x0,y0,x1,y1,cx,cy,ppd,info,boe){
  g.save(); g.beginPath(); g.rect(x0,y0,x1-x0,y1-y0); g.clip(); g.translate(cx,cy); g.rotate(-info.bank*FDD); g.translate(0,info.pitch*ppd);
  g.fillStyle=fdG(g,boe?"sb":"sa",0,-70,0,0,boe?FD_SKYB:FD_SKY); g.fillRect(-160,-160,320,160); g.fillStyle=fdG(g,boe?"gb":"ga",0,0,0,70,boe?FD_GNDB:FD_GND); g.fillRect(-160,0,320,160);
  g.strokeStyle="#fff"; g.lineWidth=0.55; g.beginPath(); g.moveTo(-160,0); g.lineTo(160,0); g.stroke();
  g.lineWidth=0.5; g.beginPath(); for(let a=-30;a<=30;a+=2.5){ if(!a) continue; const y=-a*ppd, m=a%10===0?9:a%5===0?5.5:2.8; g.moveTo(-m,y); g.lineTo(m,y); } g.stroke();
  for(let a=-30;a<=30;a+=10){ if(!a) continue; const y=-a*ppd, t=String(Math.abs(a)); fdTx(g,t,-12.5,y,4.6,"#fff"); fdTx(g,t,12.5,y,4.6,"#fff"); }
  g.restore();
}
/* roll scale: fixed ticks on an arc plus a pointer that follows the bank */
function fdRoll(g,cx,cy,r,bank,col,boe){
  g.save(); g.translate(cx,cy); g.strokeStyle="#fff"; g.lineWidth=0.5; g.beginPath(); g.arc(0,0,r,-Math.PI/2-1.05,-Math.PI/2+1.05); g.stroke();
  g.beginPath(); for(let i=0;i<11;i++){ const a=FD_RT[i]*FDD, l=(i===0||i===10||i===3||i===7)?3.2:1.8, s=Math.sin(a), c=Math.cos(a); g.moveTo(s*r,-c*r); g.lineTo(s*(r+l),-c*(r+l)); } g.stroke();
  g.fillStyle=col; g.beginPath(); g.moveTo(0,-r); g.lineTo(-1.8,-r+3.2); g.lineTo(1.8,-r+3.2); g.closePath(); g.fill();   /* fixed index */
  g.rotate(-bank*FDD); g.strokeStyle=col; g.lineWidth=0.7; g.beginPath(); g.moveTo(0,-r-0.4); g.lineTo(-2.2,-r-3.6); g.lineTo(2.2,-r-3.6); g.closePath(); if(boe){ g.fillStyle="#fff"; g.fill(); } else g.stroke();
  g.restore();
}
const FD_RT=[-60,-45,-30,-20,-10,0,10,20,30,45,60];
/* compass arc at the bottom of a PFD: current heading under the lubber line, selected heading bug, track diamond */
function fdHdgArc(g,cx,cy,r,info,ap,boe){
  g.save(); g.beginPath(); g.rect(cx-30,cy-r-1,60,r+2); g.clip();
  const hd=info.hdg; g.strokeStyle="#cfd6dc"; g.lineWidth=0.5; g.beginPath(); g.arc(cx,cy,r,-Math.PI/2-0.8,-Math.PI/2+0.8); g.stroke();
  for(let a=Math.floor((hd-48)/5)*5;a<=hd+48;a+=5){ const t=(a-hd)*FDD, s=Math.sin(t), c=Math.cos(t), big=a%10===0; g.beginPath(); g.moveTo(cx+s*r,cy-c*r); g.lineTo(cx+s*(r-(big?2.8:1.6)),cy-c*(r-(big?2.8:1.6))); g.stroke();
    if(big){ const n=((a%360)+360)%360; fdTx(g,String(n/10|0).padStart(2,"0"),cx+s*(r-6),cy-c*(r-6),4.4,"#e6ecf1"); } }
  const dd=((ap.hdg-hd+540)%360)-180; if(Math.abs(dd)<47){ const t=dd*FDD; g.save(); g.translate(cx+Math.sin(t)*r,cy-Math.cos(t)*r); g.rotate(t); g.fillStyle=boe?FDC.mag:FDC.cy; g.fillRect(-1.6,-1.3,3.2,2.6); g.restore(); }
  const tk=((info.track-hd+540)%360)-180; if(Math.abs(tk)<47&&info.gs>40){ const t=tk*FDD; g.save(); g.translate(cx+Math.sin(t)*(r-0.5),cy-Math.cos(t)*(r-0.5)); g.rotate(t); g.strokeStyle=FDC.grn; g.lineWidth=0.7; g.beginPath(); g.moveTo(0,-2); g.lineTo(2,0); g.lineTo(0,2); g.lineTo(-2,0); g.closePath(); g.stroke(); g.restore(); }
  g.restore(); g.fillStyle=boe?"#fff":FDC.amb; g.beginPath(); g.moveTo(cx,cy-r-0.6); g.lineTo(cx-1.8,cy-r-4); g.lineTo(cx+1.8,cy-r-4); g.closePath(); g.fill();
}
/* ILS localizer (bottom) and glide-slope (right) deviation scales with a magenta diamond */
function fdIls(g,ils,cx,cy,sx,col){
  g.strokeStyle="rgba(255,255,255,0.8)"; g.lineWidth=0.5; for(let i=-2;i<=2;i++){ if(!i) continue; g.beginPath(); g.arc(cx+i*7,cy+30,0.9,0,7); g.stroke(); g.beginPath(); g.arc(sx,cy+i*7,0.9,0,7); g.stroke(); }
  fdLn(g,cx,cy+28.5,cx,cy+31.5,"#fff",0.5); fdLn(g,sx-1.5,cy,sx+1.5,cy,"#fff",0.5);
  const lx=cx+fdC(-ils.loc/2.5*14,-17,17), gy=cy+fdC(ils.gs/0.7*7,-17,17); g.fillStyle=col;
  g.beginPath(); g.moveTo(lx-2.6,cy+30); g.lineTo(lx,cy+27.4); g.lineTo(lx+2.6,cy+30); g.lineTo(lx,cy+32.6); g.closePath(); g.fill(); g.beginPath(); g.moveTo(sx-2.6,gy); g.lineTo(sx,gy-2.6); g.lineTo(sx+2.6,gy); g.lineTo(sx,gy+2.6); g.closePath(); g.fill();
}
/* flight-director cues: roll error from the heading/localizer target, pitch error from the vertical target */
function fdFdCue(info,s,ils){
  const ap=s.ap, ok=ils&&ils.valid; let tb, vs;
  if(ap.lat==="LOC"&&ok) tb=fdC(-ils.loc*6,-25,25); else tb=fdC((((ap.hdg-info.hdg)+540)%360-180)*1.2,-25,25);
  if(ap.vert==="GS"&&ok) vs=-700-ils.gs*1500; else if(ap.vert==="VS") vs=ap.vs; else vs=fdC((ap.alt-info.alt)*0.6,-2500,2500);
  const gm=Math.atan2(vs*0.00508,Math.max(30,info.tas*0.5144))/FDD;
  return {r:fdC((tb-info.bank)*0.5,-14,14), p:fdC(gm-info.gamma,-12,12)};
}
/* mode annunciations shared by both families: [thrust, vertical, lateral, approach, status] */
function fdModes(s,info,boe){
  const ap=s.ap, a=[]; const lat=s.ground&&s.lever>0.5?(boe?"TO/GA":"RWY"):ap.on?(ap.lat==="LOC"?(boe?"VOR/LOC":"LOC"):(boe?"HDG SEL":"HDG")):"";
  const vdiff=ap.alt-info.alt, ver=s.ground&&s.lever>0.5?(boe?"TO/GA":"SRS"):ap.on?(ap.vert==="GS"?(boe?"G/S":"G/S"):ap.vert==="VS"?(boe?"V/S":"V/S "+(ap.vs>=0?"+":"")+ap.vs):(Math.abs(vdiff)<120?(boe?"ALT HLD":"ALT"):(boe?"LVL CHG":(vdiff>0?"OP CLB":"OP DES")))):"";
  const thr=boe?(ap.athr?(ap.on&&Math.abs(vdiff)>=120?"N1":"MCP SPD"):(s.lever>0.92?"TO/GA":"")):(ap.athr?"SPEED":(s.lever>0.92?"MAN TOGA":"MAN THR"));
  return [thr,ver,lat];
}
