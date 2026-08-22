/**
 * Performans bütçesi — CLAUDE.md "Performans bütçesi" bölümü, sözleşme
 * maddesi. Eşikler brief'ten birebir alınır, burada gevşetilmez:
 *   - LCP (mobil): < 2.5 saniye
 *   - İlk yükleme toplam transfer: < 2 MB (videolar hariç — Faz 0/1
 *     iskeletinde video varlığı yok, video eklendiğinde bu audit'in
 *     kapsamı gözden geçirilecek)
 * CLS eşiği ROADMAP.md'de anılır ama CLAUDE.md'de somut bir sayı
 * verilmemiş; Lighthouse'un "iyi" eşiği olan 0.1 varsayılan olarak
 * kullanılıyor — [KARAR bekliyor değil, mühendislik varsayımı].
 */
module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:3000/tr", "http://localhost:3000/en"],
      startServerCommand: "npm run start",
      startServerReadyPattern: "Ready in",
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
      settings: {
        // Lighthouse varsayılanı zaten mobil emülasyon + throttling
        // (CLAUDE.md "LCP (mobil)" kuralı bu şekilde karşılanır).
        onlyCategories: ["performance", "accessibility"],
      },
    },
    assert: {
      assertions: {
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "total-byte-weight": ["error", { maxNumericValue: 2097152 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
