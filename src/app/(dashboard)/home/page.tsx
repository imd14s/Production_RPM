import type { Metadata } from "next";
import { getSessionContext } from "@/lib/auth/session";
import { describeRole } from "@/types/auth";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: "Início — Ateliê Filhos de Aruanda",
};

/**
 * Página inicial da área restrita.
 * Mostra apenas dados reais da sessão, sem indicadores inventados.
 *
 * @returns saudação e dados do perfil autenticado
 */
export default async function HomePage() {
  const session = await getSessionContext();
  const profile = session?.profile ?? null;
  const firstName = profile?.fullName.split(" ")[0] ?? "";

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Área restrita</p>
        <h1 className={styles.title}>Olá, {firstName}.</h1>
        <p className={styles.description}>
          Você está autenticado no sistema de gestão e precificação. Os módulos de
          insumos, produtos, produção e precificação serão liberados conforme as
          próximas etapas forem concluídas.
        </p>

        <dl className={styles.details}>
          <div className={styles.detail}>
            <dt>Perfil</dt>
            <dd>{profile ? describeRole(profile.role) : "—"}</dd>
          </div>
          <div className={styles.detail}>
            <dt>E-mail</dt>
            <dd>{session?.email || "—"}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
