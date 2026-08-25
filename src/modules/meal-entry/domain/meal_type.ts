const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

export type MealType = (typeof MEAL_TYPES)[number];

type ParseMealTypeResult =
  | Readonly<{ success: true; value: MealType }>
  | Readonly<{ success: false }>;

export function parseMealType(value: unknown): ParseMealTypeResult {
  const mealType = MEAL_TYPES.find((candidate) => candidate === value);

  return mealType ? { success: true, value: mealType } : { success: false };
}
