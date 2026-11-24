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
   <canvas id="ot-cv"></canvas>
   <div class="ot-outils">
    <button type="button" class="ot-c on" data-c="#1b2233" aria-label="Encre noire"><i style="background:#1b2233"></i></button>
    <button type="button" class="ot-c" data-c="#1f5fd6" aria-label="Encre bleue"><i style="background:#1f5fd6"></i></button>
    <button type="button" class="ot-c" data-c="#d92d3a" aria-label="Encre rouge"><i style="background:#d92d3a"></i></button>
    <button type="button" class="ot-c" data-c="gomme" aria-label="Gomme"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 21h10M5.5 14.5l7-7 6 6-7 7H8z"/><path d="M9 11l6 6"/></svg></button>
    <span class="ot-sep"></span>
    <button type="button" id="ot-undo" aria-label="Annuler"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/></svg></button>
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
.ot-note{background-image:linear-gradient(#e9eef6 1px,transparent 1px),linear-gradient(90deg,#e9eef6 1px,transparent 1px);background-size:24px 24px}
#ot-cv{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:crosshair}
.ot-outils{position:absolute;left:8px;top:8px;display:flex;align-items:center;gap:4px;padding:4px;border-radius:12px;background:rgba(255,255,255,.92);box-shadow:0 2px 8px rgba(0,0,0,.12)}
.ot-outils button{width:34px;height:34px;border:0;border-radius:9px;background:none;display:grid;place-items:center;color:#3d3a36;cursor:pointer}
.ot-outils button svg{width:19px;height:19px}
.ot-outils .ot-c i{width:16px;height:16px;border-radius:50%;display:block}
.ot-outils .ot-c.on{background:#ece5d8;outline:2px solid #2f8a84}
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
var K='mphab287-outils',st={m:'deux',h:0,haut:false,tr:[],hist:[]};
try{var sv=JSON.parse(localStorage.getItem(K)||'null');if(sv)for(var k in st)if(k in sv)st[k]=sv[k]}catch(e){}
function garde(){try{var n=0,tr=[];for(var i=st.tr.length-1;i>=0;i--){n+=(st.tr[i].p?st.tr[i].p.length:1);if(n>30000)break;tr.unshift(st.tr[i])}st.tr=tr;localStorage.setItem(K,JSON.stringify(st))}catch(e){}}
var $=function(s){return document.querySelector(s)},ot=$('#ot'),btn=$('#ot-btn'),cv=$('#ot-cv'),cx=cv.getContext('2d');
function stop(e){e.stopPropagation()}
['pointerdown','pointermove','pointerup','touchstart','touchmove','touchend','wheel','click','mousedown'].forEach(function(t){ot.addEventListener(t,stop);btn.addEventListener(t,stop)});
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
/* ---------- feuille ---------- */
var coul='#1b2233',cur=null,dpr=1;
function dim(){var r=cv.getBoundingClientRect();if(!r.width)return;dpr=Math.min(3,devicePixelRatio||1);cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);dessine()}
function trait(t,de){var p=t.p;cx.save();cx.lineCap='round';cx.lineJoin='round';
 if(t.g){cx.globalCompositeOperation='destination-out';cx.lineWidth=22}else{cx.strokeStyle=t.c;cx.lineWidth=2.6}
 cx.beginPath();if(p.length===1){cx.arc(p[0][0],p[0][1],cx.lineWidth/2,0,7);cx.fillStyle=t.c||'#000';if(!t.g)cx.fill();else{cx.fill()}}
 else{var i=Math.max(1,de||1);cx.moveTo(p[i-1][0],p[i-1][1]);for(;i<p.length-1;i++){var mx=(p[i][0]+p[i+1][0])/2,my=(p[i][1]+p[i+1][1])/2;cx.quadraticCurveTo(p[i][0],p[i][1],mx,my)}cx.lineTo(p[p.length-1][0],p[p.length-1][1]);cx.stroke()}
 cx.restore()}
function texte(t){cx.save();cx.fillStyle=t.c||'#1f5fd6';cx.font='700 24px Caveat, "Comic Sans MS", cursive';cx.fillText(t.t,t.x,t.y);cx.restore()}
function dessine(){cx.setTransform(1,0,0,1,0,0);cx.clearRect(0,0,cv.width,cv.height);cx.setTransform(dpr,0,0,dpr,0,0);st.tr.forEach(function(t){t.t!=null?texte(t):trait(t)})}
function pos(e){var r=cv.getBoundingClientRect();return[Math.round((e.clientX-r.left)*10)/10,Math.round((e.clientY-r.top)*10)/10]}
cv.addEventListener('pointerdown',function(e){if(e.button>0)return;try{cv.setPointerCapture(e.pointerId)}catch(_){}cur={c:coul==='gomme'?null:coul,g:coul==='gomme',p:[pos(e)]};st.tr.push(cur);trait(cur);e.preventDefault()});
cv.addEventListener('pointermove',function(e){if(!cur)return;var ev=e.getCoalescedEvents?e.getCoalescedEvents():[e];if(!ev.length)ev=[e];var n=cur.p.length;ev.forEach(function(x){cur.p.push(pos(x))});
 var s={c:cur.c,g:cur.g,p:cur.p.slice(Math.max(0,n-2))};trait(s,1);e.preventDefault()});
function fin(){if(cur){cur=null;dessine();garde()}}
cv.addEventListener('pointerup',fin);cv.addEventListener('pointercancel',fin);
document.querySelectorAll('.ot-c').forEach(function(b){b.onclick=function(){coul=b.dataset.c;document.querySelectorAll('.ot-c').forEach(function(x){x.classList.toggle('on',x===b)})}});
$('#ot-undo').onclick=function(){st.tr.pop();dessine();garde()};
var vide=$('#ot-vide'),armee=0;vide.onclick=function(){if(!st.tr.length)return;if(Date.now()-armee>2500){armee=Date.now();vide.style.background='#fde2e2';vide.setAttribute('aria-label','Touche encore pour effacer la feuille');setTimeout(function(){vide.style.background=''},2500);return}st.tr=[];armee=0;vide.style.background='';dessine();garde()};
function ligneLibre(){var y=34;st.tr.forEach(function(t){if(t.t!=null)y=Math.max(y,t.y+30);else t.p.forEach(function(q){y=Math.max(y,q[1]+30)})});var hmax=cv.getBoundingClientRect().height-10;return Math.min(y,Math.max(34,hmax))}
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
$('#ot-versf').onclick=function(){var r=resultat();if(!r)return;if(st.m==='calc')mode('deux');var t={t:(r.e===fmt(r.v)?'':r.e+' = ')+fmt(r.v),x:14,y:ligneLibre(),c:'#1f5fd6'};if(t.y<60&&t.x<200)t.y=Math.max(t.y,70);st.tr.push(t);setTimeout(function(){dim()},40);garde()};
$('#ot-versr').onclick=function(){var r=resultat();if(!r||!inp||!document.contains(inp))return;var v=fmt(r.v);
 var set=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(inp),'value');if(set&&set.set)set.set.call(inp,v);else inp.value=v;inp.dispatchEvent(new Event('input',{bubbles:true}));inp.dispatchEvent(new Event('change',{bubbles:true}));
 var b=$('#ot-versr'),o=b.textContent;b.textContent='Réponse remplie';setTimeout(function(){b.textContent=o},1400)};
document.addEventListener('focusin',function(e){var t=e.target;if(t&&t.matches&&t.matches('input:not([type=checkbox]):not([type=radio]):not([type=range]),textarea')&&!t.closest('#ot')){inp=t;maj()}},true);
document.addEventListener('keydown',function(e){if(!ot.classList.contains('on')||st.m==='note')return;var a=document.activeElement;if(a&&a.matches&&a.matches('input,textarea'))return;
 var m={'*':'×','/':'÷','-':'−','.':',','Enter':'=','Backspace':'⌫','Escape':'C'};var k=m[e.key]||e.key;if(/^[\d+()%,]$/.test(k)||['×','÷','−','=','⌫','C'].indexOf(k)>=0){touche(k);e.preventDefault()}});
ot.dataset.m=st.m;maj();
if(window.ResizeObserver)new ResizeObserver(function(){if(ot.classList.contains('on'))dim()}).observe(cv);
})();
'''
