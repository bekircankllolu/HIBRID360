import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { EmptyState } from "@/components/EmptyState";
import { getPublishedWorks, getWorkBySlug, getPublishedDirectors } from "@/lib/content";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";
import styles from "./page.module.css";

/**
 * brief-rev12.md Bölüm 7.3 — vaka sayfası şablonu: Sorun / Çözüm / Sonuç /
 * Kanıt. "Proje değil, dönüşüm anlatılır."
 *
 * TODO: docs/DECISIONS.md #16 bekleniyor — envanter gelmeden hiçbir vaka
 * yayınlanamaz, bu yüzden generateStaticParams şu an boş döner.
 */

export async function generateStaticParams() {
  const works = await getPublishedWorks();
  return works.flatMap((work) =>
    routing.locales.map((locale) => ({ locale, slug: work.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const work = await getWorkBySlug(slug);
  if (!work) return {};

  // client_name gizli işlerde veritabanından null gelir (works_public view).
  const title =
    (locale === "tr" ? work.title_tr : work.title_en) ??
    work.title_en ??
    work.title_tr ??
    work.client_name ??
    "Case study";
  const description =
    (locale === "tr" ? work.case_problem_tr : work.case_problem_en) ?? undefined;

  return {
    title,
    description,
    alternates: localizedAlternates(locale, `/work/${slug}`),
  };
}

export default async function WorkCasePage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const work = await getWorkBySlug(slug);

  if (!work) {
    notFound();
  }

  const t = await getTranslations("work");
  const isTr = locale === "tr";
  const clientLabel = work.client_name ?? t("confidentialClient");
  const projectTitle =
    (isTr ? work.title_tr : work.title_en) ??
    work.title_en ??
    work.title_tr ??
    clientLabel;

  const problem = isTr ? work.case_problem_tr : work.case_problem_en;
  const solution = isTr ? work.case_solution_tr : work.case_solution_en;
  const result = isTr ? work.case_result_tr : work.case_result_en;

  const directors = work.director_id ? await getPublishedDirectors() : [];
  const director = directors.find((d) => d.id === work.director_id);

  return (
    <article className={styles.case}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "Work", path: "/work" },
          { name: clientLabel, path: `/work/${slug}` },
        ])}
      />

      <p className={styles.client}>{clientLabel}</p>
      <h1 className={styles.projectTitle}>{projectTitle}</h1>
      <p className={styles.meta}>
        {work.year}
        {work.category ? ` · ${work.category}` : ""}
      </p>

      {problem && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t("case.problem")}</h2>
          <p>{problem}</p>
        </section>
      )}

      {solution && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t("case.solution")}</h2>
          <p>{solution}</p>
        </section>
      )}

      {result && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t("case.result")}</h2>
          <p className={styles.result}>{result}</p>
        </section>
      )}

      <section className={styles.evidence}>
        <h2 className={styles.sectionTitle}>{t("case.evidence")}</h2>
        {/* TODO: brief 7.3 — "sayfanın %70'i görsel olacak". Film/fotoğraf/KV
            varlıkları Cloudflare R2'ye yüklendikten sonra buraya poster +
            preload="none" kuralıyla bağlanacak (CLAUDE.md performans bütçesi). */}
        <EmptyState message={t("case.evidenceEmpty")} />
      </section>

      {/* brief 20.3: her vaka sayfasında yönetmen adı Directors & Crew'a link olur */}
      {director && (
        <Link
          href={`/culture/directors/${director.slug}`}
          className={styles.directorLink}
        >
          {director.full_name} · {director.role}
        </Link>
      )}
    </article>
  );
}
