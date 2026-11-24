/* ---------- Boeing 747-400 look pack (prefix bl): the upper-deck hump with its own narrower cross-section (smooth nacelles: no chevron nozzles on the -400).
   Loaded after m_jb_geo.js (needs GEO.b747). The windscreen layout and the nose lines are in m_jb_geo.js, the wing hardware in m_jc_wing.js.
   Nothing here touches part ids, ANIM, doors, markers or physics. ---------- */
{ const c=GEO.b747;
  /* crown of the main-deck body alone (the hump sits on top of it): follows the nose cone, then runs flat at the main-deck crown */
  c.mtop=[[0,4.2],[0.06,4.45],[0.2,4.7],[0.6,5.05],[1.2,5.45],[2.0,5.85],[3.0,6.3],[4.0,6.75],[5.0,7.15],[6.5,7.65],[8,7.98],[10,8.15],[13,8.2],[58,8.15],[62,7.95],[66,7.6],[70.66,7.25]];
  c.hr=2.5;       /* upper-deck ellipse half-height */
  c.hb=0.62;      /* upper-deck half-width as a fraction of the main-deck half-width */
  /* width factor at ring height s (sin of the ring angle) and station X: the section is the union of the main-deck ellipse and a narrower upper-deck ellipse (p-norm blend = soft shoulder).
     k = target width / width of the full-height ellipse (see secK in p5a.js); 1 where there is no hump */
  c.secF=function(s,X){
    const r=ringAt(c,X), zm=Math.min(r.zt,interp(c.mtop,X)), h=r.zt-zm; if(h<0.004) return 1;
    const z=r.zc+r.hh*s, co=Math.sqrt(Math.max(1-s*s,4e-4)), zcm=(r.zb+zm)/2, hhm=(zm-r.zb)/2, q=(z-zcm)/hhm,
      wm=Math.abs(q)>=1?0:r.hw*Math.sqrt(1-q*q), bw=c.hb*r.hw, hhh=Math.min(c.hr,h+1.0), z0=r.zt-hhh, p=(z-z0)/hhh, wh=Math.abs(p)>=1?0:bw*Math.sqrt(1-p*p),
      w=Math.pow(Math.pow(wm,5)+Math.pow(wh,5),1/5), kk=Math.max(0.05,Math.min(1.35,w/(r.hw*co)));
    return 1+(kk-1)*blSS(0,1.2,h);   /* the hump grows out of the plain ellipse as it rises (no corner where it dies out) */
  };
}
function blSS(a,b,x){ const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); }
