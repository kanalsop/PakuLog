import { normalizeFoodSearchText } from "../../food-catalog/domain/normalize_food_search_text";
import { parseFoodSearchResult, type FoodSearchResult } from "./food_search_result";

type FoodSearchRpc = Readonly<{
  rpc: (
    functionName: "search_foods",
    arguments_: Readonly<{ query_text: string; result_limit: number }>,
  ) => PromiseLike<Readonly<{ data: unknown; error: Readonly<{ message: string }> | null }>>;
}>;

function parseFoodSearchRpcResults(value: unknown): FoodSearchResult[] {
  if (!Array.isArray(value)) {
    throw new Error("食品検索の応答形式が不正です");
  }

  return value.map((item) => {
    if (typeof item !== "object" || item === null) {
      throw new Error("食品検索の応答形式が不正です");
    }

    const row = item as Record<string, unknown>;

    return parseFoodSearchResult({
      id: row.id,
      name: row.name,
      categoryPath: row.category_path,
      descriptors: row.descriptors,
    });
  });
}

export async function searchFoods(
  client: FoodSearchRpc,
  query: string,
): Promise<FoodSearchResult[]> {
  const normalizedQuery = normalizeFoodSearchText(query).trim();

  if (normalizedQuery.length === 0) {
    return [];
  }

  const { data, error } = await client.rpc("search_foods", {
    query_text: normalizedQuery,
    result_limit: 20,
  });

  if (error) {
    throw new Error(`食品検索に失敗しました: ${error.message}`);
  }

  return parseFoodSearchRpcResults(data);
}
