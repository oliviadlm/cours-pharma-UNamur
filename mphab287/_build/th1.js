
/* ================= DONNÉES DU COURS ================= */
const de = s => (/^[aeéèêiouyh]/i.test(s) ? "d'" : "de ") + s;
const U = { kg: 1000, g: 1, dg: 0.1, cg: 0.01, ctg: 0.01, mg: 0.001, "µg": 1e-6 };
const UV = { L: 1000, dL: 100, cL: 10, mL: 1 };
const r10 = x => Math.round(x * 1e10) / 1e10;
const SOLV = [["éthanol", 0.79], ["méthanol", 0.80], ["propylène glycol", 1.04], ["isopropanol", 0.79], ["éther", 0.71], ["acétone", 0.79], ["huile de paraffine", 0.86], ["eau", 1]];
const SPOON = [["cuillère à soupe (C à s)", 15], ["cuillère à dessert (C à d)", 10], ["cuillère à café (C à c)", 5]];
const PA = ["hydrocortisone", "prednisolone", "furosémide", "captopril", "spironolactone", "propranolol", "oméprazole", "allopurinol", "baclofène", "amlodipine"];

const DATA = {
id: "s1",
kicker: "MPHAB287 · Méthodes de calculs appliquées aux sciences pharmaceutiques",
title: "Séance 1 · Théorie : jongler avec les unités à l'officine",
sub: "Unités de masse et de volume · préparation magistrale · prescription · % · densités",

concepts: [
{ id: "masse", title: "Les unités de masse (pesée)",
  html: `<p>À l'officine, on pèse en <b>grammes</b> et en sous-multiples. Chaque cran vaut <span class="k">×10</span> :</p>
  <div class="formula">g → dg → cg → mg</div>
  <table><tr><th>Unité</th><th>Équivalence</th></tr>
  <tr><td>1 g</td><td><span class="k">10 dg = 100 cg = 1000 mg</span></td></tr>
  <tr><td>1 cg (écrit aussi <b>ctg</b>)</td><td><span class="k">10 mg = 0,01 g</span></td></tr>
  <tr><td>1 mg</td><td><span class="k">0,1 cg = 0,001 g = 1000 µg</span></td></tr>
  <tr><td>1 µg (microgramme)</td><td><span class="k">0,001 mg</span></td></tr></table>
  <p><b>Règle de déplacement de la virgule</b> : vers une unité plus petite, on <span class="k">multiplie</span> (le nombre grandit) ; vers une unité plus grande, on <span class="k">divise</span>. g → mg : virgule de <span class="k">3 rangs vers la droite</span>.</p>
  <p><b>Contrôle de vraisemblance</b> : un résultat en g doit être un <span class="k">plus petit nombre</span> que le même résultat en mg.</p>`,
  why: [["Pourquoi faut-il maîtriser les cg alors qu'on les utilise peu ailleurs ?", "Les prescriptions et formulaires belges utilisent encore les cg/ctg (ex. « acide benzoïque 18 ctg »). Une erreur d'un facteur 10 sur une dose est une erreur médicamenteuse grave."],
        ["Pourquoi passer par le gramme quand on hésite ?", "Le gramme sert de pivot : convertir d'abord en g puis vers l'unité voulue évite de mélanger les facteurs 10, 100 et 1000."]],
  talk: { prompt: "Explique comment convertir 25 cg en mg, puis 12,5 mg en g, sans regarder.", check: ["1 cg = 10 mg, donc 25 cg = 250 mg", "1 mg = 0,001 g, donc 12,5 mg = 0,0125 g", "Unité plus petite → on multiplie ; plus grande → on divise", "J'ai vérifié l'ordre de grandeur"] },
  traps: ["Croire que 1 g = 100 mg (c'est 1000 mg ; 1 g = 100 cg).", "Oublier le zéro de position : 12,5 mg = 0,0125 g (et non 0,125 g).", "Confondre mg et µg (facteur 1000)."] },

{ id: "volume", title: "Les unités de volume et les cuillères",
  html: `<table><tr><th>Unité</th><th>Équivalence</th></tr>
  <tr><td>1 L</td><td><span class="k">10 dL = 100 cL = 1000 mL</span></td></tr>
  <tr><td>1 mL</td><td><span class="k">1 cm³</span></td></tr></table>
  <p><b>Les cuillères</b> sur les ordonnances :</p>
  <table><tr><th>Abréviation</th><th>Volume</th></tr>
  <tr><td>C à s : cuillère à soupe</td><td><span class="k">15 mL</span></td></tr>
  <tr><td>C à d : cuillère à dessert</td><td><span class="k">10 mL</span></td></tr>
  <tr><td>C à c : cuillère à café</td><td><span class="k">5 mL</span></td></tr></table>
  <p><b>Nombre de prises dans un flacon</b> = volume du flacon ÷ volume d'une prise. Ex. 300 mL ÷ 5 mL = <span class="k">60 cuillères à café</span>.</p>
  <p><b>Volume nécessaire pour un traitement</b> = volume par prise × prises par jour × nombre de jours.</p>`,
  why: [["Pourquoi le nombre de cuillères dans le flacon est-il si utile ?", "Les formules donnent souvent la composition « par cuillère » : multiplier par le nombre de cuillères du flacon donne la quantité totale à peser."]],
  talk: { prompt: "Explique comment trouver le volume de suspension pour 8 jours à 4 cuillères à café par jour.", check: ["1 C à c = 5 mL", "4 × 5 = 20 mL par jour", "20 × 8 = 160 mL"] },
  traps: ["Inverser C à s (15 mL) et C à d (10 mL).", "Oublier de multiplier par le nombre de jours."] },

{ id: "magistrale", title: "La préparation magistrale",
  html: `<p><b>Définition</b> : médicament préparé <span class="k">extemporanément</span> à l'officine, <span class="k">sous la surveillance du pharmacien</span>, et le plus souvent <span class="k">sur prescription médicale</span>.</p>
  <p>Elle garde une place importante dans l'arsenal thérapeutique, notamment pour :</p>
  <ol><li><span class="k">Personnaliser le médicament</span> : adapter la posologie à l'âge du patient et à l'évolution de la maladie ;</li>
  <li><span class="k">Associer plusieurs principes actifs</span> dans une même forme ;</li>
  <li>Remplacer une <span class="k">spécialité non disponible</span> ;</li>
  <li>Un <span class="k">intérêt économique</span> pour certaines catégories de patients.</li></ol>
  <p><b>La prescription</b> : le format papier a pratiquement disparu au profit de la <span class="k">prescription électronique</span>.</p>`,
  why: [["Pourquoi « extemporanément » ?", "La préparation est faite au moment du besoin, pour un patient donné, et non fabriquée à l'avance en série comme une spécialité industrielle."],
        ["Pourquoi l'adaptation de la posologie justifie-t-elle une préparation ?", "Les spécialités n'existent qu'en quelques dosages (souvent adultes). Pour un enfant ou une posologie particulière, il faut des gélules au dosage exact."]],
  talk: { prompt: "Définis la préparation magistrale et cite ses 4 intérêts.", check: ["Préparée extemporanément", "À l'officine, sous la surveillance du pharmacien", "Le plus souvent sur prescription médicale", "Personnalisation de la posologie (âge, évolution)", "Association de principes actifs", "Spécialité non disponible", "Intérêt économique"] },
  traps: ["Dire « toujours sur prescription » : c'est « le plus souvent ».", "Oublier un des 4 intérêts (souvent l'intérêt économique)."] },

{ id: "abrev", title: "Lire une prescription : les abréviations",
  html: `<table><tr><th>Abréviation</th><th>Signification</th></tr>
  <tr><td><b>R\\ = Rp</b></td><td><span class="k">Prenez</span> (début de la formule)</td></tr>
  <tr><td><b>S\\</b></td><td><span class="k">Indiquez sur l'étiquette</span> (la posologie)</td></tr>
  <tr><td><b>Pf</b></td><td><span class="k">Pour faire une pièce de</span> (1 gélule, 1 suppositoire…)</td></tr>
  <tr><td><b>Dt (n°)</b></td><td><span class="k">Donnez</span> : nombre de doses unitaires à délivrer</td></tr>
  <tr><td><b>Qs</b></td><td><span class="k">Autant qu'il en faut</span> (quantum satis)</td></tr>
  <tr><td><b>Ad</b></td><td><span class="k">Jusqu'à</span> (on complète jusqu'à la quantité finale)</td></tr></table>
  <p><b>Lecture type</b> : « Rp hydrocortisone 5 mg pf 1 gél dt 60 » = <span class="k">5 mg par gélule, 60 gélules</span> → à peser : <span class="k">5 × 60 = 300 mg</span>.</p>
  <p>« aqua q.s. ad 200 mL » = on ajoute de l'eau <span class="k">jusqu'à un volume final de 200 mL</span>.</p>`,
  why: [["Pourquoi « ad » change-t-il le calcul ?", "Avec « ad 200 mL », le volume FINAL est 200 mL : les % m/V se calculent sur ce volume, pas sur la somme des ingrédients listés."],
        ["Pourquoi les doses du Rp sont-elles « par unité » ?", "Le prescripteur écrit la composition d'UNE pièce (pf 1 gél) ; la quantité totale dépend du « dt »."]],
  talk: { prompt: "Lis à voix haute « Rp X 10 mg, Y 5 mg pf 1 gél dt 20 » comme si tu l'expliquais à un stagiaire.", check: ["Rp = prenez", "10 mg de X et 5 mg de Y par gélule (pf 1 gél)", "dt 20 = 20 gélules à délivrer", "Quantités à peser : 200 mg de X et 100 mg de Y"] },
  traps: ["Confondre qs (autant qu'il en faut) et ad (jusqu'à).", "Oublier de multiplier la dose par le nombre « dt »."] },

{ id: "rp", title: "Du Rp à la quantité à peser",
  html: `<p><b>1. Quantité totale de principe actif (PA)</b> = <span class="k">dose par unité × nombre d'unités (dt)</span>.</p>
  <p><b>2. Si on part d'une spécialité</b> (comprimés, gélules du commerce) :</p>
  <div class="formula">nombre d'unités = quantité totale ÷ dosage d'une unité</div>
  <p>Ex. 30 mg × 60 gélules = 1800 mg ; avec des gélules à 50 mg : 1800 ÷ 50 = <span class="k">36 gélules</span>.</p>
  <p><b>3. Si le résultat n'est pas entier</b> : on prend <span class="k">le nombre entier supérieur</span>, on broie, puis on <span class="k">retire l'excès de poudre</span> au prorata :</p>
  <div class="formula">poudre à enlever = (PA en excès ÷ PA par comprimé) × masse d'un comprimé</div>
  <p>Ex. besoin 3200 mg, comprimés à 250 mg → 12,8 → <span class="k">13 comprimés</span> (3250 mg). Excès 50 mg = 0,2 comprimé ; si 1 comprimé pèse 1 g → enlever <span class="k">0,2 g</span>.</p>`,
  why: [["Pourquoi arrondir au supérieur et non à l'inférieur ?", "Avec moins de comprimés, il manquerait du PA : impossible à rattraper. Avec un de plus, on retire l'excès de poudre pesée."],
        ["Pourquoi la poudre à retirer est-elle proportionnelle à la masse du comprimé ?", "Le PA est réparti uniformément dans la poudre broyée : retirer 0,2 comprimé de PA revient à retirer 0,2 × la masse d'un comprimé."]],
  talk: { prompt: "Explique la démarche complète pour 160 mL de suspension à 100 mg/5 mL à partir de comprimés à 250 mg.", check: ["Concentration 20 mg/mL → 3200 mg", "3200 ÷ 250 = 12,8 → 13 comprimés", "Excès 50 mg = 0,2 comprimé", "Retirer 0,2 × masse d'un comprimé"] },
  traps: ["Confondre la quantité de PA (mg) avec le nombre de comprimés.", "Retirer l'excès de PA en mg au lieu de la masse de poudre correspondante."] },

{ id: "pct", title: "Les concentrations en %",
  html: `<table><tr><th>Notation</th><th>Signifie</th></tr>
  <tr><td><b>% (m/m)</b></td><td><span class="k">g de substance pour 100 g</span> de préparation</td></tr>
  <tr><td><b>% (m/V)</b></td><td><span class="k">g de substance pour 100 mL</span> de préparation</td></tr>
  <tr><td><b>% (V/V)</b></td><td><span class="k">mL de substance pour 100 mL</span> de préparation</td></tr></table>
  <div class="formula">masse (g) = % × quantité finale ÷ 100</div>
  <p>Ex. minoxidil 3 % (m/V) ad 200 mL → <span class="k">3 × 200 ÷ 100 = 6 g</span>.</p>
  <p><b>Retrouver un %</b> : % = masse (g) ÷ volume (mL) × 100. Ex. 10 ctg (0,10 g) dans 250 mL → <span class="k">0,04 %</span>.</p>
  <p><b>Quantité par prise</b> : un % (m/V) donne une concentration : 0,04 % = 0,04 g/100 mL = <span class="k">0,4 mg/mL</span> → par C à c (5 mL) : <span class="k">2 mg</span>.</p>
  <p><b>Astuce</b> : 1 % (m/V) = <span class="k">10 mg/mL</span>.</p>`,
  why: [["Pourquoi préciser m/m, m/V ou V/V ?", "Pour un liquide de densité ≠ 1, 100 g et 100 mL ne sont pas la même quantité : le même « % » donnerait des masses différentes."],
        ["Pourquoi 1 % (m/V) = 10 mg/mL ?", "1 g dans 100 mL = 1000 mg dans 100 mL = 10 mg dans 1 mL."]],
  talk: { prompt: "Explique comment trouver la dose de codéine dans 1 cuillère à café d'un sirop à 0,10 % (m/V).", check: ["0,10 % = 0,10 g / 100 mL", "= 1 mg/mL", "C à c = 5 mL → 5 mg"] },
  traps: ["Calculer le % sur la somme des ingrédients au lieu du volume final (« ad »).", "Oublier de convertir ctg/mg en g avant de calculer un %."] },

{ id: "densite", title: "Les densités",
  html: `<p>On mesure en général le <b>volume</b> d'un liquide. Mais pour un liquide <span class="k">très visqueux</span> (ou quand la formule est en masse), on doit <b>peser</b> : la densité permet de passer du volume à la masse.</p>
  <p>La densité compare la masse d'un volume de liquide à celle du même volume d'eau : celle de l'eau vaut <span class="k">1</span> (1 mL d'eau pèse 1 g).</p>
  <div class="formula">m = V × d    ·    V = m ÷ d</div>
  <table><tr><th>Solvant (20 °C)</th><th>Densité</th></tr>
  <tr><td>Éthanol</td><td><span class="k">0,79</span></td></tr><tr><td>Méthanol</td><td><span class="k">0,80</span></td></tr>
  <tr><td>Propylène glycol</td><td><span class="k">1,04</span></td></tr><tr><td>Isopropanol</td><td><span class="k">0,79</span></td></tr>
  <tr><td>Éther</td><td><span class="k">0,71</span></td></tr><tr><td>Acétone</td><td><span class="k">0,79</span></td></tr>
  <tr><td>Huile de paraffine</td><td><span class="k">0,86</span></td></tr></table>
  <p><b>Moyen mnémotechnique</b> : les alcools et l'acétone ≈ <span class="k">0,79–0,80</span> ; seul le <span class="k">propylène glycol</span> dépasse 1 ; l'éther est le plus léger (<span class="k">0,71</span>).</p>
  <p><b>Contrôle</b> : si d &lt; 1, le volume (mL) est <span class="k">plus grand</span> que la masse (g) ; si d &gt; 1, il est plus petit.</p>`,
  why: [["Pourquoi pèse-t-on les liquides visqueux ?", "Un liquide visqueux colle aux parois de l'éprouvette : le volume mesuré serait imprécis. Peser la masse correspondante (m = V × d) est plus exact."],
        ["Pourquoi 27 g de teinture (d = 0,9) font-ils 30 mL ?", "d < 1 : le liquide est plus léger que l'eau, donc il faut plus de volume pour la même masse : 27 ÷ 0,9 = 30 mL."]],
  talk: { prompt: "Explique comment mesurer le volume de teinture (d = 0,9) pour 540 g de sirop à 5 % (m/m).", check: ["5 % de 540 g = 27 g de teinture", "V = m ÷ d", "27 ÷ 0,9 = 30 mL", "d < 1 donc volume > masse : cohérent"] },
  traps: ["Multiplier au lieu de diviser (V = m ÷ d, pas m × d).", "Donner la masse (27 g) quand on demande un volume.", "Oublier que la densité de l'eau vaut exactement 1."] }
],

cards: [
{ c: "masse", front: "1 g = ? mg", back: "1000 mg" },
{ c: "masse", front: "1 g = ? cg", back: "100 cg" },
{ c: "masse", front: "1 cg = ? mg", back: "10 mg" },
{ c: "masse", front: "1 mg = ? g", back: "0,001 g" },
{ c: "masse", front: "1 mg = ? µg", back: "1000 µg" },
{ c: "masse", front: "Que signifie « ctg » ?", back: "Centigramme (cg) = 10 mg" },
{ c: "masse", front: "25 cg = ? mg", back: "250 mg" },
{ c: "masse", front: "12,5 mg = ? g", back: "0,0125 g" },
{ c: "masse", front: "58 cg = ? g", back: "0,58 g" },
{ c: "masse", front: "Vers une unité plus petite (g → mg), on… ?", back: "Multiplie (le nombre grandit)" },
{ c: "volume", front: "C à s = ? mL", back: "15 mL (cuillère à soupe)" },
{ c: "volume", front: "C à d = ? mL", back: "10 mL (cuillère à dessert)" },
{ c: "volume", front: "C à c = ? mL", back: "5 mL (cuillère à café)" },
{ c: "volume", front: "1 L = ? mL", back: "1000 mL" },
{ c: "volume", front: "1 dL = ? mL", back: "100 mL" },
{ c: "volume", front: "Combien de C à c dans 300 mL ?", back: "60" },
{ c: "magistrale", front: "Définition de la préparation magistrale ?", back: "Médicament préparé extemporanément à l'officine, sous la surveillance du pharmacien, le plus souvent sur prescription médicale" },
{ c: "magistrale", front: "Les 4 intérêts de la préparation magistrale ?", back: "Personnaliser la posologie (âge, évolution) · associer des PA · spécialité non disponible · intérêt économique" },
{ c: "magistrale", front: "« Extemporanément » signifie… ?", back: "Préparé au moment du besoin, pour un patient donné" },
{ c: "magistrale", front: "Quel format de prescription a remplacé le papier ?", back: "La prescription électronique" },
{ c: "abrev", front: "R\\ ou Rp", back: "Prenez" },
{ c: "abrev", front: "S\\", back: "Indiquez sur l'étiquette (posologie)" },
{ c: "abrev", front: "Pf", back: "Pour faire une pièce de" },
{ c: "abrev", front: "Dt (n°)", back: "Donnez (nombre de doses unitaires à délivrer)" },
{ c: "abrev", front: "Qs", back: "Autant qu'il en faut (quantum satis)" },
{ c: "abrev", front: "Ad", back: "Jusqu'à" },
{ c: "rp", front: "Quantité totale de PA à peser = ?", back: "Dose par unité × nombre d'unités (dt)" },
{ c: "rp", front: "Nombre de comprimés d'une spécialité à utiliser = ?", back: "Quantité totale de PA ÷ dosage d'un comprimé (arrondi au supérieur)" },
{ c: "rp", front: "Résultat non entier (12,8 comprimés) : que fait-on ?", back: "On prend 13 comprimés, on broie, puis on retire l'excès de poudre au prorata" },
{ c: "rp", front: "Poudre à enlever = ?", back: "(PA en excès ÷ PA par comprimé) × masse d'un comprimé" },
{ c: "pct", front: "% (m/m) = ?", back: "g de substance pour 100 g de préparation" },
{ c: "pct", front: "% (m/V) = ?", back: "g de substance pour 100 mL de préparation" },
{ c: "pct", front: "% (V/V) = ?", back: "mL de substance pour 100 mL de préparation" },
{ c: "pct", front: "1 % (m/V) = ? mg/mL", back: "10 mg/mL" },
{ c: "pct", front: "3 % (m/V) ad 200 mL : masse de PA ?", back: "6 g" },
{ c: "pct", front: "Avec « ad 250 mL », sur quoi calcule-t-on le % ?", back: "Sur le volume final : 250 mL" },
{ c: "densite", front: "Formule de la masse à partir du volume ?", back: "m = V × d" },
{ c: "densite", front: "Formule du volume à partir de la masse ?", back: "V = m ÷ d" },
{ c: "densite", front: "Densité de l'eau ?", back: "1" },
{ c: "densite", front: "Densité de l'éthanol ?", back: "0,79" },
{ c: "densite", front: "Densité du méthanol ?", back: "0,80" },
{ c: "densite", front: "Densité du propylène glycol ?", back: "1,04" },
{ c: "densite", front: "Densité de l'isopropanol ?", back: "0,79" },
{ c: "densite", front: "Densité de l'éther ?", back: "0,71" },
{ c: "densite", front: "Densité de l'acétone ?", back: "0,79" },
{ c: "densite", front: "Densité de l'huile de paraffine ?", back: "0,86" },
{ c: "densite", front: "Pourquoi pèse-t-on certains liquides au lieu de les mesurer ?", back: "Liquides très visqueux : la mesure du volume serait imprécise" }
],

quiz: [
{ id: "p1", c: "masse", q: "25 cg est égal à", o: ["2,5 mg", "25 mg", "250 mg", "0,25 mg"], a: 2, ex: "1 cg = 10 mg → 25 × 10 = 250 mg." },
{ id: "p2", c: "masse", q: "1 g est égal à", o: ["100 mg", "100 cg", "1000 cg", "10 000 mg"], a: 1, ex: "1 g = 100 cg = 1000 mg." },
{ id: "p3", c: "masse", q: "12,5 mg est égal à", o: ["0,125 g", "0,0125 g", "1,25 g", "0,00125 g"], a: 1, ex: "12,5 ÷ 1000 = 0,0125 g." },
{ c: "masse", q: "20 µg est égal à", o: ["0,2 mg", "0,02 mg", "2 mg", "0,002 mg"], a: 1, ex: "1 µg = 0,001 mg → 20 µg = 0,02 mg." },
{ c: "masse", t: "tf", q: "Vrai ou faux : pour passer des grammes aux milligrammes, on déplace la virgule de 3 rangs vers la droite.", a: 0, ex: "Vrai : g → mg = × 1000." },
{ c: "masse", q: "Quelle masse est la plus grande ?", o: ["0,5 g", "45 cg", "480 mg", "490 000 µg"], a: 0, ex: "En mg : 500 / 450 / 480 / 490. La plus grande est 0,5 g." },
{ id: "p4", c: "volume", q: "Une cuillère à dessert (C à d) correspond à", o: ["5 mL", "10 mL", "15 mL", "20 mL"], a: 1, ex: "C à c 5 mL · C à d 10 mL · C à s 15 mL." },
{ c: "volume", q: "Un flacon de 250 mL contient combien de cuillères à café ?", o: ["25", "50", "16", "125"], a: 1, ex: "250 ÷ 5 = 50." },
{ c: "volume", q: "Traitement : 2 C à s par jour pendant 10 jours. Volume nécessaire ?", o: ["150 mL", "200 mL", "300 mL", "100 mL"], a: 2, ex: "2 × 15 mL × 10 j = 300 mL." },
{ id: "p5", c: "magistrale", q: "Une préparation magistrale est préparée…", o: ["en série, à l'avance, par l'industrie", "extemporanément, à l'officine, sous la surveillance du pharmacien", "uniquement à l'hôpital", "toujours sans prescription"], a: 1, ex: "Définition : extemporanément, à l'officine, sous la surveillance du pharmacien, le plus souvent sur prescription médicale." },
{ c: "magistrale", q: "Lequel n'est PAS un intérêt de la préparation magistrale cité au cours ?", o: ["Individualiser la posologie selon l'âge", "Associer des principes actifs", "Remplacer une spécialité non disponible", "Allonger la date de péremption"], a: 3, ex: "Les 4 intérêts : posologie individualisée, association de PA, spécialité non disponible, intérêt économique." },
{ c: "magistrale", t: "tf", q: "Vrai ou faux : la préparation magistrale est toujours réalisée sur prescription médicale.", a: 1, ex: "Faux : « le plus souvent » sur prescription médicale." },
{ c: "magistrale", q: "Pour un enfant qui a besoin de 5 mg alors que la spécialité n'existe qu'à 20 mg, la préparation magistrale répond à quel intérêt ?", o: ["Intérêt économique", "Individualisation de la posologie", "Association de principes actifs", "Aucun"], a: 1, ex: "Adapter la posologie à l'âge du patient." },
{ id: "p6", c: "abrev", q: "« Qs » signifie", o: ["Jusqu'à", "Autant qu'il en faut", "Donnez", "Prenez"], a: 1, ex: "Qs = quantum satis = autant qu'il en faut. « Ad » = jusqu'à." },
{ c: "abrev", q: "« Dt 30 » signifie", o: ["30 mg par dose", "Donnez 30 doses unitaires", "30 jours de traitement", "Diluez 30 fois"], a: 1, ex: "Dt = donnez (nombre de doses unitaires à délivrer)." },
{ c: "abrev", q: "« S\\ » sur une ordonnance signifie", o: ["Solution", "Indiquez sur l'étiquette", "Sirop", "Stérile"], a: 1, ex: "S\\ = indiquez sur l'étiquette (la posologie)." },
{ c: "abrev", q: "« Pf 1 gél » signifie", o: ["Prendre 1 gélule", "Pour faire une gélule", "Poids final 1 g", "Par flacon"], a: 1, ex: "Pf = pour faire une pièce de." },
{ c: "abrev", q: "« aqua q.s. ad 200 mL » signifie", o: ["Ajouter 200 mL d'eau", "Ajouter de l'eau jusqu'à un volume final de 200 mL", "Ajouter de l'eau à volonté", "200 mL d'eau par dose"], a: 1, ex: "Le volume final de la préparation est 200 mL." },
{ id: "p7", c: "rp", q: "Rp prednisolone 5 mg pf 1 gél dt 20. Quantité de prednisolone à peser ?", o: ["5 mg", "50 mg", "100 mg", "1 g"], a: 2, ex: "5 mg × 20 = 100 mg." },
{ c: "rp", q: "Il faut 1800 mg d'un PA ; on dispose de gélules à 50 mg. Combien de gélules ?", o: ["30", "36", "40", "18"], a: 1, ex: "1800 ÷ 50 = 36." },
{ c: "rp", q: "Le calcul donne 12,8 comprimés à broyer. On en prend…", o: ["12, et on complète avec de l'excipient", "13, puis on retire l'excès de poudre", "12,8 en coupant un comprimé", "14 par sécurité"], a: 1, ex: "On arrondit au supérieur puis on retire la poudre en excès au prorata." },
{ c: "rp", q: "13 comprimés à 250 mg broyés pèsent 13 g ; il faut 3200 mg de PA. Poudre à enlever ?", o: ["0,05 g", "0,2 g", "0,5 g", "2 g"], a: 1, ex: "Excès 50 mg = 0,2 comprimé ; 1 comprimé = 1 g → 0,2 g." },
{ id: "p8", c: "pct", q: "% (m/V) signifie", o: ["g pour 100 g", "g pour 100 mL", "mL pour 100 mL", "mg pour 100 mL"], a: 1, ex: "m/V = masse (g) pour 100 mL." },
{ c: "pct", q: "Minoxidil 3 % (m/V), … , aqua q.s. ad 200 mL. Masse de minoxidil ?", o: ["3 g", "4,5 g", "6 g", "600 mg"], a: 2, ex: "3 g/100 mL × 200 mL = 6 g (volume final)." },
{ c: "pct", q: "1 % (m/V) correspond à", o: ["1 mg/mL", "10 mg/mL", "100 mg/mL", "0,1 mg/mL"], a: 1, ex: "1 g/100 mL = 1000 mg/100 mL = 10 mg/mL." },
{ c: "pct", q: "0,25 g de codéine dans 250 mL : % (m/V) ?", o: ["0,25 %", "0,10 %", "1 %", "0,04 %"], a: 1, ex: "0,25 ÷ 250 × 100 = 0,10 %." },
{ c: "pct", q: "Sirop à 0,04 % (m/V) : quantité dans une C à c ?", o: ["0,2 mg", "2 mg", "20 mg", "0,02 mg"], a: 1, ex: "0,04 % = 0,4 mg/mL × 5 mL = 2 mg." },
{ c: "pct", q: "Une solution à 1 % (m/m) de nitroglycérine : 2 mg de nitroglycérine sont contenus dans", o: ["20 mg de solution", "200 mg de solution", "2 g de solution", "2 mg de solution"], a: 1, ex: "1 g pour 100 g → 2 mg pour 200 mg." },
{ c: "pct", t: "tf", q: "Vrai ou faux : pour un liquide de densité ≠ 1, 5 % (m/m) et 5 % (m/V) donnent la même masse de PA.", a: 1, ex: "Faux : 100 g et 100 mL ne correspondent pas à la même quantité de liquide si d ≠ 1." },
{ c: "densite", q: "L'eau a une densité", o: ["inférieure à 1", "supérieure à 1", "égale à 1", "inconnue"], a: 2, ex: "Référence : 1 mL d'eau = 1 g." },
{ c: "densite", q: "Quel solvant a une densité supérieure à 1 ?", o: ["Éthanol", "Huile de paraffine", "Propylène glycol", "Acétone"], a: 2, ex: "Propylène glycol : 1,04." },
{ c: "densite", q: "Quel est le plus léger (plus faible densité) ?", o: ["Éther", "Méthanol", "Isopropanol", "Huile de paraffine"], a: 0, ex: "Éther 0,71." },
{ c: "densite", q: "Pour convertir une masse en volume, on…", o: ["multiplie par la densité", "divise par la densité", "ajoute la densité", "multiplie par 100"], a: 1, ex: "V = m ÷ d." },
{ id: "p9", c: "densite", q: "27 g de teinture de densité 0,9 occupent", o: ["24,3 mL", "27 mL", "30 mL", "3 mL"], a: 2, ex: "27 ÷ 0,9 = 30 mL." },
{ c: "densite", q: "100 mL d'éthanol pèsent", o: ["100 g", "79 g", "126,6 g", "7,9 g"], a: 1, ex: "100 × 0,79 = 79 g." },
{ c: "densite", q: "Pourquoi utilise-t-on la densité à l'officine ?", o: ["Pour diluer les alcools", "Pour peser un liquide qu'on ne peut pas mesurer précisément au volume (visqueux)", "Pour calculer un pourcentage V/V", "Pour stériliser"], a: 1, ex: "Liquides très visqueux : on convertit le volume voulu en masse à peser." }
],

gens: {
masse: { c: "masse", method: "Conversion d'unités", make() {
  const pairs = [["cg", "mg"], ["mg", "g"], ["cg", "g"], ["g", "mg"], ["g", "cg"], ["µg", "mg"], ["mg", "µg"], ["ctg", "mg"], ["dg", "mg"], ["mg", "cg"]];
  const [f, t] = pick(pairs);
  const vals = { cg: [5, 10, 18, 25, 58, 75, 125, 250], ctg: [10, 18, 25, 50], mg: [2.5, 12.5, 30, 75, 125, 300, 450, 1800], g: [0.25, 0.5, 1, 1.25, 2, 5], "µg": [20, 30, 50, 400, 900, 2500], dg: [1, 2, 5, 15] };
  const v = pick(vals[f]); const ans = r10(v * U[f] / U[t]);
  return { q: `${fmt(v)} ${f} = ? ${t === "ctg" ? "cg" : t}`, ans, unit: t, tol: { rel: 0.001 }, steps: [`1 ${f} = ${fmt(r10(U[f] / U[t]), 8)} ${t}`, `${fmt(v)} × ${fmt(r10(U[f] / U[t]), 8)} = <b>${fmt(ans, 8)} ${t}</b>`] };
} },
volume: { c: "volume", method: "Volumes et cuillères", make() {
  if (Math.random() < .5) {
    const [n, ml] = pick(SPOON); const per = rnd(2, 4), days = pick([5, 7, 8, 10, 14]);
    const ans = per * ml * days;
    return { q: `Traitement : ${per} ${n.split("(")[1].replace(")", "")} par jour pendant ${days} jours. Volume nécessaire ?`, ans, unit: "mL", steps: [`1 ${n} = ${ml} mL`, `${per} × ${ml} = ${per * ml} mL par jour`, `${per * ml} × ${days} = <b>${ans} mL</b>`] };
  }
  const [n, ml] = pick(SPOON); const vol = pick([150, 200, 250, 300, 450, 600]);
  if (vol % ml) return this.make();
  return { q: `Combien de ${n.split("(")[1].replace(")", "")} dans un flacon de ${vol} mL ?`, ans: vol / ml, unit: "", steps: [`1 ${n} = ${ml} mL`, `${vol} ÷ ${ml} = <b>${vol / ml}</b>`] };
} },
dose: { c: "rp", method: "Dose × nombre d'unités", make() {
  const pa = pick(PA); const d = pick([0.5, 1, 2.5, 5, 10, 12.5, 20, 25, 30, 40]); const n = pick([10, 20, 30, 40, 50, 60, 90, 100, 120]);
  const tot = r10(d * n);
  return { ctx: `Rp ${pa} ${fmt(d)} mg\n   pf 1 gél dt ${n}`, q: `Quantité ${de(pa)} à peser, en grammes ?`, ans: r10(tot / 1000), unit: "g", tol: { rel: 0.001 }, steps: [`${fmt(d)} mg × ${n} gélules = ${fmt(tot)} mg`, `${fmt(tot)} mg ÷ 1000 = <b>${fmt(tot / 1000, 6)} g</b>`] };
} },
spec: { c: "rp", method: "Nombre d'unités d'une spécialité", make() {
  const pa = pick(PA); const dos = pick([10, 20, 25, 40, 50, 100]); const n = pick([20, 30, 40, 60, 90, 120]);
  const d = pick([5, 10, 15, 20, 25, 30].filter(x => x < dos * 2));
  const tot = d * n; if (tot % dos) return this.make();
  return { ctx: `Rp ${pa} ${d} mg (utiliser comprimés à ${dos} mg)\n   pf 1 gél dt ${n}`, q: `Combien de comprimés à ${dos} mg faut-il utiliser ?`, ans: tot / dos, unit: "comprimés", steps: [`PA total : ${d} × ${n} = ${tot} mg`, `${tot} ÷ ${dos} = <b>${tot / dos} comprimés</b>`] };
} },
pctmv: { c: "pct", method: "% → masse à peser", make() {
  const p = pick([0.05, 0.1, 0.5, 1, 2, 2.5, 3, 5]); const v = pick([50, 100, 150, 200, 250, 300, 500]);
  const pa = pick(["minoxidil", "acide salicylique", "lidocaïne", "érythromycine", "métronidazole"]);
  const ans = r10(p * v / 100);
  return { ctx: `Rp solution ${de(pa)} à ${fmt(p)} % (m/V)\n   …\n   aqua q.s. ad ${v} mL`, q: `Masse ${de(pa)} à peser (g) ?`, ans, unit: "g", tol: { rel: 0.001 }, steps: [`${fmt(p)} % (m/V) = ${fmt(p)} g pour 100 mL`, `Volume final (ad) : ${v} mL`, `${fmt(p)} × ${v} ÷ 100 = <b>${fmt(ans, 6)} g</b>`] };
} },
pctdose: { c: "pct", method: "% → quantité par prise", make() {
  const p = pick([0.02, 0.04, 0.05, 0.1, 0.2, 0.5, 1]); const [n, ml] = pick(SPOON);
  const mgml = r10(p * 10); const ans = r10(mgml * ml);
  return { q: `Sirop à ${fmt(p)} % (m/V). Quantité de PA dans une ${n} ?`, ans, unit: "mg", tol: { rel: 0.001 }, steps: [`${fmt(p)} % (m/V) = ${fmt(p)} g/100 mL = ${fmt(mgml)} mg/mL`, `1 ${n} = ${ml} mL`, `${fmt(mgml)} × ${ml} = <b>${fmt(ans)} mg</b>`] };
} },
conc: { c: "pct", method: "Masse → %", make() {
  const m = pick([10, 18, 25, 50, 100]); const v = pick([100, 125, 200, 250, 500]); const u = pick(["ctg", "mg"]);
  const g = r10(m * U[u]); const ans = r10(g / v * 100);
  return { ctx: `Rp … ${fmt(m)} ${u}\n   …\n   sirop simple ad ${v} mL`, q: `% (m/V) de ce principe actif dans la préparation ?`, ans, unit: "%", tol: { rel: 0.001 }, steps: [`${fmt(m)} ${u} = ${fmt(g, 6)} g`, `${fmt(g, 6)} g ÷ ${v} mL × 100 = <b>${fmt(ans, 6)} %</b>`] };
} },
densV: { c: "densite", method: "Densité : masse ↔ volume", make() {
  if (Math.random() < .5) {
    const [s, d] = pick(SOLV.slice(0, 7)); const v = pick([10, 20, 25, 30, 50, 100]);
    const ans = r10(v * d);
    return { q: `Combien pèsent ${v} mL ${de(s)} ? (densité à retrouver de mémoire)`, ans, unit: "g", tol: { rel: 0.002 }, steps: [`Densité du ${s} : ${fmt(d)}`, `m = V × d = ${v} × ${fmt(d)} = <b>${fmt(ans)} g</b>`] };
  }
  const p = pick([2, 4, 5, 10]); const M = pick([200, 300, 450, 500, 540, 600]); const d = pick([0.8, 0.9, 1.2, 1.25]);
  const m = r10(p * M / 100); const ans = r10(m / d);
  return { ctx: `Sirop contenant ${p} % (m/m) de teinture (densité ${fmt(d)})`, q: `Volume de teinture à mesurer pour ${M} g de sirop ?`, ans, unit: "mL", tol: { rel: 0.002 }, steps: [`Masse de teinture : ${p} % de ${M} g = ${fmt(m)} g`, `V = m ÷ d = ${fmt(m)} ÷ ${fmt(d)} = <b>${fmt(ans, 3)} mL</b>`] };
} }
},

worked: [
{ id: "w1", title: "Dose totale à peser (Rp … pf … dt)", gen: "dose", make() {
  const pa = pick(PA); const d = pick([2.5, 5, 10, 12.5, 25]); const n = pick([20, 30, 60, 90]); const t = r10(d * n);
  return { ctx: `Rp ${pa} ${fmt(d)} mg\n   pf 1 gél dt ${n}`, q: `Quelle quantité ${de(pa)} faut-il peser, en g ?`, steps: [
    { label: "Dose par gélule (lire « pf 1 gél »)", ans: d, unit: "mg", show: `${fmt(d)} mg par gélule`, why: "« pf 1 gél » : les quantités écrites sont celles d'UNE gélule." },
    { label: "Nombre de gélules (lire « dt »)", ans: n, unit: "gélules", show: `${n} gélules`, why: "« dt » = donnez : nombre de doses unitaires à délivrer." },
    { label: "Quantité totale en mg", ans: t, unit: "mg", show: `${fmt(d)} × ${n} = ${fmt(t)} mg`, why: "Total = dose par unité × nombre d'unités." },
    { label: "Conversion en g", ans: r10(t / 1000), unit: "g", tol: { rel: 0.001 }, show: `${fmt(t)} ÷ 1000 = ${fmt(t / 1000, 6)} g`, why: "1 g = 1000 mg : vers une unité plus grande, on divise." }] };
} },
{ id: "w2", title: "Spécialité à broyer + excès de poudre", make() {
  const per = pick([2, 3, 4]); const days = pick([7, 8, 10]); const conc = pick([50, 100, 125]); const dos = pick([250, 500]); const pw = pick([0.5, 1, 1.2]);
  const vol = per * 5 * days; const tot = r10(vol * conc / 5); let n = Math.ceil(tot / dos);
  if (tot % dos === 0) return this.make();
  const exc = r10(n * dos - tot); const rem = r10(exc / dos * pw);
  return { ctx: `Suspension à ${conc} mg / 5 mL à partir de comprimés à ${dos} mg (1 comprimé pèse ${fmt(pw)} g).\nTraitement : ${per} C à c par jour pendant ${days} jours.`, q: "Combien de comprimés broyer et quelle masse de poudre retirer ?", steps: [
    { label: "Volume de suspension", ans: vol, unit: "mL", show: `${per} × 5 mL × ${days} j = ${vol} mL`, why: "C à c = 5 mL ; volume = prise × prises/jour × jours." },
    { label: "Quantité totale de PA", ans: tot, unit: "mg", show: `${conc} mg/5 mL = ${conc / 5} mg/mL → ${vol} × ${conc / 5} = ${fmt(tot)} mg`, why: "La concentration × le volume donne la quantité de PA." },
    { label: "Comprimés à broyer (entier supérieur)", ans: n, unit: "comprimés", show: `${fmt(tot)} ÷ ${dos} = ${fmt(tot / dos, 3)} → ${n}`, why: "On ne peut pas ajouter du PA après coup : on arrondit au-dessus." },
    { label: "Masse de poudre à retirer", ans: rem, unit: "g", tol: { rel: 0.01 }, show: `excès ${fmt(exc)} mg = ${fmt(exc / dos, 3)} comprimé × ${fmt(pw)} g = ${fmt(rem, 4)} g`, why: "Le PA est réparti dans toute la poudre : on retire la fraction de comprimé en trop." }] };
} },
{ id: "w3", title: "% (m/V) avec « ad »", gen: "pctmv", make() {
  const p = pick([1, 2, 2.5, 3, 5]); const parts = [pick([20, 30]), pick([20, 30]), pick([10, 20])]; const v = pick([100, 150, 200, 250]);
  const g = r10(p * v / 100);
  return { ctx: `Rp solution de minoxidil à ${fmt(p)} % (m/V)\n   minoxidil x g\n   alcool dénaturé ${parts[0]} mL\n   alcool isopropylique ${parts[1]} mL\n   propylène glycol ${parts[2]} mL\n   aqua q.s. ad ${v} mL`, q: "Quelle masse de minoxidil peser ?", steps: [
    { label: "Volume de référence pour le %", ans: v, unit: "mL", show: `${v} mL (volume final « ad »)`, why: "Le % porte sur la préparation finale, pas sur la somme des solvants listés." },
    { label: "Masse pour 100 mL", ans: p, unit: "g", show: `${fmt(p)} g / 100 mL`, why: "% (m/V) = g pour 100 mL." },
    { label: "Masse totale", ans: g, unit: "g", tol: { rel: 0.001 }, show: `${fmt(p)} × ${v} ÷ 100 = ${fmt(g)} g`, why: "Règle de trois sur le volume final." }] };
} },
{ id: "w4", title: "Quantité de PA par cuillère", gen: "pctdose", make() {
  const m = pick([10, 25, 50]); const v = pick([200, 250]); const [n, ml] = pick(SPOON);
  const g = m / 100; const pc = r10(g / v * 100); const mgml = r10(pc * 10); const dose = r10(mgml * ml);
  return { ctx: `Rp … HCl éthylmorphine ${m} ctg\n   …\n   sirop simple ad ${v} mL`, q: `Quelle quantité d'HCl éthylmorphine dans une ${n} ?`, steps: [
    { label: "Masse en grammes", ans: g, unit: "g", show: `${m} ctg = ${fmt(g)} g`, why: "1 ctg = 0,01 g." },
    { label: "% (m/V)", ans: pc, unit: "%", tol: { rel: 0.001 }, show: `${fmt(g)} ÷ ${v} × 100 = ${fmt(pc, 6)} %`, why: "% = g pour 100 mL de préparation finale." },
    { label: "Concentration en mg/mL", ans: mgml, unit: "mg/mL", tol: { rel: 0.001 }, show: `${fmt(pc, 6)} % × 10 = ${fmt(mgml, 6)} mg/mL`, why: "1 % (m/V) = 10 mg/mL." },
    { label: "Quantité par prise", ans: dose, unit: "mg", tol: { rel: 0.001 }, show: `${fmt(mgml, 6)} × ${ml} mL = ${fmt(dose, 6)} mg`, why: `1 ${n} = ${ml} mL.` }] };
} },
{ id: "w5", title: "% (m/m) puis densité", gen: "densV", make() {
  const p = pick([4, 5, 10]); const M = pick([360, 450, 540, 720]); const d = pick([0.9, 1.2]);
  const m = r10(p * M / 100); const V = r10(m / d);
  return { ctx: `Sirop de belladone : ${p} % (m/m) de teinture de belladone dans du sirop simple.\nTeinture de belladone : densité ${fmt(d)}.`, q: `Quel volume de teinture mesurer pour ${M} g de sirop ?`, steps: [
    { label: "Masse de teinture", ans: m, unit: "g", show: `${p} % de ${M} g = ${fmt(m)} g`, why: "% (m/m) = g pour 100 g : on applique le % à la masse totale." },
    { label: "Formule à utiliser", ans: d, unit: "(densité)", show: `V = m ÷ d, avec d = ${fmt(d)}`, why: "On cherche un volume à partir d'une masse : on divise par la densité." },
    { label: "Volume à mesurer", ans: V, unit: "mL", tol: { rel: 0.002 }, show: `${fmt(m)} ÷ ${fmt(d)} = ${fmt(V, 3)} mL`, why: d < 1 ? "d < 1 : volume plus grand que la masse, c'est cohérent." : "d > 1 : volume plus petit que la masse, c'est cohérent." }] };
} }
],

sprints: [
{ id: "sm", title: "Conversions de masse", target: 15, make() { const x = DATA.gens.masse.make(); return { q: x.q, ans: x.ans, unit: x.unit, tol: x.tol }; } },
{ id: "sv", title: "Volumes et cuillères", target: 15, make() {
  const k = rnd(0, 3);
  if (k === 0) { const [n, ml] = pick(SPOON); return { q: `${n.split("(")[1].replace(")", "")} = ? mL`, ans: ml, unit: "mL" }; }
  if (k === 1) { const v = pick([0.25, 0.5, 1, 1.5, 2]); return { q: `${fmt(v)} L = ? mL`, ans: v * 1000, unit: "mL" }; }
  if (k === 2) { const [n, ml] = pick(SPOON); const c = pick([2, 3, 4, 6]); return { q: `${c} ${n.split("(")[1].replace(")", "")} = ? mL`, ans: c * ml, unit: "mL" }; }
  const v = pick([100, 150, 200, 300]); return { q: `${v} mL = combien de C à c ?`, ans: v / 5, unit: "" };
} },
{ id: "sa", title: "Abréviations des ordonnances", target: 20, make() {
  const L = [["Rp", "Prenez"], ["S\\", "Indiquez sur l'étiquette"], ["Pf", "Pour faire une pièce de"], ["Dt", "Donnez"], ["Qs", "Autant qu'il en faut"], ["Ad", "Jusqu'à"]];
  const [ab, m] = pick(L); const o = shuffle(L.map(x => x[1])).slice(0, 4); if (!o.includes(m)) o[rnd(0, 3)] = m;
  return { q: `« ${ab} » = ?`, o, a: o.indexOf(m) };
} },
{ id: "sd", title: "Densités du tableau", target: 15, make() {
  const [s, d] = pick(SOLV); const vals = ["0,71", "0,79", "0,80", "0,86", "1", "1,04"]; const good = fmt(d);
  const o = shuffle(vals.filter(v => v !== good)).slice(0, 3).concat(good); const oo = shuffle(o);
  return { q: `Densité : ${s} ?`, o: oo, a: oo.indexOf(good) };
} },
{ id: "sp", title: "% → grammes et mg/mL", target: 12, make() {
  if (Math.random() < .5) { const p = pick([0.5, 1, 2, 3, 5]); const v = pick([100, 200, 250, 500]); return { q: `${fmt(p)} % (m/V) ad ${v} mL → ? g`, ans: r10(p * v / 100), unit: "g" }; }
  const p = pick([0.04, 0.1, 0.5, 1, 2]); return { q: `${fmt(p)} % (m/V) = ? mg/mL`, ans: r10(p * 10), unit: "mg/mL" };
} }
],

pretest: ["p1", "p3", "p4", "p6", "p5", "p7", "p8", "p9", "conc", "densV"]
};

