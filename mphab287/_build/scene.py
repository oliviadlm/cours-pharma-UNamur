# Décor original du jeu MPHAB287 : « L'officine » — bureau des ordonnances, paillasse de préparation, étagère des flacons.
# Dessiné en SVG (3840 x 2160), puis rendu en image et animé par-dessus dans le jeu.
import random
random.seed(7)
W, H = 3840, 2160
P = {
 'mur': '#efd6bb', 'mur2': '#e6c6a3', 'plinthe': '#c99c74', 'bois': '#b5774a', 'bois2': '#9a6038', 'bois3': '#7d4a2a',
 'blanc': '#f7f1e8', 'gris': '#d9d4cc', 'gris2': '#b9b2a8', 'ink': '#2f2433', 'teal': '#3a8f8a', 'teal2': '#2b6f6c',
 'vert': '#7cc9a0', 'rose': '#f2a7a0', 'orange': '#e9874b', 'rouge': '#d9573f', 'jaune': '#f2c45a', 'bleu': '#5c7fb8', 'violet': '#8a6fb3',
 'liege': '#c98a55', 'carrelage': '#e9eef0', 'joint': '#cfd8dc',
}
o = []
def a(s): o.append(s)
def rect(x, y, w, h, f, rx=0, extra=''): a(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{f}" {extra}/>')
def txt(x, y, s, size=28, f=P['ink'], w=600, anchor='start', fam="'Helvetica Neue',Arial,sans-serif", extra=''):
    s = s.replace('&', '&amp;').replace('<', '&lt;')
    a(f'<text x="{x}" y="{y}" font-family="{fam}" font-size="{size}" font-weight="{w}" fill="{f}" text-anchor="{anchor}" {extra}>{s}</text>')
HAND = "'Caveat',cursive"
import base64
FONT = base64.b64encode(open('/tmp/font/package/files/caveat-latin-700-normal.woff2','rb').read()).decode()

a(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">')
a('<style>@font-face{font-family:Caveat;src:url(data:font/woff2;base64,'+FONT+') format("woff2");font-weight:100 900}</style>')
a('''<defs>
<linearGradient id="gMur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3dec7"/><stop offset="1" stop-color="#e3c19c"/></linearGradient>
<linearGradient id="gCiel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd0e6"/><stop offset="1" stop-color="#f6dcc0"/></linearGradient>
<linearGradient id="gRayon" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6d8" stop-opacity=".55"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></linearGradient>
<linearGradient id="gVerre" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".15"/><stop offset="1" stop-color="#ffffff" stop-opacity=".45"/></linearGradient>
<linearGradient id="gPaillasse" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf7f1"/><stop offset="1" stop-color="#e6ded2"/></linearGradient>
<linearGradient id="gBureau" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c2834f"/><stop offset="1" stop-color="#a3683d"/></linearGradient>
<linearGradient id="gEcran" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f6f73"/><stop offset="1" stop-color="#284b4f"/></linearGradient>
<radialGradient id="gLampe" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#fff1c2" stop-opacity=".75"/><stop offset="1" stop-color="#fff1c2" stop-opacity="0"/></radialGradient>
<pattern id="pCarreau" width="120" height="120" patternUnits="userSpaceOnUse"><rect width="120" height="120" fill="#eef2f1"/><path d="M0 0H120V120" fill="none" stroke="#d3dcdc" stroke-width="4"/></pattern>
<pattern id="pLiege" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#c98a55"/><circle cx="4" cy="5" r="1.6" fill="#a8693a"/><circle cx="11" cy="12" r="1.3" fill="#dda06b"/><circle cx="13" cy="3" r="1" fill="#a8693a"/></pattern>
<pattern id="pBois" width="300" height="60" patternUnits="userSpaceOnUse"><rect width="300" height="60" fill="#b07245"/><path d="M0 18 Q75 10 150 20 T300 16 M0 42 Q90 36 170 46 T300 40" stroke="#9a6038" stroke-width="3" fill="none" opacity=".6"/></pattern>
</defs>''')
# ----- mur et sol
rect(0, 0, W, H, 'url(#gMur)')
rect(0, 0, W, 90, '#d9a77b')                       # corniche
rect(0, 90, W, 14, '#c18b5e')
rect(1340, 104, 1360, 1180, 'url(#pCarreau)')       # carrelage derrière la paillasse
rect(1340, 104, 1360, 16, '#c9d3d3')
# ----- fenêtre (ciel, toits, nuages animés dans le jeu)
fx, fy, fw, fh = 1480, 230, 560, 640
rect(fx - 26, fy - 26, fw + 52, fh + 52, '#f7efe4', 8)
rect(fx, fy, fw, fh, 'url(#gCiel)')
for i, (rx, rw, rh) in enumerate([(0, 120, 150), (110, 90, 210), (190, 140, 120), (320, 70, 260), (380, 180, 170)]):
    rect(fx + rx, fy + fh - rh, rw, rh, ['#c98f72', '#b7806a', '#d4a183', '#a9776a', '#c08b78'][i])
    a(f'<polygon points="{fx+rx},{fy+fh-rh} {fx+rx+rw/2},{fy+fh-rh-50} {fx+rx+rw},{fy+fh-rh}" fill="#8f5d58"/>')
    for k in range(2):
        rect(fx + rx + 18 + k * 36, fy + fh - rh + 40, 20, 28, '#f6e3b0')
rect(fx + fw / 2 - 9, fy, 18, fh, '#f7efe4'); rect(fx, fy + fh / 2 - 9, fw, 18, '#f7efe4')
rect(fx - 50, fy + fh + 18, fw + 100, 26, '#e9dccb', 6)
a(f'<polygon points="{fx},{fy+fh} {fx+fw},{fy+fh} {fx+fw+700},1300 {fx-260},1300" fill="url(#gRayon)" opacity=".55"/>')
# ----- horloge
cx, cy = 2430, 330
a(f'<circle cx="{cx}" cy="{cy}" r="118" fill="#2f2433"/><circle cx="{cx}" cy="{cy}" r="100" fill="#fbf6ee"/>')
for k in range(12):
    import math
    an = k * math.pi / 6
    a(f'<line x1="{cx+82*math.sin(an):.1f}" y1="{cy-82*math.cos(an):.1f}" x2="{cx+94*math.sin(an):.1f}" y2="{cy-94*math.cos(an):.1f}" stroke="#2f2433" stroke-width="{6 if k%3==0 else 3}"/>')
a(f'<line x1="{cx}" y1="{cy}" x2="{cx+40}" y2="{cy-38}" stroke="#2f2433" stroke-width="9" stroke-linecap="round"/>')
a(f'<line x1="{cx}" y1="{cy}" x2="{cx-8}" y2="{cy-72}" stroke="#2f2433" stroke-width="6" stroke-linecap="round"/>')
# ----- affiche « Tableau des densités » (carrelage)
px, py = 2120, 470
rect(px, py, 380, 470, '#fffdf8', 10, 'stroke="#d9cfc0" stroke-width="4"')
rect(px, py, 380, 70, P['teal'], 10); rect(px, py + 50, 380, 20, P['teal'])
txt(px + 190, py + 47, 'DENSITÉS', 34, '#fff', 800, 'middle')
for i, (n, d) in enumerate([('Eau', '1'), ('Éthanol', '0,79'), ('Méthanol', '0,80'), ('Isopropanol', '0,79'), ('Acétone', '0,79'), ('Éther', '0,71'), ('Huile de paraffine', '0,86'), ('Propylène glycol', '1,04')]):
    y = py + 112 + i * 44
    txt(px + 24, y, n, 25, P['ink'], 500); txt(px + 356, y, d, 25, P['teal2'], 800, 'end')
    a(f'<line x1="{px+24}" y1="{y+14}" x2="{px+356}" y2="{y+14}" stroke="#eee5d8" stroke-width="2"/>')
a(f'<circle cx="{px+190}" cy="{py-6}" r="10" fill="{P["rouge"]}"/>')
# ----- tableau en liège avec ordonnances et post-it (bureau)
lx, ly = 110, 300
rect(lx - 18, ly - 18, 900 + 36, 560 + 36, '#8a5a36', 14)
rect(lx, ly, 900, 560, 'url(#pLiege)', 6)
def postit(x, y, w, h, col, lignes, rot):
    a(f'<g transform="rotate({rot} {x+w/2} {y+h/2})">'); rect(x + 6, y + 8, w, h, '#000', 4, 'opacity=".12"'); rect(x, y, w, h, col, 4)
    for i, l in enumerate(lignes): txt(x + 18, y + 54 + i * 40, l, 30, '#3b2a2a', 700, fam=HAND)
    a(f'<circle cx="{x+w/2}" cy="{y+14}" r="9" fill="{P["rouge"]}"/></g>')
def ordo_mini(x, y, rot, lignes):
    a(f'<g transform="rotate({rot} {x+130} {y+170})">'); rect(x + 6, y + 8, 260, 340, '#000', 3, 'opacity=".12"'); rect(x, y, 260, 340, '#fffdf6', 3)
    rect(x, y, 260, 46, '#e8f1ef'); txt(x + 16, y + 32, 'Dr M. Laurent', 22, P['teal2'], 700)
    txt(x + 18, y + 96, 'Rp', 34, '#1f3a8a', 800, fam=HAND)
    for i, l in enumerate(lignes): txt(x + 30, y + 140 + i * 36, l, 24, '#1f3a8a', 600, fam=HAND)
    a(f'<path d="M{x+130} {y+300} q20 -30 40 0 t40 0 t30 -10" stroke="#1f3a8a" stroke-width="3" fill="none"/>')
    a(f'<circle cx="{x+130}" cy="{y+14}" r="9" fill="{P["teal"]}"/></g>')
ordo_mini(lx + 40, ly + 60, -4, ['hydrocortisone 5 mg', 'pf 1 gél', 'dt LX'])
ordo_mini(lx + 330, ly + 90, 3, ['codéine 0,10 %', 'sirop ad 150 mL', 'S\\ 3 C à c/j'])
postit(lx + 640, ly + 50, 220, 200, '#ffe27a', ['1 g =', '1000 mg'], 5)
postit(lx + 630, ly + 300, 230, 200, '#ffb3c1', ['C à s', '= 15 mL'], -4)
# ----- étagère murale de livres au-dessus du bureau
sx, sy = 1060, 560
rect(sx, sy, 330, 22, P['bois2'], 4)
x = sx + 12
for i, (w, h, col) in enumerate([(46, 210, '#5c7fb8'), (38, 180, '#e9874b'), (52, 230, '#3a8f8a'), (40, 200, '#f2c45a'), (44, 170, '#d9573f'), (50, 220, '#8a6fb3')]):
    rect(x, sy - h, w, h, col, 4); rect(x + 8, sy - h + 30, w - 16, 10, '#ffffff', 2, 'opacity=".55"'); x += w + 6
# ----- calendrier
rect(1120, 640, 200, 230, '#fff', 6, 'stroke="#e7d9c8" stroke-width="3"'); rect(1120, 640, 200, 60, P['orange'], 6); rect(1120, 680, 200, 20, P['orange'])
txt(1220, 685, 'NOVEMBRE', 26, '#fff', 800, 'middle')
for r in range(4):
    for c in range(5):
        rect(1136 + c * 36, 716 + r * 36, 28, 26, '#f4ece2', 3)
rect(1136 + 2 * 36, 716 + 2 * 36, 28, 26, P['rouge'], 3)
# ================= BUREAU (gauche)
rect(0, 1290, 1400, 60, 'url(#gBureau)', 6)
a('<linearGradient id="gPlanB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9794a"/><stop offset="1" stop-color="#d49a68"/></linearGradient>')
rect(0, 1340, 1400, 640, 'url(#gPlanB)')
for k in range(9): a(f'<path d="M0 {1380+k*70} Q700 {1370+k*72} 1400 {1385+k*70}" stroke="#a9693e" stroke-width="3" fill="none" opacity=".35"/>')
# interphone / téléphone (rétro, couleur brique)
tx, ty = 70, 1060
rect(tx, ty + 20, 340, 230, '#c9573c', 22); rect(tx, ty + 20, 340, 40, '#b2462f', 22)
for k in range(8): rect(tx + 24 + k * 18, ty + 80, 9, 120, '#a53f2a', 4)
for r in range(4):
    for c in range(3):
        rect(tx + 200 + c * 40, ty + 74 + r * 40, 30, 30, '#2f2433', 6); txt(tx + 215 + c * 40, ty + 96 + r * 40, '123456789*0#'[r * 3 + c], 18, '#fff', 700, 'middle')
rect(tx + 24, ty + 210, 150, 26, '#2f2433', 6)
# lampe de bureau rouge
a('<g>')
a(f'<polygon points="1140,840 1300,840 1360,960 1080,960" fill="{P["rouge"]}"/><ellipse cx="1220" cy="960" rx="140" ry="16" fill="#b8402c"/>')
rect(1212, 960, 16, 290, '#b8402c'); a('<ellipse cx="1220" cy="1288" rx="90" ry="20" fill="#b8402c"/>')
a('</g>')
# ordinateur rétro beige
cx0, cy0 = 470, 860
rect(cx0, cy0, 420, 360, '#e8dcc3', 26); rect(cx0 + 34, cy0 + 34, 352, 250, '#3c3b36', 14); rect(cx0 + 48, cy0 + 48, 324, 222, 'url(#gEcran)', 8)
txt(cx0 + 66, cy0 + 96, 'ORDONNANCES', 26, '#bff0d8', 800, fam="'Courier New',monospace")
txt(cx0 + 66, cy0 + 136, 'du jour', 24, '#bff0d8', 600, fam="'Courier New',monospace")
for k in range(3): rect(cx0 + 66, cy0 + 162 + k * 26, 220 - k * 40, 12, '#8fd3b4', 3, 'opacity=".7"')
rect(cx0 + 150, cy0 + 360, 120, 50, '#d6c8ad'); rect(cx0 + 40, cy0 + 300, 70, 14, '#cbbd9f', 4)
rect(cx0 - 20, 1250, 470, 50, '#efe6d3', 10);
for r in range(2):
    for c in range(14): rect(cx0 - 6 + c * 32, 1256 + r * 20, 26, 14, '#dccfb4', 3)
# calculatrice
rect(980, 1190, 190, 110, '#e3d7c0', 12); rect(995, 1200, 160, 30, '#a9c2a0', 4); txt(1145, 1224, '0,79', 22, '#253325', 800, 'end', "'Courier New',monospace")
for r in range(2):
    for c in range(5): rect(995 + c * 32, 1240 + r * 26, 26, 20, '#6b5f55' if c < 4 else P['orange'], 4)
# pile d'ordonnances + bacs
for k in range(5):
    rect(270 - k * 3, 1250 - k * 9, 230, 40, '#fffdf6', 3, f'stroke="#e5dccd" stroke-width="2" transform="rotate({random.uniform(-3,3):.1f} 385 1270)"')
rect(255, 1196, 240, 54, '#fffdf6', 3, 'stroke="#e5dccd" stroke-width="2"')
txt(275, 1236, 'Rp', 30, '#1f3a8a', 800, fam=HAND)
a(f'<path d="M330 1222 h120 M330 1236 h90" stroke="#1f3a8a" stroke-width="4" stroke-linecap="round"/>')
# tasse
a(f'<path d="M1270 1210 h80 v70 a20 20 0 0 1 -20 20 h-40 a20 20 0 0 1 -20 -20z" fill="{P["teal"]}"/><path d="M1350 1228 a24 24 0 0 1 0 44" stroke="{P["teal"]}" stroke-width="12" fill="none"/>')
# ================= PAILLASSE (centre)
rect(1380, 1270, 1340, 70, 'url(#gPaillasse)', 8)
a('<linearGradient id="gPlanW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9e2d6"/><stop offset="1" stop-color="#fbf8f2"/></linearGradient>')
rect(1380, 1340, 1340, 640, 'url(#gPlanW)')
# balance de précision avec cage de verre
bx, by = 1430, 960
rect(bx, by + 250, 380, 60, '#4a4f5a', 12); rect(bx + 20, by + 262, 150, 36, '#1f2d2a', 6)
txt(bx + 158, by + 290, '0,250 g', 26, '#9ff0c8', 800, 'end', "'Courier New',monospace")
rect(bx + 40, by, 300, 250, 'url(#gVerre)', 8, 'stroke="#c4d6d8" stroke-width="5"')
a(f'<ellipse cx="{bx+190}" cy="{by+232}" rx="90" ry="12" fill="#9aa3ad"/><path d="M{bx+150} {by+226} q40 -36 80 0z" fill="#fff"/>')
# mortier et pilon
a(f'<path d="M1880 1170 h220 q-10 110 -110 110 q-100 0 -110 -110z" fill="#ece6dc" stroke="#cfc6b8" stroke-width="6"/>')
rect(1940, 1270, 100, 14, '#cfc6b8', 6)
a(f'<rect x="2010" y="1020" width="34" height="200" rx="17" fill="#d8cfc1" transform="rotate(24 2027 1120)"/>')
# gélulier
rect(2150, 1230, 260, 50, '#cfe3ea', 8, 'stroke="#a9c6cf" stroke-width="4"')
for r in range(2):
    for c in range(8):
        a(f'<circle cx="{2172+c*31}" cy="{1245+r*22}" r="8" fill="#8fb4bf"/>')
for c in range(4): rect(2180 + c * 50, 1196, 22, 38, [P['rose'], P['jaune'], P['vert'], P['bleu']][c], 11)
# ballon chauffé sur support (bain chauffant) avec serpentin
a(f'<rect x="2490" y="700" width="14" height="580" fill="#8e98a3"/><rect x="2440" y="1260" width="180" height="24" rx="8" fill="#6d7681"/>')
a(f'<rect x="2504" y="880" width="120" height="12" fill="#8e98a3"/>')
a(f'<circle cx="2600" cy="1010" r="110" fill="url(#gVerre)" stroke="#bccfd2" stroke-width="6"/>')
a(f'<path d="M2494 1030 a106 106 0 0 0 212 0z" fill="{P["orange"]}" opacity=".85"/>')
rect(2580, 820, 40, 90, 'url(#gVerre)', 4, 'stroke="#bccfd2" stroke-width="5"')
a(f'<path d="M2600 820 C2600 700 2700 700 2690 790 S2600 860 2620 760 S2720 650 2700 600" stroke="#f3f0ea" stroke-width="12" fill="none" stroke-linecap="round"/>')
rect(2560, 1130, 80, 150, '#5b6470', 6)   # brûleur / plaque
# portoir à tubes
rect(1840, 1140, 0, 0, '#000')
# ================= ÉTAGÈRE ET FLACONS (droite)
ex0 = 2780
for k, y in enumerate([420, 700, 980]):
    rect(ex0, y, 900, 26, P['bois2'], 6)
rect(ex0, 160, 26, 1120, P['bois3']); rect(ex0 + 874, 160, 26, 1120, P['bois3'])
FL = [[('Éthanol', '0,79', P['bleu']), ('Glycérine', '1,26', P['jaune']), ('Prop. glycol', '1,04', P['violet']), ('Eau purifiée', '1', '#9fd3e6')],
      [('Lactose', '', '#f3efe7'), ('Witepsol', '', '#f1e3c4'), ('Vaseline', '', '#f2e8c9'), ('Acétone', '0,79', P['rose'])],
      [('Huile de paraffine', '0,86', '#f6e7a8'), ('Éther', '0,71', P['vert']), ('Méthanol', '0,80', P['orange']), ('Sirop simple', '', '#f2c49a')]]
for r, y in enumerate([420, 700, 980]):
    for c, (nom, d, col) in enumerate(FL[r]):
        x = ex0 + 50 + c * 210; h = 200 if r != 1 else 180; w = 150
        if r == 1:   # pots
            rect(x, y - h, w, h, col, 18, 'stroke="#d8cbb4" stroke-width="4"'); rect(x - 6, y - h - 26, w + 12, 34, '#6b5f55', 8)
        else:
            a(f'<path d="M{x+45} {y-h-40} h60 v40 q45 18 45 60 v{h-70} q0 10 -10 10 h-130 q-10 0 -10 -10 v-{h-70} q0 -42 45 -60z" fill="{col}" opacity=".9"/>')
            rect(x + 40, y - h - 70, 70, 34, '#3a2f36', 6)
            a(f'<path d="M{x+18} {y-h+60} v{h-80}" stroke="#fff" stroke-width="10" opacity=".35" stroke-linecap="round"/>')
        rect(x + 14, y - 118, 122, 74, '#fffdf8', 6, 'stroke="#d9cfbf" stroke-width="2"')
        size = 22 if len(nom) < 11 else 17
        txt(x + 75, y - 84, nom, size, P['ink'], 700, 'middle')
        if d: txt(x + 75, y - 56, 'd = ' + d, 20, P['teal2'], 800, 'middle')
# plan de travail droit
rect(2720, 1270, 1120, 70, '#d9b48f', 8)
a('<linearGradient id="gPlanR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c7976b"/><stop offset="1" stop-color="#e2bb92"/></linearGradient>')
rect(2720, 1340, 1120, 640, 'url(#gPlanR)')
# bain-marie (vapeur animée dans le jeu)
rect(2800, 1160, 300, 110, '#8e98a3', 16); rect(2790, 1150, 320, 26, '#a7b0ba', 10); rect(2830, 1120, 240, 40, '#c9d2da', 10)
# moule à suppositoires
mx, my = 3170, 1190
rect(mx, my, 330, 80, '#b8c0c8', 8, 'stroke="#97a0aa" stroke-width="4"')
for c in range(8):
    a(f'<path d="M{mx+28+c*38} {my+10} q12 50 0 60 q-12 -10 0 -60z" fill="#f1e3c4" stroke="#97a0aa" stroke-width="2"/>')
rect(mx + 140, my - 40, 50, 40, '#97a0aa', 6)
# boîte de gants + collecteur
rect(3560, 1170, 170, 100, '#7fc6c1', 10); a('<ellipse cx="3645" cy="1180" rx="50" ry="14" fill="#5aa39e"/>')
a('<path d="M3620 1172 q10 -40 30 -36 q14 4 6 36z" fill="#bfe8f0"/>')
rect(3560, 980, 170, 170, P['rouge'], 14); rect(3550, 960, 190, 40, '#b8402c', 10); txt(3645, 1080, 'DÉCHETS', 24, '#fff', 800, 'middle')
# ----- bord avant des plans de travail
rect(0, 1980, W, 60, '#7d4a2a'); rect(1380, 1980, 1340, 60, '#cfc6b8'); rect(2720, 1980, 1120, 60, '#a8774c')
rect(0, 2040, W, H - 2040, '#3b2a24')
rect(0, 1340, W, 22, '#000', 0, 'opacity=".07"')
# ----- premier plan : ordonnances posées sur le bureau
def ordo_grande(x, y, rot, medecin, patient, lignes, sig=True):
    w, h = 470, 600
    a(f'<g transform="rotate({rot} {x+w/2} {y+h/2})">')
    rect(x + 14, y + 18, w, h, '#000', 6, 'opacity=".16"')
    rect(x, y, w, h, '#fffdf7', 6)
    rect(x, y, w, 92, '#e4efec', 6); rect(x, y + 70, w, 22, '#e4efec')
    txt(x + 26, y + 44, medecin, 30, P['teal2'], 800); txt(x + 26, y + 76, 'Médecin généraliste · Namur', 20, '#5d7a76', 500)
    txt(x + 26, y + 140, 'Pour : ' + patient, 34, '#1f3a8a', 700, fam=HAND)
    txt(x + 30, y + 214, 'Rp', 58, '#1f3a8a', 700, fam=HAND)
    for i, l in enumerate(lignes): txt(x + 60, y + 278 + i * 50, l, 40, '#1f3a8a', 700, fam=HAND)
    if sig: a(f'<path d="M{x+250} {y+h-70} q20 -44 46 0 t44 -4 t40 -10 q-20 20 30 6" stroke="#1f3a8a" stroke-width="4" fill="none" stroke-linecap="round"/>')
    a('</g>')
ordo_grande(80, 1430, -7, 'Dr M. Laurent', 'Mme Dubois', ['éthinylœstradiol 50 µg', 'pf 1 gél dt X'])
ordo_grande(520, 1400, 4, 'Dr S. Moreau', 'Léo, 6 ans', ['paracétamol 120 mg', 'sirop ad 150 mL', 'S\\ 1 C à c x 3/j'])
# tampon encreur + tampon
rect(1050, 1640, 230, 140, '#2f2433', 14); rect(1066, 1654, 198, 110, '#4a3b8c', 8)
a('<rect x="1160" y="1500" width="70" height="130" rx="18" fill="#d9573f"/><rect x="1130" y="1610" width="130" height="40" rx="8" fill="#7d4a2a"/>')
# stylo
a('<g transform="rotate(-28 1150 1880)"><rect x="980" y="1866" width="300" height="26" rx="13" fill="#1f3a8a"/><polygon points="1280,1866 1320,1879 1280,1892" fill="#e8d8b8"/></g>')
# ----- paillasse : nacelle de pesée, spatules, éprouvette, plateau de gélules
a('<path d="M1500 1700 l200 -36 l70 120 l-200 36z" fill="#ffffff" stroke="#d8d0c2" stroke-width="5"/>')
a('<ellipse cx="1635" cy="1745" rx="70" ry="24" fill="#f3efe8"/><path d="M1580 1745 q55 -55 110 0z" fill="#ffffff" stroke="#e5ddd0" stroke-width="3"/>')
for k, (x, y, r) in enumerate([(1780, 1600, -12), (1830, 1640, -6)]):
    a(f'<g transform="rotate({r} {x} {y})"><rect x="{x}" y="{y}" width="360" height="16" rx="8" fill="#b8c0c8"/><rect x="{x+300}" y="{y-10}" width="90" height="36" rx="14" fill="#8e98a3"/></g>')
# éprouvette graduée
a('<rect x="2290" y="1300" width="90" height="460" rx="10" fill="url(#gVerre)" stroke="#bccfd2" stroke-width="6"/><rect x="2296" y="1520" width="78" height="234" rx="6" fill="#7cc9a0" opacity=".75"/>')
for k in range(9): a(f'<line x1="2300" y1="{1340+k*48}" x2="{2330 if k%2 else 2350}" y2="{1340+k*48}" stroke="#7d8f93" stroke-width="4"/>')
a('<ellipse cx="2335" cy="1770" rx="85" ry="20" fill="#bccfd2"/>')
# plateau de gélules préparées
rect(1950, 1800, 300, 130, '#e3eef1', 14, 'stroke="#b9cfd5" stroke-width="5"')
for r in range(3):
    for c in range(7):
        col = [P['rose'], P['jaune'], P['bleu'], P['vert']][(r + c) % 4]
        a(f'<g transform="rotate({-20+((r*7+c)*37)%40} {1985+c*38} {1830+r*36})"><rect x="{1972+c*38}" y="{1820+r*36}" width="30" height="16" rx="8" fill="{col}"/><rect x="{1987+c*38}" y="{1820+r*36}" width="15" height="16" rx="0" fill="#fff" opacity=".55"/></g>')
# ----- plan droit : moule ouvert avec suppositoires coulés, thermomètre, copeaux d'excipient
rect(2850, 1560, 560, 220, '#c3cbd3', 16, 'stroke="#97a0aa" stroke-width="6"')
for c in range(10):
    a(f'<path d="M{2890+c*52} {1600} q22 70 0 140 q-22 -70 0 -140z" fill="#f4e6c8" stroke="#a3acb6" stroke-width="3"/>')
a('<g transform="rotate(10 3600 1700)"><rect x="3480" y="1560" width="34" height="320" rx="17" fill="#f7f7f7" stroke="#c9d0d6" stroke-width="5"/><circle cx="3497" cy="1880" r="30" fill="#e5484d"/><rect x="3490" y="1700" width="14" height="170" fill="#e5484d"/></g>')
rect(3560, 1780, 230, 160, '#f2e6cc', 12, 'stroke="#d8c7a3" stroke-width="5"'); txt(3675, 1870, 'Excipient', 30, '#7a5a2e', 800, 'middle')
for k in range(6): a(f'<ellipse cx="{3600+k*30}" cy="{1765-(k%2)*10}" rx="16" ry="9" fill="#f6ecd6" stroke="#ddcba6" stroke-width="2"/>')

a('</svg>')
open('scene.svg', 'w').write('\n'.join(o))
print('scene.svg', sum(len(x) for x in o))
