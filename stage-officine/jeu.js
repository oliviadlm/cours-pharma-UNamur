import * as THREE from './three.module.min.js';
import { COURS, ZONES, JOURNEES } from './data.js';

/* =========================================================
   Stage en officine · Pharmacie du Confluent (3D, ordinateur)
   1 unité = 1 mètre. Porte d'entrée en z = +7, mur du fond en z = -7.
   Zone clients : z > 3 · comptoir en z = 2.5 · zone équipe : z < 2.
   ========================================================= */
const $ = (s) => document.querySelector(s);
const CLE = 'stage-officine-v1';
const JOUR = JOURNEES[0];

/* ---------- Sauvegarde ---------- */
function charger() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(CLE)); } catch (e) { s = null; }
  return Object.assign({ xp: 0, etoiles: {}, stats: {}, fautes: [], parties: 0 }, s || {});
}
function sauver() { try { localStorage.setItem(CLE, JSON.stringify(S)); } catch (e) {} }
let S = charger();

/* ---------- Index des questions ---------- */
const QIDX = {};
JOUR.patients.forEach((p) => p.etapes.forEach((e, ei) => e.qs.forEach((q, qi) => {
  QIDX[`${p.id}-${ei}-${qi}`] = { q, p };
})));
const NB_Q = Object.keys(QIDX).length;

/* ---------- Rendu ---------- */
const canvas = $('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#cfe7e0');
scene.fog = new THREE.Fog('#cfe7e0', 22, 45);
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.05, 100);
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

/* ---------- Lumières ---------- */
scene.add(new THREE.HemisphereLight('#ffffff', '#b8c9c2', 1.1));
const soleil = new THREE.DirectionalLight('#fff4e0', 1.6);
soleil.position.set(6, 12, 10); soleil.castShadow = true;
soleil.shadow.mapSize.set(2048, 2048);
Object.assign(soleil.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 40 });
scene.add(soleil);

/* ---------- Matériaux et textures ---------- */
function texCanvas(w, h, dessin, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  dessin(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  t.anisotropy = 8; return t;
}
const texSol = texCanvas(256, 256, (g, w, h) => {
  g.fillStyle = '#e9e4da'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#ded7ca'; g.fillRect(0, 0, w / 2, h / 2); g.fillRect(w / 2, h / 2, w / 2, h / 2);
  g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h); g.strokeRect(0, 0, w / 2, h / 2);
}, [9, 7]);
const M = {
  sol: new THREE.MeshStandardMaterial({ map: texSol, roughness: 0.85 }),
  mur: new THREE.MeshStandardMaterial({ color: '#f4f8f6', roughness: 0.95 }),
  murVert: new THREE.MeshStandardMaterial({ color: '#2f8f6f', roughness: 0.9 }),
  plafond: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1 }),
  bois: new THREE.MeshStandardMaterial({ color: '#c89f72', roughness: 0.7 }),
  boisFonce: new THREE.MeshStandardMaterial({ color: '#8a6244', roughness: 0.7 }),
  blanc: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.5 }),
  metal: new THREE.MeshStandardMaterial({ color: '#b7c2c7', metalness: 0.7, roughness: 0.3 }),
  noir: new THREE.MeshStandardMaterial({ color: '#22292c', roughness: 0.5 }),
  vitre: new THREE.MeshPhysicalMaterial({ color: '#d8f1ff', transparent: true, opacity: 0.22, roughness: 0.05 }),
  verre: new THREE.MeshPhysicalMaterial({ color: '#a8e6cf', transparent: true, opacity: 0.55, roughness: 0.1 }),
  ambre: new THREE.MeshPhysicalMaterial({ color: '#b5651d', transparent: true, opacity: 0.85, roughness: 0.15 }),
  feuille: new THREE.MeshStandardMaterial({ color: '#4caf50', roughness: 0.8 }),
  feuille2: new THREE.MeshStandardMaterial({ color: '#2e7d32', roughness: 0.8 }),
  terre: new THREE.MeshStandardMaterial({ color: '#b5653a', roughness: 0.9 }),
  croix: new THREE.MeshStandardMaterial({ color: '#3ddc97', emissive: '#3ddc97', emissiveIntensity: 1.6 }),
  ecran: new THREE.MeshStandardMaterial({ color: '#163a5f', emissive: '#2a6fb0', emissiveIntensity: 0.8 })
};

const COLLIS = []; // boîtes de collision {x1,x2,z1,z2}
function boite(l, h, p, mat, x, y, z, collision = false, ombre = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(l, h, p), mat);
  m.position.set(x, y, z); m.castShadow = ombre; m.receiveShadow = true; scene.add(m);
  if (collision) COLLIS.push({ x1: x - l / 2, x2: x + l / 2, z1: z - p / 2, z2: z + p / 2 });
  return m;
}
function cyl(r1, r2, h, mat, x, y, z, seg = 20) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; scene.add(m); return m;
}
function etiquette(texte, { taille = 64, coul = '#ffffff', fond = 'rgba(12,32,28,.85)', larg = 2.4 } = {}) {
  const c = document.createElement('canvas'); const g = c.getContext('2d');
  g.font = `700 ${taille}px -apple-system,Segoe UI,Inter,sans-serif`;
  const w = Math.ceil(g.measureText(texte).width) + taille; const h = Math.ceil(taille * 1.6);
  c.width = w; c.height = h;
  g.font = `700 ${taille}px -apple-system,Segoe UI,Inter,sans-serif`;
  if (fond) { g.fillStyle = fond; const r = h / 2; g.beginPath(); g.roundRect(0, 0, w, h, r); g.fill(); }
  g.fillStyle = coul; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(texte, w / 2, h / 2 + 2);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
  s.scale.set(larg, larg * h / w, 1); s.renderOrder = 10; return s;
}

