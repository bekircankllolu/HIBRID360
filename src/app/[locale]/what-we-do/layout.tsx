import type { ReactNode } from "react";
import { preloadChapterFont } from "@/lib/chapter-font";

/**
 * Space Grotesk 700 (`--font-chapter-display`) What We Do bölümünün her
 * sayfasında başlık fontu: hub, hizmet sayfaları, AI Creative Production, How
 * We Work, Service Production. Bu sayfaların LCP öğesi bu fontla yazılı h1;
 * font ancak CSS indikten SONRA keşfedilince yavaş bağlantıda 1-3 sn yedek
 * fontla duruyordu (müşteri hatası, 20 Eylül 2026).
 *
 * Preload BİLEREK kök layout'ta değil: ana sayfa bu fontu kullanmıyor; oradaki
 * LCP'yi (video posteri) 10,7 KB'lık gereksiz bir isteğin yarıştırdığı
 * Lighthouse CI'da görüldü (LCP 3,91 → 4,07 sn).
 *
 * Faz 2: font site geneline yayılıyor ama preload yine kök layout'a TAŞINMAZ;
 * `PageTitle` çizen her sayfa fontu kendisi önden alır (src/lib/chapter-font.ts).
 * Burası `PageTitle` kullanmayan başlıklar (ServiceTitle, CreativeTitle, AI
 * Creative Production) için kalıyor; iki çağrı aynı sayfada zararsız (React
 * aynı adresi tek `<link>` olarak basar).
 */
export default function WhatWeDoLayout({ children }: { children: ReactNode }) {
  preloadChapterFont();
  return <>{children}</>;
}
