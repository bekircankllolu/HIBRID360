import { useTranslations } from "next-intl";
import styles from "./EmptyState.module.css";

/**
 * İçerik henüz gelmemiş bölümler için görünür boş durum. CLAUDE.md kuralı:
 * placeholder/lorem metin yasak — bunun yerine dürüst bir "hazırlanıyor"
 * durumu gösterilir; bu bileşen o durumun tek, tutarlı sunumu (bkz. 12
 * sayfada tekrar kullanımı — Work, Directors, Sustainability vb.).
 *
 * "pendingLabel" küçük başlık, `message` (namespace'e özel, çağıran
 * sayfadan gelir) asıl açıklama satırı. İkisi de gerçek durumu anlatır,
 * uydurma içerik değildir.
 */
export function EmptyState({ message }: { message: string }) {
  const t = useTranslations("common");

  return (
    <div className={styles.emptyState} role="status">
      <span className={styles.emptyStateLabel}>{t("pendingLabel")}</span>
      <p className={styles.emptyStateMessage}>{message}</p>
    </div>
  );
}
