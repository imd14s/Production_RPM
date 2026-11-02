import { connection } from "next/server";
import {
  parsePaymentFeeRow,
  parsePaymentMethodRow,
} from "@/features/payments/parse";
import {
  buildPaymentFeePayload,
  buildPaymentMethodPayload,
} from "@/features/payments/payload";
import type {
  PaymentFee,
  PaymentFeeInput,
  PaymentMethod,
  PaymentMethodInput,
  PaymentMethodWithFees,
} from "@/features/payments/types";
import { createClient } from "@/services/supabase/server";

export type { PaymentMethodWithFees };

/**
 * Carrega os meios de pagamento com suas taxas agrupadas.
 * `connection()` interrompe o pré-render: o cliente Supabase usa relógio interno.
 *
 * @returns meios ativos primeiro, com as taxas de cada um
 */
export async function listPaymentMethodsWithFees(): Promise<PaymentMethodWithFees[]> {
  await connection();
  const supabase = await createClient();

  const [methodsResult, feesResult] = await Promise.all([
    supabase
      .from("payment_methods")
      .select("*")
      .order("is_active", { ascending: false })
      .order("name", { ascending: true }),
    supabase
      .from("payment_fees")
      .select("*")
      .order("is_active", { ascending: false })
      .order("label", { ascending: true }),
  ]);

  if (methodsResult.error) {
    throw new Error(`Não foi possível carregar os meios de pagamento. (código ${methodsResult.error.code ?? "desconhecido"})`);
  }

  if (feesResult.error) {
    throw new Error("Não foi possível carregar as taxas dos meios de pagamento.");
  }

  const methods = (methodsResult.data ?? [])
    .map(parsePaymentMethodRow)
    .filter((item): item is PaymentMethod => item !== null);

  const fees = (feesResult.data ?? [])
    .map(parsePaymentFeeRow)
    .filter((item): item is PaymentFee => item !== null);

  return methods.map((method) => ({
    method,
    fees: fees.filter((fee) => fee.methodId === method.id),
  }));
}

/**
 * Carrega um meio de pagamento específico com as suas taxas.
 *
 * @param id identificador do meio
 * @returns meio com taxas, ou null quando não existe
 */
export async function getPaymentMethodWithFees(id: string): Promise<PaymentMethodWithFees | null> {
  await connection();
  const supabase = await createClient();

  const { data: methodData, error: methodError } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (methodError) {
    throw new Error(`Não foi possível carregar o meio de pagamento. (código ${methodError.code ?? "desconhecido"})`);
  }

  const method = parsePaymentMethodRow(methodData);

  if (!method) {
    return null;
  }

  const { data: feesData, error: feesError } = await supabase
    .from("payment_fees")
    .select("*")
    .eq("method_id", id)
    .order("is_active", { ascending: false })
    .order("label", { ascending: true });

  if (feesError) {
    throw new Error(`Não foi possível carregar as taxas do meio de pagamento. (código ${feesError.code ?? "desconhecido"})`);
  }

  const fees = (feesData ?? [])
    .map(parsePaymentFeeRow)
    .filter((item): item is PaymentFee => item !== null);

  return { method, fees };
}

/**
 * Cria ou atualiza um meio de pagamento.
 *
 * @param id identificador do meio, ou null para criar
 * @param input valores já validados
 */
export async function savePaymentMethod(id: string | null, input: PaymentMethodInput): Promise<void> {
  const supabase = await createClient();
  const payload = buildPaymentMethodPayload(input);

  const { error } = id
    ? await supabase.from("payment_methods").update(payload).eq("id", id)
    : await supabase.from("payment_methods").insert(payload);

  if (error) {
    throw new Error(
      error.code === "23505"
        ? "Já existe um meio de pagamento com esse nome."
        : `Não foi possível salvar o meio de pagamento. (código ${error.code ?? "desconhecido"})`,
    );
  }
}

/**
 * Ativa ou desativa um meio de pagamento.
 *
 * @param id identificador do meio
 * @param isActive nova situação
 */
export async function setPaymentMethodActive(id: string, isActive: boolean): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("payment_methods")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    throw new Error(`Não foi possível alterar a situação do meio de pagamento. (código ${error.code ?? "desconhecido"})`);
  }
}

/**
 * Cria ou atualiza uma taxa de meio de pagamento.
 *
 * @param id identificador da taxa, ou null para criar
 * @param methodId meio dono da taxa (usado na criação)
 * @param input valores já validados
 */
export async function savePaymentFee(
  id: string | null,
  methodId: string,
  input: PaymentFeeInput,
): Promise<void> {
  const supabase = await createClient();
  const payload = buildPaymentFeePayload(methodId, input);

  const { error } = id
    ? await supabase.from("payment_fees").update(payload).eq("id", id)
    : await supabase.from("payment_fees").insert(payload);

  if (error) {
    throw new Error(`Não foi possível salvar a taxa do meio de pagamento. (código ${error.code ?? "desconhecido"})`);
  }
}

/**
 * Ativa ou desativa uma taxa de meio de pagamento.
 *
 * @param id identificador da taxa
 * @param isActive nova situação
 */
export async function setPaymentFeeActive(id: string, isActive: boolean): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("payment_fees")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    throw new Error(`Não foi possível alterar a situação da taxa. (código ${error.code ?? "desconhecido"})`);
  }
}