const METHODS_HTML = `
<div class="card"><h2>Pourquoi cette page est construite ainsi</h2>
<p class="small" style="margin-top:0">Chaque outil de cette page applique une méthode dont l'efficacité a été mesurée dans des études contrôlées en psychologie cognitive et en sciences de l'éducation. La grande revue de Dunlosky et al. (2013) a évalué 10 techniques d'étude : <b>se tester</b> (pratique de récupération) et <b>espacer les révisions</b> obtiennent la note d'utilité la plus élevée ; l'<b>entrelacement</b>, l'<b>interrogation élaborative</b> et l'<b>auto-explication</b> une note moyenne ; <b>relire, surligner et résumer</b> une note faible.</p>
<div class="box trap" style="margin-bottom:0"><b>À éviter :</b> relire le PDF plusieurs fois ou surligner. On a l'impression de savoir parce que le texte est familier, mais on ne s'entraîne pas à le retrouver seule, ce que l'examen exige.</div></div>

<div class="card"><h2>Les méthodes, et où elles sont dans la page</h2>
<div class="method"><b>1. Se tester plutôt que relire (pratique de récupération)</b><br><span class="small">Flashcards, Quiz, Séance du jour. Dans l'étude de Roediger &amp; Karpicke (2006), les étudiants qui s'étaient testés retenaient nettement plus une semaine plus tard que ceux qui avaient relu. Réponds toujours <b>avant</b> de voir la réponse, même si tu n'es pas sûre.</span></div>
<div class="method"><b>2. Espacer les séances</b><br><span class="small">Plan J+1, J+3, J+7, J+14, J+30 et boîtes des flashcards. Cepeda et al. (2008, plus de 1 350 participants) montrent que l'intervalle optimal entre deux révisions augmente avec le délai jusqu'à l'examen. Mieux vaut 15 minutes réparties sur 5 jours que 75 minutes la veille.</span></div>
<div class="method"><b>3. Réapprendre jusqu'au critère, sur plusieurs séances (réapprentissage successif)</b><br><span class="small">Dans les sessions, une question ratée revient jusqu'à ce que tu la réussisses ; puis elle revient les jours suivants. Rawson &amp; Dunlosky recommandent de réussir chaque élément au moins une fois par séance, sur environ 3 séances espacées : c'est ce qui rend le souvenir durable.</span></div>
<div class="method"><b>4. Mélanger les types de problèmes (entrelacement)</b><br><span class="small">Onglet Mélange et Séance du jour. En maths, des élèves ayant mélangé les types d'exercices ont nettement mieux réussi un test surprise un mois plus tard (61 % contre 38 % dans un essai sur 787 élèves de Rohrer et al.). Le gain vient surtout du fait qu'il faut <b>choisir la méthode</b> : c'est pour cela que l'onglet Mélange te demande d'abord « quelle méthode ? ». C'est plus difficile sur le moment, et c'est normal.</span></div>
<div class="method"><b>5. Exemples résolus puis aide qui s'estompe</b><br><span class="small">Onglet Exemples guidés. Au début d'un apprentissage, étudier un exemple résolu est plus efficace que de chercher seule (Sweller ; Renkl). Ensuite, on retire les étapes en commençant par la fin (« estompage arrière », Renkl &amp; Atkinson), jusqu'à résoudre seule. Le niveau s'adapte à tes réussites.</span></div>
<div class="method"><b>6. Se demander « pourquoi ? » et s'expliquer les étapes</b><br><span class="small">Encadrés « Pourquoi ? » de la Leçon active et boutons « pourquoi ? » des exemples. Relier chaque règle à sa raison (interrogation élaborative, auto-explication) aide à comprendre et à transférer à des problèmes nouveaux.</span></div>
<div class="method"><b>7. Expliquer à voix haute, sans regarder</b><br><span class="small">Encadrés « Explique à voix haute ». C'est une forme de rappel libre et d'auto-explication. La liste à cocher te montre ce que tu as oublié.</span></div>
<div class="method"><b>8. Se tester avant d'apprendre (pré-test)</b><br><span class="small">Bouton Pré-test. Essayer de répondre avant d'avoir étudié, même en se trompant, améliore la mémorisation de ce qu'on apprend ensuite (Richland, Kornell &amp; Kao, 2009 ; Kornell, Hays &amp; Bjork, 2009).</span></div>
<div class="method"><b>9. Noter sa certitude et corriger les erreurs « sûres »</b><br><span class="small">Boutons Sûre / Hésitante / Au hasard et tableau de calibration. Les erreurs commises avec une forte confiance sont paradoxalement les mieux corrigées après le feedback (effet d'hypercorrection, Butterfield &amp; Metcalfe, 2001). Comparer ta confiance à tes résultats t'apprend aussi à savoir ce que tu sais vraiment.</span></div>
<div class="method"><b>10. Rendre les bases automatiques (sprints)</b><br><span class="small">Onglet Sprint. Quand les conversions, abréviations et densités sont instantanées, ta mémoire de travail reste disponible pour le raisonnement. On vise d'abord la précision, ensuite la vitesse. Honnêtement : cette idée est surtout étudiée pour le calcul de base chez les enfants, et une étude n'a pas trouvé d'avantage de rétention au simple entraînement chronométré par rapport à la même quantité de pratique. Utilise donc les sprints en complément, pas à la place des autres méthodes.</span></div>
<div class="method"><b>11. Une méthode de calcul stable, avec les unités</b><br><span class="small">Dans les corrections, chaque étape garde son unité (mg, g, mL). En formation infirmière, apprendre à poser les calculs de doses avec les unités (analyse dimensionnelle) a amélioré la précision par rapport au calcul classique. Écris toujours l'unité à chaque ligne et vérifie l'ordre de grandeur.</span></div>
</div>

<div class="card"><h2>Mode d'emploi conseillé</h2><ol class="steps">
<li><b>Jour 0 (45-60 min)</b> : Pré-test → Leçon active (notion par notion : « pourquoi ? », voix haute, « Me tester ») → Exemples guidés jusqu'au niveau 3 ou 4.</li>
<li><b>J+1, J+3, J+7, J+14, J+30 (15-20 min)</b> : Séance du jour + 1 ou 2 sprints de 60 s + 5 problèmes mélangés.</li>
<li><b>Quand une notion reste « En cours »</b> : rouvre-la dans la Leçon (mode « Masquer l'essentiel »), refais son test, puis un exemple guidé.</li>
<li><b>Avant l'examen</b> : une séance la veille et l'avant-veille, et le Quiz complet en conditions réelles. Pas de grosse relecture la dernière nuit : dormir aide à consolider.</li>
<li><b>Exercices du cours et du livre (Ansel)</b> : fais-les mélangés, pas chapitre par chapitre, et sans regarder la correction avant d'avoir une réponse.</li></ol></div>

<div class="card src"><h2>Sources</h2><ul class="small">
<li>Dunlosky, Rawson, Marsh, Nathan &amp; Willingham (2013), <i>Improving Students' Learning With Effective Learning Techniques</i>, Psychological Science in the Public Interest 14(1). <a href="https://doi.org/10.1177/1529100612453266" target="_blank">doi:10.1177/1529100612453266</a></li>
<li>Roediger &amp; Karpicke (2006), <i>Test-Enhanced Learning</i>, Psychological Science 17(3). <a href="https://psychology.ecu.edu/wp-content/pv-uploads/sites/216/2019/03/Roediger-Karpicke-2006.pdf" target="_blank">PDF</a></li>
<li>Cepeda, Vul, Rohrer, Wixted &amp; Pashler (2008), <i>Spacing Effects in Learning: A Temporal Ridgeline of Optimal Retention</i>, Psychological Science 19(11). <a href="https://escholarship.org/uc/item/0kp5q19x" target="_blank">eScholarship</a></li>
<li>Rawson &amp; Dunlosky : réapprentissage successif. <a href="https://journals.sagepub.com/doi/full/10.1177/09637214221100484" target="_blank">Current Directions in Psychological Science</a> · <a href="https://www.retrievalpractice.org/archive/2018/successive-relearning" target="_blank">synthèse retrievalpractice.org</a></li>
<li>Rohrer, Dedrick, Hartwig &amp; Cheung (2020), <i>A randomized controlled trial of interleaved mathematics practice</i>, Journal of Educational Psychology 112(1) · Rohrer, Dedrick &amp; Burgess (2014), <a href="https://link.springer.com/article/10.3758/s13423-014-0588-3" target="_blank">Psychonomic Bulletin &amp; Review</a></li>
<li>Renkl, Atkinson, Maier &amp; Staley (2002) ; Atkinson, Renkl &amp; Merrill (2003) : estompage des exemples résolus. <a href="https://en.wikipedia.org/wiki/Worked-example_effect" target="_blank">Synthèse</a></li>
<li>Butterfield &amp; Metcalfe (2001, 2006) : effet d'hypercorrection. <a href="https://core.ac.uk/download/357328401.pdf" target="_blank">PDF</a></li>
<li>Richland, Kornell &amp; Kao (2009), <i>The Pretesting Effect</i>. <a href="https://learninglab.uchicago.edu/Pre-Testing_files/RichlandKornellKao.pdf" target="_blank">PDF</a></li>
<li>Greenfield, Whelan &amp; Cohn (2006), <i>Use of dimensional analysis to reduce medication errors</i>, Journal of Nursing Education 45(2). <a href="https://psnet.ahrq.gov/issue/use-dimensional-analysis-reduce-medication-errors" target="_blank">PSNet</a></li>
</ul></div>`;

