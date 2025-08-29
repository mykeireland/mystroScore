// ===== Utilities
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const css = (k, v) => document.documentElement.style.setProperty(k, v);

// Single state source
const state = {
  home: { name:'Sharks', color:'#FDB33A', logo:'', score:0, fouls:0, tol:3 },
  away: { name:'Wolves', color:'#12C8FF', logo:'', score:0, fouls:0, tol:3 },
  bg: 'images/arena.jpg',
  format: 'Q', period: 1, possession: 'HOME',
  countdown: 12*60, running:false
};

// ===== Rendering
function renderBrand(){
  $('#homeRibbonText').textContent = state.home.name.toUpperCase();
  $('#awayRibbonText').textContent = state.away.name.toUpperCase();

  css('--home', state.home.color);
  css('--away', state.away.color);
  css('--home-logo', state.home.logo ? `url('${state.home.logo}')` : 'url("")');
  css('--away-logo', state.away.logo ? `url('${state.away.logo}')` : 'url("")');
  css('--bg-img', `url('${state.bg}')`);
}
function renderBrand(){
  $('#homeRibbonText').textContent = state.home.name.toUpperCase();
  $('#awayRibbonText').textContent = state.away.name.toUpperCase();

  css('--home', state.home.color);
  css('--away', state.away.color);
  css('--bg-img', `url('${state.bg}')`);

  // ⬇️ NEW: actually set the <img> sources from the controls
  const hl = document.getElementById('homeLogo');
  const al = document.getElementById('awayLogo');
  if (hl) {
    const p = (state.home.logo || '').trim();
    if (p) hl.src = p; else hl.removeAttribute('src');   // no broken icon
  }
  if (al) {
    const p = (state.away.logo || '').trim();
    if (p) al.src = p; else al.removeAttribute('src');
  }
}

function renderScores(){
  $('#homeScore').textContent = String(state.home.score).padStart(2,'0');
  $('#awayScore').textContent = String(state.away.score).padStart(2,'0');
}
function renderFoulsTol(){
  $('#homeFoulsBig').textContent = state.home.fouls;
  $('#awayFoulsBig').textContent = state.away.fouls;
  $('#homeTolBig').textContent   = state.home.tol;
  $('#awayTolBig').textContent   = state.away.tol;
}
function renderPeriod(){
  $('#periodNum').textContent = state.period;
}
const fmt = s => { s=Math.max(0,Math.floor(s)); return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; };
function renderClock(){ $('#clock').textContent = fmt(state.countdown); const st=$('#setTime'); if(st && document.activeElement!==st) st.value = fmt(state.countdown); }
function renderAll(){ renderBrand(); renderScores(); renderFoulsTol(); renderPeriod(); renderClock(); }

// ===== Controls (delegated & robust)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if(!btn) return;
  const id = btn.id;

  // Sidebar
  if(id==='openCtl'){ $('#aside').classList.add('open'); return; }
  if(id==='closeCtl'){ $('#aside').classList.remove('open'); return; }

  // Scores
  if(id==='homePlus'){ state.home.score++; renderScores(); return; }
  if(id==='homeMinus'){ state.home.score=Math.max(0,state.home.score-1); renderScores(); return; }
  if(id==='awayPlus'){ state.away.score++; renderScores(); return; }
  if(id==='awayMinus'){ state.away.score=Math.max(0,state.away.score-1); renderScores(); return; }

  // Period / format / possession
  if(id==='prevPeriod'){ state.period=Math.max(1,state.period-1); renderPeriod(); return; }
  if(id==='nextPeriod'){ const max=(state.format==='Q')?4:2; state.period=(state.period%max)+1; renderPeriod(); return; }
  if(id==='posHome'){ state.possession='HOME'; return; }
  if(id==='posAway'){ state.possession='AWAY'; return; }

  // Datasets (time presets)
  if(btn.dataset && btn.dataset.t){
    const [m,s]=btn.dataset.t.split(':').map(n=>+n||0);
    state.countdown=m*60+s; defaultReset=state.countdown; renderClock(); return;
  }

  // Clock
  if(id==='applyTime'){
    const v=$('#setTime').value.trim(); const m=v.match(/^(\d{1,2}):(\d{1,2})$/);
    if(m){ state.countdown=+m[1]*60+Math.min(59,+m[2]); defaultReset=state.countdown; renderClock(); }
    return;
  }
  if(id==='startPause'){
    state.running=!state.running; btn.textContent=state.running?'Pause':'Start';
    if(state.running){ lastTs=null; raf=requestAnimationFrame(tick);} else if(raf){ cancelAnimationFrame(raf); }
    return;
  }
  if(id==='reset'){
    state.running=false; if(raf) cancelAnimationFrame(raf);
    const sp=$('#startPause'); if(sp) sp.textContent='Start';
    state.countdown=defaultReset; renderClock(); return;
  }
  if(id==='fullscreen'){
    const de=document.documentElement;
    if(!document.fullscreenElement) (de.requestFullscreen||de.webkitRequestFullscreen||de.msRequestFullscreen)?.call(de);
    else (document.exitFullscreen||document.webkitExitFullscreen||document.msExitFullscreen)?.call(document);
    return;
  }
});

// Inputs
document.addEventListener('input', (e)=>{
  const el=e.target, id=el.id, v=el.value;
  switch(id){
    case 'homeNameInput': state.home.name=v||'Home'; renderBrand(); break;
    case 'awayNameInput': state.away.name=v||'Away'; renderBrand(); break;
    case 'homeColor':     state.home.color=v||'#FDB33A'; renderBrand(); break;
    case 'awayColor':     state.away.color=v||'#12C8FF'; renderBrand(); break;
    case 'homeLogoInput': state.home.logo=v.trim(); renderBrand(); break;
    case 'awayLogoInput': state.away.logo=v.trim(); renderBrand(); break;
    case 'bgInput':       state.bg=v.trim()||'images/arena.jpg'; renderBrand(); break;

    case 'homeVal':       state.home.score=Math.max(0,+v||0); renderScores(); break;
    case 'awayVal':       state.away.score=Math.max(0,+v||0); renderScores(); break;

    case 'homeFoulInput': state.home.fouls=Math.max(0,+v||0); renderFoulsTol(); break;
    case 'awayFoulInput': state.away.fouls=Math.max(0,+v||0); renderFoulsTol(); break;
    case 'homeTolInput':  state.home.tol=Math.max(0,+v||0);   renderFoulsTol(); break;
    case 'awayTolInput':  state.away.tol=Math.max(0,+v||0);   renderFoulsTol(); break;

    case 'formatSel':     state.format=v; state.period=1; renderPeriod(); break;
    case 'periodNumInput':state.period=Math.max(1,+v||1); renderPeriod(); break;
  }
});

// Clock loop
let lastTs=null, raf=null, defaultReset=state.countdown;
function tick(ts){
  if(!state.running) return;
  if(lastTs==null) lastTs=ts;
  const dt=(ts-lastTs)/1000;
  if(dt>0){
    state.countdown-=dt;
    if(state.countdown<=0){ state.countdown=0; state.running=false; const sp=$('#startPause'); if(sp) sp.textContent='Start'; }
    renderClock(); lastTs=ts;
  }
  raf=requestAnimationFrame(tick);
}

// Init
renderAll();
