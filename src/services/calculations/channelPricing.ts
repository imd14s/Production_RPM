/**
 * Precificação por canal de venda.
 *
 * Combina o custo do produto com as taxas do canal, do meio de pagamento e
 * dos impostos, aplicando a fórmula-base para um canal e uma margem.
 */

import { calculatePriceCents, sumFixedFeesCents, sumVariablePercent } from "./pricing";
import type { Fee } from "./pricing";

export type ChannelPricingInput = {
  /** Custo completo do produto em centavos. */
  costCents: number;
  /** Taxas do canal de venda. */
  channelFees: Fee[];
  /** Taxas do meio de pagamento. */
  paymentFees: Fee[];
  /** Impostos aplicáveis (como taxas percentuais ou fixas). */
  taxFees: Fee[];
  /** Margem desejada para este canal/modalidade. */
  marginPercent: number;
};

export type ChannelPriceResult = ReturnType<typeof calculatePriceCents>;

/**
 * Calcula o preço de um produto para um canal e uma margem.
 *
 * @param input custo, taxas e margem
 * @returns preço em centavos ou motivo de falha
 */
export function calculateChannelPriceCents(
  input: ChannelPricingInput,
): ChannelPriceResult {
  const allFees: Fee[] = [
    ...input.channelFees,
    ...input.paymentFees,
    ...input.taxFees,
  ];

  const fixedFeesCents = sumFixedFeesCents(allFees);
  const variablePercent = sumVariablePercent(allFees);

  return calculatePriceCents({
    costCents: input.costCents,
    fixedFeesCents,
    variablePercent,
    marginPercent: input.marginPercent,
  });
}