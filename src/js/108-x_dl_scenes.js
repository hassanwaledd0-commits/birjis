/* ---------- DL scenes: the 21 canvas templates of the data lessons (DL v1, see tools/SPEC.md section A).
   DL_SCENES[name](g,r,S,C,p,T): g 2D context, r {x,y,w,h} the rectangle to draw in (everything is clipped to it), S values map (slider + readout keys),
   C theme colours (LRN.C), p the scene object with "=expr" already resolved to numbers (labels still hold {key|d}), T animation seconds.
   Contract notes for the runtime: polar.r and field.f depend on th / x,y, so they may arrive as a function (th)=>r, (x,y)=>f, as an unresolved "=expr" string
   (compiled here with dlFn over the keys of S) or as a plain number. Nothing here throws: bad numbers are skipped. Prefix: dls. ---------- */
const DL_SCENES={};
const DLS_SEQ=["accent","power","hyd","fuel","gear","sys","ctrl","struct"];
const dlsCache=new Map(), dlsSt=new WeakMap();

/* ---- numbers, colours, text ---- */
function dlsOk(v){ return typeof v==="number"&&isFinite(v); }
function dlsNum(v,d){ return dlsOk(v)?v:(d==null?0:d); }
function dlsCl(v,a,b){ return v<a?a:v>b?b:v; }
function dlsAr(s){ return /[؀-ۿ]/.test(s||""); }
/* readable number: 3 significant figures, thousands separators, no trailing zeros; d forces the decimals */
function dlsFmt(v,d){
  if(!dlsOk(v)) return "—"; if(d!=null&&dlsOk(d)) return nf(v,dlsCl(Math.round(d),0,8));
  const a=Math.abs(v); if(a===0) return "0"; if(a>=1e6||a<1e-3) return sci(v,1);
  let s=a>=1000?nf(v,0):a>=100?nf(v,1):a>=10?nf(v,2):a>=1?nf(v,3):a>=0.1?nf(v,3):nf(v,4);
  if(s.indexOf(".")>=0) s=s.replace(/0+$/,"").replace(/\.$/,""); return s==="-0"?"0":s;
}
/* compact number for narrow places (colour bars): e-notation instead of superscripts */
function dlsFmtS(v){ if(!dlsOk(v)) return "—"; const a=Math.abs(v); if(a===0) return "0"; if(a<1e-3||a>=1e5) return v.toExponential(1).replace("e+","e"); return String(parseFloat(v.toPrecision(3))); }
function dlsRGB(c){
  let a=dlsCache.get(c); if(a) return a; const s=String(c||"#888888").trim();
  if(s[0]==="#"){ const h=s.length===4?s.slice(1).split("").map(x=>x+x).join(""):s.slice(1); const n=parseInt(h,16)||0; a=[(n>>16)&255,(n>>8)&255,n&255]; }
  else { const m=s.match(/[\d.]+/g)||[136,136,136]; a=[+m[0]||0,+m[1]||0,+m[2]||0]; }
  dlsCache.set(c,a); return a;
}
/* mix of two colours (hex or rgb()), t 0..1 towards b; works on its own results, unlike mixC */
function dlsMix(a,b,t){ const A=dlsRGB(a), B=dlsRGB(b); t=dlsCl(t,0,1); return "rgb("+A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(",")+")"; }
function dlsAlpha(c,al){ const A=dlsRGB(c); return "rgba("+A[0]+","+A[1]+","+A[2]+","+dlsCl(al,0,1)+")"; }
function dlsCol(C,n){ return (C&&C[n])||(C&&C.accent)||"#1F5FBF"; }
function dlsTint(C,n,t){ return dlsMix(C.panel,dlsCol(C,n),t); }
/* the lesson canvas panel with a light ink wash: the neutral "surface" colour of cards drawn inside a scene */
function dlsSurf(C,t){ return dlsMix(C.panel,C.ink,t==null?0.04:t); }
function dlsLab(s,S){ return typeof s==="string"?(typeof dlText==="function"?dlText(s,S||{},nf):s):""; }

function dlsT(g,s,x,y,o){ s=s==null?"":String(s); o=o||{}; const ar=dlsAr(s); ltx(g,s,x,y,{c:o.c,s:o.s,w:o.w,a:o.a,b:o.b,al:o.al,m:!!o.m&&!ar,rtl:ar||!!o.rtl}); }
function dlsTW(g,s,sz,w,mono){ g.save(); g.font=(w||400)+" "+sz+"px "+(mono?LM:LF); const v=g.measureText(String(s)).width; g.restore(); return dlsOk(v)?v:String(s).length*sz*0.55; }
/* text shrunk (then cut with an ellipsis) to fit maxW; returns the drawn width */
function dlsTF(g,s,x,y,maxW,o){
  o=Object.assign({},o); s=String(s==null?"":s); const ar=dlsAr(s), mono=!!o.m&&!ar; let sz=o.s||11, w=dlsTW(g,s,sz,o.w,mono);
  while(w>maxW&&sz>8.5){ sz-=0.5; w=dlsTW(g,s,sz,o.w,mono); }
  if(w>maxW){ let t=s; while(t.length>2&&dlsTW(g,t+"…",sz,o.w,mono)>maxW) t=t.slice(0,-1); s=t+"…"; w=Math.min(w,maxW); }
  o.s=sz; dlsT(g,s,x,y,o); return w;
}
/* the text cut with an ellipsis so that it is at most maxW wide */
function dlsTrim(g,s,maxW,sz,w){ s=String(s==null?"":s); if(dlsTW(g,s,sz,w,false)<=maxW) return s; let t=s; while(t.length>1&&dlsTW(g,t+"…",sz,w,false)>maxW) t=t.slice(0,-1); return t+"…"; }
/* a label on a small rounded plate (keeps text readable over lines) */
function dlsPlate(g,s,x,y,C,o){
  o=o||{}; s=String(s); const sz=o.s||10.5, ar=dlsAr(s), w=dlsTW(g,s,sz,o.w,!!o.m&&!ar)+10, h=sz+7, a=o.a||"center";
  const x0=a==="left"?x:a==="right"?x-w:x-w/2;
  g.save(); g.fillStyle=dlsAlpha(C.panel,0.88); dlsRR(g,x0,y-h/2,w,h,h/2); g.fill(); if(o.line){ g.strokeStyle=o.line; g.lineWidth=1; g.stroke(); } g.restore();
  dlsT(g,s,x0+w/2,y,{c:o.c||C.ink,s:sz,w:o.w,m:o.m}); return w;
}
function dlsRR(g,x,y,w,h,r){
  r=Math.max(0,Math.min(r,w/2,h/2)); g.beginPath(); g.moveTo(x+r,y); g.lineTo(x+w-r,y); g.arcTo(x+w,y,x+w,y+r,r); g.lineTo(x+w,y+h-r); g.arcTo(x+w,y+h,x+w-r,y+h,r);
  g.lineTo(x+r,y+h); g.arcTo(x,y+h,x,y+h-r,r); g.lineTo(x,y+r); g.arcTo(x,y,x+r,y,r); g.closePath();
}
function dlsPoly(g,pts,close){ g.beginPath(); pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])); if(close) g.closePath(); }
/* arrow with a filled head, tail at (x1,y1), tip at (x2,y2) */
function dlsArrow(g,x1,y1,x2,y2,c,w,hd){
  const L=Math.hypot(x2-x1,y2-y1); if(!(L>1.5)) return; hd=Math.min(hd||9,L*0.7); const a=Math.atan2(y2-y1,x2-x1);
  g.save(); g.strokeStyle=c; g.fillStyle=c; g.lineWidth=w||2; g.lineCap="round"; g.lineJoin="round";
  g.beginPath(); g.moveTo(x1,y1); g.lineTo(x2-Math.cos(a)*hd*0.7,y2-Math.sin(a)*hd*0.7); g.stroke();
  g.beginPath(); g.moveTo(x2,y2); g.lineTo(x2-hd*Math.cos(a-0.42),y2-hd*Math.sin(a-0.42)); g.lineTo(x2-hd*Math.cos(a+0.42),y2-hd*Math.sin(a+0.42)); g.closePath(); g.fill(); g.restore();
}
/* dimension line with end ticks between two points (offset already applied by the caller) */
function dlsDim(g,x1,y1,x2,y2,c,w){
  const a=Math.atan2(y2-y1,x2-x1), L=Math.hypot(x2-x1,y2-y1); if(!(L>6)) return;
  dlsArrow(g,(x1+x2)/2,(y1+y2)/2,x1,y1,c,w||1,6); dlsArrow(g,(x1+x2)/2,(y1+y2)/2,x2,y2,c,w||1,6);
}
function dlsPt(g,x,y,rad,fill,stroke,lw){ g.save(); g.beginPath(); g.arc(x,y,rad,0,Math.PI*2); if(fill){ g.fillStyle=fill; g.fill(); } if(stroke){ g.strokeStyle=stroke; g.lineWidth=lw||1.2; g.stroke(); } g.restore(); }

/* ---- layout: sizes derived from the rectangle, a title line, the inner rectangle ---- */
function dlsM(r){
  const mn=Math.min(r.w,r.h), fs=dlsCl(Math.min(r.w/38,r.h/24),9.5,12.5);
  return {fs, fm:Math.max(8.5,fs-1), ft:fs+0.5, lw:dlsCl(mn/210,1.1,1.8), pad:dlsCl(mn/24,6,14), ph:mn<270};
}
/* draws the scene label (p.l) centred at the top; returns the height it used */
function dlsTitle(g,r,m,p,S,C){
  const t=dlsLab(p.l,S); if(!t) return m.pad*0.4;
  dlsTF(g,t,r.x+r.w/2,r.y+m.pad*0.5+m.ft*0.8,r.w-2*m.pad,{c:C.muted,s:m.ft,w:600});
  return m.pad*0.5+m.ft*1.7+2;
}
function dlsQ(r,m,top){ return {x:r.x+m.pad,y:r.y+top,w:r.w-2*m.pad,h:r.h-top-m.pad}; }
/* animation state: per canvas and key; the value approaches the target at `rate` 1/s (snaps when time stands still or jumps) */
function dlsEase(g,key,target,T,rate){
  const k=g.canvas||g; let m=dlsSt.get(k); if(!m){ m={}; dlsSt.set(k,m); }
  let e=m[key]; if(!e||!(T>e.T)||T-e.T>0.5){ m[key]={v:target,T}; return target; }
  e.v+=(target-e.v)*(1-Math.exp(-(T-e.T)*(rate||10))); e.T=T; if(Math.abs(e.v-target)<1e-6*(1+Math.abs(target))) e.v=target; return e.v;
}
function dlsReg(name,fn){
  DL_SCENES[name]=function(g,r,S,C,p,T){
    if(!g||!r||!(r.w>20)||!(r.h>20)) return;
    S=S||{}; C=C||(typeof LRN!=="undefined"&&LRN.C)||{}; p=p||{}; T=dlsOk(T)?T:0;
    g.save();
    try{ g.beginPath(); g.rect(r.x,r.y,r.w,r.h); g.clip(); fn(g,r,S,C,p,T); }
    catch(e){ DL_SCENES._err=e; if(DL_SCENES._dbg) console.error("dls "+name,e); }
    g.restore();
  };
}
/* nice tick values for a range */
function dlsTicks(a,b,n){ return typeof kTicks==="function"?kTicks(a,b,n):[a,b]; }

/* =========================== bars =========================== */
dlsReg("bars",function(g,r,S,C,p,T){
  const m=dlsM(r), top=dlsTitle(g,r,m,p,S,C), q=dlsQ(r,m,top), it=(p.items||[]).slice(0,6), n=it.length; if(!n) return;
  const vals=it.map(o=>dlsNum(o.v)), explicit=it.map(o=>dlsOk(o.max)&&o.max>0?o.max:0);
  let hi=0, lo=0; vals.forEach((v,i)=>{ hi=Math.max(hi,v); lo=Math.min(lo,v); explicit[i]&&(hi=Math.max(hi,0)); });
  const cap=Math.max(...explicit,0), span0=Math.max(cap>0&&lo>=0?cap:hi-lo,1e-12), neg=lo<0;
  const zeroF=neg?(-lo)/(hi-lo):0, grow=1-Math.exp(-T*6);
  const bh=dlsCl(q.h/n*0.3,7,m.ph?12:20), rowH=Math.min(q.h/n,bh+m.fs*2.6+(m.ph?4:14)), y0=q.y+(q.h-rowH*n)/2;
  it.forEach((o,i)=>{
    const col=dlsCol(C,DLS_SEQ[i%DLS_SEQ.length]), v=vals[i], mx=explicit[i]||0, y=y0+i*rowH, by=y+m.fs*1.9, over=mx>0&&v>mx;
    const tr=dlsMix(C.panel,C.ink,0.07);
    g.fillStyle=tr; dlsRR(g,q.x,by,q.w,bh,bh/2); g.fill();
    let f0,f1;
    if(neg){ const sc=(hi-lo)||1; f0=zeroF; f1=zeroF+v/sc*grow; } else { const base=mx>0?mx:span0; f0=0; f1=dlsCl(v/base,0,1)*grow; }
    const x0=q.x+Math.min(f0,f1)*q.w, x1=q.x+Math.max(f0,f1)*q.w, wbar=Math.max(x1-x0,v!==0?bh:0);
    if(wbar>0){ const gr=g.createLinearGradient(x0,0,x0+wbar,0); gr.addColorStop(0,dlsMix(col,C.panel,0.28)); gr.addColorStop(1,col); g.fillStyle=gr; dlsRR(g,x0,by,wbar,bh,bh/2); g.fill(); }
    if(neg){ g.strokeStyle=C.muted; g.lineWidth=1; g.beginPath(); g.moveTo(q.x+zeroF*q.w,by-3); g.lineTo(q.x+zeroF*q.w,by+bh+3); g.stroke(); }
    if(over){ dlsT(g,"›",q.x+q.w-bh*0.5,by+bh/2,{c:C.panel,s:bh+2,w:700}); }
    const lab=dlsLab(o.l,S), val=dlsFmt(v)+(o.u?" "+dlsLab(o.u,S):"");
    const lw=dlsTW(g,lab,m.fs,500);
    dlsTF(g,lab,q.x+q.w,y+m.fs*0.85,q.w*0.66,{c:C.ink,s:m.fs,w:500,a:"right"});
    dlsTF(g,val,q.x,y+m.fs*0.85,Math.max(40,q.w-Math.min(lw,q.w*0.66)-10),{c:over?C.power:col,s:m.fs+0.5,w:600,a:"left",m:true});
  });
});

/* =========================== gauge =========================== */
dlsReg("gauge",function(g,r,S,C,p,T){
  const m=dlsM(r), top=dlsTitle(g,r,m,p,S,C), q=dlsQ(r,m,top);
  let v0=dlsNum(p.min,0), v1=dlsNum(p.max,100); if(v1<=v0) v1=v0+1; const raw=dlsNum(p.v,v0), v=dlsCl(raw,v0,v1);
  const R=Math.max(30,Math.min(q.w/2,q.h/2)-3), cx=q.x+q.w/2, cy=q.y+q.h/2;
  const a0=135*D2R, sw=270*D2R, ang=x=>a0+sw*dlsCl((x-v0)/(v1-v0),0,1);
  const face=dlsMix(C.panel,C.ink,0.045), zs=(p.zones||[]).filter(z=>dlsOk(z.a)&&dlsOk(z.b)), zc={ok:"hyd",warn:"fuel",bad:"power"};
  const vs=dlsEase(g,"gauge",v,T,14);
  g.save();
  g.fillStyle=dlsMix(C.panel,C.ink,0.09); g.beginPath(); g.arc(cx,cy,R+3,0,Math.PI*2); g.fill();
  g.fillStyle=face; g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.fill(); g.strokeStyle=C.line; g.lineWidth=1.2; g.stroke();
  const rr=R*0.86, tw=R*0.085;
  g.lineCap="butt"; g.lineWidth=tw; g.strokeStyle=dlsMix(face,C.ink,0.10); g.beginPath(); g.arc(cx,cy,rr,a0,a0+sw); g.stroke();
  let vc=C.accent;
  if(zs.length){
    zs.forEach(z=>{ const c=dlsCol(C,zc[z.c]||"accent"), A=ang(Math.min(z.a,z.b)), B=ang(Math.max(z.a,z.b)); if(B<=A) return;
      g.strokeStyle=dlsMix(face,c,0.30); g.beginPath(); g.arc(cx,cy,rr,A,B); g.stroke();
      const Bv=Math.min(B,ang(vs)); if(Bv>A){ g.strokeStyle=c; g.beginPath(); g.arc(cx,cy,rr,A,Bv); g.stroke(); }
      if(v>=Math.min(z.a,z.b)&&v<=Math.max(z.a,z.b)) vc=c; });
  } else { if(vs>v0){ g.strokeStyle=C.accent; g.beginPath(); g.arc(cx,cy,rr,a0,ang(vs)); g.stroke(); } }
  /* ticks and numbers */
  const nt=R<70?4:R<120?5:7; let tk=dlsTicks(v0,v1,nt).filter(x=>x>=v0-1e-9&&x<=v1+1e-9);
  const st=tk.length>1?tk[1]-tk[0]:(v1-v0)/4; if(!tk.length||Math.abs(tk[0]-v0)>st*0.45) tk.unshift(v0); if(Math.abs(tk[tk.length-1]-v1)>st*0.45) tk.push(v1);
  g.strokeStyle=C.muted; g.lineCap="round";
  for(let k=0;k<=tk.length-2;k++){ for(let j=1;j<4;j++){ const x=tk[k]+(tk[k+1]-tk[k])*j/4, a=ang(x); g.lineWidth=1; g.beginPath(); g.moveTo(cx+Math.cos(a)*R*0.745,cy+Math.sin(a)*R*0.745); g.lineTo(cx+Math.cos(a)*R*0.785,cy+Math.sin(a)*R*0.785); g.stroke(); } }
  tk.forEach(x=>{ const a=ang(x); g.lineWidth=1.5; g.beginPath(); g.moveTo(cx+Math.cos(a)*R*0.70,cy+Math.sin(a)*R*0.70); g.lineTo(cx+Math.cos(a)*R*0.79,cy+Math.sin(a)*R*0.79); g.stroke();
    dlsT(g,dlsFmt(x,p.d!=null&&p.d>0&&Math.abs(x-Math.round(x))>1e-9?Math.min(p.d,1):null),cx+Math.cos(a)*R*0.585,cy+Math.sin(a)*R*0.585,{c:C.muted,s:Math.max(8.5,Math.min(R*0.115,12)),m:true}); });
  /* readout */
  const fz=dlsCl(R*0.21,12,28), vtxt=dlsFmt(raw,p.d);
  dlsTF(g,vtxt,cx,cy+R*0.58,R*0.8,{c:vc,s:fz,w:600,m:true});
  if(p.u) dlsTF(g,dlsLab(p.u,S),cx,cy+R*0.58+fz*0.95,R*0.8,{c:C.muted,s:Math.max(9,fz*0.52)});
  /* needle */
  const an=ang(vs), nl=R*0.76, nb=R*0.045, ca=Math.cos(an), sa=Math.sin(an);
  g.save(); g.shadowColor="rgba(0,0,0,0.25)"; g.shadowBlur=3; g.shadowOffsetY=1;
  g.fillStyle=C.ink; g.beginPath(); g.moveTo(cx+ca*nl,cy+sa*nl); g.lineTo(cx-sa*nb,cy+ca*nb); g.lineTo(cx-ca*R*0.16,cy-sa*R*0.16); g.lineTo(cx+sa*nb,cy-ca*nb); g.closePath(); g.fill(); g.restore();
  dlsPt(g,cx,cy,R*0.075,C.ink); dlsPt(g,cx,cy,R*0.03,face);
  g.restore();
});

