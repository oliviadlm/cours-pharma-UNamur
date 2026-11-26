/* Accès aux jeux : aperçu gratuit (chapitre 1), fenêtre du code, transfert de progression.
   Chargé par chaque jeu juste après ses données, avant le moteur du jeu. */
(function () {
  var NOUVEAU = 'https://pharma-unamur.ayeleartstudio.com';
  var ici = document.currentScript ? document.currentScript.src.replace(/acces\.js.*$/, '') : '/acces/';
  var A = (window.ACCES = {});
  A.accueil = ici.replace(/acces\/$/, '');
  var D = window.DATA || {};
  try { A.nom = localStorage.getItem('acces-nom') || (location.hostname.indexOf('github.io') >= 0 ? 'Olivia' : ''); } catch (e) { A.nom = ''; }

  /* ---------- 1. arrivée d'une progression transférée (#transfert=...) ---------- */
  var h = location.hash;
  if (h.indexOf('#transfert=') === 0) {
    try {
      var b = h.slice(11).replace(/-/g, '+').replace(/_/g, '/');
      var txt = decodeURIComponent(escape(atob(b)));
      var obj = JSON.parse(txt), n = 0;
      Object.keys(obj).forEach(function (k) { localStorage.setItem(k, obj[k]); n++; });
      sessionStorage.setItem('acces-transfert', String(n));
    } catch (e) { sessionStorage.setItem('acces-transfert', 'erreur'); }
    location.replace(location.pathname + location.search);
    return;
  }

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function css() {
    if (document.getElementById('acces-css')) return;
    var l = document.createElement('link'); l.id = 'acces-css'; l.rel = 'stylesheet'; l.href = ici + 'acces.css';
    document.head.appendChild(l);
  }
  var CADENAS = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>';

  /* ---------- 2. fenêtre « entre ton code » ---------- */
  A.demander = function (quoi) {
    css();
    var fond = el('div', 'acces-fond');
    var carte = el('div', 'acces-carte acces-modale');
    carte.setAttribute('role', 'dialog'); carte.setAttribute('aria-modal', 'true');
    carte.innerHTML =
      '<button class="acces-x" aria-label="Fermer">×</button>' +
      '<div class="acces-ic">' + CADENAS + '</div>' +
      '<h2>' + (quoi ? '« ' + String(quoi).replace(/</g, '&lt;') + ' » est réservé' : 'Version complète') + '</h2>' +
      '<p>Tu joues à l\'aperçu gratuit : le chapitre 1 est ouvert. Entre ton code d\'accès pour débloquer tous les chapitres.</p>' +
      '<form><input autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Ton code" required>' +
      '<button>Débloquer</button></form><p class="acces-err" role="alert"></p>' +
      '<p class="acces-petit">Pas encore de code ? Demande-le à Olivia.</p>';
    fond.appendChild(carte); document.body.appendChild(fond);
    var inp = carte.querySelector('input'), err = carte.querySelector('.acces-err'), btn = carte.querySelector('form button');
    function fermer() { fond.remove(); }
    carte.querySelector('.acces-x').onclick = fermer;
    fond.onclick = function (e) { if (e.target === fond) fermer(); };
    setTimeout(function () { inp.focus(); }, 50);
    carte.querySelector('form').onsubmit = function (ev) {
      ev.preventDefault(); btn.disabled = true; err.textContent = '';
      var code = inp.value.trim().toUpperCase();
      fetch('/acces/api/entrer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: code }) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j.ok) { err.textContent = j.erreur || 'Code refusé.'; btn.disabled = false; return; }
          try { localStorage.setItem('acces-nom', j.nom || ''); } catch (e) {}
          carte.innerHTML = '<div class="acces-ic acces-ok">' + CADENAS + '</div><h2>Bienvenue' + (j.nom ? ' ' + j.nom : '') + ' !</h2><p>Tous les chapitres sont débloqués. Chargement…</p>';
          var u = new URL(location.href);
          if (window.self !== window.top) u.searchParams.set('code', code); // embed : les cookies tiers peuvent être bloqués
          setTimeout(function () { location.replace(u.toString()); }, 900);
        })
        .catch(function () { err.textContent = 'Pas de connexion. Réessaie.'; btn.disabled = false; });
    };
  };

  /* ---------- 3. pastille « aperçu gratuit » ---------- */
  function pastille() {
    if (!D.apercu || location.hostname.indexOf('github.io') >= 0) return;
    css();
    var p = el('button', 'acces-pastille', CADENAS + '<span>Aperçu gratuit · <b>Débloquer</b></span>');
    p.onclick = function () { A.demander(''); };
    document.body.appendChild(p);
  }

  /* ---------- 4. ancien site (GitHub Pages) : bannière de déménagement ---------- */
  function demenagement() {
    if (location.hostname.indexOf('github.io') < 0) return;
    fetch(NOUVEAU + '/acces/acces.css', { mode: 'no-cors', cache: 'no-store' }).then(function () {
      css();
      var chemin = location.pathname.replace(/^\/cours-pharma-unamur/i, '');
      var b = el('div', 'acces-banniere',
        '<span>Le site déménage sur <b>' + NOUVEAU.replace('https://', '') + '</b></span>' +
        '<button class="acces-go">Transférer ma progression</button><button class="acces-copier">Copier</button><button class="acces-x" aria-label="Fermer">×</button>');
      function paquet() {
        var o = {};
        for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); o[k] = localStorage.getItem(k); }
        return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      }
      b.querySelector('.acces-go').onclick = function () { location.href = NOUVEAU + chemin + '#transfert=' + paquet(); };
      b.querySelector('.acces-copier').onclick = function () {
        var t = paquet(), bt = this;
        (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () {
          bt.textContent = 'Copié · colle-le sur ' + NOUVEAU.replace('https://', '') + '/acces/transfert.html';
        }, function () { prompt('Copie ce texte :', t); });
      };
      b.querySelector('.acces-x').onclick = function () { b.remove(); };
      document.body.appendChild(b);
    }, function () {});
  }

  /* ---------- 5. message après un transfert ---------- */
  function apresTransfert() {
    var t = sessionStorage.getItem('acces-transfert');
    if (!t) return;
    sessionStorage.removeItem('acces-transfert');
    css();
    var m = el('div', 'acces-toast', t === 'erreur' ? 'Le transfert n\'a pas marché. Utilise le bouton « Copier » sur l\'ancien site.' : 'Progression transférée (' + t + ' sauvegardes).');
    document.body.appendChild(m);
    setTimeout(function () { m.remove(); }, 5000);
  }

  function pret() { demenagement(); apresTransfert(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pret); else pret();
})();
