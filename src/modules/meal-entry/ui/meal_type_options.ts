import type { MealType } from "../domain/meal_type";

export const MEAL_TYPE_OPTIONS: ReadonlyArray<
  Readonly<{ description: string; label: string; value: MealType }>
> = [
  { value: "breakfast", label: "朝食", description: "朝に食べたものを記録" },
  { value: "lunch", label: "昼食", description: "昼に食べたものを記録" },
  { value: "dinner", label: "夜ご飯", description: "夜に食べたものを記録" },
  { value: "snack", label: "間食", description: "間食やおやつを記録" },
];
