# Niveau libre « L'étagère des excipients » (clin d'œil au cours de galénique, chapitre 9)
# + bascule jour / nuit de l'officine (l'ampoule).
import json

X = json.load(open('/home/claude/jeu287/exc.json'))
FAM = [('liq', 'Liquides et conservation'), ('ta', 'Tensio-actifs'), ('phys', 'Propriétés physiques'), ('solides', 'Formes solides')]
COL = {'Solvant': '#a9d8ea', 'Conservateur': '#f6c1b8', 'Antioxydant': '#f2d58a', 'Tensio-actif': '#c9b7ea', 'Isotonisant': '#bfe6d0', 'Viscosifiant': '#e9d3b4',
       'Gélifiant': '#d8e8a8', 'Ajusteur de pH': '#f5b7cf', 'Humectant': '#b8d4f0', 'Modificateur de consistance': '#efe1c4', 'Lubrifiant': '#d9d9d9', 'Liant': '#f3e3a6',
       'Diluant': '#f7f3ea', 'Désintégrant': '#e8c99a', 'Enrobage': '#b9e0dc', 'Agent neutralisant': '#d2c6b8', 'Plastifiant': '#e7c3e0', 'Édulcorant': '#fbd3a8',
       'Colorant': '#f08a7a', 'Gaz propulseur': '#cfe3f3'}
# ce que le pharmacien te demande d'aller chercher (rédigé d'après le cours)
REQ = [
 ("Il me faut le conservateur le plus fréquent des injectables.", ['x6']),
 ("Passe-moi le conservateur de premier choix en dermatologie.", ['x7']),
 ("Le conservateur de référence des collyres, s'il te plaît.", ['x5']),
 ("Un conservateur pour une pommade ophtalmique.", ['x13']),
 ("L'isotonisant de référence des collyres.", ['x29']),
 ("Un isotonisant pour un collyre qui contient un sel d'argent.", ['x30']),
 ("Le lubrifiant de référence des comprimés et des gélules.", ['x49']),
 ("Le diluant de référence des comprimés.", ['x55']),
 ("Un liant pour la compression directe.", ['x53']),
 ("Il me faut un super désintégrant.", ['x59']),
 ("Un enrobage insoluble pour une forme à action prolongée.", ['x60']),
 ("Un enrobage entérique, qui résiste à l'estomac.", ['x61']),
 ("Un antioxydant pour la phase huileuse d'une émulsion.", ['x26']),
 ("Un antioxydant pour un injectable.", ['x27', 'x28']),
 ("Un gélifiant qui donne un oléogel thixotrope.", ['x40']),
 ("De quoi diminuer la consistance d'une pommade.", ['x48']),
 ("Un tensio-actif amphotère pour les lipides parentéraux.", ['x20']),
 ("Un tensio-actif non ionique de type E/H.", ['x21']),
 ("Le tensio-actif fait de sorbitane, d'acide gras et de PEG.", ['x22']),
 ("Un tensio-actif anionique qui sert aussi de mouillant.", ['x16']),
 ("Un ajusteur de pH pour collyre, mais jamais pour un injectable.", ['x43', 'x32']),
 ("Un ajusteur de pH pour injectable.", ['x44']),
 ("Un plastifiant pour gélules.", ['x64']),
 ("Un agent neutralisant pour un gel de carbomère.", ['x63']),
 ("Un viscosifiant pour collyre.", ['x34', 'x35', 'x36', 'x37']),
 ("Un viscosifiant pour pommade hydrophile.", ['x39', 'x34']),
 ("Un diluant qui est aussi édulcorant et rafraîchissant.", ['x56']),
 ("Un solvant, mais surtout pas de l'eau pour préparation injectable.", ['x0']),
 ("Un humectant.", ['x46', 'x4', 'x3']),
 ("Un agent d'écoulement.", ['x52', 'x50']),
]
OPEN_MC = [
 "Obligatoires: multidoses | Injectables: alcool benzylique (le plus fréquent) · pas de parabens | Dermatologie: acide sorbique (1er choix) · glycérine · éthanol · parabens | Collyres: chlorure de benzalkonium · cétylpyridinium · benzéthonium · chlorhexidine · chlorocrésol peu utilisé (irritant) | Interdits: phénylmercure (merphène) · thiomersal",
 "Diluants: lactose · mannitol · cellulose microcristalline | Liants: Avicel en compression directe · PVP, gélatine, gommes en granulation humide | Désintégrants: amidon · crospovidone · carboxyméthylamidon | Lubrifiants: stéarate de magnésium · talc · PEG | Écoulement: silice colloïdale · talc | Enrobages: cellulosiques · entériques (acétophtalate, HPMCP) · prolongés (éthylcellulose) | Divers: édulcorants · colorants E100-199",
]
quiz, ouvertes = [], []
for i, q in enumerate(X['quiz']):
    if q.get('o'): quiz.append({'id': 'gq' + str(i), 'q': q['q'], 'o': q['o'], 'a': q['a'], 'x': q.get('ex', '')})
    else: ouvertes.append({'id': 'go' + str(i), 'q': q['q'], 'r': q.get('a') if isinstance(q.get('a'), str) else q.get('r', ''), 'mc': OPEN_MC[len(ouvertes)]})
