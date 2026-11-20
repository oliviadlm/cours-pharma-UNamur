// Pots réalistes de l'étagère des excipients : une image par excipient et par niveau de maîtrise.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const W = 368, H = 472;                       // rendu 2x de la vignette 92 x 118 (réduit ensuite)
export const MUR = '#efe2cf', SOL = '#c58a58';
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
const ENV = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;
const RNG = (s => () => (s = (s * 16807) % 2147483647) / 2147483647);
let rnd = RNG(7);
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function bruit(g, w, h, a, n) { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(${rnd() < .5 ? '0,0,0' : '255,255,255'},${rnd() * a / 255})`; g.fillRect(rnd() * w, rnd() * h, 2, 2); } }
const BUMP = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#808080'; c.fillRect(0, 0, w, h); bruit(c, w, h, 120, 60000); });
BUMP.colorSpace = THREE.NoColorSpace;
const VERRE = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .03, transmission: 1, thickness: .012, ior: 1.5, side: THREE.DoubleSide });
const AMBRE = new THREE.MeshPhysicalMaterial({ color: '#c77a2c', roughness: .05, transmission: .9, thickness: .025, ior: 1.5, attenuationColor: new THREE.Color('#7a3d0c'), attenuationDistance: .05, side: THREE.DoubleSide });
const NOIR = new THREE.MeshStandardMaterial({ color: '#2b2a2e', roughness: .5 });
const BLANC = new THREE.MeshStandardMaterial({ color: '#f4f1ea', roughness: .45 });
const ALU = new THREE.MeshStandardMaterial({ color: '#c9ccd1', roughness: .28, metalness: .9 });
const tour = (p, mat, seg = 64) => new THREE.Mesh(new THREE.LatheGeometry(p.map(q => new THREE.Vector2(q[0], q[1])), seg), mat);
const cyl = (r, h, mat, y) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 48), mat); m.position.y = y; return m; };

// ---------- matières ----------
function liquide(r, h, col, visq) {
  const g = new THREE.Group();
  g.add(tour([[0, .003], [r, .003], [r, h], [0, h + (visq ? .002 : 0)]], new THREE.MeshPhysicalMaterial({ color: col, roughness: .08, clearcoat: 1, clearcoatRoughness: .05, sheen: .3, sheenColor: new THREE.Color('#ffffff') })));
  const men = new THREE.Mesh(new THREE.TorusGeometry(r * .985, visq ? .0035 : .0022, 8, 64), new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: .85, roughness: .1 }));
  men.rotation.x = Math.PI / 2; men.position.y = h; g.add(men); return g;
}
function tasPoudre(r, h, col, grain) {
  const pts = [[0, 0], [r, 0]]; for (let j = 1; j <= 16; j++) pts.push([r, h * j / 16]); for (let i = 23; i >= 0; i--) { const x = r * i / 24; pts.push([x, h + (1 - (x / r) ** 1.6) * Math.min(h, .03) * .5 + (rnd() - .5) * .002 * grain]); }
  const g = new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), 72); const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); if (y > h * .98) pos.setY(i, y + (rnd() - .5) * .003 * grain); } g.computeVertexNormals();
  const t = canvasTex(256, 256, (c, w, hh) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, hh); for (let i = 0; i < 900; i++) { const v = 200 + rnd() * 55, a = .25 + rnd() * .35; c.fillStyle = `rgba(${v | 0},${v | 0},${(v - 8) | 0},${a})`; c.beginPath(); c.arc(rnd() * w, rnd() * hh, 1 + rnd() * (3 + 5 * grain), 0, 7); c.fill(); } });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 2);
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: col, map: t, bumpMap: BUMP, bumpScale: .6 + grain, roughness: 1 }));
}
function voile(r, y0, y1, col) { const a = canvasTex(256, 64, (c, w, h) => { const gr = c.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, '#fff'); gr.addColorStop(1, '#000'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'multiply'; for (let i = 0; i < 120; i++) { c.fillStyle = `rgba(0,0,0,${rnd() * .7})`; c.fillRect(rnd() * w, 0, 1 + rnd() * 4, h * rnd()); } }); a.colorSpace = THREE.NoColorSpace;
  return tour([[r, y0], [r, y1]], new THREE.MeshStandardMaterial({ color: col, transparent: true, opacity: .55, alphaMap: a, roughness: 1, side: THREE.DoubleSide, depthWrite: false })); }
function particules(r, h, forme, col) {
  const g = new THREE.Group(); const c = new THREE.Color(col);
  const geo = { cristal: new THREE.IcosahedronGeometry(1, 0), granule: new THREE.SphereGeometry(1, 9, 7), flocon: new THREE.CircleGeometry(1, 5), pastille: new THREE.CylinderGeometry(1, 1, .45, 18), eclat: new THREE.CircleGeometry(1, 6) }[forme];
  const mat = new THREE.MeshPhysicalMaterial({ color: col, roughness: forme === 'cristal' ? .12 : forme === 'granule' ? .55 : .3, clearcoat: forme === 'cristal' || forme === 'eclat' ? 1 : .3, side: THREE.DoubleSide, envMapIntensity: forme === 'cristal' ? 1.6 : 1 });
  const taille = { cristal: [.0035, .0065], granule: [.0035, .005], flocon: [.006, .011], pastille: [.0055, .0065], eclat: [.007, .013] }[forme];
  const coeur = cyl(r * .8, h, new THREE.MeshStandardMaterial({ color: c.clone().multiplyScalar(.9), roughness: 1, bumpMap: BUMP, bumpScale: 1 }), h / 2); g.add(coeur);
  const pl = [];
  const surf = 2 * Math.PI * r * h + Math.PI * r * r; const s2 = ((taille[0] + taille[1]) / 2) ** 2;
  const n = Math.min(4000, Math.round(surf / s2 * 1.4));
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2; let rr, y;
    if (rnd() < 2 * Math.PI * r * h / surf) { rr = r * (forme === 'eclat' || forme === 'flocon' ? .8 + rnd() * .08 : .84 + rnd() * .11); y = rnd() * h; } else { rr = r * Math.sqrt(rnd()) * .95; y = h + (rnd() - .3) * .004; }
    pl.push([Math.cos(a) * rr, Math.max(.002, y), Math.sin(a) * rr]);
  }
  const im = new THREE.InstancedMesh(geo, mat, pl.length); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3();
  pl.forEach((p, i) => { const s = taille[0] + rnd() * (taille[1] - taille[0]); e.set(rnd() * 6.3, rnd() * 6.3, rnd() * 6.3); q.setFromEuler(e); sc.set(s, s * (forme === 'cristal' ? .7 + rnd() * .6 : 1), s); m4.compose(new THREE.Vector3(...p), q, sc); im.setMatrixAt(i, m4);
    const k = .88 + rnd() * .2; im.setColorAt(i, c.clone().multiplyScalar(k)); });
  g.add(im); return g;
}
function creme(r, h, col, transl) {
  const g = new THREE.LatheGeometry([[0, 0], [r, 0], [r, h], [r * .7, h + .004], [r * .35, h + .01], [r * .15, h + .016], [0, h + .013]].map(p => new THREE.Vector2(p[0], p[1])), 64);
  const pos = g.attributes.position; for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); if (y > h) { const a = Math.atan2(pos.getZ(i), pos.getX(i)); pos.setY(i, y + Math.sin(a * 3 + y * 400) * .0018); } } g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ color: col, roughness: transl ? .06 : .35, clearcoat: transl ? 1 : .3, clearcoatRoughness: .05, emissive: new THREE.Color(col), emissiveIntensity: transl ? .22 : 0 }));
}

// ---------- contenants ----------
function flacon(s, lv) { const g = new THREE.Group(), h = .19, r = .05;
  g.add(tour([[0, 0], [r, 0], [r, h * .62], [r * .55, h * .82], [r * .34, h * .86], [r * .34, h], [0, h]], s.ambre ? AMBRE : VERRE));
  g.add(liquide(r * .94, Math.max(.012, h * .6 * lv), s.col, s.visq)); g.add(cyl(r * .38, h * .14, NOIR, h * 1.04)); return g; }
function compteGouttes(s, lv) { const g = new THREE.Group(), h = .13, r = .04;
  g.add(tour([[0, 0], [r, 0], [r, h * .7], [r * .5, h * .86], [r * .4, h * .9], [r * .4, h], [0, h]], AMBRE));
  g.add(liquide(r * .93, Math.max(.01, h * .65 * lv), s.col, false)); g.add(cyl(r * .45, .02, NOIR, h + .01));
  g.add(tour([[0, h + .02], [r * .34, h + .02], [r * .36, h + .04], [r * .3, h + .065], [0, h + .07]], new THREE.MeshStandardMaterial({ color: '#2f2d30', roughness: .7 }))); return g; }
function bocal(s, lv) { const g = new THREE.Group(), h = .165, r = .062, ri = r * .93, hh = Math.max(.02, h * (s.k === 'poudre' ? .64 : .78) * lv);
  g.add(tour([[0, 0], [r * .95, 0], [r, .01], [r, h * .92], [r * .9, h], [0, h]], s.ambre ? AMBRE : VERRE));
  if (s.k === 'poudre') { g.add(tasPoudre(ri, hh, s.col, s.grain ?? .5)); g.add(voile(ri * 1.003, hh, Math.min(h * .9, hh + .035), s.col)); }
  else if (s.k === 'couches') { const cs = s.cols, n = cs.length; cs.forEach((c, i) => { const m = tasPoudre(ri, hh / n * (i === n - 1 ? 1 : 1.0), c, .6); m.position.y = hh / n * i; if (i < n - 1) m.scale.y = 1; g.add(m); }); }
  else g.add(particules(ri, hh, s.k, s.col));
  g.add(cyl(r * .98, .03, s.capBlanc ? BLANC : NOIR, h + .015)); return g; }
function pot(s, lv) { const g = new THREE.Group(), h = .075, r = .062;
  g.add(tour([[0, 0], [r * .96, 0], [r, .008], [r, h], [r * .97, h * 1.02], [0, h * 1.02]], VERRE)); g.add(creme(r * .94, Math.max(.008, h * .8 * lv), s.col, s.transl));
  return g; }
function aerosol(s) { const g = new THREE.Group(), h = .15, r = .038;
  g.add(tour([[0, 0], [r * .9, 0], [r, .006], [r, h], [r * .7, h + .02], [r * .25, h + .028], [0, h + .03]], ALU));
  const band = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.004, r * 1.004, h * .55, 48, 1, true), new THREE.MeshStandardMaterial({ color: s.col, roughness: .35, metalness: .3 })); band.position.y = h * .45; g.add(band);
  g.add(cyl(.006, .012, NOIR, h + .036)); g.add(cyl(.011, .008, BLANC, h + .046)); return g; }

// ---------- décor de la vignette ----------
const scene = new THREE.Scene(); scene.background = new THREE.Color(MUR); scene.environment = ENV; scene.environmentIntensity = .6;
const base = (c) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });
const mur = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), base(MUR)); mur.position.set(0, 1, -.1); scene.add(mur);
const sol = new THREE.Mesh(new THREE.PlaneGeometry(2, .19), base(SOL)); sol.rotation.x = -Math.PI / 2; sol.position.set(0, 0, -.005); scene.add(sol);
const om1 = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShadowMaterial({ opacity: .22 })); om1.position.set(0, 1, -.0995); om1.receiveShadow = true; scene.add(om1);
const om2 = new THREE.Mesh(new THREE.PlaneGeometry(2, .19), new THREE.ShadowMaterial({ opacity: .3 })); om2.rotation.x = -Math.PI / 2; om2.position.set(0, .0005, -.005); om2.receiveShadow = true; scene.add(om2);
const ao = new THREE.Mesh(new THREE.PlaneGeometry(.2, .2), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false, map: canvasTex(256, 256, (g, w, h) => { const gr = g.createRadialGradient(128, 128, 30, 128, 128, 128); gr.addColorStop(0, 'rgba(40,20,5,.55)'); gr.addColorStop(.5, 'rgba(40,20,5,.25)'); gr.addColorStop(1, 'rgba(40,20,5,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }) }));
ao.rotation.x = -Math.PI / 2; ao.position.set(0, .001, 0); scene.add(ao);
scene.add(new THREE.HemisphereLight('#fff3e6', '#7a5a46', .5));
const L = new THREE.DirectionalLight('#ffe9d0', 2.3); L.position.set(-.35, 1.1, .9); L.castShadow = true; L.shadow.mapSize.set(2048, 2048); L.shadow.radius = 6; L.shadow.bias = -.0004;
Object.assign(L.shadow.camera, { left: -.2, right: .2, top: .3, bottom: -.1, near: .3, far: 3 }); scene.add(L); scene.add(L.target);
const F = new THREE.DirectionalLight('#eaf2ff', .55); F.position.set(.8, .4, 1.2); scene.add(F);
// caméra : bord avant de la planche (z = .09) exactement en bas de l'image
const cam = new THREE.PerspectiveCamera(15, W / H, .05, 5); const Z = .92, Y = .2; cam.position.set(0, Y, Z);
let lo = -.2, hi = .4; for (let i = 0; i < 40; i++) { const t = (lo + hi) / 2; cam.lookAt(0, t, 0); cam.updateMatrixWorld(); const p = new THREE.Vector3(0, 0, .09).project(cam); if (p.y < -1) hi = t; else lo = t; }
const solHaut = (1 - new THREE.Vector3(0, 0, -.1).project(cam).y) / 2;   // fraction depuis le haut où commence le sol
let objet = null;
const FAB = { liq: flacon, cg: compteGouttes, bocal, pot, gaz: aerosol };
window.__pot = (s, lv) => { rnd = RNG(1 + (s.seed || 1)); if (objet) scene.remove(objet);
  objet = FAB[s.c](s, lv); objet.position.z = -.008; objet.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); scene.add(objet);
  renderer.render(scene, cam); return renderer.domElement.toDataURL('image/png'); };
window.__meta = () => ({ solHaut, MUR, SOL });
window.__pret = true;
