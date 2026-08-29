import { safeNextPath } from "./safe_next_path";

describe("safeNextPath", () => {
  it("keeps a meal route as the destination after authentication", () => {
    expect(safeNextPath("/meals/new?from=home")).toBe("/meals/new?from=home");
  });

  it("rejects a path that only shares the protected route prefix", () => {
    expect(safeNextPath("/meals-phishing")).toBe("/meals/new");
  });

  it("rejects an external destination after authentication", () => {
    expect(safeNextPath("https://example.com/meals/new")).toBe("/meals/new");
    expect(safeNextPath("//example.com/meals/new")).toBe("/meals/new");
  });
});
