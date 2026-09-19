"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { MonaShard } from "@/components/mona/MonaShard";
import { Link } from "@/i18n/navigation";
import styles from "./ServiceDirectory.module.css";

export interface ServiceDirectoryItem {
  id: string;
  name: string;
  href: string;
  description: string;
  degree: string;
  image?: {
    src: string;
    alt: string;
    focus: string;
  };
}

export function ServiceDirectory({
  items,
  label,
}: {
  items: readonly ServiceDirectoryItem[];
  label: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const rowsRef = useRef<Array<HTMLLIElement | null>>([]);
  const stageRef = useRef<HTMLElement>(null);
  const pointerFrameRef = useRef<number | null>(null);
  const active = items[activeIndex] ?? items[0];
  const [monaMounted, setMonaMounted] = useState(false);

  // MONA (WebGL) yalnız AI satırı ÜZERİNDE KALINDIĞINDA kurulur. Listede
  // hızlıca gezinirken satır bir an aktif olup geçiyor; gecikme olmasaydı
  // her geçişte bir WebGL bağlamı kurulup yıkılırdı.
  const aiActive = !active?.image;
  useEffect(() => {
    if (!aiActive) {
      setMonaMounted(false);
      return;
    }
    const timer = window.setTimeout(() => setMonaMounted(true), 180);
    return () => window.clearTimeout(timer);
  }, [aiActive]);

  const setPointerOffset = (progress: number) => {
    if (pointerFrameRef.current !== null) cancelAnimationFrame(pointerFrameRef.current);
    pointerFrameRef.current = requestAnimationFrame(() => {
      stageRef.current?.style.setProperty("--pointer-x", `${progress * 3.5}%`);
      pointerFrameRef.current = null;
    });
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const progress = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    setPointerOffset(Math.max(-1, Math.min(1, progress)));
  };

  const resetPointer = () => setPointerOffset(0);

  useEffect(() => {
    const rows = rowsRef.current.filter((row): row is HTMLLIElement => Boolean(row));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => {
            const center = window.innerHeight / 2;
            const aDistance = Math.abs(a.boundingClientRect.top + a.boundingClientRect.height / 2 - center);
            const bDistance = Math.abs(b.boundingClientRect.top + b.boundingClientRect.height / 2 - center);
            return aDistance - bDistance;
          });
        const index = Number(visible[0]?.target.getAttribute("data-index"));
        if (Number.isInteger(index)) setActiveIndex(index);
      },
      { rootMargin: "-38% 0px -38%", threshold: 0.01 },
    );

    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [items.length]);

  useEffect(
    () => () => {
      if (pointerFrameRef.current !== null) cancelAnimationFrame(pointerFrameRef.current);
    },
    [],
  );

  return (
    <section className={styles.directory} aria-label={label}>
      <figure
        ref={stageRef}
        className={styles.stage}
        data-active-service={active.id}
        aria-hidden="true"
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPointer}
        onPointerCancel={resetPointer}
      >
        <div className={styles.visual} key={active.id}>
          {active.image ? (
            <div className={styles.panLayer}>
              <Image
                className={styles.stageImage}
                src={active.image.src}
                alt=""
                fill
                sizes="(min-width: 1440px) 52vw, (min-width: 900px) 56vw, 100vw"
                quality={92}
                priority={activeIndex === 0}
                draggable={false}
                style={{ objectPosition: active.image.focus }}
              />
            </div>
          ) : (
            /* Görseli olmayan tek satır AI Creative Production: orada fotoğraf
               değil MONA'nın kendisi duruyor (18 Eylül 2026 kullanıcı isteği:
               "AI Creative Production üzerine geldiğimizde orada MONA'yı
               görelim, partiküllerden oluşsun ve fareye tepki versin").
               Tipografik poster altta kalır: MONA kurulamadığında (dokunmatik,
               dar ekran, WebGL yok) sahne boş kalmasın. */
            <div className={styles.aiStage}>
              <div className={styles.typePoster}>
                <span>H360 / AI</span>
                <strong lang="en">{active.name}</strong>
              </div>
              {monaMounted ? <MonaShard placement="center" /> : null}
            </div>
          )}
        </div>
        <div className={styles.stageMeta}>
          <span>{active.degree}</span>
          <span lang="en">{active.name}</span>
        </div>
      </figure>

      <ol className={styles.list}>
        {items.map((item, index) => (
          <li
            key={item.id}
            ref={(row) => {
              rowsRef.current[index] = row;
            }}
            className={styles.row}
            data-index={index}
            data-active={index === activeIndex}
          >
            <Link
              href={item.href}
              className={styles.link}
              onPointerEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
            >
              <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.copy}>
                <strong className={styles.name} lang="en">{item.name}</strong>
                <span className={styles.description}>{item.description}</span>
              </span>
              <ArrowUpRight className={styles.arrow} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
