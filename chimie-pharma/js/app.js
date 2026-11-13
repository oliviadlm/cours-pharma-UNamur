/* Officine de révision — Chimie pharmaceutique systématique (Tome 1, partie 1)
   Méthodes : récupération active, répétition espacée (FSRS), entrelacement, double codage,
   élaboration (« pourquoi ? »), génération (dessin, réponse tapée), exemples concrets (officine). */
(function () {
  "use strict";
  const C = window.COURS;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const DAY = 86400000;
  const MOL = Object.fromEntries(C.molecules.map(m => [m.id, m]));
  const CHAP = Object.fromEntries(C.chapitres.map(c => [c.id, c]));
  const CHAP_COURT = {
    "01_bases_sulfamides": "Bases & sulfamidés", "02_penicillines": "Pénicillines", "03_cephalo_betalactames": "Céphalosporines & β-lactames",
    "04_phenicols_tetra_macrolides_aminosides_lincos": "Phénicols, tétracyclines, macrolides, aminosides", "05_polypeptides_autres_ATB": "Polypeptides & autres ATB",
    "06_quinolones_urinaires_TB_lepre": "Quinolones, urinaires, TB, lèpre", "07_antimycosiques_antiprotozoaires": "Antimycosiques & antiprotozoaires",
    "08_antimalariques_anthelminthiques_desinfectants": "Antimalariques, anthelminthiques, désinfectants", "09_antiviraux_respi_herpes_cmv": "Antiviraux : grippe, herpès, CMV",
    "10_antiviraux_vih_hepatites": "Antiviraux : VIH & hépatites", "11_antitumoraux_alkylants_antimetabolites": "Antitumoraux : alkylants & antimétabolites",
    "12_antitumoraux_intercalants_topo_tubuline_hormones": "Antitumoraux : intercalants, topo, tubuline, hormones", "13_antitumoraux_therapies_ciblees_immuno": "Antitumoraux : thérapies ciblées & immuno",
    "14_pesticides_immunite": "Pesticides & immunité"
  };
  const chapNom = id => CHAP_COURT[id] || (CHAP[id] && CHAP[id].titre) || id;
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/®/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const today = () => { const d = new Date(); return d.toISOString().slice(0, 10); };
  const ymd = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  // ---------- état & persistance ----------
  const DEFAULT = { cartes: {}, journal: {}, reglages: { examen: "2027-01-11", retention: 0.9, chapitres: C.chapitres.map(c => c.id), nouvellesMax: 0 }, jeux: {}, perso: [] };
  let S = JSON.parse(JSON.stringify(DEFAULT));
  let serveur = false, saveTimer = null;
  async function charger() {
    try {
      const r = await fetch("api/etat", { cache: "no-store" });
      if (r.ok) { serveur = true; const j = await r.json(); if (j && j.cartes) S = Object.assign(S, j); }
      try { const ph = await (async () => { try { const r = await fetch("api/photos", { cache: "no-store" }); if (r.ok) return await r.json(); } catch (e) { } return await (await fetch("photos/liste.json", { cache: "no-store" })).json(); })(); window.PHOTOS = new Set(ph.map(f => f.replace(/\.[^.]+$/, ""))); window.PHOTOS_EXT = Object.fromEntries(ph.map(f => [f.replace(/\.[^.]+$/, ""), f])); } catch (e) { }
      const q = await fetch("api/questions", { cache: "no-store" });
      if (q.ok) { const arr = await q.json(); if (Array.isArray(arr)) S.perso = arr; }
    } catch (e) { serveur = false; }
    if (!serveur) { try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) { } }
    if (!serveur) { try { const l = localStorage.getItem("officine-etat"); if (l) S = Object.assign(S, JSON.parse(l)); } catch (e) { } }
    S.reglages = Object.assign({}, DEFAULT.reglages, S.reglages || {});
    // nouveaux chapitres ajoutés au site : actifs par défaut (une seule fois)
    const connus = new Set(S.reglages.chapitresConnus || ["01_bases_sulfamides", "02_penicillines", "03_cephalo_betalactames", "04_phenicols_tetra_macrolides_aminosides_lincos", "05_polypeptides_autres_ATB", "06_quinolones_urinaires_TB_lepre", "07_antimycosiques_antiprotozoaires"]);
    for (const c of C.chapitres) if (!connus.has(c.id)) { if (!S.reglages.chapitres.includes(c.id)) S.reglages.chapitres.push(c.id); connus.add(c.id); }
    S.reglages.chapitresConnus = [...connus];
  }
  function sauver(questionsAussi) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      const etat = Object.assign({}, S); delete etat.perso;
      try { localStorage.setItem("officine-etat", JSON.stringify(S)); } catch (e) { }
      if (!serveur) return;
      try {
        await fetch("api/etat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(etat) });
        await fetch("api/resume", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(resume()) });
        if (questionsAussi) await fetch("api/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(S.perso) });
      } catch (e) { }
    }, 500);
  }
  function journal(champ, n = 1) { const j = S.journal[today()] || (S.journal[today()] = { revues: 0, justes: 0, nouvelles: 0, secondes: 0 }); j[champ] = (j[champ] || 0) + n; }

  // ---------- catalogue de cartes ----------
  const PRIO = { rouge: 0, dessiner: 1, bleu: 2, reconnaitre: 3, concept: 4 };
  let CARTES = [];
  function construireCartes() {
    const L = [];
    for (const m of C.molecules) {
      const base = { chap: m.chapitre, mol: m.id, prio: PRIO[m.niveau] ?? 3 };
      if (m.marques && m.marques.length) L.push({ ...base, id: `m:${m.id}:marque`, kind: "marque", label: `Marque → DCI · ${m.dci}` });
      if (m.marques && m.marques.length) L.push({ ...base, id: `m:${m.id}:dci2marque`, kind: "dci2marque", label: `DCI → marques · ${m.dci}`, prio: base.prio + 1 });
      if (m.structure_prof) L.push({ ...base, id: `m:${m.id}:struct`, kind: "struct", label: `Structure → nom · ${m.dci}` });
      if (m.niveau === "dessiner" && (m.structure_prof || m.structure_rdkit)) L.push({ ...base, id: `m:${m.id}:dessin`, kind: "dessin", label: `Dessiner · ${m.dci}`, prio: 1 });
      if (m.mecanisme || m.classe) L.push({ ...base, id: `m:${m.id}:fiche`, kind: "fiche", label: `Classe & mécanisme · ${m.dci}` });
    }
    for (const c of C.concepts) {
      const p = c.type === "rouge" ? 0 : c.type === "bleu" ? 2 : 4;
      L.push({ id: `c:${c.id}`, kind: "concept", chap: c.chapitre, ref: c.id, prio: p, label: c.terme });
      if (c.pourquoi) L.push({ id: `p:${c.id}`, kind: "pourquoi", chap: c.chapitre, ref: c.id, prio: p + 1, label: c.pourquoi });
    }
    for (const q of C.questions) L.push({ id: `q:${q.id}`, kind: "question", chap: q.chapitre, ref: q.id, prio: PRIO[q.niveau] ?? 3, label: q.question });
    for (const p of C.patients) L.push({ id: `o:${p.id}`, kind: "patient", chap: p.chapitre, ref: p.id, prio: 2, label: p.personnage });
    for (const q of S.perso) L.push({ id: `u:${q.id}`, kind: "perso", chap: q.chapitre || "perso", ref: q.id, prio: 0, label: q.question });
    CARTES = L;
  }
  const QBY = () => Object.fromEntries(C.questions.map(q => [q.id, q]));
  let QMAP, CMAP, PMAP;
  function maps() { QMAP = QBY(); CMAP = Object.fromEntries(C.concepts.map(c => [c.id, c])); PMAP = Object.fromEntries(C.patients.map(p => [p.id, p])); }

  // ---------- planification ----------
  function joursAvantExamen() { const e = new Date(S.reglages.examen + "T08:00:00"); return Math.ceil((e - Date.now()) / DAY); }
  function maxIntervalle() { const j = joursAvantExamen(); return j > 3 ? Math.max(1, Math.floor(j * 0.45)) : 1; }
  function estDue(c) { const st = S.cartes[c.id]; return st && st.due <= finDuJour(); }
  function finDuJour() { const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); }
  function nouvellesDuJour() {
    const actifs = new Set(S.reglages.chapitres);
    const restantes = CARTES.filter(c => !S.cartes[c.id] && (actifs.has(c.chap) || c.chap === "perso")).length;
    const deja = (S.journal[today()] || {}).nouvelles || 0;
    let quota;
    if (S.reglages.nouvellesMax > 0) quota = S.reglages.nouvellesMax;
    else { const j = Math.max(1, joursAvantExamen() - 14); quota = Math.min(60, Math.max(12, Math.ceil(restantes / j))); }
    return { quota: Math.max(0, quota - deja), restantes };
  }
  function fileDuJour() {
    const actifs = new Set(S.reglages.chapitres);
    const dues = CARTES.filter(estDue).sort((a, b) => S.cartes[a.id].due - S.cartes[b.id].due);
    const { quota } = nouvellesDuJour();
    const neuves = CARTES.filter(c => !S.cartes[c.id] && (actifs.has(c.chap) || c.chap === "perso"))
      .sort((a, b) => a.prio - b.prio || Math.random() - .5).slice(0, quota);
    return entrelacer([...dues, ...neuves]);
  }
  // Entrelacement : éviter deux cartes de la même molécule / même chapitre d'affilée
  function entrelacer(L) {
    const pool = shuffle(L), out = [];
    while (pool.length) {
      const last = out[out.length - 1];
      let i = pool.findIndex(c => !last || ((c.mol || c.ref) !== (last.mol || last.ref) && c.chap !== last.chap));
      if (i < 0) i = pool.findIndex(c => !last || (c.mol || c.ref) !== (last.mol || last.ref));
      if (i < 0) i = 0;
      out.push(pool.splice(i, 1)[0]);
    }
    return out;
  }
  function noter(carte, g) {
    const avant = S.cartes[carte.id];
    if (!avant) journal("nouvelles");
    S.cartes[carte.id] = FSRS.review(avant || {}, g, { now: Date.now(), retention: S.reglages.retention, maxDays: maxIntervalle() });
    journal("revues"); if (g >= 3) journal("justes");
    sauver();
  }
  function maitrise(filtre) {
    const L = CARTES.filter(filtre || (() => true)); if (!L.length) return { vues: 0, total: 0, r: 0 };
    let vues = 0, somme = 0; const now = Date.now();
    for (const c of L) { const st = S.cartes[c.id]; if (st) { vues++; somme += FSRS.retrievability(st, now); } }
    return { vues, total: L.length, r: somme / L.length };
  }
  function serie() { let n = 0; const d = new Date(); if (!(S.journal[ymd(d)] || {}).revues) d.setDate(d.getDate() - 1); while ((S.journal[ymd(d)] || {}).revues) { n++; d.setDate(d.getDate() - 1); } return n; }
  function faibles(n = 8) {
    const now = Date.now();
    return CARTES.filter(c => S.cartes[c.id] && c.mol).map(c => ({ c, r: FSRS.retrievability(S.cartes[c.id], now), l: S.cartes[c.id].lapses || 0 }))
      .filter(x => x.r < .9 || x.l > 0).sort((a, b) => (a.r - a.l * .05) - (b.r - b.l * .05)).reduce((acc, x) => { if (!acc.find(y => y.c.mol === x.c.mol)) acc.push(x); return acc; }, []).slice(0, n);
  }
  function resume() {
    const f = fileDuJour();
    return { maj: new Date().toISOString(), examen: S.reglages.examen, joursRestants: joursAvantExamen(), aReviserAujourdhui: f.length,
      dues: CARTES.filter(estDue).length, nouvellesRestantes: nouvellesDuJour().restantes, serie: serie(), maitrise: Math.round(maitrise().r * 100),
      pointsFaibles: faibles(5).map(x => MOL[x.c.mol].dci), aujourdhui: S.journal[today()] || null,
      chapitres: C.chapitres.map(c => ({ id: c.id, nom: chapNom(c.id), maitrise: Math.round(maitrise(x => x.chap === c.id).r * 100) })) };
  }

  // ---------- éléments d'interface communs ----------
  const NIV = {
    dessiner: `<span class="badge b-dessiner" title="Bleu gras souligné : savoir la dessiner">✏️ À dessiner</span>`,
    reconnaitre: `<span class="badge b-reconnaitre" title="Bleu : DCI, noms commerciaux, reconnaître">👁 À reconnaître</span>`,
    concept: `<span class="badge b-concept" title="Noir gras souligné : comprendre">Concept</span>`,
    bleu: `<span class="badge b-reconnaitre">Notion en bleu</span>`,
    rouge: `<span class="badge b-rouge" title="Rouge : très important">🔴 Très important</span>`,
  };
  function structureHTML(m, pref) {
    const prof = m.structure_prof, rd = m.structure_rdkit;
    const useProf = pref === "prof" ? !!prof : pref === "rdkit" ? !rd : !rd; // par défaut : rendu standard (les découpes du cours portent souvent le nom)
    const src = useProf ? prof : rd;
    if (!src) return `<div class="nostruct">Structure non dessinée dans le cours</div>`;
    return `<figure class="struct ${useProf ? "prof" : "rdkit"}"><img src="${esc(src)}" alt="structure"><figcaption>${useProf ? "Dessin du cours" : "Rendu standard"}</figcaption></figure>`;
  }
  function boitesHTML(m, n = 3, cls = "") { return (m.marques || []).slice(0, n).map(b => BOITES.html(b, m, cls)).join(""); }
  const page = p => p ? `<span class="page">p. ${esc(Array.isArray(p) ? p.join(", ") : p)}</span>` : "";
  function lev(a, b) { const m = a.length, n = b.length; if (!m) return n; if (!n) return m; const d = Array.from({ length: m + 1 }, (_, i) => [i]); for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n]; }
  function proche(rep, cibles) {
    const r = norm(rep); if (!r) return false;
    return cibles.some(t => { const x = norm(t); if (!x) return false; return x === r || (r.length >= 5 && (x.includes(r) || r.includes(x))) || lev(r, x) <= Math.max(1, Math.floor(x.length / 6)); });
  }
  function voisins(m, n = 3) {
    const meme = C.molecules.filter(x => x.id !== m.id && x.classe === m.classe);
    const fam = C.molecules.filter(x => x.id !== m.id && x.famille === m.famille && x.classe !== m.classe);
    const conf = (m.confusions || []).map(id => MOL[id]).filter(Boolean);
    const autres = C.molecules.filter(x => x.id !== m.id);
    const out = []; for (const x of [...shuffle(conf), ...shuffle(meme), ...shuffle(fam), ...shuffle(autres)]) if (!out.includes(x) && out.length < n) out.push(x);
    return out;
  }
  function liste(arr) { return arr && arr.length ? `<ul>${arr.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""; }
  function ficheCourte(m) {
    return `<div class="fiche-courte">
      <div class="fc-tete"><b>${esc(m.dci)}</b> ${NIV[m.niveau] || ""} ${page(m.pages)}</div>
      <div class="fc-classe">${esc(m.famille)} › ${esc(m.classe)}${m.sous_classe ? " › " + esc(m.sous_classe) : ""}</div>
      ${m.marques && m.marques.length ? `<div><span class="lbl">Marques</span> ${m.marques.map(esc).join(" · ")}</div>` : ""}
      ${m.mecanisme ? `<div><span class="lbl">Mécanisme</span> ${esc(m.mecanisme)}</div>` : ""}
      ${m.rsa ? `<div><span class="lbl">Structure clé</span> ${esc(m.rsa)}</div>` : ""}
      ${(m.rouge || []).length ? `<div class="rouge-txt">🔴 ${m.rouge.map(esc).join(" · ")}</div>` : ""}
      ${m.mnemo ? `<div class="mnemo">💡 ${esc(m.mnemo)}</div>` : ""}
      <a class="lien" href="#/mol/${m.id}">Fiche complète →</a></div>`;
  }

  // ---------- rendu d'une carte (séance, et réutilisé) ----------
  // Retourne {html, mode, verifier?, reponse, apres?}
  function rendreCarte(c) {
    const m = c.mol && MOL[c.mol];
    switch (c.kind) {
      case "marque": {
        const b = pick(m.marques);
        return { type: "Marque → DCI", html: `<div class="consigne">Un patient te tend cette boîte. <b>Quelle DCI ? Quelle classe ?</b></div><div class="boites-ligne">${BOITES.html(b, m, "grande")}</div>`,
          mode: "tape", placeholder: "DCI…", cible: [m.dci, ...(m.synonymes || [])], reponse: ficheCourte(m) };
      }
      case "dci2marque":
        return { type: "DCI → marques", html: `<div class="consigne">Cite les <b>noms commerciaux</b> de :</div><div class="grand-nom">${esc(m.dci)}</div><div class="sous">${esc(m.classe)}</div>`,
          mode: "libre", reponse: `<div class="boites-ligne">${boitesHTML(m, 6)}</div>${ficheCourte(m)}` };
      case "struct":
        return { type: "Structure → nom", html: `<div class="consigne">Quelle est cette molécule ? <span class="sous">(et sa classe)</span></div>${structureHTML(m)}`,
          mode: "tape", placeholder: "Nom de la molécule…", cible: [m.dci, ...(m.synonymes || [])], reponse: ficheCourte(m) };
      case "dessin":
        return { type: "Dessin ✏️", html: `<div class="consigne">Dessine <b>${esc(m.dci)}</b> de mémoire (sur papier ou dans le cadre), puis compare.</div>${canvasHTML()}`,
          mode: "dessin", reponse: `<div class="compare">${structureHTML(m, "prof")}${m.structure_rdkit && m.structure_prof ? structureHTML(m, "rdkit") : ""}</div>${m.noyau ? `<div><span class="lbl">Noyau</span> ${esc(m.noyau)}</div>` : ""}${m.rsa ? `<div><span class="lbl">À vérifier sur ton dessin</span> ${esc(m.rsa)}</div>` : ""}` };
      case "fiche":
        return { type: "Classe & mécanisme", html: `<div class="grand-nom">${esc(m.dci)}</div><div class="consigne">Dis à voix haute : <b>classe</b>, <b>mécanisme</b>, <b>une indication</b>, <b>un effet indésirable</b>.</div>`,
          mode: "libre", reponse: `${ficheCourte(m)}${m.indications && m.indications.length ? `<div><span class="lbl">Indications</span>${liste(m.indications.slice(0, 4))}</div>` : ""}${m.effets_indesirables && m.effets_indesirables.length ? `<div><span class="lbl">Effets indésirables</span>${liste(m.effets_indesirables.slice(0, 4))}</div>` : ""}` };
      case "concept": {
        const k = CMAP[c.ref];
        return { type: k.type === "rouge" ? "Très important" : "Concept", html: `<div class="consigne">Explique avec tes mots :</div><div class="grand-nom ${k.type === "rouge" ? "rouge-txt" : "souligne"}">${esc(k.terme)}</div>${NIV[k.type] || ""}`,
          mode: "libre", reponse: `<p>${esc(k.explication)}</p>${page(k.page)}` };
      }
      case "pourquoi": {
        const k = CMAP[c.ref];
        return { type: "Pourquoi ?", html: `<div class="consigne">Question d'élaboration — réponds avant de regarder :</div><div class="question">${esc(k.pourquoi)}</div>`,
          mode: "libre", reponse: `<p>${esc(k.reponse_pourquoi)}</p><p class="sous">${esc(k.terme)} — ${esc(k.explication)}</p>${page(k.page)}` };
      }
      case "question": return rendreQuestion(QMAP[c.ref]);
      case "perso": return rendreQuestion(S.perso.find(q => q.id === c.ref) || { question: "(question supprimée)", type: "ouverte", reponse: "" });
      case "patient": return rendrePatient(PMAP[c.ref]);
    }
  }
  function rendreQuestion(q) {
    const niv = NIV[q.niveau] || "";
    if (q.type === "qcm" || q.type === "vrai_faux") {
      const choix = q.type === "vrai_faux" && !(q.choix && q.choix.length) ? ["Vrai", "Faux"] : (q.type === "vrai_faux" ? q.choix : shuffle(q.choix));
      return { type: "Question", html: `<div class="question">${esc(q.question)}</div>${niv}`, mode: "qcm", choix, bonne: q.reponse,
        reponse: `<p>${esc(q.explication || "")}</p>${page(q.page)}` };
    }
    return { type: "Question ouverte", html: `<div class="question">${esc(q.question)}</div>${niv}`, mode: "libre", reponse: `<p><b>${esc(q.reponse)}</b></p><p>${esc(q.explication || "")}</p>${page(q.page)}` };
  }
  function avatar(nom) {
    const h = [...nom].reduce((a, c) => a * 31 + c.charCodeAt(0) >>> 0, 7);
    const peau = ["#f2d3b1", "#d9a77c", "#a96f45", "#7a4a2a", "#e8c39e"][h % 5], cheveux = ["#2b1d14", "#5a3a22", "#b8860b", "#888", "#111", "#7a2e1d"][(h >> 3) % 6];
    const habit = ["#2563eb", "#16a34a", "#db2777", "#ea580c", "#7c3aed", "#0891b2"][(h >> 6) % 6];
    const ini = nom.trim()[0] || "?";
    return `<svg viewBox="0 0 100 110" class="avatar"><circle cx="50" cy="50" r="48" fill="var(--carte2)"/><path d="M18 108 Q50 62 82 108Z" fill="${habit}"/><circle cx="50" cy="44" r="21" fill="${peau}"/>
      <path d="M29 40 Q32 18 50 19 Q70 18 72 42 Q64 30 50 30 Q38 30 29 40Z" fill="${cheveux}"/><circle cx="42" cy="46" r="2.4" fill="#222"/><circle cx="58" cy="46" r="2.4" fill="#222"/>
      <path d="M43 55 Q50 59 57 55" stroke="#7a3b2e" stroke-width="2" fill="none"/><text x="50" y="100" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">${esc(ini)}</text></svg>`;
  }
  const TYPE_PAT = { ordonnance: "📄 Ordonnance", conseil: "💬 Conseil", telephone_medecin: "📞 Le médecin appelle", vigilance: "⚠️ Vigilance", substitution: "🔁 Substitution" };
  function rendrePatient(p) {
    const tete = `<div class="patient"><div class="pat-av">${avatar(p.personnage)}</div><div class="pat-bulle"><div class="pat-type">${TYPE_PAT[p.type] || ""}</div><div class="pat-nom">${esc(p.personnage)}</div><p>« ${esc(p.replique)} »</p></div></div>
      <div class="moi"><div class="moi-bulle"><div class="moi-nom">Toi, la pharmacienne</div>${esc(p.question)}</div><img class="moi-av" src="assets/pharmacienne.png" alt="Olivia, pharmacienne"></div>`;
    const expl = `<p>${p.reponse_texte ? `<b>${esc(p.reponse_texte)}</b><br>` : ""}${esc(p.explication)}</p>${page(p.page)}`;
    if (p.options && p.options.length) {
      const opts = shuffle(p.options.filter(id => MOL[id]));
      return { type: "Au comptoir", html: tete, mode: "rayon", options: opts, bonne: p.bonne_reponse, reponse: expl + p.bonne_reponse.map(id => MOL[id] ? ficheCourte(MOL[id]) : "").join("") };
    }
    return { type: "Au comptoir", html: tete, mode: "libre", reponse: expl };
  }
  function canvasHTML() {
    return `<div class="dessin"><canvas width="640" height="420"></canvas><div class="outils"><button data-outil="stylo" class="on">✏️ Stylo</button><button data-outil="gomme">🧽 Gomme</button><button data-outil="effacer">🗑 Effacer</button></div></div>`;
  }
  function activerCanvas(root) {
    const cv = $("canvas", root); if (!cv) return;
    const ctx = cv.getContext("2d"); let down = false, outil = "stylo", last = null;
    const fond = () => { ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--papier") || "#fff"; ctx.fillRect(0, 0, cv.width, cv.height); };
    fond();
    const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; };
    cv.addEventListener("pointerdown", e => { down = true; last = pos(e); cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", e => { if (!down) return; const p = pos(e); ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = outil === "gomme" ? (getComputedStyle(document.body).getPropertyValue("--papier") || "#fff") : getComputedStyle(document.body).getPropertyValue("--encre") || "#111";
      ctx.lineWidth = outil === "gomme" ? 22 : 3; ctx.beginPath(); ctx.moveTo(...last); ctx.lineTo(...p); ctx.stroke(); last = p; });
    ["pointerup", "pointerleave"].forEach(ev => cv.addEventListener(ev, () => down = false));
    $$("[data-outil]", root).forEach(b => b.onclick = () => { if (b.dataset.outil === "effacer") return fond(); outil = b.dataset.outil; $$("[data-outil]", root).forEach(x => x.classList.toggle("on", x === b)); });
  }

  // Affiche une carte interactive dans `zone`; appelle fin(note) quand l'étudiante a noté
  function jouerCarte(zone, c, fin, opts = {}) {
    const r = rendreCarte(c); const t0 = Date.now();
    zone.innerHTML = `<div class="carte" data-kind="${c.kind}"><div class="carte-type">${esc(r.type)} <span class="chap-tag">${esc(chapNom(c.chap))}</span></div>
      <div class="recto">${r.html}</div><div class="interaction"></div><div class="verso" hidden></div><div class="notes" hidden></div></div>`;
    const inter = $(".interaction", zone), verso = $(".verso", zone), notes = $(".notes", zone);
    let suggestion = null;
    const montrer = (ok) => {
      verso.innerHTML = (ok === true ? `<div class="verdict ok">✓ Correct</div>` : ok === false ? `<div class="verdict ko">✗ Pas tout à fait</div>` : "") + r.reponse;
      verso.hidden = false; inter.querySelectorAll("button,input,textarea").forEach(x => { if (!x.closest(".dessin")) x.disabled = true; });
      suggestion = ok === true ? 3 : ok === false ? 1 : null;
      notes.innerHTML = `<div class="notes-titre">Comment c'était ?</div><div class="notes-btns">
        <button data-g="1" class="g1">À revoir<kbd>1</kbd></button><button data-g="2" class="g2">Difficile<kbd>2</kbd></button>
        <button data-g="3" class="g3">Bien<kbd>3</kbd></button><button data-g="4" class="g4">Facile<kbd>4</kbd></button></div>`;
      notes.hidden = false; if (suggestion) $(`[data-g="${suggestion}"]`, notes).classList.add("suggere");
      $$("[data-g]", notes).forEach(b => b.onclick = () => finir(+b.dataset.g));
      $$("img", verso).forEach(i => i.addEventListener("click", () => i.classList.toggle("zoom")));
      verso.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };
    const finir = g => { journal("secondes", Math.min(180, Math.round((Date.now() - t0) / 1000))); clavier = null; fin(g); };
    if (r.mode === "tape") {
      inter.innerHTML = `<form class="tape"><input autocomplete="off" placeholder="${esc(r.placeholder)}"><button>Vérifier</button><button type="button" class="ghost">Je ne sais pas</button></form>`;
      const f = $("form", inter), inp = $("input", inter); setTimeout(() => inp.focus(), 50);
      f.onsubmit = e => { e.preventDefault(); montrer(proche(inp.value, r.cible)); };
      $(".ghost", inter).onclick = () => montrer(false);
    } else if (r.mode === "qcm") {
      inter.innerHTML = `<div class="choix">${r.choix.map((x, i) => `<button data-i="${i}"><kbd>${"ABCDEFG"[i]}</kbd>${esc(x)}</button>`).join("")}</div>`;
      $$("[data-i]", inter).forEach(b => b.onclick = () => { const x = r.choix[+b.dataset.i]; const ok = norm(x) === norm(r.bonne);
        $$("[data-i]", inter).forEach(y => { if (norm(r.choix[+y.dataset.i]) === norm(r.bonne)) y.classList.add("juste"); }); if (!ok) b.classList.add("faux"); montrer(ok); });
    } else if (r.mode === "rayon") {
      const choixB = r.options.map(id => { const m = MOL[id]; const simples = (m.marques || []).filter(b => !/\(\+/.test(b)); return [id, m, simples.length ? pick(simples) : (m.marques || [])[0] || null]; });
      const noms = choixB.map(([, , b]) => b && BOITES.brandName(b));
      choixB.forEach(x => { if (x[2] && noms.filter(n => n === BOITES.brandName(x[2])).length > 1) x[2] = null; });
      inter.innerHTML = `<div class="rayon-titre">Sur ton rayon :</div><div class="rayon">${choixB.map(([id, m, b]) =>
        `<button class="produit" data-id="${id}">${b ? BOITES.html(b, m, "petite") : `<div class="flacon">${esc(m.dci)}</div>`}<span>${esc(b ? BOITES.brandName(b) : m.dci)}</span></button>`).join("")}</div>`;
      $$(".produit", inter).forEach(b => b.onclick = () => { const ok = r.bonne.includes(b.dataset.id);
        $$(".produit", inter).forEach(y => { if (r.bonne.includes(y.dataset.id)) y.classList.add("juste"); }); if (!ok) b.classList.add("faux"); montrer(ok); });
    } else if (r.mode === "dessin") {
      inter.innerHTML = `<button class="primaire">Comparer avec la structure</button>`; activerCanvas(zone);
      $("button.primaire", inter).onclick = () => montrer(null);
    } else {
      inter.innerHTML = `<textarea rows="2" placeholder="Écris ta réponse (même approximative) — l'effort de rappel fait la mémoire"></textarea><button class="primaire">Voir la réponse</button>`;
      $("button", inter).onclick = () => montrer(null);
    }
    clavier = e => {
      if (e.target.matches("input,textarea")) { if (e.key === "Enter" && e.target.matches("textarea") && (e.metaKey || e.ctrlKey)) { $("button.primaire", inter)?.click(); } return; }
      if (!notes.hidden && "1234".includes(e.key)) finir(+e.key);
      else if (notes.hidden && e.key === " ") { e.preventDefault(); $("button.primaire", inter)?.click(); }
      else if (notes.hidden && r.mode === "qcm") { const i = "abcdefg".indexOf(e.key.toLowerCase()); const b = $$("[data-i]", inter)[i]; if (b) b.click(); }
    };
  }
  let clavier = null;
  document.addEventListener("keydown", e => { if (clavier) clavier(e); });

  // ---------- pages ----------
  const main = () => $("#main");
  function titre(t, sous) { return `<header class="page-tete"><h1>${t}</h1>${sous ? `<p>${sous}</p>` : ""}</header>`; }

  function pageAccueil() {
    const j = joursAvantExamen(), f = fileDuJour(), m = maitrise(), sr = serie(), auj = S.journal[today()] || {};
    const phase = j > 60 ? ["Découverte", "Apprends au rythme du cours : peu de nouvelles cartes chaque jour, mais tous les jours."]
      : j > 21 ? ["Consolidation", "L'essentiel est vu : on espace et on entrelace. Les points faibles passent en priorité."]
        : j > 0 ? ["Sprint final", "Tout repasse avant l'examen. Priorité aux éléments rouges et aux molécules à dessiner."] : ["Examen", "Bonne chance !"];
    const minutes = Math.max(1, Math.round(f.length * 14 / 60));
    const fa = faibles(6);
    const rouges = C.concepts.filter(c => c.type === "rouge");
    main().innerHTML = `
    <section class="hero">
      <div class="hero-g"><img class="hero-av" src="assets/pharmacienne.png" alt="">
        <div class="kicker">Chimie pharmaceutique systématique · Tome 1 complet</div>
        <h1>Bonjour Olivia 👋</h1>
        <p class="phase"><b>Phase ${phase[0]}.</b> ${phase[1]}</p>
        <a class="cta" href="#/seance">${f.length ? `Commencer la séance du jour · ${f.length} cartes · ~${minutes} min` : "Séance du jour terminée ✓ — joue à l'officine ?"}</a>
        <div class="mini">${auj.revues ? `Aujourd'hui : ${auj.revues} révisions, ${Math.round(100 * (auj.justes || 0) / auj.revues)} % justes.` : "Pas encore révisé aujourd'hui."}</div>
      </div>
      <div class="hero-d">
        <div class="compteur"><div class="big">${j > 0 ? j : 0}</div><div>jours avant l'examen<br><small>${new Date(S.reglages.examen).toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" })} · <a href="#/reglages">modifier</a></small></div></div>
        <div class="stats3"><div><b>${sr}</b><span>jours d'affilée</span></div><div><b>${Math.round(m.r * 100)}%</b><span>mémorisé</span></div><div><b>${m.vues}/${m.total}</b><span>cartes vues</span></div></div>
      </div>
    </section>
    <section class="grille2">
      <div class="panneau"><h2>Par chapitre</h2>${C.chapitres.map(c => { const x = maitrise(k => k.chap === c.id); const actif = S.reglages.chapitres.includes(c.id);
        return `<a class="barre ${actif ? "" : "inactif"}" href="#/fiches/${c.id}"><span>${esc(chapNom(c.id))} <small>p. ${c.pages.join("–")}</small></span><div class="jauge"><i style="width:${Math.round(x.r * 100)}%"></i><em style="width:${Math.round(100 * x.vues / Math.max(1, x.total))}%"></em></div><b>${Math.round(x.r * 100)}%</b></a>`; }).join("")}
        <p class="legende"><i class="l1"></i> mémorisé aujourd'hui <i class="l2"></i> déjà vu ${S.reglages.chapitres.length < C.chapitres.length ? " · grisé = pas encore vu en cours" : ""}</p></div>
      <div class="panneau"><h2>Par niveau du prof</h2>${["dessiner", "reconnaitre"].map(n => { const x = maitrise(k => k.mol && MOL[k.mol].niveau === n); return `<div class="barre"><span>${NIV[n]}</span><div class="jauge"><i style="width:${Math.round(x.r * 100)}%"></i><em style="width:${Math.round(100 * x.vues / Math.max(1, x.total))}%"></em></div><b>${Math.round(x.r * 100)}%</b></div>`; }).join("")}
        ${[["rouge", c => c.prio === 0 && c.kind !== "perso"], ["concept", c => c.kind === "concept" || c.kind === "pourquoi"]].map(([n, f]) => { const x = maitrise(f); return `<div class="barre"><span>${NIV[n]}</span><div class="jauge"><i style="width:${Math.round(x.r * 100)}%"></i><em style="width:${Math.round(100 * x.vues / Math.max(1, x.total))}%"></em></div><b>${Math.round(x.r * 100)}%</b></div>`; }).join("")}
        <h2 style="margin-top:1.2rem">Points faibles</h2>${fa.length ? `<div class="faibles">${fa.map(x => `<a href="#/mol/${x.c.mol}" class="chip">${esc(MOL[x.c.mol].dci)} <small>${Math.round(x.r * 100)}%</small></a>`).join("")}</div>` : `<p class="sous">Ils apparaîtront après tes premières séances.</p>`}
      </div>
    </section>
    <section class="tuiles">
      ${tuile("#/officine", "🏥", "L'officine", "Des patients arrivent avec une ordonnance ou une question : sers-les.")}
      ${tuile("#/jeu/quiestce", "🔬", "Qui est-ce ?", "Une structure, quatre noms voisins : reconnais la bonne molécule.")}
      ${tuile("#/jeu/dessin", "✏️", "L'atelier dessin", "Les molécules à dessiner du prof, de mémoire.")}
      ${tuile("#/jeu/memory", "🧠", "Memory des boîtes", "Associe chaque boîte à sa molécule.")}
      ${tuile("#/jeu/eclair", "⚡", "Classe éclair", "60 secondes : à quelle classe appartient cette structure ?")}
      ${tuile("#/jeu/difference", "🔍", "Cherche la différence", "Deux voisines (péni G/V, cipro/lévo…) : qu'est-ce qui change ?")}
      ${tuile("#/quiz", "📝", "Quiz entrelacé", "QCM tirés du cours, toutes familles mélangées.")}
      ${tuile("#/fiches", "📚", "Comprendre", "Fiches par chapitre, concepts et questions « pourquoi ? ».")}
    </section>
    ${rouges.length ? `<section class="panneau rouge-panneau"><h2>🔴 Les phrases rouges du prof</h2><ul>${rouges.map(r => `<li><b>${esc(r.terme)}</b> — ${esc(r.explication)} ${page(r.page)}</li>`).join("")}</ul></section>` : ""}`;
  }
  const tuile = (h, ic, t, d) => `<a class="tuile" href="${h}"><span class="ic">${ic}</span><b>${t}</b><span>${d}</span></a>`;

  function pageSeance(listeForcee, titreSeance) {
    let file = listeForcee || fileDuJour();
    const total = file.length; let faites = 0, justes = 0;
    if (!total) { main().innerHTML = `${titre("Séance du jour")}<div class="vide">🎉 Rien à réviser pour l'instant. Reviens demain, ou va servir quelques patients à <a href="#/officine">l'officine</a>.</div>`; return; }
    main().innerHTML = `${titre(titreSeance || "Séance du jour", "Réponds de mémoire avant de regarder. <kbd>Espace</kbd> révéler · <kbd>1</kbd>–<kbd>4</kbd> noter")}
      <div class="progression"><div class="pbar"><i></i></div><span class="pcompte"></span></div><div id="zone"></div>`;
    const maj = () => { $(".pbar i").style.width = `${100 * faites / (faites + file.length)}%`; $(".pcompte").textContent = `${faites} faites · ${file.length} restantes`; };
    const suivante = () => {
      maj();
      if (!file.length) { clavier = null; $("#zone").innerHTML = `<div class="fin"><h2>Séance terminée ✓</h2><p>${faites} cartes · ${Math.round(100 * justes / Math.max(1, faites))} % réussies du premier coup.</p><p class="sous">Tu as fait ce qui protège le mieux ta mémoire : récupérer, espacer, mélanger. À demain !</p><a class="cta" href="#/">Retour à l'accueil</a> <a class="cta ghost" href="#/officine">Jouer à l'officine</a></div>`; sauver(); return; }
      const c = file.shift();
      jouerCarte($("#zone"), c, g => { noter(c, g); faites++; if (g >= 3) justes++; if (g === 1) file.splice(Math.min(file.length, 4), 0, c); suivante(); });
    };
    suivante();
  }

  function pageFiches(chapId) {
    if (!chapId) {
      main().innerHTML = `${titre("Comprendre", "Avant de mémoriser, comprendre : chaque chapitre, ses molécules classées comme dans le cours, et les concepts avec leurs « pourquoi ? ».")}
      <div class="tuiles">${C.chapitres.map(c => { const n = C.molecules.filter(m => m.chapitre === c.id); return `<a class="tuile" href="#/fiches/${c.id}"><b>${esc(chapNom(c.id))}</b><span>p. ${c.pages.join("–")} · ${n.length} molécules · ${n.filter(m => m.niveau === "dessiner").length} à dessiner</span></a>`; }).join("")}</div>
      <section class="panneau"><h2>Code couleur du prof</h2><table class="code"><tr><td><span class="ex-concept">Noir gras souligné</span></td><td>Comprendre le concept et la terminologie</td></tr><tr><td><span class="ex-bleu">Bleu non souligné</span></td><td>DCI, noms commerciaux, reconnaître la molécule dans la classe (pas dessiner)</td></tr><tr><td><span class="ex-bleu-s">Bleu gras souligné</span></td><td>Savoir <b>dessiner</b> la molécule + DCI, noms commerciaux, infos clés</td></tr><tr><td><span class="ex-rouge">Rouge</span></td><td>Très important</td></tr></table></section>`;
      return;
    }
    const ch = CHAP[chapId]; const mols = C.molecules.filter(m => m.chapitre === chapId);
    const parClasse = {}; mols.forEach(m => (parClasse[m.classe] = parClasse[m.classe] || []).push(m));
    const concepts = C.concepts.filter(c => c.chapitre === chapId);
    main().innerHTML = `${titre(esc(chapNom(chapId)), `${esc(ch.titre)} · p. ${ch.pages.join("–")}`)}
      <div class="actions"><button class="primaire" id="tester">Me tester sur ce chapitre</button> <a class="cta ghost" href="#/quiz?chap=${chapId}">Quiz du chapitre</a></div>
      <section class="panneau"><h2>Molécules</h2>${Object.entries(parClasse).map(([cl, L]) => `<h3>${esc(cl)}</h3><div class="mol-grille">${L.map(m => `
        <a class="mol-carte niv-${m.niveau}" href="#/mol/${m.id}">${m.structure_rdkit || m.structure_prof ? `<img loading="lazy" src="${esc(m.structure_prof || m.structure_rdkit)}" alt="">` : `<div class="nostruct">—</div>`}
        <b>${esc(m.dci)}</b><small>${(m.marques || []).slice(0, 2).map(esc).join(", ")}</small>${NIV[m.niveau]}</a>`).join("")}</div>`).join("")}</section>
      <section class="panneau"><h2>Concepts & notions</h2><p class="sous">Essaie de répondre au « pourquoi ? » avant d'ouvrir : c'est l'interrogation élaborative.</p>
      <div class="concepts">${concepts.map(c => `<details class="concept t-${c.type}"><summary><span class="${c.type === "rouge" ? "rouge-txt" : c.type === "bleu" ? "bleu-txt" : "souligne"}">${esc(c.terme)}</span> ${page(c.page)}</summary>
        <p>${esc(c.explication)}</p>${c.pourquoi ? `<details class="pq"><summary>❓ ${esc(c.pourquoi)}</summary><p>${esc(c.reponse_pourquoi)}</p></details>` : ""}</details>`).join("")}</div></section>`;
    $("#tester").onclick = () => { const L = CARTES.filter(c => c.chap === chapId); pageSeance(entrelacer(shuffle(L).slice(0, 25)), `Test · ${chapNom(chapId)}`); };
  }

  function pageMolecule(id) {
    const m = MOL[id]; if (!m) return pageAccueil();
    const sec = (t, x) => x && (!Array.isArray(x) || x.length) ? `<div class="bloc"><h3>${t}</h3>${Array.isArray(x) ? liste(x) : `<p>${esc(x)}</p>`}</div>` : "";
    const conf = (m.confusions || []).map(i => MOL[i]).filter(Boolean);
    main().innerHTML = `<a class="retour" href="#/fiches/${m.chapitre}">← ${esc(chapNom(m.chapitre))}</a>
      <header class="mol-tete"><div><h1 class="${m.niveau === "dessiner" ? "dci-dessiner" : "dci-reconnaitre"}">${esc(m.dci)}</h1>
        <div class="fc-classe">${esc(m.famille)} › ${esc(m.classe)}${m.sous_classe ? " › " + esc(m.sous_classe) : ""}</div>
        <div>${NIV[m.niveau]} ${page(m.pages)} ${m.synonymes && m.synonymes.length ? `<span class="sous">· aussi : ${m.synonymes.map(esc).join(", ")}</span>` : ""}</div></div>
        <button class="primaire" id="tester">Me tester sur cette molécule</button></header>
      <section class="mol-visuel"><div class="structs">${m.structure_prof ? structureHTML(m, "prof") : ""}${m.structure_rdkit ? structureHTML(m, "rdkit") : ""}${!m.structure_prof && !m.structure_rdkit ? `<div class="nostruct">Pas de structure dans le cours</div>` : ""}</div>
        <div class="boites-ligne">${boitesHTML(m, 8)}</div></section>
      ${(m.rouge || []).length ? `<div class="rouge-panneau panneau">🔴 ${m.rouge.map(esc).join("<br>")}</div>` : ""}
      ${m.mnemo ? `<div class="mnemo panneau">💡 <b>Astuce</b> (suggestion, pas du cours) : ${esc(m.mnemo)}</div>` : ""}
      <section class="infos">${sec("Noyau", m.noyau)}${sec("Structure → activité", m.rsa)}${sec("Mécanisme", m.mecanisme)}${sec("Spectre", m.spectre)}${sec("Indications", m.indications)}
        ${sec("Voie", m.voie_administration)}${sec("Pharmacocinétique", m.pharmacocinetique)}${sec("Effets indésirables", m.effets_indesirables)}${sec("Interactions / CI", m.interactions_ci)}${sec("Au comptoir", m.conseils_officine)}</section>
      ${conf.length ? `<section class="panneau"><h2>À ne pas confondre avec</h2><div class="compare">${conf.map(x => `<a href="#/mol/${x.id}" class="mol-carte niv-${x.niveau}">${x.structure_prof || x.structure_rdkit ? `<img src="${esc(x.structure_prof || x.structure_rdkit)}" alt="">` : ""}<b>${esc(x.dci)}</b><small>${esc(x.rsa || "").slice(0, 140)}</small></a>`).join("")}</div></section>` : ""}`;
    $$(".struct img").forEach(i => i.addEventListener("click", () => i.classList.toggle("zoom")));
    $("#tester").onclick = () => pageSeance(CARTES.filter(c => c.mol === id), `Test · ${m.dci}`);
  }

  // ----- Officine -----
  function pageOfficine() {
    const best = (S.jeux.officine || {}).record || 0;
    main().innerHTML = `${titre("🏥 L'officine", "Tu es la pharmacienne. 8 patients font la file : ordonnances, conseils, appels de médecins, pièges. Sers-les bien !")}
      <div class="panneau officine-intro"><img class="moi-av grand" src="assets/pharmacienne.png" alt="Olivia"><div class="oi-txt"><b>Pharmacie d'Almeida</b><span>Ouverte · la pharmacienne est au comptoir</span></div><p>Record : <b>${best}</b> points</p><label>Chapitres : <select id="ofchap"><option value="">Tous (entrelacés)</option>${C.chapitres.map(c => `<option value="${c.id}">${esc(chapNom(c.id))}</option>`).join("")}</select></label>
      <label><input type="checkbox" id="ofchrono"> Mode rush (45 s par patient)</label> <button class="primaire" id="ouvrir">Ouvrir l'officine</button></div><div id="zone"></div>`;
    $("#ouvrir").onclick = () => {
      const ch = $("#ofchap").value, chrono = $("#ofchrono").checked;
      let L = C.patients.filter(p => !ch || p.chapitre === ch); L = entrelacer(shuffle(L).slice(0, 8).map(p => ({ id: `o:${p.id}`, kind: "patient", chap: p.chapitre, ref: p.id })));
      let score = 0, combo = 0, n = 0, rates = []; const total = L.length; const zone = $("#zone"); $(".officine-intro").hidden = true; let timer = null;
      const hud = () => `<div class="hud"><span>Patient ${n}/${total}</span><span>⭐ ${score}</span><span>🔥 x${combo}</span>${chrono ? `<span class="chrono">45</span>` : ""}</div>`;
      const suivant = () => {
        clearInterval(timer);
        if (!L.length) { clavier = null; const rec = Math.max(best, score); S.jeux.officine = { record: rec, parties: ((S.jeux.officine || {}).parties || 0) + 1 }; sauver();
          zone.innerHTML = `<div class="fin"><h2>Fermeture de l'officine</h2><p class="big">⭐ ${score} points ${score > best ? "— nouveau record !" : ""}</p>${rates.length ? `<p>À retravailler :</p><ul>${rates.map(p => `<li>${esc(p.personnage)} — ${esc(p.question)}</li>`).join("")}</ul><p class="sous">Ces cas reviendront dans tes prochaines séances.</p>` : `<p>Tous les patients sont repartis satisfaits 🎉</p>`}<button class="primaire" onclick="location.reload()">Rejouer</button></div>`; return; }
        const c = L.shift(); n++; const box = document.createElement("div"); zone.innerHTML = hud(); zone.appendChild(box);
        let reste = 45;
        if (chrono) timer = setInterval(() => { reste--; const el = $(".chrono", zone); if (el) el.textContent = reste; if (reste <= 0) { clearInterval(timer); const b = $(".interaction button", box); if (b && !$(".verso", box).innerHTML) { $$(".produit,.choix button", box).forEach(x => x.disabled = true); $(".interaction textarea", box) ? $(".interaction .primaire", box).click() : (box.querySelector(".verso").hidden = false); } } }, 1000);
        jouerCarte(box, c, g => {
          const st = S.cartes[c.id]; noter(c, g);
          if (g >= 3) { combo++; score += 100 + (combo - 1) * 25 + (chrono ? reste * 2 : 0); } else { combo = 0; rates.push(PMAP[c.ref]); if (g === 1 && S.cartes[c.id]) { S.cartes[c.id].due = Date.now(); } }
          suivant();
        });
      };
      suivant();
    };
  }

  // ----- Jeux molécules -----
  const avecStruct = () => C.molecules.filter(m => m.structure_prof); // seulement les structures présentes dans le cours
  function filtreChapHTML(id) { return `<select id="${id}"><option value="">Tous les chapitres</option>${C.chapitres.map(c => `<option value="${c.id}">${esc(chapNom(c.id))}</option>`).join("")}</select>`; }

  function jeuQuiEstCe() {
    main().innerHTML = `${titre("🔬 Qui est-ce ?", "Une structure, quatre molécules de la même famille. L'entrelacement de voisines entraîne à les discriminer.")}
      <div class="panneau">${filtreChapHTML("qchap")} <label><input type="checkbox" id="qdess"> Seulement « à dessiner »</label> <button class="primaire" id="go">Jouer (10 structures)</button></div><div id="zone"></div>`;
    $("#go").onclick = () => {
      const ch = $("#qchap").value, dess = $("#qdess").checked;
      let L = shuffle(avecStruct().filter(m => (!ch || m.chapitre === ch) && (!dess || m.niveau === "dessiner"))).slice(0, 10);
      let score = 0, i = 0; const zone = $("#zone");
      const tour = () => {
        if (i >= L.length) { zone.innerHTML = `<div class="fin"><h2>${score}/${L.length}</h2><button class="primaire" id="re">Rejouer</button></div>`; $("#re").onclick = () => $("#go").click(); return; }
        const m = L[i++]; const opts = shuffle([m, ...voisins(m, 3)]);
        zone.innerHTML = `<div class="carte"><div class="carte-type">Structure ${i}/${L.length} · score ${score}</div>${structureHTML(m)}<div class="choix">${opts.map(o => `<button data-id="${o.id}">${esc(o.dci)}</button>`).join("")}</div><div class="verso" hidden></div></div>`;
        $$("[data-id]", zone).forEach(b => b.onclick = () => {
          const ok = b.dataset.id === m.id; if (ok) score++;
          $$("[data-id]", zone).forEach(x => { x.disabled = true; if (x.dataset.id === m.id) x.classList.add("juste"); }); if (!ok) b.classList.add("faux");
          const card = CARTES.find(c => c.id === `m:${m.id}:struct`); if (card) noter(card, ok ? 3 : 1);
          const v = $(".verso", zone); v.hidden = false; v.innerHTML = `${ok ? `<div class="verdict ok">✓</div>` : `<div class="verdict ko">✗ C'était ${esc(m.dci)}</div>`}${ficheCourte(m)}<button class="primaire">Suivante →</button>`;
          $("button.primaire", v).onclick = tour; $("button.primaire", v).focus();
        });
      };
      tour();
    };
  }

  function jeuEclair() {
    main().innerHTML = `${titre("⚡ Classe éclair", "60 secondes. Une structure apparaît : à quelle classe appartient-elle ? Reconnaître les noyaux devient automatique.")}
      <div class="panneau"><p>Record : <b>${(S.jeux.eclair || {}).record || 0}</b></p><button class="primaire" id="go">Démarrer</button></div><div id="zone"></div>`;
    $("#go").onclick = () => {
      const mols = avecStruct(); const classes = [...new Set(mols.map(m => m.classe))];
      let score = 0, t = 60; const zone = $("#zone"); $("#go").disabled = true;
      const timer = setInterval(() => { t--; const el = $(".chrono", zone); if (el) el.textContent = t; if (t <= 0) { clearInterval(timer); finir(); } }, 1000);
      const finir = () => { const rec = Math.max(score, (S.jeux.eclair || {}).record || 0); S.jeux.eclair = { record: rec }; sauver(); zone.innerHTML = `<div class="fin"><h2>${score} bonnes réponses</h2><p>Record : ${rec}</p><button class="primaire" onclick="location.reload()">Rejouer</button></div>`; };
      const tour = () => {
        if (t <= 0) return; const m = pick(mols);
        const opts = shuffle([m.classe, ...shuffle(classes.filter(c => c !== m.classe)).slice(0, 3)]);
        zone.innerHTML = `<div class="carte"><div class="hud"><span>⚡ ${score}</span><span class="chrono">${t}</span></div>${structureHTML(m)}<div class="choix">${opts.map(o => `<button>${esc(o)}</button>`).join("")}</div></div>`;
        $$(".choix button", zone).forEach(b => b.onclick = () => { const ok = b.textContent === m.classe; if (ok) score++; b.classList.add(ok ? "juste" : "faux");
          if (!ok) $$(".choix button", zone).forEach(x => { if (x.textContent === m.classe) x.classList.add("juste"); }); setTimeout(tour, ok ? 350 : 1300); });
      };
      tour();
    };
  }

  // DCI du cours affichée sous la boîte (associations : « BACTRIM® (+ triméthoprime) » → « sulfaméthoxazole + triméthoprime »)
  function dciBoite(b, m) {
    const asso = (b.match(/\(\s*\+\s*([^,)]+)/) || [])[1];
    return asso ? `${m.dci} + ${asso.trim()}` : m.dci;
  }
  function jeuMemory() {
    main().innerHTML = `${titre("🧠 Memory des boîtes", "Retourne les cartes et associe chaque boîte à sa molécule (structure + DCI). Mémoire visuelle + double codage.")}
      <div class="panneau">${filtreChapHTML("mchap")} <button class="primaire" id="go">Nouvelle partie (6 paires)</button></div><div id="zone"></div>`;
    $("#go").onclick = () => {
      const ch = $("#mchap").value;
      const mols = shuffle(C.molecules.filter(m => m.marques && m.marques.length && (!ch || m.chapitre === ch))).slice(0, 6);
      const cartes = shuffle(mols.flatMap(m => [{ m, t: "boite", b: pick(m.marques) }, { m, t: "mol" }]));
      let ouvertes = [], trouvees = 0, coups = 0; const zone = $("#zone");
      zone.innerHTML = `<div class="hud"><span class="coups">0 coups</span></div><div class="memory">${cartes.map((c, i) => `<button class="mem" data-i="${i}"><div class="dos">?</div><div class="face">${c.t === "boite" ? `${BOITES.html(c.b, c.m, "petite")}<span class="mem-dci">${esc(dciBoite(c.b, c.m))}</span>` : `${c.m.structure_rdkit || c.m.structure_prof ? `<img src="${esc(c.m.structure_rdkit || c.m.structure_prof)}" alt="">` : ""}<b>${esc(c.m.dci)}</b>`}</div></button>`).join("")}</div>`;
      $$(".mem", zone).forEach(b => b.onclick = () => {
        if (b.classList.contains("ok") || b.classList.contains("vue") || ouvertes.length === 2) return;
        b.classList.add("vue"); ouvertes.push(b);
        if (ouvertes.length === 2) { coups++; $(".coups", zone).textContent = `${coups} coups`;
          const [a, z] = ouvertes.map(x => cartes[+x.dataset.i]);
          if (a.m.id === z.m.id && a.t !== z.t) { ouvertes.forEach(x => x.classList.add("ok")); ouvertes = []; trouvees++;
            if (trouvees === mols.length) setTimeout(() => { zone.insertAdjacentHTML("beforeend", `<div class="fin"><h2>Bravo ! ${coups} coups</h2><div class="recap">${mols.map(m => `<div>${BOITES.html(m.marques[0], m, "petite")} → <b>${esc(m.dci)}</b> <small>${esc(m.classe)}</small></div>`).join("")}</div><button class="primaire" id="re2">Rejouer</button></div>`); $("#re2").onclick = () => $("#go").click(); }, 400); }
          else setTimeout(() => { ouvertes.forEach(x => x.classList.remove("vue")); ouvertes = []; }, 1100);
        }
      });
    };
  }

  function jeuDessin() {
    const L = C.molecules.filter(m => m.niveau === "dessiner" && (m.structure_prof || m.structure_rdkit));
    main().innerHTML = `${titre("✏️ L'atelier dessin", `${L.length} molécules en bleu gras souligné : à savoir dessiner. Dessiner de mémoire (génération) ancre bien mieux que relire.`)}
      <div class="panneau"><button class="primaire" id="hasard">Une molécule au hasard</button> <button id="faibles">Les moins maîtrisées d'abord</button>
      <div class="liste-dessin">${L.map(m => `<button class="chip" data-id="${m.id}">${esc(m.dci)}</button>`).join("")}</div></div><div id="zone"></div>`;
    const go = m => { const c = CARTES.find(x => x.id === `m:${m.id}:dessin`); jouerCarte($("#zone"), c, g => { noter(c, g); $("#zone").innerHTML = `<div class="fin"><p>Noté ✓</p><button class="primaire" id="enc">Encore une</button></div>`; $("#enc").onclick = () => $("#hasard").click(); }); $("#zone").scrollIntoView({ behavior: "smooth" }); };
    $("#hasard").onclick = () => go(pick(L));
    $("#faibles").onclick = () => { const now = Date.now(); go(L.slice().sort((a, b) => FSRS.retrievability(S.cartes[`m:${a.id}:dessin`], now) - FSRS.retrievability(S.cartes[`m:${b.id}:dessin`], now))[0]); };
    $$(".liste-dessin [data-id]").forEach(b => b.onclick = () => go(MOL[b.dataset.id]));
  }

  function jeuDifference() {
    const paires = []; const vu = new Set();
    for (const m of C.molecules) for (const id of m.confusions || []) { const x = MOL[id]; if (!x) continue; const k = [m.id, id].sort().join("|");
      if (!vu.has(k) && (m.structure_prof || m.structure_rdkit) && (x.structure_prof || x.structure_rdkit)) { vu.add(k); paires.push([m, x]); } }
    main().innerHTML = `${titre("🔍 Cherche la différence", `${paires.length} paires de molécules voisines. Comparer côte à côte révèle ce qui les distingue (et ce que le prof demandera).`)}<div class="panneau"><button class="primaire" id="go">Paire suivante</button></div><div id="zone"></div>`;
    $("#go").onclick = () => {
      const [a, b] = shuffle(pick(paires));
      $("#zone").innerHTML = `<div class="carte"><div class="compare"><div>${structureHTML(a, "rdkit")}<b>${esc(a.dci)}</b></div><div>${structureHTML(b, "rdkit")}<b>${esc(b.dci)}</b></div></div>
        <div class="question">Qu'est-ce qui les distingue (structure, propriétés, usage) ?</div><textarea rows="3" placeholder="Ta réponse…"></textarea><button class="primaire" id="rev">Voir</button><div class="verso" hidden></div></div>`;
      $("#rev").onclick = () => { const v = $("#zone .verso"); v.hidden = false; v.innerHTML = `<div class="compare">${ficheCourte(a)}${ficheCourte(b)}</div>`; };
    };
  }

  function pageQuiz(params) {
    const chapInit = params.get("chap") || "";
    main().innerHTML = `${titre("📝 Quiz entrelacé", "15 questions mélangées. Les réponses comptent dans ta répétition espacée.")}
      <div class="panneau">${filtreChapHTML("zchap")} <select id="zniv"><option value="">Tous niveaux</option><option value="rouge">🔴 Rouge</option><option value="dessiner">✏️ À dessiner</option><option value="reconnaitre">👁 À reconnaître</option><option value="concept">Concepts</option></select>
      <label><input type="checkbox" id="zperso"> Inclure mes questions</label> <button class="primaire" id="go">Lancer</button></div><div id="zone"></div>`;
    $("#zchap").value = chapInit;
    $("#go").onclick = () => {
      const ch = $("#zchap").value, nv = $("#zniv").value;
      let L = CARTES.filter(c => (c.kind === "question" || ($("#zperso").checked && c.kind === "perso")) && (!ch || c.chap === ch) && (!nv || (c.kind === "question" ? QMAP[c.ref].niveau === nv : true)));
      L = entrelacer(shuffle(L).slice(0, 15)); let i = 0, ok = 0; const zone = $("#zone");
      const tour = () => { if (i >= L.length) { clavier = null; zone.innerHTML = `<div class="fin"><h2>${ok}/${L.length}</h2><button class="primaire" id="re">Nouveau quiz</button></div>`; $("#re").onclick = () => $("#go").click(); return; }
        const c = L[i++]; jouerCarte(zone, c, g => { noter(c, g); if (g >= 3) ok++; tour(); }); };
      tour();
    };
    if (chapInit) $("#go").click();
  }

  function pageMesQuestions() {
    const L = S.perso;
    main().innerHTML = `${titre("➕ Mes questions", "Ajoute les questions d'examen, de TP ou de tes notes. Elles entrent dans ta répétition espacée en priorité.")}
      <form class="panneau formq" id="fq">
        <div class="ligne"><label>Type <select name="type"><option value="qcm">QCM</option><option value="ouverte">Question ouverte</option><option value="vrai_faux">Vrai / Faux</option></select></label>
        <label>Chapitre <select name="chapitre">${C.chapitres.map(c => `<option value="${c.id}">${esc(chapNom(c.id))}</option>`).join("")}<option value="perso">Autre</option></select></label>
        <label>Niveau <select name="niveau"><option value="rouge">🔴 Rouge</option><option value="dessiner">✏️ À dessiner</option><option value="reconnaitre">👁 À reconnaître</option><option value="concept">Concept</option></select></label>
        <label>Page <input name="page" type="number" min="1" max="400" style="width:5em"></label></div>
        <label>Question <textarea name="question" rows="2" required></textarea></label>
        <label class="qcm-only">Choix (un par ligne, la bonne réponse incluse) <textarea name="choix" rows="4"></textarea></label>
        <label>Bonne réponse <input name="reponse" required></label>
        <label>Explication <textarea name="explication" rows="2"></textarea></label>
        <button class="primaire">Ajouter</button> <span class="sous">${serveur ? "Sauvegardé dans donnees/mes_questions.json" : "Hors serveur : sauvegardé dans le navigateur"}</span>
      </form>
      <section class="panneau"><h2>${L.length} question(s)</h2>${L.map(q => `<div class="perso-q"><div><b>${esc(q.question)}</b><br><small>${esc(chapNom(q.chapitre))} · ${esc(q.type)} · réponse : ${esc(q.reponse)}</small></div><button data-del="${q.id}" class="ghost">Supprimer</button></div>`).join("") || `<p class="sous">Aucune pour l'instant.</p>`}
      <details><summary>Importer en lot (JSON)</summary><p class="sous">Format : [{"question":"…","type":"qcm","choix":["…"],"reponse":"…","explication":"…","chapitre":"02_penicillines","niveau":"rouge","page":49}]</p><textarea id="imp" rows="5"></textarea><button id="impb">Importer</button></details></section>`;
    const f = $("#fq"); const majType = () => $(".qcm-only", f).hidden = f.type.value !== "qcm"; f.type.onchange = majType; majType();
    f.onsubmit = e => { e.preventDefault(); const d = Object.fromEntries(new FormData(f));
      const q = { id: "u" + Date.now().toString(36), type: d.type, chapitre: d.chapitre, niveau: d.niveau, page: d.page ? +d.page : null, question: d.question.trim(), reponse: d.reponse.trim(), explication: d.explication.trim(),
        choix: d.type === "qcm" ? d.choix.split("\n").map(s => s.trim()).filter(Boolean) : d.type === "vrai_faux" ? ["Vrai", "Faux"] : [], ajoutee: new Date().toISOString() };
      if (q.type === "qcm" && !q.choix.map(norm).includes(norm(q.reponse))) q.choix.push(q.reponse);
      S.perso.push(q); construireCartes(); sauver(true); pageMesQuestions(); };
    $$("[data-del]").forEach(b => b.onclick = () => { S.perso = S.perso.filter(q => q.id !== b.dataset.del); delete S.cartes["u:" + b.dataset.del]; construireCartes(); sauver(true); pageMesQuestions(); });
    $("#impb").onclick = () => { try { const arr = JSON.parse($("#imp").value); arr.forEach((q, i) => S.perso.push(Object.assign({ id: "u" + Date.now().toString(36) + i, type: "ouverte", niveau: "concept", chapitre: "perso", choix: [] }, q))); construireCartes(); sauver(true); pageMesQuestions(); } catch (e) { alert("JSON invalide : " + e.message); } };
  }

  function pageMethode() {
    main().innerHTML = `${titre("🧪 La méthode", "Pourquoi le site fonctionne comme ça — ce que dit la recherche sur l'apprentissage")}
    <section class="methodes">
      ${meth("Récupération active (testing effect)", "Se tester est l'une des deux techniques jugées « très utiles » par la grande revue de Dunlosky et al. (2013). Chaque carte te demande de produire la réponse <i>avant</i> de la voir. Relire et surligner sont jugés peu utiles.", "Séance, quiz, officine")}
      ${meth("Répétition espacée (FSRS)", "L'autre technique « très utile ». L'algorithme FSRS estime pour chaque carte ta probabilité de t'en souvenir et la remontre juste avant l'oubli. L'écart optimal grandit avec l'éloignement de l'examen (Cepeda et al., 2008) : les intervalles sont plafonnés pour que tout repasse avant ta session.", "Séance du jour")}
      ${meth("Espacement des paires marque ↔ DCI", "Chez des étudiants en pharmacie qui apprenaient 100 paires marque/générique, toute révision espacée par tests a battu la relecture et le bachotage (Terenyi, Anksorus & Persky, 2018).", "Cartes Marque → DCI et DCI → marques")}
      ${meth("Entrelacement", "Mélanger des catégories proches (céphalosporines de groupes différents, azolés…) apprend à les distinguer. La méta-analyse de Brunmair & Richter (2019) montre un bénéfice surtout quand les catégories se ressemblent, ce qui est exactement le cas des molécules.", "Les séances mélangent les chapitres, Qui est-ce ? propose des voisines")}
      ${meth("Double codage & mémoire visuelle", "Associer une image (structure, boîte) au mot crée deux traces en mémoire. Les boîtes ont la couleur de leur famille et un motif propre à chaque marque.", "Boîtes, structures du prof et rendu standard")}
      ${meth("Dessiner pour retenir", "Dessiner de mémoire est une forme de génération : on retient mieux ce que l'on produit soi-même (effet de dessin, Wammes et al., 2016), et c'est l'exercice demandé à l'examen.", "Atelier dessin")}
      ${meth("Interrogation élaborative", "Se demander « pourquoi ? » relie le fait à ce que l'on sait déjà (pourquoi la péni V est acidorésistante, pourquoi les aminosides sont ototoxiques).", "Cartes « Pourquoi ? », fiches")}
      ${meth("Exemples concrets & transfert", "Retrouver l'information dans un contexte réaliste (un patient, une ordonnance) prépare au métier et renforce le rappel.", "L'officine")}
    </section>
    <section class="panneau"><h2>Conseils d'usage</h2><ul><li><b>Un peu chaque jour</b> vaut mieux que beaucoup la veille. La séance du jour est calculée pour cela.</li><li><b>Sois honnête avec les notes</b> : « À revoir » n'est pas un échec, c'est ce qui fait revenir la carte au bon moment.</li><li>Dans <a href="#/reglages">Réglages</a>, coche seulement les chapitres <b>déjà vus en cours</b> : les nouvelles cartes viennent de là.</li><li>Les cartes rouges et « à dessiner » sont présentées en premier.</li></ul></section>
    <section class="panneau sources"><h2>Sources</h2><ul>
      <li><a href="https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html" target="_blank">Dunlosky et al. (2013), Improving Students' Learning With Effective Learning Techniques — APS</a></li>
      <li><a href="https://www.learningscientists.org/blog/2018/7/27-1" target="_blank">Spaced Retrieval Practice for Student Pharmacists — The Learning Scientists</a></li>
      <li><a href="https://www.evullab.org/pdf/CepedaVulRohrerWixtedPashler-PS-2008.pdf" target="_blank">Cepeda et al. (2008), Spacing effects in learning: a temporal ridgeline of optimal retention</a></li>
      <li><a href="https://www.psychologie.uni-wuerzburg.de/fileadmin/06020400/2019/Brunmair_Richter_in_press__2019_META-ANALYSIS_OF_INTERLEAVED_LEARNING.pdf" target="_blank">Brunmair & Richter (2019), Similarity matters: a meta-analysis of interleaved learning</a></li>
      <li><a href="https://www.learningscientists.org/blog/2024/4/26-1" target="_blank">Effects of Drawing on Memory — The Learning Scientists</a></li>
      <li><a href="https://borretti.me/article/implementing-fsrs-in-100-lines" target="_blank">Implementing FSRS in 100 lines — F. Borretti</a></li></ul></section>`;
  }
  const meth = (t, d, o) => `<div class="methode"><h3>${t}</h3><p>${d}</p><div class="ou">→ ${o}</div></div>`;

  function pageReglages() {
    const r = S.reglages;
    main().innerHTML = `${titre("⚙️ Réglages")}
      <form class="panneau formq" id="fr">
        <label>Date de l'examen <input type="date" name="examen" value="${esc(r.examen)}"></label>
        <label>Objectif de mémorisation <select name="retention"><option value="0.85">85 % (plus léger)</option><option value="0.9">90 % (recommandé)</option><option value="0.95">95 % (intensif, plus de révisions)</option></select></label>
        <label>Nouvelles cartes par jour <select name="nouvellesMax"><option value="0">Automatique (tout voir 2 semaines avant l'examen)</option>${[10, 15, 20, 30, 40, 60].map(n => `<option value="${n}">${n}</option>`).join("")}</select></label>
        <fieldset><legend>Chapitres déjà vus en cours (les nouvelles cartes viennent d'eux)</legend>${C.chapitres.map(c => `<label class="cb"><input type="checkbox" name="ch" value="${c.id}" ${r.chapitres.includes(c.id) ? "checked" : ""}> ${esc(chapNom(c.id))} <small>p. ${c.pages.join("–")}</small></label>`).join("")}</fieldset>
        <button class="primaire">Enregistrer</button></form>
      <section class="panneau"><h2>Sauvegarde</h2><p class="sous">${serveur ? "Ta progression est enregistrée automatiquement dans le dossier <code>donnees/</code> du site (avec une copie par jour dans <code>donnees/sauvegardes/</code>)." : "Version en ligne : ta progression est gardée dans ce navigateur (et dans cette page Notion si tu révises depuis Notion). Exporte-la de temps en temps pour en garder une copie."}</p>
        <button id="exp">Exporter ma progression</button> <label class="bouton">Importer <input type="file" id="impf" accept=".json" hidden></label> <button id="raz" class="danger">Tout remettre à zéro</button></section>`;
    const f = $("#fr"); f.retention.value = String(r.retention); f.nouvellesMax.value = String(r.nouvellesMax);
    f.onsubmit = e => { e.preventDefault(); r.examen = f.examen.value || r.examen; r.retention = +f.retention.value; r.nouvellesMax = +f.nouvellesMax.value; r.chapitres = $$("[name=ch]:checked", f).map(x => x.value); sauver(); location.hash = "#/"; };
    $("#exp").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], { type: "application/json" })); a.download = `progression-${today()}.json`; a.click(); };
    $("#impf").onchange = async e => { try { S = Object.assign(S, JSON.parse(await e.target.files[0].text())); construireCartes(); sauver(true); location.hash = "#/"; } catch (x) { alert("Fichier invalide"); } };
    $("#raz").onclick = () => { if (confirm("Effacer toute la progression ?") && confirm("Vraiment tout ?")) { S.cartes = {}; S.journal = {}; S.jeux = {}; sauver(); location.hash = "#/"; } };
  }

  // ---------- recherche ----------
  function recherche(q) {
    const r = $("#resultats"); if (!q || q.length < 2) { r.hidden = true; return; }
    const n = norm(q);
    const hits = C.molecules.filter(m => norm([m.dci, ...(m.marques || []), ...(m.synonymes || []), m.classe].join(" ")).includes(n)).slice(0, 8);
    r.innerHTML = hits.map(m => `<a href="#/mol/${m.id}"><b>${esc(m.dci)}</b> <small>${esc((m.marques || []).filter(b => norm(b).includes(n))[0] || m.classe)}</small></a>`).join("") || `<div class="sous">Rien trouvé</div>`;
    r.hidden = false;
  }

  // ---------- routeur ----------
  function route() {
    clavier = null; window.scrollTo(0, 0);
    const [path, qs] = location.hash.replace(/^#/, "").split("?"); const p = (path || "/").split("/").filter(Boolean); const params = new URLSearchParams(qs || "");
    $$("nav a").forEach(a => a.classList.toggle("actif", a.getAttribute("href") === "#/" + p.slice(0, 2).join("/") || (p[0] === "fiches" && a.getAttribute("href") === "#/fiches")));
    if (!p.length) return pageAccueil();
    ({ seance: () => pageSeance(), fiches: () => pageFiches(p[1]), mol: () => pageMolecule(p[1]), officine: pageOfficine, quiz: () => pageQuiz(params), mesquestions: pageMesQuestions, methode: pageMethode, reglages: pageReglages,
      jeu: () => ({ quiestce: jeuQuiEstCe, eclair: jeuEclair, memory: jeuMemory, dessin: jeuDessin, difference: jeuDifference }[p[1]] || pageAccueil)() }[p[0]] || pageAccueil)();
    $("#resultats").hidden = true;
  }

  async function init() {
    await charger(); maps(); construireCartes();
    $("#etat-serveur").textContent = serveur ? "● sauvegarde locale" : "● navigateur seul"; $("#etat-serveur").className = serveur ? "ok" : "ko";
    $("#q").addEventListener("input", e => recherche(e.target.value));
    document.addEventListener("click", e => { if (!e.target.closest(".recherche")) $("#resultats").hidden = true; });
    window.addEventListener("hashchange", route); route(); sauver();
  }
  init();
})();
