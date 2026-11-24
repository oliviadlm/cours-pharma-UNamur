# Outils toujours disponibles dans le jeu MPHAB287 : feuille de brouillon (écriture au doigt / stylet) et calculatrice.
HTML = r'''
<button id="ot-btn" type="button" aria-label="Ouvrir la feuille et la calculatrice"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2.5" width="16" height="19" rx="2.5"/><rect x="7" y="5.5" width="10" height="4" rx="1"/><path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01"/></svg></button>
<section id="ot" aria-label="Feuille et calculatrice">
 <div class="ot-tete">
  <div class="ot-poignee" id="ot-poi" title="Glisse pour agrandir ou réduire"></div>
  <div class="ot-seg" role="tablist">
   <button type="button" data-m="note">Feuille</button><button type="button" data-m="deux">Les deux</button><button type="button" data-m="calc">Calcul</button>
  </div>
  <button type="button" class="ot-i" id="ot-pos" aria-label="Passer en haut ou en bas de l'écran"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10l5-5 5 5M7 14l5 5 5-5"/></svg></button>
  <button type="button" class="ot-i" id="ot-x" aria-label="Fermer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
 </div>
 <div class="ot-corps">
  <div class="ot-note">
   <canvas id="ot-cv"></canvas><div class="ot-astuce" id="ot-ast" style="opacity:0"></div>
   <div class="ot-outils">
    <button type="button" class="ot-c on" data-c="#1b2233" aria-label="Encre noire"><i style="background:#1b2233"></i></button>
    <button type="button" class="ot-c" data-c="#1f5fd6" aria-label="Encre bleue"><i style="background:#1f5fd6"></i></button>
    <button type="button" class="ot-c" data-c="#d92d3a" aria-label="Encre rouge"><i style="background:#d92d3a"></i></button>
    <button type="button" class="ot-c" data-c="gomme" aria-label="Gomme"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 21h10M5.5 14.5l7-7 6 6-7 7H8z"/><path d="M9 11l6 6"/></svg></button>
    <span class="ot-sep"></span>
    <button type="button" id="ot-sty" aria-label="Stylet seul : la main est ignorée" title="Stylet seul"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1.5-5L16 4.5a2.1 2.1 0 0 1 3 3L8.5 18z"/><path d="M14 6.5l3 3"/></svg></button>
    <button type="button" id="ot-undo" aria-label="Annuler"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/></svg></button>
    <button type="button" id="ot-home" aria-label="Revenir au début de la feuille"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg></button>
    <button type="button" id="ot-vide" aria-label="Nouvelle feuille"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg></button>
   </div>
  </div>
  <div class="ot-calc">
   <div class="ot-ecran"><div class="ot-hist" id="ot-hist"></div><div class="ot-expr" id="ot-expr">0</div><div class="ot-prev" id="ot-prev">&nbsp;</div></div>
   <div class="ot-act"><button type="button" id="ot-versf">Écrire sur la feuille</button><button type="button" id="ot-versr" disabled>Mettre dans la réponse</button></div>
   <div class="ot-touches" id="ot-touches"></div>
  </div>
 </div>
</section>
'''

