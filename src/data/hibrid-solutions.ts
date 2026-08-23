/**
 * PRO-03 — altı maddelik "ne yapıyoruz" listesi. CTV-05 notu: "Aynı liste
 * iki sayfada birebir tekrar ediyor. Öneri: Cloud TV sayfasında listenin
 * kısaltılmış üç maddelik hâli kullanılsın, tamamı Production sayfasında
 * kalsın." Bu öneri uygulandı — tek kaynak burada, Cloud TV sayfası
 * `.slice(0, 3)` ile kısaltılmış hâlini kullanıyor.
 */
export interface HibridSolutionLine {
  en: string;
  tr: string;
}

export const hibridSolutions: HibridSolutionLine[] = [
  {
    en: "Art directors create your corporate image and your designs,",
    tr: "Art direktörler kurumsal görselinizi ve tasarımlarınızı üretir,",
  },
  {
    en: "Writers prepare your content,",
    tr: "Metin yazarları içeriğinizi hazırlar,",
  },
  {
    en: "Video artists create your animations and your signature images,",
    tr: "Video sanatçıları animasyonlarınızı ve imza görsellerinizi kurar,",
  },
  {
    en: "Digital production crews shoot your content, and the editing crew provides the final touch for your videos.",
    tr: "Dijital prodüksiyon ekipleri içeriğinizi çeker, kurgu ekibi videolarınızın son rötuşunu yapar.",
  },
  {
    en: "Live content is broadcast — if you so choose — from your factory, sales points or company headquarters via remote broadcast and/or a studio environment, with a dedicated director and production crew.",
    tr: "İsterseniz canlı içerik; fabrikanızdan, satış noktalarınızdan veya genel merkezinizden uzaktan yayınla ve/veya stüdyo ortamında, kendi yönetmeni ve prodüksiyon ekibiyle yayınlanır.",
  },
  {
    en: "We shoot promotional videos for events, products and training, corporate social media and factory facilities, and prepare 3D–2D animation, infographics, motion graphics, track motion and desktop videos.",
    tr: "Etkinlik, ürün ve eğitim videoları, kurumsal sosyal medya ve fabrika tanıtım filmleri çekiyor; 3D–2D animasyon, infografik, motion graphic, track motion ve masaüstü videolar hazırlıyoruz.",
  },
];
