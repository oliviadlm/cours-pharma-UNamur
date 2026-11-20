# Monde « L'officine » : décor 4K vectoriel animé, ordonnances à préparer, balance, thème chaud.
import re
V = '4'

ANIM = r'''<svg class="anim" viewBox="0 0 3840 2160" preserveAspectRatio="none" aria-hidden="true">
<defs><clipPath id="cFen"><rect x="1480" y="230" width="560" height="640"/></clipPath><clipPath id="cBal"><circle cx="2600" cy="1010" r="102"/></clipPath>
<radialGradient id="aLampe" cx=".5" cy="0" r=".9"><stop offset="0" stop-color="#fff0bd" stop-opacity=".7"/><stop offset="1" stop-color="#fff0bd" stop-opacity="0"/></radialGradient></defs>
<g clip-path="url(#cFen)"><g class="a-nuages"><ellipse cx="1560" cy="330" rx="110" ry="34" fill="#fff" opacity=".85"/><ellipse cx="1620" cy="312" rx="70" ry="30" fill="#fff" opacity=".85"/><ellipse cx="1900" cy="420" rx="130" ry="36" fill="#fff" opacity=".75"/><ellipse cx="2220" cy="350" rx="110" ry="32" fill="#fff" opacity=".8"/></g>
<path class="a-oiseau" d="M1500 380 q14 -12 28 0 q14 -12 28 0" stroke="#5b4a52" stroke-width="5" fill="none"/></g>
<polygon class="a-lampe" points="1090,960 1350,960 1520,1310 900,1310" fill="url(#aLampe)"/>
<line class="a-trotteuse" x1="2430" y1="345" x2="2430" y2="248" stroke="#d9573f" stroke-width="5" stroke-linecap="round"/><circle cx="2430" cy="330" r="10" fill="#d9573f"/>
<g clip-path="url(#cBal)"><circle class="a-bulle" cx="2560" cy="1100" r="10" fill="#fff" opacity=".7"/><circle class="a-bulle b2" cx="2610" cy="1100" r="7" fill="#fff" opacity=".7"/><circle class="a-bulle b3" cx="2650" cy="1100" r="12" fill="#fff" opacity=".6"/><circle class="a-bulle b4" cx="2585" cy="1100" r="6" fill="#fff" opacity=".7"/><circle class="a-bulle b5" cx="2635" cy="1100" r="8" fill="#fff" opacity=".7"/></g>
<path class="a-flamme" d="M2600 1132 q-22 -34 0 -74 q22 40 0 74z" fill="#5aa9ff" opacity=".9"/><path class="a-flamme f2" d="M2600 1130 q-10 -20 0 -42 q10 22 0 42z" fill="#d6f0ff"/>
<g class="a-vapeur"><path d="M2900 1110 q-30 -60 0 -120 q30 -60 0 -120" stroke="#fff" stroke-width="16" fill="none" stroke-linecap="round"/></g>
<g class="a-vapeur v2"><path d="M2970 1110 q30 -60 0 -120 q-30 -60 0 -120" stroke="#fff" stroke-width="14" fill="none" stroke-linecap="round"/></g>
<g class="a-vapeur v3"><path d="M3040 1110 q-26 -50 0 -100 q26 -50 0 -100" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round"/></g>
<g class="a-vapeur v4"><path d="M2700 600 q-20 -40 0 -80 q20 -40 0 -80" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round"/></g>
<rect x="518" y="1062" width="324" height="66" fill="#2a4e52"/>
<text id="ecranOrdo" x="536" y="1104" font-family="'Courier New',monospace" font-size="28" font-weight="700" fill="#bff0d8">3 à préparer</text><rect class="a-curseur" x="800" y="1080" width="16" height="30" fill="#bff0d8"/>
<circle class="a-led" cx="112" cy="1116" r="12" fill="#ff5a3c"/>
<circle class="a-led2" cx="1458" cy="1240" r="7" fill="#9ff0c8"/>
</svg>'''

