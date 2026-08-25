import { type FoodSearchResult } from "../../../modules/meal-entry/application/food_search_result";
import { searchFoodsInSupabase } from "../../../modules/meal-entry/infrastructure/search_foods_in_supabase";

type SearchFoodCatalog = (query: string) => Promise<FoodSearchResult[]>;

export function createFoodSearchGet(searchFoodCatalog: SearchFoodCatalog) {
  return async function getFoodSearchResults(request: Request): Promise<Response> {
    const query = new URL(request.url).searchParams.get("q") ?? "";

    if (query.trim().length === 0) {
      return Response.json({ message: "食品名を入力してください" }, { status: 400 });
    }

    try {
      return Response.json(await searchFoodCatalog(query));
    } catch {
      return Response.json({ message: "食品を検索できませんでした" }, { status: 503 });
    }
  };
}

export const GET = createFoodSearchGet(searchFoodsInSupabase);
