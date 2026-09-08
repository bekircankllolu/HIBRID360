"use client";

import Image from "next/image";
import type { CSSProperties, PointerEvent } from "react";
import styles from "./EditorialImage.module.css";

type EditorialImageProps = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  rotating?: boolean;
  /** Sürekli, kendiliğinden nefes alan zoom in/out döngüsü (hover'a bağlı
   * değil) — brief'te referans verilen landonorris.com/oryzo.ai tarzı
   * ambient hareket. `rotating` ile birlikte kullanılmaz. */
  ambient?: boolean;
};

type MotionStyle = CSSProperties & {
  "--image-shift-x": string;
  "--image-shift-y": string;
};

export function EditorialImage({
  src,
  alt,
  sizes,
  priority = false,
  rotating = false,
  ambient = false,
}: EditorialImageProps) {
  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 12;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 12;
    event.currentTarget.style.setProperty("--image-shift-x", `${x}px`);
    event.currentTarget.style.setProperty("--image-shift-y", `${y}px`);
  }

  function resetPointer(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.style.setProperty("--image-shift-x", "0px");
    event.currentTarget.style.setProperty("--image-shift-y", "0px");
  }

  return (
    <div
      className={`${styles.frame} ${rotating ? styles.rotating : ""} ${ambient ? styles.ambient : ""}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      style={
        {
          "--image-shift-x": "0px",
          "--image-shift-y": "0px",
        } as MotionStyle
      }
    >
      <Image
        className={styles.image}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
      />
    </div>
  );
}
