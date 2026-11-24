/* ---------- Boeing 747-400: geometry (schematic, overall dimensions approximate; prefix jb / jc) ----------
   Same parametric model as the other two aircraft (see p3.js / p5a.js / p5f.js): the fuselage is a stack of elliptical rings from the `top` / `bot` side-view
   contours, so the upper-deck hump is a taller ring (see m_jbl_look.js); wing, tails, nacelles and gear are positioned from these fields.
   Public 747-400 figures: length 70.66 m, span 64.44 m (with the 1.83 m canted winglets), height 19.41 m, fuselage width 6.5 m, wing area ~525 m2, quarter-chord sweep 37.5 deg.
   Everything the owner may want to fine-tune from reference photos is in the tunable table jcT below (metres from the nose tip / height above the ground / half-spans).
   Loaded right after p5g.js, before every builder runs (all builders only read GEO when called). */
const jcT={
  L:70.66, span:64.44, H:19.41, fw:6.5,
  nose:9.6, nosP:1.6,                 /* plan nose length and its superellipse exponent (< 2 = more pointed than an ellipse) */
  rad:2.1, fd:9.6, tail:55,            /* radome ends, flight-deck section ends, tail cone starts */
  crown:8.2, belly:2.05, hump:10.42,   /* main-deck crown height, belly height, top of the upper-deck hump */
  wle:18.9, sw:41.7, tipY:31.22, tipEnd:32.22, rc:16.6, tc:3.2, kinkY:8.4,   /* wing: leading edge at the y=1.14 chord line, LE sweep, tip, root/tip chord, trailing-edge kink (Yehudi) station */
  wz:[3.3,5.3], th:[2.0,0.42], wl:[2.4,0.9,1.83],                          /* wing height root/tip, thickness root/tip, winglet [LE shift, tip chord, height] */
  eng:[11.8,21.1], engZ:[2.1,2.65], engD:2.9, fanR:1.18, ef:2.9, eb:3.0,    /* engines: lateral stations, axis heights, nacelle diameter, fan radius, length ahead of / behind the wing LE */
  hLE:57.9, hrc:9.3, htc:2.9, hsw:42, hY:11.0, htZ:5.6, hdih:7,            /* horizontal tail */
  fin:[[54.1,8.2],[67.0,19.41],[70.55,19.41],[66.2,7.5]],   /* (v36) planform from the reference: LE swept ~50°, TE raked aft; top stays at the real 19.41 m */
  ng:[12.4], nwR:0.52, wheelR:0.62, mg:[[5.55,36.3,4,1.6],[2.15,40.1,4,1.6]], axl:[-0.74,0.74]   /* gear: nose station, wheel radii, [lateral, station, bogie length, -] per leg, axle offsets of the 4-wheel bogie */
};
GEO.b747={ L:jcT.L, span:jcT.span, H:jcT.H, fw:jcT.fw, nose:jcT.nose, nosP:jcT.nosP, tail:jcT.tail, rad:jcT.rad, fd:jcT.fd, wle:jcT.wle, rc:jcT.rc, tc:jcT.tc, sw:jcT.sw, tipY:jcT.tipY, tipEnd:jcT.tipEnd,
  eng:jcT.eng, ew:3.2, ef:jcT.ef, eb:jcT.eb,
  hLE:jcT.hLE, hrc:jcT.hrc, htc:jcT.htc, hsw:jcT.hsw, hY:jcT.hY, finX0:54, finX1:69.9,
  ng:jcT.ng, mg:jcT.mg, apuX:69.6, axl:jcT.axl,
  zb:jcT.belly, zt:jcT.hump, win:[[6.2,64,6.15],[11,25.8,8.75]], doors:[9.5,19.5,40.8,48.4,55.0], hdoors:[3.4,5.2,2.4],
  wheelR:jcT.wheelR, nwR:jcT.nwR, wz:jcT.wz, engZ:jcT.engZ, engD:jcT.engD, fanR:jcT.fanR, scaleM:10,
  top:[[0,4.2],[40,jcT.crown],[58,8.15],[62,7.95],[66,7.6],[70.66,7.25]],
  bot:[[0,4.0],[8,2.2],[12,jcT.belly],[50,jcT.belly],[54,2.4],[58,3.2],[62,4.2],[66,5.3],[70.66,6.4]],
  fin:jcT.fin, htZ:jcT.htZ,
  th:jcT.th, hth:[0.85,0.22], fth:[1.1,0.25], wl:jcT.wl, hdih:jcT.hdih, fairing:[18.5,41.0,0.42], dorsal:[50.2,56.2,0.9] };