/* =========================== flow =========================== */
dlsReg("flow",function(g,r,S,C,p,T){
  const m=dlsM(r), top=dlsTitle(g,r,m,p,S,C), q=dlsQ(r,m,top);
  let W=(p.w||[]).map(v=>dlsOk(v)&&v>0?v:NaN); const n=W.length; if(n<2) return;
  for(let i=0;i<n;i++) if(!dlsOk(W[i])) W[i]=i?W[i-1]:(W.find(dlsOk)||1);
  const cont=p.cont!==false, vert=p.dir==="v", w0=W[0], wmax=Math.max(...W);
  let sp=dlsOk(p.v)&&p.v>0?p.v:1; sp=dlsCl(sp<=3?sp:3+Math.log2(sp/3)*0.5,0.12,6);
  const wi=u=>{ const x=dlsCl(u,0,1)*(n-1), i=Math.min(n-2,Math.floor(x)), t=x-i, s=(1-Math.cos(Math.PI*t))/2; return W[i]+(W[i+1]-W[i])*s; };
  const Lu=vert?q.h*0.82:q.w*0.84, Hm=vert?Math.min(q.w*0.5,q.h*0.4,190):Math.min(q.h*0.6,q.w*0.34,200);
  const ox=vert?q.x+q.w/2:q.x+q.w-Lu-2, oy=vert?q.y+q.h-Lu-2:q.y+q.h/2;
  const P=(u,v)=>vert?[ox+v,oy+u*Lu]:[ox+u*Lu,oy+v], hw=u=>Hm/2*wi(u)/wmax, rat=u=>cont?w0/wi(u):1;
  const K=56, tw=Math.max(4,Hm*0.08), top1=[],bot1=[],top2=[],bot2=[];
  for(let i=0;i<=K;i++){ const u=i/K, h=hw(u); top1.push(P(u,-h)); bot1.push(P(u,h)); top2.push(P(u,-h-tw)); bot2.push(P(u,h+tw)); }
  /* walls */
  g.fillStyle=dlsMix(C.panel,C.struct,0.30); dlsPoly(g,top2.concat(top1.slice().reverse()),true); g.fill(); dlsPoly(g,bot2.concat(bot1.slice().reverse()),true); g.fill();
  /* interior tinted by the local speed */
  const base=dlsMix(C.panel,C.ctrl,0.13), hot=dlsMix(C.panel,C.power,0.42);
  for(let i=0;i<K;i++){ const u=(i+0.5)/K, t=dlsCl((rat(u)-1)/2.2,0,1); g.fillStyle=dlsMix(base,hot,t);
    dlsPoly(g,[top1[i],top1[i+1],bot1[i+1],bot1[i]],true); g.fill(); g.strokeStyle=g.fillStyle; g.lineWidth=0.8; g.stroke(); }
  g.strokeStyle=C.ink; g.lineWidth=m.lw*1.25; g.lineJoin="round"; dlsPoly(g,top1); g.stroke(); dlsPoly(g,bot1); g.stroke();
  /* travel time table: particles are released at equal time steps, so they crowd where the flow is slow */
  const NT=72, tau=[0]; for(let i=1;i<=NT;i++){ const u=(i-0.5)/NT; tau.push(tau[i-1]+(cont?wi(u)/w0:1)/NT); }
  const tot=tau[NT], uOf=t=>{ let a=0,b=NT; while(b-a>1){ const c=(a+b)>>1; if(tau[c]<=t) a=c; else b=c; } const f=(t-tau[a])/Math.max(tau[b]-tau[a],1e-9); return (a+f)/NT; };
  const lanes=m.ph?4:6, per=m.ph?7:10, dt=tot/per, rate=sp/4.5, lag=0.075*Math.min(1.5,Math.max(0.6,sp)), lw=m.ph?1.8:2.3;
  g.lineCap="round";
  for(let j=0;j<lanes;j++){ const f=-0.8+1.6*j/(lanes-1);
    for(let k=0;k<per;k++){ const t=((T*rate+k*dt+j*dt*0.37)%tot+tot)%tot, u=uOf(t), u2=uOf(Math.max(0,t-lag));
      const a=P(u,f*hw(u)), b=P(u2,f*hw(u2)), fade=Math.min(1,u/0.06,(1-u)/0.06);
      g.strokeStyle=dlsAlpha(dlsMix(C.ctrl,C.power,dlsCl((rat(u)-1)/2.2,0,1)),0.95*dlsCl(fade,0,1)); g.lineWidth=lw; g.beginPath(); g.moveTo(b[0],b[1]); g.lineTo(a[0],a[1]); g.stroke(); } }
  /* speed multiples at the stations (only where there is room) */
  if(cont){ const ord=[...Array(n).keys()], keep=[]; ord.sort((a,b)=>(a===0||a===n-1?-1:0)-(b===0||b===n-1?-1:0)||W[a]-W[b]);
    const need=vert?m.fs*2.6:m.fs*5.2, pts=[]; ord.forEach(i=>{ const pos=i/(n-1)*Lu; if(pts.every(s=>Math.abs(s-pos)>=need)){ pts.push(pos); keep.push(i); } });
    keep.forEach(i=>{ const u=i/(n-1), h=hw(u)+tw+8, s="×"+dlsFmt(+(w0/W[i]).toPrecision(2)); const a=vert?P(u,h+2):P(u,-h);
      const col=dlsMix(C.ctrl,C.power,dlsCl((w0/W[i]-1)/2.2,0,1)); const lab=dlsTW(g,s,m.fm,600,true);
      if(vert) dlsT(g,s,a[0]+lab/2+2,a[1],{c:col,s:m.fm,w:600,m:true}); else dlsT(g,s,a[0],a[1]-m.fm*0.6,{c:col,s:m.fm,w:600,m:true}); }); }
  /* flow direction chevron at the inlet */
  const A=P(0,0); if(vert) dlsArrow(g,A[0],A[1]-22,A[0],A[1]-5,C.muted,2,7); else dlsArrow(g,A[0]-26,A[1],A[0]-6,A[1],C.muted,2,7);
});

/* =========================== foil =========================== */
/* Flow around a thin cambered section: a vortex lattice on the camber line (Kutta condition built in) plus a source sheet for the thickness, in wind axes
   (chord 1, leading edge at the origin). Streamlines are traced once per parameter set and cached; the animation only slides particles along them. */
let dlsFoilKey="", dlsFoilVal=null;
function dlsFoilModel(a,mc,pp,th,fl,xs,xe,ymax,dy){
  const key=[a,mc,pp,th,fl,xs,xe,ymax,dy].map(v=>Math.round(v*1000)).join("|"); if(key===dlsFoilKey) return dlsFoilVal;
  const al=a*D2R, E=fl?0.25:0, fd=fl*D2R, N=20, hx=1-E;
  const yc=x=>mc===0?0:(x<pp?mc/(pp*pp)*(2*pp*x-x*x):mc/((1-pp)*(1-pp))*((1-2*pp)+2*pp*x-x*x));
  const yt=x=>5*th*(0.2969*Math.sqrt(Math.max(x,0))-0.126*x-0.3516*x*x+0.2843*x**3-0.1036*x**4), hy=yc(hx);
  const wind=(x,y)=>{ if(E&&x>hx){ const dx=x-hx, dyy=y-hy, c=Math.cos(-fd), s=Math.sin(-fd); x=hx+dx*c-dyy*s; y=hy+dx*s+dyy*c; } return [x*Math.cos(al)+y*Math.sin(al),-x*Math.sin(al)+y*Math.cos(al)]; };
  const cp=[]; for(let j=0;j<=N;j++){ const x=0.5-0.5*Math.cos(Math.PI*j/N); cp.push(wind(x,yc(x))); }
  const vx=[],vy=[],cx=[],cy=[],nx=[],ny=[];
  for(let j=0;j<N;j++){ const A=cp[j], B=cp[j+1], L=Math.hypot(B[0]-A[0],B[1]-A[1])||1e-9, tx=(B[0]-A[0])/L, ty=(B[1]-A[1])/L;
    vx.push(A[0]+0.25*(B[0]-A[0])); vy.push(A[1]+0.25*(B[1]-A[1])); cx.push(A[0]+0.75*(B[0]-A[0])); cy.push(A[1]+0.75*(B[1]-A[1])); nx.push(-ty); ny.push(tx); }
  const ev=2e-4, Mx=[]; for(let i=0;i<N;i++){ const row=[]; for(let j=0;j<N;j++){ const dx=cx[i]-vx[j], dyy=cy[i]-vy[j], k=1/(2*Math.PI*(dx*dx+dyy*dyy+1e-12)); row.push((-dyy*nx[i]+dx*ny[i])*k); } row.push(-nx[i]); Mx.push(row); }
  for(let i=0;i<N;i++){ let mx=i; for(let k=i+1;k<N;k++) if(Math.abs(Mx[k][i])>Math.abs(Mx[mx][i])) mx=k; const tmp=Mx[i]; Mx[i]=Mx[mx]; Mx[mx]=tmp;
    const d=Mx[i][i]||1e-12; for(let k=i+1;k<N;k++){ const f=Mx[k][i]/d; if(f) for(let j=i;j<=N;j++) Mx[k][j]-=f*Mx[i][j]; } }
  const G=new Array(N).fill(0); for(let i=N-1;i>=0;i--){ let s=Mx[i][N]; for(let j=i+1;j<N;j++) s-=Mx[i][j]*G[j]; G[i]=s/(Mx[i][i]||1e-12); }
  const CL=-2*G.reduce((s,x)=>s+x,0);
  const sx=[],sy=[],sq=[], NS=26; for(let k=0;k<NS;k++){ const x1=0.5-0.5*Math.cos(Math.PI*k/NS), x2=0.5-0.5*Math.cos(Math.PI*(k+1)/NS), xm=(x1+x2)/2, w=wind(xm,yc(xm)); sx.push(w[0]); sy.push(w[1]); sq.push(2*(yt(x2)-yt(x1))); }
  const vel=(x,y)=>{ let u=1,v=0; for(let j=0;j<N;j++){ const dx=x-vx[j], dyy=y-vy[j], k=G[j]/(2*Math.PI*(dx*dx+dyy*dyy+ev)); u-=dyy*k; v+=dx*k; }
    for(let j=0;j<NS;j++){ const dx=x-sx[j], dyy=y-sy[j], k=sq[j]/(2*Math.PI*(dx*dx+dyy*dyy+4e-4)); u+=dx*k; v+=dyy*k; } return [u,v]; };
  const up=[],lo=[]; for(let i=0;i<=40;i++){ const x=0.5-0.5*Math.cos(Math.PI*i/40), c=yc(x), t=yt(x); up.push(wind(x,c+t)); lo.push(wind(x,c-t)); }
  const poly=up.concat(lo.reverse()), inside=(x,y)=>{ if(x<-0.06||x>1.15||y<-0.5||y>0.5) return false; let c=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){ const a=poly[i], b=poly[j]; if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]) c=!c; } return c; };
  const lines=[], ds=0.018, ks=Math.floor(ymax/dy);
  for(let k=-ks;k<ks;k++){ const y0=(k+0.5)*dy, pts=[[xs,y0]], sp=[1], tm=[0]; let x=xs,y=y0,t=0;
    for(let s=0;s<700;s++){ const v1=vel(x,y), n1=Math.hypot(v1[0],v1[1])||1, xm=x+0.5*ds*v1[0]/n1, ym=y+0.5*ds*v1[1]/n1, v2=vel(xm,ym), n2=Math.hypot(v2[0],v2[1])||1;
      x+=ds*v2[0]/n2; y+=ds*v2[1]/n2; if(inside(x,y)) break; t+=ds/n2; pts.push([x,y]); sp.push(n2); tm.push(t); if(x>xe||Math.abs(y)>ymax+0.8) break; }
    if(pts.length>12) lines.push({pts,sp,tm}); }
  dlsFoilKey=key; return dlsFoilVal={lines,CL};
}
dlsReg("foil",function(g,r,S,C,p,T){
  const m=dlsM(r), top=dlsTitle(g,r,m,p,S,C), q=dlsQ(r,m,top);
  const a=dlsCl(dlsNum(p.a),-30,40), mc=dlsCl(dlsNum(p.m,0),0,12)/100, pp=dlsCl(dlsNum(p.p,0.4),0.1,0.9), th=dlsCl(dlsNum(p.th,12),2,40)/100, fl=dlsCl(dlsNum(p.flap,0),-40,40), flow=p.flow!==false;
  const ch=Math.min(q.w*0.56,q.h*1.2), ox=q.x+q.w/2-0.5*ch*Math.cos(a*D2R), oy=q.y+q.h/2-0.5*ch*Math.sin(a*D2R);
  const sw=m.ph?1.7:2.2, E=fl?0.25:0;
  let mod=null;
  g.save(); g.beginPath(); g.rect(r.x,q.y-2,r.w,r.h); g.clip();
  if(flow){ const xs=(q.x-ox)/ch, xe=(q.x+q.w-ox)/ch, ymax=(q.h/2+Math.abs(Math.sin(a*D2R))*ch*0.5)/ch, dy=dlsCl(21/ch,0.055,0.2);
    mod=dlsFoilModel(a,mc,pp,th,fl,xs,xe,ymax,dy);
    const col=dlsMix(C.ctrl,C.panel,0.15);
    mod.lines.forEach(L=>{ g.strokeStyle=dlsAlpha(col,0.28); g.lineWidth=1.1; g.beginPath(); L.pts.forEach((pt,i)=>{ const X=ox+pt[0]*ch, Y=oy-pt[1]*ch; i?g.lineTo(X,Y):g.moveTo(X,Y); }); g.stroke(); });
    g.lineCap="round";
    mod.lines.forEach((L,li)=>{ const Lc=L.tm[L.tm.length-1], np=Math.max(2,Math.round(Lc/0.5)), per=Lc/np, n=L.pts.length;
      for(let k=0;k<np;k++){ const t=((T*0.34+k*per+li*0.17)%Lc+Lc)%Lc, t0=Math.max(0,t-0.075);
        let lo=0,hi=n-1; while(hi-lo>1){ const c=(lo+hi)>>1; if(L.tm[c]<=t) lo=c; else hi=c; } const f=(t-L.tm[lo])/Math.max(L.tm[hi]-L.tm[lo],1e-9);
        let l2=0,h2=n-1; while(h2-l2>1){ const c=(l2+h2)>>1; if(L.tm[c]<=t0) l2=c; else h2=c; } const f2=(t0-L.tm[l2])/Math.max(L.tm[h2]-L.tm[l2],1e-9);
        const x1=L.pts[lo][0]+(L.pts[hi][0]-L.pts[lo][0])*f, y1=L.pts[lo][1]+(L.pts[hi][1]-L.pts[lo][1])*f, x0=L.pts[l2][0]+(L.pts[h2][0]-L.pts[l2][0])*f2, y0=L.pts[l2][1]+(L.pts[h2][1]-L.pts[l2][1])*f2;
        const sp=L.sp[lo], fade=Math.min(1,t/0.25,(Lc-t)/0.25);
        g.strokeStyle=dlsAlpha(dlsMix(C.ctrl,C.power,dlsCl((sp-1)/0.55,0,1)),0.95*dlsCl(fade,0,1)); g.lineWidth=sw; g.beginPath(); g.moveTo(ox+x0*ch,oy-y0*ch); g.lineTo(ox+x1*ch,oy-y1*ch); g.stroke(); } });
  }
  g.restore();
  const P=kFoil(g,ox,oy,ch,a,C,{m:mc,p:pp,t:th,E,fd:fl,fill:dlsMix(C.panel,C.struct,0.5),camber:!flow});
  g.lineWidth=m.lw;
  /* angle of attack: freestream reference and the chord line, both extended ahead of the nose */
  const ref=ch*0.3, ca=Math.cos(a*D2R), sa=Math.sin(a*D2R);
  g.setLineDash([4,3]); g.strokeStyle=C.muted; g.lineWidth=1; g.beginPath(); g.moveTo(ox,oy); g.lineTo(ox-ref,oy); g.moveTo(ox,oy); g.lineTo(ox-ref*ca,oy-ref*sa); g.stroke(); g.setLineDash([]);
  if(Math.abs(a)>0.4){ const ra=ref*0.72; g.strokeStyle=C.accent; g.lineWidth=1.6; g.beginPath(); g.arc(ox,oy,ra,Math.PI,Math.PI+a*D2R,a<0); g.stroke();
    const mid=Math.PI+a*D2R/2, at="α = "+dlsFmt(a,Math.abs(a-Math.round(a))<0.05?0:1)+"°", aw=dlsTW(g,at,m.fs,600,true)/2+6;
    dlsPlate(g,at,Math.max(r.x+aw+3,ox+Math.cos(mid)*(ra+m.fs*2.1)),oy+Math.sin(mid)*(ra+m.fs*2.1)-(m.ph?m.fs*0.6:0),C,{c:C.accent,s:m.fs,w:600,m:true}); }
  /* lift arrow at the quarter chord, scaled by the model lift (it fades after the stall angle) */
  const CL=mod?mod.CL:(2*Math.PI*(a*D2R+mc*2.0)); let Lk=CL; const stall=Math.abs(a)>15;
  if(stall) Lk*=Math.max(0.35,1-(Math.abs(a)-15)*0.09);
  const qx=ox+0.25*ch*ca, qy=oy+0.25*ch*sa, Lp=dlsCl(Lk,-1.6,2.6)*q.h*0.15;
  if(Math.abs(Lp)>6){ const c=dlsCol(C,"ctrl"); dlsArrow(g,qx,qy,qx,qy-Lp,c,2.6,9); dlsPlate(g,"L",qx+(m.ph?10:14),qy-Lp*0.92,C,{c,s:m.fs+1,w:700,m:true}); }
  dlsArrow(g,q.x+4,q.y+m.fs*1.1,q.x+4+(m.ph?26:34),q.y+m.fs*1.1,C.muted,1.6,6); dlsPlate(g,"V∞",q.x+10+(m.ph?26:34),q.y+m.fs*1.1,C,{c:C.muted,s:m.fs,w:600,a:"left",m:true});
  if(stall) dlsPlate(g,"انفصال الجريان",q.x+q.w-4,q.y+m.fs*1.2,C,{c:C.power,s:m.fm,w:600,a:"right",line:dlsAlpha(C.power,0.5)});
});

/* ---- side view of an airliner (nose to the left, length 1 around the origin), with the named parts available for highlighting ---- */
function dlsPlaneSide(g,cx,cy,len,pitch,C,o){
  o=o||{}; const hi=o.hi||"none", four=!!o.four, dim=hi!=="none";
  const base=dlsMix(C.panel,C.struct,0.16), mid=dlsMix(C.panel,C.struct,0.30), dark=dlsMix(C.panel,C.struct,0.48), onC=dlsMix(C.panel,C.accent,0.5);
  const fill=n=>hi===n?onC:(n==="eng"?dark:n==="wing"||n==="flaps"||n==="tail"||n==="fin"?mid:base);
  g.save(); g.translate(cx,cy); if(o.flip) g.scale(-1,1); g.rotate((pitch||0)*D2R); g.scale(len,len); g.translate(0,0.04); g.lineJoin="round";
  const lw=(o.lw||1.4)/len, part=(n,draw)=>{ g.beginPath(); draw(); g.fillStyle=fill(n); g.fill(); g.strokeStyle=hi===n?C.accent:C.ink; g.lineWidth=hi===n?lw*1.9:lw; g.globalAlpha=dim&&hi!==n?0.9:1; g.stroke(); g.globalAlpha=1; };
  const fus=()=>{ g.moveTo(-0.5,0.004); g.bezierCurveTo(-0.5,-0.03,-0.462,-0.052,-0.41,-0.056); g.lineTo(0.18,-0.054); g.bezierCurveTo(0.30,-0.05,0.40,-0.03,0.5,-0.012); g.lineTo(0.5,0.008); g.bezierCurveTo(0.40,0.03,0.30,0.046,0.18,0.052); g.lineTo(-0.36,0.054); g.bezierCurveTo(-0.455,0.05,-0.5,0.03,-0.5,0.004); g.closePath(); };
  /* gear (behind the body) */
  const gearC=hi==="gear"?C.accent:C.ink; g.strokeStyle=gearC; g.lineWidth=lw*(hi==="gear"?2:1.3); g.fillStyle=gearC;
  g.beginPath(); g.moveTo(-0.34,0.05); g.lineTo(-0.34,0.104); g.moveTo(0.05,0.046); g.lineTo(0.05,0.1); g.stroke();
  [[-0.34,0.011],[0.034,0.012],[0.066,0.012]].forEach(w=>{ g.beginPath(); g.arc(w[0],0.108,w[1],0,Math.PI*2); g.fill(); });
  part("fin",()=>{ g.moveTo(0.27,-0.054); g.lineTo(0.405,-0.195); g.lineTo(0.46,-0.195); g.lineTo(0.487,-0.03); g.closePath(); });
  part("tail",()=>{ g.moveTo(0.33,-0.006); g.lineTo(0.465,-0.018); g.lineTo(0.5,-0.004); g.lineTo(0.42,0.01); g.closePath(); });
  part("fuselage",fus);
  /* windows */
  g.fillStyle=dlsMix(C.panel,C.ink,hi==="fuselage"?0.2:0.5); for(let x=-0.33;x<0.27;x+=0.03){ g.beginPath(); g.arc(x,-0.024,0.0058,0,Math.PI*2); g.fill(); }
  g.beginPath(); g.moveTo(-0.455,-0.036); g.lineTo(-0.41,-0.05); g.lineTo(-0.388,-0.05); g.lineTo(-0.388,-0.032); g.lineTo(-0.44,-0.03); g.closePath(); g.fillStyle=dlsMix(C.panel,C.ink,0.55); g.fill();
  if(hi==="nose"){ g.beginPath(); g.moveTo(-0.5,0.004); g.bezierCurveTo(-0.5,-0.03,-0.462,-0.052,-0.41,-0.056); g.lineTo(-0.38,-0.056); g.lineTo(-0.38,0.054); g.lineTo(-0.36,0.054); g.bezierCurveTo(-0.455,0.05,-0.5,0.03,-0.5,0.004); g.closePath(); g.fillStyle=dlsAlpha(C.accent,0.5); g.fill(); g.strokeStyle=C.accent; g.lineWidth=lw*1.9; g.stroke(); }
  /* the engine hangs on a pylon under the wing; the near wing is drawn after it so it covers the pylon root */
  const eng=(ex)=>{ part("eng",()=>{ g.moveTo(ex-0.06,0.066); g.bezierCurveTo(ex-0.068,0.082,ex-0.068,0.1,ex-0.06,0.112); g.lineTo(ex+0.04,0.108); g.bezierCurveTo(ex+0.062,0.1,ex+0.062,0.082,ex+0.04,0.068); g.closePath(); }); g.beginPath(); g.ellipse(ex-0.059,0.089,0.0075,0.021,0,0,Math.PI*2); g.fillStyle=dlsMix(C.panel,C.ink,0.6); g.fill(); };
  g.beginPath(); g.moveTo(-0.02,0.04); g.lineTo(0.02,0.04); g.lineTo(0.01,0.07); g.lineTo(-0.03,0.07); g.closePath(); g.fillStyle=mid; g.fill(); g.strokeStyle=C.ink; g.lineWidth=lw; g.stroke();
  eng(-0.01);
  part("wing",()=>{ g.moveTo(-0.07,0.028); g.lineTo(0.09,0.028); g.lineTo(0.268,0.082); g.lineTo(0.19,0.088); g.closePath(); });
  if(hi==="flaps"||hi==="wing"){ /* the flap strip along the trailing edge of the inner wing */
    const A=[0.09,0.028], B=[0.268,0.082], Cc=[-0.07,0.028], D=[0.19,0.088], lp=(P,Q,t)=>[P[0]+(Q[0]-P[0])*t,P[1]+(Q[1]-P[1])*t];
    const t1=lp(A,B,0.12), t2=lp(A,B,0.62), c1=lp(t1,lp(Cc,D,0.12),0.3), c2=lp(t2,lp(Cc,D,0.62),0.3);
    g.beginPath(); g.moveTo(t1[0],t1[1]); g.lineTo(t2[0],t2[1]); g.lineTo(c2[0],c2[1]); g.lineTo(c1[0],c1[1]); g.closePath(); g.fillStyle=hi==="flaps"?onC:dark; g.fill(); g.strokeStyle=hi==="flaps"?C.accent:C.ink; g.lineWidth=hi==="flaps"?lw*1.9:lw*0.8; g.stroke(); }
  if(four){ g.save(); g.translate(0.06,0.014); g.scale(0.82,0.82); eng(0.1); g.restore(); }
  /* beacon and nav light dots keep the silhouette alive */
  g.fillStyle=dlsAlpha(C.power,0.9); g.beginPath(); g.arc(0.0,0.052,0.006,0,Math.PI*2); g.fill();
  g.restore();
}

