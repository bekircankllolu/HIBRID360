import type { ReactNode } from "react";
import { MonaDrift } from "@/components/mona/MonaDrift";
import { MonaShard } from "@/components/mona/MonaShard";
import type { Locale } from "@/i18n/routing";
import type { MonaServiceShape } from "@/lib/mona-service-shapes";
import { chapterOf } from "@/lib/service-chapter";
import { selectManifesto } from "@/lib/service-manifesto";
import { ChapterHero } from "./ChapterHero";
import { ChapterIndex } from "./ChapterIndex";
import { ChapterNext } from "./ChapterNext";
import { ChapterRule } from "./ChapterRule";
import { ChapterVisualDeck, type ChapterVisual } from "./ChapterVisualDeck";
import { ScrollLitText } from "./ScrollLitText";
import { ServiceTitle } from "./ServiceTitle";
import styles from "./ServiceChapter.module.css";

export function ServiceChapter({
  locale,
  chapterId,
  titleLines,
  lede,
  body,
  services,
  visual,
  shape,
  labels,
  blurb,
  signature,
  nextBlurb,
  children,
}: {
  locale: Locale;
  chapterId: string;
  titleLines: readonly string[];
  lede: string;
  /** Sayfanın gövde paragrafları; kısa olan biri manifesto sahnesine çıkar. */
  body: readonly string[];
  services: readonly string[];
  visual: ChapterVisual;
  shape: Exclude<MonaServiceShape, "lotus">;
  labels: { hub: string; services: string; next: string; field: string };
  /**
   * Servisin `whatWeDo.list` içindeki tek satırlık tanımı. Gövdede slogan
   * uzunluğunda cümle yoksa manifesto sahnesi bunu kullanır; okunur gövde
   * metnine asla düşmez (bkz. service-manifesto.ts).
   */
  blurb?: string;
  /** Sayfaya özel pen tool çizimi veya scroll-kontrollü imza videosu. */
  signature?: ReactNode;
  nextBlurb: string;
  children?: ReactNode;
}) {
  const chapter = chapterOf(chapterId);
  // Manifesto sahnesi yalnız kısa cümle taşır; uzun paragraflar okunur gövde
  // metnine iner (bkz. src/lib/service-manifesto.ts).
  const manifesto = selectManifesto({
    candidates: body,
    extras: blurb ? [blurb] : [],
    lede,
  });
  const sentences = manifesto.sentences.map((text, index) => ({
    text,
    // Tek cümle varsa ekranın tek odağı odur: sarı. İki cümlede Creative'deki
    // denge: anlatım beyaz, kapanış sarı.
    tone:
      manifesto.sentences.length === 1 || index === 1
        ? ("yellow" as const)
        : ("white" as const),
  }));

  return (
    <article
      className={styles.chapter}
      data-chapter={chapter.id}
      data-service-shape={shape}
      lang={locale}
    >
      <MonaDrift />
      <ChapterHero
        degree={chapter.degree}
        serviceName={chapter.name}
        hub={{ label: labels.hub, href: "/what-we-do" }}
        title={<ServiceTitle lines={titleLines} />}
        lede={lede}
        mona={<MonaShard shape={shape} side="right" />}
      />

      <ScrollLitText sentences={sentences} />

      <section className={styles.field} aria-label={labels.field}>
        <ChapterRule title={labels.field} />
        <div className={styles.fieldGrid}>
          <div className={styles.fieldCopy}>
            {manifesto.remainder.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <p className={styles.coordinate} aria-hidden="true">
              {String(chapter.degree).padStart(3, "0")} / 360
            </p>
          </div>
          <ChapterVisualDeck visuals={[visual]} activeIndex={0} caption={chapter.name} />
        </div>
      </section>

      <ChapterIndex title={labels.services} items={services} />

      {signature}

      {children ? <div className={styles.details}>{children}</div> : null}

      <ChapterNext
        currentId={chapter.id}
        currentDegree={chapter.degree}
        label={labels.next}
        blurb={nextBlurb}
      />
    </article>
  );
}

export const serviceChapterStyles = styles;
