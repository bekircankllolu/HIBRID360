"use client";

import { useState } from "react";
import styles from "./PrivacyAwareMap.module.css";

interface PrivacyAwareMapProps {
  className: string;
  src: string;
  title: string;
  loadLabel: string;
  privacyNote: string;
}

/**
 * Google Maps is optional third-party content. The iframe is created only
 * after an explicit user action, so opening the Contact page does not send
 * the visitor's IP address or browser metadata to Google.
 */
export function PrivacyAwareMap({
  className,
  src,
  title,
  loadLabel,
  privacyNote,
}: PrivacyAwareMapProps) {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <iframe
        className={className}
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  return (
    <div className={`${className} ${styles.placeholder}`}>
      <div className={styles.content}>
        <p className={styles.note}>{privacyNote}</p>
        <button
          type="button"
          className={styles.loadButton}
          onClick={() => setLoaded(true)}
        >
          {loadLabel}
        </button>
      </div>
    </div>
  );
}
