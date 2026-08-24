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
 * yapılandırılmadı. Yer tutucu artık boş sarı bir kutu değil: hero'nun sağ
 * yarısında duran, adresi + telefonu + e-postayı ve gerçek bir yol tarifi
 * bağlantısını taşıyan bir künye kartı ("siyah zemin, sarı çerçeve" kuralı
 * korundu). API anahtarı geldiğinde gömülü harita bu kartın üstüne
 * eklenecek — kart kendisi kalır, çünkü adres/iletişim bilgisi haritadan
 * bağımsız olarak gerekli.
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
  // Google Maps'in resmi "directions" URL şeması, teyitli adresten
  // türetiliyor — uydurma bir place-id / kısa link değil.
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    CONTACT.addressLines.join(", "),
  )}`;

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "Contact", path: "/contact" },
        ])}
      />

      <div className={styles.hero}>
        <div className={styles.heroMain}>
          <h1 className={styles.heroTitle}>{t("heroTitle")}</h1>
          <p className={styles.heroLead}>{t("heroLead1")}</p>
          <p className={styles.heroLead}>{t("heroLead2")}</p>
          <p className={styles.heroBody}>{t("heroBody")}</p>
        </div>

        {/* Hero'nun sağ yarısı eskiden tamamen boştu; künye kartı oraya
            taşındı. Kartın kendisi de eskiden altta duran, içinde tek bir
            şehir adı olan boş sarı kutuydu. */}
        <aside className={styles.locationCard}>
          {/* CON-03 — WORK-07 ile birebir aynı gövde metni, tek kaynak. */}
          <p className={styles.addressLead}>{tWork("ctaLead")}</p>
          <address className={styles.address}>
            {CONTACT.addressLines.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </address>
          <dl className={styles.contactRows}>
            <div className={styles.contactRow}>
              <dt>T</dt>
              <dd>
                <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>
                  {CONTACT.phone}
                </a>
              </dd>
            </div>
            <div className={styles.contactRow}>
              <dt>E</dt>
              <dd>
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </dd>
            </div>
          </dl>
          <a
            className={styles.directions}
            href={directionsHref}
            target="_blank"
            rel="noreferrer"
          >
            {t("directions")} →
          </a>
        </aside>
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
