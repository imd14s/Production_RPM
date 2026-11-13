import { analyzePriceImpact } from "./priceImpact";

describe("analyzePriceImpact", () => {
  it("flags an impact when the current cost is higher than the baseline", () => {
    const result = analyzePriceImpact(11000, 10000);

    expect(result).toEqual({
      hasBaseline: true,
      costDeltaCents: 1000,
      costDeltaPercent: 10,
      impacted: true,
    });
  });

  it("flags an impact when the current cost is lower than the baseline", () => {
    const result = analyzePriceImpact(9000, 10000);

    expect(result).toEqual({
      hasBaseline: true,
      costDeltaCents: -1000,
      costDeltaPercent: -10,
      impacted: true,
    });
  });

  it("does not flag when the cost is unchanged", () => {
    const result = analyzePriceImpact(10000, 10000);

    expect(result).toEqual({
      hasBaseline: true,
      costDeltaCents: 0,
      costDeltaPercent: 0,
      impacted: false,
    });
  });

  it("handles a product without any snapshot", () => {
    const result = analyzePriceImpact(10000, null);

    expect(result).toEqual({
      hasBaseline: false,
      costDeltaCents: 0,
      costDeltaPercent: null,
      impacted: false,
    });
  });

  it("handles a product without a resolved current cost", () => {
    const result = analyzePriceImpact(null, 10000);

    expect(result.hasBaseline).toBe(true);
    expect(result.impacted).toBe(false);
    expect(result.costDeltaPercent).toBeNull();
  });
});
