// Helpers
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const setCSS = (k,v)=> document.documentElement.style.setProperty(k, v);

// Sidebar open/close
$('#openCtl').onclick = ()=> $('#aside').classList.add('open');
$('#closeCtl').onclick = ()=> $('#aside').classList.remove('open');

// Teams / branding
function applyTeamFields(){
  const hn = $('#homeNameInput').value || 'Home';
  const an = $('#awayNameInput').value || 'Away';
  $('#homeName').textContent = hn;
  $('#awayName').textContent = an;
  $('#homeRibbonText').textContent = hn.toUpperCase();
  $('#awayRibbonText').textContent = an.toUpperCase();

  const hc = $('#homeColor').value || '#ff3d5a';
  const ac = $('#awayColor').value || '#19b8ff';
  setCSS('--home', hc);
  setCSS('--away', ac);

  const hL = $('#homeLogoInput').value.trim();
  const aL = $('#awayLogoInput').value.trim();
  if (hL) setCSS('--home-logo', `url('${hL}')`);
  if (aL) setCSS('--away-logo', `url('${aL}')`);

  const bg = $('#bgInput').value.trim();
  if (bg) setCSS('--bg-image', `url('${bg}')`);
}
['#homeNameInput','#awayNameInput','#homeColor','#awayColor','#homeLogoInput','#awayLogoInput','#bgInput']
  .forEach(id => $(id).addEventListener('input', applyTeamFields));

// Scores / fouls / TOL
let home=0, away=0;
function drawScores(){
  $('#homeScore').textContent = String(home).padStart(2,'0');
  $('#awayScore').textContent = String(away).padStart(2,'0');
  $('#homeVal').value = home; $('#awayVal').value = away;
}
$('#homePlus').onclick = ()=>{ home++; drawScores(); };
$('#homeMinus').onclick = ()=>{ home=Math.max(0,home-1); drawScores(); };
$('#awayPlus').onclick = ()=>{ away++; drawScores(); };
$('#awayMinus').onclick = ()=>{ away=Math.max(0,away-1); drawScores(); };
$('#homeVal').oninput = e=>{ home = Math.max(0, Number(e.target.value)||0); drawScores(); };
$('#awayVal').oninput = e=>{ away = Math.max(0, Number(e.target.value)||0); drawScores(); };

function syncFoulsTol(){
  const hf = Math.max(0, +$('#homeFoulInput').value||0);
  const af = Math.max(0, +$('#awayFoulInput').value||0);
  const ht = Math.max(0, +$('#homeTolInput').value||0);
  const at = Math.max(0, +$('#awayTolInput').value||0);
  $('#homeFouls').textContent = hf; $('#awayFouls').textContent = af;
  $('#homeFoulsB').textContent = hf; $('#awayFoulsB').textContent = af;
  $('#homeTol').textContent = ht;   $('#awayTol').textContent = at;
  $('#homeTolB').textContent = ht;  $('#awayTolB').textContent = at;
}
['#homeFoulInput','#awayFoulInput','#homeTolInput','#awayTolInput']
  .forEach(id=> $(id).addEventListener('input', syncFoulsTol));

// Period & possession
let format='Q', period=1, possession='HOME';
function drawPeriod(){
  $('#periodText').textContent = format;
  $('#periodNum').textContent = period;
}
function drawPoss(){
  $('#posText').textContent = possession;
}
$('#formatSel').onchange = e=>{ format = e.target.value; period = 1; drawPeriod(); };
$('#prevPeriod').onclick = ()=>{ period = Math.max(1, period-1); drawPeriod(); };
$('#nextPeriod').onclick = ()=>{ const max = (format==='Q')?4:2; period = (period%max)+1; drawPeriod(); };
$('#posHome').onclick = ()=>{ possession='HOME'; drawPoss(); };
$('#posAway').onclick = ()=>{ possession='AWAY'; drawPoss(); };

// Clock
let running=false, countdown=12*60, lastTs=null, rafId=null, defaultReset=12*60;
function fmt(s){ const m=Math.floor(s/60), x=Math.floor(s%60); return `${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}`; }
function drawClock(){ $('#clock').textContent = fmt(Math.max(0,countdown)); $('#setTime').value = fmt(Math.max(0,countdown)); }
function loop(ts){
  if(!running) return;
  if(lastTs==null) lastTs=ts;
  const d=(ts-lastTs)/1000;
  if(d>0){
    countdown -= d;
    if(countdown<=0){ countdown=0; running=false; $('#startPause').textContent='Start'; }
    drawClock(); lastTs=ts;
  }
  rafId=requestAnimationFrame(loop);
}
$('#applyTime').onclick=()=>{
  const v=$('#setTime').value.trim(); const [mm,ss]=v.split(':').map(Number);
  if(!isNaN(mm)&&!isNaN(ss)){ countdown=mm*60+ss; defaultReset=countdown; drawClock(); }
};
$$('[data-t]').forEach(b=> b.onclick=()=>{ const [m,s]=b.dataset.t.split(':').map(Number); countdown=m*60+s; defaultReset=countdown; drawClock(); });
$('#startPause').onclick=()=>{
  running=!running; $('#startPause').textContent=running?'Pause':'Start';
  if(running){ lastTs=null; rafId=requestAnimationFrame(loop);} else cancelAnimationFrame(rafId);
};
$('#reset').onclick=()=>{ running=false; cancelAnimationFrame(rafId); countdown=defaultReset; $('#startPause').textContent='Start'; drawClock(); };
$('#fullscreen').onclick=()=>{ const de=document.documentElement; if(!document.fullscreenElement) de.requestFullscreen?.(); else document.exitFullscreen?.(); };

// Dots (center row)
let dotsOn=0; const dots=$$('#ptsRow .dot');
function redrawDots(){ dots.forEach((d,i)=> d.classList.toggle('on', i<dotsOn)); }
$('#dotsAdd').onclick=()=>{ dotsOn = (dotsOn+1)%(dots.length+1); redrawDots(); };
$('#dotsClear').onclick=()=>{ dotsOn=0; redrawDots(); };

// Init
applyTeamFields(); drawScores(); syncFoulsTol(); drawPeriod(); drawPoss(); drawClock(); redrawDots();

