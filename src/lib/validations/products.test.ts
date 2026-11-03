import { validateProduct } from "./products";

const FIRST_SUPPLY = "11111111-1111-4111-8111-111111111111";
const FIRST_PRODUCT = "22222222-2222-4222-8222-222222222222";

describe("validateProduct", () => {
  it("normalizes a product and its supply composition", () => {
    const result = validateProduct({
      name: "  Blusa artesanal  ",
      kind: "fabricado",
      laborMinutes: "45",
      notes: " Algodão ",
      components: JSON.stringify([
        { targetType: "supply", supplyId: FIRST_SUPPLY, productId: null, quantity: "0,75" },
      ]),
    });

    expect(result).toEqual({
      ok: true,
      data: {
        name: "Blusa artesanal",
        kind: "fabricado",
        laborMinutes: 45,
        energyCostCents: null,
        machineCostCents: null,
        finishingCostCents: null,
        failureRatePercent: null,
        notes: "Algodão",
        components: [
          { targetType: "supply", supplyId: FIRST_SUPPLY, quantity: 0.75 },
        ],
      },
    });
  });

  it("accepts a kit composed of a product", () => {
    const result = validateProduct({
      name: "Combo",
      kind: "kit",
      laborMinutes: "",
      components: JSON.stringify([
        { targetType: "product", productId: FIRST_PRODUCT, supplyId: null, quantity: 2 },
      ]),
    });

    expect(result.ok).toBe(true);
  });

  it("rejects a kit without product components", () => {
    const result = validateProduct({
      name: "Combo",
      kind: "kit",
      laborMinutes: "",
      components: JSON.stringify([
        { targetType: "supply", supplyId: FIRST_SUPPLY, productId: null, quantity: 1 },
      ]),
    });

    expect(result).toEqual({
      ok: false,
      errors: {
        components: "Um kit precisa ter ao menos um componente do tipo produto.",
      },
    });
  });

  it("rejects invalid names, kinds, minutes, and component quantities", () => {
    const result = validateProduct({
      name: "x",
      kind: "desconhecido",
      laborMinutes: "2.5",
      components: JSON.stringify([
        { targetType: "supply", supplyId: FIRST_SUPPLY, productId: null, quantity: 0 },
      ]),
    });

    expect(result).toEqual({
      ok: false,
      errors: {
        name: "Informe o nome do produto (2 a 120 caracteres).",
        kind: "Escolha a modalidade do produto.",
        laborMinutes: "Informe um tempo inteiro entre 0 e 2.880 minutos.",
        components: "Revise os itens e as quantidades da composição.",
      },
    });
  });

  it("rejects malformed or ambiguous component targets", () => {
    const malformed = validateProduct({
      name: "Produto",
      kind: "fabricado",
      components: "{",
    });
    const nonText = validateProduct({
      name: "Produto",
      kind: "fabricado",
      components: new FormData(),
    });
    const ambiguous = validateProduct({
      name: "Produto",
      kind: "fabricado",
      components: JSON.stringify([
        {
          targetType: "supply",
          supplyId: FIRST_SUPPLY,
          productId: FIRST_PRODUCT,
          quantity: 1,
        },
      ]),
    });

    expect(malformed).toEqual({
      ok: false,
      errors: { components: "A composição enviada é inválida." },
    });
    expect(nonText).toEqual({
      ok: false,
      errors: { components: "A composição enviada é inválida." },
    });
    expect(ambiguous).toEqual({
      ok: false,
      errors: { components: "Revise os insumos da composição." },
    });
  });
});
