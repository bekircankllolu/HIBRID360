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
| 7 | Creative sayfası zemin rengi | 9 | Toz pembe zemin + siyah başlık + fuşya vurgu (brief'in kendi önerisi) | VARSAYILANLA İLERLE |
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
