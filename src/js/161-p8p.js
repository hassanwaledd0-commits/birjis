/* ---------- flight physics (educational, simplified) ----------
   Pure functions on a state object; only THREE.Vector3/Quaternion are used, so the file also runs under node (tests/fly_phys.js).
   World: x east, y up, z south (north = -z). Runway 36 runs north along -z from the threshold at the origin.
   Body: x right wing, y up, nose along -z; the quaternion q takes body vectors to world vectors. s.p is the centre of gravity.
   Model: point mass with lift, drag, thrust and weight; a fly-by-wire style attitude law (pitch stick = load-factor demand around the
   flight-path-holding 1 g, roll stick = roll-rate demand, alpha protection, optional wings-level assist); a simple stall; ground handling with
   wheel springs, braking, reverse thrust and nose steering; an autopilot with altitude/vertical-speed/heading hold, ILS capture and an exponential flare.
   The numbers are typical values chosen so speeds, distances and climb rates look like the real aircraft. This is not a training device. */
const FPH_G=9.80665, FPH_KT=0.514444, FPH_FT=0.3048, FPH_D=Math.PI/180;
const FPH_AC={
  a380:{ name:"A380-800", S:845, b:79.8, mass:350000, n:4, Tmax:275000, ey:[-25.4,-15,15,25.4], fin:21000, CLa:4.6, CL0:[0.20,0.32,0.45,0.60,0.90], CLmax:[1.45,1.65,1.80,1.90,2.00],
         ceil:43000, CD0:0.0150, k:0.043, dCDf:[0,0.003,0.008,0.016,0.030], dCDg:0.016, dCDs:0.040, Mmo:0.89, Vmo:340, hm:6.9, hb:3.7, dm:6, dn:24, cgX:34.0, thTail:11,
         qmax:0.07, pmax:0.17, rmax:0.08, vfe:[340,230,215,196,180], flaps:["0","1","2","3","FULL"], sfc:1.65e-5, eye:[0,8.15,-31.0], takeoffFlaps:2, apprFlaps:4 },
  b737:{ name:"737-800", S:125, b:35.8, mass:62000, n:2, Tmax:100000, ey:[-5.7,5.7], fin:1365, CLa:4.9, CL0:[0.20,0.40,0.55,0.75,0.95], CLmax:[1.50,1.90,2.10,2.40,2.70],
         ceil:41000, CD0:0.0215, k:0.0365, dCDf:[0,0.004,0.012,0.024,0.045], dCDg:0.020, dCDs:0.050, Mmo:0.82, Vmo:340, hm:3.3, hb:1.9, dm:1.0, dn:12, cgX:17.0, thTail:11,
         qmax:0.09, pmax:0.26, rmax:0.10, vfe:[340,250,225,200,162], flaps:["0","1","5","15","30"], sfc:1.62e-5, eye:[0,4.45,-16.4], takeoffFlaps:2, apprFlaps:4 }
};
/* 747-400 (approximate; typical values chosen so speeds, distances and climb look like the real aircraft; eye = upper-deck flight deck) */
FPH_AC.b747={ name:"747-400", S:525, b:64.4, mass:310000, n:4, Tmax:245000, ey:[-21.1,-11.8,11.8,21.1], fin:11500, CLa:4.75, CL0:[0.20,0.34,0.48,0.62,0.92], CLmax:[1.45,1.65,1.85,2.0,2.1],
         CD0:0.0175, k:0.043, dCDf:[0,0.003,0.009,0.019,0.034], dCDg:0.017, dCDs:0.045, Mmo:0.92, Vmo:365, hm:5.0, hb:2.5, dm:3.8, dn:22.0, cgX:34.4, thTail:11.5,
         qmax:0.08, pmax:0.20, rmax:0.09, vfe:[365,280,250,230,180], flaps:["0","1","10","20","30"], sfc:1.6e-5, eye:[0,8.95,-28.3], takeoffFlaps:2, apprFlaps:4, ceil:45000 };
const fphClamp=(v,a,b)=>Math.max(a,Math.min(b,v));
/* fuel (kg) per type: tank capacity, Standard load (about 5 h), cruise burn (kg/h), planning limit for the takeoff mass (a heavier fuel plan reduces the payload; chosen so that the takeoff fits the 3.6 km runway) and the centre tank's share of the capacity.
   Tanks: s.tank=[left, centre, right]; the centre tank feeds first. s.ff[i] is the fuel flow of engine i in kg/s (thrust x sfc). */
