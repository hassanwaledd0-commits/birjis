/* ---------- flight deck, part 3: levers (gear, flaps, speedbrake), standby horizon, side-stick / yoke and thrust levers, soft-key chips ---------- */
/* static art of the lever column (landscape): bezel, slots, detents, labels; drawn into the cached panel */
function fdLevStatic(g,L){
  const v=L.lev; if(!v) return; const boe=L.boe, fs=Math.max(6,Math.round(v.w*0.17));
  g.fillStyle=boe?"#6f7478":"#11151a"; fdRR(g,v.x,v.y,v.w,v.h,4); g.fill(); g.strokeStyle=boe?"#454a4e":"#3a434c"; g.lineWidth=1; g.stroke();
  const gz=L.gz, fz=L.fz, sz=L.sz, slot=(x,y,w,h)=>{ g.fillStyle="#05070a"; fdRR(g,x,y,w,h,w/2); g.fill(); }, tc=boe?"#eceff0":"#aeb8c1";
  g.font="600 "+fs+"px "+FDF; g.textAlign="center"; g.textBaseline="middle"; g.fillStyle=tc; g.fillText("GEAR",gz.x+gz.w/2,gz.y+fs*0.7); g.fillText("FLAP",fz.x+fz.w/2,fz.y+fs*0.7); g.fillText("SPD",sz.x+sz.w/2,sz.y+fs*0.7);
  const sw=Math.max(3,v.w*0.1); slot(gz.x+gz.w*0.3-sw/2,gz.y+gz.h*0.26,sw,gz.h*0.56); slot(fz.x+fz.w/2-sw/2,fz.y+fz.h*0.22,sw,fz.h*0.72); slot(sz.x+sz.w/2-sw/2,sz.y+sz.h*0.22,sw,sz.h*0.72);
  g.strokeStyle=tc; g.lineWidth=0.8; g.beginPath(); const n=L.n>=4?5:5; for(let i=0;i<n;i++){ const y=fz.y+fz.h*0.22+fz.h*0.72*i/(n-1); g.moveTo(fz.x+fz.w*0.12,y); g.lineTo(fz.x+fz.w*0.3,y); } g.stroke();
}
/* standby horizon: a small round (Boeing) or square (Airbus) attitude indicator */
function fdStandby(g,r,s,info,boe){
  const cx=r.x+r.w/2, cy=r.y+r.h/2, R=r.w/2-2; g.save(); g.beginPath(); if(boe) g.arc(cx,cy,R,0,6.2832); else g.rect(cx-R,cy-R,2*R,2*R); g.clip(); g.translate(cx,cy); g.rotate(-info.bank*FDD); g.translate(0,info.pitch*R/26);
  g.fillStyle="#2c82d6"; g.fillRect(-R*3,-R*3,R*6,R*3); g.fillStyle="#8a5a2a"; g.fillRect(-R*3,0,R*6,R*3); g.fillStyle="#fff"; g.fillRect(-R*3,-0.6,R*6,1.2); g.restore();
  g.strokeStyle=boe?FDC.amb:FDC.amb; g.lineWidth=Math.max(1.4,R*0.09); g.beginPath(); g.moveTo(cx-R*0.62,cy); g.lineTo(cx-R*0.2,cy); g.moveTo(cx+R*0.62,cy); g.lineTo(cx+R*0.2,cy); g.stroke(); g.fillStyle=FDC.amb; g.fillRect(cx-1.2,cy-1.2,2.4,2.4);
  g.strokeStyle="#6d767f"; g.lineWidth=1.2; if(boe){ g.beginPath(); g.arc(cx,cy,R,0,6.2832); g.stroke(); } else g.strokeRect(cx-R,cy-R,2*R,2*R);
}
/* dynamic lever column: standby horizon, lever handles and gear lights */
function fdLevDyn(g,L,s,info){
  const v=L.lev; if(!v) return; const boe=L.boe, gz=L.gz, fz=L.fz, sz=L.sz, A=s.A; fdStandby(g,L.sb,s,info,boe);
  const knob=(x,y,r,lit)=>{ g.fillStyle=boe?"#16181a":"#d8dde2"; g.beginPath(); g.arc(x,y,r,0,6.2832); g.fill(); g.strokeStyle=boe?"#aab0b5":"#59626b"; g.lineWidth=1; g.stroke(); if(lit){ g.fillStyle=lit; g.beginPath(); g.arc(x,y,r*0.42,0,6.2832); g.fill(); } };
  const gx=gz.x+gz.w*0.3, gy0=gz.y+gz.h*0.26, gh=gz.h*0.56, gr=Math.max(3,gz.w*0.15); knob(gx,gy0+gh*fdC(s.gearT,0,1),gr,s.gearT>0.5?FDC.grn:null);
  const lc=s.gear>0.97?"#31f06c":(s.gear<0.03?"#2a3038":(s.ev.gearWarn?"#ff3d33":"#ff8a2a")), lr=Math.max(1.8,gz.w*0.07); g.fillStyle=lc; for(let i=0;i<3;i++){ g.beginPath(); g.arc(gz.x+gz.w*0.72,gy0+gh*(0.2+i*0.3),lr,0,6.2832); g.fill(); }
  const nf=A.flaps.length, fx=fz.x+fz.w/2, fy0=fz.y+fz.h*0.22, fh=fz.h*0.72; g.fillStyle=boe?"#16181a":"#d8dde2"; fdRR(g,fx-fz.w*0.3,fy0+fh*fdC(s.flapsT/(nf-1),0,1)-gr*0.7,fz.w*0.6,gr*1.4,3); g.fill(); g.strokeStyle=boe?"#aab0b5":"#59626b"; g.lineWidth=1; g.stroke();
  const sx=sz.x+sz.w/2, sy0=sz.y+sz.h*0.22, sh=sz.h*0.72; g.fillStyle=boe?"#16181a":"#d8dde2"; fdRR(g,sx-sz.w*0.3,sy0+sh*fdC(s.spoil,0,1)-gr*0.7,sz.w*0.6,gr*1.4,3); g.fill(); g.strokeStyle=s.spoil>0.5?FDC.amb:(boe?"#aab0b5":"#59626b"); g.lineWidth=1; g.stroke();
}
/* side-stick (Airbus) or control wheel and column (Boeing) drawn behind the touch pad, following the control input (and the autopilot on Boeing, whose yoke back-drives) */
function fdStick(g,r,s,boe,mirror,sc){
  /* (v36) the shapes are the shared artwork of x_stick_art.js (the same hand controls as the cockpit tab); here they follow the inputs */
  const ap=s.ap.on&&s.cmd.hasPit; let ir=s.inp.r, ip=s.inp.p; if(boe&&ap){ ir=fdC(ir+s.cmd.apRoll/s.A.pmax,-1,1); ip=fdC(ip+s.cmd.apNz*2.5,-1,1); }
  const bh=r.h*sc*1.16, bw=bh*250/280, x=r.x+(r.w-bw)/2, y=r.y+(r.h-bh)/2+r.h*0.04, rs=mirror?-1:1;
  skDraw(g,boe?"yoke":"side",x,y,bw,bh,{roll:ir*(boe?0.95:0.32)*rs,pitch:ip,mirror});
}
/* thrust levers: one per engine in a quadrant behind the throttle slider */
function fdThrust(g,t,s,boe){
  const n=s.A.n, x0=t.x+t.w*0.1, w=t.w*0.8, y0=t.y+t.h*0.1, h=t.h*0.8, l=fdC(s.lever,0,1), sw=Math.max(2.5,w/n*0.2);
  for(let i=0;i<n;i++){ const cx=x0+w*(i+0.5)/n; g.fillStyle="#05070a"; fdRR(g,cx-sw/2,y0,sw,h,sw/2); g.fill(); const ky=y0+h*(1-l), kw=Math.min(w/n*0.9,t.w*0.5), kh=Math.max(10,h*0.13); g.fillStyle=boe?"#17191b":"#262c33"; fdRR(g,cx-kw/2,ky-kh/2,kw,kh,3); g.fill(); g.strokeStyle=s.eng[i]?(boe?"#b4bbc0":"#7d8995"):FDC.amb; g.lineWidth=1.2; g.stroke(); g.fillStyle=boe?"#cfd4d7":"#aab4be"; g.fillRect(cx-kw*0.35,ky-1,kw*0.7,2); }
  if(s.lever<-0.05){ g.font="700 9px "+FDF; g.textAlign="center"; g.fillStyle=FDC.amb; g.fillText("REV",t.x+t.w/2,t.y+t.h-4); }
}
/* soft keys on the displays: ND range / mode, SD page; real DOM buttons so they are accessible */
function fdChip(k,r,txt,label,fs,right){
  const b=fdBtn(k,"fdc"); b.hidden=false; if(b.textContent!==txt) b.textContent=txt; b.setAttribute("aria-label",label); b.style.fontSize=fs+"px"; b.style.height=Math.round(fs+8)+"px"; b.style.top=Math.round(r.y)+"px";
  if(right){ b.style.left="auto"; b.style.right=Math.round(FD.lay.W-r.x)+"px"; } else { b.style.right="auto"; b.style.left=Math.round(r.x)+"px"; } return b;
}
function fdChips(L){
  const nd=L.enlR&&L.enlR.id==="nd"?L.enlR:L.d.nd, sd=L.enlR&&L.enlR.id==="sd"?L.enlR:L.d.sd, show=id=>!L.enlR||L.enlR.id===id;
  if(show("nd")){ const fs=Math.max(9,Math.min(13,Math.round(nd.w*0.075))), h=fs+8, y=nd.y+nd.h-h-3; fdChip("c:rng",{x:nd.x+3,y},FD_RNG[FD.rng]+" NM",fdT("rng"),fs); fdChip("c:mode",{x:nd.x+nd.w-3,y},FD.ndMode==="arc"?"ARC":"ROSE",fdT("mode"),fs,true); }
  if(show("sd")){ const fs=Math.max(9,Math.min(12,Math.round(sd.h*0.14+3))); fdChip("c:page",{x:sd.x+sd.w-3,y:sd.y+2},"PAGE \u203a",fdT("page"),fs,true); }
}
