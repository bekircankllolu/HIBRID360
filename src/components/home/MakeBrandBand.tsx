import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import styles from "./MakeBrandBand.module.css";

/**
 * HOME-07 — 4. ekran, yeni fotoğraf üstü. Tıklanınca WORK sayfasına gider.
 * TODO: brief 16 — bu bölümün arka plan fotoğrafı henüz teslim edilmedi;
 * varlık gelene kadar zemin marka rengiyle (siyah) çalışıyor.
 */
export function MakeBrandBand() {
  const t = useTranslations("home");

  return (
    <Link href="/work" className={styles.band}>
      <span className={styles.text}>{t("makeBrand")}</span>
    </Link>
  );
}
