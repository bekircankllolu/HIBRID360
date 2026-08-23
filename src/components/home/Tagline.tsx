import { useTranslations } from "next-intl";
import styles from "./Tagline.module.css";

/**
 * HOME-09 — 6. ekran, rakam filminin altı, tek satır tanım.
 * Aynı cümle meta description'da da kullanılır (bkz. src/lib/site.ts
 * SITE_TAGLINE / SITE_TAGLINE_TR) — buradaki metin tekil kaynakla eşleşir.
 *
 * TODO: brief HOME-08/09 — "rakam filmi" (impact numbers reel) varlığı
 * henüz teslim edilmedi; bu satır şimdilik güneş sistemi bölümünün
 * altında, kendi başına bir bölüm olarak render ediliyor.
 */
export function Tagline() {
  const t = useTranslations("home");

  return (
    <p className={styles.tagline}>{t("tagline")}</p>
  );
}
