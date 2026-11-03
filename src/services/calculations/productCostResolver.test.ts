import { resolveProductCost } from "./productCostResolver";
import type { ProductNode, SupplyNode } from "./productCostResolver";

describe("resolveProductCost", () => {
  it("resolves a simple product", () => {
    const products = new Map<string, ProductNode>([
      ["p1", { id: "p1", laborMinutes: 0, energyCostCents: null, machineCostCents: null, finishingCostCents: null, failureRatePercent: null, components: [{ targetType: "supply", supplyId: "s1", quantity: 2 }] }],
    ]);
    const supplies = new Map<string, SupplyNode>([["s1", { id: "s1", currentUnitCostCents: 500 }]]);

    const result = resolveProductCost("p1", products, supplies);

    expect(result.materialCents).toBe(1000);
    expect(result.totalCents).toBe(1000);
  });

  it("resolves subproduct", () => {
    const products = new Map<string, ProductNode>([
      ["p1", { id: "p1", laborMinutes: 0, energyCostCents: null, machineCostCents: null, finishingCostCents: null, failureRatePercent: null, components: [{ targetType: "product", productId: "p2", quantity: 2 }] }],
      ["p2", { id: "p2", laborMinutes: 0, energyCostCents: null, machineCostCents: null, finishingCostCents: null, failureRatePercent: null, components: [{ targetType: "supply", supplyId: "s1", quantity: 3 }] }],
    ]);
    const supplies = new Map<string, SupplyNode>([["s1", { id: "s1", currentUnitCostCents: 100 }]]);

    const result = resolveProductCost("p1", products, supplies);

    // p2 material = 300; p1 = 2 * 300 = 600
    expect(result.materialCents).toBe(600);
  });

  it("reports missing when supply has no cost", () => {
    const products = new Map<string, ProductNode>([
      ["p1", { id: "p1", laborMinutes: 0, energyCostCents: null, machineCostCents: null, finishingCostCents: null, failureRatePercent: null, components: [{ targetType: "supply", supplyId: "s1", quantity: 2 }] }],
    ]);
    const supplies = new Map<string, SupplyNode>([["s1", { id: "s1", currentUnitCostCents: null }]]);

    const result = resolveProductCost("p1", products, supplies);

    expect(result.materialCents).toBeNull();
    expect(result.missing.length).toBeGreaterThan(0);
  });

  it("applies failure rate to the material cost", () => {
    const products = new Map<string, ProductNode>([
      ["p1", { id: "p1", laborMinutes: 0, energyCostCents: null, machineCostCents: null, finishingCostCents: null, failureRatePercent: 10, components: [{ targetType: "supply", supplyId: "s1", quantity: 1 }] }],
    ]);
    const supplies = new Map<string, SupplyNode>([["s1", { id: "s1", currentUnitCostCents: 1000 }]]);

    const result = resolveProductCost("p1", products, supplies);

    // material 1000 + 10% de falha = 1100
    expect(result.materialCents).toBe(1100);
  });

  it("sums direct 3d costs into the total", () => {
    const products = new Map<string, ProductNode>([
      ["p1", { id: "p1", laborMinutes: 0, energyCostCents: 300, machineCostCents: 200, finishingCostCents: 100, failureRatePercent: null, components: [] }],
    ]);
    const supplies = new Map<string, SupplyNode>();

    const result = resolveProductCost("p1", products, supplies);

    expect(result.totalCents).toBe(600);
  });

  it("adds labor cost when minutes and minute rate are available", () => {
    const products = new Map<string, ProductNode>([
      ["p1", { id: "p1", laborMinutes: 30, energyCostCents: null, machineCostCents: null, finishingCostCents: null, failureRatePercent: null, components: [] }],
    ]);
    const supplies = new Map<string, SupplyNode>();

    const result = resolveProductCost("p1", products, supplies, new Map(), 100);

    expect(result.laborCents).toBe(3000);
    expect(result.totalCents).toBe(3000);
  });

  it("does not add labor cost when there is no salary configuration", () => {
    const products = new Map<string, ProductNode>([
      ["p1", { id: "p1", laborMinutes: 30, energyCostCents: null, machineCostCents: null, finishingCostCents: null, failureRatePercent: null, components: [] }],
    ]);
    const supplies = new Map<string, SupplyNode>();

    const result = resolveProductCost("p1", products, supplies, new Map(), null);

    expect(result.laborCents).toBe(0);
    expect(result.totalCents).toBe(0);
  });

  it("charges overhead once per final product, not per subproduct component", () => {
    const products = new Map<string, ProductNode>([
      [
        "kit",
        {
          id: "kit",
          laborMinutes: 0,
          energyCostCents: null,
          machineCostCents: null,
          finishingCostCents: null,
          failureRatePercent: null,
          components: [{ targetType: "product", productId: "peca", quantity: 1 }],
        },
      ],
      ["peca", { id: "peca", laborMinutes: 0, energyCostCents: null, machineCostCents: null, finishingCostCents: null, failureRatePercent: null, components: [] }],
    ]);
    const supplies = new Map<string, SupplyNode>();

    const result = resolveProductCost("kit", products, supplies, new Map(), null, 500);

    // peca = 0 materiais; kit adiciona um único overhead de 500
    expect(result.totalCents).toBe(500);
  });

  it("tacks overhead onto an already cached subproduct without duplication", () => {
    const products = new Map<string, ProductNode>([
      ["peca", { id: "peca", laborMinutes: 0, energyCostCents: null, machineCostCents: null, finishingCostCents: null, failureRatePercent: null, components: [] }],
    ]);
    const supplies = new Map<string, SupplyNode>();
    const memo = new Map();

    const direct = resolveProductCost("peca", products, supplies, memo, null, 500);
    expect(direct.totalCents).toBe(500);

    const again = resolveProductCost("peca", products, supplies, memo, null, 500);
    expect(again.totalCents).toBe(500);
  });
});