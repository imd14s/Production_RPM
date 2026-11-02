import {
  parseSupplyPriceRow,
  parseSupplyRow,
  parseSupplyUnitConversionRow,
} from "./parse";
import {
  buildSupplyPayload,
  buildSupplyPricePayload,
  buildSupplyUnitConversionPayload,
  calculateUnitCostCents,
  convertQuantityToBaseUnit,
  parseSupplyUnit,
} from "./payload";
import { formatAcquisitionQuantity } from "./format";

const SUPPLY_ROW = {
  id: "b3b2c3d4-0000-4000-8000-000000000001",
  name: "Tecido bolso",
  kind: "materia_prima",
  unit: "metro",
  is_active: true,
  notes: "",
};

const PRICE_ROW = {
  id: "c3b2c3d4-0000-4000-8000-000000000002",
  supply_id: SUPPLY_ROW.id,
  supplier_id: null,
  acquired_on: "2026-10-28",
  quantity: 12.5,
  purchase_unit: "metro",
  amount_cents: 24900,
  freight_cents: 1500,
  unit_cost_cents: 2112,
  notes: "Compra na Aurora",
};

describe("parseSupplyRow", () => {
  it("maps snake case to camel case", () => {
    const supply = parseSupplyRow(SUPPLY_ROW);

    expect(supply).toEqual({
      id: SUPPLY_ROW.id,
      name: "Tecido bolso",
      kind: "materia_prima",
      unit: "metro",
      isActive: true,
      notes: "",
    });
  });

  it("rejects unknown kinds, units and empty names", () => {
    expect(parseSupplyRow({ ...SUPPLY_ROW, kind: "aluguel" })).toBeNull();
    expect(parseSupplyRow({ ...SUPPLY_ROW, unit: "jarda" })).toBeNull();
    expect(parseSupplyRow({ ...SUPPLY_ROW, name: "" })).toBeNull();
    expect(parseSupplyRow(null)).toBeNull();
  });
});

describe("parseSupplyPriceRow", () => {
  it("maps an acquisition with supplier", () => {
    const price = parseSupplyPriceRow({
      ...PRICE_ROW,
      supplier_id: "d3b2c3d4-0000-4000-8000-000000000009",
    });

    expect(price).toEqual({
      id: PRICE_ROW.id,
      supplyId: SUPPLY_ROW.id,
      supplierId: "d3b2c3d4-0000-4000-8000-000000000009",
      acquiredOn: "2026-10-28",
      quantity: 12.5,
      purchaseUnit: "metro",
      amountCents: 24900,
      freightCents: 1500,
      unitCostCents: 2112,
      notes: "Compra na Aurora",
    });
  });

  it("rejects broken acquisitions", () => {
    expect(parseSupplyPriceRow({ ...PRICE_ROW, quantity: 0 })).toBeNull();
    expect(parseSupplyPriceRow({ ...PRICE_ROW, purchase_unit: "jarda" })).toBeNull();
    expect(parseSupplyPriceRow({ ...PRICE_ROW, purchase_unit: undefined })).toBeNull();
    expect(parseSupplyPriceRow({ ...PRICE_ROW, amount_cents: 0 })).toBeNull();
    expect(parseSupplyPriceRow({ ...PRICE_ROW, unit_cost_cents: 0 })).toBeNull();
    expect(parseSupplyPriceRow({ ...PRICE_ROW, acquired_on: "28/10/2026" })).toBeNull();
    expect(parseSupplyPriceRow({ ...PRICE_ROW, amount_cents: 249.5 })).toBeNull();
    expect(parseSupplyPriceRow(null)).toBeNull();
  });
});

describe("calculateUnitCostCents", () => {
  it("spreads purchase and freight over quantity with rounding", () => {
    expect(calculateUnitCostCents(24900, 1500, 12.5)).toBe(2112);
    expect(calculateUnitCostCents(1000, 0, 3)).toBe(333);
    expect(calculateUnitCostCents(1001, 0, 3)).toBe(334);
  });

  it("refuses zero quantity as a programming error", () => {
    expect(() => calculateUnitCostCents(1000, 0, 0)).toThrow();
  });
});

describe("convertQuantityToBaseUnit", () => {
  const kilogramToGram = {
    id: "conv-kg-g",
    supplyId: SUPPLY_ROW.id,
    fromUnit: "quilograma" as const,
    toUnit: "grama" as const,
    factor: 1000,
    isActive: true,
    notes: "",
  };

  it("uses a direct active conversion to normalize the purchase quantity", () => {
    expect(
      convertQuantityToBaseUnit(2, "quilograma", "grama", [kilogramToGram]),
    ).toBe(2000);
  });

  it("uses the inverse of an active conversion when needed", () => {
    expect(
      convertQuantityToBaseUnit(500, "grama", "quilograma", [kilogramToGram]),
    ).toBe(0.5);
  });

  it("does not use inactive conversions", () => {
    expect(() =>
      convertQuantityToBaseUnit(2, "quilograma", "grama", [
        { ...kilogramToGram, isActive: false },
      ]),
    ).toThrow("Cadastre uma conversão ativa");
  });

  it("rejects missing and conflicting conversion factors", () => {
    expect(() => convertQuantityToBaseUnit(2, "quilograma", "grama", [])).toThrow(
      "Cadastre uma conversão ativa",
    );
    expect(() =>
      convertQuantityToBaseUnit(2, "quilograma", "grama", [
        kilogramToGram,
        {
          ...kilogramToGram,
          id: "conv-g-kg",
          fromUnit: "grama",
          toUnit: "quilograma",
          factor: 0.002,
        },
      ]),
    ).toThrow("conversões ativas conflitantes");
  });

  it("accepts consistent conversions registered in both directions", () => {
    expect(
      convertQuantityToBaseUnit(2, "quilograma", "grama", [
        kilogramToGram,
        {
          ...kilogramToGram,
          id: "conv-g-kg",
          fromUnit: "grama",
          toUnit: "quilograma",
          factor: 0.001,
        },
      ]),
    ).toBe(2000);
  });

  it("keeps the input quantity when the purchase already uses the base unit", () => {
    expect(convertQuantityToBaseUnit(2.5, "grama", "grama", [])).toBe(2.5);
  });
});

