# MONA — Sanat Yönetimi Paketi

**Tarih:** 2026-08-26 · **Durum:** Karar önerisi — müşteri onayı bekliyor
**Kaynak:** `docs/brief-rev12.md` Bölüm 11 · `docs/DECISIONS.md` #8, #9
**Kapsam:** Bu doküman kod yazmadan önce MONA'nın görsel/işitsel yönünü
kapatmak içindir. Mevcut kod (state machine, replik kütüphanesi,
erişilebilirlik davranışı) zaten hazır ve çalışıyor — eksik olan
**prodüksiyon varlıkları ve onları üretmek için gereken sanat yönü**.

> **Uydurulmayan şeyler:** Bu dokümandaki replik metinleri, renkler ve
> etkileşim kuralları brief'ten birebir alınmıştır. Karakter tasarımına
> dair her **öneri** açıkça "ÖNERİ" olarak işaretlenmiştir; müşteri onayı
> gerektiren maddeler §8'de listelenmiştir.

---

## 1. Bugünkü durum — nereden başlıyoruz

Kod tarafı eksiksiz: `src/hooks/useMonaMachine.ts` dört durumlu state
machine'i (opening · speaking · paused · idle) uyguluyor,
`src/data/mona.ts` 11 repliğin TR+EN metnini taşıyor,
`src/components/mona/Mona.tsx` erişilebilirlik kurallarını (otomatik ses
yok, her replik yazı olarak tam okunur, Esc ile susar, klavye ile gezilir,
`prefers-reduced-motion` desteği) uyguluyor.

Üretim sunucusunda doğrulandı: açılış repliği daktilo efektiyle yazılıyor,
soruya tıklayınca cevap replik olarak akıyor, soru listesi `aria-pressed`
ile işaretleniyor. **MONA çalışıyor — sadece yüzü yok.**

Bugün ekranda görünen: CSS ile çizilmiş bej bir Macintosh silüeti, siyah
ekranında fuşya/sarı bir tarama animasyonu ve "hello" yazısı. Yanında
"MONA'nın karakter videosu ve seslendirmesi prodüksiyonda" notu.

Eksik olan tek şey `src/data/mona.ts` içindeki `audioSrc` ve `captionsSrc`
alanlarını dolduracak varlıklar + kafadaki CSS silüetin yerine geçecek
video.

---

## 2. MONA nasıl görünecek — karakter künyesi

Brief 11.1'in verdiği sabitler (değişmez):

| Öğe | Brief'in tanımı |
|---|---|
| Kafa | Eski model Apple masaüstü. Ekran = MONA'nın yüzü |
| Kostüm | Yapışık, deri gibi duran, **pullu ve pırıltılı** deniz kızı kıyafeti — lila tonlarında |
| Zemin | Baby pink |
| Metin rengi | Neon mint yeşili |
| Ton | Kendinden emin, kısa cümleli, hafif alaycı ama kibar. Emoji yok, "yapay zekâ asistanınız" demez |

### 2.1 Silüet kuralı — ÖNERİ

MONA'nın 200×250 px'lik bir mobil karede bile tanınması gerekiyor. Bu
yüzden silüet üç bloktan kurulmalı ve bu oran korunmalı:

- **Kafa (Macintosh)** — silüetin ~%35'i, kare form. Ekran kafanın
  içinde, kenar boşlukları eşit.
- **Boyun / kaide** — ince, dikey. Silüetin okunurluğunu taşıyan öğe.
- **Gövde (pullu kostüm)** — ~%55, aşağı doğru genişler.

Kafa ile gövde arasındaki **ince boyun** kritik: kalınlaşırsa figür
"robot" olur ve MONA'nın istenen zarif/absürt dengesi kaybolur.

### 2.2 Ekran = yüz

Brief "Ekran = MONA'nın yüzü" diyor ama **yüz çizmiyor**. Öneri: yüz
çizilmesin. MONA'nın ifadesi ekranın **içeriğiyle** kurulsun:

