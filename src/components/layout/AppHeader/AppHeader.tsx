import { signOutAction } from "@/app/actions/auth";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import styles from "./AppHeader.module.css";

type AppHeaderProps = {
  userName: string;
  roleLabel: string;
};

/**
 * Cabeçalho da área restrita com identificação do usuário e saída do sistema.
 *
 * @param userName nome completo do usuário autenticado
 * @param roleLabel rótulo do perfil (Administrador ou Operador)
 * @returns cabeçalho estilizado
 */
export function AppHeader({ userName, roleLabel }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.userInfo}>
        <span className={styles.userName}>{userName}</span>
        <Badge tone="success">{roleLabel}</Badge>
      </div>

      <form action={signOutAction}>
        <Button type="submit" variant="secondary" size="sm">
          Sair
        </Button>
      </form>
    </header>
  );
}
