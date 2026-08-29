/**
 * HOME-06 — ana sayfa hizmet linkleri satırı. Etiketler ve sıralama
 * EN/TR'de aynı (deck: "EN + TR (aynı)"), bu yüzden i18n mesajlarına değil
 * hizmet kataloğuna bağlı.
 *
 * 29 Ağustos 2026 revizyonu: liste artık elle tutulmuyor, tek veri kaynağı
 * `src/data/services.ts`. Photography bu revizyonla katalogdan çıktı, bu
 * yüzden satırda da görünmüyor (9 → 8 madde).
 *
 * Dışa verilen şekil (`{ label, href, ready }`) bilinçli olarak korundu —
 * `src/components/home/ServiceLinksRow.tsx` Codex'in sahipliğinde ve bu
 * arayüzü tüketiyor.
 */
import { SERVICE_CATALOG } from "@/data/services";

export interface ServiceLink {
  label: string;
  href: string;
  ready: boolean;
}

export const SERVICE_LINKS: ServiceLink[] = SERVICE_CATALOG.map((service) => ({
  label: service.linkLabel,
  href: service.href,
  // Sekiz hizmetin de kendi gerçek sayfası var.
  ready: true,
}));
