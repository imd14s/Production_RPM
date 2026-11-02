import {
  buildPaymentFeePayload,
  buildPaymentMethodPayload,
} from "./payload";

describe("buildPaymentMethodPayload", () => {
  it("maps method fields to database columns", () => {
    const payload = buildPaymentMethodPayload({
      name: "Pix do ateliê",
      kind: "pix",
      notes: "Conta própria",
    });

    expect(payload).toEqual({
      name: "Pix do ateliê",
      kind: "pix",
      notes: "Conta própria",
    });
  });

  it("never sends empty strings to the notes column", () => {
    const payload = buildPaymentMethodPayload({
      name: "Stone",
      kind: "carteira_digital",
      notes: "",
    });

    expect(payload.notes).toBeNull();
  });
});

describe("buildPaymentFeePayload", () => {
  it("maps a percentage fee without installments", () => {
    const payload = buildPaymentFeePayload("method-1", {
      label: "Taxa do Pix",
      kind: "percentual",
      rate: "0.990000",
      amountCents: null,
      installments: null,
      notes: "",
    });

    expect(payload).toEqual({
      method_id: "method-1",
      label: "Taxa do Pix",
      kind: "percentual",
      rate: "0.990000",
      amount_cents: null,
      installments: null,
      notes: null,
    });
  });

  it("maps a fixed fee with installments", () => {
    const payload = buildPaymentFeePayload("method-1", {
      label: "Parcelamento sem juros",
      kind: "fixo",
      rate: null,
      amountCents: 690,
      installments: 12,
      notes: "por pedido",
    });

    expect(payload.amount_cents).toBe(690);
    expect(payload.installments).toBe(12);
    expect(payload.rate).toBeNull();
  });
});
