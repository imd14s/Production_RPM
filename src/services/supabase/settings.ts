import { connection } from "next/server";
import { parseCompanyRow, parseTaxRow } from "@/features/settings/parse";
import {
  buildCompanyPayload,
  buildTaxPayload,
} from "@/features/settings/payload";
import type {
  CompanySettings,
  TaxSetting,
  TaxSettingInput,
} from "@/features/settings/types";
import { createClient } from "@/services/supabase/server";

/**
 * Lê a configuração da empresa (linha única).
 * `connection()` interrompe o pré-render: o cliente Supabase usa relógio interno.
 *
 * @returns empresa cadastrada ou null quando ainda não existe
 */
export async function getCompanySettings(): Promise<CompanySettings | null> {
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("company_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Não foi possível carregar os dados da empresa. (código ${error.code ?? "desconhecido"})`,
    );
  }

  return parseCompanyRow(data);
}

/**
 * Grava a configuração da empresa.
 *
 * @param input dados já validados
 * @param userId usuário responsável pela alteração
 */
export async function saveCompanySettings(
  input: CompanySettings,
  userId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("company_settings")
    .upsert(buildCompanyPayload(input, userId), { onConflict: "id" });

  if (error) {
    throw new Error(
      `Não foi possível salvar os dados da empresa. (código ${error.code ?? "desconhecido"})`,
    );
  }
}

/**
 * Lista os impostos configurados, ativos e inativos.
 *
 * @returns impostos ordenados por nome
 */
export async function listTaxSettings(): Promise<TaxSetting[]> {
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tax_settings")
    .select("*")
    .order("is_active", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(
      `Não foi possível carregar os impostos. (código ${error.code ?? "desconhecido"})`,
    );
  }

  return (data ?? [])
    .map(parseTaxRow)
    .filter((item): item is TaxSetting => item !== null);
}

/**
 * Cria ou atualiza um imposto.
 *
 * @param id identificador do imposto, ou null para criar
 * @param input valores já validados
 */
export async function saveTaxSetting(
  id: string | null,
  input: TaxSettingInput,
): Promise<void> {
  const supabase = await createClient();

  const { error } = id
    ? await supabase.from("tax_settings").update(buildTaxPayload(input)).eq("id", id)
    : await supabase.from("tax_settings").insert(buildTaxPayload(input));

  if (error) {
    throw new Error(
      error.code === "23505"
        ? "Já existe um imposto com esse nome."
        : `Não foi possível salvar o imposto. (código ${error.code ?? "desconhecido"})`,
    );
  }
}

/**
 * Ativa ou desativa um imposto sem apagar o histórico.
 *
 * @param id identificador do imposto
 * @param isActive nova situação
 */
export async function setTaxSettingActive(id: string, isActive: boolean): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tax_settings")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    throw new Error(
      `Não foi possível alterar a situação do imposto. (código ${error.code ?? "desconhecido"})`,
    );
  }
}
