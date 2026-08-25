import { createClient } from "@supabase/supabase-js";

import { type FoodSearchResult } from "../application/food_search_result";
import { searchFoods } from "../application/search_foods";

function requiredEnvironmentValue(primaryName: string, fallbackName: string): string {
  const value = process.env[primaryName] ?? process.env[fallbackName];

  if (!value) {
    throw new Error(`${primaryName} is required`);
  }

  return value;
}

export async function searchFoodsInSupabase(query: string): Promise<FoodSearchResult[]> {
  const url = requiredEnvironmentValue("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
  const publishableKey = requiredEnvironmentValue(
    "SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
  const client = createClient(url, publishableKey, {
    auth: { persistSession: false },
  });

  return searchFoods(
    {
      rpc: async (functionName, arguments_) => {
        const { data, error } = await client.rpc(functionName, arguments_);

        return {
          data,
          error: error ? { message: error.message } : null,
        };
      },
    },
    query,
  );
}
