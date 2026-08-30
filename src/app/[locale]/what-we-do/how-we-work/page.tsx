import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { processSteps, budgetBands } from "@/data/how-we-work";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";
import styles from "./page.module.css";

/**
 * brief-rev12.md Bölüm 20.5 — How We Work.
 * Hero, beş adımlık süreç ve bütçe bandı tablosu SİTEYE GİRECEK METİN
 * kutularından birebir. Marka dili olduğu için metinler her iki locale'de
 * de İngilizce kalır.
 *
 * TODO: docs/DECISIONS.md #15 bekleniyor — bütçe bandı başlangıç rakamları
 * ([X]) ve süre bantları ([n] weeks) ticari karardır, müşteride kalmalı.
 * Rakam uydurulmadı: tablodaki ilgili hücreler "karar bekleniyor" işaretiyle
 * render ediliyor. Karar geldiğinde yalnızca src/data/how-we-work.ts
 * güncellenecek, arayüz değişmeyecek.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "How We Work",
    description:
      locale === "en"
        ? "How a project runs here, what it costs, and how long it takes."
        : "Bir projenin Hibrid 360'ta nasıl ilerlediği, bütçe yapısı ve üretim takvimi.",
    alternates: localizedAlternates(locale, "/what-we-do/how-we-work"),
  };
}

export default async function HowWeWorkPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("howWeWork");

  const pendingBadge = (
    <span className={styles.pending} title={t("pendingHint")}>
      {t("pendingShort")}
    </span>
  );

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "What We Do", path: "/what-we-do" },
          { name: "How We Work", path: "/what-we-do/how-we-work" },
        ])}
      />

      <h1 className={styles.heroTitle}>NO BLACK BOX.</h1>
      <p className={styles.heroLead}>
        How a project runs here, what it costs, and how long it takes.
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("processTitle")}</h2>
        <ol className={styles.steps}>
          {processSteps.map((step) => {
            const [before, after] = step.body.split("{pending}");
            return (
              <li key={step.step}>
                <span className={styles.stepNumber}>{step.step}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>
                  {before}
                  {after !== undefined && (
                    <>
                      {pendingBadge}
                      {after}
                    </>
                  )}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("budgetTitle")}</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">{t("table.format")}</th>
                <th scope="col">{t("table.startingFrom")}</th>
                <th scope="col">{t("table.scope")}</th>
                <th scope="col">{t("table.duration")}</th>
              </tr>
            </thead>
            <tbody>
              {budgetBands.map((band) => (
                <tr key={band.format}>
                  <td className={styles.formatCell}>{band.format}</td>
                  <td>{band.startingFrom ?? pendingBadge}</td>
                  <td>{band.scope.join(" · ")}</td>
                  <td>{band.duration ?? pendingBadge}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.tableNote}>{t("pendingHint")}</p>
      </section>

      <section className={styles.cta}>
        {/* brief 20.5: "Sayfanın altında tek CTA: Brief Builder (20.8)". */}
        <Link href="/brief" className={styles.ctaButton}>
          {t("cta")}
        </Link>
      </section>
    </div>
  );
}
