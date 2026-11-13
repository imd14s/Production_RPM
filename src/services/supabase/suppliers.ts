import { connection } from "next/server";
import { parseSupplierRow } from "@/features/suppliers/parse";
import { buildSupplierPayload } from "@/features/suppliers/payload";
import type { Supplier, SupplierInput } from "@/features/suppliers/types";
import { createClient } from "@/services/supabase/server";
import { assertRowDeleted, mapDeleteError } from "@/services/supabase/deleteErrors";

/**
 * Carrega os fornecedores, ativos primeiro.
 * `connection()` interrompe o pré-render: o cliente Supabase usa relógio interno.
 *
 * @returns fornecedores ordenados por nome
 */
export async function listSuppliers(): Promise<Supplier[]> {
  await connection();
  const supabase = await createClient();

  const result = await supabase
    .from("suppliers")
    .select("*")
    .order("is_active", { ascending: false })
    .order("name", { ascending: true });

  if (result.error) {
    throw new Error(
      `Não foi possível carregar os fornecedores. (código ${result.error.code ?? "desconhecido"})`,
    );
  }

  return (result.data ?? [])
    .map(parseSupplierRow)
    .filter((item): item is Supplier => item !== null);
}

/**
 * Cria ou atualiza um fornecedor.
 *
 * @param id identificador do fornecedor, ou null para criar
 * @param input valores já validados
 */
export async function saveSupplier(id: string | null, input: SupplierInput): Promise<void> {
  const supabase = await createClient();
  const payload = buildSupplierPayload(input);

  const { error } = id
    ? await supabase.from("suppliers").update(payload).eq("id", id)
    : await supabase.from("suppliers").insert(payload);

  if (error) {
    throw new Error(
      error.code === "23505"
        ? "Já existe um fornecedor com esse nome ou documento."
        : `Não foi possível salvar o fornecedor. (código ${error.code ?? "desconhecido"})`,
    );
  }
}

/**
 * Ativa ou desativa um fornecedor.
 *
 * @param id identificador do fornecedor
 * @param isActive nova situação
 */
export async function setSupplierActive(id: string, isActive: boolean): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("suppliers")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    throw new Error(
      `Não foi possível alterar a situação do fornecedor. (código ${error.code ?? "desconhecido"})`,
    );
  }
}

/**
 * Exclui fisicamente um fornecedor.
 * Falha com 23503 quando há insumos vinculados.
 * Falha quando nenhuma linha foi removida (RLS sem permissão ou registro ausente).
 *
 * @param id identificador do fornecedor
 */
export async function deleteSupplier(id: string): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("suppliers").delete().eq("id", id).select("id");

  if (error) {
    throw new Error(mapDeleteError(error, "o fornecedor"));
  }

  assertRowDeleted(data, "o fornecedor");
}
