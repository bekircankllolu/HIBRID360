import { WORK_TEAM_BAND } from "@/data/work-media";
import styles from "./TeamBand.module.css";

/**
 * Works sayfasının kapanışa yakın tam genişlik bandı.
 *
 * 20 Eylül 2026 kullanıcı isteği: *"Partiküllerden oluşan hibrit yazısını
 * da kaldırabiliriz, buraya güzel bir görsel koyalım. Takım çalışmasını
 * anlatan siyah beyaz, jenerik, güzel bir görsel olabilir, belki bir ajans
 * görüntüsü. Ama çok doğal ve samimi gözükmesi lazım, lifestyle bir
 * görsel olsun, insanların saçları başları kıyafetleri bakımlı olsun."*
 *
 * Burası daha önce sırasıyla dönen bir parçacık küresi videosu, sonra
 * parçacıkların "HIBRID 360" yazdığı bir sahne taşıyordu. İkisi de
 * markadan söz ediyordu; bu bant artık sayfanın KONUSUNDAN söz ediyor —
 * ekip çalışması.
 *
 * Sunucu bileşeni: hareket yok, durum yok, JavaScript yok.
 *
 * AI açıklaması zorunlu: görsel gerçek Hibrid 360 ekibini göstermiyor.
 * Gerçek fotoğraf geldiğinde yalnızca `src/data/work-media.ts` değişir.
 */
export function TeamBand({ locale, disclosure }: { locale: "tr" | "en"; disclosure: string }) {
  return (
    <figure className={styles.band}>
      {/* next/image kullanılmıyor: bant sabit oranlı, sabit ölçülü ve
          zaten hedef boyutunda üretildi (2400x1050 webp, 128 KB). Ek bir
          optimizasyon katmanı kazanç vermez, istek ekler. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.image}
        src={WORK_TEAM_BAND.src}
        width={WORK_TEAM_BAND.width}
        height={WORK_TEAM_BAND.height}
        alt={WORK_TEAM_BAND.alt[locale]}
        loading="lazy"
        decoding="async"
      />
      {WORK_TEAM_BAND.disclosure === "ai-generated" && (
        <figcaption className={styles.disclosure}>{disclosure}</figcaption>
      )}
    </figure>
  );
}
