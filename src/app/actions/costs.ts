"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/app/actions/settings";
import { validateLaborCost, validateOperatingExpense } from "@/lib/validations/costs";
import type { SettingsFormState } from "@/features/settings/formState";
import {
  saveLaborCost,
  saveOperatingExpense,
  setLaborCostActive,
  setOperatingExpenseActive,
} from "@/services/supabase/costs";

const UNEXPECTED_MESSAGE = "Não foi possível concluir a operação. Tente novamente.";

/**
 * Cria ou atualiza uma despesa fixa.
 *
 * @param previousState estado anterior do formulário (não utilizado)
 * @param formData campos preenchidos, incluindo `id` quando for edição
 * @returns estado com mensagem de sucesso ou erros por campo
 */
export async function saveOperatingExpenseAction(
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
  const validation = validateOperatingExpense(Object.fromEntries(formData));

  if (!validation.ok) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      errors: validation.errors,
    };
  }

  try {
    await saveOperatingExpense(rawId || null, validation.data);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : UNEXPECTED_MESSAGE,
      errors: {},
    };
  }

  revalidatePath("/configuracoes/despesas");

  return {
    status: "success",
    message: rawId ? "Despesa fixa atualizada." : "Despesa fixa cadastrada.",
    errors: {},
  };
}

/**
 * Ativa ou desativa uma despesa fixa.
 *
 * @param formData campos `id` e `isActive`
 */
export async function toggleOperatingExpenseAction(formData: FormData): Promise<void> {
  const session = await getAdminSession();

  if (!session) {
    return;
  }

  const id = String(formData.get("id") ?? "").trim();
  const isActive = String(formData.get("isActive") ?? "") === "true";

  if (!id) {
    return;
  }

  await setOperatingExpenseActive(id, isActive);
  revalidatePath("/configuracoes/despesas");
}

/**
 * Cria ou atualiza um custo de mão de obra.
 *
 * @param previousState estado anterior do formulário (não utilizado)
 * @param formData campos preenchidos, incluindo `id` quando for edição
 * @returns estado com mensagem de sucesso ou erros por campo
 */
export async function saveLaborCostAction(
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
  const validation = validateLaborCost(Object.fromEntries(formData));

  if (!validation.ok) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      errors: validation.errors,
    };
  }

  try {
    await saveLaborCost(rawId || null, validation.data);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : UNEXPECTED_MESSAGE,
      errors: {},
    };
  }

  revalidatePath("/configuracoes/mao-de-obra");

  return {
    status: "success",
    message: rawId ? "Custo de mão de obra atualizado." : "Custo de mão de obra cadastrado.",
    errors: {},
  };
}

/**
 * Ativa ou desativa um custo de mão de obra.
 *
 * @param formData campos `id` e `isActive`
 */
export async function toggleLaborCostAction(formData: FormData): Promise<void> {
  const session = await getAdminSession();

  if (!session) {
    return;
  }

  const id = String(formData.get("id") ?? "").trim();
  const isActive = String(formData.get("isActive") ?? "") === "true";

  if (!id) {
    return;
  }

  await setLaborCostActive(id, isActive);
  revalidatePath("/configuracoes/mao-de-obra");
}
