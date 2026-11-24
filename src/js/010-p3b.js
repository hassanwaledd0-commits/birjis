function sideView(key){
  const c=GEO[key], reg=[], s=Math.min(372/c.L,138/c.H), x0=(400-c.L*s)/2, gy=152;
  const SX=X=>x0+X*s, SZ=z=>gy-z*s, zt=X=>interp(c.top,X), zb=X=>interp(c.bot,X);
  const a380=key!=="b737", wte=c.wle+c.rc, a=c.fw/2;
  let ext="", int="";
  const add=(layer,id,html)=>{ reg.push(["side",layer,id]); if(layer==="ext") ext+=html; else int+=html; };
  const box=(id,x,y,w,h,rx)=>hs("rect",id,`x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${rx}"`);
  // centred box in metres: X range and z centre
  const mbox=(id,Xa,Xb,zc,hm,rx,minH=8)=>{ const w=Math.max((Xb-Xa)*s,8), h=Math.max(hm*s,minH); return box(id,SX((Xa+Xb)/2)-w/2,SZ(zc)-h/2,w,h,rx); };
  const slice=(X0,X1)=>{ const T=[],B=[]; for(let i=0;i<=12;i++){ const X=X0+(X1-X0)*i/12; T.push([SX(X),SZ(zt(X))]); B.push([SX(X),SZ(zb(X))]); } return T.concat(B.reverse()); };
  [["radome",0,c.rad],["flightdeck",c.rad,c.fd],["fuse_fwd",c.fd,c.wle],["fuse_mid",c.wle,wte],["fuse_aft",wte,c.L]]
    .forEach(([id,x1,x2])=>add("ext",id,hs("polygon",id,`points="${pstr(slice(x1,x2))}"`)));
  // horizontal stabilizer (edge-on) and fin
  const hT=Math.tan(c.hsw*Math.PI/180), hTip=c.hLE+(c.hY-0.8)*hT, hz=c.htZ;
  add("ext","stabilizer",hs("polygon","stabilizer",`points="${pstr([[SX(c.hLE),SZ(hz+0.4)],[SX(hTip),SZ(hz+1)],[SX(hTip+c.htc),SZ(hz+1)],[SX(c.hLE+c.hrc),SZ(hz-0.3)]])}"`));
  add("ext","fin",hs("polygon","fin",`points="${pstr(c.fin.map(p=>[SX(p[0]),SZ(p[1])]))}"`));
  // wing, edge-on
  const tanS=Math.tan(c.sw*Math.PI/180), Y0=a-0.2, Y1=c.tipY, LEtip=c.wle+(Y1-Y0)*tanS;
  add("ext","wingbox",hs("polygon","wingbox",`points="${pstr([[SX(c.wle),SZ(c.wz[0]+1)],[SX(LEtip),SZ(c.wz[1]+0.4)],[SX(LEtip+c.tc),SZ(c.wz[1])],[SX(wte),SZ(c.wz[0])]])}"`));
  add("ext","wingtip",hs("polygon","wingtip",`points="${pstr([[SX(LEtip),SZ(c.wz[1]+0.4)],[SX(LEtip+1.4),SZ(c.wz[1]+2.4)],[SX(LEtip+c.tc+0.4),SZ(c.wz[1]+2.2)],[SX(LEtip+c.tc),SZ(c.wz[1])]])}"`));
  // windows
  c.win.forEach(([xa,xb,zc])=>{
    const h=Math.max(0.9*s,8);
    add("ext","windows",box("windows",SX(xa),SZ(zc)-h/2,(xb-xa)*s,h,h/2)
      +`<line class="ln" style="pointer-events:none" stroke-dasharray="1.5 3.5" stroke-width="2.4" x1="${f1(SX(xa)+4)}" y1="${f1(SZ(zc))}" x2="${f1(SX(xb)-4)}" y2="${f1(SZ(zc))}"/>`);
  });
  // doors and exits
  const dz=a380?5.2:2.4, dh=a380?2.0:1.9;
  c.doors.forEach(X=>add("ext","doors",mbox("doors",X-0.55,X+0.55,dz+dh/2,dh,2,10)));
  if(key==="b747"){ c.doorList.filter(d=>d.deck!=="main").forEach(d=>add("ext","doors",mbox("doors",d.X-d.w/2,d.X+d.w/2,d.z,d.h,2,9))); }
  else {
  if(a380) [12,31,54].forEach(X=>add("ext","doors",mbox("doors",X-0.55,X+0.55,9.2,1.7,2,10)));
  else [16.9,18.2].forEach(X=>add("ext","doors",mbox("doors",X-0.4,X+0.4,3.2,1.0,2,10)));
  (a380?[14.5,48.5]:[9.0,24.0]).forEach(X=>add("ext","doors",mbox("doors",X-1.2,X+1.2,a380?4.7:2.3,1.3,2,9))); }
  // engines
  c.eng.forEach((Ye,i)=>{
    const u=(Ye-Y0)/(Y1-Y0), le=c.wle+(Ye-Y0)*tanS, zc=c.engZ[i]||c.engZ[0], wz=c.wz[0]+(c.wz[1]-c.wz[0])*u;
    add("ext","engine",`<line class="ln" stroke-width="3" x1="${f1(SX(le+1))}" y1="${f1(SZ(zc+c.engD/2))}" x2="${f1(SX(le+1))}" y2="${f1(SZ(wz))}"/>`
      +mbox("engine",le-c.ef,le+c.eb,zc,c.engD,Math.max(c.engD*s/2.2,5),10));
  });
  // landing gear (extended, ground view)
  const stw=Math.max(0.7*s,8), wr=Math.max(c.wheelR*s,4), nr=Math.max(c.nwR*s,4);
  c.ng.forEach(X=>{
    add("ext","gear_nose",box("gear_nose",SX(X)-stw/2,SZ(zb(X)),stw,(zb(X)-c.nwR)*s,2));
    add("ext","wheels",hs("circle","wheels",`cx="${f1(SX(X))}" cy="${f1(SZ(c.nwR))}" r="${f1(nr)}"`));
  });
  c.mg.forEach(([gyy,gx,gl])=>{
    const ax=!a380?[0]:(gl<5?(c.axl||[-0.95,0.95]):[-1.7,0,1.7]);
    add("ext","gear_main",`<line class="ln" stroke-width="2.4" x1="${f1(SX(gx+ax[0]))}" y1="${f1(SZ(c.wheelR))}" x2="${f1(SX(gx+ax[ax.length-1]))}" y2="${f1(SZ(c.wheelR))}"/>`
      +box("gear_main",SX(gx)-stw/2,SZ(zb(gx)),stw,(zb(gx)-c.wheelR)*s,2));
    ax.forEach(d=>add("ext","wheels",hs("circle","wheels",`cx="${f1(SX(gx+d))}" cy="${f1(SZ(c.wheelR))}" r="${f1(wr)}"`)));
  });
  // internal layer
  add("int","avionics",mbox("avionics",c.fd,c.fd+(a380?5:3),zb(c.fd)+0.9,1.5,3));
  add("int","packs",mbox("packs",c.wle,c.wle+0.3*c.rc,zb(c.wle)+0.5,1.8,3));
  add("int","fuel",mbox("fuel",c.wle+0.35*c.rc,wte-0.05*c.rc,zb(c.wle)+1.1,2.0,3));
  add("int","apu",mbox("apu",c.apuX-1.3,c.apuX+1.3,(zt(c.apuX)+zb(c.apuX))/2,2.2,4,9));
  const gl_=16+c.scaleM*s;
  const sb=`<g class="scale"><line x1="16" y1="168" x2="${f1(gl_)}" y2="168"/><line x1="16" y1="164" x2="16" y2="172"/><line x1="${f1(gl_)}" y1="164" x2="${f1(gl_)}" y2="172"/><text class="lbl" x="${f1(gl_+6)}" y="171">${c.scaleM} m</text></g>`;
  return {svg:`<svg viewBox="0 0 400 176" role="group" aria-label="منظر جانبي"><line class="ln" x1="6" y1="${gy}" x2="394" y2="${gy}"/><g class="layer-ext">${ext}</g><g class="layer-int">${int}</g>${sb}</svg>`, reg};
}
