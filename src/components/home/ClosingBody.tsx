import { siteImages } from "@/data/site-images";
import { ScrollScrubVideo } from "./ScrollScrubVideo";
import { BRAND_SIGNATURE_LINES } from "@/lib/site";
import styles from "./ClosingBody.module.css";

/** Scroll ile oynatılan E.T. sahnesi ve marka imzası. */
export function ClosingBody() {
  return (
    <section className={styles.section} data-scroll-scrub>
      <div className={styles.stage}>
        <ScrollScrubVideo
          className={styles.media}
          src={siteImages.home.closingBody.videoSrc}
          poster={siteImages.home.closingBody.src}
        />
        <p className={styles.body}>
          {BRAND_SIGNATURE_LINES.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
      </div>
    </section>
  );
}
