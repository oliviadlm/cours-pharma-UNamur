/* État, persistance et algorithme de révision espacée */
(function () {
  const KEY = 'phytoccm.v1';
  const DAY = 86400000;
  /* Sauvegarde disque (progress.json) seulement avec le serveur local du Mac */
  const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const DEFAULT = {
    v: 1, savedAt: 0, startDate: null,
    settings: { examDate: '2027-01-15', newPerDay: 0, theme: '' },
    cards: {},        // id -> {due, ivl, ease, reps, lapses, last}
    days: {},         // 'YYYY-MM-DD' -> {reviews, correct, tasks:{}}
    dumps: {},        // chapterId -> [{date, score, total}]
    games: {},        // gameId -> best score
    exams: []         // {date, score, total}
  };
  let S = null;

  function todayKey(d = new Date()) {
    const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return z.toISOString().slice(0, 10);
  }
  function parseDay(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); }
  function daysBetween(a, b) { return Math.round((parseDay(b) - parseDay(a)) / DAY); }

  function normalize(o) {
    if (!o || typeof o !== 'object') o = JSON.parse(JSON.stringify(DEFAULT));
    o.settings = Object.assign({}, DEFAULT.settings, o.settings || {});
    for (const k of ['cards', 'days', 'dumps', 'games']) o[k] = o[k] || {};
    o.exams = o.exams || [];
    if (!o.startDate) o.startDate = todayKey();
    return o;
  }
  function load() {
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) {}
    try { S = raw ? JSON.parse(raw) : null; } catch (e) { S = null; }
    S = normalize(S);
    return S;
  }
  let syncTimer = null;
  function save() {
    S.savedAt = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
    if (LOCAL) {
      clearTimeout(syncTimer);
      syncTimer = setTimeout(() => {
        fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(S) }).catch(() => {});
      }, 800);
    }
  }
  /* Au démarrage via localhost : récupère la sauvegarde disque si elle est plus récente */
  async function syncFromServer() {
    if (!LOCAL) return false;
    try {
      const r = await fetch('/api/progress', { cache: 'no-store' });
      if (!r.ok) return false;
      const remote = await r.json();
      if (remote && remote.savedAt && remote.savedAt > (S.savedAt || 0)) {
        S = normalize(remote);
        try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
        return true;
      }
    } catch (e) {}
    return false;
  }

  /* SM-2 simplifié. grade : 1 à revoir, 2 difficile, 3 bien, 4 facile */
  function rate(id, grade) {
    const now = Date.now();
    const c = S.cards[id] || { ivl: 0, ease: 2.5, reps: 0, lapses: 0, due: now, firstSeen: todayKey() };
    if (grade === 1) {
      c.lapses++; c.reps = 0; c.ivl = 0; c.ease = Math.max(1.3, c.ease - 0.2);
      c.due = now + 10 * 60000; // revient dans 10 min
    } else {
      if (c.reps === 0) c.ivl = grade === 2 ? 1 : grade === 3 ? 1 : 4;
      else if (c.reps === 1) c.ivl = grade === 2 ? 2 : grade === 3 ? 3 : 6;
      else c.ivl = Math.round(c.ivl * (grade === 2 ? 1.2 : grade === 3 ? c.ease : c.ease * 1.35));
      if (grade === 2) c.ease = Math.max(1.3, c.ease - 0.15);
      if (grade === 4) c.ease = c.ease + 0.15;
      c.reps++;
      // jamais au-delà de la veille de l'examen : tout doit repasser avant
      const exam = parseDay(S.settings.examDate).getTime();
      const maxIvl = Math.max(1, Math.floor((exam - now) / DAY) - 1);
      c.ivl = Math.max(1, Math.min(c.ivl, maxIvl));
      const d = new Date(); d.setHours(4, 0, 0, 0);
      c.due = d.getTime() + c.ivl * DAY;
    }
    c.last = now;
    S.cards[id] = c;
    const day = S.days[todayKey()] = S.days[todayKey()] || { reviews: 0, correct: 0, tasks: {} };
    day.reviews++; if (grade >= 3) day.correct++;
    save();
    return c;
  }
  /* Un échec en jeu remet la carte liée en tête de file */
  function flag(id) {
    const c = S.cards[id];
    if (c) { c.due = Date.now(); c.ease = Math.max(1.3, c.ease - 0.1); save(); }
  }
  function previewIvl(id, grade) {
    const c = S.cards[id];
    if (grade === 1) return '10 min';
    let ivl;
    if (!c || c.reps === 0) ivl = grade === 4 ? 4 : 1;
    else if (c.reps === 1) ivl = grade === 2 ? 2 : grade === 3 ? 3 : 6;
    else ivl = Math.round(c.ivl * (grade === 2 ? 1.2 : grade === 3 ? c.ease : c.ease * 1.35));
    return ivl <= 1 ? '1 j' : ivl < 31 ? ivl + ' j' : Math.round(ivl / 30) + ' mois';
  }
  function markTask(task) {
    const day = S.days[todayKey()] = S.days[todayKey()] || { reviews: 0, correct: 0, tasks: {} };
    day.tasks = day.tasks || {}; day.tasks[task] = true; save();
  }
  function streak() {
    let n = 0; const d = new Date();
    if (!(S.days[todayKey(d)] && S.days[todayKey(d)].reviews)) d.setDate(d.getDate() - 1);
    while (S.days[todayKey(d)] && S.days[todayKey(d)].reviews) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  window.Store = {
    get S() { return S; }, load, save, syncFromServer, rate, flag, previewIvl, markTask, streak,
    todayKey, parseDay, daysBetween, DAY, KEY,
    reset() { S = JSON.parse(JSON.stringify(DEFAULT)); S.startDate = todayKey(); save(); },
    replace(obj) { S = normalize(obj); save(); }
  };
})();
