import { Fragment } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Mona } from "@/components/mona/Mona";
import { MonaDrift } from "@/components/mona/MonaDrift";
import { JsonLd } from "@/components/seo/JsonLd";
import { ChapterIndex } from "@/components/service-chapter/ChapterIndex";
import { ChapterNext } from "@/components/service-chapter/ChapterNext";
import { ChapterRule } from "@/components/service-chapter/ChapterRule";
import { ScrollLitText } from "@/components/service-chapter/ScrollLitText";
import { humanAiFlowSignature } from "@/components/service-chapter/service-signature/human-ai-flow";
import { ServiceSignatureDrawing } from "@/components/service-chapter/ServiceSignatureDrawing";
import { monaQuestions, openingLine } from "@/data/mona";
import type { Locale } from "@/i18n/routing";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { chapterOf, nextChapter } from "@/lib/service-chapter";
import { BRAND_SIGNATURE, localizedAlternates } from "@/lib/site";
import styles from "./page.module.css";

const CHAPTER = chapterOf("aiCreativeProduction");

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: "AI Creative Production", description: locale === "en" ? "AI films, AI photography and hybrid production workflows — human creativity, AI precision, real impact." : "AI filmleri, AI fotoğrafçılık ve hibrit prodüksiyon akışları: insan yaratıcılığı, yapay zekâ hassasiyeti ve gerçek etki.", alternates: localizedAlternates(locale, "/what-we-do/ai-creative-production") };
}

export default async function AiCreativeProductionPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations("aiCreativeProduction");
  const tChapter = await getTranslations("services.chapter");
  const tWhatWeDo = await getTranslations("whatWeDo");
  const slogans = t.raw("slogans") as string[];
  const proofList = t.raw("proofList") as string[];
  const flowSteps = t.raw("flowSteps") as string[];
  const buildList = t.raw("buildList") as string[];
  const next = nextChapter(CHAPTER.id);
  const nextBlurb = (tWhatWeDo.raw("list") as Array<{ title: string; body: string }>).find((item) => item.title === next.name)?.body ?? "";

  return (
    <div>
      <JsonLd data={breadcrumbListJsonLd(locale, [{ name: "Home", path: "" }, { name: "What We Do", path: "/what-we-do" }, { name: "AI Creative Production", path: "/what-we-do/ai-creative-production" }])} />

      {/* Bu hero mevcut MONA deneyimidir; tasarım ve davranış korunur. */}
      <Mona locale={locale} />

      <article className={styles.chapter} data-chapter={CHAPTER.id} data-ai-continuation="">
        <MonaDrift />
        <header className={styles.intro}>
          <ChapterRule title={`315° / ${CHAPTER.name}`} />
          <h2>CREATE <span>THE FUTURE.</span></h2>
          <p>{t("heroLead")}</p>
        </header>

        <ScrollLitText sentences={slogans.map((text, index) => ({ text, tone: index === 0 ? "white" : "yellow" }))} />

        <section className={styles.proof}>
          <div>
            <ChapterRule title={locale === "tr" ? "FARK" : "THE DIFFERENCE"} />
            <h2>{t("diffTitle")}</h2>
            <p>{t("diffBody")}</p>
          </div>
          <div className={styles.proofPanel}>
            <h2>{t.rich("proofTitle", { brand: (chunks) => <span lang="en">{chunks}</span> })}</h2>
            <p>{t("proofLead")}</p>
            <ul>{proofList.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </section>

        <section className={styles.flowSection}>
          <ChapterRule title={locale === "tr" ? "İŞ AKIŞI" : "THE WORKFLOW"} />
          <div className={styles.flow}>
            {flowSteps.map((step, index) => (
              <Fragment key={step}><span>{step}</span>{index < flowSteps.length - 1 ? <i aria-hidden="true">→</i> : null}</Fragment>
            ))}
          </div>
        </section>

        <section className={styles.manifesto}><p>{t("manifestoText")}</p></section>
        <section className={styles.band}><p>{t("bandText")}</p></section>

        <ChapterIndex title={t("buildTitle")} items={buildList} />

        <ServiceSignatureDrawing
          geometry={humanAiFlowSignature()}
          title={locale === "tr" ? "İNSAN · YAPAY ZEKÂ · ÇIKTI" : "HUMAN · AI · OUTPUT"}
        />

        <section className={styles.closing}>
          <p>{t("closingBody")}</p>
          <p>{BRAND_SIGNATURE}</p>
          <strong>{t("closingQuestion")}</strong>
        </section>

        <details className={styles.transcript}>
          <summary>{t("transcriptTitle")}</summary>
          <dl><dt>MONA</dt><dd>{openingLine.text[locale]}</dd>{monaQuestions.map((question) => <div key={question.id}><dt>{question.question[locale]}</dt><dd>{question.text[locale]}</dd></div>)}</dl>
        </details>

        <ChapterNext currentId={CHAPTER.id} currentDegree={CHAPTER.degree} label={tChapter("next")} blurb={nextBlurb} />
      </article>
    </div>
  );
}
