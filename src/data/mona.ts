import type { Locale } from "@/i18n/routing";
import monaFaq from "@/data/mona-faq.json";
import audioManifest from "@/data/mona-audio.json";

/** Curated bilingual MONA content. Live FAQ voices are supplied by the local audio manifest. */

export interface MonaLine {
  id: string;
  text: { tr: string; en: string };
  /** Replik başına ses dosyası — prodüksiyon gelene kadar null. */
  audioSrc: { tr: string | null; en: string | null };
  /** VTT altyazı dosyası — prodüksiyon gelene kadar null. */
  captionsSrc: { tr: string | null; en: string | null };
}

export interface MonaQuestion extends MonaLine {
  question: { tr: string; en: string };
  /** Cevaptan sonra gösterilecek eylem — brief 11.4 "Ekran" sütunu. */
  action?: { href: string; label: { tr: string; en: string } };
}

const noMedia = {
  audioSrc: { tr: null, en: null },
  captionsSrc: { tr: null, en: null },
};

function mediaFor(id: string) {
  const assets = (audioManifest as Record<string, Partial<Record<Locale, string>>>)[id];
  return {
    audioSrc: { tr: assets?.tr ?? null, en: assets?.en ?? null },
    captionsSrc: { tr: assets?.tr?.replace(/\.mp3$/, ".json") ?? null, en: assets?.en?.replace(/\.mp3$/, ".json") ?? null },
  };
}

/** brief 11.3 — açılış repliği. Sessiz, yalnızca yazı. */
export const openingLine: MonaLine = {
  id: "opening",
  text: {
    en: "Hello. I’m MONA. My head is a little retro. My taste is entirely up to date. Ask me anything about how this place works.",
    tr: "Merhaba. Ben MONA. Kafam biraz retro. Zevkim tamamen güncel. Burada işlerin nasıl yürüdüğünü sorabilirsiniz.",
  },
  ...mediaFor("opening"),
};

/** brief 11.3 — boşta (idle) replikleri, sırayla döner. Sessiz. */
export const idleLines: MonaLine[] = [
  {
    id: "idle-1",
    text: {
      en: "Still here. Machines are patient.",
      tr: "Buradayım. Makineler sabırlıdır.",
    },
    ...noMedia,
  },
  {
    id: "idle-2",
    text: {
      en: "You can scroll. I don’t take it personally.",
      tr: "Aşağı kaydırabilirsiniz. Alınmam.",
    },
    ...noMedia,
  },
  {
    id: "idle-3",
    text: {
      en: "Fun fact: the ideas here are human. I just make them faster.",
      tr: "Not: buradaki fikirler insanlara ait. Ben sadece hızlandırıyorum.",
    },
    ...noMedia,
  },
];

/** brief 11.3 — geri dönüş repliği. */
export const returnLine: MonaLine = {
  id: "return",
  text: {
    en: "You came back. Good. Where were we?",
    tr: "Geri geldiniz. Güzel. Nerede kalmıştık?",
  },
  ...noMedia,
};

