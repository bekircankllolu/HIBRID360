import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import styles from "./not-found.module.css";

/**
 * LEG-04 (nihai copy deck, Ağustos 2026) — 404 sayfası. Başlık EN/TR'de
 * FARKLI ("THIS PAGE IS OFF FREQUENCY." / "BU SAYFA FREKANS DIŞINDA.") —
 * önceki sürüm marka dili varsayımıyla başlığı iki locale'de de
 * İngilizce bırakmıştı, deck'in kendisi ayrı TR çevirisi veriyor.
 */
export default async function LocaleNotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t("title")}</h1>
      <p className={styles.body}>{t("body")}</p>
      <Link href="/work" className={styles.cta}>
        {t("cta")}
      </Link>
    </div>
  );
}
