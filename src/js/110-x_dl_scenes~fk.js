/* ---------- fk: the airports of the flight world. FK_AIRPORTS is a compact table (real public ICAO codes and city names; the layouts and surroundings are approximations in the spirit of each place).
   fkLayout(apt) turns one entry into the airport spec used everywhere: pavement rectangles for the ground shader, stands, taxi route, building and light positions.
   The runway always lies on x=0 from z=0 (threshold) to z=-len, flown heading 360 (the simulator has one world frame, so every runway is painted 36/18); the apron is on side +1 (+x) or -1.
   fkEnvApply(AU,apt) writes terrain / water / city uniforms. The picker UI is fkAptHTML(). ---------- */
const FK_GULF=[[0.88,0.82,0.70],[0.78,0.70,0.56],[0.80,0.78,0.74],[0.64,0.69,0.74]];
const FK_AIRPORTS=[
 {id:"ORBI",lat:33.2625,lon:44.2346,ar:"بغداد الدولي",en:"Baghdad International",cy:["بغداد","Baghdad"],elev:34,rwy:"15R/33L",d:["سهل جاف مسطّح ونهر دجلة ومدينة كثيفة منخفضة المباني","Flat dry plain, the Tigris and a dense low-rise city"],
  len:4000,r2:[1400,3800],w:60,tw:190,side:1,ns:6,tc:"#d8d2c4",
  env:{riv:{n:[1,0],d:-3800,hw:130,amp:520,wl:3400,ph:0.6},cities:[[-7000,-5500,5200,0.3],[6500,-9000,2000,0.2]],rot:0.33,warp:30,th:2.2,pitched:0,pal:[[0.78,0.70,0.58],[0.70,0.60,0.47],[0.66,0.64,0.60],[0.55,0.52,0.48]],
   rel:[30,3,0,0],trn:[0.15,0,0.35,1e5],palm:0.6,pa:[0.77,0.66,0.48],pb:[0.66,0.52,0.36],pc:[0.58,0.50,0.40],gr:[0.30,0.42,0.17],wc0:[0.34,0.36,0.26],wc1:[0.18,0.22,0.17]}},
 {id:"OMDB",lat:25.2531,lon:55.3656,ar:"دبي الدولي",en:"Dubai International",cy:["دبي","Dubai"],elev:19,rwy:"12L/30R",d:["صحراء وساحل وخور وأفق ناطحات سحاب","Desert coast, a creek and a skyscraper skyline"],
  len:4400,r2:[400,4300],w:60,tw:200,side:1,ns:8,tc:"#e3e6e8",
  env:{sea:[[1,0,9000,1500]],riv:{n:[0,1],d:-2800,hw:90,amp:140,wl:1800,ph:0.3,t0:-9500,t1:-1500},cities:[[4300,-3000,3100,1.6],[-2500,6500,1500,0.5],[7300,3600,1100,0.5]],rot:0.21,warp:8,th:1,pitched:0,pal:FK_GULF,
   rel:[45,10,0,60],trn:[0.05,0,0.1,1e5],palm:0.9,pa:[0.78,0.66,0.47],pb:[0.70,0.47,0.30],pc:[0.60,0.50,0.38],gr:[0.25,0.42,0.18],wc0:[0.09,0.40,0.39],wc1:[0.010,0.07,0.165]}},
 {id:"OTHH",lat:25.2731,lon:51.6081,ar:"حمد الدولي",en:"Hamad International",cy:["الدوحة","Doha"],elev:4,rwy:"16R/34L",d:["مطار على خليج ومدينة ساحلية وأبراج غرب الخليج","Bay-side airport, a coastal city and a west-bay skyline"],
  len:4850,r2:[1500,4200],w:60,tw:210,side:1,ns:8,tc:"#e6dcc8",
  env:{sea:[[0.8,-0.6,6000,900]],cities:[[-1500,-7500,2800,1.3],[-6000,3000,2200,0.4]],rot:0.5,warp:10,th:1,pitched:0,pal:FK_GULF,
   rel:[20,6,0,0],trn:[0.04,0,0,1e5],palm:0.8,pa:[0.82,0.72,0.55],pb:[0.74,0.60,0.42],pc:[0.66,0.58,0.46],gr:[0.25,0.42,0.18],wc0:[0.10,0.42,0.40],wc1:[0.015,0.09,0.18]}},
 {id:"OMAA",lat:24.4331,lon:54.6511,ar:"أبوظبي الدولي",en:"Abu Dhabi International",cy:["أبوظبي","Abu Dhabi"],elev:27,rwy:"13R/31L",d:["جزر وصحراء وبحر على جانبين وأبراج الكورنيش","Islands, desert and sea on two sides with a corniche skyline"],
  len:4100,r2:[1000,4000],w:60,tw:200,side:-1,ns:7,tc:"#e8e4da",
  env:{sea:[[1,0,7500,800],[0,-1,11000,900]],cities:[[-3500,5000,2600,1.1],[-9000,-1000,1400,0.4]],rot:0.7,warp:8,th:1,pitched:0,pal:FK_GULF,
   rel:[22,8,0,0],trn:[0.1,0,0,1e5],palm:1,pa:[0.80,0.68,0.50],pb:[0.72,0.56,0.38],pc:[0.64,0.55,0.44],gr:[0.25,0.42,0.18],wc0:[0.12,0.44,0.40],wc1:[0.015,0.09,0.17]}},
 {id:"OERK",lat:24.9575,lon:46.6989,ar:"الملك خالد الدولي",en:"King Khalid International",cy:["الرياض","Riyadh"],elev:625,rwy:"15L/33R",d:["هضبة صحراوية صخرية ومدينة ضخمة وبرج وسط المدينة","A rocky desert plateau, a huge city and a downtown tower"],
  len:4200,r2:[1500,4100],w:60,tw:210,side:1,ns:6,tc:"#d9d0c0",
  env:{cities:[[-6500,-4500,6200,1.2],[7000,6000,2500,0.5]],rot:0.12,warp:6,th:1.2,pitched:0,pal:[[0.86,0.80,0.68],[0.76,0.67,0.54],[0.74,0.72,0.68],[0.62,0.66,0.70]],
   rel:[55,12,0,300],trn:[0.03,0,0.15,1e5],palm:0.6,pa:[0.80,0.68,0.50],pb:[0.72,0.55,0.38],pc:[0.62,0.52,0.42],gr:[0.28,0.40,0.18],wc0:[0.2,0.3,0.3],wc1:[0.1,0.16,0.18]}},
 {id:"LTFM",lat:41.2753,lon:28.7519,ar:"إسطنبول",en:"Istanbul Airport",cy:["إسطنبول","Istanbul"],elev:99,rwy:"17L/35R",d:["تلال خضراء وغابات وبحر أسود ومدينة كبيرة بسقوف قرميدية","Green hills, forests, the Black Sea and a big city with tiled roofs"],
  len:4100,r2:[1800,4000],w:60,tw:200,side:1,ns:8,tc:"#cfd3d6",
  env:{sea:[[0,-1,16000,2000]],cities:[[5500,5500,3800,0.55],[-6500,-3000,1600,0.3]],rot:0.4,warp:22,th:1.5,pitched:1,pal:[[0.90,0.84,0.72],[0.80,0.70,0.58],[0.74,0.72,0.68],[0.62,0.50,0.42]],
   rel:[90,0,0,380],trn:[0.9,0.75,0.3,1e5],palm:0,pa:[0.46,0.50,0.26],pb:[0.40,0.40,0.24],pc:[0.50,0.46,0.38],gr:[0.20,0.38,0.14],wc0:[0.12,0.34,0.36],wc1:[0.02,0.12,0.20]}},
 {id:"EGLL",lat:51.4700,lon:-0.4543,ar:"هيثرو لندن",en:"London Heathrow",cy:["لندن","London"],elev:25,rwy:"09L/27R",d:["حقول خضراء ومدينة كثيفة منخفضة المباني ونهر التيمز","Green fields, a dense low-rise city and the Thames"],
  len:3900,r2:[1400,3600],w:50,tw:190,side:-1,ns:8,tc:"#d4d6d6",
  env:{riv:{n:[0,1],d:-8500,hw:85,amp:600,wl:4200,ph:1.1},cities:[[3500,-13500,7000,0.6],[-5000,4500,2600,0.25],[6500,5500,2200,0.25]],rot:-0.2,warp:28,th:1.7,pitched:1,pal:[[0.62,0.40,0.32],[0.56,0.46,0.40],[0.66,0.62,0.56],[0.50,0.54,0.58]],
   rel:[28,0,0,50],trn:[1,0.35,0.9,1e5],palm:0,pa:[0.36,0.47,0.20],pb:[0.44,0.45,0.26],pc:[0.50,0.46,0.38],gr:[0.24,0.40,0.15],wc0:[0.30,0.34,0.30],wc1:[0.12,0.16,0.17]}},
 {id:"WSSS",lat:1.3644,lon:103.9915,ar:"سنغافورة شانغي",en:"Singapore Changi",cy:["سنغافورة","Singapore"],elev:7,rwy:"02C/20C",d:["ساحل استوائي أخضر وسفن راسية في البحر وأبراج بيضاء","Green tropical coast, ships at anchor and white towers"],
  len:4000,r2:[1000,4000],w:60,tw:200,side:1,ns:7,tc:"#e6e8e6",
  env:{sea:[[1,0,3200,400],[0,1,7000,500]],cities:[[-6500,-3000,3000,1],[-2000,-9000,1800,0.5]],rot:0.1,warp:12,th:1,pitched:0,pal:[[0.92,0.90,0.84],[0.80,0.82,0.80],[0.88,0.84,0.76],[0.62,0.68,0.72]],
   rel:[30,0,0,110],trn:[1,0.8,0,1e5],palm:0.5,ships:1,pa:[0.30,0.36,0.18],pb:[0.38,0.34,0.20],pc:[0.46,0.40,0.30],gr:[0.12,0.34,0.10],wc0:[0.18,0.42,0.38],wc1:[0.02,0.12,0.16]}},
 {id:"LSZH",lat:47.4647,lon:8.5492,ar:"زيورخ",en:"Zurich Airport",cy:["زيورخ","Zurich"],elev:432,rwy:"16/34",d:["وادٍ بين بحيرات وجبال الألب المكسوّة بالثلج","A valley between lakes and snow-capped Alps"],
  len:3700,w:60,tw:190,side:-1,ns:6,tc:"#dcdcd8",
  env:{lakes:[[6500,5000,1100,7000],[-7000,-6000,900,1400]],mt:[0.3,0.95,9000,24000],cities:[[4500,-1800,2200,0.6],[-5500,4500,1100,0.25]],rot:0.55,warp:24,th:1.3,pitched:1,pal:[[0.90,0.86,0.78],[0.80,0.74,0.64],[0.78,0.76,0.72],[0.60,0.56,0.52]],
   rel:[60,0,2400,260],trn:[0.95,0.55,0.7,1650],palm:0,pa:[0.30,0.45,0.20],pb:[0.40,0.42,0.26],pc:[0.52,0.50,0.46],gr:[0.20,0.40,0.14],wc0:[0.12,0.32,0.34],wc1:[0.03,0.12,0.20]}}
];
function fkAptById(id){ return FK_AIRPORTS.find(a=>a.id===id)||FK_AIRPORTS[0]; }
/* the airport spec. Positive-side numbers are multiplied by sg (the side of the apron); rectangles: [type,cx,cz,hx,hz] with 1 runway, 2 taxiway / lane / link, 3 apron */
function fkLayout(a){
  if(a._L) return a._L;
  const sg=a.side||1, len=a.len, tw=a.tw, ns=a.ns, sp=100, ad=a.ad||210, rd=v=>Math.round(v/10)*10, az0=-rd(len*0.18), zs=az0+80, zn=az0-sp*(ns-1)-80, xa0=tw+75, xa=xa0+ad, xf=xa+8, xn=xf-24, xl=xn-108;
  const L={apt:a,sg,len,w:a.w,tw,ns,sp,az0,zs,zn,xa0,xa,xl,xf,xn,rects:[],stands:[],ex:[40,-rd(len*0.125),-rd(len*0.47),-rd(len*0.9),-len-60]};
  const add=(t,cx,cz,hx,hz)=>L.rects.push([t,sg*cx,cz,hx,hz]);
  add(1,0,-len/2,a.w/2,len/2); add(2,tw,-len/2,11.5,len/2+100);
  L.ex.forEach((z,i)=>{ if(i===0||i===L.ex.length-1) add(2,tw/2,z,tw/2,11.5); else add(2,(tw+30)/2,z,(tw-30)/2,11.5); }); add(3,0,25,36,30);
  add(3,(xa0+xa)/2,(zs+zn)/2,ad/2,(zs-zn)/2); add(2,xl,(zs+zn)/2,14,(zs-zn)/2);
  L.links=[zs-8,zn+8]; L.links.forEach(z=>add(2,(tw+xl)/2,z,(xl-tw)/2,14));
  for(let i=0;i<ns;i++) L.stands.push({x:sg*xn,z:az0-sp*i,hdg:sg>0?90:270,i});
  /* taxi route (corners; fkRoute rounds them) from the apron lane to the runway line-up: lane south, link west, taxiway south, connector west, runway north */
  const zl=L.links[0], zc=L.ex[0]; L.corners=[[sg*xl,zl],[sg*tw,zl],[sg*tw,zc],[0,zc],[0,-60]];
  L.holdZ=zc; L.hold=sg*(76);
  /* building and light positions (positive side, multiplied where used) */
  L.term={x:sg*(xf+55),z:(zs+zn)/2,len:zs-zn-20,depth:110};
  L.tower={x:sg*(xf+70),z:zn-150}; L.hangars=[[sg*(xf+330),zs+200,130],[sg*(xf+330),zs+470,140]]; L.tanks={x:sg*(xf+300),z:zn-380};   /* (v24) bigger airport: the buildings are pushed back to make room for the larger terminal */
  L.masts=[]; for(let k=0;k<Math.min(4,ns-1);k++){ const z=az0-sp*(k+0.5); L.masts.push([sg*(xa0+4),z],[sg*(xn-46),z]); }
  if(a.r2){ const q=a.r2; L.r2={x:-sg*q[0],z:-len/2+(q[2]||0),hw:a.w/2,hl:q[1]/2}; }   /* second runway, parallel, on the side away from the apron (the flown runway stays the one on x=0) */
  const xs=[-90,tw+ad+560].map(v=>v*sg).concat(L.r2?[L.r2.x-sg*(L.r2.hw+160)]:[]), x0=Math.min(...xs), x1=Math.max(...xs), zbox=Math.max(len/2+500,L.r2?Math.abs(L.r2.z)+L.r2.hl+200:0); L.box=[(x0+x1)/2,-len/2-60,(x1-x0)/2,zbox];
  L.ils={locZ:-len-100,tdz:-300}; L.gate=Math.min(2,ns-1); L.empty=ns>3?ns-1:-1;
  a._L=L; return L;
}
/* terrain, water, palette and city uniforms for one airport; also the JS twins (water function, city config) the building rings use */
function fkEnvApply(AU,a){
  const L=fkLayout(a), E=a.env, V4=THREE.Vector4, off=[0,0,1e7,0];
  const sea=E.sea||[], s0=sea[0]||off, s1=sea[1]||off; AU.uSea0.value.set(...s0); AU.uSea1.value.set(...s1);
  const r=E.riv; if(r){ AU.uRiv.value.set(r.n[0],r.n[1],r.d,r.hw); AU.uRiv2.value.set(r.amp,r.wl,r.ph,1); AU.uRiv3.value.set(r.t0===undefined?-1e6:r.t0,r.t1===undefined?1e6:r.t1); } else { AU.uRiv.value.set(1,0,0,0); AU.uRiv2.value.set(0,1000,0,0); AU.uRiv3.value.set(0,0);}
  const lk=E.lakes||[]; [0,1].forEach(i=>{ const q=lk[i]||[0,0,0,0]; AU["uLak"+i].value.set(...q); });
  AU.uRel.value.set(...E.rel); const m=E.mt||[1,0,1e7,2e7]; AU.uMt.value.set(...m); AU.uTrn.value.set(E.trn[0],E.trn[1],E.trn[2],E.trn[3]);
  AU.uPA.value.set(...E.pa); AU.uPB.value.set(...E.pb); AU.uPC.value.set(...E.pc); AU.uGr.value.set(...E.gr); AU.uWC0.value.set(...E.wc0); AU.uWC1.value.set(...E.wc1); AU.uPalm.value=E.palm;
  /* airport zone and pavement */
  AU.uAp.value.set(...L.box); AU.uRw.value.set(L.len,L.w/2,L.sg,0); if(L.r2) AU.uR2.value.set(L.r2.x,L.r2.z,L.r2.hw,L.r2.hl); else AU.uR2.value.set(0,0,0,0);
  for(let i=0;i<14;i++){ const q=L.rects[i]; AU.uPv.value[i].set(q?q[1]:0,q?q[2]:0,q?q[3]:0,q?q[4]:0); AU.uPy.value[i]=q?q[0]:0; }
  AU.uAv.value.set(L.az0,L.sp,Math.min(L.sg*(L.xl+14),L.sg*L.xn),Math.max(L.sg*(L.xl+14),L.sg*L.xn)); AU.uAs.value.set(L.ns,L.holdZ,L.hold,L.sg);
  L.ex.forEach((z,i)=>AU.uHd.value[i].set(L.sg*76,z,L.sg,0));
  /* the JS twins used by the city rings */
  const C=FK.cur; C.ct=E.cities; C.rot=E.rot; C.warp=E.warp; C.th=E.th; C.pitched=E.pitched; C.ap=L.box.slice(); C.pal=E.pal;
  const sd=(S,x,z)=>{ if(S[2]>1e6) return -1e5; const nx=S[0], nz=S[1], aa=-nz*x+nx*z, wob=S[3]*(Math.sin(aa/2600)+0.47*Math.sin(aa/900+1)+0.66*(fkN(0,aa/5000,0.37)-0.5)); return nx*x+nz*z-S[2]-wob; };
  C.water=(x,z)=>{ let s=Math.max(sd(s0,x,z),sd(s1,x,z)); if(r){ const aa=-r.n[1]*x+r.n[0]*z, t0=r.t0===undefined?-1e6:r.t0, t1=r.t1===undefined?1e6:r.t1; if(aa>t0&&aa<t1){ const c=r.d+r.amp*Math.sin(aa/r.wl+r.ph)+0.3*r.amp*Math.sin(aa/(r.wl*0.31)+1.7); s=Math.max(s,r.hw-Math.abs(r.n[0]*x+r.n[1]*z-c)); } }
    lk.forEach(q=>{ if(q[2]>1) s=Math.max(s,Math.min(q[2],q[3])*(1-Math.hypot((x-q[0])/q[2],(z-q[1])/q[3]))); }); return s; };
  const rr=fkRoads(L); C.rd=rr.rd; C.ring=rr.ring; rr.rd.forEach((q,i)=>AU.uRd.value[i].set(q[0],q[1],q[2],q[3])); if(rr.ring) AU.uRing.value.set(rr.ring[0],rr.ring[1],rr.ring[2],1); else AU.uRing.value.set(0,0,1,0);
  fkApplyCfg(AU);
  FPH_RWY.len=L.len; FPH_RWY.width=L.w; FPH_RWY.locZ=L.ils.locZ; FPH_RWY.tdz=L.ils.tdz;
  return L;
}
/* uniforms of the terrain / water / pavement model (values are set per airport by fkEnvApply) */
function fkEnvUniforms(AU){ const V4=THREE.Vector4, V3=THREE.Vector3, v4=()=>({value:new V4()}), v3=()=>({value:new V3()});
  Object.assign(AU,{uSea0:v4(),uSea1:v4(),uRiv:v4(),uRiv2:v4(),uRiv3:{value:new THREE.Vector2()},uLak0:v4(),uLak1:v4(),uRel:v4(),uMt:v4(),uTrn:v4(),uRd:{value:[new V4(),new V4(),new V4(),new V4()]},uRing:v4(),
    uPA:v3(),uPB:v3(),uPC:v3(),uGr:v3(),uWC0:v3(),uWC1:v3(),uPalm:{value:0.5},uRw:v4(),uR2:v4(),uPv:{value:Array.from({length:14},()=>new V4())},uPy:{value:new Array(14).fill(0)},uAv:v4(),uAs:v4(),uHd:{value:Array.from({length:5},()=>new V4())}}); }