/* ---------- La pièce ---------- */
const sol = new THREE.Mesh(new THREE.PlaneGeometry(18, 14), M.sol);
sol.rotation.x = -Math.PI / 2; sol.receiveShadow = true; scene.add(sol);
const plafond = new THREE.Mesh(new THREE.PlaneGeometry(18, 14), M.plafond);
plafond.rotation.x = Math.PI / 2; plafond.position.y = 3.4; scene.add(plafond);
boite(18, 3.4, 0.2, M.mur, 0, 1.7, -7.1, false, false);           // fond
boite(0.2, 3.4, 14, M.mur, -9.1, 1.7, 0, false, false);           // gauche
boite(0.2, 3.4, 14, M.mur, 9.1, 1.7, 0, false, false);            // droite
boite(18, 0.4, 0.2, M.murVert, 0, 0.2, -6.95, false, false);      // plinthe verte
// Façade vitrée avec porte au centre
boite(7.2, 3.4, 0.15, M.vitre, -5.4, 1.7, 7.05, false, false);
boite(7.2, 3.4, 0.15, M.vitre, 5.4, 1.7, 7.05, false, false);
boite(3.6, 0.9, 0.15, M.murVert, 0, 2.95, 7.05, false, false);
for (const x of [-9, -1.8, 1.8, 9]) boite(0.15, 3.4, 0.2, M.murVert, x, 1.7, 7.05, false, false);
const dehors = new THREE.Mesh(new THREE.PlaneGeometry(60, 20), new THREE.MeshBasicMaterial({ color: '#bfe3f2' }));
dehors.position.set(0, 4, 18); dehors.rotation.y = Math.PI; scene.add(dehors);
const rue = new THREE.Mesh(new THREE.PlaneGeometry(60, 12), new THREE.MeshStandardMaterial({ color: '#9aa3a6' }));
rue.rotation.x = -Math.PI / 2; rue.position.set(0, -0.01, 13); scene.add(rue);

// Plafonniers
for (const [x, z] of [[-5, -3], [0, -3], [5, -3], [-5, 3], [0, 3], [5, 3]]) {
  boite(1.6, 0.05, 0.5, new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#fff', emissiveIntensity: 1 }), x, 3.37, z, false, false);
  const pl = new THREE.PointLight('#fff8ee', 6, 9, 1.6); pl.position.set(x, 3.1, z); scene.add(pl);
}

// Enseigne : croix verte et nom
function croixVerte(x, y, z, rotY = 0, s = 1) {
  const g = new THREE.Group();
  const a = new THREE.Mesh(new THREE.BoxGeometry(0.28 * s, 0.84 * s, 0.08), M.croix);
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.84 * s, 0.28 * s, 0.08), M.croix);
  g.add(a, b); g.position.set(x, y, z); g.rotation.y = rotY; scene.add(g);
  const l = new THREE.PointLight('#3ddc97', 3, 5); l.position.set(x, y, z + (rotY ? -0.5 : 0.5)); scene.add(l);
  return g;
}
const croixFond = croixVerte(0, 2.85, -6.9);
croixVerte(0, 2.95, 6.9, Math.PI, 0.8);
const nom = etiquette('Pharmacie du Confluent', { taille: 72, coul: '#2f8f6f', fond: null, larg: 4.2 });
nom.position.set(0, 2.2, -6.85); nom.material.depthTest = true; scene.add(nom);

/* ---------- Rayonnages avec boîtes de médicaments ---------- */
const COULS = ['#e57373', '#64b5f6', '#81c784', '#ffb74d', '#ba68c8', '#4db6ac', '#f06292', '#fff176', '#90a4ae', '#ffffff'];
function rayonnage(x, z, larg, haut, prof, rotY = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rotY; scene.add(g);
  const cadre = new THREE.Mesh(new THREE.BoxGeometry(larg, haut, 0.05), M.blanc); cadre.position.set(0, haut / 2, -prof / 2); g.add(cadre);
  const nEt = Math.floor(haut / 0.42);
  for (let i = 0; i < nEt; i++) {
    const pl = new THREE.Mesh(new THREE.BoxGeometry(larg, 0.03, prof), M.blanc); pl.position.set(0, 0.25 + i * 0.42, 0); pl.castShadow = true; g.add(pl);
  }
  const nb = Math.floor(larg / 0.16) * (nEt - 1);
  const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.13, 0.22, 0.26), new THREE.MeshStandardMaterial({ roughness: 0.6 }), nb);
  const mat = new THREE.Matrix4(); const col = new THREE.Color(); let k = 0;
  for (let i = 0; i < nEt - 1; i++) for (let j = 0; j < Math.floor(larg / 0.16); j++) {
    if (k >= nb) break;
    const h = 0.16 + Math.random() * 0.1;
    mat.makeScale(1, h / 0.22, 0.7 + Math.random() * 0.3);
    mat.setPosition(-larg / 2 + 0.1 + j * 0.16, 0.27 + i * 0.42 + h / 2, 0.02);
    inst.setMatrixAt(k, mat); inst.setColorAt(k, col.set(COULS[(Math.random() * COULS.length) | 0])); k++;
  }
  inst.castShadow = true; g.add(inst);
  const cos = Math.abs(Math.cos(rotY)), sin = Math.abs(Math.sin(rotY));
  const lx = larg * cos + prof * sin, lz = larg * sin + prof * cos;
  COLLIS.push({ x1: x - lx / 2, x2: x + lx / 2, z1: z - lz / 2, z2: z + lz / 2 });
  return g;
}
rayonnage(-1.9, -6.6, 3.4, 2.5, 0.45);
rayonnage(1.9, -6.6, 3.4, 2.5, 0.45);
rayonnage(-8.7, 0.5, 3, 2.1, 0.45, Math.PI / 2);   // parapharmacie à gauche
rayonnage(8.7, 4.5, 3.6, 2.1, 0.45, -Math.PI / 2); // parapharmacie à droite
// Gondole centrale côté clients
rayonnage(4.5, 5.0, 2.2, 1.3, 0.4, 0);

