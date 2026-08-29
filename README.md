# Hibrid 360 — Web Sitesi

Bağlam ve karar dosyaları için bkz. `CLAUDE.md` ve `docs/`.

Bu depo **Faz 0 / erken canlı iskelet** aşamasındadır: routing, marka sistemi,
hero/MONA iskeleti ve temel yasal/SEO sayfaları çalışır; Works, gerçek video
varlıkları ve bazı kurumsal/yasal bilgiler hâlâ müşteri girdisi bekler.
Faz planı: `docs/ROADMAP.md`.

## Stack

- Next.js 14 (App Router) + TypeScript
- next-intl ile `/tr` ve `/en` routing
- Canlı ortam: Vercel (`https://hibrid-360.vercel.app/tr`)
- Opsiyonel/önceki deploy planı: Cloudflare Workers (`@opennextjs/cloudflare`)
- Lighthouse CI (performans bütçesi kontrolü)

## Geliştirme

```bash
npm install
npm run dev
```

`http://localhost:3000` otomatik olarak `/tr`'ye yönlenir.

## Build ve kontrol

```bash
npm run build   # next build
npm run lint    # eslint
npm run lhci    # Lighthouse CI (önce `npm run build && npm run start` gerekir)
npm run test:e2e     # Playwright e2e — kritik yollar (bkz. e2e/)
npm run test:e2e:ui  # aynısı, Playwright'ın UI modunda (hata ayıklama)
```

## e2e testleri (Playwright)

`e2e/` klasöründeki testler, tek başına elle QA taramasıyla yakalanması
zor olan kritik yolları koruma altına alır: çerez rızası + kalıcılığı,
dil değişimi (aynı sayfada kalma), mobil hamburger menü (390px, taşma +
panel + Escape), Contact formu (zorunlu alan/onay/sunucu hatası) ve Brief
Builder sihirbazı (6 soru + özet + rıza kapılı gönderim). Testler
`npm run dev`'e karşı çalışır ve `playwright.config.ts` webServer'ı
otomatik başlatır — ayrıca bir sunucu açmanıza gerek yok.

`@playwright/test` tarayıcıyı ilk çalıştırmada kendi indirir
(`npx playwright install chromium`); bunu engelleyen bir ortamda
(ör. ağı kısıtlı konteyner) `PLAYWRIGHT_EXECUTABLE_PATH` ortam
değişkeniyle önceden kurulu bir Chromium'un yolunu verebilirsiniz.

## Supabase altyapısı

Supabase proje bağlantısı müşterinin hesabı açıldıktan sonra yapılır. Repo
tarafındaki hazır altyapı:

- Migration: `supabase/migrations/20260826212814_initial_hibrid360_schema.sql`
- Okuma amaçlı doküman kopyası: `docs/supabase-schema.sql`
- Local seed: `supabase/seed.sql` (bilerek boş; izinli gerçek veri gelmeden
  seed eklenmez)

Müşteri Supabase projesi açtıktan sonra:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Vercel Project Settings → Environment Variables altında:

```bash
NEXT_PUBLIC_SUPABASE_URL=<project-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` eski isim olarak fallback kalır. Service role
key repoya veya `NEXT_PUBLIC_*` env'e girmez.

## Vercel deploy

Mevcut canlı site Vercel üzerinde çalışır. Vercel import/deploy akışı için
standart Next.js build komutları kullanılır:

```bash
npm install
npm run build
```

Production domain netleştiğinde Vercel Project Settings → Environment
Variables altında şunu ayarlayın:

```bash
NEXT_PUBLIC_SITE_URL=https://hibrid360.com
```

`NEXT_PUBLIC_SITE_URL` verilirse canonical, sitemap, robots ve JSON-LD URL'leri
her zaman bu değeri kullanır. Verilmezse kod sırasıyla Vercel'in
`VERCEL_PROJECT_PRODUCTION_URL` ve `VERCEL_URL` değerlerini kullanır; bunlar da
yoksa fallback `https://hibrid360.com` olur. Vercel'in verdiği domainsiz env
değerlerine kod otomatik `https://` ekler.

## Cloudflare deploy (opsiyonel / önceki plan)

