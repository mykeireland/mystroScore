// Safe helpers
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const css = (k, v) => document.documentElement.style.setProperty(k, v);
const on  = (el, ev, fn) => el && el.addEventListener(ev, fn);

// ---- Sidebar open/close (guarded)
on($('#openCtl'), 'click', () => $('#aside')?.classList.add('open'));
on($('#closeCtl'), 'click', () => $('#aside')?.classList.remove('open'));

// ---- Branding / theme
function applyTeamFields(){
  const hn = $('#homeNameInput')?.value || 'Home';
  const an = $('#awayNameInput')?.value || 'Away';
  if ($('#homeName'))        $('#homeName').textContent = hn;
  if ($('#awayName'))        $('#awayName').textContent = an;
  if ($('#homeRibbonText'))  $('#homeRibbonText').textContent = hn.toUpperCase();
  if ($('#awayRibbonText'))  $('#awayRibbonText').textContent = an.toUpperCase();

  const hc = $('#homeColor')?.value || '#ff3d5a';
  const ac = $('#awayColor')?.value || '#19b8ff';
  css('--home', hc);
  css('--away', ac);

  const hL = ($('#homeLogoInput')?.value || '').trim();
  const aL = ($('#awayLogoInput')?.value || '').trim();
  if (hL) css('--home-logo', `url('${hL}')`);
  if (aL) css('--away-logo', `url('${aL}')`);

  const bg = ($('#bgInput')?.value || '').trim();
  if (bg) css('--bg-image', `url('${bg}')`);
}
['#homeNameInput','#awayNameInput','#homeColor','#awayColor','#homeLogoInput','#awayLogoInput','#bgInput']
  .forEach(sel => on($(sel), 'input', applyTeamFields));

// ---- Scores / fouls / timeouts
let home=0, away=0;
function drawScores(){
  if ($('#homeScore')) $('#homeScore').textContent = String(home).padStart(2,'0');
  if ($('#awayScore')) $('#awayScore').textContent = String(away).padStart(2,'0');
  if ($('#homeVal'))   $('#homeVal').value = home;
  if ($('#awayVal'))   $('#awayVal').value = away;
}
on($('#homePlus'), 'click', () => { home++; drawScores(); });
on($('#homeMinus'), 'click', () => { home = Math.max(0, home-1); drawScores(); });
on($('#awayPlus'), 'click', () => { away++; drawScores(); });
on($('#awayMinus'), 'click', () => { away = Math.max(0, away-1); drawScores(); });
on($('#homeVal'),  'input', e => { home = Math.max(0, Number(e.target.value)||0); drawScores(); });
on($('#awayVal'),  'input', e => { away = Math.max(0, Number(e.target.value)||0); drawScores(); });

function syncFoulsTol(){
  const hf = Math.max(0, +($('#homeFoulInput')?.value||0));
  const af = Math.max(0, +($('#awayFoulInput')?.value||0));
  const ht = Math.max(0, +($('#homeTolInput')?.value||0));
  const at = Math.max(0, +($('#awayTolInput')?.value||0));
  if ($('#homeFouls'))  $('#homeFouls').textContent  = hf;
  if ($('#awayFouls'))  $('#awayFouls').textContent  = af;
  if ($('#homeTol'))    $('#homeTol').textContent    = ht;
  if ($('#awayTol'))    $('#awayTol').textContent    = at;
  if ($('#homeFoulsB')) $('#homeFoulsB').textContent = hf;
  if ($('#awayFoulsB')) $('#awayFoulsB').textContent = af;
  if ($('#homeTolB'))   $('#homeTolB').textContent   = ht;
  if ($('#awayTolB'))   $('#awayTolB').textContent   = at;
}
['#homeFoulInput','#awayFoulInput','#homeTolInput','#awayTolInput']
  .forEach(sel => on($(sel), 'input', syncFoulsTol));