/* ---------- Le comptoir ---------- */
const comptoir = boite(6.4, 1.05, 0.8, M.bois, 0, 0.525, 2.5, true);
boite(6.6, 0.06, 0.95, M.blanc, 0, 1.08, 2.5);
boite(6.4, 0.8, 0.04, M.murVert, 0, 0.5, 2.92, false);
for (const x of [-1.6, 1.6]) {
  boite(0.5, 0.32, 0.04, M.ecran, x, 1.32, 2.25).rotation.x = -0.25;
  boite(0.06, 0.18, 0.06, M.noir, x, 1.17, 2.3);
}
// Tiroirs derrière le comptoir
for (let i = 0; i < 4; i++) boite(1.4, 1.0, 0.5, M.blanc, -2.1 + i * 1.4, 0.5, 0.2, true);
for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) boite(0.3, 0.05, 0.02, M.metal, -2.1 + i * 1.4, 0.2 + j * 0.3, 0.46, false, false);

/* ---------- Le préparatoire (à droite au fond, derrière une vitre) ---------- */
boite(0.08, 2.6, 4.2, M.vitre, 4, 1.3, -4.9, false, false);
COLLIS.push({ x1: 3.95, x2: 4.05, z1: -7, z2: -2.8 });
boite(0.12, 2.6, 0.12, M.murVert, 4, 1.3, -2.8);
const paillasse = boite(3.6, 0.95, 0.8, M.blanc, 6.6, 0.475, -6.4, true);
boite(3.6, 0.05, 0.85, M.noir, 6.6, 0.97, -6.4);
boite(0.8, 0.95, 3, M.blanc, 8.5, 0.475, -4.6, true);
boite(0.85, 0.05, 3, M.noir, 8.5, 0.97, -4.6);
// Balance de précision
boite(0.4, 0.1, 0.35, M.metal, 5.6, 1.05, -6.4);
boite(0.36, 0.3, 0.3, M.vitre, 5.6, 1.25, -6.4);
cyl(0.07, 0.07, 0.02, M.metal, 5.6, 1.11, -6.4);
// Mortier et pilon
cyl(0.16, 0.1, 0.16, M.blanc, 6.4, 1.07, -6.3);
const pilon = cyl(0.025, 0.04, 0.3, M.blanc, 6.45, 1.2, -6.3); pilon.rotation.z = 0.5;
// Moule à suppositoires
boite(0.5, 0.12, 0.18, M.metal, 7.2, 1.06, -6.4);
for (let i = 0; i < 6; i++) cyl(0.025, 0.012, 0.08, new THREE.MeshStandardMaterial({ color: '#fff3c4' }), 7.0 + i * 0.08, 1.15, -6.4, 10);
// Flacons et verrerie
for (let i = 0; i < 7; i++) cyl(0.06, 0.06, 0.22, i % 2 ? M.ambre : M.verre, 7.7 + (i % 2) * 0.12, 1.1, -6.6 + i * 0.12, 14);
for (let i = 0; i < 4; i++) cyl(0.05, 0.11, 0.2, M.verre, 8.5, 1.1, -5.8 + i * 0.35, 16);
rayonnage(6.6, -6.95, 3.4, 2.6, 0.3);

/* ---------- Le coin phyto (côté clients, à gauche) ---------- */
const etagerePhyto = boite(0.5, 1.9, 3.2, M.boisFonce, -8.65, 0.95, 4.6, true);
for (let i = 0; i < 4; i++) boite(0.55, 0.04, 3.2, M.bois, -8.6, 0.35 + i * 0.45, 4.6, false);
for (let i = 0; i < 4; i++) for (let j = 0; j < 7; j++) {
  const bocal = cyl(0.08, 0.08, 0.22, M.verre, -8.55, 0.49 + i * 0.45, 3.3 + j * 0.42, 14);
  cyl(0.085, 0.085, 0.04, j % 2 ? M.boisFonce : M.metal, -8.55, 0.62 + i * 0.45, 3.3 + j * 0.42, 14);
  bocal.material = (i + j) % 3 === 0 ? M.ambre : M.verre;
}
const table = boite(1.4, 0.85, 0.9, M.bois, -6.9, 0.425, 4.6, true);
function plante(x, z, h = 0.9) {
  cyl(0.22, 0.16, 0.35, M.terre, x, 0.175, z);
  const t = cyl(0.03, 0.04, h, M.feuille2, x, 0.35 + h / 2, z, 8);
  for (let i = 0; i < 6; i++) {
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.18 + Math.random() * 0.1, 10, 8), i % 2 ? M.feuille : M.feuille2);
    f.position.set(x + (Math.random() - 0.5) * 0.4, 0.35 + h * (0.6 + Math.random() * 0.5), z + (Math.random() - 0.5) * 0.4);
    f.scale.y = 0.7; f.castShadow = true; scene.add(f);
  }
  COLLIS.push({ x1: x - 0.25, x2: x + 0.25, z1: z - 0.25, z2: z + 0.25 });
}
plante(-8.3, 6.4, 1.1); plante(-6.2, 6.3, 0.7); plante(8.4, 6.4, 1.0); plante(-8.3, 2.6, 0.8);
for (let i = 0; i < 5; i++) cyl(0.04, 0.04, 0.14, M.ambre, -7.3 + i * 0.18, 0.92, 4.4, 10); // flacons d'HE
boite(0.5, 0.02, 0.35, new THREE.MeshStandardMaterial({ color: '#f5ecd7' }), -6.6, 0.86, 4.8);

