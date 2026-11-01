"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/app/actions/settings";
import { validateChannel, validateChannelFee } from "@/lib/validations/channels";
import type { SettingsFormState } from "@/features/settings/formState";
import {
  saveChannel,
  saveChannelFee,
  setChannelActive,
  setChannelFeeActive,
} from "@/services/supabase/channels";

const UNEXPECTED_MESSAGE = "Não foi possível concluir a operação. Tente novamente.";

/**
 * Cria ou atualiza um canal de venda.
 *
 * @param previousState estado anterior do formulário (não utilizado)
 * @param formData campos preenchidos, incluindo `id` quando for edição
 * @returns estado com mensagem de sucesso ou erros por campo
 */
export async function saveChannelAction(
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
  const validation = validateChannel(Object.fromEntries(formData));

  if (!validation.ok) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      errors: validation.errors,
    };
  }

  try {
    await saveChannel(rawId || null, validation.data);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : UNEXPECTED_MESSAGE,
      errors: {},
    };
  }

  revalidatePath("/configuracoes/canais");

  return {
    status: "success",
    message: rawId ? "Canal atualizado." : "Canal cadastrado.",
    errors: {},
  };
}

/**
 * Ativa ou desativa um canal de venda.
 *
 * @param formData campos `id` e `isActive`
 */
export async function toggleChannelAction(formData: FormData): Promise<void> {
  const session = await getAdminSession();

  if (!session) {
    return;
  }

  const id = String(formData.get("id") ?? "").trim();
  const isActive = String(formData.get("isActive") ?? "") === "true";

  if (!id) {
    return;
  }

  await setChannelActive(id, isActive);
  revalidatePath("/configuracoes/canais");
}

/**
 * Cria ou atualiza uma taxa de canal.
 *
 * @param previousState estado anterior do formulário (não utilizado)
 * @param formData campos preenchidos, incluindo `channelId` e `id` opcional
 * @returns estado com mensagem de sucesso ou erros por campo
 */
export async function saveChannelFeeAction(
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
  const channelId = String(formData.get("channelId") ?? "").trim();
  const validation = validateChannelFee(Object.fromEntries(formData));

  if (!channelId) {
    return { status: "error", message: "Canal não informado.", errors: {} };
  }

  if (!validation.ok) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      errors: validation.errors,
    };
  }

  try {
    await saveChannelFee(rawId || null, channelId, validation.data);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : UNEXPECTED_MESSAGE,
      errors: {},
    };
  }

  revalidatePath(`/configuracoes/canais/${channelId}`);
  revalidatePath("/configuracoes/canais");

  return {
    status: "success",
    message: rawId ? "Taxa atualizada." : "Taxa cadastrada.",
    errors: {},
  };
}

/**
 * Ativa ou desativa uma taxa de canal.
 *
 * @param formData campos `id`, `channelId` e `isActive`
 */
export async function toggleChannelFeeAction(formData: FormData): Promise<void> {
  const session = await getAdminSession();

  if (!session) {
    return;
  }

  const id = String(formData.get("id") ?? "").trim();
  const channelId = String(formData.get("channelId") ?? "").trim();
  const isActive = String(formData.get("isActive") ?? "") === "true";

  if (!id || !channelId) {
    return;
  }

  await setChannelFeeActive(id, isActive);
  revalidatePath(`/configuracoes/canais/${channelId}`);
  revalidatePath("/configuracoes/canais");
}
