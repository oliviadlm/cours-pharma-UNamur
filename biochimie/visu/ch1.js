import * as THREE from './three.module.min.js';
import { OrbitControls } from './OrbitControls.js';
import { mergeVertices } from './BufferGeometryUtils.js';

const $ = (s) => document.querySelector(s);
const IC = {
  play: '<svg class="ic" viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z"/></svg>',
  map: '<svg class="ic" viewBox="0 0 24 24"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/></svg>',
  out: '<svg class="ic" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M8 11h6"/></svg>',
  info: '<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-5M12 8h.01"/></svg>',
  go: '<svg class="ic" viewBox="0 0 24 24" style="width:16px;height:16px"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  book: '<svg class="ic" viewBox="0 0 24 24"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/></svg>',
};

/* =========================================================
   Cours interactif — Biochimie humaine · chapitre 1 : les voies métaboliques
   On entre dans le foie, puis dans un hépatocyte : chaque organite = une partie du cours.
   ========================================================= */
let S = { ency: {} };
try { Object.assign(S, JSON.parse(localStorage.getItem('bioch-visu-ch1') || '{}')); } catch (e) {}
const save = () => { try { localStorage.setItem('bioch-visu-ch1', JSON.stringify(S)); } catch (e) {} };
const PAGE = '../ch1-voies-metaboliques.html';
const HUB = 'cellule';
const SOMMAIRE = 'Sommaire des voies métaboliques';
const PREMIERE = "Tu es dans un <b>hépatocyte</b>, une cellule du foie. Chaque repère numéroté est une partie du cours : touche-le pour zoomer. Glisse pour tourner, pince pour zoomer.";
const LV = [
  { id: 'L1', t: 'Repas et jeûne', scene: 'bilan', sec: 0, sub: "LE schéma : qui stocke, qui libère, dans quel ordre." },
  { id: 'L2', t: "L'entrée du glucose", scene: 'glut', sec: 1, sub: "GLUT-1, 2, 3, 4, insuline, hexokinase et glucokinase." },
  { id: 'L3', t: 'Glycolyse et néoglucogenèse', scene: 'glyco', sec: 2, sub: "10 étapes, 3 irréversibles, lactate, pentoses, néoglucogenèse." },
  { id: 'L3b', t: 'Le glycogène', scene: 'glycogene', sec: 2, sub: "Synthase, phosphorylase, foie contre muscle." },
  { id: 'L3c', t: 'Le cycle de Krebs', scene: 'krebs', sec: 2, sub: "Pyruvate déshydrogénase, le cycle, le bilan, le carrefour acétyl-CoA." },
  { id: 'L4', t: 'Les lipides', scene: 'lipides', sec: 3, sub: "β-oxydation, corps cétoniques, synthèse des AG, TG, cholestérol." },
  { id: 'L5', t: "Acides aminés et urée", scene: 'uree', sec: 4, sub: "Transamination, NH₃, glutamine, alanine, cycle de l'urée." },
  { id: 'L6', t: 'La chaîne respiratoire', scene: 'chaine', sec: 5, sub: "Complexes I à IV, gradient de protons, ATP synthase, poisons." },
];
const NUM = { L1: '1', L2: '2', L3: '3', L3b: '3', L3c: '3', L4: '4', L5: '5', L6: '6' };
const lvl = (id) => LV.find((l) => l.id === id);
function ouvrirNiveau(id) { lireCours(lvl(id).sec); }
function lireCours(sec) {
  if (window.parent !== window) window.parent.postMessage({ visu: 'section', sec }, '*');
  else location.href = PAGE + '#cours-' + sec;
}
const ENCY = {
  hepatocyte: ['Hépatocyte', "Cellule du foie : stocke le glycogène, fabrique du glucose (néoglucogenèse), les AG, le cholestérol, les corps cétoniques et l'urée."],
  noyau: ['Noyau', "Contient l'ADN. Les hormones modifient aussi la synthèse des enzymes (régulation lente)."],
  mitoInterne: ['Membrane interne', "Repliée en crêtes : porte la chaîne respiratoire et l'ATP synthase. Entre les deux membranes : l'espace intermembranaire."],
  crete: ['Crête mitochondriale', "Repli de la membrane interne : plus de surface pour la chaîne respiratoire et les ATP synthases."],
  ribosome: ['Ribosome mitochondrial', "La mitochondrie fabrique une partie de ses propres protéines."],
  adnmt: ['ADN mitochondrial', "Petit ADN circulaire, transmis par la mère."],
  mito: ['Mitochondrie', "Cycle de Krebs, β-oxydation, début du cycle de l'urée et chaîne respiratoire (ATP). Absente du globule rouge."],
  re: ['Réticulum endoplasmique', "Synthèse des lipides (TG, cholestérol) et de la glucose-6-phosphatase du foie."],
  glycogene: ['Glycogène', "Polymère ramifié de glucose (α-1→4, branches α-1→6 tous les ~15 résidus). Foie ~150 g, muscles ~300 g."],
  gouttelette: ['Gouttelette lipidique', "Réserve de triglycérides. Dans le foie, l'excès est exporté en VLDL (sinon stéatose)."],
  vldl: ['VLDL', "Lipoprotéine qui exporte les TG fabriqués par le foie vers le tissu adipeux."],
  glucose: ['Glucose', "Glycémie à jeun 0,7-0,9 g/L. Le cerveau en consomme ~120 g/j, les GR ne vivent que de lui."],
  g6p: ['Glucose-6-phosphate', "Le glucose phosphorylé ne ressort plus de la cellule. Carrefour : glycolyse, glycogène, pentoses."],
  pyruvate: ['Pyruvate', "Fin de la glycolyse (3 C). Lactate en anaérobie, acétyl-CoA en aérobie."],
  lactate: ['Lactate', "Formé par la LDH en anaérobie (régénère le NAD⁺). Repart au foie : cycle de Cori."],
  acetylcoa: ['Acétyl-CoA', "2 C : le carrefour. Vient du glucose, des AG, des AA ; va dans Krebs, les AG, le cholestérol, les corps cétoniques."],
  atp: ['ATP', "La monnaie énergétique de la cellule."],
  nadh: ['NADH', "Transporteur d'électrons réduit : sera réoxydé par la chaîne respiratoire (≈ 2,5-3 ATP)."],
  fadh2: ['FADH₂', "Transporteur d'électrons : entre dans la chaîne au complexe II (≈ 1,5-2 ATP)."],
  nadph: ['NADPH', "Pouvoir réducteur des synthèses (AG, cholestérol) et du glutathion. Vient de la voie des pentoses."],
  co2: ['CO₂', "Déchet des décarboxylations (pyruvate déshydrogénase, Krebs)."],
  enzyme: ['Enzyme', "Catalyseur protéique. Les enzymes-clés (irréversibles) sont les points de régulation."],
  glut1: ['GLUT-1 et GLUT-3', "Forte affinité, fonctionnent en permanence : cerveau, globules rouges."],
  glut2: ['GLUT-2', "Faible affinité, « senseur » : foie, cellules β du pancréas, intestin. Laisse passer le glucose dans les deux sens."],
  glut4: ['GLUT-4', "Muscle et adipocyte. Stocké dans des vésicules et envoyé à la membrane sous l'effet de l'insuline."],
  recInsuline: ["Récepteur de l'insuline", "Récepteur à activité tyrosine kinase : déclenche l'envoi des vésicules de GLUT-4 vers la membrane."],
  insuline: ['Insuline', "Hormone des cellules β : glycémie ↑ → stockage (glycogène, TG), entrée du glucose dans muscle et adipocyte."],
  glucagon: ['Glucagon', "Hormone des cellules α : glycémie ↓ → AMPc ↑ dans le foie → glycogénolyse, néoglucogenèse."],
  lipide: ['Phospholipide', "Tête polaire + 2 queues d'acides gras : bicouche de la membrane."],
  hexokinase: ['Hexokinase / glucokinase', "Hexokinase : tous les tissus, haute affinité. Glucokinase : foie et cellules β, faible affinité, glucose seulement."],
  ag: ['Acide gras', "Chaîne carbonée (ex. palmitate C16). Coupé par blocs de 2 C en β-oxydation."],
  carnitine: ['Carnitine', "Navette qui fait entrer les acyl-CoA dans la mitochondrie."],
  cetone: ['Corps cétoniques', "β-hydroxybutyrate, acétoacétate (acétone) : faits par le foie en jeûne, carburant des muscles, du cœur et du cerveau. Acides."],
  malonyl: ['Malonyl-CoA', "Formé par l'acétyl-CoA carboxylase (enzyme-clé de la synthèse des AG)."],
  hmg: ['HMG-CoA réductase', "Enzyme-clé de la synthèse du cholestérol (NADPH). Cible des statines."],
  cholesterol: ['Cholestérol', "27 C, 4 cycles. 90 % fait par le foie. Membranes, acides biliaires, hormones stéroïdes, vitamine D."],
  lipase: ['Lipase hormono-sensible', "Coupe les TG de l'adipocyte. Activée par adrénaline et glucagon (AMPc), inhibée par l'insuline."],
  tg: ['Triglycéride', "Glycérol + 3 AG. Il faut du glycérol-3-phosphate (donc du glucose) pour les fabriquer."],
  aa: ['Acide aminé', "20 AA, dont 8 essentiels. Pas de réserve : les seules « réserves » sont les protéines musculaires."],
  glutamate: ['Glutamate', "Pivot de l'azote : reçoit les NH₂ par transamination, libère le NH₃ (glutamate déshydrogénase)."],
  akg: ['α-Cétoglutarate', "α-Cétoacide accepteur du groupe aminé : devient glutamate."],
  transaminase: ['Transaminase (ALAT, ASAT)', "Transfère le NH₂ avec le phosphate de pyridoxal (vitamine B6). ALAT cytoplasmique, ASAT surtout mitochondriale : marqueurs du foie."],
  nh3: ['Ammoniac NH₃', "Très toxique (cerveau). Voyage en glutamine ou en alanine, transformé en urée dans le foie."],
  glutamine: ['Glutamine', "AA le plus abondant du plasma : transporte le NH₃ des tissus vers le foie."],
  alanine: ['Alanine', "Exportée par le muscle vers le foie : ses carbones refont du glucose (cycle glucose-alanine)."],
  uree: ['Urée', "Déchet azoté fabriqué uniquement par le foie (3 ATP par urée), éliminé par le rein."],
  ornithine: ['Ornithine', "Transporteur du cycle de l'urée : reçoit le carbamoyl-phosphate, est régénérée à la fin."],
  complexe: ['Complexe de la chaîne respiratoire', "I NADH-ubiquinone réductase, II succinate-ubiquinone réductase, III ubiquinone-cytochrome c réductase, IV cytochrome oxydase."],
  coq: ['Coenzyme Q (ubiquinone)', "Navette liposoluble : porte les électrons de I et II vers III."],
  cytc: ['Cytochrome c', "Petite protéine navette : porte les électrons de III vers IV."],
  atpsynthase: ['ATP synthase (complexe V)', "Turbine : le retour des protons la fait tourner et fabrique l'ATP."],
  proton: ['Proton H⁺', "Pompé dans l'espace intermembranaire par I, III et IV : le gradient fait tourner l'ATP synthase."],
  o2: ['Dioxygène', "Accepteur final des électrons au complexe IV : devient H₂O."],
  poison: ['Poison du complexe IV', "CO, H₂S, cyanures : bloquent le fer de la cytochrome oxydase. Plus d'ATP, mort cellulaire rapide."],
  foie: ['Foie', "Le seul organe (avec le rein, un peu l'intestin) qui relâche du glucose dans le sang : glucose-6-phosphatase."],
  muscle: ['Muscle', "Stocke ~300 g de glycogène pour lui seul ; exporte lactate et alanine ; utilise AG et corps cétoniques."],
  adipeux: ['Tissu adipeux', "Réserve de TG (≈ 12 % du poids). Lipolyse en jeûne (lipase hormono-sensible)."],
  cerveau: ['Cerveau', "~120 g de glucose par jour ; utilise les corps cétoniques après adaptation au jeûne. Pas les AG."],
  pancreas: ['Pancréas', "Cellules β → insuline (repas) ; cellules α → glucagon (jeûne)."],
  intestin: ['Intestin', "Absorbe glucose, AA (vers le foie par la veine porte) et graisses (chylomicrons, par la lymphe)."],
  gr: ['Globule rouge', "Pas de mitochondries : glycolyse anaérobie seulement, 2 ATP par glucose, lactate en sortie."],
  rein: ['Rein', "Élimine l'urée ; fait ~10 % de la néoglucogenèse."],
  aorte: ['Artère (aorte et branches)', "Sang oxygéné qui part du cœur vers les organes : aorte, carotides, artères hépatique, rénales, iliaques, fémorales."],
  veineCave: ['Veine (veine cave et branches)', "Ramène le sang des organes au cœur : veines hépatiques, rénales, iliaques, jugulaires → veines caves."],
  veinePorte: ['Veine porte', "Collecte le sang de l'intestin, de l'estomac, du pancréas et de la rate (veines mésentériques, splénique) et l'amène au foie : système porte. Le foie trie tout ce qui est absorbé, et reçoit l'insuline en premier."],
  arteHep: ['Artère hépatique', "Apporte au foie le sang oxygéné (environ 25 % du débit hépatique ; la veine porte en apporte 75 %)."],
  voieBiliaire: ['Canal cholédoque', "Voie biliaire principale : amène la bile (vésicule + canal hépatique) au duodénum."],
  vesicule: ['Vésicule biliaire', "Sous le lobe droit du foie : stocke et concentre la bile entre les repas."],
  falciforme: ['Ligament falciforme', "Sépare le lobe droit et le lobe gauche du foie sur sa face antérieure."],
  canalThoracique: ['Canal thoracique', "Grand vaisseau lymphatique : remonte les chylomicrons de l'intestin et se jette dans la veine sous-clavière gauche."],
  coeur: ['Cœur', "Pompe : tout le sang des organes repasse par lui (et par les poumons) avant de repartir dans l'aorte."],
  estomac: ['Estomac', "Son sang veineux rejoint la veine porte."],
  rate: ['Rate', "Détruit les globules rouges âgés ; la veine splénique rejoint la veine porte."],
  surrenale: ['Glande surrénale', "Coiffe le rein : médullosurrénale (adrénaline), corticosurrénale (cortisol, aldostérone)."],
  uretere: ['Uretère', "Conduit l'urine du rein à la vessie."],
  vessie: ['Vessie', "Réservoir de l'urine (urée, créatinine...)."],
  grele: ['Intestin grêle', "Duodénum, jéjunum, iléon : absorption du glucose, des AA (vers la veine porte) et des graisses (vers la lymphe)."],
  colon: ['Côlon', "Côlon ascendant, transverse, descendant, sigmoïde : bosselures (haustrations) et bandelettes musculaires."],
  tendon: ['Tendon', "Attache le muscle à l'os : tissu conjonctif dense, blanc nacré."],
  chylo: ['Chylomicron', "Grosse lipoprotéine des graisses du repas : plasma « laiteux » après un repas gras."],
};

function toast(t, ms = 2600) {
  const el = $('#toast'); el.innerHTML = t; el.classList.add('on');
  clearTimeout(toast.h); toast.h = setTimeout(() => el.classList.remove('on'), ms);
}
let AC;
function bip(f, d) {
  if (S.muet) return;
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const o = AC.createOscillator(), g = AC.createGain();
    o.frequency.value = f; o.type = 'sine'; g.gain.setValueAtTime(.05, AC.currentTime); g.gain.exponentialRampToValueAtTime(.0001, AC.currentTime + d);
    o.connect(g).connect(AC.destination); o.start(); o.stop(AC.currentTime + d); } catch (e) {}
}
function feuille(titre, html) { $('#fT').textContent = titre; $('#fC').innerHTML = html; $('#feuille').classList.add('on'); }
function fermeFeuille() { $('#feuille').classList.remove('on'); }
$('#fX').onclick = fermeFeuille;
function menuNiveaux() {
  feuille(SOMMAIRE, LV.map((L) => `<div class="carte-niv"><div class="t"><b>${NUM[L.id]}. ${L.t}</b><div style="font-size:12.5px;color:var(--doux)">${L.sub}</div></div><button class="btn" data-go="${L.id}">Y aller</button></div>`).join(''));
  $('#fC').querySelectorAll('[data-go]').forEach((b) => b.onclick = () => { fermeFeuille(); allerNiveau(b.dataset.go); });
}
$('#bNiv').onclick = menuNiveaux;
function decouvre(k) {
  const e = ENCY[k]; if (!e) return;
  const neuf = !S.ency[k]; S.ency[k] = 1; save();
  toast(`<b style="color:var(--cyan)">${e[0]}</b><br>${e[1]}${neuf ? '<br><small style="color:var(--or)">Nouvelle découverte</small>' : ''}`, 4200);
  if (neuf) bip(990, .12);
}

/* =========================================================
   MOTEUR 3D
   ========================================================= */
const cv = $('#c3d');
const R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' });
R.setPixelRatio(Math.min(devicePixelRatio, 2));
R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.15;
let W = 1, H = 1;
function taille() { W = innerWidth; H = innerHeight; R.setSize(W, H, false); if (cur) { cur.camera.aspect = W / H; cur.camera.updateProjectionMatrix(); if (cur.micro) requestAnimationFrame(cadreLibre); } }
addEventListener('resize', taille);

let cur = null, pile = [];
const clock = new THREE.Clock();
const rnd = (a, b) => a + Math.random() * (b - a);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

/* ---------- géométries ---------- */
function geoGR(half = false) {
  // profil d'Evans-Fung : z = ½√(1-x²)(0,81 + 7,83x² − 4,39x⁴), R = 3,91 µm
  const Rr = 3.91, n = 22, p = [];
  const z = (x) => 0.5 * Math.sqrt(Math.max(0, 1 - x * x)) * (0.81 + 7.83 * x * x - 4.39 * x ** 4);
  for (let i = 0; i <= n; i++) { const x = Math.sin((i / n) * Math.PI / 2); p.push(new THREE.Vector2(Math.max(0.001, x * Rr), -z(x))); }
  for (let i = n - 1; i >= 0; i--) { const x = Math.sin((i / n) * Math.PI / 2); p.push(new THREE.Vector2(Math.max(0.001, x * Rr), z(x))); }
  return new THREE.LatheGeometry(p, half ? 24 : 36, 0, half ? Math.PI : Math.PI * 2);
}
function blob(r, amp = .12, det = 4, seed = 1, freq = 2.2) {
  let g = new THREE.IcosahedronGeometry(r, det); g.deleteAttribute('normal'); g.deleteAttribute('uv'); g = mergeVertices(g); const p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); const u = v.clone().normalize();
    const n = Math.sin(u.x * freq * 3 + seed) * Math.sin(u.y * freq * 2.3 + seed * 1.7) * Math.sin(u.z * freq * 2.7 + seed * .7)
      + .5 * Math.sin(u.x * freq * 7 + seed * 3) * Math.sin(u.y * freq * 6 - seed) + .3 * Math.sin(u.z * freq * 9 + seed * 2);
    v.copy(u.multiplyScalar(r * (1 + amp * n))); p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals(); return g;
}
function spiky(r, n = 10, seed = 2) {
  let g = new THREE.IcosahedronGeometry(r, 3); g.deleteAttribute('normal'); g.deleteAttribute('uv'); g = mergeVertices(g); const p = g.attributes.position, v = new THREE.Vector3();
  const dirs = []; for (let i = 0; i < n; i++) dirs.push(V3(Math.sin(i * 2.4 + seed), Math.cos(i * 1.7 + seed * 2), Math.sin(i * 3.1 - seed)).normalize());
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); const u = v.clone().normalize(); let m = 1;
    for (const d of dirs) { const c = u.dot(d); if (c > .9) m += (c - .9) * 22; }
    v.copy(u.multiplyScalar(r * m)); p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals(); return g;
}
const mat = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .5, metalness: 0 }, o));
const matGR = () => new THREE.MeshPhysicalMaterial({ color: 0xb0141c, roughness: .42, sheen: 1, sheenColor: new THREE.Color(0xff5a5a), sheenRoughness: .5, emissive: 0x2a0004 });
function tag(o, k) { o.userData.k = k; return o; }
function canvasTex(w, h, f) { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
function texEndo() {
  return canvasTex(1024, 512, (g, w, h) => {
    g.fillStyle = '#6e1e24'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 520; k++) {
      const x = Math.random() * w, y = Math.random() * h, rx = 46 + Math.random() * 34, ry = 11 + Math.random() * 7;
      for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) {
        const X = x + dx, Y = y + dy; if (X < -rx || X > w + rx || Y < -ry * 3 || Y > h + ry * 3) continue;
        g.save(); g.translate(X, Y); g.scale(1, ry / rx);
        const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
        gr.addColorStop(0, '#d9787a'); gr.addColorStop(.55, '#b0464e'); gr.addColorStop(.92, '#7c2229'); gr.addColorStop(1, 'rgba(60,10,16,.9)');
        g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rx, 0, 7); g.fill();
        g.fillStyle = 'rgba(240,160,160,.55)'; g.beginPath(); g.arc(rx * .1, 0, rx * .22, 0, 7); g.fill();
        g.restore();
      }
    }
  });
}

