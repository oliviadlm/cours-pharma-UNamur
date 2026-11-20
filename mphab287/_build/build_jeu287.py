# Générateur du jeu MPHAB287 : reprend le moteur du jeu de chimie pharma (jeu-chipha.html)
# et l'adapte aux calculs (saisie numérique, problèmes guidés, atelier calcul, tableaux).
import json, re, time, sys
REPO = '/home/claude/cours-pharma-unamur'
SRC = REPO + '/chimie-pharma/revision/jeu-chipha.html'
OUT = REPO + '/mphab287/jeu-calculs.html'
s = open(SRC).read()
a = s.find('<script>', 44000); b = s.find('</script>', a)
c = s.find('<script>', b); d = s.find('</script>', c)
head, eng = s[:a], s[c + 8:d]
DATA = json.load(open('data287.json'))
TH = [open('th1_iife.js').read(), open('th2_iife.js').read()]

def rep(src, old, new, n=1):
    k = src.count(old)
    if k < 1: sys.exit('introuvable : ' + old[:90])
    return src.replace(old, new) if n == 0 else src.replace(old, new, n)

# ------------------------------------------------------------- tête / CSS
head = rep(head, '<title>Chimie pharma — le jeu</title>', '<title>Méthodes de calculs — le jeu</title>')
head = rep(head, 'href="jeu-chipha.webmanifest"', 'href="jeu-calculs.webmanifest"')
head = rep(head, 'content="Chipha jeu"', 'content="Calculs jeu"')
head = head.replace('decor/chambre.jpg?v=hd', 'decor/monde.jpg?v=1').replace('content="#110f3d"', 'content="#1e1613"')
CSS = r'''
/* ===== MPHAB287 : calculs ===== */
.ordo{white-space:pre-wrap;font:600 15px/1.45 ui-monospace,Menlo,Consolas,monospace;background:#fbf7ec;border:1px solid #eadfc4;border-left:4px solid #c9a24a;color:#3a2f12;border-radius:12px;padding:10px 12px;margin:6px 0 10px;text-align:left}
.calc{display:flex;gap:8px;align-items:center;margin:10px 0 4px}
.calc input{flex:1;min-width:0;font-size:20px;font-weight:700;padding:12px 14px;border:2px solid var(--trait);border-radius:14px;background:#fff;color:var(--encre);text-align:right}
.calc input:focus{outline:none;border-color:var(--bleu)}
.calc .u{font-weight:700;color:var(--doux);min-width:28px}
.calc button{border:0;background:var(--bleu);color:#fff;font-weight:800;font-size:16px;padding:13px 16px;border-radius:14px}
.calc.ok input{border-color:var(--vert);background:var(--vert-p)}.calc.ko input{border-color:var(--rouge);background:var(--rouge-p)}
.etapes{list-style:none;margin:8px 0 0;padding:0;text-align:left}
.etapes li{padding:6px 0 6px 26px;position:relative;font-size:15px;line-height:1.4;border-bottom:1px dashed var(--trait)}
.etapes li:last-child{border-bottom:0}
.etapes li::before{content:counter(et);counter-increment:et;position:absolute;left:0;top:7px;width:19px;height:19px;border-radius:50%;background:var(--bleu);color:#fff;font:800 11px/19px system-ui;text-align:center}
.etapes{counter-reset:et}
.fb .etapes li{border-color:rgba(0,0,0,.08)}
.tip{margin-top:8px;font-size:14px;background:#fff7e0;border-radius:10px;padding:8px 10px;color:#5b4300}
.multi{margin-top:6px;text-align:left}
.pas{border:1px solid var(--trait);border-radius:14px;padding:10px 12px;margin-bottom:8px;background:#fff}
.pas.off{opacity:.45}
.pas b.l{display:block;font-size:14px;margin-bottom:2px}
.pas .calc{margin:6px 0 0}.pas .calc input{font-size:18px;padding:9px 12px}.pas .calc button{padding:10px 14px}
.pas .rp{margin-top:6px;font-size:14px;line-height:1.4}
.pas .rp .why{color:var(--doux);display:block;margin-top:2px}
.pas.ok{border-color:var(--vert)}.pas.ko{border-color:var(--rouge)}
'''
head = head.replace('</style>', CSS + '</style>', 1) if head.count('</style>') == 1 else head[:head.rfind('</style>')] + CSS + head[head.rfind('</style>'):]

