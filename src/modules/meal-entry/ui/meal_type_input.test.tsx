import { fireEvent, render, screen } from "@testing-library/react";

import { MealTypeInput } from "./meal_type_input";

describe("MealTypeInput", () => {
  it("starts with the meal type chosen before the detailed entry", () => {
    render(<MealTypeInput defaultValue="dinner" name="mealType" />);

    expect(screen.getByRole("radio", { name: "夜ご飯" })).toBeChecked();
  });

  it("lets the user correct the meal type in the detailed entry", () => {
    render(<MealTypeInput defaultValue="dinner" name="mealType" />);

    fireEvent.click(screen.getByRole("radio", { name: "間食" }));

    expect(screen.getByRole("radio", { name: "間食" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "夜ご飯" })).not.toBeChecked();
  });
});