/* ================= MOTEUR ================= */
const KEY = "mphab287-theorie-" + DATA.id;
const INTERVALS = [0, 1, 3, 7, 14, 30, 60];
const $ = s => document.querySelector(s);
const V = () => $("#view");
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function fmt(n, d = 8) {
  if (typeof n !== "number" || !isFinite(n)) return String(n);
  let s = (Math.round(n * 10 ** d) / 10 ** d).toFixed(d).replace(/0+$/, "").replace(/\.$/, "");
  const [i, f] = s.split(".");
  const ii = i.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return f ? ii + "," + f : ii;
}
function parseNum(s) {
  if (s == null) return NaN;
  s = String(s).trim().replace(/\s| /g, "").replace(",", ".");
  if (s === "½") return 0.5;
  if (/^-?\d+(\.\d+)?\/\d+(\.\d+)?$/.test(s)) { const [a, b] = s.split("/"); return parseFloat(a) / parseFloat(b); }
  if (!/^-?(\d+\.?\d*|\.\d+)(e-?\d+)?$/i.test(s)) return NaN;
  return parseFloat(s);
}
function near(x, target, tol) {
  if (isNaN(x)) return false;
  if (tol && tol.abs != null) return Math.abs(x - target) <= tol.abs + 1e-12;
  const rel = tol && tol.rel != null ? tol.rel : 0.005;
  return Math.abs(x - target) <= Math.max(Math.abs(target) * rel, 1e-12);
}
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function today() { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function addDays(iso, n) { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function diffDays(a, b) { return Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 864e5); }
function frDate(iso) { return new Date(iso + "T12:00:00").toLocaleDateString("fr-BE", { weekday: "short", day: "numeric", month: "short" }); }

/* ---------- état sauvegardé ---------- */
let S;
function blank() { return { start: today(), cards: {}, items: {}, gens: {}, sprint: {}, worked: {}, days: [], daily: [], pretest: null, lessons: {}, conf: { sure: [0, 0], mid: [0, 0], guess: [0, 0] } }; }
function load() { try { S = JSON.parse(localStorage.getItem(KEY)) || blank(); } catch (e) { S = blank(); } const b = blank(); for (const k in b) if (!(k in S)) S[k] = b[k]; }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
function markDay() { const t = today(); if (!S.days.includes(t)) S.days.push(t); save(); }

/* ---------- index du contenu ---------- */
const CONCEPTS = Object.fromEntries(DATA.concepts.map(c => [c.id, c]));
const CARDS = DATA.cards.map((c, i) => ({ ...c, id: c.id || "k" + i }));
const ITEMS = DATA.quiz.map((q, i) => ({ ...q, id: q.id || "q" + i }));
const GENS = DATA.gens;

/* ---------- répétition espacée (Leitner) ---------- */
function cardState(id) { return S.cards[id] || { box: 0, due: null, seen: 0, lapses: 0 }; }
function gradeCard(id, g) { // g: 0 raté, 1 difficile, 2 bien, 3 facile
  const st = cardState(id); st.seen++;
  if (g === 0) { st.box = 0; st.lapses++; }
  else if (g === 1) st.box = Math.max(1, st.box);
  else if (g === 2) st.box = Math.min(INTERVALS.length - 1, st.box + 1);
  else st.box = Math.min(INTERVALS.length - 1, st.box + 2);
  st.due = addDays(today(), g === 0 ? 0 : INTERVALS[st.box]);
  S.cards[id] = st; save();
}
function dueCards() { const t = today(); return CARDS.filter(c => { const s = S.cards[c.id]; return !s || !s.due || s.due <= t; }); }
function logItem(id, ok) { (S.items[id] = S.items[id] || []).push(ok ? 1 : 0); if (S.items[id].length > 12) S.items[id].shift(); save(); }
function logGen(id, ok) { (S.gens[id] = S.gens[id] || []).push(ok ? 1 : 0); if (S.gens[id].length > 15) S.gens[id].shift(); save(); }
function logConf(c, ok) { if (!c) return; S.conf[c][1]++; if (ok) S.conf[c][0]++; save(); }

/* ---------- maîtrise par notion ---------- */
function mastery(cid) {
  const parts = [];
  const cs = CARDS.filter(c => c.c === cid);
  if (cs.length) parts.push(cs.reduce((a, c) => a + Math.min(cardState(c.id).box, 4) / 4, 0) / cs.length);
  const qs = ITEMS.filter(q => q.c === cid);
  if (qs.length) parts.push(qs.reduce((a, q) => { const r = S.items[q.id] || []; const last = r.slice(-3); return a + (last.length ? last.reduce((x, y) => x + y, 0) / 3 : 0); }, 0) / qs.length);
  const gs = Object.entries(GENS).filter(([k, g]) => g.c === cid);
  if (gs.length) parts.push(gs.reduce((a, [k]) => { const r = (S.gens[k] || []).slice(-5); return a + (r.length ? r.reduce((x, y) => x + y, 0) / 5 : 0); }, 0) / gs.length);
  return parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : 0;
}
function lvl(m) { return m >= .85 ? ["Automatique", "var(--ok)"] : m >= .6 ? ["Solide", "var(--accent)"] : m >= .25 ? ["En cours", "var(--warn)"] : ["À découvrir", "var(--muted)"]; }

/* ================= NAVIGATION ================= */
const TABS = [
  ["home", "🏠 Accueil"], ["lesson", "📖 Leçon active"], ["cards", "🃏 Flashcards"], ["quiz", "❓ Quiz"],
  ["worked", "🪜 Exemples guidés"], ["sprint", "⚡ Sprint"], ["mix", "🔀 Mélange"], ["mastery", "📊 Maîtrise"],
  ["methods", "🧠 Méthodes"], ["settings", "⚙️"]
];
let cur = "home";
function go(v, arg) { cur = v; stopTimers(); renderTabs(); (VIEWS[v])(arg); window.scrollTo({ top: 0 }); }
function renderTabs() { $("#tabs").innerHTML = TABS.map(([k, l]) => `<button class="${k === cur ? "on" : ""}" onclick="go('${k}')">${l}</button>`).join(""); }
let timers = [];
function stopTimers() { timers.forEach(clearInterval); timers = []; document.onkeydown = null; }

/* ================= LECTEUR DE SESSION (quiz, cartes, problèmes) ================= */
let P = null; // session courante
function startSession(title, queue, opts = {}) {
  stopTimers(); cur = ""; renderTabs(); window.scrollTo({ top: 0 });
  P = { title, queue: queue.slice(), done: [], i: 0, opts, total: queue.length, retry: {}, results: [] };
  markDay(); renderItem();
}
function renderItem() {
  stopTimers();
  if (!P.queue.length) return endSession();
  const it = P.queue[0];
  const n = P.done.length, total = n + P.queue.length;
  let h = `<div class="card"><div class="row" style="justify-content:space-between"><span class="pill">${esc(P.title)}</span>
    <span class="small muted">${n} / ${total}</span></div>
    <div class="bar" style="margin:10px 0 14px"><i style="width:${(n / total) * 100}%"></i></div>`;
  if (it.c && CONCEPTS[it.c]) h += `<div class="small muted">${esc(CONCEPTS[it.c].title)}</div>`;
  if (it.t === "card") h += cardHTML(it);
  else if (it.t === "mcq" || it.t === "tf") h += mcqHTML(it);
  else if (it.t === "num") h += numHTML(it);
  h += `</div><div class="row"><button class="btn ghost sm" onclick="endSession()">Terminer la session</button></div>`;
  V().innerHTML = h;
  if (it.t === "num") { const inp = $("#ans"); inp && inp.focus({ preventScroll: true }); }
  if (it.t === "card") document.onkeydown = e => { if (e.key === " " && !it._flip) { e.preventDefault(); flip(); } else if (it._flip && "1234".includes(e.key)) grade(+e.key - 1); };
  if (it.t === "mcq" || it.t === "tf") document.onkeydown = e => { const k = +e.key; if (!it._ans && k >= 1 && k <= (it.o || ["Vrai", "Faux"]).length) selOpt(k - 1); };
}
function cardHTML(it) {
  return `<div class="flash"><div>${it.front}</div>${it._flip ? `<div class="back">${it.back}</div>` : ""}</div>
  ${it._flip ? `<div class="small muted" style="text-align:center;margin-top:8px">Sois honnête : ta réponse était-elle juste et rapide ?</div>
   <div class="grades"><button class="btn g0" onclick="grade(0)">Raté<br><small>revient</small></button><button class="btn" onclick="grade(1)">Difficile</button>
   <button class="btn" onclick="grade(2)">Bien</button><button class="btn g3" onclick="grade(3)">Facile</button></div>`
      : `<div class="row" style="justify-content:center;margin-top:12px"><button class="btn primary" onclick="flip()">Retourner <span class="kbd">espace</span></button></div>
   <div class="small muted" style="text-align:center;margin-top:6px">Réponds d'abord dans ta tête (ou à voix haute) avant de retourner.</div>`}`;
}
function flip() { P.queue[0]._flip = true; renderItem(); }
function grade(g) {
  const it = P.queue.shift(); gradeCard(it.id, g);
  P.results.push({ it, ok: g >= 2 });
  if (g === 0) { delete it._flip; P.queue.splice(Math.min(P.queue.length, 3), 0, it); } // rappel successif : revient tant que raté
  else P.done.push(it);
  renderItem();
}
function confHTML(disabled) {
  return `<div class="conf"><div class="lab">Valide en indiquant ta certitude :</div><div class="row">
  <button class="btn primary sm" ${disabled ? "disabled" : ""} onclick="submit('sure')">✅ Sûre</button>
  <button class="btn sm" ${disabled ? "disabled" : ""} onclick="submit('mid')">🤔 Hésitante</button>
  <button class="btn sm" ${disabled ? "disabled" : ""} onclick="submit('guess')">🎲 Au hasard</button></div></div>`;
}
function mcqHTML(it) {
  const o = it.o || ["Vrai", "Faux"];
  let h = (it.ctx ? `<div class="ctx">${esc(it.ctx)}</div>` : "") + `<div class="q">${it.q}</div><div class="opts">`;
  o.forEach((t, k) => {
    let cls = "";
    if (it._ans) { if (k === it.a) cls = "ok"; else if (k === it._sel) cls = "ko"; }
    else if (k === it._sel) cls = "sel";
    h += `<button class="opt ${cls}" ${it._ans ? "disabled" : ""} onclick="selOpt(${k})"><span class="n">${k + 1}</span><span>${t}</span></button>`;
  });
  h += `</div>`;
  if (!it._ans) h += confHTML(it._sel == null);
  else h += fbHTML(it, it._sel === it.a, it.ex);
  return h;
}
function selOpt(k) { P.queue[0]._sel = k; renderItem(); }
function numHTML(it) {
  let h = (it.ctx ? `<div class="ctx">${esc(it.ctx)}</div>` : "") + `<div class="q">${it.q}</div>`;
  h += `<div class="row" style="flex-wrap:nowrap"><input id="ans" class="num ${it._ans ? (it._ok ? "ok" : "ko") : ""}" inputmode="decimal" autocomplete="off"
     placeholder="ta réponse" ${it._ans ? `value="${esc(it._raw)}" disabled` : ""} onkeydown="if(event.key==='Enter'&&!${!!it._ans})submit('mid')">
     ${it.unit ? `<b style="min-width:40px">${esc(it.unit)}</b>` : ""}</div>`;
  if (!it._ans) h += confHTML(false) + `<div class="small muted" style="margin-top:6px">Virgule ou point acceptés. <span class="kbd">Entrée</span> = « hésitante ».</div>`;
  else h += fbHTML(it, it._ok, (it.steps ? `<ol class="steps">${it.steps.map(s => `<li>${s}</li>`).join("")}</ol>` : "") + (it.ex || ""));
  return h;
}
function fbHTML(it, ok, ex) {
  const good = it.t === "num" ? `${fmt(it.ans)} ${it.unit || ""}` : (it.o || ["Vrai", "Faux"])[it.a];
  let h = `<div class="fb ${ok ? "ok" : "ko"}"><b>${ok ? "Juste !" : "Pas encore."}</b> ${ok ? "" : `Réponse : <b>${good}</b>`}
    ${ex ? `<div class="ex">${ex}</div>` : ""}</div>`;
  if (!ok && it._conf === "sure") h += `<div class="hyper">💡 <b>Erreur commise avec assurance.</b> C'est justement ce type d'erreur qui se corrige le mieux quand on s'y arrête (effet d'hypercorrection) : relis l'explication et redis-la avec tes mots avant de continuer. Cette question reviendra dans quelques minutes.</div>`;
  else if (!ok) h += `<div class="small muted" style="margin-top:8px">Cette question reviendra plus loin dans la session jusqu'à ce que tu la réussisses.</div>`;
  if (ok && it._conf === "guess") h += `<div class="small muted" style="margin-top:8px">Juste, mais au hasard : elle comptera comme « à revoir ».</div>`;
  h += `<div class="row" style="margin-top:12px"><button class="btn primary" id="nextBtn" onclick="nextItem()">Continuer →</button></div>`;
  return h;
}
function submit(conf) {
  const it = P.queue[0];
  if (it.t === "num") {
    const raw = $("#ans").value; const x = parseNum(raw);
    if (isNaN(x)) { $("#ans").classList.add("ko"); return; }
    it._raw = raw; it._ok = near(x, it.ans, it.tol);
  } else { if (it._sel == null) return; it._ok = it._sel === it.a; }
  it._ans = true; it._conf = conf; logConf(conf, it._ok);
  const counted = it._ok && conf !== "guess";
  if (it.gen) logGen(it.gen, counted); else logItem(it.id, counted);
  P.results.push({ it, ok: it._ok, conf });
  renderItem();
  document.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); nextItem(); } };
  const nb = $("#nextBtn"); nb && nb.focus({ preventScroll: true });
}
function nextItem() {
  const it = P.queue.shift();
  const retry = !it._ok || it._conf === "guess";
  if (retry && !P.opts.noRetry) {
    const again = it.gen && GENS[it.gen] ? makeGen(it.gen) : { ...it, _ans: false, _sel: null, _ok: null, _conf: null, _raw: null };
    P.queue.splice(Math.min(P.queue.length, 4), 0, again);
  } else P.done.push(it);
  renderItem();
}
function endSession() {
  stopTimers();
  const r = P ? P.results : [];
  const first = {}; r.forEach(x => { const key = x.it.id || x.it.gen + x.it.q; if (!(key in first)) first[key] = x.ok; });
  const n = Object.keys(first).length, ok = Object.values(first).filter(Boolean).length;
  const sure = r.filter(x => x.conf === "sure"), sureOk = sure.filter(x => x.ok).length;
  const misses = r.filter(x => !x.ok).map(x => x.it).filter((v, i, a) => a.findIndex(y => (y.q || y.front) === (v.q || v.front)) === i);
  if (P && P.opts.onEnd) P.opts.onEnd(ok, n);
  V().innerHTML = `<div class="card" style="text-align:center"><span class="pill">${esc(P ? P.title : "")}</span>
   <div class="big" style="margin-top:10px">${ok} / ${n}</div><div class="muted">réussies du premier coup</div>
   ${sure.length ? `<p class="small">Calibration : quand tu étais <b>sûre</b>, tu avais raison dans <b>${Math.round(sureOk / sure.length * 100)} %</b> des cas ${sureOk / sure.length < .9 ? "→ ta confiance dépasse encore ta maîtrise, continue à t'auto-tester." : "→ ta confiance est fiable."}</p>` : ""}
   ${misses.length ? `<div style="text-align:left"><h3>À retravailler</h3><ul class="small">${misses.slice(0, 12).map(m => `<li>${m.q || m.front}</li>`).join("")}</ul></div>` : ""}
   <div class="row" style="justify-content:center;margin-top:10px"><button class="btn primary" onclick="go('home')">Retour à l'accueil</button>
   ${P && P.opts.again ? `<button class="btn" onclick="(${P.opts.again})()">Recommencer</button>` : ""}</div></div>`;
  P = null;
}
function makeGen(id) { const g = GENS[id]; const x = g.make(); return { t: "num", gen: id, c: g.c, ...x }; }

