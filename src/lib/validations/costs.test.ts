import { validateLaborCost, validateOperatingExpense } from "./costs";

describe("validateOperatingExpense", () => {
  it("normalizes a valid expense", () => {
    const result = validateOperatingExpense({
      name: "Aluguel",
      amount: "1.200,00",
      notes: "",
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.name).toBe("Aluguel");
      expect(result.data.amountCents).toBe(120000);
    }
  });

  it("rejects zero and invalid amounts", () => {
    const zero = validateOperatingExpense({ name: "Aluguel", amount: "0", notes: "" });

    expect(zero.ok).toBe(false);

    if (!zero.ok) {
      expect(zero.errors.amount).toBeDefined();
    }

    const invalid = validateOperatingExpense({ name: "Aluguel", amount: "", notes: "" });

    expect(invalid.ok).toBe(false);

    if (!invalid.ok) {
      expect(invalid.errors.amount).toBeDefined();
    }
  });

  it("requires a name", () => {
    const result = validateOperatingExpense({ name: "a", amount: "100", notes: "" });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.name).toBeDefined();
    }
  });

  it("rejects long notes", () => {
    const result = validateOperatingExpense({
      name: "Aluguel",
      amount: "100",
      notes: "x".repeat(501),
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.notes).toBeDefined();
    }
  });
});

describe("validateLaborCost", () => {
  it("normalizes a valid labor cost", () => {
    const result = validateLaborCost({
      name: "Costureira",
      wage: "2.000,00",
      hours: "176",
      notes: "",
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.monthlyWageCents).toBe(200000);
      expect(result.data.standardHoursMonth).toBe(176);
      expect(result.data.notes).toBe("");
    }
  });

  it("accepts comma hours", () => {
    const result = validateLaborCost({
      name: "Costureira",
      wage: "2000",
      hours: "176,5",
      notes: "",
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.standardHoursMonth).toBe(176.5);
    }
  });

  it("rejects invalid wage, hours and notes", () => {
    const wage = validateLaborCost({ name: "Costureira", wage: "0", hours: "176", notes: "" });

    expect(wage.ok).toBe(false);

    if (!wage.ok) {
      expect(wage.errors.wage).toBeDefined();
    }

    const hours = validateLaborCost({ name: "Costureira", wage: "100", hours: "500", notes: "" });

    expect(hours.ok).toBe(false);

    if (!hours.ok) {
      expect(hours.errors.hours).toBeDefined();
    }

    const name = validateLaborCost({ name: "", wage: "100", hours: "176", notes: "" });

    expect(name.ok).toBe(false);

    if (!name.ok) {
      expect(name.errors.name).toBeDefined();
    }
  });
});
