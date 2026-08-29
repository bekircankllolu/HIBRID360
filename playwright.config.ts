import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/**
 * Kritik yollar için e2e testleri — bkz. e2e/*.spec.ts.
 *
 * Üretim build'ine karşı çalışır (`build` + `start`).
 *
 * Önceden `npm run dev` kullanılıyordu; gerekçesi "daha hızlı soğuk
 * başlangıç"tı. Next 15'e geçişte bu gerekçe geçersizleşti: dev sunucusu
 * suite'in ~60 rotasını paralel derlerken kendi .next önbelleğinde yarım
 * okunan JSON üretiyor ("Unexpected non-whitespace character after JSON"),
 * testlerin çoğu bu yüzden düşüyordu. Aynı suite üretim sunucusunda 60/60
 * geçiyor ve daha da hızlı (15s), çünkü istek anında derleme yok.
 *
 * Yan fayda: testler artık gerçekten yayınlanan çıktıyı doğruluyor.
 * Performans ölçümü yine ayrı (lighthouserc.js).
 *
 * CI'da webServer kurulur; yerelde 3100'de açık bir sunucu varsa
 * yeniden kullanılır (kendi `npm run start`'ını açıp iterasyon yapabilirsin).
 *
 * PLAYWRIGHT_EXECUTABLE_PATH: yalnızca tarayıcı indirmenin mümkün olmadığı
 * ortamlar (ör. bu tür sanal alan/konteyner kurulumları) için — önceden
 * kurulu bir Chromium'a işaret eder. Ayarlanmazsa Playwright'ın kendi
 * normal tarayıcı çözümlemesi kullanılır (gerçek CI/geliştirici makinesi).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } }
      : {}),
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}/tr`,
    reuseExistingServer: !process.env.CI,
    // Build + start; dev'in anlık derlemesine göre başlangıç uzun, testler kısa.
    timeout: 300_000,
  },
});
