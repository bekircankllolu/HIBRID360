import { useTranslations } from "next-intl";
import { siteImages } from "@/data/site-images";
import { ScrollScrubVideo } from "./ScrollScrubVideo";
import styles from "./ClosingBody.module.css";

/** HOME-13 — son ekran, footer'ın üstü, kapanış gövdesi. Kaynak: mevcut site. */
export function ClosingBody() {
  const t = useTranslations("home");

  return (
    <section className={styles.section} data-scroll-scrub>
      <div className={styles.stage}>
        <ScrollScrubVideo
          className={styles.media}
          src={siteImages.home.closingBody.videoSrc}
          poster={siteImages.home.closingBody.src}
        />
        <p className={styles.body}>{t("closingBody")}</p>
      </div>
    </section>
  );
}
