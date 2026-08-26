# Creative Sayfası — Görsel Yön

**Tarih:** 2026-08-26 · **Sayfa:** `/tr/what-we-do/creative` · `/en/what-we-do/creative`
**Kaynak:** `docs/brief-rev12.md` Bölüm 9 · `docs/DECISIONS.md` #7 · `docs/visual-audit/BLOCKERS.md` #5

---

## 0. Özet — üç cümle

1. **Mevcut ampul görseli kullanılmayacak.** Yerine ne konacağı, arşivde
   uygun aday olmadığı için bir üretim işi — bkz. §3 (BLOCKER).
2. **DECISIONS #7 kararı ("toz pembe zemin, siyah başlık, fuşya vurgu")
   koda hiç uygulanmamış** — sayfa bugün siyah zemin + beyaz başlık +
   sarı alt başlık. Bu, fotoğraf beklemeden bugün düzeltilebilir.
3. Fotoğraf/video gelmezse sayfa boş kalmasın diye **CSS/doku/tipografik
   bir hero alternatifi** §5'te tasarlandı; bu alternatif kalıcı da
   olabilir, geçici de.

---

## 1. Bugünkü durum — üretim sunucusunda doğrulandı

| Öğe | Bugün ne var | Kaynak |
|---|---|---|
| Zemin | **Siyah** (`--color-brand-black`) | — |
| H1 | "CREATIVITY WITHOUT LIMITS", beyaz | CRE-01 |
| Alt başlık | "Her fikir insanla başlar. Her ihtimal yapay zekâyla büyür.", **sarı** | CRE-01 |
| Hero görseli | `public/images/site/services/creative.webp` (111 kB) — mor/turuncu neon ampuller, üzerinde "design", "thinking", "idea", "skill", "brainstorm" el yazısı | `src/data/site-images.ts` |
| Hizmet listesi | 10 madde, fuşya işaretli, üç sütun | CRE-03 |
| Ara bant | "Markanızın DNA'sı, yapay zekâ çağının asıl ayrıştırıcısıdır." | CRE-02 |
| Galeri | Boş durum: "Kampanya galerisi hazırlanıyor." | TODO CRE-04 |

Sayfa toplam yüksekliği masaüstünde 2512 px — içeriğin yaklaşık üçte
biri hero görseli.

---

## 2. Mevcut ampul görseli neden kullanılmayacak

Karar zaten `docs/VISUAL_ASSET_AUDIT.md`'de ("fazla jenerik") ve
`ASSET_SELECTION_REPORT.md`'de ("Kullanılmaması gerekenler") verilmişti;
bu doküman gerekçeyi tamamlıyor ve kapatıyor.

| # | Gerekçe |
|---|---|
| 1 | **Marka paletiyle çelişiyor.** Görsel mor + turuncu; marka paleti siyah / beyaz / fuşya #FF00FF / sarı #FFFC00. Sayfadaki hiçbir renkle ilişkilenmiyor |
| 2 | **Klişe.** "Ampul = fikir" görseli, "yaratıcılığın sınırı yok" diyen bir sayfada tam tersini söylüyor: en beklenen görsel |
| 3 | **Stok.** `ASSET_SELECTION_REPORT.md`, kaynağının `CREATIVE/CREATIVE/shutterstock_1636265755` olduğunu tespit etti. Lisans kaydı elimizde yok |
| 4 | **İçindeki metin İngilizce ve kontrolümüzde değil** ("design", "thinking", "skill"). Bir görselin içinde çevrilemeyen metin taşımak iki dilli sitede kalıcı bir tutarsızlık |
| 5 | **Brief açıkça değiştirilmesini istiyor:** Bölüm 9 tablosunda "Mevcut görsel → Değişecek — yerine bambaşka bir fotoğraf veya video" |

---

## 3. BLOCKER — arşivde uygun aday yok

**Bu maddenin çözümü müşteri/prodüksiyon tarafındadır; kod tarafında
yapılabilecek bir şey kalmamıştır.**

Brief Bölüm 9 şunu istiyor: *"Aşağıdaki referans görselin (pullu zemin,
disko/parıltı dokusu) uyarlanmış hâli bu sayfada kullanılacak"* — ve
referansı "Hibrid 360'ın kendi tasarımı: pullu/parıltılı zemin ve
kafasında disko topu olan figür" olarak tarif ediyor.

### 3.1 Arşiv taraması sonucu

Müşteriden gelen 119 dosyalık arşiv (`hibrid-360_wb-site-fotograglar_2026-08-21_0937`)
`ASSET_SELECTION_REPORT.md`'de dosya dosya incelendi:

