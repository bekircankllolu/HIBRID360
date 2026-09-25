import { useTranslations } from "next-intl";
import styles from "./EmptyState.module.css";

/**
 * İçerik henüz gelmemiş bölümler için görünür boş durum. CLAUDE.md kuralı:
 * placeholder/lorem metin yasak — bunun yerine dürüst bir "hazırlanıyor"
 * durumu gösterilir; bu bileşen o durumun tek, tutarlı sunumu (bkz. 12
 * sayfada tekrar kullanımı — Work, Directors, Sustainability vb.).
 *
 * "pendingLabel" küçük başlık, `message` (namespace'e özel, çağıran
 * sayfadan gelir) asıl açıklama satırı, opsiyonel `detail` ek bir alt
 * satırdır (ör. Work sayfasında hangi verinin bekleniyor olduğu). Üçü de
 * gerçek durumu anlatır, uydurma içerik değildir.
 *
 * `align` (Faz 2 / B1): varsayılan "center" bugünkü ortalı kutu — Production,
 * Live Broadcast ve diğer çağıranlar değişmez. "start" sola yaslı tasarım
 * dilindeki sayfalar içindir (ör. Service Production): metin ve ek satır
 * sayfa kenarıyla aynı hizada başlar.
 */
export type EmptyStateAlign = "center" | "start";

export function EmptyState({
  message,
  detail,
  compact = false,
  align = "center",
}: {
  message: string;
  detail?: string;
  /** Sayfanın ana içeriği olmayan bölümlerde daha az yer kaplayan varyant. */
  compact?: boolean;
  /** Metin hizası; varsayılan "center" (bugünkü davranış). */
  align?: EmptyStateAlign;
}) {
  const t = useTranslations("common");

  const className = [
    styles.emptyState,
    compact ? styles.emptyStateCompact : "",
    align === "start" ? styles.emptyStateStart : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} role="status" data-align={align}>
      <span className={styles.emptyStateLabel}>{t("pendingLabel")}</span>
      <p className={styles.emptyStateMessage}>{message}</p>
      {detail ? <p className={styles.emptyStateDetail}>{detail}</p> : null}
    </div>
  );
}
