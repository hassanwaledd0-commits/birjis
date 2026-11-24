/* ---------- fg stage 4: effects (contrails, wingtip vortices, tyre smoke, runway spray, exhaust haze), aircraft lights + landing-light spot on the ground,
   aircraft self-shadow (high tier), cockpit frame with sun glare and rain drops, comfortable camera motion, adaptive quality governor. ---------- */
const FG_TIER_LBL=["LO","MID","HI"];
function fgFxAnchors(B,A){   /* light / engine / gear anchor points in pivot space (CG at the origin), taken from the real model's bounding boxes */
  const bx={}, tmp=new THREE.Box3(); B.root.updateMatrixWorld(true); B.root.traverse(m=>{ const u=m.userData; if(m.isMesh&&u&&u.id&&!u.child){ tmp.setFromObject(m); const b=bx[u.id]; if(!b) bx[u.id]=tmp.clone(); else b.union(tmp); } });
  const g=id=>bx[id]||bx.fuse_mid, V=(x,y,z)=>new THREE.Vector3(x,y,z), an={};
  const wt=g("wingtip"), fa=g("fuse_aft"), fm=g("fuse_mid"), wb=g("wingbox"), ng=g("eng_nozzle"), gm=bx.gear_main||bx.wheels||fm;
  const tz=wt.min.z+(wt.max.z-wt.min.z)*0.55, ty=(wt.min.y+wt.max.y)*0.5;
  an.tipL=V(wt.min.x,ty,tz); an.tipR=V(wt.max.x,ty,tz); an.tail=V(0,fa.max.y*0.55,fa.max.z); an.beaconT=V(0,fm.max.y+0.15,(fm.min.z+fm.max.z)*0.5); an.beaconB=V(0,fm.min.y-0.15,(fm.min.z+fm.max.z)*0.5);
  an.landL=V(-(wb.max.x)*0.2,wb.min.y+0.1,wb.min.z+0.3); an.landR=V((wb.max.x)*0.2,wb.min.y+0.1,wb.min.z+0.3); an.nose=V(0,-A.hm+FLY_SINK+1.2,g("radome").min.z+2);
  an.eng=A.ey.map(x=>V(x,(ng.min.y+ng.max.y)*0.5,ng.max.z+0.6)); an.gearL=V(-Math.max(2.5,(gm.max.x-gm.min.x)*0.25),-A.hm+FLY_SINK,(gm.min.z+gm.max.z)*0.5); an.gearR=V(-an.gearL.x,-A.hm+FLY_SINK,an.gearL.z);
  an.nz=ng.max.z; return an;
}
function fgFxBuild(scene,AU,W){
  const N=2600, P=new Float32Array(N*3), AP=new Float32Array(N*4), VL=new Float32Array(N*3), AG=new Float32Array(N), LF=new Float32Array(N), S0=new Float32Array(N), S1=new Float32Array(N), KD=new Float32Array(N), AL=new Float32Array(N);
  const geo=new THREE.BufferGeometry(), pA=new THREE.BufferAttribute(P,3), qA=new THREE.BufferAttribute(AP,4); pA.setUsage(THREE.DynamicDrawUsage); qA.setUsage(THREE.DynamicDrawUsage); geo.setAttribute("position",pA); geo.setAttribute("aP",qA);
  const PU=Object.assign({uPx:{value:600},uPR:{value:1}},AU);
  const mat=new THREE.ShaderMaterial({uniforms:PU,transparent:true,depthWrite:false,
    vertexShader:fgAtmo+`attribute vec4 aP; uniform float uPx,uPR; varying vec4 vC;
      void main(){ vec4 mv=viewMatrix*vec4(position,1.0); float dist=length(mv.xyz), k=aP.y; vec3 base=k<0.5?vec3(0.96,0.98,1.0):k<1.5?vec3(0.78,0.78,0.76):k<2.5?vec3(0.85,0.9,0.96):k<3.5?vec3(1.0,0.92,0.82):vec3(0.95,0.97,1.0);
        vec3 col=base*(uAmb*1.5+uLCol*0.7); gl_PointSize=clamp(aP.z*uPx/max(dist,1.0),0.0,260.0*uPR)*step(0.002,aP.w); vC=vec4(fgFog(col,position),aP.w*(1.0-smoothstep(3.0,20.0,dist)*0.0)); gl_Position=projectionMatrix*mv; }`,
    fragmentShader:"varying vec4 vC; void main(){ float r=length(gl_PointCoord-0.5)*2.0; if(r>1.0) discard; float a=1.0-smoothstep(0.15,1.0,r); a*=a; gl_FragColor=vec4(vC.rgb,vC.a*a);\n#include <tonemapping_fragment>\n#include <encodings_fragment>\n}"});
  const pts=new THREE.Points(geo,mat); pts.frustumCulled=false; pts.renderOrder=8; scene.add(pts);
  let head=0, live=0, tier=2; const sp=(x,y,z,vx,vy,vz,life,s0,s1,kind,al)=>{ const i=head; head=(head+1)%N; P[i*3]=x; P[i*3+1]=y; P[i*3+2]=z; VL[i*3]=vx; VL[i*3+1]=vy; VL[i*3+2]=vz; AG[i]=0; LF[i]=life; S0[i]=s0; S1[i]=s1; KD[i]=kind; AL[i]=al; };
  /* aircraft lights: a small dynamic Points draw using the same shader as the airport lights */
  const LP=new Float32Array(12*3), LC=new Float32Array(12*3), LA=new Float32Array(12*2), lg=new THREE.BufferGeometry(); const lpA=new THREE.BufferAttribute(LP,3); lpA.setUsage(THREE.DynamicDrawUsage);
  lg.setAttribute("position",lpA); lg.setAttribute("aCol",new THREE.BufferAttribute(LC,3)); lg.setAttribute("aP",new THREE.BufferAttribute(LA,2));
  const LU=Object.assign({uPx:{value:600},uLightK:{value:1},uPR:{value:1},uPapi:{value:new THREE.Vector4(1,1,1,1)}},AU), lights=new THREE.Points(lg,fgLightMat(LU)); lights.frustumCulled=false; lights.renderOrder=9; lights.visible=false; scene.add(lights);
  const defs=[["tipL",1,0.1,0.1,0.8,0],["tipR",0.1,1,0.2,0.8,0],["tail",1,0.95,0.85,0.7,0],["tipL",1,1,1,1.0,5],["tipR",1,1,1,1.0,5],["tail",1,1,1,1.0,5],["beaconT",1,0.1,0.05,1.2,4],["beaconB",1,0.1,0.05,1.2,4],["landL",1,0.95,0.85,2.4,0],["landR",1,0.95,0.85,2.4,0],["nose",1,0.95,0.85,1.2,0]];
  defs.forEach((d,i)=>{ LC.set([d[1],d[2],d[3]],i*3); LA.set([d[4],d[5]],i*2); }); lg.setDrawRange(0,defs.length);
  const st={an:null,acc:0,accV:0,smoke:0,lastTouch:null,sh:false}, V=new THREE.Vector3(), Wv=new THREE.Vector3(), Qd=new THREE.Quaternion();
  const world=(l,q,p,o)=>o.copy(l).applyQuaternion(q).add(p);
  const API={pts,lights,st,PU,LU,count:0,
    setAircraft:(B,A)=>{ st.an=fgFxAnchors(B,A); LF.fill(0); AP.fill(0); qA.needsUpdate=true; st.acc=0; st.smoke=0; st.lastTouch=null; },
    clear:()=>{ LF.fill(0); AP.fill(0); qA.needsUpdate=true; lights.visible=false; },
    setTier:(t)=>{ tier=t; },
    update:(dt,s,info,paused)=>{ const an=st.an; if(!an||!s) return; const q=s.q, p=s.p, wx=W.w||{}, night=W.night, A=s.A, spd=s.v.length();
      /* lights (nav + strobes + beacons always; landing light at low altitude / on the ground when lights are wanted) */
      const lamp=AU.uLamp.value; LU.uLightK.value=0.55+0.6*Math.min(1,lamp+(night?1:0)); lights.visible=true; const lOn=(s.gear>0.5||s.ground)&&info.agl<3000?1:0;
      defs.forEach((d,i)=>{ world(an[d[0]],q,p,V); LP[i*3]=V.x; LP[i*3+1]=V.y; LP[i*3+2]=V.z; const code=d[5]; if(i>=8&&!lOn){ LP[i*3+1]=-9999; } }); lpA.needsUpdate=true;
      /* landing light spot on the ground shader */
      const nightF=Math.min(1,lamp*1.2+(night?1:0)), on=lOn*Math.max(nightF,0.25*(1-AU.uNight.value)*AU.uLamp.value*0)*(lamp>0.05||night?1:0);
      world(an.landL,q,p,V); world(an.landR,q,p,Wv); V.add(Wv).multiplyScalar(0.5); AU.uLLp.value.set(V.x,V.y,V.z,on*5.2); Qd.copy(q); Wv.set(0,-0.1,-1).applyQuaternion(Qd).normalize(); AU.uLLd.value.set(Wv.x,Wv.y,Wv.z,0.86);
      if(paused) { pA.needsUpdate=true; return; }
      const k=tier===2?1:tier===1?0.6:0.35, hum=(wx.cover>0.3||wx.wet>0)?1:0, ground=s.ground, gs=Math.hypot(s.v.x,s.v.z), n1=s.n1;
      /* contrails */
      if(info.alt>24000&&spd>60){ st.acc+=spd*dt; const step=22/k; while(st.acc>step){ st.acc-=step; for(let i=0;i<A.n;i++){ if(!s.eng[i]||n1[i]<0.3) continue; world(an.eng[i],q,p,V); sp(V.x,V.y,V.z,(Math.random()-0.5)*0.8,(Math.random()-0.5)*0.4,(Math.random()-0.5)*0.8,52*(0.6+0.4*k),2.2,38,0,0.34); } } } else st.acc=0;
      /* wingtip vortices in humid air at high lift near the ground */
      if(hum&&info.agl<500&&spd>45&&(s.flaps>0.5||info.nz>1.2)){ st.accV+=spd*dt; while(st.accV>10/k){ st.accV-=10/k; [an.tipL,an.tipR].forEach(l=>{ world(l,q,p,V); sp(V.x,V.y,V.z,(Math.random()-0.5)*0.6,-0.5,(Math.random()-0.5)*0.6,2.6,0.5,2.6,4,0.2*(0.5+0.5*Math.min(1,(info.nz-1)*3+0.4))); }); } }
      /* touchdown tyre smoke (burst, scaled by sink rate) */
      const tc=s.ev.touch; if(tc&&tc!==st.lastTouch){ st.lastTouch=tc; st.smoke=Math.min(1,Math.max(0.25,tc.sink/450)); st.smokeT=0.55; }
      if(st.smokeT>0){ st.smokeT-=dt; const n=Math.ceil(7*k*st.smoke); for(let j=0;j<n;j++) [an.gearL,an.gearR].forEach(l=>{ world(l,q,p,V); sp(V.x+(Math.random()-0.5)*1.5,V.y+0.2,V.z+(Math.random()-0.5)*2,s.v.x*0.05+(Math.random()-0.5)*1.2,0.5+Math.random()*0.9,s.v.z*0.05+(Math.random()-0.5)*1.2,3.2+Math.random()*1.5,1.5,12+Math.random()*5,1,0.85*st.smoke+0.15); }); }
      /* runway spray when wet, exhaust haze at high thrust near the ground */
      if(ground&&gs>28&&AU.uWet.value>0.5){ const n=Math.ceil(3*k); for(let j=0;j<n;j++) [an.gearL,an.gearR].forEach(l=>{ world(l,q,p,V); sp(V.x,V.y+0.1,V.z,(Math.random()-0.5)*3,1+Math.random()*2.5,(Math.random()-0.5)*3,0.9,0.8,4.5,2,0.32); }); }
      if(info.agl<40&&s.lever>0.7&&tier>0){ for(let i=0;i<A.n;i++){ if(!s.eng[i]) continue; world(an.eng[i],q,p,V); Wv.set(0,0,1).applyQuaternion(q); sp(V.x,V.y,V.z,Wv.x*28+(Math.random()-0.5)*3,Wv.y*28,Wv.z*28+(Math.random()-0.5)*3,0.55,0.8,4,3,0.07); } }
      const ws=s.wind; live=0; for(let i=0;i<N;i++){ if(LF[i]<=0){ AP[i*4+3]=0; continue; } AG[i]+=dt; if(AG[i]>=LF[i]){ LF[i]=0; AP[i*4+3]=0; continue; } const t=AG[i]/LF[i], dr=KD[i]===3?0.9:0.985; VL[i*3]=VL[i*3]*dr+ws.x*dt*0.3; VL[i*3+1]=VL[i*3+1]*dr; VL[i*3+2]=VL[i*3+2]*dr+ws.z*dt*0.3;
        P[i*3]+=VL[i*3]*dt; P[i*3+1]+=VL[i*3+1]*dt; P[i*3+2]+=VL[i*3+2]*dt; AP[i*4]=t; AP[i*4+1]=KD[i]; AP[i*4+2]=S0[i]+(S1[i]-S0[i])*Math.sqrt(t); AP[i*4+3]=AL[i]*Math.pow(1-t,1.3)*Math.min(1,t*20); live++; }
      pA.needsUpdate=true; qA.needsUpdate=true; API.count=live; } };
  return API;
}
/* aircraft self-shadow with a sun shadow map (high tier only) */
function fgShadowSet(on){
  const W=FLY.W, ren=FLY.ren, B=FLY.B; if(!W||!ren||!B||FLY.shOn===on) return; FLY.shOn=on; const sun=W.sun, L=GEO[FLY.key].L;
  ren.shadowMap.enabled=on; ren.shadowMap.type=THREE.PCFSoftShadowMap; sun.castShadow=on;
  if(on){ const c=sun.shadow.camera, r=L*0.62; c.left=-r; c.right=r; c.top=r; c.bottom=-r; c.near=20; c.far=700; c.updateProjectionMatrix(); sun.shadow.mapSize.set(1024,1024); sun.shadow.bias=-0.0004; sun.shadow.normalBias=0.04; if(sun.shadow.map){ sun.shadow.map.dispose(); sun.shadow.map=null; } }
  B.root.traverse(m=>{ if(m.isMesh){ m.castShadow=on; m.receiveShadow=on; } }); B.mats.forEach(m=>{ m.needsUpdate=true; });
}
/* quality governor: adjusts the pixel ratio and the detail tier from the measured frame time (auto), or fixes them (high / low) */
function fgQualityInit(){
  const q=FLY.q=FLY.q||{}, dpr=window.devicePixelRatio||1, low=/[?&]lowq/.test(location.search), mode=low?"low":(FLY.opts.q||"auto");
  q.mode=mode; q.max=Math.min(dpr,mode==="high"?1.5:1.25); q.pr=mode==="low"?Math.min(q.max,0.75):q.max; q.tier=mode==="low"?0:2; q.ema=16; q.t=0; q.cool=2.5; q.up=0; q.warm=1.2; fgQualityApply();
}
function fgQualityApply(){
  const q=FLY.q, W=FLY.W; if(!q||!W||!FLY.ren) return; FLY.ren.setPixelRatio(q.pr); const ov=document.getElementById("fly"); if(ov&&ov.clientWidth){ FLY.ren.setSize(ov.clientWidth,ov.clientHeight,false); W.setSize(ov.clientHeight,q.pr); }
  W.setTier(q.tier); try{ fgShadowSet(q.tier===2&&FLY.opts.shadow!==false&&!W.night); }catch(e){}
  const b=document.getElementById("fQ"); if(b) b.textContent=(q.mode==="auto"?"A·":"")+FG_TIER_LBL[q.tier];
}
function fgQualityTick(dt){
  const q=FLY.q; if(!q) return; if(q.warm>0){ q.warm-=dt; return; } if(dt>0.2) return; q.ema+=(dt*1000-q.ema)*Math.min(1,dt*1.2); q.cool-=dt; if(q.mode!=="auto"||q.cool>0) return;
  if(q.ema>24){ q.up=0; q.cool=2.0; if(q.pr>0.76) q.pr=Math.max(0.7,q.pr-0.15); else if(q.tier>0) q.tier--; else if(q.pr>0.6) q.pr=0.6; else return; fgQualityApply(); }
  else if(q.ema<13.5){ q.up+=dt; if(q.up>5){ q.up=0; q.cool=3; if(q.tier<2&&q.pr>=0.7) q.tier++; else if(q.pr<q.max) q.pr=Math.min(q.max,q.pr+0.15); else return; fgQualityApply(); } } else q.up=0;
}
/* comfortable camera motion: smooth turbulence, g-force head movement, touchdown bump; FLY.opts.calm reduces it */
function fgCamMotion(dt,s,info,cam,view){
  const m=FLY.mot||(FLY.mot={t:0,b:0,bv:0,lastTouch:null,gz:0,gx:0}), calm=FLY.opts.calm?0.25:1; m.t+=dt;
  const tc=s.ev.touch; if(tc&&tc!==m.lastTouch){ m.lastTouch=tc; m.bv=-Math.min(1.6,tc.sink/380)*calm; }
  m.bv+=(-90*m.b-9*m.bv)*dt; m.b+=m.bv*dt; const g=info.nz-1; m.gz+=((Math.max(-1.5,Math.min(2,g)))-m.gz)*Math.min(1,dt*4);
  const lat=Math.sin(info.bank*Math.PI/180)*Math.min(1,info.ias/200); m.gx+=(lat-m.gx)*Math.min(1,dt*3);
  const t=m.t, tb=s.turb*(view==="cockpit"?1:0.4)*calm, sb=(s.ev.stall&&!s.ground?1:0)*calm, gr=s.ground?Math.min(1,Math.hypot(s.v.x,s.v.z)/60):0;
  const n1=Math.sin(t*1.9)+0.7*Math.sin(t*3.1+1.3)+0.4*Math.sin(t*5.3+2.1), n2=Math.sin(t*2.3+0.7)+0.6*Math.sin(t*3.7+2.9)+0.35*Math.sin(t*6.1), n3=Math.sin(t*37)+Math.sin(t*53+1);
  const a=tb*0.012+sb*0.02, rough=gr*0.0014*calm;
  cam.rotation.x+=n1*a*0.5+n3*(sb*0.004+rough); cam.rotation.y+=n2*a*0.4; cam.rotation.z+=n1*a*0.5-m.gx*0.01*calm;
  if(view==="cockpit"){ const dy=-m.gz*0.035*calm+m.b*0.25+n2*tb*0.012+n3*rough*4, dz=m.gz*0.02*calm; cam.position.y+=dy; cam.position.x+=m.gx*0.04*calm; cam.position.z+=dz*0.0; cam.rotation.x+=m.gz*0.012*calm; }
  else { cam.position.y+=m.b*0.4; }
}
/* cockpit: the window structure (v36: drawn once per size into a cache, then blitted). The glass is a visible pane: pillars with a bevel and a rubber seal, a header with its own seal, the centre post,
   a faint tint / reflection / dirt vignette on the glass itself, the glare shield with the wiper blades parked on it. The numbers (pillar width, header, shield line) are the earlier ones, so every
   layout that avoids the frame keeps working. */
