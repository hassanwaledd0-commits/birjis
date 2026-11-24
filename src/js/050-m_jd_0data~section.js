/* ---------- (vw) interior for X-ray and explode: fuselage frames, stringers, cabin floor and beams, passenger seats, galleys, lavatories, overhead bins and lower-hold cargo containers.
   Real meshes in layer "int", one merged mesh per part (8 draw calls per aircraft). Built lazily by vwIntEnsure(B), the first time the interior is needed
   (X-ray layer, explode, or an interior part selected); the page never builds it at start. Every position follows the fuselage section (ringAt / secK),
   so nothing pokes through the skin, and the 747 is read through the same functions as the other two aircraft. ---------- */
Object.assign(SPEC,{
  vseat:{c:"#3E5A74",r:.92,m:0}, vcabfl:{c:"#5B5E63",r:.85,m:0}, vbin:{c:"#D5DBE1",r:.5,m:.1}, vgal:{c:"#E6EAEE",r:.45,m:.15},
  vfrm:{c:"#9AA3AC",r:.4,m:.6}, vstrg:{c:"#7F8891",r:.4,m:.6}, vuld:{c:"#B7BFC7",r:.5,m:.4}
});
const VW_INT_IDS=["int_frames","int_stringers","int_floor","int_seats","int_galleys","int_lavs","int_bins","int_cargo"];
const VW_INT_MK={int_frames:"vfrm",int_stringers:"vstrg",int_floor:"vcabfl",int_seats:"vseat",int_galleys:"vgal",int_lavs:"vgal",int_bins:"vbin",int_cargo:"vuld"};
/* cabin layouts: x = span of the cabin as a fraction of the aircraft length (so a new fuselage shape still fits), zf = floor height above the belly, pitch in metres,
   blocks = seats per block (aisles between blocks), sw = seat width, ai = aisle width, h = seat-back height. up = upper deck (dz above the main floor). */
const VW_CAB={
  a380:{main:{x:[0.2,0.8],zf:2.3,pitch:0.86,blocks:[3,4,3],sw:0.5,ai:0.56,h:1.05},
        prem:{x:[0.13,0.2],pitch:1.5,blocks:[2,2],sw:0.66,ai:0.7,h:1.15},
        up:{x:[0.22,0.72],dz:2.6,pitch:0.9,blocks:[2,4,2],sw:0.5,ai:0.56,h:1.0}},
  b737:{main:{x:[0.13,0.8],zf:1.5,pitch:0.81,blocks:[3,3],sw:0.46,ai:0.5,h:1.0}},
  b747:{main:{x:[0.13,0.8],zf:2.2,pitch:0.86,blocks:[3,4,3],sw:0.5,ai:0.56,h:1.05},
        up:{x:[0.14,0.5],dz:2.6,pitch:0.95,blocks:[2,2],sw:0.52,ai:0.6,h:1.0}}
};
/* the upper deck moves up on explode, the overhead bins drop a little, the cargo drops out of the hold */
Object.assign(EXP,{int_bins:[0,.02,0],int_cargo:[0,-.03,0]});
Object.assign(PULLD,{int_cargo:[0,-.5,0],int_bins:[0,.4,0]});

/* hull half-width at station X and height z (metres), using the same section as the skin */
function vwHalf(c,X,z){ const r=ringAt(c,X), s=Math.max(-0.98,Math.min(0.98,(z-r.zc)/Math.max(r.hh,0.01))); return r.hw*Math.sqrt(1-s*s)*secK(c,s,X); }
/* lateral seat centres for a layout such as [3,4,3] with aisles between the blocks */
function vwLat(blocks,sw,ai){ const n=blocks.reduce((a,b)=>a+b,0), W=n*sw+(blocks.length-1)*ai, out=[]; let x=-W/2+sw/2;
  blocks.forEach((b,bi)=>{ for(let i=0;i<b;i++){ out.push(x); x+=sw; } if(bi<blocks.length-1) x+=ai; }); return out; }
/* row stations (metres from the nose) inside a cabin span, skipping the door zones */
function vwRowsX(c,a){ const out=[], d=c.doors||[], L=c.L; for(let X=L*a.x[0]+a.pitch/2; X<=L*a.x[1]-a.pitch/2+1e-6; X+=a.pitch){ if(d.some(q=>Math.abs(X-q)<1.4)) continue; out.push(X); } return out; }

