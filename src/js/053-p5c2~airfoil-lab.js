/* ---------- airfoil lab: 2-D ideal flow past a Joukowski section, with sliders and moving streamlines ---------- */
const LAB = {A:6, C:0.03, T:0.12, play:true, cv:null, run:false, last:0, pts:[], model:null, outline:[], chord:4, tc:0, camber:0, cl:0, cd:0, ld:0};
const lbMul=(p,q)=>({re:p.re*q.re-p.im*q.im, im:p.re*q.im+p.im*q.re});
const lbDiv=(p,q)=>{ const d=q.re*q.re+q.im*q.im; return {re:(p.re*q.re+p.im*q.im)/d, im:(p.im*q.re-p.re*q.im)/d}; };
const lbSub=(p,q)=>({re:p.re-q.re, im:p.im-q.im});
const lbAdd=(p,q)=>({re:p.re+q.re, im:p.im+q.im});
const lbSqrt=p=>{ const r=Math.hypot(p.re,p.im); const a=Math.sqrt(Math.max(0,(r+p.re)/2)), b=Math.sqrt(Math.max(0,(r-p.re)/2)); return {re:a, im:p.im<0?-b:b}; };

/* circle centre offset sets thickness (cx) and camber (cy); the circle passes through the trailing edge at zeta = 1 */
function labModel(t,k,alphaDeg){
  const cx=t/1.18, cy=k, C={re:-cx,im:cy}, R=Math.hypot(1+cx,cy), a=alphaDeg*Math.PI/180;
  const ea={re:Math.cos(a),im:Math.sin(a)}, ema={re:Math.cos(a),im:-Math.sin(a)};
  const wTE={re:1+cx,im:-cy};
  /* Kutta condition: no velocity singularity at the trailing edge, which fixes the circulation */
  const inner=lbSub(ema, lbDiv(lbMul(ea,{re:R*R,im:0}), lbMul(wTE,wTE)));
  const Gam=lbMul({re:0,im:-2*Math.PI}, lbMul(wTE,inner)).re;
  return {C,R,ea,ema,Gam};
}
function labVel(M,z){
  const d=lbSqrt(lbSub(lbMul(z,z),{re:4,im:0}));
  const r1={re:(z.re+d.re)/2, im:(z.im+d.im)/2}, r2={re:(z.re-d.re)/2, im:(z.im-d.im)/2};
  const o1=Math.hypot(r1.re-M.C.re,r1.im-M.C.im)-M.R, o2=Math.hypot(r2.re-M.C.re,r2.im-M.C.im)-M.R;
  const zeta=o1>o2?r1:r2, w=lbSub(zeta,M.C), w2=lbMul(w,w);
  const F=lbAdd(lbSub(M.ema, lbDiv(lbMul(M.ea,{re:M.R*M.R,im:0}),w2)), lbDiv({re:0,im:-M.Gam/(2*Math.PI)}, w));
  const q=lbDiv(F, lbSub({re:1,im:0}, lbDiv({re:1,im:0}, lbMul(zeta,zeta))));
  return {u:q.re, v:-q.im};
}
function labOutline(M,n){
  const pts=[];
  for(let i=0;i<n;i++){ const th=i/n*2*Math.PI, zc={re:M.C.re+M.R*Math.cos(th), im:M.C.im+M.R*Math.sin(th)}; const inv=lbDiv({re:1,im:0},zc);
    pts.push([zc.re+inv.re, zc.im+inv.im]); }
  return pts;
}
function labShape(pts){
  let x0=1e9,x1=-1e9; pts.forEach(p=>{ if(p[0]<x0)x0=p[0]; if(p[0]>x1)x1=p[0]; });
  const bins=60, up=new Array(bins).fill(-1e9), lo=new Array(bins).fill(1e9);
  pts.forEach(([x,y])=>{ const b=Math.min(bins-1,Math.floor((x-x0)/(x1-x0)*bins)); if(y>up[b])up[b]=y; if(y<lo[b])lo[b]=y; });
  let tmax=0, cmax=0; for(let b=0;b<bins;b++){ if(up[b]<-1e8) continue; tmax=Math.max(tmax,up[b]-lo[b]); }
  const chord=x1-x0, le=pts.reduce((m,p)=>p[0]<m[0]?p:m,pts[0]), te=pts.reduce((m,p)=>p[0]>m[0]?p:m,pts[0]);
  for(let b=0;b<bins;b++){ if(up[b]<-1e8) continue; const xc=x0+(b+0.5)/bins*chord; const line=le[1]+(te[1]-le[1])*(xc-le[0])/(te[0]-le[0]); const mean=(up[b]+lo[b])/2-line; if(Math.abs(mean)>Math.abs(cmax)) cmax=mean; }
  return {chord, tc:tmax/chord, camber:cmax/chord, x0, x1};
}
function labInside(pts,x,y){
  let c=false; for(let i=0,j=pts.length-1;i<pts.length;j=i++){ const [xi,yi]=pts[i],[xj,yj]=pts[j];
    if(((yi>y)!==(yj>y)) && (x<(xj-xi)*(y-yi)/(yj-yi)+xi)) c=!c; } return c;
}
function labCompute(){
  const M=labModel(LAB.T,LAB.C,LAB.A); LAB.model=M;
  LAB.outline=labOutline(M,240); const sh=labShape(LAB.outline);
  LAB.chord=sh.chord; LAB.tc=sh.tc; LAB.camber=sh.camber;
  LAB.cl=-2*M.Gam/sh.chord;             /* sign chosen so positive angle gives positive lift */
  const stallAbs=Math.abs(LAB.A), over=Math.max(0,stallAbs-14);
  LAB.clShow=LAB.cl*(over>0?Math.max(0.5,1-0.05*over):1);
  LAB.cd=0.006+0.03*LAB.tc+0.012*LAB.clShow*LAB.clShow;
  LAB.ld=LAB.clShow/LAB.cd;
}
function labRespawn(p){ p.x=-3.4+(Math.random()*0.4); p.y=-1.7+Math.random()*3.4; p.h=[]; }
function labStep(dt){
  const M=LAB.model; if(!M) return;
  LAB.pts.forEach(p=>{
    const v1=labVel(M,{re:p.x,im:p.y});
    const v2=labVel(M,{re:p.x+v1.u*dt/2, im:p.y+v1.v*dt/2});
    p.x+=v2.u*dt; p.y+=v2.v*dt; p.sp=Math.hypot(v2.u,v2.v);
    if(!isFinite(p.x)||!isFinite(p.y)||p.x>3.4||Math.abs(p.y)>2.6||labInside(LAB.outline,p.x,p.y)){ labRespawn(p); return; }
    p.h.push([p.x,p.y]); if(p.h.length>16) p.h.shift();
  });
}
function labDraw(){
  const cv=LAB.cv; if(!cv) return; const ctx=cv.getContext("2d");
  const dpr=window.devicePixelRatio||1, W=cv.clientWidth, H=cv.clientHeight;
  if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){ cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); }
  ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H);
  const cs=getComputedStyle(document.documentElement), ink=cs.getPropertyValue("--ink").trim()||"#111", acc=cs.getPropertyValue("--accent").trim()||"#2a6fdb", mut=cs.getPropertyValue("--muted").trim()||"#777", pan=cs.getPropertyValue("--panel").trim()||"#fff";
  const s=W/7.4, X=x=>W/2+x*s, Y=y=>H/2-y*s;
  ctx.fillStyle=pan; ctx.fillRect(0,0,W,H);
  /* streamlines */
  ctx.lineWidth=1.3; ctx.lineCap="round";
  LAB.pts.forEach(p=>{ if(p.h.length<2) return; ctx.strokeStyle=acc; ctx.globalAlpha=Math.min(0.85,0.2+0.35*(p.sp||0.8));
    ctx.beginPath(); p.h.forEach((q,i)=>{ i?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1])); }); ctx.stroke(); });
  ctx.globalAlpha=1;
  /* body */
  ctx.beginPath(); LAB.outline.forEach((q,i)=>{ i?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1])); }); ctx.closePath();
  ctx.fillStyle=mut; ctx.globalAlpha=0.28; ctx.fill(); ctx.globalAlpha=1; ctx.strokeStyle=ink; ctx.lineWidth=1.6; ctx.stroke();
  /* chord line and free-stream arrow */
  ctx.setLineDash([5,5]); ctx.strokeStyle=mut; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(X(-2.1),Y(0)); ctx.lineTo(X(2.1),Y(0)); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle=mut; ctx.font="13px IBM Plex Sans Arabic, sans-serif"; ctx.direction="rtl"; ctx.textAlign="left";
  ctx.fillText("الهواء يدخل من اليسار",12,H-14);
  ctx.strokeStyle=mut; ctx.beginPath(); ctx.moveTo(14,30); ctx.lineTo(70,30); ctx.lineTo(62,25); ctx.moveTo(70,30); ctx.lineTo(62,35); ctx.stroke();
  /* alert when the angle is past the critical value */
  if(Math.abs(LAB.A)>14){ ctx.fillStyle="#C0392B"; ctx.direction="rtl"; ctx.textAlign="right"; ctx.fillText("تجاوزت الزاوية الحرجة: ينفصل الهواء عن السطح",W-12,22); }
}
function labReadout(){
  const el=document.getElementById("labRo"); if(!el) return;
  const f=(v,d)=>v.toFixed(d);
  el.innerHTML=`<div><span>معامل الرفع Cl</span><b>${f(LAB.clShow,2)}</b></div><div><span>معامل السحب Cd (تقدير)</span><b>${f(LAB.cd,3)}</b></div><div><span>الرفع / السحب</span><b>${f(LAB.ld,1)}</b></div><div><span>سماكة المقطع</span><b>${f(LAB.tc*100,1)}%</b></div><div><span>الانحناء</span><b>${f(LAB.camber*100,1)}%</b></div>`;
}
function labSet(k,v){
  LAB[k]=v; labCompute(); labReadout();
  const map={A:["lA","lAv",v=>v.toFixed(1)+"°"],C:["lC","lCv",v=>(v*100).toFixed(1)+"%"],T:["lT","lTv",v=>(v*100).toFixed(0)+"%"]}[k];
  if(map){ const i=document.getElementById(map[0]); if(i) i.value=v; const o=document.getElementById(map[1]); if(o) o.textContent=map[2](v); }
}
function labPreset(p){
  const P={sym:{A:0,C:0,T:0.12}, cam:{A:4,C:0.06,T:0.12}, thick:{A:2,C:0.02,T:0.18}};
  Object.entries(P[p]).forEach(([k,v])=>labSet(k,v));
}
function labMount(root){
  LAB.cv=root.querySelector("#labCv");
  if(!LAB.pts.length){ for(let i=0;i<120;i++){ const p={}; labRespawn(p); p.sp=1; LAB.pts.push(p); } }
  ["A","C","T"].forEach(k=>{ const i=root.querySelector({A:"#lA",C:"#lC",T:"#lT"}[k]); i.addEventListener("input",()=>labSet(k,parseFloat(i.value))); });
  root.querySelectorAll("[data-preset]").forEach(b=>b.addEventListener("click",()=>labPreset(b.dataset.preset)));
  const pl=root.querySelector("#labPlay"); pl.addEventListener("click",()=>{ LAB.play=!LAB.play; pl.setAttribute("aria-pressed",!LAB.play); pl.textContent=LAB.play?"إيقاف الجريان":"تشغيل الجريان"; });
  pl.textContent=LAB.play?"إيقاف الجريان":"تشغيل الجريان";
  labSet("A",LAB.A); labSet("C",LAB.C); labSet("T",LAB.T);
  if(!LAB.run){ LAB.run=true; LAB.last=0; LAB.raf=requestAnimationFrame(labLoop); }
}
function labStop(){ LAB.run=false; LAB.cv=null; if(LAB.raf) cancelAnimationFrame(LAB.raf); LAB.raf=0; }
function labLoop(now){
  if(!LAB.run) return;
  if(!LAB.cv||!document.contains(LAB.cv)){ LAB.run=false; return; }
  LAB.raf=requestAnimationFrame(labLoop);
  const dt=LAB.last?Math.min(0.05,(now-LAB.last)/1000):0.016; LAB.last=now;
  if(LAB.play) labStep(dt*2.2);
  labDraw();
}
