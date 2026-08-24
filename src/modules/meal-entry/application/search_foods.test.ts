import { searchFoods } from "./search_foods";

describe("searchFoods", () => {
  it("normalizes a katakana query before searching the Supabase catalog", async () => {
    const rpc = vi
      .fn<
        () => Promise<{
          data: unknown;
          error: { message: string } | null;
        }>
      >()
      .mockResolvedValue({
        data: [
          {
            id: 42,
            name: "さんま",
            category_path: ["魚介類", "魚類"],
            descriptors: ["皮つき", "生"],
          },
        ],
        error: null,
      });

    const result = await searchFoods({ rpc }, "サンマ");

    expect(rpc).toHaveBeenCalledWith("search_foods", {
      query_text: "さんま",
      result_limit: 20,
    });
    expect(result).toEqual([
      {
        id: 42,
        name: "さんま",
        categoryPath: ["魚介類", "魚類"],
        descriptors: ["皮つき", "生"],
      },
    ]);
  });

  it("rejects malformed records returned across the database boundary", async () => {
    const rpc = vi
      .fn<
        () => Promise<{
          data: unknown;
          error: { message: string } | null;
        }>
      >()
      .mockResolvedValue({ data: [{ id: "42", name: "さんま" }], error: null });

    await expect(searchFoods({ rpc }, "さんま")).rejects.toThrow("食品検索の応答形式が不正です");
  });
});
