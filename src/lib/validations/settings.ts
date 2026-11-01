import { parseAmountToCents } from "@/lib/money";
import { parsePercentInput } from "@/lib/percent";
import {
  COMPANY_TYPES,
  TAX_REGIMES,
  type CompanySettings,
  type CompanyType,
  type TaxKind,
  type TaxRegime,
  type TaxSettingInput,
} from "@/features/settings/types";

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: Record<string, string> };

/**
 * Lê um campo de texto do formulário e remove espaços nas pontas.
 *
 * @param raw dados brutos do formulário
 * @param field nome do campo
 * @returns texto limpo ou string vazia
 */
export function readText(raw: Record<string, unknown>, field: string): string {
  const value = raw[field];

  return typeof value === "string" ? value.trim() : "";
}

/**
 * Valida os dígitos verificadores de um CNPJ.
 *
 * @param digits CNPJ apenas com números
 * @returns true quando o CNPJ é válido
 */
export function isValidCnpj(digits: string): boolean {
  if (!/^[0-9]{14}$/.test(digits) || /^(\d)\1{13}$/.test(digits)) {
    return false;
  }

  const calculateDigit = (length: number): number => {
    const weights = length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;

    for (let index = 0; index < length; index += 1) {
      sum += Number(digits[index]) * weights[index];
    }

    const remainder = sum % 11;

    return remainder < 2 ? 0 : 11 - remainder;
  };

  return calculateDigit(12) === Number(digits[12]) && calculateDigit(13) === Number(digits[13]);
}

/**
 * Mantém apenas os dígitos de um texto.
 *
 * @param value texto com máscara
 * @returns somente números
 */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Valida os dados cadastrais e fiscais da empresa.
 *
 * @param raw campos do formulário
 * @returns dados normalizados ou mensagens por campo
 */
export function validateCompanySettings(
  raw: Record<string, unknown>,
): ValidationResult<CompanySettings> {
  const errors: Record<string, string> = {};

  const legalName = readText(raw, "legalName");
  const tradeName = readText(raw, "tradeName");
  const document = onlyDigits(readText(raw, "document"));
  const companyType = readText(raw, "companyType") as CompanyType;
  const taxRegime = readText(raw, "taxRegime") as TaxRegime;
  const cnae = readText(raw, "cnae");
  const stateRegistration = readText(raw, "stateRegistration");
  const municipalRegistration = readText(raw, "municipalRegistration");
  const email = readText(raw, "email");
  const phone = onlyDigits(readText(raw, "phone"));
  const street = readText(raw, "street");
  const number = readText(raw, "number");
  const complement = readText(raw, "complement");
  const district = readText(raw, "district");
  const city = readText(raw, "city");
  const state = readText(raw, "state").toUpperCase();
  const zipCode = onlyDigits(readText(raw, "zipCode"));

  if (legalName.length < 2 || legalName.length > 160) {
    errors.legalName = "Informe a razão social (2 a 160 caracteres).";
  }

  if (tradeName.length < 2 || tradeName.length > 160) {
    errors.tradeName = "Informe o nome fantasia (2 a 160 caracteres).";
  }

  if (!isValidCnpj(document)) {
    errors.document = "CNPJ inválido.";
  }

  if (!COMPANY_TYPES.includes(companyType)) {
    errors.companyType = "Escolha o tipo de empresa.";
  }

  if (!TAX_REGIMES.includes(taxRegime)) {
    errors.taxRegime = "Escolha o regime tributário.";
  }

  if (cnae && (cnae.length < 4 || cnae.length > 20)) {
    errors.cnae = "CNAE deve ter entre 4 e 20 caracteres.";
  }

  if (stateRegistration && (stateRegistration.length < 2 || stateRegistration.length > 20)) {
    errors.stateRegistration = "Inscrição estadual inválida.";
  }

  if (
    municipalRegistration &&
    (municipalRegistration.length < 2 || municipalRegistration.length > 20)
  ) {
    errors.municipalRegistration = "Inscrição municipal inválida.";
  }

  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    errors.email = "E-mail inválido.";
  }

  if (phone && (phone.length < 10 || phone.length > 11)) {
    errors.phone = "Telefone deve ter DDD e 8 ou 9 dígitos.";
  }

  if (street && (street.length < 2 || street.length > 160)) {
    errors.street = "Logradouro inválido.";
  }

  if (number && number.length > 20) {
    errors.number = "Número inválido.";
  }

  if (complement.length > 80) {
    errors.complement = "Complemento deve ter até 80 caracteres.";
  }

  if (district && (district.length < 2 || district.length > 80)) {
    errors.district = "Bairro inválido.";
  }

  if (city && (city.length < 2 || city.length > 80)) {
    errors.city = "Cidade inválida.";
  }

  if (state && !/^[A-Z]{2}$/.test(state)) {
    errors.state = "UF deve ter duas letras.";
  }

  if (zipCode && zipCode.length !== 8) {
    errors.zipCode = "CEP deve ter 8 dígitos.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      legalName,
      tradeName,
      document,
      companyType,
      taxRegime,
      cnae,
      stateRegistration,
      municipalRegistration,
      email,
      phone,
      street,
      number,
      complement,
      district,
      city,
      state,
      zipCode,
    },
  };
}

/**
 * Valida um imposto configurável.
 * Percentual e valor fixo são mutuamente exclusivos.
 *
 * @param raw campos do formulário
 * @returns imposto normalizado ou mensagens por campo
 */
export function validateTaxSettings(
  raw: Record<string, unknown>,
): ValidationResult<TaxSettingInput> {
  const errors: Record<string, string> = {};

  const name = readText(raw, "name");
  const kind = readText(raw, "kind") as TaxKind;
  const notes = readText(raw, "notes");

  if (name.length < 2 || name.length > 80) {
    errors.name = "Informe o nome do imposto (2 a 80 caracteres).";
  }

  if (kind !== "percentual" && kind !== "fixo") {
    errors.kind = "Escolha entre percentual e valor fixo.";
  }

  if (notes.length > 500) {
    errors.notes = "Observação deve ter até 500 caracteres.";
  }

  let rate: string | null = null;
  let amountCents: number | null = null;

  if (kind === "percentual") {
    rate = parsePercentInput(readText(raw, "rate"));

    if (rate === null) {
      errors.rate = "Informe um percentual entre 0 e 100.";
    }
  }

  if (kind === "fixo") {
    amountCents = parseAmountToCents(readText(raw, "amount"));

    if (amountCents === null) {
      errors.amount = "Informe o valor fixo em reais.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data: { name, kind, rate, amountCents, notes } };
}
