export type MealNutrientCode = "ENERC_KCAL" | "PROT-" | "FAT-" | "CHOCDF-" | "FIB-" | "NACL_EQ";

export const MEAL_NUTRIENT_DEFINITIONS = [
  { nutrientCode: "ENERC_KCAL", label: "エネルギー", unit: "kcal" },
  { nutrientCode: "PROT-", label: "たんぱく質", unit: "g" },
  { nutrientCode: "FAT-", label: "脂質", unit: "g" },
  { nutrientCode: "CHOCDF-", label: "炭水化物", unit: "g" },
  { nutrientCode: "FIB-", label: "食物繊維", unit: "g" },
  { nutrientCode: "NACL_EQ", label: "食塩相当量", unit: "g" },
] as const satisfies readonly Readonly<{
  nutrientCode: MealNutrientCode;
  label: string;
  unit: "kcal" | "g";
}>[];

export type NumericNutrientValueKind = "measured" | "estimated";
export type NonnumericNutrientValueKind = "trace" | "not_detected" | "missing";

type NumericFoodNutrient = Readonly<{
  nutrientCode: MealNutrientCode;
  amountPer100gTenths: number;
  unit: "kcal" | "g";
  valueKind: NumericNutrientValueKind;
}>;

type NonnumericFoodNutrient = Readonly<{
  nutrientCode: MealNutrientCode;
  amountPer100gTenths: null;
  unit: "kcal" | "g";
  valueKind: NonnumericNutrientValueKind;
}>;

export type FoodNutrient = NumericFoodNutrient | NonnumericFoodNutrient;

type CalculatedNumericNutrient = Readonly<{
  nutrientCode: MealNutrientCode;
  amountTenThousandths: number;
  unit: "kcal" | "g";
  valueKind: NumericNutrientValueKind;
}>;

type CalculatedNonnumericNutrient = Readonly<{
  nutrientCode: MealNutrientCode;
  amountTenThousandths: null;
  unit: "kcal" | "g";
  valueKind: NonnumericNutrientValueKind;
}>;

export type CalculatedMealNutrient = CalculatedNumericNutrient | CalculatedNonnumericNutrient;

export function calculateMealNutrient(
  nutrient: FoodNutrient,
  decigrams: number,
): CalculatedMealNutrient {
  if (nutrient.amountPer100gTenths === null) {
    return {
      nutrientCode: nutrient.nutrientCode,
      amountTenThousandths: null,
      unit: nutrient.unit,
      valueKind: nutrient.valueKind,
    };
  }

  return {
    nutrientCode: nutrient.nutrientCode,
    amountTenThousandths: nutrient.amountPer100gTenths * decigrams,
    unit: nutrient.unit,
    valueKind: nutrient.valueKind,
  };
}

export function calculateMealNutrients(
  nutrients: readonly FoodNutrient[],
  decigrams: number,
): CalculatedMealNutrient[] {
  return nutrients.map((nutrient) => calculateMealNutrient(nutrient, decigrams));
}

export function formatMealNutrientAmount(nutrient: CalculatedMealNutrient): string {
  if (nutrient.amountTenThousandths === null) {
    return "ー";
  }

  if (nutrient.unit === "kcal") {
    return Math.floor((nutrient.amountTenThousandths + 5_000) / 10_000).toString();
  }

  const roundedTenths = Math.floor((nutrient.amountTenThousandths + 500) / 1_000);
  return (roundedTenths / 10).toFixed(1);
}
