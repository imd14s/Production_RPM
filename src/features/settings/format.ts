/**
 * Formatação de documentos e contatos para exibição em formulários.
 * O banco guarda apenas dígitos; a máscara é aplicada na interface.
 */

/**
 * Aplica a máscara de CNPJ.
 *
 * @param digits até 14 dígitos
 * @returns texto como "11.222.333/0001-81"
 */
export function formatCnpj(digits: string): string {
  const value = digits.replace(/\D/g, "").slice(0, 14);

  return value
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

/**
 * Aplica a máscara de CEP.
 *
 * @param digits até 8 dígitos
 * @returns texto como "01001-000"
 */
export function formatZipCode(digits: string): string {
  const value = digits.replace(/\D/g, "").slice(0, 8);

  return value.replace(/^(\d{5})(\d)/, "$1-$2");
}

/**
 * Aplica a máscara de telefone com DDD.
 *
 * @param digits até 11 dígitos
 * @returns texto como "(11) 98888-7777"
 */
export function formatPhone(digits: string): string {
  const value = digits.replace(/\D/g, "").slice(0, 11);

  if (value.length <= 10) {
    return value.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }

  return value.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}
