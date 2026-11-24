/* ---------- electrical systems simulator: simplified transport-aircraft AC/DC network.
   Teaching model only. It is not the manufacturer's schematic. Logic: generators and external/APU power feed AC bus 1 and AC bus 2; the AC bus tie joins them; TRUs feed DC buses; a DC tie joins those; the battery feeds DC only through the DC tie. ---------- */
const SIMDEF={eng1:true,eng2:true,gen1:true,gen2:true,apu:false,apuGen:true,ext:false,bat:true,btb:"auto",dct:"auto",brk:[true,true,true,true,true]};
const SIM=Object.assign({hide:false,pre:"normal",el:null},SIMDEF,{brk:SIMDEF.brk.slice()});
const SIM_LOADS=[
  {n:"مضخة الوقود",bus:"ac1",a:8},
  {n:"المطبخ",bus:"ac2",a:12},
  {n:"أجهزة الملاحة",bus:"dc1",a:5},
  {n:"المذياع",bus:"dc2",a:3},
  {n:"إضاءة المقصورة",bus:"dc1",a:6}
];
const SIM_BUS={ac1:"AC 1",ac2:"AC 2",dc1:"DC 1",dc2:"DC 2"};
const SIM_PRE={
  normal:{t:"إعادة الضبط",d:"الوضع الطبيعي: المحركان والمولدان يعملان، وناقل الربط على التلقائي، فلا يتدخل إلا عند فقدان حافلة مصدرها.",s:{}},
  eng1:{t:"فشل المحرك 1",d:"توقف المحرك 1 فيفقد مولده الطاقة، فيغذّي ناقل الربط التلقائي AC 1 من مولد 2. جرّب فتح ناقل الربط AC لترى AC 1 يفقد الطاقة.",s:{eng1:false}},
  both:{t:"فشل المحركين",d:"توقف المحركان، فيبقى APU مصدراً للتيار المتردد. يغذّي AC 2 ويصل إلى AC 1 عبر ناقل الربط، وتنقل محوّلات TRU الطاقة إلى DC.",s:{eng1:false,eng2:false,apu:true}},
  bat:{t:"البطارية فقط",d:"لا مصدر AC. تغذّي البطارية حافلات DC عبر ناقل ربط DC وتتفرّغ تدريجياً، وتنطفئ حافلات AC.",s:{eng1:false,eng2:false,ext:false,apu:false}},
  ext:{t:"طاقة خارجية",d:"وضع الأرض قبل تشغيل المحركات: تغذّي الطاقة الخارجية AC 1 مباشرة، ويصل AC 2 عبر ناقل الربط.",s:{eng1:false,eng2:false,ext:true,apu:false}}
};
const SIM_ANN=[["gen1","GEN 1 OFF","warn"],["gen2","GEN 2 OFF","warn"],["apu","APU GEN OFF","warn"],["ext","EXT PWR","ok"],["tie","BUS TIE","info"],["ac1","AC 1 OFF","alarm"],["ac2","AC 2 OFF","alarm"],["dc1","DC 1 OFF","alarm"],["dc2","DC 2 OFF","alarm"],["batd","BAT DISCH","warn"]];

