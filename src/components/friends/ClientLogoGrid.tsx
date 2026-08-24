"use client";

import { useEffect, useRef } from "react";
import type { ClientEntry } from "@/data/clients";
import styles from "./ClientLogoGrid.module.css";

/**
 * FRD-02 müşteri ızgarası — kutucuklar ekrana girdikçe kademeli belirir,
 * imleç üzerine gelince marka rengiyle canlanır.
 *
 * Erişilebilirlik / dayanıklılık:
 *   - Kutucuklar CSS'te gizli başlar, ama <noscript> bu gizlemeyi geri
 *     alır: JS çalışmayan tarayıcıda 60+ müşteri adı kaybolmaz.
 *   - IntersectionObserver desteklenmiyorsa hepsi anında görünür yapılır.
 *   - prefers-reduced-motion: CLAUDE.md zorunlu kuralı — beliriş ve hover
 *     geçişleri kapanır, kutucuklar doğrudan son hâlinde durur.
 *
 * Kademeli gecikme (stagger) DOM'a doğrudan yazılır (React state değil):
 * 60+ kutucuk için her karede yeniden render etmek gereksiz maliyet.
 */
export function ClientLogoGrid({ clients }: { clients: ClientEntry[] }) {
  const gridRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const items = Array.from(
      grid.querySelectorAll<HTMLLIElement>(`.${styles.item}`),
    );

    const revealAll = () => {
      items.forEach((item) => item.classList.add(styles.itemVisible));
    };

    // Çok eski tarayıcı ya da hareket azaltma: beklemeden göster.
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Aynı partide görünür olanlara sırayla küçük bir gecikme ver —
        // ızgara tek blok hâlinde değil, dalga hâlinde açılır.
        let step = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const item = entry.target as HTMLLIElement;
          item.style.transitionDelay = `${Math.min(step, 10) * 35}ms`;
          item.classList.add(styles.itemVisible);
          observer.unobserve(item);
          step += 1;
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <noscript>
        {/* eslint-disable-next-line react/no-danger */}
        <style
          dangerouslySetInnerHTML={{
            __html:
              `.${styles.item}{opacity:1 !important;transform:none !important;}` +
              `.${styles.itemUnverified}{opacity:.75 !important;}`,
          }}
        />
      </noscript>

      <ul className={styles.grid} ref={gridRef}>
        {clients.map((client) => (
          <li
            key={client.name}
            className={`${styles.item} ${
              client.verified ? "" : styles.itemUnverified
            }`}
          >
            <span className={styles.itemName}>{client.name}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
