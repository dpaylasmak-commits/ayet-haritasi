/* Ayet Haritası — 6236 ayet, her biri bir nokta */
(() => {
'use strict';
const Q = window.QDATA;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const N = Q.verses.length;
const SUR = Q.surahs;
const COLORS = ['#f2c14e', '#7fb2ff', '#f08a7e', '#6fd6b0', '#c59bff'];
const fmt = n => n.toLocaleString('tr-TR');
/* ---------- tema: tuval renkleri CSS değişkenlerinden okunur ---------- */
const TH = { light: false };
function readTheme() {
  const cs = getComputedStyle(document.documentElement), g = k => cs.getPropertyValue(k).trim();
  TH.light = document.documentElement.dataset.mode === 'light';
  TH.dot = g('--dot') || 'rgb(132,138,166)'; TH.dot2 = g('--dot2') || 'rgb(172,178,204)';
  TH.ink = g('--ink') || '#eceef4'; TH.muted = g('--muted') || '#8e94a7'; TH.accent = g('--accent') || '#e9b949';
  TH.plate = TH.light ? 'rgba(255,253,249,.94)' : 'rgba(19,22,30,.92)'; TH.track = TH.light ? 'rgba(60,45,15,.08)' : 'rgba(255,255,255,.07)';
}
// açık temada parlak vurgu renkleri koyulaştırılır (açık zeminde okunsun)
const tcCache = {};
function tc(c) {
  if (!TH.light || typeof c !== 'string' || c[0] !== '#' || c.length !== 7) return c;
  return tcCache[c] || (tcCache[c] = '#' + [1, 3, 5].map(k => Math.round(parseInt(c.slice(k, k + 2), 16) * 0.74).toString(16).padStart(2, '0')).join(''));
}
readTheme(); window.TH = TH; window.tc = tc;
const MEAL_TTS = false; // Türkçe meal seslendirmesi şimdilik kapalı (yalnız Arapça tilavet)
const LOCAL = !window.ARTIFACT_BUILD; // Claude sayfası sürümünde ses ve URL durumu kapalı; normal sitede açık

/* ---------- veri hazırlığı ---------- */
let off = 0;
SUR.forEach(s => { s.start = off; off += s.c; });
const vS = new Uint8Array(N), vA = new Uint16Array(N), vJuz = new Uint8Array(N), vType = new Uint8Array(N);
const wForm = [], wRoot = [], wLem = [];
const R = Q.roots.length, L = Q.lemmas.length;
const rootOcc = Array.from({ length: R }, () => []), lemOcc = Array.from({ length: L }, () => []);
const AR_DIAC = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
const normAr = s => s.replace(AR_DIAC, '').replace(/[أإآٱٲٳ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/\s+/g, ' ').trim();
const normTr = s => s.toLocaleLowerCase('tr').replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u').replace(/[’‘`´]/g, "'");
const clnTok = [], trN = [];
/* ---------- mealler (Diyanet gömülü, diğerleri istenince yüklenir) ---------- */
const MEALS = [['tr.diyanet', 'Diyanet İşleri', 'Diyanet'], ['tr.vakfi', 'Diyanet Vakfı', 'D. Vakfı'], ['tr.yazir', 'Elmalılı Hamdi Yazır', 'Elmalılı'], ['tr.ates', 'Süleyman Ateş', 'Ateş'],
  ['tr.golpinarli', 'Abdülbaki Gölpınarlı', 'Gölpınarlı'], ['tr.yildirim', 'Suat Yıldırım', 'Yıldırım'], ['tr.bulac', 'Ali Bulaç', 'Bulaç'], ['tr.ozturk', 'Yaşar Nuri Öztürk', 'Öztürk'], ['tr.yuksel', 'Edip Yüksel', 'Yüksel']];
const mealName = id => id === 'all' ? 'Tüm mealler' : (MEALS.find(m => m[0] === id) || [, id])[1];
const mealShort = id => id === 'all' ? 'tüm mealler' : (MEALS.find(m => m[0] === id) || [, , id])[2];
const mealText = {}, mealNorm = {}, mealLoading = {};
function loadMeal(id) {
  if (id === 'all') return Promise.all(MEALS.map(m => loadMeal(m[0])));
  if (mealText[id]) return Promise.resolve();
  return mealLoading[id] || (mealLoading[id] = new Promise((res, rej) => {
    const sc = document.createElement('script'); sc.src = `meal/${id}.js`;
    sc.onload = () => { mealText[id] = window.QMEAL[id]; res(); };
    sc.onerror = () => { delete mealLoading[id]; rej(new Error(id)); };
    document.head.appendChild(sc);
  }));
}
const mealReady = id => id === 'all' ? MEALS.every(m => mealText[m[0]]) : !!mealText[id];
const normOf = id => mealNorm[id] || (mealNorm[id] = mealText[id].map(t => normTr(t)));
for (let i = 0; i < N; i++) {
  const v = Q.verses[i];
  vS[i] = v[0]; vA[i] = v[1]; vJuz[i] = v[5]; vType[i] = SUR[v[0] - 1].t === 'M' ? 1 : 2;
  const ws = v[8] ? v[8].split('~') : [];
  const f = [], r = new Int16Array(ws.length), l = new Int16Array(ws.length);
  ws.forEach((w, k) => {
    const p = w.split('|'); f.push(p[0]); r[k] = +p[1]; l[k] = +p[2];
    if (r[k] >= 0) rootOcc[r[k]].push(i);
    if (l[k] >= 0) lemOcc[l[k]].push(i);
  });
  wForm.push(f); wRoot.push(r); wLem.push(l);
  clnTok.push(normAr(v[3]).split(' '));
  trN.push(normTr(v[4]));
}
mealText['tr.diyanet'] = Q.verses.map(v => v[4]); mealNorm['tr.diyanet'] = trN;
const countDistinct = a => { let c = 0, p = -1; for (const x of a) if (x !== p) { c++; p = x; } return c; };
const rootDf = rootOcc.map(countDistinct), lemDf = lemOcc.map(countDistinct);
const rootNorm = Q.roots.map(normAr), lemNorm = Q.lemmas.map(normAr);
const verseIndex = (s, a) => (s >= 1 && s <= 114 && a >= 1 && a <= SUR[s - 1].c) ? SUR[s - 1].start + a - 1 : -1;
const ref = i => `${vS[i]}:${vA[i]}`;
const sName = i => SUR[vS[i] - 1].tr;

/* ---------- arama terimleri ---------- */
const MATCHES = {
  tr: [['start', 'Kelime başı'], ['exact', 'Tam kelime'], ['part', 'İçinde geçen']],
  ar: [['affix', 'Ekli (و ف ب ل ال)'], ['exact', 'Tam kelime'], ['part', 'İçinde geçen']],
  root: [['root', 'Kök']],
  lemma: [['lemma', 'Lemma']]
};
const state = { mode: 'tr', terms: [], layout: 'grid', chart: false, metric: 'occ', fType: '', fJuz: 0, fSurah: 0 };
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const escHtml = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function trRegex(q, m) {
  const e = esc(normTr(q));
  if (m === 'part') return new RegExp(e, 'gu');
  if (m === 'exact') return new RegExp(`(?<![\\p{L}\\p{N}])${e}(?![\\p{L}\\p{N}])`, 'gu');
  return new RegExp(`(?<![\\p{L}\\p{N}])${e}`, 'gu');
}
function arTest(q, m) {
  q = normAr(q).replace(/\s+/g, '');
  if (m === 'exact') return t => t === q;
  if (m === 'part') return t => t.includes(q);
  const core = q.startsWith('ال') ? q.slice(2) : q;
  const re = q.startsWith('ال')
    ? new RegExp(`^(?:و|ف)?(?:ب|ك)?(?:ال|لل)${esc(core)}$`)
    : new RegExp(`^(?:و|ف)?(?:ب|ل|ك|س)?(?:ال|لل)?${esc(core)}${core.endsWith('ا') ? '' : 'ا?'}$`); // ا? = tenvin elifi (شهرا)
  return t => re.test(t);
}
function findId(list, norm, q) {
  const x = list.indexOf(q); if (x >= 0) return x;
  const n = normAr(q).replace(/\s+/g, '');
  return norm.indexOf(n);
}
function makeTerm(mode, q, match, opts = {}) {
  q = q.trim(); if (!q) return null;
  const counts = new Uint16Array(N);
  let label = q, ar = '', id = -1;
  if (mode === 'tr') {
    const re = trRegex(q, match), meal = opts.meal || 'tr.diyanet';
    const lists = (meal === 'all' ? MEALS.map(m => m[0]) : [meal]).map(normOf);
    // bazı mealler art arda ayetleri tek cümlede çevirip aynı metni her birine yazar: o metni yalnız ilk ayette say
    for (let i = 0; i < N; i++) { let c = 0; for (const L of lists) { if (i && L[i] === L[i - 1] && vS[i] === vS[i - 1]) continue; const m = L[i].match(re); if (m && m.length > c) c = m.length; } counts[i] = c; }
  } else if (mode === 'ar') {
    const t = arTest(q, match); ar = q;
    for (let i = 0; i < N; i++) { let c = 0; for (const w of clnTok[i]) if (t(w)) c++; counts[i] = c; }
    if (opts.notLemma && opts.notLemma.length) { // aynı yazılan farklı kelimeleri morfolojiyle ayıkla (ör. قَلَّ ≠ قُلْ)
      const nl = opts.notLemma.map(normAr), bad = new Set(); lemNorm.forEach((x, k) => { if (nl.includes(x)) bad.add(k); });
      for (let i = 0; i < N; i++) if (counts[i]) wLem[i].forEach((l, k) => { if (bad.has(l) && t(normAr(wForm[i][k])) && counts[i]) counts[i]--; });
    }
  } else if (mode === 'set') { // seçili ayet listesi (Keşifler)
    for (const r of q.split(',')) { const [a, b] = r.split(':').map(Number), i = verseIndex(a, b); if (i >= 0) counts[i] = 1; }
  } else {
    const isRoot = mode === 'root';
    id = isRoot ? findId(Q.roots, rootNorm, q) : findId(Q.lemmas, lemNorm, q);
    if (id < 0) return { error: `"${q}" ${isRoot ? 'kökü' : 'lemması'} bulunamadı. Öneri listesinden seçin.` };
    for (const i of (isRoot ? rootOcc : lemOcc)[id]) counts[i]++;
    ar = isRoot ? Q.roots[id].split('').join(' ') : Q.lemmas[id];
  }
  if (opts.refs) { // ayet listesiyle sınırla ("7:73,7:75") ya da hariç tut ("-2:111,2:135")
    const neg = opts.refs.startsWith('-'), set = new Set(opts.refs.replace(/^-/, '').split(',').map(r => { const [a, b] = r.split(':').map(Number); return verseIndex(a, b); }));
    for (let i = 0; i < N; i++) if (counts[i] && set.has(i) === neg) counts[i] = 0;
  }
  let ver = 0, occ = 0;
  for (let i = 0; i < N; i++) if (counts[i]) { ver++; occ += counts[i]; }
  return { mode, q, match, counts, ver, occ, label, ar, id, notLemma: opts.notLemma || null, refs: opts.refs || '', meal: mode === 'tr' ? (opts.meal || 'tr.diyanet') : '' };
}
const usedColors = () => state.terms.map(t => t.color);
/* son aramalar (bu cihazda) */
const RK = 'ayet-son';
function recentList() { try { const v = JSON.parse(localStorage.getItem(RK) || '[]'); return Array.isArray(v) ? v : []; } catch (_) { return []; } }
function saveRecent(r) {
  const key = x => [x.mode, x.q, x.match, x.meal || ''].join('|');
  const l = [r, ...recentList().filter(x => key(x) !== key(r))].slice(0, 8);
  try { localStorage.setItem(RK, JSON.stringify(l)); } catch (_) {}
}
function addTerm(mode, q, match, opts = {}) {
  if (state.terms.length >= (opts.many ? 30 : 5)) { toast('En fazla 5 kelime karşılaştırılabilir'); return false; }
  if (mode === 'tr' && !opts.meal) opts.meal = 'tr.diyanet';
  if (state.terms.some(t => t.mode === mode && t.q === q && t.match === match && (t.meal || '') === (mode === 'tr' ? opts.meal : ''))) { toast('Bu arama zaten ekli'); return false; }
  const t = makeTerm(mode, q, match, opts);
  if (!t) return false;
  if (t.error) { toast(t.error); return false; }
  if (opts.label) t.label = opts.label;
  t.color = COLORS.find(c => !usedColors().includes(c)) || '#ffffff';
  state.terms.push(t);
  if (!opts.silent && !opts.many && mode !== 'set') saveRecent({ mode, q, match, meal: t.meal, label: opts.label || '' });
  if (state.terms.length > 5) recolor();
  if (!opts.silent) termsChanged();
  return true;
}
const hsl2hex = (h, s, l) => { s /= 100; l /= 100; const f = n => { const k = (n + h / 30) % 12, c = l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(c * 255).toString(16).padStart(2, '0'); }; return '#' + f(0) + f(8) + f(4); };
function recolor() { // 5'ten fazla terimde renk çemberine yay (altından başla)
  const n = state.terms.length;
  state.terms.forEach((t, k) => t.color = n > 5 ? hsl2hex((43 + k * 360 / n) % 360, 78, 70) : COLORS[k]);
}
function removeTerm(k) { state.terms.splice(k, 1); recolor(); termsChanged(); }
function clearTerms() { state.terms = []; computeHits(); }

/* ---------- filtre ---------- */
const passF = new Uint8Array(N).fill(1);
function computeFilter() {
  for (let i = 0; i < N; i++) {
    passF[i] = (!state.fType || (state.fType === 'M' ? vType[i] === 1 : vType[i] === 2)) &&
      (!state.fJuz || vJuz[i] === state.fJuz) && (!state.fSurah || vS[i] === state.fSurah) ? 1 : 0;
  }
  const n = [state.fType, state.fJuz, state.fSurah].filter(Boolean).length, fc = document.getElementById('fCount');
  if (fc) { fc.hidden = !n; fc.textContent = n; fc.parentElement.classList.toggle('on', !!n); }
}
const filterOn = () => state.fType || state.fJuz || state.fSurah;

/* ---------- yerleşimler ---------- */
const COLS = 79;
function layoutPositions(kind) {
  const P = new Float32Array(N * 2);
  if (kind === 'grid') {
    for (let i = 0; i < N; i++) { P[2 * i] = i % COLS; P[2 * i + 1] = Math.floor(i / COLS); }
  } else if (kind === 'flow' || kind === 'rev') {
    const order = kind === 'rev' ? [...SUR].sort((a, b) => a.rev - b.rev) : SUR;
    let x = 0, y = 0;
    const W = kind === 'flow' ? 84 : COLS;
    for (const s of order) {
      if (kind === 'flow' && x > 0) { x++; if (x >= W) { x = 0; y++; } }
      for (let a = 0; a < s.c; a++) {
        const i = s.start + a;
        P[2 * i] = x; P[2 * i + 1] = y;
        if (++x >= W) { x = 0; y++; }
      }
    }
  } else if (kind === 'spiral') {
    const ga = Math.PI * (3 - Math.sqrt(5)), k = 0.56;
    for (let i = 0; i < N; i++) { const r = k * Math.sqrt(i + 0.5), t = i * ga; P[2 * i] = r * Math.cos(t); P[2 * i + 1] = r * Math.sin(t); }
  }
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (let i = 0; i < N; i++) { const x = P[2 * i], y = P[2 * i + 1]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return { P, b: { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 } };
}

/* ---------- çizim motoru ---------- */
const cv = $('#cv'), ctx = cv.getContext('2d'), map = $('#map');
let W = 0, H = 0, DPR = 1;
let cur = layoutPositions('grid'), from = null, layoutT = 1, layoutStart = 0;
const pos = new Float32Array(N * 2); pos.set(cur.P);
const cam = { x: 39, y: 39, s: 8 };
let camAnim = null, needs = true, hover = -1, selected = -1;
let intro = { t0: 0, on: true };
let particles = null, partT = 1, partStart = 0, chartLabels = [], overlay = null;

function resize() {
  const r = map.getBoundingClientRect(); DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = r.width; H = r.height; cv.width = W * DPR; cv.height = H * DPR;
  needs = true;
}
function fitCam(b = cur.b, pad = 0.06) {
  const s = Math.min(W / (b.w + 1), H / (b.h + 1)) * (1 - pad * 2);
  return { x: b.x0 + b.w / 2, y: b.y0 + b.h / 2, s };
}
function tweenCam(to, dur = 700) {
  camAnim = { from: { ...cam }, to, t0: performance.now(), dur }; needs = true;
}
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const w2s = (x, y) => [(x - cam.x) * cam.s + W / 2, (y - cam.y) * cam.s + H / 2];
const s2w = (x, y) => [(x - W / 2) / cam.s + cam.x, (y - H / 2) / cam.s + cam.y];

function setLayout(kind) {
  state.layout = kind;
  $$('#layoutSeg button').forEach(b => b.classList.toggle('on', b.dataset.l === kind));
  from = new Float32Array(pos); cur = layoutPositions(kind);
  layoutT = 0; layoutStart = performance.now();
  tweenCam(fitCam(), 1100);
  if (state.chart) buildChart();
  buildHash(); syncHash();
}

// parlama sprite'ları
const sprites = {};
function sprite(color) {
  if (sprites[color]) return sprites[color];
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, color + 'cc'); gr.addColorStop(.25, color + '55'); gr.addColorStop(1, color + '00');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return (sprites[color] = c);
}

// hücre ızgarası (hover için)
let bucket = new Map();
function buildBuckets() {
  bucket = new Map();
  for (let i = 0; i < N; i++) {
    const k = Math.round(pos[2 * i]) + ',' + Math.round(pos[2 * i + 1]);
    let a = bucket.get(k); if (!a) bucket.set(k, a = []); a.push(i);
  }
}
function pick(sx, sy) {
  const [wx, wy] = s2w(sx, sy);
  const rx = Math.round(wx), ry = Math.round(wy);
  let best = -1, bd = 0.6 * 0.6;
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
    const a = bucket.get((rx + dx) + ',' + (ry + dy)); if (!a) continue;
    for (const i of a) { const d = (pos[2 * i] - wx) ** 2 + (pos[2 * i + 1] - wy) ** 2; if (d < bd) { bd = d; best = i; } }
  }
  return best;
}

// her ayet için eşleşen terimler
let hitTerms = new Array(N).fill(null);
function computeHits() {
  hitTerms = new Array(N).fill(null);
  state.terms.forEach((t, k) => { for (let i = 0; i < N; i++) if (t.counts[i]) (hitTerms[i] || (hitTerms[i] = [])).push(k); });
}

function draw(now) {
  if (typeof syncTouchAction === 'function') syncTouchAction();
  // kamera
  if (camAnim) {
    const t = Math.min(1, (now - camAnim.t0) / camAnim.dur), e = ease(t);
    const f = camAnim.from, to = camAnim.to;
    const ls = Math.log(f.s) + (Math.log(to.s) - Math.log(f.s)) * e;
    cam.s = Math.exp(ls); cam.x = f.x + (to.x - f.x) * e; cam.y = f.y + (to.y - f.y) * e;
    if (t >= 1) camAnim = null;
  }
  // yerleşim geçişi (sıralı, akışkan)
  let moving = false;
  if (layoutT < 1 && from) {
    const el = now - layoutStart, dur = 900, stag = 700;
    let done = true;
    for (let i = 0; i < N; i++) {
      let t = (el - (i / N) * stag) / dur; t = t < 0 ? 0 : t > 1 ? 1 : t; if (t < 1) done = false;
      const e = ease(t);
      pos[2 * i] = from[2 * i] + (cur.P[2 * i] - from[2 * i]) * e;
      pos[2 * i + 1] = from[2 * i + 1] + (cur.P[2 * i + 1] - from[2 * i + 1]) * e;
    }
    moving = true;
    if (done) { layoutT = 1; pos.set(cur.P); buildBuckets(); }
  }
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const s = cam.s, ox = W / 2 - cam.x * s, oy = H / 2 - cam.y * s;
  const r = Math.max(0.6, s * 0.34);
  const anyTerm = state.terms.length > 0;
  const introK = intro.on ? Math.min(1, (now - intro.t0) / 2200) : 1;
  const introN = intro.on ? Math.floor(easeOut(introK) * N) : N;
  if (intro.on) { $('#introCount').textContent = fmt(introN); if (introK >= 1) intro.on = false; }
  const chartOn = state.chart && particles;
  // taban noktalar
  const fOn = filterOn();
  for (let pass = 0; pass < 2; pass++) {
    ctx.fillStyle = pass === 0 ? TH.dot : TH.dot2;
    ctx.beginPath();
    for (let i = 0; i < introN; i++) {
      if ((vS[i] & 1) !== pass) continue;
      if (hitTerms[i] && !chartOn && passF[i]) continue;
      const x = pos[2 * i] * s + ox, y = pos[2 * i + 1] * s + oy;
      if (x < -5 || y < -5 || x > W + 5 || y > H + 5) continue;
      if (r < 1.4) ctx.rect(x - r, y - r, r * 2, r * 2); else { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 6.2832); }
    }
    const base = (chartOn ? 0.08 : anyTerm ? 0.16 : 0.42) * (TH.light ? 1.25 : 1);
    ctx.globalAlpha = fOn ? base * 0.5 : base;
    ctx.fill();
  }
  if (fOn && !chartOn) {
    // filtreye uyanlar biraz daha parlak
    ctx.globalAlpha = anyTerm ? 0.22 : 0.55; ctx.fillStyle = TH.dot2; ctx.beginPath();
    for (let i = 0; i < introN; i++) {
      if (!passF[i] || hitTerms[i]) continue;
      const x = pos[2 * i] * s + ox, y = pos[2 * i + 1] * s + oy;
      if (x < -5 || y < -5 || x > W + 5 || y > H + 5) continue;
      if (r < 1.4) ctx.rect(x - r, y - r, r * 2, r * 2); else { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 6.2832); }
    }
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // eşleşen noktalar
  if (anyTerm && !chartOn) {
    const gs = Math.max(6, s * 2.4);
    ctx.globalCompositeOperation = TH.light ? 'source-over' : 'lighter';
    for (let i = 0; i < introN; i++) {
      const h = hitTerms[i]; if (!h || !passF[i] || h[h.length - 1] >= state.terms.length) continue;
      const x = pos[2 * i] * s + ox, y = pos[2 * i + 1] * s + oy;
      if (x < -20 || y < -20 || x > W + 20 || y > H + 20) continue;
      ctx.globalAlpha = TH.light ? 0.28 : 0.5; ctx.drawImage(sprite(tc(state.terms[h[0]].color)), x - gs / 2, y - gs / 2, gs, gs);
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    for (let i = 0; i < introN; i++) {
      const h = hitTerms[i]; if (!h || !passF[i] || h[h.length - 1] >= state.terms.length) continue;
      const x = pos[2 * i] * s + ox, y = pos[2 * i + 1] * s + oy;
      if (x < -5 || y < -5 || x > W + 5 || y > H + 5) continue;
      const c = state.terms[h[0]].counts[i];
      const rr = r * (1.15 + Math.min(c - 1, 4) * 0.12);
      if (h.length === 1) {
        ctx.fillStyle = tc(state.terms[h[0]].color); ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.2832); ctx.fill();
      } else {
        const seg = 6.2832 / h.length;
        h.forEach((k, j) => { ctx.fillStyle = tc(state.terms[k].color); ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, rr * 1.1, -1.5708 + j * seg, -1.5708 + (j + 1) * seg); ctx.closePath(); ctx.fill(); });
      }
    }
  }
  // grafik parçacıkları
  if (chartOn) {
    const el = now - partStart; let done = true;
    for (let j = 0; j < particles.length; j++) {
      const p = particles[j];
      let t = (el - p.d) / 1000; t = t < 0 ? 0 : t > 1 ? 1 : t; if (t < 1) done = false;
      const e = ease(t);
      const sx = pos[2 * p.i], sy = pos[2 * p.i + 1];
      const wx = sx + (p.tx - sx) * e, wy = sy + (p.ty - sy) * e;
      const x = wx * s + ox, y = wy * s + oy;
      ctx.fillStyle = tc(p.c); ctx.globalAlpha = 0.55 + 0.45 * e;
      ctx.beginPath(); ctx.arc(x, y, r * 1.05, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (done) partT = 1;
    const la = Math.min(1, Math.max(0, (el - 600) / 600));
    ctx.globalAlpha = la; ctx.textAlign = 'center';
    for (const lb of chartLabels) {
      if (lb.txt) {
        const [x, y] = w2s(lb.x, lb.y);
        ctx.fillStyle = lb.c ? tc(lb.c) : TH.ink; ctx.font = `${lb.w || 600} ${Math.max(lb.min || 9, s * lb.fs)}px Inter,sans-serif`;
        ctx.textAlign = lb.al || 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lb.txt, x, y);
        ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center'; continue;
      }
      if (lb.h) {
        const [x, y] = w2s(lb.x, lb.y), [xe] = w2s(lb.xe, lb.y), fs = Math.max(9, Math.min(22, s * 1.9));
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'right'; ctx.fillStyle = tc(lb.c); ctx.font = `600 ${fs * .85}px Inter,sans-serif`; ctx.fillText(lb.name, x, y);
        ctx.textAlign = 'left'; ctx.fillStyle = TH.ink; ctx.font = `600 ${fs * .9}px Inter,sans-serif`; ctx.fillText(fmt(lb.n), xe, y);
        ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center'; continue;
      }
      const [x, y] = w2s(lb.x, lb.y);
      const fs = Math.max(11, Math.min(26, s * 2.2));
      ctx.fillStyle = tc(lb.c); ctx.font = `600 ${fs * 0.62}px Inter,sans-serif`;
      ctx.fillText(lb.name, x, y + fs * 1.0);
      ctx.fillStyle = TH.ink; ctx.font = `600 ${fs * 1.25}px Inter,sans-serif`;
      ctx.fillText(fmt(lb.n), x, y + fs * 2.45);
    }
    if (chartUnit > 1) { ctx.fillStyle = TH.muted; ctx.font = '12px Inter'; const [x, y] = w2s(cur.b.x0 + cur.b.w / 2, cur.b.y0); ctx.fillText(`her nokta = ${chartUnit} ${state.metric === 'occ' ? 'geçiş' : 'ayet'}`, x, y - 8); }
    ctx.globalAlpha = 1; ctx.textAlign = 'start';
    if (!done || la < 1) moving = true;
  }
  if (overlay && overlay(ctx, now, { s, ox, oy, r, W, H })) moving = true;
  // hover / seçili
  for (const [i, col] of [[hover, TH.ink], [selected, TH.accent]]) {
    if (i < 0) continue;
    const [x, y] = w2s(pos[2 * i], pos[2 * i + 1]);
    ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, Math.max(5, r * 2.2), 0, 6.2832); ctx.stroke();
  }
  // dinlenen ayet: nabız atan halka
  if (playI >= 0) {
    const [x, y] = w2s(pos[2 * playI], pos[2 * playI + 1]), ph = (now % 1400) / 1400;
    ctx.fillStyle = TH.accent; ctx.beginPath(); ctx.arc(x, y, Math.max(2.5, r * 1.4), 0, 6.2832); ctx.fill();
    ctx.strokeStyle = TH.accent; ctx.lineWidth = 2; ctx.globalAlpha = 1 - ph; ctx.beginPath(); ctx.arc(x, y, Math.max(6, r * 2.2) + ph * 16, 0, 6.2832); ctx.stroke(); ctx.globalAlpha = 1;
    moving = true;
  }
  needs = moving || camAnim || intro.on;
}
function loop(now) { if (needs) draw(now); requestAnimationFrame(loop); }

