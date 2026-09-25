import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { EmptyState } from "@/components/EmptyState";
import { PageHero } from "@/components/page/PageHero";
import { PageTitle } from "@/components/page/PageTitle";
import { ChapterRule } from "@/components/service-chapter/ChapterRule";
import { Button } from "@/components/ui/Button";
import { serviceProductionOffer } from "@/data/service-production";
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
 *
 * Faz 2 / B1 (tasarım dili): hero `PageHero` + `PageTitle` (cümle kademesi).
 * Başlık iki dilde de İngilizce → `lang="en"`; `splitTitle` son cümle
 * sınırından böler: "SHOOT IN TÜRKIYE." beyaz, "WITH A CREW …" sarı. Metin
 * değişmedi. Sayfa ortalı kaptan çıktı: bölümler `--page-gutter` kenarından
 * sola yaslı, aralar `--section-space*`.
 */

const TITLE = "SHOOT IN TÜRKIYE. WITH A CREW THAT ALREADY KNOWS THE WAY.";
const LEAD = "Locations, permits, crew, gear and post — one contact, one contract, one country.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Service Production (International)",
    description:
      locale === "en"
        ? "Locations, permits, crew, gear and post — one contact, one contract, one country."
        : "Mekân, izin, ekip, ekipman ve post prodüksiyon; tek muhatap ve tek sözleşmeyle Türkiye’de servis prodüksiyonu.",
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

      <PageHero
        crumbs={[
          { label: "What We Do", href: "/what-we-do", lang: "en" },
          // Kırıntı kısa ad: tam ad ("… (International)") 390 px'te iki satıra
          // kırılıp ayracı satır sonunda bırakıyordu. Tam ad metadata ve JSON-LD'de.
          { label: "Service Production", lang: "en" },
        ]}
        title={<PageTitle text={TITLE} lang="en" tier="sentence" />}
        lede={LEAD}
        ledeLang="en"
      >
        {locale === "tr" && <p className={styles.localeNote}>{t("localeNote")}</p>}
      </PageHero>

      <div className={styles.offer} lang="en">
        {serviceProductionOffer.map((item) => (
          <div key={item.title} className={styles.offerItem}>
            <h2 className={styles.offerTitle}>{item.title}</h2>
            <p className={styles.offerBody}>{item.body}</p>
          </div>
        ))}
      </div>

      <section className={styles.section}>
        <ChapterRule title={t("evidenceTitle")} />
        {/* TODO: brief 20.4 — "Kanıt satırı şart: daha önce hangi ülkelerden
            hangi yapımlara hizmet verildi — yoksa sayfa iddia olarak kalır."
            Bu liste mevcut portföyden derlenecek; Supabase `works` tablosunda
            ülke/servis-prodüksiyon alanı yok, envanterle birlikte (DECISIONS
            #16) şema da genişletilmeli. */}
        <EmptyState message={t("evidenceEmpty")} align="start" />
      </section>

      <section className={styles.cta}>
        <p className={styles.ctaLead} lang="en">
          Send us the treatment and the shoot window. You get a local budget
          within two working days.
        </p>
        <Button variant="primary" href="/brief" lang="en">
          Get a production quote
        </Button>
      </section>
    </div>
  );
}