CSS = r'''
/* ===== monde : l'officine ===== */
.salon .piece img.decor,.piece img.decor{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none;user-select:none;-webkit-user-select:none}
.piece .anim{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.anim *{transform-box:view-box}
.a-nuages{animation:nuages 60s linear infinite}
@keyframes nuages{from{transform:translateX(-200px)}to{transform:translateX(420px)}}
.a-oiseau{animation:oiseau 18s linear infinite}
@keyframes oiseau{0%{transform:translate(-80px,40px)}100%{transform:translate(640px,-60px)}}
.a-lampe{animation:lampe 6s ease-in-out infinite;mix-blend-mode:screen}
@keyframes lampe{0%,100%{opacity:.75}50%{opacity:1}}
.a-trotteuse{transform-origin:2430px 330px;animation:tourne 60s steps(60) infinite}
@keyframes tourne{to{transform:rotate(360deg)}}
.a-bulle{animation:bulle 2.6s ease-in infinite}.a-bulle.b2{animation-delay:-.6s}.a-bulle.b3{animation-delay:-1.3s;animation-duration:3.1s}.a-bulle.b4{animation-delay:-1.9s}.a-bulle.b5{animation-delay:-2.3s;animation-duration:2.2s}
@keyframes bulle{0%{transform:translateY(0);opacity:0}15%{opacity:.8}100%{transform:translateY(-190px);opacity:0}}
.a-flamme{transform-origin:2600px 1132px;animation:flamme .35s ease-in-out infinite alternate}.a-flamme.f2{animation-duration:.27s}
@keyframes flamme{from{transform:scale(1,1)}to{transform:scale(.88,1.14)}}
.a-vapeur{opacity:0;animation:vapeur 5s ease-out infinite}.a-vapeur.v2{animation-delay:-1.6s}.a-vapeur.v3{animation-delay:-3.2s}.a-vapeur.v4{animation-delay:-2.4s;animation-duration:4s}
@keyframes vapeur{0%{opacity:0;transform:translateY(30px) scaleY(.6)}25%{opacity:.55}100%{opacity:0;transform:translateY(-140px) scaleY(1.2)}}
.a-curseur,.a-led2{animation:clign 1.1s steps(1) infinite}.a-led{animation:clign 1.6s steps(1) infinite}
@keyframes clign{50%{opacity:0}}
body.figer .anim *,body.figer .anim{animation-play-state:paused!important}
.fgp{position:absolute;bottom:-40px;width:34%;max-width:420px;opacity:.75;pointer-events:none}
.fgp.g{left:-40px}.fgp.d{right:-50px;width:30%}
/* bulles au lieu des lucioles */
.ciel i{width:10px;height:10px;border-radius:50%;background:none;border:2px solid rgba(255,255,255,.28);box-shadow:none;animation:monteBulle 12s linear infinite;opacity:0}
@keyframes monteBulle{0%{transform:translateY(40px);opacity:0}15%{opacity:.7}100%{transform:translateY(-60vh);opacity:0}}
/* étagère de flacons (progression) */
.guir .etag{fill:#7d4a2a}.guir .fl{fill:rgba(255,255,255,.14);stroke:rgba(255,255,255,.45);stroke-width:.8}.guir .liq{fill:none}
.guir .fl.on{stroke:#fff}.guir .liq.on{fill:var(--c)}
/* ordonnances dans le monde */
.ordos{position:absolute;transform:translate(-50%,-50%) scale(var(--iz,1));transform-origin:50% 50%;display:flex;flex-direction:column-reverse;align-items:center;gap:6px;z-index:3;background:none;border:0;padding:0;color:#fff}
.ordos .halo-o{width:96px;height:96px;border-radius:26px;border:4px solid #fff;box-shadow:0 0 0 0 rgba(255,240,190,.9);animation:halo-o 1.8s ease-out infinite;background:rgba(255,255,255,.12)}
@keyframes halo-o{0%{box-shadow:0 0 0 0 rgba(255,240,190,.85)}100%{box-shadow:0 0 0 34px rgba(255,240,190,0)}}
.ordos .t{background:#1f3a8a;color:#fff;font-weight:800;font-size:14px;padding:7px 11px;border-radius:999px;box-shadow:0 6px 16px rgba(0,0,0,.35);white-space:nowrap;display:flex;gap:6px;align-items:center}
.ordos .t em{font-style:normal;background:#ff5a3c;border-radius:999px;padding:1px 8px}
.ordos.fini .halo-o{animation:none;opacity:.5}
.salon.loin .ordos .t span{display:none}
/* l'ordonnance tenue en main */
@font-face{font-family:Caveat;src:url(fonts/caveat-700.woff2) format("woff2");font-weight:700;font-display:swap}
.papier{position:relative;background:#fffdf7;border-radius:6px;box-shadow:0 18px 40px rgba(0,0,0,.35);margin:4px 10px 34px;transform:rotate(-1.2deg);overflow:visible;text-align:left;color:#1f3a8a}
.papier .ent{background:#e4efec;border-radius:6px 6px 0 0;padding:10px 14px}
.papier .ent b{display:block;color:#2b6f6c;font-size:16px}.papier .ent small{color:#5d7a76;font-size:12px}
.papier .pat{font:700 22px/1.2 Caveat,cursive;padding:10px 16px 0}
.papier .rp{font:700 26px/1.25 Caveat,cursive;white-space:pre-wrap;padding:4px 16px 8px 20px}
.papier .rp:first-line{font-size:30px}
.papier .bas{display:flex;justify-content:space-between;align-items:flex-end;padding:0 16px 12px;font:700 18px Caveat,cursive;color:#5d7a76}
.papier .sig{width:110px;height:34px}
.papier .pouce{position:absolute;bottom:-30px;width:46px;height:54px;pointer-events:none}
.papier .pouce.g{left:-16px;transform:rotate(18deg)}.papier .pouce.d{right:-16px;transform:scaleX(-1) rotate(18deg)}
.tampon{position:absolute;right:18px;top:64px;border:4px solid #c62f2f;color:#c62f2f;font:900 22px/1 system-ui;letter-spacing:.08em;padding:8px 12px;border-radius:8px;transform:rotate(-14deg) scale(2.4);opacity:0;transition:transform .35s cubic-bezier(.2,1.6,.4,1),opacity .2s}
.tampon.on{transform:rotate(-14deg) scale(1);opacity:.9}
.prep-t{font-weight:800;font-size:15px;margin:6px 2px 8px;display:flex;align-items:center;gap:8px;color:var(--encre)}
.balance{margin-top:10px;background:#2f343c;border-radius:18px;padding:14px;color:#fff;text-align:center}
.balance .vitre{background:linear-gradient(90deg,rgba(255,255,255,.18),rgba(255,255,255,.05),rgba(255,255,255,.16));border:2px solid rgba(220,235,240,.5);border-radius:12px;height:110px;position:relative;margin-bottom:10px;overflow:hidden}
.balance .plat{position:absolute;left:50%;bottom:14px;width:150px;height:14px;margin-left:-75px;border-radius:50%;background:#aab3bd}
.balance .tas{position:absolute;left:50%;bottom:22px;margin-left:-40px;width:80px;height:0;background:#fff;border-radius:50% 50% 0 0;transition:height .2s}
.balance .ecran{font:700 30px/1 'Courier New',monospace;background:#16231f;color:#9ff0c8;border-radius:10px;padding:12px;letter-spacing:.04em}
.balance .cible{font-size:13px;opacity:.8;margin:8px 0}
.balance .spat{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}
.balance .spat button{background:#4b525d;color:#fff;border:0;border-radius:10px;padding:10px 0;font-weight:800;font-size:14px}
.balance .spat button.moins{background:#5d4a4a}
.balance .peser{margin-top:10px;width:100%;background:#2f8a84;color:#fff;border:0;border-radius:12px;padding:12px;font-weight:800;font-size:16px}
'''

