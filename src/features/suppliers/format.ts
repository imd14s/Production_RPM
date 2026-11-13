import { formatCnpj, formatPhone } from "@/features/settings/format";
import { onlyDigits } from "@/lib/validations/settings";

/**
 * Aplica a máscara de CPF ou CNPJ conforme a quantidade de dígitos.
 * Usada no campo de documento de fornecedores, que aceita os dois.
 *
 * @param value dígitos com ou sem pontuação
 * @returns texto mascarado como CPF (11 dígitos) ou CNPJ (14)
 */
export function formatCpfOrCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);

  return digits.length <= 11
    ? digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2")
    : formatCnpj(digits);
}

export { formatPhone };

/**
 * Aplica a máscara de telefone e permite ser passada direto para `TextField`.
 * Reexportada do módulo de settings para o formulário de fornecedores.
 */
