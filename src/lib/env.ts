/**
 * Acesso às variáveis de ambiente do Supabase.
 * Centraliza a leitura para que a ausência de configuração falhe com mensagem clara.
 */

/**
 * Lê a URL pública do projeto Supabase.
 *
 * @returns URL configurada em NEXT_PUBLIC_SUPABASE_URL
 * @throws Error quando a variável não está definida
 */
export function getSupabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!value) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL não configurada. Copie .env.example para .env.local.",
    );
  }

  return value;
}

/**
 * Lê a chave publicável do projeto Supabase.
 *
 * @returns chave configurada em NEXT_PUBLIC_SUPABASE_ANON_KEY
 * @throws Error quando a variável não está definida
 */
export function getSupabaseAnonKey(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!value) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada. Copie .env.example para .env.local.",
    );
  }

  return value;
}
