import type { ReactNode } from "react";
import styles from "./Badge.module.css";

type BadgeTone = "neutral" | "success" | "warning" | "info";

type BadgeProps = {
  tone?: BadgeTone;
  children: ReactNode;
};

/**
 * Etiqueta curta para estado, perfil ou aviso.
 *
 * @param tone cor semântica da etiqueta
 * @param children texto exibido
 * @returns etiqueta estilizada
 */
export function Badge({ tone = "neutral", children }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}
