"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/app/actions/settings";
import { validateSupply } from "@/lib/validations/supplies";
import type { SettingsFormState } from "@/features/settings/formState";
import { saveSupply, setSupplyActive } from "@/services/supabase/supplies";

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

  const validation = validateSupply(rawFields);

  if (!validation.ok) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      errors: validation.errors,
    };
  }

  try {
    await saveSupply(rawId || null, validation.data);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : UNEXPECTED_MESSAGE,
      errors: {},
    };
  }

  revalidatePath("/insumos");
  revalidatePath("/home");
  revalidatePath("/relatorios");

  return {
    status: "success",
    message: rawId ? "Insumo atualizado." : "Insumo cadastrado.",
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
  revalidatePath("/home");
  revalidatePath("/relatorios");
}