EXC = {'ex': X['ex'], 'req': [{'t': t, 'ok': ok} for t, ok in REQ], 'quiz': quiz, 'open': ouvertes, 'fam': FAM, 'col': COL,
       'flash': [{'q': c['front'], 'r': c['back']} for c in X['q']]}

CSS = r'''
/* ===== étagère des excipients ===== */
.etag-hot{position:absolute;transform:translate(-50%,-50%) scale(var(--iz,1));z-index:3;background:none;border:0;padding:0;display:flex;flex-direction:column;align-items:center;gap:6px}
.etag-hot .t{background:#7d4a2a;color:#fff;font-weight:800;font-size:14px;padding:7px 11px;border-radius:999px;box-shadow:0 6px 16px rgba(0,0,0,.35);display:flex;gap:6px;align-items:center;white-space:nowrap}
.etag-hot .t em{font-style:normal;background:#f2c45a;color:#3a2410;border-radius:999px;padding:1px 7px;font-size:12px}
.etag-hot .halo-o{width:90px;height:90px;border-radius:50%;border:3px dashed rgba(255,255,255,.85);animation:tourne 18s linear infinite}
.salon.loin .etag-hot .t span{display:none}
#etag{position:fixed;inset:0;z-index:25;display:none;flex-direction:column;background:linear-gradient(180deg,#efd9bf,#e2c29e);color:#2f2433}
#etag.on{display:flex}
#etag .et-haut{padding:calc(env(safe-area-inset-top) + 10px) 14px 10px;background:linear-gradient(180deg,#5b3a24,#4a2e1c);color:#fff;box-shadow:0 6px 18px rgba(0,0,0,.25);z-index:2}
#etag .et-l1{display:flex;align-items:center;gap:10px}
#etag .et-l1 b{font-size:1.15rem;display:block}#etag .et-l1 small{opacity:.8;font-size:.78rem}
#etag .et-modes{display:flex;gap:8px;margin-top:10px;overflow-x:auto;padding-bottom:2px}
#etag .et-modes button{flex:0 0 auto;border:0;border-radius:999px;padding:9px 13px;font-weight:800;font-size:14px;background:rgba(255,255,255,.14);color:#fff;display:flex;gap:6px;align-items:center}
#etag .et-modes button.on{background:#f2c45a;color:#3a2410}
#etag .et-prog{margin-top:8px;height:6px;border-radius:6px;background:rgba(255,255,255,.18);overflow:hidden}#etag .et-prog i{display:block;height:100%;background:#9fe0b8}
#etag .et-demande{display:none;margin:10px 12px 0;background:#fffdf6;border-radius:14px;padding:12px 14px;box-shadow:0 8px 20px rgba(0,0,0,.18);font-weight:700;border-left:5px solid #2f8a84}
#etag .et-demande.on{display:block}#etag .et-demande small{display:block;font-weight:600;color:#6b6070;margin-bottom:3px}
#etag .et-corps{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:6px 0 calc(env(safe-area-inset-bottom) + 30px)}
#etag .meuble{margin:14px 10px 6px;background:linear-gradient(90deg,#7a4a2a,#8c5a36 8%,#7a4a2a 92%,#6b3f22);border-radius:12px;padding:8px 8px 4px;box-shadow:0 10px 24px rgba(0,0,0,.25)}
#etag .meuble h3{margin:2px 6px 8px;color:#fbe7c8;font-size:.85rem;text-transform:uppercase;letter-spacing:.08em}
#etag .rayon{background:#efe2cf;border-radius:8px;margin-bottom:10px;padding:6px 0 8px;position:relative;overflow:hidden}
#etag .plaque{position:relative;z-index:1;display:inline-block;font-size:.72rem;font-weight:800;color:#5b3a24;background:#fff8ec;border:1px solid #d9c3a3;border-radius:6px;padding:2px 8px;margin:0 0 4px 8px}
#etag .pots{display:flex;gap:0;overflow-x:auto;padding:0;align-items:flex-start;background:linear-gradient(180deg,#efe2cf 0,#efe2cf 98.5px,#c58a58 98.5px,#c58a58 118px,#b97c49 118px,#7d4a2a 130px,rgba(0,0,0,0) 130px);background-attachment:local;-webkit-overflow-scrolling:touch}
#etag .pots::after{content:"";flex:1 0 0;min-width:0;height:130px;background:linear-gradient(180deg,#efe2cf 0,#efe2cf 98.5px,#c58a58 98.5px,#c58a58 118px,#b97c49 118px,#7d4a2a 130px,rgba(0,0,0,0) 130px)}
#etag .pot{flex:0 0 auto;width:92px;background:linear-gradient(180deg,#efe2cf 0,#efe2cf 98.5px,#c58a58 98.5px,#c58a58 118px,#b97c49 118px,#7d4a2a 130px,rgba(0,0,0,0) 130px);border:0;padding:0 0 2px;transition:transform .15s;color:inherit;font:inherit}
#etag .pot .pv{display:block;width:92px;height:118px;overflow:hidden}#etag .pot .pv img{display:block;width:92px;height:118px}
#etag .pot .tag{display:block;margin:15px 5px 0;padding:3px 2px;background:#fffaf0;border:1px solid #d9c7a8;border-radius:4px;font:700 9px/1.18 -apple-system,Helvetica,Arial,sans-serif;color:#2f2433;text-align:center;box-shadow:0 2px 3px rgba(0,0,0,.12);overflow-wrap:anywhere}
#etag .pot.ok{animation:sautPot .5s}#etag .pot.ko{animation:secoue .4s}#etag .pot.montre{outline:4px solid #2f8a84;outline-offset:-4px;border-radius:12px}
@keyframes sautPot{40%{transform:translateY(-14px) scale(1.06)}}@keyframes secoue{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
#etag .fiche{position:fixed;left:12px;right:12px;bottom:calc(env(safe-area-inset-bottom) + 12px);background:#fffdf6;border-radius:18px;padding:14px 16px;box-shadow:0 18px 40px rgba(0,0,0,.35);display:none;z-index:3}
#etag .fiche.on{display:block;animation:apparait .25s ease-out}
#etag .fiche .ff{display:flex;gap:12px;align-items:center}#etag .fiche .fimg{width:76px;height:98px;flex:0 0 auto;border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,.18)}
#etag .fiche b{font-size:1.05rem}#etag .fiche .cat{display:inline-block;margin:4px 0;font-weight:800;font-size:.8rem;padding:2px 9px;border-radius:999px;background:#e6f0ed;color:#226b66}
#etag .fiche p{margin:4px 0 0;font-size:.9rem;line-height:1.35}#etag .fiche p.vois{font-size:.8rem;color:#6b6070}
#etag .fiche .fb2{display:flex;gap:8px;margin-top:10px}#etag .fiche .fb2 button{flex:1;border:0;border-radius:12px;padding:11px;font-weight:800;color:#fff}
'''