/* ---------- labels HTML ---------- */
const LBL = $('#labels'); const tmpV = new THREE.Vector3();
function majLabels() {
  if (!cur) return;
  for (const l of cur.labels) {
    if (!l.el) {
      l.el = document.createElement(l.poi ? 'button' : 'div');
      if (l.poi) { l.el.className = 'poi'; l.el.onclick = (e) => { e.stopPropagation(); l.poi(); }; }
      else l.el.className = 'lab';
      LBL.appendChild(l.el);
    }
    if (l.poi && l.html) { const h = l.html(); if (h !== l.last) { l.el.innerHTML = h; l.last = h; } if (l.cls) l.el.className = 'poi ' + l.cls(); }
    else if (!l.poi && l.el.textContent !== l.t) l.el.textContent = l.t;
    (l.o ? l.o.getWorldPosition(tmpV) : tmpV.copy(l.p));
    if (l.dy) tmpV.y += l.dy;
    const d = tmpV.distanceTo(cur.camera.position);
    tmpV.project(cur.camera);
    let cache = false; for (let q = l.o; q; q = q.parent) if (!q.visible) { cache = true; break; }
    const vis = !cache && tmpV.z < 1 && tmpV.z > -1 && Math.abs(tmpV.x) < 1.2 && Math.abs(tmpV.y) < 1.2 && d < (l.max || 1e9) && (l.show ? l.show() : true) && (l.poi || !!l.t);
    l.el.style.display = vis ? '' : 'none';
    if (vis) { l.el.style.left = ((tmpV.x + 1) / 2 * W) + 'px'; l.el.style.top = ((1 - tmpV.y) / 2 * H) + 'px'; l.el.style.opacity = l.max ? Math.min(1, (l.max - d) / (l.max * .35)) : 1; }
  }
}
function viderLabels() { LBL.innerHTML = ''; }

/* ---------- interactions ---------- */
const ray = new THREE.Raycaster(); const ptr = new THREE.Vector2();
function pick(x, y) {
  ptr.set(x / W * 2 - 1, -(y / H) * 2 + 1); ray.setFromCamera(ptr, cur.camera);
  const hits = ray.intersectObjects(cur.pick || cur.scene.children, true);
  for (const h of hits) {
    let o = h.object;
    if (o.isInstancedMesh && o.userData.kAt) { const k = o.userData.kAt(h.instanceId); if (k) return { k, h }; }
    while (o) { if (o.userData.k) return { k: o.userData.k, o, h }; o = o.parent; }
  }
  return null;
}
let gestes = { pts: new Map(), down: 0, moved: 0, x0: 0, y0: 0, pinch0: 0 };
cv.addEventListener('pointerdown', (e) => {
  gestes.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (gestes.pts.size === 1) { gestes.down = performance.now(); gestes.moved = 0; gestes.x0 = e.clientX; gestes.y0 = e.clientY; }
  if (gestes.pts.size === 2) { const [a, b] = [...gestes.pts.values()]; gestes.pinch0 = Math.hypot(a.x - b.x, a.y - b.y); }
  cur && cur.onDown && cur.onDown(e);
});
cv.addEventListener('pointermove', (e) => {
  const p = gestes.pts.get(e.pointerId); if (!p) return;
  const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
  if (Math.hypot(e.clientX - gestes.x0, e.clientY - gestes.y0) > 8) gestes.moved = 1;
  if (gestes.pts.size === 2) { const [a, b] = [...gestes.pts.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); cur && cur.onPinch && cur.onPinch(d - gestes.pinch0); gestes.pinch0 = d; gestes.moved = 1; }
  else cur && cur.onDrag && cur.onDrag(dx, dy);
});
const finPtr = (e) => {
  const was = gestes.pts.size; gestes.pts.delete(e.pointerId);
  if (was === 1 && !gestes.moved && performance.now() - gestes.down < 350 && cur) {
    const r = pick(e.clientX, e.clientY); if (r) { decouvre(r.k); cur.onPick && cur.onPick(r); }
  }
};
cv.addEventListener('pointerup', finPtr); cv.addEventListener('pointercancel', finPtr);
cv.addEventListener('wheel', (e) => { e.preventDefault(); cur && cur.onPinch && cur.onPinch(-e.deltaY * .6); }, { passive: false });

/* =========================================================
   SCÈNES ZOOMÉES (OrbitControls)
   ========================================================= */
function micro(o) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(o.bg || 0x1a0306);
  if (o.fog) scene.fog = new THREE.FogExp2(o.bg || 0x1a0306, o.fog);
  const camera = new THREE.PerspectiveCamera(50, W / H, .05, 800); camera.position.copy(o.cam || V3(0, 0, 30));
  { const tg = o.target || V3(0, 0, 0), f = W < H ? Math.min(1.9, .62 * H / W) : 1; camera.position.sub(tg).multiplyScalar(f).add(tg); o.max = (o.max || 80) * f; }
  const controls = new OrbitControls(camera, cv); controls.enableDamping = true; controls.dampingFactor = .08; controls.enablePan = false;
  controls.minDistance = o.min || 5; controls.maxDistance = o.max || 80; controls.autoRotate = !!o.auto; controls.autoRotateSpeed = .5;
  if (o.target) controls.target.copy(o.target);
  scene.add(new THREE.HemisphereLight(o.sky || 0xffeeee, o.ground || 0x402020, 1.2));
  const d = new THREE.DirectionalLight(0xffffff, 1.6); d.position.set(20, 30, 25); scene.add(d);
  const d2 = new THREE.DirectionalLight(o.rim || 0x88ccff, .7); d2.position.set(-25, -10, -20); scene.add(d2);
  const self = Object.assign({ scene, camera, controls, labels: [], micro: true, retourIcone: IC.out, mini: [12, 45] }, o);
  self.d0 = camera.position.distanceTo(controls.target);
  self.zoom = (f) => { if (f === 0 && self.vue) { cadrer(self, self.vue); return; } const d = camera.position.distanceTo(controls.target); self.zd = Math.max(controls.minDistance, Math.min(controls.maxDistance, f === 0 ? self.d0 : d * f)); };
  const upd = o.update;
  self.update = (dt, t) => { controls.update(); upd && upd.call(self, dt, t); };
  self.dispose = () => { controls.dispose(); scene.traverse((x) => { x.geometry && x.geometry.dispose(); if (x.material) [].concat(x.material).forEach((m) => { m.map && m.map.dispose(); m.dispose(); }); }); };
  return self;
}
const lab = (self, o, t, dy = 0) => self.labels.push({ o, t, dy });
function etapesUI(self) {
  const L = self.niv ? lvl(self.niv) : null, si = self.si || 0;
  const txt = self.steps ? self.steps[si][1] : self.legende || '';
  const et = self.steps ? `<div class="etapes">${self.steps.map((s, i) => `<button data-i="${i}" class="${s[2] ? 'aller' : i === si ? 'on' : ''}">${s[0]}${s[2] ? ' ' + IC.go : ''}</button>`).join('')}</div>` : '';
  $('#bas').innerHTML = `${et}<div class="bulle${S.info ? ' on' : ''}" id="leg">${txt}</div>
    <div class="barre"><button class="b-info${S.info ? ' on' : ''}" id="bInfo" aria-label="Explication">${IC.info}<span>${S.info ? 'Masquer' : 'Explication'}</span></button>
    ${L ? `<span class="b-part">Partie ${NUM[L.id]} · ${L.t}</span><button class="b-lire" id="bFiche">${IC.book} Lire</button>` : ''}</div>`;
  if (L) $('#bFiche').onclick = () => ouvrirNiveau(L.id);
  $('#bInfo').onclick = () => { S.info = !S.info; save(); etapesUI(self); };
  $('#leg').onclick = () => { S.info = 0; save(); etapesUI(self); };
  $('#bas').querySelectorAll('.etapes button').forEach((b) => b.onclick = () => { const st = self.steps[+b.dataset.i]; if (st[2]) { entrerScene(st[2]); return; } self.si = +b.dataset.i; self.onStep && self.onStep(self.si); etapesUI(self);
    if (!S.info) { const bi = $('#bInfo'); bi.classList.remove('pulse'); void bi.offsetWidth; bi.classList.add('pulse'); } });
  const on = $('#bas').querySelector('.etapes .on'); if (on) on.scrollIntoView({ inline: 'center', block: 'nearest' });
  requestAnimationFrame(() => { cadreLibre(); if (self.vues || self.vue) { const v = (self.vues && self.vues[si]) || self.vue; if (self.vuDeja !== si) { cadrer(self, v, self.vuDeja === undefined); self.vuDeja = si; } } });
}
// centre la 3D dans la zone libre entre le bandeau du haut et les commandes du bas
function cadreLibre() {
  if (!cur) return;
  const haut = $('.hud').getBoundingClientRect().bottom, bas = $('#bas').getBoundingClientRect().top;
  const cy = (haut + bas) / 2, dec = H / 2 - cy;
  cur.camera.setViewOffset(W, H, 0, dec, W, H);
  for (const id of ['#depG', '#depD']) $(id).style.top = cy + 'px';
}
// cadrer une zone [x, y, z, rayon] dans l'espace libre de l'écran (portrait ou paysage)
function cadrer(sc, v, direct) {
  if (!v) return; const cam = sc.camera;
  const haut = $('.hud').getBoundingClientRect().bottom, bas = $('#bas').getBoundingClientRect().top;
  const frac = Math.max(.35, (bas - haut) / H), vf = Math.atan(Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * frac), hf = Math.atan(Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * cam.aspect);
  const d0 = v[4] ? Math.max(v[4] / Math.tan(vf), v[3] / Math.tan(hf)) * 1.08 : v[3] * 1.22 / Math.sin(Math.min(vf, hf));
  const d = Math.min(sc.controls.maxDistance, Math.max(sc.controls.minDistance, d0));
  const c = V3(v[0], v[1], v[2]);
  if (direct) { const dir = cam.position.clone().sub(sc.controls.target).normalize(); sc.controls.target.copy(c); cam.position.copy(c).addScaledVector(dir, d); sc.tgt = null; sc.zd = 0; }
  else { sc.tgt = c; sc.zd = d; }
}

const TXT = 1.7;

/* =========================================================
   Outils communs : textes 3D, voies (courbes + jetons qui circulent), organites
   ========================================================= */
function txt3d(t, col = '#ffffff', h = 1.4, fond = 'rgba(6,16,24,.72)') {
  const c = document.createElement('canvas'), x = c.getContext('2d'), fs = 44;
  x.font = `700 ${fs}px -apple-system,Segoe UI,Roboto,sans-serif`; const w = Math.ceil(x.measureText(t).width) + 30;
  c.width = w; c.height = 64; x.font = `700 ${fs}px -apple-system,Segoe UI,Roboto,sans-serif`;
  if (fond) { x.fillStyle = fond; x.strokeStyle = col; x.lineWidth = 3; x.beginPath(); x.roundRect(2, 2, w - 4, 60, 18); x.fill(); x.stroke(); }
  x.fillStyle = col; x.textBaseline = 'middle'; x.textAlign = 'center'; x.fillText(t, w / 2, 34);
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, depthWrite: false, transparent: true }));
  h *= TXT; sp.scale.set(h * w / 64, h, 1); sp.renderOrder = 5; return sp;
}
const courbe = (pts, ferme = false) => new THREE.CatmullRomCurve3(pts.map((p) => p.isVector3 ? p : V3(...p)), ferme);
function tube(c, r = .25, col = 0x5fd4e6, op = .55) {
  return new THREE.Mesh(new THREE.TubeGeometry(c, Math.max(24, c.points.length * 16), r, 8, c.closed), mat(col, { transparent: op < 1, opacity: op, emissive: col, emissiveIntensity: .25, depthWrite: op >= 1 }));
}
// flèche au bout d'une courbe
function pointe(c, col = 0x5fd4e6, u = 1, s = 1) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(.55 * s, 1.5 * s, 12), mat(col, { emissive: col, emissiveIntensity: .35 }));
  m.position.copy(c.getPointAt(Math.min(.999, u))); m.quaternion.setFromUnitVectors(V3(0, 1, 0), c.getTangentAt(Math.min(.999, u))); return m;
}
// jetons qui circulent sur une courbe : make(i) → Object3D
function flux(parent, c, n, make, vit = .1) {
  const js = []; for (let i = 0; i < n; i++) { const o = make(i); parent.add(o); js.push(o); }
  const f = { c, js, vit, on: true, ph: Math.random(),
    maj(t) { js.forEach((o, i) => { o.visible = f.on; if (f.on) o.position.copy(c.getPointAt((t * f.vit + f.ph + i / n) % 1)); }); } };
  return f;
}
const boule = (col, r = .45, k) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mat(col, { emissive: col, emissiveIntensity: .35, roughness: .35 })); if (k) tag(m, k); return m; };
// glucose : petit hexagone
const gHex = new THREE.CylinderGeometry(.55, .55, .22, 6);
const glucoseM = (col = 0xffffff) => tag(new THREE.Mesh(gHex, mat(col, { emissive: col, emissiveIntensity: .25 })), 'glucose');
// une enzyme : blob coloré + son nom en 3D
function enzyme(nom, col, r = 1.4, seed = 1) {
  const g = tag(new THREE.Group(), 'enzyme'); const m = new THREE.Mesh(blob(r, .28, 3, seed, 1.6), mat(col, { roughness: .45, emissive: col, emissiveIntensity: .12 })); g.add(m);
  if (nom) { const tx = txt3d(nom, '#' + new THREE.Color(col).getHexString(), .9); tx.position.y = r + .9; g.add(tx); }
  g.userData.corps = m; return g;
}
// mitochondrie réaliste, ouverte face à la caméra (+z local) : membrane externe, espace intermembranaire,
// membrane interne repliée en crêtes, ATP synthases (grains), ribosomes et ADN mitochondrial dans la matrice
R.localClippingEnabled = true;
function mitochondrie(L = 30, Rm = 9, o = {}) {
  const g = tag(new THREE.Group(), 'mito'), prof = o.prof || .8;
  const plan0 = new THREE.Plane(V3(0, 0, -1), Rm * .06), plan = plan0.clone(), clip = [plan];
  const Lx = L / 2 + Rm, Ri = .86;
  const ell = (sc, col, rough, k) => { const geo = new THREE.SphereGeometry(1, 72, 44); geo.scale(Lx * sc, Rm * sc, Rm * sc * .92);
    const m = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: col, roughness: rough, side: THREE.DoubleSide, clippingPlanes: clip, sheen: .7, sheenColor: new THREE.Color(0xffc8a0), clearcoat: .25 })); if (k) tag(m, k); return m; };
  const ext = ell(1, 0xa8481f, .7); ext.onBeforeRender = () => { plan.copy(plan0).applyMatrix4(g.matrixWorld); }; g.add(ext);
  g.add(ell(Ri, 0xe39a62, .45, 'mitoInterne'));
  // bord de coupe : anneaux pour lire les deux membranes
  for (const [sc, col] of [[1, 0x7a3014], [Ri, 0xf0b07a]]) { const c = new THREE.Mesh(new THREE.TorusGeometry(1, .035 / sc * 1.4, 6, 120), mat(col, { roughness: .5 })); c.scale.set(Lx * sc, Rm * sc, 1); c.position.z = Rm * .06; g.add(c); }
  const mC = new THREE.MeshPhysicalMaterial({ color: 0xeaa070, roughness: .42, side: THREE.DoubleSide, clippingPlanes: clip, clearcoat: .35, sheen: .5, sheenColor: new THREE.Color(0xffd8b0) });
  const n = Math.max(6, Math.round(L / 1.8)), billes = [];
  for (let k = 0; k < n; k++) {
    const x = -Lx * .8 + k * (1.6 * Lx / (n - 1)), e = Math.sqrt(Math.max(0, 1 - Math.pow(x / (Lx * Ri), 2))); if (e < .35) continue;
    const sd = k % 2 ? 1 : -1, ry = Rm * Ri * e, h = ry * prof * (.75 + .25 * Math.sin(k * 2.3)), dz = Rm * Ri * .92 * e * 1.95;
    const geo = new THREE.BoxGeometry(1.3, h, dz, 2, 12, 20), p = geo.attributes.position;
    for (let v = 0; v < p.count; v++) { const yy = p.getY(v), zz = p.getZ(v), tip = sstepM(h * .2, h / 2, yy * -sd + 0) ; let xx = p.getX(v);
      xx = xx * (1 - .5 * tip) + 1.1 * Math.sin(zz * .42 + k) + .5 * Math.sin(yy * .6 + k * 1.7); p.setX(v, xx); }
    geo.computeVertexNormals(); const cr = new THREE.Mesh(geo, mC); tag(cr, 'crete'); cr.position.set(x, sd * (ry - h / 2), 0); g.add(cr);
    for (let b = 0; b < 26; b++) billes.push(V3(x + (b % 2 ? .45 : -.45) + .7 * Math.sin(0), sd * (ry - rnd(.1, .95) * h), rnd(-dz / 2, 0)));
  }
  const bi = new THREE.InstancedMesh(new THREE.SphereGeometry(.17, 6, 5), new THREE.MeshStandardMaterial({ color: 0x8a2a1a, roughness: .4, clippingPlanes: clip }), billes.length); const dm = new THREE.Object3D();
  billes.forEach((b, i) => { dm.position.copy(b); dm.updateMatrix(); bi.setMatrixAt(i, dm.matrix); }); bi.userData.kAt = () => 'atpsynthase'; g.add(bi);
  // matrice : ribosomes et ADN mitochondrial circulaire
  for (let i = 0; i < 26; i++) { const r = new THREE.Mesh(new THREE.SphereGeometry(rnd(.18, .3), 8, 6), mat(0xb070c0, { emissive: 0x301040 })); r.position.set(rnd(-Lx * .6, Lx * .6), rnd(-Rm * .25, Rm * .25), rnd(-Rm * .5, -.5)); tag(r, 'ribosome'); g.add(r); }
  if (Rm > 6) { const adn = tag(new THREE.Group(), 'adnmt'); const rr = Math.min(2.4, Rm * .18);
    for (const [ph, col] of [[0, 0xd83a3a], [Math.PI, 0x3a6ad8]]) { const pts = []; for (let i = 0; i <= 80; i++) { const a = i / 80 * 6.283; pts.push(V3(Math.cos(a) * (rr + .18 * Math.cos(a * 10 + ph)), Math.sin(a) * (rr + .18 * Math.cos(a * 10 + ph)), .25 * Math.sin(a * 10 + ph))); }
      adn.add(new THREE.Mesh(new THREE.TubeGeometry(courbe(pts, true), 160, .07, 5, true), mat(col, { emissive: col, emissiveIntensity: .3 }))); }
    adn.position.set(Lx * .35, -Rm * .05, -Rm * .25); g.add(adn); }
  g.rotation.x = o.incl === undefined ? .5 : o.incl;
  return g;
}
const sstepM = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// patch de bicouche lipidique (InstancedMesh), centré en 0, normale +y
function bicouche(n = 26, sp = 1.25, cTete = 0x6fa8e0, cQueue = 0xe8d070) {
  const g = new THREE.Group(), nL = n * n * 2;
  const tetes = new THREE.InstancedMesh(new THREE.SphereGeometry(.55, 10, 8), mat(cTete, { roughness: .4 }), nL);
  const queues = new THREE.InstancedMesh(new THREE.CylinderGeometry(.13, .13, 2.1, 5), mat(cQueue, { roughness: .6 }), nL * 2);
  tetes.userData.kAt = () => 'lipide'; queues.userData.kAt = () => 'lipide';
  const dm = new THREE.Object3D(); let a = 0, b = 0;
  for (let l = 0; l < 2; l++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x = (i - n / 2) * sp + (j % 2) * .5, z = (j - n / 2) * sp, sg = l ? -1 : 1;
    dm.position.set(x, sg * 2.6, z); dm.rotation.set(0, 0, 0); dm.updateMatrix(); tetes.setMatrixAt(a++, dm.matrix);
    for (const o of [-.22, .22]) { dm.position.set(x + o, sg * 1.35, z); dm.rotation.set(0, 0, rnd(-.12, .12)); dm.updateMatrix(); queues.setMatrixAt(b++, dm.matrix); }
  }
  g.add(tetes, queues); return g;
}
// jeton texte qui jaillit puis s'estompe (ATP, NADH, CO₂...)
function bulles(parent) {
  const L = [];
  return {
    pop(t, pos, col, now, h = 1.1, vy = 2.2) { const s = txt3d(t, col, h); s.position.copy(pos); parent.add(s); L.push({ s, t0: now, vy }); },
    maj(now) { for (let i = L.length - 1; i >= 0; i--) { const o = L[i], a = now - o.t0; o.s.position.y += o.vy * .016; o.s.material.opacity = Math.max(0, 1 - a / 2.4); if (a > 2.4) { parent.remove(o.s); o.s.material.map.dispose(); o.s.material.dispose(); L.splice(i, 1); } } },
    vider() { for (const o of L) parent.remove(o.s); L.length = 0; },
  };
}
// étiquette 3D d'une étape (change de texte)
function panneau3d(parent, pos, h = 1.3) {
  let sp = null, cur = '';
  return { set(t, col = '#f5c451') { if (t === cur) return; cur = t; if (sp) { parent.remove(sp); sp.material.map.dispose(); } sp = t ? txt3d(t, col, h) : null; if (sp) { sp.position.copy(pos); parent.add(sp); } } };
}


