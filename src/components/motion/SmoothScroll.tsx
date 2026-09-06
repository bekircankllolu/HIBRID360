"use client";

import { ReactLenis } from "lenis/react";

/**
 * Yumuşak kaydırma — 6 Eylül 2026 müşteri kararı.
 *
 * NEDEN SAYFAYA BAĞLI, LAYOUT'A DEĞİL: CLAUDE.md performans bütçesi
 * (LCP < 2,5 sn, ilk yükleme < 2 MB) sözleşme maddesidir. Lenis'i
 * [locale]/layout.tsx'e koymak kütüphaneyi her sayfanın ilk yüküne sokardı.
 * Yalnızca bu sayfa sarmalandığı için maliyet rota parçasında kalır ve
 * ana sayfanın bütçesi etkilenmez.
 *
 * ERİŞİLEBİLİRLİK: Lenis `prefers-reduced-motion` ayarını varsayılan olarak
 * kendisi karşılar — ayar açıkken yumuşatma kapanır, programatik kaydırmalar
 * anında sıçrar. `respectReducedMotion: false` ASLA yazılmamalıdır; bu,
 * CLAUDE.md'nin zorunlu reduced-motion desteğini kırar.
 */

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        // Locomotive'in ritmine yakın ama daha kısa: uzun süreler mobilde
        // kaydırmanın "takılıyor" hissi vermesine yol açıyor.
        duration: 1.05,
        smoothWheel: true,
        // Dokunmatik cihazlarda native kaydırma korunur — tarayıcının kendi
        // momentum eğrisini taklit etmek mobilde hem pahalı hem yanlış.
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
