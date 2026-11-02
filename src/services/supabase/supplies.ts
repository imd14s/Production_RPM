import { connection } from "next/server";
import {
  parseSupplyPriceRow,
  parseSupplyRow,
} from "@/features/supplies/parse";
import {
  buildSupplyPayload,
  buildSupplyPricePayload,
  parseSupplyUnit,
} from "@/features/supplies/payload";
import type {
  Supply,
  SupplyInput,
  SupplyPrice,
  SupplyPriceInput,
  SupplyWithCost,
  SupplyWithPrices,
} from "@/features/supplies/types";
import { createClient } from "@/services/supabase/server";

export type { SupplyWithCost, SupplyWithPrices };

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
 * Carrega os insumos com o custo por unidade da aquisição mais recente.
 * `connection()` interrompe o pré-render: o cliente Supabase usa relógio interno.
 *
 * @returns insumos com custo atual e contagem de aquisições
 */
export async function listSuppliesWithCost(): Promise<SupplyWithCost[]> {
  await connection();
  const supabase = await createClient();

  const [suppliesResult, pricesResult] = await Promise.all([
    supabase
      .from("supplies")
      .select("*")
      .order("is_active", { ascending: false })
      .order("name", { ascending: true }),
    supabase
      .from("supply_prices")
      .select("*")
      .order("acquired_on", { ascending: false })
      .order("updated_at", { ascending: false }),
  ]);

  if (suppliesResult.error) {
    throw new Error(
      `Não foi possível carregar os insumos. (código ${suppliesResult.error.code ?? "desconhecido"})`,
    );
  }

  if (pricesResult.error) {
    throw new Error("Não foi possível carregar o histórico de preços dos insumos.");
  }

  const supplies = (suppliesResult.data ?? [])
    .map(parseSupplyRow)
    .filter((item): item is Supply => item !== null);

  const prices = (pricesResult.data ?? [])
    .map(parseSupplyPriceRow)
    .filter((item): item is SupplyPrice => item !== null);

  return supplies.map((supply) => {
    const supplyPrices = prices.filter((price) => price.supplyId === supply.id);
    const latest = supplyPrices[0] ?? null;

    return {
      supply,
      currentUnitCostCents: latest?.unitCostCents ?? null,
      lastAcquiredOn: latest?.acquiredOn ?? null,
      acquisitionCount: supplyPrices.length,
    };
  });
}

/**
 * Carrega um insumo com todo o histórico de aquisições.
 * `connection()` interrompe o pré-render: o cliente Supabase usa relógio interno.
 *
 * @param id identificador do insumo
 * @returns insumo com aquisições, ou null quando não existe
 */
export async function getSupplyWithPrices(id: string): Promise<SupplyWithPrices | null> {
  await connection();
  const supabase = await createClient();

  const { data: supplyData, error: supplyError } = await supabase
    .from("supplies")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (supplyError) {
    throw new Error(
      `Não foi possível carregar o insumo. (código ${supplyError.code ?? "desconhecido"})`,
    );
  }

  const supply = parseSupplyRow(supplyData);

  if (!supply) {
    return null;
  }

  const { data: pricesData, error: pricesError } = await supabase
    .from("supply_prices")
    .select("*")
    .eq("supply_id", id)
    .order("acquired_on", { ascending: false })
    .order("updated_at", { ascending: false });

  if (pricesError) {
    throw new Error(
      `Não foi possível carregar as aquisições do insumo. (código ${pricesError.code ?? "desconhecido"})`,
    );
  }

  const prices = (pricesData ?? [])
    .map(parseSupplyPriceRow)
    .filter((item): item is SupplyPrice => item !== null);

  return { supply, prices };
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
 * Cria ou atualiza uma aquisição de insumo.
 *
 * @param id identificador da aquisição, ou null para criar
 * @param supplyId insumo dono da aquisição (usado na criação)
 * @param input valores já validados (com fornecedor opcional)
 */
export async function saveSupplyPrice(
  id: string | null,
  supplyId: string,
  input: SupplyPriceInput,
): Promise<void> {
  const supabase = await createClient();
  const supplyResult = await supabase
    .from("supplies")
    .select("unit")
    .eq("id", supplyId)
    .maybeSingle();

  if (supplyResult.error) {
    throw new Error(
      `Não foi possível carregar a unidade base do insumo. (código ${supplyResult.error.code ?? "desconhecido"})`,
    );
  }

  const baseUnit = parseSupplyUnit(supplyResult.data?.unit);

  if (!baseUnit) {
    throw new Error("Não foi possível identificar a unidade base do insumo.");
  }

  const payload = buildSupplyPricePayload(supplyId, input, baseUnit);

  const { error } = id
    ? await supabase.from("supply_prices").update(payload).eq("id", id)
    : await supabase.from("supply_prices").insert(payload);

  if (error) {
    throw new Error(
      `Não foi possível salvar a compra. (código ${error.code ?? "desconhecido"})`,
    );
  }
}
