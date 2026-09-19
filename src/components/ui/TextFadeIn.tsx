"use client";

import {
  Fragment,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { useScrollScene } from "@/hooks/useScrollScene";
import { splitWords } from "@/lib/split-words";
import styles from "./TextFadeIn.module.css";

type UnitStyle = CSSProperties & {
  "--i": number;
};

export interface TextFadeInProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  children: string;
  by?: "character" | "word";
}

/**
 * Kelime (ya da harf) sırasıyla beliren metin.
 *
 * 17 Eylül 2026'dan beri scroll'a bağlı: eskiden ekrana girince BİR KEZ
 * zamanlı bir geçiş oynuyordu; artık her birim metin ekrana girdikçe
 * yanar, geri kaydırınca söner (useScrollScene "pass", ölçüler CSS'te).
 * `--progress` yokken (sunucu render'ı, JS yok, hareket azaltma) metin tam
 * görünür.
 */
export function TextFadeIn({
  children,
  className,
  by = "word",
  ...props
}: TextFadeInProps) {
  const { ref, motion } = useScrollScene<HTMLSpanElement>({ mode: "pass" });
  // `splitWords` kullanılıyor, `split(/\s+/)` değil: ikincisi bölünmez
  // boşluğu (U+00A0) da ayırıcı sayar. Çeviri dosyalarında "Hibrid 360"
  // gibi birlikte kalması gereken ifadeler NBSP ile yazılıyor; ham regex
  // onları iki ayrı kelimeye bölüp satır sonunda koparıyordu — NBSP'nin
  // tek işini boşa çıkarıyordu (bkz. src/lib/split-words.ts).
  const units = by === "word" ? splitWords(children) : Array.from(children);

  return (
    <span
      ref={ref}
      className={`${styles.root}${className ? ` ${className}` : ""}`}
      data-motion={motion}
      {...props}
    >
      {units.map((unit, index) => (
        <Fragment key={`${unit}-${index}`}>
          <span className={styles.unit} style={{ "--i": index } as UnitStyle}>
            {unit}
          </span>
          {by === "word" && index < units.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
