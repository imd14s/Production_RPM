/**
 * Custo de material de uma ficha técnica.
 * Única fonte de verdade da soma — telas e páginas só exibem o resultado.
 */

export type MaterialCostEntry = {
  /** Rótulo para relatar itens sem custo conhecido. */
  label: string;
  quantity: number;
  /** Custo por unidade da compra mais recente, ou null quando não há compra. */
  unitCostCents: number | null;
};

const MAXIMUM_QUANTITY = 1_000_000;

/**
 * Calcula o custo de uma linha da ficha (quantidade × custo por unidade).
 *
 * @param quantity quantidade usada (na unidade do insumo)
 * @param unitCostCents custo por unidade, ou null quando o insumo não tem aquisição
 * @returns custo da linha em centavos, ou null quando não é possível precificar
 */
export function calculateLineCostCents(
  quantity: number,
  unitCostCents: number | null,
): number | null {
  if (
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    quantity > MAXIMUM_QUANTITY ||
    Number(quantity.toFixed(3)) !== quantity ||
    unitCostCents === null ||
    !Number.isSafeInteger(unitCostCents) ||
    unitCostCents < 0
  ) {
    return null;
  }

  const lineCost = Math.round(quantity * unitCostCents);

  return Number.isSafeInteger(lineCost) ? lineCost : null;
}

/**
 * Calcula o custo de material de uma composição.
 * Um item sem custo conhecido impossibilita o total: o resultado informa quais.
 *
 * @param entries linhas da ficha técnica
 * @returns total em centavos (null quando há itens sem custo) e a lista dos omitidos
 */
export function calculateMaterialCost(entries: MaterialCostEntry[]): {
  totalCents: number | null;
  missing: string[];
} {
  const missing: string[] = [];
  let totalCents = 0;
  let complete = true;

  for (const entry of entries) {
    const lineCost = calculateLineCostCents(entry.quantity, entry.unitCostCents);

    if (lineCost === null) {
      complete = false;
      missing.push(entry.label);

      continue;
    }

    const nextTotal = totalCents + lineCost;

    if (!Number.isSafeInteger(nextTotal)) {
      complete = false;
      missing.push(entry.label);

      continue;
    }

    totalCents = nextTotal;
  }

  return complete
    ? { totalCents, missing: [] }
    : { totalCents: null, missing };
}
