/**
 * Brief Builder — brief-rev12.md Bölüm 18.8.
 *
 * Altı soru, SİTEYE GİRECEK METİN kutusundan birebir. Seçenekler
 * docs/supabase-schema.sql `brief_submissions` tablosundaki alanlarla
 * birebir eşleşir.
 *
 * Brief'in uygulama notu: "altı sorudan fazlası tamamlanma oranını
 * düşürür" — soru sayısı artırılmayacak.
 */

export interface BriefQuestion {
  /** brief_submissions sütun adı. */
  field:
    | "what_making"
    | "who_for"
    | "when_live"
    | "where_running"
    | "budget_band"
    | "reference_link";
  label: { tr: string; en: string };
  type: "single" | "multi" | "text" | "contact";
  options?: Array<{ value: string; label: { tr: string; en: string } }>;
}

export const briefQuestions: BriefQuestion[] = [
  {
    field: "what_making",
    label: { en: "What are you making?", tr: "Ne yapmak istiyorsunuz?" },
    type: "single",
    options: [
      { value: "reklam_filmi", label: { en: "Ad film", tr: "Reklam filmi" } },
      {
        value: "urun_how_to",
        label: { en: "Product / how-to", tr: "Ürün / how-to" },
      },
      {
        value: "sosyal_medya",
        label: { en: "Social media content", tr: "Sosyal medya içeriği" },
      },
      { value: "canli_yayin", label: { en: "Live broadcast", tr: "Canlı yayın" } },
      { value: "fotograf", label: { en: "Photography", tr: "Fotoğraf" } },
      {
        value: "emin_degilim",
        label: { en: "Not sure yet", tr: "Henüz emin değilim" },
      },
    ],
  },
  {
    field: "who_for",
    label: { en: "Who is it for?", tr: "Kimin için?" },
    type: "text",
  },
  {
    field: "when_live",
    label: {
      en: "When does it need to be live?",
      tr: "Ne zaman yayında olmalı?",
    },
    type: "single",
    options: [
      { value: "2_hafta", label: { en: "Within 2 weeks", tr: "2 hafta içinde" } },
      { value: "1_ay", label: { en: "1 month", tr: "1 ay" } },
      { value: "2_3_ay", label: { en: "2–3 months", tr: "2–3 ay" } },
      { value: "belirsiz", label: { en: "No date yet", tr: "Tarih belli değil" } },
    ],
  },
  {
    field: "where_running",
    label: { en: "Where will it run?", tr: "Nerede yayınlanacak?" },
    type: "multi",
    options: [
      { value: "tv", label: { en: "TV", tr: "TV" } },
      {
        value: "instagram_tiktok",
        label: { en: "Instagram / TikTok", tr: "Instagram / TikTok" },
      },
      { value: "youtube", label: { en: "YouTube", tr: "YouTube" } },
      { value: "web", label: { en: "Web", tr: "Web" } },
      {
        value: "bayi_ekranlari",
        label: { en: "In-store screens", tr: "Bayi ekranları" },
      },
      { value: "etkinlik", label: { en: "Event", tr: "Etkinlik" } },
    ],
  },
  {
    field: "budget_band",
    label: {
      en: "What budget band are you working with?",
      tr: "Hangi bütçe bandındasınız?",
    },
    type: "single",
    // TODO: docs/DECISIONS.md #15 bekleniyor — brief 18.8: "bantlar How We
    // Work sayfasındakiyle aynı olacak". O sayfadaki rakamlar da ticari
    // karara bağlı, bu yüzden burada yalnızca brief'in kesin olarak
    // istediği "bilmiyorum" seçeneği var; bantlar karar gelince
    // src/data/how-we-work.ts ile birlikte doldurulacak.
    options: [
      { value: "bilmiyorum", label: { en: "I don't know", tr: "Bilmiyorum" } },
    ],
  },
  {
    field: "reference_link",
    label: {
      en: "Anything we should see?",
      tr: "Görmemiz gereken bir şey var mı?",
    },
    type: "contact",
  },
];

/** brief 18.8 — açılış ve kapanış metinleri, MONA konuşur. */
export const briefIntro = {
  en: "Let's build your brief together. Six questions, about two minutes. You'll get the summary in your inbox, and so will we.",
  tr: "Brief'ini birlikte kuralım. Altı soru, yaklaşık iki dakika. Özeti sana da bize de göndereceğim.",
};

export const briefOutro = {
  en: "That's a brief. Here's your summary. We'll come back within one working day with a first take and a budget range.",
  tr: "İşte brief'in. Özeti aşağıda; bir iş günü içinde ilk yorumumuz ve bütçe aralığıyla döneceğiz.",
};
