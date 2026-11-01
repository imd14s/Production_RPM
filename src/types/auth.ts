/**
 * Perfis de acesso do sistema.
 * A definição do perfil é feita no painel do Supabase, na coluna `profiles.role`.
 */

export type UserRole = "administrador" | "operador";

export type UserProfile = {
  fullName: string;
  role: UserRole;
  isActive: boolean;
};

/**
 * Converte o registro bruto de `profiles` em um perfil tipado.
 * Retorna `null` quando o registro está incompleto ou fora do contrato.
 *
 * @param row linha retornada pelo Supabase (tipo desconhecido)
 * @returns perfil tipado ou null
 */
export function parseProfile(row: unknown): UserProfile | null {
  if (typeof row !== "object" || row === null) {
    return null;
  }

  const candidate = row as Record<string, unknown>;
  const fullName = typeof candidate.full_name === "string" ? candidate.full_name.trim() : "";
  const role = candidate.role;
  const isActive = candidate.is_active;

  if (fullName.length < 2) {
    return null;
  }

  if (role !== "administrador" && role !== "operador") {
    return null;
  }

  if (typeof isActive !== "boolean") {
    return null;
  }

  return { fullName, role, isActive };
}

const ROLE_LABELS: Record<UserRole, string> = {
  administrador: "Administrador",
  operador: "Operador",
};

/**
 * Devolve o rótulo do perfil para exibição na interface.
 *
 * @param role perfil do usuário
 * @returns rótulo em português
 */
export function describeRole(role: UserRole): string {
  return ROLE_LABELS[role];
}
