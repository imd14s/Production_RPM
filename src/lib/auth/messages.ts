/**
 * Tradução das mensagens de erro do Supabase Auth.
 * Evita expor termos técnicos e nunca revela se um e-mail existe.
 */

const KNOWN_MESSAGES: Record<string, string> = {
  "invalid login credentials": "E-mail ou senha inválidos.",
  "email not confirmed": "Confirme seu e-mail antes de entrar.",
  "too many requests": "Muitas tentativas. Aguarde alguns minutos.",
  "user not found": "E-mail ou senha inválidos.",
  "invalid email or password": "E-mail ou senha inválidos.",
};

const DEFAULT_MESSAGE = "Não foi possível entrar. Tente novamente.";

/**
 * Converte a mensagem crua do Supabase em texto para a tela.
 *
 * @param rawMessage mensagem devolvida pelo Supabase Auth
 * @returns mensagem segura em português
 */
export function translateAuthError(rawMessage: string): string {
  const normalized = rawMessage.trim().toLowerCase();

  return KNOWN_MESSAGES[normalized] ?? DEFAULT_MESSAGE;
}
