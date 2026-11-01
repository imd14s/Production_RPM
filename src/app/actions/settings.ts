"use server";

import { revalidatePath } from "next/cache";
import { getSessionContext } from "@/lib/auth/session";
import {
  validateCompanySettings,
  validateTaxSettings,
} from "@/lib/validations/settings";
import type { SettingsFormState } from "@/features/settings/formState";
import {
  saveCompanySettings,
  saveTaxSetting,
  setTaxSettingActive,
} from "@/services/supabase/settings";

const FORBIDDEN_MESSAGE = "Apenas administradores podem alterar as configurações.";
const UNEXPECTED_MESSAGE = "Não foi possível concluir a operação. Tente novamente.";

/**
 * Confirma se a sessão atual pertence a um administrador ativo.
 *
 * @returns contexto da sessão quando autorizado, ou null
 */
async function getAdminSession() {
  const session = await getSessionContext();

  if (!session || !session.profile || session.profile.role !== "administrador") {
    return null;
  }

  return session;
}

/**
 * Salva os dados cadastrais e fiscais da empresa.
 *
 * @param previousState estado anterior do formulário (não utilizado)
 * @param formData campos preenchidos
 * @returns estado com mensagem de sucesso ou erros por campo
 */
export async function saveCompanyAction(
  previousState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  void previousState;

  const session = await getAdminSession();

  if (!session) {
    return { status: "error", message: FORBIDDEN_MESSAGE, errors: {} };
  }

  const validation = validateCompanySettings(Object.fromEntries(formData));

  if (!validation.ok) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      errors: validation.errors,
    };
  }

  try {
    await saveCompanySettings(validation.data, session.userId);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : UNEXPECTED_MESSAGE,
      errors: {},
    };
  }

  revalidatePath("/configuracoes");

  return { status: "success", message: "Dados da empresa salvos.", errors: {} };
}

/**
 * Cria ou atualiza um imposto configurável.
 *
 * @param previousState estado anterior do formulário (não utilizado)
 * @param formData campos preenchidos, incluindo `id` quando for edição
 * @returns estado com mensagem de sucesso ou erros por campo
 */
export async function saveTaxAction(
  previousState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  void previousState;

  const session = await getAdminSession();

  if (!session) {
    return { status: "error", message: FORBIDDEN_MESSAGE, errors: {} };
  }

  const rawId = String(formData.get("id") ?? "").trim();
  const validation = validateTaxSettings(Object.fromEntries(formData));

  if (!validation.ok) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      errors: validation.errors,
    };
  }

  try {
    await saveTaxSetting(rawId || null, validation.data);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : UNEXPECTED_MESSAGE,
      errors: {},
    };
  }

  revalidatePath("/configuracoes/impostos");

  return {
    status: "success",
    message: rawId ? "Imposto atualizado." : "Imposto cadastrado.",
    errors: {},
  };
}

/**
 * Ativa ou desativa um imposto.
 *
 * @param formData campos `id` e `isActive` ("true" ou "false")
 */
export async function toggleTaxAction(formData: FormData): Promise<void> {
  const session = await getAdminSession();

  if (!session) {
    return;
  }

  const id = String(formData.get("id") ?? "").trim();
  const isActive = String(formData.get("isActive") ?? "") === "true";

  if (!id) {
    return;
  }

  await setTaxSettingActive(id, isActive);
  revalidatePath("/configuracoes/impostos");
}
