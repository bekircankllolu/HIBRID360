import type { Locale } from "@/i18n/routing";
import type { Testimonial } from "@/types/content";
import styles from "./TestimonialList.module.css";

/**
 * brief-rev12.md Bölüm 18.7 — müşteri sözü yerleşim formatı:
 *   "[Tek cümlelik söz — en fazla 20 kelime.]"
 *   [Ad Soyad] · [Unvan] · [Marka]
 *
 * Uygulama notu (aynı bölüm): "İsimsiz söz kullanılmaz" ve yayın için
 * müşteriden yazılı onay şart — bu yüzden written_consent_confirmed
 * olmayan kayıtlar render edilmez, is_published tek başına yeterli değil.
 */
export function TestimonialList({
  testimonials,
  locale,
  placement,
}: {
  testimonials: Testimonial[];
  locale: Locale;
  placement: string;
}) {
  const visible = testimonials.filter(
    (item) =>
      item.written_consent_confirmed &&
      (item.placement ?? []).includes(placement),
  );

  if (visible.length === 0) return null;

  return (
    <div className={styles.list}>
      {visible.map((item) => {
        const quote = locale === "tr" ? item.quote_tr : item.quote_en;
        if (!quote) return null;

        return (
          <figure key={item.id} className={styles.item}>
            {/* TODO: brief 18.7 — 20-30 sn dikey + yatay video, VTT altyazı
                zorunlu. Video varlıkları geldiğinde quote'un üstüne poster +
                preload="none" ile eklenecek. */}
            <blockquote className={styles.quote}>&ldquo;{quote}&rdquo;</blockquote>
            <figcaption className={styles.attribution}>
              {item.person_name} · {item.person_title} · {item.brand_name}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