CSS = r'''
#ot-btn{position:fixed;right:calc(env(safe-area-inset-right) + 8px);top:46%;z-index:60;width:46px;height:46px;border-radius:14px;border:1px solid rgba(255,255,255,.35);background:rgba(27,34,51,.78);color:#fff;display:grid;place-items:center;box-shadow:0 6px 18px rgba(0,0,0,.3);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);cursor:pointer;touch-action:manipulation}
#ot-btn svg{width:24px;height:24px}
#ot-btn.cache{display:none}
#ot{position:fixed;left:0;right:0;bottom:0;z-index:61;height:var(--oth,60vh);display:none;flex-direction:column;background:#fbf8f1;border-radius:20px 20px 0 0;box-shadow:0 -10px 34px rgba(0,0,0,.32);padding-bottom:env(safe-area-inset-bottom);font:15px/1.3 -apple-system,system-ui,Helvetica,Arial,sans-serif;color:#1b2233;touch-action:none;overscroll-behavior:contain}
#ot.on{display:flex}
#ot.haut{top:0;bottom:auto;border-radius:0 0 20px 20px;padding-top:env(safe-area-inset-top);padding-bottom:0}
#ot.haut .ot-tete{order:2}#ot.haut .ot-corps{order:1}
.ot-tete{position:relative;display:flex;align-items:center;gap:8px;padding:14px 10px 8px;flex:0 0 auto}
.ot-poignee{position:absolute;left:50%;top:0;transform:translateX(-50%);width:120px;height:20px;cursor:ns-resize;touch-action:none}
.ot-poignee::after{content:"";position:absolute;left:38px;right:38px;top:6px;height:5px;border-radius:5px;background:#cfc6b6}
#ot.haut .ot-tete{padding:8px 10px 14px}#ot.haut .ot-poignee{top:auto;bottom:0}#ot.haut .ot-poignee::after{top:auto;bottom:6px}
.ot-seg{flex:1;display:flex;background:#ece5d8;border-radius:12px;padding:3px;gap:2px}
.ot-seg button{flex:1;border:0;background:none;border-radius:9px;padding:8px 4px;font:700 13.5px/1 inherit;color:#5f584e;cursor:pointer}
.ot-seg button.on{background:#fff;color:#1b2233;box-shadow:0 1px 4px rgba(0,0,0,.12)}
.ot-i{flex:0 0 auto;width:38px;height:38px;border:0;border-radius:11px;background:#ece5d8;color:#3d3a36;display:grid;place-items:center;cursor:pointer}
.ot-i svg{width:20px;height:20px}
.ot-corps{flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;padding:0 10px 10px}
#ot[data-m="note"] .ot-calc,#ot[data-m="calc"] .ot-note{display:none}
.ot-note{position:relative;flex:1;min-height:120px;border-radius:14px;overflow:hidden;border:1px solid #e3dccd;background:#fffdf8 repeating-linear-gradient(0deg,transparent 0 23px,#e7edf6 23px 24px),#fffdf8}
.ot-note{background:#fffdf8;background-image:linear-gradient(#e9eef6 1px,transparent 1px),linear-gradient(90deg,#e9eef6 1px,transparent 1px);background-size:24px 24px}
#ot-cv{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:crosshair}
.ot-outils{position:absolute;left:8px;top:8px;display:flex;align-items:center;gap:4px;padding:4px;border-radius:12px;background:rgba(255,255,255,.92);box-shadow:0 2px 8px rgba(0,0,0,.12)}
.ot-outils button{width:34px;height:34px;border:0;border-radius:9px;background:none;display:grid;place-items:center;color:#3d3a36;cursor:pointer}
.ot-outils button svg{width:19px;height:19px}
.ot-outils .ot-c i{width:16px;height:16px;border-radius:50%;display:block}
.ot-outils .ot-c.on{background:#ece5d8;outline:2px solid #2f8a84}
.ot-outils #ot-sty{display:none}.ot-outils #ot-sty.vu{display:grid}.ot-outils #ot-sty.on{background:#e3f1ef;color:#1d5e59;outline:2px solid #2f8a84}
#ot,#ot *,#ot-btn{-webkit-user-select:none!important;user-select:none!important;-webkit-touch-callout:none!important;-webkit-tap-highlight-color:transparent}
.ot-astuce{position:absolute;left:8px;bottom:8px;right:8px;font:600 12px/1.3 -apple-system,system-ui,sans-serif;color:#6b6460;background:rgba(255,255,255,.9);border-radius:10px;padding:6px 9px;pointer-events:none;transition:opacity .4s}
.ot-sep{width:1px;height:22px;background:#ddd4c4;margin:0 2px}
.ot-calc{flex:0 0 auto;display:flex;flex-direction:column;gap:6px}
#ot[data-m="calc"] .ot-calc{flex:1;min-height:0}
.ot-ecran{background:#1b2233;color:#fff;border-radius:14px;padding:8px 12px;text-align:right;min-height:64px;display:flex;flex-direction:column;justify-content:flex-end}
.ot-hist{font-size:12.5px;color:#9fb0c8;max-height:34px;overflow:hidden;display:flex;flex-direction:column;align-items:flex-end}
.ot-hist button{border:0;background:none;color:inherit;font:inherit;padding:1px 0;cursor:pointer;text-align:right}
#ot[data-m="calc"] .ot-hist{max-height:none;flex:1;overflow-y:auto;justify-content:flex-end}
.ot-expr{font:600 24px/1.2 ui-monospace,"SF Mono",Menlo,monospace;overflow-x:auto;white-space:nowrap;scrollbar-width:none}
.ot-prev{font:15px/1.2 ui-monospace,"SF Mono",Menlo,monospace;color:#7dd3c8;min-height:18px}
.ot-act{display:flex;gap:6px}
.ot-act button{flex:1;border:0;border-radius:10px;padding:8px 6px;background:#e3f1ef;color:#1d5e59;font:700 12.5px/1.1 inherit;cursor:pointer}
.ot-act button:disabled{opacity:.4}
.ot-touches{display:grid;grid-template-columns:repeat(5,1fr);gap:5px}
.ot-touches button{border:0;border-radius:11px;height:40px;background:#fff;box-shadow:0 1px 0 #ddd4c4,0 1px 3px rgba(0,0,0,.06);font:600 18px/1 -apple-system,system-ui,sans-serif;color:#1b2233;cursor:pointer;touch-action:manipulation}
.ot-touches button.op{background:#ece5d8;color:#226b66}
.ot-touches button.fn{background:#f3efe6;font-size:15px;color:#5f584e}
.ot-touches button.eg{background:#2f8a84;color:#fff;grid-column:span 2}
.ot-touches button:active{transform:translateY(1px);filter:brightness(.95)}
#ot[data-m="calc"] .ot-touches{flex:0 0 auto}#ot[data-m="calc"] .ot-touches button{height:48px}
@media (max-width:699px){#ot[data-m="deux"] .ot-hist{display:none}#ot[data-m="deux"] .ot-ecran{min-height:0;padding:6px 12px}#ot[data-m="deux"] .ot-expr{font-size:21px}
 #ot[data-m="deux"] .ot-touches{gap:4px}#ot[data-m="deux"] .ot-touches button{height:36px;font-size:17px}#ot[data-m="deux"] .ot-act button{padding:7px 6px}}
@media (min-width:700px){#ot{left:auto;width:min(760px,96vw);right:calc(env(safe-area-inset-right) + 2vw);border-radius:20px 20px 0 0}#ot.haut{border-radius:0 0 20px 20px}
 #ot[data-m="deux"] .ot-corps{flex-direction:row}#ot[data-m="deux"] .ot-calc{width:300px;justify-content:flex-end}}
'''

