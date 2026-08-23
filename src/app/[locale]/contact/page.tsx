import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { ContactForm } from "@/components/contact/ContactForm";
import { CONTACT, SOCIAL_PLATFORMS } from "@/lib/site";
import type { Locale } from "@/i18n/routing";
import styles from "./page.module.css";

/**
 * CON-01..08 (nihai copy deck, Ağustos 2026) — Contact.
 *
 * CON-03 [KARAR]: "Yayına girecek e-posta adresi teyit edilmeli." Deck
 * kendi içinde contact@hibrid360.com veriyor (GEN-05'te de aynı adres) —
 * bu yüzden bu adres kullanıldı, ama TODO olarak bırakıldı: son onay
 * gelmeden bu sayfa/footer yayına alınmamalı.
 *
 * TODO: CON-03 — gerçek harita (Google Maps/Mapbox) API anahtarı
 * yapılandırılmadı; "siyah zemin, sarı harita" kuralına uyan statik bir
 * yer tutucu kutu var. API anahtarı geldiğinde gömülü harita ile
 * değiştirilecek.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Contact",
    description:
      locale === "en"
        ? "Tell us what you're making and when. Istanbul, Kadıköy — or a 30-minute intro call, wherever you are."
        : undefined,
    alternates: { canonical: `/${locale}/contact` },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("contact");
  const tWork = await getTranslations("work");
  const tCta = await getTranslations("cta");
  const motionBody = t.raw("motionBody") as string[];
  const teams = t.raw("teams") as Array<{ title: string; body: string }>;
  const whatsappHref = `https://wa.me/${CONTACT.phone.replace(/[^0-9]/g, "")}`;

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "Contact", path: "/contact" },
        ])}
      />

      <h1 className={styles.heroTitle}>{t("heroTitle")}</h1>
      <p className={styles.heroLead}>{t("heroLead1")}</p>
      <p className={styles.heroLead}>{t("heroLead2")}</p>
      <p className={styles.heroBody}>{t("heroBody")}</p>

      <div className={styles.addressGrid}>
        <div className={styles.addressBlock}>
          {/* CON-03 — WORK-07 ile birebir aynı gövde metni, tek kaynak. */}
          <p className={styles.addressLead}>{tWork("ctaLead")}</p>
          <address>
            {CONTACT.addressLines.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
            <br />
            T: <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>{CONTACT.phone}</a>
            <br />
            E: <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </address>
        </div>
        {/* TODO: gerçek harita varlığı gelince değiştirilecek. */}
        <div className={styles.map} aria-hidden="true">
          Kadıköy — İstanbul, Türkiye
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("motionTitle")}</h2>
        <div className={styles.body}>
          {motionBody.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <h3 className={styles.motionQuestion}>{t("motionQuestion")}</h3>
        <p className={styles.motionIntro}>{t("motionIntro")}</p>
        <div className={styles.teams}>
          {teams.map((team) => (
            <div key={team.title}>
              <p className={styles.teamTitle}>{team.title}</p>
              <p className={styles.teamBody}>{team.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.formSection}>
        <ContactForm locale={locale} />
      </section>

      <div className={styles.bookingRow}>
        <p className={styles.bookingLead}>{t("bookingLead")}</p>
        <div className={styles.bookingLinks}>
          {/* TODO: DECISIONS.md #11 — Cal.com hesabı açılınca gerçek
              randevu linkine değiştirilecek. Zaten bu sayfadayız, bu
              yüzden burada (CtaBand'ın aksine) /contact'a self-link
              vermek yerine metin görünür bırakıldı. */}
          <span>{tCta("bookCall")}</span>
          <a href={whatsappHref} target="_blank" rel="noreferrer">
            {tCta("whatsapp")}
          </a>
        </div>
      </div>

      <p className={styles.socialInvite}>
        {t("socialInvite")}: {SOCIAL_PLATFORMS.join(" · ")}
      </p>
    </div>
  );
}
