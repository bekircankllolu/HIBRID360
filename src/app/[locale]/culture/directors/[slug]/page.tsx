import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { EmptyState } from "@/components/EmptyState";
import {
  getDirectorBySlug,
  getPublishedDirectors,
  getPublishedWorks,
} from "@/lib/content";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";
import styles from "./page.module.css";

/**
 * brief-rev12.md Bölüm 20.3 — yönetmen profili şablonu:
 * ad · rol · tek satır tanım · biyografi (3-4 cümle) · reel (60-90 sn) ·
 * selected work (4 iş, Works'e link) · şehir/dil.
 *
 * TODO: docs/DECISIONS.md #14 bekleniyor — kadro listesi ve çekim tarihi
 * gelmeden hiçbir profil yayınlanmıyor, generateStaticParams boş dönüyor.
 */

export async function generateStaticParams() {
  const directors = await getPublishedDirectors();
  return directors.flatMap((director) =>
    routing.locales.map((locale) => ({ locale, slug: director.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const director = await getDirectorBySlug(slug);
  if (!director) return {};

  const oneLiner =
    (locale === "tr" ? director.one_liner_tr : director.one_liner_en) ?? undefined;

  return {
    title: director.full_name,
    description: oneLiner,
    alternates: localizedAlternates(locale, `/culture/directors/${slug}`),
  };
}

export default async function DirectorProfilePage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const director = await getDirectorBySlug(slug);

  if (!director) {
    notFound();
  }

  const t = await getTranslations("directors");
  const isTr = locale === "tr";
  const bio = isTr ? director.bio_tr : director.bio_en;

  const allWorks = await getPublishedWorks();
  // brief 20.3: "Selected work: 4 iş, Works sayfasına link"
  const selectedWorks = allWorks
    .filter((work) => work.director_id === director.id)
    .slice(0, 4);

  return (
    <article className={styles.profile}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "Culture", path: "/culture" },
          { name: "Directors & Crew", path: "/culture/directors" },
          { name: director.full_name, path: `/culture/directors/${slug}` },
        ])}
      />

      <h1 className={styles.name}>{director.full_name}</h1>
      <p className={styles.role}>{director.role}</p>

      {bio && <p className={styles.bio}>{bio}</p>}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("reel")}</h2>
        {/* TODO: brief 20.3 — reel 60-90 sn. Video varlığı R2'ye yüklenince
            poster + preload="none" ile bağlanacak (CLAUDE.md perf bütçesi). */}
        <EmptyState message={t("reelEmpty")} />
      </section>

      {selectedWorks.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t("selectedWork")}</h2>
          <ul className={styles.workList}>
            {selectedWorks.map((work) => (
              <li key={work.id}>
                <Link href={`/work/${work.slug}`}>
                  {work.client_name ?? t("confidentialClient")}{" "}
                  · {work.year}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className={styles.meta}>
        {director.city}
        {director.languages?.length ? ` · ${director.languages.join(", ")}` : ""}
        {/* brief 20.3 uygulama notu: serbest çalışanlar için "kadromuzda
            çalışan" yerine "birlikte çalıştığımız" ayrımı yapılmalı. */}
        {` · ${t(`relationship.${director.relationship_type}`)}`}
      </p>
    </article>
  );
}
