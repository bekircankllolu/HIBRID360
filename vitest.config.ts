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
  test: {
    include: ["src/**/*.test.ts"],
    exclude: ["e2e/**", "node_modules/**"],
    environment: "node",
  },
});
