import {
  MEAL_NUTRIENT_DEFINITIONS,
  type FoodNutrient,
  type MealNutrientCode,
  type NonnumericNutrientValueKind,
  type NumericNutrientValueKind,
} from "../domain/meal_nutrients";

const INVALID_PROFILE_MESSAGE = "食品栄養値の応答形式が不正です";
const NUMERIC_VALUE_KINDS = new Set<NumericNutrientValueKind>(["measured", "estimated"]);
const NONNUMERIC_VALUE_KINDS = new Set<NonnumericNutrientValueKind>([
  "trace",
  "not_detected",
  "missing",
]);

function invalidProfile(): never {
  throw new Error(INVALID_PROFILE_MESSAGE);
}

function parseTenths(value: unknown): number {
  if (typeof value !== "number" && typeof value !== "string") {
    return invalidProfile();
  }

  const text = String(value);

  if (!/^\d+(?:\.\d)?$/.test(text)) {
    return invalidProfile();
  }

  const [whole, fraction = "0"] = text.split(".");
  const tenths = Number(whole) * 10 + Number(fraction);

  if (!Number.isSafeInteger(tenths)) {
    return invalidProfile();
  }

  return tenths;
}

function parseRow(value: unknown, expectedCode: MealNutrientCode, expectedUnit: "kcal" | "g") {
  if (typeof value !== "object" || value === null) {
    return invalidProfile();
  }

  const row = value as Record<string, unknown>;

  if (
    row.nutrient_code !== expectedCode ||
    row.unit !== expectedUnit ||
    typeof row.value_kind !== "string"
  ) {
    return invalidProfile();
  }

  if (NUMERIC_VALUE_KINDS.has(row.value_kind as NumericNutrientValueKind)) {
    return {
      nutrientCode: expectedCode,
      amountPer100gTenths: parseTenths(row.amount_per_100g),
      unit: expectedUnit,
      valueKind: row.value_kind as NumericNutrientValueKind,
    } satisfies FoodNutrient;
  }

  if (
    NONNUMERIC_VALUE_KINDS.has(row.value_kind as NonnumericNutrientValueKind) &&
    row.amount_per_100g === null
  ) {
    return {
      nutrientCode: expectedCode,
      amountPer100gTenths: null,
      unit: expectedUnit,
      valueKind: row.value_kind as NonnumericNutrientValueKind,
    } satisfies FoodNutrient;
  }

  return invalidProfile();
}

export function parseFoodNutrientProfile(value: unknown): FoodNutrient[] {
  if (!Array.isArray(value) || value.length !== MEAL_NUTRIENT_DEFINITIONS.length) {
    return invalidProfile();
  }

  const rowsByCode = new Map<unknown, unknown>();

  for (const row of value) {
    if (typeof row !== "object" || row === null) {
      return invalidProfile();
    }

    const nutrientCode = (row as Record<string, unknown>).nutrient_code;

    if (rowsByCode.has(nutrientCode)) {
      return invalidProfile();
    }

    rowsByCode.set(nutrientCode, row);
  }

  return MEAL_NUTRIENT_DEFINITIONS.map(({ nutrientCode, unit }) =>
    parseRow(rowsByCode.get(nutrientCode), nutrientCode, unit),
  );
}

export function parseFoodNutrientProfileResponse(value: unknown): FoodNutrient[] {
  if (!Array.isArray(value)) {
    return invalidProfile();
  }

  return parseFoodNutrientProfile(
    value.map((item) => {
      if (typeof item !== "object" || item === null) {
        return invalidProfile();
      }

      const row = item as Record<string, unknown>;
      const amountPer100gTenths = row.amountPer100gTenths;

      if (
        amountPer100gTenths !== null &&
        (!Number.isSafeInteger(amountPer100gTenths) || Number(amountPer100gTenths) < 0)
      ) {
        return invalidProfile();
      }

      return {
        nutrient_code: row.nutrientCode,
        amount_per_100g: amountPer100gTenths === null ? null : Number(amountPer100gTenths) / 10,
        unit: row.unit,
        value_kind: row.valueKind,
      };
    }),
  );
}
