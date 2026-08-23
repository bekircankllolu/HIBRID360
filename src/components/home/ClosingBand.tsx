import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteImages } from "@/data/site-images";
import styles from "./ClosingBand.module.css";

/**
 * HOME-12 — 9. ekran, mevcut video loop'unun altı. Kaynak: mevcut site,
 * düzeltilmiş ("works doesn't" → "work doesn't"). Buton artık plug-ad.co'ya
 * değil, WORK sayfasına gider.
 *
 * Video loop hâlâ prodüksiyon bekliyor; eski sitedeki bisiklet görsel hissi
 * geçici poster olarak kullanılıyor.
 */
export function ClosingBand() {
  const t = useTranslations("home.closing");

  return (
    <section className={styles.band}>
      <Image
        className={styles.image}
        src={siteImages.home.closing.src}
        alt=""
        fill
        sizes="100vw"
      />
      <div className={styles.content}>
        <h2 className={styles.title}>{t("title")}</h2>
        <Link href="/work" className={styles.button}>
          {t("subtitle")}
        </Link>
      </div>
    </section>
  );
}
