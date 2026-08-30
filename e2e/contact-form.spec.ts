import { test, expect } from "@playwright/test";
import { acceptCookies } from "./utils";

test.describe("Contact formu", () => {
  test("boş zorunlu alanlarla tarayıcı doğrulaması gönderimi engeller", async ({
    page,
  }) => {
    await page.goto("/tr/contact");
    await acceptCookies(page);

    await page.getByRole("button", { name: "Gönder" }).click();

    // Native "required" doğrulaması JS submit handler'ını hiç çalıştırmaz —
    // ne hata ne başarı mesajı çıkar, form aynen kalır.
    await expect(page.getByText("Bir sorun oldu.")).toBeHidden();
    await expect(page.getByText("Teşekkürler")).toBeHidden();
    await expect(page.getByRole("button", { name: "Gönder" })).toBeVisible();
  });

  test("onay kutusu işaretlenmeden gönderilirse özel hata gösterir", async ({
    page,
  }) => {
    await page.goto("/tr/contact");
    await acceptCookies(page);

    await page.getByLabel("Adınız").fill("Test Kullanıcı");
    await page.getByLabel("E-posta").fill("test@example.com");
    await page.getByRole("button", { name: "Gönder" }).click();

    await expect(
      page.getByText("Devam etmek için onay kutucuğunu işaretlemelisiniz."),
    ).toBeVisible();
  });

  test("geçerli veri + onayla gönderim sunucu tarafında çökmeden yanıtlanır", async ({
    page,
  }) => {
    await page.goto("/tr/contact");
    await acceptCookies(page);

    await page.getByLabel("Adınız").fill("Test Kullanıcı");
    await page.getByLabel("E-posta").fill("test@example.com");
    // Apostrof kopyada tipografik (U+2019); test her iki biçimi de kabul
    // eder ki ileride metin rötuşunda sessizce kırılmasın.
    await page.getByLabel(/Gizlilik Politikası['’]nı/).check();
    await page.getByRole("button", { name: "Gönder" }).click();

    // Bu ortamda Supabase bağlı değil (env boş) — sunucu action zarifçe
    // "unconfigured" hatası döner (genel hata metni), hiçbir zaman ham
    // sunucu hatası/500 sayfası göstermez. Gerçek Supabase bağlandığında
    // bu yol "Teşekkürler…" başarı mesajına döner (bkz. src/lib/submissions.ts).
    await expect(page.getByText("Bir sorun oldu.")).toBeVisible();
  });
});
