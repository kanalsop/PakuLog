import { NextRequest, NextResponse } from "next/server";

import { handleAuthProxy, type RefreshAuthSession } from "./auth_proxy";

describe("handleAuthProxy", () => {
  it("sends an unauthenticated meal request to login with its destination", async () => {
    const refreshSession = vi.fn<RefreshAuthSession>().mockResolvedValue({
      authenticated: false,
      response: NextResponse.next(),
    });

    const response = await handleAuthProxy(
      new NextRequest("http://localhost/meals/new?from=home"),
      refreshSession,
    );

    expect(response.headers.get("location")).toBe(
      "http://localhost/login?next=%2Fmeals%2Fnew%3Ffrom%3Dhome",
    );
  });

  it("preserves a refreshed session cookie on a redirect", async () => {
    const sessionResponse = NextResponse.next();
    sessionResponse.cookies.set("session", "refreshed", { httpOnly: true });
    const refreshSession = vi.fn<RefreshAuthSession>().mockResolvedValue({
      authenticated: false,
      response: sessionResponse,
    });

    const response = await handleAuthProxy(
      new NextRequest("http://localhost/meals/new"),
      refreshSession,
    );

    expect(response.cookies.get("session")?.value).toBe("refreshed");
  });

  it("uses the default meal page when an authenticated login has an external destination", async () => {
    const refreshSession = vi.fn<RefreshAuthSession>().mockResolvedValue({
      authenticated: true,
      response: NextResponse.next(),
    });

    const response = await handleAuthProxy(
      new NextRequest("http://localhost/login?next=https://example.com"),
      refreshSession,
    );

    expect(response.headers.get("location")).toBe("http://localhost/meals/new");
  });
});
