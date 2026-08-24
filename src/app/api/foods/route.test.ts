import { type FoodSearchResult } from "../../../modules/meal-entry/application/search_foods";
import { createFoodSearchGet } from "./route";

describe("GET /api/foods", () => {
  it("returns the food catalog matches for the requested query", async () => {
    const search = vi.fn<(query: string) => Promise<FoodSearchResult[]>>().mockResolvedValue([
      {
        id: 42,
        name: "さんま",
        categoryPath: ["魚介類", "魚類"],
        descriptors: ["皮つき", "生"],
      },
    ]);
    const get = createFoodSearchGet(search);

    const response = await get(new Request("http://localhost/api/foods?q=サンマ"));

    expect(search).toHaveBeenCalledWith("サンマ");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      {
        id: 42,
        name: "さんま",
        categoryPath: ["魚介類", "魚類"],
        descriptors: ["皮つき", "生"],
      },
    ]);
  });

  it("does not query Supabase for a blank food name", async () => {
    const search = vi.fn<(query: string) => Promise<FoodSearchResult[]>>();
    const get = createFoodSearchGet(search);

    const response = await get(new Request("http://localhost/api/foods?q=%20"));

    expect(search).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
  });
});
