import { redirect } from "next/navigation";

/**
 * Redireciona a raiz para a área restrita.
 * O proxy decide entre a tela de login e o dashboard conforme a sessão.
 *
 * @returns redirecionamento para /home
 */
export default function RootPage() {
  redirect("/home");
}
