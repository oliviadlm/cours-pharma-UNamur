# Construit les données du jeu MPHAB287 (chapitres I et II) à partir des pages de théorie,
# des exercices des séances et du contenu rédigé à la main ci-dessous.
import json, re, random
random.seed(287)
TH = json.load(open('th.json'))
for c in TH['th2']['concepts']:
    c['traps'] = [t.replace('Répondre la quantité de PA (0,1 g) au lieu de la quantité de trituration (1 g).', 'Répondre la quantité de PA (0,5 mg) au lieu de la quantité de trituration (250 mg).') for t in c['traps']]
EX1 = json.load(open('chapitre-1_Q.json'))
EX2 = json.load(open('chapitre-2_Q.json'))

# ---------- mots-clés des cartes « concept », rédigés à la main ----------
MC = {
 'masse': "Échelle: g → dg → cg → mg · ×10 à chaque cran · ctg = cg | Repères: 1 g = 1000 mg · 1 g = 100 cg · 1 cg = 10 mg · 1 mg = 1000 µg | Méthode: plus petit → on multiplie · plus grand → on divise · passer par le gramme | Pièges: 1 g ≠ 100 mg · 12,5 mg = 0,0125 g · mg ≠ µg",
 'volume': "Volumes: 1 L = 1000 mL · 1 dL = 100 mL · 1 mL = 1 cm³ | Cuillères: C à s = 15 mL · C à d = 10 mL · C à c = 5 mL | Calculs: volume ÷ prise = nombre de prises · prise × fois par jour × jours | Pièges: C à s ≠ C à d · oublier les jours",
 'magistrale': "Définition: extemporanément · à l'officine · sous la surveillance du pharmacien · le plus souvent sur prescription | 4 intérêts: personnaliser la posologie (âge, évolution) · associer des PA · spécialité indisponible · intérêt économique | Piège: « le plus souvent », pas « toujours »",
 'abrev': "Abréviations: Rp = prenez · S\\ = étiquette · pf = pour faire · dt = donnez · qs = autant qu'il en faut · ad = jusqu'à | Lecture: doses écrites pour 1 unité · × nombre « dt » | Exemple: 10 mg × 20 = 200 mg · 5 mg × 20 = 100 mg | Piège: qs ≠ ad",
 'rp': "Démarche: concentration × volume = PA total · PA total ÷ dosage = comprimés · arrondir au-dessus | Excès: PA en trop ÷ PA par comprimé · × masse d'un comprimé = poudre à retirer | Exemple: 3200 mg ÷ 250 = 12,8 → 13 · excès 0,2 comprimé | Pièges: mg ≠ nombre de comprimés · retirer de la poudre, pas des mg",
 'pct': "Définitions: % m/m = g / 100 g · % m/V = g / 100 mL · % V/V = mL / 100 mL | Repère: 1 % (m/V) = 10 mg/mL | Exemple: 0,10 % = 1 mg/mL · C à c = 5 mL → 5 mg | Pièges: % sur le volume final (ad) · convertir en g avant le %",
 'densite': "Formules: m = V × d · V = m ÷ d | Tableau: eau 1 · éthanol 0,79 · méthanol 0,80 · propylène glycol 1,04 · éther 0,71 · huile de paraffine 0,86 | Exemple: 5 % de 540 g = 27 g · 27 ÷ 0,9 = 30 mL | Contrôle: d < 1 → volume > masse | Pourquoi peser: liquides visqueux",
 'trit': "Principe: PA trop petit pour une pesée précise · excès de PA + diluant · on prélève le mélange qui contient la dose | Effet: plus dilué → masse pesée plus grande → plus précis · la dose reçue ne change pas | Piège: ‰ ≠ % (facteur 10)",
 'tritcalc': "2 étapes: PA total (dose × nombre) · masse de trituration qui contient ce PA | Facteurs: 1 ‰ → × 1000 · 2 ‰ → × 500 · 1 % → × 100 · 10 % → × 10 | Exemple: 50 µg × 10 = 0,5 mg · × 500 = 250 mg | Pièges: répondre le PA au lieu de la trituration · µg → mg d'abord",
 'lecture': "Chiffres romains: I 1 · V 5 · X 10 · L 50 · C 100 | Soustraction: IV 4 · IX 9 · XL 40 · XC 90 | Exemples: VI 6 · XIV 14 | Unités: 1 mg = 1000 µg | Pièges: IV ≠ 6 · dt X et dt XX",
 'gelmix': "Spécialité: PA total ÷ dosage du comprimé · Cipramil 1200 mg ÷ 20 = 60 comprimés | Trituration 10 %: PA × 10 · 600 mg → 6 g | Lecture: « par gélule » → pas × dt · 10 ctg = 100 mg | Pourquoi: un comprimé contient aussi des excipients",
 'coulee': "Fusion claire: 2-3 °C au-dessus de la T° de fusion · PA avant la coulée · risque de sédimentation | Fusion crémeuse: 2/3 fondu + 1/3 froid · coulée semi-solide · moins de sédimentation · durcit plus vite | 4 étapes: étalonner (E) · couler à 10 % (M, S) · calculer f · excipient pour n + 1",
 'facteur': "Symboles: E = 1 suppo pur · M = excipient dans 1 suppo à 10 % · S = PA dans ce suppo | Formule: f = (E − M) ÷ S | Méthode: travailler sur 1 suppositoire · M = 90 % · S = 10 % | Exemple: (2,93 − 2,689) ÷ 0,299 ≈ 0,81 | Pièges: S = 10 % du suppo avec PA · signe de f",
 'base': "Formule: M = E − Σ (f × S) · S en grammes | Pratique: préparer n + 1 suppositoires · masse totale = M × (n + 1) | Exemple: 1,97 − 0,2088 = 1,7612 g · × 11 = 19,37 g | Pièges: mg → g · n au lieu de n + 1 · oublier un PA",
}

