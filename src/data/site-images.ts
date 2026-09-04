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
