import { buildPricingMatrix } from "./pricingMatrix";

describe("buildPricingMatrix", () => {
  const baseChannel = {
    id: "ch-1",
    name: "Mercado Livre",
    fees: [] as Array<{
      kind: "percentual" | "fixo";
      rate: string | null;
      amountCents: number | null;
      isActive: boolean;
    }>,
  };

  it("calculates wholesale and retail prices with default margins", () => {
    const rows = buildPricingMatrix({
      products: [{ id: "p1", name: "Rosário", costCents: 10000, missing: [] }],
      channels: [baseChannel],
      taxes: [],
      simulations: [],
      defaultRetailMarginPercent: 30,
      defaultWholesaleMarginPercent: 20,
    });

    expect(rows).toHaveLength(1);
    expect(rows[0].cells).toHaveLength(2);
    expect(rows[0].cells[0].modality).toBe("varejo");
    expect(rows[0].cells[0].priceCents).toBe(14286);
    expect(rows[0].cells[1].modality).toBe("atacado");
    expect(rows[0].cells[1].priceCents).toBe(12500);
  });

  it("uses the latest simulation margin when available", () => {
    const rows = buildPricingMatrix({
      products: [{ id: "p1", name: "Rosário", costCents: 10000, missing: [] }],
      channels: [baseChannel],
      taxes: [],
      simulations: [
        {
          productId: "p1",
          channelId: "ch-1",
          modality: "varejo",
          marginPercent: 0.5,
          createdAt: "2026-11-03T10:00:00Z",
        },
        {
          productId: "p1",
          channelId: "ch-1",
          modality: "varejo",
          marginPercent: 0.35,
          createdAt: "2026-11-03T11:00:00Z",
        },
      ],
      defaultRetailMarginPercent: 30,
      defaultWholesaleMarginPercent: 20,
    });

    expect(rows[0].cells[0].marginPercent).toBe(0.35);
  });

  it("includes channel percentage fees in the price", () => {
    const rows = buildPricingMatrix({
      products: [{ id: "p1", name: "Rosário", costCents: 10000, missing: [] }],
      channels: [
        {
          ...baseChannel,
          fees: [{ kind: "percentual", rate: "10.000000", amountCents: null, isActive: true }],
        },
      ],
      taxes: [],
      simulations: [],
      defaultRetailMarginPercent: 30,
      defaultWholesaleMarginPercent: 20,
    });

    // custo 10000, taxa 10% e margem 30%: 10000 / (1 - 0.10 - 0.30) = 16667
    expect(rows[0].cells[0].priceCents).toBe(16667);
  });

  it("ignores inactive fees", () => {
    const rows = buildPricingMatrix({
      products: [{ id: "p1", name: "Rosário", costCents: 10000, missing: [] }],
      channels: [
        {
          ...baseChannel,
          fees: [
            {
              kind: "percentual",
              rate: "10.000000",
              amountCents: null,
              isActive: false,
            },
          ],
        },
      ],
      taxes: [{ kind: "percentual", rate: "5.000000", amountCents: null, isActive: false }],
      simulations: [],
      defaultRetailMarginPercent: 30,
      defaultWholesaleMarginPercent: 20,
    });

    expect(rows[0].cells[0].priceCents).toBe(14286);
  });

  it("rejects an invalid denominator", () => {
    const rows = buildPricingMatrix({
      products: [{ id: "p1", name: "Rosário", costCents: 10000, missing: [] }],
      channels: [baseChannel],
      taxes: [],
      simulations: [
        {
          productId: "p1",
          channelId: "ch-1",
          modality: "varejo",
          marginPercent: 1.5,
          createdAt: "2026-11-03T10:00:00Z",
        },
      ],
      defaultRetailMarginPercent: 30,
      defaultWholesaleMarginPercent: 20,
    });

    expect(rows[0].cells[0].priceCents).toBeNull();
    expect(rows[0].cells[0].reason).toBeTruthy();
  });

  it("reports incomplete cost without calculating prices", () => {
    const rows = buildPricingMatrix({
      products: [{ id: "p1", name: "Rosário", costCents: null, missing: ["Cera"] }],
      channels: [baseChannel],
      taxes: [],
      simulations: [],
      defaultRetailMarginPercent: 30,
      defaultWholesaleMarginPercent: 20,
    });

    expect(rows[0].costCents).toBeNull();
    expect(rows[0].cells.every((cell) => cell.priceCents === null)).toBe(true);
  });
});
