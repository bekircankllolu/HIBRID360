# Next.js 15 Upgrade — Kapanış Raporu

**Branch:** `claude/next-15-upgrade` · **Commit:** `b449170` · **Tarih:** 2026-08-26
**Karar: PR/merge adayı — ana branch'e alınabilir.** Upgrade kaynaklı
kırılma bulunamadı.

Local çalışma ağacı `origin/claude/next-15-upgrade` ile birebir aynı
(diff boş, working tree temiz) — bu rapor uzaktaki branch'i de kapsıyor.

---

## 1. Doğrulama sonuçları

| Kapı | Komut | Sonuç |
|---|---|---|
| Kurulum | `npm install` | ✅ 922 paket, hata yok |
| Lint | `npm run lint` | ✅ 0 uyarı / 0 hata |
| Type check | `npm run typecheck` | ✅ temiz |
| Birim test | `npm run test` | ✅ 31/31 (3 dosya) |
| Build | `npm run build` | ✅ 66 statik sayfa, uyarı yok |
| E2E | `npx playwright test` | ✅ 77/77 (36 sn) |

Build çıktısı: paylaşılan First Load JS **103 kB**, en ağır sayfa `/[locale]`
147 kB, middleware 52.4 kB. Performans bütçesindeki 2 MB ilk yükleme
sınırının çok altında.

## 2. Rota kontrolü (üretim sunucusu, `next start`)

| Rota | Beklenen | Sonuç |
|---|---|---|
| `/` | 307 → `/tr` | ✅ 307 → `/tr` |
| `/` + `Accept-Language: en-US` | 307 → `/en` | ✅ 307 → `/en` |
| `/tr` · `/en` | 200 | ✅ |
| `/tr/work` · `/en/work` | 200 | ✅ |
| `/tr/what-we-do` | 200 | ✅ |
| `/tr/contact` | 200 | ✅ |
| `/tr/culture` · `/tr/insights` · `/tr/brief` | 200 | ✅ |
| `/robots.txt` · `/sitemap.xml` | 200 | ✅ |
| `/tr/olmayan-sayfa` | 404 | ✅ |
| `/icon.svg` (middleware bypass) | 200 | ✅ |

## 3. Next 15 kırılma yüzeyleri — tek tek tarandı

| Alan | Next 15'te ne değişti | Bu kod tabanındaki durum |
|---|---|---|
| **Async request API** | `params` / `searchParams` artık Promise | ✅ Kod zaten `await params` kullanıyordu; tüm `generateMetadata` ve sayfa fonksiyonları uyumlu |
| **`cookies()` / `headers()` / `draftMode()`** | Async oldu | ✅ Kod tabanında hiç kullanılmıyor |
| **`fetch` varsayılan önbelleği** | `force-cache` → `no-store` | ✅ Etkisiz — kod tabanında hiç `fetch` yok; tüm içerik `src/data/*` modüllerinden statik geliyor, Supabase sorguları `@supabase/supabase-js` üzerinden |
| **GET Route Handler önbelleği** | Varsayılan olarak önbelleklenmiyor | ✅ Etkisiz — hiç route handler yok |
| **Client Router Cache `staleTime: 0`** | Sayfa segmentleri artık yeniden çekiliyor | ✅ Etkisiz — tüm rotalar SSG, dinamik veri yok |
| **Server Actions** | Şifreli/kısa ömürlü action ID | ✅ `src/lib/submissions.ts` (`"use server"`) çalışıyor; e2e "geçerli veri + onayla gönderim" testi geçiyor |
| **`next/image`** | Varsayılan davranış korundu | ✅ Optimizer 200 dönüyor (`/_next/image?...w=828` → `image/png`, 3.5 kB); srcset üretimi normal |
| **Middleware** | Değişiklik yok | ✅ `next-intl/middleware` locale tespiti + prefix yönlendirmesi doğru; statik dosya matcher'ı bypass ediyor |
| **`next-intl` 3.26.5** | Next 15 destekli | ✅ `routing` / `request.ts` / `navigation.ts` sorunsuz; dil değiştirici e2e testi geçiyor |
| **`next lint`** | Next 16'da kaldırılacak | ⚠️ Sadece **deprecation uyarısı** — bugün çalışıyor, kırılma yok (bkz. §5) |

## 4. Upgrade ile birlikte gelen yapılandırma değişiklikleri (doğrulandı)

- **`next.config.mjs` → `outputFileTracingRoot`**: Next 15 birden fazla
  lockfile görünce workspace kökünü tahmin ediyordu ve bu makinede ev
  dizinindeki alakasız bir `package-lock.json`'ı seçiyordu. Kök sabitlendi.
  Cloudflare/`standalone` çıktısı doğrudan buna bağlı — bu satır silinmemeli.
- **`playwright.config.ts` → e2e artık üretim build'ine karşı koşuyor.**
  Doğrulandı: 77/77 geçiyor, 36 saniye.
- **`@opennextjs/cloudflare` 1.15.0 → 1.20.2**: `next >= 15.5.21` peer'i
  istediği için upgrade'e kilitliydi. **Not:** Bu raporda Cloudflare
  deploy'u (`npm run cf:build` / `preview`) çalıştırılmadı — merge öncesi
  bir kez `npm run preview` ile doğrulanması önerilir. Bu, upgrade'in
  bilinen tek doğrulanmamış yüzeyi.

## 5. Merge sonrası açık kalan maddeler (upgrade'i bloke etmiyor)

1. **`next lint` deprecation** — Next 16'ya geçmeden önce
   `npx @next/codemod@canary next-lint-to-eslint-cli .` ile ESLint CLI'ya
   taşınmalı. Bugün çalışıyor, sadece uyarı basıyor.
2. **`npm audit`: 13 açık (0 kritik, 8 high)** — hepsi dev-only
   (`lhci`/lighthouse zinciri). Üretim bağımlılıklarında açık yok.
3. **Cloudflare preview doğrulaması** (yukarıda §4).

## 6. Upgrade dışı bulgu — merge'i bloke etmiyor, ayrı iş

Doğrulama sırasında **hreflang etiketlerinin hiçbir sayfada üretilmediği**
tespit edildi. `curl` ile `/tr` ve `/en/work` çıktısında
`<link rel="alternate" hreflang="...">` yok; yalnızca `canonical` var.

**Kök neden:** `src/app/[locale]/layout.tsx:46` `alternates.languages`'ı
doğru tanımlıyor, ama her sayfanın kendi `generateMetadata`'sı
`alternates: { canonical: ... }` döndürüyor. Next.js metadata birleştirmesi
**sığdır** — sayfanın `alternates` nesnesi layout'unkinin tamamının yerine
geçiyor, `languages` düşüyor.

**Bu bir Next 15 regresyonu değil:** metadata sığ birleştirme semantiği App
Router'da 13'ten beri aynı; upgrade bu davranışı değiştirmedi. Bu yüzden
upgrade branch'ine karıştırılmadı — ayrı bir düzeltme olarak açılmalı.

**Etkisi:** CLAUDE.md "hreflang etiketleri zorunlu" diyor. Arama motorları
TR/EN sürümleri eş sayfa olarak eşleştiremiyor — SEO/GEO omurgasında
gerçek bir eksik.

**Düzeltme yönü:** her sayfanın `alternates` bloğuna `languages`'ı da
eklemek yerine, tek bir yardımcı (`buildAlternates(locale, path)`) yazılıp
tüm `generateMetadata`'larda kullanılması — 25+ sayfada aynı hatanın
tekrarlanmasını önler.
