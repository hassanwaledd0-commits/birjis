/* ---------- ND: heading-up arc (Airbus default) or compass rose (Boeing default), runway, track, wind, range rings ---------- */
const FD_RNG=[2,5,10,20,40];
function fdRwy(){ const w=FLY.W&&FLY.W.runway; if(w&&typeof w.x==="number") return w; return {x:0,z0:-3600,z1:0,hdg:0,wid:60}; }
function fdNd(g,info,s,boe,ts){
  const arc=FD.ndMode==="arc", rng=FD_RNG[FD.rng]*1852, cx=50, cy=arc?88:54, R=arc?76:41, k=R/rng, hd=info.hdg*FDD, ap=s.ap, ils=(ap.appr||s.scn==="approach")&&FD.ilsOn;
  g.fillStyle="#000"; g.fillRect(0,0,100,100);
  g.save(); g.beginPath(); if(arc){ g.moveTo(cx,cy); g.arc(cx,cy,R+4.5,-Math.PI/2-1.12,-Math.PI/2+1.12); g.closePath(); } else g.arc(cx,cy,R+5,0,Math.PI*2); g.clip();
  g.translate(cx,cy); g.rotate(-hd);
  /* ground features: runway rectangle, extended centre line */
  const rw=fdRwy(), px=wx=>(wx-s.p.x)*k, pz=wz=>(wz-s.p.z)*k, rwid=Math.max(1.1,rw.wid*k);
  g.strokeStyle=FD.ilsOn?FDC.cy:"rgba(220,230,240,0.55)"; g.lineWidth=0.4; g.setLineDash(FD_DASH); g.beginPath(); g.moveTo(px(rw.x),pz(rw.z0)); g.lineTo(px(rw.x),pz(rw.z0-40000)); g.moveTo(px(rw.x),pz(rw.z1)); g.lineTo(px(rw.x),pz(rw.z1+40000)); g.stroke(); g.setLineDash(FD_NODASH);
  g.fillStyle="#e8eef3"; g.fillRect(px(rw.x)-rwid/2,pz(rw.z0),rwid,(rw.z1-rw.z0)*k);
  if(R/rng*(rw.z1-rw.z0)>6){ g.save(); g.translate(px(rw.x),pz(rw.z0)-3); g.rotate(hd); fdTx(g,"36",0,0,4.6,boe?FDC.wht:FDC.mag); g.restore(); }
  if(typeof faNdDraw==="function") faNdDraw(g,px,pz,k,boe,s,hd);   /* fa: the route to the destination */
  if(typeof ftNdDraw==="function") try{ ftNdDraw(g,px,pz,k,boe,s,hd,R); }catch(e){}   /* ft: other aircraft */
  g.restore();
  /* range rings */
  g.strokeStyle=boe?"rgba(210,220,230,0.45)":"rgba(210,220,230,0.4)"; g.lineWidth=0.35; g.setLineDash(FD_DASH2);
  for(let i=1;i<=2;i++){ g.beginPath(); g.arc(cx,cy,R*i/2*(i===2?0:1),arc?-Math.PI/2-1.1:0,arc?-Math.PI/2+1.1:7); g.stroke(); } g.setLineDash(FD_NODASH);
  fdTx(g,String(FD_RNG[FD.rng]/2).replace(".5",".5"),cx+2.5,cy-R/2+0.5,4.2,FDC.cy,"left");
  /* compass ticks and numerals, rotating with the heading */
  g.save(); g.translate(cx,cy); g.strokeStyle="#e4eaf0"; g.lineWidth=0.5; g.beginPath(); g.arc(0,0,R,arc?-Math.PI/2-1.12:0,arc?-Math.PI/2+1.12:7); g.stroke();
  for(let a=0;a<360;a+=5){ const t=(a*FDD)-hd, rel=((a-info.hdg+540)%360)-180; if(arc&&Math.abs(rel)>64) continue; const s2=Math.sin(t), c2=Math.cos(t), big=a%10===0, L=big?3:1.7; g.beginPath(); g.moveTo(s2*R,-c2*R); g.lineTo(s2*(R-L),-c2*(R-L)); g.stroke();
    if(a%(arc?10:30)===0){ const n=a/10|0, lab=a===0&&!arc?"N":a===90&&!arc?"E":a===180&&!arc?"S":a===270&&!arc?"W":String(n).padStart(2,"0"); fdTx(g,lab,s2*(R-6.2),-c2*(R-6.2),4.6,"#e8eef2"); } }
  /* selected heading bug and track line */
  const dh=(ap.hdg*FDD-hd); g.save(); g.rotate(dh); g.fillStyle=boe?FDC.mag:FDC.cy; g.fillRect(-1.8,-R-1,3.6,2.4); g.restore();
  if(info.gs>25){ const tk=(info.track*FDD-hd); g.save(); g.rotate(tk); g.strokeStyle=FDC.grn; g.lineWidth=0.7; g.beginPath(); g.moveTo(0,-2.5); g.lineTo(0,-R+3); g.stroke(); g.restore(); }
  /* own aircraft */
  g.fillStyle=boe?"#000":"rgba(0,0,0,0)"; g.strokeStyle=boe?"#fff":FDC.amb; g.lineWidth=1; g.beginPath(); g.moveTo(0,-4.2); g.lineTo(3.4,3.6); g.lineTo(0,2); g.lineTo(-3.4,3.6); g.closePath(); if(boe) g.fill(); g.stroke();
  g.restore();
  /* data block: ground speed / true air speed, wind, mode */
  fdTx(g,"GS",1.5,4,4.6,FDC.wht,"left"); fdTx(g,String(Math.round(info.gs)),10,4,5.6,FDC.grn,"left"); fdTx(g,"TAS",1.5,10,4.6,FDC.wht,"left"); fdTx(g,String(Math.round(info.tas)),12,10,5.6,FDC.grn,"left");
  const wx=s.wind.x, wz=s.wind.z, ws=Math.hypot(wx,wz)/0.5144, from=(Math.atan2(-wx,wz)/FDD+360)%360;
  fdTx(g,fdP3(from)+"/"+Math.round(ws),99,4,5.2,FDC.grn,"right"); g.save(); g.translate(93,14); g.rotate((from+180)*FDD-hd); g.strokeStyle=FDC.grn; g.lineWidth=0.8; g.beginPath(); g.moveTo(0,-4); g.lineTo(0,4); g.moveTo(-2,-1.5); g.lineTo(0,-4.2); g.lineTo(2,-1.5); g.stroke(); g.restore();
  if(boe){ g.fillStyle="#000"; g.fillRect(39,0.8,22,6.4); g.strokeStyle="#fff"; g.lineWidth=0.5; g.strokeRect(39,0.8,22,6.4); fdTx(g,"HDG "+fdP3(info.hdg),50,4,4.8,"#fff"); fdTx(g,ils?"APP":"MAP",50,10.8,5,FDC.grn); }
  else fdTx(g,ils?"ILS  36":"ARC",50,4,4.8,ils?FDC.mag:FDC.grn);
}
const FD_DASH=[2.2,1.8], FD_DASH2=[1.2,2.2], FD_NODASH=[];
