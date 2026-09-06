import { Fragment } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { MonaStage } from "@/components/mona/MonaStage";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { monaQuestions, openingLine } from "@/data/mona";
import type { Locale } from "@/i18n/routing";
import { BRAND_SIGNATURE, localizedAlternates } from "@/lib/site";
import styles from "./page.module.css";

/**
 * AI Creative Production.
 *
 * 6 Eylül 2026 müşteri revizyonu — sayfa MONA merkezli yeniden kuruldu.
 * Müşteri, referans olarak interaktif asistanlı bir iletişim sayfası
 * gösterdi; istenen yapı "karakter önce gelir, konuşma sayfanın kendisidir".
 * Sayfa artık iki katmandan oluşur:
 *
 *   1. MONA Stage  — ilk ekran. Başlat kapısı, dallanan konuşma, altı
 *                    soruluk brief akışı (brief 11 + 18.8 tek akışta).
 *   2. Anlatı      — AI-01..09 blokları, kaydırmayla açılan bölümler.
 *
 * AI-01..09 metinleri (nihai copy deck, Ağustos 2026) DEĞİŞMEDİ; yalnızca
 * sıraları ve sunumları yeniden düzenlendi. Hero başlığı ve giriş cümlesi
 * artık sahnenin üstünde duruyor — sayfanın h1'i orada.
 *
 * TODO: brief 11.9 — AI Showreel filmi (Film A "Henüz Değil") teslim
 * edilince bu sayfaya eklenecek; VideoObject JSON-LD (src/lib/schema.ts)
 * o zaman devreye girecek.
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
        : "AI filmleri, AI fotoğrafçılık ve hibrit prodüksiyon akışları: insan yaratıcılığı, yapay zekâ hassasiyeti ve gerçek etki.",
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
  const buildList = t.raw("buildList") as string[];

  return (
    <SmoothScroll>
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

      {/* AI-01 — başlık ve giriş cümlesi sahnenin üstünde durur. */}
      <MonaStage locale={locale} title="CREATE THE FUTURE." lead={t("heroLead")} />

      <div className={styles.narrative}>
        {/* AI-02 — sloganlar. Referans sitedeki kademeli açılan yığın
            tipografinin karşılığı: her satır kaydırmayla ayrı belirir.
            CLAUDE.md: sloganlar TR sürümde de İngilizce kalır. */}
        <section className={`${styles.block} ${styles.slogans}`}>
          {slogans.map((slogan, index) => (
            <p key={index} className={styles.sloganLine}>
              {slogan}
            </p>
          ))}
        </section>

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
                  <span className={styles.flowArrow} aria-hidden="true">
                    →
                  </span>
                )}
              </Fragment>
            ))}
          </div>
        </section>

        {/* AI-06 — manifesto bandı */}
        <section className={`${styles.block} ${styles.manifesto}`}>
          <p className={styles.manifestoText}>{t("manifestoText")}</p>
        </section>

        {/* AI-07 — ara bant */}
        <section className={styles.block}>
          <p className={styles.bandText}>{t("bandText")}</p>
        </section>

        {/* AI-08 — What We Build */}
        <section className={styles.block}>
          <h2 className={styles.blockTitle}>{t("buildTitle")}</h2>
          <ul className={styles.buildList}>
            {buildList.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        {/* AI-09 — kapanış + CTA (buton layout'taki global CtaBand'dan gelir) */}
        <section className={styles.block}>
          <p className={styles.closing}>{t("closingBody")}</p>
          {/* Marka imzası — footer'daki satırın aynısı. CLAUDE.md "sloganlar
              TR sürümde de İngilizce kalır" kuralı gereği çevrilmiyor; mesaj
              dosyasında kopyalanmak yerine tek kaynaktan (BRAND_SIGNATURE)
              okunuyor ki footer'la sessizce ayrışmasın. */}
          <p className={styles.closing}>{BRAND_SIGNATURE}</p>
          <p className={styles.closingQuestion}>{t("closingQuestion")}</p>
        </section>

        {/* brief 11.6: "Altyazı dosyaları ... SEO için sayfada metin olarak da
            bulunur." MONA sahnesi istemci tarafında tek replik gösterdiği
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
    </SmoothScroll>
  );
}