/* seats: cushion, back, two armrests per seat; a seat is only placed if it fits inside the hull at its height */
function vwSeatGeos(c,a,rows,zf,out){
  const lat=vwLat(a.blocks,a.sw,a.ai);
  rows.forEach(X=>{ const z=X-c.L/2, hw=vwHalf(c,X,zf+0.6);
    lat.forEach(x=>{ if(Math.abs(x)+a.sw/2>hw-0.15) return;
      out.push(new THREE.BoxGeometry(a.sw*0.86,0.1,0.44).translate(x,zf+0.42,z));
      out.push(new THREE.BoxGeometry(a.sw*0.86,a.h,0.09).translate(x,zf+0.5+a.h/2,z+0.22));
      out.push(new THREE.BoxGeometry(0.05,0.22,0.4).translate(x-a.sw/2+0.03,zf+0.6,z));
      out.push(new THREE.BoxGeometry(0.05,0.22,0.4).translate(x+a.sw/2-0.03,zf+0.6,z)); }); });
  return out; }
/* frames: thin bands following the section, one every metre, from the nose section to the tail cone */
function vwFramesGeo(c){ const n=48, pos=[], idx=[]; let base=0;
  for(let X=c.fd+0.4; X<=c.tail-0.4; X+=0.508){ const r=ringAt(c,X);   /* v22: one frame every 20 in, as on the real fuselage */
    [0.972,0.94].forEach(k=>{ for(let j=0;j<n;j++){ const th=j/n*Math.PI*2, s=Math.sin(th); pos.push(r.hw*Math.cos(th)*secK(c,s,X)*k, r.zc+r.hh*s*k, X-c.L/2); } });
    for(let j=0;j<n;j++){ const a=base+j, b=base+(j+1)%n, p=base+n+j, q=base+n+(j+1)%n; idx.push(a,p,b,b,p,q); }
    base+=2*n; }
  const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals(); return g; }
/* stringers: 14 longitudinal rods just inside the skin, cut every 3 m */
function vwStringersGeo(c){ const gs=[], N=36, st=3;
  for(let j=0;j<N;j++){ const th=(j+0.5)/N*Math.PI*2, s=Math.sin(th); let prev=null;
    for(let X=c.fd+1; X<=c.tail-1+1e-6; X+=st){ const r=ringAt(c,X), p=new THREE.Vector3(r.hw*Math.cos(th)*secK(c,s,X)*0.955, r.zc+r.hh*s*0.955, X-c.L/2);
      if(prev) gs.push(barBetween(prev,p,0.02,4)); prev=p; } }
  return mergeG(gs); }
/* cabin floor panel plus its beams, for one deck at height zf (metres above the origin) */
function vwFloorGs(c,a,zf,gs){ const x0=c.L*a.x[0], x1=c.L*a.x[1], Xm=(x0+x1)/2; let hw=1e9;
  for(let X=x0; X<=x1; X+=1) hw=Math.min(hw,vwHalf(c,X,zf+0.05));
  gs.push(new THREE.BoxGeometry(hw*2*0.96,0.12,x1-x0).translate(0,zf-0.06,Xm-c.L/2));
  for(let X=x0+1; X<x1; X+=2.4){ gs.push(new THREE.BoxGeometry(vwHalf(c,X,zf-0.2)*2*0.98,0.16,0.18).translate(0,zf-0.2,X-c.L/2));
    [-1,1].forEach(sg=>gs.push(new THREE.CylinderGeometry(0.045,0.045,0.42,8).translate(sg*vwHalf(c,X,zf-0.5)*0.78,zf-0.45,X-c.L/2))); }   /* v22: a crash-energy absorber under each end of the floor beam */
  return gs; }
/* lower-hold containers: pairs of boxes either side of the centre line, over the belly */
/* a narrow-body unit load device (AKE shape): the lower corner on one side is cut away; w = top width, h = height, d = depth */
function vwUldGeo(w,h,d){ const sh=new THREE.Shape(); sh.moveTo(-w/2+0.34*w,0); sh.lineTo(w/2,0); sh.lineTo(w/2,h); sh.lineTo(-w/2,h); sh.lineTo(-w/2,0.5*h); sh.closePath();
  const g=new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:false,steps:1}); g.translate(0,0,-d/2); return g; }
