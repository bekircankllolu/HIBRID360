import type { Locale } from "@/i18n/routing";

/**
 * brief-rev12.md Bölüm 20.5 — How We Work.
 *
 * İngilizce metinler SİTEYE GİRECEK METİN kutularından birebir alınmıştır.
 * Türkçe metinler bizim çevirimiz: MÜŞTERİ ONAYI BEKLİYOR (Faz 1, 2026-09-20
 * kararı — çeviriyi biz yazdık, müşteri onaylayacak). Onay/düzeltme geldiğinde
 * yalnızca `tr` bloklarını güncellemek yeterli.
 *
 * Brief'in kendi metninde [X] ve [n] yer tutucuları var — bunlar uydurulmadı,
 * `null` olarak bırakıldı ve arayüzde "belirlenecek" rozeti gösteriliyor.
 *
 * TODO: docs/DECISIONS.md #15 bekleniyor — "[X] alanlarına yazılacak
 * başlangıç bantları ticari karardır", müşteride kalmalı. Karar geldiğinde
 * `startingFrom` ve `duration` alanları doldurulacak.
 */

export interface ProcessStep {
  step: number;
  title: string;
  /** `{pending}` işaretçisi arayüzde "belirlenecek" rozetine dönüşür. */
  body: string;
  pendingDecision: boolean;
}

export interface BudgetBand {
  format: string;
  /** Brief'teki "from [X]" — DECISIONS #15 kapanmadan doldurulmaz. */
  startingFrom: string | null;
  /** Brief'te rakamı verilmiş, kesin olan kapsam bilgileri. */
  scope: string[];
  /** Brief'teki "[n] weeks" — DECISIONS #15 kapanmadan doldurulmaz. */
  duration: string | null;
}

export const processSteps: Record<Locale, readonly ProcessStep[]> = {
  en: [
    {
      step: 1,
      title: "Brief & fit",
      body: "a 30-minute call. What you’re launching, when, and for which platforms.",
      pendingDecision: false,
    },
    {
      step: 2,
      title: "Concept & budget",
      // Brief metni: "treatment, references and a line budget within [X]
      // working days." Brief'in kendi [X] yer tutucusu ekrana basılmıyor;
      // {pending} işaretçisi arayüzde "belirlenecek" rozetine dönüşüyor.
      body: "treatment, references and a line budget within {pending} working days.",
      pendingDecision: true,
    },
    {
      step: 3,
      title: "Pre-production",
      body: "casting, locations, permits, schedule and the shooting board.",
      pendingDecision: false,
    },
    {
      step: 4,
      title: "Shoot & AI production",
      body: "our own crew, our own gear, and AI-assisted variations produced in parallel.",
      pendingDecision: false,
    },
    {
      step: 5,
      title: "Post & delivery",
      body: "edit, colour, sound, adaptation to every platform ratio, and final files with subtitles.",
      pendingDecision: false,
    },
  ],
  // Müşteri onayı bekleyen çeviri. "treatment", "shooting board", "cutdown"
  // gibi sektör terimleri Türkiye'deki prodüksiyon dilinde olduğu gibi kullanılır.
  tr: [
    {
      step: 1,
      title: "Brief ve uyum",
      body: "30 dakikalık bir görüşme. Ne lanse ediyorsunuz, ne zaman ve hangi platformlar için?",
      pendingDecision: false,
    },
    {
      step: 2,
      title: "Konsept ve bütçe",
      body: "{pending} iş günü içinde treatment, referanslar ve kalem kalem bütçe.",
      pendingDecision: true,
    },
    {
      step: 3,
      title: "Prodüksiyon öncesi",
      body: "casting, mekânlar, izinler, çekim takvimi ve shooting board.",
      pendingDecision: false,
    },
    {
      step: 4,
      title: "Çekim ve AI prodüksiyon",
      body: "kendi ekibimiz, kendi ekipmanımız ve paralel üretilen AI destekli varyasyonlar.",
      pendingDecision: false,
    },
    {
      step: 5,
      title: "Post ve teslimat",
      body: "kurgu, renk, ses, her platform oranına uyarlama ve altyazılı final dosyaları.",
      pendingDecision: false,
    },
  ],
};

export const budgetBands: Record<Locale, readonly BudgetBand[]> = {
  en: [
    {
      format: "Social content package",
      startingFrom: null,
      scope: ["1 shoot day", "all platform ratios"],
      duration: null,
    },
    {
      format: "Product / how-to film",
      startingFrom: null,
      scope: ["1–2 shoot days", "1 main film + cutdowns"],
      duration: null,
    },
    {
      format: "Commercial / campaign film",
      startingFrom: null,
      scope: ["2–4 shoot days", "concept, cast, licensing included"],
      duration: null,
    },
    {
      format: "Corporate live broadcast",
      startingFrom: null,
      scope: ["multi-camera, streaming and recording"],
      duration: null,
    },
    {
      format: "Cloud TV",
      startingFrom: null,
      scope: ["setup + monthly operation"],
      duration: null,
    },
    {
      format: "AI production add-on",
      startingFrom: null,
      scope: ["variations, adaptations and versioning at scale"],
      duration: null,
    },
  ],
  tr: [
    {
      format: "Sosyal medya içerik paketi",
      startingFrom: null,
      scope: ["1 çekim günü", "tüm platform oranları"],
      duration: null,
    },
    {
      format: "Ürün / nasıl yapılır filmi",
      startingFrom: null,
      scope: ["1–2 çekim günü", "1 ana film + kısa versiyonlar"],
      duration: null,
    },
    {
      format: "Reklam / kampanya filmi",
      startingFrom: null,
      scope: ["2–4 çekim günü", "konsept, oyuncu kadrosu, lisanslama dahil"],
      duration: null,
    },
    {
      format: "Kurumsal canlı yayın",
      startingFrom: null,
      scope: ["çok kameralı çekim, streaming ve kayıt"],
      duration: null,
    },
    {
      format: "Cloud TV",
      startingFrom: null,
      scope: ["kurulum + aylık operasyon"],
      duration: null,
    },
    {
      format: "AI prodüksiyon ek paketi",
      startingFrom: null,
      scope: ["büyük ölçekte varyasyon, uyarlama ve versiyonlama"],
      duration: null,
    },
  ],
};