/* =========================== forces =========================== */
dlsReg("forces",function(g,r,S,C,p,T){
  const m=dlsM(r), top=dlsTitle(g,r,m,p,S,C), q=dlsQ(r,m,top), cx=q.x+q.w/2, cy=q.y+q.h/2, mn=Math.min(q.w,q.h);
  const vs=(p.vec||[]).map((v,i)=>({x:dlsNum(v.x),y:dlsNum(v.y),l:dlsLab(v.l,S),c:dlsCol(C,v.c||DLS_SEQ[(i+1)%DLS_SEQ.length])}));
  let sx=0,sy=0,M=0; vs.forEach(v=>{ sx+=v.x; sy+=v.y; M=Math.max(M,Math.hypot(v.x,v.y)); });
  /* the body, small, at the centre; rx/ry = half size of its bounding box (where the arrows start) */
  const bs=mn*0.12, body=p.body||"plane", edge=C.ink; let rx=bs, ry=bs;
  g.save(); g.lineJoin="round";
  if(body==="plane"){ rx=mn*(m.ph?0.15:0.17); ry=mn*0.045; dlsPlaneSide(g,cx,cy-mn*0.012,mn*(m.ph?0.3:0.34),0,C,{flip:true,lw:1.2}); }
  else if(body==="wing"){ rx=bs*1.6; ry=bs*0.28; kFoil(g,cx-bs*1.6,cy+bs*0.1,bs*3.2,4,C,{m:0.03,p:0.4,t:0.12,fill:dlsMix(C.panel,C.struct,0.5)}); }
  else if(body==="block"){ const w=bs*2.4,h=bs*1.5; rx=w/2; ry=h/2; g.strokeStyle=C.muted; g.lineWidth=1.4; g.beginPath(); g.moveTo(cx-w*1.1,cy+h/2); g.lineTo(cx+w*1.1,cy+h/2); g.stroke();
    g.fillStyle=dlsMix(C.panel,C.struct,0.35); g.strokeStyle=edge; dlsRR(g,cx-w/2,cy-h/2,w,h,3); g.fill(); g.stroke(); for(let i=-6;i<8;i++){ g.strokeStyle=dlsAlpha(C.muted,0.6); g.lineWidth=1; g.beginPath(); g.moveTo(cx-w*1.1+i*w*0.18,cy+h/2+1); g.lineTo(cx-w*1.1+i*w*0.18-5,cy+h/2+6); g.stroke(); } }
  else { const w=bs*2,h=bs*2; g.fillStyle=dlsMix(C.panel,C.struct,0.35); g.strokeStyle=edge; g.lineWidth=1.4; dlsRR(g,cx-w/2,cy-h/2,w,h,4); g.fill(); g.stroke();
    g.strokeStyle=dlsAlpha(C.ink,0.35); g.beginPath(); g.moveTo(cx-w/2,cy-h/6); g.lineTo(cx+w/2,cy-h/6); g.stroke(); }
  g.restore();
  if(!(M>0)){ dlsT(g,"لا توجد قوى مؤثرة",cx,cy+mn*0.3,{c:C.muted,s:m.fs}); return; }
  /* labels (two lines when they are wide), then fit the scale so that every label stays inside the rectangle */
  const fsz=m.fs, minL=m.ph?20:26;
  const net=Math.hypot(sx,sy)>0.035*M&&vs.length>1; if(net) vs.push({x:sx,y:sy,l:"المحصلة",c:C.ink,net:true});
  const lab=vs.map(v=>{ const t=v.l, w1=dlsTW(g,t,fsz,500,!dlsAr(t)), ws=t.split(" "); let lines=[t], w=w1;
    if(w1>Math.max(r.w*0.2,r.w/2-rx-minL-14)&&ws.length>1){ let best=null; for(let k=1;k<ws.length;k++){ const A=ws.slice(0,k).join(" "), B=ws.slice(k).join(" "), wa=dlsTW(g,A,fsz,500,!dlsAr(A)), wb=dlsTW(g,B,fsz,500,!dlsAr(B)), mx=Math.max(wa,wb); if(!best||mx<best.w) best={A,B,w:mx}; } lines=[best.A,best.B]; w=best.w; }
    return {lines,w:w+6,h:lines.length*(fsz+2)+4}; });
  const chip=!net&&vs.length>1, lim={x0:r.x+3,x1:r.x+r.w-3,y0:r.y+top+1,y1:r.y+r.h-3-(chip?m.fs*2:0)};
  const box=(v,k,i)=>{ const L=Math.hypot(v.x,v.y); if(!(L>0)) return null; const ux=v.x/L, uy=-v.y/L, e=Math.min(rx/Math.max(Math.abs(ux),1e-9),ry/Math.max(Math.abs(uy),1e-9)), len=Math.max(minL,L*k),
      sx0=cx+ux*e, sy0=cy+uy*e, tx=cx+ux*(e+len), ty=cy+uy*(e+len), tw=lab[i].w, th=lab[i].h;
    if(Math.abs(ux)>=Math.abs(uy)*0.75) return {sx0,sy0,tx,ty,x:ux>=0?tx+7:tx-7-tw,y:ty-th/2,w:tw,h:th}; return {sx0,sy0,tx,ty,x:tx-tw/2,y:uy<0?ty-7-th:ty+7,w:tw,h:th}; };
  let k=0.55*mn/M;
  for(let it=0;it<60;it++){ let ok=true; vs.forEach((v,i)=>{ const b=box(v,k,i); if(b&&(b.x<lim.x0||b.x+b.w>lim.x1||b.y<lim.y0||b.y+b.h>lim.y1)) ok=false; }); if(ok) break; k*=0.93; }
  const placed=vs.map((v,i)=>box(v,k,i));
  for(let i=0;i<placed.length;i++) for(let j=0;j<i;j++){ const a=placed[i], b=placed[j]; if(a&&b&&a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h){ a.y+=(a.y>=b.y?1:-1)*(Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)+2); } }
  vs.forEach((v,i)=>{ const b=placed[i]; if(!b) return; const lw=m.ph?2.2:2.8;
    if(v.net){ g.save(); g.setLineDash([6,4]); g.strokeStyle=C.ink; g.lineWidth=1.6; g.beginPath(); g.moveTo(b.sx0,b.sy0); g.lineTo(b.tx,b.ty); g.stroke(); g.restore(); const a=Math.atan2(b.ty-b.sy0,b.tx-b.sx0); g.fillStyle=C.ink; g.beginPath(); g.moveTo(b.tx,b.ty); g.lineTo(b.tx-9*Math.cos(a-0.42),b.ty-9*Math.sin(a-0.42)); g.lineTo(b.tx-9*Math.cos(a+0.42),b.ty-9*Math.sin(a+0.42)); g.closePath(); g.fill(); }
    else { dlsPt(g,b.sx0,b.sy0,2.8,v.c); dlsArrow(g,b.sx0,b.sy0,b.tx,b.ty,v.c,lw,m.ph?9:11); }
    const ls=lab[i].lines, lh=fsz+2; ls.forEach((t,j)=>dlsTF(g,t,b.x+b.w/2,b.y+b.h/2+(j-(ls.length-1)/2)*lh,b.w,{c:v.net?C.ink:dlsMix(v.c,C.ink,0.25),s:fsz,w:v.net?500:600,m:!dlsAr(t)})); });
  if(chip) dlsPlate(g,"القوى متزنة: المحصلة تساوي صفراً",q.x+q.w/2,r.y+r.h-m.fs*1.1,C,{c:dlsCol(C,"hyd"),s:m.fm,w:600,line:dlsAlpha(C.hyd,0.45)});
});

/* =========================== chain =========================== */
dlsReg("chain",function(g,r,S,C,p,T){
  const m=dlsM(r), top=dlsTitle(g,r,m,p,S,C), q=dlsQ(r,m,top), N=(p.nodes||[]).slice(0,7), n=N.length; if(n<2) return;
  const fb=!!p.fb, hasV=N.some(o=>o.v!==undefined&&o.v!==null), fs=m.ph?m.fs:m.fs*1.1, gap=m.ph?15:26, minBW=m.ph?64:100;
  let per=Math.max(1,Math.floor((q.w+gap)/(minBW+gap))), rows=Math.ceil(n/per); per=Math.ceil(n/rows);
  const fbH=fb?fs*2.6:0, rg=fs*2.4;
  let bh=Math.max(hasV?fs*(m.ph?4.4:5.4):fs*(m.ph?3.1:4),36); const avail=q.h-fbH-(rows-1)*rg; if(rows*bh>avail) bh=Math.max(30,avail/rows);
  const lm=fb&&rows>1?12:0, bw=Math.min(m.ph?150:170,(q.w-lm-(per-1)*gap)/per), tot=rows*bh+(rows-1)*rg+fbH, y0=q.y+Math.max(0,(q.h-tot)/2);
  const xs=q.x+lm+Math.max(0,(q.w-lm-(per*bw+(per-1)*gap))/2);
  const B=N.map((o,i)=>{ const row=Math.floor(i/per), col=i%per; return {x:xs+col*(bw+gap),y:y0+row*(bh+rg),o,row,col}; });
  /* hops between consecutive boxes (polylines) for the arrows and the travelling pulse */
  const hops=[]; for(let i=0;i<n-1;i++){ const a=B[i], b=B[i+1]; if(a.row===b.row) hops.push([[a.x+bw,a.y+bh/2],[b.x,b.y+bh/2]]);
    else hops.push([[a.x+bw/2,a.y+bh],[a.x+bw/2,a.y+bh+rg/2],[b.x+bw/2,a.y+bh+rg/2],[b.x+bw/2,b.y]]); }
  const hopLen=hops.map(h=>{ let L=0; for(let i=1;i<h.length;i++) L+=Math.hypot(h[i][0]-h[i-1][0],h[i][1]-h[i-1][1]); return L; });
  const per2=2.6+n*0.55, s=(T%per2)/per2*(n+0.4)-0.2, act=dlsCl(Math.round(s),0,n-1);
  hops.forEach((h,i)=>{ g.strokeStyle=dlsMix(C.panel,C.ink,0.45); g.lineWidth=1.5; g.lineJoin="round"; dlsPoly(g,h.slice(0,-1).concat([[h[h.length-1][0],h[h.length-1][1]]])); g.stroke();
    const e=h[h.length-1], a=h[h.length-2]; const ang=Math.atan2(e[1]-a[1],e[0]-a[0]); g.fillStyle=dlsMix(C.panel,C.ink,0.55); g.beginPath(); g.moveTo(e[0],e[1]); g.lineTo(e[0]-8*Math.cos(ang-0.42),e[1]-8*Math.sin(ang-0.42)); g.lineTo(e[0]-8*Math.cos(ang+0.42),e[1]-8*Math.sin(ang+0.42)); g.closePath(); g.fill(); });
  /* feedback path */
  if(fb){ const a=B[n-1], b=B[0], yb=B[n-1].y+bh+fbH*0.62; g.strokeStyle=dlsMix(C.panel,C.power,0.8); g.lineWidth=1.5; g.setLineDash([5,3]); g.beginPath();
    if(rows===1){ g.moveTo(a.x+bw/2,a.y+bh); g.lineTo(a.x+bw/2,yb); g.lineTo(b.x+bw/2,yb); g.lineTo(b.x+bw/2,b.y+bh+4); }
    else { const xl=q.x+2; g.moveTo(a.x+bw/2,a.y+bh); g.lineTo(a.x+bw/2,yb); g.lineTo(xl,yb); g.lineTo(xl,b.y+bh/2); g.lineTo(b.x-4,b.y+bh/2); }
    g.stroke(); g.setLineDash([]); const ex=rows===1?b.x+bw/2:b.x-1, ey=rows===1?b.y+bh+1:b.y+bh/2, ang=rows===1?-Math.PI/2:0;
    g.fillStyle=dlsMix(C.panel,C.power,0.8); g.beginPath(); g.moveTo(ex,ey); g.lineTo(ex-8*Math.cos(ang-0.42),ey-8*Math.sin(ang-0.42)); g.lineTo(ex-8*Math.cos(ang+0.42),ey-8*Math.sin(ang+0.42)); g.closePath(); g.fill();
    dlsPlate(g,"تغذية راجعة",rows===1?(a.x+b.x)/2+bw/2:q.x+q.w/2,yb,C,{c:C.power,s:m.fm,w:600}); }
  /* boxes */
  B.forEach((b,i)=>{ const on=i===act, o=b.o, lab=dlsLab(o.l,S), hasv=o.v!==undefined&&o.v!==null;
    g.save(); if(on){ g.shadowColor=dlsAlpha(C.accent,0.5); g.shadowBlur=10; }
    g.fillStyle=dlsMix(C.panel,C.accent,on?0.18:0.07); dlsRR(g,b.x,b.y,bw,bh,9); g.fill(); g.restore();
    g.strokeStyle=on?C.accent:dlsMix(C.panel,C.ink,0.4); g.lineWidth=on?2:1.3; dlsRR(g,b.x,b.y,bw,bh,9); g.stroke();
    const cxm=b.x+bw/2, words=lab.split(" "); let lines=[lab], sz=fs;
    if(dlsTW(g,lab,sz,600)>bw-10&&words.length>1){ let best=null; for(let k=1;k<words.length;k++){ const a=words.slice(0,k).join(" "), c=words.slice(k).join(" "), w=Math.max(dlsTW(g,a,sz,600),dlsTW(g,c,sz,600)); if(!best||w<best.w) best={a,c,w}; } lines=[best.a,best.c]; }
    const lh=sz*1.25, tyc=hasv?b.y+bh*0.33:b.y+bh/2, ly=tyc-(lines.length-1)*lh/2;
    lines.forEach((t,k)=>dlsTF(g,t,cxm,ly+k*lh,bw-10,{c:C.ink,s:sz,w:600}));
    if(hasv){ const vt=dlsFmt(o.v)+(o.u?" "+dlsLab(o.u,S):""); dlsTF(g,vt,cxm,b.y+bh*(lines.length>1?0.8:0.72),bw-10,{c:C.accent,s:fs+1,w:600,m:true}); } });
  /* pulse */
  if(s>=0&&s<n-1){ const h=Math.floor(s), u=s-h, hp=hops[h]; let d=u*hopLen[h]; for(let i=1;i<hp.length;i++){ const L=Math.hypot(hp[i][0]-hp[i-1][0],hp[i][1]-hp[i-1][1]);
      if(d<=L||i===hp.length-1){ const f=L>0?Math.min(1,d/L):0, x=hp[i-1][0]+(hp[i][0]-hp[i-1][0])*f, y=hp[i-1][1]+(hp[i][1]-hp[i-1][1])*f; dlsPt(g,x,y,5.5,dlsAlpha(C.accent,0.28)); dlsPt(g,x,y,3.2,C.accent); break; } d-=L; } }
});

/* =========================== spring =========================== */
/* hanging mass, spring and damper on the left; the exact damped response x(t) is traced to the right and restarts every 10 s (8 s of drawing, 2 s hold) */
dlsReg("spring",function(g,r,S,C,p,T){
  const m=dlsM(r), top=dlsTitle(g,r,m,p,S,C), q=dlsQ(r,m,top);
  const M=Math.max(1e-9,dlsNum(p.m,1)), K=Math.max(1e-9,dlsNum(p.k,1)), c=Math.max(0,dlsNum(p.c,0)), x0=dlsNum(p.x0,1);
  const wn=Math.sqrt(K/M), z=c/(2*Math.sqrt(K*M)), under=z<1-1e-9, crit=Math.abs(z-1)<=1e-9, wd=under?wn*Math.sqrt(1-z*z):wn;
  const xt=t=>{ if(under) return x0*Math.exp(-z*wn*t)*(Math.cos(wd*t)+z*wn/wd*Math.sin(wd*t)); if(crit) return x0*Math.exp(-wn*t)*(1+wn*t);
    const s=Math.sqrt(z*z-1), p2=wn*(z+s), p1=wn/(z+s); return x0*(p2*Math.exp(-p1*t)-p1*Math.exp(-p2*t))/(p2-p1); };
  const tp=2*Math.PI/wd; let W; if(under) W=dlsCl(z>1e-6?4/(z*wn):1e9,2.5*tp,10*tp); else if(crit) W=5.8/wn; else { const s=Math.sqrt(z*z-1); W=dlsCl(4*(z+s)/wn,2/wn,1e6); }
  const ph=T%10, prog=Math.min(1,ph/8), tn=prog*W;
  const sw=dlsCl(q.w*0.3,m.ph?64:84,130), A=q.h*0.28, yRest=q.y+q.h*0.57, ceil=q.y+3, sc=A/Math.max(Math.abs(x0),1e-12);
  const disp=v=>dlsCl(v*sc,-A*1.08,A*1.08), xnow=disp(xt(tn)), my=yRest-xnow;
  const mw=Math.min(sw*0.62,56), mh=mw*0.52, sx=q.x+sw/2, kx=sx-sw*0.2, cxd=sx+sw*0.2, topM=my-mh/2;
  /* ceiling */
  g.strokeStyle=C.ink; g.lineWidth=2.2; g.beginPath(); g.moveTo(q.x+2,ceil); g.lineTo(q.x+sw-2,ceil); g.stroke();
  g.strokeStyle=dlsAlpha(C.muted,0.8); g.lineWidth=1; for(let x=q.x+4;x<q.x+sw-4;x+=7){ g.beginPath(); g.moveTo(x,ceil); g.lineTo(x-4,ceil-5); g.stroke(); }
  /* spring */
  const coils=9, amp=sw*0.075, L0=8; g.strokeStyle=C.ink; g.lineWidth=1.7; g.lineJoin="round"; g.beginPath(); g.moveTo(kx,ceil); g.lineTo(kx,ceil+L0);
  for(let i=1;i<=coils*2;i++){ const t=i/(coils*2); g.lineTo(kx+(i%2?-amp:amp),ceil+L0+(topM-ceil-2*L0)*(i-0.5)/(coils*2)); } g.lineTo(kx,topM-L0); g.lineTo(kx,topM); g.stroke();
  /* damper: the cylinder rides on the mass, the rod hangs from the ceiling */
  const cl=(yRest-mh/2-ceil)*0.5, cw=sw*0.11, cylTop=topM-cl, headY=dlsCl(ceil+(yRest-mh/2-ceil)*0.42,cylTop+4,topM-4);
  g.strokeStyle=C.ink; g.lineWidth=1.7; g.beginPath(); g.moveTo(cxd,ceil); g.lineTo(cxd,headY); g.stroke(); g.beginPath(); g.moveTo(cxd-cw*0.8,headY); g.lineTo(cxd+cw*0.8,headY); g.stroke();
  g.fillStyle=dlsMix(C.panel,C.ctrl,0.14); g.beginPath(); g.moveTo(cxd-cw,cylTop); g.lineTo(cxd-cw,topM); g.lineTo(cxd+cw,topM); g.lineTo(cxd+cw,cylTop); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(cxd-cw,cylTop); g.lineTo(cxd-cw,topM); g.lineTo(cxd+cw,topM); g.lineTo(cxd+cw,cylTop); g.stroke();
  /* mass */
  const gm=g.createLinearGradient(0,my-mh/2,0,my+mh/2); gm.addColorStop(0,dlsMix(C.panel,C.accent,0.42)); gm.addColorStop(1,dlsMix(C.panel,C.accent,0.75));
  g.fillStyle=gm; dlsRR(g,sx-mw/2,my-mh/2,mw,mh,5); g.fill(); g.strokeStyle=C.ink; g.lineWidth=1.5; dlsRR(g,sx-mw/2,my-mh/2,mw,mh,5); g.stroke();
  dlsT(g,"m",sx,my,{c:C.panel,s:m.fs+1,w:700,m:true});
  dlsT(g,"k",kx-amp-8,(ceil+topM)/2,{c:C.muted,s:m.fs,w:600,m:true}); dlsT(g,"c",cxd+cw+8,(cylTop+topM)/2,{c:C.muted,s:m.fs,w:600,m:true});
  /* trace */
  const tx0=q.x+sw+(m.ph?14:28), tx1=q.x+q.w-4, tw=tx1-tx0, X=t=>tx0+t/W*tw, Y=v=>yRest-disp(v);
  g.strokeStyle=C.line; g.lineWidth=1; g.beginPath(); g.moveTo(tx0,yRest-A*1.12); g.lineTo(tx0,yRest+A*1.12+2); g.stroke();
  g.setLineDash([4,4]); g.strokeStyle=C.muted; g.beginPath(); g.moveTo(tx0,yRest); g.lineTo(tx1,yRest); g.stroke();
  if(under&&z>0){ g.setLineDash([2,3]); g.strokeStyle=dlsAlpha(C.muted,0.75); [1,-1].forEach(sg=>{ g.beginPath(); for(let i=0;i<=60;i++){ const t=W*i/60, y=yRest-sg*disp(Math.abs(x0)*Math.exp(-z*wn*t)); i?g.lineTo(X(t),y):g.moveTo(X(t),y); } g.stroke(); }); }
  g.setLineDash([]);
  g.strokeStyle=C.accent; g.lineWidth=2.4; g.lineJoin="round"; g.beginPath(); const ns=Math.max(2,Math.round(prog*150)); for(let i=0;i<=ns;i++){ const t=tn*i/ns, y=Y(xt(t)); i?g.lineTo(X(t),y):g.moveTo(X(t),y); } g.stroke();
  g.setLineDash([2,3]); g.strokeStyle=dlsAlpha(C.muted,0.8); g.lineWidth=1; g.beginPath(); g.moveTo(sx+mw/2+2,my); g.lineTo(X(tn),my); g.stroke(); g.setLineDash([]);
  dlsPt(g,X(tn),my,4.5,C.power,C.panel,1.5);
  dlsT(g,"0",tx0-6,yRest,{c:C.muted,s:m.fm,m:true,a:"right"});
  const ty=Math.min(r.y+r.h-m.fs*0.9,yRest+A*1.12+m.fs*1.1);
  dlsT(g,"0",tx0,ty,{c:C.muted,s:m.fm,m:true}); dlsT(g,dlsFmt(W,W<10?1:0)+" s",tx1-2,ty,{c:C.muted,s:m.fm,m:true,a:"right"}); dlsT(g,"t",(tx0+tx1)/2,ty,{c:C.muted,s:m.fm,m:true});
  /* numbers */
  const cls=under?(z<1e-6?"بلا تخميد":"تخميد ناقص"):crit?"تخميد حرج":"تخميد زائد";
  dlsTF(g,"m="+dlsFmt(M)+"  k="+dlsFmt(K)+"  c="+dlsFmt(c),(tx0+tx1)/2,q.y+m.fs*0.7,tw,{c:C.muted,s:m.fm,w:500,m:true});
  dlsTF(g,"ωn="+dlsFmt(wn)+" rad/s   ζ="+dlsFmt(z),(tx0+tx1)/2,q.y+m.fs*0.7+m.fm*1.5,tw,{c:C.ink,s:m.fm,w:600,m:true});
  dlsPlate(g,cls,tx1-2,q.y+m.fs*0.7+m.fm*3.4,C,{c:C.accent,s:m.fm,w:600,a:"right",line:dlsAlpha(C.accent,0.45)});
});