/* ================= VUES ================= */
const VIEWS = {};

VIEWS.home = () => {
  const dc = dueCards().length;
  const all = DATA.concepts.map(c => mastery(c.id)); const glob = all.reduce((a, b) => a + b, 0) / all.length;
  const start = S.start, t = today();
  const plan = [0, 1, 3, 7, 14, 30].map(d => { const day = addDays(start, d); return { d, day, done: S.daily.includes(day) || (d === 0 && S.days.includes(start)), today: day === t }; });
  const streak = (() => { let n = 0, d = t; while (S.days.includes(d)) { n++; d = addDays(d, -1); } return n; })();
  const firstTime = !S.pretest && !Object.keys(S.cards).length;
  V().innerHTML = `
  <div class="card">
    <div class="row" style="justify-content:space-between;align-items:flex-start">
      <div><h2 style="margin-bottom:2px">Séance du jour</h2>
      <div class="muted small">${dc} flashcard${dc > 1 ? "s" : ""} à revoir · problèmes mélangés · questions sur tes notions faibles</div></div>
      <div style="text-align:right"><div class="big" style="font-size:30px">${Math.round(glob * 100)} %</div><div class="small muted">maîtrise globale</div></div>
    </div>
    <div class="bar" style="margin:12px 0"><i style="width:${glob * 100}%"></i></div>
    <div class="row"><button class="btn primary" onclick="daily()">▶ Lancer la séance du jour (~15 min)</button>
    ${streak ? `<span class="small muted">🔥 ${streak} jour${streak > 1 ? "s" : ""} d'affilée</span>` : ""}</div>
  </div>
  ${firstTime ? `<div class="card" style="border-color:var(--accent)"><h2>Première fois ? Suis cet ordre</h2>
    <ol class="steps"><li><b>Pré-test</b> (5 min) : réponds sans avoir révisé. Se tromper avant d'apprendre aide à mieux retenir ensuite.</li>
    <li><b>Leçon active</b> : lis chaque notion, réponds aux « pourquoi ? », explique-la à voix haute, puis teste-toi.</li>
    <li><b>Exemples guidés</b> : un exemple complet, puis de moins en moins d'aide jusqu'à le faire seule.</li>
    <li><b>Séance du jour</b> : à refaire selon le plan ci-dessous (J+1, J+3, J+7…).</li></ol>
    <div class="row" style="margin-top:8px"><button class="btn primary" onclick="pretest()">🎯 Commencer par le pré-test</button><button class="btn" onclick="go('lesson')">Aller à la leçon</button></div></div>` : ""}
  <div class="card"><h2>Plan de révision espacée</h2>
    <div class="small muted" style="margin-bottom:8px">Départ : ${frDate(start)}. Chaque case = une séance du jour. Les intervalles s'allongent : c'est l'oubli partiel entre deux séances qui rend le rappel efficace.</div>
    <div class="plan">${plan.map(p => `<div class="${p.done ? "done" : ""} ${p.today ? "today" : ""}"><b>J+${p.d}</b>${frDate(p.day)}${p.done ? "<br>✓" : ""}</div>`).join("")}</div>
    <div class="small muted" style="margin-top:8px">Avant l'examen : une séance la veille et l'avant-veille, surtout sur les notions « En cours ».</div>
  </div>
  <div class="grid2">
    <button class="tile" onclick="pretest()"><b>🎯 Pré-test</b><span>${S.pretest ? `Fait : ${S.pretest.ok}/${S.pretest.n}. À refaire pour mesurer tes progrès.` : "Teste-toi avant d'apprendre"}</span></button>
    <button class="tile" onclick="go('sprint')"><b>⚡ Sprint d'automatisme</b><span>60 secondes chrono, objectif : réponse juste et immédiate</span></button>
    <button class="tile" onclick="go('mix')"><b>🔀 Problèmes mélangés</b><span>Identifier la bonne méthode puis calculer</span></button>
    <button class="tile" onclick="go('mastery')"><b>📊 Ma maîtrise</b><span>Notion par notion, et prochaines révisions</span></button>
  </div>`;
};
function daily() {
  const due = shuffle(dueCards()).slice(0, 18).map(c => ({ t: "card", ...c }));
  const weak = DATA.concepts.slice().sort((a, b) => mastery(a.id) - mastery(b.id)).slice(0, 4).map(c => c.id);
  const qs = shuffle(ITEMS.filter(q => weak.includes(q.c))).slice(0, 6).map(q => ({ ...q, t: q.t || "mcq" }));
  const gk = Object.keys(GENS); const probs = []; for (let i = 0; i < 6; i++) probs.push(makeGen(gk[i % gk.length]));
  const q = shuffle([...qs, ...probs]); const mixed = [];
  // entrelacer : cartes et questions alternées
  while (due.length || q.length) { if (due.length) mixed.push(due.shift()); if (due.length) mixed.push(due.shift()); if (q.length) mixed.push(q.shift()); }
  startSession("Séance du jour", mixed, { onEnd: () => { const t = today(); if (!S.daily.includes(t)) S.daily.push(t); save(); } });
}
function pretest() {
  const ids = DATA.pretest;
  const qs = ids.map(id => { const q = ITEMS.find(x => x.id === id); return q ? { ...q, t: q.t || "mcq" } : (GENS[id] ? makeGen(id) : null); }).filter(Boolean);
  startSession("Pré-test", qs, { noRetry: true, onEnd: (ok, n) => { S.pretest = { ok, n, date: today() }; save(); } });
}

/* ---------- Leçon active ---------- */
VIEWS.lesson = (open) => {
  let h = `<div class="card"><h2>Leçon active</h2><p class="small muted" style="margin:0">Ne relis pas passivement. Pour chaque notion : lis une fois, active <b>« Masquer l'essentiel »</b> et essaie de retrouver les éléments floutés, réponds aux <b>pourquoi ?</b>, explique la notion <b>à voix haute</b> sans regarder, puis <b>teste-toi</b>.</p>
  <div class="row" style="margin-top:10px"><label class="row small"><input type="checkbox" id="hk" onchange="document.body.classList.toggle('hidek',this.checked)" ${document.body.classList.contains("hidek") ? "checked" : ""}> Masquer l'essentiel (mode rappel)</label></div></div>`;
  DATA.concepts.forEach((c, i) => {
    const m = mastery(c.id), [l, col] = lvl(m);
    h += `<details class="card lesson" ${open === c.id || (!open && i === 0) ? "open" : ""}><summary>${i + 1}. ${c.title} <span class="lvl" style="color:${col};margin-left:6px">${l}</span></summary>
    <div class="content">${c.html}</div>
    ${c.why && c.why.length ? `<div class="box why2"><h4>🤔 Pourquoi ? (interrogation élaborative)</h4>${c.why.map((w, j) => `<div style="margin:6px 0"><b>${w[0]}</b> <span class="why" onclick="this.nextElementSibling.classList.toggle('hidden')">voir une réponse</span><span class="whyx hidden">${w[1]}</span></div>`).join("")}</div>` : ""}
    ${c.talk ? `<div class="box talk"><h4>🗣️ Explique à voix haute, sans regarder</h4><p style="margin:4px 0">${c.talk.prompt}</p>
      <div class="small">Puis vérifie que tu as bien dit :</div>${c.talk.check.map(x => `<label class="row small" style="margin:3px 0;flex-wrap:nowrap;align-items:flex-start"><input type="checkbox"> <span>${x}</span></label>`).join("")}</div>` : ""}
    ${c.traps && c.traps.length ? `<div class="box trap"><h4>⚠️ Pièges classiques</h4><ul style="margin:4px 0;padding-left:18px">${c.traps.map(x => `<li>${x}</li>`).join("")}</ul></div>` : ""}
    <div class="row"><button class="btn primary sm" onclick="testConcept('${c.id}')">🧪 Me tester sur cette notion</button></div></details>`;
  });
  V().innerHTML = h;
  V().querySelectorAll(".k").forEach(k => k.onclick = () => k.classList.toggle("shown"));
};
function testConcept(cid) {
  const cards = CARDS.filter(c => c.c === cid).map(c => ({ t: "card", ...c }));
  const qs = ITEMS.filter(q => q.c === cid).map(q => ({ ...q, t: q.t || "mcq" }));
  const gs = Object.keys(GENS).filter(k => GENS[k].c === cid).slice(0, 3).map(makeGen);
  S.lessons[cid] = today(); save();
  startSession(CONCEPTS[cid].title, shuffle([...cards, ...qs]).concat(gs), { again: `()=>testConcept('${cid}')` });
}