JS = r'''
(function(){
var K='mphab287-outils',st={m:'deux',h:0,haut:false,tr:[],hist:[],stylet:false,vuStylet:false,v:null};
try{var sv=JSON.parse(localStorage.getItem(K)||'null');if(sv)for(var k in st)if(k in sv)st[k]=sv[k]}catch(e){}
function garde(){try{var n=0,tr=[];for(var i=st.tr.length-1;i>=0;i--){n+=(st.tr[i].p?st.tr[i].p.length:1);if(n>30000)break;tr.unshift(st.tr[i])}st.tr=tr;localStorage.setItem(K,JSON.stringify(st))}catch(e){}}
var $=function(s){return document.querySelector(s)},ot=$('#ot'),btn=$('#ot-btn'),cv=$('#ot-cv'),cx=cv.getContext('2d');
function stop(e){e.stopPropagation()}
['pointerdown','pointermove','pointerup','touchstart','touchmove','touchend','wheel','click','mousedown'].forEach(function(t){ot.addEventListener(t,stop);btn.addEventListener(t,stop)});
/* ---------- pas de sélection de texte ni de menu « Copier / Chercher » dans le panneau ---------- */
function dansOt(n){while(n&&n.nodeType!==1)n=n.parentNode;return !!(n&&n.closest&&(n.closest('#ot')||n.closest('#ot-btn')))}
function sansSel(){try{var sel=getSelection();if(sel&&sel.rangeCount&&(dansOt(sel.anchorNode)||dansOt(sel.focusNode)||ot.classList.contains('on')&&sel.containsNode&&sel.containsNode(ot,true)))sel.removeAllRanges()}catch(_){}}
document.addEventListener('selectstart',function(e){if(dansOt(e.target)||(ot.classList.contains('on')&&e.target&&dansOt(e.target)))e.preventDefault()},true);
document.addEventListener('selectionchange',function(){if(ot.classList.contains('on'))sansSel()});
ot.addEventListener('contextmenu',function(e){e.preventDefault()});
cv.addEventListener('touchstart',function(e){e.preventDefault()},{passive:false});
cv.addEventListener('touchmove',function(e){e.preventDefault()},{passive:false});
ot.addEventListener('pointerdown',sansSel,true);
/* ---------- panneau ---------- */
function hDef(){var p=innerWidth<700;return st.m==='deux'?(p?.8:.62):st.m==='note'?.6:(p?.62:.6)}
function taille(){var h=st.h||hDef();h=Math.max(.3,Math.min(.92,h));ot.style.setProperty('--oth',Math.round(h*innerHeight)+'px')}
function mode(m){st.m=m;ot.dataset.m=m;document.querySelectorAll('.ot-seg button').forEach(function(b){b.classList.toggle('on',b.dataset.m===m)});taille();setTimeout(dim,30);garde()}
function ouvre(){ot.classList.add('on');ot.classList.toggle('haut',!!st.haut);btn.classList.add('cache');mode(st.m)}
function ferme(){ot.classList.remove('on');btn.classList.remove('cache');garde()}
btn.onclick=ouvre;$('#ot-x').onclick=ferme;
$('#ot-pos').onclick=function(){st.haut=!st.haut;ot.classList.toggle('haut',st.haut);setTimeout(dim,30);garde()};
document.querySelectorAll('.ot-seg button').forEach(function(b){b.onclick=function(){st.h=0;mode(b.dataset.m)}});
(function(){var poi=$('#ot-poi'),y0,h0;poi.addEventListener('pointerdown',function(e){y0=e.clientY;h0=ot.getBoundingClientRect().height;try{poi.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault()});
 poi.addEventListener('pointermove',function(e){if(y0==null)return;var d=(e.clientY-y0)*(st.haut?1:-1);st.h=Math.max(.3,Math.min(.92,(h0+d)/innerHeight));taille();dim()});
 poi.addEventListener('pointerup',function(){y0=null;garde()});poi.addEventListener('pointercancel',function(){y0=null})})();
addEventListener('resize',function(){if(ot.classList.contains('on')){taille();dim()}});
/* ---------- feuille infinie ---------- */
var coul='#1b2233',cur=null,curId=null,dpr=1,W=0,H=0,note=document.querySelector('.ot-note');
if(!st.v)st.v={x:0,y:0,z:1};var V=st.v;
function dim(){var r=cv.getBoundingClientRect();if(!r.width)return;W=r.width;H=r.height;dpr=Math.min(3,devicePixelRatio||1);cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);dessine()}
function grille(){var g=24*V.z;note.style.backgroundSize=g+'px '+g+'px';note.style.backgroundPosition=(-V.x*V.z%g)+'px '+(-V.y*V.z%g)+'px'}
function trait(t,de){var p=t.p;cx.save();cx.lineCap='round';cx.lineJoin='round';
 if(t.g){cx.globalCompositeOperation='destination-out';cx.lineWidth=22;cx.fillStyle='#000';cx.strokeStyle='#000'}else{cx.strokeStyle=t.c;cx.fillStyle=t.c;cx.lineWidth=2.6}
 cx.beginPath();if(p.length===1){cx.arc(p[0][0],p[0][1],cx.lineWidth/2,0,7);cx.fill()}
 else{var i=Math.max(1,de||1);cx.moveTo(p[i-1][0],p[i-1][1]);for(;i<p.length-1;i++){var mx=(p[i][0]+p[i+1][0])/2,my=(p[i][1]+p[i+1][1])/2;cx.quadraticCurveTo(p[i][0],p[i][1],mx,my)}cx.lineTo(p[p.length-1][0],p[p.length-1][1]);cx.stroke()}
 cx.restore()}
function texte(t){cx.save();cx.fillStyle=t.c||'#1f5fd6';cx.font='700 24px Caveat, "Comic Sans MS", cursive';cx.fillText(t.t,t.x,t.y);cx.restore()}
function dessine(){cx.setTransform(1,0,0,1,0,0);cx.clearRect(0,0,cv.width,cv.height);var k=dpr*V.z;cx.setTransform(k,0,0,k,-V.x*k,-V.y*k);
 var x0=V.x-40,y0=V.y-40,x1=V.x+W/V.z+40,y1=V.y+H/V.z+40;
 st.tr.forEach(function(t){if(t.t!=null){if(t.y>y0&&t.y<y1+30)texte(t);return}var b=t.b;if(!b){b=[1e9,1e9,-1e9,-1e9];t.p.forEach(function(q){b[0]=Math.min(b[0],q[0]);b[1]=Math.min(b[1],q[1]);b[2]=Math.max(b[2],q[0]);b[3]=Math.max(b[3],q[1])})}
  if(b[2]<x0||b[0]>x1||b[3]<y0||b[1]>y1)return;trait(t)});grille()}
function ecran(e){var r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]}
function pos(e){var q=ecran(e);return[Math.round((V.x+q[0]/V.z)*10)/10,Math.round((V.y+q[1]/V.z)*10)/10]}
var doigts={},nav=null,navSeul=false,tap2=null,avant='#1b2233',tDessin=0;
function choisit(c){coul=c;document.querySelectorAll('.ot-c').forEach(function(x){x.classList.toggle('on',x.dataset.c===c)})}
function bascule(){if(coul==='gomme')choisit(avant);else{avant=coul;choisit('gomme')}astuce(coul==='gomme'?'Gomme':'Stylo')}
var tAst;function astuce(t,ms){var a=$('#ot-ast');a.textContent=t;a.style.opacity=1;clearTimeout(tAst);tAst=setTimeout(function(){a.style.opacity=0},ms||1200)}
function majSty(){var b=$('#ot-sty');b.classList.toggle('vu',!!st.vuStylet);b.classList.toggle('on',!!st.stylet)}
$('#ot-sty').onclick=function(){st.stylet=!st.stylet;majSty();garde();astuce(st.stylet?'Stylet seul : ta main est ignorée. Un doigt pour te déplacer, deux pour zoomer, tape à deux doigts pour stylo / gomme.':'Le doigt écrit aussi : glisse à deux doigts pour te déplacer.',3000)};
/* navigation : base = position des doigts au début du geste */
function base(){var ids=Object.keys(doigts);if(!ids.length){nav=null;return}var cxm=0,cym=0;ids.forEach(function(i){cxm+=doigts[i].x;cym+=doigts[i].y});cxm/=ids.length;cym/=ids.length;
 var d=ids.length>1?Math.hypot(doigts[ids[0]].x-doigts[ids[1]].x,doigts[ids[0]].y-doigts[ids[1]].y):0;var r=cv.getBoundingClientRect();
 nav={cx:cxm-r.left,cy:cym-r.top,d:d,x:V.x,y:V.y,z:V.z,n:ids.length}}
function bouge(){var ids=Object.keys(doigts);if(!nav||ids.length!==nav.n){base();return}var cxm=0,cym=0;ids.forEach(function(i){cxm+=doigts[i].x;cym+=doigts[i].y});cxm/=ids.length;cym/=ids.length;var r=cv.getBoundingClientRect();cxm-=r.left;cym-=r.top;
 var z=nav.z;if(ids.length>1&&nav.d>20){var d=Math.hypot(doigts[ids[0]].x-doigts[ids[1]].x,doigts[ids[0]].y-doigts[ids[1]].y);z=Math.max(.4,Math.min(2.5,nav.z*d/nav.d))}
 var wx=nav.x+nav.cx/nav.z,wy=nav.y+nav.cy/nav.z;V.z=z;V.x=wx-cxm/z;V.y=wy-cym/z;dessine()}
function annuleTraitDoigt(){if(cur&&cur.doigt){if(cur.p.length<14||Date.now()-tDessin<250){st.tr.splice(st.tr.indexOf(cur),1)}else delete cur.doigt;cur=null;curId=null;dessine()}}
cv.addEventListener('pointerdown',function(e){if(e.button>0)return;e.preventDefault();
 if(e.pointerType==='touch'){doigts[e.pointerId]={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,t:Date.now()};var n=Object.keys(doigts).length;
  if(n===2){var ids=Object.keys(doigts),d0=doigts[ids[0]],d1=doigts[ids[1]];tap2=Math.abs(d0.t-d1.t)<250?{t:Math.min(d0.t,d1.t)}:null}else if(n>2)tap2=null;
  if(st.stylet||n>1||navSeul){if(!st.stylet)annuleTraitDoigt();navSeul=true;base();return}}
 if(e.pointerType==='pen'){if(!st.vuStylet){st.vuStylet=true;st.stylet=true;majSty();garde();astuce('Apple Pencil détecté : ta main est ignorée. Un doigt pour te déplacer, deux pour zoomer, tape à deux doigts pour stylo / gomme.',4000)}
  if(cur&&cur.doigt){st.tr.splice(st.tr.indexOf(cur),1);cur=null;dessine()}}
 if(cur)return;
 try{cv.setPointerCapture(e.pointerId)}catch(_){}curId=e.pointerId;tDessin=Date.now();cur={c:coul==='gomme'?null:coul,g:coul==='gomme',p:[pos(e)],doigt:e.pointerType==='touch'};st.tr.push(cur);trait(cur)});
cv.addEventListener('pointermove',function(e){var d=doigts[e.pointerId];
 if(d){d.x=e.clientX;d.y=e.clientY;if(Math.abs(e.clientX-d.sx)+Math.abs(e.clientY-d.sy)>14)tap2=null;if(navSeul){bouge();return}if(!(cur&&e.pointerId===curId))return}
 if(!cur||e.pointerId!==curId)return;var ev=e.getCoalescedEvents?e.getCoalescedEvents():[e];if(!ev.length)ev=[e];var n=cur.p.length;ev.forEach(function(x){cur.p.push(pos(x))});
 var s2={c:cur.c,g:cur.g,p:cur.p.slice(Math.max(0,n-2))};trait(s2,1);e.preventDefault()});
function fin(e){if(doigts[e.pointerId]){delete doigts[e.pointerId];var n=Object.keys(doigts).length;
  if(!n){if(tap2&&Date.now()-tap2.t<400&&e.type==='pointerup')bascule();tap2=null;if(navSeul){navSeul=false;nav=null;garde()}}else if(navSeul)base();
  if(!(cur&&e.pointerId===curId))return}
 if(cur&&e.pointerId===curId){delete cur.doigt;cur=null;curId=null;dessine();garde()}}
cv.addEventListener('pointerup',fin);cv.addEventListener('pointercancel',fin);
cv.addEventListener('wheel',function(e){e.preventDefault();if(e.ctrlKey){var q=ecran(e),wx=V.x+q[0]/V.z,wy=V.y+q[1]/V.z;V.z=Math.max(.4,Math.min(2.5,V.z*Math.exp(-e.deltaY/200)));V.x=wx-q[0]/V.z;V.y=wy-q[1]/V.z}else{V.x+=e.deltaX/V.z;V.y+=e.deltaY/V.z}dessine();clearTimeout(cv._w);cv._w=setTimeout(garde,400)},{passive:false});
document.querySelectorAll('.ot-c').forEach(function(b){b.onclick=function(){if(b.dataset.c!=='gomme')avant=b.dataset.c;choisit(b.dataset.c)}});
$('#ot-undo').onclick=function(){st.tr.pop();dessine();garde()};
$('#ot-home').onclick=function(){V.x=0;V.y=0;V.z=1;dessine();garde()};
var vide=$('#ot-vide'),armee=0;vide.onclick=function(){if(!st.tr.length)return;if(Date.now()-armee>2500){armee=Date.now();vide.style.background='#fde2e2';astuce('Touche encore la poubelle pour effacer toute la feuille');setTimeout(function(){vide.style.background=''},2500);return}st.tr=[];armee=0;vide.style.background='';V.x=0;V.y=0;V.z=1;dessine();garde()};
function ligneLibre(){var y=34;st.tr.forEach(function(t){if(t.t!=null)y=Math.max(y,t.y+30);else t.p.forEach(function(q){y=Math.max(y,q[1]+30)})});return Math.max(y,70)}
/* ---------- calculatrice ---------- */
var ex='',ans=null,dern=null,inp=null;
var T=[['C','fn'],['⌫','fn'],['(','fn'],[')','fn'],['÷','op'],['7'],['8'],['9'],['×','op'],['√','fn'],['4'],['5'],['6'],['−','op'],['x²','fn'],['1'],['2'],['3'],['+','op'],['%','fn'],['0'],[','],['Ans','fn'],['=','eg']];
$('#ot-touches').innerHTML=T.map(function(t){return '<button type="button" class="'+(t[1]||'')+'" data-k="'+t[0]+'">'+t[0]+'</button>'}).join('');
function fmt(x){if(!isFinite(x))return 'erreur';var r=Math.round(x*1e10)/1e10;if(Math.abs(r)>=1e12||(Math.abs(r)<1e-6&&r!==0))return r.toExponential(6).replace('.',',');return String(r).replace('.',',')}
function calcule(s){var t=s.replace(/\s/g,'').replace(/,/g,'.').replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/Ans/g,'('+(ans==null?0:ans)+')'),i=0;
 function pk(){return t[i]}function nb(){var m=/^\d*\.?\d+(e[+-]?\d+)?/i.exec(t.slice(i))||/^\d+\./.exec(t.slice(i));if(!m)throw 0;i+=m[0].length;return parseFloat(m[0])}
 function prim(){var c=pk();if(c==='('){i++;var v=som();if(pk()===')')i++;return v}if(c==='√'){i++;return Math.sqrt(un())}return nb()}
 function post(){var v=prim();for(;;){if(pk()==='%'){i++;v/=100}else if(pk()==='²'){i++;v*=v}else return v}}
 function pw(){var v=post();if(pk()==='^'){i++;return Math.pow(v,un())}return v}
 function un(){if(pk()==='-'){i++;return -un()}if(pk()==='+'){i++;return un()}return pw()}
 function prod(){var v=un();for(;;){var c=pk();if(c==='*'){i++;v*=un()}else if(c==='/'){i++;v/=un()}else if(c==='('||c==='√'){v*=un()}else return v}}
 function som(){var v=prod();for(;;){var c=pk();if(c==='+'){i++;v+=prod()}else if(c==='-'){i++;v-=prod()}else return v}}
 var o=0;for(var j=0;j<t.length;j++){if(t[j]==='(')o++;else if(t[j]===')')o--}while(o-->0)t+=')';
 var v=som();if(i<t.length)throw 0;return v}
function maj(){$('#ot-expr').textContent=ex||'0';var p=' ';if(ex&&/[^\d,]/.test(ex.replace(/^−/,''))){try{var v=calcule(ex);p='= '+fmt(v)}catch(e){}}$('#ot-prev').textContent=p;var el=$('#ot-expr');el.scrollLeft=el.scrollWidth;
 $('#ot-hist').innerHTML=st.hist.slice(-12).map(function(h,i,a){return '<button type="button" data-v="'+h.v+'">'+h.e+' = '+fmt(h.v)+'</button>'}).join('');
 $('#ot-versr').disabled=!(inp&&document.contains(inp)&&(dern!=null||ex))}
function touche(k){if(k==='C'){ex='';dern=null}else if(k==='⌫'){ex=ex.replace(/(Ans|.)$/,'')}else if(k==='x²'){ex+='²'}else if(k==='='){if(!ex)return;try{var v=calcule(ex);st.hist.push({e:ex,v:v});st.hist=st.hist.slice(-30);ans=v;dern={e:ex,v:v};ex=fmt(v);garde()}catch(e){$('#ot-prev').textContent='calcul incomplet';return}}
 else{if(dern&&ex===fmt(dern.v)&&/^[\d,√(]$/.test(k)){ex=''}dern=dern&&/^[\d,√(]$/.test(k)?null:dern;ex+=k}maj()}
$('#ot-touches').addEventListener('click',function(e){var b=e.target.closest('button');if(b)touche(b.dataset.k)});
$('#ot-hist').addEventListener('click',function(e){var b=e.target.closest('button');if(b){ex+=(ex&&/[\d)²%]$/.test(ex)?'×':'')+fmt(+b.dataset.v);maj()}});
function resultat(){if(ex){try{var v=calcule(ex);return{e:dern&&ex===fmt(dern.v)?dern.e:ex,v:v}}catch(e){}}return dern}
$('#ot-versf').onclick=function(){var r=resultat();if(!r)return;if(st.m==='calc')mode('deux');var t={t:(r.e===fmt(r.v)?'':r.e+' = ')+fmt(r.v),x:Math.round(V.x+14/V.z),y:ligneLibre(),c:'#1f5fd6'};st.tr.push(t);setTimeout(function(){dim();if(t.y>V.y+(H-20)/V.z||t.y<V.y+60/V.z){V.y=t.y-(H-50)/V.z;dessine()}garde()},40)};
$('#ot-versr').onclick=function(){var r=resultat();if(!r||!inp||!document.contains(inp))return;var v=fmt(r.v);
 var set=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(inp),'value');if(set&&set.set)set.set.call(inp,v);else inp.value=v;inp.dispatchEvent(new Event('input',{bubbles:true}));inp.dispatchEvent(new Event('change',{bubbles:true}));
 var b=$('#ot-versr'),o=b.textContent;b.textContent='Réponse remplie';setTimeout(function(){b.textContent=o},1400)};
document.addEventListener('focusin',function(e){var t=e.target;if(t&&t.matches&&t.matches('input:not([type=checkbox]):not([type=radio]):not([type=range]),textarea')&&!t.closest('#ot')){inp=t;maj()}},true);
document.addEventListener('keydown',function(e){if(!ot.classList.contains('on')||st.m==='note')return;var a=document.activeElement;if(a&&a.matches&&a.matches('input,textarea'))return;
 var m={'*':'×','/':'÷','-':'−','.':',','Enter':'=','Backspace':'⌫','Escape':'C'};var k=m[e.key]||e.key;if(/^[\d+()%,]$/.test(k)||['×','÷','−','=','⌫','C'].indexOf(k)>=0){touche(k);e.preventDefault()}});
ot.dataset.m=st.m;maj();majSty();
if(window.ResizeObserver)new ResizeObserver(function(){if(ot.classList.contains('on'))dim()}).observe(cv);
})();
'''
