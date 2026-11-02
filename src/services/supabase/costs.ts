import { connection } from "next/server";
import { parseLaborCostRow, parseOperatingExpenseRow } from "@/features/costs/parse";
import {
  buildLaborCostPayload,
  buildOperatingExpensePayload,
} from "@/features/costs/payload";
import type {
  LaborCost,
  LaborCostInput,
  OperatingExpense,
  OperatingExpenseInput,
} from "@/features/costs/types";
import { createClient } from "@/services/supabase/server";

/**
 * Carrega as despesas fixas, ativas primeiro.
 * `connection()` interrompe o pré-render: o cliente Supabase usa relógio interno.
 *
 * @returns despesas ordenadas por nome
 */
export async function listOperatingExpenses(): Promise<OperatingExpense[]> {
  await connection();
  const supabase = await createClient();

  const result = await supabase
    .from("operating_expenses")
    .select("*")
    .order("is_active", { ascending: false })
    .order("name", { ascending: true });

  if (result.error) {
    throw new Error(
      `Não foi possível carregar as despesas fixas. (código ${result.error.code ?? "desconhecido"})`,
    );
  }

  return (result.data ?? [])
    .map(parseOperatingExpenseRow)
    .filter((item): item is OperatingExpense => item !== null);
}

/**
 * Carrega os custos de mão de obra, ativos primeiro.
 * `connection()` interrompe o pré-render: o cliente Supabase usa relógio interno.
 *
 * @returns custos ordenados por nome
 */
export async function listLaborCosts(): Promise<LaborCost[]> {
  await connection();
  const supabase = await createClient();

  const result = await supabase
    .from("labor_costs")
    .select("*")
    .order("is_active", { ascending: false })
    .order("name", { ascending: true });

  if (result.error) {
    throw new Error(
      `Não foi possível carregar a mão de obra. (código ${result.error.code ?? "desconhecido"})`,
    );
  }

  return (result.data ?? [])
    .map(parseLaborCostRow)
    .filter((item): item is LaborCost => item !== null);
}

/**
 * Cria ou atualiza uma despesa fixa.
 *
 * @param id identificador da despesa, ou null para criar
 * @param input valores já validados
 */
export async function saveOperatingExpense(
  id: string | null,
  input: OperatingExpenseInput,
): Promise<void> {
  const supabase = await createClient();
  const payload = buildOperatingExpensePayload(input);

  const { error } = id
    ? await supabase.from("operating_expenses").update(payload).eq("id", id)
    : await supabase.from("operating_expenses").insert(payload);

  if (error) {
    throw new Error(
      error.code === "23505"
        ? "Já existe uma despesa fixa com esse nome."
        : `Não foi possível salvar a despesa fixa. (código ${error.code ?? "desconhecido"})`,
    );
  }
}

/**
 * Ativa ou desativa uma despesa fixa.
 *
 * @param id identificador da despesa
 * @param isActive nova situação
 */
export async function setOperatingExpenseActive(id: string, isActive: boolean): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("operating_expenses")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    throw new Error(
      `Não foi possível alterar a situação da despesa. (código ${error.code ?? "desconhecido"})`,
    );
  }
}

/**
 * Cria ou atualiza um custo de mão de obra.
 *
 * @param id identificador do custo, ou null para criar
 * @param input valores já validados
 */
export async function saveLaborCost(
  id: string | null,
  input: LaborCostInput,
): Promise<void> {
  const supabase = await createClient();
  const payload = buildLaborCostPayload(input);

  const { error } = id
    ? await supabase.from("labor_costs").update(payload).eq("id", id)
    : await supabase.from("labor_costs").insert(payload);

  if (error) {
    throw new Error(
      error.code === "23505"
        ? "Já existe um custo de mão de obra com esse nome."
        : `Não foi possível salvar a mão de obra. (código ${error.code ?? "desconhecido"})`,
    );
  }
}

/**
 * Ativa ou desativa um custo de mão de obra.
 *
 * @param id identificador do custo
 * @param isActive nova situação
 */
export async function setLaborCostActive(id: string, isActive: boolean): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("labor_costs").update({ is_active: isActive }).eq("id", id);

  if (error) {
    throw new Error(
      `Não foi possível alterar a situação da mão de obra. (código ${error.code ?? "desconhecido"})`,
    );
  }
}
