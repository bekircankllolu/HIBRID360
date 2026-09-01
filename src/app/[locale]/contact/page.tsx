import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactMap } from "@/components/contact/ContactMap";
import {
  CONTACT,
  CONTACT_IMAGES,
  directionsUrl,
  mapEmbedUrl,
  telUrl,
  whatsappUrl,
} from "@/data/contact";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates, SOCIAL_LINKS } from "@/lib/site";
import styles from "./page.module.css";

/**
 * CON-01..08 (nihai copy deck, Ağustos 2026) — Contact.
 *
 * 29 Ağustos 2026 revizyonu — sayfa sırası müşterinin verdiği düzene
 * getirildi:
 *
 *   1. tam genişlik hero
 *   2. eski sitedeki İstanbul fotoğrafı (müşteri korunmasını istedi)
 *      + "Motion Office" anlatısı — fotoğrafın üzerindeki başlık bu
 *      bölümü açıyor, ikisi tek birim
 *   3. sarı iletişim bandı (yeni tasarım diline uyarlandı)
 *   4. adres · telefon · e-posta · yol tarifi
 *   5. tam genişlik harita
 *   6. iletişim formu
 *   7. footer (layout'tan gelir)
 *
 * Harita: anahtar gerektirmeyen Google Maps **sorgu gömmesi**. Koordinat
 * değil doğrulanmış adres metni kullanır — uydurulan hiçbir veri yok.
 * Sağlayıcı karşılaştırması ve KVKK notu src/data/contact.ts içinde.
 *
 * CON-03 [KARAR]: "Yayına girecek e-posta adresi teyit edilmeli." Deck
 * kendi içinde contact@hibrid360.com veriyor (GEN-05'te de aynı adres) —
 * bu yüzden bu adres kullanıldı, ama TODO olarak bırakıldı: son onay
 * gelmeden bu sayfa/footer yayına alınmamalı.
 *
 * Adres: eski site (© 2020) farklı bir Kadıköy adresi gösteriyor; kodda
 * güncel deck adresi var ve çelişki src/data/contact.ts içinde yorumla,
 * CURRENT_CONTENT_GAPS.md'de madde olarak duruyor — **uydurularak
 * çözülmedi**.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
  // Sayfa başlığı locale'e bağlı: TR sekmesinde/arama sonucunda İngilizce
  // başlık çıkıyordu. Görünür sayfa terminolojisiyle aynı sözlükten
  // (meta.title) okunuyor; alternates/canonical yapısı değişmedi.
    title: t("title.contact"),
    description:
      locale === "en"
        ? "Tell us what you are making and when. Istanbul, Kadıköy — or a 30-minute intro call, wherever you are."
        : "Ne üretmek istediğinizi ve zamanlamanızı anlatın. İstanbul, Kadıköy'de ya da 30 dakikalık çevrim içi görüşmede buluşalım.",
    alternates: localizedAlternates(locale, "/contact"),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("contact");
  const tCta = await getTranslations("cta");
  const motionBody = t.raw("motionBody") as string[];
  const teams = t.raw("teams") as Array<{ title: string; body: string }>;
  const directionsHref = directionsUrl();

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "Contact", path: "/contact" },
        ])}
      />

      {/* 1 — tam genişlik hero */}
      <header className={styles.hero}>
        <p className={styles.heroKicker}>{t("heroLead1")}</p>
        <h1 className={styles.heroTitle}>{t("heroTitle")}</h1>
        <p className={styles.heroBody}>{t("heroBody")}</p>
      </header>

      {/* 2 — İstanbul fotoğrafı + Motion Office anlatısı */}
      <section className={styles.motion}>
        <figure className={styles.figure}>
          <picture>
            <source
              type="image/avif"
              srcSet={CONTACT_IMAGES.panorama.avif}
              sizes="100vw"
            />
            <source
              type="image/webp"
              srcSet={CONTACT_IMAGES.panorama.webp}
              sizes="100vw"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.figureImage}
              src={CONTACT_IMAGES.panorama.fallback}
              width={CONTACT_IMAGES.panorama.width}
              height={CONTACT_IMAGES.panorama.height}
              alt={t("photoCaption")}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <figcaption className={styles.figureCaption}>
            <h2 className={styles.figureTitle}>{t("motionTitle")}</h2>
          </figcaption>
        </figure>

        <div className={styles.motionBody}>
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

      {/* 3 — sarı iletişim bandı. Marka kuralı: sarı zemin → SİYAH metin
          (CLAUDE.md kontrast kuralı; beyaz metin AA geçmiyor). */}
      <section className={styles.yellowBand}>
        <p className={styles.yellowBandLead}>{t("heroLead2")}</p>
        <a className={styles.yellowBandEmail} href={`mailto:${CONTACT.email}`}>
          {CONTACT.email}
        </a>
      </section>

      {/* 4 — adres · telefon · e-posta · yol tarifi */}
      <section className={styles.details}>
        <div className={styles.detail}>
          <h2 className={styles.detailLabel}>{t("addressLabel")}</h2>
          <address className={styles.address}>
            {CONTACT.addressLines.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </address>
          <a
            className={styles.inlineLink}
            href={directionsHref}
            target="_blank"
            rel="noreferrer"
          >
            {t("directions")} →
          </a>
        </div>

        <div className={styles.detail}>
          <h2 className={styles.detailLabel}>{t("phoneLabel")}</h2>
          <p className={styles.detailValue}>
            <a href={telUrl()}>{CONTACT.phone}</a>
          </p>
          <a
            className={styles.inlineLink}
            href={whatsappUrl()}
            target="_blank"
            rel="noreferrer"
          >
            {tCta("whatsapp")} →
          </a>
        </div>

        <div className={styles.detail}>
          <h2 className={styles.detailLabel}>{t("emailLabel")}</h2>
          <p className={styles.detailValue}>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </p>
          <p className={styles.socialInvite}>
            {t("socialInvite")}: {SOCIAL_LINKS.map((link) => link.name).join(" · ")}
          </p>
        </div>
      </section>

      {/* 5 — tam genişlik harita. Müşteri revizyonu gereği Google Maps
          iframe'i Contact sayfasıyla birlikte doğrudan yüklenir. */}
      <section className={styles.mapSection} aria-labelledby="contact-map">
        <h2 id="contact-map" className={styles.visuallyHidden}>
          {t("mapTitle")}
        </h2>
        <ContactMap
          className={styles.map}
          src={mapEmbedUrl()}
          title={t("mapTitle")}
        />
        <p className={styles.mapFallback}>
          <span>{t("mapNote")}</span>{" "}
          <a href={directionsHref} target="_blank" rel="noreferrer">
            {t("directions")} →
          </a>
        </p>
      </section>

      {/* 6 — iletişim formu */}
      <section className={styles.formSection}>
        <div className={styles.formColumn}>
          <ContactForm locale={locale} />
        </div>

        <aside className={styles.formAside}>
          <p className={styles.bookingLead}>{t("bookingLead")}</p>
          <div className={styles.bookingLinks}>
            <a href={`mailto:${CONTACT.email}`}>{tCta("email")}</a>
            <a href={whatsappUrl()} target="_blank" rel="noreferrer">
              {tCta("whatsapp")}
            </a>
          </div>
        </aside>
      </section>
    </div>
  );
}
