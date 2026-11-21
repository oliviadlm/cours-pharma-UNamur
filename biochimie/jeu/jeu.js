import * as THREE from './three.module.min.js';
import { OrbitControls } from './OrbitControls.js';
import { mergeVertices } from './BufferGeometryUtils.js';
const { DATA } = await import('./data.js?t=' + Date.now());

/* =========================================================
   Voyage dans le corps — monde 1 : le sang (prototype)
   1 unité 3D = 1 µm dans la veinule.
   ========================================================= */
const $ = (s) => document.querySelector(s);
const IC = {
  star: '<svg class="ic" viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18.5 21 12 16.5 5.5 21l2-7.5L2 9h7z"/></svg>',
  play: '<svg class="ic" viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z"/></svg>',
  lock: '<svg class="ic" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  map: '<svg class="ic" viewBox="0 0 24 24"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/></svg>',
  out: '<svg class="ic" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M8 11h6"/></svg>',
  in: '<svg class="ic" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M8 11h6M11 8v6"/></svg>',
};

/* ---------------- sauvegarde ---------------- */
const KEY = 'bioch-corps-v1';
let S = { stars: {}, ency: {}, orgs: {}, boss: 0 };
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const LV = DATA.levels;
const lvl = (id) => LV.find((l) => l.id === id);
const stars = (id) => S.stars[id] || 0;
const bossOpen = () => LV.every((l) => stars(l.id) >= 1);
const etoiles = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);

function toast(t, ms = 2600) {
  const el = $('#toast'); el.innerHTML = t; el.classList.add('on');
  clearTimeout(toast.h); toast.h = setTimeout(() => el.classList.remove('on'), ms);
}
function fete(titre, texte, fn) {
  $('#feteT').textContent = titre; $('#feteP').innerHTML = texte; $('#fete').classList.add('on');
  $('#feteB').onclick = () => { $('#fete').classList.remove('on'); fn && fn(); };
  bip(660, .12); setTimeout(() => bip(880, .15), 140); setTimeout(() => bip(1100, .2), 300);
}
let AC;
function bip(f, d) {
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const o = AC.createOscillator(), g = AC.createGain();
    o.frequency.value = f; o.type = 'sine'; g.gain.setValueAtTime(.08, AC.currentTime); g.gain.exponentialRampToValueAtTime(.0001, AC.currentTime + d);
    o.connect(g).connect(AC.destination); o.start(); o.stop(AC.currentTime + d); } catch (e) {}
}

/* ---------------- encyclopédie ---------------- */
const ENCY = {
  erythro: ['Érythrocyte', "Disque biconcave de 7,8 µm, sans noyau ni mitochondries. Vit 120 jours. Transporte l'O₂ grâce à l'hémoglobine."],
  reticulo: ['Réticulocyte', "Globule rouge jeune, encore un réseau d'ARN. Son taux reflète la régénération de la moelle."],
  neutro: ['Polynucléaire neutrophile', "Leucocyte de 12-15 µm, 50 à 75 % des globules blancs : il phagocyte les bactéries."],
  lympho: ['Lymphocyte', "Petit leucocyte rond (7-10 µm) à gros noyau : immunité spécifique (B, T)."],
  mono: ['Monocyte', "Le plus grand leucocyte. Dans les tissus et la rate, il devient macrophage."],
  plaquette: ['Plaquette (thrombocyte)', "Fragment de mégacaryocyte de 2-3 µm, sans noyau. 150 000-400 000/mm³, vit 8-10 jours."],
  endo: ['Endothélium', "Couche de cellules qui tapisse le vaisseau. Sain, il empêche la coagulation (NO, PGI₂)."],
  albumine: ['Albumine', "Protéine la plus abondante du plasma (foie). Pression oncotique et transport (bilirubine, médicaments, hormones)."],
  igg: ['Immunoglobuline G', "Anticorps en Y produit par les plasmocytes (γ-globuline). Pas fabriqué par le foie."],
  fibrinogene: ['Fibrinogène', "Long bâtonnet à 3 nodules (foie). Coupé par la thrombine en fibrine ; ponts entre plaquettes."],
  transferrine: ['Transferrine', "Transporte le fer (2 Fe³⁺ par molécule), saturée au tiers seulement."],
  lipo: ['Lipoprotéine', "Sphère qui transporte les lipides (HDL, LDL, VLDL)."],
  ions: ['Électrolytes', "Na⁺ 135-150, K⁺ 3,5-5,0, Ca²⁺ 2,2-2,6, Mg²⁺ 0,8-1,2 mmol/L."],
  glucose: ['Glucose', "Glycémie à jeun 0,7-0,9 g/L. Entre dans le GR sans insuline (GLUT-1)."],
  hb: ['Hémoglobine', "Tétramère α2β2 : 4 globines + 4 hèmes, 4 O₂. 88 % du volume du globule rouge."],
  bpg: ['2,3-Bisphosphoglycérate', "Fait lâcher l'O₂ à l'hémoglobine dans les tissus. Le GR perd un ATP pour le fabriquer."],
  gsh: ['Glutathion', "γ-Glu-Cys-Gly, thiol réducteur. Détruit H₂O₂ ; régénéré par le NADPH de la voie des pentoses."],
  ros: ['Espèces réactives de l\'oxygène', "Superoxyde, H₂O₂ : formés car le GR transporte l'O₂. Neutralisés par SOD et glutathion."],
  globA: ['Chaîne α de globine', "141 acides aminés. 2 par hémoglobine adulte."],
  globB: ['Chaîne β de globine', "146 acides aminés. Mutée dans la drépanocytose (HbS)."],
  heme: ['Hème', "Porphyrine (4 pyrroles) + Fe²⁺ central. 6 liaisons : 4 N, 1 histidine, 1 libre pour l'O₂."],
  fe: ['Fe²⁺', "Fer ferreux de l'hème. Oxydé en Fe³⁺ : méthémoglobine, ne fixe plus l'O₂."],
  o2: ['Dioxygène', "Se fixe sur le Fe²⁺ : oxygénation, pas oxydation. Fixation coopérative (courbe sigmoïde)."],
  co: ['Monoxyde de carbone', "Affinité ~200 fois plus forte que l'O₂ : carboxyhémoglobine."],
  lipide: ['Phospholipide', "Tête polaire + 2 queues d'acides gras : bicouche de la membrane."],
  antigene: ['Antigène du système ABO', "Chaîne d'oses sur une glycoprotéine/glycolipide. L'ose terminal fait le groupe."],
  glcnac: ['N-acétylglucosamine', "Carré bleu (symboles SNFG). Base de la chaîne."],
  gal: ['Galactose', "Rond jaune. Ajouté en bout de chaîne par le gène B."],
  galnac: ['N-acétylgalactosamine', "Carré jaune. Ajouté par le gène A."],
  fuc: ['Fucose', "Triangle rouge. Fait l'antigène H (groupe O)."],
  rh: ['Protéine Rhésus D', "Protéine traversant la membrane. Présente = Rh+ (85 %)."],
  anticorps: ['Anticorps naturel', "IgM du plasma dirigé contre l'antigène ABO absent."],
  collagene: ['Collagène', "Exposé par la brèche : déclenche l'adhésion des plaquettes."],
  vwf: ['Facteur von Willebrand', "Long multimère : relie la GPIb des plaquettes au collagène."],
  plaqAct: ['Plaquette activée', "Sphérique avec pseudopodes ; libère ADP, TXA₂ ; GPIIb/IIIa activée."],
  fibrine: ['Fibrine', "Réseau formé par la thrombine à partir du fibrinogène, stabilisé par le XIIIa."],
  plasmine: ['Plasmine', "Enzyme de la fibrinolyse (activée par le t-PA) : coupe la fibrine en D-dimères."],
  macro: ['Macrophage', "Dans la rate, le foie et la moelle : détruit les GR âgés de 120 jours."],
  biliverdine: ['Biliverdine', "Pigment vert : hème ouvert par l'hème oxygénase (+ Fe + CO)."],
  bilirubine: ['Bilirubine', "Pigment jaune, peu soluble : voyage liée à l'albumine vers le foie."],
  proerythro: ['Proérythroblaste', "Grande cellule de la moelle, gros noyau : début de l'érythropoïèse (EPO)."],
  erythroblaste: ['Érythroblaste', "Se divise, fabrique l'hémoglobine, son noyau se condense puis est expulsé."],
};
function decouvre(k) {
  const e = ENCY[k]; if (!e) return;
  const neuf = !S.ency[k]; S.ency[k] = 1; save();
  toast(`<b style="color:var(--cyan)">${e[0]}</b><br>${e[1]}${neuf ? '<br><small style="color:var(--or)">Nouvelle découverte</small>' : ''}`, 4200);
  if (neuf) bip(990, .12);
}

