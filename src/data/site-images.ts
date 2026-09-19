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
  /**
   * What We Do hizmet görselleri — v4 seti (19 Eylül 2026).
   *
   * Sekizi de TEK bir prompt ailesinden üretildi: siyah baskın kadraj, tek
   * pratik sarı ışık kaynağı, tek küçük fuşya gösterge, 50mm f/2 sığ alan
   * derinliği. Sanat yönetimi ve kabul ölçütleri
   * `docs/design/WHAT_WE_DO_VISUAL_LANGUAGE.md`; türevler
   * `scripts/generate-service-photos-v4.mjs` (2400x1600 webp, q82).
   *
   * v3'teki marka sarısı DUOTONE kalktı: birliği artık sahnenin kendisi
   * kuruyor, görsele sürülen bir filtre değil. Yüzler gerçek bir kişiye
   * benzemiyor ve hiçbirinde yazı/logo/filigran yok.
   */
  services: {
    creative: {
      src: "/images/site/services/creative-photo-v4.webp",
      alt: {
        tr: "Karanlık bir stüdyoda masaya yayılmış storyboard karelerinin üzerine eğilmiş iki kişi, biri bir kareyi işaret ediyor",
        en: "Two people leaning over storyboard frames spread across a table in a dark studio, one pointing at a frame",
      },
      focus: "50% 50%",
    },
    production: {
      src: "/images/site/services/production-photo-v4.webp",
      alt: {
        tr: "Gece çekiminde sinema kamerası kurulumunda çalışan operatörün elleri, monitör ışığı yüzüne vuruyor",
        en: "A camera operator's hands on a cinema camera rig at a night shoot, the monitor lighting their face",
      },
      focus: "50% 50%",
    },
    postProduction: {
      src: "/images/site/services/post-production-photo-v4.webp",
      alt: {
        tr: "Karanlık bir renk odasında grading masasında çalışan kolorist, trackball paneli alttan aydınlatılmış",
        en: "A colourist working at a grading desk in a dark suite, the trackball panel lit from below",
      },
      focus: "50% 50%",
    },
    digital: {
      src: "/images/site/services/digital-photo-v4.webp",
      alt: {
        tr: "Loş bir odada küçük ekranlardan oluşan duvarda dikey sosyal medya kurgularını inceleyen ekip",
        en: "A team reviewing vertical social edits on a wall of small screens in a dim room",
      },
      focus: "50% 50%",
    },
    liveBroadcast: {
      src: "/images/site/services/live-broadcast-photo-v4.webp",
      alt: {
        tr: "Karanlık yayın odasında switcher üzerindeki eller, arkada odak dışı önizleme monitörleri",
        en: "Hands over a broadcast switcher in a dark gallery, preview monitors out of focus behind",
      },
      focus: "50% 50%",
    },
    cloudTv: {
      src: "/images/site/services/cloud-tv-photo-v4.webp",
      alt: {
        tr: "Sunucu raflarının arasındaki dar koridorda dizüstü bilgisayarla çalışan mühendis, iki yanda uzanan durum ışıkları",
        en: "An engineer working on a laptop in a narrow aisle between server racks, status lights receding on both sides",
      },
      focus: "50% 50%",
    },
    eventManagement: {
      src: "/images/site/services/event-management-photo-v4.webp",
      alt: {
        tr: "Işık provasında boş arena sahnesinin kenarında kulaklıklı ve panolu sahne amiri",
        en: "A stage manager with a headset and clipboard at the edge of an empty arena stage during a lighting check",
      },
      focus: "50% 50%",
    },
    photography: {
      src: "/images/site/services/photography-photo-v4.webp",
      alt: {
        tr: "Karanlık bir sette softbox ayarlayan fotoğrafçı, modelling ışığı zemine yayılıyor",
        en: "A photographer adjusting a softbox on a dark set, the modelling light spilling across the floor",
      },
      focus: "50% 50%",
    },
  },
} as const;
