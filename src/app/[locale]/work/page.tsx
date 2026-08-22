import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { EmptyState } from "@/components/EmptyState";
import { getPublishedWorks } from "@/lib/content";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Work } from "@/types/content";
import styles from "./page.module.css";

/**
 * brief-rev12.md Bölüm 7 — Works.
 * Sayfa metinleri 7.1'deki "SİTEYE GİRECEK METİN" kutularından birebir
 * alınmıştır; marka dili olduğu için TR sürümde de İngilizce kalır.
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

export const metadata: Metadata = { title: "Work" };

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

  const byYear = works.reduce<Record<number, Work[]>>((acc, work) => {
    (acc[work.year] ??= []).push(work);
    return acc;
  }, {});
  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

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
        <p className={styles.showreelBody}>
          MAKE IT MATTER. HYPE THE VIBE. AMPLIFY THE IMPACT. Integrated brand
          experiences that move hearts — and the needle.
        </p>
      </section>

      <h2 className={styles.gridIntro}>And we let our work speak for itself!</h2>

      {recent.length === 0 ? (
        <EmptyState message={t("empty")} />
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

      {years.length > 0 && (
        <section className={styles.archive}>
          <h2 className={styles.gridIntro}>{t("archiveTitle")}</h2>
          {years.map((year) => (
            <div key={year}>
              <h3 className={styles.archiveYear}>{year}</h3>
              <ul className={styles.archiveList}>
                {byYear[year].map((work) => (
                  <li key={work.id}>
                    <Link href={`/work/${work.slug}`}>
                      {work.client_name_confidential
                        ? t("confidentialClient")
                        : work.client_name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      <section className={styles.closing}>
        <p className={styles.closingLead}>
          If our work aligns with your frequency, we would love to meet you —
          especially if you are on the SAME FREQUENCY, same mindset as us.
        </p>
        <h2 className={styles.closingHeading}>
          AT HIBRID 360, CREATIVE STORYTELLING AGENCY SERVICES FOR AMBITIOUS
          BRANDS
        </h2>
      </section>
    </div>
  );
}
