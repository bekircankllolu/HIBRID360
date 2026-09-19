"use client";

import { useScrollScene } from "@/hooks/useScrollScene";
import styles from "./page.module.css";

/**
 * Ortak satırı — kendi scroll sahnesi.
 *
 * Satırlar sayfada farklı yüksekliklerde durduğu için tek bir bölüm
 * ilerlemesi alttakini ekrana girmeden "bitirmiş" olurdu; her satır kendi
 * `--progress`'iyle, ekrana girdiği anda beliriyor.
 */
export function PartnerRow({
  index,
  name,
  body,
  url,
  pendingLabel,
}: {
  index: string;
  name: string;
  body: string | null;
  url: string | null;
  pendingLabel: string;
}) {
  const { ref, motion } = useScrollScene<HTMLLIElement>({ mode: "pass" });

  return (
    <li ref={ref} className={styles.item} data-motion={motion}>
      <div className={styles.row}>
        <span className={styles.index} aria-hidden="true">
          {index}
        </span>
        <h2 className={styles.name}>{name}</h2>
        <div className={styles.detail}>
          {body ? (
            <p className={styles.body}>{body}</p>
          ) : (
            /* Onaylı açıklama gelmedi. Uydurulmuyor, durumu yazılıyor. */
            <p className={styles.pending}>
              <span className={styles.pendingDot} aria-hidden="true" />
              {pendingLabel}
            </p>
          )}
          {url && (
            <a
              href={`https://${url}`}
              target="_blank"
              rel="noreferrer"
              className={styles.link}
            >
              {url}
            </a>
          )}
        </div>
        <span className={styles.sweep} aria-hidden="true" />
      </div>
    </li>
  );
}
