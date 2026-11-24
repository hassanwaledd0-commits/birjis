/* ---------- geometry: schematic, overall dimensions approximate ---------- */
const GEO = {
  a380:{ L:72.7, span:79.8, H:24.1, fw:7.1, nose:8, tail:48, rad:3.2, fd:10, wle:17.6, rc:18.5, tc:4.8, sw:37.2, tipY:38.0,   /* (v36) wing placed and swept like the owner's reference model (measured with tools/refcmp): the leading edge at the fuselage was 9 m too far aft */
         tipEnd:39.9, eng:[15.0,25.4], ew:3.5, ef:5.7, eb:4.0,
         hLE:57.7, hrc:9.85, htc:3.7, hsw:36.9, hY:15.2, finX0:55.7, finX1:72.4,
         ng:[10.0], mg:[[6.2,38.0,4,1.6],[2.6,42.0,5.5,1.6]], apuX:67.5,
         zb:3.2, zt:11.7, win:[[10,60,6.8],[12,56,10.0]], doors:[6.5,17.5,29.5,45,58], hdoors:[3.6,5.3,2.3],
         wheelR:0.7, nwR:0.58, wz:[4.4,8.15], engZ:[3.45,4.3], engD:3.9,
         top:[[0,6],[1,7.8],[3,9.4],[6,10.8],[10,11.6],[14,11.7],[52,11.7],[62,11],[72.7,9]],
         bot:[[0,6],[1.5,4.8],[4,3.6],[8,3.2],[44,3.2],[60,4.6],[72.7,8]],
         fin:[[55.7,11.6],[67.1,24.1],[72.4,24.1],[65.8,9.6]], htZ:9.2, scaleM:10 },   /* (the A380 fin/htZ are finally set in p5f.js) */
  b737:{ L:39.5, span:34.44, H:12.5, fw:3.76, nose:4, tail:27, rad:1.8, fd:6, wle:14.5, rc:6.7, tc:1.7, sw:28, tipY:17.0,
         tipEnd:17.22, eng:[4.95], ew:2.2, ef:2.6, eb:2.4,
         hLE:33.78, hrc:3.95, htc:0.95, hsw:34.4, hY:7.2, hy0:0.15, finX0:31.5, finX1:39.15,
         ng:[5.0], mg:[[2.8,18.0,1.6,1.1]], apuX:36.3,
         zb:1.4, zt:5.5, win:[[6.8,28,3.6]], doors:[5.3,29.5], hdoors:[1.8,2.5,1.4],
         wheelR:0.5, nwR:0.4, wz:[2.38,4.05], engZ:[1.87], engD:2.3,
         /* (v24) the outline below is matched to a reference 737-800 model: station X in metres from the nose, height y above the ground (the ground clearance of the belly is 1.4) */
         top:[[0,2.95],[0.25,3.34],[1.25,3.84],[2.25,4.55],[3.25,4.88],[4.25,5.10],[5.25,5.22],[6.25,5.32],[7.25,5.36],[8.25,5.40],[9.25,5.43],[27,5.42],[29.25,5.41],[31.25,5.37],[33.25,5.34],[35.25,5.25],[37.25,5.15],[39.5,4.9]],
         bot:[[0,2.85],[0.25,2.47],[1.25,2.01],[2.25,1.69],[3.25,1.52],[4.25,1.45],[5.25,1.41],[6.25,1.40],[9.25,1.39],[26.25,1.43],[27.25,1.50],[28.25,1.58],[29.25,1.70],[30.25,1.90],[31.25,2.10],[32.25,2.31],[33.25,2.52],[34.25,2.68],[35.25,2.90],[36.25,3.43],[37.25,3.76],[39.5,4.4]],
         hwT:[[0,0],[0.02,0.11],[0.06,0.2],[0.12,0.28],[0.25,0.40],[0.75,0.62],[1.25,0.79],[2.25,1.11],[3.25,1.36],[4.25,1.56],[5.25,1.71],[6.25,1.82],[7.25,1.85],[8.25,1.87],[9.25,1.88],[27.25,1.88],[28.25,1.83],[29.25,1.77],[30.25,1.68],[31.25,1.58],[32.25,1.48],[33.25,1.38],[34.25,1.18],[35.25,0.92],[36.25,0.67],[37.25,0.41],[38.5,0.18],[39.5,0.06]],
         fin:[[31.5,5.4],[37.45,12.45],[39.15,12.45],[37.3,5.4]], htZ:4.6, scaleM:5 }
};
const f1 = n => Math.round(n*10)/10;
const mir = a => a.map(p=>[400-p[0],p[1]]);
const pstr = a => a.map(p=>f1(p[0])+","+f1(p[1])).join(" ");
function hs(tag,id,attrs){
  const p=PARTS[id];
  return `<${tag} class="hs" data-id="${id}" data-sys="${p.sys}" role="button" tabindex="0" aria-label="${p.ar}" ${attrs}/>`;
}
function interp(arr,X){
  if(X<=arr[0][0]) return arr[0][1];
  for(let i=1;i<arr.length;i++){ if(X<=arr[i][0]){ const [x0,z0]=arr[i-1],[x1,z1]=arr[i]; return z0+(z1-z0)*(X-x0)/(x1-x0); } }
  return arr[arr.length-1][1];
}

