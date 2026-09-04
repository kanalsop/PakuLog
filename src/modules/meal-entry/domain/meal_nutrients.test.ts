import {
  calculateMealNutrient,
  calculateMealNutrients,
  formatMealNutrientAmount,
} from "./meal_nutrients";

describe("calculateMealNutrient", () => {
  it("keeps a measured nutrient exact when calculating a 100 gram meal", () => {
    expect(
      calculateMealNutrient(
        {
          nutrientCode: "PROT-",
          amountPer100gTenths: 181,
          unit: "g",
          valueKind: "measured",
        },
        1_000,
      ),
    ).toEqual({
      nutrientCode: "PROT-",
      amountTenThousandths: 181_000,
      unit: "g",
      valueKind: "measured",
    });
  });

  it("preserves nonnumeric nutrient states without inventing amounts", () => {
    for (const valueKind of ["trace", "not_detected", "missing"] as const) {
      expect(
        calculateMealNutrient(
          {
            nutrientCode: "FIB-",
            amountPer100gTenths: null,
            unit: "g",
            valueKind,
          },
          1_000,
        ),
      ).toEqual({
        nutrientCode: "FIB-",
        amountTenThousandths: null,
        unit: "g",
        valueKind,
      });
    }
  });

  it("preserves the estimated origin during calculation", () => {
    expect(
      calculateMealNutrient(
        {
          nutrientCode: "FIB-",
          amountPer100gTenths: 0,
          unit: "g",
          valueKind: "estimated",
        },
        1_000,
      ).valueKind,
    ).toBe("estimated");
  });
});

describe("calculateMealNutrients", () => {
  it("calculates supported boundary weights without rounding", () => {
    const nutrient = {
      nutrientCode: "PROT-",
      amountPer100gTenths: 181,
      unit: "g",
      valueKind: "measured",
    } as const;

    expect(calculateMealNutrients([nutrient], 1)[0]?.amountTenThousandths).toBe(181);
    expect(calculateMealNutrients([nutrient], 99_999)[0]?.amountTenThousandths).toBe(18_099_819);
  });
});

describe("formatMealNutrientAmount", () => {
  it("rounds energy to a whole kilocalorie only for display", () => {
    const nutrient = {
      nutrientCode: "ENERC_KCAL",
      amountTenThousandths: 1_005_000,
      unit: "kcal",
      valueKind: "measured",
    } as const;

    expect(formatMealNutrientAmount(nutrient)).toBe("101");
    expect(nutrient.amountTenThousandths).toBe(1_005_000);
  });

  it("rounds gram nutrients to one decimal place only for display", () => {
    const nutrient = {
      nutrientCode: "PROT-",
      amountTenThousandths: 181_500,
      unit: "g",
      valueKind: "estimated",
    } as const;

    expect(formatMealNutrientAmount(nutrient)).toBe("18.2");
    expect(nutrient.amountTenThousandths).toBe(181_500);
  });

  it("displays every nonnumeric nutrient state as a dash", () => {
    for (const valueKind of ["trace", "not_detected", "missing"] as const) {
      expect(
        formatMealNutrientAmount({
          nutrientCode: "FIB-",
          amountTenThousandths: null,
          unit: "g",
          valueKind,
        }),
      ).toBe("ー");
    }
  });
});