const FPH_FUEL={a380:{max:254000,std:52000,flow:10300,mtow:540000,cen:0},b737:{max:16300,std:9800,flow:1950,mtow:79000,cen:0.3},b747:{max:190000,std:47500,flow:9450,mtow:430000,cen:0.12}};
const fphFuelCfg=key=>FPH_FUEL[key]||FPH_FUEL.b737;
/* set the total fuel (kg): wing tanks first (equal), the rest in the centre tank; returns the kg actually loaded */
function fphFuelSet(s,kg){ const F=fphFuelCfg(s.key), wc=F.max*(1-F.cen)/2, cc=F.max*F.cen; kg=fphClamp(kg,0,F.max); const w=Math.min(kg/2,wc); s.tank[0]=s.tank[2]=w; s.tank[1]=Math.min(cc,kg-2*w); return s.fuel=s.tank[0]+s.tank[1]+s.tank[2]; }
/* uplift: add fuel and mass (refuelling) */
/* cargo flights (v21): the player chooses the payload (o.payload, kg) on top of the scenario's default load. The planning max takeoff mass (FPH_FUEL.mtow) caps it inside
   fphFuelInit, so no choice can overload the aircraft (the fixed 60/20/70 t of v18 were added AFTER that cap: 737 at 116 % of the planning mass, 747 did not lift off).
   FPH_M0 = the start mass of each scenario (the same numbers fphScenario uses); fphPayloadCap = the most payload the fuel plan leaves room for. */
const FPH_M0={a380:{gate:480000,takeoff:480000,engineout:420000,approach:330000,cruise:340000},b737:{gate:72000,takeoff:72000,engineout:68000,approach:58000,cruise:60000},b747:{gate:380000,takeoff:380000,engineout:340000,approach:280000,cruise:330000}};
function fphPayloadCap(key,name,fuel){ const F=fphFuelCfg(key), pl=fphFuelPlan(key,name,fuel), m0=((FPH_M0[key]||FPH_M0.b737)[name])||0; return Math.max(0,Math.round(F.mtow-pl.kg-(m0-pl.def))); }
function fphFuelAdd(s,kg){ const a=s.fuel; fphFuelSet(s,a+kg); s.mass+=s.fuel-a; return s.fuel-a; }
/* the fuel plan: choice is "auto" (the scenario default) | "min" (about 75 min: 30 min + reserve) | "std" | "full" | a number = percent of the capacity */
function fphFuelPlan(key,scn,choice){ const F=fphFuelCfg(key), def={approach:F.flow*0.75,cruise:F.max*0.7}[scn]||F.std; const c=choice===undefined||choice===null?"auto":choice;
  const kg=c==="auto"?def:c==="min"?F.flow*1.25:c==="std"?F.std:c==="full"?F.max:(typeof c==="number"||/^[0-9.]+$/.test(String(c)))?F.max*fphClamp(+c,2,100)/100:def; return {kg:fphClamp(kg,Math.min(def,F.flow*0.3),F.max),def}; }
/* draw the fuel of engine i from the tanks (centre first, then its own wing, then the other wing); returns false when every tank is empty */
function fphTake(tk,k,r){ const t=r<tk[k]?r:tk[k]; tk[k]-=t; return r-t; }
function fphBurn(s,dt){
  const n=s.A.n, tk=s.tank; let used=0;
  for(let i=0;i<n;i++){ const need=s.ff[i]*dt; if(!(need>0)) continue; const own=i<n/2?0:2, opp=2-own; let r=need;
    if(tk[1]>0) r=fphTake(tk,1,r); if(r>1e-9) r=fphTake(tk,own,r); if(r>1e-9) r=fphTake(tk,opp,r);
    used+=need-r; if(r>1e-9&&s.eng[i]){ s.eng[i]=false; s.flame[i]=s.t||1e-3; s.ev.flameout=true; } }
  s.fuel=tk[0]+tk[1]+tk[2]; s.mass-=used; s.fuelUsed+=used;
}
/* service ceiling (ft) per type: A.ceil, else this table (a 747-400 entry needs no field). Thrust tapers off over the last ~4000 ft so the climb rate falls to zero at about the ceiling;
   a hard clamp 500 ft above it stops zoom climbs; the autopilot altitude target is limited to 0..ceiling and the vertical-speed target to +-6000 fpm. */
const FPH_CEIL={a380:43000,b737:41000,b747:45000}, FPH_VSMAX=6000;
const fphCeilFt=s=>s.A.ceil||FPH_CEIL[s.key]||43000;
const fphTaper=(hft,cl)=>{ const C=FPH_CT, ss=t=>{ t=fphClamp(t,0,1); return t*t*(3-2*t); }; return 1-C[2]*ss((hft-(cl-C[0]))/C[1])-C[5]*ss((hft-(cl+C[3]))/C[4]); };
const FPH_CT=[3000,3300,0.15,-300,1500,0.8];       /* taper: thrust -15 % by the ceiling, then falling to 20 % over the next 1500 ft */
/* limit an altitude target (ft) to 0..ceiling in steps of 100 ft: returns {v, clamped} */
const fphApAlt=(s,ft)=>{ const cl=Math.floor(fphCeilFt(s)/100)*100, v=Math.round(fphClamp(ft,0,cl)/100)*100; return {v:Math.min(v,cl),clamped:ft>cl+1e-6||ft<-1e-6}; };
const fphLerpArr=(A,x)=>{ const i=fphClamp(Math.floor(x),0,A.length-2), f=fphClamp(x-i,0,1); return A[i]+(A[i+1]-A[i])*f; };
const fphAng=a=>(((a+180)%360)+360)%360-180;                       /* wrap degrees to -180..180 */
/* ISA atmosphere: density, speed of sound, density ratio */
function fphAtm(h){ h=Math.max(-300,h); let T,rho; if(h<=11000){ T=288.15-0.0065*h; rho=1.225*Math.pow(T/288.15,4.2559); } else { T=216.65; rho=0.3639*Math.exp(-(h-11000)/6341.6); }
  return {T,rho,a:Math.sqrt(1.4*287.05*T),dens:rho/1.225}; }
