"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/app/actions/settings";
import { calculateChannelPriceCents } from "@/services/calculations/channelPricing";
import type { Fee } from "@/services/calculations/pricing";
import { sumFixedFeesCents, sumVariablePercent } from "@/services/calculations/pricing";
import {
  getProductCostBreakdown,
  listChannelsWithFees,
  listPaymentMethodsWithFees,
  saveCostSnapshot,
  savePricingSimulation,
} from "@/services/supabase/pricing";
import { listTaxSettings } from "@/services/supabase/settings";
import { isUuid } from "@/lib/validations/products";
import { formatCents } from "@/lib/money";
import type { SettingsFormState } from "@/features/settings/formState";
import type { PricingModality } from "@/features/pricing/types";

const UNEXPECTED_MESSAGE = "Não foi possível concluir a operação. Tente novamente.";

function toFee(kind: "percentual" | "fixo", rate: string | null, amountCents: number | null): Fee {
  return {
    kind,
    rate: rate !== null ? Number(rate) / 100 : null,
    amountCents,
  };
}

/**
 * Cria uma simulação de precificação para um produto, canal e modalidade.
 *
 * @param previousState estado anterior do formulário
 * @param formData campos do formulário
 * @returns estado com mensagem de sucesso ou erro
 */
export async function savePricingSimulationAction(
  previousState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  void previousState;

  const session = await getAdminSession();

  if (!session) {
    return {
      status: "error",
      message: "Apenas administradores podem simular preços.",
      errors: {},
    };
  }

  const productId = String(formData.get("productId") ?? "").trim();
  const channelId = String(formData.get("channelId") ?? "").trim();
  const paymentMethodIdRaw = String(formData.get("paymentMethodId") ?? "").trim();
  const paymentMethodId = paymentMethodIdRaw || null;
  const modality = String(formData.get("modality") ?? "varejo").trim() as PricingModality;
  const marginText = String(formData.get("marginPercent") ?? "").trim();

  if (!productId || !channelId) {
    return { status: "error", message: "Produto e canal são obrigatórios.", errors: {} };
  }

  const marginPercent = Number(marginText.replace(",", ".")) / 100;

  if (!Number.isFinite(marginPercent) || marginPercent < 0 || marginPercent > 1) {
    return { status: "error", message: "Margem inválida.", errors: {} };
  }

  try {
    const [cost, channels, payments, taxes] = await Promise.all([
      getProductCostBreakdown(productId),
      listChannelsWithFees(),
      listPaymentMethodsWithFees(),
      listTaxSettings(),
    ]);

    if (cost.totalCents === null) {
      return {
        status: "error",
        message: "O produto não tem custo completo (faltam insumos com preço).",
        errors: {},
      };
    }

    const channel = channels.find((item) => item.channel.id === channelId);

    if (!channel) {
      return { status: "error", message: "Canal não encontrado.", errors: {} };
    }

    const channelFees: Fee[] = channel.fees
      .filter((fee) => fee.isActive)
      .map((fee) => toFee(fee.kind, fee.rate, fee.amountCents));

    const paymentFees: Fee[] = paymentMethodId
      ? (payments.find((item) => item.method.id === paymentMethodId)?.fees ?? [])
          .filter((fee) => fee.isActive)
          .map((fee) => toFee(fee.kind, fee.rate, fee.amountCents))
      : [];

    const taxFees: Fee[] = taxes
      .filter((tax) => tax.isActive)
      .map((tax) => toFee(tax.kind, tax.rate, tax.amountCents));

    const result = calculateChannelPriceCents({
      costCents: cost.totalCents,
      channelFees,
      paymentFees,
      taxFees,
      marginPercent,
    });

    if (!result.ok) {
      return { status: "error", message: result.reason, errors: {} };
    }

    const snapshot = await saveCostSnapshot({
      productId,
      costCents: cost.totalCents,
      materialCents: cost.materialCents ?? 0,
      laborCents: cost.laborCents ?? 0,
      overheadCents: cost.overheadCents,
      components: [],
    });

    const fixedFeesCents =
      channelFees.filter((f) => f.kind === "fixo").reduce((a, f) => a + (f.amountCents ?? 0), 0) +
      paymentFees.filter((f) => f.kind === "fixo").reduce((a, f) => a + (f.amountCents ?? 0), 0) +
      taxFees.filter((f) => f.kind === "fixo").reduce((a, f) => a + (f.amountCents ?? 0), 0);

    const variablePercent =
      channelFees.filter((f) => f.kind === "percentual").reduce((a, f) => a + (f.rate ?? 0), 0) +
      paymentFees.filter((f) => f.kind === "percentual").reduce((a, f) => a + (f.rate ?? 0), 0) +
      taxFees.filter((f) => f.kind === "percentual").reduce((a, f) => a + (f.rate ?? 0), 0);

    await savePricingSimulation({
      productId,
      costSnapshotId: snapshot.id,
      channelId,
      paymentMethodId,
      modality,
      marginPercent,
      variablePercent,
      fixedFeesCents,
      priceCents: result.priceCents,
    });

    revalidatePath("/precificacao");

    return {
      status: "success",
      message: `Preço calculado: R$ ${(result.priceCents / 100).toFixed(2).replace(".", ",")}. Simulação salva.`,
      errors: {},
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : UNEXPECTED_MESSAGE,
      errors: {},
    };
  }
}