/** brief 11.4 — soru-cevap kütüphanesi (10 soru). */
export const legacyMonaQuestions: MonaQuestion[] = [
  {
    id: "q1",
    question: { en: "Who are you?", tr: "Kimsiniz?" },
    text: {
      en: "I’m MONA. I’m the part of Hibrid 360 that never sleeps. The ideas belong to the people here. I make them faster, and I make them in nine formats before lunch.",
      tr: "Ben MONA. Hibrid 360’ın hiç uyumayan tarafıyım. Fikirler buradaki insanlara ait. Ben onları hızlandırıyorum ve öğlene kadar dokuz ayrı formatta çıkarıyorum.",
    },
    ...noMedia,
  },
  {
    id: "q2",
    // MONA-15 — ekranda görünen etiket, MONA-05'in tam soru metninden
    // daha kısa: "Is this just a production company?" / "Burası sadece
    // prodüksiyon şirketi mi?"
    question: {
      en: "Is this just a production company?",
      tr: "Burası sadece prodüksiyon şirketi mi?",
    },
    text: {
      en: "No. High-end production is in our DNA, but Hibrid 360 runs as an AI-Native Creative & Production Studio. Strategy, branding, design, digital content, photography, audio and analytics sit in one AI Creative Operating System. We don’t just use AI as a tool. We build the workflow around it.",
      tr: "Hayır. Yüksek kaliteli prodüksiyon genlerimizde var, ama Hibrid 360 bir AI-Native Kreatif ve Prodüksiyon Stüdyosu olarak çalışıyor. Strateji, marka, tasarım, dijital içerik, fotoğraf, ses ve analitik tek bir sistemin içinde. Biz yapay zekâyı sadece kullanmıyoruz; iş akışını onun etrafına kuruyoruz.",
    },
    ...noMedia,
  },
  {
    id: "q3",
    // MONA-15 — etiket "actually" olmadan.
    question: { en: "What do you build?", tr: "Ne üretiyorsunuz?" },
    text: {
      en: "AI films. AI photography. AI design. AI experiences. AI innovation. And everything that still needs a camera, a set and a crew, because a lot of it still does.",
      tr: "AI filmler. AI fotoğraf. AI tasarım. AI deneyimler. AI inovasyon. Bir de hâlâ kamera, set ve ekip isteyen her şey; çünkü çoğu hâlâ istiyor.",
    },
    ...noMedia,
  },
  {
    id: "q4",
    question: { en: "Why Hibrid 360?", tr: "Neden Hibrid 360?" },
    text: {
      en: "From idea to impact: faster, smarter, more flexible, more sustainable, more human. Ten times faster production. More creative options on the table. Premium visual quality. Built for global brands. AI shortens the cycle, adapts content across platforms and optimizes cost, so the team can spend its time on ideas.",
      tr: "Fikirden etkiye: daha hızlı, daha akıllı, daha esnek, daha sürdürülebilir, daha insan. On kat daha hızlı prodüksiyon. Masada daha çok yaratıcı seçenek. Premium görsel kalite. Global markalar için kurulmuş bir yapı. Yapay zekâ süreyi kısaltıyor, içeriği platformlara uyarlıyor ve maliyeti optimize ediyor. Ekip de zamanını fikre ayırıyor.",
    },
    ...noMedia,
  },
  {
    id: "q5",
    // MONA-15 — etiket "creative people" yerine "creatives".
    question: {
      en: "Will AI replace creatives?",
      tr: "Yapay zekâ yaratıcıların yerini alacak mı?",
    },
    text: {
      en: "No, and I’d know. Technology alone doesn’t create emotion. Stories do. Ideas do. People do. Technology is the tool. Creativity is the language. Emotion is the outcome. We don’t replace creativity. We expand it.",
      tr: "Hayır, üstelik bunu ben söylüyorum. Teknoloji tek başına duygu üretmez. Hikâyeler üretir. Fikirler üretir. İnsanlar üretir. Teknoloji aracımız. Yaratıcılık dilimiz. Duygu ise sonucumuz. Yaratıcılığın yerini almıyoruz; alanını genişletiyoruz.",
    },
    ...noMedia,
  },
  {
    id: "q6",
    // MONA-15 — ekranda görünen kısa etiket, MONA-09'un tam soru
    // metninden farklı.
    question: {
      en: "How do we keep our brand voice?",
      tr: "Marka sesimizi nasıl koruruz?",
    },
    text: {
      en: "Your brand’s DNA is the differentiator, not the model you use. Every project starts with strategy, grows through creativity, and only then gets amplified by AI. If you start with the tool, everything comes out looking like everyone else.",
      tr: "Ayrıştırıcı olan kullandığın model değil, markanın DNA’sı. Her proje stratejiyle başlar, yaratıcılıkla büyür, en sonda yapay zekâyla çoğaltılır. Araçla başlarsan çıkan iş herkesinkine benzer.",
    },
    ...noMedia,
  },
  {
    id: "q7",
    question: { en: "How does the process work?", tr: "Süreç nasıl işliyor?" },
    text: {
      en: "Five steps. Creative strategy. Creative direction. AI production. Human refinement. Final delivery. The fourth one is where most people cut corners. We don’t.",
      tr: "Beş adım. Kreatif strateji. Kreatif direksiyon. AI prodüksiyon. İnsan rötuşu. Nihai teslim. Çoğu kişi dördüncüde kestirmeden gidiyor. Biz gitmiyoruz.",
    },
    ...noMedia,
  },
  {
    id: "q8",
    question: { en: "How fast is fast?", tr: "Ne kadar hızlı?" },
    text: {
      en: "A campaign that used to take months takes weeks. A set of platform versions that used to take days takes hours. One idea becomes multiple formats at scale: channel versions, cutdowns, ratios and languages. The schedule gets shorter. The thinking doesn’t.",
      tr: "Aylar süren bir kampanya haftalara iniyor. Günler süren platform versiyonları saatlere. Tek fikir; kanal versiyonları, kısa kurgular, oranlar ve dillerle ölçekli biçimde çok sayıda formata dönüşüyor. Takvim kısalıyor; düşünme süresi kısalmıyor.",
    },
    ...noMedia,
  },
  {
    id: "q9",
    question: { en: "Can I see the work?", tr: "İşleri görebilir miyim?" },
    text: {
      en: "That’s the best question you can ask here. We let the work speak for itself. It’s all in one place.",
      tr: "Burada sorabileceğiniz en iyi soru bu. İşler kendini anlatsın. Hepsi tek yerde.",
    },
    action: { href: "/work", label: { en: "WORKS →", tr: "WORKS →" } },
    ...noMedia,
  },
  {
    id: "q10",
    question: { en: "How do we start?", tr: "Nasıl başlıyoruz?" },
    text: {
      en: "One conversation. Tell us what you’re launching and when. If our work aligns with your frequency, we’d love to meet you. Ready to create what’s next?",
      tr: "Tek bir konuşmayla. Neyi, ne zaman lanse edeceğinizi anlatın. İşimiz sizinle aynı frekanstaysa tanışmayı çok isteriz. Sıradakini yaratmaya hazır mısınız?",
    },
    action: {
      href: "/contact",
      label: {
        en: "Let’s Build Something Extraordinary.",
        tr: "Let’s Build Something Extraordinary.",
      },
    },
    ...noMedia,
  },
];