/* ---------------- carte du corps ---------------- */
const ORG = {
  cerveau: ['Cerveau', "Ne brûle que du glucose (et des corps cétoniques au jeûne prolongé). Neuromédiateurs : glutamate, GABA, dopamine, sérotonine (ch2.10).", 'ch2'],
  hypophyse: ['Hypophyse', "Chef d'orchestre : GH, TSH, ACTH, FSH/LH, prolactine ; vasopressine et ocytocine stockées (ch2.3, 2.6-2.7).", 'ch2'],
  thyroide: ['Thyroïde', "T3 et T4 à partir de tyrosine + iode ; calcitonine (ch2.3, 2.5).", 'ch2'],
  poumons: ['Poumons', "L'hémoglobine y charge l'O₂ et y libère le CO₂ (ch4).", 'ch4'],
  coeur: ['Cœur', "Pompe le sang. Le muscle cardiaque brûle surtout des acides gras (ch1).", 'ch4'],
  foie: ['Foie', "Glycogène, néoglucogenèse, cétogenèse, urée, cholestérol, protéines plasmatiques, alcool, biotransformation (ch1, ch5).", 'ch5'],
  estomac: ['Estomac', "Gastrine, HCl, facteur intrinsèque (absorption de la B12) (ch2.4, ch4).", 'ch2'],
  rate: ['Rate', "Les macrophages y détruisent les GR âgés ; réserve d'un tiers des plaquettes (ch4).", 'ch4'],
  pancreas: ['Pancréas', "Insuline (cellules β) et glucagon (α) ; enzymes digestives (ch2.3, séminaire diabète).", 'semdiab'],
  surrenales: ['Surrénales', "Cortisol, aldostérone, DHEA (cortex) ; adrénaline (médullaire) (ch2.3, 2.5).", 'ch2'],
  reins: ['Reins', "EPO (globules rouges), calcitriol, rénine ; élimine urée, créatinine, acide urique (ch2.5, ch4).", 'ch4'],
  intestin: ['Intestin', "Absorption, incrétines GLP-1 et GIP, sécrétine, CCK ; B12 absorbée dans l'iléon (ch2.4).", 'ch2'],
  muscle: ['Muscle', "Glycolyse, glycogène (pour lui seul), créatine-phosphate ; GLUT4 sous insuline (ch1).", 'ch1'],
  moelle: ['Moelle osseuse', "Érythropoïèse, leucopoïèse, thrombocytopoïèse à partir des cellules souches (ch4).", 'ch4'],
  adipeux: ['Tissu adipeux', "Stocke les triglycérides (insuline), lipolyse au jeûne ; graisse abdominale et insulinorésistance (ch1, diabète).", 'ch1'],
};
const LIEUX = [
  { id: 'ch1', n: '1', t: 'Voies métaboliques', x: 158, y: 578, open: false, d: "Une cellule de muscle, de foie et de tissu adipeux : glycolyse, Krebs, chaîne respiratoire, β-oxydation, en période alimentaire et au jeûne." },
  { id: 'ch2', n: '2', t: 'Communication', x: 180, y: 92, open: false, d: "Glandes, membranes et récepteurs : messagers, RCPG, récepteurs nucléaires, hormones, neuromédiateurs." },
  { id: 'ch4', n: '4', t: 'Le sang', x: 76, y: 330, open: true, d: "Une veinule du bras : globules rouges, hémoglobine, fer, groupes sanguins, plaquettes et hémostase." },
  { id: 'ch5', n: '5', t: 'Le foie', x: 140, y: 302, open: false, d: "Un lobule hépatique : alcool, biotransformation, bile." },
  { id: 'sd', n: 'D', t: 'Diabète', x: 222, y: 350, open: false, d: "Les îlots de Langerhans et le muscle : insuline, insulinorésistance." },
  { id: 'sh', n: 'H', t: 'Hémorragies', x: 214, y: 660, open: false, d: "Une brèche dans un vaisseau de la jambe : maladies hémorragiques." },
];
function dessineCarte() {
  const g = $('#lieux'); g.innerHTML = '';
  for (const L of LIEUX) {
    const ok = L.open, fini = L.id === 'ch4' && S.boss;
    const col = fini ? '#5fd38d' : ok ? '#5fd4e6' : '#6b7f8c';
    const right = L.x > 180;
    const lx = right ? L.x + 14 : L.x - 14;
    g.insertAdjacentHTML('beforeend', `<g class="lieu" data-l="${L.id}">
      ${ok ? `<circle class="halo" cx="${L.x}" cy="${L.y}" r="14" fill="none" stroke="${col}" stroke-width="2"/>` : ''}
      <circle cx="${L.x}" cy="${L.y}" r="11" fill="${col}" stroke="#fff" stroke-width="1.5"/>
      <text x="${L.x}" y="${L.y + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="#04222b">${L.n}</text>
      <rect x="${right ? lx : lx - L.t.length * 6.2 - 12}" y="${L.y - 10}" width="${L.t.length * 6.2 + 12}" height="20" rx="10" fill="rgba(7,18,28,.85)" stroke="${col}"/>
      <text x="${right ? lx + 6 : lx - 6}" y="${L.y + 4}" text-anchor="${right ? 'start' : 'end'}" font-size="11" font-weight="700" fill="${ok ? '#fff' : '#9bb3c2'}">${L.t}</text></g>`);
  }
  const nO = Object.keys(S.orgs).length, nE = Object.keys(S.ency).length, nS = LV.reduce((a, l) => a + stars(l.id), 0);
  $('#stats').innerHTML = `<span>${nO}/${Object.keys(ORG).length} organes explorés</span><span>${nE}/${Object.keys(ENCY).length} découvertes</span><span>${nS}/${LV.length * 3} étoiles</span>${S.boss ? '<span style="color:var(--vert)">Monde du sang terminé</span>' : ''}`;
}
$('#corps').addEventListener('click', (e) => {
  const li = e.target.closest('.lieu');
  if (li) {
    const L = LIEUX.find((x) => x.id === li.dataset.l);
    $('#infoOrg').innerHTML = `<h3>${L.n === 'D' || L.n === 'H' ? 'Séminaire' : 'Chapitre ' + L.n} · ${L.t}</h3><p>${L.d}</p>` +
      (L.open ? `<button class="btn" id="bEntrer">${IC.play} Entrer dans le monde</button>` : `<p style="color:var(--or);margin-top:6px">${IC.lock} Monde en construction : il arrive après validation du prototype (le sang).</p>`);
    if (L.open) $('#bEntrer').onclick = () => ouvrirMonde();
    return;
  }
  const o = e.target.closest('.org'); if (!o) return;
  document.querySelectorAll('.org.sel').forEach((x) => x.classList.remove('sel')); o.classList.add('sel');
  const k = o.dataset.o, O = ORG[k]; const neuf = !S.orgs[k]; S.orgs[k] = 1; save(); dessineCarte();
  $('#infoOrg').innerHTML = `<h3>${O[0]}</h3><p>${O[1]}</p>${neuf ? '<p style="color:var(--or);font-size:12px;margin-top:4px">Organe ajouté à ta carte</p>' : ''}`;
  if (neuf) bip(880, .1);
});
$('#bEncy').onclick = () => {
  feuille('Encyclopédie', [['Découvertes', () => `<p style="color:var(--doux)">Touche les cellules et les molécules dans les mondes pour les découvrir.</p><div class="ency">${Object.entries(ENCY).map(([k, v]) => S.ency[k] ? `<div><b>${v[0]}</b>${v[1]}</div>` : `<div class="non"><b>?</b>À découvrir</div>`).join('')}</div>`],
    ['Organes', () => `<div class="ency">${Object.entries(ORG).map(([k, v]) => S.orgs[k] ? `<div><b>${v[0]}</b>${v[1]}</div>` : `<div class="non"><b>${v[0]}</b>Touche-le sur la carte</div>`).join('')}</div>`]]);
};

/* ---------------- feuille (panneau du bas) ---------------- */
let feuilleFerme = null;
function feuille(titre, onglets, iDefaut = 0, onClose) {
  $('#fT').textContent = titre; const O = $('#fO'), C = $('#fC'); O.innerHTML = '';
  onglets.forEach(([n, f], i) => {
    const b = document.createElement('button'); b.textContent = n; O.appendChild(b);
    b.onclick = () => { O.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); C.innerHTML = ''; const r = f(C); if (typeof r === 'string') C.innerHTML = r; C.scrollTop = 0; };
    if (i === iDefaut) setTimeout(() => b.click());
  });
  O.style.display = onglets.length > 1 ? '' : 'none';
  $('#feuille').classList.add('on'); feuilleFerme = onClose || null;
}
function fermeFeuille() { $('#feuille').classList.remove('on'); const f = feuilleFerme; feuilleFerme = null; f && f(); }
$('#fX').onclick = fermeFeuille;

const melange = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
function quiz(C, qs, fin) {
  let i = 0, bons = 0; qs = melange(qs);
  const montre = () => {
    if (i >= qs.length) return fin(bons, qs.length);
    const q = qs[i];
    C.innerHTML = `<div class="qcm"><div class="prog"><i style="width:${(i / qs.length) * 100}%"></i></div><small style="color:var(--doux)">Question ${i + 1} / ${qs.length}</small><div class="q">${q.q}</div><div id="chs"></div><div class="x" id="qx"></div></div>`;
    const box = C.querySelector('#chs');
    melange(q.c).forEach((c) => {
      const b = document.createElement('button'); b.className = 'ch'; b.textContent = c; box.appendChild(b);
      b.onclick = () => {
        if (box.dataset.ok) return; box.dataset.ok = 1;
        const bon = c === q.r; if (bon) { bons++; bip(880, .1); } else bip(220, .2);
        box.querySelectorAll('button').forEach((x) => { if (x.textContent === q.r) x.classList.add('bon'); else if (x === b) x.classList.add('faux'); });
        C.querySelector('#qx').innerHTML = (bon ? '<b style="color:var(--vert)">Bravo.</b> ' : '<b style="color:var(--rouge)">Pas tout à fait.</b> ') + (q.x || '') +
          `<p><button class="btn" id="qn">${i + 1 < qs.length ? 'Question suivante' : 'Voir le résultat'}</button></p>`;
        C.querySelector('#qn').onclick = () => { i++; montre(); };
      };
    });
  };
  montre();
}
function ouvrirNiveau(id, onglet = 0) {
  const L = lvl(id); const n = LV.indexOf(L) + 1;
  const fiche = () => L.fiche + L.figs.map((f) => `<figure><img loading="lazy" src="${f.src}" alt=""><figcaption>${f.cap}</figcaption></figure>`).join('');
  const defi = (C) => {
    C.innerHTML = `<div class="res"><div class="etoiles">${etoiles(stars(id))}</div><p>${L.qs.length} questions. 1 étoile à 50 %, 2 à 70 %, 3 à 90 %.</p><button class="btn" id="go">${IC.play} Commencer le défi</button></div>`;
    C.querySelector('#go').onclick = () => quiz(C, L.qs, (b, t) => {
      const r = b / t, e = r >= .9 ? 3 : r >= .7 ? 2 : r >= .5 ? 1 : 0;
      const avant = stars(id), bossAvant = bossOpen();
      if (e > avant) { S.stars[id] = e; save(); }
      C.innerHTML = `<div class="res"><div class="etoiles">${etoiles(e)}</div><h3>${b} / ${t}</h3><p>${e === 0 ? 'Relis la fiche et réessaie.' : e === 3 ? 'Niveau maîtrisé.' : 'Encore un effort pour 3 étoiles.'}</p><button class="btn sec" id="re">Rejouer</button></div>`;
      C.querySelector('#re').onclick = () => defi(C);
      majHUD();
      if (e === 3 && avant < 3) fete('Niveau maîtrisé', `${L.t} : 3 étoiles.`);
      else if (e >= 1 && avant === 0) fete('Niveau réussi', `${L.t} : ${etoiles(e)}`);
      if (!bossAvant && bossOpen()) setTimeout(() => fete('Boss débloqué', "Tous les niveaux ont au moins 1 étoile. Le boss t'attend au bout de la veinule, vers le cœur."), 600);
    });
  };
  const cartes = () => L.cards.length ? L.cards.map((c) => `<div class="carteq"><b>${c.q}</b><details><summary>Voir la réponse</summary><p>${c.a}</p></details></div>`).join('') : '<p>Pas de question du prof pour ce niveau : fais le défi.</p>';
  feuille(`Niveau ${n} · ${L.t}`, [['Fiche du cours', fiche], ['Défi', defi], ['Questions du prof', cartes]], onglet);
}
function ouvrirBoss() {
  if (!bossOpen()) { toast(`${IC.lock} Le boss s'ouvre quand chaque niveau a au moins 1 étoile.`); return; }
  feuille('Boss · Examen du sang', [['Boss', (C) => {
    C.innerHTML = `<div class="res"><p>15 questions tirées de tout le chapitre. Il faut 75 % pour vaincre le boss.</p><button class="btn" id="go">${IC.play} Affronter le boss</button></div>`;
    C.querySelector('#go').onclick = () => quiz(C, melange(DATA.boss).slice(0, 15), (b, t) => {
      const win = b / t >= .75;
      C.innerHTML = `<div class="res"><h3>${b} / ${t}</h3><p>${win ? 'Boss vaincu.' : 'Pas encore : il faut 75 %.'}</p></div>`;
      if (win && !S.boss) { S.boss = 1; save(); fete('Monde du sang terminé', 'Tu as vaincu le boss du chapitre 4.', () => { fermeFeuille(); }); }
    });
  }], ['Question clinique', () => DATA.clin]]);
}
function menuNiveaux() {
  feuille('Les niveaux du monde du sang', [['Niveaux', (C) => {
    C.innerHTML = LV.map((L, i) => `<div class="carte-niv"><div class="t"><b>${i + 1}. ${L.t}</b><small>${etoiles(stars(L.id))}</small><div style="font-size:12.5px;color:var(--doux)">${L.sub}</div></div><button class="btn" data-go="${L.id}">Y aller</button></div>`).join('') +
      `<div class="carte-niv" style="border-color:var(--rouge)"><div class="t"><b>Boss · Examen du sang</b><small>${S.boss ? 'vaincu' : bossOpen() ? 'ouvert' : 'fermé'}</small></div><button class="btn" data-go="boss">${bossOpen() ? 'Affronter' : IC.lock}</button></div>`;
    C.querySelectorAll('[data-go]').forEach((b) => b.onclick = () => { fermeFeuille(); const g = b.dataset.go; if (g === 'boss') return ouvrirBoss(); allerNiveau(g); });
  }]]);
}
$('#bNiv').onclick = menuNiveaux;

