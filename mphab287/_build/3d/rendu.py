from playwright.sync_api import sync_playwright
import base64, json, sys, time
mode = sys.argv[1]; couches = sys.argv[2:] or ['tout']
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':1280,'height':720}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type in('error','warning') else None)
    pg.goto('http://localhost:8390/index.html?mode='+mode); pg.wait_for_function('window.__pret===true',timeout=300000)
    for c in couches:
        t=time.time(); d=pg.evaluate(f"window.__rendre('{c}')",); open(f'r_{mode}_{c}.png','wb').write(base64.b64decode(d.split(',')[1])); print(c, round(time.time()-t,1),'s')
    json.dump(pg.evaluate('window.__ancres()'),open('ancres.json','w'),indent=1)
    print(errs[:5]); b.close()
