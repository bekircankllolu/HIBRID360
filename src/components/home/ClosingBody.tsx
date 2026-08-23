import { useTranslations } from "next-intl";
import styles from "./ClosingBody.module.css";

/** HOME-13 — son ekran, footer'ın üstü, kapanış gövdesi. Kaynak: mevcut site. */
export function ClosingBody() {
  const t = useTranslations("home");

  return (
    <section className={styles.section}>
      <p className={styles.body}>{t("closingBody")}</p>
    </section>
  );
}
