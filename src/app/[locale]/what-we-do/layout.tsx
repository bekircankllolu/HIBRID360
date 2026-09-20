import type { ReactNode } from "react";
import { preload } from "react-dom";

/**
 * Space Grotesk 700 (`--font-chapter-display`) yalnız "What We Do" bölümünde
 * kullanılıyor: hub, hizmet sayfaları, AI Creative Production, How We Work,
 * Service Production. Bu sayfaların LCP öğesi bu fontla yazılı h1; font ancak
 * CSS indikten SONRA keşfedilince yavaş bağlantıda 1-3 sn yedek fontla
 * duruyordu (müşteri hatası, 20 Eylül 2026).
 *
 * Preload BİLEREK yalnız burada, kök layout'ta değil: ana sayfa ve diğer
 * sayfalar bu fontu kullanmıyor; oradaki LCP'yi (video posteri) 10,7 KB'lık
 * gereksiz bir isteğin yarıştırdığı Lighthouse CI'da görüldü (LCP 3,91 → 4,07 sn).
 * Faz 2'de Space Grotesk site geneline yayılırsa preload kök layout'a taşınır.
 */
export default function WhatWeDoLayout({ children }: { children: ReactNode }) {
  preload("/fonts/space-grotesk-700-latin-tr.woff2", {
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  });
  return <>{children}</>;
}
