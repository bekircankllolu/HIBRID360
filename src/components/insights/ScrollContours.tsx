"use client";

import { useScrollScene } from "@/hooks/useScrollScene";

/**
 * Think & Thank hero'sunun organik kontur çizgileri.
 *
 * Eskiden 20–29 sn'lik sonsuz bir süzülme döngüsüydü; 17 Eylül 2026'dan beri
 * kaydırmaya bağlı: hero ekrandan çıkarken çizgiler kayıp döner. Stiller
 * sayfanın modülünde (`className`), bu bileşen yalnız `--progress` yazar.
 */
export function ScrollContours({ className }: { className: string }) {
  const { ref, motion } = useScrollScene<HTMLDivElement>({ mode: "pass" });

  return (
    <div ref={ref} className={className} data-motion={motion} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}
