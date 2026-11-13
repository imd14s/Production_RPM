import { validateChannel, validateChannelFee } from "./channels";

const VALID_CHANNEL = {
  name: "Mercado Livre",
  kind: "marketplace",
  notes: "Loja oficial",
};

const VALID_FEE = {
  label: "Comissão",
  kind: "percentual",
  rate: "12,5",
  amount: "",
  installments: "",
  notes: "",
};

describe("validateChannel", () => {
  it("normalizes a valid channel", () => {
    const result = validateChannel(VALID_CHANNEL);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.name).toBe("Mercado Livre");
      expect(result.data.kind).toBe("marketplace");
    }
  });

  it("requires a known kind", () => {
    const result = validateChannel({ ...VALID_CHANNEL, kind: "bazar" });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.kind).toBeDefined();
    }
  });

  it("requires a name with at least two characters", () => {
    const result = validateChannel({ ...VALID_CHANNEL, name: "a" });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.name).toBeDefined();
    }
  });

  it("rejects long notes", () => {
    const result = validateChannel({ ...VALID_CHANNEL, notes: "x".repeat(501) });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.notes).toBeDefined();
    }
  });
});

describe("validateChannelFee", () => {
  it("normalizes a percentage fee", () => {
    const result = validateChannelFee(VALID_FEE);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.rate).toBe("12.500000");
      expect(result.data.installments).toBeNull();
    }
  });

  it("normalizes a fixed fee with installments", () => {
    const result = validateChannelFee({
      ...VALID_FEE,
      kind: "fixo",
      rate: "",
      amount: "6,90",
      installments: "6",
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.amountCents).toBe(690);
      expect(result.data.installments).toBe(6);
    }
  });

  it("rejects installments outside the range", () => {
    const result = validateChannelFee({ ...VALID_FEE, installments: "30" });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.installments).toBeDefined();
    }
  });

  it("rejects non integer installments", () => {
    const result = validateChannelFee({ ...VALID_FEE, installments: "2,5" });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.installments).toBeDefined();
    }
  });

  it("requires a value for the chosen kind", () => {
    const result = validateChannelFee({ ...VALID_FEE, rate: "abc" });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.rate).toBeDefined();
    }
  });

  it("requires a label with at least two characters", () => {
    const result = validateChannelFee({ ...VALID_FEE, label: "a" });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.label).toBeDefined();
    }
  });
});