# ------------------------------------------------------------- moteur
e = eng
e = rep(e, "KEY='chipha-jeu-antibact-v1'", "KEY='mphab287-jeu-v1'")
e = e.replace('decor/chambre.jpg?v=hd', 'decor/monde.jpg?v=1').replace('decor/chambre.mp4?v=hd', 'decor/monde.mp4?v=1')
e = rep(e, "<b>Chimie pharma</b>", "<b>Méthodes de calculs</b>", 0)
e = rep(e, "var RANGS=[[0,'Étudiante de 1re'],[150,'Stagiaire en officine'],[400,'Assistante en pharmacie'],[800,'Pharmacienne junior'],[1400,'Pharmacienne titulaire'],[2200,'Experte en anti-infectieux'],[3200,'Spécialiste des antiviraux'],[4500,'Maîtresse des antitumoraux'],[6500,'Légende de la chimie pharma']];",
        "var RANGS=[[0,'Étudiante de 1re'],[150,'Apprentie préparatrice'],[400,'Stagiaire en officine'],[800,'Reine des conversions'],[1400,'Maîtresse des triturations'],[2200,'Experte en suppositoires'],[3200,'Pharmacienne titulaire'],[4500,'As des préparations magistrales'],[6500,'Légende des calculs']];")
# ancienne migration chimie pharma -> migration des anciens quiz et pages de théorie MPHAB287
old_mig = e[e.find('/* anciennes sauvegardes (jeu antibactériens seul)'):e.find("if(S.pionAt==null)")]
e = rep(e, old_mig, r'''/* reprise de la progression des anciens quiz (chapitre-1/2.html) et des pages de théorie (theorie-seance-1/2.html) */
if(!S.mig287){try{
 [['mphab287-ch1','1'],['mphab287-ch2','2']].forEach(function(k){var a=JSON.parse(localStorage.getItem(k[0])||'null');if(!a)return;var EXS=D.ex.filter(function(x){return x.id.indexOf(k[1]+'-x')===0});
  Object.keys(a).forEach(function(i){var x=EXS[+i];if(x&&x.o&&a[i]===x.a&&!S.box[x.id])S.box[x.id]={b:1,d:dayNum()+1}})});
 [['mphab287-theorie-s1','1'],['mphab287-theorie-s2','2']].forEach(function(k){var t=JSON.parse(localStorage.getItem(k[0])||'null');if(!t)return;
  Object.keys(t.items||{}).forEach(function(id){var r=t.items[id];var m=/^p(\d+)$/.exec(id);if(!m||!r||!r.length)return;var qid='q:'+k[1]+'-z'+m[1];if(BYQ[k[1]+'-z'+m[1]]&&r[r.length-1]===1&&!S.box[qid])S.box[qid]={b:1,d:dayNum()+1}})});
}catch(err){} S.mig287=1;save()}
''')
# fabrique de questions : calculs, problèmes guidés, exercices, tableaux
FAB = r'''
/* ---------- calculs (générateurs des pages de théorie) ---------- */
var TH=window.TH, FMT=TH[0].fmt, NUMP=TH[0].parseNum, NEAR=TH[0].near;
function txt(h){return String(h||'').replace(/<[^>]+>/g,'')}
function etapesHTML(st){return '<ol class="etapes">'+st.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ol>'}
function qGen(ci,g,k){var G0=TH[ci].D.gens[g];return {id:'g:'+ci+':'+g+(k>1?':'+k:''),kind:'calc',type:['clock','Calcul'],lazy:function(){var o=G0.make();return {ctx:o.ctx||'',titre:o.q,ans:o.ans,unit:o.unit||'',tol:o.tol,st:o.steps||[]}},titre:G0.method}}
function qWorked(ci,w){var W=TH[ci].D.worked.filter(function(x){return x.id===w})[0];return {id:'w:'+ci+':'+w,kind:'multi',type:['target','Problème guidé'],lazy:function(){var o=W.make();return {ctx:o.ctx||'',titre:o.q,steps:o.steps}},titre:W.title,wt:W.title}}
function qEx(x){var base={id:'x:'+x.id,type:['book','Exercice · '+x.s],ctx:x.ctx,titre:x.q,st:x.st,tip:x.tip||''};
 if(x.num){base.kind='calc';base.ans=x.num.v;base.tol={abs:x.num.tol};base.unit='';return base}
 base.kind='qcm';base.choix=x.o.slice();base.rep=x.o[x.a];base.explH=etapesHTML(x.st)+(x.tip?'<div class="tip">'+x.tip+'</div>':'');return base}
function qSprint(ci,id){var SP=TH[ci].D.sprints.filter(function(x){return x.id===id})[0];var o=SP.make();
 if(o.o)return {id:null,kind:'qcm',type:['clock',SP.title],titre:o.q,choix:o.o.slice(),rep:o.o[o.a],expl:o.o[o.a]};
 return {id:null,kind:'calc',type:['clock',SP.title],titre:o.q,ans:o.ans,unit:o.unit||'',tol:o.tol,st:[FMT(o.ans)+(o.unit?' '+o.unit:'')]}}
function qTab(T,r){var autres=T.rows.filter(function(x){return x[1]!==r[1]}).map(function(x){return x[1]});var vus={};autres=mel(autres).filter(function(v){if(vus[v])return false;vus[v]=1;return true});
 return {id:'t:'+T.n+':'+r[0],kind:'qcm',type:['flask','Tableau · '+T.n],grand:r[0],titre:T.k+' ?',choix:mel([r[1]].concat(autres.slice(0,3))),rep:r[1],expl:r[0]+' : '+r[1]}}
function qTabInv(T,r){var autres=mel(T.rows.filter(function(x){return x[0]!==r[0]&&x[1]!==r[1]}).map(function(x){return x[0]}));
 return {id:null,kind:'qcm',type:['flask','Tableau · '+T.n],grand:r[1],titre:'À quoi cela correspond-il ?',choix:mel([r[0]].concat(autres.slice(0,3))),rep:r[0],expl:r[0]+' : '+r[1]}}
function exChap(ci){var L=CHAPS[ci].niveaux.filter(function(l){return l.type==='prof'})[0];return (L&&L.ex||[]).map(function(id){return qEx(BYX[id])})}
function workedChap(ci){var o=[];CHAPS[ci].niveaux.forEach(function(L){if(L.type==='n')(L.w||[]).forEach(function(w){o.push(qWorked(w[0],w[1]))})});return o}
/* atelier calcul : la correction (étapes) devient une image posée sur le papier */
function correctionImg(titre,st){var lignes=[],W=620;
 function couper(t,n){var mots=t.split(' '),l='',o=[];mots.forEach(function(m){if((l+' '+m).trim().length>n){o.push(l.trim());l=m}else l+=' '+m});if(l.trim())o.push(l.trim());return o}
 couper(titre,44).forEach(function(l){lignes.push(['t',l])});lignes.push(['s','']);
 st.forEach(function(x,i){couper((i+1)+'. '+txt(x),46).forEach(function(l,k){lignes.push([i===st.length-1?'r':'n',(k?'    ':'')+l])})});
 var H=30+lignes.length*34,y=40,o='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'"><rect width="100%" height="100%" fill="#fff" rx="18"/>';
 lignes.forEach(function(l){if(l[0]!=='s')o+='<text x="24" y="'+y+'" font-family="-apple-system,Helvetica,Arial,sans-serif" font-size="'+(l[0]==='t'?23:22)+'" font-weight="'+(l[0]==='n'?500:800)+'" fill="'+(l[0]==='r'?'#1a3fd6':'#1b2233')+'">'+l[1].replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</text>';y+=34});
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(o+'</svg>')}
function qAtelier(src){ // src : exercice de séance (x.st) ou problème guidé
 if(src.kind==='multi'){var o=src.lazy();return {id:'a:'+src.id,kind:'dessin',type:['pen','Atelier calcul'],grand:src.wt,ctx:o.ctx,titre:o.titre+' Pose le calcul sur le papier, puis corrige.',img:correctionImg(o.titre,o.steps.map(function(s){return s.label+' : '+s.show})),expl:''}}
 return {id:'a:'+src.id,kind:'dessin',type:['pen','Atelier calcul'],grand:'Exercice · '+(src.type[1]||'').replace('Exercice · ',''),ctx:src.ctx,titre:src.titre+' Pose le calcul sur le papier, puis corrige.',img:correctionImg(src.titre,src.st),expl:''}}
'''
e = rep(e, "/* ---------- fabrique de questions ---------- */", FAB + "\n/* ---------- fabrique de questions ---------- */")
e = rep(e, "var M=D.mol, BYID={}, BYQ={}, BYC={};", "var M=D.mol, BYID={}, BYQ={}, BYC={}, BYX={}; D.ex.forEach(function(x){BYX[x.id]=x});")
e = rep(e, "function qConcept(c){return {id:'k:'+c.id,kind:'carte',type:['brain','Concept'],grand:c.t,titre:'Explique ce concept à voix haute, puis retourne la carte.',rep:c.e,mc:c.mc||''}}",
        "function qConcept(c){return {id:'k:'+c.id,kind:'carte',type:['brain','Concept'],grand:c.t,titre:c.q||'Explique ce concept à voix haute, puis retourne la carte.',rep:c.e,mc:c.mc||''}}")
