import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { ServiceFilm } from "@/data/service-films";
import { ChapterVideo } from "./ChapterVideo";
import styles from "./ChapterStrip.module.css";

/**
 * S6 — galeri şeridi. Zirveden sonraki nefes: tam genişlikte, görünürken
 * oynayan 21:9 bir film ve galerinin durumunu dürüstçe söyleyen satır
 * (varlıklar gelmeden sahte iş gösterilmez — CLAUDE.md).
 *
 * Durum noktası gerçek bir durumu (içerik hazırlanıyor) taşıdığı için var;
 * `role="status"` EmptyState ile aynı sözleşme.
 */
export function ChapterStrip({
  film,
  caption,
  pending,
  link,
}: {
  film: ServiceFilm | null;
  caption: string;
  pending: { label: string; message: string };
  link: { href: string; label: string };
}) {
  return (
    <div className={styles.strip}>
      {film ? (
        <figure className={styles.figure}>
          <div className={styles.media}>
            <ChapterVideo film={film} />
          </div>
          <figcaption className={styles.caption}>{caption}</figcaption>
        </figure>
      ) : null}

      <div className={styles.status}>
        <p className={styles.pending} role="status">
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.pendingLabel}>{pending.label}</span>
          <span>{pending.message}</span>
        </p>
        <Link href={link.href} className={styles.link}>
          {link.label}
          <ArrowRight aria-hidden="true" size={18} strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  );
}
