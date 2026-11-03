/**
 * Resolução do custo de um produto a partir do catálogo e dos insumos.
 *
 * Resolve recursivamente subprodutos e aplica o custo de material existente.
 * Não acessa banco: recebe os dados já carregados.
 */

import { calculateLaborCostCents, calculateMaterialCost } from "./productCost";

export type CompositionEdge = {
  targetType: "supply" | "product";
  supplyId?: string;
  productId?: string;
  quantity: number;
};

export type ProductNode = {
  id: string;
  laborMinutes: number | null;
  energyCostCents: number | null;
  machineCostCents: number | null;
  finishingCostCents: number | null;
  failureRatePercent: number | null;
  components: CompositionEdge[];
};

export type SupplyNode = {
  id: string;
  currentUnitCostCents: number | null;
};

export type ResolvedProductCost = {
  materialCents: number | null;
  laborCents: number | null;
  totalCents: number | null;
  missing: string[];
  components: Array<{ label: string; quantity: number; unitCostCents: number | null }>;
};

/**
 * Resolve o custo de material de um produto, resolvendo subprodutos.
 *
 * @param productId produto a resolver
 * @param productsById mapa de produtos
 * @param suppliesById mapa de insumos com custo
 * @param memo cache de resultados
 * @returns custo resolvido
 */
export function resolveProductCost(
  productId: string,
  productsById: Map<string, ProductNode>,
  suppliesById: Map<string, SupplyNode>,
  memo: Map<string, ResolvedProductCost> = new Map(),
  laborCostPerMinuteCents: number | null = null,
  overheadPerUnitCents: number = 0,
): ResolvedProductCost {
  const cached = memo.get(productId);

  if (cached) {
    return cached;
  }

  const product = productsById.get(productId);

  if (!product) {
    const result: ResolvedProductCost = {
      materialCents: null,
      laborCents: null,
      totalCents: null,
      missing: ["Produto não encontrado"],
      components: [],
    };
    memo.set(productId, result);
    return result;
  }

  const entries: Array<{ label: string; quantity: number; unitCostCents: number | null }> = [];

  for (const component of product.components) {
    if (component.targetType === "supply" && component.supplyId) {
      const supply = suppliesById.get(component.supplyId);
      entries.push({
        label: supply?.id ?? component.supplyId,
        quantity: component.quantity,
        unitCostCents: supply?.currentUnitCostCents ?? null,
      });
      continue;
    }

    if (component.targetType === "product" && component.productId) {
      const subCost = resolveProductCost(
        component.productId,
        productsById,
        suppliesById,
        memo,
        laborCostPerMinuteCents,
        overheadPerUnitCents,
      );

      if (subCost.totalCents === null) {
        entries.push({
          label: component.productId,
          quantity: component.quantity,
          unitCostCents: null,
        });
      } else {
        const unitCost = Math.round(subCost.totalCents / 1); // custo por unidade do subproduto
        entries.push({
          label: component.productId,
          quantity: component.quantity,
          unitCostCents: unitCost,
        });
      }
    }
  }

  const materialResult = calculateMaterialCost(
    entries.map((entry) => ({
      label: entry.label,
      quantity: entry.quantity,
      unitCostCents: entry.unitCostCents,
    })),
  );

  let materialCents = materialResult.totalCents;

  if (
    materialCents !== null &&
    product.failureRatePercent !== null &&
    product.failureRatePercent > 0
  ) {
    materialCents = Math.round(materialCents * (1 + product.failureRatePercent / 100));

    if (!Number.isSafeInteger(materialCents)) {
      materialCents = null;
    }
  }

  const laborCents =
    product.laborMinutes !== null && laborCostPerMinuteCents !== null
      ? calculateLaborCostCents(product.laborMinutes, laborCostPerMinuteCents)
      : 0;

  let directCosts = 0;

  for (const cost of [
    product.energyCostCents,
    product.machineCostCents,
    product.finishingCostCents,
  ]) {
    if (cost !== null) {
      directCosts += cost;
    }
  }

  if (!Number.isSafeInteger(directCosts)) {
    directCosts = 0;
  }

  const totalCents =
    materialCents === null || laborCents === null
      ? null
      : materialCents + laborCents + directCosts + overheadPerUnitCents;

  const result: ResolvedProductCost = {
    materialCents,
    laborCents,
    totalCents,
    missing: materialResult.missing,
    components: entries,
  };

  memo.set(productId, result);
  return result;
}