/* euler angles of the body: heading (deg, clockwise from north), pitch (nose up +), bank (right wing down +) */
function fphEuler(q){ const f=new THREE.Vector3(0,0,-1).applyQuaternion(q), u=new THREE.Vector3(0,1,0).applyQuaternion(q), r=new THREE.Vector3(1,0,0).applyQuaternion(q);
  return {hdg:(Math.atan2(f.x,-f.z)/FPH_D+360)%360, pitch:Math.asin(fphClamp(f.y,-1,1))/FPH_D, bank:Math.atan2(-r.y,u.y)/FPH_D}; }
function fphQuat(hdg,pitch,bank){ const Y=new THREE.Vector3(0,1,0), X=new THREE.Vector3(1,0,0), Z=new THREE.Vector3(0,0,1);
  return new THREE.Quaternion().setFromAxisAngle(Y,-hdg*FPH_D).multiply(new THREE.Quaternion().setFromAxisAngle(X,pitch*FPH_D)).multiply(new THREE.Quaternion().setFromAxisAngle(Z,-bank*FPH_D)); }

function fphNew(key,o){
  o=o||{}; const A=FPH_AC[key], s={key,A,p:new THREE.Vector3(0,A.hm-0.12,0),v:new THREE.Vector3(),q:new THREE.Quaternion(),mass:o.mass||A.mass,
    n1:new Array(A.n).fill(0),eng:new Array(A.n).fill(true),ff:new Array(A.n).fill(0),flame:new Array(A.n).fill(0),tank:[0,0,0],fuel:0,fuelUsed:0,zfm:0,fuelTarget:0,lever:0,flaps:0,flapsT:0,gear:1,gearT:1,spoil:0,spoilT:0,brake:0,autobrake:0,
    wind:new THREE.Vector3(),gust:new THREE.Vector3(),turb:0,ground:true,mains:true,t:0,
    inp:{p:0,r:0,y:0},cmd:{hasPit:false,hasRoll:false,apNz:0,apRoll:0},
    ap:{on:false,athr:false,alt:3000,hdg:0,spd:200,vs:0,lat:"HDG",vert:"ALT",appr:false,flare:true},
    protect:true,assist:true,flareAssist:true,parkBrake:false,
    ev:{touch:null,crash:null,tail:false,stall:false,overspeed:false,gearWarn:false,flapWarn:false,thrust:0},
    last:{alpha:0,gamma:0,nz:1,agl:0,beta:0},prevIas:0};
  { const F=fphFuelCfg(key); fphFuelSet(s,o.fuel!==undefined?o.fuel:Math.min(F.std,0.25*s.mass)); s.fuelTarget=s.fuel; s.zfm=s.mass-s.fuel; }   /* zero-fuel mass = total - fuel */
  s.q.copy(fphQuat(o.hdg||0,o.pitch||0,o.bank||0));
  if(o.pos) s.p.set(o.pos[0],o.pos[1],o.pos[2]);
  s.p.y=Math.min(s.p.y,(fphCeilFt(s)-1000)*FPH_FT);                                           /* every start altitude is below the ceiling */
  s.flaps=s.flapsT=o.flaps||0; s.gear=s.gearT=o.gear===undefined?1:o.gear;
  if(o.ias){ const at=fphAtm(s.p.y), f=new THREE.Vector3(0,0,-1).applyQuaternion(s.q); s.v.copy(f).multiplyScalar(o.ias*FPH_KT/Math.sqrt(at.dens)); s.ground=false; s.mains=false; }
  if(o.n1!==undefined){ s.n1.fill(o.n1); s.lever=o.n1; }
  if(o.wind) s.wind.set(o.wind[0],0,o.wind[1]); s.turb=o.turb||0;
  s.last.gamma=Math.atan2(s.v.y,Math.max(1,Math.hypot(s.v.x,s.v.z))); s.last.agl=Math.max(0,s.p.y-A.hm); return s;
}
/* speeds that depend on weight and flap setting, in knots IAS: 1g stall, rotation, V2 and approach reference */
function fphSpeeds(s,flaps){
  const A=s.A, f=flaps===undefined?s.flaps:flaps, CLm=fphLerpArr(A.CLmax,f), vs=Math.sqrt(2*s.mass*FPH_G/(1.225*A.S*CLm))/FPH_KT;
  return {vs1g:vs,vr:vs*1.2,v2:vs*1.25,vref:vs*1.23};
}
function fphInfo(s){
  const at=fphAtm(s.p.y), e=fphEuler(s.q), V=s.v.clone().sub(s.wind).length(), ias=V*Math.sqrt(at.dens)/FPH_KT;
  return {ias,tas:V/FPH_KT,gs:Math.hypot(s.v.x,s.v.z)/FPH_KT,mach:V/at.a,alt:s.p.y/FPH_FT,vs:s.v.y/FPH_FT*60,hdg:e.hdg,pitch:e.pitch,bank:e.bank,aoa:s.last.alpha/FPH_D,
    gamma:s.last.gamma/FPH_D,nz:s.last.nz,agl:s.last.agl/FPH_FT,aglm:s.last.agl,track:(Math.atan2(s.v.x,-s.v.z)/FPH_D+360)%360,n1:s.n1.slice(),weight:s.mass};
}
/* instrument landing system for runway 36: localizer on the extended centre line, glide path 3 degrees to a point 300 m past the threshold.
   Deviations in degrees: loc > 0 means the aircraft is right of the centre line, gs > 0 means it is above the glide path. */