/* =========================================================
   ORGANES RÉALISTES (procéduraux) : formes anatomiques, sillons, haustrations,
   couleurs conventionnelles (artères rouges, veines bleues, veine porte violette,
   voies biliaires vertes, lymphe blanc-jaune).
   ========================================================= */
const PERM = (() => { const p = [...Array(256).keys()]; let s = 1234567; for (let i = 255; i > 0; i--) { s = (s * 16807) % 2147483647; const j = s % (i + 1); [p[i], p[j]] = [p[j], p[i]]; } return p.concat(p); })();
const fadeN = (t) => t * t * t * (t * (t * 6 - 15) + 10), lrp = (a, b, t) => a + t * (b - a);
function gradN(h, x, y, z) { h &= 15; const u = h < 8 ? x : y, v = h < 4 ? y : (h === 12 || h === 14) ? x : z; return ((h & 1) ? -u : u) + ((h & 2) ? -v : v); }
function bruit(x, y, z) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255; x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
  const u = fadeN(x), v = fadeN(y), w = fadeN(z), A = PERM[X] + Y, AA = PERM[A] + Z, AB = PERM[A + 1] + Z, B2 = PERM[X + 1] + Y, BA = PERM[B2] + Z, BB = PERM[B2 + 1] + Z;
  return lrp(lrp(lrp(gradN(PERM[AA], x, y, z), gradN(PERM[BA], x - 1, y, z), u), lrp(gradN(PERM[AB], x, y - 1, z), gradN(PERM[BB], x - 1, y - 1, z), u), v),
    lrp(lrp(gradN(PERM[AA + 1], x, y, z - 1), gradN(PERM[BA + 1], x - 1, y, z - 1), u), lrp(gradN(PERM[AB + 1], x, y - 1, z - 1), gradN(PERM[BB + 1], x - 1, y - 1, z - 1), u), v), w);
}
const fbm = (x, y, z, o = 3) => { let a = 0, f = 1, s = .5; for (let i = 0; i < o; i++) { a += s * bruit(x * f, y * f, z * f); f *= 2.03; s *= .5; } return a; };
const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// déforme une géométrie ; fn(p) renvoie [x, y, z, ombre 0..1]
function sculpte(geo, fn, base) {
  geo.deleteAttribute('normal'); geo.deleteAttribute('uv'); geo = mergeVertices(geo);
  const p = geo.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color(base), v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const r = fn(v.clone()); p.setXYZ(i, r[0], r[1], r[2]); const o = r[3] || 0; col[i * 3] = c.r * (1 - o); col[i * 3 + 1] = c.g * (1 - o); col[i * 3 + 2] = c.b * (1 - o * .9); }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals(); return geo;
}
const matOrg = (o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color: 0xffffff, vertexColors: true, roughness: .42, clearcoat: .55, clearcoatRoughness: .35, sheen: .4, sheenColor: new THREE.Color(0xffe0e0) }, o));
// tube dont le rayon varie : rf(u, angle) multiplie le rayon
function tubeVar(c, segs, r, rf, radial = 14) {
  const g = new THREE.TubeGeometry(c, segs, r, radial, false), p = g.attributes.position, P = new THREE.Vector3(), v = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) { c.getPointAt(i / segs, P); for (let j = 0; j <= radial; j++) { const k = i * (radial + 1) + j; v.fromBufferAttribute(p, k).sub(P).multiplyScalar(rf(i / segs, j / radial)); p.setXYZ(k, P.x + v.x, P.y + v.y, P.z + v.z); } }
  g.computeVertexNormals(); return g;
}
const vaisseau = (pts, r, col, k, op = 1) => tag(new THREE.Mesh(new THREE.TubeGeometry(courbe(pts), Math.max(40, pts.length * 14), r, 10, false), new THREE.MeshPhysicalMaterial({ color: col, roughness: .35, clearcoat: .6, transparent: op < 1, opacity: op })), k);

/* ---------- cerveau : 2 hémisphères à circonvolutions, cervelet à lamelles, tronc cérébral ---------- */
function cerveau(R = 7) {
  const g = tag(new THREE.Group(), 'cerveau');
  for (const sg of [-1, 1]) {
    const geo = sculpte(new THREE.SphereGeometry(1, 150, 110), (p) => {
      let x = p.x * .5, y = p.y * .62, z = p.z * .85; if (x * sg < 0) x *= .3;                 // hémisphère allongé d'avant en arrière
      if (y < -.1) y = -.1 + (y + .1) * .7;                            // base aplatie
      if (z > .3) y *= 1 - (z - .3) * .25;                              // lobe frontal plus bas
      const n = fbm(p.x * 4.2 + sg * 7, p.y * 4.2, p.z * 4.2, 2), sul = sstep(.075, 0, Math.abs(n));   // sillons = lignes fines
      const syl = Math.exp(-Math.pow((y + .05 - z * .35) / .05, 2)) * sstep(-.2, .2, z) * (p.x * sg > 0 ? 1 : 0);  // scissure latérale
      const d = 1 - .055 * sul - .12 * syl + .012 * (1 - sul); return [(x + sg * .515) * d * R, y * d * R, z * d * R, .55 * sul + .5 * syl];
    }, 0xe9a3a6);
    g.add(new THREE.Mesh(geo, matOrg({ sheenColor: new THREE.Color(0xffd0d0) })));
  }
  const cb = sculpte(new THREE.SphereGeometry(1, 100, 70), (p) => { const f = Math.abs(Math.sin(p.y * 34 + bruit(p.x * 3, p.y * 3, p.z * 3) * 2)); const d = 1 - .05 * sstep(.25, 0, f);
    return [p.x * .62 * d * R, (p.y * .3 - .5) * d * R, (p.z * .4 - .62) * d * R, .5 * sstep(.25, 0, f)]; }, 0xb86a62);
  g.add(new THREE.Mesh(cb, matOrg()));
  const tronc = new THREE.Mesh(new THREE.CylinderGeometry(.14 * R, .1 * R, .7 * R, 20), matOrg({ vertexColors: false, color: 0xc88a78 })); tronc.position.set(0, -.68 * R, -.35 * R); tronc.rotation.x = .25; g.add(tronc);
  g.userData.cervelet = new THREE.Vector3(0, -.5 * R, -.62 * R); g.userData.tronc = tronc.position.clone();
  return g;
}
/* ---------- foie : lobe droit volumineux, lobe gauche effilé, face inférieure plane, ligament falciforme, vésicule ---------- */
function foieMod(S = 8) {
  const g = tag(new THREE.Group(), 'foie');
  const geo = sculpte(new THREE.SphereGeometry(1, 120, 90), (p) => {
    let { x, y, z } = p; const t = sstep(-.6, 1, x);                    // x > 0 : lobe gauche du patient (à droite à l'écran)
    y *= .62 * (1 - .62 * t); z *= .6 * (1 - .5 * t);
    if (y < -.12) y = -.12 + (y + .12) * .35;                          // face inférieure presque plane
    y += .18 * (1 - x * x) * (y > 0 ? 1 : 0) - .1 * t;
    const b = fbm(p.x * 5, p.y * 5, p.z * 5, 2) * .015;
    return [x * 1.25 * S, y * S + b * S, z * S + b * S, Math.max(0, -y * 1.2) * .35];
  }, 0x8e2c24);
  g.add(new THREE.Mesh(geo, matOrg({ clearcoat: .8, sheenColor: new THREE.Color(0xff9a8a) })));
  const fal = new THREE.Mesh(new THREE.TubeGeometry(courbe([[.12 * S, .62 * S, .1 * S], [.16 * S, .5 * S, .42 * S], [.2 * S, .1 * S, .58 * S], [.22 * S, -.12 * S, .55 * S]]), 40, .045 * S, 8), new THREE.MeshPhysicalMaterial({ color: 0xf0c8c8, roughness: .5, transparent: true, opacity: .85 }));
  tag(fal, 'falciforme'); g.add(fal);
  const ves = new THREE.Mesh(new THREE.LatheGeometry([...Array(16)].map((_, i) => { const u = i / 15; return new THREE.Vector2(Math.sin(u * Math.PI) * (.17 + .1 * u) * S + .001, (u - .5) * .55 * S); }), 28), new THREE.MeshPhysicalMaterial({ color: 0x8a9a3a, roughness: .35, clearcoat: .8 }));
  ves.position.set(-.45 * S, -.2 * S, .3 * S); ves.rotation.z = -1.2; tag(ves, 'vesicule'); g.add(ves);
  g.userData.vesicule = ves.position.clone(); g.userData.hile = new THREE.Vector3(-.15 * S, -.15 * S, .05 * S);
  return g;
}
/* ---------- rein : forme de haricot, hile médial, surrénale ---------- */
function reinMod(cote = 1, S = 3.2) {
  const g = tag(new THREE.Group(), 'rein');
  const geo = sculpte(new THREE.SphereGeometry(1, 80, 60), (p) => { let x = p.x * .58, y = p.y, z = p.z * .42;
    const med = x * cote < 0 ? 1 : 0, hile = med * Math.exp(-y * y / .08) * .28; x += cote * hile;
    const sp = bruit(p.x * 18, p.y * 18, p.z * 18); return [x * S, y * S, z * S, .12 * sstep(.3, .6, sp) + hile * .6]; }, 0x7c2420);
  g.add(new THREE.Mesh(geo, matOrg({ clearcoat: .7 })));
  const sur = new THREE.Mesh(sculpte(new THREE.ConeGeometry(.55, .75, 24, 6), (p) => [p.x * S * (1 + .1 * bruit(p.x * 6, p.y * 6, 0)), p.y * S, p.z * .5 * S, 0], 0xe2b04a), matOrg({ clearcoat: .3 }));
  sur.position.set(cote * .12 * S, 1.15 * S, 0); tag(sur, 'surrenale'); g.add(sur);
  g.userData.hile = new THREE.Vector3(-cote * .4 * S, 0, 0); return g;
}
/* ---------- muscle strié squelettique fusiforme avec tendons ---------- */
function muscleMod(L = 18, R = 3.2) {
  const g = tag(new THREE.Group(), 'muscle');
  const prof = [...Array(30)].map((_, i) => { const u = i / 29; return new THREE.Vector2(.01 + R * Math.pow(Math.sin(u * Math.PI), 1.3) * (1 - .15 * u), (u - .5) * L); });
  const tex = canvasTex(512, 512, (x, w, h) => { const gr = x.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#9a2026'); gr.addColorStop(.5, '#c8363a'); gr.addColorStop(1, '#9a2026'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { x.strokeStyle = `rgba(${i % 3 ? 255 : 90},${i % 3 ? 140 : 20},${i % 3 ? 140 : 30},${.08 + Math.random() * .18})`; x.lineWidth = 1 + Math.random() * 3; const xx = Math.random() * w; x.beginPath(); x.moveTo(xx, 0); x.bezierCurveTo(xx + rnd(-20, 20), h * .3, xx + rnd(-20, 20), h * .7, xx + rnd(-10, 10), h); x.stroke(); } });
  tex.wrapS = THREE.RepeatWrapping; tex.repeat.set(2, 1);
  g.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 48), new THREE.MeshPhysicalMaterial({ map: tex, roughness: .5, clearcoat: .5, sheen: .5, sheenColor: new THREE.Color(0xff9090) })));
  const mT = new THREE.MeshPhysicalMaterial({ color: 0xe8ecf0, roughness: .25, clearcoat: 1, sheen: 1, sheenColor: new THREE.Color(0xffffff) });
  for (const sg of [-1, 1]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(.35, R * .35, L * .22, 16), mT); t.position.y = sg * L * .58; if (sg < 0) t.rotation.z = Math.PI; tag(t, 'tendon'); g.add(t); }
  return g;
}
/* ---------- intestin grêle (anses) + côlon cadre (haustrations, bandelette) + appendice ---------- */
function intestinMod() {
  const g = tag(new THREE.Group(), 'intestin');
  const pts = []; let x = -5, y = -11, dir = 1; for (let r = 0; r < 6; r++) { for (let i = 0; i < 6; i++) { pts.push([x + rnd(-.6, .6), y + Math.sin(i * 1.7 + r) * 1.1, Math.sin(i * 1.3 + r * 2) * 1.5 + 1.5]); x += dir * 2; } y -= 2.2; dir *= -1; x += dir * 1; }
  const cG = courbe(pts); const gr = new THREE.Mesh(tubeVar(cG, 600, .95, (u) => 1 + .05 * Math.sin(u * 300)), new THREE.MeshPhysicalMaterial({ color: 0xe8a48a, roughness: .38, clearcoat: .8, sheen: .6, sheenColor: new THREE.Color(0xffd0c0) }));
  tag(gr, 'grele'); g.add(gr);
  const cC = courbe([[-10.5, -27, 1], [-11, -20, 1], [-11, -12, 1], [-10, -8.5, 1.5], [-4, -9.5, 3], [2, -10.5, 3], [8, -8.5, 1.5], [10.5, -10, 1], [11, -18, 1], [10.5, -25, 1.5], [7, -28, 3], [3, -27, 3], [1, -29, 2], [.5, -33, 1]]);
  const col = new THREE.Mesh(tubeVar(cC, 700, 1.75, (u, a) => { const hs = Math.pow(Math.abs(Math.sin(u * 95)), .6); return u > .93 ? .85 : .82 + .26 * hs; }, 18), new THREE.MeshPhysicalMaterial({ color: 0xc46a48, roughness: .42, clearcoat: .7, sheen: .5, sheenColor: new THREE.Color(0xffb090) }));
  tag(col, 'colon'); g.add(col);
  const band = new THREE.Mesh(new THREE.TubeGeometry(courbe(cC.getPoints(60).slice(2, 54).map((p) => p.clone().add(V3(0, 0, 1.95)))), 300, .16, 6), mat(0xe0a088, { roughness: .4 })); g.add(band);
  const app = new THREE.Mesh(new THREE.TubeGeometry(courbe([[-10.5, -27.5, 1], [-9.5, -30, 1.5], [-8.6, -31.5, 2.5]]), 20, .3, 8), mat(0xc87a58)); g.add(app);
  g.userData.jejunum = V3(-5, -11, 1.5); return g;
}
function estomacMod() {
  const c = courbe([[1.5, 8.5, -1], [4, 9, 0], [7, 7, 1], [7.5, 3.5, 2], [5.5, .5, 2.5], [2.5, -.5, 2.5], [.5, .3, 2]]);
  return tag(new THREE.Mesh(tubeVar(c, 120, 2.2, (u) => .45 + 1.1 * Math.sin(Math.min(1, u * 1.25) * Math.PI) * (1 - .4 * u)), new THREE.MeshPhysicalMaterial({ color: 0xd8907a, roughness: .45, clearcoat: .6 })), 'estomac');
}
function pancreasMod() {
  const c = courbe([[-3.5, -3.5, 0], [0, -2.5, -.5], [4, -1.5, -1.2], [8, -.3, -2], [11, .5, -2.5]]);
  const geo = tubeVar(c, 120, 1.25, (u, a) => (1.15 - .55 * u) * (1 + .12 * bruit(u * 40, a * 6, 0)), 14);
  return tag(new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: 0xe7b07a, roughness: .6, clearcoat: .2 })), 'pancreas');
}
function coeurMod(S = 3.6) {
  const geo = sculpte(new THREE.SphereGeometry(1, 70, 50), (p) => { let { x, y, z } = p; const apex = sstep(.1, -1, y); x *= 1 - .45 * apex; z *= .8 * (1 - .35 * apex); y *= 1.15;
    const sill = Math.exp(-Math.pow((x - y * .4 - .1) / .07, 2)) * .5; return [x * S, y * S, z * S, sill]; }, 0x8e2424);
  const m = tag(new THREE.Mesh(geo, matOrg({ clearcoat: .8 })), 'coeur'); m.rotation.z = .55; return m;
}
function vessieMod() { const m = new THREE.Mesh(new THREE.SphereGeometry(2.6, 40, 30), new THREE.MeshPhysicalMaterial({ color: 0xe0b080, roughness: .35, clearcoat: .7, transparent: true, opacity: .92 })); m.scale.set(1.1, .85, .9); return tag(m, 'vessie'); }
function rateMod() { const m = new THREE.Mesh(sculpte(new THREE.SphereGeometry(1, 50, 36), (p) => [p.x * 1.6, p.y * 3, p.z * 1, 0], 0x6a2a50), matOrg()); return tag(m, 'rate'); }
function adipeuxMod() { const g = tag(new THREE.Group(), 'adipeux'); const m = new THREE.MeshPhysicalMaterial({ color: 0xf2cf62, roughness: .22, clearcoat: 1, transmission: .1 });
  for (let i = 0; i < 46; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(rnd(.9, 1.5), 16, 12), m); b.position.set(rnd(-4, 4), rnd(-3, 3), rnd(-2, 2)); b.scale.set(1, rnd(.8, 1.1), 1); g.add(b); } return g; }


/* =========================================================
   HUB : un hépatocyte en coupe
   ========================================================= */
