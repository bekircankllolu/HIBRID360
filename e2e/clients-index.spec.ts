import { expect, test } from "@playwright/test";
import { acceptCookies } from "./utils";

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
});
