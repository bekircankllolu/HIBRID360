import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { PageHero } from "@/components/page/PageHero";
import { PageTitle } from "@/components/page/PageTitle";
import { ChapterRule } from "@/components/service-chapter/ChapterRule";
import { Button } from "@/components/ui/Button";
import { processSteps, budgetBands } from "@/data/how-we-work";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";
import styles from "./page.module.css";

/**
 * brief-rev12.md Bölüm 20.5 — How We Work.
 * İngilizce metinler (beş adımlık süreç, bütçe bandı tablosu) SİTEYE GİRECEK
 * METİN kutularından birebir. "NO BLACK BOX." marka sloganıdır, her iki
 * locale'de İngilizce kalır; gövde metni Türkçe sürümde çevrilidir
 * (src/data/how-we-work.ts — çeviri müşteri onayı bekliyor).
 *
 * TODO: docs/DECISIONS.md #15 bekleniyor — bütçe bandı başlangıç rakamları
 * ([X]) ve süre bantları ([n] weeks) ticari karardır, müşteride kalmalı.
 * Rakam uydurulmadı: tablodaki ilgili hücreler "belirlenecek" rozetiyle
 * render ediliyor. Karar geldiğinde yalnızca src/data/how-we-work.ts
 * güncellenecek, arayüz değişmeyecek.
 *
 * Faz 2 / B1 (tasarım dili): hero `PageHero` + `PageTitle`; slogan iki dilde
 * İngilizce → `lang="en"`. Bölüm başlıkları `ChapterRule` (h2 — e2e ilk h3'ü
 * adım başlığı olarak okuyor, sıra bozulmaz). Sayfa ortalı kaptan çıktı:
 * bölümler `--page-gutter` kenarından sola yaslı.
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
        : "Bir projenin Hibrid 360’ta nasıl ilerlediği, bütçe yapısı ve üretim takvimi.",
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

      <PageHero
        crumbs={[
          { label: "What We Do", href: "/what-we-do", lang: "en" },
          { label: "How We Work", lang: "en" },
        ]}
        title={<PageTitle text="NO BLACK BOX." lang="en" />}
        lede={t("lead")}
      />

      <section className={styles.section}>
        <ChapterRule title={t("processTitle")} />
        <ol className={styles.steps}>
          {processSteps[locale].map((step) => {
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
        <ChapterRule title={t("budgetTitle")} />
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
              {budgetBands[locale].map((band) => (
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
        <Button variant="primary" href="/brief">
          {t("cta")}
        </Button>
      </section>
    </div>
  );
}
