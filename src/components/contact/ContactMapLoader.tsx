"use client";

import dynamic from "next/dynamic";

/**
 * `ContactMap`'i ayrı bir chunk'a bölen istemci sarmalayıcısı.
 *
 * `contact/page.tsx` bir async Server Component; Next.js
 * `dynamic(..., { ssr: false })`'u doğrudan bir Server Component
 * içinde çağırmaya izin vermiyor (build hatası verir), bu yüzden
 * çağrı burada, ayrı bir `"use client"` dosyasında yapılıyor.
 *
 * `maplibre-gl` (~270KB, bkz. docs/DECISIONS.md #29) artık sayfanın
 * ilk First Load JS'ine değil, bu ayrı chunk'a giriyor — CLAUDE.md
 * performans bütçesi ("ilk yükleme toplam transfer < 2MB").
 *
 * Not: müşteri revizyonu gereği harita ARA YÜKLEME EKRANI olmadan,
 * sayfayla birlikte doğrudan görünür kalmalı (bkz.
 * e2e/canonical-routes.spec.ts "harita sayfayla birlikte yükleniyor").
 * `ssr:false` bunu bozmaz — yalnızca JS bundle'ını ayırır, mount
 * viewport'a girmeyi beklemez.
 */
export const ContactMapLoader = dynamic(
  () => import("./ContactMap").then((mod) => mod.ContactMap),
  { ssr: false },
);