Bu repoda Cloudflare Workers yapılandırması hâlâ korunur, ancak mevcut canlı
site Vercel'dedir. Cloudflare yoluna dönülürse proje Cloudflare Pages'in
klasik statik build'i yerine
[`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) adaptörüyle
**Cloudflare Workers**'a deploy edilir.

```bash
npm run preview   # yerelde wrangler ile önizleme
npm run deploy     # production deploy (Cloudflare hesabı + wrangler login gerekir)
```

Konfigürasyon: `wrangler.jsonc`, `open-next.config.ts`.

> Not: `@cloudflare/next-on-pages` (klasik Cloudflare Pages adaptörü) bu
> Next.js sürümüyle (`14.2.35`) npm bağımlılık çakışması veriyor —
> `@opennextjs/cloudflare` Cloudflare'in güncel önerdiği yoldur ve aynı
> Cloudflare hesabı/dashboard üzerinden yönetilir.

## i18n

- Route yapısı: `src/app/[locale]/...`, locale'lar `src/i18n/routing.ts`
  içinde tanımlı (`tr`, `en` — varsayılan `tr`).
- Çeviri metinleri: `src/messages/tr.json`, `src/messages/en.json`.
- hreflang etiketleri her sayfada `generateMetadata` → `alternates.languages`
  ile otomatik üretilir.
- Ana menü etiketleri **TR locale'de Türkçedir** (29 Ağustos 2026 müşteri
  revizyonu, `docs/DECISIONS.md` #19). Bu, menü maddelerinin iki dilde de
  İngilizce kalacağını söyleyen eski varsayımın yerini alır. Hizmet
  **adları** (Creative, Production, Cloud TV…) özel ad olarak İngilizce
  kalmayı sürdürür; sloganlar da CLAUDE.md kuralı gereği çevrilmez.

## Site haritası ve navigasyon

Menü ve hizmet kataloğu **tek veri kaynağından** gelir; sayfa, sitemap ve
mega menü aynı diziyi okur:

- `src/data/navigation.ts` — üst menü (label key, canonical href, sıra,
  mega menü alt öğeleri) + menüde olmayan ikincil rotalar
- `src/data/services.ts` — sekiz hizmetin sırası, adı, rotası, görseli

### Üst menü (canonical sıra)

| # | TR | EN | Rota |
|---|---|---|---|
| 1 | BİZ KİMİZ | WHO WE ARE | `/[locale]/who-we-are` |
| 2 | NE YAPIYORUZ | WHAT WE DO | `/[locale]/what-we-do` |
| 3 | NEYE İNANIYORUZ | WHAT WE BELIEVE | `/[locale]/what-we-believe` |
| 4 | ÇÖZÜMLER | SOLUTIONS | `/[locale]/solutions` |
| 5 | MÜŞTERİLER | CLIENTS | `/[locale]/clients` |
| 6 | İŞ ORTAKLARI | PARTNERS | `/[locale]/partners` |
| 7 | İLETİŞİM | CONTACT | `/[locale]/contact` |

**Menüde olmayan ama yaşayan rotalar:** `/work` (ana sayfa CTA'ları,
Clients ve footer üzerinden), `/insights`, `/culture`
(+ `/culture/directors`, `/culture/sustainability`), `/brief`, yasal
sayfalar.

### Hizmet kataloğu (What We Do)

Creative · Production · Post Production · Digital · Live Broadcast ·
Cloud TV · Event Management · AI Creative Production

Photography 29 Ağustos 2026 revizyonuyla bağımsız hizmet olmaktan çıktı;
yetenek olarak Solutions sayfasında duruyor (`docs/DECISIONS.md` #17).

### Kalıcı yönlendirmeler (308)

`next.config.mjs` → `redirects()`, her locale için ayrı üretilir:

| Eski | Yeni |
|---|---|
| `/[locale]/friends` | `/[locale]/clients` |
| `/[locale]/culture/who-we-are` | `/[locale]/who-we-are` |
| `/[locale]/culture/what-we-believe` | `/[locale]/what-we-believe` |
| `/[locale]/culture/partners` | `/[locale]/partners` |
| `/[locale]/what-we-do/photography` | `/[locale]/what-we-do` |

Yönlendirilen hiçbir URL sitemap'te yer almaz ve hiçbir yerde canonical
olarak ilan edilmez.

## Design tokens

Marka renkleri ve tipografi `src/styles/tokens.css` içinde CSS custom
property olarak tanımlı. Kod tabanında hiçbir yerde hardcoded marka hex
değeri kullanılmaz — bkz. CLAUDE.md "Çalışma kuralları".

## Açık kararlar

`docs/DECISIONS.md` içindeki [KARAR] maddeleri henüz kapanmadı. Bu iskelet
yalnızca varsayılan önerilerle kuruldu; ilgili bölümlerin final tasarımı
kararlar kapanmadan başlamaz.
