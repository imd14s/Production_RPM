import {
  COMPANY_TYPES,
  TAX_REGIMES,
  type CompanySettings,
  type CompanyType,
  type TaxKind,
  type TaxRegime,
  type TaxSetting,
} from "./types";

/**
 * Lê um campo textual de uma linha do banco.
 *
 * @param value valor bruto
 * @returns string ou vazio
 */
function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * Converte uma linha de `company_settings` no tipo de domínio.
 *
 * @param row linha retornada pelo Supabase
 * @returns empresa tipada ou null quando o registro não segue o contrato
 */
export function parseCompanyRow(row: unknown): CompanySettings | null {
  if (typeof row !== "object" || row === null) {
    return null;
  }

  const candidate = row as Record<string, unknown>;
  const legalName = readString(candidate.legal_name).trim();
  const tradeName = readString(candidate.trade_name).trim();
  const companyType = candidate.company_type;
  const taxRegime = candidate.tax_regime;

  if (legalName.length < 2 || tradeName.length < 2) {
    return null;
  }

  if (
    typeof companyType !== "string" ||
    !COMPANY_TYPES.includes(companyType as CompanyType) ||
    typeof taxRegime !== "string" ||
    !TAX_REGIMES.includes(taxRegime as TaxRegime)
  ) {
    return null;
  }

  return {
    legalName,
    tradeName,
    document: readString(candidate.document),
    companyType: companyType as CompanyType,
    taxRegime: taxRegime as TaxRegime,
    cnae: readString(candidate.cnae),
    stateRegistration: readString(candidate.state_registration),
    municipalRegistration: readString(candidate.municipal_registration),
    email: readString(candidate.email),
    phone: readString(candidate.phone),
    street: readString(candidate.street),
    number: readString(candidate.number),
    complement: readString(candidate.complement),
    district: readString(candidate.district),
    city: readString(candidate.city),
    state: readString(candidate.state),
    zipCode: readString(candidate.zip_code),
  };
}

/**
 * Converte uma linha de `tax_settings` no tipo de domínio.
 *
 * @param row linha retornada pelo Supabase
 * @returns imposto tipado ou null quando o registro não segue o contrato
 */
export function parseTaxRow(row: unknown): TaxSetting | null {
  if (typeof row !== "object" || row === null) {
    return null;
  }

  const candidate = row as Record<string, unknown>;
  const id = candidate.id;
  const name = readString(candidate.name).trim();
  const kind = candidate.kind;
  const isActive = candidate.is_active;

  if (typeof id !== "string" || name.length < 2) {
    return null;
  }

  if (kind !== "percentual" && kind !== "fixo") {
    return null;
  }

  if (typeof isActive !== "boolean") {
    return null;
  }

  const rate = typeof candidate.rate === "string" ? candidate.rate : null;
  const amountCents =
    typeof candidate.amount_cents === "number" ? candidate.amount_cents : null;

  if (kind === "percentual" && rate === null) {
    return null;
  }

  if (kind === "fixo" && amountCents === null) {
    return null;
  }

  return {
    id,
    name,
    kind: kind as TaxKind,
    rate: kind === "percentual" ? rate : null,
    amountCents: kind === "fixo" ? amountCents : null,
    isActive,
    notes: readString(candidate.notes),
  };
}