/* =========================================================
   MOTEUR 3D
   ========================================================= */
const cv = $('#c3d');
const R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' });
R.setPixelRatio(Math.min(devicePixelRatio, 2));
R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.15;
let W = 1, H = 1;
function taille() { W = innerWidth; H = innerHeight; R.setSize(W, H, false); if (cur) { cur.camera.aspect = W / H; cur.camera.updateProjectionMatrix(); } }
addEventListener('resize', taille);

let cur = null, pile = [], vesselCache = null;
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
    const vis = tmpV.z < 1 && tmpV.z > -1 && Math.abs(tmpV.x) < 1.2 && Math.abs(tmpV.y) < 1.2 && d < (l.max || 1e9) && (l.show ? l.show() : true) && (l.poi || !!l.t);
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
   SCÈNE PRINCIPALE : LA VEINULE
   ========================================================= */
function construireVeinule() {
  const scene = new THREE.Scene();
  const FOG = 0x2b0407; scene.background = new THREE.Color(FOG); scene.fog = new THREE.FogExp2(FOG, .0105);
  const camera = new THREE.PerspectiveCamera(62, W / H, .1, 600);
  const pts = []; for (let i = 0; i <= 14; i++) pts.push(V3(Math.sin(i * .62) * 26, Math.cos(i * .47) * 18, -i * 62));
  const curve = new THREE.CatmullRomCurve3(pts);
  const NS = 700, RAD = 26;
  const tex = texEndo(); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(34, 2);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, NS, RAD, 64, false),
    new THREE.MeshStandardMaterial({ map: tex, bumpMap: tex, bumpScale: 2.5, roughness: .62, side: THREE.BackSide }));
  tag(tube, 'endo'); scene.add(tube);
  const LP = curve.getSpacedPoints(NS), FR = curve.computeFrenetFrames(NS, false);
  const fr = (t, P, N, B, T) => {
    t = Math.min(.9999, Math.max(0, t)); const f = t * NS, i = Math.floor(f), a = f - i;
    P.lerpVectors(LP[i], LP[i + 1], a); N && N.copy(FR.normals[i]); B && B.copy(FR.binormals[i]); T && T.copy(FR.tangents[i]);
  };
  scene.add(new THREE.HemisphereLight(0xff9a8a, 0x3a0408, 1.1));
  const lamp = new THREE.PointLight(0xffe0d0, 260, 140, 1.6); scene.add(lamp);
  const lamp2 = new THREE.DirectionalLight(0xffc0b0, .6); scene.add(lamp2);

  // globules rouges (densité réduite pour y voir)
  const nGR = 460, gG = geoGR();
  const GR = new THREE.InstancedMesh(gG, matGR(), nGR); GR.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const col = new THREE.Color(); const cells = [];
  for (let i = 0; i < nGR; i++) {
    const r = Math.sqrt(Math.random()) * (RAD - 5), a = Math.random() * 6.283;
    const reti = i % 37 === 0;
    cells.push({ t: Math.random(), r, a, sp: (1 - (r / RAD) ** 2) * .0065 + .0006, rx: rnd(0, 6), ry: rnd(0, 6), sx: rnd(-.6, .6), sy: rnd(-.6, .6), reti, s: reti ? 1.12 : rnd(.96, 1.04) });
    col.set(reti ? 0x8a3a5a : 0xffffff).offsetHSL(0, 0, rnd(-.06, .04)); GR.setColorAt(i, col);
  }
  GR.userData.kAt = (id) => cells[id].reti ? 'reticulo' : 'erythro';
  scene.add(GR);
  // plaquettes
  const nPL = 170, PLg = new THREE.SphereGeometry(1, 14, 8); PLg.scale(1.35, .38, 1.35);
  const PL = new THREE.InstancedMesh(PLg, mat(0xd6b3d4, { roughness: .55, emissive: 0x1a0a1a }), nPL);
  const pls = []; for (let i = 0; i < nPL; i++) { const r = RAD - rnd(3, 9), a = Math.random() * 6.283; pls.push({ t: Math.random(), r, a, sp: (1 - (r / RAD) ** 2) * .0065 + .0005, rx: rnd(0, 6), ry: rnd(0, 6) }); }
  PL.userData.kAt = () => 'plaquette'; scene.add(PL);
  // leucocytes (roulent le long de la paroi)
  const leus = [];
  const LEU = [['neutro', 6.3, 0xeee4dc, .18], ['lympho', 4, 0xd8dcf0, .05], ['mono', 7.6, 0xe9ddd0, .12], ['neutro', 6.3, 0xeee4dc, .18], ['lympho', 4, 0xd8dcf0, .05], ['neutro', 6.3, 0xeee4dc, .18]];
  LEU.forEach(([k, r, c, amp], i) => {
    const m = tag(new THREE.Mesh(blob(r, amp, 4, i * 3 + 1, 3.4), new THREE.MeshPhysicalMaterial({ color: c, roughness: .6, sheen: .6, sheenColor: new THREE.Color(0xffffff), transmission: 0, emissive: 0x151010 })), k);
    scene.add(m); leus.push({ m, t: (i + .5) / LEU.length, a: rnd(0, 6.28), r: RAD - r - .5, sp: .0007 });
  });
  // poussière du plasma
  const nD = 1400, dg = new THREE.BufferGeometry(), dp = new Float32Array(nD * 3), P = V3(), N = V3(), B = V3(), T = V3();
  for (let i = 0; i < nD; i++) { fr(Math.random(), P, N, B); const r = Math.sqrt(Math.random()) * RAD * .95, a = Math.random() * 6.283; P.addScaledVector(N, Math.cos(a) * r).addScaledVector(B, Math.sin(a) * r); dp.set([P.x, P.y, P.z], i * 3); }
  dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  scene.add(new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xffc8b0, size: .35, transparent: true, opacity: .55, depthWrite: false })));

  // héros fixes pour les niveaux
  const heros = {};
  const poser = (t, off, ang) => { fr(t, P, N, B); return P.clone().addScaledVector(N, Math.cos(ang) * off).addScaledVector(B, Math.sin(ang) * off); };
  for (const [id, t, ang] of [['L2', .13, 1.2], ['L3', .27, -2], ['L6', .5, .4]]) {
    const m = tag(new THREE.Mesh(gG, matGR()), 'erythro'); m.scale.setScalar(1.15); m.position.copy(poser(t, 9, ang)); scene.add(m); heros[id] = m;
  }
  // monocyte → rate
  const mono = tag(new THREE.Mesh(blob(7.6, .14, 4, 9, 3.4), new THREE.MeshPhysicalMaterial({ color: 0xeadfce, roughness: .6, sheen: .6, sheenColor: new THREE.Color(0xffffff) })), 'mono');
  mono.position.copy(poser(.64, RAD - 9, 2.4)); scene.add(mono); heros.L5 = mono;
  // plasma
  const plasmaPt = new THREE.Object3D(); plasmaPt.position.copy(poser(.05, 12, -2.2)); scene.add(plasmaPt); heros.L1 = plasmaPt;
  // brèche dans la paroi
  const breche = new THREE.Group(); { fr(.77, P, N, B, T); const ang = -1.0; const n = N.clone().multiplyScalar(Math.cos(ang)).addScaledVector(B, Math.sin(ang)).normalize();
    breche.position.copy(P).addScaledVector(n, RAD - .6); breche.lookAt(P);
    const trou = new THREE.Mesh(new THREE.CircleGeometry(9, 40), mat(0x3a0a08, { roughness: .9 })); trou.position.z = .2; breche.add(trou);
    for (let i = 0; i < 18; i++) { const c = new THREE.CatmullRomCurve3([V3(rnd(-8, 8), rnd(-8, 8), -1), V3(rnd(-6, 6), rnd(-6, 6), rnd(1, 3)), V3(rnd(-9, 9), rnd(-9, 9), rnd(2, 5))]);
      breche.add(tag(new THREE.Mesh(new THREE.TubeGeometry(c, 16, .35, 6), mat(0xe0a050, { roughness: .4, emissive: 0x2a1000 })), 'collagene')); }
    for (let i = 0; i < 26; i++) { const p = tag(new THREE.Mesh(spiky(1.3, 8, i), mat(0xe0c0e6, { emissive: 0x201020 })), 'plaqAct'); p.position.set(rnd(-6, 6), rnd(-6, 6), rnd(1.5, 4.5)); breche.add(p); }
    for (let i = 0; i < 30; i++) { const a = V3(rnd(-8, 8), rnd(-8, 8), rnd(2, 6)), b = V3(rnd(-8, 8), rnd(-8, 8), rnd(2, 6)); breche.add(tag(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 1, .08, 4), mat(0xf2ecd8, { roughness: .3 })), 'fibrine')); }
  }
  scene.add(breche); heros.L7 = breche;
  const bossPt = new THREE.Object3D(); bossPt.position.copy(poser(.93, 0, 0)); scene.add(bossPt);

  // caméra
  const st = { t: .015, v: 0, yaw: 0, pitch: 0, vy: 0, vp: 0, off: V3(0, 0, 0) };
  const dummy = new THREE.Object3D(), q = new THREE.Quaternion(), e3 = new THREE.Euler();
  const labels = [];
  const ordre = ['L1', 'L2', 'L3', 'L5', 'L6', 'L7'];
  const posT = { L1: .04, L2: .13, L3: .27, L5: .64, L6: .5, L7: .77, boss: .93 };
  for (const id of ordre) {
    const L = lvl(id), n = LV.indexOf(L) + 1;
    labels.push({ o: heros[id], dy: id === 'L1' ? 0 : id === 'L7' ? 0 : 6, max: 150, poi: () => allerNiveau(id),
      html: () => `<span class="pas"><span class="num">${n}</span><span>${L.t}<br><span class="et">${etoiles(stars(id))}</span></span></span><span class="tige"></span>`,
      cls: () => stars(id) ? 'ok' : '' });
  }
  { const L4 = lvl('L4'); labels.push({ o: heros.L3, dy: -6, max: 90, poi: () => allerNiveau('L4'), html: () => `<span class="pas"><span class="num">4</span><span>${L4.t}<br><span class="et">${etoiles(stars('L4'))}</span></span></span>`, cls: () => stars('L4') ? 'ok' : '' }); }
  labels.push({ o: bossPt, max: 170, poi: ouvrirBoss, html: () => `<span class="pas"><span class="num">!</span><span>Boss · vers le cœur<br><span class="et">${S.boss ? 'vaincu' : bossOpen() ? 'ouvert' : 'fermé'}</span></span></span>`, cls: () => 'boss' + (bossOpen() ? '' : ' ferme') });

  const piste = () => {
    $('#bas').innerHTML = `<div class="aide">Glisse pour regarder · pince ou flèches pour avancer · touche une cellule pour l'identifier</div>
      <div class="piste" id="piste">${Object.entries(posT).map(([id, t]) => `<span class="pt ${id === 'boss' ? 'boss' : stars(id) ? 'ok' : ''}" style="left:${t * 100}%">${id === 'boss' ? '!' : LV.indexOf(lvl(id)) + 1}</span>`).join('')}<span class="moi" id="moi"></span></div>`;
    $('#piste').onclick = (e) => { const r = e.currentTarget.getBoundingClientRect(); st.target = Math.min(.95, Math.max(.01, (e.clientX - r.left) / r.width - .03)); };
  };
  const self = {
    id: 'vessel', scene, camera, labels, titre: 'Une veinule du bras', echelle: 'Diamètre ≈ 50 µm · globules rouges 7,8 µm',
    retourIcone: IC.map, mini: [12, 45], piste,
    onDrag(dx, dy) { st.vy = -dx * .004; st.vp = dy * .004; st.yaw += st.vy; st.pitch = Math.max(-1.2, Math.min(1.2, st.pitch + st.vp)); },
    onPinch(d) { st.v += d * .00004; st.target = null; },
    avance(s) { st.v += s * .0016; st.target = null; },
    update(dt, time) {
      // déplacement
      if (st.target != null) { st.t += (st.target - st.t) * Math.min(1, dt * 1.6); if (Math.abs(st.target - st.t) < .0005) st.target = null; }
      st.t = Math.min(.95, Math.max(.01, st.t + st.v * dt * 60)); st.v *= Math.pow(.05, dt);
      if (!gestes.pts.size) { st.yaw += st.vy; st.pitch += st.vp; st.vy *= .9; st.vp *= .9; st.pitch = Math.max(-1.2, Math.min(1.2, st.pitch)); st.yaw *= Math.pow(.6, dt); st.pitch *= Math.pow(.6, dt); }
      fr(st.t, P, N, B, T);
      camera.position.copy(P).addScaledVector(N, Math.sin(time * .3) * 1.2).addScaledVector(B, Math.cos(time * .23) * 1.2);
      const dir = T.clone().multiplyScalar(-1);   // le flux va vers les t croissants : on regarde « en avant »
      dir.copy(T).applyAxisAngle(N, st.yaw); const ax = V3().crossVectors(dir, N).normalize(); dir.applyAxisAngle(ax, st.pitch);
      camera.up.copy(N); camera.lookAt(camera.position.clone().add(dir));
      lamp.position.copy(camera.position); lamp2.position.copy(camera.position).add(N.clone().multiplyScalar(10)); lamp2.target.position.copy(camera.position).add(dir);
      // cellules
      for (let i = 0; i < nGR; i++) {
        const c = cells[i]; c.t += c.sp * dt * 2.2; if (c.t > 1) c.t -= 1;
        fr(c.t, P, N, B); dummy.position.copy(P).addScaledVector(N, Math.cos(c.a) * c.r).addScaledVector(B, Math.sin(c.a) * c.r);
        c.rx += c.sx * dt; c.ry += c.sy * dt; dummy.rotation.set(c.rx, c.ry, 0); dummy.scale.setScalar(c.s); dummy.updateMatrix(); GR.setMatrixAt(i, dummy.matrix);
      }
      GR.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < nPL; i++) {
        const c = pls[i]; c.t += c.sp * dt * 2.2; if (c.t > 1) c.t -= 1;
        fr(c.t, P, N, B); dummy.position.copy(P).addScaledVector(N, Math.cos(c.a) * c.r).addScaledVector(B, Math.sin(c.a) * c.r);
        c.rx += dt * .8; dummy.rotation.set(c.rx, c.ry, 0); dummy.scale.setScalar(1); dummy.updateMatrix(); PL.setMatrixAt(i, dummy.matrix);
      }
      PL.instanceMatrix.needsUpdate = true;
      for (const l of leus) { l.t += l.sp * dt; if (l.t > 1) l.t -= 1; fr(l.t, P, N, B); l.m.position.copy(P).addScaledVector(N, Math.cos(l.a) * l.r).addScaledVector(B, Math.sin(l.a) * l.r); l.m.rotation.x += dt * .5; }
      for (const id of ['L2', 'L3', 'L6']) { heros[id].rotation.y += dt * .4; heros[id].rotation.x = Math.sin(time * .5) * .4; }
      mono.rotation.y += dt * .2;
      const moi = $('#moi'); if (moi) moi.style.left = (st.t * 100) + '%';
    },
    goto(id) { st.target = Math.max(.01, posT[id] - .035); },
  };
  return self;
}

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
  const upd = o.update;
  self.update = (dt, t) => { controls.update(); upd && upd.call(self, dt, t); };
  self.dispose = () => { controls.dispose(); scene.traverse((x) => { x.geometry && x.geometry.dispose(); if (x.material) [].concat(x.material).forEach((m) => { m.map && m.map.dispose(); m.dispose(); }); }); };
  return self;
}
const lab = (self, o, t, dy = 0) => self.labels.push({ o, t, dy });
function etapesUI(self) {
  const L = self.niv ? lvl(self.niv) : null;
  const carteNiv = L ? `<div class="carte-niv"><div class="t"><b>Niveau ${LV.indexOf(L) + 1} · ${L.t}</b><small>${etoiles(stars(L.id))}</small></div><button class="btn" id="bFiche">Fiche et défi</button></div>` : '';
  const et = self.steps ? `<div class="etapes">${self.steps.map((s, i) => `<button data-i="${i}" class="${i === (self.si || 0) ? 'on' : ''}">${s[0]}</button>`).join('')}</div>` : '';
  $('#bas').innerHTML = `${et}<div class="legende3d" id="leg">${self.steps ? self.steps[self.si || 0][1] : self.legende || ''}</div>${carteNiv}<div class="aide">Glisse pour tourner · pince pour zoomer · touche une molécule pour l'identifier</div>`;
  if (L) $('#bFiche').onclick = () => ouvrirNiveau(L.id);
  $('#bas').querySelectorAll('.etapes button').forEach((b) => b.onclick = () => { self.si = +b.dataset.i; self.onStep && self.onStep(self.si); etapesUI(self); });
}

