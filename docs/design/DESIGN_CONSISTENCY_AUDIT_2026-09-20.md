> **Not (20 Eylül 2026):** Faz 2 (tasarım dili birleştirme) girdisi olarak saklanan ölçüm raporu.
> Aşağıdaki ekran görüntüleri oturum geçici dizinindeydi ve depoya alınmadı; sayılar
> (punto, gutter, renk) `getComputedStyle` ölçümleridir. Kullanıcı kararı sonrası durum:
> kanonik display sesi **Space Grotesk 700** (What We Do dili tüm sayfalara, ana sayfa dahil);
> Think & Thank'in krem/mint/pembe dünyası korunur; MONA yalnız seçili sayfalarda.
> Faz 1 (bu rapordan çıkan hatalar) için bkz. `tasks/todo.md` (20 Eylül bölümü).

# Hibrid 360 — Tasarim Dili Tutarlilik Denetimi

Tarih: 2026-09-20 · Olcum: production build @ localhost:3100 · Playwright/Chromium (SwiftShader)
Kapsam: 31 TR rotasi · 124 ekran goruntusu (1440x900 x3 scroll + 390x844 top) · getComputedStyle olcumleri
Hicbir repo dosyasi degistirilmedi.

## A. REFERANS DIL (olculen degerler)

