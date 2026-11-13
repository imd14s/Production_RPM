import { buildChannelFeePayload, buildChannelPayload } from "./payload";

describe("buildChannelPayload", () => {
  it("maps channel fields to database columns", () => {
    const payload = buildChannelPayload({
      name: "Mercado Livre",
      kind: "marketplace",
      notes: "Loja oficial",
    });

    expect(payload).toEqual({
      name: "Mercado Livre",
      kind: "marketplace",
      notes: "Loja oficial",
    });
  });

  it("never sends empty strings to the notes column", () => {
    const payload = buildChannelPayload({ name: "WhatsApp", kind: "whatsapp", notes: "" });

    expect(payload.notes).toBeNull();
  });
});

describe("buildChannelFeePayload", () => {
  it("maps a percentage fee without installments", () => {
    const payload = buildChannelFeePayload("channel-1", {
      label: "Comissão",
      kind: "percentual",
      rate: "12.500000",
      amountCents: null,
      installments: null,
      notes: "",
    });

    expect(payload).toEqual({
      channel_id: "channel-1",
      label: "Comissão",
      kind: "percentual",
      rate: "12.500000",
      amount_cents: null,
      installments: null,
      notes: null,
    });
  });

  it("maps a fixed fee with installments", () => {
    const payload = buildChannelFeePayload("channel-1", {
      label: "Frete",
      kind: "fixo",
      rate: null,
      amountCents: 690,
      installments: 6,
      notes: "por pedido",
    });

    expect(payload.amount_cents).toBe(690);
    expect(payload.installments).toBe(6);
    expect(payload.rate).toBeNull();
  });
});
