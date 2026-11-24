/* ---------- the airfield: runway (60 m x 4 km, displaced threshold, blast pads), parallel taxiway, high-speed exits, links and apron connectors,
   apron markings, signs, PAPI and all the lights. Pavement and paint are merged geometry with world-space UVs, so the whole field costs about 15 draw calls. ---------- */
function apAcc(tile){
  const a={p:[],u:[],i:[],tile:tile||24}; let n=0;
  const Vx=(x,y,z)=>{ a.p.push(x,y,z); a.u.push(x/a.tile,z/a.tile); return n++; };
  const T=(i0,i1,i2)=>{ const P=a.p, ax=P[i0*3], az=P[i0*3+2], cr=(P[i1*3+2]-az)*(P[i2*3]-ax)-(P[i1*3]-ax)*(P[i2*3+2]-az); if(cr>=0) a.i.push(i0,i1,i2); else a.i.push(i0,i2,i1); };
  a.rect=(x0,z0,x1,z1,y)=>{ const A=Vx(x0,y,z0), B=Vx(x0,y,z1), C=Vx(x1,y,z1), D=Vx(x1,y,z0); T(A,B,C); T(A,C,D); };
  a.orect=(cx,cz,len,wid,ang,y)=>{ const dx=Math.cos(ang)*len/2, dz=Math.sin(ang)*len/2, px=-Math.sin(ang)*wid/2, pz=Math.cos(ang)*wid/2;
    const A=Vx(cx-dx-px,y,cz-dz-pz), B=Vx(cx+dx-px,y,cz+dz-pz), C=Vx(cx+dx+px,y,cz+dz+pz), D=Vx(cx-dx+px,y,cz-dz+pz); T(A,B,C); T(A,C,D); };
  a.poly=(pts,y)=>{ const ids=pts.map(([x,z])=>Vx(x,y,z)); for(let k=1;k<ids.length-1;k++) T(ids[0],ids[k],ids[k+1]); };
  a.ribbon=(pts,w,y)=>{ if(pts.length<2) return; const L=[], R=[];
    for(let k=0;k<pts.length;k++){ const p=pts[k], p0=pts[Math.max(0,k-1)], p1=pts[Math.min(pts.length-1,k+1)]; let dx=p1[0]-p0[0], dz=p1[1]-p0[1]; const l=Math.hypot(dx,dz)||1; dx/=l; dz/=l;
      L.push(Vx(p[0]-dz*w/2,y,p[1]+dx*w/2)); R.push(Vx(p[0]+dz*w/2,y,p[1]-dx*w/2)); }
    for(let k=0;k<pts.length-1;k++){ T(L[k],R[k],R[k+1]); T(L[k],R[k+1],L[k+1]); } };
  /* dashed line along a polyline (arc length), on/off in metres */
  a.dashes=(pts,w,y,on,off,ph)=>{ const cum=[0]; for(let k=1;k<pts.length;k++) cum.push(cum[k-1]+Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1])); const tot=cum[cum.length-1];
    const at=(s)=>{ let k=1; while(k<pts.length-1&&cum[k]<s) k++; const t=(s-cum[k-1])/((cum[k]-cum[k-1])||1); return [pts[k-1][0]+(pts[k][0]-pts[k-1][0])*t,pts[k-1][1]+(pts[k][1]-pts[k-1][1])*t]; };
    for(let s=ph||0;s<tot;s+=on+off){ const s1=Math.min(tot,s+on), seg=[at(s)]; for(let k=0;k<pts.length;k++) if(cum[k]>s&&cum[k]<s1) seg.push(pts[k]); seg.push(at(s1)); a.ribbon(seg,w,y); } };
  a.mesh=(mat,rs)=>{ const g=new THREE.BufferGeometry(), N=new Float32Array(a.p.length); for(let k=1;k<N.length;k+=3) N[k]=1; g.setAttribute("position",new THREE.Float32BufferAttribute(a.p,3)); g.setAttribute("normal",new THREE.BufferAttribute(N,3)); g.setAttribute("uv",new THREE.Float32BufferAttribute(a.u,2));
    g.setIndex(a.i); g.computeBoundingSphere(); const m=new THREE.Mesh(g,mat); m.receiveShadow=!!rs; m.raycast=()=>{}; return m; };
  return a;
}
const apBez=(p0,p1,p2,p3,n)=>{ const o=[]; for(let k=0;k<=n;k++){ const t=k/n, u=1-t; o.push([u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0],u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]]); } return o; };
function apField(X){
  const {c,a380,L,zN,zF,zR0,zR1,zTL,zTW,zRW,zRear,Sw,NB,spL,spR,ng,slots,dx0,dx1,zApEnd,stands}=X, PI=Math.PI, G=new THREE.Group(), lights=[], mats=[];
  const H=0.012, RW=2000, DT=150, xE=RW-DT;                                      /* runway half length; east threshold displaced by 150 m */
  /* ---- textures ---- */
  const asphT=apTex(512,512,(g,w,h)=>{ g.fillStyle="#464a4e"; g.fillRect(0,0,w,h); apNoise(g,w,h,26000,55,125,0.65); apNoise(g,w,h,3500,25,70,0.5);
    for(let i=0;i<5;i++){ const t=Math.random()<0.5?"20,20,22":"120,118,112", x=Math.random()*w, y=Math.random()*h, ww=60+Math.random()*180, hh=40+Math.random()*120; g.fillStyle=`rgba(${t},0.035)`; g.fillRect(x,y,ww,hh); }
    g.strokeStyle="rgba(15,15,17,0.4)"; g.lineWidth=1; for(let i=0;i<12;i++){ let x=Math.random()*w, y=Math.random()*h; g.beginPath(); g.moveTo(x,y); for(let k=0;k<8;k++){ x+=(Math.random()-0.5)*46; y+=(Math.random()-0.3)*40; g.lineTo(x,y); } g.stroke(); }
    for(let i=0;i<6;i++){ const x=Math.random()*w, y=Math.random()*h, r=10+Math.random()*22, gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,"rgba(8,8,10,0.32)"); gr.addColorStop(1,"rgba(8,8,10,0)"); g.fillStyle=gr; g.fillRect(x-r,y-r,2*r,2*r); } },null);
  asphT.anisotropy=8;
  const shT=apTex(256,256,(g,w,h)=>{ g.fillStyle="#6a6b69"; g.fillRect(0,0,w,h); apNoise(g,w,h,9000,95,170,0.6); g.fillStyle="rgba(190,170,130,0.10)"; for(let i=0;i<30;i++) g.fillRect(Math.random()*w,Math.random()*h,30+Math.random()*60,10+Math.random()*30); },null);
  const chipT=apTex(128,128,(g,w,h)=>{ g.fillStyle="#e6e6e6"; g.fillRect(0,0,w,h); apNoise(g,w,h,2600,175,255,1); for(let i=0;i<40;i++){ g.fillStyle="rgba(120,120,120,0.5)"; g.fillRect(Math.random()*w,Math.random()*h,2+Math.random()*7,1+Math.random()*3); } },null,false);
  const wearT=apTex(1024,64,(g,w,h)=>{ g.clearRect(0,0,w,h); for(let i=0;i<190;i++){ const x=Math.random()*w, y=Math.random()*h, ww=20+Math.random()*90, hh=1.5+Math.random()*7, dk=Math.random()<0.7; g.fillStyle=dk?`rgba(10,10,12,${0.03+Math.random()*0.07})`:`rgba(190,185,170,${0.02+Math.random()*0.05})`; g.fillRect(x,y,ww,hh); g.fillRect(x-w,y,ww,hh); } },null);
  /* rubber deposits in a touchdown zone: 600 m x 60 m, x = 0 at the threshold; wheel tracks of the main gear legs, thickest 250-450 m in */
  const rubT=apTex(1024,128,(g,w,h)=>{ g.clearRect(0,0,w,h); const px=w/600, pz=h/60;
    for(let i=0;i<260;i++){ const d=Math.pow(Math.random(),0.8)*520+30, den=Math.exp(-Math.pow((d-330)/170,2)), tr=[-1,1][i&1]*[4.4,6.2,10.5,12.2,2.2][i%5]+(Math.random()-0.5)*2; if(Math.random()>den) continue;
      g.fillStyle=`rgba(8,8,9,${0.10+Math.random()*0.22*den})`; g.fillRect(d*px,(30+tr)*pz-1,(3+Math.random()*14)*px,(0.35+Math.random()*0.5)*pz); }
    for(let i=0;i<14;i++){ const d=200+Math.random()*250, z=30+(Math.random()-0.5)*16, gr=g.createRadialGradient(d*px,z*pz,0,d*px,z*pz,26*px); gr.addColorStop(0,"rgba(6,6,7,0.22)"); gr.addColorStop(1,"rgba(6,6,7,0)"); g.fillStyle=gr; g.fillRect((d-26)*px,(z-13)*pz,52*px,26*pz); } },null);
  const grassT=apTex(256,256,(g,w,h)=>{ g.clearRect(0,0,w,h); const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,"rgba(255,255,255,0)"); gr.addColorStop(0.25,"rgba(255,255,255,0.7)"); gr.addColorStop(0.75,"rgba(255,255,255,0.7)"); gr.addColorStop(1,"rgba(255,255,255,0)");
    const cv=document.createElement("canvas"); cv.width=w; cv.height=h; const q=cv.getContext("2d"); q.fillStyle="#8c8a55"; q.fillRect(0,0,w,h); for(let i=0;i<5000;i++){ const v=Math.random(); q.fillStyle=v<0.5?"rgba(104,112,60,0.45)":v<0.8?"rgba(150,140,88,0.4)":"rgba(86,100,56,0.45)"; q.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*3,1+Math.random()*4); }
    g.drawImage(cv,0,0); g.globalCompositeOperation="destination-in"; g.fillStyle=gr; g.fillRect(0,0,w,h); },null);
  const dustT=apTex(32,128,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,"rgba(120,100,70,0.55)"); gr.addColorStop(1,"rgba(150,125,85,0)"); g.fillStyle=gr; g.fillRect(0,0,w,h); },null);
  /* atlas for runway numbers, apron labels and signs (shelf packed) */
  const AT=document.createElement("canvas"); AT.width=1024; AT.height=1024; const ag=AT.getContext("2d"); let shx=0, shy=0, shh=0;
  const alloc=(w,h)=>{ if(shx+w>1024){ shx=0; shy+=shh; shh=0; } const r=[shx,shy,w,h]; shx+=w; shh=Math.max(shh,h); return r; };
  const uvOf=(r)=>[r[0]/1024,1-(r[1]+r[3])/1024,(r[0]+r[2])/1024,1-r[1]/1024];
  const atlasTx=new THREE.CanvasTexture(AT); atlasTx.encoding=THREE.sRGBEncoding; atlasTx.anisotropy=8;
  const labels={}; const label=(key,w,h,draw)=>{ if(labels[key]) return labels[key]; const r=alloc(w,h); ag.save(); ag.translate(r[0],r[1]); ag.beginPath(); ag.rect(0,0,w,h); ag.clip(); draw(ag,w,h); ag.restore(); labels[key]=uvOf(r); return labels[key]; };
  const num=(txt,lt)=>label("n"+txt+lt,256,512,(g,w,h)=>{ g.fillStyle="#f1f1ec"; g.font="bold 215px Arial,Helvetica,sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.save(); g.translate(w/2,h*0.27); g.scale(0.9,1); g.fillText(txt,0,0); g.restore(); g.save(); g.translate(w/2,h*0.74); g.scale(0.9,1); g.fillText(lt,0,0); g.restore(); });
  const txtL=(key,str,col,bg)=>label(key,256,64,(g,w,h)=>{ if(bg){ g.fillStyle=bg; g.fillRect(0,0,w,h); } g.fillStyle=col; g.font="bold 50px Arial,Helvetica,sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillText(str,w/2,h/2+3); });
  /* ---- accumulators and materials ---- */
  const po=(m,f,u)=>{ m.polygonOffset=true; m.polygonOffsetFactor=f; m.polygonOffsetUnits=u; return m; };
  const dim=[], asph=apAcc(24), shl=apAcc(16), wh=apAcc(3), ye=apAcc(3), rd=apAcc(3), lab=apAcc(1), roadA=apAcc(24);
  const paint=(col)=>po(new THREE.MeshStandardMaterial({color:apLin(col),map:chipT,roughness:0.55,transparent:true,depthWrite:false}),-4,-8);
  const matA=po(new THREE.MeshStandardMaterial({map:asphT,roughness:0.92}),-2,-4), matS=po(new THREE.MeshStandardMaterial({map:shT,roughness:0.95}),-1,-2);
  dim.push(matA,matS);
  /* ---- layout helpers ---- */
  const zr=zRW, hold=90, LQ=[];                                                    /* runway hold-short lines are 90 m from the runway centre line; LQ = floor label quads */
  const holdLine=(x,z,w)=>{ ye.rect(x-w/2,z,x+w/2,z+0.3,0.014); ye.rect(x-w/2,z+0.6,x+w/2,z+0.9,0.014); ye.dashes([[x-w/2,z+1.35],[x+w/2,z+1.35]],0.3,0.014,0.9,0.9,0); ye.dashes([[x-w/2,z+1.95],[x+w/2,z+1.95]],0.3,0.014,0.9,0.9,0); };
  const taxiLine=(pts)=>ye.ribbon(pts,0.45,0.014);
  /* a label quad on the ground: centre x,z, reading direction ang (0 = along +x, text up = -z), height hh, aspect w/h */
  const lq=(key,x,z,hh,ang,asp)=>{ const uv=labels[key], w=hh*asp, dx=Math.cos(ang)*w/2, dz=Math.sin(ang)*w/2, ux=Math.sin(ang)*hh/2, uz=-Math.cos(ang)*hh/2; LQ.push([[x-dx-ux,z-dz-uz],[x-dx+ux,z-dz+uz],[x+dx+ux,z+dz+uz],[x+dx-ux,z+dz-uz],uv]); };
  /* ---- runway ---- */
  asph.rect(-RW,zr-30,RW,zr+30,0); asph.rect(-RW-60,zr-37.5,-RW,zr+37.5,0); asph.rect(RW,zr-37.5,RW+60,zr+37.5,0);
  shl.rect(-RW-60,zr-37.5,RW+60,zr-30,-0.004); shl.rect(-RW-60,zr+30,RW+60,zr+37.5,-0.004);
  const rwY=0.014;
  /* threshold bars, designator, aiming point and touchdown zone marks; x0 = threshold, s = +1 when landing towards +x */
  const endMarks=(x0,s,tx,tl)=>{
    const X=(d)=>x0+s*d, bar=(d0,d1,zc,w)=>wh.rect(Math.min(X(d0),X(d1)),zr+zc-w/2,Math.max(X(d0),X(d1)),zr+zc+w/2,rwY);
    for(let i=0;i<8;i++){ [-1,1].forEach(q=>bar(6,36,q*(2.4+3.4*i),1.8)); }
    [[150,3],[250,2],[500,2],[600,1],[750,1],[900,1]].forEach(([d,n])=>{ for(let j=0;j<n;j++) [-1,1].forEach(q=>bar(d,d+22.5,q*(9.9+3.3*j),1.8)); });
    [-1,1].forEach(q=>bar(400,460,q*16.25,10));
    num(tx,tl); const ang=s>0?PI/2:-PI/2; lq("n"+tx+tl,X(59),zr,22,ang,0.5); };                  /* the number reads from the approach end: up = direction of landing */
  endMarks(-RW,1,"09","L"); endMarks(xE,-1,"27","R");
  for(let x=-RW+80;x<xE-85;x+=50) wh.rect(x,zr-0.45,x+30,zr+0.45,rwY);
  [-1,1].forEach(q=>wh.rect(-RW,zr+q*29.4-0.45,RW,zr+q*29.4+0.45,rwY));
  /* east end: displaced threshold area with arrows towards the threshold; yellow chevrons on both blast pads */
  for(let k=0;k<3;k++){ const xc=xE+22+k*45; wh.rect(xc-9,zr-0.45,xc+4,zr+0.45,rwY); wh.poly([[xc-12,zr],[xc-3,zr-2.4],[xc-3,zr+2.4]],rwY); }
  [[-RW,-1],[RW,1]].forEach(([x0,s])=>{ for(let k=0;k<3;k++){ const xa=x0+s*(8+14*k); ye.ribbon([[xa+s*12,zr-24],[xa,zr],[xa+s*12,zr+24]],1.3,rwY); }
    [-1,1].forEach(q=>ye.rect(Math.min(x0,x0+s*60),zr+q*36.8-0.45,Math.max(x0,x0+s*60),zr+q*36.8+0.45,rwY)); });
  /* ---- parallel taxiway, links to the runway ends, high-speed exits, apron connectors ---- */
  const TX=1700, tw=26, tl=23, links=[];
  asph.rect(-TX,zTW-tw/2,TX,zTW+tw/2,0); shl.rect(-TX,zTW-tw/2-7.5,TX,zTW-tw/2,-0.004); shl.rect(-TX,zTW+tw/2,TX,zTW+tw/2+7.5,-0.004);
  taxiLine([[-TX,zTW],[TX,zTW]]); links.push([[-TX,zTW],[TX,zTW]]);
  [-1,1].forEach(q=>[0,0.3].forEach(o=>ye.rect(-TX,zTW+q*(tw/2-0.9+o)-0.08,TX,zTW+q*(tw/2-0.9+o)+0.08,0.014)));
  /* link: pavement from the taxiway edge zE to zO (other end), rounded fillets (radius R) on both sides at the taxiway, centre line from the taxiway axis to zC with lead-in arcs */
  const link=(xc,zE,zO,zC,R,holdZ,nopave)=>{ const s=zO>zE?1:-1; if(!nopave){ asph.rect(xc-tl/2,Math.min(zE,zO),xc+tl/2,Math.max(zE,zO),0); [-1,1].forEach(q=>shl.rect(Math.min(xc+q*tl/2,xc+q*(tl/2+6)),Math.min(zE,zO),Math.max(xc+q*tl/2,xc+q*(tl/2+6)),Math.max(zE,zO),-0.004)); }
    [-1,1].forEach(q=>{ if(!nopave){ const pts=[[xc+q*tl/2,zE],[xc+q*(tl/2+R),zE]]; for(let k=0;k<=8;k++){ const th=k/8*PI/2; pts.push([xc+q*(tl/2+R-R*Math.sin(th)),zE+s*(R-R*Math.cos(th))]); } asph.poly(pts,0); }
      const R2=R*0.85, arc=[]; for(let k=0;k<=14;k++){ const th=k/14*PI/2; arc.push([xc+q*R2*(1-Math.cos(th)),zTW+s*R2*(1-Math.sin(th))]); } taxiLine(arc); links.push(arc); });
    const cl=[[xc,zTW+s*R*0.85],[xc,zC]]; taxiLine(cl); links.push(cl); if(holdZ) holdLine(xc,holdZ,tl-1.5); };
  link(-1930,zTW+tw/2,zr-30,zr-30,40,zr-hold); link(1930,zTW+tw/2,zr-30,zr-30,40,zr-hold);
  [-300,300].forEach(xc=>link(xc,zTW-tw/2,zApEnd,zTL,40,0,true));
  const hse=(xa,xb)=>{ const sg=xb>xa?1:-1, path=apBez([xa,zr],[xa+sg*150,zr],[xb-sg*150,zTW],[xb,zTW],40); asph.ribbon(path,tl,0); shl.ribbon(path,tl+12,-0.004); taxiLine(path); links.push(path); };
  hse(-1150,-740); hse(1150,740);
  /* ---- apron markings: service road, zebra crossings, equipment restraint area, parking slots, stands ---- */
  roadA.rect(dx0,zR0,dx1,zR1,0.004); const rdM=po(new THREE.MeshStandardMaterial({map:asphT,roughness:0.9,color:"#b9b9b9"}),-1,-2);
  wh.rect(dx0,zR0+0.06,dx1,zR0+0.24,0.014); wh.rect(dx0,zR1-0.24,dx1,zR1-0.06,0.014); wh.dashes([[dx0,(zR0+zR1)/2],[dx1,(zR0+zR1)/2]],0.12,0.014,2.5,3.5,0);
  [-1,1].forEach(s=>{ for(let i=0;i<7;i++){ const xx=s*(Sw*0.55)+(i-3)*0.9; wh.rect(xx-0.3,zR0+0.3,xx+0.3,zR1-0.3,0.014); } });
  slots.forEach(s=>{ const cs=Math.cos(s.ry), sn=Math.sin(s.ry), hw=s.w/2, hl=s.l/2; const pts=[[-hw,-hl],[hw,-hl],[hw,hl],[-hw,hl],[-hw,-hl]].map(([lx,lz])=>[s.x+lx*cs+lz*sn,s.z-lx*sn+lz*cs]); wh.ribbon(pts,0.14,0.014); });
  { const Wl=wingLS(c), Hs=htpLS(c), off=2.2, hwF=c.fw/2+off, ptsR=[], wz=(Y)=>{ const u=Math.min(1,Math.max(0,(Y-Wl.Y0)/(c.tipY-Wl.Y0))); return [Wl.LE(u)+zN,Wl.LE(u)+Wl.CH(u)+zN]; }, hz=(Y)=>{ const u=Math.min(1,Math.max(0,(Y-0.8)/(c.hY-0.8))); return [Hs.LE(u)+zN,Hs.LE(u)+Hs.CH(u)+zN]; };
    ptsR.push([0,zN-off],[hwF,zN+c.nose*0.9],[hwF,wz(hwF)[0]-off],[c.tipY+off,wz(c.tipY)[0]-off],[c.tipY+off,wz(c.tipY)[1]+off],[hwF,wz(hwF)[1]+off],[hwF,hz(hwF)[0]-off],[c.hY+off,hz(c.hY)[0]-off],[c.hY+off,hz(c.hY)[1]+off],[hwF-0.6,hz(hwF)[1]+off],[0,L/2+off]);
    const poly=ptsR.concat(ptsR.slice(1,-1).reverse().map(p=>[-p[0],p[1]])); poly.push(poly[0]); rd.dashes(poly,0.3,0.014,1.6,1.1,0); }
  ye.ribbon([[-600,zTL],[600,zTL]],0.45,0.014); links.push([[-600,zTL],[600,zTL]]);
  stands.forEach(st=>{ const x0=st.cx-st.hw, x1=st.cx+st.hw; rd.ribbon([[x0,zR1+0.4],[x0,zRear],[x1,zRear],[x1,zR1+0.4]],0.6,0.014);
    const Rr=a380?45:26, pts=[]; for(let i=0;i<=24;i++){ const th=i/24*PI/2; pts.push([st.cx+Rr-Rr*Math.sin(th),zTL-Rr+Rr*Math.cos(th)]); } pts.push([st.cx,zTL-Rr],[st.cx,zR1+0.8]); ye.ribbon(pts,0.45,0.014);
    ye.rect(st.cx-3.6,st.ng-0.3,st.cx+3.6,st.ng+0.3,0.014);
    txtL("t"+st.type,st.type,"#f2c230",null); lq("t"+st.type,st.cx+5.8,st.ng+0.6,1.4,-PI/2,4);
    txtL("s"+st.n,st.n,"#f2c230",null); lq("s"+st.n,st.cx+(st.cx===0?-7:-5),zTL-(a380?30:16),a380?6:4.4,0,4);
    if(st.cx===0){ [[3.2,a380?"B777":"A330"],[6.4,a380?"B787":"A321"]].forEach(([d,lt])=>{ ye.rect(st.cx-2.2,st.ng-d-0.12,st.cx+2.2,st.ng-d+0.12,0.014); txtL("t"+lt,lt,"#f2c230",null); lq("t"+lt,st.cx+3.4,st.ng-d+0.5,1.0,-PI/2,4); }); } });
  /* ---- build the meshes ---- */
  const ad=(m,ord)=>{ m.renderOrder=ord||0; G.add(m); return m; };
  ad(asph.mesh(matA,true)); ad(shl.mesh(matS,true)); ad(roadA.mesh(rdM,true));
  /* wear streaks over the runway and the taxiway; rubber deposits in both touchdown zones (mirrored for the east end) */
  const ov=(tex,w,h,x,z,flip,order)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h).rotateX(-PI/2),po(new THREE.MeshStandardMaterial({map:tex,transparent:true,depthWrite:false,roughness:0.95}),-3,-6)); m.position.set(x,0.006,z);
    if(flip){ const u=m.geometry.attributes.uv; for(let k=0;k<u.count;k++) u.setX(k,1-u.getX(k)); } m.renderOrder=order||1; m.raycast=()=>{}; G.add(m); return m; };
  const wearTW=wearT.clone(); wearTW.repeat.set(2.5,1); wearTW.needsUpdate=true;
  ov(wearT,2*RW,60,0,zr,false,1); ov(wearTW,2*TX,tw,0,zTW,false,1); ov(rubT,600,60,-RW+300,zr,false,2); ov(rubT,600,60,xE-300,zr,true,2);
  [[wh,"#ece9e0"],[ye,"#f0c02e"],[rd,"#cf3a2f"]].forEach(([a,col])=>{ const mm=a.mesh(paint(col),false); mm.renderOrder=3; G.add(mm); });
  /* floor labels (runway numbers, stand numbers, aircraft types) from the atlas */
  const labM=po(new THREE.MeshStandardMaterial({map:atlasTx,transparent:true,depthWrite:false,roughness:0.6,side:THREE.DoubleSide}),-5,-10);
  { const P=[], U=[], I=[]; LQ.forEach(q=>{ const uv=q[4], b=P.length/3; [[q[0],uv[0],uv[1]],[q[1],uv[0],uv[3]],[q[2],uv[2],uv[3]],[q[3],uv[2],uv[1]]].forEach(([p,u,v])=>{ P.push(p[0],0.016,p[1]); U.push(u,v); }); I.push(b,b+1,b+2,b,b+2,b+3); });
    const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(P,3)); g.setAttribute("uv",new THREE.Float32BufferAttribute(U,2)); g.setIndex(I); g.computeVertexNormals();
    const m=new THREE.Mesh(g,labM); m.renderOrder=4; m.raycast=()=>{}; G.add(m); }
  /* grass strips in the infield and dust blends along the pavement edges */
  { grassT.repeat.set(26,1); const gm=po(new THREE.MeshStandardMaterial({map:grassT,transparent:true,depthWrite:false,roughness:1}),-1,-1); dim.push(gm);
    const gr=new THREE.Mesh(new THREE.PlaneGeometry(2*RW+400,zr-zTW-110).rotateX(-PI/2),gm); gr.position.set(0,-0.03,(zr+zTW)/2); gr.raycast=()=>{}; G.add(gr);
    const gr2=new THREE.Mesh(new THREE.PlaneGeometry(2*RW+400,70).rotateX(-PI/2),gm); gr2.position.set(0,-0.03,zr+100); gr2.raycast=()=>{}; G.add(gr2);
    const dm=po(new THREE.MeshStandardMaterial({map:dustT,transparent:true,depthWrite:false,roughness:1}),-1,-3); dim.push(dm);
    [[zr-37.5,-1],[zr+37.5,1],[zTW-tw/2-7.5,-1],[zTW+tw/2+7.5,1]].forEach(([z0,s])=>{ const d=new THREE.Mesh(new THREE.PlaneGeometry(2*RW+120,26).rotateX(-PI/2),dm); d.position.set(0,-0.02,z0+s*13); if(s<0) d.rotation.y=PI; d.raycast=()=>{}; G.add(d); }); }
  /* ---- signs: boards on short posts at the taxiway intersections (yellow/black direction, black/yellow location, white/red mandatory), lit at night ---- */
  const SG={P:[],U:[],I:[]};
  const sgn=(x,z,txt,kind,ry)=>{ const k="g"+kind+txt, uv=labels[k]||label(k,192,64,(g,w,h)=>{ const bg=kind==="d"?"#f2c230":kind==="l"?"#151515":"#c8281e", fg=kind==="d"?"#111":kind==="l"?"#f2c230":"#fff"; g.fillStyle=bg; g.fillRect(0,0,w,h);
      if(kind==="l"){ g.strokeStyle="#f2c230"; g.lineWidth=4; g.strokeRect(5,5,w-10,h-10); } g.fillStyle=fg; g.font="bold 40px Arial,Helvetica,sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.fillText(txt,w/2,h/2+3); });
    const w=kind==="m"?3.6:2.6, h=1.2, y0=1.0, b=SG.P.length/3; const cs=Math.cos(ry), sn=Math.sin(ry); [[-1,0],[-1,1],[1,1],[1,0]].forEach(([a,t])=>{ SG.P.push(x+cs*a*w/2,y0+t*h,z-sn*a*w/2); SG.U.push(a>0?uv[0]:uv[2],t?uv[3]:uv[1]); }); SG.I.push(b,b+1,b+2,b,b+2,b+3);
    [-0.6,0.6].forEach(o=>{ const b2=SG.P.length/3, px=x+cs*o*w/2, pz=z-sn*o*w/2; SG.P.push(px-0.05*cs,0,pz+0.05*sn,px+0.05*cs,0,pz-0.05*sn,px+0.05*cs,y0,pz-0.05*sn,px-0.05*cs,y0,pz+0.05*sn); for(let q=0;q<4;q++) SG.U.push(uv[0]+0.002,uv[1]+0.002); SG.I.push(b2,b2+1,b2+2,b2,b2+2,b2+3); }); };
  [[-1930+17,zr-hold-6,"09L-27R","m"],[-1930-17,zr-hold-6,"09L-27R","m"],[1930+17,zr-hold-6,"09L-27R","m"],[1930-17,zr-hold-6,"09L-27R","m"],[-1930,zTW-20,"A1","l"],[1930,zTW-20,"A9","l"],[-300+16,zTW-21,"A4","l"],[300-16,zTW-21,"A5","l"],[-300-16,zTW-21,"← A4","d"],[300+16,zTW-21,"A5 →","d"],[-860,zTW-20,"B2","l"],[860,zTW-20,"B3","l"]].forEach(([x,z,t,k])=>sgn(x,z,t,k,k==='m'?0:PI/2));
  { const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(SG.P,3)); g.setAttribute("uv",new THREE.Float32BufferAttribute(SG.U,2)); g.setIndex(SG.I); g.computeVertexNormals();
    const sm=new THREE.MeshStandardMaterial({map:atlasTx,roughness:0.5,side:THREE.DoubleSide,emissive:new THREE.Color("#ffffff"),emissiveMap:atlasTx,emissiveIntensity:0}); const m=new THREE.Mesh(g,sm); m.raycast=()=>{}; G.add(m); mats.push(sm); }
  /* ---- lights: sprite batches (visible at night only) ---- */
  const gt=glowTex(), batch=(col,size)=>{ const a=[]; a.col=col; a.size=size; return a; };
  const lw=batch(0xfff3d6,9), lg=batch(0x37ff7a,7.5), lr=batch(0xff3a2a,7.5), lb=batch(0x4f8dff,6), ly=batch(0xffb81c,9);
  const L3=(a,x,z,y)=>a.push(x,y===undefined?0.3:y,z);
  for(let x=-RW;x<=RW;x+=60){ const d=Math.min(x+RW,RW-x), col=d<600?ly:lw; [-1,1].forEach(q=>L3(col,x,zr+q*31)); }
  for(let x=-RW+7.5;x<=RW-7.5;x+=15){ const d=Math.min(x+RW,RW-x), col=d<300?lr:(d<900?(Math.round((x+RW)/15)%2?lr:lw):lw); L3(col,x,zr,0.25); }
  for(let q=-10;q<=10;q++){ L3(lg,-RW+1,zr+q*3); L3(lg,xE-1,zr+q*3); L3(lr,-RW-1,zr+q*3); L3(lr,RW+1,zr+q*3); }
  const appr=(x0,dir)=>{ for(let d=30;d<=900;d+=30){ for(let j=-2;j<=2;j++) L3(lw,x0+dir*d,zr+j*1.5,1.2); if(d===150) for(let j=-4;j<=4;j++) if(Math.abs(j)>1) L3(lw,x0+dir*d,zr+j*1.5,1.2); if(d===300) for(let j=-7;j<=7;j++) if(Math.abs(j)>1) L3(lw,x0+dir*d,zr+j*1.5,1.2); if(d>=330&&d<=600) [-1,1].forEach(q=>L3(lr,x0+dir*d,zr+q*9,1.2)); } };
  appr(-RW-60,-1); appr(RW+60,1);
  const samp=(pts,step,fn)=>{ let carry=0; for(let k=1;k<pts.length;k++){ const a=pts[k-1], b=pts[k], len=Math.hypot(b[0]-a[0],b[1]-a[1]); let s=carry; for(;s<len;s+=step) fn(a[0]+(b[0]-a[0])*s/len,a[1]+(b[1]-a[1])*s/len); carry=s-len; } };
  links.forEach(pts=>samp(pts,15,(x,z)=>L3(lg,x,z,0.25)));
  for(let x=-TX;x<=TX;x+=45) [-1,1].forEach(q=>L3(lb,x,zTW+q*(tw/2+1.0),0.3));
  [-1930,1930].forEach(xc=>{ for(let j=-5;j<=5;j++) L3(lr,xc+j*2,zr-hold-0.4,0.25); [-1,1].forEach(q=>L3(ly,xc+q*(tl/2+2),zr-hold-1.5,0.6)); });
  const mkPts=(arr)=>{ const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(arr,3)); const m=new THREE.PointsMaterial({color:arr.col,size:arr.size,map:gt,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true,fog:false}); if(typeof vwGlow==="function") vwGlow(m,"rwy"); const p=new THREE.Points(g,m); p.raycast=()=>{}; p.frustumCulled=false; G.add(p); lights.push(p); return p; };
  [lw,lg,lr,lb,ly].forEach(mkPts);
  /* PAPI: four light units left of each runway, 300 m in from the threshold (two red and two white lenses facing the approach) */
  const papiM=new THREE.MeshStandardMaterial({color:"#8f979c",roughness:0.6}), lensW=new THREE.MeshBasicMaterial({color:0xfff6e0,toneMapped:false}), lensR=new THREE.MeshBasicMaterial({color:0xff3a22,toneMapped:false});
  [[-RW+300,1],[xE-300,-1]].forEach(([x0,s])=>{ for(let k=0;k<4;k++){ const zc=zr-(30+15+k*9), b=new THREE.Mesh(new THREE.BoxGeometry(1.4,1.1,1.6),papiM); b.position.set(x0,0.55,zc); G.add(b); b.raycast=()=>{};
      const l=new THREE.Mesh(new THREE.PlaneGeometry(1.0,0.5),k<2?lensR:lensW); l.position.set(x0-s*0.71,0.7,zc); l.rotation.y=-s*PI/2; G.add(l); l.raycast=()=>{}; } });
  dim.push(rdM); return {group:G, lights, mats, night(on){ mats.forEach(m=>{ m.emissiveIntensity=on?0.85:0; }); dim.forEach(m=>{ if(!m.userData.c0) m.userData.c0=m.color.clone(); m.color.copy(m.userData.c0).multiplyScalar(on?0.62:1); }); } };
}
