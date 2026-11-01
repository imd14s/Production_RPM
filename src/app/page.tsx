import Image from "next/image";
import styles from "./page.module.css";

/**
 * Página inicial da aplicação.
 * Exibe a tela de boas-vindas do framework já com a identidade do projeto,
 * servindo como confirmação de que a fundação está funcionando.
 *
 * @returns tela de boas-vindas
 */
export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <span className={styles.badge}>Etapa 1 — Fundação</span>

        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js"
          width={100}
          height={20}
          priority
        />

        <div className={styles.intro}>
          <h1>Ateliê Filhos de Aruanda</h1>
          <p>
            Sistema interno de gestão, custos e precificação. A base está pronta
            com Next.js, TypeScript e CSS Modules — edite{" "}
            <code className={styles.code}>src/app/page.tsx</code> para começar.
          </p>
        </div>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentação
          </a>
          <a
            className={styles.secondary}
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Aprender Next.js
          </a>
        </div>
      </main>
    </div>
  );
}
