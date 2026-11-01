/**
 * Regras puras de acesso e validação de login.
 * Não dependem de React, Supabase ou Next — por isso são testáveis isoladamente.
 */

export const LOGIN_ROUTE = "/login";
export const HOME_ROUTE = "/home";
export const SIGNOUT_ROUTE = "/auth/signout";

const OPEN_ROUTES = [LOGIN_ROUTE, SIGNOUT_ROUTE];

/**
 * Informa se a rota pode ser acessada sem sessão.
 *
 * @param pathname caminho da requisição (ex.: "/login")
 * @returns true quando a rota é aberta
 */
export function isPublicRoute(pathname: string): boolean {
  return OPEN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/**
 * Decide para onde redirecionar uma requisição.
 *
 * @param input hasSession indica se há sessão válida; pathname é o caminho pedido
 * @returns caminho de destino ou null quando não há redirecionamento
 */
export function resolveRedirect(input: {
  hasSession: boolean;
  pathname: string;
}): string | null {
  if (!input.hasSession && !isPublicRoute(input.pathname)) {
    return LOGIN_ROUTE;
  }

  if (
    input.hasSession &&
    (input.pathname === LOGIN_ROUTE || input.pathname.startsWith(`${LOGIN_ROUTE}/`))
  ) {
    return HOME_ROUTE;
  }

  return null;
}

export type LoginValidation =
  | { valid: true; email: string }
  | { valid: false; message: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MINIMUM_PASSWORD_LENGTH = 6;

/**
 * Valida e normaliza as credenciais informadas na tela de login.
 *
 * @param input email e senha digitados
 * @returns e-mail normalizado quando válido, ou mensagem de erro
 */
export function validateLoginInput(input: {
  email: string;
  password: string;
}): LoginValidation {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!EMAIL_PATTERN.test(email)) {
    return { valid: false, message: "Informe um e-mail válido." };
  }

  if (password.length < MINIMUM_PASSWORD_LENGTH) {
    return { valid: false, message: "A senha deve ter ao menos 6 caracteres." };
  }

  return { valid: true, email };
}