/* ---------- grafik (noktaları sütunlarda topla) ---------- */
let chartUnit = 1;
function buildChart() {
  particles = null; chartLabels = [];
  const T = state.terms; if (!T.length) return;
  const b = cur.b, k = T.length;
  const vals = T.map(t => { let v = 0; for (let i = 0; i < N; i++) if (passF[i] && t.counts[i]) v += state.metric === 'occ' ? t.counts[i] : 1; return v; });
  chartBounds = null;
  if (state.shape) { buildShape(T, vals, b); return; }
  if (k > 6) { buildHChart(T, vals, b); return; }
  const gap = Math.max(3, Math.round(b.w * 0.05));
  const bw = Math.max(3, Math.min(14, Math.floor((b.w - gap * (k + 1)) / k)));
  const Hmax = b.h * 0.62;
  const maxV = Math.max(1, ...vals);
  chartUnit = Math.max(1, Math.ceil(maxV / (bw * Hmax)));
  const totalW = k * bw + (k - 1) * gap;
  const x0 = b.x0 + (b.w - totalW) / 2;
  const baseY = b.y0 + b.h * 0.78;
  particles = [];
  T.forEach((t, j) => {
    const bx = x0 + j * (bw + gap);
    let n = 0, acc = 0;
    for (let i = 0; i < N; i++) {
      if (!passF[i] || !t.counts[i]) continue;
      const reps = state.metric === 'occ' ? t.counts[i] : 1;
      for (let q = 0; q < reps; q++) {
        if (acc++ % chartUnit) continue;
        const col = n % bw, row = Math.floor(n / bw);
        particles.push({ i, tx: bx + col, ty: baseY - row, c: t.color, d: (n / Math.max(1, vals[j] / chartUnit)) * 500 + j * 120 });
        n++;
      }
    }
    chartLabels.push({ x: bx + (bw - 1) / 2, y: baseY, name: t.label, n: vals[j], c: t.color });
  });
  partStart = performance.now(); partT = 0; needs = true;
}
// çok terim: yatay çubuklar (her satır 2 nokta kalınlığında)
let chartBounds = null;
function buildHChart(T, vals, b) {
  const thick = 2, pitch = thick + 1.6, labelW = 17;
  const maxV = Math.max(1, ...vals);
  chartUnit = Math.max(1, Math.ceil(maxV / thick / 70));
  const x0 = b.x0 + labelW, y0 = b.y0 + 1;
  particles = [];
  T.forEach((t, j) => {
    let n = 0, acc = 0; const by = y0 + j * pitch;
    for (let i = 0; i < N; i++) {
      if (!passF[i] || !t.counts[i]) continue;
      const reps = state.metric === 'occ' ? t.counts[i] : 1;
      for (let q = 0; q < reps; q++) {
        if (acc++ % chartUnit) continue;
        particles.push({ i, tx: x0 + Math.floor(n / thick), ty: by + (n % thick), c: t.color, d: (n / Math.max(1, vals[j] / chartUnit)) * 450 + j * 45 });
        n++;
      }
    }
    chartLabels.push({ h: true, x: x0 - 1.4, y: by + (thick - 1) / 2, xe: x0 + Math.ceil(n / thick) + 0.8, name: t.label, n: vals[j], c: t.color });
  });
  const len = Math.ceil(maxV / chartUnit / thick);
  chartBounds = { x0: b.x0, y0: y0 - 2, x1: x0 + len + 6, y1: y0 + T.length * pitch + 1 };
  chartBounds.w = chartBounds.x1 - chartBounds.x0; chartBounds.h = chartBounds.y1 - chartBounds.y0;
  tweenCam(fitCam(chartBounds, 0.03), 1000);
  partStart = performance.now(); partT = 0; needs = true;
}
// Keşifler: noktaları özel bir şekle diz (takvim, saat kadranı…). state.shape = (b, n) => ({ pts, labels, bounds })
function buildShape(T, vals, b) {
  const t = T[0], occ = [];
  for (let i = 0; i < N; i++) if (passF[i] && t.counts[i]) for (let q = 0; q < t.counts[i]; q++) occ.push(i);
  const sh = state.shape(b, occ.length);
  chartUnit = 1; particles = [];
  occ.forEach((i, n) => { const p = sh.pts[n]; if (p) particles.push({ i, tx: p[0], ty: p[1], c: p[2] || t.color, d: n / occ.length * 1400 }); });
  chartLabels = sh.labels || [];
  if (sh.bounds) { chartBounds = sh.bounds; tweenCam(fitCam(chartBounds, 0.05), 1000); }
  partStart = performance.now(); partT = 0; needs = true;
}
function setChart(on) {
  state.chart = on && state.terms.length > 0;
  $('#chartBtn').classList.toggle('on', state.chart);
  if (state.chart) buildChart(); else { particles = null; if (chartBounds) { chartBounds = null; tweenCam(fitCam(), 900); } }
  needs = true;
}

