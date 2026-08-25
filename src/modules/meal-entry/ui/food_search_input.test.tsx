import { fireEvent, render, screen } from "@testing-library/react";

import { FoodSearchInput } from "./food_search_input";

describe("FoodSearchInput", () => {
  it("finds and selects さんま when the user searches for サンマ", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 42,
            name: "さんま",
            categoryPath: ["魚介類", "魚類"],
            descriptors: ["皮つき", "生"],
          },
        ]),
        { headers: { "Content-Type": "application/json" } },
      ),
    );

    render(<FoodSearchInput name="foodId" />);

    fireEvent.change(screen.getByRole("searchbox", { name: "食品名" }), {
      target: { value: "サンマ" },
    });
    fireEvent.click(screen.getByRole("button", { name: "検索" }));

    const result = await screen.findByRole("button", { name: "さんま（皮つき・生）" });
    expect(fetchMock).toHaveBeenCalledWith("/api/foods?q=%E3%82%B5%E3%83%B3%E3%83%9E");

    fireEvent.click(result);

    expect(screen.getByText("選択中: さんま（皮つき・生）")).toBeInTheDocument();
    expect(screen.getByTestId("selected-food-id")).toHaveValue("42");

    fetchMock.mockRestore();
  });
});