function planView(key){
  const c=GEO[key], reg=[], s=Math.min(372/c.span,340/c.L), y0=(400-c.L*s)/2;
  const P=(X,Y)=>[200+Y*s, y0+X*s], a=c.fw/2;
  const hw=X=>{ if(X<=c.nose){const t=(c.nose-X)/c.nose, e=c.nosP||2; return a*Math.pow(Math.max(0,1-Math.pow(t,e)),1/e);}
    if(X>=c.tail){const t=(X-c.tail)/(c.L-c.tail); return a*(1-0.86*Math.pow(t,1.5));} return a; };
  const tanS=Math.tan(c.sw*Math.PI/180), Y0=a-0.2, Y1=c.tipY;
  const WY=u=>Y0+u*(Y1-Y0), LE=u=>c.wle+(WY(u)-Y0)*tanS, CH=u=>c.chF?c.chF(WY(u)):c.rc+(c.tc-c.rc)*u;
  const W=(u,f)=>P(LE(u)+f*CH(u),WY(u));
  const quad=(u0,u1,f0,f1_)=>[W(u0,f0),W(u1,f0),W(u1,f1_),W(u0,f1_)];
  const wte=c.wle+c.rc;
  let ext="", int="";
  const add=(layer,id,html)=>{ reg.push(["plan",layer,id]); if(layer==="ext") ext+=html; else int+=html; };
  const both=(layer,id,pts)=>add(layer,id,hs("polygon",id,`points="${pstr(pts)}"`)+hs("polygon",id,`points="${pstr(mir(pts))}"`));
  const box=(id,cx,cy,w,h,rx,extra="")=>{ w=Math.max(w,15); h=Math.max(h,15);
    return hs("rect",id,`x="${f1(cx-w/2)}" y="${f1(cy-h/2)}" width="${f1(w)}" height="${f1(h)}" rx="${rx}" ${extra}`); };
  const fus=(X0,X1)=>{ const L=[],R=[]; for(let i=0;i<=10;i++){ const X=X0+(X1-X0)*i/10; L.push(P(X,-hw(X))); R.push(P(X,hw(X))); } return L.concat(R.reverse()); };

  // wing + control surfaces
  both("ext","wingbox",quad(0,1,0,1));
  both("ext","slats",quad(0.12,0.97,0,0.12));
  both("ext","spoilers",quad(0.12,0.88,0.58,0.74));
  both("ext","flaps",quad(0.12,0.62,0.74,1));
  both("ext","aileron",quad(0.64,0.97,0.74,1));
  const wl=key==="b737"
    ? [W(1,0),P(LE(1)+1.6,c.tipEnd),P(LE(1)+2.4,c.tipEnd),W(1,1)]
    : key==="b747" ? [W(1,0),P(LE(1)+c.wl[0],c.tipEnd),P(LE(1)+c.wl[0]+c.wl[1],c.tipEnd),W(1,1)]
    : [W(1,0),P(LE(1)+1.2,c.tipEnd),P(LE(1)+CH(1)+0.8,c.tipEnd),W(1,1)];
  both("ext","wingtip",wl);
  // tail planes
  const hTan=Math.tan(c.hsw*Math.PI/180), hY0=0.8;
  const HY=u=>hY0+u*(c.hY-hY0), HLE=u=>c.hLE+(HY(u)-hY0)*hTan, HC=u=>c.hrc+(c.htc-c.hrc)*u, H=(u,f)=>P(HLE(u)+f*HC(u),HY(u));
  both("ext","stabilizer",[H(0,0),H(1,0),H(1,1),H(0,1)]);
  both("ext","elevator",[H(0.05,0.62),H(0.98,0.62),H(0.98,1),H(0.05,1)]);
  // fuselage
  const sec=[["radome",0,c.rad],["flightdeck",c.rad,c.fd],["fuse_fwd",c.fd,c.wle],["fuse_mid",c.wle,wte],["fuse_aft",wte,c.L]];
  sec.forEach(([id,x0,x1])=>add("ext",id,hs("polygon",id,`points="${pstr(fus(x0,x1))}"`)));
  // fin (thin, on centreline)
  const fa=P(c.finX0,0), fb=P(c.finX1,0), fw_=Math.max(1.1*s,8);
  add("ext","fin",hs("rect","fin",`x="${f1(200-fw_/2)}" y="${f1(fa[1])}" width="${f1(fw_)}" height="${f1(fb[1]-fa[1])}" rx="3"`));
  // engines
  c.eng.forEach(Ye=>{
    const u=(Ye-Y0)/(Y1-Y0), le=LE(u), A=P(le-c.ef,Ye-c.ew/2), B=P(le+c.eb,Ye+c.ew/2), w=B[0]-A[0], h=B[1]-A[1];
    const pa=P(le-0.4,Ye), pb=P(le+2.2,Ye);
    const ln=`<line class="ln" x1="${f1(pa[0])}" y1="${f1(pa[1])}" x2="${f1(pb[0])}" y2="${f1(pb[1])}" stroke-width="3"/><line class="ln" x1="${f1(400-pa[0])}" y1="${f1(pa[1])}" x2="${f1(400-pb[0])}" y2="${f1(pb[1])}" stroke-width="3"/>`;
    reg.push(["plan","ext","engine"]);
    ext+=ln+hs("rect","engine",`x="${f1(A[0])}" y="${f1(A[1])}" width="${f1(w)}" height="${f1(h)}" rx="${f1(w/2.4)}"`)
        +hs("rect","engine",`x="${f1(400-A[0]-w)}" y="${f1(A[1])}" width="${f1(w)}" height="${f1(h)}" rx="${f1(w/2.4)}"`);
  });
  // ---- internal layer ----
  both("int","fuel",quad(0.02,0.86,0.15,0.65));
  add("int","fuel",hs("polygon","fuel",`points="${pstr([P(c.wle+0.12*c.rc,-a*0.8),P(c.wle+0.12*c.rc,a*0.8),P(wte-0.05*c.rc,a*0.8),P(wte-0.05*c.rc,-a*0.8)])}"`));
  if(key!=="b737") both("int","fuel",[H(0.1,0.2),H(0.85,0.2),H(0.85,0.6),H(0.1,0.6)]);
  const spar=(f,id)=>{ const p0=W(0,f),p1=W(0.9,f); return ["",""].map((_,i)=>{ const x0=i?400-p0[0]:p0[0], x1=i?400-p1[0]:p1[0];
    return hs("line",id,`x1="${f1(x0)}" y1="${f1(p0[1])}" x2="${f1(x1)}" y2="${f1(p1[1])}"`).replace('class="hs"','class="hs line"'); }).join(""); };
  add("int","wingbox",spar(0.15,"wingbox")+spar(0.65,"wingbox"));
  let ribs=""; for(let i=1;i<=(key!=="b737"?16:9);i++){ const u=i/(key!=="b737"?17:10)*0.9, p0=W(u,0.15),p1=W(u,0.65);
    ribs+=`<line class="ln" style="pointer-events:none" x1="${f1(p0[0])}" y1="${f1(p0[1])}" x2="${f1(p1[0])}" y2="${f1(p1[1])}"/><line class="ln" style="pointer-events:none" x1="${f1(400-p0[0])}" y1="${f1(p0[1])}" x2="${f1(400-p1[0])}" y2="${f1(p1[1])}"/>`; }
  int+=ribs;
  // hydraulic lines
  const hp=[P(wte-3,0),P(wte-3,a*0.8),W(0.02,0.72),W(0.8,0.72)];
  add("int","hyd",hs("polyline","hyd",`points="${pstr(hp)}" fill="none"`).replace('class="hs"','class="hs line"')+hs("polyline","hyd",`points="${pstr(mir(hp))}" fill="none"`).replace('class="hs"','class="hs line"'));
  // gear (retracted, dashed)
  c.mg.forEach(([gy,gx,gl,gw])=>{ const p=P(gx,gy), q=P(gx,-gy);
    add("int","gear_main",box("gear_main",p[0],p[1],gw*s,gl*s,3)+box("gear_main",q[0],q[1],gw*s,gl*s,3)); });
  c.ng.forEach(gx=>{ const p=P(gx,0); add("int","gear_nose",box("gear_nose",p[0],p[1],1.2*s,1.4*s,3)); });
  const pk=P(c.wle+0.22*c.rc,0); add("int","packs",box("packs",pk[0],pk[1],(a*1.2)*s,2.4*s,3));
  const av=P(c.fd+1.6,0); add("int","avionics",box("avionics",av[0],av[1],(a*1.1)*s,2.6*s,3));
  const ap=P(c.apuX,0); add("int","apu",box("apu",ap[0],ap[1],1.8*s,2.6*s,4));
  const sb=`<g class="scale"><line x1="16" y1="386" x2="${f1(16+c.scaleM*s)}" y2="386"/><line x1="16" y1="382" x2="16" y2="390"/><line x1="${f1(16+c.scaleM*s)}" y1="382" x2="${f1(16+c.scaleM*s)}" y2="390"/><text class="lbl" x="${f1(16+c.scaleM*s+6)}" y="389">${c.scaleM} m</text></g>`;
  return {svg:`<svg viewBox="0 0 400 400" role="group" aria-label="منظر علوي"><g class="layer-ext">${ext}</g><g class="layer-int">${int}</g>${sb}</svg>`, reg};
}
