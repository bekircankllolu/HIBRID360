import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";

// Faz 0: sayfaların tamamı statik (SSG), ISR/incremental cache henüz
// gerekmiyor. R2 tabanlı incremental cache Faz 2+'de medya/işlerin
// dinamikleşmesiyle birlikte değerlendirilecek (bkz. CLAUDE.md — Cloudflare R2).
export default defineCloudflareConfig({});
