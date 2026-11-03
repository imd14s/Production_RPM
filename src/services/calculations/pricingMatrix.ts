/**
 * Montagem da matriz de preços por produto e plataforma.
 *
 * Regra de negócio (decisão do responsável, 2026-11-03):
 * - as plataformas/canais vendem apenas **varejo** — uma linha por canal;
 * - o **atacado** é venda direta ao comerciante, fora das plataformas —
 *   uma única linha por produto, sem comissão de canal, com margem padrão;
 * - o recebimento no atacado direto acontece por Pix direto ou crediário,
 *   combinados com o comprador, sem alterar o preço base da matriz.
 *
 * Função pura: a página apenas carrega os dados e exibe o resultado. O motor
 * financeiro continua sendo a única fonte dos cálculos.
 */

import { calculateChannelPriceCents } from "./channelPricing";
import type { Fee } from "./pricing";

/** Rótulo da linha de venda direta (atacado), fora das plataformas. */
export const WHOLESALE_DIRECT_NAME = "Atacado (venda direta)";

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
  channelId: string | null;
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
 * Localiza a última simulação de VAREJO do produto para o canal.
 *
 * @param simulations simulações disponíveis
 * @param productId produto
 * @param channelId canal da plataforma
 * @returns simulação mais recente de varejo, ou null
 */
function latestRetailSimulation(
  simulations: MatrixSimulation[],
  productId: string,
  channelId: string,
): MatrixSimulation | null {
  return (
    simulations
      .filter(
        (simulation) =>
          simulation.productId === productId &&
          simulation.channelId === channelId &&
          simulation.modality === "varejo",
      )
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0] ?? null
  );
}

/**
 * Define a margem padrão de varejo quando não há simulação para o canal.
 *
 * @param retail margem padrão de varejo em percentual (30 quando ausente)
 * @returns margem em decimal
 */
function defaultRetailMargin(retail: number | null): number {
  return (retail ?? 30) / 100;
}

/**
 * Define a margem padrão de atacado da venda direta.
 *
 * @param wholesale margem padrão de atacado em percentual (20 quando ausente)
 * @returns margem em decimal
 */
function defaultWholesaleMargin(wholesale: number | null): number {
  return (wholesale ?? 20) / 100;
}

/**
 * Monta a matriz de preços: linhas de varejo por plataforma, uma linha de
 * atacado direto e os impostos ativos aplicados em todas.
 *
 * @param input produtos, canais, impostos, simulações e margens padrão
 * @returns linhas da matriz
 */
export function buildPricingMatrix(input: PricingMatrixInput): MatrixRow[] {
  const taxFees: Fee[] = input.taxes
    .filter((tax) => tax.isActive)
    .map((tax) => toFee(tax.kind, tax.rate, tax.amountCents));

  const wholesaleMarginPercent = defaultWholesaleMargin(
    input.defaultWholesaleMarginPercent,
  );

  return input.products.map((product) => {
    const cells: MatrixPriceCell[] = [];

    for (const channel of input.channels) {
      const channelFees: Fee[] = channel.fees
        .filter((fee) => fee.isActive)
        .map((fee) => toFee(fee.kind, fee.rate, fee.amountCents));

      const simulation = latestRetailSimulation(
        input.simulations,
        product.id,
        channel.id,
      );

      const marginPercent =
        simulation !== null
          ? simulation.marginPercent
          : defaultRetailMargin(input.defaultRetailMarginPercent);

      if (product.costCents === null) {
        cells.push({
          channelId: channel.id,
          channelName: channel.name,
          modality: "varejo",
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
        modality: "varejo",
        marginPercent,
        priceCents: result.ok ? result.priceCents : null,
        reason: result.ok ? null : result.reason,
      });
    }

    // Atacado: venda direta fora das plataformas — sem comissão de canal.
    // O recebimento (Pix direto ou crediário) é combinado com o comprador e
    // sem custo; o preço base usa apenas custo + impostos ativos + margem.
    if (product.costCents === null) {
      cells.push({
        channelId: null,
        channelName: WHOLESALE_DIRECT_NAME,
        modality: "atacado",
        marginPercent: wholesaleMarginPercent,
        priceCents: null,
        reason: "Custo incompleto",
      });
    } else {
      const wholesaleResult = calculateChannelPriceCents({
        costCents: product.costCents,
        channelFees: [],
        paymentFees: [],
        taxFees,
        marginPercent: wholesaleMarginPercent,
      });

      cells.push({
        channelId: null,
        channelName: WHOLESALE_DIRECT_NAME,
        modality: "atacado",
        marginPercent: wholesaleMarginPercent,
        priceCents: wholesaleResult.ok ? wholesaleResult.priceCents : null,
        reason: wholesaleResult.ok ? null : wholesaleResult.reason,
      });
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
