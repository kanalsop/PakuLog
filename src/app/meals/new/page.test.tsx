import { render, screen } from "@testing-library/react";

import NewMealPage from "./page";

const requireCurrentUser = vi.hoisted(() =>
  vi.fn<typeof import("../../../modules/auth/infrastructure/server_auth").requireCurrentUser>(),
);

vi.mock("../../../modules/auth/infrastructure/server_auth", () => ({ requireCurrentUser }));

describe("New meal page", () => {
  beforeEach(() => {
    requireCurrentUser.mockResolvedValue({ id: "user-42", email: "user@example.com" });
  });

  it("offers one scroll wheel for each weight digit when starting a meal record", async () => {
    render(await NewMealPage());

    expect(screen.getByRole("heading", { level: 1, name: "食事を記録" })).toBeInTheDocument();
    expect(screen.getAllByRole("listbox")).toHaveLength(5);
  });

  it("asks the user to choose a food before entering its weight", async () => {
    render(await NewMealPage());

    expect(screen.getByRole("searchbox", { name: "食品名" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "食品名" })).toAppearBefore(
      screen.getByRole("spinbutton", { name: "摂取量" }),
    );
  });

  it("requires an authenticated user before showing the meal form", async () => {
    render(await NewMealPage());

    expect(requireCurrentUser).toHaveBeenCalledWith("/meals/new");
  });

  it("lets an authenticated user log out from the meal page", async () => {
    render(await NewMealPage());

    expect(screen.getByRole("button", { name: "ログアウト" })).toBeInTheDocument();
  });
});