/**
 * Eylul 2026 tarihli, musteri tarafindan teslim edilen iki dilli MONA
 * dokumanindaki 28 soru-cevap. JSON, scripts/import-mona-faq.py ile iki
 * DOCX dosyasindan ayni soru numarasi uzerinden uretilir.
 */
export const monaQuestions: MonaQuestion[] = monaFaq.map((item) => ({
  ...item,
  ...mediaFor(item.id),
  ...(item.id === "q9"
    ? { action: { href: "/work", label: { en: "WORKS →", tr: "WORKS →" } } }
    : item.id === "q14" || item.id === "q28"
      ? {
          action: {
            href: "/contact",
            label: {
              en: "Let’s Build Something Extraordinary.",
              tr: "Let’s Build Something Extraordinary.",
            },
          },
        }
      : {}),
}));

/**
 * brief 11.4 — easter egg. Sıralı listede değil; MONA'nın kafasına üç kez
 * tıklayınca çıkar.
 */
export const easterEggLine: MonaLine = {
  id: "easter-egg",
  text: {
    en: "I’m as real as the last thing you liked on the internet. The difference is, I tell you.",
    tr: "İnternette en son beğendiğiniz şey kadar gerçeğim. Farkım, bunu size söylüyor olmam.",
  },
  ...noMedia,
};

/** brief 11.5 — ana sayfadaki kısa sürüm: yalnızca iki replik. */
export const homepageLines: MonaLine[] = [
  {
    id: "home-1",
    text: {
      en: "Hello. I’m MONA. I run the AI side of this place.",
      tr: "Merhaba. Ben MONA. Buranın yapay zekâ tarafını ben yürütüyorum.",
    },
    ...noMedia,
  },
  {
    id: "home-2",
    text: {
      en: "Curious how a film gets made here in a fraction of the time? Ask me upstairs.",
      tr: "Bir filmin burada nasıl bu kadar kısa sürede çıktığını merak ediyorsanız, bana yukarıda sorun.",
    },
    ...noMedia,
  },
];

export function lineText(line: MonaLine, locale: Locale): string {
  return line.text[locale];
}

/**
 * MONA-16 — MONA'nın altında zorunlu ibare.
 *
 * Deck bunu "EN + TR" biçiminde tek bir iki dilli satır olarak vermişti ve
 * kod da öyle sabitlemişti: `"AI-generated character · AI ile üretilmiş
 * karakter"`. Sonuç olarak EN arayüzde Türkçe, TR arayüzde İngilizce ibare
 * birlikte görünüyordu (30 Ağustos 2026 QA denetimi). Sitenin geri kalanı
 * locale başına tek dil gösterdiği için ibare de locale'e bağlandı; iki
 * dildeki metin deck'teki ifadelerin aynısı, yeni bir beyan üretilmedi.
 */
export const AI_DISCLAIMER: Record<Locale, string> = {
  en: "AI-generated character",
  tr: "AI ile üretilmiş karakter",
};
