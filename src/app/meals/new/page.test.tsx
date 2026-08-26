import { render, screen } from "@testing-library/react";

import { MealEntryDetails } from "./page";

describe("New meal page", () => {
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

  it("shows the chosen meal type before the food details", () => {
    render(<MealEntryDetails mealType="breakfast" />);

    expect(screen.getByRole("radio", { name: "朝食" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "朝食" })).toAppearBefore(
      screen.getByRole("searchbox", { name: "食品名" }),
    );
  });
});
