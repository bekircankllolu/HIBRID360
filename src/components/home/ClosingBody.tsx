import Image from "next/image";
import { useTranslations } from "next-intl";
import { siteImages } from "@/data/site-images";
import styles from "./ClosingBody.module.css";

/** HOME-13 — son ekran, footer'ın üstü, kapanış gövdesi. Kaynak: mevcut site. */
export function ClosingBody() {
  const t = useTranslations("home");

  return (
    <section className={styles.section}>
      <Image
        className={styles.image}
        src={siteImages.home.closingBody.src}
        alt=""
        fill
        sizes="100vw"
      />
      <p className={styles.body}>{t("closingBody")}</p>
    </section>
  );
}
