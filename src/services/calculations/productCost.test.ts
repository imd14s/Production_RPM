import {
  calculateLineCostCents,
  calculateMaterialCost,
} from "./productCost";

describe("calculateLineCostCents", () => {
  it("multiplies quantity by unit cost with rounding", () => {
    expect(calculateLineCostCents(0.8, 2112)).toBe(1690);
    expect(calculateLineCostCents(2, 333)).toBe(666);
    expect(calculateLineCostCents(1.5, 333)).toBe(500);
  });

  it("returns null for missing cost or invalid quantity", () => {
    expect(calculateLineCostCents(2, null)).toBeNull();
    expect(calculateLineCostCents(0, 500)).toBeNull();
    expect(calculateLineCostCents(-1, 500)).toBeNull();
    expect(calculateLineCostCents(Number.NaN, 500)).toBeNull();
    expect(calculateLineCostCents(1.0001, 500)).toBeNull();
    expect(calculateLineCostCents(1, -500)).toBeNull();
    expect(calculateLineCostCents(1, Number.MAX_SAFE_INTEGER + 1)).toBeNull();
    expect(calculateLineCostCents(1_000_001, 1)).toBeNull();
  });
});

describe("calculateMaterialCost", () => {
  it("sums complete compositions", () => {
    const result = calculateMaterialCost([
      { label: "Tecido", quantity: 0.8, unitCostCents: 2112 },
      { label: "Botão", quantity: 2, unitCostCents: 100 },
      { label: "Linha", quantity: 1, unitCostCents: 50 },
    ]);

    expect(result.missing).toEqual([]);
    expect(result.totalCents).toBe(1940);
  });

  it("reports missing costs and null total", () => {
    const result = calculateMaterialCost([
      { label: "Tecido", quantity: 0.8, unitCostCents: 2112 },
      { label: "Botão raro", quantity: 2, unitCostCents: null },
    ]);

    expect(result.totalCents).toBeNull();
    expect(result.missing).toEqual(["Botão raro"]);
  });

  it("handles empty compositions", () => {
    expect(calculateMaterialCost([])).toEqual({ totalCents: 0, missing: [] });
  });

  it("rejects totals outside the safe integer range", () => {
    const result = calculateMaterialCost([
      { label: "Peça A", quantity: 1, unitCostCents: Number.MAX_SAFE_INTEGER },
      { label: "Peça B", quantity: 1, unitCostCents: Number.MAX_SAFE_INTEGER },
    ]);

    expect(result.totalCents).toBeNull();
    expect(result.missing).toEqual(["Peça B"]);
  });
});
