"use client";

import type { MouseEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
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
  const router = useRouter();

  const navigate = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
      event.shiftKey || event.altKey
    ) return;

    const documentWithTransitions = document as Document & {
      startViewTransition?: (update: () => void | Promise<void>) => { finished: Promise<void> };
    };
    if (!documentWithTransitions.startViewTransition) return;

    event.preventDefault();
    document.documentElement.dataset.serviceTransition = `${currentId}:${next.id}`;
    documentWithTransitions.startViewTransition(async () => {
      router.push(next.href);
      await new Promise<void>((resolve) => {
        const started = performance.now();
        const check = () => {
          if (document.querySelector(`[data-chapter="${next.id}"]`) || performance.now() - started > 1400) resolve();
          else requestAnimationFrame(check);
        };
        check();
      });
    }).finished.finally(() => delete document.documentElement.dataset.serviceTransition);
  };

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

        <Link href={next.href} className={styles.link} lang="en" onClick={navigate} data-service-nav={next.id}>
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
