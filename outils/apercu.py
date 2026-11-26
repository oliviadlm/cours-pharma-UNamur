#!/usr/bin/env python3
"""
Aperçu gratuit des jeux : sépare le contenu complet (réservé aux codes) et l'aperçu (chapitre 1).

Pour chaque jeu de JEUX :
  - si la page HTML contient encore les données en ligne (<script>window.DATA={...}</script>),
    elles sont déplacées dans le fichier de données (ex. donnees-chipha.js) et la page charge ce fichier ;
  - le moteur du jeu est adapté (une fois) : un chapitre marqué « verrou » ouvre la fenêtre du code ;
  - le fichier d'aperçu (ex. donnees-chipha.apercu.js) est régénéré : chapitres publics complets,
    autres chapitres = titres seulement.

À relancer après chaque modification du contenu d'un jeu :
    python3 outils/apercu.py
Le serveur (functions/_middleware.js) envoie le fichier complet aux personnes qui ont un code,
et le fichier d'aperçu à tout le monde d'autre, à la même adresse.
"""
import json, os, re, sys

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# page du jeu, fichier de données complet, nombre de chapitres publics
JEUX = [
    ("chimie-pharma/revision/jeu-chipha.html", "chimie-pharma/revision/donnees-chipha.js", 1),
    ("mphab310/jeu-phyto.html", "mphab310/donnees-phyto.js", 2),          # 0. Introduction + 1. Glucides
    ("biochimie/jeu-biochimie.html", "biochimie/donnees-biochimie.js", 1),
    ("mphab287/jeu-calculs.html", "mphab287/donnees-calculs.js", 1),
]

SITE = "https://pharma-unamur.ayeleartstudio.com"
# aperçu des liens partagés (WhatsApp, iMessage...) : titre, description, image
PARTAGE = {
    "chimie-pharma/revision/jeu-chipha.html": ("Chimie pharma · le jeu", "Révise la chimie pharmaceutique en jouant : molécules, noms commerciaux, boss par chapitre.", "chimie-pharma/revision/decor/chambre.jpg"),
    "mphab310/jeu-phyto.html": ("Phytochimie · le jeu", "Explore la forêt et révise la pharmacognosie : plantes, molécules, gardiens à battre.", "mphab310/decor/foret.jpg"),
    "biochimie/jeu-biochimie.html": ("Biochimie humaine · le jeu", "Voyage dans le corps humain, organe par organe, pour réviser la biochimie.", "biochimie/decor/corps-visu.jpg"),
    "mphab287/jeu-calculs.html": ("Méthodes de calculs · le jeu", "Prépare des ordonnances dans ton officine et maîtrise les calculs pharmaceutiques.", "mphab287/decor/officine-1920-nuit.jpg"),
    "stage-officine/index.html": ("Stage en officine · le jeu 3D", "Une journée de stage à la Pharmacie du Confluent : 7 patients, tous les cours mélangés.", "acces/bannieres/officine-3d.jpg"),
}

ICONE_ACCUEIL = ('<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" '
                 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="2"/>'
                 '<rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/>'
                 '<rect x="13.5" y="13.5" width="7" height="7" rx="2"/></svg>')
PATCH_BTNS = '<div class="btns-col"><button class="rond-btn" id="son"'
PATCH_BTNS_NEW = ('<div class="btns-col"><a class="rond-btn" href="\'+(window.ACCES?ACCES.accueil:\'../index.html\')+\'" '
                  'aria-label="Tous les jeux" style="text-decoration:none;display:grid;place-items:center;color:inherit">' + ICONE_ACCUEIL +
                  '</a><button class="rond-btn" id="son"')


def balises_partage(html, page):
    if page not in PARTAGE or 'property="og:title"' in html:
        return html
    t, d, img = PARTAGE[page]
    url = SITE + "/" + page.replace("index.html", "").replace(".html", "")
    m = ('<meta property="og:type" content="website">\n<meta property="og:title" content="%s">\n'
         '<meta property="og:description" content="%s">\n<meta property="og:image" content="%s/%s">\n'
         '<meta property="og:url" content="%s">\n<meta name="twitter:card" content="summary_large_image">\n'
         '<meta name="description" content="%s">\n') % (t, d, SITE, img, url, d)
    return html.replace("</title>\n", "</title>\n" + m, 1)


