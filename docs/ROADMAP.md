# Faz Planı — Hibrid 360 Web Sitesi

Brief'in kendi Bölüm 20.12 faz tablosuyla uyumludur. Her faz Claude Code'a
ayrı bir oturumda/prompt olarak verilebilir.

## Faz 0 — İskelet kurulumu (bugün başlanabilir, karar beklemez)

- [ ] Next.js 14 + TypeScript proje kurulumu
- [ ] Vercel canlı deploy hattı (mevcut canlı URL: `https://hibrid-360.vercel.app/tr`)
- [ ] Cloudflare Workers deploy hattı (opsiyonel / önceki plan, `@opennextjs/cloudflare`)
- [ ] Supabase proje kurulumu + `docs/supabase-schema.sql` migration'ı çalıştır
- [ ] i18n routing iskeleti (`/tr`, `/en`), hreflang meta yapısı
- [ ] Design token sistemi: CSS custom properties (renkler, tipografi, spacing)
- [ ] Layout iskeleti: header (menü + dil seçici), footer (yasal linkler + sosyal ikonlar)
- [x] Eski site görsel setinden seçilmiş statik WebP görsellerinin ana sayfa,
      Work bekleme alanı ve servis sayfalarına yerleştirilmesi
- [ ] Performans bütçesi CI kontrolü (Lighthouse CI, LCP/CLS eşiği)

**Çıktı:** Boş ama canlıda çalışan, doğru routing'e ve doğru marka sistemine
sahip bir iskelet. Hiçbir gerçek içerik yok, ama teknik temel hazır.

## Faz 1 — SEO/GEO altyapısı + Insights (en hızlı getiri, tasarım beklemez)

- [ ] schema.org yapılandırılmış veri (Organization, LocalBusiness, VideoObject, BreadcrumbList)
- [ ] sitemap.xml, robots.txt, llms.txt
- [ ] Insights sayfası + ilk 2 yazı (brief Bölüm 20.6'daki 6 konudan)
- [ ] Google Business Profile açılış/güncelleme (yazılım dışı görev — pazarlama tarafı)
- [ ] Meta description temizliği (keyword stuffing kaldırılacak)

**Blocker yok** — DECISIONS.md'deki kararlardan bağımsız ilerler.

## Faz 2 — Works + Directors & Crew + müşteri sözleri

- [ ] **Blocker: Works içerik envanteri** (DECISIONS.md #16) — iş adı, müşteri, yıl, format, yayın izni, dosya/video/görsel konumu ve vaka sayfası kararı gelmeden grid yayınlanamaz
- [ ] **Blocker: Directors & Crew kadrosu + çekim tarihi** (DECISIONS.md #14)
- [ ] Works sayfası: Recent Works, yıl bazlı arşiv, iş envanteri grid
- [ ] Vaka sayfası şablonu (Sorun/Çözüm/Sonuç/Kanıt) — Supabase `works` tablosundan besleniyor
- [ ] Directors & Crew sayfası + profil detay sayfaları
- [ ] Müşteri sözü toplama (video + yazılı) — hedef: 3 video, 6 yazılı, yayın öncesi
- [ ] plug-ad.co yönlendirmesinin kaldırılması, Works'e bağlanması

## Faz 3 — Service Production (International) + How We Work

- [ ] Service Production sayfası (EN öncelikli, brief'te metin hazır — Bölüm 20.4)
- [ ] **Blocker: How We Work bütçe bandı rakamları** (DECISIONS.md #15) — ticari karar
- [ ] Kanıt satırı: hangi ülkelerden hangi yapımlara hizmet verildi (mevcut portföyden derlenir)

## Faz 4 — MONA + Brief Builder

**En karmaşık faz — prodüksiyon + geliştirme paralel yürümeli.**

- [ ] **Blocker: MONA ses kararı** (DECISIONS.md #8) — en erken kapatılması gereken karar
- [ ] MONA karakter sheet üretimi (sabit kostüm/ışık/ekran — Nano Banana 2 ile)
- [ ] MONA video loop (WebM VP9+alfa + MP4 yedek)
- [ ] 10 soru + easter egg + idle + geri dönüş repliklerinin TR/EN seslendirmesi
- [ ] VTT altyazı dosyaları (TR+EN)
- [ ] Frontend state machine: sessiz açılış → tıklama → konuşma → scroll'da fade out → idle döngüsü
- [ ] Ana sayfadaki kısa MONA sürümü (2 replik)
- [ ] Brief Builder: 6 soruluk form (Supabase `brief_submissions` tablosu), MONA konuşarak sorar
- [ ] `prefers-reduced-motion` desteği: MONA döngüsü durur, yalnızca yazı akar

**Not:** Frontend state machine'i gerçek video/ses varlıkları hazır olmadan
mock veri ile kurmak mümkün — prodüksiyonu beklemeden başlanabilir.

## Faz 5 — Hero WebGL tipografi + güneş sistemi (en pahalı, en riskli — en son)

- [ ] **Blocker: İmleç seçeneği** (DECISIONS.md #3)
- [ ] Hero "HIBRID" tipografisi: SVG maske + video dolgu + shader parıltı + elastik fare tepkisi
- [ ] Hareketli tipografinin video dışa aktarımı (ProRes 4444 + alfa — video kapak logosu için)
- [ ] Güneş sistemi / Hibrid taşları animasyonu (WebGL, 8 yörünge, tıklanabilir)
- [ ] Custom cursor (fuşya, seçilen seçeneğe göre)
- [ ] Dönüşümlü slogan bloğu (3 slogan, döngüsel, scroll'da durur)

**Performans kontrolü bu fazda kritik** — aynı anda tek WebGL sahnesi kuralı
burada test edilir. Faz 5 canlıya çıkmadan önce Lighthouse mobile skoru
gözden geçirilmeli.

## Faz 6 — Hukuki ve kurumsal kapanış

- [ ] Privacy Policy, Cookie Policy (+ onay bandı), KVKK/GDPR aydınlatma
- [ ] 404 sayfası (marka diliyle)
- [ ] AI Usage & Rights — **hukuk danışmanı girdisi gerekiyor**
- [ ] Accessibility Statement — bilinen sınırlamalar dürüstçe listelenecek
- [ ] Sustainability — **ölçüm + sertifika olmadan yayınlanamaz** (karbon nötr rozeti bu sayfaya bağlı)
- [ ] Analytics kurulumu (GA4 veya Plausible, consent mode'a bağlı)

## Faz sırası neden bu şekilde?

Brief'in kendi notu: "kadro ve müşteri sözü olmadan yayına giren bir site,
en iyi ihtimalle güzel görünen bir prodüksiyon sitesi olur." Bu yüzden kanıt
katmanı (Faz 2) gösteri katmanından (Faz 5) önce geliyor — ziyaretçiyi ikna
edecek şey önce hazır olmalı, göz alıcı hero en son eklenen katman olmalı.
