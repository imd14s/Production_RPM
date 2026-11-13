/**
 * Detalhamento do custo de um produto: uma linha por insumo ou componente,
 * com o custo já dividido pela quantidade realmente usada.
 *
 * Exemplo: insumo comprado em caixa (2 peças por R$ 10,00) usado em 1 peça
 * do produto. A composição guarda 0,5 caixa; a linha mostra "1 unidade" e
 * R$ 5,00 — o valor que aquela peça realmente consumiu.
 *
 * Função pura: a interface apenas exibe o resultado. O motor financeiro
 * continua sendo a única fonte dos cálculos.
 */

import { calculateLineCostCents } from "./productCost";
import { roundQuantity } from "./units";

export type ProductCostDetailLineKind =
  | "insumo"
  | "subproduto"
  | "perda"
  | "mao_de_obra"
  | "energia"
  | "maquina"
  | "acabamento"
  | "despesas";

export type ProductCostDetailLine = {
  /** Identificador estável da linha, usado como chave na lista. */
  key: string;
  /** Natureza do custo, para agrupar na exibição. */
  kind: ProductCostDetailLineKind;
  /** Nome do insumo, do componente ou do tipo de custo. */
  label: string;
  /** Quantidade usada, na unidade de exibição; null quando a linha não tem quantidade. */
  quantity: number | null;
  /** Unidade de exibição da quantidade. */
  unit: string | null;
  /** Custo da linha em centavos; null quando o insumo não tem custo cadastrado. */
  costCents: number | null;
};

export type ProductCostDetail = {
  productId: string;
  productName: string;
  /** Linhas de insumos e componentes, na ordem da ficha técnica. */
  lines: ProductCostDetailLine[];
  /** Custo do material com a taxa de falha aplicada. */
  materialCents: number | null;
  /** Custo total de fabricação (material + mão de obra + diretos + rateio). */
  totalCents: number | null;
  /** Insumos sem custo cadastrado, pelo nome. */
  missing: string[];
};

export type ProductCostDetailSupply = {
  id: string;
  name: string;
  /** Unidade base em que a compra e o custo do insumo foram registrados. */
  unit: string;
  /** Quantas unidades cabem na caixa ou pacote, quando informado. */
  unitsPerPackage: number | null;
  /** Custo por unidade base, em centavos. */
  currentUnitCostCents: number | null;
};

export type ProductCostDetailProduct = {
  id: string;
  name: string;
  laborMinutes: number | null;
  energyCostCents: number | null;
  machineCostCents: number | null;
  finishingCostCents: number | null;
  failureRatePercent: number | null;
};

export type ProductCostDetailComponent = {
  targetType: "supply" | "product";
  targetId: string;
  /** Quantidade usada, na unidade base do alvo. */
  quantity: number;
  /** Custo por unidade do alvo; para subproduto, o custo total do subproduto. */
  unitCostCents: number | null;
};

export type ProductCostDetailInput = {
  product: ProductCostDetailProduct;
  components: ProductCostDetailComponent[];
  supplies: Map<string, ProductCostDetailSupply>;
  products: Map<string, { name: string }>;
  /** Custo do material já com a taxa de falha aplicada. */
  materialCents: number | null;
  /** Custo de mão de obra do produto. */
  laborCents: number | null;
  /** Despesas operacionais rateadas por unidade. */
  overheadCents: number;
  /** Custo total de fabricação, conforme o motor de custo. */
  totalCents: number | null;
  /** Identificadores dos insumos sem custo, conforme o motor de custo. */
  missing: string[];
};

/**
 * Monta o detalhamento do custo de um produto.
 *
 * As linhas de insumo carregam a quantidade na unidade em que o responsável
 * pensa (peças quando o insumo tem equivalência de caixa ou pacote) e o custo
 * daquela quantidade. As demais linhas explicam o resto do custo de
 * fabricação: perda, mão de obra, custos diretos e rateio de despesas.
 *
 * @param input produto, composição e custos resolvidos pelo motor
 * @returns detalhamento pronto para exibição
 */
