import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { EmptyState } from "@/components/EmptyState";
import { TestimonialList } from "@/components/testimonials/TestimonialList";
import { Link } from "@/i18n/navigation";
import { getPublishedTestimonials } from "@/lib/content";
import { clients, newClients, SHOW_NEW_CLIENTS } from "@/data/clients";
import type { Locale } from "@/i18n/routing";
import styles from "./page.module.css";

/**
 * FRD-01..04 (nihai copy deck, Ağustos 2026) — Friends (eski adı:
 * Clients).
 *
 * DECISIONS.md #6 (VARSAYILANLA İLERLE): kurucu görseli üstü pop-up sunum
 * yerine düz logo ızgarası — daha hızlı, daha performanslı. Aynı karar
 * 8.1'deki "küre/top üzerinde logo sunumu mu, düz ızgara mı" sorusunu da
 * kapatıyor: düz ızgara.
 *
 * TODO: brief 16 — müşteri logoları (görsel varlık) teslim edilmedi; ızgara
 * şimdilik marka adını metin olarak gösteriyor. Logolar geldiğinde
 * Cloudflare Images üzerinden WebP/AVIF + srcset ile bağlanacak.
 *
 * FRD-03 [KARAR] kapanmadan `newClients` (src/data/clients.ts) render
 * edilmiyor — sözleşme izni teyit edilmeden marka adı/logosu referans
 * olarak yayınlanmaz.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Friends",
    description:
      locale === "en"
        ? "The brands we work with — from holdings and global appliance brands to hotels, restaurants and start-ups."
        : undefined,
    alternates: { canonical: `/${locale}/friends` },
  };
}

export default async function FriendsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("friends");
  const testimonials = await getPublishedTestimonials();

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "Friends", path: "/friends" },
        ])}
      />

      <h1 className={styles.heroTitle}>{t("heroTitle")}</h1>
      <p className={styles.body}>{t("heroBody")}</p>

      <ul className={styles.logoGrid}>
        {clients.map((client) => (
          <li
            key={client.name}
            className={
              client.verified
                ? styles.logoItem
                : `${styles.logoItem} ${styles.logoItemUnverified}`
            }
          >
            {client.name}
          </li>
        ))}
        {SHOW_NEW_CLIENTS &&
          newClients.map((name) => (
            <li key={name} className={styles.logoItem}>
              {name}
            </li>
          ))}
      </ul>

      <section className={styles.testimonials}>
        <h2 className={styles.sectionTitle}>{t("testimonialsTitle")}</h2>
        {/* brief 18.7: Friends sayfasında üç videolu söz, logo ızgarasının
            hemen altında. Hedef: yayına girmeden en az 3 videolu, 6 yazılı söz. */}
        <TestimonialList
          testimonials={testimonials}
          locale={locale}
          placement="friends"
        />
        {testimonials.length === 0 && <EmptyState message={t("testimonialsEmpty")} />}
      </section>

      {/* FRD-04 — buton layout'taki global CtaBand'dan geliyor. */}
      <section className={styles.cta}>
        <p className={styles.ctaLead}>
          {t("ctaLead")} <Link href="/work">→ WORK</Link>
        </p>
      </section>
    </div>
  );
}
