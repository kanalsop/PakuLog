import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function requiredEnvironmentValue(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    requiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot write cookies; Proxy refreshes them before rendering.
          }
        },
      },
    },
  );
}
