import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { Mona } from "@/components/mona/Mona";
import { monaQuestions, openingLine } from "@/data/mona";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import styles from "./page.module.css";

/**
 * AI Creative Production — brief-rev12.md Bölüm 11.
 *
 * Sayfadaki uzun metinlerin tamamı MONA'nın repliklerine dönüştürülmüştür
 * (Bölüm 11.4). Sabit metin olarak yalnızca Bölüm 11.8'deki dört blok
 * kalır — aşağıdakiler o kutulardan birebir alınmıştır, marka dili olduğu
 * için her iki locale'de de İngilizcedir.
 *
 * TODO: brief 11.9 — AI Showreel filmi (Film A "Henüz Değil") teslim
 * edilince bu sayfaya tam sürüm olarak eklenecek; VideoObject JSON-LD
 * (src/lib/schema.ts) o zaman devreye girecek.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "AI Creative Production",
    description:
      "We create innovative visual experiences for brands that shape tomorrow.",
    alternates: { canonical: `/${locale}/what-we-do/ai-creative-production` },
  };
}

export default async function AiCreativeProductionPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("aiCreativeProduction");

  return (
    <div>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "What We Do", path: "/what-we-do" },
          {
            name: "AI Creative Production",
            path: "/what-we-do/ai-creative-production",
          },
        ])}
      />

      {/* brief 11.8 — blok 1: Açılış */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>CREATE THE FUTURE.</h1>
        <p className={styles.heroLead}>
          We create innovative visual experiences for brands that shape tomorrow.
          We combine human instinct, AI-native creativity and future-facing
          production to turn ideas into cultural and commercial impact.
        </p>
      </div>

      <Mona locale={locale} />

      {/* brief 11.8 — blok 2: Ayrıştırıcı soru */}
      <section className={styles.block}>
        <h2 className={styles.blockTitle}>
          Is Hibrid 360 just a video production company?
        </h2>
        <p className={styles.blockBody}>
          No. While high-end production is in our DNA, Hibrid 360 operates as an
          AI-Native Creative &amp; Production Studio. By unifying strategy,
          branding, design, digital content, photography, audio, and analytics
          into an end-to-end AI Creative Operating System, we bridge the gap
          between imagination and execution. We don&apos;t just use AI as a
          tool — we build scalable, tech-driven creative workflows that leave a
          lasting mark on culture.
        </p>
      </section>

      {/* brief 11.8 — blok 3: Kanıt */}
      <section className={`${styles.block} ${styles.proof}`}>
        <h2 className={styles.blockTitle}>WHY HIBRID 360?</h2>
        <p className={styles.blockBody}>
          From idea to impact: Faster · Smarter · More Flexible · More
          Sustainable · More Human
        </p>
        <ul className={styles.proofList}>
          <li>10x Faster Production</li>
          <li>Higher Creativity</li>
          <li>Premium Visual Quality</li>
          <li>Built for Global Brands</li>
        </ul>
      </section>

      {/* brief 11.8 — blok 4: Kapanış + CTA */}
      <section className={styles.block}>
        <p className={styles.closing}>
          Technology alone doesn&apos;t create emotion. Stories do. Ideas do.
          People do. The future of creativity isn&apos;t artificial. It&apos;s
          hybrid. Ready to Create What&apos;s Next?
        </p>
        <Link href="/brief" className={styles.cta}>
          Let&apos;s Build Something Extraordinary.
        </Link>
      </section>

      {/* brief 11.6: "Altyazı dosyaları ... SEO için sayfada metin olarak da
          bulunur." MONA bileşeni istemci tarafında tek replik gösterdiği
          için tam metin burada sunucu tarafında render ediliyor. */}
      <details className={styles.transcript}>
        <summary>{t("transcriptTitle")}</summary>
        <dl className={styles.transcriptList}>
          <dt>MONA</dt>
          <dd>{openingLine.text[locale]}</dd>
          {monaQuestions.map((question) => (
            <div key={question.id}>
              <dt>{question.question[locale]}</dt>
              <dd>{question.text[locale]}</dd>
            </div>
          ))}
        </dl>
      </details>
    </div>
  );
}
