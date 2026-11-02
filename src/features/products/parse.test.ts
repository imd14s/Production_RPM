import { parseProductComponentRow, parseProductRow } from "./parse";
import type { Product } from "./types";

const PRODUCT: Product = {
  id: "22222222-2222-4222-8222-222222222222",
  name: "Blusa",
  kind: "fabricado",
  laborMinutes: 45,
  isActive: true,
  notes: "",
};

describe("parseProductRow", () => {
  it("converts a valid database row", () => {
    expect(
      parseProductRow({
        id: PRODUCT.id,
        name: PRODUCT.name,
        kind: PRODUCT.kind,
        labor_minutes: PRODUCT.laborMinutes,
        is_active: PRODUCT.isActive,
        notes: null,
      }),
    ).toEqual(PRODUCT);
  });

  it("rejects malformed rows", () => {
    expect(parseProductRow({ ...PRODUCT, kind: "unknown" })).toBeNull();
    expect(parseProductRow({ ...PRODUCT, labor_minutes: 1.5 })).toBeNull();
  });
});

describe("parseProductComponentRow", () => {
  it("resolves an insumo component", () => {
    expect(
      parseProductComponentRow(
        {
          id: "33333333-3333-4333-8333-333333333333",
          product_id: PRODUCT.id,
          supply_id: "11111111-1111-4111-8111-111111111111",
          component_product_id: null,
          quantity: "0.750",
        },
        {
          products: new Map([[PRODUCT.id, PRODUCT]]),
          supplies: new Map([
            [
              "11111111-1111-4111-8111-111111111111",
              { name: "Tecido", unit: "metro" },
            ],
          ]),
        },
      ),
    ).toEqual({
      id: "33333333-3333-4333-8333-333333333333",
      productId: PRODUCT.id,
      targetType: "supply",
      targetId: "11111111-1111-4111-8111-111111111111",
      targetName: "Tecido",
      unit: "metro",
      quantity: 0.75,
    });
  });

  it("rejects a component with two targets or unknown references", () => {
    const databaseRow = {
      id: "33333333-3333-4333-8333-333333333333",
      product_id: PRODUCT.id,
      supply_id: "11111111-1111-4111-8111-111111111111",
      component_product_id: PRODUCT.id,
      quantity: 1,
    };

    expect(
      parseProductComponentRow(databaseRow, {
        products: new Map([[PRODUCT.id, PRODUCT]]),
        supplies: new Map(),
      }),
    ).toBeNull();
  });
});