/* wing chord: the trailing edge is straight (swept ~26 deg) outboard of the kink and runs straight across (zero sweep) inboard of it: the 747's Yehudi extension gives the long root chord */
GEO.b747.chF=y=>{ const c=GEO.b747, Y0=c.fw/2*0.35, tn=Math.tan(c.sw*Math.PI/180), ck=c.rc-(jcT.kinkY-Y0)*tn;
  return y<=jcT.kinkY?c.rc-(y-Y0)*tn:ck+(c.tc-ck)*(y-jcT.kinkY)/(c.tipY-jcT.kinkY); };
/* door list (stations from the nose, approximate): 5 main-deck doors per side, one upper-deck door per side, cargo doors on the right (forward, aft, bulk) */
GEO.b747.doorList=[
  ...[9.5,19.5,40.8,48.4,55.0].map((X,i)=>({X,z:5.95,w:1.07,h:1.93,deck:"main",side:"both",kind:"slide",win:true,n:"M"+(i+1)})),
  {X:14.8,z:9.1,w:0.9,h:1.5,deck:"upper",side:"both",kind:"slide",win:true,n:"U1"},
  {X:22.4,z:3.3,w:2.7,h:1.7,deck:"cargo",side:"R",kind:"hatch",n:"FWD CARGO"},
  {X:45.0,z:3.3,w:2.7,h:1.7,deck:"cargo",side:"R",kind:"hatch",n:"AFT CARGO"},
  {X:52.4,z:3.6,w:0.95,h:1.1,deck:"cargo",side:"R",kind:"hatch",n:"BULK"}];
GEO.b747.winRows=[{x0:6.2,x1:64,z:6.15,deck:"main"},{x0:11,x1:25.8,z:8.75,deck:"upper"}]; GEO.b747.winSz={w:0.25,h:0.35,pitch:0.508,band:0.5};
/* nose lines: radome with a mild droop, the windscreens in the steep part (~40 deg) at the front of the hump, the crest just behind them, then the long gentle slope of the (stretched) upper deck
   down into the main-deck crown (top: one smooth monotone curve) */
GEO.b747.top=wsHead(GEO.b747.top,[[0,4.2],[0.06,4.45],[0.2,4.7],[0.6,5.05],[1.2,5.45],[2.0,5.85],[3.0,6.3],[4.0,6.75],[5.0,7.25],[5.8,7.9],[6.6,8.6],[7.4,9.25],[8.4,9.85],[9.6,10.22],[11,10.4],[12.5,jcT.hump],
  [16,10.38],[20,10.15],[24,9.7],[28,9.05],[32,8.5],[36,8.24],[40,jcT.crown]]);
GEO.b747.bot=wsHead(GEO.b747.bot,[[0,4.0],[0.06,3.85],[0.2,3.7],[0.6,3.42],[1.2,3.12],[2.2,2.78],[3.6,2.46],[6,2.22],[9,2.1],[12,jcT.belly]]);
/* windscreen: centre pane with its post, a corner pane (both seen from the front) and a side pane (outline coordinates as in p5f.js: f = [lateral x, height], s = [station X, height]) */
GEO.b747.wsP=[
  {m:"f",q:[[0.07,7.96],[0.64,7.92],[0.64,8.42],[0.07,8.52]],r:0.05,fw:0.024},
  {m:"f",q:[[0.72,7.92],[1.3,7.88],[1.3,8.3],[0.72,8.4]],r:0.05,fw:0.024},
  {m:"s",q:[[6.45,7.88],[7.7,7.92],[7.7,8.3],[7.1,8.36]],r:0.05,fw:0.024}];
GEO.b747.wsHull=null;
GEO.b747.wsFront=GEO.b747.wsP[0].q; GEO.b747.wsSide=[GEO.b747.wsP[2].q];
