import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import styles from "./ClosingBand.module.css";

/**
 * HOME-12 — 9. ekran, mevcut video loop'unun altı. Kaynak: mevcut site,
 * düzeltilmiş ("works doesn't" → "work doesn't"). Buton artık plug-ad.co'ya
 * değil, WORK sayfasına gider.
 *
 * TODO: brief 16 — "mevcut video loop" varlığı (arka plan videosu) henüz
 * teslim edilmedi; poster kare + preload="none" ile eklenecek.
 */
export function ClosingBand() {
  const t = useTranslations("home.closing");

  return (
    <section className={styles.band}>
      <h2 className={styles.title}>{t("title")}</h2>
      <Link href="/work" className={styles.button}>
        {t("subtitle")}
      </Link>
    </section>
  );
}
