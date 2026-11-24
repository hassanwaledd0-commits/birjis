/* ---------- DL runtime: data lessons ("DL v1", see tools/SPEC.md) and data parts.
   gen_lessons.js / gen_parts.js (written by tools/mkdata.js) run BEFORE this file, so everything they call is a hoisted function
   declaration and all state lives in `var`s that are created lazily (no top-level const/class here: they would still be in their TDZ).
   Books are registered as light stubs {id,ar,en,lv,ch,min,_dl:true}; the raw JSON of a book is parsed once, only when one of its lessons is opened
   (or when the search index needs it), and a lesson is compiled in place on first use: the stub then owns the same fields as a hand-written lesson
   (intro, alt, ctl, ro, calc, draw, eq, note, quiz, show, ref ...). Until then the heavy fields are prototype accessors that compile on demand,
   so any code that touches a stub (review, tutor, favourites) works without knowing about data lessons. ---------- */
var DL_GROUPS, DLR_DBG, dlrBooks, dlrKeep, dlrWarmT;
function dlrDbg(){ return DLR_DBG||(DLR_DBG={err:[],strict:false}); }
function dlrErr(id,e){ const d=dlrDbg(); if(d.err.length<300) d.err.push({id,msg:String(e&&e.message||e)}); try{ console.error("DL "+id,e); }catch(x){} }
function dlrB(){ return dlrBooks||(dlrBooks={}); }
function dlrEsc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function dlSetGroups(g){ DL_GROUPS=Object.assign(DL_GROUPS||{},g); }

/* ---- raw deflate (RFC 1951) decoder: books are stored deflated + base64 by tools/mkdata.js (the page stays far below the size limit and the
   two-byte string of ~10 MB of Arabic JSON never exists). src Uint8Array -> Uint8Array of exactly n bytes. Table driven, ~100 MB/s. ---- */
function dlrInflate(src,n){
  const out=new Uint8Array(n); let sp=0,op=0,bb=0,bc=0;
  const LB=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258], LE=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],
    DB=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577], DE=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],
    CO=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
  const bits=k=>{ while(bc<k){ bb|=src[sp++]<<bc; bc+=8; } const v=bb&((1<<k)-1); bb>>>=k; bc-=k; return v; };
  /* canonical Huffman table indexed by the next mx bits (LSB first): entry = length<<16 | symbol */
  const mk=(L,m)=>{ let mx=1; const cnt=new Uint16Array(16); for(let i=0;i<m;i++){ cnt[L[i]]++; if(L[i]>mx) mx=L[i]; } cnt[0]=0;
    const nx=new Uint16Array(16); let c=0; for(let b=1;b<16;b++){ c=(c+cnt[b-1])<<1; nx[b]=c; }
    const sz=1<<mx, T=new Int32Array(sz);
    for(let s=0;s<m;s++){ const l=L[s]; if(!l) continue; let c2=nx[l]++, r=0; for(let k=0;k<l;k++){ r=(r<<1)|(c2&1); c2>>=1; } for(let j=r;j<sz;j+=1<<l) T[j]=(l<<16)|s; }
    return {T,mx}; };
  const dec=H=>{ const mx=H.mx; while(bc<mx){ bb|=src[sp++]<<bc; bc+=8; } const e=H.T[bb&((1<<mx)-1)], l=e>>>16; if(!l) throw new Error("inflate: bad code"); bb>>>=l; bc-=l; return e&65535; };
  let fixed=null, fin=0;
  while(!fin){
    fin=bits(1); const ty=bits(2);
    if(ty===0){
      const drop=bc&7; bb>>>=drop; bc-=drop; sp-=bc>>3; bb=0; bc=0;           /* back to the byte boundary, give back prefetched bytes */
      const len=src[sp]|(src[sp+1]<<8); sp+=4; if(sp+len>src.length||op+len>n) throw new Error("inflate: bad stored block");
      out.set(src.subarray(sp,sp+len),op); op+=len; sp+=len;
    } else if(ty===1||ty===2){
      let LT,DT;
      if(ty===1){ if(!fixed){ const a=new Uint8Array(288); for(let i=0;i<288;i++) a[i]=i<144?8:i<256?9:i<280?7:8; fixed=[mk(a,288),mk(new Uint8Array(30).fill(5),30)]; } LT=fixed[0]; DT=fixed[1]; }
      else {
        const hl=bits(5)+257, hd=bits(5)+1, hc=bits(4)+4, cl=new Uint8Array(19); for(let i=0;i<hc;i++) cl[CO[i]]=bits(3);
        const CT=mk(cl,19), lens=new Uint8Array(hl+hd); let i=0;
        while(i<hl+hd){ const s=dec(CT); if(s<16) lens[i++]=s; else { let r,v=0; if(s===16){ if(!i) throw new Error("inflate: bad lengths"); v=lens[i-1]; r=3+bits(2); } else if(s===17) r=3+bits(3); else r=11+bits(7); while(r--) lens[i++]=v; } }
        LT=mk(lens.subarray(0,hl),hl); DT=mk(lens.subarray(hl),hd);
      }
      for(;;){
        let s=dec(LT);
        if(s<256){ out[op++]=s; }
        else if(s===256) break;
        else { s-=257; if(s>=29) throw new Error("inflate: bad length"); const len=LB[s]+bits(LE[s]), ds=dec(DT); if(ds>=30) throw new Error("inflate: bad distance"); const d=DB[ds]+bits(DE[ds]); if(d>op) throw new Error("inflate: distance too far");
          for(let k=0;k<len;k++){ out[op]=out[op-d]; op++; } }
      }
    } else throw new Error("inflate: bad block type");
  }
  if(op!==n) throw new Error("inflate: size mismatch "+op+"/"+n);
  return out;
}
function dlrUnz(b64,n){ const bin=atob(b64), L=bin.length, src=new Uint8Array(L); for(let i=0;i<L;i++) src[i]=bin.charCodeAt(i); return new TextDecoder("utf-8").decode(dlrInflate(src,n)); }

