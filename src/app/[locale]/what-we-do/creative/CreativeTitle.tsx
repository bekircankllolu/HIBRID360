"use client";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useScrambleReveal } from "@/hooks/useScrambleReveal";
import styles from "./CreativeTitle.module.css";

/**
 * Creative S1 — başlık (docs/design/SERVICE_CHAPTER_SYSTEM.md §8).
 *
 * 13 Eylül 2026, beşinci geri bildirim turu (DECISIONS #47): interaktif
 * seçim çerçevesi kaldırıldı ("ilettiğimde görseldeki fuşya kutucuğu
 * kaldıralım. oraya daha sonra farklı bir animasyon bakıcaz").
 *
 * "Farklı bir animasyon" (DECISIONS #49): kullanıcı beğendiği bir referans
 * bileşenin karakter karıştırma/çözülme efektini istedi ("bu metne bu
 * efekti ver, sayfa yüklendiğinde bu efektle başlasın"). Üç kelime
 * (CREATIVITY, WITHOUT, LIMITS) sayfa açılırken kısa bir gecikmeyle art
 * arda rastgele karakterlerden gerçek harflerine "çözülüyor" — kaskad
 * hissi eski CSS `lineIn` animasyonunun (kaldırıldı) yerini alıyor. Saf
 * karıştırma mantığı `src/lib/scramble-text.ts`'te (test edilebilir),
 * döngü `useScrambleReveal` hook'unda — bu yüzden bileşen tekrar istemci
 * bileşeni oldu (`word-box.ts`'in silinmesinden önceki gibi).
 *
 * Metin CRE-01 (brief satır 615) — slogan, TR sayfada da İngilizce
 * (`lang="en"`). Kelimeler arasındaki gerçek boşluk `aria-label`'da da var.
 *
 * Erişilebilirlik: `aria-label` gerçek cümleyi baştan kilitliyor — ekran
 * okuyucu animasyon sırasındaki karışık karakterleri değil doğrudan
 * "CREATIVITY WITHOUT LIMITS"i duyar; görünen kelime span'leri
 * `aria-hidden`. `prefers-reduced-motion`'da efekt hiç başlamıyor
 * (`active=false`), metin ilk kareden itibaren düz ve sabit duruyor —
 * SSR/hidrasyon çıktısıyla birebir aynı (bkz. useScrambleReveal).
 */
export function CreativeTitle() {
  const active = !usePrefersReducedMotion();
  const creativity = useScrambleReveal("CREATIVITY", { active, delayMs: 0, durationMs: 560 });
  const without = useScrambleReveal("WITHOUT", { active, delayMs: 80, durationMs: 560 });
  const limits = useScrambleReveal("LIMITS", { active, delayMs: 140, durationMs: 560 });

  return (
    <h1 className={styles.title} lang="en" aria-label="CREATIVITY WITHOUT LIMITS">
      <span className={styles.white} aria-hidden="true">
        {creativity}
      </span>{" "}
      <span className={styles.overflow} aria-hidden="true">
        <span>{without}</span> <span>{limits}</span>
      </span>
    </h1>
  );
}