Kaynak: docs/design/SERVICE_CHAPTER_SYSTEM.md + src/components/service-chapter/* +
/tr/what-we-do/{creative,production,post-production,digital,live-broadcast,cloud-tv,event-management}

1. Hero = medyasiz tipografik baslik sayfasi. Grid sirasi: meta satiri -> bosluk -> h1 -> lede.
   Meta: kirinti (Archivo 700 / 16px / ls 2.24px = 0.14em / uppercase) solda, fusya derece 000 derece
   + ChapterDial SVG sagda, altinda 1px --color-hairline (rgba 255,255,255,.14).
   min-height: calc(100svh - var(--header-height)). -- ChapterHero.module.css:9-18, 78-126
2. Display tipografi: Space Grotesk 700, 144px @1440 (--chapter-display, tokens.css:245/267),
   line-height 0.86 (123.84px olculdu), letter-spacing 0 (normal), uppercase.
   Renk kurali: bir satir BEYAZ, bir satir SARI (CREATIVITY / WITHOUT LIMITS).
   Manifesto h2 = Space Grotesk 700 / 72px / sari. Bolum etiketi h2 = Archivo 700 / 16px / ls .14em / --text-muted.
3. Renk orani: siyah >=60% · beyaz ~30% · sari ~8% · fusya ~2%. Sari = ekran basina TEK odak.
   Fusya yalniz arac: derece, dizin numaralari (01-10), cizgiler, odak halkasi. Asla govde/baslik.
   Olcum: Creative'de fusya metin = yalnizca "000 derece" ve "045 derece".
4. Izgara: tam genislik, sola yasli, --page-gutter = 41px @1440 / 20px @390.
   Dikey ritim: padding-block 64px / 144px (ServiceChapter.module.css:10), ChapterIndex 64/160.
   Iki kolon alan bolumu 0.92fr/1.08fr, proz max 46ch @ 28px/1.6.
5. Dekoratif katmanlar: her chapter sayfasinda 2 canvas olculdu -- MonaShard (hero kosesi, WebGL)
   + MonaDrift (sayfa geneli ambient noktalar, Canvas2D). Sayfaya ozel tek imza SVG.
6. Kose her yerde 0. Gorseller: border-radius 0, filter none, object-fit cover, cerceve yok.
7. Kapanis: ChapterNext (SIRADAKI ok + dev servis adi + derece kadrani) -> global CtaBand.
   PrimaryCta: sari zemin / siyah metin / radius 0 / Archivo 18px 700 / padding 16px 32px.
8. Hareket: kutuphane yok; --progress CSS degiskeni, --ease-house, 180/420/720ms.

## B. SAYFA BAZINDA UYUM

Olculen H1 (1440x900): font / punto / agirlik / tracking / renk / sol kenar (x). GUT = sol bosluk.

| Sayfa | Uyum | H1 olcumu | Ana sapmalar | Kok dosya |
|---|---|---|---|---|
| /tr/what-we-do/creative | REFERANS | Space Grotesk 144 700 ls0 beyaz x41 | CtaBand data-compact (72px), 6 kardesi 100.8px | creative/page.tsx CtaBand variant |
| production, post-production, digital, live-broadcast, cloud-tv, event-management | High | Space Grotesk 144 700 ls0 beyaz x41 | Yok, dil tam | - |
| /tr/what-we-do (hub) | Medium | Space Grotesk 135.36 700 ls0 beyaz x41 | H1 kendi clampini uyduruyor (144 degil); kirinti FUSYA P 16px (renk rolu ihlali); dial/derece yok; hero ustunde ~300px bosluk; #070707 token disi | what-we-do/page.module.css:18,23,29-33 |
| /tr (ana sayfa) | Medium | Archivo 36 700 (SEO h1); gorsel basliklar Archivo 800 100-130px ls -5.7px sari | Farkli display sesi (Archivo degil Space Grotesk), negatif tracking, gutter 36px, sari outline 01/02/03 (chapter fusya), #080808 ve rgba(10,8,14,.74) | components/home/*, HeroTypography.module.css:113 |
| /tr/work | Medium | Archivo 129.6 800 ls0 SARI x41 | Heroda tam ekran fotograf (chapter 1. kural: hero medyasiz); meta/derece yok; lede sari; proz rgba(255,255,255,.68) token disi sonum; AI etiketi konumu tutarsiz; #151515 / #101010 | work/page.module.css, components/work/WorkArchive.module.css:74,107 |
| /tr/clients | Medium | Archivo 115.2 800 ls0 sari x41 | Heroda ~600px bosluk; meta satiri yok; yarim ekran sari panel chapterda yok | clients/page.module.css |
| /tr/contact | Medium | Archivo 88 800 ls0 sari x41 | Heroda fotograf; submit butonu Archivo 22px pad 17.6/36 (PrimaryCta 18px / 16-32); bolum ritmi 96/96 ve 80/80 | contact/page.module.css:19,107,180,231,402 |
| /tr/culture | Low | Archivo 80 800 ls -2.4px sari x16 | Gutter 41 -> 16px; sari H1; dizin numaralari sari (chapter: fusya); daire buton (radius 50%); #050505, #080808 | culture/page.module.css:29,94,117,164 |
| /tr/culture/directors | Low | Archivo 80 800 ls -2.4px sari x16 | Ayni; ayrica bos durum kutusundan CTAya ~380px olu alan | culture/directors/page.module.css |
| /tr/culture/sustainability | Low | Archivo 40 800 ls -1.2px sari x429 (ortali) | Legal sablonu: 736px ortali kolon, fusya-saydam gradyan alt cizgi (baska hicbir yerde yok) | LegalPage + culture/sustainability/page.module.css:3 |
| /tr/who-we-are, /tr/what-we-believe, /tr/partners | Low | Archivo 158.4 800 ls -4.752px sari x41 | Sitenin en buyuk H1i; chapterin ls 0 kuralinin tersi; Newsreader 32px/1.2 proz (dorduncu ses); partnersta dev sari serif alinti; bolum ritmi 144/72 | styles/culture-page.module.css, what-we-believe/page.module.css |
| /tr/solutions | Low | Archivo 160 800 ls -3.2px sari x41 | Sitenin en buyuk H1i; hero ustunde ~330px bosluk; sari eyebrow + sari numara + sari H1 (tek odak kurali yok) | solutions/page.module.css:15 |
| /tr/what-we-do/service-production | Low | Archivo 80 800 ls -2.4px sari x16 | What We Do altinda ama chapter dili YOK; gutter 16px; --content-max-width ortali kap; PrimaryCta kopyasi (pad 12/24) | service-production/page.module.css:2,15-17 |
| /tr/what-we-do/how-we-work | Low | Archivo 80 800 ls -2.4px sari x16 | Ayni + TR sayfada govde metni tamamen INGILIZCE; belirlenecek TBD cipi satir icinde gorunuyor | how-we-work/page.module.css:2,8-10 ; messages/tr.json:438 |
| /tr/what-we-do/ai-creative-production | Low | Archivo 48.96 800 beyaz x41 | H1 chapterin 1/3u; radius 999px hap butonlar (kose-0 ihlali), Inter 16/500 buton; durum noktasi; manifesto Space Grotesk 144 ama H1 Archivo 49 | ai-creative-production/page.module.css:4,9,23 ; components/mona/Mona.module.css |
| /tr/brief | Low | Archivo 36 700 sari (gizli); gorunen baslik FUSYA P 28px | Fusya 3 satir govde metni (renk rolu ihlali, sayfadaki en yuksek sesli oge); ortali 672px kolon (tum site sola yasli); ghost outline buton (Inter 16/400) | components/brief/BriefBuilder.module.css |
| /tr/accessibility, /ai-policy, /privacy, /cookie-policy, /kvkk, /terms | Low | Archivo 40 800 ls -1.2px sari x429 | 736px ortali okuma kolonu; H1 40px (chapter 144); fusya gradyan alt cizgi; rgba(255,0,255,.06) panel; tum h2/h3 sari | components/legal/PolicyPage, LegalPage |
| /tr/think-and-thank (+ makale) | Ayri dunya (kasitli) | Archivo 146.88 / 77.76 800 ls -4.4px SIYAH krem zeminde | --mag-paper #f7f6f1 / mint / pink / lilac zeminler; siyah metin; siyah headerdan kreme gecis sert | think-and-thank/page.module.css:2-5, [slug]/page.module.css:7-10 |

EKRAN GORUNTUSUYLE DOGRULANAN: tum H1 renk/boyut/hizalari, gutterlar, hap butonlar, fusya govde metni,
bosluklar, krem magazin dunyasi, header/footer tutarliligi, mobil yerlesimler.
KODDAN CIKARILAN (gorsel dogrulanmadi): hover durumlari, motion sureleri, prefers-reduced-motion davranisi.

## C. GORSEL ETKIYE GORE SIRALI KESISEN SORUNLAR

1. H1 olcegi dagilmis -- tek viewportta 12 farkli punto: 40 · 48.96 · 77.76 · 80 · 88 · 115.2 ·
   129.6 · 135.36 · 144 · 146.88 · 158.4 · 160px. tokens.css:136-152 "sayfa basliklari bes ayri
   puntoya dagilmisti" diye sikayet edip 3 kademe tanimliyor; 8 sayfa kendi clampini yaziyor.
2. H1 rengi: chapter = beyaz + tek sari satir. Diger 18 sayfa = duz sari H1 (globals.css:47
   varsayilani). Bu, SERVICE_CHAPTER_SYSTEM.md 9. bolumunun yalniz Creative icin kapattigi bulgunun
   ta kendisi (butun basliklar sari -> hiyerarsi duz).
3. Iki display sesi: Space Grotesk 700 (7 chapter + hub + AI manifesto) ve Archivo 800 (geri kalan).
4. Tracking celiskisi: chapter sozlesmesi "negatif tracking yok" (ls 0); site varsayilani
   --tracking-display: -0.03em -> 158.4pxte -4.752px. Iki kural ayni anda yururlukte.
5. Kap/gutter bes farkli: 41px tam genislik · 16px (culture, directors, service-production,
   how-we-work) · 36px (ana sayfa hero) · 736px ortali (7 legal/sustainability) · 672px ortali (brief).
6. Hero grameri: meta satiri + derece + kadran + hairline + fusya lede cizgisi yalniz 7 sayfada.
   Work ve Contact heroya medya koyuyor (chapter 1. kuralinin tersi).
7. Buton ailesi 6 varyant: PrimaryCta (sari/0/Archivo 18 700/16-32) · service-production kopyasi
   (12/24) · Contact submit (22px/17.6-36) · MONA haplari (radius 999px, Inter 16/500) ·
   who-we-are hapi (999px) · Brief ghost outline (Inter 16/400).
8. Fusya govde metni olarak: hub kirintisi (P 16px) ve Brief girisi (P 28px, 3 satir).
9. Token disi griler: #050505, #080808, #070707, #151515, #101010, rgb(9,9,9),
   rgba(255,255,255,.03), ve rgba(255,255,255,.68) proz sonumu (tokens.css bunu acikca yasakliyor).
10. Dikey ritim: 72 · 96 · 100.8 · 112 · 115.2 · 144 · 160px bolum dolgulari yan yana.
11. Dorduncu ses: Newsreader serif (who-we-are prozu 32px/1.2, partnersta dev sari alinti) --
    chapter gramerinde yok.
12. Numaralandirma rengi: chapter fusya 01, culture/solutions/what-we-believe sari, ana sayfa
    sari outline.

## D. ONCE HANGI SAYFALAR + EFOR

| Sira | Sayfa(lar) | Efor | Neden once |
|---|---|---|---|
| 1 | service-production + how-we-work | M | What We Do altindalar; kardeslerinin yaninda en goze batan kopukluk. ChapterHeroya tasi, gutter/olcek duzelt, TR govdeyi cevir |
| 2 | 6 legal + sustainability (tek PolicyPage/LegalPage) | S | Tek bilesen -> 7 sayfa birden duzelir. H1 tokena, gradyan cizgi kalksin, sola yasli izgara |
| 3 | culture + directors (paylasilan CSS) | S/M | Gutter 16->41 ve sari H1 -> beyaz+1 sari: iki satirlik degisiklik, etkisi buyuk |
| 4 | who-we-are + what-we-believe + partners (culture-page.module.css) | M | Tek dosya, 3 sayfa. 158px / -4.75px H1i olcege cek |
| 5 | solutions + brief | S | solutions: bosluk + olcek. brief: fusya govdeyi beyaza al, kolonu sola yasla |
| 6 | work + clients + contact | M | Heroda medya karari gerekiyor (tasarim karari, sadece CSS degil) |
| 7 | ai-creative-production | L | Hap butonlar + kendi olcegi + MONA produksiyonu; karar gerektirir |
| 8 | ana sayfa | M/L | Renk/his uyumlu ama display sesi farkli -- 3. maddedeki karara bagli |
| - | think-and-thank | L / kapsam disi | Kasitli magazin dunyasi; onerim korunmasi, yalniz gecis aninin (header/footer siniri) yumusatilmasi |

ONCE VERILMESI GEREKEN TEK KARAR: kanonik display sesi Space Grotesk mi Archivo mu?
Bu kapatilmadan 1-8 arasindaki islerin yarisi iki kez yapilir.

## E. TUTARSIZ DEGIL, BOZUK GORUNENLER

1. /tr/what-we-do/how-we-work -- TR rotasinda govde metni tamamen Ingilizce (a 30-minute call...),
   etiketler Turkce. CLAUDE.md: "Karisik dil yasak". Ayrica belirlenecek TBD cipi
   (messages/tr.json:438) satir icinde yayinda gorunuyor; musteriye placeholder gibi okunur.
2. /tr/what-we-do/creative CtaBand data-compact (72px), 6 kardesi 100.8px -- referans sayfa
   kendi ailesiyle tutarsiz.
3. Buyuk olu alanlar: clients hero ~600px · solutions hero ~330px · what-we-do hub hero ~300px ·
   directors bos durum -> CTA ~380px · live-broadcast dizin sonrasi ~200px.
4. /tr/work ve /tr/culture/directors yerelde hic detay baglantisi uretmiyor (Supabase yok);
   /tr/work/<slug> ve /tr/culture/directors/<slug> denetlenemedi. /tr/insights 308 redirect.
5. AI etiket cipi konumu tutarsiz: work heroda sag-ust, arsivde sol-alt; ana sayfa showreelinde
   sari metin + siyah kutu, workte beyaz cerceveli kutu.
6. MonaShard olcegi sayfadan sayfaya farkli: Creativede kosede hilal (spec), Digital ve
   Event Managementta neredeyse tam kure -- "MONAnin yarisi" kurali tutmuyor.

## F. EN ACIKLAYICI EKRAN GORUNTULERI

Hepsi: C:\Users\bekir\AppData\Local\Temp\claude\c--Users-bekir-HIBRID360\9bea5079-f7b9-4193-9daa-1e168a271b04\scratchpad\audit\design\

REFERANS
- tr_what-we-do_creative-d1.png  (hero: meta + 000 derece + kadran + hairline + beyaz/sari H1 + fusya lede cizgisi + MonaShard)
- tr_what-we-do_creative-d3.png  (ChapterNext + PrimaryCta + sari footer)
- tr_what-we-do_event-management-d1.png  (ayni dil, bagimsiz sayfa)
- tr_what-we-do_live-broadcast-d2.png  (fusya numarali ChapterIndex)
- tr_what-we-do_creative-m1.png  (mobil: dil korunuyor, gutter 20px)

EN BUYUK SAPMALAR
- tr_what-we-do_how-we-work-d1.png  (sari Archivo H1, gutter 16px, Ingilizce govde, belirlenecek cipi)
- tr_what-we-do_service-production-d1.png  (ayni ailede chapter disi sayfa)
- tr_what-we-do_ai-creative-production-d1.png  (radius 999px hap butonlar, H1 49px)
- tr_brief-d1.png  (fusya govde metni, ortali kolon)
- tr_culture-d1.png  (gutter 16px, sari H1, sari numaralar, daire buton)
- tr_who-we-are-d1.png  (158px sari H1 + Newsreader serif proz)
- tr_partners-d1.png  (dev sari serif alinti)
- tr_solutions-d1.png  (160px sari H1, hero ustunde 330px bosluk)
- tr_privacy-d1.png  (736px ortali kolon, 40px H1, fusya gradyan cizgi)
- tr_think-and-thank-d1.png  (krem magazin dunyasi)
- tr_work-d1.png  (heroda tam ekran fotograf, sari H1 + sari lede)
- tr_culture_directors-d1.png  (bos durum + 380px olu alan)
- tr_what-we-do-d1.png  (hub: fusya kirinti, 300px bosluk)
- tr-d1.png / tr-d3.png  (ana sayfa: Archivo display, sari outline 01/02/03)

## G. YONTEM

- Script: shoot.mjs (124 png + metrics-a.json / metrics-b.json), probe.mjs (bolum ritmi + proz),
  probe2.mjs (fusya metin, nav, footer). Hepsi bu klasorde.
- Consent context.addInitScript ile on-yuklendi (hibrid360-consent), cerez bandi icerigi ortmuyor.
- WebGL yazilim render (SwiftShader); her scroll durusundan sonra 2.5s beklendi.
- Dinamik slug sayfalari (/tr/work/<slug>, /tr/culture/directors/<slug>) yerelde veri olmadigi icin
  denetlenemedi; /tr/insights redirect ve /[...rest] kapsam disi birakildi.