/* ---------- arayüz: çipler, istatistik ---------- */
function termsChanged() {
  resN = 25; computeHits(); renderChips(); renderStats(); renderHisto();
  if (state.chart) { if (state.terms.length) buildChart(); else setChart(false); }
  buildHash(); syncHash(); needs = true;
  if (!$('#card').hidden && selected >= 0) renderCard(selected);
  window.dispatchEvent(new CustomEvent('ayet:terms', { detail: { n: state.terms.length } }));
}
const modeName = { tr: 'meal', ar: 'Arapça', root: 'kök', lemma: 'lemma', set: 'seçki' };
function termTitle(t) {
  return (t.mode === 'tr' ? `<b>${escHtml(t.label)}</b>` : t.label !== t.q ? `<b>${escHtml(t.label)}</b> <span class="ar">${escHtml(t.ar)}</span>` : `<span class="ar">${escHtml(t.ar)}</span>`);
}
const TRY = [['sabır'], ['rahmet'], ['Dünya ⚖ Âhiret', ['dünya', 'ahiret']], ['cennet ⚖ cehennem', ['cennet', 'cehennem']]];
// telefonda açıklama kutusu haritayı kapatmasın: haritanın altına taşı
{ const lg = $('#legend'), hn = $('#hint'), mp = $('#map'), mqL = matchMedia('(max-width:600px)');
  const placeL = () => { if (!lg || !mp) return; if (mqL.matches) { if (lg.parentNode === mp) mp.after(lg); if (hn && hn.parentNode === mp) mp.after(hn); } else { if (lg.parentNode !== mp) mp.appendChild(lg); if (hn && hn.parentNode !== mp) mp.appendChild(hn); } };
  placeL(); mqL.addEventListener('change', placeL); }
