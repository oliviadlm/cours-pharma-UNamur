# cours-pharma-UNamur

Site de révision d'Olivia, hébergé sur Cloudflare Pages (pharma-unamur.ayeleartstudio.com), dépôt privé.

## Accès : aperçu gratuit + codes personnels

- `functions/_middleware.js` décide qui voit quoi. Tout ce qui n'est pas listé comme public demande un code.
  - Public : l'accueil, les pages des jeux, les images/icônes/décors.
  - Jeux : la même adresse `donnees-*.js` renvoie les données complètes avec un code valide, sinon `donnees-*.apercu.js` (chapitre 1 seulement).
  - Tout autre `.html` (cours, fiches, examens) : page « Contenu réservé » sans code.
- Les codes sont dans le KV `CODES` (clé `code:XXXX`, valeur `{nom, cree, vu}`), gérés sur `/admin` (mot de passe = variable `ADMIN_CODE`).
- `index.html` : accueil façon Game Center (bannières des jeux, cours verrouillés, bouton « J'ai un code »). Chaque jeu a un bouton « Tous les jeux » qui y renvoie.
- Liens courts à partager : /chimie, /phyto, /biochimie-jeu, /calculs (dans `functions/_middleware.js`).
- `acces/acces.js` : fenêtre du code dans les jeux, prénom dans « Bonjour … », transfert de progression depuis l'ancien site GitHub Pages.
- `_routes.json` : dossiers d'images servis sans passer par la fonction (ne pas y mettre de contenu de cours texte).

## Après toute modification d'un jeu

Les données des 4 jeux (chimie pharma, phyto, biochimie, calculs) ne sont plus dans la page HTML mais dans `donnees-<jeu>.js`.

1. Modifier `donnees-<jeu>.js` (ou reconstruire le jeu : si les données reviennent en ligne dans la page, le script les ressort).
2. Lancer `python3 outils/apercu.py` : régénère les fichiers `.apercu.js` et réapplique le verrou au moteur.
3. Nouveau jeu : l'ajouter à `JEUX` dans `outils/apercu.py`, à `PAGES_PUBLIQUES` et `DONNEES_JEUX` dans `functions/_middleware.js`.

Calculs : sans code, 4 ordonnances en tout (`ORDO_APERCU`), puis le code est demandé.
Calculs : le Quiz de l'étagère des excipients est réservé aux codes (`VIDER` dans `outils/apercu.py`).

Avec un code, les chapitres s'ouvrent boss après boss, ou tous d'un coup dès `SEUIL_XP` (300 XP, dans `outils/apercu.py`).

Ne jamais remettre de contenu de cours dans un fichier public (`.apercu.js`, `_routes.json`, `acces/`).

## Stage en officine

Jeu 3D pas terminé : caché de l'accueil et réservé aux codes. Quand il sera prêt, remettre sa carte dans `index.html`, `/stage-officine/` dans `PAGES_PUBLIQUES` et le lien court `/officine`.
