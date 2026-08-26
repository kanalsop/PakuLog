import { expect, test } from "@playwright/test";

test("a user returns to meal entry after creating and reusing an account", async ({
  page,
}, testInfo) => {
  const projectName = testInfo.project.name.replaceAll(/[^a-z0-9]/g, "-");
  const email = `auth-${projectName}-${Date.now()}@example.com`;
  const password = "mealpass1";

  await page.goto("/meals/new?mealType=breakfast&from=e2e");

  await expect(page).toHaveURL(/\/login\?next=%2Fmeals%2Fnew%3FmealType%3Dbreakfast%26from%3De2e$/);
  await page.getByRole("link", { name: "アカウント作成" }).click();
  await page.waitForLoadState("networkidle");
  const signupEmail = page.getByRole("textbox", { name: "メールアドレス" });
  const signupPassword = page.getByLabel("パスワード");
  await signupEmail.fill(email);
  await signupPassword.fill(password);
  expect(await signupEmail.evaluate((element: HTMLInputElement) => element.checkValidity())).toBe(
    true,
  );
  expect(
    await signupPassword.evaluate((element: HTMLInputElement) => element.checkValidity()),
  ).toBe(true);
  await page.getByRole("button", { name: "アカウントを作成" }).click();

  await expect(page).toHaveURL(/\/meals\/new\?mealType=breakfast&from=e2e$/);
  await expect(page.getByRole("heading", { level: 1, name: "食事を記録" })).toBeVisible();

  await page.getByRole("button", { name: "ログアウト" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.waitForLoadState("networkidle");
  await page.getByRole("textbox", { name: "メールアドレス" }).fill(email);
  await page.getByLabel("パスワード").fill("wrongpass1");
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "メールアドレスまたはパスワードが正しくありません",
  );

  await page.getByLabel("パスワード").fill(password);
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL(/\/meals\/new\/type$/);
});