/* =========================== cycle =========================== */
dlsReg("cycle",function(g,r,S,C,p,T){
  const m=dlsM(r), top=dlsTitle(g,r,m,p,S,C), q=dlsQ(r,m,top), P0=(p.pts||[]).filter(o=>dlsOk(o.x)&&dlsOk(o.y)); if(P0.length<2) return;
  const closed=p.closed!==false&&P0.length>2, smooth=!!p.smooth, fill=!!p.fill, n=P0.length, segs=closed?n:n-1, st=16;
  /* the path in data coordinates (polygon or Catmull-Rom), so that the axes can be fitted to the real extent of the curve */
  const dp=[];
  for(let i=0;i<segs;i++){ const a=P0[i], b=P0[(i+1)%n];
    if(!smooth){ dp.push([a.x,a.y]); continue; }
    const p0=P0[closed?(i+n-1)%n:Math.max(0,i-1)], p3=P0[closed?(i+2)%n:Math.min(n-1,i+2)];
    for(let s=0;s<st;s++){ const t=s/st, t2=t*t, t3=t2*t; dp.push(["x","y"].map(k=>0.5*((2*a[k])+(-p0[k]+b[k])*t+(2*p0[k]-5*a[k]+4*b[k]-p3[k])*t2+(-p0[k]+3*a[k]-3*b[k]+p3[k])*t3))); } }
  const last=closed?P0[0]:P0[n-1]; dp.push([last.x,last.y]);
  const span=(k)=>{ let lo=Infinity,hi=-Infinity; dp.forEach(o=>{ lo=Math.min(lo,o[k]); hi=Math.max(hi,o[k]); }); if(lo>=0&&lo<0.35*hi) lo=0; if(hi===lo) hi=lo+1; const pad=(hi-lo)*0.07; return [lo===0?0:lo-pad,hi+pad]; };
  const xr=span(0), yr=span(1), lw=m.ph?30:38, bt=m.fs*(p.xl?2.5:1.7), tp=p.yl?m.fs*1.5:6;
  const pr={x:q.x+lw,y:q.y+tp,w:q.w-lw-6,h:q.h-tp-bt}, X=v=>pr.x+(v-xr[0])/(xr[1]-xr[0])*pr.w, Y=v=>pr.y+pr.h-(v-yr[0])/(yr[1]-yr[0])*pr.h;
  /* axes with a quiet grid */
  const xt=dlsTicks(xr[0],xr[1],m.ph?3:5), yt=dlsTicks(yr[0],yr[1],m.ph?3:4);
  g.lineWidth=1; g.strokeStyle=dlsAlpha(C.line,0.9);
  xt.forEach(t=>{ const x=X(t); g.beginPath(); g.moveTo(x,pr.y); g.lineTo(x,pr.y+pr.h); g.stroke(); dlsT(g,kFmt(t),x,pr.y+pr.h+m.fs*0.95,{c:C.muted,s:m.fm,m:true}); });
  yt.forEach(t=>{ const y=Y(t); g.beginPath(); g.moveTo(pr.x,y); g.lineTo(pr.x+pr.w,y); g.stroke(); dlsT(g,kFmt(t),pr.x-5,y,{c:C.muted,s:m.fm,m:true,a:"right"}); });
  dlsArrow(g,pr.x,pr.y+pr.h,pr.x+pr.w+3,pr.y+pr.h,C.muted,1.4,6); dlsArrow(g,pr.x,pr.y+pr.h,pr.x,pr.y-3,C.muted,1.4,6);
  if(p.xl) dlsTF(g,dlsLab(p.xl,S),pr.x+pr.w/2,pr.y+pr.h+m.fs*2.1,pr.w,{c:C.ink,s:m.fm+0.5,w:600,m:!dlsAr(p.xl)});
  if(p.yl) dlsTF(g,dlsLab(p.yl,S),pr.x,pr.y-m.fs*0.7,pr.w,{c:C.ink,s:m.fm+0.5,w:600,a:"left",m:!dlsAr(p.yl)});
  const sp=P0.map(o=>[X(o.x),Y(o.y)]), path=dp.map(o=>[X(o[0]),Y(o[1])]);
  if(fill&&closed){ g.fillStyle=dlsAlpha(C.accent,0.14); dlsPoly(g,path,true); g.fill(); }
  g.save(); g.beginPath(); g.rect(pr.x-2,pr.y-4,pr.w+8,pr.h+8); g.clip();
  g.strokeStyle=C.accent; g.lineWidth=m.ph?2.2:2.6; g.lineJoin="round"; dlsPoly(g,path,closed&&!smooth); g.stroke();
  /* direction arrows at the middle of every segment */
  const per=smooth?st:1, hd=m.ph?8:10;
  for(let i=0;i<segs;i++){ let x,y,ang;
    if(smooth){ const km=i*per+per/2, a=path[km], b=path[Math.min(path.length-1,km+1)]; x=a[0]; y=a[1]; ang=Math.atan2(b[1]-a[1],b[0]-a[0]); }
    else { const a=sp[i], b=sp[(i+1)%n]; if(Math.hypot(b[0]-a[0],b[1]-a[1])<hd*2.2) continue; x=(a[0]+b[0])/2; y=(a[1]+b[1])/2; ang=Math.atan2(b[1]-a[1],b[0]-a[0]); }
    g.fillStyle=C.accent; g.beginPath(); g.moveTo(x+Math.cos(ang)*hd*0.7,y+Math.sin(ang)*hd*0.7); g.lineTo(x-Math.cos(ang-0.5)*hd*0.7,y-Math.sin(ang-0.5)*hd*0.7); g.lineTo(x-Math.cos(ang+0.5)*hd*0.7,y-Math.sin(ang+0.5)*hd*0.7); g.closePath(); g.fill(); }
  /* a marker runs round the loop with a short tail */
  let tot=0; const cum=[0]; for(let i=1;i<path.length;i++){ tot+=Math.hypot(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1]); cum.push(tot); }
  if(tot>4){ const d=((T*0.16)%1)*tot; let k=1; while(k<cum.length-1&&cum[k]<d) k++; const f=(d-cum[k-1])/Math.max(cum[k]-cum[k-1],1e-9), mx=path[k-1][0]+(path[k][0]-path[k-1][0])*f, my=path[k-1][1]+(path[k][1]-path[k-1][1])*f;
    g.strokeStyle=dlsAlpha(C.power,0.85); g.lineWidth=3.4; g.lineCap="round"; g.beginPath(); let j=k; const d0=Math.max(0,d-tot*0.06); g.moveTo(mx,my); while(j>0&&cum[j-1]>d0){ g.lineTo(path[j-1][0],path[j-1][1]); j--; } g.stroke();
    dlsPt(g,mx,my,5,C.power,C.panel,1.6); }
  g.restore();
  /* states, labelled on the outside of the loop */
  let cx=0,cy=0; sp.forEach(s=>{ cx+=s[0]/n; cy+=s[1]/n; });
  sp.forEach((s,i)=>{ dlsPt(g,s[0],s[1],4.6,C.panel,C.accent,2.2); const o=P0[i], lab=dlsLab(o.l,S); if(!lab) return; let dx=s[0]-cx, dy=s[1]-cy, L=Math.hypot(dx,dy)||1; dx/=L; dy/=L;
    const tw=dlsTW(g,lab,m.fs+1,700,!dlsAr(lab))/2+4, tx=dlsCl(s[0]+dx*(11+tw*Math.abs(dx)),pr.x+tw,pr.x+pr.w-tw+6), ty=dlsCl(s[1]+dy*14,pr.y+8,pr.y+pr.h-8);
    dlsT(g,lab,tx,ty,{c:C.ink,s:m.fs+1,w:700,m:!dlsAr(lab)}); });
});

/* =========================== beam =========================== */
dlsReg("beam",function(g,r,S,C,p,T){
  const m=dlsM(r), top=dlsTitle(g,r,m,p,S,C), q=dlsQ(r,m,top), kind=p.kind==="simple"||p.kind==="fixed"?p.kind:"cant";
  const df=dlsCl(dlsNum(p.defl,0.5),0,1), ld=dlsCl(dlsNum(p.load,0.5),0,1), lab=(p.lab||[]).map(t=>dlsLab(t,S));
  const hasBM=q.h>=185, bmH=hasBM?q.h*0.25:0, area=q.h-bmH, L=q.w*(kind==="cant"?0.6:0.72), x0=kind==="cant"?q.x+q.w*0.1:q.x+(q.w-L)/2, th=dlsCl(area*0.115,9,30), Lp0=12+ld*area*0.2, y0=q.y+Math.max(area*0.36,Lp0+m.fs*2.3+th/2), dmax=Math.min(area*0.3*df,q.y+area-y0-th*2.2);
  /* normalised deflected shape (1 at the load point) and signed bending (+ sagging: top in compression) */
  const sh=x=>{ if(kind==="cant") return (3*x*x-x*x*x)/2; const u=x>0.5?1-x:x; return kind==="simple"?3*u-4*u*u*u:4*u*u*(3-4*u); };
  const bm=x=>{ if(kind==="cant") return -(1-x); const u=x>0.5?1-x:x; return kind==="simple"?2*u:4*u-1; };
  const xl=kind==="cant"?x0+L:x0+L/2, ground=y0+th*1.6+dmax*0.0;
  /* supports */
  g.lineJoin="round"; const wall=(x,dir)=>{ const h=th*3, w=10; g.fillStyle=dlsMix(C.panel,C.struct,0.28); g.fillRect(dir<0?x-w:x,y0-h/2,w,h); g.strokeStyle=C.ink; g.lineWidth=1.4; g.strokeRect(dir<0?x-w:x,y0-h/2,w,h);
    g.strokeStyle=dlsAlpha(C.muted,0.8); g.lineWidth=1; for(let y=y0-h/2+3;y<y0+h/2;y+=6){ g.beginPath(); g.moveTo(dir<0?x-w:x+w,y); g.lineTo(dir<0?x-w-5:x+w+5,y+5); g.stroke(); } };
  if(kind==="cant") wall(x0,-1); else if(kind==="fixed"){ wall(x0,-1); wall(x0+L,1); }
  else { const tri=(x)=>{ g.fillStyle=dlsMix(C.panel,C.struct,0.28); g.strokeStyle=C.ink; g.lineWidth=1.4; g.beginPath(); g.moveTo(x,y0+th/2); g.lineTo(x-th*0.9,y0+th/2+th*1.5); g.lineTo(x+th*0.9,y0+th/2+th*1.5); g.closePath(); g.fill(); g.stroke(); };
    tri(x0); g.fillStyle=dlsMix(C.panel,C.struct,0.28); g.strokeStyle=C.ink; g.lineWidth=1.4; dlsPt(g,x0+L,y0+th/2+th*0.62,th*0.62,g.fillStyle,C.ink,1.4);
    g.beginPath(); g.moveTo(x0+L-th*1.1,y0+th/2+th*1.3); g.lineTo(x0+L+th*1.1,y0+th/2+th*1.3); g.stroke(); g.beginPath(); g.moveTo(x0-th*1.3,y0+th/2+th*1.5); g.lineTo(x0+th*1.3,y0+th/2+th*1.5); g.stroke(); }
  /* the undeformed beam, ghosted */
  g.save(); g.setLineDash([4,3]); g.strokeStyle=dlsAlpha(C.muted,0.8); g.lineWidth=1; g.strokeRect(x0,y0-th/2,L,th); g.restore();
  /* the deformed beam in slices, tinted by the bending stress (tension red, compression blue) */
  const N=44, ys=i=>y0+dmax*sh(i/N), base=dlsSurf(C,0.06);
  for(let i=0;i<N;i++){ const xa=x0+L*i/N, xb=x0+L*(i+1)/N, ya=ys(i), yb=ys(i+1), s=bm((i+0.5)/N)*ld, k=Math.min(1,Math.abs(s))*0.62+0.04;
    const topC=dlsMix(base,s>0?dlsCol(C,"ctrl"):dlsCol(C,"power"),k), botC=dlsMix(base,s>0?dlsCol(C,"power"):dlsCol(C,"ctrl"),k);
    g.fillStyle=topC; dlsPoly(g,[[xa,ya-th/2],[xb+0.6,yb-th/2],[xb+0.6,yb],[xa,ya]],true); g.fill(); g.fillStyle=botC; dlsPoly(g,[[xa,ya],[xb+0.6,yb],[xb+0.6,yb+th/2],[xa,ya+th/2]],true); g.fill(); }
  g.strokeStyle=C.ink; g.lineWidth=m.lw*1.1; const edge=(o)=>{ g.beginPath(); for(let i=0;i<=N;i++){ const x=x0+L*i/N, y=ys(i)+o; i?g.lineTo(x,y):g.moveTo(x,y); } g.stroke(); }; edge(-th/2); edge(th/2);
  g.beginPath(); g.moveTo(x0,ys(0)-th/2); g.lineTo(x0,ys(0)+th/2); g.moveTo(x0+L,ys(N)-th/2); g.lineTo(x0+L,ys(N)+th/2); g.stroke();
  /* load arrow */
  if(ld>0.02){ const lx=kind==="cant"?x0+L-th*0.5:xl, ly=y0+dmax*sh(kind==="cant"?(L-th*0.5)/L:0.5)-th/2, Lp=Lp0, c=dlsCol(C,"power");
    dlsArrow(g,lx,ly-Lp,lx,ly-1,c,3,11); dlsPlate(g,lab[0]||"الحمل",lx,ly-Lp-m.fs*0.9,C,{c,s:m.fs,w:600}); }
  /* deflection dimension: beside the tip of a cantilever, under the middle of a supported beam */
  if(dmax>4){ const c=dlsCol(C,"accent"), t0=lab[1]||"δ";
    if(kind==="cant"){ const dx=x0+L+th*1.6, ya=y0, yb=y0+dmax; g.save(); g.setLineDash([3,3]); g.strokeStyle=dlsAlpha(c,0.8); g.lineWidth=1; g.beginPath(); g.moveTo(x0+L+2,ya); g.lineTo(dx+th*0.6,ya); g.moveTo(x0+L+2,yb); g.lineTo(dx+th*0.6,yb); g.stroke(); g.restore();
      dlsDim(g,dx,ya,dx,yb,c,1.6); dlsPlate(g,dlsTrim(g,t0,q.x+q.w-dx-th*1.1-4,m.fs,600),dx+th*0.9,(ya+yb)/2,C,{c,s:m.fs,w:600,a:"left",m:!dlsAr(t0)}); }
    else { const ya=y0+th/2, yb=y0+th/2+dmax; g.save(); g.setLineDash([3,3]); g.strokeStyle=dlsAlpha(c,0.8); g.lineWidth=1; g.beginPath(); g.moveTo(xl-th*2.4,ya); g.lineTo(xl+th*2.4,ya); g.moveTo(xl-th*2.4,yb); g.lineTo(xl+th*2.4,yb); g.stroke(); g.restore();
      dlsDim(g,xl+th*1.8,ya,xl+th*1.8,yb,c,1.6); dlsPlate(g,dlsTrim(g,t0,Math.max(24,q.w*0.2),m.fs,600),xl+th*2.4,(ya+yb)/2+th*0.2,C,{c,s:m.fs,w:600,a:"left",m:!dlsAr(t0)}); } }
  /* bending moment strip */
  if(hasBM){ const by=q.y+area+bmH*0.5+4, amp=bmH*0.4; g.strokeStyle=C.muted; g.lineWidth=1; g.beginPath(); g.moveTo(x0,by); g.lineTo(x0+L,by); g.stroke();
    const pts=[]; for(let i=0;i<=60;i++){ const u=i/60; pts.push([x0+L*u,by+bm(u)*ld*amp]); }
    g.fillStyle=dlsAlpha(C.accent,0.2); dlsPoly(g,[[x0,by]].concat(pts,[[x0+L,by]]),true); g.fill(); g.strokeStyle=C.accent; g.lineWidth=1.8; dlsPoly(g,pts); g.stroke();
    dlsT(g,"عزم الانحناء",x0,q.y+area+m.fm*0.8,{c:C.muted,s:m.fm,a:"left"}); }
});

/* =========================== wing =========================== */
dlsReg("wing",function(g,r,S,C,p,T){
  const m=dlsM(r), top=dlsTitle(g,r,m,p,S,C), q=dlsQ(r,m,top);
  const b=Math.max(1e-6,dlsNum(p.b,10)), cr=Math.max(1e-6,dlsNum(p.cr,2)), ct=Math.max(0,dlsNum(p.ct,1)), sw=dlsCl(dlsNum(p.sw,0),-60,70), hi=p.hi||"none";
  const off=b/2*Math.tan(sw*D2R), xmin=Math.min(0,off), xmax=Math.max(cr,off+ct), depth=Math.max(xmax-xmin,1e-9);
  const Sa=b/2*(cr+ct), AR=b*b/Math.max(Sa,1e-9), lam=ct/cr, mac=2/3*cr*(1+lam+lam*lam)/(1+lam), ym=b/6*(1+2*lam)/(1+lam);
  const mg=m.ph?46:68, sc=Math.min((q.w-2*mg)/b,q.h*(m.ph?0.56:0.62)/depth), cx=q.x+q.w/2, ne=Math.min(depth*sc*0.7,q.h*0.2), te=Math.min(depth*sc*0.8,q.h*0.22), dimH=Math.min(q.h*0.12,28);
  const tot=ne+depth*sc+te+dimH, ty=q.y+Math.max(0,(q.h-tot)/2)+ne;
  const X=y=>cx+y*sc, Y=x=>ty+(x-xmin)*sc, fw=Math.max(b*0.075*sc,10), fl0=Y(xmin)-ne, fl1=Y(xmax)+te;
  const wf=dlsMix(C.panel,C.struct,0.2), acc=C.accent, hc=(k)=>hi===k;
  /* fuselage */
  g.fillStyle=dlsMix(C.panel,C.struct,0.12); g.strokeStyle=C.muted; g.lineWidth=1.3; dlsRR(g,cx-fw/2,fl0,fw,fl1-fl0,fw/2); g.fill(); g.stroke();
  /* wings (both sides) */
  [1,-1].forEach(sg=>{ const poly=[[X(0),Y(0)],[X(sg*b/2),Y(off)],[X(sg*b/2),Y(off+ct)],[X(0),Y(cr)]];
    g.fillStyle=wf; dlsPoly(g,poly,true); g.fill();
    if(hc("tip")){ const u=0.82, px=sg*b/2*u, lex=off*u, tex=cr+(off+ct-cr)*u; g.fillStyle=dlsAlpha(acc,0.28); dlsPoly(g,[[X(px),Y(lex)],[X(sg*b/2),Y(off)],[X(sg*b/2),Y(off+ct)],[X(px),Y(tex)]],true); g.fill(); }
    if(hc("root")){ const u=0.2, px=sg*b/2*u, lex=off*u, tex=cr+(off+ct-cr)*u; g.fillStyle=dlsAlpha(acc,0.28); dlsPoly(g,[[X(0),Y(0)],[X(px),Y(lex)],[X(px),Y(tex)],[X(0),Y(cr)]],true); g.fill(); }
    g.save(); g.setLineDash([4,4]); g.strokeStyle=dlsAlpha(C.muted,0.7); g.lineWidth=1; [0.22,0.68].forEach(f=>{ g.beginPath(); g.moveTo(X(0),Y(cr*f)); g.lineTo(X(sg*b/2),Y(off+ct*f)); g.stroke(); }); g.restore();
    g.strokeStyle=C.ink; g.lineWidth=m.lw*1.15; dlsPoly(g,poly,true); g.stroke(); });
  g.save(); g.setLineDash([6,4]); g.strokeStyle=dlsAlpha(C.muted,0.8); g.lineWidth=1; g.beginPath(); g.moveTo(cx,fl0-4); g.lineTo(cx,fl1+4); g.stroke(); g.restore();
  /* highlighted chords */
  const hl=(x1,y1,x2,y2,t)=>{ g.strokeStyle=acc; g.lineWidth=3.4; g.lineCap="round"; g.beginPath(); g.moveTo(X(y1),Y(x1)); g.lineTo(X(y2),Y(x2)); g.stroke(); if(t) dlsPlate(g,t,X((y1+y2)/2)+(y1>0?1:-1)*0,Y((x1+x2)/2),C,{c:acc,s:m.fm,w:700,m:true,line:dlsAlpha(acc,0.5)}); };
  if(hc("tip")){ hl(off,b/2,off+ct,b/2,"ct"); hl(off,-b/2,off+ct,-b/2); }
  if(hc("root")) hl(0,0,cr,0,"cr");
  if(hc("mac")){ [1,-1].forEach(sg=>{ const le=off*(ym/(b/2)), te=cr+(off+ct-cr)*(ym/(b/2)); const lm=le+( (te-le)-mac)/2*0; hl(le,sg*ym,le+mac,sg*ym,sg>0?"MAC":null); }); }
  /* dimensions */
  const dcol=C.muted, bY=fl1+dimH*0.55;
  dlsDim(g,X(-b/2),bY,X(b/2),bY,dcol,1.2); g.strokeStyle=dcol; g.lineWidth=1; [[-b/2,Y(off+ct)],[b/2,Y(off+ct)]].forEach(([y,x])=>{ g.beginPath(); g.moveTo(X(y),x+2); g.lineTo(X(y),bY+4); g.stroke(); });
  dlsPlate(g,"b = "+dlsFmt(b),cx,bY,C,{c:C.ink,s:m.fm+0.5,w:600,m:true});
  const rx=cx-fw/2-Math.min(q.w*0.07,18); dlsDim(g,rx,Y(0),rx,Y(cr),dcol,1.2); dlsPlate(g,"cr = "+dlsFmt(cr),rx,(Y(0)+Y(cr))/2+0,C,{c:C.ink,s:m.fm,w:600,m:true,a:"right"});
  const tx=X(b/2)+9; dlsDim(g,tx,Y(off),tx,Y(off+ct),dcol,1.2); dlsT(g,"ct="+dlsFmt(ct),tx+5,(Y(off)+Y(off+ct))/2,{c:C.ink,s:m.fm,w:600,m:true,a:"left"});
  if(Math.abs(sw)>0.5){ const R=Math.min(34,q.w*0.1), a0=sw*D2R, ox=X(0)+fw/2, oy=Y(0); g.strokeStyle=acc; g.lineWidth=1.6; g.beginPath(); g.arc(ox,oy,R,Math.min(0,a0),Math.max(0,a0)); g.stroke();
    g.save(); g.setLineDash([3,3]); g.strokeStyle=dlsAlpha(C.muted,0.9); g.lineWidth=1; g.beginPath(); g.moveTo(ox,oy); g.lineTo(ox+R*1.6,oy); g.stroke(); g.restore();
    dlsPlate(g,"Λ="+dlsFmt(sw,Math.abs(sw-Math.round(sw))<0.05?0:1)+"°",ox+R*1.25+4,oy+(a0>=0?-m.fs*1.05:m.fs*1.05),C,{c:acc,s:m.fm,w:700,m:true,a:"left"}); }
  /* numbers */
  const info=["S = "+dlsFmt(Sa),"AR = "+dlsFmt(AR),"λ = "+dlsFmt(lam)]; info.forEach((t,i)=>dlsT(g,t,q.x+2,q.y+m.fs*(0.8+i*1.35),{c:C.muted,s:m.fm,w:600,m:true,a:"left"}));
});

