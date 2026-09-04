import {
  parseFoodNutrientProfile,
  parseFoodNutrientProfileResponse,
} from "./food_nutrient_profile";

describe("parseFoodNutrientProfile", () => {
  it("parses six Supabase nutrient rows into one exact canonical profile", () => {
    expect(
      parseFoodNutrientProfile([
        {
          nutrient_code: "NACL_EQ",
          amount_per_100g: null,
          unit: "g",
          value_kind: "missing",
        },
        {
          nutrient_code: "PROT-",
          amount_per_100g: 18.1,
          unit: "g",
          value_kind: "estimated",
        },
        {
          nutrient_code: "ENERC_KCAL",
          amount_per_100g: 287,
          unit: "kcal",
          value_kind: "measured",
        },
        {
          nutrient_code: "FAT-",
          amount_per_100g: 25.6,
          unit: "g",
          value_kind: "measured",
        },
        {
          nutrient_code: "CHOCDF-",
          amount_per_100g: 0.1,
          unit: "g",
          value_kind: "measured",
        },
        {
          nutrient_code: "FIB-",
          amount_per_100g: null,
          unit: "g",
          value_kind: "trace",
        },
      ]),
    ).toEqual([
      {
        nutrientCode: "ENERC_KCAL",
        amountPer100gTenths: 2_870,
        unit: "kcal",
        valueKind: "measured",
      },
      {
        nutrientCode: "PROT-",
        amountPer100gTenths: 181,
        unit: "g",
        valueKind: "estimated",
      },
      {
        nutrientCode: "FAT-",
        amountPer100gTenths: 256,
        unit: "g",
        valueKind: "measured",
      },
      {
        nutrientCode: "CHOCDF-",
        amountPer100gTenths: 1,
        unit: "g",
        valueKind: "measured",
      },
      {
        nutrientCode: "FIB-",
        amountPer100gTenths: null,
        unit: "g",
        valueKind: "trace",
      },
      {
        nutrientCode: "NACL_EQ",
        amountPer100gTenths: null,
        unit: "g",
        valueKind: "missing",
      },
    ]);
  });
});

describe("parseFoodNutrientProfileResponse", () => {
  it("parses the public nutrient API response before it reaches the domain", () => {
    const response = [
      ["ENERC_KCAL", 2_870, "kcal", "measured"],
      ["PROT-", 181, "g", "measured"],
      ["FAT-", 256, "g", "measured"],
      ["CHOCDF-", 1, "g", "measured"],
      ["FIB-", null, "g", "trace"],
      ["NACL_EQ", null, "g", "missing"],
    ].map(([nutrientCode, amountPer100gTenths, unit, valueKind]) => ({
      nutrientCode,
      amountPer100gTenths,
      unit,
      valueKind,
    }));

    expect(parseFoodNutrientProfileResponse(response)).toHaveLength(6);
  });
});
