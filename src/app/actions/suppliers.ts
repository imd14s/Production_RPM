"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/app/actions/settings";
import { validateSupplier } from "@/lib/validations/suppliers";
import type { SettingsFormState } from "@/features/settings/formState";
import { saveSupplier, setSupplierActive } from "@/services/supabase/suppliers";

const UNEXPECTED_MESSAGE = "Não foi possível concluir a operação. Tente novamente.";

/**
 * Cria ou atualiza um fornecedor.
 *
 * @param previousState estado anterior do formulário (não utilizado)
 * @param formData campos preenchidos, incluindo `id` quando for edição
 * @returns estado com mensagem de sucesso ou erros por campo
 */
export async function saveSupplierAction(
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
  const validation = validateSupplier(Object.fromEntries(formData));

  if (!validation.ok) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      errors: validation.errors,
    };
  }

  try {
    await saveSupplier(rawId || null, validation.data);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : UNEXPECTED_MESSAGE,
      errors: {},
    };
  }

  revalidatePath("/fornecedores");

  return {
    status: "success",
    message: rawId ? "Fornecedor atualizado." : "Fornecedor cadastrado.",
    errors: {},
  };
}

/**
 * Ativa ou desativa um fornecedor.
 *
 * @param formData campos `id` e `isActive`
 */
export async function toggleSupplierAction(formData: FormData): Promise<void> {
  const session = await getAdminSession();

  if (!session) {
    return;
  }

  const id = String(formData.get("id") ?? "").trim();
  const isActive = String(formData.get("isActive") ?? "") === "true";

  if (!id) {
    return;
  }

  await setSupplierActive(id, isActive);
  revalidatePath("/fornecedores");
}
