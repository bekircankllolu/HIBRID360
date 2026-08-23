import { Link } from "@/i18n/navigation";
import { SERVICE_LINKS } from "@/data/service-links";
import styles from "./ServiceLinksRow.module.css";

/** HOME-06 — 3. ekran altı, hizmet linkleri satırı. Etiketler EN/TR ortak. */
export function ServiceLinksRow() {
  return (
    <nav className={styles.row} aria-label="Services">
      <ul className={styles.list}>
        {SERVICE_LINKS.map((service) => (
          <li key={service.label}>
            <Link href={service.href} className={styles.link}>
              {service.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
