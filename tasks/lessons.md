# Lessons

Kullanıcı düzeltmelerinden çıkan kurallar. Oturum başında ilgili olanları oku.

## Görsel doğrulama tüm sayfayı kapsar (13 Eylül 2026, Creative 6. tur)

**Hata:** Yalnızca sayfa açılışının ekran görüntüsünü aldım. Kullanıcı iki sorunu
kendisi buldu: hero'daki MONA canvas'ı kaydırınca altından düz bir çizgiyle
kesiliyordu, sayfa geneli nokta katmanı (MonaDrift) sarı footer'ın üstüne
taşıyordu.

**Kural:** Canvas, sticky ya da taşan bir katman ekledikten veya
değiştirdikten sonra birkaç scroll konumunda ekran görüntüsü al. Katmanın
alt kenarının görünür olduğu konum mutlaka dahil olsun. Footer'a kadar
tüm sayfayı çek.

## "Aynı mekanikler" = var olan motoru yeniden kullan (Creative 3. tur)

**Hata:** "MONA'nın yarısını görücez, aynı mekanikler geçerli" isteğine
Canvas 2D ile yeni bir nokta kümesi icat ettim. Kullanıcı reddetti: "bu ne?
ben böyle bir şey tarif etmedim".

**Kural:** Kullanıcı var olan bir şeyi başka yerde istediğinde önce onun
kendi bileşenini/motorunu yeniden kullan. Yeni yaklaşım icat etmeden önce
görsel olarak ne kastettiğini teyit et.

## Opak WebGL canvas'ı komşu bölüme taşırsa boyama sırası değişir (Creative 5.–6. tur)

**Hata:** `alpha:false` canvas mutlak konumlu olduğu için konumlanmamış
metnin ÜSTÜNE boyanıyordu. Önce başlığın "Y"sini örttü. Uzantıdan sonra da
manifesto kelimelerini örtecekti; yalnız tam yanmış olanları, çünkü <1
opaklık kendi katmanını açıyor.

**Kural:** Opak bir canvas bir metnin alanına giriyorsa, o metnin kabına
`position: relative` (gerekirse `z-index`) ver. Ekran görüntüsüyle doğrula.

## Hazır bileşen promptları projeye uyarlanır, olduğu gibi yapıştırılmaz (Creative 6. tur)

21st.dev / shadcn promptları Tailwind + shadcn varsayar. Bu projede Tailwind
kurmak bütün sayfaların temel stilini sıfırlar. Efekti CSS Modules'e çevir;
demo metnini, lorem'i ve dış CDN görsellerini alma. Hedef eleman değişince
(ör. ekran boyu bölüm → görselin kendisi) scroll offset'lerinin anlamı da
değişir. Değerleri körü körüne taşıma, ölçüp aynı hissi ver.

## Müşteri incelemesi Faz 1 (20 Eylül 2026): sürükleme, önbellek, font yüklenirken düzen

**Sürükleme takılı kalıyordu.** `pointerdown`'da hemen `setPointerCapture` çağırmak
düğmelerin `click`'ini öldürür; sürükleme hiç başlamadan yakalama alınmamalı. Kural:
yakalamayı yalnız eşik (6 px) aşılınca al; `pointermove`'da `event.buttons === 0` ise
sürüklemeyi bitir; `window`'a `pointerup`/`pointercancel`/`blur` yedeği ekle. Sürükleme
alanı görünen sistemin tamamı olsun (başlık bölgesi de), yalnız kutusu değil. Sürükleme
sonrası kamera "yumuşakça varsayılana dönsün" isteniyorsa ölçümü piksel farkıyla değil
`data-*` özniteliğiyle yap (kamera dönünce piksel ölçümü geçersizleşir).

**`public/` dosyalarına uzun `Cache-Control` verme.** Müşteri incelemesi sürerken aynı
adla değişen bir dosya (MONA sesi, showreel) günlerce eski görünür. Font 7 gün, medya
1 saat + `stale-while-revalidate`; bir varlığı DEĞİŞTİRİRKEN yeni adla ekle (`-20260920`).

**Font yüklenirken düzen: `ch` kullanma.** `max-width: 10ch` yedek fontla gerçek fontta
farklı genişlik verir (`ch` = "0" glifi) ve başlık iki durumda ayrı yerlerden satır kırar.
Fonta duyarlı kutularda `em`; yedek font yüzünde `size-adjust` + `ascent/descent-override`
(`size-adjust`'a BÖLÜNMÜŞ) gerçek tarayıcıda ölçülerek verilir, xAvgCharWidth'ten hesaplanmaz.
Karıştırma (scramble) efektinde her kelimenin yuvası nihai genişlikte rezerve edilir.

**Playwright `aria-disabled` düğmeye tıklamaz.** "Etkin değil" sayar; ekran okuyucu için
`aria-disabled` bilinçli seçildiyse testte `click({ force: true })` kullan.

**Sahneyi/medyayı önden çekerken sayfa yüklenişine dokunma.** Önden çekme, bölüm
ekrana 1,5 ekran kala başlar; ana sayfada bölüm ~4,8 ekran aşağıda olduğundan yükleme
anında hiçbir şey inmez (ölçüldü). Bu mesafe değişirse tekrar ölç.

**Kabuk heredoc'unda sınırlayıcıyı HER ZAMAN tırnakla (`<<'EOF'`).** Tırnaksız `<<EOF`/`<<PY`
içindeki `` `...` `` komut olarak ÇALIŞIR: markdown metnindeki `` `tasks/todo.md` `` bir kabuk
betiği gibi yürütüldü (zararsız çıktı ama tesadüf) ve metinden kelimeler kayboldu. Metin
backtick/`$` içeriyorsa dosyayı Write aracıyla yaz ya da tırnaklı heredoc kullan.

**Kod incelemesinden çıkanlar (Faz 1).** (1) `touch-action: pan-y` iki parmakla yakınlaştırmayı
kapatır (WCAG 1.4.4): sürükleme alanı büyüyünce `pan-y pinch-zoom` yaz. (2) Bir asenkron işin
SONUCUNU (hata dahil) `ref ??=` ile kalıcı önbelleğe alma: tek kopan indirme oturumu boyunca
özelliği öldürür; söz yalnız devam ederken paylaşılsın, bitince temizlensin, hata geçici ise
kullanıcıya "tekrar dene" göster (kalıcı "kullanılamıyor" yalnız gerçekten desteklenmiyorsa).
(3) `Math.max(96, box.y - 30)` gibi kelepçe testin işaret ettiği noktayı sessizce kutunun İÇİNE
çekebilir ve test boşa geçer; noktayı sahnenin dışında olduğunu `elementFromPoint` ile DOĞRULA,
gerekirse sayfayı kaydır. (4) Yedek fontun `size-adjust`'ını değiştirince aynı fontu kullanan
BÜTÜN `ch` tabanlı kutuları tara (`grep -rn "[0-9]ch"` + `font-family`), yalnız tek dosyayı değil.
(5) Kurulum yarıda patlarsa (istisna) elde `dispose` yoktur: yarım kalan GPU kaynaklarını ve
dinleyicileri bırakacak bir temizlik listesi tut (kademe merdiveninde her deneme aynı canvas'ı kullanır).
