import { expect, test } from "@playwright/test";

import { signUpTestUser } from "./support/authentication";

test.use({ timezoneId: "America/Los_Angeles" });

test.beforeEach(async ({ page }, testInfo) => {
  await signUpTestUser(page, testInfo, "/meals/new?mealType=breakfast");
});

function getCurrentJstDate(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Tokyo",
    year: "numeric",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

test("starts with the Japanese date in a browser using another timezone", async ({ page }) => {
  await expect(page.getByLabel("摂取日")).toHaveValue(getCurrentJstDate());
  await expect(page.getByLabel("摂取時刻（任意）")).toHaveValue("");
});

test("edits the optional consumed timing in the detailed entry", async ({ page }) => {
  await page.getByLabel("摂取日").fill("2026-08-20");
  await page.getByLabel("摂取時刻（任意）").fill("08:15");

  await expect(page.getByLabel("摂取日")).toHaveValue("2026-08-20");
  await expect(page.getByLabel("摂取時刻（任意）")).toHaveValue("08:15");

  await page.getByLabel("摂取時刻（任意）").fill("");
  await expect(page.getByLabel("摂取時刻（任意）")).toHaveValue("");
});
