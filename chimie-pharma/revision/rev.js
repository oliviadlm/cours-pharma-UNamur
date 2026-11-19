(function(){
  var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
  // onglets
  $$('.tab').forEach(function(b){b.addEventListener('click',function(){
    $$('.tab').forEach(function(x){x.classList.toggle('on',x===b)});
    $$('.pane').forEach(function(p){p.classList.toggle('on',p.id==='t-'+b.dataset.t)});
    try{history.replaceState(null,'','#'+b.dataset.t)}catch(e){}
  })});
  var h=(location.hash||'').slice(1); if(h){var tb=$('.tab[data-t="'+h+'"]'); if(tb) tb.click();}
  // filtres molécules
  $$('.filtres button').forEach(function(b){b.addEventListener('click',function(){
    $$('.filtres button').forEach(function(x){x.classList.toggle('on',x===b)});
    var f=b.dataset.f; $$('.mol').forEach(function(m){m.classList.toggle('hide',f!=='tout'&&!m.classList.contains(f))});
    $$('.classe').forEach(function(c){c.classList.toggle('hide',!$$('.mol:not(.hide)',c).length)});
  })});
  var D=window.DATA||{};
  // Partie 3
  function p3(){
    var tb=$('#p3b'); if(!tb||!D.p3) return; var n=+($('#p3n').value||20);
    var dess=shuffle(D.p3.filter(function(m){return m.dessin&&m.img})), autres=shuffle(D.p3.filter(function(m){return !(m.dessin&&m.img)}));
    var pick=dess.slice(0,Math.ceil(n*0.4)).concat(autres).slice(0,n); if(pick.length<n) pick=pick.concat(dess.slice(Math.ceil(n*0.4))).slice(0,n);
    pick=shuffle(pick); $('.p3').classList.remove('corr');
    tb.innerHTML=pick.map(function(m){
      var opts=[]; if(m.img) opts.push('s'); opts.push('d'); if(m.marques.length) opts.push('m');
      var g=opts[Math.floor(Math.random()*opts.length)];
      var sol=function(t){return '<div class="sol">'+t+'</div>'};
      var cS=g==='s'?'<img src="'+esc(m.img)+'" alt="structure">':(m.dessin?'<span class="adess">à dessiner</span>'+(m.img?sol('<img src="'+esc(m.img)+'" alt="">'):''):'<span class="note">pas de structure demandée</span>'+(m.img?sol('<img src="'+esc(m.img)+'" alt="">'):''));
      var cD=g==='d'?'<span class="donne">'+esc(m.dci)+'</span>':'<input aria-label="DCI">'+sol(esc(m.dci));
      var cM=g==='m'?'<span class="donne">'+esc(m.marques[0])+'</span>':'<input aria-label="nom commercial">'+sol(esc(m.marques.join(', ')||'pas de nom commercial au cours'));
      var cC='<input aria-label="classe">'+sol(esc(m.classe));
      return '<tr><td class="s">'+cS+'</td><td>'+cD+'</td><td>'+cM+'</td><td>'+cC+'</td></tr>';
    }).join('');
  }
  if($('#p3new')){ $('#p3new').addEventListener('click',p3); $('#p3n').addEventListener('change',p3); $('#p3cor').addEventListener('click',function(){$('.p3').classList.toggle('corr')}); p3(); }
  // quiz
  var Q=D.quiz||[], qi=0, score=0, order=shuffle(Q);
  function quiz(){
    var z=$('#quiz'); if(!z||!Q.length) return;
    if(qi>=order.length){ z.innerHTML='<div class="q-card"><p class="qo-q">Score : '+score+' / '+order.length+'</p><div class="q-nav"><span></span><button id="qr">Recommencer</button></div></div>'; $('#qr').onclick=function(){qi=0;score=0;order=shuffle(Q);quiz()}; return; }
    var q=order[qi], ch=shuffle(q.c);
    z.innerHTML='<div class="q-card"><div class="q-nav"><span>Question '+(qi+1)+' / '+order.length+'</span><span>Score '+score+'</span></div><p class="qo-q">'+esc(q.q)+'</p><div class="ch">'+ch.map(function(c){return '<button>'+esc(c)+'</button>'}).join('')+'</div><div id="qx"></div></div>';
    $$('.ch button',z).forEach(function(b){b.onclick=function(){
      if(z.dataset.done==='1') return; z.dataset.done='1';
      var ok=b.textContent===q.r; if(ok) score++;
      $$('.ch button',z).forEach(function(x){ if(x.textContent===q.r) x.classList.add('ok'); else if(x===b) x.classList.add('ko'); });
      $('#qx').innerHTML='<div class="rep">'+esc(q.x||'')+'</div><div class="q-nav"><span></span><button id="qn">Suivante</button></div>';
      $('#qn').onclick=function(){qi++; z.dataset.done='0'; quiz()};
    }});
  }
  quiz();
})();
(function(){var b=document.querySelectorAll('.tout-rep');b.forEach(function(x){x.addEventListener('click',function(){var d=document.querySelectorAll('details.rq');var open=!Array.prototype.some.call(d,function(e){return e.open});d.forEach(function(e){e.open=open})})})})();
(function(){document.querySelectorAll('.pl-all').forEach(function(b){b.addEventListener('click',function(){var o=b.dataset.open==='1';document.querySelectorAll('#t-cours details').forEach(function(d){d.open=o})})});
document.querySelectorAll('.filtres button').forEach(function(b){b.addEventListener('click',function(){if(b.dataset.f!=='tout'){document.querySelectorAll('#t-cours details.sec, #t-cours details.classe').forEach(function(d){d.open=true})}document.querySelectorAll('#t-cours details.sec').forEach(function(d){d.classList.toggle('hide',b.dataset.f!=='tout'&&!d.querySelector('.mol:not(.hide)'))})})});})();