export type ProductMarginSaveResult = {
  status: "success" | "error";
  message: string;
  /** Preço sugerido em centavos, quando a margem foi salva. */
  priceCents?: number;
};

/**
 * Salva a margem de lucro de um produto em um canal de venda.
 *
 * A margem é gravada como uma nova simulação de preço (varejo) do canal: é o
 * mesmo mecanismo usado pela tela de precificação, e a matriz da home passa a
 * usar a margem salva. O custo é congelado em um snapshot no momento do cálculo.
 *
 * @param productId produto da margem
 * @param channelId canal de venda
 * @param marginPercentText margem digitada em percentual (ex.: "30")
 * @returns mensagem de sucesso ou erro, com o preço sugerido
 */
export async function saveProductChannelMarginAction(
  productId: string,
  channelId: string,
  marginPercentText: string,
): Promise<ProductMarginSaveResult> {
  const session = await getAdminSession();

  if (!session) {
    return {
      status: "error",
      message: "Apenas administradores podem alterar margens.",
    };
  }

  if (!isUuid(productId) || !isUuid(channelId)) {
    return { status: "error", message: "Produto ou canal inválido." };
  }

  const marginPercent = Number(marginPercentText.trim().replace(",", ".")) / 100;

  if (!Number.isFinite(marginPercent) || marginPercent < 0 || marginPercent > 1) {
    return {
      status: "error",
      message: "Informe uma margem de lucro entre 0 e 100%.",
    };
  }

  try {
    const [cost, channels, taxes] = await Promise.all([
      getProductCostBreakdown(productId),
      listChannelsWithFees(),
      listTaxSettings(),
    ]);

    if (cost.totalCents === null) {
      return {
        status: "error",
        message:
          "O produto não tem custo completo (faltam insumos com preço).",
      };
    }

    const channel = channels.find((item) => item.channel.id === channelId);

    if (!channel) {
      return { status: "error", message: "Canal não encontrado." };
    }

    const channelFees: Fee[] = channel.fees
      .filter((fee) => fee.isActive)
      .map((fee) => toFee(fee.kind, fee.rate, fee.amountCents));

    const taxFees: Fee[] = taxes
      .filter((tax) => tax.isActive)
      .map((tax) => toFee(tax.kind, tax.rate, tax.amountCents));

    const result = calculateChannelPriceCents({
      costCents: cost.totalCents,
      channelFees,
      paymentFees: [],
      taxFees,
      marginPercent,
    });

    if (!result.ok) {
      return { status: "error", message: result.reason };
    }

    const snapshot = await saveCostSnapshot({
      productId,
      costCents: cost.totalCents,
      materialCents: cost.materialCents ?? 0,
      laborCents: cost.laborCents ?? 0,
      overheadCents: cost.overheadCents,
      components: [],
    });

    const allFees: Fee[] = [...channelFees, ...taxFees];

    await savePricingSimulation({
      productId,
      costSnapshotId: snapshot.id,
      channelId,
      paymentMethodId: null,
      modality: "varejo",
      marginPercent,
      variablePercent: sumVariablePercent(allFees),
      fixedFeesCents: sumFixedFeesCents(allFees),
      priceCents: result.priceCents,
    });

    revalidatePath("/home");
    revalidatePath("/precificacao");

    return {
      status: "success",
      message: `Margem de ${channel.channel.name} salva. Preço sugerido: ${formatCents(result.priceCents)}.`,
      priceCents: result.priceCents,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : UNEXPECTED_MESSAGE,
    };
  }
}