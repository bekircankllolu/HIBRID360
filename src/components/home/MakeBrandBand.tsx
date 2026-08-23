import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteImages } from "@/data/site-images";
import styles from "./MakeBrandBand.module.css";

/**
 * HOME-07 — 4. ekran, yeni fotoğraf üstü. Tıklanınca WORK sayfasına gider.
 * Eski sitedeki "Make your brand" fotoğraf üstü blok korunur; video veya
 * portfolyo iddiası olmayan optimize edilmiş mevcut site görseli kullanılır.
 */
export function MakeBrandBand() {
  const t = useTranslations("home");

  return (
    <Link href="/work" className={styles.band}>
      <Image
        className={styles.image}
        src={siteImages.home.makeBrand.src}
        alt=""
        fill
        sizes="100vw"
      />
      <span className={styles.text}>{t("makeBrand")}</span>
    </Link>
  );
}