e = rep(e, "function qCarte(k){return {id:k.id,kind:'carte',type:[k.id[0]==='p'?'mic':'book',k.lab],",
        "function qCarte(k){return {id:k.id,kind:'carte',type:['mic',k.lab],")
# niveaux
old_pool = e[e.find('function poolNiveau(ci,n){'):e.find('function idsNiveau(ci,n)')]
e = rep(e, old_pool, r'''function poolNiveau(ci,n){
 var L=CHAPS[ci].niveaux[n], items=[];
 if(L.type==='boss'){CHAPS[ci].niveaux.forEach(function(l,k){if(l.type==='n'){items=items.concat(poolNiveau(ci,k).items.filter(function(x){return x.kind!=='carte'}))}});items=items.concat(exChap(ci));return {items:items,ms:[]}}
 if(L.type==='prof') return {items:exChap(ci).concat((L.w||[]).map(function(w){return qWorked(w[0],w[1])})).concat(cartesChap(ci)),ms:[]};
 (L.q||[]).forEach(function(id){items.push(qSyl(BYQ[id]))});
 (L.c||[]).forEach(function(id){items.push(qConcept(BYC[id]))});
 (L.g||[]).forEach(function(g){items.push(qGen(g[0],g[1],1));items.push(qGen(g[0],g[1],2))});
 (L.w||[]).forEach(function(w){items.push(qWorked(w[0],w[1]))});
 return {items:items, ms:[]};
}
''')
# composer : garder au moins 2 calculs et 1 problème guidé par partie quand le niveau en a
e = rep(e, " var sel=autres.slice(0,nb-2).concat(cartes.slice(0,1));",
        " var calc=autres.filter(function(x){return x.kind==='calc'||x.kind==='multi'}), simple=autres.filter(function(x){return x.kind!=='calc'&&x.kind!=='multi'});\n var sel=calc.slice(0,3).concat(simple.slice(0,Math.max(0,nb-2-Math.min(3,calc.length)))).concat(cartes.slice(0,1));")