function simCalc(s){
  const g1=s.eng1&&s.gen1, g2=s.eng2&&s.gen2, ext=s.ext, apu=s.apu&&s.apuGen;
  const own1=g1||ext, own2=g2||apu;
  const tie=s.btb==="on"||(s.btb==="auto"&&(!own1||!own2));
  const ac1=tie?(own1||own2):own1, ac2=tie?(own1||own2):own2;
  const dcTie=s.dct==="on"||(s.dct==="auto"&&(!ac1||!ac2));
  const shared=ac1||ac2||s.bat;
  const dc1=ac1||(dcTie&&shared), dc2=ac2||(dcTie&&shared);
  const bus={ac1,ac2,dc1,dc2}, amps={ac1:0,ac2:0,dc1:0,dc2:0};
  const loads=SIM_LOADS.map((L,i)=>{ const on=!!(bus[L.bus]&&s.brk[i]); if(on) amps[L.bus]+=L.a; return {on,powered:!!bus[L.bus],closed:s.brk[i]}; });
  return {g1,g2,ext,apu,own1,own2,tie,ac1,ac2,dcTie,dc1,dc2,bus,amps,loads,
    batFeed:!!(s.bat&&!ac1&&!ac2&&(dc1||dc2)), batCharge:!!(s.bat&&(ac1||ac2))};
}
function simSrc(R,b){
  if(b==="ac1") return !R.ac1?"بلا تغذية":(R.own1?"من "+(R.g1?"مولد 1":"الطاقة الخارجية"):"عبر ناقل الربط من "+(R.g2?"مولد 2":"APU"));
  if(b==="ac2") return !R.ac2?"بلا تغذية":(R.own2?"من "+(R.g2?"مولد 2":"APU"):"عبر ناقل الربط من "+(R.g1?"مولد 1":"الطاقة الخارجية"));
  if(b==="dc1") return !R.dc1?"بلا تغذية":(R.ac1?"من TRU 1":"عبر ناقل ربط DC من "+(R.ac2?"TRU 2":"البطارية"));
  if(b==="dc2") return !R.dc2?"بلا تغذية":(R.ac2?"من TRU 2":"عبر ناقل ربط DC من "+(R.ac1?"TRU 1":"البطارية"));
  return "";
}
function simSentence(R){
  const out=[], dead=[];
  if(!R.ac1) dead.push("AC 1"); if(!R.ac2) dead.push("AC 2"); if(!R.dc1) dead.push("DC 1"); if(!R.dc2) dead.push("DC 2");
  out.push(dead.length?"بلا تغذية: "+dead.join("، ")+".":"كل الحافلات الأربع مُغذّاة.");
  if(R.tie&&(R.ac1||R.ac2)) out.push(R.own1&&R.own2?"ناقل الربط AC مغلق، فيتشارك الناقلان المصدرين.":"ناقل الربط AC مغلق، فيغذّي مصدر واحد الناقلين.");
  else if(R.ac1&&R.ac2) out.push("المصدران يغذّيان ناقليهما بشكل مستقل، وناقل الربط مفتوح.");
  if(R.batFeed) out.push("البطارية هي المصدر الوحيد للـ DC، وشحنتها تنخفض.");
  return out.join(" ");
}
function simPreset(k){
  const p=SIM_PRE[k]; if(!p) return;
  Object.assign(SIM,SIMDEF,p.s,{brk:SIMDEF.brk.slice(),pre:k});
}
function simHTML(){
  const tg=(k,t)=>`<button class="btn tg" type="button" data-k="${k}" aria-pressed="${SIM[k]}">${t}</button>`;
  const seg=(k,l,o)=>`<div class="seg" role="group" aria-label="${l}">${o.map(([v,t])=>`<button type="button" data-tie="${k}" data-v="${v}" aria-pressed="${SIM[k]===v}">${t}</button>`).join("")}</div>`;
  const rd=b=>`<div><span>${SIM_BUS[b]}</span><b id="rv_${b}">—</b><b class="amp" id="ra_${b}">—</b><small id="rs_${b}"></small></div>`;
  return `<div class="sim${SIM.hide?" nolbl":""}">
    <p class="simnote">محاكٍ تعليمي مبسّط لشبكة الكهرباء في طائرة نقل: مولدات ومحركات وAPU وطاقة خارجية وبطارية، وحافلات AC وDC. ليس مخطط الشركة المصنّعة، ولا يُستخدم للتشغيل. القيم تقريبية.</p>
    <div class="simpre" role="group" aria-label="سيناريوهات جاهزة">
      ${Object.keys(SIM_PRE).map(k=>`<button class="btn" type="button" data-pre="${k}" aria-pressed="${SIM.pre===k}">${SIM_PRE[k].t}</button>`).join("")}
      <button class="btn" type="button" data-view="1" id="simLbl">${SIM.hide?"إظهار الأسماء":"إخفاء الأسماء"}</button>
    </div>
    <p class="simdesc" id="simDesc"></p>
    <figure class="simfig">
      <svg viewBox="0 0 360 316" role="img" aria-label="مخطط مبسّط: مولد المحرك 1 والطاقة الخارجية يغذّيان AC 1، ومولد المحرك 2 وAPU يغذّيان AC 2، وناقل الربط يصلهما، وTRU تغذّي DC، والبطارية تصل إلى DC عبر ناقل الربط">
        <line id="w_g1" class="w ac" x1="46" y1="56" x2="46" y2="112"/>
        <line id="w_ext" class="w ac" x1="135" y1="56" x2="135" y2="112"/>
        <line id="w_apu" class="w ac" x1="224" y1="56" x2="224" y2="112"/>
        <line id="w_g2" class="w ac" x1="313" y1="56" x2="313" y2="112"/>
        <rect id="s_g1" class="src f" x="8" y="12" width="76" height="44" rx="8"/>
        <text class="t1" x="46" y="30">GEN 1</text><text id="st_g1" class="t3 lb" x="46" y="46"></text>
        <rect id="s_ext" class="src e" x="97" y="12" width="76" height="44" rx="8"/>
        <text class="t1" x="135" y="30">EXT</text><text id="st_ext" class="t3 lb" x="135" y="46"></text>
        <rect id="s_apu" class="src a" x="186" y="12" width="76" height="44" rx="8"/>
        <text class="t1" x="224" y="30">APU</text><text id="st_apu" class="t3 lb" x="224" y="46"></text>
        <rect id="s_g2" class="src f" x="275" y="12" width="76" height="44" rx="8"/>
        <text class="t1" x="313" y="30">GEN 2</text><text id="st_g2" class="t3 lb" x="313" y="46"></text>
        <rect id="b_ac1" class="bus ac" x="8" y="112" width="158" height="22" rx="4"/>
        <text id="x_ac1" class="tb" x="87" y="127"></text>
        <rect id="b_ac2" class="bus ac" x="194" y="112" width="158" height="22" rx="4"/>
        <text id="x_ac2" class="tb" x="273" y="127"></text>
        <line id="w_tie" class="w ac" x1="166" y1="123" x2="194" y2="123"/>
        <rect id="sw_tie" class="sw" x="173" y="118" width="14" height="10" rx="2"/>
        <text class="t3 lb" x="180" y="107">ربط AC</text>
        <line id="w_t1" class="w ac" x1="46" y1="134" x2="46" y2="166"/>
        <rect id="s_t1" class="src t" x="8" y="166" width="76" height="30" rx="6"/>
        <text class="t2" x="46" y="185">TRU 1</text>
        <line id="w_t2" class="w ac" x1="313" y1="134" x2="313" y2="166"/>
        <rect id="s_t2" class="src t" x="275" y="166" width="76" height="30" rx="6"/>
        <text class="t2" x="313" y="185">TRU 2</text>
        <line id="w_d1" class="w dc" x1="46" y1="196" x2="46" y2="230"/>
        <line id="w_d2" class="w dc" x1="313" y1="196" x2="313" y2="230"/>
        <rect id="b_dc1" class="bus dc" x="8" y="230" width="158" height="22" rx="4"/>
        <text id="x_dc1" class="tb" x="87" y="245"></text>
        <rect id="b_dc2" class="bus dc" x="194" y="230" width="158" height="22" rx="4"/>
        <text id="x_dc2" class="tb" x="273" y="245"></text>
        <line id="w_dt" class="w dc" x1="166" y1="241" x2="194" y2="241"/>
        <rect id="sw_dt" class="sw" x="173" y="236" width="14" height="10" rx="2"/>
        <text class="t3 lb" x="180" y="225">ربط DC</text>
        <line id="w_b" class="w bat" x1="180" y1="272" x2="180" y2="246"/>
        <rect id="s_b" class="src b" x="140" y="272" width="80" height="32" rx="6"/>
        <text class="t2" x="180" y="286">البطارية</text>
        <text id="x_bat" class="t2" x="180" y="299"></text>
      </svg>
    </figure>
    <p class="simsum" id="simSum" aria-live="polite"></p>
    <div class="simrd">${["ac1","ac2","dc1","dc2"].map(rd).join("")}
      <div><span>البطارية</span><b id="rv_bat">—</b><b class="amp" id="ra_bat">—</b><small id="rs_bat"></small></div>
    </div>
    <div class="simann">${SIM_ANN.map(([k,t,c])=>`<span class="ann" id="an_${k}" data-c="${c}">${t}</span>`).join("")}</div>
    <div class="simctl">
      <div class="simgrp"><h4>المصادر</h4><div class="simtg">${tg("eng1","المحرك 1")}${tg("eng2","المحرك 2")}${tg("gen1","مولد 1")}${tg("gen2","مولد 2")}${tg("apu","تشغيل APU")}${tg("apuGen","مولد APU")}${tg("ext","الطاقة الخارجية")}${tg("bat","البطارية")}</div></div>
      <div class="simgrp"><h4>نواقل الربط</h4>
        <p class="status">ناقل الربط AC</p>${seg("btb","ناقل الربط AC",[["auto","تلقائي"],["on","مغلق"],["off","مفتوح"]])}
        <p class="status">ناقل الربط DC</p>${seg("dct","ناقل الربط DC",[["auto","تلقائي"],["on","مغلق"],["off","مفتوح"]])}
      </div>
      <div class="simgrp"><h4>القواطع</h4>
        ${SIM_LOADS.map((L,i)=>`<div class="brk"><span>${L.n}<small>${SIM_BUS[L.bus]} · ${L.a} A</small></span><b id="ld${i}"></b><button class="btn tg" type="button" data-brk="${i}" aria-pressed="${SIM.brk[i]}">قاطع</button></div>`).join("")}
      </div>
    </div>
  </div>`;
}
function simUpdate(){
  const el=SIM.el; if(!el||!el.isConnected) return;
  const R=simCalc(SIM); SIM.R=R;
  const q=id=>el.querySelector("#"+id);
  const txt=(id,v)=>{ const n=q(id); if(n&&n.textContent!==v) n.textContent=v; };
  const cls=(id,base,on,off)=>{ const n=q(id); if(n) n.setAttribute("class",base+" "+(on?"on":(off||""))); };
  const ht=(id,on)=>{ const n=q(id); if(n) n.classList.toggle("on",!!on); };
  // sources
  cls("w_g1","w ac",R.g1); cls("w_ext","w ac",R.ext); cls("w_apu","w ac",R.apu); cls("w_g2","w ac",R.g2);
  cls("s_g1","src f",R.g1); cls("s_g2","src f",R.g2); cls("s_ext","src e",R.ext); cls("s_apu","src a",R.apu);
  txt("st_g1",!SIM.eng1?"المحرك متوقف":(!SIM.gen1?"المولد مفصول":(R.g1?"يغذّي":"بلا طاقة")));
  txt("st_g2",!SIM.eng2?"المحرك متوقف":(!SIM.gen2?"المولد مفصول":(R.g2?"يغذّي":"بلا طاقة")));
  txt("st_ext",R.ext?"متصل":"غير متصل");
  txt("st_apu",!SIM.apu?"متوقف":(!SIM.apuGen?"المولد مفصول":(R.apu?"يغذّي":"بلا طاقة")));
  // AC network
  const acLive=R.ac1||R.ac2;
  cls("w_tie","w ac",R.tie&&acLive); cls("sw_tie","sw",R.tie);
  cls("w_t1","w ac",R.ac1); cls("w_t2","w ac",R.ac2);
  cls("s_t1","src t",R.ac1); cls("s_t2","src t",R.ac2);
  cls("b_ac1","bus ac",R.ac1,"dead"); cls("b_ac2","bus ac",R.ac2,"dead");
  txt("x_ac1","AC 1 · "+(R.ac1?115:0)+" V"); txt("x_ac2","AC 2 · "+(R.ac2?115:0)+" V");
  // DC network
  cls("w_d1","w dc",R.ac1); cls("w_d2","w dc",R.ac2);
  cls("w_dt","w dc",R.dcTie&&(R.dc1||R.dc2)); cls("sw_dt","sw",R.dcTie);
  cls("b_dc1","bus dc",R.dc1,"dead"); cls("b_dc2","bus dc",R.dc2,"dead");
  txt("x_dc1","DC 1 · "+(R.dc1?28:0)+" V"); txt("x_dc2","DC 2 · "+(R.dc2?28:0)+" V");
  // battery
  cls("w_b","w bat",SIM.bat); cls("s_b","src b",SIM.bat);
  txt("x_bat",SIM.bat?"24 V":"مفصولة");
  // readouts
  ["ac1","ac2","dc1","dc2"].forEach(b=>{
    txt("rv_"+b,(R.bus[b]?(b.indexOf("ac")===0?115:28):0)+" V");
    txt("ra_"+b,R.amps[b]+" A");
    txt("rs_"+b,simSrc(R,b));
  });
  txt("rv_bat",(SIM.bat?24:0)+" V"); txt("ra_bat",R.batFeed?"تُفرّغ":(R.batCharge?"تُشحن":(SIM.bat?"جاهزة":"مفصولة")));
  txt("rs_bat",SIM.bat?"":"غير متصلة");
  // annunciators
  const ANN={gen1:!R.g1,gen2:!R.g2,apu:!R.apu,ext:R.ext&&acLive,tie:R.tie&&acLive,ac1:!R.ac1,ac2:!R.ac2,dc1:!R.dc1,dc2:!R.dc2,batd:R.batFeed};
  Object.keys(ANN).forEach(k=>ht("an_"+k,ANN[k]));
  // loads
  SIM_LOADS.forEach((L,i)=>{
    const st=R.loads[i];
    txt("ld"+i,!st.closed?"مفتوح":(st.powered?"مغذّى":"بلا طاقة"));
  });
  // toggles and presets
  el.querySelectorAll("[data-k]").forEach(b=>b.setAttribute("aria-pressed",SIM[b.dataset.k]));
  el.querySelectorAll("[data-tie]").forEach(b=>b.setAttribute("aria-pressed",SIM[b.dataset.tie]===b.dataset.v));
  el.querySelectorAll("[data-pre]").forEach(b=>b.setAttribute("aria-pressed",SIM.pre===b.dataset.pre));
  el.querySelectorAll("[data-brk]").forEach(b=>b.setAttribute("aria-pressed",SIM.brk[+b.dataset.brk]));
  el.classList.toggle("nolbl",SIM.hide);
  txt("simLbl",SIM.hide?"إظهار الأسماء":"إخفاء الأسماء");
  txt("simSum",simSentence(R));
  txt("simDesc",SIM.pre?SIM_PRE[SIM.pre].d:"وضع حر: غيّر المصادر ونواقل الربط والقواطع، وراقب تأثير كل تغيير على الحافلات.");
}
function simMount(root){
  const el=root.querySelector(".sim"); if(!el) return;
  SIM.el=el;
  el.addEventListener("click",e=>{
    const b=e.target.closest("button"); if(!b||!el.contains(b)) return;
    const d=b.dataset;
    if(d.pre) simPreset(d.pre);
    else if(d.k){ SIM[d.k]=!SIM[d.k]; SIM.pre=null; }
    else if(d.tie){ SIM[d.tie]=d.v; SIM.pre=null; }
    else if(d.brk!==undefined){ const i=+d.brk; SIM.brk[i]=!SIM.brk[i]; SIM.pre=null; }
    else if(d.view!==undefined){ SIM.hide=!SIM.hide; }
    else return;
    simUpdate();
  });
  simUpdate();
}
