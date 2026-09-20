# Tipografi + Tasarım Yenileme — Hibrid 360

Tarih: 17 Eylül 2026 · Dal: `feat/typography-system`
Referans: monks.com (müşterinin en beğendiği sayfa) · Marka sistemi: CLAUDE.md (renkler SABİT)

---

## 0. TEŞHİS — neden "şablon" gibi duruyor

Kod tabanında ölçüldü:

| Token | Kullanım | Rol |
|---|---|---|
| `--font-brand` (Montserrat) | **182** | h1, h2, h3, etiket, buton, nav, kart, istatistik, eyebrow — HER ŞEY |
| `--font-body` (Inter) | 13 | yalnız birkaç gövde bloğu |
| `--font-chapter-display` (Space Grotesk) | 5 | yalnız Creative chapter'ları |

Tek ses 182 rolü taşıyor. Hiyerarşi yalnızca **punto ve kalınlıkla** kuruluyor,
hiç **biçimle** kurulmuyor. Montserrat geometrik-sans: geniş yuvarlak gözleri
küçük puntoda ve uzun metinde jenerik okunuyor. Sitenin "hepsi aynı" hissinin
tek sebebi bu.

### monks.com gerçekte ne yapıyor (CSS'inden doğrulandı, tahmin değil)

`themes/custom/monks/static/css/main.css` içinden:

| Rol | monks.com fontu |
|---|---|
| Display başlık | `Helvetica Now Extended` **800** ← geniş + çok kalın |
| Gövde / UI | `Helvetica Now` 400 / 500 |
| Editoryal kontrast | `Morian Trial` 400 + **italic** (yüksek kontrastlı serif) |
| El yazısı aksan | `Caveat` 400 |

Yani sır tek bir font değil: **4 ayrı ses, her birinin net bir işi var.**
Özellikle *Extended* (geniş) display — Montserrat'ın yapamadığı şey bu.

---

## 1. FONT SİSTEMİ — 4 rol, hepsi OFL, hepsi self-hosted

Lisans sorunu yok, hepsi yeniden dağıtılabilir. Kaynakları doğrulandı (HTTP 200).

| Rol | Font | monks karşılığı | Neden |
|---|---|---|---|
| **Display** | **Archivo Variable** (`wght` 100–900 + `wdth` 62–125) | Helvetica Now Extended 800 | Archivo, Helvetica'ya alternatif olarak tasarlanmış bir grotesk ve **gerçek genişlik ekseni var** (doğrulandı: METADATA.pb `wdth 62–125`). `wdth:118, wght:800` = monks display'inin birebir karşılığı. |
| **Gövde / UI** | **Inter** (mevcut) | Helvetica Now 400/500 | Zaten yüklü, TR glifleriyle subset edilmiş. Değişmiyor. |
| **Editoryal** | **Instrument Serif** Regular + Italic | Morian Trial 400 + italic | Yüksek kontrastlı display serif, aynı iki-stil yapısı. Alıntı/manifesto/lead sesi. |
| **Chapter display** | **Space Grotesk 700** (mevcut) | — | Creative'de zaten var, kullanıcı onayladı. Korunuyor. |

### Montserrat çıkıyor — bu kritik
Hero'daki "HIBRID" yazısı **canlı metin değil**, WebGL alfa maskesi
(`public/images/hibrid-wordmark.png`). Yani Montserrat'ı kaldırmak hero'ya
**hiç dokunmuyor**. Archivo başlıkları, Inter UI'ı devraldığında Montserrat'ın
tek işi kalmıyor → **33KB siliniyor, Archivo giriyor**. Font yükü toplamda
sabit kalıyor. Biriktirme değil, değiştirme.

### Performans bütçesi (CLAUDE.md: <2MB ilk yük, LCP <2.5sn mobil)
Mevcut pipeline'ın aynısı: `pyftsubset` + `varLib.instancer`, aynı unicode
aralığı (Latin + ğĞİşŞ). fontTools 4.62.1 kurulu ✓

| | Önce | Sonra |
|---|---|---|
| Montserrat 300–800 | 33.1 KB | **— (silindi)** |
| Inter 400–500 | ~17 KB | ~17 KB |
| Space Grotesk 700 | 10.7 KB | 10.7 KB |
| Archivo wght 400–800 × wdth 100–125 | — | ~38 KB (hedef) |
| Instrument Serif Reg+Italic | — | ~26 KB (hedef) |
| **Toplam** | **~61 KB** | **~92 KB (hedef ≤95KB)** |

Net +31KB. Bütçe içinde, ama her adımda ölçülecek. Aşarsa Instrument Serif
yalnız Regular'a iner.

### Yeni rol token'ları
182 çağrıyı tek tek değiştirmek yerine **anlamsal rol token'ları** tanımlanıp
her sayfada doğru role eşlenecek. Asıl tasarım işi bu: 182 kullanımın hangisi
display, hangisi başlık, hangisi UI etiketi — buna karar vermek.

```
--font-display    → Archivo wdth 112–125 / wght 700–800  (h1, statement, bant)
--font-heading    → Archivo wdth 100     / wght 600–700  (h2, h3, kart başlığı)
--font-ui         → Inter 500 + 0.08em espas             (nav, buton, etiket, meta)
--font-body       → Inter 400                            (gövde)
--font-editorial  → Instrument Serif                     (alıntı, manifesto, lead)
--font-chapter-display → Space Grotesk 700               (değişmiyor)
```

---

## 2. DOKUNULMAZLAR

