import { render, screen } from "@testing-library/react";

import Home from "./page";

describe("Home page", () => {
  it("introduces PakuLog as an everyday nutrition journal", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { level: 1, name: "PakuLog" })).toBeInTheDocument();
    expect(screen.getByText("毎日の食事を，無理なく記録．")).toBeInTheDocument();
  });

  it("links to the new meal entry", () => {
    render(<Home />);

    expect(screen.getByRole("link", { name: "食事を記録する" })).toHaveAttribute(
      "href",
      "/meals/new",
    );
  });
});
