import { type NextRequest } from "next/server";

import { handleAuthProxy } from "./modules/auth/infrastructure/auth_proxy";

export async function proxy(request: NextRequest) {
  return handleAuthProxy(request);
}

export const config = {
  matcher: ["/meals/:path*", "/login", "/signup"],
};
