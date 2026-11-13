import { sumMonthlyOverheadCents, allocateOverheadPerUnitCents } from "./overhead";

describe("sumMonthlyOverheadCents", () => {
  it("sums active expenses", () => {
    expect(
      sumMonthlyOverheadCents([
        { amountCents: 10000, isActive: true },
        { amountCents: 5000, isActive: false },
        { amountCents: 2000, isActive: true },
      ]),
    ).toBe(12000);
  });

  it("returns null on invalid", () => {
    expect(
      sumMonthlyOverheadCents([{ amountCents: -1, isActive: true }]),
    ).toBeNull();
  });
});

describe("allocateOverheadPerUnitCents", () => {
  it("allocates", () => {
    expect(allocateOverheadPerUnitCents(100000, 250)).toBe(400);
  });

  it("rejects zero output", () => {
    expect(allocateOverheadPerUnitCents(100000, 0)).toBeNull();
  });
});