e = rep(e, " if(L.type==='prof') items=composerCartes(p.items,8);",
        " if(L.type==='prof'){var cc=p.items.filter(function(x){return x.kind==='carte'}),xx=p.items.filter(function(x){return x.kind!=='carte'});items=composer(xx,[],8);var k2=composerCartes(cc,2);if(k2[0])items.splice(3,0,k2[0]);if(k2[1])items.push(k2[1])}")
e = rep(e, "CI=ci; lancer({items:items,nom:L.t,cle:bkey(ci,n),ci:ci,n:n,coeurs:L.type==='prof'?99:3});",
        "CI=ci; lancer({items:items,nom:L.t,cle:bkey(ci,n),ci:ci,n:n,coeurs:L.type==='prof'?5:3});")
# modes
old_modes = e[e.find(" eclair:function(ci){"):e.find("function hud(){")]
e = rep(e, old_modes, r''' eclair:function(ci){var it=[];qsChap(ci).forEach(function(q){it.push(qSyl(q))});it=mel(it).slice(0,26);for(var k=0;k<14;k++){var sp=CHAPS[ci].sprints[k%CHAPS[ci].sprints.length];it.push(qSprint(sp[0],sp[1]))}lancer({items:mel(it),nom:'Éclair 60 s · '+CHAPS[ci].court,mode:'eclair',ci:ci,coeurs:99,timer:60})},
 tableau:function(ci){var T=D.tab[CHAPS[ci].id]||[],it=[];T.forEach(function(t){t.rows.forEach(function(r){it.push(qTab(t,r));if(t.inv&&Math.random()<.5)it.push(qTabInv(t,r))})});lancer({items:mel(it).slice(0,12),nom:'Tableaux à connaître · '+CHAPS[ci].court,mode:'tableau',ci:ci,coeurs:3})},
 dessin:function(ci){var src=mel(exChap(ci)).slice(0,3).concat(mel(workedChap(ci)).slice(0,2));lancer({items:mel(src).map(qAtelier),nom:'Atelier calcul · '+CHAPS[ci].court,mode:'dessin',ci:ci,coeurs:99})},
 prof:function(ci){lancer({items:mel(composerCartes(cartesChap(ci),10)).slice(0,6),nom:'Questions de cours · '+CHAPS[ci].court,mode:'prof',ci:ci,coeurs:99})}
};
''')
e = rep(e, "var qs=0;", "var qs=0;", 0) if "var qs=0;" in e else e
# écran du chapitre : libellés des modes
e = rep(e, "ic('flask')+'<b>Tableau partie 3</b><small>Structure, DCI, nom commercial, classe</small></button>'",
        "ic('flask')+'<b>Tableaux à connaître</b><small>'+(D.tab[c.id]||[]).map(function(t){return t.n}).join(', ')+'</small></button>'")
