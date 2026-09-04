import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { MealNutrientFields } from "./meal_nutrient_fields";

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }

  return input instanceof URL ? input.href : input.url;
}

const foodProfile = [
  ["ENERC_KCAL", 2_870, "kcal", "measured"],
  ["PROT-", 181, "g", "measured"],
  ["FAT-", 256, "g", "measured"],
  ["CHOCDF-", 1, "g", "measured"],
  ["FIB-", 0, "g", "estimated"],
  ["NACL_EQ", 4, "g", "measured"],
].map(([nutrientCode, amountPer100gTenths, unit, valueKind]) => ({
  nutrientCode,
  amountPer100gTenths,
  unit,
  valueKind,
}));

describe("MealNutrientFields", () => {
  it("shows the selected food nutrients at the default weight", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = requestUrl(input);

      if (url.startsWith("/api/foods?q=")) {
        return Response.json([
          {
            id: 42,
            name: "さんま",
            categoryPath: ["魚介類", "魚類"],
            descriptors: ["皮つき", "生"],
          },
        ]);
      }

      return Response.json(foodProfile);
    });

    render(
      <MealNutrientFields
        defaultDecigrams={1_000}
        foodIdName="foodId"
        weightName="foodWeightGrams"
      />,
    );
    fireEvent.change(screen.getByRole("searchbox", { name: "食品名" }), {
      target: { value: "サンマ" },
    });
    fireEvent.click(screen.getByRole("button", { name: "検索" }));
    fireEvent.click(await screen.findByRole("button", { name: "さんま（皮つき・生）" }));

    expect(await screen.findByRole("row", { name: "エネルギー 287 kcal" })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: "たんぱく質 18.1 g" })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: "食物繊維 0.0 g" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/foods/42/nutrients", expect.anything());

    fetchMock.mockRestore();
  });

  it("recalculates the nutrient preview when the food weight changes", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      if (requestUrl(input).startsWith("/api/foods?q=")) {
        return Response.json([
          {
            id: 42,
            name: "さんま",
            categoryPath: ["魚介類", "魚類"],
            descriptors: ["皮つき", "生"],
          },
        ]);
      }

      return Response.json(foodProfile);
    });

    render(
      <MealNutrientFields
        defaultDecigrams={1_000}
        foodIdName="foodId"
        weightName="foodWeightGrams"
      />,
    );
    fireEvent.change(screen.getByRole("searchbox", { name: "食品名" }), {
      target: { value: "サンマ" },
    });
    fireEvent.click(screen.getByRole("button", { name: "検索" }));
    fireEvent.click(await screen.findByRole("button", { name: "さんま（皮つき・生）" }));
    await screen.findByRole("row", { name: "エネルギー 287 kcal" });

    fireEvent.change(screen.getByRole("spinbutton", { name: "摂取量" }), {
      target: { value: "50.0" },
    });

    expect(screen.getByRole("row", { name: "エネルギー 144 kcal" })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: "たんぱく質 9.1 g" })).toBeInTheDocument();

    fetchMock.mockRestore();
  });

  it("shows trace and missing values as dashes instead of numeric zero", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      if (requestUrl(input).startsWith("/api/foods?q=")) {
        return Response.json([
          {
            id: 42,
            name: "さんま",
            categoryPath: ["魚介類", "魚類"],
            descriptors: ["皮つき", "生"],
          },
        ]);
      }

      return Response.json(
        [
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
        })),
      );
    });

    render(
      <MealNutrientFields
        defaultDecigrams={1_000}
        foodIdName="foodId"
        weightName="foodWeightGrams"
      />,
    );
    fireEvent.change(screen.getByRole("searchbox", { name: "食品名" }), {
      target: { value: "サンマ" },
    });
    fireEvent.click(screen.getByRole("button", { name: "検索" }));
    fireEvent.click(await screen.findByRole("button", { name: "さんま（皮つき・生）" }));

    expect(await screen.findByRole("row", { name: "食物繊維 ー" })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: "食塩相当量 ー" })).toBeInTheDocument();

    fetchMock.mockRestore();
  });

  it("shows a safe error when the selected food nutrients cannot be loaded", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      if (requestUrl(input).startsWith("/api/foods?q=")) {
        return Response.json([
          {
            id: 42,
            name: "さんま",
            categoryPath: ["魚介類", "魚類"],
            descriptors: ["皮つき", "生"],
          },
        ]);
      }

      return Response.json({ message: "unavailable" }, { status: 503 });
    });

    render(
      <MealNutrientFields
        defaultDecigrams={1_000}
        foodIdName="foodId"
        weightName="foodWeightGrams"
      />,
    );
    fireEvent.change(screen.getByRole("searchbox", { name: "食品名" }), {
      target: { value: "サンマ" },
    });
    fireEvent.click(screen.getByRole("button", { name: "検索" }));
    fireEvent.click(await screen.findByRole("button", { name: "さんま（皮つき・生）" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "食品の栄養価を取得できませんでした。食品を選び直してください。",
    );
    expect(screen.queryByRole("heading", { name: "この食事の栄養価" })).not.toBeInTheDocument();

    fetchMock.mockRestore();
  });

  it("hides calculated nutrients while the weight is zero", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      if (requestUrl(input).startsWith("/api/foods?q=")) {
        return Response.json([
          {
            id: 42,
            name: "さんま",
            categoryPath: ["魚介類", "魚類"],
            descriptors: ["皮つき", "生"],
          },
        ]);
      }

      return Response.json(foodProfile);
    });

    render(
      <MealNutrientFields
        defaultDecigrams={1_000}
        foodIdName="foodId"
        weightName="foodWeightGrams"
      />,
    );
    fireEvent.change(screen.getByRole("searchbox", { name: "食品名" }), {
      target: { value: "サンマ" },
    });
    fireEvent.click(screen.getByRole("button", { name: "検索" }));
    fireEvent.click(await screen.findByRole("button", { name: "さんま（皮つき・生）" }));
    await screen.findByRole("heading", { name: "この食事の栄養価" });

    const hundredsWheel = screen.getByRole("listbox", { name: "百の位" });
    Object.defineProperty(hundredsWheel, "scrollTop", {
      configurable: true,
      value: 10 * 48,
      writable: true,
    });
    fireEvent.scroll(hundredsWheel);

    expect(screen.getByRole("alert")).toHaveTextContent("0.1 g以上を設定してください");
    expect(screen.queryByRole("heading", { name: "この食事の栄養価" })).not.toBeInTheDocument();

    fetchMock.mockRestore();
  });

  it("ignores an older nutrient response after another food is selected", async () => {
    let resolveFirstProfile: (response: Response) => void = () => undefined;
    const firstProfile = new Promise<Response>((resolve) => {
      resolveFirstProfile = resolve;
    });
    const secondProfile = foodProfile.map((nutrient) =>
      nutrient.nutrientCode === "ENERC_KCAL"
        ? { ...nutrient, amountPer100gTenths: 1_000 }
        : nutrient,
    );
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = requestUrl(input);

      if (url.startsWith("/api/foods?q=")) {
        return Response.json([
          {
            id: 42,
            name: "さんま",
            categoryPath: ["魚介類", "魚類"],
            descriptors: ["皮つき", "生"],
          },
          {
            id: 43,
            name: "さけ",
            categoryPath: ["魚介類", "魚類"],
            descriptors: ["生"],
          },
        ]);
      }

      return url === "/api/foods/42/nutrients" ? firstProfile : Response.json(secondProfile);
    });

    render(
      <MealNutrientFields
        defaultDecigrams={1_000}
        foodIdName="foodId"
        weightName="foodWeightGrams"
      />,
    );
    fireEvent.change(screen.getByRole("searchbox", { name: "食品名" }), {
      target: { value: "魚" },
    });
    fireEvent.click(screen.getByRole("button", { name: "検索" }));
    fireEvent.click(await screen.findByRole("button", { name: "さんま（皮つき・生）" }));
    fireEvent.click(screen.getByRole("button", { name: "さけ（生）" }));
    await screen.findByRole("row", { name: "エネルギー 100 kcal" });

    resolveFirstProfile(Response.json(foodProfile));

    await waitFor(() => {
      expect(screen.getByRole("row", { name: "エネルギー 100 kcal" })).toBeInTheDocument();
    });
    expect(screen.queryByRole("row", { name: "エネルギー 287 kcal" })).not.toBeInTheDocument();

    fetchMock.mockRestore();
  });
});
