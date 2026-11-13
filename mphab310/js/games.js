/* Jeux : pratique mélangée et reconnaissance de structures */
(function () {
  const { C, esc, md, $, $$, shuffle, sample, toast, molById, chapLabel, chapColor, molImgAnon, molImg, canonFuncs, FUNCS } = U;
  const main = () => $('#main');
  const ROUNDS = 10;
  const withSvg = () => C.molecules.filter(m => m.svg);

  const GAMES = {
    quisuisje: { name: 'Qui suis-je ?', desc: 'Une structure, quatre noms. 15 secondes par manche.', run: gQuiSuisJe },
    classe: { name: 'Classe-moi', desc: 'À quelle classe ou sous-classe appartient cette structure ?', run: gClasse },
    solub: { name: 'H₂O ou SO ?', desc: 'Le format exact de la question 1 : solubilité puis réaction à froid.', run: gSolub },
    paires: { name: 'Paires', desc: 'Memory : retrouve chaque structure et son nom.', run: gPaires },
    fonctions: { name: 'Chasse aux fonctions', desc: 'Coche toutes les fonctions présentes : phénol, lactone, ester…', run: gFonctions },
    plantes: { name: 'Plante → constituant', desc: 'Quel composé vient de cette plante ? Et l\'inverse.', run: gPlantes },
    qcm: { name: 'QCM éclair', desc: 'Questions de tous les chapitres, avec explication.', run: gQcm }
  };

  function viewJeux(id) {
    if (id && GAMES[id]) return GAMES[id].run();
    const best = Store.S.games;
    main().innerHTML = `
      <div class="page-head"><h1>Jeux</h1><p>Chaque jeu mélange les chapitres. Une erreur remet la carte correspondante dans ta prochaine session de révision.</p></div>
      <div class="game-list">${Object.entries(GAMES).map(([k, g]) => `<a class="game-tile" href="#/jeux/${k}"><b>${g.name}</b><span>${g.desc}</span><span class="best">${best[k] != null ? 'Record : ' + best[k] + '/' + ROUNDS : 'Pas encore joué'}${k === U.gameOfDay() ? ' · jeu du jour' : ''}</span></a>`).join('')}</div>
      <h2>Filtrer par chapitres</h2>
      <p class="small muted">Par défaut, les jeux tirent dans les chapitres déjà commencés (ou tous si tu débutes).</p>
      <div class="chips" id="gch">${C.chapters.map(c => `<button class="chip ${pool().chs.includes(c.id) ? 'on' : ''}" data-c="${c.id}">${esc(c.num)}. ${esc(c.title)}</button>`).join('')}</div>`;
    $$('#gch .chip').forEach(b => b.addEventListener('click', () => {
      let sel = getSel(); if (!sel.length) sel = pool().chs.slice();
      sel = sel.includes(b.dataset.c) ? sel.filter(x => x !== b.dataset.c) : sel.concat(b.dataset.c);
      try { localStorage.setItem('phytoccm.gch', JSON.stringify(sel)); } catch (e) {}
      b.classList.toggle('on');
    }));
  }
  function getSel() { try { return JSON.parse(localStorage.getItem('phytoccm.gch') || '[]'); } catch (e) { return []; } }
  /* Chapitres en jeu : sélection manuelle, sinon chapitres commencés, sinon tout */
  function pool() {
    let chs = getSel();
    if (!chs.length) chs = C.chapters.filter(c => U.seenShare(c.id) > 0).map(c => c.id);
    if (chs.length < 2) chs = C.chapters.map(c => c.id);
    return { chs, mols: withSvg().filter(m => chs.includes(m.chapter)) };
  }

  /* Squelette de partie : n manches, score, record */
  function game(id, title, roundFn) {
    let r = 0, score = 0, streak = 0, timer = null;
    const end = () => {
      clearInterval(timer);
      const best = Store.S.games[id];
      if (best == null || score > best) Store.S.games[id] = score;
      Store.markTask('jeu');
      main().innerHTML = `<div class="game"><div class="card done-box"><b>${score}/${ROUNDS}</b><p>${score >= 8 ? 'Excellent. Passe à un autre jeu pour mélanger.' : score >= 5 ? 'Bien. Les erreurs sont déjà replanifiées dans tes cartes.' : 'Ces structures reviendront dans ta session de cartes : c\'est comme ça qu\'on progresse.'}</p>
        <div class="row" style="justify-content:center"><a class="btn primary" href="#/jeux/${id}" onclick="setTimeout(()=>window.dispatchEvent(new HashChangeEvent('hashchange')),0)">Rejouer</a><a class="btn" href="#/jeux">Autres jeux</a></div></div></div>`;
    };
    const next = () => {
      clearInterval(timer);
      if (r >= ROUNDS) return end();
      r++;
      main().innerHTML = `<div class="game"><div class="hud"><a class="small" href="#/jeux">Quitter</a><span>${esc(title)}</span><span>Manche <b>${r}</b>/${ROUNDS}</span><span>Score <b>${score}</b></span>${streak >= 3 ? `<span>Série <b>${streak}</b></span>` : ''}<div class="timer" hidden><i></i></div></div><div id="stage" class="card"></div><div id="after"></div></div>`;
      roundFn($('#stage'), {
        win() { score++; streak++; },
        lose() { streak = 0; },
        next,
        timed(sec, onTimeout) {
          const bar = $('.timer'); bar.hidden = false; const t0 = Date.now();
          timer = setInterval(() => { const ti = $('.timer i'); if (!ti) { clearInterval(timer); return; } const left = 1 - (Date.now() - t0) / (sec * 1000); ti.style.width = Math.max(0, left * 100) + '%'; if (left <= 0) { clearInterval(timer); onTimeout(); } }, 100);
        },
        stop() { clearInterval(timer); },
        nextBtn(html) { $('#after').innerHTML = `<div class="feedback">${html}</div><div class="row" style="margin-top:12px"><button class="btn primary" id="nx">${r >= ROUNDS ? 'Voir le score' : 'Suivant'} <span class="kbd">Entrée</span></button></div>`; const b = $('#nx'); b.focus(); b.addEventListener('click', next); }
      });
    };
    next();
  }

  function choiceRound(stage, ctl, { prompt, imgHtml, options, correct, explain, flagId, timed = 0 }) {
    stage.innerHTML = `<div class="q">${prompt}</div>${imgHtml || ''}<div class="choices">${options.map((o, i) => `<button class="choice" data-i="${i}">${md(o)}</button>`).join('')}</div>`;
    let done = false;
    const answer = i => {
      if (done) return; done = true; ctl.stop();
      const ok = i === correct;
      $$('.choice', stage).forEach((b, k) => { if (k === correct) b.classList.add('right'); else if (k === i) b.classList.add('wrong'); b.disabled = true; });
      if (ok) ctl.win(); else { ctl.lose(); if (flagId) Store.flag(flagId); }
      ctl.nextBtn((ok ? '<b class="ok">Juste.</b> ' : i === -1 ? '<b class="ko">Temps écoulé.</b> ' : '<b class="ko">Non.</b> ') + (explain || ''));
    };
    $$('.choice', stage).forEach(b => b.addEventListener('click', () => answer(+b.dataset.i)));
    if (timed) ctl.timed(timed, () => answer(-1));
  }

  /* --- Qui suis-je ? --- */
  function gQuiSuisJe() {
    const { mols } = pool();
    if (mols.length < 4) return empty();
    const picks = sample(mols, ROUNDS); let k = 0;
    game('quisuisje', 'Qui suis-je ?', (stage, ctl) => {
      const m = picks[k++ % picks.length];
      // distracteurs : même classe d'abord (plus difficile), puis le reste
      const same = shuffle(withSvg().filter(x => x.id !== m.id && x.classe === m.classe));
      const other = shuffle(withSvg().filter(x => x.id !== m.id && x.classe !== m.classe));
      const opts = shuffle([m, ...same.concat(other).filter((x, i, a) => a.findIndex(y => y.name === x.name) === i && x.name !== m.name).slice(0, 3)]);
      choiceRound(stage, ctl, { prompt: 'Quelle est cette molécule ?', imgHtml: molImgAnon(m), options: opts.map(o => o.name), correct: opts.indexOf(m), timed: 15,
        explain: `${esc(m.name)} — ${esc(m.classe)}${m.sousClasse ? ', ' + esc(m.sousClasse) : ''}.${m.structureCle ? ' ' + md(m.structureCle) : ''}`, flagId: 'mol-rec-' + m.id });
    });
  }

  /* --- Classe-moi --- */
  const clsOf = m => m.sousClasse || m.classe;
  function gClasse() {
    const { mols } = pool();
    const allCls = [...new Set(withSvg().map(clsOf))];
    if (mols.length < 4 || allCls.length < 4) return empty();
    const picks = sample(mols, ROUNDS); let k = 0;
    game('classe', 'Classe-moi', (stage, ctl) => {
      const m = picks[k++ % picks.length];
      const opts = shuffle([clsOf(m), ...sample(allCls.filter(c => c !== clsOf(m)), 3)]);
      choiceRound(stage, ctl, { prompt: 'À quelle classe (sous-classe) appartient ce composé ?', imgHtml: molImgAnon(m), options: opts, correct: opts.indexOf(clsOf(m)), timed: 20,
        explain: `C'est <b>${esc(m.name)}</b> : ${esc(m.classe)}${m.sousClasse ? ' — ' + esc(m.sousClasse) : ''}. ${m.structureCle ? md(m.structureCle) : ''}`, flagId: 'mol-rec-' + m.id });
    });
  }

  /* --- H2O ou SO + NaOH/HCl --- */
  function gSolub() {
    const mols = pool().mols.filter(m => m.solubilite);
    if (mols.length < 4) return empty();
    const picks = sample(mols, ROUNDS); let k = 0;
    game('solub', 'H₂O ou SO ?', (stage, ctl) => {
      const m = picks[k++ % picks.length];
      const exp = m.naoh && m.hcl ? 'both' : m.naoh ? 'naoh' : m.hcl ? 'hcl' : 'non';
      stage.innerHTML = `<div class="q">Solubilité logique, puis réaction sans chauffage</div>${molImgAnon(m)}
        <div class="row" style="margin-top:12px"><span>Soluble dans</span><div class="toggle-grp" id="sol"><button data-v="H2O">H₂O</button><button data-v="SO">SO</button></div></div>
        <div class="row" style="margin-top:10px"><span>Réagit à froid avec</span><div class="toggle-grp" id="rx"><button data-v="naoh">OUI + NaOH</button><button data-v="hcl">OUI + HCl</button><button data-v="non">NON</button></div></div>
        <div class="row" style="margin-top:14px"><button class="btn primary" id="val" disabled>Valider</button></div>`;
      const pick = { sol: null, rx: null };
      ['sol', 'rx'].forEach(g => $$('#' + g + ' button', stage).forEach(b => b.addEventListener('click', () => { pick[g] = b.dataset.v; $$('#' + g + ' button', stage).forEach(x => x.classList.toggle('on', x === b)); $('#val').disabled = !(pick.sol && pick.rx); })));
      $('#val').addEventListener('click', () => {
        $('#val').disabled = true;
        const solOk = pick.sol === m.solubilite || m.solubilite === 'H2O+SO';
        const rxOk = pick.rx === exp || (exp === 'both' && pick.rx !== 'non');
        $(`#sol [data-v="${pick.sol}"]`).classList.add(solOk ? 'right' : 'wrong');
        $(`#rx [data-v="${pick.rx}"]`).classList.add(rxOk ? 'right' : 'wrong');
        if (solOk && rxOk) ctl.win(); else { ctl.lose(); Store.flag('mol-rec-' + m.id); }
        ctl.nextBtn(`<b>${esc(m.name)}</b> (${esc(clsOf(m))}) : <b>${esc(m.solubilite)}</b>, ${exp === 'non' ? 'pas de réaction à froid' : 'réagit avec ' + (exp === 'both' ? 'NaOH et HCl' : exp === 'naoh' ? 'NaOH' : 'HCl')}. ${m.reactiviteNote ? md(m.reactiviteNote) : ''}`);
      });
    });
  }

  /* --- Paires (memory) --- */
  function gPaires() {
    const { mols } = pool();
    if (mols.length < 6) return empty();
    const set = sample(mols.filter((m, i, a) => a.findIndex(x => x.name === m.name) === i), 6);
    const tiles = shuffle(set.flatMap(m => [{ id: m.id, t: 'img', m }, { id: m.id, t: 'name', m }]));
    let open = [], found = 0, tries = 0, lock = false;
    const t0 = Date.now();
    main().innerHTML = `<div class="game"><div class="hud"><a class="small" href="#/jeux">Quitter</a><span>Paires</span><span>Essais <b id="tries">0</b></span><span>Trouvées <b id="found">0</b>/6</span></div>
      <div class="memory">${tiles.map((x, i) => `<button class="mem" data-i="${i}" aria-label="Carte ${i + 1}">?</button>`).join('')}</div><div id="after"></div></div>`;
    $$('.mem').forEach(b => b.addEventListener('click', () => {
      if (lock) return;
      const x = tiles[+b.dataset.i]; if (b.classList.contains('up')) return;
      b.classList.add('up'); b.innerHTML = x.t === 'img' ? `<img src="mol/${esc(x.id)}.svg" alt="structure">` : esc(x.m.name);
      open.push(b);
      if (open.length === 2) {
        tries++; $('#tries').textContent = tries;
        const [a, c] = open.map(o => tiles[+o.dataset.i]);
        if (a.id === c.id && a.t !== c.t) { found++; $('#found').textContent = found; open.forEach(o => o.classList.add('matched')); open = []; if (found === 6) finish(); }
        else { lock = true; setTimeout(() => { open.forEach(o => { o.classList.remove('up'); o.textContent = '?'; }); open = []; lock = false; }, 1100); }
      }
    }));
    function finish() {
      const score = Math.max(0, Math.min(ROUNDS, ROUNDS - Math.max(0, tries - 8)));
      const best = Store.S.games.paires; if (best == null || score > best) Store.S.games.paires = score;
      Store.markTask('jeu');
      $('#after').innerHTML = `<div class="feedback" style="margin-top:16px">Terminé en ${tries} essais (${Math.round((Date.now() - t0) / 1000)} s) — score ${score}/${ROUNDS}. ${set.map(m => esc(m.name)).join(', ')}.</div><div class="row" style="margin-top:12px"><button class="btn primary" onclick="window.dispatchEvent(new HashChangeEvent('hashchange'))">Rejouer</button><a class="btn" href="#/jeux">Autres jeux</a></div>`;
    }
  }

  /* --- Chasse aux fonctions --- */
  function gFonctions() {
    const mols = pool().mols.filter(m => canonFuncs(m.fonctions).length);
    if (mols.length < 4) return empty();
    const picks = sample(mols, ROUNDS); let k = 0;
    const names = FUNCS.map(f => f[0]);
    game('fonctions', 'Chasse aux fonctions', (stage, ctl) => {
      const m = picks[k++ % picks.length];
      const exp = canonFuncs(m.fonctions);
      stage.innerHTML = `<div class="q">Quelles fonctions repères-tu sur ${esc(m.name)} ?</div>${molImg(m)}
        <div class="chips" id="fx">${names.map(n => `<button class="chip" data-n="${esc(n)}">${esc(n)}</button>`).join('')}</div>
        <button class="btn primary" id="val">Valider</button>`;
      $$('#fx .chip', stage).forEach(b => b.addEventListener('click', () => b.classList.toggle('on')));
      $('#val').addEventListener('click', () => {
        $('#val').disabled = true;
        const got = $$('#fx .chip.on', stage).map(b => b.dataset.n);
        const missing = exp.filter(x => !got.includes(x)), extra = got.filter(x => !exp.includes(x));
        $$('#fx .chip', stage).forEach(b => { const n = b.dataset.n; if (exp.includes(n)) b.style.outline = `3px solid var(--green)`; else if (got.includes(n)) b.style.outline = `3px solid var(--red)`; });
        const ok = !missing.length && !extra.length;
        if (ok) ctl.win(); else ctl.lose();
        ctl.nextBtn(`${ok ? '<b class="ok">Parfait.</b>' : '<b class="ko">Presque.</b>'} Selon le cours : ${esc((m.fonctions || []).join(', '))}.${m.reactiviteNote ? ' ' + md(m.reactiviteNote) : ''}`);
      });
    });
  }

  /* --- Plante → constituant (et inverse) --- */
  function gPlantes() {
    const plants = C.plantes.filter(p => (p.constituants || []).length && (pool().chs.some(c => (p.chapters || []).includes(c))));
    const P = plants.length >= 4 ? plants : C.plantes.filter(p => (p.constituants || []).length);
    if (P.length < 4) return empty();
    const picks = sample(P, ROUNDS); let k = 0;
    const strip = s => s.replace(/\*\*/g, '').split(/[(:]/)[0].trim();
    game('plantes', 'Plante → constituant', (stage, ctl) => {
      const p = picks[k++ % picks.length];
      const right = strip(p.constituants[0]);
      const others = shuffle(C.plantes.filter(x => x.id !== p.id).flatMap(x => (x.constituants || []).map(strip))).filter(x => x && x !== right && !p.constituants.some(c => strip(c) === x));
      const opts = shuffle([right, ...[...new Set(others)].slice(0, 3)]);
      const img = p.image ? `<img src="${esc(p.image)}" alt="" style="max-height:220px;border-radius:8px;margin:10px 0">` : '';
      choiceRound(stage, ctl, { prompt: `Quel constituant trouve-t-on dans : <em>${esc(p.nomLatin || '')}</em> (${esc(p.nomFr || '')}) ?`, imgHtml: img, options: opts, correct: opts.indexOf(right),
        explain: `${esc(p.nomFr || p.nomLatin)}${p.partie ? ' — ' + esc(p.partie) : ''} : ${md(p.constituants.join(' ; '))}` });
    });
  }

  /* --- QCM éclair --- */
  function gQcm() {
    const { chs } = pool();
    const Q = (C.qcm || []).filter(q => chs.includes(q.chapter));
    const list = Q.length >= ROUNDS ? Q : (C.qcm || []);
    if (list.length < 4) return empty();
    const picks = sample(list, ROUNDS); let k = 0;
    game('qcm', 'QCM éclair', (stage, ctl) => {
      const q = picks[k++ % picks.length];
      const order = shuffle(q.choices.map((c, i) => i));
      choiceRound(stage, ctl, { prompt: `<span class="small" style="color:${chapColor(q.chapter)};font-weight:700">● ${esc(chapLabel(q.chapter))}</span><br>${md(q.q)}`, options: order.map(i => q.choices[i]), correct: order.indexOf(q.answer), explain: md(q.explication || '') });
    });
  }

  function empty() { main().innerHTML = `<div class="empty">Pas assez de contenu pour ce jeu dans les chapitres choisis. <a href="#/jeux">Choisis d'autres chapitres</a>.</div>`; }

  document.addEventListener('keydown', e => { if (e.key === 'Enter' && $('#nx') && document.activeElement !== $('#nx')) { e.preventDefault(); $('#nx').click(); } });
  window.Games = { viewJeux, GAMES };
})();
