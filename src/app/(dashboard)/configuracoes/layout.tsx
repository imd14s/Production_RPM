import { redirect } from "next/navigation";
import { SettingsTabs } from "@/features/settings/SettingsTabs";
import { getSessionContext } from "@/lib/auth/session";
import styles from "./settings.module.css";

// As telas dependem da sessão e do perfil: sem shell estático.
export const instant = false;

/**
 * Área de configurações.
 * Acesso restrito ao administrador; o operador é devolvido ao início.
 *
 * @param children conteúdo da seção ativa
 * @returns estrutura com título, abas e conteúdo
 */
export default async function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSessionContext();

  if (!session) {
    redirect("/login");
  }

  if (!session.profile || !session.profile.isActive) {
    redirect("/auth/signout");
  }

  if (session.profile.role !== "administrador") {
    redirect("/home");
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Configurações</h1>
        <p className={styles.description}>
          Parâmetros cadastrais e fiscais usados no cálculo de preços e na operação do
          ateliê.
        </p>
      </header>

      <SettingsTabs />

      {children}
    </div>
  );
}
