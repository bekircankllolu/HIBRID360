# Sonraki UI Sanat Yönü Görevleri

**Tarih:** 2026-08-27 · **Branch:** `claude/phase-0-setup-amip8r` (`3c54959`)
**Kapsam:** Yalnızca rapor / sanat yönü. **`src/` koduna dokunulmadı.**
**Kaynaklar:** `docs/brief-rev12.md` (4.5, 8, 9) · `docs/DECISIONS.md` ·
`docs/visual-audit/NEW_SITE_IMAGE_PLACEMENT_PLAN.md` ·
`docs/visual-audit/FINAL_ASSET_SHORTLIST.md` · `docs/mona/MONA_ART_DIRECTION.md`

**Yöntem:** Üretim build'i + `next start`, Playwright/Chromium ile
1440×900 @2x ve 390×844 @3x ekran görüntüleri. Renk/parlaklık değerleri
PIL ile piksel örneklemesinden okundu, DOM ölçüleri `getBoundingClientRect`
ile alındı — göz kararı değil.

> **Ortam notu:** Bu branch'in `package.json`'ı Next 14.2.35 diyor ama
> `node_modules` Next 15.5.24 taşıyor (önceki oturumun kalıntısı).
> Bulguların tamamı CSS, bileşen markup'ı ve disk üzerindeki görsel
> dosyalarına dayandığı için bu farktan etkilenmiyor. Build sırasında
> Next'in `tsconfig.json`'ı yeniden biçimlendirmesi geri alındı.

---

## 0. Bir sayfada özet

| Soru | Kısa cevap |
|---|---|
| Kristal neden grafik duruyor? | Merkez taş **flat-shaded low-poly vektör illüstrasyonu** — spekülar yok, saydamlık yok, parlaklık aralığı 255'te sadece 79. Yörüngedeki 8 öğe **taş değil, CSS ışıklı nokta**. Halkalar 1px hairline. Yıldız alanı tekrarlayan CSS deseni. Sonuç: sahne bir **infografik** gibi okuyor |
| Marka rengi doğru mu? | **Hayır.** Sarı taşın baskın faseti `rgb(231,210,17)` (zeytin sarısı, marka `#FFFC00` değil); fuşya taş `rgb(202,50,133)` (gül pembesi, marka `#FF00FF` değil) |
| Sistem korunmalı mı? | **Evet, tamamen.** Etkileşim mimarisi (8 nokta → gerçek rota, klavye, `prefers-reduced-motion`, kompakt kart) doğru kurulmuş. Sorun **render kalitesinde**, mimaride değil |
| En büyük tek kazanç | Merkez taşın PBR render ile yeniden üretilmesi + yörüngedeki noktaların taşa dönüşmesi |

---

## 1. Kristal sahnesi neden grafik duruyor — ölçümlü teşhis

Sahne: `src/components/hero/SolarSystem.tsx` + `src/data/solar-system.ts`
+ `SolarSystem.module.css`. Ana sayfada `<SolarSystem />` olarak render
ediliyor.

### 1.1 Merkez taş bir render değil, düz boyalı vektör

`public/images/stones/stone-yellow@2x.webp` (638×294) piksel analizi:

| Ölçüm | Değer | Anlamı |
|---|---|---|
| Baskın 6 faset rengi | 240.777 opak pikselin **~%75'ini** kaplıyor | Her faset **tek düz renk** — faset içinde gradyan yok |
| Parlaklık aralığı (p5–p95) | **160 → 239** (255 üzerinden 79) | Ne koyu gölge var ne parlak spekülar. Değer aralığı çok dar |
| En koyu piksel | 152 | Gerçek bir gölge yok |
| En açık piksel | 250 | Spekülar hot-spot yok |

Fuşya taş aynı sorunu daha koyu tarafta yaşıyor: p5–p95 **53 → 128**.

**Eksik olan altı fiziksel ipucu:**

1. **Spekülar highlight** — hiçbir fasette parlama yok
2. **Saydamlık / kırılma** — kristal ışık geçirmiyor, tamamen opak
3. **Fresnel kenar parlaması** — kenarlarda açıya bağlı parlaklık artışı yok
4. **Ortam yansıması** — fasetler hiçbir şeyi yansıtmıyor
5. **Faset içi gradyan** — her yüzey tek renk, eğrilik okunmuyor
6. **Yumuşak kenar geçişi** — faset sınırları sert vektör çizgisi

Bu altı ipucu olmadan beyin nesneyi "cisim" değil "ikon" olarak okuyor.
Sahnenin "grafik durmasının" **birincil sebebi budur.**

### 1.2 Yörüngedeki 8 öğe taş değil, nokta

Brief 4.5 açıkça şunu istiyor:

> *"Taşlar güneş sistemi gibi dizilecek: merkezde HİBRİD (güneş),
> yörüngesinde dönen **taşlar**. Her taş bir iş alanını temsil edecek."*

Kodda ise (`SolarSystem.module.css` `.dotCore`) her nokta **1rem çapında
bir CSS radial-gradient dairesi** — parlayan bir UI işaretçisi. Taş
görseli değil.

Sonuç: sahne "yörüngede dönen kristaller" değil, **"bir diyagram üzerinde
duran hotspot'lar"** gibi okunuyor. Bu, grafik hissinin ikinci sebebi.

### 1.3 Ölü varlıklar — üretilmiş ama kullanılmıyor

`public/images/stones/` dört dosya taşıyor; **kodda yalnızca biri
referanslanıyor** (`grep` ile doğrulandı):

| Dosya | Boyut | Kullanım |
|---|---|---|
| `stone-yellow.webp` | 12.9 kB | ✅ Merkez taş (tek kullanım) |
| `stone-fuchsia.webp` | 10.4 kB | ❌ **Hiç kullanılmıyor** |
| `stone-yellow@2x.webp` | 26.8 kB | ❌ **Hiç kullanılmıyor** |
| `stone-fuchsia@2x.webp` | 21.5 kB | ❌ **Hiç kullanılmıyor** |

84 kB'lık klasörün **59 kB'ı ölü**. Fuşya taş varyantı üretilmiş ama
sahnede hiç görünmüyor — fuşya yalnızca CSS nokta rengi olarak var.

### 1.4 Retina'da merkez taş büyütülüyor

`.crystal` CSS genişliği `clamp(8.5rem, 17vw, 13.5rem)` → en fazla
**216 px**. 2× ekranda **432 fiziksel piksel** gerekiyor.
Kaynak `stone-yellow.webp` yalnızca **319 px** geniş.

→ Retina'da merkez taş **~1.35× büyütülerek** çiziliyor. `@2x` dosya
repoda duruyor ama kodda referanslanmıyor (§1.3).

### 1.5 Marka rengi kayması — hero wordmark ile aynı sınıf hata