JS = r'''
/* ---------- étagère des excipients (niveau libre, galénique ch. 9) ---------- */
var EXC=window.EXC, EXBY={}; EXC.ex.forEach(function(e){EXBY[e.id]=e});
function exM(id){return Math.min(boxOf('ex:'+id).b,3)/3}
function coupe(t,n){var m=t.split(' '),l='',o=[];m.forEach(function(w){if((l+' '+w).trim().length>n){if(l)o.push(l.trim());l=w}else l+=' '+w});if(l.trim())o.push(l.trim());return o}
var POTV='?v=3';
function potSrc(e,plein){return 'decor/pots/'+e.id+'-'+Math.max(0,Math.min(3,Math.round(plein*3)))+'.webp'+POTV}
function potHTML(e,plein){var L=coupe(e.n,13).slice(0,4);
 return '<span class="pv"><img src="'+potSrc(e,plein)+'" alt="" loading="lazy" decoding="async" width="92" height="118"></span><span class="tag">'+L.map(esc).join('<br>')+'</span>'}
function potImg(e){return potSrc(e,2/3)}
function exMaitrises(){return EXC.ex.filter(function(e){return exM(e.id)>=1}).length}
var ETQ=null;
function etagere(){var o=$('#etag');if(!o){o=document.createElement('div');o.id='etag';document.body.appendChild(o)}
 var h='<div class="et-haut"><div class="et-l1"><button class="rond-btn" id="et-ret" aria-label="Retour à l\'officine">'+ic('back')+'</button><div style="flex:1"><b>L\'étagère des excipients</b><small>Galénique · chapitre 9 · niveau libre · '+exMaitrises()+' / '+EXC.ex.length+' maîtrisés</small></div></div>'+
 '<div class="et-prog"><i style="width:'+Math.round(100*exMaitrises()/EXC.ex.length)+'%"></i></div>'+
 '<div class="et-modes"><button data-em="apprendre" class="on">'+ic('eye')+'Apprendre</button><button data-em="commande">'+ic('target')+'Commande</button><button data-em="ranger">'+ic('flask')+'Ranger</button><button data-em="quiz">'+ic('brain')+'Quiz</button></div></div>'+
 '<div class="et-demande" id="et-dem"></div><div class="et-corps" id="et-corps">';
 h+='</div><div class="fiche" id="et-fiche"></div>';
 o.innerHTML=h;o.classList.add('on');ETQ=null;etCorps(false);
 $('#et-ret').onclick=function(){son('clic');o.classList.remove('on');accueil()};
 $$('#etag .et-modes button').forEach(function(b){b.onclick=function(){son('clic');var m=b.dataset.em;
  if(m==='ranger'){o.classList.remove('on');etRanger();return}if(m==='quiz'){o.classList.remove('on');etQuiz();return}
  $$('#etag .et-modes button').forEach(function(x){x.classList.toggle('on',x===b)});if(m==='commande'){etCorps(true);etCommande()}else{ETQ=null;$('#et-dem').classList.remove('on');etCorps(false)}}});
}
function potBtn(e){return '<button class="pot" data-x="'+e.id+'" aria-label="'+esc(e.n)+'">'+potHTML(e,exM(e.id))+'</button>'}
/* rangé = pour apprendre (les rayons sont nommés) ; en désordre = pour se tester (aucun indice de famille) */
function etCorps(desordre){var h='',c=$('#et-corps');
 if(!desordre){EXC.fam.forEach(function(f){var cats=[];EXC.ex.forEach(function(e){if(e.fam===f[0]&&cats.indexOf(e.cat)<0)cats.push(e.cat)});
   h+='<div class="meuble"><h3>'+esc(f[1])+'</h3>';
   cats.forEach(function(k){h+='<div class="rayon"><span class="plaque">'+esc(k)+'</span><div class="pots">'+EXC.ex.filter(function(e){return e.fam===f[0]&&e.cat===k}).map(potBtn).join('')+'</div></div>'});
   h+='</div>'});
  h+='<p class="note" style="margin:6px 16px">Ici tout est rangé et nommé : c\'est pour apprendre. Touche un pot pour lire sa fiche. Le pot se remplit quand tu le reconnais sans aide, en Commande, Ranger ou Quiz.</p>'}
 else{var L=mel(EXC.ex.slice());h+='<div class="meuble"><h3>Réserve en désordre · aucun rayon n\'est nommé</h3>';
  for(var i=0;i<L.length;i+=6)h+='<div class="rayon"><div class="pots">'+L.slice(i,i+6).map(potBtn).join('')+'</div></div>';
  h+='</div><p class="note" style="margin:6px 16px">Tout a été mélangé : retrouve chaque produit grâce à ce que tu sais de lui.</p>'}
 c.innerHTML=h;c.scrollTop=0;
 $$('#etag .pot').forEach(function(b){b.onclick=function(){var e=EXBY[b.dataset.x];if(ETQ){etReponse(b,e);return}etFiche(e,b)}})}
function etMaj(b,e){b.innerHTML=potHTML(e,exM(e.id))}
function etFiche(e,b){var f=$('#et-fiche');son('clic');
 var voisins=EXC.ex.filter(function(x){return x.cat===e.cat&&x.id!==e.id}).map(function(x){return x.n});
 f.innerHTML='<div class="ff"><img class="fimg" src="'+potSrc(e,exM(e.id))+'" alt=""><div><b>'+esc(e.n)+'</b><br><span class="cat">'+esc(e.cat)+'</span>'+(e.d?'<p>'+esc(e.d)+'</p>':'')+
  (voisins.length?'<p class="vois">Même rayon : '+esc(voisins.slice(0,4).join(' · '))+(voisins.length>4?' …':'')+'</p>':'')+'</div></div>'+
  '<div class="fb2"><button style="background:#2f8a84" id="et-ok">Compris</button></div>';
 f.classList.add('on');$('#et-ok').onclick=function(){son('clic');f.classList.remove('on')}}
function etCommande(){var L=mel(EXC.req.slice()).slice(0,6);
 mel(EXC.ex.map(function(e){return e.cat}).filter(function(v,i,a){return a.indexOf(v)===i})).slice(0,2).forEach(function(c){L.push({t:'Apporte-moi un excipient de la famille « '+c+' ».',ok:EXC.ex.filter(function(e){return e.cat===c}).map(function(e){return e.id})})});
 ETQ={l:mel(L),i:0,ok:0,err:0};etQuestion()}
function etQuestion(){var d=$('#et-dem'),q=ETQ.l[ETQ.i];if(!q){var n=ETQ.ok;ETQ=null;d.innerHTML='<small>Commande terminée</small>'+n+' / 8 du premier coup · +'+(n*8)+' XP';son('fete');confetti();setTimeout(function(){d.classList.remove('on')},3500);save();return}
 d.innerHTML='<small>Commande '+(ETQ.i+1)+' / '+ETQ.l.length+' · le pharmacien te demande :</small>'+esc(q.t);d.classList.add('on');ETQ.essai=0}
function etReponse(b,e){var q=ETQ.l[ETQ.i];$$('#etag .pot.montre').forEach(function(x){x.classList.remove('montre')});
 if(q.ok.indexOf(e.id)>=0){b.classList.remove('ok');void b.offsetWidth;b.classList.add('ok');son('bien');vib(15);if(!ETQ.essai){ETQ.ok++;S.xp+=8;S.todayXp+=8;noter('ex:'+e.id,true)}etMaj(b,e);toast(ic('check')+' '+e.n+' · '+e.cat);ETQ.i++;save();setTimeout(etQuestion,700)}
 else{ETQ.essai++;b.classList.remove('ko');void b.offsetWidth;b.classList.add('ko');son('mal');vib([30,30]);toast(ic('x')+' '+e.n+' : '+e.cat);
  if(ETQ.essai>=2){var bon=$('#etag .pot[data-x="'+q.ok[0]+'"]');if(bon){bon.classList.add('montre');bon.scrollIntoView({block:'center',inline:'center',behavior:'smooth'})}noter('ex:'+q.ok[0],false);save()}}}
function etRanger(){var d=dayNum(),it=EXC.ex.slice().sort(function(a,b){return boxOf('ex:'+a.id).d-boxOf('ex:'+b.id).d||Math.random()-.5}).slice(0,10).map(function(e){
  var autres=EXC.ex.filter(function(x){return x.cat!==e.cat}),meme=autres.filter(function(x){return x.fam===e.fam}).map(function(x){return x.cat}),tous=autres.map(function(x){return x.cat}),ch=[];
  mel(meme).concat(mel(tous)).forEach(function(c){if(ch.length<3&&ch.indexOf(c)<0)ch.push(c)});
  return {id:'ex:'+e.id,kind:'qcm',type:['flask','Étagère des excipients'],img:potImg(e),grand:e.n,titre:'Sur quel rayon le ranges-tu ?',choix:mel([e.cat].concat(ch)),rep:e.cat,expl:e.n+' : '+e.cat+(e.d?' · '+e.d:'')}});
 lancer({items:mel(it),nom:'Ranger l\'étagère',mode:'etagere',coeurs:99})}
function etQuiz(){var it=EXC.quiz.map(function(q){return {id:'ex:'+q.id,kind:'qcm',type:['brain','Excipients · galénique'],titre:q.q,choix:mel(q.o.slice()),rep:q.o[q.a],expl:q.x}});
 it=mel(it).slice(0,8);EXC.open.forEach(function(k){it.push({id:'ex:'+k.id,kind:'carte',type:['mic','Question d\'examen · galénique'],titre:k.q,rep:k.r,mc:k.mc})});
 lancer({items:it,nom:'Quiz des excipients',mode:'etagere',coeurs:99})}
/* ---------- jour / nuit : l'ampoule ---------- */
function JN(){return S.jour===false?'nuit':'jour'}
function basculeJour(){S.jour=!(S.jour!==false);save();son('clic');vib(10);var m=JN();
 $$('img[data-jn]').forEach(function(i){i.src='decor/'+i.dataset.jn.replace('{m}',m)});
 var v=$('img.ville');if(v)v.src=m==='jour'?'decor/ville-jour.webp?v='+DV:'decor/ville-nuit.webp?v='+DV;
 document.body.classList.toggle('nuit',m==='nuit');$$('.amp').forEach(function(b){b.innerHTML=ic('bulb');b.classList.toggle('eteinte',m==='nuit')});
 toast(ic('bulb')+(m==='jour'?' Lumière allumée : il fait jour':' Lumière tamisée : bonsoir'))}
document.body.classList.toggle('nuit',JN()==='nuit');
'''