/* ---------- 1. Le plasma ---------- */
function scenePlasma() {
  const s = micro({ id: 'plasma', niv: 'L1', titre: 'Le plasma (zoom ×1000)', echelle: '1 unité ≈ 5 nm · les cellules ne sont plus visibles', bg: 0x2a1906, fog: .012, sky: 0xfff0c8, ground: 0x3a2205, auto: true, cam: V3(0, 0, 45), max: 90,
    legende: "<b>Plasma</b> = la partie liquide du sang (55 %) : eau, électrolytes, glucose, déchets azotés (urée, acide urique, créatinine) et protéines. <b>Sérum</b> = plasma sans les protéines de la coagulation (fibrinogène consommé). L'<b>albumine</b> (bleu) fait la pression oncotique." });
  const S3 = s.scene, mov = [];
  const add = (m, k, n = 1) => { tag(m, k); m.position.set(rnd(-30, 30), rnd(-20, 20), rnd(-30, 30)); m.rotation.set(rnd(0, 6), rnd(0, 6), 0); S3.add(m); mov.push({ m, v: V3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).multiplyScalar(.6), w: rnd(-.5, .5) }); return m; };
  const gAlb = blob(1.6, .28, 3, 4, 1.4); gAlb.scale(1.25, .8, 1); const mAlb = mat(0x4f8fd6, { roughness: .45 });
  for (let i = 0; i < 42; i++) add(new THREE.Mesh(gAlb, mAlb), 'albumine');
  const mIg = mat(0xe0dce8);
  for (let i = 0; i < 8; i++) { const g = new THREE.Group(); const cap = new THREE.CapsuleGeometry(.55, 2.6, 4, 8);
    const a = new THREE.Mesh(cap, mIg); a.position.y = -1.6; g.add(a); for (const sgn of [-1, 1]) { const b = new THREE.Mesh(cap, mIg); b.position.set(sgn * 1.25, 1.2, 0); b.rotation.z = -sgn * .7; g.add(b); }
    add(g, 'igg'); if (!i) lab(s, g, 'IgG', 3); }
  const mFg = mat(0x9fd38a);
  for (let i = 0; i < 6; i++) { const g = new THREE.Group(); const rod = new THREE.Mesh(new THREE.CylinderGeometry(.25, .25, 9, 8), mFg); rod.rotation.z = Math.PI / 2; g.add(rod);
    for (const x of [-4.5, 0, 4.5]) { const n = new THREE.Mesh(new THREE.SphereGeometry(x ? .9 : 1.1, 12, 10), mFg); n.position.x = x; g.add(n); } add(g, 'fibrinogene'); if (!i) lab(s, g, 'Fibrinogène', 2); }
  for (let i = 0; i < 6; i++) { const g = new THREE.Group(); for (const sgn of [-1, 1]) { const l = new THREE.Mesh(blob(1.3, .2, 3, i + sgn), mat(0xc98bd6)); l.position.x = sgn * 1.1; g.add(l);
    const fe = new THREE.Mesh(new THREE.SphereGeometry(.35, 10, 8), mat(0xff8a20, { emissive: 0x803000 })); fe.position.set(sgn * 1.4, .9, .6); g.add(fe); } add(g, 'transferrine'); if (!i) lab(s, g, 'Transferrine + Fe³⁺', 2.4); }
  for (let i = 0; i < 4; i++) add(new THREE.Mesh(new THREE.SphereGeometry(rnd(2, 3.2), 20, 16), mat(0xf3d36a, { roughness: .35 })), 'lipo');
  const ring = new THREE.TorusGeometry(.5, .14, 6, 6); const mGl = mat(0xffffff, { emissive: 0x303030 });
  for (let i = 0; i < 30; i++) add(new THREE.Mesh(ring, mGl), 'glucose');
  const ionC = [0xffe24a, 0xb070ff, 0x5ee08a, 0xffffff]; for (let i = 0; i < 160; i++) add(new THREE.Mesh(new THREE.SphereGeometry(.22, 8, 6), mat(ionC[i % 4], { emissive: ionC[i % 4], emissiveIntensity: .6 })), 'ions');
  lab(s, mov[0].m, 'Albumine', 2.2);
  s.update = function (dt) { s.controls.update(); for (const o of mov) { o.m.position.addScaledVector(o.v, dt); o.m.rotation.y += o.w * dt; for (const ax of ['x', 'y', 'z']) if (Math.abs(o.m.position[ax]) > 32) o.v[ax] *= -1; } };
  return s;
}

