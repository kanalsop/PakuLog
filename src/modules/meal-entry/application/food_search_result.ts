export type FoodSearchResult = Readonly<{
  id: number;
  name: string;
  categoryPath: readonly string[];
  descriptors: readonly string[];
}>;

const INVALID_RESPONSE_MESSAGE = "食品検索の応答形式が不正です";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function parseFoodSearchResult(value: unknown): FoodSearchResult {
  if (typeof value !== "object" || value === null) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  const item = value as Record<string, unknown>;

  if (
    typeof item.id !== "number" ||
    typeof item.name !== "string" ||
    !isStringArray(item.categoryPath) ||
    !isStringArray(item.descriptors)
  ) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  return {
    id: item.id,
    name: item.name,
    categoryPath: item.categoryPath,
    descriptors: item.descriptors,
  };
}

export function parseFoodSearchResults(value: unknown): FoodSearchResult[] {
  if (!Array.isArray(value)) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  return value.map(parseFoodSearchResult);
}
