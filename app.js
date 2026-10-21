(function(){
  const slides=[...document.querySelectorAll('.slide')];
  const dots=document.getElementById('dots');
  const count=document.getElementById('count');
  const secName=document.getElementById('secName');
  const drawer=document.getElementById('drawer');
  const notesBody=document.getElementById('notesBody');
  const notesBtn=document.getElementById('notesBtn');
  let i=0,b=0;
  const builds=s=>[...s.querySelectorAll('.build')];
  const b2c=document.getElementById('b2cBtn');
  function setBuilds(all){
    const list=builds(slides[i]);
    b=all?list.length:0;
    list.forEach((el,k)=>el.classList.toggle('shown',k<b));
    syncDeck();
    if(b2c)b2c.setAttribute('aria-expanded',document.getElementById('rationale').classList.contains('shown'));
  }
  function reveal(){
    const list=builds(slides[i]);
    if(b<list.length){list[b].classList.add('shown');b++;syncDeck();if(list[b-1].classList.contains('drill'))runDrill(slides[i]);if(b2c)b2c.setAttribute('aria-expanded',document.getElementById('rationale').classList.contains('shown'));return true;}
    return false;
  }
  function next(){ if(!reveal()) go(i+1); }
  function runDrill(sl){
    if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const row=sl.querySelector('.drill-a tr.pick'),box=sl.querySelector('.prow');
    if(!row||!box||!box.animate)return;
    const z=parseFloat(sl.querySelector('.inner').style.zoom)||1;
    const dy=(row.getBoundingClientRect().top-box.getBoundingClientRect().top)/z;
    box.animate([{transform:'translateY('+dy+'px)'},{transform:'translateY(0)'}],{duration:750,delay:120,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'});
  }
  function syncDeck(){
    slides.forEach(sl=>{
      const deck=sl.querySelector('.persona-deck'); if(!deck)return;
      const n=[...sl.querySelectorAll('.build.shown')].length;
      const cards=[...deck.querySelectorAll('.pcard')];
      cards.forEach((c,k)=>{
        if(k<n){c.style.transform='translateX(-120%) rotate(-10deg)';c.style.opacity='0';c.style.zIndex=20;}
        else{const d=k-n;c.style.transform='translate('+(d*16)+'px,'+(d*14)+'px) rotate('+(d*1.8)+'deg) scale('+(1-d*.03)+')';c.style.opacity=d>2?'0':'1';c.style.zIndex=10-d;}
      });
      sl.classList.toggle('table-on',n>=cards.length);
      requestAnimationFrame(fit);
    });
  }
  function unreveal(){
    const list=builds(slides[i]);
    if(b>0){b--;list[b].classList.remove('shown');syncDeck();if(b2c)b2c.setAttribute('aria-expanded',document.getElementById('rationale').classList.contains('shown'));return true;}
    return false;
  }
  function prev(){ if(!unreveal()) go(i-1,true); }
  function fit(){
    const s=slides[i],inn=s.querySelector('.inner');if(!inn)return;
    inn.style.zoom='';
    if(window.innerWidth<601)return;
    const cs=getComputedStyle(s);
    const avail=s.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
    for(let t=0;t<3;t++){
      const need=inn.getBoundingClientRect().height;
      if(need<=avail+1)break;
      const z=(parseFloat(inn.style.zoom)||1)*avail/need;
      inn.style.zoom=Math.max(.5,z*0.99);
    }
  }
  slides.forEach((s,k)=>{
    const b=document.createElement('button');
    b.setAttribute('aria-label','Go to slide '+(k+1)+': '+s.dataset.name);
    b.addEventListener('click',()=>go(k));
    dots.appendChild(b);
  });
  function go(n,showAll){
    const prevI=i;
    i=Math.max(0,Math.min(slides.length-1,n));
    if(prevI===i&&n!==i&&!showAll)return;
    fit();
    slides.forEach((s,k)=>{s.classList.toggle('active',k===i);s.setAttribute('aria-hidden',k!==i);});
    document.body.classList.toggle('dark',slides[i].dataset.tone==='dark');
    document.body.dataset.sec=slides[i].dataset.sec||'';
    [...dots.children].forEach((d,k)=>d.setAttribute('aria-current',k===i));
    count.textContent=(i+1)+' / '+slides.length;
    secName.textContent=slides[i].dataset.name;
    const n2=slides[i].querySelector('.notes');
    notesBody.innerHTML=n2?n2.innerHTML:'<p>No notes.</p>';
    try{history.replaceState(null,'','#s'+(i+1));}catch(e){}
    setBuilds(!!showAll);
    requestAnimationFrame(fit);
  }
  if(b2c)b2c.addEventListener('click',e=>{e.stopPropagation();const r=document.getElementById('rationale');const on=!r.classList.contains('shown');r.classList.toggle('shown',on);b=on?builds(slides[i]).length:0;b2c.setAttribute('aria-expanded',on);});
  document.getElementById('stage').addEventListener('click',e=>{if(e.target.closest('button,a,input'))return;reveal();});
  document.querySelectorAll('.deck-prev').forEach(x=>x.addEventListener('click',e=>{e.stopPropagation();prev();}));
  document.querySelectorAll('.deck-next').forEach(x=>x.addEventListener('click',e=>{e.stopPropagation();next();}));
  window.addEventListener('resize',()=>requestAnimationFrame(fit));
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>fit());
  function toggleNotes(force){
    const open=typeof force==='boolean'?force:!drawer.classList.contains('open');
    drawer.classList.toggle('open',open);
    drawer.setAttribute('aria-hidden',!open);
    notesBtn.setAttribute('aria-expanded',open);
  }
  document.getElementById('prev').onclick=()=>prev();
  document.getElementById('next').onclick=()=>next();
  notesBtn.onclick=()=>toggleNotes();
  document.getElementById('closeNotes').onclick=()=>toggleNotes(false);
  document.addEventListener('keydown',e=>{
    if(e.metaKey||e.ctrlKey||e.altKey)return;
    const k=e.key;
    if(k==='ArrowRight'||k==='ArrowDown'||k==='j'||k===' '||k==='PageDown'){e.preventDefault();next();}
    else if(k==='ArrowLeft'||k==='ArrowUp'||k==='k'||k==='PageUp'){e.preventDefault();prev();}
    else if(k==='Home'){go(0);} else if(k==='End'){go(slides.length-1);}
    else if(k==='n'||k==='N'){toggleNotes();} else if(k==='Escape'){toggleNotes(false);}
  });
  let sx=null,sy=null;
  const stage=document.getElementById('stage');
  stage.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
  stage.addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)){dx<0?next():prev();}sx=null;},{passive:true});
  const m=(location.hash||'').match(/^#s(\d+)$/);
  go(m?parseInt(m[1],10)-1:0);
})();