/* ---------- 2. Le globule rouge (taille, coupe, érythropoïèse) ---------- */
function sceneErythro() {
  const s = micro({ id: 'erythro', niv: 'L2', titre: 'Un érythrocyte de près', echelle: 'Disque biconcave · 7,8 µm × 2,4 µm', bg: 0x14040a, cam: V3(0, 6, 26), min: 8, max: 60, target: V3(0, 0, 0),
    steps: [
      ['Forme', "Disque <b>biconcave</b> de 7,8 µm, 2,4 µm au bord, 0,8 µm au centre : grande surface pour les échanges, très déformable pour passer dans les capillaires."],
      ['Coupe', "En coupe : <b>pas de noyau, pas de mitochondries</b>, rempli d'hémoglobine (88 % du volume). Il vit <b>120 jours</b>."],
      ['Réticulocyte', "Le <b>réticulocyte</b> (à droite) a encore un réseau d'ARN. Réticulocytes ↑ = anémie <b>régénérative</b> (hémorragie, hémolyse)."],
      ['Érythropoïèse', "Dans la <b>moelle</b>, sous l'<b>EPO</b> (rein) : proérythroblaste → érythroblastes → le noyau est expulsé → réticulocyte → érythrocyte. Il faut du <b>fer</b>, de la <b>B12</b> et des <b>folates</b>."],
    ] });
  const S3 = s.scene;
  const gr = tag(new THREE.Mesh(geoGR(), matGR()), 'erythro'); gr.scale.setScalar(1.5); S3.add(gr);
  const coupe = tag(new THREE.Mesh(geoGR(true), new THREE.MeshPhysicalMaterial({ color: 0xb0141c, roughness: .45, side: THREE.DoubleSide, sheen: 1, sheenColor: new THREE.Color(0xff6060) })), 'erythro');
  coupe.scale.setScalar(1.5); coupe.visible = false; S3.add(coupe);
  const cap = new THREE.Mesh(new THREE.ShapeGeometry((() => { const sh = new THREE.Shape(); const Rr = 3.91; const z = (x) => 0.5 * Math.sqrt(Math.max(0, 1 - x * x)) * (0.81 + 7.83 * x * x - 4.39 * x ** 4);
    sh.moveTo(-Rr, 0); for (let i = -40; i <= 40; i++) { const x = i / 40; sh.lineTo(x * Rr, z(Math.abs(x))); } for (let i = 40; i >= -40; i--) { const x = i / 40; sh.lineTo(x * Rr, -z(Math.abs(x))); } return sh; })()),
    new THREE.MeshStandardMaterial({ color: 0x8a0a12, side: THREE.DoubleSide, roughness: .8 }));
  cap.rotation.set(0, Math.PI / 2, 0); coupe.add(cap);
  const reti = tag(new THREE.Mesh(geoGR(), new THREE.MeshPhysicalMaterial({ color: 0x9a3a60, roughness: .45, sheen: 1, sheenColor: new THREE.Color(0xff9ad0) })), 'reticulo'); reti.scale.setScalar(1.65); reti.position.set(16, 0, 0); reti.visible = false; S3.add(reti);
  for (let i = 0; i < 40; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(.18, 6, 5), mat(0x3a60c0)); d.position.set(rnd(-2.6, 2.6), rnd(-.4, .4), rnd(-2.6, 2.6)); reti.add(d); }
  // règle 7,8 µm
  const regle = new THREE.Group(); const barre = new THREE.Mesh(new THREE.BoxGeometry(7.8 * 1.5, .15, .15), mat(0xffffff, { emissive: 0x888888 })); regle.add(barre); regle.position.set(0, -5, 0); S3.add(regle);
  lab(s, regle, '7,8 µm', -1);
  // érythropoïèse
  const lignee = new THREE.Group(); lignee.visible = false; S3.add(lignee);
  const stades = [['proerythro', 7, 4.8, 0x5a6fc0, 'Proérythroblaste'], ['erythroblaste', 6, 3.8, 0x7a6ab0, 'Érythroblaste basophile'], ['erythroblaste', 5, 2.6, 0xa0607a, 'Érythroblaste polychromatophile'], ['erythroblaste', 4.2, 1.6, 0xb84050, 'Érythroblaste acidophile'], ['reticulo', 0, 0, 0, 'Réticulocyte'], ['erythro', 0, 0, 0, 'Érythrocyte']];
  stades.forEach(([k, r, rn, c, nom], i) => {
    let m;
    if (r) { m = tag(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), new THREE.MeshPhysicalMaterial({ color: c, transparent: true, opacity: .55, roughness: .5 })), k);
      const nu = new THREE.Mesh(new THREE.SphereGeometry(rn, 24, 18), mat(0x2a2f8a, { roughness: .7 })); m.add(nu); }
    else { m = tag(new THREE.Mesh(geoGR(), matGR()), k); m.scale.setScalar(1.4); }
    m.position.set(-34 + i * 13.5, -18, 0); lignee.add(m); lab(s, m, nom, -8);
  });
  s.onStep = (i) => { gr.visible = i !== 1; coupe.visible = i === 1; reti.visible = i === 2; lignee.visible = i === 3;
    if (i === 3) { s.controls.target.set(0, -14, 0); s.camera.position.set(0, -4, 62); s.controls.maxDistance = 90; } else { s.controls.target.set(0, 0, 0); } };
  s.update = function (dt) { s.controls.update(); gr.rotation.y += dt * .3; reti.rotation.y += dt * .3; lignee.children.forEach((m) => m.rotation.y += dt * .3); };
  return s;
}

/* ---------- 3. Intérieur du globule rouge ---------- */
function geoHbMini() {
  const gs = [];
  for (const [x, y, z] of [[.9, .9, 0], [-.9, .9, 0], [.9, -.9, 0], [-.9, -.9, 0]]) { const g = new THREE.SphereGeometry(1.05, 10, 8); g.translate(x, y, z * 1 + (x * y > 0 ? .4 : -.4)); g.scale(.45, .45, .45); gs.push(g); }
  const n = gs.reduce((a, g) => a + g.attributes.position.count, 0); const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); const idx = []; let o = 0;
  for (const g of gs) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); for (const i of g.index.array) idx.push(i + o); o += g.attributes.position.count; }
  const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); G.setIndex(idx); return G;
}
function sceneGR() {
  const s = micro({ id: 'gr', niv: 'L3', titre: "À l'intérieur d'un globule rouge", echelle: '1 unité ≈ 5 nm · hémoglobine ≈ 6,5 nm', bg: 0x3a050b, fog: .02, sky: 0xffb0a0, ground: 0x300408, cam: V3(0, 0, 22), max: 45, auto: true,
    steps: [
      ['Hémoglobine', "Le GR est un sac d'<b>hémoglobine</b> (≈ 270 millions de molécules). Pas de mitochondries : tout son ATP vient de la <b>glycolyse anaérobie</b> ; le glucose entre <b>sans insuline</b>."],
      ['2,3-BPG', "Le <b>2,3-BPG</b> (jaune) se forme à partir du 1,3-BPG (shunt de Rapoport-Luebering) : le GR « perd » un ATP. Il se loge dans l'hémoglobine désoxygénée et l'aide à <b>lâcher l'O₂</b> dans les tissus."],
      ['Stress oxydatif', "Transporter l'O₂ crée des <b>radicaux</b> : O₂⁻ → (SOD) <b>H₂O₂</b> (étincelles). Le <b>glutathion</b> (vert) les détruit : 2 GSH → GSSG (glutathion peroxydase)."],
      ['NADPH et G6PD', "La <b>voie des pentoses</b> (≈ 10 % du glucose) fait du <b>NADPH</b> grâce à la <b>G6PD</b> : il régénère le glutathion (glutathion réductase). Déficit en G6PD : hémolyse après fèves, aspirine, sulfamides."],
    ] });
  const S3 = s.scene;
  const paroi = new THREE.Mesh(geoGR(), new THREE.MeshStandardMaterial({ color: 0xc02030, side: THREE.BackSide, roughness: .7, transparent: true, opacity: .9 })); paroi.scale.setScalar(16); S3.add(tag(paroi, 'erythro'));
  const N = 900, HB = new THREE.InstancedMesh(geoHbMini(), new THREE.MeshPhysicalMaterial({ color: 0xc01a26, roughness: .45, sheen: .6, sheenColor: new THREE.Color(0xff8080) }), N);
  const hb = [], dm = new THREE.Object3D();
  for (let i = 0; i < N; i++) { hb.push({ p: V3(rnd(-40, 40), rnd(-7, 7), rnd(-40, 40)), r: V3(rnd(0, 6), rnd(0, 6), 0), v: V3(rnd(-1, 1), rnd(-.5, .5), rnd(-1, 1)) }); }
  HB.userData.kAt = () => 'hb'; S3.add(HB);
  const mk = (n, g, c, k) => { const I = new THREE.InstancedMesh(g, mat(c, { emissive: c, emissiveIntensity: .35 }), n); const a = []; for (let i = 0; i < n; i++) a.push({ p: V3(rnd(-30, 30), rnd(-7, 7), rnd(-30, 30)), v: V3(rnd(-2, 2), rnd(-1, 1), rnd(-2, 2)) }); I.userData.kAt = () => k; I.visible = false; S3.add(I); return [I, a]; };
  const [BPG, bpg] = mk(120, new THREE.TetrahedronGeometry(.45), 0xffd23a, 'bpg');
  const [GSH, gsh] = mk(120, new THREE.OctahedronGeometry(.45), 0x4be08a, 'gsh');
  const [ROS, ros] = mk(90, new THREE.IcosahedronGeometry(.25, 0), 0xffffff, 'ros');
  // porte vers l'hémoglobine (niveau 4)
  const porte = new THREE.Object3D(); porte.position.set(6, 2, 4); S3.add(porte);
  s.labels.push({ o: porte, max: 60, poi: () => allerNiveau('L4'), html: () => `<span class="pas"><span class="num">4</span><span>Zoom sur une hémoglobine<br><span class="et">${etoiles(stars('L4'))}</span></span></span>`, cls: () => stars('L4') ? 'ok' : '' });
  s.onStep = (i) => { BPG.visible = i === 1; GSH.visible = ROS.visible = i >= 2; };
  const move = (I, a, dt, sc = 1) => { for (let i = 0; i < a.length; i++) { const o = a[i]; o.p.addScaledVector(o.v, dt * sc); for (const ax of ['x', 'z']) if (Math.abs(o.p[ax]) > 40) o.v[ax] *= -1; if (Math.abs(o.p.y) > 8) o.v.y *= -1;
    dm.position.copy(o.p); dm.rotation.set(o.r ? o.r.x += dt * .3 : dm.rotation.x + dt, o.r ? o.r.y : 0, 0); dm.scale.setScalar(1); dm.updateMatrix(); I.setMatrixAt(i, dm.matrix); } I.instanceMatrix.needsUpdate = true; };
  s.update = function (dt, t) { s.controls.update(); move(HB, hb, dt, .5); if (BPG.visible) move(BPG, bpg, dt); if (GSH.visible) { move(GSH, gsh, dt); move(ROS, ros, dt, 1.5); ROS.material.emissiveIntensity = .5 + .5 * Math.sin(t * 9); } };
  return s;
}

