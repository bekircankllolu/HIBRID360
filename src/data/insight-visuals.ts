import { siteImages } from "@/data/site-images";
import type { Locale } from "@/i18n/routing";
import type { InsightsPost } from "@/types/content";

export type InsightTone = "mint" | "pink" | "lilac" | "paper";
export type InsightVisualKey = keyof typeof siteImages.thinkAndThank;

type InsightVisual = {
  key: string;
  tone: InsightTone;
  src: string;
  alt: Record<Locale, string>;
};

const baseVisuals: Record<InsightVisualKey, InsightVisual> = {
  strategy: {
    key: "strategy",
    tone: "mint",
    src: siteImages.thinkAndThank.strategy.src,
    alt: siteImages.thinkAndThank.strategy.alt,
  },
  production: {
    key: "production",
    tone: "pink",
    src: siteImages.thinkAndThank.production.src,
    alt: siteImages.thinkAndThank.production.alt,
  },
  ai: {
    key: "ai",
    tone: "lilac",
    src: siteImages.thinkAndThank.ai.src,
    alt: siteImages.thinkAndThank.ai.alt,
  },
  culture: {
    key: "culture",
    tone: "paper",
    src: siteImages.thinkAndThank.culture.src,
    alt: siteImages.thinkAndThank.culture.alt,
  },
};

const articleVisuals: Record<string, InsightVisual> = {
  "mag-01": baseVisuals.strategy,
  "mag-02": {
    key: "brand-identity",
    tone: "mint",
    src: "/images/site/think-and-thank/mag-02.webp",
    alt: {
      tr: "Sarı bir çekirdek çevresinde açılan modüler marka kimliği heykeli",
      en: "Modular brand identity sculpture unfolding around a yellow core",
    },
  },
  "mag-03": {
    key: "creative-direction",
    tone: "lilac",
    src: "/images/site/think-and-thank/mag-03.webp",
    alt: {
      tr: "Kadraj ve ışık parçalarından oluşan yaratıcı yönetim sahnesi",
      en: "Creative direction scene assembled from framing and lighting elements",
    },
  },
  "mag-04": baseVisuals.production,
  "mag-05": baseVisuals.ai,
  "mag-06": {
    key: "photography",
    tone: "pink",
    src: "/images/site/think-and-thank/mag-06.webp",
    alt: {
      tr: "Sarı ışığı kıran siyah kamera diyaframı ve aynalı yüzey",
      en: "Black camera aperture and mirrored surface refracting yellow light",
    },
  },
  "mag-07": baseVisuals.culture,
  "mag-08": {
    key: "social-media",
    tone: "paper",
    src: "/images/site/think-and-thank/mag-08.webp",
    alt: {
      tr: "Konuşma biçimleri ve sinyal disklerinden oluşan sosyal içerik mobili",
      en: "Social content mobile made of conversation forms and signal discs",
    },
  },
  "mag-09": {
    key: "digital-seo",
    tone: "mint",
    src: "/images/site/think-and-thank/mag-09.webp",
    alt: {
      tr: "Sarı hedefe ilerleyen saydam dijital deneyim labirenti",
      en: "Transparent digital experience maze leading to a yellow destination",
    },
  },
  "mag-10": {
    key: "analytics",
    tone: "lilac",
    src: "/images/site/think-and-thank/mag-10.webp",
    alt: {
      tr: "Yaratıcı verinin ritmini gösteren ölçüm yayları ve sarı küre",
      en: "Measuring arcs and yellow sphere showing the rhythm of creative data",
    },
  },
  "mag-11": {
    key: "art-direction",
    tone: "pink",
    src: "/images/site/think-and-thank/mag-11.webp",
    alt: {
      tr: "Sarı spot ışığıyla kurulmuş minyatür sanat yönetimi sahnesi",
      en: "Miniature art direction stage built around a yellow spotlight",
    },
  },
  "mag-12": {
    key: "design-production",
    tone: "paper",
    src: "/images/site/think-and-thank/mag-12.webp",
    alt: {
      tr: "Tasarım ve prodüksiyon aşamalarını birleştiren kesintisiz siyah şerit",
      en: "Continuous black ribbon connecting design and production stages",
    },
  },
  "mag-13": {
    key: "food-styling",
    tone: "mint",
    src: "/images/site/think-and-thank/mag-13.webp",
    alt: {
      tr: "Kiraz, saydam küpler ve sarı tabaktan oluşan food styling kompozisyonu",
      en: "Food styling composition with a cherry, clear cubes and yellow plate",
    },
  },
  "mag-14": {
    key: "food-technique",
    tone: "lilac",
    src: "/images/site/think-and-thank/mag-14.webp",
    alt: {
      tr: "Pipet, doku tarağı ve sarı sırdan oluşan food styling araçları",
      en: "Food styling tools made of a pipette, texture comb and yellow glaze",
    },
  },
  "mag-15": {
    key: "live-streaming",
    tone: "pink",
    src: "/images/site/think-and-thank/mag-15.webp",
    alt: {
      tr: "Kamera gözleri ve yedekli sinyal yollarından oluşan canlı yayın sistemi",
      en: "Live broadcast system formed from camera eyes and redundant signal paths",
    },
  },
  "mag-16": {
    key: "cloud-tv",
    tone: "mint",
    src: "/images/site/think-and-thank/mag-16.webp",
    alt: {
      tr: "Anten çevresinde dönen saydam ekranlardan oluşan Cloud TV heykeli",
      en: "Cloud TV sculpture made of clear screens orbiting an antenna",
    },
  },
  "mag-17": {
    key: "factory-film",
    tone: "paper",
    src: "/images/site/think-and-thank/mag-17.webp",
    alt: {
      tr: "Sarı ışık yoluyla birbirine bağlanan soyut fabrika yapıları",
      en: "Abstract factory structures connected by a yellow path of light",
    },
  },
  "mag-18": {
    key: "product-film",
    tone: "lilac",
    src: "/images/site/think-and-thank/mag-18.webp",
    alt: {
      tr: "Hareket yayları arasında kullanım anında gösterilen siyah ürün",
      en: "Black product shown in a moment of use between motion arcs",
    },
  },
  "mag-19": {
    key: "content-system",
    tone: "pink",
    src: "/images/site/think-and-thank/mag-19.webp",
    alt: {
      tr: "Tek fikri farklı çıktılara dönüştüren modüler içerik üretim sistemi",
      en: "Modular content production system transforming one idea into many outputs",
    },
  },
};

const fallbackByCategory: Record<string, InsightVisualKey> = {
  strategy: "strategy",
  "brand-identity": "strategy",
  "creative-direction": "strategy",
  "art-direction": "strategy",
  "design-production": "strategy",
  "film-production": "production",
  photography: "production",
  "food-styling": "production",
  "food-styling-technique": "production",
  "factory-film": "production",
  "product-films": "production",
  "ai-production": "ai",
  "social-media": "ai",
  "digital-seo": "ai",
  analytics: "ai",
  "global-agenda": "ai",
  "sound-music": "culture",
  "live-streaming": "culture",
  "cloud-tv": "culture",
};

export function getInsightVisual(post: InsightsPost, locale: Locale) {
  const fallbackKey = (post.category && fallbackByCategory[post.category]) || "culture";
  const visual = articleVisuals[post.id] || baseVisuals[fallbackKey];

  return {
    key: visual.key,
    tone: visual.tone,
    src: visual.src,
    alt: visual.alt[locale],
  };
}
