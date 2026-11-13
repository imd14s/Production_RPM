import {
  calculatePriceCents,
  sumFixedFeesCents,
  sumVariablePercent,
  type Fee,
} from "./pricing";

describe("calculatePriceCents", () => {
  it("calculates a simple price", () => {
    const result = calculatePriceCents({
      costCents: 10000,
      fixedFeesCents: 0,
      variablePercent: 0,
      marginPercent: 0.3,
    });

    expect(result).toEqual({ ok: true, priceCents: 14286 });
  });

  it("includes fixed fees in the numerator", () => {
    const result = calculatePriceCents({
      costCents: 10000,
      fixedFeesCents: 500,
      variablePercent: 0,
      marginPercent: 0.3,
    });

    expect(result).toEqual({ ok: true, priceCents: 15000 });
  });

  it("applies variable percent", () => {
    const result = calculatePriceCents({
      costCents: 10000,
      fixedFeesCents: 0,
      variablePercent: 0.1,
      marginPercent: 0.3,
    });

    expect(result).toEqual({ ok: true, priceCents: 16667 });
  });

  it("rejects denominator <= 0 (margin 100%)", () => {
    const result = calculatePriceCents({
      costCents: 10000,
      fixedFeesCents: 0,
      variablePercent: 0,
      marginPercent: 1,
    });

    expect(result.ok).toBe(false);
  });

  it("rejects denominator <= 0 (variable + margin >= 1)", () => {
    const result = calculatePriceCents({
      costCents: 10000,
      fixedFeesCents: 0,
      variablePercent: 0.6,
      marginPercent: 0.5,
    });

    expect(result.ok).toBe(false);
  });

  it("rejects negative cost", () => {
    const result = calculatePriceCents({
      costCents: -1,
      fixedFeesCents: 0,
      variablePercent: 0,
      marginPercent: 0.3,
    });

    expect(result.ok).toBe(false);
  });

  it("rejects invalid percent", () => {
    const result = calculatePriceCents({
      costCents: 10000,
      fixedFeesCents: 0,
      variablePercent: 1.5,
      marginPercent: 0.3,
    });

    expect(result.ok).toBe(false);
  });

  it("handles zero cost", () => {
    const result = calculatePriceCents({
      costCents: 0,
      fixedFeesCents: 0,
      variablePercent: 0,
      marginPercent: 0.3,
    });

    expect(result).toEqual({ ok: true, priceCents: 0 });
  });
});

describe("sumFixedFeesCents", () => {
  it("sums fixed fees only", () => {
    const fees: Fee[] = [
      { kind: "fixo", rate: null, amountCents: 100 },
      { kind: "percentual", rate: 0.1, amountCents: null },
      { kind: "fixo", rate: null, amountCents: 250 },
    ];

    expect(sumFixedFeesCents(fees)).toBe(350);
  });

  it("ignores invalid fixed fees", () => {
    const fees: Fee[] = [
      { kind: "fixo", rate: null, amountCents: -5 },
      { kind: "fixo", rate: null, amountCents: null },
    ];

    expect(sumFixedFeesCents(fees)).toBe(0);
  });
});

describe("sumVariablePercent", () => {
  it("sums percent fees only", () => {
    const fees: Fee[] = [
      { kind: "percentual", rate: 0.1, amountCents: null },
      { kind: "fixo", rate: null, amountCents: 100 },
      { kind: "percentual", rate: 0.05, amountCents: null },
    ];

    expect(sumVariablePercent(fees)).toBeCloseTo(0.15);
  });

  it("ignores invalid percents", () => {
    const fees: Fee[] = [
      { kind: "percentual", rate: -0.1, amountCents: null },
      { kind: "percentual", rate: 2, amountCents: null },
    ];

    expect(sumVariablePercent(fees)).toBe(0);
  });
});