/* ---------- 4. L'hémoglobine ---------- */
function hemeGroup() {
  const g = new THREE.Group(); const mPy = mat(0x7a2a4a, { roughness: .35 }), mBr = mat(0xc06080);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; const p = new THREE.Mesh(new THREE.CylinderGeometry(.55, .55, .14, 5), mPy); p.position.set(Math.cos(a) * 1.25, 0, Math.sin(a) * 1.25); g.add(p);
    const b = new THREE.Mesh(new THREE.SphereGeometry(.16, 8, 6), mBr); b.position.set(Math.cos(a + Math.PI / 4) * 1.55, 0, Math.sin(a + Math.PI / 4) * 1.55); g.add(b);
    const n = new THREE.Mesh(new THREE.SphereGeometry(.13, 8, 6), mat(0x4060ff)); n.position.set(Math.cos(a) * .72, 0, Math.sin(a) * .72); g.add(n); }
  const fe = tag(new THREE.Mesh(new THREE.SphereGeometry(.34, 16, 12), mat(0xff8a20, { emissive: 0x9a4000, metalness: .3 })), 'fe'); g.add(fe); g.userData.fe = fe;
  for (const sg of [-1, 1]) { const pr = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 1.2, 6), mat(0xd0d0d0)); pr.position.set(sg * .7, -.5, -1.6); pr.rotation.x = .5; g.add(pr); }
  tag(g, 'heme'); return g;
}
function sceneHb() {
  const s = micro({ id: 'hb', niv: 'L4', titre: "Une molécule d'hémoglobine", echelle: '≈ 6,5 nm · 64,5 kDa · α2β2', bg: 0x10070c, cam: V3(0, 4, 26), min: 9, max: 55,
    steps: [
      ['Désoxy (T)', "Forme <b>tendue (T)</b>, sans O₂ : le <b>2,3-BPG</b> (jaune) est logé entre les deux chaînes <b>β</b>. Chaque sous-unité porte un <b>hème</b> avec un <b>Fe²⁺</b>."],
      ['Oxygéner', "L'O₂ se fixe sur le Fe²⁺ (<b>oxygénation, pas oxydation</b>). La 1re fixation facilite les suivantes : <b>effet coopératif</b>, forme <b>relâchée (R)</b>, courbe <b>sigmoïde</b>. Le 2,3-BPG est expulsé."],
      ['Effet Bohr', "Dans le muscle à l'effort : pH ↓, CO₂ ↑, température ↑, 2,3-BPG ↑ → l'Hb <b>lâche l'O₂</b> (courbe déplacée vers la droite). 80 % du CO₂ repart en <b>bicarbonate</b> (anhydrase carbonique)."],
      ['CO', "Le <b>monoxyde de carbone</b> (gris) prend la place de l'O₂ avec une affinité ~200 fois plus forte : <b>carboxyhémoglobine</b>. Traitement : O₂, caisson hyperbare."],
      ['Méthémoglobine', "Fer oxydé en <b>Fe³⁺</b> (brun) : <b>méthémoglobine</b>, ne fixe plus l'O₂. Drépanocytose : chaîne β mutée (HbS)."],
    ] });
  const S3 = s.scene;
  const sub = [['globA', 0xd8384a, V3(-3.2, 2.4, 1.2), 'α1'], ['globA', 0xd8384a, V3(3.2, -2.4, 1.2), 'α2'], ['globB', 0xf08a8a, V3(3.2, 2.4, -1.2), 'β1'], ['globB', 0xf08a8a, V3(-3.2, -2.4, -1.2), 'β2']];
  const units = [], hemes = [], o2 = [];
  sub.forEach(([k, c, p, nom], i) => {
    const m = tag(new THREE.Mesh(blob(3.4, .16, 5, i * 7 + 3, 1.6), new THREE.MeshPhysicalMaterial({ color: c, roughness: .55, sheen: .8, sheenColor: new THREE.Color(0xffe0e0), clearcoat: .2 })), k);
    m.position.copy(p); S3.add(m); units.push({ m, p0: p.clone() }); lab(s, m, nom, 4.4);
    const h = hemeGroup(); const out = p.clone().normalize(); h.position.copy(p).addScaledVector(out, 2.9); h.lookAt(h.position.clone().add(out)); h.rotateX(Math.PI / 2); S3.add(h); hemes.push(h);
    const o = tag(new THREE.Group(), 'o2'); for (const sg of [-1, 1]) { const a = new THREE.Mesh(new THREE.SphereGeometry(.45, 14, 10), mat(0xff3030, { emissive: 0x500000 })); a.position.x = sg * .42; o.add(a); }
    o.userData.dest = h.position.clone().addScaledVector(out, .9); o.userData.from = h.position.clone().addScaledVector(out, 16).add(V3(rnd(-4, 4), rnd(-4, 4), 0)); o.position.copy(o.userData.from); o.visible = false; S3.add(o); o2.push(o);
  });
  lab(s, hemes[0], 'Hème (Fe²⁺)', 1.2);
  const bpg = tag(new THREE.Mesh(new THREE.TetrahedronGeometry(.9), mat(0xffd23a, { emissive: 0x5a4000 })), 'bpg'); S3.add(bpg); lab(s, bpg, '2,3-BPG', 1.4);
  const co = tag(new THREE.Group(), 'co'); co.add(new THREE.Mesh(new THREE.SphereGeometry(.42, 12, 10), mat(0x444444))); { const ox = new THREE.Mesh(new THREE.SphereGeometry(.45, 12, 10), mat(0xff3030)); ox.position.x = .8; co.add(ox); }
  co.visible = false; S3.add(co);
  let step = 0, k = 0;
  s.onStep = (i) => { step = i; k = 0; };
  s.update = function (dt, t) {
    s.controls.update(); k = Math.min(1, k + dt * .35);
    const oxy = step === 1 || step === 2;
    o2.forEach((o, i) => {
      if (step === 1) { const ki = Math.max(0, Math.min(1, (k - i * (0.28 - i * .06)) * 2.2)); o.visible = true; o.position.lerpVectors(o.userData.from, o.userData.dest, 1 - Math.pow(1 - ki, 3)); }
      else if (step === 2) { const ki = Math.max(0, Math.min(1, (k - i * .1) * 2)); o.visible = true; o.position.lerpVectors(o.userData.dest, o.userData.from, ki); }
      else o.visible = false;
    });
    const Rx = step === 1 ? Math.min(1, k * 1.5) : 0;
    units.forEach((u, i) => { u.m.position.copy(u.p0).multiplyScalar(1 - Rx * .08); u.m.rotation.z = (i % 2 ? 1 : -1) * Rx * .13; });
    bpg.visible = step === 0 || step === 2; bpg.position.set(0, step === 2 ? Math.min(0, -8 + k * 8) : 0, 0); bpg.rotation.y += dt;
    co.visible = step === 3; if (co.visible) { co.position.lerpVectors(V3(0, 14, 10), hemes[2].position.clone().add(V3(0, .8, 0)), Math.min(1, k * 2)); }
    hemes.forEach((h) => h.userData.fe.material.color.set(step === 4 ? 0x7a4a20 : 0xff8a20));
    S3.rotation.y += dt * .08;
  };
  s.onStep(0);
  return s;
}