| Durum | Ekranda ne var |
|---|---|
| Açılış | `hello` yazısı (1984 Macintosh'un kendi açılış ekranı) |
| Boşta | Ajans işlerinden yavaş dönen kareler (brief 11.2) |
| İmleç ekranın üstünde | Aynı kareler hızlanır |
| Konuşurken | Repliğin konusuna bağlı kareler: dokuz en-boy oranı (Soru 1), beş başlık (Soru 3), akış şeması (Soru 7) |

Gerekçe: çizilmiş bir yüz her replikte "doğru ifade"yi üretmek zorunda
kalır — bu tek bir loop videoyla çözülemez, replik başına animasyon
gerektirir. Ekran-içerik yaklaşımı tek bir karakter loop'u + değişen ekran
içeriğiyle çözülüyor. **Prodüksiyon maliyetini 11 animasyondan 1 loop +
11 ekran kliğine indiriyor.**

---

## 3. Eski Mac kafa kalıyor mu? — EVET, 1984 Macintosh

`docs/DECISIONS.md` #9 zaten "1984 Macintosh — VARSAYILANLA İLERLE"
diyor. Bu doküman o kararı **onaylıyor** ve gerekçesini netleştiriyor:

| | 1984 Macintosh (Seçenek B) | iMac G3 (Seçenek A) |
|---|---|---|
| Silüet | Kare, kalın çerçeveli — küçük boyutta tanınır | Yuvarlak, şeffaf — küçüldükçe erir |
| Ekran oranı | 4:3'e yakın, dik — teslim listesindeki "4:3 ekran içi döngü" ile birebir | Daha geniş, kadraj kaybı |
| Renk | Bej — baby pink zeminde sıcak, yumuşak kontrast | Renkli/şeffaf — baby pink + lila + mint ile **çakışır**, palet dörde çıkar |
| Metin bağı | Ekranındaki "hello", açılış repliğine ("Hello. I'm MONA…") birebir bağlanıyor | Böyle bir bağ yok |
| Kültürel ton | 1984 = kişisel bilgisayarın başlangıcı; "kafam 1984 model, zevkim güncel" şakası buradan çıkıyor | 1998 nostaljisi, replikle uyumsuz |

**Gerekçe tek cümlede:** MONA'nın açılış repliği zaten "Kafam 1984 model
bir bilgisayar" diyor — replik yazıldı, kafa buna göre seçilmeli, tersi
değil.

---

## 4. Retro-future mı, gerçekçi 3D mi? — RETRO-FUTURE, stilize 3D

**ÖNERİ: Stilize 3D / "retro-future".** Fotogerçekçi 3D değil.

1. **Uncanny valley riski.** Deniz kızı kostümlü, bilgisayar kafalı bir
   figür fotogerçekçi render edilirse "tuhaf" olur, "esprili" olmaz.
   MONA'nın tonu hafif alaycı — görselin de bunu taşıması gerekiyor.
2. **Marka tezini görsel olarak söylüyor.** Site "insan içgüdüsü + AI"
   diyor. Fotogerçekçi bir AI karakteri bu tezle çelişir; **kasıtlı olarak
   yapay görünen** bir karakter tezi doğrular. MONA'nın kendi repliği de
   bunu söylüyor: "İnternette en son beğendiğin şey kadar gerçeğim.
   Farkım, bunu sana söylüyor olmam."
3. **Prodüksiyon ve performans.** Stilize 3D daha az poligon, daha temiz
   alfa kanalı, daha küçük WebM. LCP < 2.5 sn (mobil) sözleşme maddesi.

### 4.1 "Retro-future" burada ne demek — somut kriterler

| Boyut | Nasıl | Neden |
|---|---|---|
| **Malzeme** | Kostüm gerçekçi (pul/payet ışığı fiziksel), kafa stilize (yumuşak kenar, mat bej plastik) | Kontrast: doku gerçek, form yapay |
| **Işık** | Tek yumuşak anahtar ışık + bir fuşya kenar ışığı (rim light) | Kenar ışığı figürü baby pink zeminden ayırır; yoksa silüet zemine yapışır |
| **Kamera** | Sabit, hafif alt açı (%5–10), lens ~50 mm | Alt açı otorite verir; geniş lens karikatürleştirir |
| **Hareket** | Nefes benzeri çok küçük salınım (±2 px, 10–15 sn döngü) + kostümdeki pulların ışık oyunu | Loop'un dikişsiz olması için hareket **minimal** olmalı |
| **Kaçınılacak** | Damarlı/gözenekli deri, gerçek saç simülasyonu, hareketli göz, ağız senkronu | Hepsi uncanny valley'e ve replik başına animasyon zorunluluğuna götürür |

### 4.2 Ağız senkronu — YOK

MONA konuşurken ağzı yok, ekranı var. Ses + ekrana yazılan metin + ekran
içi görsel değişimi "konuşma" hissini kuruyor. Bu, tek bir loop videonun
11 repliğin hepsine hizmet etmesini sağlıyor — teslim listesindeki
"10–15 sn sorunsuz loop, ses yok" maddesinin gerekçesi de bu.

---

## 5. Baby pink / neon mint korunurken nasıl premium görünür

Sorun gerçek: baby pink + neon mint, yanlış uygulanırsa "çocuk oyuncağı
ambalajı" gibi görünür. Palet **değişmiyor** (brief 11.1 sabit) — premium
his renkten değil, **renk oranından, dokudan ve tipografiden** gelecek.

### 5.1 Oran kuralı — 60/30/10

| Pay | Renk | Nerede |
|---|---|---|
| ~60% | Baby pink | Yalnızca zemin. Düz, gradyansız, dokusuz |
| ~30% | Karakter (bej + lila + pul parıltısı) | Figürün kendisi |
| ~10% | Neon mint | **Sadece** replik metni. Buton, çerçeve, ikon, çizgi — hiçbirinde kullanılmaz |

Mint'in %10'u aşması bölümü anında ucuzlatır. Bugünkü kodda mint yalnızca
`.speech` sınıfında — bu doğru, korunmalı.

### 5.2 Premium hissi taşıyan dört kaldıraç

1. **Negatif alan.** Figürün etrafında en az kendi genişliği kadar boş
   baby pink kalmalı. Sıkışık kadraj = ucuz. Bugünkü masaüstü düzeni
   (sol sütun figür, sağ sütun diyalog) bunu zaten sağlıyor.
2. **Tek ışık kaynağı.** Çoklu renkli ışık = parti afişi. Tek anahtar ışık
   + fuşya rim = editoryal portre.
3. **Tipografi ölçeği.** Replik metni büyük punto (bugün
   `clamp(1.25rem, 2.6vw, 2rem)`), Montserrat Bold. Küçük punto mint =
   okunmaz **ve** ucuz. Büyük punto mint = grafik tasarım.
4. **Pulun kalitesi.** Payet/pul dokusu premium'un taşıyıcısı. Düşük
   çözünürlüklü tekrarlı doku = kumaş taklidi; her pulun ayrı ışık
   yakalaması gerekiyor. Aynı doku Creative sayfasında da kullanılacak
   (bkz. `docs/visual-audit/CREATIVE_PAGE_DIRECTION.md`) — **tek üretimden
   iki sayfa besleniyor**, bütçe gerekçesi burada.

### 5.3 Kontrast — pazarlık yok

CLAUDE.md kuralı ve kodda uygulanmış hâli: neon mint metin baby pink
zeminde AA'yı geçmek zorunda. Kod bugün mint'i koyu bir tona
(hesaplanan değer `rgb(8,64,47)`) çözüyor ve solma opaklığını 0.8'de
tutuyor (0.55'te kontrast 2.24'e düşüyordu, AA sınırı 4.5).

**Karakter tasarımı sırasında mint'in "parlak neon" hâli referans
görselde kullanılırsa, web uygulamasında koyu varyantın kullanılacağı
akılda tutulmalı** — aksi hâlde tasarım onayı ile canlı site birbirini
tutmaz.

---

## 6. MONA ana sayfada kısa mı, ayrı sayfada tam mı?

**İKİSİ DE — ama farklı ağırlıkta.** Brief 11.5 zaten böyle kurmuş; bu
doküman uygulama sınırlarını netleştiriyor.

| | Ana sayfa (`compact`) | AI sayfası (`full`) |
|---|---|---|
| Replik sayısı | 2 (brief 11.5) | 11 (10 soru + easter egg) + açılış + 3 idle + geri dönüş |
| Soru listesi | **YOK** | Var, 10 madde |
| Amaç | Merak uyandır, AI sayfasına gönder | Sayfanın kendisi olmak |
| Video | Aynı loop, daha küçük kadraj | Tam kadraj |
| Ses | Aynı dosyalar (2 replik) | 11 replik |
| Ekran yüksekliği | Tek bölüm, ~1 ekran | Sayfanın ana bloğu |

**Kritik sınır:** Ana sayfada MONA "uzun konuşma"ya girmemeli. Bugünkü
kodda `variant="compact"` bunu doğru uyguluyor: soru listesi render
edilmiyor, yalnızca iki replik + "AI Creative Production →" bağlantısı var.

**Ana sayfa için tek düzeltme önerisi:** compact sürümde "Sesi aç /
Sustur / Devam" üç buton yan yana duruyor. Ses varlığı yokken "Sesi aç"
butonu ziyaretçiye açılmayacak bir şey vaat ediyor. Öneri: ses dosyaları
gelene kadar compact sürümde **yalnızca "Devam"** kalsın (bkz. §7.2).

---

## 7. Video/ses gelene kadar placeholder nasıl daha bilinçli görünür

Bugünkü placeholder dürüst ama "yapım aşamasında" hissi veriyor. Amaç:
ziyaretçinin **eksik bir şey görmemesi** — kasıtlı bir tasarım görmesi.

### 7.1 Kafa: CSS silüetten "duraklatılmış ekran"a

Bugün: bej çerçeve + siyah ekran + fuşya/sarı tarama animasyonu + "hello".
Sorun: tarama animasyonu bir "yükleniyor" göstergesi gibi okunuyor.

**ÖNERİ:** Tarama gradyanı kaldırılsın; ekran, 1984 Macintosh'un kendi
siyah-beyaz estetiğiyle **duran bir "hello" ekranı** olsun — yanıp sönen
tek bir blok imleç eklensin. Böylece boşluk "yüklenmeyen video" değil,
"açılışta bekleyen bilgisayar" olarak okunur. Bu, gerçek video geldiğinde
de atılmayacak bir kare: video'nun poster karesi tam olarak bu olmalı.

### 7.2 Ses kontrolleri: olmayan sesin düğmesini gösterme

Bugün "Sesi aç" ve "Sustur" butonları her zaman görünüyor; oysa hiçbir ses
dosyası yok. Brief 11.6 "sessize alma düğmesi her zaman görünür" diyor —
ama bu kural **ses varken** anlamlı.

**ÖNERİ:** `audioSrc` null iken ses butonları render edilmesin; yerine tek
bir statik satır dursun: *"MONA şimdilik yazıyla konuşuyor —
seslendirme prodüksiyonda."* Ses geldiğinde butonlar otomatik geri gelir
(veri sürücülü, kod değişikliği gerektirmez).

### 7.3 Replik alanı: boş yüksekliği doldur

`.speech` bugün `min-height: 6rem` ile yer ayırıyor; replik yazılmadan
önce bu alan boş baby pink. **ÖNERİ:** Replik yokken bu alanda soluk,
büyük punto bir tırnak işareti veya MONA'nın adı (baby pink üzerine ~%8
opaklıkta) dursun — layout shift'i önler ve boşluğu kasıtlı gösterir.

