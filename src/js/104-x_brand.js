/* ===== Birjis brand (prefix bw): the logo mark (bwLogo), the favicon / touch icon, and Bobby's welcome layer ===== */
/* Logo (v36, option 1 "مركز الثقل" of the owner's logo sheet): a Kufic-style Arabic ب (a bar with a cut end and a raised right stem) whose dot is the centre-of-gravity symbol that aircraft engineers draw on every drawing.
   Ink #0E1B2B, safety orange #E7541E, paper #F5F2ED. Vector copies traced from the owner's PDF: data/brand/birjis-*.svg (the same paths are in the constants below). Previous concept (v21, the exploded aircraft on a night-blue tile) is retired. */
const BW={step:"",n:0,el:null,open:false,state:"ask",lang:"ar",pick:false,bob:null,inerts:[],prevFocus:null,tok:0,closeT:0,autoT:0,started:false,replay:false,seen:null};
const bwLS=(k,d)=>{ try{ const v=localStorage.getItem(k); return v===null?d:v; }catch(e){ return d; } };
const bwLW=(k,v)=>{ try{ localStorage.setItem(k,v); }catch(e){} };
const bwSS=(k,v)=>{ try{ if(v===undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k,v); }catch(e){} return null; };
const BW_C={ink:"#0E1B2B",or:"#E7541E",paper:"#F5F2ED"};
const BW_GLYPH="M0 244L89 155H432V0H521V244Z";                                                     /* the ب: 521 x 244 */
const BW_WA="M1001 0H949V90H850V0H797V90H653V242H618V294H706V142H1001ZM0 90V258H178V206H54V142H482V242H403V294H536V90H393V0H340V90H277V0H224V90H161V0H108V90Z";   /* the Arabic wordmark: 1013 x 294 (its dots are the circles below + the centre-of-gravity mark at 975,213) */
const BW_WAD=[[858.5,206.1],[786.9,206.2],[424.5,189.6]];
const BW_WL="M0 125.6L0 0.1L57.8 0.7C101.7 1.1 117 1.5 121.8 2.6C138.5 6.3 150.1 17.6 154.5 34.7C156.7 43.1 156.7 99 154.5 107.4C153.6 110.7 153.1 113.4 153.2 113.5C153.4 113.6 155.5 114.8 157.9 116C168.1 121.1 176.2 131.7 179.5 144.1C181.7 152.1 181.6 209.2 179.5 217.5C175.1 234.4 162.9 245.8 145.2 249.6C139.8 250.7 125.1 251 69.2 251L0 251L0 125.6ZM238 126L238 1L253.5 1L269 1L269 126L269 251L253.5 251L238 251L238 126ZM326 125.6L326 0.2L393.2 0.7C447.2 1.1 461.7 1.4 466.5 2.6C482.4 6.4 493.2 16.5 498.8 32.9C500.8 38.8 501.8 105.7 500 117.3C496.3 141.8 478.4 156 451.3 156C444.9 156 442.9 156.3 443.3 157.2C443.6 157.9 456.6 179.3 472.3 204.8L500.9 251L481.5 251L462.2 251L433 203.5L403.7 156L380.4 156L357 156L357 203.5L357 251L341.5 251L326 251L326 125.6ZM545 235.5L545 220.1L593.2 219.8C637.7 219.5 641.8 219.4 644.8 217.7C651.9 213.9 651.5 220.1 651.8 104.7L652.1 0.9L667.3 1.2L682.5 1.5L682.5 106C682.5 201.9 682.4 211 680.8 216.7C675.8 234.8 664.3 245.7 646.2 249.6C641 250.7 629.1 251 592.2 251L545 251L545 235.5ZM739 126L739 1L754.5 1L770 1L770 126L770 251L754.5 251L739 251L739 126ZM827 235.5L827 220L887.2 220C948 220 953.2 219.7 957.9 216.3C963.7 212 964.5 208.6 964.8 184.4C965.5 139.6 968.3 141.7 908 140.9C859.7 140.3 859.3 140.3 847.8 132.9C831.1 122.2 827 110 827 71C827 31.5 831.5 18.9 849.2 8.3C861 1.2 862.9 1 933.2 1L996 1L996 16.5L996 32L933.7 32L871.4 32L867 34.3C858.9 38.3 858.5 39.8 858.2 68.7C857.9 95.1 858.4 99.7 862.1 104.4C866 109.3 866.9 109.4 912 110.1C964.1 110.8 968.9 111.8 981.6 124.4C993.5 136.4 995.5 144.3 995.5 180.5C995.5 217 993 226.4 980.3 238C966.6 250.5 963.2 251 887.9 251L827 251L827 235.5ZM143.8 217.7C150.1 214.3 150.5 211.9 150.5 180.5C150.5 148.7 150.1 146.8 143.2 143.4C139 141.3 139.5 141.3 72.2 141.8L31 142L31 181L31 220.1L85.8 219.8C136.5 219.5 140.7 219.4 143.8 217.7ZM464.1 122.7C469.3 119.2 469.5 117.4 469.5 78.5C469.5 37.6 469.4 37 462.6 33.9C458.8 32.2 455 32 407.8 32L357 32L357 78.5L357 125.1L409.2 124.8C457.6 124.5 461.7 124.4 464.1 122.7ZM118 108.2C124.6 104.9 125 103.1 125 71C125 28.5 129.7 32 72.8 32L31 32L31 71L31 110L72.8 110C110.5 110 114.8 109.8 118 108.2Z";   /* the Latin wordmark BIRJIS: 995 x 250 */
/* the centre-of-gravity symbol: a disc whose two opposite quarters are cut back to 0.805 of the radius (the quarters left empty show the background) */
function bwCG(cx,cy,r){ const i=+(r*.805).toFixed(2); return `<path fill="${BW_C.or}" fill-rule="evenodd" d="M${cx-r} ${cy}a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 ${-2*r} 0ZM${cx} ${cy}h${i}a${i} ${i} 0 0 0 ${-i} ${-i}ZM${cx} ${cy}h${-i}a${i} ${i} 0 0 0 ${i} ${i}Z"/>`; }
/* the app tile: ink square, paper ب, orange centre of gravity (also the favicon and the home-screen icon) */
function bwLogo(cls){
  return `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"${cls?` class="${cls}"`:""} aria-hidden="true" focusable="false"><rect width="48" height="48" rx="12" fill="${BW_C.ink}"/><g transform="translate(9 9.4) scale(.0576)"><path fill="${BW_C.paper}" d="${BW_GLYPH}"/>${bwCG(259.5,404,105)}</g></svg>`;
}
/* the mark alone (no tile): the glyph follows the text colour */
function bwMark(cls){ return `<svg viewBox="0 0 521 509" xmlns="http://www.w3.org/2000/svg"${cls?` class="${cls}"`:""} aria-hidden="true" focusable="false"><path fill="currentColor" d="${BW_GLYPH}"/>${bwCG(259.5,404,105)}</svg>`; }
/* wordmarks: they follow the text colour; the accessible name is the title */
function bwWord(cls){ return `<svg viewBox="0 0 1013 294" xmlns="http://www.w3.org/2000/svg" class="${cls||"bwWsv"} ar" role="img" focusable="false"><title>بيرجس</title><g fill="currentColor"><path d="${BW_WA}"/>${BW_WAD.map(d=>`<circle cx="${d[0]}" cy="${d[1]}" r="27.5"/>`).join("")}</g>${bwCG(975,213,38)}</svg>`; }
function bwWordLat(cls){ return `<svg viewBox="0 0 995 250" xmlns="http://www.w3.org/2000/svg" class="${cls||"bwWsv"} lat" role="img" focusable="false"><title>Birjis</title><path fill="currentColor" fill-rule="evenodd" d="${BW_WL}"/></svg>`; }
/* home-screen icon for iOS (it ignores SVG touch icons): rasterise the mark once, full-bleed square (iOS rounds the corners itself) */
function bwTouchIcon(){
  try{
    const svg=bwLogo().replace('rx="12"','rx="0"'), im=new Image();
    im.onload=()=>{ try{ const c=document.createElement("canvas"); c.width=c.height=180; c.getContext("2d").drawImage(im,0,0,180,180);
      let l=document.querySelector('link[rel="apple-touch-icon"]'); if(!l){ l=document.createElement("link"); l.rel="apple-touch-icon"; document.head.appendChild(l); } l.href=c.toDataURL("image/png"); }catch(e){} };
    im.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
  }catch(e){}
}