- `CREATIVE` klasörünün **12 dosyasının tamamı**, yalnızca iki stok
  görselin (ampul + siyah-beyaz masaüstü flatlay) varyasyonu.
- Arşivin tamamında **pullu / payetli / parıltılı / disko dokusuna sahip
  hiçbir görsel yok**.
- Brief'in tarif ettiği "disko topu kafalı figür" referans görseli
  **arşivde yok** — brief'in kendi deck'inde gömülü bir referans, ayrı
  dosya olarak teslim edilmemiş.

### 3.2 Müşteriden istenecek — net liste

| # | Talep | Neden |
|---|---|---|
| 1 | **Brief Bölüm 9'daki referans görselin kaynak dosyası** (deck'e gömülü hâli değil, orijinal) | Doku uyarlaması bu dosyadan türetilecek; hem Creative hem MONA kostümü besleniyor |
| 2 | Bu tasarımın **kime ait olduğu ve kullanım hakkı** | Brief "Hibrid 360'ın kendi tasarımı" diyor; teyit gerekiyor |
| 3 | Yayınlanmış **kampanya görselleri / KV'ler / outdoor-billboard / brand ID çalışmaları** (brief CRE-04'ün istediği içerik) | Galeri bölümünün asıl içeriği bu; ayrıca `/work` envanteriyle örtüşüyor |
| 4 | Her görsel için **yayın izni durumu** | CLAUDE.md: sahte iş/müşteri iddiası yayınlanmaz |

**Not:** 3. madde `docs/work/WORK_INVENTORY_REQUEST.md` ile aynı veri
setinden besleniyor — müşteriden **tek seferde** istenmeli, iki ayrı
talep açılmamalı.

---

## 4. Bugün yapılabilecek düzeltme — DECISIONS #7 uygulanmamış

`docs/DECISIONS.md` #7 kaydı:

