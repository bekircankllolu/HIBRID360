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
