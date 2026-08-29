export interface AuthenticatedUser {
  id: string;
  email: string | null;
}

export interface CurrentUserGateway {
  getUser(): Promise<{ id: string; email?: string | null } | null>;
}

export async function readCurrentUser(
  gateway: CurrentUserGateway,
): Promise<AuthenticatedUser | null> {
  const user = await gateway.getUser();

  if (!user) {
    return null;
  }

  return { id: user.id, email: user.email ?? null };
}