/* =========================== tank =========================== */
dlsReg("tank",function(g,r,S,C,p,T){
  const m=dlsM(r), top=dlsTitle(g,r,m,p,S,C), q=dlsQ(r,m,top);
  const lv=dlsCl(dlsNum(p.lv,0.5),0,1), fin=dlsCl(dlsNum(p.fin,0.5),0,1), fout=dlsCl(dlsNum(p.fout,0.5),0,1), col=dlsCol(C,"fuel");
  const tw=Math.min(q.w*0.4,170), tx=q.x+(q.w-tw)/2, ty=q.y+q.h*0.2, th=q.h*0.74, wall=Math.max(3,tw*0.03), iy=ty, ih=th-wall, surf=iy+ih*(1-lv);
  const pw=f=>f>0.005?2.5+f*(m.ph?7:11):0, pi=pw(fin), po=pw(fout), pc=dlsMix(C.panel,C.struct,0.35);
  /* tank body (open top) */
  g.fillStyle=dlsSurf(C,0.035); dlsRR(g,tx,ty,tw,th,10); g.fill();
  /* liquid with a moving surface */
  g.save(); dlsRR(g,tx+wall/2,ty,tw-wall,th-wall/2,9); g.clip();
  const wave=(x)=>Math.sin(x*0.09+T*2.2)*1.6+Math.sin(x*0.17-T*1.7)*0.9, gr=g.createLinearGradient(0,surf,0,ty+th); gr.addColorStop(0,dlsAlpha(col,0.55)); gr.addColorStop(1,dlsAlpha(col,0.85));
  g.fillStyle=gr; g.beginPath(); g.moveTo(tx,ty+th); g.lineTo(tx,surf+wave(tx)); for(let x=tx;x<=tx+tw;x+=4) g.lineTo(x,surf+wave(x)); g.lineTo(tx+tw,surf+wave(tx+tw)); g.lineTo(tx+tw,ty+th); g.closePath(); g.fill();
  g.strokeStyle=dlsAlpha(C.panel,0.6); g.lineWidth=1.5; g.beginPath(); for(let x=tx;x<=tx+tw;x+=4){ const y=surf+wave(x); x===tx?g.moveTo(x,y):g.lineTo(x,y); } g.stroke(); g.restore();
  /* inflow: an L-shaped pipe over the left wall, a stream falling to the surface */
  const xi=tx+tw*0.22, yp=q.y+q.h*0.07;
  if(pi>0){ g.strokeStyle=pc; g.lineWidth=pi+5; g.lineCap="butt"; g.beginPath(); g.moveTo(q.x,yp); g.lineTo(xi,yp); g.lineTo(xi,ty+8); g.stroke();
    g.strokeStyle=dlsAlpha(col,0.85); g.lineWidth=pi; g.beginPath(); g.moveTo(q.x,yp); g.lineTo(xi,yp); g.lineTo(xi,ty+8); g.stroke();
    const sy=Math.max(ty+8,surf); g.strokeStyle=dlsAlpha(col,0.7); g.lineWidth=Math.max(2,pi*0.7); g.beginPath(); g.moveTo(xi,ty+8); g.lineTo(xi,sy); g.stroke();
    g.fillStyle=dlsAlpha(C.panel,0.9); const path=(xi-q.x)+(ty+8-yp), sp=34+fin*50; for(let k=0;k<8;k++){ const d=((T*sp+k*path/8)%path+path)%path; let X,Y; if(d<xi-q.x){ X=q.x+d; Y=yp; } else { X=xi; Y=yp+(d-(xi-q.x)); } if(Y<=sy) dlsPt(g,X,Y,Math.max(1.4,pi*0.2),C.panel,null,0,0.9); }
    dlsArrow(g,q.x+4,yp-pi/2-9,q.x+30,yp-pi/2-9,C.muted,1.6,6); }
  /* outflow: a pipe leaving through the bottom right */
  const yo=ty+th-wall-Math.max(po,6)/2-4;
  if(po>0){ g.strokeStyle=pc; g.lineWidth=po+5; g.beginPath(); g.moveTo(tx+tw-2,yo); g.lineTo(q.x+q.w,yo); g.stroke(); g.strokeStyle=dlsAlpha(col,0.85); g.lineWidth=po; g.beginPath(); g.moveTo(tx+tw-2,yo); g.lineTo(q.x+q.w,yo); g.stroke();
    const len=q.x+q.w-(tx+tw), sp=30+fout*60; for(let k=0;k<6;k++){ const d=((T*sp+k*len/6)%len+len)%len; dlsPt(g,tx+tw+d,yo,Math.max(1.3,po*0.18),C.panel,null,0,0.9); } dlsArrow(g,q.x+q.w-34,yo+po/2+10,q.x+q.w-6,yo+po/2+10,C.muted,1.6,6); }
  /* walls on top of the liquid */
  g.strokeStyle=C.ink; g.lineWidth=m.lw*1.6; g.lineJoin="round"; g.beginPath(); g.moveTo(tx,ty); g.lineTo(tx,ty+th-10); g.arcTo(tx,ty+th,tx+10,ty+th,10); g.lineTo(tx+tw-10,ty+th); g.arcTo(tx+tw,ty+th,tx+tw,ty+th-10,10); g.lineTo(tx+tw,ty); g.stroke();
  /* level scale and readout */
  for(let k=0;k<=4;k++){ const y=iy+ih*(1-k/4), len=k%2?5:9; g.strokeStyle=dlsAlpha(C.muted,0.9); g.lineWidth=1; g.beginPath(); g.moveTo(tx-2,y); g.lineTo(tx-2-len,y); g.stroke(); if(k%2===0) dlsT(g,dlsFmt(k*25,0),tx-14,y,{c:C.muted,s:m.fm,m:true,a:"right"}); }
  const net=fin-fout, nl=Math.abs(net)<0.02?"المستوى ثابت":net>0?"المستوى يرتفع":"المستوى ينخفض", nc=Math.abs(net)<0.02?C.muted:net>0?dlsCol(C,"hyd"):dlsCol(C,"power");
  dlsPlate(g,dlsFmt(lv*100,0)+"%"+(p.u&&p.u!=="%"?" "+dlsLab(p.u,S):""),tx+tw/2,Math.min(Math.max(surf,iy+14),ty+th-16),C,{c:C.ink,s:m.fs+1,w:700,m:true,line:dlsAlpha(col,0.7)});
  dlsPlate(g,nl,tx+tw/2,ty+th+m.fs*1.1,C,{c:nc,s:m.fm+0.5,w:600,line:dlsAlpha(nc,0.5)});
  if(pi>0) dlsT(g,"دخول "+dlsFmt(fin*100,0)+"%",q.x+2,yp+pi/2+m.fs*1.5,{c:C.ink,s:m.fm,w:600,a:"left"});
  if(po>0) dlsT(g,"خروج "+dlsFmt(fout*100,0)+"%",q.x+q.w-2,yo-po/2-m.fs*1.2,{c:C.ink,s:m.fm,w:600,a:"right"});
});

/* ---- expressions of th / x,y that the runtime may hand over as a function, an unresolved "=expr" string or a number ---- */
const dlsFnCache=new Map();
function dlsFnOf(expr,args,S){
  if(typeof expr==="function"){ const f=(...a)=>{ try{ return expr(...a); }catch(e){ return NaN; } }; f.__src=expr; return f; }
  if(typeof expr==="number") return ()=>expr;
  if(expr&&typeof expr==="object"&&typeof expr.__e==="function") return (...a)=>{ try{ return expr.__e(...a,DLH); }catch(e){ return NaN; } };
  if(typeof expr==="string"&&expr[0]==="="){ const keys=Object.keys(S).filter(k=>k!=="T"&&/^[A-Za-z][A-Za-z0-9_]*$/.test(k)&&args.indexOf(k)<0), ck=expr+"|"+args.join(",")+"|"+keys.join(",");
    let f=dlsFnCache.get(ck); if(f===undefined){ try{ f=dlFn(expr.slice(1),args.concat(keys)); }catch(e){ f=null; } dlsFnCache.set(ck,f); }
    if(!f) return null; const vals=keys.map(k=>S[k]); return (...a)=>{ try{ return f(...a,...vals,DLH); }catch(e){ return NaN; } }; }
  return null;
}

/* =========================== polar =========================== */
dlsReg("polar",function(g,r,S,C,p,T){
  const m=dlsM(r), top=dlsTitle(g,r,m,p,S,C), q=dlsQ(r,m,top), rmax=dlsNum(p.rmax,1)>0?dlsNum(p.rmax,1):1, f=dlsFnOf(p.r,["th"],S);
  const R=Math.max(24,Math.min(q.w,q.h)/2-(m.ph?15:20)), cx=q.x+q.w/2, cy=q.y+q.h/2, A=th=>[cx+Math.cos(th*D2R)*R,cy-Math.sin(th*D2R)*R];
  /* rings, spokes, angle labels */
  g.lineWidth=1; for(let k=1;k<=4;k++){ g.strokeStyle=dlsAlpha(C.line,k===4?1:0.9); g.beginPath(); g.arc(cx,cy,R*k/4,0,Math.PI*2); g.stroke(); }
  const stp=m.ph?45:30; for(let a=0;a<360;a+=stp){ const e=A(a); g.strokeStyle=dlsAlpha(C.line,0.9); g.beginPath(); g.moveTo(cx,cy); g.lineTo(e[0],e[1]); g.stroke();
    const l=[cx+Math.cos(a*D2R)*(R+(m.ph?10:13)),cy-Math.sin(a*D2R)*(R+(m.ph?8:10))]; dlsT(g,a+"°",l[0],l[1],{c:C.muted,s:m.fm-0.5,m:true}); }
  for(let k=1;k<=4;k++){ const lbl=dlsFmt(rmax*k/4); dlsPlate(g,lbl,cx+R*k/4,cy+m.fm*0.9,C,{c:C.muted,s:m.fm-0.5,m:true,a:"center"}); }
  /* the curve; a negative r is drawn on the opposite side, dashed */
  if(f){ const pos=[],neg=[]; let cur=null,sign=0; const pts=[];
    for(let a=0;a<=360;a+=2){ let v=f(a); if(!dlsOk(v)){ cur=null; continue; } const sg=v<0?-1:1, rr=dlsCl(Math.abs(v)/rmax,0,1.06)*R, ang=(a+(sg<0?180:0))*D2R, pt=[cx+Math.cos(ang)*rr,cy-Math.sin(ang)*rr];
      if(!cur||sg!==sign){ cur=[]; (sg>0?pos:neg).push(cur); sign=sg; } cur.push(pt); pts.push([a,pt]); }
    if(pos.length){ const allpos=pos.length===1&&pos[0].length>=180; g.fillStyle=dlsAlpha(C.accent,0.16); pos.forEach(s=>{ if(s.length<2) return; dlsPoly(g,[[cx,cy]].concat(s),true); g.fill(); });
      g.strokeStyle=C.accent; g.lineWidth=m.ph?2:2.5; g.lineJoin="round"; pos.forEach(s=>{ dlsPoly(g,s,allpos); g.stroke(); }); }
    if(neg.length){ g.save(); g.setLineDash([5,4]); g.strokeStyle=dlsCol(C,"power"); g.lineWidth=m.ph?1.8:2.2; neg.forEach(s=>{ if(s.length>1){ dlsPoly(g,s); g.stroke(); } }); g.restore(); }
    if(dlsOk(p.mark)){ const a=p.mark, v=f(a), e=A(a); g.save(); g.setLineDash([4,3]); g.strokeStyle=C.muted; g.lineWidth=1; g.beginPath(); g.moveTo(cx,cy); g.lineTo(e[0],e[1]); g.stroke(); g.restore();
      if(dlsOk(v)){ const rr=dlsCl(Math.abs(v)/rmax,0,1.06)*R, ang=(a+(v<0?180:0))*D2R, x=cx+Math.cos(ang)*rr, y=cy-Math.sin(ang)*rr; dlsPt(g,x,y,5,dlsCol(C,"power"),C.panel,1.6);
        dlsPlate(g,"θ="+dlsFmt(a,0)+"°  r="+dlsFmt(v),dlsCl(x+(x>cx?-8:8),q.x+60,q.x+q.w-60),dlsCl(y+(y>cy?14:-14),q.y+10,q.y+q.h-8),C,{c:C.ink,s:m.fm,w:600,m:true}); } } }
  dlsPt(g,cx,cy,2.5,C.ink);
});

/* =========================== field =========================== */
let dlsFidN=0; const dlsFid=new WeakMap();
dlsReg("field",function(g,r,S,C,p,T){
  const m=dlsM(r), top=dlsTitle(g,r,m,p,S,C), q=dlsQ(r,m,top), f=dlsFnOf(p.f,["x","y"],S), xr=(p.xr||[0,1]).map(v=>dlsNum(v)), yr=(p.yr||[0,1]).map(v=>dlsNum(v)), div=p.cmap==="diverge";
  if(xr[1]===xr[0]) xr[1]=xr[0]+1; if(yr[1]===yr[0]) yr[1]=yr[0]+1;
  const cb=m.ph?52:54, lm=m.ph?26:32, bm=m.fs*1.9, pr={x:q.x+lm,y:q.y+4,w:q.w-lm-cb,h:q.h-bm-4}; if(pr.w<40||pr.h<30) return;
  const nx=m.ph?56:84, ny=Math.max(16,Math.min(64,Math.round(nx*pr.h/pr.w))), cvk=g.canvas||g;
  let cache=dlsSt.get(cvk); if(!cache){ cache={}; dlsSt.set(cvk,cache); }
  const fsrc=f&&f.__src||f; let fk=typeof fsrc==="function"?(dlsFid.get(fsrc)||(dlsFid.set(fsrc,++dlsFidN),dlsFidN)):"n"; const skey=Object.keys(S).filter(k=>k!=="T").map(k=>k+"="+S[k]).join(";");
  const key=[typeof p.f==="string"?p.f:fk,skey,xr,yr,nx,ny,div,C.panel,C.power,C.ctrl].join("|");
  if(cache.fkey!==key){
    const v=new Float32Array(nx*ny); let lo=Infinity,hi=-Infinity;
    if(f) for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){ const x=xr[0]+(i+0.5)/nx*(xr[1]-xr[0]), y=yr[1]-(j+0.5)/ny*(yr[1]-yr[0]); let z; try{ z=f(x,y); }catch(e){ z=NaN; } if(typeof z!=="number") z=NaN; v[j*nx+i]=z; if(isFinite(z)){ lo=Math.min(lo,z); hi=Math.max(hi,z); } } else v.fill(NaN);
    if(!isFinite(lo)){ lo=0; hi=1; } if(hi-lo<1e-12){ hi=lo+1; }
    if(div){ const a=Math.max(Math.abs(lo),Math.abs(hi),1e-12); lo=-a; hi=a; }
    /* colour ramp: heat runs from a pale wash through amber to deep red; diverge is blue - neutral - red */
    const stops=div?[dlsCol(C,"ctrl"),dlsMix(C.ctrl,C.panel,0.55),dlsSurf(C,0.03),dlsMix(C.power,C.panel,0.55),dlsCol(C,"power")]:[dlsMix(C.panel,C.ctrl,0.13),dlsMix(C.ctrl,C.sys,0.5),dlsCol(C,"fuel"),dlsCol(C,"power"),dlsMix(C.power,C.ink,0.55)];
    const lut=[]; for(let k=0;k<256;k++){ const u=k/255*(stops.length-1), a=Math.min(stops.length-2,Math.floor(u)); lut.push(dlsRGB(dlsMix(stops[a],stops[a+1],u-a))); }
    let off=cache.off; if(!off||off.width!==nx||off.height!==ny){ off=document.createElement("canvas"); off.width=nx; off.height=ny; cache.off=off; }
    const o=off.getContext("2d"), im=o.createImageData(nx,ny), sf=dlsRGB(dlsSurf(C,0.05));
    for(let k=0;k<nx*ny;k++){ const z=v[k], c=isFinite(z)?lut[Math.max(0,Math.min(255,Math.round((z-lo)/(hi-lo)*255)))]:sf; im.data[k*4]=c[0]; im.data[k*4+1]=c[1]; im.data[k*4+2]=c[2]; im.data[k*4+3]=255; }
    o.putImageData(im,0,0); cache.fkey=key; cache.lo=lo; cache.hi=hi; cache.stops=stops; cache.v=v;
  }
  g.save(); dlsRR(g,pr.x,pr.y,pr.w,pr.h,5); g.clip(); g.imageSmoothingEnabled=true; g.imageSmoothingQuality="high"; g.drawImage(cache.off,pr.x,pr.y,pr.w,pr.h);
  /* faint iso-lines every 1/6 of the range give the map some structure */
  g.restore(); g.strokeStyle=C.line; g.lineWidth=1.2; dlsRR(g,pr.x,pr.y,pr.w,pr.h,5); g.stroke();
  /* axes labels */
  [xr[0],(xr[0]+xr[1])/2,xr[1]].forEach((v,i)=>dlsT(g,dlsFmtS(v),pr.x+pr.w*i/2,pr.y+pr.h+m.fs*0.95,{c:C.muted,s:m.fm,m:true,a:i===0?"left":i===2?"right":"center"}));
  [yr[1],yr[0]].forEach((v,i)=>dlsT(g,dlsFmtS(v),pr.x-4,i?pr.y+pr.h-m.fm*0.5:pr.y+m.fm*0.5,{c:C.muted,s:m.fm,m:true,a:"right"}));
  dlsPlate(g,"x",pr.x+pr.w-14,pr.y+pr.h-12,C,{c:C.ink,s:m.fm,m:true,w:700}); dlsPlate(g,"y",pr.x+14,pr.y+12,C,{c:C.ink,s:m.fm,m:true,w:700});
  /* colour bar */
  const bx=pr.x+pr.w+10, bw=m.ph?9:12, gr=g.createLinearGradient(0,pr.y+pr.h,0,pr.y); cache.stops.forEach((c,i)=>gr.addColorStop(i/(cache.stops.length-1),c));
  g.fillStyle=gr; dlsRR(g,bx,pr.y,bw,pr.h,3); g.fill(); g.strokeStyle=C.line; g.lineWidth=1; dlsRR(g,bx,pr.y,bw,pr.h,3); g.stroke();
  dlsT(g,dlsFmtS(cache.hi),bx+bw+4,pr.y+m.fm*0.5,{c:C.ink,s:m.fm,m:true,a:"left",w:600}); dlsT(g,dlsFmtS(cache.lo),bx+bw+4,pr.y+pr.h-m.fm*0.5,{c:C.ink,s:m.fm,m:true,a:"left",w:600});
  if(div){ const y=pr.y+pr.h/2; g.strokeStyle=C.ink; g.beginPath(); g.moveTo(bx-3,y); g.lineTo(bx+bw+3,y); g.stroke(); dlsT(g,"0",bx+bw+4,y,{c:C.muted,s:m.fm,m:true,a:"left"}); }
});

