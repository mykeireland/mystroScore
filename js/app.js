// ===== Utilities
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const css = (k, v) => document.documentElement.style.setProperty(k, v);

// Single source of truth
const state = {
  home: { name: 'Sharks', color: '#ff3d5a', logo: '', score: 0, fouls: 0, tol: 3 },
  away: { name: 'Wolves', color: '#19b8ff', logo: '', score: 0, fouls: 0, tol: 3 },
  bg: 'images/arena.jpg',
  format: 'Q',
  period: 1,
  possession: 'HOME',
  dots: 0,
  countdown: 12 * 60,
  running: false
};

// ===== Rendering
function renderBrand(){
  $('#homeName').textContent = state.home.name;
  $('#awayName').textContent = state.away.name;
  $('#homeRibbonText').textContent = state.home.name.toUpperCase();
  $('#awayRibbonText').textContent = state.away.name.toUpperCase();

  css('--home', state.home.color);
  css('--away', state.away.color);
  css('--home-logo', state.home.logo ? `url('${state.home.logo}')` : 'url("")');
  css('--away-logo', state.away.logo ? `url('${state.away.logo}')` : 'url("")');
  css('--bg-image', `url('${state.bg}')`);
}
function renderScores(){
  $('#homeScore').textContent = String(state.home.score).padStart(2,'0');
  $('#awayScore').textContent = String(state.away.score).padStart(2,'0');
}
function renderFoulsTol(){
  $('#homeFouls').textContent = state.home.fouls;
  $('#awayFouls').textContent = state.away.fouls;
  $('#homeTol').textContent   = state.home.tol;
  $('#awayTol').textContent   = state.away.tol;
  $('#homeFoulsB').textContent = state.home.fouls;
  $('#awayFoulsB').textContent = state.away.fouls;
  $('#homeTolB').textContent   = state.home.tol;
  $('#awayTolB').textContent   = state.away.tol;
}
function renderPeriod(){
  $('#periodText').textContent = state.format;
  $('#periodNum').textContent  = state.period;
  $('#posText').textContent    = state.possession;
}
const fmt = s => {
  s = Math.max(0, Math.floor(s));
  return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
};
function renderClock(){
  $('#clock').textContent = fmt(state.countdown);
  const st = $('#setTime');
  if (st && document.activeElement !== st) st.value = fmt(state.countdown);
}
function renderDots(){
  const dots = $$('#ptsRow .dot');
  dots.forEach((d,i) => d.classList.toggle('on', i < state.dots));
}
function renderAll(){
  renderBrand(); renderScores(); renderFoulsTol(); renderPeriod(); renderClock(); renderDots();
}

// ===== Controls (event delegation)
const panel = $('#controls');

