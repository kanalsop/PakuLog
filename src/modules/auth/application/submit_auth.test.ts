import { submitSignIn, submitSignUp, type AuthGateway } from "./submit_auth";

describe("submitSignIn", () => {
  it("does not contact authentication when credentials are invalid", async () => {
    const signIn = vi.fn<AuthGateway["signIn"]>();
    const gateway: AuthGateway = {
      signIn,
      signUp: vi.fn<AuthGateway["signUp"]>(),
    };

    await expect(
      submitSignIn(gateway, { email: "invalid", password: "mealpass1" }),
    ).resolves.toEqual({
      success: false,
      state: { fieldErrors: { email: ["有効なメールアドレスを入力してください"] } },
    });
    expect(signIn).not.toHaveBeenCalled();
  });

  it("does not report registration success without an authenticated session", async () => {
    const gateway: AuthGateway = {
      signIn: vi.fn<AuthGateway["signIn"]>(),
      signUp: vi.fn<AuthGateway["signUp"]>().mockResolvedValue({ sessionCreated: false }),
    };

    await expect(
      submitSignUp(gateway, { email: "user@example.com", password: "mealpass1" }),
    ).resolves.toEqual({
      success: false,
      state: {
        email: "user@example.com",
        message:
          "アカウントを作成しましたが、ログインを開始できませんでした。管理者へお問い合わせください",
      },
    });
  });

  it("preserves only the email address after authentication rejects a login", async () => {
    const gateway: AuthGateway = {
      signIn: vi
        .fn<AuthGateway["signIn"]>()
        .mockResolvedValue({ errorCode: "invalid_credentials" }),
      signUp: vi.fn<AuthGateway["signUp"]>(),
    };

    await expect(
      submitSignIn(gateway, { email: " user@example.com ", password: "wrongpass1" }),
    ).resolves.toEqual({
      success: false,
      state: {
        email: "user@example.com",
        message: "メールアドレスまたはパスワードが正しくありません",
      },
    });
  });
});
