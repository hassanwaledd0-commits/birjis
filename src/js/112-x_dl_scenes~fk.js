/* ---------- fk: the cities of the flight world. One urban model (density field, lattice of 30 m cells with district block pitches, streets, parks, industry) is evaluated
   twice with the same formulas: in GLSL by the ground shader (streets, lots, roofs, night lights: the only thing seen beyond the 3D range) and in JS to fill three rings of
   instanced buildings that follow the camera (30 m cells near, 90 m blocks mid, 270 m clusters far; toroidal buffers, one new column/row per cell crossed, no per-frame allocation).
   Facades, roofs and night windows are drawn in the building shader from world position (floor lines, bays, glass, parapets, roof equipment), anti-aliased with derivatives.
   World: x east, z south. Lattice space u = Rot(theta) * world, gently warped (organic streets). ---------- */
const FK_C=30;
let FK_NZ=null, FK_HS=null;   /* the noise texture bytes (the same ones the GPU reads) and the 256x256 hash bytes (read with NEAREST on the GPU) */
const FK={cur:{rd:null,ring:null,ct:[[4300,-3000,3100,1.0],[-2500,6500,1500,0.3],[7300,3600,1100,0.4]],rot:0.21,warp:14,th:1,pitched:0,ap:[460,-1950,640,2250],pal:[[0.84,0.78,0.66],[0.72,0.63,0.50],[0.70,0.68,0.63],[0.56,0.60,0.64]],water:null}};
const fkSS=(a,b,x)=>{ const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); };
function fkMkHash(){ const d=new Uint8Array(256*256*4); let s=20240611; for(let i=0;i<d.length;i++){ s=(Math.imul(s,1664525)+1013904223)>>>0; d[i]=(s>>>11)&255; } FK_HS=d;
  const t=new THREE.DataTexture(d,256,256,THREE.RGBAFormat); t.magFilter=t.minFilter=THREE.NearestFilter; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.generateMipmaps=false; t.needsUpdate=true; return t; }
function fkN(ch,u,v){ const N=256, x=u*N-0.5, y=v*N-0.5, x0=Math.floor(x), y0=Math.floor(y), fx=x-x0, fy=y-y0, X0=((x0%N)+N)%N, X1=(X0+1)%N, Y0=((y0%N)+N)%N, Y1=(Y0+1)%N, D=FK_NZ;
  const a=D[(Y0*N+X0)*4+ch], b=D[(Y0*N+X1)*4+ch], c=D[(Y1*N+X0)*4+ch], e=D[(Y1*N+X1)*4+ch]; return ((a+(b-a)*fx)*(1-fy)+(c+(e-c)*fx)*fy)/255; }
const fkh=[0,0,0,0], fkd=[0,0,0,0];
function fkHsJS(i,j,o){ const x=((i%256)+256)%256, y=((j%256)+256)%256, k=(y*256+x)*4, D=FK_HS; o[0]=D[k]/255; o[1]=D[k+1]/255; o[2]=D[k+2]/255; o[3]=D[k+3]/255; return o; }
function fkWaterJS(x,z){ const W=FK.cur.water; return W?W(x,z):x-(9000+1500*Math.sin(z/2600)+700*Math.sin(z/900+1)+500*(fkN(0,z/5000,0.37)-0.5)); }
function fkKeepJS(x,z){ const C=FK.cur, k=1-fkSS(-900,-300,fkWaterJS(x,z)), a=C.ap, qx=Math.abs(x-a[0])-a[2], qz=Math.abs(z-a[1])-a[3], db=Math.hypot(Math.max(qx,0),Math.max(qz,0))+Math.min(Math.max(qx,qz),0); return k*fkSS(60,380,db); }
let fkKy=0;
function fkRoadDJS(x,z){ const C=FK.cur; let d=1e9; if(C.rd) for(let i=0;i<C.rd.length;i++){ const s=C.rd[i], bx=s[2]-s[0], bz=s[3]-s[1], L2=bx*bx+bz*bz; if(L2<1) continue; const h=Math.max(0,Math.min(1,((x-s[0])*bx+(z-s[1])*bz)/L2)); d=Math.min(d,Math.hypot(x-s[0]-bx*h,z-s[1]-bz*h)); } if(C.ring) d=Math.min(d,Math.abs(Math.hypot(x-C.ring[0],z-C.ring[1])-C.ring[2])); return d; }
function fkDensJS(x,z){ const C=FK.cur, n=fkN(1,x/1900+0.37,z/1900+0.37)-0.5, n2=fkN(0,x/560+0.11,z/560+0.11)-0.5; let d=0; fkKy=0;
  for(let k=0;k<C.ct.length;k++){ const c=C.ct[k], r=Math.hypot(x-c[0],z-c[1])+c[2]*0.55*n+c[2]*0.12*n2, v=c[2]>1?1-fkSS(c[2]*0.15,c[2],r):0; if(v>d){ d=v; fkKy=c[3]; } }
  return d*fkKeepJS(x,z); }
