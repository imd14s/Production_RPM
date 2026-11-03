import { parseSupplyRow } from "./parse";
import {
  buildSupplyPayload,
  calculateUnitCostCents,
} from "./payload";

const SUPPLY_ROW = {
  id: "b3b2c3d4-0000-4000-8000-000000000001",
  name: "Tecido bolso",
  kind: "materia_prima",
  unit: "metro",
  quantity: "12.5",
  acquired_on: "2026-10-28",
  amount_cents: "24900",
  freight_cents: "1500",
  unit_cost_cents: "2112",
  is_active: true,
  notes: "",
};

describe("parseSupplyRow", () => {
  it("maps current cost fields and PostgreSQL numeric strings", () => {
    expect(parseSupplyRow(SUPPLY_ROW)).toEqual({
      id: SUPPLY_ROW.id,
      name: "Tecido bolso",
      kind: "materia_prima",
      unit: "metro",
      quantity: 12.5,
      acquiredOn: "2026-10-28",
      amountCents: 24900,
      freightCents: 1500,
      currentUnitCostCents: 2112,
      isActive: true,
      notes: "",
    });
  });

  it("allows an existing supply without a migratable cost", () => {
    expect(
      parseSupplyRow({
        ...SUPPLY_ROW,
        quantity: null,
        acquired_on: null,
        amount_cents: null,
        freight_cents: null,
        unit_cost_cents: null,
      }),
    ).toMatchObject({
      id: SUPPLY_ROW.id,
      quantity: null,
      acquiredOn: null,
      amountCents: null,
      freightCents: null,
      currentUnitCostCents: null,
    });
  });

  it("rejects malformed supply and partial cost records", () => {
    expect(parseSupplyRow({ ...SUPPLY_ROW, kind: "aluguel" })).toBeNull();
    expect(parseSupplyRow({ ...SUPPLY_ROW, unit: "jarda" })).toBeNull();
    expect(parseSupplyRow({ ...SUPPLY_ROW, name: "" })).toBeNull();
    expect(parseSupplyRow({ ...SUPPLY_ROW, acquired_on: "2026-02-30" })).toBeNull();
    expect(parseSupplyRow({ ...SUPPLY_ROW, freight_cents: null })).toBeNull();
    expect(parseSupplyRow(null)).toBeNull();
  });
});

describe("calculateUnitCostCents", () => {
  it("includes freight and rounds the amount per base unit", () => {
    expect(calculateUnitCostCents(24900, 1500, 12.5)).toBe(2112);
    expect(calculateUnitCostCents(1000, 0, 3)).toBe(333);
    expect(calculateUnitCostCents(1001, 0, 3)).toBe(334);
  });

  it("rejects invalid quantities and monetary values", () => {
    expect(() => calculateUnitCostCents(1000, 0, 0)).toThrow();
    expect(() => calculateUnitCostCents(0, 0, 1)).toThrow();
    expect(() => calculateUnitCostCents(1000, -1, 1)).toThrow();
    expect(() => calculateUnitCostCents(Number.MAX_SAFE_INTEGER, 1, 1)).toThrow();
  });
});

describe("buildSupplyPayload", () => {
  it("maps one supply and its current cost to database columns", () => {
    expect(
      buildSupplyPayload({
        name: "Tecido bolso",
        kind: "materia_prima",
        unit: "metro",
        quantity: 12.5,
        acquiredOn: "2026-10-28",
        amountCents: 24900,
        freightCents: 1500,
        notes: "",
      }),
    ).toEqual({
      name: "Tecido bolso",
      kind: "materia_prima",
      unit: "metro",
      quantity: 12.5,
      acquired_on: "2026-10-28",
      amount_cents: 24900,
      freight_cents: 1500,
      unit_cost_cents: 2112,
      notes: null,
    });
  });
});
