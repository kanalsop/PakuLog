import { type Page, type TestInfo } from "@playwright/test";

const TEST_PASSWORD = "mealpass1";

export async function signUpTestUser(
  page: Page,
  testInfo: TestInfo,
  nextPath: string,
): Promise<void> {
  const projectName = testInfo.project.name.replaceAll(/[^a-z0-9]/g, "-");
  const email = `e2e-${projectName}-${testInfo.workerIndex}-${Date.now()}@example.com`;

  await page.goto(`/signup?${new URLSearchParams({ next: nextPath })}`);
  await page.waitForLoadState("networkidle");
  await page.getByRole("textbox", { name: "メールアドレス" }).fill(email);
  await page.getByLabel("パスワード").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "アカウントを作成" }).click();
  await page.waitForURL((url) => `${url.pathname}${url.search}` === nextPath);
}
