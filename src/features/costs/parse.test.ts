import {
  parseLaborCostRow,
  parseOperatingExpenseRow,
} from "./parse";
import {
  buildLaborCostPayload,
  buildOperatingExpensePayload,
} from "./payload";

const EXPENSE_ROW = {
  id: "e1b2c3d4-0000-4000-8000-000000000001",
  name: "Aluguel",
  amount_cents: 120000,
  is_active: true,
  notes: "Contrato até 2027",
};

const LABOR_ROW = {
  id: "f1b2c3d4-0000-4000-8000-000000000002",
  name: "Costureira",
  monthly_wage_cents: 200000,
  standard_hours_month: 176,
  is_active: true,
  notes: "",
};

describe("parseOperatingExpenseRow", () => {
  it("maps snake case to camel case", () => {
    const expense = parseOperatingExpenseRow(EXPENSE_ROW);

    expect(expense).toEqual({
      id: EXPENSE_ROW.id,
      name: "Aluguel",
      amountCents: 120000,
      isActive: true,
      notes: "Contrato até 2027",
    });
  });

  it("rejects zero or non-integer amounts", () => {
    expect(parseOperatingExpenseRow({ ...EXPENSE_ROW, amount_cents: 0 })).toBeNull();
    expect(parseOperatingExpenseRow({ ...EXPENSE_ROW, amount_cents: 12.5 })).toBeNull();
    expect(parseOperatingExpenseRow({ ...EXPENSE_ROW, name: "" })).toBeNull();
    expect(parseOperatingExpenseRow(null)).toBeNull();
  });
});

describe("parseLaborCostRow", () => {
  it("maps snake case to camel case", () => {
    const labor = parseLaborCostRow(LABOR_ROW);

    expect(labor).toEqual({
      id: LABOR_ROW.id,
      name: "Costureira",
      monthlyWageCents: 200000,
      standardHoursMonth: 176,
      isActive: true,
      notes: "",
    });
  });

  it("rejects invalid wages and hours", () => {
    expect(parseLaborCostRow({ ...LABOR_ROW, monthly_wage_cents: 0 })).toBeNull();
    expect(parseLaborCostRow({ ...LABOR_ROW, standard_hours_month: 0 })).toBeNull();
    expect(parseLaborCostRow({ ...LABOR_ROW, standard_hours_month: 500 })).toBeNull();
    expect(parseLaborCostRow({ ...LABOR_ROW, is_active: "sim" })).toBeNull();
  });
});

describe("buildOperatingExpensePayload", () => {
  it("maps expense fields to database columns", () => {
    const payload = buildOperatingExpensePayload({
      name: "Aluguel",
      amountCents: 120000,
      notes: "Contrato até 2027",
    });

    expect(payload).toEqual({
      name: "Aluguel",
      amount_cents: 120000,
      notes: "Contrato até 2027",
    });
  });

  it("never sends empty strings to the notes column", () => {
    const payload = buildOperatingExpensePayload({
      name: "Internet",
      amountCents: 9990,
      notes: "",
    });

    expect(payload.notes).toBeNull();
  });
});

describe("buildLaborCostPayload", () => {
  it("maps labor fields to database columns", () => {
    const payload = buildLaborCostPayload({
      name: "Costureira",
      monthlyWageCents: 200000,
      standardHoursMonth: 176.5,
      notes: "",
    });

    expect(payload).toEqual({
      name: "Costureira",
      monthly_wage_cents: 200000,
      standard_hours_month: 176.5,
      notes: null,
    });
  });
});
