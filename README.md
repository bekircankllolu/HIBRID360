# Hibrid 360 — Web Sitesi

Bağlam ve karar dosyaları için bkz. `CLAUDE.md` ve `docs/`. Faz durumu ve
kalan işler için bkz. `docs/ROADMAP.md` ve `docs/DECISIONS.md`.

Canlı site **Vercel** üzerinde çalışır (bkz. "Vercel'e deploy" altında).
Cloudflare Workers/Pages bu depoda hâlâ desteklenir ama şu an kullanılan
platform değildir — bkz. "Alternatif: Cloudflare'e deploy".

## Stack

- Next.js 14 (App Router) + TypeScript
- next-intl ile `/tr` ve `/en` routing
- **Hosting: Vercel** (canlı deploy) — bkz. "Vercel'e deploy"
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
```

## Vercel'e deploy

Canlı site (hibrid360.com) Vercel'de çalışıyor. Next.js 14 App Router,
next-intl middleware'i ve SSR Vercel'de ek konfigürasyon gerekmeden
desteklenir — proje Vercel'in standart Next.js build'iyle deploy edilir.

1. Vercel'de projeyi bu repo'ya bağlayın (Import Project → GitHub).
2. Build ayarları varsayılan Next.js algılamasıyla çalışır:
   - Build command: `next build` (varsayılan, `package.json`'daki
     `npm run build` ile aynı)
   - Output: Vercel'in Next.js runtime'ı otomatik yönetir (ayrı bir
     output dizini ayarlamaya gerek yok)
3. Ortam değişkenleri (Vercel proje ayarları → Environment Variables):
   - `NEXT_PUBLIC_SITE_URL` — **production** ortamında mutlaka
     `https://hibrid360.com` olarak ayarlanmalı. Bu değişken
     `src/lib/site.ts`'teki `SITE_URL` sabitinin tek girdisidir; robots.txt,
     sitemap.xml, canonical/hreflang etiketleri ve schema.org verisi hepsi
     buradan besleniyor (bkz. o dosyadaki öncelik sırası açıklaması).
   - Preview/staging deploy'larda bu değişken ayarlanmazsa `SITE_URL`
     otomatik olarak Vercel'in kendi verdiği önizleme domainine
     (`VERCEL_PROJECT_PRODUCTION_URL`/`VERCEL_URL`) düşer — yanlışlıkla
     `hibrid360.com` domainiyle indexlenmiş bir önizleme linki üretilmez.
4. Her push'ta otomatik deploy (main/production branch → production,
   diğer branch'ler → preview) — Vercel'in standart Git entegrasyonu.

Yerelde Vercel CLI ile deploy/önizleme (opsiyonel, gerekli değil):

```bash
npx vercel        # preview deploy
npx vercel --prod # production deploy
```

## Alternatif: Cloudflare'e deploy

CLAUDE.md, hosting seçeneği olarak "Cloudflare Pages / Workers"ı da
listeler; bu depo hâlâ [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare)
adaptörüyle Cloudflare Workers'a deploy edilebilecek şekilde kurulu
duruyor, fakat **şu an canlı site bu platformda çalışmıyor** — yalnızca
Vercel'e alternatif/yedek bir yol olarak tutulur.

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
- Ana menü kelimeleri (WORK, WHAT WE DO, CULTURE, INSIGHTS, FRIENDS,
  CONTACT) marka dili olarak her iki dilde de İngilizce sabit kalır —
  CLAUDE.md'deki slogan kuralıyla tutarlı bir varsayım.

## Design tokens

Marka renkleri ve tipografi `src/styles/tokens.css` içinde CSS custom
property olarak tanımlı. Kod tabanında hiçbir yerde hardcoded marka hex
değeri kullanılmaz — bkz. CLAUDE.md "Çalışma kuralları".

## Açık kararlar

`docs/DECISIONS.md` içindeki [KARAR] maddeleri henüz kapanmadı. Bu iskelet
yalnızca varsayılan önerilerle kuruldu; ilgili bölümlerin final tasarımı
kararlar kapanmadan başlamaz.
