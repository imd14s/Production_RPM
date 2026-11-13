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
const MAXIMUM_LABOR_MINUTES = 2880;

/**
 * Calcula o custo de mão de obra a partir dos minutos por unidade e do
 * custo por minuto (já rateado a partir do salário/hora).
 *
 * @param laborMinutes minutos de mão de obra por unidade
 * @param costPerMinuteCents custo por minuto em centavos
 * @returns custo em centavos, ou null quando inválido
 */
export function calculateLaborCostCents(
  laborMinutes: number,
  costPerMinuteCents: number,
): number | null {
  if (
    !Number.isInteger(laborMinutes) ||
    laborMinutes < 0 ||
    laborMinutes > MAXIMUM_LABOR_MINUTES ||
    !Number.isSafeInteger(costPerMinuteCents) ||
    costPerMinuteCents < 0
  ) {
    return null;
  }

  const cost = Math.round(laborMinutes * costPerMinuteCents);

  return Number.isSafeInteger(cost) ? cost : null;
}

/**
 * Deriva o custo por minuto a partir de um custo mensal e das horas mensais
 * padrão. Útil para ratear salário por minuto.
 *
 * @param monthlyWageCents salário mensal em centavos
 * @param standardHoursMonth horas mensais padrão
 * @returns custo por minuto em centavos, ou null quando inválido
 */
export function calculateCostPerMinuteCents(
  monthlyWageCents: number,
  standardHoursMonth: number,
): number | null {
  if (
    !Number.isSafeInteger(monthlyWageCents) ||
    monthlyWageCents < 0 ||
    !Number.isFinite(standardHoursMonth) ||
    standardHoursMonth <= 0
  ) {
    return null;
  }

  const minutesPerMonth = standardHoursMonth * 60;

  if (minutesPerMonth <= 0) {
    return null;
  }

  const cost = Math.round(monthlyWageCents / minutesPerMonth);

  return Number.isSafeInteger(cost) ? cost : null;
}

/**
 * Rateia um custo mensal total entre as unidades produzidas no mês.
 *
 * @param totalMonthlyCents custo mensal total em centavos
 * @param monthlyOutputUnits unidades produzidas no mês
 * @returns custo por unidade em centavos, ou null quando inválido
 */
export function allocateMonthlyCostPerUnitCents(
  totalMonthlyCents: number,
  monthlyOutputUnits: number,
): number | null {
  if (
    !Number.isSafeInteger(totalMonthlyCents) ||
    totalMonthlyCents < 0 ||
    !Number.isFinite(monthlyOutputUnits) ||
    monthlyOutputUnits <= 0
  ) {
    return null;
  }

  const perUnit = Math.round(totalMonthlyCents / monthlyOutputUnits);

  return Number.isSafeInteger(perUnit) ? perUnit : null;
}

/**
 * Soma os custos de componentes de um kit (produtos já precificados).
 *
 * @param componentCosts custos de cada componente em centavos
 * @returns total em centavos, ou null quando inválido
 */
export function sumComponentCostsCents(
  componentCosts: number[],
): number | null {
  let total = 0;

  for (const cost of componentCosts) {
    if (!Number.isSafeInteger(cost) || cost < 0) {
      return null;
    }

    const next = total + cost;

    if (!Number.isSafeInteger(next)) {
      return null;
    }

    total = next;
  }

  return total;
}

/**
 * Agrega o custo completo de um produto fabricado.
 *
 * @param materialCents custo de material
 * @param laborCents custo de mão de obra
 * @param overheadCents custo de despesas rateadas
 * @returns custo completo em centavos, ou null quando inválido
 */
export function calculateFullProductCostCents(
  materialCents: number | null,
  laborCents: number | null,
  overheadCents: number | null,
): number | null {
  if (materialCents === null || laborCents === null || overheadCents === null) {
    return null;
  }

  if (
    !Number.isSafeInteger(materialCents) ||
    !Number.isSafeInteger(laborCents) ||
    !Number.isSafeInteger(overheadCents) ||
    materialCents < 0 ||
    laborCents < 0 ||
    overheadCents < 0
  ) {
    return null;
  }

  const total = materialCents + laborCents + overheadCents;

  return Number.isSafeInteger(total) ? total : null;
}

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