/* ---------- Le bureau (à gauche au fond) ---------- */
boite(0.08, 2.6, 4.2, M.vitre, -4, 1.3, -4.9, false, false);
COLLIS.push({ x1: -4.05, x2: -3.95, z1: -7, z2: -2.8 });
boite(0.12, 2.6, 0.12, M.murVert, -4, 1.3, -2.8);
const bureau = boite(2.2, 0.75, 1, M.bois, -6.6, 0.375, -5.6, true);
boite(0.9, 0.55, 0.05, M.noir, -6.6, 1.1, -5.9);
boite(0.84, 0.49, 0.02, M.ecran, -6.6, 1.1, -5.87);
boite(0.5, 0.02, 0.18, M.noir, -6.6, 0.77, -5.3);
for (let i = 0; i < 3; i++) boite(0.32, 0.04 + i * 0.01, 0.24, new THREE.MeshStandardMaterial({ color: ['#f6d365', '#a1c4fd', '#fbc2eb'][i] }), -7.4, 0.78 + i * 0.05, -5.4);
boite(0.55, 0.5, 0.55, M.noir, -6.6, 0.25, -4.7, true); // chaise
rayonnage(-6.6, -6.95, 3.4, 2.2, 0.35);
// Réfrigérateur
boite(0.8, 1.9, 0.7, M.blanc, -8.5, 0.95, -3.6, true);
boite(0.04, 0.6, 0.04, M.metal, -8.12, 1.2, -3.3);

/* ---------- Points de zone ---------- */
const POINTS = {
  comptoir:     { x: 0, z: 1.75, lbl: [0, 2.05, 2.5] },
  preparatoire: { x: 6.6, z: -5.6, lbl: [6.6, 2.1, -6.4] },
  phyto:        { x: -6.9, z: 3.6, lbl: [-6.9, 2.0, 4.6] },
  bureau:       { x: -6.6, z: -3.8, lbl: [-6.6, 2.1, -5.6] }
};
const MARQ = {};
for (const [id, p] of Object.entries(POINTS)) {
  const anneau = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.6, 40), new THREE.MeshBasicMaterial({ color: '#3ddc97', transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
  anneau.rotation.x = -Math.PI / 2; anneau.position.set(p.x, 0.02, p.z); scene.add(anneau);
  const rayon = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 3, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#f5c451', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
  rayon.position.set(p.x, 1.5, p.z); scene.add(rayon);
  const lbl = etiquette(ZONES[id].nom, { taille: 56, larg: 1.6 }); lbl.position.set(...p.lbl); scene.add(lbl);
  MARQ[id] = { anneau, rayon, lbl };
}

/* ---------- Personnages ---------- */
function personnage({ peau, haut, cheveux }, blouse = false) {
  const g = new THREE.Group();
  const mHaut = new THREE.MeshStandardMaterial({ color: blouse ? '#ffffff' : haut, roughness: 0.8 });
  const mPeau = new THREE.MeshStandardMaterial({ color: peau, roughness: 0.7 });
  const jambes = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.6, 4, 10), new THREE.MeshStandardMaterial({ color: '#33415c' }));
  jambes.position.y = 0.5; g.add(jambes);
  const corps = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.5, 4, 12), mHaut); corps.position.y = 1.15; g.add(corps);
  if (blouse) { const col = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.3, 0.02), new THREE.MeshStandardMaterial({ color: haut })); col.position.set(0, 1.3, 0.24); g.add(col); }
  const tete = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 16), mPeau); tete.position.y = 1.67; g.add(tete);
  const ch = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 16, 0, Math.PI * 2, 0, Math.PI / 1.9), new THREE.MeshStandardMaterial({ color: cheveux, roughness: 0.9 }));
  ch.position.y = 1.7; ch.rotation.x = -0.25; g.add(ch);
  for (const s of [-1, 1]) {
    const bras = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.45, 4, 8), mHaut); bras.position.set(0.3 * s, 1.12, 0); bras.rotation.z = 0.12 * s; g.add(bras);
    const oeil = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), M.noir); oeil.position.set(0.06 * s, 1.69, 0.155); g.add(oeil);
  }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  scene.add(g); return g;
}
const dubois = personnage({ peau: '#f1d1b5', haut: '#3ddc97', cheveux: '#6d4c41' }, true);
dubois.position.set(2.6, 0, 0.9); dubois.rotation.y = -0.6;
const lblDubois = etiquette('Mme Dubois', { taille: 48, larg: 1.1 }); lblDubois.position.set(0, 2.15, 0); dubois.add(lblDubois);

/* ---------- Joueur ---------- */
const joueur = { x: 0, z: 1.2, yaw: 0, pitch: 0, h: 1.62, r: 0.3 };
const touches = {};
addEventListener('keydown', (e) => {
  touches[e.code] = true;
  if (e.code === 'KeyE' && etat.mode === 'jeu' && !panneauOuvert) interagir();
});
addEventListener('keyup', (e) => { touches[e.code] = false; });
canvas.addEventListener('click', () => {
  if (etat.mode === 'jeu' && !panneauOuvert && document.pointerLockElement !== canvas) canvas.requestPointerLock?.();
});
addEventListener('mousemove', (e) => {
  if (document.pointerLockElement !== canvas) return;
  joueur.yaw -= e.movementX * 0.0022;
  joueur.pitch = Math.max(-1.2, Math.min(1.2, joueur.pitch - e.movementY * 0.0022));
});
document.addEventListener('pointerlockchange', () => {
  const bloque = document.pointerLockElement === canvas;
  $('#pause').classList.toggle('on', etat.mode === 'jeu' && !bloque && !panneauOuvert && etat.avaitVerrou);
  if (bloque) etat.avaitVerrou = true;
});
$('#b-reprendre').onclick = () => { $('#pause').classList.remove('on'); canvas.requestPointerLock?.(); };
$('#b-quitter').onclick = () => { $('#pause').classList.remove('on'); retourAccueil(); };

