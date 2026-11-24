/* ---------- DL core: data-driven lessons ("DL v1").
   A lesson is plain JSON (see tools/SPEC.md). Expressions are small JS expressions compiled with new Function and evaluated
   against the slider values and the earlier readouts. THIS FILE IS PURE (no DOM, no globals from other files): it is
   concatenated into the page by build.sh and it is also loaded by node (tools/vlesson.js) to validate lessons. ---------- */
const DL_MATH=["sin","cos","tan","asin","acos","atan","atan2","sinh","cosh","tanh","exp","log","log10","log2","sqrt","cbrt","pow","abs","min","max","floor","ceil","round","sign","hypot","PI"];
const DLH={
  g0:9.80665, Rg:287.05, gam:1.4, kt:1.943844, ft:3.28084, nm:1852,
  rad:x=>x*Math.PI/180, deg:x=>x*180/Math.PI, sq:x=>x*x,
  clamp:(v,a,b)=>Math.max(a,Math.min(b,v)), lerp:(a,b,t)=>a+(b-a)*t,
  /* piecewise-linear table lookup, clamped at both ends: tab(x,[[x0,y0],[x1,y1],...]) */
  tab:(x,p)=>{ if(x<=p[0][0]) return p[0][1]; for(let i=1;i<p.length;i++){ if(x<=p[i][0]) return p[i-1][1]+(p[i][1]-p[i-1][1])*(x-p[i-1][0])/(p[i][0]-p[i-1][0]); } return p[p.length-1][1]; },
  /* unit-step response of x''+2 z w x'+w^2 x = w^2 u at time t (z damping ratio, w natural frequency) */
  step2:(z,w,t)=>{ if(t<=0) return 0; if(z<1){ const q=Math.sqrt(1-z*z), wd=w*q; return 1-Math.exp(-z*w*t)*(Math.cos(wd*t)+z/q*Math.sin(wd*t)); }
    if(Math.abs(z-1)<1e-9) return 1-Math.exp(-w*t)*(1+w*t); const s=Math.sqrt(z*z-1), p1=w*(z-s), p2=w*(z+s); return 1-(p2*Math.exp(-p1*t)-p1*Math.exp(-p2*t))/(p2-p1); },
  erf:x=>{ const s=x<0?-1:1; x=Math.abs(x); const t=1/(1+0.3275911*x); return s*(1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x)); },
  fact:n=>{ let r=1; for(let i=2;i<=n;i++) r*=i; return r; },
  /* International Standard Atmosphere, h in metres (0..20000): isa(h).T K, .p Pa, .rho kg/m3, .a m/s, .mu Pa.s */
  isa:h=>{ h=Math.max(0,Math.min(20000,h)); let T,p; if(h<=11000){ T=288.15-0.0065*h; p=101325*Math.pow(T/288.15,5.25588); } else { T=216.65; p=22632.06*Math.exp(-(h-11000)*9.80665/(287.05*216.65)); }
    return {T,p,rho:p/(287.05*T),a:Math.sqrt(1.4*287.05*T),mu:1.458e-6*Math.pow(T,1.5)/(T+110.4)}; }
};
const DLH_NAMES=Object.keys(DLH);
const DL_RESERVED=new Set([...DL_MATH,...DLH_NAMES,"x","y","T","th","H","t"]);
const DL_COLORS=["hyd","power","fuel","ctrl","gear","sys","struct","accent","ink","muted"];
const DL_BANNED_EXPR=/;|\{|\}|=>|`|\b(function|new|eval|window|document|globalThis|this|constructor|prototype|import|fetch|Function|return|var|let|const|while|for|class)\b|\[\s*['"]|(^|[^=!<>])=([^=]|$)/;

/* compile one expression. names = identifiers it may use (slider keys, earlier readout keys, plus T / x / th ...) */
function dlFn(expr,names){
  if(typeof expr==="number") return ()=>expr;
  const src=String(expr);
  if(DL_BANNED_EXPR.test(src)) throw new Error("forbidden token in expression: "+src);
  return new Function(...names,"H",'"use strict";const {'+DL_MATH.join(",")+'}=Math;const {'+DLH_NAMES.join(",")+'}=H;return ('+src+');');
}
/* walk any JSON value: strings that start with "=" become compiled expressions { __e: fn } */
function dlTree(node,names){
  if(typeof node==="string") return node[0]==="="?{__e:dlFn(node.slice(1),names)}:node;
  if(Array.isArray(node)) return node.map(n=>dlTree(n,names));
  if(node&&typeof node==="object"){ const o={}; for(const k in node) o[k]=dlTree(node[k],names); return o; }
  return node;
}
function dlEval(node,args){
  if(node&&typeof node==="object"){
    if(node.__e){ try{ return node.__e(...args,DLH); }catch(e){ return NaN; } }
    if(Array.isArray(node)) return node.map(n=>dlEval(n,args));
    const o={}; for(const k in node) o[k]=dlEval(node[k],args); return o;
  }
  return node;
}
/* text with live values: "{V}" or "{V|1}" (1 decimal) is replaced from the values map */
function dlText(s,vals,nfn){
  if(typeof s!=="string"||s.indexOf("{")<0) return s;
  return s.replace(/\{([A-Za-z][A-Za-z0-9_]*)(?:\|(\d))?\}/g,(m,k,d)=>{ const v=vals[k]; if(v==null) return m; return nfn?nfn(v,d==null?(Math.abs(v)>=100?0:Math.abs(v)>=10?1:2):+d):String(v); });
}

/* compile a whole lesson. Returns the runtime: vars, readouts, plot, scene (all pre-compiled). */
function dlCompile(L){
  const vk=L.vars.map(v=>v.k), ok=[], outs=[];
  L.out.forEach(o=>{ outs.push({k:o.k,ar:o.ar,u:o.u||"",d:o.d==null?2:o.d,f:dlFn(o.e,[...vk,...ok])}); ok.push(o.k); });
  const sceneNames=[...vk,...ok,"T"], sc=L.scene?dlTree(L.scene,sceneNames):null;
  /* polar.r (of th, degrees) and field.f (of x,y) have free variables: they stay raw "=expr" strings (dlEval returns strings unchanged); the scene templates compile them
     themselves with dlFn over Object.keys(S) plus th / x,y. dlTree above already checked them for forbidden tokens. */
  if(sc){ const S0=L.scene; if(S0.t==="polar"&&typeof S0.r==="string"&&S0.r[0]==="=") sc.r=S0.r; else if(S0.t==="field"&&typeof S0.f==="string"&&S0.f[0]==="=") sc.f=S0.f; }
  let plot=null;
  if(L.plot){
    const P=L.plot, isVar=vk.indexOf(P.x)>=0, xn=P.x;
    plot={x:xn,isVar,xr:P.xr||null,log:!!P.xlog,ylog:!!P.ylog,xl:P.xl||"",yl:P.yl||"",yr:P.yr?dlTree(P.yr,[...vk,...ok]):null,
      curves:(P.y||[]).map((c,i)=>({ar:c.ar||"",c:c.c||DL_COLORS[i%4],dash:c.dash?[4,3]:null,f:dlFn(c.e,isVar?[...vk,...ok]:[...vk,...ok,xn])})),
      hl:(P.hl||[]).map(h=>({y:dlTree(h.y,[...vk,...ok]),t:h.t||"",c:h.c||"muted"})),
      vl:(P.vl||[]).map(h=>({x:dlTree(h.x,[...vk,...ok]),t:h.t||"",c:h.c||"muted"})),
      dots:(P.dots||[]).map(d=>({x:dlTree(d.x,[...vk,...ok]),y:dlTree(d.y,[...vk,...ok]),t:d.t||"",c:d.c||"power"}))};
  }
  return {vk,ok,outs,scene:sc,plot,L};
}
/* fill st[out.k] from st[var.k] (in order, so a readout may use earlier readouts) */
function dlCalc(C,st){
  const vals=C.vk.map(k=>st[k]);
  C.outs.forEach(o=>{ let v; try{ v=o.f(...vals,DLH); }catch(e){ v=NaN; } st[o.k]=v; vals.push(v); });
}
function dlArgs(C,st,T){ return [...C.vk.map(k=>st[k]),...C.ok.map(k=>st[k]),T||0]; }
function dlSceneVals(C,st,T){ return dlEval(C.scene,dlArgs(C,st,T)); }
/* values map {key:value} for text templating */
function dlValMap(C,st){ const m={}; C.vk.concat(C.ok).forEach(k=>m[k]=st[k]); return m; }

/* the plot as a kPlot() spec; curve functions re-run the readouts for every sample, so they may use any readout key */
function dlPlot(C,st){
  const p=C.plot; if(!p) return null;
  const vk=C.vk, vals=vk.map(k=>st[k]), base=dlArgs(C,st,0).slice(0,vk.length+C.ok.length);
  const v0=C.L.vars.find(v=>v.k===p.x);
  const xr=p.xr||(v0?[v0.min,v0.max]:[0,1]);
  const at=xv=>{ const vv=vals.slice(); if(p.isVar) vv[vk.indexOf(p.x)]=xv; const all=vv.slice();
    C.outs.forEach(o=>{ let r; try{ r=o.f(...all,DLH); }catch(e){ r=NaN; } all.push(r); }); return all; };
  const fns=p.curves.map(c=>xv=>{ try{ const a=at(xv); return p.isVar?c.f(...a,DLH):c.f(...a,xv,DLH); }catch(e){ return NaN; } });
  let yr;
  const xs=i=>p.log&&xr[0]>0?xr[0]*Math.pow(xr[1]/xr[0],i/60):xr[0]+(xr[1]-xr[0])*i/60;   /* samples are spaced evenly on a log x axis, too */
  if(p.yr){ yr=dlEval(p.yr,base); }
  else { let lo=Infinity,hi=-Infinity; fns.forEach(f=>{ for(let i=0;i<=60;i++){ const y=f(xs(i)); if(isFinite(y)&&(!p.ylog||y>0)){ lo=Math.min(lo,y); hi=Math.max(hi,y); } } });
    if(!isFinite(lo)||!isFinite(hi)){ lo=0; hi=1; } if(!p.ylog){ if(lo>0&&lo<hi*0.5) lo=0; if(hi<0&&hi>lo*0.5) hi=0; const pad=(hi-lo||Math.abs(hi)||1)*0.08; hi+=pad; if(lo!==0) lo-=pad; } else { lo=lo*0.7; hi=hi*1.4; } if(hi-lo<1e-12) hi=lo+1; yr=[lo,hi]; }
  const dots=p.dots.map(d=>({x:dlEval(d.x,base),y:dlEval(d.y,base),t:d.t,c:d.c}));
  if(!dots.length&&p.isVar) p.curves.forEach((c,i)=>{ const x=st[p.x], y=fns[i](x); if(isFinite(y)) dots.push({x,y,c:c.c}); });
  return {x:xr,y:yr,xl:p.xl,yl:p.yl,log:!!p.ylog,xlog:!!p.log,curves:p.curves.map((c,i)=>({f:fns[i],c:c.c,dash:c.dash})),
    hl:p.hl.map(h=>({y:dlEval(h.y,base),t:h.t,c:h.c})),vl:p.vl.map(h=>({x:dlEval(h.x,base),t:h.t,c:h.c})),dots,
    leg:p.curves.length>1?p.curves.map(c=>({c:c.c,t:c.ar,dash:c.dash})).filter(l=>l.t):[]};
}

/* ---- schema of the lesson scenes (single source of truth for the validator and the writers) ----
   type codes: e expression-or-number ("=expr" string or a number) · s text (may hold {key|decimals}) · n plain number · b boolean
   · "a|b|c" enum · trailing ? = optional · ["a", item, min, max] array of item · plain object = nested object */
const DL_SCENE_SPEC={
  bars:{items:["a",{l:"s",v:"e",u:"s?",max:"e?"},1,6],l:"s?"},
  gauge:{v:"e",min:"e",max:"e",u:"s?",l:"s?",d:"n?",zones:["a?",{a:"n",b:"n",c:"ok|warn|bad"},0,4]},
  flow:{w:["a","e",3,6],v:"e?",l:"s?",cont:"b?",dir:"h|v?"},
  beam:{kind:"cant|simple|fixed",defl:"e",load:"e",l:"s?",lab:["a?","s",0,2]},
  foil:{a:"e",m:"e?",p:"n?",th:"e?",flap:"e?",flow:"b?",l:"s?"},
  wing:{b:"e",cr:"e",ct:"e",sw:"e?",l:"s?",hi:"none|tip|root|mac?"},
  circuit:{kind:"series|parallel|rc|rl|source",r:["a","e",1,4],v:"e",i:"e",l:"s?"},
  spring:{m:"e",k:"e",c:"e",x0:"e",l:"s?"},
  tank:{lv:"e",fin:"e",fout:"e",l:"s?",u:"s?"},
  chain:{nodes:["a",{l:"s",v:"e?",u:"s?"},2,7],fb:"b?",l:"s?"},
  polar:{r:"e",rmax:"e",l:"s?",mark:"e?"},
  field:{f:"e",xr:["a","n",2,2],yr:["a","n",2,2],cmap:"heat|diverge?",l:"s?"},
  stack:{layers:["a",{l:"s",th:"e",c:"color?",ang:"e?"},2,8],l:"s?"},
  att:{pitch:"e",roll:"e",hdg:"e?",alt:"e?",spd:"e?"},
  cycle:{pts:["a",{x:"e",y:"e",l:"s?"},3,10],xl:"s?",yl:"s?",smooth:"b?",closed:"b?",fill:"b?",l:"s?"},
  rot:{w:"e",r:"e",n:"n?",vec:"b?",l:"s?"},
  plane:{view:"side|top|front",pitch:"e?",hi:"wing|tail|fin|nose|engine|gear|fuselage|flaps|none?",l:"s?"},
  mohr:{sx:"e",sy:"e",txy:"e",l:"s?"},
  section:{kind:"i|box|tube|rect|circle|z",h:"e",b:"e",tw:"e?",tf:"e?",l:"s?"},
  shock:{M:"e",th:"e",beta:"e?",l:"s?"},
  forces:{body:"plane|box|wing|block",vec:["a",{l:"s",x:"e",y:"e",c:"color?"},1,6],l:"s?"}
};
/* check one value against a schema node; pushes messages into errs */
function dlSchema(v,s,path,errs){
  if(typeof s==="string"){ const opt=s.endsWith("?"), t=opt?s.slice(0,-1):s;
    if(v===undefined||v===null){ if(!opt) errs.push(path+": missing"); return; }
    if(t==="e"){ if(!(typeof v==="number"||(typeof v==="string"&&v[0]==="="))) errs.push(path+": expression must be a number or a string starting with '='"); }
    else if(t==="s"){ if(typeof v!=="string") errs.push(path+": text expected"); }
    else if(t==="n"){ if(typeof v!=="number") errs.push(path+": number expected"); }
    else if(t==="b"){ if(typeof v!=="boolean") errs.push(path+": boolean expected"); }
    else if(t==="color"){ if(DL_COLORS.indexOf(v)<0) errs.push(path+": color must be one of "+DL_COLORS.join("|")); }
    else if(t.indexOf("|")>=0){ if(t.split("|").indexOf(v)<0) errs.push(path+": must be one of "+t); }
    return; }
  if(Array.isArray(s)){ const opt=s[0]==="a?"; if(v===undefined){ if(!opt) errs.push(path+": missing"); return; }
    if(!Array.isArray(v)){ errs.push(path+": array expected"); return; }
    if(v.length<s[2]||v.length>s[3]) errs.push(path+": needs "+s[2]+"-"+s[3]+" items, has "+v.length);
    v.forEach((x,i)=>dlSchema(x,s[1],path+"["+i+"]",errs)); return; }
  if(v===undefined||v===null||typeof v!=="object"||Array.isArray(v)){ errs.push(path+": object expected"); return; }
  for(const k in s) dlSchema(v[k],s[k],path+"."+k,errs);
  for(const k in v) if(!(k in s)&&k!=="t") errs.push(path+"."+k+": unknown key");
}
