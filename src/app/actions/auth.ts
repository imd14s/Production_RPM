"use server";

import { redirect } from "next/navigation";
import { validateLoginInput } from "@/lib/auth/guards";
import { translateAuthError } from "@/lib/auth/messages";
import { createClient } from "@/services/supabase/server";

export type SignInState = {
  error: string;
};

/**
 * Autentica o usuário com e-mail e senha.
 *
 * @param previousState estado anterior do formulário (não utilizado)
 * @param formData campos `email` e `password`
 * @returns estado com mensagem de erro ou redirecionamento para a área restrita
 */
export async function signInAction(
  previousState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  void previousState;

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const validation = validateLoginInput({ email, password });

  if (!validation.valid) {
    return { error: validation.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: validation.email,
    password,
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  redirect("/home");
}

/**
 * Encerra a sessão atual e volta para a tela de login.
 *
 * @returns redirecionamento para /login
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
