import { buildProductPayload } from "./payload";
import type { ProductInput } from "./types";

describe("buildProductPayload", () => {
  it("builds a create payload with product components", () => {
    const input: ProductInput = {
      name: "Kit Festa",
      kind: "kit",
      laborMinutes: null,
      notes: "",
      components: [
        {
          targetType: "product",
          productId: "22222222-2222-4222-8222-222222222222",
          quantity: 1,
        },
      ],
    };

    expect(buildProductPayload(null, input)).toEqual({
      p_product_id: null,
      p_name: "Kit Festa",
      p_kind: "kit",
      p_labor_minutes: null,
      p_notes: null,
      p_components: [
        {
          supplyId: null,
          productId: "22222222-2222-4222-8222-222222222222",
          quantity: 1,
        },
      ],
    });
  });

  it("includes the product identifier when updating", () => {
    const input: ProductInput = {
      name: "Blusa",
      kind: "fabricado",
      laborMinutes: 45,
      notes: "Algodão",
      components: [
        {
          targetType: "supply",
          supplyId: "11111111-1111-4111-8111-111111111111",
          quantity: 0.75,
        },
      ],
    };

    expect(
      buildProductPayload("33333333-3333-4333-8333-333333333333", input),
    ).toEqual({
      p_product_id: "33333333-3333-4333-8333-333333333333",
      p_name: "Blusa",
      p_kind: "fabricado",
      p_labor_minutes: 45,
      p_notes: "Algodão",
      p_components: [
        {
          supplyId: "11111111-1111-4111-8111-111111111111",
          productId: null,
          quantity: 0.75,
        },
      ],
    });
  });
});
