import {
  parseSupplyPriceRow,
  parseSupplyRow,
} from "./parse";
import {
  buildSupplyPayload,
  buildSupplyPricePayload,
  calculateUnitCostCents,
  calculateUnitCostInBaseUnit,
  convertQuantityToBaseUnit,
  parseSupplyUnit,
} from "./payload";
import { formatAcquisitionQuantity } from "./format";
import {
  SUPPLY_PURCHASE_UNITS,
  SUPPLY_PURCHASE_UNIT_LABELS,
} from "./types";

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

  it("reads PostgreSQL numeric columns returned as strings", () => {
    const price = parseSupplyPriceRow({
      ...PRICE_ROW,
      quantity: "12.5",
      amount_cents: "24900",
      freight_cents: "1500",
      unit_cost_cents: "2112",
    });

    expect(price?.quantity).toBe(12.5);
    expect(price?.amountCents).toBe(24900);
    expect(price?.freightCents).toBe(1500);
    expect(price?.unitCostCents).toBe(2112);
    expect(price?.purchaseUnit).toBe("metro");
    expect(
      price ? formatAcquisitionQuantity(price.quantity, price.purchaseUnit) : null,
    ).toBe("12,5 metro");
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
  it("converts kilogram to gram and liter to milliliter automatically", () => {
    expect(convertQuantityToBaseUnit(2, "quilograma", "grama")).toBe(2000);
    expect(convertQuantityToBaseUnit(1.5, "litro", "mililitro")).toBe(1500);
  });

  it("converts gram to kilogram and milliliter to liter automatically", () => {
    expect(convertQuantityToBaseUnit(500, "grama", "quilograma")).toBe(0.5);
    expect(convertQuantityToBaseUnit(500, "mililitro", "litro")).toBe(0.5);
  });

  it("keeps the quantity unchanged when both units match", () => {
    expect(convertQuantityToBaseUnit(2.5, "grama", "grama")).toBe(2.5);
    expect(convertQuantityToBaseUnit(3, "pacote", "pacote")).toBe(3);
  });

  it("rejects incompatible unit families instead of assuming a conversion", () => {
    expect(convertQuantityToBaseUnit(2, "quilograma", "metro")).toBeNull();
    expect(convertQuantityToBaseUnit(2, "litro", "grama")).toBeNull();
    expect(convertQuantityToBaseUnit(2, "pacote", "unidade")).toBeNull();
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

describe("supply purchase unit options", () => {
  it("uses the five requested units", () => {
    expect(SUPPLY_PURCHASE_UNITS).toEqual([
      "quilograma",
      "grama",
      "litro",
      "unidade",
      "outro",
    ]);
    expect(
      SUPPLY_PURCHASE_UNITS.map((unit) => SUPPLY_PURCHASE_UNIT_LABELS[unit]),
    ).toEqual(["kg", "gm", "L", "unidade", "outro"]);
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
    });

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
    });

    expect(payload.supplier_id).toBeNull();
    expect(payload.unit_cost_cents).toBe(500);
  });

  it("saves the original quantity and unit without rejecting incompatible units", () => {
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
    );

    expect(payload.quantity).toBe(2);
    expect(payload.purchase_unit).toBe("quilograma");
    expect(payload.unit_cost_cents).toBe(1000);
  });

  it("saves a liter purchase for a gram-based supply", () => {
    const payload = buildSupplyPricePayload(SUPPLY_ROW.id, {
      supplierId: null,
      acquiredOn: "2026-10-28",
      quantity: 2,
      purchaseUnit: "litro",
      amountCents: 5000,
      freightCents: 0,
      notes: "",
    });

    expect(payload.quantity).toBe(2);
    expect(payload.purchase_unit).toBe("litro");
    expect(payload.unit_cost_cents).toBe(2500);
    expect(
      calculateUnitCostInBaseUnit(
        {
          quantity: 2,
          purchaseUnit: "litro",
          amountCents: 5000,
          freightCents: 0,
        },
        "grama",
      ),
    ).toBeNull();
  });
});