e = rep(e, "if(dess) h+='<button class=\"mode\" data-m=\"dessin\">'+ic('pen')+'<b>Atelier dessin</b><small>Les molécules à savoir dessiner</small></button>';",
        "h+='<button class=\"mode\" data-m=\"dessin\">'+ic('pen')+'<b>Atelier calcul</b><small>Pose les calculs à la main, puis compare</small></button>';")
e = rep(e, "ic('mic')+'<b>Questions du prof</b><small>'+c.cartes.length+' questions d\\'examen</small></button>'",
        "ic('mic')+'<b>Questions de cours</b><small>'+c.cartes.length+' questions ouvertes et QROC</small></button>'")
e = rep(e, "<small>Vrai/faux et QCM chronométrés</small>", "<small>QCM, vrai/faux et calculs express</small>")
e = rep(e, "['dessin10','10 dessins','pen']", "['dessin10','10 calculs posés','pen']")
e = rep(e, "Tu as fait le tour de la chimie pharmaceutique.", "Tu as fait le tour des méthodes de calculs.")
e = e.replace("Ta chambre s\\'agrandit : continue comme ça.", "Continue comme ça.")
# rendu des questions : ordonnance, calcul, problème guidé
e = rep(e, " var x=G.items[G.i]; if(!x){terminer();return}",
        " var x=G.items[G.i]; if(!x){terminer();return}\n if(x.lazy&&!x.pret){var o=x.lazy();for(var kk in o)x[kk]=o[kk];x.pret=1}")
e = rep(e, " if(x.grand) h+='<div class=\"grand\">'+esc(x.grand)+'</div>';\n h+='<h2>'+esc(x.titre)+'</h2>';",
        " if(x.grand) h+='<div class=\"grand\">'+esc(x.grand)+'</div>';\n if(x.ctx) h+='<div class=\"ordo\">'+esc(x.ctx)+'</div>';\n h+='<h2>'+esc(x.titre)+'</h2>';\n if(x.kind==='calc') h+='<div class=\"calc\" id=\"calc\"><input id=\"cin\" type=\"text\" inputmode=\"decimal\" autocomplete=\"off\" placeholder=\"Ta réponse\" enterkeyhint=\"done\"><span class=\"u\">'+esc(x.unit||'')+'</span><button id=\"cok\">Valider</button></div>';\n if(x.kind==='multi') h+='<div class=\"multi\" id=\"multi\">'+x.steps.map(function(s,k){return '<div class=\"pas'+(k?' off':'')+'\" data-k=\"'+k+'\"><b class=\"l\">'+(k+1)+'. '+esc(s.label)+'</b><div class=\"calc\"><input type=\"text\" inputmode=\"decimal\" autocomplete=\"off\" placeholder=\"?\"'+(k?' disabled':'')+'><span class=\"u\">'+esc(s.unit||'')+'</span><button'+(k?' disabled':'')+'>OK</button></div><div class=\"rp\"></div></div>'}).join('')+'</div>';")