| Öğe | Ölçülen baskın renk | Marka değeri | Fark |
|---|---|---|---|
| Sarı taş | `rgb(231, 210, 17)` | `#FFFC00` = `rgb(255,252,0)` | Zeytin/hardal kaymış |
| Fuşya taş | `rgb(202, 50, 133)` | `#FF00FF` = `rgb(255,0,255)` | Gül pembesine kaymış |

Bu, `VISUAL_QA_2026-08-26.md` §1'deki hero wordmark bulgusuyla **aynı
sınıf sorun**: marka renkleri görsel varlıklarda token'lardan geçmeden
yeniden üretilmiş ve kaymış. CLAUDE.md: *"Marka renklerinin dışında
hardcoded hex kullanılmaz."*

### 1.6 Sahne katmanlarının diğer "grafik" işaretleri

| Katman | Bugün | Neden grafik duruyor |
|---|---|---|
| Yörünge halkaları | `stroke: rgba(255,255,255,0.11)`, `1px`, `vectorEffect="non-scaling-stroke"` | Dört halka da **aynı kalınlıkta**. Gerçek perspektifte uzaktaki halka incelir/soluklaşır. Eşit kalınlık = teknik çizim |
| Yıldız alanı | `background-size: 13rem 9rem` tekrarlı `radial-gradient` | Tekrar aralığı gözle seçiliyor — düzenli ızgara. Gerçek yıldız alanı düzensizdir |
| Nebula | Tek merkezli `radial-gradient` yığını | Homojen, hacim yok. Gerçek nebula düzensiz yoğunluklu |
| "HIBRID" etiketi | Düz sarı dikdörtgen + siyah metin, taşın altında | **3B yanılsamayı kıran tek öğe.** Bir UI rozeti gibi duruyor, üstelik yörünge halkalarını kesiyor |
| Zemin/temas gölgesi | Yok — yalnızca `drop-shadow` | Taş bir düzlem üzerinde durmuyor, boşlukta asılı |
| Ölçek | Taş içteki 3 halkayı birden örtüyor | Geometri okunmuyor: hangi nokta hangi yörüngede belli olmuyor |

### 1.7 Etkileşim gözlemi

- **Hareketli 16 px noktayı hover'lamak zor.** Tıklama alanı 44×44 px
  (erişilebilirlik sınırında doğru) ama **görünen** hedef 16 px ve
  sürekli hareket ediyor. İlk denemede hover'ı ıskaladım; kartı ancak
  `prefers-reduced-motion` ile (noktalar sabitken) açabildim.
- **Kart taşın üstüne biniyor.** `backdrop-filter: blur(10px)` kristalin
  üzerinde bulanık bir leke yaratıyor.
- Kart içeriği doğru: kicker + başlık + gerçek `whatWeDo.list` açıklaması
  + "Detaya git →". Uydurma metin yok. **Bu kısım korunmalı.**

---

## 2. Nasıl gerçekçi / premium / sinematik olur — görsel sistem

### 2.1 Temel karar: WebGL'e geçilmeli mi? — HAYIR

Mevcut mimari (statik görsel + CSS/rAF) **doğru tercih** ve korunmalı:

- CLAUDE.md: *"aynı anda en fazla BİR WebGL sahnesi"* — o kota ana sayfa
  hero wordmark'ına ait.
- Sahne zaten `prefers-reduced-motion`, klavye ve SSR uyumlu.
- Gerçekçilik **runtime render'dan değil, önceden render edilmiş
  varlıktan** gelecek. Blender/C4D'de 10 dakikada pişen bir PBR kare,
  tarayıcıda gerçek zamanlı erişilemeyecek kalitede olur.

**Yaklaşım: "önceden pişmiş sinematik" (pre-rendered cinematic).**
Kalite offline render'dan, hareket CSS'ten gelir.

### 2.2 Kristal materyali

| Özellik | Hedef | Neden |
|---|---|---|
| Materyal tipi | **Kaba kesimli kuvars / topaz** — cam değil | Cam çok "temiz" durur; mineral kaba yüzeyiyle premium ve organik |
| Transmission | 0.55–0.7 | Işık geçirir ama arkası okunmaz — hem cisim hem ışık kaynağı |
| IOR | 1.54 (kuvars) | Gerçek mineral değeri; 1.5 altı plastikleşir |
| Roughness | Fasetlerde 0.08–0.18, **düzensiz** | Tek roughness = yapay. Faset başına küçük varyans gerçekçiliği taşır |
| İç yapı | Hafif iç saçılım + 2-3 iç çatlak/inclusion | Kusursuz kristal CGI durur; kusur gerçeklik verir |
| Faset sayısı | Mevcut ~20 → **35–50** | Az faset = low-poly ikon. Çok faset (>80) = disko topu |
| Renk | **`#FFFC00` transmission tint** | Marka sarısı materyalin içinden gelmeli, üstüne boyanmamalı |
| Kenar | Fasetlerde 0.5–1 px'lik bevel | Sert vektör kenarı yerine ışık yakalayan pah |

### 2.3 Işık

Üç noktalı kurulum, marka paletinden:

| Işık | Renk | Konum | Görev |
|---|---|---|---|
| **Key** | Nötr beyaz, güçlü | Sol üst, 35° | Ana form, spekülar hot-spot. §1.1'de eksik olan #1'i çözer |
| **Rim / kenar** | `#FF00FF` fuşya | Sağ arka | Taşı siyah zeminden ayırır **ve markanın ikinci rengini sahneye sokar** — bugün fuşya sahnede sadece nokta olarak var |
| **Fill** | `#FFFC00` çok düşük yoğunluk | Alt ön | Gölgeleri tamamen siyah bırakmaz |

**Kritik:** parlaklık aralığı p5–p95 en az **40 → 250** olmalı (bugün
160→239). Bu tek metrik "grafik mi, render mı" sorusunu belirliyor ve
teslimde ölçülerek doğrulanmalı.

### 2.4 Gölge

| Katman | Nasıl |
|---|---|
| **Temas gölgesi** | Taşın hemen altında, dar ve koyu eliptik leke. Nesneyi düzleme oturtan tek şey |
| **Yumuşak gövde gölgesi** | Geniş, düşük opaklık, key ışığın tersine kaçan |
| **Caustic (ışık halkası)** | Kristalden geçen ışığın altta bıraktığı sarı halka. **Saydamlığın tek görünür kanıtı** — bu olmadan taş opak okunur |
| Bugünkü `drop-shadow` yığını | Kaldırılmalı — render'ın kendi gölgesi kullanılmalı |

### 2.5 Partikül / nokta sistemi

Bugünkü CSS yıldız deseninin yerine:

