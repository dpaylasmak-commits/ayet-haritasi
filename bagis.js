/* Ayet Haritası · Destek ol (IBAN ile havale). Bilgiler bagis-ayar.js dosyasından gelir. */
(() => {
const B = window.BAGIS || {}, A = window.AYET;
const iban = String(B.iban || '').replace(/\s+/g, '').toUpperCase();
if (!/^TR\d{24}$/.test(iban)) return; // bilgi girilmemiş ya da hatalı: düğme hiç görünmez
const $ = s => document.querySelector(s), esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const nice = iban.replace(/(.{4})/g, '$1 ').trim();
const copy = (t, msg) => navigator.clipboard.writeText(t).then(() => A && A.toast(msg), () => A && A.toast('Kopyalanamadı'));

const btn = document.createElement('button');
btn.className = 'ghost bagisbtn'; btn.id = 'bagisBtn'; btn.title = 'Destek ol';
btn.innerHTML = '<svg class="i"><use href="#i-heart"/></svg><span class="lbl">Destek ol</span>';
const top = $('.topbtns'); if (top) top.insertBefore(btn, $('#themeBtn'));

const m = document.createElement('div');
m.className = 'modal'; m.id = 'bagis'; m.hidden = true;
m.innerHTML = `<div class="modal-in bagis-in" role="dialog" aria-modal="true" aria-labelledby="bgT">
  <button class="ghost icon close" data-close aria-label="Kapat"><svg class="i"><use href="#i-x"/></svg></button>
  <h2 id="bgT">Destek ol</h2>
  <p>Ayet Haritası ücretsiz ve reklamsız; hesap da istemiyor. Geliştirmeye ve masraflarına katkıda bulunmak isterseniz banka havalesiyle bağış yapabilirsiniz. Bağış tamamen isteğe bağlıdır; hiçbir özellik bağışa bağlı değildir.</p>
  <dl class="bgdl">
    ${B.ad ? `<div><dt>Alıcı</dt><dd>${esc(B.ad)}</dd><button class="ghost small" data-c="${esc(B.ad)}" data-m="Alıcı adı kopyalandı">Kopyala</button></div>` : ''}
    ${B.banka ? `<div><dt>Banka</dt><dd>${esc(B.banka)}</dd></div>` : ''}
    <div><dt>IBAN</dt><dd class="iban">${nice}</dd><button class="gold small" data-c="${iban}" data-m="IBAN kopyalandı">Kopyala</button></div>
    ${B.aciklama ? `<div><dt>Açıklama</dt><dd>${esc(B.aciklama)}</dd><button class="ghost small" data-c="${esc(B.aciklama)}" data-m="Açıklama kopyalandı">Kopyala</button></div>` : ''}
  </dl>
  <p class="muted small">IBAN’ı kopyalayıp bankanızın uygulamasında “Havale/EFT” bölümüne yapıştırın. Ayet Haritası ödeme almaz ve hiçbir banka ya da kart bilgisi istemez.</p>
</div>`;
document.body.appendChild(m);
const open = () => { m.hidden = false; }, close = () => { m.hidden = true; };
btn.onclick = open;
m.onclick = e => { const c = e.target.closest('[data-c]'); if (c) { copy(c.dataset.c, c.dataset.m); return; } if (e.target === m || e.target.closest('[data-close]')) close(); };
addEventListener('keydown', e => { if (e.key === 'Escape' && !m.hidden) close(); });
// Bugün sekmesinin sonunda küçük bir hatırlatma
const vk = $('#vakit'); if (vk) { const p = document.createElement('p'); p.className = 'muted small bgnote'; p.innerHTML = 'Ayet Haritası’nı beğendiyseniz <a href="#">destek olabilirsiniz</a>.'; p.querySelector('a').onclick = e => { e.preventDefault(); open(); }; vk.appendChild(p); }
})();
