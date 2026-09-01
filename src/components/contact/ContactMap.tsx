interface ContactMapProps {
  className: string;
  src: string;
  title: string;
}

/** Contact sayfasıyla birlikte doğrudan yüklenen tam ekran Google haritası. */
export function ContactMap({ className, src, title }: ContactMapProps) {
  return (
    <iframe
      className={className}
      src={src}
      title={title}
      loading="eager"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
