// L'officine en 3D (three.js) : rendu hors ligne en 4K, découpé en 3 plans de profondeur.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

const W = 4608, H = 2160;
const JOUR = new URLSearchParams(location.search).get('mode') === 'jour';
const L_BACK = 1, L_MID = 2, L_FRONT = 3;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = new URLSearchParams(location.search).get('mode') === 'jour' ? 1.1 : .92;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = JOUR ? 0.6 : 0.32;

const camera = new THREE.PerspectiveCamera(44, W / H, 0.05, 50);
camera.position.set(0, 1.78, 3.3); camera.lookAt(0, 1.43, 0);

// ---------- textures dessinées ----------
function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function bruit(g, w, h, a = 18, n = 60000) { for (let i = 0; i < n; i++) { const v = Math.random() * a; g.fillStyle = `rgba(${Math.random() < .5 ? '0,0,0' : '255,255,255'},${v / 255})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }
const HAND = "700 {S}px Caveat";
const hand = s => HAND.replace('{S}', s);
const texPlatre = canvasTex(1024, 1024, (g, w, h) => { g.fillStyle = '#e9d6bf'; g.fillRect(0, 0, w, h); bruit(g, w, h, 14, 140000); });
texPlatre.wrapS = texPlatre.wrapT = THREE.RepeatWrapping; texPlatre.repeat.set(4, 2);
function bois(base, veine) {
  const t = canvasTex(1024, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { g.strokeStyle = veine; g.globalAlpha = .08 + Math.random() * .18; g.lineWidth = 1 + Math.random() * 4; g.beginPath(); let y = Math.random() * h; g.moveTo(0, y); for (let x = 0; x <= w; x += 32) { y += (Math.random() - .5) * 6; g.lineTo(x, y); } g.stroke(); }
    g.globalAlpha = 1; bruit(g, w, h, 10, 40000);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
const texBois = bois('#a8683d', '#5e331a'), texBoisClair = bois('#c99a6c', '#7b5233');
const texCarreau = canvasTex(1024, 1024, (g, w, h) => {
  g.fillStyle = '#c9d2d2'; g.fillRect(0, 0, w, h); const n = 8, s = w / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const v = 236 + Math.random() * 10; g.fillStyle = `rgb(${v - 4},${v},${v})`; g.fillRect(i * s + 4, j * s + 4, s - 8, s - 8); }
});
texCarreau.wrapS = texCarreau.wrapT = THREE.RepeatWrapping;
const texLiege = canvasTex(1024, 640, (g, w, h) => { g.fillStyle = '#b97c4a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 26000; i++) { g.fillStyle = Math.random() < .5 ? '#8f5a30' : '#d79c66'; g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 3, 2 + Math.random() * 3); } });

// ---------- matériaux ----------
const M = {
  mur: new THREE.MeshStandardMaterial({ map: texPlatre, roughness: .95 }),
  bois: new THREE.MeshStandardMaterial({ map: texBois, roughness: .55 }),
  boisClair: new THREE.MeshStandardMaterial({ map: texBoisClair, roughness: .6 }),
  carreau: new THREE.MeshStandardMaterial({ map: texCarreau, roughness: .25 }),
  plan: new THREE.MeshStandardMaterial({ color: '#f3efe8', roughness: .35 }),
  blanc: new THREE.MeshStandardMaterial({ color: '#f7f4ee', roughness: .5 }),
  inox: new THREE.MeshStandardMaterial({ color: '#c9ced3', metalness: .9, roughness: .28 }),
  inoxMat: new THREE.MeshStandardMaterial({ color: '#aab1b8', metalness: .8, roughness: .45 }),
  noir: new THREE.MeshStandardMaterial({ color: '#2b2a2e', roughness: .6 }),
  beige: new THREE.MeshStandardMaterial({ color: '#e5d9bf', roughness: .55 }),
  rouge: new THREE.MeshStandardMaterial({ color: '#c8452f', roughness: .45 }),
  porcelaine: new THREE.MeshPhysicalMaterial({ color: '#f1ece4', roughness: .35, clearcoat: .6 }),
  verre: new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .04, metalness: 0, transparent: true, opacity: .22, envMapIntensity: 1.6, side: THREE.DoubleSide, depthWrite: false }),
  verreT: new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .03, transmission: 1, thickness: .02, ior: 1.5, side: THREE.DoubleSide }),
  papier: new THREE.MeshStandardMaterial({ color: '#fffdf6', roughness: .9 }),
};
function liquide(col, op = .82) { return new THREE.MeshPhysicalMaterial({ color: col, roughness: .1, transparent: true, opacity: op, transmission: 0, envMapIntensity: 1.2 }); }
function liquideT(col) { return new THREE.MeshPhysicalMaterial({ color: col, roughness: .08, transmission: .85, thickness: .08, ior: 1.33, attenuationColor: new THREE.Color(col), attenuationDistance: .12 }); }

// ---------- outils ----------
const groupes = { [L_BACK]: new THREE.Group(), [L_MID]: new THREE.Group(), [L_FRONT]: new THREE.Group() };
Object.values(groupes).forEach(g => scene.add(g));
function poser(obj, couche, ombre = true) {
  obj.traverse(o => { if (o.isMesh) { o.castShadow = ombre; o.receiveShadow = true; o.layers.set(couche); } });
  groupes[couche].add(obj); return obj;
}
function boite(w, h, d, mat, x, y, z, couche, r = 0) {
  const geo = r ? arrondie(w, h, d, r) : new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return poser(m, couche);
}
function arrondie(w, h, d, r) {   // boîte aux arêtes adoucies
  const b0 = r * .6; w -= 2 * b0; h -= 2 * b0; r = Math.min(r, w / 2, h / 2) * .99;
  const s = new THREE.Shape(); const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * b0, bevelEnabled: true, bevelThickness: b0, bevelSize: b0, bevelSegments: 3, curveSegments: 6 });
  g.translate(0, 0, -(d - 2 * b0) / 2); return g;
}
function tour(points, mat, seg = 48) { return new THREE.Mesh(new THREE.LatheGeometry(points.map(p => new THREE.Vector2(p[0], p[1])), seg), mat); }
function plaque(w, h, tex, x, y, z, couche, rotY = 0, rotZ = 0, matOpts = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: .9, ...matOpts }));
  m.position.set(x, y, z); m.rotation.y = rotY; m.rotation.z = rotZ; return poser(m, couche, false);
}
function aPlat(w, h, tex, x, y, z, couche, rot = 0) {   // feuille posée à plat
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: .92 }));
  m.rotation.x = -Math.PI / 2; m.rotation.z = rot; m.position.set(x, y, z); poser(m, couche, false); m.castShadow = false; return m;
}

// ================= PIÈCE =================
function percé(w, h, cx, cy, trou) { const sh = new THREE.Shape(); sh.moveTo(-w / 2, -h / 2); sh.lineTo(w / 2, -h / 2); sh.lineTo(w / 2, h / 2); sh.lineTo(-w / 2, h / 2); sh.lineTo(-w / 2, -h / 2);
  const [x0, y0, x1, y1] = trou.map((v, i) => v - (i % 2 ? cy : cx)); const ho = new THREE.Path(); ho.moveTo(x0, y0); ho.lineTo(x0, y1); ho.lineTo(x1, y1); ho.lineTo(x1, y0); ho.lineTo(x0, y0); sh.holes.push(ho);
  const g = new THREE.ShapeGeometry(sh); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) + w / 2) / w, (uv.getY(i) + h / 2) / h); return g; }
const TROU = [-.37, 1.56, .67, 2.64];
const murFond = new THREE.Mesh(percé(9, 3.2, 0, 1.6, TROU), M.mur); murFond.position.set(0, 1.6, 0); poser(murFond, L_BACK);
const sol = new THREE.Mesh(new THREE.PlaneGeometry(9, 4), new THREE.MeshStandardMaterial({ color: '#6b5446', roughness: .8 })); sol.rotation.x = -Math.PI / 2; sol.position.set(0, 0, 2); poser(sol, L_BACK);
const plafond = boite(9, .12, .3, new THREE.MeshStandardMaterial({ color: '#d7b38d', roughness: .8 }), 0, 3.05, .15, L_BACK);
// crédence carrelée au centre
const cred = new THREE.Mesh(percé(2.1, 1.25, .1, 1.55, [TROU[0], TROU[1], TROU[2], 2.1749]), M.carreau); cred.material.map.repeat.set(2.1 / .9, 1.25 / .9); cred.position.set(.1, 1.55, .005); poser(cred, L_BACK, false);

// fenêtre (ciel + toits) au-dessus de la paillasse
const ciel = canvasTex(1024, 1024, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8fc3e3'); gr.addColorStop(.7, '#e9e3d6'); gr.addColorStop(1, '#f2d7b9'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const toits = [[0, 300, '#b98872'], [170, 420, '#a57765'], [300, 330, '#c69a80'], [470, 520, '#9b6e63'], [600, 380, '#b8866f'], [760, 460, '#a77a66'], [880, 340, '#c4977c']];
  toits.forEach(([x, hh, c]) => { g.fillStyle = c; g.fillRect(x, h - hh, 150, hh); g.fillStyle = '#7f5450'; g.beginPath(); g.moveTo(x - 10, h - hh); g.lineTo(x + 75, h - hh - 80); g.lineTo(x + 160, h - hh); g.fill(); g.fillStyle = '#f3dfae'; for (let k = 0; k < 3; k++) for (let r = 0; r < 3; r++) if (Math.random() < .7) g.fillRect(x + 22 + k * 40, h - hh + 50 + r * 90, 24, 40); });
});
const vitre = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.05), new THREE.MeshBasicMaterial({ map: ciel, toneMapped: false }));
vitre.position.set(.15, 2.1, .008); vitre.visible = false;
const cadreMat = new THREE.MeshStandardMaterial({ color: '#f4ede2', roughness: .5 });
[[.15, 2.65, 1.12, .07], [.15, 1.55, 1.18, .09], [.15, 2.1, 1.0, .04]].forEach(([x, y, w, h]) => boite(w, h, .09, cadreMat, x, y, .03, L_BACK));
[[-.38, .07], [.68, .07], [.15, .04]].forEach(([x, w]) => boite(w, 1.12, .09, cadreMat, x, 2.1, .03, L_BACK));
boite(1.3, .04, .2, cadreMat, .15, 1.5, .1, L_BACK);   // rebord

// ---------- murs : liège, post-it, ordonnances épinglées, étagère, calendrier, horloge, affiche
function feuilleOrdo(w, h, med, pat, lignes, echelle = 1) {
  return canvasTex(w, h, (g) => {
    g.fillStyle = '#fffdf6'; g.fillRect(0, 0, w, h); bruit(g, w, h, 6, 9000);
    g.fillStyle = '#e1ece9'; g.fillRect(0, 0, w, h * .14); g.fillStyle = '#2b6f6c'; g.font = `800 ${h * .045}px Helvetica`; g.fillText(med, w * .06, h * .065);
    g.fillStyle = '#5d7a76'; g.font = `500 ${h * .028}px Helvetica`; g.fillText('Médecin généraliste · Namur', w * .06, h * .11);
    g.fillStyle = '#1f3a8a'; g.font = hand(h * .055); g.fillText('Pour : ' + pat, w * .07, h * .22);
    g.font = hand(h * .09); g.fillText('Rp', w * .07, h * .34);
    g.font = hand(h * .058); lignes.forEach((l, i) => g.fillText(l, w * .13, h * (.44 + i * .085)));
    g.strokeStyle = '#1f3a8a'; g.lineWidth = h * .006; g.beginPath(); const y = h * .88; g.moveTo(w * .55, y); g.quadraticCurveTo(w * .6, y - h * .07, w * .65, y); g.quadraticCurveTo(w * .7, y + h * .04, w * .75, y - h * .02); g.quadraticCurveTo(w * .82, y - h * .06, w * .9, y); g.stroke();
  });
}
function postit(col, l1, l2) { return canvasTex(400, 400, g => { g.fillStyle = col; g.fillRect(0, 0, 400, 400); bruit(g, 400, 400, 8, 4000); g.fillStyle = '#3b2a2a'; g.font = hand(70); g.fillText(l1, 36, 150); g.fillText(l2, 36, 250); }); }
boite(1.25, .78, .03, M.bois, -1.62, 2.05, .02, L_BACK);
plaque(1.17, .7, texLiege, -1.62, 2.05, .037, L_BACK);
const pins = [];
[[-1.95, 2.05, .3, .4, feuilleOrdo(600, 800, 'Dr M. Laurent', 'Mme Claes', ['hydrocortisone 5 mg', 'pf 1 gél', 'dt LX']), -.05],
 [-1.6, 2.02, .3, .4, feuilleOrdo(600, 800, 'Dr A. Lambert', 'M. Peeters', ['codéine 0,10 %', 'sirop ad 150 mL', 'S\\ 3 C à c / j']), .04]].forEach(([x, y, w, h, t, r]) => { plaque(w, h, t, x, y, .042, L_BACK, 0, r); pins.push([x, y + h / 2 - .03]); });
plaque(.2, .2, postit('#ffe27a', '1 g =', '1000 mg'), -1.25, 2.2, .042, L_BACK, 0, .06); pins.push([-1.25, 2.28]);
plaque(.2, .2, postit('#ffb3c1', 'C à s', '= 15 mL'), -1.27, 1.92, .042, L_BACK, 0, -.05); pins.push([-1.27, 2.0]);
pins.forEach(([x, y]) => { const p = new THREE.Mesh(new THREE.SphereGeometry(.012, 16, 12), M.rouge); p.position.set(x, y, .05); poser(p, L_BACK); });
// étagère de livres
boite(.62, .03, .2, M.bois, -.62, 2.18, .1, L_BACK);
[['#4e6fa8', .05, .26], ['#d9774a', .04, .22], ['#3a8f8a', .055, .28], ['#e9b949', .045, .24], ['#c64b3a', .05, .21], ['#7d62a8', .055, .27], ['#5a8f5a', .04, .23]].reduce((x, [c, w, h]) => { const b = boite(w, h, .16, new THREE.MeshStandardMaterial({ color: c, roughness: .7 }), x + w / 2, 2.195 + h / 2, .1, L_BACK); return x + w + .008; }, -.88);
// calendrier
plaque(.24, .3, canvasTex(480, 600, g => { g.fillStyle = '#fff'; g.fillRect(0, 0, 480, 600); g.fillStyle = '#e07a45'; g.fillRect(0, 0, 480, 120); g.fillStyle = '#fff'; g.font = '800 54px Helvetica'; g.textAlign = 'center'; g.fillText('NOVEMBRE', 240, 80); for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) { g.fillStyle = (r === 3 && c === 4) ? '#d9573f' : '#f1e9df'; g.fillRect(24 + c * 74, 150 + r * 86, 62, 70); g.fillStyle = (r === 3 && c === 4) ? '#fff' : '#8a7a6a'; g.font = '600 26px Helvetica'; g.fillText(String(r * 6 + c + 1), 55 + c * 74, 195 + r * 86); } }), -.62, 1.78, .01, L_BACK);
// horloge
const horloge = new THREE.Group();
const cad = new THREE.Mesh(new THREE.CylinderGeometry(.17, .17, .04, 64), M.noir); cad.rotation.x = Math.PI / 2; horloge.add(cad);
const face = new THREE.Mesh(new THREE.CircleGeometry(.15, 64), new THREE.MeshStandardMaterial({ map: canvasTex(512, 512, g => { g.fillStyle = '#fbf6ee'; g.fillRect(0, 0, 512, 512); g.translate(256, 256); for (let k = 0; k < 60; k++) { g.save(); g.rotate(k * Math.PI / 30); g.fillStyle = '#2f2433'; g.fillRect(-(k % 5 ? 2 : 5), -238, k % 5 ? 4 : 10, k % 5 ? 18 : 40); g.restore(); } g.rotate(Math.PI * 2 * 10 / 12 + .2); g.fillStyle = '#2f2433'; g.fillRect(-9, -130, 18, 140); g.rotate(1.9); g.fillRect(-6, -200, 12, 210); }), roughness: .4 }));
face.position.z = .021; horloge.add(face); horloge.position.set(.95, 2.62, .03); poser(horloge, L_BACK);
// affiche « Densités »
const DENS = [['Eau', '1'], ['Éthanol', '0,79'], ['Méthanol', '0,80'], ['Isopropanol', '0,79'], ['Acétone', '0,79'], ['Éther', '0,71'], ['Huile de paraffine', '0,86'], ['Propylène glycol', '1,04']];
plaque(.36, .48, canvasTex(720, 960, g => { g.fillStyle = '#fffdf8'; g.fillRect(0, 0, 720, 960); g.fillStyle = '#2f8a84'; g.fillRect(0, 0, 720, 130); g.fillStyle = '#fff'; g.font = '800 66px Helvetica'; g.textAlign = 'center'; g.fillText('DENSITÉS', 360, 90); g.textAlign = 'left'; DENS.forEach(([n, d], i) => { const y = 215 + i * 92; g.fillStyle = '#2f2433'; g.font = '500 44px Helvetica'; g.fillText(n, 40, y); g.textAlign = 'right'; g.fillStyle = '#226b66'; g.font = '800 46px Helvetica'; g.fillText(d, 680, y); g.textAlign = 'left'; g.fillStyle = '#eee5d8'; g.fillRect(40, y + 26, 640, 3); }); }), 1.0, 1.72, .012, L_BACK);

// ================= ÉTAGÈRE DES FLACONS (droite, plan du fond)
const ex = 1.95;
[.95, 1.45, 1.95, 2.45].forEach(y => boite(1.15, .03, .32, M.bois, ex, y, .17, L_BACK));
[-.575, .575].forEach(dx => boite(.04, 1.75, .32, M.bois, ex + dx, 1.86, .17, L_BACK));
function etiquette(nom, d) { return canvasTex(512, 300, g => { g.fillStyle = '#fffaf0'; g.fillRect(0, 0, 512, 300); g.strokeStyle = '#c9b89c'; g.lineWidth = 8; g.strokeRect(10, 10, 492, 280); g.fillStyle = '#2f2433'; g.textAlign = 'center'; g.font = `800 ${nom.length > 12 ? 52 : 66}px Helvetica`; g.fillText(nom, 256, d ? 130 : 170); if (d) { g.fillStyle = '#226b66'; g.font = '800 58px Helvetica'; g.fillText('d = ' + d, 256, 228); } }); }
function flacon(x, y, z, col, nom, d, h = .26, r = .07) {
  const g = new THREE.Group();
  const prof = [[0, 0], [r, 0], [r, h * .62], [r * .55, h * .82], [r * .32, h * .86], [r * .32, h], [0, h]];
  const corps = tour(prof, M.verreT); g.add(corps);
  const liq = tour([[0, .004], [r * .94, .004], [r * .94, h * .55], [0, h * .55]], liquideT(col)); g.add(liq);
  const bouchon = new THREE.Mesh(new THREE.CylinderGeometry(r * .36, r * .36, h * .14, 32), M.noir); bouchon.position.y = h * 1.04; g.add(bouchon);
  const et = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.004, r * 1.004, h * .3, 48, 1, true, -Math.PI * .45, Math.PI * .9), new THREE.MeshStandardMaterial({ map: etiquette(nom, d), roughness: .8 }));
  et.position.y = h * .3; g.add(et); g.position.set(x, y, z); return poser(g, L_BACK);
}
const FL = [
  [[1.47, 'Éthanol', '0,79', '#7aa7e0'], [1.78, 'Glycérine', '1,26', '#f0cf6a'], [2.09, 'Prop. glycol', '1,04', '#a68bd4'], [2.4, 'Eau purifiée', '1', '#bfe3f2']],
  [[1.47, 'Huile paraf.', '0,86', '#f2e3a0'], [1.78, 'Éther', '0,71', '#9fdcb8'], [2.09, 'Méthanol', '0,80', '#f2a576'], [2.4, 'Acétone', '0,79', '#f4b5b2']],
];
FL[0].forEach(([x, n, d, c]) => flacon(x, 1.965, .17, c, n, d)); FL[1].forEach(([x, n, d, c]) => flacon(x, 1.465, .17, c, n, d));
// pots (excipients) étagère du haut
[[1.5, 'Lactose', '#f6f2ea'], [1.82, 'Witepsol', '#f2e2bd'], [2.14, 'Vaseline', '#f3e9c6'], [2.42, 'Sirop', '#f1c38f']].forEach(([x, n, c]) => {
  const g = new THREE.Group(); const p = new THREE.Mesh(new THREE.CylinderGeometry(.085, .085, .17, 48), new THREE.MeshPhysicalMaterial({ color: c, roughness: .3, clearcoat: .5 })); p.position.y = .085; g.add(p);
  const cv = new THREE.Mesh(new THREE.CylinderGeometry(.092, .092, .04, 48), M.noir); cv.position.y = .19; g.add(cv);
  const et = new THREE.Mesh(new THREE.CylinderGeometry(.0855, .0855, .08, 48, 1, true, -Math.PI * .45, Math.PI * .9), new THREE.MeshStandardMaterial({ map: etiquette(n, ''), roughness: .8 })); et.position.y = .085; g.add(et);
  g.position.set(x, 2.465, .17); poser(g, L_BACK);
});
// collecteur de déchets rouge (générique)
boite(.26, .3, .22, new THREE.MeshStandardMaterial({ color: '#c8452f', roughness: .5 }), 2.42, 1.12, .2, L_BACK, .02);

// ================= PLANS DE TRAVAIL (plan du milieu)
const HT = .92, PROF = .95;
boite(1.7, .05, PROF, M.bois, -1.75, HT, PROF / 2, L_MID, .012);            // bureau
boite(1.66, HT - .05, PROF - .05, new THREE.MeshStandardMaterial({ map: texBois, roughness: .7, color: '#cfa07a' }), -1.75, (HT - .05) / 2, PROF / 2 - .05, L_MID);
boite(2.0, .05, PROF, M.plan, .12, HT, PROF / 2, L_MID, .012);               // paillasse
boite(2.0, HT - .05, PROF - .05, M.blanc, .12, (HT - .05) / 2, PROF / 2 - .05, L_MID);
boite(1.3, .05, PROF, M.boisClair, 1.79, HT, PROF / 2, L_MID, .012);         // plan droit
boite(1.26, HT - .05, PROF - .05, new THREE.MeshStandardMaterial({ map: texBoisClair, roughness: .7 }), 1.78, (HT - .05) / 2, PROF / 2 - .05, L_MID);
const Y = HT + .025;
// façades : portes, tiroirs, poignées, plinthe
const poignee = new THREE.MeshStandardMaterial({ color: '#c9ced3', metalness: .85, roughness: .3 });
function facade(x0, x1, mat, nb) { const w = (x1 - x0) / nb; for (let k = 0; k < nb; k++) { const cx = x0 + w * (k + .5);
  boite(w - .02, .2, .02, mat, cx, HT - .16, PROF - .03, L_MID, .006); boite(w - .02, .5, .02, mat, cx, .38, PROF - .03, L_MID, .006);
  boite(.12, .015, .025, poignee, cx, HT - .16, PROF - .005, L_MID, .005); boite(.015, .14, .025, poignee, cx + w / 2 - .06, .5, PROF - .005, L_MID, .005); } }
facade(-2.58, -.92, new THREE.MeshStandardMaterial({ map: texBois, roughness: .6, color: '#e0b48c' }), 3);
facade(-.86, 1.1, new THREE.MeshStandardMaterial({ color: '#fbf9f5', roughness: .4 }), 4);
facade(1.17, 2.41, new THREE.MeshStandardMaterial({ map: texBoisClair, roughness: .6, color: '#f0d6b8' }), 2);
boite(5.2, .1, .05, new THREE.MeshStandardMaterial({ color: '#3d2c25', roughness: .7 }), -.1, .05, PROF - .06, L_MID);

// ---------- bureau : ordinateur rétro, clavier, téléphone, lampe, calculatrice
const ecranTex = canvasTex(640, 480, g => { const gr = g.createLinearGradient(0, 0, 0, 480); gr.addColorStop(0, '#3f6f73'); gr.addColorStop(1, '#22413f'); g.fillStyle = gr; g.fillRect(0, 0, 640, 480); g.fillStyle = '#bff0d8'; g.font = '700 54px Courier New'; g.fillText('ORDONNANCES', 40, 110); g.font = '600 46px Courier New'; g.fillText('du jour', 40, 175); g.globalAlpha = .7; [400, 330, 260].forEach((w, i) => g.fillRect(40, 230 + i * 50, w, 22)); g.globalAlpha = 1; for (let y = 0; y < 480; y += 4) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, y, 640, 2); } });
const ordi = new THREE.Group();
const caisson = new THREE.Mesh(arrondie(.42, .36, .4, .03), M.beige); caisson.position.set(0, .2 + .06, 0); ordi.add(caisson);
const ecran = new THREE.Mesh(new THREE.PlaneGeometry(.31, .23), new THREE.MeshStandardMaterial({ map: ecranTex, emissive: '#ffffff', emissiveMap: ecranTex, emissiveIntensity: .55, roughness: .15 })); ecran.position.set(0, .28, .201); ordi.add(ecran);
const pied = new THREE.Mesh(new THREE.BoxGeometry(.2, .06, .25), M.beige); pied.position.set(0, .03, 0); ordi.add(pied);
ordi.position.set(-1.72, Y, .32); ordi.rotation.y = .12; poser(ordi, L_MID);
const clavier = boite(.46, .03, .16, M.beige, -1.7, Y + .015, .66, L_MID, .008);
for (let r = 0; r < 4; r++) for (let c = 0; c < 14; c++) boite(.026, .012, .026, new THREE.MeshStandardMaterial({ color: '#d8ccb2', roughness: .6 }), -1.9 + c * .03, Y + .036, .6 + r * .034, L_MID);
// téléphone / interphone brique
const tel = new THREE.Group();
const tb = new THREE.Mesh(arrondie(.3, .1, .2, .02), new THREE.MeshStandardMaterial({ color: '#b9503a', roughness: .5 })); tb.position.y = .05; tel.add(tb);
for (let k = 0; k < 7; k++) { const f = new THREE.Mesh(new THREE.BoxGeometry(.008, .012, .14), new THREE.MeshStandardMaterial({ color: '#8f3826' })); f.position.set(-.12 + k * .018, .102, 0); tel.add(f); }
for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const t = new THREE.Mesh(new THREE.BoxGeometry(.026, .012, .022), M.noir); t.position.set(.04 + c * .032, .104, -.05 + r * .032); tel.add(t); }
const led = new THREE.Mesh(new THREE.SphereGeometry(.007, 12, 8), new THREE.MeshStandardMaterial({ color: '#ff5a3c', emissive: '#ff3a1c', emissiveIntensity: 2 })); led.position.set(-.12, .102, .08); tel.add(led);
tel.position.set(-2.32, Y, .38); tel.rotation.y = .3; poser(tel, L_MID);
// lampe de bureau rouge avec vraie lumière
const lampe = new THREE.Group();
const socle = new THREE.Mesh(new THREE.CylinderGeometry(.09, .1, .025, 48), M.rouge); socle.position.y = .012; lampe.add(socle);
const tige = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .42, 16), M.rouge); tige.position.y = .22; lampe.add(tige);
const abat = tour([[.03, 0], [.07, 0], [.15, -.15], [.14, -.155], [.02, -.01]], new THREE.MeshStandardMaterial({ color: '#d14b33', roughness: .4, side: THREE.DoubleSide })); abat.position.y = .55; abat.rotation.z = .2; lampe.add(abat);
const ampoule = new THREE.Mesh(new THREE.SphereGeometry(.03, 16, 12), new THREE.MeshStandardMaterial({ color: '#fff3c8', emissive: '#ffe6a0', emissiveIntensity: 4 })); ampoule.position.set(.02, .46, 0); lampe.add(ampoule);
lampe.position.set(-1.12, Y, .3); poser(lampe, L_MID);
const spot = new THREE.SpotLight('#ffcf8a', 16, 2.4, .8, .55, 1.3); spot.position.set(-1.1, Y + .47, .3); spot.target.position.set(-1.2, Y, .55); spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); spot.shadow.radius = 6; scene.add(spot, spot.target);
// calculatrice
const calc = new THREE.Group(); const cb = new THREE.Mesh(arrondie(.16, .025, .2, .008), M.beige); calc.add(cb);
const affC = new THREE.Mesh(new THREE.PlaneGeometry(.12, .035), new THREE.MeshStandardMaterial({ map: canvasTex(256, 80, g => { g.fillStyle = '#a9c2a0'; g.fillRect(0, 0, 256, 80); g.fillStyle = '#253325'; g.font = '700 54px Courier New'; g.textAlign = 'right'; g.fillText('0,79', 240, 60); }), roughness: .3 })); affC.rotation.x = -Math.PI / 2; affC.position.set(0, .0135, -.06); calc.add(affC);
for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const t = new THREE.Mesh(new THREE.BoxGeometry(.024, .008, .02), new THREE.MeshStandardMaterial({ color: c === 3 ? '#e07a45' : '#5d5550' })); t.position.set(-.045 + c * .03, .016, -.015 + r * .028); calc.add(t); }
calc.position.set(-1.3, Y + .012, .7); calc.rotation.y = -.25; poser(calc, L_FRONT);
// tasse
const tasse = tour([[0, 0], [.038, 0], [.042, .09], [.036, .09], [.032, .006], [0, .006]], new THREE.MeshPhysicalMaterial({ color: '#2f8a84', roughness: .3, clearcoat: .7 })); tasse.position.set(-.98, Y, .62); poser(tasse, L_FRONT);
const anse = new THREE.Mesh(new THREE.TorusGeometry(.025, .007, 12, 24, Math.PI), tasse.material); anse.rotation.z = -Math.PI / 2; anse.position.set(-.94, Y + .045, .62); poser(anse, L_FRONT);

// ---------- ordonnances au premier plan, tampon, stylo
const ORD = [
  feuilleOrdo(840, 1120, 'Dr M. Laurent', 'Mme Dubois', ['éthinylœstradiol 50 µg', 'pf 1 gél dt X']),
  feuilleOrdo(840, 1120, 'Dr S. Moreau', 'Léo, 6 ans', ['paracétamol 120 mg', 'sirop ad 150 mL', 'S\\ 1 C à c x 3 / j']),
  feuilleOrdo(840, 1120, 'Dr C. Dupont', 'M. Martin', ['bismuth 200 mg (f 0,37)', 'Witepsol qs', 'pf 1 suppo dt VI']),
];
aPlat(.21, .28, ORD[2], -2.02, Y + .001, .7, L_FRONT, .22);
aPlat(.21, .28, ORD[0], -1.86, Y + .003, .76, L_FRONT, .05);
aPlat(.21, .28, ORD[1], -1.6, Y + .005, .79, L_FRONT, -.12);
const tampon = new THREE.Group(); const tm = new THREE.Mesh(new THREE.CylinderGeometry(.025, .03, .07, 32), M.rouge); tm.position.y = .065; tampon.add(tm);
const tb2 = new THREE.Mesh(new THREE.BoxGeometry(.08, .03, .05), M.bois); tb2.position.y = .015; tampon.add(tb2); tampon.position.set(-2.32, Y, .74); poser(tampon, L_FRONT);
const stylo = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .15, 16), new THREE.MeshStandardMaterial({ color: '#1f3a8a', roughness: .3 })); stylo.rotation.z = Math.PI / 2; stylo.rotation.y = .5; stylo.position.set(-1.42, Y + .006, .86); poser(stylo, L_FRONT);

// ---------- paillasse : balance, mortier, gélulier, ballon chauffé, éprouvette, nacelle, gélules
const bal = new THREE.Group();
const bb = new THREE.Mesh(arrondie(.3, .06, .34, .015), new THREE.MeshStandardMaterial({ color: '#4a4f5a', roughness: .4 })); bb.position.y = .03; bal.add(bb);
const affB = new THREE.Mesh(new THREE.PlaneGeometry(.14, .035), new THREE.MeshStandardMaterial({ map: canvasTex(320, 80, g => { g.fillStyle = '#16231f'; g.fillRect(0, 0, 320, 80); g.fillStyle = '#9ff0c8'; g.font = '700 52px Courier New'; g.textAlign = 'right'; g.fillText('0,250 g', 300, 58); }), emissive: '#9ff0c8', emissiveIntensity: .25 })); affB.position.set(0, .035, .171); bal.add(affB);
const cage = new THREE.Mesh(new THREE.BoxGeometry(.24, .22, .24), M.verre); cage.position.set(0, .17, -.02); bal.add(cage);
const cadreCage = new THREE.Mesh(new THREE.BoxGeometry(.25, .012, .25), M.inoxMat); cadreCage.position.set(0, .285, -.02); bal.add(cadreCage);
const plat = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .006, 48), M.inox); plat.position.set(0, .065, -.02); bal.add(plat);
const poudreB = tour([[0, 0], [.03, 0], [0, .02]], M.blanc); poudreB.position.set(0, .068, -.02); bal.add(poudreB);
bal.position.set(-.6, Y, .32); poser(bal, L_MID);
// mortier et pilon
const mort = tour([[0, 0], [.07, 0], [.08, .02], [.1, .1], [.093, .1], [.074, .028], [0, .022]], M.porcelaine); mort.position.set(-.17, Y, .42); poser(mort, L_MID);
const pil = new THREE.Mesh(new THREE.CapsuleGeometry(.014, .16, 8, 16), M.porcelaine); pil.position.set(-.12, Y + .14, .42); pil.rotation.z = -.5; poser(pil, L_MID);
// gélulier
const gel = new THREE.Group(); const gp = new THREE.Mesh(arrondie(.32, .03, .16, .01), new THREE.MeshPhysicalMaterial({ color: '#cfe3ea', roughness: .25, clearcoat: .6 })); gel.add(gp);
for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) { const h2 = new THREE.Mesh(new THREE.CylinderGeometry(.009, .009, .004, 16), new THREE.MeshStandardMaterial({ color: '#7fa6b2' })); h2.position.set(-.13 + c * .032, .016, -.04 + r * .04); gel.add(h2); }
gel.position.set(.22, Y + .015, .36); poser(gel, L_MID);
// ballon chauffé sur support + plaque chauffante
const supp = new THREE.Group();
const base = new THREE.Mesh(new THREE.BoxGeometry(.2, .015, .14), M.inoxMat); base.position.y = .008; supp.add(base);
const tigeS = new THREE.Mesh(new THREE.CylinderGeometry(.007, .007, .7, 16), M.inox); tigeS.position.set(-.07, .35, -.04); supp.add(tigeS);
const plaqueC = new THREE.Mesh(new THREE.CylinderGeometry(.075, .08, .07, 48), new THREE.MeshStandardMaterial({ color: '#5b6470', roughness: .5 })); plaqueC.position.set(.02, .05, 0); supp.add(plaqueC);
const rougeur = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .002, 48), new THREE.MeshStandardMaterial({ color: '#ff6a3a', emissive: '#ff4a1a', emissiveIntensity: 1.2 })); rougeur.position.set(.02, .086, 0); supp.add(rougeur);
const ballon = tour([[0, 0], [.04, .004], [.085, .05], [.1, .1], [.085, .15], [.035, .19], [.025, .2], [.025, .32], [0, .32]], M.verre); ballon.position.set(.02, .09, 0); supp.add(ballon);
const liqB = new THREE.Mesh(new THREE.SphereGeometry(.093, 32, 24, 0, Math.PI * 2, Math.PI * .45, Math.PI * .55), liquide('#e98a4b', .85)); liqB.position.set(.02, .19, 0); supp.add(liqB);
const pince = new THREE.Mesh(new THREE.BoxGeometry(.1, .012, .012), M.inox); pince.position.set(-.02, .36, -.02); supp.add(pince);
supp.position.set(.72, Y, .3); poser(supp, L_MID);
// éprouvette graduée (premier plan)
const epr = new THREE.Group();
const tube = new THREE.Mesh(new THREE.CylinderGeometry(.026, .026, .36, 32, 1, true), M.verre); tube.position.y = .2; epr.add(tube);
const liqE = new THREE.Mesh(new THREE.CylinderGeometry(.023, .023, .16, 32), liquide('#7cc9a0', .7)); liqE.position.y = .1; epr.add(liqE);
const pE = new THREE.Mesh(new THREE.CylinderGeometry(.06, .07, .02, 6), M.verre); pE.position.y = .01; epr.add(pE);
for (let k = 0; k < 10; k++) { const gr = new THREE.Mesh(new THREE.BoxGeometry(k % 2 ? .012 : .022, .0015, .001), new THREE.MeshBasicMaterial({ color: '#4d5c60' })); gr.position.set(-.01, .06 + k * .03, .027); epr.add(gr); }
epr.position.set(.95, Y, .68); poser(epr, L_FRONT);
// nacelle de pesée + spatules
const nac = new THREE.Mesh(new THREE.BoxGeometry(.1, .01, .1), M.blanc); nac.position.set(-.38, Y + .005, .72); nac.rotation.y = .4; poser(nac, L_FRONT);
const tas = tour([[0, 0], [.03, 0], [0, .018]], M.blanc); tas.position.set(-.38, Y + .01, .72); poser(tas, L_FRONT);
[[-.18, .74, .25], [-.14, .79, .15]].forEach(([x, z, r]) => { const s = new THREE.Group(); const m1 = new THREE.Mesh(new THREE.BoxGeometry(.18, .004, .012), M.inox); s.add(m1); const m2 = new THREE.Mesh(new THREE.CylinderGeometry(.011, .011, .07, 16), M.noir); m2.rotation.z = Math.PI / 2; m2.position.x = .12; s.add(m2); s.position.set(x, Y + .006, z); s.rotation.y = r; poser(s, L_FRONT); });
// plateau de gélules colorées
const plt = boite(.22, .012, .14, new THREE.MeshPhysicalMaterial({ color: '#e3eef1', roughness: .3 }), .3, Y + .006, .74, L_FRONT, .004);
const COLS = ['#f2a7a0', '#f2c45a', '#5c7fb8', '#7cc9a0'];
for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) { const cap = new THREE.Mesh(new THREE.CapsuleGeometry(.007, .022, 6, 12), new THREE.MeshPhysicalMaterial({ color: COLS[(r + c) % 4], roughness: .2, clearcoat: 1 })); cap.rotation.z = Math.PI / 2; cap.rotation.y = (r * 7 + c) * .7; cap.position.set(.22 + c * .032, Y + .02, .7 + r * .04); poser(cap, L_FRONT); }

// ---------- plan droit : bain-marie, moule à suppositoires, thermomètre, gants
const bm = new THREE.Group(); const cuve = new THREE.Mesh(new THREE.CylinderGeometry(.13, .12, .14, 48, 1, true), M.inox); cuve.position.y = .07; bm.add(cuve);
const fond = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, .01, 48), M.inox); bm.add(fond);
const eau = new THREE.Mesh(new THREE.CylinderGeometry(.125, .125, .005, 48), liquide('#cfe8ee', .7)); eau.position.y = .12; bm.add(eau);
const bol = tour([[0, .06], [.07, .07], [.09, .16], [.085, .16], [.065, .075], [0, .065]], M.inox); bm.add(bol);
const fondu = new THREE.Mesh(new THREE.CylinderGeometry(.078, .078, .004, 32), liquide('#f3e0b4', .95)); fondu.position.y = .14; bm.add(fondu);
bm.position.set(1.45, Y, .32); poser(bm, L_MID);
const moule = new THREE.Group(); const mb = new THREE.Mesh(arrondie(.34, .05, .12, .01), M.inoxMat); moule.add(mb);
for (let c = 0; c < 8; c++) { const s = new THREE.Mesh(new THREE.CapsuleGeometry(.011, .04, 6, 16), new THREE.MeshPhysicalMaterial({ color: '#f4e6c8', roughness: .35, clearcoat: .4 })); s.rotation.x = Math.PI / 2; s.position.set(-.14 + c * .04, .028, 0); moule.add(s); }
moule.position.set(1.72, Y + .025, .7); moule.rotation.y = -.15; poser(moule, L_FRONT);
const thermo = new THREE.Group(); const tg = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .25, 16), M.verre); tg.rotation.z = Math.PI / 2; thermo.add(tg);
const tr = new THREE.Mesh(new THREE.CylinderGeometry(.0025, .0025, .14, 8), new THREE.MeshStandardMaterial({ color: '#e5484d', emissive: '#a01010' })); tr.rotation.z = Math.PI / 2; tr.position.x = -.04; thermo.add(tr);
thermo.position.set(1.95, Y + .007, .82); thermo.rotation.y = .5; poser(thermo, L_FRONT);
const gants = boite(.24, .1, .12, new THREE.MeshStandardMaterial({ color: '#7fc6c1', roughness: .6 }), 2.2, Y + .05, .38, L_MID, .01);

// ---------- lumières
scene.add(new THREE.HemisphereLight(JOUR ? '#eef5ff' : '#ffe9d2', '#5a4034', JOUR ? .55 : .2));
[[-1.6, .3], [.15, .25], [1.8, .3]].forEach(([x, z]) => { const p = new THREE.SpotLight(JOUR ? '#fff4e6' : '#ffd6a0', JOUR ? 7 : 10, 4.5, .95, .7, 1.2); p.position.set(x, 3.0, z + 1.2); p.target.position.set(x, .9, z); p.castShadow = true; p.shadow.mapSize.set(2048, 2048); p.shadow.radius = 8; p.shadow.camera.layers.enableAll(); scene.add(p, p.target); });
const soleil = new THREE.DirectionalLight(JOUR ? '#fff1dc' : '#ffd7a8', JOUR ? 3.4 : 1.1); soleil.position.set(-2.6, 3.6, 2.6); soleil.target.position.set(0, .9, .3);
soleil.castShadow = true; soleil.shadow.mapSize.set(4096, 4096); Object.assign(soleil.shadow.camera, { left: -4, right: 4, top: 3.5, bottom: -2.5, near: .5, far: 10 }); soleil.shadow.radius = 4; soleil.shadow.bias = -.0004;
scene.add(soleil, soleil.target);
const face2 = new THREE.DirectionalLight('#ffe6cc', .35); face2.position.set(2, 2.4, 4); scene.add(face2);
const fenetre = new THREE.RectAreaLight ? null : null;
const lumFen = new THREE.PointLight(JOUR ? '#eaf4ff' : '#ffb070', JOUR ? 4.5 : .8, JOUR ? 3.6 : 2.2, 1.4); lumFen.position.set(.15, 2.05, .45); scene.add(lumFen);
[soleil.shadow.camera, spot.shadow.camera].forEach(c => c.layers.enableAll());
camera.layers.enableAll();

// ---------- rendu
const composer = new EffectComposer(renderer);
const rp = new RenderPass(scene, camera); composer.addPass(rp);
const ao = new GTAOPass(scene, camera, W, H); ao.blendIntensity = .9; ao.updateGtaoMaterial({ radius: .12, distanceFallOff: 1, thickness: 1 }); composer.addPass(ao);
composer.addPass(new OutputPass());

function rendre(couches) {
  camera.layers.disableAll(); couches.forEach(l => camera.layers.enable(l));
  scene.background = null;
  renderer.setClearColor(0x000000, 0);
  if (couches.includes(L_BACK) && couches.length === 3) composer.render(); else if (couches.includes(L_BACK)) composer.render(); else renderer.render(scene, camera);
  return renderer.domElement.toDataURL('image/png');
}
function proj(x, y, z) { const v = new THREE.Vector3(x, y, z).project(camera); return [+(((v.x + 1) / 2) * 100).toFixed(2), +(((1 - v.y) / 2) * 100).toFixed(2)]; }
window.__rendre = (k) => rendre(k === 'tout' ? [L_BACK, L_MID, L_FRONT] : k === 'fond' ? [L_BACK] : k === 'milieu' ? [L_MID] : [L_FRONT]);
window.__ancres = () => ({
  fenetre: [proj(TROU[0], TROU[3], 0), proj(TROU[2], TROU[3], 0), proj(TROU[2], TROU[1], 0), proj(TROU[0], TROU[1], 0)],
  horloge: [proj(.95, 2.62, .05), proj(.95, 2.75, .05)],
  ballon: [proj(.74, Y + .19, .3), proj(.74 + .09, Y + .19, .3)], plaque: proj(.74, Y + .1, .3), col: proj(.74, Y + .41, .3),
  bainmarie: proj(1.45, Y + .17, .32), led: proj(-2.32 - .12 * Math.cos(.3), Y + .102, .38 + .08), ecran: proj(-1.72, Y + .34, .53),
  lieux: { bureau: proj(-1.45, Y, .5), paillasse: proj(-.17, Y, .5), bainmarie: proj(1.45, Y, .5), moule: proj(1.72, Y, .75), gelules: proj(.3, Y, .78), nacelle: proj(-.38, Y, .75), ordos: proj(-1.84, Y, .8) },
});
window.__pret = true;
