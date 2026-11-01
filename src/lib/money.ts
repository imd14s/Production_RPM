/**
 * Conversão de dinheiro em reais para centavos inteiros.
 * Todo valor monetário do sistema trafega como inteiro; ponto flutuante nunca é usado
 * em soma ou comparação.
 */

/**
 * Converte um texto em reais para centavos.
 * Aceita "1.234,56", "1234.56", "R$ 1.234,56" e "1234".
 *
 * @param input texto digitado pelo usuário
 * @returns centavos inteiros ou null quando o texto é inválido
 */
export function parseAmountToCents(input: string): number | null {
  const cleaned = input.trim().replace(/\s/g, "").replace(/R\$/gi, "");

  if (!cleaned || !/^[0-9.,]+$/.test(cleaned) || !/[0-9]/.test(cleaned)) {
    return null;
  }

  const decimalIndex = Math.max(cleaned.lastIndexOf(","), cleaned.lastIndexOf("."));
  let integerPart = cleaned;
  let decimalPart = "";

  if (decimalIndex >= 0) {
    const decimals = cleaned.slice(decimalIndex + 1);

    // 1 ou 2 dígitos no fim indicam centavos; mais que isso é separador de milhar.
    if (/^[0-9]{1,2}$/.test(decimals)) {
      integerPart = cleaned.slice(0, decimalIndex);
      decimalPart = decimals;
    }
  }

  const integerDigits = integerPart.replace(/[.,]/g, "");

  if (!integerDigits || !/^[0-9]+$/.test(integerDigits)) {
    return null;
  }

  const cents = Number(integerDigits) * 100 + Number(decimalPart.padEnd(2, "0") || "0");

  return Number.isSafeInteger(cents) ? cents : null;
}

/**
 * Formata centavos como moeda brasileira.
 *
 * @param cents valor em centavos
 * @returns texto como "R$ 1.234,56"
 */
export function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(Math.trunc(cents));
  const reais = Math.trunc(absolute / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const centavos = String(absolute % 100).padStart(2, "0");

  return `${sign}R$ ${reais},${centavos}`;
}

/**
 * Formata centavos para preencher um campo de formulário, sem símbolo de moeda.
 *
 * @param cents valor em centavos
 * @returns texto como "1234,56"
 */
export function formatCentsInput(cents: number): string {
  const absolute = Math.abs(Math.trunc(cents));
  const reais = Math.trunc(absolute / 100).toString();
  const centavos = String(absolute % 100).padStart(2, "0");

  return `${reais},${centavos}`;
}
