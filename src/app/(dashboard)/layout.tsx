import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell/AppShell";
import { getSessionContext } from "@/lib/auth/session";
import { describeRole } from "@/types/auth";

// Toda rota da área restrita depende da sessão: não há shell estático.
export const instant = false;

/**
 * Layout da área restrita.
 * Valida a sessão e o perfil no servidor antes de renderizar qualquer conteúdo.
 *
 * @param children conteúdo da rota autenticada
 * @returns estrutura com menu lateral, cabeçalho e o conteúdo da página
 */
export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSessionContext();

  if (!session) {
    redirect("/login");
  }

  // Sem perfil (migration não aplicada) ou conta inativa: encerra a sessão.
  if (!session.profile || !session.profile.isActive) {
    redirect("/auth/signout");
  }

  return (
    <AppShell
      role={session.profile.role}
      userName={session.profile.fullName}
      roleLabel={describeRole(session.profile.role)}
    >
      {children}
    </AppShell>
  );
}
