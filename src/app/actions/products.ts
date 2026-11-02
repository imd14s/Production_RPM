"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/app/actions/settings";
import type { SettingsFormState } from "@/features/settings/formState";
import { createsCompositionCycle } from "@/features/products/cycle";
import { isUuid, validateProduct } from "@/lib/validations/products";
import {
  listProductCompositionEdges,
  saveProduct,
  setProductActive,
} from "@/services/supabase/products";

const FORBIDDEN_MESSAGE = "Apenas administradores podem alterar os produtos.";

/**
 * Cria ou atualiza um produto com sua ficha técnica.
 *
 * @param previousState estado anterior do formulário
 * @param formData campos preenchidos pelo administrador
 * @returns estado com mensagem de sucesso ou erros por campo
 */
export async function saveProductAction(
  previousState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  void previousState;

  const session = await getAdminSession();

  if (!session) {
    return { status: "error", message: FORBIDDEN_MESSAGE, errors: {} };
  }

  const rawId = String(formData.get("id") ?? "").trim();

  if (rawId && !isUuid(rawId)) {
    return {
      status: "error",
      message: "O identificador do produto é inválido.",
      errors: {},
    };
  }

  const validation = validateProduct(Object.fromEntries(formData));

  if (!validation.ok) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      errors: validation.errors,
    };
  }

  try {
    if (rawId) {
      const currentEdges = await listProductCompositionEdges();
      const retainedEdges = currentEdges.filter((edge) => edge.productId !== rawId);
      const proposedEdges = [];

      for (const component of validation.data.components) {
        if (component.targetType !== "product") {
          continue;
        }

        if (
          createsCompositionCycle(
            [...retainedEdges, ...proposedEdges],
            rawId,
            component.productId,
          )
        ) {
          return {
            status: "error",
            message: "A composição não pode criar uma referência circular.",
            errors: { components: "Escolha outro produto para esta composição." },
          };
        }

        proposedEdges.push({
          productId: rawId,
          componentProductId: component.productId,
        });
      }
    }

    await saveProduct(rawId || null, validation.data);
  } catch (error) {
    if (error instanceof Error) {
      return {
        status: "error",
        message: error.message,
        errors: {},
      };
    }

    throw error;
  }

  revalidatePath("/produtos");

  return {
    status: "success",
    message: rawId ? "Produto atualizado." : "Produto cadastrado.",
    errors: {},
  };
}

/**
 * Ativa ou desativa logicamente um produto.
 *
 * @param formData campos `id` e `isActive`
 */
export async function toggleProductAction(formData: FormData): Promise<void> {
  const session = await getAdminSession();

  if (!session) {
    throw new Error(FORBIDDEN_MESSAGE);
  }

  const productId = String(formData.get("id") ?? "").trim();
  const activeText = String(formData.get("isActive") ?? "");

  if (!isUuid(productId) || (activeText !== "true" && activeText !== "false")) {
    throw new Error("Os dados para alterar a situação do produto são inválidos.");
  }

  await setProductActive(productId, activeText === "true");
  revalidatePath("/produtos");
}