/* =========================== circuit =========================== */
/* wires are drawn first with moving charge dots (speed grows with the current of that wire), the components are drawn over them with a panel backing */
dlsReg("circuit",function(g,r,S,C,p,T){
  const m=dlsM(r), top=dlsTitle(g,r,m,p,S,C), q=dlsQ(r,m,top), kind=["series","parallel","rc","rl","source"].indexOf(p.kind)>=0?p.kind:"series", ph=m.ph;
  const Rs=(p.r||[]).slice(0,4).map(v=>dlsOk(v)?Math.max(0,v):0); if(!Rs.length) Rs.push(1);
  const V=dlsNum(p.v,0), I=Math.abs(dlsNum(p.i,0)), Le=ph?30:46, spacing=ph?17:21, ac=dlsCol(C,"accent"), ink=C.ink, ps=m.fm;
  const W=q.w*0.92, H=Math.min(q.h*(ph?0.62:0.56),W*(ph?0.62:0.52)), x0=q.x+(q.w-W)/2, x1=x0+W, yT=q.y+(q.h-H)/2-(ph?2:0), yB=yT+H, cy=(yT+yB)/2;
  const wires=[], els=[], sp=c=>c>1e-12?dlsCl(26*c,3,110):0, wire=(ax,ay,bx,by,cur)=>wires.push([ax,ay,bx,by,cur]);
  const zig=(x,y,vert,len)=>{ g.save(); g.translate(x,y); if(vert) g.rotate(Math.PI/2); g.fillStyle=C.panel; g.fillRect(-len/2,-10,len,20); g.strokeStyle=ink; g.lineWidth=m.lw*1.1; g.lineJoin="round"; g.beginPath(); g.moveTo(-len/2,0); for(let i=0;i<6;i++) g.lineTo(-len/2+len*(i+0.5)/6,(i%2?1:-1)*(ph?5:7)); g.lineTo(len/2,0); g.stroke(); g.restore(); };
  const coil=(x,y,vert,len)=>{ g.save(); g.translate(x,y); if(vert) g.rotate(Math.PI/2); g.fillStyle=C.panel; g.fillRect(-len/2,-10,len,20); g.strokeStyle=ink; g.lineWidth=m.lw*1.1; for(let i=0;i<4;i++){ g.beginPath(); g.arc(-len/2+(i+0.5)*len/4,0,len/8+1,Math.PI,0); g.stroke(); } g.restore(); };
  const bat=(x,y,vert)=>{ g.save(); g.translate(x,y); g.fillStyle=C.panel; g.fillRect(-16,-12,32,24); g.strokeStyle=ink; g.lineWidth=m.lw*1.1; g.beginPath(); g.moveTo(-14,-4); g.lineTo(14,-4); g.stroke(); g.lineWidth=m.lw*2.2; g.beginPath(); g.moveTo(-8,4); g.lineTo(8,4); g.stroke(); g.restore();
    dlsT(g,"+",x+19,y-6,{c:dlsCol(C,"power"),s:m.fs,w:700,m:true}); dlsT(g,"−",x+19,y+6,{c:ac,s:m.fs,w:700,m:true}); };
  const cap=(x,y,charge)=>{ g.save(); g.fillStyle=C.panel; g.fillRect(x-17,y-9,34,18); g.restore(); g.strokeStyle=ink; g.lineWidth=m.lw*2; g.beginPath(); g.moveTo(x-12,y-4); g.lineTo(x+12,y-4); g.moveTo(x-12,y+4); g.lineTo(x+12,y+4); g.stroke();
    g.fillStyle=dlsAlpha(dlsCol(C,"power"),0.15+0.7*charge); g.fillRect(x-12,y-7,24,2.4); g.fillStyle=dlsAlpha(ac,0.15+0.7*charge); g.fillRect(x-12,y+4.6,24,2.4); };
  const lab=(t,x,y,c,a)=>dlsT(g,t,x,y,{c:c||C.ink,s:ps,w:600,m:true,a:a||"center"});
  let notes=[];
  if(kind==="parallel"){
    const n=Rs.length, bxs=[]; for(let k=1;k<=n;k++) bxs.push(x0+(W-(ph?32:46))*(0.28+0.72*k/n)); const Ik=Rs.map(R=>R>1e-9?V/R:0), tot=Ik.reduce((a,b)=>a+b,0)||I;
    wire(x0,yB,x0,yT,tot);
    let rem=tot, px=x0; bxs.forEach((bx,k)=>{ wire(px,yT,bx,yT,rem); wire(bx,yB,px,yB,rem); wire(bx,yT,bx,yB,Ik[k]); rem=Math.max(0,rem-Ik[k]); px=bx; });
    els.push(()=>bat(x0,cy,true)); bxs.forEach((bx,k)=>els.push(()=>{ zig(bx,cy,true,Le); lab(dlsFmt(Rs[k])+"Ω",bx+(ph?4:7),cy-Le/2-(ph?7:9),C.ink,"left"); if(!ph||n<3) lab(dlsFmt(Ik[k])+"A",bx+(ph?4:7),cy+Le/2+(ph?8:9),dlsCol(C,"power"),"left"); }));
    notes=[["V = "+dlsFmt(V)+" V",x0+22,cy+22,ac,"left"]];
  } else {
    wire(x0,yB,x0,yT,I); wire(x0,yT,x1,yT,I); wire(x1,yT,x1,yB,I); wire(x1,yB,x0,yB,I);
    els.push(()=>bat(x0,cy,true));
    if(kind==="series"||kind==="source"){ const n=kind==="source"?1:Rs.length, xa=x0+W*0.22, xb=x1-W*0.04;
      for(let k=0;k<n;k++){ const bx=xa+(k+0.5)*(xb-xa)/n, len=Math.min(Le,(xb-xa)/n*0.8), R=Rs[k]; els.push(()=>{ zig(bx,yT,false,len); lab(dlsFmt(R)+" Ω",bx,yT-(ph?13:16)); if(!ph||n<3) lab(dlsFmt(I*R)+" V",bx,yT+(ph?14:17),dlsCol(C,"power")); }); }
      if(kind==="source"){ const ri=Rs.length>1?Rs[1]:0; els.push(()=>{ zig(x1,cy,true,Le*0.8); lab(dlsFmt(ri)+" Ω",x1-(ph?8:12),cy,C.ink,"right"); }); notes=[["V = "+dlsFmt(V)+" V",x0+22,cy+22,ac,"left"],["Vt = "+dlsFmt(V-I*(Rs.length>1?Rs[1]:0))+" V",x0+22,cy+22+ps*1.5,C.muted,"left"]]; }
      else notes=[["V = "+dlsFmt(V)+" V",x0+22,cy+22,ac,"left"],["Rt = "+dlsFmt(Rs.reduce((a,b)=>a+b,0))+" Ω",x0+22,cy+22+ps*1.5,C.muted,"left"]]; }
    else { const R=Rs[0], vr=I*R, vx=Math.max(0,V-vr), fr=V>1e-12?dlsCl(vx/V,0,1):0, bx=x0+W*0.45;
      els.push(()=>{ zig(bx,yT,false,Le); lab(dlsFmt(R)+" Ω",bx,yT-(ph?13:16)); lab(dlsFmt(vr)+" V",bx,yT+(ph?14:17),dlsCol(C,"power")); });
      if(kind==="rc"){ els.push(()=>cap(x1,cy,fr)); notes=[["Vc = "+dlsFmt(vx)+" V",x1-(ph?24:30),cy,ac,"right"]]; }
      else { els.push(()=>coil(x1,cy,true,Le*0.9)); notes=[["VL = "+dlsFmt(vx)+" V",x1-(ph?24:30),cy,ac,"right"]]; }
      notes.push(["V = "+dlsFmt(V)+" V",x0+22,cy+22,C.muted,"left"]); }
  }
  /* wires and dots */
  g.lineCap="round"; wires.forEach(w=>{ g.strokeStyle=dlsMix(C.panel,C.ink,0.55); g.lineWidth=m.lw*1.2; g.beginPath(); g.moveTo(w[0],w[1]); g.lineTo(w[2],w[3]); g.stroke(); });
  wires.forEach(w=>{ const L=Math.hypot(w[2]-w[0],w[3]-w[1]), s=sp(w[4]); if(!(L>2)||!s) return; const ux=(w[2]-w[0])/L, uy=(w[3]-w[1])/L, off=(T*s)%spacing;
    for(let d=off;d<L;d+=spacing) dlsPt(g,w[0]+ux*d,w[1]+uy*d,ph?2:2.4,ac); });
  els.forEach(f=>f());
  notes.forEach(n=>lab(n[0],n[1],n[2],n[3],n[4]));
  /* conventional current (clockwise: it runs left along the bottom wire): an arrow and its value under the loop */
  const It=kind==="parallel"?Rs.reduce((a,R)=>a+(R>1e-9?V/R:0),0):I, txt="I = "+dlsFmt(It)+" A", tw=dlsTW(g,txt,m.fm+0.5,700,true), mx=x0+W/2, my=yB+(ph?15:19);
  dlsArrow(g,mx-tw/2-4,my,mx-tw/2-26,my,ac,2,7); dlsT(g,txt,mx-tw/2+2,my,{c:ac,s:m.fm+0.5,w:700,m:true,a:"left"});
});

/* =========================== stack =========================== */
dlsReg("stack",function(g,r,S,C,p,T){
  const m=dlsM(r), top=dlsTitle(g,r,m,p,S,C), q=dlsQ(r,m,top), L=(p.layers||[]).slice(0,8), n=L.length; if(!n) return;
  const th=L.map(o=>Math.max(1e-9,dlsNum(o.th,1))), thMax=Math.max(...th), thSum=th.reduce((a,b)=>a+b,0);
  const avail=q.h*0.96, pitch=avail/n, dy=dlsCl(pitch*0.42,5,22), maxH=pitch*0.38, y00=q.y+(q.h-avail)/2+dy;
  const W=Math.min(q.w*(m.ph?0.46:0.42),250), dx=Math.min(W*0.28,q.w*0.14), x0=q.x+Math.max(4,(q.w*(m.ph?0.52:0.58)-W-dx)/2+(m.ph?4:12)), Dt=W*0.6;
  const labX=q.x+q.w, fs=m.fs, labW=q.w-(x0+W+dx+16-q.x);
  const colOf=(o,i)=>dlsCol(C,o.c||DLS_SEQ[(i+1)%DLS_SEQ.length]);
  /* bottom layer first so that upper layers overlap correctly */
  for(let i=n-1;i>=0;i--){ const o=L[i], c=colOf(o,i), h=dlsCl(th[i]/thMax*maxH,3.5,maxH), y=y00+i*pitch, top0=dlsMix(C.panel,c,0.28), front=dlsMix(C.panel,c,0.62), side=dlsMix(C.panel,c,0.82);
    g.lineJoin="round";
    g.fillStyle=front; g.fillRect(x0,y,W,h); g.fillStyle=side; dlsPoly(g,[[x0+W,y],[x0+W+dx,y-dy],[x0+W+dx,y-dy+h],[x0+W,y+h]],true); g.fill();
    const face=[[x0,y],[x0+W,y],[x0+W+dx,y-dy],[x0+dx,y-dy]]; g.fillStyle=top0; dlsPoly(g,face,true); g.fill();
    if(dlsOk(o.ang)){ g.save(); dlsPoly(g,face,true); g.clip(); const a=o.ang*D2R, ca=Math.cos(a), sa=Math.sin(a), sx=dx/Dt, sy=dy/Dt, step=m.ph?6:7.5;
      /* fibre direction drawn in the face plane: u along the width, v into the depth */
      g.strokeStyle=dlsMix(c,C.ink,0.35); g.lineWidth=1.6; g.lineCap="round"; g.beginPath();
      const ext=W+Dt, nn=Math.ceil(ext*2/step); for(let k=-nn;k<=nn;k++){ const t=k*step, cu=W/2+(-sa)*t, cv=Dt/2+ca*t;
        const P=(uu,vv)=>[x0+uu+vv*sx,y-vv*sy]; const a1=P(cu-ca*ext,cv-sa*ext), a2=P(cu+ca*ext,cv+sa*ext); g.moveTo(a1[0],a1[1]); g.lineTo(a2[0],a2[1]); }
      g.stroke(); g.restore(); }
    g.strokeStyle=C.ink; g.lineWidth=m.lw; dlsPoly(g,face,true); g.stroke(); g.strokeRect(x0,y,W,h); dlsPoly(g,[[x0+W,y],[x0+W+dx,y-dy],[x0+W+dx,y-dy+h],[x0+W,y+h]],true); g.stroke(); }
  /* labels on the right with leader lines */
  L.forEach((o,i)=>{ const h=dlsCl(th[i]/thMax*maxH,3.5,maxH), y=y00+i*pitch+h/2-dy*0.3, t=dlsLab(o.l,S), c=colOf(o,i), sub=(dlsOk(o.ang)?dlsFmt(o.ang,Math.abs(o.ang-Math.round(o.ang))<0.05?0:1)+"°  ":"")+"t="+dlsFmt(th[i]), lx=x0+W+dx+16;
    g.save(); g.setLineDash([2,3]); g.strokeStyle=dlsAlpha(C.muted,0.8); g.lineWidth=1; g.beginPath(); g.moveTo(x0+W+dx*0.7+3,y); g.lineTo(lx-3,y); g.stroke(); g.restore();
    dlsTF(g,t,labX,y-(pitch>30?fs*0.55:0),labW,{c:C.ink,s:fs,w:600,a:"right"}); if(pitch>30) dlsTF(g,sub,labX,y+fs*0.75,labW,{c:dlsMix(c,C.ink,0.3),s:m.fm,m:true,a:"right"}); });
  dlsT(g,"Σt = "+dlsFmt(thSum),q.x+2,q.y+m.fs*0.4,{c:C.muted,s:m.fm,m:true,w:600,a:"left"});
});

/* =========================== att =========================== */
dlsReg("att",function(g,r,S,C,p,T){
  const m=dlsM(r), top=dlsTitle(g,r,m,p,S,C), q=dlsQ(r,m,top), ph=m.ph;
  const pitch=dlsCl(dlsNum(p.pitch),-90,90), roll=dlsNum(p.roll), hasS=dlsOk(p.spd), hasA=dlsOk(p.alt), hasH=dlsOk(p.hdg);
  const tapeW=ph?34:54, hdgH=hasH?(ph?20:26):0, gap=4;
  let ax0=q.x+(hasS?tapeW+gap:0), ax1=q.x+q.w-(hasA?tapeW+gap:0), ay0=q.y, ay1=q.y+q.h-(hasH?hdgH+gap:0);
  const aw=Math.min(ax1-ax0,(ay1-ay0)*1.25), ah=ay1-ay0; ax0=(ax0+ax1)/2-aw/2; ax1=ax0+aw; const cx=(ax0+ax1)/2, cy=(ay0+ay1)/2;
  const sky=dlsMix(C.ctrl,"#06203a",0.36), gnd=dlsMix(C.fuel,"#2a1606",0.62), white="#f4f7fa", amber="#f6c343", panelD="rgba(12,22,32,0.86)";
  const ppd=ah/(ph?34:38);
  /* attitude indicator */
  g.save(); dlsRR(g,ax0,ay0,aw,ah,8); g.clip();
  g.save(); g.translate(cx,cy); g.rotate(-roll*D2R); g.translate(0,pitch*ppd);
  const big=Math.max(aw,ah)*2; let gs=g.createLinearGradient(0,-big,0,0); gs.addColorStop(0,dlsMix(sky,"#000000",0.45)); gs.addColorStop(1,dlsMix(sky,"#ffffff",0.12)); g.fillStyle=gs; g.fillRect(-big,-big,big*2,big);
  let gg=g.createLinearGradient(0,0,0,big*0.3); gg.addColorStop(0,dlsMix(gnd,"#ffffff",0.1)); gg.addColorStop(1,dlsMix(gnd,"#000000",0.4)); g.fillStyle=gg; g.fillRect(-big,0,big*2,big);
  g.strokeStyle=white; g.lineWidth=2; g.beginPath(); g.moveTo(-big,0); g.lineTo(big,0); g.stroke();
  for(let d=-30;d<=30;d+=2.5){ if(d===0) continue; const y=-d*ppd, major=d%10===0, mid=d%5===0, hw=(major?0.2:mid?0.11:0.06)*aw; g.lineWidth=1.4; g.beginPath(); g.moveTo(-hw,y); g.lineTo(hw,y); g.stroke();
    if(major){ dlsT(g,String(Math.abs(d)),-hw-12,y,{c:white,s:m.fm,m:true}); dlsT(g,String(Math.abs(d)),hw+12,y,{c:white,s:m.fm,m:true}); } }
  g.restore();
  /* roll scale (fixed) with the sky pointer that turns with the horizon */
  const Rr=ah*0.42; g.strokeStyle=white; g.fillStyle=white; g.lineWidth=1.4; g.beginPath(); g.arc(cx,cy,Rr,-Math.PI/2-60*D2R,-Math.PI/2+60*D2R); g.stroke();
  [-60,-45,-30,-20,-10,0,10,20,30,45,60].forEach(a=>{ const an=-Math.PI/2+a*D2R, len=(a%30===0)?9:5; g.beginPath(); g.moveTo(cx+Math.cos(an)*Rr,cy+Math.sin(an)*Rr); g.lineTo(cx+Math.cos(an)*(Rr-len),cy+Math.sin(an)*(Rr-len)); g.stroke(); });
  g.save(); g.translate(cx,cy); g.rotate(-roll*D2R); g.beginPath(); g.moveTo(0,-Rr+2); g.lineTo(-6,-Rr+12); g.lineTo(6,-Rr+12); g.closePath(); g.fillStyle=white; g.fill(); g.restore();
  g.fillStyle=amber; g.beginPath(); g.moveTo(cx,cy-Rr-2); g.lineTo(cx-5,cy-Rr-11); g.lineTo(cx+5,cy-Rr-11); g.closePath(); g.fill();
  /* the fixed aircraft symbol */
  g.strokeStyle="#0a0f14"; g.lineWidth=5.5; g.lineCap="butt"; const ws=aw*0.2; g.beginPath(); g.moveTo(cx-ws-aw*0.08,cy); g.lineTo(cx-aw*0.07,cy); g.lineTo(cx-aw*0.07,cy+7); g.moveTo(cx+ws+aw*0.08,cy); g.lineTo(cx+aw*0.07,cy); g.lineTo(cx+aw*0.07,cy+7); g.stroke();
  g.strokeStyle=amber; g.lineWidth=3; g.stroke(); dlsPt(g,cx,cy,3.2,amber,"#0a0f14",1.2);
  g.restore(); g.strokeStyle=dlsAlpha(C.ink,0.5); g.lineWidth=1.4; dlsRR(g,ax0,ay0,aw,ah,8); g.stroke();
  /* tapes */
  const tape=(x,w,val,unit,major,minor,pps,right)=>{ g.save(); dlsRR(g,x,ay0,w,ah,6); g.clip(); g.fillStyle=panelD; g.fillRect(x,ay0,w,ah); g.fillStyle=white; g.strokeStyle=white; g.lineWidth=1.2;
    const half=ah/2/pps; for(let v=Math.floor((val-half)/minor)*minor;v<=val+half;v+=minor){ const y=cy-(v-val)*pps, isM=Math.abs(v/major-Math.round(v/major))<1e-6, ln=isM?w*0.3:w*0.16; g.beginPath(); g.moveTo(right?x:x+w,y); g.lineTo(right?x+ln:x+w-ln,y); g.stroke();
      if(isM&&Math.abs(y-cy)>ah*0.07&&y>ay0+m.fm*2&&y<ay0+ah-m.fm*0.8) dlsT(g,(w<44&&Math.abs(v)>=1000)?(v/1000).toFixed(1):String(Math.round(v)),right?x+ln+3:x+w-ln-3,y,{c:white,s:m.fm-0.5,m:true,a:right?"left":"right"}); }
    g.restore(); const bh=ph?16:20; g.fillStyle="#05090d"; g.strokeStyle=white; g.lineWidth=1.2; g.fillRect(x-1,cy-bh/2,w+2,bh); g.strokeRect(x-1,cy-bh/2,w+2,bh); dlsT(g,String(Math.round(val)),x+w/2,cy,{c:"#8df08d",s:m.fs,w:700,m:true});
    g.strokeStyle=dlsAlpha(C.ink,0.5); g.lineWidth=1.2; dlsRR(g,x,ay0,w,ah,6); g.stroke(); dlsT(g,unit,x+w/2,ay0+m.fm*0.9,{c:C.muted,s:m.fm-1,w:600,m:true}); };
  if(hasS) tape(q.x,tapeW,p.spd,"kt",20,10,ah/60,false);
  if(hasA) tape(q.x+q.w-tapeW,tapeW,p.alt,"ft",200,100,ah/640,true);
  if(hasH){ const hy=ay1+gap, hw=Math.min(q.w,aw+(hasS?tapeW:0)+(hasA?tapeW:0)), hx=q.x+(q.w-hw)/2, pph=hw/70, h=((p.hdg%360)+360)%360; g.save(); dlsRR(g,hx,hy,hw,hdgH,5); g.clip(); g.fillStyle=panelD; g.fillRect(hx,hy,hw,hdgH);
    g.strokeStyle=white; g.lineWidth=1.2; for(let a=Math.floor((h-36)/5)*5;a<=h+36;a+=5){ const x=hx+hw/2+(a-h)*pph, mj=((a%10)+10)%10===0; g.beginPath(); g.moveTo(x,hy); g.lineTo(x,hy+(mj?hdgH*0.36:hdgH*0.2)); g.stroke(); if(mj&&Math.abs(a-h)>5&&Math.abs(x-hx)>14&&Math.abs(x-hx-hw)>14) dlsT(g,String((((a%360)+360)%360)/10).padStart(2,"0"),x,hy+hdgH*0.68,{c:white,s:m.fm-0.5,m:true}); }
    g.restore(); g.fillStyle="#05090d"; g.strokeStyle=white; g.fillRect(hx+hw/2-18,hy,36,hdgH*0.62); g.strokeRect(hx+hw/2-18,hy,36,hdgH*0.62); dlsT(g,dlsFmt(h,0)+"°",hx+hw/2,hy+hdgH*0.31,{c:"#8df08d",s:m.fm,w:700,m:true}); g.strokeStyle=dlsAlpha(C.ink,0.5); dlsRR(g,hx,hy,hw,hdgH,5); g.stroke(); }
});

/* =========================== rot =========================== */
dlsReg("rot",function(g,r,S,C,p,T){
  const m=dlsM(r), top=dlsTitle(g,r,m,p,S,C), q=dlsQ(r,m,top), w=dlsNum(p.w,10), rad=Math.max(0,dlsNum(p.r,1)), n=dlsCl(Math.round(dlsNum(p.n,6)),2,24), vec=p.vec!==false;
  const R=Math.max(26,Math.min(q.w,q.h)/2-(m.ph?12:16)), cx=q.x+q.w/2, cy=q.y+q.h/2, hubR=R*0.16, cap=6, sg=w<0?-1:1, wd=sg*cap*Math.tanh(Math.abs(w)/8), th0=T*wd, slowed=Math.abs(w)>cap*0.9;
  const col=dlsCol(C,"accent"), pitchA=2*Math.PI/n;
  /* a swept, tapered blade; the tip lags behind the root, the leading edge is on the side of the rotation */
  const blade=(ang,fill,stroke,lw)=>{ const N=10, a=[], b=[];
    for(let i=0;i<=N;i++){ const u=i/N, s=hubR*0.75+(R*0.97-hubR*0.75)*u, c=ang-sg*0.42*pitchA*u*u, hw=pitchA*0.27*(1-0.35*u)*(i===0?0.75:1);
      a.push([cx+Math.cos(c+sg*hw)*s,cy-Math.sin(c+sg*hw)*s]); b.push([cx+Math.cos(c-sg*hw*0.8)*s,cy-Math.sin(c-sg*hw*0.8)*s]); }
    dlsPoly(g,a.concat(b.reverse()),true); g.fillStyle=fill; g.fill(); if(lw){ g.strokeStyle=stroke; g.lineWidth=lw; g.lineJoin="round"; g.stroke(); } };
  g.fillStyle=dlsSurf(C,0.035); g.beginPath(); g.arc(cx,cy,R*1.02,0,Math.PI*2); g.fill();
  g.strokeStyle=dlsAlpha(C.muted,0.8); g.lineWidth=m.lw*1.3; g.beginPath(); g.arc(cx,cy,R*1.02,0,Math.PI*2); g.stroke();
  /* ghost blades behind the real ones give the sense of speed */
  if(Math.abs(w)>0.3){ const step=Math.min(0.5,0.12+Math.abs(wd)*0.05); for(let k=3;k>=1;k--) for(let i=0;i<n;i++) blade(th0+i*pitchA-sg*step*k,dlsAlpha(col,0.07),null,0); }
  for(let i=0;i<n;i++) blade(th0+i*pitchA,i===0?dlsMix(C.panel,col,0.55):dlsMix(C.panel,C.struct,0.38),i===0?col:C.ink,i===0?m.lw*1.5:m.lw);
  const hg=g.createRadialGradient(cx-hubR*0.3,cy-hubR*0.3,1,cx,cy,hubR); hg.addColorStop(0,dlsMix(C.panel,C.ink,0.15)); hg.addColorStop(1,dlsMix(C.panel,C.ink,0.65));
  g.fillStyle=hg; g.beginPath(); g.arc(cx,cy,hubR,0,Math.PI*2); g.fill(); g.strokeStyle=C.ink; g.lineWidth=m.lw; g.stroke(); dlsPt(g,cx,cy,hubR*0.28,C.panel,C.ink,1);
  /* radius line and the tip-speed vector on blade 0 */
  const tx=cx+Math.cos(th0)*R*0.97, ty=cy-Math.sin(th0)*R*0.97, v=Math.abs(w)*rad;
  g.save(); g.setLineDash([4,3]); g.strokeStyle=C.ink; g.lineWidth=1.2; g.beginPath(); g.moveTo(cx,cy); g.lineTo(tx,ty); g.stroke(); g.restore();
  dlsPlate(g,"r = "+dlsFmt(rad),cx+Math.cos(th0)*R*0.5,cy-Math.sin(th0)*R*0.5,C,{c:C.ink,s:m.fm,w:600,m:true});
  if(vec&&Math.abs(w)>1e-9){ const Lv=R*(0.22+0.55*(1-Math.exp(-v/140))), dx=-sg*Math.sin(th0), dy=-sg*Math.cos(th0), c=dlsCol(C,"power");
    dlsArrow(g,tx,ty,tx+dx*Lv,ty+dy*Lv,c,3,11); dlsPt(g,tx,ty,3.4,c);
    dlsPlate(g,"V = ωr = "+dlsFmt(v)+" m/s",dlsCl(tx+dx*Lv*0.5+(dx>=0?4:-4),q.x+72,q.x+q.w-72),dlsCl(ty+dy*Lv*0.5+(dy>=0?13:-13),q.y+12,q.y+q.h-(slowed?m.fs*2.3:8)),C,{c,s:m.fm,w:700,m:true,line:dlsAlpha(c,0.45)}); }
  /* direction of rotation: an arc with an arrow head, and the numbers */
  const Ra=R*1.12, P=(deg)=>[cx+Math.cos(deg*D2R)*Ra,cy+Math.sin(deg*D2R)*Ra]; g.strokeStyle=C.muted; g.lineWidth=1.6; g.beginPath(); g.arc(cx,cy,Ra,-70*D2R,-32*D2R); g.stroke();
  if(sg>0){ const a=P(-60), b=P(-74); dlsArrow(g,a[0],a[1],b[0],b[1],C.muted,1.6,8); } else { const a=P(-42), b=P(-28); dlsArrow(g,a[0],a[1],b[0],b[1],C.muted,1.6,8); }
  dlsT(g,"ω = "+dlsFmt(w)+" rad/s",q.x+2,q.y+m.fs*0.8,{c:C.ink,s:m.fm+0.5,w:700,m:true,a:"left"});
  if(slowed) dlsT(g,"الحركة هنا مبطّأة عن الحقيقة",q.x+q.w-2,q.y+q.h-m.fs*0.6,{c:C.muted,s:m.fm,a:"right"});
});

