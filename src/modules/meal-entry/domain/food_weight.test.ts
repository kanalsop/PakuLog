import { parseFoodWeight } from "./food_weight";

describe("parseFoodWeight", () => {
  it("represents one decimal place of grams as an integer number of decigrams", () => {
    expect(parseFoodWeight("100.1")).toEqual({
      success: true,
      value: { decigrams: 1001 },
    });
  });

  it("rejects a zero gram food weight", () => {
    expect(parseFoodWeight("0.0")).toEqual({ success: false });
  });

  it("rejects weights that cannot be represented by the five digit wheels", () => {
    for (const grams of ["", "-0.1", "0.01", "10000.0", "food"]) {
      expect(parseFoodWeight(grams)).toEqual({ success: false });
    }
  });
});
