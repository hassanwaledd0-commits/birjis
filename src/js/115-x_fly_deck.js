/* ---------- flight deck: a real instrument panel drawn over the cockpit camera (Airbus and Boeing families) ----------
   Layout, panel art, FCU/MCP and the DOM hit zones live here; the displays are in x_fly_deck2.js (PFD, ND) and x_fly_deck3.js (engines, systems).
   Entry points used by p8f.js (all feature-detected): fdDraw (HUD), fdCamView (camera framing), fdView (view switch). */
const FD_FAMILY={a380:"airbus",b737:"boeing",b747:"boeing"};
const FD_TXT={
  ar:{hide:"إخفاء الأجهزة",show:"إظهار الأجهزة",big:"تكبير الأجهزة",small:"تصغير الأجهزة",back:"رجوع",pfd:"شاشة الطيران الأساسية PFD",nd:"شاشة الملاحة ND",ewd:"شاشة المحركات والتحذيرات",sd:"شاشة الأنظمة",rng:"مدى الخريطة",mode:"نمط الخريطة",page:"الصفحة التالية",
      gear:"ذراع العجلات",flap:"ذراع القلابات",spoil:"ذراع السبويلر",thr:"ذراع الدفع",memoTo:"قبل الإقلاع: راجع القلابات",fcu:"لوحة التحكم بالطيار الآلي",plus:"زيادة",minus:"إنقاص",enl:"تكبير الشاشة"},
  en:{hide:"Hide instruments",show:"Show instruments",big:"Instruments",small:"Compact",back:"Back",pfd:"Primary flight display (PFD)",nd:"Navigation display (ND)",ewd:"Engine and warning display",sd:"Systems display",rng:"Map range",mode:"Map mode",page:"Next page",
      gear:"Gear lever",flap:"Flap lever",spoil:"Speedbrake lever",thr:"Thrust lever",memoTo:"Before takeoff: check flaps",fcu:"Autopilot control panel",plus:"Increase",minus:"Decrease",enl:"Enlarge display"}
};
function fdT(k){ let l="ar"; try{ l=(document.documentElement.lang||"ar").slice(0,2).toLowerCase(); }catch(e){} const t=FD_TXT[l]||FD_TXT.ar; return t[k]!==undefined?t[k]:(FD_TXT.ar[k]!==undefined?FD_TXT.ar[k]:k); }
const fdFam=()=>FD_FAMILY[FLY.key]||"boeing";
const FD={ok:true,big:false,hide:false,hk:"",enl:null,ndMode:null,rng:1,sd:0,ilsOn:false,ils:null,lay:null,key:"",cv:{},bg:null,bgKey:"",root:null,btn:{},st:{ias:0,tr:0,t:0},mt:[],mc:[],e:{n1:[],n2:[],egt:[],ff:[],oilp:[],oilt:[],vib:[]},on:false,famSeen:"",mu:0};
try{ const o=JSON.parse(localStorage.getItem("atlas-fd-opts")||"null"); if(o&&typeof o.big==="boolean") FD.big=o.big; if(o&&typeof o.hide==="boolean") FD.hide=o.hide; }catch(e){}
const fdSave=()=>{ try{ localStorage.setItem("atlas-fd-opts",JSON.stringify({big:FD.big,hide:FD.hide})); }catch(e){} };
const FD_CSS=`.fdlay{position:absolute;inset:0;pointer-events:none}.fdlay[hidden]{display:none}
.fdh{position:absolute;pointer-events:auto;background:transparent;border:0;margin:0;padding:0;border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:none}.fdh:focus-visible{outline:2px solid #4fd8ff;outline-offset:-2px}
.fdh[hidden]{display:none}.fdh.fdz{border-radius:3px}.fdh.fdz:active{background:rgba(255,255,255,.18)}
.fdbig{position:absolute;pointer-events:auto;height:28px;padding:0 12px;border-radius:14px;border:1px solid rgba(255,255,255,.4);background:rgba(8,14,22,.72);color:#fff;font:600 12px/1 inherit;cursor:pointer;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
.fdbig[aria-pressed="true"]{background:var(--accent,#2d7be5);border-color:var(--accent,#2d7be5)}
.fly.fdk:not(.fport) .fcfg{bottom:calc(var(--fdph,160px) + 40px);max-height:calc(100% - var(--fdph,160px) - 40px - max(8px,env(safe-area-inset-top)) - 52px)}
.fdc{position:absolute;pointer-events:auto;padding:0 7px;border-radius:5px;border:1px solid rgba(160,200,230,.5);background:rgba(4,10,16,.78);color:#8fe3ff;font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:700;line-height:1;white-space:nowrap;cursor:pointer;touch-action:none}.fdc[hidden]{display:none}.fdc:active{background:rgba(40,90,130,.9)}
.fly.fdk .fth i{opacity:0}.fly.fdk .fth b{place-items:end center;padding-bottom:4px;font-size:12px}
.fly.fdk .fpad{background:rgba(8,14,22,.3);border-color:rgba(255,255,255,.28)}.fly.fdk .fth{background:rgba(8,14,22,.34);border-color:rgba(255,255,255,.28)}`;
