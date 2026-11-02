import { cache } from "react";
import { connection } from "next/server";
import { createClient } from "@/services/supabase/server";
import { parseProfile, type UserProfile } from "@/types/auth";

export type SessionContext = {
  userId: string;
  email: string;
  profile: UserProfile | null;
};

/**
 * Lê o usuário autenticado e o seu perfil no banco.
 * O resultado é cacheado por requisição, evitando consultas repetidas no layout
 * e na página.
 *
 * `connection()` interrompe qualquer pré-render antes da leitura: o cliente
 * Supabase usa `Date.now()` internamente para validar o token, e relógio não é
 * permitido dentro de pré-render. Em Server Actions a chamada resolve na hora.
 *
 * @returns contexto da sessão, ou null quando não há usuário autenticado
 */
export const getSessionContext = cache(async (): Promise<SessionContext | null> => {
  await connection();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("full_name, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? "",
    profile: parseProfile(data),
  };
});
