import { NextResponse, type NextRequest } from "next/server";
import { resolveRedirect } from "@/lib/auth/guards";
import { updateSession } from "@/services/supabase/proxy";

/**
 * Intercepta as requisições para renovar a sessão e bloquear rotas privadas.
 *
 * @param request requisição recebida
 * @returns resposta original ou redirecionamento
 */
export async function proxy(request: NextRequest) {
  const { response, userId } = await updateSession(request);

  const redirectTo = resolveRedirect({
    hasSession: userId !== null,
    pathname: request.nextUrl.pathname,
  });

  if (!redirectTo) {
    return response;
  }

  const redirectResponse = NextResponse.redirect(new URL(redirectTo, request.url));

  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
