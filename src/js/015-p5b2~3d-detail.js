/* ---------- 3D detail: panel lines on fuselage skin and wing box (children of each part, so they move with animations and disassembly) ---------- */
function addDetail(B){
  const c=B.c, L=c.L, a380=B.key!=="b737", step=a380?6.0:4.4, off=1.006;
  const lm=new THREE.LineBasicMaterial({color:0x1b2733,transparent:true,opacity:0.09,depthWrite:false});
  B.panelMat=lm;
  const mk=(pos,P)=>{ const g=new THREE.BufferGeometry(); const a=new Float32Array(pos.length); for(let i=0;i<pos.length;i+=3){ a[i]=pos[i]-P[0]; a[i+1]=pos[i+1]-P[1]; a[i+2]=pos[i+2]-P[2]; } g.setAttribute("position",new THREE.BufferAttribute(a,3)); const l=new THREE.LineSegments(g,lm); l.renderOrder=2; l.raycast=()=>{}; return l; };
  const W=wingLS(c);
  B.root.children.slice().forEach(m=>{
    const u=m.userData; if(!m.isMesh||!u||!u.id||u.nl||!m.material||!m.material.userData) return;
    const P=u.P||[0,0,0], kind=m.material.userData.mk;
    if((u.id==="fuse_fwd"||u.id==="fuse_mid"||u.id==="fuse_aft")&&kind==="skin"){
      m.geometry.computeBoundingBox(); const bb=m.geometry.boundingBox, X0=bb.min.z+P[2]+L/2+0.05, X1=bb.max.z+P[2]+L/2-0.05, pos=[];
      for(let X=Math.ceil(X0/step)*step;X<X1;X+=step){ const r=ringAt(c,X); for(let j=0;j<56;j++){ const t0=j/56*Math.PI*2, t1=(j+1)/56*Math.PI*2;
        pos.push(r.hw*Math.cos(t0)*secK(c,Math.sin(t0),X)*off,r.zc+r.hh*Math.sin(t0)*off,X-L/2, r.hw*Math.cos(t1)*secK(c,Math.sin(t1),X)*off,r.zc+r.hh*Math.sin(t1)*off,X-L/2); } }
      [1.15,-1.15,-Math.PI/2].forEach(a=>{ for(let X=X0;X<X1-0.4;X+=0.4){ const r0=ringAt(c,X), r1=ringAt(c,Math.min(X1,X+0.4));
        pos.push(r0.hw*Math.cos(a)*secK(c,Math.sin(a),X)*off,r0.zc+r0.hh*Math.sin(a)*off,X-L/2, r1.hw*Math.cos(a)*secK(c,Math.sin(a),X+0.4)*off,r1.zc+r1.hh*Math.sin(a)*off,Math.min(X1,X+0.4)-L/2); } });
      m.add(mk(pos,P));
    }
    /* leading-edge slat joints and trailing-edge panel joints on the upper surface: [u0,u1,f0,f1,count] */
    const SL={slats:[0.12,0.97,0,0.12,8],flaps:[0.12,0.62,0.74,1,5],spoilers:[0.12,0.88,0.58,0.74,7],aileron:[0.64,0.97,0.74,1,2]}[u.id];
    if(SL&&kind==="wing"&&a380&&B.key!=="b747"&&u.mvk===undefined){   /* (segmented slats show their own gaps) */   /* the 747-400 panels carry their own gaps (m_jc_wing.js) */ const sx=u.mirror?-1:1, pos=[];
      for(let k=0;k<=SL[4];k++){ const uu=SL[0]+(SL[1]-SL[0])*k/SL[4]; for(let j=0;j<3;j++){ const p=W.pt(uu,SL[2]+(SL[3]-SL[2])*j/3,1,0.04), q=W.pt(uu,SL[2]+(SL[3]-SL[2])*(j+1)/3,1,0.04); pos.push(sx*p.x,p.y,p.z,sx*q.x,q.y,q.z); } }
      m.add(mk(pos,P)); }
    if(u.id==="wingbox"&&kind==="wing"){
      const sx=u.mirror?-1:1, pos=[], push=(p,q)=>pos.push(sx*p.x,p.y,p.z,sx*q.x,q.y,q.z);
      [0.15,0.62].forEach(f=>{ for(let i=0;i<20;i++){ push(W.pt(i/20,f,1,0.035),W.pt((i+1)/20,f,1,0.035)); } });
      for(let k=2;k<16;k+=2){ const uu=k/16; for(let j=0;j<6;j++){ const f0=0.15+(0.62-0.15)*j/6, f1=0.15+(0.62-0.15)*(j+1)/6; push(W.pt(uu,f0,1,0.035),W.pt(uu,f1,1,0.035)); } }
      for(let i=0;i<20;i++){ push(W.pt(i/20,0.4,-1,0.035),W.pt((i+1)/20,0.4,-1,0.035)); }
      m.add(mk(pos,P));
    }
  });
}
