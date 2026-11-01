/**
 * Percentuais com até 6 casas decimais.
 * O banco guarda `numeric(9,6)`; o motor de cálculo trabalha com inteiros escalados
 * (micro-percentuais) para não introduzir erro de ponto flutuante.
 */

/** Fator de escala: 1% = 1.000.000 micro-percentuais. */
export const PERCENT_SCALE = 1_000_000;

/** Casas decimais aceitas em um percentual. */
export const PERCENT_DECIMALS = 6;

/**
 * Normaliza um percentual digitado para o formato canônico do banco ("12.500000").
 *
 * @param input texto como "12,5", "12.5" ou "12,5%"
 * @returns string canônica ou null quando inválido
 */
export function parsePercentInput(input: string): string | null {
  const cleaned = input.trim().replace(/%/g, "").replace(",", ".");

  if (!/^[0-9]{1,3}(\.[0-9]{1,6})?$/.test(cleaned)) {
    return null;
  }

  const [whole, fraction = ""] = cleaned.split(".");
  const value = Number(whole);

  if (value > 100 || (value === 100 && /[1-9]/.test(fraction))) {
    return null;
  }

  return `${whole}.${fraction.padEnd(PERCENT_DECIMALS, "0")}`;
}

/**
 * Converte o percentual canônico em micro-percentuais inteiros.
 *
 * @param canonical percentual no formato "12.500000"
 * @returns inteiro escalado (12.5% → 12.500.000)
 */
export function percentToMicros(canonical: string): number {
  const [whole, fraction = ""] = canonical.split(".");
  const micros = Number(whole) * PERCENT_SCALE + Number(fraction.padEnd(PERCENT_DECIMALS, "0"));

  if (!Number.isSafeInteger(micros)) {
    throw new RangeError("Percent value is out of range");
  }

  return micros;
}

/**
 * Formata o percentual do banco para exibição ("12.500000" → "12,5").
 *
 * @param value valor vindo do banco como string ou número
 * @returns texto com vírgula e sem zeros à direita
 */
export function formatPercent(value: string | number): string {
  const text = typeof value === "number" ? value.toFixed(PERCENT_DECIMALS) : value;
  const trimmed = text.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");

  return trimmed.replace(".", ",");
}