function renderLegend() {
  const lg = $('#legend'); if (!lg) return;
  const T = state.terms; lg.hidden = !T.length;
  if (!T.length) return;
  lg.innerHTML = T.length > 5 ? `<span><i style="--c:var(--gold)"></i>${T.length} terim · bir nokta = bir ayet</span>`
    : T.map(t => `<span><i style="--c:${t.color}"></i>${escHtml(t.label)} <b>${fmt(state.metric === 'occ' ? t.occ : t.ver)}</b></span>`).join('') + '<small>bir nokta = bir ayet</small>';
}
function renderChips() {
  const el = $('#chips');
  renderLegend();
  const ms = $('#metricSeg'); if (ms) ms.hidden = !state.terms.length;
  if (!state.terms.length) {
    el.classList.remove('many');
    el.innerHTML = '<span class="trylbl">Dene:</span>' + TRY.map(([l, qs], k) => `<button class="chip try" data-try="${k}">${escHtml(l)}</button>`).join('');
    el.querySelectorAll('[data-try]').forEach(b => b.onclick = () => {
      const [, qs] = TRY[+b.dataset.try]; const list = qs || [TRY[+b.dataset.try][0]];
      list.forEach(q => addTerm('tr', q, 'start', { meal: 'tr.diyanet', silent: true, label: q.replace(/^./, c => c.toLocaleUpperCase('tr')) }));
      termsChanged(); window.dispatchEvent(new CustomEvent('ayet:results'));
    });
    return;
  }
  const many = state.terms.length > 6;
  el.classList.toggle('many', many);
  el.innerHTML = state.terms.map((t, k) => `<span class="chip" style="--c:${t.color}">${many ? `<b>${escHtml(t.label)}</b>` : termTitle(t)} <small>${many ? '' : (t.mode === 'tr' ? mealShort(t.meal) : modeName[t.mode]) + ' · '}${fmt(state.metric === 'occ' ? t.occ : t.ver)}</small><button data-k="${k}" aria-label="Kaldır">✕</button></span>`).join('')
    + (state.terms.length > 1 ? `<button class="ghost small" id="clearAll">Tümünü temizle</button>` : '');
  el.querySelectorAll('button[data-k]').forEach(b => b.onclick = () => removeTerm(+b.dataset.k));
  const ca = $('#clearAll'); if (ca) ca.onclick = () => { clearTerms(); termsChanged(); };
}
function termStats(t) {
  let ver = 0, occ = 0, mk = 0, md = 0; const per = new Uint32Array(115); let first = -1, last = -1;
  for (let i = 0; i < N; i++) {
    const c = t.counts[i]; if (!c || !passF[i]) continue;
    ver++; occ += c; per[vS[i]] += c; if (vType[i] === 1) mk += c; else md += c;
    if (first < 0) first = i; last = i;
  }
  const tops = [...per.keys()].filter(s => per[s]).sort((a, b) => per[b] - per[a]).slice(0, 4);
  let surahs = 0; for (let s = 1; s <= 114; s++) if (per[s]) surahs++;
  return { ver, occ, mk, md, per, tops, first, last, surahs };
}
function balanceSVG(a, b, ca, cb) {
  const m = Math.max(a, b, 1), ang = Math.max(-16, Math.min(16, (b - a) / m * 30));
  return `<svg class="balance" viewBox="0 0 300 150" width="300" height="150" aria-hidden="true">
    <line x1="150" y1="28" x2="150" y2="138" stroke="#ecebf7" stroke-width="2"/><line x1="105" y1="138" x2="195" y2="138" stroke="#ecebf7" stroke-width="2"/>
    <g style="transform-origin:150px 28px;transform:rotate(${ang}deg);transition:transform 1.2s cubic-bezier(.3,1.6,.5,1)">
      <line x1="40" y1="28" x2="260" y2="28" stroke="#ecebf7" stroke-width="2"/>
      <g style="transform-origin:40px 28px;transform:rotate(${-ang}deg);transition:transform 1.2s cubic-bezier(.3,1.6,.5,1)"><path d="M40 28 L12 92 M40 28 L68 92" stroke="${ca}" stroke-width="1.2" opacity=".8"/><path d="M8 92 h64 a32 10 0 0 1 -64 0z" fill="${ca}"/></g>
      <g style="transform-origin:260px 28px;transform:rotate(${-ang}deg);transition:transform 1.2s cubic-bezier(.3,1.6,.5,1)"><path d="M260 28 L232 92 M260 28 L288 92" stroke="${cb}" stroke-width="1.2" opacity=".8"/><path d="M228 92 h64 a32 10 0 0 1 -64 0z" fill="${cb}"/></g>
    </g><circle cx="150" cy="28" r="5" fill="#e9c46a"/></svg>`;
}
function renderStats() {
  queueMicrotask(() => window.dispatchEvent(new Event('ayet:stats')));
  const el = $('#stats');
  const fl = filterOn() ? `<div class="small muted">Filtre açık: ${[state.fType && (state.fType === 'M' ? 'Mekkî' : 'Medenî'), state.fJuz && state.fJuz + '. cüz', state.fSurah && SUR[state.fSurah - 1].tr + ' sûresi'].filter(Boolean).join(' · ')}</div>` : '';
  if (!state.terms.length) {
    let nv = 0; for (let i = 0; i < N; i++) nv += passF[i];
    el.innerHTML = `<div class="empty"><h3>Bütün Kur'an, tek ekranda</h3><div class="big">${fmt(nv)}</div><p class="muted">nokta · her nokta bir ayet</p>${fl}
    <p>Yukarıya bir kelime yazın; geçtiği ayetler yanar. İkinci bir kelime ekleyerek karşılaştırın, <b>Grafik</b> ile noktaları sütunlarda toplayın.</p>
    <p class="small muted">114 sûre · ${fmt(Q.lemmas.length)} lemma · ${fmt(Q.roots.length)} kök · ${fmt(wForm.reduce((a, w) => a + w.length, 0))} kelime</p></div>`;
    const rc = recentList();
    if (rc.length) {
      el.insertAdjacentHTML('beforeend', `<div class="recent"><div class="rch"><h4>Son aramalarınız</h4><button class="ghost small" id="rcClear">Temizle</button></div><div class="rcl">${rc.map((r, k) => `<button data-k="${k}">${escHtml(r.label || r.q)}<small>${r.mode === 'tr' ? mealShort(r.meal) : modeName[r.mode]}</small></button>`).join('')}</div></div>`);
      el.querySelectorAll('.rcl button').forEach(b => b.onclick = () => { const r = rc[+b.dataset.k]; addTerm(r.mode, r.q, r.match, { meal: r.meal, ...(r.label ? { label: r.label } : {}) }); });
      el.querySelector('#rcClear').onclick = () => { try { localStorage.removeItem(RK); } catch (_) {} renderStats(); };
    }
    return;
  }
  const m = state.metric, ST = state.terms.map(termStats);
  let html = `<h3>Sonuçlar</h3>${fl}`;
  if (state.terms.length === 2) {
    const [a, b] = ST.map(s => m === 'occ' ? s.occ : s.ver);
    html += balanceSVG(a, b, state.terms[0].color, state.terms[1].color);
    html += `<div class="eq"><span style="color:${state.terms[0].color}">${fmt(a)}</span> ${a === b ? '=' : a > b ? '>' : '<'} <span style="color:${state.terms[1].color}">${fmt(b)}</span></div>`;
  }
  if (state.terms.length > 6) {
    const mx = Math.max(1, ...ST.map(x => m === 'occ' ? x.occ : x.ver));
    const sum = ST.reduce((a, x) => a + (m === 'occ' ? x.occ : x.ver), 0);
    html += `<div class="sub muted small">${state.terms.length} terim · toplam ${fmt(sum)} ${m === 'occ' ? 'geçiş' : 'ayet'}</div><ol class="mini">` + state.terms.map((t, k) => {
      const v = m === 'occ' ? ST[k].occ : ST[k].ver;
      return `<li style="--c:${t.color}"><span class="nm">${escHtml(t.label)}${t.ar ? ` <span class="ar">${escHtml(t.ar)}</span>` : ''}</span><i style="width:${v / mx * 100}%"></i><b>${fmt(v)}</b></li>`;
    }).join('') + '</ol>';
    el.innerHTML = html; return;
  }
  state.terms.forEach((t, k) => {
    const s = ST[k], tot = s.mk + s.md || 1;
    html += `<div class="term" style="--c:${t.color}">
      <div class="head"><div class="name">${t.mode === 'tr' || t.label !== t.q ? escHtml(t.label) : ''}${t.ar ? `<span class="ar">${escHtml(t.ar)}</span>` : ''}</div><div class="n">${fmt(m === 'occ' ? s.occ : s.ver)}</div></div>
      <div class="sub">${fmt(s.occ)} geçiş · ${fmt(s.ver)} ayet · ${s.surahs} sûre · ${t.mode === 'tr' ? mealName(t.meal) + ' meali' : modeName[t.mode]}</div>
      <div class="bar" title="Mekkî / Medenî"><i style="width:${s.mk / tot * 100}%;background:${t.color}"></i><i style="width:${s.md / tot * 100}%;background:${t.color};opacity:.4"></i></div>
      <div class="sub">Mekkî %${Math.round(s.mk / tot * 100)} · Medenî %${Math.round(s.md / tot * 100)}${s.first >= 0 ? ` · ilk: <a href="#" data-v="${s.first}">${ref(s.first)}</a> · son: <a href="#" data-v="${s.last}">${ref(s.last)}</a>` : ''}</div>
      <div class="tops">${s.tops.map(x => `<button data-s="${x}">${SUR[x - 1].tr} ${s.per[x]}</button>`).join('')}</div>
    </div>`;
  });
  el.innerHTML = html + resultList();
  el.querySelectorAll('a[data-v]').forEach(a => a.onclick = e => { e.preventDefault(); openVerse(+a.dataset.v); });
  el.querySelectorAll('button[data-s]').forEach(b => b.onclick = () => focusSurah(+b.dataset.s));
  bindResults(el);
}
/* sonuç listesi: haritadaki noktaların okunabilir karşılığı */
let resN = 25;
let resSort = 'mushaf';
function resultIds() {
  const out = [];
  for (let i = 0; i < N; i++) if (passF[i] && hitTerms[i]) out.push(i);
  if (resSort === 'rev') out.sort((a, b) => SUR[vS[a] - 1].rev - SUR[vS[b] - 1].rev || a - b);
  return out;
}
// birleşik çevrilmiş ayet grubunun son ayeti (meal metni aynı kalan ardışık ayetler)
const grpEnd = (mid, i) => { const T = mealText[mid]; if (!T) return i; let j = i; while (j + 1 < N && vS[j + 1] === vS[i] && T[j + 1] === T[i]) j++; return j; };
function resultList() {
  const ids = resultIds(); if (!ids.length) return '<div class="reslist"><h4>Ayetler</h4><p class="muted small">Bu aramayla eşleşen ayet yok.</p></div>';
  const trT = state.terms.find(t => t.mode === 'tr' && mealText[t.meal]);
  const mid = trT ? trT.meal : (mealText[state.cardMeal] ? state.cardMeal : 'tr.diyanet');
  const items = ids.slice(0, resN).map(i => `<li data-i="${i}" tabindex="0"><div class="rh"><span class="dots">${hitTerms[i].slice(0, 5).map(k => `<i style="--c:${state.terms[k].color}"></i>`).join('')}</span><b>${SUR[vS[i] - 1].tr} ${vA[i]}${grpEnd(mid, i) > i ? '–' + vA[grpEnd(mid, i)] : ''}</b><span class="muted">${ref(i)}${grpEnd(mid, i) > i ? '–' + vA[grpEnd(mid, i)] : ''}</span></div><p>${i && hitTerms[i - 1] && passF[i - 1] && vS[i] === vS[i - 1] && mealText[mid][i] === mealText[mid][i - 1] ? `<span class="muted small">${mealName(mid)} meali bu ayeti bir önceki ayetle birlikte çeviriyor.</span>` : highlightTr(mealText[mid][i], i, mid)}</p></li>`).join('');
  const tools = `<div class="restools"><div class="seg small" role="group" aria-label="Sıralama"><button data-sort="mushaf" class="${resSort === 'mushaf' ? 'on' : ''}" title="Mushaftaki sırayla">Mushaf</button><button data-sort="rev" class="${resSort === 'rev' ? 'on' : ''}" title="Sûrelerin iniş (nüzul) sırasıyla">Nüzul</button></div><span class="spacer"></span><button class="ghost small" id="resPlay" title="Bulunan ayetleri sırayla dinle"><svg class="i"><use href="#i-play"/></svg>Dinle</button><button class="ghost small" id="resCopy" title="Bulunan ayetleri mealleriyle kopyala"><svg class="i"><use href="#i-copy"/></svg>Kopyala</button></div>`;
  return `<div class="reslist"><h4>Ayetler <span class="muted">${fmt(ids.length)}</span></h4>${tools}<ol>${items}</ol>${ids.length > resN ? `<button class="ghost small" id="resMore">${fmt(Math.min(25, ids.length - resN))} ayet daha göster</button>` : ''}</div>`;
}
function bindResults(el) {
  el.querySelectorAll('.reslist li').forEach(li => {
    const i = +li.dataset.i;
    li.onmouseenter = li.onfocus = () => { hover = i; needs = true; };
    li.onmouseleave = li.onblur = () => { if (hover === i) { hover = -1; needs = true; } };
    li.onclick = () => openVerse(i);
    li.onkeydown = e => { if (e.key === 'Enter') openVerse(i); };
  });
  const more = el.querySelector('#resMore'); if (more) more.onclick = () => { resN += 25; renderStats(); };
  el.querySelectorAll('[data-sort]').forEach(b => b.onclick = () => { resSort = b.dataset.sort; resN = 25; renderStats(); });
  const pl = el.querySelector('#resPlay'); if (pl) pl.onclick = () => { if (window.DINLE) { window.DINLE.setList(resultIds()); window.dispatchEvent(new CustomEvent('ayet:tab', { detail: 'dinle' })); } };
  const cp = el.querySelector('#resCopy'); if (cp) cp.onclick = () => {
    const ids = resultIds(), trT = state.terms.find(t => t.mode === 'tr' && mealText[t.meal]), mid = trT ? trT.meal : (mealText[state.cardMeal] ? state.cardMeal : 'tr.diyanet');
    const inR = new Set(ids), T = mealText[mid], lines = [];
    for (const i of ids) { const e = grpEnd(mid, i); if (i && inR.has(i - 1) && vS[i] === vS[i - 1] && T[i] === T[i - 1]) continue; lines.push(`${SUR[vS[i] - 1].tr} ${vA[i]}${e > i ? '–' + vA[e] : ''} (${ref(i)}${e > i ? '–' + vA[e] : ''}): ${mealText[mid][i]}`); }
    const head = state.terms.map(t => t.label).join(' · ') + ` · ${fmt(ids.length)} ayet · ${mealName(mid)} meali`;
    navigator.clipboard.writeText(head + '\n\n' + lines.join('\n\n') + '\n\nAyet Haritası · ' + location.href).then(() => toast(`${fmt(lines.length)} ayet kopyalandı`), () => toast('Kopyalanamadı'));
  };
}

/* ---------- sûre dağılımı ---------- */
const hc = $('#hist'), hx = hc.getContext('2d');
let histBars = [];
function renderHisto() {
  const r = hc.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
  hc.width = r.width * d; hc.height = r.height * d; hx.setTransform(d, 0, 0, d, 0, 0);
  const w = r.width, h = r.height; hx.clearRect(0, 0, w, h);
  const T = state.terms, bw = w / 114;
  const per = T.map(t => { const a = new Uint32Array(115); for (let i = 0; i < N; i++) if (t.counts[i]) a[vS[i]] += state.metric === 'occ' ? t.counts[i] : 1; return a; });
  let max = 1;
  for (let s = 1; s <= 114; s++) { const v = T.length ? per.reduce((a, p) => a + p[s], 0) : SUR[s - 1].c; if (v > max) max = v; }
  histBars = [];
  for (let s = 1; s <= 114; s++) {
    const x = (s - 1) * bw; let y = h - 2;
    const sel = state.fSurah === s;
    if (!T.length) {
      const bh = Math.max(1, (SUR[s - 1].c / max) * (h - 6));
      hx.fillStyle = SUR[s - 1].t === 'M' ? TH.dot : TH.accent; hx.globalAlpha = SUR[s - 1].t === 'M' ? .6 : .75;
      hx.fillRect(x + .5, y - bh, Math.max(1, bw - 1), bh); hx.globalAlpha = 1;
    } else {
      T.forEach((t, k) => { const v = per[k][s]; if (!v) return; const bh = Math.max(1.5, v / max * (h - 6)); hx.fillStyle = tc(t.color); hx.fillRect(x + .5, y - bh, Math.max(1, bw - 1), bh); y -= bh; });
      hx.fillStyle = TH.track; hx.fillRect(x + .5, h - 2, Math.max(1, bw - 1), 2);
    }
    if (sel) { hx.strokeStyle = TH.accent; hx.strokeRect(x, 0.5, bw, h - 1); }
    histBars.push({ s, x, w: bw, v: T.length ? per.map(p => p[s]) : [SUR[s - 1].c] });
  }
  $('#histoInfo').textContent = T.length ? 'renkli: bulunan · tıklayın: sûreye odaklan' : `yükseklik: ayet sayısı · gri Mekkî, ${TH.light ? 'yeşil' : 'altın'} Medenî`;
}
function histHover(e) {
  const r = hc.getBoundingClientRect(), s = Math.min(114, Math.max(1, Math.floor((e.clientX - r.left) / (r.width / 114)) + 1));
  const b = histBars[s - 1]; if (!b) return;
  const S = SUR[s - 1];
  const vals = state.terms.length ? state.terms.map((t, k) => `<span style="color:${t.color}">${escHtml(t.label === t.q && t.ar ? t.ar : t.label)}: ${b.v[k]}</span>`).join(' · ') : `${S.c} ayet`;
  showTip(`<b>${s}. ${S.tr}</b> <span class="muted">${S.t === 'M' ? 'Mekkî' : 'Medenî'} · nüzul ${S.rev}.</span><br>${vals}`, e.clientX - map.getBoundingClientRect().left, map.getBoundingClientRect().height - 4, true);
}

/* ---------- ipucu ---------- */
const tip = $('#tip');
function showTip(html, x, y, above) {
  tip.innerHTML = html; tip.hidden = false;
  const tw = tip.offsetWidth, th = tip.offsetHeight;
  let lx = Math.min(W - tw - 6, Math.max(6, x + 14)), ly = above ? y - th - 8 : y + 16;
  if (ly + th > H - 6) ly = y - th - 12;
  tip.style.left = lx + 'px'; tip.style.top = Math.max(6, ly) + 'px';
}
function verseTip(i, x, y) {
  const v = Q.verses[i]; const S = SUR[vS[i] - 1];
  const hits = hitTerms[i] ? hitTerms[i].map(k => `<span style="color:${state.terms[k].color}">● ${state.terms[k].counts[i]}×</span>`).join(' ') : '';
  const mt = (mealText[state.cardMeal] || mealText['tr.diyanet'])[i];
  const tr = mt.length > 160 ? mt.slice(0, 160) + '…' : mt;
  showTip(`<b>${S.tr} ${vA[i]}</b> <span class="muted">${ref(i)} · ${vJuz[i]}. cüz</span> ${hits}<div class="ar">${escHtml(v[2].length > 90 ? v[2].slice(0, 90) + '…' : v[2])}</div>${escHtml(tr)}`, x, y);
}

