import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { EmptyState } from "@/components/EmptyState";
import { getPublishedWorks } from "@/lib/content";
import { WorkArchive } from "@/components/work/WorkArchive";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Work } from "@/types/content";
import styles from "./page.module.css";

/**
 * WORK-01..08 (nihai copy deck, Ağustos 2026) — Work sayfası.
 * WORK-01/02 slogan satırları marka dili olduğu için iki dilde de
 * İngilizce kalır; gövde metinleri (WORK-02/03/07/08) locale'e göre
 * next-intl "work" namespace'inden geliyor.
 *
 * TODO: docs/DECISIONS.md #16 bekleniyor — Works içerik envanteri (iş adı ·
 * müşteri · yıl · format · yayın izni · dosya konumu) gelmeden grid'in kaç
 * sütun olacağı, arşivin kaç yıla yayılacağı ve hangi işin videosu olduğu
 * bilinemez. Envanter geldiğinde Supabase `works` tablosuna girilecek;
 * aşağıdaki arayüz o veriyle çalışacak şekilde hazır.
 *
 * TODO: brief 7.2 — prodüksiyon reel'i (10 işten kesilmiş tam ekran video)
 * medya varlığı olmadan eklenemez; poster + preload="none" kuralıyla
 * (CLAUDE.md performans bütçesi) varlık geldiğinde bağlanacak.
 */

// META tablosu (Bölüm 10) — TR description henüz yazılmadı, EN'de ayarlı.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Work",
    description:
      locale === "en"
        ? "Selected films, campaigns and live productions — with the problem, the work and the result for each project."
        : undefined,
    alternates: { canonical: `/${locale}/work` },
  };
}

function WorkCard({
  work,
  confidentialLabel,
}: {
  work: Work;
  confidentialLabel: string;
}) {
  // brief 7.3 izin uyarısı: yayın izni olmayan işlerde marka adı gizlenir.
  return (
    <Link href={`/work/${work.slug}`} className={styles.card}>
      <span className={styles.cardClient}>
        {work.client_name_confidential ? confidentialLabel : work.client_name}
      </span>
      <span className={styles.cardMeta}>
        {work.year}
        {work.category ? ` · ${work.category}` : ""}
      </span>
    </Link>
  );
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("work");
  const works = await getPublishedWorks();

  const featured = works.filter((work) => work.is_featured);
  const recent = featured.length > 0 ? featured : works;

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "Work", path: "/work" },
        ])}
      />

      <h1 className={styles.heroTitle}>
        IT&rsquo;S YOUR STORY.
        <span className={styles.heroSecondLine}>LET&rsquo;S MAKE IT MATTER.</span>
      </h1>

      <section className={styles.showreel}>
        {/* TODO: brief 7.2 — prodüksiyon reel'i videosu (medya varlığı yok) */}
        <p className={styles.showreelSlogan}>
          MAKE IT MATTER. HYPE THE VIBE. AMPLIFY THE IMPACT.
        </p>
        <p className={styles.showreelBody}>{t("showreelBody")}</p>
      </section>

      {/* WORK-03 — "tek satır", H2 değil. */}
      <p className={styles.tagline}>{t("tagline")}</p>

      <h2 className={styles.gridIntro}>{t("recentTitle")}</h2>
      {recent.length === 0 ? (
        <EmptyState message={t("empty")} detail={t("emptyDetail")} />
      ) : (
        <div className={styles.grid}>
          {recent.map((work) => (
            <WorkCard
              key={work.id}
              work={work}
              confidentialLabel={t("confidentialClient")}
            />
          ))}
        </div>
      )}

      {works.length > 0 && (
        <WorkArchive works={works} confidentialLabel={t("confidentialClient")} />
      )}

      <h2 className={styles.seoHeading}>{t("seoHeading")}</h2>

      <section className={styles.closing}>
        <p className={styles.closingLead}>{t("ctaLead")}</p>
      </section>
    </div>
  );
}
