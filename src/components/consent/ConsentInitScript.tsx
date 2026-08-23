import { CONSENT_STORAGE_KEY } from "@/lib/consent";

/**
 * Boyamadan ÖNCE çalışan satır içi script.
 *
 * Neden var: çerez bandı, rıza kaydını yalnızca tarayıcıda okuyabiliyor
 * (localStorage). Bandı React tarafında `useEffect` ile mount etmek iki
 * soruna yol açıyordu:
 *   1. Bant hidrasyondan sonra ekrana giriyordu — sayfanın en büyük
 *      içerik öğesi olduğu için LCP'yi ~3sn'ye çekiyordu (ölçüldü).
 *   2. Geri gelen ziyaretçide bir an görünüp kaybolma riski.
 *
 * Çözüm: bandın işaretlemesi ilk HTML'de geliyor (statik üretim korunuyor),
 * bu script de <html> üzerine data-consent="set|pending" yazıyor. CSS
 * "set" durumunda bandı hiç göstermiyor. Script boyamadan önce çalıştığı
 * için ne gecikmeli giriş ne de yanıp sönme oluyor.
 *
 * `beforeInteractive` yerine ham <script>: next/script'in bu stratejisi
 * de <head>'e koyuyor ama bu kadar küçük bir kod için ek yükü gereksiz.
 */
const INIT_SCRIPT = `(function(){try{
var v=localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)});
document.documentElement.dataset.consent=v?"set":"pending";
}catch(e){document.documentElement.dataset.consent="pending";}})();`;

export function ConsentInitScript() {
  return (
    // eslint-disable-next-line react/no-danger
    <script dangerouslySetInnerHTML={{ __html: INIT_SCRIPT }} />
  );
}
