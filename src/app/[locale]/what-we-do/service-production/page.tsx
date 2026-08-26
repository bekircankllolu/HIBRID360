import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { EmptyState } from "@/components/EmptyState";
import { serviceProductionOffer } from "@/data/service-production";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";
import styles from "./page.module.css";

/**
 * brief-rev12.md Bölüm 20.4 — Service Production (International).
 *
 * Öncelikli dil İngilizce: hedef kitle Türkiye'de çekim yapmak isteyen
 * yabancı ajans, yapımcı ve marka. Brief'in uygulama notu: "Bu sayfa
 * yalnızca İngilizce çalışırsa yeterlidir; Türkçe sürümü zorunlu değil.
 * Ancak hreflang kurgusu bozulmasın diye TR sürümde kısa bir özet sayfa
 * açılması önerilir." Bu yüzden rota iki locale'de de var, içerik
 * İngilizce kalıyor, TR sürümde tepeye bunu açıklayan kısa bir not düşüyor.
 *
 * TODO: brief 20.4 uygulama notu — teşvik (nakit iade) oranları değişkendir.
 * Sayfada hiçbir oran yazılmadı; brief'in güvenli ifadesi ("we guide you
 * through the current incentive scheme") kullanıldı. Resmî kaynak linki
 * güncel mevzuat teyit edilince eklenecek.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Service Production (International)",
    description:
      "Locations, permits, crew, gear and post — one contact, one contract, one country.",
    alternates: localizedAlternates(locale, "/what-we-do/service-production"),
  };
}

export default async function ServiceProductionPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("serviceProduction");

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "What We Do", path: "/what-we-do" },
          {
            name: "Service Production (International)",
            path: "/what-we-do/service-production",
          },
        ])}
      />

      {locale === "tr" && <p className={styles.localeNote}>{t("localeNote")}</p>}

      <h1 className={styles.heroTitle}>
        SHOOT IN TÜRKIYE. WITH A CREW THAT ALREADY KNOWS THE WAY.
      </h1>
      <p className={styles.heroLead}>
        Locations, permits, crew, gear and post — one contact, one contract, one
        country.
      </p>

      <div className={styles.offer}>
        {serviceProductionOffer.map((item) => (
          <div key={item.title} className={styles.offerItem}>
            <h2 className={styles.offerTitle}>{item.title}</h2>
            <p className={styles.offerBody}>{item.body}</p>
          </div>
        ))}
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("evidenceTitle")}</h2>
        {/* TODO: brief 20.4 — "Kanıt satırı şart: daha önce hangi ülkelerden
            hangi yapımlara hizmet verildi — yoksa sayfa iddia olarak kalır."
            Bu liste mevcut portföyden derlenecek; Supabase `works` tablosunda
            ülke/servis-prodüksiyon alanı yok, envanterle birlikte (DECISIONS
            #16) şema da genişletilmeli. */}
        <EmptyState message={t("evidenceEmpty")} />
      </section>

      <section className={styles.cta}>
        <p className={styles.ctaLead}>
          Send us the treatment and the shoot window. You get a local budget
          within two working days.
        </p>
        <Link href="/brief" className={styles.ctaButton}>
          Get a production quote
        </Link>
      </section>
    </div>
  );
}
