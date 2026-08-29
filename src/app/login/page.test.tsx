import { render, screen } from "@testing-library/react";

import LoginPage from "./page";

describe("Login page", () => {
  it("preserves the protected destination when offering account creation", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({ next: "/meals/new?from=home" }) }));

    expect(screen.getByRole("heading", { level: 1, name: "ログイン" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "アカウント作成" })).toHaveAttribute(
      "href",
      "/signup?next=%2Fmeals%2Fnew%3Ffrom%3Dhome",
    );
  });
});