> Creative sayfası zemin rengi · brief Bölüm 9 · **Toz pembe zemin +
> siyah başlık + fuşya vurgu (brief'in kendi önerisi)** · VARSAYILANLA
> İLERLE

Ekran görüntüsüyle doğrulandı: sayfa **siyah zemin + beyaz H1 + sarı alt
başlık** olarak duruyor. Karar "VARSAYILANLA İLERLE" statüsünde olmasına
rağmen uygulanmamış.

Brief Bölüm 9'un kendi notu bu kararın gerekçesini de veriyor:

> *"Mint neon yeşili üzerine beyaz metin okunmaz. Fuşya üzerine siyah metin
> çalışır. Toz pembe en güvenli seçenektir ama en az iddialı olanıdır.
> Öneri: zemin toz pembe, başlık siyah, vurgular fuşya. Mint yeşili MONA
> bölümüne saklansın — böylece iki bölüm birbirine karışmaz."*

### 4.1 Uygulama — renk tablosu

| Öğe | Bugün | Karar sonrası |
|---|---|---|
| Sayfa zemini | Siyah `#000000` | **Toz pembe** (yeni token: `--color-creative-dusty-pink`) |
| H1 "CREATIVITY WITHOUT LIMITS" | Beyaz | **Siyah** `#000000` |
| Alt başlık | Sarı `#FFFC00` | **Siyah**, daha küçük punto |
| Hizmet listesi işaretleri | Fuşya | **Fuşya** (değişmiyor) |
| Ara bant "Markanızın DNA'sı…" | Beyaz/siyah | **Siyah metin**, fuşya altı çizgi |
| CTA butonu | Fuşya zemin + siyah metin | **Değişmiyor** (kontrast kuralı zaten doğru) |

### 4.2 Toz pembe tonu — teyit gerekiyor

Brief "toz pembe" diyor ama **hex vermiyor**. Marka paletinde de yok.
Bu bir [KARAR] maddesi; uydurulmamalı.

İki seçenek, ikisi de fuşya ailesinden türetilebilir:

| Seçenek | Öneri | Siyah metinle kontrast |
|---|---|---|
| A — açık | `#F2D9EC` civarı | Çok yüksek, AA rahat geçer |
| B — doygun | `#E8B8D8` civarı | Yüksek, AA geçer |

**Doğrulama şartı:** hangi ton seçilirse seçilsin, siyah metinle WCAG AA
(4.5:1) kontrol edilmeden koda girmemeli. MONA'nın baby pink'inden
**görünür şekilde ayrışmalı** — aksi hâlde iki bölüm aynı sayfada karışır.

### 4.3 Kontrast tuzağı — dikkat

CLAUDE.md kuralı: **fuşya zeminde beyaz metin AA geçmiyor, siyah metin
şart.** Toz pembe zeminde de aynı mantık geçerli: pembe zemin + beyaz
metin okunmaz. Zemin değişikliği yapılırken sayfadaki **tüm** beyaz
metinler siyaha çevrilmeli — kısmi dönüşüm en kötü sonucu verir.

---

## 5. Alternatif — CSS / doku / tipografik Creative hero

Fotoğraf gelmezse (ya da hiç gelmezse) sayfanın boş kalmaması için.
Bu alternatif **geçici olmak zorunda değil**; brief'in istediği "pullu,
parıltılı" dili fotoğrafsız da taşıyabilir.

### 5.1 Neden tipografik hero savunulabilir bir seçim

Sayfanın adı "Creativity Without Limits". Bir fotoğraf her zaman bir
**sınır** çizer (bir stüdyo, bir obje, bir an). Tipografi + doku bunu
yapmaz. Yani fotoğrafsızlık burada bir eksiklik değil, sayfanın kendi
tezine uygun bir tercih olarak savunulabilir.

### 5.2 Katman kurgusu

Üç katman, üstten alta:

1. **Zemin:** düz toz pembe (§4.2).
2. **Doku katmanı:** pul/payet parıltısı, **CSS ile** üretilir —
   `radial-gradient` tekrarı + `mix-blend-mode: overlay` + çok düşük
   opaklık (~%6–10). Amaç fotogerçekçi pul değil, yüzeyde "dokunulabilir
   bir parıltı" hissi. Tek bir küçük tileable WebP (≤ 8 kB) ile de
   üretilebilir — CSS gradient'ten daha ikna edici olur ve performans
   bütçesini zorlamaz.
3. **Tipografi katmanı:** "CREATIVITY WITHOUT LIMITS" Montserrat Extra
   Bold, siyah, ekranı **taşacak** ölçekte (viewport genişliğinin
   %110–120'si). Taşma kasıtlı: "without limits" cümlesi kadrajın dışına
   çıkarak kendini anlatır.

### 5.3 Hareket — bütçe içinde

| Öğe | Hareket | Not |
|---|---|---|
| Doku katmanı | Çok yavaş yatay kayma (60–90 sn tam tur) | GPU'da transform; layout tetiklemez |
| Tipografi | Scroll'a bağlı hafif paralaks (max 40 px) | `prefers-reduced-motion` açıkken kapalı |
| WebGL | **YOK** | CLAUDE.md: aynı anda en fazla BİR WebGL sahnesi; o kota ana sayfa hero'suna ait |

### 5.4 Fuşya vurgusu nerede

Toz pembe + siyah kombinasyonu güvenli ama sakin. Fuşya, sayfada **üç
noktada** görünmeli, fazlası değil:

1. Hizmet listesi madde işaretleri (bugün zaten böyle)
2. Ara banttaki "Markanızın DNA'sı…" cümlesinin altı çizgisi
3. CTA butonu zemini (siyah metinle)

### 5.5 Galeri bölümü — CRE-04

Brief: *"Kampanya görselleri, KV'ler, outdoor/billboard görselleri,
logolar, brand ID çalışmaları, fotoğraf çekimleri ve işlerden görsellerin
yer alacağı bölüm."*

İçerik gelene kadar bugünkü boş durum ("Kampanya galerisi hazırlanıyor.")
**doğru davranış** — sahte görsel konmuyor. Tek öneri: boş durum kutusu
toz pembe zeminde siyah çerçeveli olsun (bugün siyah zeminde duruyor),
sayfanın geri kalanıyla aynı dili konuşsun.

---

## 6. Öncelik ve bağımlılıklar

| Sıra | İş | Bağımlılık | Kim |
|---|---|---|---|
| 1 | Toz pembe tonunun seçilmesi + AA doğrulaması (§4.2) | Yok | Tasarım |
| 2 | Zemin/metin renk dönüşümü (§4.1) | 1 | Geliştirme |
| 3 | Pul/parıltı doku katmanı (§5.2) | 1 | Tasarım + geliştirme |
| 4 | Ampul görselinin kaldırılması | 2, 3 (yerine bir şey konmadan kaldırılmaz) | Geliştirme |
| 5 | Referans dosyanın müşteriden alınması (§3.2 #1) | **Müşteri** | — |
| 6 | Kampanya görselleri / KV'ler (§3.2 #3) | **Müşteri** — Work envanteriyle birlikte | — |

**1–4 arası maddeler müşteriyi beklemez.** 5 ve 6 gelmeden sayfa
"tamamlandı" sayılmaz ama "placeholder" görünmekten çıkar.