/* the roads: access road from the terminal forecourt, around the field end, to the biggest city, on beyond it, plus a ring road around a large city */
function fkRoads(L){ const E=L.apt.env, T=E.cities.reduce((m,c)=>c[2]>m[2]?c:m,E.cities[0]), sg=L.sg, F=[sg*(L.xf+310),(L.zs+L.zn)/2], M1=[F[0]+sg*500,F[1]], zEnd=T[1]<-L.len/2?-L.len-800:800, W=[M1[0],zEnd], far=[T[0]+(T[0]-W[0])*0.5,T[1]+(T[1]-W[1])*0.5];
  return {rd:[[F[0],F[1],M1[0],M1[1]],[M1[0],M1[1],W[0],W[1]],[W[0],W[1],T[0],T[1]],[T[0],T[1],far[0],far[1]]],ring:T[2]>3000?[T[0],T[1],T[2]*0.62]:null}; }
/* ---- airport diagrams (v23): every card of the pickers shows its airport as a chart thumbnail (runway left to right, apron below, pavement white on slate like an airport diagram),
   and the picker has an airport map that follows the selection (labelled runway, terminal, tower, hangars, stands, scale bar). Both are drawn from fkLayout, nothing is copied. ---- */
function fkSvgRect(x0,x1,y0,y1,f,extra){ return `<rect x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${Math.max(0.4,x1-x0).toFixed(1)}" height="${Math.max(0.4,y1-y0).toFixed(1)}" fill="${f}"${extra||""}/>`; }
function fkDiagramGeo(a){
  const L=fkLayout(a), sg=L.sg, mx=-250, Mx=L.len+250, my=-120-(L.r2?Math.abs(L.r2.x)+80:0), My=L.xf+400;   /* screen x = -z (the runway runs left to right, flown towards the right = north); screen y = sg*x (the apron side is always below) */
  const X=z=>-z-mx, Y=x=>sg*x-my;
  return {L,sg,W:Mx-mx,H:My-my,X,Y};
}
function fkDiagram(a){
  const D=fkDiagramGeo(a), L=D.L, sg=D.sg, X=D.X, Y=D.Y; let h="";
  L.rects.forEach(r=>{ const t=r[0], cx=r[1], cz=r[2], hx=r[3], hz=r[4], yc=Y(sg*cx); h+=fkSvgRect(X(cz+hz),X(cz-hz),yc-hx,yc+hx,t===1?"#10141a":"#f3f5f8"); });   /* rectangles are centred: screen y = sg*x */
  if(L.r2){ const q=L.r2, yc=Y(sg*q.x); h+=fkSvgRect(X(q.z+q.hl),X(q.z-q.hl),yc-q.hw,yc+q.hw,"#10141a")+`<path d="M${X(q.z+q.hl-30)} ${yc} H${X(q.z-q.hl+30)}" stroke="#f3f5f8" stroke-width="${Math.max(2,L.w*0.06)}" stroke-dasharray="${L.len*0.012} ${L.len*0.01}" fill="none"/>`; }
  h+=`<path d="M${X(-30)} ${Y(0)} H${X(-L.len+30)}" stroke="#f3f5f8" stroke-width="${Math.max(2,L.w*0.06)}" stroke-dasharray="${L.len*0.012} ${L.len*0.01}" fill="none"/>`;
  const T=L.term, ty=Y(sg*T.x); h+=fkSvgRect(X(T.z+T.len/2),X(T.z-T.len/2),ty-T.depth/2,ty+T.depth/2,"#c4cddb");
  L.stands.forEach(st=>{ h+=`<circle cx="${X(st.z).toFixed(1)}" cy="${(Y(sg*L.xf)-8).toFixed(1)}" r="${Math.max(9,L.w*0.2)}" fill="#7f8da6"/>`; });
  const tw=L.tower; h+=fkSvgRect(X(tw.z)-16,X(tw.z)+16,Y(sg*tw.x)-16,Y(sg*tw.x)+16,"#f0b44c");
  L.hangars.forEach(q=>{ h+=fkSvgRect(X(q[1])-q[2]/2,X(q[1])+q[2]/2,Y(sg*q[0])-45,Y(sg*q[0])+45,"#9fb0c8"); });
  return `<svg viewBox="0 0 ${D.W} ${D.H}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">${h}</svg>`;
}
/* the larger airport map of the picker: lighter ground, grey pavement, labels and a scale bar */
function fkChartSVG(a,en){
  const D=fkDiagramGeo(a), L=D.L, sg=D.sg, X=D.X, Y=D.Y;
  let h=fkSvgRect(0,D.W,0,D.H,"#e7ecdf"), fs=Math.round(D.W/52), tx=(x,y,t,o)=>`<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" font-size="${fs}" fill="#27303d" text-anchor="${o||"middle"}" font-family="inherit">${t}</text>`;
  L.rects.forEach(r=>{ const t=r[0], cx=r[1], cz=r[2], hx=r[3], hz=r[4], yc=Y(sg*cx); h+=fkSvgRect(X(cz+hz),X(cz-hz),yc-hx,yc+hx,t===1?"#aeb2cc":"#cfd1e4",t===1?' stroke="#f7f7fb" stroke-width="'+(L.w*0.12)+'"':""); });
  if(L.r2){ const q=L.r2, yc=Y(sg*q.x); h+=fkSvgRect(X(q.z+q.hl),X(q.z-q.hl),yc-q.hw,yc+q.hw,"#aeb2cc",' stroke="#f7f7fb" stroke-width="'+(L.w*0.12)+'"')+`<path d="M${X(q.z+q.hl-60)} ${yc} H${X(q.z-q.hl+60)}" stroke="#fff" stroke-width="${Math.max(3,L.w*0.07)}" stroke-dasharray="${L.len*0.014} ${L.len*0.012}" fill="none"/>`; }
  h+=`<path d="M${X(-60)} ${Y(0)} H${X(-L.len+60)}" stroke="#fff" stroke-width="${Math.max(3,L.w*0.07)}" stroke-dasharray="${L.len*0.014} ${L.len*0.012}" fill="none"/>`;
  const T=L.term, ty=Y(sg*T.x); h+=fkSvgRect(X(T.z+T.len/2),X(T.z-T.len/2),ty-T.depth/2,ty+T.depth/2,"#b9bccf",' stroke="#8d92ad" stroke-width="3"');
  L.stands.forEach(st=>{ h+=`<circle cx="${X(st.z).toFixed(1)}" cy="${(Y(sg*L.xf)-8).toFixed(1)}" r="${Math.max(9,L.w*0.2)}" fill="#8d92ad"/>`; });
  const tw=L.tower; h+=fkSvgRect(X(tw.z)-18,X(tw.z)+18,Y(sg*tw.x)-18,Y(sg*tw.x)+18,"#e0a53a");
  L.hangars.forEach(q=>{ h+=fkSvgRect(X(q[1])-q[2]/2,X(q[1])+q[2]/2,Y(sg*q[0])-45,Y(sg*q[0])+45,"#a9aec6"); });
  const yR=Y(0), T0=X(0), T1=X(-L.len);
  h+=tx(T0-fs*1.6,yR+fs*0.35,"36")+tx(T1+fs*1.6,yR+fs*0.35,"18")+tx(X(-L.len/2),yR-L.w*0.7-fs*0.4,(en?"Runway ":"المدرج ")+Math.round(L.len)+(en?" m":" م"));
  h+=tx(X(T.z),ty+(T.depth/2)+fs*1.3,en?"Terminal":"المبنى")+tx(X(tw.z),Y(sg*tw.x)-fs*1.4,en?"Tower":"البرج")+tx(X(L.hangars[0][1]),Y(sg*L.hangars[0][0])-70,en?"Hangars":"الهناجر");
  h+=tx(X(L.az0-L.sp*(L.ns-1)/2),Y(sg*(L.xa0+L.xa)/2),en?"Apron":"الرصيف")+tx(X(-L.len*0.5),Y(sg*L.tw)+fs*0.35,en?"Taxiway":"ممر التاكسي");
  const kx=D.W-1000-60, ky=D.H-fs*2.2; h+=`<path d="M${kx} ${ky} h1000" stroke="#27303d" stroke-width="5"/><path d="M${kx} ${ky-14} v28 M${kx+1000} ${ky-14} v28" stroke="#27303d" stroke-width="5"/>`+tx(kx+500,ky-fs*0.7,en?"1 km":"1 كم");
  h+=`<path d="M${fs*3} ${fs*2.5} h${fs*3}" stroke="#27303d" stroke-width="5" marker-end="url(#fkA)"/><defs><marker id="fkA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#27303d"/></marker></defs>`+tx(fs*2,fs*2.9,"N","end");
  return `<svg viewBox="0 0 ${D.W} ${D.H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${en?"Airport map":"خريطة المطار"}" focusable="false">${h}</svg>`;
}
function fkChartHTML(sel){
  const en=typeof fkLang==="function"&&fkLang()==="en", a=fkAptById(sel||"ORBI"), L=fkLayout(a);
  return `<details class="fkchart" open><summary>${en?"Airport map":"خريطة المطار"}</summary><div class="fkchartbox" id="fkChartBox">${fkChartSVG(a,en)}</div><p class="status" id="fkChartTx">${en?a.en+" · "+a.id+" · elevation "+a.elev+" m · runway "+a.len+" m × "+a.w+" m · "+L.ns+" stands · drawn to scale, north to the right":a.ar+" · "+a.id+" · ارتفاع "+a.elev+" م · المدرج "+a.len+" م × "+a.w+" م · "+L.ns+" مواقف · الرسم بمقياس حقيقي والشمال إلى اليمين"}</p></details>`;
}
function fkChartUpdate(root){
  try{ const sel=FLY.opts.apt||"ORBI", en=typeof fkLang==="function"&&fkLang()==="en", a=fkAptById(sel), L=fkLayout(a), box=root.querySelector("#fkChartBox"), tx=root.querySelector("#fkChartTx"); if(box) box.innerHTML=fkChartSVG(a,en);
    if(tx) tx.textContent=en?a.en+" · "+a.id+" · elevation "+a.elev+" m · runway "+a.len+" m × "+a.w+" m · "+L.ns+" stands · drawn to scale, north to the right":a.ar+" · "+a.id+" · ارتفاع "+a.elev+" م · المدرج "+a.len+" م × "+a.w+" م · "+L.ns+" مواقف · الرسم بمقياس حقيقي والشمال إلى اليمين"; }catch(e){ console.error(e); }
}
function fkAptHTML(sel){
  const en=typeof fkLang==="function"&&fkLang()==="en";
  return `<div class="fsec"><h4>${en?"Airport":"المطار"}</h4><div class="fscn fkapts">${FK_AIRPORTS.map(a=>`<button type="button" class="fsc" data-fo="apt" data-fv="${a.id}" aria-pressed="${sel===a.id}"><span class="fkdg">${fkDiagram(a)}</span><b>${en?a.en:a.ar} <span dir="ltr" class="fkicao">${a.id}</span></b><small>${en?a.cy[1]:a.cy[0]} · ${en?a.ar:a.en}</small><small>${en?a.d[1]:a.d[0]}</small><small class="fkapx">${en?"Approximate · elevation "+a.elev+" m · real runway "+a.rwy:"تقريبي · ارتفاع "+a.elev+" م · المدرج "+a.rwy}</small></button>`).join("")}</div>${fkChartHTML(sel)}</div>`;
}
(function(){ const st=document.createElement("style"); st.textContent=".fkicao{font-size:.8em;opacity:.7;margin-inline-start:.4em;letter-spacing:.05em}.fkapx{opacity:.65;font-size:.78em}.fkdg{display:block;background:#3b4a6b;border-radius:9px;height:88px;margin:-2px -2px 6px;overflow:hidden}.fkdg svg{display:block;width:100%;height:100%}.fkchart{margin-top:10px;border:1px solid var(--line);border-radius:12px;padding:8px 10px;background:var(--panel)}.fkchart summary{cursor:pointer;font-weight:600;font-size:14px}.fkchartbox{margin-top:8px;border-radius:9px;overflow:hidden;background:#e7ecdf;max-height:300px}.fkchartbox svg{display:block;width:100%;height:auto;max-height:300px}"; try{ document.head.appendChild(st); }catch(e){} })();
/* ---------- ships at anchor (Singapore): one merged ship, instanced, placed deterministically on deep water ---------- */
function fkShipsBuild(scene,AU){
  const parts=[[22,9,150,0,4.5,0,[0.18,0.2,0.24]],[22,1.2,150,0,9.4,0,[0.5,0.12,0.1]],[17,24,18,0,21,56,[0.86,0.87,0.88]],[6,9,6,0,38,60,[0.7,0.15,0.1]],[24,3,26,0,3,-76,[0.16,0.18,0.22]]];
  [-58,-40,-22,-4,14,32].forEach((z,i)=>{ [0.7,1,0.85].forEach((k,j)=>parts.push([15,7*k,15,0,10+3.5*k+(j?0:0),z,[[0.72,0.28,0.2],[0.2,0.4,0.62],[0.85,0.7,0.25],[0.3,0.55,0.38],[0.6,0.6,0.62],[0.7,0.35,0.2]][(i*2+j)%6]]));  });
  const P=[], N=[], C=[]; parts.forEach(([w,h,l,x,y,z,c])=>{ const g=new THREE.BoxGeometry(w,h,l).toNonIndexed(); g.translate(x,y,z); P.push(...g.attributes.position.array); N.push(...g.attributes.normal.array); for(let i=0;i<g.attributes.position.count;i++) C.push(c[0],c[1],c[2]); });
  const geo=new THREE.InstancedBufferGeometry(); geo.setAttribute("position",new THREE.Float32BufferAttribute(P,3)); geo.setAttribute("normal",new THREE.Float32BufferAttribute(N,3)); geo.setAttribute("col",new THREE.Float32BufferAttribute(C,3));
  const NS=40, ip=new Float32Array(NS*4); geo.setAttribute("iP",new THREE.InstancedBufferAttribute(ip,4)); geo.instanceCount=0;
  const mat=new THREE.ShaderMaterial({uniforms:AU,vertexShader:`attribute vec3 col; attribute vec4 iP; uniform vec3 camPos; varying vec3 vW,vN,vC;
    void main(){ float c=cos(iP.z), s=sin(iP.z); vec3 p=position*iP.w; vec3 q=vec3(p.x*c+p.z*s,p.y,-p.x*s+p.z*c)+vec3(iP.x,-3.0,iP.y); vec2 dc=q.xz-camPos.xz; q.y-=dot(dc,dc)/12742000.0+0.5; vN=vec3(normal.x*c+normal.z*s,normal.y,-normal.x*s+normal.z*c); vC=col; vW=q; gl_Position=projectionMatrix*viewMatrix*vec4(q,1.0); }`,
    fragmentShader:fgAtmo+`varying vec3 vW,vN,vC; void main(){ vec3 N=normalize(vN); vec3 col=pow(vC,vec3(2.2))*(uAmb*(0.55+0.45*N.y)+uLCol*max(dot(N,uLDir),0.0)); gl_FragColor=vec4(fgFog(col,vW),1.0);
      #include <tonemapping_fragment>
      #include <encodings_fragment>
    }`});
  const mesh=new THREE.Mesh(geo,mat); mesh.frustumCulled=false; mesh.visible=false; scene.add(mesh);
  return {mesh,place(on){ geo.instanceCount=0; mesh.visible=false; if(!on) return; let seed=777, R=()=>{ seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; }, n=0, w=FK.cur.water, ap=FK.cur.ap;
      for(let tries=0;tries<900&&n<NS;tries++){ const x=(R()-0.5)*22000, z=(R()-0.5)*22000; if(!w||w(x,z)<500) continue; if(Math.abs(x-ap[0])<ap[2]+800&&Math.abs(z-ap[1])<ap[3]+800) continue; ip.set([x,z,R()*6.283,0.8+R()*0.5],n*4); n++; }
      geo.attributes.iP.needsUpdate=true; geo.instanceCount=n; mesh.visible=n>0; }};
}
