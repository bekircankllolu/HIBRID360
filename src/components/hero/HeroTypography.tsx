"use client";

import { useTranslations } from "next-intl";
import { HibridWebGL } from "./HibridWebGL";
import styles from "./HeroTypography.module.css";

/**
 * Hero tipografisi — brief-rev12.md Bölüm 4.1 / HOME-01..03.
 *
 * Brief'in dört katmanı artık gerçek WebGL sahnesiyle karşılanıyor
 * (bkz. HibridWebGL + src/lib/hibrid-wordmark-scene.ts):
 *   1. Harf içi dolgu — alfa maskesi (public/images/hibrid-wordmark.png)
 *      üzerine dikey açık pembe → koyu magenta palet.
 *   2. Pırıltı/degrade — flow noise ile sürüklenen dalga + grain shimmer.
 *   3. Elastik fare tepkisi — mouse velocity kaynaklı smear ve swirl/curl,
 *      imleç çevresinde radyal dalga.
 *   4. Sürekli hareket — imleç dursa da devam eden idle dalga.
 *
 * Önceki sürüm bu etkiyi SVG glif path'leri + CSS degrade ile taklit
 * ediyordu (WebGL bütçesi güneş sistemine ayrılmıştı). Kilit artık
 * görünürlükle devrediliyor, bu yüzden iki sahne de kendi sırasında
 * çalışabiliyor — "aynı anda en fazla BİR sahne" kuralı korunuyor.
 *
 * HOME-03 — "AI SHOWREEL" film alanı etiketi sağ üstte, menünün altında.
 * Deck: "Fare hareket ettikçe alan büyüyerek tam ekrana oturur." Film A
 * varlığı henüz teslim edilmedi — bu yüzden yalnızca etiket render
 * ediliyor, tam ekrana büyüyen etkileşim video geldiğinde eklenecek.
 */
export function HeroTypography() {
  const t = useTranslations("home");

  return (
    <div className={styles.hero}>
      <div className={styles.showreel}>
        <span className={styles.showreelLabel}>{t("showreel.label")}</span>
        <span className={styles.showreelCta}>{t("showreel.cta")}</span>
      </div>

      <div className={styles.inner}>
        {/* brief 4.2 — SİTEYE GİRECEK METİN, TR sürümde de aynı. */}
        <p className={styles.kicker}>
          MAKE IT MATTER.
          <span className={styles.kickerSecond}>
            HYPE THE VIBE. AMPLIFY THE IMPACT.
          </span>
        </p>

        <HibridWebGL />
      </div>
    </div>
  );
}
