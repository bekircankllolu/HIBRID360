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
 * bu script de <html> üzerindeki data-consent değerini rıza kaydı varsa
 * "set" yapıyor. CSS "set" durumunda bandı hiç göstermiyor. Script
 * boyamadan önce çalıştığı için ne gecikmeli giriş ne de yanıp sönme
 * oluyor.
 *
 * `data-consent="pending"` BAŞLANGIÇ DEĞERİ SUNUCUDAN geliyor
 * (src/app/[locale]/layout.tsx). Script eskiden bu değeri her yüklemede
 * kendisi yazıyordu; sunucu çıktısında öznitelik hiç olmadığı için React
 * hidrasyonda onu fazladan görüyor ve her sayfa açılışında uyuşmazlık
 * hatası veriyordu. Şimdi öznitelik iki tarafta da var; script yalnızca
 * kararını vermiş ziyaretçide değeri değiştiriyor ve o tek durum
 * layout'taki `suppressHydrationWarning` ile beklenen ilan ediliyor.
 *
 * Öznitelik hiç yazılamazsa (script engellendi, gizli sekme) değer
 * "pending" kalır ve bant görünür — rıza sorulmadan analytics
 * yüklenmemesi, bandın gizlenmesinden önemli.
 *
 * `beforeInteractive` yerine ham <script>: next/script'in bu stratejisi
 * de <head>'e koyuyor ama bu kadar küçük bir kod için ek yükü gereksiz.
 */
const INIT_SCRIPT = `(function(){try{
if(localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)}))document.documentElement.dataset.consent="set";
}catch(e){}})();`;

export function ConsentInitScript() {
  return (
    // eslint-disable-next-line react/no-danger
    <script dangerouslySetInnerHTML={{ __html: INIT_SCRIPT }} />
  );
}
