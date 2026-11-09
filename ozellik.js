/* Ayet Haritası · Dinle (Kur'an oynatıcı), Namaz vakitleri, Kıble
   Hepsi cihazda çalışır. Ses kayıtları everyayah.com'dan gelir; konum cihazdan çıkmaz. */
(() => {
'use strict';
const A = window.AYET; if (!A) return;
const $ = s => document.querySelector(s);
const side = $('.side'), anchor = $('.explore');
const I = n => `<svg class="i"><use href="#i-${n}"/></svg>`;
const fmt = A.fmt, SUR = A.SUR, N = A.N, vS = A.vS, vA = A.vA, esc = A.escHtml;
const store = {
  get(k, d) { try { const v = localStorage.getItem('ayet-' + k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } },
  set(k, v) { try { localStorage.setItem('ayet-' + k, JSON.stringify(v)); } catch (_) {} }
};
const pad3 = n => String(n).padStart(3, '0');
const vi = (s, a) => SUR[s - 1].start + a - 1;
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
// Türkçe meal sesi: Diyanet Vakfı meali, alquran.cloud (islamic.network) · ayet sırası 1–6236
const mealUrl = i => `https://cdn.islamic.network/quran/audio/128/tr.vakfi-audio/${i + 1}.mp3`;
const OKUMA = [['ar', 'Arapça'], ['tr', 'Türkçe meal'], ['artr', 'Arapça + meal']];
const okuma = () => { const v = store.get('okuma', 'ar'); return OKUMA.some(o => o[0] === v) ? v : 'ar'; };
const P = Object.assign({ src: 'sure', s: 1, from: 1, to: 7, juz: 1, hafiz: HAFIZ[0][0], rate: 1, rep: 1, loop: false, sleep: 0 }, store.get('dinle', {}));
let custom = store.get('dinle-liste', []), list = [], k = 0, playing = false, repN = 0, parts = [], ph = 0, sleepT = 0, sleepAt = 0, resumeK = store.get('dinle-k', null);
if (P.src === 'liste' && !custom.length) P.src = 'sure';
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
  <div class="dnpick" data-for="liste"><p class="muted small" id="dnListe"></p></div>
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
    <label>Okuma<select id="dnOkuma">${OKUMA.map(([v, n]) => `<option value="${v}">${n}</option>`).join('')}</select></label>
    <label>Hâfız<select id="dnHafiz"></select></label>
    <details class="dnmore" id="dnMore"><summary><svg class="i"><use href="#i-sliders"/></svg>Ayarlar<small id="dnMoreSum"></small></summary><div class="dnmore-b">
    <label>Hız<select id="dnRate"><option value="0.75">0,75×</option><option value="1">1×</option><option value="1.25">1,25×</option><option value="1.5">1,5×</option></select></label>
    <label>Her ayet<select id="dnRep"><option value="1">1 kez</option><option value="2">2 kez</option><option value="3">3 kez</option><option value="5">5 kez</option><option value="10">10 kez</option></select></label>
    <label>Uyku<select id="dnSleep"><option value="0">Kapalı</option><option value="15">15 dk</option><option value="30">30 dk</option><option value="60">60 dk</option><option value="-1">Bitince dur</option></select></label>
    <label class="chk"><input type="checkbox" id="dnLoop"> Aralığı baştan tekrarla</label>
    </div></details>
  </div>
  <p class="muted small dnnote">Arapça tilavet everyayah.com'dan, Türkçe meal sesi (Diyanet Vakfı meali) alquran.cloud'dan gelir; dinlemek için internet gerekir. Ekran kapanınca da çalmaya devam eder; telefonun kilit ekranından yönetebilirsiniz.</p>`;
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
  } else if (P.src === 'liste') {
    list = custom.slice();
  } else list = A.resultIds().slice();
  store.set('dinle', P);
  syncUI();
}
function syncUI() {
  el.querySelectorAll('.dnsrc button').forEach(b => b.classList.toggle('on', b.dataset.src === P.src));
  el.querySelectorAll('.dnpick').forEach(d => d.hidden = d.dataset.for !== P.src);
  $('#dnSure').value = P.s; $('#dnFrom').value = P.from; $('#dnTo').value = P.to; $('#dnFrom').max = $('#dnTo').max = SUR[P.s - 1].c;
  $('#dnJuz').value = P.juz; $('#dnHafiz').value = P.hafiz; $('#dnRate').value = String(P.rate); $('#dnRep').value = String(P.rep); $('#dnLoop').checked = P.loop; $('#dnOkuma').value = okuma(); $('#dnHafiz').disabled = okuma() === 'tr';
  const n = A.resultIds().length;
  $('#dnRes').textContent = n ? `Aramada bulunan ${fmt(n)} ayet, Sonuçlar listesindeki sırayla çalınır.` : 'Önce yukarıdan bir kelime arayın; bulunan ayetler burada sırayla çalınır.';
  $('#dnListe').textContent = `${P.listName || 'Seçilen liste'}: ${fmt(custom.length)} ayet sırayla çalınır. Sûre ya da cüz seçerek bu listeden çıkabilirsiniz.`;
  $('#dnCount').textContent = list.length ? `${fmt(list.length)} ayet` : '';
  const sl = +$('#dnSleep').value;
  $('#dnMoreSum').textContent = [String(P.rate).replace('.', ',') + '×', P.rep > 1 ? `her ayet ${P.rep} kez` : '', sl > 0 ? `uyku ${sl} dk` : sl < 0 ? 'bitince dur' : '', P.loop ? 'tekrar' : ''].filter(Boolean).join(' · ');
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
// bir ayetin çalınacak parçaları: (besmele) + Arapça / meal
function partsOf(i, withBas) {
  const m = okuma(), out = [];
  if (withBas && m !== 'tr') out.push('bas');
  if (m !== 'tr') out.push('ar');
  if (m !== 'ar') out.push('tr');
  return out;
}
function srcOf(i, part) { return part === 'bas' ? url(P.hafiz, 1, 1) : part === 'tr' ? mealUrl(i) : url(P.hafiz, vS[i], vA[i]); }
function load(i, part) {
  au.src = srcOf(i, part);
  au.playbackRate = P.rate; au.defaultPlaybackRate = P.rate;
  return au.play();
}
function preloadNext() {
  const j = list[k + 1] ?? (P.loop ? list[0] : null);
  if (j != null) { pre.src = srcOf(j, partsOf(j, needBasmala(j))[0]); pre.load(); }
}
function play(fresh) {
  if (!list.length) buildList();
  if (!list.length) { A.toast(P.src === 'sonuc' ? 'Önce bir kelime arayın' : 'Seçim boş'); return; }
  A.stopAudio();
  const i = list[k]; playing = true; setBtn(); showNow(); A.setPlaying(i);
  if (fresh !== false) repN = 0;
  parts = partsOf(i, fresh !== false && repN === 0 && needBasmala(i)); ph = 0;
  load(i, parts[0]).catch(err => { if (err && err.name === 'AbortError') return; fail(); });
  meta(i); preloadNext(); mini();
  store.set('dinle-k', { k, key: key() }); $('#dnResume').hidden = true;
}
function pause() { playing = false; au.pause(); setBtn(); }
function toggle() { playing ? pause() : (au.src && au.currentTime > 0 && !au.ended ? (A.stopAudio(), au.play().then(() => { playing = true; setBtn(); }, fail)) : play()); }
function go(d) { if (!list.length) return; k = Math.max(0, Math.min(list.length - 1, k + d)); repN = 0; play(); }
function stopAll() { pause(); au.removeAttribute('src'); A.setPlaying(-1); mini(); }
function fail() { playing = false; setBtn(); A.toast(parts[ph] === 'tr' ? 'Meal sesi yüklenemedi; internet bağlantınızı kontrol edin' : 'Tilavet yüklenemedi; internet bağlantınızı kontrol edin'); }
au.onended = () => {
  if (++ph < parts.length) { load(list[k], parts[ph]).catch(fail); return; }
  if (++repN < P.rep) { parts = parts.filter(x => x !== 'bas'); ph = 0; load(list[k], parts[0]).catch(fail); return; }
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
    navigator.mediaSession.metadata = new MediaMetadata({ title: `${A.sName(i)} ${vA[i]}`, artist: okuma() === 'tr' ? 'Türkçe meal · Diyanet Vakfı' : (HAFIZ.find(h => h[0] === P.hafiz) || HAFIZ[0])[1] + (okuma() === 'artr' ? ' + meal' : ''), album: 'Ayet Haritası',
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
$('#dnOkuma').onchange = e => { store.set('okuma', e.target.value); dispatchEvent(new Event('ayet:okuma')); syncUI(); if (playing) play(false); };
addEventListener('ayet:okuma', () => { $('#dnOkuma').value = okuma(); $('#dnHafiz').disabled = okuma() === 'tr'; });
$('#dnHafiz').onchange = e => { P.hafiz = e.target.value; store.set('dinle', P); if (playing) play(false); };
$('#dnRate').onchange = e => { P.rate = +e.target.value; au.playbackRate = P.rate; store.set('dinle', P); };
$('#dnRep').onchange = e => { P.rep = +e.target.value; store.set('dinle', P); };
$('#dnLoop').onchange = e => { P.loop = e.target.checked; store.set('dinle', P); };
$('#dnSleep').onchange = e => setSleep(+e.target.value);
$('#dnMore').addEventListener('change', () => setTimeout(syncUI));
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
  const hz = okuma() === 'tr' ? 'Türkçe meal' : (HAFIZ.find(h => h[0] === P.hafiz) || HAFIZ[0])[1].split(' · ')[0] + (okuma() === 'artr' ? ' + meal' : '');
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
window.DINLE = { play, pause, toggle, go, setList(ids, i0 = 0, name) { if (name) { P.src = 'liste'; P.listName = name; custom = ids.slice(); store.set('dinle-liste', custom); store.set('dinle', P); } else P.src = 'sonuc'; list = ids; k = i0; syncUI(); play(); },
  sure(n) { P.src = 'sure'; P.s = n; P.from = 1; P.to = SUR[n - 1].c; k = 0; stopAll(); buildList(); play(); } };

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
  <div class="gunun" id="gunun"></div>
  <div class="ph"><h3>Namaz vakitleri</h3><button class="ghost small" id="vkLocBtn">${I('pin')}<span id="vkLocName">Konum seç</span></button></div>
  <div class="vkpick" id="vkPick" hidden>
    <button class="gold" id="vkGps">${I('target')}Konumumu kullan</button>
    <select id="vkIl" aria-label="İl seçin"><option value="">ya da il seçin…</option>${IL.map((c, j) => `<option value="${j}">${c.n}</option>`).join('')}</select>
    <p class="muted small">Konumunuz yalnız bu cihazda saklanır, hiçbir yere gönderilmez.</p>
  </div>
  <div id="vkBody"></div>
  <div class="ozel" id="ozel"></div>
  <details class="imsakiye" id="imsakiye"><summary><b>İmsakiye</b><small>Aylık vakit cetveli</small></summary>
    <div class="imh"><select id="imSel" aria-label="Ay"></select><button class="ghost small" id="imCopy">${I('copy')}Kopyala</button></div>
    <div class="imwrap" id="imBody"></div>
  </details>
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
  <p class="muted small vknote">Vakitler cihazda, Diyanet’in kullandığı açılar ve temkin süreleriyle hesaplanır; resmî takvimden 1–2 dakika sapabilir. Vakit bildirimleri ve ana ekran widget’ı Android uygulamasında.</p>`;
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
const HAY = ['Muharrem', 'Safer', 'Rebiülevvel', 'Rebiülahir', 'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban', 'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'];
// Hicrî ay başları (Ümmülkura; 2026–2027 Diyanet takvimiyle karşılaştırıldı). yyAAgg:yıl.ay
const HST = '260616:1448.1 260715:1448.2 260814:1448.3 260912:1448.4 261012:1448.5 261111:1448.6 261210:1448.7 270109:1448.8 270208:1448.9 270309:1448.10 270408:1448.11 270507:1448.12 270606:1449.1 270705:1449.2 270803:1449.3 270902:1449.4 271001:1449.5 271031:1449.6 271129:1449.7 271229:1449.8 280128:1449.9 280226:1449.10 280327:1449.11 280426:1449.12 280525:1450.1 280624:1450.2 280723:1450.3 280822:1450.4 280920:1450.5 281019:1450.6 281118:1450.7 281217:1450.8 290116:1450.9 290214:1450.10 290316:1450.11 290415:1450.12 290514:1451.1 290613:1451.2 290713:1451.3 290812:1451.4 290910:1451.5 291009:1451.6 291108:1451.7 291207:1451.8 300105:1451.9 300204:1451.10 300306:1451.11 300404:1451.12 300504:1452.1 300603:1452.2 300702:1452.3 300801:1452.4 300831:1452.5 300929:1452.6 301028:1452.7 301127:1452.8 301226:1452.9'
  .split(' ').map(x => { const [g, h] = x.split(':'), [y, m] = h.split('.').map(Number); return { t: Date.UTC(2000 + +g.slice(0, 2), +g.slice(2, 4) - 1, +g.slice(4, 6)), y, m }; });
const utcDay = (y, m, d) => Date.UTC(y, m - 1, d);
function hicriOf(y, m, d) { // miladi gün → { y, m, d } ya da tablo dışındaysa null
  const t = utcDay(y, m, d); let r = null;
  for (const x of HST) { if (x.t <= t) r = x; else break; }
  if (!r || t - r.t > 30 * 864e5) return null;
  return { y: r.y, m: r.m, d: Math.round((t - r.t) / 864e5) + 1 };
}
function hicriTarih(tz) {
  { const { y, m, d } = dateParts(Date.now(), tz), h = hicriOf(y, m, d); if (h) return `${h.d} ${HAY[h.m - 1]} ${h.y}`; }
  // tarayıcı Ümmülkura takvimini biliyorsa onu, bilmiyorsa (bazı Android WebView'lar) hesaplı takvimi kullan
  try {
    const f = new Intl.DateTimeFormat('tr-TR-u-ca-islamic-umalqura', { timeZone: tz, day: 'numeric', month: 'numeric', year: 'numeric' });
    if (/^islamic/.test(f.resolvedOptions().calendar)) {
      const p = Object.fromEntries(f.formatToParts(new Date()).map(x => [x.type, x.value]));
      const d = +p.day, m = +p.month, y = parseInt(p.year, 10);
      if (d && m >= 1 && m <= 12 && y > 1400) return `${d} ${HAY[m - 1]} ${y}`;
    }
  } catch (_) {}
  const { y, m, d } = dateParts(Date.now(), tz), jd = Math.floor(julian(y, m, d) + .5);
  let l = jd - 1948440 + 10632; const n = Math.floor((l - 1) / 10631); l = l - 10631 * n + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor(50 * l / 17719) + Math.floor(l / 5670) * Math.floor(43 * l / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor(17719 * j / 50) - Math.floor(j / 16) * Math.floor(15238 * j / 43) + 29;
  const hm_ = Math.floor(24 * l / 709), hd = l - Math.floor(709 * hm_ / 24), hy = 30 * n + j - 30;
  return `${hd} ${HAY[hm_ - 1]} ${hy}`;
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
  const hicri = hicriTarih(LOC.tz);
  const miladi = new Intl.DateTimeFormat('tr-TR', { timeZone: LOC.tz, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  $('#vkBody').innerHTML = `
    <div class="vknext"><small>${nextK[1]} vaktine</small><b>${hh ? `${hh} sa ` : ''}${String(mm).padStart(hh ? 2 : 1, '0')} dk <span>${String(ss).padStart(2, '0')} sn</span></b><small>${hm(nextMs, LOC.tz)} · ${miladi}${hicri ? ' · ' + hicri : ''}</small></div>
    <ol class="vklist">${VN.map(([x, n]) => `<li class="${x === curK ? 'cur' : ''}${x === nextK[0] ? ' next' : ''}"><span>${n}</span><b>${hm(T[x], LOC.tz)}</b></li>`).join('')}</ol>`;
  const q = qibla(LOC.lat, LOC.lng);
  $('#kbTxt').textContent = `${Math.round(q)}° · ${YON[Math.round(q / 45) % 8]} · Kâbe’ye ${fmt(Math.round(distKm(LOC.lat, LOC.lng)))} km`;
  rotate();
}
const locCbs = [];
function setLoc(l) { LOC = l; store.set('konum', l); $('#vkPick').hidden = true; renderVakit(); locCbs.forEach(f => f(l)); }
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
/* ---------- özel günler, imsakiye ---------- */
// akşamı kandil olan günler ve bayramlar (Ümmülkura hesabı; 2026–2027 Diyanet takvimiyle aynı)
const OZ_N = { y: ['Hicrî yılbaşı', 'Muharrem’in ilk günü'], a: ['Âşûrâ günü', '10 Muharrem'], m: ['Mevlid Kandili', 'Hz. Peygamber’in doğumu · akşamı', 1], u: ['Üç ayların başlangıcı', 'Recep ayının ilk günü'],
  r: ['Regaib Kandili', 'Recep’in ilk Cuma gecesi · akşamı', 1], i: ['Miraç Kandili', '27 Recep gecesi · akşamı', 1], b: ['Berat Kandili', '15 Şaban gecesi · akşamı', 1], s: ['Ramazan başlıyor', 'İlk oruç; teravih bir önceki akşam'],
  k: ['Kadir Gecesi', '27 Ramazan gecesi · akşamı', 1], f: ['Ramazan Bayramı arifesi', '30 Ramazan'], F: ['Ramazan Bayramı', '3 gün'], z: ['Kurban Bayramı arifesi', '9 Zilhicce · Arafat günü'], K: ['Kurban Bayramı', '4 gün'] };
const OZ = '261210u 261210r 270104i 270122b 270208s 270305k 270308f 270309F 270515z 270516K 270606y 270615a 270813m 271129u 271202r 271224i 280111b 280128s 280222k 280225f 280226F 280504z 280505K 280525y 280603a 280802m 281118u 281123r 281213i 281230b 290116s 290210k 290213f 290214F 290423z 290424K 290514y 290523a 290723m 291108u 291108r 291203i 291220b 300105s 300130k 300203f 300204F 300412z 300413K 300504y 300513a 300712m 301028u 301031r 301122i 301210b 301226s'
  .split(' ').map(x => ({ t: Date.UTC(2000 + +x.slice(0, 2), +x.slice(2, 4) - 1, +x.slice(4, 6)), k: x[6] }));
const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'], GUNLER = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'], GKISA = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'], HKISA = ['Muh', 'Saf', 'R.evvel', 'R.âhir', 'C.evvel', 'C.âhir', 'Recep', 'Şaban', 'Ram', 'Şevval', 'Zilk', 'Zilh'];
const gTxt = t => { const d = new Date(t); return `${d.getUTCDate()} ${AYLAR[d.getUTCMonth()]} ${d.getUTCFullYear()} ${GUNLER[d.getUTCDay()]}`; };
const tz0 = () => LOC ? LOC.tz : localTz();
const today0 = () => { const { y, m, d } = dateParts(Date.now(), tz0()); return utcDay(y, m, d); };
function renderOzel() {
  const el = $('#ozel'); if (!el) return;
  const t0 = today0(), D = 864e5;
  const span = k => k === 'F' ? 3 : k === 'K' ? 4 : 1;
  const cur = OZ.filter(o => t0 >= o.t && t0 < o.t + span(o.k) * D);
  const next = OZ.filter(o => o.t > t0).slice(0, 4), year = OZ.filter(o => o.t > t0 && o.t < t0 + 366 * D);
  const row = o => { const n = OZ_N[o.k], dd = Math.round((o.t - t0) / D); return `<li><span><b>${n[0]}</b><small>${gTxt(o.t)} · ${n[1]}</small></span><em>${dd === 1 ? 'yarın' : dd + ' gün'}</em></li>`; };
  el.innerHTML = ramCard() + tehCard() + cur.map(o => { const n = OZ_N[o.k], day = Math.round((t0 - o.t) / D) + 1; return `<div class="ozbugun"><small>Bugün</small><b>${n[0]}${span(o.k) > 1 ? ` · ${day}. gün` : ''}</b><span>${n[2] ? 'Kandil gecesi bu akşam, akşam ezanıyla başlar.' : n[1]}</span></div>`; }).join('') +
    `<div class="ph"><h3>Yaklaşan günler</h3><span class="muted small">${hicriTarih(tz0())}</span></div><ol class="ozlist">${next.map(row).join('')}</ol>
    <details class="ozall"><summary>Önümüzdeki 12 ay</summary><ol class="ozlist">${year.map(row).join('')}</ol></details>
    <p class="muted small">Kandiller, tarihi verilen günün akşamı başlar. Tarihler Ümmülkura takvimiyle hesaplanır; 2026–2027 için Diyanet’in açıkladığı tarihlerle aynıdır, sonraki yıllarda bir gün sapabilir.</p>`;
}
/* imsakiye: seçilen ayın ya da Ramazan’ın vakit cetveli */
function imOptions() {
  const t0 = today0(), d0 = new Date(t0), opts = [];
  const ram = OZ.find(o => o.k === 's' && o.t + 30 * 864e5 > t0);
  if (ram) { const f = OZ.find(o => o.k === 'f' && o.t > ram.t); opts.push([`r${ram.t}-${f ? f.t : ram.t + 29 * 864e5}`, `Ramazan ${new Date(ram.t).getUTCFullYear()} imsakiyesi`]); }
  for (let j = 0; j < 12; j++) { const y = d0.getUTCFullYear() + Math.floor((d0.getUTCMonth() + j) / 12), m = (d0.getUTCMonth() + j) % 12; opts.push([`m${y}-${m + 1}`, `${AYLAR[m]} ${y}`]); }
  $('#imSel').innerHTML = opts.map(([v, n], j) => `<option value="${v}"${j === (ram && ram.t <= t0 ? 0 : ram ? 1 : 0) ? ' selected' : ''}>${n}</option>`).join('');
}
function imDays() {
  const v = $('#imSel').value || '', out = [];
  if (v[0] === 'r') { const [a, b] = v.slice(1).split('-').map(Number); for (let t = a; t <= b; t += 864e5) out.push(t); }
  else { const [y, m] = v.slice(1).split('-').map(Number), n = new Date(Date.UTC(y, m, 0)).getUTCDate(); for (let d = 1; d <= n; d++) out.push(Date.UTC(y, m - 1, d)); }
  return out;
}
function renderImsak() {
  if (!$('#imsakiye').open) return;
  const body = $('#imBody');
  if (!LOC) { body.innerHTML = '<p class="muted small">Önce yukarıdan konum seçin.</p>'; return; }
  const t0 = today0(), ram = ($('#imSel').value || '')[0] === 'r';
  const rows = imDays().map((t, j) => {
    const d = new Date(t), T = vakitler(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), LOC.lat, LOC.lng), h = hicriOf(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
    return `<tr class="${t === t0 ? 'today' : ''}${d.getUTCDay() === 5 ? ' cuma' : ''}"><th>${ram ? `<b>${j + 1}</b>` : ''}${d.getUTCDate()} ${AYLAR[d.getUTCMonth()].slice(0, 3)}<small>${GKISA[d.getUTCDay()]}${h ? ' · ' + h.d + ' ' + HKISA[h.m - 1] : ''}</small></th>${VN.map(([x]) => `<td>${hm(T[x], LOC.tz)}</td>`).join('')}</tr>`;
  }).join('');
  body.innerHTML = `<table class="imtab"><thead><tr><th>${ram ? 'Gün' : 'Tarih'}</th>${VN.map(([, n]) => `<th>${n}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table><p class="muted small">${esc(LOC.name)} için. ${ram ? 'Oruç imsak vaktinde başlar, akşam vaktinde biter.' : ''}</p>${ram ? ramAll() : ''}`;
  const tr = body.querySelector('tr.today'); if (tr) tr.scrollIntoView({ block: 'nearest' });
}
$('#imsakiye').addEventListener('toggle', () => { if ($('#imsakiye').open) { if (!$('#imSel').options.length) imOptions(); renderImsak(); } });
$('#imSel').onchange = renderImsak;
$('#imCopy').onclick = () => {
  if (!LOC) return;
  const lines = [`${$('#imSel').selectedOptions[0].textContent} · ${LOC.name}`, ['Tarih', ...VN.map(v => v[1])].join('\t')];
  for (const t of imDays()) { const d = new Date(t), T = vakitler(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), LOC.lat, LOC.lng); lines.push([gTxt(t), ...VN.map(([x]) => hm(T[x], LOC.tz))].join('\t')); }
  navigator.clipboard.writeText(lines.join('\n') + '\n\nAyet Haritası · Diyanet açılarıyla hesaplanmıştır.').then(() => A.toast('İmsakiye kopyalandı'), () => A.toast('Kopyalanamadı'));
};

/* ---------- teheccüd: gecenin son üçte biri ---------- */
// gece = akşamdan imsaka; son üçte bir = imsaktan önceki (gece süresi / 3)
function nightThird(ref = Date.now()) {
  if (!LOC) return null;
  const T0 = dayTimes(0), Tm = dayTimes(-1), T1 = dayTimes(1);
  // içinde bulunulan ya da sıradaki gece
  let ak = T0.aksam, im = T1.imsak;
  if (ref < T0.imsak) { ak = Tm.aksam; im = T0.imsak; }
  if (ak == null || im == null) return null;
  const len = im - ak; return { start: im - len / 3, end: im, aksam: ak };
}
window.TEHECCUD = { nightThird: (y, m, d) => { // verilen günün akşamından ertesi imsaka
  if (!LOC) return null; const a = vakitler(y, m, d, LOC.lat, LOC.lng).aksam, n = new Date(Date.UTC(y, m - 1, d + 1)), b = vakitler(n.getUTCFullYear(), n.getUTCMonth() + 1, n.getUTCDate(), LOC.lat, LOC.lng).imsak;
  return a && b ? { start: b - (b - a) / 3, end: b } : null; } };
function tehCard() {
  const n = nightThird(); if (!n) return '';
  const now = Date.now(), on = now >= n.start && now < n.end;
  return `<div class="teh${on ? ' on' : ''}"><div class="tehh"><b>${on ? 'Şu an gecenin son üçte biri' : 'Teheccüd vakti'}</b><span>${hm(n.start, LOC.tz)} – ${hm(n.end, LOC.tz)}</span></div>
    <p>Gecenin son üçte biri, akşamdan imsaka kadar olan sürenin son kısmıdır. Kur’an gece kalkıp namaz kılmayı ve Kur’an okumayı över: “Gece kalkışı daha etkilidir” (<a href="#" class="vref" data-r="73:6">Müzzemmil 6</a>), “Geceleri az uyurlar, seher vakitlerinde bağışlanma dilerlerdi” (<a href="#" class="vref" data-r="51:17">Zâriyât 17–18</a>). Ayrıca <a href="#" class="vref" data-r="17:79">İsrâ 79</a>, <a href="#" class="vref" data-r="32:16">Secde 16</a>, <a href="#" class="vref" data-r="3:17">Âl-i İmrân 17</a>.</p></div>`;
}

/* ---------- Ramazan: her güne orucun bir faydası ---------- */
const RAM = [
  ['Ayet', 'Orucun amacı: takvâ', 'Kur’an orucun neden farz kılındığını söyler: “sakınasınız diye.” Takvâ, Allah’a karşı sorumluluk bilinciyle yaşamaktır; oruç bunun her gün tekrarlanan bir alıştırmasıdır.', '2:183'],
  ['Ayet', 'Tan yerinden geceye', 'Kur’an orucun sınırını açıkça çizer: tan yerinde beyaz iplik siyah iplikten ayırt edilinceye kadar yiyip içmek, sonra orucu geceye kadar tamamlamak. Günü ikiye bölen bu çizgi, her gün aynı bilinçle yeniden başlamayı öğretir.', '2:187'],
  ['Sağlık', 'Vücut depolarını kullanır', 'Uzun süre yemek yenmeyince vücut enerji için depoladığı yağı kullanmaya başlar. Ramazan üzerine yapılan çalışmalar ortalama hafif bir kilo ve yağ kaybı bildiriyor; iftar ve sahurda aşırı yenirse bu etki kaybolur.'],
  ['Ayet', 'Bağışlanma ve büyük ödül', 'Ahzâb sûresi Allah’ın bağışlanma ve büyük bir ödül hazırladığı insanları sayar; aralarında “oruç tutan erkekler ve oruç tutan kadınlar” da vardır.', '33:35'],
  ['Nefis', 'İrade eğitimi', 'Oruçlu, helal olan yemeyi içmeyi bile belli bir süre bırakır. Helalden uzak durabilen, haramdan uzak durmayı daha kolay öğrenir.'],
  ['Ayet', 'Kur’an ayı', 'Ramazan, Kur’an’ın indirildiği aydır. Bu yüzden Ramazan’da mukabele okunur; her gün bir cüz okuyan, ay bitince hatmi tamamlamış olur.', '2:185'],
  ['Ayet', 'Oruç bir telafi yoludur', 'Kur’an orucu hatayı telafi etmenin yolu olarak da gösterir: bile bile edilen bir yemini bozan, yoksulları doyuramıyorsa üç gün oruç tutar. Oruç, sözünü tutmanın ciddiyetini hatırlatır.', '5:89'],
  ['Toplum', 'Açın hâlini anlamak', 'Bir gün boyunca aç ve susuz kalmak, her gün yeterince yiyemeyenlerin hâlini insana bizzat yaşatır. Bu tecrübe sadakayı ve yardımlaşmayı kendiliğinden artırır.'],
  ['Ayet', 'Ben yakınım', 'Oruç ayetlerinin tam ortasında bir dua ayeti yer alır: “Kullarım beni sorarsa, ben yakınım; dua edenin duasını kabul ederim.” Oruç günleri dua için en uygun zamanlardandır.', '2:186'],
  ['Sağlık', 'Sahuru atlamayın', 'Sahur, günün tek öğünüdür. Lifli ve proteinli bir sahur (yumurta, peynir, tam tahıl, sebze) tokluğu uzatır ve gün içinde kan şekerinin dengeli kalmasına yardım eder; yalnız su içip yatmak günü zorlaştırır.'],
  ['Ayet', 'Dilin orucu', 'Kur’an’da Meryem’e “Rahman için oruç adadım, bugün hiçbir insanla konuşmayacağım de” denir. Oruç yalnız yemeyi içmeyi değil, sözü de kapsayabilir: Ramazan, dile sahip olmanın da ayıdır.', '19:26'],
  ['Sağlık', 'Kan şekeri ve insülin', 'Aralıklı oruç üzerine yapılan bazı çalışmalar insülin duyarlılığının arttığını gösteriyor; sonuçlar kişiden kişiye değişiyor. Şeker hastaları ve ilaç kullananlar oruçtan önce mutlaka doktoruna danışmalı.'],
  ['Ayet', 'Önceki ümmetlerin orucu', 'Kur’an orucun yeni bir ibadet olmadığını söyler: “sizden öncekilere farz kılındığı gibi.” Oruç, peygamberlerin ümmetlerini birbirine bağlayan ortak bir ibadettir.', '2:183'],
  ['Ayet', 'Öfkeyi yenmek', 'Açlık ve yorgunluk insanı çabuk öfkelendirebilir. Kur’an bollukta da darlıkta da infak edenleri, öfkelerini yenenleri ve insanları affedenleri över. Oruç, öfke anında durmayı öğrenmek için iyi bir fırsattır.', '3:134'],
  ['Ayet', 'Yemeği paylaşmak', 'Kur’an iyileri şöyle anlatır: canları çektiği hâlde yemeği yoksula, yetime ve esire yedirirler ve “sizi yalnız Allah rızası için doyuruyoruz, karşılık beklemiyoruz” derler. İftar sofrasını paylaşmak bu ayetin günlük karşılığıdır.', '76:8'],
  ['Sağlık', 'Hücrelerin temizliği', 'Uzun açlıkta hücreler yıpranmış parçalarını parçalayıp yeniden kullanır (otofaji). Bu mekanizmanın keşfi 2016’da Nobel ödülü aldı. İnsanlarda Ramazan orucunun bu süreci ne kadar etkilediği henüz iyi ölçülmedi.'],
  ['Ayet', 'Oruç sizin için hayırlıdır', '“Oruç tutmanız sizin için daha hayırlıdır, eğer bilirseniz.” Kur’an orucu bir yük olarak değil, insanın kendi iyiliği olarak anlatır.', '2:184'],
  ['Sağlık', 'Alışkanlıkları kırmak', 'Gün boyu sigara, çay ve kahve olmadan geçirmek, bu alışkanlıkların insanı ne kadar yönettiğini gösterir. Ramazan, sigarayı bırakmak için iyi bir başlangıçtır.'],
  ['Ayet', 'Sabırla yardım dilemek', '“Sabır ve namazla yardım dileyin.” Oruç sabrın en somut hâlidir: istenen şeyin önünde durup beklemek. Ramazan sabrı her gün biraz daha büyütür.', '2:45'],
  ['Ayet', 'İyilik nedir?', 'Kur’an iyiliği tarif ederken önce imanı, hemen ardından malı sevgisine rağmen yakınlara, yetimlere, yoksullara, yolculara ve isteyenlere vermeyi sayar. Ramazan bu tarifin her gün yaşandığı aydır.', '2:177'],
  ['Ayet', 'Bin aydan hayırlı gece', 'Kadir gecesi bin aydan hayırlıdır. O gece melekler iner ve gece tan yerinin ağarmasına kadar esenlik içinde geçer.', '97:3'],
  ['Nefis', 'Vakit bilinci', 'İmsak ve iftar saatine göre yaşamak günü düzene sokar. Oruçlu, günü namaz vakitleriyle birlikte yaşamaya alışır.'],
  ['Sağlık', 'İftarı hafif açın', 'Uzun açlıktan sonra mideyi bir anda doldurmak hazımsızlık yapar. Su ve az bir şeyle açıp biraz ara vermek, sonra yemeğe geçmek hem mideyi hem uykuyu rahatlatır.'],
  ['Toplum', 'Aynı sofrada', 'İftar ve sahur, aileyi ve komşuları aynı saatte aynı sofrada toplar. Ramazan, yalnız yaşayanları iftara davet etmek için de bir fırsattır.'],
  ['Sağlık', 'Suyu ihmal etmeyin', 'İftar ile sahur arasına yayılmış 8–10 bardak su baş ağrısını ve kabızlığı önlemeye yardım eder. Çok tuzlu ve çok şekerli yiyecekler gün içinde susuzluğu artırır.'],
  ['Ayet', 'İtikâf', 'Kur’an oruç ayetlerinin sonunda itikâftan, yani mescide çekilip kendini ibadete vermekten söz eder: “mescitlerde itikâfta iken…” Ramazan’ın son günleri bu çekilme için en uygun zamandır.', '2:187'],
  ['Ayet', 'Kolaylık', '“Allah sizin için kolaylık ister, zorluk istemez.” Hasta ve yolcu oruç tutmayıp sonra kaza eder; tutamayacak durumda olan fidye verir.', '2:185'],
  ['Nefis', 'Şükür', 'İftar vakti içilen bir bardak su, her gün sahip olunan nimetlerin değerini hatırlatır. Ramazan ayetleri de “şükredesiniz diye” sözüyle biter.'],
  ['Ayet', 'Kutlu gece', 'Duhân sûresi Kur’an’ın “kutlu bir gecede” indirildiğini söyler; Kadr sûresi bu gecenin adını verir, Bakara 185 de hangi ayda olduğunu. Ramazan’ı değerli kılan, Kur’an’ın onda inmesidir.', '44:3'],
  ['Ayet', 'Sayıyı tamamlamak', 'Oruç ayeti şöyle biter: “sayıyı tamamlamanız, sizi doğru yola ilettiği için Allah’ı yüceltmeniz ve şükretmeniz için.” Ramazan’ın sonu bir bitiş değil, bir şükür ve yüceltme anıdır.', '2:185'],
];
const ramDay = () => { const t0 = today0(), D = 864e5; const s = OZ.filter(o => o.k === 's' && o.t <= t0).pop(); if (!s) return 0; const f = OZ.find(o => o.k === 'F' && o.t > s.t); return f && t0 < f.t ? Math.round((t0 - s.t) / D) + 1 : 0; };
const ramItem = (r, n) => `<span class="rtag">${r[0]}</span><b>${r[1]}</b><p>${r[2]}${r[3] ? ` <a href="#" class="vref" data-r="${r[3]}">${r[3]}</a>` : ''}</p>`;
function ramCard() { const n = ramDay(); if (!n || n > 30) return ''; return `<div class="ramcard"><small>Ramazan · ${n}. gün</small>${ramItem(RAM[n - 1], n)}</div>`; }
const ramAll = () => `<details class="ramall"><summary>Ramazan’da her güne orucun bir faydası</summary><ol>${RAM.map((r, j) => `<li><em>${j + 1}. gün</em>${ramItem(r, j + 1)}</li>`).join('')}</ol><p class="muted small">Ayetler kaynağıyla verildi; dokunarak açabilirsiniz. Sağlıkla ilgili bilgiler genel bilgidir, tıbbi tavsiye değildir; hastalar oruç için doktoruna danışmalı.</p></details>`;
vk.addEventListener('click', e => { const a = e.target.closest('.vref[data-r]'); if (!a || !vk.contains(a)) return; e.preventDefault(); const [s, v] = a.dataset.r.split(':').map(Number); A.openVerse(A.verseIndex(s, v)); });

/* ---------- yakındaki camiler (OpenStreetMap) ---------- */
// Konum yalnız "Camileri bul"a basınca, ~1 km'ye yuvarlanarak OpenStreetMap'in Overpass sunucusuna gider; mesafeler cihazda hesaplanır.
const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass-api.de/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter']; // overpass-api.de ikinci kez: "meşgul" cevabından sonra
const camiBox = document.createElement('div'); camiBox.className = 'cami'; camiBox.id = 'cami';
camiBox.innerHTML = `<div class="ph"><h3>Yakındaki camiler</h3><span class="muted small" id="cmInfo"></span></div><div id="cmBody"><p class="muted small">Bulunduğunuz yere en yakın camileri, uzaklık ve yönüyle listeler. Konumunuz yalnız bu düğmeye basınca, yaklaşık 1 km’ye yuvarlanarak OpenStreetMap’e gönderilir; kaydedilmez.</p><button class="ghost" id="cmFind">${I('pin')}Camileri bul</button></div>`;
$('#kible').after(camiBox);
const ddist = (a, b, c, d) => { const R = 6371e3, x = rad(c - a), y = rad(d - b), h = Math.sin(x / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(y / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
const bear = (a, b, c, d) => fix(deg(Math.atan2(Math.sin(rad(d - b)) * Math.cos(rad(c)), Math.cos(rad(a)) * Math.sin(rad(c)) - Math.sin(rad(a)) * Math.cos(rad(c)) * Math.cos(rad(d - b)))), 360);
async function overpass(q) {
  // ilk sunucu hata verirse ya da 6 sn'de cevap vermezse sıradakine de sor; ilk gelen cevap kullanılır
  const ctl = OVERPASS.map(() => new AbortController());
  return new Promise((ok, no) => {
    let next = 0, fails = 0, done = false, hedge = 0;
    const finish = (f, v) => { if (done) return; done = true; clearTimeout(hedge); ctl.forEach(c => c.abort()); f(v); };
    const launch = () => {
      if (done || next >= OVERPASS.length) return; const j = next++;
      clearTimeout(hedge); hedge = setTimeout(launch, 6000);
      fetch(OVERPASS[j], { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal: ctl[j].signal })
        .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(js => finish(ok, js))
        .catch(e => { if (done) return; if (++fails === OVERPASS.length) finish(no, e); else if (next === j + 1) launch(); });
    };
    launch();
    setTimeout(() => finish(no, new Error('timeout')), 60000);
  });
}
function camiRender(pos, els, cached) {
  const [la, lo] = pos;
  const rows = els.map(e => { const y = e.lat ?? e.center?.lat, x = e.lon ?? e.center?.lon, t = e.tags || {}; return { n: t['name:tr'] || t.name || 'İsimsiz cami', y, x, d: ddist(la, lo, y, x), b: bear(la, lo, y, x) }; })
    .filter(r => r.y != null && r.d <= 3000).sort((a, b) => a.d - b.d).slice(0, 15);
  const fd = m => m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`;
  const maps = r => `https://www.google.com/maps/dir/?api=1&destination=${r.y.toFixed(6)},${r.x.toFixed(6)}&travelmode=walking`;
  $('#cmInfo').textContent = rows.length ? `${rows.length} cami · 3 km içinde` : '';
  $('#cmBody').innerHTML = (rows.length ? `<ol class="cmlist">${rows.map(r => `<li><i style="transform:rotate(${r.b}deg)" aria-hidden="true">↑</i><span><b>${esc(r.n)}</b><small>${fd(r.d)} · ${YON[Math.round(r.b / 45) % 8]}</small></span><a class="ghost small" href="${maps(r)}" target="_blank" rel="noopener">Yol tarifi</a></li>`).join('')}</ol>`
    : '<p class="muted small">3 km içinde OpenStreetMap’te kayıtlı cami bulunamadı.</p>') +
    `<p class="muted small">Okun yönü kuzeye göredir. Cami verisi © OpenStreetMap katkıcıları; eksik olabilir.${cached ? ' Son arama sonucu gösteriliyor.' : ''}</p><div class="cmb"><button class="ghost small" id="cmFind">${I('target')}Yeniden ara</button><a class="ghost small" href="https://www.google.com/maps/search/cami/@${la.toFixed(3)},${lo.toFixed(3)},15z" target="_blank" rel="noopener">Haritada ara</a></div>`;
  $('#cmFind').onclick = camiFind;
}
function camiFind() {
  if (!navigator.geolocation) { A.toast('Bu cihaz konum vermiyor'); return; }
  $('#cmBody').innerHTML = '<p class="muted small">Konum alınıyor…</p>';
  navigator.geolocation.getCurrentPosition(async p => {
    const la = p.coords.latitude, lo = p.coords.longitude, ra = Math.round(la * 100) / 100, ro = Math.round(lo * 100) / 100, key = `${ra},${ro}`;
    const c = store.get('cami', null);
    if (c && c.k === key && Date.now() - c.t < 7 * 864e5) { camiRender([la, lo], c.e, true); return; }
    $('#cmBody').innerHTML = '<p class="muted small">Camiler aranıyor… OpenStreetMap sunucuları yoğunsa yarım dakikayı bulabilir.</p>';
    try {
      const js = await overpass(`[out:json][timeout:25];nwr["amenity"="place_of_worship"]["religion"="muslim"](around:4000,${ra},${ro});out center 120;`);
      const e = js.elements.map(x => ({ lat: x.lat ?? x.center?.lat, lon: x.lon ?? x.center?.lon, tags: { name: x.tags?.name, 'name:tr': x.tags?.['name:tr'] } }));
      store.set('cami', { k: key, t: Date.now(), e }); camiRender([la, lo], e, false);
    } catch (_) {
      $('#cmBody').innerHTML = `<p class="muted small">Cami listesi şu an alınamadı. Haritada arayabilirsiniz.</p><div class="cmb"><button class="ghost small" id="cmFind">Tekrar dene</button><a class="ghost small" href="https://www.google.com/maps/search/cami/@${ra},${ro},15z" target="_blank" rel="noopener">Haritada ara</a></div>`;
      $('#cmFind').onclick = camiFind;
    }
  }, err => { $('#cmBody').innerHTML = `<p class="muted small">${err.code === 1 ? 'Konum izni verilmedi.' : 'Konum alınamadı.'}</p><button class="ghost" id="cmFind">Tekrar dene</button>`; $('#cmFind').onclick = camiFind; },
  { enableHighAccuracy: true, timeout: 20000, maximumAge: 5 * 60e3 });
}
$('#cmFind').onclick = camiFind;

locCbs.push(() => { renderOzel(); renderImsak(); });
renderOzel(); setInterval(() => { if (!vk.hidden) renderOzel(); }, 60000);
// masaüstünde pusula yok: yalnız yön ve mesafe
const NOCOMPASS = !matchMedia('(pointer:coarse)').matches;
if (NOCOMPASS) { vk.classList.add('nocompass'); $('#kbStart').hidden = true; $('#kbNote').textContent = 'Kıble açısı kuzeyden saat yönünde ölçülür. Pusula telefonda çalışır; bilgisayarda yönü bir pusula ya da harita uygulamasıyla bulabilirsiniz.'; }


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

/* =================================================================
   4) GÜNÜN AYETİ · her gün aynı ayet herkese; paylaşım görseli
   ================================================================= */
const GL = [51,158,159,161,162,192,207,222,267,269,300,318,323,384,426,431,451,465,477,482,492,520,578,676,842,847,950,976,1009,1152,1158,1205,1285,1363,1420,1425,1478,1560,1587,1659,1682,1717,1734,1756,1773,1790,1850,1918,1953,1990,1997,2025,2027,2028,2051,2052,2064,2108,2110,2149,2185,2248,2393,2461,2478,2517,2565,2569,2589,2768,2787,2812,2912,2917,2928,3220,3275,3339,3341,3384,3408,3429,3485,3486,3535,3573,3661,3674,4066,4067,4110,4176,4192,4251,4311,4617,4621,4623,4624,4645,4730,4913,4960,5078,5096,5114,5143,5147,5186,5209,5214,5242,5274,6020,6081,6083,6094,6095,6178,6221,214,2167,550,2874,396,89,627,2065,3487];
const dayNum = (d = new Date()) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
const gunIdx = (d = new Date()) => GL[(dayNum(d) * 53) % GL.length];
const trDate = (d = new Date()) => new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
function renderGunun() {
  const i = gunIdx(), v = A.Q.verses[i];
  $('#gunun').innerHTML = `
    <div class="ph"><h3>${I('sparkles')}Günün ayeti</h3><span class="muted small">${trDate()}</span></div>
    <p class="gnar" dir="rtl" lang="ar">${esc(v[2])}</p>
    <p class="gntr">${esc(v[4])}</p>
    <div class="gnft"><b>${SUR[vS[i] - 1].tr} ${vA[i]}</b><span class="muted small">${vS[i]}:${vA[i]}</span>
      <span class="gnbtn"><button class="ghost small" id="gnOku">${I('book')}Oku</button><button class="gold small" id="gnPay">${I('share')}Paylaş</button></span></div>`;
  $('#gnOku').onclick = () => A.openVerse(i);
  $('#gnPay').onclick = () => shareGunun(i);
}
function wrap(c, text, maxW) {
  const out = []; let line = '';
  for (const w of text.split(/\s+/)) { const t = line ? line + ' ' + w : w; if (line && c.measureText(t).width > maxW) { out.push(line); line = w; } else line = t; }
  if (line) out.push(line); return out;
}
async function ayetImage(i, label = 'Günün ayeti') {
  const v = A.Q.verses[i], W = 1080, H = 1920, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d');
  try { await Promise.all([document.fonts.load('64px "Amiri Quran"', v[2]), document.fonts.load('500 44px Inter'), document.fonts.load('600 44px Inter')]); } catch (_) {}
  c.fillStyle = '#0b0d12'; c.fillRect(0, 0, W, H);
  const g = c.createRadialGradient(W / 2, H * .42, 40, W / 2, H * .42, H * .7); g.addColorStop(0, 'rgba(233,185,73,.16)'); g.addColorStop(1, 'rgba(233,185,73,0)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  let seed = i + 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 520; k++) { const x = rnd() * W, y = rnd() * H, r = rnd() < .08 ? 3 : 1.6; c.fillStyle = rnd() < .1 ? 'rgba(233,185,73,.55)' : 'rgba(180,190,215,.16)'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
  c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  c.fillStyle = '#e9b949'; c.font = '600 30px Inter'; c.letterSpacing = '8px'; c.fillText('AYET HARİTASI', W / 2, 170); c.letterSpacing = '0px';
  c.fillStyle = '#8e94a7'; c.font = '500 32px Inter'; c.fillText(label + ' · ' + trDate(), W / 2, 226);
  const mw = W - 180; let arS = 66, trS = 46, arL, trL, hgt;
  for (;;) {
    c.font = `${arS}px "Amiri Quran"`; c.direction = 'rtl'; arL = wrap(c, v[2], mw); c.direction = 'ltr';
    c.font = `500 ${trS}px Inter`; trL = wrap(c, v[4], mw);
    hgt = arL.length * arS * 1.9 + 90 + trL.length * trS * 1.42;
    if (hgt < 1240 || trS < 30) break; arS -= 4; trS -= 3;
  }
  let y = (H - hgt) / 2 + arS * 1.2;
  c.fillStyle = '#f4f1ea'; c.font = `${arS}px "Amiri Quran"`; c.direction = 'rtl';
  for (const l of arL) { c.fillText(l, W / 2, y); y += arS * 1.9; }
  c.direction = 'ltr'; y += 10 - arS * .7;
  c.fillStyle = '#e9b949'; c.fillRect(W / 2 - 40, y, 80, 4); y += 70 + trS * .3;
  c.fillStyle = '#d9dce6'; c.font = `500 ${trS}px Inter`;
  for (const l of trL) { c.fillText(l, W / 2, y); y += trS * 1.42; }
  c.fillStyle = '#f1cd72'; c.font = '600 44px Inter'; c.fillText(`${SUR[vS[i] - 1].tr} Sûresi · ${vS[i]}:${vA[i]}`, W / 2, H - 250);
  c.fillStyle = '#8e94a7'; c.font = '500 28px Inter'; c.fillText('Diyanet meali · dpaylasmak-commits.github.io/ayet-haritasi', W / 2, H - 150);
  return new Promise(r => cv.toBlob(r, 'image/png'));
}
async function shareGunun(i) {
  const b = $('#gnPay'); if (b) b.disabled = true;
  try {
    const blob = await ayetImage(i), name = `ayet-${vS[i]}-${vA[i]}.png`, text = `${SUR[vS[i] - 1].tr} ${vS[i]}:${vA[i]} · Ayet Haritası`;
    if (window.AYET_NATIVE_SHARE) { await AYET_NATIVE_SHARE(blob, name, text); return; }
    const file = new File([blob], name, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], text }); } catch (_) {} return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    A.toast('Görsel indirildi');
  } finally { if (b) b.disabled = false; }
}
renderGunun();
let gunDay = dayNum(); setInterval(() => { if (dayNum() !== gunDay) { gunDay = dayNum(); renderGunun(); } }, 60e3);
window.GUNUN = { idx: gunIdx, image: ayetImage, share: shareGunun };
window.VAKIT = { vakitler, VN, loc: () => LOC, onLoc: f => locCbs.push(f), dateParts, hm };
})();
