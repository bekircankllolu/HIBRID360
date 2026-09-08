import styles from "./MorphingHeroTitle.module.css";

export function MorphingHeroTitle({ className }: { className?: string }) {
  return (
    <>
      <svg className={styles.filterDefinitions} aria-hidden="true">
        <defs>
          <filter id="think-title-distortion" x="-20%" y="-40%" width="140%" height="180%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.085"
              numOctaves="2"
              seed="8"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="18"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <h1 className={`${styles.title}${className ? ` ${className}` : ""}`}>
        <span className={styles.segment}>
          <span className={styles.visible}>THINK</span>
          <span className={styles.ghost} aria-hidden="true">
            THINK
          </span>
        </span>
        <span className={`${styles.segment} ${styles.highlight}`}>
          <span className={styles.visible}>&amp; THANK</span>
          <span className={styles.ghost} aria-hidden="true">
            &amp; THANK
          </span>
        </span>
      </h1>
    </>
  );
}
