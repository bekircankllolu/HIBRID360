import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { ServiceVisual } from "@/components/ServiceVisual";
import { digitalServices } from "@/data/digital-services";
import { siteImages } from "@/data/site-images";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";
import serviceStyles from "@/styles/service-page.module.css";
import styles from "./page.module.css";
import { splitStatementLead } from "./statement";

/**
 * DIG-01..06 (nihai copy deck, Ağustos 2026) — Digital alt sayfası.
 * 30 Ağustos 2026 QA denetimi: DIG-04 (dörtlü blok) sayfa içinde sabit
 * İngilizce duruyordu, yani TR sayfada dört uzun İngilizce cümle
 * görünüyordu. Blok mesaj dosyasına taşındı; gövde cümleleri Türkçeleşti,
 * tek kelimelik başlıklar (INNOVATION · CAPABILITY · VISIONARY · ENGAGING)
 * marka terminolojisi olarak İngilizce kaldı.
 *
 * DIG-05 (SHORT_SERVICES) kısa hizmet adlarından oluşuyor ve iki locale'de
 * de aynı — marka terminolojisi, bilerek çevrilmedi. Aynı gerekçeyle hero
 * sloganı ve CTA mikro başlığı da İngilizce; CTA'nın gövde cümlesi
 * (`closingBody`) zaten Türkçe.
 *
 * feature/typography-pilot: hero H1'e ağırlık karşıtlığı (300/800) ve
 * bandBody'nin ilk cümlesine iki tonlu statement eklendi — metin
 * DEĞİŞMEDİ, yalnızca sunumu değişti. Yerel sınıflar tek kök (`.page`)
 * altında iç içe tanımlı (bkz. ./page.module.css). Rev 4'te paylaşılan
 * service-page.module.css de site geneli Dalga A kapsamında düzeltildi
 * (7 hizmet sayfasının tamamını etkiler); bu sayfadaki yerel dosya artık
 * yalnızca Digital'e özgü EK jestleri taşıyor. Detay: ./page.module.css
 * ve ./statement.ts.
 */

const SHORT_SERVICES = [
  "WEB DESIGN",
  "WEB DEVELOPMENT",
  "SEM & SEO",
  "SEEDING",
  "MAILING",
  "BANNERS",
  "SOCIAL MEDIA MANAGEMENT",
  "SOCIAL MEDIA ADVERTISING STRATEGY",
  "VIRAL VIDEOS",
  "E-NEWS",
  "GIF",
];


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Digital Content Production",
    description:
      locale === "en"
        ? "Social-first content, short-form video, CGI and AI-powered production built to perform across platforms."
        : "Platformlar genelinde performans için tasarlanan sosyal medya öncelikli içerik, kısa video, CGI ve yapay zekâ destekli prodüksiyon.",
    alternates: localizedAlternates(locale, "/what-we-do/digital"),
  };
}

export default async function DigitalPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("services.digital");
  const isTr = locale === "tr";
  const body = t.raw("body") as string[];
  const bandBody = t.raw("bandBody") as string[];
  const quad = t.raw("quad") as Array<{ title: string; body: string }>;

  // bandBody[0] sönük-baş/tam-kontrast statement olarak render edilir;
  // diğer paragraflar (restBand) hiç dokunulmadan mevcut .bandBody
  // stiliyle devam eder — üç paragrafın tamamı korunuyor.
  const [statementText, ...restBand] = bandBody;
  const statementSplit = splitStatementLead(statementText, locale);

  return (
    <div className={`${serviceStyles.page} ${styles.page}`}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "What We Do", path: "/what-we-do" },
          { name: "Digital", path: "/what-we-do/digital" },
        ])}
      />

      <h1 className={serviceStyles.heroTitle}>
        <span className={styles.weightLight}>BUILT FOR THE FEED.</span>{" "}
        <span className={styles.weightBold}>MADE TO MOVE.</span>
      </h1>
      <ServiceVisual
        src={siteImages.services.digital.src}
        alt={siteImages.services.digital.alt[locale]}
        priority
      />
      <div className={serviceStyles.body}>
        {body.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <section className={serviceStyles.band}>
        <p className={styles.statement}>
          {statementSplit ? (
            <>
              <span className={styles.statementMuted}>{statementSplit.lead}</span>
              {statementSplit.rest}
            </>
          ) : (
            statementText
          )}
        </p>
        <div className={serviceStyles.bandBody}>
          {restBand.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className={serviceStyles.section}>
        <ul className={serviceStyles.list}>
          {digitalServices.map((service) => (
            <li key={service.title} className={serviceStyles.listItem}>
              <div>
                <p className={serviceStyles.quadTitle}>{service.title}</p>
                <p className={serviceStyles.quadBody}>{isTr ? service.tr : service.en}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={serviceStyles.section}>
        <div className={serviceStyles.quad}>
          {quad.map((item, index) => (
            <div key={item.title} className={styles.quadItem}>
              <div className={styles.quadHeading}>
                <span className={styles.quadNumber}>{String(index + 1).padStart(2, "0")}</span>
                <p className={`${serviceStyles.quadTitle} ${styles.quadTitle}`}>{item.title}</p>
              </div>
              <p className={serviceStyles.quadBody}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <ul className={serviceStyles.tagList}>
        {SHORT_SERVICES.map((service) => (
          <li key={service} className={serviceStyles.tag}>
            {service}
          </li>
        ))}
      </ul>

      <section className={serviceStyles.cta}>
        <p className={serviceStyles.ctaLead}>{t("closingBody")}</p>
        <p className={serviceStyles.microHeading}>
          LET&rsquo;S BUILD YOUR OWN DIGITAL EXPERIENCE. MAKE IT FEEL ALIVE.
        </p>
      </section>
    </div>
  );
}
