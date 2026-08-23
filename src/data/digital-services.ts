/**
 * DIG-03 — Digital sayfası hizmet listesi (10 madde). Deck notu: "Başlıklar
 * iki dilde de İngilizce kalır; Türkçe sürümde yalnızca açıklama satırları
 * çevrilir." Ancak deck açıklamaların gerçek TR çevirisini vermedi —
 * yalnızca talimatı verdi. CLAUDE.md kuralı gereği onaylanmamış bir
 * çeviri uydurulmadı; açıklamalar şimdilik iki locale'de de İngilizce.
 *
 * TODO: brief DIG-03 — bu 10 açıklamanın profesyonel TR çevirisi
 * müşteriden onaylanınca `tr` alanları doldurulacak.
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
    tr: "Platform-native content for Instagram, TikTok, YouTube, LinkedIn and beyond.",
  },
  {
    title: "Reach & Reactive Content",
    en: "Fast, culturally relevant content designed to capture attention, join conversations and extend brand reach.",
    tr: "Fast, culturally relevant content designed to capture attention, join conversations and extend brand reach.",
  },
  {
    title: "Content Production",
    en: "From concept, scripting and art direction to shooting, editing, adaptation and delivery.",
    tr: "From concept, scripting and art direction to shooting, editing, adaptation and delivery.",
  },
  {
    title: "Motion & Animation",
    en: "Motion graphics, 2D/3D animation, kinetic typography, transitions and visual effects.",
    tr: "Motion graphics, 2D/3D animation, kinetic typography, transitions and visual effects.",
  },
  {
    title: "CGI & 3D",
    en: "CGI films, product visualization, 3D environments, simulations and impossible-to-shoot visuals.",
    tr: "CGI films, product visualization, 3D environments, simulations and impossible-to-shoot visuals.",
  },
  {
    title: "AI-Powered Content",
    en: "AI-assisted image and video creation, generative visuals, concept development, content variations and hybrid AI-production workflows.",
    tr: "AI-assisted image and video creation, generative visuals, concept development, content variations and hybrid AI-production workflows.",
  },
  {
    title: "Product & Packshot Content",
    en: "High-end product films, photography, digital packshots and visual assets built for campaigns and always-on content.",
    tr: "High-end product films, photography, digital packshots and visual assets built for campaigns and always-on content.",
  },
  {
    title: "Short-Form Video",
    en: "Instagram Reels, TikTok, YouTube Shorts, cutdowns, vertical films and platform-specific edits designed for attention.",
    tr: "Instagram Reels, TikTok, YouTube Shorts, cutdowns, vertical films and platform-specific edits designed for attention.",
  },
  {
    title: "Content Adaptation",
    en: "One idea, multiple formats. We create channel-specific versions, cutdowns, ratios, languages and asset variations at scale.",
    tr: "One idea, multiple formats. We create channel-specific versions, cutdowns, ratios, languages and asset variations at scale.",
  },
  {
    title: "Digital Campaign Assets",
    en: "Key visuals, campaign films, social assets, banners, animations, digital OOH and launch content.",
    tr: "Key visuals, campaign films, social assets, banners, animations, digital OOH and launch content.",
  },
];
