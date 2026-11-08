/* Ayet Haritası · Dinle (Kur'an oynatıcı), Namaz vakitleri, Kıble
   Hepsi cihazda çalışır. Ses kayıtları everyayah.com'dan gelir; konum cihazdan çıkmaz. */
(() => {
'use strict';
const A = window.AYET; if (!A) return;
const $ = s => document.querySelector(s);
const side = $('.side'), anchor = $('.explore');
const I = n => `<svg class="i"><use href="#i-${n}"/></svg>`;
const fmt = A.fmt, SUR = A.SUR, N = A.N, vS = A.vS, vA = A.vA;
const store = {
  get(k, d) { try { const v = localStorage.getItem('ayet-' + k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } },
  set(k, v) { try { localStorage.setItem('ayet-' + k, JSON.stringify(v)); } catch (_) {} }
};
const pad3 = n => String(n).padStart(3, '0');
const vi = (s, a) => SUR[s - 1].start + a - 1;
const esc = A.escHtml;
const goTab = t => dispatchEvent(new CustomEvent('ayet:tab', { detail: t }));

/* =================================================================
   1) DİNLE
   ================================================================= */
const HAFIZ = [
  ['Alafasy_128kbps', 'Mişârî Râşid el-Afâsî'], ['Abdul_Basit_Murattal_192kbps', 'Abdülbâsıt Abdüssamed · murattal'],
  ['Abdul_Basit_Mujawwad_128kbps', 'Abdülbâsıt Abdüssamed · mücevved'], ['Husary_128kbps', 'Mahmûd Halîl el-Husarî'],
  ['Minshawy_Murattal_128kbps', 'Muhammed Sıddîk el-Minşâvî'], ['Abdurrahmaan_As-Sudais_192kbps', 'Abdurrahman es-Sudeys'],
  ['Saood_ash-Shuraym_128kbps', 'Suûd eş-Şureym'], ['MaherAlMuaiqly128kbps', 'Mâhir el-Muaykılî'],
  ['Yasser_Ad-Dussary_128kbps', 'Yâsir ed-Devserî'], ['Hudhaify_128kbps', 'Ali el-Huzeyfî'], ['Ghamadi_40kbps', 'Sa‘d el-Gâmidî']
];
const url = (h, s, a) => `https://everyayah.com/data/${h}/${pad3(s)}${pad3(a)}.mp3`;
const P = Object.assign({ src: 'sure', s: 1, from: 1, to: 7, juz: 1, hafiz: HAFIZ[0][0], rate: 1, rep: 1, loop: false, sleep: 0 }, store.get('dinle', {}));
let list = [], k = 0, playing = false, repN = 0, basNow = false, sleepT = 0, sleepAt = 0, resumeK = store.get('dinle-k', null);
const au = new Audio(), pre = new Audio(); au.preload = 'auto'; pre.preload = 'auto';

const el = document.createElement('section');
el.className = 'panel dinle'; el.id = 'dinle';
el.innerHTML = `
  <div class="ph"><h3>Kur'an dinle</h3><span class="muted small" id="dnCount"></span></div>
  <div class="dnsrc seg" role="tablist" aria-label="Ne dinlensin">
    <button data-src="sure">Sûre</button><button data-src="cuz">Cüz</button><button data-src="sonuc">Sonuçlar</button>
  </div>
  <div class="dnpick" data-for="sure">
    <select id="dnSure" aria-label="Sûre"></select>
    <div class="dnrange"><label>Ayet<input id="dnFrom" type="number" min="1" inputmode="numeric"></label><span>–</span><label><input id="dnTo" type="number" min="1" inputmode="numeric" aria-label="Son ayet"></label></div>
  </div>
  <div class="dnpick" data-for="cuz"><select id="dnJuz" aria-label="Cüz"></select></div>
  <div class="dnpick" data-for="sonuc"><p class="muted small" id="dnRes"></p></div>
  <div class="np" id="dnNow">
    <div class="nph"><b id="dnTitle">—</b><a href="#" id="dnOpen" class="small">Ayeti aç</a></div>
    <p class="npar" id="dnAr" dir="rtl" lang="ar"></p>
    <p class="nptr" id="dnTr"></p>
    <div class="npbar"><i id="dnProg"></i></div>
    <div class="npctl">
      <button class="ghost icon" id="dnPrev" aria-label="Önceki ayet" title="Önceki ayet">${I('prev')}</button>
      <button class="gold play" id="dnPlay" aria-label="Başlat">${I('play')}</button>
      <button class="ghost icon" id="dnNext" aria-label="Sonraki ayet" title="Sonraki ayet">${I('next')}</button>
    </div>
    <p class="dnresume small" id="dnResume" hidden></p>
  </div>
  <div class="dnopts">
    <label>Hâfız<select id="dnHafiz"></select></label>
    <label>Hız<select id="dnRate"><option value="0.75">0,75×</option><option value="1">1×</option><option value="1.25">1,25×</option><option value="1.5">1,5×</option></select></label>
    <label>Her ayet<select id="dnRep"><option value="1">1 kez</option><option value="2">2 kez</option><option value="3">3 kez</option><option value="5">5 kez</option><option value="10">10 kez</option></select></label>
    <label>Uyku<select id="dnSleep"><option value="0">Kapalı</option><option value="15">15 dk</option><option value="30">30 dk</option><option value="60">60 dk</option><option value="-1">Bitince dur</option></select></label>
    <label class="chk"><input type="checkbox" id="dnLoop"> Aralığı baştan tekrarla</label>
  </div>
  <p class="muted small dnnote">Ses kayıtları everyayah.com'dan gelir; dinlemek için internet gerekir. Ekran kapanınca da çalmaya devam eder; telefonun kilit ekranından yönetebilirsiniz.</p>`;
side.insertBefore(el, anchor);

$('#dnSure').innerHTML = SUR.map(s => `<option value="${s.n}">${s.n}. ${s.tr} · ${s.c} ayet</option>`).join('');
$('#dnJuz').innerHTML = Array.from({ length: 30 }, (_, j) => `<option value="${j + 1}">${j + 1}. cüz</option>`).join('');
$('#dnHafiz').innerHTML = HAFIZ.map(([v, n]) => `<option value="${v}">${n}</option>`).join('');

function buildList() {
  if (P.src === 'sure') {
    const c = SUR[P.s - 1].c; P.from = Math.min(Math.max(1, P.from | 0), c); P.to = Math.min(Math.max(P.from, P.to | 0), c);
    list = []; for (let a = P.from; a <= P.to; a++) list.push(vi(P.s, a));
  } else if (P.src === 'cuz') {
    list = []; for (let i = 0; i < N; i++) if (A.juz(i) === P.juz) list.push(i);
  } else list = A.resultIds().slice();
  store.set('dinle', P);
  syncUI();
}
function syncUI() {
  el.querySelectorAll('.dnsrc button').forEach(b => b.classList.toggle('on', b.dataset.src === P.src));
  el.querySelectorAll('.dnpick').forEach(d => d.hidden = d.dataset.for !== P.src);
  $('#dnSure').value = P.s; $('#dnFrom').value = P.from; $('#dnTo').value = P.to; $('#dnFrom').max = $('#dnTo').max = SUR[P.s - 1].c;
  $('#dnJuz').value = P.juz; $('#dnHafiz').value = P.hafiz; $('#dnRate').value = String(P.rate); $('#dnRep').value = String(P.rep); $('#dnLoop').checked = P.loop;
  const n = A.resultIds().length;
  $('#dnRes').textContent = n ? `Aramada bulunan ${fmt(n)} ayet mushaf sırasıyla çalınır.` : 'Önce yukarıdan bir kelime arayın; bulunan ayetler burada sırayla çalınır.';
  $('#dnCount').textContent = list.length ? `${fmt(list.length)} ayet` : '';
  showNow();
}
function showNow() {
  const i = list[k];
  if (i == null) { $('#dnTitle').textContent = 'Seçim boş'; $('#dnAr').textContent = ''; $('#dnTr').textContent = ''; $('#dnProg').style.width = '0'; return; }
  const v = A.Q.verses[i];
  $('#dnTitle').textContent = `${A.sName(i)} ${vA[i]}`;
  $('#dnAr').textContent = v[2]; $('#dnTr').textContent = v[4];
  $('#dnProg').style.width = (list.length > 1 ? (k / (list.length - 1)) * 100 : 100) + '%';
  $('#dnCount').textContent = `${fmt(k + 1)} / ${fmt(list.length)} ayet`;
  mini();
}
function setBtn() {
  const h = playing ? I('pause') : I('play'), l = playing ? 'Duraklat' : 'Başlat';
  for (const b of [$('#dnPlay'), $('#mnPlay')]) if (b) { b.innerHTML = h; b.setAttribute('aria-label', l); b.title = l; }
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
}
function needBasmala(i) { return vA[i] === 1 && vS[i] !== 1 && vS[i] !== 9; }
function load(i, withBas) {
  basNow = !!withBas;
  au.src = basNow ? url(P.hafiz, 1, 1) : url(P.hafiz, vS[i], vA[i]);
  au.playbackRate = P.rate; au.defaultPlaybackRate = P.rate;
  return au.play();
}
function preloadNext() {
  const j = list[k + 1] ?? (P.loop ? list[0] : null);
  if (j != null) { pre.src = url(P.hafiz, vS[j], vA[j]); pre.load(); }
}
function play(fresh) {
  if (!list.length) buildList();
  if (!list.length) { A.toast(P.src === 'sonuc' ? 'Önce bir kelime arayın' : 'Seçim boş'); return; }
  A.stopAudio();
  const i = list[k]; playing = true; setBtn(); showNow(); A.setPlaying(i);
  if (fresh !== false) repN = 0;
  load(i, fresh !== false && repN === 0 && needBasmala(i)).catch(err => { if (err && err.name === 'AbortError') return; fail(); });
  meta(i); preloadNext(); mini();
  store.set('dinle-k', { k, key: key() }); $('#dnResume').hidden = true;
}
function pause() { playing = false; au.pause(); setBtn(); }
function toggle() { playing ? pause() : (au.src && au.currentTime > 0 && !au.ended ? (A.stopAudio(), au.play().then(() => { playing = true; setBtn(); }, fail)) : play()); }
function go(d) { if (!list.length) return; k = Math.max(0, Math.min(list.length - 1, k + d)); repN = 0; play(); }
function stopAll() { pause(); au.removeAttribute('src'); A.setPlaying(-1); mini(); }
function fail() { playing = false; setBtn(); A.toast('Tilavet yüklenemedi; internet bağlantınızı kontrol edin'); }
au.onended = () => {
  if (basNow) { load(list[k], false).catch(fail); return; }
  if (++repN < P.rep) { load(list[k], false).catch(fail); return; }
  repN = 0;
  if (k + 1 < list.length) { k++; play(false); }
  else if (P.loop && P.sleep !== -1) { k = 0; play(false); }
  else { playing = false; setBtn(); A.setPlaying(-1); if (P.sleep === -1) setSleep(0); A.toast('Dinleme bitti'); }
};
au.onerror = () => { if (au.getAttribute('src')) fail(); };
const key = () => P.src === 'sure' ? `s${P.s}:${P.from}-${P.to}` : P.src === 'cuz' ? `c${P.juz}` : 'r';
function setSleep(m) {
  P.sleep = m; clearTimeout(sleepT); sleepAt = 0; $('#dnSleep').value = String(m); store.set('dinle', P);
  if (m > 0) { sleepAt = Date.now() + m * 60000; sleepT = setTimeout(() => { pause(); setSleep(0); A.toast('Uyku zamanlayıcısı: dinleme durdu'); }, m * 60000); }
  mini();
}
function meta(i) {
  if (!('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({ title: `${A.sName(i)} ${vA[i]}`, artist: (HAFIZ.find(h => h[0] === P.hafiz) || HAFIZ[0])[1], album: 'Ayet Haritası',
      artwork: [{ src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }] });
  } catch (_) {}
}
if ('mediaSession' in navigator) {
  const ms = navigator.mediaSession, h = (a, f) => { try { ms.setActionHandler(a, f); } catch (_) {} };
  h('play', () => toggle()); h('pause', () => pause()); h('previoustrack', () => go(-1)); h('nexttrack', () => go(1)); h('stop', () => stopAll());
}

el.querySelector('.dnsrc').onclick = e => { const b = e.target.closest('button[data-src]'); if (!b) return; P.src = b.dataset.src; k = 0; stopAll(); buildList(); };
$('#dnSure').onchange = e => { P.s = +e.target.value; P.from = 1; P.to = SUR[P.s - 1].c; k = 0; const was = playing; buildList(); if (was) play(); else stopAll(); };
$('#dnFrom').onchange = e => { P.from = +e.target.value; if (P.to < P.from) P.to = P.from; k = 0; buildList(); };
$('#dnTo').onchange = e => { P.to = +e.target.value; k = 0; buildList(); };
$('#dnJuz').onchange = e => { P.juz = +e.target.value; k = 0; const was = playing; buildList(); if (was) play(); else stopAll(); };
$('#dnHafiz').onchange = e => { P.hafiz = e.target.value; store.set('dinle', P); if (playing) play(false); };
$('#dnRate').onchange = e => { P.rate = +e.target.value; au.playbackRate = P.rate; store.set('dinle', P); };
$('#dnRep').onchange = e => { P.rep = +e.target.value; store.set('dinle', P); };
$('#dnLoop').onchange = e => { P.loop = e.target.checked; store.set('dinle', P); };
$('#dnSleep').onchange = e => setSleep(+e.target.value);
$('#dnPlay').onclick = toggle; $('#dnPrev').onclick = () => go(-1); $('#dnNext').onclick = () => go(1);
$('#dnOpen').onclick = e => { e.preventDefault(); if (list[k] != null) A.openVerse(list[k]); };
addEventListener('ayet:cardplay', () => { if (playing) pause(); });
addEventListener('ayet:stats', () => { if (P.src === 'sonuc' && !playing) { k = 0; buildList(); } else syncUI(); });

/* mini oynatıcı */
const mn = document.createElement('div');
mn.className = 'mini-pl'; mn.id = 'mini'; mn.hidden = true;
mn.innerHTML = `<button class="mnt" id="mnOpen" title="Dinle bölümünü aç"><span class="mnd" aria-hidden="true"></span><span><b id="mnTitle"></b><small id="mnSub"></small></span></button>
  <button class="gold icon" id="mnPlay" aria-label="Başlat">${I('play')}</button>
  <button class="ghost icon" id="mnNext" aria-label="Sonraki ayet">${I('next')}</button>
  <button class="ghost icon" id="mnClose" aria-label="Dinlemeyi kapat">${I('x')}</button>`;
document.body.appendChild(mn);
function mini() {
  const i = list[k], on = !!au.getAttribute('src') && i != null;
  mn.hidden = !on; document.body.classList.toggle('has-mini', on);
  if (!on) return;
  $('#mnTitle').textContent = `${A.sName(i)} ${vA[i]}`;
  const hz = (HAFIZ.find(h => h[0] === P.hafiz) || HAFIZ[0])[1].split(' · ')[0];
  $('#mnSub').textContent = `${hz} · ${fmt(k + 1)}/${fmt(list.length)}${sleepAt ? ` · ${Math.max(1, Math.round((sleepAt - Date.now()) / 60000))} dk sonra durur` : ''}`;
}
$('#mnPlay').onclick = toggle; $('#mnNext').onclick = () => go(1); $('#mnClose').onclick = () => { stopAll(); };
$('#mnOpen').onclick = () => goTab('dinle');
setInterval(() => { if (sleepAt && !mn.hidden) mini(); }, 30000);

// ilk açılış: kayıtlı seçimi hazırla, kaldığı yeri göster
buildList();
if (resumeK && resumeK.key === key() && resumeK.k > 0 && resumeK.k < list.length) {
  k = resumeK.k; showNow();
  const r = $('#dnResume'); r.hidden = false;
  r.innerHTML = `Kaldığınız yer: <b>${A.sName(list[k])} ${vA[list[k]]}</b> · <a href="#" id="dnFromStart">baştan başlat</a>`;
  $('#dnFromStart').onclick = e => { e.preventDefault(); k = 0; r.hidden = true; showNow(); };
}
window.DINLE = { play, pause, toggle, go, setList(ids, i0 = 0) { P.src = 'sonuc'; list = ids; k = i0; syncUI(); play(); } };

/* =================================================================
   2) NAMAZ VAKİTLERİ  (Diyanet yöntemine yakın hesap, cihazda)
   ================================================================= */
const IL = 'Adana 37.00 35.32|Adıyaman 37.76 38.28|Afyonkarahisar 38.76 30.54|Ağrı 39.72 43.05|Aksaray 38.37 34.03|Amasya 40.65 35.83|Ankara 39.93 32.86|Antalya 36.89 30.71|Ardahan 41.11 42.70|Artvin 41.18 41.82|Aydın 37.85 27.84|Balıkesir 39.65 27.88|Bartın 41.64 32.34|Batman 37.88 41.13|Bayburt 40.26 40.23|Bilecik 40.14 29.98|Bingöl 38.88 40.50|Bitlis 38.40 42.11|Bolu 40.74 31.61|Burdur 37.72 30.29|Bursa 40.19 29.06|Çanakkale 40.15 26.41|Çankırı 40.60 33.62|Çorum 40.55 34.95|Denizli 37.78 29.09|Diyarbakır 37.91 40.24|Düzce 40.84 31.16|Edirne 41.68 26.56|Elazığ 38.67 39.22|Erzincan 39.75 39.49|Erzurum 39.90 41.27|Eskişehir 39.78 30.52|Gaziantep 37.07 37.38|Giresun 40.91 38.39|Gümüşhane 40.46 39.48|Hakkâri 37.58 43.74|Hatay 36.20 36.16|Iğdır 39.92 44.04|Isparta 37.76 30.55|İstanbul 41.01 28.98|İzmir 38.42 27.14|Kahramanmaraş 37.58 36.94|Karabük 41.20 32.63|Karaman 37.18 33.22|Kars 40.60 43.10|Kastamonu 41.38 33.78|Kayseri 38.73 35.49|Kilis 36.72 37.12|Kırıkkale 39.85 33.51|Kırklareli 41.73 27.22|Kırşehir 39.15 34.17|Kocaeli 40.77 29.92|Konya 37.87 32.48|Kütahya 39.42 29.98|Malatya 38.35 38.31|Manisa 38.61 27.43|Mardin 37.31 40.74|Mersin 36.81 34.64|Muğla 37.22 28.36|Muş 38.74 41.49|Nevşehir 38.62 34.71|Niğde 37.97 34.68|Ordu 40.98 37.88|Osmaniye 37.07 36.25|Rize 41.03 40.52|Sakarya 40.78 30.40|Samsun 41.29 36.33|Siirt 37.93 41.94|Sinop 42.03 35.15|Sivas 39.75 37.02|Şanlıurfa 37.16 38.79|Şırnak 37.52 42.46|Tekirdağ 40.98 27.51|Tokat 40.31 36.55|Trabzon 41.00 39.72|Tunceli 39.11 39.55|Uşak 38.68 29.41|Van 38.49 43.38|Yalova 40.66 29.27|Yozgat 39.82 34.81|Zonguldak 41.45 31.79'
  .split('|').map(x => { const [n, la, lo] = x.split(' '); return { n, lat: +la, lng: +lo }; });
const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
const dsin = d => Math.sin(rad(d)), dcos = d => Math.cos(rad(d)), dtan = d => Math.tan(rad(d));
const fix = (a, b) => { a -= b * Math.floor(a / b); return a < 0 ? a + b : a; };
function sunPos(jd) {
  const D = jd - 2451545, g = fix(357.529 + 0.98560028 * D, 360), q = fix(280.459 + 0.98564736 * D, 360);
  const L = fix(q + 1.915 * dsin(g) + 0.020 * dsin(2 * g), 360), e = 23.439 - 0.00000036 * D;
  const RA = deg(Math.atan2(dcos(e) * dsin(L), dcos(L))) / 15;
  return { decl: deg(Math.asin(dsin(e) * dsin(L))), eqt: q / 15 - fix(RA, 24) };
}
function julian(y, m, d) { if (m <= 2) { y -= 1; m += 12; } const a = Math.floor(y / 100), b = 2 - a + Math.floor(a / 4); return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5; }
// Diyanet: imsak 18°, yatsı 17°, ikindi Şâfiî (gölge = 1 boy); temkin: güneş −7, öğle +5, ikindi +4, akşam +7 dk
const ADJ = { imsak: 0, gunes: -7, ogle: 5, ikindi: 4, aksam: 7, yatsi: 0 };
function vakitler(y, m, d, lat, lng) {
  const jd0 = julian(y, m, d) - lng / (15 * 24);
  const mid = t => fix(12 - sunPos(jd0 + t).eqt, 24);
  const ang = (a, t, ccw) => { const { decl } = sunPos(jd0 + t); const T = deg(Math.acos((-dsin(a) - dsin(decl) * dsin(lat)) / (dcos(decl) * dcos(lat)))) / 15; return mid(t) + (ccw ? -T : T); };
  const asr = t => { const { decl } = sunPos(jd0 + t); return ang(-deg(Math.atan(1 / (1 + dtan(Math.abs(lat - decl))))), t); };
  let t = { imsak: 5, gunes: 6, ogle: 12, ikindi: 13, aksam: 18, yatsi: 18 };
  for (let it = 0; it < 2; it++) { const p = x => t[x] / 24; t = { imsak: ang(18, p('imsak'), true), gunes: ang(0.833, p('gunes'), true), ogle: mid(p('ogle')), ikindi: asr(p('ikindi')), aksam: ang(0.833, p('aksam')), yatsi: ang(17, p('yatsi')) }; }
  const out = {}; for (const x in t) { const h = t[x] - lng / 15 + ADJ[x] / 60; out[x] = isFinite(h) ? Date.UTC(y, m - 1, d) + Math.round(h * 60) * 60000 : null; }
  return out;
}
const VN = [['imsak', 'İmsak'], ['gunes', 'Güneş'], ['ogle', 'Öğle'], ['ikindi', 'İkindi'], ['aksam', 'Akşam'], ['yatsi', 'Yatsı']];
const KAABA = [21.4225, 39.8262];
const qibla = (la, lo) => { const dl = rad(KAABA[1] - lo); return fix(deg(Math.atan2(Math.sin(dl), Math.cos(rad(la)) * Math.tan(rad(KAABA[0])) - Math.sin(rad(la)) * Math.cos(dl))), 360); };
const distKm = (la, lo) => { const a = Math.sin(rad(KAABA[0] - la) / 2) ** 2 + Math.cos(rad(la)) * Math.cos(rad(KAABA[0])) * Math.sin(rad(KAABA[1] - lo) / 2) ** 2; return 6371 * 2 * Math.asin(Math.sqrt(a)); };
const YON = ['kuzey', 'kuzeydoğu', 'doğu', 'güneydoğu', 'güney', 'güneybatı', 'batı', 'kuzeybatı'];
const localTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (_) { return 'UTC'; } };

let LOC = store.get('konum', null);
const vk = document.createElement('section');
vk.className = 'panel vakit'; vk.id = 'vakit';
vk.innerHTML = `
  <div class="ph"><h3>Namaz vakitleri</h3><button class="ghost small" id="vkLocBtn">${I('pin')}<span id="vkLocName">Konum seç</span></button></div>
  <div class="vkpick" id="vkPick" hidden>
    <button class="gold" id="vkGps">${I('target')}Konumumu kullan</button>
    <select id="vkIl" aria-label="İl seçin"><option value="">ya da il seçin…</option>${IL.map((c, j) => `<option value="${j}">${c.n}</option>`).join('')}</select>
    <p class="muted small">Konumunuz yalnız bu cihazda saklanır, hiçbir yere gönderilmez.</p>
  </div>
  <div id="vkBody"></div>
  <div class="kible" id="kible">
    <div class="ph"><h3>Kıble</h3><span class="muted small" id="kbTxt"></span></div>
    <div class="kbdial" id="kbDial" aria-hidden="true">
      <svg viewBox="0 0 200 200"><g id="kbRose"><circle cx="100" cy="100" r="92" class="kbring"/>
        ${Array.from({ length: 72 }, (_, j) => `<line x1="100" y1="${j % 18 ? 12 : 9}" x2="100" y2="${j % 6 ? 16 : 22}" transform="rotate(${j * 5} 100 100)" class="kbtick${j % 18 ? '' : ' big'}"/>`).join('')}
        <text x="100" y="40" class="kbn">K</text><text x="164" y="105" class="kbl">D</text><text x="100" y="170" class="kbl">G</text><text x="36" y="105" class="kbl">B</text></g>
        <g id="kbNeedle"><line x1="100" y1="100" x2="100" y2="30" class="kbneedle"/><rect x="91" y="18" width="18" height="18" rx="3" class="kbkaaba"/><line x1="91" y1="23" x2="109" y2="23" class="kbband"/></g>
        <circle cx="100" cy="100" r="5" class="kbhub"/></svg>
    </div>
    <button class="ghost" id="kbStart">${I('compass')}Pusulayı aç</button>
    <p class="muted small" id="kbNote">Telefonu yere paralel tutun. Metal eşyalar ve mıknatıslı kılıflar pusulayı saptırabilir; sapma görürseniz telefonu havada 8 çizerek kalibre edin.</p>
  </div>
  <p class="muted small vknote">Vakitler cihazda, Diyanet’in kullandığı açılar ve temkin süreleriyle hesaplanır; resmî takvimden 1–2 dakika sapabilir. Vakit bildirimleri Android uygulamasına ekleniyor.</p>`;
side.insertBefore(vk, anchor);

function dateParts(ms, tz) {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms));
  const [y, m, d] = f.split('-').map(Number); return { y, m, d };
}
const hm = (ms, tz) => ms == null ? '—' : new Intl.DateTimeFormat('tr-TR', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(new Date(ms));
function dayTimes(off = 0) {
  const { y, m, d } = dateParts(Date.now() + off * 864e5, LOC.tz);
  return vakitler(y, m, d, LOC.lat, LOC.lng);
}
function renderVakit() {
  $('#vkLocName').textContent = LOC ? LOC.name : 'Konum seç';
  if (!LOC) {
    $('#vkBody').innerHTML = `<div class="vkempty"><p>Bulunduğunuz yerin namaz vakitlerini ve kıble yönünü görmek için konum seçin.</p></div>`;
    $('#vkPick').hidden = false; $('#kible').hidden = true; return;
  }
  $('#kible').hidden = false;
  const now = Date.now(), T = dayTimes(0);
  let nextK = VN.find(([x]) => T[x] > now), nextMs, curK;
  if (nextK) nextMs = T[nextK[0]]; else { nextK = VN[0]; nextMs = dayTimes(1).imsak; }
  const passed = VN.filter(([x]) => T[x] <= now); curK = passed.length ? passed[passed.length - 1][0] : 'yatsi';
  const left = Math.max(0, nextMs - now), hh = Math.floor(left / 3600e3), mm = Math.floor(left % 3600e3 / 60e3), ss = Math.floor(left % 60e3 / 1e3);
  let hicri = ''; try { hicri = new Intl.DateTimeFormat('tr-TR-u-ca-islamic-umalqura', { timeZone: LOC.tz, day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()); } catch (_) {}
  const miladi = new Intl.DateTimeFormat('tr-TR', { timeZone: LOC.tz, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  $('#vkBody').innerHTML = `
    <div class="vknext"><small>${nextK[1]} vaktine</small><b>${hh ? `${hh} sa ` : ''}${String(mm).padStart(hh ? 2 : 1, '0')} dk <span>${String(ss).padStart(2, '0')} sn</span></b><small>${hm(nextMs, LOC.tz)} · ${miladi}${hicri ? ' · ' + hicri.replace(/ AH$/, '') : ''}</small></div>
    <ol class="vklist">${VN.map(([x, n]) => `<li class="${x === curK ? 'cur' : ''}${x === nextK[0] ? ' next' : ''}"><span>${n}</span><b>${hm(T[x], LOC.tz)}</b></li>`).join('')}</ol>`;
  const q = qibla(LOC.lat, LOC.lng);
  $('#kbTxt').textContent = `${Math.round(q)}° · ${YON[Math.round(q / 45) % 8]} · Kâbe’ye ${fmt(Math.round(distKm(LOC.lat, LOC.lng)))} km`;
  rotate();
}
function setLoc(l) { LOC = l; store.set('konum', l); $('#vkPick').hidden = true; renderVakit(); }
$('#vkLocBtn').onclick = () => { $('#vkPick').hidden = !$('#vkPick').hidden; };
$('#vkIl').onchange = e => { const c = IL[+e.target.value]; if (c) setLoc({ name: c.n, lat: c.lat, lng: c.lng, tz: 'Europe/Istanbul' }); };
$('#vkGps').onclick = () => {
  if (!navigator.geolocation) { A.toast('Bu cihaz konum vermiyor; il seçin'); return; }
  $('#vkGps').disabled = true;
  navigator.geolocation.getCurrentPosition(p => {
    $('#vkGps').disabled = false;
    const la = +p.coords.latitude.toFixed(3), lo = +p.coords.longitude.toFixed(3);
    const near = IL.map(c => [c, Math.hypot(c.lat - la, (c.lng - lo) * Math.cos(rad(la)))]).sort((a, b) => a[1] - b[1])[0];
    setLoc({ name: near && near[1] < 0.6 ? `${near[0].n} (konum)` : 'Bulunduğum yer', lat: la, lng: lo, tz: localTz() });
  }, err => { $('#vkGps').disabled = false; A.toast(err.code === 1 ? 'Konum izni verilmedi; il seçebilirsiniz' : 'Konum alınamadı; il seçin'); }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 6 * 3600e3 });
};
setInterval(() => { if (LOC && !vk.hidden) renderVakit(); }, 1000);

/* =================================================================
   3) KIBLE PUSULASI
   ================================================================= */
let heading = null, compassOn = false;
function rotate() {
  if (!LOC) return;
  const q = qibla(LOC.lat, LOC.lng), h = heading ?? 0;
  $('#kbRose').setAttribute('transform', `rotate(${-h} 100 100)`);
  $('#kbNeedle').setAttribute('transform', `rotate(${q - h} 100 100)`);
  const off = ((q - h + 540) % 360) - 180, ok = heading != null && Math.abs(off) < 4;
  $('#kbDial').classList.toggle('ok', ok);
  if (heading != null) $('#kbNote').textContent = ok ? 'Kıbleye dönüksünüz.' : `Kıble için ${Math.abs(Math.round(off))}° ${off > 0 ? 'sağa' : 'sola'} dönün.`;
}
function onOri(e) {
  let h = null;
  if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading;
  else if (e.absolute && e.alpha != null) h = 360 - e.alpha;
  if (h == null) return;
  const so = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
  h = fix(h + so, 360);
  heading = heading == null ? h : fix(heading + (((h - heading + 540) % 360) - 180) * 0.25, 360);
  rotate();
}
$('#kbStart').onclick = async () => {
  if (compassOn) return;
  try {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      if (await DeviceOrientationEvent.requestPermission() !== 'granted') { A.toast('Pusula izni verilmedi'); return; }
    }
  } catch (_) {}
  if ('ondeviceorientationabsolute' in window) addEventListener('deviceorientationabsolute', onOri);
  else addEventListener('deviceorientation', onOri);
  compassOn = true; $('#kbStart').hidden = true;
  setTimeout(() => { if (heading == null) { $('#kbNote').textContent = 'Bu cihazda pusula algılayıcısı bulunamadı. Kadranda kuzey yukarıda; kıble, kuzeyden saat yönünde yazan derece kadar.'; } }, 2500);
};
if (!('DeviceOrientationEvent' in window)) $('#kbStart').hidden = true;

renderVakit();
})();