# ---------- questions de cours (cartes ouvertes / QROC), rédigées à la main ----------
CARTES = {
 'unites': [
  ("Question de cours", "Définis la préparation magistrale et cite ses 4 intérêts.",
   "Médicament préparé extemporanément à l'officine, sous la surveillance du pharmacien, le plus souvent sur prescription médicale. Intérêts : personnaliser la posologie (âge, évolution de la maladie), associer plusieurs principes actifs, remplacer une spécialité non disponible, intérêt économique.",
   "Définition: extemporanément · à l'officine · surveillance du pharmacien · le plus souvent sur prescription | Intérêts: posologie personnalisée · association de PA · spécialité indisponible · économique"),
  ("Question de cours", "Que signifient R\\ (Rp), S\\, Pf, Dt, Qs et Ad ? Lis « Rp X 10 mg pf 1 gél dt 20 ».",
   "Rp = prenez ; S\\ = indiquez sur l'étiquette (posologie) ; Pf = pour faire une pièce de ; Dt = donnez (nombre d'unités à délivrer) ; Qs = autant qu'il en faut ; Ad = jusqu'à. « Rp X 10 mg pf 1 gél dt 20 » : 10 mg de X par gélule, 20 gélules à délivrer, donc 200 mg de X à peser.",
   "Abréviations: Rp prenez · S\\ étiquette · Pf pour faire · Dt donnez · Qs autant qu'il en faut · Ad jusqu'à | Lecture: 10 mg par gélule · 20 gélules · 200 mg à peser"),
  ("QROC", "Donne la définition de % (m/m), % (m/V) et % (V/V), puis 1 % (m/V) en mg/mL.",
   "% (m/m) : g de substance pour 100 g de préparation. % (m/V) : g de substance pour 100 mL. % (V/V) : mL de substance pour 100 mL. 1 % (m/V) = 1 g / 100 mL = 10 mg/mL.",
   "m/m: g pour 100 g | m/V: g pour 100 mL | V/V: mL pour 100 mL | Repère: 1 % (m/V) = 10 mg/mL"),
  ("Question de cours", "Comment passe-t-on d'une masse à un volume avec la densité ? Pourquoi pèse-t-on certains liquides au lieu de les mesurer ?",
   "m = V × d et V = m ÷ d (d sans unité, en g/mL pour le calcul). On pèse les liquides très visqueux (glycérine, huiles…) car la mesure de leur volume serait imprécise : ils collent aux parois.",
   "Formules: m = V × d · V = m ÷ d | Pourquoi peser: liquides visqueux · volume imprécis · collent aux parois"),
  ("Question de cours", "On broie une spécialité et le nombre de comprimés trouvé n'est pas entier (ex. 12,8). Que fait-on ?",
   "On arrondit au nombre entier supérieur (13 comprimés), on broie, puis on retire la poudre qui contient l'excès de PA : (PA en excès ÷ PA par comprimé) × masse d'un comprimé.",
   "Arrondi: entier supérieur (13) | Puis: broyer · retirer l'excès | Formule: (excès ÷ PA par comprimé) × masse d'un comprimé"),
  ("QROC", "Cite les densités du tableau du cours.",
   "Eau 1 ; éthanol 0,79 ; méthanol 0,80 ; propylène glycol 1,04 ; isopropanol 0,79 ; éther 0,71 ; acétone 0,79 ; huile de paraffine 0,86.",
   "< 1: éthanol 0,79 · isopropanol 0,79 · acétone 0,79 · méthanol 0,80 · éther 0,71 · huile de paraffine 0,86 | = 1: eau | > 1: propylène glycol 1,04"),
 ],
 'trit': [
  ("Question de cours", "Qu'est-ce qu'une trituration, quand l'utilise-t-on et comment calcule-t-on la masse à peser ?",
   "Mélange d'un excès de PA avec un diluant, utilisé quand la quantité de PA est trop petite pour être pesée avec précision. On calcule d'abord la quantité totale de PA (dose × nombre), puis la masse de trituration qui la contient : × 1000 (1 ‰), × 500 (2 ‰), × 100 (1 %), × 10 (10 %).",
   "Définition: excès de PA + diluant | Quand: PA trop petit pour une pesée précise | Calcul: PA total · puis × facteur | Facteurs: 1 ‰ × 1000 · 2 ‰ × 500 · 1 % × 100 · 10 % × 10"),
  ("Question de cours", "Compare la fusion claire et la fusion crémeuse pour couler des suppositoires.",
   "Fusion claire : on chauffe 2 à 3 °C au-dessus de la température de fusion et on incorpore le PA avant la coulée ; risque de sédimentation. Fusion crémeuse : on fond 2/3 de la masse, on ajoute 1/3 froid puis le PA, et on coule semi-solide ; moins de sédimentation et durcissement plus rapide.",
   "Claire: 2-3 °C au-dessus · PA avant coulée · sédimentation | Crémeuse: 2/3 fondu + 1/3 froid · semi-solide · moins de sédimentation · durcit plus vite"),
  ("Question de cours", "Définis E, M, S et f, et donne les formules du facteur de déplacement et de la masse d'excipient par suppositoire.",
   "E : masse d'excipient dans 1 suppositoire sans PA (1re coulée). M : masse d'excipient dans 1 suppositoire avec PA (2e coulée à 10 %). S : masse de PA dans ce suppositoire. f : masse d'excipient déplacée par 1 g de PA. f = (E − M) ÷ S et M = E − Σ (f × S).",
   "Symboles: E suppo pur · M excipient avec PA · S PA · f excipient déplacé par 1 g de PA | Formules: f = (E − M) ÷ S · M = E − Σ f·S"),
  ("QROC", "Pourquoi prépare-t-on n + 1 suppositoires ?",
   "Parce qu'une partie de la masse fondue reste dans le récipient et le moule : on calcule la masse d'excipient pour un suppositoire de plus que le nombre prescrit (dt).",
   "pertes de masse · récipient et moule · n + 1 · masse d'excipient × (n + 1)"),
  ("QROC", "Convertis en chiffres arabes : IV, IX, XIV, XL, XC, CXX.",
   "IV = 4 ; IX = 9 ; XIV = 14 ; XL = 40 ; XC = 90 ; CXX = 120.",
   "IV 4 · IX 9 · XIV 14 · XL 40 · XC 90 · CXX 120"),
 ]
}