function sceneCellule() {
  const s = micro({ id: 'cellule', hub: true, titre: 'Dans le foie : un hépatocyte', echelle: 'Cellule ≈ 25 µm · coupe ouverte', bg: 0x1a0d08, fog: .006, cam: V3(10, 26, 92), min: 20, max: 220, auto: true, sky: 0xffeedd, ground: 0x301008,
    vue: [0, 0, 0, 34], legende: "L'<b>hépatocyte</b> est la cellule du foie, le centre du métabolisme. Touche un repère numéroté pour entrer : chaque repère est une partie du cours. Le glucose et les AA du repas arrivent par la <b>veine porte</b> ; le foie stocke, transforme et redistribue." });
  s.retourIcone = IC.map; const S3 = s.scene;
  // membrane (sphère déformée, ouverte vers la caméra)
  const gM = blob(1, .06, 5, 3, 1.1); gM.scale(36, 28, 30);
  const memb = tag(new THREE.Mesh(gM, new THREE.MeshPhysicalMaterial({ color: 0xe8a888, roughness: .5, transparent: true, opacity: .16, depthWrite: false, side: THREE.DoubleSide, sheen: .8, sheenColor: new THREE.Color(0xffd8c0) })), 'hepatocyte');
  S3.add(memb);
  // noyau + nucléole
  const noyau = tag(new THREE.Mesh(blob(8, .06, 4, 5), new THREE.MeshPhysicalMaterial({ color: 0x6a5ab0, roughness: .5, transparent: true, opacity: .85 })), 'noyau'); noyau.position.set(-4, 4, -6); S3.add(noyau);
  const nu = new THREE.Mesh(new THREE.SphereGeometry(2.6, 20, 14), mat(0x3a2a80)); nu.position.set(-2, 6, -2); S3.add(nu);
  // réticulum (rubans ondulés autour du noyau)
  const re = tag(new THREE.Group(), 're'); for (let i = 0; i < 7; i++) { const r0 = 11 + i * 1.6; const c = courbe([...Array(9)].map((_, j) => { const a = -1.2 + j * .32; return [-4 + Math.cos(a) * r0, 4 + Math.sin(a) * r0 * .8, -6 + Math.sin(j * 1.3 + i) * 2]; }));
    re.add(new THREE.Mesh(new THREE.TubeGeometry(c, 50, .55, 6), mat(0x8aa8d8, { roughness: .45 }))); } S3.add(re);
  // mitochondries
  const mitos = []; for (const [x, y, z, r] of [[18, -8, 4, .3], [-20, -12, 8, -.4], [14, 14, -10, .9], [-22, 10, 6, 1.4], [4, -18, -6, .1]]) { const m = mitochondrie(12, 3.6, { prof: .7 }); m.position.set(x, y, z + 6); m.rotation.set(.5 + r * .1, r * .3, r * 1.6); S3.add(m); mitos.push(m); }
  // glycogène (rosettes) et gouttelettes lipidiques
  const gly = tag(new THREE.Group(), 'glycogene'); for (let i = 0; i < 60; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(rnd(.5, .9), 8, 6), mat(0xf2e6b0, { roughness: .6 })); const a = rnd(0, 6.28), r = rnd(0, 5); b.position.set(-14 + Math.cos(a) * r, -2 + Math.sin(a) * r * .6, 14 + rnd(-2, 2)); gly.add(b); } S3.add(gly);
  const gout = []; for (const [x, y, z, r] of [[10, -4, 16, 3.2], [22, 6, 8, 2.4], [6, -20, 8, 2]]) { const g = tag(new THREE.Mesh(new THREE.SphereGeometry(r, 24, 18), new THREE.MeshPhysicalMaterial({ color: 0xf2c84a, roughness: .2, clearcoat: 1 })), 'gouttelette'); g.position.set(x, y, z); S3.add(g); gout.push(g); }
  // GLUT-2 sur la membrane (côté sinusoïde, à gauche)
  const glutP = V3(-33, -4, 6); const glut = tag(new THREE.Group(), 'glut2'); for (let i = 0; i < 6; i++) { const h = new THREE.Mesh(new THREE.CylinderGeometry(.6, .6, 5, 8), mat(0x3a9ae0)); const a = i / 6 * 6.28; h.position.set(Math.cos(a) * 1.3, 0, Math.sin(a) * 1.3); glut.add(h); }
  glut.position.copy(glutP); glut.rotation.z = Math.PI / 2; S3.add(glut);
  // glucose qui entre et circule dans le cytosol
  const cEntree = courbe([[-46, -4, 6], [-33, -4, 6], [-22, -2, 10], [-10, -6, 14], [0, -4, 18], [8, 2, 10], [14, 0, 2]]);
  const fl = flux(S3, cEntree, 10, () => glucoseM(), .06);
  // le sinusoïde à gauche (sang)
  const sin = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 90, 30, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xa02030, roughness: .5, transparent: true, opacity: .3, side: THREE.DoubleSide, depthWrite: false })); sin.position.set(-46, 0, 0); S3.add(sin);
  lab(s, sin, 'Sinusoïde (sang de la veine porte)', 26);
  // repères
  const pois = [['L1', V3(0, 30, 0)], ['L2', glutP.clone().add(V3(-1, 6, 0))], ['L3', V3(-2, -6, 20)], ['L3b', gly.position.clone().add(V3(-14, 4, 14))], ['L3c', mitos[0].position.clone().add(V3(0, 5, 0))], ['L4', gout[0].position.clone().add(V3(0, 4, 0))], ['L5', mitos[4].position.clone().add(V3(0, 4, 0))], ['L6', mitos[2].position.clone().add(V3(0, 5, 0))]];
  for (const [id, p] of pois) { const o = new THREE.Object3D(); o.position.copy(p); S3.add(o); const L = lvl(id);
    s.labels.push({ o, poi: () => allerNiveau(id), html: () => `<span class="pas"><span class="num">${NUM[id]}</span><span>${L.t}</span></span><span class="tige"></span>`, cls: () => '' }); }
  s.update = function (dt, t) { s.controls.update(); fl.maj(t); fl.js.forEach((o) => o.rotation.x += dt); noyau.rotation.y += dt * .05; mitos.forEach((m, i) => m.rotation.y = Math.sin(t * .3 + i) * .15); };
  return s;
}

/* =========================================================
   1. LE SCHÉMA : REPAS ET JEÛNE — les organes, à leur place, et les vrais vaisseaux
   ========================================================= */
function sceneBilan() {
  const s = micro({ id: 'bilan', niv: 'L1', titre: 'Repas et jeûne : les organes', echelle: 'Vue de face · artères rouges, veines bleues, veine porte violette, lymphe blanche', bg: 0x0b1620, fog: .003, cam: V3(0, -2, 120), min: 8, max: 260, target: V3(0, -4, 0), vue: [0, -3, 0, 21, 54], sky: 0xf0f4ff, ground: 0x203040,
    vues: [null, null, null, null, null, null],
    steps: [
      ['Anatomie', "Le sang de l'<b>intestin</b>, du <b>pancréas</b>, de l'<b>estomac</b> et de la <b>rate</b> passe d'abord par le <b>foie</b> par la <b>veine porte</b> (violet) : tout ce qui est absorbé est trié par le foie. Le foie reçoit aussi l'<b>artère hépatique</b> (O₂) et se vide par les <b>veines hépatiques</b> dans la <b>veine cave inférieure</b>. Les <b>graisses</b> du repas, elles, passent par la <b>lymphe</b> (canal thoracique). Zoome et touche les organes pour les noms."],
      ['Repas', "Après un repas : <b>insuline ↑</b> (cellules β ; elle arrive d'abord au foie par la veine porte). Le glucose arrive au <b>foie</b> par la veine porte. On stocke : <b>glycogène</b> (foie ~150 g, muscles ~300 g), puis l'excès devient <b>AG → TG</b>, exportés en <b>VLDL</b> vers le tissu adipeux. Les graisses arrivent en <b>chylomicrons</b> par la lymphe. Les AA en trop : NH₃ → <b>urée</b> → rein."],
      ['Jeûne court', "<b>Glucagon ↑</b>, insuline ↓. Le <b>glycogène du foie</b> est dégradé et le glucose est <b>relâché dans le sang</b> (glucose-6-phosphatase : seul le foie peut) : veines hépatiques → veine cave → cœur → aorte → <b>cerveau</b> et <b>globules rouges</b>. Le glycogène musculaire ne sert qu'au muscle."],
      ['Graisses', "Après ~20-35 min d'effort ou quelques heures de jeûne : <b>lipolyse</b> du tissu adipeux → <b>AG</b> (liés à l'albumine) vers le muscle et le foie (β-oxydation). Le foie fabrique des <b>corps cétoniques</b> pour les muscles, le cœur, puis le cerveau. Voie la plus rentable mais la plus lente."],
      ['Protéines', "Jeûne prolongé (24-48 h) : <b>protéolyse musculaire</b> → <b>alanine</b> vers le foie → <b>néoglucogenèse</b> (glucose). L'azote devient de l'<b>urée</b>, filtrée par le <b>rein</b> et stockée dans la <b>vessie</b>."],
      ['Cycle de Cori', "Effort intense : le muscle (et les GR) font du <b>lactate</b> (anaérobie). Il part au foie, redevient pyruvate puis <b>glucose</b> (néoglucogenèse), qui repart au muscle."],
    ] });
  const S3 = s.scene;
  const poser = (o, p, nom, dy, det) => { o.position.copy(p); S3.add(o); if (nom) s.labels.push({ o, t: nom, dy, max: det ? 70 : undefined }); return o; };
  // organes à leur place (vue de face : le foie est à gauche de l'écran = à droite du patient)
  const cer = poser(cerveau(7.5), V3(0, 41, -1), 'Cerveau', 9); cer.rotation.y = -.85;
  poser(new THREE.Object3D(), V3(0, 41 - 3.2, -5), 'Cervelet', -1.5, 1); poser(new THREE.Object3D(), V3(0, 41 - 4.4, -3), 'Tronc cérébral', -3, 1);
  const coeur = poser(coeurMod(3.4), V3(1.5, 15, 1), 'Cœur', -4.6);
  const foie = poser(foieMod(8.5), V3(-5, 5, 1), 'Foie', 7.5);
  poser(new THREE.Object3D(), V3(-5 - .45 * 8.5, 5 - .2 * 8.5, 1 + .3 * 8.5), 'Vésicule biliaire', -2.2, 1);
  poser(new THREE.Object3D(), V3(-5 + .2 * 8.5, 5 + .35 * 8.5, 1 + .55 * 8.5), 'Ligament falciforme', 1, 1);
  const est = poser(estomacMod(), V3(1, 0, -1), null); poser(new THREE.Object3D(), V3(7.5, 6, 2), 'Estomac', 0, 1);
  const rate = poser(rateMod(), V3(13, 3, -4), 'Rate', -4, 1);
  const pan = poser(pancreasMod(), V3(0, 0, -1), null); poser(new THREE.Object3D(), V3(5, -1.5, 0), 'Pancréas', -2, 0);
  const rG = poser(reinMod(1), V3(-7.5, -6, -6), 'Rein', -4.4), rD = poser(reinMod(-1), V3(7.5, -5, -6), null);
  poser(new THREE.Object3D(), V3(7.5 - .4, -5 + 3.7, -6), 'Glande surrénale', 1.2, 1);
  const intest = poser(intestinMod(), V3(0, 0, 0), null);
  poser(new THREE.Object3D(), V3(0, -17, 3.5), 'Intestin grêle', 0); poser(new THREE.Object3D(), V3(10.8, -16, 2.6), 'Côlon', 0, 1); poser(new THREE.Object3D(), V3(-9, -31.5, 2.5), 'Appendice', -1, 1);
  const vessie = poser(vessieMod(), V3(0, -36, 2), 'Vessie', -3.2);
  const musc = poser(muscleMod(17, 3), V3(11, -47, 1), 'Muscle squelettique (cuisse)', 0); musc.rotation.z = .12;
  poser(new THREE.Object3D(), V3(11.6, -37, 1), 'Tendon', 1, 1);
  const adip = poser(adipeuxMod(), V3(-18, -20, 1), 'Tissu adipeux', -5);
  const grs = new THREE.Group(); for (let i = 0; i < 6; i++) { const g2 = new THREE.Mesh(geoGR(), matGR()); g2.scale.setScalar(.38); g2.position.set(i * 1.3 - 3, Math.sin(i * 2) * .9, Math.cos(i) * .6); g2.rotation.set(1 + i, i, 0); grs.add(g2); } tag(grs, 'gr');
  poser(grs, V3(8.5, 19, 2), 'Globules rouges', 2.2);
  // vaisseaux (couleurs conventionnelles)
  const ROUGE = 0xc0282c, BLEU = 0x2c5ab8, VIOLET = 0x7a4ab0, VERT = 0x5fa84a, LYMPHE = 0xf0ecd0;
  const V = (pts, r, c, k, nom, iN, det = 1) => { const m = vaisseau(pts, r, c, k); S3.add(m); if (nom) { const o = new THREE.Object3D(); o.position.copy(V3(...pts[iN])); S3.add(o); s.labels.push({ o, t: nom, dy: 1.2, max: det ? 70 : 110, show: () => step === 0 }); } return m; };
  V([[1.8, 17.5, 0], [2.5, 21, -.5], [4.5, 22, -2.5], [4, 19, -4.5], [2, 14, -5], [1.5, 6, -5], [1.5, -10, -5], [1.5, -26, -5]], .75, ROUGE, 'aorte', 'Aorte', 5, 0);
  V([[-1.5, -26, -5.3], [-1.5, -10, -5.3], [-1.5, 6, -5.3], [-1.2, 11, -3], [0, 14, -.5]], .85, BLEU, 'veineCave', 'Veine cave inférieure', 2, 0);
  V([[0, -13, 1.5], [-.5, -7, 0], [-2, -2.5, .5], [-4, .5, 1], [-5.5, 2.5, 1.2]], .55, VIOLET, 'veinePorte', 'Veine porte', 2, 0);
  V([[12, 2, -3.5], [8, -1.2, -2.6], [3, -3.6, -1.5], [-.6, -5.5, .2]], .35, VIOLET, 'veinePorte', 'Veine splénique', 1);
  V([[1.5, -1, -5], [-1.5, -.5, -2], [-4, .6, .4], [-5.2, 2.2, .8]], .3, ROUGE, 'arteHep', 'Artère hépatique', 1);
  V([[-5, 9, -1], [-3, 9.5, -3.5], [-1.4, 9, -5.2]], .45, BLEU, 'veineCave', 'Veines hépatiques', 1);
  V([[-8.8, .8, 4.2], [-6.5, -1, 2.5], [-4.5, -3.5, 1.5], [-2.5, -6, 1.5]], .28, VERT, 'voieBiliaire', 'Canal cholédoque', 2);
  V([[2.5, 21, -.5], [2, 28, 0], [1.4, 34, -.5]], .4, ROUGE, 'aorte', 'Carotide', 1); V([[-1.6, 34, -.5], [-2, 28, 0], [-.5, 18, -.5]], .45, BLEU, 'veineCave', 'Jugulaire', 1);
  V([[1.5, -6, -5], [4, -5.5, -6], [6.2, -5, -6]], .32, ROUGE, 'aorte', 'Artère rénale', 1); V([[-1.5, -6.5, -5.3], [-4, -6.3, -6], [-6.3, -6, -6]], .38, BLEU, 'veineCave', 'Veine rénale', 0);
  V([[-6.3, -7, -5], [-5, -16, -4], [-2.5, -30, -1], [-1.2, -34.5, 1]], .2, 0xe8d09a, 'uretere', 'Uretère', 1); V([[6.3, -6, -5], [5, -16, -4], [2.5, -30, -1], [1.2, -34.5, 1]], .2, 0xe8d09a, 'uretere');
  V([[1.5, -26, -5], [5, -30, -3], [9, -35, -.5], [10.5, -39, .5]], .55, ROUGE, 'aorte', 'Artère iliaque → fémorale', 1); V([[10, -39, 1.6], [8, -35, 1], [4, -30, -3.6], [-1.5, -26, -5.3]], .6, BLEU, 'veineCave', 'Veine fémorale → iliaque', 1);
  V([[1.5, -14, -5], [-6, -17, -2], [-14, -19.5, .5]], .3, ROUGE, 'aorte'); V([[-14, -21, .8], [-6, -18.5, -2.6], [-1.5, -15, -5.3]], .35, BLEU, 'veineCave');
  V([[0, -12, -.5], [0, -9, -6.5], [.4, 0, -6.4], [.8, 12, -6], [3, 19.5, -3.5], [5.5, 21, -1]], .22, LYMPHE, 'canalThoracique', 'Canal thoracique (lymphe)', 2);
  // réserves de glycogène (taille = stock)
  const granules = (n) => { const g2 = tag(new THREE.Group(), 'glycogene'); for (let i = 0; i < n; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(rnd(.25, .45), 8, 6), mat(0xfff0b0, { emissive: 0x806020, emissiveIntensity: .6 })); b.position.set(rnd(-1.6, 1.6), rnd(-1, 1), rnd(-1, 1)); g2.add(b); } return g2; };
  const gF = granules(40); gF.position.set(-9, 7, 7); S3.add(gF); s.labels.push({ o: gF, t: 'Glycogène du foie', dy: 2.4, max: 110, show: () => step > 0 });
  const gM = granules(30); gM.position.set(14.5, -46, 3); S3.add(gM); s.labels.push({ o: gM, t: 'Glycogène musculaire', dy: 2.4, max: 110, show: () => step > 0 });
  const hor = panneau3d(S3, V3(0, 54, 0), 1.7);
  // routes du sang (elles passent par les vrais vaisseaux et par le cœur)
  const P = {
    porte: [[0, -14, 2.5], [-.5, -7, 1], [-2, -2.5, 1.5], [-4, .5, 2], [-5.5, 3, 2.2]],
    foieCoeur: [[-6, 7, 0], [-3, 9.6, -3.4], [-1.4, 9.4, -4.4], [-1.2, 11.5, -2.4], [.4, 14.5, .4]],
    coeurAorte: [[1.8, 17.5, 1], [2.5, 21, .5], [4.5, 22, -1.5], [4, 19, -3.6], [2, 14, -4]],
    aorteBas: [[1.5, 6, -4], [1.5, -10, -4], [1.5, -26, -4]],
    versMuscle: [[5, -30, -2], [9, -35, .5], [11, -42, 2.5]],
    versCerveau: [[2.5, 21, .5], [2, 28, 1], [1.4, 35, .5], [.5, 38, 2]],
    versGR: [[1.8, 17.5, 1], [4.5, 18.5, 2.5], [7.5, 18, 3]],
    versAdip: [[1.5, -13, -4], [-6, -16.5, -1], [-14, -19.5, 1.6]],
    adipCoeur: [[-14, -21, 2], [-6, -18.5, -1.6], [-1.5, -15, -4.3], [-1.5, 6, -4.3], [-1.2, 11, -2], [.4, 14.5, .4]],
    museCoeur: [[10, -40, 2.6], [8, -35, 2], [4, -30, -2.6], [-1.5, -26, -4.3], [-1.5, 6, -4.3], [-1.2, 11, -2], [.4, 14.5, .4]],
    versFoieArt: [[1.5, 6, -4], [1.5, -1, -4], [-1.5, -.5, -1], [-4, .6, 1.4], [-5.5, 2.5, 2]],
    versRein: [[1.5, 6, -4], [1.5, -6, -4], [4, -5.5, -5], [6.2, -5, -5]],
    reinVessie: [[6.6, -7, -4], [5, -16, -3], [2.5, -30, 0], [1, -35, 2.5]],
    lymphe: [[0, -12, .5], [0, -9, -5.5], [.4, 0, -5.4], [.8, 12, -5], [3, 19.5, -2.5], [5.5, 21, 0], [3, 18, 1], [.4, 14.5, .4]],
    pancFoie: [[6, -1, 0], [3, -3, -.5], [-.6, -5, 1.2], [-2, -2.5, 1.5], [-4, .5, 2], [-5.5, 3, 2.2]],
    grFoie: [[7.5, 18, 3], [4.5, 22, -1.5], [4, 19, -3.6], [2, 14, -4]],
  };
  const R = (...noms) => noms.flatMap((n) => P[n]);
  const F = [
    [R('porte'), 0xffffff, 'glucose', [1], 'glucose'], [R('foieCoeur', 'coeurAorte', 'aorteBas', 'versMuscle'), 0xffffff, 'glucose', [1, 5], 'glucose'],
    [R('foieCoeur', 'coeurAorte', 'aorteBas', 'versAdip'), 0xf0a040, 'VLDL', [1], 'vldl'], [R('lymphe', 'coeurAorte', 'aorteBas', 'versAdip'), 0xfff4d8, 'chylomicrons', [1], 'chylo'],
    [R('pancFoie'), 0x5fa8ff, 'insuline', [1], 'insuline'], [R('pancFoie'), 0xff5fd0, 'glucagon', [2, 3, 4], 'glucagon'],
    [R('foieCoeur', 'versCerveau'), 0xffffff, 'glucose', [2, 4], 'glucose'], [R('foieCoeur', 'versGR'), 0xffffff, 'glucose', [2, 4], 'glucose'],
    [R('adipCoeur', 'coeurAorte', 'aorteBas', 'versMuscle'), 0xf5d020, 'acides gras', [3, 4], 'ag'], [R('adipCoeur', 'coeurAorte', 'versFoieArt'), 0xf5d020, 'acides gras', [3, 4], 'ag'],
    [R('foieCoeur', 'versCerveau'), 0xb070ff, 'corps cétoniques', [3, 4], 'cetone'], [R('foieCoeur', 'coeurAorte', 'aorteBas', 'versMuscle'), 0xb070ff, 'corps cétoniques', [3], 'cetone'],
    [R('museCoeur', 'coeurAorte', 'versFoieArt'), 0x5fd38d, 'alanine', [4], 'alanine'], [R('foieCoeur', 'coeurAorte', 'versRein', 'reinVessie'), 0xd8d8d8, 'urée', [1, 4], 'uree'],
    [R('museCoeur', 'coeurAorte', 'versFoieArt'), 0xff7aa0, 'lactate', [5], 'lactate'], [R('grFoie', 'versFoieArt'), 0xff7aa0, 'lactate', [5], 'lactate'],
  ];
  const fx = F.map(([pts, col, nom, st, k], i) => {
    const c = courbe(pts), L = c.getLength(), n = Math.max(5, Math.round(L / 6));
    const f = flux(S3, c, n, () => k === 'glucose' ? glucoseM() : boule(col, k === 'vldl' || k === 'chylo' ? .75 : .5, k), 4 / L);
    const etq = txt3d(nom, '#' + new THREE.Color(col).getHexString(), 1.2); etq.position.copy(c.getPointAt(.18 + (i % 3) * .06)).add(V3(0, 1.6, 2)); S3.add(etq);
    return { f, etq, st };
  });
  let step = 0; s.onStep = (i) => { step = i; };
  const un = V3(1, 1, 1);
  s.update = function (dt, t) {
    s.controls.update();
    fx.forEach((o) => { const on = o.st.includes(step); o.f.on = on; o.f.maj(t); o.etq.visible = on; });
    const cible = [[1, 1], [1.3, 1.2], [.45, 1], [.3, .8], [.15, .55], [.3, .4]][step];
    gF.scale.lerp(un.clone().multiplyScalar(cible[0]), dt * 2); gM.scale.lerp(un.clone().multiplyScalar(cible[1]), dt * 2);
    adip.scale.lerp(un.clone().multiplyScalar(step === 1 ? 1.08 : step >= 3 ? .85 : 1), dt);
    musc.scale.lerp(un.clone().multiplyScalar(step === 4 ? .85 : 1), dt);
    coeur.scale.setScalar(1 + .04 * Math.max(0, Math.sin(t * 7)));
    hor.set(['Les organes et leurs vaisseaux', 'Insuline ↑ : on stocke', 'Glucagon ↑ : le foie relâche du glucose', 'Lipolyse : AG et corps cétoniques', 'Protéolyse : alanine → glucose', 'Cycle de Cori : lactate → glucose'][step], ['#ffffff', '#7fb8ff', '#ff8fe0', '#f5d020', '#5fd38d', '#ff9ab8'][step]);
  };
  return s;
}