const FPH_RWY={len:3600,width:60,tdz:-300,locZ:-3700,gs:3.0};
function fphIls(s){
  const loc=Math.atan2(s.p.x,Math.max(50,s.p.z-FPH_RWY.locZ))/FPH_D, dGs=s.p.z-FPH_RWY.tdz, gsA=Math.atan2(Math.max(0.1,s.p.y-s.A.hm+3),Math.max(50,dGs))/FPH_D;
  return {loc,gs:gsA-FPH_RWY.gs,dist:s.p.z,valid:s.p.z>-200&&dGs>40};
}
const fphSetLever=(s,v)=>{ s.lever=fphClamp(v,s.ground?-1:0,1); };
const fphSetFlaps=(s,i)=>{ s.flapsT=fphClamp(Math.round(i),0,s.A.flaps.length-1); };
const fphSetGear=(s,down)=>{ s.gearT=down?1:0; };

/* ---- autopilot: writes s.cmd (load-factor offset and roll rate) and the thrust lever when auto-thrust is on ---- */
function fphAutopilot(s,dt){
  const ap=s.ap, A=s.A, info=fphInfo(s), V=Math.max(30,info.tas*FPH_KT); let nz=0, roll=0;
  ap.alt=fphApAlt(s,ap.alt).v; ap.vs=fphClamp(ap.vs,-FPH_VSMAX,FPH_VSMAX);
  const ils=fphIls(s);
  if(ap.appr&&ils.valid&&!s.ground){ if(ap.lat!=="LOC"&&Math.abs(ils.loc)<2.2) ap.lat="LOC"; if(ap.lat==="LOC"&&ap.vert!=="GS"&&Math.abs(ils.gs)<0.5) ap.vert="GS"; }
  s.cmd.hasPit=s.cmd.hasRoll=false;
  if(!ap.on||s.ground) return;
  /* lateral: heading hold, or localizer capture on the track */
  let dh;
  if(ap.lat==="LOC"){ let cor=fphClamp(-ils.loc*9,-28,28); if(Math.abs(s.p.x)>2500) cor=Math.sign(-s.p.x)*28; dh=fphAng(cor-fphAng(info.track)); }
  else dh=fphAng(ap.hdg-info.hdg);
  const bl=ap.lat==="LOC"?20:25, bankT=fphClamp(dh*1.1,-bl,bl);
  roll=fphClamp((bankT-info.bank)*0.045,-A.pmax*0.6,A.pmax*0.6);
  /* vertical: target flight-path angle */
  let gT;
  if(ap.vert==="GS"){ gT=-FPH_RWY.gs*FPH_D-fphClamp(ils.gs*2.2,-2.0,2.0)*FPH_D;
    if(ap.flare&&info.aglm<15) gT=Math.asin(-fphClamp(info.aglm/3.5,0.9,4.2)/V); }
  else if(ap.vert==="VS") gT=Math.asin(fphClamp(ap.vs*FPH_FT/60/V,-0.3,0.3));
  else { const e=ap.alt*FPH_FT-s.p.y; let vs=fphClamp(e*0.12,-2400*FPH_FT/60,2400*FPH_FT/60); if(Math.abs(e)<35) vs*=Math.abs(e)/35; gT=Math.asin(fphClamp(vs/V,-0.3,0.3)); }
  nz=fphClamp((gT-s.last.gamma)*0.55*V/FPH_G,-0.7,1.0);
  if(ap.athr){ let tgt=ap.spd; if(ap.vert==="GS") tgt=Math.min(tgt,fphSpeeds(s).vref+5);
    const acc=dt>0?(info.ias-s.prevIas)/dt:0; s.lever=fphClamp(s.lever+(0.016*(tgt-info.ias)-0.05*acc)*dt,0,1);
    if(ap.vert==="GS"&&info.aglm<9) s.lever=Math.max(0,s.lever-0.6*dt); }
  s.prevIas=info.ias; s.cmd.hasPit=s.cmd.hasRoll=true; s.cmd.apNz=nz; s.cmd.apRoll=roll;
}