# ---------- tableaux à connaître (mode « Tableaux ») ----------
TABLES = {
 'unites': [
  {'n':'Densités', 'k':'Densité', 'rows':[['eau','1'],['éthanol','0,79'],['méthanol','0,80'],['propylène glycol','1,04'],['isopropanol','0,79'],['éther','0,71'],['acétone','0,79'],['huile de paraffine','0,86']], 'inv':False},
  {'n':'Cuillères', 'k':'Volume', 'rows':[['C à s (cuillère à soupe)','15 mL'],['C à d (cuillère à dessert)','10 mL'],['C à c (cuillère à café)','5 mL']], 'inv':True},
  {'n':'Conversions', 'k':'Équivalence', 'rows':[['1 g','1000 mg'],['1 g (en cg)','100 cg'],['1 cg','10 mg'],['1 mg','1000 µg'],['1 mg (en g)','0,001 g'],['1 cg (en g)','0,01 g'],['1 L','1000 mL'],['1 dL','100 mL']], 'inv':False},
  {'n':'Abréviations', 'k':'Signification', 'rows':[['R\\ ou Rp','Prenez'],['S\\','Indiquez sur l\'étiquette'],['Pf','Pour faire une pièce de'],['Dt','Donnez'],['Qs','Autant qu\'il en faut'],['Ad','Jusqu\'à']], 'inv':True},
  {'n':'Pourcentages', 'k':'Signification', 'rows':[['% (m/m)','g pour 100 g'],['% (m/V)','g pour 100 mL'],['% (V/V)','mL pour 100 mL'],['1 % (m/V)','10 mg/mL']], 'inv':True},
 ],
 'trit': [
  {'n':'Triturations', 'k':'Masse de trituration = PA ×', 'rows':[['1 ‰','× 1000'],['2 ‰','× 500'],['1 %','× 100'],['10 %','× 10']], 'inv':True},
  {'n':'Chiffres romains', 'k':'Valeur', 'rows':[['I','1'],['V','5'],['X','10'],['L','50'],['C','100'],['IV','4'],['VI','6'],['IX','9'],['XIV','14'],['XX','20'],['XL','40'],['LX','60'],['XC','90'],['CXX','120']], 'inv':True},
  {'n':'Suppositoires', 'k':'Signification', 'rows':[['E','Excipient dans 1 suppo sans PA'],['M','Excipient dans 1 suppo avec PA'],['S','PA dans 1 suppositoire'],['f','Excipient déplacé par 1 g de PA'],['Formule de f','(E − M) ÷ S'],['Masse d\'excipient','E − Σ (f × S)'],['Nombre à préparer','n + 1']], 'inv':True},
  {'n':'Coulée', 'k':'Principe', 'rows':[['Fusion claire','2-3 °C au-dessus de la T° de fusion'],['Fusion crémeuse','2/3 fondu + 1/3 froid'],['% de PA de la 2e coulée','10 %']], 'inv':True},
 ]
}

