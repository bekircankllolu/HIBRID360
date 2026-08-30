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
 */
export function EmptyState({
  message,
  detail,
  compact = false,
}: {
  message: string;
  detail?: string;
  /** Sayfanın ana içeriği olmayan bölümlerde daha az yer kaplayan varyant. */
  compact?: boolean;
}) {
  const t = useTranslations("common");

  return (
    <div
      className={`${styles.emptyState} ${compact ? styles.emptyStateCompact : ""}`}
      role="status"
    >
      <span className={styles.emptyStateLabel}>{t("pendingLabel")}</span>
      <p className={styles.emptyStateMessage}>{message}</p>
      {detail ? <p className={styles.emptyStateDetail}>{detail}</p> : null}
    </div>
  );
}
