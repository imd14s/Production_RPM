import { buildPricingMatrix, WHOLESALE_DIRECT_NAME } from "./pricingMatrix";

describe("buildPricingMatrix", () => {
  type MatrixChannelFees = Array<{
    kind: "percentual" | "fixo";
    rate: string | null;
    amountCents: number | null;
    isActive: boolean;
  }>;

  const marketplace = {
    id: "ch-1",
    name: "Mercado Livre",
    fees: [] as MatrixChannelFees,
  };
  const store = {
    id: "ch-2",
    name: "Loja física",
    fees: [] as MatrixChannelFees,
  };

  it("renders one retail row per platform plus a single direct wholesale row", () => {
    const rows = buildPricingMatrix({
      products: [{ id: "p1", name: "Rosário", costCents: 10000, missing: [] }],
      channels: [marketplace, store],
      taxes: [],
      simulations: [],
      defaultRetailMarginPercent: 30,
      defaultWholesaleMarginPercent: 20,
    });

    expect(rows).toHaveLength(1);
    expect(rows[0].cells).toHaveLength(3);
    expect(rows[0].cells[0]).toMatchObject({
      channelId: "ch-1",
      channelName: "Mercado Livre",
      modality: "varejo",
      marginPercent: 0.3,
      priceCents: 14286,
    });
    expect(rows[0].cells[1]).toMatchObject({
      channelId: "ch-2",
      channelName: "Loja física",
      modality: "varejo",
      priceCents: 14286,
    });
    expect(rows[0].cells[2]).toMatchObject({
      channelId: null,
      channelName: WHOLESALE_DIRECT_NAME,
      modality: "atacado",
      marginPercent: 0.2,
      priceCents: 12500,
    });
  });

  it("uses the latest retail simulation margin per platform", () => {
    const rows = buildPricingMatrix({
      products: [{ id: "p1", name: "Rosário", costCents: 10000, missing: [] }],
      channels: [marketplace],
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

  it("keeps the default wholesale margin and ignores simulations for the direct row", () => {
    const rows = buildPricingMatrix({
      products: [{ id: "p1", name: "Rosário", costCents: 10000, missing: [] }],
      channels: [marketplace],
      taxes: [],
      simulations: [
        {
          productId: "p1",
          channelId: "ch-1",
          modality: "atacado",
          marginPercent: 0.5,
          createdAt: "2026-11-03T10:00:00Z",
        },
      ],
      defaultRetailMarginPercent: 30,
      defaultWholesaleMarginPercent: 20,
    });

    expect(rows[0].cells[1].modality).toBe("atacado");
    expect(rows[0].cells[1].marginPercent).toBe(0.2);
    expect(rows[0].cells[1].priceCents).toBe(12500);
  });

  it("applies channel fees only on platform rows", () => {
    const rows = buildPricingMatrix({
      products: [{ id: "p1", name: "Rosário", costCents: 10000, missing: [] }],
      channels: [
        {
          ...marketplace,
          fees: [
            { kind: "percentual", rate: "10.000000", amountCents: null, isActive: true },
          ],
        },
      ],
      taxes: [],
      simulations: [],
      defaultRetailMarginPercent: 30,
      defaultWholesaleMarginPercent: 20,
    });

    // Platform: 10000 / (1 - 0.10 - 0.30) = 16667. Direct wholesale has no fees.
    expect(rows[0].cells[0].priceCents).toBe(16667);
    expect(rows[0].cells[1].priceCents).toBe(12500);
  });

  it("applies the fixed per-unit fee only on the platform row", () => {
    const rows = buildPricingMatrix({
      products: [{ id: "p1", name: "Rosário", costCents: 10000, missing: [] }],
      channels: [
        {
          ...marketplace,
          fees: [
            { kind: "fixo", rate: null, amountCents: 600, isActive: true },
          ],
        },
      ],
      taxes: [],
      simulations: [],
      defaultRetailMarginPercent: 30,
      defaultWholesaleMarginPercent: 20,
    });

    // Platform: (10000 + 600) / (1 - 0.30) = 15143. Direct: 12500.
    expect(rows[0].cells[0].priceCents).toBe(15143);
    expect(rows[0].cells[1].priceCents).toBe(12500);
  });

  it("applies active taxes to platform and direct rows", () => {
    const rows = buildPricingMatrix({
      products: [{ id: "p1", name: "Rosário", costCents: 10000, missing: [] }],
      channels: [marketplace],
      taxes: [{ kind: "percentual", rate: "5.000000", amountCents: null, isActive: true }],
      simulations: [],
      defaultRetailMarginPercent: 30,
      defaultWholesaleMarginPercent: 20,
    });

    // Platform: 10000 / (1 - 0.05 - 0.30) = 15385. Direct: 10000 / (1 - 0.05 - 0.20) = 13333.
    expect(rows[0].cells[0].priceCents).toBe(15385);
    expect(rows[0].cells[1].priceCents).toBe(13333);
  });

  it("ignores inactive fees and taxes", () => {
    const rows = buildPricingMatrix({
      products: [{ id: "p1", name: "Rosário", costCents: 10000, missing: [] }],
      channels: [
        {
          ...marketplace,
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
    expect(rows[0].cells[1].priceCents).toBe(12500);
  });

  it("rejects an invalid denominator on the platform row", () => {
    const rows = buildPricingMatrix({
      products: [{ id: "p1", name: "Rosário", costCents: 10000, missing: [] }],
      channels: [marketplace],
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

  it("rejects an invalid denominator on the direct wholesale row", () => {
    const rows = buildPricingMatrix({
      products: [{ id: "p1", name: "Rosário", costCents: 10000, missing: [] }],
      channels: [marketplace],
      taxes: [{ kind: "percentual", rate: "10.000000", amountCents: null, isActive: true }],
      simulations: [],
      defaultRetailMarginPercent: 30,
      defaultWholesaleMarginPercent: 100,
    });

    // Margin of 100% plus 10% tax makes the denominator zero or negative.
    expect(rows[0].cells[1].priceCents).toBeNull();
    expect(rows[0].cells[1].reason).toBeTruthy();
  });

  it("reports incomplete cost without calculating prices", () => {
    const rows = buildPricingMatrix({
      products: [{ id: "p1", name: "Rosário", costCents: null, missing: ["Cera"] }],
      channels: [marketplace],
      taxes: [],
      simulations: [],
      defaultRetailMarginPercent: 30,
      defaultWholesaleMarginPercent: 20,
    });

    expect(rows[0].costCents).toBeNull();
    expect(rows[0].cells.every((cell) => cell.priceCents === null)).toBe(true);
    expect(rows[0].cells.every((cell) => cell.reason === "Custo incompleto")).toBe(true);
  });
});
