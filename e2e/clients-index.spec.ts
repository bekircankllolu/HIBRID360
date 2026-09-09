import { expect, test } from "@playwright/test";
import { acceptCookies } from "./utils";
import { clients, newClients, SHOW_NEW_CLIENTS } from "../src/data/clients";

const INDEX = 'section[class*="ClientNameIndex_index"]';
const NAMES = 'ul[class*="ClientNameIndex_names"]';

test.describe("Clients typographic index", () => {
  test("all brands render without bordered boxes", async ({ page }) => {
    await page.goto("/tr/clients");
    await acceptCookies(page);

    const names = page.locator(`${NAMES} li`);
    expect(await names.count()).toBeGreaterThan(50);

    const firstStyle = await names.first().evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        background: style.backgroundColor,
        borderTop: style.borderTopWidth,
        borderRight: style.borderRightWidth,
        borderBottom: style.borderBottomWidth,
        borderLeft: style.borderLeftWidth,
      };
    });

    expect(firstStyle).toEqual({
      background: "rgba(0, 0, 0, 0)",
      borderTop: "0px",
      borderRight: "0px",
      borderBottom: "0px",
      borderLeft: "0px",
    });
  });

  test("alphabetic rail filters the visible names", async ({ page }) => {
    await page.goto("/en/clients");
    await acceptCookies(page);

    const index = page.locator(INDEX);
    const names = index.locator("li");
    const allCount = await names.count();

    await index.getByRole("button", { name: "A-F" }).click();
    await expect(index.getByRole("button", { name: "A-F" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    const filteredCount = await names.count();
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThan(allCount);

    await index.getByRole("button", { name: "All" }).click();
    await expect(names).toHaveCount(allCount);
  });

  test("all names remain available without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/tr/clients");

    const names = page.locator(`${NAMES} li`);
    expect(await names.count()).toBeGreaterThan(50);
    await expect(names.first()).toBeVisible();
    await expect(names.last()).toBeVisible();

    await context.close();
  });

  /**
   * FRD-03 (docs/DECISIONS.md #30) — müşteri yeni markaların görünür
   * kalmasına karar verdi, SHOW_NEW_CLIENTS false'a geri alınmayacak.
   * Bu regresyon testi bayrağın kendisini ve iki örnek yeni markanın
   * (dizinin başı/sonu) gerçekten DOM'a render edildiğini doğruluyor —
   * "isim sayısı > 50" testi tek başına bunu yakalamaz, çünkü onaylı
   * `clients` listesi zaten 50'den fazla.
   */
  for (const locale of ["tr", "en"] as const) {
    test(`${locale}: new client names render when SHOW_NEW_CLIENTS is true`, async ({
      page,
    }) => {
      expect(SHOW_NEW_CLIENTS).toBe(true);
      expect(newClients.length).toBeGreaterThan(0);

      await page.goto(`/${locale}/clients`);
      await acceptCookies(page);

      const names = page.locator(`${NAMES} li`);
      for (const sample of [newClients[0], newClients.at(-1)!]) {
        await expect(
          names.filter({ hasText: sample }),
        ).toHaveCount(1);
      }
    });
  }

  test("mobile (390px): index stays unclipped with the new client names included", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/tr/clients");
    await acceptCookies(page);

    const expectedCount =
      clients.filter((client) => client.verified).length +
      (SHOW_NEW_CLIENTS ? newClients.length : 0);

    const names = page.locator(`${NAMES} li`);
    // clients (verified) + newClients — bayrak true iken toplam sayı bunu
    // birebir yansıtmalı, mobilde de kırpılıp gizlenmemeli.
    await expect(names).toHaveCount(expectedCount);

    const index = page.locator(INDEX);
    const overflowing = await index.evaluate(
      (el) => el.scrollWidth > el.clientWidth + 1,
    );
    expect(overflowing).toBe(false);

    await expect(names.filter({ hasText: newClients[0] })).toBeVisible();
  });
});
