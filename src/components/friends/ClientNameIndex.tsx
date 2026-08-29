"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { ClientEntry } from "@/data/clients";
import styles from "./ClientNameIndex.module.css";

const ALL = "all";

const GROUPS = [
  { id: "a-f", label: "A-F", start: "A", end: "F" },
  { id: "g-l", label: "G-L", start: "G", end: "L" },
  { id: "m-r", label: "M-R", start: "M", end: "R" },
  { id: "s-z", label: "S-Z", start: "S", end: "Z" },
] as const;

function firstLatinLetter(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/İ/g, "I")
    .replace(/ı/g, "i")
    .charAt(0)
    .toUpperCase();
}

function inGroup(name: string, groupId: string) {
  const group = GROUPS.find((candidate) => candidate.id === groupId);
  if (!group) return true;
  const letter = firstLatinLetter(name);
  return letter >= group.start && letter <= group.end;
}

export function ClientNameIndex({ clients }: { clients: ClientEntry[] }) {
  const t = useTranslations("clients.index");
  const [activeGroup, setActiveGroup] = useState(ALL);

  const visibleClients = useMemo(
    () =>
      activeGroup === ALL
        ? clients
        : clients.filter((client) => inGroup(client.name, activeGroup)),
    [activeGroup, clients],
  );

  return (
    <section className={styles.index} aria-labelledby="client-index-title">
      <h2 id="client-index-title" className="srOnly">
        {t("label")}
      </h2>

      <nav className={styles.filters} aria-label={t("label")}>
        <button
          type="button"
          className={`${styles.filter} ${
            activeGroup === ALL ? styles.filterActive : ""
          }`}
          aria-pressed={activeGroup === ALL}
          onClick={() => setActiveGroup(ALL)}
        >
          <span className={styles.arrow} aria-hidden="true">
            →
          </span>
          {t("all")}
        </button>

        {GROUPS.map((group) => (
          <button
            key={group.id}
            type="button"
            className={`${styles.filter} ${
              activeGroup === group.id ? styles.filterActive : ""
            }`}
            aria-pressed={activeGroup === group.id}
            onClick={() => setActiveGroup(group.id)}
          >
            <span className={styles.arrow} aria-hidden="true">
              →
            </span>
            {group.label}
          </button>
        ))}
      </nav>

      <p className="srOnly" aria-live="polite">
        {t("resultCount", { count: visibleClients.length })}
      </p>

      <ul className={styles.names}>
        {visibleClients.map((client) => (
          <li key={client.name} className={styles.nameItem}>
            <span>{client.name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
