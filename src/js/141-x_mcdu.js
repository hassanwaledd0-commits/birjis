/* ---------- وحدة التحكم MCDU/CDU (v35): the control-and-display unit an engineer drives the 3D model with, the same unit for the A380, 747-400 and 737-800.
   Looks like an Airbus MCDU (light-blue case, black screen, green/cyan/white text, six line-select keys each side, function keys, A-Z and number pads).
   Pages: MENU, SYSTEMS (jump to a system on the model), ENG DISASSEMBLY (pull the engine's parts apart on the model, an illustration and not a procedure), ABOUT.
   Every key is a real <button>. Only the keys that do something are enabled; the rest say so. ---------- */
const MC={pg:"menu",n:0,sp:"",msg:"",br:1};
const MC_ENG=[["FAN COWL","eng_fandoor"],["THRUST REV","eng_tr"],["INLET","eng_inlet"],["FAN","eng_fan"],["CORE","eng_core"],["NOZZLE","eng_nozzle"],["BYPASS DUCT","eng_fancowl"],["PYLON","eng_pylon"]];
const MC_SYS=[["HYDRAULIC","hyd"],["ENGINES","engine"],["FUEL","fuel"],["LDG GEAR","gear_main"],["AIR COND","packs"],["FLAPS","flaps"],["AVIONICS","avionics"],["AILERON","aileron"],["APU","apu"],["SPOILERS","spoilers"]];
const MC_AC={a380:"A380",b747:"747-400",b737:"737-800"}, MC_NEXT={a380:"b747",b747:"b737",b737:"a380"};
const MC_ALPHA=["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y"];
const mcL=(txt,col,act,lab)=>({txt:txt||"",col:col||"w",act:act||null,lab:lab||""});
const mcOn=id=>typeof partVisible==="function"?partVisible(id):true;
const mcPulled=id=>S.pull&&S.pull.has(id);
function mcSetPull(id,on){ if(!mcOn(id)) return; if(on) S.pull.add(id); else S.pull.delete(id); }
function mcEngFocus(){ if(typeof GLOK!=="undefined"&&GLOK){ try{ GL.focus(ENG,engXR(),false,[Math.PI-0.55,1.0]); }catch(e){} } }
function mcSync(){ if(typeof GLOK!=="undefined"&&GLOK){ GL.sync(); GL.kick(); } }
function mcPage(){
  const ac=S.ac, st=(on)=>on?mcL("ON","g"):mcL("OFF","w");
  if(MC.pg==="sys"){
    const rows=[]; for(let i=0;i<5;i++){ const a=MC_SYS[i*2], b=MC_SYS[i*2+1];
      const cell=(q,left)=>{ if(!q||!mcOn(q[1])) return mcL(); const on=S.sel===q[1]; return mcL((left?"<":"")+q[0]+(left?"":">"),on?"g":"w",()=>{ if(typeof select==="function") select(q[1]); },PARTS[q[1]]?String(PARTS[q[1]].ata||"").replace(/\s*\/.*$/,""):""); };
      rows.push([cell(a,true),cell(b,false)]); }
    rows.push([mcL("<RETURN","w",()=>{ MC.pg="menu"; }),mcL("CLEAR*","c",()=>{ if(typeof clearSel==="function") clearSel(); })]);
    return {title:"SYSTEMS",pg:"",rows,cap:"اختر نظاماً من القائمة فيتحدد على المجسّم ثلاثي الأبعاد ويقرّب عليه وتظهر بطاقته. السطر الأخضر هو المحدد الآن، و«CLEAR» يلغي التحديد."};
  }
  if(MC.pg==="eng"){
    const pages=2, per=5, base=MC.n*per, items=MC_ENG.slice(base,base+per), rows=[];
    for(let i=0;i<per;i++){ const q=items[i];
      if(!q||!mcOn(q[1])){ rows.push([mcL(),mcL()]); continue; }
      const out=mcPulled(q[1]), act=()=>{ mcSetPull(q[1],!out); mcEngFocus(); mcSync(); };
      rows.push([mcL("<"+q[0],out?"g":"w",act,"STAGE "+(base+i+1)),mcL((out?"OUT":"IN")+">",out?"g":"w",act)]);
    }
    rows.push([mcL("<RETURN","w",()=>{ MC.pg="menu"; MC.n=0; }),mcL(MC.n===0?"ALL OUT*":"RESET*","c",()=>{ MC_ENG.forEach(q=>mcSetPull(q[1],MC.n===0)); mcEngFocus(); mcSync(); })]);
    return {title:"ENG DISASSEMBLY",pg:(MC.n+1)+"/"+pages,rows,sp:{txt:"ILLUSTRATION ONLY",col:"a"},cap:"عرض توضيحي لفصل أجزاء المحرك عن بعضها على المجسّم: كل سطر يسحب جزءاً إلى الخارج (OUT) أو يرجعه (IN). مفتاحا الأسهم يبدّلان الصفحة. هذا ليس إجراء تفكيك حقيقياً ولا ترتيباً معتمداً."};
  }
  if(MC.pg==="about"){
    return {title:"INFO",pg:"",rows:[[mcL("EDUCATIONAL USE","w"),mcL()],[mcL("ONLY","a"),mcL()],[mcL("NOT FOR OPERATIONAL","w"),mcL()],[mcL("OR MAINTENANCE USE","w"),mcL()],[mcL(),mcL()],[mcL("<RETURN","w",()=>{ MC.pg="menu"; }),mcL()]],
      cap:"للاستخدام التعليمي فقط، وليس للتشغيل أو الصيانة. هذه الوحدة نموذج مبسّط لشكل وحدة MCDU وليست محاكاة لبرامجها الحقيقية، وصفحاتها خاصة بهذا الموقع."};
  }
  const xr=!!S.xray, ex=S.exT>0.5;
  return {title:"MCDU MENU",pg:"",rows:[
    [mcL("<SYSTEMS","w",()=>{ MC.pg="sys"; },""),mcL(MC_AC[ac]+">","c",()=>{ if(typeof setAc==="function") setAc(MC_NEXT[ac]); },"AIRCRAFT")],
    [mcL("<ENG DISASSEMBLY","w",()=>{ MC.pg="eng"; MC.n=0; mcEngFocus(); },"NEW"),mcL()],
    [mcL("<X-RAY","w",()=>{ const b=document.getElementById("bXray"); if(b) b.click(); },"VIEW"),st(xr)],
    [mcL("<EXPLODE","w",()=>{ const b=document.getElementById("bExplode"); if(b) b.click(); }),st(ex)],
    [mcL("<RESET VIEW","w",()=>{ const b=document.getElementById("bReset"); if(b) b.click(); }),mcL()],
    [mcL("<INFO","w",()=>{ MC.pg="about"; }),mcL()]],
    cap:"القائمة الرئيسية. «SYSTEMS» يبرز نظاماً على المجسّم، و«ENG DISASSEMBLY» يفكك المحرك أمامك، و«AIRCRAFT» يبدّل الطائرة (A380 ثم 747-400 ثم 737-800)، وبقية الأسطر تتحكم بالأشعة والتفكيك وإعادة الضبط."};
}
function mcPageCount(){ return MC.pg==="eng"?2:1; }
function mcHTML(){
  const P=mcPage(), cell=(c,side)=>`<div class="mcC ${side}"><span class="mcLab">${esc(c.lab)}</span><span class="mcTx ${c.col}">${esc(c.txt)}</span></div>`;
  const lsk=(side)=>P.rows.map((r,i)=>{ const c=r[side==="L"?0:1], on=!!c.act; return `<button type="button" class="mcLsk ${side}" data-lsk="${side}${i+1}" ${on?"":"disabled"} aria-label="${side}${i+1} ${esc(c.txt||"empty")}"><i></i></button>`; }).join("");
  const fn=[["DIR"],["PROG"],["PERF"],["INIT"],["DATA"],[""],["F-PLN"],["RAD|NAV"],["FUEL|PRED"],["SEC|F-PLN"],["ATC|COMM"],["MCDU|MENU","MENU"]];
  const key=(t,k,cls)=>`<button type="button" class="mcK ${cls||""}" data-mck="${esc(k||t)}" ${k||/^[A-Z0-9]$/.test(t)?"":'aria-disabled="true" title="غير مفعّل في هذا النموذج التعليمي"'}>${t.split("|").map(esc).join("<br>")}</button>`;
  const alpha=MC_ALPHA.map(t=>key(t,t,"al")).join("")+key("Z","Z","al")+key("/","/","al")+key("SP","SP","al")+key("OVFY","","al")+key("CLR","CLR","al");
  const num=["1","2","3","4","5","6","7","8","9",".","0","+/-"].map(t=>key(t,t,"nm")).join("");
  const sp=MC.msg?`<span class="a">${esc(MC.msg)}</span>`:(P.sp&&!MC.sp?`<span class="${P.sp.col}">${esc(P.sp.txt)}</span>`:esc(MC.sp));
  return `<section class="mc" aria-label="وحدة التحكم MCDU">
    <div class="mcHd"><h2>وحدة التحكم (MCDU / CDU)</h2><p class="status">وحدة واحدة للطائرات الثلاث (تُسمّى MCDU في A380 وCDU في 737 و747). تتحكم بالمجسّم ثلاثي الأبعاد: اختر نظاماً، أو فكّك المحرك، أو بدّل الطائرة.</p></div>
    <div class="mcUnit" id="mcUnit"><div class="mcCase">
      <div class="mcSlots" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="mcMid"><div class="mcSide">${lsk("L")}</div>
        <div class="mcScr" id="mcScr" dir="ltr" style="--mcbr:${MC.br}" aria-label="MCDU: ${esc(P.title)}"><div class="mcT">${esc(P.title)}${P.pg?`<span class="mcPg">${esc(P.pg)}</span>`:""}</div>
          ${P.rows.map(r=>`<div class="mcR${r[1].txt||r[1].lab?"":" solo"}">${cell(r[0],"l")}${cell(r[1],"r")}</div>`).join("")}<div class="mcSp" id="mcSp">${sp}</div></div>
        <div class="mcSide">${lsk("R")}</div></div>
      <div class="mcFn">${fn.map(([t,k])=>key(t,k,"fn")).join("")}<div class="mcBd"><button type="button" class="mcK fn" data-mck="BRT">BRT</button><button type="button" class="mcK fn" data-mck="DIM">DIM</button></div></div>
      <div class="mcPad"><div class="mcNav">${key("AIR|PORT","","fn")}${key("","","fn")}${key("←","LEFT","ar")}${key("↑","UP","ar")}${key("→","RIGHT","ar")}${key("↓","DOWN","ar")}</div>
        <div class="mcAl">${alpha}</div><div class="mcNm">${num}</div></div>
    </div></div>
    <p class="mcCap status" id="mcCap" aria-live="polite">${esc(P.cap)}</p>
  </section>`;
}
function mcRender(){ const tp=document.getElementById("tp"); if(!tp||S.tab!=="ctl") return; tp.innerHTML=mcHTML(); }
function mcMount(root){
  root.onclick=e=>{
    const l=e.target.closest(".mcLsk"); if(l&&!l.disabled){ const P=mcPage(), r=P.rows[+l.dataset.lsk.slice(1)-1], c=r[l.dataset.lsk[0]==="L"?0:1]; MC.msg=""; if(c.act) c.act(); mcRender(); const f=document.querySelector(`.mcLsk[data-lsk="${l.dataset.lsk}"]`); if(f) f.focus(); return; }
    const k=e.target.closest(".mcK"); if(!k||k.getAttribute("aria-disabled")==="true") return; const v=k.dataset.mck; MC.msg="";
    if(v==="MENU"){ MC.pg="menu"; MC.n=0; }
    else if(v==="LEFT"||v==="UP"){ if(MC.pg==="eng") MC.n=(MC.n+mcPageCount()-1)%mcPageCount(); }
    else if(v==="RIGHT"||v==="DOWN"){ if(MC.pg==="eng") MC.n=(MC.n+1)%mcPageCount(); }
    else if(v==="CLR"){ MC.sp=MC.sp.slice(0,-1); }
    else if(v==="SP"){ if(MC.sp.length<22) MC.sp+=" "; }
    else if(v==="BRT"){ MC.br=Math.min(1.3,MC.br+0.1); }
    else if(v==="DIM"){ MC.br=Math.max(0.5,MC.br-0.1); }
    else if(MC.sp.length<22) MC.sp+=v;
    mcRender(); const f=document.querySelector(`.mcK[data-mck="${v}"]`); if(f) f.focus();
  };
}
