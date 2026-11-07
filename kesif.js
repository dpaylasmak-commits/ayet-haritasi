/* Ayet Haritası · Keşifler
   Haritanın üstünde adım adım anlatılan keşifler: soru → cevap iplikleri, canlı terazi, sayıların şekli, kelime yarışı. */
(() => {
const A = window.AYET; if (!A) return;
const $ = s => document.querySelector(s);
const GOLD = '#f2c14e', TEAL = '#6fd6b0', VIOLET = '#c59bff', ROSE = '#f08a7e', BLUE = '#7fb2ff';
const vi = r => { const [s, a] = r.split(':').map(Number); return A.verseIndex(s, a); };
const meal = r => A.Q.verses[vi(r)][4];
const short = (t, n = 150) => t.length > n ? t.slice(0, n).replace(/\s+\S*$/, '') + '…' : t;
const esc = A.escHtml, fmt = A.fmt;
const vlink = (r, c) => `<a href="#" class="vref" data-r="${r}"${c ? ` style="--c:${c}"` : ''}>${r}</a>`;
const qa = (q, a, qc = GOLD, ac = TEAL) => `<div class="qa"><div style="--c:${qc}"><small>Soru · ${vlink(q, qc)} ${A.SUR[+q.split(':')[0] - 1].tr}</small><p>${esc(short(meal(q), 190))}</p></div>
  <div style="--c:${ac}"><small>Cevap · ${vlink(a, ac)} ${A.SUR[+a.split(':')[0] - 1].tr}</small><p>${esc(short(meal(a), 190))}</p></div></div>`;

/* ---------- veri: keşifler ---------- */
const MADRAKE = [['69:3', '69:4', 'el-Hâkka', 'Âd ve Semûd’un başına gelen'], ['74:27', '74:28', 'Sekar', 'Ne bırakır ne koyar'], ['77:14', '77:15', 'Ayırım günü', 'Yalanlayanların vay hâli'],
  ['82:17', '82:19', 'Din günü', 'Kimse kimseye fayda veremez'], ['82:18', '82:19', 'Din günü (2)', 'O gün emir Allah’ındır'], ['83:8', '83:9', 'Siccîn', 'Yazılmış bir kitap'],
  ['83:19', '83:20', 'İlliyyûn', 'Yazılmış bir kitap'], ['86:2', '86:3', 'Târık', 'Delip geçen yıldız'], ['90:12', '90:13', 'Akabe', 'Köle azat etmek'],
  ['97:2', '97:3', 'Kadir gecesi', 'Bin aydan hayırlı'], ['101:3', '101:4', 'Kâria', 'İnsanların pervane gibi dağıldığı gün'], ['101:10', '101:11', 'Hâviye', 'Kızgın bir ateş'], ['104:5', '104:6', 'Hutame', 'Allah’ın tutuşturulmuş ateşi']];
const YUDRIKE = [['33:63', 'Kıyamet saati'], ['42:17', 'Kıyamet saati'], ['80:3', 'Âmâ sahâbînin hâli']];
const SORUYOR = [['2:189', 'Hilâller', 'İnsanlar ve hac için vakit ölçüsü'], ['2:215', 'Ne infak edelim?', 'Ana-baba, yakınlar, yetimler, yoksullar…'], ['2:217', 'Haram ayda savaş', 'Büyük günah; fitne ise daha büyük'],
  ['2:219', 'İçki, kumar · ne infak edelim?', 'Günahı faydasından büyük · ihtiyaçtan artanı'], ['2:220', 'Yetimler', 'Onları iyilikle gözetmek hayırlı'], ['2:222', 'Hayız', 'Bir eziyettir'],
  ['5:4', 'Helâl olanlar', 'Temiz şeyler helâl kılındı'], ['7:187', 'Kıyamet ne zaman? (2 kez)', 'Bilgisi Rabbimin katındadır'], ['8:1', 'Ganimetler', 'Allah’a ve Resûlüne aittir'],
  ['17:85', 'Ruh', 'Rabbimin emrindendir'], ['18:83', 'Zülkarneyn', 'Size ondan bir haber okuyacağım'], ['20:105', 'Dağlar', 'Rabbim onları ufalayıp savuracak'], ['79:42', 'Kıyamet ne zaman?', 'Sonu Rabbine varır']];
const UZAK = [
  { q: '1:7', a: '4:69', t: 'Nimet verilenler kim?', d: 'Fâtiha’da her namazda istenen “nimet verdiklerinin yolu” açıklanmıyor. Nisâ sûresi onları tek tek sayıyor: peygamberler, sıddıklar, şehitler, sâlihler.' },
  { q: '2:37', a: '7:23', t: 'Âdem’in aldığı kelimeler', d: 'Bakara 37 “Âdem Rabbinden kelimeler aldı, tövbesi kabul edildi” der, kelimeleri söylemez. A‘râf 23 o duayı verir: “Rabbimiz, kendimize zulmettik…”' },
  { q: '5:1', a: '5:3', t: 'Size okunacak olanlar', d: '“Size okunacaklar dışında hayvanlar helâl kılındı.” İki ayet sonra liste geliyor: leş, kan, domuz eti, Allah’tan başkası adına kesilen…' },
  { q: '44:3', a: '97:1', a2: '2:185', t: 'Mübarek gece hangisi?', d: 'Duhân “onu mübarek bir gecede indirdik” der. Kadr sûresi o gecenin adını verir: Kadir gecesi. Bakara 185 de hangi ayda olduğunu söyler: Ramazan. Üç sûre, tek cevap.' },
  { q: '16:118', a: '6:146', t: '“Daha önce anlattıklarımız”', d: 'Burada bağlantıyı Kur’an’ın kendisi kuruyor: Nahl 118 “sana daha önce anlattıklarımızı Yahudilere haram kıldık” der ve okuru En‘âm 146’daki listeye gönderir.', self: true },
  { q: '4:140', a: '6:68', t: '“Size Kitap’ta indirmişti ki…”', d: 'Nisâ 140, daha önce indirilmiş bir hükmü hatırlatır: ayetler alaya alınınca o meclisten kalkmak. O hüküm En‘âm 68’de.', self: true },
  { q: '6:82', a: '31:13', t: 'Hangi zulüm?', d: '“İmanlarına zulüm karıştırmayanlar” ayeti sahâbeyi korkutunca, Hz. Peygamber Lokmân 13’ü okudu: “Şirk büyük zulümdür.” Bağlantıyı hadis kuruyor (Buhârî).', dash: true },
  { q: '25:60', a: '55:1', t: '“Rahman da nedir?”', d: 'Müşrikler “Rahman da nedir?” diye sordu. Tefsir geleneği cevabı Rahmân sûresinin açılışına bağlar: “Rahman, Kur’an’ı öğretti.” Bu bağlantı bir rivayettir, ayetin kendisi işaret etmez.', dash: true },
];
const EQ = [
  { id: 'dunya', a: 'Dünya', b: 'Âhiret', m: [
    ['Yazılış', ['ar', 'الدنيا', 'affix'], ['ar', 'الآخرة', 'affix'], 'Arapça yazılışı, ön ekleriyle (و ف ب ل ال)'],
    ['Lemma', ['lemma', 'دُنْيا', 'lemma'], ['lemma', 'آخِر', 'lemma'], 'Sözlük biçimi: آخِر “son” anlamını da kapsar'],
    ['Kök', ['root', 'دنو', 'root'], ['root', 'أخر', 'root'], 'Bütün türevleriyle kök']] },
  { id: 'melek', a: 'Melek', b: 'Şeytan', m: [
    ['Lemma', ['lemma', 'مَلَك', 'lemma'], ['lemma', 'شَيْطان', 'lemma'], 'Tekil ve çoğul, sözlük biçimi'],
    ['Yazılış', ['ar', 'الملائكة', 'affix'], ['ar', 'الشياطين', 'affix'], 'Yalnız çoğul yazılışlar'],
    ['Kök', ['root', 'ملك', 'root'], ['root', 'شطن', 'root'], 'ملك kökü “mülk, melik” de içerir']] },
  { id: 'cennet', a: 'Cennet', b: 'Cehennem', m: [
    ['Yazılış', ['ar', 'جنة', 'affix'], ['ar', 'جهنم', 'affix'], 'Tekil yazılış (cennetler hariç)'],
    ['Lemma', ['lemma', 'جَنَّة', 'lemma'], ['lemma', 'جَهَنَّم', 'lemma'], 'Sözlük biçimi: çoğul “cennât” dahil']] },
  { id: 'hayat', a: 'Hayat', b: 'Ölüm', m: [
    ['Kök', ['root', 'حيي', 'root'], ['root', 'موت', 'root'], 'Bütün türevleriyle kök'],
    ['Lemma', ['lemma', 'حَياة', 'lemma'], ['lemma', 'مَوْت', 'lemma'], 'Yalnız isim hâli'],
    ['Yazılış', ['ar', 'الحياة', 'affix'], ['ar', 'الموت', 'affix'], 'Arapça yazılışı']] },
];
const TOP_ALL = [['مِن', '-den'], ['اللَّه', 'Allah'], ['ما', 'ne / şey'], ['فِي', 'içinde'], ['لا', 'hayır, yok'], ['إِنّ', 'şüphesiz'], ['قالَ', 'dedi'], ['الذي', 'o ki'], ['عَلَى', 'üzerine'], ['كانَ', 'oldu']];
const TOP_CONTENT = [['اللَّه', 'Allah'], ['قالَ', 'dedi'], ['كانَ', 'oldu'], ['رَبّ', 'Rab'], ['آمَنَ', 'iman etti'], ['يَوْم', 'gün'], ['أَرْض', 'yer'], ['قَوْم', 'kavim'], ['عَلِمَ', 'bildi'], ['آيَة', 'âyet']];
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'], MDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// takvim: 365 nokta, 12 ay bloğu (7 sütun)
function calendarShape(b, n) {
  const bw = 7, bh = 5, gx = 3, gy = 4, cols = 4, tw = cols * bw + (cols - 1) * gx, th = 3 * bh + 2 * gy;
  const x0 = b.x0 + b.w / 2 - tw / 2, y0 = b.y0 + b.h / 2 - th / 2 + 3, pts = [], labels = [];
  let k = 0;
  MDAYS.forEach((d, m) => {
    const bx = x0 + (m % cols) * (bw + gx), by = y0 + Math.floor(m / cols) * (bh + gy);
    labels.push({ txt: MONTHS[m], x: bx + (bw - 1) / 2, y: by - 1.5, fs: .95, c: '#c9c7ea', sans: true, w: 500 });
    for (let j = 0; j < d; j++) pts.push([bx + j % bw, by + Math.floor(j / bw)]);
    k += d;
  });
  labels.push({ txt: fmt(n), x: x0 + tw / 2, y: y0 - 7, fs: 4.2, c: '#fff', w: 700 });
  labels.push({ txt: '“GÜN” · TEKİL · يَوْم', x: x0 + tw / 2, y: y0 - 3.6, fs: .95, c: GOLD, sans: true });
  return { pts, labels, bounds: { x0: x0 - 3, y0: y0 - 10, x1: x0 + tw + 2, y1: y0 + th + 1, w: tw + 5, h: th + 11 } };
}
// saat kadranı: 12 nokta
function clockShape(b, n) {
  const cx = b.x0 + b.w / 2, cy = b.y0 + b.h / 2, R = 9, pts = [], labels = [];
  for (let k = 0; k < 12; k++) {
    const t = (k + 1) / 12 * Math.PI * 2 - Math.PI / 2;
    pts.push([cx + R * Math.cos(t), cy + R * Math.sin(t)]);
    labels.push({ txt: MONTHS[k], x: cx + (R + 3.4) * Math.cos(t), y: cy + (R + 3.4) * Math.sin(t), fs: .85, c: '#c9c7ea', sans: true, w: 500 });
  }
  labels.push({ txt: fmt(n), x: cx, y: cy - .6, fs: 5, c: '#fff', w: 700 });
  labels.push({ txt: '“AY” · TEKİL · شَهْر', x: cx, y: cy + 3.4, fs: .9, c: GOLD, sans: true });
  return { pts, labels, bounds: { x0: cx - 16, y0: cy - 16, x1: cx + 16, y1: cy + 16, w: 32, h: 32 } };
}

/* ---------- önceden yazılan tezler ---------- */
const TEZ_TARIH = '7 Kasım 2026';
const TS = { acik: ['Açık', GOLD], destek: ['Destekleniyor', TEAL], kismen: ['Kısmen tutuyor', VIOLET], zor: ['Zorlanıyor', ROSE] };
const TEZ = [
  { k: 'Geri dönüş', t: 'Evren sonunda geri dönecek', st: 'acik', r: ['51:47', '21:104'],
    q: [['51:47', 'Göğü gücümüzle biz kurduk; şüphesiz biz onu genişleticiyiz.'], ['21:104', 'Göğü, kitap dürer gibi dürdüğümüz gün… ilk yaratmaya başladığımız gibi onu yine iade ederiz.']],
    o: 'İki ayet yan yana okununca önce bir genişleme, sonunda bir “dürülme” anlatılıyor.',
    z: 'Karanlık enerji sabit değil, zayıflıyor. Evren sonsuza kadar genişleyip soğumayacak; uzak gelecekte geri çökecek.',
    b: 'Ana akım model sonsuz genişleme diyor. DESI’nin 2024–2025 sonuçları karanlık enerjinin zayıflıyor olabileceğini gösteriyor; henüz kesin değil.',
    s: [[2027, 'DESI son verileri'], [2030, 'Euclid tam taraması'], [2035, 'Rubin 10 yıllık taraması']],
    c: 'Karanlık enerjinin sabit olduğu ya da güçlendiği kesinleşirse.' },
  { k: 'Görünmeyen direk', t: 'Karanlık madde gerçek bir maddedir', st: 'acik', r: ['13:2', '31:10'],
    q: [['13:2', 'Gökleri, gördüğünüz direkler olmaksızın yükselten…']],
    o: '“Bi-gayri amedin terevnehâ” iki türlü okunur: “görüldüğü gibi direksiz” ya da “göremediğiniz direklerle”. İkinci okuma, göğü tutan görünmez bir yapı öngörür.',
    z: 'Galaksileri bir arada tutan görünmez kütle gerçek bir parçacıktır. Kütleçekim yasasını değiştiren kuramlar (MOND) yanlış çıkacak.',
    b: 'Açık soru. Doğrudan algılama deneyleri (LZ, XENONnT) şimdiye kadar parçacık bulamadı.',
    s: [[2028, 'LZ son sonuçları'], [2030, 'Euclid kütle haritası']],
    c: 'Karanlık madde olmadan bütün gözlemleri açıklayan bir kütleçekim kuramı kesinleşirse.' },
  { k: 'Değişmeyen ölçü', t: 'Doğa yasaları her yerde aynıdır', st: 'kismen', r: ['67:3', '67:4', '54:49'],
    q: [['67:3', 'Rahman’ın yaratmasında bir düzensizlik bulamazsın. Gözünü çevir bak, bir çatlak görebilir misin?'], ['54:49', 'Şüphesiz Biz her şeyi bir ölçüye göre yarattık.']],
    o: 'Çatlaksız bir yaratılış ve her şeyde bir ölçü: evrenin her köşesinde aynı yasalar.',
    z: 'A) Temel sabitler uzayda ve zamanda değişmez. B) Evren büyük ölçekte homojendir; bunu zorlayan dev yapılar (Herkül–Kuzey Tacı Büyük Duvarı) daha büyük veride rastlantı olarak çözülecek.',
    b: 'A tutuyor: ESPRESSO ölçümleri sabitlerde değişim bulmadı. B açık.',
    s: [[2029, 'ESPRESSO ve ELT ölçümleri'], [2030, 'Euclid ve DESI yapı haritaları']],
    c: 'Sabitlerde gerçek bir değişim ölçülürse ya da homojenliği bozan bir yapı kesinleşirse.' },
  { k: 'Sudan canlı', t: 'Bulunacak her canlı suya dayalı olacak', st: 'acik', r: ['21:30'],
    q: [['21:30', 'Bütün canlıları sudan meydana getirdik.']],
    o: 'Ayet “her canlı” diyor, yalnız yeryüzündekiler demiyor.',
    z: 'Başka bir yerde yaşam bulunursa kimyası sıvı suya dayanacak.',
    b: 'Dünya dışında henüz yaşam bulunmadı. En keskin sınav Titan: metan göllerinde suya dayanmayan bir canlı bulunursa bu okuma çöker.',
    s: [[2030, 'Europa Clipper Jüpiter’de'], [2031, 'JUICE Jüpiter’de'], [2034, 'Dragonfly Titan’da']],
    c: 'Suya dayanmayan bir yaşam bulunursa.', cd: ['2030-04-11', 'Europa Clipper’ın varışına'] },
  { k: 'Gökte canlılar', t: 'Gökte hareket eden canlılar var', st: 'acik', r: ['42:29'],
    q: [['42:29', 'Gökleri, yeri ve ikisinde yaydığı canlıları (dâbbe) yaratması O’nun delillerindendir.']],
    o: '“Dâbbe” sözlükte yürüyen, kımıldayan canlı demek. Klasik tefsirde bunu meleklerle açıklayanlar var; bu okuma kelimenin sözlük anlamını izliyor.',
    z: 'Dünya dışında yalnız mikrop değil, hareket eden çok hücreli yaşam vardır.',
    b: 'Kanıt yok. JWST’nin 2025’te K2-18b gezegeninde bildirdiği olası yaşam işareti tartışmalı.',
    s: [[2027, 'Roman teleskobu'], [2035, 'Yeni nesil gezegen teleskopları']],
    c: 'Zayıf yanı: “henüz bulunmadı” tezi çürütmez. Bu yüzden sınanması en zor tez.' },
  { k: 'Gizli çiftler', t: 'Her parçacığın bilinmeyen bir eşi var', st: 'zor', r: ['36:36', '51:49'],
    q: [['36:36', 'Yerin yetiştirdiklerinden, kendilerinden ve daha bilmediklerinden çift çift yaratan Allah münezzehtir.'], ['51:49', 'Her şeyi çift çift yarattık.']],
    o: 'Madde ve karşıt madde 1928’den beri biliniyor. “Bilmedikleri” ifadesi bunun ötesinde bir eşleşme bekletiyor.',
    z: 'Süpersimetri ya da karanlık sektörde bir eş parçacık bulunacak.',
    b: 'Büyük Hadron Çarpıştırıcısı (LHC) şimdiye kadar süpersimetrik bir eş bulamadı. Listedeki en riskli tez.',
    s: [[2030, 'Yüksek ışınımlı LHC'], [2041, 'LHC’nin son verileri']],
    c: 'Yüksek ışınımlı LHC de bir şey bulamazsa tez ciddi biçimde zayıflar.' },
  { k: 'Hayvan dilleri', t: 'Hayvanların iletişimi dil benzeri', st: 'destek', r: ['6:38', '27:18'],
    q: [['6:38', 'Yerde yürüyen hayvanlar ve kanatlarıyla uçan kuşlar da ancak sizin gibi birer topluluktur.'], ['27:18', 'Bir karınca: “Ey karıncalar! Yuvalarınıza girin, Süleyman’ın ordusu farkına varmadan sizi ezmesin” dedi.']],
    o: '“Sizin gibi topluluklar” ve uyarıyı tehlikenin adıyla veren bir karınca.',
    z: 'Balina ve kuş seslerinde birleştirilebilir bir yapı (bir tür dilbilgisi) ve belirli bireylere karşılık gelen “adlar” bulunacak.',
    b: 'Kısmen destekleniyor. Project CETI 2024’te kaşalot seslerinde bir “ses alfabesi” yayımladı. Yunuslarda ve bazı kuşlarda ad benzeri sesler bildirildi.',
    s: [[2028, 'Project CETI çözümlemeleri']],
    c: 'Hayvan seslerinin yapısız, yalnız duygu belirten çağrılar olduğu gösterilirse.' },
  { k: 'Baldaki şifa', t: 'Bal dirençli enfeksiyonlarda işe yarar', st: 'kismen', r: ['16:69'],
    q: [['16:69', 'Karınlarından renkleri çeşitli bir içecek çıkar; onda insanlar için şifa vardır.']],
    o: 'Ayet şifayı belirli bir hastalıkla sınırlamıyor; tez bunu ölçülebilir bir iddiaya indiriyor.',
    z: 'Tıbbi bal, antibiyotiğe dirençli yara enfeksiyonlarında ve bakteri biyofilmlerinde standart tedaviye eşdeğer ya da daha iyi sonuç verir.',
    b: 'Yanık ve yara tedavisinde olumlu kanıt var. Dirençli enfeksiyonlar için büyük klinik denemeler sürüyor.',
    s: [[2028, 'Klinik deneme sonuçları']],
    c: 'Büyük denemeler etkisiz sonuç verirse.' },
  { k: 'Dengeleyen dağlar', t: 'Dağlar Dünya’nın sallanmasını azaltır', st: 'zor', r: ['16:15'],
    q: [['16:15', 'Sizi sarsmasın diye yeryüzüne sabit dağlar yerleştirdi.']],
    o: '“En temîde biküm”: sizi sallamasın diye. Okuma ya depremi ya da Dünya’nın bütün olarak yalpalamasını kastediyor.',
    z: 'Dağlar kütle dağılımı yoluyla Dünya’nın dönme ekseninin yalpalamasını azaltır.',
    b: 'Zorlanıyor. Depremler en çok dağ kuşaklarında olur; “depremi azaltır” okuması yanlış çıkar. Eksen yalpası okuması sınanabilir ama kanıt yok.',
    s: [[2030, 'Uydu kütleçekim ölçümleri']],
    c: 'Dağların eksen kararlılığına etkisinin önemsiz olduğu gösterilirse.' },
  { k: 'Altı ay', t: 'En kısa gebelik altı aydır', st: 'kismen', r: ['46:15', '2:233'],
    q: [['46:15', 'Taşınması ve sütten kesilmesi otuz ay sürer.'], ['2:233', 'Anneler çocuklarını tam iki sene emzirirler.']],
    o: '30 aydan 24 ay çıkınca 6 ay kalır. Hz. Ali’ye atfedilen bu çıkarım, ayetten <b>önceden</b> üretilmiş gerçek bir tez.',
    z: 'Bir bebek altı aydan önce doğarsa yaşayamaz.',
    b: 'Kısmen tutuyor. Yoğun bakımda yaşatılan en erken bebek 21 haftalık doğdu (döllenmeden ~4,5 ay). Tıbbi destek olmadan doğal yaşama sınırı olarak büyük ölçüde tutuyor. Dünya Sağlık Örgütü de iki yıl emzirmeyi öneriyor.',
    s: [], c: 'Mutlak sınır olarak okunursa tutmadı; doğal sınır olarak tutuyor.' },
  { k: 'Güneş ve Ay', t: 'Güneş, Ay’ı ve Dünya’yı yutacak', st: 'acik', r: ['75:9'],
    q: [['75:9', 'Güneş ve Ay bir araya getirildiğinde…']],
    o: 'Kıyamet sahnesinde Güneş ile Ay’ın “bir araya getirilmesi”. Bugün Ay Dünya’dan yılda 3,8 cm uzaklaşıyor; bir araya gelmeleri ancak Güneş’in büyümesiyle olabilir.',
    z: 'Güneş kırmızı dev evresinde Ay’ı ve Dünya’yı yutacak.',
    b: 'Modeller büyük ölçüde bunu söylüyor ama kesin değil. 2023’te başka bir yıldızın gezegenini yuttuğu ilk kez gözlendi.',
    s: [[2030, 'Yıldız evrimi modelleri ve yutulma gözlemleri']],
    c: 'Kütle kaybıyla genişleyen yörüngelerin Dünya’yı ve Ay’ı kurtardığı kesinleşirse.' },
  { k: 'Yedi yer', t: 'Dünya benzeri gezegenler yaygındır', st: 'acik', r: ['65:12'],
    q: [['65:12', 'Yedi göğü ve yerden de bir o kadarını yaratan Allah’tır.']],
    o: '“Yerden de bir o kadarı”: tek bir Dünya değil, ona benzeyen başka yerler.',
    z: 'Güneş benzeri yıldızların en az %10’unda, yaşanabilir bölgede kayalık, Dünya büyüklüğünde bir gezegen var.',
    b: 'Açık. Tahminler %5 ile %50 arasında değişiyor.',
    s: [[2026, 'PLATO teleskobunun fırlatılışı'], [2032, 'PLATO sonuçları']],
    c: 'Oran %10’un belirgin biçimde altında çıkarsa.' },
  { k: 'Değişen gökler', t: 'Evrenin vakumu yarı kararlıdır', st: 'kismen', r: ['14:48'],
    q: [['14:48', 'Yerin başka bir yerle, göklerin de başka göklerle değiştirildiği gün…']],
    o: 'Göklerin “başka göklerle değiştirilmesi”: bugünkü hâlin kalıcı olmadığı bir evren.',
    z: 'Evrenin bugünkü vakum hâli en dip hâl değil, yarı kararlıdır; ilke olarak başka bir hâle geçebilir.',
    b: 'Kısmen destekleniyor. Higgs ve top kuark ölçümleri bugün yarı kararlılığa işaret ediyor.',
    s: [[2033, 'Yüksek ışınımlı LHC top kuark ölçümleri']],
    c: 'Hassas ölçümler vakumu tam kararlı bölgeye taşırsa.' },
  { k: 'Eksilen kenarlar', t: 'Kıyılar net kara kaybediyor', st: 'zor', r: ['13:41'],
    q: [['13:41', 'Görmüyorlar mı ki, Biz yeryüzünü etrafından gitgide eksiltmekteyiz.']],
    o: 'Klasik tefsir bunu fethedilen topraklar diye açıklar. Bu okuma kelimesi kelimesine kara kaybı anlıyor.',
    z: 'Kıyılar küresel ölçekte net kara kaybediyor.',
    b: '<b>Zorlanıyor.</b> 1985–2015 uydu verileri kıyılarda net kara kazancı gösterdi (dolgu, nehir birikintileri).',
    s: [[2035, 'Deniz seviyesi yükselişiyle yeni uydu ölçümleri']],
    c: 'Uydu ölçümleri net kazancın sürdüğünü gösterirse.' },
  { k: 'Kızgın deniz', t: 'Yerin altında okyanus kadar su var', st: 'kismen', r: ['52:6'],
    q: [['52:6', 'Ve mescûr denize andolsun.']],
    o: '“Mescûr” hem “dolu” hem “kızdırılmış” demek: içi su dolu, sıcak bir “deniz”.',
    z: 'Yer kabuğunun altında, sıcak manto kayalarının içinde yüzeydeki okyanuslar kadar ya da daha fazla su var.',
    b: 'Kısmen destekleniyor. 2014’te manto kökenli bir mineralde su bulundu; toplam miktarı tartışmalı.',
    s: [[2030, 'Sismik ve mineral çalışmaları']],
    c: 'Manto geçiş bölgesinin büyük ölçüde kuru olduğu gösterilirse.' },
  { k: 'Yarılan yer', t: 'Kabuğu levhalara bölünmüş tek gezegen Dünya', st: 'acik', r: ['86:12'],
    q: [['86:12', 'Yarılan (sad‘) yeryüzüne andolsun.']],
    o: 'Yeminde Dünya’nın ayırt edici özelliği olarak “yarılma” öne çıkarılıyor.',
    z: 'Venüs’te ve Mars’ta bugün işleyen bir levha hareketi yok; yeri levhalara bölünmüş tek gezegen Dünya.',
    b: 'Açık. Venüs’ün yüzeyi henüz yeterince tanınmıyor.',
    s: [[2031, 'VERITAS ve EnVision Venüs görevleri']],
    c: 'Venüs’te ya da başka bir gezegende etkin levha hareketi bulunursa.' },
  { k: 'Dolu ve şimşek', t: 'Yıldırımı dolu ve buz başlatır', st: 'acik', r: ['24:43'],
    q: [['24:43', 'Gökten, içinde dolu bulunan dağlar gibi bulutlar indirir… Şimşeğinin parıltısı neredeyse gözleri alır.']],
    o: 'Ayet doluyu ve şimşeği aynı bulutta, art arda anıyor.',
    z: 'Yıldırımı başlatan, buluttaki dolu ve buz parçacıklarının çarpışmasıdır, kozmik ışınlar değil.',
    b: 'Açık. Yıldırımın nasıl başladığı hâlâ bilinmiyor.',
    s: [[2029, 'LOFAR ve ASIM ölçümleri']],
    c: 'Yıldırımın kozmik ışınlarla tetiklendiği gösterilirse.' },
  { k: 'Aşılayan rüzgâr', t: 'Rüzgârın taşıdığı canlılar yağmuru başlatır', st: 'kismen', r: ['15:22'],
    q: [['15:22', 'Rüzgârları aşılayıcı olarak gönderdik; yukarıdan su indirdik.']],
    o: '“Levâkıh” aşılayan demek; ayet aşılamayı doğrudan yağmura bağlıyor.',
    z: 'Rüzgârın taşıdığı bakteri ve polenler yağmurun başlamasında belirleyici bir rol oynar.',
    b: 'Kısmen destekleniyor. Kar tanelerinde buz çekirdeği oluşturan bakteriler bulundu; etkinin büyüklüğü tartışmalı.',
    s: [[2030, 'Atmosfer örneklemeleri']],
    c: 'Biyolojik parçacıkların yağışa katkısı önemsiz çıkarsa.' },
  { k: 'Balçık', t: 'Yaşam kilin üzerinde başladı', st: 'acik', r: ['15:26'],
    q: [['15:26', 'İnsanı kuru balçıktan, işlenebilen kara topraktan yarattık.']],
    o: '“Hame’in mesnûn”: şekillenmiş kara çamur. Okuma bunu yaşamın kimyasal başlangıcına uyguluyor.',
    z: 'Yaşamın ilk molekülleri kil minerallerinin yüzeyinde oluştu, deniz altındaki sıcak su bacalarında değil.',
    b: 'Açık. İki görüş de destekçi buluyor.',
    s: [[2033, 'Mars Örnek Dönüşü'], [2030, 'Laboratuvar sentezleri']],
    c: 'Yaşamın kökeninin kilsiz bir ortamda olduğu güçlü biçimde gösterilirse.' },
  { k: 'Tek nefis', t: 'İnsan soyu dar bir darboğazdan geçti', st: 'kismen', r: ['4:1'],
    q: [['4:1', 'Sizi bir tek nefisten yaratan, ondan eşini var eden…']],
    o: 'Bütün insanlar tek bir kökten.',
    z: 'İnsan soyu geçmişte çok dar bir nüfus darboğazından geçti.',
    b: 'Kısmen. 2023’teki bir çalışma yaklaşık 900 bin yıl önce 1.300 kişilik bir darboğaz buldu. Ama genetik bulgular son 500 bin yılda tek bir çiftle bağdaşmıyor.',
    s: [[2030, 'Antik genom çalışmaları']], c: 'Darboğaz bulgusu yeni verilerde kaybolursa.' },
  { k: 'Uzun uyku', t: 'İnsan uzun süre askıya alınabilir', st: 'acik', r: ['18:11', '18:18'],
    q: [['18:11', 'Mağarada kulaklarına yıllarca perde vurduk.'], ['18:18', 'Biz onları sağa ve sola çevirirdik.']],
    o: 'Mağara arkadaşlarının uzun uykusunda iki ayrıntı veriliyor: dış seslerin kesilmesi ve bedenin düzenli çevrilmesi.',
    z: 'İnsanda kış uykusu benzeri uzun süreli bir askıya alma mümkün; anahtarı duyu yalıtımı ve düzenli pozisyon değişimi.',
    b: 'Açık. Avrupa Uzay Ajansı uzun yolculuklar için insan kış uykusunu araştırıyor.',
    s: [[2035, 'Tıbbi hipotermi ve uzay tıbbı çalışmaları']], c: 'İnsanda güvenli uzun süreli askıya almanın biyolojik olarak imkânsız olduğu gösterilirse.' },
  { k: 'İçki', t: 'Alkolün hiçbir miktarı net fayda sağlamaz', st: 'destek', r: ['2:219'],
    q: [['2:219', 'İkisinde hem büyük günah hem insanlara bazı faydalar vardır. Günahları faydasından daha büyüktür.']],
    o: 'Ayet faydayı inkâr etmiyor ama zararın her zaman ağır bastığını söylüyor.',
    z: '“Az içki kalbe iyi” bulgusu çöker; alkolün hiçbir miktarı sağlığa net fayda sağlamaz.',
    b: 'Destekleniyor. Dünya Sağlık Örgütü 2023’te “güvenli bir miktar yok” dedi; büyük analizler az içmenin faydasını bulamadı.',
    s: [[2028, 'Genetik yöntemli (Mendel randomizasyonu) çalışmalar']], c: 'İyi tasarlanmış çalışmalar az miktarda net fayda bulursa.' },
  { k: 'Oruç', t: 'Oruç kaloriden bağımsız fayda sağlar', st: 'acik', r: ['2:184'],
    q: [['2:184', 'Oruç tutmanız sizin için daha hayırlıdır, eğer bilirseniz.']],
    o: 'Ayet oruçtaki hayrı “bilirseniz” diyerek bilgiye bağlıyor.',
    z: 'Düzenli, sınırlı süreli oruç, aynı kaloriyi yemeye göre metabolizmaya ve ömre ek fayda sağlar.',
    b: 'Açık. Sonuçlar çelişkili; 2024’te bir gözlemsel çalışma risk bile bildirdi.',
    s: [[2030, 'Uzun süreli klinik denemeler']], c: 'Denemeler faydanın tamamen kalori azalmasından geldiğini gösterirse.' },
  { k: 'Zikir', t: 'Ritmik zikir stresi düşürür', st: 'kismen', r: ['13:28'],
    q: [['13:28', 'Dikkat edin, kalpler ancak Allah’ı anmakla huzura kavuşur.']],
    o: '“Huzur” ölçülebilir bir bedensel durum olarak okunuyor.',
    z: 'Ritmik zikir nefesi dakikada 6’ya yaklaştırır, kalp atış değişkenliğini artırır, stres göstergelerini düşürür.',
    b: 'Kısmen destekleniyor. 2001’de BMJ’de tespih ve mantra okumanın bu etkiyi yaptığı gösterildi.',
    s: [[2028, 'Kalp atış değişkenliği ve kortizol çalışmaları']], c: 'Kontrollü denemeler etki bulmazsa.' },
  { k: 'Gece kalkışı', t: 'Gece uyanıp yapılan ezber daha kalıcıdır', st: 'kismen', r: ['73:6'],
    q: [['73:6', 'Şüphesiz gece kalkışı daha tesirli ve o vakit okumak daha elverişlidir.']],
    o: '“Nâşietü’l-leyl”: uykudan kalkıp yapılan gece ibadeti; etkisi ve okumanın kalıcılığı vurgulanıyor.',
    z: 'Uyku arasında uyanılarak yapılan ezber, gündüz yapılan ezberden daha kalıcıdır.',
    b: 'Kısmen destekleniyor. Uykunun belleği pekiştirdiği biliniyor; uyku arasındaki uyanışın ayrıca etkisi sınanmadı.',
    s: [[2028, 'Uyku laboratuvarı deneyleri']], c: 'Deneyler gece ezberinin daha kalıcı olmadığını gösterirse.' },
];
const tezRefs = TEZ.flatMap(t => t.r);
const tezTerms = () => Object.entries(TS).map(([k, [n, c]]) => ['set', TEZ.filter(t => t.st === k).flatMap(t => t.r).join(','), '', n, c]);
const tezLabels = () => TEZ.map((t, i) => ({ r: t.r[0], t: `${i + 1}`, c: TS[t.st][1] }));
const tezList = () => `<ol class="tzlist">${TEZ.map((t, i) => `<li style="--c:${TS[t.st][1]}"><a href="#" data-go="${i + 1}"><i>${i + 1}</i>${t.t}</a></li>`).join('')}</ol>`;
const tezLinks = TEZ.flatMap(t => t.r.length > 1 ? [{ a: t.r[0], b: t.r[t.r.length - 1], c: TS[t.st][1] }] : []);
const tezScore = () => `<div class="tzscore">${Object.entries(TS).map(([k, [n, c]]) => `<span style="--c:${c}"><b>${TEZ.filter(t => t.st === k).length}</b>${n}</span>`).join('')}</div>`;
function tezTimeline() {
  const ev = TEZ.flatMap((t, i) => t.s.map(([y, w]) => ({ y, w, i, c: TS[t.st][1] }))).sort((a, b) => a.y - b.y);
  const ys = [...new Set(ev.map(e => e.y))], now = new Date().getFullYear();
  return `<ol class="tztl">${ys.map(y => `<li class="${y <= now ? 'past' : ''}"><b>${y}</b><div>${ev.filter(e => e.y === y).map(e => `<span style="--c:${e.c}"><i>${e.i + 1}</i>${e.w}</span>`).join('')}</div></li>`).join('')}</ol>`;
}
function countdown(d, w) { const n = Math.ceil((new Date(d) - new Date()) / 864e5); return n > 0 ? `<div class="tzcd"><b>${fmt(n)}</b> gün kaldı · ${w}</div>` : ''; }
const tezCard = (t, i) => `<div class="tzcard" style="--c:${TS[t.st][1]}"><div class="tzh"><span class="tzn">${i + 1}</span><h4>${t.t}</h4><span class="tag" style="--c:${TS[t.st][1]}">${TS[t.st][0]}</span></div>
  ${t.q.map(([r, x]) => `<div class="quote" style="--c:${TS[t.st][1]}">“${x}” <small>${vlink(r, TS[t.st][1])}</small></div>`).join('')}
  <dl><dt>Okuma</dt><dd>${t.o}</dd><dt>Tez</dt><dd><b>${t.z}</b></dd><dt>Bugün</dt><dd>${t.b}</dd>
  ${t.s.length ? `<dt>Sınav</dt><dd>${t.s.map(([y, w]) => `<span class="tzy">${y}</span> ${w}`).join('<br>')}</dd>` : ''}<dt>Çökerse</dt><dd>${t.c}</dd></dl>
  ${t.cd ? countdown(...t.cd) : ''}</div>`;

const STORIES = [
  { id: 'madrake', t: 'Nereden bileceksin?', icon: '؟', d: '13 soru cevaplanıyor, 3’ü açık kalıyor', steps: [
    { terms: [['ar', 'ادراك', 'affix', 'Sana ne bildirdi?', GOLD], ['ar', 'يدريك', 'affix', 'Seni ne bilgilendirecek?', VIOLET]], cam: 'fit',
      text: `Kur’an’da birbirine çok benzeyen iki soru kalıbı var.<div class="pair"><span style="--c:${GOLD}"><b class="ar">وَمَا أَدْرَاكَ</b>“Sana ne bildirdi ki…?” <em>13 kez</em></span><span style="--c:${VIOLET}"><b class="ar">وَمَا يُدْرِيكَ</b>“Seni ne bilgilendirecek?” <em>3 kez</em></span></div>Altın noktalar birinci, mor noktalar ikinci kalıp. Neredeyse hepsi son cüzde toplanmış.` },
    { terms: [['ar', 'ادراك', 'affix', 'Soru · 13', GOLD], ['set', MADRAKE.map(x => x[1]).join(','), '', 'Cevap', TEAL]], links: MADRAKE.map(([q, a]) => ({ a: q, b: a, c: GOLD })),
      labels: MADRAKE.map(([q, , t]) => ({ r: q, t, c: GOLD })), cam: MADRAKE.flat().filter(x => /:\d/.test(x)),
      text: `<b>13 sorunun 13’ü de cevaplanıyor.</b> Her “sana ne bildirdi ki?” sorusunun cevabı hemen ardından gelen ayette veriliyor. İplikler soruyu (altın) cevabına (yeşil) bağlıyor.`,
      list: MADRAKE.map(([q, a, t, c]) => `<li>${vlink(q, GOLD)} <b>${t}</b> → ${vlink(a, TEAL)} <span>${c}</span></li>`) },
    { terms: [['set', YUDRIKE.map(x => x[0]).join(','), '', 'Seni ne bilgilendirecek?', VIOLET]], pulses: YUDRIKE.map(x => x[0]), labels: YUDRIKE.map(([r, t]) => ({ r, t: t + ' · ?', c: VIOLET })), cam: YUDRIKE.map(x => x[0]),
      text: `<b>“Seni ne bilgilendirecek?” diye sorulan 3 şeyin hiçbirinin cevabı verilmiyor.</b> İkisi kıyametin ne zaman kopacağı, biri âmâ sahâbînin geleceği hakkında. Bu noktalardan iplik çıkmıyor; sorular açık kalıyor.`,
      list: YUDRIKE.map(([r, t]) => `<li>${vlink(r, VIOLET)} <b>${t}</b> <span>${esc(short(meal(r), 110))}</span></li>`) },
    { terms: [['ar', 'ادراك', 'affix', 'Sana ne bildirdi?', GOLD], ['ar', 'يدريك', 'affix', 'Seni ne bilgilendirecek?', VIOLET]], links: MADRAKE.map(([q, a]) => ({ a: q, b: a, c: GOLD })), pulses: YUDRIKE.map(x => x[0]), cam: 'fit',
      text: `Bu ayrımı ilk fark edenlerden Süfyân b. Uyeyne’dir, Buhârî de aktarır: <i>“Kur’an’da ‘mâ edrâke’ denen her şeyi Allah bildirmiştir; ‘mâ yudrîke’ denenleri bildirmemiştir.”</i><br><br>Verideki sayım bu kuralı birebir doğruluyor: <b>13 iplik kapanıyor, 3 soru açık kalıyor.</b>` },
  ] },
  { id: 'soruyorlar', t: 'Sana soruyorlar', icon: '❝', d: '15 soru, 15 cevap ve bir istisna', steps: [
    { terms: [['ar', 'يسألونك', 'affix', 'Sana soruyorlar', GOLD]], labels: SORUYOR.filter(x => !x[0].startsWith('2:')).map(([r, t]) => ({ r, t, c: GOLD })), cam: 'fit',
      text: `<b class="ar">يَسْأَلُونَكَ</b> “Sana soruyorlar” kalıbı <b>13 ayette 15 kez</b> geçiyor (2:219 ve 7:187’de ikişer soru var). Neredeyse her birinde cevap <b>“De ki…”</b> diye başlıyor ve aynı ayette veriliyor.`,
      list: SORUYOR.map(([r, t, c]) => `<li>${vlink(r, GOLD)} <b>${t}</b> → <span>${c}</span></li>`) },
    { terms: [['ar', 'يسألونك', 'affix', 'Sana soruyorlar', GOLD], ['set', '2:186', '', 'Kullarım Beni sorarsa', ROSE]],
      labels: [...SORUYOR.filter(x => x[0].startsWith('2:')).map(([r, t]) => ({ r, t, c: GOLD })), { r: '2:186', t: '“Ben yakınım”', c: ROSE }], pulses: ['2:186'], cam: ['2:184', '2:189', '2:222', '2:224'],
      text: `Bakara sûresinde sorular art arda geliyor. Hepsine “<b>De ki</b>” ile cevap veriliyor, biri hariç:<div class="quote" style="--c:${ROSE}">“Kullarım sana Beni sorarlarsa, <b>(bilsinler ki) Ben yakınım.</b>” <small>${vlink('2:186', ROSE)}</small></div>Burada araya “de ki” girmiyor. Allah’ı soranlara cevabı Allah doğrudan veriyor; tefsirlerde ayrıca vurgulanan bir nokta.` },
    { terms: [['set', '7:187,79:42,33:63', '', 'Kıyamet ne zaman?', GOLD], ['set', '31:34', '', 'Bilgisi Allah katında', TEAL], ['set', '6:59', '', 'Gaybın anahtarları', BLUE]],
      links: [{ a: '7:187', b: '31:34', c: GOLD }, { a: '79:42', b: '31:34', c: GOLD }, { a: '33:63', b: '31:34', c: GOLD }, { a: '6:59', b: '31:34', c: BLUE, dash: true }],
      labels: [{ r: '7:187', t: 'Ne zaman?', c: GOLD }, { r: '79:42', t: 'Ne zaman?', c: GOLD }, { r: '33:63', t: 'Ne zaman?', c: GOLD }, { r: '31:34', t: 'Allah katında', c: TEAL }, { r: '6:59', t: 'Gaybın anahtarları', c: BLUE }], cam: 'fit',
      text: `Tek bir soruya üç ayrı yerde aynı cevap veriliyor: <b>Kıyamet ne zaman?</b> Cevap kasten verilmiyor: “Onun bilgisi yalnız Rabbimin katındadır.” Üç iplik de Lokmân 34’te birleşiyor: <i>“Kıyamet saatinin bilgisi Allah katındadır.”</i><br><br><small class="muted">Kesikli mavi iplik: Hz. Peygamber “gaybın anahtarları beştir” deyip (6:59) bu ayeti okumuştur (Buhârî).</small>` },
  ] },
  { id: 'uzak', t: 'Uzak cevaplar', icon: '⌒', d: 'Sorusu bir sûrede, cevabı başka sûrede', steps: [
    ...UZAK.map(u => ({
      terms: [['set', u.q, '', 'Soru', GOLD], ['set', [u.a, u.a2].filter(Boolean).join(','), '', 'Cevap', TEAL]],
      links: [{ a: u.q, b: u.a, c: u.self ? GOLD : u.dash ? BLUE : GOLD, dash: u.dash }, ...(u.a2 ? [{ a: u.a, b: u.a2, c: TEAL }] : [])],
      labels: [{ r: u.q, t: u.q, c: GOLD }, { r: u.a, t: u.a, c: TEAL }, ...(u.a2 ? [{ r: u.a2, t: u.a2 + ' · Ramazan', c: TEAL }] : [])], cam: [u.q, u.a, u.a2].filter(Boolean),
      text: `<h4>${u.t}</h4>${u.self ? '<span class="tag">Kur’an kendisi işaret ediyor</span>' : u.dash ? '<span class="tag soft">Rivayetle bağlanıyor</span>' : ''}<p>${u.d}</p>${qa(u.q, u.a)}${u.a2 ? `<div class="qa one"><div style="--c:${TEAL}"><small>Ve · ${vlink(u.a2, TEAL)} Bakara</small><p>${esc(short(meal(u.a2), 170))}</p></div></div>` : ''}`,
    })),
    { terms: [['set', UZAK.map(u => u.q).join(','), '', 'Soru', GOLD], ['set', UZAK.flatMap(u => [u.a, u.a2]).filter(Boolean).join(','), '', 'Cevap', TEAL]],
      links: UZAK.flatMap(u => [{ a: u.q, b: u.a, c: u.dash ? BLUE : GOLD, dash: u.dash }, ...(u.a2 ? [{ a: u.a, b: u.a2, c: TEAL }] : [])]), cam: 'fit',
      text: `Hepsi bir arada. Âlimler buna <b>“Kur’an’ın Kur’an’la tefsiri”</b> der: bir ayetin kapalı bıraktığını başka bir ayet açar. Düz iplikler ayetlerin kendisinden, kesikli iplikler rivayetten gelen bağlantılar.`,
      list: UZAK.map(u => `<li>${vlink(u.q, GOLD)} → ${vlink(u.a, TEAL)}${u.a2 ? ' → ' + vlink(u.a2, TEAL) : ''} <b>${u.t}</b></li>`) },
  ] },
  { id: 'terazi', t: 'Canlı terazi', icon: '⚖', d: 'Eşitlikler hangi yöntemde tutuyor?', steps: EQ.map(e => ({ eq: e })).concat([{ chance: true }]) },
  { id: 'sayilar', t: 'Sayıların şekli', icon: '◷', d: '365 gün, 12 ay, her üç ayetten biri', steps: [
    { terms: [['ar', 'يوم', 'affix', 'Gün (يوم)', GOLD]], shape: calendarShape,
      text: `<b class="ar">يَوْم</b> “gün” kelimesi <b>tekil</b> hâliyle tam <b>365</b> kez geçiyor. Noktalar haritadan kalkıp bir yıllık takvime diziliyor; her nokta bir geçiş.<br><br><small class="muted">Yöntem: yalnız tekil “yevm”, ön ekleriyle (و ف ب ل ال). İkil (يومين) ve çoğul (أيام) sayılmıyor. Yöntem değişirse sayı da değişir.</small>` },
    { terms: [['ar', 'شهر', 'affix', 'Ay (شهر)', BLUE]], shape: clockShape,
      text: `<b class="ar">شَهْر</b> “ay” kelimesi tekil hâliyle <b>12</b> kez geçiyor; bir yılın ay sayısı kadar.<div class="quote" style="--c:${BLUE}">“Allah katında ayların sayısı on ikidir.” <small>${vlink('9:36', BLUE)}</small></div>` },
    { terms: [['lemma', 'اللَّه', 'lemma', 'Allah', GOLD]], cam: 'fit', metric: true,
      text: `<b class="ar">اللَّه</b> ismi <b>2.699</b> kez geçiyor ve <b>1.821</b> ayette yer alıyor. 6.236 ayetin %29’u: <b>yaklaşık her üç ayetten biri.</b> Yanan noktalara bakın; hiçbir bölge boş kalmıyor.` },
  ] },
  { id: 'tezler', t: 'Önceden yazılan tezler', icon: '⧗', d: 'Ayetten keşfe: 25 tez, sonucu bekleniyor', nw: true, steps: [
    { terms: tezTerms(), labels: tezLabels(), pulses: TEZ.filter(t => t.st === 'acik').map(t => t.r[0]), cam: 'fit',
      text: `Bilinen yol hep aynı: önce bilim bir şey bulur, sonra bir ayete o anlam verilir. Burada <b>yönü tersine çeviriyoruz</b>: bir ayetin bir okumasından, sonucu henüz bilinmeyen ve yanlışlanabilen bir tez çıkarıyoruz, tarihini koyup bekliyoruz.<div class="quote" style="--c:${GOLD}">Kayıt tarihi: <b>${TEZ_TARIH}</b></div>Tez tutarsa “keşiften sonra yorumlandı” itirazına açık olmaz. Tutmazsa çöken Kur’an değil, <b>o okuma</b> olur. Tutmayanlar da bu listede kalacak.${tezScore()}${tezList()}<small class="muted">Haritadaki numaralar tezlere karşılık geliyor; halkalar sonucu henüz belli olmayanlar. Bir teze dokunun, doğrudan ona gidin.</small>` },
    ...TEZ.map((t, i) => ({
      terms: [['set', t.r.join(','), '', `Tez ${i + 1} · ${t.k}`, TS[t.st][1]]],
      links: t.r.length > 1 ? [{ a: t.r[0], b: t.r[t.r.length - 1], c: TS[t.st][1] }] : [],
      labels: t.r.map(r => ({ r, t: r, c: TS[t.st][1] })), pulses: t.st === 'acik' ? [t.r[0]] : [], cam: t.r,
      text: tezCard(t, i) })),
    { terms: tezTerms(), labels: tezLabels(), links: tezLinks, cam: 'fit',
      text: `<h4>Sonuç takvimi</h4><p>25 tezin çoğunun cevabı 2027–2035 arasında gelecek. Her yıl hangi tezin sınandığı:</p>${tezTimeline()}${tezScore()}
      <h4>Oyunun kuralları</h4><ol class="tzrules"><li><b>Okuma önceden yazılır.</b> Kelimenin hangi anlamının seçildiği sonuç bilinmeden belirlenir, sonradan değişmez.</li><li><b>Tez yanlışlanabilir olmalı.</b> “Ne olursa çöker?” sorusunun bir cevabı olmalı.</li><li><b>Tarih konur.</b> Bu liste ${TEZ_TARIH} tarihli.</li><li><b>Tutmayanlar da sayılır.</b> Yalnız tutanları anlatmak, “keşiften sonra yorum” yöntemine geri dönmek olur. Zorlanan tezler de listede kalıyor.</li></ol>` },
  ] },
  { id: 'siklik', t: 'En çok geçen kelimeler', icon: '▤', d: 'Kelimelerin yarışı', steps: [
    { top: TOP_ALL, text: `Kur’an’da <b>77.429</b> kelime var. Edatlarla birlikte sayınca zirvede “-den” (مِن) var; <b>Allah</b> ismi ikinci sırada. Her çubuk bir kelime, her nokta bir geçiş.` },
    { top: TOP_CONTENT, text: `Edatları çıkarınca sıralama: <b>Allah</b> 2.699, “dedi” 1.618, “oldu” 1.358, <b>Rab</b> 975. Kur’an’ın en sık kullandığı fiil “dedi”: anlatının büyük kısmı konuşmalardan oluşuyor.` },
  ] },
];

/* ---------- kurulum: panel ve keşif kartları ---------- */
const side = $('.side'), mapEl = $('#map');
const disc = document.createElement('div');
disc.className = 'explore discover'; disc.id = 'discover';
disc.innerHTML = `<h3>Keşifler</h3><p class="muted small">Adım adım anlatılan, haritada canlanan tespitler.</p><div class="disc">${STORIES.map((s, k) => `<button data-k="${k}"><i>${s.icon}</i><b>${s.t}${s.nw ? ' <em class="nw">Yeni</em>' : ''}</b><span>${s.d}</span></button>`).join('')}</div>`;
side.insertBefore(disc, $('.explore'));
disc.querySelectorAll('button').forEach(b => b.onclick = () => start(STORIES[+b.dataset.k].id, 0));

/* ---------- yan sütun sekmeleri: Sonuçlar · Keşifler · Keşfet ---------- */
const TABS = [['res', 'Sonuçlar', $('#stats')], ['kesif', 'Keşifler', disc], ['kesfet', 'Keşfet', $('.explore:not(.discover)')]];
const tabs = document.createElement('nav');
tabs.className = 'sidetabs'; tabs.setAttribute('role', 'tablist');
tabs.innerHTML = TABS.map(([k, l]) => `<button role="tab" data-tab="${k}" aria-controls="tab-${k}">${l}<b></b></button>`).join('');
side.insertBefore(tabs, $('#stats'));
TABS.forEach(([k, , el]) => { el.id = el.id || 'tab-' + k; el.setAttribute('role', 'tabpanel'); el.dataset.tabpanel = k; });
let curTab = '';
function showTab(k, save = true) {
  curTab = k;
  TABS.forEach(([kk, , el]) => { el.hidden = kk !== k; });
  tabs.querySelectorAll('button').forEach(b => { const on = b.dataset.tab === k; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
  if (save) try { sessionStorage.setItem('ayet-tab', k); } catch (_) {}
}
tabs.addEventListener('click', e => { const b = e.target.closest('button[data-tab]'); if (b) showTab(b.dataset.tab); });
const resBadge = () => { const n = A.state.terms.length ? A.resultCount() : 0; const b = tabs.querySelector('[data-tab=res] b'); b.textContent = n ? fmt(n) : ''; b.hidden = !n; };
addEventListener('ayet:terms', e => { resBadge(); if (e.detail.n && !story) showTab('res'); });
addEventListener('ayet:results', () => showTab('res'));
addEventListener('ayet:stats', resBadge);
let t0 = ''; try { t0 = sessionStorage.getItem('ayet-tab') || ''; } catch (_) {}
showTab(TABS.some(t => t[0] === t0) ? t0 : (A.state.terms.length ? 'res' : 'kesif'), false); resBadge();

const panel = document.createElement('section');
panel.className = 'story'; panel.hidden = true;
panel.innerHTML = `<div class="st-h"><span class="pill">KEŞİF</span><b id="stTitle"></b><button class="ghost icon" id="stClose" title="Kapat">✕</button></div>
  <div class="st-b" id="stBody"></div>
  <div class="st-f"><button class="ghost icon" id="stPrev" title="Önceki">‹</button><span id="stDots"></span><button class="gold" id="stNext">Devam ›</button><button class="ghost" id="stShare" title="Bu adımın bağlantısını kopyala">Paylaş</button></div>`;
const mq = matchMedia('(max-width:980px)');
const place = () => mq.matches ? mapEl.after(panel) : side.prepend(panel);
place(); mq.addEventListener('change', place);

const topBtns = $('.topbtns');
if (topBtns) { const b = document.createElement('button'); b.className = 'ghost'; b.textContent = '✦ Keşifler'; b.onclick = () => { showTab('kesif'); (mq.matches ? tabs : disc).scrollIntoView({ behavior: 'smooth', block: 'start' }); disc.animate([{ boxShadow: '0 0 0 0 rgba(233,196,106,.6)' }, { boxShadow: '0 0 0 14px rgba(233,196,106,0)' }], { duration: 900 }); }; topBtns.prepend(b); }

/* ---------- harita katmanı: iplikler, etiketler, nabızlar ---------- */
let story = null, step = 0, layer = null;
function setLayer(st) {
  layer = { t0: performance.now(), links: (st.links || []).map(l => ({ ...l, ia: vi(l.a), ib: vi(l.b) })), labels: (st.labels || []).map(l => ({ ...l, i: vi(l.r) })), pulses: (st.pulses || []).map(vi) };
  A.setOverlay(layer.links.length || layer.labels.length || layer.pulses.length ? drawLayer : null);
}
function drawLayer(ctx, now, g) {
  if (!layer || A.state.chart) return false;
  const P = A.pos, el = now - layer.t0, sp = i => [P[2 * i] * g.s + g.ox, P[2 * i + 1] * g.s + g.oy];
  const n = layer.links.length;
  ctx.save(); ctx.lineCap = 'round';
  const segs = [];
  layer.links.forEach((l, k) => {
    const [ax, ay] = sp(l.ia), [bx, by] = sp(l.ib), df = l.ib - l.ia;
    // ızgarada satır sonuna denk gelen ardışık ayetler: ipliği kenardan kenara germek yerine iki kısa kanca çiz
    if (Math.abs(df) <= 3 && Math.hypot(bx - ax, by - ay) > (Math.abs(df) + 1.5) * g.s) {
      segs.push([l, k, ax, ay, ax + df * g.s * 1.6, ay, false], [l, k, bx - df * g.s * 1.6, by, bx, by, true]);
    } else segs.push([l, k, ax, ay, bx, by, true]);
  });
  segs.forEach(([l, k, x1, y1, x2, y2, end]) => {
    const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1;
    let nx = -dy / d, ny = dx / d; if (ny > 0 || (ny === 0 && nx > 0)) { nx = -nx; ny = -ny; }
    const h = Math.max(16, Math.min(d * .32, 260)), cx = (x1 + x2) / 2 + nx * h, cy = (y1 + y2) / 2 + ny * h;
    const t = Math.max(0, Math.min(1, (el - 250 - k * Math.min(160, 1600 / n)) / 900)), e = 1 - Math.pow(1 - t, 3);
    if (t <= 0) return;
    const pt = u => [(1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * cx + u * u * x2, (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * cy + u * u * y2];
    const path = () => { ctx.beginPath(); ctx.moveTo(x1, y1); for (let j = 1; j <= 48; j++) { const [x, y] = pt(e * j / 48); ctx.lineTo(x, y); } };
    ctx.setLineDash(l.dash ? [6, 6] : []);
    path(); ctx.strokeStyle = l.c; ctx.globalAlpha = .16; ctx.lineWidth = 7; ctx.stroke();
    path(); ctx.globalAlpha = .95; ctx.lineWidth = 1.7; ctx.stroke();
    ctx.setLineDash([]);
    if (t >= 1) { // cevaba akan ışık
      const u = ((now / 1700) + k * .13) % 1, [px, py] = pt(u);
      ctx.globalAlpha = .9 * Math.sin(u * Math.PI); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px, py, 2.4, 0, 6.2832); ctx.fill();
      if (end) { ctx.globalAlpha = 1; ctx.strokeStyle = TEAL; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(x2, y2, Math.max(4, g.r * 2), 0, 6.2832); ctx.stroke(); }
    }
  });
  // açık sorular: genişleyen halkalar
  layer.pulses.forEach((i, k) => {
    const [x, y] = sp(i);
    for (let q = 0; q < 2; q++) {
      const ph = ((now / 1600) + q * .5 + k * .2) % 1;
      ctx.globalAlpha = (1 - ph) * .8; ctx.strokeStyle = layer.labels.find(l => l.i === i)?.c || VIOLET; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, Math.max(4, g.r * 1.6) + ph * 22, 0, 6.2832); ctx.stroke();
    }
  });
  // etiketler (çakışmayı önleyerek)
  const la = Math.max(0, Math.min(1, (el - 500) / 500));
  if (la > 0 && layer.labels.length) {
    ctx.globalAlpha = la; ctx.font = '500 11.5px Inter'; ctx.textBaseline = 'middle';
    const placed = [], rad = Math.max(5, g.r * 2);
    const items = layer.labels.map(l => { const [x, y] = sp(l.i); return { ...l, x, y, w: ctx.measureText(l.t).width + 14 }; }).sort((a, b) => a.y - b.y || a.x - b.x);
    const hit = r => placed.some(p => r.x < p.x + p.w + 3 && r.x + r.w + 3 > p.x && r.y < p.y + p.h + 2 && r.y + r.h + 2 > p.y);
    for (const it of items) {
      if (it.x < -40 || it.x > g.W + 40 || it.y < -40 || it.y > g.H + 40) continue;
      let box = null;
      for (const off of [-1, 1, -2, 2, -3, 3, -4, 4]) {
        const by = off < 0 ? it.y - rad - 6 - 20 * (-off - 1) - 18 : it.y + rad + 6 + 20 * (off - 1);
        let bx = it.x - it.w / 2; bx = Math.max(4, Math.min(g.W - it.w - 4, bx));
        const r = { x: bx, y: by, w: it.w, h: 18 }; if (!hit(r)) { box = r; break; }
      }
      if (!box) continue;
      placed.push(box);
      ctx.strokeStyle = it.c; ctx.globalAlpha = la * .5; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(it.x, it.y + (box.y < it.y ? -rad : rad)); ctx.lineTo(box.x + box.w / 2, box.y < it.y ? box.y + box.h : box.y); ctx.stroke();
      ctx.globalAlpha = la; ctx.fillStyle = 'rgba(12,11,38,.88)'; rr(ctx, box.x, box.y, box.w, box.h, 9); ctx.fill();
      ctx.strokeStyle = it.c; ctx.stroke();
      ctx.fillStyle = it.c; ctx.textAlign = 'center'; ctx.fillText(it.t, box.x + box.w / 2, box.y + box.h / 2 + .5);
    }
  }
  ctx.restore();
  return true;
}
const rr = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };

/* ---------- adım oynatma ---------- */
function camTo(refs) {
  if (refs === 'fit' || !refs) { A.tweenCam(A.fitCam(), 900); return; }
  const P = A.curP(); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const r of refs) { const i = vi(r); if (i < 0) continue; x0 = Math.min(x0, P[2 * i]); x1 = Math.max(x1, P[2 * i]); y0 = Math.min(y0, P[2 * i + 1]); y1 = Math.max(y1, P[2 * i + 1]); }
  const w = Math.max(x1 - x0, 14), h = Math.max(y1 - y0, 14), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  A.tweenCam(A.fitCam({ x0: cx - w / 2, y0: cy - h / 2 - 1.5, w, h: h + 3 }, .16), 1100);
}
function setTerms(list) {
  if (A.cardOpen()) A.closeVerse();
  A.state.shape = null; A.clearTerms();
  if (A.state.fSurah) A.focusSurah(0);
  list.forEach(([m, q, mt, label, color]) => { A.addTerm(m, q, mt, { label, many: true, silent: true }); const t = A.state.terms[A.state.terms.length - 1]; if (t && color) t.color = color; });
}
function start(id, s) {
  const st = STORIES.find(x => x.id === id); if (!st) return;
  story = st; panel.hidden = false; document.body.classList.add('kesif-on'); showTab('kesif', false); disc.querySelectorAll('button').forEach(b => b.classList.toggle('on', STORIES[+b.dataset.k] === st));
  go(Math.max(0, Math.min(st.steps.length - 1, s || 0)));
  if (mq.matches) mapEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function go(k) {
  step = k; const st = story.steps[k];
  $('#stTitle').textContent = story.t;
  const N = story.steps.length;
  $('#stDots').innerHTML = N > 14
    ? `<span class="stcount">${k + 1} / ${N}</span><b class="stbar"><i style="width:${(k + 1) / N * 100}%"></i></b>`
    : story.steps.map((_, j) => `<i class="${j === k ? 'on' : ''}" data-j="${j}"></i>`).join('');
  $('#stDots').querySelectorAll('i[data-j]').forEach(d => d.onclick = () => go(+d.dataset.j));
  const bar = $('#stDots .stbar'); if (bar) bar.onclick = e => { const r = bar.getBoundingClientRect(); go(Math.min(N - 1, Math.floor((e.clientX - r.left) / r.width * N))); };
  $('#stPrev').disabled = k === 0;
  const last = k === story.steps.length - 1;
  $('#stNext').textContent = last ? (nextStory() ? `Sonraki: ${nextStory().t} ›` : 'Bitir') : 'Devam ›';
  if (A.state.metric !== 'occ') $('#metricSeg button[data-m="occ"]').click();
  if (st.eq) return runEq(st.eq, 0);
  if (st.chance) return runChance();
  if (st.top) {
    setTerms([]); st.top.forEach(([l, tr]) => A.addTerm('lemma', l, 'lemma', { label: tr, many: true, silent: true }));
    A.recolor(); A.termsChanged(); setLayer({}); A.setChart(true);
    body(`<p>${st.text}</p><ol class="toplist">${A.state.terms.map(t => `<li style="--c:${t.color}"><span class="ar">${esc(t.ar)}</span> ${esc(t.label)} <b>${fmt(t.occ)}</b></li>`).join('')}</ol>`);
  } else {
    setTerms(st.terms || []); A.termsChanged();
    if (st.shape) { A.state.shape = st.shape; A.setChart(true); setLayer({}); }
    else { A.setChart(false); setLayer(st); camTo(st.cam); }
    body(`<div>${st.text}</div>${st.list ? `<ul class="stlist">${st.list.join('')}</ul>` : ''}`);
  }
  hash();
}
function body(html) {
  const b = $('#stBody'); b.innerHTML = html;
  b.querySelectorAll('[data-go]').forEach(a => a.onclick = e => { e.preventDefault(); go(+a.dataset.go); });
  b.querySelectorAll('.vref').forEach(a => a.onclick = e => { e.preventDefault(); A.openVerse(vi(a.dataset.r)); });
  b.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'ease-out' });
}
const nextStory = () => STORIES[STORIES.indexOf(story) + 1];
function hash() { A.setExtraHash(`k=${story.id}&s=${step + 1}`); }
function end(clear = true) {
  if (!story) return;
  story = null; panel.hidden = true; document.body.classList.remove('kesif-on'); layer = null; A.setOverlay(null); A.state.shape = null;
  disc.querySelectorAll('button').forEach(b => b.classList.remove('on'));
  A.setExtraHash('');
  if (clear) { if (A.cardOpen()) A.closeVerse(); A.setChart(false); A.clearTerms(); A.termsChanged(); A.tweenCam(A.fitCam(), 800); }
}
$('#stClose').onclick = () => end();
$('#stPrev').onclick = () => step > 0 && go(step - 1);
$('#stNext').onclick = () => { if (step < story.steps.length - 1) go(step + 1); else { const n = nextStory(); if (n) start(n.id, 0); else end(); } };
$('#stShare').onclick = () => {
  const url = location.origin + location.pathname + `#k=${story.id}&s=${step + 1}`;
  (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => A.toast('Bağlantı kopyalandı: açılınca bu keşif oynar'), () => prompt('Bağlantı', url));
};
// kullanıcı kendi aramasına dönünce keşfi kapat (terimlere dokunmadan)
['#presets', '#addBtn', '#chips', '.modes'].forEach(s => $(s) && $(s).addEventListener('click', e => { if (story && e.isTrusted) end(false); }, true));
$('#q').addEventListener('keydown', e => { if (story && e.key === 'Enter') end(false); });
document.addEventListener('keydown', e => {
  if (!story || A.cardOpen() || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); e.stopImmediatePropagation(); $('#stNext').click(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopImmediatePropagation(); $('#stPrev').click(); }
  else if (e.key === 'Escape') end();
}, true);

/* ---------- canlı terazi ---------- */
let eqTok = 0;
function runEq(e, mi) {
  const [mname, ta, tb, note] = e.m[mi];
  setTerms([[...ta, e.a, GOLD], [...tb, e.b, BLUE]]); A.termsChanged(); setLayer({}); A.setChart(true);
  const [a, b] = A.state.terms.map(t => t.occ), same = a === b;
  body(`<div class="eqsel">${EQ.map(x => `<button data-e="${x.id}" class="${x === e ? 'on' : ''}">${x.a} ⚖ ${x.b}</button>`).join('')}</div>
    <div class="bigscale">${scaleSVG(0, 0)}<div class="nums"><span style="color:${GOLD}"><small>${e.a}</small><b id="eqA">0</b></span><em id="eqSign">=</em><span style="color:${BLUE}"><small>${e.b}</small><b id="eqB">0</b></span></div></div>
    <div class="msel"><span class="muted small">Yöntem:</span>${e.m.map((m, k) => `<button data-m="${k}" class="${k === mi ? 'on' : ''}">${m[0]}</button>`).join('')}</div>
    <p class="small muted">${note}</p>
    <p id="eqVerdict" class="verdict ${same ? 'ok' : 'no'}" hidden>${same ? `<b>Eşit.</b> Bu yöntemde ${e.a} ile ${e.b} tam ${fmt(a)} kez geçiyor.` : `<b>Eşit değil.</b> ${e.m.some(m => m !== e.m[mi]) ? 'Başka bir yöntem deneyin; ' : ''}sonuç, neyi saydığınıza bağlı.`}</p>
    <button class="ghost small" id="chanceBtn">Tesadüf testi: bu sayı başka hangi kelimelerde var?</button><div id="chanceOut"></div>`);
  $('#stBody').querySelectorAll('[data-e]').forEach(x => x.onclick = () => go(EQ.findIndex(q => q.id === x.dataset.e)));
  $('#stBody').querySelectorAll('[data-m]').forEach(x => x.onclick = () => runEq(e, +x.dataset.m));
  $('#chanceBtn').onclick = () => { $('#chanceOut').innerHTML = sameCount(a, [A.state.terms[0].id, A.state.terms[1].id]); $('#chanceBtn').hidden = true; };
  // sayaç ve terazi animasyonu
  const tok = ++eqTok, t0 = performance.now(), dur = 1700;
  const tick = now => {
    if (tok !== eqTok || !$('#eqA')) return;
    const k = Math.min(1, (now - t0) / dur), f = 1 - Math.pow(1 - k, 3), va = Math.round(a * f), vb = Math.round(b * f);
    $('#eqA').textContent = fmt(va); $('#eqB').textContent = fmt(vb);
    $('#eqSign').textContent = va === vb ? '=' : va > vb ? '>' : '<';
    $('.bigscale svg').outerHTML = scaleSVG(va, vb);
    if (k < 1) requestAnimationFrame(tick); else { $('#eqVerdict').hidden = false; $('.bigscale').classList.toggle('equal', same); }
  };
  requestAnimationFrame(tick);
  hash();
}
function scaleSVG(a, b) {
  const m = Math.max(a, b, 1), ang = Math.max(-14, Math.min(14, (b - a) / m * 28));
  const pan = (x, c) => `<g transform="rotate(${-ang} ${x} 30)"><path d="M${x} 30 L${x - 30} 96 M${x} 30 L${x + 30} 96" stroke="${c}" stroke-width="1.2" opacity=".7"/><path d="M${x - 36} 96 h72 a36 11 0 0 1 -72 0z" fill="${c}"/></g>`;
  return `<svg viewBox="0 0 320 150" aria-hidden="true"><path d="M160 30 V140 M118 140 H202" stroke="#ecebf7" stroke-width="2"/><g transform="rotate(${ang} 160 30)"><path d="M40 30 H280" stroke="#ecebf7" stroke-width="2.2"/>${pan(40, GOLD)}${pan(280, BLUE)}</g><circle cx="160" cy="30" r="5.5" fill="#e9c46a"/></svg>`;
}
// lemma olarak aynı sayıda geçen başka kelimeler
let lemRoot = null;
function lemmaInfo() {
  if (lemRoot) return;
  lemRoot = new Int32Array(A.Q.lemmas.length).fill(-1);
  for (let i = 0; i < A.N; i++) A.wLem[i].forEach((l, k) => { if (l >= 0 && A.wRoot[i][k] >= 0) lemRoot[l] = A.wRoot[i][k]; });
}
function sameCount(n, skip) {
  lemmaInfo();
  const L = A.Q.lemmas, hits = [];
  for (let l = 0; l < L.length; l++) if (lemRoot[l] >= 0 && A.lemOcc[l].length === n && !skip.includes(l)) hits.push(l);
  return `<div class="chance"><p><b>${fmt(n)}</b> sayısı, sözlük biçimiyle sayınca <b>${hits.length}</b> başka kelimede de çıkıyor${hits.length ? ':' : '.'}</p>
    ${hits.length ? `<div class="arlist">${hits.slice(0, 14).map(l => `<span class="ar" title="${esc(A.Q.roots[lemRoot[l]])} kökü">${esc(L[l])}</span>`).join('')}${hits.length > 14 ? `<span class="muted">+${hits.length - 14}</span>` : ''}</div>` : ''}
    <p class="small muted">Eşit sayı tek başına bir kanıt değil; anlamca bağlantılı iki kelimenin <i>aynı yöntemle</i> eşit çıkması ilginç olan.</p></div>`;
}
function runChance() {
  lemmaInfo();
  const L = A.Q.lemmas, cnt = new Map(); let n = 0;
  for (let l = 0; l < L.length; l++) { const c = A.lemOcc[l].length; if (lemRoot[l] >= 0 && c >= 20) { n++; cnt.set(c, (cnt.get(c) || 0) + 1); } }
  let pairs = 0, best = [0, 0]; for (const [c, k] of cnt) { pairs += k * (k - 1) / 2; if (k > best[1]) best = [c, k]; }
  setTerms([]); A.termsChanged(); A.setChart(false); setLayer({}); A.tweenCam(A.fitCam(), 800);
  body(`<h4>Tesadüf testi</h4><p>Kur’an’da 20’den fazla geçen <b>${fmt(n)}</b> anlamlı kelime var. Bunların arasında <b>aynı sayıda geçen ${fmt(pairs)} çift</b> çıkıyor. Örneğin tam <b>${best[0]}</b> kez geçen ${best[1]} farklı kelime var.</p>
    <p>Yani “iki kelime eşit sayıda geçiyor” cümlesi tek başına şaşırtıcı değil. Anlamlı olan şu üç soruya birlikte bakmak:</p>
    <ol class="stlist num"><li><b>Çift anlamca bağlantılı mı?</b> Dünya–Âhiret gibi karşıtlar mı, rastgele iki kelime mi?</li><li><b>Yöntem önceden mi seçildi?</b> Eşitliği bulmak için yöntem değiştirilirse sonuç zorlanmış olur.</li><li><b>Aynı yöntem iki kelimeye de uygulandı mı?</b> Birini kökle, ötekini yazılışla saymak adil değildir.</li></ol>
    <p class="small muted">Bu sitedeki her sayıyı siz de yöntemini değiştirerek kontrol edebilirsiniz.</p>`);
  hash();
}

/* ---------- paylaşılan bağlantıdan açılış ---------- */
const hp = new URLSearchParams(location.hash.slice(1));
if (hp.get('k')) setTimeout(() => start(hp.get('k'), (+hp.get('s') || 1) - 1), 700);
window.__kesif = { start, end, STORIES };
})();
