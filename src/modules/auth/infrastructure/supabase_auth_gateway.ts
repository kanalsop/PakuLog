import { type AuthCredentials } from "../application/auth_credentials";
import { type AuthGateway } from "../application/submit_auth";

interface SupabaseAuthError {
  code?: string;
}

export interface SupabaseAuthClient {
  auth: {
    getUser(): Promise<{
      data: { user: { id: string; email?: string | null } | null };
      error: SupabaseAuthError | null;
    }>;
    signInWithPassword(credentials: AuthCredentials): Promise<{ error: SupabaseAuthError | null }>;
    signOut(options: { scope: "local" }): Promise<{ error: SupabaseAuthError | null }>;
    signUp(credentials: AuthCredentials): Promise<{
      data: { session: object | null };
      error: SupabaseAuthError | null;
    }>;
  };
}

export class SupabaseAuthGateway implements AuthGateway {
  constructor(private readonly client: SupabaseAuthClient) {}

  async signIn(credentials: AuthCredentials): Promise<{ errorCode?: string }> {
    const { error } = await this.client.auth.signInWithPassword(credentials);

    return error?.code ? { errorCode: error.code } : {};
  }

  async signUp(
    credentials: AuthCredentials,
  ): Promise<{ errorCode?: string; sessionCreated: boolean }> {
    const { data, error } = await this.client.auth.signUp(credentials);

    return {
      ...(error?.code ? { errorCode: error.code } : {}),
      sessionCreated: data.session !== null,
    };
  }

  async getUser(): Promise<{ id: string; email?: string | null } | null> {
    const { data, error } = await this.client.auth.getUser();

    return error ? null : data.user;
  }

  async signOut(): Promise<{ errorCode?: string }> {
    const { error } = await this.client.auth.signOut({ scope: "local" });

    return error?.code ? { errorCode: error.code } : {};
  }
}
