import { connection } from "next/server";
import { parseSupplyRow } from "@/features/supplies/parse";
import { buildSupplyPayload } from "@/features/supplies/payload";
import type {
  Supply,
  SupplyInput,
  SupplyWithCost,
} from "@/features/supplies/types";
import { createClient } from "@/services/supabase/server";

export type { SupplyWithCost };

/**
 * Carrega todos os insumos, ativos primeiro.
 * `connection()` interrompe o pré-render: o cliente Supabase usa relógio interno.
 *
 * @returns insumos ordenados por nome
 */
export async function listSupplies(): Promise<Supply[]> {
  await connection();
  const supabase = await createClient();

  const result = await supabase
    .from("supplies")
    .select("*")
    .order("is_active", { ascending: false })
    .order("name", { ascending: true });

  if (result.error) {
    throw new Error(
      `Não foi possível carregar os insumos. (código ${result.error.code ?? "desconhecido"})`,
    );
  }

  return (result.data ?? [])
    .map(parseSupplyRow)
    .filter((item): item is Supply => item !== null);
}

/**
 * Carrega os insumos com seus dados atuais de custo.
 * `connection()` interrompe o pré-render: o cliente Supabase usa relógio interno.
 *
 * @returns insumos com custo atual
 */
export async function listSuppliesWithCost(): Promise<SupplyWithCost[]> {
  return listSupplies();
}

/**
 * Cria ou atualiza um insumo.
 *
 * @param id identificador do insumo, ou null para criar
 * @param input valores já validados
 */
export async function saveSupply(id: string | null, input: SupplyInput): Promise<void> {
  const supabase = await createClient();
  const payload = buildSupplyPayload(input);

  const { error } = id
    ? await supabase.from("supplies").update(payload).eq("id", id)
    : await supabase.from("supplies").insert(payload);

  if (error) {
    throw new Error(
      error.code === "23505"
        ? "Já existe um insumo com esse nome."
        : `Não foi possível salvar o insumo. (código ${error.code ?? "desconhecido"})`,
    );
  }
}

/**
 * Ativa ou desativa um insumo.
 *
 * @param id identificador do insumo
 * @param isActive nova situação
 */
export async function setSupplyActive(id: string, isActive: boolean): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("supplies").update({ is_active: isActive }).eq("id", id);

  if (error) {
    throw new Error(
      `Não foi possível alterar a situação do insumo. (código ${error.code ?? "desconhecido"})`,
    );
  }
}
