import { parseChannelFeeRow, parseChannelRow } from "./parse";
import { formatPercentLabel } from "@/lib/percent";

const CHANNEL_ROW = {
  id: "a1b2c3d4-0000-4000-8000-000000000001",
  name: "Mercado Livre",
  kind: "marketplace",
  is_active: true,
  notes: "Loja oficial",
};

const FEE_ROW = {
  id: "b1b2c3d4-0000-4000-8000-000000000002",
  channel_id: CHANNEL_ROW.id,
  label: "Comissão",
  kind: "percentual",
  rate: "12.500000",
  amount_cents: null,
  installments: null,
  is_active: true,
  notes: "",
};

describe("parseChannelRow", () => {
  it("maps snake case to camel case", () => {
    const channel = parseChannelRow(CHANNEL_ROW);

    expect(channel).toEqual({
      id: CHANNEL_ROW.id,
      name: "Mercado Livre",
      kind: "marketplace",
      isActive: true,
      notes: "Loja oficial",
    });
  });

  it("rejects unknown kinds and empty names", () => {
    expect(parseChannelRow({ ...CHANNEL_ROW, kind: "bazar" })).toBeNull();
    expect(parseChannelRow({ ...CHANNEL_ROW, name: "" })).toBeNull();
    expect(parseChannelRow({ ...CHANNEL_ROW, is_active: "sim" })).toBeNull();
  });

  it("rejects non objects", () => {
    expect(parseChannelRow(null)).toBeNull();
    expect(parseChannelRow("mercado livre")).toBeNull();
  });
});

describe("parseChannelFeeRow", () => {
  it("parses a percentage fee", () => {
    const fee = parseChannelFeeRow(FEE_ROW);

    expect(fee?.kind).toBe("percentual");
    expect(fee?.rate).toBe("12.500000");
    expect(fee?.amountCents).toBeNull();
  });

  it("parses numeric database rates into the value displayed by the channel list", () => {
    const fee = parseChannelFeeRow({ ...FEE_ROW, rate: 8 });

    expect(fee?.rate).toBe("8.000000");
    expect(fee ? formatPercentLabel(fee.rate ?? "0") : null).toBe("8 %");
  });

  it("parses a fixed fee with installments", () => {
    const fee = parseChannelFeeRow({ ...FEE_ROW, kind: "fixo", rate: null, amount_cents: 690, installments: 6 });

    expect(fee?.amountCents).toBe(690);
    expect(fee?.installments).toBe(6);
  });

  it("rejects inconsistent value and kind", () => {
    expect(parseChannelFeeRow({ ...FEE_ROW, rate: null })).toBeNull();
    expect(parseChannelFeeRow({ ...FEE_ROW, kind: "fixo" })).toBeNull();
    expect(parseChannelFeeRow({ ...FEE_ROW, rate: "inválido" })).toBeNull();
    expect(parseChannelFeeRow({ ...FEE_ROW, rate: 101 })).toBeNull();
  });

  it("rejects installments outside the valid range", () => {
    expect(parseChannelFeeRow({ ...FEE_ROW, installments: 0 })).toBeNull();
    expect(parseChannelFeeRow({ ...FEE_ROW, installments: 25 })).toBeNull();
    expect(parseChannelFeeRow({ ...FEE_ROW, installments: 3.5 })).toBeNull();
  });
});
