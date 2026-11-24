/* ---------- parts library at scale (prefix ui): big search + filters, the modelled main parts as a thumbnail grid, and an ATA browser
   that renders only the open accordion, paginated (<= 50 rows in the DOM). Works with ~1700 parts. ---------- */
const UI_LVN=["","أساسي","متوسط","متقدّم"];
const UI_BK={sys:"Aircraft Systems — Moir & Seabridge",str:"Aircraft Structures for Engineering Students — Megson",afs:"Airframe Structural Design — Niu",eng:"The Jet Engine — Rolls-Royce plc",
  prp:"Aircraft Propulsion — Farokhi",mtc:"Aircraft Maintenance and Repair — Kroes, Watkins & Delp",faa:"FAA Aviation Maintenance Technician Handbooks (Airframe / Powerplant)",
  des:"Aircraft Design: A Conceptual Approach — Raymer",ele:"Aircraft Electricity and Electronics — Eismin",avn:"Introduction to Avionics Systems — Collinson",
  ins:"Aircraft Instruments and Principles — Pallett",itf:"Introduction to Flight — Anderson",lgd:"Aircraft Landing Gear Design: Principles and Practices — Currey"};
/* the 16 ATA groups of tools/pgroups.json (c = colour family, bk = default reference books when a part has no bk of its own) */
const UI_GRP=[
  {id:"ecs",ar:"التكييف والضغط",ata:["21"],c:"sys",bk:["sys","faa","mtc"]},
  {id:"avn",ar:"الطيار الآلي والاتصالات",ata:["22","23"],c:"ctrl",bk:["avn","ins","ele"]},
  {id:"elec",ar:"الكهرباء",ata:["24"],c:"power",bk:["ele","sys","faa"]},
  {id:"cab",ar:"المقصورة والتجهيزات",ata:["25","44","45","46"],c:"struct",bk:["sys","faa","des"]},
  {id:"fire",ar:"الحريق والجليد والمطر",ata:["26","30"],c:"power",bk:["sys","faa","mtc"]},
  {id:"fctl",ar:"أنظمة التحكم بالطيران",ata:["27"],c:"ctrl",bk:["sys","faa","mtc"]},
  {id:"fuel",ar:"الوقود",ata:["28"],c:"fuel",bk:["sys","faa","mtc"]},
  {id:"hyd",ar:"الهيدروليك",ata:["29"],c:"hyd",bk:["sys","faa","mtc"]},
  {id:"ind",ar:"المؤشرات والإضاءة والملاحة",ata:["31","33","34"],c:"sys",bk:["avn","ins","ele"]},
  {id:"lg",ar:"جهاز الهبوط",ata:["32"],c:"gear",bk:["lgd","sys","faa"]},
  {id:"misc",ar:"الأكسجين والهواء المضغوط والمياه",ata:["35","36","38"],c:"sys",bk:["sys","faa","mtc"]},
  {id:"apu",ar:"وحدة الطاقة المساعدة",ata:["49"],c:"power",bk:["sys","eng","faa"]},
  {id:"str1",ar:"هيكل البدن والأبواب والنوافذ",ata:["51","52","53","56"],c:"struct",bk:["str","afs","faa"]},
  {id:"str2",ar:"هيكل الجناح والذيل والأغلفة",ata:["54","55","57"],c:"struct",bk:["str","afs","faa"]},
  {id:"eng1",ar:"المحرك: المروحة والضاغط والاحتراق والتوربين",ata:["71","72","75"],c:"power",bk:["eng","prp","faa"]},
  {id:"eng2",ar:"المحرك: الوقود والتحكم والزيت والعادم",ata:["73","74","76","77","78","79","80"],c:"power",bk:["eng","prp","faa"]},
  {id:"oth",ar:"أخرى",ata:[],c:"struct",bk:["sys","faa","mtc"]}];
const UI_CHX={"44":"أنظمة المقصورة","46":"أنظمة المعلومات","31":"أنظمة العرض والتسجيل","33":"الأضواء","34":"الملاحة"};
const UI_PAGE=50;
/* library state (kept while you move between tabs) */
const UIP={q:"",sys:"",lv:0,here:true,int:false,fav:false,par:"",mode:"home",grp:"",ch:"",pg:0};
let UIX=null, uiT=0;