### 7.4 Ekran içi döngü: gerçek işlerden önce ne dönecek

Brief "kafasındaki ekranda işlerden görüntüler döner" diyor, ama Work
envanteri henüz yok (`docs/DECISIONS.md` #16). **ÖNERİ:** Envanter gelene
kadar ekranda iş görüntüsü yerine **marka renklerinde soyut geometrik
kareler** dönsün (siyah/fuşya/sarı). Sahte iş görseli gösterilmez —
CLAUDE.md kuralı. Envanter geldiğinde aynı 4:3 slot gerçek karelerle
beslenir, tasarım değişmez.

---

## 8. Karar kapatılması gerekenler — müşteriye tek liste

Aşağıdaki maddeler bu dokümanla **kapatılamaz**; müşteri kararı gerekiyor.

| # | Karar | Bağlı DECISIONS maddesi | Neden acil |
|---|---|---|---|
| 1 | **Seslendirme: insan mı, sentetik mi?** Brief insan sesi öneriyor | #8 — AÇIK | Prodüksiyon süresi en uzun kalem. Cast + kayıt + montaj, TR ve EN ayrı |
| 2 | Seslendiren kişi(ler) — TR ve EN aynı kişi mi, ayrı mı | #8 | Bütçe ve takvim doğrudan buna bağlı |
| 3 | Karakter üretim yöntemi: 3D modelleme mi, AI görsel üretim + character sheet mi | — | Brief 11.7 "sabit bir character sheet üzerinden üretilecek" diyor, yöntem belirtmiyor |
| 4 | Karakter tasarımı onayı: 1984 Macintosh + lila pullu kostüm | #9 — VARSAYILANLA İLERLE | Onay gelmeden loop üretimi başlamamalı |
| 5 | Ekran içi döngüde gerçek iş karesi kullanılacak mı | #16 — AÇIK (blocker) | Work envanterine bağlı |
| 6 | AI Showreel filmi (Film A "Henüz Değil") teslim tarihi | brief 11.9 | Sayfa kodunda TODO olarak bekliyor |

---

## 9. Gerekli final asset listesi

Brief 11.6 teslim tablosunun uygulanabilir hâli. **Dosya adları ve yolları
burada sabitlenmiştir** — prodüksiyon bu adlarla teslim ederse kod
tarafında yalnızca `src/data/mona.ts` doldurulur, başka değişiklik
gerekmez.

### 9.1 Karakter videosu

| Varlık | Format | Spesifikasyon | Hedef yol |
|---|---|---|---|
| MONA loop — WebM | VP9 + **alfa kanalı** | 10–15 sn dikişsiz loop, **ses yok**, 1080×1350 (4:5), ≤ 24 fps | `public/media/mona/mona-loop.webm` |
| MONA loop — MP4 yedek | H.264 (alfa yok, baby pink zemin gömülü) | Aynı süre/kadraj | `public/media/mona/mona-loop.mp4` |
| Poster karesi | WebP + AVIF | Loop'un ilk karesi — ekranda "hello" görünen kare (§7.1) | `public/media/mona/mona-poster.webp` |

**Kritik:** `preload="none"` + poster kare zorunlu (CLAUDE.md performans
bütçesi). Video yalnızca görünür alana girince yüklenir.

### 9.2 Ekran içi döngü (kafadaki ekran)

| Varlık | Format | Spesifikasyon | Hedef yol |
|---|---|---|---|
| Ekran döngüsü | WebM (VP9) + MP4 | **4:3**, 8–12 sn loop, ses yok, ≤ 512×384 | `public/media/mona/screen-loop.webm` / `.mp4` |

Ayrı dosya olması şart: `prefers-reduced-motion` açıkken **yalnızca bu
döngü durur**; karakter loop'u ve metin akışı ayrı yönetilir.

### 9.3 Seslendirme — TR

Replik başına **ayrı dosya**. Dosya adları `src/data/mona.ts` içindeki
`id` alanlarıyla birebir eşleşmeli.

| Replik grubu | Adet | Dosya deseni |
|---|---|---|
| 10 soru cevabı | 10 | `public/media/mona/audio/tr/q1.mp3` … `q10.mp3` |
| Easter egg ("Gerçek misin?") | 1 | `public/media/mona/audio/tr/easter-egg.mp3` |
| **Toplam TR** | **11** | MP3 veya AAC, mono, 128 kbps yeterli |

> Açılış, idle ve geri dönüş replikleri brief 11.3'e göre **sessizdir** —
> ses dosyası üretilmez.

### 9.4 Seslendirme — EN

Aynı yapı, aynı adet: `public/media/mona/audio/en/q1.mp3` … `q10.mp3`,
`easter-egg.mp3`. **Toplam 11.**

### 9.5 Altyazı (VTT)

| Dil | Adet | Yol |
|---|---|---|
| TR | 11 | `public/media/mona/captions/tr/q1.vtt` … |
| EN | 11 | `public/media/mona/captions/en/q1.vtt` … |

Altyazı metni **birebir** `src/data/mona.ts` içindeki replik metni olmalı
— sayfa metni ile altyazı ayrışırsa SEO ve erişilebilirlik ikisi birden
bozulur.

### 9.6 Teslim özeti

| Kalem | Adet |
|---|---|
| Video (karakter loop + yedek + poster) | 3 |
| Video (ekran içi döngü + yedek) | 2 |
| Ses dosyası (TR 11 + EN 11) | 22 |
| VTT altyazı (TR 11 + EN 11) | 22 |
| **Toplam dosya** | **49** |

### 9.7 Character sheet (video öncesi zorunlu ara teslim)

Brief 11.7'nin yapım notu: *"karakter tek bir AI görselinden değil, sabit
bir karakter sayfası üzerinden üretilecek — aynı kostüm, aynı ekran, aynı
ışık. Aksi hâlde her replikte başka bir MONA çıkar."*

Character sheet **loop üretiminden önce** onaylanmalı ve şunları
içermeli: ön/yan/arka görünüş · kafa yakın çekimi (ekran detayı) · kostüm
doku yakın çekimi (pul) · ışık şeması · renk kodları (bej / lila / baby
pink / mint) · ölçek referansı.

---

## 10. Uygulama sırası

1. Character sheet üretimi ve onayı (§9.7) — **her şeyin önkoşulu**
2. Seslendirme kararı (§8 #1) — paralel yürüyebilir, süresi en uzun
3. Placeholder iyileştirmeleri (§7.1–7.4) — varlık beklemez, **bugün yapılabilir**
4. Karakter loop + ekran döngüsü üretimi
5. TR/EN ses kaydı + VTT üretimi
6. `src/data/mona.ts` içindeki `audioSrc` / `captionsSrc` alanlarının doldurulması
7. Kafa bloğundaki CSS silüetin video ile değiştirilmesi
8. Erişilebilirlik regresyon testi: otomatik ses yok · ses kapalıyken metin tam · `prefers-reduced-motion` · klavye