/* ---------- Flashcards ---------- */
VIEWS.cards = () => {
  const due = dueCards();
  const boxes = [0, 0, 0, 0, 0, 0, 0]; CARDS.forEach(c => boxes[cardState(c.id).box]++);
  V().innerHTML = `<div class="card"><h2>Flashcards à répétition espacée</h2>
  <p class="small muted" style="margin-top:0">Chaque carte revient selon ta réponse : <b>Raté</b> → elle revient dans la session jusqu'à ce que tu la réussisses ; <b>Bien</b> → 1, 3, 7, 14, 30 puis 60 jours. Réponds toujours <b>avant</b> de retourner : c'est l'effort de rappel qui fixe la mémoire.</p>
  <div class="small">Boîtes : ${boxes.map((b, i) => `<span class="pill" style="margin:2px">${i === 0 ? "Nouvelles/ratées" : "+" + INTERVALS[i] + " j"} : ${b}</span>`).join("")}</div>
  <div class="row" style="margin-top:12px"><button class="btn primary" ${due.length ? "" : "disabled"} onclick="startSession('Flashcards', shuffle(dueCards()).map(c=>({t:'card',...c})))">Réviser les ${due.length} cartes dues</button>
  <button class="btn" onclick="startSession('Toutes les cartes', shuffle(CARDS).map(c=>({t:'card',...c})))">Toutes les cartes (${CARDS.length})</button></div></div>
  <div class="card"><h3 style="margin-top:0">Par notion</h3><div class="grid2">${DATA.concepts.map(c => { const n = CARDS.filter(k => k.c === c.id).length; return n ? `<button class="tile" onclick="startSession('${esc(c.title).replace(/'/g, "\\'")}', shuffle(CARDS.filter(k=>k.c==='${c.id}')).map(c=>({t:'card',...c})))"><b>${c.title}</b><span>${n} cartes</span></button>` : ""; }).join("")}</div></div>`;
};

