/* ---------- FCU (Airbus) / MCP (Boeing) elements: w = window with +/- zones, b = button; widths are relative ---------- */
const FD_STRIP={
  airbus:[["w","SPD",.15,"spd"],["w","HDG",.15,"hdg"],["g","",.025],["b","AP1",.07,"apon"],["b","A/THR",.085,"athr"],["b","LOC",.07,"loc"],["b","APPR",.085,"appr"],["g","",.025],["w","ALT",.16,"alt"],["w","V/S",.14,"vs"]],
  boeing:[["w","CRS",.075,"crs"],["b","A/T",.065,"athr"],["w","IAS/MACH",.115,"spd"],["b","LNAV",.06,"lnav"],["b","VNAV",.06,"vnav"],["w","HDG",.115,"hdg"],["w","ALT",.125,"alt"],["w","V/S",.105,"vs"],["b","CMD A",.07,"apon"],["b","CMD B",.065,"cmdb"],["b","APP",.065,"appr"],["w","CRS",.075,"crs"]]
};
/* ---------- layout ---------- */
function fdLay(W,H){
  const fam=fdFam(), key=W+"|"+H+"|"+FD.big+"|"+FD.enl+"|"+fam+"|"+FLY.key+"|"+FD.ndMode+"|"+(document.documentElement.lang||"");
  if(FD.lay&&FD.key===key) return FD.lay; FD.key=key;
  const port=H>W*1.05, big=FD.big, boe=fam==="boeing", n=(FPH_AC[FLY.key]||FPH_AC.b737).n, L={W,H,port,fam,big,boe,n,key,d:{},fo:{}};
  if(!FD.ndMode||FD.famSeen!==fam){ FD.ndMode=boe?"rose":"arc"; FD.famSeen=fam; }
  let gx, gw;
  if(port){
    const pt=Math.round(H*(big?0.33:0.40)), gh=Math.round(Math.max(36,W*0.105)), gp=4, ds=Math.floor((W-3*gp)/2), y=pt+gh+gp, y2=y+ds+gp, h2=Math.max(54,Math.min(92,H-196-y2));
    const wE=Math.round((W-3*gp)*0.58); L.pt=pt; L.ph=H-pt; L.gh=gh; L.ds=ds; L.d.pfd={x:gp,y,w:ds,h:ds}; L.d.nd={x:2*gp+ds,y,w:ds,h:ds}; L.d.ewd={x:gp,y:y2,w:wE,h:h2}; L.d.sd={x:2*gp+wE,y:y2,w:W-3*gp-wE,h:h2}; gx=gp; gw=W-2*gp; L.mx=0;
  } else {
    const ph0=Math.round(H*(big?0.53:0.42)), gh=Math.round(Math.max(24,ph0*0.21)), pad=Math.max(3,Math.round(ph0*0.035)), hf=ph0-gh-pad*2, ml=H<=430?126:150, mr=76;
    const units=big?(2+1.3+0.34):(2+1.6+1.3+0.34), ng=big?3:5, ds=Math.floor(Math.min(hf,(W-ml-mr)/(units+ng*0.045))), gap=Math.max(3,Math.round(ds*0.045)), wC=Math.round(ds*1.3), wL=Math.round(ds*0.34), wF=big?0:Math.round(ds*0.8);
    const tot=2*ds+wC+wL+2*wF+ng*gap, x0=Math.round(ml+(W-ml-mr-tot)/2), ph=gh+pad*2+ds, pt=H-ph, y=pt+gh+pad; let x=x0; L.pt=pt; L.ph=ph; L.gh=gh; L.ds=ds;
    L.d.pfd={x,y,w:ds,h:ds}; x+=ds+gap; L.d.nd={x,y,w:ds,h:ds}; x+=ds+gap; const hE=Math.round(ds*0.55); L.d.ewd={x,y,w:wC,h:hE}; L.d.sd={x,y:y+hE+gap,w:wC,h:ds-hE-gap}; L.cxm=x+wC/2; x+=wC+gap; L.lev={x,y,w:wL,h:ds}; x+=wL+gap;
    { const lv=L.lev, sw=lv.w, rem=lv.h-sw-3, zy=lv.y+sw+3, hz=Math.round(rem*0.5)-1; L.sb={x:lv.x,y:lv.y,w:sw,h:sw}; L.gz={x:lv.x,y:zy,w:sw,h:hz}; L.fz={x:lv.x,y:zy+hz+2,w:sw/2,h:hz}; L.sz={x:lv.x+sw/2,y:zy+hz+2,w:sw/2,h:hz}; }
    if(wF){ L.fo.nd={x,y,w:wF,h:wF,id:"nd"}; x+=wF+gap; L.fo.pfd={x,y,w:wF,h:wF,id:"pfd"}; } L.x0=x0; L.x1=x0+tot;
    gw=Math.round(Math.min(ds*(boe?4.9:4.5),W*0.66)); gx=Math.round((L.cxm||W/2)-gw/2);
  }
  L.shift=Math.round(H/2-L.pt*0.5);
  /* strip elements (FCU / MCP) */
  const fy=L.pt+Math.round(L.gh*0.1), fh=Math.round(L.gh*0.82), els=FD_STRIP[boe?"boeing":"airbus"], tw=els.reduce((a,e)=>a+e[2],0), sg=port?1.5:2; let sx=gx; L.strip=[]; L.fcu={x:gx,y:fy,w:gw,h:fh};
  for(let i=0;i<els.length;i++){ const e=els[i], w=gw*e[2]/tw; if(e[0]!=="g") L.strip.push({t:e[0],lab:e[1],act:e[3],x:sx+sg/2,y:fy+fh*0.04,w:w-sg,h:fh*0.92}); sx+=w; }
  /* enlarged display: a big square (or wide box) in the middle of the window */
  if(FD.enl&&L.d[FD.enl]){ const r=L.d[FD.enl], asp=r.h/r.w, aw=port?W-8:Math.min(W*0.7,(H-52)/asp), w=Math.round(Math.min(aw,port?(L.pt+L.gh)*0.98/asp:aw)), h=Math.round(w*asp); L.enlR={x:Math.round((W-w)/2),y:Math.round(port?Math.max(48,(H*0.42-h/2)):Math.max(44,(H-h)/2)),w,h,id:FD.enl}; }
  FD.lay=L; fdPlaceDom(L); return L;
}
/* ---------- DOM: invisible hit buttons on top of the canvas (taps on displays, FCU keys), and the big-mode toggle ---------- */
function fdBtn(k,cls){ let b=FD.btn[k]; if(!b){ b=document.createElement("button"); b.type="button"; b.className=cls||"fdh"; b.dataset.k=k; FD.root.appendChild(b); FD.btn[k]=b; } return b; }
function fdPut(k,r,label,cls){ const b=fdBtn(k,cls); b.hidden=false; b.style.left=r.x+"px"; b.style.top=r.y+"px"; b.style.width=r.w+"px"; b.style.height=r.h+"px"; if(b.dataset.l!==label){ b.dataset.l=label; b.setAttribute("aria-label",label); } return b; }
function fdPlaceDom(L){
  if(!FD.root) return; for(const k in FD.btn) FD.btn[k].hidden=true;
  const o=FD.root.parentNode; o.style.setProperty("--fdph",L.ph+"px"); o.classList.toggle("fdboe",L.boe);
  if(L.enlR){ fdPut("close",{x:0,y:0,w:L.W,h:L.H},fdT("back")); const e=L.enlR; fdPut("e:"+e.id,e,fdT("back")); }
  else { ["pfd","nd","ewd","sd"].forEach(id=>fdPut("d:"+id,L.d[id],fdT(id))); for(const k in L.fo){ const r=L.fo[k]; fdPut("d:"+r.id+"f",r,fdT(r.id)); } }
  if(!L.enlR){ L.strip.forEach((e,i)=>{ if(!e.act||e.act==="crs"||e.act==="loc"||e.act==="lnav"||e.act==="vnav"||e.act==="cmdb") return; if(e.t==="b") fdPut("a:"+e.act,e,e.lab,"fdh fdz"); else { const hw=e.w/2; fdPut("a:"+e.act+"-",{x:e.x,y:e.y,w:hw,h:e.h},e.lab+" "+fdT("minus"),"fdh fdz"); fdPut("a:"+e.act+"+",{x:e.x+hw,y:e.y,w:hw,h:e.h},e.lab+" "+fdT("plus"),"fdh fdz"); } }); }
  if(L.lev&&!L.enlR){ const gz=L.gz, fz=L.fz, sz=L.sz, fh=Math.round(fz.h/2); fdPut("a:gear",gz,fdT("gear"),"fdh fdz"); fdPut("a:flapup",{x:fz.x,y:fz.y,w:fz.w,h:fh},fdT("flap")+" -","fdh fdz"); fdPut("a:flapdn",{x:fz.x,y:fz.y+fh,w:fz.w,h:fz.h-fh},fdT("flap")+" +","fdh fdz"); fdPut("a:spoil",sz,fdT("spoil"),"fdh fdz"); }
  fdChips(L); fdMeasure(L);
  const pb=fdBtn("big","fdbig"); pb.hidden=!!L.enlR; pb.textContent=FD.big?fdT("small"):fdT("big"); pb.setAttribute("aria-pressed",FD.big); const pw=Math.max(96,pb.textContent.length*8+28); pb.style.width=pw+"px"; pb.style.left=Math.round(L.W-pw-10)+"px"; pb.style.top=Math.round(L.pt-34)+"px";
  const hb=fdBtn("hide","fdbig"); hb.hidden=!!L.enlR; hb.textContent=fdT("hide")+" ▼"; hb.setAttribute("aria-label",fdT("hide")); const hw=Math.max(96,hb.textContent.length*8+28); hb.style.width=hw+"px"; hb.style.left=Math.round(L.W-pw-10-hw-8)+"px"; hb.style.top=Math.round(L.pt-34)+"px";
}
/* deck hidden: only one small button stays (bottom centre; above the bottom row of a portrait phone) and the outside view fills the screen */
function fdHidden(W,H){
  FD.root.hidden=false; const o=FD.root.parentNode, port=o.classList.contains("fport"), k=W+"|"+H+"|"+(document.documentElement.lang||"")+"|"+port;
  if(FD.hk===k) return; FD.hk=k; for(const q in FD.btn) FD.btn[q].hidden=true;
  const b=fdBtn("hide","fdbig"); b.hidden=false; b.textContent="▲ "+fdT("show"); b.setAttribute("aria-label",fdT("show")); b.removeAttribute("aria-pressed"); const w=Math.max(110,b.textContent.length*8+28);
  b.style.width=w+"px"; b.style.left=Math.round((W-w)/2)+"px"; b.style.top=Math.round(port?H-232:H-40)+"px"; o.style.setProperty("--fdph","0px");
}
function fdMeasure(L){ const o=document.getElementById("fly"); if(!o) return; const r0=o.getBoundingClientRect(), q=id=>{ const e=document.getElementById(id); if(!e) return null; const r=e.getBoundingClientRect(); return r.width?{x:r.left-r0.left,y:r.top-r0.top,w:r.width,h:r.height}:null; }; L.pad=q("fPad"); L.thr=q("fThr"); }
function fdClick(e){
  const b=e.target.closest(".fdh,.fdbig,.fdc"); if(!b) return; const k=b.dataset.k; e.stopPropagation();
  if(k==="hide"){ FD.hide=!FD.hide; FD.enl=null; FD.hk=""; fdSave(); fdView(FLY.view); for(const q in FD.btn) FD.btn[q].hidden=true; }
  else if(k==="big"){ FD.big=!FD.big; FD.enl=null; fdSave(); }
  else if(k==="close"||k[0]==="e"&&k[1]===":") FD.enl=null;
  else if(k[0]==="d"&&k[1]===":") FD.enl=k.slice(2).replace(/f$/,"");
  else if(k==="c:rng") FD.rng=(FD.rng+1)%FD_RNG.length; else if(k==="c:mode") FD.ndMode=FD.ndMode==="arc"?"rose":"arc"; else if(k==="c:page") FD.sd=(FD.sd+1)%FD_PAGES[fdFam()].length;
  else if(k[0]==="a"&&k[1]===":"){ if(typeof flyAction==="function") flyAction(k.slice(2)); return; }
  if(k[0]==="c"){ FD.sdDirty=1; FD.lay=null; FD.key=""; for(const id in FD.cv) FD.cv[id].t=-1e9; return; }
  FD.key=""; FD.lay=null;
}
function fdEnsure(){
  if(FD.root&&FD.root.isConnected) return true; const o=document.getElementById("fly"), hud=o&&o.querySelector("#flyHud"); if(!hud) return false;
  if(!document.getElementById("fdStyle")){ const st=document.createElement("style"); st.id="fdStyle"; st.textContent=FD_CSS; document.head.appendChild(st); }
  const r=document.createElement("div"); r.id="fdLay"; r.className="fdlay"; hud.after(r); FD.root=r; FD.btn={}; r.addEventListener("click",fdClick); FD.key=""; return true;
}
/* ---------- hooks from p8f.js ---------- */
function fdView(v){ const o=document.getElementById("fly"); if(!o) return; o.classList.toggle("fdk",v==="cockpit"&&FD.ok&&!FD.hide); if(FD.root) FD.root.hidden=!(v==="cockpit"&&FD.ok); if(v!=="cockpit"){ FD.enl=null; FD.key=""; } }
function fdCamView(cam,v){
  const L=FD.lay; if(v==="cockpit"&&FD.ok&&L&&!FD.hide){ const W=FLY.ren.domElement.clientWidth||L.W, H=FLY.ren.domElement.clientHeight||L.H, sh=Math.round(H/2-H*(L.pt/L.H)*0.5); cam.setViewOffset(W,H,0,sh,W,H); }
  else if(cam.view&&cam.view.enabled) cam.clearViewOffset();
}
/* ---------- panel art (cached): body, glareshield, bezels, FCU/MCP body and labels ---------- */
function fdPanelPath(g,W,pt,ph){ g.beginPath(); g.moveTo(0,pt+ph*0.1); g.quadraticCurveTo(W/2,pt-ph*0.08,W,pt+ph*0.1); g.lineTo(W,pt+ph); g.lineTo(0,pt+ph); g.closePath(); }
function fdMakeBg(L,d){
  const W=L.W, H=L.H, pt=L.pt, ph=L.ph, boe=L.boe, c=document.createElement("canvas"); c.width=Math.round(W*d); c.height=Math.round((H-pt)*d); const g=c.getContext("2d"); g.scale(d,d); g.translate(0,-pt);
  let gr=g.createLinearGradient(0,pt,0,H); if(boe){ gr.addColorStop(0,"#2b2e31"); gr.addColorStop(L.gh/ph,"#202326"); gr.addColorStop(L.gh/ph+0.001,"#a9adab"); gr.addColorStop(1,"#80847f"); } else { gr.addColorStop(0,"#161a1f"); gr.addColorStop(L.gh/ph,"#12151a"); gr.addColorStop(L.gh/ph+0.001,"#2c333c"); gr.addColorStop(1,"#171b21"); }
  fdPanelPath(g,W,pt,ph); g.fillStyle=gr; g.fill(); g.strokeStyle=boe?"rgba(255,255,255,0.22)":"rgba(190,205,220,0.20)"; g.lineWidth=2; fdPanelPath(g,W,pt,ph); g.stroke();
  /* glareshield top face and lip */
  g.fillStyle=boe?"rgba(255,255,255,0.07)":"rgba(255,255,255,0.05)"; g.fillRect(0,pt+ph*0.02,W,L.gh*0.1); g.fillStyle="rgba(0,0,0,0.35)"; g.fillRect(0,pt+L.gh-2,W,3);
  /* display bezels */
  const bz=Math.max(2,Math.round(L.ds*0.028)), bez=r=>{ g.fillStyle="rgba(0,0,0,0.4)"; fdRR(g,r.x-bz+1,r.y-bz+2,r.w+2*bz,r.h+2*bz,4); g.fill(); g.fillStyle=boe?"#16181a":"#07090b"; fdRR(g,r.x-bz,r.y-bz,r.w+2*bz,r.h+2*bz,4); g.fill(); g.strokeStyle=boe?"#5e6367":"#4b535c"; g.lineWidth=1; g.stroke(); };
  if(L.enlR){ g.fillStyle="rgba(0,0,0,0)"; } else { ["pfd","nd","ewd","sd"].forEach(id=>bez(L.d[id])); for(const k in L.fo) bez(L.fo[k]); }
  if(L.lev) fdLevStatic(g,L);
  /* FCU / MCP body and labels */
  const f=L.fcu; g.fillStyle=boe?"#40454a":"#2a3037"; fdRR(g,f.x-3,f.y-2,f.w+6,f.h+4,5); g.fill(); g.strokeStyle=boe?"#7b8187":"#556070"; g.lineWidth=1; g.stroke();
  const lf=Math.max(6,Math.round(f.h*0.22)), vf=Math.max(8,Math.round(f.h*0.44));
  L.strip.forEach(e=>{ if(e.t==="w"){ g.fillStyle="#020304"; fdRR(g,e.x,e.y+e.h*0.34,e.w,e.h*0.64,3); g.fill(); g.strokeStyle="#59616a"; g.lineWidth=0.8; g.stroke(); g.font="600 "+lf+"px "+FDF; g.textAlign="center"; g.textBaseline="middle"; g.fillStyle=boe?"#e8ecee":"#dfe6ee"; g.fillText(e.lab,e.x+e.w/2,e.y+e.h*0.17); }
    else { g.fillStyle=boe?"#cfd3d4":"#3a424c"; fdRR(g,e.x,e.y+e.h*0.1,e.w,e.h*0.8,3); g.fill(); g.strokeStyle=boe?"#8a9094":"#6a7480"; g.lineWidth=0.8; g.stroke(); } });
  /* a small EFIS-style knob cluster at both ends of the Airbus glareshield, and the model plate */
  if(!boe){ [[L.fcu.x-Math.min(60,L.fcu.x*0.5)-4,1],[L.fcu.x+L.fcu.w+8,1]].forEach(([x])=>{ if(x<4||x+50>W) return; g.fillStyle="#232a31"; fdRR(g,x,f.y,Math.min(52,W*0.07),f.h,4); g.fill(); g.strokeStyle="#4a5460"; g.stroke(); g.fillStyle="#7a8794"; g.beginPath(); g.arc(x+13,f.y+f.h*0.5,Math.max(3,f.h*0.2),0,7); g.fill(); g.beginPath(); g.arc(x+34,f.y+f.h*0.5,Math.max(3,f.h*0.2),0,7); g.fill(); }); }
  return c;
}
/* dynamic FCU/MCP: window values and lit buttons */
function fdStripDyn(g,L,s){
  const ap=s.ap, boe=L.boe, f=L.fcu, lf=Math.max(6,Math.round(f.h*0.24)), wc=boe?"#ff8a2a":FDC.amb;
  for(let i=0;i<L.strip.length;i++){ const e=L.strip[i];
    if(e.t==="w"){ let v;
      switch(e.act){ case "spd": v=String(Math.round(ap.spd)); break; case "hdg": v=fdP3(ap.hdg); break; case "alt": v=boe?String(ap.alt).padStart(5,"0"):String(ap.alt); break;
        case "vs": v=ap.vert==="VS"?(ap.vs>=0?"+":"-")+String(Math.abs(ap.vs)).padStart(boe?4:4,"0"):(boe?"":"-----"); break; default: v=boe?"---":""; }
      const fs=Math.min(e.h*0.5,(e.w-4)/(Math.max(3,v.length)*0.62)); g.font="700 "+fs+"px "+FDF; g.textAlign="center"; g.textBaseline="middle"; g.fillStyle=wc; g.fillText(v,e.x+e.w/2,e.y+e.h*0.66); }
    else { let lit=false; switch(e.act){ case "apon": lit=ap.on; break; case "athr": lit=ap.athr; break; case "appr": lit=ap.appr; break; case "loc": lit=ap.on&&ap.lat==="LOC"; break; case "lnav": case "vnav": lit=false; break; }
      const tc=boe?(lit?"#0c3a1a":"#1b1f22"):(lit?"#ffffff":"#c8d0d8"); if(lit){ g.fillStyle=boe?"rgba(120,240,150,0.9)":FDC.grn; if(boe) g.fillRect(e.x+1,e.y+e.h*0.1+1,e.w-2,e.h*0.8-2); else g.fillRect(e.x+e.w*0.15,e.y+e.h*0.14,e.w*0.7,Math.max(2,e.h*0.12)); }
      g.font="700 "+Math.min(lf*1.15,(e.w-3)/(Math.max(3,e.lab.length)*0.64))+"px "+FDF; g.textAlign="center"; g.textBaseline="middle"; g.fillStyle=tc; g.fillText(e.lab,e.x+e.w/2,e.y+e.h*0.55+(boe?0:e.h*0.08)); }
  }
}
/* ---------- display surfaces and blits ---------- */
function fdSurf(id,pw,ph){ let o=FD.cv[id]; if(!o) o=FD.cv[id]={c:document.createElement("canvas"),g:null,t:-1e9,pw:0,ph:0}; if(o.pw!==pw||o.ph!==ph){ o.c.width=pw; o.c.height=ph; o.g=o.c.getContext("2d"); o.pw=pw; o.ph=ph; o.t=-1e9; } return o; }
function fdRenderAll(L,s,info,ts,d){
  const low=FLY.opts.q==="low"||(FLY.W&&FLY.W.tier===0), per={pfd:low?80:42,nd:low?250:100,ewd:low?330:125,sd:low?330:125}, ids=["pfd","nd","ewd","sd"];
  for(let i=0;i<4;i++){ const id=ids[i], r=L.enlR&&L.enlR.id===id?L.enlR:L.d[id], pw=Math.max(64,Math.round(r.w*d)), ph=Math.round(pw*r.h/r.w), o=fdSurf(id,pw,ph);
    if(ts-o.t<per[id]) continue; o.t=ts; const g=o.g, h=100*r.h/r.w; g.setTransform(pw/100,0,0,pw/100,0,0); FD.mu=6/(r.w/100);
    if(id==="pfd") (L.boe?fdPfdB:fdPfdA)(g,info,s,FD.ils,ts); else if(id==="nd") fdNd(g,info,s,L.boe,ts); else if(id==="ewd") fdEwd(g,h,s,info,L.boe,ts); else fdSd(g,h,s,info,L.boe,FD.sd,ts); }
}
function fdBlit(g,id,r){ const o=FD.cv[id]; if(o) g.drawImage(o.c,r.x,r.y,r.w,r.h); }
/* ---------- main entry from flyHud ---------- */
function fdDraw(g,W,H,info,ts){
  if(!FD.ok||FLY.view!=="cockpit"||!FLY.s) return false;
  try{
    if(!fdEnsure()) return false; if(FD.hide){ fdHidden(W,H); return true; }   /* nothing is drawn: the HUD canvas stays empty (true = the deck handled it, so the compact HUD does not appear) */
    const s=FLY.s, d=Math.min(2,FLY.dpr||1), L=fdLay(W,H), ils=fphIls(s); FD.root.hidden=false;
    FD.ils=(s.ap.appr||(!s.ground&&ils.valid&&s.gear>0.5&&s.scn==="approach"))?ils:null; FD.ilsOn=!!FD.ils;
    const bk=L.key+"|"+d; if(FD.bgKey!==bk||!FD.bg){ FD.bg=fdMakeBg(L,d); FD.bgKey=bk; }
    fdRenderAll(L,s,info,ts,d);
    g.drawImage(FD.bg,0,L.pt,W,H-L.pt);
    const night=FLY.W&&FLY.W.night; if(night){ g.fillStyle="rgba(0,0,14,0.4)"; g.fillRect(0,L.pt,W,H-L.pt); }
    if(ts-(FD.tm||0)>700){ FD.tm=ts; fdMeasure(L); }
    if(L.pad){ fdStick(g,L.pad,s,L.boe,false,1); if(L.x1&&L.thr&&L.thr.x-L.x1>40){ const w=Math.min(L.thr.x-L.x1-6,L.pad.w*0.8); fdStick(g,{x:L.x1+(L.thr.x-L.x1-w)/2,y:L.pad.y+L.pad.h/2-w/2,w,h:w},s,L.boe,true,0.9); } }
    if(L.thr) fdThrust(g,L.thr,s,L.boe);
    fdStripDyn(g,L,s);
    if(L.enlR){ const e=L.enlR; g.fillStyle="rgba(0,0,0,0.72)"; g.fillRect(0,0,W,H); const bz=Math.max(3,L.ds*0.028); g.fillStyle="#0b0d10"; fdRR(g,e.x-bz,e.y-bz,e.w+2*bz,e.h+2*bz,6); g.fill(); g.strokeStyle="#5a636d"; g.lineWidth=1.5; g.stroke(); fdBlit(g,e.id,e); }
    else { ["pfd","nd","ewd","sd"].forEach(id=>fdBlit(g,id,L.d[id])); for(const k in L.fo){ const r=L.fo[k]; fdBlit(g,r.id,r); } fdLevDyn(g,L,s,info); }
    return true;
  }catch(e){ console.error("fdDraw",e); FD.ok=false; try{ fdView(FLY.view); }catch(x){} return false; }
}
