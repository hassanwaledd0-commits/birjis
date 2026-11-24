/* ---------- Airbus-style PFD: five-column FMA, grey tapes, yellow aircraft symbol, arc heading scale ---------- */
function fdPfdA(g,info,s,ils,ts){
  const ap=s.ap, A=s.A, sp=fphSpeeds(s), cy=49, ias=info.ias, alt=info.alt, ppd=1.3;
  g.fillStyle="#000"; g.fillRect(0,0,100,100);
  fdAtt(g,15,13,79,85,50,cy,ppd,info,false);
  fdRoll(g,50,cy,33,info.bank,FDC.amb,false);
  /* aircraft symbol, flight director and ILS */
  const fdOn=ap.on||FLY.opts.assist;
  if(fdOn){ const q=fdFdCue(info,s,ils); g.strokeStyle=FDC.grn; g.lineWidth=0.9; fdLn(g,50-13,cy-q.p*ppd,50+13,cy-q.p*ppd,FDC.grn,0.9); fdLn(g,50+q.r,cy-14,50+q.r,cy+14,FDC.grn,0.9); }
  g.strokeStyle="#000"; g.lineWidth=2.2; g.beginPath(); g.moveTo(31,cy); g.lineTo(43,cy); g.lineTo(43,cy+3); g.moveTo(69,cy); g.lineTo(57,cy); g.lineTo(57,cy+3); g.stroke();
  g.strokeStyle=FDC.amb; g.lineWidth=1.3; g.stroke(); g.fillStyle=FDC.amb; g.fillRect(49,cy-1,2,2);
  if(ils){ fdIls(g,ils,50,cy,76,FDC.mag); fdTx(g,"ILS",21,cy+31,4.6,FDC.mag,"left"); }
  if(info.agl<2500&&!s.ground) fdTx(g,String(Math.round(info.agl)),50,cy+25.5,6,info.agl<400?FDC.amb:FDC.grn);
  /* speed tape */
  g.fillStyle="rgba(46,50,57,0.92)"; g.fillRect(0,13,15,72); g.save(); g.beginPath(); g.rect(0,13,15,72); g.clip();
  const pp=72/80, Y=v=>cy-(v-ias)*pp; g.lineWidth=0.5; g.strokeStyle="#e8edf1"; g.beginPath();
  for(let v=Math.max(30,Math.ceil((ias-42)/10)*10);v<=ias+42;v+=10){ const y=Y(v); g.moveTo(12.6,y); g.lineTo(15,y); } g.stroke();
  for(let v=Math.max(40,Math.ceil((ias-42)/20)*20);v<=ias+42;v+=20) fdTx(g,String(v),11.6,Y(v),5.6,"#f3f6f9","right");
  const vls=sp.vs1g*1.23, vfe=A.vfe[Math.round(s.flaps)]; g.fillStyle=FDC.red; g.fillRect(13.2,Math.min(85,Y(sp.vs1g)),1.8,90); g.fillStyle=FDC.amb; g.fillRect(13.2,Y(vls),1.8,Math.max(0,Y(sp.vs1g)-Y(vls)));
  g.fillStyle=FDC.red; g.fillRect(13.2,0,1.8,Math.max(0,Y(Math.min(A.Vmo,vfe))));   /* Vmax: red above */
  if(!s.ground||ias<60){ g.fillStyle=FDC.cy; const y=Y(sp.vr); g.fillRect(11,y-0.4,4,0.8); fdTx(g,"R",8.5,y,3.8,FDC.cy); }
  if(ap.on||ap.athr){ const y=fdC(Y(ap.spd),15.5,82.5); g.strokeStyle=FDC.cy; g.lineWidth=0.9; g.strokeRect(10.5,y-1.7,4.5,3.4); }
  g.restore();
  g.fillStyle=FDC.amb; g.beginPath(); g.moveTo(15,cy); g.lineTo(21,cy-2.4); g.lineTo(21,cy+2.4); g.closePath(); g.fill();   /* yellow pointer */
  const tr=fdTrend(info,ts); if(Math.abs(tr)>2){ const y=fdC(cy-tr*pp,15,83); fdLn(g,15.8,cy,15.8,y,FDC.grn,0.9); }
  fdTx(g,"M"+info.mach.toFixed(2).replace(/^0/,""),7.5,89,5.4,FDC.grn); fdTx(g,"GS"+Math.round(info.gs),7.5,95,4.8,"#c6cfd8");
  /* altitude tape */
  g.fillStyle="rgba(46,50,57,0.92)"; g.fillRect(79,13,15,72); g.save(); g.beginPath(); g.rect(79,13,15,72); g.clip();
  const pa=72/460, YA=v=>cy-(v-alt)*pa; g.strokeStyle="#e8edf1"; g.lineWidth=0.5; g.beginPath();
  for(let v=Math.floor((alt-240)/20)*20;v<=alt+240;v+=20){ const y=YA(v), L=v%100===0?3:1.5; g.moveTo(79,y); g.lineTo(79+L,y); } g.stroke();
  for(let v=Math.floor((alt-240)/100)*100;v<=alt+240;v+=100){ if(v<0) continue; fdTx(g,String(v),93.4,YA(v),5,"#f3f6f9","right",600,11.4); }
  { const y=fdC(YA(ap.alt),15.5,82.5); g.strokeStyle=FDC.cy; g.lineWidth=0.9; g.strokeRect(79.4,y-1.9,5,3.8); }
  g.restore();
  g.fillStyle="#000"; g.fillRect(78,cy-4.4,17.5,8.8); g.strokeStyle=FDC.amb; g.lineWidth=0.8; g.strokeRect(78,cy-4.4,17.5,8.8);
  { const a=Math.max(0,Math.round(alt)), hun=Math.floor(a/100), ten=Math.round((a%100)/20)*20%100; fdTx(g,String(hun),89.2,cy,6.2,FDC.grn,"right",600,10.5); fdTx(g,String(ten).padStart(2,"0"),89.6,cy,4.6,FDC.grn,"left"); }
  fdTx(g,String(ap.alt),87,10.2,5.4,FDC.cy); fdLn(g,79,12.5,94,12.5,FDC.dim,0.4);
  /* vertical speed scale */
  g.fillStyle="rgba(46,50,57,0.92)"; g.fillRect(94.5,13,5.5,72); g.strokeStyle="#e8edf1"; g.lineWidth=0.5; g.beginPath(); for(let i=-3;i<=3;i++){ const y=cy-i*9.3; g.moveTo(94.8,y); g.lineTo(i%1===0?97:96,y); } g.stroke();
  const vy=cy-fdC(info.vs,-3000,3000)/3000*28; fdLn(g,100,cy,95.4,vy,Math.abs(info.vs)>2000?FDC.amb:FDC.grn,1); if(Math.abs(info.vs)>=200) fdTx(g,String(Math.min(99,Math.round(Math.abs(info.vs)/100))).padStart(2,"0"),97.2,vy+(info.vs>0?-3.4:3.4),4.2,FDC.grn);
  /* heading */
  fdHdgArc(g,50,122,38,info,ap,false);
  /* flight mode annunciator */
  g.fillStyle="#000"; g.fillRect(0,0,100,12.5); fdLn(g,0,12.5,100,12.5,FDC.dim,0.4); g.strokeStyle=FDC.dim; g.lineWidth=0.4; g.beginPath(); for(let i=1;i<5;i++){ g.moveTo(i*20,0.8); g.lineTo(i*20,11.7); } g.stroke();
  const m=fdModes(s,info,false); fdTx(g,m[0],10,2.4,4.4,FDC.grn,"center",600,19); fdTx(g,m[1],30,2.4,4.4,FDC.grn,"center",600,19); fdTx(g,m[2],50,2.4,4.4,FDC.grn,"center",600,19);
  if(ap.appr&&ap.on) fdTx(g,"CAT1",70,2.4,4.4,FDC.wht); if(ap.appr) fdTx(g,"LAND",30,6.6,4.4,FDC.cy); if(ap.athr&&!ap.on) fdTx(g,"A/THR",90,6.6,4.4,FDC.cy);
  if(ap.on){ fdTx(g,"AP1",90,2.4,4.4,FDC.wht); fdTx(g,"1FD2",90,6.6,4.4,FDC.wht); if(ap.athr) fdTx(g,"A/THR",90,10.6,4.2,FDC.cy); } else if(fdOn) fdTx(g,"1FD2",90,2.4,4.4,FDC.wht);
}
