import styles from "./EmptyState.module.css";

/**
 * İçerik henüz gelmemiş bölümler için görünür boş durum. CLAUDE.md kuralı:
 * placeholder/lorem metin yasak — bunun yerine dürüst bir "hazırlanıyor"
 * durumu gösterilir.
 */
export function EmptyState({
  message,
  detail,
}: {
  message: string;
  detail?: string;
}) {
  return (
    <div className={styles.emptyState}>
      <p className={styles.message}>{message}</p>
      {detail ? <p className={styles.detail}>{detail}</p> : null}
    </div>
  );
}