def patch(e, rep, V):
    e = e.replace("var MODES={", JS.replace('DV', "'" + V + "'") + "\nvar MODES={", 1)
    # images du décor selon le moment de la journée
    for k in ['fond', 'milieu', 'devant']:
        e = e.replace('src="decor/officine-' + k + '.webp?v=' + V + '"', 'data-jn="officine-' + k + '-{m}.webp?v=' + V + '" src="decor/officine-' + k + '-\'+JN()+\'.webp?v=' + V + '"')
    e = e.replace('src="decor/officine-1920.jpg?v=' + V + '"', 'data-jn="officine-1920-{m}.jpg?v=' + V + '" src="decor/officine-1920-\'+JN()+\'.jpg?v=' + V + '"')
    e = e.replace('<img class="ville" src="decor/ville-nuit.webp?v=' + V + '"', '<img class="ville" src="decor/\'+(JN()===\'jour\'?\'ville-jour.webp\':\'ville-nuit.webp\')+\'?v=' + V + '"')
    # bouton ampoule sous la pause (accueil et chapitres)
    e = e.replace("ic(S.pause?'play':'pause')+'</button></div>'", "ic(S.pause?'play':'pause')+'</button><button class=\"rond-btn amp'+(JN()==='nuit'?' eteinte':'')+'\" aria-label=\"Jour ou nuit\">'+ic('bulb')+'</button></div>'")
    e = rep(e, "function brancher(){", "function brancher(){$$('.amp').forEach(function(b){b.onclick=basculeJour});")
    # l'étagère dans le monde
    e = rep(e, " $('#ordos').onclick=function(){son('clic');MODES.ordonnances()};",
            " $('#ordos').onclick=function(){son('clic');MODES.ordonnances()};\n var eh=$('#etagHot');if(eh)eh.onclick=function(){son('clic');etagere()};")
    e = rep(e, " $('#lieux').innerHTML=h;", " h+='<button class=\"etag-hot\" id=\"etagHot\" style=\"left:'+(0.878*PW).toFixed(0)+'px;top:'+(0.47*PH).toFixed(0)+'px\"><span class=\"t\">'+ic('flask')+'<span>Étagère des excipients</span><em>'+exMaitrises()+'/'+EXC.ex.length+'</em></span><span class=\"halo-o\"></span></button>';\n $('#lieux').innerHTML=h;")
    e = e.replace(".hero-haut,.salon-bas,.borne,.ordos'", ".hero-haut,.salon-bas,.borne,.ordos,.etag-hot'")
    return e

CSS_JN = r'''
.rond-btn.amp.eteinte{color:#8a8070;background:rgba(20,14,10,.6)}
.rond-btn.amp:not(.eteinte){color:#ffd66b;box-shadow:0 0 18px rgba(255,214,107,.6)}
.piece img.ville{position:absolute;object-fit:cover;pointer-events:none}
'''