/* ---------- etkileşim: kaydır, yakınlaş, tıkla ---------- */
const ptrs = new Map(); let drag = null, pinch = null;
let engaged = false; // haritaya tıklandıktan sonra tekerlek yakınlaştırır; çıkınca sayfa kaydırılır
const TOUCH = matchMedia('(pointer:coarse)').matches;
cv.addEventListener('pointerdown', e => {
  engaged = true;
  try { cv.setPointerCapture(e.pointerId); } catch (_) {} ptrs.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
  if (ptrs.size === 1) drag = { x: e.offsetX, y: e.offsetY, cx: cam.x, cy: cam.y, moved: false };
  if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: cam.s }; drag = null; }
  camAnim = null;
});
cv.addEventListener('pointermove', e => {
  if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
  if (pinch && ptrs.size === 2) {
    const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
    zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, pinch.s * d / pinch.d / cam.s); return;
  }
  if (drag) {
    const dx = e.offsetX - drag.x, dy = e.offsetY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) { drag.moved = true; map.classList.add('grab'); }
    if (drag.moved) { cam.x = drag.cx - dx / cam.s; cam.y = drag.cy - dy / cam.s; needs = true; tip.hidden = true; return; }
  }
  const i = pick(e.offsetX, e.offsetY);
  if (i !== hover) { hover = i; needs = true; }
  if (i >= 0 && !(state.chart && particles)) verseTip(i, e.offsetX, e.offsetY); else tip.hidden = true;
});
const endPtr = e => {
  ptrs.delete(e.pointerId); map.classList.remove('grab');
  if (ptrs.size < 2) pinch = null;
  if (drag && !drag.moved && e.type === 'pointerup') {
    const i = pick(e.offsetX, e.offsetY);
    // dokunmatikte noktalar parmaktan küçükse önce oraya yakınlaş, ikinci dokunuşta ayet açılsın
    if (e.pointerType === 'touch' && cam.s < 11 && !(state.chart && particles)) {
      const [wx, wy] = s2w(e.offsetX, e.offsetY); tweenCam({ x: wx, y: wy, s: Math.min(fitCam().s * 40, Math.max(16, cam.s * 3.2)) }, 550);
    } else if (i >= 0) openVerse(i);
  }
  drag = null;
};
cv.addEventListener('pointerup', endPtr); cv.addEventListener('pointercancel', endPtr);
cv.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') engaged = false; hover = -1; tip.hidden = true; needs = true; });
function zoomAt(sx, sy, f) {
  const [wx, wy] = s2w(sx, sy);
  const fit = fitCam();
  cam.s = Math.max(fit.s * 0.6, Math.min(fit.s * 40, cam.s * f));
  cam.x = wx - (sx - W / 2) / cam.s; cam.y = wy - (sy - H / 2) / cam.s; needs = true;
}
const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
let wheelHintT = 0;
cv.addEventListener('wheel', e => {
  if (!(e.ctrlKey || e.metaKey || engaged)) { // sayfa kaydırılıyor: haritayı rahat bırak, nasıl yakınlaşılacağını göster
    const now = performance.now();
    if (now - wheelHintT > 2500) { wheelHintT = now; flashHint(`Yakınlaştırmak için ${isMac ? '⌘' : 'Ctrl'} + tekerlek · ya da haritaya bir kez tıklayın`); }
    return;
  }
  e.preventDefault(); camAnim = null; const dy = Math.max(-60, Math.min(60, e.deltaMode ? e.deltaY * 20 : e.deltaY));
  zoomAt(e.offsetX, e.offsetY, Math.exp(-dy * (e.ctrlKey ? 0.006 : 0.003)));
}, { passive: false });
document.addEventListener('scroll', () => { engaged = false; }, { passive: true });
const hintEl = $('#hint'); let hintTo = 0;
function flashHint(txt, ms = 2200) { hintEl.textContent = txt; hintEl.style.opacity = 1; clearTimeout(hintTo); hintTo = setTimeout(() => hintEl.style.opacity = 0, ms); }
// dokunmatik: genel görünümde tek parmak sayfayı kaydırır, yakınlaşınca haritayı gezdirir
let lastTA = '';
function syncTouchAction() {
  const ta = cam.s > fitCam().s * 1.08 || (camAnim && camAnim.to.s > fitCam().s * 1.08) ? 'none' : 'pan-y';
  if (ta !== lastTA) { lastTA = ta; map.style.touchAction = ta; map.classList.toggle('zoomed', ta === 'none'); }
}
/* harita üstü yakınlaştırma düğmeleri */
const zc = document.createElement('div'); zc.className = 'zoomctl';
zc.innerHTML = '<button data-z="in" aria-label="Yakınlaş" title="Yakınlaş (+)">+</button><button data-z="out" aria-label="Uzaklaş" title="Uzaklaş (−)">−</button><button data-z="fit" aria-label="Tümünü gör" title="Tümünü gör (0)">⤢</button>';
map.appendChild(zc);
zc.onclick = e => { const z = e.target.closest('button')?.dataset.z; if (!z) return; camAnim = null;
  if (z === 'fit') tweenCam(fitCam(), 600); else { const f = z === 'in' ? 1.8 : 1 / 1.8, fit = fitCam(); tweenCam({ x: cam.x, y: cam.y, s: Math.max(fit.s * .6, Math.min(fit.s * 40, cam.s * f)) }, 350); } };
zc.addEventListener('pointerdown', e => e.stopPropagation());
hc.addEventListener('mousemove', histHover);
hc.addEventListener('mouseleave', () => tip.hidden = true);
hc.addEventListener('click', e => {
  const r = hc.getBoundingClientRect(); const s = Math.min(114, Math.max(1, Math.floor((e.clientX - r.left) / (r.width / 114)) + 1));
  focusSurah(state.fSurah === s ? 0 : s);
});