function fkWarpJS(x,z,o){ const a=FK.cur.warp; o[0]=a*(Math.sin(z/370+1.1)*0.7+Math.sin(z/131+x/260)*0.3); o[1]=a*(Math.sin(x/410+0.4)*0.7+Math.sin(x/149-z/210)*0.3); return o; }
const fkw=[0,0];
/* lattice cell (i,j) -> instance attributes. o receives: type, u-space centre and half sizes, heights; returns the type (0 = nothing to draw) */
const fkCo={t:0,cx:0,cz:0,hw:0,hd:0,h0:0,h1:0,a:0,b:0,h2:0,seed:0,tone:0};
const fkm3=n=>((n%3)+3)%3;
function fkCell(i,j){
  const o=fkCo, C=FK.cur; o.t=0; o.h0=0;
  const ux=(i+0.5)*FK_C, uz=(j+0.5)*FK_C; fkWarpJS(ux,uz,fkw); const qx=ux+fkw[0], qz=uz+fkw[1], c=Math.cos(C.rot), s=Math.sin(C.rot), wx=c*qx-s*qz, wz=s*qx+c*qz;
  const d=fkDensJS(wx,wz), ky=fkKy; if(d<0.012||fkRoadDJS(wx,wz)<24) return 0;
  const dI=Math.floor(i/68), dJ=Math.floor(j/68), dh=fkHsJS(dI*7+31,dJ*7+57,fkh), ind=fkHsJS(dI*7+33,dJ*7+59,fkd)[0]<0.16?1:0;
  const Px=3+Math.floor(dh[0]*3), Pz=3+Math.floor(dh[1]*3), phx=Math.floor(dh[2]*Px), phz=Math.floor(dh[3]*Pz), bi=Math.floor((i-phx)/Px), bj=Math.floor((j-phz)/Pz), lx=i-phx-bi*Px, lz=j-phz-bj*Pz;
  let stL=lx<0.5?(fkm3(bi)===0?7.5:3.25):0, stR=lx>Px-1.5?(fkm3(bi+1)===0?7.5:3.25):0, stB=lz<0.5?(fkm3(bj)===0?7.5:3.25):0, stT=lz>Pz-1.5?(fkm3(bj+1)===0?7.5:3.25):0;
  const ldx=i-dI*68, ldz=j-dJ*68; if(ldx<0.5) stL=Math.max(stL,6.5); if(ldx>66.5) stR=Math.max(stR,6.5); if(ldz<0.5) stB=Math.max(stB,6.5); if(ldz>66.5) stT=Math.max(stT,6.5);
  const bk=fkHsJS(bi+dI*13+101,bj+dJ*13+203,fkd)[0], ch=fkHsJS(i,j,fkh), zn=fkN(1,wx/830+0.62,wz/830+0.62), e=d+(zn-0.5)*0.22+(ch[0]-0.5)*0.10, tl=C.th;
  const hf=0.55+0.9*fkN(0,wx/260+0.77,wz/260+0.77); let t=0; if(bk<0.065&&e>0.12*tl) t=7; else if(ind&&e>0.06*tl&&e<0.62*tl) t=6; else if(e>0.8*tl&&ky>0.3) t=5; else if(e>0.54*tl) t=ky>0.3?4:3; else if(e>0.27*tl) t=3; else if(e>0.10*tl) t=2; else if(e>0.035*tl) t=1;
  if(t===5&&ch[3]>0.4&&e<0.96*tl) t=4;
  if(t===0||t===7) return 0;
  const al=t===5?3.5:t===4?2:t===3?1.6:t===2?0.7:t===1?3:2.5, x0=stL>0?stL:al, x1=FK_C-(stR>0?stR:al), z0=stB>0?stB:al, z1=FK_C-(stT>0?stT:al);
  let hw=(x1-x0)/2, hd=(z1-z0)/2, cx=i*FK_C+(x0+x1)/2, cz=j*FK_C+(z0+z1)/2; const g=ch[1], b2=ch[2], pit=C.pitched;
  let h0=0,h1=0,a=0,b=0,h2=0;
  if(t===1){ const fs=0.5+0.2*b2; cx+=(ch[3]-0.5)*hw*(1-fs); cz+=(ch[0]-0.5)*hd*(1-fs); hw*=fs; hd*=fs; h0=4.2+g*3; if(pit){ h1=2.4; a=0.02; b=0.72; } }
  else if(t===2){ const fs=0.78+0.22*b2; cx+=(ch[3]-0.5)*hw*(1-fs); cz+=(ch[0]-0.5)*hd*(1-fs); hw*=fs; hd*=fs; h0=3.1*(1+Math.floor(g*hf*2.4))+0.3; if(pit){ h1=2.6; a=0.02; b=0.7; } }
  else if(t===3){ const fs=0.72+0.28*b2; cx+=(ch[3]-0.5)*hw*(1-fs); cz+=(ch[0]-0.5)*hd*(1-fs); hw*=fs; hd*=fs; h0=3.2*(3+Math.floor(g*hf*3.99)); }
  else if(t===4){ const fs=0.78+0.22*b2; cx+=(ch[3]-0.5)*hw*(1-fs); cz+=(ch[0]-0.5)*hd*(1-fs); hw*=fs; hd*=fs; h0=3.3*(5+Math.floor(g*hf*7.99))*(0.75+0.25*ky); if(b2>0.6){ h1=h0*0.3; a=0.18; b=0.18; } }
  else if(t===5){ let H=(45+g*55)*hf+Math.max(0,(e-0.8*tl)/0.2)*130*ky*(0.5+g); if(ch[3]>0.985&&e>0.95*tl&&ky>1) H*=2; const fs=0.62+0.3*b2; cx+=(ch[0]-0.5)*hw*(1-fs); cz+=(ch[3]-0.5)*hd*(1-fs); hw*=fs; hd*=fs; h0=H*0.64; h1=H*0.3; a=0.1+0.1*b2; b=a+0.1; h2=H>210?H*0.09:0; }
  else { h0=7+g*7; }
  o.t=t; o.cx=cx; o.cz=cz; o.hw=hw; o.hd=hd; o.h0=h0; o.h1=h1; o.a=a; o.b=b; o.h2=h2; o.seed=b2; o.tone=ch[3]; return t;
}
/* one slot of a ring (m = 1, 3 or 9 cells wide) written at array index k */
function fkFillSlot(R,si,sj){
  const m=R.m, k=((((sj%R.N)+R.N)%R.N)*R.N+(((si%R.N)+R.N)%R.N))*4, A=R.iA, B=R.iB, Cc=R.iC; let t;
  if(m===1){ t=fkCell(si,sj); }
  else { t=fkCell(si*m+(m>>1),sj*m+(m>>1)); const o=fkCo, hs=m*FK_C/2; if(t){ o.cx=(si+0.5)*m*FK_C; o.cz=(sj+0.5)*m*FK_C;
      if(m===3){ if(t<=3){ t=0; } else { const w=t===5?24:30; o.hw=o.hd=w; if(t===3) o.h0=Math.max(o.h0,11); o.h1=t===5?o.h1:0; o.h2=t===5?o.h2:0; } }
      else { if(t!==5) t=0; else { o.hw=o.hd=36; } } } }
  if(!t){ B[k]=0; return; } const o=fkCo; A[k]=o.cx; A[k+1]=o.cz; A[k+2]=o.hw; A[k+3]=o.hd; B[k]=o.h0; B[k+1]=o.h1; B[k+2]=o.a; B[k+3]=o.b; Cc[k]=o.h2; Cc[k+1]=o.seed; Cc[k+2]=t; Cc[k+3]=o.tone;
}
const FK_GLSL=`
uniform sampler2D uHs; uniform vec4 uCt[3]; uniform vec4 uCP,uCQ,uAp; uniform vec3 uCP2,uCP3,uCP4,uCP5;
vec4 fkHs(vec2 c){ return texture2D(uHs,(mod(c,256.0)+0.5)/256.0); }
float fkKeep(vec2 w){ float k=1.0-smoothstep(-900.0,-300.0,fkWaterS(w)); vec2 q=abs(w-uAp.xy)-uAp.zw; float db=length(max(q,vec2(0.0)))+min(max(q.x,q.y),0.0); return k*smoothstep(60.0,380.0,db); }
float fkDens(vec2 w,out float ky){ float n=fgT(w/1900.0+0.37).g-0.5, n2=fgT(w/560.0+0.11).r-0.5, d=0.0; ky=0.0;
  for(int k=0;k<3;k++){ vec4 c=uCt[k]; float r=length(w-c.xy)+c.z*0.55*n+c.z*0.12*n2, v=c.z>1.0?1.0-smoothstep(c.z*0.15,c.z,r):0.0; if(v>d){ d=v; ky=c.w; } }
  return d*fkKeep(w); }
vec2 fkWarp(vec2 q){ return uCP.z*vec2(sin(q.y/370.0+1.1)*0.7+sin(q.y/131.0+q.x/260.0)*0.3,sin(q.x/410.0+0.4)*0.7+sin(q.x/149.0-q.y/210.0)*0.3); }
vec2 fkRot(vec2 w){ return vec2(uCP.x*w.x+uCP.y*w.y,-uCP.y*w.x+uCP.x*w.y); }
vec2 fkUnrot(vec2 q){ return vec2(uCP.x*q.x-uCP.y*q.y,uCP.y*q.x+uCP.x*q.y); }
vec2 fkToU(vec2 w){ vec2 q=fkRot(w), u=q-fkWarp(q); return q-fkWarp(u); }
void fkLay(vec2 ci,out vec4 st,out float bk,out float ind){
  vec2 dI=floor(ci/68.0); vec4 dh=fkHs(dI*7.0+vec2(31.0,57.0)); ind=step(fkHs(dI*7.0+vec2(33.0,59.0)).r,0.16);
  vec2 P=3.0+floor(dh.rg*3.0), ph=floor(dh.ba*P), bi=floor((ci-ph)/P), li=ci-ph-bi*P;
  vec2 swL=mix(vec2(3.25),vec2(7.5),step(mod(bi,3.0),vec2(0.5))), swR=mix(vec2(3.25),vec2(7.5),step(mod(bi+1.0,3.0),vec2(0.5)));
  st=vec4(li.x<0.5?swL.x:0.0,li.x>P.x-1.5?swR.x:0.0,li.y<0.5?swL.y:0.0,li.y>P.y-1.5?swR.y:0.0);
  vec2 ld=ci-dI*68.0; st.x=ld.x<0.5?max(st.x,6.5):st.x; st.y=ld.x>66.5?max(st.y,6.5):st.y; st.z=ld.y<0.5?max(st.z,6.5):st.z; st.w=ld.y>66.5?max(st.w,6.5):st.w;
  bk=fkHs(bi+dI*13.0+vec2(101.0,203.0)).r; }
float fkType(float e,float bk,float ind,float ky){ float tl=uCQ.x;
  if(bk<0.065&&e>0.12*tl) return 7.0; if(ind>0.5&&e>0.06*tl&&e<0.62*tl) return 6.0; if(e>0.8*tl&&ky>0.3) return 5.0; if(e>0.54*tl) return ky>0.3?4.0:3.0; if(e>0.27*tl) return 3.0; if(e>0.10*tl) return 2.0; if(e>0.035*tl) return 1.0; return 0.0; }
vec3 fkTone(float t){ return mix(mix(uCP2,uCP3,step(0.25,t)),mix(uCP4,uCP5,step(0.75,t)),step(0.5,t)); }
`;
const FK_GROUND=`
/* the city as seen from the ground shader: albedo (a = coverage), night emission, street coverage */
vec4 fkGround(vec2 w,vec2 aa,float dn,float ky,out vec3 emis,out float strCov){
  float aaI=max(aa.x,aa.y); emis=vec3(0.0); strCov=0.0;
  vec2 u=fkToU(w), ci=floor(u/30.0), f=u-ci*30.0; vec4 st; float bk,ind; fkLay(ci,st,bk,ind); vec4 ch=fkHs(ci);
  float zn=fgT(w/830.0+0.62).g, e=dn+(zn-0.5)*0.22+(ch.r-0.5)*0.10, typ=fkType(e,bk,ind,ky);
  float aw=max(aaI*0.7,0.3);
  float sx=max(st.x>0.0?1.0-smoothstep(st.x-aw,st.x+aw,f.x):0.0,st.y>0.0?1.0-smoothstep(st.y-aw,st.y+aw,30.0-f.x):0.0);
  float sz=max(st.z>0.0?1.0-smoothstep(st.z-aw,st.z+aw,f.y):0.0,st.w>0.0?1.0-smoothstep(st.w-aw,st.w+aw,30.0-f.y):0.0), str=max(sx,sz);
  float al=typ>4.5?3.5:typ>3.5?2.0:typ>2.5?1.6:typ>1.5?0.7:typ>0.5?3.0:2.0;
  vec2 lo=vec2(st.x>0.0?st.x:al,st.z>0.0?st.z:al), hi=vec2(30.0-(st.y>0.0?st.y:al),30.0-(st.w>0.0?st.w:al)), cc=(lo+hi)*0.5, hh=(hi-lo)*0.5*(typ>4.5?0.7:typ>0.5&&typ<1.5?0.55:1.0);
  vec2 dd=abs(f-cc)-hh; float bm=1.0-smoothstep(-aw,aw,max(dd.x,dd.y)); bm*=step(0.5,typ)*step(typ,6.5);
  vec3 tone=fkTone(ch.a); float br=0.86+0.28*ch.b;
  vec3 roof=typ>5.5?vec3(0.72,0.74,0.76):typ>4.5?vec3(0.56,0.58,0.6):tone*br; roof*=0.96+0.08*fgHash(floor(u/6.0));
  if(typ>1.5&&typ<2.5){ vec2 g=abs(fract((f-lo)/(hi-lo)*vec2(2.0,3.0))-0.5); roof*=1.0-0.18*(1.0-smoothstep(0.43,0.5,max(g.x,g.y))); }
  vec3 lot=vec3(0.60,0.54,0.45)*(0.9+0.2*ch.g);
  float park=step(6.5,typ)*step(typ,7.5); lot=mix(lot,vec3(0.21,0.36,0.15)*(0.85+0.3*fgHash(floor(u/5.0))),park);
  vec3 asp=vec3(0.115,0.118,0.122);
    vec3 col=mix(lot,roof,bm); col=mix(col,asp,str);
  float sw=0.0; if(str>0.5){ float ex=min(st.x>0.0?abs(f.x-st.x):9.0,st.y>0.0?abs(30.0-f.x-st.y):9.0), ez=min(st.z>0.0?abs(f.y-st.z):9.0,st.w>0.0?abs(30.0-f.y-st.w):9.0); sw=1.0-smoothstep(0.8,1.5+aaI,min(ex,ez)); col=mix(col,vec3(0.38,0.37,0.35),sw*0.7*(1.0-smoothstep(3.0,10.0,aaI))); }
  /* far field: cells are not resolved, use the district average */
  float lod=smoothstep(5.0,26.0,aaI); float sf=0.17; vec3 avg=mix(mix(vec3(0.60,0.54,0.45),tone*0.95,0.62),asp,sf)*(typ>0.5&&typ<6.5?1.0:0.8)*mix(1.0,0.9,step(4.5,typ)); avg=mix(avg,vec3(0.21,0.36,0.15),park*0.7);
  col=mix(col,avg,lod); strCov=str*(1.0-lod);
  float a=smoothstep(0.02,0.1,dn);
  /* night: street lamps, window glow in resolved cells, a glow in the far field */
  float lamp=0.0; if(aaI<5.0){ lamp=max(st.x>0.0?1.0-smoothstep(0.7,1.6,length(vec2(f.x-st.x*0.8,mod(f.y,15.0)-7.5))):0.0,st.z>0.0?1.0-smoothstep(0.7,1.6,length(vec2(f.y-st.z*0.8,mod(f.x,15.0)-7.5))):0.0); }
  emis=vec3(1.0,0.6,0.26)*(lamp*1.7*(1.0-lod)+str*0.07*(1.0-lod))+vec3(1.0,0.72,0.4)*(0.07*smoothstep(0.1,0.7,dn)*(0.5+ch.g)+0.05*bm*step(0.55,ch.b))*lod*step(0.5,typ)+vec3(1.0,0.74,0.42)*0.022*bm*(1.0-lod)*step(0.55,ch.b);
  return vec4(pow(col,vec3(2.2)),a);
}
`;
