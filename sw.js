/* Ayet Haritası · çevrimdışı önbellek
   Uygulama dosyaları ilk açılışta önbelleğe alınır; mealler açıldıkça eklenir.
   Önbellekten hemen cevap verilir, arka planda yenisi indirilir.
   Yeni sürüm (V değişince) kurulup devreye girer; sayfa "Yeni sürüm hazır · Yenile" çubuğunu gösterir. */
const V = 'ayet-v34';
const CORE = ['./', 'index.html', 'rehber.html', 'tezler.html', 'style.css', 'app.js', 'ozellik.js', 'kesif.js', 'esma.js', 'data.js', 'manifest.webmanifest', 'fonts/fonts.css',
  'bagis.js', 'bagis-ayar.js', 'icons/icon-192.png?v=2', 'icons/icon-512.png?v=2', 'icons/favicon-32.png?v=2'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // tilavet sesleri vb. doğrudan ağdan
  e.respondWith(caches.open(V).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r.ok) c.put(e.request.url.split('?')[0], r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
