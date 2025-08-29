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
$('#awayVal').oninput = e=>{ away = Math.ma
