import type { CompanySettings, TaxSettingInput } from "@/features/settings/types";

/**
 * Monta o payload de gravação da empresa no formato do banco (snake_case).
 * Função pura: o teste prova campo a campo o que é enviado ao Supabase.
 *
 * @param input dados já validados e normalizados
 * @param userId usuário responsável pela alteração
 * @returns payload pronto para o upsert
 */
export function buildCompanyPayload(
  input: CompanySettings,
  userId: string,
): Record<string, unknown> {
  return {
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
    monthly_output_units: input.monthlyOutputUnits,
    default_retail_margin: input.defaultRetailMargin,
    default_wholesale_margin: input.defaultWholesaleMargin,
    updated_by: userId,
  };
}

/**
 * Monta o payload de gravação de um imposto no formato do banco.
 *
 * @param input imposto já validado
 * @returns payload pronto para insert/update
 */
export function buildTaxPayload(input: TaxSettingInput): Record<string, unknown> {
  return {
    name: input.name,
    kind: input.kind,
    rate: input.rate,
    amount_cents: input.amountCents,
    notes: input.notes || null,
  };
}
