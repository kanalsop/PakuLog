import { fireEvent, render, screen, within } from "@testing-library/react";

import { FoodWeightInput } from "./food_weight_input";

describe("FoodWeightInput", () => {
  function scrollWheelToDigit(label: string, digit: number) {
    const wheel = screen.getByRole("listbox", { name: label });
    Object.defineProperty(wheel, "scrollTop", {
      configurable: true,
      value: (10 + digit) * 48,
      writable: true,
    });
    fireEvent.scroll(wheel);
  }

  it("moves from 10 grams to 100 grams by scrolling only the hundreds and tens wheels", () => {
    render(<FoodWeightInput defaultDecigrams={100} name="foodWeightGrams" />);

    scrollWheelToDigit("百の位", 1);
    scrollWheelToDigit("十の位", 0);

    expect(screen.getByRole("spinbutton", { name: "摂取量" })).toHaveValue(100);
  });

  it("shows why a zero gram weight cannot be submitted", () => {
    render(<FoodWeightInput defaultDecigrams={1} name="foodWeightGrams" />);

    scrollWheelToDigit("小数第一位", 0);

    expect(screen.getByRole("alert")).toHaveTextContent("0.1 g以上を設定してください");
  });

  it("updates every digit wheel when the weight is entered with a numeric keyboard", () => {
    render(<FoodWeightInput defaultDecigrams={100} name="foodWeightGrams" />);

    fireEvent.change(screen.getByRole("spinbutton", { name: "摂取量" }), {
      target: { value: "1234.5" },
    });

    for (const [label, digit] of [
      ["千の位", 1],
      ["百の位", 2],
      ["十の位", 3],
      ["一の位", 4],
      ["小数第一位", 5],
    ] as const) {
      expect(
        within(screen.getByRole("listbox", { name: label })).getByRole("option", {
          name: String(digit),
        }),
      ).toHaveAttribute("aria-selected", "true");
    }
  });
});
