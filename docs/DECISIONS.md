# Açık Kararlar (Hibrid 360 web sitesi)

Brief'te [KARAR] işaretli 15+ madde var. Her biri kapatılmadan final
tasarım/geliştirme başlamamalı — ama iskelet, bu sayfaların çoğunda,
aşağıdaki **varsayılan önerilerle** kurulabilir, sonradan tek satırlık
değişiklikle güncellenir. Müşteriye (Zühre Didem Gödek) tek dosya olarak
gönderilip toplu onay istenmesi önerilir.

Durum sütunu: `AÇIK` / `VARSAYILANLA İLERLE` / `KAPANDI` / `SUPERSEDED`

> **29 Ağustos 2026 müşteri revizyonu** aşağıdaki tablodaki bazı maddeleri
> geçersiz kıldı. Eski kararlar **silinmedi**, `SUPERSEDED` işaretlendi ve
> gerekçesi bu dosyanın sonundaki "29 Ağustos 2026 revizyonu" bölümünde
> duruyor. Yeni kararlar #17–#24 numaralarıyla eklendi.

| # | Konu | Brief bölümü | Varsayılan öneri | Durum |
|---|---|---|---|---|
| 1 | Şirket ünvanı (A.Ş./Ltd. Şti.) | 1.1 | Müşteriden tek soru: resmi ünvan nedir | AÇIK |
| 2 | Gövde fontu | 1.3 | Inter (ücretsiz, web lisansı sorunsuz) | VARSAYILANLA İLERLE |
| 3 | İmleç seçeneği (taş / derece işareti) | 1.5 | Seçenek B (derece işareti °) — daha hafif, performans dostu | VARSAYILANLA İLERLE |
| 4 | Telif satırı / şirket ünvanı | 1.8 | "© 2026 Hibrid 360. All Rights Reserved." (ünvan netleşince eklenir) | AÇIK |
| 5 | İletişim e-postası | 1.8 | contact@hibrid360.com (brief'te zaten geçiyor, teyit gerekiyor) | AÇIK |
| 6 | Kurucu görseli üstü pop-up sunum (küre/logo ızgarası) | 8.1 | Düz logo ızgarası (daha hızlı, daha performanslı) | KAPANDI — 29 Ağu 2026 pekiştirdi: logo değil, düz **marka adı** ızgarası (bkz. #21) |
| 7 | Creative sayfası zemin rengi | 9 | Toz pembe zemin + siyah başlık + fuşya vurgu (brief'in kendi önerisi) | **SUPERSEDED** — 13 Eyl 2026: zemin siyah, metin beyaz + sarı, fuşya yardımcı renk (bkz. #32) |
| 8 | MONA sesi | 11.1 | İnsan seslendirme (brief'in önerisi — "karakter yapay, ses insan" tezi) | AÇIK — prodüksiyon planlanmalı |
| 9 | MONA kafası (iMac G3 / 1984 Mac) | 11.1 | 1984 Macintosh (brief'in önerisi — "hello" ekranı açılış repliğine bağlanıyor) | VARSAYILANLA İLERLE |
| 10 | WhatsApp butonu | 13 | Evet, ikincil CTA olarak eklensin | VARSAYILANLA İLERLE |
| 11 | Randevu linki | 13 | Cal.com (Calendly'den daha esnek ücretsiz tier) | VARSAYILANLA İLERLE |
| 12 | Sitenin birincil eylemi | 13 | "30 dakikalık tanışma görüşmesi" (takvim linki), ikincil WhatsApp | VARSAYILANLA İLERLE |
| 13 | Insights menü konumu | 18.1 / 20.1 | Ana menüde 6. madde (brief'in gerekçesi güçlü: gömülü içerik taranmaz) | **SUPERSEDED** — 29 Ağu 2026: Insights ana menüde değil (bkz. #18) |
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

### Son görsel revizyon: yıldızlar ve mini pencereler

2026-08-27 tarihli son kullanıcı isteği, yukarıdaki sahne altı detay
kararının yerini alır. Detay artık seçilen noktanın yakınında küçük,
modal olmayan bir pencere olarak açılır; kristali kapatmadan sahne
sınırlarına göre konumlanır. Escape, dışarı tıklama ve klavye odağı korunur.

- Kullanıcının yeni `hibtidtas.mp4` teslimi, %15 küçük boyutta ve normal
  `1×` hızda kullanılır. Hover ve kaydırma kontrolü devam eder.
- Seçimde merkez kristale en fazla %4.5 yakınlaşılır; pencere okunurken
  paralaks kayması durur. Diğer noktalar yörüngelerinde hareket eder.
- Arka plan yıldızları doğal beyaz, hafif soğuk/sıcak beyaz tonlardadır;
  sarı/fuşya servis noktalarına ve partikül izlerine ayrılır.
- Yıldızlar senkron olmayan yumuşak titreşim ve çok küçük hareket kullanır.
  Parçacık izleri daha yoğun, 3.8-5.4 saniye ömürlüdür.
- Azaltılmış hareket tercihi tüm dekoratif hareketi durdurur. Yeni
  görsel üretimi, kütüphane veya WebGL sahnesi eklenmez.

---

## 29 Ağustos 2026 müşteri revizyonu

Müşteri, siteyi eski hibrid360.com'un bilgi mimarisine yaklaştıran bir
revizyon verdi. Aşağıdaki maddeler **kapanmış kararlardır** — sorulmadı,
müşteri tarafından bildirildi.

| # | Konu | Karar | Durum | Etki |
|---|---|---|---|---|
| 17 | Photography bağımsız hizmet sayfası | **Kaldırıldı.** Yetenek olarak Solutions'ta ("Photo Shooting") ve Production/Post Production kapsamında kalır | KAPANDI | `/what-we-do/photography` → `/what-we-do` (308). Katalogdan, service-links'ten, What We Do listesinden, sitemap'ten çıktı |
| 18 | Ana menü | Eski sitenin **yedi maddelik** sırasına dönüldü: Who We Are · What We Do · What We Believe · Solutions · Clients · Partners · Contact | KAPANDI | Deck'in beş maddelik menüsü ve #13 geçersiz. WORK, INSIGHTS ve CULTURE menüde değil; rotaları yaşıyor |
| 19 | Menü etiketlerinin dili | TR locale'de **Türkçe** karşılıklar kullanılır | KAPANDI | "Ana menü maddeleri iki dilde de İngilizce kalır" varsayımı geçersiz. Hizmet **adları** İngilizce kalmayı sürdürür (özel ad) |
| 20 | Eski Culture alt rotaları | Who We Are · What We Believe · Partners kendi canonical rotalarına taşındı | KAPANDI | `/culture/*` → yeni rotalar (308). `/culture` hub'ı silinmedi: Directors & Crew ve Sustainability'nin başka üst sayfası yok |
| 21 | Friends → Clients | Sayfanın görünür adı ve rotası **Clients** oldu (eski sitedeki adına dönüş) | KAPANDI | `/friends` → `/clients` (308). Logo alanı **eklenmeyecek**; marka adları INNOCEAN referansındaki açık yerleşim mantığıyla çerçevesiz gösterilecek. Doğrulanmış sektör verisi olmadığı için semantik kategori filtresi yok; yalnızca alfabetik gezinme rayı var |
| 22 | Solutions sayfası | Yeniden açıldı; eski sayfanın on beş yetenek listesiyle | KAPANDI | Giriş paragrafı yok — eski sayfada da yoktu, uydurulmadı |
| 23 | Ana sayfada MONA | **Kaldırıldı.** MONA yalnızca AI Creative Production sayfasında | KAPANDI | Uygulandı; ana sayfa MONA render etmiyor |
| 24 | Full-bleed tasarım | Genel kural oldu | KAPANDI | Uygulandı; ana sahneler, servis görselleri, Work grid'i ve Contact haritası viewport genişliğini kullanıyor |

### Bu revizyonla kapanmayan, hâlâ blocker olan maddeler

- **#16 Works içerik envanteri** — hâlâ `AÇIK — veri blocker'ı`. `RECENT`
  sayfa düzeni, Yıl/Hizmet/Sektör filtreleri, proje grid'i, iki dilli başlık
  alanları ve vaka şablonu hazır; gerçek kartlar envanter gelince açılacak.
- **AI showreel filmi** — gerçek dosya hâlâ yok; scroll ile küçük kadrajdan
  tam ekrana büyüme altyapısı hazır (`src/data/home-showreel.ts`).
- **What We Believe müşteri videosu** — müşterinin çekeceği konuşma videosu
  için hiçbir gerçek dosya yok. Sahte video/yer tutucu kişi üretilmedi.
- **Atatürk fotoğrafı ve Küçük Prens illüstrasyonunun kullanım hakları** —
  bkz. BLOCKERS.md madde 8 ve LEGACY_CONTENT_ROUTE_MAP.md bölüm 4.

### Açık teknik kararlar (bu revizyonla doğan)

| Konu | Durum | Nerede |
|---|---|---|
| Harita sağlayıcısı | **KAPANDI** — anahtarsız Google Maps sorgu gömmesi; 30 Ağustos müşteri revizyonuyla iframe Contact sayfasıyla birlikte doğrudan yüklenir, yol tarifi bağlantısı haritadan bağımsızdır | `src/data/contact.ts` · `ContactMap.tsx` |
| Clients gövde metni çelişkisi | **AÇIK** — deck metni "onlara müşteri değil, dost diyoruz" diyor, sayfa adı artık Clients | CURRENT_CONTENT_GAPS.md madde 18 |
| Contact adresi | **AÇIK** — eski site (2020) ile deck (Ağu 2026) farklı adres veriyor | CURRENT_CONTENT_GAPS.md madde 4 |
| Solutions giriş paragrafı | **AÇIK** — eski sayfada yoktu, müşteriden isteniyor | CURRENT_CONTENT_GAPS.md madde 19 |
| `works.category` alanının anlamı | **AÇIK** — arayüzde artık kullanılmıyor; ne anlama geldiği netleşmeli | `supabase/migrations/20260829100050_extend_works_filter_facets.sql` |

## 6 Eylül 2026 içerik dalgası — Work hero başlığı

| # | Konu | Karar | Durum | Etki |
|---|---|---|---|---|
| 25 | Work sayfası hero başlığı | **THE ART OF TEAM WORK.** Eski başlık "RECENT" idi | KAPANDI | `work/page.tsx` H1'i sabit metin taşır. Marka sloganı olduğu için TR sayfada da İngilizce kalır (CLAUDE.md i18n kuralı: sloganlar marka dilidir). "Son İşler"/"Recent Work" artık h2 olarak arşiv listesinin başında. Öksüz kalan `messages/*.json` → `work.pageTitle` anahtarı kaldırıldı. Sözleşme testi: `e2e/canonical-routes.spec.ts` |

**Metnin kaynağı hakkında not:** Bu başlık `97f42fa` ("feat: roll out
content and Mona revisions") ile geldi ama brief-rev12.md dahil hiçbir
dokümanda geçmiyordu; metnin müşteri revizyonu olduğu 8 Eylül 2026'da
kullanıcı tarafından doğrulandı ve bu satırla kayda geçirildi. Benzer
durumlarda metin doğrudan koda gömülmeden önce buraya yazılmalı —
aksi halde tek kaynağı git history olur ve sözleşme testleri sessizce
eskir.

## 8 Eylül 2026 — Think & Thank marka ifadesi görselleri

Müşteriden "THINK & THANK SAYFAYA EKLENECEK GÖRSELER" başlıklı bir
e-posta ekiyle 4 hazır tipografi grafiği geldi. Üçü sayfaya eklendi:

| # | Konu | Karar | Durum | Etki |
|---|---|---|---|---|
| 26 | Think & Thank marka ifadesi görseli | Müşteri grafiklerinden yalnızca "PURE. SIMPLE. POWERFUL." (sarı zemin) kalıcı — "IT'S YOUR STORY..." ve fuşyalı "FROM IDEA TO IMPACT..." aynı gün geri alındı (bkz. not — kullanıcı bir önceki revizyonda yanlış görseli işaret ettiğini belirtti) | KAPANDI | `think-and-thank/page.tsx` — hero sonrası, tek bölüm. `EditorialImage`'a `ambient` prop'u eklendi (sürekli nefes alan zoom, hover'a bağlı değil) — brief'in landonorris.com/oryzo.ai referansı. Kullanılmayan iki görselin WebP dosyası ve `site-images.ts` kaydı silinmedi, ileride başka sayfada kullanılabilir |
| 27 | "FROM IDEA TO IMPACT..." düz sürüm kullanılmadı | Aynı mesajın fuşya vurgusuz hali (client dosyası `2.jpeg`) sayfaya eklenmedi — aynı sayfada aynı cümlenin iki kez tekrarı olurdu | AÇIK | İstenirse başka bir sayfaya (ör. Digital, Creative) yerleştirilebilir. Kaynak dosya işlenmedi, kullanıcıda duruyor |
| 28 | "YOUR BRAND. CROWNED." + döner taç | Sitede hâlâ yok, ama `Downloads/Hibrid-360-Crown-Rotation.zip` içinde bağımsız bir HTML prototipi bulundu (tek görsel + CSS `rotateY` sallanma animasyonu, 22s döngü, marka renklerinde yıldız tozu zemini, `prefers-reduced-motion` destekli). Prototipte "YOUR BRAND. CROWNED." metni YOK, yalnızca taç hareketi | AÇIK | Prototip Next.js koduna hiç entegre edilmedi, hiçbir sayfa kullanmıyor. Nereye konacağı (ana sayfa hero'su mu, ayrı bölüm mü) netleşmeden implementasyon başlamadı |

**Renk notu:** "IT'S YOUR STORY..." görseli kırmızı/mavi içeriyor,
marka paletinde (siyah/beyaz/fuşya/sarı) yok. Müşteriden geldiği için
renklerine dokunulmadan kullanıldı — bu sayfanın kendi `--mag-mint`,
`--mag-pink`, `--mag-lilac`, `--mag-paper` pastel bölüm renkleri zaten
sıkı marka paletinin dışında, precedent var. "PURE. SIMPLE. POWERFUL."
ve fuşyalı "IMPACT" sürümü zaten tam marka renklerinde.

**Teknik not:** "FROM IDEA TO IMPACT..." görselinin "siyah" zemini
aslında tam siyah değildi (~rgb(4,10,24)) — sayfanın gerçek siyahıyla
(#000000) yan yana geldiğinde hafif bir kare çerçeve görünüyordu.
Görselin koyu dolgusu sharp ile piksel bazında saf siyaha çekildi
(metne dokunulmadan); dosya kullanılmasa da düzeltilmiş haliyle
diskte duruyor.

**Aynı gün geri alma (1. tur):** Kullanıcı sayfayı canlı gördükten
sonra "PURE. SIMPLE. POWERFUL." ve fuşyalı "IMPACT" bölümlerinin
"sayfa akışında alakasız durduğunu" belirtti — yalnızca
"IT'S YOUR STORY..." korundu. Aynı geri bildirimde hero başlığındaki
"THINK" / "& THANK" arasının aşırı ayrık göründüğü de belirtildi:
`.heroTitle`'daki `justify-content: space-between` iki kelimeyi
konteynerin zıt kenarlarına itiyordu (geniş ekranda büyük bir boş orta
alan). `flex-start` + daha dar bir `gap` ile tek bir başlık bloğu gibi
okunacak şekilde düzeltildi.

**Aynı gün geri alma (2. tur):** Kullanıcı bir sonraki mesajında yanlış
görseli işaret ettiğini belirtti — asıl kalması gereken
"PURE. SIMPLE. POWERFUL." imiş. `.statementStory`/`statementVisualStory`
sınıfları `.statementPure`/`.statementVisualPure`'a çevrildi (sarı
zemin, `--color-text-on-yellow`); "IT'S YOUR STORY..." kaldırıldı.
Üçü de (story, pure, impact) `site-images.ts`'te ve diskte duruyor,
hiçbiri silinmedi.

## 9 Eylül 2026 — Contact haritası: CSS boyamadan gerçek vektör haritaya

**1. tur (aynı gün, geçersiz):** Kullanıcı isteği Google Maps'in
varsayılan açık gri/bej paletini "sarı-siyah-koyu gri, cool" bir
temaya çekmekti. CSS `filter` + `mix-blend-mode: color` katmanıyla
Google iframe'i koyulaştırıp sarıya boyayan bir çözüm uygulandı
(bkz. git geçmişi, commit b9f008b) — anahtar/bağımlılık gerektirmediği
için o an için doğru varsayılan seçildi.

**2. tur (aynı gün, kalıcı):** Kullanıcı gerçek bir referans verdi
(21st.dev/@mapcn/components/mapcn-marker-tooltip — MapLibre GL +
CARTO'nun ücretsiz "dark-matter" vektör stili) ve "yollar sarı olacak"
dedi. CSS filtre/blend yaklaşımı bunu **gerçekten** karşılayamıyordu:
Google'ın iframe içeriği üçüncü taraf, gerçek yol RENGİ (yalnızca
parlaklık/ton değil) CSS'ten kontrol edilemiyor — üstelik o zeminde
yollar zaten mavi-gri tondaydı, filtre onları sarıya çeviremiyordu,
sadece koyulaştırabiliyordu. Gerçek renk kontrolü ancak vektör-karo
render motoruyla mümkün.

| # | Konu | Karar | Durum | Etki |
|---|---|---|---|---|
| 29 | Contact haritası sağlayıcısı | Google Maps sorgu gömmesi → **MapLibre GL JS + CARTO'nun anahtarsız "dark-matter" vektör karoları**. Madde 168'deki "Harita sağlayıcısı" kararı bu maddeyle **AÇILDI ve GÜNCELLENDİ** | KAPANDI | Yeni bağımlılık: `maplibre-gl` (~270KB, ölçüldü — bkz. not). `ContactMap.tsx` tamamen yeniden yazıldı (iframe → MapLibre `Map` + `Marker`). `contact.ts`: `mapEmbedUrl()` kaldırıldı, `CONTACT_LOCATION` (lat/lng) eklendi |
| 30 | Yeni müşteri grubu (FRD-03) yayın izni | Deck'in kendi notu *"[KARAR] Bu markaların adlarının ve logolarının referans olarak yayınlanması için sözleşmelerde izin olup olmadığı kontrol edilmeli"* → **izin doğrulandı**, `newClients` grubu (Koç Finans, Altus, Grundig, Oliz, Whirlpool, Hotpoint, Ariston, Leisure, Hitachi, Ödero, Tokenflex, WAT Motor, WAT Mobilite, Tatil Plus, Ticari Liderlik Programı) referans olarak yayınlanabilir | KAPANDI | `src/data/clients.ts`: `SHOW_NEW_CLIENTS` `false → true`. `docs/content/CURRENT_CONTENT_GAPS.md` #7 ve `docs/visual-audit/NEXT_UI_ART_DIRECTION_TASKS.md` (blocker listesi + F-3) bu kararla tutarlı hale getirildi |

**Neden bu, madde 168'in itirazlarını ihlal etmiyor:**
- **Anahtar yok:** CARTO'nun temel haritası (`tiles.basemaps.cartocdn.com`)
  anahtarsız, atıflı kullanım için herkese açık. Google Maps JS API'nin
  `styles` ile boyama seçeneği anahtar+faturalandırma isterdi — o hâlâ
  elenmiş durumda.
- **Mapbox'a bağımlılık yok:** MapLibre GL JS, Mapbox GL'in anahtar/lisans
  gerektirmeyen açık kaynak çatalı. "Mapbox GL" adıyla madde 168'de
  elenen proprietary kütüphaneye hiç dokunulmadı.
- **Performans bütçesi itirazı GEÇERSİZ KILINMADI, ödendi:** Madde
  168'in "ek JS ağırlığı performans bütçesini zorlar" tespiti hâlâ
  doğru — MapLibre gerçek bir bağımlılık. Bu artık kabul edilen bir
  bedel, yok sayılan bir risk değil. Ölçüldü: `/contact` sayfası
  269KB kendi + 383KB toplam First Load JS (önceki: yalnızca paylaşılan
  ~103KB). Sitenin "ilk yükleme < 2MB" bütçesinin çok altında kalıyor
  ama en ağır sayfa bu oldu.
- **Koordinat uydurulmadı:** Adresteki "Ebru Sokak" ifadesi Photon
  (OSM tabanlı, anahtarsız geocoder) ile gerçek bir OSM sokak
  geometrisi olarak bulundu, Nominatim ile bağımsız ters-geocode
  edilerek doğrulandı (aynı adres, posta kodu dahil geri döndü).
  Bina numarası OSM'de etiketli değil — nokta sokağın ortasında,
  tam kapı numarasında değil. Yayın öncesi müşteriden gözle onay
  istenmeli.

**Sarı yol boyama nasıl yapıldı:** CARTO'nun `dark-matter-gl-style`
JSON'u indirilip gerçek katman kimlikleri okundu (uydurulmadı).
Ana yol katmanları (`road_mot_fill_noramp`, `road_trunk_fill_noramp`,
`road_pri_fill_noramp`, `bridge_mot_fill`, `bridge_trunk_fill`) tam
marka sarısına (`#fffc00`), ikincil yollar aynı sarının düşük
opaklıklı hâline boyanıyor — tek renk ailesinde hiyerarşi. Yol
kenarlıkları, bağlantı yolları ve tünel katmanları bilerek
dokunulmadı (derinlik/okunabilirlik için).

**Kök neden bulunan gerçek bug — worker URL:** MapLibre karo
ayrıştırmasını kendi Web Worker'ında yapar ve varsayılan olarak
worker script'inin konumunu `import.meta.url`'den türetir. Next.js'in
webpack paketleyicisi kütüphaneyi kendi hash'li chunk'ına gömdüğü
için bu türetme kırılıyordu: worker hiç başlamıyordu, HİÇBİR HATA
FIRLATMADAN sessizce takılıyordu — style/sprite/tiles.json normal
yükleniyordu ama tek bir `.mvt` karo isteği bile çıkmıyordu, harita
saf siyah kalıyordu. İzole bir HTTP test sayfasıyla (gerçek bir statik
sunucu, `file://` değil) doğrulandı, sonra Next.js'e özgü olduğu
kanıtlandı. Çözüm: `node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs`
(+ bağımlı olduğu `maplibre-gl-shared.mjs`) `public/`'e kopyalanıp
`maplibregl.setWorkerUrl()` ile sabit bir URL'e bağlandı.

**Bilinen sınır:** CARTO'nun temel haritası anahtarsız/ücretsiz
kullanım için sunuluyor; yoğun trafik CARTO'nun kendi kullanım
koşullarına tabi. Attribution ("© CARTO, © OpenStreetMap
contributors") kaldırılamaz, ToS gereği.

Doğrulama: tsc temiz, 154 unit, 165/168 e2e (a11y dahil — 3 kalan
başarısızlık bu değişiklikten bağımsız, aşağıda not düşüldü),
masaüstü + mobil ekran görüntüsü, gerçek üretim build'inde sıfır
konsol/sayfa hatası.

**Not — e2e'deki 3 ilgisiz başarısızlık:** Bu değişiklikle aynı anda
çalışan başka bir oturum (Codex) kod tabanında geniş kapsamlı bir
"Hibrid 360" marka yazımı + tipografik tırnak düzeltmesi yapıyordu.
İki test bundan önce de (bu değişiklikten habersiz, git HEAD'inde
doğrulandı) bozuktu: `mobile-menu.spec.ts` büyük harfli "THINK & THANK"
bekliyor ama `messages/en.json`'daki değer zaten küçük/büyük karışık
"Think & Thank"; `brief-builder.spec.ts` düz tırnaklı bir regex
bekliyor ama gerçek KVKK onay metni büyük harfli ve kesme işaretli.
Üçüncüsü (`revision-layout.spec.ts` ana sayfa metni) o oturumun düz
tırnak → tipografik tırnak geçişinden kaynaklanıyor, henüz
commit'lenmemişti. Üçü de bu PR'ın kapsamı dışında bırakıldı.
---

## 12 Eylül 2026 — MONA: sohbet sahnesi + sarı nokta küresi

Kullanıcı kararı. Bu giriş, ekosistem kararındaki "MONA tasarımı
değiştirilmez" notunun **MONA için yerini alır**; HIBRID hero kararı
aynen geçerlidir.

- MONA video karakteri sayfadan kaldırıldı. Yerine siyah zemin üzerinde
  sarı (`--color-brand-yellow`) noktalardan oluşan, delikli bir küre geldi.
  Noktalar imlece ve MONA konuşurken ses seviyesine tepki verir; ses
  kapalıyken daktilo sürdüğü sürece küre yine "konuşur".
- Düzen: sol kolonda daktilo satırı + fuşya blok imleç, üstünde bulanık
  önceki satır, altında pill seçenekler; sol altta geri, sağ altta dikey
  ses anahtarı, en altta sorulan soru / 28 ilerleme çubuğu.
- Sorular: her cevaptan sonra 3 önerilen soru + "Tüm sorular"; 28 soruluk
  tam liste sahnenin altında kalır (SEO ve erişim için).
- Mobil: küre üst yarıda, konuşma alttan açılan koyu panelde.
- MONA'nın yeni WebGL sahnesi saf WebGL'dir (yeni kütüphane yok), ortak
  sahne kilidini kullanır, ekrandan çıkınca durur; reduced-motion'da tek
  statik kare, WebGL yoksa SVG yedeği gösterilir.
- `MonaVideo` bileşeni, video ve poster varlıkları repoda kalır; sayfada
  kullanılmaz. Silinmeleri ayrıca karara bağlanacak.
- Aynı gün kullanıcı onaylı revizyonlar: noktalar açılışta ekran dışından
  gelip şekli kurar; küre organik, akışkan (curl-noise), ışımalı bir kütleye
  dönüştü ve %10 küçüldü; imleç noktaları mıknatıs gibi çeker. Kütle yaşayan
  bir varlık gibi davranır: tıklanınca irkilir, 4 hızlı tıkta dağılıp
  toplanır (3. tıktaki gizli replik korunur), 20 sn dokunulmazsa uyur, ara
  sıra göz, kalp ve halka şekline girer. Ayrıntı: `docs/MONA-INTERACTION.md`.

Durum: **KAPANDI — kullanıcı planı onayladı.**

## 13 Eylül 2026 — Service Chapter sistemi ve Creative taslağı

Kullanıcı kararları (planlama oturumu, 13 Eylül 2026). 7 servis sayfası
(Creative, Production, Post Production, Digital, Live Broadcast, Cloud TV,
Event Management) ortak bir tasarım diline taşınıyor; ilk uygulama Creative.
Sistem sözleşmesi: `docs/design/SERVICE_CHAPTER_SYSTEM.md`. Design DNA:
`docs/design/service-chapter-dna.json`.

| # | Konu | Karar | Durum | Etki |
|---|---|---|---|---|
| 31 | Creative metin kaynağı | **Brief/deck'e dönüldü (CRE-01..04).** `97f42fa` ile kayıtsız gelen Creative metinleri geri alındı: "PURE. SIMPLE. POWERFUL." (brief'te Production'ın sloganı), "WE DON'T REPLACE CREATIVITY. WE EXPAND IT." (AI sayfası ve What We Believe'e ait), kaynağı bulunamayan kapanış cümleleri ("Hibrid 360 is building that future today." / "Let's build the future of your brand together.") ve global `CtaBand`'i birebir tekrarlayan sayfa içi CTA | KAPANDI | H1 "CREATIVITY WITHOUT LIMITS" (TR'de de İngilizce, `lang="en"`) + `heroSubtitle`; CRE-02 bandı `services.creative.band` galerinin üstünde; CRE-03 10 madde (BRAND CONSULTANCY · CORPORATE IDENTITY · MARKETING PLAN AND STRATEGY · CONCEPT DEVELOPMENT · CONTENT GENERATION · COMMERCIALS · PACKAGING · TV · PRESS · RADIO CAMPAIGNS); CRE-04 galerisi varlık gelene kadar `galleryEmpty` ile dürüst durum satırı. Stok ampul görseli sayfadan kaldırıldı (dosya hub kartında kullanıldığı için diskte kalır). **CRE-02 yazımı:** brief'teki haliyle "Your Brand’s DNA **is** the Ultimate AI Differentiator." (`e2bcf7c`'deki "Is" otomatik denetimden gelmişti, karar kaydı yok) ve bant sloganı olduğu için TR sayfada da İngilizce, `lang="en"` (CLAUDE.md slogan kuralı + bu dosyadaki "Kasıtlı olarak İngilizce kalanlar"); `tr.json`'daki çeviri kaldırıldı |
| 32 | Servis sayfalarında renk rolleri | **Zemin her zaman siyah. Metin beyaz + sarı; ikisinin dengesi kritik. Fuşya yalnızca yardımcı renk.** Kural: sarı = ses (her ekranda tek sarı odak: slogan, anahtar ifade ya da aktif durum); beyaz = anlatım; fuşya = araç (çizgi, seçim çerçevesi, tutamaç, küçük indeks, hover, odak halkası, imleç; asla gövde/başlık metni değil). Tam ekran renk alanı yok | KAPANDI | #7 (toz pembe) SUPERSEDED. `globals.css`'in h1–h3 sarı varsayılanı chapter bileşenlerinde bilinçli olarak ezilir. Kontrast: sarı 19,2:1 · beyaz 21:1 · fuşya 6,7:1 · `--text-muted` 6,2:1 |
| 33 | Service Chapter sistemi | Ortak bileşenler (`src/components/service-chapter/`) + scroll sahneleri için tek `--progress` CSS değişkeni (`useScrollScene`, animasyon kütüphanesi yok). **360° derece sistemi:** `SERVICE_CATALOG` sırasına göre her servis `index × 45°` (Creative 000° … AI Creative Production 315°); her sayfa sıradaki dereceye bağlanır. Her sayfanın tek bir "enstrüman" SVG'si olur (Creative: seçim çerçevesi + pen tool DNA sarmalı) | KAPANDI — Creative taslağı; diğer 6 sayfa rollout aşamasında | `service-page.module.css` ve diğer 6 sayfa bu aşamada değişmez (`e2e/revision-layout.spec.ts:215` Digital'e bağlı). Derece katalog sırasından türetilir, ayrıca saklanmaz |
| 34 | Yeni arayüz metinleri | `video.play` "Play film" / "Filmi oynat" · `video.pause` "Pause film" / "Filmi duraklat" · `services.chapter.servicesTitle` "Services" / "Hizmetler" · `services.chapter.next` "Next" / "Sıradaki" | KAPANDI | Mevcut anahtarlar yeniden kullanılır: `video.aiGenerated`, `common.pendingLabel`, `nav.work`, `whatWeDo.heroTitle`, `whatWeDo.list` |
| 35 | Servis filmleri | Creative için iki film üretildi: **Mirror-Ball Mind** (kafası disko topu olan figür, 16:9) ve **Sequin Tide** (pul yüzeyde dalga, 21:9). Brief Bölüm 9'daki Hibrid 360 referansından (pullu doku + disko topu kafalı figür) türetildi. Higgsfield üzerinden Seedance 2.5 ile üretilir, sessizdir (`generate_audio: false`) ve `video.aiGenerated` etiketi filmin altında gösterilir | KAPANDI (revize edildi — bkz. #36) | Konuşmasız, sessiz dekoratif döngüler için altyazı istisnası: CLAUDE.md'deki "altyazı her video/replikte zorunlu" kuralı konuşma ya da ses içeren videolar içindir. Film yokken sayfa eksiksiz çalışır (bölüm render edilmez ya da poster gösterilir). **Üretim (13 Eyl):** key frame'ler Cinema Studio Image 2.5 ile; kullanıcı Mirror-Ball için dümdüz siyah zeminli varyantı, Sequin için çapraz fuşya/sarı pul bandını seçti. Hareket revizyonu (kullanıcı): Mirror-Ball "figür canlansın", Sequin "el dokunuşu dalgası" — ilk Sequin denemesinde model görünür bir el çizdiği için prompt'tan el/parmak ifadeleri çıkarıldı. Mirror-Ball'da başlangıç+bitiş karesi birlikte verilince model başı hareket ettirmedi; yalnız başlangıç karesiyle üretilip döngü noktası 0,75 sn çapraz geçişle birleştirildi (Sequin'de de aynı birleştirme). Kullanıcı kararı: bu aşamada 720p yeterli, 1080p final sonraya. **Alt metinler:** Mirror-Ball TR "Kafası aynalı bir disko topu olan, siyah takım elbiseli bir figür; karanlığa fuşya ve sarı ışık zerreleri saçıyor" / EN "A figure in a black suit whose head is a mirrored disco ball, scattering magenta and yellow light flecks into the dark" · Sequin TR "Siyah pulların makro görüntüsü; çapraz bir bantta fuşya ve sarı parıltılar" / EN "Macro view of black sequins with a diagonal band of magenta and yellow glints" |
| 36 | İkinci tur geri bildirim (video/çerçeve/dizin) | **Sayfa başına tek video:** Mirror-Ball Mind kaldırıldı ("pullu video güzel, disko toplu kafa videosunu kaldıralım"); Sequin Tide artık S2'nin (film penceresi/zirve) tek filmi, S6 filmsiz kaldı. Sonraki 6 sayfada her sayfa **konuyla alakalı** tek film kullanacak (Production=vizör, Post=timeline, Live=tally, Cloud TV=kanal şeridi, Event=sahne planı, Digital=imleç/piksel). **Fuşya seçim çerçevesi:** masaüstünde statik çerçeve + WITHOUT LIMITS'in taşması "hata gibi duruyordu" — çerçeve kenarları ve tutamaçlar artık sürekli hafifçe nefes alıyor (opacity döngüsü, `transform`'a dokunmuyor), taşan satırın altına kesikli fuşya bir çizgi eklendi (aynı araç sistemine bağlı olduğunu gösteriyor). **Hizmet dizini (S4):** akan dev kelimeler düzeni "karışık" bulundu (uzun bir kalem ikinci satıra taştığında komşu kalemle birleşiyordu) → dikey, tek sütunlu liste (STRV/portföy referansı): her kalem kendi satırında, solda küçük fuşya numara, hover/scroll-odak sarı, diğerleri sönük | KAPANDI | Değişen dosyalar: `src/data/service-films.ts` (mirrorBall→null), `page.tsx`, `CreativeTitle.{tsx,css}`, `ChapterIndex.{tsx,css}`, `docs/design/SERVICE_CHAPTER_SYSTEM.md` §7/§8/§11. Mirror-Ball dosyaları diskte kalır (`public/videos/services/creative/mirror-ball-mind-*`), ileride başka bir sayfada (AI Creative Production?) değerlendirilebilir |
| 37 | Görüntüleme fontu | Büyük tipografik anlar (h1, hizmet dizini, manifesto, DNA sloganı, "sıradaki servis") için **Space Grotesk 700** (Google Fonts, ücretsiz) — Montserrat'a göre belirgin karakter farkı ama mevcut kırılım noktalarını bozmuyor (aday karşılaştırması: Bricolage Grotesque çok yakın duruyordu, Unbounded WITHOUT LIMITS'i 2 satıra kırıyordu). Gövde fontu (Inter) ve küçük UI metni (etiket, eyebrow, nav) Montserrat'ta kalıyor — marka kilidi (CLAUDE.md "sabit — değiştirilmez") yalnız bu iki fontu kapsıyor, Service Chapter'ın büyük tipografisi ayrı bir katman. Kapsam Service Chapter sistemiyle sınırlı, site geneli değil | KAPANDI | `public/fonts/space-grotesk-700-latin-tr.woff2` (10.7KB, 275 glif) — variable kaynak (github.com/google/fonts) `fontTools.varLib.instancer` ile 700'e sabitlendi, sonra Montserrat/Inter ile aynı Latin+TR alt kümesiyle kesildi. CLS-güvenli yedek yüz `Space Grotesk Fallback` (Arial, ascent-override 76.74%, descent-override 22.77%, size-adjust 128.23% — gerçek OS/2 + hhea metriklerinden hesaplandı). Token'lar: `--font-chapter-display`, `--font-weight-chapter-display: 700` (tokens.css). Ölçülmüş genişlikler (em, Space Grotesk 700): CREATIVITY 5.346 · WITHOUT LIMITS 7.700 · MANAGEMENT 6.724 — hepsi Montserrat 800'den dar, taşma oranı (WITHOUT LIMITS/CREATIVITY ≈ 1.44) korundu. LCP font preload'ı (`page.tsx`) Montserrat'tan Space Grotesk'e çevrildi |
| 38 | S1 seçim çerçevesi — interaktif | **#36'daki "nefes alan statik çerçeve + kesikli ray" tamamen yerini aldı.** Kullanıcı: "bunu hala çözememişiz... interektif olsun, mause hangi kelimenin üzerindeyse onun üstüne gelsin ve boyutunu ayarlasın: CREATIVITY üzerindeyken onun üstünde, WITHOUT üzerindeyken onun üstünde, LIMITS üzerine geldiğimizde onun üstüne gelsin." Çerçeve artık JS ile ölçülen, `H1`'in doğrudan çocuğu olan mutlak konumlu tek bir `<span>`; imlecin üzerindeki kelimeye (`translate`+`width`/`height`) kayıp o kelimenin ölçüsüne (+pay) oturuyor. Varsayılan/yükleme durumu CREATIVITY. Taşan-metin portu ("+") ve alttaki kesikli ray kavramsal olarak anlamsızlaştığı için kaldırıldı — kutu artık her zaman sardığı kelimeye tam oturduğundan "taşma" kalmadı | KAPANDI | Yalnız gerçek imleçli cihazlarda (`hover:hover`+`pointer:fine`) etkin; dokunmatikte çerçeve sabit CREATIVITY'de kalır (zorunlu içerik hover'a bağlı değil). Reduced motion'da konum/boyut geçişi anlık (`transition: opacity 1ms`) — kullanıcının kendi imleç hareketiyle tetiklenen işlevsel bir durum değişikliği olduğu için tamamen gizlenmiyor, yalnız sıçrama animasyonu kapanıyor. Yeni dosya `word-box.ts` (+test): pay hesaplaması saf fonksiyon. `CreativeTitle.tsx` client component'e çevrildi (`getBoundingClientRect` ölçümü, `useLayoutEffect` + `document.fonts.ready` yeniden ölçüm). Yeni e2e: "başlıktaki seçim çerçevesi imlecin üzerindeki kelimeye kayar" |
| 39 | S2 film penceresi kaldırıldı | Kullanıcı: "videoyu şimdilik kaldıralım. belki her sayfaya video eklemeyiz." #36'daki "sayfa başına tek video" kuralı **iptal edilmedi, yalnızca zorunluluğu kaldırıldı** — her sayfanın mutlaka bir filmi olması gerekmiyor, karar sayfa bazında verilecek | KAPANDI | `ChapterFilm` bileşeni ve Sequin Tide verisi (`src/data/service-films.ts`) yerinde duruyor, yalnız Creative'in `page.tsx`'inde artık render edilmiyor (`ChapterFilm` importu, JSX'i, `videoObjectJsonLd` ve `films` dizisi kaldırıldı) — dönerse tek satır. Video'ya bağlı 3 e2e testi `test.skip` ile işaretlendi, video-bağımsız reduced-motion testi (sahneler statik) korundu |
| 40 | MonaField — sayfa geneli MONA parçacıkları | Kullanıcı: "sayfaların hepsinde mona'nın bir kısmını görelim... CREATIVITY sayfası özelinde beyin şeklini alabilir, sanki nöronlar ateşleniyormuş gibi bir hissiyat olabilir, kendi içinde hareketine devam edebilir, üzerine tıklayınca tepki vermeli, yine aynı monodaki mekanikler geçerli. sayfanın her yerine mona partikülleri dolaşmalı, imleç bir partikülün yanından geçerse partiküller toplanıp onu bir süre takip etmeli." Karar: MONA'nın tam ekran WebGL sahnesinden (yalnız AI Creative Production'a özel, ~19.000 parçacık + shader) tamamen ayrı, hafif bir **Canvas 2D** katmanı — CLAUDE.md'nin "aynı anda en fazla bir WebGL sahnesi" bütçesine hiç dokunmuyor (WebGL bile değil), o sahneyle asla aynı anda çalışmaz. Sayfaya özel bir siluet (Creative: beyin — iki lob + dar bir fissür, ~70 nokta, birkaç sinüs harmoniğiyle "kıvrımlı" kenar) MONA'nın kendi irkilme yayıyla **aynı sabitlerle** (`SPRING_K=180, SPRING_C=14`, `mona-creature.ts`) evine bağlı; ayrıca tüm görünür alanda yavaşça gezinen ~34 ambient nokta. İmleç bir parçacığa yaklaşınca (yakalama yarıçapı) parçacık ~1,6 sn boyunca imleci izler, sonra türüne göre evine (shape) ya da gezinmeye (roam) döner. Tık, yakındaki parçacıklara dışa doğru bir itki + parlama veriyor (MONA'nın tık irkilmesiyle aynı ruh). Birkaç saniyede bir yakın iki "shape" parçacığı arasında kısa bir fuşya çizgi yanıp sönüyor ("nöron ateşleme" hissi) | **SUPERSEDED — bkz. #43.** Kullanıcı ekran görüntüsüyle reddetti: "bu ne? ben böyle bir şey tarif etmedim" — dağınık, rastgele noktalardan oluşan soyut bir küme, MONA'nın gerçek görüntü diliyle (renk, ışıma, doku) hiçbir ilgisi yoktu | `position: sticky` + `height:0` hilesi: `<canvas>` görünür alanı dolduruyor ("sayfanın her yerine dolaşmalı") ama `<article>` bitince (sarı CtaBand/Footer öncesi) doğal olarak sahneden çıkıyor — `ChapterFilm`'in sticky sahnesiyle aynı, zaten doğrulanmış desen. Canvas her zaman `pointer-events:none`; imleç/tık konumu `window` seviyesinde dinlenir, hiçbir tıklama/hover davranışını etkilemez (satırın tamamı tıklanır e2e testi ve axe denetimi bununla birlikte yeşil kaldı). Reduced motion'da **hiç render edilmiyor** (MONA'nın ana sahnesinin aksine — bu tamamen dekoratif, donuk bir nokta bulutunun tek başına anlamı yok). Dosyalar (`src/lib/mona-field.ts`, `src/components/mona/MonaField.{tsx,css}`) #43 ile silindi |
| 41 | S4 hizmet dizini — hover'da büyüme | Kullanıcı (photoshop taslağıyla): "burada üzerine geldiğimiz zaman büyüyeceği bir yapı kuralım. mevcut yazı efekti gayet güzel sadece büyüsün. büyüyünce diğer alttaki ve üstteler anlık olarak yer açacak." Mevcut sönükleştirme efekti (#36) korunarak hover'daki (masaüstü) / aktif (dokunmatik spot) kalemin punto boyutu tek bir `--grow` CSS değişkeniyle (1 → 1,8) büyüyor — kelime ve fuşya sıra numarası orantılı büyüyor | KAPANDI | `ChapterIndex.module.css`: `.item` normal akışta olduğu için `.word` büyüyünce satırın kendi yüksekliği artıyor, komşu kalemler doğal olarak yer açıyor — ekstra bir yerleşim mantığı gerekmedi |
| 42 | S4 yanına ikinci enstrüman çizimi | Kullanıcı (photoshop taslağıyla): "sayfaya DNA çizimi gibi farklı çizimler de ekleyelim. Hizmetlerin yanındaki boşluğa eklenebilir." Hizmet dizininin (S4) yanına, yalnızca ≥1024px'te görünen ikinci bir pen-tool çizimi eklendi: tek akan bezier şerit, dört anchor, ortadaki anchor'da bir tutamaç çifti — DnaHelix (S5) ile aynı gramer (beyaz sanat eseri, fuşya araç arayüzü), scroll'la yukarıdan aşağı açılıyor | KAPANDI | Yeni dosyalar: `CreativeSketch.{tsx,css}`. `ChapterIndex`'e yeni `aside?: ReactNode` prop'u + iki sütunlu grid (`--layout`); `aside` verilmezse (diğer 6 sayfa için varsayılan) liste tek sütun tam genişlik kaplamaya devam ediyor |
| 43 | MonaShard — #40'ın YERİNE (yeniden tasarım) | #40 reddedildi (yukarı bkz.). Kullanıcı referans görsel gönderdi ve düzeltti: "Monanın yarısını görücez... Monadaki hareket animasyon mekanikleri devam edecek bu sayfalarda da" — yeni icat edilmiş bir şekil değil, **MONA'nın gerçek küresinin bir parçası**, AI Creative Production sayfasındaki AYNI motor ve mekaniklerle. Ayrıca: "tamam beyin yapma ben sonra ilgilenicem onlarla" — sayfaya özel siluet biçimlendirme (beyin vb.) bu turda kapsam dışı, MONA kendi doğal formunda kalıyor. Karar: `createMonaDotsScene`/`mona-creature.ts`'i (MONA'nın kendi WebGL motoru — Canvas 2D DEĞİL) hiç değiştirmeden, yalnızca YENİ bir yerleşim fonksiyonuyla (`monaShardLayout`) yeniden kullanan `MonaShard` bileşeni: küçük, sabit boyutlu bir kapta kürenin gerçek merkezi kabın sağ-üst köşesinin hemen dışına düşer (`centerX:1, centerY:0`, yarıçap kabın küçük kenarının %72'si) — noktaların yaklaşık yarısı kabın içine taşar, geri kalanı GPU tarafından doğal olarak kırpılır (ek CSS/crop hilesi gerekmez). Daha küçük bulut (~4.600 nokta, tam sahnenin ~4'te 1'i — bu bir sayfa dekoru, sohbetin kendisi değil). Sohbete özel girdiler (yazma nabzı, ses seviyesi) yok, `speaking` her zaman 0; geri kalan her şey (açılış, irkilme, uyku, kaçış, göz/kalp/halka, imleç mıknatısı) MONA'nın kendisiyle birebir aynı — `ChapterHero`'nun yeni `mona?: ReactNode` prop'u ile hero'nun sağ üst köşesine yerleşiyor | KAPANDI | **Paylaşılan kod:** `tokenRgb` (`MonaDots.tsx`'ten `mona-dots-scene.ts`'e taşındı, ikisi de kullanıyor); `createMonaDotsScene`'e geriye uyumlu 4. parametre (`computeLayout`, varsayılan `monaDotsLayout`) eklendi. **Bulunan grid hatası:** `.mona`'yı `grid-column:1` ile açıkça yerleştirmek, aynı hücreyi paylaşan `.title`'ın (grid-column'u `auto`'ydu) örtük bir ikinci kolona kaymasına yol açtı — `.hero` yorumundaki 320px hatasıyla AYNI mekanizma, farklı tetikleyici; düzeltme `.meta`/`.title`/`.lede`'ye de açık `grid-column:1` eklemek. **Bulunan etkileşim hatası:** `.mona`'ya önce güvenlik için konan `pointer-events:none`, MONA'nın kendi imleç mıknatısını ve tık tepkisini tamamen devre dışı bırakıyordu (görsel "tepki" idle nefes alma animasyonundan ibaretti) — 4 hızlı tıkla doğrulanan kaçış deseni sonrası kaldırıldı; `CREATIVITY` kelimesinin gerçek harfleri bu köşeye hiç ulaşmadığı ölçüldü (kelime x≤810px, MONA x≥983px, 1440px genişlikte), seçim çerçevesi e2e testi MONA etkileşimliyken de yeşil. Reduced motion'da MONA'nın kendi sayfasıyla aynı davranış: tek statik kare (MonaField'in aksine tamamen gizlenmiyor). Yeni dosyalar: `src/components/mona/MonaShard.{tsx,css}`, `src/lib/mona-dots-scene.test.ts` (+3 test: `monaShardLayout`) |
| 44 | S1 seçim çerçevesi — pay küçültüldü | Kullanıcı çizerek karşılaştırdı: "buradaki pembe kutucuk. sana ilettiğim yeşil kutucuk boyutunda olsun" — çerçeve kelimenin etrafında gereğinden fazla boşluk bırakıyordu | KAPANDI | `word-box.ts`: `PAD_RATIO` 0.08 → 0.03. `frameBox` testindeki sabit beklenti değerleri yeni orana göre güncellendi |
| 45 | MonaShard büyütüldü + MonaDrift (sayfa geneli ambient noktalar) | Kullanıcı çizerek gösterdi: "Mona'nın noktaları köşede sıkışmasın... maskesiz olsun ve sayfanın sağdan 4/1'ini kaplasın. Tüm sayfada mona'nın noktacıklarına benzer noktalar özgürce dolaşsın." İki ayrı değişiklik: **(a) MonaShard büyütüldü** — kap `min(34vw,26rem)` kareden `min(30vw,32rem)` genişlik × `min(64vh,38rem)` yükseklik dikdörtgenine çıktı (kare değil — `align-self:start` sayesinde yükseklik title'ın ÜSTÜNE doğru büyüyor, lede'ye ulaşmıyor); bulut yoğunluğu aynı oranda kalsın diye ~4.600 → ~7.040 noktaya çıkarıldı. **(b) MonaDrift** — MonaShard'dan bağımsız, YENİ ve daha sade bir katman: MONA'nın yay fiziği/tık tepkisi mekaniğini TAŞIMAZ, yalnızca aynı sarı/ışıma diliyle eşleşen noktaların düz sürüklenme + kenardan sarmayla (`mona-drift.ts`) tüm sayfada gezinmesi. Kasıtlı olarak WebGL değil, tamamen `pointer-events:none` (MonaShard'ın aksine etkileşimsiz — yalnızca doku) | KAPANDI | Yeni dosyalar: `src/lib/mona-drift.ts` (+10 test: yay fiziği yok, düz hız×dt hareketi, kenar sarma, mutasyonsuzluk), `src/components/mona/MonaDrift.{tsx,css}`. `MonaField`'in (#40, SUPERSEDED) sticky+`height:0` yerleşim hilesi burada yeniden kullanıldı — bu kez doğru renk/dokuyla. `ChapterHero.module.css` `.mona` boyut yorumu güncellendi |
| 46 | S4 yanındaki çizim — Hibrid taşının kristali | Kullanıcı: "burada bozuk bir şekil var bu şekli istemiyorum... hibrid taşının kristalinin pentool çizimi görelim. kendi etrafında dönsün" — sonra tam köşe/kenar referansını ayrı bir görselle gönderdi (18 köşe, ~37 kenar, aynı beyaz-çizgi/fuşya-kare-anchor grameri). Önceki tek-eğri `CreativeSketch` tamamen kaldırıldı; yerine referanstaki köşe/kenar verisi sayısallaştırılarak yeniden çizildi (`public/videos/hibrid-stone-poster.webp`'teki gerçek 3B taşın 2B tel kafes izdüşümü — bkz. `src/data/solar-system.ts` `CRYSTAL_MEDIA`). Gerçek 3B döndürme yerine (taş zaten kendi video döngüsünde dönüyor) düz bir CSS `rotate` (22s, linear, infinite) ile "kendi etrafında dönüyor" hissi veriliyor | SUPERSEDED — bkz. #48 (kristal kaldırıldı, yerine görsel alanı) | `CreativeSketch.tsx` içeriği tamamen değişti (scroll-ile-çizilen tek bezier yerine baştan tam çizili, sürekli dönen çokgen tel kafes); `ChapterIndex`'in `aside` prop sözleşmesi değişmedi. Reduced motion'da dönüş durur, giriş büyümesi/belirmesi (`--enter`) final durumuna atlar |
| 47 | Beşinci tur: MONA konumu/açılışı, çerçeve kaldırıldı, lede sola | Kullanıcı (referans görsel + iki kırpılmış ekran görüntüsüyle): "şu an mona başlarken bir maske içinde gibi. mona açıldığında bu sayfada da sayfanın her yerinden noktalar uçuşsun, aynı mona sayfasında olduğu gibi monayı oluştursun. monanın olduğu sayfadaki monadan farklı bir mona olacak — görünüm ve animasyon aynı, ama sürekli şekil değiştirmeyecek, doğal ve organik olsun... fuşya kutucuğu kaldıralım (oraya daha sonra farklı bir animasyon bakıcaz)... Every idea begins... yazısını sayfanın soluna, CREATIVITY WITHOUT LIMITS'in altına al... mona sağ altta olmalı, büyük bir şekilde." **(a) MonaShard kabı hero'nun TAMAMI** (`inset:0`): önceki kutu, halo/toz noktalarını kutunun sol ve üst kenarında düz çizgiyle kesiyor ve açılışta noktaları kutu kenarından uçuruyordu ("maske" hissi). Artık noktalar yalnızca sayfanın kendi kenarlarında kesiliyor ve açılışta hero'nun kenarlarından geliyor. `monaShardLayout`: merkez hero'nun sağ kenarında (`centerX:1`), alt kısmında (`centerY:0.72`), yarıçap kısa kenarın `0.55`'i — sol yarısı sayfaya bakan büyük bir hilal. Bulut MONA'nın kendi varsayılanı (~19.000 nokta): `u_pointSize` yarıçapla ölçeklendiği için aynı bulut büyük yarıçapta da MONA sayfasıyla aynı yoğunlukta görünüyor. **(b) Farklı MONA:** göz/kalp/halka biçim döngüsü bastırıldı (`shapeEye/Heart/Ring` shader'a hep 0), her zaman organik blob. **(c) Seçim çerçevesi (#38, #44) tamamen kaldırıldı** — `CreativeTitle` statik sunucu bileşenine döndü, `word-box.ts`/testi ve e2e çerçeve testi silindi. **(d) Lede** sağa yaslı değil, başlığın altında solda | KAPANDI | **Bulunan hata:** opak WebGL canvas (`alpha:false`) konumlandırılmış eleman olarak başlığın üstünde boyanıyor, CREATIVITY'nin "Y"sini örtüyordu (WITHOUT LIMITS animasyonlu olduğu için ayrı yığın bağlamında kalıp görünüyordu) — `.meta/.title/.lede` `position:relative; z-index:1`. `.mona` artık `pointer-events:none` (hiçbir linki/metin seçimini engellemiyor); MonaShard imleci ve tıkı `window`'dan dinleyip canvas koordinatına çeviriyor, canvas dışındaysa "ayrıldı" sayıyor. **Bilinen, önceden var olan sorun:** çerez bandı ekrandayken WebGL canvas'ının ÜST kenarında bant yüksekliğinde (~70px) beyaz bir şerit görünüyor — bant canvas'ın altını örtüyor, Chromium kompozitörü örtülen bölgeyi (WebGL'in alt-sol orijini yüzünden) ters eksende üste uyguluyor. Çerezler kabul edilince kaybolur; değiştirilmemiş MONA sayfasında da AYNI şekilde var (bu işten önce de vardı). Yalnız otomatik Chromium ekran görüntülerinde (headless + headed, SwiftShader) doğrulandı; gerçek GPU'lu tarayıcıda görünüp görünmediği kullanıcıdan teyit bekliyor — görünüyorsa ayrı iş (ortak `createMonaDotsScene`'e dokunur) |
| 48 | Altıncı tur: kesilme, nilüfer, görsel alanı, footer | Kullanıcı (ekran görüntüleri, çizim ve nilüfer referans görseliyle): "burada bir kesilme var. bu kesilme olmasın... [kristal] şekli kaldır, beğenmedim... bir görsel alanı eklememiz lazım [21st.dev parallax-scroll-feature-section promptu]... hizmetler bölümündeki boşluğa... bu sayfadaki mona %10 daha küçük olsun ve arada bir bu şekli alsın [nilüfer]... monanın partikülleri footer alanında olmasın." Plan onaylandı ("başla bakalım"); görsel için "disko toplu görseli ekleyebilirsin... daha sonradan değiştiririz", çiçek anında MONA'nın sola kayması onaylandı. **(a) Kesilme:** küre hero'nun alt kenarından taşıyor, canvas hero'yla bittiği için sayfa kayınca düz çizgiyle kesiliyordu. MonaShard kökü hero'nun altına `SHARD_BLEED = 0.7` (hero yüksekliği oranı) kadar uzuyor; `monaShardLayout` oranları canvas'a değil hero'ya göre hesaplıyor. Canvas'ın en alt %20'si yalnız seyrek hale/toz uçlarını söndürüyor (gövde o bölgeye inmiyor — birim testte). Uzantı alttaki manifesto bölümüne biniyor: `ScrollLitText .lit` `position:relative` aldı, yoksa opak canvas metnin üstüne boyanırdı (yalnız tam yanmış kelimeler kaybolurdu, çünkü <1 opaklık kendi katmanını açıyor). **(b) %10 küçük:** yarıçap kısa kenarın 0,55'i → 0,495'i. **(c) Nilüfer:** referans görsel (`docs/design/references/mona-lotus-reference.webp`) `scripts/generate-mona-lotus.mjs` ile 128×128 yoğunluk haritasına çevrildi (`src/lib/mona-lotus-density.ts`). Çiçeği MONA'nın kendi noktaları oluşturuyor: kabuk haritayı olduğu gibi izleyip yaprak kenarlarını çiziyor, çekirdek yumuşatılmış haritadan yaprak içlerini dolduruyor (`lotusTargets`). Ortak motora 4. şekil (`a_lotus`, `u_shape.w`) ve bütün kütlenin kayması (`u_shift`, perspektiften sonra — yoksa küre derinliğe göre çarpılıyordu) eklendi; bulutta nilüfer yoksa öznitelik sabit 0, MONA sayfası şekli hiç kullanmıyor (mona.spec 12/12). Program (`mona-lotus.ts`): ilk çiçek sahne başladıktan 12–15 sn sonra, sonrakiler başlangıçtan başlangıca 30–45 sn; 2,6 sn açılır, 5,5 sn açık kalır, 2,6 sn kapanır. Çiçek anında kütle `LOTUS_OFFSET` (−0,95, +0,35 yarıçap) kadar sola/yukarı kayar ki sayfa kenarında yarım kalmasın; çiçek MONA'yı uyandırır; hafif rüzgâr salınımı ve yaprak nefesi var. Akıntı titreşimi (~15 px) ince yaprak kenarlarını dağıttığı için çiçekte dörtte birine indi. Hareket azaltmada çiçek yok. `data-lotus` (closed/moving/open) e2e için. **(d) Kristal (#46) kaldırıldı, yerine görsel alanı:** `src/components/ui/ParallaxScrollFeature.tsx`, framer-motion 13.2.0 ile prompttaki efekt (clip-path perde + opaklık ilerlemenin ilk %70'inde, y −50→0). Prompttan farklar: Tailwind/shadcn kurulmadı (temel stil sıfırlaması bütün siteyi etkilerdi) → CSS Modules; demo başlığı/lorem/dış CDN görselleri alınmadı; hook'lar döngüde değil (lint); hareket azaltmada ve JS'siz açık; ilerlemenin bitişi `center start` yerine `center center` (hedef artık ekran boyu bölüm değil görselin kendisi — `center start` ile liste okunurken görsel %87 açık kalıyordu). Görsel geçici olarak Mirror-Ball Mind karesi (#35, alt metinler oradan), `video.aiGenerated` etiketiyle. `ChapterIndex` aside'ı ≥1024px'te sayfanın sağ yarısı (liste boyunda kare, `max-height: 42.5rem`), dar ekranda listenin altında. **(e) Footer:** MonaDrift'in ekran boyu canvas'ı makale biterken sarı CtaBand/Footer'ın üstüne çiziyordu → `.chapter { overflow: clip }` (iki eksen; `clip` sticky sahneleri bozmaz) | KAPANDI | Creative rotasının JS'i 59,9 kB, ilk yükleme 193 kB (framer-motion + nilüfer verisi dahil). `package-lock.json`'da framer-motion dışındaki değişiklikler bu işten önce de vardı — commit'e girmemeli. **Test ortamı notu:** uzun süre çalışan `next start` sunucusunda `/_next/image` optimizasyonu bir kez takıldı (Production'ın `production.webp` w=1920 isteği; Next aynı anahtardaki istekleri takılan işe bağladığı için sayfa `networkidle`'a hiç ulaşmadı, a11y testi zaman aşımına düştü). Sunucu yeniden başlatılınca 60/60 geçti; bu işle ilgisiz, yerel ortam tuhaflığı |
| 49 | Yedinci tur: başlık karıştırma/çözülme efekti | Kullanıcı önceki ekran görüntüsüne ("şahane olmuş") tepkiyle referans bir bileşen verdi (`ScrambleText`, karakter karıştırma → gerçek metne çözülme, `requestAnimationFrame` ile): "bu metne bu efekti ver. sayfa yüklendiğinde bu efektle başlasın." CREATIVITY, WITHOUT, LIMITS sayfa açılırken kısa bir gecikmeyle (0/140/260 ms) art arda rastgele karakterlerden gerçek harflerine çözülüyor; kaskad hissi eskiden `.overflow`'un CSS `lineIn` (translateY+opacity) animasyonuyla veriliyordu, o kaldırıldı — iki hareket birlikte (satır kayarken harfler de çözülürken) kalabalık dururdu. Saf karıştırma mantığı `src/lib/scramble-text.ts`'te (`scrambleReveal`, 9 test); döngü `src/hooks/useScrambleReveal.ts`'te (6 test, sahte zamanlayıcı + `requestAnimationFrame`) — ilk render her zaman gerçek kelime (hidrasyon güvenli, SSR'la birebir aynı), animasyon yalnızca mount sonrası `useEffect`'te başlıyor. `CreativeTitle` bu yüzden tekrar istemci bileşeni oldu. Referans bileşenin kendisi WORDS dizisini 2 sn'de bir döngüye sokuyordu (demo amaçlı); burada sabit başlık metni tek seferlik açılış efekti olarak kullanıldı, döngü yok | KAPANDI | **Erişilebilirlik:** `h1` `aria-label="CREATIVITY WITHOUT LIMITS"` ile erişilebilir adı animasyon durumundan bağımsız baştan kilitliyor (ekran okuyucu karışık karakterleri değil doğrudan doğru cümleyi duyuyor); görünen kelime span'leri `aria-hidden`. `prefers-reduced-motion`'da efekt hiç başlamıyor (`active=false`), metin ilk kareden itibaren sabit — yeni e2e testi bunu hem reduced hem normal hareket için doğruluyor (yerleşik son durum, mid-flight karışıklık ayrı unit testte). Route JS 60,2 kB (59,9 kB'den, +0,3 kB) |