function fgCockpitFrame(W,H,port,a380,hid){
  const cv=document.createElement("canvas"); cv.width=W; cv.height=H; const g=cv.getContext("2d");
  const px=(port?0.065:(a380?0.12:0.105))*(hid?0.62:1), top=H*(port?0.045:0.065), ya=hid?0.925:(port?0.84:0.76), yb=hid?0.945:(port?0.88:0.82), y0=hid?H*0.93:H*(port?0.78:0.7), L=W*px, Lb=W*px*0.45, gc=hid?H*0.895:y0-H*0.075;   /* gc: control point of the shield line */
  const hdY=x=>{ const t=x/W; return top+2*t*(1-t)*top*0.9; };   /* the header's lower edge: sags a little in the middle */
  const shieldY=x=>{ const t=Math.min(1,Math.max(0,(x-Lb)/(W-2*Lb))); return (1-t)*(1-t)*H*ya+2*t*(1-t)*gc+t*t*H*ya; };
  /* the glass: everything between the pillars, under the header, above the shield */
  const glass=()=>{ g.beginPath(); g.moveTo(L,hdY(L)); g.lineTo(Lb,H*ya); g.quadraticCurveTo(W*0.5,gc,W-Lb,H*ya); g.lineTo(W-L,hdY(W-L)); g.quadraticCurveTo(W*0.5,top*1.9,L,hdY(L)); g.closePath(); };
  let gr;
  if(!hid){   /* with the deck hidden the outside view must fill the screen: no tint, streaks or edge darkening on the glass */
  g.save(); glass(); g.clip();
  gr=g.createLinearGradient(0,0,0,H*0.62); gr.addColorStop(0,"rgba(34,66,88,0.30)"); gr.addColorStop(0.35,"rgba(34,66,88,0.08)"); gr.addColorStop(1,"rgba(34,66,88,0)"); g.fillStyle=gr; g.fillRect(0,0,W,H);   /* the tinted band along the top of a windscreen */
  g.fillStyle="rgba(255,255,255,0.045)"; [[0.16,0.1],[0.62,0.07]].forEach(q=>{ g.beginPath(); g.moveTo(W*q[0],0); g.lineTo(W*(q[0]+q[1]),0); g.lineTo(W*(q[0]+q[1]-0.16),H); g.lineTo(W*(q[0]-0.16),H); g.closePath(); g.fill(); });   /* two soft reflection streaks */
  gr=g.createRadialGradient(W*0.5,H*0.42,Math.min(W,H)*0.28,W*0.5,H*0.42,Math.max(W,H)*0.72); gr.addColorStop(0,"rgba(0,0,0,0)"); gr.addColorStop(1,"rgba(2,6,10,0.34)"); g.fillStyle=gr; g.fillRect(0,0,W,H);   /* dirt / edge darkening of thick glass */
  g.restore();
  }
  /* each side: the side window (a sliver of glass at the screen edge), then the pillar: dark structure, a lit bevel on the glass side and a black rubber seal next to the glass */
  const pil=(sg)=>{ const X=x=>sg>0?x:W-x, a=L*0.36;
    g.fillStyle="rgba(58,92,120,0.17)"; g.beginPath(); g.moveTo(X(0),top*0.55); g.lineTo(X(a),top*0.55); g.lineTo(X(a*0.5),H*ya*0.975); g.lineTo(X(0),H*yb*0.99); g.closePath(); g.fill();
    g.strokeStyle="rgba(196,212,228,0.16)"; g.lineWidth=1.4; g.beginPath(); g.moveTo(X(a*0.9),top*0.55); g.lineTo(X(a*0.46),H*ya*0.975); g.stroke();
    gr=g.createLinearGradient(X(a),0,X(L),0); gr.addColorStop(0,"#06080a"); gr.addColorStop(0.7,"#161a20"); gr.addColorStop(1,"#272e37"); g.fillStyle=gr;
    g.beginPath(); g.moveTo(X(a),0); g.lineTo(X(L),0); g.lineTo(X(Lb),H*ya); g.lineTo(X(a*0.5),H*yb); g.closePath(); g.fill();
    g.fillStyle="#04060a"; g.fillRect(sg>0?0:W-W*0.005,0,W*0.005,H);
    g.strokeStyle="rgba(0,0,0,0.8)"; g.lineWidth=Math.max(3.5,W*0.005); g.beginPath(); g.moveTo(X(L),hdY(L)); g.lineTo(X(Lb),H*ya); g.stroke();
    g.strokeStyle="rgba(196,212,228,0.28)"; g.lineWidth=Math.max(1.5,W*0.002); g.beginPath(); g.moveTo(X(L-W*0.005),0); g.lineTo(X(Lb-W*0.004),H*ya); g.stroke(); };
  pil(1); pil(-1);
  /* header (the roof above the windscreen) with a seal along its lower edge */
  gr=g.createLinearGradient(0,0,0,top*1.4); gr.addColorStop(0,"#06080a"); gr.addColorStop(1,"#1b2025"); g.fillStyle=gr; g.fillRect(0,0,W,top); g.beginPath(); g.moveTo(0,top); g.quadraticCurveTo(W*0.5,top*1.9,W,top); g.lineTo(W,0); g.lineTo(0,0); g.fill();
  g.strokeStyle="rgba(0,0,0,0.78)"; g.lineWidth=Math.max(3.5,H*0.007); g.beginPath(); g.moveTo(L,hdY(L)); g.quadraticCurveTo(W*0.5,top*1.9,W-L,hdY(W-L)); g.stroke();
  g.strokeStyle="rgba(196,212,228,0.17)"; g.lineWidth=Math.max(1.2,H*0.003); g.beginPath(); g.moveTo(L,hdY(L)-g.lineWidth*2.4); g.quadraticCurveTo(W*0.5,top*1.9-g.lineWidth*2.4,W-L,hdY(W-L)-g.lineWidth*2.4); g.stroke();
  /* centre post */
  g.fillStyle="#12161a"; g.beginPath(); g.moveTo(W*0.485,0); g.lineTo(W*0.515,0); g.lineTo(W*0.509,H*0.22); g.lineTo(W*0.491,H*0.22); g.closePath(); g.fill();
  g.strokeStyle="rgba(196,212,228,0.22)"; g.lineWidth=1.5; g.beginPath(); g.moveTo(W*0.485,0); g.lineTo(W*0.491,H*0.22); g.stroke(); g.strokeStyle="rgba(0,0,0,0.6)"; g.beginPath(); g.moveTo(W*0.515,0); g.lineTo(W*0.509,H*0.22); g.stroke();
  /* glare shield (with the deck shown it carries the instrument panel silhouette below it; with the deck hidden it is only a slim band) */
  gr=g.createLinearGradient(0,y0-H*0.03,0,H); gr.addColorStop(0,"#1a1f24"); gr.addColorStop(0.08,"#0c0f12"); gr.addColorStop(1,"#05070a");
  g.fillStyle=gr; g.beginPath(); g.moveTo(0,H*yb); g.lineTo(Lb,H*ya); g.quadraticCurveTo(W*0.5,gc,W-Lb,H*ya); g.lineTo(W,H*yb); g.lineTo(W,H); g.lineTo(0,H); g.closePath(); g.fill();
  g.strokeStyle="rgba(190,205,220,0.22)"; g.lineWidth=2; g.beginPath(); g.moveTo(Lb,H*ya); g.quadraticCurveTo(W*0.5,gc,W-Lb,H*ya); g.stroke();
  if(!hid){ g.fillStyle="rgba(120,160,200,0.05)"; g.fillRect(W*0.12,y0-H*0.02,W*0.76,H*0.012); }
  /* the wiper blades parked along the bottom of each half of the windscreen, with their pivots */
  g.lineCap="round"; if(!hid) [[0.2,0.42,-1],[0.58,0.8,1]].forEach(q=>{ const xa=W*q[0], xb=W*q[1], ya_=shieldY(xa)-H*0.012, yb_=shieldY(xb)-H*0.012;
    g.strokeStyle="#090b0d"; g.lineWidth=Math.max(3.5,H*0.011); g.beginPath(); g.moveTo(xa,ya_); g.lineTo(xb,yb_); g.stroke(); g.strokeStyle="rgba(190,205,220,0.22)"; g.lineWidth=1.2; g.beginPath(); g.moveTo(xa,ya_-H*0.004); g.lineTo(xb,yb_-H*0.004); g.stroke();
    const pv=q[2]<0?xa:xb, pvy=q[2]<0?ya_:yb_; g.fillStyle="#1d2227"; g.beginPath(); g.arc(pv,pvy,Math.max(3,H*0.011),0,7); g.fill(); g.strokeStyle="rgba(190,205,220,0.28)"; g.lineWidth=1; g.stroke(); }); g.lineCap="butt";
  return cv;
}
/* (v37) the left side wall of the cockpit, the size of the screen: its right edge meets the left edge of the windscreen frame (the right wall is this one mirrored). A side window with the post between its
   fixed and sliding panes, a sill and side console at the height where the glare shield ends, the rear wall behind it. Drawn once per size; used only while the pilot looks around. */
