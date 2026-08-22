import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { EmptyState } from "@/components/EmptyState";
import { TestimonialList } from "@/components/testimonials/TestimonialList";
import { getPublishedTestimonials } from "@/lib/content";
import { clients } from "@/data/clients";
import type { Locale } from "@/i18n/routing";
import styles from "./page.module.css";

/**
 * brief-rev12.md Bölüm 8 — Friends (eski adı: Clients).
 * Body copy 8'deki "SİTEYE GİRECEK METİN" kutusundan birebir.
 *
 * DECISIONS.md #6 (VARSAYILANLA İLERLE): kurucu görseli üstü pop-up sunum
 * yerine düz logo ızgarası — daha hızlı, daha performanslı. Aynı karar
 * 8.1'deki "küre/top üzerinde logo sunumu mu, düz ızgara mı" sorusunu da
 * kapatıyor: düz ızgara.
 *
 * TODO: brief 16 — müşteri logoları (görsel varlık) teslim edilmedi; ızgara
 * şimdilik marka adını metin olarak gösteriyor. Logolar geldiğinde
 * Cloudflare Images üzerinden WebP/AVIF + srcset ile bağlanacak.
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
      "We love the folks we work with. So much so, at our creative agency we call them friends, not clients.",
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

      <h1 className={styles.heroTitle}>OUR FRIENDS</h1>
      <p className={styles.body}>
        We love the folks we work with. So much so, at our creative agency we
        call them friends, not clients — the kind of honest, loyal chemistry you
        only get with your BFF&rsquo;s. Bold collaborations. Global icons. Shared
        creative energy.
      </p>

      <ul className={styles.logoGrid}>
        {clients.map((client) => (
          <li key={client} className={styles.logoItem}>
            {client}
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
    </div>
  );
}