describe("formatAcquisitionQuantity", () => {
  it("displays the entered purchase quantity with its original unit", () => {
    expect(formatAcquisitionQuantity(2, "quilograma")).toBe("2 quilograma");
    expect(formatAcquisitionQuantity(12.5, "metro")).toBe("12,5 metro");
  });
});

describe("parseSupplyUnit", () => {
  it("accepts known units and rejects others", () => {
    expect(parseSupplyUnit("metro")).toBe("metro");
    expect(parseSupplyUnit("jarda")).toBeNull();
    expect(parseSupplyUnit(3)).toBeNull();
  });
});

describe("buildSupplyPayload", () => {
  it("maps supply fields to database columns", () => {
    expect(
      buildSupplyPayload({
        name: "Tecido bolso",
        kind: "materia_prima",
        unit: "metro",
        notes: "",
      }),
    ).toEqual({
      name: "Tecido bolso",
      kind: "materia_prima",
      unit: "metro",
      notes: null,
    });
  });
});

describe("buildSupplyPricePayload", () => {
  it("includes the unit cost snapshot", () => {
    const payload = buildSupplyPricePayload("supply-1", {
      supplierId: "supplier-1",
      acquiredOn: "2026-10-28",
      quantity: 12.5,
      purchaseUnit: "metro",
      amountCents: 24900,
      freightCents: 1500,
      notes: "",
    }, "metro");

    expect(payload).toEqual({
      supply_id: "supply-1",
      supplier_id: "supplier-1",
      acquired_on: "2026-10-28",
      quantity: 12.5,
      purchase_unit: "metro",
      amount_cents: 24900,
      freight_cents: 1500,
      unit_cost_cents: 2112,
      notes: null,
    });
  });

  it("sends null supplier when not informed", () => {
    const payload = buildSupplyPricePayload("supply-1", {
      supplierId: null,
      acquiredOn: "2026-10-28",
      quantity: 1,
      purchaseUnit: "metro",
      amountCents: 500,
      freightCents: 0,
      notes: "",
    }, "metro");

    expect(payload.supplier_id).toBeNull();
    expect(payload.unit_cost_cents).toBe(500);
  });

  it("calculates cost per base unit and stores the original purchase unit", () => {
    const conversion = {
      id: "conv-kg-g",
      supplyId: SUPPLY_ROW.id,
      fromUnit: "quilograma" as const,
      toUnit: "grama" as const,
      factor: 1000,
      isActive: true,
      notes: "",
    };
    const payload = buildSupplyPricePayload(
      SUPPLY_ROW.id,
      {
        supplierId: null,
        acquiredOn: "2026-10-28",
        quantity: 2,
        purchaseUnit: "quilograma",
        amountCents: 2000,
        freightCents: 0,
        notes: "",
      },
      "grama",
      [conversion],
    );

    expect(payload.quantity).toBe(2);
    expect(payload.purchase_unit).toBe("quilograma");
    expect(payload.unit_cost_cents).toBe(1);
  });
});

describe("parseSupplyUnitConversionRow", () => {
  it("maps a conversion row", () => {
    const conversion = parseSupplyUnitConversionRow({
      id: "conv-1",
      supply_id: "supply-1",
      from_unit: "quilograma",
      to_unit: "grama",
      factor: 1000,
      is_active: true,
      notes: "fator padrão",
    });

    expect(conversion).toEqual({
      id: "conv-1",
      supplyId: "supply-1",
      fromUnit: "quilograma",
      toUnit: "grama",
      factor: 1000,
      isActive: true,
      notes: "fator padrão",
    });
  });

  it("rejects equal units and invalid factors", () => {
    expect(
      parseSupplyUnitConversionRow({
        id: "conv-2",
        supply_id: "supply-1",
        from_unit: "grama",
        to_unit: "grama",
        factor: 1,
        is_active: true,
        notes: "",
      }),
    ).toBeNull();

    expect(
      parseSupplyUnitConversionRow({
        id: "conv-3",
        supply_id: "supply-1",
        from_unit: "quilograma",
        to_unit: "grama",
        factor: 0,
        is_active: true,
        notes: "",
      }),
    ).toBeNull();

    expect(parseSupplyUnitConversionRow(null)).toBeNull();
  });
});

describe("buildSupplyUnitConversionPayload", () => {
  it("builds the conversion payload", () => {
    const payload = buildSupplyUnitConversionPayload({
      supplyId: "supply-1",
      fromUnit: "quilograma",
      toUnit: "grama",
      factor: 1000,
      notes: "fator padrão",
    });

    expect(payload).toEqual({
      supply_id: "supply-1",
      from_unit: "quilograma",
      to_unit: "grama",
      factor: 1000,
      notes: "fator padrão",
    });
  });

  it("sends null notes when empty", () => {
    const payload = buildSupplyUnitConversionPayload({
      supplyId: "supply-1",
      fromUnit: "litro",
      toUnit: "mililitro",
      factor: 1000,
      notes: "",
    });

    expect(payload.notes).toBeNull();
  });
});