/* ---------- 5. Rate : macrophage et dégradation de l'hémoglobine ---------- */
function sceneMacro() {
  const s = micro({ id: 'macro', niv: 'L5', titre: 'Dans la rate : un macrophage', echelle: 'Macrophage ≈ 25 µm', bg: 0x1d0610, fog: .012, cam: V3(0, 6, 46), min: 14, max: 80, mini: [40, 48],
    steps: [
      ['Phagocytose', "Après <b>120 jours</b>, le GR vieilli (pâle, déformé) est capté par un <b>macrophage</b> de la rate (aussi foie, moelle)."],
      ['Hème → biliverdine', "La globine est recyclée en acides aminés. L'<b>hème oxygénase</b> ouvre l'hème : <b>biliverdine</b> (verte) + <b>Fe</b> (recyclé par la transferrine) + <b>CO</b>."],
      ['Bilirubine', "La biliverdine réductase (NADPH) donne la <b>bilirubine</b> (jaune), peu soluble : elle part dans le sang liée à l'<b>albumine</b> = bilirubine <b>libre / non conjuguée / indirecte</b>."],
      ['Foie', "Dans le foie : <b>glucuroconjugaison</b> (UDP-glucuronyltransférase) → bilirubine <b>conjuguée / directe</b>, soluble, sécrétée dans la bile."],
      ['Intestin', "Les bactéries la transforment en urobilinogène → <b>stercobiline</b> (selles brunes) ; une partie est réabsorbée et éliminée dans l'urine (<b>urobiline</b>). Hémolyse : non conjuguée ↑ ; obstruction : conjuguée ↑."],
    ] });
  const S3 = s.scene;
  const mac = tag(new THREE.Mesh(blob(10, .09, 5, 5, 1.5), new THREE.MeshPhysicalMaterial({ color: 0xe8d6c0, roughness: .6, transparent: true, opacity: .42, sheen: .7, sheenColor: new THREE.Color(0xffffff), depthWrite: false })), 'macro');
  S3.add(mac);
  const noyau = new THREE.Mesh(blob(4.5, .2, 4, 2), mat(0x6a5aa0)); noyau.position.set(-4, 3, -3); S3.add(noyau);
  const vieux = tag(new THREE.Mesh(geoGR(), new THREE.MeshStandardMaterial({ color: 0xb86a6a, roughness: .8 })), 'erythro'); vieux.scale.setScalar(1.4); S3.add(vieux);
  const parts = (n, c, k) => { const g = new THREE.Group(); for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.42, 10, 8), mat(c, { emissive: c, emissiveIntensity: .5 })); m.userData.v = V3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)); g.add(m); } tag(g, k); g.visible = false; S3.add(g); return g; };
  const verte = parts(40, 0x3ac060, 'biliverdine'), jaune = parts(40, 0xf5c020, 'bilirubine'), fer = parts(14, 0xff8a20, 'fe');
  const alb = []; for (let i = 0; i < 10; i++) { const a = tag(new THREE.Mesh(blob(1.4, .25, 3, i), mat(0x4f8fd6)), 'albumine'); a.visible = false; S3.add(a); alb.push(a); }
  lab(s, mac, 'Macrophage', 13); let step = 0, k = 0;
  s.onStep = (i) => { step = i; k = 0; };
  s.update = function (dt, t) {
    s.controls.update(); k = Math.min(1, k + dt * .4);
    vieux.visible = step === 0; if (step === 0) vieux.position.lerpVectors(V3(26, 4, 6), V3(4, -2, 3), k);
    vieux.rotation.y += dt * .5;
    verte.visible = step === 1; jaune.visible = step >= 2; fer.visible = step === 1;
    for (const [g, sc, r0] of [[verte, 1, 5], [jaune, step >= 2 ? 1 : 0, step >= 2 ? 8 + k * 14 : 4], [fer, 1, 6]]) g.children.forEach((m, i) => { const a = i * 2.4 + t * .3; m.position.set(Math.cos(a) * r0 * (.5 + (i % 5) / 6), Math.sin(i * 1.3 + t * .4) * r0 * .6, Math.sin(a) * r0 * (.5 + (i % 3) / 4)); });
    if (step === 1) fer.children.forEach((m, i) => m.position.add(V3(k * 18, 0, 0)));
    alb.forEach((a, i) => { a.visible = step === 2; if (a.visible) { const m = jaune.children[i]; a.position.copy(m.position).add(V3(1, 0, 0)); a.rotation.y += dt; } });
    jaune.children.forEach((m) => m.material.color.set(step >= 3 ? 0xffe880 : 0xf5c020));
    mac.rotation.y += dt * .05;
  };
  return s;
}

/* ---------- 6. Membrane : groupes sanguins ---------- */
function sceneMembrane() {
  const s = micro({ id: 'membrane', niv: 'L6', titre: 'La membrane du globule rouge', echelle: 'Bicouche ≈ 5 nm · antigènes ABO et Rhésus', bg: 0x0e1420, cam: V3(0, 22, 34), min: 10, max: 70, target: V3(0, 2, 0), sky: 0xe0f0ff, ground: 0x302030,
    steps: [
      ['Groupe O', "Antigène <b>H</b> : chaîne d'oses terminée par le <b>fucose</b> (triangle rouge). Plasma : anticorps <b>anti-A et anti-B</b>. Donneur universel de GR."],
      ['Groupe A', "Le gène A ajoute une <b>N-acétylgalactosamine</b> (carré jaune). Plasma : anticorps <b>anti-B</b>."],
      ['Groupe B', "Le gène B ajoute un <b>galactose</b> (rond jaune). Plasma : anticorps <b>anti-A</b>."],
      ['Groupe AB', "Les deux antigènes (gènes codominants). Pas d'anticorps anti-A ni anti-B : receveur universel de GR."],
      ['Rhésus', "La <b>protéine D</b> (vert) traverse la membrane : présente = <b>Rh+</b> (85 %). Un Rh− fait des <b>anti-D</b> (IgG) seulement après contact (grossesse Rh+, transfusion)."],
    ] });
  const S3 = s.scene;
  const n = 30, sp = 1.25, nL = n * n * 2;
  const tetes = new THREE.InstancedMesh(new THREE.SphereGeometry(.55, 10, 8), mat(0x6fa8e0, { roughness: .4 }), nL);
  const queues = new THREE.InstancedMesh(new THREE.CylinderGeometry(.13, .13, 2.1, 5), mat(0xe8d070, { roughness: .6 }), nL * 2);
  tetes.userData.kAt = () => 'lipide'; queues.userData.kAt = () => 'lipide';
  const dm = new THREE.Object3D(); let a = 0, b = 0;
  for (let l = 0; l < 2; l++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x = (i - n / 2) * sp + (j % 2) * .5, z = (j - n / 2) * sp, sg = l ? -1 : 1;
    dm.position.set(x, sg * 2.6, z); dm.rotation.set(0, 0, 0); dm.updateMatrix(); tetes.setMatrixAt(a++, dm.matrix);
    for (const o of [-.22, .22]) { dm.position.set(x + o, sg * 1.35, z); dm.rotation.set(0, 0, rnd(-.12, .12)); dm.updateMatrix(); queues.setMatrixAt(b++, dm.matrix); }
  }
  S3.add(tetes, queues);
  const mGlc = mat(0x2a66d8), mGal = mat(0xf5d020), mFuc = mat(0xe23030);
  const cube = new THREE.BoxGeometry(.95, .95, .95), sph = new THREE.SphereGeometry(.56, 14, 10), tri = new THREE.ConeGeometry(.6, 1, 3);
  const chaines = [];
  const pos = [[-9, -6], [-2, -10], [6, -7], [-12, 4], [0, 1], [9, 4], [-6, 11], [4, 11], [13, -1]];
  pos.forEach(([x, z], i) => {
    const g = tag(new THREE.Group(), 'antigene'); g.position.set(x, 0, z); S3.add(g);
    const prot = new THREE.Mesh(new THREE.CylinderGeometry(.6, .6, 6.5, 10), mat(0xc05a70, { roughness: .45 })); prot.position.y = .6; g.add(prot);
    const pts = [[0, 4.4, 0, cube, mGlc, 'glcnac'], [0, 5.6, 0, sph, mGal, 'gal'], [.9, 6.4, 0, tri, mFuc, 'fuc']];
    pts.forEach(([px, py, pz, ge, m, k]) => { const o = tag(new THREE.Mesh(ge, m), k); o.position.set(px, py, pz); if (k === 'fuc') o.rotation.z = -.9; g.add(o); });
    const A = tag(new THREE.Mesh(cube, mGal), 'galnac'); A.position.set(-.5, 6.9, 0); g.add(A);
    const B = tag(new THREE.Mesh(sph, mGal), 'gal'); B.position.set(-.5, 6.9, 0); g.add(B);
    chaines.push({ A, B, i }); if (!i) lab(s, g, 'Antigène', 8.4);
  });
  const rh = tag(new THREE.Group(), 'rh'); for (let i = 0; i < 12; i++) { const h = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, 6, 8), mat(0x40c070)); const a2 = i / 12 * 6.283; h.position.set(Math.cos(a2) * 1.5, 0, Math.sin(a2) * 1.5); h.rotation.z = .15; rh.add(h); }
  rh.position.set(-4, 0, -1); S3.add(rh); lab(s, rh, 'Protéine Rh D', 4);
  const ac = tag(new THREE.Group(), 'anticorps'); const mAc = mat(0xd0d0f0); { const cap = new THREE.CapsuleGeometry(.4, 2, 4, 8); const t0 = new THREE.Mesh(cap, mAc); t0.position.y = -1.3; ac.add(t0); for (const sg of [-1, 1]) { const br = new THREE.Mesh(cap, mAc); br.position.set(sg * .95, .9, 0); br.rotation.z = -sg * .7; ac.add(br); } }
  ac.position.set(8, 12, 6); S3.add(ac); const acLab = { o: ac, t: 'Anti-A et anti-B', dy: 2.6 }; s.labels.push(acLab);
  let step = 0;
  s.onStep = (i) => { step = i; chaines.forEach((c) => { c.A.visible = i === 1 || (i === 3 && c.i % 2 === 0); c.B.visible = i === 2 || (i === 3 && c.i % 2 === 1); });
    acLab.t = ['Anti-A et anti-B', 'Anti-B', 'Anti-A', "Pas d'anti-A ni d'anti-B", 'Anti-D (si Rh−, après contact)'][i]; ac.visible = i !== 3; rh.visible = i === 4 || i < 4; };
  s.onStep(0);
  s.update = function (dt, t) { s.controls.update(); ac.position.y = 12 + Math.sin(t) * .8; ac.rotation.y += dt * .6; rh.rotation.y += dt * .2; };
  return s;
}

