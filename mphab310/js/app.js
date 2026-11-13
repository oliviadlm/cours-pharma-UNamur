/* Routeur et démarrage */
(function () {
  const { $, $$ } = U;
  function route() {
    const parts = (location.hash || '#/aujourdhui').replace(/^#\/?/, '').split('/');
    const [page, a, b] = parts;
    $$('.nav a[data-nav]').forEach(x => x.classList.toggle('on', x.dataset.nav === page));
    window.scrollTo(0, 0);
    switch (page) {
      case 'cours': a ? Views.viewChapter(a, b) : Views.viewCours(); break;
      case 'cartes': Views.viewCartes(a, b); break;
      case 'molecules': Views.viewMolecules(a); break;
      case 'plantes': Views.viewPlantes(); break;
      case 'jeux': Games.viewJeux(a); break;
      case 'examen': Views.viewExamen(); break;
      case 'methode': Views.viewMethode(); break;
      case 'reglages': Views.viewReglages(); break;
      default: Views.viewToday();
    }
    const h = $('#main h1'); document.title = h && page && page !== 'aujourdhui' ? `${h.textContent} · Phyto CCM` : 'Phyto CCM';
  }
  function applyTheme() {
    const t = Store.S.settings.theme;
    if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
  }
  $('#themeToggle').addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    Store.S.settings.theme = dark ? 'light' : 'dark'; Store.save(); applyTheme();
  });
  window.addEventListener('hashchange', route);
  Store.load(); applyTheme(); route();
  Store.syncFromServer().then(changed => { if (changed) { applyTheme(); route(); } });
})();
