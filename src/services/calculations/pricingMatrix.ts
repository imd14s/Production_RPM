/**
 * Montagem da matriz de preços por produto, canal e modalidade.
 *
 * Função pura: a página apenas carrega os dados e exibe o resultado. O motor
 * financeiro continua sendo a única fonte dos cálculos.
 */

import { calculateChannelPriceCents } from "./channelPricing";
import type { Fee } from "./pricing";

export type MatrixChannel = {
  id: string;
  name: string;
  fees: Array<{
    kind: "percentual" | "fixo";
    rate: string | null;
    amountCents: number | null;
    isActive: boolean;
  }>;
};

export type MatrixTax = {
  kind: "percentual" | "fixo";
  rate: string | number | null;
  amountCents: number | null;
  isActive: boolean;
};

export type MatrixSimulation = {
  productId: string;
  channelId: string;
  modality: "varejo" | "atacado";
  marginPercent: number;
  createdAt: string;
};

export type MatrixProduct = {
  id: string;
  name: string;
  costCents: number | null;
  missing: string[];
};

export type MatrixPriceCell = {
  channelId: string;
  channelName: string;
  modality: "varejo" | "atacado";
  marginPercent: number;
  priceCents: number | null;
  reason: string | null;
};

export type MatrixRow = {
  productId: string;
  productName: string;
  costCents: number | null;
  missing: string[];
  cells: MatrixPriceCell[];
};

export type PricingMatrixInput = {
  products: MatrixProduct[];
  channels: MatrixChannel[];
  taxes: MatrixTax[];
  simulations: MatrixSimulation[];
  defaultRetailMarginPercent: number | null;
  defaultWholesaleMarginPercent: number | null;
};

/**
 * Converte uma taxa de canal ou imposto para o formato do motor de cálculo.
 *
 * @param kind tipo percentual ou fixo
 * @param rate percentual (produto da tela/banco) ou nulo
 * @param amountCents valor fixo em centavos ou nulo
 * @returns taxa no formato do motor
 */
function toFee(
  kind: "percentual" | "fixo",
  rate: string | number | null,
  amountCents: number | null,
): Fee {
  return {
    kind,
    rate: rate !== null ? Number(rate) / 100 : null,
    amountCents,
  };
}

/**
 * Localiza a última simulação do produto para o canal e a modalidade.
 *
 * @param simulations simulações disponíveis
 * @param productId produto
 * @param channelId canal
 * @param modality modalidade
 * @returns simulação mais recente, ou null
 */
function latestSimulation(
  simulations: MatrixSimulation[],
  productId: string,
  channelId: string,
  modality: "varejo" | "atacado",
): MatrixSimulation | null {
  return (
    simulations
      .filter(
        (simulation) =>
          simulation.productId === productId &&
          simulation.channelId === channelId &&
          simulation.modality === modality,
      )
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0] ?? null
  );
}

/**
 * Define a margem padrão por modalidade quando não há simulação.
 *
 * @param modality modalidade de venda
 * @param retail margem padrão de varejo em percentual
 * @param wholesale margem padrão de atacado em percentual
 * @returns margem em decimal
 */
function defaultMargin(
  modality: "varejo" | "atacado",
  retail: number | null,
  wholesale: number | null,
): number {
  if (modality === "varejo") {
    return (retail ?? 30) / 100;
  }

  return (wholesale ?? 20) / 100;
}

/**
 * Monta a matriz de preços por produto, canal e modalidade.
 *
 * @param input produtos, canais, impostos, simulações e margens padrão
 * @returns linhas da matriz
 */
export function buildPricingMatrix(input: PricingMatrixInput): MatrixRow[] {
  const activeChannels = input.channels;

  return input.products.map((product) => {
    const cells: MatrixPriceCell[] = [];

    for (const channel of activeChannels) {
      const channelFees: Fee[] = channel.fees
        .filter((fee) => fee.isActive)
        .map((fee) => toFee(fee.kind, fee.rate, fee.amountCents));

      const taxFees: Fee[] = input.taxes
        .filter((tax) => tax.isActive)
        .map((tax) => toFee(tax.kind, tax.rate, tax.amountCents));

      for (const modality of ["varejo", "atacado"] as const) {
        const simulation = latestSimulation(
          input.simulations,
          product.id,
          channel.id,
          modality,
        );

        const marginPercent =
          simulation !== null
            ? simulation.marginPercent
            : defaultMargin(
                modality,
                input.defaultRetailMarginPercent,
                input.defaultWholesaleMarginPercent,
              );

        if (product.costCents === null) {
          cells.push({
            channelId: channel.id,
            channelName: channel.name,
            modality,
            marginPercent,
            priceCents: null,
            reason: "Custo incompleto",
          });
          continue;
        }

        const result = calculateChannelPriceCents({
          costCents: product.costCents,
          channelFees,
          paymentFees: [],
          taxFees,
          marginPercent,
        });

        cells.push({
          channelId: channel.id,
          channelName: channel.name,
          modality,
          marginPercent,
          priceCents: result.ok ? result.priceCents : null,
          reason: result.ok ? null : result.reason,
        });
      }
    }

    return {
      productId: product.id,
      productName: product.name,
      costCents: product.costCents,
      missing: product.missing,
      cells,
    };
  });
}