// ---- Period & possession
let format='Q', period=1, possession='HOME';
function drawPeriod(){ if($('#periodText')) $('#periodText').textContent = format; if($('#periodNum')) $('#periodNum').textContent = period; }
function drawPoss(){ if($('#posText')) $('#posText').textContent = possession; }
on($('#formatSel'), 'change', e => { format = e.target.value; period = 1; drawPeriod(); });
on($('#prevPeriod'), 'click', () => { period = Math.max(1, period-1); drawPeriod(); });
on($('#nextPeriod'), 'click', () => { const max = (format==='Q')?4:2; period = (period%max)+1; drawPeriod(); });
on($('#periodNumInput'), 'input', e => { const v = Math.max(1, +e.target.value||1); period = v; drawPeriod(); });
on($('#posHome'), 'click', () => { possession='HOME'; drawPoss(); });
on($('#posAway'), 'click', () => { possession='AWAY'; drawPoss(); });

// ---- Clock (robust)
let running=false, countdown=12*60, defaultReset=12*60, lastTs=null, rafId=null;
const fmt = s => { s = Math.max(0, Math.floor(s)); const m = Math.floor(s/60); const x = s%60; return `${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}`; };
function drawClock(){ if($('#clock')) $('#clock').textContent = fmt(countdown); if($('#setTime')) $('#setTime').value = fmt(countdown); }
function loop(ts){
  if(!running) return;
  if(lastTs==null) lastTs=ts;
  const d=(ts-lastTs)/1000;
  if(d>0){
    countdown -= d;
    if(countdown<=0){ countdown=0; running=false; const sp=$('#startPause'); if(sp) sp.textContent='Start'; }
    drawClock(); lastTs=ts;
  }
  rafId = requestAnimationFrame(loop);
}
function parseTime(str){
  const m = String(str||'').trim().match(/^(\d{1,2}):(\d{1,2})$/);
  if(!m) return null;
  const mm = Math.max(0, parseInt(m[1],10)); const ss = Math.max(0, Math.min(59, parseInt(m[2],10)));
  return mm*60 + ss;
}
on($('#applyTime'), 'click', () => {
  const seconds = parseTime($('#setTime')?.value);
  if(seconds!=null){ countdown = seconds; defaultReset = seconds; drawClock(); }
});
$$('[data-t]').forEach(btn => on(btn, 'click', () => {
  const [mm,ss] = btn.dataset.t.split(':').map(n=>+n);
  countdown = (mm*60)+ss; defaultReset = countdown; drawClock();
}));
on($('#startPause'), 'click', () => {
  running=!running;
  const sp=$('#startPause'); if(sp) sp.textContent = running ? 'Pause' : 'Start';
  if(running){ lastTs=null; rafId=requestAnimationFrame(loop);} else if(rafId){ cancelAnimationFrame(rafId); }
});
on($('#reset'), 'click', () => {
  running=false; if(rafId) cancelAnimationFrame(rafId);
  const sp=$('#startPause'); if(sp) sp.textContent='Start';
  countdown = defaultReset; drawClock();
});
on($('#fullscreen'), 'click', () => {
  const de = document.documentElement;
  if (!document.fullscreenElement) { (de.requestFullscreen||de.webkitRequestFullscreen||de.msRequestFullscreen)?.call(de); }
  else { (document.exitFullscreen||document.webkitExitFullscreen||document.msExitFullscreen)?.call(document); }
});

// ---- Dots (center indicators)
let dotsOn=0; const dots=$$('#ptsRow .dot');
function redrawDots(){ dots.forEach((d,i)=> d.classList.toggle('on', i<dotsOn)); }
on($('#dotsAdd'), 'click', () => { dotsOn = (dotsOn+1)%(dots.length+1); redrawDots(); });
on($('#dotsClear'), 'click', () => { dotsOn=0; redrawDots(); });

// ---- Initial paint (safe)
(function init(){
  applyTeamFields();
  drawScores();
  syncFoulsTol();
  drawPeriod();
  drawPoss();
  drawClock();
  redrawDots();
})();
