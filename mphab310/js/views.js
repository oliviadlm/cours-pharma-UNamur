/* Pages du site */
(function () {
  const { C, esc, md, $, $$, shuffle, sample, toast, chapById, molById, famById, molImg, lvlTag, chapColor, chapLabel, ALL, cardById, cardsOf, INTRO, plan, mastery, seenShare } = U;
  const main = () => $('#main');
  const fmtDate = k => Store.parseDay(k).toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const PHASE = {
    apprentissage: ['Apprentissage', 'Chaque jour : un peu de nouveau, beaucoup de rappel.'],
    consolidation: ['Consolidation', 'Plus de nouveautés : on mélange tous les chapitres et on comble les trous.'],
    sprint: ['Sprint final', 'Examens blancs et cartes fragiles. On dort bien.'],
    apres: ['Examen passé', 'Mets à jour la date dans Réglages si besoin.']
  };
  const GAME_NAMES = { quisuisje: 'Qui suis-je ?', classe: 'Classe-moi', solub: 'H₂O ou SO ?', paires: 'Paires', fonctions: 'Chasse aux fonctions', plantes: 'Plante → constituant', qcm: 'QCM éclair' };

  /* ================= Aujourd'hui ================= */
  function tlcPlate() {
    const fams = (C.families || []).filter(f => C.chapters.some(c => c.family === f.id));
    const lanes = fams.map(f => ({ f, chs: C.chapters.filter(c => c.family === f.id) }));
    lanes.forEach(l => { l.w = 30 + Math.max(0, l.chs.length - 1) * 9; });
    const padX = 22, top = 34, origin = 360, H = 400;
    const inner = lanes.reduce((a, l) => a + l.w, 0);
    const W = Math.max(380, padX * 2 + inner);
    let x0 = (W - inner) / 2;
    let s = `<svg class="tlc" viewBox="0 0 ${W} ${H}" role="img" aria-label="Plaque CCM : chaque tache est un chapitre, plus elle migre haut, mieux il est maîtrisé">`;
    s += `<rect class="plate" x="6" y="6" width="${W - 12}" height="${H - 12}" rx="4"/>`;
    s += `<line class="front" x1="12" x2="${W - 12}" y1="${top}" y2="${top}"/><text class="axis" x="${W - 14}" y="${top - 8}" text-anchor="end">front : retenu</text>`;
    s += `<line class="origin" x1="12" x2="${W - 12}" y1="${origin}" y2="${origin}"/>`;
    for (const { f, chs, w } of lanes) {
      const cx = x0 + w / 2;
      chs.forEach((c, k) => {
        const m = mastery(c.id), seen = seenShare(c.id);
        const y = origin - m * (origin - top);
        const dx = (k - (chs.length - 1) / 2) * 9;
        s += `<a href="#/cours/${c.id}"><title>${esc(chapLabel(c.id))} — retenu ${Math.round(m * 100)} %, vu ${Math.round(seen * 100)} %</title>`;
        s += seen > 0 ? `<circle class="spot" cx="${cx + dx}" cy="${y}" r="7.5" fill="${f.color}" color="${f.color}" opacity="${0.6 + 0.4 * m}"/>`
                      : `<circle class="spot" cx="${cx + dx}" cy="${origin}" r="5.5" fill="none" stroke="${f.color}" stroke-width="2"/>`;
        s += `</a>`;
      });
      s += `<text class="lane-label" x="${cx}" y="${origin + 24}" text-anchor="middle">${esc(f.short)}</text>`;
      x0 += w;
    }
    return s + '</svg>';
  }

  function viewToday() {
    const p = plan();
    const S = Store.S;
    const day = S.days[p.today] || { tasks: {} };
    const tasks = day.tasks || {};
    const focus = p.focusCh ? chapById[p.focusCh] : null;
    const weak = C.chapters.filter(c => seenShare(c.id) > 0.3).sort((a, b) => mastery(a.id) - mastery(b.id)).slice(0, 3);
    const dumpCh = weak[0] || focus;
    const g = U.gameOfDay();
    const items = [];
    if (focus && p.phase === 'apprentissage') items.push({ k: 'fiche', t: `Lire la fiche : ${focus.num}. ${focus.title}`, s: 'Lis l\'essentiel, puis réponds aux questions « Pourquoi ? » sans regarder.', href: `#/cours/${focus.id}` });
    items.push({ k: 'cartes', t: `Révision espacée : ${p.due.length} à revoir + ${p.newLeft} nouvelles`, s: 'Les cartes de tous les chapitres déjà vus sont mélangées.', href: '#/cartes/jour', done: p.due.length === 0 && p.newLeft === 0 && (tasks.cartes || day.reviews) });
    if (dumpCh) items.push({ k: 'dump', t: `Rappel libre : ${dumpCh.num}. ${dumpCh.title}`, s: '3 minutes, feuille blanche : écris tout ce dont tu te souviens, puis compare.', href: `#/cours/${dumpCh.id}/rappel` });
    items.push({ k: 'jeu', t: `Jeu du jour : ${GAME_NAMES[g]}`, s: 'Pratique mélangée : 10 manches.', href: `#/jeux/${g}` });
    if (p.phase === 'sprint' || (p.phase === 'consolidation' && p.dayIdx % 3 === 0)) items.push({ k: 'examen', t: 'Examen blanc', s: 'Format de l\'examen : structures, huile essentielle, question ouverte.', href: '#/examen' });

    const last7 = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return S.days[Store.todayKey(d)]; }).filter(Boolean);
    const rev7 = last7.reduce((a, d) => a + (d.reviews || 0), 0), ok7 = last7.reduce((a, d) => a + (d.correct || 0), 0);
    const ph = PHASE[p.phase];
    main().innerHTML = `
      <div class="page-head">
        <p class="muted" style="margin:0">${esc(fmtDate(p.today))}</p>
        <h1>Aujourd'hui</h1>
        <div class="countdown"><b>${p.daysLeft >= 0 ? 'J-' + p.daysLeft : '—'}</b><span>avant l'examen du ${esc(fmtDate(p.exam))}<br><span class="phase">${ph[0]} · ${ph[1]}</span></span></div>
      </div>
      <div class="today">
        <div>
          <ol class="plan-list">
            ${items.map((it, i) => { const done = it.done || tasks[it.k]; return `<li class="${done ? 'done' : ''}"><span class="tick">${done ? '✓' : i + 1}</span><span class="what"><b>${esc(it.t)}</b><span>${esc(it.s)}</span></span><a class="btn ${i === 0 && !done ? 'primary' : 'ghost'} sm" href="${it.href}" data-task="${it.k}">${done ? 'Refaire' : 'Commencer'}</a></li>`; }).join('')}
          </ol>
          ${weak.length ? `<h2>À consolider</h2><div class="row">${weak.map(c => `<a class="chip" href="#/cartes/ch/${c.id}">${esc(c.num)}. ${esc(c.title)} · ${Math.round(mastery(c.id) * 100)} %</a>`).join('')}</div>` : ''}
        </div>
        <aside>
          <div class="tlc-wrap">
            <h3 style="margin-bottom:6px">Ta plaque CCM</h3>
            ${tlcPlate()}
            <p class="legend-line">Une tache par chapitre. Plus elle migre vers le front, mieux le chapitre est retenu sur la durée. Cercle vide = pas encore commencé.</p>
          </div>
          <div class="stats3">
            <div><b>${Store.streak()}</b><span>jours d'affilée</span></div>
            <div><b>${p.seen}/${p.total}</b><span>cartes vues</span></div>
            <div><b>${rev7 ? Math.round(ok7 / rev7 * 100) + ' %' : '—'}</b><span>réussite sur 7 jours</span></div>
          </div>
        </aside>
      </div>`;
    $$('[data-task]').forEach(a => a.addEventListener('click', () => { if (a.dataset.task === 'fiche') Store.markTask('fiche'); }));
  }

  /* ================= Cours ================= */
  function viewCours() {
    const fams = (C.families || []);
    main().innerHTML = `
      <div class="page-head"><h1>Cours</h1><p>Les fiches suivent la matière d'examen. Code couleur du prof : <span class="lvl dessiner">à dessiner</span> <span class="lvl reconnaitre">à reconnaître</span> <span class="lvl commenter">à commenter</span>.</p></div>
      ${fams.map(f => { const chs = C.chapters.filter(c => c.family === f.id); if (!chs.length) return ''; return `
        <h2>${esc(f.name)}</h2>
        <div class="ch-list">${chs.map(c => `
          <a class="ch-item" href="#/cours/${c.id}">
            <span class="num" style="background:${f.color}">${esc(c.num)}</span>
            <span><b>${esc(c.title)}</b><span class="small muted">${cardsOf(c.id).length} cartes · ${C.molecules.filter(m => m.chapter === c.id).length} molécules</span>
            <span class="bar"><i style="width:${Math.round(mastery(c.id) * 100)}%"></i></span></span>
          </a>`).join('')}</div>`; }).join('')}`;
  }

  function viewChapter(id, tab = 'fiche') {
    const c = chapById[id]; if (!c) return viewCours();
    const mols = C.molecules.filter(m => m.chapter === id);
    const plants = C.plantes.filter(p => (p.chapters || []).includes(id));
    const schemas = (C.schemas || []).filter(s => s.chapter === id);
    const meths = (C.methodes || []).filter(m => m.chapter === id);
    const tabs = [['fiche', 'Fiche'], ['pourquoi', `Pourquoi ? (${(c.pourquoi || []).length})`], ['molecules', `Molécules (${mols.length})`], ['plantes', `Plantes (${plants.length})`], ['rappel', 'Rappel libre'], ['prof', 'Q&R du prof']].filter(t => t[0] !== 'prof' || (c.profQA || []).length);
    main().innerHTML = `
      <p><a href="#/cours" class="small">Tous les chapitres</a></p>
      <div class="page-head">
        <h1>${esc(c.num)}. ${esc(c.title)}</h1>
        ${c.subtitle ? `<p>${esc(c.subtitle)}</p>` : ''}
        <div class="row"><a class="btn primary" href="#/cartes/ch/${id}">Réviser ce chapitre</a><a class="btn ghost" href="#/molecules/${id}">Atlas des molécules</a><span class="small muted">Maîtrise ${Math.round(mastery(id) * 100)} %</span></div>
      </div>
      <div class="tabs" role="tablist">${tabs.map(t => `<button role="tab" data-tab="${t[0]}" class="${t[0] === tab ? 'on' : ''}" aria-selected="${t[0] === tab}">${t[1]}</button>`).join('')}</div>
      <div id="tabBody" class="fiche"></div>`;
    const body = $('#tabBody');
    const render = t => {
      $$('.tabs button').forEach(b => { b.classList.toggle('on', b.dataset.tab === t); b.setAttribute('aria-selected', b.dataset.tab === t); });
      history.replaceState(null, '', `#/cours/${id}${t === 'fiche' ? '' : '/' + t}`);
      if (t === 'fiche') {
        body.innerHTML = `
          ${(c.essentiel || []).length ? `<div class="essentiel"><h3>L'essentiel</h3><ul>${c.essentiel.map(x => `<li>${md(x)}</li>`).join('')}</ul></div>` : ''}
          ${schemas.map(s => `<figure class="schema-fig" style="margin-top:18px"><img src="${esc(s.image)}" alt="${esc(s.titre)}" loading="lazy"><figcaption><b>${esc(s.titre)}</b> ${s.legende ? '— ' + md(s.legende) : ''}</figcaption></figure>`).join('')}
          <section>${(c.sections || []).map((s, i) => `<details ${i < 2 ? 'open' : ''}><summary><span>${esc(s.title)} ${s.slides ? `<span class="slides-ref">dias ${esc(s.slides)}</span>` : ''}</span></summary><ul>${(s.points || []).map(p => `<li>${md(p)}</li>`).join('')}</ul></details>`).join('')}</section>
          ${meths.length ? `<h2>Méthodes : identification, extraction, dosage</h2>${meths.map(m => `<details><summary><span>${esc(m.name)}</span></summary><p>${md(m.principe || '')}</p>${m.interet ? `<p class="muted">${md(m.interet)}</p>` : ''}</details>`).join('')}` : ''}
          ${(c.mnemos || []).length ? `<h2>Moyens mnémotechniques</h2><ul>${c.mnemos.map(x => `<li>${md(x)}</li>`).join('')}</ul>` : ''}
          ${(c.pieges || []).length ? `<h2>Pièges fréquents</h2><ul>${c.pieges.map(x => `<li>${md(x)}</li>`).join('')}</ul>` : ''}`;
      } else if (t === 'pourquoi') {
        body.innerHTML = `<p class="muted">Réponds à voix haute ou par écrit <em>avant</em> d'afficher la réponse : c'est l'effort de reconstruction qui fixe la mémoire.</p>` +
          (c.pourquoi || []).map(w => `<div class="why"><div class="q">${md(w.q)}</div><button class="btn sm ghost" style="margin-top:8px">Afficher la réponse</button><div class="a">${md(w.a)}</div></div>`).join('');
        $$('.why button', body).forEach(b => b.addEventListener('click', () => { b.parentElement.classList.toggle('open'); b.textContent = b.parentElement.classList.contains('open') ? 'Masquer' : 'Afficher la réponse'; }));
      } else if (t === 'molecules') {
        body.innerHTML = mols.length ? `<div class="mol-grid">${mols.map(molCard).join('')}</div>` : '<div class="empty">Pas de molécule dans ce chapitre.</div>';
        bindMolCards(body);
      } else if (t === 'plantes') {
        body.innerHTML = plants.length ? `<div class="plant-grid">${plants.map(plantCard).join('')}</div>` : '<div class="empty">Pas de plante détaillée dans ce chapitre.</div>';
      } else if (t === 'rappel') {
        renderDump(body, c);
      } else if (t === 'prof') {
        body.innerHTML = (c.profQA || []).map(q => `<div class="why open"><div class="q">${md(q.q)}</div><div class="a">${md(q.a)}</div></div>`).join('');
      }
    };
    $$('.tabs button').forEach(b => b.addEventListener('click', () => render(b.dataset.tab)));
    render(tabs.some(t => t[0] === tab) ? tab : 'fiche');
  }

  function renderDump(body, c) {
    const pts = (c.essentiel || []).concat((c.sections || []).map(s => s.title));
    const hist = (Store.S.dumps[c.id] || []).slice(-5);
    body.innerHTML = `
      <p>Sans rien regarder, écris pendant 3 à 5 minutes tout ce que tu sais sur <b>${esc(c.title)}</b> : classes, structures, plantes, usages, toxicité. Les trous que tu découvres sont exactement ce qu'il faut revoir.</p>
      <textarea id="dumpTxt" placeholder="Tout ce dont je me souviens…"></textarea>
      <div class="row" style="margin-top:10px"><button class="btn primary" id="dumpCmp">Comparer avec la fiche</button>${hist.length ? `<span class="small muted">Derniers scores : ${hist.map(h => h.score + '/' + h.total).join(' · ')}</span>` : ''}</div>
      <div id="dumpRes"></div>`;
    $('#dumpCmp').addEventListener('click', () => {
      $('#dumpRes').innerHTML = `<h3 style="margin-top:20px">Coche ce que tu avais écrit</h3><ul class="dump-check">${pts.map((p, i) => `<li><label><input type="checkbox" data-i="${i}"><span>${md(p)}</span></label></li>`).join('')}</ul><button class="btn primary" id="dumpSave">Enregistrer mon score</button>`;
      $('#dumpSave').addEventListener('click', () => {
        const score = $$('.dump-check input:checked').length;
        (Store.S.dumps[c.id] = Store.S.dumps[c.id] || []).push({ date: Store.todayKey(), score, total: pts.length });
        Store.markTask('dump'); toast(`Rappel libre enregistré : ${score}/${pts.length}`);
        $('#dumpSave').disabled = true;
      });
    });
  }

  /* ================= Molécules ================= */
  function molCard(m) {
    return `<button class="mol-card" data-mol="${esc(m.id)}">${molImg(m)}<span class="cap"><b>${esc(m.name)}</b><span>${esc(m.sousClasse || m.classe || '')}</span>${lvlTag(m.niveau)}</span></button>`;
  }
  function bindMolCards(root) { $$('[data-mol]', root).forEach(b => b.addEventListener('click', () => molDialog(b.dataset.mol))); }
  function molDialog(id) {
    const m = molById[id]; if (!m) return;
    const yn = v => `<span class="yn ${v ? 'yes' : 'no'}">${v ? 'oui' : 'non'}</span>`;
    openDialog(`
      <h2 style="margin-top:0">${esc(m.name)} ${lvlTag(m.niveau)}</h2>
      ${(m.aliases || []).length ? `<p class="muted small">${esc(m.aliases.join(', '))}</p>` : ''}
      <div class="mol-detail">
        <div>${molImg(m, true)}${m.structureCle ? `<p class="small" style="margin-top:10px">${md(m.structureCle)}</p>` : ''}</div>
        <dl class="facts">
          <dt>Classe</dt><dd>${esc(m.classe)}${m.sousClasse ? ' — ' + esc(m.sousClasse) : ''}</dd>
          <dt>Chapitre</dt><dd><a href="#/cours/${m.chapter}">${esc(chapLabel(m.chapter))}</a></dd>
          ${(m.fonctions || []).length ? `<dt>Fonctions</dt><dd>${esc(m.fonctions.join(', '))}</dd>` : ''}
          <dt>Solubilité</dt><dd><b>${esc(m.solubilite || '—')}</b></dd>
          <dt>NaOH à froid</dt><dd>${yn(m.naoh)}</dd>
          <dt>HCl à froid</dt><dd>${yn(m.hcl)}</dd>
          ${m.reactiviteNote ? `<dt></dt><dd class="small muted">${md(m.reactiviteNote)}</dd>` : ''}
          ${(m.origine || []).length ? `<dt>Origine</dt><dd>${md(m.origine.join(' ; '))}</dd>` : ''}
          ${m.proprietes ? `<dt>Propriétés</dt><dd>${md(m.proprietes)}</dd>` : ''}
          ${m.usages ? `<dt>Usages</dt><dd>${md(m.usages)}</dd>` : ''}
          ${m.toxicite ? `<dt>Toxicité</dt><dd>${md(m.toxicite)}</dd>` : ''}
          ${m.slides ? `<dt>Slides</dt><dd class="small muted">${esc(m.slides)}</dd>` : ''}
        </dl>
      </div>`);
  }
  function openDialog(html) {
    const d = document.createElement('div');
    d.className = 'dlg';
    d.innerHTML = `<div class="dlg-box" role="dialog" aria-modal="true"><button class="btn sm ghost dlg-close" aria-label="Fermer">Fermer</button>${html}</div>`;
    const close = () => { d.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    d.addEventListener('click', e => { if (e.target === d) close(); });
    $('.dlg-close', d).addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    document.body.appendChild(d);
    $('.dlg-close', d).focus();
  }

  function viewMolecules(ch) {
    const st = { ch: ch || '', lvl: '', q: '', hide: false };
    main().innerHTML = `
      <div class="page-head"><h1>Atlas des molécules</h1><p>${C.molecules.length} structures de la matière d'examen. Active « Cacher les noms » pour t'interroger : regarde la structure, dis le nom et la classe, puis clique pour vérifier.</p></div>
      <div class="row">
        <select id="fCh" aria-label="Chapitre"><option value="">Tous les chapitres</option>${C.chapters.map(c => `<option value="${c.id}" ${c.id === st.ch ? 'selected' : ''}>${esc(c.num)}. ${esc(c.title)}</option>`).join('')}</select>
        <select id="fLvl" aria-label="Niveau"><option value="">Tous les niveaux</option><option value="dessiner">À dessiner</option><option value="reconnaitre">À reconnaître</option><option value="commenter">À commenter</option></select>
        <input type="text" id="fQ" placeholder="Rechercher (nom, plante, classe)" aria-label="Rechercher">
        <label class="chip"><input type="checkbox" id="fHide"> Cacher les noms</label>
      </div>
      <p class="small muted" id="fCount"></p>
      <div class="mol-grid" id="molGrid"></div>`;
    const draw = () => {
      const q = st.q.toLowerCase();
      const list = C.molecules.filter(m => (!st.ch || m.chapter === st.ch) && (!st.lvl || m.niveau === st.lvl) &&
        (!q || [m.name, ...(m.aliases || []), m.classe, m.sousClasse, ...(m.origine || [])].join(' ').toLowerCase().includes(q)));
      $('#fCount').textContent = `${list.length} molécule${list.length > 1 ? 's' : ''}`;
      $('#molGrid').innerHTML = list.map(molCard).join('');
      if (st.hide) $$('.mol-card', $('#molGrid')).forEach(c => c.classList.add('hidden-name'));
      bindMolCards($('#molGrid'));
    };
    $('#fCh').addEventListener('change', e => { st.ch = e.target.value; draw(); });
    $('#fLvl').addEventListener('change', e => { st.lvl = e.target.value; draw(); });
    $('#fQ').addEventListener('input', e => { st.q = e.target.value; draw(); });
    $('#fHide').addEventListener('change', e => { st.hide = e.target.checked; draw(); });
    draw();
  }

  /* ================= Plantes ================= */
  function plantCard(p) {
    return `<article class="plant">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.nomFr || p.nomLatin)}" loading="lazy">` : `<div class="noimg"><svg viewBox="0 0 24 24"><path d="M12 21V10M12 10c0-4 3-7 8-7 0 5-3 8-8 7zM12 13c0-3-2-6-7-6 0 4 2 7 7 6z"/></svg></div>`}
      <div class="body"><h3>${esc(p.nomFr || p.nomLatin)}</h3><div class="fam"><em>${esc(p.nomLatin || '')}</em>${p.famille ? ' · ' + esc(p.famille) : ''}</div>
      ${p.partie ? `<p class="small" style="margin:6px 0 0"><b>Drogue :</b> ${esc(p.partie)}</p>` : ''}
      ${(p.constituants || []).length ? `<ul>${p.constituants.map(x => `<li>${md(x)}</li>`).join('')}</ul>` : ''}
      ${p.usages ? `<p class="small muted" style="margin:8px 0 0">${md(p.usages)}</p>` : ''}</div></article>`;
  }
  function viewPlantes() {
    main().innerHTML = `
      <div class="page-head"><h1>Plantes et matières premières</h1><p>Origine des composés et, à l'inverse, constituants principaux de chaque drogue — les deux sens sont demandés à l'examen.</p></div>
      <div class="row"><input type="text" id="pQ" placeholder="Rechercher une plante ou un constituant" aria-label="Rechercher" style="min-width:280px">
      <label class="chip"><input type="checkbox" id="pImg"> Avec photo seulement</label></div>
      <div class="plant-grid" id="pGrid" style="margin-top:16px"></div>`;
    const draw = () => {
      const q = $('#pQ').value.toLowerCase(), img = $('#pImg').checked;
      const list = C.plantes.filter(p => (!img || p.image) && (!q || JSON.stringify(p).toLowerCase().includes(q)));
      $('#pGrid').innerHTML = list.map(plantCard).join('') || '<div class="empty">Aucune plante ne correspond.</div>';
    };
    $('#pQ').addEventListener('input', draw); $('#pImg').addEventListener('change', draw); draw();
  }

  /* ================= Cartes (révision espacée) ================= */
  function interleave(cards) {
    const by = {}; for (const c of shuffle(cards)) (by[c.chapter] = by[c.chapter] || []).push(c);
    const keys = shuffle(Object.keys(by)); const out = [];
    while (keys.some(k => by[k].length)) for (const k of keys) if (by[k].length) out.push(by[k].shift());
    return out;
  }
  function buildSession(mode, arg) {
    const S = Store.S, now = Date.now();
    const isDue = c => S.cards[c.id] && S.cards[c.id].due <= now;
    if (mode === 'jour') {
      const p = plan();
      const due = p.due.sort((a, b) => S.cards[a.id].due - S.cards[b.id].due).slice(0, 200);
      const fresh = INTRO.filter(c => !S.cards[c.id]).slice(0, p.newLeft);
      return { title: 'Session du jour', cards: interleave(due.concat(fresh)) };
    }
    if (mode === 'ch') {
      const list = cardsOf(arg);
      const due = list.filter(isDue), fresh = INTRO.filter(c => c.chapter === arg && !S.cards[c.id]).slice(0, 25);
      const seenNotDue = list.filter(c => S.cards[c.id] && !isDue(c));
      const cards = due.concat(fresh);
      return { title: chapLabel(arg), cards: cards.length ? shuffle(cards) : shuffle(seenNotDue).slice(0, 30), extra: !cards.length };
    }
    if (mode === 'structures') {
      const list = ALL.filter(c => c.kind === 'rec' || c.kind === 'draw');
      const due = list.filter(isDue), fresh = list.filter(c => !S.cards[c.id] && INTRO.indexOf(c) >= 0).slice(0, 15);
      return { title: 'Structures', cards: interleave(due.concat(fresh)) };
    }
    if (mode === 'fragiles') {
      const list = ALL.filter(c => S.cards[c.id] && (S.cards[c.id].lapses > 0 || S.cards[c.id].ease < 2.2)).sort((a, b) => S.cards[a.id].ease - S.cards[b.id].ease).slice(0, 40);
      return { title: 'Cartes fragiles', cards: interleave(list) };
    }
    return { title: 'Session', cards: [] };
  }

  function viewCartes(mode, arg) {
    if (!mode) {
      const p = plan();
      const fragile = ALL.filter(c => Store.S.cards[c.id] && (Store.S.cards[c.id].lapses > 0 || Store.S.cards[c.id].ease < 2.2)).length;
      main().innerHTML = `
        <div class="page-head"><h1>Cartes</h1><p>Rappel actif + révision espacée : tu essaies de répondre de mémoire, tu retournes la carte, tu notes honnêtement. L'algorithme te la représente juste avant l'oubli.</p></div>
        <div class="grid three">
          <a class="game-tile" href="#/cartes/jour"><b>Session du jour</b><span>${p.due.length} à revoir + ${p.newLeft} nouvelles, tous chapitres mélangés.</span></a>
          <a class="game-tile" href="#/cartes/structures"><b>Structures</b><span>Reconnaître et dessiner les molécules.</span></a>
          <a class="game-tile" href="#/cartes/fragiles"><b>Cartes fragiles</b><span>${fragile} cartes déjà ratées au moins une fois.</span></a>
        </div>
        <h2>Par chapitre</h2>
        <div class="chips">${C.chapters.map(c => `<a class="chip" href="#/cartes/ch/${c.id}">${esc(c.num)}. ${esc(c.title)} <span class="muted">${cardsOf(c.id).length}</span></a>`).join('')}</div>
        <p class="small muted">Raccourcis : <span class="kbd">Espace</span> retourner · <span class="kbd">1</span> à revoir · <span class="kbd">2</span> difficile · <span class="kbd">3</span> bien · <span class="kbd">4</span> facile</p>`;
      return;
    }
    const sess = buildSession(mode, arg);
    runSession(sess);
  }

  function runSession(sess) {
    const queue = sess.cards.slice();
    let i = 0, shown = false, okCount = 0, initial = queue.length;
    let writeMode = false; try { writeMode = localStorage.getItem('phytoccm.write') === '1'; } catch (e) {}
    if (!queue.length) {
      main().innerHTML = `<div class="review"><div class="card done-box"><b>Rien à revoir</b><p>Tout est à jour pour « ${esc(sess.title)} ». Joue une partie ou lis une fiche.</p><div class="row" style="justify-content:center"><a class="btn primary" href="#/jeux">Jouer</a><a class="btn" href="#/aujourdhui">Aujourd'hui</a></div></div></div>`;
      return;
    }
    const render = () => {
      if (i >= queue.length) {
        Store.markTask('cartes');
        main().innerHTML = `<div class="review"><div class="card done-box"><b>Session terminée</b><p>${initial} cartes, ${okCount} réussites du premier coup. Reviens demain : l'oubli fait partie du processus.</p><div class="row" style="justify-content:center"><a class="btn primary" href="#/aujourdhui">Retour à aujourd'hui</a><a class="btn" href="#/jeux/${U.gameOfDay()}">Jeu du jour</a></div></div></div>`;
        return;
      }
      const c = queue[i]; const m = c.mol ? molById[c.mol] : null;
      const st = Store.S.cards[c.id];
      shown = false;
      main().innerHTML = `
        <div class="review">
          <div class="review-top"><a class="small" href="#/cartes">Quitter</a><div class="progress"><i style="width:${Math.round(i / queue.length * 100)}%"></i></div><span class="small muted">${i + 1}/${queue.length}</span>
            <label class="small"><input type="checkbox" id="wm" ${writeMode ? 'checked' : ''}> Mode écrit</label></div>
          <article class="card">
            <div class="meta"><span id="chapTag" style="color:${chapColor(c.chapter)};font-weight:700" ${c.kind === 'rec' ? 'hidden' : ''}>● ${esc(chapLabel(c.chapter))}</span>${c.kind === 'rec' ? '<span>Structure à identifier — chapitre masqué</span>' : ''}${st ? '' : '<span class="lvl dessiner">nouvelle</span>'}${m && c.kind !== 'rec' ? lvlTag(m.niveau) : ''}</div>
            <div class="q">${md(c.q)}</div>
            ${c.kind === 'rec' ? U.molImgAnon(m) : ''}
            ${c.kind === 'draw' ? `<p class="small muted" style="margin-top:8px">Dessine-la sur papier ou ci-dessous (souris, doigt ou stylet), puis compare.</p><canvas class="sketch" id="sk"></canvas><div class="row" style="margin-top:6px"><button class="btn sm ghost" id="skClear">Effacer</button></div>` : ''}
            ${writeMode && c.kind === 'card' ? `<textarea id="wa" style="min-height:90px;margin-top:14px" placeholder="Ta réponse, avant de retourner la carte…"></textarea>` : ''}
            <div class="a" id="ans" hidden>${c.kind === 'draw' ? molImg(m) : ''}${c.kind === 'card' && m ? molImg(m) : ''}${md(c.a)}${m ? `<p class="small" style="margin-top:8px"><button class="btn sm ghost" data-mol="${esc(m.id)}">Fiche de la molécule</button></p>` : ''}</div>
          </article>
          <div id="actions" style="margin-top:14px"><button class="btn primary" id="flip" style="width:100%">Afficher la réponse <span class="kbd">Espace</span></button></div>
        </div>`;
      if (c.kind === 'draw') sketchPad($('#sk'), $('#skClear'));
      $('#wm').addEventListener('change', e => { writeMode = e.target.checked; try { localStorage.setItem('phytoccm.write', writeMode ? '1' : '0'); } catch (err) {} render(); });
      $('#flip').addEventListener('click', flip);
    };
    const flip = () => {
      if (shown) return; shown = true;
      const c = queue[i];
      $('#ans').hidden = false; if ($('#chapTag')) $('#chapTag').hidden = false; bindMolCards($('#ans'));
      $('#actions').innerHTML = `<div class="rate">
        <button class="btn again" data-g="1">À revoir<small>${Store.previewIvl(c.id, 1)}</small></button>
        <button class="btn" data-g="2">Difficile<small>${Store.previewIvl(c.id, 2)}</small></button>
        <button class="btn good" data-g="3">Bien<small>${Store.previewIvl(c.id, 3)}</small></button>
        <button class="btn" data-g="4">Facile<small>${Store.previewIvl(c.id, 4)}</small></button></div>`;
      $$('#actions [data-g]').forEach(b => b.addEventListener('click', () => grade(+b.dataset.g)));
    };
    const grade = g => {
      const c = queue[i];
      const firstTime = !c._again;
      Store.rate(c.id, g);
      if (g >= 3 && firstTime) okCount++;
      if (g === 1) { const copy = Object.assign({}, c, { _again: true }); queue.splice(Math.min(queue.length, i + 6), 0, copy); }
      i++; render();
    };
    const onKey = e => {
      if (!document.body.contains($('.review'))) { document.removeEventListener('keydown', onKey); return; }
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      if (e.code === 'Space') { e.preventDefault(); flip(); }
      else if (shown && ['1', '2', '3', '4'].includes(e.key)) grade(+e.key);
    };
    document.addEventListener('keydown', onKey);
    render();
  }

  function sketchPad(cv, clearBtn) {
    const ratio = window.devicePixelRatio || 1;
    const fit = () => { const r = cv.getBoundingClientRect(); cv.width = r.width * ratio; cv.height = r.height * ratio; const x = cv.getContext('2d'); x.scale(ratio, ratio); x.lineWidth = 2.2; x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = '#17262B'; };
    fit();
    const ctx = cv.getContext('2d'); let drawing = false;
    const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.addEventListener('pointerdown', e => { drawing = true; cv.setPointerCapture(e.pointerId); const [x, y] = pos(e); ctx.beginPath(); ctx.moveTo(x, y); });
    cv.addEventListener('pointermove', e => { if (!drawing) return; const [x, y] = pos(e); ctx.lineTo(x, y); ctx.stroke(); });
    cv.addEventListener('pointerup', () => { drawing = false; });
    clearBtn.addEventListener('click', () => { ctx.clearRect(0, 0, cv.width, cv.height); });
  }

  /* ================= Examen blanc ================= */
  function viewExamen() {
    const pool = C.molecules.filter(m => m.svg && m.solubilite);
    const sel = [];
    // 6 structures de chapitres différents si possible
    for (const m of shuffle(pool)) { if (sel.length >= 6) break; if (!sel.some(x => x.chapter === m.chapter) || sel.length >= C.chapters.length) sel.push(m); }
    const open = sample(C.examOpen || [], 2);
    const he = C.examHE || null;
    let t0 = Date.now(), tick;
    main().innerHTML = `
      <div class="page-head"><h1>Examen blanc</h1><p>Même format que les exemples du prof. Réponds sans notes, puis affiche la correction. Compte environ 45 minutes.</p>
      <div class="row"><span id="clock" class="kbd" style="font-size:1rem">00:00</span><button class="btn ghost sm" onclick="location.reload()">Nouveau sujet</button></div></div>
      <div id="examBody">
      <section class="exam-q"><h3>Question 1 — À quelle classe (et sous-classe) phytochimique ces composés appartiennent-ils ?</h3>
        <p class="small">Pour chaque structure : nom, classe/sous-classe, <b>H₂O</b> (plutôt soluble dans l'eau) ou <b>SO</b> (extractible par un solvant organique peu polaire), et réaction <b>sans chauffage</b> : OUI + NaOH, OUI + HCl ou NON.</p>
        <div class="exam-grid">${sel.map((m, k) => `
          <div class="exam-cell" data-k="${k}">
            ${U.molImgAnon(m)}
            <input type="text" placeholder="Nom(s)" aria-label="Nom">
            <input type="text" placeholder="Classe / sous-classe" aria-label="Classe">
            <div class="row"><div class="toggle-grp" data-f="sol"><button type="button" data-v="H2O">H₂O</button><button type="button" data-v="SO">SO</button></div>
            <div class="toggle-grp" data-f="rx"><button type="button" data-v="naoh">+NaOH</button><button type="button" data-v="hcl">+HCl</button><button type="button" data-v="non">NON</button></div></div>
            <div class="corr"></div>
          </div>`).join('')}</div>
      </section>
      ${he ? `<section class="exam-q"><h3>Question 2 — ${esc(he.q)}</h3><textarea placeholder="Caractéristiques d'une HE…"></textarea>
        <table class="he-table" style="margin-top:10px"><tr><th>Classe phytochimique 1 : <input type="text" style="width:100%"></th><th>Classe phytochimique 2 : <input type="text" style="width:100%"></th></tr>
        <tr><td><textarea style="min-height:120px" placeholder="Composé (nom + structure sur papier), usage principal de l'HE, plante"></textarea></td><td><textarea style="min-height:120px" placeholder="Composé, usage, plante"></textarea></td></tr></table>
        <div class="corr" style="margin-top:10px">${md(he.a)}</div></section>` : ''}
      ${open.map((q, k) => `<section class="exam-q"><h3>Question ${he ? 3 + k : 2 + k} — ${md(q.q)}</h3><textarea placeholder="Réponse la plus complète possible…"></textarea><div class="corr" style="margin-top:10px"><b>Éléments attendus :</b><br>${md(q.a)}</div></section>`).join('')}
      <div class="row"><button class="btn primary" id="corrBtn">Afficher la correction</button></div>
      <div id="examScore" style="margin-top:14px"></div>
      </div>`;
    tick = setInterval(() => { const el = $('#clock'); if (!el) return clearInterval(tick); const s = Math.floor((Date.now() - t0) / 1000); el.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }, 1000);
    $$('.toggle-grp').forEach(g => g.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('button', g).forEach(x => x.classList.toggle('on', x === b)); }));
    $('#corrBtn').addEventListener('click', () => {
      clearInterval(tick);
      let pts = 0, tot = 0;
      $$('.exam-cell').forEach(cell => {
        const m = sel[+cell.dataset.k];
        const sol = $('[data-f=sol] .on', cell), rx = $('[data-f=rx] .on', cell);
        const expRx = m.naoh && m.hcl ? 'naoh+hcl' : m.naoh ? 'naoh' : m.hcl ? 'hcl' : 'non';
        const solOk = sol && (m.solubilite === sol.dataset.v || m.solubilite === 'H2O+SO');
        const rxOk = rx && (expRx === rx.dataset.v || (expRx === 'naoh+hcl' && rx.dataset.v !== 'non'));
        tot += 2; pts += (solOk ? 1 : 0) + (rxOk ? 1 : 0);
        if (sol) sol.classList.add(solOk ? 'right' : 'wrong');
        if (rx) rx.classList.add(rxOk ? 'right' : 'wrong');
        $('.corr', cell).innerHTML = `<b>${esc(m.name)}</b><br>${esc(m.classe)}${m.sousClasse ? ' — ' + esc(m.sousClasse) : ''}<br>Solubilité : <b>${esc(m.solubilite)}</b> · Réaction à froid : <b>${expRx === 'non' ? 'NON' : 'OUI + ' + expRx.replace('naoh', 'NaOH').replace('hcl', 'HCl')}</b>${m.reactiviteNote ? `<br><span class="muted">${md(m.reactiviteNote)}</span>` : ''}`;
        if (!solOk || !rxOk) Store.flag('mol-rec-' + m.id);
      });
      $('#examBody').classList.add('show-corr');
      $('#examScore').innerHTML = `<div class="feedback">Solubilités et réactivités : <b>${pts}/${tot}</b>. Corrige toi-même les noms, classes et questions ouvertes à partir des éléments attendus. Les structures ratées reviennent dans tes cartes.</div>`;
      Store.S.exams.push({ date: Store.todayKey(), score: pts, total: tot }); Store.markTask('examen');
    });
  }

  /* ================= Méthode ================= */
  function viewMethode() {
    const rows = [
      ['Rappel actif', 'Se tester fait plus retenir que relire. Les cartes, les questions « Pourquoi ? », le rappel libre et les jeux t\'obligent à reconstruire la réponse avant de la voir.', 'Cartes, Rappel libre, Jeux'],
      ['Révision espacée', 'Revoir juste avant d\'oublier, à intervalles croissants (1 j, 3 j, 1 semaine…). Pour un examen dans environ 3 mois, des écarts de 1 à 3 semaines entre deux révisions d\'une même notion sont les plus rentables. Aucune carte n\'est programmée après la veille de l\'examen.', 'Session du jour'],
      ['Pratique mélangée', 'Mélanger les chapitres oblige à identifier d\'abord la catégorie (est-ce une coumarine ou un flavonoïde ?), exactement ce que demande la question « À quelle classe appartient ce composé ? ».', 'Session du jour, Classe-moi, Examen blanc'],
      ['Questions « Pourquoi ? »', 'Expliquer pourquoi un fait est vrai (pourquoi deux anomères pour le maltose et pas pour le saccharose ?) le relie à ce que tu sais déjà et le rend durable.', 'Onglet Pourquoi ? de chaque chapitre'],
      ['Double codage', 'Associer un mot à une image (structure, photo de la drogue) crée deux traces en mémoire au lieu d\'une.', 'Atlas, Plantes, Paires'],
      ['Dessiner', 'Dessiner une structure de mémoire est une forme de rappel actif très efficace, et c\'est demandé à l\'examen pour toutes les structures surlignées en jaune.', 'Cartes « Dessine », Structures'],
      ['Feuille blanche', 'Écrire tout ce qu\'on sait d\'un chapitre, puis comparer, montre précisément ce qui manque — et s\'entraîne comme à l\'examen.', 'Rappel libre'],
      ['Conditions d\'examen', 'S\'entraîner au format réel (structures + H₂O/SO + NaOH/HCl, HE, question ouverte) réduit le stress et révèle les points faibles à temps.', 'Examen blanc']
    ];
    main().innerHTML = `
      <div class="page-head"><h1>Méthode</h1><p>Pourquoi le site est construit comme ça : les techniques ci-dessous sont celles qui ont le plus d'appui dans la recherche en psychologie de l'apprentissage.</p></div>
      <div class="prose">${rows.map(r => `<div class="method-row"><b>${r[0]}</b><div>${esc(r[1])}<div class="small muted" style="margin-top:4px">Sur le site : ${esc(r[2])}</div></div></div>`).join('')}
      <h2>Une journée type (35–50 min)</h2>
      <ul><li>Session du jour : d'abord les cartes à revoir, puis les nouvelles. Note honnêtement : « Bien » seulement si la réponse est complète.</li>
      <li>Fiche du chapitre en cours : lire l'essentiel, puis les questions « Pourquoi ? » sans regarder.</li>
      <li>Un jeu de 10 manches pour mélanger les chapitres.</li>
      <li>Une fois par semaine : rappel libre d'un chapitre ancien. Dans les 3 dernières semaines : un examen blanc tous les 2–3 jours.</li></ul>
      <h2>Sources</h2>
      <ul class="small">
        <li>Dunlosky et al. (2013), <em>Improving Students' Learning With Effective Learning Techniques</em>, Psychological Science in the Public Interest 14(1) — tests et pratique espacée jugés les plus utiles.</li>
        <li>Roediger &amp; Karpicke (2006), <em>Test-Enhanced Learning</em>, Psychological Science — effet de test.</li>
        <li>Cepeda, Vul, Rohrer, Wixted &amp; Pashler (2008), <em>Spacing effects in learning: a temporal ridgeline of optimal retention</em>, Psychological Science.</li>
        <li>Rohrer &amp; Taylor (2007), pratique mélangée ; MIT Open Learning, <em>Spaced and interleaved practice</em>.</li>
        <li>Paivio (1971/1986), théorie du double codage ; Wammes, Meade &amp; Fernandes (2016), effet du dessin sur la mémoire.</li>
      </ul></div>`;
  }

  /* ================= Réglages ================= */
  function viewReglages() {
    const S = Store.S;
    main().innerHTML = `
      <div class="page-head"><h1>Réglages</h1></div>
      <div class="grid two">
        <div class="panel"><h3>Examen</h3>
          <label>Date de l'examen<br><input type="date" id="exDate" value="${esc(S.settings.examDate)}"></label>
          <p class="small muted" style="margin-top:8px">Le planning et les intervalles de révision s'adaptent à cette date. Dis-le aussi à Claude pour mettre à jour le rappel quotidien.</p>
          <label>Nouvelles cartes par jour<br><input type="number" id="npd" min="0" max="200" value="${S.settings.newPerDay || 0}"> <span class="small muted">0 = automatique (${plan().newQuota} aujourd'hui)</span></label>
          <div class="row" style="margin-top:12px"><button class="btn primary" id="saveSet">Enregistrer</button></div>
        </div>
        <div class="panel"><h3>Sauvegarde</h3>
          <p class="small">${/^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'Ta progression est enregistrée dans ce navigateur et dans le fichier <b>progress.json</b> du dossier revision-phytochimie.' : 'Ta progression est enregistrée dans ce navigateur (ou dans Notion, si tu révises depuis l\'intégration). Pour passer d\'un appareil à l\'autre : <b>Exporter</b> ici, puis <b>Importer</b> là-bas.'}</p>
          <div class="row"><button class="btn" id="exp">Exporter (.json)</button><label class="btn ghost">Importer<input type="file" id="imp" accept="application/json" hidden></label></div>
          <hr><button class="btn ghost" id="rst" style="border-color:var(--red);color:var(--red)">Tout remettre à zéro</button>
        </div>
      </div>
      <p class="small muted" style="margin-top:20px">${U.ALL.length} cartes · ${C.molecules.length} molécules · ${C.plantes.length} plantes · ${(C.qcm || []).length} QCM</p>`;
    $('#saveSet').addEventListener('click', () => { S.settings.examDate = $('#exDate').value || S.settings.examDate; S.settings.newPerDay = +$('#npd').value || 0; Store.save(); toast('Réglages enregistrés'); });
    $('#exp').addEventListener('click', () => { const b = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `phyto-progression-${Store.todayKey()}.json`; a.click(); });
    $('#imp').addEventListener('change', async e => { const f = e.target.files[0]; if (!f) return; try { Store.replace(JSON.parse(await f.text())); toast('Progression importée'); } catch (err) { toast('Fichier illisible : choisis un export .json du site'); } });
    $('#rst').addEventListener('click', () => { if (confirm('Effacer toute ta progression ?')) { Store.reset(); toast('Progression remise à zéro'); viewReglages(); } });
  }

  window.Views = { viewToday, viewCours, viewChapter, viewMolecules, viewPlantes, viewCartes, viewExamen, viewMethode, viewReglages, molDialog, openDialog, bindMolCards, GAME_NAMES };
})();