# ---------- cartes éclair → QCM avec distracteurs pédagogiques ----------
NUM = re.compile(r'^([\d  ]+(?:,\d+)?)\s*([^\d()]{0,20}(?:\([^)]*\))?)$')
OVR = {
 "Que signifie « ctg » ?": ["Centigramme (cg) = 100 mg", "Milligramme (mg)", "Centilitre (cL) = 10 mL"],
 "Vers une unité plus petite (g → mg), on… ?": ["Divise (le nombre diminue)", "Ne change rien au nombre", "Multiplie toujours par 10"],
 "Définition de la préparation magistrale ?": ["Médicament fabriqué industriellement et vendu sans prescription", "Médicament préparé à l'avance en grande série par l'industrie", "Médicament préparé à l'hôpital uniquement, toujours sur prescription"],
 "Les 4 intérêts de la préparation magistrale ?": ["Stabilité · conservation longue · goût · présentation", "Éviter la prescription · stocker à l'avance · exporter · publicité", "Personnaliser la posologie · toujours moins cher · sans contrôle · sans étiquette"],
 "« Extemporanément » signifie… ?": ["Préparé à l'avance et stocké", "Préparé hors de l'officine", "Préparé sans prescription"],
 "C à s = ? mL": ["10 mL (cuillère à dessert)", "5 mL (cuillère à café)", "20 mL"],
 "C à d = ? mL": ["15 mL (cuillère à soupe)", "5 mL (cuillère à café)", "12 mL"],
 "C à c = ? mL": ["10 mL (cuillère à dessert)", "15 mL (cuillère à soupe)", "2,5 mL"],
 "Quel format de prescription a remplacé le papier ?": ["Le fax", "La prescription orale", "Le carnet de santé"],
 "% (m/m) = ?": ["g de substance pour 100 mL de préparation", "mL de substance pour 100 mL de préparation", "mg de substance pour 100 g de préparation"],
 "% (m/V) = ?": ["g de substance pour 100 g de préparation", "mL de substance pour 100 mL de préparation", "mg de substance pour 100 mL de préparation"],
 "% (V/V) = ?": ["g de substance pour 100 mL de préparation", "g de substance pour 100 g de préparation", "mL de substance pour 1000 mL de préparation"],
 "Avec « ad 250 mL », sur quoi calcule-t-on le % ?": ["Sur la somme des ingrédients", "Sur 100 mL", "Sur la masse de PA"],
 "Formule de la masse à partir du volume ?": ["m = V ÷ d", "m = d ÷ V", "m = V + d"],
 "Formule du volume à partir de la masse ?": ["V = m × d", "V = d ÷ m", "V = m − d"],
 "Pourquoi pèse-t-on certains liquides au lieu de les mesurer ?": ["Ils s'évaporent trop vite", "Ils sont tous plus denses que l'eau", "Pour aller plus vite"],
 "L et C en chiffres romains ?": ["L = 100 · C = 50", "L = 50 · C = 500", "L = 500 · C = 1000"],
 "Question « par gélule » : multiplie-t-on par dt ?": ["Oui", "Oui, puis on divise par 2", "Seulement pour les comprimés"],
 "Trituration 1 ‰ : facteur à appliquer à la masse de PA ?": ["× 500", "× 100", "× 10"],
 "Trituration 2 ‰ : facteur ?": ["× 1000", "× 200", "× 50"],
 "Trituration 1 % : facteur ?": ["× 10", "× 1000", "× 500"],
 "Trituration 10 % : facteur ?": ["× 100", "× 1", "× 1000"],
 "Les 2 étapes du calcul d'une trituration ?": ["1) Facteur de trituration · 2) Dose par unité", "1) Masse de diluant · 2) Masse de PA", "1) Quantité de trituration · 2) Nombre de gélules"],
 "Formule du facteur de déplacement ?": ["f = (M − E) ÷ S", "f = (E − M) × S", "f = S ÷ (E − M)"],
 "Formule de la masse d'excipient par suppositoire ?": ["M = E + Σ (fi × Si)", "M = E − Σ Si", "M = (E − Si) ÷ fi"],
 "En pratique, on prépare combien de suppositoires ?": ["n", "n − 1", "2 n"],
 "Unité de S dans f × S ?": ["Milligrammes", "Pourcentage", "Millilitres"],
 "8 suppos de 1 g à 100 mg d'aspirine (f 0,67) : base en pratique ?": ["0,933 × 8 = 7,464 g", "0,900 × 9 = 8,100 g", "0,967 × 9 = 8,703 g"],
 "Suppo à 10 % de PA pesant 3,048 g : M et S ?": ["M = 0,3048 g · S = 2,7432 g", "M = 3,048 g · S = 0,3048 g", "M = 2,7432 g · S = 3,048 g"],
 "% de PA arbitraire de la 2e coulée ?": ["5 %", "20 %", "50 %"],
 "dt VI": ["4", "5", "7"], "dt XX": ["10", "15", "30"], "dt XL": ["60", "45", "90"], "dt XC": ["110", "80", "40"],
 "Trituration à 1 % = ?": ["1 mg de PA pour 100 g", "10 g de PA pour 100 g", "1 g de PA pour 1000 g"],
 "Trituration à 10 % = ?": ["1 g de PA pour 100 g", "10 mg de PA pour 1000 mg", "100 g de PA pour 100 g"],
 "Trituration à 1 ‰ = ?": ["1 mg de PA pour 100 mg de trituration", "10 mg de PA pour 1000 mg de trituration", "1 g de PA pour 100 g de trituration"],
}
DENS = ['1', '0,79', '0,80', '1,04', '0,71', '0,86', '1,26', '0,92']
def fr(x):
    s = ('%.10f' % x).rstrip('0').rstrip('.')
    i, _, f = s.partition('.')
    i = re.sub(r'\B(?=(\d{3})+(?!\d))', ' ', i)
    return i + (',' + f if f else '')
