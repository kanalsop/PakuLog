import { parseMealType } from "./meal_type";

describe("parseMealType", () => {
  it("accepts each meal type offered by the meal entry flow", () => {
    expect(["breakfast", "lunch", "dinner", "snack"].map(parseMealType)).toEqual([
      { success: true, value: "breakfast" },
      { success: true, value: "lunch" },
      { success: true, value: "dinner" },
      { success: true, value: "snack" },
    ]);
  });

  it("rejects values that are not one supported meal type", () => {
    for (const value of [undefined, "", "brunch", ["breakfast", "lunch"]]) {
      expect(parseMealType(value)).toEqual({ success: false });
    }
  });
});
