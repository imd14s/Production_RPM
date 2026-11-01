import { formatPercent, parsePercentInput, percentToMicros } from "./percent";

describe("parsePercentInput", () => {
  it("normalizes brazilian comma to canonical format", () => {
    expect(parsePercentInput("12,5")).toBe("12.500000");
  });

  it("accepts dot as decimal separator", () => {
    expect(parsePercentInput("4.99")).toBe("4.990000");
  });

  it("accepts the percent sign", () => {
    expect(parsePercentInput(" 8% ")).toBe("8.000000");
  });

  it("accepts integers", () => {
    expect(parsePercentInput("0")).toBe("0.000000");
    expect(parsePercentInput("100")).toBe("100.000000");
  });

  it("rejects values above one hundred", () => {
    expect(parsePercentInput("100,01")).toBeNull();
    expect(parsePercentInput("150")).toBeNull();
  });

  it("rejects more than six decimals", () => {
    expect(parsePercentInput("1,1234567")).toBeNull();
  });

  it("rejects empty and malformed input", () => {
    expect(parsePercentInput("")).toBeNull();
    expect(parsePercentInput("abc")).toBeNull();
    expect(parsePercentInput("-5")).toBeNull();
    expect(parsePercentInput("1,2,3")).toBeNull();
  });
});

describe("percentToMicros", () => {
  it("scales the percent to integer micro units", () => {
    expect(percentToMicros("12.500000")).toBe(12_500_000);
    expect(percentToMicros("0.000000")).toBe(0);
    expect(percentToMicros("100.000000")).toBe(100_000_000);
  });

  it("keeps six decimal precision", () => {
    expect(percentToMicros("4.999999")).toBe(4_999_999);
  });

  it("throws when the value is out of range", () => {
    expect(() => percentToMicros("999999999999999999.000000")).toThrow(RangeError);
  });
});

describe("formatPercent", () => {
  it("formats canonical value for display", () => {
    expect(formatPercent("12.500000")).toBe("12,5");
    expect(formatPercent("8.000000")).toBe("8");
    expect(formatPercent("4.990000")).toBe("4,99");
  });

  it("formats numeric values", () => {
    expect(formatPercent(12.5)).toBe("12,5");
  });
});