def num_distr(back):
    m = NUM.match(back.strip())
    if not m: return None
    v = float(m.group(1).replace(' ', '').replace(' ', '').replace(',', '.'))
    unit = m.group(2)
    if v == 0: return None
    cands = [v*10, v/10, v*100, v/100, v*1000, v/1000]
    out = []
    for c in cands:
        t = (fr(c) + (' ' + unit if unit else '')).strip()
        if t != back.strip() and t not in out: out.append(t)
    return out[:3]
def cards_to_q(cards, prefix):
    out = []
    by = {}
    for c in cards: by.setdefault(c['c'], []).append(c)
    allbacks = [c['back'] for c in cards]
    for k, c in enumerate(cards):
        back = c['back']
        d = OVR.get(c['front'])
        if not d and c['c'] == 'densite' and NUM.match(back):
            d = [x for x in DENS if x != back][:3]; random.shuffle(d)
        if not d: d = num_distr(back)
        if not d:
            sib = [x['back'] for x in by[c['c']] if x['back'] != back]
            rest = [b for b in allbacks if b != back and b not in sib]
            random.shuffle(sib); random.shuffle(rest)
            d = (sib + rest)[:3]
        out.append({'id': f'{prefix}-k{k+1}', 't': 'qcm', 'q': c['front'], 'c': [back] + d, 'r': back, 'x': back, 'cp': c['c']})
    return out

