import {
  parseCompanyRow,
  parseTaxRow,
} from "@/features/settings/parse";
import type {
  CompanySettings,
  TaxSetting,
  TaxSettingInput,
} from "@/features/settings/types";
import { createClient } from "@/services/supabase/server";

/**
 * Lê a configuração da empresa (linha única).
 *
 * @returns empresa cadastrada ou null quando ainda não existe
 */
export async function getCompanySettings(): Promise<CompanySettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("company_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar os dados da empresa.");
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
  const { error } = await supabase.from("company_settings").upsert(
    {
      id: 1,
      legal_name: input.legalName,
      trade_name: input.tradeName,
      document: input.document,
      company_type: input.companyType,
      tax_regime: input.taxRegime,
      cnae: input.cnae || null,
      state_registration: input.stateRegistration || null,
      municipal_registration: input.municipalRegistration || null,
      email: input.email || null,
      phone: input.phone || null,
      street: input.street || null,
      number: input.number || null,
      complement: input.complement || null,
      district: input.district || null,
      city: input.city || null,
      state: input.state || null,
      zip_code: input.zipCode || null,
      updated_by: userId,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error("Não foi possível salvar os dados da empresa.");
  }
}

/**
 * Lista os impostos configurados, ativos e inativos.
 *
 * @returns impostos ordenados por nome
 */
export async function listTaxSettings(): Promise<TaxSetting[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tax_settings")
    .select("*")
    .order("is_active", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error("Não foi possível carregar os impostos.");
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
  const payload = {
    name: input.name,
    kind: input.kind,
    rate: input.rate,
    amount_cents: input.amountCents,
    notes: input.notes || null,
  };

  const { error } = id
    ? await supabase.from("tax_settings").update(payload).eq("id", id)
    : await supabase.from("tax_settings").insert(payload);

  if (error) {
    throw new Error(
      error.code === "23505"
        ? "Já existe um imposto com esse nome."
        : "Não foi possível salvar o imposto.",
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
    throw new Error("Não foi possível alterar a situação do imposto.");
  }
}
