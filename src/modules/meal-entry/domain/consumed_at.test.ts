import { getJstDate, parseJstConsumedAt } from "./consumed_at";

describe("getJstDate", () => {
  it("returns the Japanese calendar date at the instant the entry opens", () => {
    expect(getJstDate(new Date("2026-08-25T15:00:00.000Z"))).toBe("2026-08-26");
  });
});

describe("parseJstConsumedAt", () => {
  it("keeps a valid Japanese date without inventing a time", () => {
    expect(parseJstConsumedAt({ consumedOn: "2026-08-26", consumedTime: "" })).toEqual({
      success: true,
      value: { consumedOn: "2026-08-26", consumedAt: null },
    });
  });

  it("rejects malformed or nonexistent Japanese calendar dates", () => {
    for (const consumedOn of ["", "2026-8-26", "2025-02-29", "2026-04-31"]) {
      expect(parseJstConsumedAt({ consumedOn, consumedTime: "" })).toEqual({ success: false });
    }
  });

  it("converts a Japanese local time into its UTC instant", () => {
    expect(parseJstConsumedAt({ consumedOn: "2026-08-26", consumedTime: "12:34" })).toEqual({
      success: true,
      value: { consumedOn: "2026-08-26", consumedAt: "2026-08-26T03:34:00.000Z" },
    });
  });

  it("rejects times outside minute precision on a 24 hour clock", () => {
    for (const consumedTime of ["1:00", "24:00", "12:60", "12:34:56", "food"]) {
      expect(parseJstConsumedAt({ consumedOn: "2026-08-26", consumedTime })).toEqual({
        success: false,
      });
    }
  });

  it("converts Japanese midnight from the start of its calendar date", () => {
    expect(parseJstConsumedAt({ consumedOn: "2026-08-26", consumedTime: "00:00" })).toEqual({
      success: true,
      value: { consumedOn: "2026-08-26", consumedAt: "2026-08-25T15:00:00.000Z" },
    });
  });

  it("converts 23:59 from the end of its Japanese calendar date", () => {
    expect(parseJstConsumedAt({ consumedOn: "2026-08-26", consumedTime: "23:59" })).toEqual({
      success: true,
      value: { consumedOn: "2026-08-26", consumedAt: "2026-08-26T14:59:00.000Z" },
    });
  });

  it("produces the same UTC instant in every server timezone", () => {
    const previousTimezone = process.env.TZ;

    try {
      for (const timezone of ["UTC", "America/Los_Angeles", "Asia/Tokyo"]) {
        process.env.TZ = timezone;
        expect(parseJstConsumedAt({ consumedOn: "2026-08-26", consumedTime: "08:15" })).toEqual({
          success: true,
          value: { consumedOn: "2026-08-26", consumedAt: "2026-08-25T23:15:00.000Z" },
        });
      }
    } finally {
      if (previousTimezone === undefined) {
        delete process.env.TZ;
      } else {
        process.env.TZ = previousTimezone;
      }
    }
  });
});
