/* ---------- flight simulator: setup form (tab), full-screen overlay, controls, cameras, coach, landing score ----------
   Physics in p8p.js, world in p8w.js, instruments in p8h.js. The simulator borrows the aircraft model (and its animation machinery) from the
   viewer (GL.lend / GL.pose / GL.restore), so flaps, gear, ailerons, spoilers and the rest move exactly as they do in the viewer. */
const FLY={on:false,paused:false,s:null,W:null,ren:null,cam:null,pivot:null,B:null,key:"a380",view:"cockpit",range:10,raf:0,last:0,acc:0,
  opts:{load:"pax",ac:"a380",apt:"ORBI",scn:"gate",time:"day",wx:"clear",wind:"calm",turb:0,protect:true,assist:true,land:true,hints:true,traffic:true,q:"auto",calm:false,shadow:true},
  keys:{},kb:{p:0,r:0,y:0},stick:{x:0,y:0,on:false},rud:0,brake:false,rev:false,hidden:[],look:{yaw:0,pitch:0,zoom:1},chase:{hdg:0,pit:0,pos:null,init:false},
  msg:"",msgT:0,hint:"",score:null,scoreT:0,coach:{text:"",busy:false,ctl:null},evLog:[],tDom:0,touchSeen:null,crashSeen:null,ro:null,help:false};
const FLY_VIEWS=[["cockpit","القمرة"],["chase","مطاردة"],["wing","الجناح"],["spotter","مراقب"],["orbit","حر"]];
const FLY_SCN=["gate","takeoff","approach","cruise","engineout"];
const FLY_WIND={calm:{ar:"ساكنة",v:[0,0]},xlight:{ar:"جانبية خفيفة (5 م/ث)",v:[-5,0]},xstrong:{ar:"جانبية قوية (11 م/ث)",v:[-11,0]},head:{ar:"أمامية (8 م/ث)",v:[0,8]},tail:{ar:"خلفية (5 م/ث)",v:[0,-5]}};
const FLY_HIDE_COCKPIT=["radome","flightdeck","fuse_fwd","fuse_mid","fuse_aft","fin","stabilizer","elevator","apu"];
/* (v37) cockpit view: the own aircraft is not drawn at all. Only the skin sections above used to be hidden (.visible), so the detailed parts inside the nose (forward pressure bulkhead, weather radar,
   antennas), the nose gear and, looking back, wings and engines without a fuselage still showed: the cockpit looked transparent (the owner's report). From the seat of these three aircraft a pilot sees
   none of the airframe, so every drawable of the aircraft goes to render layer 1 (the camera draws layer 0). A layer, not .visible: the gear and the detail parts own .visible. Lights are not touched
   (landing lights keep lighting the ground). It runs again every second in the cockpit because detail parts are built lazily. */
function flyCockpitHide(){
  const B=FLY.B; if(!B||!B.root||FLY.view!=="cockpit") return;
  B.root.traverse(o=>{ if(!(o.isMesh||o.isLine||o.isPoints||o.isSprite)||o.userData.fhid) return; o.userData.fhid=1; o.layers.set(1); FLY.hidden.push(o); });
}
function flyCockpitShow(){ FLY.hidden.forEach(o=>{ o.layers.set(0); delete o.userData.fhid; }); FLY.hidden=[]; }
/* how far the head turns in the cockpit: to the side window (the frame scrolls with the look, x_fly_fx.js fgCockpitDraw) and no further, a little up and down */
function flyLookLim(){ const cv=FLY.ren&&FLY.ren.domElement, W=(cv&&cv.clientWidth)||800, H=(cv&&cv.clientHeight)||400, ppr=(H/2)/Math.tan(((FLY.cam&&FLY.cam.fov)||72)*Math.PI/360); return {yaw:Math.min(1.6,W/ppr),up:0.5,dn:-0.55,ppr}; }
try{ const o=JSON.parse(localStorage.getItem("atlas-fly-opts")||"null"); if(o) Object.assign(FLY.opts,o); }catch(e){}
const flySaveOpts=()=>{ try{ localStorage.setItem("atlas-fly-opts",JSON.stringify(FLY.opts)); }catch(e){} };
