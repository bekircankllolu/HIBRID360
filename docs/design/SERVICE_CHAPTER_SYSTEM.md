# Service Chapter sistemi — What We Do servis sayfaları

**Tarih:** 2026-09-13 · **Durum:** Creative taslağı üretimde, diğer 6 sayfa sıradaki aşama
**İlgili:** `docs/design/service-chapter-dna.json` (Design DNA) · `docs/DECISIONS.md` (13 Eylül 2026 bölümü)
**Kapsam:** Creative, Production, Post Production, Digital, Live Broadcast, Cloud TV, Event Management

Bu doküman 7 servis sayfasının paylaşacağı tasarım dilinin sözleşmesidir. Yeni bir servis sayfası kurulurken ya da mevcut bir sayfa bu sisteme taşınırken önce bu dosya okunur.

---

## 1. Tasarım okuması ve kadranlar

> **Okuma:** Bir ajansın servis sayfalarının görsel yenilenmesi (içerik ve bilgi mimarisi korunur). Hedef kitle marka ve pazarlama karar vericileri. Dil: kilitli siyah marka üzerinde Awwwards seviyesinde editoryal, kinetik tipografi. Uygulama: native CSS + tek CSS değişkeniyle sürülen scroll sahneleri + sayfaya özel SVG "enstrümanlar" (animasyon kütüphanesi yok).

| Kadran | Değer | Gerekçe |
|---|---|---|
| DESIGN_VARIANCE | 8 | Ajans, redesign-overhaul, referanslar asimetrik editoryal |
| MOTION_INTENSITY | 7 | Kullanıcı "animasyonlarla desteklenmeli" dedi; ama her hareketin bir nedeni olmalı |
| VISUAL_DENSITY | 3 | Ekran başına tek fikir (brief §2.1) |

**Gramer:** *Chaptered editorial* (scrollcraft).
- Hero, media'sız bir tipografik başlık sayfasıdır; media birinci bölümde başlar.
- Filmlerin üstünde metin yoktur; her bölüm kendi zeminine iner. Zemin daima siyah olduğu için "drift" (zemin rengi geçişi) yoktur.
- Sayfa sonu tek bir birincil eylemle kapanır; bu eylem global `CtaBand`'dir.
- **Belgelenmiş sapma:** sitenin sticky header'ı ve `CtaBand` butonu site geneline ait olduğu için korunur.

---

## 2. Konsept: 360°

**Her servis aynı çemberin bir derecesidir.** `SERVICE_CATALOG`'daki 8 servis 45° aralıklarla dizilir:

| Servis | Derece |
|---|---|
| Creative | 000° |
| Production | 045° |
| Post Production | 090° |
| Digital | 135° |
| Live Broadcast | 180° |
| Cloud TV | 225° |
| Event Management | 270° |
| AI Creative Production | 315° |

