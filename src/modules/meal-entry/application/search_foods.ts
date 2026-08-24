import { normalizeFoodSearchText } from "../../food-catalog/domain/normalize_food_search_text";

export type FoodSearchResult = Readonly<{
  id: number;
  name: string;
  categoryPath: readonly string[];
  descriptors: readonly string[];
}>;

type FoodSearchRpc = Readonly<{
  rpc: (
    functionName: "search_foods",
    arguments_: Readonly<{ query_text: string; result_limit: number }>,
  ) => PromiseLike<Readonly<{ data: unknown; error: Readonly<{ message: string }> | null }>>;
}>;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function parseFoodSearchResults(value: unknown): FoodSearchResult[] {
  if (!Array.isArray(value)) {
    throw new Error("食品検索の応答形式が不正です");
  }

  return value.map((item) => {
    if (
      typeof item !== "object" ||
      item === null ||
      !("id" in item) ||
      typeof item.id !== "number" ||
      !("name" in item) ||
      typeof item.name !== "string" ||
      !("category_path" in item) ||
      !isStringArray(item.category_path) ||
      !("descriptors" in item) ||
      !isStringArray(item.descriptors)
    ) {
      throw new Error("食品検索の応答形式が不正です");
    }

    return {
      id: item.id,
      name: item.name,
      categoryPath: item.category_path,
      descriptors: item.descriptors,
    };
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

  return parseFoodSearchResults(data);
}
