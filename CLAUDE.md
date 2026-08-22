# Hibrid 360 — Web Sitesi Yenileme

Bu dosya Claude Code'un proje boyunca referans alacağı ana bağlam dosyasıdır.
Kaynak brief: `docs/brief-rev12.md` (tam brief metni, referans için).
Açık kararlar ve varsayılanlar: `docs/DECISIONS.md`.

## Proje özeti

Mevcut hibrid360.com üzerine: yeni hero katmanı, iki yeni sayfa (Works, yasal
sayfalar), yenilenmiş AI sayfası + MONA karakteri, iki dillilik (TR/EN),
temizlenmiş SEO/GEO altyapısı. Rev 12 ile 9 yeni sayfa/bölüm eklendi
(Directors & Crew, Service Production International, How We Work, Insights,
müşteri sözü sistemi, Brief Builder, AI Usage & Rights, Accessibility
Statement, Sustainability).

## Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript
- **Hosting**: Cloudflare Pages / Workers
- **Medya**: Cloudflare R2 (video, görsel storage) + Cloudflare Images (WebP/AVIF dönüşüm, srcset)
- **Veritabanı**: Supabase (Postgres + Edge Functions + Auth gerekmiyor, form/rıza tabloları için)
- **i18n**: next-intl veya benzeri; `/tr/*` ve `/en/*` ayrı route, hreflang zorunlu
- **Animasyon/WebGL**: Three.js veya native WebGL — yalnızca Faz 5'te (hero tipografi, güneş sistemi)
- **Video format**: AV1/WebM, poster kare + `preload="none"`, görünür alana girince yükleme

## Marka sistemi (sabit — değiştirilmez)

### Renkler
```
Siyah   #000000   — ana zemin
Beyaz   #FFFFFF   — metin / negatif alan
Fuşya   #FF00FF   — vurgu, hover, imleç, hero tipografi (Pantone 806 C)
Sarı    #FFFC00   — vurgu, güneş sistemi, harita, bant (Pantone 803 C)
```

**Kontrast kuralı (WCAG AA — sözleşmeli, opsiyonel değil):**
- Fuşya zemin → SİYAH metin (beyaz metin AA geçmiyor)
- Sarı zemin → SİYAH metin (beyaz metin okunmuyor)
- Neon mint yeşili → yalnızca MONA bölümünde, baby pink zemin üzerinde, büyük punto

### Tipografi
- Marka/hero/dev başlık: **Montserrat Extra Bold**
- Sayfa başlıkları (H1-H3): Montserrat Bold/SemiBold — bir kompozisyonda max 3 punto boyutu
- Gövde metni: [KARAR — bkz. DECISIONS.md] Inter (varsayılan öneri) veya Neue Haas Grotesk Display
- Gövde metni kuralı: 16-18px, satır yüksekliği 1.5

### Marka yazımı
Tek yazım: **Hibrid 360** (boşluklu, tek "i"). "Hibrid360", "HIBRID 360",
"Hybrid 360", "Hibrid 360 Inc." kullanılmayacak. Şirket ünvanı [KARAR].

## i18n kuralları

- Her sayfa TR ve EN için ayrı URL: `/tr/works`, `/en/works`
- hreflang etiketleri zorunlu
- Sloganlar (Kademe 1-4, bkz. brief Bölüm 2) TR sürümde de İngilizce kalır —
  marka dili. Gövde metni Türkçedir.
- İstisna: Contact bölümü ve karbon nötr metni iki dilde tam çevrilir
- Karışık dil yasak: EN sayfada TR buton / TR sayfada çevrilmemiş başlık olmaz
- Service Production (International) sayfası öncelikli dil EN; TR'de kısa özet yeterli

## Performans bütçesi — SÖZLEŞME MADDESİ, pazarlık konusu değil

Brief'in kendi tespiti: istenen hareket katmanlarının hepsi aynı anda
uygulanırsa site mobilde açılmaz. Bu kurallar her PR'da kontrol edilecek:

- **LCP (mobil)**: < 2.5 saniye
- **İlk yükleme toplam transfer**: < 2 MB (videolar hariç)
- **Videolar**: poster kare + `preload="none"` + görünür alana girince yükle; AV1/WebM
- **Görseller**: WebP/AVIF, srcset ile çoklu boyut, lazy loading
- **WebGL**: aynı anda en fazla BİR sahne çalışır; ekrandan çıkınca durur
- **`prefers-reduced-motion`**: zorunlu destek — zoom, custom cursor, MONA döngüsü,
  hero animasyonu bu ayarda devre dışı kalır
- **Test matrisi**: iPhone Safari, Android Chrome, masaüstü Chrome/Safari/Edge, min 3 ekran boyutu

## Erişilebilirlik — standart, tercih değil

- Klavye navigasyonu: tab sırası çalışır, odak halkası görünür
- Otomatik başlayan ses YASAK — MONA dahil, hiçbir istisna yok
- Altyazı her video/replikte zorunlu (VTT, TR+EN)
- WCAG AA kontrast kontrolü yayın öncesi tüm sayfalarda yapılır

## Site haritası (menü — bkz. DECISIONS.md için 5 vs 6 madde kararı)