def patch_head(head):
    head = head.replace('decor/monde.jpg?v=1', 'decor/monde-1920.jpg?v=' + V)
    # thème : de la nuit bleue à l'officine chaude
    for a, b in [('#110f3d', '#1e1613'), ('rgba(17,15,61', 'rgba(30,22,19'), ('rgba(5,4,30', 'rgba(12,8,6'), ('#2c3192', '#5a3a2a'), ('#1b1960', '#2e211b'),
                 ('rgba(20,20,60', 'rgba(30,22,19'), ('rgba(20,18,70', 'rgba(30,22,19'), ('rgba(8,6,36', 'rgba(12,8,6'), ('#4a55d8', '#2f8a84'), ('#6d7cff', '#4fb3a9'),
                 ('#3b44b8', '#226b66'), ('rgba(109,124,255', 'rgba(79,179,169'), ('rgba(176,108,255', 'rgba(233,135,75'), ('--bleu:#3b5ff0', '--bleu:#2f8a84'), ('--bleu2:#1a3fd6', '--bleu2:#226b66'), ('#1a3fd6', '#226b66')]:
        head = head.replace(a, b)
    i = head.rfind('</style>')
    return head[:i] + CSS + head[i:]

def patch_engine(e, rep):
    # images au lieu de vidéos (décor vectoriel rendu en 4K)
    e = re.sub(r'<video class="hero-v"[^>]*><source[^>]*></video>', lambda m: '<img class="hero-v" src="decor/monde-1920.jpg?v=' + V + '" alt="" style="object-position:\'+heroX()+\'% 62%">', e)
    e = re.sub(r'<div class="piece" id="piece"><video[^>]*><source[^>]*></video>', lambda m: '<div class="piece" id="piece"><img class="decor" src="decor/monde.jpg?v=' + V + '" alt="">' + ANIM.replace("'", "\\'").replace('\n', '') , e)
    e = re.sub(r'<video class="fete-bg"[^>]*><source[^>]*></video>', lambda m: '<img class="fete-bg" src="decor/monde-1920.jpg?v=' + V + '" alt="">', e)
    assert 'monde.mp4' not in e, 'vidéo restante'
    e = rep(e, "function entete(mini){", "function heroX(){var s=SPOTS[VUE==='chap'?CI:chapActuel()]||[50];return Math.round(s[0])}\nfunction entete(mini){")
    # lecture / pause : fige aussi les animations du décor
    e = rep(e, "function lecture(){", "function lecture(){document.body.classList.toggle('figer',!!S.pause);")
    # premier plan : accessoires flous au lieu des lucioles
    e = rep(e, " for(var i=0;i<16;i++){var r=10+Math.random()*26;fg+='<i style=\"left:'+(Math.random()*100).toFixed(1)+'%;top:'+(Math.random()*100).toFixed(1)+'%;width:'+r.toFixed(0)+'px;height:'+r.toFixed(0)+'px;animation-delay:'+(-Math.random()*7).toFixed(1)+'s\"></i>'}",
           " fg='<img class=\"fgp g\" src=\"decor/fg-gauche.png?v=" + V + "\" alt=\"\"><img class=\"fgp d\" src=\"decor/fg-droite.png?v=" + V + "\" alt=\"\">';")
    e = rep(e, "var IW=2048, IH=1080,", "var IW=3840, IH=2160,")
    e = e.replace("Glisse dans tous les sens, pince pour voir toute la pièce", "Glisse dans tous les sens, pince pour voir toute l\\'officine")
    # étagère de flacons au lieu de la guirlande
    old = e[e.find('function guirlande(n,lit){'):e.find('function lucioles(){')]
    e = rep(e, old, r'''function guirlande(n,lit){
 var COL=['#7cc9a0','#f2c45a','#5c7fb8','#e9874b','#8a6fb3','#f2a7a0'],o='<svg class="guir" viewBox="0 0 400 44" preserveAspectRatio="none" aria-hidden="true"><rect class="etag" x="0" y="39" width="400" height="5" rx="2"/>',w=400/n;
 for(var i=0;i<n;i++){var x=(i+.5)*w,on=i<lit,c=COL[i%COL.length],s=Math.min(1,w/12);
  o+='<g transform="translate('+x.toFixed(1)+' 39) scale('+s.toFixed(2)+')"><path class="liq'+(on?' on':'')+'" style="--c:'+c+'" d="M-5.2 -6 h10.4 l3 6 h-16.4z"/><path class="fl'+(on?' on':'')+'" d="M-2 -20 h4 v6 l6.5 14 h-17 l6.5 -14z"/></g>'}
 return o+'</svg>'}
''')
    e = e.replace("lumières allumées · chaque notion maîtrisée en allume une", "flacons remplis · chaque notion maîtrisée en remplit un")
    e = e.replace("'<div class=\"lum\">'+ic('bulb')", "'<div class=\"lum\">'+ic('flask')")
    # lieux des chapitres sur le décor
    old = e[e.find('var SPOTS=['):e.find('];', e.find('var SPOTS=['))+2]
    e = rep(e, old, "var SPOTS=[[26,60,'le bureau'],[52,60,'la paillasse'],[75,60,'le bain-marie'],[85,82,'le moule à suppositoires'],[58,87,'le plateau de gélules'],[42,80,'la nacelle de pesée']];")
    # ordonnances posées sur le bureau : un objet du monde qu'on touche
    e = rep(e, " $('#lieux').innerHTML=h;", r''' var ro=ordoRestantes(),po=[0.15*PW,0.70*PH];
 h+='<button class="ordos'+(ro?'':' fini')+'" id="ordos" style="left:'+po[0].toFixed(0)+'px;top:'+po[1].toFixed(0)+'px"><span class="halo-o"></span><span class="t">'+ic('book')+'<span>Ordonnances</span>'+(ro?'<em>'+ro+'</em>':ic('check'))+'</span></button>';
 $('#lieux').innerHTML=h;
 var eo=document.getElementById('ecranOrdo');if(eo)eo.textContent=ro?ro+' à préparer':'tout est délivré';
 $('#ordos').onclick=function(){son('clic');MODES.ordonnances()};''')
    e = e.replace(".hero-haut,.salon-bas,.borne'", ".hero-haut,.salon-bas,.borne,.ordos'")
    # accueil : bouton « Ordonnances du jour »
    e = rep(e, "h+='<div class=\"modes\" style=\"margin-top:12px\"><button class=\"mode vedette\" data-m=\"revision\">'",
           "h+='<div class=\"modes\" style=\"margin-top:12px\"><button class=\"mode vedette\" data-m=\"ordonnances\">'+ic('book')+'<b>Ordonnances du jour ('+ordoRestantes()+' / '+ORDO_J+')</b><small>Lis l\\'ordonnance, calcule, pèse sur la balance, tamponne : comme au préparatoire.</small></button><button class=\"mode vedette\" data-m=\"revision\">'")
    e = rep(e, "var BADGES=[", "var BADGES=[['ordo10','10 ordonnances délivrées','book'],")
    return e

