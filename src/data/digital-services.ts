/**
 * DIG-03 — Digital sayfası hizmet listesi (10 madde). Deck notu: "Başlıklar
 * iki dilde de İngilizce kalır; Türkçe sürümde yalnızca açıklama satırları
 * çevrilir."
 *
 * 30 Ağustos 2026 QA denetimi: `tr` alanları İngilizce kopya taşıyordu, yani
 * TR sayfada on satırlık İngilizce gövde metni görünüyordu. Açıklamalar
 * Türkçeye çevrildi — anlam birebir korundu, yeni iddia veya rakam
 * eklenmedi. Başlıklar ve sektör terimleri (CGI, packshot, cutdown, key
 * visual, OOH, Reels/Shorts) marka/teknik terminoloji olarak İngilizce
 * kaldı; deck notunun istediği ayrım budur.
 */
export interface DigitalServiceItem {
  title: string;
  en: string;
  tr: string;
}

export const digitalServices: DigitalServiceItem[] = [
  {
    title: "Social Content",
    en: "Platform-native content for Instagram, TikTok, YouTube, LinkedIn and beyond.",
    tr: "Instagram, TikTok, YouTube, LinkedIn ve ötesi için platforma özgü içerik.",
  },
  {
    title: "Reach & Reactive Content",
    en: "Fast, culturally relevant content designed to capture attention, join conversations and extend brand reach.",
    tr: "Dikkat çekmek, gündeme dahil olmak ve markanın erişimini genişletmek için hızlı ve kültürel olarak yerinde içerik.",
  },
  {
    title: "Content Production",
    en: "From concept, scripting and art direction to shooting, editing, adaptation and delivery.",
    tr: "Konsept, senaryo ve sanat yönetiminden çekime, kurguya, adaptasyona ve teslime kadar.",
  },
  {
    title: "Motion & Animation",
    en: "Motion graphics, 2D/3D animation, kinetic typography, transitions and visual effects.",
    tr: "Motion grafik, 2D/3D animasyon, kinetik tipografi, geçişler ve görsel efektler.",
  },
  {
    title: "CGI & 3D",
    en: "CGI films, product visualization, 3D environments, simulations and impossible-to-shoot visuals.",
    tr: "CGI filmler, ürün görselleştirme, 3D ortamlar, simülasyonlar ve çekilmesi imkânsız görseller.",
  },
  {
    title: "AI-Powered Content",
    en: "AI-assisted image and video creation, generative visuals, concept development, content variations and hybrid AI-production workflows.",
    tr: "AI destekli görsel ve video üretimi, üretken görseller, konsept geliştirme, içerik varyasyonları ve hibrit AI-prodüksiyon iş akışları.",
  },
  {
    title: "Product & Packshot Content",
    en: "High-end product films, photography, digital packshots and visual assets built for campaigns and always-on content.",
    tr: "Üst segment ürün filmleri, fotoğraf, dijital packshot ve kampanyalarla sürekli yayında içerik için üretilen görsel varlıklar.",
  },
  {
    title: "Short-Form Video",
    en: "Instagram Reels, TikTok, YouTube Shorts, cutdowns, vertical films and platform-specific edits designed for attention.",
    tr: "Instagram Reels, TikTok, YouTube Shorts, cutdown’lar, dikey filmler ve dikkat için tasarlanmış platforma özel kurgular.",
  },
  {
    title: "Content Adaptation",
    en: "One idea, multiple formats. We create channel-specific versions, cutdowns, ratios, languages and asset variations at scale.",
    tr: "Tek fikir, çok format. Kanala özel sürümleri, cutdown’ları, oranları, dilleri ve varlık varyasyonlarını ölçekli üretiyoruz.",
  },
  {
    title: "Digital Campaign Assets",
    en: "Key visuals, campaign films, social assets, banners, animations, digital OOH and launch content.",
    tr: "Key visual’lar, kampanya filmleri, sosyal medya varlıkları, bannerlar, animasyonlar, dijital OOH ve lansman içerikleri.",
  },
];
