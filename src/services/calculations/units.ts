const STANDARD_UNIT_CONVERSIONS: Record<string, Record<string, number>> = {
  grama: { quilograma: 0.001 },
  quilograma: { grama: 1000 },
  litro: { mililitro: 1000 },
  mililitro: { litro: 0.001 },
};

/**
 * Conversão de quantidades entre unidades de medida.
 *
 * Usado pelo motor de custo quando a quantidade registrada numa ficha técnica
 * está em unidade diferente da unidade base do insumo. O fator informa
 * quantas unidades de destino existem em uma unidade de origem.
 */

/**
 * Converte uma quantidade usando um fator.
 *
 * @param quantity quantidade na unidade de origem
 * @param factor quantas unidades de destino existem em uma de origem
 * @returns quantidade na unidade de destino, ou null quando inválida
 */
export function convertQuantity(
  quantity: number,
  factor: number,
): number | null {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return null;
  }

  if (!Number.isFinite(factor) || factor <= 0) {
    return null;
  }

  const converted = quantity * factor;

  if (!Number.isFinite(converted)) {
    return null;
  }

  return Number(converted.toFixed(6));
}

/**
 * Converte entre unidades com equivalência métrica fixa.
 *
 * @param quantity quantidade na unidade de origem
 * @param fromUnit unidade de origem
 * @param toUnit unidade de destino
 * @returns quantidade convertida ou null para unidades incompatíveis/inválidas
 */
export function convertStandardQuantity(
  quantity: number,
  fromUnit: string,
  toUnit: string,
): number | null {
  if (fromUnit === toUnit) {
    return Number.isFinite(quantity) && quantity > 0 ? quantity : null;
  }

  const factor = STANDARD_UNIT_CONVERSIONS[fromUnit]?.[toUnit];

  return factor === undefined ? null : convertQuantity(quantity, factor);
}

/**
 * Lista unidades que podem ser convertidas automaticamente para a unidade base.
 *
 * @param baseUnit unidade base cadastrada para o insumo
 * @returns unidade base e, quando aplicável, sua equivalente métrica
 */
export function getCompatibleStandardUnits(baseUnit: string): string[] {
  return [baseUnit, ...Object.keys(STANDARD_UNIT_CONVERSIONS[baseUnit] ?? {})];
}