| Katman | Öneri |
|---|---|
| **Toz** | Kristalin çevresinde 30–50 çok küçük parçacık; render'a gömülü olabilir. Işıkta parlar, hacim hissi verir |
| **Yıldız alanı** | Tekrarlayan `background-size` yerine **tek seferlik düzensiz SVG/WebP nokta katmanı**. Tekrar aralığı görünmemeli |
| **Derinlik** | 2–3 parallax katmanı, scroll'a bağlı ±%2–4 kayma. Yakın katman hızlı, uzak yavaş |
| **Renk** | Beyaz ağırlıklı; fuşya/sarı noktalar toplamda %10'u geçmesin — fazlası "parti afişi" |

### 2.6 Yörünge çizgileri

| Bugün | Öneri |
|---|---|
| 4 halka, hepsi `1px` beyaz %11 | Halka **uzaklaştıkça incelsin ve solsun**: iç 1.2 px %16 → dış 0.6 px %7 |
| `vectorEffect="non-scaling-stroke"` | **Kaldırılmalı** — perspektif farkını bu bastırıyor |
| Tek düz çizgi | Halkanın **arka yarısı** ön yarısından daha soluk olsun (taşın arkasından geçen kısım) |
| Sheen gradyanı sabit | Sheen çok yavaş dönsün (60–90 sn tur) — "aydınlanmış" hissi güçlenir |

### 2.7 Yörüngedeki öğeler: nokta → taş

**Brief'in istediği bu (4.5) ve grafik hissini kıran ikinci en büyük
hamle.**

| Konu | Öneri |
|---|---|
| Görsel | Merkez taşın **küçük varyantı** — aynı materyal, aynı ışık, 2 renk (sarı/fuşya). Zaten üretilmiş `stone-fuchsia` burada hayat bulur |
| Boyut | Görünen çap 16 px → **28–34 px**. Tıklama alanı 44 px korunur |
| Dönüş | Her taş kendi ekseninde çok yavaş dönsün (20–30 sn) — 4-6 karelik döngü yeter, video değil |
| Derinlik | Mevcut `--depth-scale` / `--depth-fade` mantığı **korunmalı**, doğru kurulmuş |
| Etiket | Masaüstünde taşın yanında **her zaman görünen** küçük etiket (bkz. §2.8) |

### 2.8 Hover / tap detay kartı

Mevcut kart yapısı doğru; dört düzeltme:

1. **Kart taşın üstüne binmesin.** Sahne kutusuna `padding` eklenip kart
   dış boşlukta açılsın, ya da `data-side` mantığı taşın bounding box'ını
   da hesaba katsın.
2. **Etiket her zaman görünsün.** Bugün servis adı yalnızca kart açıkken
   okunuyor; sahnede 8 anonim nokta duruyor. Küçük, sabit, %60 opak
   etiket + hover'da %100.
3. **Hareket hedefleme sorunu.** İmleç sahneye girdiğinde sistem
   **yavaşlasın** (durmasın) — hareketli hedefi yakalamak kolaylaşır.
   Kart açıkken tam dursun (bugünkü davranış doğru).
4. **`backdrop-filter` kaldırılsın**, yerine düz `rgba(0,0,0,0.92)`.
   Blur kristalin üstünde leke yapıyor ve mobilde pahalı.

### 2.9 Mobil davranış

Ölçüldü: 390 px'de sahne kutusu **390×617**, 8 nokta merkezdeki taşın
etrafında sıkışıyor, hiçbirinde etiket yok, bazıları "HIBRID" rozetinin
üstüne biniyor.

| Konu | Öneri |
|---|---|
| Yörünge sayısı | 4 → **2 halka** (her halkada 4 taş). Kalabalık yarıya iner |
| Taş boyutu | Görünen çap 26–30 px, tıklama alanı 44 px |
| Etiket | Sahne altında **statik bir liste** dursun (8 servis adı) — kaydırılabilir sahne + okunabilir liste birlikte |
| Kart | Nokta yanında değil, **sahnenin altında sabit bir şeritte** açılsın. Dar ekranda yan açılan kart taşıyor |
| "HIBRID" rozeti | Taşın altına değil, **taşın içine/üstüne** yerleşmeli ya da mobilde gizlenmeli |
| Boş alan | Sahne 617 px ama içerik ~380 px'lik bir alanda. Kutu yüksekliği kısılmalı |
| Hareket | Mobilde otomatik dönüş **daha yavaş** olsun (pil + okunabilirlik) |

### 2.10 Performans sınırı — pazarlık yok

CLAUDE.md sözleşme maddesi: LCP (mobil) < 2.5 sn, ilk yükleme < 2 MB.

| Kalem | Sınır |
|---|---|
| Merkez taş görseli | **≤ 60 kB** (WebP/AVIF). 1× ve 2× varyant, `srcset` ile |
| Yörünge taşı (küçük varyant) | **≤ 12 kB** her renk için, toplam ≤ 24 kB |
| Yıldız/toz katmanı | **≤ 25 kB** tek dosya |
| Sahnenin toplam görsel bütçesi | **≤ 130 kB** (bugün 13 kB — artış kabul edilebilir, çünkü ölü 59 kB da temizlenecek) |
| Render tekniği | **WebGL YOK.** Tek `requestAnimationFrame` döngüsü + CSS transform korunur |
| Animasyon | Yalnızca `transform` ve `opacity`. `filter`/`backdrop-filter` animasyonu yasak |
| Bölüm görünürlüğü | Ekrandan çıkınca döngü durur (bugün doğru, korunmalı) |
| `prefers-reduced-motion` | Döngü hiç kurulmaz (bugün doğru, korunmalı) |
| Video | **Kullanılmamalı.** Döngü videosu bütçeyi ve pil ömrünü yer; statik render + CSS yeterli |

---

## 3. What We Do kartları — hangisi doğru, hangisi stok

1440 px'de 4×2 ızgara + AI kartı. Ölçüm: `d-wwd-full.png`.

| Kart | Durum | Değerlendirme |
|---|---|---|
| **Production** | ✅ Doğru | Pembe/kırmızı ışıklı set, çoklu kamera. Otantik, marka fuşyasına yakın renk sıcaklığı. Izgaranın en güçlü karesi |
| **Event Management** | ✅ Doğru | S/B sahne ışık huzmeleri. Marka siyah-beyazına birebir |
| **Live Broadcast** | ✅ Doğru görünüyor | Lens + "ON AIR". Güçlü — **ama** `ASSET_SELECTION_REPORT.md` kaynağının `shutterstock_77786614.jpg` olduğunu tespit etti; lisans teyidi gerekiyor |
| **Cloud TV** | 🟡 Kabul edilebilir | Çoklu monitörlü kontrol odası. Doğru ama jenerik |
| **Post Production** | 🟡 Kabul edilebilir | Kurgu süiti. Ekranlarda üçüncü taraf içerik var, doğrulanmalı |
| **Photography** | 🟠 Dar okunuyor | S/B portre kurulumu — "fotoğrafçılık"ı yalnızca portre olarak anlatıyor. Ürün/yemek boyutu kayıp |
| **Digital** | 🔴 **Stok render** | 3D emoji eller, kalpler, gökkuşağı, mor/pembe gradyan. Izgaradaki en zayıf kare. "Premium prodüksiyon stüdyosu" tonuyla doğrudan çelişiyor |
| **Creative** | 🔴 **Stok** | Ampul/"design thinking" neon. Mor-turuncu, marka paletiyle ilgisiz, içinde çevrilemeyen İngilizce el yazısı. Kaynak: `shutterstock_1636265755` |
| **AI Creative Production** | 🔴 **Görsel yok** | Geniş 9. kart, içi boş koyu gradyan. Diğer 8 kartın yanında bariz eksik duruyor |

