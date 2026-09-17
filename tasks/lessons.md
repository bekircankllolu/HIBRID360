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
