/**
 * Leitura e escrita de quantidades fracionadas (gramas, metros parciais).
 * As quantidades vivem com até 3 casas decimais; a entrada pode usar vírgula.
 */

/** Máximo aceito para uma quantidade de insumo. */
const MAXIMUM_QUANTITY = 1000000;

/**
 * Converte o texto digitado em quantidade decimal.
 *
 * @param value texto do campo (ex.: "0,8" ou "250")
 * @returns quantidade arredondada em 3 casas, ou null quando inválido
 */
export function parseQuantityInput(value: string): number | null {
  const normalized = value.trim().replace(",", ".");

  if (normalized === "") {
    return null;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  const rounded = Math.round(parsed * 1000) / 1000;

  return rounded > 0 && rounded <= MAXIMUM_QUANTITY ? rounded : null;
}