/* ---------- Quiz ---------- */
VIEWS.quiz = () => {
  V().innerHTML = `<div class="card"><h2>Quiz de théorie</h2>
  <p class="small muted" style="margin-top:0">Avant de valider, indique ta <b>certitude</b>. Tu verras à la fin si ta confiance est bien calibrée. Les erreurs reviennent dans la session jusqu'à être corrigées.</p>
  <div class="row"><button class="btn primary" onclick="startSession('Quiz complet', shuffle(ITEMS).map(q=>({...q,t:q.t||'mcq'})))">Tout le quiz (${ITEMS.length} questions, ordre mélangé)</button>
  <button class="btn" onclick="startSession('Quiz express', shuffle(ITEMS).slice(0,10).map(q=>({...q,t:q.t||'mcq'})))">Express : 10 questions</button></div></div>
  <div class="card"><h3 style="margin-top:0">Par notion</h3><div class="grid2">${DATA.concepts.map(c => { const n = ITEMS.filter(k => k.c === c.id).length; return n ? `<button class="tile" onclick="startSession('Quiz', shuffle(ITEMS.filter(k=>k.c==='${c.id}')).map(q=>({...q,t:q.t||'mcq'})))"><b>${c.title}</b><span>${n} questions</span></button>` : ""; }).join("")}</div></div>`;
};