ORDO_JS = r'''
/* ---------- ordonnances à préparer (mini-jeu du monde) ---------- */
var ORDO_J=4, MEDECINS=['Dr M. Laurent','Dr S. Moreau','Dr A. Lambert','Dr C. Dupont','Dr N. Renard','Dr L. Petit'],
 PATIENTS=['Mme Dubois','M. Martin','Léo, 6 ans','Mme Lefèvre','M. Bernard','Inès, 9 ans','Mme Claes','M. Peeters','Mme Diallo','M. Janssens'];
function ordoJour(){if(!S.ordoJ||S.ordoJ.d!==dayNum())S.ordoJ={d:dayNum(),n:0};return S.ordoJ}
function ordoRestantes(){return Math.max(0,ORDO_J-ordoJour().n)}
function enG(v,u){u=(u||'').trim();if(u==='g')return v;if(u==='mg')return v/1000;if(u==='µg')return v/1e6;return null}
function qOrdo(src){var x=qWorked(src[0],src[1]);x.ordo=1;x.type=['book','Ordonnance'];x.med=pick(MEDECINS,1)[0];x.pat=pick(PATIENTS,1)[0];return x}
MODES.ordonnances=function(){var srcs=[];CHAPS.forEach(function(c,ci){if(chapOuvert(ci))c.niveaux.forEach(function(L){(L.w||[]).forEach(function(w){if(L.type==='n')srcs.push(w)})})});
 if(!srcs.length){toast(ic('lock')+' Ouvre un chapitre pour recevoir des ordonnances');return}
 var d=dayNum();srcs.sort(function(a,b){return boxOf('w:'+a[0]+':'+a[1]).d-boxOf('w:'+b[0]+':'+b[1]).d});
 var n=Math.max(1,ordoRestantes())||2, it=mel(srcs.slice(0,Math.max(n+2,4))).slice(0,ordoRestantes()||3).map(qOrdo);
 lancer({items:it,nom:'Ordonnances du jour',mode:'ordo',coeurs:99})};
function papierHTML(x){var dt=new Date(),date=('0'+dt.getDate()).slice(-2)+'/'+('0'+(dt.getMonth()+1)).slice(-2)+'/'+dt.getFullYear();
 var pouce='<svg class="pouce g" viewBox="0 0 74 86"><path d="M20 86 C6 60 4 34 18 14 C26 2 44 2 50 14 C56 26 52 44 56 58 C60 72 64 80 66 86z" fill="#e9b892"/><path d="M24 22 C30 12 42 12 46 22 C48 30 40 36 34 34 C28 32 22 30 24 22z" fill="#f6d2b6"/></svg>';
 return '<div class="papier"><div class="ent"><b>'+esc(x.med)+'</b><small>Médecin généraliste · Namur</small></div><div class="pat">Pour : '+esc(x.pat)+'</div><div class="rp">'+esc(x.ctx||'')+'</div><div class="bas"><span>Le '+date+'</span><svg class="sig" viewBox="0 0 110 34"><path d="M4 26 q12 -26 26 0 t26 -4 t24 -8 q-10 14 26 4" stroke="#1f3a8a" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg></div><div class="tampon" id="tampon">PRÉPARÉ</div>'+pouce+pouce.replace('pouce g','pouce d')+'</div>'}
function balanceHTML(cible){return '<div class="balance" id="bal"><div class="vitre"><div class="tas" id="tas"></div><div class="plat"></div></div><div class="ecran" id="lect">0,000 g</div><div class="cible">Pèse exactement ce que tu as calculé, avec les spatules</div><div class="spat">'+
 [['1','1 g'],['0.1','0,1 g'],['0.01','0,01 g'],['0.001','0,001 g'],['-1','− 1 g'],['-0.1','− 0,1'],['-0.01','− 0,01'],['-0.001','− 0,001']].map(function(b){return '<button data-p="'+b[0]+'"'+(b[0][0]==='-'?' class="moins"':'')+'>'+b[1]+'</button>'}).join('')+'</div><button class="peser" id="peser">Valider la pesée</button></div>'}
function balance(x,cible,fin){var m=0,lect=$('#lect'),tas=$('#tas');
 function maj(){lect.textContent=FMT(Math.round(m*1000)/1000).replace(/^(-?\d+)$/,'$1,000').replace(/,(\d)$/,',$100').replace(/,(\d\d)$/,',$10')+' g';tas.style.height=Math.min(60,Math.sqrt(Math.max(0,m)/Math.max(cible,.001))*40)+'px'}
 $$('#bal .spat button').forEach(function(b){b.onclick=function(){m=Math.max(0,Math.round((m+parseFloat(b.dataset.p))*1000)/1000);son('clic');vib(8);maj()}});
 $('#peser').onclick=function(){var ok=Math.abs(m-cible)<=Math.max(0.0005,cible*0.003)+1e-9;son(ok?'bien':'mal');$('#peser').disabled=true;$$('#bal .spat button').forEach(function(b){b.disabled=true});
  if(!ok)lect.textContent=lect.textContent+'  → '+FMT(cible)+' g';fin(ok)};maj()}
function ordoFin(x,bon){S.total++;if(x.id)noter(x.id,bon);if(bon)bien(x);else mal(x,'Ordonnance ('+(x.wt||'')+') à revoir');
 var j=ordoJour();j.n++;S.ordoTot=(S.ordoTot||0)+1;if(S.ordoTot>=10)badge('ordo10');
 var t=$('#tampon');if(t){t.textContent=bon?'PRÉPARÉ':'À REVOIR';t.style.borderColor=t.style.color=bon?'#1f8a4c':'#c62f2f';setTimeout(function(){t.classList.add('on');son(bon?'coffre':'mal');vib(bon?[20,40,20]:30)},150)}
 var fb=$('#fb');fb.className='fb on '+(bon?'ok':'ko');fb.innerHTML='<b>'+ic(bon?'check':'x')+(bon?'Préparation conforme : ordonnance délivrée !':'Préparation à revoir : relis les étapes en rouge')+'</b>'+(ordoRestantes()?ordoRestantes()+' ordonnance'+(ordoRestantes()>1?'s':'')+' encore à préparer aujourd\'hui.':'Toutes les ordonnances du jour sont délivrées.');save();$('#suite').classList.add('on')}
'''

