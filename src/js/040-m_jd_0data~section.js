/* ---------- (jd) v29: the 747 part by part. Part 1: its own 3D model + labelled diagram for every part that used to be only a highlight on a parent mesh.
   Owner's request: «اريد قطعه قطعه وكلهن تسويلهن مخطط ونموذج ثلاثي الابعاد ولا تعوف اي قطعه».  Before this file the 747 had 46 of its 193 cards without a model of their own
   (structure, doors, engine sensors, tyres, cabin, avionics ...). Every definition below follows the ED rules of m_ed737.js (geo(K) / lab(K) in world metres, x right, y up, z = station - L/2)
   but is written in the aircraft's OWN proportions (fractions of L, rings, wing loft), category "W", so the same model fits the 737, A380 and 747.
   Engine parts use the engine frame of the 737 (cat "E", scaled per nacelle by m_ed_gen.js); nose gear the same (cat "N"). ---------- */
const JD_CK={b747:{zf:2.2,dz:2.6},a380:{zf:2.3,dz:2.6},b737:{zf:1.5,dz:0}};   /* main-deck floor above the ring bottom, and the flight-deck step (the 747 / A380 flight deck is on the upper deck) */
const jdKey=K=>Object.keys(GEO).find(k=>GEO[k]===K.c)||"b737";
const jdFl=(K,X)=>ringAt(K.c,X).zb+(JD_CK[jdKey(K)]||JD_CK.b737).zf;                       /* main-deck floor height at station X */
const jdCkY=(K,X)=>jdFl(K,X)+(JD_CK[jdKey(K)]||JD_CK.b737).dz;                             /* flight-deck floor */
const jdCkX=K=>K.c.rad+(K.c.fd-K.c.rad)*0.5;                                                /* middle of the flight deck */
const jdPt=(K,X,a,off)=>{ const r=K.ring(X), o=off||0; return [Math.cos(a)*(r.hw-o),r.zc+Math.sin(a)*(r.hh-o),K.Z(X)]; };
const jdLoop=(K,X,t,off)=>{ const r=K.ring(X), o=off===undefined?0.05:off; return edTor(1,t||0.03,"z",0,0,0).scale(Math.max(0.2,r.hw-o),Math.max(0.2,r.hh-o),1).translate(0,r.zc,K.Z(X)); };
const jdRange=(a,b,n)=>Array.from({length:n},(_,i)=>a+(b-a)*(n>1?i/(n-1):0));
const jdLoc=(K,id)=>{ try{ return partLoc(id,jdKey(K)); }catch(e){ return null; } };
const jdDoor=(K,re)=>(K.c.doorList||[]).find(d=>re.test(d.n));
const jdBig=K=>K.c.span>50;                                                                  /* 747 / A380 gear dimensions (see p5b2.js) */
const jdAx=K=>jdKey(K)==="b737"?[0]:((K.c.axl||[-0.95,0.95]));                              /* axle offsets of one bogie */
/* a door outline on the side of the fuselage: four bars, with the hinge cylinders on the top edge */
function jdDoorGeo(K,d,s,hinge){ const X=d.X, w=d.w, h=d.h, y=d.z, Z=K.Z(X), g=[], xa=yy=>s*(K.half(X,yy)+0.035);
  g.push(edBox(0.06,0.07,w,xa(y+h/2),y+h/2,Z),edBox(0.06,0.07,w,xa(y-h/2),y-h/2,Z));                       /* top and bottom edges, each on the skin at its own height */
  const n=Math.max(3,Math.ceil(h/0.3)); [-1,1].forEach(e=>{ for(let i=0;i<n;i++){ const y0=y-h/2+h*i/n, y1=y-h/2+h*(i+1)/n, ym=(y0+y1)/2; g.push(edBox(0.06,(y1-y0)+0.02,0.07,xa(ym),ym,Z+e*w/2)); } });   /* the two vertical edges, in short pieces that follow the curve */
  if(hinge) [-0.35,0.35].forEach(f=>g.push(edCyl(0.05,0.24,"y",xa(y+h/2)+s*0.05,y+h/2,Z+w*f)));
  return g; }
const jdDoorLab=(K,d,s,ar,en)=>[[ar,en,[s*(K.half(d.X,d.z)+0.05),d.z+d.h/2+0.12,K.Z(d.X)]]];
