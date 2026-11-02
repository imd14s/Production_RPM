/**
 * Resolução do custo de um produto a partir do catálogo e dos insumos.
 *
 * Resolve recursivamente subprodutos e aplica o custo de material existente.
 * Não acessa banco: recebe os dados já carregados.
 */

import { calculateMaterialCost } from "./productCost";

export type CompositionEdge = {
  targetType: "supply" | "product";
  supplyId?: string;
  productId?: string;
  quantity: number;
};

export type ProductNode = {
  id: string;
  laborMinutes: number | null;
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
      const subCost = resolveProductCost(component.productId, productsById, suppliesById, memo);

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

  // O custo de mão de obra depende da configuração de salário (Etapa 4);
  // aqui preservamos o tempo, mas o valor é resolvido pelo chamador.
  const laborCents = 0;

  const totalCents =
    materialResult.totalCents === null
      ? null
      : materialResult.totalCents + (laborCents ?? 0);

  const result: ResolvedProductCost = {
    materialCents: materialResult.totalCents,
    laborCents,
    totalCents,
    missing: materialResult.missing,
    components: entries,
  };

  memo.set(productId, result);
  return result;
}