import { createClient } from "@supabase/supabase-js";

import { parseFoodNutrientProfile } from "../application/food_nutrient_profile";
import { MEAL_NUTRIENT_DEFINITIONS, type FoodNutrient } from "../domain/meal_nutrients";

type FoodNutrientTableClient = Readonly<{
  loadFoodNutrientRows: (
    foodId: number,
    nutrientCodes: readonly string[],
  ) => PromiseLike<
    Readonly<{
      data: unknown;
      error: Readonly<{ message: string }> | null;
    }>
  >;
}>;

export class FoodNutrientsNotFoundError extends Error {}

export async function getFoodNutrients(
  client: FoodNutrientTableClient,
  foodId: number,
): Promise<FoodNutrient[]> {
  const nutrientCodes = MEAL_NUTRIENT_DEFINITIONS.map(({ nutrientCode }) => nutrientCode);
  const { data, error } = await client.loadFoodNutrientRows(foodId, nutrientCodes);

  if (error) {
    throw new Error(`食品栄養値の取得に失敗しました: ${error.message}`);
  }

  if (Array.isArray(data) && data.length === 0) {
    throw new FoodNutrientsNotFoundError("食品が見つかりません");
  }

  return parseFoodNutrientProfile(data);
}

function requiredEnvironmentValue(primaryName: string, fallbackName: string): string {
  const value = process.env[primaryName] ?? process.env[fallbackName];

  if (!value) {
    throw new Error(`${primaryName} is required`);
  }

  return value;
}

export async function getFoodNutrientsInSupabase(foodId: number): Promise<FoodNutrient[]> {
  const url = requiredEnvironmentValue("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
  const publishableKey = requiredEnvironmentValue(
    "SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
  const client = createClient(url, publishableKey, {
    auth: { persistSession: false },
  });

  return getFoodNutrients(
    {
      loadFoodNutrientRows: async (selectedFoodId, nutrientCodes) => {
        const { data, error } = await client
          .from("food_nutrients")
          .select("nutrient_code,amount_per_100g,unit,value_kind")
          .eq("food_id", selectedFoodId)
          .in("nutrient_code", [...nutrientCodes]);

        return {
          data,
          error: error ? { message: error.message } : null,
        };
      },
    },
    foodId,
  );
}
