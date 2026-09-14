import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import styles from "./CreativeArchive.module.css";

export function CreativeArchive({
  pending,
  link,
}: {
  pending: { label: string; message: string };
  link: { href: string; label: string };
}) {
  return (
    <section className={styles.archive} aria-labelledby="creative-archive-title">
      <div className={styles.contactSheet} aria-hidden="true">
        {["01", "02", "03", "04"].map((number) => (
          <div key={number} className={styles.frame} data-archive-frame="">
            <span>{number}</span>
            <i />
          </div>
        ))}
      </div>

      <div className={styles.status}>
        <p id="creative-archive-title" className={styles.pending} role="status">
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.pendingLabel}>{pending.label}</span>
          <span>{pending.message}</span>
        </p>
        <Link href={link.href} className={styles.link}>
          {link.label}
          <ArrowRight aria-hidden="true" size={18} strokeWidth={1.75} />
        </Link>
      </div>
    </section>
  );
}
