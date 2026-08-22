# Hibrid 360 — Web Sitesi

Bağlam ve karar dosyaları için bkz. `CLAUDE.md` ve `docs/`.

Bu depo **Faz 0** (iskelet) aşamasındadır: gerçek içerik yoktur, yalnızca
doğru routing'e ve marka sistemine sahip çalışan bir teknik temel vardır.
Faz planı: `docs/ROADMAP.md`.

## Stack

- Next.js 14 (App Router) + TypeScript
- next-intl ile `/tr` ve `/en` routing
- Cloudflare Workers deploy: `@opennextjs/cloudflare`
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

## Cloudflare'e deploy

Bu proje Cloudflare Pages'in klasik statik build'i yerine
[`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) adaptörüyle
**Cloudflare Workers**'a deploy edilir (CLAUDE.md: "Hosting: Cloudflare
Pages / Workers"). Next.js middleware (i18n routing) ve SSR bu şekilde
tam desteklenir.

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
