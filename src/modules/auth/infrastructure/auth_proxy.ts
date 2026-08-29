import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { safeNextPath } from "../application/safe_next_path";

export type RefreshAuthSession = (
  request: NextRequest,
) => Promise<{ authenticated: boolean; response: NextResponse }>;

function redirectWithSessionCookies(url: URL, sessionResponse: NextResponse): NextResponse {
  const response = NextResponse.redirect(url);

  sessionResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));

  return response;
}

export async function handleAuthProxy(
  request: NextRequest,
  refreshSession: RefreshAuthSession = refreshSupabaseSession,
): Promise<NextResponse> {
  const { authenticated, response } = await refreshSession(request);
  const path = request.nextUrl.pathname;

  if (!authenticated && (path === "/meals" || path.startsWith("/meals/"))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${path}${request.nextUrl.search}`);
    return redirectWithSessionCookies(loginUrl, response);
  }

  if (authenticated && (path === "/login" || path === "/signup")) {
    return redirectWithSessionCookies(
      new URL(safeNextPath(request.nextUrl.searchParams.get("next")), request.url),
      response,
    );
  }

  return response;
}

function requiredEnvironmentValue(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

const refreshSupabaseSession: RefreshAuthSession = async (request) => {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    requiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();

  return { authenticated: Boolean(data?.claims), response };
};
