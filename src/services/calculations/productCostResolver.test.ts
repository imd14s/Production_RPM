import { resolveProductCost } from "./productCostResolver";
import type { ProductNode, SupplyNode } from "./productCostResolver";

describe("resolveProductCost", () => {
  it("resolves a simple product", () => {
    const products = new Map<string, ProductNode>([
      ["p1", { id: "p1", laborMinutes: 0, components: [{ targetType: "supply", supplyId: "s1", quantity: 2 }] }],
    ]);
    const supplies = new Map<string, SupplyNode>([["s1", { id: "s1", currentUnitCostCents: 500 }]]);

    const result = resolveProductCost("p1", products, supplies);

    expect(result.materialCents).toBe(1000);
    expect(result.totalCents).toBe(1000);
  });

  it("resolves subproduct", () => {
    const products = new Map<string, ProductNode>([
      ["p1", { id: "p1", laborMinutes: 0, components: [{ targetType: "product", productId: "p2", quantity: 2 }] }],
      ["p2", { id: "p2", laborMinutes: 0, components: [{ targetType: "supply", supplyId: "s1", quantity: 3 }] }],
    ]);
    const supplies = new Map<string, SupplyNode>([["s1", { id: "s1", currentUnitCostCents: 100 }]]);

    const result = resolveProductCost("p1", products, supplies);

    // p2 material = 300; p1 = 2 * 300 = 600
    expect(result.materialCents).toBe(600);
  });

  it("reports missing when supply has no cost", () => {
    const products = new Map<string, ProductNode>([
      ["p1", { id: "p1", laborMinutes: 0, components: [{ targetType: "supply", supplyId: "s1", quantity: 2 }] }],
    ]);
    const supplies = new Map<string, SupplyNode>([["s1", { id: "s1", currentUnitCostCents: null }]]);

    const result = resolveProductCost("p1", products, supplies);

    expect(result.materialCents).toBeNull();
    expect(result.missing.length).toBeGreaterThan(0);
  });
});