function vwCargoGs(c,zf,gs){
  if(c.L<45){   /* narrow-body: containers in single file in the forward and aft holds only, never over the wheel well and the wing box (they are too wide to sit side by side) */
    const wg=(c.mg&&c.mg[0]&&c.mg[0][1])||c.L*0.46, holds=[[c.L*0.17,wg-2.9],[wg+3.6,c.L*0.70]];
    holds.forEach(h=>{ for(let X=h[0]+0.8; X<=h[1]-0.8; X+=1.62){ const zb=ringAt(c,X).zb, hh=Math.min(1.5,zf-zb-0.4); if(hh<0.7) continue;
      const yb=zb+0.2, half=vwHalf(c,X,yb+hh*0.5)*0.9, w=Math.min(1.56,half*1.7); gs.push(vwUldGeo(w,hh,1.5).translate(0,yb,X-c.L/2)); } });
    return gs; }
  const x0=c.L*0.2, x1=c.L*0.62;
  for(let X=x0+1.5; X<=x1-1.5; X+=3.1){ const zb=ringAt(c,X).zb, hh=Math.min(1.6,zf-zb-0.45); if(hh<0.6) continue;
    const yb=zb+0.25, half=vwHalf(c,X,yb+hh*0.5)*0.9, w=half*0.95;
    [-1,1].forEach(sg=>gs.push(new THREE.BoxGeometry(2.9,hh,w).translate(sg*half*0.52,yb+hh/2,X-c.L/2))); }
  return gs; }
/* galleys at the doors (alternating sides), lavatories at the last door, overhead bins along both sides between the doors */
function vwServiceGs(c,a,zf,gal,lav,bin){ const L=c.L, x0=L*a.x[0], x1=L*a.x[1], d=(c.doors||[]).filter(X=>X>L*0.1&&X<L*0.9);
  d.forEach((X,i)=>{ const sg=i%2?1:-1, hw=vwHalf(c,X,zf+1.0); gal.push(new THREE.BoxGeometry(0.9,1.95,0.62).translate(sg*(hw-0.5),zf+0.975,X-L/2)); });
  if(d.length){ const X=d[d.length-1]; [-1,1].forEach(sg=>{ const hw=vwHalf(c,X,zf+1.0); lav.push(new THREE.BoxGeometry(0.9,2.0,1.0).translate(sg*(hw-0.55),zf+1.0,X-L/2)); }); }
  for(let X=x0+0.6; X<=x1-0.6; X+=1.2){ if(d.some(q=>Math.abs(X-q)<1.1)) continue;
    [-1,1].forEach(sg=>{ const hw=vwHalf(c,X,zf+2.2); bin.push(new THREE.BoxGeometry(1.1,0.55,0.5).translate(sg*(hw-0.32),zf+2.1,X-L/2)); }); }
}

/* builds the interior meshes of one aircraft (B from buildAircraft) once; a no-op afterwards */
function vwIntEnsure(B){
  if(!B||B.vwInt) return; B.vwInt=true;
  const cab=VW_CAB[B.key]; if(!cab) return; const c=B.c, M=cab.main, L=c.L;
  const put=(id,geom)=>{ if(!geom) return; const m=new THREE.Mesh(geom,B.mat(id,VW_INT_MK[id],"int"));
    m.userData={id,layer:"int",mirror:false,dir:EXP[id]||[0,0,0],child:false,piv:null,hinge:null,nl:false,role:undefined};
    B.root.add(m); (B.byId[id]=B.byId[id]||[]).push(m); };
  const zf=ringAt(c,(M.x[0]+M.x[1])/2*L).zb+M.zf, seats=[], floors=[], gal=[], lav=[], bin=[], cargo=[];
  vwSeatGeos(c,M,vwRowsX(c,M),zf,seats);
  if(cab.prem){ vwSeatGeos(c,cab.prem,vwRowsX(c,cab.prem),zf,seats); }
  vwFloorGs(c,M,zf,floors); if(cab.prem) vwFloorGs(c,cab.prem,zf,floors); vwServiceGs(c,M,zf,gal,lav,bin); vwCargoGs(c,zf,cargo);
  if(cab.up){ const zu=zf+cab.up.dz; vwSeatGeos(c,cab.up,vwRowsX(c,cab.up),zu,seats); vwFloorGs(c,cab.up,zu,floors); }
  put("int_frames",vwFramesGeo(c));
  put("int_stringers",vwStringersGeo(c));
  put("int_floor",mergeG(floors));
  put("int_seats",mergeG(seats));
  if(gal.length) put("int_galleys",mergeG(gal));
  if(lav.length) put("int_lavs",mergeG(lav));
  if(bin.length) put("int_bins",mergeG(bin));
  if(cargo.length) put("int_cargo",mergeG(cargo));
}
/* called on selection: an interior part is built before it is focused */
function vwIntSel(id){ if(String(id).indexOf("int_")!==0) return; try{ const B=GL.dbg(); if(B) vwIntEnsure(B); }catch(e){} }
