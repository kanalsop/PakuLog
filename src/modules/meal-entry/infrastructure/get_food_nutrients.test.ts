import { FoodNutrientsNotFoundError, getFoodNutrients } from "./get_food_nutrients";

type FoodNutrientDataSource = Parameters<typeof getFoodNutrients>[0];

describe("getFoodNutrients", () => {
  it("loads the six meal nutrients for the selected food", async () => {
    const data = [
      ["ENERC_KCAL", 287, "kcal", "measured"],
      ["PROT-", 18.1, "g", "measured"],
      ["FAT-", 25.6, "g", "measured"],
      ["CHOCDF-", 0.1, "g", "measured"],
      ["FIB-", 0, "g", "estimated"],
      ["NACL_EQ", 0.4, "g", "measured"],
    ].map(([nutrient_code, amount_per_100g, unit, value_kind]) => ({
      nutrient_code,
      amount_per_100g,
      unit,
      value_kind,
    }));
    const loadFoodNutrientRows = vi
      .fn<FoodNutrientDataSource["loadFoodNutrientRows"]>()
      .mockResolvedValue({ data, error: null });

    const result = await getFoodNutrients({ loadFoodNutrientRows }, 42);

    expect(loadFoodNutrientRows).toHaveBeenCalledWith(42, [
      "ENERC_KCAL",
      "PROT-",
      "FAT-",
      "CHOCDF-",
      "FIB-",
      "NACL_EQ",
    ]);
    expect(result).toHaveLength(6);
  });

  it("reports when the selected food does not exist", async () => {
    const loadFoodNutrientRows = vi
      .fn<FoodNutrientDataSource["loadFoodNutrientRows"]>()
      .mockResolvedValue({ data: [], error: null });

    await expect(getFoodNutrients({ loadFoodNutrientRows }, 42)).rejects.toBeInstanceOf(
      FoodNutrientsNotFoundError,
    );
  });

  it("reports a Supabase failure without returning partial data", async () => {
    const loadFoodNutrientRows = vi
      .fn<FoodNutrientDataSource["loadFoodNutrientRows"]>()
      .mockResolvedValue({
        data: null,
        error: { message: "database unavailable" },
      });

    await expect(getFoodNutrients({ loadFoodNutrientRows }, 42)).rejects.toThrow(
      "食品栄養値の取得に失敗しました: database unavailable",
    );
  });

  it("rejects an incomplete nutrient profile from Supabase", async () => {
    const loadFoodNutrientRows = vi
      .fn<FoodNutrientDataSource["loadFoodNutrientRows"]>()
      .mockResolvedValue({
        data: [
          {
            nutrient_code: "ENERC_KCAL",
            amount_per_100g: 287,
            unit: "kcal",
            value_kind: "measured",
          },
        ],
        error: null,
      });

    await expect(getFoodNutrients({ loadFoodNutrientRows }, 42)).rejects.toThrow(
      "食品栄養値の応答形式が不正です",
    );
  });
});
