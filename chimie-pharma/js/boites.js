// Boîtes de médicaments schématiques (SVG) — aide-mémoire visuel.
// Ce ne sont PAS les vraies boîtes : couleur = famille, motif = propre à chaque marque.
// Vraie photo : déposer donnees/photos/<nom-de-la-marque>.png (ex. clamoxyl.png) — elle remplace la boîte dessinée.
(function () {
  const FAM = {
    "β-lactames": ["#1f5fbf", "#e8f0fc"], "Antibactériens de synthèse": ["#6b3fa0", "#f1eafa"],
    "Métabolisme des folates": ["#c27c0e", "#fdf3e1"], "Vitamines": ["#c27c0e", "#fdf3e1"],
    "Anti-inflammatoires intestinaux": ["#a0522d", "#f8ece4"], "Chloramphénicols": ["#2f7d6d", "#e3f3ef"],
    "Tétracyclines et apparentés": ["#d4a017", "#fbf5dc"], "Antibiotiques osidiques": ["#b0306a", "#fae6ef"],
    "Antibiotiques polypeptidiques": ["#5a6b2f", "#eef2e0"], "Autres antibiotiques": ["#c2410c", "#fdeee4"],
    "Quinolones": ["#0e7490", "#e0f4f8"], "Antiseptiques urinaires": ["#4f46e5", "#ebeafd"],
    "Antituberculeux": ["#9f1239", "#fbe6ec"], "Antilépreux": ["#7c2d12", "#f7e9e2"],
    "Antimycosiques": ["#15803d", "#e4f5ea"], "Antiprotozoaires": ["#7e22ce", "#f3e8fc"],
    "Antiviraux": ["#0f766e", "#e0f2ef"], "Acides nucléiques (rappel)": ["#64748b", "#eef1f5"], "Antimalariques": ["#a16207", "#fbf3dc"],
    "Anthelminthiques": ["#65a30d", "#eef7e2"], "Désinfectants et antiseptiques de contact": ["#0369a1", "#e2f0f9"], "Antiseptiques intestinaux": ["#4f46e5", "#ebeafd"],
    "Agents alkylants": ["#be123c", "#fbe5ea"], "Antimétabolites": ["#c2410c", "#fdeee4"], "Antinéoplasiques": ["#9d174d", "#fbe7f0"],
    "Antitumoraux – thérapies ciblées": ["#6d28d9", "#efe9fc"], "Antitumoraux – immunothérapie": ["#4338ca", "#e9e8fb"], "Antihormonaux (oncologie)": ["#db2777", "#fce7f1"],
    "Antitumoraux hormonaux": ["#db2777", "#fce7f1"], "Antitumoraux divers": ["#7c2d12", "#f7e9e2"], "Photosensibilisants": ["#ca8a04", "#fdf6d8"],
    "Détoxifiants (produits associés)": ["#0891b2", "#e0f4f8"], "Pesticides": ["#4d7c0f", "#eef5e1"], "Immunomodulateurs": ["#1d4ed8", "#e6edfd"],
    "Immunosuppresseurs": ["#334155", "#e9edf2"], "Antibactériens": ["#6b3fa0", "#f1eafa"],
  };
  const famColor = f => FAM[f] || ["#475569", "#eef1f5"];
  function hash(s) { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function slug(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/®/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function brandName(b) { return b.replace(/\(.*?\)/g, "").replace(/^(anc\.|in)\s+/i, "").trim(); }

  function svg(brand, mol) {
    const name = brandName(brand), h = hash(name), [c1, c2] = famColor(mol.famille);
    const v = h % 4, deco = (h >> 3) % 4;
    const W = 300, H = 170, dx = 34, dy = 22; // face avant + profondeur
    const fs = name.length > 22 ? 17 : name.length > 15 ? 21 : name.length > 10 ? 26 : 32;
    const lines = name.length > 22 ? splitName(name) : [name];
    let band = "";
    if (v === 0) band = `<rect x="0" y="0" width="${W}" height="38" fill="${c1}"/>`;
    if (v === 1) band = `<rect x="0" y="${H - 34}" width="${W}" height="34" fill="${c1}"/>`;
    if (v === 2) band = `<polygon points="0,${H} 0,${H - 60} ${W},${H - 18} ${W},${H}" fill="${c1}"/>`;
    if (v === 3) band = `<rect x="0" y="0" width="22" height="${H}" fill="${c1}"/><rect x="26" y="0" width="5" height="${H}" fill="${c1}" opacity=".5"/>`;
    let dec = "";
    const cx = 240 + (h % 30), cy = 60 + (h % 40);
    if (deco === 0) dec = `<circle cx="${cx}" cy="${cy}" r="36" fill="${c1}" opacity=".13"/><circle cx="${cx}" cy="${cy}" r="20" fill="${c1}" opacity=".18"/>`;
    if (deco === 1) dec = `<path d="M0 ${110 + h % 20} Q 75 ${80 + h % 30} 150 ${110 + h % 20} T 300 ${100 + h % 25}" stroke="${c1}" stroke-width="7" fill="none" opacity=".22"/>`;
    if (deco === 2) dec = [0, 1, 2].map(i => `<rect x="${200 + i * 26}" y="${48 + i * 10}" width="18" height="18" rx="4" fill="${c1}" opacity="${.12 + i * .07}" transform="rotate(${(h % 40) - 20} ${209 + i * 26} ${57 + i * 10})"/>`).join("");
    if (deco === 3) dec = `<polygon points="${cx},${cy - 34} ${cx + 30},${cy + 18} ${cx - 30},${cy + 18}" fill="${c1}" opacity=".15"/>`;
    const textY = v === 0 ? 78 : 56;
    const tx = v === 3 ? 44 : 18;
    const brandTxt = lines.map((l, i) => `<text x="${tx}" y="${textY + i * (fs + 2)}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif" font-weight="800" font-size="${fs}" fill="${c1}" letter-spacing=".5">${esc(l)}</text>`).join("");
    const dciY = textY + (lines.length - 1) * (fs + 2) + 24;
    const paren = (brand.match(/\(([^)]*)\)/) || [])[1] || "";
    const plus = paren.trim().startsWith("+") ? " " + paren.trim() : "";
    const dciLabel = (mol.dci.toLowerCase() + plus).slice(0, 44);
    const dciTxt = `<text x="${tx}" y="${dciY}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif" font-size="${dciLabel.length > 32 ? 12 : 14}" fill="#334155">${esc(dciLabel)}</text>`;
    const voie = (!plus && paren ? paren : (mol.voie_administration || "").split(/[;,(.]/)[0]).trim().slice(0, 40);
    const voieTxt = voie ? `<text x="${tx}" y="${dciY + 18}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif" font-size="11" fill="#64748b">${esc(voie)}</text>` : "";
    const fam = `<text x="${W - 10}" y="${v === 1 ? H - 12 : H - 10}" text-anchor="end" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif" font-size="10" font-weight="600" fill="${v === 1 || v === 2 ? "#fff" : c1}">${esc(mol.classe || mol.famille)}</text>`;
    const front = `<g transform="translate(0,${dy})"><rect width="${W}" height="${H}" fill="${c2}"/>${dec}${band}${brandTxt}${dciTxt}${voieTxt}${fam}<rect width="${W}" height="${H}" fill="none" stroke="#0f172a" stroke-opacity=".25"/></g>`;
    const top = `<polygon points="0,${dy} ${dx},0 ${W + dx},0 ${W},${dy}" fill="${c2}" stroke="#0f172a" stroke-opacity=".2"/><polygon points="0,${dy} ${dx},0 ${W + dx},0 ${W},${dy}" fill="#fff" opacity=".35"/>`;
    const side = `<polygon points="${W},${dy} ${W + dx},0 ${W + dx},${H} ${W},${H + dy}" fill="${c1}" opacity=".85"/><text transform="translate(${W + 22},${H - 6}) rotate(-90)" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif" font-size="11" font-weight="700" fill="#fff">${esc(name.slice(0, 18))}</text>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${W + dx + 4} ${H + dy + 4}" role="img" aria-label="Boîte ${esc(name)}">${top}${side}${front}</svg>`;
  }
  function splitName(n) { const w = n.split(" "); const half = Math.ceil(w.length / 2); return [w.slice(0, half).join(" "), w.slice(half).join(" ")]; }

  // Renvoie du HTML : photo réelle si elle existe, sinon PNG généré, sinon SVG en ligne
  function html(brand, mol, cls) {
    const s = slug(brandName(brand));
    const inline = svg(brand, mol).replace(/"/g, "'");
    return `<div class="boite ${cls || ""}" data-brand="${esc(brandName(brand))}">
      <img src="${(window.PHOTOS || new Set()).has(s) ? "photos/" + window.PHOTOS_EXT[s] : `assets/boites/${s}.png`}" alt="Boîte ${esc(brandName(brand))}" onerror="this.onerror=null;this.outerHTML=this.dataset.svg" data-svg="${esc(inline)}">
    </div>`;
  }
  window.BOITES = { svg, html, slug, brandName, famColor };
})();
