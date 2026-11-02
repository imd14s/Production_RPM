import {
  parseSupplyPriceRow,
  parseSupplyRow,
} from "./parse";
import {
  buildSupplyPayload,
  buildSupplyPricePayload,
  calculateUnitCostCents,
  parseSupplyUnit,
} from "./payload";

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
      amountCents: 24900,
      freightCents: 1500,
      unitCostCents: 2112,
      notes: "Compra na Aurora",
    });
  });

  it("rejects broken acquisitions", () => {
    expect(parseSupplyPriceRow({ ...PRICE_ROW, quantity: 0 })).toBeNull();
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
      amountCents: 24900,
      freightCents: 1500,
      notes: "",
    });

    expect(payload).toEqual({
      supply_id: "supply-1",
      supplier_id: "supplier-1",
      acquired_on: "2026-10-28",
      quantity: 12.5,
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
      amountCents: 500,
      freightCents: 0,
      notes: "",
    });

    expect(payload.supplier_id).toBeNull();
    expect(payload.unit_cost_cents).toBe(500);
  });
});
