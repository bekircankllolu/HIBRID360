import Image from "next/image";
import styles from "@/styles/service-page.module.css";

export function ServiceVisual({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <figure className={styles.visual}>
      <Image
        className={styles.visualImage}
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 1120px"
        priority={priority}
      />
    </figure>
  );
}