e = rep(e, " if(x.kind==='dessin') atelier(x);\n if(x.kind==='paires') bindPaires(x);\n}",
        " if(x.kind==='dessin') atelier(x);\n if(x.kind==='paires') bindPaires(x);\n if(x.kind==='calc'){var ci0=$('#cin');$('#cok').onclick=function(){calcRep(x)};ci0.onkeydown=function(ev){if(ev.key==='Enter')calcRep(x)};if(!G.timer)setTimeout(function(){},0);else ci0.focus()}\n if(x.kind==='multi') multiBind(x);\n}\n" + r'''function calcRep(x){
 if($('#fb').classList.contains('on'))return; var v=NUMP($('#cin').value); if(isNaN(v)){toast(ic('x')+' Écris un nombre (virgule acceptée)');return}
 var ok=NEAR(v,x.ans,x.tol); $('#calc').classList.add(ok?'ok':'ko'); $('#cin').disabled=true;
 S.total++; if(x.id) noter(x.id,ok); if(ok)bien(x); else mal(x,txt(x.titre)+' → '+FMT(x.ans)+' '+(x.unit||''));
 var fb=$('#fb'); fb.className='fb on '+(ok?'ok':'ko'); fb.innerHTML='<b>'+ic(ok?'check':'x')+(ok?pick(['Bravo !','Exact !','Bien calculé !','Parfait !'],1)[0]:'Réponse : '+FMT(x.ans)+' '+esc(x.unit||''))+'</b>'+(x.st&&x.st.length?etapesHTML(x.st):'')+(x.tip?'<div class="tip">'+x.tip+'</div>':'');
 save(); if(G.timer){setTimeout(function(){if(G){G.i++;montrer()}},ok?500:1800);return}
 if(G.coeurs<=0){$('#suite').textContent='Voir le bilan';$('#suite').onclick=terminer}
 $('#suite').classList.add('on');}
function multiBind(x){var k=0,err=0;
 function valider(){var P=$$('.pas')[k],inp=P.querySelector('input'),v=NUMP(inp.value),s=x.steps[k];if(isNaN(v)){toast(ic('x')+' Écris un nombre');return}
  var ok=NEAR(v,s.ans,s.tol);if(!ok)err++;P.classList.add(ok?'ok':'ko');inp.disabled=true;P.querySelector('button').disabled=true;
  P.querySelector('.rp').innerHTML=(ok?'':'<b>Réponse : '+FMT(s.ans)+' '+esc(s.unit||'')+'</b><br>')+s.show+'<span class="why">'+s.why+'</span>';son(ok?'bien':'mal');vib(ok?12:[30,30]);
  k++;if(k<x.steps.length){var N=$$('.pas')[k];N.classList.remove('off');N.querySelector('input').disabled=false;N.querySelector('button').disabled=false;setTimeout(function(){N.querySelector('input').focus()},80);return}
  var bon=err===0;S.total++;if(x.id)noter(x.id,bon);if(bon)bien(x);else mal(x,(x.wt||'Problème guidé')+' : '+err+' étape'+(err>1?'s':'')+' à revoir');
  var fb=$('#fb');fb.className='fb on '+(bon?'ok':'ko');fb.innerHTML='<b>'+ic(bon?'check':'x')+(bon?'Problème résolu sans faute !':err+' étape'+(err>1?'s':'')+' à revoir')+'</b>';save();
  if(G.coeurs<=0){$('#suite').textContent='Voir le bilan';$('#suite').onclick=terminer}$('#suite').classList.add('on')}
 $$('.pas').forEach(function(P){P.querySelector('button').onclick=valider;P.querySelector('input').onkeydown=function(ev){if(ev.key==='Enter')valider()}})}''')
e = rep(e, "fb.innerHTML='<b>'+ic(ok?'check':'x')+(ok?pick(['Bravo !','Exact !','Bien joué !','Parfait !'],1)[0]:'Pas tout à fait')+'</b>'+esc(x.expl||'');",
        "fb.innerHTML='<b>'+ic(ok?'check':'x')+(ok?pick(['Bravo !','Exact !','Bien joué !','Parfait !'],1)[0]:'Pas tout à fait')+'</b>'+(x.explH||esc(x.expl||''));")
# atelier : outils de calcul
e = rep(e, "var ATL_COULEURS=[['#1b2233','noir'],['#e11d48','rouge (O)'],['#2563eb','bleu (N)'],['#ca8a04','jaune (S)'],['#16a34a','vert (Cl, F)'],['#7c3aed','violet']];",
        "var ATL_COULEURS=[['#1b2233','noir'],['#2563eb','bleu'],['#e11d48','rouge'],['#16a34a','vert'],['#ca8a04','jaune'],['#7c3aed','violet']];")
