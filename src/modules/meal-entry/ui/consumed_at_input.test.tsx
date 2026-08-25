import { fireEvent, render, screen } from "@testing-library/react";

import { ConsumedAtInput } from "./consumed_at_input";

describe("ConsumedAtInput", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts on today's Japanese date without selecting a time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-25T15:30:00.000Z"));

    render(<ConsumedAtInput dateName="consumedOn" timeName="consumedTime" />);

    expect(screen.getByLabelText("摂取日")).toHaveValue("2026-08-26");
    expect(screen.getByLabelText("摂取時刻（任意）")).toHaveValue("");
  });

  it("lets the user change the Japanese calendar date", () => {
    render(<ConsumedAtInput dateName="consumedOn" timeName="consumedTime" />);

    fireEvent.change(screen.getByLabelText("摂取日"), { target: { value: "2026-08-20" } });

    expect(screen.getByLabelText("摂取日")).toHaveValue("2026-08-20");
  });

  it("returns a selected time to the optional empty state", () => {
    render(<ConsumedAtInput dateName="consumedOn" timeName="consumedTime" />);
    const timeInput = screen.getByLabelText("摂取時刻（任意）");
    fireEvent.change(timeInput, { target: { value: "08:15" } });

    fireEvent.change(timeInput, { target: { value: "" } });

    expect(timeInput).toHaveValue("");
  });

  it("explains why a required Japanese date cannot be empty", () => {
    render(<ConsumedAtInput dateName="consumedOn" timeName="consumedTime" />);

    fireEvent.change(screen.getByLabelText("摂取日"), { target: { value: "" } });

    expect(screen.getByRole("alert")).toHaveTextContent("正しい摂取日を入力してください");
    expect(screen.getByLabelText("摂取日")).toHaveAttribute("aria-invalid", "true");
  });
});
