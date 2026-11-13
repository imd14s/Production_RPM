import { isValidCnpj, onlyDigits } from "@/lib/validations/settings";
import type { SupplierInput } from "@/features/suppliers/types";

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: Record<string, string> };

/**
 * Valida os dígitos verificadores de um CPF.
 *
 * @param digits exatamente 11 dígitos
 * @returns true quando o CPF é matematicamente válido
 */
export function isValidCpf(digits: string): boolean {
  if (!/^[0-9]{11}$/.test(digits) || /^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  const calculateDigit = (length: number): number => {
    const weights = length === 9
      ? [10, 9, 8, 7, 6, 5, 4, 3, 2]
      : [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;

    for (let index = 0; index < length; index += 1) {
      sum += Number(digits[index]) * weights[index];
    }

    const remainder = (sum * 10) % 11;

    return remainder === 10 ? 0 : remainder;
  };

  return calculateDigit(9) === Number(digits[9]) && calculateDigit(10) === Number(digits[10]);
}

/**
 * Valida os dados de um fornecedor.
 * Documento precisa ser CPF ou CNPJ válido quando preenchido; telefone precisa
 * de DDD + número (10 ou 11 dígitos); e-mail aceita formato simples.
 *
 * @param raw campos do formulário
 * @returns fornecedor normalizado ou mensagens por campo
 */
export function validateSupplier(raw: Record<string, unknown>): ValidationResult<SupplierInput> {
  const errors: Record<string, string> = {};

  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const document = onlyDigits(typeof raw.document === "string" ? raw.document : "");
  const phone = onlyDigits(typeof raw.phone === "string" ? raw.phone : "");
  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  const notes = typeof raw.notes === "string" ? raw.notes : "";

  if (name.length < 2 || name.length > 120) {
    errors.name = "Informe o nome do fornecedor (2 a 120 caracteres).";
  }

  if (document && document.length !== 11 && document.length !== 14) {
    errors.document = "Documento deve ter 11 dígitos (CPF) ou 14 (CNPJ).";
  } else if (document.length === 11 && !isValidCpf(document)) {
    errors.document = "CPF inválido — confira os dígitos.";
  } else if (document.length === 14 && !isValidCnpj(document)) {
    errors.document = "CNPJ inválido — confira os dígitos.";
  }

  if (phone && phone.length !== 10 && phone.length !== 11) {
    errors.phone = "Telefone deve ter DDD + número (10 ou 11 dígitos).";
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Informe um e-mail válido.";
  }

  if (notes.length > 500) {
    errors.notes = "Observação deve ter até 500 caracteres.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data: { name, document, phone, email, notes } };
}
