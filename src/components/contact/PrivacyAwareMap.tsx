"use client";

import { useState } from "react";
import styles from "./PrivacyAwareMap.module.css";

interface PrivacyAwareMapProps {
  /** Yalnızca yüklenmiş iframe'e uygulanır — tam ekran harita ölçüsü. */
  className: string;
  src: string;
  title: string;
  loadLabel: string;
  privacyNote: string;
  /** Onay öncesi kompozisyonun taşıdığı gerçek bilgi: adres. */
  addressLabel: string;
  addressLines: readonly string[];
}

/**
 * Google Maps is optional third-party content. The iframe is created only
 * after an explicit user action, so opening the Contact page does not send
 * the visitor's IP address or browser metadata to Google.
 *
 * 30 Ağustos 2026 QA denetimi: onay öncesi durum 70–100svh yüksekliğinde
 * neredeyse boş bir kutuydu — ortasında yalnızca bir not ve bir düğme vardı,
 * bölüm bitmemiş görünüyordu. O alan artık bölümün gerçek bilgisini taşıyor:
 * adres, yükleme komutu ve gizlilik notu tek bir merkezî kompozisyonda.
 * Yükseklik onay öncesinde ölçülü tutuluyor; harita yüklenince tam ekran
 * ölçü (`className`) devreye giriyor, yani tam ekran harita fikri korunuyor.
 *
 * Statik üçüncü taraf harita görüntüsü KULLANILMIYOR: onay öncesi Google'a
 * tek bir istek bile gitmemeli.
 */
export function PrivacyAwareMap({
  className,
  src,
  title,
  loadLabel,
  privacyNote,
  addressLabel,
  addressLines,
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
    <div className={styles.placeholder}>
      <div className={styles.content}>
        <p className={styles.label}>{addressLabel}</p>
        <address className={styles.address}>
          {addressLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </address>
        <button
          type="button"
          className={styles.loadButton}
          onClick={() => setLoaded(true)}
        >
          {loadLabel}
        </button>
        <p className={styles.note}>{privacyNote}</p>
      </div>
    </div>
  );
}
