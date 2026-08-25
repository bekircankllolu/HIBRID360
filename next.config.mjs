import path from "node:path";
import { fileURLToPath } from "node:url";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 15, birden fazla lockfile görünce workspace kökünü kendisi tahmin
  // ediyor ve bu makinede ev dizinindeki alakasız bir package-lock.json'ı
  // seçiyordu. Kök yanlış olduğunda output file tracing yanlış dosya kümesini
  // toplar — Cloudflare/standalone çıktısı doğrudan bundan etkilenir.
  // Tahmine bırakmak yerine depo kökü sabitleniyor.
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
};

export default withNextIntl(nextConfig);
