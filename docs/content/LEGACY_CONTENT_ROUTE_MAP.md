# Eski site → yeni site içerik ve görsel haritası

**Kaynak:** https://hibrid360.com/ — 2026-08-29 tarihinde her sayfa tek tek
indirilip ham HTML'den çıkarıldı (özet değil, birebir metin).
**Kapsam:** 29 Ağustos 2026 müşteri revizyonunun yedi maddelik menüsü +
yedi hizmet alt sayfası.

Eski site footer'ı `© 2020` diyor; metinlerin çoğu o tarihten kalma.
Ağustos 2026 tarihli onaylı copy deck (`docs/brief-rev12.md` sonrası
gelen `Hibrid360_Yeni_Site_Tum_Metinler.pdf`) çoğu sayfa için daha yeni
metin veriyor. **Çakışma olduğunda deck kazanır**; eski site yalnızca
deck'in sessiz kaldığı yerlerde ve doğrulama kaynağı olarak kullanıldı.

Bu dokümanda yazım hataları sessizce düzeltildi (eski sitede `surrond`,
`youtful`, `CABABILITY`, `VISINORY`, `PESACADO`, `Antonie` gibi hatalar
var). **Hiçbir yerde yeni hizmet, yeni iddia veya yeni müşteri
eklenmedi.**

---

## 1. Rota haritası