/* =========================================================
   2. L'ENTRÉE DU GLUCOSE : GLUT, insuline, hexokinase
   ========================================================= */
function sceneGlut() {
  const s = micro({ id: 'glut', niv: 'L2', titre: 'La membrane : les GLUT', echelle: 'Bicouche ≈ 5 nm · transporteurs agrandis', bg: 0x0e1420, cam: V3(0, 16, 46), min: 8, max: 120, target: V3(0, 0, 0), vue: [4, 0, 0, 17], vues: [[-4, 0, 0, 14], [-11, 0, 0, 10], [0, 0, 0, 10], [14, -2, 0, 14], [-4, -6, 4, 11], [-4, -6, 4, 11]], sky: 0xe0f0ff, ground: 0x302030,
    steps: [
      ['Diffusion facilitée', "Le glucose entre par <b>diffusion facilitée</b>, selon son gradient (pas d'énergie), grâce aux transporteurs <b>GLUT</b> (en haut : le sang, en bas : la cellule)."],
      ['GLUT-1 et 3', "<b>GLUT-1</b> et <b>GLUT-3</b> (bleu) : <b>forte affinité</b>, ils travaillent <b>en permanence</b>, même quand la glycémie est basse : <b>cerveau</b>, <b>globules rouges</b>."],
      ['GLUT-2', "<b>GLUT-2</b> (vert) : <b>faible affinité</b>, n'est efficace que quand il y a beaucoup de glucose : c'est un <b>senseur</b> (foie, cellules β du pancréas, intestin). Il laisse passer dans les <b>deux sens</b> : le foie relâche du glucose par lui."],
      ['GLUT-4 et insuline', "<b>GLUT-4</b> (orange) : <b>muscle et adipocyte</b>. Il attend dans des <b>vésicules</b>. L'<b>insuline</b> se fixe sur son récepteur → les vésicules fusionnent avec la membrane → le glucose entre. C'est ainsi que l'insuline fait baisser la glycémie."],
      ['Hexokinase', "Dans la cellule, le glucose est tout de suite <b>phosphorylé</b> en <b>glucose-6-phosphate</b> (hexokinase, 1 ATP) : il ne peut plus ressortir, et le glucose libre reste bas, ce qui garde le gradient d'entrée."],
      ['Glucokinase', "<b>Hexokinase</b> : tous les tissus, <b>haute affinité</b>, glucose, fructose, galactose. <b>Glucokinase</b> (hexokinase IV) : <b>foie et cellules β</b>, <b>faible affinité</b>, glucose seulement : ne travaille qu'<b>après un repas</b> (senseur, stockage)."],
    ] });
  const S3 = s.scene; const mb = bicouche(28); S3.add(mb);
  const glut = (col, k, x) => { const g = tag(new THREE.Group(), k); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283, r = 1.9 + (i % 2) * .35; const h = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, 6.6, 8), mat(col, { roughness: .45 })); h.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); h.rotation.set(Math.sin(a) * .18, 0, Math.cos(a) * .18); g.add(h); } g.position.set(x, 0, 0); S3.add(g); return g; };
  const g1 = glut(0x3a8ae0, 'glut1', -11), g2 = glut(0x2fbf6f, 'glut2', 0); lab(s, g1, 'GLUT-1', 5.5); lab(s, g2, 'GLUT-2', 5.5);
  const g4m = glut(0xf08a30, 'glut4', 11); g4m.visible = false; lab(s, g4m, 'GLUT-4', 5.5);
  // vésicules de GLUT-4 sous la membrane
  const ves = []; for (let i = 0; i < 3; i++) { const v = tag(new THREE.Group(), 'glut4'); v.add(new THREE.Mesh(new THREE.SphereGeometry(2.6, 20, 14), new THREE.MeshPhysicalMaterial({ color: 0x9fc8f0, transparent: true, opacity: .3, depthWrite: false }))); const p = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1.6, 10), mat(0xf08a30)); v.add(p); v.userData.p0 = V3(9 + i * 3, -11 - (i % 2) * 3, -3 + i * 3); v.position.copy(v.userData.p0); S3.add(v); ves.push(v); }
  lab(s, ves[0], 'Vésicule de GLUT-4', -3.5);
  const rec = tag(new THREE.Group(), 'recInsuline'); for (const sg of [-1, 1]) { const b = new THREE.Mesh(new THREE.CapsuleGeometry(.6, 6, 4, 8), mat(0x9b59d0)); b.position.set(sg * .9, 0, 0); rec.add(b); const y = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 10), mat(0x9b59d0)); y.position.set(sg * 1.2, 4, 0); rec.add(y); }
  rec.position.set(20, 1, 4); S3.add(rec); lab(s, rec, "Récepteur de l'insuline", 7);
  const ins = tag(new THREE.Mesh(blob(.9, .3, 2, 4), mat(0x5fa8ff, { emissive: 0x103060 })), 'insuline'); S3.add(ins);
  const hk = enzyme('Hexokinase', 0xd06a9a, 1.6, 5); hk.position.set(-4, -9, 6); S3.add(hk);
  // glucoses
  const gls = []; for (let i = 0; i < 26; i++) { const g = glucoseM(); g.userData.ph = Math.random(); g.userData.voie = i % 3; S3.add(g); gls.push(g); }
  const P = []; for (let i = 0; i < 10; i++) { const p = tag(new THREE.Group(), 'g6p'); p.add(glucoseM(0xffe0a0)); const ph = new THREE.Mesh(new THREE.SphereGeometry(.35, 8, 6), mat(0xf5a020, { emissive: 0x603000 })); ph.position.set(.7, .3, 0); p.add(ph); p.visible = false; S3.add(p); P.push(p); }
  const pan = panneau3d(S3, V3(0, 13, 0), 1.6);
  let step = 0, k = 0; s.onStep = (i) => { step = i; k = 0; };
  const xs = [-11, 0, 11];
  s.update = function (dt, t) {
    s.controls.update(); k = Math.min(1, k + dt * .35);
    const g4on = step === 3 && k > .45; g4m.visible = g4on || step > 3;
    ves.forEach((v, i) => { v.visible = !(g4on || step > 3); if (step === 3) v.position.lerpVectors(v.userData.p0, V3(11, -3, 0), Math.min(1, k * 2)); else v.position.copy(v.userData.p0); });
    ins.visible = step === 3; if (ins.visible) ins.position.lerpVectors(V3(26, 14, 6), rec.position.clone().add(V3(0, 5.5, 0)), Math.min(1, k * 2.2));
    gls.forEach((g, i) => {
      const u = (t * .12 + g.userData.ph) % 1; let x = xs[g.userData.voie]; let ok = true;
      if (g.userData.voie === 2 && !g4m.visible) ok = false;          // GLUT-4 absent : le glucose reste dehors
      if (step === 1 && g.userData.voie !== 0) ok = false;
      if (step === 2 && g.userData.voie !== 1) ok = false;
      const sens = step === 2 && i % 2 ? -1 : 1;                       // GLUT-2 : dans les deux sens
      const y = ok ? (sens > 0 ? 12 - u * 26 : -14 + u * 26) : 12 - (u % .5) * 6;
      g.position.set(x + Math.sin(i * 3 + t) * (Math.abs(y) > 4 ? 3 : .5), y, Math.cos(i * 2) * (Math.abs(y) > 4 ? 4 : .5)); g.rotation.x += dt;
      g.visible = !(step >= 4 && y < -6);
    });
    P.forEach((p, i) => { p.visible = step >= 4; const u = (t * .1 + i / 10) % 1; p.position.set(-4 + Math.cos(i * 1.7) * (2 + u * 8), -9 - u * 4, 6 + Math.sin(i * 1.7) * (2 + u * 6)); p.rotation.y += dt; });
    hk.visible = step >= 4; hk.userData.corps.scale.setScalar(1 + .08 * Math.sin(t * 6));
    pan.set(['Diffusion facilitée', 'Toujours ouvert', 'Senseur, dans les 2 sens', g4on ? 'GLUT-4 à la membrane' : 'GLUT-4 en réserve', 'Glucose + ATP → G6P', step === 5 ? 'Glucokinase : après un repas' : ''][step]);
  };
  return s;
}


/* =========================================================
   3. GLYCOLYSE, LACTATE, RÉGULATION, NÉOGLUCOGENÈSE, PENTOSES
   ========================================================= */
function sceneGlyco() {
  const s = micro({ id: 'glyco', niv: 'L3', titre: 'Le cytosol : la glycolyse', echelle: 'Les 10 étapes, du glucose au pyruvate', bg: 0x14100a, fog: .005, cam: V3(4, -2, 78), min: 10, max: 200, target: V3(2, 0, 0), vue: [2, -3, 0, 32], vues: [[0, 16, 0, 15], [0, 0, 0, 20], [0, -24, 0, 17], [0, 14, 2, 13], [2, -3, 0, 32], [10, 20, 0, 15]], sky: 0xfff0d8, ground: 0x2a1a08,
    steps: [
      ['Investissement', "Dans le <b>cytosol</b> de toutes les cellules. On <b>dépense 2 ATP</b> : <b>hexokinase</b> (glucose → glucose-6-P) et <b>phosphofructokinase-1</b> (fructose-6-P → fructose-1,6-bisP), deux étapes <b>irréversibles</b>. Le fructose-1,6-bisP (6 C) est coupé en <b>deux trioses</b> (3 C)."],
      ['Rendement', "Chaque triose donne <b>1 NADH</b> et <b>2 ATP</b> (dernière étape irréversible : <b>pyruvate kinase</b>). Bilan par glucose : <b>2 pyruvates + 2 ATP nets + 2 NADH</b>."],
      ['Pyruvate : carrefour', "Sans O₂ (effort intense, <b>globule rouge</b> sans mitochondries) : la <b>LDH</b> réduit le pyruvate en <b>lactate</b> et régénère le NAD⁺. Avec O₂ : le pyruvate entre dans la <b>mitochondrie</b> → <b>acétyl-CoA</b> (pyruvate déshydrogénase, irréversible) → cycle de Krebs."],
      ['Régulation', "À l'échelle de la cellule (allostérie) : <b>ATP, NADH, citrate</b> freinent (rouge) ; <b>ADP, AMP</b> accélèrent (vert). À l'échelle du corps : le <b>glucagon</b> (AMPc → protéine kinase A) arrête la glycolyse du <b>foie</b> pour garder le glucose au cerveau ; l'<b>insuline</b> la relance."],
      ['Néoglucogenèse', "Après ~18 h de jeûne, le <b>foie</b> (90 %, rein, intestin) refait du glucose à partir du <b>lactate</b>, du <b>glycérol</b> et des <b>AA</b> (alanine). Il contourne les 3 étapes irréversibles avec <b>4 enzymes</b> : pyruvate carboxylase, PEP carboxykinase, fructose-1,6-bisphosphatase, <b>glucose-6-phosphatase</b>."],
      ['Voie des pentoses', "Dérivation au glucose-6-P : elle fabrique le <b>ribose-5-P</b> (nucléotides, ADN, ARN) et le <b>NADPH</b> (synthèse des AG, du cholestérol, des stéroïdes ; <b>glutathion</b> du globule rouge ; détoxification du foie)."],
    ] });
  const S3 = s.scene;
  const noms = ['Glucose', 'Glucose-6-P', 'Fructose-6-P', 'Fructose-1,6-bisP', 'Glycéraldéhyde-3-P', '1,3-Bisphosphoglycérate', '3-Phosphoglycérate', '2-Phosphoglycérate', 'Phosphoénolpyruvate', 'Pyruvate'];
  const P = noms.map((_, i) => V3(i % 2 ? 4 : -4, 26 - i * 5.6, Math.sin(i) * 2));
  const c6 = courbe(P.slice(0, 5)), c3 = courbe(P.slice(3)), cTout = courbe(P);
  S3.add(tube(c6, .3, 0xffffff, .4), tube(c3, .3, 0xf5a040, .4));
  const noeuds = P.map((p, i) => { const m = i < 4 ? glucoseM(i ? 0xffe8b0 : 0xffffff) : boule(0xf5a040, .6); m.scale.setScalar(i < 4 ? 1.7 : 1.2); m.position.copy(p); tag(m, i === 0 ? 'glucose' : i === 1 ? 'g6p' : i === 9 ? 'pyruvate' : 'enzyme'); S3.add(m);
    const tx = txt3d(noms[i], i < 4 ? '#ffffff' : '#f5b060', 1); tx.position.copy(p).add(V3((i % 2 ? 1 : -1) * (2.5 + tx.scale.x / 2), 0, 0)); S3.add(tx); return m; });
  // le 2e triose (DHAP → G3P)
  const dhap = boule(0xf5a040, .6); dhap.scale.setScalar(1.2); dhap.position.copy(P[4]).add(V3(-9, 1, 0)); S3.add(dhap); const tD = txt3d('DHAP', '#f5b060', 1); tD.position.copy(dhap.position).add(V3(-3.5, 0, 0)); S3.add(tD);
  // enzymes irréversibles
  const eHK = enzyme('Hexokinase', 0xd06a9a, 1.3, 1), ePFK = enzyme('PFK-1', 0xd06a9a, 1.5, 2), ePK = enzyme('Pyruvate kinase', 0xd06a9a, 1.3, 3);
  [[eHK, 0], [ePFK, 2], [ePK, 8]].forEach(([e, i]) => { e.position.copy(P[i].clone().lerp(P[i + 1], .5)).add(V3(i % 2 ? -6 : 6, 0, 3)); S3.add(e); });
  const irr = [0, 2, 8].map((i) => { const r = new THREE.Mesh(new THREE.TorusGeometry(1.6, .12, 8, 30), mat(0xff5060, { emissive: 0xff2030, emissiveIntensity: .6 })); r.position.copy(P[i].clone().lerp(P[i + 1], .5)); r.lookAt(P[i + 1]); S3.add(r); return r; });
  // néoglucogenèse : enzymes de contournement
  const neo = [['Glucose-6-phosphatase', 0], ['Fructose-1,6-bisphosphatase', 2], ['PEP carboxykinase', 8]].map(([n, i]) => { const e = enzyme(n, 0x5fd38d, 1.2, i + 7); e.position.copy(P[i].clone().lerp(P[i + 1], .5)).add(V3(i % 2 ? 7 : -7, 0, -3)); S3.add(e); return e; });
  const oaa = boule(0x5fd38d, .7); oaa.position.copy(P[9]).add(V3(9, -3, -2)); S3.add(oaa); const tO = txt3d('Oxaloacétate (pyruvate carboxylase)', '#5fd38d', .9); tO.position.copy(oaa.position).add(V3(0, -2, 0)); S3.add(tO);
  const cNeo = courbe([P[9], oaa.position, P[8].clone().add(V3(6, 0, -2)), ...P.slice(0, 8).reverse().map((p) => p.clone().add(V3(0, 0, -3)))]);
  const tNeo = tube(cNeo, .3, 0x5fd38d, .45); S3.add(tNeo); const fNeo = flux(S3, cNeo, 14, () => boule(0x5fd38d, .45), .07);
  const sources = [['Lactate', V3(-14, -30, 0), P[9]], ['Alanine', V3(14, -34, 0), P[9]], ['Glycérol', V3(-20, 4, 0), dhap.position]].map(([n, a, b]) => { const c = courbe([a, a.clone().lerp(b, .5).add(V3(0, 2, 3)), b]); const g = new THREE.Group(); g.add(tube(c, .2, 0x5fd38d, .4)); const t = txt3d(n, '#5fd38d', 1.1); t.position.copy(a).add(V3(0, -1.5, 0)); g.add(t); g.add(pointe(c, 0x5fd38d)); S3.add(g); return g; });
  const glcSort = txt3d('Glucose → sang (foie)', '#5fd38d', 1.1); glcSort.position.copy(P[0]).add(V3(0, 4, 0)); S3.add(glcSort);
  // lactate et mitochondrie
  const lac = tag(boule(0xff7aa0, .8), 'lactate'); lac.position.set(-16, -30, 2); S3.add(lac); const tL = txt3d('Lactate', '#ff9ab8', 1.1); tL.position.copy(lac.position).add(V3(0, 2, 0)); S3.add(tL);
  const ldh = enzyme('LDH', 0xff7aa0, 1.1, 9); ldh.position.set(-10, -26, 3); S3.add(ldh);
  const mi = mitochondrie(18, 5.5); mi.position.set(16, -30, -2); S3.add(mi); const tM = txt3d('Mitochondrie → acétyl-CoA → Krebs', '#ffb080', 1); tM.position.set(16, -22.5, 0); S3.add(tM);
  const cLac = courbe([P[9], V3(-6, -26, 2), lac.position]), cMit = courbe([P[9], V3(8, -26, 2), V3(14, -30, 0)]);
  const fLac = flux(S3, cLac, 5, () => boule(0xff7aa0, .5), .2), fMit = flux(S3, cMit, 5, () => boule(0xf5a040, .5), .2);
  // pentoses
  const cPen = courbe([P[1], P[1].clone().add(V3(10, 4, 2)), P[1].clone().add(V3(20, 6, 0))]); const tPen = tube(cPen, .3, 0x6ab0ff, .5); S3.add(tPen);
  const fPen = flux(S3, cPen, 6, () => boule(0x6ab0ff, .45), .15);
  const tRib = txt3d('Ribose-5-P + NADPH', '#8ac0ff', 1.2); tRib.position.copy(P[1]).add(V3(20, 8.5, 0)); S3.add(tRib);
  // régulateurs autour de PFK-1
  const regs = [['ATP', 0xff5060], ['Citrate', 0xff5060], ['NADH', 0xff5060], ['AMP', 0x5fd38d], ['ADP', 0x5fd38d]].map(([n, c], i) => { const g = new THREE.Group(); g.add(boule(c, .55)); const t = txt3d(n, '#' + new THREE.Color(c).getHexString(), .9); t.position.y = 1.3; g.add(t); g.userData.a = i / 5 * 6.28; S3.add(g); return g; });
  const hormones = [['Glucagon → AMPc → PKA : glycolyse du foie arrêtée', '#ff8fe0'], ['Insuline : glycolyse relancée', '#7fb8ff']].map(([n, c], i) => { const t = txt3d(n, c, 1.1); t.position.set(0, 34 - i * 2.4, 0); S3.add(t); return t; });
  // jetons qui parcourent la voie
  const f6 = flux(S3, c6, 5, () => glucoseM(), .12), f3 = flux(S3, c3, 10, () => boule(0xf5a040, .45), .12);
  const B = bulles(S3); let step = 0, last = 0;
  s.onStep = (i) => { step = i; B.vider(); };
  s.update = function (dt, t) {
    s.controls.update(); B.maj(t);
    const desc = step !== 4;
    f6.on = desc && step !== 5; f3.on = step === 1 || step === 0 || step === 2 || step === 3; f6.maj(t); f3.maj(t);
    fNeo.on = step === 4; fNeo.maj(t); tNeo.visible = step === 4; neo.forEach((e) => e.visible = step === 4); oaa.visible = tO.visible = glcSort.visible = step === 4; sources.forEach((g) => g.visible = step === 4);
    fLac.on = fMit.on = step === 2; fLac.maj(t); fMit.maj(t); lac.visible = tL.visible = ldh.visible = step === 2 || step === 4;
    mi.visible = tM.visible = step === 2;
    fPen.on = step === 5; fPen.maj(t); tPen.visible = tRib.visible = step === 5;
    regs.forEach((g, i) => { g.visible = step === 3; const a = g.userData.a + t * .5; g.position.copy(ePFK.position).add(V3(Math.cos(a) * 4, Math.sin(a) * 4, 2)); });
    hormones.forEach((h) => h.visible = step === 3);
    irr.forEach((r) => { r.material.emissiveIntensity = .4 + .4 * Math.sin(t * 4); r.visible = step <= 1 || step === 4; });
    // bulles ATP / NADH
    if (t - last > 1.6) { last = t;
      if (step === 0) { B.pop('− ATP', P[0].clone().lerp(P[1], .5).add(V3(-3, 0, 4)), '#ff6070', t); B.pop('− ATP', P[2].clone().lerp(P[3], .5).add(V3(-3, 0, 4)), '#ff6070', t); }
      if (step === 1) { B.pop('+ NADH ×2', P[4].clone().lerp(P[5], .5).add(V3(-4, 0, 4)), '#7fd0ff', t); B.pop('+ ATP ×2', P[5].clone().lerp(P[6], .5).add(V3(4, 0, 4)), '#5fd38d', t); B.pop('+ ATP ×2', P[8].clone().lerp(P[9], .5).add(V3(-4, 0, 4)), '#5fd38d', t); }
      if (step === 2) { B.pop('NADH → NAD⁺', V3(-10, -23, 4), '#7fd0ff', t); B.pop('+ CO₂ + NADH', V3(14, -26, 6), '#ffffff', t); }
      if (step === 5) B.pop('+ NADPH', P[1].clone().add(V3(14, 5, 3)), '#8ac0ff', t);
    }
  };
  return s;
}

