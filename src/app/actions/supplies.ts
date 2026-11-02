"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/app/actions/settings";
import {
  validateNewSupplyWithPrice,
  validateSupply,
  validateSupplyPrice,
} from "@/lib/validations/supplies";
import type { SettingsFormState } from "@/features/settings/formState";
import {
  createSupplyWithInitialPrice,
  saveSupply,
  saveSupplyPrice,
  setSupplyActive,
} from "@/services/supabase/supplies";

const UNEXPECTED_MESSAGE = "Não foi possível concluir a operação. Tente novamente.";

/**
 * Cria ou atualiza um insumo.
 *
 * @param previousState estado anterior do formulário (não utilizado)
 * @param formData campos preenchidos, incluindo `id` quando for edição
 * @returns estado com mensagem de sucesso ou erros por campo
 */
export async function saveSupplyAction(
  previousState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  void previousState;

  const session = await getAdminSession();

  if (!session) {
    return {
      status: "error",
      message: "Apenas administradores podem alterar os cadastros.",
      errors: {},
    };
  }

  const rawId = String(formData.get("id") ?? "").trim();
  const rawFields = Object.fromEntries(formData);
  let savedSupplyId = rawId;

  if (rawId) {
    const validation = validateSupply(rawFields);

    if (!validation.ok) {
      return {
        status: "error",
        message: "Confira os campos destacados.",
        errors: validation.errors,
      };
    }

    try {
      await saveSupply(rawId, validation.data);
    } catch (error) {
      return {
        status: "error",
        message: error instanceof Error ? error.message : UNEXPECTED_MESSAGE,
        errors: {},
      };
    }
  } else {
    const validation = validateNewSupplyWithPrice(rawFields);

    if (!validation.ok) {
      return {
        status: "error",
        message: "Confira os campos destacados.",
        errors: validation.errors,
      };
    }

    try {
      savedSupplyId = await createSupplyWithInitialPrice(
        validation.data.supply,
        validation.data.price,
      );
    } catch (error) {
      return {
        status: "error",
        message: error instanceof Error ? error.message : UNEXPECTED_MESSAGE,
        errors: {},
      };
    }
  }

  revalidatePath("/insumos");
  if (savedSupplyId) {
    revalidatePath(`/insumos/${savedSupplyId}`);
  }

  return {
    status: "success",
    message: rawId ? "Insumo atualizado." : "Insumo e primeira compra cadastrados.",
    errors: {},
  };
}

/**
 * Ativa ou desativa um insumo.
 *
 * @param formData campos `id` e `isActive`
 */
export async function toggleSupplyAction(formData: FormData): Promise<void> {
  const session = await getAdminSession();

  if (!session) {
    return;
  }

  const id = String(formData.get("id") ?? "").trim();
  const isActive = String(formData.get("isActive") ?? "") === "true";

  if (!id) {
    return;
  }

  await setSupplyActive(id, isActive);
  revalidatePath("/insumos");
  revalidatePath(`/insumos/${id}`);
}

/**
 * Cria ou atualiza uma aquisição de insumo.
 *
 * @param previousState estado anterior do formulário (não utilizado)
 * @param formData campos preenchidos, incluindo `supplyId` e `id` opcional
 * @returns estado com mensagem de sucesso ou erros por campo
 */
export async function saveSupplyPriceAction(
  previousState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  void previousState;

  const session = await getAdminSession();

  if (!session) {
    return {
      status: "error",
      message: "Apenas administradores podem alterar os cadastros.",
      errors: {},
    };
  }

  const rawId = String(formData.get("id") ?? "").trim();
  const supplyId = String(formData.get("supplyId") ?? "").trim();
  const validation = validateSupplyPrice(Object.fromEntries(formData));

  if (!supplyId) {
    return { status: "error", message: "Insumo não informado.", errors: {} };
  }

  if (!validation.ok) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      errors: validation.errors,
    };
  }

  try {
    await saveSupplyPrice(rawId || null, supplyId, validation.data);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : UNEXPECTED_MESSAGE,
      errors: {},
    };
  }

  revalidatePath(`/insumos/${supplyId}`);
  revalidatePath("/insumos");

  return {
    status: "success",
    message: rawId
      ? "Compra atualizada — o custo por unidade foi recalculado."
      : "Compra registrada — o custo do insumo usa este valor a partir de agora.",
    errors: {},
  };
}
