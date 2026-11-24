"""Cockpit view of the flight screen (one chromium): cockpit_view_test.py [page.html] [outdir]
(v37) The owner saw the airframe from the pilot's seat "as if the cockpit were transparent": the forward pressure bulkhead and the radar inside the nose, the nose gear, and, looking back,
wings and engines with no fuselage. For b737, a380 and b747 it checks, at 844x390 and 390x844:
  - in the cockpit view the camera draws NO drawable of the own aircraft (render layer), also after the lazily built detail parts arrive (edEnsure(B,true)); lights are untouched;
  - the head turn is limited (yaw to the side window, a little up / down) with a real mouse drag, and eases back after the release;
  - the 2D frame follows the head: at the limit the side wall with its window is on screen (opaque wall pixels + a clear opening), looking down puts an opaque floor at the bottom;
  - leaving the cockpit view restores every drawable to layer 0 and does not touch .visible (the gear and the detail parts own it); stopping the flight gives the viewer a fully drawn aircraft.
"""
from playwright.sync_api import sync_playwright
import os, sys
D=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(D); PAGE=sys.argv[1] if len(sys.argv)>1 else ROOT+"/dist/aircraft-atlas.html"; OUT=sys.argv[2] if len(sys.argv)>2 else D+"/cockpit_out"
three=open(ROOT+"/node_modules/three/build/three.min.js","rb").read(); os.makedirs(OUT,exist_ok=True)
DRAWN=r"""()=>{ const B=FLY.B, cam=FLY.cam; let n=0, all=0, lights=0, flagged=0; const ids={};
  B.root.traverse(o=>{ if(o.isLight){ lights+=o.layers.test(cam.layers)?1:0; return; } if(!(o.isMesh||o.isLine||o.isPoints||o.isSprite)) return; all++; if(o.userData.fhid) flagged++;
    let vis=true; for(let p=o;p;p=p.parent) if(!p.visible){ vis=false; break; } if(vis&&o.layers.test(cam.layers)){ n++; const k=o.userData.id||o.type; ids[k]=(ids[k]||0)+1; } });
  return {drawn:n,all,lights,flagged,hidden:FLY.hidden.length,ids:Object.keys(ids).slice(0,8)}; }"""
VIS=r"""()=>{ const a=[]; FLY.B.root.traverse(o=>{ if(o.isMesh||o.isLine||o.isPoints||o.isSprite) a.push(o.visible?1:0); }); return a.join(""); }"""
ROW=r"""(q)=>{ const hc=document.getElementById("flyHud"), g=hc.getContext("2d"), W=hc.width, H=hc.height, y=Math.floor(H*q.y), x0=Math.floor(W*q.x0), x1=Math.floor(W*q.x1), a=g.getImageData(x0,y,Math.max(1,x1-x0),1).data;
  let op=0, clear=0; for(let i=3;i<a.length;i+=4){ if(a[i]>200) op++; else if(a[i]<96) clear++; } return {op,clear,n:a.length/4}; }"""
