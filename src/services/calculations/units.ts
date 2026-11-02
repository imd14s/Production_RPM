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