/* Utilitaires, index du contenu, planning et maîtrise */
(function () {
  const C = window.CONTENT || { chapters: [], molecules: [], plantes: [], flashcards: [], qcm: [], classes: [], methodes: [], schemas: [], families: [] };

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /* **gras**, *italique*, ==surligné== */
  const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/==(.+?)==/g, '<mark>$1</mark>').replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>').replace(/\n/g, '<br>');
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const sample = (a, n) => shuffle(a).slice(0, n);
  let toastT;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400); }

  /* ---------- Index ---------- */
  const chapById = Object.fromEntries(C.chapters.map(c => [c.id, c]));
  const molById = Object.fromEntries(C.molecules.map(m => [m.id, m]));
  const famById = Object.fromEntries((C.families || []).map(f => [f.id, f]));
  const chapOrder = C.chapters.map(c => c.id);
  const hasSvg = m => m && m.svg;
  const LVL = { dessiner: 'à dessiner', reconnaitre: 'à reconnaître', commenter: 'à commenter' };
  const lvlTag = l => l ? `<span class="lvl ${l}">${LVL[l] || l}</span>` : '';
  function chapColor(id) { const c = chapById[id]; return (c && famById[c.family] && famById[c.family].color) || '#56676C'; }
  function chapLabel(id) { const c = chapById[id]; return c ? `${c.num}. ${c.title}` : id; }

  function molImg(m, big) {
    if (!m) return '';
    const inner = hasSvg(m) ? `<img src="mol/${esc(m.id)}.svg" alt="Structure de ${esc(m.name)}" loading="lazy">` : `<div class="nostruct">Structure non dessinée ici — voir slides ${esc(m.slides || '')}</div>`;
    return `<div class="mol-img${big ? ' big' : ''}">${inner}</div>`;
  }
  function molImgAnon(m) {
    return `<div class="mol-img"><img src="mol/${esc(m.id)}.svg" alt="Structure à identifier" loading="lazy"></div>`;
  }

  /* ---------- Toutes les cartes de révision ---------- */
  function buildCards() {
    const cards = C.flashcards.map(c => Object.assign({ kind: 'card' }, c));
    for (const m of C.molecules) {
      if (!hasSvg(m)) continue;
      cards.push({ id: 'mol-rec-' + m.id, chapter: m.chapter, type: 'structure', kind: 'rec', mol: m.id,
        q: 'Quelle est cette structure ? Nom, classe et sous-classe.',
        a: `**${m.name}**\n${m.classe}${m.sousClasse ? ' — ' + m.sousClasse : ''}${m.structureCle ? '\n' + m.structureCle : ''}` });
      if (m.niveau === 'dessiner') {
        cards.push({ id: 'mol-draw-' + m.id, chapter: m.chapter, type: 'structure', kind: 'draw', mol: m.id,
          q: `Dessine la structure : ${m.name}`,
          a: m.structureCle || '' });
      }
    }
    return cards;
  }
  const ALL = buildCards();
  const cardById = Object.fromEntries(ALL.map(c => [c.id, c]));
  const cardsOf = ch => ALL.filter(c => c.chapter === ch);

  /* Ordre d'introduction : par chapitre, définitions d'abord, structures ensuite */
  const TYPE_RANK = { def: 0, classe: 1, comparaison: 2, structure: 3, origine: 4, usage: 5, tox: 6, methode: 7, pourquoi: 8 };
  function introOrder() {
    const out = [];
    for (const ch of chapOrder) {
      const list = cardsOf(ch).slice().sort((a, b) => (TYPE_RANK[a.type] ?? 9) - (TYPE_RANK[b.type] ?? 9) || (a.kind === 'draw') - (b.kind === 'draw'));
      out.push(...list);
    }
    return out;
  }
  const INTRO = introOrder();

  /* ---------- Planning ---------- */
  function plan() {
    const S = Store.S;
    const today = Store.todayKey();
    const exam = S.settings.examDate;
    const daysLeft = Store.daysBetween(today, exam);
    const start = S.startDate <= today ? S.startDate : today;
    const total = Store.daysBetween(start, exam);
    // fin de l'apprentissage : J-21 si possible, sinon 65 % de la période
    const learnEnd = total > 40 ? total - 21 : Math.max(1, Math.floor(total * 0.65));
    const consEnd = total > 14 ? total - 7 : Math.max(learnEnd, total - 2);
    const dayIdx = Store.daysBetween(start, today);
    let phase = 'apprentissage';
    if (daysLeft < 0) phase = 'apres';
    else if (dayIdx >= consEnd) phase = 'sprint';
    else if (dayIdx >= learnEnd) phase = 'consolidation';

    const seen = INTRO.filter(c => S.cards[c.id]).length;
    const doneNewToday = INTRO.filter(c => { const s = S.cards[c.id]; return s && s.firstSeen === today; }).length;
    const seenBefore = seen - doneNewToday;
    const unseen = INTRO.length - seenBefore;
    let newQuota;
    if (S.settings.newPerDay > 0) newQuota = S.settings.newPerDay;
    else if (phase === 'apprentissage') {
      const target = Math.ceil(INTRO.length * Math.min(1, (dayIdx + 1) / learnEnd));
      newQuota = Math.max(10, Math.min(80, target - seenBefore));
      // rattrapage doux : jamais plus de 1,5 × (reste ÷ jours d'apprentissage restants)
      const remainingDays = Math.max(1, learnEnd - dayIdx);
      newQuota = Math.min(newQuota, Math.max(10, Math.ceil(unseen / remainingDays * 1.5)));
    } else newQuota = Math.min(unseen, phase === 'sprint' ? 60 : 50);
    newQuota = Math.min(newQuota, unseen);
    const newLeft = Math.max(0, newQuota - doneNewToday);
    const nextNew = INTRO.filter(c => !S.cards[c.id]);
    const focusCh = nextNew.length ? nextNew[0].chapter : null;
    const now = Date.now();
    const due = ALL.filter(c => S.cards[c.id] && S.cards[c.id].due <= now);
    return { today, exam, daysLeft, phase, newQuota, newLeft, focusCh, due, seen, total: INTRO.length, dayIdx, learnEnd, consEnd };
  }

  /* Jeu du jour : rotation */
  const GAME_ROT = ['quisuisje', 'classe', 'solub', 'paires', 'fonctions', 'plantes', 'qcm'];
  function gameOfDay() { const n = Math.floor(Store.parseDay(Store.todayKey()).getTime() / Store.DAY); return GAME_ROT[n % GAME_ROT.length]; }

  /* Maîtrise d'un chapitre : 0..1 (intervalle ≥ 21 j = acquis) */
  function mastery(ch) {
    const list = cardsOf(ch); if (!list.length) return 0;
    let s = 0;
    for (const c of list) { const st = Store.S.cards[c.id]; if (st) s += Math.min(1, (st.ivl || 0) / 21) * 0.85 + (st.reps ? 0.15 : 0); }
    return s / list.length;
  }
  function seenShare(ch) { const list = cardsOf(ch); return list.length ? list.filter(c => Store.S.cards[c.id]).length / list.length : 0; }

  /* Normalisation des fonctions chimiques (jeu « Fonctions ») */
  const FUNCS = [
    ['Phénol', /ph[ée]nol(?!ate)/i], ['Acide carboxylique', /acide carbox|carboxyl|COOH/i], ['Ester', /ester(?!s? de)|ester/i],
    ['Lactone', /lactone/i], ['Alcool', /alcool|hydroxyle? (primaire|secondaire|tertiaire)|OH alcool/i], ['Aldéhyde', /ald[ée]hyde/i],
    ['Cétone', /c[ée]tone/i], ['Amine', /amine|azote basique|NH2/i], ['Éther', /[ée]ther|m[ée]thoxy/i],
    ['Liaison hétérosidique', /h[ée]t[ée]rosid|glycosid|osidique|ose li[ée]|liaison O-|C-glyc/i], ['Double liaison C=C', /double liaison|C=C|insatur|alc[èe]ne|[ée]thyl[èe]nique/i],
    ['Quinone', /quinone/i], ['Amide', /amide/i], ['Nitrile', /nitrile|CN/i], ['Soufre (S)', /thio|soufr|sulf/i]
  ];
  function canonFuncs(list) {
    const out = new Set();
    for (const f of list || []) for (const [name, re] of FUNCS) if (re.test(f)) out.add(name);
    return [...out];
  }

  window.U = { C, esc, md, $, $$, shuffle, sample, toast, chapById, molById, famById, chapOrder, molImg, molImgAnon, lvlTag, LVL,
    chapColor, chapLabel, ALL, cardById, cardsOf, INTRO, plan, gameOfDay, mastery, seenShare, hasSvg, FUNCS, canonFuncs };
})();
