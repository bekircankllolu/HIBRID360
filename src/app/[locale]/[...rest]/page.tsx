import { notFound } from "next/navigation";

/**
 * Locale altında eşleşmeyen tüm yolları yakalar ve notFound() çağırır —
 * böylece Next'in varsayılan 404'ü yerine marka diliyle yazılmış
 * src/app/[locale]/not-found.tsx render edilir (brief Bölüm 14).
 */
export default function CatchAllNotFound() {
  notFound();
}