**Sonuç:** 3 güçlü, 2 kabul edilebilir, 4 sorunlu. İzgarada göz en zayıf
kareye takılır — Creative + Digital + AI birlikte ızgaranın tamamının
algısını aşağı çekiyor.

**Çözüm yolu (öncelik sırasıyla):**
1. **Photography** → `HİBRİD WEB SAYFASI GÖRSEL 2/3.png` (boş beyaz
   cyclorama, siyah ekipman silüetleri). Arşivde hazır, riski yok
2. **Digital** → arşivde doğrudan aday yok. Köprü çözüm:
   `SHOOTİNG -PRODUCTION/14.png` (eller + kamera, yemek çekimi) emoji
   render'ından her hâlükârda iyi
3. **Creative** → arşivde çözüm yok, üretim işi
   (`CREATIVE_PAGE_DIRECTION.md`)
4. **AI** → MONA character sheet üretilince oradan bir kare
   (`MONA_ART_DIRECTION.md` §9.7)

---

## 4. Friends sayfası — brief'e göre doğru mu?

### 4.1 Bugünkü durum (ölçüldü)

- Başlık "DOSTLARIMIZ" + FRD-01 body copy ✅ (deck metniyle uyumlu)
- **70 adet kenarlıklı metin kutusu**, 7 sütunlu ızgara
- Logo **yok** — sadece marka adları
- `verified: false` beş isim (Sirmasion · Meribell Cafe · Bonakare ·
  Kerschkaret · Pleaon Sportivo) **kesikli sarı kenarlık + %75 opaklık**
  ile işaretli ✅ (kodda doğru uygulanmış)
- `newClients` grubu `SHOW_NEW_CLIENTS=false` ile gizli ✅
- "Ne diyorlar" → dürüst boş durum: "Müşteri sözleri hazırlanıyor."
- Kapanış: "Birlikte ne ürettiğimizi görmek ister misiniz? → WORK"

### 4.2 Brief'e uygunluk

Brief 8.1 net bir **[KARAR]** bırakmış:

> *"REFERANS — müşteri logolarının küre/top üzerinde sunumu. Mevcut düz
> **logo** ızgarası da korunabilir; ikisinden biri seçilecek. [KARAR]"*

**Brief'in iki seçeneği de logo tabanlı.** Bugün ekranda olan üçüncü bir
şey: **metin ızgarası** — yani eski sitenin çözümü. Yani sayfa brief'in
verdiği iki seçenekten hiçbirini uygulamıyor.

Bu bir kod hatası değil: `docs/content/CURRENT_CONTENT_GAPS.md` madde 6'da
belgelendiği gibi **hiç logo teslim edilmedi** — ne repoda, ne 119
dosyalık arşivde. Metin ızgarası, logo yokluğunda alınmış doğru karar.

### 4.3 Logo gerekir mi? — Evet, ama koşullu

| | Logo ızgarası | Metin ızgarası (bugünkü) |
|---|---|---|
| Görsel güç | Yüksek — marka tanınırlığı anında | Düşük — 70 eşit ağırlıklı kutu, tablo gibi okunuyor |
| Hiyerarşi | Doğal (logo boyutu/rengi ayrışır) | **Yok** — Koç Holding ile küçük bir kafe aynı ağırlıkta |
| Hukuki yük | **Yüksek** — her logo için ayrı kullanım izni | Düşük — isim anmak farklı, logo kullanmak farklı |
| Bakım | Logo dosyası + güncelleme | Sadece metin |
| Bugün mümkün mü | ❌ Hiç logo yok | ✅ Çalışıyor |

**Öneri:** Metin ızgarası **kalsın**, ama tek başına bırakılmasın.
Bugünkü sorun logo eksikliği değil, **hiyerarşi eksikliği**.

### 4.4 Somut iyileştirme — logo beklemeden

1. **Kademeli ağırlık.** 70 marka üç kademeye ayrılsın: amiral markalar
   (Koç, Arçelik, Beko, Ciner…) büyük punto ve tam opaklık; orta kademe
   normal; uzun kuyruk daha küçük. Izgaranın "tablo" hissi böyle kırılır.
2. **Sektör grupları.** "Holding · Beyaz Eşya · Finans · Turizm ·
   Gastronomi" gibi başlıklarla bölünsün — 70 kutuluk tek blok yerine
   okunabilir kümeler. Bu bilgi zaten `src/data/clients.ts`'te örtük var.
3. **Sayı kanıtı.** Başlığın altında tek satır: "70+ marka" gibi. Rakam,
   listenin kendisinden daha hızlı okunuyor.
4. **Küre/top sunumu (brief 8.1 A seçeneği) ertelensin.** Logo gelmeden
   üretilemez, ayrıca CLAUDE.md'nin tek-WebGL-sahnesi kuralıyla
   çakışabilir. Logo geldiğinde ayrı karar olarak açılmalı.

### 4.5 Müşteri sözü alanı nasıl konumlanmalı

Bugün "Ne diyorlar" bölümü ızgaranın **altında**, boş durum kutusuyla.

**Öneri: söz alanı yukarı taşınsın.** Sıralama şu olmalı:

```
Başlık + body copy
   ↓
1–3 müşteri sözü   ← isim ızgarasından ÖNCE
   ↓
Müşteri ızgarası (kademeli, gruplu)
   ↓
WORK'e köprü + CTA
```

Gerekçe: Bir isim listesi *iddiadır*; bir müşteri sözü *kanıttır*.
Kanıt iddiadan önce gelmeli. Brief 18.7'nin formatı zaten hazır
(tek cümle ≤ 20 kelime + Ad Soyad · Unvan · Marka) ve kod
`written_consent_confirmed` olmayan hiçbir sözü render etmiyor —
bu koruma doğru, korunmalı.

