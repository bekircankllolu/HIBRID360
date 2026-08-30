import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { EmptyState } from "@/components/EmptyState";
import { ClientNameIndex } from "@/components/friends/ClientNameIndex";
import { TestimonialList } from "@/components/testimonials/TestimonialList";
import { Link } from "@/i18n/navigation";
import { getPublishedTestimonials } from "@/lib/content";
import { clients, newClients, SHOW_NEW_CLIENTS } from "@/data/clients";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";
import styles from "./page.module.css";

/**
 * FRD-01..04 (nihai copy deck, Ağustos 2026) — Clients (deck'teki adı:
 * Friends).
 *
 * 29 Ağustos 2026 revizyonu: sayfanın görünür adı ve canonical rotası
 * Clients oldu (eski hibrid360.com'daki adına dönüş). /friends kalıcı
 * olarak buraya yönlendiriliyor (next.config.mjs).
 *
 * İÇERİK ÇELİŞKİSİ (açık, müşteriye sorulacak): deck'in gövde metni
 * "onlara müşteri değil, dost diyoruz" diyor — sayfanın yeni adı Clients
 * olunca bu cümle kendi kendisiyle çelişiyor. Onaylı metin silinmedi ve
 * yerine metin uydurulmadı; çelişki
 * docs/content/CURRENT_CONTENT_GAPS.md'de blocker olarak kayıtlı.
 *
 * 30 Ağustos Revizyon 13 düzeltmesi: isimler artık çerçeveli kutular
 * içinde değil. INNOCEAN client index referansının hiyerarşisi, siyah
 * zemin üzerinde çerçevesiz tipografik marka dizinine uyarlandı. Sektör
 * verisi doğrulanmadığı için sol ray gerçek veriden türeyen alfabetik
 * aralıklar kullanır; uydurma kategori eklenmez.
 *
 * FRD-03 [KARAR] kapanmadan `newClients` (src/data/clients.ts) render
 * edilmiyor — sözleşme izni teyit edilmeden marka adı referans olarak
 * yayınlanmaz. Aynı şekilde `verified: false` isimler de listelenmez.
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
    title: t("title.clients"),
    description:
      locale === "en"
        ? "The brands we work with — from holdings and global appliance brands to hotels, restaurants and start-ups."
        : "Birlikte çalıştığımız markalar: holdinglerden global beyaz eşya markalarına, otellerden restoranlara ve girişimlere.",
    alternates: localizedAlternates(locale, "/clients"),
  };
}

export default async function ClientsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("clients");
  const testimonials = await getPublishedTestimonials();

  // Yalnızca yazımı doğrulanmış isimler yayına girer. Deck'in [DOĞRULA]
  // işaretlediği beş isim eski sitede de aynı yazımla duruyor ama deck
  // yazımlarından şüpheli olduğu için teyit istiyor — teyit gelmeden
  // listede görünmezler.
  const publishableClients = clients.filter((client) => client.verified);

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "Clients", path: "/clients" },
        ])}
      />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>{t("heroTitle")}</h1>
        <p className={styles.body}>{t("heroBody")}</p>
      </header>

      <ClientNameIndex
        clients={[
          ...publishableClients,
          ...(SHOW_NEW_CLIENTS
            ? newClients.map((name) => ({ name, verified: true }))
            : []),
        ]}
      />

      <section
        className={`${styles.testimonials} ${
          testimonials.length === 0 ? styles.testimonialsCompact : ""
        }`}
      >
        <h2 className={styles.sectionTitle}>{t("testimonialsTitle")}</h2>
        {/* brief 18.7: üç videolu söz, ızgaranın hemen altında. Hedef:
            yayına girmeden en az 3 videolu, 6 yazılı söz. Yayın izni
            kontrolü veritabanında (written_consent_confirmed). */}
        <TestimonialList
          testimonials={testimonials}
          locale={locale}
          placement="friends"
        />
        {testimonials.length === 0 && (
          <EmptyState message={t("testimonialsEmpty")} compact />
        )}
      </section>

      {/* FRD-04 — buton layout'taki global CtaBand'dan geliyor. WORK üst
          menüde yok; bu bağlantı onun ana giriş noktalarından biri. */}
      <section className={styles.cta}>
        <p className={styles.ctaLead}>
          {t("ctaLead")} <Link href="/work">→ WORK</Link>
        </p>
      </section>
    </div>
  );
}