function focusSurah(s) {
  state.fSurah = s; $('#fSurah').value = s; computeFilter(); renderStats(); renderHisto();
  if (state.chart) buildChart();
  if (s) {
    const S = SUR[s - 1]; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (let i = S.start; i < S.start + S.c; i++) { const x = cur.P[2 * i], y = cur.P[2 * i + 1]; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const b = { x0, y0, x1, y1, w: Math.max(x1 - x0, 8), h: Math.max(y1 - y0, 8) };
    b.x0 = (x0 + x1) / 2 - b.w / 2; b.y0 = (y0 + y1) / 2 - b.h / 2;
    if (!state.chart) tweenCam(fitCam(b, 0.12), 900);
  } else tweenCam(fitCam(), 900);
  needs = true; buildHash(); syncHash();
}

/* ---------- ayet kartı (yakınlaşma animasyonu) ---------- */
const card = $('#card'), veil = $('#veil');
let camBefore = null, audio = null, playI = -1;
// geniş ekranda kart harita sütununa yerleşir; sağdaki açıklama paneli görünür ve kullanılabilir kalır
function placeCard() {
  const side = $('.side');
  if (innerWidth > 980 && side) {
    const r = $('.mapwrap').getBoundingClientRect(), sr = side.getBoundingClientRect();
    card.style.left = (r.left + r.width / 2) + 'px'; card.style.width = Math.min(760, r.width - 16) + 'px';
    veil.style.right = Math.max(0, innerWidth - sr.left + 9) + 'px'; card.classList.add('docked'); veil.classList.add('docked');
  } else { card.style.left = card.style.width = veil.style.right = ''; card.classList.remove('docked'); veil.classList.remove('docked'); }
}
window.addEventListener('resize', () => { if (!card.hidden) placeCard(); });
function openVerse(i, opts = {}) {
  if (i < 0 || i >= N) return;
  const wasOpen = !card.hidden;
  selected = i; renderCard(i);
  if (state.chart) setChart(false);
  const tx = pos[2 * i], ty = pos[2 * i + 1];
  if (!wasOpen) {
    camBefore = { ...cam };
    const [sx, sy] = w2s(tx, ty);
    const mr = map.getBoundingClientRect();
    const fx = mr.left + sx, fy = mr.top + sy;
    tweenCam({ x: tx, y: ty, s: Math.max(cam.s * 4, fitCam().s * 9) }, 750);
    placeCard(); veil.hidden = false; card.hidden = false;
    const cr = card.getBoundingClientRect();
    const dx = fx - (cr.left + cr.width / 2), dy = fy - (cr.top + cr.height / 2);
    veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: 'both' });
    card.animate([
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.01)`, opacity: 0, borderRadius: '50%' },
      { transform: `translate(calc(-50% + ${dx * .3}px), calc(-50% + ${dy * .3}px)) scale(.35)`, opacity: 1, offset: .45, borderRadius: '40%' },
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1, borderRadius: '22px' }
    ], { duration: opts.fast ? 300 : 820, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'none' });
    $('#closeBtn').focus({ preventScroll: true });
  } else {
    tweenCam({ x: tx, y: ty, s: cam.s }, 450);
    const b = $('.card-b');
    b.animate([{ opacity: .2, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' });
  }
  needs = true; buildHash(); syncHash();
  if (playing) { if (opts.auto) playVerse(); else stopAudio(); }
}
function closeVerse() {
  if (card.hidden) return;
  const i = selected; stopAudio();
  const mr = map.getBoundingClientRect();
  if (camBefore) tweenCam(camBefore, 700);
  const [sx, sy] = camBefore ? [(pos[2 * i] - camBefore.x) * camBefore.s + W / 2, (pos[2 * i + 1] - camBefore.y) * camBefore.s + H / 2] : [W / 2, H / 2];
  const cr = card.getBoundingClientRect();
  const dx = mr.left + sx - (cr.left + cr.width / 2), dy = mr.top + sy - (cr.top + cr.height / 2);
  veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, fill: 'both' });
  card.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.01)`, opacity: 0, borderRadius: '50%' }], { duration: 520, easing: 'cubic-bezier(.6,0,.8,.4)' })
    .onfinish = () => { card.hidden = true; veil.hidden = true; };
  selected = -1; needs = true; buildHash(); syncHash();
}
function highlightTr(text, i, meal = 'tr.diyanet') {
  // meal içinde aranan kelimeleri işaretle (normalize edilmiş metin aynı uzunlukta)
  const n = normTr(text); const marks = [];
  state.terms.forEach(t => {
    if (t.mode !== 'tr' || !t.counts[i] || (t.meal !== 'all' && t.meal !== meal)) return;
    const re = trRegex(t.q, t.match); let m;
    while ((m = re.exec(n))) { let e = m.index + m[0].length; if (t.match === 'start') { while (e < n.length && /[\p{L}\p{N}]/u.test(n[e])) e++; } marks.push([m.index, e, t.color]); if (!m[0].length) re.lastIndex++; }
  });
  if (n.length !== text.length || !marks.length) return escHtml(text);
  marks.sort((a, b) => a[0] - b[0]);
  let out = '', p = 0;
  for (const [s, e, c] of marks) { if (s < p) continue; out += escHtml(text.slice(p, s)) + `<mark style="--c:${c}">${escHtml(text.slice(s, e))}</mark>`; p = e; }
  return out + escHtml(text.slice(p));
}
function wordHitColor(i, k, clIdx) {
  for (const t of state.terms) {
    if (!t.counts[i]) continue;
    if (t.mode === 'root' && wRoot[i][k] === t.id) return t.color;
    if (t.mode === 'lemma' && wLem[i][k] === t.id) return t.color;
    if (t.mode === 'ar' && clIdx != null) { const tok = clnTok[i][clIdx]; if (tok && arTest(t.q, t.match)(tok)) return t.color; }
  }
  return null;
}
function renderCard(i) {
  const v = Q.verses[i], S = SUR[vS[i] - 1];
  $('#cRef').textContent = `${S.n}:${vA[i]}`;
  $('#cTitle').innerHTML = `${S.tr} <span class="ar" lang="ar">${S.ar}</span>`;
  $('#cMeta').innerHTML = `${S.n}. sûre · ${vA[i]}. ayet / ${S.c} · ${S.t === 'M' ? 'Mekkî' : 'Medenî'} (nüzul ${S.rev}.) · ${vJuz[i]}. cüz · sayfa ${v[6]}${v[7] ? ' · <span class="sajda">۩ secde ayeti</span>' : ''}`;
  // Arapça: Osmanî metin kelimelere bölünür, morfolojiyle eşleştirilir
  const toks = v[2].split(' ');
  const align = toks.filter(t => t.replace(/[ۖ-ۭ\s]/g, '')).length === wForm[i].length;
  const clAlign = clnTok[i].length === wForm[i].length;
  let k = 0;
  $('#cAr').innerHTML = toks.map(t => {
    if (!t.replace(/[ۖ-ۭ\s]/g, '')) return `<span class="mark">${t}</span>`;
    if (!align) return t;
    const c = wordHitColor(i, k, clAlign ? k : null);
    const h = `<span class="w${c ? ' hit' : ''}" data-k="${k}"${c ? ` style="--c:${c}"` : ''}>${t}</span>`; k++; return h;
  }).join(' ') + ` <span class="end">﴿${toArabicDigits(vA[i])}﴾</span>`;
  $('#cWord').innerHTML = TOUCH ? 'Bir Arapça kelimeye dokunun: kökü ve kaç kez geçtiği görünür. İkinci dokunuşta o kökü arar.' : 'Bir Arapça kelimenin üzerine gelin: kökü ve kaç kez geçtiği görünür. Tıklayınca o kökü arar.';
  renderMeal(i);
  $('#cAr').querySelectorAll('.w').forEach(el => {
    const kk = +el.dataset.k;
    el.onmouseenter = () => {
      const r = wRoot[i][kk], l = wLem[i][kk];
      $('#cWord').innerHTML = (r >= 0 ? `Kök <bdi class="ar">${Q.roots[r].split('').join(' ')}</bdi> · ${fmt(rootOcc[r].length)} kez, ${fmt(rootDf[r])} ayette` : 'Kökü yok') +
        (l >= 0 ? ` &nbsp;·&nbsp; Lemma <bdi class="ar">${Q.lemmas[l]}</bdi> · ${fmt(lemOcc[l].length)} kez` : '') + (r >= 0 ? ' <span class="muted">— tıkla: kökü ara</span>' : '');
    };
    el.onclick = () => {
      const r = wRoot[i][kk], l = wLem[i][kk];
      // dokunmatikte üzerine gelme yok: ilk dokunuş bilgiyi gösterir, aynı kelimeye ikinci dokunuş arar
      if (TOUCH && !el.classList.contains('sel')) { $('#cAr').querySelectorAll('.w.sel').forEach(x => x.classList.remove('sel')); el.classList.add('sel'); el.onmouseenter(); $('#cWord').innerHTML = $('#cWord').innerHTML.replace('tıkla: kökü ara', 'tekrar dokun: kökü ara'); return; }
      if (r >= 0) addTerm('root', Q.roots[r], 'root'); else if (l >= 0) addTerm('lemma', Q.lemmas[l], 'lemma');
    };
  });
  // benzer ayetler: ortak nadir kökler (IDF ağırlıklı)
  const sc = new Float32Array(N), seen = new Set();
  for (const r of wRoot[i]) {
    if (r < 0 || seen.has(r) || rootDf[r] > 900) continue; seen.add(r);
    const w = Math.log(N / rootDf[r]); let p = -1;
    for (const j of rootOcc[r]) if (j !== p) { sc[j] += w * w; p = j; }
  }
  sc[i] = 0;
  const top = []; for (let j = 0; j < N; j++) if (sc[j] > 0) top.push(j);
  top.sort((a, b) => sc[b] / Math.sqrt(wForm[b].length + 4) - sc[a] / Math.sqrt(wForm[a].length + 4));
  $('#cSim').innerHTML = top.slice(0, 5).map(j => `<li data-v="${j}"><b>${sName(j)} ${vA[j]}</b>${escHtml(Q.verses[j][4].slice(0, 130))}${Q.verses[j][4].length > 130 ? '…' : ''}</li>`).join('') || '<li class="muted">—</li>';
  $('#cSim').querySelectorAll('li[data-v]').forEach(li => li.onclick = () => openVerse(+li.dataset.v));
  $('#qcomLink').href = `https://quran.com/${vS[i]}/${vA[i]}`;
  $('#prevBtn').disabled = i === 0; $('#nextBtn').disabled = i === N - 1;
}
const toArabicDigits = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const pad3 = n => String(n).padStart(3, '0');
/* ---------- dinleme: Arapça tilavet (everyayah) + meal seslendirme (tarayıcının Türkçe sesi) ---------- */
let playing = false, playTok = 0;
const tts = window.speechSynthesis || null;
let trVoices = [];
function loadVoices() {
  if (!tts) return;
  trVoices = tts.getVoices().filter(v => /^tr(-|_|$)/i.test(v.lang));
  const sel = $('#voiceSel'); if (!sel) return;
  if (!MEAL_TTS) { sel.hidden = true; return; }
  const keep = sel.value;
  sel.innerHTML = trVoices.length ? trVoices.map((v, k) => `<option value="${k}">${v.name.replace(/\s*\(.*\)$/, '')}</option>`).join('') : '<option value="">Türkçe ses</option>';
  if (keep && sel.querySelector(`option[value="${keep}"]`)) sel.value = keep;
  sel.hidden = trVoices.length < 2;
}
if (tts) { loadVoices(); tts.addEventListener ? tts.addEventListener('voiceschanged', loadVoices) : (tts.onvoiceschanged = loadVoices); }
function playAr(i, tok) {
  return new Promise((res, rej) => {
    if (!audio) audio = new Audio();
    audio.onended = () => res(); audio.onerror = () => rej(new Error('ses'));
    audio.src = `https://everyayah.com/data/Alafasy_128kbps/${pad3(vS[i])}${pad3(vA[i])}.mp3`;
    audio.playbackRate = 1;
    audio.play().catch(rej);
  });
}
// Türkçe meal sesi (Diyanet Vakfı meali, alquran.cloud)
function playMeal(i) {
  return new Promise((res, rej) => {
    if (!audio) audio = new Audio();
    audio.onended = () => res(); audio.onerror = () => rej(new Error('meal'));
    audio.src = `https://cdn.islamic.network/quran/audio/128/tr.vakfi-audio/${i + 1}.mp3`;
    audio.playbackRate = 1;
    audio.play().catch(rej);
  });
}
function speakTr(i, tok) {
  return new Promise(async (res, rej) => {
    if (!tts) return rej(new Error('tts'));
    const id = state.cardMeal;
    try { await loadMeal(id); } catch (e) { return rej(e); }
    if (tok !== playTok) return res();
    const text = mealText[id][i];
    // uzun metinler bazı tarayıcılarda yarıda kesilir: cümlelere böl
    const parts = []; const re = /[^.!?;:]+[.!?;:]*\s*/g; let m;
    while ((m = re.exec(text))) { if (m[0].trim()) parts.push([m.index, m[0]]); }
    if (!parts.length) parts.push([0, text]);
    const voice = trVoices[+$('#voiceSel').value] || trVoices[0] || null;
    let k = 0;
    const next = () => {
      if (tok !== playTok) return res();
      if (k >= parts.length) { markSpoken(i, -1); return res(); }
      const [off, chunk] = parts[k++];
      const u = new SpeechSynthesisUtterance(chunk);
      u.lang = 'tr-TR'; if (voice) u.voice = voice; u.rate = +$('#rateSel').value || 1;
      u.onboundary = e => { if (tok === playTok && (e.name === 'word' || e.name === undefined)) markSpoken(i, off + e.charIndex, e.charLength); };
      u.onstart = () => markSpoken(i, off, 0);
      u.onend = next; u.onerror = e => (e.error === 'interrupted' || e.error === 'canceled') ? res() : rej(e);
      tts.speak(u);
    };
    next();
  });
}
function markSpoken(i, at, len) {
  if (selected !== i) return;
  const id = state.cardMeal, text = mealText[id] && mealText[id][i]; if (!text) return;
  if (at < 0) { $('#cTr').innerHTML = highlightTr(text, i, id); return; }
  if (!len) { const w = text.slice(at).match(/^[\s"'“”(]*[^\s]+/); len = w ? w[0].length : 0; }
  $('#cTr').innerHTML = escHtml(text.slice(0, at)) + `<span class="spk">${escHtml(text.slice(at, at + len))}</span>` + escHtml(text.slice(at + len));
}
async function playVerse() {
  const i = selected; if (i < 0) return;
  dispatchEvent(new Event('ayet:cardplay'));
  const tok = ++playTok; stopMedia(); playing = true; setPlay(true);
  const mode = $('#listenMode').value; try { localStorage.setItem('ayet-okuma', JSON.stringify(mode)); } catch (_) {}
  try {
    if (mode !== 'tr') await playAr(i, tok);
    if (tok !== playTok) return;
    if (tok !== playTok) return;
    if (mode !== 'ar') await (MEAL_TTS ? speakTr(i, tok) : playMeal(i));
  } catch (e) {
    if (tok !== playTok) return;
    toast(e && e.message === 'tts' ? 'Bu tarayıcı sesli okumayı desteklemiyor' : e && e.message === 'ses' ? 'Tilavet yüklenemedi (internet bağlantısı gerekir)' : e && e.message === 'meal' ? 'Meal sesi yüklenemedi (internet bağlantısı gerekir)' : 'Ses çalınamadı');
    playing = false; setPlay(false); return;
  }
  if (tok !== playTok) return;
  if ($('#autoNext').checked && selected >= 0 && selected < N - 1) openVerse(selected + 1, { auto: true });
  else { playing = false; setPlay(false); }
}
function stopMedia() { if (audio) audio.pause(); if (tts) tts.cancel(); }
function stopAudio() { playTok++; stopMedia(); playing = false; setPlay(false); if (selected >= 0 && mealText[state.cardMeal]) markSpoken(selected, -1); }
function setPlay(on) { $('#playBtn').innerHTML = on ? '<svg class="i"><use href="#i-pause"/></svg>Durdur' : '<svg class="i"><use href="#i-play"/></svg>Dinle'; }
$('#playBtn').onclick = () => playing ? stopAudio() : playVerse();
$('#listenMode').onchange = () => { try { localStorage.setItem('ayet-okuma', JSON.stringify($('#listenMode').value)); } catch (_) {} dispatchEvent(new Event('ayet:okuma')); if (playing) playVerse(); };
$('#prevBtn').onclick = () => openVerse(selected - 1);
$('#nextBtn').onclick = () => openVerse(selected + 1);
$('#closeBtn').onclick = closeVerse; veil.onclick = closeVerse;
$('#copyBtn').onclick = () => {
  const i = selected, v = Q.verses[i];
  navigator.clipboard.writeText(`${v[2]}\n\n${v[4]}\n— ${sName(i)} ${vA[i]} (${ref(i)})`).then(() => toast('Ayet kopyalandı'), () => toast('Kopyalanamadı'));
};
$('#linkBtn').onclick = () => navigator.clipboard.writeText(location.href).then(() => toast('Bağlantı kopyalandı'), () => toast(location.href));
$('#surahBtn').onclick = () => { const s = vS[selected]; closeVerse(); setTimeout(() => focusSurah(s), 350); };


/* Türkçe kavram → Arapça kök sözlüğü (öneri için) */
const TR2ROOT = {
  'sabır sabr': 'صبر', 'şükür şükr': 'شكر', 'rahmet rahim rahman merhamet': 'رحم', 'ilim alim bilgi ilm': 'علم', 'akıl akl': 'عقل',
  'tefekkür fikir düşün': 'فكر', 'iman mümin emin güven': 'امن', 'küfür kafir inkar': 'كفر', 'takva muttaki': 'وقي', 'tevekkül vekil': 'وكل',
  'zikir zikr an': 'ذكر', 'kitap kitab yaz': 'كتب', 'kalp kalb gönül': 'قلب', 'nur ışık': 'نور', 'hak hakk gerçek': 'حقق', 'adalet adl': 'عدل',
  'zulüm zulm zalim': 'ظلم', 'tövbe tevbe': 'توب', 'mağfiret gafur bağışla': 'غفر', 'cennet bahçe': 'جنن', 'cehennem': 'جهنم', 'ateş nar': 'نور',
  'hayat dirilt hay': 'حيي', 'ölüm mevt öl': 'موت', 'dua': 'دعو', 'namaz salat': 'صلو', 'oruç savm': 'صوم', 'zekat': 'زكو', 'hac': 'حجج',
  'melek melaike': 'ملك', 'mülk melik': 'ملك', 'şeytan': 'شطن', 'kıyamet kıyam': 'قوم', 'hesap': 'حسب', 'kalem': 'قلم', 'ruh': 'روح', 'nefis nefs can': 'نفس',
  'yer arz': 'ارض', 'gök sema': 'سمو', 'deniz': 'بحر', 'su ma': 'موه', 'güneş şems': 'شمس', 'ay kamer': 'قمر', 'yıldız': 'نجم', 'gece leyl': 'ليل', 'gündüz nehar': 'نهر',
  'sevgi muhabbet sev': 'حبب', 'korku havf kork': 'خوف', 'umut ümit reca': 'رجو', 'hidayet doğru yol': 'هدي', 'dalalet sapık': 'ضلل', 'rızık rızk': 'رزق',
  'kur\'an kuran oku': 'قرا', 'ayet': 'ايي', 'peygamber nebi': 'نبا', 'resul elçi': 'رسل', 'insan': 'انس', 'anne ana': 'امم', 'baba': 'ابو', 'kardeş': 'اخو',
  'barış selam': 'سلم', 'islam müslüman': 'سلم', 'cihad cehd': 'جهد', 'fitne': 'فتن', 'yalan kizb': 'كذب', 'doğru sıdk': 'صدق', 'iyilik birr': 'برر', 'ihsan güzel': 'حسن',
};
const TR2ROOT_IDX = [];
for (const [k, r] of Object.entries(TR2ROOT)) for (const w of k.split(' ')) TR2ROOT_IDX.push([normTr(w), r]);
function trRootSuggest(q) {
  const n = normTr(q); if (n.length < 2) return [];
  const seen = new Set(), out = [];
  for (const [w, r] of TR2ROOT_IDX) if ((w.startsWith(n) || (n.length >= 3 && n.startsWith(w) && w.length >= 3)) && !seen.has(r)) { seen.add(r); const id = findId(Q.roots, rootNorm, r); if (id >= 0) out.push(id); }
  return out.slice(0, 3);
}

/* ---------- meal seçiciler ---------- */
state.meal = 'tr.diyanet'; state.cardMeal = 'tr.diyanet';
const mealOpts = (all) => MEALS.map(m => `<option value="${m[0]}">${m[1]}</option>`).join('') + (all ? '<option value="all">Tüm mealler (9)</option>' : '');
$('#mealSel').innerHTML = mealOpts(true);
$('#mealSel').onchange = e => {
  state.meal = e.target.value;
  if (state.meal !== 'all') { state.cardMeal = state.meal; $('#cMeal').value = state.meal; }
  if (!mealReady(state.meal)) { $('#mealSel').disabled = true; toast(state.meal === 'all' ? '9 meal yükleniyor…' : 'Meal yükleniyor…'); }
  loadMeal(state.meal).then(() => { $('#mealSel').disabled = false; updateSuggest(); }, () => { $('#mealSel').disabled = false; toast('Meal yüklenemedi'); });
};
$('#cMeal').innerHTML = mealOpts(false);
$('#cMeal').onchange = e => { state.cardMeal = e.target.value; if (selected >= 0) renderMeal(selected); if (playing && $('#listenMode').value !== 'ar') playVerse(); };
function renderMeal(i) {
  const id = state.cardMeal, el = $('#cTr');
  $('#cMeal').value = id;
  if (!mealText[id]) { el.innerHTML = '<span class="muted">Meal yükleniyor…</span>'; loadMeal(id).then(() => { if (selected === i) renderMeal(i); }, () => el.textContent = 'Meal yüklenemedi.'); }
  else el.innerHTML = highlightTr(mealText[id][i], i, id);
  // okunuş
  const tl = $('#cTl');
  if (window.QMEAL && window.QMEAL['tr.transliteration']) tl.textContent = window.QMEAL['tr.transliteration'][i];
  else { tl.textContent = ''; loadMeal('tr.transliteration').then(() => { if (selected === i) tl.textContent = window.QMEAL['tr.transliteration'][i]; }, () => {}); }
  if (!$('#cAll').hidden) renderAllMeals(i);
}
function renderAllMeals(i) {
  const el = $('#cAll');
  if (!mealReady('all')) { el.innerHTML = '<p class="muted small">9 meal yükleniyor…</p>'; loadMeal('all').then(() => { if (selected === i) renderAllMeals(i); }, () => el.innerHTML = '<p class="muted small">Mealler yüklenemedi.</p>'); return; }
  el.innerHTML = MEALS.filter(m => m[0] !== state.cardMeal).map(m => `<div class="om"><b>${m[1]}</b><p>${highlightTr(mealText[m[0]][i], i, m[0])}</p></div>`).join('');
}
$('#allMealsBtn').onclick = () => {
  const el = $('#cAll'); el.hidden = !el.hidden;
  $('#allMealsBtn').textContent = el.hidden ? 'Tüm mealleri karşılaştır (9)' : 'Karşılaştırmayı gizle';
  if (!el.hidden) renderAllMeals(selected);
};

/* ---------- arama kutusu ve öneriler ---------- */
const qEl = $('#q'), mEl = $('#match'), sug = $('#suggest');
let sugItems = [], sugIdx = -1;
function setMode(m) {
  state.mode = m;
  $$('.modes button').forEach(b => b.classList.toggle('on', b.dataset.mode === m));
  mEl.innerHTML = MATCHES[m].map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
  mEl.hidden = MATCHES[m].length < 2;
  $('#mealSel').hidden = m !== 'tr';
  qEl.placeholder = { tr: 'Bir kelime ya da ayet yazın: sabır, rahmet, 2:255', ar: 'Arapça kelime: الدنيا ، قل ، شهر', root: 'Kök yazın: رحم ، صبر ، علم', lemma: 'Lemma yazın: دنيا ، موسى ، يوم' }[m];
  qEl.dir = m === 'tr' ? 'ltr' : 'auto';
  updateSuggest();
}
$$('.modes button').forEach(b => b.onclick = () => { setMode(b.dataset.mode); qEl.focus(); });
function updateSuggest() {
  const q = qEl.value.trim(); sugItems = []; sugIdx = -1;
  if (!q) { sug.hidden = true; return; }
  const m = state.mode;
  if (/^\d{1,3}\s*[:.\s]\s*\d{1,3}$/.test(q)) {
    const [s, a] = q.split(/\s*[:.\s]\s*/).map(Number); const i = verseIndex(s, a);
    if (i >= 0) sugItems.push({ html: `<span>Ayete git: <b>${SUR[s - 1].tr} ${a}</b></span><span class="muted">${s}:${a}</span>`, go: () => openVerse(i) });
  }
  const sm = q.match(/^[\p{L}'’\- ]+$/u) && m === 'tr' ? SUR.filter(s => normTr(s.tr).replace(/'/g, '').startsWith(normTr(q).replace(/'/g, ''))).slice(0, 3) : [];
  sm.forEach(s => sugItems.push({ html: `<span>Sûreye odaklan: <b>${s.tr}</b></span><span class="muted">${s.n}. sûre · ${s.c} ayet</span>`, go: () => { focusSurah(s.n); qEl.value = ''; } }));
  if (m === 'root' || m === 'lemma' || (m === 'ar')) {
    const n = normAr(q).replace(/\s+/g, '');
    if (n && (m === 'root' || m === 'lemma')) {
      const list = m === 'root' ? rootNorm : lemNorm, occ = m === 'root' ? rootOcc : lemOcc, raw = m === 'root' ? Q.roots : Q.lemmas;
      const res = [];
      list.forEach((x, k) => { if (x.startsWith(n)) res.push([k, x === n ? 2 : 1]); });
      res.sort((a, b) => b[1] - a[1] || occ[b[0]].length - occ[a[0]].length);
      res.slice(0, 12).forEach(([k]) => sugItems.push({ html: `<span class="ar">${m === 'root' ? raw[k].split('').join(' ') : raw[k]}</span><span class="muted">${fmt(occ[k].length)} kez</span>`, go: () => { addTerm(m, raw[k], m); qEl.value = ''; } }));
    }
    if (m === 'ar' && n) {
      // önizleme sayısı
      const t = makeTerm('ar', q, mEl.value);
      if (t) sugItems.push({ html: `<span>Ekle: <span class="ar">${escHtml(q)}</span></span><span class="muted">${fmt(t.occ)} kez · ${fmt(t.ver)} ayet</span>`, go: submit });
    }
  } else if (q.length >= 2) {
    const t = mealReady(state.meal) ? makeTerm('tr', q, mEl.value, { meal: state.meal }) : null;
    if (t) sugItems.push({ html: `<span>${state.meal === 'all' ? 'Tüm meallerde' : mealShort(state.meal) + ' mealinde'} ara: <b>${escHtml(q)}</b></span><span class="muted">${fmt(t.occ)} kez · ${fmt(t.ver)} ayet</span>`, go: submit });
    trRootSuggest(q).forEach(id => sugItems.push({ html: `<span>Arapça kökle ara: <span class="ar">${Q.roots[id].split('').join(' ')}</span> <span class="muted">(tüm türevleri)</span></span><span class="muted">${fmt(rootOcc[id].length)} kez · ${fmt(rootDf[id])} ayet</span>`, go: () => { addTerm('root', Q.roots[id], 'root', { label: q.trim().replace(/^./, c => c.toLocaleUpperCase('tr')) }); qEl.value = ''; } }));
  }
  sug.innerHTML = sugItems.map((s, k) => `<li data-k="${k}">${s.html}</li>`).join('');
  sug.hidden = !sugItems.length;
  sug.querySelectorAll('li').forEach(li => li.onmousedown = e => { e.preventDefault(); sugItems[+li.dataset.k].go(); sug.hidden = true; });
}
function submit() {
  const q = qEl.value.trim(); if (!q) return;
  const gm = q.match(/^(\d{1,3})\s*[:.\s]\s*(\d{1,3})$/);
  if (gm) { const i = verseIndex(+gm[1], +gm[2]); if (i >= 0) { openVerse(i); qEl.value = ''; sug.hidden = true; } else toast('Böyle bir ayet yok'); return; }
  let mode = state.mode;
  if (mode === 'tr' && /[؀-ۿ]/.test(q)) { setMode('ar'); mode = 'ar'; }
  if (mode === 'root' || mode === 'lemma') {
    const list = mode === 'root' ? rootNorm : lemNorm, n = normAr(q).replace(/\s+/g, '');
    if (findId(mode === 'root' ? Q.roots : Q.lemmas, list, q) < 0) { const k = list.findIndex(x => x.startsWith(n)); if (k >= 0) { if (addTerm(mode, (mode === 'root' ? Q.roots : Q.lemmas)[k], mode)) qEl.value = ''; sug.hidden = true; return; } }
  }
  if (mode === 'tr' && !mealReady(state.meal)) { toast('Meal yükleniyor…'); loadMeal(state.meal).then(submit, () => toast('Meal yüklenemedi')); return; }
  if (addTerm(mode, q, mEl.value, { meal: state.meal })) { qEl.value = ''; sug.hidden = true; }
}
qEl.addEventListener('input', updateSuggest);
mEl.addEventListener('change', updateSuggest);
qEl.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    if (!sugItems.length) return; e.preventDefault();
    sugIdx = (sugIdx + (e.key === 'ArrowDown' ? 1 : -1) + sugItems.length) % sugItems.length;
    sug.querySelectorAll('li').forEach((li, k) => li.classList.toggle('on', k === sugIdx));
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (sugIdx >= 0) { sugItems[sugIdx].go(); sug.hidden = true; } else submit();
  } else if (e.key === 'Escape') { sug.hidden = true; qEl.blur(); }
});
qEl.addEventListener('blur', () => setTimeout(() => sug.hidden = true, 120));
$('#addBtn').onclick = submit;

/* ---------- araç çubuğu ---------- */
$$('#layoutSeg button').forEach(b => b.onclick = () => setLayout(b.dataset.l));
$('#chartBtn').onclick = () => { if (!state.terms.length) { toast('Önce bir kelime arayın'); return; } setChart(!state.chart); buildHash(); syncHash(); };
$$('#metricSeg button').forEach(b => b.onclick = () => {
  state.metric = b.dataset.m; $$('#metricSeg button').forEach(x => x.classList.toggle('on', x === b));
  renderChips(); renderStats(); renderHisto(); if (state.chart) buildChart(); buildHash(); syncHash();
});
$('#fType').onchange = e => { state.fType = e.target.value; computeFilter(); renderStats(); if (state.chart) buildChart(); needs = true; buildHash(); syncHash(); };
$('#fJuz').innerHTML = '<option value="0">Tüm cüzler</option>' + Array.from({ length: 30 }, (_, k) => `<option value="${k + 1}">${k + 1}. cüz</option>`).join('');
$('#fJuz').onchange = e => { state.fJuz = +e.target.value; computeFilter(); renderStats(); if (state.chart) buildChart(); needs = true; buildHash(); syncHash(); };
$('#fSurah').innerHTML = '<option value="0">Tüm sûreler</option>' + SUR.map(s => `<option value="${s.n}">${s.n}. ${s.tr}</option>`).join('');
$('#fSurah').onchange = e => focusSurah(+e.target.value);
$('#randBtn').onclick = () => openVerse(Math.floor(Math.random() * N));
$('#fClear').onclick = () => { state.fType = ''; state.fJuz = 0; $('#fType').value = ''; $('#fJuz').value = 0; focusSurah(0); computeFilter(); renderStats(); if (state.chart) buildChart(); needs = true; buildHash(); syncHash(); $('#filters').open = false; };
document.addEventListener('click', e => { document.querySelectorAll('details.filters[open], details.more[open]').forEach(d => { if (!d.contains(e.target)) d.open = false; }); });
$('#cMore').addEventListener('click', e => { if (e.target.closest('.menu button, .menu a')) setTimeout(() => $('#cMore').open = false, 50); });
$('#optBtn').onclick = () => { const f = $('#optBtn').closest('.field'); const on = f.classList.toggle('opts'); $('#optBtn').setAttribute('aria-expanded', on); };
/* kart yazı boyutu */
const FS = [1, 1.15, 1.3, .9]; let fsK = 0; try { fsK = Math.max(0, FS.indexOf(+localStorage.getItem('ayet-fs'))); } catch (_) {}
const applyFs = () => document.documentElement.style.setProperty('--cfs', FS[fsK]);
applyFs();
$('#fsBtn').onclick = () => { fsK = (fsK + 1) % FS.length; applyFs(); try { localStorage.setItem('ayet-fs', FS[fsK]); } catch (_) {} toast('Yazı boyutu: %' + Math.round(FS[fsK] * 100)); };
$('#fitBtn').onclick = () => tweenCam(fitCam(), 700);
$('#infoBtn').onclick = () => $('#info').hidden = false;
$('#info').onclick = e => { if (e.target.id === 'info' || e.target.closest('[data-close]')) $('#info').hidden = true; };

document.addEventListener('keydown', e => {
  if (e.target.matches('input,select,textarea')) return;
  if (!card.hidden) {
    if (e.key === 'Escape') closeVerse();
    else if (e.key === 'ArrowLeft') openVerse(selected - 1);
    else if (e.key === 'ArrowRight') openVerse(selected + 1);
    else if (e.key === ' ') { e.preventDefault(); $('#playBtn').click(); }
    return;
  }
  if (!$('#info').hidden && e.key === 'Escape') { $('#info').hidden = true; return; }
  if (e.key === '/') { e.preventDefault(); qEl.focus(); }
  else if (e.key === 'g' || e.key === 'G') $('#chartBtn').click();
  else if (e.key === 'r' || e.key === 'R') $('#randBtn').click();
  else if (e.key === '0') $('#fitBtn').click();
  else if (e.key === '+' || e.key === '=') zc.querySelector('[data-z=in]').click();
  else if (e.key === '-') zc.querySelector('[data-z=out]').click();
});

/* ---------- hazır karşılaştırmalar ---------- */
const PRESETS = [
  { t: 'Dünya ⚖ Âhiret', d: 'Eşit mi geçiyor?', terms: [['lemma', 'دُنْيا', 'lemma', 'Dünya'], ['ar', 'الآخرة', 'affix', 'Âhiret']], chart: false },
  { t: 'De ki ⚖ Dediler', d: 'قُلْ ve قَالُوا', terms: [['ar', 'قل', 'affix', 'De ki', ['قَلَّ']], ['ar', 'قالوا', 'affix', 'Dediler']], chart: true },
  { t: '25 Peygamber', d: 'Adı geçen bütün peygamberler', terms: [
    ['lemma', 'مُوسَى', 'lemma', 'Mûsâ'], ['lemma', 'إِبْراهِيم', 'lemma', 'İbrâhim'], ['lemma', 'نُوح', 'lemma', 'Nûh'], ['lemma', 'لُوط', 'lemma', 'Lût'], ['lemma', 'يُوسُف', 'lemma', 'Yûsuf'],
    ['lemma', 'آدَم', 'lemma', 'Âdem'], ['lemma', 'عِيسَى', 'lemma', 'İsâ'], ['lemma', 'هارُون', 'lemma', 'Hârûn'], ['lemma', 'إِسْحاق', 'lemma', 'İshâk'], ['lemma', 'سُلَيْمان', 'lemma', 'Süleyman'],
    ['lemma', 'داوُد', 'lemma', 'Dâvûd'], ['lemma', 'يَعْقُوب', 'lemma', 'Yakub'], ['lemma', 'إِسْماعِيل', 'lemma', 'İsmâil'], ['lemma', 'شُعَيْب', 'lemma', 'Şuayb'],
    ['lemma', 'صالِح', 'lemma', 'Sâlih', null, '7:73,7:75,7:77,11:61,11:62,11:66,11:89,26:142,27:45'], ['lemma', 'هُود', 'lemma', 'Hûd', null, '-2:111,2:135,2:140'],
    ['lemma', 'زَكَرِيّا', 'lemma', 'Zekeriyyâ'], ['lemma', 'يَحْيَى', 'lemma', 'Yahyâ'], ['lemma', 'مُحَمَّد', 'lemma', 'Muhammed'], ['lemma', 'أَيُّوب', 'lemma', 'Eyyûb'], ['lemma', 'يُونُس', 'lemma', 'Yûnus'], ['lemma', 'إِلْياس', 'lemma', 'İlyâs'],
    ['lemma', 'إِدْرِيس', 'lemma', 'İdrîs'], ['lemma', 'الْيَسَع', 'lemma', 'Elyesa'], ['lemma', 'كِفْل', 'lemma', 'Zülkifl', null, '21:85,38:48']], chart: true },
  { t: 'İsâ ⚖ Âdem', d: 'Âl-i İmrân 59', terms: [['lemma', 'عِيسَى', 'lemma', 'İsâ'], ['lemma', 'آدَم', 'lemma', 'Âdem']], chart: false, open: [3, 59] },
  { t: 'Ay (شهر)', d: 'Tekil "ay" kelimesi', terms: [['ar', 'شهر', 'affix', 'Ay']], chart: true, open: [9, 36] },
  { t: 'Gün (يوم)', d: 'Tekil "gün" kelimesi', terms: [['ar', 'يوم', 'affix', 'Gün']], chart: true },
  { t: 'Melek ⚖ Şeytan', d: 'Kök karşılaştırması', terms: [['root', 'ملك', 'root', 'Melek/Mülk'], ['lemma', 'شَيْطان', 'lemma', 'Şeytan']], chart: false },
  { t: 'Hayat ⚖ Ölüm', d: 'حيي ve موت kökleri', terms: [['root', 'حيي', 'root', 'Hayat'], ['root', 'موت', 'root', 'Ölüm']], chart: true },
  { t: 'Cennet ⚖ Cehennem', d: 'Mealde', terms: [['tr', 'cennet', 'start', 'Cennet'], ['tr', 'cehennem', 'start', 'Cehennem']], chart: false },
  { t: 'Sabır · Şükür · Tevekkül', d: 'Üç kök', terms: [['root', 'صبر', 'root', 'Sabır'], ['root', 'شكر', 'root', 'Şükür'], ['root', 'وكل', 'root', 'Tevekkül']], chart: true },
  { t: 'Rahmet', d: 'رحم kökü ve dağılımı', terms: [['root', 'رحم', 'root', 'Rahmet']], chart: false },
  { t: 'Akıl · İlim · Tefekkür', d: 'Düşünmeye çağrı', terms: [['root', 'عقل', 'root', 'Akıl'], ['root', 'علم', 'root', 'İlim'], ['root', 'فكر', 'root', 'Tefekkür']], chart: true },
];
$('#presets').innerHTML = PRESETS.map((p, k) => `<button data-p="${k}"><b>${p.t}</b><span>${p.d}</span></button>`).join('');
$$('#presets button').forEach(b => b.onclick = () => runPreset(PRESETS[+b.dataset.p]));
let presetT = 0;
function runPreset(p) {
  if (!card.hidden) closeVerse();
  state.shape = null;
  clearTerms();
  for (const [m, q, mt, label, notLemma, refs] of p.terms) addTerm(m, q, mt, { label, notLemma, refs, many: true, silent: true });
  termsChanged();
  if (state.fSurah) focusSurah(0);
  setChart(p.chart);
  if (!p.chart) tweenCam(fitCam(), 700);
  clearTimeout(presetT);
  if (p.open) presetT = setTimeout(() => openVerse(verseIndex(...p.open)), p.chart ? 1900 : 900);
  buildHash(); syncHash();
  if (innerWidth < 980) $('#map').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ---------- URL durumu (paylaşılabilir) ---------- */
let hashStr = '';
let extraHash = '';
function buildHash() {
  const p = new URLSearchParams();
  if (extraHash) { hashStr = extraHash; if (selected >= 0 && !card.hidden) hashStr += '&a=' + ref(selected); return; }
  state.terms.forEach(t => p.append('t', [t.mode, t.match, t.q, t.label, t.notLemma ? t.notLemma.join(',') : '', t.refs, t.meal && t.meal !== 'tr.diyanet' ? t.meal : ''].join('~').replace(/~+$/, '')));
  if (state.layout !== 'grid') p.set('l', state.layout);
  if (state.chart) p.set('g', '1');
  if (state.metric !== 'occ') p.set('m', state.metric);
  if (state.fType) p.set('ft', state.fType);
  if (state.fJuz) p.set('fj', state.fJuz);
  if (state.fSurah) p.set('fs', state.fSurah);
  if (selected >= 0 && !card.hidden) p.set('a', ref(selected));
  hashStr = p.toString();
}
let syncT = 0;
function syncHash() { if (!LOCAL) return; clearTimeout(syncT); syncT = setTimeout(() => { const h = hashStr ? '#' + hashStr : ' '; if (location.hash.slice(1) !== hashStr) history.replaceState(null, '', h === ' ' ? location.pathname + location.search : h); }, 150); }
function readHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  for (const t of p.getAll('t')) {
    const [m, mt, q, label, nl, refs, meal] = t.split('~'); if (!MATCHES[m]) continue;
    const o = { label: label || q, notLemma: nl ? nl.split(',') : null, refs, meal: meal || undefined, many: true, silent: true };
    if (m === 'tr' && meal && !mealReady(meal)) loadMeal(meal).then(() => { addTerm(m, q, mt, o); termsChanged(); }, () => {});
    else addTerm(m, q, mt, o);
  }
  if (p.get('m') === 'ver') { state.metric = 'ver'; $$('#metricSeg button').forEach(x => x.classList.toggle('on', x.dataset.m === 'ver')); }
  if (p.get('ft')) { state.fType = p.get('ft'); $('#fType').value = state.fType; }
  if (p.get('fj')) { state.fJuz = +p.get('fj'); $('#fJuz').value = state.fJuz; }
  if (p.get('fs')) { state.fSurah = +p.get('fs'); $('#fSurah').value = state.fSurah; }
  computeFilter();
  const l = p.get('l'); if (l && l !== 'grid') { cur = layoutPositions(l); pos.set(cur.P); state.layout = l; $$('#layoutSeg button').forEach(b => b.classList.toggle('on', b.dataset.l === l)); }
  return { chart: p.get('g') === '1', a: p.get('a') };
}

/* ---------- yıldızlar ---------- */
function stars() {
  const c = $('#stars'); if (!c) return; const g = c.getContext('2d'), d = Math.min(devicePixelRatio || 1, 2);
  c.width = innerWidth * d; c.height = innerHeight * d; g.scale(d, d);
  for (let k = 0; k < 160; k++) { g.fillStyle = `rgba(255,255,255,${Math.random() * .5 + .1})`; const r = Math.random() * 1.1 + .2; g.beginPath(); g.arc(Math.random() * innerWidth, Math.random() * innerHeight, r, 0, 6.28); g.fill(); }
}

/* ---------- bildirim ---------- */
let toastT;
function toast(msg) {
  let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2400);
}

/* ---------- başlat ---------- */
if (!LOCAL) { $('#listenMode').innerHTML = '<option value="tr">Meal</option>'; $('#linkBtn').hidden = true; if (!tts) { $('#playBtn').hidden = true; $('#autoNext').parentElement.hidden = true; } }
if (LOCAL && !MEAL_TTS) {
  $('#listenMode').innerHTML = '<option value="ar">Arapça</option><option value="tr">Türkçe meal</option><option value="artr">Arapça + meal</option>'; $('#rateSel').hidden = true;
  const syncOkuma = () => { let v = 'ar'; try { v = JSON.parse(localStorage.getItem('ayet-okuma')) || 'ar'; } catch (_) {} $('#listenMode').value = ['ar', 'tr', 'artr'].includes(v) ? v : 'ar'; };
  syncOkuma(); addEventListener('ayet:okuma', syncOkuma);
  $('#listenMode').title = 'Meal sesi: Diyanet Vakfı meali';
}
setMode('tr');
const init = LOCAL ? readHash() : { chart: false, a: null };
computeHits(); renderChips();
resize(); stars(); buildBuckets();
Object.assign(cam, fitCam());
renderStats(); renderHisto();
let rT; window.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => { const f = fitCam(); resize(); Object.assign(cam, fitCam()); renderHisto(); stars(); needs = true; }, 120); });
new ResizeObserver(() => { resize(); needs = true; }).observe(map);
$('#loading').classList.add('done');
setTimeout(() => $('#loading').remove(), 700);
intro.t0 = performance.now(); intro.on = !init.a; needs = true;
requestAnimationFrame(loop);
/* tema düğmesi: otomatik → koyu → açık */
const THEMES = { auto: ['auto', 'Tema: telefonun ayarı'], dark: ['moon', 'Tema: koyu'], light: ['sun', 'Tema: açık'] };
function themeBtn() { const b = $('#themeBtn'); if (!b || !window.ayetTheme) return; const [ic, t] = THEMES[ayetTheme()] || THEMES.auto; b.innerHTML = `<svg class="i"><use href="#i-${ic}"/></svg>`; b.title = t; b.setAttribute('aria-label', t); }
if ($('#themeBtn')) $('#themeBtn').onclick = () => { const o = ['auto', 'dark', 'light'], n = o[(o.indexOf(ayetTheme()) + 1) % 3]; ayetTheme(n); toast(THEMES[n][1]); };
addEventListener('ayet:theme', () => { readTheme(); renderHisto(); themeBtn(); needs = true; });
themeBtn();
if (init.chart) setTimeout(() => setChart(true), 400);
if (init.a) { const [s, a] = init.a.split(':').map(Number); setTimeout(() => openVerse(verseIndex(s, a), { fast: true }), 300); }
$('#hint').textContent = TOUCH ? 'Dokunun: yakınlaşır · tekrar dokunun: ayet açılır · iki parmakla yakınlaşın' : 'Sürükleyerek gezin · Ctrl + tekerlek ya da +/− ile yakınlaşın · noktaya tıklayın';
setTimeout(() => { $('#hint').style.opacity = 0; setTimeout(() => { $('#hint').hidden = true; }, 1100); }, 6000);
window.__ayet = { state, openVerse, addTerm, termsChanged }; // hata ayıklama
// Keşifler modülü (kesif.js) için arayüz
window.AYET = {
  Q, N, SUR, state, pos, vS, vA, wLem, wRoot, lemOcc, rootOcc, verseIndex, ref, sName, escHtml, fmt, toast, makeTerm,
  openVerse, closeVerse, addTerm, clearTerms, termsChanged, setChart, focusSurah, buildHash, syncHash, recolor,
  resultCount: () => resultIds().length,
  resultIds: () => resultIds(),
  tweenCam, fitCam, w2s, cardOpen: () => !card.hidden, curBounds: () => cur.b, curP: () => cur.P, cam,
  setOverlay(fn) { overlay = fn; needs = true; }, redraw() { needs = true; },
  setExtraHash(h) { extraHash = h; buildHash(); syncHash(); }, LOCAL,
  mealText: id => mealText[id], mealName, cardIndex: () => selected, cardMeal: () => state.cardMeal, stopAudio: () => { if (playing) stopAudio(); },
  setPlaying(i) { playI = i; needs = true; }, juz: i => Q.verses[i][5]
};
})();