- Her sayfa kendi derecesini üst meta satırında gösterir.
- Her sayfa bir sonraki dereceye giden "Sıradaki" satırıyla biter. 8 sayfa birlikte tam bir turdur.
- Sitenin özel imleci zaten fuşya bir "°" (DEC #3); derece dili sitenin kendi dilidir.
- Derece `src/lib/service-chapter.ts` içinde katalog sırasından **türetilir**, ayrıca saklanmaz. Katalog sırası `src/data/services.test.ts` ile sabitlenmiştir.

---

## 3. Renk: beyaz / sarı dengesi

Kullanıcı kararı (2026-09-13): zemin siyah, metin beyaz ve sarı, fuşya yardımcı renk. Beyaz ile sarının dengesi kritik.

1. **Sarı = ses.** Her kompozisyonda (≈ bir ekran) tek sarı odak olur: slogan, anahtar ifade ya da aktif/hover durumu. İki sarı blok aynı ekranda durmaz. Bu, brief §2.1'deki "bir ekranda tek slogan" kuralının renk karşılığıdır.
2. **Beyaz = anlatım.** Başlığın taşıyıcı kısmı, gövde metni, hizmet adları. İkincil metin `--text-muted` (%55 beyaz, 6,2:1).
3. **Fuşya = araç.** Çizgiler, seçim çerçevesi ve tutamaçlar, bezier anchor'ları, küçük indeksler (01, 000°), hover glitch, odak halkası, imleç. Fuşya **asla** gövde ya da başlık metni olmaz.
4. **Alan oranı:** siyah ≥ %60 · beyaz ~%30 · sarı ~%8 · fuşya ~%2.
5. **Tam ekran renk alanı yok.** Fuşya zemin üstünde beyaz metin 3,1:1 ile zaten yasak.
6. `globals.css` h1–h3'ü varsayılan olarak sarı yapar. Chapter bileşenleri rengi **açıkça** yazar; sarı yalnızca rolü odak olan başlıkta kalır.

**Kontrast (hesaplandı):** beyaz 21:1 · sarı 19,2:1 · fuşya 6,7:1 · `--text-muted` 6,2:1 · %40 beyaz 3,7:1 (yalnız ≥24px başlık).

---

## 4. Tipografi, grid, çizgi

| Rol | Token | Değer |
|---|---|---|
| Display (hero h1, sıradaki servis) | `--chapter-display` | `clamp(2rem, 13vw, 11rem)` <768px · `clamp(2rem, 10vw, 11rem)` ≥768px · Montserrat 800 · lh .86 |
| Manifesto / slogan (h2) | `--chapter-manifesto` | `clamp(1.75rem, 5vw, 5rem)` · 800 · lh 1.02 |
| Hizmet dizini | `--chapter-index` | `clamp(2rem, 6.4vw, 6.5rem)` · 800 |
| Lede | `--font-size-lead` | Montserrat 600 |
| Etiket | `--font-size-label` | 700 · büyük harf · `.14em` |
| Gövde | `--font-size-body` | Inter 400 · 1.5 |

- **Harf aralığı 0.** Sitenin ev kuralı; negatif tracking kullanılmaz.
- Bir kompozisyonda en fazla 3 punto.
- **Ölçülmüş genişlikler** (Montserrat 800, em): CREATIVITY 6.251 · WITHOUT LIMITS 9.012 · WITHOUT 5.201 · LIMITS 3.521 · PRODUCTION 7.272 · MANAGEMENT 7.831. Display boyutları bu değerlerle seçildi; 320px'te yatay taşma yoktur (`e2e/canonical-routes.spec.ts`).
- **Grid:** 12 kolon, yan boşluk `--page-gutter`. İçerik kolon 1–12; lede kolon 7–12. <768px'te tek kolon.
- **Bölüm başlığı:** 1px `--color-hairline` çizgi + etiket (h2). Sayaç yok.
- **Köşe:** hep 0. Film penceresi 4px başlar ve tam ekranda 0 olur.

---

## 5. Enstrüman katmanı

Her sayfanın **tek** bir imza SVG'si olur ve hepsi aynı gramerle çizilir: 1–1.5px çizgi, sanat eseri beyaz, araç arayüzü fuşya.

| Sayfa | Enstrüman |
|---|---|
| Creative | Pen tool ile çizilen DNA sarmalı (imza hareketi). Hero'daki seçim çerçevesi (#38, #44) beşinci turda, hizmet dizini yanındaki kristal tel kafes (#46) altıncı turda kaldırıldı. Dizinin yanında artık parallax görsel alanı var (`ParallaxScrollFeature`, DECISIONS #48): görsel ekrana girerken soldan sağa perdeyle açılır |
| Production | Vizör çerçeve çizgileri, REC, timecode |
| Post Production | Timeline + playhead |
| Digital | İmleç + piksel ızgara |
| Live Broadcast | Tally + ses metreleri |
| Cloud TV | Kanal / EPG şeridi |
| Event Management | Sahne planı ızgarası |

**MonaShard — ayrı bir katman (DECISIONS #43).** Yukarıdaki "tek imza SVG"
kuralı bölüm içi dekoratif çizimler içindir; MonaShard bundan bağımsız,
hero'nun sağ üst köşesine yerleşen bir parça MONA'dır. Yeni icat edilmiş
bir şekil DEĞİL — AI Creative Production sayfasındaki AYNI WebGL motoru
(`createMonaDotsScene`, `mona-creature.ts`), yalnızca `monaShardLayout` ile
kürenin gerçek merkezi kabın köşesinin hemen dışına düşecek şekilde
yeniden konumlanmış: noktaların yaklaşık yarısı görünür kalır ("MONA'nın
yarısını görücez"), geri kalanı GPU tarafından doğal olarak kırpılır.
Aynı imleç mıknatısı, tık tepkisi, açılış/uyku/kaçış mekanikleri —
"Monadaki hareket animasyon mekanikleri devam edecek". Sayfaya özel
siluet biçimlendirme (ör. Creative için beyin) kullanıcı tarafından bu
turda ertelendi ("beyin yapma, ben sonra ilgilenicem") — MONA şimdilik
her sayfada kendi doğal formunda görünüyor; rollout sırasında diğer
sayfalar için bu karar yeniden ele alınabilir (§11). Beşinci geri
bildirim turunda (DECISIONS #47) kap hero'nun TAMAMI oldu — içerideki
bir kutunun kenarları noktaları düz çizgiyle kesiyordu ("maske içinde
gibi"). Küre hero'nun sağ kenarında, alt kısmında büyük bir hilal;
açılışta noktalar hero'nun kenarlarından uçup geliyor. Bu sayfanın
MONA'sı göz/kalp/halka döngüsüne girmiyor. Metinler canvas'ın
üstünde (`z-index:1`), kap `pointer-events:none`, imleç `window`'dan.
Altıncı turda (DECISIONS #48) canvas hero'nun altına uzadı
(`SHARD_BLEED`): küre artık hero'nun alt kenarında düz çizgiyle
kesilmiyor. Hero'dan sonraki bölüm, metni canvas'ın üstünde kalsın diye
konumlandırılmış olmalı (`ScrollLitText .lit`). Küre %10 küçüldü.
Creative'in MONA'sı arada bir **nilüfere** dönüşüyor: kullanıcının
referans görselinden üretilen yoğunluk haritası (`mona-lotus.ts`); çiçek
anında bütün kütle sola kayar. Bu, sayfaya özel siluetin ilk örneği;
rollout'ta diğer sayfaların siluetleri aynı yoldan eklenebilir.
Referans görsel → `scripts/generate-mona-lotus.mjs` benzeri bir betik →
`lotusTargets` benzeri hedef. Bunun için motora her şekil için bir
öznitelik eklemek gerekir.

**MonaDrift — MonaShard'dan bağımsız ikinci bir katman (DECISIONS #45).**
"Tüm sayfada mona'nın noktacıklarına benzer noktalar özgürce dolaşsın"
isteğiyle eklendi. MonaShard'ın aksine MONA'nın yay fiziği/tık tepkisi
mekaniğini taşımaz — yalnızca aynı sarı/ışıma diliyle eşleşen, düz
sürüklenme + kenardan sarmayla hareket eden sade bir doku (`mona-drift.ts`,
Canvas 2D, tamamen `pointer-events:none`). `MonaField`'in (#40, SUPERSEDED)
sticky yerleşim hilesini yeniden kullanır — bu kez doğru renk/dokuyla.
Ekran boyu canvas'ı makalenin sonunda CtaBand ve Footer'ın üstüne
taşıyordu. Bu yüzden kullanan sayfanın kabı dikeyde kırpmalı:
`overflow: clip` (DECISIONS #48). `hidden` kullanılmaz, sticky
sahneleri bozar.

---

## 6. Hareket grameri

- **Kütüphane yok.** Scroll sahneleri `useScrollScene` → `--progress` (0→1) CSS değişkeniyle sürülür. CSS bu tek sayıdan her şeyi türetir (MeetTheCrewReveal kalıbının genelleştirilmiş hâli).
- **Dinleyici disiplini.** Scroll dinleyicisi yalnızca sahne görünür alandayken bağlanır (IntersectionObserver), rAF ile birleştirilir ve React state'e değil CSS değişkenine yazar.
- **Easing ve süreler:** tek easing `--ease-house` (`cubic-bezier(0.22, 1, 0.36, 1)`); süreler 180 / 420 / 720ms.
- **Yalnız compositor özellikleri** animasyonlanır: `transform`, `opacity`, `clip-path`, `stroke-dashoffset`. Width/height/top/left animasyonu yok.
- **Hero animasyonu** yalnız CSS keyframes'tir, JS beklemez (LCP).
- **Reduced motion:** her sahne final durumunu CSS media query ile JS'ten önce gösterir; `data-motion="static"`.
- **JS yoksa:** her bileşen `var(--progress, <varsayılan>)` ile okunur bir final duruma düşer.
- **Kompozisyon kuralları:** sayfada ≥4 hareket ailesi, aynı aile art arda yok, tek bir tasarlanmış zirve.

---

## 7. Film grameri (Seedance 2.5 · Higgsfield)

Her prompt'a birebir eklenen **ortak stil önsözü**:

> Pitch-black seamless void, no environment, no text, no logos, no recognizable faces. Single hard key light. Accent light only in electric magenta and lemon yellow, plus clean white highlights. Crushed blacks, high contrast, anamorphic 35mm softness, fine film grain, 24fps, slow deliberate camera.

- **Kesintisiz döngü:** Cinema Studio Image 2.5 ile üretilen key frame hem `start_image` hem `end_image` olarak verilir; aynı kare poster olur.
- **Ses yok:** `generate_audio: false`. Dekoratif, konuşmasız döngülerde altyazı gerekmez (DECISIONS'ta kayıtlı istisna).
- **AI etiketi:** `video.aiGenerated` metni filmin **altında** durur, üstüne bindirilmez.
- **Encode:** AV1 WebM 10-bit (1080p ≤2,5 MB, 720p ≤1,2 MB) + H.264 MP4 fallback + WebP poster (≤150 KB).
- **Oynatma:** `preload="none"`; görünürken oynat; görünür duraklat/oynat butonu (WCAG 2.2.2).
- **Sayfa başına EN FAZLA tek video, zorunlu değil** (DECISIONS #36, #39 ile gevşetildi: "belki her sayfaya video eklemeyiz"). Video varsa S2'nin (film penceresi) tek görsel malzemesi olur; video yoksa S2 hiç render edilmez, sayfa doğrudan S1'den S3'e geçer. Creative şu an videosuz (Sequin Tide verisi `ChapterFilm` ile birlikte diskte/kodda duruyor, dönerse tek satır).

---

## 8. Creative — scroll skoru

> **13 Eylül 2026, üçüncü tur revizyonu (kullanıcı geri bildirimi,
> DECISIONS #38–#39, #41–#43):** S2 film penceresi kaldırıldı ("videoyu
> şimdilik kaldıralım, belki her sayfaya video eklemeyiz") — S numaraları
> tarihsel referans için korundu, S2 boş bırakıldı. S1'in seçim çerçevesi
> artık statik değil, imlecin üzerindeki kelimeye kayan interaktif bir
> enstrüman. S4'te hover'daki kalem büyüyor, yanında ikinci bir pen-tool
> çizimi var. Hero'nun sağ üst köşesine MonaShard eklendi — MONA'nın
> gerçek küresinin bir parçası, kendi mekanikleriyle (§5, DECISIONS #43,
> #40'ın reddedilen ilk denemesinin YERİNE). Bu tek bir "S" bölümü değil,
> hero'ya bağlı ayrı bir katman. Zirve artık **S5** (DNA sarmalı) — S2
> kalkınca sahnedeki en uzun ve en özenli sahne oydu zaten.

### His eğrisi (önce his, sonra cihaz)

| # | His | Ekranda buna yol açan |
|---|---|---|
| S1 | Merak + oyunbazlık | Seçim çerçevesi imlecin üzerindeki kelimeye kayıp boyutunu ayarlıyor (bir tasarım programında nesne seçmek gibi); üst-sağ köşede bir parça MONA yaşıyor, imleç yaklaşınca noktalar mıknatıs gibi çekiliyor |
| S3 | Yakınlık | İki cümle, okudukça kelime kelime yanıyor |
| S4 | Netlik | Dikey hizmet dizini; imleç hangi satıra giderse o öne çıkıp büyüyor, geri kalanı söner; yanında ikinci bir pen-tool çizimi kendini çiziyor |
| S5 | **Kanaat — ZİRVE** | Pen tool, markanın DNA'sını çiziyor; slogan beliriyor |
| S6 | Beklenti | Galerinin yolda olduğu dürüstçe söyleniyor (metin, film yok) |
| S7 | Çözülme | Kadran 45° dönüyor: sıradaki derece Production |

MonaShard yalnızca S1'de (hero'nun sağ üst köşesinde) yaşar — sayfanın
geri kalanına dolaşmaz (§5'te düzeltilen ilk tasarımın aksine). İmleç
yaklaşınca toplanıp bir süre onu izler, tıklandığında tepki verir —
köşede sürekli yaşayan, dikkat çekmeyen bir eşlik.

**Zirve cümlesi:** "Pen tool ekranda beliriyor ve markanın DNA'sını, çift sarmalı çizerek anlatıyor; slogan tam o anda beyaza değil sarıya çıkıyor."

**Anlatılacak cümle:** "Bir tasarım programının içinde geziniyormuş gibi hissettiren, her servisin bir derece olduğu ve köşesinde MONA'nın yaşadığı site."

### Cihaz tablosu

| # | Cihaz ailesi | Neden bu cihaz | Yükseklik | Hiza |
|---|---|---|---|---|
| S1 | Kinetik tipografi + interaktif seçim çerçevesi (CSS + JS ölçüm) | Başlık sahnenin tamamı; çerçeve imlece yanıt veren tek "araç" hissi | 100svh | Sol + sağ kolon lede |
| S3 | Scroll ile yanan metin | Okuma hızını okur belirler | ~120svh | Sol |
| S4 | Pointer odağı + büyüme (+ dokunmatikte scroll odağı) | Dikey dizin okura yanıt veriyor, büyüyen kalem odağı pekiştiriyor | ~140svh | Sol liste + sağda ikinci çizim (≥1024px) |
| S5 | Pin + SVG çizimi (imza hareketi) — **ZİRVE** | Scroll, nesneyi kelimenin tam anlamıyla çiziyor | **180svh (en uzun)** | Sarmal tam genişlik, slogan sağ |
| S6 | Metin durumu (flow) | Zirveden sonra sessizlik; dürüst bekleme | ~50svh | Sol |
| S7 | Hover dönüşü (kadran) | Sonraki dereceye geçiş, döngüyü kapatır | ~60svh | Sol |

Video eklenirse (§7) S2 bu tabloya "pin + reveal, 260svh, tam ekran"
olarak geri döner ve zirve karşılaştırması yeniden yapılır — video S5'ten
daha uzun olduğu için o zaman zirve tekrar S2'ye kayabilir.

Toplam yaklaşık 6.5 ekran boyu (video eklenmeden; scrollcraft aralığı
8–14'ün altında kalıyor — S2 dönerse tekrar aralığa girer).

**Kontroller:**
- ✓ ≥4 cihaz ailesi, art arda tekrar yok.
- ✓ Scrub (videonun scroll ile ileri-geri sarılması) yok.
- ✓ Zirve en uzun sahne ve en iyi varlık onda.
- ✓ Zirveden önce sessizlik: S4'ün netliğinden sonra S5'in pin sahnesi sakince başlıyor.
- ✓ Bitişik iki bölüm aynı hissi taşımıyor.

### İmza hareketi

**Pen tool ile çizilen DNA sarmalı.**
- İki bezier iplik scroll'la kendini çizer. Tepe noktalarında yatay tutamaçlı fuşya anchor'lar belirir.
- Çizim ucunda bir pen imleci ilerler.
- Sarmal, CRE-02 sloganının ("Your Brand’s DNA Is the Ultimate AI Differentiator.") görsel karşılığıdır.
- Geometri `dna-helix.ts` içinde test edilmiş saf bir fonksiyondan üretilir.

### Metin kaynakları (brief/deck, 2026-09-13 kararıyla geri döndü)

| Bölüm | Metin | Kaynak |
|---|---|---|
| S1 | "CREATIVITY WITHOUT LIMITS" (EN, `lang="en"`) + `services.creative.heroSubtitle` | CRE-01, brief satır 615 |
| S3 | `services.creative.body[0..1]` | deck |
| S4 | BRAND CONSULTANCY · CORPORATE IDENTITY · MARKETING PLAN AND STRATEGY · CONCEPT DEVELOPMENT · CONTENT GENERATION · COMMERCIALS · PACKAGING · TV · PRESS · RADIO CAMPAIGNS | CRE-03 |
| S5 | `services.creative.band` | CRE-02, brief satır 618 (galerinin üstü) |
| S6 | `common.pendingLabel` + `services.creative.galleryEmpty` + `nav.work` → `/work?service=Creative` | CRE-04 (varlıklar DEC #16 ile bloklu) |
| S7 | "PRODUCTION" + `whatWeDo.list` Production satırı | katalog + WWD-02 |

**Sayfa içinde /contact butonu yok.** Tek birincil eylem global `CtaBand`'dir (GEN-08).

---

## 9. Mevcut Creative'in audit'i (2026-09-13, "önce")

| Bulgu | Etki | Karar |
|---|---|---|
| Bütün başlıklar sarı; beyaz yalnızca gövdede | Beyaz/sarı dengesi yok, hiyerarşi düz | Renk rolleri (§3) |
| H1 "PURE. SIMPLE. POWERFUL." Production'ın sloganı; "WE EXPAND IT" iki kez var ve AI sayfasına ait | Aynı ekranda slogan çakışması, kaynaksız metin | Brief/deck metnine dönüş |
| Kapanış bloğu kaynaksız; CTA global bandı birebir tekrarlıyor; TR'de İngilizce | Tekrarlanan CTA amacı, karışık dil | Kaldırıldı |
| Stok ampul görseli (shutterstock, lisanssız, marka paleti dışı) | Hukuki ve marka riski | Kaldırıldı; yerine Seedance filmi |
| 512×512 video tam genişliğe gerilmiş; `autoPlay` + `preload="metadata"`, durdurma yok | Bulanık görüntü; CLAUDE.md ve WCAG 2.2.2 ihlali | `ChapterVideo` |
| Hizmetler 3 kolon, her satırda hairline | Taste "divide-y liste" kalıbı | Akan dev kelime dizini |
| Hardcoded `#050505` / `#080808` | Token kuralı ihlali | Yalnız token |
| Mevcut kadran okuması: VARIANCE 4 · MOTION 2 · DENSITY 4 | Şablon hissi | 8 · 7 · 3 |

**Korunanlar:** URL ve slug, `generateMetadata` (title "Creative", EN/TR açıklamalar), `localizedAlternates` (canonical + hreflang), BreadcrumbList JSON-LD, marka renkleri ve fontlar, köşe 0, fuşya indeks geleneği, global `CtaBand`.

---

## 10. Pre-flight — marka sözleşmesiyle çelişen maddeler

design-taste-frontend skill'inin bazı varsayılanları marka sözleşmesiyle çelişir. Öncelik sırası: CLAUDE.md ve DECISIONS > skill varsayılanı.

| Skill varsayılanı | Bu projede | Gerekçe |
|---|---|---|
| Saf `#000000` kullanma | `--color-brand-black: #000000` | CLAUDE.md marka rengi, değiştirilemez |
| Özel imleç kullanma | Fuşya "°" imleci kalır | DEC #3; sistem imleci hiç gizlenmez, dokunmatik ve reduced-motion'da kapalı |
| Inter'den kaçın | Inter gövde fontu | DEC #2 |
| Motion / GSAP | Kütüphane yok | Proje bağımlılığı yok; 5 bileşende kanıtlanmış `--progress` kalıbı |
| `window.addEventListener('scroll')` yasak | Pasif dinleyici, yalnız görünürken, rAF ile birleştirilmiş, React state'e değil CSS değişkenine yazar | Skill'in gerekçesi (her karede React render, jank) bu kalıpta oluşmuyor |
| Açık + koyu mod | Yalnız koyu | Marka zemini siyah |
| Lucide'den kaçın | lucide-react | Proje zaten bağımlı; skill'in kendi istisnası |
| El yapımı dekoratif SVG yok | Enstrüman SVG'leri | Konseptin kendisi; geometri test edilmiş saf fonksiyonlardan üretilir |

**Bu projede de geçerli olan kurallar:**
- em dash yok (yazdığımız UI metinlerinde),
- dikey yazı yok,
- sayaç ve "01 / 04" yok,
- scroll ipucu yok,
- sayfa başına en fazla 3 eyebrow (hero meta satırı, "Services", "Sıradaki"),
- görsel üstüne etiket yok,
- durum noktası yalnızca gerçek bir durumda (galeri "hazırlanıyor"),
- tek birincil CTA,
- hero ≤2 satır (masaüstü) ve ≤20 kelime lede,
- her animasyon tek cümleyle gerekçelendirilebilir.

---

## 11. Rollout (diğer 6 sayfa)

1. **İçerik haritası:** yalnız deck/brief metni.
   - Live Broadcast H1 AÇIK: brief 831 ve LIVE-01 [ÖNERİ].
   - Production ve Live Broadcast'teki kanıt satırları doğrulanmadan yazılmaz.
2. **Enstrüman SVG'si** (§5).
3. **MonaShard** (§5, DECISIONS #43): `ChapterHero`'nun `mona` prop'una
   `<MonaShard />` verilir — hero'nun köşesine MONA'nın gerçek küresinden
   bir parça yerleşir, ek yapılandırma gerekmez (sayfaya özel siluet
   biçimlendirme kullanıcı tarafından ertelendi — bkz. #43'ün notu).
   Production/Post/Live/Cloud TV/Event/Digital için de aynı bileşen aynen
   kullanılabilir. Nilüfer yalnız Creative'e ait (#48). Bileşen şu an
   nilüferi her zaman ekliyor. Diğer sayfalara taşınırken şekil, sayfanın
   verdiği bir prop'a dönmeli. Hero'dan sonraki bölüm konumlandırılmış
   olmalı (canvas uzantısı, §5). MonaDrift kullanılıyorsa sayfa kabı
   `overflow: clip` almalı.
4. **Video, isteğe bağlı** (§7, DECISIONS #39 ile zorunluluk kaldırıldı):
   eklenirse sayfa başına **en fazla tek** film, konuyla alakalı — stil
   önsözü (§7) birebir kullanılır, sayfanın ışık rengi yine magenta/sarı,
   ama SAHNE sayfanın konusunu anlatır: Production = vizör/REC, Post
   Production = timeline/playhead, Live Broadcast = tally/ses metresi,
   Cloud TV = kanal şeridi, Event Management = sahne planı, Digital =
   imleç/piksel (bkz. §5 enstrüman eşlemesi, aynı motif SVG'de ve filmde
   tekrar edebilir). Video eklenirse S2'nin (pencere) tek malzemesi olur;
   eklenmezse S2 hiç render edilmez.
5. **Son sayfa taşındığında:**
   - `service-page.module.css` ve `ServiceVisual` kaldırılır;
   - `e2e/revision-layout.spec.ts:215` yeni seçiciye taşınır;
   - 5 kopya scroll-scene mantığı `useScrollScene`'e birleştirilir;
   - `service-page.module.css:328`'deki tanımsız `--space-10` hatası kapanır.
6. **İsteğe bağlı:** hub kartındaki yasaklı `creative.webp`, Sequin Tide posteriyle değiştirilir.
