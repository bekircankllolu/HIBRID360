/**
 * Yasal sayfaların bölüm iskeletleri — brief-rev12.md Bölüm 14, 18.9, 18.10.
 *
 * ÖNEMLİ: Privacy, Cookie ve KVKK sayfalarının GÖVDE METİNLERİ bu dosyada
 * yoktur ve uydurulmamıştır. Brief bu üç sayfa için yalnızca hangi
 * konuların kapsanacağını söylüyor (metni değil); yasal metin hukuk
 * danışmanı tarafından yazılmalı. CLAUDE.md: "Placeholder/lorem metin asla
 * commit edilmez." Bu yüzden her bölüm başlığı gerçek, gövdesi boş durum.
 *
 * TODO: brief Bölüm 14 — Privacy / Cookie / KVKK gövde metinleri hukuk
 * danışmanından gelince `body` alanları doldurulacak.
 * TODO: docs/DECISIONS.md #1 — veri sorumlusu olarak yazılacak şirket
 * ünvanı KVKK aydınlatma metninin zorunlu alanı; ünvan netleşmeden bu
 * sayfa yayınlanamaz.
 */

export interface LegalSection {
  /** Başlık: brief'in kapsam tanımından, gerçek içerik. */
  heading: { tr: string; en: string };
  /** Gövde metni — hazır olana kadar null. */
  body: { tr: string; en: string } | null;
}

/** brief 14 — Privacy Policy kapsamı. */
export const privacySections: LegalSection[] = [
  {
    heading: {
      tr: "Hangi veriyi topluyoruz",
      en: "What data we collect",
    },
    body: null,
  },
  {
    heading: { tr: "Neden topluyoruz", en: "Why we collect it" },
    body: null,
  },
  {
    heading: { tr: "Ne kadar saklıyoruz", en: "How long we keep it" },
    body: null,
  },
  {
    heading: { tr: "Kimlerle paylaşıyoruz", en: "Who we share it with" },
    body: null,
  },
  {
    heading: {
      tr: "Haklarınızı nasıl kullanırsınız",
      en: "How to exercise your rights",
    },
    body: null,
  },
];

/** brief 14 — Cookie Policy kapsamı. */
export const cookieSections: LegalSection[] = [
  { heading: { tr: "Çerez türleri", en: "Cookie types" }, body: null },
  { heading: { tr: "Çerez süreleri", en: "Cookie lifetimes" }, body: null },
  { heading: { tr: "Üçüncü taraflar", en: "Third parties" }, body: null },
  {
    heading: { tr: "Tercihinizi değiştirme", en: "Changing your preference" },
    body: null,
  },
];

/** brief 14 — KVKK / GDPR aydınlatma kapsamı. */
export const kvkkSections: LegalSection[] = [
  {
    heading: { tr: "Veri sorumlusunun kimliği", en: "Identity of the data controller" },
    body: null,
  },
  { heading: { tr: "İşleme amaçları", en: "Purposes of processing" }, body: null },
  { heading: { tr: "Başvuru yolu", en: "How to submit a request" }, body: null },
];

/**
 * brief 18.9 — AI Usage & Rights. Başlıklar ve her başlığın altında
 * cevaplanacak soru SİTEYE GİRECEK METİN kutusundan birebir alınmıştır
 * (EN; brief: "TR sürümü aynı başlıklarla"). Gövde metni hukuk
 * danışmanıyla birlikte yazılacak.
 *
 * TODO: brief 18.9 — "Bu sayfa hukuk danışmanıyla birlikte yazılmalı;
 * buradaki başlıklar iskelettir. Ajansın gerçekte ne yaptığından fazlasını
 * yazmak en büyük risktir. Yalnızca uygulanan kurallar yazılır."
 */
export const aiPolicySections = [
  {
    heading: "How we use AI",
    prompt: "where AI sits in our workflow, and where it doesn't.",
  },
  {
    heading: "Your data",
    prompt:
      "client material is not used to train public models; we name the tools and the data path.",
  },
  {
    heading: "Rights & ownership",
    prompt:
      "who owns AI-assisted output, and what we deliver as a licence.",
  },
  {
    heading: "People",
    prompt:
      "likeness, voice and performer consent: we do not generate a real person's face or voice without written permission.",
  },
  {
    heading: "Disclosure",
    prompt:
      "where we label AI-generated work on our own channels and on yours.",
  },
  {
    heading: "Human review",
    prompt:
      "every deliverable is reviewed and finished by a named human before delivery.",
  },
  {
    heading: "Questions",
    prompt: "the person to contact for procurement and legal review.",
  },
] as const;