GARDER_CHAP = {"id", "num", "t", "court", "img", "sym", "fam"}
GARDER_NIV = {"t", "s", "type", "lv"}


def lire(p):
    with open(os.path.join(RACINE, p), encoding="utf-8") as f:
        return f.read()


def ecrire(p, s):
    with open(os.path.join(RACINE, p), "w", encoding="utf-8") as f:
        f.write(s)


def extraire_inline(html):
    """Renvoie (debut_balise, fin_balise, objet) du <script>window.DATA={...}</script> en ligne."""
    m = re.search(r"<script>\s*window\.DATA\s*=\s*", html)
    if not m:
        return None
    obj, fin = json.JSONDecoder().raw_decode(html, m.end())
    f = html.index("</script>", fin)
    reste = re.sub(r"^\s*;?\s*", "", html[fin:f]).strip()  # ex. window.EXC=... (calculs)
    return m.start(), f + len("</script>"), obj, reste


def lire_donnees(p):
    s = lire(p)
    m = re.match(r"\s*window\.DATA\s*=\s*", s)
    obj, fin = json.JSONDecoder().raw_decode(s, m.end())
    return obj, re.sub(r"^\s*;?\s*", "", s[fin:]).strip()


def chaines(x, out):
    if isinstance(x, str):
        out.add(x)
    elif isinstance(x, list):
        for v in x:
            chaines(v, out)
    elif isinstance(x, dict):
        for v in x.values():
            chaines(v, out)
    return out


# Parties réservées aux codes dans les autres variables (vidées dans l'aperçu)
VIDER = {"EXC": ["quiz", "open"]}  # calculs : quiz de l'étagère des excipients


def reste_apercu(reste, n_chap, n_pub):
    """Autres variables (window.EXC, window.TH...) : une liste avec un élément par chapitre est coupée."""
    out, dec, i = [], json.JSONDecoder(), 0
    while True:
        m = re.compile(r"\s*window\.(\w+)\s*=\s*").match(reste, i)
        if not m:
            break
        try:
            obj, i = dec.raw_decode(reste, m.end())
        except json.JSONDecodeError:
            # code JS (ex. window.TH=[(function(){...})(),(function(){...})()]) : un bloc par chapitre
            j = reste.find("\nwindow.", m.end())
            j = len(reste) if j < 0 else j
            code = reste[m.end():j].strip()
            SEP = "})(),\n(function(){"
            parts = code.split(SEP)
            if not (code.startswith("[(function(){") and code.endswith("})()];") and len(parts) == n_chap):
                raise SystemExit("window.%s : format inattendu, à vérifier à la main." % m.group(1))
            code = SEP.join(parts[:n_pub])
            if not code.endswith("})()];"):
                code += "})()];"
            out.append("window.%s=%s" % (m.group(1), code))
            i = j
            continue
        i = re.compile(r"\s*;?").match(reste, i).end()
        if isinstance(obj, list) and len(obj) == n_chap:
            obj = obj[:n_pub]
        if isinstance(obj, dict):
            for k in VIDER.get(m.group(1), []):
                if k in obj:
                    obj[k] = []
        out.append("window.%s=%s;" % (m.group(1), json.dumps(obj, ensure_ascii=False, separators=(",", ":"))))
    if reste[i:].strip():
        raise SystemExit("Contenu inattendu après les données : à vérifier à la main.")
    return "\n".join(out)


