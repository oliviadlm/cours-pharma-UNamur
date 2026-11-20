import sys, json, base64, io, os
from playwright.sync_api import sync_playwright
from PIL import Image
sys.path.insert(0, '.'); from specs_pots import SPECS, NIV
EXN={e['id']:e['n'] for e in json.load(open('/home/claude/jeu287/exc.json'))['ex']}
for k in SPECS: SPECS[k]['nom']=EXN[k]
ids = sys.argv[2].split(',') if len(sys.argv) > 2 and sys.argv[2] != 'all' else list(SPECS)
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://localhost:8390/pots.html'); pg.wait_for_function('window.__pret===true', timeout=300000)
    json.dump(pg.evaluate('window.__meta()'), open(out + '/meta.json', 'w'))
    for k in ids:
        for n, lv in enumerate(NIV):
            d = pg.evaluate('([s,l])=>window.__pot(s,l)', [SPECS[k], lv])
            im = Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGB').resize((276, 354), Image.LANCZOS)
            im.save(f'{out}/{k}-{n}.webp', quality=80, method=6)
    print(errs, open(out + '/meta.json').read()); b.close()
