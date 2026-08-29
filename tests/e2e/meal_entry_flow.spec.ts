import { expect, test } from "@playwright/test";

import { signUpTestUser } from "./support/authentication";

test.beforeEach(async ({ page }, testInfo) => {
  await signUpTestUser(page, testInfo, "/meals/new/type");
});

test("chooses a meal type before opening the detailed meal entry", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "食事を記録する" }).click();
  await expect(page).toHaveURL("/meals/new/type");

  await page.getByRole("link", { name: "夜ご飯" }).click();

  await expect(page).toHaveURL("/meals/new?mealType=dinner");
  await expect(page.getByRole("radio", { name: "夜ご飯" })).toBeChecked();
});

test("returns URLs without one supported meal type to the selection", async ({ page }) => {
  for (const url of [
    "/meals/new",
    "/meals/new?mealType=brunch",
    "/meals/new?mealType=breakfast&mealType=lunch",
  ]) {
    await page.goto(url);
    await expect(page).toHaveURL("/meals/new/type");
  }
});

test("keeps detailed input when correcting the meal type", async ({ page }) => {
  await page.goto("/meals/new?mealType=breakfast");
  await page.getByRole("spinbutton", { name: "摂取量" }).fill("123.4");

  await page.getByText("間食", { exact: true }).click();

  await expect(page.getByRole("radio", { name: "間食" })).toBeChecked();
  await expect(page.getByRole("spinbutton", { name: "摂取量" })).toHaveValue("123.4");
});