/* landing assist: with the gear down and flaps out, below 15 m the sink rate is brought down exponentially (the flare) and the thrust is retarded.
   Returns the load-factor offset to add to the stick, or null when it does not apply. */
function fphFlare(s,dt){
  const A=s.A; if(!s.flareAssist||s.ground||s.gear<0.85||s.flaps<2||s.last.agl>15||s.last.gamma>-0.002) return null;
  const V=Math.max(30,s.v.length()), want=-fphClamp(s.last.agl/3.5,0.9,4.2), gT=Math.asin(want/V);
  if(s.last.agl<9&&s.lever>0&&!s.ap.athr) s.lever=Math.max(0,s.lever-0.6*dt);
  return fphClamp((gT-s.last.gamma)*0.55*V/FPH_G,-0.5,1.0);
}

/* ---- one integration step ---- */
function fphStep(s,dt){
  const A=s.A, V3=THREE.Vector3; s.t+=dt;
  const at=fphAtm(s.p.y);
  /* wind and turbulence: gusts are a smoothed random walk */
  if(s.turb>0){ const k=Math.exp(-dt/3), sd=s.turb*3.2*(1-k)*3; s.gust.set(s.gust.x*k+(Math.random()-0.5)*sd,s.gust.y*k+(Math.random()-0.5)*sd*0.7,s.gust.z*k+(Math.random()-0.5)*sd); } else s.gust.set(0,0,0);
  const wind=s.wind.clone().add(s.gust);
  /* surfaces move at limited rates */
  const mv=(a,t,r)=>a<t?Math.min(t,a+r*dt):Math.max(t,a-r*dt);
  s.flaps=mv(s.flaps,s.flapsT,0.18); s.gear=mv(s.gear,s.gearT,0.09); s.spoil=mv(s.spoil,s.spoilT,0.6);
  /* engines spool towards the lever; negative lever is reverse thrust and works only on the ground */
  const rev=s.lever<0&&s.ground;
  for(let i=0;i<A.n;i++){ const tgt=!s.eng[i]?0:(rev?Math.min(0.75,-s.lever*0.75):Math.max(0,s.lever)); s.n1[i]+=(tgt-s.n1[i])*Math.min(1,(tgt>s.n1[i]?0.45:(s.flame[i]?0.25:0.9))*dt*(tgt>s.n1[i]?1:1.5)); }
  /* air data */
  const iq=s.q.clone().invert(), vr=s.v.clone().sub(wind), V=Math.max(0.5,vr.length()), vb=vr.clone().applyQuaternion(iq);
  const u=Math.max(1,-vb.z), alpha=Math.atan2(-vb.y,u), beta=Math.atan2(vb.x,u), qd=0.5*at.rho*V*V, mach=V/at.a, ias=V*Math.sqrt(at.dens);
  const e=fphEuler(s.q), th=e.pitch*FPH_D, ph=e.bank*FPH_D, cs=Math.cos(th), sn=Math.sin(th);
  /* aerodynamics */
  const cb=fphClamp((s.p.y/FPH_FT-fphCeilFt(s))/1200,0,1);      /* above the ceiling the usable lift falls (buffet boundary) */
  const CL0=fphLerpArr(A.CL0,s.flaps), CLm=fphLerpArr(A.CLmax,s.flaps)*(1-0.08*s.spoil)*(1-0.4*cb), as=(CLm-CL0)/A.CLa;
  const hw=Math.max(0,s.p.y-A.hm), ge=Math.exp(-hw/(0.25*A.b));
  let CL=alpha<=as?CL0+A.CLa*Math.max(alpha,-0.35):CLm*(1-Math.min(0.55,(alpha-as)*5));
  CL+=0.10*ge*(1-0.5*s.spoil);
  const stalled=alpha>as; s.ev.stall=alpha>as-0.03;
  let CD=A.CD0+A.k*(1-0.45*ge)*Math.pow(CL-0.1,2)+fphLerpArr(A.dCDf,s.flaps)+A.dCDg*s.gear+A.dCDs*s.spoil+(stalled?0.9*(alpha-as):0);
  if(mach>0.84) CD+=2*Math.pow(mach-0.84,2); if(mach>A.Mmo) CD+=6*Math.pow(mach-A.Mmo,2);
  const vh=vr.clone().multiplyScalar(1/V), upb=new V3(0,1,0).applyQuaternion(s.q), lift=upb.clone().sub(vh.clone().multiplyScalar(upb.dot(vh)));
  if(lift.lengthSq()<1e-6) lift.set(0,1,0); lift.normalize();
  const Lm=qd*A.S*CL*(1-0.35*s.spoil), Dm=qd*A.S*(CD);
  const F=new V3(0,-s.mass*FPH_G,0).add(lift.multiplyScalar(Lm)).add(vh.clone().multiplyScalar(-Dm));
  /* thrust: falls with altitude and Mach; a failed engine windmills and drags */
  let Tsum=0, Tl=0, Tr=0; const fwd=new V3(0,0,-1).applyQuaternion(s.q), fall=Math.max(0.05,Math.pow(at.dens,0.7)*(1-0.62*mach))*fphTaper(s.p.y/FPH_FT,fphCeilFt(s));
  for(let i=0;i<A.n;i++){ let T=A.Tmax*(0.05+0.95*Math.max(0,s.n1[i]))*fall;
    if(rev&&s.n1[i]>0.05) T=-A.Tmax*0.55*(s.n1[i]/0.75)*Math.min(1,ias/25); if(!s.eng[i]){ T=-A.Tmax*0.012*Math.min(1,ias/60); if(s.flame[i]) T+=A.Tmax*0.95*Math.max(0,s.n1[i])*fall; }
    s.ff[i]=s.eng[i]?Math.max(0,T)*A.sfc:0; Tsum+=T; if(i<A.n/2) Tl+=T; else Tr+=T; }
  F.add(fwd.clone().multiplyScalar(Tsum)); s.ev.thrust=Tsum;
  /* wheels: springs under the main gear, rolling friction and brakes along the heading, tyres kill sideways motion */
  const gearDown=s.gear>0.85, wm=s.p.y-(A.hm*cs+A.dm*sn), wasGround=s.ground; let N=0, onMain=false;
  const ks=s.mass*FPH_G/0.12, cdp=2*0.35*Math.sqrt(ks*s.mass);
  if(gearDown&&wm<=0.02){
    onMain=true;
    if(!wasGround){ const t=s.ev.touch={sink:-s.v.y/FPH_FT*60,pitch:e.pitch,bank:e.bank,ias:ias/FPH_KT,x:s.p.x,z:s.p.z,t:s.t,hdg:e.hdg}; t.onRwy=Math.abs(t.x)<FPH_RWY.width/2&&t.z<0&&t.z>-FPH_RWY.len; if(t.sink>1150&&!s.ev.crash) s.ev.crash="hard"; }
    N=Math.max(0,ks*(-wm)-cdp*(s.v.y<0?s.v.y:s.v.y*0.4)); s.ground=true;
  } else if(!gearDown&&s.p.y-(A.hb*cs)<=0){
    if(!s.ev.crash&&(ias/FPH_KT>60||s.v.y<-1.5)) s.ev.crash="belly"; N=Math.max(0,s.mass*FPH_G/0.25*(-(s.p.y-A.hb*cs))-s.mass*6*s.v.y); s.ground=true;
  } else s.ground=false;
  s.mains=onMain; F.y+=N;
  const wow=s.ground?fphClamp(N/(s.mass*FPH_G),0,1.2):0;
  s.v.addScaledVector(F.multiplyScalar(1/s.mass),dt);
  if(s.ground){
    const fh=new V3(fwd.x,0,fwd.z); if(fh.lengthSq()>1e-4) fh.normalize(); const right=new V3(Math.cos(e.hdg*FPH_D),0,Math.sin(e.hdg*FPH_D));
    s.v.addScaledVector(right,-s.v.dot(right)*Math.min(1,dt*6));
    const vf=s.v.dot(fh), br=Math.max(s.brake,s.autobrake), dec=(0.018+(s.taxi?0.0035*Math.abs(vf):0)+br*0.40)*FPH_G*Math.min(1,wow);
    if(Math.abs(vf)>0.05){ s.v.addScaledVector(fh,-Math.sign(vf)*Math.min(Math.abs(vf),dec*dt)); }
    else if(br>0.05&&s.lever<0.05){ s.v.x=0; s.v.z=0; }
  }
  s.p.addScaledVector(s.v,dt);
  /* ---- attitude ---- */
  const inp=s.inp, cmd=s.cmd, apOn=s.ap.on&&cmd.hasPit, vr_=Math.max(20,fphSpeeds(s).vr*FPH_KT), gam=Math.atan2(s.v.y,Math.max(1,Math.hypot(s.v.x,s.v.z)));
  s.last.gamma=gam;
  let wx=0, wy=0, wz=0;
  if(!s.ground){
    /* pitch: stick (or autopilot) adds to the load factor that holds the present flight path; alpha is limited below the stall (protection) */
    const nzBase=Math.cos(gam)/Math.max(0.35,Math.cos(Math.min(Math.abs(ph),1.2))), fl=(!apOn||s.ap.vert!=="GS")?fphFlare(s,dt):null;
    let pit=apOn?cmd.apNz:(inp.p*(inp.p>0?1.0:0.8)+(fl===null?0:fl)); if(!apOn&&fl!==null&&inp.p>0.05) pit=Math.max(pit,inp.p);
    let nzCmd=fphClamp(nzBase+pit,-0.6,2.4);
    if(s.protect){ if(th>0.45) nzCmd=Math.min(nzCmd,nzBase-(th-0.45)*3.5); if(th<-0.26) nzCmd=Math.max(nzCmd,nzBase+(-0.26-th)*3.5); }      /* pitch attitude protection: about +26 and -15 deg */
    let aReq=(nzCmd*s.mass*FPH_G/Math.max(1,qd*A.S)-CL0-0.10*ge*(1-0.5*s.spoil))/A.CLa; aReq=fphClamp(aReq,-0.12,s.protect?as-0.035:as+0.12);
    wx=fphClamp(1.5*(aReq-alpha),-A.qmax*1.3,A.qmax*1.3);
    if(stalled&&!s.protect) wx-=0.5*(alpha-as);
    /* roll: rate demand; with no input the wings return to level below 33 degrees (assist) */
    const pmax=A.pmax*(0.45+0.55*fphClamp(ias/60,0,1)); let pr;
    if(s.ap.on&&cmd.hasRoll&&Math.abs(inp.r)<0.05) pr=cmd.apRoll; else if(Math.abs(inp.r)>0.03) pr=inp.r*pmax; else if(s.assist) pr=Math.abs(e.bank)<33?fphClamp(-ph*0.5,-0.12,0.12):-Math.sign(ph)*0.06; else pr=0;
    if(Math.abs(e.bank)>66&&pr*Math.sign(ph)>0) pr=0; if(s.protect&&Math.abs(e.bank)>45&&pr*Math.sign(ph)>0) pr*=0.3;
    wz=-pr;
    /* yaw: weathervane to zero sideslip, rudder, asymmetric thrust */
    const nb=Math.max(1,qd*A.fin); let Mas=0; for(let i=0;i<A.n;i++){ let T=A.Tmax*(0.05+0.95*Math.max(0,s.n1[i]))*fall; if(!s.eng[i]){ T=-A.Tmax*0.012*Math.min(1,ias/60); if(s.flame[i]) T+=A.Tmax*0.95*Math.max(0,s.n1[i])*fall; } Mas+=T*A.ey[i]; }
    wy=1.6*(fphClamp(Mas/nb-inp.y*0.25,-0.6,0.6)-fphClamp(beta,-0.7,0.7));
    if(stalled&&!s.protect) wz+=0.12*Math.sin(s.t*1.9);
    if(s.turb>0){ wx+=(Math.random()-0.5)*0.03*s.turb; wz+=(Math.random()-0.5)*0.04*s.turb; }
  } else {
    /* on the ground: wings level, nose follows the stick once the elevator has air to work with, nose-wheel steering plus rudder */
    const thT=Math.max(0,inp.p)*0.2*fphClamp(Math.pow(ias/(vr_*0.9),2),0,1);
    if(s.mains){ wx=fphClamp(0.9*(thT-th),-0.06,0.06)+(inp.p<-0.2?-0.03:0); if(th>A.thTail*FPH_D){ wx=Math.min(wx,0); s.ev.tail=true; } if(th<0) wx=Math.max(wx,0.03); }
    wz=fphClamp(3*ph,-0.2,0.2);
    const sv=Math.hypot(s.v.x,s.v.z); wy=-(inp.y*(0.4*Math.min(1,sv/12)*fphClamp(1-(sv-25)/25,0,1)+A.rmax*fphClamp(Math.pow(ias/70,2),0,1.2))+((Tl-Tr)/(A.Tmax*A.n))*0.25*(sv>5?1:0));
  }
  const ax=new V3(wx,wy,wz), w=ax.length(); if(w>1e-7){ ax.multiplyScalar(1/w); s.q.multiply(new THREE.Quaternion().setFromAxisAngle(ax,w*dt)).normalize(); }
  if(s.protect&&!s.ground&&alpha>as-0.07){ s.ev.floor=true; s.lever=Math.max(s.lever,0.98); } else if(s.ev.floor&&alpha<as-0.12){ s.ev.floor=false; }
  s.last.alpha=alpha; s.last.nz=Lm/(s.mass*FPH_G); s.last.agl=Math.max(0,s.p.y-A.hm); s.last.beta=beta;
  s.ev.overspeed=ias/FPH_KT>A.Vmo||mach>A.Mmo; s.ev.gearWarn=!gearDown&&s.last.agl<150*FPH_FT&&s.v.y<0&&!s.ground; s.ev.flapWarn=ias/FPH_KT>fphLerpArr(A.vfe,s.flaps)+5; if(s.ev.tail&&!s.ground&&s.last.agl>15) s.ev.tail=false;   /* the tail-strike flag was never cleared: the red warning and Maysaloon's «lower the nose» repeated for the whole flight */
  fphBurn(s,dt);   /* fuel flow = thrust x sfc, drawn from the tanks; empty tanks flame the engines out */
  const cm=fphCeilFt(s)*FPH_FT, hc=cm+500*FPH_FT; s.ev.ceiling=s.p.y>=cm+250*FPH_FT;     /* zoom climbs are damped above ceiling + 250 ft; hard safety clamp at ceiling + 500 ft */
  if(s.ev.ceiling&&s.v.y>0) s.v.y-=s.v.y*Math.min(1,dt*2.5*Math.min(1,(s.p.y-cm-250*FPH_FT)/(250*FPH_FT)));
  if(s.p.y>hc){ s.p.y=hc; if(s.v.y>0) s.v.y=0; }
}
/* advance by dt seconds in sub-steps of at most 1/90 s */
function fphUpdate(s,dt){ const n=Math.max(1,Math.ceil(dt*90)), h=dt/n; for(let i=0;i<n;i++){ fphAutopilot(s,h); fphStep(s,h); } }