/* ---------- Exemples guidés (estompage) ---------- */
const FADE = ["Exemple complet", "Dernière étape à faire", "Deux dernières étapes", "Seule, toutes les étapes"];
VIEWS.worked = () => {
  V().innerHTML = `<div class="card"><h2>Exemples guidés à estompage progressif</h2>
  <p class="small muted" style="margin-top:0">On commence par un exemple entièrement résolu (tu expliques chaque étape), puis l'aide disparaît <b>en partant de la fin</b> : d'abord la dernière étape à faire toi-même, puis les deux dernières, puis tout. Tu montes d'un niveau quand tu réussis, tu redescends si tu bloques. Chaque exemple a de nouveaux nombres.</p></div>
  <div class="grid2">${DATA.worked.map((w, i) => { const l = S.worked[w.id] || 0; return `<button class="tile" onclick="worked(${i})"><b>${w.title}</b><span>Niveau ${l + 1}/4 · ${FADE[l]}</span></button>`; }).join("")}</div>`;
};
let W = null;
function worked(i) {
  markDay();
  const w = DATA.worked[i]; const level = S.worked[w.id] || 0; const ex = w.make();
  const nBlank = level === 0 ? 0 : level === 1 ? 1 : level === 2 ? Math.min(2, ex.steps.length) : ex.steps.length;
  W = { i, w, ex, level, blanks: ex.steps.map((s, k) => k >= ex.steps.length - nBlank), checked: false };
  renderWorked();
}
function renderWorked() {
  const { w, ex, level, blanks, checked } = W;
  let h = `<div class="card"><div class="row" style="justify-content:space-between"><span class="pill">${w.title}</span><span class="small muted">Niveau ${level + 1}/4 · ${FADE[level]}</span></div>
   <div class="ctx" style="margin-top:12px">${esc(ex.ctx)}</div><div class="q">${ex.q}</div><ol class="wk">`;
  ex.steps.forEach((s, k) => {
    h += `<li><b>${s.label}</b>`;
    if (!blanks[k]) h += `<div>${s.show} <span class="why" onclick="this.nextElementSibling.classList.toggle('hidden')">pourquoi ?</span><span class="whyx hidden">${s.why}</span></div>`;
    else {
      const st = W.res && W.res[k];
      h += `<div class="blank"><input class="num ${checked ? (st ? "ok" : "ko") : ""}" id="w${k}" inputmode="decimal" autocomplete="off" ${checked ? "disabled" : ""} value="${checked ? esc(W.raw[k]) : ""}"> <b>${s.unit || ""}</b></div>
       ${checked && !st ? `<div class="small" style="color:var(--ko)">Attendu : ${s.show}</div>` : ""}${checked ? `<div class="whyx">${s.why}</div>` : ""}`;
    }
    h += `</li>`;
  });
  h += `</ol>`;
  if (level === 0 && !checked) h += `<div class="box talk"><b>Auto-explication :</b> avant de continuer, dis à voix haute pourquoi chaque étape est nécessaire. Clique « pourquoi ? » seulement pour vérifier.</div>
     <div class="row"><button class="btn primary" onclick="W.checked=true;W.ok=true;finishWorked()">J'ai compris chaque étape → niveau suivant</button></div>`;
  else if (!checked) h += `<div class="row"><button class="btn primary" onclick="checkWorked()">Vérifier</button></div>`;
  else h += `<div class="fb ${W.ok ? "ok" : "ko"}"><b>${W.ok ? "Bravo, niveau suivant débloqué." : "Pas encore : on reste à ce niveau (ou on redescend) pour consolider."}</b></div>
     <div class="row" style="margin-top:10px"><button class="btn primary" onclick="worked(${W.i})">Nouvel exemple →</button><button class="btn" onclick="go('worked')">Autre procédure</button></div>`;
  h += `</div>`;
  V().innerHTML = h;
  const f = V().querySelector("input.num:not([disabled])"); f && f.focus({ preventScroll: true });
  V().querySelectorAll("input.num").forEach(inp => inp.onkeydown = e => { if (e.key === "Enter") checkWorked(); });
}
function checkWorked() {
  if (W.checked) return;
  W.res = {}; W.raw = {}; let ok = true;
  W.ex.steps.forEach((s, k) => { if (!W.blanks[k]) return; const raw = $("#w" + k).value; W.raw[k] = raw; const r = near(parseNum(raw), s.ans, s.tol); W.res[k] = r; if (!r) ok = false; });
  W.checked = true; W.ok = ok; finishWorked();
}
function finishWorked() {
  const id = W.w.id; const l = S.worked[id] || 0;
  S.worked[id] = W.ok ? Math.min(3, l + 1) : Math.max(0, l - (l === 3 ? 1 : 0));
  if (W.w.gen) logGen(W.w.gen, W.ok && W.level === 3);
  save(); if (W.level === 0) worked(W.i); else renderWorked();
}