FREE=r"""()=>{ const cv=FLY.ren.domElement, r=cv.getBoundingClientRect(); for(const fy of [0.42,0.36,0.5,0.3,0.56]) for(const fx of [0.5,0.42,0.58,0.34,0.66]){ const x=r.left+r.width*fx, y=r.top+r.height*fy; if(document.elementFromPoint(x,y)===cv) return [x,y]; } return null; }"""
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
    def start(ac,scn="takeoff"):
        pg.evaluate("if(FLY.on) flyStop()"); pg.wait_for_timeout(300)
        pg.evaluate(f"FLY.opts.ac='{ac}'; FLY.opts.scn='{scn}'; FLY.opts.time='day'; FLY.opts.wx='clear'; FLY.opts.hints=false; setTab('fly')"); pg.wait_for_timeout(250)
        pg.evaluate("document.querySelector('#flyGo').click()"); pg.wait_for_timeout(2200)
        pg.evaluate("document.querySelectorAll('#fly .faatc, #fly .fhint, #fly .fkgp, #fkGP').forEach(e=>{ e.style.display='none'; })")
    def drag(dx,dy):
        pt=pg.evaluate(FREE)
        if not pt: return False
        pg.mouse.move(pt[0],pt[1]); pg.mouse.down(); pg.mouse.move(pt[0]+dx,pt[1]+dy,steps=10); pg.wait_for_timeout(350); return True
    for ac in ["b737","a380","b747"]:
        pg.set_viewport_size({"width":844,"height":390}); start(ac); pg.evaluate("flySetView('chase')"); pg.wait_for_timeout(700)
        r=pg.evaluate(DRAWN); vis0=pg.evaluate(VIS); ok(r["drawn"]>100 and r["flagged"]==0 and r["hidden"]==0,f"{ac}: outside view draws the aircraft ({r['drawn']} of {r['all']} drawables)")
        pg.evaluate("flySetView('cockpit')"); pg.wait_for_timeout(900); r=pg.evaluate(DRAWN)
        ok(r["drawn"]==0 and r["hidden"]>100,f"{ac}: cockpit view draws nothing of the own aircraft (drawn {r['drawn']} {r['ids']}, hidden {r['hidden']})")
        ok(pg.evaluate(VIS)==vis0,f"{ac}: .visible of every drawable is untouched by the view (the gear / detail code owns it)")
        n0=r["all"]; pg.evaluate("try{ edEnsure(FLY.B,true); }catch(e){}"); pg.wait_for_timeout(1600); r=pg.evaluate(DRAWN)
        ok(r["drawn"]==0,f"{ac}: still nothing after the lazy detail parts are built ({n0} -> {r['all']} drawables, drawn {r['drawn']} {r['ids']})")
        for (w,h) in [(844,390),(390,844)]:
            pg.set_viewport_size({"width":w,"height":h}); pg.wait_for_timeout(900); pg.evaluate("FLY.look.yaw=0; FLY.look.pitch=0; FLY.look.snap=false; FLY.paused=true"); pg.wait_for_timeout(500); tag=f"{ac} {w}x{h}"
            lim=pg.evaluate("flyLookLim()"); mid0=pg.evaluate(ROW,{"y":0.4,"x0":0.35,"x1":0.65})
            ok(mid0["op"]==0,f"{tag}: looking ahead the middle of the windscreen is clear ({mid0})")
            got=drag(-700,0); st=pg.evaluate("({yaw:FLY.look.yaw,pitch:FLY.look.pitch})")   # drag left = look left (yaw +)? the sign is the app's; both ends are checked
            ok(got and abs(abs(st["yaw"])-lim["yaw"])<1e-3,f"{tag}: the head turn stops at the limit ({st['yaw']:.2f} rad, limit {lim['yaw']:.2f})")
            pg.wait_for_timeout(300); side=1 if st["yaw"]>0 else -1
            # the side wall is on screen on the side the pilot looks to: an opaque console under the sill and a clear opening above it
            xa,xb=(0.04,0.3) if side>0 else (0.7,0.96)
            low=pg.evaluate(ROW,{"y":0.97,"x0":xa,"x1":xb}); win=pg.evaluate(ROW,{"y":0.4,"x0":xa,"x1":xb})
            ok(low["op"]>=0.9*low["n"],f"{tag}: at the limit the side console is opaque under the window ({low})")
            ok(win["clear"]>=0.5*win["n"],f"{tag}: ...and the side window is a clear opening ({win})")
            if ac=="b737": pg.screenshot(path=f"{OUT}/cock_{w}x{h}_side.png",timeout=170000)
            pg.mouse.up(); pg.wait_for_timeout(200)
            pg.evaluate("FLY.paused=false"); pg.wait_for_timeout(2500); y2=pg.evaluate("FLY.look.yaw"); pg.evaluate("FLY.paused=true")
            ok(abs(y2)<abs(st["yaw"])*0.9,f"{tag}: after the release the head eases back ({st['yaw']:.2f} -> {y2:.2f}; slow frames under software GL, so only the direction is checked)")
            pg.evaluate("FLY.look.yaw=0; FLY.look.pitch=0; FLY.look.snap=false"); pg.wait_for_timeout(300)
            drag(700,0); st2=pg.evaluate("FLY.look.yaw"); pg.mouse.up(); ok(abs(abs(st2)-lim["yaw"])<1e-3 and st2*st["yaw"]<0,f"{tag}: the same limit on the other side ({st2:.2f})")
            pg.evaluate("FLY.look.yaw=0; FLY.look.pitch=0; FLY.look.snap=false"); pg.wait_for_timeout(300)
            drag(0,-500); pd=pg.evaluate("FLY.look.pitch"); pg.wait_for_timeout(250); fl=pg.evaluate(ROW,{"y":0.985,"x0":0.3,"x1":0.7})
            ok(abs(pd-lim["dn"])<1e-3,f"{tag}: looking down stops at {pd:.2f} rad")
            ok(fl["op"]>=0.95*fl["n"],f"{tag}: ...over an opaque floor, not the ground through the airframe ({fl})")
            if ac=="b737": pg.screenshot(path=f"{OUT}/cock_{w}x{h}_down.png",timeout=170000)
            pg.mouse.up(); pg.evaluate("FLY.look.yaw=0; FLY.look.pitch=0; FLY.look.snap=false"); pg.wait_for_timeout(250)
            drag(0,500); pu=pg.evaluate("FLY.look.pitch"); pg.mouse.up(); ok(abs(pu-lim["up"])<1e-3,f"{tag}: looking up stops at {pu:.2f} rad")
            pg.evaluate("FLY.look.yaw=0; FLY.look.pitch=0; FLY.look.snap=false")
        pg.set_viewport_size({"width":844,"height":390}); pg.wait_for_timeout(500)
        r=pg.evaluate(DRAWN); ok(r["lights"]>=0 and r["drawn"]==0,f"{ac}: back at 844x390 still nothing drawn (lights on the camera layer: {r['lights']})")
        pg.evaluate("flySetView('chase')"); pg.wait_for_timeout(600); r=pg.evaluate(DRAWN)
        ok(r["drawn"]>100 and r["flagged"]==0 and r["hidden"]==0,f"{ac}: leaving the cockpit draws the aircraft again ({r['drawn']} drawables)")
        pg.evaluate("flySetView('cockpit')"); pg.wait_for_timeout(500); pg.evaluate("flyStop()"); pg.wait_for_timeout(700)
        v=pg.evaluate("(()=>{ const B=GL.dbg(); let n=0, off=0; B.root.traverse(o=>{ if(o.isMesh||o.isLine||o.isPoints||o.isSprite){ n++; if(o.layers.mask!==1||o.userData.fhid) off++; } }); return {n,off}; })()")
        ok(v["n"]>100 and v["off"]==0,f"{ac}: after the flight the viewer's aircraft is fully on the default layer ({v})")
    ok(not errs,"no page errors "+str(errs[:2])); print("ALL PASS" if not bad else f"{bad} FAILED"); b.close(); sys.exit(1 if bad else 0)