def patch_ordo(e, rep):
    e = rep(e, "var MODES={", ORDO_JS.replace('MODES.ordonnances=function', 'var __ordoDef=function') + "\nvar MODES={")
    e = rep(e, "/* ---------- partie ---------- */", "/* ---------- partie ---------- */")
    # après la définition de MODES, brancher le mode ordonnances
    e = rep(e, "function hud(){", "MODES.ordonnances=__ordoDef;\nfunction hud(){")
    # rendu : la feuille d'ordonnance remplace le cadre « ordonnance » simple
    e = rep(e, " if(x.ctx) h+='<div class=\"ordo\">'+esc(x.ctx)+'</div>';", " if(x.ordo) h+=papierHTML(x)+'<div class=\"prep-t\">'+ic('flask')+' Fiche de préparation</div>'; else if(x.ctx) h+='<div class=\"ordo\">'+esc(x.ctx)+'</div>';")
    e = rep(e, " if(x.grand) h+='<div class=\"grand\">'+esc(x.grand)+'</div>';\n if(x.ordo)", " if(x.grand&&!x.ordo) h+='<div class=\"grand\">'+esc(x.grand)+'</div>';\n if(x.ordo)")
    # fin du problème guidé : pesée sur la balance pour les ordonnances
    e = rep(e, "  var bon=err===0;S.total++;", "  if(x.ordo){var last=x.steps[x.steps.length-1],cg=enG(last.ans,last.unit),e0=err;var finO=function(okP){ordoFin(x,e0===0&&okP!==false)};if(cg!=null&&cg>0&&cg<200){var bz=document.createElement('div');bz.innerHTML=balanceHTML(cg);$('#multi').appendChild(bz.firstChild);setTimeout(function(){$('#bal').scrollIntoView({block:'center',behavior:'smooth'})},120);balance(x,cg,finO)}else finO(true);return}\n  var bon=err===0;S.total++;")
    return e
