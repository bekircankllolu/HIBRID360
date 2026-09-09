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
      src: "/images/site/services/creative.webp",
      alt: {
        tr: "Ampuller ve kampanya planlama materyalleri bulunan kreatif çalışma masası",
        en: "Creative desk with light bulbs and campaign planning materials",
      },
      // creative.webp 1920x614 (3.13:1) — panoramik bir kare. 3/2'lik
      // kart kutusuna merkezden kırpılınca pencere x=499..1420'e düşüyor
      // ve "design" kelimesini ortadan kesiyordu ("esign" görünüyordu).
      // %31 kadrajda pencere x=305..1226 oluyor: "design thinking" bütün
      // kalıyor ve kırpma kenarları ampuller arasındaki karanlık boşluğa
      // denk geliyor (sütun parlaklığı ölçülerek seçildi).
      focus: "31% 50%",
    },
    production: {
      src: "/images/site/services/production.webp",
      alt: {
        tr: "Prodüksiyon çekiminde kamera kurulumu",
        en: "Camera setup on a production shoot",
      },
      focus: "50% 50%",
    },
    postProduction: {
      src: "/images/site/services/post-production.webp",
      alt: {
        tr: "Kurgu stüdyosunda post prodüksiyon ekranları",
        en: "Post production screens in an editing suite",
      },
      focus: "50% 50%",
    },
    digital: {
      src: "/images/site/services/digital.webp",
      alt: {
        tr: "Renkli bir dijital içerik sahnesinde akıllı telefon kullanan eller",
        en: "Hands using a smartphone in a colorful digital content scene",
      },
      focus: "50% 50%",
    },
    liveBroadcast: {
      src: "/images/site/services/live-broadcast.webp",
      alt: {
        tr: "Yayında tabelasıyla birlikte profesyonel yayın kamerası objektifi",
        en: "Broadcast camera lens with an on air sign",
      },
      focus: "50% 50%",
    },
    cloudTv: {
      src: "/images/site/services/cloud-tv.webp",
      alt: {
        tr: "Çok ekranlı yayın kontrol odası",
        en: "Multi-screen broadcast control room",
      },
      focus: "50% 50%",
    },
    eventManagement: {
      src: "/images/site/services/event-management.webp",
      alt: {
        tr: "Canlı etkinlik için sahne ışıklandırması",
        en: "Stage lighting for a live event",
      },
      focus: "50% 50%",
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