/* ---- book registry ---- */
/* idx row: [id, ar, en, lv, ch, min]. Heavy fields are prototype accessors that compile the lesson on demand (see the header comment). */
function DlrStub(r,b,i){ this.id=r[0]; this.ar=r[1]; this.en=r[2]; this.lv=r[3]; this.ch=r[4]; this.min=r[5]; this._dl=true; this._b=b; this._i=i; }
["intro","alt","ctl","tog","pre","act","onSet","calc","draw","ro","eq","note","quiz","show","ref","init","step"].forEach(k=>Object.defineProperty(DlrStub.prototype,k,{configurable:true,
  get(){ dlrEnsureObj(this); return Object.prototype.hasOwnProperty.call(this,k)?this[k]:undefined; },
  set(v){ Object.defineProperty(this,k,{value:v,writable:true,enumerable:true,configurable:true}); }}));
/* dlRegisterBook({id,ar,en,grp,n,chapters:[ar...],refs,idx:[[id,ar,en,lv,ch,min],...], raw:"<JSON text of the lessons array>" | z:"<base64 raw deflate of that text>", zn:<its byte length>}) */
function dlRegisterBook(b){
  if(!b||!b.id) return;
  const id=b.id; if(LBOOK[id]&&!LBOOK[id].dl){ console.error("dlRegisterBook: '"+id+"' is a hand-written book"); return; }
  const rows=b.idx||[];
  dlrB()[id]={raw:b.raw==null?null:b.raw,z:b.z==null?null:b.z,zn:b.zn|0,arr:null,sidx:null};
  LBOOK[id]={ar:b.ar||id,en:b.en||"",au:"",grp:b.grp||"base",dl:true,refs:b.refs||"",chapters:b.chapters||[],n:b.n||rows.length};
  LESSONS[id]=rows.map((r,i)=>new DlrStub(r,id,i));
  try{ LIDXC=null; }catch(e){}
  dlrHeader();
}
function dlStats(){ let books=0,lessons=0,dlBooks=0,dlLessons=0; Object.keys(LESSONS).forEach(k=>{ const n=LESSONS[k].length; if(!n) return; books++; lessons+=n; if(LBOOK[k]&&LBOOK[k].dl){ dlBooks++; dlLessons+=n; } }); return {books,lessons,dlBooks,dlLessons}; }
/* "274 درساً من 14 كتاباً" in the header: only the two numbers change */
function dlrHeader(){ try{ const el=document.querySelector(".brand .sub"); if(!el) return; const s=dlStats(); el.textContent=el.textContent.replace(/\d+(\s*درس\S*\s+من\s+)\d+/,s.lessons+"$1"+s.books); }catch(e){} }
/* the lesson groups shown by the old book list: the two hand-written ones, then the data groups that have a book */
function dlrGroups(){ const g=[["ref","دروس مبنية على كتب مرجعية"],["app","مسارات تطبيقية للطيار والمهندس"]];
  try{ Object.keys(DL_GROUPS||{}).forEach(k=>{ if(Object.keys(LBOOK).some(b=>LBOOK[b].grp===k&&LESSONS[b]&&LESSONS[b].length)) g.push([k,DL_GROUPS[k]]); }); }catch(e){} return g; }

