"use client";

import { useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  orbitStones,
  STONE_INTRINSIC,
  SOLAR_SYSTEM_TITLE,
} from "@/data/solar-system";
import styles from "./SolarSystem.module.css";

const pointPositions = [
  { x: 28, y: 30 },
  { x: 72, y: 26 },
  { x: 18, y: 58 },
  { x: 82, y: 56 },
  { x: 38, y: 72 },
  { x: 62, y: 70 },
  { x: 48, y: 20 },
  { x: 55, y: 83 },
] as const;

/**
 * Hibrid ekosistem sahnesi — ortada büyük sarı kristal, etrafta tıklanabilir
 * servis noktaları. WebGL yörünge demo hissi yerine kontrollü, erişilebilir
 * HTML/CSS sahnesi kullanılır; her nokta detay panelini açar.
 */
export function SolarSystem() {
  const [activeStone, setActiveStone] = useState(0);
  const tWwd = useTranslations("whatWeDo");
  const tCommon = useTranslations("common");
  const wwdList = tWwd.raw("list") as Array<{ title: string; body: string }>;
  const active = orbitStones[activeStone];
  const activeBody =
    wwdList.find((item) => item.title === active.wwdTitle)?.body ?? "";

  return (
    <section className={styles.section} aria-labelledby="solar-system-title">
      <h2 id="solar-system-title" className={styles.title}>
        {SOLAR_SYSTEM_TITLE}
      </h2>

      <div className={styles.stage}>
        <div className={styles.scene} aria-hidden="true">
          <span className={styles.orbit} />
          <span className={`${styles.orbit} ${styles.orbitTwo}`} />
          <span className={`${styles.orbit} ${styles.orbitThree}`} />
          <span className={styles.beamOne} />
          <span className={styles.beamTwo} />
          <span className={styles.glow} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/stones/stone-yellow.webp"
            srcSet="/images/stones/stone-yellow.webp 1x, /images/stones/stone-yellow@2x.webp 2x"
            alt=""
            width={STONE_INTRINSIC.yellow.width}
            height={STONE_INTRINSIC.yellow.height}
            className={styles.crystal}
          />
          <span className={styles.coreLabel}>HIBRID</span>
        </div>

        <div className={styles.points} aria-label="Hibrid 360 service ecosystem">
          {orbitStones.map((stone, index) => {
            const position = pointPositions[index];
            const isActive = index === activeStone;
            return (
              <button
                key={stone.orbit}
                type="button"
                className={`${styles.point} ${
                  stone.color === "yellow" ? styles.pointYellow : styles.pointFuchsia
                } ${isActive ? styles.pointActive : ""}`}
                style={
                  {
                    "--x": `${position.x}%`,
                    "--y": `${position.y}%`,
                  } as CSSProperties
                }
                aria-label={stone.label}
                aria-pressed={isActive}
                aria-controls="solar-system-detail"
                onClick={() => setActiveStone(index)}
              >
                <span className={styles.pointPulse} />
                <span className={styles.pointLabel}>{stone.label}</span>
              </button>
            );
          })}
        </div>

        <aside id="solar-system-detail" className={styles.detail} aria-live="polite">
          <p className={styles.detailKicker}>HIBRID 360</p>
          <h3 className={styles.detailTitle}>{active.label}</h3>
          <p className={styles.detailBody}>{activeBody}</p>
          <Link href={active.href} className={styles.detailLink}>
            {tCommon("learnMore")}
          </Link>
        </aside>
      </div>
    </section>
  );
}