D = {'mol': [], 'q': [], 'c': [], 'ex': [], 'tab': TABLES, 'chap': []}
CH = [
 ('unites', 'th1', EX1, "Jongler avec les unités à l'officine", "Les unités", 'drop',
  [('masse', 'Unités de masse', 'g, cg (ctg), mg, µg'), ('volume', 'Volumes et cuillères', 'L, mL, C à s, C à d, C à c'),
   ('magistrale', 'La préparation magistrale', 'Définition et 4 intérêts'), ('abrev', 'Lire une prescription', 'Rp, S\\, pf, dt, qs, ad'),
   ('rp', 'Du Rp à la quantité à peser', 'Dose × dt, comprimés à broyer'), ('pct', 'Les concentrations en %', 'm/m, m/V, V/V, mg/mL'),
   ('densite', 'Les densités', 'm = V × d, tableau des densités')]),
 ('trit', 'th2', EX2, "Triturations et suppositoires", "Triturations et suppos", 'flask',
  [('trit', 'La trituration', 'Principe, ‰ et %'), ('tritcalc', 'Calculer une trituration', 'PA total puis facteur'),
   ('lecture', 'µg et chiffres romains', 'dt VI, XIV, XL, XC'), ('gelmix', 'Gélules complexes', 'Spécialités et triturations'),
   ('coulee', 'Coulée des suppositoires', 'Fusion claire, crémeuse, 4 étapes'), ('facteur', 'Le facteur de déplacement', 'f = (E − M) ÷ S'),
   ('base', "La masse d'excipient", 'M = E − Σ f·S, n + 1')]),
]
for ci, (cid, th, EX, titre, court, sym, NIV) in enumerate(CH):
    T = TH[th]; pre = str(ci + 1)
    qz = []
    for n, q in enumerate(T['quiz']):
        if q.get('t') == 'tf':
            qz.append({'id': f'{pre}-z{n+1}', 't': 'vrai_faux', 'q': re.sub(r'^Vrai ou faux\s*:\s*', '', q['q']), 'c': ['Vrai', 'Faux'], 'r': ['Vrai', 'Faux'][q['a']], 'x': q.get('ex', ''), 'cp': q['c']})
        else:
            qz.append({'id': f'{pre}-z{n+1}', 't': 'qcm', 'q': q['q'], 'c': q['o'], 'r': q['o'][q['a']], 'x': q.get('ex', ''), 'cp': q['c']})
    kq = cards_to_q(T['cards'], pre)
    D['q'] += qz + kq
    for c in T['concepts']:
        rep = 'À dire : ' + ' ; '.join(c['talk']['check']) + '.'
        if c['traps']: rep += ' Pièges à éviter : ' + ' '.join(c['traps'])
        D['c'].append({'id': f'{pre}-{c["id"]}', 't': c['t'], 'q': c['talk']['prompt'], 'e': rep, 'mc': MC[c['id']]})
    for e in EX:
        x = {'id': f'{pre}-x{e["id"]}', 's': e['s'], 'ctx': e.get('c', ''), 'q': e['q'], 'st': e['st'], 'tip': e.get('tip', '')}
        if 'num' in e: x['num'] = e['num']
        else: x['o'] = e['o']; x['a'] = e['a']
        D['ex'].append(x)
    niv = []
    for (k, t, s) in NIV:
        niv.append({'t': t, 's': s, 'type': 'n',
                    'q': [q['id'] for q in qz + kq if q['cp'] == k],
                    'c': [f'{pre}-{k}'],
                    'g': [[ci, g] for g, v in T['gens'].items() if v['c'] == k],
                    'w': [[ci, w['id']] for w in T['worked'] if w.get('gen') and T['gens'].get(w['gen'], {}).get('c') == k] +
                         ([[ci, 'w2']] if (th == 'th1' and k == 'rp') else [])})
    niv.append({'t': "Exercices d'examen", 's': 'Les exercices de la séance, au format QCM', 'type': 'prof',
                'ex': [f'{pre}-x{e["id"]}' for e in EX], 'w': [[ci, w['id']] for w in T['worked']]})
    niv.append({'t': 'Boss : examen blanc', 's': 'Tout le chapitre, comme à l\'examen', 'type': 'boss'})
    cartes = [{'id': f'p:{cid}:{i}', 'lab': lab, 'q': q, 'r': r, 'mc': mc} for i, (lab, q, r, mc) in enumerate(CARTES[cid])]
    D['chap'].append({'id': cid, 't': titre, 'court': court, 'sym': sym, 'num': ['I', 'II'][ci], 'niveaux': niv, 'cartes': cartes,
                      'sprints': [[ci, s['id']] for s in T['sprints']]})