function libre(x, z) {
  if (x < -8.7 || x > 8.7 || z < -6.6 || z > 6.7) return false;
  for (const b of COLLIS) if (x > b.x1 - joueur.r && x < b.x2 + joueur.r && z > b.z1 - joueur.r && z < b.z2 + joueur.r) return false;
  return true;
}
function deplacer(dt) {
  if (document.pointerLockElement !== canvas) return;
  let av = 0, la = 0;
  if (touches.KeyW || touches.ArrowUp) av += 1;
  if (touches.KeyS || touches.ArrowDown) av -= 1;
  if (touches.KeyA || touches.ArrowLeft) la -= 1;
  if (touches.KeyD || touches.ArrowRight) la += 1;
  if (!av && !la) return;
  const v = (touches.ShiftLeft ? 4.2 : 2.8) * dt; const n = Math.hypot(av, la);
  const sx = -Math.sin(joueur.yaw), sz = -Math.cos(joueur.yaw);
  const mx = (sx * av + Math.cos(joueur.yaw) * la) / n * v;
  const mz = (sz * av - Math.sin(joueur.yaw) * la) / n * v;
  if (libre(joueur.x + mx, joueur.z)) joueur.x += mx;
  if (libre(joueur.x, joueur.z + mz)) joueur.z += mz;
}

/* ---------- Patients en 3D ---------- */
let patient3D = null;
const ENTREE = new THREE.Vector3(0, 0, 9), GUICHET = new THREE.Vector3(0, 0, 3.55);
function faireEntrer(p, fin) {
  if (patient3D) scene.remove(patient3D.g);
  const g = personnage(p.look);
  const lbl = etiquette(p.nom.replace(/ \(.*\)/, ''), { taille: 48, larg: 1.3 }); lbl.position.set(0, 2.15, 0); g.add(lbl);
  g.position.copy(ENTREE); g.rotation.y = Math.PI;
  patient3D = { g, de: ENTREE.clone(), vers: GUICHET.clone(), t: 0, dur: 4, fin, sort: false };
}
function faireSortir(fin) {
  if (!patient3D) { fin && fin(); return; }
  patient3D.de = patient3D.g.position.clone(); patient3D.vers = ENTREE.clone(); patient3D.t = 0; patient3D.dur = 3.5; patient3D.sort = true;
  patient3D.g.rotation.y = 0;
  patient3D.fin = () => { scene.remove(patient3D.g); patient3D = null; fin && fin(); };
}
function animerPatient(dt, t) {
  if (!patient3D) return;
  const P = patient3D;
  if (P.t < 1) {
    P.t = Math.min(1, P.t + dt / P.dur);
    P.g.position.lerpVectors(P.de, P.vers, P.t);
    P.g.position.y = Math.abs(Math.sin(t * 8)) * 0.04;
    if (P.t >= 1) { P.g.position.y = 0; const f = P.fin; P.fin = null; f && f(); }
  } else {
    P.g.rotation.y = Math.PI + Math.sin(t * 0.8) * 0.08;
  }
}

/* ---------- État de la partie ---------- */
const etat = { mode: 'accueil', phase: 'intro', pi: 0, ei: 0, cible: null, xp: 0, rep: 50, res: {}, avaitVerrou: false };
let panneauOuvert = false;
const patientCourant = () => JOUR.patients[etat.pi];
const sansCorps = (p) => p.age === null;

function objectif(html) { $('#objectif').innerHTML = html; }
function bulle(txt, ms = 4000) {
  const b = $('#bulle'); b.textContent = txt; b.classList.add('on');
  clearTimeout(bulle.t); bulle.t = setTimeout(() => b.classList.remove('on'), ms);
}
function majHud() {
  $('#h-pat').textContent = `${Math.min(etat.pi, JOUR.patients.length)}/${JOUR.patients.length}`;
  $('#h-xp').textContent = etat.xp;
  $('#h-rep').textContent = etat.rep;
  $('#h-repj').style.width = etat.rep + '%';
}
function viser(zone) {
  etat.cible = zone;
  for (const [id, m] of Object.entries(MARQ)) { m.anneau.material.color.set(id === zone ? '#f5c451' : '#3ddc97'); }
}

function demarrer() {
  etat.mode = 'jeu'; etat.phase = 'intro'; etat.pi = 0; etat.ei = 0; etat.xp = 0; etat.rep = 50; etat.res = {}; etat.avaitVerrou = false;
  Object.assign(joueur, { x: 0, z: 1.2, yaw: 0, pitch: 0 });
  if (patient3D) { scene.remove(patient3D.g); patient3D = null; }
  ['#accueil', '#panneau'].forEach((s) => $(s).classList.remove('on'));
  $('#hud').classList.add('on');
  viser(null); majHud();
  objectif('Va parler à <b>Mme Dubois</b>, ta maîtresse de stage (à droite du comptoir).');
  canvas.requestPointerLock?.();
}
function retourAccueil() {
  etat.mode = 'accueil';
  if (document.pointerLockElement) document.exitPointerLock();
  $('#hud').classList.remove('on'); $('#panneau').classList.remove('on'); panneauOuvert = false;
  remplirAccueil(); $('#accueil').classList.add('on');
}

function patientSuivant() {
  const p = patientCourant(); etat.ei = 0;
  if (!p) return finJournee();
  if (sansCorps(p)) {
    viser(null);
    objectif(`<b>Mme Dubois</b> t'appelle : une prescription vient d'arriver.`);
    etat.phase = 'dubois-prescription';
    bulle('Mme Dubois : « Tu peux venir voir ? »');
  } else {
    etat.phase = 'attente';
    objectif(`Un patient entre dans la pharmacie…`);
    faireEntrer(p, () => {
      etat.phase = 'accueil-patient'; viser('comptoir');
      objectif(`Accueille <b>${p.nom}</b> au <b>comptoir</b>.`);
    });
  }
}
function etapeSuivante() {
  const p = patientCourant(); const e = p.etapes[etat.ei];
  if (!e) return patientTermine();
  etat.phase = 'etape'; viser(e.zone);
  const ici = e.zone === 'comptoir' ? 'Reste au <b>comptoir</b>' : `Va au <b>${ZONES[e.zone].nom.replace(/^Le /, '')}</b>`;
  objectif(`${p.nom} · ${ici} (${ZONES[e.zone].desc.toLowerCase()}).`);
}
function patientTermine() {
  const p = patientCourant(); viser(null);
  const cles = Object.keys(etat.res).filter((k) => k.startsWith(p.id + '-'));
  const ok = cles.filter((k) => etat.res[k]).length;
  const merci = ok === cles.length ? 'Merci beaucoup, c\'est très clair !' : ok >= cles.length / 2 ? 'Merci, je vais faire comme ça.' : 'Hmm… je vais redemander à la pharmacienne.';
  if (!sansCorps(p)) bulle(`${p.nom} : « ${merci} »`);
  else bulle('Mme Dubois : « Préparation terminée, merci ! »');
  etat.pi++; majHud(); etat.phase = 'transition';
  objectif('…');
  const suite = () => setTimeout(patientSuivant, 1200);
  if (sansCorps(p)) suite(); else faireSortir(suite);
}

