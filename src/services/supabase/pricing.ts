import { connection } from "next/server";
import { parseCostSnapshotRow, parsePricingSimulationRow } from "@/features/pricing/parse";
import { buildCostSnapshotPayload, buildPricingSimulationPayload } from "@/features/pricing/payload";
import type { CostSnapshot, CostSnapshotInput, PricingSimulation, PricingSimulationInput } from "@/features/pricing/types";
import { createClient } from "@/services/supabase/server";

export async function saveCostSnapshot(input: CostSnapshotInput): Promise<CostSnapshot> {
  const supabase = await createClient();
  const payload = buildCostSnapshotPayload(input);

  const { data, error } = await supabase
    .from("cost_snapshots")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Não foi possível salvar o snapshot de custo. (código ${error.code ?? "desconhecido"})`);
  }

  const parsed = parseCostSnapshotRow(data);

  if (!parsed) {
    throw new Error("Snapshot de custo inválido retornado pelo banco.");
  }

  return parsed;
}

export async function savePricingSimulation(input: PricingSimulationInput): Promise<PricingSimulation> {
  const supabase = await createClient();
  const payload = buildPricingSimulationPayload(input);

  const { data, error } = await supabase
    .from("pricing_simulations")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Não foi possível salvar a simulação. (código ${error.code ?? "desconhecido"})`);
  }

  const parsed = parsePricingSimulationRow(data);

  if (!parsed) {
    throw new Error("Simulação inválida retornada pelo banco.");
  }

  return parsed;
}

export async function listPricingSimulationsByProduct(productId: string): Promise<PricingSimulation[]> {
  await connection();
  const supabase = await createClient();

  const result = await supabase
    .from("pricing_simulations")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (result.error) {
    throw new Error(`Não foi possível carregar as simulações. (código ${result.error.code ?? "desconhecido"})`);
  }

  return (result.data ?? [])
    .map(parsePricingSimulationRow)
    .filter((item): item is PricingSimulation => item !== null);
}

import type { ChannelWithFees } from "@/features/channels/types";
import type { PaymentMethodWithFees } from "@/features/payments/types";
import { listProductCatalog } from "@/services/supabase/products";
import { listSuppliesWithCost } from "@/services/supabase/supplies";
import { resolveProductCost } from "@/services/calculations/productCostResolver";
import type { ProductNode, SupplyNode } from "@/services/calculations/productCostResolver";

export async function listChannelsWithFees(): Promise<ChannelWithFees[]> {
  await connection();
  const { listChannelsWithFees: load } = await import("@/services/supabase/channels");
  return load();
}

export async function listPaymentMethodsWithFees(): Promise<PaymentMethodWithFees[]> {
  await connection();
  const { listPaymentMethodsWithFees: load } = await import("@/services/supabase/payments");
  return load();
}

export type ProductCostBreakdown = {
  productId: string;
  materialCents: number | null;
  laborCents: number | null;
  overheadCents: number;
  totalCents: number | null;
  missing: string[];
};

/**
 * Calcula o custo de material de um produto a partir do catálogo e dos
 * insumos com custo atual. Overhead e mão de obra são resolvidos pelo
 * chamador (configuração); aqui retornamos 0 para overhead.
 *
 * @param productId produto a precificar
 * @returns custo resolvido
 */
export async function getProductCostBreakdown(
  productId: string,
): Promise<ProductCostBreakdown> {
  await connection();
  const [catalog, suppliesWithCost] = await Promise.all([
    listProductCatalog(),
    listSuppliesWithCost(),
  ]);

  const productsById = new Map<string, ProductNode>();
  for (const product of catalog.products) {
    productsById.set(product.id, {
      id: product.id,
      laborMinutes: product.laborMinutes,
      components: product.components.map((component) => ({
        targetType: component.targetType,
        supplyId: component.targetType === "supply" ? component.targetId : undefined,
        productId: component.targetType === "product" ? component.targetId : undefined,
        quantity: component.quantity,
      })),
    });
  }

  const suppliesById = new Map<string, SupplyNode>();
  for (const supply of suppliesWithCost) {
    suppliesById.set(supply.id, {
      id: supply.id,
      currentUnitCostCents: supply.currentUnitCostCents,
    });
  }

  const resolved = resolveProductCost(productId, productsById, suppliesById);

  return {
    productId,
    materialCents: resolved.materialCents,
    laborCents: resolved.laborCents,
    overheadCents: 0,
    totalCents: resolved.totalCents,
    missing: resolved.missing,
  };
}