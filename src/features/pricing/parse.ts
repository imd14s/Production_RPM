import type { CostSnapshot, PricingSimulation } from "./types";

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

export function parseCostSnapshotRow(row: unknown): CostSnapshot | null {
  if (typeof row !== "object" || row === null) {
    return null;
  }
  const c = row as Record<string, unknown>;
  const id = c.id;
  const productId = c.product_id;
  const costCents = readNumber(c.cost_cents);
  const materialCents = readNumber(c.material_cents);
  const laborCents = readNumber(c.labor_cents);
  const overheadCents = readNumber(c.overhead_cents);
  const createdAt = readString(c.created_at);

  if (typeof id !== "string" || typeof productId !== "string") {
    return null;
  }
  if (costCents === null || materialCents === null || laborCents === null || overheadCents === null) {
    return null;
  }
  if (!Number.isInteger(costCents) || !Number.isInteger(materialCents) || !Number.isInteger(laborCents) || !Number.isInteger(overheadCents)) {
    return null;
  }

  return {
    id,
    productId,
    costCents,
    materialCents,
    laborCents,
    overheadCents,
    components: Array.isArray(c.components) ? c.components : [],
    createdAt,
  };
}

export function parsePricingSimulationRow(row: unknown): PricingSimulation | null {
  if (typeof row !== "object" || row === null) {
    return null;
  }
  const c = row as Record<string, unknown>;
  const id = c.id;
  const productId = c.product_id;
  const costSnapshotId = c.cost_snapshot_id;
  const channelId = c.channel_id;
  const paymentMethodId = c.payment_method_id;
  const modality = c.modality;
  const marginPercent = readNumber(c.margin_percent);
  const variablePercent = readNumber(c.variable_percent);
  const fixedFeesCents = readNumber(c.fixed_fees_cents);
  const priceCents = readNumber(c.price_cents);
  const createdBy = c.created_by;
  const createdAt = readString(c.created_at);

  if (typeof id !== "string" || typeof productId !== "string" || typeof costSnapshotId !== "string" || typeof channelId !== "string") {
    return null;
  }
  if (modality !== "varejo" && modality !== "atacado") {
    return null;
  }
  if (marginPercent === null || variablePercent === null || fixedFeesCents === null || priceCents === null) {
    return null;
  }
  if (!Number.isInteger(fixedFeesCents) || !Number.isInteger(priceCents)) {
    return null;
  }

  return {
    id,
    productId,
    costSnapshotId,
    channelId,
    paymentMethodId: typeof paymentMethodId === "string" ? paymentMethodId : null,
    modality,
    marginPercent,
    variablePercent,
    fixedFeesCents,
    priceCents,
    createdBy: typeof createdBy === "string" ? createdBy : null,
    createdAt,
  };
}