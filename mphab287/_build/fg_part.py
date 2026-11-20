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
ordo_grande(520, 1400, 4, 'Dr S. Moreau', 'Léo, 6 ans', ['paracétamol 120 mg', 'sirop ad 150 mL', 'S\\\\ 1 C à c x 3/j'])
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