/* ---- scenarios ---- */
const FPH_SCN={
  gate:{ar:"من البوابة",en:"From the gate",d:"تبدأ عند البوابة بعد صعود الركاب: اطلب الدفع للخلف، شغّل المحركات، سِر على الممرات إلى المدرج، حاذِ المدرج ثم أقلع."},
  takeoff:{ar:"إقلاع من المدرج (جاهز على المدرج)",en:"Takeoff from the runway",d:"أنت على بداية المدرج 36. ثبّت الفرامل، ادفع الدفع إلى الأقصى، أطلق الفرامل، وعند سرعة الرفع اسحب العصا ببطء، ثم ارفع العجلات."},
  approach:{ar:"اقتراب وهبوط ILS",d:"على بعد 10 كم من المدرج على مسار الهبوط. أنزل القلابات والعجلات بالتدريج، فعّل وضع الاقتراب (APPR) للتقاط الموجّه ومسار الهبوط، ثم افصل الطيار الآلي وهبّط يدوياً."},
  cruise:{ar:"رحلة على ارتفاع الطيران",d:"طيران حر على ارتفاع الرحلات. جرّب الطيار الآلي والارتفاعات والاتجاهات، ثم انزل إلى المدرج من قائمة السيناريوهات."},
  engineout:{ar:"فشل محرك أثناء الإقلاع",d:"سيتعطل أحد المحركات بعد سرعة القرار. حافظ على الاتجاه بالدفّة، واستمر بالإقلاع، وارفع العجلات، ولا تتجاوز سرعة الأمان V2."}
};
function fphScenario(key,name,o){
  o=o||{}; const A=FPH_AC[key]; let s;
  if(name==="gate"&&o.L&&typeof fkGatePose==="function"){
    const gp=fkGatePose(key,o.L); s=fphNew(key,{pos:gp.pos,hdg:gp.hdg,flaps:0,mass:key==="a380"?480000:key==="b747"?380000:72000}); s.parkBrake=true; s.eng.fill(false); s.taxi=true;
  } else if(name==="approach"){
    const d=13500, y=2000*FPH_FT, ias=key==="a380"?172:key==="b747"?168:178;
    s=fphNew(key,{pos:[o.offset===undefined?-420:o.offset,y,d],hdg:0,ias,flaps:1,gear:0,n1:0.35,mass:key==="a380"?330000:key==="b747"?280000:58000});
    s.ap.on=true; s.ap.athr=true; s.ap.spd=ias; s.ap.hdg=0; s.ap.alt=2000; s.ap.vert="ALT"; s.ap.lat="HDG";
  } else if(name==="cruise"){
    const alt=35000, ias=key==="a380"?270:key==="b747"?275:250; s=fphNew(key,{pos:[0,alt*FPH_FT,6000],hdg:90,ias,gear:0,n1:0.7,mass:key==="a380"?340000:key==="b747"?330000:60000});
    s.ap.on=true; s.ap.athr=true; s.ap.spd=ias; s.ap.alt=alt; s.ap.hdg=90; s.ap.vert="ALT"; s.ap.lat="HDG";
  } else {
    s=fphNew(key,{pos:[0,A.hm-0.12,40],hdg:0,flaps:A.takeoffFlaps,mass:key==="a380"?(name==="engineout"?420000:480000):key==="b747"?(name==="engineout"?340000:380000):(name==="engineout"?68000:72000)}); s.parkBrake=true;
    if(name==="engineout") s.failAt={eng:A.n===4?0:1,ias:fphSpeeds(s).vr-8};
  }
  fphFuelInit(s,name,o); s.scn=name; return s;
}
/* fuel of a scenario: the existing start mass M0 belongs to the default load; another load changes the mass (payload is cut so that the total never exceeds the max takeoff mass).
   The gate scenario starts with little fuel (the aircraft arrived) and the refuelling step brings it to the plan (s.fuelTarget). */
function fphFuelInit(s,name,o){
  const F=fphFuelCfg(s.key), pl=fphFuelPlan(s.key,name,o&&o.fuel); let zfm=s.mass-pl.def+(o&&o.payload>0?o.payload:0); if(zfm+pl.kg>F.mtow) zfm=F.mtow-pl.kg;
  const start=name==="gate"?Math.min(pl.kg,0.1*F.max):pl.kg; s.zfm=zfm; fphFuelSet(s,start); s.fuelTarget=pl.kg; s.mass=zfm+s.fuel;
}
