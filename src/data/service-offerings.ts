/**
 * Hizmet kapsam listeleri — TEK KAYNAK.
 *
 * Bu diziler daha önce sekiz hizmet sayfasının içinde ayrı ayrı sabit
 * duruyordu. 18 Eylül 2026'da buraya taşındılar: ekosistem sahnesinin
 * gezegen paneli de aynı listeyi gösteriyor (kullanıcı: *"bir gezegenin
 * üzerine tıkladığımızda çok detaylı bir şekilde onun özelliklerini
 * görelim... şu an çok yüzeysel bir anlatım var"*). İki yerde iki kopya
 * tutmak, birinin güncellenip diğerinin unutulması demekti.
 *
 * METİN MARKA DİLİ: hepsi İngilizce ve iki dilde de aynı kalır
 * (CLAUDE.md i18n kuralı — sloganlar ve hizmet adları çevrilmez).
 * Onaylı metinlerdir, değiştirilmez.
 */

export const SERVICE_OFFERINGS = {
  creative: [
    "BRAND CONSULTANCY",
    "CORPORATE IDENTITY",
    "MARKETING PLAN AND STRATEGY",
    "CONCEPT DEVELOPMENT",
    "CONTENT GENERATION",
    "COMMERCIALS",
    "PACKAGING",
    "TV",
    "PRESS",
    "RADIO CAMPAIGNS",
  ],
  production: [
    "LIVE BROADCAST / STAGE DIRECTION",
    "FILM / VIDEO",
    "SOCIAL MEDIA VIDEOS",
    "VIRAL VIDEOS",
    "TV COMMERCIALS",
    "SHOWREELS",
    "ON-SITE VIDEOS",
    "INDUSTRIAL FILMS",
    "INTRODUCTORY / LAUNCH VIDEOS",
    "DRONE CAMERA SERVICES",
    "PHOTOGRAPHY",
  ],
  postProduction: [
    "EDITING",
    "COLOUR GRADING",
    "DUBBING",
    "AFTER EFFECTS",
    "JINGLE",
    "RE-TOUCH",
    "ILLUSTRATION",
    "STORYBOARD",
    "3D ANIMATION",
    "STYLING",
    "PHOTOGRAPHY",
    "MOTION GRAPHICS",
    "TRACK MOTION",
  ],
  digital: [
    "WEB DESIGN",
    "WEB DEVELOPMENT",
    "SEM & SEO",
    "SEEDING",
    "MAILING",
    "BANNERS",
    "SOCIAL MEDIA MANAGEMENT",
    "SOCIAL MEDIA ADVERTISING STRATEGY",
    "VIRAL VIDEOS",
    "E-NEWS",
    "GIF",
  ],
  liveBroadcast: [
    "ONLINE LIVE BROADCASTING",
    "LIVE BROADCAST WITH A SATELLITE UPLINK",
    "LIVE MEDICAL BROADCASTING",
    "LIVE REMOTE BROADCASTING",
  ],
  cloudTv: ["CONTENT", "INFRASTRUCTURE", "TRAINING & OPERATION"],
  eventManagement: [
    "EVENT ORGANISATION",
    "CONVENTIONS – CONFERENCES",
    "CONCERTS",
    "GUERRILLA MARKETING",
    "RETAIL MARKETING",
    "TRAVEL MARKETING",
    "CATERING",
    "EXHIBITION STANDS",
    "OUTDOOR PRINTING & APPLICATIONS",
    "PROMOTION STAFF",
    "PRINT STAFF",
  ],
  /**
   * AI Creative Production'ın kapsamı liste değil AKIŞ olarak anlatılıyor
   * (sayfadaki "İŞ AKIŞI" bandı: kreatif strateji → kreatif direksiyon →
   * üretim → post). Uydurma bir liste eklenmedi.
   */
  aiCreativeProduction: [] as string[],
} as const satisfies Record<string, readonly string[]>;

export type ServiceOfferingKey = keyof typeof SERVICE_OFFERINGS;