def apercu(D, n_pub):
    pub = D["chap"][:n_pub]
    ids_pub = {c["id"] for c in pub}
    refs = chaines(pub, set())
    A = {}
    for k, v in D.items():
        if k == "chap":
            continue
        if isinstance(v, list) and v and isinstance(v[0], dict) and "id" in v[0]:
            A[k] = [x for x in v if x["id"] in refs or x.get("cp") in ids_pub or x.get("chap") in ids_pub]
        else:
            A[k] = v  # tableaux généraux, mini-jeux du chapitre 1
    chap = list(pub)
    for c in D["chap"][n_pub:]:
        v = {k: c[k] for k in c if k in GARDER_CHAP}
        for k, x in c.items():
            if k not in GARDER_CHAP and isinstance(x, list):
                v[k] = []
        v["niveaux"] = [
            dict({k: L[k] for k in L if k in GARDER_NIV}, **{k: [] for k, x in L.items() if isinstance(x, list)})
            for L in c["niveaux"]
        ]
        v["verrou"] = 1
        chap.append(v)
    A["chap"] = chap
    A["apercu"] = 1
    return A


PATCH_OUVERT = "function chapOuvert(ci){"
PATCH_OUVERT_NEW = "function chapOuvert(ci){if(CHAPS[ci].verrou)return false;"
# Avec un code : tout s'ouvre dès SEUIL_XP points (pour tout réviser avant l'examen)
SEUIL_XP = 300
PATCH_LIBRE = "function chapOuvert(ci){if(CHAPS[ci].verrou)return false;return "
PATCH_LIBRE_NEW = ("function toutOuvert(){return !D.apercu&&S&&(S.xp||0)>=%d}"
                   "function chapBoss(ci){if(CHAPS[ci].verrou)return false;return " % SEUIL_XP)
PATCH_LIBRE_SUITE = "function chapActuel(){var a=0;for(var i=0;i<CHAPS.length;i++)if(chapOuvert(i))a=i;return a}"
PATCH_LIBRE_SUITE_NEW = ("function chapOuvert(ci){return !CHAPS[ci].verrou&&(toutOuvert()||chapBoss(ci))}"
                         "function chapActuel(){var a=0;for(var i=0;i<CHAPS.length;i++)if(chapBoss(i))a=i;return a}")
PATCH_NIV = "function nivOuvert(ci,n){var L=CHAPS[ci].niveaux;if(!chapOuvert(ci))return false;"
PATCH_NIV_NEW = PATCH_NIV + "if(toutOuvert())return true;"
PATCH_TOAST = " pour ouvrir ce lieu'"
PATCH_TOAST_NEW = " ou atteins %d XP pour ouvrir ce lieu'" % SEUIL_XP
PATCH_ETQUIZ = "if(m==='quiz'){o.classList.remove('on');etQuiz();return}"
PATCH_ETQUIZ_NEW = ("if(m==='quiz'){if(D.apercu&&window.ACCES){ACCES.demander('Quiz des excipients');return}"
                    "o.classList.remove('on');etQuiz();return}")
# Calculs : sans code, 4 ordonnances en tout, puis le code est demandé
ORDO_APERCU = 4
PATCH_ORDO = "var __ordoDef=function(){"
PATCH_ORDO_NEW = ("var __ordoDef=function(){if(D.apercu&&(S.ordoTot||0)>=%d&&window.ACCES){ACCES.demander('Ordonnances du jour');return}"
                  % ORDO_APERCU)
PATCH_ORDO_N = ".slice(0,ordoRestantes()||3).map(qOrdo)"
PATCH_ORDO_N_NEW = (".slice(0,Math.min(ordoRestantes()||3,D.apercu?Math.max(1,%d-(S.ordoTot||0)):99)).map(qOrdo)"
                    % ORDO_APERCU)
PATCH_NOM = "'+salut+' Olivia</small>"
PATCH_NOM_NEW = "'+salut+(window.ACCES&&ACCES.nom?' '+ACCES.nom:'')+'</small>"
PATCH_BORNE = "var ci=+b.dataset.c;if(!chapOuvert(ci)){"
PATCH_BORNE_NEW = ("var ci=+b.dataset.c;if(CHAPS[ci].verrou&&window.ACCES){son('clic');ACCES.demander(CHAPS[ci].court);return}"
                   "if(!chapOuvert(ci)){")


