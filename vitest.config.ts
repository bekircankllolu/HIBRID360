import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Birim testleri — saf mantık için. Kritik kullanıcı akışları Playwright
 * ile gerçek tarayıcıda test ediliyor (bkz. e2e/), burası onun yerine
 * geçmez: buradaki hedef tarayıcı gerektirmeyen dallar, özellikle
 * sunucu tarafı doğrulama guard'ları (KVKK rızası, e-posta) ve
 * schema.org/URL üretimi gibi kolay gözden kaçan kenar durumlar.
 *
 * e2e/ dışlanıyor: Playwright'ın kendi runner'ı var, vitest onları
 * toplamaya çalışırsa `test` importu çakışır.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  /**
   * `tsconfig.json` `jsx: "preserve"` diyor (dönüşümü Next.js yapıyor).
   * Vitest'in esbuild'i o ayarı görünce klasik `React.createElement`
   * üretir ve React'i açıkça import etmeyen bileşenler test içinde
   * "React is not defined" ile patlar. Next.js runtime'ıyla aynı otomatik
   * dönüşüme sabitliyoruz — böylece bir `.test.ts` dosyası bir `.tsx`
   * bileşenini (ör. MeetTheCrewReveal) import edip render edebilir.
   */
  esbuild: { jsx: "automatic" },
  test: {
    // `.tsx` de toplanıyor: bileşen testleri JSX ile yazılınca hem
    // okunabilir hem de `children`'ı prop olarak geçmek zorunda kalmadan
    // tip/lint uyumlu oluyor (bkz. meet-the-crew-reveal.test.tsx).
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["e2e/**", "node_modules/**"],
    environment: "node",
  },
});
