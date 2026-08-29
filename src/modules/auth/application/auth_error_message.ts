export type AuthOperation = "signIn" | "signUp";

export function authErrorMessage(code: string | undefined, operation: AuthOperation): string {
  if (operation === "signIn" && code === "invalid_credentials") {
    return "メールアドレスまたはパスワードが正しくありません";
  }

  if (operation === "signUp" && (code === "user_already_exists" || code === "email_exists")) {
    return "アカウントを作成できませんでした。登録済みの場合はログインしてください";
  }

  if (code === "over_request_rate_limit" || code === "over_email_send_rate_limit") {
    return "試行回数が多すぎます。しばらく時間をおいてからお試しください";
  }

  return "認証処理を完了できませんでした。時間をおいてもう一度お試しください";
}
