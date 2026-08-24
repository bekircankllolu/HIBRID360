import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/**
 * Kritik yollar için e2e testleri — bkz. e2e/*.spec.ts.
 *
 * `npm run dev` ile başlatılan sunucuya karşı çalışır (build+start yerine:
 * daha hızlı soğuk başlangıç, doğruluk için üretim optimizasyonu gerekmiyor
 * — performans zaten ayrıca Lighthouse CI ile ölçülüyor, bkz.
 * lighthouserc.js). CI'da webServer zaten yoksa kurulur; yerelde açık bir
 * sunucu varsa yeniden kullanılır.
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
    command: `npm run dev -- -p ${PORT}`,
    url: `http://localhost:${PORT}/tr`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
