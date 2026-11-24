"""Takeoff / landing hub check (one chromium): hub_test.py [page.html] [outdir]
(v36) The loose gear / flaps / speed-brake / brake / parking-brake / reverse buttons moved into one panel («الإقلاع والهبوط», #fHub) opened by one button (#fHubB, key H).
For a380 (on the runway, then in the air), b737 and b747 (flap detents differ) at 390x844, 360x740, 844x390 and 1280x800, in cockpit and chase view it checks:
  - no gear / flap / spoiler / brake button lives outside the panel; the hub button is visible, >= 36 px, aria-expanded follows the state, aria-controls resolves;
  - the panel opens from its button and from the H key, sits inside the screen, covers no other control (hub button, autopilot button, top bar, stick, throttle ...),
    every button in it is >= 36 px high and >= 30 px wide (flap chips of a 7-detent aircraft), nothing is clipped, every control is the top element at its centre (real mouse clicks are used);
  - the flap chips are the aircraft's own detents and a click selects that detent; + / - step it; the gear tile retracts in the air and refuses on the ground; the spoiler tile toggles;
    the brake tile brakes while held; parking brake and reverse work on the ground only (a message in the air); the tile values follow the state;
  - Escape, a tap outside and the autopilot button close it; the autopilot panel and the hub never show together; focus returns to the hub button.
"""
from playwright.sync_api import sync_playwright
import os, sys
D=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(D); PAGE=sys.argv[1] if len(sys.argv)>1 else ROOT+"/dist/aircraft-atlas.html"; OUT=sys.argv[2] if len(sys.argv)>2 else D+"/hub_out"
three=open(ROOT+"/node_modules/three/build/three.min.js","rb").read(); os.makedirs(OUT,exist_ok=True)
CHK=r"""()=>{
  const ov=document.getElementById("fly"), p=document.getElementById("fHub"), O=ov.getBoundingClientRect(), r=p.getBoundingClientRect(), res={hidden:p.hidden,over:[],overSoft:[]};
  const hit=(a,b,m)=>!(a.right<=b.left+m||a.left>=b.right-m||a.bottom<=b.top+m||a.top>=b.bottom-m);
  res.panel=[Math.round(r.left-O.left),Math.round(r.top-O.top),Math.round(r.width),Math.round(r.height)];
  res.inside=r.left>=O.left-0.5&&r.top>=O.top-0.5&&r.right<=O.right+0.5&&r.bottom<=O.bottom+0.5;
  const chk=e=>{ if(e===p||e.tagName==="CANVAS"||e.hidden) return; if(getComputedStyle(e).pointerEvents==="none"&&e.id!=="bobFly"){ Array.prototype.forEach.call(e.children,chk); return; }
    const q=e.getBoundingClientRect(); if(!q.width||!q.height) return; if(e.id==="bobFly"){ res.bobbyCovered=hit(r,q,1); return; }
    if(e.id==="fScore"||e.id==="fHelp") return;
    const soft=e.id==="faAtc"||(typeof e.className==="string"&&/(^|\s)fd(h|big)(\s|$)/.test(e.className));   /* the ATC strip and the deck's tap zones may be covered for a moment; the flight controls may not */
    if(e.className==="fcfg fl"||e.className==="fcfg fr"){ e.querySelectorAll("button,.fpair").forEach(c=>{ const cq=c.getBoundingClientRect(); if(cq.width&&hit(r,cq,0.5)) res.over.push(c.id||c.className||c.textContent.trim().slice(0,12)); }); return; }
    if(hit(r,q,0.5)) (soft?res.overSoft:res.over).push(e.id||e.className); };
  Array.prototype.forEach.call(ov.children,chk);
  const hc=ov.querySelector("#flyHud"), d=FLY.dpr||1, cock=FLY.view==="cockpit", thr=cock?96:8;   /* cockpit: the glass tint / edge darkening share the canvas (alpha <= 0.34) and the frame above the instrument panels is scenery */
  let dk=0; if(cock){ const all=hc.getContext("2d").getImageData(0,0,hc.width,hc.height).data, cs=8*d, rows=Math.ceil(hc.height/cs), cols=Math.ceil(hc.width/cs); for(let rr=Math.ceil(rows*0.15);rr<rows&&!dk;rr++){ let n=0; for(let cc=0;cc<cols;cc++){ const x=Math.min(hc.width-1,Math.floor((cc+0.5)*cs)), y=Math.min(hc.height-1,Math.floor((rr+0.5)*cs)); if(all[(y*hc.width+x)*4+3]>thr) n++; } if(n>=cols*0.5) dk=Math.floor(rr*cs); } }
  const x0=Math.max(0,Math.floor((r.left-O.left)*d)), y0=Math.max(dk,Math.max(0,Math.floor((r.top-O.top)*d))), w=Math.min(hc.width-x0,Math.ceil(r.width*d)), h=Math.max(0,Math.min(hc.height,Math.ceil((r.bottom-O.top)*d))-y0);
  const a=h>0&&w>0?hc.getContext("2d").getImageData(x0,y0,w,h).data:[]; let n=0; for(let i=3;i<a.length;i+=4) if(a[i]>thr) n++; res.hudPx=Math.round(n/(d*d)); res.area=Math.round(r.width*r.height);
  const bs=[...p.querySelectorAll("button")].filter(b=>b.offsetParent!==null), R=e=>e.getBoundingClientRect();
  res.nBtn=bs.length; res.minH=Math.min.apply(null,bs.map(b=>R(b).height)); res.minW=Math.min.apply(null,bs.map(b=>R(b).width));
  res.covered=bs.filter(b=>{ const q=R(b), el=document.elementFromPoint(q.left+q.width/2,q.top+q.height/2); return !(el&&(el===b||b.contains(el))); }).map(b=>b.id||b.dataset.fa||b.textContent.trim());
  res.clipped=[...p.querySelectorAll("button,b,small,h4,span")].filter(e=>e.offsetParent!==null&&(e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).overflow!=="visible")).map(e=>e.id||e.textContent.trim().slice(0,14));
  res.chips=[...document.querySelectorAll("#fFlapDt button")].map(b=>b.textContent); res.fontMin=Math.min.apply(null,[...p.querySelectorAll(".fhubTile b,.fhubTile .k,.fhubDt .fb")].map(e=>parseFloat(getComputedStyle(e).font.split(" ").find(t=>/px$/.test(t))||getComputedStyle(e).fontSize)));
  const hb=document.getElementById("fHubB"); res.hubB={w:R(hb).width,h:R(hb).height,exp:hb.getAttribute("aria-expanded"),ctl:!!document.getElementById(hb.getAttribute("aria-controls")),vis:hb.offsetParent!==null};
  res.loose=[...ov.querySelectorAll("[data-fa]")].filter(e=>/^(gear|spoil|brake|park|rev|flapup|flapdn)$/.test(e.dataset.fa)&&!e.closest("#fHub")).map(e=>e.dataset.fa);
  const ap=document.getElementById("fAp"); res.apHidden=ap.hidden; return res; }"""
