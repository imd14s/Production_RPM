import { validatePaymentFee, validatePaymentMethod } from "./payments";

const VALID_METHOD = {
  name: "Pix do ateliê",
  kind: "pix",
  notes: "Conta própria",
};

const VALID_FEE = {
  label: "Taxa do Pix",
  kind: "percentual",
  rate: "0,99",
  amount: "",
  installments: "",
  notes: "",
};

describe("validatePaymentMethod", () => {
  it("normalizes a valid method", () => {
    const result = validatePaymentMethod(VALID_METHOD);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.name).toBe("Pix do ateliê");
      expect(result.data.kind).toBe("pix");
    }
  });

  it("requires a known kind", () => {
    const result = validatePaymentMethod({ ...VALID_METHOD, kind: "cheque" });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.kind).toBeDefined();
    }
  });

  it("requires a name with at least two characters", () => {
    const result = validatePaymentMethod({ ...VALID_METHOD, name: "a" });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.name).toBeDefined();
    }
  });

  it("rejects long notes", () => {
    const result = validatePaymentMethod({ ...VALID_METHOD, notes: "x".repeat(501) });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.notes).toBeDefined();
    }
  });
});

describe("validatePaymentFee", () => {
  it("normalizes a percentage fee", () => {
    const result = validatePaymentFee(VALID_FEE);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.rate).toBe("0.990000");
      expect(result.data.amountCents).toBeNull();
      expect(result.data.installments).toBeNull();
      expect(result.data.notes).toBe("");
    }
  });

  it("normalizes a fixed fee with installments", () => {
    const result = validatePaymentFee({
      label: "Parcelamento sem juros",
      kind: "fixo",
      rate: "",
      amount: "6,90",
      installments: "12",
      notes: "",
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.amountCents).toBe(690);
      expect(result.data.installments).toBe(12);
      expect(result.data.rate).toBeNull();
    }
  });

  it("requires a fee kind", () => {
    const result = validatePaymentFee({ ...VALID_FEE, kind: "desconto" });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.kind).toBeDefined();
    }
  });

  it("rejects invalid percentage as user input", () => {
    const result = validatePaymentFee({ ...VALID_FEE, rate: "150" });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.rate).toBeDefined();
    }
  });

  it("rejects invalid installments", () => {
    const result = validatePaymentFee({ ...VALID_FEE, installments: "25" });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.installments).toBeDefined();
    }
  });

  it("requires the fixed amount when kind is fixo", () => {
    const result = validatePaymentFee({ ...VALID_FEE, kind: "fixo", rate: "", amount: "" });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.amount).toBeDefined();
    }
  });
});
