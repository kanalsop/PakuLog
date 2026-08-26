import { cache } from "react";

import { readCurrentUser, type AuthenticatedUser } from "../application/current_user";
import { createServerAuthGateway } from "./server_auth_gateway";

export const getCurrentUser = cache(async (): Promise<AuthenticatedUser | null> => {
  return readCurrentUser(await createServerAuthGateway());
});
