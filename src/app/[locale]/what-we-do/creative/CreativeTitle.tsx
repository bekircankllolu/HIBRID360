"use client";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { ScrambleLine } from "@/components/service-chapter/ScrambleLine";
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
 *
 * 20 Eylül 2026: her kelime `ScrambleLine`'ın yuvasında — karışırken
 * genişlik değişmiyor, başlık yeniden satır kırmıyor (ölçülen CLS 0.110
 * TR / 0.147 EN buradan geliyordu).
 */
export function CreativeTitle() {
  const active = !usePrefersReducedMotion();

  return (
    <h1 className={styles.title} lang="en" aria-label="CREATIVITY WITHOUT LIMITS">
      <ScrambleLine className={styles.white} text="CREATIVITY" active={active} durationMs={560} />{" "}
      <span className={styles.overflow} aria-hidden="true">
        <ScrambleLine text="WITHOUT" active={active} delayMs={80} durationMs={560} />{" "}
        <ScrambleLine text="LIMITS" active={active} delayMs={140} durationMs={560} />
      </span>
    </h1>
  );
}
