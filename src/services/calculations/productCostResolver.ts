/**
 * Resolução do custo de um produto a partir do catálogo e dos insumos.
 *
 * Resolve recursivamente subprodutos, mão de obra, custos diretos
 * (impressão 3D, acabamento) e o rateio de despesas operacionais.
 * Não acessa banco: recebe os dados já carregados.
 *
 * Regra do overhead: o rateio de despesas operacionais entra **uma vez por
 * produto final** (chamada de nível superior). Quando um produto aparece como
 * componente de outro, o custo retornado pelo cache não inclui overhead; quem
 * cobra o rateio é o produto final que o contem.
 */

import {
  calculateFullProductCostCents,
  calculateLaborCostCents,
  calculateMaterialCost,
  sumComponentCostsCents,
} from "./productCost";

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
 * Resolve o custo de um produto, resolvendo subprodutos.
 *
 * @param productId produto a resolver
 * @param productsById mapa de produtos
 * @param suppliesById mapa de insumos com custo
 * @param memo cache entre chamadas — guarda o custo SEM overhead
 * @param laborCostPerMinuteCents custo de mão de obra por minuto, ou null
 * @param overheadPerUnitCents despesa rateada por unidade (só nível superior)
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
    return overheadPerUnitCents > 0
      ? { ...cached, totalCents: addOverheadCents(cached.totalCents, overheadPerUnitCents) }
      : cached;
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
      // Componente: o overhead não é cobrado dentro do subproduto — quem cobra
      // o rateio é o produto final. Por isso overhead = 0 na recursão.
      const subCost = resolveProductCost(
        component.productId,
        productsById,
        suppliesById,
        memo,
        laborCostPerMinuteCents,
        0,
      );

      entries.push({
        label: component.productId,
        quantity: component.quantity,
        unitCostCents: subCost.totalCents,
      });
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

  const directCosts = sumComponentCostsCents(
    [
      product.energyCostCents,
      product.machineCostCents,
      product.finishingCostCents,
    ].filter((cost): cost is number => cost !== null),
  );

  const productionCents = calculateFullProductCostCents(
    materialCents,
    laborCents,
    directCosts,
  );

  const result: ResolvedProductCost = {
    materialCents,
    laborCents,
    totalCents: productionCents,
    missing: materialResult.missing,
    components: entries,
  };

  // O cache guarda o custo SEM overhead: assim um produto usado como componente
  // não propaga rateio para o pai, e o produto final é quem o acumula.
  memo.set(productId, result);

  return overheadPerUnitCents > 0
    ? { ...result, totalCents: addOverheadCents(productionCents, overheadPerUnitCents) }
    : result;
}

/**
 * Soma o overhead ao custo do produto, mantendo a proteção de inteiro seguro.
 *
 * @param productionCents custo de produção sem overhead, ou null
 * @param overheadPerUnitCents despesa rateada por unidade
 * @returns total com overhead, ou null quando inválido
 */
function addOverheadCents(
  productionCents: number | null,
  overheadPerUnitCents: number,
): number | null {
  if (productionCents === null) {
    return null;
  }

  return calculateFullProductCostCents(productionCents, overheadPerUnitCents, 0);
}
