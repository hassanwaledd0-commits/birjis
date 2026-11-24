/* ---------- smart study tools: my journey (dashboard + daily plan), spaced review of missed quiz questions, glossary, favourites and notes ----------
   Everything is kept in localStorage (always inside try/catch); the page works without it. */
const STO={ get(k,d){ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch(e){ return d; } }, set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} } };
const qN=n=>arCount(n,"سؤال واحد","سؤالان","أسئلة","سؤالاً"), DAY_MS=86400000, SRS_GAPS=[1,3,7,14,30], today=()=>{ const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); };
const STUDY={ fav:new Set(STO.get("atlas-fav",[])), notes:STO.get("atlas-notes",{}), srs:STO.get("atlas-srs",{}), days:STO.get("atlas-days",{}), goal:STO.get("atlas-goal",2) };
const stSave=k=>{ if(k==="fav") STO.set("atlas-fav",[...STUDY.fav]); else if(k==="notes") STO.set("atlas-notes",STUDY.notes); else if(k==="srs") STO.set("atlas-srs",STUDY.srs); else if(k==="days") STO.set("atlas-days",STUDY.days); else STO.set("atlas-goal",STUDY.goal); };
const lessonKey=(b,i)=>"l:"+b+":"+i, partKey=id=>"p:"+id;
function favToggle(k){ if(STUDY.fav.has(k)) STUDY.fav.delete(k); else STUDY.fav.add(k); stSave("fav"); return STUDY.fav.has(k); }
function noteSet(k,t){ t=String(t||"").slice(0,2000); if(t.trim()) STUDY.notes[k]=t; else delete STUDY.notes[k]; stSave("notes"); }
function dayAct(kind){ const d=today(), r=STUDY.days[d]||(STUDY.days[d]={l:0,r:0}); r[kind]=(r[kind]||0)+1; stSave("days"); }
function streak(){ let n=0; const d=new Date(); if(!STUDY.days[today()]) d.setDate(d.getDate()-1);
  for(;;){ const k=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); if(STUDY.days[k]&&(STUDY.days[k].l||STUDY.days[k].r)){ n++; d.setDate(d.getDate()-1); } else break; } return n; }
/* a quiz answer inside a lesson only records mistakes (a right answer right after reading the explanation proves little);
   moving up a box happens only in a review session */
function srsAnswer(book,i,qi,ok){
  if(ok) return; const k=book+":"+i+":"+qi, e=STUDY.srs[k], now=Date.now();
  STUDY.srs[k]={b:0,due:now,w:((e&&e.w)||0)+1,t:now}; stSave("srs");
}
function srsReview(k,ok){
  const e=STUDY.srs[k], now=Date.now(); if(!e){ if(!ok){ const p=k.split(":"); srsAnswer(p[0],+p[1],+p[2],false); } return; }
  if(ok){ const b=Math.min(5,e.b+1); STUDY.srs[k]=Object.assign(e,{b,due:now+(b>=5?60:SRS_GAPS[b-1])*DAY_MS,t:now}); }
  else STUDY.srs[k]=Object.assign(e,{b:0,due:now,w:(e.w||0)+1,t:now});
  stSave("srs");
}
const srsDue=()=>Object.keys(STUDY.srs).filter(k=>STUDY.srs[k].b<5&&STUDY.srs[k].due<=Date.now()&&srsQ(k)).sort((a,b)=>STUDY.srs[a].due-STUDY.srs[b].due);
function srsQ(k){ const p=k.split(":"), l=LESSONS[p[0]]&&LESSONS[p[0]][+p[1]]; return l&&l.quiz&&l.quiz[+p[2]]?{l,q:l.quiz[+p[2]],b:p[0],i:+p[1]}:null; }
const srsOpen=()=>Object.keys(STUDY.srs).filter(k=>STUDY.srs[k].b<5&&srsQ(k));
