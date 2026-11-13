// FSRS (Free Spaced Repetition Scheduler) — version simplifiée, paramètres par défaut.
// Formules : https://borretti.me/article/implementing-fsrs-in-100-lines
// Notes : 1 = À revoir, 2 = Difficile, 3 = Bien, 4 = Facile
(function () {
  const W = [0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192,
    1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621];
  const F = 19 / 81, C = -0.5, DAY = 86400000;
  const clampD = d => Math.min(10, Math.max(1, d));
  const R = (t, s) => Math.pow(1 + F * t / s, C);
  const D0 = g => clampD(W[4] - Math.exp(W[5] * (g - 1)) + 1);
  const S0 = g => W[g - 1];
  function nextD(d, g) {
    const dp = d + (-W[6] * (g - 3)) * ((10 - d) / 9);
    return clampD(W[7] * D0(4) + (1 - W[7]) * dp);
  }
  function sSuccess(d, s, r, g) {
    const a = 1 + (11 - d) * Math.pow(s, -W[9]) * (Math.exp(W[10] * (1 - r)) - 1) *
      (g === 2 ? W[15] : 1) * (g === 4 ? W[16] : 1) * Math.exp(W[8]);
    return s * a;
  }
  function sFail(d, s, r) {
    const sf = Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r)) * W[11];
    return Math.min(sf, s);
  }
  function interval(s, rd) { return s * (Math.pow(rd, 1 / C) - 1) / F; }

  /**
   * card: {s,d,due,last,reps,lapses} (s/d absents si nouvelle)
   * opts: {now, retention, maxDays} — maxDays plafonne l'intervalle (pour revoir avant l'examen)
   */
  function review(card, g, opts) {
    const now = opts.now, rd = opts.retention || 0.9;
    const c = Object.assign({ reps: 0, lapses: 0 }, card);
    if (!c.s) { c.s = S0(g); c.d = D0(g); }
    else {
      const t = Math.max(0, (now - (c.last || now)) / DAY);
      const r = R(t, c.s);
      c.d = nextD(c.d, g);
      c.s = g === 1 ? sFail(c.d, c.s, r) : sSuccess(c.d, c.s, r, g);
    }
    c.reps += 1; c.last = now;
    if (g === 1) { c.lapses += 1; c.due = now + 10 * 60000; c.ivl = 0; }   // revue dans 10 min
    else {
      let days = Math.max(1, Math.round(interval(c.s, rd)));
      if (g === 2) days = Math.max(1, Math.min(days, Math.round(interval(c.s, rd) * 0.8)));
      if (opts.maxDays) days = Math.min(days, Math.max(1, opts.maxDays));
      c.ivl = days;
      // ancrer sur 4 h du matin pour que « dû aujourd'hui » soit simple
      const d = new Date(now + days * DAY); d.setHours(4, 0, 0, 0); c.due = d.getTime();
    }
    return c;
  }
  function retrievability(card, now) {
    if (!card || !card.s) return 0;
    return R(Math.max(0, (now - card.last) / DAY), card.s);
  }
  window.FSRS = { review, retrievability, DAY };
})();
