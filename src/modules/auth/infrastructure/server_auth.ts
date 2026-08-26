import { redirect } from "next/navigation";

import { type AuthenticatedUser } from "../application/current_user";
import { safeNextPath } from "../application/safe_next_path";
import { getCurrentUser } from "./get_current_user";

export async function requireCurrentUser(nextPath: string): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(safeNextPath(nextPath))}`);
  }

  return user;
}