const uiShort=k=>(SYS[k]?SYS[k].ar:k).replace(/\s*\(.*$/,"");
function uiChName(ch){ try{ const m=ATA_CH.find(a=>a[0]===ch); if(m) return m[1].replace(/\s*\(.*$/,""); }catch(e){} return UI_CHX[ch]||""; }
const uiGrpOf=id=>UI_GRP.find(g=>g.id===id)||UI_GRP[UI_GRP.length-1];
/* one flat index over PARTS: normalised search fields, ATA chapter, group, level; rebuilt only when the number of parts changes */
function uiIndex(){
  const ks=Object.keys(PARTS);
  if(UIX&&UIX.n===ks.length) return UIX;
  const chg={}; UI_GRP.forEach(g=>g.ata.forEach(a=>{ chg[a]=g.id; }));
  const list=ks.map(id=>{ const p=PARTS[id], m=(p.ata||"").match(/\d+/), ch=m?m[0]:"";
    return {id, ch, g:chg[ch]||"oth", lv:p.lv||(p.parent?2:1), main:!p.parent, a:arNorm(p.ar+" "+(p.short||"")), e:(p.en||"").toLowerCase(), t:(p.ata||"").toLowerCase(),
      c:arNorm((p.comps||[]).map(c=>c[0]+" "+c[1]).join(" ")), s:arNorm(p.sum||"")}; });
  const by=Object.create(null); list.forEach(r=>{ by[r.id]=r; });
  const sorted={}; UI_GRP.forEach(g=>{ sorted[g.id]=list.filter(r=>r.g===g.id).sort((x,y)=>(+x.ch||0)-(+y.ch||0)||(y.main-x.main)||x.lv-y.lv||PARTS[x.id].ar.localeCompare(PARTS[y.id].ar,"ar")); });
  UIX={n:ks.length, list, by, sorted};
  return UIX;
}
const uiActive=()=>!!(UIP.q||UIP.sys||UIP.lv||UIP.int||UIP.fav||UIP.par);
function uiPass(r){
  const p=PARTS[r.id];
  if(UIP.here && !partVisible(r.id)) return false;
  if(UIP.sys && p.sys!==UIP.sys) return false;
  if(UIP.lv && r.lv!==UIP.lv) return false;
  if(UIP.int && !(p.int||INT_ONLY.has(r.id))) return false;
  if(UIP.fav && !STUDY.fav.has(partKey(r.id))) return false;
  if(UIP.par && p.parent!==UIP.par && r.id!==UIP.par) return false;
  return true;
}
const uiToks=q=>arNorm(q).split(/[\s،,]+/).filter(Boolean);
/* every token must match somewhere; the name counts most, then the English name, ATA, components and the summary */
function uiScore(r,toks){
  let tot=0;
  for(const t of toks){ let s=0;
    if(r.a.startsWith(t)) s=100; else if(r.a.indexOf(" "+t)>=0) s=90; else if(r.a.indexOf(t)>=0) s=70;
    else if(r.e.startsWith(t)) s=85; else if(r.e.indexOf(" "+t)>=0) s=75; else if(r.e.indexOf(t)>=0) s=55;
    else if(r.t.indexOf(t)>=0) s=45; else if(r.c.indexOf(t)>=0) s=30; else if(r.s.indexOf(t)>=0) s=12;
    if(!s) return 0; tot+=s; }
  return tot+(r.main?15:0);
}
/* results for the current query and filters, best first */
function uiResults(){
  const ix=uiIndex(), toks=UIP.q?uiToks(UIP.q):null, out=[];
  for(const r of ix.list){ if(!uiPass(r)) continue; if(toks){ const s=uiScore(r,toks); if(s) out.push([s,r]); } else out.push([0,r]); }
  if(toks) out.sort((a,b)=>b[0]-a[0]);
  else out.sort((a,b)=>(b[1].main-a[1].main)||UI_GRP.findIndex(g=>g.id===a[1].g)-UI_GRP.findIndex(g=>g.id===b[1].g)||(+a[1].ch||0)-(+b[1].ch||0)||a[1].lv-b[1].lv);
  return out.map(x=>x[1]);
}
/* highlight: an Arabic-aware pattern (alef forms, ya/alef-maqsura, ta-marbuta/ha, optional diacritics) over the already escaped text */
const uiRxC={"ا":"[اأإآٱ]","أ":"[اأإآٱ]","إ":"[اأإآٱ]","آ":"[اأإآٱ]","ه":"[هة]","ة":"[هة]","ي":"[يى]","ى":"[يى]","و":"[وؤ]","ؤ":"[وؤ]","ئ":"[يئ]"};
function uiRx(toks){
  if(!toks||!toks.length) return null;
  const parts=toks.map(t=>[...t].map(ch=>(uiRxC[ch]||ch.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"))+"[\\u064B-\\u0652\\u0640]*").join(""));
  try{ return new RegExp("("+parts.join("|")+")","gi"); }catch(e){ return null; }
}
const uiHl=(t,rx)=>{ const e=esc(t); return rx?e.replace(rx,'<mark class="uiHl">$1</mark>'):e; };