// Click handlers
panel.addEventListener('click', (e) => {
  const id = e.target.id;

  // Open/close handled outside
  if (id === 'homePlus') { state.home.score++; renderScores(); return; }
  if (id === 'homeMinus'){ state.home.score = Math.max(0, state.home.score-1); renderScores(); return; }
  if (id === 'awayPlus') { state.away.score++; renderScores(); return; }
  if (id === 'awayMinus'){ state.away.score = Math.max(0, state.away.score-1); renderScores(); return; }

  if (id === 'prevPeriod'){ state.period = Math.max(1, state.period-1); renderPeriod(); return; }
  if (id === 'nextPeriod'){ const max = (state.format==='Q')?4:2; state.period = (state.period % max) + 1; renderPeriod(); return; }
  if (id === 'posHome')   { state.possession = 'HOME'; renderPeriod(); return; }
  if (id === 'posAway')   { state.possession = 'AWAY'; renderPeriod(); return; }

  if (id === 'dotsAdd')   { const maxDots=10; state.dots = (state.dots+1)%(maxDots+1); renderDots(); return; }
  if (id === 'dotsClear') { state.dots = 0; renderDots(); return; }

  if (id === 'applyTime'){
    const v = $('#setTime').value.trim();
    const m = v.match(/^(\d{1,2}):(\d{1,2})$/);
    if (m){ state.countdown = (+m[1])*60 + Math.min(59, +m[2]); defaultReset = state.countdown; renderClock(); }
    return;
  }

  if (id === 'startPause'){
    state.running = !state.running;
    e.target.textContent = state.running ? 'Pause' : 'Start';
    if (state.running){ lastTs=null; raf = requestAnimationFrame(tick); }
    else if (raf){ cancelAnimationFrame(raf); }
    return;
  }

  if (id === 'reset'){
    state.running = false; if (raf) cancelAnimationFrame(raf);
    $('#startPause').textContent = 'Start';
    state.countdown = defaultReset; renderClock(); return;
  }

  if (id === 'fullscreen'){
    const de = document.documentElement;
    if (!document.fullscreenElement) (de.requestFullscreen||de.webkitRequestFullscreen||de.msRequestFullscreen).call(de);
    else (document.exitFullscreen||document.webkitExitFullscreen||document.msExitFullscreen).call(document);
    return;
  }

  // Preset time buttons
  if (e.target.dataset && e.target.dataset.t){
    const [mm,ss] = e.target.dataset.t.split(':').map(n=>+n);
    state.countdown = mm*60 + ss; defaultReset = state.countdown; renderClock();
    return;
  }
});

// Input handlers
panel.addEventListener('input', (e) => {
  const id = e.target.id, v = e.target.value;
  if (id === 'homeNameInput'){ state.home.name = v || 'Home'; renderBrand(); return; }
  if (id === 'awayNameInput'){ state.away.name = v || 'Away'; renderBrand(); return; }
  if (id === 'homeColor')    { state.home.color = v || '#ff3d5a'; renderBrand(); return; }
  if (id === 'awayColor')    { state.away.color = v || '#19b8ff'; renderBrand(); return; }
  if (id === 'homeLogoInput'){ state.home.logo = v.trim(); renderBrand(); return; }
  if (id === 'awayLogoInput'){ state.away.logo = v.trim(); renderBrand(); return; }
  if (id === 'bgInput')      { state.bg = v.trim() || 'images/arena.jpg'; renderBrand(); return; }

  if (id === 'homeVal'){ state.home.score = Math.max(0, +v||0); renderScores(); return; }
  if (id === 'awayVal'){ state.away.score = Math.max(0, +v||0); renderScores(); return; }

  if (id === 'homeFoulInput'){ state.home.fouls = Math.max(0, +v||0); renderFoulsTol(); return; }
  if (id === 'awayFoulInput'){ state.away.fouls = Math.max(0, +v||0); renderFoulsTol(); return; }
  if (id === 'homeTolInput') { state.home.tol   = Math.max(0, +v||0); renderFoulsTol(); return; }
  if (id === 'awayTolInput') { state.away.tol   = Math.max(0, +v||0); renderFoulsTol(); return; }

  if (id === 'formatSel'){ state.format = v; state.period = 1; renderPeriod(); return; }
  if (id === 'periodNumInput'){ state.period = Math.max(1, +v||1); renderPeriod(); return; }
});

// Sidebar open/close
$('#openCtl').addEventListener('click', ()=> $('#aside').classList.add('open'));
$('#closeCtl').addEventListener('click', ()=> $('#aside').classList.remove('open'));

// Clock loop
let lastTs=null, raf=null, defaultReset = state.countdown;
function tick(ts){
  if (!state.running) return;
  if (lastTs == null) lastTs = ts;
  const dt = (ts - lastTs) / 1000;
  if (dt > 0){
    state.countdown -= dt;
    if (state.countdown <= 0){
      state.countdown = 0;
      state.running = false;
      const sp = $('#startPause'); if (sp) sp.textContent = 'Start';
    }
    renderClock();
    lastTs = ts;
  }
  raf = requestAnimationFrame(tick);
}

// Initial paint
renderAll();
