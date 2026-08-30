import {
  SITE_URL,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_TAGLINE_TR,
  SOCIAL_LINKS,
  CONTACT,
} from "@/lib/site";
import type { Locale } from "@/i18n/routing";

/**
 * schema.org yapılandırılmış veri üreticileri — CLAUDE.md / brief-rev12.md
 * Bölüm 1.7 (GEO / AI görünürlüğü): Organization, LocalBusiness,
 * VideoObject, BreadcrumbList.
 */

export function organizationJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/${locale}`,
    // brief Bölüm 5: aynı tanım cümlesi meta description + LinkedIn bio'da
    // da kullanılıyor — tek kaynak burası.
    description: locale === "tr" ? SITE_TAGLINE_TR : SITE_TAGLINE,
    // TODO: DECISIONS.md #1 — şirket ünvanı netleşince "legalName" eklenecek.
    // TODO: brief 16 — logo görseli teslim edilince "logo"/"image" eklenecek.
    telephone: CONTACT.phone,
    email: CONTACT.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.streetAddress,
      addressLocality: CONTACT.addressLocality,
      addressCountry: CONTACT.addressCountry,
    },
    sameAs: SOCIAL_LINKS.map((link) => link.href),
  };
}

export function breadcrumbListJsonLd(
  locale: Locale,
  items: Array<{ name: string; path: string }>,
) {
  const trNames: Record<string, string> = {
    Home: "Ana Sayfa",
    Work: "İşler",
    Contact: "İletişim",
    Clients: "Müşteriler",
    Culture: "Kültür",
    Sustainability: "Sürdürülebilirlik",
    Insights: "İçgörüler",
    Partners: "İş Ortakları",
    "Who We Are": "Biz Kimiz",
    "What We Do": "Ne Yapıyoruz",
    "What We Believe": "Neye İnanıyoruz",
    "Directors & Crew": "Yönetmenler ve Ekip",
    "Accessibility Statement": "Erişilebilirlik Beyanı",
    "Brief Builder": "Brief Oluşturucu",
  };

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: locale === "tr" ? (trNames[item.name] ?? item.name) : item.name,
      item: `${SITE_URL}/${locale}${item.path}`,
    })),
  };
}

/**
 * Faz 2+'de gerçek video varlıkları (Works vaka filmleri, testimonial
 * videoları, Culture kurucu videosu) bağlandığında kullanılacak. Faz 1'de
 * henüz hiçbir sayfada çağrılmıyor — video varlığı yok.
 */
export function videoObjectJsonLd(props: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl?: string;
  embedUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: props.name,
    description: props.description,
    thumbnailUrl: props.thumbnailUrl,
    uploadDate: props.uploadDate,
    ...(props.contentUrl ? { contentUrl: props.contentUrl } : {}),
    ...(props.embedUrl ? { embedUrl: props.embedUrl } : {}),
  };
}