/* =========================================================
   3b. LE GLYCOGÈNE
   ========================================================= */
function sceneGlycogene() {
  const s = micro({ id: 'glycogene', niv: 'L3b', titre: 'Un grain de glycogène', echelle: 'Granule ≈ 30 nm · chaque perle = 1 glucose', bg: 0x16120a, fog: .006, cam: V3(0, 6, 56), min: 8, max: 160, auto: true, vue: [0, 0, 0, 14], vues: [null, null, null, [0, -8, 0, 22]], sky: 0xfff4d8, ground: 0x2a2008,
    steps: [
      ['Structure', "Le glycogène est un grand <b>polymère ramifié de glucose</b> : chaînes en <b>α-1→4</b>, avec une <b>branche α-1→6</b> environ tous les <b>15 résidus</b> (perles dorées). Beaucoup de bouts = on ajoute ou on retire vite du glucose. Au centre : la <b>glycogénine</b>."],
      ['Synthèse (repas)', "Après un repas (<b>insuline</b>) : le glucose-6-P devient <b>UDP-glucose</b>, ajouté au bout des chaînes par la <b>glycogène synthase</b> (vert). Le grain grossit. Réserves : <b>foie ~150 g</b>, <b>muscles ~300 g</b>, épuisées en ~24 h."],
      ['Dégradation (jeûne)', "Entre les repas : la <b>glycogène phosphorylase</b> (rouge) détache des glucose-1-P aux bouts. <b>Glucagon</b> (foie) et <b>adrénaline</b> (muscle) → AMPc → protéine kinase A : phosphorylase <b>activée</b>, synthase <b>inhibée</b>. Dans le muscle aussi : <b>AMP</b> et <b>Ca²⁺-calmoduline</b>."],
      ['Foie contre muscle', "Le <b>foie</b> a la <b>glucose-6-phosphatase</b> : il remet du <b>glucose libre dans le sang</b> (pour le cerveau, les GR). Le <b>muscle</b> ne l'a pas : son glucose-6-P reste pour lui (glycolyse, contraction)."],
    ] });
  const S3 = s.scene;
  const perles = [], bouts = [];
  const gP = new THREE.SphereGeometry(.42, 10, 8), mP = mat(0xf2e6b0, { roughness: .45 }), mB = mat(0xf5c040, { emissive: 0x604000, emissiveIntensity: .4 });
  const coeur = tag(new THREE.Mesh(blob(1.6, .2, 3, 2), mat(0x9b59d0)), 'enzyme'); S3.add(coeur); lab(s, coeur, 'Glycogénine', 2.5);
  const rac = new THREE.Group(); S3.add(rac);
  (function pousse(p, dir, gen, n) {
    let q = p.clone(); const d = dir.clone();
    for (let i = 0; i < n; i++) {
      d.add(V3(rnd(-.25, .25), rnd(-.25, .25), rnd(-.25, .25))).normalize(); q = q.clone().addScaledVector(d, .9);
      const m = new THREE.Mesh(gP, mP); m.position.copy(q); tag(m, 'glycogene'); rac.add(m); perles.push(m);
      if (gen < 4 && i > 2 && i % 5 === 3) { const b = new THREE.Mesh(gP, mB); b.position.copy(q); rac.add(b); const nd = d.clone().applyAxisAngle(V3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize(), rnd(.7, 1.3)); pousse(q, nd, gen + 1, n - 2 - gen); }
    }
    bouts.push(q);
  })(V3(0, 0, 0), V3(1, .2, 0), 0, 14);
  for (let k = 0; k < 4; k++) (function pousse(p, dir, gen, n) { let q = p.clone(); const d = dir.clone(); for (let i = 0; i < n; i++) { d.add(V3(rnd(-.25, .25), rnd(-.25, .25), rnd(-.25, .25))).normalize(); q = q.clone().addScaledVector(d, .9); const m = new THREE.Mesh(gP, mP); m.position.copy(q); tag(m, 'glycogene'); rac.add(m); perles.push(m); if (gen < 3 && i > 2 && i % 5 === 3) { const b = new THREE.Mesh(gP, mB); b.position.copy(q); rac.add(b); pousse(q, d.clone().applyAxisAngle(V3(0, 1, 0), 1 + k), gen + 1, n - 3); } } bouts.push(q); })(V3(0, 0, 0), V3(Math.cos(k * 1.6 + 1), Math.sin(k * 2.1), Math.cos(k * 1.1)).normalize(), 0, 13);
  const syn = [], pho = []; for (let i = 0; i < 4; i++) { const a = enzyme(i ? '' : 'Glycogène synthase', 0x5fd38d, .9, i + 3); S3.add(a); syn.push(a); const b = enzyme(i ? '' : 'Phosphorylase', 0xff6070, .9, i + 8); S3.add(b); pho.push(b); }
  const libres = []; for (let i = 0; i < 16; i++) { const g = glucoseM(); S3.add(g); libres.push(g); }
  const g6pase = enzyme('Glucose-6-phosphatase (foie)', 0x5fd38d, 1.2, 4); g6pase.position.set(-16, -12, 0); S3.add(g6pase);
  const tF = txt3d('Foie : glucose → sang', '#5fd38d', 1.3), tMu = txt3d('Muscle : G6P gardé pour lui', '#ff9a70', 1.3); tF.position.set(-16, -17, 0); tMu.position.set(16, -17, 0); S3.add(tF, tMu);
  const mur = new THREE.Mesh(new THREE.PlaneGeometry(.3, 40), mat(0xffffff, { transparent: true, opacity: .2 })); mur.position.set(0, -14, 0); S3.add(mur);
  const hor = panneau3d(S3, V3(0, 18, 0), 1.6);
  let step = 0, k = 0; s.onStep = (i) => { step = i; k = 0; };
  s.update = function (dt, t) {
    s.controls.update(); k = Math.min(1, k + dt * .25);
    const sc = step === 1 ? .8 + k * .3 : step === 2 ? 1.1 - k * .35 : 1; rac.scale.setScalar(sc);
    syn.forEach((e, i) => { e.visible = step === 1; const b = bouts[(i * 5) % bouts.length]; e.position.copy(b).multiplyScalar(sc).add(V3(0, 1.4, 0)); });
    pho.forEach((e, i) => { e.visible = step === 2; const b = bouts[(i * 5 + 2) % bouts.length]; e.position.copy(b).multiplyScalar(sc).add(V3(0, 1.4, 0)); });
    libres.forEach((g, i) => { const u = (t * .25 + i / 16) % 1, b = bouts[i % bouts.length].clone().multiplyScalar(sc);
      if (step === 1) { g.visible = true; g.position.copy(b).multiplyScalar(1 + (1 - u) * 1.2); }
      else if (step === 2) { g.visible = true; g.position.copy(b).multiplyScalar(1 + u * 1.4); }
      else if (step === 3) { g.visible = true; const side = i % 2 ? -1 : 1; g.position.set(side * (6 + u * 14), -8 - u * 10, Math.sin(i) * 3); if (side > 0) g.position.set(6 + Math.sin(t + i) * 3, -10 + Math.cos(t * .7 + i) * 2, Math.sin(i) * 3); }
      else g.visible = false; g.rotation.x += dt; });
    g6pase.visible = tF.visible = tMu.visible = mur.visible = step === 3;
    hor.set(['α-1→4 et branches α-1→6', 'Insuline : synthase active', 'Glucagon, adrénaline : phosphorylase active', ''][step], ['#f5c451', '#5fd38d', '#ff8090', '#ffffff'][step]);
  };
  return s;
}

/* =========================================================
   3c. LE CYCLE DE KREBS (dans la mitochondrie)
   ========================================================= */
function sceneKrebs() {
  const s = micro({ id: 'krebs', niv: 'L3c', titre: 'La mitochondrie : le cycle de Krebs', echelle: 'Mitochondrie ≈ 2 µm · on regarde la matrice', bg: 0x1c0c06, fog: .006, cam: V3(0, 4, 64), min: 10, max: 180, target: V3(0, -2, 0), vue: [-2, 0, 0, 24], vues: [[-10, 14, 0, 13], [0, -4, 0, 17], [0, -10, 0, 19], [0, 0, 0, 30]], sky: 0xffe8d0, ground: 0x2a1006,
    steps: [
      ['Pyruvate → acétyl-CoA', "Le pyruvate entre dans la <b>mitochondrie</b>. La <b>pyruvate déshydrogénase</b> (irréversible) le transforme en <b>acétyl-CoA</b> (2 C) : on perd 1 <b>CO₂</b> et on fait 1 <b>NADH</b>. Irréversible : un acétyl-CoA ne pourra jamais redonner du glucose."],
      ['Le cycle', "L'acétyl-CoA (2 C) s'accroche à l'<b>oxaloacétate</b> (4 C) → <b>citrate</b> (6 C). Le cycle perd 2 <b>CO₂</b> et retombe sur l'oxaloacétate, prêt pour un nouveau tour. Chaque tour : <b>3 NADH, 1 FADH₂, 1 GTP</b>."],
      ['Bilan', "Par <b>glucose</b> (2 pyruvates) : <b>6 CO₂</b>, <b>4 ATP</b> (2 glycolyse + 2 GTP), <b>2 FADH₂</b> et <b>10 NADH</b>. Les NADH et FADH₂ vont être réoxydés par la <b>chaîne respiratoire</b> : c'est là que sort la grande majorité de l'ATP."],
      ['Carrefour acétyl-CoA', "L'<b>acétyl-CoA</b> est le carrefour : il vient du <b>glucose</b>, des <b>acides gras</b> (β-oxydation) et des <b>acides aminés</b>. Il part dans <b>Krebs</b>, ou sert à fabriquer les <b>AG</b>, le <b>cholestérol</b> et les <b>corps cétoniques</b>. Le réflexe du prof : question de molécule → pense acétyl-CoA."],
    ] });
  const S3 = s.scene;
  const mi = mitochondrie(56, 22, { prof: .32 }); mi.position.set(0, -2, -3); S3.add(mi);
  const noms = ['Citrate', 'Isocitrate', 'α-Cétoglutarate', 'Succinyl-CoA', 'Succinate', 'Fumarate', 'Malate', 'Oxaloacétate'];
  const R0 = 11, cen = V3(0, -4, 0); const P = noms.map((_, i) => { const a = Math.PI / 2 - i / 8 * 6.283 - .39; return cen.clone().add(V3(Math.cos(a) * R0, Math.sin(a) * R0, 0)); });
  const cyc = courbe(P, true); S3.add(tube(cyc, .35, 0xffb060, .5));
  P.forEach((p, i) => { const m = boule([0xffd080, 0xffc070, 0xffb060, 0xffa050, 0xff9a50, 0xff9060, 0xff8a70, 0x5fd38d][i], .9); m.position.copy(p); tag(m, 'enzyme'); S3.add(m);
    const t = txt3d(noms[i], '#ffd8a0', .9); const o = p.clone().sub(cen).normalize(); t.position.copy(p).addScaledVector(o, 2.2).add(V3(o.x * t.scale.x / 2, o.y * 1.2, 0)); S3.add(t); });
  const pyr = boule(0xf5a040, .8, 'pyruvate'); pyr.position.set(-22, 18, 0); S3.add(pyr); const tPy = txt3d('Pyruvate (du cytosol)', '#f5b060', 1); tPy.position.set(-22, 20.5, 0); S3.add(tPy);
  const pdh = enzyme('Pyruvate déshydrogénase', 0xd06a9a, 1.8, 4); pdh.position.set(-12, 15, 2); S3.add(pdh);
  const acoa = boule(0x5fd4e6, .9, 'acetylcoa'); acoa.position.set(-2, 12, 2); S3.add(acoa); const tA = txt3d('Acétyl-CoA', '#7fe0f0', 1.2); tA.position.set(-2, 14.4, 2); S3.add(tA);
  const cEnt = courbe([pyr.position, pdh.position, acoa.position, P[7].clone().lerp(P[0], .5)]); S3.add(tube(cEnt, .3, 0x5fd4e6, .45)); const fE = flux(S3, cEnt, 5, () => boule(0x5fd4e6, .45), .18);
  const fC = flux(S3, cyc, 8, () => boule(0xffe0a0, .5), .08);
  // carrefour : sources et destinations
  const car = [['Glucose', V3(-28, 4, 0), 1], ['Acides gras (β-oxydation)', V3(-26, -16, 0), 1], ['Acides aminés', V3(-14, -24, 0), 1], ['Acides gras (synthèse)', V3(24, 16, 0), -1], ['Cholestérol', V3(28, 2, 0), -1], ['Corps cétoniques', V3(24, -14, 0), -1]]
    .map(([n, p, sens]) => { const c = sens > 0 ? courbe([p, p.clone().lerp(acoa.position, .5).add(V3(0, 3, 4)), acoa.position]) : courbe([acoa.position, acoa.position.clone().lerp(p, .5).add(V3(0, 3, 4)), p]);
      const g = new THREE.Group(); const col = sens > 0 ? 0x5fd4e6 : 0xf5c451; g.add(tube(c, .22, col, .45)); g.add(pointe(c, col)); const t = txt3d(n, sens > 0 ? '#7fe0f0' : '#f5c451', 1.1); t.position.copy(p).add(V3(0, 1.6, 0)); g.add(t); S3.add(g); return { g, f: flux(S3, c, 4, () => boule(col, .4), .2) }; });
  const bil = ['6 CO₂', '4 ATP', '2 FADH₂', '10 NADH'].map((n, i) => { const t = txt3d(n, ['#ffffff', '#5fd38d', '#ffd060', '#7fd0ff'][i], 2); t.position.set(-12 + i * 8, -22, 4); S3.add(t); return t; });
  const B = bulles(S3); let step = 0, last = 0;
  s.onStep = (i) => { step = i; B.vider(); };
  s.update = function (dt, t) {
    s.controls.update(); B.maj(t);
    fE.on = step === 0 || step === 1; fE.maj(t); fC.on = step >= 1 && step <= 2; fC.maj(t);
    car.forEach((o) => { o.g.visible = step === 3; o.f.on = step === 3; o.f.maj(t); });
    bil.forEach((b) => b.visible = step === 2);
    pdh.userData.corps.scale.setScalar(1 + .07 * Math.sin(t * 5));
    if (t - last > 1.4) { last = t;
      if (step === 0) { B.pop('+ CO₂', pdh.position.clone().add(V3(0, 3, 2)), '#ffffff', t); B.pop('+ NADH', pdh.position.clone().add(V3(3, 1, 2)), '#7fd0ff', t); }
      if (step === 1 || step === 2) { const o = (i) => P[i].clone().add(P[i].clone().sub(cen).normalize().multiplyScalar(2)).add(V3(0, 0, 2));
        B.pop('NADH', o(1), '#7fd0ff', t); B.pop('CO₂', o(2), '#ffffff', t); B.pop('NADH', o(2).add(V3(0, -1.5, 0)), '#7fd0ff', t); B.pop('CO₂', o(3), '#ffffff', t); B.pop('GTP', o(4), '#5fd38d', t); B.pop('FADH₂', o(5), '#ffd060', t); B.pop('NADH', o(6), '#7fd0ff', t); }
    }
  };
  return s;
}


