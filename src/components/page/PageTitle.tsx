import { Fragment, type CSSProperties } from "react";
import { preloadChapterFont } from "@/lib/chapter-font";
import { needsTallLeading, splitTitle, titleFit, type TitleLang } from "@/lib/page-title";
import styles from "./PageTitle.module.css";

/**
 * Sayfa başlığı (h1) — Faz 2 tasarım dili (plan: shimmering-yawning-spark.md).
 *
 * What We Do "Service Chapter" başlığının dili, efektsiz: Space Grotesk 700,
 * büyük harf, tracking 0, sola yaslı; tek satır beyaz, 2+ satırda SON satır
 * sarı. Düz metin — karıştırma efekti yalnız hizmet sayfalarında
 * (`ServiceTitle`) kalır: efektin görünmez hayalet kopyası `textContent`'i
 * ikiye katlıyor, e2e `toHaveText` sözleşmeleri bunu kaldırmaz.
 *
 * Sığdırma: punto `min(kademe, calc(100cqw / fit))`. `fit` = en uzun büyük
 * harf kelimenin em genişliği × 1.03 (`titleFit`, sunucuda fonttan üretilmiş
 * tablodan hesaplanır). Kademe kelimeyi taşırıyorsa punto kaba iner:
 * SÜRDÜRÜLEBİLİRLİK (9,45 em) 144 px'te taşardı. Kelime asla ortadan
 * kırılmaz; uzun satır kelime aralarından kırılır.
 *
 * Sözleşmeler (PageTitle.test.tsx):
 *  - Tek `<h1>`; satırlar `display:block` span, aralarında GERÇEK boşluk:
 *    `h1.textContent` = satırların boşlukla birleşimi ("THE ART OF TEAMWORK").
 *  - `lang` ZORUNLU ve tahmin edilmez: marka sloganı "en", Türkçe başlık
 *    "tr". Büyük harf dönüşümü (TR'de i → İ) ve ölçü buna bağlı — TR sayfadaki
 *    İngilizce slogan "tr" ile yazılırsa "BRİEF BUİLDER" olur.
 *  - Başlık fontu `preload` ile önden istenir: yalnız PageTitle çizen sayfalar
 *    (ana sayfa asla — bkz. src/lib/chapter-font.ts).
 *
 * Yerleşim: kap (`.box`) bulunduğu bloğun genişliğini alır; kenar boşluğunu
 * çağıran verir (PageHero: `--page-gutter`).
 */

/** Punto tavanı: xl kısa başlık/hero, l uzun ya da ikincil sayfa, sentence cümle başlık. */
export type TitleTier = "xl" | "l" | "sentence";

interface PageTitleOwnProps {
  /** Başlığın dili: marka sloganı "en", Türkçe başlık "tr". `<h1 lang>` olur. */
  lang: TitleLang;
  /** Punto tavanı; varsayılan "xl". */
  tier?: TitleTier;
  /** h1'in kimliği (ör. `aria-labelledby` için). */
  id?: string;
  /** Kaba (`.box`) eklenir: çağıranın yerleşimi için. */
  className?: string;
}

/**
 * Metin kaynağı — en az biri zorunlu. `text` `splitTitle` ile 1–2 satıra
 * bölünür; `lines` açık satırlardır ve ikisi birden verilirse kazanır.
 */
type TitleSource =
  | { text: string; lines?: readonly string[] }
  | { text?: string; lines: readonly string[] };

export type PageTitleProps = PageTitleOwnProps & TitleSource;

/** Yalnız boşluktan oluşan satır atlanır: sarı vurgu gerçek son satıra düşsün. */
function hasText(line: string): boolean {
  return line.trim() !== "";
}

/**
 * `--title-fit` satır içi stili. Boş başlıkta (fit 0) hiç yazılmaz — CSS
 * `calc(100cqw / 0)` üretmesin. Değer 4 ondalığa YUKARI yuvarlanır: fit asla
 * küçülmez, yani punto hesaplanandan asla büyümez.
 */
function fitStyle(fit: number): CSSProperties | undefined {
  if (fit <= 0) return undefined;
  return { "--title-fit": Math.ceil(fit * 1e4) / 1e4 } as CSSProperties;
}

export function PageTitle({ text, lines, lang, tier = "xl", id, className }: PageTitleProps) {
  preloadChapterFont();

  const rows = lines ? lines.filter(hasText) : splitTitle(text ?? "", lang);
  const last = rows.length - 1;

  return (
    <div
      className={[styles.box, className].filter(Boolean).join(" ")}
      style={fitStyle(titleFit(rows, lang))}
    >
      <h1
        id={id}
        lang={lang}
        className={styles.title}
        data-tier={tier}
        data-tall={needsTallLeading(rows.join(" "), lang)}
      >
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 ? " " : null}
            <span
              className={index > 0 && index === last ? `${styles.line} ${styles.accent}` : styles.line}
            >
              {row}
            </span>
          </Fragment>
        ))}
      </h1>
    </div>
  );
}
