import { Fragment } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { Mona } from "@/components/mona/Mona";
import { monaQuestions, openingLine } from "@/data/mona";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";
import styles from "./page.module.css";

/**
 * AI-01..09 (nihai copy deck, Ağustos 2026) — AI Creative Production
 * sayfası sabit blokları. Uzun metinlerin çoğu MONA'nın repliklerine
 * dönüştürülmüştür (5.2 MONA); burada kalan dokuz blok artık locale'e
 * göre next-intl "aiCreativeProduction" namespace'inden geliyor (önceki
 * sürüm brief-rev12'nin İngilizce-kalır varsayımıyla hardcoded İngilizceydi
 * — yeni deck AI-01/03/04/09 için ayrı TR çevirisi veriyor).
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
      locale === "en"
        ? "AI films, AI photography and hybrid production workflows — human creativity, AI precision, real impact."
        : undefined,
    alternates: localizedAlternates(locale, "/what-we-do/ai-creative-production"),
  };
}

export default async function AiCreativeProductionPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("aiCreativeProduction");
  const slogans = t.raw("slogans") as string[];
  const proofList = t.raw("proofList") as string[];
  const flowSteps = t.raw("flowSteps") as string[];

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

      {/* AI-01 */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>CREATE THE FUTURE.</h1>
        <p className={styles.heroLead}>{t("heroLead")}</p>
      </div>

      {/* AI-02 */}
      <div className={styles.slogans}>
        {slogans.map((slogan, index) => (
          <p key={index} className={styles.sloganLine}>
            {slogan}
          </p>
        ))}
      </div>

      <Mona locale={locale} />

      {/* AI-03 — ayrıştırıcı soru bloğu */}
      <section className={styles.block}>
        <h2 className={styles.blockTitle}>{t("diffTitle")}</h2>
        <p className={styles.blockBody}>{t("diffBody")}</p>
      </section>

      {/* AI-04 — kanıt */}
      <section className={`${styles.block} ${styles.proof}`}>
        <h2 className={styles.blockTitle}>{t("proofTitle")}</h2>
        <p className={styles.blockBody}>{t("proofLead")}</p>
        <ul className={styles.proofList}>
          {proofList.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {/* AI-05 — akış şeması */}
      <section className={styles.block}>
        <div className={styles.flow}>
          {flowSteps.map((step, index) => (
            <Fragment key={step}>
              <span className={styles.flowStep}>{step}</span>
              {index < flowSteps.length - 1 && (
                <span className={styles.flowArrow}>→</span>
              )}
            </Fragment>
          ))}
        </div>
      </section>

      {/* AI-06 — manifesto bandı */}
      <section className={`${styles.block} ${styles.manifesto}`}>
        <p className={styles.manifestoText}>
          We don&rsquo;t replace creativity. We expand it.
        </p>
      </section>

      {/* AI-07 — ara bant */}
      <section className={styles.block}>
        <p className={styles.bandText}>
          AI is Changing Production. We are Redefining It.
        </p>
      </section>

      {/* AI-08 — What We Build */}
      <section className={styles.block}>
        <h2 className={styles.blockTitle}>What We Build</h2>
        <ul className={styles.buildList}>
          <li>AI Films</li>
          <li>AI Photography</li>
          <li>AI Design</li>
          <li>AI Experiences</li>
          <li>AI Innovation</li>
        </ul>
      </section>

      {/* AI-09 — kapanış + CTA (buton layout'taki global CtaBand'dan gelir) */}
      <section className={styles.block}>
        <p className={styles.closing}>{t("closingBody")}</p>
        <p className={styles.closing}>
          The future of creativity isn&rsquo;t artificial. It&rsquo;s hybrid.
        </p>
        <p className={styles.closingQuestion}>{t("closingQuestion")}</p>
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
