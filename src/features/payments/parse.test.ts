import {
  parsePaymentFeeRow,
  parsePaymentMethodRow,
} from "./parse";

const METHOD_ROW = {
  id: "c1b2c3d4-0000-4000-8000-000000000001",
  name: "Pix do ateliê",
  kind: "pix",
  is_active: true,
  notes: "Conta própria",
};

const FEE_ROW = {
  id: "d1b2c3d4-0000-4000-8000-000000000002",
  method_id: METHOD_ROW.id,
  label: "Taxa do Pix",
  kind: "percentual",
  rate: "0.990000",
  amount_cents: null,
  installments: null,
  is_active: true,
  notes: "",
};

describe("parsePaymentMethodRow", () => {
  it("maps snake case to camel case", () => {
    const method = parsePaymentMethodRow(METHOD_ROW);

    expect(method).toEqual({
      id: METHOD_ROW.id,
      name: "Pix do ateliê",
      kind: "pix",
      isActive: true,
      notes: "Conta própria",
    });
  });

  it("rejects unknown kinds and empty names", () => {
    expect(parsePaymentMethodRow({ ...METHOD_ROW, kind: "cheque" })).toBeNull();
    expect(parsePaymentMethodRow({ ...METHOD_ROW, name: "" })).toBeNull();
    expect(parsePaymentMethodRow({ ...METHOD_ROW, is_active: "sim" })).toBeNull();
  });

  it("rejects rows without an id or not object", () => {
    expect(parsePaymentMethodRow({ ...METHOD_ROW, id: 7 })).toBeNull();
    expect(parsePaymentMethodRow(null)).toBeNull();
    expect(parsePaymentMethodRow("pix")).toBeNull();
  });
});

describe("parsePaymentFeeRow", () => {
  it("maps a percentage fee", () => {
    const fee = parsePaymentFeeRow(FEE_ROW);

    expect(fee).toEqual({
      id: FEE_ROW.id,
      methodId: METHOD_ROW.id,
      label: "Taxa do Pix",
      kind: "percentual",
      rate: "0.990000",
      amountCents: null,
      installments: null,
      isActive: true,
      notes: "",
    });
  });

  it("maps a fixed fee with installments", () => {
    const fee = parsePaymentFeeRow({
      ...FEE_ROW,
      kind: "fixo",
      rate: null,
      amount_cents: 690,
      installments: 12,
    });

    expect(fee?.kind).toBe("fixo");
    expect(fee?.amountCents).toBe(690);
    expect(fee?.installments).toBe(12);
    expect(fee?.rate).toBeNull();
  });

  it("rejects invalid installments and kind mismatch", () => {
    expect(parsePaymentFeeRow({ ...FEE_ROW, installments: 25 })).toBeNull();
    expect(parsePaymentFeeRow({ ...FEE_ROW, installments: 1.5 })).toBeNull();
    expect(parsePaymentFeeRow({ ...FEE_ROW, kind: "fixo" })).toBeNull();
    expect(parsePaymentFeeRow({ ...FEE_ROW, method_id: null })).toBeNull();
  });
});
