import { render, screen } from "@testing-library/react";

import { AuthForm } from "./auth_form";

vi.mock("./auth_actions", () => ({
  signInAction: vi.fn<typeof import("./auth_actions").signInAction>(),
  signUpAction: vi.fn<typeof import("./auth_actions").signUpAction>(),
}));

describe("AuthForm", () => {
  it("collects email and password when a user logs in", () => {
    render(<AuthForm mode="signIn" nextPath="/meals/new" />);

    expect(screen.getByRole("textbox", { name: "メールアドレス" })).toHaveAttribute(
      "autocomplete",
      "email",
    );
    expect(screen.getByLabelText("パスワード")).toHaveAttribute("autocomplete", "current-password");
  });

  it("asks for a new password when a user creates an account", () => {
    render(<AuthForm mode="signUp" nextPath="/meals/new" />);

    expect(screen.getByLabelText("パスワード")).toHaveAttribute("autocomplete", "new-password");
  });
});
