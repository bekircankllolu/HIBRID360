/**
 * HOME-06 — ana sayfa hizmet linkleri satırı. Etiketler ve sıralama
 * EN/TR'de aynı (deck: "EN + TR (aynı)"), bu yüzden i18n mesajlarına değil
 * buraya konuldu.
 *
 * `ready: false` olan hedefler henüz açılmamış What We Do alt sayfalarına
 * (bkz. src/app/[locale]/what-we-do/page.tsx PENDING_PAGES) işaret eder —
 * kırık link üretilmemesi için hepsi hub'a yönlendirilir; ilgili alt sayfa
 * açıldığında (bkz. task #18) href + ready burada güncellenecek.
 */
export interface ServiceLink {
  label: string;
  href: string;
  ready: boolean;
}

export const SERVICE_LINKS: ServiceLink[] = [
  { label: "CREATIVE", href: "/what-we-do", ready: false },
  { label: "DIGITAL", href: "/what-we-do", ready: false },
  { label: "LIVE BROADCAST", href: "/what-we-do", ready: false },
  { label: "CLOUD TV", href: "/what-we-do", ready: false },
  { label: "PRODUCTION", href: "/what-we-do", ready: false },
  { label: "POST PRODUCTION", href: "/what-we-do", ready: false },
  { label: "EVENT MANAGEMENT", href: "/what-we-do", ready: false },
  { label: "PHOTOGRAPHY", href: "/what-we-do", ready: false },
  {
    label: "AI CREATIVE PRODUCTION",
    href: "/what-we-do/ai-creative-production",
    ready: true,
  },
];