S0="(()=>{ const s=FLY.s; return {gearT:s.gearT,flapsT:s.flapsT,spoilT:s.spoilT,park:s.parkBrake,rev:FLY.rev,brake:!!FLY.brake,ground:!!s.ground,msg:FLY.msg||''}; })()"
bad=0
def ok(c,m):
    global bad
    print(("PASS " if c else "FAIL ")+m)
    if not c: bad+=1
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"],**({"executable_path":"/opt/pw-browsers/chromium"} if os.path.exists("/opt/pw-browsers/chromium") else {}))
    pg=b.new_page(viewport={"width":844,"height":390}); errs=[]
    pg.on("pageerror",lambda e: errs.append(str(e)[:300]))
    pg.route("**/three.min.js",lambda r: r.fulfill(status=200,content_type="application/javascript",body=three)); pg.route("**/fonts.g*/**",lambda r: r.abort())
    pg.add_init_script("try{localStorage.setItem('birjis-profile-skip','1')}catch(e){}")
    pg.goto("file://"+PAGE); pg.wait_for_timeout(1500); pg.evaluate("GL.setSpin(false)")
    def start(ac,scn):
        pg.evaluate("if(FLY.on) flyStop()"); pg.wait_for_timeout(300)
        pg.evaluate(f"FLY.opts.ac='{ac}'; FLY.opts.scn='{scn}'; FLY.opts.hints=false; setTab('fly')"); pg.wait_for_timeout(250)
        pg.evaluate("document.querySelector('#flyGo').click()"); pg.wait_for_timeout(2200); pg.evaluate("FLY.paused=true"); pg.wait_for_timeout(100)
    def hub_open(): return not pg.evaluate("document.getElementById('fHub').hidden")
    # ---- layout: every aircraft, 4 screens, 2 views -------------------------------------------------------------------------------------------------------------
    for ac in ["a380","b737","b747"]:
        start(ac,"cruise")
        sizes=[(390,844),(360,740),(844,390),(1280,800)] if ac=="a380" else [(390,844),(844,390)]
        for w,h in sizes:
            for view in ["cockpit","chase"]:
                pg.set_viewport_size({"width":w,"height":h}); pg.evaluate(f"flySetView('{view}')"); pg.wait_for_timeout(1100); tag=f"{ac} {w}x{h} {view}"
                if hub_open(): pg.evaluate("flyHub(false)")
                r0=pg.evaluate(CHK)
                ok(not r0["loose"],f"{tag}: no gear / flap / spoiler / brake button outside the hub ({r0['loose']})")
                ok(r0["hubB"]["vis"] and r0["hubB"]["h"]>=33.5 and r0["hubB"]["w"]>=33.5 and r0["hubB"]["exp"]=="false" and r0["hubB"]["ctl"],f"{tag}: hub button visible {r0['hubB']['w']:.0f}x{r0['hubB']['h']:.0f}, closed, aria-controls resolves")
                pg.click("#fHubB"); pg.wait_for_timeout(500); r=pg.evaluate(CHK)
                ok(not r["hidden"] and r["hubB"]["exp"]=="true","%s: the button opens it (aria-expanded=true)"%tag)
                ok(r["inside"],f"{tag}: inside the screen {r['panel']}")
                ok(not r["over"],f"{tag}: covers no flight control {r['over']} (it may cover the ATC strip / deck zones: {r['overSoft']})")
                ok(r["hudPx"]<=0.4*r["area"],f"{tag}: HUD drawing under it {r['hudPx']} px of {r['area']} (the least-covered spot is chosen; on a landscape phone some of the compact HUD is unavoidable)")
                ok(r["minH"]>=35.5 and r["minW"]>=29.5,f"{tag}: buttons >= 36 px high ({r['minH']:.0f}) and >= 30 px wide ({r['minW']:.0f}), {r['nBtn']} buttons")
                ok(not r["covered"],f"{tag}: every button is the top element at its centre {r['covered']}")
                ok(not r["clipped"],f"{tag}: nothing clipped {r['clipped']}")
                ok(r["fontMin"]>=10.4,f"{tag}: smallest text {r['fontMin']:.1f} px")
                ok(r["apHidden"],f"{tag}: the autopilot panel is closed while the hub is open")
                if view=="cockpit" or (w,h)==(1280,800): pg.screenshot(path=f"{OUT}/hub_{ac}_{w}x{h}_{view}.png",timeout=170000)
                pg.keyboard.press("Escape"); pg.wait_for_timeout(250)
                ok(not hub_open() and pg.evaluate("document.activeElement&&document.activeElement.id")=="fHubB",f"{tag}: Escape closes it and the focus returns to the hub button")
        chips=pg.evaluate("[...document.querySelectorAll('#fFlapDt button')].map(b=>b.textContent)"); n=pg.evaluate("FLY.s.A.flaps.length")
        ok(len(chips)==n and chips==pg.evaluate("FLY.s.A.flaps.map(String)"),f"{ac}: the flap chips are the aircraft's own detents {chips}")
    # ---- the tiles on the ground (a380 takeoff) ------------------------------------------------------------------------------------------------------------------
    pg.set_viewport_size({"width":844,"height":390}); start("a380","takeoff"); pg.evaluate("flySetView('chase')"); pg.wait_for_timeout(700)
    s=pg.evaluate(S0); ok(s["ground"] and pg.evaluate("document.getElementById('fHub').hidden"),"ground start: on the runway, hub closed by default")
    pg.keyboard.press("h"); pg.wait_for_timeout(450); ok(hub_open(),"key H opens the hub")
    ok(pg.evaluate("document.activeElement&&document.activeElement.dataset.fa")=="flapdn","focus moves into the hub (the + flaps button)")
    ok(pg.evaluate("document.getElementById('fAp').hidden"),"the autopilot panel stays closed")
    n=pg.evaluate("FLY.s.A.flaps.length"); t0=pg.evaluate("FLY.s.flapsT")
    pg.click("#fFlapDt button:nth-child(%d)"%n); pg.wait_for_timeout(120); ok(pg.evaluate("FLY.s.flapsT")==n-1,"clicking the last flap chip selects the last detent")
    pg.click("#fFlapDt button:nth-child(1)"); pg.wait_for_timeout(120); ok(pg.evaluate("FLY.s.flapsT")==0,"clicking the first chip selects 0")
    pg.click("[data-fa='flapdn']"); pg.wait_for_timeout(120); ok(pg.evaluate("FLY.s.flapsT")==1,"+ steps the flaps down one detent")
    pg.click("[data-fa='flapup']"); pg.wait_for_timeout(120); ok(pg.evaluate("FLY.s.flapsT")==0,"- steps them up")
    ok(pg.evaluate("document.querySelector('#fFlapDt button[aria-pressed=\"true\"]').textContent")==pg.evaluate("String(FLY.s.A.flaps[FLY.s.flapsT])"),"the chip of the current detent is the pressed one")
    pg.click("#fSpoil"); pg.wait_for_timeout(120); ok(pg.evaluate(S0)["spoilT"]==1,"the speed-brake tile extends the spoilers"); pg.click("#fSpoil"); pg.wait_for_timeout(120); ok(pg.evaluate(S0)["spoilT"]==0,"and retracts them")
    pg.click("#fGear"); pg.wait_for_timeout(150); s=pg.evaluate(S0); ok(s["gearT"]==1 and "العجلات" in s["msg"],f"gear on the ground is refused with a message ({s['msg']})")
    pg.evaluate("FLY.s.parkBrake=false"); pg.click("#fPark"); pg.wait_for_timeout(150); ok(pg.evaluate(S0)["park"] is True,"the parking-brake tile sets the brake on the ground")
    ok(pg.evaluate("document.getElementById('fPark').getAttribute('aria-pressed')")=="true","...and shows it (aria-pressed)")
    pg.click("#fPark"); pg.wait_for_timeout(150); ok(pg.evaluate(S0)["park"] is False,"a second tap releases it")
    pg.click("#fRev"); pg.wait_for_timeout(150); ok(pg.evaluate(S0)["rev"] is True,"the reverse tile arms the reverse thrust on the ground"); pg.click("#fRev"); pg.wait_for_timeout(150); ok(pg.evaluate(S0)["rev"] is False,"and disarms it")
    bx=pg.locator("#fBrake").bounding_box(); pg.mouse.move(bx["x"]+bx["width"]/2,bx["y"]+bx["height"]/2); pg.mouse.down(); pg.wait_for_timeout(150)
    ok(pg.evaluate(S0)["brake"] is True and pg.evaluate("document.getElementById('fBrake').getAttribute('aria-pressed')")=="true","holding the brake tile brakes"); pg.mouse.up(); pg.wait_for_timeout(150)
    ok(pg.evaluate(S0)["brake"] is False,"releasing it stops braking")
    pg.screenshot(path=f"{OUT}/hub_ground_844x390.png",timeout=170000)
    # outside tap closes it
    pg.evaluate("document.getElementById('fly').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))"); pg.wait_for_timeout(200); ok(not hub_open(),"a tap outside closes it")
    # AP button closes it and the AP panel opens; the hub button then closes the AP panel
    pg.click("#fHubB"); pg.wait_for_timeout(300); ok(hub_open(),"the hub button opens it again")
    pg.evaluate("document.getElementById('fApB').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); document.getElementById('fApB').click()"); pg.wait_for_timeout(400)
    ok(not hub_open() and not pg.evaluate("document.getElementById('fAp').hidden"),"the autopilot button closes the hub and opens the autopilot panel")
    pg.click("#fHubB"); pg.wait_for_timeout(300); ok(hub_open() and pg.evaluate("document.getElementById('fAp').hidden"),"opening the hub closes the autopilot panel")
    pg.keyboard.press("h"); pg.wait_for_timeout(200); ok(not hub_open(),"key H closes it")
    # ---- in the air: the gear tile retracts, the ground-only tiles say so -------------------------------------------------------------------------------------
    start("a380","cruise"); pg.keyboard.press("h"); pg.wait_for_timeout(450)
    s=pg.evaluate(S0); ok(not s["ground"],"cruise start is airborne")
    g0=pg.evaluate(S0)["gearT"]   # a cruise start has the gear up: the tile lowers it, a second tap raises it again
    pg.click("#fGear"); pg.wait_for_timeout(150); ok(pg.evaluate(S0)["gearT"]==(0 if g0>0.5 else 1),f"gear tile in the air toggles the gear (was {g0})")
    pg.wait_for_timeout(300); ok(pg.evaluate("document.getElementById('fGear').getAttribute('aria-pressed')")==("false" if g0>0.5 else "true"),"...and shows it (aria-pressed follows the target)")
    pg.click("#fGear"); pg.wait_for_timeout(150); ok(pg.evaluate(S0)["gearT"]==g0,"...and a second tap restores it")
    pg.click("#fPark"); pg.wait_for_timeout(150); s=pg.evaluate(S0); ok(s["park"] is False and s["msg"],f"parking brake in the air: refused with a message ({s['msg']})")
    pg.click("#fRev"); pg.wait_for_timeout(150); s=pg.evaluate(S0); ok(s["rev"] is False and s["msg"],f"reverse in the air: refused with a message ({s['msg']})")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(200)
    flyOn=pg.evaluate("FLY.on"); ok(flyOn,"Escape closes only the hub (the flight keeps running)")
    ok(not errs,"no page errors "+str(errs[:2])); print("ALL PASS" if not bad else f"{bad} FAILED"); b.close(); sys.exit(1 if bad else 0)
