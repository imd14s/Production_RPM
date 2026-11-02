/**
 * Leitura e escrita de horas mensais em formato amigável.
 * As horas vivem como número decimal (aceita meias horas); a entrada do
 * usuário pode usar vírgula ou ponto.
 */

/**
 * Converte o texto digitado em horas decimais.
 *
 * @param value texto do campo (ex.: "176,5" ou "220")
 * @returns horas arredondadas em duas casas, ou null quando inválido
 */
export function parseHoursInput(value: string): number | null {
  const normalized = value.trim().replace(",", ".");

  if (normalized === "") {
    return null;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  const rounded = Math.round(parsed * 100) / 100;

  return rounded > 0 ? rounded : null;
}

/**
 * Formata horas para reaparecer no campo: vírgula e até duas casas, sem zeros
 * desnecessários.
 *
 * @param hours horas decimais do banco
 * @returns texto tipo "176,5" ou "220"
 */
export function formatHours(hours: number): string {
  const fixed = hours.toFixed(2);
  const [whole, decimals] = fixed.split(".");
  const trimmedDecimals = (decimals ?? "").replace(/0+$/, "");

  return trimmedDecimals ? `${whole},${trimmedDecimals}` : whole;
}
