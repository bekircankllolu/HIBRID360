/**
 * Site görselleri kaydı.
 *
 * `focus`: `object-fit: cover` ile kırpılan yüzeylerde `object-position`
 * değeri. Varsayılan merkez kırpma çoğu görselde doğru; yalnızca kaynak
 * oranı hedef kutudan belirgin biçimde uzaksa odak noktası belirtilir.
 * Ölçüm ve gerekçe ilgili girdinin yorumunda.
 */
export const siteImages = {
  home: {
    makeBrand: {
      src: "/images/site/home/make-brand.webp",
      alt: "Production camera in a dark studio setup",
    },
    closing: {
      src: "/images/site/home/closing-bicycle.webp",
      alt: "Black and white bicycle handlebar detail",
    },
    closingBody: {
      src: "/images/site/home/moon-scroll-poster.webp",
      videoSrc: "/videos/home-moon-scroll.mp4",
      alt: "Two cyclists crossing a luminous yellow moon",
    },
  },
  work: {
    story: {
      src: "/images/site/work/story-clapper.webp",
      alt: "A clapperboard marked Your Story on a vivid production set",
    },
  },
  culture: {
    standFor: {
      src: "/images/site/culture/what-we-stand-for-cinematic.webp",
      alt: {
        tr: "Dayanışma içinde kenetlenmiş iki elin siyah beyaz yakın planı",
        en: "Black-and-white close-up of two hands clasped in solidarity",
      },
    },
  },
  thinkAndThank: {
    strategy: {
      src: "/images/site/think-and-thank/strategy.webp",
      alt: {
        tr: "Siyah katmanlar, saydam yüzeyler ve sarı ibreden oluşan editoryal pusula",
        en: "Editorial compass made of black layers, clear surfaces and a yellow pointer",
      },
    },
    production: {
      src: "/images/site/think-and-thank/production.webp",
      alt: {
        tr: "Kamera, film şeridi ve sarı ışıkla kurulan editoryal prodüksiyon kompozisyonu",
        en: "Editorial production composition with a camera, film strip and yellow light",
      },
    },
    ai: {
      src: "/images/site/think-and-thank/ai.webp",
      alt: {
        tr: "Saydam katmanlar ve hareket çizgilerinden oluşan yapay zekâ başı",
        en: "Artificial intelligence head formed from clear layers and motion lines",
      },
    },
    culture: {
      src: "/images/site/think-and-thank/culture.webp",
      alt: {
        tr: "Kulak, ses çatalı ve sarı plakla kurulan kinetik kültür kompozisyonu",
        en: "Kinetic culture composition with an ear, tuning fork and yellow record",
      },
    },
    // Müşteriden hazır grafik olarak gelen marka manifestosu görselleri
    // (8 Eylül 2026 e-posta eki) — metin görselin içine gömülü, ayrıca
    // sayfa kopyası olarak tekrarlanmaz.
    statementStory: {
      src: "/images/site/think-and-thank/statement-your-story.webp",
      alt: {
        tr: "Pembe zemin üzerinde kırmızı, krem ve mavi renklerle “IT’S YOUR STORY. MAKE IT MATTER. HYPE THE VIBE. AMPLIFY THE IMPACT.” yazan kalp biçimli mücevher illüstrasyonu",
        en: "Heart-shaped faceted gem illustration on a pink background reading “IT’S YOUR STORY. MAKE IT MATTER. HYPE THE VIBE. AMPLIFY THE IMPACT.” in red, cream and blue",
      },
    },
    statementPure: {
      src: "/images/site/think-and-thank/statement-pure-simple-powerful.webp",
      alt: {
        tr: "Sarı zemin üzerinde siyah büyük harflerle 'PURE. SIMPLE. POWERFUL.' yazısı",
        en: "Bold black type reading 'PURE. SIMPLE. POWERFUL.' on a yellow background",
      },
    },
    statementImpact: {
      src: "/images/site/think-and-thank/statement-idea-to-impact.webp",
      alt: {
        tr: "Siyah zemin üzerinde beyaz ve fuşya harflerle “FROM IDEA TO IMPACT WE MAKE BRANDS MOVE” yazısı, IMPACT kelimesi fuşya renkte",
        en: "White and fuchsia type reading “FROM IDEA TO IMPACT WE MAKE BRANDS MOVE” on a black background, with IMPACT highlighted in fuchsia",
      },
    },
  },
  services: {
    creative: {
      src: "/images/site/services/creative-editorial-v2.webp",
      alt: {
        tr: "İstanbul'daki aydınlık stüdyoda kampanya görselleri üzerinde çalışan kreatif ekip",
        en: "Creative team working on campaign imagery in a bright Istanbul studio",
      },
      focus: "50% 50%",
    },
    production: {
      src: "/images/site/services/production-editorial-v2.webp",
      alt: {
        tr: "Aydınlık bir film setinde sinema kamerası çevresinde çalışan yönetmen ve prodüksiyon ekibi",
        en: "Director and production crew working around a cinema camera on a bright film set",
      },
      focus: "50% 50%",
    },
    postProduction: {
      src: "/images/site/services/post-production-editorial-v2.webp",
      alt: {
        tr: "Renk düzenleme konsolunda bir film üzerinde çalışan post prodüksiyon ekibi",
        en: "Post-production team working on a film at a colour-grading console",
      },
      focus: "54% 50%",
    },
    digital: {
      src: "/images/site/services/digital-editorial-v2.webp",
      alt: {
        tr: "İstanbul'daki içerik stüdyosunda ürün çekimi hazırlayan dijital ekip",
        en: "Digital team preparing a product shoot in an Istanbul content studio",
      },
      focus: "50% 50%",
    },
    liveBroadcast: {
      src: "/images/site/services/live-broadcast-editorial-v2.webp",
      alt: {
        tr: "İstanbul'daki canlı etkinliği yöneten çok kameralı yayın ekibi",
        en: "Multi-camera broadcast crew directing a live event in Istanbul",
      },
      focus: "50% 50%",
    },
    cloudTv: {
      src: "/images/site/services/cloud-tv-editorial-v2.webp",
      alt: {
        tr: "Çok ekranlı bulut yayın stüdyosunda kanal akışını yöneten ekip",
        en: "Team managing a channel feed in a multi-screen cloud broadcast studio",
      },
      focus: "55% 50%",
    },
    eventManagement: {
      src: "/images/site/services/event-management-editorial-v2.webp",
      alt: {
        tr: "İstanbul'daki bir etkinliğin sahne kurulumunu yöneten prodüksiyon ekibi",
        en: "Production team directing an event stage setup in Istanbul",
      },
      focus: "52% 50%",
    },
    photography: {
      src: "/images/site/services/photography.webp",
      alt: {
        tr: "Siyah beyaz portre çekimi kurulumu",
        en: "Black and white portrait production setup",
      },
      focus: "50% 50%",
    },
  },
} as const;