/* parsed lessons array of a book; the last 3 books used stay cached (temp: parse without caching, for the search index) */
function dlrArr(id,temp){
  const bk=dlrB()[id]; if(!bk) return [];
  if(bk.arr){ const k=dlrKeep; if(!temp&&k&&k[k.length-1]!==id){ const j=k.indexOf(id); if(j>=0){ k.splice(j,1); k.push(id); } } return bk.arr; }
  let a=null; try{ const txt=bk.raw!=null?bk.raw:bk.z!=null?dlrUnz(bk.z,bk.zn):""; a=txt?JSON.parse(txt):[]; }catch(e){ dlrErr(id,e); }
  if(!Array.isArray(a)) a=[];
  if(!temp){ bk.arr=a; const k=dlrKeep||(dlrKeep=[]), j=k.indexOf(id); if(j>=0) k.splice(j,1); k.push(id); while(k.length>3){ const o=k.shift(); if(dlrBooks[o]&&o!==id) dlrBooks[o].arr=null; } }
  return a;
}
function dlrLesson(arr,s){ const L=arr[s._i]; return L&&L.id===s.id?L:(arr.find(x=>x&&x.id===s.id)||null); }

/* ---- compile a stub in place ---- */
function dlEnsure(b,i){ const s=LESSONS[b]&&LESSONS[b][i]; if(s&&s._dl) dlrEnsureObj(s); return s; }
function dlrEnsureObj(s){
  if(s._ok||s._busy) return s; s._busy=true;
  let f;
  try{ const L=dlrLesson(dlrArr(s._b),s); f=L?dlrBuild(s,L):dlrBroken(s,"محتوى هذا الدرس غير متاح بعد."); }
  catch(e){ dlrErr(s.id,e); f=dlrBroken(s,"تعذّر تحميل هذا الدرس."); }
  for(const k in f) Object.defineProperty(s,k,{value:f[k],writable:true,enumerable:true,configurable:true});
  s._ok=true; s._busy=false; return s;
}
function dlrBroken(s,msg){
  return {intro:[dlrEsc(msg)],alt:dlrEsc(s.ar),ctl:[],tog:undefined,pre:undefined,act:undefined,onSet:undefined,calc(){},draw(g,W,H,st,Cc){ ltx(g,"لا يوجد رسم لهذا الدرس",W/2,H/2,{c:Cc.muted,s:13,rtl:true}); },
    ro:()=>[],eq:[],note:[],quiz:[],show:undefined,ref:"",init:undefined,step:undefined};
}
/* deterministic shuffle: the same lesson always shows its answers in the same order */
function dlrHash(s){ let h=2166136261>>>0; for(let i=0;i<s.length;i++) h=Math.imul(h^s.charCodeAt(i),16777619)>>>0; return h; }
function dlrRng(seed){ return ()=>{ seed=(seed+0x6D2B79F5)>>>0; let t=Math.imul(seed^(seed>>>15),1|seed); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
function dlrQuiz(id,quiz){
  const E=dlrEsc, qs=quiz.map((q,qi)=>{ const r=dlrRng(dlrHash(id+":"+qi)), t=[0,1,2];
    for(let i=2;i>0;i--){ const j=Math.floor(r()*(i+1)); const x=t[i]; t[i]=t[j]; t[j]=x; }
    const src=[q.ok,q.bad[0],q.bad[1]]; return {q:E(q.q),o:t.map(k=>E(src[k])),a:t.indexOf(0),why:E(q.why)}; });
  if(qs.length>1&&qs.every(q=>q.a===qs[0].a)){ const q=qs[qs.length-1]; q.o=[q.o[2],q.o[0],q.o[1]]; q.a=(q.a+1)%3; }   /* never the same position for every answer */
  return qs;
}
function dlrDec(step){ const t=String(step), m=/e-(\d+)$/.exec(t); if(m) return Math.min(6,+m[1]); const i=t.indexOf("."); return i<0?0:Math.min(6,t.length-i-1); }
function dlrPlot(K,st){
  const sp=dlPlot(K,st); if(!sp) return null;
  const xlog=!!K.plot.log, N=160;
  let a=sp.x[0], b=sp.x[1]; if(xlog){ a=Math.max(a,1e-9); if(b<=a) b=a*1.01; }
  const la=xlog?Math.log10(a):a, lb=xlog?Math.log10(b):b, tr=xlog?v=>Math.log10(Math.max(v,1e-300)):v=>v;
  /* every curve is sampled once per spec (the readouts are re-run for each sample, too slow to repeat 60 times a second) */
  const curves=sp.curves.map(c=>{ const f=c.f; let tab=null;
    return {c:c.c,dash:c.dash,n:N,f:u=>{ if(!tab){ tab=new Float64Array(N+1); for(let i=0;i<=N;i++){ const v=la+(lb-la)*i/N; tab[i]=f(xlog?Math.pow(10,v):v); } }
      const i=Math.round((u-la)/(lb-la)*N); return i>=0&&i<=N?tab[i]:NaN; }}; });
  const o={x:[la,lb],y:sp.y,xl:sp.xl,yl:sp.yl,log:!!K.plot.ylog,curves,hl:sp.hl,vl:sp.vl.map(v=>({x:tr(v.x),t:v.t,c:v.c})),dots:sp.dots.map(d=>({x:tr(d.x),y:d.y,t:d.t,c:d.c})),leg:sp.leg};
  if(xlog){ const t=[]; for(let e=Math.ceil(la-1e-9);e<=Math.floor(lb+1e-9);e++){ t.push(e+0); } if(t.length<3){ [2,5].forEach(m=>{ for(let e=Math.floor(la)-1;e<=Math.ceil(lb);e++){ const v=Math.log10(m)+e; if(v>=la-1e-9&&v<=lb+1e-9) t.push(v); } }); t.sort((x,y)=>x-y); }
    o.xt=t; o.xf=v=>kFmt(Math.pow(10,v)); }
  return o;
}
/* scene fallback (also used while a template is missing): horizontal bars */
function dlrBars(g,r,p,S,Cc){
  const it=(p.items||[]).filter(i=>isFinite(i.v)); if(!it.length) return;
  let mx=0; it.forEach(i=>{ mx=Math.max(mx,isFinite(i.max)&&i.max>0?i.max:Math.abs(i.v)); }); mx=mx||1;
  const n=it.length, top=r.y+(p.l?26:14), rh=Math.min(58,(r.y+r.h-top-2)/n), w=r.w-24;
  if(p.l) ltx(g,dlText(p.l,S,nf),r.x+r.w/2,r.y+12,{c:Cc.muted,s:11,rtl:true});
  g.save(); g.font="400 11px "+LF;
  it.forEach((i,k)=>{ const y=top+k*rh+rh*0.45, a=Math.abs(i.v), lab=dlText(i.l,S,nf), val=nf(i.v,a>=100?0:a>=10?1:2)+(i.u?" "+i.u:""), one=g.measureText(lab).width+g.measureText(val).width+24<w;
    kBar(g,r.x+12,y,w,10,a/(isFinite(i.max)&&i.max>0?i.max:mx),["hyd","power","fuel","ctrl"][k%4],Cc,null);
    ltx(g,lab,r.x+r.w-12,y-9,{c:Cc.ink,s:11,a:"right",rtl:true});
    ltx(g,val,one?r.x+12:r.x+r.w-12,one?y-9:y+19,{c:Cc.muted,s:11,a:one?"left":"right",m:true}); });
  g.restore();
}
function dlrBuild(s,L){
  const K=dlCompile(L), E=dlrEsc, id=s.id;
  const ctl=L.vars.map(v=>{ const d=dlrDec(v.step), u=v.u||"", sp=(u==="°"||u==="%")?"":" "; return {k:v.k,ar:E(v.ar),min:v.min,max:v.max,step:v.step,v:v.v,f:x=>nf(x,d)+(u?sp+u:"")}; });
  const outs=K.outs.map(o=>({k:o.k,ar:E(o.ar),u:E(o.u),d:o.d}));
  const sceneStr=L.scene?JSON.stringify(L.scene):"", useT=/"=([^"]*[^\w.$])?T(?![\w$])/.test(sceneStr);   /* scene expressions that use the animation clock */
  const D={sv:-1,sp:null,pv:-1,pl:null,S:{},bad:false,def:null};
  const Sx=(st,T)=>{ const S=D.S; K.vk.forEach(k=>{ S[k]=st[k]; }); K.ok.forEach(k=>{ S[k]=st[k]; }); S.T=T; return S; };
  const defScene=st=>({t:"bars",items:K.outs.slice(0,4).map(o=>({l:o.ar,v:st[o.k],u:o.u}))});
  const dbars=(g,sr,st,T,Cc)=>{ if(!D.def||D.dv!==(st._dv|0)){ D.def=defScene(st); D.dv=st._dv|0; } dlrBars(g,sr,D.def,Sx(st,T),Cc); };
  return {
    intro:L.intro.map(E), alt:E(L.alt||s.ar), ctl, tog:undefined, pre:undefined, act:undefined, onSet:undefined,
    calc(st){ dlCalc(K,st); st._dv=(st._dv|0)+1; },
    ro(st){ return outs.map(o=>[o.ar,nf(st[o.k],o.d)+(o.u?" "+o.u:"")]); },
    draw(g,W,H,st,Cc){
      const hasP=!!K.plot, narrow=W<560, pw=hasP?0.42:0, T=st.t||0, dbg=dlrDbg();
      const sr={x:W*0.02,y:H*0.04,w:W*(1-pw)-W*0.04,h:H*0.92};
      g.save(); if(hasP){ g.beginPath(); g.rect(0,0,W*(1-pw)+(narrow?6:14),H); g.clip(); }
      try{
        let fn=null; if(K.scene&&!D.bad){ try{ fn=typeof DL_SCENES!=="undefined"&&DL_SCENES?DL_SCENES[K.scene.t]:null; }catch(e){ fn=null; } }
        if(fn){
          const v=st._dv|0; let p; if(useT) p=dlSceneVals(K,st,T); else { if(D.sv!==v||!D.sp){ D.sp=dlSceneVals(K,st,0); D.sv=v; } p=D.sp; }
          fn(g,sr,Sx(st,T),Cc,p,T);
        } else dbars(g,sr,st,T,Cc);
      }catch(e){ if(dbg.strict){ g.restore(); throw e; } D.bad=true; dlrErr(id,e); }
      g.restore();
      if(hasP){
        try{ const v=st._dv|0; if(D.pv!==v){ D.pv=v; D.pl=null; D.pl=dlrPlot(K,st); }
          if(D.pl) kPlot(g,{x:W*(1-pw)+(narrow?24:46),y:H*0.12,w:W*pw-(narrow?40:58),h:H*0.68},D.pl,Cc); }
        catch(e){ if(dbg.strict) throw e; if(!D.pbad){ D.pbad=true; dlrErr(id,e); } }
      }
    },
    eq:L.eq.map(E), note:L.note.map(E), quiz:dlrQuiz(id,L.quiz),
    show:L.show?{ar:E(L.show.ar),fn:()=>lrnSel(L.show.id,L.show.anim)}:undefined,
    ref:E(L.ref||""), init:undefined, step:undefined, _dlc:K
  };
}

