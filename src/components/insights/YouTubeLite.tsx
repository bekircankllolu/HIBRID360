"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import styles from "./YouTubeLite.module.css";

type YouTubeLiteProps = {
  title: string;
  playLabel: string;
};

const VIDEO_ID = "yj9rokSeack";

export function YouTubeLite({ title, playLabel }: YouTubeLiteProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={styles.embed}>
      {playing ? (
        <iframe
          className={styles.player}
          src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button
          className={styles.poster}
          type="button"
          aria-label={playLabel}
          onClick={() => setPlaying(true)}
        >
          <span className={styles.play} aria-hidden="true">
            <Play size="42%" fill="currentColor" />
          </span>
        </button>
      )}
    </div>
  );
}
