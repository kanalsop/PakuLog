import { FoodNutrientsNotFoundError } from "../../../../../modules/meal-entry/infrastructure/get_food_nutrients";
import { createFoodNutrientsGet } from "./route";

type GetFoodNutrients = Parameters<typeof createFoodNutrientsGet>[0];

describe("GET /api/foods/[foodId]/nutrients", () => {
  it("returns the selected food nutrient profile", async () => {
    const profile = [
      {
        nutrientCode: "ENERC_KCAL",
        amountPer100gTenths: 2_870,
        unit: "kcal",
        valueKind: "measured",
      },
    ] as const;
    const getFoodNutrients = vi.fn<GetFoodNutrients>().mockResolvedValue(profile);
    const get = createFoodNutrientsGet(getFoodNutrients);

    const response = await get(new Request("http://localhost/api/foods/42/nutrients"), {
      params: Promise.resolve({ id: "42" }),
    });

    expect(getFoodNutrients).toHaveBeenCalledWith(42);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(profile);
  });

  it("rejects a food ID that is not a positive integer", async () => {
    const getFoodNutrients = vi.fn<GetFoodNutrients>();
    const get = createFoodNutrientsGet(getFoodNutrients);

    const response = await get(new Request("http://localhost/api/foods/food/nutrients"), {
      params: Promise.resolve({ id: "food" }),
    });

    expect(getFoodNutrients).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
  });

  it("returns not found when the food has no nutrient profile", async () => {
    const getFoodNutrients = vi
      .fn<GetFoodNutrients>()
      .mockRejectedValue(new FoodNutrientsNotFoundError("食品が見つかりません"));
    const get = createFoodNutrientsGet(getFoodNutrients);

    const response = await get(new Request("http://localhost/api/foods/42/nutrients"), {
      params: Promise.resolve({ id: "42" }),
    });

    expect(response.status).toBe(404);
  });

  it("returns service unavailable when the nutrient profile cannot be loaded", async () => {
    const getFoodNutrients = vi
      .fn<GetFoodNutrients>()
      .mockRejectedValue(new Error("database unavailable"));
    const get = createFoodNutrientsGet(getFoodNutrients);

    const response = await get(new Request("http://localhost/api/foods/42/nutrients"), {
      params: Promise.resolve({ id: "42" }),
    });

    expect(response.status).toBe(503);
  });
});
