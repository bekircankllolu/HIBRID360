import { test, expect } from "@playwright/test";
import { acceptCookies } from "./utils";

test.describe("Brief Builder sihirbazı", () => {
  test("6 soru + özet + rıza kapılı gönderim akışı uçtan uca çalışır", async ({
    page,
  }) => {
    await page.goto("/tr/brief");
    await acceptCookies(page);

    await expect(page.getByText("Soru 1 / 6")).toBeVisible();
    await page.getByRole("button", { name: "Reklam filmi" }).click();
    await page.getByRole("button", { name: "İleri" }).click();

    await expect(page.getByText("Soru 2 / 6")).toBeVisible();
    await page
      .getByLabel("Marka adı ve hedef kitle")
      .fill("Test Marka / genç yetişkinler");
    await page.getByRole("button", { name: "İleri" }).click();

    await expect(page.getByText("Soru 3 / 6")).toBeVisible();
    await page.getByRole("button", { name: "2 hafta içinde" }).click();
    await page.getByRole("button", { name: "İleri" }).click();

    await expect(page.getByText("Soru 4 / 6")).toBeVisible();
    await page.getByRole("button", { name: "TV" }).click();
    await page.getByRole("button", { name: "İleri" }).click();

    await expect(page.getByText("Soru 5 / 6")).toBeVisible();
    await page.getByRole("button", { name: "Bilmiyorum" }).click();
    await page.getByRole("button", { name: "İleri" }).click();

    await expect(page.getByText("Soru 6 / 6")).toBeVisible();
    await page.getByLabel("Referans link").fill("https://example.com/ref");
    await page.getByLabel("E-posta").fill("brief-test@example.com");
    await page.getByRole("button", { name: "İleri" }).click();

    // Özet ekranı — rıza işaretlenmeden Gönder devre dışı.
    await expect(page.getByRole("heading", { name: "Özet" })).toBeVisible();
    const send = page.getByRole("button", { name: "Gönder" });
    await expect(send).toBeDisabled();

    await page.getByLabel(/KVKK aydınlatma metnini okudum/).check();
    await expect(send).toBeEnabled();

    await send.click();
    // Bu ortamda Supabase bağlı değil — zarif "unconfigured" hatası
    // (bkz. src/lib/submissions.ts), çökme veya ham hata yok.
    await expect(
      page.getByText("Form altyapısı henüz bağlanmadı"),
    ).toBeVisible();
  });

  test("geri butonu önceki soruya döner, ilerleme sayacı senkron kalır", async ({
    page,
  }) => {
    await page.goto("/tr/brief");
    await acceptCookies(page);

    await page.getByRole("button", { name: "Reklam filmi" }).click();
    await page.getByRole("button", { name: "İleri" }).click();
    await expect(page.getByText("Soru 2 / 6")).toBeVisible();

    await page.getByRole("button", { name: "Geri" }).click();
    await expect(page.getByText("Soru 1 / 6")).toBeVisible();
  });
});
