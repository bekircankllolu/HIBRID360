# Yeni Site Görsel Yerleşim Planı

Kod değişikliği yok — bu sadece bir mapping/karar dokümanıdır. Kaynaklar:
`OLD_SITE_VISUAL_MAP.md`, `ASSET_SELECTION_REPORT.md`, mevcut kod
(`src/data/site-images.ts`, `src/components/hero/SolarSystem.tsx`,
`src/data/solar-system.ts`), `docs/DECISIONS.md`, `docs/brief-rev12.md`.

**Kural (kullanıcı talimatı):** Sahte müşteri, sahte vaka, sahte video
üretilmiyor. Bir görsel gerçek bir müşteriye/işe ait görünüyorsa bu
doküman bunu **"doğrulanmalı"** olarak işaretler, "kullan" demez —
onay BLOCKERS.md'ye bağlıdır.

---

## /tr ana sayfa

Mevcut bileşen sırası (`src/app/[locale]/page.tsx` yorumundan):
Hero → MakeBrandBand → SolarSystem → ClosingBand → ...

| Bölüm | Şu an | Karar |
|---|---|---|
| Hero | Video loop (mevcut, korunuyor — CLAUDE.md #1) | Değişiklik yok. Video loop zaten prodüksiyon onaylı. |
| MakeBrandBand | `make-brand.webp` (kamera+boom mic, eski siteyle aynı) | Koru. İyileştirme fırsatı: brief video/hareketli versiyon öneriyor ama statik foto da kabul edilebilir kalitede. |
| SolarSystem (kristal) | `stone-yellow.webp` / `stone-fuchsia.webp` | Aşağıdaki "Kristal / İnteraktif Sistem" bölümüne bakın — bu zaten tam çalışır durumda, yeni görsel gerekmiyor. |
| ClosingBand | `closing-bicycle.webp` | Koru — telif riskli E.T. siluetinin yerine geçen güvenli seçim. İsteğe bağlı iyileştirme: BLOCKERS.md'de not edilen "gece/siluet" fikrinin özgün üretimi. |
| MONA (kısa sürüm) | Yok — brief 11.5 "ana sayfa kısa sürüm" henüz kodda değil | Görsel/video varlığı olmadan eklenemez; BLOCKERS.md. |

Client'ın 119 görsellik arşivinden ana sayfaya **doğrudan aday yok** —
ana sayfa zaten kendi (yeni üretilmiş/webp) görselleriyle kurulu ve bu
görseller client dump'ından daha güçlü. Ana sayfaya ekleme yapılacaksa
tek aday: `ASSET_SELECTION_REPORT.md`'de "Hero / marka atmosferi"
kategorisine giren, markaya uygun (fuşya/sarı/siyah tonlarında,
jenerik-olmayan) bir görsel varsa — raporun sonuçlarına bakılacak.

---

## /tr/what-we-do servis grid'i ve alt sayfalar

`src/data/site-images.ts` → `siteImages.services.*` her servisin **hem
hub grid kartı hem de kendi alt sayfasının hero görseli** olarak aynı
dosyayı kullanıyor (tek kaynak, iki kullanım yeri).

| Servis | Şu anki görsel | Karar |
|---|---|---|
| Production | `production.webp` | **Koru** — güçlü, markaya uygun. |
| Post Production | `post-production.webp` | **Koru** — profesyonel, net. |
| Live Broadcast | `live-broadcast.webp` | **Koru** — amaca uygun. |
| Cloud TV | `cloud-tv.webp` | **Koru** — amaca uygun. |
| Event Management | `event-management.webp` | **Koru** — kendi çekimleri (logo izi var), en güçlü aday. |
| **Creative** | `creative.webp` (ampul stok görseli) | **Değiştir.** Öncelik: `docs/DECISIONS.md` #7'de zaten karara bağlanmış toz-pembe zemin + siyah başlık + fuşya vurgu + pullu/parıltılı doku uygulanmalı (brief Bölüm 9 referans görseli — Hibrid'in kendi tasarımı, disko topu kafalı figür). Bu bir **üretim işi** (CSS gradient/doku + tasarım), client'ın foto arşivinde birebir karşılığı yok. Geçici/ikincil aday: `ASSET_SELECTION_REPORT.md`'deki CREATIVE klasörü sonuçlarına bakın — sequin/parıltı dokusuna yakın bir şey çıkarsa köprü çözüm olabilir. |
| **Digital** | `digital.webp` (3D emoji/telefon render) | **Değiştir — düşük öncelik.** Client arşivinde net bir alternatif yok (arşiv ağırlıklı prodüksiyon/stüdyo fotoğrafı, "digital/sosyal medya" temalı görsel neredeyse yok — bkz. ASSET_SELECTION_REPORT.md). Gerçekçi çözüm: yeni bir stok/üretim görseli aranmalı ya da CGI/motion-graphics odaklı bir kare (brief'in Digital hizmet listesindeki "CGI & 3D", "Motion & Animation" ile örtüşen) prodüksiyon ekibinden istenmeli. |
| Photography | `photography.webp` (dar okunan event/kırmızı halı sahnesi) | **Gözden geçir — orta öncelik.** Yerine daha genel bir "fotoğrafçılık" hissi (stüdyo ekipmanı, çekim anı, ürün/portre çeşitliliği) veren bir kare tercih edilmeli. Client arşivinde stüdyo/prodüksiyon fotoğrafları var (özellikle "HİBRİD WEB SAYFASI GÖRSEL 2" klasörü) — ASSET_SELECTION_REPORT.md'deki adaylara bakın. |

---

## /tr/work

Gerçek iş envanteri gelene kadar (`docs/DECISIONS.md` #16 — açık
blocker) kullanılabilecekler:

1. **Mevcut placeholder (`story-clapper.webp`)** — dürüst, marka
   renklerinde, sahte iddia yok. **Bu kalabilir**, envanter gelene kadar
   en güvenli seçenek.
2. **Renova billboard mockup** (eski Solutions sayfasının flagship
   görseli, client dump'ında da var) — **gerçek, yayınlanmış bir iş**
   (eski `hibrid360.com/clients` listesinde Renova adı geçiyor, eski
   sitenin kendisi bu görseli ana "what we do" hero'sunda kullanmış).
   Tek başına bir "vaka" grid kartı olarak eklenebilir **ANCAK** kullanım
   izni ve güncelliği (kampanya hâlâ Hibrid'e mi ait, müşteri onayı var
   mı) doğrulanmadan eklenmemeli — bkz. BLOCKERS.md.
3. Diğer client-dump görselleri **"Work / case kullanılabilir adaylar"**
   kategorisine düşenler için: `ASSET_SELECTION_REPORT.md`'ye bakın —
   ama bunlar gerçek bir müşteri/iş adıyla eşleşmedikçe (görselin
   içinde marka/logo görünmedikçe) **"work" olarak sunulamaz**, en
   fazla "Culture" veya "Hero" amaçlı kullanılabilir.

---

## /tr/what-we-do/production ve diğer servis detayları — hero görseli

Yukarıdaki tabloyla aynı (her servisin hub kartı = kendi sayfasının
hero'su, `siteImages.services.*` tek kaynak). Ayrı bir "detay sayfası
hero'su" ihtiyacı yok, mimari zaten birleşik.

---

## Contact / Culture / Friends için görsel gerekir mi?

- **Contact:** Hayır (bkz. OLD_SITE_VISUAL_MAP.md #6) — form-ağırlıklı
  kalmalı, fotoğraf şart değil.
- **Culture (Who We Are / What We Believe / Directors & Crew /
  Partners):** Kısmen evet.
  - Who We Are: brief "AI ile konuşan kurucu videosu" istiyor — bu bir
    video prodüksiyonu, foto arşivinden çözülmez.
  - Directors & Crew: **Fotoğraf çekimi gerekiyor** (`docs/DECISIONS.md`
    #14 zaten AÇIK) — client dump'ında ekip/kurucu portresi yok, gerçek
    kişi fotoğrafı olmadan bu sayfa doldurulamaz.
  - What We Believe: eski sitede `ataturk.jpg`, `little_prince.png`,
    `kadin.jpg` gibi editoryal/ilham görselleri kullanılıyordu (manifesto
    metniyle eşleşen alıntı görselleri). Yeni sitede bu görseller yok;
    gerekirse benzer editoryal görseller aranmalı, client dump'ında
    doğrudan karşılığı yok.
  - Partners: Studio Food Room eklenecek, Motive çıkacak (CLAUDE.md #5)
    — bu bir **logo/isim listesi** işi, fotoğraf değil.
- **Friends (eski Clients):** Eski sitede zaten logo yoktu (düz metin
  liste). Yeni sitede de görsel şart değil ama **fırsat**: müşteri
  logoları eklenebilirse (BLOCKERS.md'de not edildi) sayfa güçlenir.

---

## Kristal / İnteraktif Sistem — Art Direction Notu

**Önemli çerçeve düzeltmesi:** Bu bir "yeni fikir" değil — sistem
**zaten tam olarak kodda mevcut ve çalışıyor**
(`src/components/hero/SolarSystem.tsx` + `src/data/solar-system.ts`,
ana sayfada `<SolarSystem />` olarak render ediliyor). Aşağıdaki
sorulara **mevcut implementasyon** üzerinden cevap veriliyor; karar
zaten verilmiş, geriye kalan asset/iyileştirme boşlukları ayrıca
işaretlendi.

| Soru | Mevcut cevap (kodda uygulanmış) |
|---|---|
| Ortadaki büyük sarı kristal neyi temsil ediyor? | Hibrid 360'ın kendisi — "One Hybrid Production Ecosystem." sloganıyla merkez güneş/çekirdek. Tüm hizmetler bunun etrafında döner. |
| Etrafındaki noktalar hangi servisleri temsil ediyor? | Tam 8 nokta, tam 8 servise 1:1 bağlı: Production, Digital, Creative, AI Creative Production, Live Broadcast, Photography, Post Production, Event Management — hepsi gerçek `/what-we-do/*` sayfalarına link veriyor (placeholder yok, `ready: true`). |
| Noktaya tıklayınca ne açılıyor? | Noktanın yanında kompakt bir detay kartı — `whatWeDo.list` çevirisinden gelen gerçek başlık+açıklama (next-intl, TR/EN), "detaya git" linkiyle ilgili sayfaya gidiyor. Uydurma metin yok. |
| Ana sayfada mı, What We Do'da mı? | Sadece **ana sayfada**. What We Do hub sayfasında tekrar edilmiyor (kasıtlı — aynı bileşenin iki yerde render edilmesi CLAUDE.md'nin "aynı anda en fazla bir WebGL/hareket sahnesi" kuralına ve performans bütçesine aykırı düşebilirdi). |
| Görsel stil: gerçekçi kristal mi, 3D render mı, WebGL mi, statik + hotspot mu? | **Statik görsel + CSS/JS animasyon** — WebGL **değil** (bilinçli tercih, kod yorumu: "WebGL yok, kilit gerekmez"). İki adet düşük-poligonlu, AI ile üretilmiş taş görseli (`stone-yellow.webp`, `stone-fuchsia.webp`) 4 eliptik yörüngede `requestAnimationFrame` ile döndürülüyor; derinlik hissi CSS transform (scale/opacity/z-index) ile veriliyor. `prefers-reduced-motion`'da döngü hiç kurulmuyor, noktalar sabit duruyor (erişilebilirlik uyumlu). |

**Bilinen asset boşluğu (yeni bulgu değil, kod yorumunda zaten
belgelenmiş):** Müşteriden teslim edilen orijinal taş paketinde
("hibrid360_hibridtaslar") her taşın üstünde **baskılı** alt başlık
vardı (ör. "KREATİF", "MEDYA PLANLAMA & SATIN ALMA") ve bu başlık renk
varyantına bağlıydı — sonuç olarak 8 taşın 6'sı **yanlış hizmeti
gösteriyordu**. Çözüm olarak görseller gem sınırına kırpılıp baskılı
metin atıldı, etiketler artık sadece koddan (çeviri metninden) geliyor.
Bu doğru bir düzeltme. **Açık soru (müşteriye sorulmalı):** Sistem hep
2 renk (sarı/fuşya) arasında dönen tek bir taş şekliyle mi kalacak, yoksa
her servise **görsel olarak da ayrı, doğru etiketli** 8 farklı taş
üretilecek mi? İkincisi daha "premium" hissettirir ama yeni bir
prodüksiyon/AI-üretim turu gerektirir — bkz. BLOCKERS.md.

**MONA bölümü için not:** Kullanıcının "MONA için mevcut placeholder
yerine daha premium bir asset var mı?" sorusuna dürüst cevap: **mevcut
bir placeholder yok** — `Mona.tsx` şu an tamamen metin/state-machine,
görsel/video sıfır (`TODO: brief 11.6`). Client'ın 119 görsellik
arşivinde MONA'ya (eski Mac kafalı, deniz kızı kostümlü karakter) hiçbir
şekilde karşılık gelen bir görsel yok — bu beklenen bir durum, MONA özel
bir illüstrasyon/3D/video prodüksiyonu gerektiriyor, stok/arşiv
fotoğrafla çözülemez. Bkz. BLOCKERS.md.

---

## Performans İçin Asset Hazırlık Listesi

Genel kural (CLAUDE.md performans bütçesi — sözleşme maddesi): LCP
(mobil) < 2.5s, ilk yükleme < 2MB (video hariç), WebP/AVIF + srcset +
lazy loading, aynı anda tek WebGL sahnesi.

| Görsel | Format | Desktop genişlik | Mobile crop | Yükleme önceliği | Not |
|---|---|---|---|---|---|
| Hero video loop (ana sayfa) | AV1/WebM, poster kare | — | 9:16 kırpma önerilir | `preload="none"`, görünür alana girince yükle | Zaten kural CLAUDE.md'de var, uygulanmalı |
| `make-brand.webp` | WebP (mevcut) | ~1920px | 4:5 kırpma (yatay detay kırpılır) | **priority** (above-the-fold) | Dosya zaten optimize (43KB) |
| `stone-yellow.webp` / `stone-fuchsia.webp` | WebP (mevcut) | intrinsic 319×294 / 255×243 | Değişmez (sabit boyut, ölçeklenir) | priority (ana sayfa above-the-fold) | Zaten küçük (10-27KB), CLS önlemek için intrinsic width/height kodda tanımlı — koru |
| `closing-bicycle.webp` | WebP (mevcut) | ~1920px | 1:1 veya 4:5 kırpma | lazy | Sayfa altında, lazy uygun |
| `story-clapper.webp` (/work) | WebP (mevcut) | ~1920px | 4:5 | lazy (fold altında) | — |
| 8× servis görseli (`production.webp` vb.) | WebP (mevcut) | ~1920px hero + ~600px grid thumbnail (iki boyut — srcset) | 16:9 hero / 1:1 grid kartı | Hub sayfasında lazy (8 kart aynı anda), servis detay sayfasında priority | Şu an tek boyut kaydedilmiş (60-210KB) — **srcset ile küçük grid-kart versiyonu eklenmeli**, aksi halde hub sayfası 8× tam-boyut görsel indiriyor |
| Client dump'ından seçilecek yeni görseller (`HİBRİD WEB SAYFASI GÖRSEL 2` vb.) | **Kritik**: kaynaklar 8-45MB PNG, 7680×4320 (8K) | Web için 1920-2560px'e indirilmeli | Kullanım yerine göre | — | ASSET_SELECTION_REPORT.md'de "web için kullanılabilir mi: evet" işaretli her görsel **mutlaka** WebP/AVIF'e sıkıştırılıp yeniden boyutlandırılmadan commit edilmemeli — orijinal dosya boyutları performans bütçesini tek başına yer götürür (bir tanesi bile 2MB bütçeyi aşar) |
| Renova billboard (kullanılırsa) | Kaynak PNG büyük | ~1600px (work grid kartı) | 4:3 veya 16:9 | lazy | İzin teyidinden sonra |

**En kritik olanlar (LCP'yi doğrudan etkiler):** Ana sayfa hero video/
poster, `make-brand.webp`, `stone-yellow/fuchsia.webp` — bunlar
above-the-fold ve `priority` olmalı. Geri kalan her şey lazy.

**En ağır olup optimize edilmesi gerekenler:** Client dump'ındaki
"HİBRİD WEB SAYFASI GÖRSEL 2" klasöründeki tüm dosyalar (8-45MB PNG) —
bunlardan biri seçilip kullanılırsa web'e konmadan önce mutlaka
sıkıştırma/yeniden boyutlandırma yapılmalı.
