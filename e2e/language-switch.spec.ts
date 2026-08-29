import { test, expect } from "@playwright/test";
import { acceptCookies } from "./utils";

test.describe("Dil değişimi", () => {
  test("TR sayfasından EN'e geçince aynı sayfada kalır", async ({ page }) => {
    await page.goto("/tr/what-we-do");
    await acceptCookies(page);
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");

    await page.getByRole("button", { name: "Dil" }).click();
    await page.getByRole("button", { name: "English", exact: false }).click();
    await expect(page).toHaveURL(/\/en\/what-we-do$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("EN sayfasından TR'ye dönüş de aynı sayfada kalır", async ({ page }) => {
    await page.goto("/en/contact");
    await acceptCookies(page);

    await page.getByRole("button", { name: "Language" }).click();
    await page.getByRole("button", { name: "Türkçe", exact: false }).click();
    await expect(page).toHaveURL(/\/tr\/contact$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  });
});