/* =========================================================
   4. LES LIPIDES
   ========================================================= */
function chaineAG(n, col = 0xf5d020) {
  const g = tag(new THREE.Group(), 'ag'); const gm = new THREE.SphereGeometry(.5, 10, 8), m = mat(col, { roughness: .4 }), mC = mat(0x5fd4e6, { emissive: 0x1a5060 });
  const tete = new THREE.Mesh(new THREE.SphereGeometry(.8, 12, 10), mC); g.add(tete); g.userData.billes = [];
  for (let i = 0; i < 16; i++) { const b = new THREE.Mesh(gm, m); b.position.set(-1.2 - i * .85, Math.sin(i * 1.2) * .3, 0); g.add(b); g.userData.billes.push(b); }
  g.userData.n = n; g.userData.set = (k) => { g.userData.n = k; g.userData.billes.forEach((b, i) => b.visible = i < k); }; g.userData.set(n); return g;
}
function sceneLipides() {
  const s = micro({ id: 'lipides', niv: 'L4', titre: 'Les lipides : β-oxydation et synthèses', echelle: 'Mitochondrie (gauche) · cytosol (droite) · gouttelette (haut)', bg: 0x1a1206, fog: .005, cam: V3(0, 2, 82), min: 10, max: 200, target: V3(0, 0, 0), vue: [0, 4, 0, 28], vues: [[6, 0, 2, 19], [-14, -12, 0, 14], [4, -10, 0, 22], [17, 8, 2, 16], [-2, 14, 0, 20], [12, 4, 2, 14]], sky: 0xfff0d0, ground: 0x2a1a06,
    steps: [
      ['Activation', "L'acide gras (16 C, palmitate) est d'abord <b>activé</b> en <b>acyl-CoA</b> dans le cytosol (coût <b>2 ATP</b>), puis entre dans la <b>mitochondrie</b> grâce à la <b>carnitine</b> (navette)."],
      ['β-oxydation', "Dans la mitochondrie, la chaîne est <b>coupée par blocs de 2 C</b> : chaque tour libère <b>1 acétyl-CoA + 1 FADH₂ + 1 NADH</b> (≈ 17 ATP avec Krebs, valeur du cours). Palmitate C16 ≈ <b>129 ATP</b>. La voie la plus rentable, mais lente. Jamais dans le globule rouge."],
      ['Corps cétoniques', "En <b>jeûne</b>, le foie fait trop d'acétyl-CoA pour Krebs : il fabrique des <b>corps cétoniques</b> (<b>acétoacétate</b>, <b>β-hydroxybutyrate</b>, acétone), envoyés aux <b>muscles</b>, au <b>cœur</b>, puis au <b>cerveau</b>. Ce sont des <b>acides</b> : en excès (diabète, jeûne, alcool) → acidocétose."],
      ['Synthèse des AG', "Après un repas, dans le <b>cytosol</b> du foie : l'acétyl-CoA sort de la mitochondrie en <b>citrate</b>. L'<b>acétyl-CoA carboxylase</b> (enzyme-clé) fait du <b>malonyl-CoA</b> ; la chaîne grandit de 2 C en 2 C jusqu'au <b>palmitate</b> (C16), avec du <b>NADPH</b>. Activée par le citrate et l'insuline ; inhibée par l'AMP, l'adrénaline, le glucagon."],
      ['Triglycérides', "<b>Glycérol-3-P</b> (issu de la glycolyse : il faut du glucose pour stocker les graisses) + <b>3 AG</b> → <b>TG</b> stockés (≈ 12 % du poids). <b>Lipolyse</b> par la <b>lipase hormono-sensible</b> : activée par adrénaline et glucagon (AMPc), inhibée par l'insuline."],
      ['Cholestérol', "<b>3 acétyl-CoA → HMG-CoA</b> → <b>HMG-CoA réductase</b> (enzyme-clé, NADPH ; cible des <b>statines</b>) → mévalonate → isoprènes → squalène → <b>cholestérol</b> (27 C). Rétro-inhibée par le cholestérol ; insuline ↑, glucagon ↓. 90 % vient du foie."],
    ] });
  const S3 = s.scene;
  const mi = mitochondrie(30, 11); mi.position.set(-16, -10, -4); S3.add(mi); const tMi = txt3d('Mitochondrie', '#ffb080', 1.2); tMi.position.set(-16, 3.5, 0); S3.add(tMi);
  const gout = tag(new THREE.Mesh(new THREE.SphereGeometry(7, 30, 20), new THREE.MeshPhysicalMaterial({ color: 0xf2c84a, roughness: .2, clearcoat: 1, transparent: true, opacity: .75 })), 'gouttelette'); gout.position.set(-18, 20, -4); S3.add(gout);
  const tG = txt3d('Gouttelette de TG', '#f5d060', 1.2); tG.position.set(-18, 29, 0); S3.add(tG);
  const tC = txt3d('Cytosol', '#ffe0b0', 1.2); tC.position.set(18, 22, 0); S3.add(tC);
  // AG qui entre (activation + carnitine)
  const ag = chaineAG(16); S3.add(ag); const carn = tag(new THREE.Mesh(new THREE.TorusGeometry(1.6, .5, 10, 20), mat(0x9b59d0, { emissive: 0x2a1040 })), 'carnitine'); carn.position.set(-4, -2, 4); carn.rotation.y = Math.PI / 2; S3.add(carn); lab(s, carn, 'Carnitine', 2.6);
  // β-oxydation
  const agM = chaineAG(16); agM.position.set(-8, -12, 2); S3.add(agM);
  const acs = []; for (let i = 0; i < 8; i++) { const a = boule(0x5fd4e6, .6, 'acetylcoa'); a.visible = false; S3.add(a); acs.push(a); }
  // corps cétoniques
  const cet = []; for (let i = 0; i < 12; i++) { const b = boule(0xb070ff, .55, 'cetone'); S3.add(b); cet.push(b); }
  const tCet = ['Acétoacétate', 'β-Hydroxybutyrate', 'Acétone'].map((n, i) => { const t = txt3d(n, '#c090ff', 1); t.position.set(10, -6 - i * 2.2, 2); S3.add(t); return t; });
  const sortieC = courbe([V3(-10, -8, 2), V3(4, -10, 4), V3(30, -14, 0)]); const fCet = flux(S3, sortieC, 8, () => boule(0xb070ff, .5, 'cetone'), .15); const tub = tube(sortieC, .2, 0xb070ff, .4); S3.add(tub);
  const tDest = txt3d('→ muscles, cœur, cerveau', '#c090ff', 1.1); tDest.position.set(28, -11, 0); S3.add(tDest);
  // synthèse des AG (cytosol)
  const agS = chaineAG(2); agS.position.set(26, 8, 2); agS.rotation.z = Math.PI; S3.add(agS);
  const acc = enzyme('Acétyl-CoA carboxylase', 0xd06a9a, 1.5, 3); acc.position.set(12, 12, 4); S3.add(acc);
  const citr = courbe([V3(-6, -4, 2), V3(4, 6, 4), acc.position]); const fCit = flux(S3, citr, 5, () => boule(0xffb060, .5), .2); const tubC = tube(citr, .2, 0xffb060, .4); S3.add(tubC);
  const tCit = txt3d('Citrate → acétyl-CoA → malonyl-CoA', '#ffc080', 1); tCit.position.set(6, 17, 4); S3.add(tCit);
  // TG
  const tgs = []; for (let i = 0; i < 3; i++) { const c = chaineAG(16); c.scale.setScalar(.5); S3.add(c); tgs.push(c); }
  const glyc = tag(boule(0x7fd0ff, .9), 'tg'); S3.add(glyc); const tGly = txt3d('Glycérol-3-P (de la glycolyse)', '#8ad0ff', 1); S3.add(tGly);
  const lip = enzyme('Lipase hormono-sensible', 0xff7050, 1.4, 6); lip.position.set(-6, 24, 4); S3.add(lip);
  // cholestérol
  const chol = tag(new THREE.Group(), 'cholesterol'); { const hx = (x, y) => { const m = new THREE.Mesh(new THREE.TorusGeometry(1.1, .22, 6, 6), mat(0xf2f2e0, { emissive: 0x303020 })); m.position.set(x, y, 0); m.rotation.z = Math.PI / 6; chol.add(m); };
    hx(0, 0); hx(1.9, 1.1); hx(1.9, -1.1); hx(3.8, 0); const q = new THREE.Mesh(new THREE.TorusGeometry(.9, .22, 6, 5), mat(0xf2f2e0)); q.position.set(5.5, .5, 0); chol.add(q);
    const tail = new THREE.Mesh(new THREE.TubeGeometry(courbe([[6.3, 1, 0], [8, 2, 0], [9, 1.2, 0], [10.4, 2, 0]]), 20, .2, 5), mat(0xf2f2e0)); chol.add(tail); }
  chol.position.set(18, -2, 2); S3.add(chol); const tCh = txt3d('Cholestérol (27 C)', '#f2f2e0', 1.2); tCh.position.set(22, 2, 2); S3.add(tCh);
  const hmg = enzyme('HMG-CoA réductase', 0xd06a9a, 1.5, 7); hmg.position.set(10, 8, 4); S3.add(hmg);
  const statine = txt3d('Statines : bloquent ici', '#ff6070', 1); statine.position.set(10, 12.6, 4); S3.add(statine);
  const cChol = courbe([V3(-2, 6, 4), hmg.position, V3(14, 4, 3), V3(18, 0, 2)]); const fChol = flux(S3, cChol, 6, () => boule(0x5fd4e6, .45, 'acetylcoa'), .14); const tubCh = tube(cChol, .2, 0xf2f2e0, .35); S3.add(tubCh);
  const etapesChol = ['3 acétyl-CoA', 'HMG-CoA', 'Mévalonate', 'Squalène'].map((n, i) => { const t = txt3d(n, '#e0e0d0', .85); t.position.copy(cChol.getPointAt(i / 3.4)).add(V3(0, -1.8, 0)); S3.add(t); return t; });
  const B = bulles(S3); let step = 0, k = 0, last = 0, nB = 16, tS = 2;
  s.onStep = (i) => { step = i; k = 0; B.vider(); nB = 16; tS = 2; };
  const vis = (arr, v) => arr.forEach((o) => o.visible = v);
  s.update = function (dt, t) {
    s.controls.update(); B.maj(t); k = Math.min(1, k + dt * .3);
    ag.visible = carn.visible = step === 0;
    if (step === 0) { const u = (t * .15) % 1; ag.position.lerpVectors(V3(24, 6, 2), V3(-12, -6, 2), u); carn.rotation.x += dt * 2; }
    agM.visible = step === 1 || step === 2;
    acs.forEach((a) => a.visible = false);
    if (step === 1 && t - last > 1.3) { last = t; nB -= 2; if (nB < 2) nB = 16; agM.userData.set(nB);
      B.pop('+ acétyl-CoA', agM.position.clone().add(V3(-1.2 - nB * .85, 2, 2)), '#7fe0f0', t); B.pop('+ FADH₂', agM.position.clone().add(V3(-nB * .85, -2, 2)), '#ffd060', t, 1, 1.4); B.pop('+ NADH', agM.position.clone().add(V3(-nB * .85 + 3, 0, 2)), '#7fd0ff', t, 1, 1.8); }
    if (step === 1) acs.forEach((a, i) => { a.visible = i < (16 - nB) / 2; a.position.set(-14 + Math.cos(t + i) * 4, -16 + Math.sin(t * .8 + i) * 3, 3 + Math.sin(i) * 2); });
    fCet.on = step === 2; fCet.maj(t); tub.visible = tDest.visible = step === 2; vis(tCet, step === 2); cet.forEach((c, i) => { c.visible = step === 2; c.position.set(-14 + Math.cos(t * .7 + i) * 6, -10 + Math.sin(t + i * 2) * 4, 2 + Math.sin(i) * 3); });
    agS.visible = acc.visible = tubC.visible = tCit.visible = step === 3; fCit.on = step === 3; fCit.maj(t);
    if (step === 3 && t - last > 1.3) { last = t; tS += 2; if (tS > 16) tS = 2; agS.userData.set(tS); B.pop('+ 2 C (malonyl-CoA)', agS.position.clone().add(V3(tS * .85, 2, 2)), '#ffc080', t); B.pop('NADPH', agS.position.clone().add(V3(tS * .85, -1, 2)), '#8ac0ff', t, 1, 1.4); }
    tgs.forEach((c, i) => { c.visible = step === 4; const u = Math.min(1, k * 1.5); c.position.lerpVectors(V3(20, 10 - i * 4, 2), V3(-12 + 0, 18 + (i - 1) * 1.6, 2), (Math.sin(t * .6) + 1) / 2 * u); });
    glyc.visible = tGly.visible = lip.visible = step === 4; if (step === 4) { glyc.position.set(-11, 18 + Math.sin(t) * .3, 2); tGly.position.set(-2, 15, 4); }
    chol.visible = tCh.visible = hmg.visible = statine.visible = tubCh.visible = step === 5; vis(etapesChol, step === 5); fChol.on = step === 5; fChol.maj(t); chol.rotation.y = Math.sin(t * .5) * .5;
  };
  return s;
}

/* =========================================================
   5. ACIDES AMINÉS ET CYCLE DE L'URÉE
   ========================================================= */
function sceneUree() {
  const s = micro({ id: 'uree', niv: 'L5', titre: "Acides aminés et cycle de l'urée", echelle: 'Hépatocyte : mitochondrie (gauche) et cytosol (droite)', bg: 0x0e140c, fog: .005, cam: V3(0, 0, 78), min: 10, max: 200, target: V3(0, -2, 0), vue: [4, 0, 0, 24], vues: [[24, 0, 2, 12], [2, 0, 0, 22], [0, 1, 0, 19], [20, -10, 0, 17], [0, 4, 4, 18]], sky: 0xe8ffe0, ground: 0x102010,
    steps: [
      ['Transamination', "Le groupe aminé (NH₂, bleu) d'un <b>acide aminé</b> passe sur l'<b>α-cétoglutarate</b>, qui devient <b>glutamate</b> ; l'AA devient un <b>α-cétoacide</b>. Enzymes : <b>transaminases</b>, avec la <b>vitamine B6</b>. <b>ALAT</b> (cytoplasmique) et <b>ASAT</b> (surtout mitochondriale) : marqueurs du foie."],
      ['Transport du NH₃', "Le <b>NH₃</b> est très toxique. Les tissus l'envoient au foie en <b>glutamine</b> (AA le plus abondant du plasma) ; le <b>muscle</b> envoie de l'<b>alanine</b> (ses carbones refont du glucose). Dans la mitochondrie, la <b>glutamate déshydrogénase</b> libère le NH₃."],
      ["Cycle de l'urée", "Uniquement dans le <b>foie</b>. Mitochondrie : NH₃ + CO₂ → <b>carbamoyl-phosphate</b> ; + <b>ornithine</b> → <b>citrulline</b>. Cytosol : + <b>aspartate</b> → argininosuccinate → <b>fumarate</b> + <b>arginine</b> → <b>urée</b> + ornithine (qui recommence). Coût : <b>3 ATP</b> par urée."],
      ['Vers le rein', "L'<b>urée</b> passe dans le sang et est éliminée par le <b>rein</b>. Un <b>régime hyperprotéiné</b> suractive le cycle : beaucoup d'urée à éliminer, surcharge rénale. Pas de réserve d'AA : seules les protéines (muscle) sont mobilisées en jeûne."],
      ['Amines biogènes', "La <b>décarboxylation</b> d'AA donne des amines actives, dégradées par les <b>MAO</b> : <b>GABA</b> (glutamate), <b>histamine</b> (histidine), <b>dopamine</b> (L-DOPA) → noradrénaline → adrénaline, <b>sérotonine</b> (5-hydroxytryptophane) → mélatonine."],
    ] });
  const S3 = s.scene;
  const mi = mitochondrie(18, 9); mi.position.set(-22, -2, -8); mi.rotation.set(.45, 0, Math.PI / 2, 'ZXY'); S3.add(mi); const tM = txt3d('Mitochondrie', '#ffb080', 1.2); tM.position.set(-18, 24, 0); S3.add(tM);
  const tCy = txt3d('Cytosol', '#d0ffd0', 1.2); tCy.position.set(18, 24, 0); S3.add(tCy);
  // transamination
  const aa = tag(boule(0xe0e0e0, 1), 'aa'), akg = tag(boule(0xffb060, 1), 'akg'), nh2 = boule(0x4f8fd6, .5); S3.add(aa, akg, nh2);
  const tAA = txt3d('Acide aminé → α-cétoacide', '#ffffff', 1), tAK = txt3d('α-Cétoglutarate → glutamate', '#ffc080', 1); S3.add(tAA, tAK);
  const tr = enzyme('Transaminase + B6', 0xd06a9a, 1.4, 2); tr.position.set(14, 0, 2); S3.add(tr);
  // transport
  const arrive = [['Glutamine (tissus)', 0x5fd38d, V3(24, 14, 0)], ['Alanine (muscle)', 0x9be07a, V3(24, -12, 0)]].map(([n, c, p]) => { const cv = courbe([p, p.clone().lerp(V3(-14, 0, 0), .5).add(V3(0, 0, 6)), V3(-14, 0, 2)]); const g = new THREE.Group(); g.add(tube(cv, .22, c, .4)); const t = txt3d(n, '#' + new THREE.Color(c).getHexString(), 1.1); t.position.copy(p).add(V3(-2, 2, 0)); g.add(t); S3.add(g); return { g, f: flux(S3, cv, 5, () => boule(c, .5, n.startsWith('Glut') ? 'glutamine' : 'alanine'), .15) }; });
  const nh3 = []; for (let i = 0; i < 8; i++) { const t = txt3d('NH₃', '#ff7080', .9); S3.add(t); nh3.push(t); }
  // cycle de l'urée : à cheval sur la membrane mitochondriale
  const noms = ['Carbamoyl-P', 'Citrulline', 'Argininosuccinate', 'Arginine', 'Ornithine'];
  const P = [V3(-14, 8, 0), V3(-4, 12, 0), V3(10, 8, 0), V3(12, -6, 0), V3(-4, -10, 0)];
  const cyc = courbe([P[1], P[2], P[3], P[4]], false), cycFerm = courbe([P[4], V3(-12, -4, 0), P[1]]);
  const grpC = new THREE.Group(); S3.add(grpC); grpC.add(tube(cyc, .32, 0x5fd38d, .5), tube(cycFerm, .32, 0x5fd38d, .5));
  P.forEach((p, i) => { const b = boule([0xffa060, 0xb0e080, 0x80d0a0, 0x60c0c0, 0x9b8ae0][i], .9, i === 4 ? 'ornithine' : 'enzyme'); b.position.copy(p); grpC.add(b); const t = txt3d(noms[i], '#d0ffd0', 1); t.position.copy(p).add(V3(0, 2, 0)); grpC.add(t); });
  const cEnt = courbe([V3(-26, 14, 0), P[0], P[1]]); grpC.add(tube(cEnt, .25, 0xff7080, .45)); const tEnt = txt3d('NH₃ + CO₂ (2 ATP)', '#ff8090', 1); tEnt.position.set(-26, 16.5, 0); grpC.add(tEnt);
  const asp = txt3d('+ Aspartate (1 ATP)', '#a0e0ff', 1); asp.position.set(14, 12.5, 0); grpC.add(asp);
  const fum = txt3d('→ Fumarate', '#ffc080', 1); fum.position.set(18, 3, 0); grpC.add(fum);
  const ur = tag(new THREE.Group(), 'uree'); { const c = new THREE.Mesh(new THREE.SphereGeometry(.8, 14, 10), mat(0x404040)); ur.add(c); for (const [x, y, col] of [[0, 1.2, 0xff4040], [-1.1, -.6, 0x4f8fd6], [1.1, -.6, 0x4f8fd6]]) { const a = new THREE.Mesh(new THREE.SphereGeometry(.6, 12, 8), mat(col)); a.position.set(x, y, 0); ur.add(a); } }
  S3.add(ur); const tU = txt3d('Urée', '#ffffff', 1.3); S3.add(tU);
  const fCyc = flux(S3, cyc, 6, () => boule(0xd0ffd0, .45), .12), fCyc2 = flux(S3, cycFerm, 3, () => boule(0x9b8ae0, .45), .2), fEnt = flux(S3, cEnt, 4, () => boule(0xff7080, .45), .2);
  const rein = tag(new THREE.Mesh(blob(5, .1, 3, 8), mat(0x9a3a3a)), 'rein'); rein.scale.set(.8, 1.3, .8); rein.position.set(34, -14, 0); S3.add(rein); lab(s, rein, 'Rein', -8);
  const cRein = courbe([V3(12, -12, 2), V3(24, -18, 4), rein.position]); const tubR = tube(cRein, .2, 0xffffff, .4); S3.add(tubR); const fR = flux(S3, cRein, 6, () => boule(0xe0e0e0, .5, 'uree'), .15);
  const amines = [['Glutamate → GABA', '#7fe0f0'], ['Histidine → histamine', '#ff9ab8'], ['L-DOPA → dopamine → noradrénaline → adrénaline', '#f5c451'], ['5-HTP → sérotonine → mélatonine', '#b090ff'], ['Dégradées par les MAO', '#ff7080']].map(([n, c], i) => { const t = txt3d(n, c, 1.4); t.position.set(0, 14 - i * 5, 4); S3.add(t); return t; });
  let step = 0, k = 0; s.onStep = (i) => { step = i; k = 0; };
  s.update = function (dt, t) {
    s.controls.update(); k = Math.min(1, k + dt * .3);
    const u = (t * .25) % 1, tA = step === 0;
    aa.visible = akg.visible = nh2.visible = tAA.visible = tAK.visible = tr.visible = tA;
    if (tA) { aa.position.set(26, 6, 2); akg.position.set(26, -6, 2); tAA.position.set(26, 9, 2); tAK.position.set(26, -9.5, 2); nh2.position.lerpVectors(V3(26, 6, 3.4), V3(26, -6, 3.4), u < .5 ? u * 2 : 1); akg.material.color.set(u > .5 ? 0xf5c451 : 0xffb060); }
    arrive.forEach((o) => { o.g.visible = step === 1; o.f.on = step === 1; o.f.maj(t); });
    nh3.forEach((n, i) => { n.visible = step === 1; n.position.set(-14 + Math.cos(t + i) * 4, Math.sin(t * .8 + i * 2) * 5, 4); });
    grpC.visible = step === 2; fCyc.on = fCyc2.on = fEnt.on = step === 2; fCyc.maj(t); fCyc2.maj(t); fEnt.maj(t);
    ur.visible = tU.visible = step === 2 || step === 3; if (step === 2) { ur.position.lerpVectors(P[3], V3(20, -14, 2), u); tU.position.copy(ur.position).add(V3(0, 2.4, 0)); } else if (step === 3) { ur.position.set(12, -12, 2); tU.position.set(12, -9.2, 2); } ur.rotation.y += dt;
    rein.visible = tubR.visible = step === 3; fR.on = step === 3; fR.maj(t);
    mi.visible = tM.visible = step !== 4; amines.forEach((a) => a.visible = step === 4);
  };
  return s;
}