**Söz gelene kadar:** bugünkü boş durum ("Müşteri sözleri hazırlanıyor.")
dürüst ve doğru. Yukarı taşınırsa sayfanın başında boş kutu görünür —
o yüzden **taşıma, ilk söz geldiğinde yapılmalı**, önce değil.

---

## 5. Gerçek fotoğraf adayları — öncelik sırası

Kaynak: `docs/visual-audit/FINAL_ASSET_SHORTLIST.md` (15 aday, tamamı tek
tek incelendi). Aşağıda **bu turdaki UI ihtiyacına göre sıralanmış** hâli.

> **Sahte müşteri/vaka üretilmiyor.** Aşağıdaki hiçbir görsel bir marka
> veya iş adıyla eşleştirilmiyor; hepsi **jenerik yetenek görseli** olarak
> öneriliyor. Bir görselin "şu müşterinin işi" olarak sunulması yalnızca
> `docs/work/WORK_INVENTORY_REQUEST.md` doldurulduktan sonra mümkün.

| # | Dosya | Nereye | Neden bu sırada | Risk |
|---|---|---|---|---|
| 1 | `HİBRİD WEB SAYFASI GÖRSEL 2/3.png` | `/what-we-do/photography` | Photography kartındaki dar okumayı çözüyor. Boş beyaz cyclorama, siyah silüetler — marka S/B'sine birebir. İnsan yok | ✅ Risk yok |
| 2 | `EVENT MANAGEMENT/event2.jpg` (5000 px) | `/what-we-do/event-management` | Mevcut karenin aynı çekimden çok daha yüksek çözünürlüklü hâli. Arşivin en güçlü tek görseli | 🟡 Kadrajda EXIT tabelası — tam çözünürlükte kontrol |
| 3 | `LIVE BROAD CAST/11.png` | `/what-we-do/live-broadcast` | Mor/mavi switcher paneli marka fuşyasına en yakın renk sıcaklığı. Stok yerine otantik ekipman | ✅ Risk yok |
| 4 | `SHOOTİNG -PRODUCTION/14.png` | `/what-we-do/digital` (köprü) | Digital'deki emoji render'ının yerine geçebilecek en iyi arşiv karesi. Sadece eller görünüyor | ✅ Risk yok |
| 5 | `HİBRİD WEB SAYFASI GÖRSEL 2/12.png` | `/what-we-do/production` | Işık rigi, insansız, neredeyse tamamen siyah — metin bindirmeye ideal | ✅ Risk yok |
| 6 | `HİBRİD WEB SAYFASI GÖRSEL 2/10.png` | Ana sayfa ikincil bant | Pembe/kırmızı bokeh, marka fuşyasına yakın. (`SHOOTİNG -PRODUCTION/10.png` ile **MD5 aynı** — tek dosya) | 🟡 Kaynak bilinmiyor |
| 7 | `POST PRODUCTION/Resolve_Crop_Master-1.jpg` | `/what-we-do/post-production` bant | Zaten 2.42:1, kırpmasız kullanılabilir. Marka siyahına oturuyor | 🟠 Lisans doğrulanmalı |
| 8 | `HİBRİD WEB SAYFASI GÖRSEL 2/21.png` | Metin bindirmeli herhangi bir bant | Sağ 2/3 tamamen negatif alan — arşivin en iyi "başlık koyulabilir" karesi | ✅ Düşük |
| 9 | `HİBRİD WEB SAYFASI GÖRSEL 2/15.png` | `/what-we-do/photography` galeri | Ürün çekimi (gitar) — Photography'nin ikinci boyutu | 🟡 Sağ alt kolu kırp |
| 10 | `HİBRİD WEB SAYFASI GÖRSEL 2/18.png` | `/culture/who-we-are` | Arşivin en otantik ekip karesi, yüzler ters ışıkta | 🟡 Ekip rızası önerilir |
| 11 | `HİBRİD WEB SAYFASI GÖRSEL 2/42.png` | Event ölçek/kanıt bandı | Arena kurulumu — "büyük etkinlik yapabiliriz" kanıtı. (`SP/42.png` ile MD5 aynı) | ✅ Risk yok |
| 12 | `PRODUCTION/deal-hero-image.jpg` | `/culture/who-we-are` | Arşivin en "insan" karesi | 🔴 Kişi tanınabilir — **yazılı rıza şart** |

**Öneri:** 1–5 arası maddeler müşteri girdisi beklemiyor, bugün
uygulanabilir. 6–12 arası lisans/rıza teyidine bağlı.

---

## 6. Blocker'lar — eksik müşteri girdileri

Bu bölüm mevcut kayıtlardan **derlemedir**, yeni iddia içermez.

| # | Blocker | Neyi bloke ediyor | Kaynak kayıt |
|---|---|---|---|
| 1 | **Kristal sistemi kararı:** 2 renk varyantı mı kalacak, yoksa 8 servise ayrı taş mı üretilecek? | §2.7 yörünge taşları — hangi varyant seti üretileceği | `BLOCKERS.md` #6 |
| 2 | **Work içerik envanteri** (iş adı · müşteri · yıl · format · yayın izni · dosya konumu · vaka sayfası) | `/work` sayfası · Creative galerisi · MONA ekran döngüsü | `DECISIONS.md` #16 · `WORK_INVENTORY_REQUEST.md` |
| 3 | **Müşteri logoları** + logo kullanım izinleri | Friends logo ızgarası (brief 8.1 [KARAR]) | `CURRENT_CONTENT_GAPS.md` #6 |
| 4 | **`newClients` sözleşme izni** (Grundig, Whirlpool, Hotpoint, Ariston, Hitachi, WAT…) | Bu grup `SHOW_NEW_CLIENTS=false` ile gizli duruyor | `CURRENT_CONTENT_GAPS.md` #7 |
| 5 | **5 marka adı doğrulaması** (Sirmasion · Meribell Cafe · Bonakare · Kerschkaret · Pleaon Sportivo) | Bugün kesikli kenarlıkla yayında — teyit gelene kadar riskli | `CURRENT_CONTENT_GAPS.md` #5 |
| 6 | **Müşteri sözleri** + yazılı yayın onayı | Friends "Ne diyorlar" bölümü (§4.5) | `CURRENT_CONTENT_GAPS.md` #11 |
| 7 | **Creative referans dosyası** (pullu/parıltılı doku, disko topu kafalı figür) | Creative sayfası hero + MONA kostümü | `CREATIVE_PAGE_DIRECTION.md` §3.2 |
| 8 | **MONA character sheet** + seslendirme kararı | AI Creative Production kartı görseli + MONA prodüksiyonu | `MONA_ART_DIRECTION.md` §8 · `DECISIONS.md` #8 |
| 9 | **Directors & Crew kadrosu** + ekip fotoğraf çekimi | Culture alt sayfası | `DECISIONS.md` #14 |
| 10 | **Lisans teyidi:** tüm `shutterstock_*` dosyaları + `Resolve_Crop_Master-1.jpg` + `PRODUCTION/deal-hero-image.jpg` rızası | §5'teki 7. ve 12. adaylar, Live Broadcast mevcut kartı | `FINAL_ASSET_SHORTLIST.md` §2 |