/* ---------- Interaction ---------- */
function proche(x, z, d = 1.6) { return Math.hypot(joueur.x - x, joueur.z - z) < d; }
function quoiFaire() {
  const dPres = proche(dubois.position.x, dubois.position.z, 1.7);
  if (etat.phase === 'intro' && dPres) return { txt: 'Parler à Mme Dubois', f: ouvrirIntro };
  if (etat.phase === 'dubois-prescription' && dPres) return { txt: 'Parler à Mme Dubois', f: ouvrirPatient };
  if (etat.phase === 'accueil-patient' && proche(POINTS.comptoir.x, POINTS.comptoir.z, 1.9)) return { txt: `Accueillir ${patientCourant().nom}`, f: ouvrirPatient };
  if (etat.phase === 'etape') {
    const z = patientCourant().etapes[etat.ei].zone; const P = POINTS[z];
    if (proche(P.x, P.z, 1.9)) return { txt: z === 'comptoir' ? 'Répondre au patient' : `Travailler ici : ${ZONES[z].nom.toLowerCase()}`, f: ouvrirEtape };
  }
  if (dPres && etat.phase !== 'fin') return { txt: 'Demander conseil à Mme Dubois', f: () => bulle('Mme Dubois : « Suis l\'objectif en haut à gauche. Le rayon doré t\'indique où aller. »') };
  return null;
}
function interagir() { const a = quoiFaire(); if (a) a.f(); }

/* ---------- Panneau ---------- */
function ouvrirPanneau(html) {
  panneauOuvert = true; if (document.pointerLockElement) document.exitPointerLock();
  $('#pause').classList.remove('on');
  $('#fiche').innerHTML = html; $('#panneau').classList.add('on'); $('#invite').classList.remove('on');
}
function fermerPanneau() {
  panneauOuvert = false; $('#panneau').classList.remove('on');
  if (etat.mode === 'jeu') canvas.requestPointerLock?.();
}
function avatar(look, blouse) {
  return `<div class="avatar" style="background:radial-gradient(circle at 50% 38%,${look.peau} 0 30%,transparent 31%),radial-gradient(circle at 50% 30%,${look.cheveux} 0 36%,transparent 37%),linear-gradient(${blouse ? '#fff' : look.haut},${blouse ? '#fff' : look.haut})"></div>`;
}
const LOOK_DUBOIS = { peau: '#f1d1b5', haut: '#3ddc97', cheveux: '#6d4c41' };
function ouvrirIntro() {
  ouvrirPanneau(`<div class="tete">${avatar(LOOK_DUBOIS, true)}<div><h3>Mme Dubois</h3><small>Pharmacienne titulaire, ta maîtresse de stage</small></div></div>
    <p class="parole">${JOUR.intro}</p>
    <p class="contexte">Les quatre zones : le <b>comptoir</b> (devant toi), le <b>préparatoire</b> (au fond à droite), le <b>coin phyto</b> (côté clients, à gauche) et le <b>bureau</b> (au fond à gauche).</p>
    <div class="pied"><small>${JOUR.patients.length} patients · ${NB_Q} questions</small><button class="btn" id="b-go">C'est parti !</button></div>`);
  $('#b-go').onclick = () => { fermerPanneau(); patientSuivant(); };
}
function ouvrirPatient() {
  const p = patientCourant(); const e = p.etapes[0];
  const qui = sansCorps(p) ? `<div class="tete">${avatar(LOOK_DUBOIS, true)}<div><h3>Prescription magistrale</h3><small>${p.nom}</small></div></div>`
    : `<div class="tete">${avatar(p.look)}<div><h3>${p.nom}</h3><small>${p.age} ans</small></div></div>`;
  const suite = e.zone === 'comptoir' ? 'Répondre' : `Aller au ${ZONES[e.zone].nom.replace(/^Le /, '').toLowerCase()}`;
  ouvrirPanneau(`${qui}<p class="parole">${p.arrive}</p><p class="contexte">${p.contexte}</p>
    <div class="pied"><small>${p.etapes.length > 1 ? p.etapes.length + ' étapes' : '1 étape'}</small><button class="btn" id="b-go">${suite}</button></div>`);
  $('#b-go').onclick = () => {
    if (e.zone === 'comptoir') { etat.phase = 'etape'; ouvrirEtape(); }
    else { fermerPanneau(); etapeSuivante(); }
  };
}
function ouvrirEtape() {
  const p = patientCourant(); const e = p.etapes[etat.ei];
  const cles = e.qs.map((_, qi) => `${p.id}-${etat.ei}-${qi}`);
  poserQuestions(cles, { titre: p.nom, sous: ZONES[e.zone].nom, look: sansCorps(p) ? LOOK_DUBOIS : p.look, blouse: sansCorps(p) }, () => {
    fermerPanneau(); etat.ei++;
    const prochaine = p.etapes[etat.ei];
    if (prochaine) {
      etapeSuivante();
      const ou = prochaine.zone === 'comptoir' ? 'Je reviens au comptoir avec la réponse.' : `Je vais vérifier ça au ${ZONES[prochaine.zone].nom.replace(/^Le /, '').toLowerCase()}.`;
      bulle(`Toi : « ${ou} »`);
    } else patientTermine();
  });
}

