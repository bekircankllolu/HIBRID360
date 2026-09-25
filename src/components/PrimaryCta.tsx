import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

/**
 * GEN-08 — sitenin tek birincil eylemi. "Her sayfada aynı buton, aynı
 * metin." Nihai copy deck (Ağustos 2026) gereği tüm sayfa sonlarında bu
 * bileşen kullanılır; metin değişmez, yalnızca href sayfaya göre ayarlanır
 * (varsayılan: /contact).
 *
 * Görünüm `Button` (primary/md) — sitenin tek buton dili (Faz 2 / B0). Bu
 * bileşen yalnız sabit etiketi ve varsayılan hedefi taşır.
 */
export function PrimaryCta({ href = "/contact" }: { href?: string }) {
  const t = useTranslations("cta");
  return (
    <Button variant="primary" href={href}>
      {t("primary")}
    </Button>
  );
}