e = rep(e, "var ATL_ATOMES=['O','N','S','H','Cl','F','OH','NH₂','NH','COOH','CH₃','R','+','−','δ+','δ−'];",
        "var ATL_ATOMES=['×','÷','=','→','+','−','%','‰','g','mg','µg','cg','mL','L','dt','pf','ad','qs','E','M','S','f','Σ','n + 1'];")
e = rep(e, " var t=[['stylo','Stylo'],['ligne','Liaison'],['double','Double'],['triple','Triple'],['benzene','Benzène'],['cycle6','Hexagone'],['cycle5','Pentagone'],['texte','Atome'],['gomme','Gomme'],['lasso','Déplacer']];",
        " var t=[['stylo','Stylo'],['ligne','Trait'],['texte','Symbole'],['gomme','Gomme'],['lasso','Déplacer']];")
e = rep(e, "'<div class=\"atl-zone\">", "(x.ctx?'':'')+'<div class=\"atl-zone\">")
e = rep(e, "ligne:'Glisse pour tracer une liaison : angles aimantés à 30°, extrémités collées aux atomes proches. Double tap sur une liaison = double liaison.'",
        "ligne:'Glisse pour tracer un trait droit (barre de fraction, tableau, flèche) : angles aimantés tous les 30°.'")
e = rep(e, "texte:'Choisis un atome puis touche l\\'endroit où le poser.'", "texte:'Choisis un symbole ou une unité, puis touche l\\'endroit où le poser.'")
e = rep(e, "<p>'+esc(x.grand)+(x.expl?' · '+esc(x.expl):'')+'</p>", "<p>'+esc(x.grand)+'</p>")
e = rep(e, "alt=\"Structure correcte\"", "alt=\"Correction\"")
# monde : lieux des chapitres (à replacer sur le décor définitif)
e = rep(e, "var SPOTS=[[24,84,'le bureau'],[33,72,'la télé'],[45,66,'la grande plante'],[58,66,'la baie vitrée'],[72,66,'le balcon'],[84,72,'le coin lumineux'],[76,85,'le coussin'],[58,90,'le pied du matelas'],[47,91,'le tapis'],[12,88,'le coin douillet']];",
        "var SPOTS=[[30,78,'la balance'],[62,74,'le comptoir'],[82,80,'l\\'étagère'],[46,88,'le mortier'],[14,84,'la vitrine'],[72,90,'le registre']];")
e = re.sub(r"var VERSION='\d+';", "var VERSION='" + str(int(time.time())) + "';", e)
e = e.replace("Bats le boss d\\'un chapitre pour ouvrir le lieu suivant du salon.", "Bats le boss d\\'un chapitre pour ouvrir le lieu suivant.")
e = e.replace('<b>Retour au salon</b>', '<b>Retour au monde</b>')
e = e.replace("<div class=\"sect\">Le salon · ", "<div class=\"sect\">Le monde · ")
e = e.replace("le salon t\\'emmène jusqu\\'à ce nouveau lieu.", "la caméra t\\'emmène jusqu\\'à ce nouveau lieu.")

e = rep(e, "var G=null;", "var G=null; window.__G=function(){return G}; window.__lancerNiveau=function(ci,n){lancerNiveau(ci,n)}; window.__S=function(){return S};")
e = e.replace("var RZ; window.addEventListener('resize',function(){clearTimeout(RZ);RZ=setTimeout(", "var RZT; window.addEventListener('resize',function(){clearTimeout(RZT);RZT=setTimeout(")
sys.path.insert(0, "/home/claude/jeu287"); import monde287
head = monde287.patch_head(head)
e = monde287.patch_engine(e, rep)
e = monde287.patch_ordo(e, rep)
import etagere287
head = head.replace('decor/officine-1920.jpg', 'decor/officine-1920-jour.jpg')
e = etagere287.patch(e, rep, monde287.V)
head = head[:head.rfind('</style>')] + etagere287.CSS + etagere287.CSS_JN + head[head.rfind('</style>'):]
js_th = 'window.TH=[' + TH[0] + ',\n' + TH[1] + '];'
html = head + '<script>window.DATA=' + json.dumps(DATA, ensure_ascii=False) + ';\nwindow.EXC=' + json.dumps(etagere287.EXC, ensure_ascii=False) + ';\n' + js_th + '</script>\n<script>' + e + '</script></body></html>'
open(OUT, 'w').write(html)
print('ok', len(html), OUT)
