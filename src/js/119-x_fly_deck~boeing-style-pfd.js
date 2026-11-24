/* ---------- Boeing-style PFD: three-box FMA, black tapes with boxed readouts, magenta bugs, white aircraft symbol ---------- */
function fdPfdB(g,info,s,ils,ts){
  const ap=s.ap, A=s.A, sp=fphSpeeds(s), cy=49, ias=info.ias, alt=info.alt, ppd=1.3;
  g.fillStyle="#000"; g.fillRect(0,0,100,100);
  fdAtt(g,19,12,80,86,50,cy,ppd,info,true);
  fdRoll(g,50,cy,34,info.bank,"#fff",true);
  const fdOn=ap.on||FLY.opts.assist;
  if(fdOn){ const q=fdFdCue(info,s,ils); fdLn(g,50-15,cy-q.p*ppd,50+15,cy-q.p*ppd,FDC.mag,1.1); fdLn(g,50+q.r,cy-15,50+q.r,cy+15,FDC.mag,1.1); }
  g.strokeStyle="#000"; g.lineWidth=2.6; g.beginPath(); g.moveTo(30,cy+0.5); g.lineTo(42,cy+0.5); g.moveTo(70,cy+0.5); g.lineTo(58,cy+0.5); g.stroke(); g.strokeStyle="#fff"; g.lineWidth=1.3; g.stroke();
  g.fillStyle="#000"; g.fillRect(48,cy-1.7,4,3.4); g.strokeStyle="#fff"; g.lineWidth=0.6; g.strokeRect(48,cy-1.7,4,3.4);
  if(ils){ fdIls(g,ils,50,cy,77,FDC.mag); fdTx(g,"ILS",24,cy+31,4.6,FDC.wht,"left"); }
  if(info.agl<2500&&!s.ground) fdTx(g,"RA "+Math.round(info.agl),50,cy+24,5.6,info.agl<400?FDC.amb:FDC.grn);
  /* speed tape */
  g.fillStyle="#05070a"; g.fillRect(0,17,18,64); g.strokeStyle="#6b747d"; g.lineWidth=0.5; g.strokeRect(0.3,17,17.7,64); g.save(); g.beginPath(); g.rect(0,17,18,64); g.clip();
  const pp=64/80, Y=v=>cy-(v-ias)*pp; g.strokeStyle="#f3f6f9"; g.lineWidth=0.55; g.beginPath();
  for(let v=Math.max(30,Math.ceil((ias-42)/10)*10);v<=ias+42;v+=10){ const y=Y(v), L=v%20===0?3.4:1.8; g.moveTo(18,y); g.lineTo(18-L,y); } g.stroke();
  for(let v=Math.max(40,Math.ceil((ias-42)/20)*20);v<=ias+42;v+=20) fdTx(g,String(v),13.2,Y(v),5.6,"#f3f6f9","right");
  const vfe=A.vfe[Math.round(s.flaps)], vmx=Math.min(A.Vmo,vfe); g.fillStyle=FDC.red; g.fillRect(16,0,2,Math.max(0,Y(vmx))); g.fillRect(16,Y(sp.vs1g*1.13),2,90);
  g.fillStyle=FDC.amb; g.fillRect(16,Y(sp.vs1g*1.3),2,Math.max(0,Y(sp.vs1g*1.13)-Y(sp.vs1g*1.3)));
  if(!s.ground||ias<60){ const y=Y(sp.vr); g.strokeStyle=FDC.grn; g.lineWidth=0.7; g.beginPath(); g.arc(14,y,1.5,0,7); g.stroke(); }
  if(ap.on||ap.athr){ const y=fdC(Y(ap.spd),19,79); g.fillStyle=FDC.mag; g.beginPath(); g.moveTo(18,y); g.lineTo(14.2,y-1.9); g.lineTo(14.2,y+1.9); g.closePath(); g.fill(); }
  g.restore();
  g.fillStyle="#000"; g.fillRect(1,cy-4.6,15.5,9.2); g.strokeStyle="#fff"; g.lineWidth=0.7; g.strokeRect(1,cy-4.6,15.5,9.2); fdTx(g,String(Math.max(0,Math.round(ias))),15.5,cy,7.2,ias>A.Vmo?FDC.red:"#fff","right",700);
  g.fillStyle="#fff"; g.beginPath(); g.moveTo(16.8,cy); g.lineTo(19.6,cy-1.8); g.lineTo(19.6,cy+1.8); g.closePath(); g.fill();
  const tr=fdTrend(info,ts); if(Math.abs(tr)>2){ const y=fdC(cy-tr*pp,18,80); fdLn(g,20.2,cy,20.2,y,FDC.grn,0.9); }
  fdTx(g,String(Math.round(ap.spd)),9,14.5,6,FDC.mag); fdTx(g,"M"+info.mach.toFixed(2).replace(/^0/,""),9,87,5.4,"#fff"); fdTx(g,"GS"+Math.round(info.gs),9,94,4.8,"#c6cfd8");
  /* altitude tape */
  g.fillStyle="#05070a"; g.fillRect(81,17,13,64); g.strokeStyle="#6b747d"; g.lineWidth=0.5; g.strokeRect(81,17,13,64); g.save(); g.beginPath(); g.rect(81,17,13,64); g.clip();
  const pa=64/440, YA=v=>cy-(v-alt)*pa; g.strokeStyle="#f3f6f9"; g.lineWidth=0.55; g.beginPath();
  for(let v=Math.floor((alt-230)/20)*20;v<=alt+230;v+=20){ const y=YA(v), L=v%100===0?3.2:1.6; g.moveTo(81,y); g.lineTo(81+L,y); } g.stroke();
  for(let v=Math.floor((alt-230)/100)*100;v<=alt+230;v+=100){ if(v<0) continue; fdTx(g,String(v),93.6,YA(v),5,"#f3f6f9","right",600,11.4); }
  { const y=fdC(YA(ap.alt),19,79); g.fillStyle=FDC.mag; g.beginPath(); g.moveTo(81,y); g.lineTo(85,y-2); g.lineTo(85,y+2); g.closePath(); g.fill(); }
  g.restore();
  g.fillStyle="#000"; g.fillRect(78.5,cy-4.8,17.5,9.6); g.strokeStyle="#fff"; g.lineWidth=0.7; g.strokeRect(78.5,cy-4.8,17.5,9.6);
  { const a=Math.max(0,Math.round(alt)), hun=Math.floor(a/100), ten=Math.round((a%100)/20)*20%100; fdTx(g,String(hun),89.6,cy,6.6,"#fff","right",700,10.8); fdTx(g,String(ten).padStart(2,"0"),90,cy,4.8,"#fff","left"); }
  g.fillStyle="#000"; g.fillRect(80,12,20,5); fdTx(g,String(ap.alt),90,14.6,6,FDC.mag);
  /* vertical speed: white scale with labelled marks and a white needle */
  g.fillStyle="#05070a"; g.fillRect(94.5,17,5.5,64); g.strokeStyle="#cfd6dc"; g.lineWidth=0.5; g.beginPath(); for(let i=-3;i<=3;i++){ const y=cy-i*9.3; g.moveTo(94.8,y); g.lineTo(i%1===0?97.2:96,y); } g.stroke();
  fdTx(g,"1",98.7,cy-9.3,3.6,"#fff"); fdTx(g,"2",98.7,cy-18.6,3.6,"#fff"); fdTx(g,"1",98.7,cy+9.3,3.6,"#fff"); fdTx(g,"2",98.7,cy+18.6,3.6,"#fff");
  const vy=cy-fdC(info.vs,-3000,3000)/3000*28; fdLn(g,100,cy,95.6,vy,"#fff",1.1); if(Math.abs(info.vs)>=400) fdTx(g,String(Math.round(info.vs/50)*50),97.4,vy+(info.vs>0?-3.6:3.6),3.8,"#fff");
  /* heading arc with a boxed readout */
  fdHdgArc(g,50,126,41,info,ap,true); g.fillStyle="#000"; g.fillRect(41,86.5,18,6.4); g.strokeStyle="#fff"; g.lineWidth=0.6; g.strokeRect(41,86.5,18,6.4); fdTx(g,fdP3(info.hdg)+"°",50,89.8,5.6,"#fff");
  /* flight mode annunciator: three boxes, green modes, and the command status */
  g.fillStyle="#000"; g.fillRect(14,0,72,12); g.strokeStyle="#aab4bd"; g.lineWidth=0.5; g.strokeRect(15,1,70,10.4); g.beginPath(); g.moveTo(38.3,1); g.lineTo(38.3,11.4); g.moveTo(61.7,1); g.lineTo(61.7,11.4); g.stroke();
  const m=fdModes(s,info,true); fdTx(g,m[0],26.7,6.2,4.8,FDC.grn,"center",600,21.5); fdTx(g,m[2],50,6.2,4.8,FDC.grn,"center",600,21.5); fdTx(g,m[1],73.3,6.2,4.8,FDC.grn,"center",600,21.5);
  if(ap.on) fdTx(g,"CMD",50,15.3,5,FDC.grn); else if(fdOn) fdTx(g,"FD",50,15.3,5,FDC.grn);
}
