const STANDARD_UNIT_CONVERSIONS: Record<string, Record<string, number>> = {
  grama: { quilograma: 0.001 },
  quilograma: { grama: 1000 },
  litro: { mililitro: 1000 },
  mililitro: { litro: 0.001 },
};

const PACKAGING_UNITS = ["caixa", "pacote"];

/** Unidades que representam uma peça countable dentro de uma embalagem. */
const PIECE_UNIT = "unidade";

/** Casas decimais mantidas nas quantidades do sistema. */
const QUANTITY_DECIMALS = 3;

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
 * Lista as unidades alternativas aceitas para um insumo com a unidade base
 * informada.
 *
 * Quilograma e grama, litro e mililitro são equivalentes métricos e sempre
 * disponíveis. Caixa e pacote admitem "unidade" quando o responsável informou
 * quantas peças cabem na embalagem.
 *
 * @param baseUnit unidade base do insumo
 * @param unitsPerPackage quantas unidades cabem na caixa ou pacote, ou null
 * @returns lista de unidades alternativas
 */
export function listConvertibleUnits(
  baseUnit: string,
  unitsPerPackage: number | null,
): string[] {
  const metricAlternatives = Object.keys(
    STANDARD_UNIT_CONVERSIONS[baseUnit] ?? {},
  );

  if (
    PACKAGING_UNITS.includes(baseUnit) &&
    unitsPerPackage !== null &&
    Number.isFinite(unitsPerPackage) &&
    unitsPerPackage > 0
  ) {
    return [...metricAlternatives, PIECE_UNIT];
  }

  return metricAlternatives;
}

/**
 * Converte uma quantidade informada na ficha técnica para a unidade base do
 * insumo, que é a unidade em que o custo foi registrado.
 *
 * @param quantity quantidade na unidade informada
 * @param fromUnit unidade informada na ficha técnica
 * @param baseUnit unidade base do insumo
 * @param unitsPerPackage quantas unidades cabem na caixa ou pacote, ou null
 * @returns quantidade na unidade base, ou null quando as unidades não combinam
 */
export function convertToBaseUnit(
  quantity: number,
  fromUnit: string,
  baseUnit: string,
  unitsPerPackage: number | null,
): number | null {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return null;
  }

  if (fromUnit === baseUnit) {
    return roundQuantity(quantity);
  }

  if (PACKAGING_UNITS.includes(baseUnit) && fromUnit === PIECE_UNIT) {
    if (
      unitsPerPackage === null ||
      !Number.isFinite(unitsPerPackage) ||
      unitsPerPackage <= 0
    ) {
      return null;
    }

    return roundQuantity(quantity / unitsPerPackage);
  }

  return convertStandardQuantity(quantity, fromUnit, baseUnit);
}

/**
 * Arredonda uma quantidade para as casas decimais do sistema.
 *
 * @param quantity quantidade a arredondar
 * @returns quantidade com no máximo três casas decimais
 */
function roundQuantity(quantity: number): number {
  return Number(quantity.toFixed(QUANTITY_DECIMALS));
}
