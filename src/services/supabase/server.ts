import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";

/**
 * Cria o cliente Supabase para uso no servidor (Server Components e Server Actions).
 * A sessão é lida e gravada nos cookies da requisição.
 *
 * @returns cliente Supabase autenticado pelo cookie de sessão
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components não podem escrever cookies; o proxy renova a sessão.
        }
      },
    },
  });
}
