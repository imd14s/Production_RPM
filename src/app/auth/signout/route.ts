import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/services/supabase/server";

/**
 * Encerra a sessão e devolve o usuário para a tela de login.
 * Usado quando o perfil está inativo, situação em que um Server Component não
 * pode limpar cookies.
 *
 * @param request requisição atual
 * @returns redirecionamento para o login
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const destination = new URL("/login?motivo=inativo", request.nextUrl.origin);

  return NextResponse.redirect(destination);
}
