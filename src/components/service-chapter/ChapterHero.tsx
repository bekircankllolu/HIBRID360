import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { formatDegree } from "@/lib/service-chapter";
import { ChapterDial } from "./ChapterDial";
import styles from "./ChapterHero.module.css";

/**
 * Service Chapter hero'su — media'sız bir "başlık sayfası" (chaptered
 * editorial grameri): meta satırı, başlık yuvası, lede. Media birinci
 * bölümde başlar (docs/design/SERVICE_CHAPTER_SYSTEM.md §1).
 *
 * Başlık her sayfanın kendi enstrümanıdır (`title`), hero yalnızca
 * yerleştirir. Hero'da en fazla üç metin öğesi var: meta satırı (tek
 * eyebrow), h1, lede. Dikey rail yazısı bilinçli olarak yok (§10).
 *
 * `mona` — DECISIONS #43: sağ üst köşeye bir parça MONA (`MonaShard`)
 * yerleşebilir. İsteğe bağlı; verilmezse hero değişmeden kalır.
 */
export function ChapterHero({
  degree,
  serviceName,
  hub,
  title,
  lede,
  mona,
}: {
  degree: number;
  serviceName: string;
  hub: { label: string; href: string };
  title: ReactNode;
  lede: string;
  mona?: ReactNode;
}) {
  return (
    <header className={styles.hero}>
      {mona ? <div className={styles.mona}>{mona}</div> : null}
      <div className={styles.meta}>
        <p className={styles.crumbs}>
          <Link href={hub.href} className={styles.hub}>
            {hub.label}
          </Link>
          <span className={styles.slash} aria-hidden="true">
            /
          </span>
          {/* Hizmet adı marka dili — TR sayfada da İngilizce. */}
          <span lang="en">{serviceName}</span>
        </p>
        <p className={styles.coordinate} aria-hidden="true">
          <ChapterDial degree={degree} size={28} />
          <span>{formatDegree(degree)}</span>
        </p>
      </div>

      <div className={styles.title}>{title}</div>

      <p className={styles.lede}>{lede}</p>
    </header>
  );
}
