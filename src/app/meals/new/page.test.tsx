import { render, screen } from "@testing-library/react";

import NewMealPage from "./page";

describe("New meal page", () => {
  it("offers one scroll wheel for each weight digit when starting a meal record", () => {
    render(<NewMealPage />);

    expect(screen.getByRole("heading", { level: 1, name: "食事を記録" })).toBeInTheDocument();
    expect(screen.getAllByRole("listbox")).toHaveLength(5);
  });

  it("asks the user to choose a food before entering its weight", () => {
    render(<NewMealPage />);

    expect(screen.getByRole("searchbox", { name: "食品名" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "食品名" })).toAppearBefore(
      screen.getByRole("spinbutton", { name: "摂取量" }),
    );
  });
});
