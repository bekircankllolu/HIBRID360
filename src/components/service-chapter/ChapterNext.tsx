import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { formatDegree, nextChapter } from "@/lib/service-chapter";
import { ChapterDial } from "./ChapterDial";
import styles from "./ChapterNext.module.css";

/**
 * S7 — sıradaki servis. Sayfa, bir sonraki dereceye dönerek biter; sekiz
 * sayfa birlikte tam bir tur (docs/design/SERVICE_CHAPTER_SYSTEM.md §2).
 *
 * Kadran bu sayfanın derecesini gösterir; satır hover'ında işaret 45°
 * dönüp sıradaki servisin derecesine gelir. Tüm satır tek tıklama hedefi
 * (bağlantının `::after`'ı satırı kaplar) ama bağlantının erişilebilir adı
 * yalnızca servis adıdır — `<nav aria-label>` bağlamı verir.
 */
export function ChapterNext({
  currentId,
  label,
  blurb,
  currentDegree,
}: {
  currentId: string;
  label: string;
  blurb: string;
  currentDegree: number;
}) {
  const next = nextChapter(currentId);

  return (
    <nav className={styles.next} aria-label={label}>
      <div className={styles.row}>
        <div className={styles.meta}>
          <p className={styles.label}>
            {label}
            <ArrowRight aria-hidden="true" size={16} strokeWidth={1.75} />
          </p>
          <p className={styles.degree} aria-hidden="true">
            <ChapterDial degree={currentDegree} size={40} className={styles.dial} />
            <span>{formatDegree(next.degree)}</span>
          </p>
        </div>

        <Link href={next.href} className={styles.link} lang="en">
          {/* Hover kayması iç span'de: bağlantının kendisine transform
              verilirse `::after` onu konum kabı alır ve satırı kaplayan
              tıklama alanı hover'da linkin kutusuna küçülür. */}
          <span className={styles.linkText}>{next.name}</span>
        </Link>

        <p className={styles.blurb}>{blurb}</p>
      </div>
    </nav>
  );
}
