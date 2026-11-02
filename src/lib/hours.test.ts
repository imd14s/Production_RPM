import { formatHours, parseHoursInput } from "./hours";

describe("parseHoursInput", () => {
  it("accepts comma decimals", () => {
    expect(parseHoursInput("176,5")).toBe(176.5);
  });

  it("accepts plain integers", () => {
    expect(parseHoursInput("220")).toBe(220);
  });

  it("rounds to two decimal places", () => {
    expect(parseHoursInput("176,125")).toBe(176.13);
  });

  it("rejects zero, negatives and invalid text", () => {
    expect(parseHoursInput("0")).toBeNull();
    expect(parseHoursInput("-8")).toBeNull();
    expect(parseHoursInput("abc")).toBeNull();
    expect(parseHoursInput("")).toBeNull();
  });
});

describe("formatHours", () => {
  it("drops unnecessary zeros", () => {
    expect(formatHours(220)).toBe("220");
    expect(formatHours(176.5)).toBe("176,5");
  });

  it("keeps decimals using comma", () => {
    expect(formatHours(176.25)).toBe("176,25");
  });
});