/* ---------- Sprint d'automatisme ---------- */
VIEWS.sprint = () => {
  V().innerHTML = `<div class="card"><h2>Sprint d'automatisme</h2>
  <p class="small muted" style="margin-top:0">60 secondes, un maximum de réponses <b>justes</b>. Le but n'est pas la vitesse pour elle-même : quand ces bases deviennent instantanées, ta mémoire de travail reste libre pour le raisonnement des exercices. Objectif indiqué pour chaque série ; ne vise la vitesse qu'une fois la précision acquise.</p></div>
  <div class="grid2">${DATA.sprints.map((s, i) => { const h = S.sprint[s.id] || []; const best = h.reduce((a, b) => Math.max(a, b.ok - b.ko), 0); return `<button class="tile" onclick="sprint(${i})"><b>${s.title}</b><span>Objectif : ${s.target} justes / min · record : ${best}${best >= s.target ? " ✅" : ""}</span></button>`; }).join("")}</div>`;
};
let SP = null;
function sprint(i) {
  markDay(); const s = DATA.sprints[i];
  SP = { s, i, end: Date.now() + 60000, ok: 0, ko: 0, misses: [], cur: s.make() };
  renderSprint();
  timers.push(setInterval(() => { const left = Math.max(0, Math.ceil((SP.end - Date.now()) / 1000)); const t = $("#tm"); if (t) t.textContent = left; if (left <= 0) endSprint(); }, 200));
}
function renderSprint() {
  const it = SP.cur;
  let h = `<div class="card" style="text-align:center"><div class="row" style="justify-content:space-between"><span class="pill">${SP.s.title}</span><span class="timer" id="tm">${Math.ceil((SP.end - Date.now()) / 1000)}</span></div>
   <div class="small muted">✅ ${SP.ok} · ❌ ${SP.ko}</div><div class="q" style="font-size:22px;margin:18px 0">${it.q}</div>`;
  if (it.o) { h += `<div class="opts">${it.o.map((t, k) => `<button class="opt" onclick="spAns(${k})"><span class="n">${k + 1}</span><span>${t}</span></button>`).join("")}</div>`; }
  else h += `<div class="row" style="justify-content:center;flex-wrap:nowrap"><input id="sp" class="num" style="max-width:220px;text-align:center" inputmode="decimal" autocomplete="off"><b>${it.unit || ""}</b></div><div class="small muted" style="margin-top:6px"><span class="kbd">Entrée</span> pour valider</div>`;
  h += `<div id="spfb" style="min-height:24px;margin-top:10px"></div></div>`;
  V().innerHTML = h;
  if (!it.o) { const inp = $("#sp"); inp.focus({ preventScroll: true }); inp.onkeydown = e => { if (e.key === "Enter") spAns(inp.value); }; }
  else document.onkeydown = e => { const k = +e.key; if (k >= 1 && k <= it.o.length) spAns(k - 1); };
}
function spAns(v) {
  const it = SP.cur; let ok;
  if (it.o) ok = v === it.a; else { const x = parseNum(v); if (isNaN(x)) return; ok = near(x, it.ans, it.tol); }
  if (ok) SP.ok++; else { SP.ko++; SP.misses.push(`${it.q} → <b>${it.o ? it.o[it.a] : fmt(it.ans) + " " + (it.unit || "")}</b>`); }
  SP.cur = SP.s.make(); renderSprint();
  const fb = $("#spfb"); if (fb) fb.innerHTML = ok ? `<span style="color:var(--ok)">✓</span>` : `<span style="color:var(--ko)">✗ ${SP.misses[SP.misses.length - 1]}</span>`;
}
function endSprint() {
  stopTimers(); const s = SP.s; (S.sprint[s.id] = S.sprint[s.id] || []).push({ d: today(), ok: SP.ok, ko: SP.ko }); save();
  const hist = S.sprint[s.id].slice(-8); const score = SP.ok - SP.ko;
  V().innerHTML = `<div class="card" style="text-align:center"><span class="pill">${s.title}</span><div class="big" style="margin-top:10px">${SP.ok} ✓ · ${SP.ko} ✗</div>
  <p>${SP.ko === 0 && SP.ok >= s.target ? "🎯 Objectif atteint sans erreur : cette base devient automatique. Refais un sprint dans quelques jours pour vérifier que ça tient." : SP.ko > 2 ? "Trop d'erreurs : ralentis et vise d'abord 100 % de justes, la vitesse viendra." : `Objectif : ${s.target} justes en 60 s, zéro erreur.`}</p>
  <div class="small muted">Tes derniers sprints : ${hist.map(x => `${x.ok}/${x.ko}`).join(" · ")}</div>
  ${SP.misses.length ? `<div style="text-align:left"><h3>Erreurs à retenir</h3><ul class="small">${SP.misses.map(m => `<li>${m}</li>`).join("")}</ul></div>` : ""}
  <div class="row" style="justify-content:center"><button class="btn primary" onclick="sprint(${SP.i})">Relancer</button><button class="btn" onclick="go('sprint')">Autre série</button></div></div>`;
}

/* ---------- Mélange (entrelacement + discrimination de méthode) ---------- */
let MX = null;
VIEWS.mix = () => {
  MX = { n: 0, ok: 0 }; markDay(); nextMix();
};
function nextMix() {
  const keys = Object.keys(GENS); let k; do { k = pick(keys); } while (MX.last === k && keys.length > 1); MX.last = k;
  MX.cur = makeGen(k); MX.stage = 0; MX.methodOk = null; renderMix();
}
function renderMix() {
  const it = MX.cur; const fams = [...new Set(Object.values(GENS).map(g => g.method))];
  let h = `<div class="card"><div class="row" style="justify-content:space-between"><span class="pill">Problèmes mélangés</span><span class="small muted">${MX.ok} / ${MX.n} justes</span></div>
  <p class="small muted">Les types de problèmes arrivent dans le désordre, comme à l'examen. D'abord : <b>quelle méthode ?</b> Ensuite seulement : le calcul.</p>
  ${it.ctx ? `<div class="ctx">${esc(it.ctx)}</div>` : ""}<div class="q">${it.q}</div>`;
  if (MX.stage === 0) {
    MX.opts = MX.opts && MX.optsFor === it ? MX.opts : shuffle(fams).slice(0, 4); if (!MX.opts.includes(GENS[it.gen].method)) MX.opts[rnd(0, MX.opts.length - 1)] = GENS[it.gen].method; MX.optsFor = it;
    h += `<div class="small" style="margin-bottom:6px"><b>Étape 1 :</b> quelle méthode s'applique ?</div><div class="opts">${MX.opts.map((m, k) => `<button class="opt" onclick="mixMethod(${k})"><span class="n">${k + 1}</span><span>${m}</span></button>`).join("")}</div>`;
    document.onkeydown = e => { const k = +e.key; if (k >= 1 && k <= MX.opts.length) mixMethod(k - 1); };
  } else {
    h += `<div class="small" style="margin:0 0 8px;color:${MX.methodOk ? "var(--ok)" : "var(--ko)"}">${MX.methodOk ? "✓ Bonne méthode" : "✗ La méthode était"} : ${GENS[it.gen].method}</div>`;
    h += `<div class="row" style="flex-wrap:nowrap"><input id="mx" class="num ${MX.stage === 2 ? (MX.calcOk ? "ok" : "ko") : ""}" inputmode="decimal" autocomplete="off" ${MX.stage === 2 ? `disabled value="${esc(MX.raw)}"` : ""}> <b>${it.unit || ""}</b></div>`;
    if (MX.stage === 1) h += `<div class="row" style="margin-top:10px"><button class="btn primary" onclick="mixCalc()">Valider le calcul</button></div>`;
    else h += `<div class="fb ${MX.calcOk ? "ok" : "ko"}"><b>${MX.calcOk ? "Juste !" : "Réponse : " + fmt(it.ans) + " " + (it.unit || "")}</b><div class="ex"><ol class="steps">${(it.steps || []).map(s => `<li>${s}</li>`).join("")}</ol></div></div>
      <div class="row" style="margin-top:10px"><button class="btn primary" id="mxn" onclick="nextMix()">Problème suivant →</button><button class="btn ghost" onclick="go('home')">Arrêter</button></div>`;
  }
  h += `</div>`; V().innerHTML = h;
  const inp = $("#mx"); if (inp && MX.stage === 1) { inp.focus({ preventScroll: true }); inp.onkeydown = e => { if (e.key === "Enter") mixCalc(); }; }
  if (MX.stage === 2) { const b = $("#mxn"); b && b.focus({ preventScroll: true }); }
}
function mixMethod(k) { MX.methodOk = MX.opts[k] === GENS[MX.cur.gen].method; MX.stage = 1; document.onkeydown = null; renderMix(); }
function mixCalc() { const raw = $("#mx").value; const x = parseNum(raw); if (isNaN(x)) return; MX.raw = raw; MX.calcOk = near(x, MX.cur.ans, MX.cur.tol); MX.n++; if (MX.calcOk && MX.methodOk) MX.ok++; logGen(MX.cur.gen, MX.calcOk && MX.methodOk); MX.stage = 2; renderMix(); }

/* ---------- Maîtrise ---------- */
VIEWS.mastery = () => {
  const t = today(); const next = [];
  for (let d = 0; d < 7; d++) { const day = addDays(t, d); next.push([day, CARDS.filter(c => { const s = S.cards[c.id]; return d === 0 ? (!s || !s.due || s.due <= day) : s && s.due === day; }).length]); }
  const c = S.conf; const pc = a => a[1] ? Math.round(a[0] / a[1] * 100) + " %" : "–";
  V().innerHTML = `<div class="card"><h2>Ma maîtrise</h2><p class="small muted" style="margin-top:0">Score par notion = flashcards (boîte atteinte) + quiz (3 dernières réponses) + problèmes (5 derniers). « Automatique » = au moins 85 %. Une réponse juste « au hasard » ne compte pas.</p>
  ${DATA.concepts.map(x => { const m = mastery(x.id); const [l, col] = lvl(m); return `<div class="mast"><a href="#" onclick="go('lesson','${x.id}');return false" style="color:inherit">${x.title}</a><div class="bar"><i style="width:${m * 100}%;background:${col}"></i></div><span class="lvl" style="color:${col}">${Math.round(m * 100)}%</span></div>`; }).join("")}
  </div>
  <div class="card"><h3 style="margin-top:0">Calibration de ta confiance</h3><table class="tbl"><tr><th>Quand tu dis…</th><th>tu as raison</th><th>réponses</th></tr>
  <tr><td>✅ Sûre</td><td>${pc(c.sure)}</td><td>${c.sure[1]}</td></tr><tr><td>🤔 Hésitante</td><td>${pc(c.mid)}</td><td>${c.mid[1]}</td></tr><tr><td>🎲 Au hasard</td><td>${pc(c.guess)}</td><td>${c.guess[1]}</td></tr></table>
  <div class="small muted">Idéal : « Sûre » proche de 100 %. Si c'est plus bas, tu surestimes ce que tu sais : c'est le signal pour te tester davantage plutôt que relire.</div></div>
  <div class="card"><h3 style="margin-top:0">Flashcards à revoir les 7 prochains jours</h3><div class="plan">${next.map(([d, n]) => `<div class="${d === t ? "today" : ""}"><b>${n}</b>${frDate(d)}</div>`).join("")}</div></div>
  <div class="card"><h3 style="margin-top:0">Exemples guidés</h3>${DATA.worked.map(w => `<div class="mast"><span>${w.title}</span><div class="bar"><i style="width:${((S.worked[w.id] || 0) / 3) * 100}%"></i></div><span class="lvl">${(S.worked[w.id] || 0) + 1}/4</span></div>`).join("")}</div>`;
};

/* ---------- Méthodes (science de l'apprentissage) ---------- */
VIEWS.methods = () => { V().innerHTML = METHODS_HTML; };

/* ---------- Réglages ---------- */
VIEWS.settings = () => {
  V().innerHTML = `<div class="card"><h2>Sauvegarde de ta progression</h2>
  <p class="small muted" style="margin-top:0">Ta progression est enregistrée dans ce navigateur. Dans Notion, la page intégrée a sa propre mémoire, distincte de la page ouverte directement. Pour changer d'appareil : copie le code ci-dessous et colle-le de l'autre côté.</p>
  <textarea id="exp" rows="4" style="font-size:12px">${esc(JSON.stringify(S))}</textarea>
  <div class="row" style="margin-top:8px"><button class="btn" onclick="navigator.clipboard&&navigator.clipboard.writeText($('#exp').value);this.textContent='Copié ✓'">Copier</button>
  <button class="btn" onclick="try{S=JSON.parse($('#exp').value);save();go('home')}catch(e){alert('Code invalide')}">Importer le code collé</button></div></div>
  <div class="card"><h2>Recommencer</h2><p class="small muted" style="margin-top:0">Efface toute la progression de cette séance (cartes, scores, plan).</p>
  <button class="btn" style="border-color:var(--ko);color:var(--ko)" onclick="if(confirm('Tout effacer ?')){S=blank();save();go('home')}">Tout effacer</button></div>
  <div class="card small muted">Raccourcis clavier : <span class="kbd">espace</span> retourner une carte · <span class="kbd">1</span>–<span class="kbd">4</span> noter une carte ou choisir une option · <span class="kbd">Entrée</span> valider / continuer.</div>`;
};

/* ================= DÉMARRAGE ================= */
load();
$("#hKick").textContent = DATA.kicker; $("#hTitle").textContent = DATA.title; $("#hSub").textContent = DATA.sub;
go("home");
</script>
</body>
</html>