json.dump(D, open('data287.json', 'w'), ensure_ascii=False)
# décompte
for c in D['chap']:
    print('Chapitre', c['num'], c['t'])
    for n in c['niveaux']:
        if n['type'] == 'n':
            print(f"  {n['t']:32s} QCM {len(n['q']):2d} · concept {len(n['c'])} · calculs {len(n['g'])} · problèmes guidés {len(n['w'])}")
        elif n['type'] == 'prof':
            print(f"  {n['t']:32s} exercices {len(n['ex'])} · problèmes guidés {len(n['w'])} · questions de cours {len(c['cartes'])}")
        else: print('  ' + n['t'])
# vérifier que tout est rangé
allq = {q['id'] for q in D['q']}; used = {i for c in D['chap'] for n in c['niveaux'] for i in n.get('q', [])}
print('QCM non rangés :', allq - used)
allc = {x['id'] for x in D['c']}; usedc = {i for c in D['chap'] for n in c['niveaux'] for i in n.get('c', [])}
print('Concepts non rangés :', allc - usedc)
for ci, th in enumerate(['th1', 'th2']):
    g = {k for k in TH[th]['gens']}; ug = {x[1] for n in D['chap'][ci]['niveaux'] for x in n.get('g', [])}
    w = {x['id'] for x in TH[th]['worked']}; uw = {x[1] for n in D['chap'][ci]['niveaux'] if n['type'] == 'n' for x in n.get('w', [])}
    print(th, 'générateurs non rangés :', g - ug, '· problèmes guidés hors niveaux :', w - uw)
print('cartes avec mots-clés :', sum(1 for c in D['c'] if c['mc']), '/', len(D['c']), '· questions de cours :', sum(1 for c in D['chap'] for k in c['cartes'] if k['mc']))
