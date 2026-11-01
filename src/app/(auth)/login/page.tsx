import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Entrar — Ateliê Filhos de Aruanda",
};

// A tela depende da query string (motivo) e da sessão: não há shell estático.
export const instant = false;

type LoginPageProps = {
  searchParams: Promise<{ motivo?: string }>;
};

/**
 * Tela de login. Única rota acessível sem sessão.
 *
 * @param searchParams motivo opcional do redirecionamento (ex.: conta inativa)
 * @returns página de autenticação
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { motivo } = await searchParams;
  const notice =
    motivo === "inativo"
      ? "Sua conta está inativa. Fale com o administrador do sistema."
      : null;

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <header className={styles.header}>
          <span className={styles.brandMark}>A</span>
          <div>
            <h1 className={styles.title}>Ateliê Filhos de Aruanda</h1>
            <p className={styles.subtitle}>Gestão e precificação</p>
          </div>
        </header>

        {notice ? (
          <p className={styles.notice} role="alert">
            {notice}
          </p>
        ) : null}

        <LoginForm />

        <p className={styles.footer}>
          Acesso restrito. Solicite suas credenciais ao administrador.
        </p>
      </section>
    </main>
  );
}