/* ---- search: the index of a book is built from its parsed JSON (never from compiled lessons) ---- */
function dlrSidx(id){
  const bk=dlrB()[id]; if(!bk) return []; if(bk.sidx) return bk.sidx;
  const arr=dlrArr(id,true), ch=(LBOOK[id]&&LBOOK[id].chapters)||[];
  bk.sidx=(LESSONS[id]||[]).map(s=>{ const L=dlrLesson(arr,s)||{}; return {t:arNorm(s.ar+" "+s.en),x:arNorm((L.intro||[]).join(" ")+" "+(L.alt||"")+" "+(L.ref||"")+" "+(ch[s.ch-1]||""))}; });
  return bk.sidx;
}
function dlIdxEntry(b,i){ const e=dlrSidx(b)[i]; return {b,i,t:e?e.t:"",x:e?e.x:""}; }
/* build the index of one book per idle slice, so the first search finds it ready */
function dlWarm(){
  if(dlrWarmT) return; const ids=Object.keys(dlrB()).filter(k=>!dlrB()[k].sidx); if(!ids.length) return;
  const run=()=>{ dlrWarmT=0; const k=Object.keys(dlrB()).find(k=>!dlrB()[k].sidx); if(!k) return; try{ dlrSidx(k); }catch(e){ dlrErr(k,e); dlrB()[k].sidx=[]; } dlWarm(); };
  dlrWarmT=(typeof requestIdleCallback==="function")?requestIdleCallback(run,{timeout:1500}):setTimeout(run,60);
}