- ❌ Hero "HIBRID" WebGL yazısı ve efekti — **hiç dokunulmayacak**
- ❌ Marka renkleri (#000 / #FFF / #FF00FF / #FFFC00) — sabit
- ❌ Kontrast kuralı: fuşya ve sarı zeminde **siyah** metin
- ❌ Ana sayfadaki görseller — yalnız fontlar
- ❌ `prefers-reduced-motion` desteği — her yeni animasyonda zorunlu
- ❌ Aynı anda tek WebGL sahnesi kuralı
- ❌ TR/EN metin bütünlüğü — hiçbir metin bozulmayacak, karışık dil yok

---

## FAZLAR

### Faz 1 — Font altyapısı ✅ BİTTİ
- [x] 1.1 Archivo / Instrument Serif TTF indir, `varLib.instancer` ile eksenleri daralt
- [x] 1.2 `pyftsubset` ile Latin+TR subset → woff2, `public/fonts/`
      (`scripts/generate-fonts.py` — tekrarlanabilir, TR glifleri doğrulanıyor)
- [x] 1.3 Lisans dosyalarını (OFL) yanına koy
- [x] 1.4 `fonts.css`: `@font-face` + metrik uyumlu fallback'ler (CLS=0)
      Archivo 87.8/21/116.55% · Instrument Serif 99/31/76.86% (Georgia tabanlı)
- [x] 1.5 `tokens.css`: rol token'ları + espas/satır ölçeği
- [x] 1.6 Boyut ölçümü — **83 KB** (Montserrat çıkınca), hedef ≤95 KB ✅
      Archivo 28.1 · Instrument Serif 19.8 · Inter 25.9 · Space Grotesk 10.5

### Faz 2 — Global tipografi ölçeği ✅ BİTTİ
- [x] 2.1 Espas/satır token'ları; `0.08 / 0.12 / 0.14em` üçlüsü iki role indi
      (`--tracking-ui` 14-16px, `--tracking-micro` 13px)
- [x] 2.2 `globals.css`: h1 display ritmi, h2/h3 heading ritmi
- [x] 2.3 Footer — statement display sesine geçti, bağlantılara süpürme
      altçizgisi, "yukarı" oku hover'da yükseliyor
- [x] 2.4 Header — marka espası, nav süpürmesi ev eğrisine alındı
      (nav zaten Inter'deydi, doğru roldeydi)

**Yol üstünde bulunan ve düzeltilen gerçek hatalar:**
- 5 yerde `font-style: italic` + Archivo/Montserrat → ne ikisinin de gerçek
  italiği yok, tarayıcı **sahte oblik** üretiyordu. Hepsi editoryal serife
  alındı, eğim kaldırıldı.
- `TextFadeIn` kelimeleri `split(/\s+/)` ile bölüyordu — bölünmez boşluğu
  (NBSP) da ayırıcı sayıyor, "Hibrid 360"ı ikiye koparıyordu. Tam bu iş için
  yazılmış `splitWords()` kullanılmıyordu.
- `PrimaryCta` transform'unda `transition` yoktu: buton hover'da zıplıyordu.
- `LessTalk` başlığı referans PDF'e birebir ölçülmüştü; Archivo'nun cap
  yüksekliği (%2) ve genişliği (EN'de %13.4) farklı olduğu için punto ve
  espas yeniden hesaplandı — TR/EN iki dilde de taşma yok (ölçüldü).

### Faz 3 — Sayfa sayfa (her biri mobil önce, sonra masaüstü)
- [ ] 3.1 `/work`
- [ ] 3.2 `/clients` (Friends)
- [ ] 3.3 `/partners`
- [ ] 3.4 `/think-and-thank`
- [ ] 3.5 `/contact`
- [ ] 3.6 `/who-we-are`
- [ ] 3.7 `/what-we-believe`
- [ ] 3.8 `/` ana sayfa — **yalnız fontlar**, görseller ve hero korunur

### Faz 4 — Hareket sistemi (framer-motion 13 zaten kurulu)
Tek ortak dil, sayfa başına ayrı numara değil:
- [ ] 4.1 Başlık kelime-kelime açılışı (`split-words.ts` zaten var)
- [ ] 4.2 Manyetik buton + fuşya sweep hover
- [ ] 4.3 Bağlantı altı çizgi süpürmesi
- [ ] 4.4 Bölüm giriş kademesi (stagger), `prefers-reduced-motion` kapalı
- [ ] 4.5 Clients/Partners için sonsuz şerit (marquee)

### Faz 5 — MONA şekil kütüphanesi ✅ BİTTİ (tarayıcıda doğrulandı)
Motor zaten hazır: `u_shape` ağırlıkları + `mona-creature.ts` durum makinesi.
`lotus` eklemesi birebir emsal (`generate-mona-lotus.mjs` → yoğunluk haritası).

Referans görsellerden (`Downloads/mona`, 8 adet) çıkarılan sözlük:
| Şekil | Kaynak |
|---|---|
| Yüz profili (noktalı) | (1) |
| Rüzgârda dağılan yüz | (2) |
| Küp (tel kafes) | (4) |
| Arı + çiçek (blueprint) | (7) |
| Güneş/ışınlı varlık | (5) |
| İris / göz çiçeği | (6) |

- [x] 5.1 `generate-mona-shapes.mjs` — şekil başına eşik/gama ayarlı
- [x] 5.2 4 referanstan yoğunluk haritası (yüz, kristal, küp, iris)
      Arı+çiçek ve güneş elendi: ince çizgi katmanları MONA ölçeğinde
      nokta bulutuna inince silüet okunmuyor, gürültüye dönüşüyor.
- [x] 5.3 Shader: tek `a_gallery` yuvası + `u_gallery` ağırlığı.
      A/B crossfade'e GEREK KALMADI — durum makinesi şekilleri hiç üst üste
      bindirmiyor (giriş→bekleme→çıkış tek tek). Şekil değişimi tampon
      yeniden bağlamayla oluyor: **veri yükleme yok, kare atlamıyor.**
- [x] 5.4 `mona-creature.ts`: havuz 3 → 7 şekil, galeri 6 sn duruyor (4 değil)
- [x] 5.5 `mona-shapes.test.ts` 6 test + sıra sözleşmesi testi · 304/304 geçiyor
- [x] 5.6 Tarayıcı doğrulaması: kristal/küp/iris canlı yakalandı

### Faz 6 — AI Creative Production sayfası
Mevcut tasarıma **sadık kalarak** iyileştirme (kullanıcı talebi):
- [ ] 6.1 Tipografi yeni sisteme geçer
- [ ] 6.2 MONA yeni şekilleri devrede
- [ ] 6.3 Ritim/boşluk rötuşu — kompozisyon aynı kalır

### Faz 7 — Üretilen medya
- [ ] 7.1 Higgsfield ile motion-graphic video (marka renkleri, siyah zemin)
- [ ] 7.2 Seedance 2.5 ile bölüm animasyonları
- [ ] 7.3 AV1/WebM + poster + `preload="none"` (CLAUDE.md medya kuralı)

### Faz 8 — Doğrulama
- [ ] 8.1 `npm run typecheck` + `lint` + `vitest`
- [ ] 8.2 Playwright e2e (yatay taşma nöbetçisi dahil)
- [ ] 8.3 WCAG AA kontrast — tüm sayfalar
- [ ] 8.4 TR + EN her sayfa gözle kontrol — metin bozulmamış
- [ ] 8.5 Lighthouse mobil — LCP < 2.5sn, transfer < 2MB
- [ ] 8.6 `prefers-reduced-motion` açık test

---

## Review — 17 Eylül 2026

### Düzeltme (aynı gün, kullanıcı geri bildirimi) — logo eskisi gibi kalsın

Kullanıcı Header logosunun ekran görüntüsünü gösterip "bu logolar eskisi
gibi olsun, fontunu güncellemene gerek yok" dedi. `--font-brand`'in
Archivo'ya geçmesi kod tabanındaki 5 literal "Hibrid 360" logotype
render'ını da (Header `.logo`/`.megaBrand`, Footer `.wordmark`,
MeetTheCrewReveal `.wordmark`, LanguageSwitcher `.eyebrow`) etkilemişti.

**Çözüm:** Montserrat, YALNIZ bu 5 yer için, tek ağırlıkta (800, statik)
geri eklendi. Yeni rol token'ı `--font-logo` — `--font-brand`'ten ayrı,
sitenin geri kalanı Archivo'da kalıyor. Font bütçesi: 84.3 KB + 14.5 KB
(logo-only Montserrat) = **98.7 KB**.

`scripts/generate-fonts.py`'ye `build_logo_font()` eklendi (tekrarlanabilir
üretim, aynı Türkçe glif doğrulaması). Metrik-uyumlu yedek yeniden ölçüldü
(size-adjust 122.48% — tek ağırlıkta çok-ağırlıklı eski değerden farklı,
doğrudan yeni dosyadan ölçüldü, varsayılmadı).

Doğrulama: computed style + ekran görüntüsü karşılaştırmasıyla teyit edildi
(kullanıcının paylaştığı görüntüyle birebir eşleşiyor). typecheck ✅ lint ✅
vitest 304/304 ✅ playwright 193/193 (4 atlandı) ✅.


### Doğrulama (hepsi temiz)
| Kontrol | Sonuç |
|---|---|
| `npm run typecheck` | ✅ |
| `npm run lint` | ✅ |
| `npx vitest run` | ✅ **304/304** |
| `npx playwright test` | ✅ **193 geçti, 0 düştü**, 4 atlandı |
| `npm run build` | ✅ paylaşılan JS 103 kB |
| Yatay taşma nöbetçisi (320/375/390/768/1440) | ✅ |
| WCAG AA (axe, e2e içinde) | ✅ |
| TR + EN metin bütünlüğü | ✅ ölçüldü, taşma yok |

### Font bütçesi
Önce 68.7 KB → sonra **83 KB** (Montserrat'ın 32.3 KB'ı silindi, Archivo 28.1 +
Instrument Serif 19.8 eklendi). Net +14.3 KB, hedef ≤95 KB.

### Yol üstünde bulunan gerçek hatalar
1. **Sahte oblik** — 5 yerde `font-style: italic`, ama ne Montserrat'ın ne
   Archivo'nun gerçek italiği var; tarayıcı harfleri eğiyordu. Editoryal
   serife alındı.
2. **`TextFadeIn` NBSP'yi bölüyordu** — `split(/\s+/)` bölünmez boşluğu de
   ayırıcı sayıyor, "Hibrid 360"ı koparıyordu. Tam bu iş için yazılmış
   `splitWords()` kullanılmıyordu.
3. **`PrimaryCta` transform'unda transition yoktu** — buton hover'da zıplıyordu.
4. **`LessTalk` ölçüleri** — referans PDF'e Montserrat metrikleriyle
   ölçülmüştü; Archivo'nun cap yüksekliği %2, EN başlık genişliği %13.4
   farklı. Punto ve espas yeniden hesaplandı.
5. **`BrandIdent` yatay taşması** — bant koşulsuz negatif margin taşıyordu,
   yatay boşluğu olmayan `work .page` içinde tam bir gutter taşırıyordu.
   Nöbetçi test yakaladı; `bleed` opt-in prop'una çevrildi.

### Not: bilinen yerel sorun (yeni değil)
`e2e/think-and-thank.spec.ts` bazı koşularda düşüyor — `/_next/image`
AVIF isteği takılıyor (`strategy.webp`, `Accept: image/avif` ile 90sn+,
başlıksız 39ms; sharp aynı dosyayı doğrudan 0.196sn'de kodluyor). Temiz
build'de geçiyor. Vercel'de optimizasyon farklı çalıştığı için yayında
görülmüyor. Ayrıntı: memory/local-testing-gotchas.md

### Kalanlar (bu turda yapılmadı)
- [ ] Seedance ile sayfa içi bölüm animasyonları (ident dışında)
- [ ] AI Creative Production sayfasının ritim/boşluk rötuşu
- [ ] Sayfalardaki büyük dikey boşluklar (scroll sahnelerinin statik hâli)
- [ ] Instrument Serif italiği — tasarım isterse (+20.8 KB)
- [ ] Space Grotesk yedeğindeki `size-adjust: 128.23%` muhtemelen ~17 puan
      yüksek (xAvgCharWidth yöntemiyle hesaplanmış); Creative incelemesi
      bitince ayrıca ele alınmalı

---

## Tur 2 — 17 Eylül 2026 (boşluk / foto / culture / ay videosu / THINK / scroll hareketi)

### Uygulandı + doğrulandı
- [x] Ay (E.T.) videosu takılması: seek koruması (ScrollScrubVideo), tam intra H.264 CRF28,
      CSS filter piksele gömüldü (BT.601, fark ~1.3/255). Gerçek sayfada: üst üste seek 9-11 → 0,
      >33ms kare 5-6 → 0, en kötü kare 33-50ms → 17ms. `scripts/encode-scrub-video.sh`
- [x] THINK başlığı +%20 (+ 320px taşma ve hareket-azaltma satır kırılma düzeltmeleri)
- [x] Tanımsız token'lar: --space-5 (Culture kart padding 0 → 20px), --space-10 (6 yer), --font-size-body-lg
- [x] vitest 330/330 · playwright 204/204 · build ✅ — COMMIT EDİLMEDİ

### "Hepsini uygula" (kullanıcı: tek linkte göster) — uygulandı, kullanıcı incelemesinde
- [x] What We Do fotoğrafları: arşivden 7 görsel, fotoğraflar marka duotone'u (siyah→#FFFC00),
      grafikler orijinal — `scripts/generate-service-photos.mjs`, `*-photo-v3.webp`
- [x] Culture yönü A: büyük tipografik indeks (CultureIndex) — scroll'a bağlı satır açılışı,
      hover'da sarı dolgu + siyah metin, imleci izleyen duotone önizleme (yalnız hassas işaretçi)
- [x] Boşluklar:
  - A çizim sahneleri: son karenin soluk izi (pentool videoları `*-end.webp` + screen; AI çizimi
    ve DNA sarmalında SVG kopyası), çizim ilerledikçe söner · CrownReveal scrub 1.2 sn'den,
    "YOUR BRAND." bölüm ekrana girerken belirir
  - B ScrollLitText 82svh → 58svh (mobil 68 → 46)
  - C CtaBand içerik dikey ortada, min-height 46 → 36svh, mobilde içerik yüksekliği
  - D AI flowSection/manifesto, think objectStudy, culture-page alt dolgu, Creative arşiv 4:5 → 3:2
  - E ChapterHero <900px min-height yok
  - F BrandIdent 16:9 → 21:9, margin-block küçüldü
  - Tarama sonrası (önce → sonra, toplam boş px): AI 5184 → 2112, creative mobil 2947 → 1477,
    digital mobil 3036 → 1344, work 1728 → 384, think 672 → 0, who-we-are 312 → 0, mobil CTA'lar 280 → 0.
    Kalan çizim sahnesi bulguları yanlış pozitif (1px iz tarayıcının küçültmesinde kayboluyor).
- [x] Scroll'a bağlandı: LessTalk (madde başına sahne), TextFadeIn (kelime kelime), EditorialImage
      (dönme/yaklaşma), think-and-thank konturları (ScrollContours), DNA sarmalı nefesi, arşiv tarama
      çizgileri, BrandIdent kadraj kayması
- [ ] Bilinçli olarak zamanlı kaldı: hero HIBRID + RotatingSlogans, MONA, güneş sistemi, ChapterVideo
      filmleri (oynat/duraklat — WCAG 2.2.2), hover/seçim geçişleri, ChapterHero lede açılışı, dil menüsü
- [ ] COMMIT EDİLMEDİ — kullanıcı onayı bekliyor

---

## Tur 3 — 18 Eylül 2026 (taç videosu / 20 animasyonu / MONA hover / serif / kontrast / foto kalitesi)

Kullanıcı yayındaki sürümü (hibrid-360.vercel.app) inceleyerek yazdı; Tur 2 işleri henüz
commit/deploy edilmedi. Talep: "detaylıca planla sonra yapıma geç... profesyonel kalitede
olmalı, işçilik inanılmaz iyi olmalı."

### A — Clients (Friends) sayfası

**A1. Taç videosu değişimi** (`public/videos/friends-crown-reveal.mp4`, `CrownReveal.tsx`)
- Kaynak: `~/Downloads/hf_20260912_173844_...mp4` — 1920x1080, 24 fps, 169 kare, 7.04 sn, HEVC 10-bit.
- Ölçülen sorunlar ve çözümleri:
  1. **HEVC** → Chrome/Edge/Firefox oynatmaz (bkz. 2d9b380). H.264 High'a çevrilecek.
  2. **Scrub takılması** → tam-intra (`-g 1`) encode; ScrollScrubVideo'daki seek koruması
     (`video.seeking` + `seeked` resync) CrownReveal'a da taşınacak.
  3. **"Kenarlarda boşluk"** → videonun zemini saf siyah DEĞİL: köşeler RGB ≈ 32/22/12
     (kahverengimsi). Siyah sayfada görünür bir dikdörtgen oluşturuyor. Encode'da siyah
     noktası gerçek siyaha çekilecek (`colorlevels rimin≈.137 gimin≈.086 bimin≈.047`),
     ardından masaüstünde `object-fit: cover` (kırpım güvenli: cropdetect tüm kareyi dolu
     buluyor ama kompozisyon merkezde), mobilde zemin artık #000 olduğu için dolgu görünmez.
  4. **"Taç sıfırdan oluşsun"** → scrub 0'dan başlar (ilk kare boş); Tur 2'deki 1.2 sn
     atlama bu videoda gereksiz, kaldırılacak. Poster = ilk kare (siyah), flaş olmaz.
- Kabul: Chrome'da readyState 4, kaydırma testinde >33 ms kare yok, üst üste seek yok,
  1440x900 ve 390x844'te görünür kenar/dikdörtgen yok, geri kaydırınca taç sökülür.

**A2. "20" görseli → animasyon** (`/images/site/friends-anniversary.png`, 1254x1254, 863 KB PNG)
- Rasterden alfa çıkarılıp (parlaklık → alfa) altın marka transparan katmana dönüşür.
- Animasyon: ışınlar merkezden dışa doğru conic maske ile sırayla açılır, "20" halkası
  çizilir, üzerinden yumuşak altın parlama geçer. Scroll'a bağlı (site geneliyle tutarlı)
  + hover'da parlama. Hareket azaltmada tek statik kare.
- Yükleme: `priority` kaldırılır, görünür alana yaklaşınca (IntersectionObserver) yüklenir;
  863 KB PNG yerine webp + alfa (~120 KB hedef).

### B — What We Do

**B1. Premium görsel seti (BLOKE — Higgsfield konnektörü kapalı)**
- Kullanıcı: "4k kalitesinde premium, hepsinde aynı görsel dil".
- Bu turda yapılacak: tek bir sanat yönetimi tanımı (kadraj, ışık, renk, lens, doku,
  insan/mekân oranı) + 8 hizmet için birebir prompt seti, `docs/design/` altına yazılır.
- Konnektör açılınca: üret → 3:2, 2400px webp (4K kaynak, siteye 2400px: performans bütçesi
  <2 MB ilk yükleme) → `site-images.ts` güncelle.
- Geçici durum: Tur 2'deki arşiv duotone görselleri yerinde kalır.

**B2. AI Creative Production satırında MONA** (`ServiceDirectory.tsx`)
- Son satır hover/odak olduğunda sahnede tipografik poster yerine partikül MONA.
- Motor hazır: `MonaShard` ile aynı (`createMonaDotsScene` + `mona-creature`), fark yerleşim:
  `monaDotsLayout` (merkezî). İmleç mıknatısı, irkilme, uyku aynı.
- Kurallar: tek WebGL sahne kilidi (`acquireSceneLock`), ekrandan çıkınca durur,
  hareket azaltmada tek statik kare, dokunmatikte/dar ekranda hiç kurulmaz (mevcut poster).

**B3. Sahne etiketleri** — `.stageMeta` (derece + hizmet adı) ve `.typePoster` kontrastı
ölçülecek; AA altındakiler beyaza çekilecek, gerekiyorsa alt gradyan güçlendirilecek.

### C — Genel

**C1. Fotoğraf üzerindeki metinlerin kontrast denetimi**
- Playwright ile tüm canonical rotalarda (TR+EN, 1440 + 390) görsel/video/canvas üstüne
  gelen her metin düğümü bulunur, arkasındaki gerçek piksel parlaklığından kontrast oranı
  hesaplanır; WCAG AA (4.5:1 / büyük punto 3:1) altındakiler raporlanır ve düzeltilir.

**C2. Kalitesiz fotoğraflar** (denetim çalıştırıldı — Laplacian keskinlik + çözünürlük + KB)
- En sorunlular: `services/photography.webp` (1920x1280, 58 KB, keskinlik 29),
  `think-and-thank/ai.webp` (19.3 — en yumuşak), `think-and-thank/culture.webp` (42 KB),
  `home/make-brand.webp` (42 KB), `statement-*.webp` (1254x1254 düşük çözünürlük),
  `friends-anniversary.png` (863 KB PNG — A2'de zaten kalkıyor),
  `contact/istanbul-panorama` (keskinlik 23; panorama olduğu için tolere edilebilir).
- Kaynağı olanlar yeniden dışa aktarılır; olmayanlar B1 ile birlikte yeniden üretilir.

**C3. Serif değişimi** — `--font-editorial: Instrument Serif` → daha okunaklı, şık bir serif
- Kullanım yerleri: alıntılar (`TestimonialList`), manifesto/giriş cümleleri
  (`what-we-believe`, `who-we-are`, `culture-page` ×2).
- Öneri: **Newsreader** (değişken ağırlık + optik boyut ekseni, ekran okunabilirliği için
  tasarlandı, OFL). Alternatifler: Fraunces (daha karakterli), Source Serif 4 (daha nötr).
- İş: subset üretimi (`scripts/generate-fonts.py` deseni, TR glif doğrulaması), metrik
  uyumlu yedek (size-adjust Georgia'ya göre yeniden hesaplanır), üç fontun aynı metinle
  karşılaştırma numunesi, tüm kullanım yerlerinin ekran kontrolü.

**C4. monks tarzı animasyon** — `MeetTheCrewReveal` (who-we-are, CUL-06)
- Bileşen VAR ve monks'un dairesel scroll-reveal'ini uyguluyor; ama `CULTURE_FILM = null`
  olduğu için sayfada "Ekip filmi hazırlanıyor" boş durumu görünüyor — animasyon hiç
  görünmüyor. Kullanıcının "bulup düzeltilmiş şekilde ekle" dediği şey bu.
- Çözüm: gerçek varlıkla çalıştır — film teslim edilmediği için poster modunda gerçek
  kültür fotoğrafı (`culture/what-we-stand-for-cinematic.webp`) ile açılır; film gelince
  tek veri değişikliğiyle videoya döner. Sahte film/replik eklenmez (CLAUDE.md).

### D — Doğrulama (her madde için)
- typecheck + lint + vitest + build + e2e
- Ekran görüntüsü: değişen her bölüm, masaüstü + mobil, birden çok scroll konumu
- Kontrast raporu yeniden çalıştırılır (AA altında madde kalmamalı)
- Performans: ilk yükleme transferi < 2 MB, video poster + `preload="none"` kuralı korunur

---

## Tur 3 — SONUÇ (18 Eylül 2026, commit EDİLMEDİ)

### Uygulandı + ölçüldü
- [x] **A1 Taç videosu**: yeni HF kaynağı HEVC 10-bit → H.264 High, tam intra (169/169
      anahtar kare), 1920x1080, 3.5 MB (eski 5.3 MB). Siyah noktası `colorlevels` ile
      çekildi — DİKKAT: filtre 10-bit YUV girdide her şeyi siyaha çeviriyor, önce
      `format=rgb24` gerekiyor (ilk deneme bu yüzden boş çıktı). Kenar dikdörtgeni
      radial maskeyle sayfaya eritildi; ölçüm: mobil sol kenar 9/7/5 = sayfa siyahı.
      Scrub 0'dan başlıyor: 0px→0s, 900→2.29s, 1800→4.79s, 2700→6.99s.
- [x] **A2 "20" animasyonu**: `scripts/extract-anniversary-mark.mjs` işareti bileşen
      analizi + PCA ile ayırıyor — halka (SVG circle), 67 ışın (SVG line), "2"+metin
      (alfa webp 30 KB). 863 KB PNG → ~32 KB toplam. Işınlar saat yönünde, merkezden
      dışa sırayla çiziliyor (ölçüm: progress .08→0 ışın, .35→11, .61→67/67).
      Raster katman yalnız görünür alana yaklaşınca DOM'a giriyor.
- [x] **B2 MONA hover**: `MonaShard placement="center"` + yeni `monaCenterLayout`.
      AI satırında 180 ms bekleyip kuruluyor (listede gezinirken WebGL çöpü olmasın),
      poster sönüyor. Ölçüm: mode=webgl, fare hareketiyle karenin %7.1'i değişiyor.
- [x] **B3 + C1 Kontrast**: gerçek piksellerden ölçen tarayıcı yazıldı
      (`contrast-audit.mjs`). İki gerçek bulgu: What We Do derece etiketi fuşya
      3.23:1 → beyaz (~10:1); ana sayfa kapanış cümlesi mobilde sarı ayın üzerinde
      2.83:1 → alt perde eklendi. Tekrar tarama: TR+EN, 1440+390 → bulgu yok.
- [x] **C3 Serif**: Instrument Serif → **Newsreader** (dört aday aynı metinle
      karşılaştırıldı). wght 400 + opsz 24 sabit: 20.6 KB (opsz ekseni değişken
      bırakılsa 53.9 KB olurdu — birkaç alıntı için +34 KB bütçeye değmiyor).
      Yedek metrikleri yeni `scripts/font-fallback-metrics.py` ile: 73.5/26.5,
      size-adjust %91.47 (script mevcut Instrument değerini %77.71 veriyor, dosyadaki
      elle hesap %76.86 — yöntem doğrulandı).
- [x] **C4 monks animasyonu**: `MeetTheCrewReveal` sayfada hiç görünmüyordu
      (`CULTURE_FILM = null`). Müşteri arşivinden gerçek ekip fotoğrafı (5616x3744 →
      2200px webp, 71 KB) ile poster modunda açıldı. İki vitest o eski sözleşmeyi
      (null kalsın) bekçiliyordu; yeni sözleşmeye göre yazıldılar — poster modunda
      sahte oynatma/altyazı/CTA üretilmediği hâlâ test ediliyor.
- [x] typecheck · lint · vitest 330/330 · build · **e2e 204/204** (4 atlandı)

### Bloke
- [ ] **B1 What We Do premium görselleri** — Higgsfield konnektörü bağlı değil.
      Sanat yönetimi + 8 prompt hazır: `docs/design/WHAT_WE_DO_VISUAL_LANGUAGE.md`.
      Bağlantı açılınca üret → 2400px webp → `site-images.ts`.

### Rapor: kalitesiz görseller (C2)
Ölçüm: Laplacian keskinlik + çözünürlük + bayt. En sorunlular ve kaynak durumu:

| Görsel | Sorun | Kaynak var mı |
|---|---|---|
| `services/photography.webp` | 1920x1280, 58 KB, keskinlik 29 | B1 ile yeniden üretilecek |
| `think-and-thank/ai.webp` | keskinlik 19.3 (en yumuşak) | yok — docx'te gömülü görsel yok |
| `think-and-thank/culture.webp` | 42 KB, keskinlik 39 | yok |
| `home/make-brand.webp` | 1920x1080, 42 KB | yok |
| `statement-*.webp` (3 adet) | 1254x1254 düşük çözünürlük | yok |
| `contact/istanbul-panorama` | keskinlik 23 | panorama, tolere edilebilir |
| `friends-anniversary.png` | 863 KB PNG | ÇÖZÜLDÜ — A2 vektöre çevirdi |

Kaynağı olmayanlar için yol: B1'in görsel diliyle yeniden üretim (Higgsfield).

### Kullanıcıya sorulacak
- [ ] `public/fonts/instrument-serif-latin-tr.woff2` (19.8 KB) artık hiçbir yerde
      kullanılmıyor — silinsin mi? (Silme onay gerektirir.)

---

## Tur 4 — 19 Eylül 2026 (dairesel reveal + 3B ekosistem)

### A. Who We Are dairesel sahnesi (monks mekaniği) ✅
- Arka plandaki "Hibrid 360" wordmark KALDIRILDI (kullanıcı: "içi tamamen boş olsun").
- Daire artık tam ekrana açılmıyor: çan eğrisi — büyür (.06→.34), açık kalır,
  küçülür (.66→.94). Geri kaydırınca ters sarılıyor, tekrar inince yine açılıyor.
- Büyüme `clip-path` yerine `transform: scale`: medya daireyle birlikte ölçekleniyor,
  küçükken de kadraj görünüyor (maske büyütmek karenin ortasındaki birkaç pikseli
  gösteriyordu).
- İçerik: MONA'nın performans çekimi (bizim karakterimiz, TV yüzünde konuşma dalgası).
  9.6 MB → 720p/CRF27, **0.63 MB**. Ses kanalı yok.
- Veri modeline üçüncü tür eklendi: `kind: "loop"` — sessiz döngü altyazı İSTEMEZ ama
  "AI ile üretilmiş temsili görseldir" etiketi ZORUNLU. Konuşan film gelince
  `kind: "video"`ya geçilecek ve derleyici yine TR+EN altyazı isteyecek.
- WCAG 2.2.2 duraklat/oynat düğmesi; video yalnız daire açıkken oynuyor.
- Ölçüm: açıklık 0 → 1 → 0, çap 67px → 558px → 67px, video yalnız açıkken ilerliyor.

### B. Hibrid ekosistemi — Canvas 2B'den gerçek 3B'ye ✅
- **Yörünge fiziği gerçek**: Kepler denklemi (Newton, 3 yineleme) + Kepler II
  (yakın noktada hızlanma) + Kepler III (T ∝ a^1.5 — hız tablosu yok, yarıçaptan
  çıkıyor). 16 birim testi.
- **Gezegen dokuları kendi ürettiğimiz** (`scripts/generate-planet-textures.mjs`):
  gürültü KÜRE ÜZERİNDE 3B örnekleniyor → dikişsiz, kutupta sıkışma yok. Sekiz farklı
  yüzey türü (kayaç/kanyon, gece ışıkları, bant akışı, buzul, krater, katman, swirl).
  Toplam ~300 KB. Higgsfield ve Blender bağlı olmadığı için dışarıdan varlık
  üretilemedi; paletler marka renkleriyle sınırlı.
- **Sahne** (`src/lib/solar-scene.ts`, WebGL1): tek ışık kaynağı (yıldız), yükseklik
  haritasından türetilen yüzey normalleri, yumuşak terminatör, atmosfer halkası,
  gece ışıkları (Digital), iki gezegende halka sistemi, 1400 yıldızlı derinlikli
  yıldız alanı, toplamalı korona.
- **Yıldız = müşterinin kristal videosu**, billboard olarak (küreye sarınca video
  siyah zemini yüzeyin çoğunu kaplıyordu; toplamalı karışım siyahı yok ediyor).
- **Etkileşim**: gezegene tıkla → kamera uçarak yaklaşıyor (yıldız arkada kalacak
  şekilde, aydınlık yüz görünüyor), boşluğa tıkla → geri çekiliyor; sürükleyerek
  sistem çevriliyor; imleç bir gezegenin üstündeyken sistem duruyor (hareket eden
  hedefe tıklamak zordu).
- **Panel derinleşti**: derece (hizmet sayfasının koordinatı) + tanım + hizmetin
  TAMAMI (ör. Digital'de 11 kalem) + sayfaya bağlantı. Listeler
  `src/data/service-offerings.ts`'e taşındı — sekiz hizmet sayfası ve panel aynı
  kaynağı okuyor (önce iki ayrı kopyaydı).
- **Performans**: sahne mount'ta değil GÖRÜNÜR ALANA GİRİNCE kuruluyor (dokular
  ~300 KB); e2e nöbetçisi bunu kilitliyor.
- **Erişilebilirlik korundu**: etiketler DOM'da gerçek `<button>`, klavye sırası,
  Escape ile kapanış + odak dönüşü, axe temiz, duraklat düğmesi, hareket azaltmada
  tek statik kare, WebGL yoksa poster.
- E2E yeniden yazıldı (eski sürükleme/scrub testleri geçersizdi): 13 test.

### Doğrulama
- vitest 346/346 · playwright 200 geçti / 4 atlandı / 0 düştü · typecheck · lint · build

### Artık kullanılmayan (silme onay bekliyor)
- `src/lib/solar-popover.ts` (+ testi) — panel artık sabit konumlu.
- `src/lib/starfield.ts`, `src/lib/solar-motion.ts` — yalnız birbirlerini ve eski
  testleri besliyorlar; 2B sahnenin kalıntısı.
- `public/videos/mona-performance-20260907.mp4` (9.6 MB) — yerine 0.63 MB'lık
  `meet-the-crew-loop.mp4` geçti.
- `public/images/site/culture/meet-the-crew-poster.webp` — poster modundan kalma.

---

## Tur 5 — 19 Eylül 2026 (12 madde)

Kullanıcının ekran görüntüleriyle dikte ettiği revizyon listesi. Hepsi
uygulandı; ikisi ölçümle yeniden ele alındı (aşağıda).

### Yapılanlar

| # | İstek | Sonuç |
|---|---|---|
| 1 | Who We Are dairesi SARI olsun | `MeetTheCrewReveal` dairesi marka sarısı + sarı hale; medya `--open` .12→.46'da beliriyor |
| 2 | Gezegenler stilize / half-tone | Gezegen fragment shader'ına ekran uzaylı döndürülmüş nokta ızgarası (22°, yarıçap = √parlaklık); hücre boyu gezegenin ekran yarıçapına bağlı |
| 3 | Bisikletli adam scroll'da takılıyor | `ScrollScrubVideo` ilerlemesi "pass" modeline geçti: bölüm EKRANA GİRİNCE başlıyor, tepeye yapışınca değil. Bölüm 180svh→150svh |
| 4 | Ekosistemde ışık kesiliyor | Kanvas içi korona kısıldı, `.section::before` radyal ışıma başlığın ve alt bölümün arkasına taşıyor |
| 5 | "Az Laf Çok İş" sıkışık ve amatörce | Bölüm yeniden tasarlandı — aşağıda |
| 6 | What We Believe tasarım + sarı efekt + alttaki video | Sayfa yeniden kuruldu — aşağıda |
| 7 | Creative'deki 4 boş kutu | Dört temsili görsel + tarama çizgisi + scroll'a bağlı kadraj kayması; AI açıklaması eklendi |
| 8 | Çizim videoları akıcı değil + arkada gölge | Altı video all-intra yeniden kodlandı (97/97 anahtar kare); hayalet/`--draw` katmanı üç bileşenden kaldırıldı |
| 9 | What We Do uzun metinleri | İki punto kademesi (açılış display, gerisi gövde); `--text-muted` kaldırıldı (token'ın kendi kuralı prozda yasaklıyor); satır aralığı 1.45→1.6; metin sütunu genişletildi |
| 10 | Contact formu "bize özel" olsun | Form sıfırdan: numaralı alanlar, kutu yok, odakla dolan hairline, iri girdi puntosu, oklu gönder çubuğu. Sarı tema (ana sayfa bandı) korundu |
| 11 | Ana sayfa showreel videosu | 10 sn tek çekim üretildi; poster = videonun ilk karesi |
| 12 | Works hero'sundaki dönen video + top | Video kaldırıldı, yerine etkileşimli ağ; marka ident'i yeniden çekildi |

### Az Laf Çok İş — yeniden tasarım
Önceki kompozisyon müşterinin referans PDF'ine piksel piksel ölçülmüştü (üç
kademeli dar sütun, veriye gömülü `\n` satır kırılımları). Sıkışıklığın kaynağı
oydu: 1440px'te metin sütunu 633px, punto 21px, satırlar zorlanmış.

- Tam genişlik editoryal şeritler, üç sütun: **numara · açılış · gerisi**.
  (İki sütunla denendi: satırın sağ yarısı ~700px boş kalıyordu.)
- Numara içi boş kontur, satır üzerinde imleç gezerken doluyor + alttan sarı
  hairline soldan sağa akıyor.
- Metin hiyerarşisi `splitLead()` ile — kuralı ve **9 testi** `less-talk.ts`
  yanında; gerçek site metinlerinin ikisinde de iki kademe oluştuğu bağlandı.
- Başlık koreografisi kullanıcının tarifi: hairline'lar ekranın iki yanından
  girer (0→.42), ortada demet olur, yazı üstünde belirir (.34→.52), sonra demet
  dikeyde açılıp söner (.5→1). Hepsi `--progress`'ten türüyor.

### What We Believe — yeniden tasarım
- **Sarı efekt kalktı.** Yalnız duotone'u kapatmak YETMEDİ: eski sitenin
  sarı/zeytin filtresi KAYNAK dosyaların piksellerindeydi (`ataturk.jpg`
  ortalama R211 G203 B92). Görüntüler görünür luma'ya indirgendi → nötr
  siyah-beyaz.
- **Metin fotoğrafın üstünden indi.** Alttan yukarı koyulaşan perde kadrajın alt
  üçte birini yutuyordu ve okunaklılık her kadrajda yeniden doğrulanması gereken
  bir riskti. Metin artık görselin ALTINDA, siyah şeritte, üstünde sarı hairline.
- **Listeler yükseldi.** Vizyon/Misyon 14px Inter etiketleriydi — sayfanın en
  iddialı cümleleri en küçük puntodaydı. Artık numaralı display satırları;
  misyon maddelerindeki em-dash iki kademe veriyor (solu beyaz, sağı sarı).
- Alttaki temsili kurucu videosu KALDIRILDI (`BeliefFounderVideo` artık
  çağrılmıyor).

### Works hero — `TeamworkField`
Kullanıcı: *"öyle bir tasarım yaparsın ki ne videoya ne görsele gerek kalır…
noktalar ayrı ayrı yerlerdedir ama birbiriyle bağlantılıdır."*

- Canvas 2B ağ: düğümlerin EVİ var, yayla oraya çekiliyorlar; bağlar iki katmanlı
  (kalıcı iskelet + mesafeye göre beliren doku); imleç yakındakileri esnetiyor ve
  bağları sarıya çeviriyor; ara sıra bir düğüm ateşleniyor (fuşya sinyal).
- WebGL DEĞİL: sahne çizgi ve nokta, ayrıca WebGL sahne kilidi MONA ve ekosisteme
  ayrılmış.
- Yeniden boyutlandırmada ağ **oranlanıyor**, sıfırdan kurulmuyor — yoksa
  kaydırma çubuğu gelip gittiğinde kompozisyon sıçrıyordu.
- Çalışma durumu `data-running`/`data-motion` ile DOM'a yazılıyor; hareket
  azaltma testi pikselden değil oradan okuyor.
- Works sayfası artık hero videosu indirmiyor: **−1.9 MB**.

### Görsel üretim (Higgsfield)
`docs/design/WHAT_WE_DO_VISUAL_LANGUAGE.md`'deki bekleyen set çalıştırıldı.

- Sekiz hizmet görseli + Creative kontak baskısı için dört kare, **tek prompt
  ailesinden** (siyah baskın kadraj, tek pratik sarı ışık, tek fuşya gösterge,
  50mm f/2). Model `cinematic_studio_2_5`, 4K, 3:2.
- v3'ün marka sarısı **duotone'u kalktı**: birliği artık sahnenin kendisi kuruyor.
- Türevler `scripts/generate-service-photos-v4.mjs` ile 2400x1600 webp q82;
  **hiçbiri 200 KB'ı aşmıyor**, on iki dosya toplam 1188 KB.
- Marka ident'i (küre) yeniden çekildi: eski dosya 1280x720 / 344 kbps idi,
  parçacıklar seyrekti. Yeni: 1600x904 CRF28, 664 KB. WebM/VP9 (1.28 MB) ve AV1
  (845 KB) ölçüldü ve ikisi de H.264'ten BÜYÜK çıktı — parçacık alanı gürültü
  gibi davranıyor; tek kaynak H.264 bırakıldı.
- Ana sayfa showreel'i: 10 sn, AV1 722 KB / H.264 1280px 998 KB.

### Performans — ÖLÇÜLDÜ, bir madde AÇIK

Lighthouse mobil, `/tr`, Kaspersky enjeksiyonu engellenerek:

| Metrik | Değer | Bütçe | Durum |
|---|---|---|---|
| LCP | **4.3 sn** | < 2.5 sn | **GEÇMİYOR — ÖNCEDEN VAR OLAN** |
| CLS | 0 | < 0.1 | geçiyor |
| TBT | 60 ms | — | iyi |
| Toplam transfer | 1263 KiB | < 2 MB | geçiyor |

**LCP ihlali bu turdaki eklemelerden GELMİYOR** — showreel videosu kapatılıp
ölçüldü: 5.0 sn (videosuz) / 5.1 sn (videolu), yani video ~0.1 sn ekliyor.
Darboğaz ana iş parçacığı (FCP 2.1 sn). Ayrı bir iş olarak ele alınmalı.

Bu turda yapılan performans iyileştirmeleri: showreel indirmesi `load` sonrasına
ertelendi (LCP öğesi poster kalıyor), dosyalar küçültüldü → TBT 280→60 ms,
toplam transfer 1899→1263 KiB.

**Ölçüm uyarısı:** bu makinedeki Kaspersky web antivirüsü her HTTP sayfasına
180 KB'lık render-blocking script enjekte ediyor. Lighthouse'u
`--blocked-url-patterns="*kaspersky-labs.com*"` olmadan koşmak bütçe kontrolünü
anlamsız kılıyor.

### Doğrulama
- vitest **355/355** · playwright **204 geçti / 4 atlandı / 0 düştü** · typecheck
  temiz · lint temiz · build temiz.
- Sözleşmesi değişen 3 test güncellendi (kapanış videosu scroll modeli, What We
  Believe alt metinleri + kaldırılan video, showreel artık `<video>`).
- Yeni nöbetçiler: `e2e/work-teamwork-field.spec.ts` (4 test), Creative kontak
  baskısı testi güçlendirildi, `less-talk.test.ts` (9 test).

### Artık kullanılmayan (silme onay bekliyor — önceki listeye ek)
- `src/components/culture/BeliefFounderVideo.tsx` (+ CSS) — sayfadan kaldırıldı.
- `public/videos/hibrid-ident.webm` — tek kaynak H.264'e geçildi.
- `public/images/site/services/*-photo-v3.webp` ve `*-editorial-v2.webp` — v4
  seti devraldı.

---

## Tur 6 — 19 Eylül 2026 (5 madde + bir kök neden)

### Beklenmeyen bulgu: on bir görünmez başlık

Kullanıcı Friends sayfasındaki sarı kutuda "çok büyük bir boşluk" olduğunu
bildirdi. Boşluk sanılan şey **görünmeyen bir başlıktı**: "WORK WITH THE
CHAMPIONS" sarı zemin üzerinde SARI çiziliyordu, kontrast 1.00:1.

Kök neden sistemik — `globals.css`:
`h1, h2, h3 { color: var(--color-brand-yellow) }`. Sarı zeminli bir panel
başlık rengini ayrıca ezmezse başlık kayboluyor. Sitede 20'den fazla sarı
zeminli blok var, tek tek CSS okuyarak aramak güvenilir değildi.

`scripts/audit-contrast.mjs` yazıldı (DOM'dan hesaplanmış renkleri ölçer,
25 rota) ve **dört sayfada on bir tane** buldu, hepsi 1.00:1:

| Sayfa | Görünmeyen |
|---|---|
| /what-we-believe | "CULTURE IS WHAT WE PRACTISE" (101px) + altı değer başlığı |
| /culture/sustainability | "ZERO CARBON. FULL IMPACT." (96px) |
| /clients | "WORK WITH THE CHAMPIONS" (86px) |
| /what-we-do/ai-creative-production | "Neden Hibrid 360?" (72px) |

Çözüm tek tek yama değil: başlık rengi `var(--heading-color, …)` ile
dolaylandı ve sarı zeminli her yüzey `--heading-color`'ı bir kez eziyor.
Değişken kalıtsal olduğu için iç içe başlıklar da düzeliyor; siyah
zemindeki varsayılan değişmedi. Tarama artık **temiz**.

### 1 · Works hero — nöron ağı yeniden yazıldı
Kullanıcı: *"nokta nokta olacak şekilde, Mona'nın noktaları gibi... ışıklar
geçişli elektrik akımları, bilgi transferi yapılıyormuş gibi bir yerden bir
yere gitmeli... imleçten kaçan bir ışık sistemi olabilir."*

- Çizgi kalmadı: dendritler ve aksonlar **nokta zincirleri**, iki derece
  çatallanma ile tüy gibi açılıyor.
- Gövdeler ateşleniyor, sinyal akson boyunca yürüyor, vardığı gövdeyi
  ateşliyor — bilgi aktarımı birebir bu.
- **Etkileşim tersine çevrildi**: imlece yakın noktalar sönüyor, yeni
  sinyaller imlece yakın yolları düşük ağırlıkla seçiyor, imlecin alanına
  giren sinyal hızlanıp kaçıyor.
- Geometri ve sinyal kararları `teamwork-neurons.ts` içinde, **14 testle**.

### 2 · Ekosistem — dokulu gezegenler bırakıldı, parçacığa geçildi
Kullanıcı: *"hâlâ biraz amatör duruyor... ortada hibrit taşı dönmeye devam
etsin, etrafında noktacıklardan oluşan bir ekosistem, sanki Mona'nın
noktacıkları taşın etrafını sarmış gibi. 8 nokta daha belirgin, hepsi sarı,
birbirine ince çizgilerle bağlı."*

- Sekiz prosedürel doku + half-tone gölgelendirici **kaldırıldı**. Gerçek
  bir gezegeni taklit edip yarı yolda kalıyordu; "amatör" hissi oradandı.
- Yeni sahne sitenin kendi dilinde: 4.400 parçacıklık toz kabuğu, sekiz
  hizmet **parçacık kümesi**, aralarında on iki bağ çizgisi, merkezde
  dönen kristal.
- Odaklanınca küme toparlanıp parlıyor, diğerleri ve taş geri çekiliyor.
- Arayüz aynı bırakıldı (`resize/render/project/pick/dispose`), bu yüzden
  **Kepler yörüngeleri, kamera yaklaşması, panel, klavye erişimi ve 13
  e2e testi değişmedi**.
- Geometri `solar-dust.ts` içinde, **18 testle**.

### 3 · Friends — sarı panel
Görünmez başlık düzeldikten sonra panel yeniden kompoze edildi: üç çapa
(tarih · söz · sayı) ve aralarında ince çizgiler. Alt çapa sayfanın hemen
altındaki isim dizininin sayısı (**80 DOST**) — uydurma değil, dizine
verilen listenin uzunluğu; ikisi tek diziden besleniyor, ayrışamazlar.

### 4 · Partners — tipografi ve yapı
İÇERİK EKLENMEDİ, eklenemezdi: Marry Me Kitchen'ın onaylı açıklaması yok.
Arşivde de bu iki ortağa ait fotoğraf bulunamadı; alakasız bir arşiv karesi
koymak onu ortağın işiymiş gibi gösterirdi.

Değişen tasarım: sayfanın ağırlık merkezi **alıntı** oldu (editoryal serif,
tam genişlik), ortaklar numaralı bir dizine dönüştü (01 · 02), eksik
açıklama gizlenmek yerine sitenin standart "içerik hazırlanıyor" işaretiyle
duruyor.

### 5 · Marka ident'i — video kaldırıldı, sahne koda alındı
Kullanıcı: *"şu videoyu hâlâ anlayabilmiş değilim... kendini anlatan bir
şey koyabiliriz. Kalitesi düşük gibi."*

Sorun çözünürlük değil ANLAMDI — küreyi daha yüksek kalitede üretmek de
bir şey anlatmayacaktı. Bant artık parçacıkların **"HIBRID 360" yazdığı**
bir sahne: dağınıktan gelip toplanıyor, okunacak kadar duruyor, dağılıyor.
Kaydırmaya bağlı, zamana değil.

- Yoğunluk ölçülerek ayarlandı: örnekleme 3 → 5 (kare başına 9.110
  parçacık fazlaydı ve harfler dolu görünüyordu).
- Marka adı ekran okuyucuya metin olarak duruyor.

### Kaldırılan ağırlık (ölçüldü — hiçbiri artık istenmiyor)
| Varlık | Boyut |
|---|---|
| `hibrid-ident.mp4` + `.webm` | 878 KB |
| `public/images/site/solar/` (16 doku) | 336 KB |
| `hibrid-stone-loop` (Works hero, Tur 5) | ~1.9 MB |

### Doğrulama
- vitest **393/393** · playwright **207 geçti / 4 atlandı / 0 düştü** ·
  typecheck temiz · lint temiz · build temiz.
- `scripts/audit-contrast.mjs` **temiz** (25 rota).
- Yeni testler: `teamwork-neurons.test.ts` (14), `solar-dust.test.ts` (18),
  `brand-ident.test.ts` (6), `e2e/brand-ident.spec.ts` (3).
- Sözleşmesi değişen testler ölçümle yeniden ayarlandı: imleç tepkisi
  (parlama → sönme), ekosistem aydınlık oranı (dokulu disk → parçacık),
  odak yaklaşma oranı (3× → 2.2×), doku isteği (ertelenir → hiç yok).

### Ölçüm notu — iki tuzak
1. **`getImageData` bayat veri döndürüyor.** İmleç etkisi ekran
   görüntüsünde apaçık görünürken geri okuma üç ölçümde aynı sayıyı verdi
   (%0.2 fark). Canvas ölçümleri artık ekran görüntüsü + sharp ile.
2. **`test.use({ reducedMotion })` bu kurulumda çalışmıyor** — context'e
   hiç ulaşmıyor, yani "hareket azaltmada duruyor" testi sessizce hiçbir
   şey doğrulamıyordu. Depodaki diğer spec'ler gibi `page.emulateMedia`
   kullanılıyor.

### Artık kullanılmayan (silme onay bekliyor — önceki listeye ek)
- `src/lib/solar-scene.ts` (815 satır) — parçacık sahnesi devraldı.
- `public/images/site/solar/*.webp` (16 doku, 336 KB).
- `scripts/generate-planet-textures.mjs` — o dokuları üretiyordu.
- `public/videos/hibrid-ident.mp4` / `.webm` (878 KB).

---

## Tur 7 — 20 Eylül 2026 (Works sayfası, iki medya)

Kullanıcı hero için **öneri istedi**; üç yön sunuldu (yalnız eller · gerçek
set · siyah-beyaz ajans belgeseli) ve **gerçek set** seçildi.

### 1 · Hero — nöron ağı kalktı, ekip filmi geldi
Etkileşimli parçacık ağı (`TeamworkField`) kaldırıldı.

Yeni film ana sayfadaki showreel'den **bilinçli olarak ayrıldı**: showreel
ekibin ARKASINDAN ve geniş, kamera sete doğru ilerliyor; bu ise ekibin
İÇİNDEN ve yakın — odakçının eli lensin üstünde, operatör kamerada, ışıkçı
arkada. İki video aynı şeyi anlatmasın diye.

- 10 sn tek çekim, AV1 374 KB / H.264 1600px 772 KB.
- İndirme `load` sonrasına **ertelendi** (ana sayfada ölçülen LCP dersi:
  kadraja konan video kritik yola giriyor). Poster 67 KB.
- Hero artık başlığın altından başlıyor: sayfanın üst dolgusu geri alındı,
  kadrajın üstündeki ~145px siyah şerit kapandı.
- `filter: brightness(0.72)` + mevcut alt perde → sarı başlık her karede
  okunuyor (kontrast taraması temiz).

### 2 · Bant — parçacık yazısı kalktı, ekip fotoğrafı geldi
Parçacıkların "HIBRID 360" yazdığı sahne (`BrandIdent`) kaldırıldı.

Burası önce dönen bir parçacık küresi videosu, sonra o yazı sahnesiydi;
ikisi de MARKADAN söz ediyordu. Bant artık sayfanın KONUSUNDAN söz ediyor:
bir tasarım stüdyosunda birlikte çalışan ekip, siyah-beyaz, doğal ışık.

İlk üretim fazla kurumsaldı (uzun toplantı masası, "sigorta şirketi"
hissi) — kullanıcının tarifi "doğal ve samimi, lifestyle" olduğu için
ajans stüdyosu yönünde yeniden üretildi. 2400x1050 webp, 128 KB.
Alternatif kare hazır bekliyor.

### İkisi de AI ile üretildi ve sayfada AÇIKÇA öyle etiketli
Gerçek Hibrid 360 ekibini ya da gerçek bir çekimi göstermiyorlar. Gerçek
medya geldiğinde yalnızca `src/data/work-media.ts` değişir.

### Doğrulama
- vitest **393/393** · playwright **206 geçti / 4 atlandı / 0 düştü** ·
  typecheck · lint · build temiz · kontrast taraması temiz.
- 390px'te yatay taşma 0.
- Sözleşmesi tersine dönen 7 test yeniden yazıldı (hero: "canvas var,
  video yok" → "video var, canvas yok"; bant: parçacık sahnesi →
  fotoğraf), ertelenmiş yükleme ve hareket azaltma ayrıca bağlandı.

### Yeniden adlandırılacak (silme onayı bekliyor)
- `e2e/work-teamwork-field.spec.ts` → `work-hero.spec.ts`
- `e2e/brand-ident.spec.ts` → `work-team-band.spec.ts`

### Artık kullanılmayan (silme onayı bekliyor — önceki listeye ek)
- `src/components/work/TeamworkField.tsx` + `.module.css`
- `src/components/work/teamwork-neurons.ts` + testi
- `src/components/ui/BrandIdent.tsx` + `.module.css`
- `src/components/ui/brand-ident.ts` + testi

---

## Tur 8 — 20 Eylül 2026 (ekosistem geri alındı)

Kullanıcı Tur 6'daki ekosistem değişikliğini beğenmedi: *"ekosistem
düzenlemesini eski haline geri getireceğiz, bir türlü beğenemedim. Gezegen
list sistem olabilir, bundan bir önceki yaptığımız — onu geri getirelim.
Onun dışında diğer tüm yaptığım değişiklikler kalabilir, onlardan gayet
memnunum."*

Yalnız ekosistem geri alındı; Tur 6'nın diğer dört maddesi (görünmez
başlık düzeltmesi, Works nöron ağı, Friends paneli, Partners) ve Tur 7
(Works hero filmi + ekip bandı) OLDUĞU GİBİ kaldı.

### Ne yapıldı
Tur 6'da dokulu gezegen sahnesi (`solar-scene.ts`) hiç SİLİNMEMİŞTİ,
yalnız kullanımdan kaldırılmıştı (parçacık sahnesine geçilmişti). Geri
dönüş bu yüzden yeni üretim gerektirmedi — `SolarSystem.tsx` yeniden
`createSolarScene`/`SolarBodyDef` arayüzüne bağlandı:

- `bodyDefs()` geri geldi (sekiz gezegenin doku yolları).
- `focusDistance` çarpanı ×1.8'den kaldırıldı — dokulu gezegen kadraja
  tam oturan bir NESNE, parçacık kümesi gibi bir BULUT değil.
- e2e eşikleri (`litFraction`, odak yaklaşma oranı, doku isteği testi)
  Tur 6'da parçacık sahnesine göre yeniden kalibre edilmişti; hepsi
  dokulu gezegenin orijinal değerlerine döndü (litFraction eşiği 18→40,
  oran eşikleri 0.015/0.008/0.012→0.04/0.03/0.03, odak oranı 2.2×→3×,
  "medya hiç istenmiyor" → "yalnız görünür alana girince isteniyor").

Parçacık sahnesi dosyaları (`solar-dust.ts`, `solar-dust-scene.ts`,
testi) SİLİNMEDİ — kullanılmıyorlar ama duruyorlar, ileride tekrar
bakılmak istenirse hazır.

### Doğrulama
- `e2e/solar-system.spec.ts` tek başına: **13/13 geçti** (gevşetilmiş
  eşiklerle değil, dokulu sahnenin orijinal, daha sıkı eşikleriyle —
  yani bu gerçek bir geri dönüşün kanıtı, maskelenmiş bir gerileme değil).
- Ekran görüntüsüyle doğrulandı: half-tone dokulu gezegenler, yörünge
  halkaları, dönen kristal — kullanıcının referans görüntüsüyle birebir.
- Tam süit: vitest **393/393** · playwright **206 geçti / 4 atlandı /
  0 düştü** · typecheck temiz · lint temiz · build temiz.

### Artık kullanılmayan (silme onayı bekliyor — güncellendi)
Önceki tur bunu "kullanılmıyor, silinecek" diye işaretlemişti; artık
TERSİ doğru — `solar-scene.ts` AKTİF, parçacık sahnesi kullanılmıyor:
- `src/lib/solar-dust.ts` + `solar-dust.test.ts`
- `src/lib/solar-dust-scene.ts`

---

## 20 Eylül 2026 — Ekosistem yeniden tasarımı (dal: `feat/ecosystem-orbit`)

Kaynak: kullanıcı referansları 1.png (sahne), 2.png (odak modu + kart),
3.png (yeni HIBRID 360° kristal). Onaylanan kararlar: canlı Three.js sahnesi
(tembel yüklenir), kristal = Higgsfield sarkaç döngüsü (yazı hep okunur),
8 tıklanabilir sarı/pembe küre + beyaz/süs küreler, ses varsayılan kapalı +
düğme, mobilde aynı sahne + kalite kademesi. `N-###` HUD kodu süs amaçlı;
AI Creative Production kartında etiket yok (veri bilerek boş); eski sahne
dosyaları silinmez.

- [x] 1. Kristal üretimi (Higgsfield seedance_2_5, omni_reference, 8 sn) → ffmpeg ile döngü + poster (yazı bütün karelerde okunuyor, dikiş farkı 1,26 / medyan 1,00)
- [x] 2. Statik sahne (yörüngeler + küreler + kristal poster) — 1.png ile yan yana
- [x] 3. Hareket + kristal video (kristal bölgesi kare farkı 23,9: video oynuyor)
- [x] 4. Tıklama / odak / kart / HUD — 2.png ile yan yana
- [x] 5. Ses (ElevenLabs sfx + music; opt-in düğme; vokal yok: Scribe transkripti boş)
- [ ] 6. Erişilebilirlik, performans, mobil, e2e/birim test güncellemesi, code-reviewer + verifier (e2e tam süit + inceleme sürüyor)

Korunacak sözleşmeler: `ecosystem-stage` + data-motion/scene/running/focus,
`#ecosystem-detail` (role=dialog, h3, link), 8 büyük harfli buton adı,
`.point` sınıfı + `--ring`, duraklat düğmesi, reduced-motion tek kare,
WebGL yoksa poster, noscript bağlantıları, sahne kilidi.
Güncellenecek testler: `--ring` odak testi, `/images/site/solar/` doku testi,
`CRYSTAL_MEDIA` dosya adı birim testi.

### Bu turda öğrenilenler (ekosistem yeniden tasarımı)
- Yazılım GL'de (SwiftShader) tam ardıl işlem 0,3 fps: ekran görüntüsü tutarsızlığı
  ve e2e zaman aşımı yaratıyor. Çözüm: yazılım render'ı algılanınca `direct` mod
  (composer yok); tasarım karşılaştırması için `localStorage["hibrid360-eco-quality"]="high"`.
- Kare süresi sınırı 0,05 sn iken yavaş cihazda kamera hiç oturmuyordu → 0,2 sn.
- Özel `ShaderMaterial`larda `#include <colorspace_fragment>` şart: yoksa doğrudan
  çizimde renkler koyu (ardıl işlemde `OutputPass` dönüştürüyor, yani hata gizleniyor).
- Ekran dışına taşan küreye tıklanamaz: tıklanabilir küreler yalnız iç halkalarda
  (birim testle kilitli, negatif kontrolüyle).
- Tembel doku yüklemesi asenkron olunca hareket-azaltma tek karesi yeniden çizilmeli
  (yoksa kristal boş kalıyor).
- Higgsfield `seedance_2_5` başlangıç karesi için `mode: "omni_reference"` ister;
  Higgsfield `generate_audio` SFX üretmez (yalnız konuşma); Magnific bu kuruluşta kapalı;
  SFX/ambiyans için ElevenLabs `creative_generate_in_flow` (`sfx`: 1-2 sn sabit, `music`: 180 sn).

---

## 20 Eylül 2026 — Faz 1: müşteri incelemesinden çıkan hatalar + performans (dal: `fix/phase1-customer-review`)

Kaynak: müşteri Vercel'de siteyi inceledi; kullanıcı bildirdi. Analiz raporları: `scratchpad/audit/design/design-audit.md`, `scratchpad/audit/overlap/overlap-report.md`.
Kullanıcı kararları: sıra = Faz 1 (hatalar+performans) → Faz 2 (tasarım dili: What We Do dili tüm sayfalara, ana sayfa dahil; Think & Thank korunur; MONA yalnız seçili sayfalarda) → Faz 3 (What We Do görsel yenileme: 7 sayfa, Creative dahil, AI Creative hariç). Müşteri Mac kullanıyor; belirti: sahne açılmıyor, donma/kasma.

- [x] A. Başlık çakışması: Space Grotesk preload (YALNIZ What We Do bölümü: `what-we-do/layout.tsx`; kök layout'ta ana sayfa LCP'sini yarıştırıyordu), yedek font yüzü `size-adjust` %128 → %91 (tarayıcıda ölçüldü), `ch` → `em` (ServiceTitle, hub `.title`, `.typePoster`, AI `.intro h2` + manifesto), scramble kelime yuvası (`ScrambleLine`) + Q/rakam havuzdan çıktı. TR büyük harf satır aralığı ≥ 1.05 Faz 2'ye bırakıldı (yüklü hali değiştirir)
- [x] B1. Sürükleme: pointer capture (eşik sonrası, düğme tıklamaları bozulmasın), sürükleme alanı tüm bölüm, `buttons===0` koruması, bırakınca varsayılan kompozisyona yumuşak dönüş (gerçek zamanlı delta). e2e: takılı sürükleme, geri dönüş, başlık bölgesinden sürükleme
- [x] B2. Ses: ambiyans ~-22 LUFS (kazanç 0.32→0.8, limiter), açılış onay sesi, Web Audio yoksa `aria-disabled` + görünür etiket, iOS sessiz anahtarı (`audioSession` / sessiz WAV). Gerçek Safari/iPhone'da DENENMEDİ
- [x] B3. Performans/dayanıklılık: kademe merdiveni (high→medium→lite) + `gl.getError` doğrulaması, kare süresi EMA ile uyarlanabilir çözünürlük, MSAA yalnız high+DPR<1.5, bulanıklık 10 tap, sahne parçası+poster önden çekme, poster yer tutucu (sahne hazır olunca solar), bağlam kaybı/geri gelme, `?ecodebug` teşhis paneli, `deviceMemory<=4` → medium
- [x] C. Önbellek başlıkları (`next.config.mjs`): font 7 gün, video/ses/görsel 1 saat + SWR. Kısa tutuldu: müşteri incelemesi sürerken aynı adla değişen dosya (MONA sesi, showreel) günlerce eski kalmasın. `images.minimumCacheTTL` ARTIRILMADI (aynı bayat-dosya riski, kazanç küçük)
- [x] D. how-we-work TR çevirisi (`src/data/how-we-work.ts` → `Record<Locale,…>`, hero lead → `howWeWork.lead`), "belirlenecek" rozetleri kaldı, "NO BLACK BOX." İngilizce slogan. Çeviri MÜŞTERİ ONAYI BEKLİYOR. Birim test: iki dil yapı eşitliği
- [~] E. Doğrulama: birim + e2e + başlık matrisi TAMAM (aşağıya bak); canlı Vercel testi merge SONRASI (kullanıcı onayı bekleniyor)

**Sonuçlar (20 Eylül 2026)**
- Kapılar: `tsc`, `eslint . --max-warnings=0` (CI'daki `npm run lint`), `vitest` 422+ yeşil (yük altında `starfield` testi 5 sn sınırını aşıp bir kez düştü, tek başına 3,5 sn'de geçiyor — eskiden beri ağır test), üretim build'i temiz.
- e2e (üretim build'i): solar-system 24/24 (yeni: takılı sürükleme, varsayılana dönüş, başlık bölgesinden sürükleme, Web Audio yok, WebGL yok, ses inmezse tekrar dene), diğer 201 testten 197 geçti + 4 atlandı (Creative film testleri, eskiden beri koşullu atlanıyor), 0 düştü. `contact-form` bir koşuda yük altında düştü, tek başına 3/3 geçiyor (eskiden beri yük flake'i).
- Başlık matrisi (kendi dedektörüm, aynı araç ÖNCE/SONRA, chromium+webkit, 390/1440, TR+EN, font-bloklu/yavaş ağ/duruk): ortak 50 kombinasyonda başlık-başlık çakışması 6 → 0, kesilen başlık 3 → 0, satır içi çakışma 5 → 1 (kalan: AI sayfası TR h2 "PRODÜKSİYON ŞİRKETİ Mİ?" 390 px'te 6,6 px, satır aralığı .95 — Faz 2 #7). Creative CLS 0,147 (EN) / 0,110 (TR) → 0,001. Ajanın font-bloklu TR matrisi (hub + 8 sayfa × chromium/webkit × 390/1440): çakışan başlık çifti ~90 → 1, en büyük çakışma 20,2 px → 1,5 px, kesilen satır 8 sayfa → 0. Kalan geçici durum: scramble sürerken (ilk ~0,8 sn) geniş harf bir yan kelimeye 1-3 px değebilir (efektin doğası).
- `ch` → `em` yüklü hâlde birebir aynı genişlik (5 değer, fark 0 px, ölçüldü).
- Gerçek GPU (RTX 3060 Ti, DPR 2, 1440×900): kademe `high`, tampon 1821×1758, 6,9 ms/kare, hata yok. Playwright WebKit (yazılım render, ~160 ms/kare): sahne kuruldu, otomatik kalite 7 sn içinde ölçek 0,5 + bloom/bulanıklık kapalı + kare atlamaya indi, sürükleme/varsayılana dönüş çalıştı.
- Kod incelemesi (code-reviewer): 2 HIGH + 3 MEDIUM + 3 LOW düzeltildi — pinch-zoom (`touch-action: pan-y pinch-zoom`), tek başarısız indirmenin sesi kalıcı öldürmesi (yeni `error` durumu + "tekrar dene"), `ch` kutuları, boşa geçebilen sürükleme testleri (`headingZone` + `elementFromPoint`), bağlam kaybında boş kare döngüsü, InstancedMesh dispose, yarım kalan kurulum temizliği, teşhis paneli sabit hex. Bilerek bırakılan: bölümün tamamında `user-select: none` (sürükleme bölgesi tüm bölüm; `.detail` kartı seçilebilir).
- Lighthouse (mobil, benzetimli; yerel, 3'er koşu): kök layout'ta preload LCP ~4,38 sn, yalnız What We Do'da ~4,30 sn (her çiftte −80…−150 ms; transfer 1276 → 1265 KB). CI'da ana dal/önceki PR'lar 3,91–3,93 sn, ilk PR #12 koşusu 4,07 sn → preload kapsamı daraltıldı (`what-we-do/layout.tsx`). LCP bütçesi (≤ 2,5 sn) eskiden beri kırmızı, bu işten bağımsız.
- DOĞRULANMADI: müşterinin gerçek Mac'i, gerçek Safari/iPhone (ses), seslerin kulakla kalitesi, canlı Vercel (merge sonrası).


### Faz 2 taslağı (BAŞLAMADI — kullanıcı "tamam başla" demeden kod yok; önce plan onayı)

Hedef: What We Do "Service Chapter" dilini tüm sayfalara yay (ana sayfa dahil); Think & Thank'in krem/mint/pembe dünyası kasıtlı, korunur; MONA parçaları yalnız seçili sayfalarda. Kaynak: `scratchpad/audit/design/design-audit.md` (oturum geçici dizini — kaybolduysa yeniden çıkar; 31 TR rota, 124 ekran görüntüsü).

- [ ] 1. Tek display rolü: Space Grotesk 700, tracking 0, tek H1 ölçeği (`--chapter-display`) — bugün tek viewportta 12 farklı H1 puntosu (40 → 160 px)
- [ ] 2. H1 rengi: beyaz + tek sarı satır kuralı (18 sayfada düz sarı H1)
- [ ] 3. Kap/gutter: 41/20 px tam genişlik; 16 px, 36 px, 736 px ortalı, 672 px ortalı kapları kaldır
- [ ] 4. Hero grameri: meta satırı + derece + hairline; Work/Contact'ın medya heroları
- [ ] 5. Buton ailesi: tek PrimaryCta; MONA hapları, who-we-are hapı, Brief ghost butonu birleşir
- [ ] 6. Fuşya gövde metni (hub kırıntısı, Brief girişi) kalkar; fuşya yalnız araç (derece, numara, çizgi, odak)
- [ ] 7. TR büyük harf başlık satır aralığı ≥ 1.05 (`ai-creative-production/page.module.css:9` `.proof h2`, `ServiceChapter.module.css:95` `.details h2`): Faz 1'de yüklü hali değiştirmemek için bilerek DOKUNULMADI (390 px'te iki satır arası ~4,5 px dikey çakışma, harf mürekkebi çakışmıyor)
- [ ] 8. Legal/sustainability şablonu; token dışı hex'ler (`#070707`, `#080808`, `#151515`, `#101010`…) → CSS özel özellikleri
