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
 * kararı). Henüz açılmamış sayfalar `ready: false` ile işaretli ve
 * WHAT WE DO listesine bağlanıyor — kırık link üretilmiyor.
 *
 * TODO: brief Bölüm 12 — Production, Digital, Creative, Live Broadcast,
 * Photography sayfaları mevcut siteden taşınınca href'ler kendi
 * sayfalarına çevrilip ready:true yapılacak.
 */
export interface OrbitStone {
  orbit: number;
  label: string;
  href: string;
  ready: boolean;
}

export const orbitStones: OrbitStone[] = [
  { orbit: 1, label: "PRODUCTION", href: "/what-we-do", ready: false },
  { orbit: 2, label: "DIGITAL", href: "/what-we-do", ready: false },
  { orbit: 3, label: "CREATIVE", href: "/what-we-do", ready: false },
  {
    orbit: 4,
    label: "AI",
    href: "/what-we-do/ai-creative-production",
    ready: true,
  },
  { orbit: 5, label: "LIVE BROADCAST", href: "/what-we-do", ready: false },
  { orbit: 6, label: "PHOTOGRAPHY", href: "/what-we-do", ready: false },
  { orbit: 7, label: "POST PRODUCTION", href: "/what-we-do", ready: false },
  { orbit: 8, label: "EVENTS", href: "/what-we-do", ready: false },
];

/** brief Bölüm 4.5 — bölüm başlığı sloganı. */
export const SOLAR_SYSTEM_TITLE = "One Hybrid Production Ecosystem.";
