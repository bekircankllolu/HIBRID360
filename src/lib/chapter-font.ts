import { preload } from "react-dom";

/**
 * Space Grotesk 700 (`--font-chapter-display`) dosyası. fonts.css'teki
 * `@font-face` adresiyle BİREBİR aynı olmalı: farklıysa preload eşleşmez ve
 * dosya iki kez iner (PageTitle.test.tsx bunu bekçiliyor).
 */
export const CHAPTER_FONT_URL = "/fonts/space-grotesk-700-latin-tr.woff2";

/**
 * Başlık fontunu önden ister (React `preload` → `<link rel="preload" as="font">`).
 *
 * Neden: bu fontla yazılı h1 sayfanın LCP öğesi; font ancak CSS indikten
 * SONRA keşfedilince yavaş bağlantıda 1-3 sn yedek fontla duruyordu (müşteri
 * hatası, 20 Eylül 2026).
 *
 * Yalnız başlığı bu fontla çizen yerlerden çağrılır: `PageTitle` ve What We Do
 * layout'u. KÖK layout'a ve ana sayfaya ASLA eklenmez: ana sayfanın LCP'si
 * video posteri, 10,7 KB'lık font isteği onunla yarışıyor (Lighthouse CI'da
 * kök preload LCP'yi 3,91 → 4,07 sn yaptı). React aynı adresi bir kez basar;
 * bir sayfada birden çok çağrı zararsız.
 *
 * `crossOrigin: "anonymous"` zorunlu: fontlar CORS kipinde istenir, kipi
 * farklı bir preload kullanılmaz ve dosya ikinci kez iner.
 */
export function preloadChapterFont(): void {
  preload(CHAPTER_FONT_URL, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
}
