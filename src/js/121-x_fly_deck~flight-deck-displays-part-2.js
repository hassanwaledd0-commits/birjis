/* ---------- flight deck displays, part 2: engine/warning display and system pages (Airbus E/WD + SD, Boeing EICAS upper + lower) ---------- */
const FD_PAGES={airbus:["WHEEL","F/CTL","ENG","HYD","FUEL"],boeing:["GEAR","FLT","ENG","HYD","FUEL"]};
/* derived engine parameters (the sim models N1 only): N2, EGT, fuel flow, oil, vibration; refreshed once per display render */
function fdEngCalc(s){
  const E=FD.e, A=s.A, n=A.n, kf=n>=4?2.4:0.85; if(!E.st) E.st=[]; for(let i=0;i<n;i++){ const v=s.n1[i], on=s.eng[i], d=typeof feDisp==="function"?feDisp(s,i):null;
    if(d){ E.st[i]=d.st; E.n1[i]=d.n1; E.n2[i]=d.n2; E.egt[i]=d.egt; E.ff[i]=d.ff; E.oilp[i]=d.oilp; E.oilt[i]=d.oilt; E.vib[i]=d.vib; continue; } E.st[i]=on?"run":"fail";
    E.n1[i]=v*100; E.n2[i]=on?58+42*Math.pow(Math.max(0,v),0.8):Math.max(3,v*45); E.egt[i]=on?340+520*Math.pow(Math.max(0,v),1.5):90+60*v;
    E.ff[i]=on?700+(A.Tmax/n)*Math.pow(Math.max(0,v),1.7)*A.sfc*3600*kf:0; E.oilp[i]=on?42+26*v:2; E.oilt[i]=on?62+48*v:30; E.vib[i]=on?0.2+0.5*v:0; }
}
/* round gauge: 270 degrees, needle, red zone from lim (0..1) */
function fdDial(g,cx,cy,r,v,col,lim,boe){
  const a0=2.356, sw=4.712; g.strokeStyle=boe?"#8a939c":"#626b74"; g.lineWidth=0.8; g.beginPath(); g.arc(cx,cy,r,a0,a0+sw); g.stroke();
  if(lim<1){ g.strokeStyle=FDC.red; g.lineWidth=1.4; g.beginPath(); g.arc(cx,cy,r,a0+sw*lim,a0+sw); g.stroke(); }
  const a=a0+sw*fdC(v,0,1), c=Math.cos(a), s=Math.sin(a); g.strokeStyle=col; g.lineWidth=1.1; g.beginPath(); g.moveTo(cx+c*r*0.25,cy+s*r*0.25); g.lineTo(cx+c*r*1.04,cy+s*r*1.04); g.stroke();
}
/* messages: warnings first (red / amber), then memo lines in green */
function fdMsgs(s,info){
  const m=FD.mt, c=FD.mc, ev=s.ev, A=s.A; m.length=0; c.length=0; const add=(t,col)=>{ m.push(t); c.push(col); };
  if(ev.stall&&!s.ground) add("STALL STALL",FDC.red); if(ev.overspeed) add("OVERSPEED",FDC.red); if(ev.gearWarn) add("L/G GEAR NOT DOWN",FDC.red); if(ev.tail) add("TAIL STRIKE",FDC.red);
  if(info.agl<1000&&info.vs<-1800&&!s.ground) add("SINK RATE",FDC.amb); if(ev.floor) add("ALPHA FLOOR",FDC.amb); if(ev.flapWarn) add("FLAPS OVERSPEED",FDC.amb);
  for(let i=0;i<A.n;i++){ const d=typeof feDisp==="function"?feDisp(s,i):null; if(d?d.st==="fail":!s.eng[i]) add("ENG "+(i+1)+" FAIL",FDC.amb); else if(d&&d.st==="start") add("ENG "+(i+1)+" START",FDC.grn); }
  if(s.ground&&s.parkBrake) add("PARK BRK",FDC.grn); else if(s.ground&&info.ias<40&&s.lever<0.3) add(fdT("memoTo"),FDC.grn);
  if(s.ground&&s.lever>0.4&&info.ias<150) add(s.flaps>=0.9&&s.spoil<0.1?"T.O. CONFIG OK":"T.O. CONFIG CHECK",s.flaps>=0.9&&s.spoil<0.1?FDC.grn:FDC.amb);
  if(!s.ground&&s.gear>0.9&&info.agl<2500) add("LDG GEAR DN",FDC.grn); if(!s.ground&&s.spoil>0.5) add("SPEED BRK",FDC.amb); if(s.autobrake>0.05) add("AUTO BRK",FDC.grn);
}
/* ---------- E/WD (Airbus) and upper EICAS (Boeing); box is 100 wide, h tall ---------- */
function fdEwd(g,h,s,info,boe,ts){
  const E=FD.e, A=s.A, n=A.n; fdEngCalc(s); g.fillStyle="#000"; g.fillRect(0,0,100,h);
  const gw=boe?(n>2?60:54):62, c0=boe?(n>2?4:6):10, cw=(gw-c0)/n, r=Math.min(cw*0.36,h*(boe?0.24:0.22)), cy=boe?h*0.5:h*0.3;
  if(!boe){ fdTx(g,"N1",5,cy,4.4,FDC.cy,"center"); fdTx(g,"%",5,cy+4.5,3.8,FDC.cy); fdTx(g,"EGT",5,h*0.6,4.2,FDC.cy); fdTx(g,"°C",5,h*0.6+4.2,3.6,FDC.cy); fdTx(g,"F.F",5,h*0.83,4.2,FDC.cy); fdTx(g,"T/H",5,h*0.83+4,3.4,FDC.cy); }
  for(let i=0;i<n;i++){ const x=c0+cw*(i+0.5), st=E.st[i], on=st!=="fail", col=st==="run"?FDC.grn:st==="fail"?FDC.amb:st==="start"?FDC.wht:FDC.gry, n1=E.n1[i];
    if(!boe){ fdDial(g,x,cy,r,n1/110,col,100/110,false); fdTx(g,on?(n>2?String(Math.round(n1)):n1.toFixed(1)):"XX",x,h*0.5,Math.min(5.6,cw*0.4),col); const eg=E.egt[i]; fdTx(g,on?String(Math.round(eg)):"XX",x,h*0.62,Math.min(5.6,cw*0.4),eg>870?FDC.red:col); fdTx(g,on?(E.ff[i]/1000).toFixed(1):"XX",x,h*0.83,Math.min(5.4,cw*0.38),col);
      const ex=Math.round(E.egt[i])/1000; g.fillStyle="#2b3239"; g.fillRect(x-cw*0.36,h*0.69,cw*0.72,1.4); g.fillStyle=col; g.fillRect(x-cw*0.36,h*0.69,cw*0.72*fdC(ex,0,1),1.4); }
    else { g.fillStyle="#000"; g.fillRect(x-cw*0.4,h*0.04,cw*0.8,h*0.17); g.strokeStyle="#cfd6dc"; g.lineWidth=0.5; g.strokeRect(x-cw*0.4,h*0.04,cw*0.8,h*0.17); fdTx(g,on?(n>2?String(Math.round(n1)):n1.toFixed(1)):"0.0",x,h*0.125,Math.min(5.6,cw*0.36),"#fff");
      fdDial(g,x,cy+h*0.02,r,n1/110,"#fff",100/110,true); const rf=s.lever*100; g.strokeStyle=FDC.grn; g.lineWidth=0.8; { const a=2.356+4.712*fdC(rf/110,0,1); g.beginPath(); g.moveTo(x+Math.cos(a)*r*0.92,cy+h*0.02+Math.sin(a)*r*0.92); g.lineTo(x+Math.cos(a)*r*1.18,cy+h*0.02+Math.sin(a)*r*1.18); g.stroke(); }
      const eg=E.egt[i]; fdTx(g,"EGT",x,h*0.79,3.4,"#aeb8c1"); fdTx(g,on?String(Math.round(eg)):"0",x,h*0.9,Math.min(5.4,cw*0.34),eg>870?FDC.red:"#fff"); g.fillStyle="#2b3239"; g.fillRect(x-cw*0.34,h*0.69,cw*0.68,1.4); g.fillStyle=eg>870?FDC.red:"#fff"; g.fillRect(x-cw*0.34,h*0.69,cw*0.68*fdC(eg/1000,0,1),1.4); }
  }
  if(boe){ fdTx(g,"N1",gw*0.5+1,h*0.04,3.8,"#aeb8c1"); }
  /* right side: configuration and messages */
  const mx=boe?66:66; g.strokeStyle=FDC.dim; g.lineWidth=0.4; g.beginPath(); g.moveTo(mx-2,2); g.lineTo(mx-2,h-2); g.stroke();
  fdTx(g,"FLAPS",mx,5,4.4,boe?"#aeb8c1":FDC.cy,"left"); fdTx(g,A.flaps[Math.round(s.flaps)]+(Math.abs(s.flaps-Math.round(s.flaps))>0.05?"~":""),mx+15,5,5,FDC.grn,"left");
  fdTx(g,"GEAR",mx,10.6,4.4,boe?"#aeb8c1":FDC.cy,"left"); fdTx(g,s.gear>0.97?"DOWN":s.gear<0.03?"UP":"TRANSIT",mx+15,10.6,5,s.gear>0.97?FDC.grn:s.gear<0.03?"#fff":FDC.amb,"left");
  if(typeof feFuelFob==="function"){ const fb=feFuelFob(s); fdTx(g,"FOB",mx,16.2,4.4,boe?"#aeb8c1":FDC.cy,"left"); fdTx(g,fb.txt,mx+15,16.2,4.8,fb.col,"left"); }
  fdMsgs(s,info); const M=FD.mt, C=FD.mc, mh=Math.floor((h-19)/5.4); for(let i=0;i<M.length&&i<mh;i++){ if(C[i]===FDC.red&&Math.floor(ts/350)%2) continue; fdTx(g,M[i],mx,22+i*5.4,4.5,C[i],"left",600,100-mx-1); }
}
/* ---------- SD (Airbus) and lower EICAS (Boeing): four pages ---------- */
function fdSdRow(g,y,lab,col,vals,n,x0,x1,fmt,boe){ fdTx(g,lab,x0-1,y,3.9,boe?"#aeb8c1":FDC.cy,"right"); for(let i=0;i<n;i++){ const x=x0+(x1-x0)*(i+0.5)/n; fdTx(g,fmt(vals[i]),x,y,Math.min(5.2,(x1-x0)/n*0.4),col); } }
function fdSd(g,h,s,info,boe,page,ts){
  const A=s.A, n=A.n, E=FD.e; fdEngCalc(s); g.fillStyle="#000"; g.fillRect(0,0,100,h); const pg=FD_PAGES[boe?"boeing":"airbus"][page%5];
  fdTx(g,pg,3,4.2,5.4,"#fff","left"); fdLn(g,3,7,3+pg.length*3.4,7,"#fff",0.5); 
  if(pg==="WHEEL"||pg==="GEAR"){
    const L=n===2?[[50,0.32],[38,0.74],[62,0.74]]:[[50,0.3],[35,0.58],[65,0.58],[44,0.84],[56,0.84]], gd=s.gear, col=gd>0.97?FDC.grn:gd<0.03?null:(s.ev.gearWarn?FDC.red:FDC.amb);
    for(let i=0;i<L.length;i++){ const x=L[i][0], y=h*L[i][1]; if(col){ g.strokeStyle=col; g.lineWidth=0.6; g.strokeRect(x-4.2,y-2.6,8.4,5.2); g.fillStyle=col; g.beginPath(); g.moveTo(x,y-1.8); g.lineTo(x+2.2,y+1.6); g.lineTo(x-2.2,y+1.6); g.closePath(); g.fill(); } else { fdTx(g,"UP",x,y,4.2,"#fff"); } }
    const bk=Math.max(s.brake,s.autobrake)>0.05; fdTx(g,"AUTO BRK",4,h*0.42,4,FDC.cy,"left"); fdTx(g,s.autobrake>0.05?"MAX":"OFF",4,h*0.62,4.6,s.autobrake>0.05?FDC.grn:"#fff","left");
    fdTx(g,"BRAKES",96,h*0.44,4,FDC.cy,"right"); fdTx(g,bk?"ON":"OFF",96,h*0.6,4.6,bk?FDC.amb:"#fff","right"); fdTx(g,"SPLR "+(s.spoil>0.5?"OUT":"RET"),96,h*0.76,4,s.spoil>0.5?FDC.amb:"#fff","right"); fdTx(g,"FLAP "+A.flaps[Math.round(s.flaps)],96,h*0.9,4,FDC.grn,"right");
  } else if(pg==="F/CTL"||pg==="FLT"){
    const p=s.inp.p, r=s.inp.r, y=s.inp.y, ap=s.ap.on, ar=ap?s.cmd.apRoll/A.pmax:0, ae=ap?s.cmd.apNz:0, rr=fdC(r+ar,-1,1), pp=fdC(p+ae,-1,1), bar=(x,yy,wd,v,lab)=>{ g.strokeStyle="#7d8791"; g.lineWidth=0.5; g.strokeRect(x-wd/2,yy-2,wd,4); g.fillStyle=FDC.grn; if(v>=0) g.fillRect(x,yy-2,v*wd/2,4); else g.fillRect(x+v*wd/2,yy-2,-v*wd/2,4); if(lab) fdTx(g,lab,x,yy-5,3.6,FDC.cy); };
    bar(22,h*0.5,16,-rr,"AIL L"); bar(78,h*0.5,16,rr,"AIL R"); bar(36,h*0.72,14,-pp,"ELEV"); bar(64,h*0.72,14,-pp,"ELEV"); bar(50,h*0.9,26,y,"RUD");
    for(let i=0;i<5;i++){ const x=14+i*3.4; g.fillStyle=s.spoil>0.5?FDC.amb:"#39424b"; g.fillRect(x,h*0.62-(s.spoil>0.5?4:0),2.4,s.spoil>0.5?6:2); g.fillRect(100-x-2.4,h*0.62-(s.spoil>0.5?4:0),2.4,s.spoil>0.5?6:2); }
    fdTx(g,"FLAPS "+A.flaps[Math.round(s.flaps)],50,h*0.22,4.8,FDC.grn);
  } else if(pg==="ENG"){
    const x0=boe?34:30, x1=96, y0=14, rows=h>=56?6:5, st=(h-y0-5)/(rows-1); let k=0;
    fdSdRow(g,y0+st*k++,"N1 %",FDC.grn,E.n1,n,x0,x1,v=>v.toFixed(1),boe); fdSdRow(g,y0+st*k++,"N2 %",FDC.grn,E.n2,n,x0,x1,v=>v.toFixed(1),boe); fdSdRow(g,y0+st*k++,"FF KG/H",FDC.grn,E.ff,n,x0,x1,v=>String(Math.round(v/10)*10),boe);
    fdSdRow(g,y0+st*k++,"OIL PSI",FDC.grn,E.oilp,n,x0,x1,v=>String(Math.round(v)),boe); if(rows>5) fdSdRow(g,y0+st*k++,"OIL \u00b0C",FDC.grn,E.oilt,n,x0,x1,v=>String(Math.round(v)),boe); fdSdRow(g,y0+st*k++,"VIB",FDC.grn,E.vib,n,x0,x1,v=>v.toFixed(1),boe);
  } else if(pg==="FUEL"){ if(typeof feFuelSd==="function") feFuelSd(g,h,s,boe);
  } else {
    const np=n>=4?3:2; for(let i=0;i<np;i++){ const x=(i+0.5)*100/np, bw=Math.min(14,70/np), on=s.eng[i%n]; g.strokeStyle="#7d8791"; g.lineWidth=0.5; g.strokeRect(x-bw/2,h*0.3,bw,h*0.45); g.fillStyle=on?FDC.grn:FDC.amb; const hh=h*0.45*(on?0.92:0.06); g.fillRect(x-bw/2+0.4,h*0.75-hh,bw-0.8,hh); fdTx(g,on?"3000":"0",x,h*0.84,4.8,on?FDC.grn:FDC.amb); fdTx(g,(boe?"SYS ":"")+(boe?"AB".charAt(i%2):(["GREEN","YELLOW","RES"][i])),x,h*0.2,4.2,FDC.cy); }
    fdTx(g,"PSI",97,h*0.5,3.8,"#aeb8c1","right");
  }
}
