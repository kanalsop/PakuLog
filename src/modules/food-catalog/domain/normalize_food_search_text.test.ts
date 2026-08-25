import { normalizeFoodSearchText } from "./normalize_food_search_text";

describe("normalizeFoodSearchText", () => {
  it("matches a katakana query with a hiragana food name", () => {
    expect(normalizeFoodSearchText("サンマ")).toBe("さんま");
  });

  it("matches a half-width katakana query with a hiragana food name", () => {
    expect(normalizeFoodSearchText("ｻﾝﾏ")).toBe("さんま");
  });
});