/* ---------- Questions ---------- */
function melanger(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [b[i], b[j]] = [b[j], b[i]]; } return b; }
function lireNombre(s) { const v = parseFloat(String(s).replace(',', '.').replace(/\s/g, '')); return isNaN(v) ? null : v; }
function fmt(n) { return String(+n.toFixed(3)).replace('.', ','); }

function poserQuestions(cles, entete, fini, modeFautes = false) {
  let i = 0;
  const montrer = () => {
    const cle = cles[i]; const { q } = QIDX[cle]; const c = COURS[q.c];
    let corps = '';
    if (q.t === 'qcm') {
      const ordre = melanger(q.o.map((_, k) => k));
      corps = `<div class="opts">${ordre.map((k) => `<button class="opt" data-k="${k}">${q.o[k]}</button>`).join('')}</div>`;
    } else if (q.t === 'vf') {
      corps = `<div class="opts"><button class="opt" data-v="1">Vrai</button><button class="opt" data-v="0">Faux</button></div>`;
    } else {
      corps = `<div class="calc"><input id="rep" inputmode="decimal" placeholder="Ta réponse" autocomplete="off"><span>${q.u || ''}</span><button class="btn" id="b-val">Valider</button></div>`;
    }
    ouvrirPanneau(`<div class="tete">${avatar(entete.look, entete.blouse)}<div><h3>${entete.titre}</h3><small>${entete.sous} · question ${i + 1}/${cles.length}</small></div></div>
      <span class="tag" style="background:${c.coul}22;color:${c.coul}">${c.nom}</span>
      <p class="q">${q.q}</p>${corps}<div id="retour"></div>`);
    const repondre = (bon, el) => {
      document.querySelectorAll('.opt').forEach((b) => (b.disabled = true));
      if (el) el.classList.add(bon ? 'bon' : 'faux');
      if (!bon && q.t === 'qcm') document.querySelector(`.opt[data-k="${q.r}"]`)?.classList.add('bon');
      if (!bon && q.t === 'vf') document.querySelector(`.opt[data-v="${q.r ? 1 : 0}"]`)?.classList.add('bon');
      const inp = $('#rep'); if (inp) { inp.disabled = true; $('#b-val').disabled = true; }
      noter(cle, q, bon, modeFautes);
      const sol = q.t === 'calc' ? `<b>Réponse : ${fmt(q.r)} ${q.u || ''}</b><br>` : '';
      $('#retour').innerHTML = `<div class="retour ${bon ? 'bon' : 'faux'}"><b>${bon ? 'Exact !' : 'Pas tout à fait.'}</b> ${sol}${q.x}<span class="src">À revoir : ${q.src}</span></div>
        <div class="pied"><small>${modeFautes ? '' : `XP ${etat.xp} · réputation ${etat.rep}`}</small><button class="btn" id="b-suite">${i + 1 < cles.length ? 'Question suivante' : 'Terminer'}</button></div>`;
      $('#b-suite').onclick = () => { i++; if (i < cles.length) montrer(); else fini(); };
      $('#b-suite').focus();
    };
    document.querySelectorAll('.opt').forEach((b) => b.onclick = () => {
      if (q.t === 'qcm') repondre(+b.dataset.k === q.r, b);
      else repondre((b.dataset.v === '1') === q.r, b);
    });
    if (q.t === 'calc') {
      const val = () => { const v = lireNombre($('#rep').value); if (v === null) { $('#rep').focus(); return; } repondre(Math.abs(v - q.r) <= q.tol, null); };
      $('#b-val').onclick = val; $('#rep').onkeydown = (ev) => { ev.stopPropagation(); if (ev.key === 'Enter') val(); };
      setTimeout(() => $('#rep')?.focus(), 50);
    }
  };
  montrer();
}
function noter(cle, q, bon, modeFautes) {
  const st = S.stats[q.c] || (S.stats[q.c] = { ok: 0, tot: 0 });
  st.tot++; if (bon) st.ok++;
  if (bon) S.fautes = S.fautes.filter((k) => k !== cle);
  else if (!S.fautes.includes(cle)) S.fautes.push(cle);
  if (!modeFautes) {
    etat.res[cle] = bon;
    etat.xp += bon ? (q.t === 'calc' ? 15 : 10) : 2;
    etat.rep = Math.max(0, Math.min(100, etat.rep + (bon ? 4 : -6)));
    majHud();
  } else S.xp += bon ? 5 : 0;
  sauver();
}

/* ---------- Fin de journée ---------- */
function finJournee() {
  etat.phase = 'fin'; viser(null);
  objectif('Journée terminée ! Va voir <b>Mme Dubois</b> pour ton bilan.');
  setTimeout(ouvrirBilan, 600);
}
function ouvrirBilan() {
  const cles = Object.keys(etat.res); const ok = cles.filter((k) => etat.res[k]).length;
  const pc = cles.length ? ok / cles.length : 0;
  const et = pc >= 0.9 ? 3 : pc >= 0.7 ? 2 : pc >= 0.5 ? 1 : 0;
  S.etoiles[JOUR.id] = Math.max(S.etoiles[JOUR.id] || 0, et); S.xp += etat.xp; S.parties++; sauver();
  const parCours = {};
  cles.forEach((k) => { const c = QIDX[k].q.c; (parCours[c] ||= { ok: 0, tot: 0 }).tot++; if (etat.res[k]) parCours[c].ok++; });
  const forts = [], revoir = [];
  for (const [c, v] of Object.entries(parCours)) { const r = v.ok / v.tot; if (r >= 0.8) forts.push(COURS[c].nom); else if (r < 0.6) revoir.push(COURS[c].nom); }
  const mot = et === 3 ? 'Excellente journée, je pourrais presque te laisser seule au comptoir !' : et === 2 ? 'Belle journée, tu as de bons réflexes.' : et === 1 ? 'Un bon début. On reprend ensemble ce qui a coincé.' : 'Pas de panique, c\'est le premier jour. Revois tes fautes et recommence.';
  ouvrirPanneau(`<div class="tete">${avatar(LOOK_DUBOIS, true)}<div><h3>Bilan de la journée 1</h3><small>Mme Dubois</small></div></div>
    <div class="etoiles">${[0, 1, 2].map((i) => `<span class="${i < et ? '' : 'off'}">★</span>`).join('')}</div>
    <p class="parole">${mot}</p>
    <p>${ok}/${cles.length} bonnes réponses · ${etat.xp} XP · réputation ${etat.rep}/100</p>
    ${Object.entries(parCours).map(([c, v]) => ligneCours(c, v)).join('')}
    ${forts.length ? `<p class="contexte"><b>Tes points forts :</b> ${forts.join(', ')}.</p>` : ''}
    ${revoir.length ? `<p class="contexte"><b>À revoir en priorité :</b> ${revoir.join(', ')}.</p>` : ''}
    <div class="pied"><button class="btn sec" id="b-acc">Accueil</button><button class="btn" id="b-rejouer">Rejouer la journée</button></div>`);
  $('#b-acc').onclick = retourAccueil;
  $('#b-rejouer').onclick = () => { panneauOuvert = false; demarrer(); };
}
function ligneCours(c, v) {
  const r = v.tot ? Math.round(100 * v.ok / v.tot) : 0;
  return `<div class="ligne-cours"><span>${COURS[c].nom}</span><div class="jauge"><i style="width:${r}%;background:${COURS[c].coul}"></i></div><span>${r} %</span></div>`;
}

