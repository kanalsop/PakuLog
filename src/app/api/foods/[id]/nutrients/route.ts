import { type FoodNutrient } from "../../../../../modules/meal-entry/domain/meal_nutrients";
import {
  FoodNutrientsNotFoundError,
  getFoodNutrientsInSupabase,
} from "../../../../../modules/meal-entry/infrastructure/get_food_nutrients";

type GetFoodNutrients = (foodId: number) => Promise<readonly FoodNutrient[]>;
type FoodNutrientsRouteContext = Readonly<{
  params: Promise<Readonly<{ id: string }>>;
}>;

export function createFoodNutrientsGet(getFoodNutrients: GetFoodNutrients) {
  return async function getSelectedFoodNutrients(
    _request: Request,
    context: FoodNutrientsRouteContext,
  ): Promise<Response> {
    const foodIdParameter = (await context.params).id;
    const foodId = Number(foodIdParameter);

    if (!/^[1-9]\d*$/.test(foodIdParameter) || !Number.isSafeInteger(foodId)) {
      return Response.json({ message: "食品IDが不正です" }, { status: 400 });
    }

    try {
      return Response.json(await getFoodNutrients(foodId));
    } catch (error) {
      if (error instanceof FoodNutrientsNotFoundError) {
        return Response.json({ message: "食品が見つかりません" }, { status: 404 });
      }

      return Response.json({ message: "食品栄養値を取得できませんでした" }, { status: 503 });
    }
  };
}

export const GET = createFoodNutrientsGet(getFoodNutrientsInSupabase);
