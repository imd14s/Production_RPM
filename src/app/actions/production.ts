"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/app/actions/settings";
import { validateProductionBatch, validateInventoryMovement } from "@/lib/validations/production";
import type { SettingsFormState } from "@/features/settings/formState";
import { saveProductionBatch, saveInventoryMovement } from "@/services/supabase/production";

const UNEXPECTED_MESSAGE = "Não foi possível concluir a operação. Tente novamente.";

export async function saveProductionBatchAction(
  previousState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  void previousState;

  const session = await getAdminSession();

  if (!session) {
    return { status: "error", message: "Apenas administradores podem registrar produção.", errors: {} };
  }

  const validation = validateProductionBatch(Object.fromEntries(formData));

  if (!validation.ok) {
    return { status: "error", message: "Confira os campos destacados.", errors: validation.errors };
  }

  try {
    await saveProductionBatch(validation.data);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : UNEXPECTED_MESSAGE, errors: {} };
  }

  revalidatePath("/producao");
  revalidatePath("/estoque");

  return { status: "success", message: "Lote de produção registrado.", errors: {} };
}

export async function saveInventoryMovementAction(
  previousState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  void previousState;

  const session = await getAdminSession();

  if (!session) {
    return { status: "error", message: "Apenas administradores podem movimentar estoque.", errors: {} };
  }

  const validation = validateInventoryMovement(Object.fromEntries(formData));

  if (!validation.ok) {
    return { status: "error", message: "Confira os campos destacados.", errors: validation.errors };
  }

  try {
    await saveInventoryMovement(validation.data);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : UNEXPECTED_MESSAGE, errors: {} };
  }

  revalidatePath("/estoque");

  return { status: "success", message: "Movimentação registrada.", errors: {} };
}