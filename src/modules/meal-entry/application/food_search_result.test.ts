import { parseFoodSearchResults } from "./food_search_result";

describe("parseFoodSearchResults", () => {
  it("parses food search API results", () => {
    expect(
      parseFoodSearchResults([
        {
          id: 42,
          name: "さんま",
          categoryPath: ["魚介類", "魚類"],
          descriptors: ["皮つき", "生"],
        },
      ]),
    ).toEqual([
      {
        id: 42,
        name: "さんま",
        categoryPath: ["魚介類", "魚類"],
        descriptors: ["皮つき", "生"],
      },
    ]);
  });

  it("rejects malformed food search API results", () => {
    expect(() =>
      parseFoodSearchResults([
        {
          id: "42",
          name: "さんま",
          categoryPath: ["魚介類", "魚類"],
          descriptors: ["生"],
        },
      ]),
    ).toThrow("食品検索の応答形式が不正です");
  });
});
