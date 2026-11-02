"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/app/actions/settings";
import { validatePaymentFee, validatePaymentMethod } from "@/lib/validations/payments";
import type { SettingsFormState } from "@/features/settings/formState";
import {
  savePaymentFee,
  savePaymentMethod,
  setPaymentFeeActive,
  setPaymentMethodActive,
} from "@/services/supabase/payments";

const UNEXPECTED_MESSAGE = "Não foi possível concluir a operação. Tente novamente.";

/**
 * Cria ou atualiza um meio de pagamento.
 *
 * @param previousState estado anterior do formulário (não utilizado)
 * @param formData campos preenchidos, incluindo `id` quando for edição
 * @returns estado com mensagem de sucesso ou erros por campo
 */
export async function savePaymentMethodAction(
  previousState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  void previousState;

  const session = await getAdminSession();

  if (!session) {
    return {
      status: "error",
      message: "Apenas administradores podem alterar as configurações.",
      errors: {},
    };
  }

  const rawId = String(formData.get("id") ?? "").trim();
  const validation = validatePaymentMethod(Object.fromEntries(formData));

  if (!validation.ok) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      errors: validation.errors,
    };
  }

  try {
    await savePaymentMethod(rawId || null, validation.data);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : UNEXPECTED_MESSAGE,
      errors: {},
    };
  }

  revalidatePath("/configuracoes/pagamentos");

  return {
    status: "success",
    message: rawId ? "Meio de pagamento atualizado." : "Meio de pagamento cadastrado.",
    errors: {},
  };
}

/**
 * Ativa ou desativa um meio de pagamento.
 *
 * @param formData campos `id` e `isActive`
 */
export async function togglePaymentMethodAction(formData: FormData): Promise<void> {
  const session = await getAdminSession();

  if (!session) {
    return;
  }

  const id = String(formData.get("id") ?? "").trim();
  const isActive = String(formData.get("isActive") ?? "") === "true";

  if (!id) {
    return;
  }

  await setPaymentMethodActive(id, isActive);
  revalidatePath("/configuracoes/pagamentos");
}

/**
 * Cria ou atualiza uma taxa de meio de pagamento.
 *
 * @param previousState estado anterior do formulário (não utilizado)
 * @param formData campos preenchidos, incluindo `methodId` e `id` opcional
 * @returns estado com mensagem de sucesso ou erros por campo
 */
export async function savePaymentFeeAction(
  previousState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  void previousState;

  const session = await getAdminSession();

  if (!session) {
    return {
      status: "error",
      message: "Apenas administradores podem alterar as configurações.",
      errors: {},
    };
  }

  const rawId = String(formData.get("id") ?? "").trim();
  const methodId = String(formData.get("methodId") ?? "").trim();
  const validation = validatePaymentFee(Object.fromEntries(formData));

  if (!methodId) {
    return { status: "error", message: "Meio de pagamento não informado.", errors: {} };
  }

  if (!validation.ok) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      errors: validation.errors,
    };
  }

  try {
    await savePaymentFee(rawId || null, methodId, validation.data);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : UNEXPECTED_MESSAGE,
      errors: {},
    };
  }

  revalidatePath(`/configuracoes/pagamentos/${methodId}`);
  revalidatePath("/configuracoes/pagamentos");

  return {
    status: "success",
    message: rawId ? "Taxa atualizada." : "Taxa cadastrada.",
    errors: {},
  };
}

/**
 * Ativa ou desativa uma taxa de meio de pagamento.
 *
 * @param formData campos `id`, `methodId` e `isActive`
 */
export async function togglePaymentFeeAction(formData: FormData): Promise<void> {
  const session = await getAdminSession();

  if (!session) {
    return;
  }

  const id = String(formData.get("id") ?? "").trim();
  const methodId = String(formData.get("methodId") ?? "").trim();
  const isActive = String(formData.get("isActive") ?? "") === "true";

  if (!id || !methodId) {
    return;
  }

  await setPaymentFeeActive(id, isActive);
  revalidatePath(`/configuracoes/pagamentos/${methodId}`);
  revalidatePath("/configuracoes/pagamentos");
}
