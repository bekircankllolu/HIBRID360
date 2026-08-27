# Açık Kararlar (Hibrid 360 web sitesi)

Brief'te [KARAR] işaretli 15+ madde var. Her biri kapatılmadan final
tasarım/geliştirme başlamamalı — ama iskelet, bu sayfaların çoğunda,
aşağıdaki **varsayılan önerilerle** kurulabilir, sonradan tek satırlık
değişiklikle güncellenir. Müşteriye (Zühre Didem Gödek) tek dosya olarak
gönderilip toplu onay istenmesi önerilir.

Durum sütunu: `AÇIK` / `VARSAYILANLA İLERLE` / `KAPANDI`

| # | Konu | Brief bölümü | Varsayılan öneri | Durum |
|---|---|---|---|---|
| 1 | Şirket ünvanı (A.Ş./Ltd. Şti.) | 1.1 | Müşteriden tek soru: resmi ünvan nedir | AÇIK |
| 2 | Gövde fontu | 1.3 | Inter (ücretsiz, web lisansı sorunsuz) | VARSAYILANLA İLERLE |
| 3 | İmleç seçeneği (taş / derece işareti) | 1.5 | Seçenek B (derece işareti °) — daha hafif, performans dostu | VARSAYILANLA İLERLE |
| 4 | Telif satırı / şirket ünvanı | 1.8 | "© 2026 Hibrid 360. All Rights Reserved." (ünvan netleşince eklenir) | AÇIK |
| 5 | İletişim e-postası | 1.8 | contact@hibrid360.com (brief'te zaten geçiyor, teyit gerekiyor) | AÇIK |
| 6 | Kurucu görseli üstü pop-up sunum (küre/logo ızgarası) | 8.1 | Düz logo ızgarası (daha hızlı, daha performanslı) | VARSAYILANLA İLERLE |
| 7 | Creative sayfası zemin rengi | 9 | Toz pembe zemin + siyah başlık + fuşya vurgu (brief'in kendi önerisi) | VARSAYILANLA İLERLE |
| 8 | MONA sesi | 11.1 | İnsan seslendirme (brief'in önerisi — "karakter yapay, ses insan" tezi) | AÇIK — prodüksiyon planlanmalı |
| 9 | MONA kafası (iMac G3 / 1984 Mac) | 11.1 | 1984 Macintosh (brief'in önerisi — "hello" ekranı açılış repliğine bağlanıyor) | VARSAYILANLA İLERLE |
| 10 | WhatsApp butonu | 13 | Evet, ikincil CTA olarak eklensin | VARSAYILANLA İLERLE |
| 11 | Randevu linki | 13 | Cal.com (Calendly'den daha esnek ücretsiz tier) | VARSAYILANLA İLERLE |
| 12 | Sitenin birincil eylemi | 13 | "30 dakikalık tanışma görüşmesi" (takvim linki), ikincil WhatsApp | VARSAYILANLA İLERLE |
| 13 | Insights menü konumu | 18.1 / 20.1 | Ana menüde 6. madde (brief'in gerekçesi güçlü: gömülü içerik taranmaz) | VARSAYILANLA İLERLE |
| 14 | Directors & Crew — kaç kişi, çekim tarihi | 20.3 | Müşteriden liste + çekim günü planlanmalı | AÇIK |
| 15 | How We Work bütçe bandı rakamları | 20.5 | Somut rakam yerine süre bandı ("3-6 hafta") + form yönlendirme | AÇIK — ticari karar, müşteride kalmalı |
| 16 | Works içerik envanteri (iş adı, müşteri, yıl, format, yayın izni, dosya/video/görsel konumu, vaka sayfası açılacak mı?) | 7.3 | Yok — bu liste olmadan grid tasarımı ve yayınlanacak işler kesinleşmez | AÇIK — blocker |

## Öncelik: Hangi kararlar gerçek blocker?

Bunlar olmadan **ilgili bölüm** başlamaz (ama diğer bölümler paralel gider):

1. **Works içerik envanteri (#16)** — Works sayfası tasarımı için şart
2. **Directors & Crew kadro + çekim tarihi (#14)** — o sayfa için şart
3. **MONA ses kararı (#8)** — prodüksiyon süresi uzun, en erken karara bağlanmalı
4. **How We Work rakamları (#15)** — ticari karar, müşteri vermeden yazılamaz
5. **Şirket ünvanı + e-posta (#1, #4, #5)** — footer/yasal sayfalar için şart

Geri kalan kararlar "VARSAYILANLA İLERLE" ile iskelet aşamasında
kapatılabilir, sonradan değiştirmek maliyetsiz.

## Works içerik envanteri için gereken minimum veri

Faz 2'ye geçmeden önce her iş için aşağıdaki alanlar müşteri tarafından
doğrulanmalı. Bu bilgiler gelmeden sitede fake iş, fake müşteri veya stok
görsel yayınlanmaz.

- İş adı
- Müşteri
- Yıl
- Format
- Yayın izni durumu
- Dosya/video/görsel konumu
- Vaka sayfası açılacak mı?

## TR çevirisi bekleyen metinler (dil tutarlılığı)

CLAUDE.md kuralı: sloganlar TR sürümde de İngilizce kalır (marka dili),
**gövde metni Türkçedir** ve "karışık dil yasak". Aşağıdaki bloklar bu
kuralın istisnası değil — deck (`docs/brief-rev12.md`) bunların yalnızca
**EN** sürümünü verdi, TR karşılığını vermedi. CLAUDE.md "onaylanmamış
çeviri uydurulmaz" dediği için kodda İngilizce bırakıldılar; sonuç olarak
şu an TR sayfalarında İngilizce gövde metni görünüyor.

Müşteriden bu metinlerin TR çevirisi geldiğinde ilgili `tr` alanları
doldurulacak — kod tarafı hazır, tek eksik onaylı metin.

| Sayfa | Ne eksik | Kaynak / kod |
|---|---|---|
| Digital | 10 hizmet açıklaması + 4 değer cümlesi | DIG-03 · `src/data/digital-services.ts`, `what-we-do/digital/page.tsx` |
| How We Work | Hero cümlesi + 4 süreç adımı açıklaması | Bölüm 20.5 · `src/data/how-we-work.ts`, `what-we-do/how-we-work/page.tsx` |
| Insights | Hero alt başlığı | Bölüm 20.6 · `messages/tr.json` → `insights.heroSubtitle` |
| Accessibility | "Our commitment" · "What we have done" · "Feedback" paragrafları | Bölüm 18.10 · `src/data/accessibility.ts` |
| Cloud TV | "WHAT ARE HIBRID SOLUTIONS?" bölüm başlığı | `messages/tr.json` → `services.cloudTv.solutionsTitle` |
| How We Work | Bütçe tablosundaki format adları ("Product / how-to film" vb.) | Bölüm 20.5 · `src/data/how-we-work.ts` → `budgetBands[].format` |
| Culture hub | Üç bölüm adı: What We Believe · Directors & Crew · Partners | `messages/tr.json` → `culture.hub.*` (Biz Kimiz ve Sürdürülebilirlik çevrildi) |

**İstisna (çeviri gerekmiyor):** Service Production (International)
sayfası — CLAUDE.md "öncelikli dil EN; TR'de kısa özet yeterli" diyor,
bu sayfadaki İngilizce gövde metni kasıtlıdır.

**Kasıtlı olarak İngilizce kalanlar** (marka dili, çevrilmeyecek): ana
menü maddeleri, hero/bant sloganları, hizmet adları (Creative,
Production, Cloud TV…), MONA, AI SHOWREEL, footer marka imzası ve telif
satırı.

## Ekosistem etkileşimi — 2026-08-27 kullanıcı onayı

Bu bölümde brief 4.5 ve önceki görsel denetimin küçük 3D taş önerisi,
kullanıcının son revizyonuyla güncellendi:

- Merkezde mevcut gerçekçi sarı kristalin turntable videosu korunur.
- Çevredeki sekiz hizmet, düz sarı/fuşya noktalarla temsil edilir;
  kabarık küre gölgelendirmesi kullanılmaz.
- Boşta döngü, kristalde fareyle beklerken duraklama, kaydırırken
  ileri/geri dönüş ve aynı kareden devam davranışı uygulanır.
- Noktalar sürüklenebilir; bırakılınca yumuşak biçimde yörüngeye döner.
  İnce partikül izleri gerçek hareket yolundan üretilir.
- Tıklama/dokunma önce hizmet detayını açar; mevcut hizmet rotasına
  detay bağlantısından gidilir. Hizmet adı ve açıklaması uydurulmaz.
- Detay, kristalin üzerine kapanan kutu yerine sahne altında ayrılmış
  alanda gösterilir. Klavye erişimi ve azaltılmış hareket desteği korunur.
- Yeni WebGL sahnesi eklenmez. Video ve arka plan tek Canvas içinde
  birleştirilir; CSS katmanlamasından doğan siyah dikdörtgen kaldırılır.

Durum: **KAPANDI — kullanıcı planı onayladı.** Bu karar yalnızca ekosistem
bölümüne aittir; HIBRID hero animasyonu ve MONA tasarımı değiştirilmez.