/* ---------- 7. Brèche : hémostase ---------- */
function sceneBreche() {
  const s = micro({ id: 'breche', niv: 'L7', titre: 'Une brèche dans la paroi', echelle: 'Paroi vasculaire · plaquettes 2-3 µm', bg: 0x2a0407, fog: .01, cam: V3(0, 18, 40), min: 12, max: 80, target: V3(0, 0, 0), sky: 0xffc8b8,
    steps: [
      ['Brèche', "Le vaisseau est lésé : le <b>collagène</b> du sous-endothélium (orange) est exposé au sang."],
      ['Vasoconstriction', "<b>1.</b> Le vaisseau se contracte tout de suite : moins de sang perdu."],
      ['Adhésion', "<b>2.</b> Le <b>facteur von Willebrand</b> (fils blancs) relie le collagène à la <b>GPIb</b> des plaquettes : elles s'accrochent."],
      ['Activation', "<b>3.</b> Les plaquettes deviennent <b>sphériques avec des pseudopodes</b>, libèrent leurs granules (<b>ADP</b>, sérotonine) et fabriquent du <b>TXA₂</b> (COX-1 : cible de l'aspirine)."],
      ['Agrégation', "<b>4.</b> Le <b>fibrinogène</b> fait des ponts entre les <b>GPIIb/IIIa</b> activées : <b>clou plaquettaire</b>, encore fragile."],
      ['Coagulation', "<b>5.</b> Cascade : facteur tissulaire + VIIa → Xa-Va → <b>thrombine</b> → fibrinogène → <b>fibrine</b> (XIIIa). Le réseau emprisonne des GR : caillot solide. Vitamine K : II, VII, IX, X."],
      ['Fibrinolyse', "<b>6.</b> Après 48-72 h : le <b>t-PA</b> active le plasminogène en <b>plasmine</b>, qui coupe la fibrine en <b>D-dimères</b>."],
    ] });
  const S3 = s.scene;
  const tex = texEndo(); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(2, 2);
  const mParoi = new THREE.MeshStandardMaterial({ map: tex, bumpMap: tex, bumpScale: 2, roughness: .6 });
  const gauche = tag(new THREE.Mesh(new THREE.BoxGeometry(30, 4, 40), mParoi), 'endo'), droite = tag(new THREE.Mesh(new THREE.BoxGeometry(30, 4, 40), mParoi), 'endo');
  S3.add(gauche, droite);
  const fond = new THREE.Mesh(new THREE.BoxGeometry(80, 3, 40), mat(0x8a3a2a, { roughness: .9 })); fond.position.y = -4; S3.add(fond);
  const coll = new THREE.Group(); for (let i = 0; i < 22; i++) { const c = new THREE.CatmullRomCurve3([V3(rnd(-6, 6), -3, rnd(-16, 16)), V3(rnd(-6, 6), rnd(-1, 1), rnd(-16, 16)), V3(rnd(-6, 6), -2.6, rnd(-16, 16))]);
    coll.add(tag(new THREE.Mesh(new THREE.TubeGeometry(c, 20, .4, 6), mat(0xe8a048, { emissive: 0x301500 })), 'collagene')); } S3.add(coll);
  const vwf = new THREE.Group(); for (let i = 0; i < 14; i++) { const x = rnd(-5, 5), z = rnd(-14, 14); const c = new THREE.CatmullRomCurve3([V3(x, -2, z), V3(x + rnd(-2, 2), 2, z + rnd(-2, 2)), V3(x + rnd(-3, 3), 5, z + rnd(-3, 3))]);
    vwf.add(tag(new THREE.Mesh(new THREE.TubeGeometry(c, 16, .12, 5), mat(0xf4f4f4, { emissive: 0x404040 })), 'vwf')); } S3.add(vwf);
  const plq = []; const gRepos = new THREE.SphereGeometry(1, 14, 8); gRepos.scale(1.35, .38, 1.35);
  for (let i = 0; i < 34; i++) { const g = new THREE.Group(); const r = new THREE.Mesh(gRepos, mat(0xdcbada)); const ac = new THREE.Mesh(spiky(1.2, 9, i), mat(0xeac6f0, { emissive: 0x2a102a })); ac.visible = false; g.add(r, ac);
    tag(g, 'plaquette'); const from = V3(rnd(-30, 30), rnd(10, 22), rnd(-16, 16)); const to = V3(rnd(-4.5, 4.5), rnd(-1, 3.5) + (i > 18 ? 2.5 : 0), rnd(-13, 13)); g.position.copy(from); S3.add(g); plq.push({ g, r, ac, from, to }); }
  const fib = new THREE.Group(); for (let i = 0; i < 70; i++) { const a = V3(rnd(-7, 7), rnd(-2, 7), rnd(-15, 15)), b = V3(rnd(-7, 7), rnd(-2, 7), rnd(-15, 15)); fib.add(tag(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 1, .1, 4), mat(0xfff6dc, { emissive: 0x403a20 })), 'fibrine')); } S3.add(fib);
  const pris = []; for (let i = 0; i < 6; i++) { const m = tag(new THREE.Mesh(geoGR(), matGR()), 'erythro'); m.position.set(rnd(-5, 5), rnd(1, 6), rnd(-12, 12)); m.rotation.set(rnd(0, 3), rnd(0, 3), 0); S3.add(m); pris.push(m); }
  const plasmine = []; for (let i = 0; i < 12; i++) { const m = tag(new THREE.Mesh(blob(.9, .2, 2, i), mat(0x40d0e0, { emissive: 0x104050 })), 'plasmine'); m.visible = false; S3.add(m); plasmine.push(m); }
  let step = 0, k = 0; s.onStep = (i) => { step = i; k = 0; };
  s.update = function (dt, t) {
    s.controls.update(); k = Math.min(1, k + dt * .5);
    const gap = step === 0 ? 9 : step === 1 ? 9 - 3 * k : 6;
    gauche.position.set(-15 - gap / 2, 0, 0); droite.position.set(15 + gap / 2, 0, 0);
    vwf.visible = step >= 2 && step < 6;
    plq.forEach((p, i) => { const adh = step >= 2 ? (step === 2 ? k : 1) : 0; const vis = step >= 2 || true;
      p.g.position.lerpVectors(p.from.clone().add(V3(Math.sin(t + i) * 2, 0, 0)), p.to, step === 4 && i > 18 ? 1 : (i > 18 ? (step >= 4 ? k : 0) : adh));
      if (i > 18 && step < 4) p.g.position.copy(p.from).add(V3(Math.sin(t * .8 + i) * 3, 0, Math.cos(t * .6 + i) * 2));
      const act = step >= 3; p.r.visible = !act; p.ac.visible = act; p.g.visible = vis; p.g.rotation.y += dt * (act ? .2 : 1); });
    fib.visible = step >= 5; fib.children.forEach((f, i) => { f.visible = step === 5 ? i / fib.children.length < k : step === 6 ? i / fib.children.length > k : true; });
    pris.forEach((m) => m.visible = step === 5 || (step === 6 && k < .6));
    plasmine.forEach((m, i) => { m.visible = step === 6; m.position.set(Math.cos(t + i) * 6, 3 + Math.sin(t * 1.3 + i) * 3, -14 + i * 2.4); });
  };
  return s;
}

const SCENES = { plasma: scenePlasma, erythro: sceneErythro, gr: sceneGR, hb: sceneHb, macro: sceneMacro, membrane: sceneMembrane, breche: sceneBreche };

/* =========================================================
   NAVIGATION
   ========================================================= */
function activer(sc) {
  if (cur && cur.micro) cur.dispose();
  viderLabels(); for (const l of sc.labels) l.el = null;
  cur = sc; taille();
  $('#tLieu').textContent = sc.titre; $('#tEchelle').textContent = sc.echelle;
  $('#bRetour').innerHTML = sc.retourIcone; $('#bRetour').setAttribute('aria-label', sc.micro ? 'Dézoomer' : 'Retour à la carte');
  $('#depG').style.display = sc.micro ? 'none' : '';
  const [mx, my] = sc.mini || [12, 45]; $('#miniPt').setAttribute('cx', mx); $('#miniPt').setAttribute('cy', my);
  if (sc.micro) etapesUI(sc); else sc.piste();
}
function transition(fn) { const v = $('#voile'); v.classList.add('on'); setTimeout(() => { fn(); setTimeout(() => v.classList.remove('on'), 60); }, 330); bip(420, .18); }
function entrerScene(nom) {
  transition(() => { const sc = SCENES[nom](); if (cur && !cur.micro) pile = ['vessel']; else if (cur) pile.push(cur.id); activer(sc); });
}
function allerNiveau(id) {
  const L = lvl(id);
  if (cur && cur.id === L.scene) { ouvrirNiveau(id); return; }
  entrerScene(L.scene);
}
function majHUD() { if (!cur) return; if (cur.micro) etapesUI(cur); else cur.piste(); }
$('#bRetour').onclick = () => {
  fermeFeuille();
  if (!cur || !cur.micro) { $('#monde').classList.remove('on'); $('#carte').classList.add('on'); dessineCarte(); actif = false; return; }
  const prev = pile.pop();
  transition(() => { if (!prev || prev === 'vessel') activer(vesselCache); else { activer(SCENES[prev]()); } });
};
$('#bAv').onclick = () => cur && cur.avance && cur.avance(1);
$('#bRe').onclick = () => cur && cur.avance && cur.avance(-1);
let actif = false;
function ouvrirMonde() {
  $('#carte').classList.remove('on'); $('#monde').classList.add('on');
  if (!vesselCache) vesselCache = construireVeinule();
  activer(vesselCache); actif = true;
  if (!S.vu) { S.vu = 1; save(); setTimeout(() => toast("Tu es dans une veinule du bras. Le sang coule vers le cœur. Avance avec les flèches ou en pinçant, et entre dans les lieux numérotés.", 6500), 700); }
}
function boucle() {
  requestAnimationFrame(boucle);
  if (!actif || !cur) return;
  const dt = Math.min(.05, clock.getDelta()), t = clock.elapsedTime;
  cur.update(dt, t); R.render(cur.scene, cur.camera); majLabels();
}
boucle();

/* lien direct : #sang ou #L4 */
dessineCarte(); $('#charge').remove();
const h = location.hash.slice(1);
if (h === 'sang' || h === 'ch4') ouvrirMonde();
else if (lvl(h)) { ouvrirMonde(); setTimeout(() => allerNiveau(h), 400); }
window.__jeu = { DATA, ouvrirNiveau, ouvrirBoss, allerNiveau, ouvrirMonde, get cur() { return cur; }, S };

/* mise à jour automatique (mode app iPhone) */
async function verif() {
  try { const r = await fetch('index.html?nc=' + Date.now(), { cache: 'no-store' }); const t = await r.text(); const m = t.match(/jeu\.js\?v=([\w]+)/);
    const mien = document.querySelector('script[src*="jeu.js"]').src.match(/v=([\w]+)/);
    if (m && mien && m[1] !== mien[1] && !$('#feuille').classList.contains('on')) location.reload(); } catch (e) {}
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) verif(); }); verif();
