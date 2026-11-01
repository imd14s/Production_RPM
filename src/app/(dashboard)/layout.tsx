import { redirect } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
import { getSessionContext } from "@/lib/auth/session";
import { describeRole } from "@/types/auth";
import styles from "./layout.module.css";

// Toda rota da área restrita depende da sessão: não há shell estático.
export const instant = false;

/**
 * Layout da área restrita.
 * Valida a sessão e o perfil no servidor antes de renderizar qualquer conteúdo.
 *
 * @param children conteúdo da rota autenticada
 * @returns cabeçalho com identificação do usuário e o conteúdo da página
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
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.identity}>
          <span className={styles.brandMark}>A</span>
          <div>
            <p className={styles.brandName}>Ateliê Filhos de Aruanda</p>
            <p className={styles.brandHint}>Gestão e precificação</p>
          </div>
        </div>

        <div className={styles.user}>
          <div className={styles.userInfo}>
            <p className={styles.userName}>{session.profile.fullName}</p>
            <p className={styles.userRole}>{describeRole(session.profile.role)}</p>
          </div>

          <form action={signOutAction}>
            <button className={styles.signOut} type="submit">
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className={styles.content}>{children}</main>
    </div>
  );
}
