/**
 * Güneş sistemi — brief-rev12.md Bölüm 4.5 "Hibrid taşları".
 *
 * Merkezde HİBRİD (güneş), sekiz yörüngede birer taş; her taş bir iş
 * alanını temsil eder ve tıklanınca ilgili hizmet sayfasına gider.
 * Yörünge sırası ve etiketler brief'teki tablodan birebir.
 *
 * `href` alanı bu kod tabanındaki gerçek rota yapısına uyarlanmıştır
 * (brief tabloda /production, /digital gibi kök yollar veriyor; sitede
 * bu sayfalar WHAT WE DO altında toplanıyor — bkz. brief Bölüm 3.1 menü
 * kararı). Sekiz alt sayfanın tamamı task #18 ile açıldı; tüm taşlar artık
 * kendi gerçek sayfasına gidiyor.
 *
 * Taş görseli: müşteriden teslim edildi (hibrid360_hibridtaslar paketi) —
 * AI ile üretilmiş, düşük poligonlu Hibrid taşı; sarı ve fuşya varyantı
 * brief'in istediğiyle birebir eşleşiyor (bkz. public/images/stones/).
 * `color` alanı sekiz yörüngede iki rengi sırayla dağıtır.
 */
export interface OrbitStone {
  orbit: number;
  label: string;
  href: string;
  ready: boolean;
  color: "fuchsia" | "yellow";
}

export const orbitStones: OrbitStone[] = [
  { orbit: 1, label: "PRODUCTION", href: "/what-we-do/production", ready: true, color: "yellow" },
  { orbit: 2, label: "DIGITAL", href: "/what-we-do/digital", ready: true, color: "fuchsia" },
  { orbit: 3, label: "CREATIVE", href: "/what-we-do/creative", ready: true, color: "yellow" },
  {
    orbit: 4,
    label: "AI",
    href: "/what-we-do/ai-creative-production",
    ready: true,
    color: "fuchsia",
  },
  {
    orbit: 5,
    label: "LIVE BROADCAST",
    href: "/what-we-do/live-broadcast",
    ready: true,
    color: "yellow",
  },
  { orbit: 6, label: "PHOTOGRAPHY", href: "/what-we-do/photography", ready: true, color: "fuchsia" },
  {
    orbit: 7,
    label: "POST PRODUCTION",
    href: "/what-we-do/post-production",
    ready: true,
    color: "yellow",
  },
  {
    orbit: 8,
    label: "EVENTS",
    href: "/what-we-do/event-management",
    ready: true,
    color: "fuchsia",
  },
];

/** brief Bölüm 4.5 — bölüm başlığı sloganı. */
export const SOLAR_SYSTEM_TITLE = "One Hybrid Production Ecosystem.";
