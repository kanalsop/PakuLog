type FoodWeight = Readonly<{
  decigrams: number;
}>;

type ParseFoodWeightResult =
  | Readonly<{ success: true; value: FoodWeight }>
  | Readonly<{ success: false }>;

export function parseFoodWeight(grams: string): ParseFoodWeightResult {
  if (!/^\d{1,4}(?:\.\d)?$/.test(grams)) {
    return { success: false };
  }

  const [wholeGrams, fractionalGram = "0"] = grams.split(".");
  const decigrams = Number(wholeGrams) * 10 + Number(fractionalGram);

  if (decigrams === 0) {
    return { success: false };
  }

  return {
    success: true,
    value: { decigrams },
  };
}
