/* ---------- fa: destination, flight route, world swap at top of descent, time compression ----------
   A trip is a departure (FLY.opts.apt) and a destination (FLY.opts.dest; «none» = local flight). Only «من البوابة» and «إقلاع من المدرج» make a trip.
   The world stays the departure airport (its threshold is the origin, runway 36 north) until the aircraft is 120 km from the destination. Then FLY.W.setApt(dest)
   rebuilds ground, sea, cities, runway and ILS data (fkEnvApply sets FPH_RWY) and the coordinates are re-based: the aircraft keeps its position relative to the
   destination (s.p minus the destination point), altitude, speed, heading and autopilot state, so NOTHING jumps (v21: the whiteout and the 60 km / 10,000 ft teleport
   of v17 are gone). The autopilot then flies direct to the initial fix on the extended centre line (0, FA_ARR_M) at 10,000 ft, turns onto the runway heading there and the
   ILS captures (an arrival at 40-50 km at 10,000 ft is above the glide path and cannot capture, so the fix is 60 km out).
   The route: above 1,000 ft with gear and flaps up the route button engages the autopilot: 35,000 ft, direct to the destination point (the point lies at the great-circle
   distance on the great-circle bearing, in the departure frame).
   Time compression FLY.opts.ts (1, 4, 16): flyFrame takes more physics steps per frame while the autopilot flies the route in smooth air; the step size does not change,
   so physics, fuel and sound stay consistent. Public: faTripFor() faDestId() faDestHTML() faMount(el) faReset() faStop() faStep(dt) faFrame(dt) faScale() faAct(a). */
const FA={on:false,route:false,leg:"dep",trip:null,simT:0,R:0,tod:false,swapped:false,iaf:false,landed:false,done:false,bar:null,tBar:0};
const FA_DEST={ORBI:"OMAA",OMDB:"OTHH",OTHH:"OMAA",OMAA:"OMDB",OERK:"OTHH",LTFM:"LSZH",EGLL:"LSZH",WSSS:"OMDB",LSZH:"EGLL"};
const FA_SCN=["gate","takeoff"], FA_CRUISE_FT=35000, FA_CRUISE_KMH=800, FA_TOD_M=170000, FA_SWAP_M=120000, FA_ARR_M=60000, FA_ARR_FT=10000;
const FA_T={
  afterTo:{ar:"شغّل المحركات وأقلع أولاً، ثم فعّل المسار.",en:"Start the engines and take off first, then engage the route."},
  noAlt:{ar:"فعّل المسار فوق 1000 قدم.",en:"Engage the route above 1,000 ft."},
  noCfg:{ar:"ارفع العجلات والقلابات أولاً، ثم فعّل المسار.",en:"Retract the gear and flaps first, then engage the route."},
  on:{ar:"المسار مفعّل نحو {icao}: الطيار الآلي يطير مباشرة نحو الوجهة.",en:"Route engaged to {icao}: the autopilot flies direct to the destination."},
  off:{ar:"أُوقف المسار. الطيار الآلي يحتفظ بالاتجاه الحالي.",en:"Route stopped. The autopilot keeps the present heading."},
  tod:{ar:"بدأ الهبوط نحو {icao}، على بعد {km} كم.",en:"Descent started toward {icao}, {km} km out."},
  swap:{ar:"اقتراب {icao}: الطيار الآلي يطير نحو نقطة الدخول على مسار الهبوط.",en:"Approach to {icao}: the autopilot flies to the entry point of the glide path."},
  landed:{ar:"هبطت في {icao}. الآن إلى البوابة.",en:"Landed at {icao}. Now to the gate."},
  parked:{ar:"وصلت إلى البوابة {n}. أوقف المحركات وأنهِ الرحلة.",en:"Parked at stand {n}. Shut the engines down and end the flight."},
  ts:{ar:"سرعة الزمن ×{n}.",en:"Time speed ×{n}."},
  route:{ar:"مسار الرحلة",en:"Route"},fuel:{ar:"أضف وقوداً",en:"Add fuel"}
};
const faTx=o=>typeof fkTx==="function"?fkTx(o):o.ar;
const faF=(o,m)=>{ let t=faTx(o); for(const k in m) t=t.split("{"+k+"}").join(String(m[k])); return t; };
const faSay=(o,key,ms)=>{ try{ if(typeof bobSay==="function") bobSay(faTx(o),{priority:"high",key:"fa_"+key,keyMs:ms||9000}); }catch(e){} };
const faHm=m=>{ m=Math.max(0,Math.round(m)); return Math.floor(m/60)+":"+String(m%60).padStart(2,"0"); };
const faHdgTo=(dx,dz)=>((Math.atan2(dx,-dz)/FPH_D)+360)%360;
/* great-circle distance (km) and initial bearing (deg) between two airports of the table */
function faGeo(a,b){ const r=Math.PI/180, p1=a.lat*r, p2=b.lat*r, dl=(b.lon-a.lon)*r, h=Math.sin((p2-p1)/2)*Math.sin((p2-p1)/2)+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)*Math.sin(dl/2);
  const y=Math.sin(dl)*Math.cos(p2), x=Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl);
  return {km:2*6371*Math.asin(Math.min(1,Math.sqrt(h))), brg:(Math.atan2(y,x)/r+360)%360}; }
/* the destination of the setup: a chosen airport other than the departure; «auto» or a clash with the departure = the default pair */
function faDestId(){ const o=FLY.opts, dep=o.apt||"ORBI"; if(o.dest==="none") return null; let d=o.dest; if(!d||d==="auto"||d===dep||!FK_AIRPORTS.some(a=>a.id===d)) d=FA_DEST[dep]||"OMDB"; return d; }
/* the trip of the setup: {dep,dst,km,brg} or null (no destination, or a scenario without a trip) */
function faTripFor(){ const o=FLY.opts, d=faDestId(); if(!d||FA_SCN.indexOf(o.scn)<0) return null; const A=fkAptById(o.apt||"ORBI"), B=fkAptById(d); if(A.id===B.id) return null; const g=faGeo(A,B); return {dep:A,dst:B,km:g.km,brg:g.brg}; }
/* fuel for the trip (kg): cruise burn over the flight time (climb and descent allowance) plus a 45-minute reserve */
function faFuelNeed(key,km){ const F=fphFuelCfg(key); return F.flow*(km/FA_CRUISE_KMH+0.12+0.75); }
/* the destination point in the departure frame: x east, z south, the great-circle distance along the bearing */
function faDestPt(){ const T=FA, D=T.trip.km*1000, r=T.trip.brg*FPH_D; return [D*Math.sin(r),-D*Math.cos(r)]; }
