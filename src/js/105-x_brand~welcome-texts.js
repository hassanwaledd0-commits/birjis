/* ---------- welcome texts ({ar,en} pairs) ---------- */
const BW_UI={
  start:{ar:"ابدأ مع ميسلون",en:"Start with Maysaloon"}, enter:{ar:"ادخل إلى بيرجس",en:"Enter Birjis"}, skip:{ar:"تخطّي",en:"Skip"},
  tag:{ar:"طائرات تفاعلية ثلاثية الأبعاد",en:"Interactive 3D aircraft"}, dlg:{ar:"ترحيب من ميسلون",en:"Welcome from Maysaloon"}, lang:{ar:"اللغة",en:"Language"},
  replay:{ar:"أعد ترحيب ميسلون",en:"Replay Maysaloon's welcome"}
};
const BW_HI={ m:{ar:"صباح الخير",en:"Good morning"}, a:{ar:"هلا بيك",en:"Good afternoon"}, e:{ar:"مساء الخير",en:"Good evening"}, n:{ar:"هلا بيك، سهرانين",en:"Hello, night owl"} };
const BW_MSG={   /* v18: Maysaloon talks like the owner (friendly Iraqi), short sentences */
  first:{ar:h=>`${h}! آني ميسلون، مهندسك ببيرجس. هنا تفكك الطيارة قطعة قطعة، وتتعلم من الدروس، وتجرب تطير بنفسك. يلا نبدي!`,
         en:h=>`${h}! I'm Maysaloon, your engineer at Birjis. Here you can take an aircraft apart piece by piece, learn from the lessons, and try flying yourself. Let's go!`},
  back:{ar:(h,n,s)=>`${h}، نوّرت من جديد! خلّصت ${typeof arCount==="function"?arCount(n,"درس واحد","درسين","دروس","درس"):n+" دروس"}${s>1?`، وصارلك ${typeof arCount==="function"?arCount(s,"يوم واحد","يومين","أيام","يوم"):s+" أيام"} ورا بعض`:""}. نكمل من وين ما وكفنا؟`,
        en:(h,n,s)=>`${h}, welcome back! You've finished ${n} lesson${n>1?"s":""}${s>1?` and you're on a ${s}-day streak`:""}. Shall we pick up where we left off?`},
  again:{ar:h=>`${h}، نوّرت من جديد! ميسلون وياك: اختار قطعة نكتشفها سوه، أو ابدي بدرس قصير.`,
         en:h=>`${h}, welcome back! Maysaloon here: pick a part to explore together, or start with a short lesson.`}
};
const bwHour=()=>{ const h=new Date().getHours(); return h>=5&&h<12?"m":h>=12&&h<17?"a":h>=17&&h<21?"e":"n"; };
const bwT=(k,l)=>BW_UI[k][l||BW.lang];
function bwStats(){ let n=0,s=0; try{ if(typeof totalDone==="function") n=totalDone()|0; }catch(e){} try{ if(typeof streak==="function") s=streak()|0; }catch(e){} return {n,s}; }
function bwText(l){
  l=l||BW.lang; let h=BW_HI[bwHour()][l]; try{ if(typeof myHelloText==="function") h=myHelloText(l,h); }catch(e){}   /* known visitors are greeted by name and field */
  const st=bwStats(), seen=BW.seen!==null?BW.seen:(bwLS("bw-seen","")==="1"||bwLS("atlas-bob-seen","")==="1");
  if(st.n>0) return BW_MSG.back[l](h,st.n,st.s);
  return seen?BW_MSG.again[l](h):BW_MSG.first[l](h);
}
function bwLang(){
  try{ if(typeof ilLang==="function"){ const l=ilLang(); if(l==="en"||l==="ar") return l; } }catch(e){}
  return /^en/i.test(document.documentElement.lang||"")?"en":"ar";
}
const bwReduced=()=>{ try{ return matchMedia("(prefers-reduced-motion:reduce)").matches; }catch(e){ return false; } };
