import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import styles from "./PrimaryCta.module.css";

/**
 * GEN-08 — sitenin tek birincil eylemi. "Her sayfada aynı buton, aynı
 * metin." Nihai copy deck (Ağustos 2026) gereği tüm sayfa sonlarında bu
 * bileşen kullanılır; metin değişmez, yalnızca href sayfaya göre ayarlanır
 * (varsayılan: /contact).
 */
export function PrimaryCta({ href = "/contact" }: { href?: string }) {
  const t = useTranslations("cta");
  return (
    <Link href={href} className={styles.button}>
      {t("primary")}
    </Link>
  );
}