---

## 7. Öncelik sırası

| Sıra | İş | Etki | Müşteri girdisi | Nerede |
|---|---|---|---|---|
| **1** | Merkez kristalin PBR render ile yeniden üretimi (§2.2–2.4) | 🔴 En yüksek — sahnenin "grafik" hissini tek başına çözer | Hayır (üretim işi) | Tasarım/3D |
| **2** | Marka rengi düzeltmesi: taş `#FFFC00`, fuşya varyant `#FF00FF` (§1.5) | 🔴 Marka kuralı ihlali | Hayır | Tasarım/3D |
| **3** | Yörüngedeki noktaların taşa dönüşmesi (§2.7) | 🟠 Brief 4.5'in asıl isteği | Blocker #1 (varyant kararı) | Tasarım + Codex |
| **4** | Retina varyantı + ölü varlık temizliği (§1.3, §1.4) | 🟠 Kalite + 59 kB ölü ağırlık | Hayır | Codex |
| **5** | Halka perspektifi, yıldız alanı, "HIBRID" rozeti (§1.6, §2.5, §2.6) | 🟠 Diyagram hissini kırar | Hayır | Codex |
| **6** | Mobil sahne yeniden düzeni (§2.9) | 🟠 Mobilde 8 anonim nokta | Hayır | Codex |
| **7** | Etkileşim: sabit etiket, yavaşlama, kart binmesi (§2.8) | 🟡 Kullanılabilirlik | Hayır | Codex |
| **8** | Photography kartı görseli (§5 #1) | 🟡 Hazır aday var | Hayır | Codex |
| **9** | Digital kartı köprü görseli (§5 #4) | 🟡 En zayıf kareyi düzeltir | Hayır | Codex |
| **10** | Friends hiyerarşi + gruplama (§4.4) | 🟡 70 eşit kutu sorunu | Hayır | Codex |
| **11** | Creative sayfası zemin + doku | 🟠 Verilmiş karar uygulanmamış | Toz pembe tonu onayı | Tasarım + Codex |
| **12** | Friends müşteri sözü konumu (§4.5) | 🟡 | Blocker #6 | Codex (söz gelince) |
| **13** | AI kartı görseli | 🟡 | Blocker #8 | — |

**1–10 arası maddelerin hiçbiri müşteri girdisi beklemiyor** (3 numaralı
madde hariç: varyant kararı gerekiyor).

---

## 8. Codex'e uygulanacak teknik görev listesi

Her madde tek bir dosyaya/konuya bağlı, bağımsız uygulanabilir.

### C-01 · Retina varyantı ve ölü varlık temizliği
- `SolarSystem.tsx:249` — merkez taş `<Image>`'ına `stone-yellow@2x.webp`
  `srcSet` üzerinden bağlansın **veya** `stone-yellow.webp` 640 px'lik
  kaynakla değiştirilsin. Bugün 216 px CSS genişliği için 319 px kaynak
  var → 2× ekranda büyütülüyor.
- Kullanılmayan dosyalar kaldırılsın (yeni varlıklar gelince yeniden
  değerlendirilir): `stone-fuchsia.webp`, `stone-fuchsia@2x.webp`,
  `stone-yellow@2x.webp` — §1.3'te `grep` ile doğrulandı, hiçbiri
  referanslanmıyor.
- **Kabul:** `grep -r "stones/" src/` çıktısındaki her dosya
  `public/images/stones/` içinde var ve tersi de doğru.

### C-02 · Yörünge halkalarına perspektif
- `SolarSystem.module.css` `.ringBase` — tek `stroke-width: 1px` yerine
  halka indeksine bağlı değer (iç 1.2 px / %16 → dış 0.6 px / %7).
  Halka başına CSS custom property ile verilebilir.
- `vectorEffect="non-scaling-stroke"` **kaldırılsın** — perspektif farkını
  bu bastırıyor.
- **Kabul:** Dört halkanın `getComputedStyle` stroke değerleri farklı.

### C-03 · Yıldız alanının tekrar deseninin kırılması
- `.space::before` / `::after` içindeki tekrarlı `background-size`
  yaklaşımı yerine tek seferlik düzensiz nokta katmanı (SVG ya da ≤25 kB
  WebP).
- **Kabul:** 1440 px'de ekran görüntüsünde tekrar aralığı gözle
  seçilemiyor.

### C-04 · "HIBRID" rozetinin yeniden konumlanması
- Bugün düz sarı dikdörtgen taşın altında ve yörünge halkalarını kesiyor
  — 3B yanılsamayı kıran tek öğe.
- Ya taşın içine/üstüne alınsın, ya rozet yerine taşın altında ışıklı bir
  tipografi olsun, ya da mobilde gizlensin.
- **Kabul:** Rozet hiçbir yörünge halkasının üstünü kesmiyor.

### C-05 · Kart taşma ve blur düzeltmesi
- `.card` — `backdrop-filter: blur(10px)` kaldırılsın, düz
  `rgba(0,0,0,0.92)` kullanılsın (kristalin üstünde leke yapıyor,
  mobilde pahalı).
- `data-side` hesabı merkez taşın bounding box'ını da dikkate alsın;
  kart taşın üstüne binmesin.
- **Kabul:** Sekiz noktanın her birinde kart açıldığında kart dikdörtgeni
  ile kristal dikdörtgeni kesişmiyor.

### C-06 · Sabit servis etiketleri
- Her yörünge öğesinin yanında küçük, her zaman görünen etiket
  (`stone.label`), %60 opaklık; hover/focus/aktifte %100.
- Mobilde sahne altında statik 8 maddelik liste.
- **Kabul:** Sahne ekran görüntüsünde, hiçbir etkileşim olmadan sekiz
  servis adı da okunabiliyor.

### C-07 · İmleç sahnedeyken yavaşlama
- Sahneye `pointerenter` olduğunda açısal hız ~%40'a düşsün (durmasın);
  `pointerleave`'de eski hıza dönsün. Kart açıkken tam duruş korunur.
- **Kabul:** Hareketli bir noktayı ilk denemede hover'lamak mümkün.

### C-08 · Mobil sahne yeniden düzeni
- 390 px altında yörünge sayısı 4 → 2 (halka başına 4 öğe).
- Öğe görünen çapı ≥26 px, tıklama alanı 44 px korunur.
- Kart nokta yanında değil, sahnenin altındaki sabit şeritte açılsın.
- Sahne kutusu yüksekliği içeriğe göre kısılsın (bugün 617 px, içerik
  ~380 px).
- **Kabul:** 390 px'de hiçbir öğe "HIBRID" rozetiyle veya başka bir
  öğeyle çakışmıyor; yatay taşma 0.

### C-09 · Yeni kristal varlıklarının bağlanması
- 3D teslimi geldiğinde: merkez taş (≤60 kB) + iki renk yörünge taşı
  (≤12 kB/adet), 1× ve 2× varyantlarıyla.
- `STONE_INTRINSIC` (`src/data/solar-system.ts`) yeni gerçek piksel
  boyutlarıyla güncellensin — CLS 0 korunmalı.
- Mevcut `--depth-scale` / `--depth-fade` derinlik mantığı **korunsun**.
- **Kabul:** Lighthouse mobil CLS = 0; sahne toplam görsel ağırlığı ≤130 kB.

### C-10 · Photography kartı görseli
- `src/data/site-images.ts` → `services.photography`, §5 #1 adayının
  optimize türeviyle değiştirilsin (16:9, ≤110 kB, alt metni güncelle).

### C-11 · Digital kartı köprü görseli
- `src/data/site-images.ts` → `services.digital`, §5 #4 adayının optimize
  türeviyle değiştirilsin. 3D emoji render'ı kaldırılsın.

### C-12 · Friends ızgara hiyerarşisi
- `src/data/clients.ts` — her kayda `tier` (`flagship` / `standard`) ve
  opsiyonel `sector` alanı eklensin (veri, uydurulmadan; sektör bilgisi
  müşteriden teyit edilene kadar `undefined` kalabilir).
- `ClientLogoGrid` — `tier`'a göre punto/opaklık farkı; `sector` doluysa
  gruplu başlıklar.
- `verified: false` davranışı (kesikli sarı kenarlık) **korunsun**.
- **Kabul:** 70 kutu artık tek tip değil; amiral markalar ilk bakışta
  ayrışıyor.

### C-13 · Friends müşteri sözü konumu
- **İlk onaylı söz gelene kadar uygulanmasın.** Söz geldiğinde
  `friends/page.tsx` bölüm sırası: body copy → sözler → isim ızgarası →
  WORK köprüsü → CTA.
- `written_consent_confirmed` filtresi **korunsun**.

> **Not:** Bu listede `src/` değişikliği önerilen her madde bu raporun
> kapsamı dışındadır — burada yalnızca **tarif** edilmiştir, uygulanmamıştır.

---

## 9. Müşteriden beklenen asset / izin listesi

| # | Talep | Kimden | Neyi açar |
|---|---|---|---|
| 1 | **Kristal varyant kararı:** 2 renk mi, 8 ayrı taş mı? | Müşteri | C-09, §2.7 |
| 2 | Work içerik envanteri (`WORK_INVENTORY_REQUEST.md` formu) | Müşteri | `/work`, Creative galerisi, MONA ekran döngüsü |
| 3 | Müşteri logoları (vektörel: SVG/EPS) + **logo kullanım izinleri** | Müşteri + hukuk | Friends logo ızgarası (brief 8.1 [KARAR]) |
| 4 | `newClients` grubu için sözleşme referans izni | Hukuk | 16 markanın yayına alınması |
| 5 | 5 marka adı doğrulaması (Sirmasion · Meribell Cafe · Bonakare · Kerschkaret · Pleaon Sportivo) | Müşteri | Kesikli kenarlığın kaldırılması |
| 6 | Müşteri sözleri + **yazılı yayın onayı** (tek cümle ≤20 kelime, ad · unvan · marka) | Müşteri | C-13, Friends "Ne diyorlar" |
| 7 | Creative referans dosyası (pullu/parıltılı doku, disko topu kafalı figür) — **deck'e gömülü hâli değil, orijinal** | Müşteri | Creative hero + MONA kostümü |
| 8 | MONA character sheet onayı + seslendirme kararı | Müşteri | AI kartı görseli + MONA prodüksiyonu |
| 9 | Directors & Crew kadro listesi + ekip fotoğraf çekim tarihi | Müşteri | Culture alt sayfası |
| 10 | Lisans teyidi: tüm `shutterstock_*` + `Resolve_Crop_Master-1.jpg` | Müşteri | §5 #7, Live Broadcast mevcut kartı |
| 11 | Yazılı rıza: `PRODUCTION/deal-hero-image.jpg` içindeki kişi | Müşteri | §5 #12 |
| 12 | Sektör sınıflandırması (70 marka için) | Müşteri | C-12 gruplu ızgara |

---

## 10. Kullanılmaması gereken görseller

`FINAL_ASSET_SHORTLIST.md` §2'nin özeti — **bu liste değişmedi, teyit
edildi.**

| Dosya | Risk | Seviye |
|---|---|---|
| `maxresdefault kopya.jpg` | E.T. (1982) afiş görüntüsünün birebir kopyası — telifli film IP'si | 🔴 ÇOK YÜKSEK |
| `Ekran Resmi 2016-04-12 19.41.18.png` | "ANDREAS STAVRIDES PHOTOGRAPHY" filigranı + tanınabilir çocuk yüzü | 🔴 ÇOK YÜKSEK |
| `CAM19326 kopya.jpg` | Yukarıdakinin filigranı **kırpılarak gizlenmiş** kopyası | 🔴 ÇOK YÜKSEK |
| `_MG_0295.jpg` · `Ekran Resmi 2016-04-12 16.01.22.png` · `…19.42.34.png` | Özel/candid, tanınabilir yüzler, rıza yok | 🔴 YÜKSEK |
| `PRODUCTION/32.jpg` · `SHOOTİNG -PRODUCTION/studyo_5.jpg` · `ANA SAYFA/19.jpg` · `ANA SAYFA/20.jpg` | Aynı restoran fotoğrafının 4 kopyası — tanınabilir yüzler | 🔴 YÜKSEK |
| `POST PRODUCTION/Video-Post-Production-Services.jpg` | Dosya adı üçüncü taraf ajans sitesini işaret ediyor | 🔴 YÜKSEK |
| `Office_Site_2014_Studio_Images-012 kopya.jpg` | Başka bir stüdyonun tanıtım fotoğrafı | 🔴 YÜKSEK |
| `HİBRİD WEB SAYFASI GÖRSEL 2/34.png` | "Social Media ICons Read…" filigranı görünür | 🟠 YÜKSEK |
| Tüm `shutterstock_*` (7 adet) | Lisans kaydı yok | 🟠 Teyit olmadan hayır |
| `G2/22.png` · `24.png` · `25.png` · `32.png` · `SP/25.png` | Bariz stok / 3D render, bozuk metin | 🟠 Gereksiz |
| `POST PRODUCTION/22.png` (= `LIVE BROAD CAST/22.png`) | Stok kompozit + çift kayıt | 🟠 ORTA |
| `HİBRİD WEB SAYFASI GÖRSEL 2/38.png` | HITACHI logosu net görünüyor | 🟠 ORTA |
| `Ekran Resmi 2016-04-12 18.57.16.png` | Hibrid'in kendi ofisi olduğu doğrulanamıyor | 🟡 Doğrulanana kadar hayır |

**Onay şartlı (yasak değil, bekliyor):**
`Ekran Resmi 2016-01-26 19.44.07 kopya.png` (Renova billboard — müşteri
onayı) · `Ekran Resmi 2016-12-16 23.55.17.png` (düoton portre — kişi rızası).

**Ayrıca sitede bugün duran ve değiştirilmesi gereken:**
`public/images/site/services/creative.webp` (ampul stoku, kaynak
`shutterstock_1636265755`) · `public/images/site/services/digital.webp`
(3D emoji render).

---

## 11. Mobil / masaüstü QA kriterleri

Her madde **ölçülebilir**; "iyi görünüyor" kabul kriteri değildir.

### 11.1 Kristal sahnesi

| # | Kriter | Nasıl ölçülür | Hedef |
|---|---|---|---|
| K-1 | Kristal render, illüstrasyon değil | Taşın opak piksellerinde parlaklık p5–p95 | **≥ 40 → ≤ 250** (bugün 160→239) |
| K-2 | Marka sarısı doğru | Taşın en açık %5 pikselinin ortalaması | `#FFFC00`'a yakın (bugün `rgb(231,210,17)`) |
| K-3 | Marka fuşyası doğru | Fuşya varyantın baskın faseti | `#FF00FF`'e yakın (bugün `rgb(202,50,133)`) |
| K-4 | Sahne görsel ağırlığı | Sahnedeki tüm görsel dosyalarının toplamı | **≤ 130 kB** |
| K-5 | CLS | Lighthouse mobil | **0** |
| K-6 | Halka perspektifi | 4 halkanın `stroke-width` değerleri | Dördü de farklı |
| K-7 | Yıldız deseni tekrarı | 1440 px ekran görüntüsü | Tekrar aralığı gözle seçilemiyor |
| K-8 | Rozet çakışması | "HIBRID" rozeti bounding box'ı | Hiçbir halkayı kesmiyor |
| K-9 | Kart çakışması | 8 noktanın her birinde kart açılır | Kart × kristal kesişimi = 0 |
| K-10 | Etiket okunabilirliği | Etkileşimsiz ekran görüntüsü | 8 servis adı da okunuyor |
| K-11 | Hover hedeflenebilirliği | Hareketli noktaya ilk hover denemesi | Başarılı |
| K-12 | WebGL kotası | Sayfada `<canvas>` sayısı | Sahne WebGL kullanmıyor (hero'nunki tek kalıyor) |

### 11.2 Mobil (390×844)

| # | Kriter | Hedef |
|---|---|---|
| M-1 | Yatay taşma | `scrollWidth - clientWidth = 0` |
| M-2 | Yörünge sayısı | 2 (halka başına 4 öğe) |
| M-3 | Öğe görünen çapı | ≥ 26 px |
| M-4 | Tıklama alanı | ≥ 44×44 px |
| M-5 | Öğe çakışması | Hiçbir öğe başka bir öğeyle veya rozetle çakışmıyor |
| M-6 | Sahne boş alan oranı | İçerik sahnenin ≥ %70'ini kaplıyor (bugün ~%60) |
| M-7 | Kart konumu | Sahnenin altında sabit şeritte, taşmadan |
| M-8 | Servis adları | Sahne altındaki statik listede 8'i de görünüyor |

### 11.3 Erişilebilirlik (her iki kırılım)

| # | Kriter | Hedef |
|---|---|---|
| A-1 | `prefers-reduced-motion` | Döngü hiç kurulmuyor, öğeler t=0 dizilişinde sabit |
| A-2 | Klavye | 8 öğe Tab ile gezilebiliyor, Enter kart açıyor, Esc kapatıyor |
| A-3 | SSR | JS kapalıyken 8 gerçek `<a href>` HTML'de var |
| A-4 | Kontrast | Kart metni ve etiketler siyah zeminde AA (≥4.5:1) |
| A-5 | Fuşya/sarı zeminde metin | **Siyah** — istisnasız (CLAUDE.md) |

### 11.4 What We Do ve Friends

| # | Kriter | Hedef |
|---|---|---|
| W-1 | Kart görselleri | 9 kartın 9'unda da görsel var (bugün AI kartı boş) |
| W-2 | Stok render | Izgarada 3D emoji/ampul stoku kalmadı |
| W-3 | Görsel ağırlığı | Kart başına ≤ 110 kB (1200 px), hero ≤ 180 kB (1920 px) |
| W-4 | Lazy yükleme | İlk viewport dışındaki tüm kart görselleri `loading="lazy"` |
| F-1 | Friends hiyerarşi | 70 kutu tek tip değil; amiral markalar ayrışıyor |
| F-2 | `verified: false` | Kesikli sarı kenarlık korunuyor |
| F-3 | `newClients` | `SHOW_NEW_CLIENTS=false` olduğu sürece render edilmiyor |
| F-4 | Testimonial | `written_consent_confirmed` olmayan hiçbir söz render edilmiyor |

### 11.5 Performans bütçesi (sözleşme maddesi — her PR'da)

| Kriter | Hedef |
|---|---|
| LCP (mobil) | **< 2.5 sn** |
| İlk yükleme toplam transfer (video hariç) | **< 2 MB** |
| Aynı anda çalışan WebGL sahnesi | **≤ 1** |
| Ekrandan çıkan animasyon | Durur |
| Lighthouse mobil skoru | Her PR'da paylaşılır |

---

### İlgili dokümanlar

- `docs/brief-rev12.md` — Bölüm 4.5 (güneş sistemi), 8 (Friends), 9 (Creative)
- `docs/DECISIONS.md` — açık kararlar (#7, #8, #14, #16)
- `docs/visual-audit/NEW_SITE_IMAGE_PLACEMENT_PLAN.md` — görsel yerleşim haritası
- `docs/visual-audit/FINAL_ASSET_SHORTLIST.md` — 15 aday + kullanılmayacaklar
- `docs/visual-audit/VISUAL_QA_2026-08-26.md` — ölçümlü görsel QA (hero wordmark bulgusu)
- `docs/visual-audit/BLOCKERS.md` — görsel/telif blocker'ları
- `docs/mona/MONA_ART_DIRECTION.md` — MONA prodüksiyon paketi
- `docs/content/CURRENT_CONTENT_GAPS.md` — içerik eksikleri
- `docs/work/WORK_INVENTORY_REQUEST.md` — Work envanter formu