```
WORK          → Recent Works, yıl bazlı arşiv, müşteriye özel vaka sayfaları
WHAT WE DO    → Creative, Production, Post Production, Digital, Live Broadcast,
                Cloud TV, Event Management, Photography, AI Creative Production,
                Service Production (International), How We Work
CULTURE       → Who We Are, What We Believe, Directors & Crew, Partners, Sustainability
INSIGHTS      → yazı listesi, kategori filtresi  [KARAR: ana menü mü, Culture altı mı]
FRIENDS       → müşteri sözleri (eski adı: Clients)
CONTACT       → İletişim, Brief Builder, Randevu
Footer/yasal  → Privacy, Cookie, KVKK, AI Usage & Rights, Accessibility Statement
```

## Sayfa listesi ve öncelik sırası

Detaylı brief: `docs/brief-rev12.md`. Fazlama: `docs/ROADMAP.md`.

| # | Sayfa | Durum | Kritik not |
|---|---|---|---|
| 1 | Ana sayfa | Mevcut + yeni hero | Video loop kalır, MONA kısa sürüm eklenir |
| 2 | Works (YENİ) | Sıfırdan | plug-ad.co yönlendirmesinin yerine geçer |
| 3 | Who We Are | Culture altına taşı | AI ile konuşan kurucu videosu |
| 4 | What We Believe | Culture altına taşı | İçerik aynı, konum değişir |
| 5 | Partners | Culture altına taşı | Studio Food Room eklenir, Motive çıkar |
| 6 | Friends (eski Clients) | Ad değişir | Yeni body copy + isim düzeltmeleri (bkz. brief 8.2) |
| 7 | Creative | Mevcut | Zemin rengi [KARAR], yeni görsel alanı |
| 8 | Digital | Mevcut | Yeni metinler (brief'te hazır, bkz. Bölüm 10) |
| 9 | AI Creative Production | Sıfırdan geliştirme | MONA karakteri — en karmaşık sayfa |
| 10 | Live Broadcast / Production / Photography | Mevcut | Placeholder temizliği + tek CTA |
| 11 | Contact | Mevcut | Form + WhatsApp [KARAR] + randevu linki [KARAR] |
| 12 | Privacy / Cookie / KVKK / 404 | YENİ | Yasal, iki dilli |
| 13 | Directors & Crew (YENİ) | Rev 12 | Fotoğraf çekimi gerekiyor — bkz. DECISIONS |
| 14 | Service Production Intl (YENİ) | Rev 12 | Öncelikli dil EN |
| 15 | How We Work (YENİ) | Rev 12 | Bütçe bandı rakamları [KARAR] |
| 16 | Insights (YENİ) | Rev 12 | Ayda 2 yazı, ilk 6 konu brief'te hazır |
| 17 | Brief Builder (YENİ işlev) | Rev 12 | 6 soruluk form, MONA konuşur |
| 18 | AI Usage & Rights (YENİ) | Rev 12 | Hukuk danışmanı gerekiyor |
| 19 | Accessibility Statement (YENİ) | Rev 12 | Bilinen sınırlamalar dürüstçe listelenecek |
| 20 | Sustainability (YENİ) | Rev 12 | Ölçüm+sertifika olmadan yayınlanamaz |

## Metinler (SİTEYE GİRECEK METİN)

Brief'teki "SİTEYE GİRECEK METİN" kutuları birebir kopyalanacak nihai
metinlerdir — **üzerinde değişiklik yapılmaz**. Bunların tamamı
`docs/brief-rev12.md` içinde ilgili bölümlerde mevcut. Placeholder/lorem
metin asla commit edilmez; metin hazır değilse `TODO: brief Bölüm X.X`
yorumu bırakılır, boş string veya sahte metin yazılmaz.

## MONA — özel not

MONA sıradan bir UI bileşeni değil, ayrı bir prodüksiyon + state machine işi.
Detaylar `docs/brief-rev12.md` Bölüm 11'de. Kısa özet:

- Kafası eski Mac (1984 Macintosh önerilen), kostüm deniz kızı/pullu, baby pink zemin
- Ses: [KARAR] insan seslendirme önerilir; TR+EN ayrı
- Etkileşim: soru-cevap kütüphanesi (10 soru + 1 easter egg), idle repliği, geri dönüş repliği
- Otomatik ses YASAK — sayfa açıldığında sessiz, yalnızca yazı
- Teslim formatları: WebM(VP9+alfa)+MP4, replik başına ayrı ses dosyası, VTT altyazı
- Önce state machine'i mock veri ile kur, gerçek video/ses varlıkları geldikçe bağla —
  frontend geliştirmesi prodüksiyonu beklemek zorunda kalmasın

## Supabase şeması

`docs/supabase-schema.sql` içinde. Ana tablolar: `works`, `directors`,
`testimonials`, `insights_posts`, `brief_submissions`, `contact_submissions`.

## Çalışma kuralları

- Her yeni sayfa/bileşen önce mobilde test edilir, sonra masaüstü
- Placeholder/lorem ipsum asla production'a gitmez
- Marka renklerinin dışında hardcoded hex kullanılmaz — CSS custom properties
  (`--color-brand-black`, `--color-brand-fuchsia` vb.) üzerinden çalışılır
- Her PR'da performans bütçesi kontrol edilir (Lighthouse mobile skoru paylaşılır)
- [KARAR] etiketli maddeler DECISIONS.md'de kapatılmadan o bölümün final
  tasarımı/geliştirmesi başlamaz — varsayılan önerilerle iskelet kurulabilir
  ama commit mesajında "KARAR bekliyor" notu düşülür