/* ---- data parts: same record shape as subParts() in p2g.js; ids that exist already, and records whose parent or system is unknown, are skipped ---- */
function partsAddData(list){
  const sk=partsAddData.skipped||(partsAddData.skipped=[]); let n=0;
  (list||[]).forEach(r=>{
    if(!r||!r.id||!r.ar||!r.par){ sk.push([r&&r.id,"incomplete"]); return; }
    if(PARTS[r.id]){ sk.push([r.id,"exists"]); return; }
    if(!PARTS[r.par]){ sk.push([r.id,"unknown parent "+r.par]); return; }
    if(!SYS[r.sys]){ sk.push([r.id,"unknown system "+r.sys]); return; }
    const o={short:r.ar.replace(/\s*\(.*$/,""),thumb:r.par,ar:r.ar,en:r.en||"",ata:/^ATA/.test(r.ata)?r.ata:"ATA "+(r.ata==null?"":r.ata),sys:r.sys,parent:r.par,loc:r.loc,sum:r.sum||"",comps:r.comps||[],fast:r.fast||[],insp:r.insp||[],lv:r.lv||2,bk:r.bk||""};
    if(r.only) o.only=r.only; if(r.int) o.int=true;
    PARTS[r.id]=o; n++;
  });
  return n;
}

/* ---- start-up (everything above that gen_*.js needs is already usable) ---- */
(function(){
  const d={base:"الأساسيات",aero:"الديناميكا الهوائية",prop:"الدفع والمحركات",struct:"الهياكل والمواد",sys:"الأنظمة والإلكترونيات",design:"التصميم والأداء والتحكم",ops:"الصيانة والسلامة والعمليات",future:"آفاق وتخصصات"};
  DL_GROUPS=Object.assign(d,DL_GROUPS||{});
  dlrHeader();
  try{ document.addEventListener("focusin",e=>{ if(e.target&&e.target.id==="lQ") dlWarm(); }); }catch(e){}
})();
