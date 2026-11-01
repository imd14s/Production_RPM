import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/AppHeader/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar/Sidebar";
import type { UserRole } from "@/types/auth";
import styles from "./AppShell.module.css";

type AppShellProps = {
  role: UserRole;
  userName: string;
  roleLabel: string;
  children: ReactNode;
};

/**
 * Estrutura visual da área restrita: menu lateral, cabeçalho e conteúdo.
 *
 * @param role perfil do usuário, usado para filtrar o menu
 * @param userName nome completo exibido no cabeçalho
 * @param roleLabel rótulo do perfil exibido no cabeçalho
 * @param children conteúdo da página
 * @returns layout completo
 */
export function AppShell({ role, userName, roleLabel, children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <Sidebar role={role} />

      <div className={styles.main}>
        <AppHeader userName={userName} roleLabel={roleLabel} />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
