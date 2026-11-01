import { formatBRL, fromCents, sumCents, toCents } from "./currency";

describe("toCents", () => {
  it("converts reais to integer cents", () => {
    expect(toCents(12.34)).toBe(1234);
  });

  it("rounds half cents to the nearest integer", () => {
    expect(toCents(0.005)).toBe(1);
    expect(toCents(2.345)).toBe(235);
  });

  it("rejects non-finite amounts", () => {
    expect(() => toCents(Number.NaN)).toThrow(RangeError);
    expect(() => toCents(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});

describe("fromCents", () => {
  it("converts cents back to reais", () => {
    expect(fromCents(1234)).toBe(12.34);
  });

  it("rejects fractional cents", () => {
    expect(() => fromCents(12.5)).toThrow(RangeError);
  });
});

describe("sumCents", () => {
  it("adds integer cents without float drift", () => {
    expect(sumCents(10, 20, 30)).toBe(60);
  });

  it("returns zero for an empty list", () => {
    expect(sumCents()).toBe(0);
  });

  it("rejects fractional cents", () => {
    expect(() => sumCents(10, 0.5)).toThrow(RangeError);
  });
});

describe("formatBRL", () => {
  it("formats cents as brazilian currency", () => {
    expect(formatBRL(1234).replace(/\u00a0/g, " ")).toBe("R$ 12,34");
  });

  it("formats zero", () => {
    expect(formatBRL(0).replace(/\u00a0/g, " ")).toBe("R$ 0,00");
  });
});
