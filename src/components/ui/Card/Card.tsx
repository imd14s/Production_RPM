import type { ReactNode } from "react";
import styles from "./Card.module.css";

type CardProps = {
  title?: string;
  description?: string;
  footer?: ReactNode;
  children?: ReactNode;
};

/**
 * Bloco de conteúdo com título opcional, usado em painéis e formulários.
 *
 * @param title título do bloco
 * @param description texto de apoio
 * @param footer conteúdo fixado ao final
 * @param children conteúdo principal
 * @returns cartão estilizado
 */
export function Card({ title, description, footer, children }: CardProps) {
  return (
    <section className={styles.card}>
      {title ? (
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          {description ? <p className={styles.description}>{description}</p> : null}
        </header>
      ) : null}

      {children ? <div className={styles.body}>{children}</div> : null}

      {footer ? <footer className={styles.footer}>{footer}</footer> : null}
    </section>
  );
}
