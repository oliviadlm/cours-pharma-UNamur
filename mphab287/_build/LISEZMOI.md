# Jeu MPHAB287 (jeu-calculs.html)

Reconstruire le jeu :
1. `node export_th.js` : relit th1.js / th2.js (scripts des pages theorie-seance-1/2) et produit th.json + th1_iife.js / th2_iife.js.
2. `python3 build_data.py` : niveaux, mots-clés, questions de cours, tableaux → data287.json (affiche le décompte par chapitre et par niveau).
3. `python3 build_jeu287.py` : prend le moteur de chimie-pharma/revision/jeu-chipha.html, l'adapte aux calculs et écrit ../jeu-calculs.html.

Pour ajouter un chapitre : ajouter sa page de théorie (concepts, cards, quiz, gens, worked, sprints), ses exercices de séance,
puis une entrée dans CH, MC, CARTES et TABLES de build_data.py, et un lieu dans SPOTS (build_jeu287.py).
