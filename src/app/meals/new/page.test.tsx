import { render, screen } from "@testing-library/react";

import NewMealPage from "./page";

describe("New meal page", () => {
  it("offers one scroll wheel for each weight digit when starting a meal record", () => {
    render(<NewMealPage />);

    expect(screen.getByRole("heading", { level: 1, name: "食事を記録" })).toBeInTheDocument();
    expect(screen.getAllByRole("listbox")).toHaveLength(5);
  });
});
