import { useTranslations } from "next-intl";
import styles from "./LessTalk.module.css";

/**
 * HOME-05 — 3. ekran açılış metni. Kaynak: mevcut site, deck'te
 * "özne–yüklem, noktalama, marka yazımı" düzeltilmiş hâliyle verilmiş.
 */
export function LessTalk() {
  const t = useTranslations("home.lessTalk");
  const paragraphs = t.raw("paragraphs") as string[];

  return (
    <section className={styles.section} aria-labelledby="less-talk-title">
      <h2 id="less-talk-title" className={styles.title}>
        {t("title")}
      </h2>
      <div className={styles.body}>
        {paragraphs.map((paragraph, index) => (
          <article className={styles.panel} key={index} tabIndex={0}>
            <span className={styles.index} aria-hidden="true">
              0{index + 1}
            </span>
            <p>{paragraph}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
