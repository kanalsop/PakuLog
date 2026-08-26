import { parseAuthCredentials } from "./auth_credentials";

describe("parseAuthCredentials", () => {
  it("rejects an invalid email address before contacting authentication", () => {
    expect(parseAuthCredentials({ email: "not-an-email", password: "mealpass1" })).toEqual({
      success: false,
      fieldErrors: { email: ["有効なメールアドレスを入力してください"] },
    });
  });

  it("rejects a password shorter than eight characters", () => {
    expect(parseAuthCredentials({ email: "user@example.com", password: "meal1" })).toEqual({
      success: false,
      fieldErrors: { password: ["パスワードは8文字以上で入力してください"] },
    });
  });

  it("rejects a password that does not contain both letters and numbers", () => {
    expect(parseAuthCredentials({ email: "user@example.com", password: "mealpass" })).toEqual({
      success: false,
      fieldErrors: { password: ["パスワードには英字と数字を含めてください"] },
    });
  });

  it("preserves password whitespace as part of the credential", () => {
    expect(parseAuthCredentials({ email: " user@example.com ", password: " mealpass1 " })).toEqual({
      success: true,
      data: { email: "user@example.com", password: " mealpass1 " },
    });
  });
});