/* =========================================================
   6. LA CHAÎNE RESPIRATOIRE ET L'ATP SYNTHASE
   ========================================================= */
function sceneChaine() {
  const s = micro({ id: 'chaine', niv: 'L6', titre: 'La membrane interne de la mitochondrie', echelle: 'Bicouche ≈ 5 nm · en haut : espace intermembranaire, en bas : matrice', bg: 0x180a06, fog: .006, cam: V3(0, 6, 60), min: 8, max: 160, target: V3(0, 0, 0), vue: [2, 0, 0, 22], vues: [[-12, -4, 0, 12], [-2, 0, 0, 18], [-2, 4, 0, 18], [16, -2, 0, 12], [8, 2, 0, 14]], sky: 0xffe8d8, ground: 0x2a0e06,
    steps: [
      ['NADH et FADH₂', "Les <b>NADH</b> et <b>FADH₂</b> de Krebs et de la β-oxydation (dans la matrice, en bas) apportent leurs <b>électrons</b> : le NADH au <b>complexe I</b>, le FADH₂ au <b>complexe II</b>."],
      ['Les complexes', "Les électrons (étincelles jaunes) passent : <b>I</b> (NADH-ubiquinone réductase) ou <b>II</b> (succinate-ubiquinone réductase) → <b>coenzyme Q</b> → <b>III</b> (ubiquinone-cytochrome c réductase) → <b>cytochrome c</b> → <b>IV</b> (cytochrome oxydase) → <b>O₂ → H₂O</b>. L'O₂ est l'accepteur final."],
      ['Gradient de protons', "En passant, <b>I, III et IV</b> pompent des <b>protons H⁺</b> vers l'espace intermembranaire (en haut). Il s'y accumule : c'est un <b>gradient</b>, comme l'eau derrière un barrage. Le complexe II ne pompe pas."],
      ['ATP synthase', "Les H⁺ redescendent par l'<b>ATP synthase</b> (complexe V) et la font <b>tourner</b> comme une turbine : elle fabrique l'<b>ATP</b> à partir d'ADP + Pi. C'est la <b>phosphorylation oxydative</b>."],
      ['Poisons', "Le <b>CO</b> (combustion incomplète, inodore), l'<b>H₂S</b> et les <b>cyanures</b> (HCN, KCN : incendies de plastiques) bloquent le fer du <b>complexe IV</b> : les électrons s'arrêtent, plus de gradient, <b>plus d'ATP</b> → mort cellulaire rapide. Cyanure : traitement par <b>thiosulfate de sodium</b>."],
    ] });
  const S3 = s.scene; const mb = bicouche(34); S3.add(mb);
  const tH = txt3d('Espace intermembranaire', '#ffb0a0', 1.2); tH.position.set(-12, 12, -10); S3.add(tH);
  const tB = txt3d('Matrice', '#ffd0a0', 1.2); tB.position.set(-14, -12, -10); S3.add(tB);
  const cx = { I: -16, II: -8, III: 0, IV: 9, V: 18 };
  const cplx = (nom, x, col, h, r, k = 'complexe') => { const g = tag(new THREE.Group(), k); const m = new THREE.Mesh(blob(r, .2, 3, x + 30, 1.4), mat(col, { roughness: .5 })); m.scale.y = h / r / 2; g.add(m); g.position.set(x, 0, 0); S3.add(g); const t = txt3d(nom, '#' + new THREE.Color(col).getHexString(), 1.5); t.position.set(x, h / 2 + 2, 0); S3.add(t); g.userData.corps = m; return g; };
  const I = cplx('I', cx.I, 0x5f8fe0, 9, 3.4), II = cplx('II', cx.II, 0x5fd38d, 4.5, 2.2), III = cplx('III', cx.III, 0xe09a40, 8, 3.2), IV = cplx('IV', cx.IV, 0xd05a6a, 8, 2.8);
  // bras du complexe I dans la matrice
  const brasI = new THREE.Mesh(blob(2.2, .2, 3, 9), mat(0x5f8fe0)); brasI.position.set(-2, -5.5, 0); brasI.scale.y = 1.5; I.add(brasI);
  II.position.y = -1.6;
  // ATP synthase : anneau F0 dans la membrane, tige, tête F1 dans la matrice
  const V = tag(new THREE.Group(), 'atpsynthase'); V.position.set(cx.V, 0, 0); S3.add(V);
  const rotor = new THREE.Group(); V.add(rotor);
  for (let i = 0; i < 10; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, 5, 8), mat(0x9b8ae0)); const a = i / 10 * 6.283; c.position.set(Math.cos(a) * 2.2, 0, Math.sin(a) * 2.2); rotor.add(c); }
  const tige = new THREE.Mesh(new THREE.CylinderGeometry(.45, .45, 5, 8), mat(0x9b8ae0)); tige.position.y = -4.6; rotor.add(tige);
  const F1 = new THREE.Group(); for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 12), mat(i % 2 ? 0xe0c060 : 0xd09a40)); const a = i / 6 * 6.283; b.position.set(Math.cos(a) * 1.7, -8, Math.sin(a) * 1.7); F1.add(b); } V.add(F1);
  const stator = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, 9, 6), mat(0x8a7ab0)); stator.position.set(3.4, -3.5, 0); V.add(stator);
  const tV = txt3d('V : ATP synthase', '#c0b0ff', 1.3); tV.position.set(cx.V, 5.5, 0); S3.add(tV);
  // navettes
  const Q = tag(new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, .4, 6), mat(0xf5d020, { emissive: 0x504000 })), 'coq'); S3.add(Q); lab(s, Q, 'CoQ', 1.6);
  const C = tag(boule(0xff4050, .9), 'cytc'); S3.add(C); lab(s, C, 'Cyt c', 1.6);
  // NADH / FADH2 entrants, O2 → H2O
  const nadh = txt3d('NADH', '#7fd0ff', 1.2), fadh = txt3d('FADH₂', '#ffd060', 1.2), o2 = txt3d('O₂ → H₂O', '#ffffff', 1.2); S3.add(nadh, fadh, o2); tag(nadh, 'nadh'); tag(fadh, 'fadh2'); tag(o2, 'o2');
  // électrons
  const cE = courbe([[cx.I - 2, -7, 1], [cx.I, -1, 1], [cx.I + 3, 0, 2], [-4, -.5, 2], [cx.III - 1, 0, 2], [cx.III + 1, 4, 2], [4.5, 5.5, 2], [cx.IV - 1, 4, 2], [cx.IV, -1, 2], [cx.IV + 1, -6, 2]]);
  const cE2 = courbe([[cx.II, -5, 1], [cx.II, -1, 1], [-4, -.5, 2]]);
  const sp = () => { const m = new THREE.Mesh(new THREE.SphereGeometry(.28, 8, 6), new THREE.MeshBasicMaterial({ color: 0xfff080 })); return m; };
  const fE = flux(S3, cE, 10, sp, .12), fE2 = flux(S3, cE2, 4, sp, .2);
  // protons
  const Hs = []; for (let i = 0; i < 40; i++) { const h = txt3d('H⁺', '#ff7060', .9, null); tag(h, 'proton'); h.userData.ph = Math.random(); h.userData.src = [cx.I, cx.III, cx.IV][i % 3]; S3.add(h); Hs.push(h); }
  const haut = []; for (let i = 0; i < 30; i++) { const h = txt3d('H⁺', '#ff7060', .9, null); h.position.set(rnd(-24, 24), rnd(5, 12), rnd(-8, 8)); S3.add(h); haut.push(h); }
  const poisons = ['CO', 'CN⁻', 'H₂S'].map((n, i) => { const t = txt3d(n, '#ff3040', 1.4); tag(t, 'poison'); S3.add(t); return t; });
  const B = bulles(S3); let step = 0, k = 0, last = 0;
  s.onStep = (i) => { step = i; k = 0; B.vider(); };
  s.update = function (dt, t) {
    s.controls.update(); B.maj(t); k = Math.min(1, k + dt * .3);
    const bloque = step === 4 && k > .5;
    nadh.position.set(cx.I - 3, -10 + Math.sin(t) * .4, 2); fadh.position.set(cx.II, -8 + Math.cos(t) * .4, 2); o2.position.set(cx.IV + 2, -9, 2);
    fE.on = step >= 1 && !bloque; fE2.on = step >= 1 && !bloque; fE.vit = fE2.vit = step === 4 ? .12 * (1 - k) : step === 0 ? 0 : .12; fE.maj(t); fE2.maj(t);
    Q.position.set(-5 + Math.sin(t * 1.4) * 3, 0, 3); C.position.set(4.5 + Math.sin(t * 1.6) * 2, 5.6, 2);
    Hs.forEach((h, i) => { const u = (t * .2 + h.userData.ph) % 1; h.visible = (step === 2 || step === 3) && !bloque; h.position.set(h.userData.src + Math.sin(i) * 1.2, -6 + u * 16, 2 + Math.cos(i) * 1.2); });
    haut.forEach((h, i) => { h.visible = step >= 2 && !(step === 4 && k > .8); if (step === 3) { const u = (t * .25 + i / 30) % 1; if (i % 3 === 0) h.position.set(cx.V + Math.cos(i) * 2.2, 8 - u * 16, Math.sin(i) * 2.2); } });
    rotor.rotation.y += dt * (step === 3 ? 4 : step === 4 ? 3 * Math.max(0, 1 - k * 2) : step >= 2 ? 1 : 0);
    poisons.forEach((p, i) => { p.visible = step === 4; p.position.lerpVectors(V3(cx.IV + 8 + i * 3, 14 - i * 2, 4), V3(cx.IV + (i - 1) * 1.6, 2 + i * .6, 3.5), Math.min(1, k * 2)); });
    IV.userData.corps.material.emissive.set(bloque ? 0x600010 : 0x000000);
    if (t - last > 1.2) { last = t;
      if (step === 3) { B.pop('ADP + Pi → ATP', V3(cx.V, -11, 3), '#5fd38d', t, 1.1, -1.2); }
      if (step === 1) B.pop('O₂ + 4 e⁻ → 2 H₂O', V3(cx.IV + 2, -7, 3), '#ffffff', t, 1, -1);
      if (step === 4 && bloque) B.pop('Plus d\'ATP', V3(cx.V, -10, 3), '#ff4050', t, 1.2, -.6);
    }
  };
  return s;
}
const SCENES = { cellule: sceneCellule, bilan: sceneBilan, glut: sceneGlut, glyco: sceneGlyco, glycogene: sceneGlycogene, krebs: sceneKrebs, lipides: sceneLipides, uree: sceneUree, chaine: sceneChaine };

/* =========================================================
   NAVIGATION
   ========================================================= */
function activer(sc) {
  if (cur && cur.micro) cur.dispose();
  viderLabels(); for (const l of sc.labels) l.el = null;
  cur = sc; taille();
  $('#tLieu').textContent = sc.titre; $('#tEchelle').textContent = sc.echelle;
  $('#bRetour').innerHTML = sc.retourIcone; $('#bRetour').setAttribute('aria-label', sc.hub ? 'Revenir au corps' : 'Dézoomer');
  majDep(sc);
  if (sc.micro && !S.aideM) { S.aideM = 1; save(); setTimeout(() => toast("Glisse pour tourner, pince ou utilise + et − pour zoomer, touche une molécule pour l'identifier. Le bouton <b>Explication</b> ouvre le texte du cours.", 6500), 500); }
  if (sc.micro) etapesUI(sc); else { sc.camera.clearViewOffset(); sc.piste(); }
}
function transition(fn) { const v = $('#voile'); v.classList.add('on'); setTimeout(() => { fn(); setTimeout(() => v.classList.remove('on'), 60); }, 330); bip(420, .15); }
function entrerScene(nom) { transition(() => { const sc = SCENES[nom](); if (cur && cur.hub) pile = [cur.id]; else if (cur) pile.push(cur.id); activer(sc); }); }
function allerNiveau(id) {
  const L = lvl(id);
  if (!actif) ouvrirMonde();
  if (cur && cur.id === L.scene) return;
  entrerScene(L.scene);
}
$('#bRetour').onclick = () => {
  fermeFeuille();
  if (!cur || cur.hub) { $('#monde').classList.remove('on'); $('#carte').classList.add('on'); $('#zoomCorps').classList.remove('entre'); actif = false; return; }
  const prev = pile.pop();
  transition(() => activer(SCENES[prev || HUB]()));
};
const ICD = {
  haut: '<svg class="ic" viewBox="0 0 24 24"><path d="m6 15 6-6 6 6"/></svg>', bas: '<svg class="ic" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
  plus: '<svg class="ic" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/></svg>',
  moins: '<svg class="ic" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M8 11h6"/></svg>',
  tout: '<svg class="ic" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>',
};
function majDep(sc) {
  const b = sc.micro ? [['plus', 'Zoomer', () => cur.zoom(.62)], ['moins', 'Dézoomer', () => cur.zoom(1.6)], ['tout', "Vue d'ensemble", () => cur.zoom(0)]]
    : [['haut', 'Avancer', () => cur.avance(1)], ['bas', 'Reculer', () => cur.avance(-1)]];
  for (const id of ['#depG', '#depD']) { const el = $(id); el.innerHTML = b.map(([ic, t], i) => `<button data-i="${i}" aria-label="${t}" title="${t}">${ICD[ic]}</button>`).join('');
    el.querySelectorAll('button').forEach((x) => x.onclick = () => cur && b[+x.dataset.i][2]()); }
}
// Safari : empêcher le zoom de la page et la vue des onglets quand on pince la 3D
['gesturestart', 'gesturechange', 'gestureend'].forEach((ev) => document.addEventListener(ev, (e) => e.preventDefault(), { passive: false }));
document.addEventListener('touchmove', (e) => { if (e.touches.length > 1 && $('#monde').classList.contains('on')) e.preventDefault(); }, { passive: false });
let dernierTap = 0; document.addEventListener('touchend', (e) => { const n = Date.now(); if (n - dernierTap < 300 && $('#monde').classList.contains('on')) e.preventDefault(); dernierTap = n; }, { passive: false });
let actif = false;
function ouvrirMonde() {
  $('#carte').classList.remove('on'); $('#monde').classList.add('on');
  pile = []; activer(SCENES[HUB]()); actif = true;
  if (!S.vu) { S.vu = 1; save(); setTimeout(() => toast(PREMIERE, 7000), 700); }
}
$('#bEntrer').onclick = () => { $('#zoomCorps').classList.add('entre'); bip(330, .3); setTimeout(ouvrirMonde, 900); };
$('#bSommaire').onclick = menuNiveaux;
let visible = true;
document.addEventListener('visibilitychange', () => { visible = !document.hidden; });
function boucle() {
  requestAnimationFrame(boucle);
  if (!actif || !cur || !visible) { clock.getDelta(); return; }
  const dt = Math.min(.05, clock.getDelta()), t = clock.elapsedTime;
  cur.update(dt, t);
  if (cur.tgt) { const c = cur.controls, dl = cur.tgt.clone().sub(c.target).multiplyScalar(Math.min(1, dt * 4)); c.target.add(dl); cur.camera.position.add(dl); if (cur.tgt.distanceTo(c.target) < .05) cur.tgt = null; }
  if (cur.zd) { const c = cur.controls, v = cur.camera.position.clone().sub(c.target), d = v.length(), nd = d + (cur.zd - d) * Math.min(1, dt * 6);
    cur.camera.position.copy(c.target).addScaledVector(v.normalize(), nd); if (Math.abs(cur.zd - nd) < .05) cur.zd = 0; } R.render(cur.scene, cur.camera); majLabels();
}
boucle();
$('#charge').remove();
const h = location.hash.slice(1);
if (lvl(h)) setTimeout(() => allerNiveau(h), 200);
window.addEventListener('message', (e) => { if (e.data && e.data.visu === 'aller' && lvl(e.data.id)) allerNiveau(e.data.id); });
window.__visu = { allerNiveau, ouvrirMonde, get cur() { return cur; } };
$('#bCible').onclick = () => $('#bEntrer').click();
