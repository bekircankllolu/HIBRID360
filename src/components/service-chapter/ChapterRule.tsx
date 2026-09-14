import styles from "./ChapterRule.module.css";

/**
 * Bölüm ayracı — 1px çizgi ve üstünde küçük etiket (STRV referansı:
 * "çizgi + etiket"). Etiket bölümün kendi başlığıdır (varsayılan h2);
 * altında ayrıca bir başlık yoktur, yani bu bir "eyebrow" değil.
 * Sayaç ("(10)") bilinçli olarak yok — okur sayabilir
 * (docs/design/SERVICE_CHAPTER_SYSTEM.md §10).
 */
export function ChapterRule({
  title,
  as: Tag = "h2",
  id,
}: {
  title: string;
  as?: "h2" | "p";
  id?: string;
}) {
  return (
    <div className={styles.rule}>
      <Tag id={id} className={styles.title}>
        {title}
      </Tag>
    </div>
  );
}
