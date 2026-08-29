import { authErrorMessage } from "./auth_error_message";

describe("authErrorMessage", () => {
  it("does not reveal whether a login identifier or password was wrong", () => {
    expect(authErrorMessage("invalid_credentials", "signIn")).toBe(
      "メールアドレスまたはパスワードが正しくありません",
    );
  });

  it("does not confirm that an account already exists during registration", () => {
    expect(authErrorMessage("user_already_exists", "signUp")).toBe(
      "アカウントを作成できませんでした。登録済みの場合はログインしてください",
    );
  });

  it("asks the user to wait after authentication is rate limited", () => {
    expect(authErrorMessage("over_request_rate_limit", "signIn")).toBe(
      "試行回数が多すぎます。しばらく時間をおいてからお試しください",
    );
  });

  it("hides details from an unknown authentication failure", () => {
    expect(authErrorMessage("provider_internal_detail", "signUp")).toBe(
      "認証処理を完了できませんでした。時間をおいてもう一度お試しください",
    );
  });
});
