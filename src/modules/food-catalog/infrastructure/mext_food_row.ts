import { normalizeFoodSearchText } from "../domain/normalize_food_search_text";

const FOOD_GROUP_NAMES: Readonly<Record<string, string>> = {
  "01": "穀類",
  "02": "いも及びでん粉類",
  "03": "砂糖及び甘味類",
  "04": "豆類",
  "05": "種実類",
  "06": "野菜類",
  "07": "果実類",
  "08": "きのこ類",
  "09": "藻類",
  "10": "魚介類",
  "11": "肉類",
  "12": "卵類",
  "13": "乳類",
  "14": "油脂類",
  "15": "菓子類",
  "16": "し好飲料類",
  "17": "調味料及び香辛料類",
  "18": "調理済み流通食品類",
};

type MextNutrientInput = Readonly<{
  code: string;
  unit: string;
  sourceValue: string;
}>;

type MextFoodRowInput = Readonly<{
  groupCode: string;
  sourceCode: string;
  sourceName: string;
  remark: string;
  nutrients: readonly MextNutrientInput[];
}>;

type NutrientValueKind = "measured" | "estimated" | "trace" | "missing";

function parseNutrientValue(sourceValue: string): Readonly<{
  amountPer100g: number | null;
  valueKind: NutrientValueKind;
}> {
  const value = sourceValue.trim();

  if (value === "-" || value.length === 0) {
    return { amountPer100g: null, valueKind: "missing" };
  }

  if (value === "Tr" || value === "(Tr)") {
    return { amountPer100g: null, valueKind: "trace" };
  }

  const estimated = value.startsWith("(") && value.endsWith(")");
  const numericValue = Number(estimated ? value.slice(1, -1) : value);

  if (!Number.isFinite(numericValue)) {
    return { amountPer100g: null, valueKind: "missing" };
  }

  return {
    amountPer100g: numericValue,
    valueKind: estimated ? "estimated" : "measured",
  };
}

function extractAliases(remark: string): string[] {
  const aliasMatch = remark.match(/別名[：:]\s*([^\n]+)/);

  return aliasMatch?.[1]?.split(/[、,]/).map((alias) => alias.trim()) ?? [];
}

export function parseMextFoodRow(input: MextFoodRowInput) {
  const sourceNameParts = input.sourceName.split(/[\s　]+/).filter(Boolean);
  const categoryMarkers = sourceNameParts.filter(
    (part) =>
      (part.startsWith("＜") && part.endsWith("＞")) ||
      (part.startsWith("<") && part.endsWith(">")),
  );
  const foodNameParts = sourceNameParts.filter((part) => !categoryMarkers.includes(part));
  const name = foodNameParts[0] ?? input.sourceName;
  const categoryPath = [
    FOOD_GROUP_NAMES[input.groupCode] ?? input.groupCode,
    ...categoryMarkers.map((marker) => marker.slice(1, -1)),
  ];
  const candidateSearchTerms = [name, input.sourceName, ...extractAliases(input.remark)];
  const searchTerms = [...new Set(candidateSearchTerms.map(normalizeFoodSearchText))];

  return {
    sourceCode: input.sourceCode,
    name,
    categoryPath,
    descriptors: foodNameParts.slice(1),
    searchTerms,
    nutrients: input.nutrients.map((nutrient) => ({
      nutrientCode: nutrient.code,
      ...parseNutrientValue(nutrient.sourceValue),
      unit: nutrient.unit,
      sourceValue: nutrient.sourceValue,
    })),
  };
}
