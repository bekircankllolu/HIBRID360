import type { Locale } from "@/i18n/routing";

export const CULTURE_VALUES: Array<{
  title: string;
  body: Record<Locale, string>;
}> = [
  {
    title: "LIABILITY",
    body: {
      en: "We take ownership of the work, the process and the outcome. Trust is built by doing what we say we will do.",
      tr: "İşin, sürecin ve sonucun sorumluluğunu üstleniriz. Güven, verdiğimiz sözü yerine getirerek kurulur.",
    },
  },
  {
    title: "FRIENDSHIP",
    body: {
      en: "Strong work grows from honest relationships. We treat collaboration as a long-term partnership, not a transaction.",
      tr: "Güçlü işler dürüst ilişkilerden doğar. İş birliğini bir işlem değil, uzun vadeli bir ortaklık olarak görürüz.",
    },
  },
  {
    title: "FLEXIBILITY",
    body: {
      en: "We adapt teams, tools and workflows to the real needs of each project while protecting quality and clarity.",
      tr: "Kaliteyi ve netliği korurken ekipleri, araçları ve iş akışlarını her projenin gerçek ihtiyacına göre uyarlarız.",
    },
  },
  {
    title: "KINDNESS",
    body: {
      en: "How we make the work matters as much as the work itself. Respect and care are part of our creative standard.",
      tr: "İşi nasıl ürettiğimiz, ortaya çıkan iş kadar önemlidir. Saygı ve özen yaratıcı standardımızın bir parçasıdır.",
    },
  },
  {
    title: "ROOM TO GROW",
    body: {
      en: "We make space for individual potential, new skills and better questions. Learning keeps the studio moving forward.",
      tr: "Bireysel potansiyele, yeni becerilere ve daha iyi sorulara alan açarız. Öğrenmek stüdyoyu ileri taşır.",
    },
  },
  {
    title: "PROACTIVE",
    body: {
      en: "We do not wait for problems to become obstacles. We act early, propose solutions and embrace the technology that improves the result.",
      tr: "Sorunların engele dönüşmesini beklemeyiz. Erken harekete geçer, çözüm önerir ve sonucu geliştiren teknolojiyi benimseriz.",
    },
  },
];

export const CULTURE_INTRO: Record<Locale, string[]> = {
  en: [
    "Brands are living souls. The people who build them determine how they grow, how they behave and how they are remembered.",
    "Our golden rule is team first. Flexible work, strong relationships and individual development give talented people room to create their best work.",
    "We choose people who love growing, learning and creating. Loyalty is a two-way street, and culture is something we practise every day.",
  ],
  tr: [
    "Markalar yaşayan ruhlardır. Onları kuran insanlar nasıl büyüyeceklerini, nasıl davranacaklarını ve nasıl hatırlanacaklarını belirler.",
    "Altın kuralımız önce ekiptir. Esnek çalışma, güçlü ilişkiler ve bireysel gelişim, yetenekli insanlara en iyi işlerini üretmeleri için alan açar.",
    "Büyümeyi, öğrenmeyi ve üretmeyi seven insanlarla çalışırız. Sadakat iki yönlüdür; kültür ise her gün uyguladığımız bir davranış biçimidir.",
  ],
};
