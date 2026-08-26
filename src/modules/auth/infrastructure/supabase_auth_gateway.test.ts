import { SupabaseAuthGateway, type SupabaseAuthClient } from "./supabase_auth_gateway";

describe("SupabaseAuthGateway", () => {
  it("reports that registration created an authenticated session", async () => {
    const client: SupabaseAuthClient = {
      auth: {
        getUser: vi.fn<SupabaseAuthClient["auth"]["getUser"]>(),
        signInWithPassword: vi.fn<SupabaseAuthClient["auth"]["signInWithPassword"]>(),
        signOut: vi.fn<SupabaseAuthClient["auth"]["signOut"]>(),
        signUp: vi
          .fn<SupabaseAuthClient["auth"]["signUp"]>()
          .mockResolvedValue({ data: { session: { access_token: "token" } }, error: null }),
      },
    };
    const gateway = new SupabaseAuthGateway(client);

    await expect(
      gateway.signUp({ email: "user@example.com", password: "mealpass1" }),
    ).resolves.toEqual({ sessionCreated: true });
  });

  it("logs out only the current session", async () => {
    const signOut = vi
      .fn<SupabaseAuthClient["auth"]["signOut"]>()
      .mockResolvedValue({ error: null });
    const client: SupabaseAuthClient = {
      auth: {
        getUser: vi.fn<SupabaseAuthClient["auth"]["getUser"]>(),
        signInWithPassword: vi.fn<SupabaseAuthClient["auth"]["signInWithPassword"]>(),
        signOut,
        signUp: vi.fn<SupabaseAuthClient["auth"]["signUp"]>(),
      },
    };

    await new SupabaseAuthGateway(client).signOut();

    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
  });
});
