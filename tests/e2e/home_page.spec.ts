import { expect, test } from "@playwright/test";

test("the home page introduces PakuLog", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "PakuLog" })).toBeVisible();
});
