import { createServerSupabaseClient } from "./server_supabase_client";
import { SupabaseAuthGateway } from "./supabase_auth_gateway";

export async function createServerAuthGateway(): Promise<SupabaseAuthGateway> {
  return new SupabaseAuthGateway(await createServerSupabaseClient());
}