| Eski URL | Yeni canonical URL | Durum |
|---|---|---|
| `/` | `/[locale]` | Var |
| `/who-we-are` | `/[locale]/who-we-are` | **Taşındı** (`/culture/who-we-are`'dan) |
| `/what-we-do` | `/[locale]/what-we-do` | Yeni hub — **eski sitede bu URL 404 veriyordu**, yalnızca açılır menü vardı |
| `/what-we-do/creative` | `/[locale]/what-we-do/creative` | Var |
| `/what-we-do/production` | `/[locale]/what-we-do/production` | Var |
| `/what-we-do/post-production` | `/[locale]/what-we-do/post-production` | Var |
| `/what-we-do/digital` | `/[locale]/what-we-do/digital` | Var |
| `/what-we-do/live-broadcast` | `/[locale]/what-we-do/live-broadcast` | Var |
| `/what-we-do/cloud-tv` | `/[locale]/what-we-do/cloud-tv` | Var |
| `/what-we-do/event-management` | `/[locale]/what-we-do/event-management` | Var |
| — | `/[locale]/what-we-do/ai-creative-production` | **Yeni** (eski sitede yok) |
| `/what-we-believe` | `/[locale]/what-we-believe` | **Taşındı** (`/culture/what-we-believe`'den) |
| `/solutions` | `/[locale]/solutions` | **Yeniden açıldı** |
| `/clients` | `/[locale]/clients` | **Yeniden adlandırıldı** (`/friends`'ten) |
| `/partners` | `/[locale]/partners` | **Taşındı** (`/culture/partners`'tan) |
| `/contact` | `/[locale]/contact` | Var |
| `http://plug-ad.co` (dış) | `/[locale]/work` | Eski sitede iş arşivi dışarı yönlendiriliyordu |

**Eski sitede olmayan, yeni sitede duran rotalar** (menüde değil):
`/work`, `/insights`, `/culture` (+ `/culture/directors`,
`/culture/sustainability`), `/brief`, yasal sayfalar.

---

## 2. Sayfa sayfa içerik envanteri

### `/who-we-are` → `/[locale]/who-we-are`

| Alan | Değer |
|---|---|
| Eski başlıklar | `Who We Are` · `We Are What We Do!` |
| Onaylı metin | Eski gövde iki paragraf; **deck daha uzun ve daha yeni bir metin veriyor** (CUL-01..06) — kodda deck metni var |
| Kimlik | `ZÜHRE DİDEM GÖDEK` / `PRESIDENT & CCO` — eski site ve deck aynı, teyitli |
| Görseller | `/assets/img/whowe.png` (2084×1554 PNG) · `/assets/img/sonwhoweare.png` (1556×932 PNG) |
| TR çeviri | Tamam (deck TR metnini veriyor) |
| Telif | Görsellerin kaynağı **doğrulanmadı** — bağlanmadı |
| Blocker | Kurucu fotoğrafı ve kültür filmi (CUL-03/04/06) teslim edilmedi |

Eski sayfadaki dört slogan (`We don't just talk the talk, we also walk the
walk` · `We are not into one night stands` · `Come over for a coffee and
see if we click` · `We believe love at first sight`) hero slider'ında
dönüyordu. Deck bunları kullanmıyor; **yeni siteye alınmadı**, kararı
müşteriye ait (bkz. CURRENT_CONTENT_GAPS).

### `/what-we-believe` → `/[locale]/what-we-believe`

| Alan | Değer |
|---|---|
| Eski başlıklar | `What we believe` · `OUR VISION` · `OUR MISSION` · `WHAT INSPIRES US` · `OUR EDICT` · `IN THE MOOD FOR LOVE - A WORK OF LOVE` |
| Onaylı metin | Deck (WWB-01..06) eski dört bloğu birebir taşıyor — kodda deck sürümü var |
| Görseller | `/assets/img/ataturk.jpg` ve `/assets/img/little_prince.png` **bağlandı** (marka sarısı duotone, WebP+AVIF) · `/assets/img/kadin.jpg` alınmadı |
| TR çeviri | Tamam |
| Telif | **AÇIK — ikisi bağlandı, hakları doğrulanmadı** (bölüm 4) |
| Blocker | Görsel telifi + alıntı atfı + müşterinin çekeceği konuşma videosu |

Eski sitedeki `IN THE MOOD FOR LOVE` bloğunun üç maddesi deck'e girmemiş;
yeni siteye de alınmadı.

### `/solutions` → `/[locale]/solutions`

| Alan | Değer |
|---|---|
| Eski başlıklar | `Solutions` + kicker `More And More` |
| Onaylı metin | **Gövde paragrafı yok** — sayfa yalnızca on beş yetenek kutucuğundan oluşuyordu |
| Yetenekler (birebir sıra) | brand consultancy · advertising · printed · packing · outdoor · website · logo · digital · tvc · event · photo shooting · live broadcast · shooting · post production · cloud tv |
| Görseller | 13 adet `*-zoom.png/jpg` kutucuk görseli + `adidas-bg.jpg` + `whatwedo.png` |
| TR çeviri | **Bu revizyonda yapıldı** — doğrudan çeviri, yeni iddia eklenmedi (`messages/*.json` → `solutions.items`) |
| Telif | Kutucuk görselleri bağlanmadı; `adidas-bg.jpg` için BLOCKERS.md madde 4 zaten uyarı taşıyor |
| Blocker | Giriş paragrafı yok — müşteriden tek paragraf istenmeli |

### `/clients` → `/[locale]/clients`

| Alan | Değer |
|---|---|
| Eski başlıklar | `clients` + kicker `"Who Believed In Us"` |
| Onaylı metin | Eski sayfada gövde metni yok; deck (FRD-01..04) gövde metnini veriyor |
| Sunum | **Yalnızca düz metin marka adları — eski sitede de logo yoktu**, kategori/sektör/filtre de yoktu |
| Görseller | Yok |
| TR çeviri | Tamam |
| Telif | — |
| Blocker | Gövde metni "onlara müşteri değil, dost diyoruz" diyor, sayfa adı artık Clients (bkz. CURRENT_CONTENT_GAPS) |

**İsim karşılaştırması (2026-08-29, otomatik):** eski site 70 isim
listeliyor, `src/data/clients.ts` 70 isim taşıyor ve **birebir örtüşüyor** —
hiçbir isim eklenmemiş, hiçbiri düşmemiş. 23 isim deck tarafından
düzeltilmiş/genişletilmiş:

| Eski site | Deck (kodda) |
|---|---|
| `ARÇELİK GLOBAL` | Arçelik Corporate |
| `ARÇELİK TÜRKİYE` | Arçelik |
| `BEKO GLOBAL` | Beko Corporate |
| `ARÇELİK – BEKO YEKİLİ SERVİS` | Arçelik – Beko Yetkili Servis (yazım) |
| `CORNELLIA GOLF RESORT` | Cornelia Golf Resort (yazım) |
| `ÖNLEM` | Önlem Çocuk Bezi |
| `PANOROMA İNŞAAT` | Panorama İnşaat (yazım) |
| `PANAVIA SUITS` | Panavia Suites (yazım) |
| `REGIE OTTOMAN` | Regie Ottoman Hotel |
| `MARES` / `TURBAN` / `PALACE` | Mares / Turban / Palace Hotel Marmaris |
| `PLACE BEACH` | Palace Beach Club (yazım) |
| `PİDİ PİDİ` | Pidi Pidi Baby Shoes |
| `MINIA İSTANBUL` | Minia Catering & Patisserie İstanbul |
| `GRAND HUBB` | Grand Hubb Greeting Cards |
| `PESACADO FISH RESTORAN` | Pescado Fish Restaurant (yazım) |
| `WELLNES CLUB` | Wellness Club Turban (yazım) |
| `ARADIA SPA` | Arcadia Spa (yazım) |
| `TYAYSD` | Türkiye Yarış Atları Yetiştiricileri ve Sahipleri Derneği |
| `MONALISA LASER &BAUTY CENTER` | Monalisa Laser & Beauty Center (yazım) |
| `MAMAMIA` | Mamamia Wedding & Ceremony |
| `BALÇOVA ROTTERY KULÜBÜ` | Balçova Rotary Kulübü (yazım) |
| `DOPPEL HERZ` | Doppelherz (yazım) |

**Deck'in `[DOĞRULA]` işaretlediği beş isim** (Sirmasion · Meribell Cafe ·
Bonakare · Kerschkaret · Pleaon Sportivo) eski sitede **birebir aynı
yazımla** duruyor. Yani şüphe "bu müşteri var mı" değil, "yazım doğru
mu" — beşi de yabancı/az bilinen marka adları ve yazımları hatalı
görünüyor. `verified: false` kalıyor ve **public listede
gösterilmiyorlar** (`src/app/[locale]/clients/page.tsx`).

### `/partners` → `/[locale]/partners`

| Alan | Değer |
|---|---|
| Eski başlıklar | `Partners` + kicker `Love Is On The Air` |
| Onaylı metin | Ogilvy alıntısı (eski sitede yazım hatalı: `surrond`, ve **atıfsız**) |
| Partner | Eski sitede tek partner: `MOTIWE` |
| Görseller | `/assets/img/about/about-screen01.jpg` (1556×1515) |
| TR çeviri | Alıntı marka dili — çevrilmiyor |
| Telif | Alıntının David Ogilvy atfı **doğrulanmadı** (deck de kesin demiyor) |
| Blocker | Studio Food Room'un görseli/logosu yok |

Deck kararı: `MOTIWE` (deck'te "Motive") partner listesinden çıktı, yerine
`STUDIO FOOD ROOM` geldi. Kodda deck sürümü var.

### `/contact` → `/[locale]/contact`

| Alan | Değer |
|---|---|
| Eski başlıklar | `get in touch and let's start something great together` · `contact` · `WELCOME TO THE "MOTION OFFICE"` · `What is Motion Office?` |
| Onaylı metin | Motion Office anlatısı ve üç takım tanımı eski site ile deck'te **aynı** — teyitli |
| Görseller | `/assets/img/contact/contact-bg.jpg` (2560×750, gri tonlama — İstanbul panoraması) · `/assets/img/contact/contact-screen01.jpg` (1273×807, gri tonlama — Motion Office) |
| TR çeviri | Tamam |
| Telif | Panorama **bağlandı** (`CONTACT_IMAGES`), telifi hâlâ doğrulanmadı — bkz. bölüm 4. `contact-screen01.jpg` istenmedi, alınmadı |
| Blocker | **Adres çelişkisi** (aşağıda). Harita sağlayıcısı kararı KAPANDI: anahtarsız Google Maps sorgu gömmesi (`src/data/contact.ts` → `mapEmbedUrl`) |

**Adres çelişkisi — teyit gerekiyor:**

| Kaynak | Adres |
|---|---|
| Eski site (© 2020) | CEMİL TOPUZLU CADDESİ ÇİFTEHAVUZLAR, 18 MART SOKAK YAPI KREDİ EVLERİ B BLOK 9/20, KADIKÖY / İSTANBUL |
| Deck (Ağu 2026) — **kodda bu var** | Feneryolu Mahallesi, Ebru Sk., Manolya Apt. No: 3A / 3B, Kadıköy — İstanbul |

İkisi de Kadıköy; muhtemelen taşınma olmuş. Telefon (`+90 532 613 50 45`)
ve e-posta (`contact@hibrid360.com`) iki kaynakta da aynı — **teyitli**.

Harita sağlayıcısı seçilmedi; seçenekler ve gerekçe
`src/data/contact.ts` içinde açık teknik karar olarak duruyor. Koordinat
veya place-id uydurulmadı; yol tarifi bağlantısı doğrulanmış adres
metninden üretiliyor.

### Hizmet alt sayfaları

Yedi eski hizmet sayfasının tamamı indirildi. Hepsinde eski metin ile
deck metni karşılaştırıldı; deck daha yeni ve daha kapsamlı olduğu için
kodda deck sürümü duruyor. Eski sayfaların **yalnızca deck'te olmayan**
bilgileri aşağıda:

| Sayfa | Eski kicker | Eski sitede olup deck'te olmayan | Görseller |
|---|---|---|---|
| Creative | `Less Is More` | 8 maddelik yetenek listesi (BRAND CONSULTANCY … TV-PRESS-RADIO CAMPAIGNS) | `4-1.png`, `about/about-screen01.jpg` |
| Production | `More And More` | 11 maddelik "get in touch for" listesi (LIVE BROADCAST/STAGE DIRECTION … PHOTO SHOOTING) | `25.jpg`, `26.jpg`, `29.jpg` |
| Post Production | `Off We Go!` · `Abby Singer Shot!` | 13 maddelik yetenek listesi (EDITING … TRACK MOTION) | `37.jpg`, `38.jpg` |
| Digital | `More Digital More Coffee` | 11 maddelik yetenek listesi (WEB DESIGN … GIF); 4 değer cümlesi deck'te var | `digital2.jpg` |
| Live Broadcast | `Webcast - Live Stream` | 4 maddelik servis listesi + **COVID-19 dönemine özel paragraf** (güncel değil, alınmadı) | `10.jpg`, `17.jpg` |
| Cloud TV | `There Is No Time Like Right Now` | — (deck birebir taşımış) | `14.jpg` |
| Event Management | `We Design experience` · `REASON TO MEET US` | 11 maddelik yetenek listesi (EVENT ORGANISATION … PRINT STAFF) | `16.jpg`, `pr.png` |

Eski `PRODUCTION` ve `CLOUD TV` sayfalarındaki altı maddelik "What are
Hibrid Solutions?" listesi kodda zaten tek kaynak olarak duruyor
(`src/data/hibrid-solutions.ts`).

**Photography:** eski sitede bağımsız hizmet sayfası **yoktu** — açılır
menüde yedi hizmet vardı. `photo shooting` yalnızca Solutions
sayfasında ve Production/Post Production yetenek listelerinde geçiyordu.
29 Ağustos revizyonu bu yapıya dönüyor.

---

## 3. Doğrulanan sosyal medya hesapları

Eski sitenin footer'ında üç gerçek hesap bağlantısı var; üçü de
2026-08-29 itibarıyla yayında (HTTP 200):

- https://www.instagram.com/hibrid360
- https://www.linkedin.com/company/hibrid-production
- https://vimeo.com/hibrid360

Deck beş platform sayıyor (Instagram · Vimeo · YouTube · LinkedIn ·
Spotify); YouTube ve Spotify hesaplarının URL'si **hiçbir kaynakta yok**.
schema.org `sameAs` dizisi, müşteri bu üçünün güncel olduğunu teyit
edene kadar eklenmedi — bkz. `src/lib/site.ts`.

---

## 4. Eski site görselleri — depoya alındı, telif AÇIK

**29 Ağustos 2026 müşteri talimatı:** Contact'taki İstanbul fotoğrafı ile
What We Believe'deki Atatürk ve Küçük Prens bölümleri korunacak. Türevler
bu revizyonla **depoya alındı ve sayfalara bağlandı.**

### Kaynaklar (ölçüldü 2026-08-29)

| Kaynak | Gerçek format | Boyut | Bayt | sha256 | Uygulanan işlem |
|---|---|---|---|---|---|
| `/assets/img/contact/contact-bg.jpg` | JPEG | 2560x750 L | 375 034 | `0807d0a17f649783…` | — |
| `/assets/img/ataturk.jpg` | PNG | 2592x1454 RGBA | 581 715 | `820cede696bdc080…` | duotone (0  0  0) -> (255  252  0)  gamma 1.6 |
| `/assets/img/little_prince.png` | PNG | 2654x2056 RGBA | 1 102 667 | `fb3149535122cae3…` | duotone (0  0  0) -> (255  252  0)  gamma 1.6 |

`ataturk.jpg` **PNG**'dir (uzantı yanlış).

**Duotone:** eski sitede sarı/yeşil filtre dosyaya pişmişti ama tonu
marka sarısı değil zeytin yeşiliydi. Kaynak parlaklığa indirgenip
siyah → `#FFFC00` rampasından geçirilerek yeniden türetildi. Gamma 1.6:
orta tonlar koyu kalsın ki üzerine gelen beyaz metin, altındaki gradyan
perdeyle birlikte WCAG AA'yı geçsin (axe ile doğrulandı, 0 ihlal).
İstanbul panoraması gri tonlama gece çekimi olduğu için işlenmedi.

### Depodaki türevler (`public/images/site/`)

| Dosya | Boyut | Bayt | sha256 |
|---|---|---|---|
| `contact/istanbul-panorama-1600w.webp` | 1600x469 | 73 198 | `9a25ed2970437433…` |
| `contact/istanbul-panorama-1600w.avif` | 1600x469 | 56 679 | `ec6459791393308e…` |
| `contact/istanbul-panorama-2560w.webp` | 2560x750 | 150 874 | `bed0a7f38682792a…` |
| `contact/istanbul-panorama-2560w.avif` | 2560x750 | 117 063 | `36a406f5d7446581…` |
| `what-we-believe/ataturk-1600w.webp` | 1600x898 | 65 248 | `ca7d14035800011f…` |
| `what-we-believe/ataturk-1600w.avif` | 1600x898 | 33 744 | `0431512564b18cc0…` |
| `what-we-believe/ataturk-2560w.webp` | 2560x1436 | 125 096 | `be7dcb8ce3a79bb9…` |
| `what-we-believe/ataturk-2560w.avif` | 2560x1436 | 69 387 | `914097c1331d0246…` |
| `what-we-believe/little-prince-1600w.webp` | 1600x1239 | 28 920 | `30392e70649e8c33…` |
| `what-we-believe/little-prince-1600w.avif` | 1600x1239 | 14 779 | `a0d43d00cab6eba8…` |
| `what-we-believe/little-prince-2560w.webp` | 2560x1983 | 57 812 | `b06f20a23e269ec0…` |
| `what-we-believe/little-prince-2560w.avif` | 2560x1983 | 26 750 | `df14e5e931723480…` |

Üretim tekrarlanabilir:

```
python scripts/assets/prepare-legacy-images.py
```

Betik kaynağı indirir, yukarıdaki sha256'larla karşılaştırır (kaynak
değiştiyse uyarır) ve aynı türevleri üretir.

**AVIF üretiminde bir tuzak:** `contact-bg.jpg` gri tonlama (mode `L`) ve
912 baytlık **tek kanallı** bir ICC profili taşıyor. Pillow bunu RGB'ye
çevrilmiş görüntünün AVIF çıktısına da yazıyor ve Chromium o dosyayı
**çözemiyor** — üstelik `<picture>` içindeki `type` yedeği devreye
girmiyor, çünkü sorun format desteği değil çözümleme. Sonuç: istek 200
dönerken görsel sessizce kırık kalıyor. Betik artık kaynak metadata'sını
taşımıyor; nöbetçi test `e2e/canonical-routes.spec.ts` → "Görseller".

`kadin.jpg` (eski What We Believe kapağı) **alınmadı**: tanınabilir bir
kişinin portresi, model rıza kaydı yok ve bu revizyonda istenmedi.
`contact-screen01.jpg` ("Motion Office" bölüm görseli) de istenmedi.

### Telif ve atıf blocker'ları — **KAPANMADI**

Görseller artık depoda ve sayfada; bu, kullanım hakkının doğrulandığı
anlamına **gelmez**. Yayın öncesi kapatılmalı:

1. **Küçük Prens illüstrasyonu** (`little_prince.png`) — Saint-Exupéry
   1944'te öldü, eser 1943'te yayımlandı. Türkiye'de koruma süresi
   dolmuş görünse de Fransa'da savaş dönemi uzatmaları ve ABD'de 1943
   yayın tarihi nedeniyle **hâlâ korumalı**. Ticari bir kurumsal sitede
   kullanmak lisans gerektirir. **EN YÜKSEK RİSKLİ MADDE.**

2. **Atatürk fotoğrafı** (`ataturk.jpg`) — fotoğrafın kimin çektiği,
   hangi arşivden geldiği ve kullanım izni **bilinmiyor**. Tarihî
   fotoğrafın kendisi kamu malı olsa bile belirli bir baskı/restorasyon
   ayrı hak doğurabilir.

3. **İstanbul panoraması** (`contact-bg.jpg`) — çekeni ve lisansı
   doğrulanmadı; stok görsel olma ihtimali var (BLOCKERS.md madde 3).

4. **"Everything in the world created by women" alıntısı** — eski sitede
   Atatürk fotoğrafının üzerine, **imza alanı boş bırakılarak** konmuştu;
   atıf ima ediliyor ama yazılmıyor. Birincil kaynağı gösterilemediği
   için yeni siteye **alınmadı** ve yerine alıntı **uydurulmadı**. O
   bandın üzerindeki metin şirketin kendi onaylı manifesto cümlesidir —
   tırnak içinde değil, imzasız.

5. **Küçük Prens alıntısının atfı** — eski sitede `Antonie de Saint –
   Exupery` yazıyordu; doğrusu **Antoine de Saint-Exupéry**. Kodda
   (`culture.whatWeBelieve.quoteAuthor`) doğru yazım kullanılıyor.

6. **Müşterinin çekeceği konuşma videosu** — hâlâ **hiçbir gerçek dosya
   yok**. Sahte video veya yer tutucu kişi üretilmedi; bileşen
   (`BeliefFounderVideo`) hazır ve `BELIEF_FOUNDER_VIDEO` `null` olduğu
   sürece bölümü hiç render etmiyor. Prodüksiyon blocker'ı.
