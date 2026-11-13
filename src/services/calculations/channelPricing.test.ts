import { calculateChannelPriceCents } from "./channelPricing";
import type { Fee } from "./pricing";

describe("calculateChannelPriceCents", () => {
  it("calculates with channel and payment fees", () => {
    const channelFees: Fee[] = [
      { kind: "percentual", rate: 0.1, amountCents: null },
      { kind: "fixo", rate: null, amountCents: 200 },
    ];
    const paymentFees: Fee[] = [{ kind: "percentual", rate: 0.03, amountCents: null }];
    const taxFees: Fee[] = [{ kind: "percentual", rate: 0.05, amountCents: null }];

    const result = calculateChannelPriceCents({
      costCents: 10000,
      channelFees,
      paymentFees,
      taxFees,
      marginPercent: 0.2,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.priceCents).toBeGreaterThan(10000);
    }
  });

  it("fails on invalid margin", () => {
    const result = calculateChannelPriceCents({
      costCents: 10000,
      channelFees: [],
      paymentFees: [],
      taxFees: [],
      marginPercent: 1,
    });

    expect(result.ok).toBe(false);
  });
});