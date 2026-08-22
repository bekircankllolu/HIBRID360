import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import styles from "./not-found.module.css";

/**
 * 404 — brief-rev12.md Bölüm 14.
 * "Marka diliyle hata sayfası: 'THIS PAGE IS OFF FREQUENCY.' + Works'e
 * yönlendirme butonu." Başlık marka dili olduğu için iki locale'de de
 * İngilizce; yönlendirme metni çevrilir.
 */
export default async function LocaleNotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>THIS PAGE IS OFF FREQUENCY.</h1>
      <Link href="/work" className={styles.cta}>
        {t("cta")}
      </Link>
    </div>
  );
}
