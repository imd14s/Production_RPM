import { validateSupply } from "./supplies";

describe("validateSupply", () => {
  it("normalizes supply and current cost fields from one form", () => {
    const result = validateSupply({
      name: "Cera Coco",
      kind: "materia_prima",
      unit: "litro",
      quantity: "5",
      acquiredOn: "2026-11-02",
      amount: "25,00",
      freight: "2,50",
      notes: "",
    });

    expect(result).toEqual({
      ok: true,
      data: {
        name: "Cera Coco",
        kind: "materia_prima",
        unit: "litro",
        unitsPerPackage: null,
        quantity: 5,
        acquiredOn: "2026-11-02",
        amountCents: 2500,
        freightCents: 250,
        notes: "",
      },
    });
  });

  it("accepts the units per package of a packaging supply", () => {
    const result = validateSupply({
      name: "Papel de presente",
      kind: "embalagem",
      unit: "caixa",
      unitsPerPackage: "12",
      quantity: "1",
      acquiredOn: "2026-11-02",
      amount: "25,00",
      freight: "",
      notes: "",
    });

    expect(result).toEqual({
      ok: true,
      data: expect.objectContaining({
        unit: "caixa",
        unitsPerPackage: 12,
      }),
    });
  });

  it("rejects units per package when the supply is not a packaging unit", () => {
    const result = validateSupply({
      name: "Cera Coco",
      kind: "materia_prima",
      unit: "litro",
      unitsPerPackage: "12",
      quantity: "5",
      acquiredOn: "2026-11-02",
      amount: "25,00",
      freight: "",
      notes: "",
    });

    expect(result).toEqual({
      ok: false,
      errors: {
        unitsPerPackage:
          "Equivalência de unidades só existe para caixa e pacote.",
      },
    });
  });

  it("rejects a non positive units per package", () => {
    const result = validateSupply({
      name: "Papel de presente",
      kind: "embalagem",
      unit: "caixa",
      unitsPerPackage: "0",
      quantity: "1",
      acquiredOn: "2026-11-02",
      amount: "25,00",
      freight: "",
      notes: "",
    });

    expect(result.ok).toBe(false);
  });

  it("defaults an empty acquisition date to today", () => {
    const result = validateSupply({
      name: "Tecido bolso",
      kind: "materia_prima",
      unit: "metro",
      quantity: "12,5",
      acquiredOn: "",
      amount: "249,00",
      freight: "",
      notes: "",
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.quantity).toBe(12.5);
      expect(result.data.freightCents).toBe(0);
      expect(result.data.acquiredOn).toMatch(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/);
    }
  });

  it("reports missing quantity and amount", () => {
    const result = validateSupply({
      name: "Cera Coco",
      kind: "materia_prima",
      unit: "litro",
      quantity: "",
      acquiredOn: "",
      amount: "",
      freight: "",
      notes: "",
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.quantity).toBeDefined();
      expect(result.errors.amount).toBeDefined();
    }
  });

  it("requires a known kind and unit", () => {
    const result = validateSupply({
      name: "Tecido bolso",
      kind: "loja",
      unit: "jarda",
      quantity: "1",
      acquiredOn: "",
      amount: "100",
      freight: "",
      notes: "",
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.kind).toBeDefined();
      expect(result.errors.unit).toBeDefined();
    }
  });

  it("rejects invalid quantities, dates, and freight", () => {
    const invalidQuantity = validateSupply({
      name: "Tecido bolso",
      kind: "materia_prima",
      unit: "metro",
      quantity: "0",
      acquiredOn: "",
      amount: "100",
      freight: "",
      notes: "",
    });

    expect(invalidQuantity.ok).toBe(false);

    if (!invalidQuantity.ok) {
      expect(invalidQuantity.errors.quantity).toBeDefined();
    }

    const invalidDate = validateSupply({
      name: "Tecido bolso",
      kind: "materia_prima",
      unit: "metro",
      quantity: "1",
      acquiredOn: "2026-02-30",
      amount: "100",
      freight: "",
      notes: "",
    });

    expect(invalidDate.ok).toBe(false);

    if (!invalidDate.ok) {
      expect(invalidDate.errors.acquiredOn).toBeDefined();
    }

    const invalidFreight = validateSupply({
      name: "Tecido bolso",
      kind: "materia_prima",
      unit: "metro",
      quantity: "1",
      acquiredOn: "",
      amount: "100",
      freight: "-5",
      notes: "",
    });

    expect(invalidFreight.ok).toBe(false);

    if (!invalidFreight.ok) {
      expect(invalidFreight.errors.freight).toBeDefined();
    }
  });

  it("requires a valid name", () => {
    const result = validateSupply({
      name: "a",
      kind: "materia_prima",
      unit: "metro",
      quantity: "1",
      acquiredOn: "",
      amount: "100",
      freight: "",
      notes: "",
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.name).toBeDefined();
    }
  });
});
