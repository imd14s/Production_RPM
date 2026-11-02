import {
  validateNewSupplyWithPrice,
  validateSupply,
  validateSupplyPrice,
} from "./supplies";

describe("validateNewSupplyWithPrice", () => {
  it("normalizes supply and initial purchase fields from one form", () => {
    const result = validateNewSupplyWithPrice({
      name: "Cera Coco",
      kind: "materia_prima",
      unit: "litro",
      notes: "",
      purchaseUnit: "litro",
      quantity: "5",
      amount: "25,00",
      freight: "",
      acquiredOn: "",
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.supply).toEqual({
        name: "Cera Coco",
        kind: "materia_prima",
        unit: "litro",
        notes: "",
      });
      expect(result.data.price).toMatchObject({
        quantity: 5,
        purchaseUnit: "litro",
        amountCents: 2500,
        freightCents: 0,
        supplierId: null,
      });
      expect(result.data.price.acquiredOn).toMatch(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/);
    }
  });

  it("reports missing initial purchase values alongside supply validation", () => {
    const result = validateNewSupplyWithPrice({
      name: "Cera Coco",
      kind: "materia_prima",
      unit: "litro",
      notes: "",
      purchaseUnit: "litro",
      quantity: "",
      amount: "",
      freight: "",
      acquiredOn: "",
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.quantity).toBeDefined();
      expect(result.errors.amount).toBeDefined();
    }
  });
});

describe("validateSupply", () => {
  it("normalizes a valid supply", () => {
    const result = validateSupply({
      name: "Tecido bolso",
      kind: "materia_prima",
      unit: "metro",
      notes: "",
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data).toEqual({
        name: "Tecido bolso",
        kind: "materia_prima",
        unit: "metro",
        notes: "",
      });
    }
  });

  it("requires known kind and unit", () => {
    const result = validateSupply({ name: "Tecido bolso", kind: "loja", unit: "jarda", notes: "" });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.kind).toBeDefined();
      expect(result.errors.unit).toBeDefined();
    }
  });

  it("requires a name", () => {
    const result = validateSupply({ name: "a", kind: "materia_prima", unit: "metro", notes: "" });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.name).toBeDefined();
    }
  });
});

describe("validateSupplyPrice", () => {
  it("normalizes an acquisition and defaults the date to today", () => {
    const result = validateSupplyPrice({
      supplierId: "",
      acquiredOn: "",
      quantity: "12,5",
      purchaseUnit: "quilograma",
      amount: "249,00",
      freight: "15,00",
      notes: "",
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.quantity).toBe(12.5);
      expect(result.data.purchaseUnit).toBe("quilograma");
      expect(result.data.amountCents).toBe(24900);
      expect(result.data.freightCents).toBe(1500);
      expect(result.data.acquiredOn).toMatch(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/);
      expect(result.data.supplierId).toBeNull();
    }
  });

  it("rejects invalid quantities, amounts and dates", () => {
    const zeroQuantity = validateSupplyPrice({
      supplierId: "",
      acquiredOn: "2026-10-28",
      quantity: "0",
      purchaseUnit: "metro",
      amount: "100",
      freight: "",
      notes: "",
    });

    expect(zeroQuantity.ok).toBe(false);

    if (!zeroQuantity.ok) {
      expect(zeroQuantity.errors.quantity).toBeDefined();
    }

    const zeroAmount = validateSupplyPrice({
      supplierId: "",
      acquiredOn: "2026-10-28",
      quantity: "2",
      purchaseUnit: "metro",
      amount: "",
      freight: "",
      notes: "",
    });

    expect(zeroAmount.ok).toBe(false);

    if (!zeroAmount.ok) {
      expect(zeroAmount.errors.amount).toBeDefined();
    }

    const badDate = validateSupplyPrice({
      supplierId: "",
      acquiredOn: "2026-02-30",
      quantity: "2",
      purchaseUnit: "metro",
      amount: "100",
      freight: "",
      notes: "",
    });

    expect(badDate.ok).toBe(false);

    if (!badDate.ok) {
      expect(badDate.errors.acquiredOn).toBeDefined();
    }
  });

  it("keeps freight optional and rejects negative", () => {
    const withoutFreight = validateSupplyPrice({
      supplierId: "",
      acquiredOn: "2026-10-28",
      quantity: "2",
      purchaseUnit: "metro",
      amount: "100",
      freight: "",
      notes: "",
    });

    expect(withoutFreight.ok).toBe(true);

    if (withoutFreight.ok) {
      expect(withoutFreight.data.freightCents).toBe(0);
    }

    const badFreight = validateSupplyPrice({
      supplierId: "",
      acquiredOn: "2026-10-28",
      quantity: "2",
      purchaseUnit: "metro",
      amount: "100",
      freight: "-5",
      notes: "",
    });

    expect(badFreight.ok).toBe(false);

    if (!badFreight.ok) {
      expect(badFreight.errors.freight).toBeDefined();
    }
  });

  it("requires a known purchase unit", () => {
    const result = validateSupplyPrice({
      supplierId: "",
      acquiredOn: "2026-10-28",
      quantity: "2",
      purchaseUnit: "jarda",
      amount: "100",
      freight: "",
      notes: "",
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.purchaseUnit).toBeDefined();
    }
  });
});
