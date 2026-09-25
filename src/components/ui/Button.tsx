import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import styles from "./Button.module.css";

/**
 * Sitenin tek buton dili (Faz 2 / B0).
 *
 * Denetimde altı ayrı buton kopyası vardı (PrimaryCta, Brief, ContactForm,
 * service-production/how-we-work, not-found, AI hapları…). Hepsi bu
 * bileşene göç eder; görünüm `Button.module.css`'te tek yerde yaşar.
 *
 *   primary  sarı zemin, siyah metin — birincil eylem (varsayılan)
 *   ghost    şeffaf zemin, ince soluk çerçeve, beyaz metin — siyah zeminde
 *            ikincil eylem
 *   inverse  siyah zemin, sarı metin — sarı panel üstünde
 *
 * Üçünde de üzerine gelince/odakta fuşya süpürme ve SİYAH metin (CLAUDE.md
 * kontrast kuralı: fuşya zeminde beyaz metin AA geçmez).
 *
 * Eleman seçimi `href`'e göre:
 *   - `href` yok          → gerçek `<button>`, `type` varsayılanı "button"
 *                            (form içinde yanlışlıkla gönderim yapmasın)
 *   - dahili yol          → `@/i18n/navigation` `Link` (locale öneki eklenir)
 *   - şemalı/dış adres    → düz `<a>` (https:, mailto:, tel:, //…)
 *
 * "use client" yok: hook ya da olay dinleyicisi kullanmıyor, sunucu
 * bileşeninde de istemci bileşeninde de çalışır. `onClick` geçmek isteyen
 * çağıran zaten istemci bileşenidir.
 */

export type ButtonVariant = "primary" | "ghost" | "inverse";
export type ButtonSize = "md" | "sm";

interface ButtonOwnProps {
  /** Renk rolü; varsayılan "primary". */
  variant?: ButtonVariant;
  /** "md" birincil CTA ölçüsü (varsayılan), "sm" 44 px dokunma hedefli küçük buton. */
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

/** `href` verilince bağlantı olarak basılır; `<a>` öznitelikleri geçer. */
export type ButtonLinkProps = ButtonOwnProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonOwnProps | "href"> & {
    href: string;
  };

/** `href` yoksa `<button>`; `type`, `disabled`, `onClick` vb. geçer. */
export type ButtonElementProps = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps> & {
    href?: undefined;
  };

export type ButtonProps = ButtonLinkProps | ButtonElementProps;

/** Şemalı (https:, mailto:, tel: …) ya da protokole göreli (//) adres. */
const EXTERNAL_HREF = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

/**
 * Uygulama rotası olmayan adres mi? Böyle bir adrese locale öneki
 * eklenmemeli ve istemci yönlendiricisi devreye girmemeli.
 */
export function isExternalHref(href: string): boolean {
  return EXTERNAL_HREF.test(href);
}

function classNames(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return [styles.button, styles[variant], styles[size], className].filter(Boolean).join(" ");
}

export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const { variant, size, className, children, href, ...anchorProps } = props;
    const classes = classNames(variant, size, className);

    if (isExternalHref(href)) {
      return (
        <a {...anchorProps} href={href} className={classes}>
          {children}
        </a>
      );
    }

    return (
      <Link {...anchorProps} href={href} className={classes}>
        {children}
      </Link>
    );
  }

  const { variant, size, className, children, type = "button", ...buttonProps } = props;
  return (
    <button {...buttonProps} type={type} className={classNames(variant, size, className)}>
      {children}
    </button>
  );
}
