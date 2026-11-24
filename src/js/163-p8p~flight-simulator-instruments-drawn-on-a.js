/* ---------- flight simulator instruments, drawn on a 2D canvas over the 3D view ----------
   A compact primary flight display (attitude, speed tape, altitude tape, heading tape, ILS), engine and configuration strip,
   autopilot mode line, warnings, and a north-up mini map. Instrument text is in English abbreviations, as on real displays. */
const FH={ sky:"#2f6fb8", gnd:"#7a5a2e", ink:"#f2f6fa", mag:"#ff5ad8", grn:"#4ef08a", amb:"#ffb62e", red:"#ff4a3a", cy:"#4fd8ff", panel:"rgba(8,14,22,0.72)" };
function fhText(g,s,x,y,sz,col,al,w){ g.font=(w||600)+" "+sz+"px 'IBM Plex Mono',ui-monospace,monospace"; g.textAlign=al||"center"; g.textBaseline="middle"; if(sz>=10){ g.lineJoin="round"; g.lineWidth=Math.max(2,sz*0.2); g.strokeStyle="rgba(0,8,16,0.6)"; g.strokeText(s,x,y); } g.fillStyle=col||FH.ink; g.fillText(s,x,y); }
function fhRound(g,x,y,w,h,r){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }

/* attitude indicator with pitch ladder, bank scale, flight-path vector and ILS needles */
function fhAttitude(g,cx,cy,R,info,ils,fpvOn){
  g.save(); g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.clip();
  const ppd=R/22, bank=info.bank*Math.PI/180;
  g.translate(cx,cy); g.rotate(-bank); g.translate(0,info.pitch*ppd);
  let sg=g.createLinearGradient(0,-R*2.2,0,0); sg.addColorStop(0,"#12468f"); sg.addColorStop(0.7,"#2f7fd0"); sg.addColorStop(1,"#79bff2"); g.fillStyle=sg; g.fillRect(-R*3,-R*4,R*6,R*4);
  sg=g.createLinearGradient(0,0,0,R*2.2); sg.addColorStop(0,"#9a7440"); sg.addColorStop(0.45,"#6f5128"); sg.addColorStop(1,"#3d2b14"); g.fillStyle=sg; g.fillRect(-R*3,0,R*6,R*4);
  g.strokeStyle="#fff"; g.lineWidth=Math.max(1.5,R/60); g.beginPath(); g.moveTo(-R*3,0); g.lineTo(R*3,0); g.stroke();
  for(let a=-30;a<=30;a+=5){ if(!a) continue; const y=-a*ppd, w=(a%10===0)?R*0.42:R*0.2; g.beginPath(); g.moveTo(-w,y); g.lineTo(w,y); g.stroke(); if(a%10===0){ fhText(g,String(Math.abs(a)),-w-R*0.12,y,R*0.13,"#fff"); fhText(g,String(Math.abs(a)),w+R*0.12,y,R*0.13,"#fff"); } }
  g.restore();
  g.save(); g.translate(cx,cy);
  g.strokeStyle="#fff"; g.lineWidth=Math.max(1.5,R/55);
  [-60,-45,-30,-20,-10,0,10,20,30,45,60].forEach(a=>{ const t=a*Math.PI/180, r0=R*0.92, r1=(a%30===0||Math.abs(a)===45)?R*0.8:R*0.85; g.beginPath(); g.moveTo(Math.sin(t)*r0,-Math.cos(t)*r0); g.lineTo(Math.sin(t)*r1,-Math.cos(t)*r1); g.stroke(); });
  g.save(); g.rotate(-bank); g.fillStyle=FH.amb; g.beginPath(); g.moveTo(0,-R*0.92); g.lineTo(-R*0.06,-R*0.8); g.lineTo(R*0.06,-R*0.8); g.closePath(); g.fill(); g.restore();
  /* fixed aircraft symbol */
  g.strokeStyle=FH.amb; g.lineWidth=Math.max(2.5,R/28); g.beginPath(); g.moveTo(-R*0.55,0); g.lineTo(-R*0.2,0); g.lineTo(-R*0.2,R*0.07); g.moveTo(R*0.55,0); g.lineTo(R*0.2,0); g.lineTo(R*0.2,R*0.07); g.stroke(); g.fillStyle=FH.amb; g.fillRect(-R*0.025,-R*0.025,R*0.05,R*0.05);
  if(fpvOn){ const dx=Math.max(-R*0.8,Math.min(R*0.8,((((info.track-info.hdg)+540)%360)-180)*R/22)), dy=Math.max(-R*0.8,Math.min(R*0.8,(info.pitch-info.gamma)*R/22));
    g.strokeStyle=FH.grn; g.lineWidth=Math.max(1.8,R/40); g.beginPath(); g.arc(dx,dy,R*0.07,0,Math.PI*2); g.moveTo(dx-R*0.15,dy); g.lineTo(dx-R*0.07,dy); g.moveTo(dx+R*0.07,dy); g.lineTo(dx+R*0.15,dy); g.moveTo(dx,dy-R*0.07); g.lineTo(dx,dy-R*0.14); g.stroke(); }
  if(ils&&ils.valid){ g.fillStyle=FH.mag; const lx=Math.max(-R*0.8,Math.min(R*0.8,-ils.loc/2.5*R*0.6)), gy=Math.max(-R*0.8,Math.min(R*0.8,ils.gs/0.7*R*0.3));
    g.strokeStyle="rgba(255,255,255,0.7)"; g.lineWidth=1; for(let i=-2;i<=2;i++){ if(!i) continue; g.beginPath(); g.arc(i*R*0.3,R*0.82,R*0.025,0,Math.PI*2); g.stroke(); g.beginPath(); g.arc(R*0.84,i*R*0.3,R*0.025,0,Math.PI*2); g.stroke(); }
    g.beginPath(); g.moveTo(lx,R*0.82-R*0.07); g.lineTo(lx+R*0.05,R*0.82); g.lineTo(lx,R*0.82+R*0.07); g.lineTo(lx-R*0.05,R*0.82); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(R*0.84-R*0.07,gy); g.lineTo(R*0.84,gy-R*0.05); g.lineTo(R*0.84+R*0.07,gy); g.lineTo(R*0.84,gy+R*0.05); g.closePath(); g.fill(); }
  g.restore();
  g.strokeStyle="rgba(255,255,255,0.55)"; g.lineWidth=2; g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.stroke();
}
/* vertical tape: value in the middle, step marks, a target bug; side "L" has labels on the right edge */
function fhTape(g,x,cy,w,h,val,step,span,fmt,target,side,col){
  g.save(); fhRound(g,x,cy-h/2,w,h,6); const pg=g.createLinearGradient(x,0,x+w,0); pg.addColorStop(0,"rgba(6,12,20,0.80)"); pg.addColorStop(1,"rgba(14,24,36,0.66)"); g.fillStyle=pg; g.fill(); g.strokeStyle="rgba(255,255,255,0.16)"; g.lineWidth=1; g.stroke(); g.clip();
  const pp=h/span; g.strokeStyle="#cfd8e0"; g.lineWidth=1.5; g.fillStyle="#cfd8e0";
  const v0=Math.floor((val-span/2)/step)*step; for(let v=v0;v<=val+span/2+step;v+=step){ const y=cy-(v-val)*pp, big=Math.round(v/step)%2===0; g.beginPath();
    if(side==="L"){ g.moveTo(x+w,y); g.lineTo(x+w-(big?w*0.28:w*0.16),y); } else { g.moveTo(x,y); g.lineTo(x+(big?w*0.28:w*0.16),y); } g.stroke();
    if(big&&fmt){ fhText(g,fmt(v),side==="L"?x+w*0.36:x+w*0.7,y,Math.max(10,w*0.2),"#e8eef4"); } }
  if(target!==null&&target!==undefined){ const y=Math.max(cy-h/2+6,Math.min(cy+h/2-6,cy-(target-val)*pp)); g.fillStyle=FH.cy; g.beginPath(); if(side==="L"){ g.moveTo(x+w,y); g.lineTo(x+w-w*0.22,y-w*0.12); g.lineTo(x+w-w*0.22,y+w*0.12); } else { g.moveTo(x,y); g.lineTo(x+w*0.22,y-w*0.12); g.lineTo(x+w*0.22,y+w*0.12); } g.closePath(); g.fill(); }
  g.restore();
  const bh=Math.max(20,w*0.34); fhRound(g,x-(side==="L"?0:w*0.04),cy-bh/2,w*1.04,bh,5); g.fillStyle="#05080c"; g.fill(); g.strokeStyle=col||FH.amb; g.lineWidth=2; g.stroke();
  fhText(g,fmt?fmt(Math.round(val)):String(Math.round(val)),x+w*0.52,cy,Math.max(12,w*0.28),col||FH.ink);
}
function fhHeading(g,cx,y,w,info,target){
  const h=Math.max(20,w*0.1); g.save(); fhRound(g,cx-w/2,y,w,h,5); g.fillStyle=FH.panel; g.fill(); g.clip();
  const pp=w/60, hd=info.hdg; g.strokeStyle="#cfd8e0"; g.lineWidth=1.5;
  for(let a=Math.floor(hd-30);a<=hd+30;a++){ if(a%5) continue; const x=cx+(a-hd)*pp, big=a%10===0; g.beginPath(); g.moveTo(x,y+h); g.lineTo(x,y+h-(big?h*0.38:h*0.22)); g.stroke(); if(big){ const n=((a%360)+360)%360, lab=n===0?"N":n===90?"E":n===180?"S":n===270?"W":String(n/10|0).padStart(2,"0"); fhText(g,lab,x,y+h*0.32,h*0.46,(n%90===0)?FH.amb:"#e8eef4"); } }
  if(target!==null&&target!==undefined){ const dd=((target-hd+540)%360)-180, x=cx+Math.max(-30,Math.min(30,dd))*pp; g.fillStyle=FH.cy; g.beginPath(); g.moveTo(x,y+h); g.lineTo(x-6,y+h-9); g.lineTo(x+6,y+h-9); g.closePath(); g.fill(); }
  g.restore(); g.strokeStyle=FH.amb; g.lineWidth=2; g.beginPath(); g.moveTo(cx,y+h+7); g.lineTo(cx-6,y+h+14); g.lineTo(cx+6,y+h+14); g.closePath(); g.stroke();
  fhText(g,String(Math.round(hd)%360).padStart(3,"0")+"°",cx,y+h+24,Math.max(12,h*0.55),FH.ink);
}
function fhPFD(g,W,H,k,info,s,ils,bm){
  const R=Math.max(52,Math.min(118,k)), cx=W/2, cy=H-R-(bm===undefined?Math.max(14,R*0.18):bm), tw=R*0.46, th=R*1.9;
  fhAttitude(g,cx,cy,R,info,ils,true);
  const A=s.A, sp=fphSpeeds(s), ap=s.ap;
  fhTape(g,cx-R-tw-R*0.1,cy,tw,th,info.ias,10,80,v=>v>=30?String(Math.round(v)):"",(ap.on?ap.spd:null),"L",info.ias>A.Vmo?FH.red:FH.ink);
  fhTape(g,cx+R+R*0.1,cy,tw,th,info.alt,100,800,v=>String(Math.round(v)),ap.on?ap.alt:null,"R",FH.ink);
  /* speed marks: stall speed, rotate / approach reference */
  const sw=info.ias; g.save(); g.beginPath(); g.rect(cx-R-tw-R*0.1,cy-th/2,tw,th); g.clip(); const pp=th/80;
  const mark=(v,c,w,lab)=>{ const y=cy-(v-sw)*pp; g.fillStyle=c; g.fillRect(cx-R-R*0.1-w,y-2,w,4); if(lab) fhText(g,lab,cx-R-R*0.1-w-6,y,10,c,"right"); };
  mark(sp.vs1g,FH.red,tw*0.5,""); g.fillStyle="rgba(255,60,50,0.55)"; g.fillRect(cx-R-R*0.1-tw*0.12,cy-(sp.vs1g-sw)*pp,tw*0.12,th);
  if(s.ground||s.last.agl<20*0.3048*10) mark(sp.vr,FH.grn,tw*0.4,"R"); if(s.gear>0.5&&s.flaps>=2) mark(sp.vref,FH.cy,tw*0.4,"REF"); g.restore();
  fhText(g,"M"+info.mach.toFixed(2).replace(/^0/,""),cx-R-tw*0.6,cy+th/2+12,Math.max(11,R*0.14),FH.ink);
  fhText(g,"GS "+Math.round(info.gs),cx-R-tw*0.6,cy+th/2+12+Math.max(13,R*0.16),Math.max(10,R*0.12),"#aeb9c4");
  /* vertical speed and radio altitude beside the altitude tape */
  const vsC=Math.abs(info.vs)>2000?FH.amb:FH.grn; fhText(g,(info.vs>=0?"+":"")+Math.round(info.vs/50)*50,cx+R+tw+R*0.2,cy,Math.max(11,R*0.14),vsC,"left");
  if(info.agl<2500&&!s.ground) fhText(g,"RA "+Math.round(info.agl),cx+R+R*0.1+tw*0.5,cy+th/2+12,Math.max(11,R*0.14),info.agl<400?FH.amb:FH.grn);
  fhHeading(g,cx,cy-R-Math.max(34,R*0.46),R*1.6,info,ap.on||ap.lat?ap.hdg:null);
  /* flight mode annunciator */
  const fma=[ap.on&&ap.athr?"A/THR":"MAN THR",ap.on?(ap.lat==="LOC"?"LOC":"HDG"):"—",ap.on?(ap.vert==="GS"?"G/S":ap.vert==="VS"?"V/S":"ALT"):"—",ap.on?"AP":"AP OFF"];
  const fw=R*0.52, fy=cy-R-Math.max(34,R*0.46)-Math.max(20,R*0.2);
  fma.forEach((t,i)=>fhText(g,t,cx-fw*1.5+i*fw,fy,Math.max(10,R*0.13),(i===3&&!ap.on)?FH.amb:FH.grn));
}
/* engines, flaps, gear, brakes, spoilers */
function fhStrip(g,x,y,sz,s,info,rows){
  rows=rows||6;
  const A=s.A, bw=sz*0.34, bh=sz*2.2; g.save(); g.translate(x,y);
  fhRound(g,-sz*0.4,-sz*0.8,bw*A.n*1.35+sz*0.9,bh+sz*2.6,6); g.fillStyle=FH.panel; g.fill();
  fhText(g,"N1",bw*A.n*0.7,-sz*0.35,sz*0.7,"#9fb0c0");
  for(let i=0;i<A.n;i++){ const d=typeof feDisp==="function"?feDisp(s,i):null, n=d?d.n1/100:s.n1[i], bx=i*bw*1.35, c=d?(d.st==="run"?FH.grn:d.st==="start"?FH.amb:d.st==="fail"?FH.red:"#6c7a88"):(s.eng[i]?FH.grn:FH.red); g.strokeStyle="#586673"; g.lineWidth=1.5; g.strokeRect(bx,0,bw,bh); g.fillStyle=c; g.fillRect(bx,bh*(1-Math.max(0.02,n)),bw,bh*Math.max(0.02,n)); fhText(g,(d?d.st!=="fail":s.eng[i])?String(Math.round(n*100)):"X",bx+bw/2,bh+sz*0.6,sz*0.6,c); }
  g.restore();
  const bx=x+bw*A.n*1.35+sz*1.1; g.save(); g.translate(bx,y);
  fhRound(g,-sz*0.3,-sz*0.8,sz*5.6,Math.min(bh+sz*2.6,sz*(rows*0.95+0.9)),6); g.fillStyle=FH.panel; g.fill();
  const row=(lab,val,col,i)=>{ fhText(g,lab,0,i*sz*0.95,sz*0.62,"#9fb0c0","left"); fhText(g,val,sz*5.2,i*sz*0.95,sz*0.72,col,"right"); };
  row("FLAPS",A.flaps[Math.round(s.flaps)]+(Math.abs(s.flaps-Math.round(s.flaps))>0.05?"~":""),FH.grn,0);
  row("GEAR",s.gear>0.97?"DOWN":s.gear<0.03?"UP":"…",s.gear>0.97?FH.grn:s.gear<0.03?FH.ink:FH.amb,1);
  row("SPOIL",s.spoil>0.5?"OUT":"RET",s.spoil>0.5?FH.amb:FH.ink,2); row("BRAKE",Math.max(s.brake,s.autobrake)>0.05?"ON":"OFF",Math.max(s.brake,s.autobrake)>0.05?FH.amb:FH.ink,3);
  if(rows>4) row("AOA",info.aoa.toFixed(1)+"°",info.aoa>((A.CLmax[0]-A.CL0[0])/A.CLa*180/Math.PI)-3?FH.red:FH.ink,4); if(rows>5) row("G",info.nz.toFixed(2),FH.ink,5);
  g.restore();
}
/* warnings in the middle of the view */
function fhWarn(g,W,H,s,info,t){
  const w=[]; const ev=s.ev;
  if(ev.stall&&!s.ground) w.push(["STALL",FH.red]); if(ev.floor) w.push(["ALPHA FLOOR",FH.amb]); if(ev.overspeed) w.push(["OVERSPEED",FH.red]); if(ev.flapWarn) w.push(["FLAPS OVERSPEED",FH.amb]);
  if(info.agl<1000&&info.vs<-1800&&!s.ground) w.push(["SINK RATE",FH.amb]); if(info.agl<300&&info.vs<-2500&&!s.ground) w.push(["PULL UP",FH.red]);
  if(ev.gearWarn) w.push(["GEAR!",FH.red]); if(ev.tail) w.push(["TAIL STRIKE",FH.red]);
  try{ if(typeof feFuelWarns==="function") feFuelWarns(w,FH); }catch(e){}   /* fe: LOW FUEL / FUEL CRITICAL */
  if(info.agl<50&&!s.ground&&s.gear>0.85&&s.flaps>=2){ if(info.agl<10) w.push(["TEN",FH.grn]); else if(info.agl<20) w.push(["TWENTY",FH.grn]); else w.push(["FIFTY",FH.grn]); }
  w.slice(0,3).forEach(([txt,c],i)=>{ if(c===FH.red&&Math.floor(t*3)%2===0) return; fhText(g,txt,W/2,H*0.3+i*34,Math.max(18,Math.min(30,W*0.04)),c,"center",800); });
}
/* north-up mini map: runway, extended centre line, aircraft and its track; range cycles with a tap */
function fhMap(g,x,y,sz,s,info,range){
  g.save(); fhRound(g,x,y,sz,sz,10); g.fillStyle="rgba(8,18,14,0.78)"; g.fill(); g.clip(); g.translate(x+sz/2,y+sz/2);
  const k=sz/2/(range*1000), px=wx=>(wx-s.p.x)*k, pz=wz=>(wz-s.p.z)*k;
  /* sea (east of the coast line), apron, terminal, taxiway and the downtown block */
  if(typeof fkMapDraw==="function") fkMapDraw(g,px,pz,k,range,s); else { const cz=z=>9000+1500*Math.sin(z/2600)+700*Math.sin(z/900+1), z0=s.p.z-range*1000*1.2, z1=s.p.z+range*1000*1.2, st=Math.max(60,(z1-z0)/48); g.fillStyle="rgba(40,110,150,0.55)"; g.beginPath(); g.moveTo(px(cz(z0)),pz(z0)); for(let z=z0;z<=z1;z+=st) g.lineTo(px(cz(z)),pz(z)); g.lineTo(px(cz(z1)),pz(z1)); g.lineTo(px(1e5),pz(z1)); g.lineTo(px(1e5),pz(z0)); g.closePath(); g.fill();
    g.fillStyle="rgba(150,140,120,0.5)"; g.fillRect(px(255),pz(-1900),515*k,1200*k); g.fillStyle="rgba(190,190,200,0.7)"; g.fillRect(px(800),pz(-1530),70*k,840*k); g.fillStyle="rgba(150,150,160,0.8)"; g.fillRect(px(180)-Math.max(0.8,11*k),pz(-3700),Math.max(1.6,22*k),3800*k);
    g.fillStyle="rgba(190,170,130,0.35)"; g.beginPath(); g.arc(px(4300),pz(-3000),2000*k,0,7); g.fill(); }
  if(typeof faMapDraw==="function") faMapDraw(g,px,pz,k,range,s);   /* fa: the route and the destination on the mini map */
  if(typeof ftMapDraw==="function") try{ ftMapDraw(g,px,pz,k,range,s); }catch(e){}   /* ft: other aircraft */
  g.strokeStyle="rgba(120,160,140,0.35)"; g.lineWidth=1; for(let r=1;r<=2;r++){ g.beginPath(); g.arc(0,0,sz/2*r/2,0,Math.PI*2); g.stroke(); }
  g.strokeStyle="#7dd3a0"; g.setLineDash([4,5]); g.beginPath(); g.moveTo(px(0),pz(0)); g.lineTo(px(0),pz(30000)); g.stroke(); g.setLineDash([]);
  g.fillStyle="#cfd8de"; g.save(); g.translate(px(0),pz(-FPH_RWY.len/2)); g.fillRect(-Math.max(1.5,FPH_RWY.width/2*k),-FPH_RWY.len/2*k,Math.max(3,FPH_RWY.width*k),FPH_RWY.len*k); g.restore();
  g.strokeStyle=FH.grn; g.lineWidth=1.5; const tr=info.track*Math.PI/180, L=Math.min(sz*0.45,info.gs*0.51*60*k); g.beginPath(); g.moveTo(0,0); g.lineTo(Math.sin(tr)*L,-Math.cos(tr)*L); g.stroke();
  g.rotate(info.hdg*Math.PI/180); g.fillStyle=FH.amb; g.beginPath(); g.moveTo(0,-8); g.lineTo(6,7); g.lineTo(0,3); g.lineTo(-6,7); g.closePath(); g.fill(); g.restore();
  fhText(g,range+" km",x+sz-8,y+sz-10,11,"#9fc8b0","right");
}