def traiter(page, donnees, n_pub):
    html = lire(page)
    nom = os.path.basename(donnees)
    inl = extraire_inline(html)
    if inl:
        a, b, D, reste = inl
        ecrire(donnees, "window.DATA=" + json.dumps(D, ensure_ascii=False, separators=(",", ":")) + ";\n"
               + (reste + "\n" if reste else ""))
        rel = os.path.relpath(os.path.join(RACINE, "acces", "acces.js"), os.path.dirname(os.path.join(RACINE, page)))
        balise = ('<script src="%s"></script>\n<script src="%s"></script>' % (nom, rel))
        html = html[:a] + balise + html[b:]
        print("  données déplacées dans", donnees)
    else:
        D, reste = lire_donnees(donnees)
    if PATCH_OUVERT_NEW not in html and "function chapBoss(ci){if(CHAPS[ci].verrou)" not in html:
        if html.count(PATCH_OUVERT) != 1 or html.count(PATCH_BORNE) != 1:
            raise SystemExit("Moteur inattendu dans %s : adapter le verrou à la main." % page)
        html = html.replace(PATCH_OUVERT, PATCH_OUVERT_NEW).replace(PATCH_BORNE, PATCH_BORNE_NEW)
        print("  verrou ajouté au moteur")
    if "function toutOuvert()" not in html:
        assert html.count(PATCH_LIBRE) == 1 and html.count(PATCH_LIBRE_SUITE) == 1 and html.count(PATCH_NIV) == 1, page
        html = (html.replace(PATCH_LIBRE, PATCH_LIBRE_NEW).replace(PATCH_LIBRE_SUITE, PATCH_LIBRE_SUITE_NEW)
                .replace(PATCH_NIV, PATCH_NIV_NEW).replace(PATCH_TOAST, PATCH_TOAST_NEW))
        print("  tout s'ouvre à %d XP (avec un code)" % SEUIL_XP)
    if PATCH_ORDO in html and PATCH_ORDO_NEW not in html:
        assert html.count(PATCH_ORDO_N) == 1, page
        html = html.replace(PATCH_ORDO, PATCH_ORDO_NEW).replace(PATCH_ORDO_N, PATCH_ORDO_N_NEW)
        print("  ordonnances : %d sans code" % ORDO_APERCU)
    if PATCH_ETQUIZ in html:
        html = html.replace(PATCH_ETQUIZ, PATCH_ETQUIZ_NEW)
        print("  quiz de l'étagère réservé aux codes")
    if PATCH_BTNS in html and 'aria-label="Tous les jeux"' not in html:
        html = html.replace(PATCH_BTNS, PATCH_BTNS_NEW)
        print("  bouton « Tous les jeux » ajouté")
    html = balises_partage(html, page)
    if PATCH_NOM in html:
        html = html.replace(PATCH_NOM, PATCH_NOM_NEW)
        print("  « Bonjour » + prénom de la personne connectée")
    ecrire(page, html)
    A = apercu(D, n_pub)
    ecrire(donnees[:-3] + ".apercu.js",
           "window.DATA=" + json.dumps(A, ensure_ascii=False, separators=(",", ":")) + ";\n"
           + (reste_apercu(reste, len(D["chap"]), n_pub) + "\n" if reste else ""))
    tot = sum(len(v) for v in D.values() if isinstance(v, list))
    vu = sum(len(v) for k, v in A.items() if isinstance(v, list) and k != "chap")
    print("  aperçu : %d chapitre(s) public(s) sur %d, %d éléments sur %d"
          % (n_pub, len(D["chap"]), vu, tot - len(D["chap"])))


if __name__ == "__main__":
    for page, donnees, n in JEUX:
        print(page)
        traiter(page, donnees, n)
    for page in PARTAGE:
        if page not in [j[0] for j in JEUX]:
            ecrire(page, balises_partage(lire(page), page))
