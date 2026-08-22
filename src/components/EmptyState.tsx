import styles from "./EmptyState.module.css";

/**
 * İçerik henüz gelmemiş bölümler için görünür boş durum. CLAUDE.md kuralı:
 * placeholder/lorem metin yasak — bunun yerine dürüst bir "hazırlanıyor"
 * durumu gösterilir.
 */
export function EmptyState({ message }: { message: string }) {
  return (
    <div className={styles.emptyState}>
      <p>{message}</p>
    </div>
  );
}
