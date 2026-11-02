/**
 * Tipos da precificação: snapshots de custo e simulações.
 */

export type CostSnapshot = {
  id: string;
  productId: string;
  costCents: number;
  materialCents: number;
  laborCents: number;
  overheadCents: number;
  components: unknown[];
  createdAt: string;
};

export type CostSnapshotInput = {
  productId: string;
  costCents: number;
  materialCents: number;
  laborCents: number;
  overheadCents: number;
  components: unknown[];
};

export type PricingModality = "varejo" | "atacado";

export type PricingSimulation = {
  id: string;
  productId: string;
  costSnapshotId: string;
  channelId: string;
  paymentMethodId: string | null;
  modality: PricingModality;
  marginPercent: number;
  variablePercent: number;
  fixedFeesCents: number;
  priceCents: number;
  createdBy: string | null;
  createdAt: string;
};

export type PricingSimulationInput = {
  productId: string;
  costSnapshotId: string;
  channelId: string;
  paymentMethodId: string | null;
  modality: PricingModality;
  marginPercent: number;
  variablePercent: number;
  fixedFeesCents: number;
  priceCents: number;
};