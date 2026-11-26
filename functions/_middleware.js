/*
 * Accès au site de révision (Cloudflare Pages Functions)
 *
 * - Le chapitre 1 de chaque jeu sert de test : il de chaque jeu est ouvert à tout le monde.
 * - Le reste (autres chapitres, cours, fiches) demande un code d'accès personnel.
 * - Les codes sont rangés dans le KV « CODES » (clé « code:XXXX ») et se gèrent sur /admin.
 *
 * Réglages Cloudflare (Pages > projet > Settings) :
 *   - liaison KV  : CODES       -> un espace de noms KV
 *   - variable    : ADMIN_CODE  -> mot de passe de la page /admin (secret)
 */

// Pages ouvertes à tout le monde (sans .html, sans /index)
const PAGES_PUBLIQUES = new Set([
  "/",
  "/chimie-pharma/revision/jeu-chipha",
  "/chimie-pharma/revision/jeu-antibacteriens",
  "/mphab310/jeu-phyto",
  "/mphab310/jeu-glucides",
  "/biochimie/jeu-biochimie",
  "/mphab287/jeu-calculs",
]);

// Données complètes des jeux : remplacées par l'aperçu sans code valide
const DONNEES_JEUX = new Set([
  "/chimie-pharma/revision/donnees-chipha.js",
  "/mphab310/donnees-phyto.js",
  "/biochimie/donnees-biochimie.js",
  "/mphab287/donnees-calculs.js",
]);

// Contenu de cours hors pages HTML : code obligatoire
const DONNEES_PROTEGEES = [
  /^\/chimie-pharma\/data\//,
  /^\/mphab310\/js\/content\.js$/,
  /^\/biochimie\/jeu\/data\.js$/,
];

// Jamais servi (outils, sources, fonctions)
const INTERDIT = [
  /^\/(functions|outils)\//,
  /\/_build\//,
  /\.(py|md|txt|toml)$/i,
  /^\/\.git/,
];

// Liens courts à partager (ex. pharma-unamur.ayeleartstudio.com/chimie)
const LIENS_COURTS = {
  "/chimie": "/chimie-pharma/revision/jeu-chipha",
  "/phyto": "/mphab310/jeu-phyto",
  "/biochimie-jeu": "/biochimie/jeu-biochimie",
  "/calculs": "/mphab287/jeu-calculs",
};

const COOKIE = "acces";
const DUREE = 60 * 60 * 24 * 180; // 6 mois
const cache = new Map(); // code -> {ok, nom, t}

function normCode(c) {
  return String(c || "").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 40);
}

function lireCookie(req, nom) {
  const h = req.headers.get("Cookie") || "";
  for (const part of h.split(/;\s*/)) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i) === nom) return decodeURIComponent(part.slice(i + 1));
  }
  return "";
}

async function verifier(env, code) {
  code = normCode(code);
  if (!code || !env.CODES) return null;
  const c = cache.get(code);
  if (c && Date.now() - c.t < 120000) return c.ok ? c : null;
  const v = await env.CODES.get("code:" + code, "json");
  const r = { ok: !!v, nom: v ? v.nom : "", code, t: Date.now() };
  cache.set(code, r);
  return r.ok ? r : null;
}

// Code venant du cookie, de ?code= dans l'adresse, ou de la page qui a demandé le fichier (embeds Notion)
async function acces(req, env, url) {
  const essais = [lireCookie(req, COOKIE), url.searchParams.get("code")];
  const ref = req.headers.get("Referer");
  if (ref) {
    try {
      const r = new URL(ref);
      if (r.host === url.host) essais.push(r.searchParams.get("code"));
    } catch (e) {}
  }
  for (const c of essais) {
    if (!c) continue;
    const v = await verifier(env, c);
    if (v) return v;
  }
  return null;
}

function cookieAcces(code, duree = DUREE) {
  return `${COOKIE}=${encodeURIComponent(code)}; Path=/; Max-Age=${duree}; HttpOnly; Secure; SameSite=None; Partitioned`;
}