/* =========================== plane =========================== */
/* the aircraft chosen in the app decides the number of engines; read from the global state at call time, never throws */
function dlsAc(){ try{ return S.ac==="b737"?"b737":"a380"; }catch(e){ return "a380"; } }
/* top view, nose up, fuselage length 1 */
function dlsPlaneTop(g,cx,cy,len,C,hi,four){
  const base=dlsMix(C.panel,C.struct,0.16), mid=dlsMix(C.panel,C.struct,0.30), dark=dlsMix(C.panel,C.struct,0.48), onC=dlsMix(C.panel,C.accent,0.5), lw=1.3/len;
  const fillOf=n=>hi===n?onC:(n==="eng"?dark:(n==="fuselage"?base:mid));
  g.save(); g.translate(cx,cy); g.scale(len,len); g.lineJoin="round";
  const part=(n,draw,mirror)=>{ [1,mirror?-1:1].filter((v,i,a)=>a.indexOf(v)===i).forEach(sg=>{ g.save(); g.scale(sg,1); g.beginPath(); draw(); g.fillStyle=fillOf(n); g.fill(); g.strokeStyle=hi===n?C.accent:C.ink; g.lineWidth=hi===n?lw*1.9:lw; g.stroke(); g.restore(); }); };
  part("tail",()=>{ g.moveTo(0.045,0.34); g.lineTo(0.2,0.43); g.lineTo(0.2,0.465); g.lineTo(0.045,0.41); g.closePath(); },true);
  part("wing",()=>{ g.moveTo(0.045,-0.13); g.lineTo(0.46,0.115); g.lineTo(0.46,0.165); g.lineTo(0.045,0.05); g.closePath(); },true);
  /* flaps on the inner trailing edge, ailerons outboard */
  const TE=u=>[0.045+0.415*u,0.05+0.115*u], ch=u=>0.18-0.13*u;
  [1,-1].forEach(sg=>{ g.save(); g.scale(sg,1); const a=TE(0.12), b2=TE(0.62); g.beginPath(); g.moveTo(a[0],a[1]); g.lineTo(b2[0],b2[1]); g.lineTo(b2[0],b2[1]-0.25*ch(0.62)); g.lineTo(a[0],a[1]-0.25*ch(0.12)); g.closePath();
    g.fillStyle=hi==="flaps"?onC:dark; g.fill(); g.strokeStyle=hi==="flaps"?C.accent:C.ink; g.lineWidth=hi==="flaps"?lw*1.9:lw*0.8; g.stroke();
    const c=TE(0.7), d=TE(0.95); g.beginPath(); g.moveTo(c[0],c[1]); g.lineTo(d[0],d[1]); g.lineTo(d[0],d[1]-0.2*ch(0.95)); g.lineTo(c[0],c[1]-0.2*ch(0.7)); g.closePath(); g.fillStyle=dark; g.fill(); g.strokeStyle=C.ink; g.lineWidth=lw*0.8; g.stroke(); g.restore(); });
  const le=x=>-0.13+0.245*(x-0.045)/0.415, ex=four?[0.12,0.29]:[0.17];
  ex.forEach(x=>part("eng",()=>{ g.ellipse(x,le(x)-0.012,0.026,0.066,0,0,Math.PI*2); },true));
  part("fuselage",()=>{ g.moveTo(0,-0.5); g.bezierCurveTo(0.03,-0.5,0.05,-0.44,0.05,-0.36); g.lineTo(0.05,0.2); g.bezierCurveTo(0.05,0.34,0.02,0.44,0.008,0.5); g.lineTo(-0.008,0.5); g.bezierCurveTo(-0.02,0.44,-0.05,0.34,-0.05,0.2); g.lineTo(-0.05,-0.36); g.bezierCurveTo(-0.05,-0.44,-0.03,-0.5,0,-0.5); g.closePath(); },false);
  g.beginPath(); g.moveTo(-0.03,-0.43); g.lineTo(0.03,-0.43); g.lineTo(0.026,-0.4); g.lineTo(-0.026,-0.4); g.closePath(); g.fillStyle=dlsMix(C.panel,C.ink,0.55); g.fill();
  if(hi==="nose"){ g.beginPath(); g.moveTo(0,-0.5); g.bezierCurveTo(0.03,-0.5,0.05,-0.44,0.05,-0.36); g.lineTo(-0.05,-0.36); g.bezierCurveTo(-0.05,-0.44,-0.03,-0.5,0,-0.5); g.closePath(); g.fillStyle=dlsAlpha(C.accent,0.55); g.fill(); g.strokeStyle=C.accent; g.lineWidth=lw*1.9; g.stroke(); }
  g.beginPath(); g.rect(-0.011,0.27,0.022,0.19); g.fillStyle=hi==="fin"?onC:mid; g.fill(); g.strokeStyle=hi==="fin"?C.accent:C.ink; g.lineWidth=hi==="fin"?lw*1.9:lw; g.stroke();
  if(hi==="gear"){ g.setLineDash([0.02,0.015]); g.strokeStyle=C.accent; g.lineWidth=lw*2; g.fillStyle=dlsAlpha(C.accent,0.25); [[-0.1,0.02,0.03,0.07],[0.1,0.02,0.03,0.07],[0,-0.34,0.024,0.045]].forEach(r=>{ g.beginPath(); g.rect(r[0]-r[2]/2,r[1]-r[3]/2,r[2],r[3]); g.fill(); g.stroke(); }); g.setLineDash([]); }
  g.restore();
}
/* front view, wing span 1 */
function dlsPlaneFront(g,cx,cy,len,C,hi,four){
  const base=dlsMix(C.panel,C.struct,0.16), mid=dlsMix(C.panel,C.struct,0.30), dark=dlsMix(C.panel,C.struct,0.48), onC=dlsMix(C.panel,C.accent,0.5), lw=1.3/len;
  const fillOf=n=>hi===n?onC:(n==="eng"?dark:(n==="fuselage"?base:mid));
  g.save(); g.translate(cx,cy); g.scale(len,len); g.lineJoin="round";
  const part=(n,draw,mirror)=>{ [1,-1].filter(sg=>mirror||sg===1).forEach(sg=>{ g.save(); g.scale(sg,1); g.beginPath(); draw(); g.fillStyle=fillOf(n); g.fill(); g.strokeStyle=hi===n?C.accent:C.ink; g.lineWidth=hi===n?lw*1.9:lw; g.stroke(); g.restore(); }); };
  /* gear first (it is behind everything) */
  g.strokeStyle=hi==="gear"?C.accent:C.ink; g.fillStyle=hi==="gear"?C.accent:C.ink; g.lineWidth=lw*(hi==="gear"?2.2:1.4);
  [-0.09,0.09,0].forEach((x,i)=>{ g.beginPath(); g.moveTo(x,i===2?0.05:0.035); g.lineTo(x,0.12); g.stroke(); const w=i===2?0.008:0.011; g.fillRect(x-w-(i===2?0:0.004),0.102,w,0.024); g.fillRect(x+(i===2?0:0.004),0.102,w,0.024); });
  part("tail",()=>{ g.rect(-0.17,-0.055,0.17,0.018); },true);
  part("fin",()=>{ g.moveTo(-0.014,-0.06); g.lineTo(-0.01,-0.22); g.lineTo(0.01,-0.22); g.lineTo(0.014,-0.06); g.closePath(); },false);
  part("wing",()=>{ g.moveTo(0.05,0.0); g.lineTo(0.5,-0.04); g.lineTo(0.5,-0.026); g.lineTo(0.05,0.026); g.closePath(); },true);
  const ex=four?[0.12,0.28]:[0.2];
  ex.forEach(x=>{ const y=-0.04*(x-0.05)/0.45+0.03; part("eng",()=>{ g.arc(x,y+0.036,0.03,0,Math.PI*2); },true); [1,-1].forEach(sg=>{ g.beginPath(); g.arc(sg*x,y+0.036,0.017,0,Math.PI*2); g.fillStyle=dlsMix(C.panel,C.ink,0.55); g.fill(); dlsPt(g,sg*x,y+0.036,0.005,dlsMix(C.panel,C.ink,0.25)); }); });
  part("fuselage",()=>{ g.ellipse(0,0.005,0.06,0.066,0,0,Math.PI*2); },false);
  g.beginPath(); g.moveTo(-0.034,-0.036); g.lineTo(0.034,-0.036); g.lineTo(0.028,-0.008); g.lineTo(-0.028,-0.008); g.closePath(); g.fillStyle=dlsMix(C.panel,C.ink,0.55); g.fill();
  if(hi==="nose"){ g.beginPath(); g.ellipse(0,0.012,0.034,0.03,0,0,Math.PI*2); g.fillStyle=dlsAlpha(C.accent,0.55); g.fill(); g.strokeStyle=C.accent; g.lineWidth=lw*1.9; g.stroke(); }
  g.restore();
}
dlsReg("plane",function(g,r,S,C,p,T){
  const m=dlsM(r), top=dlsTitle(g,r,m,p,S,C), q=dlsQ(r,m,top), view=p.view==="top"||p.view==="front"?p.view:"side", hi=["wing","tail","fin","nose","engine","gear","fuselage","flaps"].indexOf(p.hi)>=0?p.hi:"none", pitch=dlsCl(dlsNum(p.pitch,0),-45,45), four=dlsAc()==="a380";
  const cx=q.x+q.w/2, cy=q.y+q.h/2+(m.ph?4:6), hiKey=hi==="engine"?"eng":hi;
  let len;
  const names={wing:"الجناح",tail:"الذيل الأفقي",fin:"الذيل العمودي",nose:"مقدمة الطائرة",engine:"المحرك",gear:"جهاز الهبوط",fuselage:"جسم الطائرة",flaps:"القلابات"};
  /* anchor of the highlighted part in the drawing's own units (relative to the centre, in length units), used for the leader line */
  const anc={side:{wing:[0.16,0.075],tail:[0.45,-0.01],fin:[0.42,-0.15],nose:[-0.46,-0.01],engine:[0.01,0.09],gear:[0.03,0.112],fuselage:[-0.2,-0.03],flaps:[0.16,0.058]},
    top:{wing:[0.3,0.06],tail:[0.14,0.43],fin:[0,0.4],nose:[0,-0.45],engine:[four?0.29:0.17,four?0.0:-0.1],gear:[0.1,0.02],fuselage:[0,0.12],flaps:[0.26,0.1]},
    front:{wing:[0.32,-0.02],tail:[0.12,-0.045],fin:[0,-0.16],nose:[0,0.012],engine:[four?0.28:0.2,0.03],gear:[0.09,0.12],fuselage:[0.04,0.03],flaps:[0.32,-0.02]}}[view];
  if(view==="side"){ len=Math.min(q.w*0.92,q.h*2.7); dlsPlaneSide(g,cx,cy,len,pitch,C,{hi:hiKey,four}); }
  else if(view==="top"){ len=Math.min(q.h*0.9,q.w*1.0); dlsPlaneTop(g,cx,cy,len,C,hiKey,four); }
  else { len=Math.min(q.w*0.92,q.h*3.2); dlsPlaneFront(g,cx,cy,len,C,hiKey,four); }
  if(view==="side"){ /* the horizon through the centre and the pitch angle */
    g.save(); g.setLineDash([5,4]); g.strokeStyle=dlsAlpha(C.muted,0.8); g.lineWidth=1; g.beginPath(); g.moveTo(cx-len*0.56,cy); g.lineTo(cx+len*0.56,cy); g.stroke(); g.restore();
    if(Math.abs(pitch)>0.3) dlsPlate(g,"θ = "+dlsFmt(pitch,Math.abs(pitch-Math.round(pitch))<0.05?0:1)+"°",cx-len*0.5,cy+(pitch>0?m.fs*1.6:-m.fs*1.6),C,{c:C.accent,s:m.fm+0.5,w:700,m:true,a:"left"}); }
  /* name of the highlighted part with a leader */
  if(hi!=="none"&&anc[hi]){ let ax=cx+anc[hi][0]*len, ay=cy+anc[hi][1]*len; if(view==="side"){ const c=Math.cos(pitch*D2R), s=Math.sin(pitch*D2R), x=anc[hi][0]*len, y=(anc[hi][1]+0.04)*len; ax=cx+x*c-y*s; ay=cy+x*s+y*c-0.04*len; }
    const t=names[hi], tw=dlsTW(g,t,m.fs+0.5,700)+12, px=q.x+q.w-4, py=q.y+m.fs*1.2;
    g.save(); g.strokeStyle=dlsAlpha(C.accent,0.9); g.lineWidth=1.3; g.beginPath(); g.moveTo(ax,ay); g.lineTo(px-tw,py); g.stroke(); g.restore(); dlsPt(g,ax,ay,3,C.accent,C.panel,1.2);
    dlsPlate(g,t,px,py,C,{c:C.accent,s:m.fs+0.5,w:700,a:"right",line:dlsAlpha(C.accent,0.6)}); }
  dlsT(g,view==="side"?"منظر جانبي":view==="top"?"منظر علوي":"منظر أمامي",q.x+2,q.y+q.h-m.fs*0.5,{c:C.muted,s:m.fm,a:"left"});
});

/* =========================== mohr =========================== */
dlsReg("mohr",function(g,r,S,C,p,T){
  const m=dlsM(r), top=dlsTitle(g,r,m,p,S,C), q=dlsQ(r,m,top);
  const sx=dlsNum(p.sx), sy=dlsNum(p.sy), tx=dlsNum(p.txy), c0=(sx+sy)/2, Rr=Math.hypot((sx-sy)/2,tx), s1=c0+Rr, s2=c0-Rr, phi=Math.atan2(tx,(sx-sy)/2), thp=phi/2/D2R;
  const showEl=!m.ph&&q.w>=470&&q.h>=300, elW=showEl?Math.min(q.h*0.42,q.w*0.28):0, pr={x:q.x+(showEl?elW+18:6),y:q.y+m.fs*1.3,w:q.w-(showEl?elW+18:6)-8,h:q.h-m.fs*2.6};
  const xlo=Math.min(s2,0), xhi=Math.max(s1,0), xspan=Math.max(xhi-xlo,1e-9), k=Math.min(pr.w/(xspan*1.3),Rr>1e-9?pr.h/(2*Rr*1.5):1e18), kk=isFinite(k)&&k>0?k:1;
  const ox=pr.x+(pr.w-xspan*kk)/2-xlo*kk, oy=pr.y+pr.h/2, X=v=>ox+v*kk, Y=v=>oy-v*kk, ccx=X(c0), rpx=Rr*kk;
  /* axes */
  g.strokeStyle=C.muted; g.lineWidth=1.2; dlsArrow(g,pr.x,oy,pr.x+pr.w,oy,C.muted,1.3,7); dlsArrow(g,ox,pr.y+pr.h,ox,pr.y-2,C.muted,1.3,7);
  dlsT(g,"σ",pr.x+pr.w-4,oy+m.fs,{c:C.ink,s:m.fs+1,w:700,m:true}); dlsT(g,"τ",ox+m.fs*0.8,pr.y+2,{c:C.ink,s:m.fs+1,w:700,m:true});
  /* the circle */
  g.fillStyle=dlsAlpha(C.accent,0.1); g.strokeStyle=C.accent; g.lineWidth=m.ph?2:2.4; g.beginPath(); g.arc(ccx,oy,Math.max(rpx,1),0,Math.PI*2); g.fill(); g.stroke();
  const ptX=[X(sx),Y(tx)], ptY=[X(sy),Y(-tx)];
  g.save(); g.setLineDash([5,3]); g.strokeStyle=C.ink; g.lineWidth=1.3; g.beginPath(); g.moveTo(ptX[0],ptX[1]); g.lineTo(ptY[0],ptY[1]); g.stroke(); g.restore();
  /* the angle 2θp between the σ axis and the diameter through the point (σx, τxy) */
  if(rpx>10&&Math.abs(phi)>0.02){ const rho=Math.min(rpx*0.45,38); g.strokeStyle=dlsCol(C,"gear"); g.lineWidth=1.8; g.beginPath(); g.arc(ccx,oy,rho,Math.min(0,-phi),Math.max(0,-phi)); g.stroke();
  }
  /* special points */
  const tiny=rpx<6, nearX=Math.hypot(ptX[0]-ccx,ptX[1]-Y(Rr))<9||Math.hypot(ptY[0]-ccx,ptY[1]-Y(Rr))<9||Math.hypot(ptX[0]-ccx,ptX[1]-Y(-Rr))<9;
  const pts=tiny?[[X(s1),oy,"power","σ₁ = σ₂ = "+dlsFmt(s1),0]]:[[X(s1),oy,"power","σ₁ = "+dlsFmt(s1),1],[X(s2),oy,"power","σ₂ = "+dlsFmt(s2),-1],[ccx,Y(Rr),"hyd","τmax = "+dlsFmt(Rr),nearX?2:0],[ccx,Y(-Rr),"hyd",null,0]];
  pts.forEach(o=>{ dlsPt(g,o[0],o[1],4.6,dlsCol(C,o[2]),C.panel,1.4); if(o[3]){ const lx=o[4]===0?dlsCl(o[0],pr.x+50,pr.x+pr.w-50):o[4]===2?dlsCl(o[0]+(m.ph?44:56),pr.x+44,pr.x+pr.w-44):dlsCl(o[0]+o[4]*(m.ph?6:10),pr.x+44,pr.x+pr.w-44), ly=o[4]===0?dlsCl(o[1]-14,pr.y+6,pr.y+pr.h):o[4]===2?o[1]+2:oy+(m.ph?17:20); dlsPlate(g,o[3],lx,ly,C,{c:dlsCol(C,o[2]),s:m.fm,w:700,m:true,line:dlsAlpha(dlsCol(C,o[2]),0.4)}); } });
  if(!tiny) [[ptX,"X","ctrl"],[ptY,"Y","fuel"]].forEach(([pt,l,c])=>{ dlsPt(g,pt[0],pt[1],5.2,dlsCol(C,c),C.panel,1.6); const dx=pt[0]-ccx, dy=pt[1]-oy, L=Math.hypot(dx,dy)||1; dlsT(g,l,pt[0]+dx/L*13,pt[1]+dy/L*13,{c:dlsCol(C,c),s:m.fs+1,w:700,m:true}); });
  dlsPt(g,ccx,oy,2.5,C.ink);
  dlsT(g,"2θp = "+dlsFmt(2*thp,Math.abs(2*thp-Math.round(2*thp))<0.05?0:1)+"°",pr.x+pr.w-2,q.y+q.h-m.fs*1.9,{c:dlsCol(C,"gear"),s:m.fm,w:700,m:true,a:"right"});
  dlsT(g,"θp = "+dlsFmt(thp,Math.abs(thp-Math.round(thp))<0.05?0:1)+"°",pr.x+pr.w-2,q.y+q.h-m.fs*0.4,{c:C.muted,s:m.fm,w:600,m:true,a:"right"});
  /* the stress element */
  if(showEl){ const e=elW*0.5, ex=q.x+8+elW/2, ey=q.y+q.h/2, mx=Math.max(Math.abs(sx),Math.abs(sy),Math.abs(tx),1e-9), al=v=>(8+Math.abs(v)/mx*e*0.42)*Math.sign(v||1);
    g.fillStyle=dlsMix(C.panel,C.struct,0.18); g.strokeStyle=C.ink; g.lineWidth=1.4; g.fillRect(ex-e/2,ey-e/2,e,e); g.strokeRect(ex-e/2,ey-e/2,e,e);
    const cN=dlsCol(C,"ctrl"), cT=dlsCol(C,"gear"), a1=al(sx), a2=al(sy);
    if(Math.abs(sx)>1e-12){ dlsArrow(g,ex+e/2,ey,ex+e/2+a1,ey,cN,2.2,7); dlsArrow(g,ex-e/2,ey,ex-e/2-a1,ey,cN,2.2,7); }
    if(Math.abs(sy)>1e-12){ dlsArrow(g,ex,ey-e/2,ex,ey-e/2-a2,cN,2.2,7); dlsArrow(g,ex,ey+e/2,ex,ey+e/2+a2,cN,2.2,7); }
    if(Math.abs(tx)>1e-12){ const a=al(tx)*0.8, sg=Math.sign(tx), o=e*0.22; dlsArrow(g,ex+e/2+5,ey+o,ex+e/2+5,ey+o-sg*Math.abs(a),cT,2,6); dlsArrow(g,ex-e/2-5,ey-o,ex-e/2-5,ey-o+sg*Math.abs(a),cT,2,6); dlsArrow(g,ex-o,ey-e/2-5,ex-o+sg*Math.abs(a),ey-e/2-5,cT,2,6); dlsArrow(g,ex+o,ey+e/2+5,ex+o-sg*Math.abs(a),ey+e/2+5,cT,2,6); }
    dlsT(g,"σx = "+dlsFmt(sx),ex,ey+e/2+m.fs*2.6,{c:cN,s:m.fm,w:600,m:true}); dlsT(g,"σy = "+dlsFmt(sy),ex,ey+e/2+m.fs*3.9,{c:cN,s:m.fm,w:600,m:true}); dlsT(g,"τxy = "+dlsFmt(tx),ex,ey+e/2+m.fs*5.2,{c:cT,s:m.fm,w:600,m:true}); }
});

