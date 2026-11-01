/**
 * Utilitários monetários.
 *
 * Todo valor financeiro do sistema é armazenado em centavos inteiros para
 * evitar imprecisão de ponto flutuante. Estas funções são a única porta de
 * entrada e saída desse formato.
 */

const CENTS_PER_REAL = 100;

/**
 * Converte um valor em reais para centavos inteiros.
 *
 * @param amountInReais valor monetário em reais (ex.: 12.34)
 * @returns valor em centavos (ex.: 1234)
 * @throws RangeError quando o valor não é um número finito
 */
export function toCents(amountInReais: number): number {
  if (!Number.isFinite(amountInReais)) {
    throw new RangeError("Monetary amount must be a finite number");
  }

  return Math.round(amountInReais * CENTS_PER_REAL);
}

/**
 * Converte centavos inteiros em reais.
 *
 * @param amountInCents valor em centavos (ex.: 1234)
 * @returns valor em reais (ex.: 12.34)
 * @throws RangeError quando o valor não é um inteiro finito
 */
export function fromCents(amountInCents: number): number {
  if (!Number.isInteger(amountInCents)) {
    throw new RangeError("Amount in cents must be an integer");
  }

  return amountInCents / CENTS_PER_REAL;
}

/**
 * Soma valores em centavos sem perder precisão.
 *
 * @param amountsInCents lista de valores em centavos
 * @returns total em centavos
 * @throws RangeError quando algum valor não é um inteiro finito
 */
export function sumCents(...amountsInCents: number[]): number {
  return amountsInCents.reduce((total, amountInCents) => {
    if (!Number.isInteger(amountInCents)) {
      throw new RangeError("Amount in cents must be an integer");
    }

    return total + amountInCents;
  }, 0);
}

/**
 * Formata um valor em centavos como moeda brasileira.
 *
 * @param amountInCents valor em centavos (ex.: 1234)
 * @returns texto formatado (ex.: "R$ 12,34")
 * @throws RangeError quando o valor não é um inteiro finito
 */
export function formatBRL(amountInCents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(fromCents(amountInCents));
}