/* ---------- Accueil, carnet, fautes ---------- */
function remplirAccueil() {
  const et = S.etoiles[JOUR.id] || 0;
  $('#stats-accueil').innerHTML = `<span class="pastille">Journée 1 : ${'★'.repeat(et)}${'☆'.repeat(3 - et)}</span><span class="pastille">${S.xp} XP</span><span class="pastille">${S.fautes.length} faute${S.fautes.length > 1 ? 's' : ''} à revoir</span>`;
  $('#b-fautes').disabled = !S.fautes.length;
}
$('#b-jouer').onclick = demarrer;
$('#b-carnet').onclick = () => {
  etat.mode = 'carnet'; $('#accueil').classList.remove('on');
  const lignes = Object.keys(COURS).filter((c) => S.stats[c]).map((c) => ligneCours(c, S.stats[c])).join('');
  ouvrirPanneau(`<div class="tete">${avatar(LOOK_DUBOIS, true)}<div><h3>Carnet de stage</h3><small>Toutes tes réponses, toutes parties confondues</small></div></div>
    ${lignes || '<p class="contexte">Ton carnet est encore vide : commence la journée 1.</p>'}
    <p class="contexte">${S.parties} journée${S.parties > 1 ? 's' : ''} jouée${S.parties > 1 ? 's' : ''} · ${S.xp} XP au total · ${S.fautes.length} question${S.fautes.length > 1 ? 's' : ''} à revoir</p>
    <div class="pied"><span></span><button class="btn" id="b-acc">Retour</button></div>`);
  $('#b-acc').onclick = () => { panneauOuvert = false; $('#panneau').classList.remove('on'); retourAccueil(); };
};
$('#b-fautes').onclick = () => {
  if (!S.fautes.length) return;
  etat.mode = 'fautes'; $('#accueil').classList.remove('on');
  poserQuestions(S.fautes.filter((k) => QIDX[k]).slice(), { titre: 'Refaire mes fautes', sous: 'Révision', look: LOOK_DUBOIS, blouse: true }, () => {
    panneauOuvert = false; $('#panneau').classList.remove('on'); retourAccueil();
  }, true);
};
$('#b-forcer').onclick = () => $('#mobile').classList.remove('on');
if (matchMedia('(pointer: coarse)').matches && !matchMedia('(pointer: fine)').matches) $('#mobile').classList.add('on');
remplirAccueil();

/* ---------- Boucle ---------- */
const horloge = new THREE.Clock();
function boucle() {
  const dt = Math.min(0.05, horloge.getDelta()); const t = horloge.elapsedTime;
  if (etat.mode === 'jeu') {
    if (!panneauOuvert) deplacer(dt);
    camera.position.set(joueur.x, joueur.h, joueur.z);
    camera.rotation.set(joueur.pitch, joueur.yaw, 0, 'YXZ');
    const a = !panneauOuvert && quoiFaire();
    $('#invite').classList.toggle('on', !!a);
    if (a) $('#invite-txt').textContent = a.txt;
  } else {
    const ang = t * 0.08;
    camera.position.set(Math.sin(ang) * 7.5, 3.0, 2 + Math.cos(ang) * 4.5);
    camera.lookAt(0, 1.1, -1.5);
  }
  for (const [id, m] of Object.entries(MARQ)) {
    const actif = etat.mode === 'jeu' && etat.cible === id;
    m.rayon.material.opacity = actif ? 0.12 + Math.sin(t * 3) * 0.06 : 0;
    m.anneau.material.opacity = actif ? 0.8 : 0.3;
    m.anneau.scale.setScalar(actif ? 1 + Math.sin(t * 3) * 0.08 : 1);
    m.lbl.visible = etat.mode !== 'jeu' || Math.hypot(joueur.x - m.lbl.position.x, joueur.z - m.lbl.position.z) > 2.6;
  }
  croixFond.children.forEach((c) => (c.material.emissiveIntensity = 1.3 + Math.sin(t * 2) * 0.4));
  dubois.rotation.y = -0.6 + Math.sin(t * 0.6) * 0.1;
  const loin = (o) => etat.mode !== 'jeu' || Math.hypot(joueur.x - o.position.x, joueur.z - o.position.z) > 2.4;
  lblDubois.visible = loin(dubois);
  if (patient3D) patient3D.g.children[patient3D.g.children.length - 1].visible = loin(patient3D.g);
  animerPatient(dt, t);
  renderer.render(scene, camera);
  requestAnimationFrame(boucle);
}
boucle();
window.__jeu = { etat, S, NB_Q, joueur, interagir, quoiFaire };
