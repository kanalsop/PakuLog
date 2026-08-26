import { render, screen } from "@testing-library/react";

import MealTypePage from "./page";

describe("Meal type page", () => {
  it("offers each supported meal type before starting the detailed entry", () => {
    render(<MealTypePage />);

    for (const [label, value] of [
      ["朝食", "breakfast"],
      ["昼食", "lunch"],
      ["夜ご飯", "dinner"],
      ["間食", "snack"],
    ] as const) {
      expect(screen.getByRole("link", { name: label })).toHaveAttribute(
        "href",
        `/meals/new?mealType=${value}`,
      );
    }
  });
});
