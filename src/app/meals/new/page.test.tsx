import { fireEvent, render, screen } from "@testing-library/react";

import NewMealPage, { MealEntryDetails } from "./page";

const requireCurrentUser = vi.hoisted(() =>
  vi.fn<typeof import("../../../modules/auth/infrastructure/server_auth").requireCurrentUser>(),
);

vi.mock("../../../modules/auth/infrastructure/server_auth", () => ({ requireCurrentUser }));

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }

  return input instanceof URL ? input.href : input.url;
}

describe("New meal page", () => {
  beforeEach(() => {
    requireCurrentUser.mockResolvedValue({ id: "user-42", email: "user@example.com" });
  });

  it("offers one scroll wheel for each weight digit when starting a meal record", () => {
    render(<MealEntryDetails mealType="breakfast" />);

    expect(screen.getByRole("heading", { level: 1, name: "食事を記録" })).toBeInTheDocument();
    expect(screen.getAllByRole("listbox")).toHaveLength(5);
  });

  it("asks the user to choose a food before entering its weight", () => {
    render(<MealEntryDetails mealType="breakfast" />);

    expect(screen.getByRole("searchbox", { name: "食品名" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "食品名" })).toAppearBefore(
      screen.getByRole("spinbutton", { name: "摂取量" }),
    );
  });

  it("requires an authenticated user before showing the meal form", async () => {
    render(
      await NewMealPage({
        searchParams: Promise.resolve({ mealType: "breakfast" }),
      }),
    );

    expect(requireCurrentUser).toHaveBeenCalledWith("/meals/new");
  });

  it("lets an authenticated user log out from the meal page", async () => {
    render(<MealEntryDetails mealType="breakfast" />);

    expect(screen.getByRole("button", { name: "ログアウト" })).toBeInTheDocument();
  });

  it("shows the chosen meal type before the food details", () => {
    render(<MealEntryDetails mealType="breakfast" />);

    expect(screen.getByRole("radio", { name: "朝食" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "朝食" })).toAppearBefore(
      screen.getByRole("searchbox", { name: "食品名" }),
    );
  });

  it("asks for an optional consumed time after the food weight", () => {
    render(<MealEntryDetails mealType="breakfast" />);

    expect(screen.getByRole("spinbutton", { name: "摂取量" })).toAppearBefore(
      screen.getByLabelText("摂取日"),
    );
    expect(screen.getByLabelText("摂取時刻（任意）")).toHaveValue("");
  });

  it("shows a live nutrient preview after selecting a food", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
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
          ["FIB-", 0, "g", "estimated"],
          ["NACL_EQ", 4, "g", "measured"],
        ].map(([nutrientCode, amountPer100gTenths, unit, valueKind]) => ({
          nutrientCode,
          amountPer100gTenths,
          unit,
          valueKind,
        })),
      );
    });

    render(<MealEntryDetails mealType="breakfast" />);
    fireEvent.change(screen.getByRole("searchbox", { name: "食品名" }), {
      target: { value: "サンマ" },
    });
    fireEvent.click(screen.getByRole("button", { name: "検索" }));
    fireEvent.click(await screen.findByRole("button", { name: "さんま（皮つき・生）" }));

    expect(await screen.findByRole("heading", { name: "この食事の栄養価" })).toBeInTheDocument();

    vi.restoreAllMocks();
  });
});