function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra },
  });
}

const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------- administration des codes ---------------- */

async function signe(secret, txt) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const s = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(txt));
  return [...new Uint8Array(s)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function estAdmin(req, env) {
  if (!env.ADMIN_CODE) return false;
  return lireCookie(req, "admin") === (await signe(env.ADMIN_CODE, "admin-v1"));
}

const ALPHA = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
function nouveauCode(nom) {
  const prefixe = (nom || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6) || "PHARMA";
  const r = crypto.getRandomValues(new Uint8Array(6));
  return prefixe + "-" + [...r].map((b) => ALPHA[b % ALPHA.length]).join("");
}

async function api(req, env, url) {
  const p = url.pathname;
  const corps = req.method === "POST" ? await req.json().catch(() => ({})) : {};

  if (p === "/acces/api/entrer" && req.method === "POST") {
    const v = await verifier(env, corps.code);
    if (!v) {
      await attendre(700);
      return json({ ok: false, erreur: "Ce code ne fonctionne pas. Vérifie-le ou demande-le à Olivia." }, 401);
    }
    const k = "code:" + v.code;
    const fiche = (await env.CODES.get(k, "json")) || {};
    fiche.vu = new Date().toISOString().slice(0, 10);
    await env.CODES.put(k, JSON.stringify(fiche));
    return json({ ok: true, nom: v.nom }, 200, { "Set-Cookie": cookieAcces(v.code) });
  }
  if (p === "/acces/api/sortir") {
    return json({ ok: true }, 200, { "Set-Cookie": cookieAcces("", 0) });
  }
  if (p === "/acces/api/etat") {
    const v = await acces(req, env, url);
    return json({ ok: !!v, nom: v ? v.nom : "" });
  }

  // --- admin ---
  if (p === "/acces/api/admin/entrer" && req.method === "POST") {
    if (!env.ADMIN_CODE || String(corps.mdp || "") !== env.ADMIN_CODE) {
      await attendre(1000);
      return json({ ok: false, erreur: "Mot de passe incorrect." }, 401);
    }
    const s = await signe(env.ADMIN_CODE, "admin-v1");
    return json({ ok: true }, 200, { "Set-Cookie": `admin=${s}; Path=/; Max-Age=${DUREE}; HttpOnly; Secure; SameSite=Strict` });
  }
  if (!(await estAdmin(req, env))) return json({ ok: false, erreur: "Non connectée." }, 401);

  if (p === "/acces/api/admin/codes" && req.method === "GET") {
    const out = [];
    let cursor;
    do {
      const l = await env.CODES.list({ prefix: "code:", cursor });
      for (const k of l.keys) {
        const v = (await env.CODES.get(k.name, "json")) || {};
        out.push({ code: k.name.slice(5), nom: v.nom || "", cree: v.cree || "", vu: v.vu || "" });
      }
      cursor = l.list_complete ? null : l.cursor;
    } while (cursor);
    out.sort((a, b) => (b.cree || "").localeCompare(a.cree || ""));
    return json({ ok: true, codes: out });
  }
  if (p === "/acces/api/admin/codes" && req.method === "POST") {
    const nom = String(corps.nom || "").trim().slice(0, 60);
    if (!nom) return json({ ok: false, erreur: "Indique un prénom." }, 400);
    let code = normCode(corps.code) || nouveauCode(nom);
    if (await env.CODES.get("code:" + code)) code = nouveauCode(nom);
    await env.CODES.put("code:" + code, JSON.stringify({ nom, cree: new Date().toISOString().slice(0, 10) }));
    return json({ ok: true, code, nom });
  }
  if (p === "/acces/api/admin/supprimer" && req.method === "POST") {
    const code = normCode(corps.code);
    await env.CODES.delete("code:" + code);
    cache.delete(code);
    return json({ ok: true });
  }
  return json({ ok: false, erreur: "Inconnu." }, 404);
}

/* ---------------- page « contenu réservé » ---------------- */

function pageVerrou(url) {
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex"><title>Contenu réservé · Cours pharma</title>
<link rel="stylesheet" href="/acces/acces.css"></head>
<body class="acces-page"><main class="acces-carte">
<div class="acces-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg></div>
<h1>Entre ton code</h1>
<p>Cette page s'ouvre avec ton code d'accès personnel.</p>
<form id="f"><input id="c" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Ton code" required>
<button>Débloquer</button></form><p id="e" class="acces-err" role="alert"></p>
<p class="acces-petit">Pas encore de code ? Demande-le à Olivia.<br><a href="/">Retour aux jeux</a></p>
</main><script>
document.getElementById('f').onsubmit=async function(ev){ev.preventDefault();var b=this.querySelector('button');b.disabled=true;
var code=document.getElementById('c').value;
try{var r=await fetch('/acces/api/entrer',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:code})});var j=await r.json();
if(j.ok){var u=new URL(location.href);if(window.self!==window.top)u.searchParams.set('code',code.toUpperCase().trim());location.replace(u)}else{document.getElementById('e').textContent=j.erreur;b.disabled=false}}
catch(x){document.getElementById('e').textContent='Pas de connexion. Réessaie.';b.disabled=false}};
</script></body></html>`;
  return new Response(html, {
    status: 401,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}

/* ---------------- aiguillage ---------------- */

function cle(path) {
  let p = path.replace(/\/index(\.html)?$/, "/").replace(/\.html$/, "");
  try { p = decodeURI(p); } catch (e) {}
  return p;
}

function estPage(path) {
  return path.endsWith("/") || path.endsWith(".html") || !/\.[a-z0-9]+$/i.test(path.split("/").pop());
}

function prive(rep) {
  const r = new Response(rep.body, rep);
  r.headers.set("Cache-Control", "private, no-cache");
  r.headers.set("Vary", "Cookie, Referer");
  r.headers.set("X-Robots-Tag", "noindex");
  return r;
}

export async function onRequest(ctx) {
  const { request: req, env, next } = ctx;
  const url = new URL(req.url);
  const path = url.pathname;

  if (INTERDIT.some((r) => r.test(path))) return new Response("Introuvable", { status: 404 });
  const court = LIENS_COURTS[path.replace(/\/$/, "").toLowerCase()];
  if (court) return Response.redirect(new URL(court + url.search, url), 302);
  if (path.startsWith("/acces/api/")) return api(req, env, url);
  if (cle(path) === "/admin") return env.ASSETS.fetch(new URL("/acces/admin.html", url));
  if (path.startsWith("/acces/")) return next();

  // Données des jeux : complètes avec un code, aperçu sinon (même adresse)
  if (DONNEES_JEUX.has(path)) {
    const v = await acces(req, env, url);
    if (v) return prive(await next());
    const a = new URL(path.replace(/\.js$/, ".apercu.js"), url);
    return prive(await env.ASSETS.fetch(new Request(a, req)));
  }
  if (path.endsWith(".apercu.js")) return prive(await next());

  const protege = DONNEES_PROTEGEES.some((r) => r.test(path)) || (estPage(path) && !PAGES_PUBLIQUES.has(cle(path)));
  if (!protege) {
    const q = url.searchParams.get("code");
    if (!q || !estPage(path)) return next();
    const v = await verifier(env, q);
    const rep = await next();
    if (!v || lireCookie(req, COOKIE) === v.code) return rep;
    const r = new Response(rep.body, rep);
    r.headers.append("Set-Cookie", cookieAcces(v.code));
    return r;
  }

  const v = await acces(req, env, url);
  if (!v) return estPage(path) ? pageVerrou(url) : new Response("Code d'accès requis", { status: 401 });
  const rep = prive(await next());
  // ?code= dans l'adresse (embed Notion, lien envoyé) : on retient le code
  const q = url.searchParams.get("code");
  if (q && normCode(q) === v.code && lireCookie(req, COOKIE) !== v.code) rep.headers.append("Set-Cookie", cookieAcces(v.code));
  return rep;
}
