# Müşteri Revizyonları Uygulama Denetimi

**Tarih:** 30 Ağustos 2026

**Kapsam:** Revizyon 1–15, masaüstü + mobil, TR + EN

## Durum özeti

| Revizyon | Durum | Uygulama kanıtı / kalan veri |
|---|---|---|
| 1 — Header + mega menü | Tamamlandı | `Header.tsx`, `navigation.ts`; sol marka, sağ navigasyon ve açılır sütunlar |
| 2 — Dünya ikonlu dil seçimi | Tamamlandı | `LanguageSwitcher.tsx`; TR/EN düğmeleri kaldırıldı, tam ekran dil paneli var |
| 3 — Full-screen hero yerleşimi | Tamamlandı | `HeroTypography`, `HibridWebGL`; HIBRID alt-sol kompozisyon ve viewport kullanımı |
| 4 — Sağ üst video scroll ile büyüsün | Uygulama tamam, medya bekliyor | `HeroTypography.tsx` + `home-showreel.ts`; küçük kadraj → tam viewport scroll sahnesi hazır. Onaylı Film A dosyası henüz yok |
| 5 — Ortalı Monks tipi metin düzeni | Tamamlandı | `LessTalk` ve ilgili ana sayfa metin bantları |
| 6 — Ekosistem sahnesi | Tamamlandı | `SolarSystem`; tam genişlik yıldız alanı, HIBRID 360, sarı başlık, büyük isimli noktalar, tık/drag/orbit/partikül/popup/reduced-motion |
| 7 — MONA ana sayfadan kalksın | Tamamlandı | MONA yalnızca `what-we-do/ai-creative-production` rotasında |
| 8 — Butonlar + sarı görsel yazıları | Tamamlandı | Büyük CTA ölçüleri, hover'da renk sabit; görsel üstü metinler marka sarısı |
| 9 — BASIC tipi footer | Tamamlandı | Tipografik footer, iletişim ve kolonlar; 390 px e-posta taşması da düzeltildi |
| 10 — Hizmet detay sayfaları | Tamamlandı | Creative, Production, Post Production, Digital, Live Broadcast, Cloud TV, Event Management, AI Creative Production ve ek servis rotaları mevcut |
| 11 — Büyük görseller tam ekran | Tamamlandı | Ortak servis görseli full-bleed ve en az `100svh`; yatay taşma e2e ile denetleniyor |
| 12 — Contact eski yapı + harita | Tamamlandı | İstanbul panorama, sarı iletişim bölümü, tam genişlik harita; Google iframe açık kullanıcı eyleminden sonra yükleniyor |
| 13 — Clients tipografik marka dizini | Tamamlandı | Siyah zemin üzerinde çerçevesiz beyaz marka adları; solda doğrulanmış veriden türetilen alfabetik gezinme rayı var. Logo ve uydurma sektör kategorisi yok |
| 14 — What We Believe | Uygulama tamam, medya belgesi bekliyor | Atatürk/Küçük Prens alanları, eski menü sırası ve scroll ile büyüyen kurucu video bileşeni hazır. Gerçek konuşma videosu ve nihai hak dosyası release girdisi |
| 15 — Work / RECENT | Uygulama tamam, envanter bekliyor | Büyük RECENT başlığı, Yıl/Hizmet/Sektör filtreleri, 4/2/1 kolon grid, iki dilli proje başlıkları ve vaka şablonu hazır. Gerçek iş kartları müşteri envanteriyle açılacak |

## Uygulama dışı teslim listesi

Bu maddeler tasarım revizyonu değildir; gerçek müşteri verisi/medyası olmadan
doğru şekilde tamamlanamaz. Arayüzleri hazırdır ve sahte içerik kullanılmaz.

1. Ana sayfa AI showreel master video + poster.
2. What We Believe kurucu konuşma videosu; AI üretim kullanıldıysa disclosure kararı.
3. Work envanteri: proje adı TR/EN, müşteri, yıl, hizmet, sektör, kapak, yayın izni ve vaka içeriği.
4. Atatürk, Küçük Prens ve İstanbul panorama için arşiv/lisans onay belgesi.
5. Şirket resmi ünvanı, nihai telefon/e-posta/adres, randevu URL'si ve sosyal hesap URL'leri.
6. MONA karakter videosu, seslendirme ve altyazı varlıkları.

## Doğrulama kapısı

Kod değişikliği ancak aşağıdaki kontroller birlikte geçtiğinde teslim kabul
edilir: TypeScript, ESLint, Vitest, Next production build, Playwright E2E,
Cloudflare/OpenNext build ve 390/1440 px görsel/yatay taşma kontrolü.