export function buildProductCostDetail(
  input: ProductCostDetailInput,
): ProductCostDetail {
  const lines: ProductCostDetailLine[] = [];
  let materialBaseCents = 0;
  let materialComplete = true;

  for (const component of input.components) {
    const costCents = calculateLineCostCents(
      component.quantity,
      component.unitCostCents,
    );

    if (costCents === null) {
      materialComplete = false;
    } else {
      materialBaseCents += costCents;
    }

    if (component.targetType === "supply") {
      const supply = input.supplies.get(component.targetId);
      const display = buildSupplyQuantity(component.quantity, supply);

      lines.push({
        key: `insumo-${component.targetId}`,
        kind: "insumo",
        label: supply?.name ?? "Insumo",
        quantity: display.quantity,
        unit: display.unit,
        costCents,
      });
      continue;
    }

    const product = input.products.get(component.targetId);

    lines.push({
      key: `subproduto-${component.targetId}`,
      kind: "subproduto",
      label: product?.name ?? "Produto",
      quantity: component.quantity,
      unit: "unidade",
      costCents,
    });
  }

  const failureCents = buildFailureCents(
    input,
    materialBaseCents,
    materialComplete,
  );

  if (failureCents !== null) {
    lines.push({
      key: "perda",
      kind: "perda",
      label: "Perda de produção",
      quantity: input.product.failureRatePercent,
      unit: "%",
      costCents: failureCents,
    });
  }

  if (input.laborCents !== null && input.laborCents > 0) {
    lines.push({
      key: "mao-de-obra",
      kind: "mao_de_obra",
      label: "Mão de obra",
      quantity: input.product.laborMinutes,
      unit: "min",
      costCents: input.laborCents,
    });
  }

  const directCosts: Array<{
    key: string;
    kind: ProductCostDetailLineKind;
    label: string;
    costCents: number | null;
  }> = [
    {
      key: "energia",
      kind: "energia",
      label: "Energia",
      costCents: input.product.energyCostCents,
    },
    {
      key: "maquina",
      kind: "maquina",
      label: "Máquina",
      costCents: input.product.machineCostCents,
    },
    {
      key: "acabamento",
      kind: "acabamento",
      label: "Acabamento",
      costCents: input.product.finishingCostCents,
    },
  ];

  for (const directCost of directCosts) {
    if (directCost.costCents === null || directCost.costCents <= 0) {
      continue;
    }

    lines.push({
      key: directCost.key,
      kind: directCost.kind,
      label: directCost.label,
      quantity: null,
      unit: null,
      costCents: directCost.costCents,
    });
  }

  if (input.overheadCents > 0) {
    lines.push({
      key: "despesas",
      kind: "despesas",
      label: "Despesas rateadas",
      quantity: null,
      unit: null,
      costCents: input.overheadCents,
    });
  }

  const missing = input.missing.map(
    (identifier) => input.supplies.get(identifier)?.name ?? identifier,
  );

  return {
    productId: input.product.id,
    productName: input.product.name,
    lines,
    materialCents: input.materialCents,
    totalCents: input.totalCents,
    missing,
  };
}

/**
 * Calcula quanto da perda de produção acresceu ao material.
 *
 * @param input custos resolvidos do produto
 * @param materialBaseCents soma das linhas de insumo, sem a perda
 * @param materialComplete false quando algum insumo não tem custo
 * @returns custo da perda em centavos, ou null quando não se aplica
 */
function buildFailureCents(
  input: ProductCostDetailInput,
  materialBaseCents: number,
  materialComplete: boolean,
): number | null {
  const failurePercent = input.product.failureRatePercent;

  if (
    !materialComplete ||
    input.materialCents === null ||
    failurePercent === null ||
    failurePercent <= 0
  ) {
    return null;
  }

  const failureCents = input.materialCents - materialBaseCents;

  return failureCents > 0 ? failureCents : null;
}

/**
 * Escolhe a unidade de exibição da quantidade usada de um insumo.
 *
 * Insumo comprado em caixa ou pacote com equivalência registrada é exibido
 * em peças: é como o responsável pensa ("1 vela"). Sem equivalência, a
 * quantidade aparece na unidade base em que o custo foi registrado.
 *
 * @param quantity quantidade usada, na unidade base do insumo
 * @param supply insumo usado na composição
 * @returns quantidade e unidade de exibição
 */
function buildSupplyQuantity(
  quantity: number,
  supply: ProductCostDetailSupply | undefined,
): { quantity: number; unit: string } {
  if (
    supply &&
    supply.unitsPerPackage !== null &&
    Number.isFinite(supply.unitsPerPackage) &&
    supply.unitsPerPackage > 0
  ) {
    return {
      quantity: roundQuantity(quantity * supply.unitsPerPackage),
      unit: "unidade",
    };
  }

  return {
    quantity,
    unit: supply?.unit ?? "unidade",
  };
}