function fgCockpitSide(W,H,port,a380,hid){
  const cv=document.createElement("canvas"); cv.width=W; cv.height=H; const g=cv.getContext("2d");
  const top=H*(port?0.045:0.065), ya=hid?0.925:(port?0.84:0.76), sill=H*Math.min(ya,0.8), x1=W*0.965, x0=W*(port?0.1:0.2), yt1=top*1.5, yt0=top*(port?2.6:3.4), ys1=sill, ys0=sill-H*0.035;
  let gr=g.createLinearGradient(0,0,W,0); gr.addColorStop(0,"#07090c"); gr.addColorStop(0.75,"#10141a"); gr.addColorStop(1,"#191e25"); g.fillStyle=gr; g.fillRect(0,0,W,H);
  gr=g.createLinearGradient(0,sill-H*0.02,0,H); gr.addColorStop(0,"#1a1f24"); gr.addColorStop(0.1,"#0c0f12"); gr.addColorStop(1,"#05070a"); g.fillStyle=gr; g.fillRect(0,sill,W,H-sill);   /* side console under the sill */
  const win=()=>{ const r=Math.min(W,H)*0.035; g.beginPath(); g.moveTo(x0+r,yt0); g.lineTo(x1-r,yt1); g.quadraticCurveTo(x1,yt1,x1,yt1+r); g.lineTo(x1,ys1-r); g.quadraticCurveTo(x1,ys1,x1-r,ys1); g.lineTo(x0+r,ys0); g.quadraticCurveTo(x0,ys0,x0,ys0-r); g.lineTo(x0,yt0+r); g.quadraticCurveTo(x0,yt0,x0+r,yt0); g.closePath(); };
  g.save(); g.globalCompositeOperation="destination-out"; win(); g.fill(); g.restore();   /* the opening: the outside view shows through */
  g.save(); win(); g.clip(); gr=g.createLinearGradient(0,0,0,H*0.6); gr.addColorStop(0,"rgba(34,66,88,0.26)"); gr.addColorStop(0.4,"rgba(34,66,88,0.06)"); gr.addColorStop(1,"rgba(34,66,88,0)"); g.fillStyle=gr; g.fillRect(0,0,W,H);
  g.fillStyle="rgba(255,255,255,0.04)"; g.beginPath(); g.moveTo(W*0.5,0); g.lineTo(W*0.62,0); g.lineTo(W*0.44,H); g.lineTo(W*0.32,H); g.closePath(); g.fill(); g.restore();
  g.strokeStyle="rgba(0,0,0,0.85)"; g.lineWidth=Math.max(4,W*0.006); win(); g.stroke();   /* rubber seal */
  g.strokeStyle="rgba(196,212,228,0.24)"; g.lineWidth=Math.max(1.5,W*0.002); g.save(); g.translate(0,-Math.max(2,H*0.004)); win(); g.stroke(); g.restore();   /* lit bevel */
  const xp=x0+(x1-x0)*0.46, wp=Math.max(8,W*0.022), ytp=yt0+(yt1-yt0)*0.46, ysp=ys0+(ys1-ys0)*0.46; gr=g.createLinearGradient(xp,0,xp+wp,0); gr.addColorStop(0,"#06080a"); gr.addColorStop(1,"#232a32"); g.fillStyle=gr; g.fillRect(xp,ytp-2,wp,ysp-ytp+4);   /* the post between the two panes */
  g.strokeStyle="rgba(196,212,228,0.22)"; g.lineWidth=1.5; g.beginPath(); g.moveTo(xp+wp,ytp); g.lineTo(xp+wp,ysp); g.stroke();
  return cv;
}
function fgCockpitDraw(g,W,H,dt,s,info){
  const fl=FLY, port=H>W*1.05, a380=fl.key==="a380", ww=fl.W&&fl.W.w, rain=(ww&&ww.rain)||0, sc=fl.W&&fl.W.sunScr, cc=fl.cockpitFx||(fl.cockpitFx={drops:[],t:0});
  const hid=typeof FD!=="undefined"&&!!FD.hide;   /* instrument deck hidden: slimmer pillars down to the bottom edge, no panel silhouette */
  g.save(); const key=W+"x"+H+(port?"p":"l")+(a380?"a":"b")+(hid?"h":"d"); if(!cc.fr||cc.frk!==key){ cc.fr=fgCockpitFrame(W,H,port,a380,hid); cc.sd=null; cc.frk=key; }
  /* (v37) the frame follows the head: turning left slides the windscreen to the right and brings the left side wall with its window into view (mirrored on the right); looking up / down slides it down / up
     over a dark overhead / floor. Wherever the pilot looks, the cockpit structure is in front of the outside view (it used to be see-through off the centre). ppr: pixels per radian of this camera. */
  { const lk=fl.look||{yaw:0,pitch:0}, ppr=(H/2)/Math.tan(((fl.cam&&fl.cam.fov)||72)*Math.PI/360), sx=fl.view==="cockpit"?Math.round(lk.yaw*ppr):0, sy=fl.view==="cockpit"?Math.round(lk.pitch*0.9*ppr):0;
    if(sx||sy){ if(!cc.sd) cc.sd=fgCockpitSide(W,H,port,a380,hid); g.fillStyle="#05070a";
      if(sy>0) g.fillRect(0,0,W,sy+1); else if(sy<0) g.fillRect(0,H+sy-1,W,1-sy);
      if(sx>0){ g.drawImage(cc.sd,sx-W,sy); if(sx>W) g.fillRect(0,0,sx-W+1,H); }
      else if(sx<0){ g.save(); g.translate(sx+2*W,sy); g.scale(-1,1); g.drawImage(cc.sd,0,0); g.restore(); if(sx<-W) g.fillRect(2*W+sx-1,0,-sx-W+1,H); } }
    g.drawImage(cc.fr,sx,sy); }
  const y0=H*(port?0.78:0.7);
  /* sun glare */
  if(sc&&sc.k>0.02){ const x=(sc.x*0.5+0.5)*W, y=(-sc.y*0.5+0.5)*H, r=Math.max(W,H)*0.55; g.globalCompositeOperation="lighter"; const rg=g.createRadialGradient(x,y,0,x,y,r); rg.addColorStop(0,`rgba(255,244,214,${0.55*sc.k})`); rg.addColorStop(0.25,`rgba(255,230,180,${0.22*sc.k})`); rg.addColorStop(1,"rgba(255,220,160,0)"); g.fillStyle=rg; g.fillRect(0,0,W,H); g.globalCompositeOperation="source-over"; }
  /* rain on the windscreen */
  if(rain>0.05&&fl.view==="cockpit"){ const d=cc.drops, spd=Math.min(1,Math.hypot(s.v.x,s.v.z)/120); cc.t+=dt; if(d.length<90*rain&&Math.random()<dt*60*rain) d.push({x:W*(0.08+Math.random()*0.84),y:H*(0.03+Math.random()*0.68),r:1.6+Math.random()*3.2,vx:0,vy:0,a:0});
    g.lineWidth=1; for(let i=d.length-1;i>=0;i--){ const o=d[i]; o.a=Math.min(1,o.a+dt*3); const cx=(o.x-W*0.5)/W; o.vx=cx*60*spd+(Math.random()-0.5)*4; o.vy=-30*spd*(0.4+o.r*0.15); o.x+=o.vx*dt; o.y+=o.vy*dt; o.r-=dt*0.12*(1-spd); if(o.y<-10||o.x<-10||o.x>W+10||o.r<0.7){ d.splice(i,1); continue; }
      g.fillStyle=`rgba(190,210,230,${0.18*o.a})`; g.beginPath(); g.ellipse(o.x,o.y,o.r,o.r*1.25,0,0,7); g.fill(); g.strokeStyle=`rgba(255,255,255,${0.35*o.a})`; g.beginPath(); g.arc(o.x-o.r*0.25,o.y-o.r*0.35,o.r*0.45,3.4,5.4); g.stroke(); if(spd>0.2){ g.strokeStyle=`rgba(210,225,240,${0.12*o.a})`; g.beginPath(); g.moveTo(o.x,o.y); g.lineTo(o.x-o.vx*0.12,o.y-o.vy*0.12); g.stroke(); } } }
  else if(cc.drops.length) cc.drops.length=0;
  g.restore();
}
