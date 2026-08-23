/**
 * HOME-06 — ana sayfa hizmet linkleri satırı. Etiketler ve sıralama
 * EN/TR'de aynı (deck: "EN + TR (aynı)"), bu yüzden i18n mesajlarına değil
 * buraya konuldu.
 *
 * Tüm sekiz What We Do alt sayfası + AI Creative Production task #18 ile
 * açıldı; her href artık kendi gerçek sayfasına gidiyor.
 */
export interface ServiceLink {
  label: string;
  href: string;
  ready: boolean;
}

export const SERVICE_LINKS: ServiceLink[] = [
  { label: "CREATIVE", href: "/what-we-do/creative", ready: true },
  { label: "DIGITAL", href: "/what-we-do/digital", ready: true },
  { label: "LIVE BROADCAST", href: "/what-we-do/live-broadcast", ready: true },
  { label: "CLOUD TV", href: "/what-we-do/cloud-tv", ready: true },
  { label: "PRODUCTION", href: "/what-we-do/production", ready: true },
  { label: "POST PRODUCTION", href: "/what-we-do/post-production", ready: true },
  { label: "EVENT MANAGEMENT", href: "/what-we-do/event-management", ready: true },
  { label: "PHOTOGRAPHY", href: "/what-we-do/photography", ready: true },
  {
    label: "AI CREATIVE PRODUCTION",
    href: "/what-we-do/ai-creative-production",
    ready: true,
  },
];
