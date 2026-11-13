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

import {
  calculateLaborCostCents,
  calculateCostPerMinuteCents,
  allocateMonthlyCostPerUnitCents,
  sumComponentCostsCents,
  calculateFullProductCostCents,
} from "./productCost";

describe("calculateLaborCostCents", () => {
  it("calculates labor cost", () => {
    expect(calculateLaborCostCents(30, 100)).toBe(3000);
  });

  it("rejects invalid inputs", () => {
    expect(calculateLaborCostCents(-1, 100)).toBeNull();
    expect(calculateLaborCostCents(30, -1)).toBeNull();
    expect(calculateLaborCostCents(2881, 100)).toBeNull();
  });
});

describe("calculateCostPerMinuteCents", () => {
  it("derives cost per minute", () => {
    expect(calculateCostPerMinuteCents(600000, 160)).toBe(63);
  });

  it("rejects zero hours", () => {
    expect(calculateCostPerMinuteCents(600000, 0)).toBeNull();
  });
});

describe("allocateMonthlyCostPerUnitCents", () => {
  it("allocates per unit", () => {
    expect(allocateMonthlyCostPerUnitCents(100000, 500)).toBe(200);
  });

  it("rejects zero output", () => {
    expect(allocateMonthlyCostPerUnitCents(100000, 0)).toBeNull();
  });
});

describe("sumComponentCostsCents", () => {
  it("sums component costs", () => {
    expect(sumComponentCostsCents([1000, 2500])).toBe(3500);
  });

  it("rejects invalid", () => {
    expect(sumComponentCostsCents([1000, -1])).toBeNull();
  });
});

describe("calculateFullProductCostCents", () => {
  it("aggregates", () => {
    expect(calculateFullProductCostCents(1000, 500, 200)).toBe(1700);
  });

  it("returns null if any missing", () => {
    expect(calculateFullProductCostCents(1000, null, 200)).toBeNull();
  });
});
