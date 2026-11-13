import { connection } from "next/server";
import { parseSupplyRow } from "@/features/supplies/parse";
import { buildSupplyPayload } from "@/features/supplies/payload";
import type {
  Supply,
  SupplyInput,
  SupplyUnit,
  SupplyWithCost,
} from "@/features/supplies/types";
import { createClient } from "@/services/supabase/server";
import { assertRowDeleted, mapDeleteError } from "@/services/supabase/deleteErrors";
import type {
  SupplyUnitContext,
  SupplyUnitContexts,
} from "@/lib/validations/products";

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

/**
 * Carrega a unidade base e a equivalência de embalagem de todos os insumos.
 * Usado para converter a quantidade da ficha técnica para a unidade base.
 *
 * @returns contexto de unidades indexado pelo identificador do insumo
 */
export async function listSupplyUnitContexts(): Promise<SupplyUnitContexts> {
  await connection();
  const supabase = await createClient();

  const result = await supabase.from("supplies").select("id, unit, units_per_package");

  if (result.error) {
    throw new Error(
      `Não foi possível carregar os insumos. (código ${result.error.code ?? "desconhecido"})`,
    );
  }

  const contexts = new Map<string, SupplyUnitContext>();

  for (const row of result.data ?? []) {
    const candidate = row as Record<string, unknown>;
    const id = candidate.id;
    const unit = candidate.unit;

    if (typeof id !== "string" || typeof unit !== "string") {
      continue;
    }

    const unitsPerPackage = readUnitsPerPackage(candidate.units_per_package);

    contexts.set(id, {
      unit: unit as SupplyUnit,
      unitsPerPackage,
    });
  }

  return contexts;
}

/**
 * Lê a equivalência de embalagem vinda do banco.
 *
 * @param value valor bruto da coluna `units_per_package`
 * @returns número positivo ou null quando não informado
 */
function readUnitsPerPackage(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  return null;
}

/**
 * Exclui fisicamente um insumo (com conversões em cascata).
 * Falha com 23503 quando o insumo aparece em composições de produto.
 * Falha quando nenhuma linha foi removida (RLS sem permissão ou registro ausente).
 *
 * @param id identificador do insumo
 */
export async function deleteSupply(id: string): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("supplies").delete().eq("id", id).select("id");

  if (error) {
    throw new Error(mapDeleteError(error, "o insumo"));
  }

  assertRowDeleted(data, "o insumo");
}
