import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";

/**
 * Cria o cliente Supabase para uso no navegador.
 * Usa apenas a chave publicável; toda autorização depende de RLS.
 *
 * @returns cliente Supabase
 */
export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}