/* =========================== section =========================== */
dlsReg("section",function(g,r,S,C,p,T){
  const m=dlsM(r), top=dlsTitle(g,r,m,p,S,C), q=dlsQ(r,m,top), kind=["i","box","tube","rect","circle","z"].indexOf(p.kind)>=0?p.kind:"i";
  const h=Math.max(1e-6,dlsNum(p.h,10)), bIn=Math.max(1e-6,dlsNum(p.b,5)), round=kind==="circle"||kind==="tube", b=round?h:bIn;
  let tw=dlsOk(p.tw)&&p.tw>0?p.tw:Math.min(b,h)*0.12, tf=dlsOk(p.tf)&&p.tf>0?p.tf:Math.min(b,h)*0.15;
  if(kind==="tube"){ tw=Math.min(tw,h*0.45); } else if(kind==="box"){ tw=Math.min(tw,b*0.45); tf=Math.min(tf,h*0.45); } else { tw=Math.min(tw,b*0.8); tf=Math.min(tf,h*0.45); }
  let A,I;
  if(kind==="rect"){ A=b*h; I=b*h*h*h/12; } else if(kind==="circle"){ A=Math.PI*h*h/4; I=Math.PI*Math.pow(h,4)/64; }
  else if(kind==="tube"){ const d=Math.max(0,h-2*tw); A=Math.PI/4*(h*h-d*d); I=Math.PI/64*(Math.pow(h,4)-Math.pow(d,4)); }
  else if(kind==="box"){ A=b*h-(b-2*tw)*(h-2*tf); I=(b*h*h*h-(b-2*tw)*Math.pow(h-2*tf,3))/12; }
  else if(kind==="i"){ A=2*b*tf+(h-2*tf)*tw; I=(b*h*h*h-(b-tw)*Math.pow(h-2*tf,3))/12; }
  else { A=2*b*tf+(h-2*tf)*tw; I=tw*Math.pow(h-2*tf,3)/12+2*(b*tf*tf*tf/12+b*tf*Math.pow((h-tf)/2,2)); }
  const Z=I/(h/2), bbw=kind==="z"?2*b-tw:b, showStress=!m.ph&&q.w>=430, secW=showStress?q.w*0.5:q.w-12, ml=m.ph?26:34, mb=m.fs*2.8;
  const sc=Math.max(1e-9,Math.min((secW-ml-18)/bbw,(q.h-mb-m.fs*2.2-(m.ph?m.fs*2.2:0))/h)), cx=q.x+ml+(secW-ml)/2, cy=q.y+(q.h-mb-(m.ph?m.fs*2.2:0))/2+m.fs*0.4, W=bbw*sc, H=h*sc, x0=cx-W/2, y0=cy-H/2;
  const fill=dlsMix(C.panel,C.struct,0.38), ink=C.ink;
  g.fillStyle=fill; g.strokeStyle=ink; g.lineWidth=m.lw*1.3; g.lineJoin="round";
  const P=(xx,yy)=>[cx+xx*sc,cy+yy*sc];
  if(kind==="rect"){ g.fillRect(x0,y0,W,H); g.strokeRect(x0,y0,W,H); }
  else if(kind==="circle"){ g.beginPath(); g.arc(cx,cy,H/2,0,Math.PI*2); g.fill(); g.stroke(); }
  else if(kind==="tube"){ g.beginPath(); g.arc(cx,cy,H/2,0,Math.PI*2); g.arc(cx,cy,Math.max(0,H/2-tw*sc),0,Math.PI*2,true); g.fill("evenodd"); g.beginPath(); g.arc(cx,cy,H/2,0,Math.PI*2); g.stroke(); g.beginPath(); g.arc(cx,cy,Math.max(0,H/2-tw*sc),0,Math.PI*2); g.stroke(); }
  else if(kind==="box"){ g.beginPath(); g.rect(x0,y0,W,H); g.rect(x0+tw*sc,y0+tf*sc,W-2*tw*sc,H-2*tf*sc); g.fill("evenodd"); g.strokeRect(x0,y0,W,H); g.strokeRect(x0+tw*sc,y0+tf*sc,W-2*tw*sc,H-2*tf*sc); }
  else if(kind==="i"){ const pts=[[-b/2,-h/2],[b/2,-h/2],[b/2,-h/2+tf],[tw/2,-h/2+tf],[tw/2,h/2-tf],[b/2,h/2-tf],[b/2,h/2],[-b/2,h/2],[-b/2,h/2-tf],[-tw/2,h/2-tf],[-tw/2,-h/2+tf],[-b/2,-h/2+tf]].map(a=>P(a[0],a[1])); dlsPoly(g,pts,true); g.fill(); g.stroke(); }
  else { const pts=[[-tw/2,-h/2],[-tw/2+b,-h/2],[-tw/2+b,-h/2+tf],[tw/2,-h/2+tf],[tw/2,h/2],[tw/2-b,h/2],[tw/2-b,h/2-tf],[-tw/2,h/2-tf]].map(a=>P(a[0],a[1])); dlsPoly(g,pts,true); g.fill(); g.stroke(); }
  /* z section: the flanges reach out beyond the box (b measured from the web edge), so the bounding width is b + tw */
  /* neutral axis and centroid */
  const naL=x0-10, naR=x0+W+10; g.save(); g.setLineDash([7,4]); g.strokeStyle=dlsCol(C,"power"); g.lineWidth=1.6; g.beginPath(); g.moveTo(naL,cy); g.lineTo(naR,cy); g.stroke(); g.restore();
  g.strokeStyle=dlsCol(C,"power"); g.lineWidth=1.6; dlsPt(g,cx,cy,4.4,C.panel,dlsCol(C,"power"),1.8); g.beginPath(); g.moveTo(cx-4.4,cy); g.lineTo(cx+4.4,cy); g.moveTo(cx,cy-4.4); g.lineTo(cx,cy+4.4); g.stroke();
  dlsPlate(g,"محور الحياد",naR,cy-(m.ph?10:12),C,{c:dlsCol(C,"power"),s:m.fm,w:600,a:"right"});
  /* dimensions */
  const dc=C.muted, hx=x0-(m.ph?11:15); dlsDim(g,hx,y0,hx,y0+H,dc,1.2); dlsPlate(g,"h = "+dlsFmt(h),hx,cy+(m.ph?22:30),C,{c:C.ink,s:m.fm,w:600,m:true,a:"center"});
  const by=y0+H+(m.ph?12:16); if(!round){ const bw2=bIn*sc; dlsDim(g,x0,by,x0+bw2,by,dc,1.2); dlsPlate(g,"b = "+dlsFmt(bIn),x0+bw2/2,by,C,{c:C.ink,s:m.fm,w:600,m:true}); }
  if((kind==="i"||kind==="z"||kind==="box")&&tw*sc>=4){ const wy=cy-H*0.22; dlsDim(g,cx-tw*sc/2,wy,cx+tw*sc/2,wy,dlsCol(C,"accent"),1.2); dlsPlate(g,"tw",cx+tw*sc/2+ (m.ph?10:14),wy,C,{c:dlsCol(C,"accent"),s:m.fm,w:700,m:true}); }
  if((kind==="i"||kind==="z"||kind==="box")&&tf*sc>=4){ const fx=x0+W+(m.ph?8:12); dlsDim(g,fx,y0,fx,y0+tf*sc,dlsCol(C,"accent"),1.2); dlsPlate(g,"tf",fx+(m.ph?9:12),y0+tf*sc/2,C,{c:dlsCol(C,"accent"),s:m.fm,w:700,m:true}); }
  if(kind==="tube"&&tw*sc>=4){ const ty=cy; dlsPlate(g,"t",cx+H/2-tw*sc/2,ty+H*0.12,C,{c:dlsCol(C,"accent"),s:m.fm,w:700,m:true}); }
  /* bending stress: compression above the neutral axis, tension below it */
  if(showStress){ const xs=q.x+q.w*0.74, Wd=Math.min(q.w*0.1,58), cN=dlsCol(C,"ctrl"), cT=dlsCol(C,"power");
    g.save(); g.setLineDash([3,4]); g.strokeStyle=dlsAlpha(C.muted,0.8); g.lineWidth=1; [y0,cy,y0+H].forEach(y=>{ g.beginPath(); g.moveTo(naR+4,y); g.lineTo(xs+Wd+8,y); g.stroke(); }); g.restore();
    g.strokeStyle=C.muted; g.lineWidth=1.4; g.beginPath(); g.moveTo(xs,y0-8); g.lineTo(xs,y0+H+8); g.stroke();
    g.fillStyle=dlsAlpha(cN,0.28); dlsPoly(g,[[xs,cy],[xs,y0],[xs-Wd,y0]],true); g.fill(); g.strokeStyle=cN; g.lineWidth=1.8; dlsPoly(g,[[xs,cy],[xs-Wd,y0],[xs,y0]],false); g.stroke();
    g.fillStyle=dlsAlpha(cT,0.28); dlsPoly(g,[[xs,cy],[xs,y0+H],[xs+Wd,y0+H]],true); g.fill(); g.strokeStyle=cT; dlsPoly(g,[[xs,cy],[xs+Wd,y0+H],[xs,y0+H]],false); g.stroke();
    for(let i=1;i<=3;i++){ const f=i/4, yu=cy-(cy-y0)*f, yl=cy+(y0+H-cy)*f; dlsArrow(g,xs,yu,xs-Wd*f,yu,cN,1.5,5); dlsArrow(g,xs,yl,xs+Wd*f,yl,cT,1.5,5); }
    dlsT(g,"ضغط",xs-Wd-6,y0+10,{c:cN,s:m.fm,w:600,a:"right"}); dlsT(g,"شد",xs+Wd+6,y0+H-10,{c:cT,s:m.fm,w:600,a:"left"}); dlsT(g,"σ",xs,y0-m.fs*1.1,{c:C.ink,s:m.fs+1,w:700,m:true}); }
  /* numbers */
  const info=["A = "+dlsFmt(A),"I = "+dlsFmt(I),"Z = "+dlsFmt(Z)];
  if(showStress) info.forEach((t,i)=>dlsT(g,t,q.x+q.w-2,q.y+m.fs*(0.7+i*1.45),{c:C.ink,s:m.fm+0.5,w:600,m:true,a:"right"}));
  else dlsTF(g,info.join("   "),q.x+q.w/2,q.y+q.h-m.fs*0.6,q.w,{c:C.ink,s:m.fm,w:600,m:true});
});

/* =========================== shock =========================== */
/* theta-beta-Mach relation (gamma 1.4): the weak oblique shock for a wedge of half angle th, or a detached shock when th exceeds the maximum */
function dlsShockSolve(M,th){
  const gam=1.4, mu=Math.asin(Math.min(1,1/M)), f=b=>Math.atan(2/Math.tan(b)*(M*M*Math.sin(b)*Math.sin(b)-1)/(M*M*(gam+Math.cos(2*b))+2));
  let bm=mu, fm=0; for(let i=1;i<=300;i++){ const b=mu+(Math.PI/2-mu)*i/300, v=f(b); if(v>fm){ fm=v; bm=b; } }
  if(th<=1e-9) return {beta:mu,mu,thmax:fm};
  if(th>fm) return {detached:true,mu,thmax:fm};
  let lo=mu, hi=bm; for(let i=0;i<50;i++){ const mid=(lo+hi)/2; if(f(mid)<th) lo=mid; else hi=mid; } return {beta:(lo+hi)/2,mu,thmax:fm};
}
function dlsShockAfter(M,beta,th){
  const gam=1.4, Mn=M*Math.sin(beta), M2=Math.sqrt((1+0.2*Mn*Mn)/(gam*Mn*Mn-0.2))/Math.max(1e-6,Math.sin(beta-th)), pr=1+2*gam/(gam+1)*(Mn*Mn-1), rr=(gam+1)*Mn*Mn/((gam-1)*Mn*Mn+2), tr=pr/rr;
  return {M2,pr,u:M2/M*Math.sqrt(tr)};
}
dlsReg("shock",function(g,r,S,C,p,T){
  const m=dlsM(r), top=dlsTitle(g,r,m,p,S,C), q=dlsQ(r,m,top), M=Math.max(0.05,dlsNum(p.M,2)), thD=dlsCl(dlsNum(p.th,10),0,60), th=thD*D2R;
  const sub=M<=1.0001; let sol=sub?{}:dlsShockSolve(M,th), beta=sol.beta, det=!!sol.detached;
  if(!sub&&dlsOk(p.beta)&&!det&&p.beta>0){ beta=dlsCl(p.beta*D2R,sol.mu*1.002,Math.PI/2-0.002); }
  const wave=!sub&&th<=1e-9, after=!sub&&!det&&!wave&&beta>th?dlsShockAfter(M,beta,th):null, ratio=after?dlsCl(after.u,0.25,1):(det?0.45:1);
  const ax=q.x+q.w*0.2, cy=q.y+q.h/2, xmax=q.x+q.w, Lw=Math.min(q.w*0.4,Math.max(20,q.h*0.34/Math.max(Math.tan(th),0.06))), tipH=Lw*Math.tan(th);
  const tb=Math.tan(beta||1), tt=Math.tan(th);
  /* compressed region */
  if(after){ [1,-1].forEach(sg=>{ const far=xmax-ax, S2=[xmax,cy-sg*far*tb], E2=[xmax,cy-sg*far*tt]; g.fillStyle=dlsAlpha(C.power,0.1); dlsPoly(g,[[ax,cy],S2,E2],true); g.fill(); }); }
  else if(det){ g.fillStyle=dlsAlpha(C.power,0.05); const d=q.w*0.12, xn=ax-d, c=1/(2*q.h)*Math.max(0.5,Math.sqrt(Math.max(M*M-1,0.01))); g.beginPath(); for(let y=-q.h/2;y<=q.h/2;y+=6){ const x=xn+c*y*y*0.9; y===-q.h/2?g.moveTo(x,cy+y):g.lineTo(x,cy+y); } g.lineTo(xmax,cy+q.h/2); g.lineTo(xmax,cy-q.h/2); g.closePath(); g.fill(); }
  /* streamlines: horizontal ahead of the shock, parallel to the wedge face behind it */
  const nl=m.ph?4:6, sp=q.h/2/(nl+0.3), lines=[]; const v1=62;
  const bow=(h)=>{ const d=q.w*0.12, c=1/(2*q.h)*Math.max(0.5,Math.sqrt(Math.max(M*M-1,0.01)))*0.9; return ax-d+c*h*h; };
  for(let i=0;i<nl;i++){ const h=sp*(i+0.55); [1,-1].forEach(sg=>{ let pts;
    if(sub){ pts=[]; for(let x=q.x;x<=xmax;x+=8){ const bump=tipH*0.9*Math.exp(-Math.pow((x-(ax+Lw*0.7))/(Lw*0.9),2))*Math.exp(-h/(q.h*0.2)); pts.push([x,cy-sg*(h+bump)]); } }
    else if(det){ const xb=bow(h); pts=[[q.x,cy-sg*h],[xb,cy-sg*h]]; for(let x=xb;x<=xmax+8;x+=8){ const u=Math.min(1,(x-xb)/(q.w*0.3)), wh=x>ax?Math.min(1,(x-ax)/Lw)*tipH:0; pts.push([x,cy-sg*Math.max(h+(x-xb)*tt*u+tipH*0.35*Math.exp(-h/(q.h*0.15))*u,wh+5)]); } }
    else { const xs=ax+h/tb; pts=[[q.x,cy-sg*h],[Math.min(xs,xmax),cy-sg*h]]; if(xs<xmax) pts.push([xmax,cy-sg*(h+(xmax-xs)*tt)]); }
    lines.push(pts); }); }
  g.lineWidth=1.1; lines.forEach(pts=>{ g.strokeStyle=dlsAlpha(C.ctrl,0.3); dlsPoly(g,pts); g.stroke(); });
  g.lineCap="round"; lines.forEach((pts,li)=>{ const segT=[],cum=[0]; let tot=0; for(let i=1;i<pts.length;i++){ const L=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]), after2=!sub&&((det?pts[i-1][0]>bow(Math.abs(pts[i-1][1]-cy)):pts[i-1][0]>=ax+Math.abs(pts[i-1][1]-cy)/Math.max(tb,1e-6)-0.5)||(sub&&false)), v=after2?v1*ratio:v1; tot+=L/v; cum.push(tot); }
    if(!(tot>0)) return; const np=Math.max(2,Math.round(tot/0.55)), per=tot/np;
    for(let k=0;k<np;k++){ const t=((T*0.9+k*per+li*0.13)%tot+tot)%tot, t0=Math.max(0,t-0.1); const at=(tt2)=>{ let a=1; while(a<cum.length-1&&cum[a]<tt2) a++; const f=(tt2-cum[a-1])/Math.max(cum[a]-cum[a-1],1e-9); return [pts[a-1][0]+(pts[a][0]-pts[a-1][0])*f,pts[a-1][1]+(pts[a][1]-pts[a-1][1])*f]; };
      const P1=at(t), P0=at(t0), slow=(P1[0]>ax+Math.abs(P1[1]-cy)/Math.max(tb,1e-6)); g.strokeStyle=dlsAlpha(slow&&!sub?dlsMix(C.ctrl,C.power,0.8):C.ctrl,0.95*Math.min(1,t/0.3,(tot-t)/0.3)); g.lineWidth=m.ph?1.8:2.3; g.beginPath(); g.moveTo(P0[0],P0[1]); g.lineTo(P1[0],P1[1]); g.stroke(); } });
  /* shocks and Mach waves */
  const pc=dlsCol(C,"power");
  if(after){ [1,-1].forEach(sg=>{ g.strokeStyle=pc; g.lineWidth=m.ph?2.4:3; g.beginPath(); g.moveTo(ax,cy); g.lineTo(ax+(xmax-ax)*1.0,cy-sg*(xmax-ax)*tb); g.stroke(); }); }
  else if(det){ g.strokeStyle=pc; g.lineWidth=m.ph?2.4:3; g.beginPath(); const c=1/(2*q.h)*Math.max(0.5,Math.sqrt(Math.max(M*M-1,0.01)))*0.9, d=q.w*0.12; for(let y=-q.h/2;y<=q.h/2;y+=4){ const x=ax-d+c*y*y; y===-q.h/2?g.moveTo(x,cy+y):g.lineTo(x,cy+y); } g.stroke(); }
  if(wave){ g.save(); g.setLineDash([6,4]); [0,0.38,0.76].forEach((f,i)=>{ const x1=ax+Lw*f; g.strokeStyle=dlsAlpha(pc,0.9-i*0.25); g.lineWidth=m.ph?1.6:2; [1,-1].forEach(sg=>{ g.beginPath(); g.moveTo(x1,cy); g.lineTo(xmax,cy-sg*(xmax-x1)*Math.tan(sol.mu)); g.stroke(); }); }); g.restore(); }
  if(!sub&&sol.mu&&th>1e-9&&!det){ g.save(); g.setLineDash([5,4]); g.strokeStyle=dlsAlpha(C.muted,0.9); g.lineWidth=1; [1,-1].forEach(sg=>{ g.beginPath(); g.moveTo(ax,cy); g.lineTo(xmax,cy-sg*(xmax-ax)*Math.tan(sol.mu)); g.stroke(); }); g.restore(); }
  /* the wedge */
  g.fillStyle=dlsMix(C.panel,C.struct,0.42); g.strokeStyle=C.ink; g.lineWidth=m.lw*1.4; g.lineJoin="round"; dlsPoly(g,[[ax,cy],[ax+Lw,cy-tipH],[ax+Lw,cy+tipH]],true); g.fill(); g.stroke();
  /* angles and numbers */
  const ar=Math.min(q.w*0.12,46);
  if(th>0.01){ g.strokeStyle=C.ink; g.lineWidth=1.4; g.beginPath(); g.arc(ax,cy,ar*0.62,-th,0); g.stroke(); dlsPlate(g,"θ = "+dlsFmt(thD,Math.abs(thD-Math.round(thD))<0.05?0:1)+"°",ax+ar*0.62+14,cy+m.fs*1.4,C,{c:C.ink,s:m.fm,w:700,m:true,a:"left"}); }
  if(after){ const bd=beta/D2R; g.strokeStyle=pc; g.lineWidth=1.6; g.beginPath(); g.arc(ax,cy,ar,-beta,0); g.stroke(); const lx=ax+Math.cos(beta)*(Math.min(q.w*0.55,(q.h/2-8)/Math.sin(beta)))*0.9, ly=cy-Math.sin(beta)*(Math.min(q.w*0.55,(q.h/2-8)/Math.sin(beta)))*0.9;
    dlsPlate(g,"β = "+dlsFmt(bd,Math.abs(bd-Math.round(bd))<0.05?0:1)+"°",dlsCl(lx+12,q.x+40,q.x+q.w-40),dlsCl(ly+m.fs*0.3,q.y+10,q.y+q.h-10),C,{c:pc,s:m.fm,w:700,m:true,line:dlsAlpha(pc,0.5)}); }
  dlsPlate(g,"M = "+dlsFmt(M),q.x+2,q.y+m.fs*0.8,C,{c:C.ink,s:m.fm+0.5,w:700,m:true,a:"left"});
  if(after){ dlsPlate(g,"M₂ = "+dlsFmt(after.M2),q.x+2,q.y+m.fs*0.8+m.fm*2.1,C,{c:C.ink,s:m.fm,w:600,m:true,a:"left"}); if(!m.ph) dlsPlate(g,"p₂/p₁ = "+dlsFmt(after.pr),q.x+2,q.y+m.fs*0.8+m.fm*4.2,C,{c:C.ink,s:m.fm,w:600,m:true,a:"left"}); }
  const msg=sub?"سرعة دون صوتية: لا توجد موجة صدمة":det?"الزاوية أكبر من الحدّ: موجة صدمة منفصلة":(th<=1e-9?"موجات ماخ":null);
  if(msg) dlsPlate(g,msg,q.x+q.w/2,q.y+q.h-m.fs*1.2,C,{c:det?pc:C.muted,s:m.fm+0.5,w:600,line:dlsAlpha(det?pc:C.muted,0.45)});
});

/*END*/
